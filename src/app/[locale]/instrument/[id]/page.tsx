import type { Metadata, ResolvingMetadata } from 'next';
import Instrument from "@/components/Instrument/Instrument";
import NotFound from "@/app/not-found";
import { client } from "@/app/client";
import { resolveScheme } from "thirdweb/storage";
import { getInstrument, getInstrumentFile } from "@/services/instrumentsService";
import { getToken } from "@/services/TokensService";
import { userAuthData } from "@/actions/login";

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
    const result = await getInstrument(id, locale || "en");
    const data = result as any;

    if (data.code === "success") {
      const instrument: any = data.data;
      metadata.title = instrument.title;
      // metadata.description = instrument.type_name;
    
        const result = await getInstrumentFile(instrument.cover_image);
        const coverImageResult = result as any;

        if (coverImageResult.code === "success") {
          const coverImage = coverImageResult.data;
          const { sizes } = coverImage;
          if (sizes.og) {
            const ogImage = `${coverImage.base_url}${sizes.og.file}`;
            metadata.openGraph.images = [
              { url: ogImage }
            ];
            metadata.openGraph.title = instrument.title;
            // metadata.openGraph.description = instrument.type_name;
          }
        }

        // console.log("metadata", metadata.openGraph);
        return metadata;

    }
  } catch (error) {
    console.error("metadata error", error);
  }

  return metadata;
}

export default async function InstrumentPage({ searchParams, params }: Props) {
  const { id, locale } = await params;
  const { to } = await searchParams;
  let authResult: any;
  let authContext: any;
  let data: any;

  try {
    authResult = await userAuthData();
    authContext = authResult?.parsedJWT;
  } catch (error) {
    console.error("authResult error", error);
  }

  if (!authResult) {
    authContext = {
      sub: undefined,
      ctx: {
        isMinter: false,
        isLuthier: false,
        isVerified: false,
        userId: undefined,
        firstName: ""
      }
    };
  }

  try {
    data = await getToken(id);
  } catch (error) {
    console.error("data error", error);
  }

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

  if (!minter || !images || !documents) return <NotFound />;

  return (
    <Instrument
      id={id}
      instrumentAsset={data}
      minter={minter}
      images={images}
      documents={documents}
      locale={locale}
      to={to}
      context={authContext}
    />
  );
}
