# ISM MUSEUM
Интерактив дижитал музейн веб аппликейшн (React + Vite + Supabase). **Бүтээлч шийдэл: ISM Time Machine** — арга хэмжээ, бүтээлийг он цагийн дарааллаар timeline-д нэгтгэнэ.

## Боломжууд
Үзмэрийн жагсаалт/дэлгэрэнгүй, хайлт (нэр, технологи, он) + ангилал, багш нар, арга хэмжээ + зурагт цомог, бүртгэл/нэвтрэлт, бүтээлийн CRUD + зураг Storage-д, RLS.

## Суулгах
1. supabase.com дээр project үүсгээд `supabase/schema.sql`-ийг SQL Editor-т ажиллуулна.
2. `.env.example`-ийг `.env` болгон хуулж URL, anon key-ээ бөглөнө (service role key ОРУУЛАХГҮЙ).
3. `npm install && npm run dev`
4. Админ болгох: `update profiles set role='admin' where id='<user id>';`

## Deploy
GitHub-д push → vercel.com → Import → Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → Deploy.

## Өгөгдлийн сан
profiles(id→auth.users), exhibits(creator_id→profiles.id, category→exhibition_categories.name), event_photos(event_id→events.id), teachers. Primary key нь мөр бүрийг өвөрмөц тодорхойлж, foreign key нь хүснэгтүүдийг холбоно.
