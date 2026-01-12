"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBrandProducts } from "@/hooks/useBrandProducts";
import { useBrands } from "@/hooks/useBrands";
import PageContainer from "@/components/pageContainer";
import Heading from "@/components/heading";
import { Breadcrumbs } from "@/components/breadcurmbsComp";
import { Brand } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useZoneStore } from "@/store/useZoneStore";
import CatalogProductCard from "@/components/shared/product/catalogProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Search } from "lucide-react";
import placeholderImage from "@/public/images/placeholder.jpg";

function makeSlug(name: string): string {
  return name.toLowerCase().replace(/[\s/]+/g, "-");
}

function getBrandFromSlug(slug: string, brands: Brand[]): Brand | null {
  return brands.find(brand => (brand.url_key && brand.url_key === slug) || makeSlug(brand.name) === slug) || null;
}

export default function BrandPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const zone = useZoneStore((state) => state.zone);
  const { data: brandsData } = useBrands(zone);
  const [sortBy, setSortBy] = useState<string>("position");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Find brand from slug
  const brand = useMemo(() => {
    const brandsList = brandsData?.brands || brandsData?.items;
    if (!brandsList || !slug) return null;
    return getBrandFromSlug(slug, brandsList);
  }, [brandsData, slug]);

  // Fetch products for the brand
  const { data: productsData, isLoading, error } = useBrandProducts(
    brand?.brand_id || "",
    currentPage,
    limit,
    zone
  );

  // Redirect if brand not found
  useEffect(() => {
    if (brandsData && !brand && slug) {
      router.push("/brands");
    }
  }, [brand, brandsData, slug, router]);

  const products = productsData?.items || [];
  const totalCount = productsData?.total_count || 0;
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalCount);

  // Reset to page 1 when limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [limit]);

  // Sort products
  const sortedProducts = useMemo(() => {
    if (!products.length) return [];

    const sorted = [...products];
    switch (sortBy) {
      case "name_asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name_desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "price_asc":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price_desc":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading || !brand) {
    return (
      <PageContainer>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brand" }, { label: "Loading..." }]} />
        <div className="py-8 text-center">Loading...</div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brand" }, { label: "Error" }]} />
        <div className="py-8 text-center text-red-500">Failed to load products</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Brand", href: "/brand" },
          { label: brand.name }
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-black text-white p-4">
            <h2 className="text-lg font-semibold text-green-500">Shop By Brand</h2>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-4">
            <Link
              href="/brands"
              className="block text-neutral-700 hover:text-green-600 transition-colors"
            >
              Shop Brand Options
            </Link>
            <div className="space-y-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center justify-between w-full cursor-pointer hover:text-green-600 transition-colors"
              >
                <span className="text-sm text-neutral-700">Search brand</span>
                {isSearchOpen ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </button>
              {isSearchOpen && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search a brand"
                    className="w-full px-3 py-2 pr-10 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push("/brands");
                      }
                    }}
                  />
                  <button
                    onClick={() => router.push("/brands")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-green-600 transition-colors"
                    aria-label="Search brands"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Hero/Banner Section */}
          <div className="bg-white mb-6 relative overflow-hidden rounded-lg">
            <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-r from-neutral-50 to-neutral-100">
              {/* Brand Logo */}
              {brand.logo && (
                <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={120}
                      height={120}
                      className="object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage.src;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Brand Banner or Gradient Background */}
              {
                brand.brand_banner ? (
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={brand.brand_banner}
                      alt={`${brand.name} Banner`}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/20" /> {/* Overlay for readability */}
                  </div>
                ) : (
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-9/10 flex items-center justify-center">
                    <div className="text-neutral-400 text-xl font-semibold">{brand.name}</div>
                  </div>
                )
              }
            </div>

            {/* Brand Name */}
            <div className="p-4 md:p-6">
              <Heading level={1} className="text-3xl md:text-4xl font-bold text-neutral-800" title={brand.name}>
                {brand.name}
              </Heading>
            </div>
          </div>

          {/* Brand Description */}
          {(brand.description || brand.short_description) && (
            <div className="bg-white p-4 md:p-6 mb-6 rounded-lg">
              <div
                className="text-neutral-700 leading-relaxed prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: brand.description || brand.short_description }}
              />
            </div>
          )}

          {/* Product Listing Controls */}
          <div className="bg-white p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-neutral-600">
              Items {startItem}-{endItem} of {totalCount}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Sort By:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="position">Position</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedProducts.map((product) => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 text-center text-neutral-500 rounded-lg">
              No products found for {brand.name}
            </div>
          )}

          {/* Pagination and Show per page */}
          {totalCount > 0 && (
            <div className="mt-6 bg-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Pagination - Only show if more than one page */}
              {totalPages > 1 ? (
                <div className="flex items-center gap-2">
                  {/* Previous arrow button */}
                  {currentPage > 1 && (
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="px-4 py-2 bg-white text-black border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center"
                    >
                      <ChevronLeft className="h-4 w-4 text-neutral-600" />
                    </button>
                  )}
                  {/* Show up to 5 page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 min-w-[40px] text-sm font-medium transition-colors ${currentPage === pageNum
                          ? "bg-black text-white"
                          : "bg-white text-black border border-neutral-300 hover:bg-neutral-50"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {/* Next arrow button */}
                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className="px-4 py-2 bg-white text-black border border-neutral-300 hover:bg-neutral-50 flex items-center justify-center"
                    >
                      <ChevronRight className="h-4 w-4 text-neutral-600" />
                    </button>
                  )}
                </div>
              ) : (
                <div></div>
              )}

              {/* Show per page - Always show when there are products */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-700">Show</span>
                <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
                  <SelectTrigger className="w-[80px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="90">90</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-neutral-700">per page</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

