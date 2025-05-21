
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export interface RouteFormData {
  startLocation: string;
  endLocation: string;
  mileage: number;
  tankCapacity: number;
  currentFuel: number;
  fuelType: 'petrol' | 'diesel';
}

interface RouteFormProps {
  onSubmit: (data: RouteFormData) => void;
  isLoading: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<RouteFormData>({
    startLocation: '',
    endLocation: '',
    mileage: 4,
    tankCapacity: 200,
    currentFuel: 50,
    fuelType: 'diesel'
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | 
    { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = e.target;
    
    // Convert number inputs
    const numericFields = ['mileage', 'tankCapacity', 'currentFuel'];
    const processedValue = numericFields.includes(name) ? Number(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleFuelTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      fuelType: value as 'petrol' | 'diesel'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startLocation">Start Location</Label>
            <Input
              id="startLocation"
              name="startLocation"
              placeholder="e.g. Hyderabad, Telangana"
              value={formData.startLocation}
              onChange={handleChange}
              required
              className="border-primary-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endLocation">End Location</Label>
            <Input
              id="endLocation"
              name="endLocation"
              placeholder="e.g. Delhi, Delhi"
              value={formData.endLocation}
              onChange={handleChange}
              required
              className="border-primary-200"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mileage">Truck Mileage (km/L)</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="4"
                value={formData.mileage}
                onChange={handleChange}
                required
                className="border-primary-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tankCapacity">Fuel Tank Capacity (L)</Label>
              <Input
                id="tankCapacity"
                name="tankCapacity"
                type="number"
                min="1"
                placeholder="200"
                value={formData.tankCapacity}
                onChange={handleChange}
                required
                className="border-primary-200"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentFuel">Current Fuel Level (L)</Label>
              <Input
                id="currentFuel"
                name="currentFuel"
                type="number"
                min="0"
                placeholder="50"
                value={formData.currentFuel}
                onChange={handleChange}
                required
                className="border-primary-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select 
                value={formData.fuelType} 
                onValueChange={handleFuelTypeChange}
              >
                <SelectTrigger id="fuelType" className="border-primary-200">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="petrol">Petrol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-highlight hover:bg-highlight/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                Calculating...
              </span>
            ) : (
              <span className="flex items-center">
                Calculate Route & Fuel Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RouteForm;
