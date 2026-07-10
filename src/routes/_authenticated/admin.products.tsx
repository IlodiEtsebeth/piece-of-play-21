import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Upload, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product, Category } from "@/lib/products-db";
import { resolveSignedUrl, resolvePreviewUrls, resolveFreeFileUrl } from "@/lib/products-db";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const emptyProduct = (): Product => ({
  id: "",
  slug: "",
  name: "",
  short: "",
  description: "",
  price_cents: 0,
  age_group: "",
  badge: null,
  coming_soon: false,
  category_id: null,
  image_url: null,
  pdf_url: null,
  included: [],
  skills: [],
  preview_pages: 0,
  preview_images: [],
  is_free: false,
  sort_order: 0,
  active: true,
});

function ProductsPage() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  const [editing, setEditing] = useState<Product | null>(null);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-foreground/70">Add, edit and manage your shop.</p>
        </div>
        <button
          onClick={() => setEditing(emptyProduct())}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-medium shadow-soft hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="mt-8 surface-paper rounded-[1.75rem] shadow-soft overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px_80px_auto] gap-3 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/60">
          <div>Product</div>
          <div>Price</div>
          <div>Status</div>
          <div>Order</div>
          <div className="text-right">Actions</div>
        </div>
        {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading…</p>}
        {products.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[1fr_100px_100px_80px_auto] gap-3 px-5 py-3 border-b border-border/40 items-center"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground truncate">{p.slug}</div>
            </div>
            <div className="text-sm">R{(p.price_cents / 100).toFixed(0)}</div>
            <div className="text-xs">
              <span
                className={`inline-block rounded-full px-2 py-0.5 ${p.active ? "bg-sage/40 text-forest" : "bg-muted text-muted-foreground"}`}
              >
                {p.active ? "Active" : "Hidden"}
              </span>
            </div>
            <div className="text-sm">{p.sort_order}</div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(p)}
                className="text-sm rounded-full bg-blush text-primary px-3 py-1.5 hover:bg-blush/80"
              >
                Edit
              </button>
              <button
                onClick={() => remove(p)}
                className="rounded-full bg-destructive/10 text-destructive p-2 hover:bg-destructive/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && products.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">No products yet — create your first!</p>
        )}
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Product>(product);
  const [busy, setBusy] = useState(false);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const isNew = !form.id;

  useEffect(() => {
    resolveSignedUrl("product-images", form.image_url).then(setImgPreview);
    if (form.is_free) {
      setPdfLink(resolveFreeFileUrl(form.pdf_url));
    } else {
      resolveSignedUrl("product-pdfs", form.pdf_url).then(setPdfLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.image_url, form.pdf_url, form.is_free]);

  function set<K extends keyof Product>(k: K, v: Product[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadFile(file: File, bucket: "product-images" | "product-pdfs" | "free-resources") {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    return path;
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const path = await uploadFile(file, "product-images");
      set("image_url", path);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const path = await uploadFile(file, form.is_free ? "free-resources" : "product-pdfs");
      set("pdf_url", path);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPreviewImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const paths: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-previews").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
        if (error) throw error;
        paths.push(path);
      }
      set("preview_images", [...form.preview_images, ...paths]);
      toast.success(`${paths.length} preview image${paths.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function removePreviewImage(path: string) {
    set(
      "preview_images",
      form.preview_images.filter((p) => p !== path),
    );
  }

  async function save() {
    if (!form.name.trim()) return toast.error("Name is required");
    setBusy(true);
    const payload = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      short: form.short,
      description: form.description,
      price_cents: form.price_cents,
      age_group: form.age_group,
      badge: form.badge || null,
      coming_soon: form.coming_soon,
      category_id: form.category_id,
      image_url: form.image_url,
      pdf_url: form.pdf_url,
      included: form.included,
      skills: form.skills,
      preview_pages: form.preview_pages,
      preview_images: form.preview_images,
      is_free: form.is_free,
      sort_order: form.sort_order,
      active: form.active,
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", form.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Product created" : "Saved");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-background w-full sm:max-w-3xl rounded-t-[2rem] sm:rounded-[2rem] shadow-pop max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border/60 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display text-xl">{isNew ? "New product" : "Edit product"}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => !form.slug && set("slug", slugify(form.name))}
              className="input"
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category_id ?? ""}
                onChange={(e) => set("category_id", e.target.value || null)}
                className="input"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Short description">
            <input
              value={form.short}
              onChange={(e) => set("short", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Full description">
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="input"
            />
          </Field>

          <label className="inline-flex items-center gap-2 text-sm rounded-2xl bg-sage/20 px-4 py-3 border border-sage/40">
            <input
              type="checkbox"
              checked={form.is_free}
              onChange={(e) => set("is_free", e.target.checked)}
            />
            Free resource — visitors download instantly, no price, no WhatsApp order
          </label>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label={form.is_free ? "Price (locked at R0)" : "Price (Rand)"}>
              <input
                type="number"
                min={0}
                disabled={form.is_free}
                value={form.is_free ? 0 : (form.price_cents / 100).toString()}
                onChange={(e) => set("price_cents", Math.round(Number(e.target.value) * 100))}
                className="input disabled:opacity-50"
              />
            </Field>
            <Field label="Age group">
              <input
                value={form.age_group}
                onChange={(e) => set("age_group", e.target.value)}
                placeholder="Ages 5–6"
                className="input"
              />
            </Field>
            <Field label="Badge">
              <input
                value={form.badge ?? ""}
                onChange={(e) => set("badge", e.target.value || null)}
                placeholder="NEW / BESTSELLER"
                className="input"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Product image">
              <div className="flex items-center gap-3">
                {imgPreview ? (
                  <img
                    src={imgPreview}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover border border-border/60"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-muted grid place-items-center text-xs text-muted-foreground">
                    None
                  </div>
                )}
                <label className="inline-flex items-center gap-1.5 rounded-full bg-blush text-primary px-3 py-1.5 text-sm cursor-pointer hover:bg-blush/80">
                  <Upload className="h-3.5 w-3.5" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                </label>
                {form.image_url && (
                  <button
                    onClick={() => set("image_url", null)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </Field>
            <Field label={form.is_free ? "Resource file (public download)" : "Product PDF"}>
              <div className="flex items-center gap-3">
                {pdfLink ? (
                  <a
                    href={pdfLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View PDF
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">No PDF</span>
                )}
                <label className="inline-flex items-center gap-1.5 rounded-full bg-blush text-primary px-3 py-1.5 text-sm cursor-pointer hover:bg-blush/80">
                  <Upload className="h-3.5 w-3.5" /> Upload
                  <input type="file" accept="application/pdf" className="hidden" onChange={onPdfChange} />
                </label>
                {form.pdf_url && (
                  <button
                    onClick={() => set("pdf_url", null)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              {form.is_free && (
                <p className="mt-1 text-xs text-muted-foreground">
                  If you just switched this to a free resource, re-upload the file so it moves to the public download bucket.
                </p>
              )}
            </Field>
          </div>

          <Field label="What's included (one per line)">
            <textarea
              rows={5}
              value={form.included.join("\n")}
              onChange={(e) => set("included", e.target.value.split("\n").filter(Boolean))}
              className="input"
            />
          </Field>
          <Field label="Skills developed (one per line)">
            <textarea
              rows={4}
              value={form.skills.join("\n")}
              onChange={(e) => set("skills", e.target.value.split("\n").filter(Boolean))}
              className="input"
            />
          </Field>

          <Field label="Preview images (sample pages shown to shoppers)">
            <div className="flex flex-wrap gap-3">
              {resolvePreviewUrls(form.preview_images).map((url, i) => (
                <div key={form.preview_images[i]} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover border border-border/60"
                  />
                  <button
                    onClick={() => removePreviewImage(form.preview_images[i])}
                    className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="h-20 w-20 rounded-xl border-2 border-dashed border-border/60 grid place-items-center cursor-pointer hover:bg-muted text-muted-foreground">
                <Upload className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onPreviewImagesChange}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload a few sample pages so shoppers can see what's inside before buying.
            </p>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Sort order">
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                className="input"
              />
            </Field>
            <div className="flex flex-col gap-2 pt-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set("active", e.target.checked)}
                />
                Active (shown in shop)
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.coming_soon}
                  onChange={(e) => set("coming_soon", e.target.checked)}
                />
                Coming soon
              </label>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background border-t border-border/60 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-border/60 px-5 py-2.5 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {busy ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
