"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { City, LocationContextType } from "../lib/location-types";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);

  const israelCities: City[] = [
    {
      id: "1",
      name: "Tel Aviv",
      nameAr: "تل أبيب",
      nameHe: "תל אביב",
      coordinates: [32.0853, 34.7818],
      region: "وسط"
    },
    {
      id: "2",
      name: "Jerusalem",
      nameAr: "القدس",
      nameHe: "ירושלים",
      coordinates: [31.7683, 35.2137],
      region: "وسط"
    },
    {
      id: "3",
      name: "Haifa",
      nameAr: "حيفا",
      nameHe: "חיפה",
      coordinates: [32.7940, 34.9896],
      region: "شمال"
    },
    { id: "4", name: "Beersheba", nameAr: "بئر السبع", nameHe: "באר שבע", coordinates: [31.2518, 34.7913], region: "جنوب" },
    { id: "5", name: "Netanya", nameAr: "نتانيا", nameHe: "נתניה", coordinates: [32.3215, 34.8532], region: "وسط" },
    { id: "6", name: "Acre", nameAr: "عكا", nameHe: "עכו", coordinates: [32.9271, 35.0818], region: "شمال" },
    { id: "7", name: "Eilat", nameAr: "إيلات", nameHe: "אילת", coordinates: [29.5577, 34.9519], region: "جنوب" },
    { id: "8", name: "Ashdod", nameAr: "أشدود", nameHe: "אשדוד", coordinates: [31.8014, 34.6435], region: "جنوب" },
    { id: "9", name: "Ramat Gan", nameAr: "رمات غان", nameHe: "רמת גן", coordinates: [32.0809, 34.8145], region: "وسط" },
    { id: "10", name: "Bat Yam", nameAr: "بات يام", nameHe: "בת ים", coordinates: [32.0231, 34.7503], region: "وسط" },
    { id: "11", name: "Rishon Lezion", nameAr: "ريشون لتسيون", nameHe: "ראשון לציון", coordinates: [31.9730, 34.7925], region: "وسط" },
    { id: "12", name: "Petah Tikva", nameAr: "بيتح تكفا", nameHe: "פתח תקווה", coordinates: [32.0871, 34.8875], region: "وسط" },
    { id: "13", name: "Herzliya", nameAr: "هرتسليا", nameHe: "הרצליה", coordinates: [32.1624, 34.8447], region: "وسط" },
    { id: "14", name: "Kfar Saba", nameAr: "كفار سابا", nameHe: "כפר סבא", coordinates: [32.1750, 34.9066], region: "وسط" },
    { id: "15", name: "Holon", nameAr: "حولون", nameHe: "חולון", coordinates: [32.0114, 34.7748], region: "وسط" },
    // أضف المزيد حسب الحاجة
  ];

  useEffect(() => {
    // Check if user has already selected a location
    const storedLocation = localStorage.getItem("selectedLocation");
    if (storedLocation) {
      try {
        const city = JSON.parse(storedLocation);
        setSelectedCity(city);
        setMapPosition(city.coordinates);
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    } else {
      // Show location modal on first visit
      setShowLocationModal(true);
    }
  }, []);

  const handleSetSelectedCity = (city: City | null) => {
    setSelectedCity(city);
    if (city) {
      localStorage.setItem("selectedLocation", JSON.stringify(city));
      setMapPosition(city.coordinates);
    } else {
      localStorage.removeItem("selectedLocation");
      setMapPosition(null);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapPosition([lat, lng]);
    setSelectedCity(null);
    localStorage.setItem("selectedLocation", JSON.stringify({ coordinates: [lat, lng] }));
    setShowLocationModal(false);
  };

  // استخدم اللغة الحالية حسب مكتبة الترجمة لديك
  const locale = typeof window !== "undefined" && window.localStorage.getItem("lang") === "ar" ? "ar" : "en";

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity: handleSetSelectedCity,
        showLocationModal,
        setShowLocationModal,
        mapPosition,
      }}
    >
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="font-bold mb-4">اختر موقعك</h2>
            <div className="mb-4">
              <label className="block mb-2">اختر مدينة:</label>
              <select
                className="w-full border rounded px-2 py-1"
                onChange={e => {
                  const city = israelCities.find(c => c.id === e.target.value);
                  handleSetSelectedCity(city || null);
                  setShowLocationModal(false);
                }}
                defaultValue=""
              >
                <option value="" disabled>اختر مدينة</option>
                {israelCities.map(city => (
                  <option key={city.id} value={city.id}>
                    {locale === "ar" ? city.nameAr : city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <MapContainer
                center={[31.5, 34.75]} // مركز إسرائيل تقريباً
                zoom={8}               // تكبير مناسب لإظهار معظم المدن
                style={{ height: "350px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onClick={handleMapClick} />
                {mapPosition && <Marker position={mapPosition as LatLngExpression} />}
                {israelCities.map(city => (
                  <Marker key={city.id} position={city.coordinates as LatLngExpression} />
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
      {children}
    </LocationContext.Provider>
  );
}

// مكون مساعد لالتقاط النقرة على الخريطة
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
