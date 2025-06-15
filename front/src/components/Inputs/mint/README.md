# Mint Components

This folder contains React components for minting new tokens (NFTs and FTs) in the application.  
All components are intended for use only by the contract owner/admin and are used inside the main minting section of the project.

## Structure

- **MainMint**  
  The main minting component. Responsible for managing minting state and rendering all child minting components.  
  Used only by the contract owner (admin).

- **MintNFTInput**  
  A form for batch minting new NFTs (Non-Fungible Tokens).  
  Allows you to upload from 2 to 50 images, add a name and description to each, upload data to IPFS, and mint an NFT collection.

- **MintNewFTInput**  
  A form for creating a new FT (Fungible Token) with metadata and an image.  
  Allows you to upload an image, specify the name, description, token symbol, and the amount to mint. The data is uploaded to IPFS and the token is minted via the contract.

- **MintFTInput**  
  A form for increasing the supply (emission) of an already existing FT.  
  Requires you to specify the token id and the amount to mint.

## Usage

Typically, components are used via `MainMint`, which manages minting state and passes the required props to child components.  
All forms implement user rights checks (only the contract owner can mint), enforce limits, validate data, and display error messages.

## Example

```tsx
import MainMint from "./mint/MainMint";

<MainMint address={address} />
```

## Types

- **MintInputProps**  
  Shared props for minting components:
  - `address`: current wallet address (`0x...` or undefined)
  - `mintStarted`: whether minting is in progress
  - `setMintStarted`: function to control minting state
  - `currentId`: current token id
  - `setCurrentId`: function to update current id
  - `refetchCurrentId`: function to re-fetch current id from the contract

## Important

- Only the contract owner (owner) can mint tokens using these components.
- All operations are accompanied by data validation and error messages.
- Uploaded images and metadata are first sent to IPFS, then minting is performed via the smart contract.