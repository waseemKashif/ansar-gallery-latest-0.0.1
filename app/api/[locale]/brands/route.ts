import { NextResponse } from "next/server";
import axios from "axios";

// Placeholder image path - used when API doesn't provide a logo
const PLACEHOLDER_IMAGE = "/images/placeholder.jpg";

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

            if (!logo) {
              logo = PLACEHOLDER_IMAGE;
            }

            // Extract description from various possible fields
            let description: string | undefined;
            if (item.description) {
              description = item.description;
              console.log("Description:", description);
            } else if (item.custom_attributes) {
              const descAttr = item.custom_attributes.find((attr: any) =>
                attr.attribute_code === 'description' ||
                attr.attribute_code === 'brand_description' ||
                attr.attribute_code === 'manufacturer_description'
              );
              if (descAttr?.value) {
                description = descAttr.value;
              }
            }

            return {
              id: item.value,
              name: item.label,
              value: item.value,
              logo: logo,
              description: description,
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

            // Use placeholder if no logo found
            if (!logo) {
              logo = PLACEHOLDER_IMAGE;
            }

            // Extract description if available
            let description: string | undefined;
            if (option.description) {
              description = option.description;
            }
            return {
              id: option.value,
              name: option.label,
              value: option.value,
              logo: logo,
              description: description,
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

              // Use placeholder if no logo found
              if (!logo) {
                logo = PLACEHOLDER_IMAGE;
              }

              // Extract description if available
              let description: string | undefined;
              if (option.description) {
                description = option.description;
              }

              return {
                id: option.value,
                name: option.label,
                value: option.value,
                logo: logo,
                description: description,
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

