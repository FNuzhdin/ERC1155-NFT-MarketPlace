import React, { useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { readToken, writeToken } from "@/hooks/TokenContract";

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
