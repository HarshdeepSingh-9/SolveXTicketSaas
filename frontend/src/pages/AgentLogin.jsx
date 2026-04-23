import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../components/api.js'
import { saveAuth } from '../components/auth.js'

export default function AgentLogin() {
  const nav = useNavigate()
  const [form, setForm] = useState({ username:'', password:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const on = (k) => (e) => setForm(v => ({...v, [k]: e.target.value}))

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await apiPost('/api/auth/agent/login', form)
      saveAuth({ token: res.token, role: res.role, username: res.username, userId: res.agentId })
      nav('/agent')
    } catch (e2) {
      setErr(String(e2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="cardTitle">
        <h2 className="h1">Agent Login</h2>
        <span className="badge"><span className="dot bad" /> Agents</span>
      </div>

      <p className="small">Agents must exist in the MongoDB <code>agents</code> collection.</p>

      {err && <p style={{color:'var(--bad)'}}>{err}</p>}

      <form onSubmit={submit}>
        <div className="row">
          <div className="field">
            <label className="small">Agent Username</label>
            <input value={form.username} onChange={on('username')} required />
          </div>
          <div className="field">
            <label className="small">Password</label>
            <input type="password" value={form.password} onChange={on('password')} required />
          </div>
        </div>

        <div className="row">
          <button className="primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <Link to="/login-user"><button type="button">User Login</button></Link>
        </div>
      </form>
    </div>
  )
}