"use client";

import { useMemo } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";
import { useGoogleMaps } from "@/components/providers/google-maps-provider";

interface MapPreviewProps {
    apiKey?: string;
    latitude: string;
    longitude: string;
    onClick?: () => void;
}

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

export const MapPreview = ({ apiKey, latitude, longitude, onClick }: MapPreviewProps) => {
    const { isLoaded, loadError } = useGoogleMaps();

    const center = useMemo(() => {
        return {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
        };
    }, [latitude, longitude]);

    if (!apiKey) return <div className="bg-gray-100 w-full h-full flex items-center justify-center text-sm text-gray-400">No API Key</div>;

    if (loadError) {
        return <div className="bg-gray-100 w-full h-full flex items-center justify-center text-xs text-red-400">Map Error</div>;
    }

    if (!isLoaded) {
        return (
            <div className="bg-gray-50 w-full h-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={16}
            options={{
                disableDefaultUI: true, // Hide controls for a cleaner "preview" look
                draggable: false,       // Static feel, but real map
                clickableIcons: false,
                scrollwheel: false,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                keyboardShortcuts: false,
            }}
            onClick={onClick}
        >
            <MarkerF position={center} />
        </GoogleMap>
    );
};
