"use client";

import ModalCrud from "@/components/admin/ModalCrud";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  return (
    <ModalCrud
      resource="users"
      title="Users"
      singular="user"
      description="Admins can manage everything. Editors can manage content, media and leads, but not settings or users."
      defaults={{ name: "", email: "", role: "editor", active: true, password: "" }}
      load={(u) => ({ ...u, password: "" })}
      prepare={({ password, ...u }) => (password ? { ...u, password } : u)}
      fields={(u) => [
        { name: "name", label: "Name", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "role", label: "Role", type: "select", options: [{ value: "editor", label: "Editor" }, { value: "admin", label: "Admin" }] },
        { name: "active", label: "Active (can sign in)", type: "toggle" },
        { name: "password", label: u._id ? "New password (leave empty to keep current)" : "Password", type: "text", help: "At least 8 characters.", full: true },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", render: (u) => <span className="capitalize">{u.role}</span> },
        { key: "lastLogin", label: "Last login", hideOnMobile: true, render: (u) => <span className="text-xs text-ink/50">{u.lastLogin ? formatDate(u.lastLogin) : "Never"}</span> },
        { key: "active", label: "Status", render: (u) => (u.active ? <span className="text-xs font-semibold text-green-700">Active</span> : <span className="text-xs text-ink/45">Disabled</span>) },
      ]}
    />
  );
}
