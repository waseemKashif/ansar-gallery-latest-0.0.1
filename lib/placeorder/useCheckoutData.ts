// useCheckoutData.ts
import { useState, useEffect } from "react";
import { getGuestCheckoutData, getLoggedInCheckoutData } from "./placeorder.service";

interface UseCheckoutDataProps {
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    userId?: string;
    guestQuoteId?: string;
}

export const useCheckoutData = ({
    isAuthenticated,
    isAuthLoading,
    userId,
    guestQuoteId
}: UseCheckoutDataProps) => {
    // eslint-disable-next-line
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Don't fetch until auth state is determined
        if (isAuthLoading) {
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                if (isAuthenticated && userId) {
                    const result = await getLoggedInCheckoutData(userId);
                    setData(result);
                } else if (!isAuthenticated && guestQuoteId) {
                    const result = await getGuestCheckoutData(guestQuoteId);
                    setData(result);
                } else {
                    // No valid ID available
                    setData(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error("Failed to fetch"));
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, isAuthLoading, userId, guestQuoteId]);

    // Function to manually refetch
    const refetch = async () => {
        setIsLoading(true);
        try {
            if (isAuthenticated && userId) {
                const result = await getLoggedInCheckoutData(userId);
                setData(result);
            } else if (!isAuthenticated && guestQuoteId) {
                const result = await getGuestCheckoutData(guestQuoteId);
                setData(result);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch"));
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, error, refetch };
};