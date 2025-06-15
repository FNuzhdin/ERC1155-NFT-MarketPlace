# Components

This folder contains all reusable React components used throughout the project. Components are organized into subfolders by their function and feature area.  
Each subfolder contains self-contained, documented components, which can be imported and used as building blocks for the application's UI.  
Below is an overview of each subfolder and its main purpose.

---

## Subfolders Overview

### `Buttons`
Reusable and style-consistent button components used across the application (e.g., for actions like pause/unpause, disconnect, etc.).

### `Cards`
UI card components for displaying grouped information, token summaries, marketplace listings, etc.

### `Errors`
Components for error handling and displaying error messages to the user in a unified style.

### `Inputs`
A large collection of form and input components for both viewing and changing contract data.  
- Includes minting, viewing, and writing transaction components.
- Used in both administrative and user-level interfaces.
- See the [`Inputs/README.md`](./Inputs/README.md) for details.

### `Market`
Components that provide marketplace interfaces for administrators and users.
- **MarketAdminInterface:** Unified dashboard for marketplace administration.
- **MarketPlace:** Main interface for users to list tokens (FT/NFT) for sale.
- **MarketUserInterface:** Tools for users to manage their sales, prices, and withdrawals.
- See [`Market/README.md`](./Market/README.md) for full details.

### `Token`
Components for interacting with the TokenERC1155 smart contract.
- **TokenAdminInterface:** Administrative dashboard for full token management.
- **TokenUserInterface:** User dashboard for token management and operations.
- See [`Token/README.md`](./Token/README.md) for more information.

### `WalletConnect`
Components for wallet connection and displaying wallet/account information.
- **WalletAndInfo:** Handles wallet connection, shows account info, balance, and admin rights.

---

## General Usage

- Import components as needed from their respective subfolders.
- Each component is documented using JSDoc and/or a README in its folder.
- Administrative components are separated from regular user components for access control.
- All error handling is centralized with components from the `Errors` folder.
- Input and interaction logic is encapsulated in `Inputs`, which are composed into higher-level UI in `Market` and `Token`.

---

## Documentation

- Refer to each subfolder's README for specific usage, available components, and props.
- All major components are documented inline for quick reference.
- Administrative and user interfaces are provided separately and clearly marked.

---

## Structure Example

```
components/
├── Buttons/
├── Cards/
├── Errors/
├── Inputs/
│   ├── mint/
│   ├── view/
│   ├── write/
├── Market/
├── Token/
├── WalletConnect/
```

---

## Notes

- Some components compose multiple lower-level components for complex workflows.
- Always ensure the correct interface is used for the correct user role (admin vs. user).
- The codebase is modular, making it easy to add or modify components as the project evolves.