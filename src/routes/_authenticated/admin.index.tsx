import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Tag, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin", "counts"],
    queryFn: async () => {
      const [p, c] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
      ]);
      return { products: p.count ?? 0, categories: c.count ?? 0 };
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-2 text-foreground/70">Manage your shop from here.</p>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard label="Products" value={data?.products ?? "—"} icon={Package} to="/admin/products" />
        <StatCard label="Categories" value={data?.categories ?? "—"} icon={Tag} to="/admin/categories" />
        <Link
          to="/shop"
          className="surface-paper rounded-[1.75rem] shadow-soft p-6 flex items-center justify-between hover:shadow-pop transition"
        >
          <div>
            <div className="text-sm text-muted-foreground">View live shop</div>
            <div className="mt-1 font-display text-xl text-primary">Open store</div>
          </div>
          <ExternalLink className="h-6 w-6 text-primary" />
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="surface-paper rounded-[1.75rem] shadow-soft p-6 flex items-center justify-between hover:shadow-pop transition"
    >
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-3xl text-primary">{value}</div>
      </div>
      <Icon className="h-8 w-8 text-primary/60" />
    </Link>
  );
}
