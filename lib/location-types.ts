export interface City {
  id: string;
  name: string;
  nameAr: string;
  nameHe: string;
  coordinates: [number, number]; // [lat, lng]
  region: string;
}

export interface LocationContextType {
  selectedCity: City | null;
  setSelectedCity: (city: City | null) => void;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
}
