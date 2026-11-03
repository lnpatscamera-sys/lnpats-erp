// @vitest-environment node
import {expect,it,beforeAll,afterAll} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {canOpenOfficerPath,OFFICER_PATHS,isPersonalAccount} from '@/lib/officer-access';
const db=new PGlite();
const me='00000000-0000-0000-0000-000000000001',other='00000000-0000-0000-0000-000000000002';
beforeAll(async()=>{
 await db.exec(`create role authenticated; create role service_role; create schema auth;
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
 create table user_roles(user_id uuid,role text);create table officers(id uuid,user_id uuid);create table supply_requests(id uuid,requested_by uuid);create table daily_reports(id uuid,created_by uuid);create table tickets(id uuid,created_by uuid,reported_by uuid);create table notifications(id uuid,user_id uuid);create table mail_accounts(id uuid,user_id uuid);create table audit_logs(id uuid,user_id uuid);create table training_records(id uuid,officer_id uuid);create table officer_documents(id uuid,officer_id uuid);create table attendance_punches(id uuid,officer_id uuid);
 insert into user_roles values('${me}','officer'),('${other}','system_admin');insert into officers values('${me}','${me}'),('${other}','${other}');
 insert into supply_requests values('${me}','${me}'),('${other}','${other}');insert into daily_reports values('${me}','${me}'),('${other}','${other}');insert into tickets values('${me}','${me}','${me}'),('${other}','${other}','${other}');insert into audit_logs values('${me}','${me}');
 grant select on all tables in schema public to authenticated;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
 `);
 // Run the exact helper and policy section from the shipped migration against deliberately broad permissive policies.
 const sql=readFileSync('drizzle/migrations/0049_officer_personal_access.sql','utf8').split('CREATE OR REPLACE FUNCTION public.command_directory()')[0] ?? '';
 await db.exec(sql);
 await db.exec(`alter table officers add photo_url text;alter table officer_documents add bucket_id text,add file_url text;alter table training_records add attachments jsonb default '[]';alter table daily_reports add attachments jsonb default '[]';alter table supply_requests add attachments jsonb default '[]';create table erp_documents(id uuid,author_id uuid);create table document_versions(document_id uuid,file_path text);create schema storage;create table storage.objects(bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select on storage.objects to authenticated;create policy broad_file_read on storage.objects for select to authenticated using(true);
 insert into officer_documents values('${me}','${me}','officer-files','own.pdf'),('${other}','${other}','officer-files','other.pdf');insert into storage.objects values('officer-files','own.pdf'),('officer-files','other.pdf');`);
 const fileSql=readFileSync('drizzle/migrations/0051_officer_private_file_scope.sql','utf8').split('DO $$')[0] ?? '';
 await db.exec(fileSql);
 for(const table of ['user_roles','officers','supply_requests','daily_reports','tickets','audit_logs'])await db.exec(`create policy broad_read on ${table} for select to authenticated using(true)`);
 await db.exec(`set role authenticated;set test.uid='${me}';`);
},30000);
afterAll(()=>db.close());
it('allows precisely the Officer workspace pages',()=>{expect(OFFICER_PATHS).toEqual(['/dashboard','/ict','/command','/equipment-request','/supplies','/manual','/classroom','/mail','/my-activities']);for(const path of OFFICER_PATHS)expect(canOpenOfficerPath(['officer'],path)).toBe(true)});
it.each(['/hr','/finance','/procurement','/training','/audit','/officers','/organization','/security','/admin/users','/officers/other','/search','/inventory'])('blocks Officer direct URL %s',path=>expect(canOpenOfficerPath(['officer'],path)).toBe(false));
it('retains privileges for explicitly assigned additional roles',()=>{expect(isPersonalAccount(['officer','hr_admin'])).toBe(false);expect(canOpenOfficerPath(['officer','system_admin'],'/hr')).toBe(true)});
it.each(['supply_requests','daily_reports','tickets','officers'])('reads only own %s despite a permissive read policy',async table=>{const r=await db.query<{id:string}>(`select id from ${table}`);expect(r.rows.map(x=>x.id)).toEqual([me])});
it('does not expose audit logs even when the officer is the actor',async()=>expect((await db.query('select * from audit_logs')).rows).toEqual([]));
it('retains higher-role record visibility',async()=>{await db.exec(`set test.uid='${other}'`);expect((await db.query('select * from supply_requests')).rows).toHaveLength(2);await db.exec(`set test.uid='${me}'`)});
it('prevents direct edits to other request records',async()=>{await db.exec('reset role; grant update on supply_requests to authenticated;create policy broad_write on supply_requests for update to authenticated using(true) with check(true);set role authenticated');expect((await db.query(`update supply_requests set requested_by=$1 where id=$2 returning id`,[me,other])).rows).toEqual([])});
it('allows own private files but blocks another officer file despite broad storage policy',async()=>{expect((await db.query<{name:string}>('select name from storage.objects')).rows.map(r=>r.name)).toEqual(['own.pdf'])});
it('gives ICT Officer-only accounts the focused workspace',()=>{expect(canOpenOfficerPath(['officer','ict_officer'],'/ict')).toBe(true);expect(canOpenOfficerPath(['officer','ict_officer'],'/hr')).toBe(false);expect(canOpenOfficerPath(['ict_officer','ict_admin'],'/hr')).toBe(true)});
