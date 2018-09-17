import Fct from '@ledgerhq/hw-app-fct'
const { Transaction} = require( 'factom/src/transaction' )
const { FactomCli } = require('factom/src/factom-cli')
const nacl = require('tweetnacl/nacl-fast').sign




            
const cli = new FactomCli({
            host: 'courtesy-node.factom.com',
	    port: 80,
	    path: '/v2', // Path to V2 API. Default to /v2
	    debugPath: '/debug', // Path to debug API. Default to /debug
	    user: 'paul', // RPC basic authentication
	    password: 'pwd',
	    protocol: 'http', // http or https. Default to http
	    rejectUnauthorized: true, // Set to false to allow connection to a node with a self-signed certificate
	    retry: {
              retries: 4,
              factor: 2,
              minTimeout: 500,
              maxTimeout: 2000
            }})

export default async transport => {
  const fct = new Fct(transport);
  const amount = 1000000
  const ecRate = await cli.getEntryCreditRate()
  const path = "44'/131'/0'/0'/0'"
  const addr = await fct.getAddress(path)
  const fromAddr = addr['address']

  const toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn'

  const numinputs = 1
  const numoutputs = 10

  const fees = Transaction.builder()
    .input(fromAddr, amount*numoutputs)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .build()
    .computeRequiredFees(ecRate, { rcdSignatureLength: numoutputs * (33 + 64), numberOfSignatures: numinputs })

  console.log("*** ecRate ***")
  console.log(ecRate)
  console.log("**************")
  console.log("***  fees  ***")
  console.log(fees)
  console.log("**************")

  const t = Transaction.builder()
    .input(fromAddr, amount*numoutputs+fees)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .output(toAddr, amount)
    .build()


  console.log('-------------========== TXN ==========----------------')
  console.log(t.marshalBinarySig.toString('hex'))
  console.log('-------------========== TXN ==========----------------')

  const result = await fct.signTransaction("44'/131'/0'/0'/0'", t.marshalBinarySig.toString('hex'));

  console.log('-------------========== SIGNATURE ==========----------------')
  console.log(result)
  console.log('-------------========== SIGNATURE ==========----------------')

  const ts = Transaction.builder(t)
    .rcdSignature(Buffer.from(result['r'],'hex'), Buffer.from(result['s'],'hex'))
    .build()


  for (let i = 0; i < ts.signatures.length; ++i) {
    if(nacl.detached.verify(ts.marshalBinarySig, ts.signatures[i], Buffer.from(ts.rcds[i], 1).slice(1))) {
      console.log("SIGNATURE IS VALID!!")
    } else {
      console.log("SIGNATURE IS NOT VALID!")
    }
  }
  return result
}
