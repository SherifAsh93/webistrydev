import { SquareCode } from "lucide-react";

export default function Logo({ lang }: { lang: "ar" | "en" }) {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative">
        {/* الأيقونة: تعبر عن البرمجة وشكل المربع/الركن */}
        <div className="bg-blue-600 p-2 rounded-xl text-white transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
          <SquareCode size={28} strokeWidth={2.5} />
        </div>
        {/* نقطة زينة تعطي طابع الـ Dashboard */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
      </div>

      <div className="flex flex-col -space-y-1">
        <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
          {lang === "ar" ? (
            <>
              ويب<span className="text-blue-600">كورنر</span>
            </>
          ) : (
            <>
              Web<span className="text-blue-600">Corner</span>
            </>
          )}
        </span>
        <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
          {lang === "ar" ? "ستوديو برمجيات" : "Software Studio"}
        </span>
      </div>
    </div>
  );
}
