# View Components

This folder contains React components for viewing and interacting with blockchain data related to tokens and the market.  
Components in this folder allow users (including contract owners and regular users) to query token and market state, check balances, inspect queues, and view on-chain metadata.

## Structure & Components

### Token-Related Components

- **BalanceInput**  
  Allows a user to check the balance of a specific token id for any address.  
  Validates input and displays the result or errors.

- **ExistsInput**  
  Checks if a token with a specific id exists in the contract.  
  Takes a numeric id and displays `true` or `false`.

- **SupplyInput**  
  Retrieves and displays the total supply for a given token id.  
  Usable by both regular users and the contract owner.

- **URIInput**  
  Fetches and displays the metadata URI for a token by its id.  
  Usable by both regular users and the contract owner.

### Market-Related Components

- **GetterComponent**  
  Admin dashboard for market contract state:
  - Shows the current implementation version of the market contract.
  - Allows admin to fetch queue head and tail positions by id.
  - Renders additional queue inspection tools (`SellerInQueue`, `ValueInQueue`).
  - Used only by the contract owner/admin.

- **PlaceInQueue**  
  Shows all queue positions for the connected user for a given FT id.  
  Useful for sellers to track their places in the queue.

- **SellerInQueue**  
  Admin tool to retrieve the seller’s address at a specific queue index for a given FT id.

- **ValueInQueue**  
  Admin tool to retrieve the value (amount) at a specific queue index for a given FT id.

## Common Features

- **Validation:**  
  All components validate numeric and address inputs, displaying clear error messages with `SimpleError`.

- **Loading States:**  
  Buttons and inputs are disabled during asynchronous operations to prevent duplicate requests.

- **Reusable Controls:**  
  All forms use `SimpleInput` for text input and `SimpleButton` for actions.

## Usage

Import any component from this folder and use it inside your app’s pages or admin dashboard.  
Some components (like `GetterComponent`, `SellerInQueue`, `ValueInQueue`) are intended for admin use only.

Example usage:

```tsx
import BalanceInput from "./view/BalanceInput";
import PlaceInQueue from "./view/PlaceInQueue";

<BalanceInput />
<PlaceInQueue address={address} />
```

## Notes

- **Admin-only components:**  
  `GetterComponent`, `SellerInQueue`, and `ValueInQueue` are designed for contract owner/admin use only.
- **Regular user components:**  
  `BalanceInput`, `ExistsInput`, `SupplyInput`, `URIInput`, and `PlaceInQueue` are accessible to any connected user.
- **Error Handling:**  
  All components provide immediate feedback for invalid input or contract errors.

---
This folder is essential for querying and visualizing on-chain data for both users and administrators.