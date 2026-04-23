import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../../components/api.js'

function statusDot(status) {
  if (status === 'Resolved') return 'good'
  if (status === 'Open') return 'warn'
  return 'bad'
}

export default function UserDashboard() {
  const [tickets, setTickets] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const data = await apiGet('/api/user/tickets')
      setTickets(data || [])
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return tickets
    return tickets.filter(t =>
      (t.title || '').toLowerCase().includes(s) ||
      (t.description || '').toLowerCase().includes(s) ||
      (t.type || '').toLowerCase().includes(s) ||
      (t.status || '').toLowerCase().includes(s)
    )
  }, [tickets, q])

  const openCount = tickets.filter(t => t.status === 'Open').length
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length

  return (
    <div className="grid">
      <div className="card">
        <div className="cardTitle">
          <h2 className="h1">My Tickets</h2>
          <Link to="/user/new"><button className="primary">+ New Ticket</button></Link>
        </div>

        <div className="kpi">
          <div className="kpiBox">
            <div className="small">Total</div>
            <div style={{fontSize:22, fontWeight:800}}>{tickets.length}</div>
          </div>
          <div className="kpiBox">
            <div className="small">Open</div>
            <div style={{fontSize:22, fontWeight:800}}>{openCount}</div>
          </div>
          <div className="kpiBox">
            <div className="small">Resolved</div>
            <div style={{fontSize:22, fontWeight:800}}>{resolvedCount}</div>
          </div>
        </div>

        <div className="field" style={{minWidth:'auto'}}>
          <label className="small">Search</label>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by title, description, status..." />
        </div>

        {loading && <p className="small">Loading...</p>}
        {err && <p style={{color:'var(--bad)'}}>{err}</p>}

        {!loading && filtered.length === 0 && <p className="small">No tickets found.</p>}

        {filtered.map(t => (
          <div key={t._id} className="card" style={{marginTop:10}}>
            <div className="row" style={{justifyContent:'space-between'}}>
              <div>
                <div className="row">
                  <strong>{t.title}</strong>
                  <span className="badge"><span className={`dot ${statusDot(t.status)}`} /> {t.status}</span>
                  <span className="badge">{t.type}</span>
                  <span className="badge">Priority: {t.priority || 'Normal'}</span>
                </div>
                <div className="small">Ticket: {t._id}</div>
              </div>
              <Link to={`/user/tickets/${t._id}`}><button className="primary">Open</button></Link>
            </div>
            <div className="small" style={{marginTop:8}}>{t.description}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="cardTitle">
          <h3 className="h1" style={{fontSize:18}}>Quick Tips</h3>
          <span className="badge"><span className="dot good" /> Secure</span>
        </div>
        <ul className="small">
          <li>Create tickets with clear titles (e.g., “VPN can’t connect”).</li>
          <li>Add additional messages when you have new details.</li>
          <li>Agents can add internal notes that users cannot see.</li>
        </ul>
      </div>
    </div>
  )
}