import type { Product } from "./types";

/**
 * Normalize raw product rows from the DB / API into a stable product shape
 * with sane defaults so components can rely on non-undefined fields.
 */
export function normalizeProduct(raw: any): Product {
  return {
    id: raw?.id ?? raw?.product_id ?? 0,
    name: String(raw?.name ?? raw?.title ?? ""),
    desc: String(raw?.desc ?? raw?.description ?? ""),
    description: String(raw?.description ?? raw?.desc ?? ""),
    price: raw?.price ?? raw?.price?.toString?.() ?? 0,
    sale_price: raw?.sale_price ?? null,
    // normalize image_url to a single string (prefer canonical fields, fall back to empty string)
    image_url: String(raw?.image_url ?? raw?.image ?? ""),
    // ensure `images` is always an array so components relying on images[0] won't break
    images: Array.isArray(raw?.images)
      ? raw.images
      : raw?.images
      ? [raw.images]
      : raw?.image_url
      ? Array.isArray(raw.image_url)
        ? raw.image_url
        : [raw.image_url]
      : raw?.image
      ? [raw.image]
      : [],
    shops: raw?.shops ?? raw?.shop ?? null,
    shop: raw?.shop ?? raw?.shops ?? null,
    // rating: raw?.rating ?? 0,
    // view_count: raw?.view_count ?? 0,
    // stock: raw?.stock ?? 0,
    // metadata: raw?.metadata ?? null,
    // copy any other fields through so code relying on extras won't break
    ...raw,
  } as Product;
}
