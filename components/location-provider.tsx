"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { City, LocationContextType } from "../lib/location-types";

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null); // ✅ أضفتها

  useEffect(() => {
    const storedLocation = localStorage.getItem("selectedLocation");
    if (storedLocation) {
      try {
        const city = JSON.parse(storedLocation);
        setSelectedCity(city);
        if (city?.coordinates) setMapPosition(city.coordinates); // ✅ حطيت الاحداثيات
      } catch (error) {
        console.error("Error parsing stored location:", error);
      }
    } else {
      setShowLocationModal(true);
    }
  }, []);

  const handleSetSelectedCity = (city: City | null) => {
    setSelectedCity(city);
    if (city) {
      localStorage.setItem("selectedLocation", JSON.stringify(city));
      if (city?.coordinates) setMapPosition(city.coordinates); // ✅ تحديث
    } else {
      localStorage.removeItem("selectedLocation");
      setMapPosition(null);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity: handleSetSelectedCity,
        showLocationModal,
        setShowLocationModal,
        mapPosition, // ✅ لازم ترجعها
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
