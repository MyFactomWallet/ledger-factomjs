import Fct from "@factoid.org/hw-app-fct";
import assert from 'assert'

const address = require('factom/src/addresses');

export default async transport => {
  const fct = new Fct(transport);
  const result = await fct.getAddress("44'/132'/0'/0'/0'");
  assert(address.isValidAddress(result['address']))

  return result;
};
