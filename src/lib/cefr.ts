export function cefrPillClass(cefr: string): string {
  switch (cefr) {
    case "A1": return "text-emerald-700 bg-emerald-50";
    case "A2": return "text-blue-700 bg-blue-50";
    case "B1": return "text-amber-700 bg-amber-50";
    default:   return "text-[#6B7280] bg-[#F3F4F6]";
  }
}
