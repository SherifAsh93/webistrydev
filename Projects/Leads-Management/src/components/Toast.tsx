"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 z-50 flex justify-center px-4 bottom-[calc(6rem+env(safe-area-inset-bottom))]">
      <div
        className={`w-full max-w-sm rounded-full px-5 py-3 text-center text-sm font-medium text-white shadow-lg ${
          type === "success" ? "bg-primary" : "bg-red-600"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
