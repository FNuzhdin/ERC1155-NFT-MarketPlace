import { PinataSDK } from "pinata-web3";
import type { NextRequest } from "next/server";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
});

/**
 * POST /api/upload-metadata-NFT
 * 
 * Uploads multiple images and their metadata to IPFS via Pinata in batch mode.
 * 
 * Expects multipart/form-data:
 * - file: PNG image files (can be multiple, same field name)
 * - names: JSON-stringified array of names
 * - descriptions: JSON-stringified array of descriptions
 * - currentId: stringified integer (used for file naming)
 * 
 * Images and metadata are matched by index.
 * 
 * Responds (200):
 * {
 *   "imageUri": "bafy.../",
 *   "metadataUri": "bafy.../",
 *   "imageCID": "bafy...",
 *   "metadataCID": "bafy...",
 *   "length": 3
 * }
 * 
 * Metadata example (for each NFT):
 * {
 *   "name": "tokenName",
 *   "description": "tokenDescription",
 *   "image": "bafy.../image_1.png"
 * }
 * 
 * Errors: 
 * - 400: missing fields, or files/count mismatch
 * - 500: upload errors
 * 
 * Requires env: PINATA_JWT
 */

export async function POST(req: NextRequest) {
  console.log("POST status: started");
  try {
    const formData = await req.formData();

    // Get files and datas
    const imageFiles = formData.getAll("file") as File[];
    const namesStr = formData.get("names") as string | null;
    const descriptionsStr = formData.get("descriptions") as string | null;
    const currentIdStr = formData.get("currentId") as string | null;
    const length = imageFiles.length; 

    if (!namesStr || !descriptionsStr || !currentIdStr) {
      return new Response("Missing names, descriptions or currentId", { status: 400 });
    }

    const names = JSON.parse(namesStr);
    const descriptions = JSON.parse(descriptionsStr);
    const currentId = BigInt(currentIdStr);

    if (
      imageFiles.length === 0 ||
      imageFiles.length !== names.length ||
      imageFiles.length !== descriptions.length
    ) {
      return new Response("Files, names and descriptions count mismatch", { status: 400 });
    }

    // Rename for pinata
    const web3Files = await Promise.all(
      imageFiles.map(async (file, i) => {

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const filename = `image_${currentId + BigInt(i)}.png`;
        return new File([uint8Array], filename, { type: "image/png" });
      })
    );
    console.log("POST status: uploading images");
    // Upload images
    const imageUpload = await pinata.upload.fileArray(web3Files);
    const imageCID = imageUpload.IpfsHash;
    const imageBaseURI = `${imageCID}/`; 
 
    // Preparing metadata
    const metadataFiles = names.map((name: any, i: any) => {
      const metadata = {
        name,
        description: descriptions[i],
        image: `${imageBaseURI}image_${currentId + BigInt(i)}.png`,
      };
      const json = JSON.stringify(metadata);
      const buffer = Buffer.from(json);

      const uint8Array = new Uint8Array(Buffer.from(json));

      const filename = `metadata_${currentId + BigInt(i)}.json`;
      return new File([uint8Array], filename, { type: "application/json" });
    });
    console.log("POST status: uploading matadatas");
    // Upload metadata
    const metadataUpload = await pinata.upload.fileArray(metadataFiles);
    const metadataCID = metadataUpload.IpfsHash;
    const metadataBaseURI = `${metadataCID}/`; 

    console.log("POST status: succes!");
    return new Response(
      JSON.stringify({
        imageUri: imageBaseURI,
        metadataUri: metadataBaseURI,
        imageCID,
        metadataCID,
        length,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST status: error!");
    console.error("Upload error:", err);
    return new Response("Upload failed: " + err.message, { status: 500 });
  }
}
