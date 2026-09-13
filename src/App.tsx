import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'

export function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Home />
      </main>
      <Footer />
    </div>
  )
}
