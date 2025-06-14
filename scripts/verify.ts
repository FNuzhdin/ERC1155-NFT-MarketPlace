import { readFileSync } from "fs";
import hre, { upgrades } from "hardhat";

async function main() {
    console.log("VERIFY in process...");

    const info = JSON.parse(readFileSync("scripts/DeployingData.json", "utf-8"));
    const tokenAddr = info.tokenAddr;
    const marketAddr = info.marketAddr; 
    const implAddr = await upgrades.erc1967.getImplementationAddress(marketAddr); 

    try {
        await hre.run("verify:verify", {
            address: tokenAddr,
            constructorArguments: [],
        });
        console.log("Contract verified");
        console.log(`Contract address: ${tokenAddr}`);
    } catch (error) {
        console.error(error);
        console.log("Failed with token contract, sorry");
    }

    try {
        await hre.run("verify:verify", {
            address: implAddr,
            constructorArguments: [],
        });
        console.log("Contract verified");
        console.log(`Contract address: ${tokenAddr}`);
    } catch (error) {
        console.error(error);
        console.log("Failed with market contract, sorry");
    } 
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });