import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabase'

function useRows(build, deps = []) {
  const [rows, setRows] = useState(null)
  useEffect(() => { build().then((r) => setRows(r.data || [])) }, deps)
  return rows
}

export function Home() {
  const latest = useRows(() => supabase.from('exhibits').select('id,title,image_url,year_created').order('created_at', { ascending: false }).limit(4))
  return (
    <>
      <section className="hero">
        <h1>Тэнхимийн түүх, багш нар, бүтээлүүд — нэг музейд.</h1>
        <p>ISM Digital Museum-д оюутнуудын бүтээл, тэнхимийн арга хэмжээ, технологийн хөгжлийг он цагийн дарааллаар үзнэ.</p>
        <Link className="btn" to="/timeline">ISM Time Machine нээх</Link> <Link className="btn ghost" to="/exhibits">Үзмэр үзэх</Link>
      </section>
      <h2>Сүүлд нэмэгдсэн</h2>
      {!latest ? <p className="note">Ачаалж байна…</p> : latest.length === 0 ? <p className="note">Одоогоор үзмэр алга. Нэвтэрч эхний бүтээлээ нэмээрэй.</p> :
        <div className="grid">{latest.map((x) => <Link key={x.id} to={`/exhibits/${x.id}`} className="card">{x.image_url && <img src={x.image_url} alt={x.title} />}<div className="pad"><h3>{x.title}</h3><p className="meta">{x.year_created}</p></div></Link>)}</div>}
    </>
  )
}

export function Teachers() {
  const rows = useRows(() => supabase.from('teachers').select('*').order('id'))
  if (!rows) return <p className="note">Ачаалж байна…</p>
  return (<><h1>Тэнхимийн багш нар</h1><div className="grid people">{rows.map((t) => (
    <div key={t.id} className="card person">
      {t.photo_url ? <img className="avatar" src={t.photo_url} alt={t.name} /> : <span className="avatar ph">{t.name.slice(0, 1)}</span>}
      <h3>{t.name}</h3><p className="meta">{t.position}</p></div>))}</div></>)
}

export function Events() {
  const rows = useRows(() => supabase.from('events').select('*').order('event_date', { ascending: false }))
  if (!rows) return <p className="note">Ачаалж байна…</p>
  return (<><h1>Өдөрлөг, арга хэмжээ</h1><div className="grid events">{rows.map((e) => (
    <Link key={e.id} to={`/events/${e.id}`} className="card">{e.cover_image_url && <img src={e.cover_image_url} alt={e.title} />}
      <div className="pad"><h3>{e.title}</h3><p className="meta">{e.event_date}</p></div></Link>))}</div></>)
}

export function EventDetail() {
  const { id } = useParams(), [e, setE] = useState(null), [photos, setPhotos] = useState([])
  useEffect(() => {
    supabase.from('events').select('*').eq('id', id).maybeSingle().then((r) => setE(r.data))
    supabase.from('event_photos').select('*').eq('event_id', id).then((r) => setPhotos(r.data || []))
  }, [id])
  if (!e) return <p className="note">Ачаалж байна…</p>
  return (<>
    <article className="detail">
      {e.cover_image_url && <img src={e.cover_image_url} alt={e.title} />}
      <div><h1>{e.title}</h1><p className="meta">{e.event_date}</p><p className="pre">{e.description}</p></div>
    </article>
    <h2>Зурагт цомог</h2>{photos.length === 0 ? <p className="note">Зураг одоогоор алга.</p> :
    <div className="grid">{photos.map((p) => <figure key={p.id} className="card"><img src={p.image_url} alt={p.caption || ''} loading="lazy" /><figcaption className="pad meta">{p.caption}</figcaption></figure>)}</div>}</>)
}

// ISM Time Machine: арга хэмжээ + бүтээлийг он цагаар нэгтгэсэн timeline
export function Timeline() {
  const [items, setItems] = useState(null), [type, setType] = useState('all')
  useEffect(() => {
    Promise.all([supabase.from('events').select('id,title,event_date'), supabase.from('exhibits').select('id,title,year_created')]).then(([ev, ex]) => {
      const all = [...(ev.data || []).map((e) => ({ y: +e.event_date.slice(0, 4), t: e.title, kind: 'event', to: `/events/${e.id}` })),
        ...(ex.data || []).map((x) => ({ y: x.year_created, t: x.title, kind: 'exhibit', to: `/exhibits/${x.id}` }))].filter((i) => i.y).sort((a, b) => a.y - b.y)
      setItems(all)
    })
  }, [])
  if (!items) return <p className="note">Ачаалж байна…</p>
  const shown = items.filter((i) => type === 'all' || i.kind === type)
  const years = [...new Set(shown.map((i) => i.y))]
  return (<>
    <h1>ISM Time Machine</h1>
    <div className="filters">{[['all', 'Бүгд'], ['event', 'Арга хэмжээ'], ['exhibit', 'Бүтээл']].map(([k, l]) => <button key={k} className={type === k ? 'btn' : 'btn ghost'} onClick={() => setType(k)}>{l}</button>)}</div>
    {years.length === 0 ? <p className="note">Энэ ангилалд бичлэг алга.</p> : <ol className="tl">{years.map((y) => (
      <li key={y}><span className="year">{y}</span><div>{shown.filter((i) => i.y === y).map((i) => <Link key={i.kind + i.to} to={i.to} className={`chip ${i.kind}`}>{i.t}</Link>)}</div></li>))}</ol>}
  </>)
}
