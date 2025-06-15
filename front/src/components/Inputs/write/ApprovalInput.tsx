import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../Buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { readToken, writeToken } from "@/hooks/TokenContract";

/**
 * ApprovalInput component
 *
 * A component for managing and viewing operator approvals for tokens.
 * This component allows users to both grant/revoke approval for an operator
 * (using `setApprovalForAll`) and check the current approval status for any operator
 * (using `isApprovedForAll`). Suitable for both regular users and contract owners.
 *
 * Features:
 * - **Check Approve:**  
 *   Enter an operator address to check if they are currently approved to manage all tokens for the connected user.
 *   Displays the approval status as a boolean result.
 *
 * - **Set Approval For All:**  
 *   Enter an operator address and a boolean value (`true` or `false`) to grant or revoke approval for that operator.
 *   Initiates a blockchain transaction to update the approval status.
 *
 * - **Validation:**  
 *   Ensures that all entered addresses are valid addresses (`0x...` and 42 characters long).
 *   Ensures that boolean input is either `true` or `false`.
 *
 * - **Error Handling & Feedback:**  
 *   Immediate feedback for input errors and transaction failures.
 *   Disables inputs and buttons while loading.
 *
 * UI:
 * - Uses `SimpleInput` for operator address and boolean value.
 * - Uses `SimpleButton` for actions.
 * - Uses `SimpleError` to display error messages.
 *
 * Props:
 * - `address` (`0x...` or undefined): The connected wallet address (required for checking approvals).
 *
 * Usage:
 * ```tsx
 * <ApprovalInput address={address} />
 * ```
 *
 * Note:
 * - Both regular users and admins can use this component to manage and inspect operator approvals.
 * - The component features both approval management and approval status checking in the same interface.
 */

const ApprovalInput: React.FC<{ address: `0x${string}` | undefined }> = ({
  address,
}) => {
  const [errorSet, setErrorSet] = useState<string | undefined>(undefined);
  const [errorGet, setErrorGet] = useState<string | undefined>(undefined);
  const [operatorData, setOperatorData] = useState<{
    setOperatorApprove: string;
    getOperatorApprove: string;
    boolean: string;
  }>({ setOperatorApprove: "", getOperatorApprove: "", boolean: "" });
  const [load, setLoad] = useState<boolean>(false);
  const [getResult, setGetResult] = useState<string | undefined>(undefined);

  console.log("Component 'ApprovalInput' booted");

  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOperatorData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const _handleClickGetApprove = async () => {
    if (
      !(
        operatorData.getOperatorApprove.substring(0, 2) === "0x" &&
        operatorData.getOperatorApprove.length === 42
      )
    ) {
      setErrorGet("Incorrect address");
      return;
    } else {
      setErrorGet(undefined);
      setLoad(true);
      try {
        const result = await readToken("isApprovedForAll", [
          address,
          operatorData.getOperatorApprove,
        ]);
        if (typeof result === "boolean") {
          setGetResult(String(result));
        } else {
          console.warn("hi");
        }
      } catch (e) {
        console.error(e);
        setErrorGet("Tx error!");
      } finally {
        setOperatorData({
          setOperatorApprove: "",
          getOperatorApprove: "",
          boolean: "",
        });
      }
      setLoad(false);
    }
  };

  const _handleClickSetApprove = async () => {
    if (
      !(
        operatorData.setOperatorApprove.substring(0, 2) === "0x" &&
        operatorData.setOperatorApprove.length === 42
      )
    ) {
      setErrorSet("Incorrect address");
      return;
    } else {
      setLoad(true);
      setErrorSet(undefined);
      try {
        if (
          operatorData.boolean === "true" ||
          operatorData.boolean === "false"
        ) {
          if (operatorData.boolean === "true") {
            await writeToken("setApprovalForAll", [
              operatorData.setOperatorApprove,
              true,
            ]);
          } else {
            await writeToken("setApprovalForAll", [
              operatorData.setOperatorApprove,
              false,
            ]);
          }
        } else {
          setErrorSet("Invalid bool");
        }
      } catch (e) {
        console.error(e);
        setErrorSet("Tx error!");
      } finally {
        setOperatorData({
          setOperatorApprove: "",
          getOperatorApprove: "",
          boolean: "",
        });
      }
      setLoad(false);
    }
  };
  return (
    <div>
      <div>
        <h2 className="h2-green">Check approve</h2>
        <div className="simple-row">
          <SimpleInput
            placeholder={"operator"}
            name={"getOperatorApprove"}
            value={operatorData.getOperatorApprove}
            onChange={_handleChange}
            disabled={load}
          />
          <SimpleButton onClick={_handleClickGetApprove} disabled={load}>
            get
          </SimpleButton>
        </div>
        {getResult && <p>result: {getResult}</p>}
        <SimpleError error={errorGet} setError={setErrorGet} />
      </div>
      <div>
        <h2 className="h2-green">Set approval for all</h2>
        <div className="simple-row">
          <div className="vertical-stack">
            <SimpleInput
              placeholder={"operator"}
              name={"setOperatorApprove"}
              value={operatorData.setOperatorApprove}
              onChange={_handleChange}
              disabled={load}
            />
            <SimpleInput
              placeholder={"false/true"}
              name={"boolean"}
              value={operatorData.boolean}
              onChange={_handleChange}
              disabled={load}
            />
          </div>
          <SimpleButton onClick={_handleClickSetApprove} disabled={load}>
            set
          </SimpleButton>
        </div>
        <SimpleError error={errorSet} setError={setErrorSet} />
      </div>
    </div>
  );
};

export default ApprovalInput;
