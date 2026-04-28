import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MobileApp } from './MobileApp.jsx'

const designMode = import.meta.env.VITE_DESIGN_MODE === '1'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  render() {
    if (this.state.err) {
      const e = this.state.err
      const msg = e?.message ?? String(e)
      const stack = e?.stack ?? ''
      return (
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            padding: 24,
            maxWidth: 720,
            color: '#f5f7fb',
            background: '#05070a',
            minHeight: '100vh',
          }}
        >
          <h1 style={{ fontSize: 18, color: '#fb7185' }}>CoilShield failed to start</h1>
          <p style={{ opacity: 0.85, lineHeight: 1.5 }}>{msg}</p>
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.4)',
              overflow: 'auto',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
            }}
          >
            {stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>{designMode ? <App /> : <MobileApp />}</RootErrorBoundary>
  </StrictMode>,
)
