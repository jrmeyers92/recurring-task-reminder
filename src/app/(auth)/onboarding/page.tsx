import OnboardingForm from "@/components/forms/OnboardingForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RoleSelectionPage() {
  const user = await auth();
  // If user is not authenticated, redirect to sign-in
  if (!user) redirect("/sign-in");

  // If user has a role, redirect to appropriate onboarding
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        Welcome to Recurring Task Reminder!
      </h1>
      <p className="mb-4">How would you like to recieve notifications?</p>
      <OnboardingForm />
    </div>
  );
}
