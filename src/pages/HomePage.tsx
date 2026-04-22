import { useNavigate } from 'react-router-dom'
import styles from './HomePage.module.css'

interface SavedEvent {
  id: string
  name: string
}

function getMyEvents(): SavedEvent[] {
  try {
    return JSON.parse(localStorage.getItem('my_events') || '[]')
  } catch {
    return []
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const events = getMyEvents()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Seating Curator</h1>
        <p className={styles.subtitle}>活動桌位管理工具</p>
      </header>

      <button
        className={styles.createBtn}
        onClick={() => navigate('/event/new')}
      >
        ＋ 建立新活動
      </button>

      {events.length > 0 && (
        <section className={styles.list}>
          <h2>我的活動</h2>
          {events.map((ev) => (
            <div
              key={ev.id}
              className={styles.eventCard}
              onClick={() => navigate(`/event/${ev.id}`)}
            >
              <span className={styles.eventName}>{ev.name}</span>
              <span className={styles.arrow}>›</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
