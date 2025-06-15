import { useMarketRead } from "@/hooks/MarketContract";
import React, { useEffect, useState } from "react";

import FTCard from "@/components/Cards/FTCard";
import SimpleError from "@/components/Errors/SimpleError";

/**
 * MarketPlaceFT component
 *
 * This component displays all FT (fungible token) ids currently exhibited on the marketplace.
 * It fetches the array of FT ids from the market contract and renders an `FTCard` for each id.
 * Intended for use in the public marketplace interface, so that users can browse available FT listings.
 *
 * Features:
 * - Fetches all exhibited FT ids using the `getAllIdsFTExhibited` method from the market contract.
 * - For each FT id, renders an `FTCard` component, passing the id and current user address.
 * - Handles and displays errors using the `SimpleError` component.
 * - Displays all FT listings in a horizontal scrollable row.
 *
 * UI:
 * - Uses a vertical stack to arrange the list.
 * - Uses `FTCard` for displaying each FT's details.
 * - Uses `SimpleError` to show any loading or fetching errors.
 *
 * Props:
 * - `address` (`0x...` or undefined): The connected wallet address, passed down to `FTCard`.
 *
 * Usage:
 * ```tsx
 * <MarketPlaceFT address={address} />
 * ```
 *
 * Notes:
 * - This component is meant to be used in the marketplace interface.
 * - Relies on the `FTCard` component to render FT details.
 * - The ids are fetched only once and updated when the market contract state changes.
 */

const MarketPlaceFT: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  const { data: tokensArr, isLoading } = useMarketRead("getAllIdsFTExhibited");
  const [ids, setIds] = useState<bigint[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (Array.isArray(tokensArr)) {
      setIds(tokensArr);
    } else {
      console.log("Ids array isn't loaded yet");
    }
  }, [tokensArr, isLoading]);

  return (
    <div>
    
      <div className="vertical-stack">
        <ul className="simple-row">
          {ids.map((id) => (
            <li key={id}>
              <FTCard id={id} address={address} />
            </li>
          ))}
        </ul>
        <SimpleError error={error} setError={setError} />
      </div>
    </div>
  );
};

export default MarketPlaceFT;
