import React, { useEffect, useState } from "react";
import { readMarket } from "@/hooks/MarketContract";
import { useMarketRead } from "@/hooks/MarketContract";

import SimpleError from "@/components/Errors/SimpleError";
import SimpleButton from "@/components/Buttons/SimpleButton";

import SellerInQueue from "./SellerInQueue";
import ValueInQueue from "./ValueInQueue";

import SimpleInput from "../SimpleInput";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * GetterComponent
 *
 * A dashboard component for viewing market contract queue information and implementation version.
 * Intended for use in the view section of the app. Only onwer/admin can use this component. 
 *
 * Features:
 * - Displays the current implementation version of the market contract.
 * - Allows users to input a token or market id and fetch queue head and tail positions.
 * - Validates that the entered id is numeric.
 * - Shows queue information (head and tail) for the specified id.
 * - Includes ValueInQueue and SellerInQueue subcomponents for additional queue-related details.
 * - Handles and displays errors using the SimpleError component.
 * - Disables input and button during loading.
 *
 * UI:
 * - Uses SimpleInput for id field.
 * - Uses SimpleButton for the "get" action.
 * - Uses SimpleError to display error messages.
 * - Renders ValueInQueue and SellerInQueue below the main info row.
 *
 * Usage:
 * ```tsx
 * <GetterComponent />
 * ```
 *
 * Note:
 * - Only numeric ids are allowed.
 * - Fetches and displays version, queue head, and queue tail.
 * - Suitable for any user who needs to inspect queue state in the market contract.
 * - Only owner can use this component. 
 */

const GetterComponent: React.FC = () => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [version, setVersion] = useState<bigint | undefined>(undefined);
  const [tail, setTail] = useState<bigint | undefined>(undefined);
  const [head, setHead] = useState<bigint | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);
  const [id, setId] = useState<string>("");

  const {
    data: currentVersion,
    error: versionError,
    isLoading: versionIsLoading,
  } = useMarketRead("getImplementetionVersion");

  useEffect(() => {
    if (!versionIsLoading && typeof currentVersion === "bigint") {
      setVersion(currentVersion);
    }
    if (versionError) {
      console.error("Version error:", versionError);
      setError("Version error!");
    }
  }, [versionIsLoading, currentVersion, versionError]);

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  }

  const _handleClick = async() => {
    if(!onlyNumbers({param: id, setError})) return;

    setLoad(true);
    setError(undefined);
    try {
      const resHead = await readMarket("getQueueHead", [id]);
      console.log("resHead:", resHead);
      if(typeof resHead === "bigint") {
        setHead(resHead);
      } else {
        throw new Error("Type of head error");
      }
    } catch (e) {
      console.error(e);
      setError("Get head error");
    } 

    try {
      const resTail = await readMarket("getQueueTail", [id]);
      console.log("resTail:", resTail);
      if(typeof resTail === "bigint") {
        setTail(resTail);
      } else {
        throw new Error("Type of tail error");
      }
    } catch (e) {
      console.error(e);
      setError("Get tail error");
    }

    setLoad(false);
    setId("");
  }

  return (
    <div>
      <div className="simple-row">
        <h2 className="h2-green">Vesion:</h2>
        <span>{versionIsLoading ? "Loading..." : version}</span>
      </div>

      <div className="simple-row">
        <h2 className="h2-green">QueueHead: {load ? "Loading..." : head}</h2>
        <h2 className="h2-green">QueueTail: {load ? "Loading..." : tail}</h2>
        <SimpleInput 
          placeholder={"id"}
          name={"id"}
          value={id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleButton onClick={_handleClick} disabled={load}>
          get
        </SimpleButton>
      </div>

      <ValueInQueue />
      <SellerInQueue />

      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default GetterComponent;
