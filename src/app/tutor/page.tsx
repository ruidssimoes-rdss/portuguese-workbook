"use client";

import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";
import { TutorTabV2 } from "@/components/lessons/tutor-tab";

export default function TutorPage() {
  return (
    <PageShell>
      <PageHeader
        title="Professor Elísio"
        subtitle="Your AI Portuguese tutor — personalised lessons on any topic"
      />
      <TutorTabV2 />
    </PageShell>
  );
}
