import { handleContact } from "@/lib/contact-handler.mjs";
export const runtime = "nodejs";
export async function POST(request) {
  return handleContact(request);
}
