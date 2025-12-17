// In the future, call an external product API here.
export interface ProductSuggestion {
  name: string;
  categoryName?: string;
  imageUrl?: string;
}

export async function lookupProductByBarcode(
  _barcode: string
): Promise<ProductSuggestion | null> {
  // Stubbed: return null or a fake item.
  // You can expand this later to call an API.
  void _barcode;
  return null;
}
