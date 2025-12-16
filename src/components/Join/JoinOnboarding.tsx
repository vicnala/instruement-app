"use client";

import { useTranslations } from "next-intl";

type JoinOnboardingProps = Readonly<{
  locale: string;
}>;

const JoinOnboarding = ({ }: JoinOnboardingProps) => {
  const t = useTranslations("components.Join.JoinOnboarding");

  return (
    <div
      data-theme="me"
      className="bg-scope-25 border border-scope-50 rounded-section"
    >
      <div className="flex flex-col gap-6 p-6 md:p-10">
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-scope-1000 text-balance">
            {t("heading")}
          </h2>
          <p className="text-sm text-us-600 mt-1">
            {t("sub_heading")}
          </p>
        </div>

      </div>
    </div>
  );
};

export default JoinOnboarding;
