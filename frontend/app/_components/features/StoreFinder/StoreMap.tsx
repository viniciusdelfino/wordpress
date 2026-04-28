'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type * as LeafletNS from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store } from '@/app/types/store-types';

interface StoreMapProps {
  stores: Store[];
  center: { lat: number; lng: number };
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

export default function StoreMap({
  stores,
  center,
  selectedStore,
  onSelectStore
}: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletNS.Map | null>(null);
  const markersRef = useRef<LeafletNS.Marker[]>([]);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create marker icon HTML (matches previous Google Maps marker visual)
  const createIconHtml = useCallback((isSelected: boolean) => {
    return `
      <div style="
        width: 32px;
        height: 40px;
        position: relative;
        cursor: pointer;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transform-origin: center bottom;
        transition: transform 0.2s ease;
      ">
        <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${isSelected ? '#d0000a' : '#001450'}"/>
          <circle cx="16" cy="14" r="6" fill="white"/>
        </svg>
      </div>
    `;
  }, []);

  // Create popup content with "Como chegar" button
  const createPopupContent = useCallback((store: Store) => {
    const displayName = store.fantasyName || store.name;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

    return `
      <div style="padding: 4px; min-width: 220px; max-width: 300px;">
        <h4 style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #001450;">
          ${displayName}
        </h4>
        <a
          href="${directionsUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 10px 16px;
            background-color: #d0000a;
            color: white;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" fill="currentColor"/>
          </svg>
          Como chegar
        </a>
      </div>
    `;
  }, []);

  // Initialize map (dynamic import to avoid SSR window access)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const L = (await import('leaflet')).default;
        if (!mounted || !mapRef.current || mapInstanceRef.current) return;

        leafletRef.current = L;

        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: 12,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsLoaded(true);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load map');
        }
      }
    })();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.panTo([center.lat, center.lng]);
      mapInstanceRef.current.setZoom(12);
    }
  }, [center]);

  // Update markers when stores change
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!isLoaded || !L || !map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current = [];

    // Filter stores with valid coordinates
    const validStores = stores.filter(
      (s) => s.lat != null && s.lng != null && s.lat !== 0 && s.lng !== 0
    );

    // Create new markers
    validStores.forEach((store) => {
      const isSelected = selectedStore?.id === store.id;

      const icon = L.divIcon({
        html: createIconHtml(isSelected),
        className: 'moove-store-marker',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([store.lat, store.lng], {
        icon,
        title: store.fantasyName || store.name,
      }).addTo(map);

      marker.bindPopup(createPopupContent(store), {
        maxWidth: 300,
        minWidth: 220,
      });

      marker.on('click', () => {
        onSelectStore(store);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds if we have stores
    if (validStores.length > 0) {
      const bounds = L.latLngBounds(
        validStores.map((s) => [s.lat, s.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stores, isLoaded, createIconHtml, createPopupContent, onSelectStore]);

  // Update selected marker styling + open popup
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!isLoaded || !L || !map) return;

    markersRef.current.forEach((marker, index) => {
      const store = stores[index];
      if (!store) return;

      const isSelected = selectedStore?.id === store.id;

      const icon = L.divIcon({
        html: createIconHtml(isSelected),
        className: 'moove-store-marker',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });
      marker.setIcon(icon);

      if (isSelected) {
        map.panTo([store.lat, store.lng]);
        marker.openPopup();
      }
    });
  }, [selectedStore, stores, isLoaded, createIconHtml]);

  if (error) {
    return (
      <div className="w-full min-h-[280px] md:min-h-[350px] lg:min-h-[450px] bg-neutral rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 p-6">
          <div className="w-12 h-12 text-red mb-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor"
              />
            </svg>
          </div>
          <p className="text-dark-blue font-semibold text-center">Erro ao carregar o mapa</p>
          <p className="text-medium-gray text-sm text-center">Verifique sua conexão e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[280px] md:min-h-[350px] lg:min-h-[450px] rounded-lg overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin" />
            <p className="text-medium-gray text-sm">Carregando mapa...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[280px] md:min-h-[350px] lg:min-h-[450px]" />
    </div>
  );
}
