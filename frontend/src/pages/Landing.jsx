import React from 'react'
import { Link } from 'react-router-dom'
import { loadAuth } from '../components/auth.js'

export default function Landing() {
  const auth = loadAuth()

  return (
    <div className="grid">
      <div className="card">
        <div className="cardTitle">
          <h2 className="h1">Professional Ticketing System</h2>
          <span className="badge"><span className="dot good" /> Secure</span>
        </div>
        <p className="small">
          This portal supports separate authentication for <strong>Users</strong> and <strong>Agents</strong>.
          Users can create and track tickets. Agents can triage, respond, and resolve issues with internal notes.
        </p>

        <div className="kpi">
          <div className="kpiBox">
            <div className="small">User Portal</div>
            <div style={{fontSize:18, fontWeight:700}}>Create & track tickets</div>
          </div>
          <div className="kpiBox">
            <div className="small">Agent Console</div>
            <div style={{fontSize:18, fontWeight:700}}>Resolve & add notes</div>
          </div>
          <div className="kpiBox">
            <div className="small">Security</div>
            <div style={{fontSize:18, fontWeight:700}}>JWT + MongoDB</div>
          </div>
        </div>

        <div style={{height:12}} />

        {!auth?.token ? (
          <div className="row">
            <Link to="/login-user"><button className="primary">User Login</button></Link>
            <Link to="/signup"><button>Sign up</button></Link>
            <Link to="/login-agent"><button>Agent Login</button></Link>
          </div>
        ) : (
          <div className="row">
            <Link to={auth.role === 'agent' ? '/agent' : '/user'}>
              <button className="primary">Go to Dashboard</button>
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <div className="cardTitle">
          <h3 className="h1" style={{fontSize:18}}>How it works</h3>
          <span className="badge"><span className="dot warn" /> Role-based access</span>
        </div>
        <ol className="small">
          <li>Users sign up (stored in <code>users</code> collection) and log in.</li>
          <li>Agents can only log in if they exist in <code>agents</code> collection.</li>
          <li>Tickets are tied to the authenticated user’s MongoDB <code>_id</code>.</li>
          <li>Agents can update status/priority and add internal notes.</li>
        </ol>
      </div>
    </div>
  )
}