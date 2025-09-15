"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Check, LocateFixed } from "lucide-react";
import { City } from "../lib/location-types";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// أيقونة مخصصة للمدن
const cityIcon = new L.DivIcon({
  html: `<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#2563eb;border-radius:50%;color:white;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 10a4 4 0 1 0-8 0c0 4 4 8 4 8s4-4 4-8z"/><circle cx="8" cy="10" r="1"/></svg></span>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

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
  const [geoLoading, setGeoLoading] = useState(false);

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

  // دالة اختيار الموقع تلقائياً
  const handleAutoLocation = () => {
    setGeoLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // ابحث عن أقرب مدينة
          let closestCity = israelCities[0];
          let minDist = Number.POSITIVE_INFINITY;
          israelCities.forEach(city => {
            const dist = Math.sqrt(
              Math.pow(city.coordinates[0] - latitude, 2) +
              Math.pow(city.coordinates[1] - longitude, 2)
            );
            if (dist < minDist) {
              minDist = dist;
              closestCity = city;
            }
          });
          setSelectedCity(closestCity);
          onLocationSelect(closestCity);
          setGeoLoading(false);
          onClose();
        },
        () => {
          alert("تعذر الحصول على الموقع الحالي.");
          setGeoLoading(false);
        }
      );
    } else {
      alert("المتصفح لا يدعم تحديد الموقع الجغرافي.");
      setGeoLoading(false);
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-blue-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950/30">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentLanguage === "ar" ? "اختر موقعك" : currentLanguage === "he" ? "בחר מיקום" : "Select Your Location"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentLanguage === "ar"
                  ? "اختر مدينتك لرؤية العروض المحلية وخيارات التوصيل"
                  : currentLanguage === "he"
                  ? "בחר עיר להצגת מבצעים מקומיים ואפשרויות משלוח"
                  : "Choose your city to see local offers and delivery options"}
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
          {/* زر تحديد الموقع التلقائي (يظهر أعلى المودال في الجوال) */}
          <div className="w-full px-6 pt-4 lg:hidden">
            <button
              onClick={handleAutoLocation}
              disabled={geoLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors mb-4"
              title={currentLanguage === "ar" ? "تحديد الموقع تلقائيًا" : currentLanguage === "he" ? "בחירת מיקום אוטומטית" : "Auto detect location"}
            >
              <LocateFixed className="w-5 h-5" />
              {geoLoading
                ? (currentLanguage === "ar" ? "جاري تحديد الموقع..." : currentLanguage === "he" ? "מאתר מיקום..." : "Locating...")
                : (currentLanguage === "ar" ? "تحديد الموقع تلقائيًا" : currentLanguage === "he" ? "אוטומטי" : "Auto")}
            </button>
          </div>
          {/* Map Section */}
          <div className="w-full lg:w-1/2 p-6 border-r border-gray-200 dark:border-gray-700 flex-1 flex flex-col">
            {/* زر التلقائي في الديسكتوب */}
            <div className="hidden lg:block mb-2">
              <button
                onClick={handleAutoLocation}
                disabled={geoLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                title={currentLanguage === "ar" ? "تحديد الموقع تلقائيًا" : currentLanguage === "he" ? "בחירת מיקום אוטומטית" : "Auto detect location"}
              >
                <LocateFixed className="w-5 h-5" />
                {geoLoading
                  ? (currentLanguage === "ar" ? "جاري تحديد الموقع..." : currentLanguage === "he" ? "מאתר מיקום..." : "Locating...")
                  : (currentLanguage === "ar" ? "تحديد الموقع تلقائيًا" : currentLanguage === "he" ? "אוטומטי" : "Auto")}
              </button>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden relative mt-2">
              <MapContainer
                center={[31.5, 34.75]}
                zoom={8}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {israelCities.map(city => (
                  <Marker
                    key={city.id}
                    position={city.coordinates}
                    icon={cityIcon}
                    eventHandlers={{
                      click: () => setSelectedCity(city),
                    }}
                  >
                    <Popup>
                      {getCityName(city)}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
          {/* Cities List Section: تظهر فقط في الديسكتوب */}
          <div className="hidden lg:flex lg:w-1/2 p-6 flex-col bg-blue-50 dark:bg-blue-950/10 flex-1">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={currentLanguage === "ar" ? "ابحث عن مدينة..." : currentLanguage === "he" ? "חפש עיר..." : "Search cities..."}
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
                          {city.region} {currentLanguage === "ar" ? "منطقة" : currentLanguage === "he" ? "אזור" : "Region"}
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
                      {currentLanguage === "ar" ? "تم اختيار:" : currentLanguage === "he" ? "נבחר:" : "Selected:"} {getCityName(selectedCity)}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {selectedCity.region} {currentLanguage === "ar" ? "منطقة" : currentLanguage === "he" ? "אזור" : "Region"}
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
