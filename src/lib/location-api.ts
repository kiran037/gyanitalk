// src/lib/location-api.ts

export interface LocationResult {
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
  state?: string;
}

/**
 * Search locations using Nominatim (OpenStreetMap)
 * Free, no API key required
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5',
        addressdetails: '1'
      }),
      {
        headers: {
          'User-Agent': 'Gyanitalk-Kundli-App'
        }
      }
    );

    const data = await response.json();

    return data.map((item: any) => ({
      place: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      timezone: getTimezoneFromCoordinates(parseFloat(item.lat), parseFloat(item.lon)),
      country: item.address?.country || '',
      state: item.address?.state || ''
    }));
  } catch (error) {
    console.error('Location search failed:', error);
    return [];
  }
}

/**
 * Get timezone offset from coordinates
 * Simplified approximation - for production use TimeZone API
 */
export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  // Rough timezone calculation (longitude-based)
  // For accurate results, use a proper timezone API
  const offset = Math.round(lon / 15);
  
  // Indian timezone is special case
  if (lat >= 8 && lat <= 35 && lon >= 68 && lon <= 97) {
    return '5.5'; // IST
  }
  
  return offset.toString();
}

/**
 * Format timezone for display
 */
export function formatTimezone(tz: string): string {
  const offset = parseFloat(tz);
  const hours = Math.floor(Math.abs(offset));
  const minutes = Math.abs((offset % 1) * 60);
  const sign = offset >= 0 ? '+' : '-';
  
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get current location using browser's Geolocation API
 */
export async function getCurrentLocation(): Promise<LocationResult | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get place name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            new URLSearchParams({
              lat: latitude.toString(),
              lon: longitude.toString(),
              format: 'json'
            }),
            {
              headers: {
                'User-Agent': 'Gyanitalk-Kundli-App'
              }
            }
          );

          const data = await response.json();

          resolve({
            place: data.display_name,
            latitude,
            longitude,
            timezone: getTimezoneFromCoordinates(latitude, longitude),
            country: data.address?.country || '',
            state: data.address?.state || ''
          });
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          resolve(null);
        }
      },
      (error) => {
        console.error('Geolocation failed:', error);
        resolve(null);
      }
    );
  });
}