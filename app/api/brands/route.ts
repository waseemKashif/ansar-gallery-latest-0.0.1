import { NextResponse } from "next/server";
import axios from "axios";

// Helper function to slugify brand name for logo URL
function slugifyBrandName(name: string): string {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s*:\s*/g, '-')    // Replace colons with hyphens
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

// Generate multiple possible logo URL variations
function generateLogoUrlVariations(brandName: string): string[] {
  const variations: string[] = [];
  const baseUrl = 'https://media-qatar.ansargallery.com/brands/logo';
  
  // Primary slugification
  const slug1 = slugifyBrandName(brandName);
  variations.push(`${baseUrl}/${slug1}.png`);
  variations.push(`${baseUrl}/${slug1}.jpg`);
  
  // Try without special characters (remove everything after colon)
  const nameWithoutColon = brandName.split(':')[0].trim();
  if (nameWithoutColon !== brandName) {
    const slug2 = slugifyBrandName(nameWithoutColon);
    variations.push(`${baseUrl}/${slug2}.png`);
    variations.push(`${baseUrl}/${slug2}.jpg`);
  }
  
  // Try with underscores instead of hyphens
  const slug3 = slug1.replace(/-/g, '_');
  variations.push(`${baseUrl}/${slug3}.png`);
  variations.push(`${baseUrl}/${slug3}.jpg`);
  
  // Try removing common prefixes/suffixes
  const cleaned = brandName.replace(/^(al|el|the)\s+/i, '').trim();
  if (cleaned !== brandName) {
    const slug4 = slugifyBrandName(cleaned);
    variations.push(`${baseUrl}/${slug4}.png`);
    variations.push(`${baseUrl}/${slug4}.jpg`);
  }
  
  // Remove duplicates
  return [...new Set(variations)];
}

// Construct logo URL from brand name
// For brands with colons (like "Agthia : Al Ain"), prioritize the part before colon
function constructLogoUrl(brandName: string): string {
  const baseUrl = 'https://media-qatar.ansargallery.com/brands/logo';
  
  // If name contains colon, try part before colon first (more likely to match filename)
  if (brandName.includes(':')) {
    const beforeColon = brandName.split(':')[0].trim();
    const slug = slugifyBrandName(beforeColon);
    return `${baseUrl}/${slug}.png`;
  }
  
  // Otherwise use full name
  const slug = slugifyBrandName(brandName);
  return `${baseUrl}/${slug}.png`;
}

