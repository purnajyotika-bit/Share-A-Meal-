import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ lat, lng }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (lat && lng) {
      const key = `${lat},${lng}`;
      if (prevRef.current !== key) {
        prevRef.current = key;
        map.flyTo([lat, lng], 16, { duration: 1 });
      }
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPickerMap({ lat, lng, onLocationSelect, hint }) {
  const center = lat && lng ? [lat, lng] : [20.5937, 78.9629]; // India center
  const zoom = lat && lng ? 16 : 5;

  return (
    <div className="relative">
      {hint && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-black/70 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none whitespace-nowrap">
          {hint}
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full rounded-lg z-0"
        style={{ height: '260px' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ClickHandler onLocationSelect={onLocationSelect} />
        {lat && lng && (
          <>
            <Marker position={[lat, lng]} icon={redIcon} />
            <FlyTo lat={lat} lng={lng} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
