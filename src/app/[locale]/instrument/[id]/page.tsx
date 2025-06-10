import type { Metadata, ResolvingMetadata } from 'next';
import Instrument from "@/components/Instrument/Instrument";
import { redirect } from "@/i18n/routing";
// import TokenService from '@/services/TokenService';

type Props = {
  params: Promise<{ locale: string, id: string }>
  searchParams: Promise<{ to?: string }>
}

export async function generateMetadata(
  { params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata>
{
  const { id, locale } = await params;
  const { to } = await searchParams;
  const parentMetadata = await parent;

  const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/token/${id}?locale=${locale || "en"}`).then(res => res.json());
  
  const { metadata, owner } = result;

  return {
    title: metadata?.name || `Instrument ${id}`,
    description: metadata?.name || "",
    openGraph: {
      title: metadata?.name || `Instrument ${id}`,
      description: ``,
      images: [
        { url: metadata?.image || "" }
      ]
    }
  };
}

export default async function InstrumentPage({ searchParams, params }: Props) {
  const { id, locale } = await params;
  const { to } = await searchParams;

  if (!locale) {
    redirect({ href: `/instrument/${id}?to=${to}`, locale: locale || 'en' });
  }

  return (
    <Instrument id={id} locale={locale} to={to} />
  );
}
