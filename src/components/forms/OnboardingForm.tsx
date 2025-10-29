"use client";

import { completeOnboarding } from "@/actions/completeOnboarding";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileInsert } from "@/types/database.types";
import { useAuth, useSession } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  onboardingFormSchema,
  OnboardingFormValues,
} from "./formSchemas/OnboardingFormSchema";

export default function OnboardingForm() {
  const { session } = useSession();
  const router = useRouter();
  const { userId } = useAuth();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      notify_via: "email",
    },
  });

  // Watch the notify_via field to conditionally require phone
  const notifyVia = form.watch("notify_via");

  async function onSubmit(values: OnboardingFormValues) {
    console.log("🎯 onSubmit called!", values);
    console.log("👤 userId:", userId);

    if (!userId) {
      toast.error("Error", {
        description: "User ID not found. Please try signing in again.",
      });
      return;
    }

    // Validate phone is provided if SMS or both is selected
    if (
      (values.notify_via === "sms" || values.notify_via === "both") &&
      !values.phone
    ) {
      form.setError("phone", {
        message: "Phone number is required for SMS notifications",
      });
      return;
    }

    // Create ProfileInsert object
    const profileData: ProfileInsert = {
      id: userId, // Use userId directly from Clerk
      email: values.email,
      phone: values.phone ? values.phone.replace(/\D/g, "") : null,
      notify_via: values.notify_via,
    };

    console.log("📤 Submitting profile data:", profileData);

    startTransition(async () => {
      try {
        const result = await completeOnboarding(profileData);
        console.log("📥 Server action result:", result);

        if (result?.success) {
          toast.success("Profile created!", {
            description: "Your account has been successfully set up.",
          });
          // Reload session to get updated metadata
          await session?.reload();
          router.push("/dashboard");
        } else {
          toast.error("Setup failed", {
            description:
              result?.error || "There was a problem setting up your account.",
          });
        }
      } catch (error) {
        console.error("💥 Error in onSubmit:", error);
        toast.error("Submission error", {
          description:
            "There was a problem submitting your form. Please try again.",
        });
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome! 👋</h1>
        <p className="text-muted-foreground">
          Let&apos;s set up your account so you can start receiving reminders
          for your recurring tasks.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  We&apos;ll use this email to send you task reminders.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notify_via"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How would you like to receive reminders?</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email only</SelectItem>
                    <SelectItem value="sms">SMS only</SelectItem>
                    <SelectItem value="both">Both Email and SMS</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose how you&apos;d like to be notified when tasks are due.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {(notifyVia === "sms" || notifyVia === "both") && (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number
                    {(notifyVia === "sms" || notifyVia === "both") && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => {
                        // Auto-format phone number as user types
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 10) value = value.slice(0, 10);

                        let formatted = value;
                        if (value.length >= 6) {
                          formatted = `(${value.slice(0, 3)}) ${value.slice(
                            3,
                            6
                          )}-${value.slice(6)}`;
                        } else if (value.length >= 3) {
                          formatted = `(${value.slice(0, 3)}) ${value.slice(
                            3
                          )}`;
                        }

                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Required for SMS notifications. Standard message rates may
                    apply.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Create your first recurring task</li>
              <li>Receive reminders via your preferred notification method</li>
              <li>Mark tasks as complete with a single click</li>
              <li>
                Tasks automatically reschedule based on your frequency settings
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Setting up your account..." : "Complete Setup"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
