// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db=new PGlite();
const user='00000000-0000-0000-0000-000000000001', reviewer='00000000-0000-0000-0000-000000000002', outsider='00000000-0000-0000-0000-000000000003', deputy='00000000-0000-0000-0000-000000000004';
const emp='00000000-0000-0000-0000-000000000010', boss='00000000-0000-0000-0000-000000000020', office='00000000-0000-0000-0000-000000000030', section='00000000-0000-0000-0000-000000000040';
beforeAll(async()=>{
 await db.exec(`CREATE ROLE authenticated; CREATE ROLE anon; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE SCHEMA storage;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
 CREATE TYPE app_role AS ENUM('system_admin','officer','section_head','assistant_commissioner','deputy_commandant','dc_admin','commandant','procurement_admin','hr_admin');
 CREATE TABLE user_roles(user_id uuid,role app_role); CREATE TABLE profiles(id uuid,full_name text);
 CREATE FUNCTION has_any_role(uuid,app_role[]) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=$1 AND (role='system_admin' OR role=ANY($2))) $$;
 CREATE FUNCTION has_role(uuid,app_role) RETURNS boolean LANGUAGE sql AS $$ SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=$1 AND role=$2) $$;
 CREATE FUNCTION officer_personal_only() RETURNS boolean LANGUAGE sql AS $$ SELECT false $$;
 CREATE TABLE offices(id uuid PRIMARY KEY,name text); CREATE TABLE sections(id uuid PRIMARY KEY,name text,office_id uuid,section_head uuid);
 CREATE TABLE officers(id uuid PRIMARY KEY,full_name text,employee_number text,user_id uuid,office_id uuid,section_id uuid,supervisor_id uuid,employment_status text);
 CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),user_id uuid,title text,body text,event_key text,UNIQUE(user_id,event_key));
 CREATE TABLE storage.objects(name text,bucket_id text);
 CREATE FUNCTION audit_trigger() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN coalesce(NEW,OLD); END $$;
 INSERT INTO offices VALUES('${office}','Test office'); INSERT INTO sections VALUES('${section}','Test section','${office}','${boss}');
 INSERT INTO officers VALUES('${emp}','Staff','EMP-1','${user}','${office}','${section}','${boss}','Active'),('${boss}','Supervisor','EMP-2','${reviewer}','${office}','${section}',null,'Active');
 INSERT INTO user_roles VALUES('${reviewer}','system_admin'),('${user}','officer'),('${deputy}','deputy_commandant'); INSERT INTO profiles VALUES('${user}','Staff'),('${reviewer}','Supervisor'); SET test.uid='${reviewer}';`);
 await db.exec(readFileSync('drizzle/migrations/0032_command_reporting.sql','utf8'));
 await db.exec(readFileSync('drizzle/migrations/0061_compilation_center.sql','utf8'));
 await db.exec(`INSERT INTO reporting_lines(kind,office_id,officer_id) VALUES('Department Head','${office}','${boss}'),('Deputy Commandant',null,'${boss}'),('Commandant',null,'${boss}'); SET test.uid='${user}';`);
},30000);
afterAll(()=>db.close());
let reportId:string; let compilationId:string;
it('compiles with the LNPATS-DR reference format and notifies the next level',async()=>{
 const r=await db.query<{id:string}>(`select daily_report_action(null,'submit',$1) id`,[{report_date:'2026-10-23',duty_assignment:'Duty',activities:'Work',signature:'Staff'}]);
 reportId=r.rows[0]?.id??'';
 await db.exec(`SET test.uid='${reviewer}'`);
 const c=await db.query<{id:string}>(`select compile_daily_reports($1) id`,[{title:'Daily package',period:'Sectional Report',start_date:'2026-10-23',end_date:'2026-10-23',source_ids:[reportId],signature:'Supervisor',summary:'Summary text',remarks:'Remarks',statistics:{reports:1}}]);
 compilationId=c.rows[0]?.id??'';
 const row=await db.query<{report_number:string;status:string;summary:string;signed_at:string|null}>('select report_number,status,summary,signed_at from compiled_reports where id=$1',[compilationId]);
 expect(row.rows[0]?.report_number).toMatch(/^LNPATS-DR-\d{8}-\d{3}$/);
 expect(row.rows[0]?.summary).toBe('Summary text');
 expect(row.rows[0]?.signed_at).not.toBeNull();
 const notice=await db.query<{n:number}>(`select count(*)::int n from notifications where user_id='${reviewer}' and title='A compiled daily report package has been submitted for your review.'`);
 expect(notice.rows[0]?.n).toBe(1);
});
it('rejects compilation when no reports are selected',async()=>{
 await expect(db.query(`select compile_daily_reports($1)`,[{title:'Empty',period:'Sectional Report',start_date:'2026-10-23',end_date:'2026-10-23',source_ids:[],signature:'Supervisor'}])).rejects.toThrow('Unable to compile. No reports available or reporting chain not configured.');
});
it('blocks compilation actions by unrelated accounts',async()=>{
 await db.exec(`SET test.uid='${outsider}'`);
 await expect(db.query(`select compilation_action($1,'approve','{}')`,[compilationId])).rejects.toThrow('Only the assigned reviewer');
 await db.exec(`SET test.uid='${reviewer}'`);
});
it('requires a reason to return or request clarification',async()=>{
 await expect(db.query(`select compilation_action($1,'return','{}')`,[compilationId])).rejects.toThrow('Reason required');
 await expect(db.query(`select compilation_action($1,'clarify','{}')`,[compilationId])).rejects.toThrow('Reason required');
 await db.query(`select compilation_action($1,'clarify',$2)`,[compilationId,{note:'Explain staffing'}]);
 expect((await db.query<{status:string}>('select status from compiled_reports where id=$1',[compilationId])).rows[0]?.status).toBe('Clarification Requested');
});
it('forwards upward along the reporting chain and approves at the top',async()=>{
 await db.exec(`UPDATE compiled_reports SET source_snapshots=jsonb_set(source_snapshots,'{0,chain}','[{"level":"Supervisor","user_id":"${reviewer}"},{"level":"Deputy Commandant","user_id":"${deputy}"}]') WHERE id='${compilationId}'`);
 await db.query(`select compilation_action($1,'forward','{}')`,[compilationId]);
 const fwd=await db.query<{status:string;recipient_id:string}>('select status,recipient_id from compiled_reports where id=$1',[compilationId]);
 expect(fwd.rows[0]?.status).toBe('Forwarded');
 expect(fwd.rows[0]?.recipient_id).not.toBe(reviewer);
 await db.query(`select compilation_action($1,'approve','{}')`,[compilationId]);
 expect((await db.query<{status:string}>('select status from compiled_reports where id=$1',[compilationId])).rows[0]?.status).toBe('Approved');
 const notice=await db.query<{n:number}>(`select count(*)::int n from notifications where user_id='${reviewer}' and title='Compiled report approved'`);
 expect(notice.rows[0]?.n).toBe(1);
});
