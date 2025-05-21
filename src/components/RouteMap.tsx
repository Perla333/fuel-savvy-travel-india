
import React, { useEffect, useRef } from 'react';
import { Route, routeToGeoJSON } from '../utils/routing';
import { getFuelPriceByState } from '../data/fuelPrices';
import { PetrolBunk } from '../data/petrolBunks';
import { RefuelPoint, StateAlert } from '../utils/fuelCalculator';

interface RouteMapProps {
  route: Route | null;
  refuelPoints: RefuelPoint[];
  alerts: StateAlert[];
  fuelType: 'petrol' | 'diesel';
}

const RouteMap: React.FC<RouteMapProps> = ({ route, refuelPoints, alerts, fuelType }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const leafletLoadedRef = useRef<boolean>(false);
  
  // Load Leaflet CSS and JS once
  useEffect(() => {
    if (document.querySelector('link[href*="leaflet"]')) {
      leafletLoadedRef.current = true;
      initMap();
      return;
    }
    
    // Add Leaflet CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkElement.crossOrigin = '';
    document.head.appendChild(linkElement);
    
    // Add Leaflet JS
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptElement.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    scriptElement.crossOrigin = '';
    
    scriptElement.onload = () => {
      console.log('Leaflet loaded');
      leafletLoadedRef.current = true;
      initMap();
    };
    
    document.head.appendChild(scriptElement);
    
    return () => {
      // Cleanup map on component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);
  
  // Initialize map function
  const initMap = () => {
    if (!leafletLoadedRef.current || !mapContainerRef.current || mapInitializedRef.current) {
      return;
    }
    
    console.log('Initializing map');
    const L = window.L;
    if (!L) {
      console.error('Leaflet not loaded');
      return;
    }
    
    try {
      mapRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      mapInitializedRef.current = true;
      
      // If route data is already available, render it
      if (route) {
        updateMapWithRoute(route, refuelPoints, alerts, fuelType);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };
  
  // Update map when route changes
  useEffect(() => {
    if (route && mapInitializedRef.current) {
      updateMapWithRoute(route, refuelPoints, alerts, fuelType);
    }
  }, [route, refuelPoints, alerts, fuelType]);
  
  // Function to update map with route data
  const updateMapWithRoute = (
    routeData: Route,
    refuelPoints: RefuelPoint[],
    alerts: StateAlert[],
    fuelType: 'petrol' | 'diesel'
  ) => {
    if (!mapRef.current || !window.L) return;
    
    const L = window.L;
    
    console.log('Updating map with route data');
    
    // Clear previous layers
    mapRef.current.eachLayer((layer: any) => {
      if (layer.options && !layer.options.attribution) {
        mapRef.current.removeLayer(layer);
      }
    });
    
    // Add tile layer back
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);
    
    try {
      // Add route line
      const geoJsonData = routeToGeoJSON(routeData);
      console.log('GeoJSON data:', geoJsonData);
      
      const routeLayer = L.geoJSON(geoJsonData, {
        style: {
          color: '#1A365D',
          weight: 4,
          opacity: 0.7
        }
      }).addTo(mapRef.current);
      
      // Add markers for start and end
      const startPoint = routeData.points[0];
      const endPoint = routeData.points[routeData.points.length - 1];
      
      // Start marker
      L.marker([startPoint.lat, startPoint.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:#2A4365;width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>`,
          iconSize: [15, 15],
          iconAnchor: [7, 7]
        })
      })
      .addTo(mapRef.current)
      .bindPopup(`<b>Start:</b> ${startPoint.state}`);
      
      // End marker
      L.marker([endPoint.lat, endPoint.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:#DD6B20;width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>`,
          iconSize: [15, 15],
          iconAnchor: [7, 7]
        })
      })
      .addTo(mapRef.current)
      .bindPopup(`<b>End:</b> ${endPoint.state}`);
      
      // Add state border markers with alerts
      if (alerts.length > 0) {
        alerts.forEach(alert => {
          // Find point near border between these states
          const borderPoints = routeData.points.filter(
            (p, i, arr) => i < arr.length - 1 && 
              ((p.state === alert.fromState && arr[i + 1].state === alert.toState) ||
               (p.state === alert.toState && arr[i + 1].state === alert.fromState))
          );
          
          if (borderPoints.length > 0) {
            const borderPoint = borderPoints[0];
            
            // Create alert icon based on action
            const alertColor = alert.action === 'fill' ? '#059669' : alert.action === 'wait' ? '#D97706' : '#6B7280';
            
            L.marker([borderPoint.lat, borderPoint.lng], {
              icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:${alertColor};width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">!</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })
            })
            .addTo(mapRef.current)
            .bindPopup(`<b>${alert.message}</b>`);
          }
        });
      }
      
      // Add petrol bunk markers
      if (refuelPoints.length > 0) {
        refuelPoints.forEach(refPoint => {
          refPoint.bunks.forEach(bunk => {
            const statePrice = getFuelPriceByState(bunk.state);
            const price = statePrice ? (fuelType === 'diesel' ? statePrice.diesel : statePrice.petrol) : 'N/A';
            
            // Create petrol bunk marker
            L.marker([bunk.coords[0], bunk.coords[1]], {
              icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color:#319795;width:10px;height:10px;border-radius:50%;border:2px solid white;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
              })
            })
            .addTo(mapRef.current)
            .bindPopup(`
              <b>${bunk.name}</b><br>
              ${bunk.brand}<br>
              ${bunk.address}<br>
              ${bunk.hours}<br>
              <b>${fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}:</b> ₹${price}/L<br>
              <a href="tel:${bunk.phone}">${bunk.phone}</a>
            `);
          });
        });
      }
      
      // Fit map to route bounds
      try {
        mapRef.current.fitBounds(routeLayer.getBounds());
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to a default view if bounds fitting fails
        mapRef.current.setView([20.5937, 78.9629], 5);
      }
    } catch (error) {
      console.error('Error updating map with route:', error);
    }
  };
  
  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full">
        {/* Map will be rendered here */}
        {!mapInitializedRef.current && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-gray-500">Loading map...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMap;
