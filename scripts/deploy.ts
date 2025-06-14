import { ethers, upgrades } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  console.log("DEPLOYING Token...");

  const [deployer] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("TokensERC1155");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const tokenAddr = await token.getAddress();

  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Token address: ${tokenAddr}`);

  /**
   * @dev We use proxy for Market contract
   */
  const Market = await ethers.getContractFactory("Market");
  const market = await upgrades.deployProxy(Market, [tokenAddr], {
    initializer: "initialize",
  });
  await market.waitForDeployment();

  const marketAddr = await market.getAddress();
  const implAddr = await upgrades.erc1967.getImplementationAddress(marketAddr);

  console.log(`Deployer address: ${deployer.address}`);
  console.log(`Market proxy address: ${marketAddr}`);
  console.log(`Market implementation address: ${implAddr}`);

  /**
   * @dev We saved contracts addresses in JSON file for 
   * frontend side and for verify script
   */
  writeFileSync(
    "./front/public/DeployingData.json",
    JSON.stringify(
      {
        tokenAddr,
        marketAddr,
        implAddr,
      },
      null,
      2
    )
  );

  writeFileSync(
    "./scripts/DeployingData.json",
    JSON.stringify(
      {
        tokenAddr,
        marketAddr,
        implAddr,
      },
      null,
      2
    )
  );

  console.log("SUCCESS");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
