import "babel-polyfill"

import TransportU2F from "@ledgerhq/hw-transport-u2f"
import Fct from "@factoid.org/hw-app-fct"
const { Transaction } = require( 'factom/src/transaction' )
const { FactomCli } = require('factom/src/factom-cli')


const cli = new FactomCli({
            host: 'api.factomd.net',
            port: 443,
            path: '/v2', // Path to V2 API. Default to /v2
            debugPath: '/debug', // Path to debug API. Default to /debug
            protocol: 'https', // http or https. Default to http
            rejectUnauthorized: true, // Set to false to allow connection to a node with a self-signed certificate
            retry: {
              retries: 4,
              factor: 2,
              minTimeout: 500,
              maxTimeout: 2000
            }})


const use_testnet = 1
const debugMode = true

let account_number = 0
let change_addr = 0
let addr_index = 0

if ( use_testnet === 1) {
  account_number = 2147483647
  change_addr = 0 
  addr_index = 0
}


function getFctHDPath(account, change, address_index) {
  return ("44'/131'/" + account.toString() + "'/" + change.toString() + "'/" + address_index.toString() + "'")   
}

async function getFctAddr(transport, path, display) {
  const fct = new Fct(transport);
  const result = await fct.getAddress(path,display||false);
  return result;
}

async function signTx(transport, path, tx_hex) {
  const fct = new Fct(transport)
  const result = await fct.signTransaction(path, tx_hex)
  return result
}

async function getAppConfiguration(transport) {
  const fct = new Fct(transport)
  const result = await fct.getAppConfiguration()
  return result
}

async function signMessageHash(transport, path, message) {
  const fct = new Fct(transport)

  //sha256
  let result = await fct.signMessageHash(path, message, true)
  console.log(result)
}
async function signMessageRaw(transport, path, message) {
	  const fct = new Fct(transport)

  let result = await fct.signMessageRaw(path, message)
  console.log(result)
}

async function txtestfail() {
  let txret;
    //open a connection to the device...
  let transport = await TransportU2F.create();
  transport.setDebugMode(debugMode);

  try {
    const path = getFctHDPath(account_number,change_addr,addr_index)
    const amount = 1000000
    const ecRate = 24000 //await cli.getEntryCreditRate()
    const addr = await getFctAddr(transport, path, false)
    const fromAddr = addr['address']

    const toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn'

    const numinputs = 1
    const numoutputs = 1

    const fees = Transaction.builder()
      .input(fromAddr, amount)
      .output(toAddr, amount)
      .build()
      .computeRequiredFees(ecRate, { rcdSignatureLength: numoutputs * (33 + 64), numberOfSignatures: numinputs })


    const t = Transaction.builder()
      .input(fromAddr, amount+fees)
      .output(toAddr, amount)
      .build()


    console.log('-------------========== TXN ==========----------------')
    console.log(t.marshalBinarySig.toString('hex'))
    console.log('-------------========== TXN ==========----------------')


    const result = await signTx(transport, path, t.marshalBinarySig.toString('hex'));
    if (result) {
        txret = Transaction.builder(t)
            .rcdSignature(
                Buffer.from(result['r'],'hex'), 
                Buffer.from(result['s'],'hex'))
            .build()
        console.log(result);
        errorEl2.textContent = result['s']
      }
    } catch (err) {
      console.error("Failed signTx from Ledger " + ":", err);
      errorEl2.textContent = e.message;
      throw err;
    } finally {
      transport.close();
      return txret;
    }

}

