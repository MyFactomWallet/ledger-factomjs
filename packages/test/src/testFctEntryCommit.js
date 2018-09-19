import Fct from '@ledgerhq/hw-app-fct'

const { FactomCli } = require('factom/src/factom-cli')
const { Entry, validateEntryInstance, composeEntry, composeEntryLedger } = require( 'factom/src/entry' )

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

  const entry = Entry.builder()
    .chainId('954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4')
    .content('Hello Ledger')
    .timestamp(Date.now())
    .build();

  const ecbuffer = composeEntryLedger(entry)

  console.log('========== Entry Commit Ledger Begin ==========')
  console.log(ecbuffer.toString('hex'))
  console.log('========== Entry Commit Ledger End ==========')

  const result = await fct.signCommit(path, ecbuffer.toString('hex'),false)

  console.log('========== Entry Commit Signature ==========')
  console.log(result)
  console.log('========== Entry Commit Signature ==========')

  const out = composeEntry(entry, ecaddr, result['s'])

  console.log('========== Composed Entry Begin ==========')
  console.log('commit:')
  console.log(out['commit'].toString('hex'))
  console.log('reveal:')
  console.log(out['reveal'].toString('hex'))
  console.log('========== Compose Entry End ==========')


  return out
}
