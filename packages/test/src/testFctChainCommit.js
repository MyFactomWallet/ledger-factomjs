import Fct from '@ledgerhq/hw-app-fct'
const { FactomCli } = require('factom/src/factom-cli')
const { Entry } = require( 'factom/src/entry' )
const { Chain, computeChainTxId, validateChainInstance, composeChainLedger, composeChain } = require( 'factom/src/chain' )

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
  }
})


export default async transport => {
  const fct = new Fct(transport);
  const ecRate = 24000 //await CORS... cli.getEntryCreditRate()
  const path = "44'/132'/0'/0'/0'"
  const addr = await fct.getAddress(path)
  const ecaddr = addr['address']
  const content = 'Hello Ledger'

  const e = Entry.builder()
    .extId('extId', 'utf8')
    .extId('extId++', 'utf8')
    .content(content, 'utf8')
    .timestamp(Date.now())
    .build();

  const chain = new Chain(e);

  const txId = computeChainTxId(chain);

  const ccbuffer = composeChainLedger(chain)

  console.log('========== Chain Ledger Begin ==========')
  console.log(ccbuffer.toString('hex'))
  console.log('========== Chain Ledger End ==========')

  const result = await fct.signCommit(path, ccbuffer.toString('hex'),true);

  console.log('========== Chain Commit Signature ==========')
  console.log(result)
  console.log('========== Chain Commit Signature ==========')

  const out = composeChain(chain, ecaddr, result['s'])

  console.log('========== Composed Chain Begin ==========')
  console.log('commit:')
  console.log(out['commit'].toString('hex'))
  console.log('reveal:')
  console.log(out['reveal'].toString('hex'))
  console.log('========== Composed Chain End ==========')

  return out
}
