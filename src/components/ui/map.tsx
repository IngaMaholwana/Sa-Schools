"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import maplibregl, {
  Map as MapLibreMap,
  MapOptions,
  MarkerOptions,
  PopupOptions,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus,
  Compass,
  Locate,
  Maximize,
  Minimize,
} from "lucide-react";

// ============= Context =============
interface MapContextValue {
  map: MapLibreMap | null;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextValue>({
  map: null,
  isLoaded: false,
});

export const useMap = () => useContext(MapContext);

// ============= Map Styles =============
const DEFAULT_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

// ============= Map Component =============
interface MapProps
  extends Omit<MapOptions, "container" | "style"> {
  children?: React.ReactNode;
  styles?: {
    light?: string;
    dark?: string;
  };
  className?: string;
}

export function Map({
  children,
  styles,
  className,
  ...options
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const mapStyle = styles?.light || DEFAULT_STYLES.light;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      ...options,
    });

    map.on("load", () => {
      setIsLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const contextValue = useMemo(
    () => ({ map: mapRef.current, isLoaded }),
    [isLoaded]
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative w-full h-full", className)}>
        {isLoaded && children}
      </div>
    </MapContext.Provider>
  );
}

// ============= Map Controls =============
interface MapControlsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
}

export function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map } = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const positionClasses = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
  };

  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();
  const handleResetBearing = () => map?.resetNorth();
  
  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
        onLocate?.(coords);
      },
      (err) => console.error("Geolocation error:", err)
    );
  };

  const handleFullscreen = () => {
    const container = map?.getContainer().parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-1",
        positionClasses[position],
        className
      )}
    >
      {showZoom && (
        <>
          <Button size="icon" variant="secondary" onClick={handleZoomIn} className="h-8 w-8 shadow-md">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" onClick={handleZoomOut} className="h-8 w-8 shadow-md">
            <Minus className="h-4 w-4" />
          </Button>
        </>
      )}
      {showCompass && (
        <Button size="icon" variant="secondary" onClick={handleResetBearing} className="h-8 w-8 shadow-md">
          <Compass className="h-4 w-4" />
        </Button>
      )}
      {showLocate && (
        <Button size="icon" variant="secondary" onClick={handleLocate} className="h-8 w-8 shadow-md">
          <Locate className="h-4 w-4" />
        </Button>
      )}
      {showFullscreen && (
        <Button size="icon" variant="secondary" onClick={handleFullscreen} className="h-8 w-8 shadow-md">
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

// ============= Marker Context =============
interface MarkerContextValue {
  marker: maplibregl.Marker | null;
  longitude: number;
  latitude: number;
}

const MarkerContext = createContext<MarkerContextValue | null>(null);

// ============= Map Marker =============
interface MapMarkerProps extends Omit<MarkerOptions, "element"> {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
}

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  ...options
}: MapMarkerProps) {
  const { map, isLoaded } = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map || !isLoaded || !elementRef.current) return;

    const marker = new maplibregl.Marker({
      element: elementRef.current,
      ...options,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = marker;

    if (onClick) elementRef.current.addEventListener("click", onClick);
    if (onMouseEnter) elementRef.current.addEventListener("mouseenter", onMouseEnter);
    if (onMouseLeave) elementRef.current.addEventListener("mouseleave", onMouseLeave);

    if (options.draggable) {
      marker.on("dragstart", () => onDragStart?.(marker.getLngLat()));
      marker.on("drag", () => onDrag?.(marker.getLngLat()));
      marker.on("dragend", () => onDragEnd?.(marker.getLngLat()));
    }

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, isLoaded, longitude, latitude]);

  const contextValue = useMemo(
    () => ({ marker: markerRef.current, longitude, latitude }),
    [longitude, latitude]
  );

  return (
    <MarkerContext.Provider value={contextValue}>
      <div ref={elementRef} className="cursor-pointer">
        {children || <DefaultMarker />}
      </div>
    </MarkerContext.Provider>
  );
}

