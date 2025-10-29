import { buttonVariants } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  RefreshCw,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Bell className="text-primary" size={64} />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Never Forget Your
            <span className="text-primary"> Recurring Tasks</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Set it once, get reminded forever. From changing air filters to
            watering plants, we&apos;ll make sure nothing slips through the
            cracks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <SignedOut>
              <Link
                href="/sign-up"
                className={buttonVariants({
                  size: "lg",
                  className: "text-lg px-8",
                })}
              >
                Get Started Free
              </Link>
              <Link
                href="/sign-in"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "text-lg px-8",
                })}
              >
                Sign In
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  size: "lg",
                  className: "text-lg px-8",
                })}
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar size={32} />}
              title="Create Your Tasks"
              description="Add any recurring task with your preferred frequency - daily, weekly, monthly, or custom intervals."
            />

            <FeatureCard
              icon={<Bell size={32} />}
              title="Get Reminded"
              description="Receive timely reminders via email or SMS when your tasks are due. Never miss another maintenance task."
            />

            <FeatureCard
              icon={<CheckCircle2 size={32} />}
              title="Mark Complete"
              description="Check off completed tasks with one click. We'll automatically schedule the next reminder for you."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Stop Forgetting Important Tasks
              </h2>
              <p className="text-lg text-muted-foreground">
                Life gets busy, and recurring tasks are easy to forget. Let us
                handle the remembering so you can focus on what matters.
              </p>

              <ul className="space-y-4">
                <BenefitItem
                  icon={<RefreshCw size={16} />}
                  text="Automatic rescheduling after completion"
                />
                <BenefitItem
                  icon={<MessageSquare size={16} />}
                  text="Choose email or SMS notifications"
                />
                <BenefitItem
                  icon={<Clock size={16} />}
                  text="Flexible scheduling for any frequency"
                />
                <BenefitItem
                  icon={<Zap size={16} />}
                  text="One-click task completion"
                />
              </ul>

              <SignedOut>
                <Link
                  href="/sign-up"
                  className={buttonVariants({ size: "lg", className: "mt-4" })}
                >
                  Start Tracking Tasks Free
                </Link>
              </SignedOut>
            </div>

            <div className="bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl p-8 md:p-12">
              <div className="bg-background rounded-xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="font-semibold">Upcoming Tasks</span>
                  <span className="text-sm text-muted-foreground">
                    This Week
                  </span>
                </div>

                <TaskPreview
                  title="Change HVAC Filter"
                  date="Tomorrow"
                  status="upcoming"
                />
                <TaskPreview
                  title="Water Indoor Plants"
                  date="In 3 days"
                  status="upcoming"
                />
                <TaskPreview
                  title="Replace Toothbrush"
                  date="In 5 days"
                  status="upcoming"
                />

                <div className="pt-4 border-t">
                  <TaskPreview
                    title="Clean Coffee Maker"
                    date="Completed today"
                    status="completed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-muted/50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Perfect For
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Whether it&apos;s home maintenance, health routines, or business
            tasks, we&apos;ve got you covered
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UseCaseCard
              title="Home Maintenance"
              items={[
                "Change air filters",
                "Test smoke detectors",
                "Clean gutters",
                "Service HVAC system",
              ]}
            />
            <UseCaseCard
              title="Health & Wellness"
              items={[
                "Replace toothbrush",
                "Schedule checkups",
                "Refill prescriptions",
                "Update first aid kit",
              ]}
            />
            <UseCaseCard
              title="Pet Care"
              items={[
                "Flea & tick treatment",
                "Vet appointments",
                "Replace pet supplies",
                "Grooming schedule",
              ]}
            />
            <UseCaseCard
              title="Vehicle Care"
              items={[
                "Oil changes",
                "Tire rotation",
                "Registration renewal",
                "Inspection due dates",
              ]}
            />
            <UseCaseCard
              title="Garden & Yard"
              items={[
                "Fertilize lawn",
                "Prune trees",
                "Water plants",
                "Seasonal cleanup",
              ]}
            />
            <UseCaseCard
              title="Business Tasks"
              items={[
                "Renew licenses",
                "Quarterly reviews",
                "Equipment maintenance",
                "Invoice reminders",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Stay On Top of Everything?
          </h2>
          <p className="text-lg opacity-90">
            Join now and never forget an important task again. It&apos;s free to
            get started.
          </p>
          <SignedOut>
            <Link
              href="/sign-up"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "text-lg px-8 mt-4",
              })}
            >
              Get Started Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "text-lg px-8 mt-4",
              })}
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-6 rounded-xl border shadow-sm space-y-4">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}

function TaskPreview({
  title,
  date,
  status,
}: {
  title: string;
  date: string;
  status: "upcoming" | "completed";
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
          status === "completed"
            ? "bg-primary border-primary"
            : "border-muted-foreground/30"
        }`}
      >
        {status === "completed" && (
          <CheckCircle2 size={16} className="text-primary-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`font-medium ${
            status === "completed" ? "line-through text-muted-foreground" : ""
          }`}
        >
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}

function UseCaseCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-background p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
