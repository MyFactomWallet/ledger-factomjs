import Fct from "@factoid.org/hw-app-fct";
const address = require('factom/src/addresses')
import assert from 'assert'

export default async transport => {
  const fct = new Fct(transport);
  const result = await fct.getAddress("44'/131'/0'/0/0",true);
  assert(address.isValidAddress(result['address']))
  return result;
};
