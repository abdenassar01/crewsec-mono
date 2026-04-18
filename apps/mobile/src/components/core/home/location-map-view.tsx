import React from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

const DEFAULT_REGION = {
  latitude: 59.27104971010331,
  longitude: 17.95408638834324,
  latitudeDelta: 1,
  longitudeDelta: 1,
};

interface LocationMapViewProps {
  coordinates?: { longitude: number; latitude: number };
  showsUserLocation?: boolean;
  title?: string;
}

export function LocationMapView({
  coordinates,
  showsUserLocation = true,
  title,
}: LocationMapViewProps) {
  const region = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : DEFAULT_REGION;

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={{ flex: 1 }}
      region={region}
      showsUserLocation={showsUserLocation}
      followsUserLocation={showsUserLocation}
    >
      {coordinates && (
        <Marker
          coordinate={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }}
          title={title}
        />
      )}
    </MapView>
  );
}
