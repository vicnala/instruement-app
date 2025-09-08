import type { Metadata, ResolvingMetadata } from 'next';
import Instrument from "@/components/Instrument/Instrument";
import { redirect } from "@/i18n/routing";
import NotFound from "@/app/not-found";
import { client } from "@/app/client";
import { resolveScheme } from "thirdweb/storage";

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

  const metadata = {
    title: `Instrument ${id}`,
    description: ``,
    openGraph: {
      title: `Instrument ${id}`,
      description: ``,
      images: [
        { url: "" }
      ]
    }
  }

  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/instrument/asset/${id}?locale=${locale || "en"}`).then(res => res.json());
    const { data } = result;

    if (data.code === "success") {  
      const instrument: any = data.data;
      metadata.title = instrument.title;
      // metadata.description = instrument.type_name;
      
      const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/file/${instrument.cover_image}`).then(res => res.json());
      if (result.code === "success") {
        const coverImage = result.data.data;
        const { sizes } = coverImage;
        if (sizes.og) {
          const ogImage = `${result.data.data.base_url}${sizes.og.file}`;
          metadata.openGraph.images = [
            { url: ogImage }
          ];
          metadata.openGraph.title = instrument.title;
          // metadata.openGraph.description = instrument.type_name;
        }
        // console.log("metadata", metadata.openGraph);
        return metadata;
      }
    }
  } catch (error) {
    console.error("metadata error", error);
  }

  return metadata;

  // try {
  //   const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/token/${id}?locale=${locale || "en"}`).then(res => res.json());
  //   const { metadata, owner } = result;
  
  //   return {
  //     title: metadata?.name || `Instrument ${id}`,
  //     description: metadata?.name || "",
  //     openGraph: {
  //       title: metadata?.name || `Instrument ${id}`,
  //       description: ``,
  //       images: [
  //         { url: metadata?.image || "" }
  //       ]
  //     }
  //   };
    
  // } catch (error) {
  //   return metadata;
  // }
}

export default async function InstrumentPage({ searchParams, params }: Props) {
  const { id, locale } = await params;
  const { to } = await searchParams;

  if (!locale) {
    redirect({ href: `/instrument/${id}?to=${to}`, locale: locale || 'en' });
  }

  const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/token/${id}`)
  const data = await result.json();

  if (!data?.metadata) return <NotFound />;

  let minter = "";
  let images = [];
  let documents = [];
  const properties = data.metadata.properties || data.metadata.attributes || [];
  const fileDirHashTrait = properties.find((prop: any) => prop.trait_type === 'Files');
  const registrarTrait = properties.find((prop: any) => prop.trait_type === 'Registrar');
  if (registrarTrait) {
    minter = registrarTrait.value;
  }

  if (fileDirHashTrait) {
    const fileDirHash = fileDirHashTrait.value;
    // console.log("fileDirHash", fileDirHash);

    const fileDescriptionsUrl = await resolveScheme({
      client,
      uri: `ipfs://${fileDirHash}/descriptions`
    });
    // console.log("fileDescriptionsUrl", fileDescriptionsUrl);

    const result = await fetch(fileDescriptionsUrl)
    const fileDescriptionsData = await result.json();
    // console.log("fileDescriptionsData", fileDescriptionsData);					

    for (const fileDescription of fileDescriptionsData) {
      if (fileDescription.cover) continue;

      if (fileDescription.name.includes('image')) {
        const uri = await resolveScheme({
          client,
          uri: `ipfs://${fileDirHash}/${fileDescription.name}`
        });
        if (uri) images.push({ uri, description: fileDescription.description });
      } else if (fileDescription.name.includes('document')) {
        const uri = await resolveScheme({
          client,
          uri: `ipfs://${fileDirHash}/${fileDescription.name}`
        });
        if (uri) documents.push({ uri, description: fileDescription.description });
      }
    }
  }

  return (
    <Instrument id={id} instrumentAsset={data} minter={minter} images={images} documents={documents} locale={locale} to={to} />
  );
}
