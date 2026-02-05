export interface School {
  id: string;
  name: string;
  province: 'Gauteng' | 'Western Cape' | 'Eastern Cape' | 'KwaZulu-Natal' | 'Limpopo' | 'Mpumalanga' | 'North West' | 'Northern Cape' | 'Free State' | 'Special Needs';
  longitude: number;
  latitude: number;
  sector: 'PUBLIC' | 'INDEPENDENT';
  phase: string;
  learners: number;
  educators: number;
  district: string;
  town: string;
  quintile: string;
  noFeeSchool: boolean;
  // Extended fields from JSON
  status?: string;
  schoolType?: string;
  specialisation?: string;
  fullServiceSchool?: boolean;
  circuit?: number;
  urbanRural?: string;
  municipality?: string;
  localMunicipality?: string;
  wardId?: string;
  addressee?: string;
  township?: string;
  suburb?: string;
  streetAddress?: string;
  postalAddress?: string;
  telephone?: string;
  exDept?: string;
  section21?: boolean;
  // Additional complete fields
  dataYear?: number;
  ownerLand?: string;
  ownerBuildings?: string;
  examNo?: string;
  examCentre?: string;
  spCode?: string;
  spName?: string;
  nas?: string;
  nodalArea?: string;
  registrationDate?: string;
  allocation?: number;
}

export type Province = School['province'];

export const ALL_PROVINCES: Province[] = [
  'Gauteng',
  'Western Cape', 
  'Eastern Cape',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Free State',
  'Special Needs'
];

// Legacy empty array for backwards compatibility - use useSchoolsData hook instead
export const schoolsData: School[] = [];

export function getSchoolsByProvince(schools: School[], province: Province): School[] {
  return schools.filter(s => s.province === province);
}

export function getSchoolsGeoJSON(schools: School[]): GeoJSON.FeatureCollection<GeoJSON.Point, School> {
  return {
    type: 'FeatureCollection',
    features: schools
      .filter(s => s.longitude && s.latitude)
      .map(school => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [school.longitude, school.latitude]
        },
        properties: school
      }))
  };
}
