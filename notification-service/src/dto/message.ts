import { z } from "zod";

export const MessageSchema = z.object({
    type: z.enum(["email", "sms"]),
    to: z.array(z.string()).min(1),
    template: z.string().optional(),
    content: z.union([z.string(), z.any()])
}).refine((o) => typeof o.content === "string" || !!o.template, { message: "Invalid message type" });



export type Message = z.infer<typeof MessageSchema>;