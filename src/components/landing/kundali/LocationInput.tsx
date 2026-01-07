///Users/xeoren/Desktop/gyanitallk-admin/src/components/landing/kundali/LocationInput.tsx
import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation, X } from 'lucide-react';
import { searchLocations, getCurrentLocation, LocationResult } from '@/lib/location-api';

interface LocationInputProps {
  value: string;
  onChange: (location: LocationResult) => void;
  placeholder?: string;
  error?: string;
  name?: string;
}

export default function LocationInput({ 
  value, 
  onChange, 
  placeholder, 
  error, 
  name 
}: LocationInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with props
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Don't search if the query matches the selected value exactly (prevents reopening on selection)
    // You might need to adjust this logic based on how you handle selection vs typing
    
    setLoading(true);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      const locations = await searchLocations(query);
      setResults(locations);
      setLoading(false);
      setShowDropdown(true); // Always show if we have results or empty state
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
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
      // You might want a toast here instead of alert in a real app
      alert('Unable to detect location. Please check permissions.');
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        {/* Left Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors">
          <MapPin className="h-5 w-5" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length >= 3) setShowDropdown(true);
          }}
          placeholder={placeholder || "Search birth city..."}
          autoComplete="off"
          className={`w-full rounded-xl border bg-white px-4 py-3 pl-10 pr-24 text-sm font-medium text-gray-900 placeholder-gray-400 shadow-sm outline-none transition-all dark:bg-gray-800 dark:text-white ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-gray-200 focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 dark:border-gray-700'
          }`}
        />

        {/* Right Actions Container */}
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {/* Clear Button (only if text exists) */}
          {query.length > 0 && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Detect Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
              detectingLocation 
                ? 'bg-orange-50 text-orange-400 cursor-wait' 
                : 'bg-[#FF6B35]/10 text-[#FF6B35] hover:bg-[#FF6B35]/20 active:scale-95'
            }`}
          >
            {detectingLocation ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Detect</span>
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 animate-pulse">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10">
          <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
                <span className="text-xs">Searching places...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No locations found for "{query}"
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800">
                {results.map((location, index) => {
                  // Split logic to style City vs State/Country
                  const parts = location.place.split(',');
                  const mainText = parts[0];
                  const subText = parts.slice(1).join(', ');

                  return (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleSelect(location)}
                        className="group flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-orange-50/50 dark:hover:bg-gray-800"
                      >
                        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-[#FF6B35] group-hover:shadow-sm transition-all dark:bg-gray-800 dark:group-hover:bg-gray-700">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {mainText}
                          </p>
                          {subText && (
                            <p className="text-xs text-gray-500 truncate mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                              {subText}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}