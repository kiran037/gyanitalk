import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { searchLocations, getCurrentLocation, LocationResult } from '@/lib/location-api';

interface LocationInputProps {
  value: string;
  onChange: (location: LocationResult) => void;
  placeholder?: string;
  error?: string;
  name?: string;
}

export default function LocationInput({ value, onChange, placeholder, error, name }: LocationInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const locations = await searchLocations(query);
      setResults(locations);
      setLoading(false);
      setShowDropdown(locations.length > 0);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
  };

  const handleSelect = (location: LocationResult) => {
    setQuery(location.place);
    setShowDropdown(false);
    setResults([]);
    onChange(location);
    inputRef.current?.blur();
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    const location = await getCurrentLocation();
    setDetectingLocation(false);
    
    if (location) {
      setQuery(location.place);
      setResults([]);
      setShowDropdown(false);
      onChange(location);
    } else {
      alert('Unable to detect location. Please enable location services.');
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder || "Search birth place..."}
          autoComplete="off"
          className={`w-full rounded-lg border ${
            error ? 'border-red-300' : 'border-gray-200/60'
          } bg-white/60 py-2 pl-8 pr-20 text-sm backdrop-blur-sm placeholder:text-gray-400 transition-colors focus:border-[#FF6B35]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
        />
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded bg-[#FF6B35]/10 px-2 py-1 text-xs font-medium text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/20 disabled:opacity-50"
        >
          {detectingLocation ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Navigation className="h-3 w-3" />
          )}
          Detect
        </button>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Dropdown - Fixed z-index */}
      {showDropdown && (
        <div className="absolute left-0 right-0 z-[100] mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200/60 bg-white shadow-xl backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#FF6B35]" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              No locations found
            </div>
          ) : (
            <ul>
              {results.map((location, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSelect(location)}
                    className="flex w-full items-start gap-2 border-b border-gray-100 px-3 py-2 text-left transition-colors hover:bg-gray-50 last:border-b-0 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#FF6B35]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {location.place.split(',').slice(0, 2).join(',')}
                      </p>
                      {location.place.split(',').length > 2 && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {location.place.split(',').slice(2).join(',')}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}