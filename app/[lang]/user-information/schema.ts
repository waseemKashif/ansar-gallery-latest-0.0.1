import * as z from "zod";

export const addressSchema = z.object({
    id: z.number().optional(), // Important for updates
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().default(""),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    telephone: z.string().min(1, "Phone number is required"),
    street: z.string().min(1, "Address location is required"),
    postcode: z.string().default(""), // Zone
    city: z.string().default("Doha"),
    countryId: z.string().default("QA"),
    region: z.string().default("Qatar"),
    area: z.string().default("Qatar"),
    customLatitude: z.string().min(1, "Location is required"),
    customLongitude: z.string().min(1, "Location is required"),
    customAddressOption: z.string().default("Home"),
    // Optional Fields
    company: z.string().default(""),
    customBuildingName: z.string().default(""),
    customBuildingNumber: z.string().default(""),
    customFloorNumber: z.string().default(""),
    flatNo: z.string().default(""), // Maps to Unit No
    customAddressLabel: z.string().default(""),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
