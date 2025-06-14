import React, { ReactElement, ReactEventHandler, useState } from "react";
import SimpleInput from "../SimpleInput";
import SimpleButton from "../../buttons/SimpleButton";
import SimpleError from "../../Errors/SimpleError";
import { readToken } from "@/hooks/TokenContract";

const ExistsInput: React.FC = () => {
  const [load, setLoad] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isExists, setIsExists] = useState<string | undefined>(undefined);

console.log("Component 'ExistsInput' booted");
  
  const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const _handleClick = async () => {
    let onlyNumbers = /^\d+$/.test(id);
    if (!onlyNumbers) {
      setError("Only numbers, please");
      console.warn("Only numbers in input 'id', please");
      return;
    }

    setError(undefined);
    setLoad(true); 
    setIsExists(undefined); 
    try {
        const result = await readToken("exists", [id]);
        if(typeof result === "boolean") {
            setIsExists(String(result)); 
        } 
    } catch (error) {
        console.error(error);
        setError("Exists error");
    } finally {
        setId("")
    }
    setLoad(false); 
  };
  return (
    <div>
      <h2 className="h2-green">Is exist?</h2>
      <div className="simple-row">
        <SimpleInput
          placeholder={"id"}
          name={"id"}
          value={id}
          onChange={_handleChange}
          disabled={load}
        />
        <SimpleButton disabled={load} onClick={_handleClick}>
          get
        </SimpleButton>
      </div>
      {isExists && <p>result: {isExists}</p>}
      {error && <SimpleError error={error} setError={setError} />}
    </div>
  );
};

export default ExistsInput;
