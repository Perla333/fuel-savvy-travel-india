
import { Route, RouteSegment } from './routing';
import { fuelPrices, getFuelPriceByState } from '../data/fuelPrices';
import { petrolBunks, PetrolBunk, getPetrolBunksByState } from '../data/petrolBunks';

export interface RefuelPoint {
  state: string;
  amount: number; // liters
  price: number; // per liter
  totalCost: number;
  bunks: PetrolBunk[];
}

export interface StateAlert {
  fromState: string;
  toState: string;
  message: string;
  action: 'fill' | 'wait' | 'neutral';
  savings: number;
}

export interface FuelPlan {
  refuelPoints: RefuelPoint[];
  alerts: StateAlert[];
  totalCost: number;
  isFeasible: boolean;
  errorMessage?: string;
}

export const calculateFuelPlan = (
  route: Route,
  fuelType: 'petrol' | 'diesel',
  tankCapacity: number,
  currentFuel: number
): FuelPlan => {
  const refuelPoints: RefuelPoint[] = [];
  const alerts: StateAlert[] = [];
  let totalCost = 0;
  let remainingFuel = currentFuel;
  
  // Check if the journey is feasible based on max segment distance
  const maxSegmentDistance = route.segments.reduce(
    (max, segment) => Math.max(max, segment.distance), 0
  );
  
  const maxSegmentFuel = maxSegmentDistance / (route.totalDistance / route.totalFuelNeeded);
  
  if (maxSegmentFuel > tankCapacity) {
    return {
      refuelPoints: [],
      alerts: [],
      totalCost: 0,
      isFeasible: false,
      errorMessage: `Journey not feasible. Longest segment requires ${maxSegmentFuel.toFixed(1)} liters, but tank capacity is only ${tankCapacity} liters.`
    };
  }
  
  // Process each segment of the route
  let currentState = route.points[0].state;
  let prevState = "";
  
  route.segments.forEach((segment, i) => {
    currentState = segment.startState;
    const fuelNeededForSegment = segment.fuelNeeded;
    
    // Check if we need to refuel
    if (remainingFuel < fuelNeededForSegment) {
      const currentStatePrice = getFuelPriceByState(currentState);
      const nextStatePrice = getFuelPriceByState(segment.endState);
      
      if (!currentStatePrice || !nextStatePrice) {
        return; // Skip if pricing data is missing
      }
      
      const currentPrice = fuelType === 'diesel' ? currentStatePrice.diesel : currentStatePrice.petrol;
      const nextPrice = fuelType === 'diesel' ? nextStatePrice.diesel : nextStatePrice.petrol;
      
      let refuelAmount = 0;
      let alertMessage = "";
      let alertAction: 'fill' | 'wait' | 'neutral' = 'neutral';
      let potentialSavings = 0;
      
      // Compare prices to determine refueling strategy
      if (currentPrice <= nextPrice) {
        // Current state has cheaper fuel, fill up
        refuelAmount = tankCapacity - remainingFuel;
        alertMessage = `Fill tank in ${currentState} before entering ${segment.endState}`;
        alertAction = 'fill';
        potentialSavings = (nextPrice - currentPrice) * refuelAmount;
      } else {
        // Next state has cheaper fuel, refuel only what's needed to reach it
        refuelAmount = fuelNeededForSegment - remainingFuel + 5; // Add 5L as buffer
        if (refuelAmount > 0) {
          alertMessage = `Refuel minimally in ${currentState} (${refuelAmount.toFixed(1)}L) and wait for cheaper fuel in ${segment.endState}`;
          alertAction = 'wait';
          potentialSavings = (currentPrice - nextPrice) * (tankCapacity - fuelNeededForSegment);
        }
      }
      
      // Add refueling point if amount is positive
      if (refuelAmount > 0) {
        const stateBunks = getPetrolBunksByState(currentState);
        
        const refuelPoint: RefuelPoint = {
          state: currentState,
          amount: refuelAmount,
          price: currentPrice,
          totalCost: refuelAmount * currentPrice,
          bunks: stateBunks
        };
        
        refuelPoints.push(refuelPoint);
        totalCost += refuelPoint.totalCost;
        remainingFuel += refuelAmount;
      }
      
      // Add border crossing alert
      if (alertAction !== 'neutral' && potentialSavings > 0) {
        alerts.push({
          fromState: currentState,
          toState: segment.endState,
          message: `${alertMessage} to save ₹${potentialSavings.toFixed(2)}`,
          action: alertAction,
          savings: potentialSavings
        });
      }
    }
    
    // Consume fuel for this segment
    remainingFuel -= fuelNeededForSegment;
    prevState = currentState;
  });
  
  // If this is the last segment and we have a different ending state, check once more
  const lastPoint = route.points[route.points.length - 1];
  if (lastPoint.state !== currentState) {
    const lastStatePrice = getFuelPriceByState(lastPoint.state);
    
    if (lastStatePrice) {
      const bunks = getPetrolBunksByState(lastPoint.state);
      
      if (bunks.length > 0) {
        // Just add these bunks as options without refueling calculations
        refuelPoints.push({
          state: lastPoint.state,
          amount: 0, // No specific refuel amount
          price: fuelType === 'diesel' ? lastStatePrice.diesel : lastStatePrice.petrol,
          totalCost: 0,
          bunks: bunks
        });
      }
    }
  }
  
  return {
    refuelPoints,
    alerts,
    totalCost,
    isFeasible: true
  };
};
