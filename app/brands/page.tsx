"use client";

import { useState, useMemo, useRef, useEffect } from "react";

// Helper to generate logo URL variations for fallback
function generateLogoVariations(brandName: string, currentUrl: string): string[] {
  const variations: string[] = [];
  const baseUrl = 'https://media-qatar.ansargallery.com/brands/logo';
  
  // Helper to slugify
  const slugify = (name: string) => name
    .toLowerCase()
    .trim()
    .replace(/\s*:\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
  
  // If current URL already tried, generate alternatives
  if (brandName.includes(':')) {
    // Try part before colon
    const beforeColon = brandName.split(':')[0].trim();
    const slug1 = slugify(beforeColon);
    variations.push(`${baseUrl}/${slug1}.png`);
    variations.push(`${baseUrl}/${slug1}.jpg`);
    
    // Try full name
    const slug2 = slugify(brandName);
    variations.push(`${baseUrl}/${slug2}.png`);
    variations.push(`${baseUrl}/${slug2}.jpg`);
    
    // Try part after colon
    const afterColon = brandName.split(':')[1]?.trim();
    if (afterColon) {
      const slug3 = slugify(afterColon);
      variations.push(`${baseUrl}/${slug3}.png`);
      variations.push(`${baseUrl}/${slug3}.jpg`);
    }
  } else {
    // Try .jpg if .png failed
    const currentSlug = currentUrl.replace(baseUrl + '/', '').replace(/\.(png|jpg)$/, '');
    variations.push(`${baseUrl}/${currentSlug}.jpg`);
  }
  
  return variations.filter(url => url !== currentUrl);
}
import { useBrands } from "@/hooks/useBrands";
import PageContainer from "@/components/pageContainer";
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import { Brand } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useZoneStore } from "@/store/useZoneStore";
import BrandCardSkeleton from "@/components/shared/brand/brandCardSkeleton";

