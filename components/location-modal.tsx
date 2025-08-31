"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Check } from "lucide-react";
import { City } from "../lib/location-types";

const israelCities: City[] = [
  { id: "tel-aviv", name: "Tel Aviv", nameAr: "تل أبيب", nameHe: "תל אביב", coordinates: [32.0853, 34.7818], region: "Central" },
  { id: "jerusalem", name: "Jerusalem", nameAr: "القدس", nameHe: "ירושלים", coordinates: [31.7683, 35.2137], region: "Jerusalem" },
  { id: "haifa", name: "Haifa", nameAr: "حيفا", nameHe: "חיפה", coordinates: [32.7940, 34.9896], region: "Northern" },
  { id: "beer-sheva", name: "Beer Sheva", nameAr: "بئر السبع", nameHe: "באר שבע", coordinates: [31.2518, 34.7913], region: "Southern" },
  { id: "netanya", name: "Netanya", nameAr: "نتانيا", nameHe: "נתניה", coordinates: [32.3328, 34.8600], region: "Central" },
  { id: "rishon-lezion", name: "Rishon LeZion", nameAr: "ريشون لتسيون", nameHe: "ראשון לציון", coordinates: [31.9641, 34.8044], region: "Central" },
  { id: "petah-tikva", name: "Petah Tikva", nameAr: "بتاح تكفا", nameHe: "פתח תקווה", coordinates: [32.0871, 34.8875], region: "Central" },
  { id: "ashdod", name: "Ashdod", nameAr: "أشدود", nameHe: "אשדוד", coordinates: [31.8044, 34.6500], region: "Southern" },
  { id: "arad", name: "Arad", nameAr: "عراد", nameHe: "ערד", coordinates: [31.2611, 35.2147], region: "Southern" },
  { id: "eilat", name: "Eilat", nameAr: "إيلات", nameHe: "אילת", coordinates: [29.5577, 34.9519], region: "Southern" },
  { id: "tiberias", name: "Tiberias", nameAr: "طبريا", nameHe: "טבריה", coordinates: [32.7940, 35.5320], region: "Northern" },
  { id: "safed", name: "Safed", nameAr: "صفد", nameHe: "צפת", coordinates: [32.9646, 35.4960], region: "Northern" },
];

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (city: City) => void;
}

export function LocationModal({ isOpen, onClose, onLocationSelect }: LocationModalProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "ar" | "he">("en");

  useEffect(() => {
    if (isOpen) {
      const storedLang = localStorage.getItem("language") || "en";
      setCurrentLanguage(storedLang as "en" | "ar" | "he");
    }
  }, [isOpen]);

  const filteredCities = israelCities.filter(city => {
    const searchLower = searchTerm.toLowerCase();
    return (
      city.name.toLowerCase().includes(searchLower) ||
      city.nameAr.includes(searchTerm) ||
      city.nameHe.includes(searchTerm)
    );
  });

  const getCityName = (city: City) => {
    switch (currentLanguage) {
      case "ar": return city.nameAr;
      case "he": return city.nameHe;
      default: return city.name;
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    onLocationSelect(city);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Select Your Location
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose your city to see local offers and delivery options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[70vh]">
          {/* Map Section */}
          <div className="lg:w-1/2 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 rounded-xl p-4 relative overflow-hidden">
              {/* Simplified Israel Map */}
              <div className="relative w-full h-full">
                {/* Israel outline */}
                <div className="absolute inset-4 bg-gradient-to-br from-green-400 to-green-600 rounded-lg opacity-20"></div>
                
                {/* Major cities as dots */}
                {israelCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCity(city)}
                    className={`absolute w-3 h-3 rounded-full transition-all duration-200 hover:scale-150 ${
                      selectedCity?.id === city.id 
                        ? "bg-red-500 shadow-lg shadow-red-500/50" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    style={{
                      left: `${((city.coordinates[1] - 34.5) / 2.5) * 100}%`,
                      top: `${((city.coordinates[0] - 29.5) / 3.5) * 100}%`,
                    }}
                    title={getCityName(city)}
                  />
                ))}

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 text-4xl">🇮🇱</div>
                <div className="absolute bottom-4 left-4 text-sm text-gray-600 dark:text-gray-400">
                  Israel
                </div>
              </div>
            </div>
          </div>

          {/* Cities List Section */}
          <div className="lg:w-1/2 p-6 flex flex-col">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Language Toggle */}
            <div className="flex gap-2 mb-4">
              {[
                { code: "en", label: "English" },
                { code: "ar", label: "العربية" },
                { code: "he", label: "עברית" }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setCurrentLanguage(lang.code as "en" | "ar" | "he")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    currentLanguage === lang.code
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Cities List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {getCityName(city)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {city.region} Region
                        </div>
                      </div>
                    </div>
                    {selectedCity?.id === city.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Current Selection */}
            {selectedCity && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">
                      Selected: {getCityName(selectedCity)}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedCity.region} Region
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
