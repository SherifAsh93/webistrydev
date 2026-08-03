# Dashboard Blueprint

Admin panel layout, sidebar, and common admin patterns.

---

## Route Structure

```
app/
  admin/
    layout.tsx          ← Auth gate (Server Component)
    page.tsx            ← Dashboard home (stats)
    products/
      page.tsx
    categories/
      page.tsx
    orders/
      page.tsx
    orders/
      [id]/
        page.tsx        ← Order detail
    settings/
      page.tsx
    homepage/           ← (ecommerce only)
      page.tsx
components/
  admin/
    AdminSidebar.tsx
    AdminSidebarLink.tsx
    AdminLoginView.tsx
    StatsCard.tsx
```

---

## Admin Layout (Server Component)

```typescript
// app/admin/layout.tsx
import { getAdminSession } from "@/lib/session";
import AdminLoginView from "@/components/admin/AdminLoginView";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) return <AdminLoginView />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

## AdminSidebar

```typescript
// components/admin/AdminSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, ShoppingBag,
  Settings, LogOut, Layout,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/homepage", label: "Homepage", icon: Layout },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <p className="font-semibold text-sm">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <link.icon size={15} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  );
}
```

---

## Dashboard Home (Stats)

```typescript
// app/admin/page.tsx
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalOrders, pendingOrders, totalProducts, totalRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED"] } },
      _sum: { total: true },
    }),
  ]);

  const stats = [
    { label: "Total Orders", value: totalOrders, color: "blue" },
    { label: "Pending", value: pendingOrders, color: "yellow" },
    { label: "Products", value: totalProducts, color: "green" },
    { label: "Revenue", value: `${(totalRevenue._sum.total ?? 0).toLocaleString('ar-EG')} ج.م`, color: "purple" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Order Management Page

```typescript
// app/admin/orders/page.tsx
"use client";
import { useEffect, useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-yellow-100 text-yellow-700",
  CONFIRMED:  "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED:    "bg-indigo-100 text-indigo-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار", CONFIRMED: "مؤكد", PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن", DELIVERED: "تم التسليم", CANCELLED: "ملغي",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders").then(r => r.json()).then(d => setOrders(d.orders ?? []));
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Orders</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4">Order #</th>
              <th className="text-left p-4">Customer</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{o.orderNumber}</td>
                <td className="p-4">{o.customerName}<br /><span className="text-gray-400 text-xs">{o.customerPhone}</span></td>
                <td className="p-4">{o.total.toLocaleString('ar-EG')} ج.م</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {Object.keys(STATUS_LABELS).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## Settings Page

```typescript
// app/admin/settings/page.tsx
"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({ store_name: "", contact_phone: "", contact_email: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(d => {
      if (d.settings) {
        const map: Record<string, string> = {};
        d.settings.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
        setSettings(prev => ({ ...prev, ...map }));
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    setMessage("Saved!");
    setSaving(false);
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>
      <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded-xl border">
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {Object.entries(settings).map(([key, val]) => (
          <div key={key}>
            <label className="text-sm text-gray-600 capitalize">{key.replace(/_/g, " ")}</label>
            <input value={val} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm" />
          </div>
        ))}
        <button type="submit" disabled={saving}
          className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
```
