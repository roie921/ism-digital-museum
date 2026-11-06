-- Тэнхимийн түүхийн хүснэгт (SQL Editor дээр ажиллуулна)
create table if not exists department_history(id serial primary key, year int not null, title text not null, description text);
alter table department_history enable row level security;
create policy "history read" on department_history for select using (true);
create policy "history admin" on department_history for all to authenticated using (is_admin()) with check (is_admin());
-- Бодит мэдээллээ ингэж нэмнэ (жишээ, өөрийн мэдээллээр солино):
-- insert into department_history(year,title,description) values (2000,'Тэнхим үүссэн','Товч тайлбар...');
