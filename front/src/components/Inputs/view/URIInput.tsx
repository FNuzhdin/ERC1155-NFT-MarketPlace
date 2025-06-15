import React from "react";

import { useState } from "react";
import { readToken } from "@/hooks/TokenContract";
import SimpleError from "../../Errors/SimpleError";

import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * URIInput component
 *
 * A simple component for retrieving the metadata URI of a token by its id.
 * Available to both regular users and contract owners.
 *
 * Features:
 * - Allows the user to input a token id.
 * - Validates that the id is numeric.
 * - Fetches the token's metadata URI by calling the `uri` method on the smart contract.
 * - Displays the URI as a result and provides a button to clear it.
 * - Handles loading state and error messages.
 *
 * UI:
 * - Uses a standard input for the id field.
 * - Uses a button for the "get" action.
 * - Uses another button to clear the displayed URI.
 * - Uses SimpleError to display error messages.
 *
 * Usage:
 * ```tsx
 * <URIInput />
 * ```
 *
 * Note:
 * - The token id must be numeric.
 * - Both regular users and owners can use this component to view the token's metadata URI.
 * - Shows "empty" if the token does not have a set URI.
 */

const URIInput: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);
  const [uri, setUri] = useState<string | undefined>(undefined);

  console.log("Component 'URIInput' booted");
  
  const _hanldeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _getTokenURI = async () => {
    if(!onlyNumbers({param: id, setError})) return;

    setError(undefined);
    setLoad(true);
    try {
      const idToken = BigInt(id);
      const uri = await readToken("uri", [idToken]);
      console.log(uri);
      if (uri === "") {
        setUri("empty");
      } else if (typeof uri === "string") {
        setUri(uri);
      }
    } catch (error) {
      console.error(error);
    }
    setLoad(false);
  };
  return (
    <div>
      <h2 className="h2-green">Get token uri</h2>
      <input
        className="input-white-border"
        type="text"
        placeholder="id"
        onChange={_hanldeChange}
      />
      <button className="small-black-button2" onClick={_getTokenURI}>
        get
      </button>
      {uri && (
        <p>
          URI: {load ? <span>loading...</span> : null}
          {uri && (
            <span>
              <span className="aquamarine-paragraph">{uri}</span>
              <button
                className="small-black-button2"
                onClick={() => {
                  setUri(undefined);
                }}
              >
                clean
              </button>
            </span>
          )}
        </p>
      )}
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default URIInput;
