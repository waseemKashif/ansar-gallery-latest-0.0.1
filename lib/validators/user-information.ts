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
    mapLocation: z.object({
        latitude: z.string().min(1, "Latitude is required"),
        longitude: z.string().min(1, "Longitude is required"),

    }),
});

export const userAddressSchema = z.object({
    street: z.string().min(1, "Street address is required"),
    building: z.string().min(1, "Building number is required"),
    floor: z.string().optional(),
    flatNo: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    landmark: z.string().optional(),
    latitude: z.string().min(1, "Latitude is required"),
    longitude: z.string().min(1, "Longitude is required"),
    isDefault: z.boolean().default(false),
    customer_id: z.number().optional(),
    id: z.number().optional(),
    prefix: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    company: z.string().optional(),
    countryId: z.number().optional(),
    defaultBilling: z.boolean().default(false),
    defaultShipping: z.boolean().default(false),
    telephone: z.string().min(1, "Telephone is required").optional(),
    postcode: z.string().optional(),
})

export type UserInformation = z.infer<typeof userInformationSchema>;
export type UserAddressNew = z.infer<typeof userAddressSchema>;