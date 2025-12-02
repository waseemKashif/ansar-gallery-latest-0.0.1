// apiClient.ts

export interface ApiError {
    message: string;
    status?: number;
}

export const apiClient = async <T>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    try {
        const response = await fetch(url, options);

        // Handle non-200 errors
        if (!response.ok) {
            let message = `HTTP error ${response.status}`;

            // Try reading JSON message from API
            const errorText = await response.text();
            try {
                const errJson = errorText ? JSON.parse(errorText) : null;
                message = errJson?.message || message;
            } catch { /* ignore */ }

            const error: ApiError = { message, status: response.status };
            throw error;
        }

        // Read response text safely
        const text = await response.text();

        if (!text) {
            throw { message: "Empty response from server" } as ApiError;
        }

        try {
            return JSON.parse(text) as T;
        } catch {
            throw { message: "Invalid JSON response received" } as ApiError;
        }

    } catch (err: any) {
        // Network error / CORS / DNS / offline, etc.
        if (err instanceof TypeError) {
            throw { message: "Network error, please check your connection" } as ApiError;
        }

        // Re-throw custom errors
        throw err;
    }
};