async function txtestworks() {
  const txret = {}
    //open a connection to the device...
  let transport = await TransportU2F.create();
  transport.setDebugMode(debugMode);

  try {
    const path = getFctHDPath(account_number,change_addr,addr_index)
    const amount = 1000000
    const ecRate = 24000 //await cli.getEntryCreditRate()
    const addr = await getFctAddr(transport, path, false)
    const fromAddr = addr['address']

    const toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn'

    const numinputs = 1
    const numoutputs = 1

    const fees = Transaction.builder()
      .input(fromAddr, amount)
      .output(toAddr, amount)
      .build()
      .computeRequiredFees(ecRate, { rcdSignatureLength: numoutputs * (33 + 64), numberOfSignatures: numinputs })


    const t = Transaction.builder()
      .input(fromAddr, amount+fees)
      .output(toAddr, amount)
      .build()


    console.log('-------------========== TXN ==========----------------')
    console.log(t.marshalBinarySig.toString('hex'))
    console.log('-------------========== TXN ==========----------------')


    const result = await signTx(transport, path, t.marshalBinarySig.toString('hex'));
    if (result) {
        txret.tx = Transaction.builder(t)
            .rcdSignature(Buffer.from(result['r'],'hex'), Buffer.from(result['s'],'hex'))
            .build()
        console.log(result);
        errorEl2.textContent = result['s']
        txret.result = "Hello there. Hopefully this works."
      }
    } catch (err) {
      console.error("Failed signTx from Ledger " + ":", err)
      errorEl2.textContent = e.message;
      throw err;
    } finally {
      transport.close();
      return txret;

        
    }

    
}
//********** BEGIN MAKE A BUTTON ************//
const btn = document.createElement("button");
btn.textContent = "Get Address and Sign Msg";
document.body.appendChild(btn);
const errorEl = document.createElement("code");
errorEl.style.color = "#a33";
const pre = document.createElement("pre");
pre.appendChild(errorEl);
document.body.appendChild(pre);
//********** END MAKE A BUTTON ************//

btn.onclick = async () => {
  errorEl.textContent = "";

  try {
      var transport = await TransportU2F.create();
      transport.setDebugMode(debugMode);
      
      // const path = getFctHDPath(account_number,change_addr,addr_index)
      const path = "44'/143165576'/0'/0/0"
      console.log(path)

      const result = await getFctAddr(transport,path,false);
      if (result) {
        console.log(result);
        errorEl.textContent = result['address']
      }
      console.log("about to sign message hash");
      
      const resultsignhash = await signMessageHash(transport, path, Buffer.from('The quick brown fox jumps over the lazy dog'))
      if ( resultsignhash )
      {
          console.log(resultsignhash);
      }
      console.log("completed signing hash");
      console.log("about to sign raw message ");
      const resultsign = await signMessageRaw(transport, path, Buffer.from('The quick brown fox jumps over the lazy dog'))
      if ( resultsign )
      {
         console.log(resultsign);
      }
      console.log("completed signing raw");


    } catch (err) {
      console.error("Failed getFctAddr from Ledger " + ":", err);
      errorEl.textContent = e.message;
      throw err;
    } finally {
      transport.close();
    }
}


//********** BEGIN MAKE A BUTTON ************//
const btn2 = document.createElement("button");
btn2.textContent = "Sign Transaction";
document.body.appendChild(btn2);
const errorEl2 = document.createElement("code");
errorEl2.style.color = "#a33";
const pre2 = document.createElement("pre");
pre2.appendChild(errorEl2);
document.body.appendChild(pre2);
//********** END MAKE A BUTTON ************//

btn2.onclick = async () => {
  errorEl2.textContent = "";

  let transaction = await txtestworks();
  
  console.log("************")
  console.log(transaction)
  console.log("************")

  if ((transaction.tx instanceof Transaction)) {
        console.log("Congrats: transaction is a Transaction")
        errorEl2.textContent = "Congrats: transaction.tx is an instance of Transaction"
    }

}

//********** BEGIN MAKE A BUTTON ************//
const btn3 = document.createElement("button");
btn3.textContent = "Sign Transaction Fail";
document.body.appendChild(btn3);
const errorEl3 = document.createElement("code");
errorEl3.style.color = "#a33";
const pre3 = document.createElement("pre");
pre3.appendChild(errorEl3);
document.body.appendChild(pre3);
//********** END MAKE A BUTTON ************//

btn3.onclick = async () => {
  errorEl3.textContent = "";

  const transaction = await txtestfail();
  
  console.log("************")
  console.log(transaction)
  console.log("************")

  if (!(transaction instanceof Transaction)) {
        console.log("transaction is not a Transaction")
        errorEl3.textContent = "transaction.tx must be an instance of Transaction"
    } else {
        console.log("transaction IS a Transaction")
    }
  await cli.sendTransaction(transaction)
}
