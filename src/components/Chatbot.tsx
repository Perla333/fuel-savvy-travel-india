
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Route } from '../utils/routing';
import { PetrolBunk, getPetrolBunksByState } from '../data/petrolBunks';
import { getFuelPriceByState } from '../data/fuelPrices';

interface Message {
  text: string;
  isUser: boolean;
}

interface ChatbotProps {
  route: Route | null;
  fuelType: 'petrol' | 'diesel';
}

const Chatbot: React.FC<ChatbotProps> = ({ route, fuelType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your FuelSaver assistant. Ask me about your journey, fuel prices, or petrol bunks.", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (input.trim()) {
      setMessages(prev => [...prev, { text: input, isUser: true }]);
      processMessage(input);
      setInput('');
    }
  };

  const processMessage = (message: string) => {
    const lowerMsg = message.toLowerCase();
    let response = "I'm sorry, I don't have information about that. Try asking about fuel prices, petrol bunks, or journey details.";
    
    // Handle general greetings
    if (lowerMsg.match(/^(hi|hello|hey|namaste)/)) {
      response = "Hello! How can I help you with your journey today?";
    }
    // Petrol bunk queries
    else if (lowerMsg.includes('petrol bunk') || lowerMsg.includes('gas station') || lowerMsg.includes('fuel station')) {
      // Extract state name from message
      const states = route?.states || [];
      const mentionedState = states.find(state => lowerMsg.includes(state.toLowerCase()));
      
      if (mentionedState) {
        const bunks = getPetrolBunksByState(mentionedState);
        if (bunks.length > 0) {
          response = `Here are some petrol bunks in ${mentionedState}:\n\n` + 
            bunks.map(bunk => `${bunk.brand} - ${bunk.name}\n${bunk.address}\n${bunk.hours}\nPhone: ${bunk.phone}`).join('\n\n');
        } else {
          response = `I don't have information about specific petrol bunks in ${mentionedState}.`;
        }
      } else {
        response = "Please specify which state you're looking for petrol bunks in. For example: 'Petrol bunks in Telangana'";
      }
    }
    // Fuel price queries
    else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      const fuelTypeMatch = lowerMsg.includes('diesel') ? 'diesel' : lowerMsg.includes('petrol') ? 'petrol' : fuelType;
      const states = route?.states || [];
      const mentionedState = states.find(state => lowerMsg.includes(state.toLowerCase()));
      
      if (mentionedState) {
        const statePrice = getFuelPriceByState(mentionedState);
        if (statePrice) {
          const price = fuelTypeMatch === 'diesel' ? statePrice.diesel : statePrice.petrol;
          response = `The ${fuelTypeMatch} price in ${mentionedState} is ₹${price} per liter.`;
        }
      } else if (lowerMsg.includes('all state')) {
        response = "Here are the current fuel prices in all states along your route:\n\n";
        for (const state of route?.states || []) {
          const statePrice = getFuelPriceByState(state);
          if (statePrice) {
            const price = fuelTypeMatch === 'diesel' ? statePrice.diesel : statePrice.petrol;
            response += `${state}: ₹${price}/L for ${fuelTypeMatch}\n`;
          }
        }
      } else {
        response = "Please specify which state you're asking about. For example: 'Diesel price in Telangana'";
      }
    }
    // Distance queries
    else if (lowerMsg.includes('distance')) {
      if (route) {
        if (lowerMsg.includes('total')) {
          response = `The total journey distance is ${route.totalDistance.toFixed(1)} kilometers.`;
        } else {
          const states = route.states;
          for (let i = 0; i < states.length - 1; i++) {
            if (lowerMsg.includes(states[i].toLowerCase()) && lowerMsg.includes(states[i + 1].toLowerCase())) {
              const segment = route.segments.find(s => 
                s.startState.toLowerCase() === states[i].toLowerCase() && 
                s.endState.toLowerCase() === states[i + 1].toLowerCase()
              );
              
              if (segment) {
                response = `The distance from ${states[i]} to ${states[i + 1]} is approximately ${segment.distance.toFixed(1)} kilometers.`;
              }
            }
          }
        }
      } else {
        response = "Please calculate a route first to get distance information.";
      }
    }
    // Fuel needs queries
    else if (lowerMsg.includes('fuel') && (lowerMsg.includes('need') || lowerMsg.includes('require'))) {
      if (route) {
        if (lowerMsg.includes('total')) {
          response = `The total fuel needed for the journey is approximately ${route.totalFuelNeeded.toFixed(1)} liters.`;
        } else {
          const states = route.states;
          for (let i = 0; i < states.length - 1; i++) {
            if (lowerMsg.includes(states[i].toLowerCase()) && lowerMsg.includes(states[i + 1].toLowerCase())) {
              const segment = route.segments.find(s => 
                s.startState.toLowerCase() === states[i].toLowerCase() && 
                s.endState.toLowerCase() === states[i + 1].toLowerCase()
              );
              
              if (segment) {
                response = `You need approximately ${segment.fuelNeeded.toFixed(1)} liters of fuel to travel from ${states[i]} to ${states[i + 1]}.`;
              }
            }
          }
        }
      } else {
        response = "Please calculate a route first to get fuel requirement information.";
      }
    }
    // Travel time queries (estimated)
    else if (lowerMsg.includes('time') || lowerMsg.includes('how long')) {
      if (route) {
        const avgSpeed = 50; // km/h
        
        if (lowerMsg.includes('total')) {
          const totalTimeHours = route.totalDistance / avgSpeed;
          const hours = Math.floor(totalTimeHours);
          const minutes = Math.floor((totalTimeHours - hours) * 60);
          response = `Estimated travel time for the entire journey is ${hours} hours and ${minutes} minutes at an average speed of ${avgSpeed} km/h.`;
        } else {
          const states = route.states;
          for (let i = 0; i < states.length - 1; i++) {
            if (lowerMsg.includes(states[i].toLowerCase()) && lowerMsg.includes(states[i + 1].toLowerCase())) {
              const segment = route.segments.find(s => 
                s.startState.toLowerCase() === states[i].toLowerCase() && 
                s.endState.toLowerCase() === states[i + 1].toLowerCase()
              );
              
              if (segment) {
                const timeHours = segment.distance / avgSpeed;
                const hours = Math.floor(timeHours);
                const minutes = Math.floor((timeHours - hours) * 60);
                response = `Estimated travel time from ${states[i]} to ${states[i + 1]} is ${hours} hours and ${minutes} minutes at an average speed of ${avgSpeed} km/h.`;
              }
            }
          }
        }
      } else {
        response = "Please calculate a route first to get travel time estimates.";
      }
    }
    // States crossed
    else if (lowerMsg.includes('state') && (lowerMsg.includes('cross') || lowerMsg.includes('pass'))) {
      if (route && route.states.length > 0) {
        response = `Your journey crosses through these states: ${route.states.join(', ')}.`;
      } else {
        response = "Please calculate a route first to see which states you'll cross.";
      }
    }
    
    // Add response with slight delay to simulate thinking
    setTimeout(() => {
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[350px] md:w-[400px] shadow-lg">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3 pb-3 border-b">
              <div className="font-semibold flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                FuelSaver Assistant
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
            
            <div className="h-[300px] overflow-y-auto mb-3 space-y-3">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`${
                      msg.isUser 
                        ? 'bg-primary-700 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    } p-3 rounded-lg max-w-[80%] whitespace-pre-wrap`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Ask about your journey..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">Send</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full h-14 w-14 shadow-lg bg-highlight hover:bg-highlight/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default Chatbot;
