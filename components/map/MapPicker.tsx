"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import type { MapLocation } from "@/lib/user/user.types";

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: MapLocation) => void;
  initialLocation?: MapLocation | null;
  googleMapsApiKey?: string;
}

/**
 * Map Picker Component
 * 
 * Usage:
 * ```tsx
 * const { location, saveLocation, isMapOpen, openMap, closeMap } = useMapLocation();
 * 
 * <MapPicker
 *   isOpen={isMapOpen}
 *   onClose={closeMap}
 *   onSelectLocation={saveLocation}
 *   initialLocation={location}
 *   googleMapsApiKey="YOUR_API_KEY"
 * />
 * ```
 */
export const MapPicker = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
  googleMapsApiKey,
}: MapPickerProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    initialLocation || null
  );
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset selected location when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLocation(initialLocation || null);
      setError(null);
    }
  }, [isOpen, initialLocation]);

  /**
   * Get current location from browser
   */
  const handleGetCurrentLocation = useCallback(async () => {
    setIsLoadingCurrentLocation(true);
    setError(null);

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

      const newLocation: MapLocation = {
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
      };

      setSelectedLocation(newLocation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get location";
      setError(errorMessage);
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  }, []);

  /**
   * Handle map click (for when Google Maps is integrated)
   */
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
  }, []);

  /**
   * Confirm selected location
   */
  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    }
  }, [selectedLocation, onSelectLocation, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Delivery Location
          </DialogTitle>
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
            onClick={handleGetCurrentLocation}
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
          <div className="border rounded-lg overflow-hidden bg-gray-100 h-[300px] relative">
            {googleMapsApiKey ? (
              // TODO: Replace with actual Google Maps component
              // <GoogleMap
              //   apiKey={googleMapsApiKey}
              //   center={selectedLocation ? { lat: parseFloat(selectedLocation.latitude), lng: parseFloat(selectedLocation.longitude) } : { lat: 25.2854, lng: 51.5310 }} // Default: Doha, Qatar
              //   zoom={14}
              //   onClick={(e) => handleMapClick(e.lat, e.lng)}
              // />
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Google Maps will be displayed here</p>
                  <p className="text-sm">API Key provided</p>
                </div>
              </div>
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
              <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md text-sm">
                <p className="font-medium text-green-600">Location Selected</p>
                <p className="text-gray-500 text-xs">
                  {parseFloat(selectedLocation.latitude).toFixed(6)},{" "}
                  {parseFloat(selectedLocation.longitude).toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Manual Input (fallback) */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>
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
