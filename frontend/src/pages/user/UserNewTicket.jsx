import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../../components/api.js'

export default function UserNewTicket() {
  const nav = useNavigate()
  const [form, setForm] = useState({ title:'', type:'support', description:'', priority:'Normal' })
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const on = (k) => (e) => setForm(v => ({...v, [k]: e.target.value}))

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setSaving(true)
    try {
      const t = await apiPost('/api/user/tickets', form)
      nav(`/user/tickets/${t._id}`)
    } catch (e2) {
      setErr(String(e2))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <div className="cardTitle">
        <h2 className="h1">Create New Ticket</h2>
        <span className="badge"><span className="dot warn" /> User Portal</span>
      </div>

      {err && <p style={{color:'var(--bad)'}}>{err}</p>}

      <form onSubmit={submit}>
        <div className="row">
          <div className="field">
            <label className="small">Title</label>
            <input value={form.title} onChange={on('title')} required />
          </div>

          <div className="field">
            <label className="small">Type</label>
            <select value={form.type} onChange={on('type')}>
              <option value="support">support</option>
              <option value="bug">bug</option>
              <option value="feature">feature</option>
              <option value="other">other</option>
            </select>
          </div>

          <div className="field">
            <label className="small">Priority</label>
            <select value={form.priority} onChange={on('priority')}>
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="field" style={{minWidth:'auto'}}>
          <label className="small">Description</label>
          <textarea rows="6" value={form.description} onChange={on('description')} required />
        </div>

        <div className="row">
          <button className="primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit Ticket'}</button>
          <button type="button" onClick={()=>nav('/user')}>Cancel</button>
        </div>
      </form>
    </div>
  )
}