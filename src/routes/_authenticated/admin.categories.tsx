import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Category } from "@/lib/products-db";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function CategoriesPage() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as Category[];
    },
  });

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    const slug = slugify(name);
    const { error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), slug, sort_order: categories.length });
    setBusy(false);
    if (error) return toast.error(error.message);
    setName("");
    toast.success("Category added");
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  }

  async function save(c: Category) {
    const { error } = await supabase
      .from("categories")
      .update({ name: c.name, slug: c.slug, sort_order: c.sort_order })
      .eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Categories</h1>
      <p className="mt-2 text-foreground/70">Group products together.</p>

      <div className="mt-6 surface-paper rounded-[1.75rem] shadow-soft p-5 flex gap-2 items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Grade Packs"
          className="flex-1 rounded-2xl bg-background border border-border/60 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={add}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {categories.map((c, idx) => (
          <CategoryRow
            key={c.id}
            category={c}
            onSave={save}
            onDelete={remove}
            onChangeLocal={(next) => {
              qc.setQueryData<Category[]>(["admin", "categories"], (prev) =>
                prev?.map((x, i) => (i === idx ? next : x)),
              );
            }}
          />
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  onSave,
  onDelete,
  onChangeLocal,
}: {
  category: Category;
  onSave: (c: Category) => void;
  onDelete: (id: string) => void;
  onChangeLocal: (next: Category) => void;
}) {
  return (
    <div className="surface-paper rounded-2xl shadow-soft p-4 grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto] items-center">
      <input
        value={category.name}
        onChange={(e) => onChangeLocal({ ...category, name: e.target.value })}
        className="rounded-xl bg-background border border-border/60 px-3 py-2 outline-none"
        placeholder="Name"
      />
      <input
        value={category.slug}
        onChange={(e) => onChangeLocal({ ...category, slug: e.target.value })}
        className="rounded-xl bg-background border border-border/60 px-3 py-2 outline-none text-sm text-muted-foreground"
        placeholder="slug"
      />
      <input
        type="number"
        value={category.sort_order}
        onChange={(e) =>
          onChangeLocal({ ...category, sort_order: Number(e.target.value) })
        }
        className="rounded-xl bg-background border border-border/60 px-3 py-2 outline-none w-full"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onSave(category)}
          className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:opacity-90"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-3 py-1.5 text-sm hover:bg-destructive/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
