import { ethers } from "hardhat";

async function main() {
  console.log("mintNFTs...");
  const [signer] = await ethers.getSigners();
  const token = await ethers.getContractAt(
    "TokensERC1155",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );

  const uri = "ipfs://NFTSomECID/";
  const length = 8;
  const values = Array.from({ length }, () => 1);

  await token.mintNFT(
    signer.address,
    uri,
    length,
    values
  );
  console.log("success");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
