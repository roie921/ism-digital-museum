import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../App'

export default function Profile() {
  const { user, profile, reloadProfile, isAdmin } = useAuth()
  const [name, setName] = useState(profile?.display_name || ''), [msg, setMsg] = useState(''), [mine, setMine] = useState(null)
  useEffect(() => setName(profile?.display_name || ''), [profile])
  useEffect(() => {
    supabase.from('exhibits').select('id,title,year_created,image_url,status').eq('creator_id', user.id).order('created_at', { ascending: false }).then((r) => setMine(r.data || []))
  }, [user.id])
  async function save(e) {
    e.preventDefault()
    const { error } = await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', user.id)
    setMsg(error ? error.message : 'Хадгаллаа.')
    if (!error) reloadProfile()
  }
  return (
    <>
      <h1>Миний профайл</h1>
      <form className="card pad prof" onSubmit={save}>
        <p className="meta">{user.email} · {isAdmin ? 'Админ' : 'Оюутан'}</p>
        <label>Нэр<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        {msg && <p className="meta">{msg}</p>}
        <button className="primary">Хадгалах</button>
      </form>
      <h2>Миний бүтээлүүд</h2>
      {!mine ? <p className="note">Ачаалж байна…</p> : mine.length === 0
        ? <p className="note">Та одоогоор бүтээл нэмээгүй байна. <Link to="/exhibits/new">Эхний бүтээлээ нэмэх</Link></p>
        : <div className="grid">{mine.map((x) => (
          <Link key={x.id} to={`/exhibits/${x.id}`} className="card">{x.image_url && <img src={x.image_url} alt={x.title} loading="lazy" />}
            <div className="pad"><h3>{x.title}</h3><p className="meta">{x.year_created}</p></div></Link>))}</div>}
    </>
  )
}
