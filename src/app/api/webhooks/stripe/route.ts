import type { Stripe } from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { Engine } from "@thirdweb-dev/engine";
import { upload } from "thirdweb/storage";
import { client } from "@/app/client";

const {
  STRIPE_WEBHOOK_SECRET_KEY,
  ENGINE_URL,
  ENGINE_ACCESS_TOKEN,
  NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
  BACKEND_WALLET_ADDRESS,
  THIRDWEB_SECRET_KEY,
  CHAIN_ID
} = process.env;

type ImageDescription = {
  name: string;
  description: string;
  cover: boolean;
}

async function fetchAndStreamFile(url: string) {
  const response = await fetch(url);
  if (response.body) {
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });
    const newResponse = new Response(stream);
    const blob = await newResponse.blob();
    return blob;
  }
}

export async function POST(request: Request) {
  let event: Stripe.Event;

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` };

  try {
    event = stripe.webhooks.constructEvent(
      await (await request.blob()).text(),
      request.headers.get("stripe-signature") as string,
      STRIPE_WEBHOOK_SECRET_KEY as string,
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    if (err! instanceof Error) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    );
  }

  // Successfully constructed event.
  console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
  ];

  if (permittedEvents.includes(event.type)) {
    let data: any;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;
          console.log(`💰 CheckoutSession status: ${data.payment_status}`);
          break;
        case "payment_intent.payment_failed":
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`❌ Payment failed: ${data.last_payment_error?.message}`);
          break;
        case "payment_intent.succeeded":
          data = event.data.object as Stripe.PaymentIntent;

          if (
            !ENGINE_URL ||
            !ENGINE_ACCESS_TOKEN ||
            !NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS ||
            !BACKEND_WALLET_ADDRESS ||
            !THIRDWEB_SECRET_KEY ||
            !CHAIN_ID
          ) {
            throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
          }

          console.log(`💰 PaymentIntent status: ${data.status}`);
          console.log(`💰 PaymentIntent address:`, data.metadata?.address);
          console.log(`💰 PaymentIntent instrumentId:`, data.metadata?.id);
          console.log(`💰 PaymentIntent minterAddress:`, data.metadata?.minterAddress);

          if (data.metadata.minterAddress && data.metadata.id) {
            let result, blob;
            try {
              result = await fetch(`${process.env.INSTRUEMENT_API_URL}/user/${data.metadata.minterAddress}`, {  cache: 'no-store', headers })
              const { code, message, data: minter } = await result.json()

              if (code === 'success') {
                const instrumentId = minter.instruments.find((id: number) => id === parseInt(data.metadata.id));
                // console.log('instrumentId ok:', instrumentId);
                if (!instrumentId) {
                  throw new Error(`/api/webhooks/stripe wrong instrument id`);
                }
                
                result = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${instrumentId}`, { cache: 'no-store', method: 'GET', headers })
                const { code, message, data: instrument }  = await result.json()

                // console.log('instrument mint', instrument);

                if (code === 'success') {
                  const files: File[] = [];
                  const descriptions: ImageDescription[] = [];

                  const coverId = instrument.cover_image;
                  const imagesIds = instrument.images;
                  const filesIds = instrument.files;

                  // IMAGES
                  let imageIndex: number = 0;
                  for (const imageId of imagesIds) {
                    result = await fetch(`${process.env.INSTRUEMENT_API_URL}/file/${imageId}`, { headers });
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
                  }

                  // DOCUMENTS
                  let documentIndex: number = 0;
                  for (const fileId of filesIds) {
                    result = await fetch(`${process.env.INSTRUEMENT_API_URL}/file/${fileId}`, { headers });
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
                    files.sort((a, b) => a.name === coverFileName.name ? -1 : 1);
                    
                    // upload files to IPFS
                    const uris = await upload({ client, files });
        
                    // console.log("uris", uris);
                    
                    // get the cover umage URI as the first uri
                    const coverURI = uris[0];
        
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
                            value: BACKEND_WALLET_ADDRESS
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
        
                      // console.log('metadata', metadata);
        
                      const engine = new Engine({
                        url: ENGINE_URL,
                        accessToken: ENGINE_ACCESS_TOKEN,
                      });

                      console.log(">>> engine.erc721.mintTo <<< start");
                      
        
                      const mintResult = await engine.erc721.mintTo(
                        CHAIN_ID,
                        NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS,
                        BACKEND_WALLET_ADDRESS,
                        { receiver: data.metadata?.address, metadata }
                      );

                      console.log(">>> engine.erc721.mintTo <<< end");
                      
                      const { queueId } = mintResult.result;

                      console.log('queueId', queueId, 'for draft', instrumentId);

                      result = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${instrumentId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` },
                        body: JSON.stringify({ queue_id: queueId })
                      });

                      const updateData = await result.json();
                      if (updateData?.code === 'success') {
                        return NextResponse.json({ message: "Received" }, { status: 200 });
                      } else {
                        throw new Error(`/api/webhooks/stripe ${message}`);
                      }
                    } else {
                      throw new Error(`/api/webhooks/stripe NO COVER URI`);
                    }
                  } else {
                    throw new Error(`/api/webhooks/stripe NO COVER URI FILE`);
                  }
                } else {
                  throw new Error(`/api/webhooks/stripe 1 ${message}`);
                }
              } else {
                throw new Error(`/api/webhooks/stripe 2 ${message}`);
              }
            } catch (err: any) {
              throw new Error(`/api/webhooks/stripe 3 ${err.message}`);
            }
          }
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error: any) {
      console.error(`/api/webhooks/stripe:`, error)
      return NextResponse.json(
        { message: error.message ? error.message : "Webhook handler failed" },
        { status: 400 },
      );
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: "Received" }, { status: 200 });
}