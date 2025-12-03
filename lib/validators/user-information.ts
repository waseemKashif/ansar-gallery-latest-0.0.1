import { z } from "zod";

export const userInformationSchema = z.object({
    personalInfo: z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required").optional(),
        email: z.string().email("Invalid email address").optional(),
        phone: z.string().regex(/^\+974\s?(3|5|6|7)\d{7}$/).refine((value) => {
            const qatarMobileRegex = /^\+974\s?(3|5|6|7)\d{7}$/;
            return qatarMobileRegex.test(value);
        }, "Enter a valid Qatar mobile number"),
    }),
    deliveryInfo: z.object({
        street: z.string().min(1, "Street address is required"),
        building: z.string().min(1, "Building number is required"),
        floor: z.string().min(1, "Floor number is required").optional(),
        flatNo: z.string().min(1, "Flat number is required").optional(),
        city: z.string().min(1, "City is required").optional(),
        area: z.string().min(1, "Area is required").optional(),
        landmark: z.string().min(1, "Landmark is required").optional(),
        latitude: z.string().min(1, "Latitude is required"),
        longitude: z.string().min(1, "Longitude is required"),
        isDefault: z.boolean().default(false),
    }),
    mapLocation: z.object({
        latitude: z.string().min(1, "Latitude is required"),
        longitude: z.string().min(1, "Longitude is required"),
    }),
});

export type UserInformation = z.infer<typeof userInformationSchema>;
