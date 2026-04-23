import { authHeader } from './auth.js'

async function handle(res) {
  if (res.ok) {
    const text = await res.text()
    return text ? JSON.parse(text) : null
  }
  const msg = await res.text()
  throw new Error(msg || `HTTP ${res.status}`)
}

export async function apiGet(path) {
  const res = await fetch(path, { headers: { ...authHeader() } })
  return handle(res)
}

export async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body)
  })
  return handle(res)
}

export async function apiPut(path, body) {
  const res = await fetch(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body)
  })
  return handle(res)
}

export async function apiDelete(path) {
  const res = await fetch(path, { method: 'DELETE', headers: { ...authHeader() } })
  return handle(res)
}