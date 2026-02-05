
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PromotionsView from "@/components/promotions/PromotionsView";
import { fetchCustomProductsServer, fetchBannersServer } from "@/lib/metadata-server";
import { ProductRequestBody, BannersData } from "@/types";
import { cookies } from "next/headers";

interface PageProps {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PromotionsPage({ params, searchParams }: PageProps) {
    const { lang: locale } = await params;
    const sp = await searchParams;

    const page = Number(sp.p) || 1;
    const limit = Number(sp.limit) || 30;
    const idParam = sp.id as string | undefined;

    const cookieStore = await cookies();
    const zone = cookieStore.get("zone")?.value;

    let body: ProductRequestBody;

    if (!idParam) {
        // Case: Default Promotions Page
        body = {
            page: page,
            limit: limit,
            category_id: ["2"],
            method: "promotion",
            filters: []
        };
    } else {
        // Check if id contains "product_tags="
        const tagMatch = idParam.match(/product_tags=(\d+)/);

        if (tagMatch) {
            // Case: Promotional Tag
            const tagId = tagMatch[1];
            body = {
                page: page,
                limit: limit,
                category_id: ["2"],
                method: "promotion",
                filters: [
                    {
                        code: "promo_tag",
                        options: [tagId]
                    }
                ]
            };
        } else if (idParam === "new_arrival=2") {
            // Case: New Arrival
            body = {
                page: page,
                limit: limit,
                category_id: [2],
                method: "new_arrival",
                filters: []
            };
        } else {
            // Case: Simple Category ID (numeric) or Fallback
            body = {
                page: page,
                limit: limit,
                category_id: [idParam],
                method: "catalog_list",
                filters: []
            };
        }
    }

    // Fetch products
    const productData = await fetchCustomProductsServer(body, locale, zone);
    const products = productData?.items || [];
    const totalCount = productData?.total_count || 0;

    // Fetch banner title
    let bannerTitle: string | null = null;
    if (idParam) {
        try {
            const banners = await fetchBannersServer(locale, zone);
            if (banners) {
                const matchingBanner = banners.find((b: BannersData) => b.category_id === idParam);
                if (matchingBanner?.title) {
                    bannerTitle = matchingBanner.title;
                }
            }
        } catch (error) {
            console.error("Error fetching banner title server-side:", error);
        }
    }

    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
            <PromotionsView
                products={products}
                totalCount={totalCount}
                bannerTitle={bannerTitle}
                page={page}
                limit={limit}
            />
        </Suspense>
    );
}
