import type { School } from '@/data/schools';

type Province = School['province'];

// Field name variations across different province JSON files
const FIELD_MAPPINGS = {
  id: ['NatEmis', 'NatEMIS', 'NATEMIS'],
  name: ['Official_Institution_Name', 'Institution_Name', 'Name', 'SchoolName'],
  longitude: ['GIS_Longitude', 'Longitude', 'Long', 'lon', 'X'],
  latitude: ['GIS_Latitude', 'Latitude', 'Lat', 'lat', 'Y'],
  sector: ['Sector', 'SECTOR'],
  phase: ['Phase_PED', 'Phase', 'PHASE'],
  learners: ['Learners2024', 'Learners', 'TotalLearners', 'learners'],
  educators: ['Educators2024', 'Educators', 'TotalEducators', 'educators'],
  district: ['EIDistrict', 'District', 'DISTRICT'],
  town: ['Town_City', 'towncity', 'Town', 'City', 'TOWN'],
  quintile: ['Quintile', 'QUINTILE', 'quintile'],
  noFeeSchool: ['NoFeeSchool', 'NoFee', 'NO_FEE'],
  suburb: ['Suburb', 'SUBURB'],
  status: ['Status', 'STATUS'],
  // Extended field mappings
  schoolType: ['Type_DoE', 'TypeDoE', 'SchoolType', 'Type'],
  specialisation: ['Specialisation', 'Specialization', 'SPECIALISATION'],
  fullServiceSchool: ['Full Service School', 'FullServiceSchool', 'Full_Service_School'],
  circuit: ['EICircuit', 'Circuit', 'CIRCUIT'],
  urbanRural: ['Urban_Rural', 'UrbanRural', 'URBAN_RURAL'],
  municipality: ['DMunName', 'Municipality', 'MUNICIPALITY'],
  localMunicipality: ['LMunName', 'LocalMunicipality', 'LOCAL_MUNICIPALITY'],
  wardId: ['Ward_ID', 'WardID', 'Ward'],
  addressee: ['Addressee', 'ADDRESSEE', 'Contact', 'ContactPerson'],
  township: ['Township_Village', 'Township', 'Village'],
  streetAddress: ['StreetAddress', 'Street_Address', 'Address'],
  postalAddress: ['PostalAddress', 'Postal_Address', 'PostalAddr'],
  telephone: ['Telephone', 'Phone', 'Tel', 'TELEPHONE'],
  exDept: ['ExDept', 'Ex_Dept', 'Department'],
  section21: ['Section21', 'SECTION21'],
  // Additional fields from complete JSON
  dataYear: ['Datayear', 'Data Year', 'DataYear'],
  ownerLand: ['Owner_Land', 'OwnerLand', 'OWNER_LAND'],
  ownerBuildings: ['Owner_Buildings', 'OwnerBuildings', 'OWNER_BUILDINGS'],
  examNo: ['ExamNo', 'Exam_No', 'EXAMNO'],
  examCentre: ['ExamCentre', 'Exam_Centre', 'EXAMCENTRE'],
  spCode: ['SP_Code', 'SPCode', 'SP_CODE'],
  spName: ['SP_Name', 'SPName', 'SP_NAME'],
  nas: ['NAS', 'Nas'],
  nodalArea: ['NodalArea', 'Nodal_Area', 'NODAL_AREA'],
  registrationDate: ['Registration_Date', 'RegistrationDate', 'REGISTRATION_DATE'],
  allocation: ['Allocation', 'ALLOCATION'],
} as const;

// Province code to name mapping
const PROVINCE_MAP: Record<string, Province> = {
  'EC': 'Eastern Cape',
  'WC': 'Western Cape',
  'GT': 'Gauteng',
  'KZN': 'KwaZulu-Natal',
  'LP': 'Limpopo',
  'MP': 'Mpumalanga',
  'NW': 'North West',
  'NC': 'Northern Cape',
  'FS': 'Free State',
};
 
 /**
  * Check if school is a Special Needs school based on Type_DoE
  */
 function isSpecialNeedsSchool(record: Record<string, unknown>): boolean {
   const typeDoE = getField<string>(record, 'schoolType');
   if (typeDoE && typeof typeDoE === 'string') {
     const upper = typeDoE.toUpperCase();
     return upper.includes('SPECIAL NEEDS') || upper.includes('SPECIAL SCHOOL');
   }
   return false;
 }

/**
 * Safely get a field value by trying multiple possible field names
 */
