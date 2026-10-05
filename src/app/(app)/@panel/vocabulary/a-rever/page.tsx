import { SessionPanel } from "@/components/vocabulary/session-panel";
import { getLearner } from "@/lib/shell/learner";
import { previewSession } from "@/lib/shell/session-preview";

export default async function ReviewFolderPanel() {
  const learner = await getLearner();
  return <SessionPanel title="Todo o vocabulário" session={previewSession(learner, {})} />;
}
