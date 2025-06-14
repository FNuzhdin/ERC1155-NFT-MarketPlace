import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { Market, TokensERC1155 } from "../typechain-types";
import { ContractTransactionResponse } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Market tests", async () => {
  async function deploy() {
    const [deployer, signer, signer2] = await ethers.getSigners();

    const tFactory = await ethers.getContractFactory("TokensERC1155");
    const token = await tFactory.deploy();
    await token.waitForDeployment();

    const tokenAddr = await token.getAddress();

    const mFactory = await ethers.getContractFactory("Market");
    const market = await upgrades.deployProxy(mFactory, [tokenAddr], {
      initializer: "initialize",
    });
    await market.waitForDeployment();

    return { deployer, signer, signer2, token, market };
  }

  it("After deploy", async () => {
    const { deployer, token, market } = await loadFixture(deploy);

    const tokenAddr = await token.getAddress();

    expect(await market.getImplementetionVersion()).to.eq(1);
    expect(await market.owner()).to.eq(deployer.address);
    expect(await market.token()).to.eq(tokenAddr);
  });

  it("Receive NFT and stopExhibitNFT", async () => {
    const { deployer, token, market } = await loadFixture(deploy);

    const { ids, valuesArr, length, ownerAddrsArr } = await mintNFT(
      token,
      deployer.address
    );
    const marketAddr = await market.getAddress();
    const data = ethers.toUtf8Bytes("");

    expect(
      await token.safeBatchTransferFrom(
        deployer.address,
        marketAddr,
        ids,
        valuesArr,
        data
      )
    ).to.not.be.reverted;

    const marketAddrArr = Array.from({ length }, () => marketAddr);
    expect(await token.balanceOfBatch(marketAddrArr, ids));

    const idsNFTExhibited = [];
    for (let i = 0; i < length; i++) {
      idsNFTExhibited.push(await market.idsNFTExhibited(i));
    }

    expect(idsNFTExhibited).to.deep.eq(ids);

    const exhibitedNFTOwner = [];
    for (let i = 0; i < length; i++) {
      exhibitedNFTOwner.push(await market.exhibitedNFTOwners(i));
    }

    expect(exhibitedNFTOwner).to.deep.eq(ownerAddrsArr);

    const id = ids.pop();
    expect(await market.stopExhibitNFT(id!)).to.not.be.reverted;
    expect(await token.balanceOf(deployer.address, 7)).to.eq(1);
    expect(await token.balanceOf(marketAddr, 7)).to.eq(0);

    valuesArr.pop();
    marketAddrArr.pop();
    ownerAddrsArr.pop();
    const zeroArr = Array.from({ length: 7 }, () => 0);
    expect(await market.stopExhibitNFTBatch(ids)).to.not.be.reverted;
    expect(await token.balanceOfBatch(ownerAddrsArr, ids)).to.deep.eq(
      valuesArr
    );
    expect(await token.balanceOfBatch(marketAddrArr, ids)).to.deep.eq(zeroArr);

    await mintNFT(token, deployer.address);
    const singleId = 8;
    expect(
      await token.safeTransferFrom(
        deployer.address,
        marketAddr,
        singleId,
        1,
        data
      )
    ).to.not.be.reverted;
    expect(await token.balanceOf(marketAddr, singleId)).to.eq(1);
    expect(await token.balanceOf(deployer.address, singleId)).to.eq(0);
    expect(await market.idsNFTExhibited(0)).to.eq(singleId);
    expect(await market.exhibitedNFTOwners(singleId)).to.eq(deployer.address);
  });

  it("Stop exhibit NFT: reverts", async () => {
    const { deployer, signer, token, market } = await loadFixture(deploy);

    const marketAddr = await market.getAddress();
    const { ids, valuesArr } = await mintNFT(token, deployer.address);
    const data = ethers.toUtf8Bytes("");
    await token.safeBatchTransferFrom(
      deployer.address,
      marketAddr,
      ids,
      valuesArr,
      data
    );

    const id = ids.pop();
    await expect(
      market.connect(signer).stopExhibitNFTBatch(ids)
    ).to.revertedWith("Your aren't an this token owner!");
    await expect(market.connect(signer).stopExhibitNFT(id!)).to.revertedWith(
      "Your aren't an this token owner!"
    );

    await mintNewFT(token, deployer.address);
    const idFT = 8;
    await expect(market.stopExhibitNFT(idFT)).to.revertedWith("Only NFT!");
  });

  it("Buy NFT", async () => {
    const { deployer, signer, token, market } = await loadFixture(deploy);

    const { ids, valuesArr, length } = await mintNFT(token, deployer.address);
    const marketAddr = await market.getAddress();
    const data = ethers.toUtf8Bytes("");
    await token.safeBatchTransferFrom(
      deployer.address,
      marketAddr,
      ids,
      valuesArr,
      data
    );
    const pricesArr = Array.from({ length }, () => 100);
    await market.setPriceNFTBatch(ids, pricesArr);

    const tx = await market
      .connect(signer).buyNFT(ids[0], { value: pricesArr[0] });
    expect(tx).to.not.be.reverted;

    await expect(tx).to.changeEtherBalances(
      [signer.address, marketAddr],
      [-pricesArr[0], pricesArr[0]]
    );
    expect(await token.balanceOf(signer.address, ids[0])).to.eq(1);

    expect(await market.toWithdraw()).to.eq(pricesArr[0]);
    const zeroAddr = ethers.ZeroAddress;
    expect(await market.exhibitedNFTOwners(ids[0])).to.eq(zeroAddr);
    expect(await market.idsNFTExhibited(ids[0])).to.eq(ids[length - 1]);

    await expect(
      market.connect(signer).buyNFT(ids[0], { value: pricesArr[0] })
    ).to.be.revertedWith("Token doesn't sell!");

    const signerAddrArr = Array.from({ length }, () => signer.address);
    let expectedBalanceNFT = Array.from({ length }, (_, index) => {
      if (index === 0) {
        return 1;
      }
      return 0;
    });
    expect(await token.balanceOfBatch(signerAddrArr, ids)).to.deep.eq(
      expectedBalanceNFT
    );

    await market
      .connect(signer).buyNFT(ids[1], { value: pricesArr[1] });
    expect(await market.toWithdraw()).to.eq(pricesArr[0] + pricesArr[1]);
    expectedBalanceNFT = Array.from({ length }, (_, index) => {
      if (index === 0 || index === 1) {
        return 1;
      }
      return 0;
    });
    expect(await token.balanceOfBatch(signerAddrArr, ids)).to.deep.eq(
      expectedBalanceNFT
    );

    await expect(market.connect(signer).withdrawETH()).to.revertedWith(
      "You haven't value for withdraw!"
    );

    const tx2 = await market.withdrawETH();
    await expect(tx2).to.changeEtherBalances(
      [marketAddr, deployer.address],
      [-(pricesArr[0] + pricesArr[1]), pricesArr[0] + pricesArr[1]]
    );
  });

  it("Buy NFT: reverts", async () => {
    const { deployer, token, market } = await loadFixture(deploy);

    const marketAddr = market.getAddress();
    const data = ethers.toUtf8Bytes("");

    const { length, ids, valuesArr } = await mintNFT(token, deployer.address);

    for (let i = 0; i < length; i++) {
      await expect(market.buyNFT(i)).to.be.revertedWith(
        "Token doesn't sell!"
      );
    }

    await token.safeBatchTransferFrom(
      deployer.address,
      marketAddr,
      ids,
      valuesArr,
      data
    );

    for (let i = 0; i < length; i++) {
      await expect(market.buyNFT(i)).to.be.revertedWith(
        "Cost isn't yet set!"
      );
    }
    const priceArr = Array.from({ length }, () => 100);
    await market.setPriceNFTBatch(ids, priceArr);

    for (let i = 0; i < length; i++) {
      await expect(market.buyNFT(i)).to.revertedWith(
        "Value isn't correct!"
      );
    }

    await mintNewFT(token, deployer.address);
    const idFT = 8;
    await expect(market.buyNFT(idFT)).to.revertedWith("Only NFT!");
  });

  it("Price NFT", async () => {
    const { deployer, signer, token, market } = await loadFixture(deploy);

    const { ids, length, valuesArr } = await mintNFT(token, deployer.address);

    const marketAddr = market.getAddress();
    const data = ethers.toUtf8Bytes("");

    const priceArr = Array.from({ length }, () => 100);
    await expect(market.setPriceNFTBatch(ids, priceArr)).to.be.revertedWith(
      "You aren't token owner or NFT isn't exhibited!"
    );
    for (let i = 0; i < length; i++) {
      await expect(market.getPriceNFT(i)).to.revertedWith("Haven't price!");
    }

    await token.safeBatchTransferFrom(
      deployer.address,
      marketAddr,
      ids,
      valuesArr,
      data
    );

    await expect(
      market.connect(signer).setPriceNFTBatch(ids, priceArr)
    ).to.be.revertedWith("You aren't token owner or NFT isn't exhibited!");

    const zeroArr = Array.from({ length }, () => 0);
    await expect(market.setPriceNFTBatch(ids, zeroArr)).to.revertedWith(
      "Incorrect price!"
    );
    priceArr.pop();
    await expect(market.setPriceNFTBatch(ids, priceArr)).to.revertedWith(
      "Incorrect arrays length!"
    );

    await mintNewFT(token, deployer.address);
    const singleFTId = [8];
    const siglePrice = [200];
    await expect(
      market.setPriceNFTBatch(singleFTId, siglePrice)
    ).to.revertedWith("Only NFT!");

    await market.stopExhibitNFTBatch(ids);

    const id = ids.pop();
    const singleValue = valuesArr.pop();
    await token.safeBatchTransferFrom(
      deployer.address,
      signer.address,
      [id!],
      [singleValue!],
      data
    );
    expect(await token.balanceOf(signer.address, id!)).to.eq(1);
    await token
      .connect(signer)
      .safeTransferFrom(signer.address, marketAddr, id!, singleValue!, data);
    expect(await market.connect(signer).setPriceNFTBatch([id!], siglePrice)).to
      .not.be.reverted;
    expect(await market.getPriceNFT(id!)).to.eq(siglePrice[0]);

    await token.safeBatchTransferFrom(
      deployer.address,
      marketAddr,
      ids,
      valuesArr,
      data
    );
    expect(await market.setPriceNFTBatch(ids, priceArr)).to.not.be.reverted;
    for (let i = 0; i < length - 1; i++) {
      expect(await market.getPriceNFT(ids[i])).to.eq(100);
    }
  });

  it("Recive FT", async () => {
    const { deployer, token, market } = await loadFixture(deploy);

    const marketAddr = await market.getAddress();
    const { value } = await mintNewFT(token, deployer.address);
    const idFirstFT = 0;
    const data = ethers.toUtf8Bytes("");
    expect(
      await token.safeTransferFrom(
        deployer.address,
        marketAddr,
        idFirstFT,
        value,
        data
      )
    ).to.not.be.reverted;

    expect(await market.idsFTExhibited(0)).to.eq(idFirstFT);
    expect(await token.balanceOf(marketAddr, idFirstFT)).to.eq(value);

    let expectedQueueTail = 1;
    let placeInQueue = 0;
    await someQueueChecks(
      market,
      expectedQueueTail,
      idFirstFT,
      deployer,
      value,
      placeInQueue
    );

    await mintNewFT(token, deployer.address);
    const idSecondFT = 1;
    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idSecondFT,
      value,
      data
    );
    expect(await market.idsFTExhibited(1)).to.eq(idSecondFT);

    await token.mintFT(deployer.address, idFirstFT, value);
    await token.mintFT(deployer.address, idSecondFT, value);
    const idFTArr = [idFirstFT, idSecondFT];
    const valuesArr = [value, value];
    expect(
      await token.safeBatchTransferFrom(
        deployer.address,
        marketAddr,
        idFTArr,
        valuesArr,
        data
      )
    ).to.not.be.reverted;
  });

  it("Join queue", async () => {
    const { deployer, signer, signer2, token, market } = await loadFixture(
      deploy
    );

    const marketAddr = await market.getAddress();
    const { value } = await mintNewFT(token, deployer.address);
    const idFirstFT = 0;
    const data = ethers.toUtf8Bytes("");
    await expect(
      token.safeTransferFrom(deployer.address, marketAddr, idFirstFT, 1, data)
    ).to.revertedWith("Incorrect value");

    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idFirstFT,
      value / 2,
      data
    );
    await token.safeTransferFrom(
      deployer.address,
      signer.address,
      idFirstFT,
      value / 2,
      data
    );
    await token
      .connect(signer)
      .safeTransferFrom(signer.address, marketAddr, idFirstFT, value / 2, data);
    let expectedQueueTail = 2;
    let placeInQueue = 1;
    await someQueueChecks(
      market,
      expectedQueueTail,
      idFirstFT,
      signer,
      value / 2,
      placeInQueue
    );

    await token.mintFT(deployer.address, idFirstFT, value);
    await token.safeTransferFrom(
      deployer.address,
      signer.address,
      idFirstFT,
      value / 2,
      data
    );
    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idFirstFT,
      value / 2,
      data
    );
    expectedQueueTail++;
    placeInQueue++;
    await someQueueChecks(
      market,
      expectedQueueTail,
      idFirstFT,
      deployer,
      value / 2,
      placeInQueue
    );

    await token
      .connect(signer)
      .safeTransferFrom(signer.address, marketAddr, idFirstFT, value / 2, data);
    expectedQueueTail++;
    placeInQueue++;
    await someQueueChecks(
      market,
      expectedQueueTail,
      idFirstFT,
      signer,
      value / 2,
      placeInQueue
    );

    expect(await market.idsFTExhibited(0)).to.eq(idFirstFT);
    await expect(market.idsFTExhibited(1)).to.reverted;

    await mintNewFT(token, deployer.address);
    const idSecondFT = 1;
    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idSecondFT,
      value / 2,
      data
    );
    expectedQueueTail = 1;
    placeInQueue = 0;
    await someQueueChecks(
      market,
      expectedQueueTail,
      idSecondFT,
      deployer,
      value / 2,
      placeInQueue
    );

    await token.safeTransferFrom(
      deployer.address,
      signer.address,
      idSecondFT,
      value / 2,
      data
    );
    await token
      .connect(signer)
      .safeTransferFrom(
        signer.address,
        marketAddr,
        idSecondFT,
        value / 2,
        data
      );
    expectedQueueTail++;
    placeInQueue++;
    await someQueueChecks(
      market,
      expectedQueueTail,
      idSecondFT,
      signer,
      value / 2,
      placeInQueue
    );

    await mintNewFT(token, deployer.address);
    /* creation mapping slot */
    const idThirdFT = 2n;
    const mappingSlot = 8n;
    const keyHex = ethers.zeroPadValue(ethers.toBeHex(idThirdFT), 32);
    const slotHex = ethers.zeroPadValue(ethers.toBeHex(mappingSlot), 32);
    const mappingPosition = ethers.keccak256(ethers.concat([keyHex, slotHex]));
    const newSlotValue = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [ethers.MaxUint256])
    await ethers.provider.send("hardhat_setStorageAt", [
      marketAddr,
      mappingPosition,
      newSlotValue,
    ]);
    
    await expect(
      token.safeTransferFrom(
        deployer.address,
        marketAddr,
        idThirdFT,
        value,
        data
      )
    ).to.revertedWith("Queue is overflow!");
  });

  it("Stop exhibit FT", async () => {
    const { deployer, signer, token, market } = await loadFixture(deploy);

    const marketAddr = await market.getAddress();
    const { value } = await mintNewFT(token, deployer.address);
    const idFirstFT = 0;
    const data = ethers.toUtf8Bytes("");
    await mintNFT(token, deployer.address);

    await expect(market.stopExhibitFT(1)).to.revertedWith("Only FT!");
    await expect(market.stopExhibitFT(0)).to.revertedWith("You didn't join in queque!");
    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idFirstFT,
      value,
      data
    );
    await expect(
      market.connect(signer).stopExhibitFT(idFirstFT)
    ).to.revertedWith("You didn't join in queque!");

    expect(await market.stopExhibitFT(idFirstFT)).to.not.be.reverted;
    expect(await token.balanceOf(marketAddr, idFirstFT)).to.eq(0);
    expect(await token.balanceOf(deployer.address, idFirstFT)).to.eq(value);

    let placeInQueue = 0;
    expect(await market.getValueInQueue(idFirstFT, placeInQueue)).to.eq(0);
    expect(await market.getSellerInQueue(idFirstFT, placeInQueue)).to.eq(
      ethers.ZeroAddress
    );
    expect(await market.getPlaceInQueue(idFirstFT)).to.deep.eq([placeInQueue]);
  });

  it("Stop exhibit FT: queque checks", async () => {
    const { deployer, market, token } = await loadFixture(deploy);

    const marketAddr = await market.getAddress();
    const data = ethers.toUtf8Bytes("");
    const idFirstFT = 0;
    await mintNewFT(token, deployer.address);

    await token.safeTransferFrom(deployer.address, marketAddr, idFirstFT, 1000, data);
    await token.safeTransferFrom(deployer.address, marketAddr, idFirstFT, 1000, data);
    await token.safeTransferFrom(deployer.address, marketAddr, idFirstFT, 1000, data);

    const placesArr = [0, 1, 2];
    expect(await market.getPlaceInQueue(idFirstFT)).to.deep.eq(placesArr);
    expect(await market.stopExhibitFT(idFirstFT)).to.not.reverted;
    expect(await token.balanceOf(marketAddr, idFirstFT)).to.eq(0);
  });

  it("Buy FT", async () => {
    /* тут проверим также "удаление" из очереди */
    const { deployer, signer, token, market } = await loadFixture(deploy);

    const marketAddr = await market.getAddress();
    const { value } = await mintNewFT(token, deployer.address);
    const idFirstFT = 0;
    const data = ethers.toUtf8Bytes("");
    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idFirstFT,
      value,
      data
    );
    const price = 100;
    await market.setPriceFT(idFirstFT, price);

    expect(
      await market
        .connect(signer).buyFT(idFirstFT, value, { value: value * price })
    );
    expect(await token.balanceOf(marketAddr, idFirstFT)).to.eq(0);
    expect(await token.balanceOf(signer.address, idFirstFT)).to.eq(value);
  });

  it("Buy FT and queue dinamic", async () => {
    const { deployer, signer, market, token } = await loadFixture(
      deploy
    );

    const marketAddr = await market.getAddress();
    const idFirstFT = 0;
    const price = 100;
    const tokenURI = "uri";
    const mintValue = 120000;
    const data = ethers.toUtf8Bytes("");
    const value = 40000;

    await token.mintNewFT(deployer.address, tokenURI, mintValue);
    await token.safeTransferFrom(
      deployer.address,
      signer.address,
      idFirstFT,
      value,
      data
    );
    await market.setPriceFT(idFirstFT, price);

    /* join queue */
    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idFirstFT,
      value,
      data
    );
    await token
      .connect(signer)
      .safeTransferFrom(signer.address, marketAddr, idFirstFT, value, data);
    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idFirstFT,
      value,
      data
    );

    const buyValue = value * 2 + 15000;
    expect(
      await market.buyFT(idFirstFT, buyValue, {
        value: buyValue * price,
      })
    ).to.not.be.reverted;

    expect(await market.toWithdraw()).to.eq(value * price + 15000 * price);
    expect(await market.connect(signer).toWithdraw()).to.eq(value * price);

    /* value in queue */
    expect(await market.getValueInQueue(idFirstFT, 0)).to.eq(0);
    expect(await market.getValueInQueue(idFirstFT, 1)).to.eq(0);
    expect(await market.getValueInQueue(idFirstFT, 2)).to.eq(value - 15000);

    /* seller in queue */
    expect(await market.getSellerInQueue(idFirstFT, 0)).to.eq(
      ethers.ZeroAddress
    );
    expect(await market.getSellerInQueue(idFirstFT, 1)).to.eq(
      ethers.ZeroAddress
    );
    expect(await market.getSellerInQueue(idFirstFT, 2)).to.eq(deployer.address);

    /* head and tail */
    expect(await market.getQueueHead(idFirstFT)).to.eq(2);
    expect(await market.getQueueTail(idFirstFT)).to.eq(3);
  });

  it("Buy FT: reverts", async () => {
    const { deployer, signer, token, market } = await loadFixture(deploy);

    const idFirstFT = 0;
    const marketAddr = await market.getAddress();
    const data = ethers.toUtf8Bytes("");
    const price = 100;
    const { value } = await mintNewFT(token, deployer.address);

    await expect(
      market.buyFT(idFirstFT, value)
    ).to.revertedWith("Have not funds!");

    await token.safeTransferFrom(
      deployer.address,
      marketAddr,
      idFirstFT,
      value,
      data
    );

    await expect(
      market.buyFT(idFirstFT, value)
    ).to.revertedWith("Cost isn't yet set!");

    await market.setPriceFT(idFirstFT, price);

    await expect(
      market.buyFT(idFirstFT, value)
    ).to.revertedWith("Incorrect msg.value!");

    await mintNFT(token, deployer.address);
    const idNFT = 1;
    await expect(market.buyFT(idNFT, value)).to.revertedWith(
      "Only FT!"
    );
  });

  it("Price FT", async () => {
    const { deployer, signer, token, market } = await loadFixture(deploy);

    const idFirstFT = 0;
    const price = 100;
    await expect(
      market.connect(signer).setPriceFT(idFirstFT, price)
    ).to.revertedWithCustomError(market, "OwnableUnauthorizedAccount");

    await mintNewFT(token, deployer.address);
    await expect(market.setPriceFT(idFirstFT, 0)).to.revertedWith(
      "Incorrect price!"
    );
    await expect(market.getPriceFT(idFirstFT)).to.revertedWith(
      "Haven't price!"
    );
    expect(await market.setPriceFT(idFirstFT, price)).to.not.be.reverted;

    expect(await market.getPriceFT(idFirstFT)).to.eq(price);

    await mintNewFT(token, deployer.address);
    const idSecondFT = 1;
    const newPrice = 200;
    expect(await market.setPriceFT(idSecondFT, newPrice)).to.not.be.reverted;
    expect(await market.getPriceFT(idSecondFT)).to.eq(newPrice);

    await mintNFT(token, deployer.address);
    const idSingleNFT = 2;
    await expect(market.setPriceFT(idSingleNFT, price)).to.revertedWith(
      "Only FT!"
    );
  });

  it("ETH don't receive", async () => {
    const { deployer, market } = await loadFixture(deploy);

    const marketAddr = await market.getAddress();

    const txData = {
      to: marketAddr,
      value: 100,
    };

    await expect(deployer.sendTransaction(txData)).to.revertedWith(
      "I dont receive!"
    );

    const txFallBackData = {
      to: marketAddr,
      value: 100,
      data: "0x12345678",
    };

    await expect(deployer.sendTransaction(txFallBackData)).to.revertedWith(
      "This function doesn't exists!"
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

async function someQueueChecks(
  market: Market,
  expectedQueueTail: number,
  id: number,
  owner: HardhatEthersSigner,
  value: number,
  placeInQueue: number
) {
  expect(await market.getQueueTail(id)).to.eq(expectedQueueTail);
  expect(await market.getValueInQueue(id, placeInQueue)).to.eq(value);
  expect(await market.getSellerInQueue(id, placeInQueue)).to.eq(owner.address);
}
