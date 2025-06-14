import React from "react";

import { useState } from "react";
import { readToken } from "@/hooks/TokenContract";
import SimpleError from "../../Errors/SimpleError";

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
    let onlyNumbers = /^\d+$/.test(id);
    if (!onlyNumbers) {
      setError("Only numbers, please");
      console.warn("Only numbers in input 'id', please");
      return;
    }

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
