import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { syncDeliverySettingsToMetafields } from "../lib/delivery-sync.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("WEBHOOK RECEIVED");

  const { admin } = await authenticate.webhook(request);

  if (!admin) {
    console.log("NO ADMIN CONTEXT");
    return new Response("Webhook reçu sans contexte admin", { status: 401 });
  }

  try {
    console.log("CALLING SYNC FUNCTION");

    await syncDeliverySettingsToMetafields(admin);

    console.log("SYNC FINISHED");

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("WEBHOOK SYNC ERROR:", error);
    return new Response("Erreur sync", { status: 500 });
  }
};