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

async function fetchAndStreamImage(url: string) {
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

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
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
            try {
              const result = await fetch(`${process.env.INSTRUEMENT_API_URL}/user/${data.metadata.minterAddress}`, {
                cache: 'no-store',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`,
                }
              })
              const { code, data: minter } = await result.json()

              if (code === 'success') {
                const instrument = minter.instruments.find((ins: any) => ins.id === parseInt(data.metadata.id));
                // console.log("instrument", instrument?.images);                
                if (instrument) {
                  const files = [];
                  const descriptions = [];

                  const images = instrument.images
                    .map((img: any) => img[0])
                    .sort((imga: any, imgb: any) => imga.id > imgb.id ? 1 : -1);

                  let imageIndex: number = 0;
                  for (const image of images) {
                    const file_url = image.file_url;
                    // const file_name_split =image.file.split('.');
                    // const file_name_ext = file_name_split[file_name_split.length -1];
                    // const file_name = image.file;
                    // const file_name = `${imageIndex}.${file_name_ext}`;
                    const file_name = `${imageIndex}`;
                    const file_type = image.type;
                    // console.log(file_name);

                    const blob = await fetchAndStreamImage(file_url);
                    if (blob) {
                      const file = new File([blob], file_name, { type: file_type });
                      files.push(file);
                      descriptions.push(image.description);
                    }
                    imageIndex++;
                  }

                  const uris = await upload({
                    client,
                    files
                  });

                  let uri0, fileCount = 1;
                  if (Array.isArray(uris)) {
                    uri0 = uris[0];
                    fileCount = uris.length;
                  } else {
                    uri0 = uris;
                  }

                  if (uris && uris.length) {
                    const fileDirSplit = uri0.split('/');
                    const FileDirHash = fileDirSplit[2];
                    // console.log("FileDirHash", FileDirHash);

                    const metadata = {
                      image: uri0,
                      name: instrument.title,
                      description: instrument.description,
                      properties: [
                        {
                          trait_type: "Registrar",
                          value: data.metadata.minterAddress
                        },
                        {
                          trait_type: "Type",
                          value: instrument.type
                        },
                        {
                          trait_type: "FileDirHash",
                          value: FileDirHash
                        },
                        {
                          trait_type: "FileCount",
                          value: fileCount
                        },
                        {
                          trait_type: "FileDescriptions",
                          value: JSON.stringify(descriptions)
                        },
                      ]
                    }

                    const engine = new Engine({
                      url: ENGINE_URL,
                      accessToken: ENGINE_ACCESS_TOKEN,
                    });

                    const cahin = CHAIN_ID;
                    const contractAddress = NEXT_PUBLIC_INSTRUEMENT_COLLECTION_ADDRESS;
                    const xBackendWalletAddress = BACKEND_WALLET_ADDRESS;
                    const receiver = data.metadata.address;

                    // console.log('metadata', metadata);

                    const mintResult = await engine.erc721.mintTo(
                      cahin,
                      contractAddress,
                      xBackendWalletAddress,
                      { receiver, metadata }
                    );

                    console.log('mintResult', mintResult);
                  }
                }
              }
            } catch (err: any) {
              console.error(`/api/webhook error:`, err)
            }
          }
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 },
      );
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: "Received" }, { status: 200 });
}