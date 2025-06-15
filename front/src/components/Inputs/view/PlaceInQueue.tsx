import SimpleButton from "@/components/Buttons/SimpleButton";
import SimpleError from "@/components/Errors/SimpleError";
import { readMarket } from "@/hooks/MarketContract";
import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import { onlyNumbers } from "@/utils/FormatChecks";

type PlaceInQueueProps = {
  address: `0x${string}` | undefined;
};

/**
 * PlaceInQueue component
 *
 * A component for viewing all queue positions for the current user (address) in the market contract for a given FT id.
 * Intended for sellers who want to track their spots in the queue.
 *
 * Features:
 * - Allows the user to input a token (FT) id.
 * - Validates that the id is numeric.
 * - Fetches all queue positions for the provided account and id using the market contract.
 * - Computes each position relative to the current queue head.
 * - Displays the user's positions in the queue as a list.
 * - Handles loading and error states, and disables the button while loading.
 *
 * UI:
 * - Uses SimpleInput for the id field.
 * - Uses SimpleButton for the "get" action.
 * - Uses SimpleError to display error messages.
 *
 * Props:
 * - `address` (`0x...` or undefined): The connected wallet address.
 *
 * Usage:
 * ```tsx
 * <PlaceInQueue address={address} />
 * ```
 *
 * Note:
 * - Only numeric token ids are allowed.
 * - The user must be connected (provide a valid address).
 * - Useful for sellers to monitor all their positions in the FT queue.
 * - Only owner can use this component.
 */

const PlaceInQueue: React.FC<PlaceInQueueProps> = ({ address }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);
  const [result, setResult] = useState<bigint[]>([]);
  const [id, setId] = useState<string>("");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  }
  
  const _handleClick = async () => {
    if(!onlyNumbers({param: id, setError})) return;

    setError(undefined);
    setLoad(true);
    setResult([]);
    try {
      const places = await readMarket("getPlaceInQueue", [id], address);

      if (!Array.isArray(places)) {
        setError("Problem with places array!");
        throw new Error("Problem with places array!");
      }

      const queHead = await readMarket("getQueueHead", [id]);
      if (typeof queHead !== "bigint") {
        setError("Problem with queue head!");
        throw new Error("Problem with queue head!");
      }

      setResult(places.map((place) => place - queHead));
      console.log("Result:", result);
    } catch (e) {
      console.error("Place in queue error:", e);
      setError("Place in queue error");
    } finally {
      setLoad(false);
    }
  };
  
  return (
    <div>
      <h2 className="h2-green">Your places in queue</h2>
      <p>
        If you are selling FT, you can see
        <br></br>
        all your positions in queque
      </p>
      <SimpleInput 
        placeholder={"id"}
        name={"id"}
        value={id}
        onChange={_handleChange}
      />
      <SimpleButton disabled={load} onClick={_handleClick}>
        get
      </SimpleButton>
      <p>You places in queue: {result}</p>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default PlaceInQueue;