// Generate alphabet array
const alphabet = ["0-9", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

// Component to handle logo loading with fallback variations
function BrandLogoWithFallback({ 
  brand, 
  onImageLoad 
}: { 
  brand: Brand;
  onImageLoad?: () => void;
}) {
  const defaultLogoUrl = 'https://media-qatar.ansargallery.com/brands/default-brand.png';
  // Start with brand logo if available, otherwise use default
  const [currentLogoUrl, setCurrentLogoUrl] = useState(brand.logo || defaultLogoUrl);
  const [showFallback, setShowFallback] = useState(false);
  const hasNotifiedRef = useRef(false);
  
  // Use refs to track attempts and prevent infinite loops
  const triedUrlsRef = useRef<Set<string>>(new Set([brand.logo || defaultLogoUrl]));
  const isProcessingRef = useRef(false);
  const maxAttempts = 10; // Maximum number of attempts to prevent infinite loops

  const notifyLoaded = () => {
    if (!hasNotifiedRef.current && onImageLoad) {
      hasNotifiedRef.current = true;
      onImageLoad();
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Prevent multiple simultaneous error handlers
    if (isProcessingRef.current) return;
    
    const img = e.currentTarget;
    const failedUrl = img.src;
    
    // Mark this URL as tried
    triedUrlsRef.current.add(failedUrl);
    
    // Prevent infinite loops
    if (triedUrlsRef.current.size > maxAttempts) {
      img.style.display = 'none';
      setShowFallback(true);
      notifyLoaded(); // Notify even on final failure
      return;
    }
    
    isProcessingRef.current = true;
    
    // Generate variations
    const variations = generateLogoVariations(brand.name, failedUrl);
    
    // Find next URL to try that hasn't been tried yet
    let nextUrl: string | null = null;
    
    // Try variations first
    for (const variation of variations) {
      if (!triedUrlsRef.current.has(variation)) {
        nextUrl = variation;
        break;
      }
    }
    
    // If no variation found, try default logo
    if (!nextUrl && !triedUrlsRef.current.has(defaultLogoUrl)) {
      nextUrl = defaultLogoUrl;
    }
    
    if (nextUrl) {
      triedUrlsRef.current.add(nextUrl);
      setCurrentLogoUrl(nextUrl);
      // Use setTimeout to allow state to update before setting src
      setTimeout(() => {
        img.src = nextUrl!;
        isProcessingRef.current = false;
      }, 0);
    } else {
      // All options exhausted, show fallback
      img.style.display = 'none';
      setShowFallback(true);
      isProcessingRef.current = false;
      notifyLoaded(); // Notify when all attempts exhausted
    }
  };

  const handleLoad = () => {
    setShowFallback(false);
    isProcessingRef.current = false;
    notifyLoaded(); // Notify when image successfully loads
  };

  // Reset when brand changes
  useEffect(() => {
    triedUrlsRef.current = new Set([brand.logo || defaultLogoUrl]);
    isProcessingRef.current = false;
    setShowFallback(false);
    hasNotifiedRef.current = false;
  }, [brand.id, brand.logo]);

  return (
    <>
      <Image
        src={currentLogoUrl}
        alt={brand.name}
        width={100}
        height={100}
        className="object-contain w-full"
        onError={handleError}
        onLoad={handleLoad}
      />
      {showFallback && (
        <div className="logo-fallback text-xs text-neutral-500 dark:text-neutral-400 text-center px-2 absolute inset-0 flex items-center justify-center">
          {brand.name}
        </div>
      )}
    </>
  );
}

export default function BrandsPage() {
  const [selectedLetter, setSelectedLetter] = useState<string>("All");
  const zone = useZoneStore((state) => state.zone);
  const { data, isLoading, error } = useBrands(zone);
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [isImagesLoading, setIsImagesLoading] = useState(true);
  
  // Get total number of brands to track
  const totalBrands = useMemo(() => {
    return data?.items?.length || 0;
  }, [data]);

  // Track when all images are loaded
  useEffect(() => {
    if (totalBrands > 0 && imagesLoadedCount >= totalBrands) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsImagesLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [imagesLoadedCount, totalBrands]);

  // Reset image loading state when data changes
  useEffect(() => {
    if (data?.items && data.items.length > 0) {
      setIsImagesLoading(true);
      setImagesLoadedCount(0);
      
      // Timeout fallback: if images take more than 10 seconds, show brands anyway
      const timeoutTimer = setTimeout(() => {
        setIsImagesLoading(false);
      }, 10000);
      
      return () => clearTimeout(timeoutTimer);
    }
  }, [data]);

  const handleImageLoad = () => {
    setImagesLoadedCount((prev) => prev + 1);
  };


  // Group brands by first letter
  const groupedBrands = useMemo(() => {
    if (!data?.items) return {};

    const groups: Record<string, Brand[]> = {};

    data.items.forEach((brand) => {
      const firstChar = brand.name.charAt(0).toUpperCase();
      let groupKey: string;

      // Check if it's a number
      if (/[0-9]/.test(firstChar)) {
        groupKey = "0-9";
      } else if (/[A-Z]/.test(firstChar)) {
        groupKey = firstChar;
      } else {
        // For special characters, put in "0-9" or "A"
        groupKey = "0-9";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(brand);
    });

    // Sort brands within each group
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [data]);

  // Get brands to display based on selected letter
  const displayBrands = useMemo(() => {
    if (selectedLetter === "All") {
      // Return all brands grouped by letter
      return groupedBrands;
    }
    // Return only brands for selected letter
    return { [selectedLetter]: groupedBrands[selectedLetter] || [] };
  }, [selectedLetter, groupedBrands]);

  // Get sorted group keys
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedBrands).sort((a, b) => {
      if (a === "0-9") return -1;
      if (b === "0-9") return 1;
      return a.localeCompare(b);
    });
  }, [groupedBrands]);

  if (isLoading || (data?.items && isImagesLoading)) {
    return (
      <PageContainer>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
        <Heading level={1} className="text-3xl md:text-4xl font-bold mb-6 mt-4" title="Brands">
          Brands
        </Heading>
        <div className="bg-white p-4">
          {/* Alphabetical Filter Skeleton */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
              Browse By Alphabet
            </h2>
            <div className="flex flex-wrap gap-2">
              {[...Array(27)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"
                />
              ))}
            </div>
          </div>

          {/* Brands Grid Skeleton */}
          <div className="space-y-8">
            {[...Array(3)].map((_, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                {/* Group header skeleton */}
                <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                {/* Brand cards skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <BrandCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="py-8 text-center text-red-500">Failed to load brands</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />

      <Heading level={1} className="text-3xl md:text-4xl font-bold mb-6 mt-4" title="Brands">
        Brands
      </Heading>
      <div className="bg-white p-4">
        {/* Alphabetical Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-neutral-300">
            Browse By Alphabet
          </h2>
          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={() => setSelectedLetter("All")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${selectedLetter === "All"
                ? "bg-green-600 text-white"
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                }`}
            >
              All
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${selectedLetter === letter
                  ? "bg-green-600 text-white"
                  : " border dark:bg-neutral-800 text-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                  }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Brands Grid */}
        <div className="space-y-8">
          {selectedLetter === "All" ? (
            // Show all groups when "All" is selected
            sortedGroupKeys.map((groupKey) => {
              const brands = groupedBrands[groupKey];
              if (!brands || brands.length === 0) return null;

              return (
                <div key={groupKey} className="space-y-4">
                  <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                    {groupKey}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/?search=${encodeURIComponent(brand.name)}&manufacturer=${brand.value}`}
                        className="flex flex-col items-center py-2 bg-white dark:bg-neutral-800  border border-neutral-200 dark:border-neutral-700 hover:border-green-500 dark:hover:border-green-500 transition-colors group"
                      >
                        <div className="flex items-center justify-center overflow-hidden relative">
                          <BrandLogoWithFallback brand={brand} onImageLoad={handleImageLoad} />
                        </div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 text-center line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mt-1">
                          {brand.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Show only selected letter group
            displayBrands[selectedLetter] && displayBrands[selectedLetter].length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                  {selectedLetter}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {displayBrands[selectedLetter].map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/?search=${encodeURIComponent(brand.name)}&manufacturer=${brand.value}`}
                      className="flex flex-col items-center p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-green-500 dark:hover:border-green-500 transition-colors group"
                    >
                      <div className="flex items-center justify-center overflow-hidden relative">
                        <BrandLogoWithFallback brand={brand} onImageLoad={handleImageLoad} />
                      </div>
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 text-center line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mt-1">
                          {brand.name}
                        </p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                No brands found for "{selectedLetter}"
              </div>
            )
          )}
        </div>
      </div>

      {!data?.items || data.items.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">No brands available</div>
      ) : null}
    </PageContainer>
  );
}