function DefaultMarker() {
  return (
    <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground shadow-lg" />
  );
}

// ============= Marker Content =============
interface MarkerContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function MarkerContent({ children, className }: MarkerContentProps) {
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {children || <DefaultMarker />}
    </div>
  );
}

// ============= Marker Label =============
interface MarkerLabelProps {
  children?: React.ReactNode;
  className?: string;
  position?: "top" | "bottom";
}

export function MarkerLabel({
  children,
  className,
  position = "top",
}: MarkerLabelProps) {
  return (
    <div
      className={cn(
        "absolute whitespace-nowrap px-2 py-1 text-xs font-medium bg-card text-card-foreground rounded shadow-md",
        position === "top" ? "-top-8" : "-bottom-8",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============= Marker Popup =============
interface MarkerPopupProps extends Omit<PopupOptions, "className" | "closeButton"> {
  children?: React.ReactNode;
  className?: string;
  closeButton?: boolean;
}

export function MarkerPopup({
  children,
  className,
  closeButton = false,
  ...options
}: MarkerPopupProps) {
  const { map, isLoaded } = useMap();
  const markerContext = useContext(MarkerContext);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!map || !isLoaded || !markerContext?.marker || !contentRef.current) return;

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: true,
      ...options,
    }).setDOMContent(contentRef.current);

    popupRef.current = popup;

    const handleClick = () => {
      popup.setLngLat([markerContext.longitude, markerContext.latitude]).addTo(map);
      setIsOpen(true);
    };

    const element = markerContext.marker.getElement();
    element.addEventListener("click", handleClick);

    popup.on("close", () => setIsOpen(false));

    return () => {
      element.removeEventListener("click", handleClick);
      popup.remove();
    };
  }, [map, isLoaded, markerContext]);

  return (
    <div className="hidden">
      <div
        ref={contentRef}
        className={cn("p-3 min-w-[200px] bg-card text-card-foreground rounded-lg shadow-lg", className)}
      >
        {closeButton && (
          <button
            onClick={() => popupRef.current?.remove()}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// ============= Marker Tooltip =============
interface MarkerTooltipProps extends Omit<PopupOptions, "className" | "closeButton" | "closeOnClick"> {
  children?: React.ReactNode;
  className?: string;
}

export function MarkerTooltip({
  children,
  className,
  ...options
}: MarkerTooltipProps) {
  const { map, isLoaded } = useMap();
  const markerContext = useContext(MarkerContext);
  const tooltipRef = useRef<maplibregl.Popup | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map || !isLoaded || !markerContext?.marker || !contentRef.current) return;

    const tooltip = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
      ...options,
    }).setDOMContent(contentRef.current);

    tooltipRef.current = tooltip;

    const element = markerContext.marker.getElement();

    const handleMouseEnter = () => {
      tooltip.setLngLat([markerContext.longitude, markerContext.latitude]).addTo(map);
    };

    const handleMouseLeave = () => {
      tooltip.remove();
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
  }, [map, isLoaded, markerContext]);

  return (
    <div className="hidden">
      <div
        ref={contentRef}
        className={cn("px-2 py-1 text-sm bg-card text-card-foreground rounded shadow-md", className)}
      >
        {children}
      </div>
    </div>
  );
}

// ============= Map Popup (Standalone) =============
interface MapPopupProps extends Omit<PopupOptions, "className" | "closeButton"> {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
  closeButton?: boolean;
}

