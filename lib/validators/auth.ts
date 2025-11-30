import { z } from "zod";

export const authSchema = z.object({
    emailOrMobile: z
        .string()
        .min(1, "Email or mobile number is required")
        .refine((value) => {
            const qatarMobileRegex = /^(\+974)?\s?(3|5|6|7)\d{7}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return qatarMobileRegex.test(value) || emailRegex.test(value);
        }, "Enter a valid Qatar mobile number or email"),
});
