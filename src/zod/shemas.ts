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
});

export const loginZodSchema = zodSchema.pick({ email: true, password: true });
export const registerZodSchema = zodSchema.pick({ firstName: true, lastName: true, email: true, password: true });
export const resetPasswordZodSchema = zodSchema.pick({ email: true });
export const userZodSchema = zodSchema.pick({ firstName: true, lastName: true});
export const companyCreateZodSchema = zodSchema.pick({ title: true, email: true, description: true });
export const companyUpdateZodSchema = zodSchema.pick({ title: true, description: true });

// Схема для создания события
export const eventCreateZodSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description is too long"),
    venue: z.string().min(1, "Venue is required").max(200, "Venue is too long"),
    formatId: z.number().int().positive("Format is required"),
    locationCoordinates: z
        .string()
        .regex(
            /^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/,
            "Coordinates must be in the format 'lat,lng' (e.g., '50.4501,30.5234')"
        ),
    startedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
    endedAt: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
});

// Схема для обновления события (без companyId)
export const eventUpdateZodSchema = eventCreateZodSchema.omit({ companyId: true });

// Дополнительная проверка: endedAt должен быть позже startedAt
export const validateEventDates = (data: {
    startedAt: string;
    endedAt: string;
}) => {
    const start = new Date(data.startedAt);
    const end = new Date(data.endedAt);
    if (end <= start) {
        throw new Error("End date must be after start date");
    }
};