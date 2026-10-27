import { redirect } from "next/navigation";

/** Elísio lives in the rail now. Old /tutor links land on Hoje with Elísio open. */
export default function TutorPage() {
  redirect("/?elisio=1");
}
