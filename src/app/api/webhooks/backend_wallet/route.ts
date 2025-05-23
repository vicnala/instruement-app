'use server'

import { NextRequest, NextResponse } from "next/server";
import { Engine } from "@thirdweb-dev/engine";
import { isExpired, isValidSignature } from "../webhookHelper";

const {
    ENGINE_URL,
    ENGINE_ACCESS_TOKEN,
    NEXT_PUBLIC_CHAIN_ID,
    BACKEND_WALLET_WEBHOOK_SECRET
} = process.env;

export async function POST( request: Request, response: Response ) {
    const signatureFromHeader = request.headers.get("X-Engine-Signature");
    const timestampFromHeader = request.headers.get("X-Engine-Timestamp");
    
    if (!BACKEND_WALLET_WEBHOOK_SECRET) {
        return NextResponse.json(
            { message: "Missing BACKEND_WALLET_WEBHOOK_SECRET" },
            { status: 401 },
        );
    }
       
    if (!signatureFromHeader || !timestampFromHeader) {
        return NextResponse.json(
            { message: "Missing signature or timestamp header" },
            { status: 401 },
        );
    }
    
    const data = await request.json();

    if (
        !isValidSignature(
            JSON.stringify(data),
            timestampFromHeader,
            signatureFromHeader,
            BACKEND_WALLET_WEBHOOK_SECRET,
        )
    ) {
        console.log("ERROR: Invalid signature");
        return NextResponse.json(
            { message: "Invalid signature" },
            { status: 401 },
        );
    }
    
    // if (isExpired(timestampFromHeader, 300)) {
    //     // Assuming expiration time is 5 minutes (300 seconds)
    //     return NextResponse.json(
    //         { message: "Request has expired" },
    //         { status: 401 },
    //     );
    // }

    const { queueId, status, chainId } = data;

    if (status !== 'mined') {
        return NextResponse.json(
            { message: "OK" },
            { status: 200 },
        );
    }
    
    console.log('/api/webhooks/backend_wallet', status, chainId, queueId);

    try {
        const getResult = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/queue/${queueId}`, {
            cache: 'no-store',
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` }
        })
        const getData = await getResult.json()
        const instrumentId = getData.data.id;
    
        console.log(`GET /api/instrument/queue/${queueId}`, getData.message);
    
        if (getData?.code === 'success') {
            if (
                !ENGINE_URL ||
                !ENGINE_ACCESS_TOKEN ||
                !NEXT_PUBLIC_CHAIN_ID
            ) {
                return NextResponse.json(
                    { message: "BAD ENV" },
                    { status: 400 },
                );
            }
        
            const engine = new Engine({
                url: ENGINE_URL,
                accessToken: ENGINE_ACCESS_TOKEN,
            });
        
            const { result } = await engine.transaction.getTransactionLogs(NEXT_PUBLIC_CHAIN_ID, queueId);
            
            console.log("getTransactionLogs", result);

            const tokensMintedEvent = result.find(r => r.eventName === 'TokensMinted');
            const tokensTransferEvent = result.find(r => r.eventName === 'Transfer');

            let mintedTo, tokenIdMinted;
            if (tokensMintedEvent && tokensMintedEvent.args) {
                mintedTo = tokensMintedEvent.args.mintedTo;
                tokenIdMinted = tokensMintedEvent.args.tokenIdMinted;
            } else {
                if (tokensTransferEvent && tokensTransferEvent.args) {
                    mintedTo = tokensTransferEvent.args.to;
                    tokenIdMinted = tokensTransferEvent.args.tokenId;
                } else {
                    console.error(`Update asset_id FAILED for draft #${instrumentId} queue_id ${queueId}: No events found`);
                }
            }

            if (mintedTo && tokenIdMinted) {
                const postResult = await fetch(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/instrument/${instrumentId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` },
                    body: JSON.stringify({ asset_id: tokenIdMinted })
                });
    
                const postData = await postResult.json()
                
                if (postData?.code === 'success') {
                    console.log(`Update asset_id SUCCEED for draft #${instrumentId} queue_id ${queueId} and asset_id #${tokenIdMinted}`);
                    return Response.json({ message: "Received" })
                }
            }
        } else {
            console.error(`GET /instrument/queue/${queueId} FAILED with ${getData?.data?.message}`);
            return NextResponse.json(
                { message: getData?.message },
                { status: 200 },
            );   
        }
        console.error(`Update asset_id FAILED for draft #${instrumentId} queue_id ${queueId}`);
        return Response.json(
            { data: { message: `Update asset_id FAILED for draft #${instrumentId} queue_id ${queueId}` } },
            { status: 400 }
        )
    } catch (err: any) {
        console.error(`/api/webhooks/contracts/instrument POST error`, err.message)
        return Response.json(
            { data: { message: err.message } },
            { status: 400 }
        )
    }
}