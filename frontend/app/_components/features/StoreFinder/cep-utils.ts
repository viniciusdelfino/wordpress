// CEP validation and geocoding utilities

import { GeocodingResult } from '@/app/types/store-types';

/**
 * Formats a CEP string to XXXXX-XXX format
 */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/**
 * Validates if a CEP has the correct format (8 digits)
 */
export function validateCep(cep: string): boolean {
  const digits = cep.replace(/\D/g, '');
  return digits.length === 8;
}

/**
 * Extracts only digits from a CEP string
 */
export function getCepDigits(cep: string): string {
  return cep.replace(/\D/g, '');
}

/**
 * Geocodes a Brazilian CEP using OpenStreetMap Nominatim (no API key required).
 * Falls back to BrasilAPI city lookup + Nominatim if direct postcode search fails.
 */
export async function geocodeCep(cep: string): Promise<GeocodingResult | null> {
  const digits = getCepDigits(cep);
  if (!validateCep(digits)) {
    return null;
  }

  const formattedCep = `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;

  // Strategy 1: Nominatim direct postcode lookup
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${formattedCep}&country=Brazil&format=json&limit=1`
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          formattedAddress: data[0].display_name,
        };
      }
    }
  } catch (error) {
    console.warn('Nominatim direct lookup failed:', error);
  }

  // Strategy 2: BrasilAPI for city/state, then Nominatim for city center
  try {
    const cepResponse = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
    if (!cepResponse.ok) {
      console.warn('BrasilAPI lookup failed:', cepResponse.status);
      return null;
    }

    const cepData = await cepResponse.json();

    // BrasilAPI v2 sometimes returns coordinates directly
    const coords = cepData.location?.coordinates;
    if (coords?.latitude && coords?.longitude) {
      return {
        lat: parseFloat(coords.latitude),
        lng: parseFloat(coords.longitude),
        formattedAddress: `${cepData.street || ''} ${cepData.neighborhood || ''}, ${cepData.city}, ${cepData.state}`.trim(),
      };
    }

    // Fall back to Nominatim with city + state
    if (cepData.city && cepData.state) {
      const cityQuery = encodeURIComponent(`${cepData.city}, ${cepData.state}, Brazil`);
      const cityResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${cityQuery}&format=json&limit=1`
      );

      if (cityResponse.ok) {
        const cityData = await cityResponse.json();
        if (Array.isArray(cityData) && cityData.length > 0) {
          return {
            lat: parseFloat(cityData[0].lat),
            lng: parseFloat(cityData[0].lon),
            formattedAddress: cityData[0].display_name,
          };
        }
      }
    }

    console.warn('CEP not found:', cep);
    return null;
  } catch (error) {
    console.error('Error geocoding CEP:', error);
    return null;
  }
}
