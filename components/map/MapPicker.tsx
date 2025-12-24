"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import type { MapLocation } from "@/lib/user/user.types";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useZoneStore } from "@/store/useZoneStore";

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: MapLocation) => void;
  initialLocation?: MapLocation | null;
  mapApikey?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 25.2854,
  lng: 51.5310, // Doha, Qatar
};

// Qatar Geofencing Bounds (Approximate)
const QATAR_BOUNDS = {
  minLat: 24.4,
  maxLat: 26.2,
  minLng: 50.7,
  maxLng: 51.7,
};

const isInQatar = (lat: number, lng: number) => {
  return (
    lat >= QATAR_BOUNDS.minLat &&
    lat <= QATAR_BOUNDS.maxLat &&
    lng >= QATAR_BOUNDS.minLng &&
    lng <= QATAR_BOUNDS.maxLng
  );
};

interface MapContentProps {
  apiKey: string;
  selectedLocation: MapLocation | null;
  onMapClick: (lat: number, lng: number) => void;
  onZoomChanged?: (zoom: number) => void;
}

const MapContent = ({ apiKey, selectedLocation, onMapClick, onZoomChanged }: MapContentProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(() => {
    return selectedLocation
      ? {
        lat: parseFloat(selectedLocation.latitude),
        lng: parseFloat(selectedLocation.longitude),
      }
      : defaultCenter;
  }, [selectedLocation]);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-red-500 font-medium mb-2">Error loading maps</p>
        <p className="text-sm text-gray-500 mb-4">Please reload the page to try again.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading Map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={selectedLocation ? 18 : 14}
      onClick={(e) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      }}
      onLoad={(map) => {
        map.addListener("zoom_changed", () => {
          const zoom = map.getZoom();
          if (zoom && onZoomChanged) {
            onZoomChanged(zoom);
          }
        });
      }}
      options={{
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      }}
    >
      {selectedLocation && (
        <MarkerF
          position={{
            lat: parseFloat(selectedLocation.latitude),
            lng: parseFloat(selectedLocation.longitude),
          }}
        />
      )}
    </GoogleMap>
  );
};

