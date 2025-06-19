import React, { useState, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { useTokenRead, writeToken } from "@/hooks/TokenContract";
import SimpleError from "../Errors/SimpleError";
import SimpleButton from "./SimpleButton";

/**
 * PausedButton component
 *
 * Purpose:
 * - Allows the user to change the state of a token contract by pausing or unpausing it.
 * - Displays current contract state ("Paused" or "Active") and provides a button to toggle the state.
 *
 * Features:
 * - Reads contract's paused state using `useTokenRead("paused")`.
 * - Calls the appropriate contract method (`pause` or `unpause`) via `writeToken` depending on current state.
 * - Shows loading indicator while transaction is pending.
 * - Displays errors using the SimpleError component.
 * - Shows different icons: FaPause for "pause", FaPlay for "unpause".
 *
 * Usage:
 * ```tsx
 * <PausedButton />
 * ```
 *
 * Dependencies:
 * - @react-icons/fa (FaPause, FaPlay)
 * - useTokenRead, writeToken (custom contract hooks)
 * - SimpleButton, SimpleError (UI components)
 */

const PausedButton: React.FC = () => {
  const {
    data: paused,
    isSuccess: isSuccessPaused,
    refetch: refetchPaused,
  } = useTokenRead("paused");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);

  useEffect(() => {
    if (isSuccessPaused && typeof paused === "boolean") {
      setIsPaused(paused);
    }
    console.log("Success status:", isSuccessPaused);
  }, [isSuccessPaused, paused]);

  console.log("Component 'PausedButton' booted");

  const _handleClick = async () => {
    console.log("try paused token contract");

    setError(undefined);
    setLoad(true);
    try {
      if (isPaused === true) {
        await writeToken("unpause");
      } else {
        await writeToken("pause");
      }
      await refetchPaused();
      console.log("paused success");
    } catch (error) {
      console.error(error);
      setError("Paused error");
    }

    setLoad(false);
  };

  return (
    <div>
      <h2 className="h2-green">Set pause</h2>
      <div className="simple-row">
      <p>
        <strong>Paused:</strong>
        {<span> {isPaused ? "Paused" : "Active"}</span>}
      </p>
      <SimpleButton onClick={_handleClick} disabled={load}>
        {isPaused ? <FaPlay /> : <FaPause />}
        {load && " loading..."}
      </SimpleButton>
      </div>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default PausedButton;
