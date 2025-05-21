
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Route } from '../utils/routing';
import { getFuelPriceByState } from '../data/fuelPrices';
import { FuelPlan, RefuelPoint, StateAlert } from '../utils/fuelCalculator';

interface ResultsPanelProps {
  route: Route | null;
  fuelPlan: FuelPlan | null;
  fuelType: 'petrol' | 'diesel';
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ route, fuelPlan, fuelType }) => {
  if (!route) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Enter your trip details to see fuel optimization recommendations
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fuelPlan && !fuelPlan.isFeasible) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500 font-medium">
            {fuelPlan.errorMessage || "Trip not feasible with current parameters"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Distance and Fuel Summary */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Trip Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-accent rounded-md p-3">
              <div className="text-sm text-gray-600">Total Distance</div>
              <div className="text-xl font-bold">{route.totalDistance.toFixed(1)} km</div>
            </div>
            <div className="bg-accent rounded-md p-3">
              <div className="text-sm text-gray-600">Fuel Required</div>
              <div className="text-xl font-bold">{route.totalFuelNeeded.toFixed(1)} liters</div>
            </div>
          </div>
        </div>
        
        {/* States Crossed */}
        <div>
          <h3 className="text-xl font-semibold mb-2">States Crossed</h3>
          <div className="space-y-2">
            {route.states.map((state, index) => {
              const statePrice = getFuelPriceByState(state);
              const price = statePrice 
                ? (fuelType === 'diesel' ? statePrice.diesel : statePrice.petrol) 
                : 'N/A';
                
              return (
                <div 
                  key={`state-${index}`} 
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                >
                  <span>{state}</span>
                  <span className="font-medium">
                    {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}: ₹{price}/L
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Refueling Plan */}
        {fuelPlan && fuelPlan.refuelPoints.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">Refueling Plan</h3>
            <div className="space-y-4">
              {fuelPlan.refuelPoints.map((point, index) => (
                <div key={`refuel-${index}`} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-lg">{point.state}</h4>
                    <span className="bg-primary-50 text-primary-800 px-2 py-1 rounded text-sm">
                      {point.amount > 0 ? `${point.amount.toFixed(1)}L @ ₹${point.price.toFixed(2)}/L` : 'Optional Stop'}
                    </span>
                  </div>
                  
                  {point.amount > 0 && (
                    <div className="text-sm text-gray-700 mb-2">
                      Total cost: <span className="font-semibold">₹{point.totalCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {point.bunks.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium mb-1">Recommended Petrol Bunks:</h5>
                      <ul className="space-y-2">
                        {point.bunks.slice(0, 2).map((bunk, i) => (
                          <li key={bunk.id} className="text-xs bg-white p-2 rounded border border-gray-100">
                            <div className="font-medium">{bunk.brand} - {bunk.name}</div>
                            <div className="text-gray-600">{bunk.address}</div>
                            <div className="flex justify-between mt-1">
                              <span>{bunk.hours}</span>
                              <a href={`tel:${bunk.phone}`} className="text-primary-600 underline">{bunk.phone}</a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Border Crossing Alerts */}
        {fuelPlan && fuelPlan.alerts.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-2">State Border Alerts</h3>
            <div className="space-y-2">
              {fuelPlan.alerts.map((alert, index) => {
                const alertColor = alert.action === 'fill' ? 'bg-green-50 border-green-200 text-green-800' : 
                                  alert.action === 'wait' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                  'bg-gray-50 border-gray-200 text-gray-800';
                
                return (
                  <div 
                    key={`alert-${index}`} 
                    className={`p-3 rounded-md border ${alertColor}`}
                  >
                    <div className="flex items-start">
                      <span className="mr-2">
                        {alert.action === 'fill' ? '⛽' : alert.action === 'wait' ? '⏱️' : 'ℹ️'}
                      </span>
                      <span>{alert.message}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Total Cost */}
        {fuelPlan && (
          <div className="bg-primary-700 text-white p-4 rounded-lg">
            <div className="text-sm mb-1">Total Fuel Cost</div>
            <div className="text-2xl font-bold">₹{fuelPlan.totalCost.toFixed(2)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsPanel;
