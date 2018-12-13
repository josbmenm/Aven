export default function createOnoKitchenClient(client) {
  return {
    ...client,
    kitchenState: client.get('kitchenState'),
  };
}
