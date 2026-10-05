import { getExam, getAllExams } from "@/data/exams";
import { ExamPlayer } from "@/components/exams/exam-player";

export function generateStaticParams() {
  return getAllExams().map((exam) => ({ id: exam.id }));
}

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExamPlayer exam={getExam(id)} />;
}
