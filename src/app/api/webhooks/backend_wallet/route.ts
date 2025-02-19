'use server'

import { NextRequest, NextResponse } from "next/server";
import {
    getRpcClient,
    eth_getTransactionReceipt,
} from "thirdweb/rpc";
import { Engine } from "@thirdweb-dev/engine";
import { isExpired, isValidSignature } from "../webhookHelper";
import { client } from "@/app/client";
import { baseSepolia } from "thirdweb/chains";

const {
    ENGINE_URL,
    ENGINE_ACCESS_TOKEN,
    CHAIN_ID,
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
    
    const data = await request.json()
    
    if (!signatureFromHeader || !timestampFromHeader) {
        return NextResponse.json(
            { message: "Missing signature or timestamp header" },
            { status: 401 },
        );
    }
    
    if (
        !isValidSignature(
            JSON.stringify(data),
            timestampFromHeader,
            signatureFromHeader,
            BACKEND_WALLET_WEBHOOK_SECRET,
        )
    ) {
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
        const getResult = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/queue/${queueId}`, {
            cache: 'no-store',
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` }
        })
        const getData = await getResult.json()
    
        console.log(`GET /api/instrument/queue/${queueId}`, getData.message);
    
        if (getData?.code === 'success') {
            if (
                !ENGINE_URL ||
                !ENGINE_ACCESS_TOKEN ||
                !CHAIN_ID
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
        
            const { result } = await engine.transaction.getTransactionLogs(CHAIN_ID, queueId);
            
            const tokensMintedEvent = result.find(r => r.eventName === 'TokensMinted');
            if (tokensMintedEvent && tokensMintedEvent.args) {
                const mintedTo = tokensMintedEvent.args.mintedTo;
                const tokenIdMinted = tokensMintedEvent.args.tokenIdMinted;
                
                console.log("TokensMinted", tokenIdMinted, 'to', mintedTo);
            
                const instrumentId = getData.data.id;
    
                const postResult = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${instrumentId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` },
                    body: JSON.stringify({ asset_id: tokenIdMinted })
                });
    
                const postData = await postResult.json()
                
                if (postData?.code === 'success') {
                    console.log(`Update asset_id SUCCEED for draft #${getData?.data?.id} queue_id ${queueId} and asset_id #${tokenIdMinted}`);
                    return Response.json({ message: "Received" })
                }
            }

        } else {
            // console.error(`GET /instrument/queue/${queueId} FAILED with ${getData?.data?.message}`);
            return NextResponse.json(
                { message: getData?.message },
                { status: 200 },
            );   
        }
        console.error(`Update asset_id FAILED for draft #${getData?.data?.id} queue_id ${queueId}`);
        return Response.json(
            { data: { message: `Update asset_id FAILED for draft #${getData?.data?.id} queue_id ${queueId}` } },
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