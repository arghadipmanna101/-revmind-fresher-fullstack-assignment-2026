import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 NovaBite Insights</h1>
        <nav>
          <button
            className={tab === 'dashboard' ? 'active' : ''}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={tab === 'chat' ? 'active' : ''}
            onClick={() => setTab('chat')}
          >
            Ask AI
          </button>
        </nav>
      </header>
      <main>
        {tab === 'dashboard' ? <Dashboard /> : <Chat />}
      </main>
    </div>
  )
}