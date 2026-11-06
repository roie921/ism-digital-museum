-- Supabase > SQL Editor дээр бүтнээр нь ажиллуулна
create table profiles(id uuid primary key references auth.users on delete cascade, display_name text, avatar_url text, role text not null default 'student' check (role in ('student','admin')), created_at timestamptz default now());
create table exhibition_categories(id serial primary key, name text unique not null, description text);
create table exhibits(id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, category text references exhibition_categories(name), technology_stack text, year_created int, creator_id uuid references profiles(id) on delete set null default auth.uid(), demo_url text, github_url text, status text not null default 'published', created_at timestamptz default now());
create table teachers(id serial primary key, name text not null, position text, courses text, bio text, photo_url text);
create table events(id serial primary key, title text not null, event_date date not null, description text, cover_image_url text);
create table event_photos(id serial primary key, event_id int references events(id) on delete cascade, image_url text not null, caption text);

create function is_admin() returns boolean language sql security definer stable as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles(id,display_name) values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))) on conflict (id) do nothing; return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table profiles enable row level security; alter table exhibition_categories enable row level security; alter table exhibits enable row level security;
alter table teachers enable row level security; alter table events enable row level security; alter table event_photos enable row level security;

create policy "profiles read" on profiles for select using (true);
create policy "profiles update own" on profiles for update using (id=auth.uid()) with check (id=auth.uid() and role=(select role from profiles where id=auth.uid()));
create policy "exhibits read" on exhibits for select using (status='published' or creator_id=auth.uid() or is_admin());
create policy "exhibits insert own" on exhibits for insert to authenticated with check (creator_id=auth.uid());
create policy "exhibits update own" on exhibits for update to authenticated using (creator_id=auth.uid() or is_admin()) with check (creator_id=auth.uid() or is_admin());
create policy "exhibits delete own" on exhibits for delete to authenticated using (creator_id=auth.uid() or is_admin());
create policy "cat read" on exhibition_categories for select using (true);
create policy "cat admin" on exhibition_categories for all to authenticated using (is_admin()) with check (is_admin());
create policy "teachers read" on teachers for select using (true);
create policy "teachers admin" on teachers for all to authenticated using (is_admin()) with check (is_admin());
create policy "events read" on events for select using (true);
create policy "events admin" on events for all to authenticated using (is_admin()) with check (is_admin());
create policy "photos read" on event_photos for select using (true);
create policy "photos admin" on event_photos for all to authenticated using (is_admin()) with check (is_admin());

insert into storage.buckets(id,name,public) values('images','images',true) on conflict do nothing;
create policy "images read" on storage.objects for select using (bucket_id='images');
create policy "images upload own folder" on storage.objects for insert to authenticated with check (bucket_id='images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "images delete own" on storage.objects for delete to authenticated using (bucket_id='images' and (storage.foldername(name))[1]=auth.uid()::text);

-- Жишиг өгөгдөл (өөрийн бодит мэдээллээр солино)
insert into exhibition_categories(name,description) values('Вэб систем','Вэб аппликейшн'),('Мобайл','Гар утасны апп'),('Өгөгдлийн шинжилгээ','Дата, BI'),('Судалгаа','Эрдэм шинжилгээ');
insert into teachers(name,position,courses,bio) values('Багшийн нэр 1','Ахлах багш','Internet Programming','Товч танилцуулга...'),('Багшийн нэр 2','Дэд профессор','Өгөгдлийн сан','Товч танилцуулга...');
insert into events(title,event_date,description,cover_image_url) values('ISM өдөрлөг 2024','2024-05-17','Тэнхимийн жил бүрийн өдөрлөг','https://picsum.photos/seed/ism1/800/500'),('Hackathon 2025','2025-03-08','Оюутны технологийн тэмцээн','https://picsum.photos/seed/ism2/800/500');
insert into event_photos(event_id,image_url,caption) select e.id,'https://picsum.photos/seed/p'||n||e.id||'/600/400','Зураг '||n from events e, generate_series(1,4) n;
-- Админ болгох: update profiles set role='admin' where id='<таны user id>';

-- Тэнхимийн түүх (supabase/history.sql-тэй адил)
create table department_history(id serial primary key, year int not null, title text not null, description text);
alter table department_history enable row level security;
create policy "history read" on department_history for select using (true);
create policy "history admin" on department_history for all to authenticated using (is_admin()) with check (is_admin());
