"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { City, LocationContextType } from "../lib/location-types";

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    // Check if user has already selected a location
    const storedLocation = localStorage.getItem("selectedLocation");
    if (storedLocation) {
      try {
        const city = JSON.parse(storedLocation);
        setSelectedCity(city);
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
    } else {
      localStorage.removeItem("selectedLocation");
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity: handleSetSelectedCity,
        showLocationModal,
        setShowLocationModal,
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
