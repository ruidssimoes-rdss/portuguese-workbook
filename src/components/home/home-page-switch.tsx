"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getHomepageData } from "@/lib/homepage-service";
import type { HomepageData } from "@/lib/homepage-service";
import { PersonalisedHomepage } from "./personalised-homepage";
import type { HomeStaticData } from "./personalised-homepage";

export function HomePageSwitch({
  staticData,
  children,
}: {
  staticData: HomeStaticData;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [homepageData, setHomepageData] = useState<HomepageData | null | undefined>(undefined);

  const loadData = useCallback(() => {
    if (!user) return;
    getHomepageData().then((data) => setHomepageData(data ?? null));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setHomepageData(null);
      return;
    }
    loadData();
  }, [user, loadData]);

  if (user && homepageData) {
    return (
      <PersonalisedHomepage
        data={homepageData}
        staticData={staticData}
        onDataRefresh={loadData}
      />
    );
  }

  return <>{children}</>;
}
