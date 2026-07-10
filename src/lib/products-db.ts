import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  price_cents: number;
  age_group: string;
  badge: string | null;
  coming_soon: boolean;
  category_id: string | null;
  image_url: string | null;
  pdf_url: string | null;
  included: string[];
  skills: string[];
  preview_pages: number;
  preview_images: string[];
  is_free: boolean;
  sort_order: number;
  active: boolean;
};

export const formatPrice = (cents: number) =>
  `R${(cents / 100).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

// image_url / pdf_url store the storage object path within their bucket.
// For legacy/external values that start with http, return as-is.
export async function resolveSignedUrl(
  bucket: "product-images" | "product-pdfs",
  path: string | null | undefined,
  expiresIn = 60 * 60,
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

// product-previews is a public bucket, so previews resolve to plain public URLs (no signing needed).
export function resolvePreviewUrls(paths: string[] | null | undefined): string[] {
  if (!paths || paths.length === 0) return [];
  return paths.map((path) => {
    if (path.startsWith("http")) return path;
    return supabase.storage.from("product-previews").getPublicUrl(path).data.publicUrl;
  });
}

// free-resources is a public bucket — free downloads resolve directly, no signing needed.
export function resolveFreeFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return supabase.storage.from("free-resources").getPublicUrl(path).data.publicUrl;
}

export async function fetchProducts(opts: { activeOnly?: boolean } = {}) {
  const q = supabase.from("products").select("*").order("sort_order", { ascending: true });
  const { data, error } = opts.activeOnly ? await q.eq("active", true) : await q;
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}
