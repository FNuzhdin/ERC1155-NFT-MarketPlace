import { ethers } from "hardhat";
import { MARKET_ADDR } from "../front/src/utils/ProvenAddresses";

async function main() {
console.log("get...")
  const [signer, signer2] = await ethers.getSigners();
  const market = await ethers.getContractAt("Market",
    MARKET_ADDR,
  );

  const arr = await market.connect(signer2).getPlaceInQueue(0);

  
  console.log("result:", arr);
  
  console.log("success"); 
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
