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
import { MapPin, Navigation, Loader2, X, Search, ExternalLink, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { MapLocation } from "@/lib/user/user.types";
import { GoogleMap, MarkerF, Autocomplete } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/providers/google-maps-provider";
import { useZoneStore } from "@/store/useZoneStore";
import { BahrainUrl, OmanUrl, UAEUrl } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useAddress } from "@/lib/address";

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
  const { isAuthenticated } = useAuth();
  const { address: defaultAddress, savedAddresses } = useAddress();

  // State for view mode: 'map' or 'list'
  // If logged in and has saved addresses, show list first. Otherwise map.
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated && savedAddresses && savedAddresses.length > 0) {
        setViewMode("list");
      } else {
        setViewMode("map");
      }
    }
  }, [isOpen, isAuthenticated, savedAddresses]);

  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    initialLocation || null
  );
  // ... existing states (locationAddress, zone, etc.) ...
  const [locationAddress, setLocationAddress] = useState<string | null>(initialLocation?.formattedAddress || null);
  const [zone, setZone] = useState<string | null>(null);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(14);
  const setGlobalZone = useZoneStore((state) => state.setZone);
  const globalZone = useZoneStore((state) => state.zone);

  // ... existing redirects & loader ...
  const [redirectDialog, setRedirectDialog] = useState<{
    isOpen: boolean;
    countryName: string;
    url: string;
  } | null>(null);

  const { isLoaded, loadError } = useGoogleMaps();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const onLoadAutocomplete = (auto: google.maps.places.Autocomplete) => {
    setAutocomplete(auto);
  };
  // ... existing extractZoneFromResult ...
  const extractZoneFromResult = (
    components: google.maps.GeocoderAddressComponent[] | undefined,
    formattedAddress: string | undefined
  ): string | null => {
    if (!components && !formattedAddress) return null;

    if (components) {
      const zoneComponent = components.find(c =>
        c.long_name.toLowerCase().includes("zone") ||
        c.short_name.toLowerCase().includes("zone")
      );
      if (zoneComponent) return zoneComponent.long_name;
    }

    if (formattedAddress) {
      const match = formattedAddress.match(/Zone\s+(\d+)/i);
      if (match) return match[0];
    }

    return null;
  };

  // ... existing onPlaceChanged ...
  const onPlaceChanged = () => {
    // ... same logic
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        if (searchInputRef.current) {
          searchInputRef.current.value = place.formatted_address || place.name || "";
        }
        const quickZone = extractZoneFromResult(place.address_components, place.formatted_address);
        if (quickZone) setZone(quickZone);

        validateAndSetLocation(lat, lng);
        setCurrentZoom(16);
      } else {
        console.log("No details available for input: '" + place.name + "'");
      }
    }
  };

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ... existing fetchAddress ...
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    // ... same logic
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
          let countryComponent: google.maps.GeocoderAddressComponent | undefined;

          for (const res of response.results) {
            const found = res.address_components.find(c => c.types.includes("country"));
            if (found) {
              countryComponent = found;
              break;
            }
          }

          const result = response.results[0];

          if (countryComponent) {
            const countryCode = countryComponent.short_name.toUpperCase();
            const countryName = countryComponent.long_name;

            const isUAE = countryCode === "AE" || countryName.toLowerCase() === "united arab emirates";
            const isOman = countryCode === "OM" || countryName.toLowerCase() === "oman";
            const isBahrain = countryCode === "BH" || countryName.toLowerCase() === "bahrain";
            const isQatar = countryCode === "QA" || countryName.toLowerCase() === "qatar";

            if (isQatar) {
              setLocationAddress(result.formatted_address);
              let extractedZone = extractZoneFromResult(result.address_components, result.formatted_address);
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
              setError(null);

            } else if (isUAE || isOman || isBahrain) {
              let targetUrl = "";
              if (isUAE) targetUrl = UAEUrl;
              else if (isOman) targetUrl = OmanUrl;
              else if (isBahrain) targetUrl = BahrainUrl;

              setRedirectDialog({
                isOpen: true,
                countryName: countryName,
                url: targetUrl
              });

              setSelectedLocation(null);
              setLocationAddress(null);
              setZone(null);

            } else {
              setLocationAddress("Locating to Qatar...");
              setError(`We only serve Qatar, Oman, Bahrain, and UAE.`);
              setSelectedLocation({
                latitude: defaultCenter.lat.toString(),
                longitude: defaultCenter.lng.toString()
              });
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
    }, 500);
  }, [defaultCenter.lat, defaultCenter.lng]);

  // ... existing validateAndSetLocation ...
  const validateAndSetLocation = useCallback((lat: number, lng: number) => {
    setSelectedLocation({
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
    fetchAddress(lat, lng);
  }, [fetchAddress]);

  // ... existing handleGetCurrentLocation ...
  const handleGetCurrentLocation = useCallback(async (showError = true) => {
    setIsLoadingCurrentLocation(true);
    if (showError) setError(null);

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
      setCurrentZoom(16);

    } catch (err) {
      if (showError) {
        const errorMessage = err instanceof Error ? err.message : "Failed to get location";
        setError(errorMessage);
      }
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  }, [validateAndSetLocation]);

  useEffect(() => {
    if (isOpen) {
      // If initialLocation is provided, use it
      if (initialLocation) {
        setSelectedLocation(initialLocation);
        if (initialLocation.formattedAddress) {
          setLocationAddress(initialLocation.formattedAddress);
        }
        if (globalZone) {
          setZone(globalZone);
        }
      } else {
        // If no initial location, handle View Mode logic is roughly handled above, 
        // but if map mode is active and no location, auto-locate
        // However, we only auto-locate if we are in 'map' mode
      }
      setError(null);
    }
  }, [isOpen, initialLocation, globalZone]);

  // Auto-locate only when entering map mode and no location selected
  useEffect(() => {
    if (isOpen && viewMode === "map" && !selectedLocation && !initialLocation) {
      handleGetCurrentLocation(false);
    }
  }, [isOpen, viewMode, selectedLocation, initialLocation, handleGetCurrentLocation]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    validateAndSetLocation(lat, lng);
  }, [validateAndSetLocation]);


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

  const handleAddressSelect = async (address: any) => {
    // Assuming address has latitude/longitude/street
    // We map saved address to MapLocation
    const formattedAddress = Array.isArray(address.street) ? address.street[0] : address.street;
    const lat = address.customLatitude || address.latitude || defaultCenter.lat.toString();
    const lng = address.customLongitude || address.longitude || defaultCenter.lng.toString();

    const loc: MapLocation = {
      latitude: lat,
      longitude: lng,
      formattedAddress: formattedAddress
    };
    onSelectLocation(loc);

    // Extract Zone
    // Check custom attributes first if available (schema dependent)
    // Or parse from string
    let foundZone = null;

    // Attempt parse from address string
    if (formattedAddress) {
      const match = formattedAddress.match(/Zone\s+(\d+)/i);
      if (match) {
        foundZone = match[0];
      }
    }

    if (!foundZone) {
      if (address.customAddressOption && address.customAddressOption.toLowerCase().includes("zone")) {
        foundZone = address.customAddressOption;
      }
    }

    // Force Geocode if still no zone found and we have coordinates
    if (!foundZone && window.google && window.google.maps) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({
          location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        });

        if (response.results && response.results.length > 0) {
          // Try to find zone in results (Qatar specific)
          // Start with most specific result [0] and go down
          // Reuse extractZoneFromResult logic if possible or replicate
          let extractedZone = extractZoneFromResult(response.results[0].address_components, response.results[0].formatted_address);

          if (!extractedZone) {
            // Search other results
            for (const res of response.results) {
              const z = extractZoneFromResult(res.address_components, res.formatted_address);
              if (z) {
                extractedZone = z;
                break;
              }
            }
          }
          if (extractedZone) foundZone = extractedZone;
        }
      } catch (err) {
        console.error("Failed to reverse geocode saved address for zone", err);
      }
    }

    if (foundZone) {
      setGlobalZone(foundZone);
    }

    onClose();
  };

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
              {viewMode === "list"
                ? "Select from your saved addresses or add a new one."
                : "Search or point on the map to select your delivery location."}
            </DialogDescription>
          </DialogHeader>

          {viewMode === "list" ? (
            <div className="space-y-4">
              <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                {savedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAddressSelect(addr)}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {Array.isArray(addr.street) ? addr.street[0] : addr.street}
                      </p>
                      <p className="text-xs text-gray-500">
                        {addr.city}, {addr.country_id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={() => setViewMode("map")}>
                <Navigation className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Back to List Button if allowed */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className="p-0 h-auto mb-2 text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Saved Addresses
                </Button>
              )}

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
                <MapContent
                  selectedLocation={selectedLocation}
                  onMapClick={handleMapClick}
                  onZoomChanged={setCurrentZoom}
                  isLoaded={isLoaded}
                  loadError={loadError}
                  zoom={currentZoom}
                />

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
                    placeholder="e.g., Zone 56"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    disabled
                    readOnly
                  />
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
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* Country Redirect Dialog (Same as before) */}
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
