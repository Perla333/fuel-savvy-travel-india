
import { getNearestState } from '../data/fuelPrices';

export interface RoutePoint {
  lat: number;
  lng: number;
  state: string;
  distanceFromStart: number; // in km
}

export interface RouteSegment {
  startState: string;
  endState: string;
  distance: number; // in km
  fuelNeeded: number; // in liters
}

export interface Route {
  points: RoutePoint[];
  segments: RouteSegment[];
  states: string[];
  totalDistance: number; // in km
  totalFuelNeeded: number; // in liters
}

// Function to fetch route data using OSRM API
export const getRoute = async (startLocation: string, endLocation: string, mileage: number): Promise<Route> => {
  try {
    // First, geocode the locations to get coordinates
    const startCoords = await geocodeLocation(startLocation);
    const endCoords = await geocodeLocation(endLocation);
    
    if (!startCoords || !endCoords) {
      throw new Error("Failed to geocode locations");
    }
    
    // Use OSRM API to get the route
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson&steps=true`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok || data.code !== 'Ok') {
      throw new Error("Failed to fetch route from OSRM API");
    }
    
    // Extract route geometry (coordinates)
    const coordinates = data.routes[0].geometry.coordinates;
    const totalDistance = data.routes[0].distance / 1000; // Convert to km
    const totalFuelNeeded = totalDistance / mileage;
    
    // Sample points along the route to determine states
    // For demo purposes, we'll sample a point every ~50km
    const sampleDistance = 50; // km
    const totalPoints = Math.max(10, Math.ceil(totalDistance / sampleDistance));
    const step = Math.max(1, Math.floor(coordinates.length / totalPoints));
    
    const points: RoutePoint[] = [];
    const states = new Set<string>();
    
    for (let i = 0; i < coordinates.length; i += step) {
      const [lng, lat] = coordinates[i];
      // Get the nearest state based on coordinates
      const nearestState = getNearestState(lat, lng);
      states.add(nearestState.state);
      
      // Calculate approximate distance from start
      const distanceFromStart = (i / coordinates.length) * totalDistance;
      
      points.push({
        lat,
        lng,
        state: nearestState.state,
        distanceFromStart
      });
    }
    
    // Ensure the last point is included
    const [endLng, endLat] = coordinates[coordinates.length - 1];
    const endStateData = getNearestState(endLat, endLng);
    points.push({
      lat: endLat,
      lng: endLng,
      state: endStateData.state,
      distanceFromStart: totalDistance
    });
    
    // Create segments for each state transition
    const segments: RouteSegment[] = [];
    let prevState = points[0].state;
    let segmentStartDistance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const currentState = points[i].state;
      
      if (currentState !== prevState) {
        // State transition detected
        const segmentDistance = points[i - 1].distanceFromStart - segmentStartDistance;
        segments.push({
          startState: prevState,
          endState: currentState,
          distance: segmentDistance,
          fuelNeeded: segmentDistance / mileage
        });
        
        segmentStartDistance = points[i - 1].distanceFromStart;
        prevState = currentState;
      }
    }
    
    // Add the final segment
    const finalSegmentDistance = totalDistance - segmentStartDistance;
    if (finalSegmentDistance > 0) {
      segments.push({
        startState: prevState,
        endState: points[points.length - 1].state,
        distance: finalSegmentDistance,
        fuelNeeded: finalSegmentDistance / mileage
      });
    }
    
    return {
      points,
      segments,
      states: Array.from(states),
      totalDistance,
      totalFuelNeeded
    };
  } catch (error) {
    console.error("Error getting route:", error);
    throw error;
  }
};

// Helper function to geocode a location name to coordinates
export const geocodeLocation = async (location: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'FuelSaver/1.0'
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
};

// Convert route to GeoJSON format for display on map
export const routeToGeoJSON = (route: Route) => {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route.points.map(point => [point.lng, point.lat])
    }
  };
};
