# Reusable UI Components

Copy-paste components used across multiple projects.

---

## Product Card

```typescript
// components/store/ProductCard.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cartStore";

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  slug: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const image = product.images[0] ?? "/placeholder.jpg";
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {discount && (
            <div className="absolute top-3 start-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{discount}%
            </div>
          )}
          <button
            onClick={e => {
              e.preventDefault();
              addItem({ id: product.id, name: product.name, price: product.price, image, quantity: 1, slug: product.slug });
            }}
            className="absolute bottom-3 end-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium line-clamp-2 leading-snug">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{product.price.toLocaleString('ar-EG')} ج.م</span>
            {product.comparePrice && (
              <span className="text-gray-400 text-xs line-through">{product.comparePrice.toLocaleString('ar-EG')}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
```

---

## Cart Drawer

```typescript
// components/store/CartDrawer.tsx
"use client";
import { X, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cartStore";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCart();
  const shipping = total >= 800 ? 0 : 60;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={closeCart} />
      <div className="fixed inset-y-0 end-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-medium">Cart ({items.length})</h2>
          <button onClick={closeCart} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400">
            <p>Your cart is empty</p>
            <button onClick={closeCart} className="text-sm text-gray-900 underline">Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                    <p className="text-sm mt-1">{item.price.toLocaleString('ar-EG')} ج.م</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-7 h-7 border rounded-full text-sm flex items-center justify-center hover:bg-gray-100">−</button>
                      <span className="text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-7 h-7 border rounded-full text-sm flex items-center justify-center hover:bg-gray-100">+</button>
                      <button onClick={() => removeItem(item.id)} className="ms-auto text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-4 space-y-3 pb-safe">
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{total.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `${shipping.toLocaleString('ar-EG')} ج.م`}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1 border-t">
                  <span>Total</span>
                  <span>{(total + shipping).toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>
              <Link href="/checkout" onClick={closeCart}
                className="block w-full bg-gray-900 text-white text-center py-3 rounded-xl text-sm hover:bg-gray-800 transition-colors">
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
```

---

## Status Badge

```typescript
// components/ui/StatusBadge.tsx
const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDING:    { label: "Pending",    class: "bg-yellow-100 text-yellow-700" },
  CONFIRMED:  { label: "Confirmed",  class: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "Processing", class: "bg-purple-100 text-purple-700" },
  SHIPPED:    { label: "Shipped",    class: "bg-indigo-100 text-indigo-700" },
  DELIVERED:  { label: "Delivered",  class: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Cancelled",  class: "bg-red-100 text-red-500" },
  PAID:       { label: "Paid",       class: "bg-green-100 text-green-700" },
  FAILED:     { label: "Failed",     class: "bg-red-100 text-red-500" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, class: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
      {config.label}
    </span>
  );
}
```

---

## Image Upload (Admin)

```typescript
// components/admin/ImageUpload.tsx
"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export default function ImageUpload({ images, onChange, max = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange([...images, data.url]);
      else alert(data.error ?? "Upload failed");
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 group">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span className="text-xs">{uploading ? "..." : "Upload"}</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
```

---

## Announcement Bar

```typescript
// components/layout/AnnouncementBar.tsx
export default function AnnouncementBar({ text = "Free shipping on orders over 800 EGP" }) {
  return (
    <div className="bg-dark-900 text-white py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map(i => (
          <span key={i} className="inline-flex gap-16 mx-8 text-xs tracking-widest">
            {[0, 1, 2, 3].map(j => (
              <span key={j}>{text}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
```

---

## Loading Skeleton

```typescript
// components/ui/ProductGridSkeleton.tsx
export default function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
          <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
          <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
```

---

## Confirmation Dialog

```typescript
// components/ui/ConfirmDialog.tsx
"use client";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", danger = false }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
          <X size={16} />
        </button>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg text-white ${danger ? "bg-red-500 hover:bg-red-600" : "bg-gray-900 hover:bg-gray-800"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```
