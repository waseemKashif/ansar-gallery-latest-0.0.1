const map: Record<string, number> = {
    "Mobile Phones": 4,
    "mobile-phones": 4,
    "electronics": 5,
    "beauty-care": 238,
    "household": 431,
    "baby-infants": 525,
    "books": 820,
    "sports-outdoors": 598,
    "stationery": 198,
    "toys": 249,
    "music": 250,
    "automotive": 648,
    "home-office-furnishing": 7,
    "celebrations-occasions": 743,

};

export default function getCategoryIdFromSlug(slug: string) {
    // If slug ends with digits, extract them as ID
    const match = slug.match(/(\d+)$/);
    if (match) {
        return Number(match[1]);
    }

    // Fallback to legacy map logic
    const cleanSlug = slug.replace("%", "").replace(" ", "-");
    return map[cleanSlug] || map[slug];
}
