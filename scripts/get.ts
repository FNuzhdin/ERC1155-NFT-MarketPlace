import { ethers } from "hardhat";


async function main() {
console.log("getter started...")
  const [signer] = await ethers.getSigners();
  const market = await ethers.getContractAt("Market",
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  );

  const result = await market.getQueueHead();
  console.log("Result:", result)
  console.log("Success"); 
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });