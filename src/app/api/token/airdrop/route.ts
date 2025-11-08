import { NextResponse } from "next/server";
import { Engine } from "@thirdweb-dev/engine";
import { upload } from "thirdweb/storage";
import { client } from "@/app/client";
import { ImageDescription } from "@/lib/definitions";
import { fetchAndStreamFile } from "@/lib/fetchAndStreamFile";
import { userAuthData } from "@/actions/login";
import { getUser } from "@/services/UsersService";

const {
  STRIPE_WEBHOOK_SECRET_KEY,
  ENGINE_URL,
  ENGINE_ACCESS_TOKEN,
  NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
  BACKEND_WALLET_ADDRESS,
  NEXT_PUBLIC_CHAIN_ID
} = process.env;

export async function POST(request: Request) {
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` };
  
  const { address, name, id, instrument } = await request.json();

  if (!address || !name || !id || !instrument) {
    return NextResponse.json(
      { data: { message: `Missing required fields` } },
      { status: 400 }
    )
  }
  
  const authData: any = await userAuthData();
  if (!authData?.parsedJWT) {
    return NextResponse.json(
      { data: { message: `Unauthorized` } },
      { status: 401 }
    )
  }

  const context = authData.parsedJWT;
  if (!context?.sub) {
    return NextResponse.json(
      { data: { message: `Unauthorized` } },
      { status: 401 }
    )
  }

  const authContext = authData.parsedJWT.ctx;
  const isMinter = authContext.isMinter;

  if (!isMinter) {
    return NextResponse.json(
      { data: { message: `Forbidden` } },
      { status: 401 }
    )
  }

  const minter = await getUser(context.sub);
  if (minter.code !== 'success') {
    return NextResponse.json(
      { data: { message: `Minter not found` } },
      { status: 400 }
    )
  }

  const assetCount = minter.data.asset_count.length;

  if (assetCount !== 0) {
    return NextResponse.json({ data: { message: `Not qualified for the airdrop` } }, { status: 400 });
  }
  
  try {
    if (
      !ENGINE_URL ||
      !ENGINE_ACCESS_TOKEN ||
      !NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS ||
      !BACKEND_WALLET_ADDRESS ||
      !NEXT_PUBLIC_CHAIN_ID
    ) {
      throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
    }

    if (context.sub && id) {
      let result, blob;
      try {
        result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/user/${context.sub}`,
          { method: 'GET', headers, cache: 'no-store' })
        const { code, message, data: minter } = await result.json()

        if (code === 'success') {
          const instrumentId = minter.instruments.find((instrumentId: number) => instrumentId === parseInt(id));
          // console.log('instrumentId ok:', instrumentId);
          if (!instrumentId) {
            return NextResponse.json(
              { message: `/api/token/airdrop wrong instrument id` },
              { status: 400 },
            );
          }
          
          result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${instrumentId}`,
            { method: 'GET', headers, cache: 'no-store' })
          const { code, message, data: instrument }  = await result.json()

          if (code === 'success') {
            if (instrument.queue_id) {
              return NextResponse.json({ message: `Already processing queueId ${instrument.queue_id} for instrument ${instrumentId}` }, { status: 200 });
            }
            // console.log('instrument mint', instrument);

            const files: File[] = [];
            const descriptions: ImageDescription[] = [];

            const coverId = instrument.cover_image;
            const imagesIds = instrument.images;
            const filesIds = instrument.files;

            // IMAGES
            let imageIndex: number = 0;
            for (const imageId of imagesIds) {
              try {
                result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/file/${imageId}`,
                  { method: 'GET', headers, cache: 'no-store' });                     

                if (result.status !== 200) {
                  return NextResponse.json(
                    { message: `/api/token/airdrop fetch file ${imageId} ERROR: ${result.statusText}` },
                    { status: 400 },
                  );
                }
                
                const { data: _image } = await result.json();
                // console.log("_image", _image);

                blob = await fetchAndStreamFile(_image.file_url);
                const fileName = `image_${imageIndex}`;
                if (blob) {
                    const file = new File([blob], fileName, { type: _image.type });
                    files.push(file);
                    // imagesDescriptions.push(_image.description);
                    descriptions.push({
                      name: fileName,
                      description: _image.description,
                      cover: imageId === coverId ? true : false
                    });
                }
                imageIndex++;
              } catch (error: any) {
                console.error(`/api/token/airdrop fetch file ${imageId} ERROR:`, error.message);
              }
            }

            // DOCUMENTS
            let documentIndex: number = 0;
            for (const fileId of filesIds) {
              try {
                result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/file/${fileId}`,
                  { method: 'GET', headers, cache: 'no-store' });
                const { data: _file } = await result.json();
                // console.log("_file", _file);
                blob = await fetchAndStreamFile(_file.file_url);
                const fileName = `document_${documentIndex}`;
                if (blob) {
                  const file = new File([blob], fileName, { type: _file.type });
                  files.push(file);
                  // filesDescriptions.push(_file.description);
                  descriptions.push({
                    name: fileName,
                    description: _file.description,
                    cover: false
                  });
                }
                documentIndex++;
              } catch (error: any) {
                console.error(`/api/token/airdrop fetch file ${fileId} ERROR:`, error.message);
              }
            }

            const _descriptionsString = JSON.stringify(descriptions);
            const _descriptionsBlob = Buffer.from(_descriptionsString, 'utf-8');
            const _descriptions = new File([_descriptionsBlob], `descriptions`, { type: 'text/plain' });
            files.push(_descriptions);
  
            // console.log("descriptions", descriptions);

            const coverFileName = descriptions.find(d => d.cover === true);

            if (coverFileName) {
              // console.log('coverFileName', coverFileName.name);
  
              // sort the files so the first one is the cover
              files.sort((a, b) => a.name === coverFileName?.name ? -1 : 1);
              
              // upload files to IPFS
              const uris = await upload({ client, files });
              // console.log("uris", uris);
              
              // get the cover umage URI as the first uri
              const coverURI = uris[0];
              // console.log("coverURI", coverURI);
  
              if (coverURI) {
                const fileDirSplit = coverURI.split('/');
                const FileDirHash = fileDirSplit[2];
  
                const metadata = {
                  image: coverURI,
                  name: instrument.title,
                  description: instrument.description,
                  background_color: "",
                  external_url: "",
                  customImage: "",
                  customAnimationUrl: "",
                  animation_url: "",
                  properties: [
                    {
                      trait_type: "Registrar",
                      value: context.sub
                    },
                    {
                      trait_type: "Type",
                      value: instrument.type
                    },
                    {
                      trait_type: "Files",
                      value: FileDirHash
                    }
                  ]
                }
          
                const engine = new Engine({
                  url: ENGINE_URL,
                  accessToken: ENGINE_ACCESS_TOKEN,
                });

                // console.log(">>> engine.erc721.mintTo <<< start");
  
                const mintResult = await engine.erc721.mintTo(
                  NEXT_PUBLIC_CHAIN_ID,
                  NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
                  BACKEND_WALLET_ADDRESS,
                  { receiver: address, metadata }
                );

                // console.log(">>> engine.erc721.mintTo <<< end");
                
                const { queueId } = mintResult.result;

                // console.log('api/token/airdrop queueId', queueId, 'for instrument', instrumentId);

                result = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${instrumentId}`, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ queue_id: queueId }),
                  cache: 'no-store'
                });

                const updateData = await result.json();
                if (updateData?.code === 'success') {
                  console.log("api/token/airdrop queueId POST", updateData.data);
                  return NextResponse.json({
                    code: "success",
                    data: { message: `Airdrop successful` },
                  }, { status: 200 });
                } else {
                  return NextResponse.json(
                    { message: `/api/token/airdrop ${message}` },
                    { status: 400 },
                  );
                }
              } else {
                return NextResponse.json(
                  { message: `/api/token/airdrop NO COVER URI` },
                  { status: 400 },
                );
              }
            } else {
              return NextResponse.json(
                { message: `/api/token/airdrop NO COVER URI FILE` },
                { status: 400 },
              );
            }
          } else {
            return NextResponse.json(
              { message: `/api/token/airdrop 1 ${message}` },
              { status: 400 },
            );
          }
        } else {
          return NextResponse.json(
            { message: `/api/token/airdrop 2 ${message}` },
            { status: 400 },
          );
        }
      } catch (err: any) {
        return NextResponse.json(
          { message: `/api/token/airdrop 3 ${err.message}` },
          { status: 400 },
        );
      }
    }
  } catch (error: any) {
    // console.error(`/api/token/airdrop:`, error)
    return NextResponse.json(
      { message: error.message ? error.message : "Webhook handler failed" },
      { status: 400 },
    );
  }
}