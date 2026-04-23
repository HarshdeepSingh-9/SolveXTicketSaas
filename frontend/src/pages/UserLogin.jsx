import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { apiPost } from '../components/api.js'
import { saveAuth } from '../components/auth.js'

export default function UserLogin() {
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from || '/user'

  const [form, setForm] = useState({ username:'', password:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const on = (k) => (e) => setForm(v => ({...v, [k]: e.target.value}))

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await apiPost('/api/auth/user/login', form)
      saveAuth({ token: res.token, role: res.role, username: res.username, userId: res.userId })
      nav(from)
    } catch (e2) {
      setErr(String(e2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="cardTitle">
        <h2 className="h1">User Login</h2>
        <span className="badge"><span className="dot good" /> Users</span>
      </div>

      {err && <p style={{color:'var(--bad)'}}>{err}</p>}

      <form onSubmit={submit}>
        <div className="row">
          <div className="field">
            <label className="small">Username</label>
            <input value={form.username} onChange={on('username')} required />
          </div>
          <div className="field">
            <label className="small">Password</label>
            <input type="password" value={form.password} onChange={on('password')} required />
          </div>
        </div>

        <div className="row">
          <button className="primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <Link to="/signup"><button type="button">Create account</button></Link>
          <Link to="/login-agent"><button type="button">Agent Login</button></Link>
        </div>
      </form>
    </div>
  )
}