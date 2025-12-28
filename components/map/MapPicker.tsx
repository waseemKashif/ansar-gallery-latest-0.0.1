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
import { MapPin, Navigation, Loader2, X, Search, ExternalLink } from "lucide-react";
import type { MapLocation } from "@/lib/user/user.types";
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete, Libraries } from "@react-google-maps/api";
import { useZoneStore } from "@/store/useZoneStore";
import { BahrainUrl, OmanUrl, UAEUrl } from "@/lib/constants";

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

// Define allowed countries for logic
const ALLOWED_REDIRECT_COUNTRIES = ["AE", "OM", "BH"]; // UAE, Oman, Bahrain
const HOME_COUNTRY = "QA"; // Qatar
const ALL_ALLOWED_COUNTRIES = ["qa", "ae", "om", "bh"]; // For Autocomplete

// Simplified bounds check (relaxed to allow neighboring countries)
// We rely on Geocoding for precise country check now
// const QATAR_BOUNDS = ... (Removed strict bounds to allow clicking neighbors)

// Define libraries outside component to prevent re-renders
const libraries: Libraries = ["places"];

interface MapContentProps {
  selectedLocation: MapLocation | null;
  onMapClick: (lat: number, lng: number) => void;
  onZoomChanged?: (zoom: number) => void;
  isLoaded: boolean;
  loadError: Error | undefined;
  zoom?: number;
}

