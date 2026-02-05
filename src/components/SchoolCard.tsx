import { School } from "@/data/schools";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, MapPin, Building2, Navigation } from "lucide-react";

interface SchoolCardProps {
  school: School;
  compact?: boolean;
  distance?: number; // Distance in km from user location
}

export function SchoolCard({ school, compact = false, distance }: SchoolCardProps) {
  const phaseColor = {
    "PRIMARY SCHOOL": "bg-accent text-accent-foreground",
    "SECONDARY SCHOOL": "bg-primary text-primary-foreground",
    "COMBINED SCHOOL": "bg-secondary text-secondary-foreground",
  }[school.phase];

  const provinceColor = {
    "Gauteng": "border-province-gauteng text-province-gauteng",
    "Western Cape": "border-province-western-cape text-province-western-cape",
    "Eastern Cape": "border-province-eastern-cape text-province-eastern-cape",
  }[school.province];

  // Format distance for display
  const formatDistance = (km: number) => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    if (km < 10) return `${km.toFixed(1)}km`;
    return `${Math.round(km)}km`;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-tight">{school.name}</h4>
          {distance !== undefined && (
            <span className="text-xs text-primary flex items-center gap-0.5 shrink-0">
              <Navigation className="h-3 w-3" />
              {formatDistance(distance)}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-xs ${provinceColor}`}>
            {school.province}
          </Badge>
          <Badge className={`text-xs ${phaseColor}`}>
            {school.phase.replace(" SCHOOL", "")}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {school.learners.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {school.educators}
          </span>
        </div>
        {school.noFeeSchool && (
          <Badge variant="secondary" className="text-xs bg-accent/20 text-accent">
            No-Fee School
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="border-l-4 shadow-md" style={{ borderLeftColor: `hsl(var(--${school.province === 'Gauteng' ? 'gauteng' : school.province === 'Western Cape' ? 'western-cape' : 'eastern-cape'}))` }}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{school.name}</CardTitle>
          <Badge className={phaseColor}>
            {school.phase.replace(" SCHOOL", "")}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{school.town}, {school.district}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary">
              <Users className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">{school.learners.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Learners</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary">
              <GraduationCap className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">{school.educators}</p>
              <p className="text-xs text-muted-foreground">Educators</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={provinceColor}>
            {school.province}
          </Badge>
          <Badge variant="outline">
            <Building2 className="h-3 w-3 mr-1" />
            {school.sector === "PUBLIC" ? "Public" : "Independent"}
          </Badge>
          {school.quintile !== "N/A" && (
            <Badge variant="outline">{school.quintile}</Badge>
          )}
          {school.noFeeSchool && (
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              No-Fee School
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
