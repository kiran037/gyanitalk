// src/components/landing/kundali/PersonForm.tsx
import { User, Calendar, Clock, MapPin, Phone, Globe, ChevronDown } from 'lucide-react';
import LocationInput from '@/components/landing/kundali/LocationInput';
import { LocationResult } from '@/lib/location-api';

interface FormData {
  name: string;
  contactNo: string;
  countryCode: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface PersonFormProps {
  data: FormData;
  onDataChange: (data: FormData) => void;
  title: string;
  icon: any;
  prefix: string;
  errors: Record<string, string>;
  colorScheme: 'blue' | 'pink';
}

export default function PersonForm({ 
  data, 
  onDataChange, 
  title, 
  icon: Icon, 
  prefix,
  errors,
  colorScheme
}: PersonFormProps) {
  
  // Theme configuration with improved specificities
  const theme = colorScheme === 'blue' 
    ? {
        wrapper: 'border-blue-100 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-900/10',
        iconBg: 'bg-blue-600 shadow-blue-200 dark:shadow-none',
        focusRing: 'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
        inputBg: 'focus:bg-white dark:focus:bg-gray-800'
      }
    : {
        wrapper: 'border-pink-100 bg-pink-50/60 dark:border-pink-900/40 dark:bg-pink-900/10',
        iconBg: 'bg-pink-600 shadow-pink-200 dark:shadow-none',
        focusRing: 'focus-within:ring-2 focus-within:ring-pink-500/20 focus-within:border-pink-500',
        inputBg: 'focus:bg-white dark:focus:bg-gray-800'
      };

  const handleChange = (field: keyof FormData, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  const inputBaseClasses = `
    w-full rounded-xl border bg-white/80 px-4 py-3 
    text-base sm:text-sm font-medium text-gray-900 
    placeholder-gray-400 shadow-sm outline-none transition-all 
    dark:bg-gray-800/80 dark:text-white dark:border-gray-700
  `;

  return (
    <div className={`relative h-full w-full rounded-2xl border ${theme.wrapper} p-4 backdrop-blur-md transition-all duration-300 hover:shadow-md sm:p-6`}>
      
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 border-b border-gray-200/50 pb-4 dark:border-gray-700/30">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg ${theme.iconBg} transition-transform hover:scale-105`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-5">
        
        {/* Name Input */}
        <div className="group">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-gray-800 dark:text-gray-400 dark:group-focus-within:text-gray-200">
            <User className="h-3.5 w-3.5" />
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className={`${theme.focusRing} rounded-xl transition-all duration-200`}>
            <input
              type="text"
              name={`${prefix}Name`}
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={`${inputBaseClasses} ${theme.inputBg} ${
                errors[`${prefix}Name`] ? 'border-red-300 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200'
              }`}
            />
          </div>
          {errors[`${prefix}Name`] && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 animate-in slide-in-from-left-1">
              <span className="h-1 w-1 rounded-full bg-red-500"></span>
              {errors[`${prefix}Name`]}
            </p>
          )}
        </div>

        {/* Mobile Number Group */}
        <div className="group">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-gray-800 dark:text-gray-400 dark:group-focus-within:text-gray-200">
            <Phone className="h-3.5 w-3.5" />
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 sm:gap-3">
            <div className={`relative w-[4.5rem] sm:w-[5.5rem] shrink-0 rounded-xl ${theme.focusRing}`}>
              <select
                value={data.countryCode}
                onChange={(e) => handleChange('countryCode', e.target.value)}
                className={`h-full w-full appearance-none rounded-xl border bg-white/80 pl-2 sm:pl-3 text-base sm:text-sm font-medium text-gray-900 shadow-sm outline-none transition-all dark:bg-gray-800/80 dark:text-white dark:border-gray-700 border-gray-200 text-center`}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+65">🇸🇬 +65</option>
              </select>
              {/* Custom Arrow for consistency */}
              <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 sm:right-2">
                 <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>
            
            <div className={`flex-1 rounded-xl ${theme.focusRing}`}>
              <input
                type="tel"
                name={`${prefix}ContactNo`}
                value={data.contactNo}
                onChange={(e) => handleChange('contactNo', e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                maxLength={15}
                className={`${inputBaseClasses} ${theme.inputBg} ${
                  errors[`${prefix}ContactNo`] ? 'border-red-300 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200'
                }`}
              />
            </div>
          </div>
          {errors[`${prefix}ContactNo`] && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 animate-in slide-in-from-left-1">
              <span className="h-1 w-1 rounded-full bg-red-500"></span>
              {errors[`${prefix}ContactNo`]}
            </p>
          )}
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="group">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-gray-800 dark:text-gray-400 dark:group-focus-within:text-gray-200">
              <Calendar className="h-3.5 w-3.5" />
              Birth Date <span className="text-red-500">*</span>
            </label>
            <div className={`${theme.focusRing} rounded-xl`}>
              <input
                type="date"
                name={`${prefix}BirthDate`}
                value={data.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`${inputBaseClasses} ${theme.inputBg} ${
                  errors[`${prefix}BirthDate`] ? 'border-red-300 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200'
                }`}
              />
            </div>
            {errors[`${prefix}BirthDate`] && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors[`${prefix}BirthDate`]}</p>
            )}
          </div>

          <div className="group">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-gray-800 dark:text-gray-400 dark:group-focus-within:text-gray-200">
              <Clock className="h-3.5 w-3.5" />
              Birth Time <span className="text-red-500">*</span>
            </label>
            <div className={`${theme.focusRing} rounded-xl`}>
              <input
                type="time"
                name={`${prefix}BirthTime`}
                value={data.birthTime}
                onChange={(e) => handleChange('birthTime', e.target.value)}
                className={`${inputBaseClasses} ${theme.inputBg} ${
                  errors[`${prefix}BirthTime`] ? 'border-red-300 ring-2 ring-red-100 dark:ring-red-900/30' : 'border-gray-200'
                }`}
              />
            </div>
            {errors[`${prefix}BirthTime`] && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors[`${prefix}BirthTime`]}</p>
            )}
          </div>
        </div>

        {/* Location Input - Z-INDEX FIX APPLIED HERE */}
        <div className="relative z-20 group">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors group-focus-within:text-gray-800 dark:text-gray-400 dark:group-focus-within:text-gray-200">
            <MapPin className="h-3.5 w-3.5" />
            Birth Place <span className="text-red-500">*</span>
          </label>
          <div className={`relative rounded-xl border bg-white shadow-sm transition-all focus-within:ring-2 ${
            errors[`${prefix}BirthPlace`] 
              ? 'border-red-300 ring-2 ring-red-100 dark:ring-red-900/30' 
              : `border-gray-200 dark:border-gray-700 ${theme.focusRing.split(' ')[2]}`
          } dark:bg-gray-800`}>
            <LocationInput
              value={data.birthPlace}
              onChange={(location: LocationResult) => {
                onDataChange({
                  ...data,
                  birthPlace: location.place,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  timezone: location.timezone
                });
              }}
              error={errors[`${prefix}BirthPlace`]}
              name={`${prefix}BirthPlace`}
            />
          </div>
          
          {errors[`${prefix}BirthPlace`] && (
             <p className="mt-1.5 text-xs font-medium text-red-500">{errors[`${prefix}BirthPlace`]}</p>
          )}

          {data.latitude !== 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <Globe className="h-3 w-3" />
              <span>Lat: {data.latitude.toFixed(2)}, Long: {data.longitude.toFixed(2)}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}