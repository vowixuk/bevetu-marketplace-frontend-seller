import { z } from "zod";
import moment from "moment";

    // Validation schema using zod
export const EventSchema = z.object({
    weight : z.number().positive({ message: "Weight must be a positive number" }).optional().nullable(),
    poopPic: z.instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must be less than 5MB" })
        .optional()
        .nullable(),
    urinePic: z.instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, { message: "File size must be less than 5MB" })
        .optional()
        .nullable(),
    walkingTime: z.union([
            z.string().min(1, { message: "Walking time is required" }),
            z.literal("").nullable(),
        ])
        .optional(),
    food     : z.string().optional().nullable(),
    eventDate: z.string()
        .optional()
        .refine(
        (value) => moment(value, "YYYY-MM-DD", true).isValid(),
        { message: "Event date must be a valid date in the format YYYY-MM-DD" }
    ),
});