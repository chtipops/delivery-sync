export function isoDurationToBusinessDays(duration: string | null | undefined): number {
  if (!duration) return 0;

  const match = duration.match(/^P(?:(\d+)W)?(?:(\d+)D)?$/);
  if (!match) return 0;

  const weeks = parseInt(match[1] || "0", 10);
  const days = parseInt(match[2] || "0", 10);

  return weeks * 5 + days;
}

export async function syncDeliverySettingsToMetafields(admin: any) {
  const query = `#graphql
    query {
      shop {
        id
      }
      deliveryPromiseSettings {
        deliveryDatesEnabled
        processingTime
      }
    }
  `;

  const response = await admin.graphql(query);
  const json = await response.json();

  const shopId = json.data.shop.id;
  const settings = json.data.deliveryPromiseSettings;

  const processingDays = isoDurationToBusinessDays(settings.processingTime);

  const mutation = `#graphql
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          value
        }
        userErrors {
          message
        }
      }
    }
  `;

  const variables = {
    metafields: [
      {
        ownerId: shopId,
        namespace: "custom",
        key: "cp_delivery_enabled",
        type: "boolean",
        value: settings.deliveryDatesEnabled ? "true" : "false"
      },
      {
        ownerId: shopId,
        namespace: "custom",
        key: "cp_processing_days",
        type: "number_integer",
        value: String(processingDays)
      },
      {
        ownerId: shopId,
        namespace: "custom",
        key: "cp_ship_min_days",
        type: "number_integer",
        value: "1"
      },
      {
        ownerId: shopId,
        namespace: "custom",
        key: "cp_ship_max_days",
        type: "number_integer",
        value: "3"
      }
    ]
  };

  const mutationResponse = await admin.graphql(mutation, { variables });
  const mutationJson = await mutationResponse.json();

  console.log("METAFIELD RESULT:", JSON.stringify(mutationJson, null, 2));
  }