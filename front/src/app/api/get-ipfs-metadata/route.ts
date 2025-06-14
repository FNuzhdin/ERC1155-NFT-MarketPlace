import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {

  const { cid } = await req.json();
  console.log('Received the cid:', cid);

  if (!cid || typeof cid !== "string") {
    return NextResponse.json(
      { error: "CID is required in request body" },
      { status: 400 }
    );
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "Server misconfiguration: no JWT" },
      { status: 500 }
    );
  }

  const url = `https://ipfs.io/ipfs/${cid}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from Pinata: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status:  200});
  } catch (error: any) {
    return NextResponse.json(
      { error: error.massage || "Unknown error"}, 
      { status: 500}
    );
  }
}
