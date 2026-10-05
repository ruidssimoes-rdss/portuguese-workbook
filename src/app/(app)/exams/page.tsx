import { getAllExams } from "@/data/exams";
import { MOCK_EXAM_UNLOCKS } from "@/data/curriculum";
import { ExamsList, type ExamSummary } from "@/components/exams/exams-list";

export default function ExamsPage() {
  const exams: ExamSummary[] = getAllExams().map((exam) => ({
    id: exam.id,
    title: exam.title,
    titlePt: exam.titlePt,
    monthPt: exam.monthPt,
    difficulty: exam.difficulty,
    descriptionPt: exam.descriptionPt,
    available: exam.available,
    totalMinutes: exam.sections.reduce((s, sec) => s + sec.timeMinutes, 0),
    lessonsRequired: MOCK_EXAM_UNLOCKS[exam.id]?.lessonsRequired ?? 0,
  }));

  return (
    <>
      <ExamsList exams={exams} />
    </>
  );
}
