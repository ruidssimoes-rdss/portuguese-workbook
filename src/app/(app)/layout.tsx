import { Shell } from "@/components/shell/shell";
import { getLibraryTree } from "@/lib/library";

/**
 * Every authenticated page renders inside this layout. It reads no cookies,
 * so reference pages stay static; the learner's state reaches the explorer
 * through /api/shell and /api/explorer.
 */
export default function AppLayout({
  children,
  header,
  panel,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <Shell tree={getLibraryTree()} header={header} panel={panel}>
      {children}
    </Shell>
  );
}
