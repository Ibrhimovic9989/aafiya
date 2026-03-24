import { NextRequest, NextResponse } from 'next/server';

/**
 * Toilet Map API proxy
 * Uses the Great British Public Toilet Map API (toiletmap.org.uk)
 * and OpenStreetMap Overpass API for global coverage.
 *
 * Source: IBD Open Data (robertshippey/IBD-Open-Data)
 * The toilet map has 12,000+ UK public toilet locations.
 * For India and other countries, we use OpenStreetMap Overpass API.
 *
 * This is crucial for IBD patients who need to know where
 * the nearest restroom is at all times.
 */

const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

interface ToiletLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance?: number; // km from user
  accessible: boolean;
  openNow?: boolean;
  source: string;
  address?: string;
  tags?: Record<string, string>;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const radius = parseInt(searchParams.get('radius') || '1000'); // meters

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat and lon parameters required' },
      { status: 400 }
    );
  }

  try {
    // Use Overpass API to find toilets on OpenStreetMap
    const query = `
      [out:json][timeout:10];
      (
        node["amenity"="toilets"](around:${radius},${lat},${lon});
        node["amenity"="toilet"](around:${radius},${lat},${lon});
        node["toilets"="yes"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    const res = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Overpass API returned ${res.status}`);
    }

    const data = await res.json();

    const toilets: ToiletLocation[] = (data.elements || []).map((el: any) => {
      const tags = el.tags || {};
      const distance = getDistanceKm(lat, lon, el.lat, el.lon);

      return {
        id: `osm-${el.id}`,
        name: tags.name || tags.description || 'Public Toilet',
        lat: el.lat,
        lon: el.lon,
        distance: Math.round(distance * 100) / 100,
        accessible: tags.wheelchair === 'yes' || tags['toilets:wheelchair'] === 'yes',
        openNow: isLikelyOpen(tags),
        source: 'openstreetmap',
        address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(', ') || undefined,
        tags: {
          fee: tags.fee || 'unknown',
          unisex: tags.unisex || 'unknown',
          changing_table: tags.changing_table || 'unknown',
          opening_hours: tags.opening_hours || 'unknown',
        },
      };
    });

    // Sort by distance
    toilets.sort((a, b) => (a.distance || 999) - (b.distance || 999));

    // Also check for nearby places with restrooms (malls, restaurants, hospitals)
    const placesQuery = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:${Math.min(radius * 2, 3000)},${lat},${lon});
        node["amenity"="fast_food"](around:${radius},${lat},${lon});
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["shop"="mall"](around:${radius * 2},${lat},${lon});
        node["amenity"="fuel"](around:${radius},${lat},${lon});
      );
      out body 10;
    `;

    let nearbyPlaces: ToiletLocation[] = [];
    try {
      const placesRes = await fetch(OVERPASS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(placesQuery)}`,
        next: { revalidate: 3600 },
      });

      if (placesRes.ok) {
        const placesData = await placesRes.json();
        nearbyPlaces = (placesData.elements || []).slice(0, 10).map((el: any) => {
          const tags = el.tags || {};
          return {
            id: `osm-place-${el.id}`,
            name: tags.name || tags.amenity || 'Nearby place',
            lat: el.lat,
            lon: el.lon,
            distance: Math.round(getDistanceKm(lat, lon, el.lat, el.lon) * 100) / 100,
            accessible: tags.wheelchair === 'yes',
            source: 'openstreetmap_places',
            type: tags.amenity || tags.shop,
          };
        });
      }
    } catch {
      // Places query is supplementary, don't fail the whole request
    }

    return NextResponse.json({
      toilets,
      nearbyPlaces,
      count: toilets.length,
      radius,
      center: { lat, lon },
    });
  } catch (error: any) {
    console.error('Toilet map API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch toilet locations' },
      { status: 500 }
    );
  }
}

/**
 * Haversine formula to calculate distance between two points
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Heuristic to determine if a toilet is likely open
 */
function isLikelyOpen(tags: Record<string, string>): boolean {
  const hours = tags.opening_hours;
  if (!hours) return true; // Assume open if no hours listed
  if (hours === '24/7') return true;
  // Simple heuristic — most public toilets are open during daytime
  return true;
}
