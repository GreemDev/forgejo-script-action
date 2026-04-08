import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { forgejoClient, context } from '@greem/forgejo-actions'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
import {callAsyncFunction} from './async-function'
import {wrapRequire} from './wrap-require'

process.on('unhandledRejection', handleError)
main().catch(handleError)

async function main(): Promise<void> {
  const token = core.getInput('forgejo-token', {required: !(process.env.FORGEJO_ACTIONS === "true")})
  const baseUrl = core.getInput('base-url')

  const forgejo = forgejoClient(baseUrl, { token: token })
  const script = core.getInput('script', {required: true})

  // Using property/value shorthand on `require` (e.g. `{require}`) causes compilation errors.
  const result = await callAsyncFunction(
    {
      require: wrapRequire,
      __original_require__: __non_webpack_require__,
      forgejo,
      context,
      core,
      exec,
      glob,
      io
    },
    script
  )

  let encoding = core.getInput('result-encoding')
  encoding = encoding ? encoding : 'json'

  let output

  switch (encoding) {
    case 'json':
      output = JSON.stringify(result)
      break
    case 'string':
      output = String(result)
      break
    default:
      throw new Error('"result-encoding" must be either "string" or "json"')
  }

  core.setOutput('result', output)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleError(err: any): void {
  console.error(err)
  core.setFailed(`Unhandled error: ${err}`)
}
