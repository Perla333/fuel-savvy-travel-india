
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, AlertTriangle, Info, Bell } from "lucide-react";
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
        // Get appropriate icon based on notification type
        let NotificationIcon = Info;
        let variantClass = "bg-background text-foreground border";
        
        // Set appropriate styling based on notification type
        if (notification.type === 'initial') {
          NotificationIcon = Bell;
          variantClass = "bg-background text-foreground border";
        } else if (notification.type === 'upcoming') {
          NotificationIcon = Info;
          variantClass = "bg-blue-50 border-blue-200 text-blue-800";
        } else if (notification.type === 'arrived') {
          NotificationIcon = Bell;
          variantClass = "bg-yellow-50 border-yellow-200 text-yellow-800";
        } else if (notification.type === 'alert') {
          NotificationIcon = AlertTriangle;
          variantClass = "bg-red-50 border-red-200 text-red-800";
        }
        
        return (
          <Alert 
            key={notification.id} 
            className={`relative ${variantClass}`}
            role="alert"
            aria-live="polite"
          >
            <NotificationIcon className="h-4 w-4 absolute left-4 top-4" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-2" 
              onClick={() => onDismissNotification(notification.id)}
              aria-label="Dismiss notification"
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
