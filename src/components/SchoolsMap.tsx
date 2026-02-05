"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Map, MapControls, MapClusterLayer, MapPopup } from "@/components/ui/map";
import { SchoolCard } from "@/components/SchoolCard";
import { SchoolPopupCard } from "@/components/SchoolPopupCard";
import { ProvinceFilter } from "@/components/ProvinceFilter";
import { getSchoolsGeoJSON, School, Province, ALL_PROVINCES } from "@/data/schools";
import { useSchoolsData } from "@/hooks/use-schools-data";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School as SchoolIcon, Users, GraduationCap, Search, X, Loader2, MapPin, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

type ProvinceOption = Province | 'all';

// South Africa center coordinates
const SA_CENTER: [number, number] = [24.6, -28.5];

// Calculate distance between two coordinates in km (Haversine formula)
function getDistanceKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function SchoolsMap() {
  const { schools: schoolsData, loading: dataLoading, totalCount } = useSchoolsData();
  const { coordinates: userLocation, source: locationSource, loading: locationLoading } = useGeolocation();
  
  const [selectedProvince, setSelectedProvince] = useState<ProvinceOption>('all');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [popupCoords, setPopupCoords] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(SA_CENTER);
  const [mapZoom, setMapZoom] = useState(5.5);
  const [sortByDistance, setSortByDistance] = useState(false);

  // Update map center when user location is available
  useEffect(() => {
    if (!locationLoading && locationSource !== 'default') {
      setMapCenter(userLocation);
      setMapZoom(8);
      setSortByDistance(true);
    }
  }, [userLocation, locationSource, locationLoading]);

  const { filteredSchools, sortedByDistance } = useMemo(() => {
    let schools = selectedProvince === 'all' 
      ? schoolsData 
      : schoolsData.filter(s => s.province === selectedProvince);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      schools = schools.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.town.toLowerCase().includes(query) ||
        s.district.toLowerCase().includes(query)
      );
    }
    
    // Sort by distance if location is available and sorting is enabled
    let sorted = false;
    if (sortByDistance && locationSource !== 'default') {
      schools = [...schools].sort((a, b) => {
        const distA = getDistanceKm(userLocation[0], userLocation[1], a.longitude, a.latitude);
        const distB = getDistanceKm(userLocation[0], userLocation[1], b.longitude, b.latitude);
        return distA - distB;
      });
      sorted = true;
    }
    
    return { filteredSchools: schools, sortedByDistance: sorted };
  }, [selectedProvince, searchQuery, schoolsData, sortByDistance, userLocation, locationSource]);

  const geoJSON = useMemo(() => getSchoolsGeoJSON(filteredSchools), [filteredSchools]);

  const provinceCounts = useMemo(() => {
    const counts: Record<ProvinceOption, number> = {
      all: schoolsData.length,
      'Gauteng': 0,
      'Western Cape': 0,
      'Eastern Cape': 0,
      'KwaZulu-Natal': 0,
      'Limpopo': 0,
      'Mpumalanga': 0,
      'North West': 0,
      'Northern Cape': 0,
      'Free State': 0,
      'Special Needs': 0,
    };
    
    schoolsData.forEach(school => {
      counts[school.province]++;
    });
    
    return counts;
  }, [schoolsData]);

  const stats = useMemo(() => ({
    totalSchools: filteredSchools.length,
    totalLearners: filteredSchools.reduce((sum, s) => sum + s.learners, 0),
    totalEducators: filteredSchools.reduce((sum, s) => sum + s.educators, 0),
  }), [filteredSchools]);

  const handlePointClick = useCallback((
    feature: GeoJSON.Feature<GeoJSON.Point, School>,
    coordinates: [number, number]
  ) => {
    const school = schoolsData.find(s => s.id === feature.properties.id);
    if (school) {
      setSelectedSchool(school);
      setPopupCoords(coordinates);
    }
  }, [schoolsData]);

  const handleClosePopup = () => {
    setSelectedSchool(null);
    setPopupCoords(null);
  };

  // Loading state
  if (dataLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
          <div className="p-4 rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Loading Schools Data</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Parsing ~25,000 schools from all 9 provinces...
            </p>
            <Progress value={undefined} className="w-64 h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            {totalCount > 0 && `${totalCount.toLocaleString()} schools loaded so far`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-4 py-3 shrink-0">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <SchoolIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">SA Schools Map</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Interactive explorer for {totalCount.toLocaleString()} schools
              </p>
            </div>
          </div>
          
          <div className="flex-1 lg:max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools, towns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ProvinceFilter
              selected={selectedProvince}
              onSelect={setSelectedProvince}
              counts={provinceCounts}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Stats Sidebar */}
        <aside className="w-72 bg-card border-r p-3 hidden lg:flex flex-col gap-3 shrink-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-2">
            <Card className="bg-secondary/50 border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <SchoolIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalSchools.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Schools</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalLearners.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Learners</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-province-western-cape/10">
                  <GraduationCap className="h-4 w-4 text-province-western-cape" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalEducators.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Educators</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schools List */}
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-2 shrink-0 px-3 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Schools List</CardTitle>
                {sortedByDistance && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    Nearest first
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-2">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2 pb-4">
                  {filteredSchools.slice(0, 100).map((school) => (
                    <button
                      key={school.id}
                      onClick={() => {
                        setSelectedSchool(school);
                        setPopupCoords([school.longitude, school.latitude]);
                      }}
                      className="w-full text-left p-2.5 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                    >
                      <SchoolCard 
                        school={school} 
                        compact 
                        distance={sortedByDistance ? getDistanceKm(userLocation[0], userLocation[1], school.longitude, school.latitude) : undefined}
                      />
                    </button>
                  ))}
                  {filteredSchools.length > 100 && (
                    <p className="text-center text-xs text-muted-foreground py-2">
                      + {(filteredSchools.length - 100).toLocaleString()} more schools
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        {/* Map */}
        <div className="flex-1 relative">
          <Map
            center={mapCenter}
            zoom={mapZoom}
            className="h-full"
          >
            <MapClusterLayer<School>
              data={geoJSON}
              clusterRadius={60}
              clusterMaxZoom={12}
              clusterColors={["hsl(200, 70%, 55%)", "hsl(45, 90%, 55%)", "hsl(345, 70%, 60%)"]}
              clusterThresholds={[10, 30]}
              pointColor="hsl(25, 85%, 45%)"
              onPointClick={handlePointClick}
            />
            
            {selectedSchool && popupCoords && (
              <MapPopup
                longitude={popupCoords[0]}
                latitude={popupCoords[1]}
                onClose={handleClosePopup}
                closeButton
                className="max-w-sm"
                maxWidth="none"
              >
                <SchoolPopupCard school={selectedSchool} />
              </MapPopup>
            )}
            
            <MapControls
              position="bottom-right"
              showZoom
              showCompass
              showFullscreen
              showLocate
            />
          </Map>

          {/* User Location Indicator */}
          {sortByDistance && locationSource !== 'default' && (
            <div className="absolute top-3 right-3 z-10">
              <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
                <CardContent className="p-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {locationSource === 'browser' ? 'GPS Location' : 'Approximate Location'}
                  </span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mobile Stats Overlay */}
          <div className="absolute top-3 left-3 right-16 lg:hidden">
            <Card className="bg-card/95 backdrop-blur-sm shadow-lg">
              <CardContent className="p-3 flex justify-around">
                <div className="text-center">
                  <p className="text-lg font-bold">{stats.totalSchools.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Schools</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{(stats.totalLearners / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Learners</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{(stats.totalEducators / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Educators</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
