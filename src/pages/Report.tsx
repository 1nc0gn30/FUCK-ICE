import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { MapPin } from 'lucide-react';
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

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MIN_IMAGE_WIDTH = 600;
const MIN_IMAGE_HEIGHT = 600;
const MAX_IMAGE_WIDTH = 3000;
const MAX_IMAGE_HEIGHT = 3000;

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.8977, -77.0365]); // DC default

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
        },
        () => console.log("Geolocation denied")
      );
    }
  }, []);

  const getClientId = () => {
    let storedId = localStorage.getItem('client_id');
    if (!storedId) {
      storedId = createUuid();
      localStorage.setItem('client_id', storedId);
    }
    return storedId;
  };

  const readImageDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
        URL.revokeObjectURL(objectUrl);
      };
      image.onerror = () => {
        reject(new Error('Unable to read image dimensions.'));
        URL.revokeObjectURL(objectUrl);
      };
      image.src = objectUrl;
    });

  const validateImage = async (file: File) => {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      throw new Error('Only PNG and JPG images are allowed.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image must be 2MB or smaller. Compress it at tinypng.com or compressjpeg.com.');
    }

    const dimensions = await readImageDimensions(file);
    if (
      dimensions.width < MIN_IMAGE_WIDTH ||
      dimensions.height < MIN_IMAGE_HEIGHT ||
      dimensions.width > MAX_IMAGE_WIDTH ||
      dimensions.height > MAX_IMAGE_HEIGHT
    ) {
      throw new Error(
        `Image must be between ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} and ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT} pixels.`
      );
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }

    try {
      await validateImage(file);
      setImageFile(file);
    } catch (err: any) {
      setImageFile(null);
      e.target.value = '';
      setImageError(err.message || 'Invalid image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setImageError('');
    
    const formData = new FormData(e.currentTarget);
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const vehicle_details = formData.get('vehicle_details') as string;
    const clientId = getClientId();
    
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase is not configured.");
      }

      let imagePath: string | null = null;
      let imageUrl: string | null = null;

      if (imageFile) {
        const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        imagePath = `${createUuid()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from('sighting-images')
          .upload(imagePath, imageFile, {
            upsert: false,
            cacheControl: '3600',
          });

        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from('sighting-images').getPublicUrl(imagePath).data.publicUrl;
      }

      const response = await fetch('/api/report-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          location,
          description,
          date,
          time,
          vehicle_details: vehicle_details || null,
          latitude: position?.lat || null,
          longitude: position?.lng || null,
          image_url: imageUrl,
          image_path: imagePath,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (imagePath) {
          await supabase.storage.from('sighting-images').remove([imagePath]);
        }
        throw new Error(payload?.error || 'Failed to submit report.');
      }
      
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] p-8 md:p-12 hard-shadow relative">
        <div className="absolute -top-6 -left-6 bg-[var(--color-accent-red)] text-[var(--color-text-light)] p-4 font-headline font-black uppercase text-2xl transform -rotate-3 border-4 border-[var(--color-bg-dark)] z-10">
          ANONYMOUS REPORT
        </div>
        
        <h1 className="font-headline font-black text-5xl uppercase tracking-tighter text-[var(--color-bg-dark)] mb-4 mt-4">
          SUBMIT A SIGHTING
        </h1>
        <p className="font-body font-bold text-lg text-[var(--color-accent-red)] mb-8 uppercase">
          DO NOT INCLUDE YOUR NAME OR PERSONAL INFO. THIS IS 100% ANONYMOUS.
        </p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Map Section */}
          <div className="space-y-4">
            <label className="block font-headline font-black text-2xl uppercase flex items-center gap-2">
              <MapPin className="text-[var(--color-accent-red)]" />
              SET GEOLOCATION *
            </label>
            <p className="font-body font-bold text-sm opacity-70 uppercase">CLICK ON THE MAP TO PIN THE EXACT LOCATION OF THE SIGHTING.</p>
            <div className="h-[400px] border-8 border-[var(--color-bg-dark)] hard-shadow relative z-0">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {position && (
              <div className="bg-[var(--color-bg-dark)] text-[var(--color-text-light)] p-2 text-xs font-mono inline-block">
                COORDINATES: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-headline font-black text-xl uppercase mb-2">Location / Cross Streets *</label>
                <input 
                  required
                  name="location"
                  type="text" 
                  placeholder="e.g. 14th St and Mission St"
                  className="w-full bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] font-body font-bold text-lg p-4 focus:outline-none focus:bg-[#eaead1]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-headline font-black text-xl uppercase mb-2">Date *</label>
                  <input 
                    required
                    name="date"
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] font-body font-bold text-lg p-4 focus:outline-none focus:bg-[#eaead1]"
                  />
                </div>
                <div>
                  <label className="block font-headline font-black text-xl uppercase mb-2">Time *</label>
                  <input 
                    required
                    name="time"
                    type="time" 
                    className="w-full bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] font-body font-bold text-lg p-4 focus:outline-none focus:bg-[#eaead1]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-headline font-black text-xl uppercase mb-2">Vehicle Details (Optional)</label>
                <input 
                  name="vehicle_details"
                  type="text" 
                  placeholder="e.g. White unmarked van"
                  className="w-full bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] font-body font-bold text-lg p-4 focus:outline-none focus:bg-[#eaead1]"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-headline font-black text-xl uppercase mb-2">What did you see? *</label>
                <textarea 
                  required
                  name="description"
                  rows={10}
                  placeholder="Describe the activity, number of agents, uniforms, etc."
                  className="w-full h-full bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] font-body font-bold text-lg p-4 focus:outline-none focus:bg-[#eaead1]"
                ></textarea>
              </div>

              <div>
                <label className="block font-headline font-black text-xl uppercase mb-2">Image (Optional)</label>
                <input
                  name="image"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageChange}
                  className="w-full bg-[var(--color-bg-primary)] border-4 border-[var(--color-bg-dark)] font-body font-bold text-sm p-4 focus:outline-none"
                />
                <p className="font-body font-bold text-xs mt-2 uppercase opacity-75">
                  JPG/PNG only. 2MB max. Between 600x600 and 3000x3000 pixels.
                </p>
                <p className="font-body font-bold text-xs uppercase">
                  Need compression? Use{' '}
                  <a className="underline text-[var(--color-accent-red)]" href="https://tinypng.com/" target="_blank" rel="noreferrer">
                    tinypng.com
                  </a>{' '}
                  or{' '}
                  <a className="underline text-[var(--color-accent-red)]" href="https://compressjpeg.com/" target="_blank" rel="noreferrer">
                    compressjpeg.com
                  </a>
                  .
                </p>
                {imageError && <p className="text-red-700 font-body font-bold mt-2">{imageError}</p>}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-bg-dark)] text-[var(--color-text-light)] px-12 py-8 font-headline font-black text-4xl uppercase hover:bg-[var(--color-accent-red)] transition-all active:translate-y-2 active:translate-x-2 hard-shadow-red disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'SUBMITTING...' : 'BROADCAST ALERT'}
          </button>
        </form>
      </div>
    </div>
  );
}
