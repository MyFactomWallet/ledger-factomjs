import Fct from "@ledgerhq/hw-app-fct";

export default async transport => {
  const fct = new Fct(transport);
  const result = await fct.getAppConfiguration();
  return result;
};
