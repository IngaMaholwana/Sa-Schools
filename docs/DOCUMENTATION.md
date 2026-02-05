# South African Schools Map - Full Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Data Layer](#data-layer)
5. [Map System](#map-system)
6. [Styling & Theming](#styling--theming)
7. [Performance](#performance)
8. [API Reference](#api-reference)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The South African Schools Map is a React-based web application that visualizes educational institutions across South Africa. It provides an interactive interface for exploring, searching, and filtering schools by province, with detailed information available for each institution.

### Key Capabilities

- **Visualization**: Display 25,000+ schools on an interactive map
- **Clustering**: Automatically group nearby schools for better performance
- **Filtering**: Filter by province with real-time updates
- **Search**: Full-text search across school names, towns, and districts
- **Responsive**: Mobile-first design that works across all devices
- **Accessible**: WCAG-compliant with keyboard navigation support

---

## Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  React 18 + TypeScript + Tailwind CSS + shadcn/ui       │
├─────────────────────────────────────────────────────────┤
│                      Map Layer                           │
│  MapLibre GL JS + mapcn Components + GeoJSON            │
├─────────────────────────────────────────────────────────┤
│                     Data Layer                           │
│  Static TypeScript Data + React Query (future)          │
├─────────────────────────────────────────────────────────┤
│                    Build System                          │
│  Vite + ESBuild + PostCSS                               │
└─────────────────────────────────────────────────────────┘
```

### File Structure

```
project-root/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── map.tsx            # Map components (Map, MapMarker, etc.)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── ...
│   │   ├── SchoolCard.tsx         # School information card
│   │   ├── SchoolsMap.tsx         # Main map container
│   │   ├── ProvinceFilter.tsx     # Province filter buttons
│   │   └── NavLink.tsx
│   ├── data/
│   │   └── schools.ts             # School data & TypeScript types
│   ├── hooks/
│   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   └── use-toast.ts           # Toast notifications
│   ├── lib/
│   │   └── utils.ts               # Utility functions (cn, etc.)
│   ├── pages/
│   │   ├── Index.tsx              # Home page
│   │   └── NotFound.tsx           # 404 page
│   ├── App.tsx                    # Root component with routing
│   ├── App.css
│   ├── index.css                  # Global styles & CSS variables
│   └── main.tsx                   # Entry point
├── docs/
│   └── DOCUMENTATION.md           # This file
├── requirements.txt
├── README.md
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## Components

### SchoolsMap

The main container component that orchestrates the map, filters, and school data.

**Location**: `src/components/SchoolsMap.tsx`

**Props**: None (self-contained)

**State**:
- `selectedProvince`: Current province filter ('all' | Province)
- `searchQuery`: Current search string
- `selectedSchool`: Currently selected school for popup
- `popupCoords`: Coordinates for the popup position

**Features**:
- Province filtering with real-time updates
- Search across name, town, and district
- Statistics display (total schools, learners, educators)
- Responsive sidebar (hidden on mobile)

**Usage**:
```tsx
import { SchoolsMap } from "@/components/SchoolsMap";

function App() {
  return <SchoolsMap />;
}
```

### SchoolCard

Displays school information in both compact and full formats.

**Location**: `src/components/SchoolCard.tsx`

**Props**:
```typescript
interface SchoolCardProps {
  school: School;
  variant?: 'compact' | 'full';
  onClick?: () => void;
}
```

**Features**:
- Province-specific color coding
- Compact view for sidebar lists
- Full view for popups with all details
- Hover animations

### ProvinceFilter

Horizontal scrollable filter for provinces.

**Location**: `src/components/ProvinceFilter.tsx`

**Props**:
```typescript
interface ProvinceFilterProps {
  selected: ProvinceOption;
  onSelect: (province: ProvinceOption) => void;
  counts: Record<ProvinceOption, number>;
}
```

**Features**:
- Color-coded province buttons
- School count badges
- Horizontal scroll for mobile

---

## Data Layer

### School Interface

**Location**: `src/data/schools.ts`

```typescript
export interface School {
  id: string;
  name: string;
  province: Province;
  district: string;
  town: string;
  phase: string;
  sector: string;
  quintile: string;
  learners: number;
  educators: number;
  latitude: number;
  longitude: number;
}
```

### Province Type

```typescript
export type Province = 
  | 'Gauteng'
  | 'Western Cape'
  | 'Eastern Cape'
  | 'KwaZulu-Natal'
  | 'Limpopo'
  | 'Mpumalanga'
  | 'North West'
  | 'Northern Cape'
  | 'Free State'
  | 'Special Needs';

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
  'Special Needs',
];
```

### Data Functions

```typescript
// Get all schools as array
export const schoolsData: School[];

// Get schools filtered by province
export function getSchoolsByProvince(province: Province): School[];

// Convert schools to GeoJSON for map display
export function getSchoolsGeoJSON(schools?: School[]): GeoJSON.FeatureCollection;
```

### GeoJSON Format

Schools are converted to GeoJSON for map rendering:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "id": "school-123",
        "name": "Example Primary School",
        "province": "Gauteng",
        "district": "Johannesburg North",
        "town": "Sandton",
        "phase": "Primary",
        "sector": "Public",
        "quintile": "5",
        "learners": 850,
        "educators": 32
      }
    }
  ]
}
```

---

## Map System

### Map Components (mapcn)

The map is built using mapcn components on top of MapLibre GL JS.

**Location**: `src/components/ui/map.tsx`

### Core Components

#### Map

The root container that initializes MapLibre GL.

```tsx
<Map
  center={[longitude, latitude]}
  zoom={5}
  styles={{ light: "...", dark: "..." }}
