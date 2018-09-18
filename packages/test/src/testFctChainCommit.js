import Fct from '@ledgerhq/hw-app-fct'
const { Entry } = require( 'factom/src/entry' )
const { FactomCli } = require('factom/src/factom-cli')
const { Chain, computeChainTxId, validateChainInstance, composeChainReveal } = require( 'factom/src/chain' )
const { sha256, sha256d } = require('factom/src/util')

const nacl = require('tweetnacl/nacl-fast').sign

const cli = new FactomCli({
            host: 'courtesy-node.factom.com',
	    port: 443,
	    path: '/v2', // Path to V2 API. Default to /v2
	    debugPath: '/debug', // Path to debug API. Default to /debug
	    user: 'paul', // RPC basic authentication
	    password: 'pwd',
	    protocol: 'https', // http or https. Default to http
	    rejectUnauthorized: true, // Set to false to allow connection to a node with a self-signed certificate
	    retry: {
              retries: 4,
              factor: 2,
              minTimeout: 500,
              maxTimeout: 2000
            }})

//extracted from factom.Chain since it wasn't exported
function composeChainLedger(chain) {
    const firstEntry = chain.firstEntry;
    const entryHash = firstEntry.hash();
    const buffer = Buffer.alloc(104);

    buffer.writeInt8(0);
    buffer.writeIntBE(firstEntry.timestamp || Date.now(), 1, 6);
    const chainIdHash = sha256d(chain.id);
    chainIdHash.copy(buffer, 7);
    const commitWeld = sha256d(Buffer.concat([entryHash, chain.id]));
    commitWeld.copy(buffer, 39);
    entryHash.copy(buffer, 71);
    buffer.writeInt8(chain.ecCost(), 103);

    return buffer;
}

//variant of factom.chain.composeChainCommit 
function composeChainCommit(chain, ecpubkey, signature) {
    validateChainInstance(chain);
    const buffer = composeChainLedger(chain)
    return Buffer.concat([buffer, ecpubkey, signature]);
}

//variant of factom.chain.composeChainCommit
function composeChain(chain, ecpubkey, signature) {
  validateChainInstance(chain);
  return {
    commit: composeChainCommit(chain, ecpubkey, signature),
    reveal: composeChainReveal(chain)
  };
}


export default async transport => {
  const fct = new Fct(transport);
  const ecRate = await cli.getEntryCreditRate()
  const path = "44'/132'/0'/0'/0'"
  const addr = await fct.getAddress(path)
  const fromAddr = addr['address']
  const content = 'Hello Ledger'

  const e = Entry.builder()
    .extId('extId', 'utf8')
    .extId('extId++', 'utf8')
    .content(content, 'utf8')
    .build();
    //.timestamp(Date.now())

  const chain = new Chain(e);

  const txId = computeChainTxId(chain);


  const ccbuffer = composeChainLedger(chain)

  console.log('-------------========== Entry Commit Begin ==========----------------')
  console.log(ccbuffer.toString('hex'))
  console.log('-------------========== Entry Commit End ==========----------------')

  const result = await fct.signCommit(path, ccbuffer.toString('hex'),true);

  console.log('-------------========== SIGNATURE ==========----------------')
  console.log(result)
  console.log('-------------========== SIGNATURE ==========----------------')

  const out = composeChain(chain, Buffer.from(result['k'],'hex'),Buffer.from(result['s'],'hex'))

  console.log('-------------========== Composed Chain ==========----------------')
  console.log('commit:')
  console.log(out['commit'].toString('hex'))
  console.log('reveal:')
  console.log(out['reveal'].toString('hex'))
  console.log('-------------========== Composed Chain ==========----------------')

   if(nacl.detached.verify(ccbuffer, Buffer.from(result['s'],'hex'), Buffer.from(result['k'],'hex'))) {
      console.log("Chain Commit Signature IS valid!!!")
    } else {
      console.log("Chain Commit Signature is NOT valid!!!")
      throw("Invalid Chain Commit Signature")
    }


  return out
}
