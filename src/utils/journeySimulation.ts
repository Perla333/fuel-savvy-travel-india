
import { Route, RoutePoint } from './routing';
import { RefuelPoint } from './fuelCalculator';
import { PetrolBunk } from '../data/petrolBunks';

// Function to calculate distance between two points using Haversine formula
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
};

// Interface for Journey Notification
export interface JourneyNotification {
  id: string;
  type: 'initial' | 'upcoming' | 'arrived' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
}

// Interface for Journey Position
export interface JourneyPosition {
  lat: number;
  lng: number;
  state: string;
  distanceFromStart: number;
  index: number;
}

// Interface for Journey Simulator
export interface JourneySimulator {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isRunning: boolean;
  currentPosition: JourneyPosition | null;
}

// Function to create a journey simulator
export const createJourneySimulator = (
  route: Route,
  refuelPoints: RefuelPoint[],
  onPositionUpdate: (position: JourneyPosition) => void,
  onNotification: (notification: JourneyNotification) => void,
  options = { speed: 50 } // Speed in km/h
): JourneySimulator => {
  let interval: NodeJS.Timeout | null = null;
  let running = false;
  let currentIndex = 0;
  let currentPosition: JourneyPosition | null = null;
  let processedBunks = new Set<string>();
  
  // All petrol bunks from refuel points
  const allBunks: PetrolBunk[] = refuelPoints.reduce(
    (acc, point) => [...acc, ...point.bunks],
    [] as PetrolBunk[]
  );
  
  // Function to check proximity to petrol bunks
  const checkBunkProximity = (position: JourneyPosition) => {
    if (!allBunks.length) return;
    
    allBunks.forEach(bunk => {
      if (processedBunks.has(bunk.id)) return;
      
      const distance = calculateDistance(
        position.lat, 
        position.lng, 
        bunk.coords[0], 
        bunk.coords[1]
      );
      
      // Check if within 5km for upcoming notification
      if (distance <= 5 && distance > 1) {
        onNotification({
          id: `upcoming-${bunk.id}`,
          type: 'upcoming',
          title: 'Fill fuel, station coming soon',
          message: `${bunk.name}, ${bunk.address}`,
          timestamp: new Date()
        });
        processedBunks.add(`upcoming-${bunk.id}`);
      }
      
      // Check if within 1km for arrived notification
      if (distance <= 1) {
        onNotification({
          id: `arrived-${bunk.id}`,
          type: 'arrived',
          title: 'Fill fuel, as station is arrived',
          message: `${bunk.name}, ${bunk.address}`,
          timestamp: new Date()
        });
        processedBunks.add(bunk.id);
      }
    });
  };
  
  // Function to update position
  const updatePosition = () => {
    if (currentIndex >= route.points.length - 1) {
      stop();
      onNotification({
        id: `journey-complete-${Date.now()}`,
        type: 'initial',
        title: 'Journey Completed',
        message: 'You have reached your destination!',
        timestamp: new Date()
      });
      return;
    }
    
    const point = route.points[currentIndex];
    currentPosition = {
      lat: point.lat,
      lng: point.lng,
      state: point.state,
      distanceFromStart: point.distanceFromStart,
      index: currentIndex
    };
    
    // Check proximity to petrol bunks
    checkBunkProximity(currentPosition);
    
    // Notify about position update
    onPositionUpdate(currentPosition);
    
    // Calculate time to next point based on speed
    const timeStep = calculateTimeStep();
    
    // Move to next point
    currentIndex++;
    
    // Schedule next update
    setTimeout(updatePosition, timeStep);
  };
  
  // Calculate time step based on speed and distance to next point
  const calculateTimeStep = (): number => {
    if (currentIndex >= route.points.length - 1) return 0;
    
    const currentPoint = route.points[currentIndex];
    const nextPoint = route.points[currentIndex + 1];
    
    const distance = calculateDistance(
      currentPoint.lat, 
      currentPoint.lng, 
      nextPoint.lat, 
      nextPoint.lng
    );
    
    // Convert km/h to ms for the given distance
    // distance (km) / speed (km/h) * 3600000 (ms/h)
    const timeInMs = (distance / options.speed) * 3600000;
    
    // Use simulated speed - much faster for demo purposes
    return Math.max(500, Math.min(timeInMs / 100, 2000));
  };
  
  // Start the simulation
  const start = () => {
    if (running) return;
    
    running = true;
    currentIndex = 0;
    processedBunks.clear();
    
    // Initial notification
    onNotification({
      id: `journey-start-${Date.now()}`,
      type: 'initial',
      title: 'Journey Started',
      message: 'FuelSaver will travel with you',
      timestamp: new Date()
    });
    
    // Start position updates
    updatePosition();
  };
  
  // Pause the simulation
  const pause = () => {
    running = false;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };
  
  // Resume the simulation
  const resume = () => {
    if (running || !currentPosition) return;
    running = true;
    updatePosition();
  };
  
  // Stop the simulation
  const stop = () => {
    running = false;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    currentIndex = 0;
    currentPosition = null;
  };
  
  return {
    start,
    pause,
    resume,
    stop,
    get isRunning() { return running; },
    get currentPosition() { return currentPosition; }
  };
};
