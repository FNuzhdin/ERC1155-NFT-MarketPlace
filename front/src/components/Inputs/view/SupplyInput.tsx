import React, { useState } from "react";
import SimpleError from "../../Errors/SimpleError";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../buttons/SimpleButton";
import { readToken } from "@/hooks/TokenContract";

const SupplyInput: React.FC = () => {
  const [supply, setSupply] = useState<bigint | undefined>(undefined);
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [load, setLoad] = useState<boolean>(false);

  console.log("Component 'SupplyInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClickSupply = async () => {
    let onlyNumbers = /^\d+$/.test(id);
    if (!onlyNumbers) {
      setError("Only numbers, please");
      console.warn("Only numbers in input 'id', please");
      return;
    }

    setError(undefined);
    setLoad(true);
    console.log(id);
    console.log(typeof id);

    try {
      const result = await readToken("totalSupply", [BigInt(id)]);
      console.log("Total supply by id:", result);
      if (typeof result === "bigint") {
        setSupply(result);
        console.log("Total supply by id:", supply);
      }
    } catch (error) {
      console.error(error);
      setError("Supply error");
    }
    setLoad(false);
  };

  return (
    <div>
      <h2 className="h2-green">Supply</h2>
      <div className="simple-row">
        <div className="vertical-stack">
          <SimpleInput
            placeholder={"id"}
            name={"supply"}
            value={id}
            onChange={_handleChange}
            disabled={load}
          />
          {supply && (
            <div>
              <p>
                Current supply:
                <span className="aquamarine-paragraph">{supply}</span>
              </p>
              <SimpleButton
                disabled={load}
                onClick={() => setSupply(undefined)}
              >
                clean
              </SimpleButton>
            </div>
          )}
        </div>
        <SimpleButton disabled={load} onClick={_handleClickSupply}>
          get
        </SimpleButton>
      </div>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default SupplyInput;
