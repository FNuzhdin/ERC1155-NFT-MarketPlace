import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { writeToken } from "@/hooks/TokenContract";

const WithdrawInput: React.FC = () => {
  const [id, setId] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  console.log("Component 'WithdrawInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClick = async () => {
    let onlyNumbers = /^\d+$/.test(id);
    if (!onlyNumbers) {
      setError("Only numbers, please!");
      return;
    }

    setLoad(true);
    setError(undefined);
    try {
      const hash = await writeToken("withdrawSingle", [id]);
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
      <h2 className="h2-green">Withdraw single</h2>
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

export default WithdrawInput;
