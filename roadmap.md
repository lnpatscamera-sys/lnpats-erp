# LNPATS ERP Roadmap

## Phase 1 (now)
- [x] Add Instructor role, restricted personal workspace, assigned-course teaching tools and HR-supervisor reporting chain; permission tests and signed-in lesson creation verified.
- [ ] Verify the Instructor-only workspace with a real assigned Instructor account — HR must approve an Instructor appointment and training administration must link the instructor profile and assign courses; no existing account currently holds Instructor.
- [x] Restrict Officer-only accounts to seven personal areas, enforce owner-only records and private files, and add My Activities. Real Officer session verified personal profile and blocked HR; 45 access/workflow tests passed. Existing mailbox not connected, so real mail remains unverified.
- [x] Restore dashboard rank counts and prevent clipped leave-type labels; verified signed-in desktop and 695px layouts with real records.
- [x] Fix login session request loop and verify signed-in access.
- [x] Logo, theme (LNP navy/gold), favicon
- [x] Sign-in, roles table, offices & sections
- [x] Dashboard with live stats + recent activity
- [x] Officer management (profiles, ID card)
- [x] Leave requests + 5-step approval chain
- [x] Supply requests + approval/collection workflow, inventory
- [x] Audit log

## Later phases
- [ ] Built-in private per-officer official inbox with reading and replies — awaiting mail-host details and an authorized connection to the existing cPanel mailboxes.
- [ ] Connect ICT Helpdesk to real network monitoring and service-account actions — LNPATS uses TP-Link equipment, a "Mikcrotech" router (exact brand/model unconfirmed), Starlink, HP computers, Hikvision cameras/NVR and Canon printers. Waiting for exact device models, authorized management access and confirmation of an always-on on-site monitoring computer. Staff use personal email; an organizational account service must first be selected/provisioned and authorized. Verify real outcomes before marking resolved.
- [ ] Certified signing for command reports and supply approvals — waiting for the organization's signing provider/certificate authority and required certification standard; approvals must bind verified signatures to the exact record revision.
- [x] Command chain: reporting assignments/account linking, daily activity reports and source-report compilation, PDF/Word/print summaries, weekday 3–6 PM Liberia-time in-app alerts, five-step staff supply approvals/corrections, signed pickup with atomic stock deduction, draft shortage procurement links and inventory mapping, restricted command inventory and decision evidence. Signed-in report approval → compilation → Word download and supply shortage → stock mapping → signed collection verified; 150 tests pass; temporary records removed and stock restored.
- [ ] Command-chain setup — HR must add/link actual personnel accounts and assign supervisors, section heads and command appointments; existing sections still need their departments assigned.
- [ ] Command-chain external email/SMS delivery and cryptographic signatures — SMS provider and signing identity are unavailable; email alert triggers remain unconnected. In-app timed alerts are active; never imply external delivery or certified signatures.
- [ ] Expand inventory: required categories, generated item codes, unit costs, dashboard/search, warehouse CRUD, audited adjustments/transfers, PDF/Excel exports, and signed-in verification.
- [x] Protected logistics management screens for items, movements, equipment requests, receipts, issues, suppliers, assets, and vehicle bookings; supplier/asset/booking writes remain system-admin-only.
- [x] Inventory-staff AI discrepancy analysis grounded in audited movements and reconciliations; signed-in gateway analysis and supplier create/update/delete verified.
- [x] Automatically post receipts, issues, and reconciliations to stock with audit history, staff controls, immutable entries, and signed-in verification.
- [x] Add the listed logistics records with protected access, auditing, and compatibility with existing stock and equipment workflows; operational screens and automated logistics posting are not part of this schema stage.
- [x] Phase 2: connected leave HR processing, registry chain, document approvals/revisions/rollback, global search, private uploads, in-app notifications, audit activity, PDF/Excel/print reports and role-aware summaries.
- [x] Managed email infrastructure for notify.lnpats.net; protected preview verified.
- [ ] Phase 2 email notices — templates and workflow send triggers pending; sender domain is verified.
- [ ] Cryptographic document signatures — currently recorded signer names only; requires the organization's signing identity/certificate provider.
- [x] Extend ERP schema from supplied SQL without replacing existing workflows; match the supplied offices and sections.
- [x] Training module: cadet registration, programs & courses, instructors, attendance registers with absence flags, assessments & results, graduation decisions with certificates and QR verification, dashboards and PDF/Excel reports.
- [x] Finance module: budgets, monitoring alerts, expenses with documents, revenue receipts, cash advances, procurement funding, approval timelines, reports and audit trail.
- [x] Procurement screens: vendors, requisitions, RFQs/comparison, orders, goods receipts, contracts, ratings, dashboard/reports; signed-in request → quotation → approved/sent order → approved receipt → completion/rating and contract renewal verified; PDF/Excel downloaded; temporary operational records removed, audit retained.
- [x] Purchase-order email action connected to verified notify.lnpats.net; delivery not exercised because no recipient was authorized for a test email.
- [ ] Conditional Director procurement approval — waits for the Director role and approval trigger from the organization.
- [x] HR screens: canonical employee registry/files, recruitment, manual/self/QR attendance, two-stage HR leave and recall, appraisals, promotion/transfer decisions, training, discipline, payroll summaries and PDF/Excel/print reports. Signed-in employee/vacancy/attendance/promotion/leave/recall/payroll/appraisal/export verified; temporary records removed and audit retained; 119 tests passed.
- [ ] HR recall entitlement restoration — organizational policy needed; recall currently records the event without crediting unused leave days.
- [ ] External payroll provider linkage — provider and payroll calculation rules needed; current HR payroll is a manually entered salary summary, not payment execution.
- [x] ICT Helpdesk: protected tickets, supervisor-approved service requests, incidents, canonical ICT assets/history, manual network/account registries, maintenance, knowledge base and reports. Signed-in ticket resolution/closure, incident closure, check-in, asset assignment, knowledge publication and Excel download verified; temporary records removed and audit retained; permission tests pass.
- [ ] ICT live monitoring and external account execution — network monitoring and email/directory account providers must be supplied; current checks, uptime and account reset/unlock actions do not execute against external systems.
- [x] Facility Management work orders (report → Facility Manager assigns technician → completed → requester confirms) and ISS suite (visitors, vehicle gate log, duty roster, Occurrence Book).
- [ ] Assign Facility Manager and ISS Officer roles to real staff in Users & Roles.
- [ ] Transport (outside Phase 2 scope)
