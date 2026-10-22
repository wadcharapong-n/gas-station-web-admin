import axios from 'axios'
import { resolveApiBaseUrl } from './client'

/** Login only — no Authorization header. */
export const loginApi = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30_000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})
