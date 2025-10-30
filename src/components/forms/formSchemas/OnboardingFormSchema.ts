import { z } from "zod";

export const onboardingFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // Remove all non-digit characters for validation
        const digits = val.replace(/\D/g, "");
        return digits.length === 10;
      },
      {
        message: "Please enter a valid 10-digit phone number",
      }
    ),
  notify_via: z.enum(["email", "sms", "both", "none"], {
    message: "Please select a notification preference",
  }),
});

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
