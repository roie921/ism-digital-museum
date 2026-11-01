import { createContext, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Auth from './pages/Auth'
import { Home, Teachers, Events, EventDetail, Timeline } from './pages/Content'
import { Exhibits, ExhibitDetail, ExhibitForm } from './pages/Exhibits'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export default function App() {
  const [user, setUser] = useState(null), [role, setRole] = useState('guest'), [ready, setReady] = useState(false)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!user) return setRole('guest')
    supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => setRole(data?.role ?? 'student'))
  }, [user])
  if (!ready) return <p className="note">Ачаалж байна…</p>
  const Guard = ({ children }) => (user ? children : <Navigate to="/auth" />)
  return (
    <AuthCtx.Provider value={{ user, role, isAdmin: role === 'admin' }}>
      <header className="bar">
        <Link to="/" className="logo">ISM Digital Museum</Link>
        <nav>
          <NavLink to="/exhibits">Үзмэр</NavLink><NavLink to="/timeline">Time Machine</NavLink>
          <NavLink to="/teachers">Багш нар</NavLink><NavLink to="/events">Арга хэмжээ</NavLink>
          {user ? <><NavLink to="/exhibits/new">Бүтээл нэмэх</NavLink><button onClick={() => supabase.auth.signOut()}>Гарах</button></> : <NavLink to="/auth">Нэвтрэх</NavLink>}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exhibits" element={<Exhibits />} />
          <Route path="/exhibits/new" element={<Guard><ExhibitForm /></Guard>} />
          <Route path="/exhibits/:id" element={<ExhibitDetail />} />
          <Route path="/exhibits/:id/edit" element={<Guard><ExhibitForm /></Guard>} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<p className="note">Хуудас олдсонгүй.</p>} />
        </Routes>
      </main>
      <footer>Мэдээллийн Системийн Менежментийн Тэнхим · Internet Programming</footer>
    </AuthCtx.Provider>
  )
}
