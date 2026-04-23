import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost } from '../components/api.js'
import { saveAuth } from '../components/auth.js'

export default function UserSignup() {
  const nav = useNavigate()
  const [form, setForm] = useState({ username:'', password:'', displayName:'', email:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const on = (k) => (e) => setForm(v => ({...v, [k]: e.target.value}))

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await apiPost('/api/auth/user/signup', form)
      saveAuth({ token: res.token, role: res.role, username: res.username, userId: res.userId })
      nav('/user')
    } catch (e2) {
      setErr(String(e2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="cardTitle">
        <h2 className="h1">Create User Account</h2>
        <span className="badge"><span className="dot warn" /> Signup</span>
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
          <div className="field">
            <label className="small">Display Name</label>
            <input value={form.displayName} onChange={on('displayName')} placeholder="Optional" />
          </div>
          <div className="field">
            <label className="small">Email</label>
            <input value={form.email} onChange={on('email')} placeholder="Optional" />
          </div>
        </div>

        <div className="row">
          <button className="primary" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
          <Link to="/login-user"><button type="button">Back to login</button></Link>
        </div>
      </form>
    </div>
  )
}