import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../../components/api.js'

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const data = await apiGet('/api/agent/tickets')
      setTickets(data || [])
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = tickets
    if (filter !== 'all') list = list.filter(t => (t.status || '').toLowerCase() === filter)
    const s = q.trim().toLowerCase()
    if (s) list = list.filter(t =>
      (t.title || '').toLowerCase().includes(s) ||
      (t.userEmail || '').toLowerCase().includes(s) ||
      (t.type || '').toLowerCase().includes(s)
    )
    return list
  }, [tickets, filter, q])

  const openCount = tickets.filter(t => t.status === 'Open').length
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length

  return (
    <div className="grid">
      <div className="card">
        <div className="cardTitle">
          <h2 className="h1">Agent Console</h2>
          <span className="badge"><span className="dot bad" /> Full Access</span>
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

        <div className="row">
          <div className="field" style={{minWidth:'260px'}}>
            <label className="small">Status Filter</label>
            <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="field" style={{minWidth:'260px'}}>
            <label className="small">Search</label>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search title, user email, type..." />
          </div>
        </div>

        {loading && <p className="small">Loading...</p>}
        {err && <p style={{color:'var(--bad)'}}>{err}</p>}

        {!loading && filtered.length === 0 && <p className="small">No tickets found.</p>}

        <table className="table" style={{marginTop:8}}>
          <thead>
            <tr>
              <th className="small" style={{textAlign:'left'}}>Title</th>
              <th className="small" style={{textAlign:'left'}}>User</th>
              <th className="small" style={{textAlign:'left'}}>Status</th>
              <th className="small" style={{textAlign:'left'}}>Priority</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t._id}>
                <td className="td">{t.title}<div className="small">{t.type}</div></td>
                <td className="td">{t.userEmail}</td>
                <td className="td"><span className="badge">{t.status}</span></td>
                <td className="td"><span className="badge">{t.priority || 'Normal'}</span></td>
                <td className="td"><Link to={`/agent/tickets/${t._id}`}><button className="primary">Open</button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="cardTitle">
          <h3 className="h1" style={{fontSize:18}}>Agent Actions</h3>
          <span className="badge"><span className="dot warn" /> Workflow</span>
        </div>
        <ul className="small">
          <li>Update status and priority based on impact.</li>
          <li>Reply publicly to communicate with the user.</li>
          <li>Add internal notes for handoffs and investigation details.</li>
        </ul>
      </div>
    </div>
  )
}