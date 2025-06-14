import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { TokensERC1155 } from "../typechain-types";
import { ContractTransactionResponse } from "ethers";

describe("TokensERC1155 tests", async () => {
  async function deploy() {
    const [deployer, signer, signer2] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("TokensERC1155");
    const token = await factory.deploy();
    await token.waitForDeployment();

    return { deployer, signer, signer2, token };
  }

  it("After deploy", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    expect(await token.owner()).to.eq(deployer.address);
    expect(await token.currentTokenId()).to.eq(0);
    await expect(token.connect(signer).currentTokenId()).to.revertedWith(
      "Not an owner!"
    );
    expect(await token.paused()).to.eq(false);
    expect(await token["totalSupply()"]()).to.eq(0);
  });

  it("Pause", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const { length, valuesArr, tokenURI, ids, ownerAddrsArr } = await mintNFT(
      token,
      deployer.address
    );

    expect(await token.balanceOfBatch(ownerAddrsArr, ids)).to.deep.eq(
      valuesArr
    );

    expect(await token.paused()).to.eq(false);

    await expect(token.connect(signer).pause()).to.revertedWith(
      "Not an owner!"
    );

    const tx2 = await token.pause();
    await tx2.wait();

    await expect(tx2).to.emit(token, "Paused").withArgs(deployer.address);

    expect(await token.paused()).to.eq(true);

    await expect(
      token.mintNFT(deployer.address, tokenURI, length, valuesArr)
    ).to.revertedWithCustomError(token, "EnforcedPause");

    await expect(token.connect(signer).unpause()).to.revertedWith(
      "Not an owner!"
    );
    const tx3 = await token.unpause();
    await tx3.wait();

    await expect(tx3).to.emit(token, "Unpaused").withArgs(deployer.address);

    await mintNFT(token, deployer.address);

    const ids2 = Array.from({ length }, (_, index) => index + length);

    expect(await token.balanceOfBatch(ownerAddrsArr, ids2)).to.deep.eq(
      valuesArr
    );
  });

  it("Mint NFT collection", async () => {
    const { deployer, token } = await loadFixture(deploy);

    const {
      length,
      valuesArr,
      tokenURI,
      ids,
      ownerAddrsArr,
      contractAddrsArr,
      tx,
    } = await mintNFT(token, deployer.address);

    const zeroAddr = ethers.ZeroAddress;
    await expect(tx)
      .to.emit(token, "TransferBatch")
      .withArgs(deployer.address, zeroAddr, deployer.address, ids, valuesArr);

    expect(await token.currentTokenId()).to.eq(8);

    expect(await token.balanceOfBatch(ownerAddrsArr, ids)).to.deep.eq(
      valuesArr
    );

    for (let i = 0; i < length; i++) {
      expect(await token.uri(i)).to.eq(`${tokenURI}metadata_${ids[i]}.json`);
    }
    expect(await token.uri(8)).to.eq("");

    const contractAddr = await token.getAddress();
    await mintNFT(token, contractAddr);

    const ids2 = Array.from({ length }, (_, index) => index + length);
    expect(await token.balanceOfBatch(contractAddrsArr, ids2)).to.deep.eq(
      valuesArr
    );
  });

  it("Mint NFT collection: reverts", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const length = 3;
    const tokenURI = "ipfs://AnYCIDFolder/";
    const values = Array.from({ length }, () => 1);
    await expect(
      token.connect(signer).mintNFT(signer.address, tokenURI, length, values)
    ).to.revertedWith("Not an owner!");

    await expect(
      token.mintNFT(deployer.address, tokenURI, 1, [1])
    ).to.revertedWith("The collection must be 2 to 50 NFT!");

    await expect(
      token.mintNFT(deployer.address, "", length, values)
    ).to.revertedWith("Empty URI!");

    await expect(token.mintNFT(ethers.ZeroAddress, tokenURI, length, values))
      .to.revertedWithCustomError(token, "ERC1155InvalidReceiver")
      .withArgs(ethers.ZeroAddress);

    const incorrectValues = [1, 1];
    await expect(
      token.mintNFT(deployer.address, tokenURI, length, incorrectValues)
    ).to.revertedWith("Incorrect length!");

    const incorrectLength = 51;
    await expect(
      token.mintNFT(deployer.address, tokenURI, incorrectLength, values)
    ).to.revertedWith("The collection must be 2 to 50 NFT!");

    const maxUint256 = ethers.MaxUint256 - BigInt(3);
    await ethers.provider.send("hardhat_setStorageAt", [
      token.target,
      "0x6",
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [maxUint256]),
    ]);

    await expect(
      token.mintNFT(deployer.address, tokenURI, length, values)
    ).to.revertedWith("Max totalSupply reached!");
  });

  it("Mint FT", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const { tokenURI, value, tx } = await mintNewFT(token, deployer.address);

    const zeroAddr = ethers.ZeroAddress;
    await expect(tx)
      .to.emit(token, "TransferSingle")
      .withArgs(deployer.address, zeroAddr, deployer.address, 0, value);

    expect(await token.currentTokenId()).to.eq(1);

    expect(await token.balanceOf(deployer.address, 0)).to.eq(value);

    expect(await token.uri(0)).to.eq(`${tokenURI}`);

    const contractAddr = await token.getAddress();
    const { tx: tx2 } = await mintNewFT(token, contractAddr);

    await expect(tx2)
      .to.emit(token, "TransferSingle")
      .withArgs(deployer.address, zeroAddr, token.target, 1, value);

    expect(await token.balanceOf(token.target, 1)).to.eq(value);
    expect(await token.mintFT(deployer.address, 0, 1000)).to.not.be.reverted;
    expect(await token["totalSupply(uint256)"](0)).to.eq(11000);
  });

  it("Mint FT: reverts", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const tokenURI = "ipfs://AnYCIDFolder/";
    const value = 10000;
    await expect(
      token.connect(signer).mintNewFT(signer.address, tokenURI, value)
    ).to.revertedWith("Not an owner!");

    await expect(token.mintNewFT(deployer.address, "", value)).to.revertedWith(
      "Empty URI!"
    );

    const incorrectValue = 1;
    await expect(
      token.mintNewFT(deployer.address, tokenURI, incorrectValue)
    ).to.revertedWith("Amount must be more then 1!");

    await expect(token.mintNewFT(ethers.ZeroAddress, tokenURI, value))
      .to.revertedWithCustomError(token, "ERC1155InvalidReceiver")
      .withArgs(ethers.ZeroAddress);

    const maxUint256 = ethers.MaxUint256 - BigInt(1);
    await ethers.provider.send("hardhat_setStorageAt", [
      token.target,
      "0x6",
      ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [maxUint256]),
    ]);

    await expect(
      token.mintNewFT(deployer.address, tokenURI, value)
    ).to.revertedWith("Max totalSupply reached!");

    await expect(
      token.connect(signer).mintFT(deployer.address, 0, 1000)
    ).to.revertedWith("Not an owner!");
    await expect(token.mintFT(deployer.address, 0, 1)).to.revertedWith(
      "Amount must be more then 1!"
    );
  });

  it("Receive revert", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const value = ethers.parseEther("1.23");

    const contractAddr = token.target;
    const txData = {
      to: contractAddr,
      value,
    };

    await expect(deployer.sendTransaction(txData)).to.revertedWith(
      "I dont receive ETH!"
    );

    await expect(signer.sendTransaction(txData)).to.revertedWith(
      "I dont receive ETH!"
    );
  });

  it("Withdraw tokens", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const contractAddr = await token.getAddress();
    const { value } = await mintNewFT(token, contractAddr);

    expect(await token.balanceOf(contractAddr, 0)).to.eq(value);

    const tx2 = await token.withdrawSingle(0);
    await tx2.wait();

    expect(await token.balanceOf(contractAddr, 0)).to.eq(0);
    expect(await token.balanceOf(deployer.address, 0)).to.eq(value);

    /* changeTokenBalances не работает для ERC1155 */

    const { length, valuesArr, contractAddrsArr } = await mintNFT(
      token,
      contractAddr
    );

    const ids = Array.from({ length }, (_, index) => index + 1);

    const tx4 = await token.withdrawBatch(ids, contractAddrsArr);
    await tx4.wait();

    const zeroValues = Array.from({ length }, () => 0);
    const ownerAddrsArr = Array.from({ length }, () => deployer.address);

    expect(await token.balanceOfBatch(contractAddrsArr, ids)).to.deep.eq(
      zeroValues
    );
    expect(await token.balanceOfBatch(ownerAddrsArr, ids)).to.deep.eq(
      valuesArr
    );
  });

  it("Approve and safeTransferFrom: NFT", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const { length, ids, valuesArr, ownerAddrsArr, contractAddrsArr } =
      await mintNFT(token, deployer.address);

    const data = ethers.toUtf8Bytes("any data");

    const tx = await token.safeBatchTransferFrom(
      deployer.address,
      signer.address,
      ids,
      valuesArr,
      data
    );
    await expect(tx.wait()).to.not.be.reverted;

    const signerArr = Array.from({ length }, () => signer.address);
    expect(await token.balanceOfBatch(signerArr, ids)).to.deep.eq(valuesArr);

    const tx2 = await token
      .connect(signer)
      .setApprovalForAll(deployer.address, true);
    await tx2.wait();

    const tx3 = await token.safeBatchTransferFrom(
      signer.address,
      deployer.address,
      ids,
      valuesArr,
      data
    );
    await expect(tx3.wait()).to.not.be.reverted;

    expect(await token.balanceOfBatch(ownerAddrsArr, ids)).to.deep.eq(
      valuesArr
    );

    expect(await token.isApprovedForAll(signer.address, deployer.address)).to
      .true;

    const tx5 = await token
      .connect(signer)
      .setApprovalForAll(deployer.address, false);
    await tx5.wait();

    expect(await token.isApprovedForAll(signer.address, deployer.address)).to
      .false;

    const tx6 = await token.setApprovalForAll(signer.address, true);
    await tx6.wait();

    const tx7 = await token
      .connect(signer)
      .safeBatchTransferFrom(
        deployer.address,
        contractAddrsArr[0],
        ids,
        valuesArr,
        data
      );
    await expect(tx7.wait()).to.not.be.reverted;

    expect(await token.balanceOfBatch(contractAddrsArr, ids)).to.deep.eq(
      valuesArr
    );
  });

  it("Approve and safeTransferFrom: FT", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const { value } = await mintNewFT(token, deployer.address);

    const id = 0;
    const data = ethers.toUtf8Bytes("any data");
    const tx = await token.safeTransferFrom(
      deployer.address,
      signer.address,
      id,
      value,
      data
    );
    await expect(tx.wait()).to.not.be.reverted;
    expect(await token.balanceOf(signer.address, id)).to.eq(value);
    expect(await token.balanceOf(deployer.address, id)).to.eq(0);

    const tx2 = await token
      .connect(signer)
      .setApprovalForAll(deployer.address, true);
    await expect(tx2.wait()).to.not.be.reverted;

    expect(await token.isApprovedForAll(signer.address, deployer.address)).to
      .true;

    const tx3 = await token.safeTransferFrom(
      signer.address,
      deployer.address,
      id,
      value,
      data
    );
    await expect(tx3.wait()).to.not.be.reverted;

    expect(await token.balanceOf(signer.address, id)).to.eq(0);
    expect(await token.balanceOf(deployer.address, id)).to.eq(value);

    const contractAddr = await token.getAddress();
    const tx4 = await token.safeTransferFrom(
      deployer.address,
      contractAddr,
      id,
      value,
      data
    );
    await expect(tx4.wait()).to.not.be.reverted;

    expect(await token.balanceOf(contractAddr, id)).to.eq(value);
    expect(await token.balanceOf(deployer.address, id)).to.eq(0);
  });

  /* решил не делать approve reverts */

  it("Burn!", async () => {
    const { deployer, signer, token } = await loadFixture(deploy);

    const { value } = await mintNewFT(token, deployer.address);

    const id = 0;
    const tx1 = await token.burn(deployer.address, id, value / 2);
    await expect(tx1.wait()).to.not.be.reverted;
    expect(await token.balanceOf(deployer.address, id)).to.eq(value / 2);

    await token.setApprovalForAll(signer.address, true);

    const tx2 = await token
      .connect(signer)
      .burn(deployer.address, id, value / 2);
    await expect(tx2.wait()).to.not.be.reverted;
    expect(await token.balanceOf(deployer.address, id)).to.eq(0);

    const { length, valuesArr, ownerAddrsArr } = await mintNFT(
      token,
      deployer.address
    );
    const ids = Array.from({ length }, (_, index) => index + 1);
    const tx3 = await token.burnBatch(deployer.address, ids, valuesArr);
    await expect(tx3.wait()).to.not.be.reverted;
    const zeroValues = Array.from({ length }, () => 0);
    expect(await token.balanceOfBatch(ownerAddrsArr, ids)).to.deep.eq(
      zeroValues
    );
  });
});

