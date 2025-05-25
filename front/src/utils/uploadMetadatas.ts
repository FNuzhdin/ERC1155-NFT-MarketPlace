import { NFTStorage, File } from "nft.storage";

type Returnable = {
  length: number;
  uri: string;
};

if (!process.env.NFT_STORAGE_API_KEY) {
  throw new Error("Missing NFT.Storage API key!");
}

const client = new NFTStorage({
  token: process.env.NFT_STORAGE_API_KEY,
});

async function uploadImages(imageFiles: File[]): Promise<Returnable> {
  try {
    const preparedFiles = imageFiles.map(
      (file, index) =>
        new File([file], `image_${index}.png`, {
          type: "image/png",
        })
    );

    const length = preparedFiles.length;
    const cid = await client.storeDirectory(preparedFiles);
    const uri = `ipfs://${cid}/`;

    return { length, uri };
  } catch (error) {
    console.error("Error uploading images to IPFS:", error);
    throw new Error(
      `Failed to upload images: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function uploadMetadatas(
  names: string[] | undefined,
  descriptions: string[] | undefined,
  imageFiles: File[]
): Promise<Returnable> {
  try {
    if (imageFiles.length === 0) {
      throw new Error("No image files provided");
    }

    if (
      !(
        imageFiles.length === descriptions?.length &&
        imageFiles.length === names?.length
      )
    ) {
      throw new Error(
        "Arrays must have equal length: images, names and descriptions"
      );
    }

    if (!imageFiles.every(isPNG)) {
      throw new Error("Only PNG files!");
    }

    let imagesResult: Returnable;
    try {
      imagesResult = await uploadImages(imageFiles);
    } catch (error) {
      console.error("Image upload failed:", error);
      throw new Error(
        `Image upload failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    const { length, uri: ImagesURI } = imagesResult;

    const metadatas = Array.from({ length }, (_, index) => {
      return {
        name: names?.[index],
        description: descriptions?.[index],
        imageURI: `${ImagesURI}image_${index}.png`,
      };
    });

    const metadataFiles = metadatas.map((metadata, index) => {
      return new File([JSON.stringify(metadata)], `metadata_${index}.json`, {
        type: "application/json",
      });
    });

    try {
      const cid = await client.storeDirectory(metadataFiles);
      const uri = `ipfs://${cid}/`;

      return { length, uri };
    } catch (error) {
      console.error("Metadata upload failed:", error);
      throw new Error(
        `Metadata upload filed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } catch (error) {
    console.error("Upload process failed:", error);
    throw error;
  }
}

function isPNG(file: File): boolean {
  return file.type === "image/png";
}