export function getField<T = unknown>(record: Record<string, unknown>, fieldType: keyof typeof FIELD_MAPPINGS): T | null {
  const possibleNames = FIELD_MAPPINGS[fieldType];
  for (const name of possibleNames) {
    if (record[name] !== undefined && record[name] !== null && record[name] !== 99 && record[name] !== '99') {
      return record[name] as T;
    }
  }
  return null;
}

/**
 * Normalize a coordinate that may be stored in scaled format
 * Northern Cape data stores coords as degrees × 10000 or 100000
 */
 function normalizeScaledCoordinate(value: number): number {
   const absVal = Math.abs(value);
   
   // Already in degrees range
   if (absVal < 100) {
     return value;
  }
   
   // Scaled by 10000 (e.g., -287158 -> -28.7158)
   if (absVal >= 100000 && absVal < 1000000) {
     return value / 10000;
  }
   
   // Scaled by 100000 (e.g., -2907075 -> -29.07075)
   if (absVal >= 1000000 && absVal < 10000000) {
     return value / 100000;
  }
   
   // Too large to be valid
   return NaN;
 }
 
 /**
  * Parse and validate coordinates for South Africa
  * Handles various issues:
  * - Swapped lat/lon
  * - Wrong sign
  * - Scaled values (like -2907075.0 in Northern Cape = -29.07° × 100000)
  * - String vs number types
  */
 export function parseCoordinates(
   rawLon: unknown,
   rawLat: unknown
 ): { longitude: number; latitude: number } | null {
   let lon = typeof rawLon === 'string' ? parseFloat(rawLon) : Number(rawLon);
   let lat = typeof rawLat === 'string' ? parseFloat(rawLat) : Number(rawLat);
   
   // Check for invalid values
   if (isNaN(lon) || isNaN(lat) || lon === 0 || lat === 0) {
     return null;
   }
   
   // Normalize scaled coordinates (Northern Cape uses degrees × 10000/100000)
   lon = normalizeScaledCoordinate(lon);
   lat = normalizeScaledCoordinate(lat);
   
   if (isNaN(lon) || isNaN(lat)) {
     return null;
   }
   
   // Detect swapped coordinates (Northern Cape has lat in lon field and vice versa)
   // SA longitude: 16-33°E (positive), SA latitude: 22-35°S (negative)
   const lonAbs = Math.abs(lon);
   const latAbs = Math.abs(lat);
   
   // Check if they appear swapped based on expected ranges
   const lonLooksLikeLat = lonAbs >= 22 && lonAbs <= 36;
   const latLooksLikeLon = latAbs >= 16 && latAbs <= 35;
   
   // If lon is negative and in lat range, and lat is positive and in lon range -> swap
   if (lon < 0 && lonLooksLikeLat && lat > 0 && latLooksLikeLon) {
     [lon, lat] = [lat, lon];
   }
   
   // Ensure lat is negative (Southern Hemisphere)
  if (lat > 0 && lat > 20 && lat < 36) {
    lat = -lat;
  }
   
   // Ensure lon is positive (Eastern Hemisphere)
  if (lon < 0 && Math.abs(lon) > 15 && Math.abs(lon) < 35) {
    lon = Math.abs(lon);
  }
   
   // Final validation for South Africa bounds
   // Longitude: 16°E to 33°E
   // Latitude: 22°S to 35°S
  if (lon < 15 || lon > 35 || lat < -36 || lat > -20) {
    return null;
  }
   
  return { longitude: lon, latitude: lat };
}

/**
 * Parse sector value
 */
function parseSector(value: unknown): 'PUBLIC' | 'INDEPENDENT' {
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper.includes('INDEPENDENT') || upper.includes('PRIVATE')) {
      return 'INDEPENDENT';
    }
  }
  return 'PUBLIC';
}

/**
 * Parse quintile value
 */
function parseQuintile(value: unknown): string {
  if (value === null || value === undefined || value === 99 || value === '99') {
    return 'Unknown';
  }
  if (typeof value === 'number') {
    return `Q${value}`;
  }
  if (typeof value === 'string') {
    if (value.startsWith('Q')) return value;
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 5) return `Q${num}`;
  }
  return String(value);
}

/**
 * Parse no fee school value
 */
function parseNoFeeSchool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower.includes('no fee') || lower === 'yes' || lower === 'true';
  }
  return false;
}

/**
 * Parse section 21 value
 */
