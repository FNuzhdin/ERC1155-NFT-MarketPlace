import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../Buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { writeToken } from "@/hooks/TokenContract";
import { MARKET_ADDR } from "@/utils/ProvenAddresses";
import { onlyNumbers } from "@/utils/FormatChecks";

/**
 * TransferInput component
 *
 * Allows any user to transfer a single token (NFT or FT) from their address to another address.
 *
 * Key points:
 * - Enter receiver address, token id, and value (amount).
 * - Calls `safeTransferFrom` on the token contract.
 * - If the receiver is the marketplace address (`MARKET_ADDR`), the token is automatically listed for sale (FT or NFT).
 * - Prevents sending to your own address, validates inputs.
 * - Shows loading, transaction hash, and error messages.
 *
 * UI:
 * - `SimpleInput` for receiver, id, and value.
 * - Receiver input has a datalist for quick selection of marketplace address.
 * - `SimpleButton` to confirm transfer.
 * - `SimpleError` for errors.
 *
 * Usage:
 * ```tsx
 * <TransferInput address={address} />
 * ```
 *
 * Notes:
 * - Usable by any user for their own tokens.
 * - Sending to marketplace lists the token for sale automatically.
 * - Fields clear after each operation, partial transaction hash is shown.
 */

const TransferInput: React.FC<{ address: `0x${string}` | undefined }> = ({
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

  console.log("Component 'TransferInput' booted");

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

    if(!onlyNumbers({param: transferData.id, setError})) return; 
    if(!onlyNumbers({param: transferData.value, setError})) return;

    if (address === transferData.receiver) {
      setError("Don't transfer youself");
      return;
    }

    setLoad(true);
    setError(undefined);
    try {
      const hash = await writeToken("safeTransferFrom", [
        address,
        transferData.receiver,
        transferData.id,
        transferData.value,
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
        <h2 className="h2-green">Transfer</h2>
        <SimpleInput
          placeholder={"receiver"}
          name={"receiver"}
          value={transferData.receiver}
          onChange={_handleChange}
          disabled={load}
          list={"receiver-list"}
        />
        <datalist id="receiver-list">
          <option value={MARKET_ADDR} label="Market place address" />
        </datalist>
        <SimpleInput
          placeholder={"id"}
          name={"id"}
          value={transferData.id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleInput
          placeholder={"value"}
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

export default TransferInput;
