import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { writeToken } from "@/hooks/TokenContract";
import { MARKET_ADDR } from "@/utils/ProvenAddresses";

const TransferBatchInput: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  const [transferData, setTransferData] = useState<{
    receiver: string;
    id: string;
    value: string;
  }>({ receiver: "", id: "", value: "" });
  const [load, setLoad] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [hash, setHash] = useState<string>("");

  console.log("Component 'TransferBatchInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransferData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const _handleClickTransfer = async () => {
    if (
      !(
        transferData.receiver.substring(0, 2) === "0x" &&
        transferData.receiver.length === 42
      )
    ) {
      setError("Incorrect address");
      return;
    }

    let onlyNumbers = /^[\d\s,]+$/.test(transferData.id);
    if (!onlyNumbers) {
      setError("Only numbers, comma, space, please!");
      return;
    }

    onlyNumbers = /^[\d\s,]+$/.test(transferData.value);
    if (!onlyNumbers) {
      setError("Only numbers, comma, space, please!");
      return;
    }

    if (address === transferData.receiver) {
      setError("Don't transfer youself");
      return;
    }

    setLoad(true);
    setError(undefined);
    try {
      const ids = transferData.id.split(",").map((i) => i.trim());
      const values = transferData.value.split(",").map((i) => i.trim());
      const hash = await writeToken("safeBatchTransferFrom", [
        address,
        transferData.receiver,
        ids,
        values,
        "0x",
      ]);
      console.log("Tx hash:", hash);
      setHash(hash);
    } catch (e) {
      console.error(e);
      setError("Tx error!");
    } finally {
      setTransferData({
        receiver: "",
        id: "",
        value: "",
      });
    }
    setLoad(false);
  };

  return (
    <div className="simple-row">
      <div className="vertical-stack">
        <h2 className="h2-green">Transfer batch</h2>
        <SimpleInput
          placeholder={"receiver"}
          name={"receiver"}
          value={transferData.receiver}
          onChange={_handleChange}
          disabled={load}
          list={"receiver-list"}
        />
        <datalist id="receiver-list">
          <option value={MARKET_ADDR} label="Market place address"/>
        </datalist>
        <SimpleInput
          placeholder={"id (1, 33, 5)"}
          name={"id"}
          value={transferData.id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleInput
          placeholder={"value (1, 1200, 1)"}
          name={"value"}
          value={transferData.value}
          onChange={_handleChange}
          disabled={load}
        />
        {hash && (
          <p>hash: {hash.substring(0, 6) + "..." + hash.substring(60, 65)}</p>
        )}
        {error && <SimpleError error={error} setError={setError} />}
      </div>
      <SimpleButton onClick={_handleClickTransfer} disabled={load}>
        transfer
      </SimpleButton>
    </div>
  );
};

export default TransferBatchInput;
