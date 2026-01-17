import { FilterType } from "@/types";

/**
 * Parses URLSearchParams into an array of FilterType objects for the API.
 * 
 * Expected URL format:
 * ?manufacturer=7&category=75,1031&price=0,2680&color=1177,1179
 */
export const parseUrlParamsToFilters = (searchParams: URLSearchParams): FilterType[] => {
    const filters: FilterType[] = [];
    const ignoredParams = ["page", "limit", "sort", "p", "q"]; // Params that are not filters

    searchParams.forEach((value, key) => {
        if (ignoredParams.includes(key)) return;

        // Price is a special case (min,max)
        if (key === "price") {
            const [min, max] = value.split(",").map(Number);
            if (!isNaN(min) && !isNaN(max)) {
                filters.push({
                    code: "price",
                    options: [min, max]
                });
            }
        } else {
            // Other filters are usually comma-separated lists of IDs
            const options = value.split(",").map(v => {
                const num = Number(v);
                return isNaN(num) ? v : num;
            });

            filters.push({
                code: key,
                options: options
            });
        }
    });

    return filters;
};

/**
 * Converts a FilterType array (or partial updates) into a URL search string.
 * This helper is useful if we want to construct the URL from the filters state.
 */
export const filtersToUrlSearchString = (filters: Record<string, (string | number)[]>, existingParams: URLSearchParams): string => {
    const params = new URLSearchParams(existingParams);

    Object.entries(filters).forEach(([code, options]) => {
        if (!options || options.length === 0) {
            params.delete(code);
            return;
        }

        // Join options with comma
        params.set(code, options.join(","));
    });

    // Reset page on filter change usually
    params.set("p", "1");

    return params.toString();
};

/**
 * Helper for robust string comparison ignoring special chars
 */
export const normalizeForMatch = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
