import { PinataSDK } from "pinata-web3";
import type { NextRequest } from "next/server";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
});

/**
 * POST /api/upload-metadata-FT
 * 
 * Uploads an image and metadata to IPFS via Pinata.
 * 
 * Expects multipart/form-data:
 * - file: PNG image
 * - name, description, symbol: JSON-stringified strings
 * - currentId: stringified integer
 * 
 * Responds (200):
 * {
 *   "imageUri": "bafy.../",
 *   "metadataUri": "bafy.../",
 *   "imageCID": "bafy...",
 *   "metadataCID": "bafy..."
 * }
 * 
 * Metadata example:
 * {
 *   "name": "tokenName",
 *   "description": "tokenDescription",
 *   "image": "bafy.../",
 *   "decimals": 18,
 *   "symbol": "TKN"
 * }
 * 
 * Errors: 400 (missing fields), 500 (upload errors)
 * Requires env: PINATA_JWT
 */

export async function POST(req: NextRequest) {
  console.log("POST status: started");
  try {
    const formData = await req.formData();

    // Get files and datas
    const imageFile = formData.get("file") as File;
    const nameStr = formData.get("name") as string | null;
    const descriptionStr = formData.get("description") as string | null;
    const symbolStr = formData.get("symbol") as string | null;
    const currentIdStr = formData.get("currentId") as string | null;

    if (
      !nameStr ||
      !descriptionStr ||
      !symbolStr ||
      !currentIdStr
    ) {
      return new Response("Missing names, descriptions, symbol or currentId", {
        status: 400,
      });
    }

    const name = JSON.parse(nameStr);
    const description = JSON.parse(descriptionStr);
    const symbol = JSON.parse(symbolStr);
    const currentId = BigInt(currentIdStr);

    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array_image = new Uint8Array(arrayBuffer);
    const fileName_image = `image_${currentId}.png`;
    const web3File = new File([uint8Array_image], fileName_image, {
      type: "image/png",
    });

    console.log("POST status: uploading images");
    // Upload images
    const imageUpload = await pinata.upload.file(web3File);
    const imageCID = imageUpload.IpfsHash;
    const imageBaseURI = `${imageCID}/`; 

    const metadata = {
      name,
      description,
      image: `${imageBaseURI}`, 
      decimals: 18, // Only 18 decimals
      symbol,
    };
    const json = JSON.stringify(metadata);
    const uint8Array_metadata = new Uint8Array(Buffer.from(json));
    const fileName_metadata = `metadata_${currentId}.json`;
    const metadataFile = new File([uint8Array_metadata], fileName_metadata, {
      type: "application/json",
    });

    console.log("POST status: uploading matadatas");
    // Upload metadata
    const metadataUpload = await pinata.upload.file(metadataFile);
    const metadataCID = metadataUpload.IpfsHash;
    const metadataBaseURI = `${metadataCID}/`; 

    console.log("POST status: succes!");
    return new Response(
      JSON.stringify({
        imageUri: imageBaseURI,
        metadataUri: metadataBaseURI,
        imageCID,
        metadataCID,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST status: error!");
    console.error("Upload error:", err);
    return new Response("Upload failed: " + err.message, { status: 500 });
  }
}
