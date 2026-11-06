import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

const base = 'https://www.ufe.edu.mn/c/'
const programs = [
  { t: '“Мэдээллийн систем”-ийн магистрын хөтөлбөр', href: encodeURI(base + '6/Магистр/i/80/Мэдээллийн системийн менежмент') },
  { t: '“Мэдээллийн систем”-ийн бакалаврын үндсэн хөтөлбөр', href: encodeURI(base + '7/Бакалавр/i/61/Мэдээллийн систем') },
  { t: '“Дата аналитик” олон улсын диплом олгох BTEC хөтөлбөр' },
  { t: '“Мэдээллийн систем”-ийн олон улсын хамтарсан 2+2 хөтөлбөр' },
]
const research = ['Өгөгдлийн менежмент ба агуулах, өгөгдөл олборлолт', 'Процесс менежмент ба загварчлал', 'Байгууллагын бизнес процессын шинжилгээ',
  'Мэдээллийн системийн стратеги', 'Мэдээллийн технологийн засаглал', 'Байгууллагын мэдлэгийн менежмент', 'Цахим сургалт, мобайлд суурилсан үйлчилгээ',
  'Интернэт худалдаа, цахим бизнес', 'Удирдлагын мэдээллийн систем', 'Бизнесийн тандан шинжилгээ, өгөгдлийн агуулах']

export default function About() {
  const [stages, setStages] = useState(null), [events, setEvents] = useState([])
  useEffect(() => {
    supabase.from('department_history').select('*').order('year').then((r) => setStages(r.data || []))
    supabase.from('events').select('id,title,event_date').order('event_date').then((r) => setEvents(r.data || []))
  }, [])
  return (
    <>
      <section className="about-hero">
        <img src="/about/department.jpg" alt="Мэдээллийн системийн менежментийн тэнхимийн багш нар" />
        <div><h1>Мэдээллийн системийн менежментийн тэнхим</h1><p className="slogan">Технологийн дэвшлээр хөгжлийг хурдасгана.</p></div>
      </section>
      <div className="two">
        <div className="card pad"><h2>Эрхэм зорилго</h2><p>Салбартаа хүлээн зөвшөөрөгдсөн, сургалт, судалгаа шинжилгээний энтрепренер их сургууль болсон байна.</p></div>
        <div className="card pad"><h2>Алсын хараа</h2><p>Өндөр түвшний технологийн үйлдвэрлэл, менежментээр олон улсад үнэлэгдэхүйц манлайлагчдыг бэлтгэх замаар нийгмийн эерэг шинэчлэл, хөгжилд хувь нэмэр оруулна.</p></div>
      </div>
      <h2>Тэнхимийн түүх</h2>
      {stages === null ? <p className="note">Ачаалж байна…</p> : stages.length === 0 ? <p className="note">Хөгжлийн үе шатуудын мэдээлэл удахгүй нэмэгдэнэ.</p> :
        <ol className="tl">{stages.map((s) => <li key={s.id}><span className="year">{s.year}</span><div><b>{s.title}</b><p className="meta">{s.description}</p></div></li>)}</ol>}
      {events.length > 0 && <><h3>Онцлох үйл явдлууд</h3><ul className="plain">{events.map((e) => <li key={e.id}><span className="meta">{e.event_date}</span> <Link to={`/events/${e.id}`}>{e.title}</Link></li>)}</ul></>}
      <h2>Хөтөлбөрүүд</h2>
      <ul className="plain">{programs.map((p) => <li key={p.t}>{p.href ? <a href={p.href} target="_blank" rel="noreferrer">{p.t}</a> : p.t}</li>)}</ul>
      <h2>Судалгааны ажлын тэргүүлэх чиглэл</h2>
      <p>{research.map((r) => <span key={r} className="chip event">{r}</span>)}</p>
      <h2>Холбоо барих</h2>
      <div className="card pad contact">
        <p>Хаяг: С байрны 2-р давхар 205 тоот</p>
        <p>Э-мэйл: <a href="mailto:ism_dpt@ufe.edu.mn">ism_dpt@ufe.edu.mn</a></p>
        <p>Instagram: <a href="https://www.instagram.com/ufe_ismd/" target="_blank" rel="noreferrer">ufe_ismd</a></p>
        <p>Facebook: Мэдээллийн систем хөтөлбөр</p>
      </div>
    </>
  )
}
