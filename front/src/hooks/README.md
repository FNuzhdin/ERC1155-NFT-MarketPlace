# hooks

This folder contains all custom React hooks and helper functions for interacting with the project's smart contracts and working with Web3 functionality.  
Hooks provide convenient access to smart contracts, reading and writing data, as well as managing the state of asynchronous operations.

---

## Contents

- [Purpose](#purpose)
- [File Overview](#file-overview)
- [Common Usage Scenarios](#common-usage-scenarios)
- [Notes](#notes)

---

## Purpose

The `hooks` folder is intended for:
- Encapsulating logic for interacting with the TokenERC1155 and Market contracts.
- Simplifying code reuse for working with wagmi, web3, and asynchronous requests.
- Centralizing management of loading, error, and transaction success states.

---

## File Overview

### MarketContract.ts

- Hooks and functions for interacting with the Market contract.
    - `useMarketRead`: React hook for reading data from the Market contract.
    - `useMarketWrite`: React hook for writing data to the Market contract.
    - `readMarket`: Async function for reading from the contract (outside of React).
    - `writeMarket`: Async function for writing to the contract (outside of React, supports sending ETH).
- Uses ABI from `artifacts/Market.json` and address from `utils/ProvenAddresses`.

### TokenContract.ts

- Hooks and functions for interacting with the TokenERC1155 contract.
    - `useTokenRead`: React hook for reading data from the TokenERC1155 contract.
    - `readToken`: Async function for reading from the contract (outside of React).
    - `writeToken`: Async function for writing to the contract (outside of React).
- Uses ABI from `artifacts/TokensERC1155.json` and address from `utils/ProvenAddresses`.

---

## Common Usage Scenarios

- **Reading data from a contract in a component:**
  ```typescript
  const { data, isLoading, error } = useTokenRead("balanceOf", [address, tokenId]);
  ```

- **Writing to a contract via a hook:**
  ```typescript
  const { write, isPending } = useMarketWrite();
  write("setPrice", [tokenId, price]);
  ```

- **Async reading from a contract outside a component:**
  ```typescript
  const owner = await readMarket("owner", []);
  ```

- **Async writing outside a component:**
  ```typescript
  await writeToken("mint", [to, tokenId, amount]);
  ```

---

## Notes

- All hooks use the wagmi library and are unified in their signatures.

---