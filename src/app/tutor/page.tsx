"use client";

import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";
import { TutorTabV2 } from "@/components/lessons/tutor-tab";

export default function TutorPage() {
  return (
    <PageShell header={<Crumbs items={[{ label: "Professor Elísio" }]} />}>
      <TutorTabV2 />
    </PageShell>
  );
}
