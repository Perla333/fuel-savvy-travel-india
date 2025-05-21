
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JourneyNotification {
  id: string;
  type: 'initial' | 'upcoming' | 'arrived' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
}

interface JourneyNotificationsProps {
  notifications: JourneyNotification[];
  onDismissNotification: (id: string) => void;
}

const JourneyNotifications: React.FC<JourneyNotificationsProps> = ({
  notifications,
  onDismissNotification
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3 my-3">
      {notifications.map((notification) => {
        // Determine alert variant based on notification type
        let variant = "default";
        if (notification.type === 'initial') variant = "default";
        else if (notification.type === 'upcoming') variant = "info";
        else if (notification.type === 'arrived') variant = "warning";
        else if (notification.type === 'alert') variant = "destructive";
        
        return (
          <Alert key={notification.id} variant={variant as any} className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2" 
              onClick={() => onDismissNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
            <div className="text-xs text-muted-foreground mt-1">
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </Alert>
        );
      })}
    </div>
  );
};

export default JourneyNotifications;
