"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type OnboardingResponse = {
  success: boolean;
  error?: string;
};

export async function completeOnboarding(profileData: {
  id: string;
  email: string;
  phone?: string | null;
  notify_via?: string | null;
}): Promise<OnboardingResponse> {
  console.log("🚀 Server action called with data:", profileData);

  try {
    const { userId } = await auth();
    console.log("👤 Authenticated userId:", userId);

    // Verify the authenticated user matches the profile data
    if (!userId || userId !== profileData.id) {
      console.error("❌ User ID mismatch", {
        userId,
        profileId: profileData.id,
      });
      return {
        success: false,
        error: "Unauthorized: User ID mismatch",
      };
    }

    const supabase = await createAdminClient();

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("task_scheduler_profiles")
      .select("id")
      .eq("id", userId)
      .single();

    console.log("🔍 Existing profile check:", { existingProfile, checkError });

    if (existingProfile) {
      return {
        success: false,
        error: "Profile already exists for this user",
      };
    }

    // Validate notify_via is provided
    if (!profileData.notify_via) {
      console.error("❌ Missing notify_via");
      return {
        success: false,
        error: "Notification preference is required",
      };
    }

    // Validate phone number if SMS notifications are enabled
    if (
      (profileData.notify_via === "sms" || profileData.notify_via === "both") &&
      !profileData.phone
    ) {
      console.error("❌ Missing phone for SMS");
      return {
        success: false,
        error: "Phone number is required for SMS notifications",
      };
    }

    console.log("💾 Inserting profile into database...");
    // Insert profile into database
    const { error: insertError } = await supabase
      .from("task_scheduler_profiles")
      .insert({
        id: profileData.id,
        email: profileData.email,
        phone: profileData.phone,
        notify_via: profileData.notify_via,
      });

    if (insertError) {
      console.error("❌ Supabase insert error:", insertError);
      return {
        success: false,
        error: "Failed to create profile in database",
      };
    }

    console.log("✅ Profile inserted successfully");
    console.log("🔄 Updating Clerk metadata...");

    // Update Clerk user metadata to mark onboarding as complete
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    console.log("✅ Clerk metadata updated");

    // Revalidate the dashboard path to reflect the new onboarding status
    revalidatePath("/dashboard");
    revalidatePath("/");

    console.log("🎉 Onboarding complete!");

    return {
      success: true,
    };
  } catch (error) {
    console.error("💥 Error completing onboarding:", error);
    return {
      success: false,
      error: "An unexpected error occurred during onboarding",
    };
  }
}
