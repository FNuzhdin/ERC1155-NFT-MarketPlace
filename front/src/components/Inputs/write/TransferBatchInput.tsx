import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../Buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { writeToken } from "@/hooks/TokenContract";
import { MARKET_ADDR } from "@/utils/ProvenAddresses";
import { onlyNumbersComma } from "@/utils/FormatChecks";

/**
 * TransferBatchInput component
 *
 * Lets any user transfer one or multiple tokens (NFT or FT) from their own address to any other address.
 *
 * Key points:
 * - Enter receiver address, comma-separated token ids, and comma-separated values.
 * - Calls `safeBatchTransferFrom` on the token contract to transfer the specified tokens/amounts.
 * - If the receiver address is the marketplace address (`MARKET_ADDR`), the token(s) will be automatically listed for sale (exhibited) in the marketplace, whether FT or NFT.
 * - Prevents sending tokens to yourself, validates addresses and input format.
 * - Shows loading state, transaction hash, and error messages.
 *
 * UI:
 * - `SimpleInput` for receiver, ids, and values.
 * - Receiver input includes a datalist for quick selection of the marketplace address.
 * - `SimpleButton` to confirm transfer.
 * - `SimpleError` for error display.
 *
 * Usage:
 * ```tsx
 * <TransferBatchInput address={address} />
 * ```
 *
 * Notes:
 * - Usable by any user for their own tokens.
 * - After sending to the marketplace address, tokens are automatically exhibited for sale as FT or NFT.
 * - After each operation, fields are cleared and the transaction hash is partially shown.
 */

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

    if(!onlyNumbersComma({param: transferData.id, setError})) return;
    if(!onlyNumbersComma({param: transferData.value, setError})) return;

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
