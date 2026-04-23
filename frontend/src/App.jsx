import React from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { loadAuth, clearAuth } from './components/auth.js'

import Landing from './pages/Landing.jsx'
import UserLogin from './pages/UserLogin.jsx'
import AgentLogin from './pages/AgentLogin.jsx'
import UserSignup from './pages/UserSignup.jsx'

import UserDashboard from './pages/user/UserDashboard.jsx'
import UserNewTicket from './pages/user/UserNewTicket.jsx'
import UserTicketDetail from './pages/user/UserTicketDetail.jsx'

import AgentDashboard from './pages/agent/AgentDashboard.jsx'
import AgentTicketDetail from './pages/agent/AgentTicketDetail.jsx'

function Guard({ role, children }) {
  const auth = loadAuth()
  const loc = useLocation()
  if (!auth?.token) return <Navigate to="/login-user" replace state={{ from: loc.pathname }} />
  if (role && auth.role !== role) return <Navigate to="/" replace />
  return children
}

function Shell({ children }) {
  const auth = loadAuth()
  const loc = useLocation()

  const links = auth?.role === 'agent'
    ? [
        { to: '/agent', label: 'Agent Dashboard' },
      ]
    : auth?.role === 'user'
    ? [
        { to: '/user', label: 'My Tickets' },
        { to: '/user/new', label: 'New Ticket' },
      ]
    : [
        { to: '/login-user', label: 'User Login' },
        { to: '/login-agent', label: 'Agent Login' },
      ]

  const active = (to) => loc.pathname === to || loc.pathname.startsWith(to + '/')

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brandDot" />
          <div>
            <div>SolveX Support</div>
            <div className="small">Secure Support Portal</div>
          </div>
        </div>

        <div className="hr" />

        {links.map(l => (
          <Link key={l.to} to={l.to} className={`navlink ${active(l.to) ? 'active' : ''}`}>
            <span>▸</span> <span>{l.label}</span>
          </Link>
        ))}

        <div className="hr" />

        {auth?.token ? (
          <>
            <div className="pill">{auth.role.toUpperCase()} • {auth.username}</div>
            <div style={{height:10}} />
            <button className="danger" onClick={() => { clearAuth(); window.location.href = '/' }}>
              Log out
            </button>
          </>
        ) : (
          <div className="small">Log in to access tickets.</div>
        )}
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="pill">{auth?.token ? `Signed in as ${auth.username}` : 'Not signed in'}</div>
          <div className="pill">MongoDB • localhost:27017/407</div>
        </div>
        <div className="container">{children}</div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login-user" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/login-agent" element={<AgentLogin />} />

        <Route path="/user" element={<Guard role="user"><UserDashboard /></Guard>} />
        <Route path="/user/new" element={<Guard role="user"><UserNewTicket /></Guard>} />
        <Route path="/user/tickets/:id" element={<Guard role="user"><UserTicketDetail /></Guard>} />

        <Route path="/agent" element={<Guard role="agent"><AgentDashboard /></Guard>} />
        <Route path="/agent/tickets/:id" element={<Guard role="agent"><AgentTicketDetail /></Guard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}