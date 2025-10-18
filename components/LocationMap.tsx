import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Dispatch, SetStateAction } from "react";
import type { City } from "../lib/location-types";

// عرف cityIcon هنا فقط
const cityIcon = new L.DivIcon({
  html: `<span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#2563eb;border-radius:50%;color:white;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 10a4 4 0 1 0-8 0c0 4 4 8 4 8s4-4 4-8z"/><circle cx="8" cy="10" r="1"/></svg></span>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function LocationMap({ israelCities, selectedCity, setSelectedCity }: { israelCities: City[]; selectedCity: City | null; setSelectedCity: Dispatch<SetStateAction<City | null>> }) {
  return (
    <MapContainer
      center={[31.5, 34.75]}
      zoom={8}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {israelCities.map((city: City) => (
        <Marker
          key={city.id}
          position={city.coordinates}
          icon={cityIcon}
          eventHandlers={{
            click: () => setSelectedCity(city),
          }}
        >
          <Popup>
            {city.name}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}