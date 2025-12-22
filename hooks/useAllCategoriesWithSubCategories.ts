import { useQuery } from "@tanstack/react-query";
import { fetchAllCategoriesWithSubCategories } from "@/lib/api";
import { useZoneStore } from "@/store/useZoneStore";
import { useLocale } from "@/hooks/useLocale";
import { CategoriesWithSubCategories, SectionItem } from "@/types";
import { slugify } from "@/lib/utils";

export const useAllCategoriesWithSubCategories = () => {
    const { zone } = useZoneStore();
    const { locale } = useLocale();

    return useQuery({
        queryKey: ["allCategoriesWithSubCategories", zone, locale],
        queryFn: async () => {
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

            // 3. If we have English data, merge slugs
            if (englishData) {
                return mergeSlugs(currentData, englishData);
            }

            // 4. Default: just add self-generated slugs (for 'en')
            return addSelfSlugs(currentData);
        },
    });
};

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