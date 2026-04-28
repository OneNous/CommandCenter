import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MobileApp } from './MobileApp.jsx'

const designMode = import.meta.env.VITE_DESIGN_MODE === '1'

createRoot(document.getElementById('root')).render(
  <StrictMode>{designMode ? <App /> : <MobileApp />}</StrictMode>,
)
