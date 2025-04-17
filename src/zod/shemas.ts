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