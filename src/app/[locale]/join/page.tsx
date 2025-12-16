"use client";

import { useActiveAccount } from "thirdweb/react";
import { useLocale } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";
import JoinConnect from "@/components/Join/JoinConnect";
import JoinOnboarding from "@/components/Join/JoinOnboarding";

export default function JoinPage() {
  const locale = useLocale();
  const account = useActiveAccount();

  return (
    <Page>
      <div className="flex flex-col">
        <Section>
          {account?.address ? (
            <JoinOnboarding locale={locale} />
          ) : (
            <JoinConnect locale={locale} />
          )}
        </Section>
      </div>
    </Page>
  );
}
