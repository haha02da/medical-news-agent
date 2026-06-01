"use server";

import { revalidateTag } from "next/cache";

export async function refreshNews() {
  revalidateTag("disease-news", "max");
}
