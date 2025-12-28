import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CategoriesWithSubCategories, SectionItem } from '@/types';
import { fetchAllCategoriesWithSubCategories } from '@/lib/api';
import { slugify } from '@/lib/utils';

interface CategoryState {
    categories: CategoriesWithSubCategories[] | null;
    isLoading: boolean;
    error: any | null;
    lastFetched: number;
    cacheZone: string | null;
    cacheLocale: string | null;

    fetchCategories: (zone: string | null, locale: string) => Promise<void>;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set, get) => ({
            categories: null,
            isLoading: false,
            error: null,
            lastFetched: 0,
            cacheZone: null,
            cacheLocale: null,

            fetchCategories: async (zone, locale) => {
                const state = get();
                const now = Date.now();

                // Check cache validity
                const isSameZone = state.cacheZone === zone;
                const isSameLocale = state.cacheLocale === locale;
                const isCacheValid = (now - state.lastFetched) < CACHE_DURATION;

                if (state.categories && isSameZone && isSameLocale && isCacheValid) {
                    return; // Cache hit, do nothing
                }

                set({ isLoading: true, error: null });

                try {
                    // 1. Fetch current locale data
                    const currentDataPromise = fetchAllCategoriesWithSubCategories(zone, locale);

                    // 2. If locale is NOT 'en', fetch 'en' data too
                    let englishDataPromise: Promise<CategoriesWithSubCategories[]> | undefined;
                    if (locale !== "en") {
                        englishDataPromise = fetchAllCategoriesWithSubCategories(zone, "en");
                    }

                    const [currentData, englishData] = await Promise.all([
                        currentDataPromise,
                        englishDataPromise
                    ]);

                    let processedData = currentData;

                    // 3. If we have English data, merge slugs
                    if (englishData) {
                        processedData = mergeSlugs(currentData, englishData);
                    } else {
                        // 4. Default: just add self-generated slugs (for 'en')
                        processedData = addSelfSlugs(currentData);
                    }

                    set({
                        categories: processedData,
                        lastFetched: now,
                        cacheZone: zone,
                        cacheLocale: locale,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error("Failed to fetch categories:", error);
                    set({ error, isLoading: false });
                }
            },
        }),
        {
            name: 'category-store',
            partialize: (state) => ({
                categories: state.categories,
                lastFetched: state.lastFetched,
                cacheZone: state.cacheZone,
                cacheLocale: state.cacheLocale
            }),
        }
    )
);

// --- Helper Functions (Moved from original hook) ---

// Recursive function to merge English slugs into Localized tree
function mergeSlugs(
    localized: CategoriesWithSubCategories[],
    english: CategoriesWithSubCategories[]
): CategoriesWithSubCategories[] {
    // Map English items by ID for O(1) lookup
    const englishMap = new Map<string, SectionItem | CategoriesWithSubCategories>();

    const addToMap = (items: (CategoriesWithSubCategories | SectionItem)[]) => {
        items.forEach(item => {
            englishMap.set(String(item.id), item);
            if (item.section && item.section.length > 0) {
                addToMap(item.section);
            }
        });
    };
    addToMap(english);

    // Helper to traverse and update
    const traverseAndUpdate = (items: (CategoriesWithSubCategories | SectionItem)[]) => {
        return items.map(item => {
            const englishItem = englishMap.get(String(item.id));
            const newItem = { ...item };

            // Set slug from English title if available, else fallback to own title
            if (englishItem) {
                newItem.slug = slugify(englishItem.title);
            } else {
                newItem.slug = slugify(item.title);
            }

            // Recurse
            if (newItem.section && newItem.section.length > 0) {
                newItem.section = traverseAndUpdate(newItem.section) as any;
            }
            return newItem;
        });
    };

    return traverseAndUpdate(localized) as CategoriesWithSubCategories[];
}

// Helper to add self-slugs (when locale IS 'en')
function addSelfSlugs(items: (CategoriesWithSubCategories | SectionItem)[]): CategoriesWithSubCategories[] {
    return items.map(item => {
        const newItem = { ...item };
        newItem.slug = slugify(item.title);
        if (newItem.section && newItem.section.length > 0) {
            newItem.section = addSelfSlugs(newItem.section) as any;
        }
        return newItem as CategoriesWithSubCategories;
    }) as CategoriesWithSubCategories[];
}
