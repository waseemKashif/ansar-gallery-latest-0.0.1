import { z } from "zod";

export const authSchema = z.object({
    emailOrMobile: z
        .string()
        .min(1, "Mobile number is required")
        .refine((value) => {
            // Allow 8 digits (since 974 is usually prepended or handled separately, but let's be flexible or stricter if needed)
            // The UI seems to expect just the local part, so 8 digits starting with 3/5/6/7
            const qatarMobileRegex = /^(3|5|6|7)\d{7}$/;
            return qatarMobileRegex.test(value);
        }, "Enter a valid Qatar mobile number"),
});
