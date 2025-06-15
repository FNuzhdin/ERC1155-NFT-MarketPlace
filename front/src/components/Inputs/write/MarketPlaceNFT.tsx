import React, { useState, useEffect } from "react";
import NFTCard from "@/components/Cards/NFTCard";
import SimpleError from "@/components/Errors/SimpleError";

import { useMarketRead } from "@/hooks/MarketContract";

/**
 * MarketPlaceNFT component
 *
 * This component displays all NFT (non-fungible token) ids currently exhibited on the marketplace.
 * It fetches the array of NFT ids from the market contract and renders an `NFTCard` for each id.
 * Intended for use in the public marketplace interface, so that users can browse available NFT listings and interact with them.
 *
 * Features:
 * - Fetches all exhibited NFT ids using the `getAllIdsNFTExhibited` method from the market contract.
 * - For each NFT id, renders an `NFTCard` component, passing the id, current user address, and a refetch function for updating state after user actions.
 * - Handles and displays errors using the `SimpleError` component.
 * - Displays all NFT listings in a responsive container.
 *
 * UI:
 * - Renders a header and a list of NFT cards.
 * - Uses `NFTCard` for displaying each NFT's details.
 * - Uses `SimpleError` to show any loading or fetching errors.
 *
 * Props:
 * - `address` (`0x...` or undefined): The connected wallet address, passed down to `NFTCard`.
 *
 * Usage:
 * ```tsx
 * <MarketPlaceNFT address={address} />
 * ```
 *
 * Notes:
 * - This component is meant to be used in the marketplace interface.
 * - Relies on the `NFTCard` component to render NFT details and enable further user actions.
 * - The ids are fetched and updated whenever the contract state changes.
 */

const MarketPlaceNFT: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  const { data: tokensArr, isLoading, refetch } = useMarketRead("getAllIdsNFTExhibited");
  const [ids, setIds] = useState<bigint[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (Array.isArray(tokensArr)) {
      setIds(tokensArr);
    } else {
      console.log("Ids array isn't loaded yet")
    }
  }, [tokensArr, isLoading]);

  return (
    <div>
      <h1 className="h1">NFT</h1>
      <ul className="containers-wrapper">
        {ids.map((id) => (
          <li className="flex-container-standart" key={id}>
            <NFTCard id={id} address={address} refetch={refetch} />
          </li>
        ))}
      </ul>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default MarketPlaceNFT;
