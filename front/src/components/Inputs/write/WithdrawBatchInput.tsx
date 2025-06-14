import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { writeToken } from "@/hooks/TokenContract";
import { TOKEN_ADDR } from "@/utils/ProvenAddresses";

const WithdrawBatchInput: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  console.log("Component 'TransferInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClick = async () => {
    let onlyNumbers = /^[\d\s,]+$/.test(id);
    if (!onlyNumbers) {
      setError("Only numbers, comma, space, please!");
      return;
    }

    setLoad(true);
    setError(undefined);
    try {
      const ids = id
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
        .map(BigInt);
      if (ids.length === 0) {
        setError("Incorrect ids!");
        return;
      }
      const tokenAddrArr = Array.from({ length: ids.length }, () => TOKEN_ADDR);
      const hash = await writeToken("withdrawBatch", [ids, tokenAddrArr]);
      console.log("Tx hash:", hash);
    } catch (e) {
      setError("Withdraw error!");
      console.error(e);
    } finally {
      setId("");
    }
    setLoad(false);
  };
  return (
    <div className="vertical-stack">
      <h2 className="h2-green">Withdraw batch</h2>
      <div className="simple-row">
        <SimpleInput
          placeholder={"id"}
          name={"id"}
          value={id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleButton disabled={load} onClick={_handleClick}>
          withdraw
        </SimpleButton>
      </div>
      <SimpleError error={error} setError={setError} />
    </div>
  );
};

export default WithdrawBatchInput;