>
  {children}
</Map>
```

**Props**:
- `center`: [lng, lat] - Initial center coordinates
- `zoom`: number - Initial zoom level (0-22)
- `styles`: { light?, dark? } - Custom map styles

#### MapClusterLayer

Renders clustered point data with automatic grouping.

```tsx
<MapClusterLayer
  data={geoJSON}
  clusterRadius={50}
  clusterMaxZoom={14}
  clusterColors={["#51bbd6", "#f1f075", "#f28cb1"]}
  pointColor="#3b82f6"
  onPointClick={(feature, coords) => handleClick(feature)}
/>
```

**Props**:
- `data`: GeoJSON FeatureCollection
- `clusterRadius`: Pixel radius for clustering
- `clusterMaxZoom`: Max zoom level for clusters
- `clusterColors`: [small, medium, large] colors
- `clusterThresholds`: [medium, large] point counts
- `pointColor`: Color for individual points
- `onPointClick`: Callback when point clicked
- `onClusterClick`: Callback when cluster clicked

#### MapPopup

Displays information popup on the map.

```tsx
<MapPopup
  longitude={lng}
  latitude={lat}
  onClose={() => setOpen(false)}
>
  <SchoolCard school={school} variant="full" />
</MapPopup>
```

#### MapControls

Navigation controls for the map.

```tsx
<MapControls
  position="bottom-right"
  showZoom
  showCompass
  showLocate
  showFullscreen
/>
```

### useMap Hook

Access the MapLibre map instance:

```tsx
const { map, isLoaded } = useMap();

useEffect(() => {
  if (isLoaded && map) {
    map.flyTo({ center: [28, -26], zoom: 10 });
  }
}, [isLoaded]);
```

---

## Styling & Theming

### CSS Variables

**Location**: `src/index.css`

The design system uses HSL CSS variables for theming:

```css
:root {
  /* Base colors */
  --background: 40 30% 98%;
  --foreground: 30 20% 15%;
  --primary: 24 75% 50%;
  --secondary: 35 40% 92%;
  
  /* Province colors */
  --province-gauteng: 210 100% 50%;
  --province-western-cape: 270 70% 55%;
  --province-eastern-cape: 175 70% 40%;
  
  /* Cluster colors */
  --cluster-small: 190 75% 55%;
  --cluster-medium: 45 95% 60%;
  --cluster-large: 340 80% 60%;
}

