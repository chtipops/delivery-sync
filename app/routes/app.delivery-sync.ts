import { authenticate } from "../shopify.server";
import { syncDeliverySettingsToMetafields } from "../lib/delivery-sync.server";

export const loader = async ({ request }: { request: Request }) => {
  await authenticate.admin(request);
  return Response.json({ ok: true });
};

export const action = async ({ request }: { request: Request }) => {
  const { admin } = await authenticate.admin(request);
  await syncDeliverySettingsToMetafields(admin);
  return Response.json({ ok: true });
};