import { CalendarView } from "@/components/calendar/calendar-view";
import { getCurriculumIndex } from "@/lib/curriculum-index";

export default function CalendarPage() {
  return <CalendarView curriculum={getCurriculumIndex()} />;
}
