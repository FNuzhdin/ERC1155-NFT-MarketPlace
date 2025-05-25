import { readFileSync } from "fs";
import hre from "hardhat";

async function main() {
    console.log("VERIFY in process...");

    const info = JSON.parse(readFileSync("scripts/DeployingData.json", "utf-8"));
    const tokenAddr = info.tokenAddr;

    try {
        await hre.run("verify:verify", {
            address: tokenAddr,
            constructorArguments: [],
        });
        console.log("Contract verified");
        console.log(`Contract address: ${tokenAddr}`);
    } catch (error) {
        console.error(error);
        console.log("Failed, sorry");
    } finally {
        console.log("We are finished with him");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });