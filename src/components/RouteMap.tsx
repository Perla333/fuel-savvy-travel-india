
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

declare global {
  interface Window {
    L: any;
  }
}

const RouteMap: React.FC<RouteMapProps> = ({ route, refuelPoints, alerts, fuelType }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInitializedRef = useRef<boolean>(false);
  
  // Initialize map
  useEffect(() => {
    if (!window.L || mapInitializedRef.current) return;
    
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
      if (mapContainerRef.current) {
        mapRef.current = window.L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
        
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
        
        mapInitializedRef.current = true;
      }
    };
    document.head.appendChild(scriptElement);
    
    return () => {
      // Cleanup map on component unmount if needed
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);
  
  // Update map when route changes
  useEffect(() => {
    if (!route || !mapInitializedRef.current || !window.L || !mapRef.current) return;
    
    // Clear previous layers
    mapRef.current.eachLayer((layer: any) => {
      if (layer.options && !layer.options.attribution) {
        mapRef.current.removeLayer(layer);
      }
    });
    
    // Add tile layer back if needed
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);
    
    // Add route line
    const routeData = routeToGeoJSON(route);
    const routeLayer = window.L.geoJSON(routeData, {
      style: {
        color: '#1A365D',
        weight: 4,
        opacity: 0.7
      }
    }).addTo(mapRef.current);
    
    // Add markers for start and end
    const startPoint = route.points[0];
    const endPoint = route.points[route.points.length - 1];
    
    // Start marker
    window.L.marker([startPoint.lat, startPoint.lng], {
      icon: window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#2A4365;width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>`,
        iconSize: [15, 15],
        iconAnchor: [7, 7]
      })
    })
    .addTo(mapRef.current)
    .bindPopup(`<b>Start:</b> ${startPoint.state}`);
    
    // End marker
    window.L.marker([endPoint.lat, endPoint.lng], {
      icon: window.L.divIcon({
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
        const borderPoints = route.points.filter(
          (p, i, arr) => i < arr.length - 1 && 
            ((p.state === alert.fromState && arr[i + 1].state === alert.toState) ||
             (p.state === alert.toState && arr[i + 1].state === alert.fromState))
        );
        
        if (borderPoints.length > 0) {
          const borderPoint = borderPoints[0];
          
          // Create alert icon based on action
          const alertColor = alert.action === 'fill' ? '#059669' : alert.action === 'wait' ? '#D97706' : '#6B7280';
          
          window.L.marker([borderPoint.lat, borderPoint.lng], {
            icon: window.L.divIcon({
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
          window.L.marker([bunk.coords[0], bunk.coords[1]], {
            icon: window.L.divIcon({
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
    mapRef.current.fitBounds(routeLayer.getBounds());
    
  }, [route, refuelPoints, alerts, fuelType]);
  
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