export function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  ...options
}: MapPopupProps) {
  const { map, isLoaded } = useMap();
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map || !isLoaded || !contentRef.current) return;

    const popup = new maplibregl.Popup({
      closeButton: false,
      ...options,
    })
      .setLngLat([longitude, latitude])
      .setDOMContent(contentRef.current)
      .addTo(map);

    popupRef.current = popup;

    popup.on("close", () => onClose?.());

    return () => {
      popup.remove();
    };
  }, [map, isLoaded, longitude, latitude]);

  return (
    <div className="hidden">
      <div
        ref={contentRef}
        className={cn("p-3 min-w-[200px] bg-card text-card-foreground rounded-lg shadow-lg", className)}
      >
        {closeButton && (
          <button
            onClick={() => popupRef.current?.remove()}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

// ============= Map Route =============
interface MapRouteProps {
  id?: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  interactive?: boolean;
}

export function MapRoute({
  id,
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const routeId = useRef(id || `route-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!map || !isLoaded || coordinates.length < 2) return;

    const sourceId = `${routeId.current}-source`;
    const layerId = routeId.current;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": color,
        "line-width": width,
        "line-opacity": opacity,
        ...(dashArray && { "line-dasharray": dashArray }),
      },
    });

    if (interactive) {
      map.on("click", layerId, () => onClick?.());
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
        onMouseEnter?.();
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
        onMouseLeave?.();
      });
    }

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [map, isLoaded, coordinates, color, width, opacity]);

  return null;
}

// ============= Map Cluster Layer =============
interface MapClusterLayerProps<T = Record<string, unknown>> {
  data: string | GeoJSON.FeatureCollection;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  clusterColors?: [string, string, string];
  clusterThresholds?: [number, number];
  pointColor?: string;
  onPointClick?: (feature: GeoJSON.Feature<GeoJSON.Point, T>, coordinates: [number, number]) => void;
  onClusterClick?: (clusterId: number, coordinates: [number, number], pointCount: number) => void;
}

export function MapClusterLayer<T = Record<string, unknown>>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = ["#51bbd6", "#f1f075", "#f28cb1"],
  clusterThresholds = [100, 750],
  pointColor = "#3b82f6",
  onPointClick,
  onClusterClick,
}: MapClusterLayerProps<T>) {
  const { map, isLoaded } = useMap();
  const sourceId = useRef(`cluster-source-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const source = sourceId.current;
    const clusterLayerId = `${source}-clusters`;
    const clusterCountLayerId = `${source}-cluster-count`;
    const unclusteredLayerId = `${source}-unclustered`;

    map.addSource(source, {
      type: "geojson",
      data: data as GeoJSON.FeatureCollection,
      cluster: true,
      clusterMaxZoom,
      clusterRadius,
    });

    // Cluster circles
    map.addLayer({
      id: clusterLayerId,
      type: "circle",
      source,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          clusterColors[0],
          clusterThresholds[0],
          clusterColors[1],
          clusterThresholds[1],
          clusterColors[2],
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          clusterThresholds[0],
          30,
          clusterThresholds[1],
          40,
        ],
      },
    });

    // Cluster counts
    map.addLayer({
      id: clusterCountLayerId,
      type: "symbol",
      source,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    // Unclustered points
    map.addLayer({
      id: unclusteredLayerId,
      type: "circle",
      source,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": pointColor,
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Click handlers
    map.on("click", clusterLayerId, async (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [clusterLayerId] });
      if (!features.length) return;

      const clusterId = features[0].properties?.cluster_id;
      const pointCount = features[0].properties?.point_count;
      const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];

      if (onClusterClick) {
        onClusterClick(clusterId, coordinates, pointCount);
      } else {
        const source = map.getSource(sourceId.current) as maplibregl.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({ center: coordinates, zoom });
      }
    });

    map.on("click", unclusteredLayerId, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [unclusteredLayerId] });
      if (!features.length) return;

      const feature = features[0] as unknown as GeoJSON.Feature<GeoJSON.Point, T>;
      const coordinates = feature.geometry.coordinates as [number, number];
      onPointClick?.(feature, coordinates);
    });

    // Cursor changes
    map.on("mouseenter", clusterLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", clusterLayerId, () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", unclusteredLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", unclusteredLayerId, () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
      if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
      if (map.getLayer(unclusteredLayerId)) map.removeLayer(unclusteredLayerId);
      if (map.getSource(source)) map.removeSource(source);
    };
  }, [map, isLoaded, data]);

  return null;
}
