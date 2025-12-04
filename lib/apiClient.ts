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
            return {} as T;
        }

        try {
            return JSON.parse(text) as T;
        } catch {
            // If it's not JSON but we got a 200 OK, it might be a plain text success
            // For now, let's return the text if T allows it, or throw if strict JSON is expected
            // But to be safe for "void" types, we can just return the text casted
            return text as unknown as T;
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
