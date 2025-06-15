# Cards Components

This folder contains reusable React components designed for displaying and interacting with tokens and images in the application. The three main components are:

---

## 1. FTCard

**Purpose:**  
Displays information about a fungible token (FT) and provides functionality to buy or sell tokens.

**Main Features:**
- Fetches and displays token metadata (name, symbol, image, etc.) from IPFS.
- Shows the current price and available balance in the market contract.
- Allows the user to input an amount and execute buy/sell operations.
- Handles loading states and error feedback.
- Uses custom UI elements for buttons, input, and error display.

**Props:**
- `id: bigint` — The token ID.
- `address: string | undefined` — The user's wallet address.

---

## 2. NFTCard

**Purpose:**  
Displays NFT metadata and allows users to buy an NFT if a price is set.

**Main Features:**
- Fetches and displays metadata (name, description, image) from IPFS.
- Shows the current NFT price and allows users to buy if available.
- Handles disabled state and warnings when price is not set.
- Provides manual price refresh and error feedback.

**Props:**
- `id: bigint` — The NFT token ID.
- `address: string | undefined` — The user's wallet address.
- `refetch: Function` — Callback to refetch data after purchase.

---

## 3. ImagePreview

**Purpose:**  
Displays a small preview of an uploaded image file.

**Main Features:**
- Renders a thumbnail for the given image file using a local URL.
- Suitable for showing previews before uploading images.

**Props:**
- `image: File | undefined` — The image file to preview.
- `index: number` — The image's index (used as a key and in the alt text).

---

## Usage

Import the required component from the `cards` folder:

```tsx
import FTCard from './cards/FTCard';
import NFTCard from './cards/NFTCard';
import ImagePreview from './cards/ImagePreview';
```

Each component is self-contained and expects the props described above.

---

## Notes

- All components use TypeScript and React functional components.
- FTCard and NFTCard interact with smart contracts and require proper context/hooks to function.
- ImagePreview is a simple component for client-side image display only.

```