const MapContent = ({ selectedLocation, onMapClick, onZoomChanged, isLoaded, loadError, zoom }: MapContentProps) => {
  // Center calculation logic
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
      zoom={zoom || (selectedLocation ? 10 : 8)} // Use controlled zoom if available
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
        minZoom: 5,
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

  // Redirect Dialog State
  const [redirectDialog, setRedirectDialog] = useState<{
    isOpen: boolean;
    countryName: string;
    url: string;
  } | null>(null);


  // Lifted useJsApiLoader to parent
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: mapApikey || "",
    libraries,
  });

  // Autocomplete state
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const onLoadAutocomplete = (auto: google.maps.places.Autocomplete) => {
    setAutocomplete(auto);
  };

  // Helper to extract Zone from address components or formatted address
  const extractZoneFromResult = (
    components: google.maps.GeocoderAddressComponent[] | undefined,
    formattedAddress: string | undefined
  ): string | null => {
    if (!components && !formattedAddress) return null;

    // 1. Try components
    if (components) {
      const zoneComponent = components.find(c =>
        c.long_name.toLowerCase().includes("zone") ||
        c.short_name.toLowerCase().includes("zone")
      );
      if (zoneComponent) return zoneComponent.long_name;
    }

    // 2. Try formatted address regex
    if (formattedAddress) {
      const match = formattedAddress.match(/Zone\s+(\d+)/i);
      if (match) return match[0];
    }

    return null;
  };

  // ... inside MapPicker ...

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Update input with the selected place name/address
        if (searchInputRef.current) {
          searchInputRef.current.value = place.formatted_address || place.name || "";
        }

        // Attempt to extract Zone immediately from Place details
        const quickZone = extractZoneFromResult(place.address_components, place.formatted_address);
        if (quickZone) setZone(quickZone);

        validateAndSetLocation(lat, lng);
        setCurrentZoom(16); // Auto-zoom on search selection
      } else {
        console.log("No details available for input: '" + place.name + "'");
      }
    }
  };

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

        if (response.results && response.results.length > 0) {
          // Robust Country Check: Iterate through all results to find the 'country' component
          // Google Geocoding returns results from most specific to least specific.
          // We look for any result that contains a country definition.
          let countryComponent: google.maps.GeocoderAddressComponent | undefined;

          for (const res of response.results) {
            const found = res.address_components.find(c => c.types.includes("country"));
            if (found) {
              countryComponent = found;
              break;
            }
          }

          const result = response.results[0]; // Use the most specific one for address text

          if (countryComponent) {
            const countryCode = countryComponent.short_name.toUpperCase();
            const countryName = countryComponent.long_name;

            const isUAE = countryCode === "AE" || countryName.toLowerCase() === "united arab emirates";
            const isOman = countryCode === "OM" || countryName.toLowerCase() === "oman";
            const isBahrain = countryCode === "BH" || countryName.toLowerCase() === "bahrain";
            const isQatar = countryCode === "QA" || countryName.toLowerCase() === "qatar";

            if (isQatar) {
              // Good to go (Qatar)
              setLocationAddress(result.formatted_address);

              // Extract Zone using helper
              // We try the most specific result first, but sometimes Zone is in a broader result
              // Let's stick to the specific result first
              let extractedZone = extractZoneFromResult(result.address_components, result.formatted_address);

              // If not found in primary result, maybe try iterating results?
              // (Optional robustness step if needed, but primary result usually has it)
              if (!extractedZone) {
                for (const res of response.results) {
                  const z = extractZoneFromResult(res.address_components, res.formatted_address);
                  if (z) {
                    extractedZone = z;
                    break;
                  }
                }
              }

              if (extractedZone) setZone(extractedZone);
              setError(null); // Clear errors

            } else if (isUAE || isOman || isBahrain) {
              // It's a redirect country!
              let targetUrl = "";
              if (isUAE) targetUrl = UAEUrl;
              else if (isOman) targetUrl = OmanUrl;
              else if (isBahrain) targetUrl = BahrainUrl;

              // Open Redirect Dialog
              setRedirectDialog({
                isOpen: true,
                countryName: countryName,
                url: targetUrl
              });

              // Reset selection to avoid "confirming" a foreign location for delivery
              setSelectedLocation(null);
              setLocationAddress(null);
              setZone(null);

            } else {
              // Blocked country - Reset to Qatar
              setLocationAddress("Locating to Qatar...");
              setError(`We only serve Qatar, Oman, Bahrain, and UAE.`);

              // Reset map to Qatar default
              setSelectedLocation({
                latitude: defaultCenter.lat.toString(),
                longitude: defaultCenter.lng.toString()
              });
              // Optionally clear address field after a moment or set to generic
              setTimeout(() => setLocationAddress(""), 1000);
            }
          } else {
            setLocationAddress(result.formatted_address);
          }

        } else {
          setLocationAddress("Address not found");
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
        setLocationAddress("Failed to load address");
      }
    }, 500); // Shorter debounce for snappier feel
  }, [defaultCenter.lat, defaultCenter.lng]);

  /**
   * Validate and set location
   */
  const validateAndSetLocation = useCallback((lat: number, lng: number) => {
    // We strictly assume we let the geocoder check the country now
    // So we temporarily set the location to trigger the marker/geocoding
    setSelectedLocation({
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    fetchAddress(lat, lng);
  }, [fetchAddress]);

  /**
   * Get current location from browser
   */
  const handleGetCurrentLocation = useCallback(async (showError = true) => {
    setIsLoadingCurrentLocation(true);
    if (showError) setError(null);

    // Clear search input on GPS use
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }

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

      validateAndSetLocation(lat, lng);
      setCurrentZoom(16); // Zoom in when getting accurate location

    } catch (err) {
      if (showError) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get location";
        setError(errorMessage);
      }
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  }, [validateAndSetLocation]);

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
    // Clear search input on manual map click
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    validateAndSetLocation(lat, lng);
  }, [validateAndSetLocation]);

  /**
   * Confirm selected location
   */
  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      // Zoom check is slightly less strict now if we want, but keeping 18 for precision in Qatar
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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-[1200px] max-h-[90vh] mx-auto p-3 lg:p-6 overflow-y-auto"
          onInteractOutside={(e) => {
            const target = e.target as Element;
            if (target?.closest('.pac-container') || target?.closest('.pac-item')) {
              e.preventDefault();
            }
          }}
        >
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
            {/* Search Input */}
            {isLoaded && !loadError && (
              <div className="relative z-10">
                <Autocomplete
                  onLoad={onLoadAutocomplete}
                  onPlaceChanged={onPlaceChanged}
                  // Restrict to Allowed Countries
                  restrictions={{ country: ALL_ALLOWED_COUNTRIES }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search for a location (e.g. Villaggio Mall)"
                      className="w-full pl-9 pr-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                      ref={searchInputRef}
                    />
                  </div>
                </Autocomplete>
              </div>
            )}
            {/* Map Container */}
            <div className="border rounded-lg overflow-hidden bg-gray-100 h-[400px] relative">
              {mapApikey ? (
                <MapContent
                  selectedLocation={selectedLocation}
                  onMapClick={handleMapClick}
                  onZoomChanged={setCurrentZoom}
                  isLoaded={isLoaded}
                  loadError={loadError}
                  zoom={currentZoom}
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

              {/* Selected Location Marker Overlay - Only show if valid (Qatar) selected */}
              {selectedLocation && (
                <div className="absolute top-2 left-2 bg-white px-3 py-2 rounded-lg shadow-md text-sm min-w-[200px] z-[5]">
                  <p className="font-medium text-green-600">Location Selected</p>
                  <p className="text-gray-900 font-medium whitespace-pre-wrap max-w-[250px]">
                    {locationAddress || "Loading address..."}
                  </p>
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

      {/* Country Redirect Dialog */}
      <Dialog open={!!redirectDialog} onOpenChange={() => setRedirectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visit {redirectDialog?.countryName}?</DialogTitle>
            <DialogDescription>
              We noticed you selected a location in {redirectDialog?.countryName}.
              We have a dedicated website for this region. Would you like to visit it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedirectDialog(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (redirectDialog?.url) window.location.href = redirectDialog.url;
              }}
            >
              Visit Website <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MapPicker;
