"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Maximize2,
  Minimize2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { MCXSite } from "@/types/security-types";
import { useSecurityContext } from "@/contexts/security-context";
import { useAnnouncer, useFocusTrap } from "../../lib/accessibility-utils";

// Dynamically import map components with loading states and preloading
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

// Preload critical map components
if (typeof window !== "undefined") {
  import("react-leaflet");
}

interface SecurityMapProps {
  className?: string;
}

export function SecurityMap({ className = "w-full h-full" }: SecurityMapProps) {
  const { state, actions } = useSecurityContext();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(-1);
  const mapRef = useRef<HTMLDivElement>(null);
  const { announce } = useAnnouncer();
  const focusTrapRef = useFocusTrap(isFullscreen);

  // Jeddah coordinates as specified in the design
  const jeddahCenter: [number, number] = [21.4858, 39.1925];
  const defaultZoom = 11;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoized color calculation for performance
  const getMarkerColor = useCallback((resilienceScore: number) => {
    if (resilienceScore >= 80) return "#22c55e"; // green
    if (resilienceScore >= 50) return "#eab308"; // yellow
    return "#ef4444"; // red
  }, []);

  // Memoized site data with resilience scores for performance
  const sitesWithScores = useMemo(() => {
    return state.sites.map((site) => {
      const testSuite = state.testSuites[site.id];
      const resilienceScore = testSuite
        ? testSuite.overallScore
        : site.security.resilienceScore;
      return {
        ...site,
        computedResilienceScore: resilienceScore,
      };
    });
  }, [state.sites, state.testSuites]);

  // Note: selectedSite logic is now handled inline in the coverage circles section

  // Memoized marker options calculation
  const getMarkerOptions = useCallback(
    (site: MCXSite) => {
      const testSuite = state.testSuites[site.id];
      const resilienceScore = testSuite
        ? testSuite.overallScore
        : site.security.resilienceScore;
      const color = getMarkerColor(resilienceScore);
      const isSelected = state.selectedSiteId === site.id;

      return {
        radius: isSelected ? 12 : 8,
        fillColor: color,
        color: isSelected ? "#dc2626" : "#ffffff",
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.9,
      };
    },
    [state.testSuites, state.selectedSiteId, getMarkerColor]
  );

  const toggleFullscreen = useCallback(() => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    // Announce state change to screen readers
    announce(
      newFullscreenState
        ? "Map expanded to fullscreen"
        : "Map returned to normal view",
      "polite"
    );
  }, [isFullscreen, announce]);

  // Keyboard navigation for map markers
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!sitesWithScores.length) return;

      switch (e.key) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          e.preventDefault();
          let newIndex = selectedMarkerIndex;

          if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            newIndex =
              selectedMarkerIndex <= 0
                ? sitesWithScores.length - 1
                : selectedMarkerIndex - 1;
          } else {
            newIndex =
              selectedMarkerIndex >= sitesWithScores.length - 1
                ? 0
                : selectedMarkerIndex + 1;
          }

          setSelectedMarkerIndex(newIndex);
          const site = sitesWithScores[newIndex];
          actions.selectSite(site.id);
          announce(
            `Selected ${site.name}, security score ${site.computedResilienceScore} out of 100`,
            "assertive"
          );
          break;

        case "Enter":
        case " ":
          if (selectedMarkerIndex >= 0) {
            e.preventDefault();
            const site = sitesWithScores[selectedMarkerIndex];
            actions.selectSite(site.id);
            announce(`Opened details for ${site.name}`, "assertive");
          }
          break;

        case "Escape":
          if (isFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    },
    [
      selectedMarkerIndex,
      sitesWithScores,
      actions,
      announce,
      isFullscreen,
      toggleFullscreen,
    ]
  );

  // Add keyboard event listener
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.addEventListener("keydown", handleKeyDown);
      return () => {
        mapRef.current?.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  if (!isClient) {
    return (
      <div
        className={`${className} bg-muted rounded-lg flex items-center justify-center relative`}
      >
        <p className="text-muted-foreground">Loading map...</p>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const mapClassName = isFullscreen
    ? "fixed inset-0 z-50 w-full h-full"
    : `${className} rounded-lg overflow-hidden`;

  return (
    <div
      ref={
        isFullscreen
          ? (focusTrapRef as React.RefObject<HTMLDivElement>)
          : mapRef
      }
      className={`${mapClassName} relative`}
      role="application"
      aria-label="Security map showing MCX sites with resilience scores"
      tabIndex={0}
    >
      {/* Skip to content link for accessibility */}
      <a
        href="#map-legend"
        className="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20"
      >
        Skip to map legend
      </a>
      <MapContainer
        center={jeddahCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show coverage areas for all sites first (behind markers) */}
        {sitesWithScores.map((site) => {
          const isSelected = state.selectedSiteId === site.id;
          const resilienceScore = site.computedResilienceScore;
          
          // Get color based on resilience score
          const coverageColor = resilienceScore >= 80 ? "#22c55e" : 
                               resilienceScore >= 50 ? "#eab308" : "#ef4444";
          
          return (
            <div key={`coverage-${site.id}`}>
              {/* Coverage area circle for all sites */}
              <Circle
                center={[site.location.latitude, site.location.longitude]}
                radius={2000} // 2km coverage radius
                pathOptions={{
                  color: coverageColor,
                  fillColor: coverageColor,
                  fillOpacity: isSelected ? 0.4 : 0.25,
                  weight: isSelected ? 2 : 1,
                  dashArray: isSelected ? "5, 5" : "10, 10",
                  opacity: isSelected ? 1.0 : 0.8,
                  interactive: false, // Prevent interference with marker clicks
                }}
              />
              
              {/* Additional highlight circle for selected site */}
              {isSelected && (
                <Circle
                  center={[site.location.latitude, site.location.longitude]}
                  radius={500} // 500m highlight radius
                  pathOptions={{
                    color: "#dc2626",
                    fillColor: "transparent",
                    weight: 3,
                    dashArray: "10, 5",
                    opacity: 0.9,
                    interactive: false, // Prevent interference with marker clicks
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Render markers on top of coverage areas */}
        {sitesWithScores.map((site) => {
          const markerOptions = getMarkerOptions(site);
          const resilienceScore = site.computedResilienceScore;

          return (
            <CircleMarker
              key={site.id}
              center={[site.location.latitude, site.location.longitude]}
              pathOptions={{
                ...markerOptions,
                interactive: true, // Ensure markers are interactive
              }}
              radius={markerOptions.radius}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  actions.selectSite(site.id);
                },
                mouseover: (e) => {
                  const marker = e.target;
                  marker
                    .bindTooltip(
                      `
                    <div style="font-size: 12px; line-height: 1.4;">
                      <strong>${site.name}</strong><br/>
                      <span style="color: #666;">${site.infrastructure.type
                        .replace("_", " ")
                        .toUpperCase()}</span><br/>
                      <span style="color: ${getMarkerColor(resilienceScore)};">
                        Security: ${resilienceScore}/100
                      </span>
                    </div>
                  `,
                      {
                        permanent: false,
                        direction: "top",
                        offset: [0, -10],
                        className: "custom-tooltip",
                      }
                    )
                    .openTooltip();
                },
                mouseout: (e) => {
                  const marker = e.target;
                  marker.closeTooltip();
                },
              }}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base mb-1">
                        {site.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {site.infrastructure.type
                            .replace("_", " ")
                            .toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            site.infrastructure.criticality === "high"
                              ? "destructive"
                              : site.infrastructure.criticality === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {site.infrastructure.criticality.toUpperCase()}{" "}
                          PRIORITY
                        </Badge>
                      </div>
                    </div>
                    {site.infrastructure.criticality === "high" && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Security Resilience:
                      </span>
                      <div className="flex items-center gap-2">
                        {resilienceScore >= 80 ? (
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                        ) : resilienceScore >= 50 ? (
                          <Shield className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-bold ${
                            resilienceScore >= 80
                              ? "text-green-600"
                              : resilienceScore >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {resilienceScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last Audit:</span>
                      <span>
                        {new Date(
                          site.security.lastAuditDate
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Firmware:</span>
                      <span>{site.technical.firmwareVersion}</span>
                    </div>


                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}


      </MapContainer>

      {/* Fullscreen toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
        onClick={toggleFullscreen}
        aria-label={
          isFullscreen
            ? "Exit fullscreen map view"
            : "Enter fullscreen map view"
        }
        aria-pressed={isFullscreen}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only">
          {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        </span>
      </Button>

      {/* Legend */}
      <div
        id="map-legend"
        className="absolute bottom-2 left-2 z-10 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-3"
        role="region"
        aria-label="Map legend and instructions"
      >
        <div>
          <h4 className="font-semibold mb-2">Security Resilience</h4>
          <div className="space-y-1" role="list">
            <div className="flex items-center gap-2" role="listitem">
              <div
                className="w-3 h-3 rounded-full bg-green-500"
                aria-hidden="true"
              ></div>
              <span>High (80-100)</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <div
                className="w-3 h-3 rounded-full bg-yellow-500"
                aria-hidden="true"
              ></div>
              <span>Medium (50-79)</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <div
                className="w-3 h-3 rounded-full bg-red-500"
                aria-hidden="true"
              ></div>
              <span>Low (0-49)</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <h4 className="font-semibold mb-2">Coverage Areas</h4>
          <div className="space-y-1" role="list">
            <div className="flex items-center gap-2" role="listitem">
              <div
                className="w-3 h-1 bg-green-500 rounded opacity-50"
                style={{ borderStyle: "dashed" }}
                aria-hidden="true"
              ></div>
              <span className="text-xs">High Security (2km range)</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <div
                className="w-3 h-1 bg-yellow-500 rounded opacity-50"
                style={{ borderStyle: "dashed" }}
                aria-hidden="true"
              ></div>
              <span className="text-xs">Medium Security (2km range)</span>
            </div>
            <div className="flex items-center gap-2" role="listitem">
              <div
                className="w-3 h-1 bg-red-500 rounded opacity-50"
                style={{ borderStyle: "dashed" }}
                aria-hidden="true"
              ></div>
              <span className="text-xs">Low Security (2km range)</span>
            </div>
            {state.selectedSiteId && (
              <div className="flex items-center gap-2" role="listitem">
                <div
                  className="w-3 h-1 bg-red-600 rounded"
                  style={{ borderStyle: "dashed" }}
                  aria-hidden="true"
                ></div>
                <span className="text-xs">Selected Site Highlight</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 text-muted-foreground">
          <div className="space-y-1">
            <div>Click markers to select sites</div>
            <div>Use arrow keys to navigate</div>
            <div>Press Enter to select</div>
            <div>Press Escape to exit fullscreen</div>
          </div>
        </div>
      </div>
    </div>
  );
}
