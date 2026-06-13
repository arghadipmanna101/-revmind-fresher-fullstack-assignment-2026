import { useEffect, useState } from 'react'
import { getSummary, getTrends } from '../api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSummary(), getTrends()])
      .then(([s, t]) => {
        setSummary(s.data.data)
        setTrends(t.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="loading">Loading dashboard...</p>
  if (!summary) return <p className="loading">No data available.</p>

  return (
    <div className="dashboard">
      <div className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-label">Total Net Revenue</p>
          <p className="kpi-value">
            ${summary.total_net_revenue.toLocaleString()}
          </p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Gross Profit Margin</p>
          <p className="kpi-value">{summary.gross_profit_margin_pct}%</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Top Region</p>
          <p className="kpi-value">{summary.top_region}</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Monthly Net Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v) => [`$${v.toLocaleString()}`, 'Net Revenue']}
            />
            <Line
              type="monotone"
              dataKey="net_revenue"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}