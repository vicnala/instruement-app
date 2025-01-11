"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import { useRouter } from "@/i18n/routing";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { Instrument } from "@/lib/definitions";
import Loading from "@/components/Loading";

export default function Pay(
  { locale, id }: Readonly<{ locale: string, id: string }>
) {
  const t = useTranslations();
  const { minter, isLoading } = useStateContext()
  const router = useRouter();

  let intId: number, instrument: Instrument;
  try {
    intId = parseInt(id);
    instrument = minter?.instruments?.find((ins: any) => ins.id === intId);
  } catch (error: any) {
    return (
      <Page>
        <Section>
          <div className='text-center flex flex-col'>
            {error.message}
          </div>
        </Section>
      </Page>
    );
  }

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    <Page>
      <div className="text-center">
        Pay Page of #{id}
      </div>
    </Page>
  );
}