function parseSection21(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'yes' || lower === 'true';
  }
  return false;
}

/**
 * Parse full service school value
 */
function parseFullServiceSchool(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'yes' || lower === 'true';
  }
  return false;
}

/**
 * Clean and format address string
 */
function cleanAddress(value: unknown): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  // Remove multiple spaces and "UNKNOWN" placeholders
  return value
    .replace(/\s+/g, ' ')
    .replace(/UNKNOWN/gi, '')
    .trim() || undefined;
}

/**
 * Format telephone number
 */
function formatTelephone(value: unknown): string | undefined {
  if (!value) return undefined;
  const strValue = String(value);
  const cleaned = strValue.replace(/\D/g, '');
  if (cleaned.length < 9) return undefined;
  // Format as SA phone number
  if (cleaned.length === 10) {
    return `0${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return cleaned;
}

/**
 * Clean a string value, removing placeholder values
 */
function cleanStringValue(value: unknown): string | undefined {
  if (value === null || value === undefined || value === 99 || value === '99') return undefined;
  if (typeof value !== 'string') return String(value);
  const cleaned = value.trim();
  if (!cleaned || cleaned === 'UNKNOWN' || cleaned === 'NOT APPLICABLE' || cleaned === 'NONE' || cleaned === '.') {
    return undefined;
  }
  return cleaned;
}

/**
 * Get province name from record
 */
function getProvinceName(record: Record<string, unknown>, defaultProvince: Province): Province {
   // Check if this is a Special Needs school first
   if (defaultProvince === 'Special Needs' || isSpecialNeedsSchool(record)) {
     return 'Special Needs';
   }
   
  const provinceCode = record['Province'] as string;
  if (provinceCode && PROVINCE_MAP[provinceCode]) {
    return PROVINCE_MAP[provinceCode];
  }
  return defaultProvince;
}

/**
 * Check if school is open/active
 */
function isSchoolOpen(record: Record<string, unknown>): boolean {
  const status = getField<string>(record, 'status');
  if (!status) return true; // No status = assume open
  const upper = status.toUpperCase();
  // Only skip explicitly closed schools
  return upper !== 'CLOSED' && upper !== 'PERMANENTLY CLOSED';
}

/**
 * Parse a single school record from JSON
 */
export function parseSchoolRecord(
  record: Record<string, unknown>,
  defaultProvince: Province
): School | null {
  // Get required fields
  const id = getField<number | string>(record, 'id');
  const name = getField<string>(record, 'name');
  
  if (!id || !name) {
    // Try alternative ID fields for Special Needs data
    const altId = record['NatEMIS'] || record['NatEmis'] || record['NATEMIS'] || record['Id'] || record['ID'];
    const altName = record['Official_Institution_Name'] || record['Institution_Name'] || record['Name'] || record['SchoolName'];
    
    if (!altId && !altName) {
      return null;
    }
  }
  
  // Skip permanently closed schools (but keep others)
  if (!isSchoolOpen(record)) {
    return null;
  }
  
  // Re-get the ID and name using all possible fields
  const finalId = getField<number | string>(record, 'id') || 
                  record['NatEMIS'] || record['NatEmis'] || record['NATEMIS'] || 
                  record['Id'] || record['ID'] || 
                  `unknown-${Math.random().toString(36).slice(2, 11)}`;
  
  const finalName = getField<string>(record, 'name') || 
                    String(record['Official_Institution_Name'] || record['Institution_Name'] || record['Name'] || record['SchoolName'] || 'Unknown School');
  
  // Parse coordinates
  const rawLon = getField<number | string>(record, 'longitude');
  const rawLat = getField<number | string>(record, 'latitude');
  const coords = parseCoordinates(rawLon, rawLat);
  
  // Use default coords (0,0) if no valid coordinates - school still counts but won't show on map
  const longitude = coords?.longitude ?? 0;
  const latitude = coords?.latitude ?? 0;
  
  // Get optional fields with fallbacks
  const sector = parseSector(getField(record, 'sector'));
  const phase = getField<string>(record, 'phase') || 'UNKNOWN';
  const learners = Math.round(Number(getField(record, 'learners')) || 0);
  const educators = Math.round(Number(getField(record, 'educators')) || 0);
  const district = getField<string>(record, 'district') || 'Unknown';
  const town = getField<string>(record, 'town') || getField<string>(record, 'suburb') || 'Unknown';
  const quintile = parseQuintile(getField(record, 'quintile'));
  const noFeeSchool = parseNoFeeSchool(getField(record, 'noFeeSchool'));
  const province = getProvinceName(record, defaultProvince);
  
  // Extended fields
  const status = getField<string>(record, 'status') || 'OPEN';
  const schoolType = getField<string>(record, 'schoolType');
  const specialisation = getField<string>(record, 'specialisation');
  const fullServiceSchool = parseFullServiceSchool(getField(record, 'fullServiceSchool'));
  const circuit = getField<number>(record, 'circuit');
  const urbanRural = getField<string>(record, 'urbanRural');
  const municipality = getField<string>(record, 'municipality');
  const localMunicipality = getField<string>(record, 'localMunicipality');
  const wardId = getField<string>(record, 'wardId');
  const addressee = getField<string>(record, 'addressee');
  const township = getField<string>(record, 'township');
  const suburb = getField<string>(record, 'suburb');
  const streetAddress = cleanAddress(getField(record, 'streetAddress'));
  const postalAddress = cleanAddress(getField(record, 'postalAddress'));
  const telephone = formatTelephone(getField(record, 'telephone'));
  const exDept = getField<string>(record, 'exDept');
  const section21 = parseSection21(getField(record, 'section21'));
  
  // Additional complete fields
  const dataYear = Number(getField(record, 'dataYear')) || undefined;
  const ownerLand = cleanStringValue(getField<string>(record, 'ownerLand'));
  const ownerBuildings = cleanStringValue(getField<string>(record, 'ownerBuildings'));
  const examNo = cleanStringValue(getField<string>(record, 'examNo'));
  const examCentre = cleanStringValue(getField<string>(record, 'examCentre'));
  const spCode = cleanStringValue(getField<string>(record, 'spCode'));
  const spName = cleanStringValue(getField<string>(record, 'spName'));
  const nas = cleanStringValue(getField<string>(record, 'nas'));
  const nodalArea = cleanStringValue(getField<string>(record, 'nodalArea'));
  const registrationDate = cleanStringValue(getField<string>(record, 'registrationDate'));
  const allocation = Number(getField(record, 'allocation')) || undefined;
  
  return {
    id: String(finalId),
    name: finalName,
    province,
    longitude,
    latitude,
    sector,
    phase,
    learners,
    educators,
    district,
    town,
    quintile,
    noFeeSchool,
    // Extended fields (only include if they have meaningful values)
    ...(status && { status }),
    ...(schoolType && schoolType !== 'UNKNOWN' && { schoolType }),
    ...(specialisation && specialisation !== 'UNKNOWN' && { specialisation }),
    ...(fullServiceSchool && { fullServiceSchool }),
    ...(circuit && circuit !== 99 && { circuit }),
    ...(urbanRural && urbanRural !== 'UNKNOWN' && { urbanRural }),
    ...(municipality && { municipality }),
    ...(localMunicipality && { localMunicipality }),
    ...(wardId && { wardId }),
    ...(addressee && addressee !== 'UNKNOWN' && { addressee }),
    ...(township && { township }),
    ...(suburb && { suburb }),
    ...(streetAddress && { streetAddress }),
    ...(postalAddress && { postalAddress }),
    ...(telephone && { telephone }),
    ...(exDept && { exDept }),
    ...(section21 && { section21 }),
    // Additional complete fields
    ...(dataYear && { dataYear }),
    ...(ownerLand && { ownerLand }),
    ...(ownerBuildings && { ownerBuildings }),
    ...(examNo && { examNo }),
    ...(examCentre && { examCentre }),
    ...(spCode && { spCode }),
    ...(spName && { spName }),
    ...(nas && { nas }),
    ...(nodalArea && { nodalArea }),
    ...(registrationDate && { registrationDate }),
    ...(allocation && allocation !== 99 && { allocation }),
  };
}

/**
 * Parse an entire JSON array of school records
 */
export function parseSchoolsJSON(
  records: Record<string, unknown>[],
  defaultProvince: Province
): School[] {
  const schools: School[] = [];
  
  for (const record of records) {
    const school = parseSchoolRecord(record, defaultProvince);
    if (school) {
      schools.push(school);
    }
  }
  
  return schools;
}

/**
 * Deduplicate schools by ID
 */
export function deduplicateSchools(schools: School[]): School[] {
  const seen = new Set<string>();
  return schools.filter(school => {
    if (seen.has(school.id)) {
      return false;
    }
    seen.add(school.id);
    return true;
  });
}
