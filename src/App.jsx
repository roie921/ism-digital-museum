import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import Auth from './pages/Auth'
import About from './pages/About'
import Profile from './pages/Profile'
import { Home, Teachers, Events, EventDetail, Timeline } from './pages/Content'
import { Exhibits, ExhibitDetail, ExhibitForm } from './pages/Exhibits'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>
)

export default function App() {
  const [user, setUser] = useState(null), [profile, setProfile] = useState(null), [ready, setReady] = useState(false), [open, setOpen] = useState(false)
  const nav = useNavigate()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])
  const loadProfile = useCallback(async (u) => {
    if (!u) return setProfile(null)
    const { data } = await supabase.from('profiles').select('display_name,role').eq('id', u.id).maybeSingle()
    setProfile(data || { display_name: u.email, role: 'student' })
  }, [])
  useEffect(() => { loadProfile(user) }, [user, loadProfile])
  if (!ready) return <p className="note">Ачаалж байна…</p>
  const Guard = ({ children }) => (user ? children : <Navigate to="/auth" />)
  const closeAll = (e) => { e.currentTarget.closest('details')?.removeAttribute('open'); setOpen(false) }
  const logout = async (e) => { closeAll(e); await supabase.auth.signOut(); nav('/') }
  return (
    <AuthCtx.Provider value={{ user, profile, isAdmin: profile?.role === 'admin', reloadProfile: () => loadProfile(user) }}>
      <header className="bar">
        <div className="bar-in">
          <Link to="/" className="logo" onClick={() => setOpen(false)}>ISM MUSEUM</Link>
          <button className="burger" aria-label="Цэс" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
          <nav className={open ? 'nav open' : 'nav'} onClick={() => setOpen(false)}>
            <NavLink to="/about">Тэнхим</NavLink>
            <NavLink to="/exhibits">Үзмэр</NavLink>
            <NavLink to="/timeline">Түүхэн замнал</NavLink>
            <NavLink to="/teachers">Багш нар</NavLink>
            <NavLink to="/events">Арга хэмжээ</NavLink>
            {user ? (
              <details className="menu" onClick={(e) => e.stopPropagation()}>
                <summary aria-label="Профайл"><UserIcon /><span className="lbl">Профайл</span></summary>
                <div className="pop">
                  <div className="who"><b>{profile?.display_name || 'Хэрэглэгч'}</b><span className="meta">{user.email}</span></div>
                  <Link to="/profile" onClick={closeAll}>Миний профайл</Link>
                  <Link to="/exhibits/new" onClick={closeAll}>Бүтээл нэмэх</Link>
                  <button onClick={logout}>Гарах</button>
                </div>
              </details>
            ) : <NavLink className="login" to="/auth">Нэвтрэх</NavLink>}
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/exhibits" element={<Exhibits />} />
          <Route path="/exhibits/new" element={<Guard><ExhibitForm /></Guard>} />
          <Route path="/exhibits/:id" element={<ExhibitDetail />} />
          <Route path="/exhibits/:id/edit" element={<Guard><ExhibitForm /></Guard>} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/profile" element={<Guard><Profile /></Guard>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<p className="note">Хуудас олдсонгүй.</p>} />
        </Routes>
      </main>
      <footer>Мэдээллийн Системийн Менежментийн Тэнхим</footer>
    </AuthCtx.Provider>
  )
}
