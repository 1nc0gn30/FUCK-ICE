import React, { useEffect, useState, useMemo, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ShieldCheck, Flag, AlertTriangle, MapPin, Search, Crosshair, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { createUuid } from '../lib/uuid';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Sighting {
  id: string;
  created_at: string;
  location: string;
  description: string;
  date: string;
  time: string;
  vehicle_details: string;
  verified_count: number;
  flagged_count: number;
  latitude: number | null;
  longitude: number | null;
  image_url?: string | null;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Feed() {
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchCity, setSearchCity] = useState('');
  const [proximity, setProximity] = useState(50); // miles
  const [searchCoords, setSearchCoords] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'verify' | 'flag'>>({});
  const [clientId, setClientId] = useState<string>('');
  const [activeVoteId, setActiveVoteId] = useState<string>('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const sightingRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    fetchSightings();
    
    // Initialize a stable client ID and local vote memory.
    let storedClientId = localStorage.getItem('client_id');
    if (!storedClientId) {
      storedClientId = createUuid();
      localStorage.setItem('client_id', storedClientId);
    }
    setClientId(storedClientId);

    const storedVotes = localStorage.getItem('user_votes');
    if (storedVotes) {
      try {
        setUserVotes(JSON.parse(storedVotes));
      } catch (e) {
        console.error("Failed to parse user votes:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!fullscreenImage) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreenImage(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [fullscreenImage]);

  const saveVote = (sightingId: string, type: 'verify' | 'flag') => {
    const newVotes = { ...userVotes, [sightingId]: type };
    setUserVotes(newVotes);
    localStorage.setItem('user_votes', JSON.stringify(newVotes));
  };

  const fetchSightings = async () => {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase is not configured.");
      }

      const { data, error: dbError } = await supabase
        .from('sightings')
        .select('*')
        .lt('flagged_count', 5)
        .order('created_at', { ascending: false })
        .limit(100);

      if (dbError) throw dbError;
      setSightings(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load sightings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity.trim()) {
      setSearchCoords(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchCity)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setSearchCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert("City not found. Try a more specific name.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredSightings = useMemo(() => {
    if (!searchCoords) return sightings;
    
    return sightings.filter(s => {
      if (s.latitude === null || s.longitude === null) return false;
      const dist = getDistance(searchCoords[0], searchCoords[1], s.latitude, s.longitude);
      return dist <= proximity;
    });
  }, [sightings, searchCoords, proximity]);

  const handleVote = async (id: string, type: 'verify' | 'flag') => {
    if (userVotes[id]) return; // Already voted
    if (!clientId) return;

    setActiveVoteId(id);
    try {
      const response = await fetch('/api/sighting-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          sighting_id: id,
          vote_type: type,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Vote failed.');
      }

      const updated = payload?.data;
      if (updated) {
        const shouldRemove = Number(updated.flagged_count || 0) >= 5;
        if (shouldRemove) {
          setSightings(prev => prev.filter(s => s.id !== id));
        } else {
          setSightings(prev =>
            prev.map(s =>
              s.id === id
                ? { ...s, verified_count: Number(updated.verified_count || 0), flagged_count: Number(updated.flagged_count || 0) }
                : s
            )
          );
        }
      }

      saveVote(id, type);
    } catch (e: any) {
      alert(e.message || 'Vote failed.');
    } finally {
      setActiveVoteId('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-8 border-[var(--color-bg-dark)] pb-4 gap-4">
        <h1 className="font-headline font-black text-6xl uppercase tracking-tighter text-[var(--color-bg-dark)]">
          LIVE FEED
        </h1>
        <div className="flex items-center gap-2 text-[var(--color-accent-red)] font-headline font-black uppercase text-xl animate-pulse">
          <AlertTriangle />
          <span>ACTIVE ALERTS</span>
        </div>
      </div>

      {/* Map & Filter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="h-[500px] border-8 border-[var(--color-bg-dark)] hard-shadow relative z-0">
            <MapContainer center={[38.8977, -77.0365]} zoom={4} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {searchCoords && <ChangeView center={searchCoords} zoom={8} />}
              {filteredSightings.map(s => s.latitude && s.longitude && (
                <Marker key={s.id} position={[s.latitude, s.longitude]}>
                  <Popup>
                    <div className="font-body p-1">
                      <strong className="font-headline uppercase text-[var(--color-accent-red)] text-lg leading-none block mb-1">{s.location}</strong>
                      <p className="text-xs font-bold opacity-80 mb-2">{s.date} @ {s.time}</p>
                      <p className="text-sm mb-4 line-clamp-2">{s.description}</p>
                      <button 
                        onClick={() => {
                          sightingRefs.current[s.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          // Add a brief highlight effect
                          const el = sightingRefs.current[s.id];
                          if (el) {
                            el.style.transition = 'background-color 0.5s';
                            el.style.backgroundColor = 'rgba(242, 125, 38, 0.2)';
                            setTimeout(() => {
                              el.style.backgroundColor = '';
                            }, 2000);
                          }
                        }}
                        className="w-full bg-[var(--color-bg-dark)] text-white py-2 font-headline font-black uppercase text-xs hover:bg-[var(--color-accent-red)] transition-colors"
                      >
                        SCROLL TO POST
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] p-6 hard-shadow">
            <h3 className="font-headline font-black text-2xl uppercase mb-4 flex items-center gap-2">
              <Search size={24} />
              PROXIMITY SEARCH
            </h3>
            <form onSubmit={handleCitySearch} className="space-y-4">
              <div>
                <label className="block font-label font-bold uppercase text-xs mb-1">CITY / ZIP CODE</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="e.g. Virginia Beach"
                    className="flex-1 bg-[var(--color-bg-primary)] border-2 border-[var(--color-bg-dark)] p-2 font-body font-bold focus:outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="bg-[var(--color-bg-dark)] text-[var(--color-text-light)] px-4 py-2 font-headline font-black uppercase hover:bg-[var(--color-accent-red)] transition-colors"
                  >
                    {isSearching ? '...' : 'GO'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-label font-bold uppercase text-xs mb-1">
                  RADIUS: {proximity} MILES
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="500" 
                  step="5"
                  value={proximity}
                  onChange={(e) => setProximity(parseInt(e.target.value))}
                  className="w-full accent-[var(--color-accent-red)]"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase opacity-50">
                  <span>5 MI</span>
                  <span>500 MI</span>
                </div>
              </div>

              {searchCoords && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchCoords(null);
                    setSearchCity('');
                  }}
                  className="w-full border-2 border-[var(--color-bg-dark)] p-2 font-headline font-black uppercase text-xs hover:bg-[var(--color-bg-dark)] hover:text-[var(--color-text-light)] transition-colors"
                >
                  CLEAR FILTER
                </button>
              )}
            </form>
          </div>

          <div className="bg-[var(--color-accent-orange)] border-4 border-[var(--color-bg-dark)] p-6 hard-shadow">
            <h3 className="font-headline font-black text-2xl uppercase mb-2 flex items-center gap-2">
              <Crosshair size={24} />
              SIGHTING STATS
            </h3>
            <div className="space-y-2 font-body font-bold uppercase text-sm">
              <div className="flex justify-between border-b-2 border-[var(--color-bg-dark)]/20 pb-1">
                <span>TOTAL REPORTS</span>
                <span>{sightings.length}</span>
              </div>
              <div className="flex justify-between border-b-2 border-[var(--color-bg-dark)]/20 pb-1">
                <span>IN RANGE</span>
                <span>{filteredSightings.length}</span>
              </div>
              <div className="flex justify-between">
                <span>VERIFIED</span>
                <span>{sightings.filter(s => s.verified_count >= 3).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="font-headline font-black text-3xl uppercase text-center py-12">
          LOADING DATA...
        </div>
      ) : filteredSightings.length === 0 ? (
        <div className="bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] p-8 text-center">
          <p className="font-headline font-black text-2xl uppercase">NO ACTIVE ALERTS IN THIS AREA.</p>
          <p className="font-body font-bold mt-2">Stay vigilant.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredSightings.map((sighting) => {
            const hasVoted = userVotes[sighting.id];
            const voteType = userVotes[sighting.id];

            return (
              <div 
                key={sighting.id} 
                ref={el => sightingRefs.current[sighting.id] = el}
                className="bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] p-6 md:p-8 hard-shadow relative transition-all duration-500"
              >
                {sighting.verified_count >= 3 && (
                  <div className="absolute -top-4 -right-4 bg-[var(--color-accent-orange)] text-[var(--color-bg-dark)] px-4 py-1 font-headline font-black uppercase border-4 border-[var(--color-bg-dark)] transform rotate-3 flex items-center gap-1 z-10">
                    <ShieldCheck size={18} />
                    COMMUNITY VERIFIED
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={20} className="text-[var(--color-accent-red)]" />
                      <h2 className="font-headline font-black text-3xl uppercase text-[var(--color-accent-red)] leading-tight">
                        {sighting.location}
                      </h2>
                    </div>
                    <div className="font-label font-bold uppercase text-sm tracking-widest opacity-70 mt-2">
                      {sighting.date} AT {sighting.time} • REPORTED {formatDistanceToNow(new Date(sighting.created_at))} AGO
                      {searchCoords && sighting.latitude && sighting.longitude && (
                        <span className="ml-2 text-[var(--color-accent-red)]">
                          • {getDistance(searchCoords[0], searchCoords[1], sighting.latitude, sighting.longitude).toFixed(1)} MILES AWAY
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {sighting.latitude && sighting.longitude && (
                    <button 
                      onClick={() => {
                        setSearchCoords([sighting.latitude!, sighting.longitude!]);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-[var(--color-bg-dark)] text-white px-4 py-2 font-headline font-black uppercase text-xs hover:bg-[var(--color-accent-red)] transition-colors flex items-center gap-2 hard-shadow-red"
                    >
                      <MapPin size={14} />
                      VIEW ON MAP
                    </button>
                  )}
                </div>

                <p className="font-body text-xl font-medium leading-relaxed mb-6 bg-[#eaead1] p-4 border-l-4 border-[var(--color-bg-dark)]">
                  {sighting.description}
                </p>

                {sighting.image_url && (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={() => setFullscreenImage(sighting.image_url || null)}
                      className="block w-full focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-orange)]"
                    >
                      <img
                        src={sighting.image_url}
                        alt="Submitted sighting evidence"
                        className="w-full max-h-[420px] object-cover border-4 border-[var(--color-bg-dark)] cursor-zoom-in"
                        loading="lazy"
                      />
                    </button>
                  </div>
                )}

                {sighting.vehicle_details && (
                  <div className="mb-6 font-body font-bold text-[var(--color-bg-dark)]/80 uppercase text-sm">
                    <span className="bg-[var(--color-bg-dark)] text-[var(--color-text-light)] px-2 py-1 mr-2">VEHICLE</span>
                    {sighting.vehicle_details}
                  </div>
                )}

                <div className="flex gap-4 border-t-4 border-[var(--color-bg-dark)] pt-4 mt-4">
                  <button 
                    onClick={() => handleVote(sighting.id, 'verify')}
                    disabled={!!hasVoted || activeVoteId === sighting.id}
                    className={`flex items-center gap-2 font-headline font-black uppercase text-sm transition-colors ${
                      voteType === 'verify' 
                        ? 'text-[var(--color-accent-orange)]' 
                        : hasVoted 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:text-[var(--color-accent-orange)]'
                    }`}
                  >
                    <ShieldCheck size={20} />
                    {voteType === 'verify' ? 'VERIFIED' : 'VERIFY'} ({sighting.verified_count})
                  </button>
                  <button 
                    onClick={() => handleVote(sighting.id, 'flag')}
                    disabled={!!hasVoted || activeVoteId === sighting.id}
                    className={`flex items-center gap-2 font-headline font-black uppercase text-sm transition-colors ml-auto ${
                      voteType === 'flag' 
                        ? 'text-[var(--color-accent-red)]' 
                        : hasVoted 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:text-[var(--color-accent-red)]'
                    }`}
                  >
                    <Flag size={20} />
                    {voteType === 'flag' ? 'FLAGGED' : 'FLAG BS'} ({sighting.flagged_count})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen report image"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 bg-white text-black p-3 border-4 border-black hard-shadow-red"
            onClick={() => setFullscreenImage(null)}
            aria-label="Close image viewer"
          >
            <X size={24} />
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen submitted sighting evidence"
            className="max-w-[96vw] max-h-[90vh] w-auto h-auto object-contain border-4 border-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
