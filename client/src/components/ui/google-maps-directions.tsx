import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface GoogleMapsDirectionsProps {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

export const GoogleMapsDirections: React.FC<GoogleMapsDirectionsProps> = ({ 
  address, 
  coordinates, 
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  // Format the address for Google Maps
  const formatAddress = () => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  };

  // Generate Google Maps directions URL
  const getDirectionsUrl = () => {
    const formattedAddress = formatAddress();
    const encodedAddress = encodeURIComponent(formattedAddress);
    
    if (coordinates) {
      // Use coordinates for more precise location
      return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    } else {
      // Use address
      return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }
  };

  // Generate Google Maps view URL (for viewing location without directions)
  const getViewLocationUrl = () => {
    const formattedAddress = formatAddress();
    const encodedAddress = encodeURIComponent(formattedAddress);
    
    if (coordinates) {
      return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
    } else {
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }
  };

  const handleGetDirections = () => {
    window.open(getDirectionsUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleViewOnMap = () => {
    window.open(getViewLocationUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <Button
        onClick={handleGetDirections}
        variant={variant}
        size={size}
        className="flex items-center justify-center"
      >
        <Navigation className="h-4 w-4 mr-2" />
        Get Directions
        <ExternalLink className="h-3 w-3 ml-2" />
      </Button>
      
      <Button
        onClick={handleViewOnMap}
        variant="outline"
        size={size}
        className="flex items-center justify-center"
      >
        <MapPin className="h-4 w-4 mr-2" />
        View on Map
        <ExternalLink className="h-3 w-3 ml-2" />
      </Button>
    </div>
  );
};

// Alternative compact version for smaller spaces
export const CompactDirectionsButton: React.FC<GoogleMapsDirectionsProps> = ({ 
  address, 
  coordinates, 
  className = ''
}) => {
  const formatAddress = () => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  };

  const getDirectionsUrl = () => {
    const formattedAddress = formatAddress();
    const encodedAddress = encodeURIComponent(formattedAddress);
    
    if (coordinates) {
      return `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    }
  };

  const handleGetDirections = () => {
    window.open(getDirectionsUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleGetDirections}
      variant="outline"
      size="sm"
      className={`flex items-center ${className}`}
    >
      <Navigation className="h-4 w-4 mr-2" />
      Directions
      <ExternalLink className="h-3 w-3 ml-1" />
    </Button>
  );
};