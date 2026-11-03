import { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  ICT_PRIORITIES,
  INCIDENT_CATEGORIES,
  ictAction,
  ticketActions,
  type ICTData,
} from "@/lib/ict";
import { HRTable } from "./HRShared";
import { ICTForm, ICTDetail, useICTMutation, type FormField } from "./ICTShared";
import { options } from "./ProcurementShared";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { StatusBadge } from "./AppShell";
type Ticket = ICTData["tickets"][number];
export function ICTTickets({ d }: { d: ICTData }) {
  const { session, hasAny } = useAuth();
  const staff = hasAny(["ict_admin"]);
  const mutation = useICTMutation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<Ticket | null>(null);
  const [form, setForm] = useState<{
    title: string;
    fields: FormField[];
    run: (v: Record<string, string>) => Promise<void>;
  } | null>(null);
  const person = (id: string | null) => d.directory.find((o) => o.id === id)?.full_name ?? "—";
  const techs = d.directory
    .filter((o) => o.is_technician)
    .map((o) => ({ value: o.id, label: o.full_name }));
  const report = (t: Ticket) => ({
    Number: t.ticket_number,
    Subject: t.subject,
    Requester: t.requester_name ?? person(t.reported_by),
    Category: t.issue_type,
    Priority: t.priority,
    Status: t.status,
    Technician: person(t.assigned_to),
    Submitted: t.created_at,
    Resolved: t.resolved_at,
  });
  const act = (t: Ticket, action: string) => {
    const fields: FormField[] =
      action === "assign"
        ? [{ name: "technician_id", label: "Technician", options: techs, required: true }]
        : action === "status"
          ? [
              {
                name: "outcome",
                label: "Ticket outcome",
                options: options([
                  "Resolved",
                  "Pending",
                  "In Progress",
                  "Transfer to another technician",
                ]),
                required: true,
              },
              {
                name: "technician_id",
                label: "Transfer to technician (only when transferring)",
                options: techs.filter((x) => x.value !== t.assigned_to),
              },
              {
                name: "note",
                label: "Technician comment (what was found / done / why)",
                type: "textarea",
                required: true,
              },
            ]
          : [
              {
                name: "note",
                label: action === "note" ? "Note" : "Comment",
                type: "textarea",
                required: action === "note",
              },
            ];
    setForm({
      title: `${action === "status" ? "Update / Comment" : action === "assign" ? "Assign technician" : action === "note" ? "Add note" : action === "close" ? "Close ticket" : "Reopen ticket"} · ${t.ticket_number}`,
      fields,
      run: async (v) => {
        if (action === "status") {
          if (v.outcome === "Transfer to another technician") {
            if (!v.technician_id) throw new Error("Select the technician to transfer to");
            await ictAction("tickets", t.id, "assign", {
              technician_id: v.technician_id,
              note: `Transferred from ${person(t.assigned_to)} to ${person(v.technician_id)}: ${v.note}`,
            });
            return;
          }
          await ictAction("tickets", t.id, "status", {
            status: v.outcome,
            note: `${v.outcome}: ${v.note}`,
          });
          return;
        }
        await ictAction("tickets", t.id, action, v);
      },
    });
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Input
          aria-label="Search tickets"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          aria-label="Ticket status"
          className="border bg-background rounded-md px-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {["Open", "Assigned", "In Progress", "Pending", "Resolved", "Closed"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <HRTable
        title="Tickets"
        rows={d.tickets.filter(
          (t) =>
            (!status || t.status === status) &&
            JSON.stringify(report(t)).toLowerCase().includes(search.toLowerCase()),
        )}
        columns={[
          {
            label: "Ticket",
            render: (t) => (
              <div>
                <span className="text-xs text-muted-foreground">{t.ticket_number}</span>
                <div className="font-medium max-w-64 break-words">{t.subject ?? t.description}</div>
              </div>
            ),
          },
          { label: "Requester", render: (t) => t.requester_name ?? person(t.reported_by) },
          { label: "Priority", render: (t) => <StatusBadge value={t.priority ?? "Medium"} /> },
          { label: "Status", render: (t) => <StatusBadge value={t.status ?? "Open"} /> },
          { label: "Technician", render: (t) => person(t.assigned_to) },
        ]}
        report={report}
        onView={setView}
        onNew={() =>
          setForm({
            title: "Submit ticket",
            fields: [
              { name: "subject", label: "Subject", required: true },
              {
                name: "requester_name",
                label: "Requester name",
                value: d.directory.find((o) => o.user_id === session?.user.id)?.full_name,
              },
              {
                name: "department_id",
                label: "Department",
                options: d.offices.map((o) => ({ value: o.id, label: o.name })),
              },
              { name: "phone", label: "Phone number", type: "tel" },
              { name: "email", label: "Email", type: "email", value: session?.user.email },
              {
                name: "category",
                label: "Category",
                options: options(INCIDENT_CATEGORIES),
                required: true,
              },
              {
                name: "priority",
                label: "Priority",
                options: options(ICT_PRIORITIES),
                value: "Medium",
                required: true,
              },
              { name: "description", label: "Description", type: "textarea", required: true },
            ],
            run: async (v) => {
              await ictAction("tickets", null, "create", v);
            },
          })
        }
        actions={(t) =>
          ticketActions(
            t.status ?? "Open",
            staff,
            t.created_by === session?.user.id ||
              d.directory.some((o) => o.id === t.reported_by && o.user_id === session?.user.id),
          ).map((a) => (
            <Button
              key={a}
              variant="outline"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => act(t, a)}
            >
              {a === "status"
                ? "Update"
                : a === "note"
                  ? "Note"
                  : a === "assign"
                    ? "Assign"
                    : a === "close"
                      ? "Close"
                      : "Reopen"}
            </Button>
          ))
        }
      />
      {form && (
        <ICTForm
          title={form.title}
          fields={form.fields}
          onClose={() => setForm(null)}
          onSave={form.run}
        />
      )}{" "}
      {view && (
        <ICTDetail
          title={view.ticket_number ?? "Ticket"}
          values={{
            ...report(view),
            Description: view.description,
            Phone: view.phone,
            Email: view.email,
          }}
          history={view.history}
          onClose={() => setView(null)}
        />
      )}
    </div>
  );
}