export async function GET(request: Request) {
  const token = process.env.NEXT_PUBLIC_API_TOKEN;
  const { searchParams } = new URL(request.url);
  const zoneParam = searchParams.get("zone");

  if (!token) {
    return NextResponse.json(
      { items: [], error: "API token not configured" },
      { status: 500 }
    );
  }

  try {
    // Method 1: Try to get manufacturers from attribute options endpoint
    try {
      const manufacturersResponse = await axios.get(
        "https://www.ansargallery.com/en/rest/V1/products/attributes/manufacturer/options",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(zoneParam && { zoneNumber: zoneParam }),
          },
        }
      );

      if (manufacturersResponse.data && Array.isArray(manufacturersResponse.data)) {
        const brands = manufacturersResponse.data
          .filter((item: any) => item.value && item.label)
          .map((item: any) => {
            // Extract logo from various possible fields
            let logo: string | undefined;
            
            // Check for swatch_value (common in Magento for visual attributes)
            if (item.swatch_value) {
              logo = item.swatch_value;
            }
            // Check for image field
            else if (item.image) {
              logo = item.image;
            }
            // Check for logo field
            else if (item.logo) {
              logo = item.logo;
            }
            // Check for swatch_data
            else if (item.swatch_data?.value) {
              logo = item.swatch_data.value;
            }
            // Check for thumbnail
            else if (item.thumbnail) {
              logo = item.thumbnail;
            }
            // Check for swatch_data.thumbnail
            else if (item.swatch_data?.thumbnail) {
              logo = item.swatch_data.thumbnail;
            }
            // Check nested structures
            else if (item.custom_attributes) {
              const logoAttr = item.custom_attributes.find((attr: any) => 
                attr.attribute_code === 'logo' || 
                attr.attribute_code === 'brand_logo' ||
                attr.attribute_code === 'manufacturer_logo'
              );
              if (logoAttr?.value) {
                logo = logoAttr.value;
              }
            }
            
            // Construct full URL if logo is a relative path
            if (logo && !logo.startsWith('http')) {
              // If it's a relative path, construct the full URL
              if (logo.startsWith('/')) {
                logo = `https://media-qatar.ansargallery.com${logo}`;
              } else {
                logo = `https://media-qatar.ansargallery.com/${logo}`;
              }
            }
            
            // If no logo found in API response, construct it from brand name
            if (!logo && item.label) {
              logo = constructLogoUrl(item.label);
            }
            
            // Always provide a logo (use default if none found)
            if (!logo) {
              logo = 'https://media-qatar.ansargallery.com/brands/default-brand.png';
            }
            
            return {
              id: item.value,
              name: item.label,
              value: item.value,
              logo: logo,
            };
          });

        if (brands.length > 0) {
          return NextResponse.json({ items: brands });
        }
      }
    } catch (attrError) {
      // Attribute options endpoint failed, trying filters endpoint
    }

    // Method 2: Try to get manufacturers from category filters
    try {
      const response = await axios.get(
        "https://www.ansargallery.com/en/rest/V1/catalog/filters/2",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(zoneParam && { zoneNumber: zoneParam }),
          },
        }
      );

      const filters = Array.isArray(response.data) ? response.data : [];
      const manufacturerFilter = filters.find(
        (filter: any) =>
          filter?.field === "manufacturer" ||
          filter?.attribute_code === "manufacturer" ||
          filter?.code === "manufacturer"
      );

      if (manufacturerFilter?.options && Array.isArray(manufacturerFilter.options)) {
        const brands = manufacturerFilter.options
          .filter((option: any) => option.value && option.label)
          .map((option: any) => {
            // Extract logo from various possible fields
            let logo: string | undefined;
            
            // Check for swatch_value (common in Magento for visual attributes)
            if (option.swatch_value) {
              logo = option.swatch_value;
            }
            // Check for image field
            else if (option.image) {
              logo = option.image;
            }
            // Check for logo field
            else if (option.logo) {
              logo = option.logo;
            }
            // Check for swatch_data
            else if (option.swatch_data?.value) {
              logo = option.swatch_data.value;
            }
            // Check for thumbnail
            else if (option.thumbnail) {
              logo = option.thumbnail;
            }
            // Check for swatch_data.thumbnail
            else if (option.swatch_data?.thumbnail) {
              logo = option.swatch_data.thumbnail;
            }
            
            // Construct full URL if logo is a relative path
            if (logo && !logo.startsWith('http')) {
              // If it's a relative path, construct the full URL
              if (logo.startsWith('/')) {
                logo = `https://media-qatar.ansargallery.com${logo}`;
              } else {
                logo = `https://media-qatar.ansargallery.com/${logo}`;
              }
            }
            
            // If no logo found in API response, construct it from brand name
            if (!logo && option.label) {
              logo = constructLogoUrl(option.label);
            }
            
            // Always provide a logo (use default if none found)
            if (!logo) {
              logo = 'https://media-qatar.ansargallery.com/brands/default-brand.png';
            }
            
            return {
              id: option.value,
              name: option.label,
              value: option.value,
              logo: logo,
            };
          });

        if (brands.length > 0) {
          return NextResponse.json({ items: brands });
        }
      }
    } catch (filterError) {
      // Filters endpoint failed
    }

    // Method 3: Try the filter/list endpoint which might have manufacturer data with images
    try {
      const filterListResponse = await axios.post(
        "https://www.ansargallery.com/en/rest/V1/ahmarket/products/filter/list/",
        { query: "" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(zoneParam && { zoneNumber: zoneParam }),
          },
        }
      );
      
      // Look for manufacturer in the filters
      if (filterListResponse.data && Array.isArray(filterListResponse.data)) {
        const manufacturerFilter = filterListResponse.data.find(
          (filter: any) => filter.code === "manufacturer" || filter.attribute_code === "manufacturer"
        );
        
        if (manufacturerFilter?.options && Array.isArray(manufacturerFilter.options)) {
          const brands = manufacturerFilter.options
            .filter((option: any) => option.value && option.label)
            .map((option: any) => {
              let logo: string | undefined;
              
              // Check all possible logo fields
              if (option.swatch_value) logo = option.swatch_value;
              else if (option.image) logo = option.image;
              else if (option.logo) logo = option.logo;
              else if (option.thumbnail) logo = option.thumbnail;
              else if (option.swatch_data?.value) logo = option.swatch_data.value;
              else if (option.swatch_data?.thumbnail) logo = option.swatch_data.thumbnail;
              
              // Construct full URL if logo is a relative path
              if (logo && !logo.startsWith('http')) {
                if (logo.startsWith('/')) {
                  logo = `https://media-qatar.ansargallery.com${logo}`;
                } else {
                  logo = `https://media-qatar.ansargallery.com/${logo}`;
                }
              }
              
              // If no logo found, construct it from brand name
              if (!logo && option.label) {
                logo = constructLogoUrl(option.label);
              }
              
              // Always provide a logo (use default if none found)
              if (!logo) {
                logo = 'https://media-qatar.ansargallery.com/brands/default-brand.png';
              }
              
              return {
                id: option.value,
                name: option.label,
                value: option.value,
                logo: logo,
              };
            });

          if (brands.length > 0) {
            return NextResponse.json({ items: brands });
          }
        }
      }
    } catch (filterListError) {
      // Filter/list endpoint failed
    }

    // If all methods fail, return empty array
    return NextResponse.json({ items: [] });
  } catch (error: any) {
    // Return empty array to prevent UI errors
    return NextResponse.json(
      { items: [], error: "Failed to fetch brands" },
      { status: 200 }
    );
  }
}

