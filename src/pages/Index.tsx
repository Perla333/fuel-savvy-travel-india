
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import RouteForm, { RouteFormData } from '@/components/RouteForm';
import RouteMap from '@/components/RouteMap';
import ResultsPanel from '@/components/ResultsPanel';
import Chatbot from '@/components/Chatbot';
import { Route, getRoute } from '@/utils/routing';
import { FuelPlan, calculateFuelPlan } from '@/utils/fuelCalculator';
import { Fuel, MapPin, Route as RouteIcon } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);
  const [fuelPlan, setFuelPlan] = useState<FuelPlan | null>(null);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('diesel');

  const handleFormSubmit = async (formData: RouteFormData) => {
    setIsLoading(true);
    setFuelType(formData.fuelType);
    
    try {
      // Calculate route
      const routeData = await getRoute(
        formData.startLocation,
        formData.endLocation,
        formData.mileage
      );
      
      setRoute(routeData);
      
      // Calculate fuel plan
      const fuelPlanData = calculateFuelPlan(
        routeData,
        formData.fuelType,
        formData.tankCapacity,
        formData.currentFuel
      );
      
      setFuelPlan(fuelPlanData);
      
      toast.success("Route calculated successfully!");
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error("Failed to calculate route. Please check your inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-primary-800 text-white py-4 px-6 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <Fuel className="mr-2 h-6 w-6" />
                FuelSaver
              </h1>
              <p className="text-primary-100 text-sm">Optimize refueling costs for truckers in India</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>India</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <RouteIcon className="mr-2 h-5 w-5" />
                Trip Details
              </h2>
              <RouteForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
            
            {/* Results Panel (visible on mobile, hidden on desktop) */}
            <div className="lg:hidden">
              {(route || isLoading) && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Trip Results</h2>
                  <ResultsPanel 
                    route={route} 
                    fuelPlan={fuelPlan}
                    fuelType={fuelType}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Route Map</h2>
              <div className="h-[400px] bg-white rounded-lg shadow-md overflow-hidden">
                <RouteMap 
                  route={route}
                  refuelPoints={fuelPlan?.refuelPoints || []}
                  alerts={fuelPlan?.alerts || []}
                  fuelType={fuelType}
                />
              </div>
            </div>
            
            {/* Results Panel (hidden on mobile, visible on desktop) */}
            <div className="hidden lg:block">
              {(route || isLoading) && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Trip Results</h2>
                  <ResultsPanel 
                    route={route} 
                    fuelPlan={fuelPlan}
                    fuelType={fuelType}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t py-6 px-4">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          <p>© 2025 FuelSaver - Helping truck drivers save on fuel costs across India</p>
          <p className="mt-2">Fuel prices updated as of May 2025</p>
        </div>
      </footer>
      
      {/* Chatbot */}
      <Chatbot route={route} fuelType={fuelType} />
    </div>
  );
};

export default Index;