.dark {
  --background: 30 15% 10%;
  --foreground: 40 20% 95%;
  /* ... dark mode overrides */
}
```

### Tailwind Configuration

**Location**: `tailwind.config.ts`

Custom colors are extended in Tailwind:

```typescript
theme: {
  extend: {
    colors: {
      province: {
        gauteng: "hsl(var(--province-gauteng))",
        "western-cape": "hsl(var(--province-western-cape))",
        // ...
      },
      cluster: {
        small: "hsl(var(--cluster-small))",
        medium: "hsl(var(--cluster-medium))",
        large: "hsl(var(--cluster-large))",
      },
    },
  },
}
```

### Province Color Mapping

Each province has a distinct color for visual identification:

| Province | Tailwind Class | HSL Value |
|----------|---------------|-----------|
| Gauteng | `bg-province-gauteng` | 210 100% 50% |
| Western Cape | `bg-province-western-cape` | 270 70% 55% |
| Eastern Cape | `bg-province-eastern-cape` | 175 70% 40% |
| KwaZulu-Natal | `bg-amber-500` | - |
| Limpopo | `bg-emerald-600` | - |
| Mpumalanga | `bg-cyan-500` | - |
| North West | `bg-violet-500` | - |
| Northern Cape | `bg-rose-500` | - |
| Free State | `bg-lime-500` | - |
| Special Needs | `bg-indigo-400` | - |

---

## Performance

### Optimization Strategies

1. **Clustering**: Schools are clustered using MapLibre's native clustering to reduce DOM elements

2. **Memoization**: Heavy computations use `useMemo`:
   ```tsx
   const filteredSchools = useMemo(() => {
     return schoolsData.filter(school => /* ... */);
   }, [selectedProvince, searchQuery]);
   ```

3. **Virtualization**: The sidebar list only renders visible items

4. **Lazy GeoJSON**: GeoJSON is generated on-demand from filtered data

### Bundle Size

- Map library (MapLibre GL): ~200KB gzipped
- React + React DOM: ~45KB gzipped
- Application code: ~50KB gzipped
- School data: ~500KB (compressed JSON)

### Recommendations for Large Datasets

For 25,000+ schools:

1. **Use server-side filtering**: Fetch only visible schools via API
2. **Implement tile-based loading**: Load schools by map bounds
3. **Add pagination**: Limit sidebar list to visible items
4. **Consider WebWorkers**: Process GeoJSON in background thread

---

## API Reference

### Types

```typescript
// Province type union
type Province = 'Gauteng' | 'Western Cape' | ... | 'Special Needs';

// Province option includes 'all'
type ProvinceOption = Province | 'all';

// School data structure
interface School {
  id: string;
  name: string;
  province: Province;
  district: string;
  town: string;
  phase: string;
  sector: string;
  quintile: string;
  learners: number;
  educators: number;
  latitude: number;
  longitude: number;
}
```

### Functions

```typescript
// Get schools by province
function getSchoolsByProvince(province: Province): School[]

// Convert to GeoJSON
function getSchoolsGeoJSON(schools?: School[]): GeoJSON.FeatureCollection

// Parse coordinate string (internal)
function parseCoord(val: any): number | null
```

### Constants

```typescript
// South Africa center coordinates
const SA_CENTER: [number, number] = [24.5, -29.0];

// All province names
const ALL_PROVINCES: Province[];

// School data array
const schoolsData: School[];
```

---

## Deployment

### Build

```bash
npm run build
```

This creates a `dist/` folder with optimized assets.

### Environment Variables

No environment variables required - the app uses free map tiles.

Optional:
```env
VITE_MAP_STYLE_LIGHT=https://...
VITE_MAP_STYLE_DARK=https://...
```

### Hosting Options

1. **Lovable**: Click "Publish" in the editor
2. **Vercel**: Connect GitHub repo
3. **Netlify**: Drag & drop `dist/` folder
4. **Static hosting**: Upload `dist/` to any CDN

### Performance Headers

Recommended headers for production:

```
Cache-Control: public, max-age=31536000, immutable  # For assets
Cache-Control: no-cache  # For index.html
```

---

## Troubleshooting

### Common Issues

#### Map not loading

1. Check browser console for errors
2. Verify MapLibre GL is loaded
3. Check if container has defined height

```tsx
// Container must have height
<div className="h-[500px]">
  <Map />
</div>
```

#### Schools not appearing

1. Check if coordinates are valid (within South Africa bounds)
2. Verify GeoJSON format is correct
3. Check cluster zoom levels

#### Performance issues

1. Reduce `clusterRadius` for fewer clusters
2. Increase `clusterMaxZoom` for earlier unclustering
3. Limit schools in initial view

#### Search not working

1. Ensure search query is trimmed
2. Check field names match data structure
3. Verify case-insensitive matching

### Debug Mode

Add to URL for debug overlay:
```
?debug=true
```

### Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

WebGL is required for map rendering.

---

## Changelog

### v1.0.0

- Initial release
- 25,000+ schools from 9 provinces
- Province filtering and search
- Clustering for performance
- Responsive design
- Dark mode support

---

## Support

For issues and feature requests, please open a GitHub issue or contact the development team.
