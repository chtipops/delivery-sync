import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { syncDeliverySettingsToMetafields } from "../lib/delivery-sync.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.webhook(request);

  if (!admin) {
    return new Response("Webhook reçu sans contexte admin", { status: 401 });
  }

  try {
    await syncDeliverySettingsToMetafields(admin);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook sync error", error);
    return new Response("Erreur sync", { status: 500 });
  }
};