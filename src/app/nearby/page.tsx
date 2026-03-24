'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface ToiletLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance?: number;
  accessible: boolean;
  openNow?: boolean;
  source: string;
  address?: string;
  type?: string;
  tags?: Record<string, string>;
}

export default function NearbyPage() {
  const [toilets, setToilets] = useState<ToiletLocation[]>([]);
  const [places, setPlaces] = useState<ToiletLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState(1000);

  const fetchToilets = useCallback(async (lat: number, lon: number, r: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/toiletmap?lat=${lat}&lon=${lon}&radius=${r}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setToilets(data.toilets || []);
      setPlaces(data.nearbyPlaces || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          fetchToilets(loc.lat, loc.lon, radius);
        },
        () => {
          setError('Location access needed to find nearby restrooms. Please enable location in your browser.');
        }
      );
    } else {
      setError('Geolocation not supported by your browser.');
    }
  }, [fetchToilets, radius]);

  function openInMaps(lat: number, lon: number, name: string) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/" className="p-1 rounded-lg hover:bg-bg-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Nearby Restrooms</h1>
          <p className="text-[11px] text-text-tertiary">Find the closest one when you need it</p>
        </div>
      </div>

      {/* Quick access banner */}
      <Card padding="sm" className="mb-4 bg-accent/5 border-accent/10">
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Showing public restrooms and places with facilities near you.
          Tap any location to get directions.
        </p>
      </Card>

      {/* Radius selector */}
      <div className="flex gap-2 mb-4">
        {[500, 1000, 2000, 5000].map(r => (
          <button
            key={r}
            onClick={() => {
              setRadius(r);
              if (userLocation) fetchToilets(userLocation.lat, userLocation.lon, r);
            }}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              radius === r
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary border border-border'
            }`}
          >
            {r >= 1000 ? `${r / 1000}km` : `${r}m`}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
            <div className="w-2 h-2 rounded-full bg-accent" style={{ animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <Card padding="lg" className="text-center mb-4">
          <p className="text-[11px] text-red-500 mb-2">{error}</p>
          <button
            onClick={() => {
              if (userLocation) fetchToilets(userLocation.lat, userLocation.lon, radius);
            }}
            className="text-[12px] text-accent font-medium"
          >
            Try again
          </button>
        </Card>
      )}

      {/* Public Toilets */}
      {!loading && toilets.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-lg">🚻</span> Public Restrooms
          </h2>
          <div className="space-y-2">
            {toilets.slice(0, 15).map(t => (
              <button
                key={t.id}
                onClick={() => openInMaps(t.lat, t.lon, t.name)}
                className="w-full text-left rounded-xl border border-border bg-bg p-3 tap animate-slide-up"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-text-primary truncate">{t.name}</span>
                      {t.accessible && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full shrink-0">
                          ♿ Accessible
                        </span>
                      )}
                    </div>
                    {t.address && (
                      <p className="text-[10px] text-text-tertiary mt-0.5 truncate">{t.address}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {t.tags?.fee && t.tags.fee !== 'unknown' && (
                        <span className="text-[10px] text-text-tertiary">
                          {t.tags.fee === 'no' ? 'Free' : 'Paid'}
                        </span>
                      )}
                      {t.tags?.opening_hours && t.tags.opening_hours !== 'unknown' && (
                        <span className="text-[10px] text-text-tertiary">{t.tags.opening_hours}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[14px] font-bold text-accent">{t.distance}km</p>
                    <p className="text-[9px] text-text-tertiary">tap for directions</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Places with Restrooms */}
      {!loading && places.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className="text-lg">🏥</span> Places with Facilities
          </h2>
          <p className="text-[10px] text-text-tertiary mb-2">Hospitals, restaurants, malls, and petrol stations nearby</p>
          <div className="space-y-2">
            {places.map(p => (
              <button
                key={p.id}
                onClick={() => openInMaps(p.lat, p.lon, p.name)}
                className="w-full text-left rounded-xl border border-border bg-bg p-3 tap"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm">
                      {p.type === 'hospital' ? '🏥' :
                       p.type === 'restaurant' ? '🍽️' :
                       p.type === 'fast_food' ? '🍔' :
                       p.type === 'mall' ? '🏬' :
                       p.type === 'fuel' ? '⛽' : '📍'}
                    </span>
                    <span className="text-[12px] text-text-primary truncate">{p.name}</span>
                  </div>
                  <span className="text-[12px] font-medium text-accent shrink-0">{p.distance}km</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && !error && toilets.length === 0 && userLocation && (
        <Card padding="lg" className="text-center">
          <p className="text-text-secondary text-sm mb-2">No restrooms found within {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}</p>
          <p className="text-[11px] text-text-tertiary">Try increasing the search radius</p>
        </Card>
      )}

      {/* Data source */}
      <Card padding="sm" className="mt-6 bg-bg-secondary">
        <p className="text-[10px] text-text-tertiary leading-relaxed">
          Data from OpenStreetMap contributors. Locations may not always be accurate or up-to-date.
          If you find a missing restroom, you can add it on openstreetmap.org.
        </p>
      </Card>
    </div>
  );
}
