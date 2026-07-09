import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Package, Tag, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin — Piece of Play" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate({ to: "/auth" });
        return;
      }
      setEmail(u.user.email ?? null);
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!role);
      setChecking(false);
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  async function claimAdmin() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    // Only works if no admin exists yet (self-bootstrap for the first admin).
    const { count } = await supabase
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) {
      toast.error("An admin already exists. Ask them to grant you access.");
      return;
    }
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: u.user.id, role: "admin" });
    if (error) toast.error(error.message);
    else {
      toast.success("You're now the admin!");
      setIsAdmin(true);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="surface-paper rounded-[2rem] shadow-soft p-8 max-w-md text-center">
          <h1 className="font-display text-2xl">Admin access needed</h1>
          <p className="mt-2 text-sm text-foreground/70">
            You're signed in as <strong>{email}</strong> but you don't have admin
            permissions yet.
          </p>
          <button
            onClick={claimAdmin}
            className="mt-6 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium shadow-soft hover:opacity-90"
          >
            Claim admin (first user only)
          </button>
          <button
            onClick={signOut}
            className="mt-3 w-full text-sm text-muted-foreground hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package, exact: false },
    { to: "/admin/categories", label: "Categories", icon: Tag, exact: false },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/85 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-lg text-primary">
              Piece of Play
            </Link>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground">{email}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-sm hover:bg-muted"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-3 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground/70 hover:bg-blush hover:text-primary"
              activeProps={{ className: "bg-blush text-primary" }}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
