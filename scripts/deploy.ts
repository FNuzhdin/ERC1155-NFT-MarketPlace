import { ethers } from "hardhat";
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

    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy();
    await market.waitForDeployment();

    const marketAddr = await market.getAddress();

    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Market address: ${marketAddr}`);

    writeFileSync("./front/public/DeployingData.json", JSON.stringify({
        tokenAddr, marketAddr
    }, null, 2));

    console.log("SUCCESS");
}

main()
.then(() => process.exit(0))
.catch((e) => {
    console.error(e);
    process.exit(1);
})