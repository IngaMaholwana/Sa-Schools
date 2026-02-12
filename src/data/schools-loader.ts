import { parseSchoolsJSON, deduplicateSchools } from '@/lib/school-parser';
import type { School } from './schools';

// Track parsing stats for debugging
interface ParsingStats {
  loaded: number;
  parsed: number;
  filtered: number;
  byProvince: Record<string, { raw: number; parsed: number }>;
}

export interface SchoolsDataState {
  schools: School[];
  loading: boolean;
  error: string | null;
  progress: {
    loaded: number;
    total: number;
    currentProvince: string | null;
  };
}

type Province = School['province'];

interface ProvinceConfig {
  file: string;
  province: Province;
}

const PROVINCE_FILES: ProvinceConfig[] = [
  { file: 'Eastern_Cape.json', province: 'Eastern Cape' },
  { file: 'Western_Cape.json', province: 'Western Cape' },
  { file: 'Gauteng.json', province: 'Gauteng' },
  { file: 'KwaZulu_Natal.json', province: 'KwaZulu-Natal' },
  { file: 'Limpopo.json', province: 'Limpopo' },
  { file: 'Mpumalanga.json', province: 'Mpumalanga' },
  { file: 'Northern_Cape.json', province: 'Northern Cape' },
  { file: 'North_West.json', province: 'North West' },
  { file: 'Free_State.json', province: 'Free State' },
  { file: 'Special_Needs.json', province: 'Special Needs' },
];

async function loadProvinceData(config: ProvinceConfig): Promise<{ schools: School[]; rawCount: number }> {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}data/${config.file}`);
    if (!response.ok) {
      console.warn(`Failed to load ${config.file}: ${response.status}`);
      return { schools: [], rawCount: 0 };
    }
    
    const rawData = await response.json();
    
    if (!Array.isArray(rawData)) {
      console.warn(`Invalid data format for ${config.file}`);
      return { schools: [], rawCount: 0 };
    }
    
    const schools = parseSchoolsJSON(rawData, config.province);
    const rawCount = rawData.length;
    
    const filtered = rawCount - schools.length;
    if (filtered > 0) {
      console.log(`${config.province}: ${rawCount} raw → ${schools.length} parsed (${filtered} filtered out)`);
    }
    
    return { schools, rawCount };
  } catch (error) {
    console.warn(`Error loading ${config.file}:`, error);
    return { schools: [], rawCount: 0 };
  }
}

export async function loadAllSchoolsData(
  onProgress?: (state: SchoolsDataState) => void
): Promise<School[]> {
  const allSchools: School[] = [];
  const total = PROVINCE_FILES.length;
  let totalRaw = 0;
  
  for (let i = 0; i < PROVINCE_FILES.length; i++) {
    const config = PROVINCE_FILES[i];
    
    onProgress?.({
      schools: allSchools,
      loading: true,
      error: null,
      progress: {
        loaded: i,
        total,
        currentProvince: config.province,
      },
    });
    
    const { schools, rawCount } = await loadProvinceData(config);
    allSchools.push(...schools);
    totalRaw += rawCount;
    
    console.log(`Loaded ${schools.length} schools from ${config.province}`);
  }
  
  const uniqueSchools = deduplicateSchools(allSchools);
  const duplicates = allSchools.length - uniqueSchools.length;
  
  console.log(`=== SCHOOLS DATA SUMMARY ===`);
  console.log(`Raw records in JSON: ${totalRaw}`);
  console.log(`Successfully parsed: ${allSchools.length}`);
  console.log(`Duplicates removed: ${duplicates}`);
  console.log(`Final count: ${uniqueSchools.length}`);
  
  onProgress?.({
    schools: uniqueSchools,
    loading: false,
    error: null,
    progress: {
      loaded: total,
      total,
      currentProvince: null,
    },
  });
  
  return uniqueSchools;
}

export async function loadSchoolsDataParallel(): Promise<School[]> {
  const results = await Promise.all(
    PROVINCE_FILES.map(config => loadProvinceData(config))
  );
  
  let totalRaw = 0;
  const allSchools: School[] = [];
  
  for (const { schools, rawCount } of results) {
    allSchools.push(...schools);
    totalRaw += rawCount;
  }
  
  const uniqueSchools = deduplicateSchools(allSchools);
  const duplicates = allSchools.length - uniqueSchools.length;
  
  console.log(`=== SCHOOLS DATA SUMMARY ===`);
  console.log(`Raw records in JSON: ${totalRaw}`);
  console.log(`Successfully parsed: ${allSchools.length}`);
  console.log(`Duplicates removed: ${duplicates}`);
  console.log(`Final count: ${uniqueSchools.length}`);
  
  return uniqueSchools;
}
