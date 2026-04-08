import { Context } from './context.js'
import { Api, ApiConfig } from '@greem/forgejo-js'
import { forgejoApi as _forgejoApi } from '@greem/forgejo-js'

export const context = new Context()

/**
 * Returns a hydrated API client ready to use for Forgejo Actions
 */
export function forgejoClient<SecurityDataType = unknown>(baseUrl?: string, options?: ApiConfig<SecurityDataType> & { token?: string; }): Api<SecurityDataType> {
  if (options != undefined && options.token === undefined) {
    options.token = process.env.FORGEJO_TOKEN
  }

  if (baseUrl === undefined) {
    baseUrl = context.serverUrl
  }

  return _forgejoApi(baseUrl, options)
}
