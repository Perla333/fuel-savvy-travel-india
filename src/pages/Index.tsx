
import React, { useState, useRef } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import RouteForm, { RouteFormData } from '@/components/RouteForm';
import RouteMap, { RouteMapRef } from '@/components/RouteMap';
import ResultsPanel from '@/components/ResultsPanel';
import Chatbot from '@/components/Chatbot';
import { Route, getRoute } from '@/utils/routing';
import { FuelPlan, calculateFuelPlan } from '@/utils/fuelCalculator';
import { Fuel, MapPin, Route as RouteIcon, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import JourneyNotifications from '@/components/JourneyNotifications';
import { 
  createJourneySimulator, 
  JourneyNotification, 
  JourneyPosition 
} from '@/utils/journeySimulation';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);
  const [fuelPlan, setFuelPlan] = useState<FuelPlan | null>(null);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('diesel');
  const [notifications, setNotifications] = useState<JourneyNotification[]>([]);
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<JourneyPosition | null>(null);
  
  const mapRef = useRef<any>(null);
  const simulatorRef = useRef<any>(null);
  const routeMapRef = useRef<RouteMapRef>(null);

  const handleFormSubmit = async (formData: RouteFormData) => {
    setIsLoading(true);
    setFuelType(formData.fuelType);
    
    // Reset state for new route calculation
    setNotifications([]);
    setIsJourneyActive(false);
    if (simulatorRef.current) {
      simulatorRef.current.stop();
      simulatorRef.current = null;
    }
    
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
      
      // Add initial notification
      addNotification({
        id: `route-calculated-${Date.now()}`,
        type: 'initial',
        title: 'Route Calculated',
        message: 'FuelSaver will travel with you',
        timestamp: new Date()
      });
      
      toast.success("Route calculated successfully!");
    } catch (error) {
      console.error("Error calculating route:", error);
      toast.error("Failed to calculate route. Please check your inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const addNotification = (notification: JourneyNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep max 10 notifications
  };
  
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const startJourneySimulation = () => {
    if (!route || !fuelPlan) {
      toast.error("Please calculate a route first");
      return;
    }
    
    // Create journey simulator
    simulatorRef.current = createJourneySimulator(
      route,
      fuelPlan.refuelPoints,
      (position) => {
        setCurrentPosition(position);
        // Update driver marker on map
        if (routeMapRef.current?.addDriverMarker) {
          routeMapRef.current.addDriverMarker([position.lat, position.lng]);
        }
      },
      addNotification
    );
    
    // Start journey
    simulatorRef.current.start();
    setIsJourneyActive(true);
  };
  
  const stopJourneySimulation = () => {
    if (simulatorRef.current) {
      simulatorRef.current.stop();
      setIsJourneyActive(false);
      setCurrentPosition(null);
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
            
            {/* Notifications Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Notifications</h2>
                {route && !isJourneyActive && (
                  <Button 
                    onClick={startJourneySimulation} 
                    className="bg-highlight hover:bg-highlight/90"
                    disabled={isLoading || isJourneyActive}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Journey
                  </Button>
                )}
                {isJourneyActive && (
                  <Button 
                    onClick={stopJourneySimulation} 
                    variant="outline"
                  >
                    Stop Journey
                  </Button>
                )}
              </div>
              <JourneyNotifications 
                notifications={notifications}
                onDismissNotification={dismissNotification}
              />
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
                  ref={routeMapRef}
                  route={route}
                  refuelPoints={fuelPlan?.refuelPoints || []}
                  alerts={fuelPlan?.alerts || []}
                  fuelType={fuelType}
                />
              </div>
              {/* Journey Progress */}
              {isJourneyActive && currentPosition && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md text-sm">
                  <div className="flex justify-between">
                    <span>Current State: <strong>{currentPosition.state}</strong></span>
                    <span>Distance: <strong>{Math.round(currentPosition.distanceFromStart)} km</strong></span>
                  </div>
                </div>
              )}
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
