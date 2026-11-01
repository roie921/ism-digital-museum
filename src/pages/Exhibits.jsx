import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, uploadImage } from '../supabase'
import { useAuth } from '../App'

export function Exhibits() {
  const [items, setItems] = useState(null), [cats, setCats] = useState([]), [q, setQ] = useState(''), [cat, setCat] = useState(''), [err, setErr] = useState('')
  useEffect(() => { supabase.from('exhibition_categories').select('name').then((r) => setCats(r.data || [])) }, [])
  useEffect(() => {
    const t = setTimeout(async () => {
      let s = supabase.from('exhibits').select('*, profiles(display_name)').order('year_created', { ascending: false })
      if (cat) s = s.eq('category', cat)
      const k = q.trim().replace(/[,()%]/g, ' ')
      if (/^\d{4}$/.test(k)) s = s.eq('year_created', Number(k))
      else if (k) s = s.or(`title.ilike.%${k}%,technology_stack.ilike.%${k}%`)
      const { data, error } = await s
      if (error) setErr(error.message); setItems(data || [])
    }, 250)
    return () => clearTimeout(t)
  }, [q, cat])
  return (
    <>
      <h1>Үзмэр, бүтээлүүд</h1>
      <div className="filters">
        <input placeholder="Нэр, технологи эсвэл он (2025)" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Бүх ангилал</option>{cats.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
      </div>
      {err && <p className="msg">{err}</p>}
      {!items ? <p className="note">Ачаалж байна…</p> : items.length === 0
        ? <p className="note">Хайлтад тохирох үзмэр олдсонгүй. Хайлтаа өөрчилж үзнэ үү.</p>
        : <div className="grid">{items.map((x) => (
          <Link key={x.id} to={`/exhibits/${x.id}`} className="card">
            {x.image_url && <img src={x.image_url} alt={x.title} loading="lazy" />}
            <div className="pad"><h3>{x.title}</h3><p className="meta">{x.year_created} · {x.category} · {x.profiles?.display_name}</p></div>
          </Link>))}</div>}
    </>
  )
}

export function ExhibitDetail() {
  const { id } = useParams(), { user, isAdmin } = useAuth(), nav = useNavigate(), [x, setX] = useState(undefined)
  useEffect(() => { supabase.from('exhibits').select('*, profiles(display_name)').eq('id', id).maybeSingle().then((r) => setX(r.data)) }, [id])
  if (x === undefined) return <p className="note">Ачаалж байна…</p>
  if (!x) return <p className="note">Үзмэр олдсонгүй.</p>
  async function del() {
    if (!confirm('Энэ бүтээлийг устгах уу?')) return
    const { error } = await supabase.from('exhibits').delete().eq('id', id)
    error ? alert(error.message) : nav('/exhibits')
  }
  const canEdit = user && (user.id === x.creator_id || isAdmin)
  return (
    <article className="detail">
      {x.image_url && <img src={x.image_url} alt={x.title} />}
      <div>
        <h1>{x.title}</h1>
        <p className="meta">{x.year_created} · {x.category} · Бүтээгч: {x.profiles?.display_name || '—'}</p>
        <p>{x.description}</p>
        {x.technology_stack && <p><b>Технологи:</b> {x.technology_stack}</p>}
        <p>{x.demo_url && <a href={x.demo_url} target="_blank" rel="noreferrer">Demo</a>} {x.github_url && <a href={x.github_url} target="_blank" rel="noreferrer">GitHub</a>}</p>
        {canEdit && <p><Link className="btn" to={`/exhibits/${id}/edit`}>Засах</Link> <button className="danger" onClick={del}>Устгах</button></p>}
      </div>
    </article>
  )
}

export function ExhibitForm() {
  const { id } = useParams(), { user } = useAuth(), nav = useNavigate()
  const [f, setF] = useState({ title: '', description: '', category: '', technology_stack: '', year_created: new Date().getFullYear(), demo_url: '', github_url: '', image_url: '' })
  const [file, setFile] = useState(null), [cats, setCats] = useState([]), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => {
    supabase.from('exhibition_categories').select('name').then((r) => setCats(r.data || []))
    if (id) supabase.from('exhibits').select('*').eq('id', id).single().then((r) => r.data && setF(r.data))
  }, [id])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      const row = { title: f.title, description: f.description, category: f.category || null, technology_stack: f.technology_stack,
        year_created: Number(f.year_created), demo_url: f.demo_url || null, github_url: f.github_url || null, image_url: f.image_url }
      if (file) row.image_url = await uploadImage(file, user.id)
      const { data, error } = id ? await supabase.from('exhibits').update(row).eq('id', id).select().single()
        : await supabase.from('exhibits').insert(row).select().single()
      if (error) throw error
      nav(`/exhibits/${data.id}`)
    } catch (err) { setMsg(err.message); setBusy(false) }
  }
  return (
    <form className="card form" onSubmit={submit}>
      <h1>{id ? 'Бүтээл засах' : 'Бүтээл нэмэх'}</h1>
      <label>Нэр<input required value={f.title} onChange={set('title')} /></label>
      <label>Тайлбар<textarea rows="4" value={f.description || ''} onChange={set('description')} /></label>
      <label>Ангилал<select value={f.category || ''} onChange={set('category')}><option value="">—</option>{cats.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
      <label>Ашигласан технологи<input value={f.technology_stack || ''} onChange={set('technology_stack')} placeholder="React, Supabase" /></label>
      <label>Он<input type="number" min="1990" max="2100" required value={f.year_created} onChange={set('year_created')} /></label>
      <label>Demo холбоос<input type="url" value={f.demo_url || ''} onChange={set('demo_url')} /></label>
      <label>GitHub холбоос<input type="url" value={f.github_url || ''} onChange={set('github_url')} /></label>
      <label>Зураг<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} /></label>
      {msg && <p className="msg">{msg}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Хадгалж байна…' : 'Хадгалах'}</button>
    </form>
  )
}
