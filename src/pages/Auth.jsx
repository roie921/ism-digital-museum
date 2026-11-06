import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Auth() {
  const [mode, setMode] = useState('login'), [f, setF] = useState({ email: '', password: '', name: '' })
  const [msg, setMsg] = useState(''), nav = useNavigate()
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setMsg('')
    if (f.password.length < 6) return setMsg('Нууц үг хамгийн багадаа 6 тэмдэгт байна.')
    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: f.email, password: f.password })
      : await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { display_name: f.name } } })
    if (error) return setMsg(error.message)
    if (mode === 'register') { setMsg('Бүртгэл амжилттай. Имэйлээ баталгаажуулсны дараа нэвтэрнэ үү.'); return }
    nav('/exhibits')
  }
  return (
    <form className="card form" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}</h1>
      {mode === 'register' && <label>Нэр<input required value={f.name} onChange={set('name')} /></label>}
      <label>Имэйл<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Нууц үг<input type="password" required value={f.password} onChange={set('password')} /></label>
      {msg && <p className="msg">{msg}</p>}
      <button className="primary">{mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}</button>
      <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Бүртгэлгүй юу? Бүртгүүлэх' : 'Бүртгэлтэй юу? Нэвтрэх'}
      </button>
    </form>
  )
}
