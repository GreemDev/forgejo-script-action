// Originally pulled from https://github.com/JasonEtco/actions-toolkit/blob/main/src/context.ts
import {WebhookPayload} from './interfaces.js'
import {readFileSync, existsSync} from 'fs'
import {EOL} from 'os'

export class Context {
  /**
   * Webhook payload object that triggered the workflow
   */
  payload: WebhookPayload

  eventName: string
  sha: string
  ref: string
  workflow: string
  action: string
  actor: string
  job: string
  runAttempt: number
  runNumber: number
  runId: number
  apiUrl: string
  serverUrl: string

  /**
   * Hydrate the context from the environment
   */
  constructor() {
    this.payload = {}
    if (process.env.FORGEJO_EVENT_PATH) {
      if (existsSync(process.env.FORGEJO_EVENT_PATH)) {
        this.payload = JSON.parse(
          readFileSync(process.env.FORGEJO_EVENT_PATH, {encoding: 'utf8'})
        )
      } else {
        const path = process.env.FORGEJO_EVENT_PATH
        process.stdout.write(`FORGEJO_EVENT_PATH ${path} does not exist${EOL}`)
      }
    }
    this.eventName = process.env.FORGEJO_EVENT_NAME as string
    this.sha = process.env.FORGEJO_SHA as string
    this.ref = process.env.FORGEJO_REF as string
    this.workflow = process.env.FORGEJO_WORKFLOW as string
    this.action = process.env.FORGEJO_ACTION as string
    this.actor = process.env.FORGEJO_ACTOR as string
    this.job = process.env.FORGEJO_JOB as string
    this.runAttempt = parseInt(process.env.FORGEJO_RUN_ATTEMPT as string, 10)
    this.runNumber = parseInt(process.env.FORGEJO_RUN_NUMBER as string, 10)
    this.runId = parseInt(process.env.FORGEJO_RUN_ID as string, 10)
    this.apiUrl = process.env.FORGEJO_API_URL!
    this.serverUrl = process.env.FORGEJO_SERVER_URL!
  }

  get issue(): {owner: string; repo: string; number: number} {
    const payload = this.payload

    return {
      ...this.repo,
      number: (payload.issue || payload.pull_request || payload).number
    }
  }

  get repo(): {owner: string; repo: string} {
    if (process.env.FORGEJO_REPOSITORY) {
      const [owner, repo] = process.env.FORGEJO_REPOSITORY.split('/')
      return {owner, repo}
    }

    if (this.payload.repository) {
      return {
        owner: this.payload.repository.owner.login,
        repo: this.payload.repository.name
      }
    }

    throw new Error(
      "context.repo requires a FORGEJO_REPOSITORY environment variable like 'owner/repo'"
    )
  }
}
