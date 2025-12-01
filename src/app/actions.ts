"use server";

import { updateTag } from "next/cache";

export async function revalidateBudget() {
  updateTag("budget-current");
  updateTag("budget-month");
  updateTag("dashboard-stats-category");
  updateTag("dashboard-stats-month");
  updateTag("dashboard-budget-month");
}
