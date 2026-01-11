"use client";

import { createContext, useContext, ReactNode } from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places"];

interface GoogleMapsContextType {
    isLoaded: boolean;
    loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
    isLoaded: false,
    loadError: undefined,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
    children: ReactNode;
    apiKey?: string;
}

export const GoogleMapsProvider = ({ children, apiKey }: GoogleMapsProviderProps) => {
    const mapApiKey = apiKey || process.env.NEXT_PUBLIC_MAP_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "";

    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: mapApiKey,
        libraries,
    });

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
            {children}
        </GoogleMapsContext.Provider>
    );
};
