"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ResourceTable, { type Column, type Filter } from "./ResourceTable";
import { api, Button, Modal, PageHeader } from "./ui";
import { FieldGrid } from "./fields";
import type { Field } from "@/lib/sections";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** List + create/edit modal for simple collections (categories, testimonials, redirects, users). */
export default function ModalCrud({
  resource, title, description, singular, columns, fields, defaults, filters, prepare, load, canDelete, empty,
}: {
  resource: string;
  title: string;
  description?: ReactNode;
  singular: string;
  columns: Column[];
  fields: Field[] | ((item: any) => Field[]);
  defaults: Record<string, any>;
  filters?: Filter[];
  prepare?: (item: any) => any;
  load?: (item: any) => any;
  canDelete?: boolean | ((item: any) => boolean);
  empty?: ReactNode;
}) {
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  async function open(item?: any) {
    if (!item) return setEditing(structuredClone(defaults));
    // List rows only carry some fields, so load the full document
    try {
      const j = await api(`/api/admin/c/${resource}/${item._id}`);
      const full = { ...defaults, ...j.item };
      setEditing(load ? load(full) : full);
    } catch {}
  }

  async function save() {
    setSaving(true);
    try {
      const body = prepare ? prepare(editing) : editing;
      if (editing._id) await api(`/api/admin/c/${resource}/${editing._id}`, { method: "PUT", body });
      else await api(`/api/admin/c/${resource}`, { method: "POST", body });
      toast.success("Saved");
      setEditing(null);
      setReload((r) => r + 1);
    } catch {
    } finally {
      setSaving(false);
    }
  }

  const fieldList = typeof fields === "function" ? (editing ? fields(editing) : []) : fields;

  return (
    <div>
      <PageHeader title={title} description={description} actions={<Button onClick={() => open()}><Plus className="size-4" /> Add {singular}</Button>} />
      <ResourceTable resource={resource} columns={columns} filters={filters} onEdit={open} reloadKey={reload} canDelete={canDelete} empty={empty} />
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._id ? `Edit ${singular}` : `New ${singular}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        {editing && <FieldGrid fields={fieldList} data={editing} onChange={setEditing} />}
      </Modal>
    </div>
  );
}