type Returnable = {
  length: number;
  tokenURI: string;
  valuesArr: number[];
  ids: number[];
  ownerAddrsArr: string[];
  contractAddrsArr: Promise<string[]> | any;
  tx: ContractTransactionResponse;
};

async function mintNFT(
  token: TokensERC1155,
  ownerAddress: string
): Promise<Returnable> {
  const length = 8;
  const valuesArr = Array.from({ length }, () => 1);
  const tokenURI = "ipfs://AnYCIDFolder/";

  const tx = await token.mintNFT(ownerAddress, tokenURI, length, valuesArr);
  await tx.wait();

  const ids = Array.from({ length }, (_, index) => index);
  const ownerAddrsArr = Array.from({ length }, () => ownerAddress);
  const contractAddrsArr = Array.from(
    { length },
    async () => await token.getAddress()
  );

  return {
    length,
    tokenURI,
    valuesArr,
    ids,
    ownerAddrsArr,
    contractAddrsArr,
    tx,
  };
}

async function mintNewFT(
  token: TokensERC1155,
  ownerAddress: string
): Promise<{
  tokenURI: string;
  value: number;
  tx: ContractTransactionResponse;
}> {
  const tokenURI = "ipfs://AnYCIDFolder/";
  const value = 10000;

  const tx = await token.mintNewFT(ownerAddress, tokenURI, value);
  await tx.wait();

  return { tokenURI, value, tx };
}
