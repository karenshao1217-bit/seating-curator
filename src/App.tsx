import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import NewEventPage from './pages/NewEventPage'
import EventPage from './pages/EventPage'
import ThemeTestPage from './pages/ThemeTestPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/event/new" element={<NewEventPage />} />
      <Route path="/event/:eventId" element={<EventPage />} />
      <Route path="/test-tokens" element={<ThemeTestPage />} />
    </Routes>
  )
}

export default App
