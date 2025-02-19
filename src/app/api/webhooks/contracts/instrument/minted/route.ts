'use server'

import { NextRequest, NextResponse } from "next/server";
import { generateSignature, isExpired, isValidSignature } from "../../webhookHelper";


const WEBHOOK_SECRET = process.env.INSTRUEMENT_CONTRACT_SUBSCRIPTION_WEBHOOK_SECRET;

export async function POST( request: Request, response: Response ) {
    const signatureFromHeader = request.headers.get("X-Engine-Signature");
    const timestampFromHeader = request.headers.get("X-Engine-Timestamp");
    
    if (!WEBHOOK_SECRET) {
        return NextResponse.json(
            { message: "Missing INSTRUEMENT_CONTRACT_SUBSCRIPTION_WEBHOOK_SECRET" },
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
            WEBHOOK_SECRET,
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
        
    console.log('/api/webhooks/contracts/instrument/minted', data);
    
    const { queueId, status, chainId, value: asset_id } = data;

    console.log(queueId, status, chainId, asset_id);
    
    try {
        const getResult = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/queue/${queueId}`, {
            cache: 'no-store',
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` }
        })
        const getData = await getResult.json()
    
        console.log(`GET /api/instrument/queue_id/${queueId}`, getData)
    
        if (getData?.code === 'success') {
            if (getData.data.queue_id !== queueId) {
                return NextResponse.json(
                    { message: "Invalid queue_id" },
                    { status: 401 },
                );
            }

            const instrumentId = getData.data.id;

            const postResult = await fetch(`${process.env.INSTRUEMENT_API_URL}/instrument/${instrumentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}` },
                body: JSON.stringify({ asset_id })
            });

            const postData = await postResult.json()
            
            if (postData?.code === 'success') {
                console.log(`Update asset_id SUCCEED for draft #${getData?.data?.id} queue_id ${queueId} and asset_id #${asset_id}`);
                return Response.json({ message: "Received" })
            }
        } else {
            console.error(`GET /instrument/queue/${queueId} FAILED with ${getData?.data?.message}`);
            return NextResponse.json(
                { message: getData?.message },
                { status: getData?.data?.status },
            );   
        }
        console.error(`Update asset_id FAILED for draft #${getData?.data?.id} queue_id ${queueId} and asset_id #${asset_id}`);
        return Response.json(
            { data: { message: `Update asset_id FAILED for draft #${getData?.data?.id} queue_id ${queueId} and asset_id #${asset_id}` } },
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