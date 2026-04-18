'use client';

import { useEffect, useState } from 'react';
import { Map, MapMarker, MarkerContent, MapControls } from '@/components/ui/map';

interface ParkingMapProps {
  location?: string;
  address?: string;
  className?: string;
}

// Simple coordinate parser - handles various formats
function parseCoordinates(location: string): { lat: number; lng: number } | null {
  // Remove all whitespace
  const cleaned = location.replace(/\s+/g, '');

  // Try different coordinate formats
  const patterns = [
    // lat,lng or lng,lat with comma
    /^(-?\d+\.?\d*),(-?\d+\.?\d*)$/,
    // lat lng (space separated)
    /^(-?\d+\.?\d+)\s+(-?\d+\.?\d*)$/,
    // Decimal degrees format
    /^(\d{1,3})°(\d{1,2})['']?(\d{1,2}(?:\.\d+)?)?["']?\s*([NS])\s*(\d{1,3})°(\d{1,2})['']?(\d{1,2}(?:\.\d+)?)?["']?\s*([EW])$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      if (match.length === 3) {
        // Simple comma or space separated: lat,lng or lng,lat
        const first = parseFloat(match[1]);
        const second = parseFloat(match[2]);

        // Sweden coordinates are roughly: latitude 55-70, longitude 11-24
        // Use this to determine order
        if (first >= 55 && first <= 70 && second >= 11 && second <= 24) {
          return { lat: first, lng: second };
        } else if (second >= 55 && second <= 70 && first >= 11 && first <= 24) {
          return { lat: second, lng: first };
        } else {
          // Default to lat,lng format
          return { lat: first, lng: second };
        }
      }
    }
  }

  return null;
}

// Default Sweden coordinates (Stockholm area)
const DEFAULT_SWEDEN_COORDS = { lat: 59.3293, lng: 18.0686 };

export function ParkingMap({ location, address, className = '' }: ParkingMapProps) {
  const [coords, setCoords] = useState(DEFAULT_SWEDEN_COORDS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getCoordinates() {
      setIsLoading(true);

      // First, try to parse the location as coordinates
      if (location) {
        const parsed = parseCoordinates(location);
        if (parsed) {
          setCoords(parsed);
          setIsLoading(false);
          return;
        }
      }

      // If no coordinates found, use Nominatim (OpenStreetMap) to geocode
      const searchQuery = location || address;
      if (searchQuery) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Sweden')}&limit=1`,
            {
              headers: {
                'User-Agent': 'Crewsec-Parking-App',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              setCoords({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Geocoding failed:', error);
        }
      }

      // Fallback to default Sweden coordinates
      setCoords(DEFAULT_SWEDEN_COORDS);
      setIsLoading(false);
    }

    getCoordinates();
  }, [location, address]);

  if (isLoading) {
    return (
      <div className={`bg-muted rounded-2xl animate-pulse ${className}`} style={{ minHeight: '300px' }} />
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden border border-border ${className}`} style={{ minHeight: '300px' }}>
      <div style={{ height: '300px' }}>
        <Map
          center={[coords.lng, coords.lat]}
          zoom={14}
        >
        <MapMarker longitude={coords.lng} latitude={coords.lat}>
          <MarkerContent>
            <div className="relative">
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-blue-500/20 rounded-full animate-ping" />
              <svg
                className="relative w-8 h-8 text-blue-600 drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </MarkerContent>
        </MapMarker>
        <MapControls showZoom showLocate />
      </Map>
      </div>
    </div>
  );
}
