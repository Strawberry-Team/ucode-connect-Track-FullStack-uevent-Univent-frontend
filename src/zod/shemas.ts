import { z } from "zod";

export const zodSchema = z.object({
    firstName: z.string().min(3, { message: "Name must be longer than or equal to 3 characters" }),
    lastName: z
        .string()
        .optional()
        .refine(
            (value) => !value || value.length >= 3,
            { message: "Surname must be longer than or equal to 3 characters if provided" }
        ),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/, {message: "Password must contain at least one special character",}),
    title: z.string().min(3, { message: "Title must be longer than or equal to 3 characters" }),
    description: z.string().min(3, { message: "Description must be longer than or equal to 3 characters" }),
    venue: z.string().min(3, { message: "Venue must be longer than or equal to 3 characters" }),
    formatId: z.number().int().positive("Format is required"),
    startedAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
    endedAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
    price: z
        .string()
        .min(1, "Price is required")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, "Price must be a positive number"),
    status: z.enum(["AVAILABLE", "UNAVAILABLE"], { errorMap: () => ({ message: "Status is required" }) }),
    quantity: z
        .string()
        .min(1, "Quantity is required")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, "Quantity must be a positive number"),
    code: z.string().min(5, "Code must contain at least 5 characters.").optional(),
    discountPercent: z
        .string()
        .min(1, "Discount percent is required")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0 && val <= 100, "Discount must be a number between 1 and 100"),
    ticketPurchase: z.record(
        z.string(),
        z.number()
            .min(0, "Ticket quantity cannot be negative")
            .max(10, "Maximum 10 tickets per type allowed")
    ),
});

export const validateEventDates = (data: {
    startedAt: string;
    endedAt: string;
}) => {
    const start = new Date(data.startedAt);
    const end = new Date(data.endedAt);

    if (end <= start) {
        throw new Error("End date must be after start date");
    }

    const minDuration = 60 * 60 * 1000;
    if (end.getTime() - start.getTime() < minDuration) {
        throw new Error("End date must be at least 60 minutes after start date");
    }
};

export const loginZodSchema = zodSchema.pick({ email: true, password: true });
export const registerZodSchema = zodSchema.pick({ firstName: true, lastName: true, email: true, password: true });
export const resetPasswordZodSchema = zodSchema.pick({ email: true });
export const userZodSchema = zodSchema.pick({ firstName: true, lastName: true});
export const companyCreateZodSchema = zodSchema.pick({ title: true, email: true, description: true });
export const companyUpdateZodSchema = zodSchema.pick({ title: true, description: true });
export const eventCreateZodSchema = zodSchema.pick({ title: true, description: true, venue: true, formatId: true, startedAt: true, endedAt: true });
export const newsCreateZodSchema = zodSchema.pick({ title: true,  description: true });
export const ticketCreateZodSchema = zodSchema.pick({ title: true,  price: true, status: true,  quantity: true });
export const promoCodeZodSchema = zodSchema.pick({ title: true,  code: true, discountPercent: true});
export const ticketPurchaseZodSchema = zodSchema.shape.ticketPurchase;