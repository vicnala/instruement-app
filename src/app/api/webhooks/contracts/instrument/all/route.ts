'use server'

import { NextResponse } from "next/server";

export async function POST( request: Request ) {   
    const { type, data} = await request.json()
        
    if (data.eventName === 'TokensMinted') {
        console.log('/api/webhooks/contracts/instrument/all', type, data.eventName, data.decodedLog.tokenIdMinted.value, 'to', data.decodedLog.mintedTo.value);
    }
    
    return NextResponse.json(
        { message: "OK" },
        { status: 200 },
    );
}