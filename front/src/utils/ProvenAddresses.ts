import DeployingData from "../../public/DeployingData.json";

if (
  !(
    DeployingData.tokenAddr.substring(0, 2) === "0x" &&
    DeployingData.tokenAddr.length === 42
  )
) {
  throw new Error("Incorrect tokenAddr from DeployingData.json");
}
export const TOKEN_ADDR =
  DeployingData.tokenAddr as `0x${string}`; /* в README можно прописать, что 
сюда и в другие места с адресом автомтом подтягивается тот, 
который мы получаем после деплоя, он в файле DeployingData.json */

if (
  !(
    DeployingData.marketAddr.substring(0, 2) === "0x" &&
    DeployingData.marketAddr.length === 42
  )
) {
  throw new Error("Incorrect marketAddr from DeployingData.json");
}
export const MARKET_ADDR =
  DeployingData.marketAddr as `0x${string}`;