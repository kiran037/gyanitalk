import { User, Calendar, Clock, MapPin, Phone } from 'lucide-react';
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
  const borderColor = colorScheme === 'blue' 
    ? 'border-blue-200/60 dark:border-blue-900/60' 
    : 'border-pink-200/60 dark:border-pink-900/60';
  
  const bgColor = colorScheme === 'blue'
    ? 'bg-blue-50/40 dark:bg-blue-900/10'
    : 'bg-pink-50/40 dark:bg-pink-900/10';

  const handleChange = (field: keyof FormData, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4 backdrop-blur-sm space-y-3`}>
      <div className="flex items-center gap-2 border-b border-gray-200/60 pb-2 dark:border-gray-700/60">
        <div className="rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] p-1.5">
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          <User className="h-3 w-3" />
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name={`${prefix}Name`}
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter full name"
          className={`w-full rounded-lg border ${
            errors[`${prefix}Name`] ? 'border-red-300' : 'border-gray-200/60'
          } bg-white/60 py-2 px-3 text-sm backdrop-blur-sm transition-colors focus:border-[#FF6B35]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
        />
        {errors[`${prefix}Name`] && (
          <p className="mt-1 text-xs text-red-500">{errors[`${prefix}Name`]}</p>
        )}
      </div>

      {/* Mobile Number */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          <Phone className="h-3 w-3" />
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <select
            value={data.countryCode}
            onChange={(e) => handleChange('countryCode', e.target.value)}
            className="w-24 rounded-lg border border-gray-200/60 bg-white/60 px-2 py-2 text-sm backdrop-blur-sm transition-colors focus:border-[#FF6B35]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white"
          >
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+971">🇦🇪 +971</option>
            <option value="+61">🇦🇺 +61</option>
            <option value="+65">🇸🇬 +65</option>
            <option value="+60">🇲🇾 +60</option>
          </select>
          <input
            type="tel"
            name={`${prefix}ContactNo`}
            value={data.contactNo}
            onChange={(e) => handleChange('contactNo', e.target.value.replace(/\D/g, ''))}
            placeholder="10-digit mobile"
            maxLength={15}
            className={`flex-1 rounded-lg border ${
              errors[`${prefix}ContactNo`] ? 'border-red-300' : 'border-gray-200/60'
            } bg-white/60 px-3 py-2 text-sm backdrop-blur-sm transition-colors focus:border-[#FF6B35]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
          />
        </div>
        {errors[`${prefix}ContactNo`] && (
          <p className="mt-1 text-xs text-red-500">{errors[`${prefix}ContactNo`]}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Used for saving your kundli history
        </p>
      </div>

      {/* Birth Date & Time */}
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="h-3 w-3" />
            Birth Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name={`${prefix}BirthDate`}
            value={data.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full rounded-lg border ${
              errors[`${prefix}BirthDate`] ? 'border-red-300' : 'border-gray-200/60'
            } bg-white/60 py-2 px-3 text-sm backdrop-blur-sm transition-colors focus:border-[#FF6B35]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
          />
          {errors[`${prefix}BirthDate`] && (
            <p className="mt-1 text-xs text-red-500">{errors[`${prefix}BirthDate`]}</p>
          )}
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            Birth Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name={`${prefix}BirthTime`}
            value={data.birthTime}
            onChange={(e) => handleChange('birthTime', e.target.value)}
            className={`w-full rounded-lg border ${
              errors[`${prefix}BirthTime`] ? 'border-red-300' : 'border-gray-200/60'
            } bg-white/60 py-2 px-3 text-sm backdrop-blur-sm transition-colors focus:border-[#FF6B35]/50 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-gray-700/60 dark:bg-white/5 dark:text-white`}
          />
          {errors[`${prefix}BirthTime`] && (
            <p className="mt-1 text-xs text-red-500">{errors[`${prefix}BirthTime`]}</p>
          )}
        </div>
      </div>

      {/* Birth Place */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          <MapPin className="h-3 w-3" />
          Birth Place <span className="text-red-500">*</span>
        </label>
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
    </div>
  );
}