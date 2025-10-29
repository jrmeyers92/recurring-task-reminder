// scripts/test-cron.ts
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env") });

const CRON_SECRET = process.env.CRON_SECRET;

async function testCron() {
  console.log("Testing cron job...");
  console.log("CRON_SECRET exists:", !!CRON_SECRET);
  console.log("CRON_SECRET preview:", CRON_SECRET?.substring(0, 10) + "...");

  if (!CRON_SECRET) {
    console.error("ERROR: CRON_SECRET not found in .env.local");
    return;
  }

  const response = await fetch(
    "http://localhost:3000/api/cron/send-reminders",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Status:", response.status);
  console.log("Content-Type:", response.headers.get("content-type"));

  const text = await response.text();

  if (response.status === 404) {
    console.log("ERROR: Route not found. Check that the file exists at:");
    console.log("  app/api/cron/send-reminders/route.ts");
    return;
  }

  try {
    const data = JSON.parse(text);
    console.log("Response:", data);
  } catch (e) {
    console.log("Failed to parse as JSON");
    console.log("Raw response:", text.substring(0, 500));
  }
}

testCron();
