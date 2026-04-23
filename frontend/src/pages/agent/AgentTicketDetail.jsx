import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiGet, apiPost, apiPut } from '../../components/api.js'

export default function AgentTicketDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [edit, setEdit] = useState({ status:'Open', priority:'Normal', type:'support', title:'', description:'' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const [reply, setReply] = useState('')
  const [note, setNote] = useState('')

  const on = (k) => (e) => setEdit(v => ({...v, [k]: e.target.value}))

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const t = await apiGet(`/api/agent/tickets/${id}`)
      setTicket(t)
      setEdit({
        status: t.status || 'Open',
        priority: t.priority || 'Normal',
        type: t.type || 'support',
        title: t.title || '',
        description: t.description || ''
      })
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function save() {
    setErr('')
    try {
      const t = await apiPut(`/api/agent/tickets/${id}`, edit)
      setTicket(t)
    } catch (e) {
      setErr(String(e))
    }
  }

  async function sendReply() {
    if (!reply.trim()) return
    setErr('')
    try {
      const t = await apiPost(`/api/agent/tickets/${id}/reply`, { message: reply })
      setTicket(t)
      setReply('')
    } catch (e) {
      setErr(String(e))
    }
  }

  async function addNote() {
    if (!note.trim()) return
    setErr('')
    try {
      const t = await apiPost(`/api/agent/tickets/${id}/notes`, { message: note })
      setTicket(t)
      setNote('')
    } catch (e) {
      setErr(String(e))
    }
  }

  const publicMsgs = useMemo(() => (ticket?.messages || []).filter(m => !m.internal), [ticket])
  const internalMsgs = useMemo(() => (ticket?.messages || []).filter(m => m.internal), [ticket])

  return (
    <div className="grid">
      <div className="card">
        <div className="cardTitle">
          <h2 className="h1">Ticket Details</h2>
          <button onClick={()=>nav('/agent')}>Back</button>
        </div>

        {loading && <p className="small">Loading...</p>}
        {err && <p style={{color:'var(--bad)'}}>{err}</p>}

        {ticket && (
          <>
            <div className="row">
              <span className="badge">User: {ticket.userEmail}</span>
              <span className="badge">Ticket: {ticket._id}</span>
            </div>

            <div className="row">
              <div className="field">
                <label className="small">Title</label>
                <input value={edit.title} onChange={on('title')} />
              </div>
              <div className="field">
                <label className="small">Type</label>
                <select value={edit.type} onChange={on('type')}>
                  <option value="support">support</option>
                  <option value="bug">bug</option>
                  <option value="feature">feature</option>
                  <option value="other">other</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label className="small">Status</label>
                <select value={edit.status} onChange={on('status')}>
                  <option value="Open">Open</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="field">
                <label className="small">Priority</label>
                <select value={edit.priority} onChange={on('priority')}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="field" style={{justifyContent:'flex-end'}}>
                <label className="small">&nbsp;</label>
                <button className="primary" onClick={save}>Save Updates</button>
              </div>
            </div>

            <div className="field" style={{minWidth:'auto'}}>
              <label className="small">Description</label>
              <textarea rows="4" value={edit.description} onChange={on('description')} />
            </div>

            <div className="hr" />

            <div className="cardTitle">
              <strong>Public Conversation</strong>
              <span className="badge"><span className="dot good" /> Visible to user</span>
            </div>

            {publicMsgs.length === 0 && <div className="small">No public messages yet.</div>}
            {publicMsgs.map((m, idx) => (
              <div key={idx} className="card" style={{margin:'10px 0'}}>
                <div className="small"><strong>{m.authorName || m.authorRole}</strong> • {new Date(m.timestamp).toLocaleString()}</div>
                <div>{m.message}</div>
              </div>
            ))}

            <div className="field" style={{minWidth:'auto'}}>
              <label className="small">Reply to user</label>
              <textarea rows="3" value={reply} onChange={(e)=>setReply(e.target.value)} />
            </div>
            <button className="primary" onClick={sendReply}>Send Reply</button>
          </>
        )}
      </div>

      <div className="card">
        <div className="cardTitle">
          <strong>Internal Notes</strong>
          <span className="badge"><span className="dot warn" /> Agents only</span>
        </div>

        {ticket && (
          <>
            {internalMsgs.length === 0 && <div className="small">No internal notes yet.</div>}
            {internalMsgs.map((m, idx) => (
              <div key={idx} className="card" style={{margin:'10px 0'}}>
                <div className="small"><strong>{m.authorName || 'Agent'}</strong> • {new Date(m.timestamp).toLocaleString()}</div>
                <div>{m.message}</div>
              </div>
            ))}

            <div className="field" style={{minWidth:'auto'}}>
              <label className="small">Add internal note</label>
              <textarea rows="3" value={note} onChange={(e)=>setNote(e.target.value)} />
            </div>
            <button onClick={addNote}>Add Note</button>
          </>
        )}
      </div>
    </div>
  )
}