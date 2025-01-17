"use client";

import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import { useRouter } from "@/i18n/routing";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { Instrument } from "@/lib/definitions";
import Loading from "@/components/Loading";
import DraftForm from "./DraftForm";

export default function Edit(
  { locale, id, address }: Readonly<{ locale: string, id?: string, address?: string }>
) {
  const t = useTranslations();
  const { isMinter, minter, isLoading } = useStateContext()
  const router = useRouter();

  // let intId: number, instrument: Instrument | undefined = undefined;
  // try {
  //   if (id) {
  //     intId = parseInt(id);
  //     instrument = minter?.instruments?.find((ins: any) => ins.id === intId);
  //     if (!instrument) {
  //       return <Page>
  //       <Section>
  //         <div className='text-center flex flex-col'>
  //           ERROR!
  //         </div>
  //       </Section>
  //     </Page>
  //     }
  //   }
  // } catch (error: any) {
  //   return (
  //     <Page>
  //       <Section>
  //         <div className='text-center flex flex-col'>
  //           {error.message}
  //         </div>
  //       </Section>
  //     </Page>
  //   );
  // }

  if (isLoading) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    <DraftForm locale={locale} instrumentId={id} address={address} />
  );
}
