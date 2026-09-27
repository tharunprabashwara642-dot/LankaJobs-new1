import { db } from "@workspace/db";
import { categories, platformSettings } from "@workspace/db/schema";

const defaultCategories = [
  ["Technology", "technology", "code-slash"],
  ["Finance", "finance", "stats-chart"],
  ["Education", "education", "school"],
  ["Healthcare", "healthcare", "medkit"],
  ["Sales", "sales", "megaphone"],
  ["Hospitality", "hospitality", "restaurant"],
  ["Customer Service", "customer-service", "people"],
] as const;

export async function seedDefaults() {
  await db
    .insert(categories)
    .values(defaultCategories.map(([name, slug, icon]) => ({ id: crypto.randomUUID(), name, slug, icon })))
    .onConflictDoNothing();
  await db
    .insert(platformSettings)
    .values([
      { key: "postingPrice", value: "0" },
      { key: "featuredPrice", value: "0" },
      { key: "sponsoredPrice", value: "0" },
      { key: "paymentsEnabled", value: "false" },
      { key: "notificationsEnabled", value: "false" },
      { key: "moderationEnabled", value: "true" },
    ])
    .onConflictDoNothing();
}