import "babel-polyfill"

import TransportU2F from "@ledgerhq/hw-transport-u2f"
import Fct from "@factoid.org/hw-app-fct"

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


//********** BEGIN MAKE A BUTTON ************//
const btn = document.createElement("button");
btn.textContent = "Get Address";
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
      
      const path = getFctHDPath(account_number,change_addr,addr_index)
      console.log(path)

      const result = await getFctAddr(transport,path,false);
      if (result) {
        console.log(result);
        errorEl.textContent = result['address']
      }
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

  //open a connection to the device...
  let transport = await TransportU2F.create();
  transport.setDebugMode(debugMode);

  try {
    const { Transaction } = require( 'factom/src/transaction' )
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
        const ts = Transaction.builder(t)
            .rcdSignature(Buffer.from(result['r'],'hex'), Buffer.from(result['s'],'hex'))
            .build()
        console.log(result);
        errorEl2.textContent = result['s']

        //********************************************************//
        //submit the signed transaction (i.e. ts) to factomd here.//
        //********************************************************// 
      }
    } catch (err) {
      console.error("Failed signTx from Ledger " + ":", err);
      errorEl2.textContent = e.message;
      throw err;
    } finally {
      transport.close();
    }
}
