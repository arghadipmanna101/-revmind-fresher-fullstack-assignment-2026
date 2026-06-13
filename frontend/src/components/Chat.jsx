import { useState } from 'react'
import { postChat } from '../api'

const EXAMPLES = [
  'Which region had the highest net revenue in Q1 2024?',
  'What is the gross profit margin for the Snacks category?',
  'Which sales rep closed the most units in 2025?',
  'Compare E-Commerce vs Modern Trade net revenue.',
  'What was the best performing product in the West region?',
]

export default function Chat() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const send = async (q) => {
    const text = q || question
    if (!text.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setQuestion('')
    setLoading(true)

    try {
      const res = await postChat(text)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.data.answer },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error: could not get a response.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat">
      <div className="chat-examples">
        <p>Try asking:</p>
        {EXAMPLES.map((e) => (
          <button key={e} className="example-btn" onClick={() => send(e)}>
            {e}
          </button>
        ))}
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <p className="empty">Ask a question to get started.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <span className="role">
              {m.role === 'user' ? 'You' : 'NovaBite AI'}
            </span>
            <p>{m.text}</p>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <span className="role">NovaBite AI</span>
            <p className="thinking">Thinking...</p>
          </div>
        )}
      </div>

      <div className="input-row">
        <input
          type="text"
          placeholder="Ask a question about sales data..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button onClick={() => send()} disabled={loading || !question.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}