import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGet, apiPost, apiDelete } from '../../components/api.js'

export default function UserTicketDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const t = await apiGet(`/api/user/tickets/${id}`)
      setTicket(t)
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function send() {
    if (!msg.trim()) return
    setErr('')
    try {
      const t = await apiPost(`/api/user/tickets/${id}/messages`, { message: msg })
      setTicket(t)
      setMsg('')
    } catch (e) {
      setErr(String(e))
    }
  }

  const visibleMessages = useMemo(() => (ticket?.messages || []).filter(m => !m.internal), [ticket])

  
  async function deleteTicket() {
    if (!confirm("Delete this ticket? This cannot be undone.")) return
    try {
      await apiDelete(`/api/user/tickets/${id}`)
      nav("/user")
    } catch (e) {
      setErr(String(e))
    }
  }

return (
    <div className="grid">
      <div className="card">
        <div className="cardTitle">
          <h2 className="h1">Ticket</h2>
          <div className="row">
          <button onClick={()=>nav('/user')}>Back</button>
          <button className="danger" onClick={deleteTicket}>Delete Ticket</button>
        </div>
        </div>

        {loading && <p className="small">Loading...</p>}
        {err && <p style={{color:'var(--bad)'}}>{err}</p>}

        {ticket && (
          <>
            <div className="row">
              <span className="badge">{ticket.type}</span>
              <span className="badge">Status: {ticket.status}</span>
              <span className="badge">Priority: {ticket.priority || 'Normal'}</span>
            </div>

            <h3 style={{marginBottom:6}}>{ticket.title}</h3>
            <p className="small">{ticket.description}</p>

            <div className="hr" />

            <strong>Conversation</strong>
            <div className="small">Internal notes are hidden from users.</div>

            <div style={{marginTop:10}}>
              {visibleMessages.length === 0 && <div className="small">No messages yet.</div>}
              {visibleMessages.map((m, idx) => (
                <div key={idx} className="card" style={{margin:'10px 0'}}>
                  <div className="small">
                    <strong>{m.authorName || m.authorRole}</strong> • {new Date(m.timestamp).toLocaleString()}
                  </div>
                  <div>{m.message}</div>
                </div>
              ))}
            </div>

            <div className="field" style={{minWidth:'auto'}}>
              <label className="small">Add message</label>
              <textarea rows="3" value={msg} onChange={(e)=>setMsg(e.target.value)} />
            </div>
            <div className="row">
              <button className="primary" onClick={send}>Send</button>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="cardTitle">
          <h3 className="h1" style={{fontSize:18}}>SLA & Guidance</h3>
          <span className="badge"><span className="dot warn" /> Tips</span>
        </div>
        <p className="small">
          Include steps to reproduce, screenshots/logs, and when the issue started.
          This helps agents resolve your request faster.
        </p>
      </div>
    </div>
  )
}