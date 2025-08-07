import { z } from "zod";
export const editDiseaseDocSchema = z.object({
    healthIssue: z.string().min(1, { message: "Health Issue is required" }),
    treatment: z.string().min(1, { message: "Treatment is required" }),
    attachments: z.array(z.string()).min(1, { message: "At least one image is required" }),
});