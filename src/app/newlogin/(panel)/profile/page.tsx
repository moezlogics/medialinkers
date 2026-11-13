"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, Button, Card, Field, Input, PageHeader, Textarea } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/MediaLibrary";

export default function ProfilePage() {
  const [me, setMe] = useState({ name: "", email: "", role: "" });
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/admin/me")
      .then((j) => {
        setMe(j.user);
        setBio(j.user.bio || "");
        setAvatar(j.user.avatar || "");
      })
      .catch(() => {});
  }, []);

  async function saveProfile() {
    setSaving(true);
    try {
      await api("/api/admin/me", { method: "PUT", body: { name: me.name, bio, avatar } });
      toast.success("Profile saved");
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (pw.newPassword !== pw.confirm) return toast.error("New passwords do not match");
    if (pw.newPassword.length < 8) return toast.error("Use at least 8 characters");
    try {
      await api("/api/admin/me", { method: "PUT", body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed");
    } catch {}
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="My profile" description={`${me.email} · ${me.role}`} />
      <div className="space-y-4">
        <Card title="Profile" description="Your name and bio appear as the author on blog posts you write.">
          <div className="grid gap-4">
            <Field label="Name"><Input value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} /></Field>
            <Field label="Short bio"><Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="SEO strategist with 10 years of experience…" /></Field>
            <ImageField label="Photo" value={avatar} onChange={setAvatar} />
            <div><Button onClick={saveProfile} loading={saving}>Save profile</Button></div>
          </div>
        </Card>
        <Card title="Change password">
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); changePassword(); }}>
            <Field label="Current password"><Input type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
            <Field label="New password"><Input type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
            <Field label="Confirm new password"><Input type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            <div className="sm:col-span-3"><Button type="submit" variant="dark">Update password</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}