export const MapPicker = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
  mapApikey,
}: MapPickerProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    initialLocation || null
  );
  // initial location address set from local storage saved one.
  const [locationAddress, setLocationAddress] = useState<string | null>(initialLocation?.formattedAddress || null);
  const [zone, setZone] = useState<string | null>(null);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const setGlobalZone = useZoneStore((state) => state.setZone);
  const globalZone = useZoneStore((state) => state.zone);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch address from coordinates
   */
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setLocationAddress("Fetching address...");

    debounceRef.current = setTimeout(async () => {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({
          location: { lat, lng },
        });

        if (response.results[0]) {
          const result = response.results[0];
          setLocationAddress(result.formatted_address);

          // Extract Zone
          // Strategy: Look for "Zone XX" in address components or formatted address
          // Google Maps often puts it in 'sublocality' or 'neighborhood' or just in the address line
          let extractedZone: string | null = null;

          // Check address components for "Zone" keyword
          const zoneComponent = result.address_components.find(c =>
            c.long_name.includes("Zone") || c.short_name.includes("Zone")
          );

          if (zoneComponent) {
            extractedZone = zoneComponent.long_name;
          } else {
            // Fallback: Try regex on formatted address
            const match = result.formatted_address.match(/Zone\s+(\d+)/i);
            if (match) {
              extractedZone = match[0]; // e.g., "Zone 55"
            }
          }

          if (extractedZone) {
            setZone(extractedZone);
          }

        } else {
          setLocationAddress("Address not found");
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
        setLocationAddress("Failed to load address");
      }
    }, 1500);
  }, []);

  /**
   * Validate and set location
   */
  const validateAndSetLocation = useCallback((lat: number, lng: number) => {
    if (isInQatar(lat, lng)) {
      setSelectedLocation({
        latitude: lat.toString(),
        longitude: lng.toString(),
      });
      fetchAddress(lat, lng);
      setError(null);
    } else {
      setSelectedLocation({
        latitude: defaultCenter.lat.toString(),
        longitude: defaultCenter.lng.toString(),
      });
      setError("Location is outside Qatar. Please select a location within Qatar.");
    }
  }, [fetchAddress]);

  /**
   * Get current location from browser
   */
  /**
   * Get current location from browser
   */
  const handleGetCurrentLocation = useCallback(async (showError = true) => {
    setIsLoadingCurrentLocation(true);
    if (showError) setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (isInQatar(lat, lng)) {
        const newLocation: MapLocation = {
          latitude: lat.toString(),
          longitude: lng.toString(),
        };
        setSelectedLocation(newLocation);
        fetchAddress(lat, lng);
      } else {
        validateAndSetLocation(lat, lng);
      }

    } catch (err) {
      if (showError) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get location";
        setError(errorMessage);
      }
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  }, [validateAndSetLocation, fetchAddress]);

  // Reset selected location when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        setSelectedLocation(initialLocation);
        if (initialLocation.formattedAddress) {
          setLocationAddress(initialLocation.formattedAddress);
        }
        if (globalZone) {
          setZone(globalZone);
        }
      } else {
        // Auto-request location if none provided (silent mode)
        handleGetCurrentLocation(false);
      }
      setError(null);
    }
  }, [isOpen, initialLocation, handleGetCurrentLocation, globalZone]);

  /**
   * Handle map click (for when Google Maps is integrated)
   */
  const handleMapClick = useCallback((lat: number, lng: number) => {
    validateAndSetLocation(lat, lng);
  }, [validateAndSetLocation]);

  /**
   * Confirm selected location
   */
  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      if (currentZoom < 18) {
        setError("Please zoom in closer to confirm your exact location.");
        return;
      }
      onSelectLocation({
        ...selectedLocation,
        formattedAddress: locationAddress || undefined,
      });
      if (zone) {
        setGlobalZone(zone);
      }
      onClose();
    }
  }, [selectedLocation, locationAddress, onSelectLocation, onClose, zone, setGlobalZone, currentZoom]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] mx-auto p-3 lg:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Delivery Location
          </DialogTitle>
          <DialogDescription>
            Search or point on the map to select your delivery location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Current Location Button */}
          <Button
            variant="outline"
            onClick={() => handleGetCurrentLocation(true)}
            disabled={isLoadingCurrentLocation}
            className="w-full"
          >
            {isLoadingCurrentLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Use My Current Location
              </>
            )}
          </Button>

          {/* Map Container */}
          <div className="border rounded-lg overflow-hidden bg-gray-100 h-[400px] relative">
            {mapApikey ? (
              <MapContent
                apiKey={mapApikey}
                selectedLocation={selectedLocation}
                onMapClick={handleMapClick}
                onZoomChanged={setCurrentZoom}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Map not available</p>
                  <p className="text-sm">Use &quot;Current Location&quot; button above</p>
                </div>
              </div>
            )}

            {/* Selected Location Marker Overlay */}
            {selectedLocation && (
              <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md text-sm min-w-[200px]">
                <p className="font-medium text-green-600">Location Selected</p>
                <p className="text-gray-900 font-medium">
                  {locationAddress || "Loading address..."}
                </p>
                {/* <p className="text-gray-500 text-xs mt-1">
                  {parseFloat(selectedLocation.latitude).toFixed(6)},{" "}
                  {parseFloat(selectedLocation.longitude).toFixed(6)}
                </p> */}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <input
                value={locationAddress || ""}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="e.g., 123 Main St, City, Country"
                className="w-full px-3 py-2 border rounded-md text-sm"
                disabled
                readOnly
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Zone</label>
              <input
                type="text"
                value={zone || ""}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g., Zone 1"
                className="w-full px-3 py-2 border rounded-md text-sm"
                disabled
                readOnly
              />
            </div>

          </div>
          {/* Manual Input (fallback) */}
          {/* <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Latitude</label>
              <input
                type="text"
                value={selectedLocation?.latitude || ""}
                onChange={(e) =>
                  setSelectedLocation((prev) => ({
                    latitude: e.target.value,
                    longitude: prev?.longitude || "",
                  }))
                }
                placeholder="e.g., 25.2854"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Longitude</label>
              <input
                type="text"
                value={selectedLocation?.longitude || ""}
                onChange={(e) =>
                  setSelectedLocation((prev) => ({
                    latitude: prev?.latitude || "",
                    longitude: e.target.value,
                  }))
                }
                placeholder="e.g., 51.5310"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div> */}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedLocation}>
            <MapPin className="h-4 w-4 mr-2" />
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapPicker;
