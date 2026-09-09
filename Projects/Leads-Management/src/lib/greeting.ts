export function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "سهرانين؟";
  if (hour < 12) return "صباح الخير";
  return "مساء الخير";
}
