"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, Color, BackgroundColor, FontFamily, FontSize } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { Placeholder, CharacterCount } from "@tiptap/extensions";
import Youtube from "@tiptap/extension-youtube";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Typography from "@tiptap/extension-typography";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, Code2, Columns3, Eraser, Highlighter, ImageIcon, Italic, Link2, List,
  ListChecks, ListOrdered, Maximize2, Minimize2, Minus, Palette, Quote, Redo2, Rows3, Strikethrough, Subscript as SubIcon,
  Superscript as SupIcon, Table2, Trash2, Underline as UnderlineIcon, Undo2, Unlink, FileCode2, Video as YoutubeIcon, Merge,
} from "lucide-react";
import { MediaPicker } from "./MediaLibrary";
import { cn } from "@/lib/utils";

const FONTS = [
  { label: "Default", value: "" },
  { label: "Display", value: "var(--font-display)" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
];
const SIZES = ["", "14px", "16px", "18px", "20px", "24px", "30px", "36px", "48px"];
const COLORS = ["#0b0b0f", "#5d5d66", "#ff5a1f", "#16a34a", "#2563eb", "#7c3aed", "#dc2626", "#f59e0b", "#ffffff"];

function Btn({ onClick, active, title, children, disabled }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-ink/75 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30", active && "bg-ink text-white hover:bg-ink hover:text-white")}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-0.5 h-6 w-px shrink-0 bg-line" />;

function Toolbar({ editor, source, setSource, full, setFull, onImage }: { editor: Editor; source: boolean; setSource: (v: boolean) => void; full: boolean; setFull: (v: boolean) => void; onImage: () => void }) {
  const [color, setColorOpen] = useState(false);
  const block = editor.isActive("heading", { level: 1 }) ? "h1" : editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : editor.isActive("heading", { level: 4 }) ? "h4" : "p";
  const inTable = editor.isActive("table");
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL (leave empty to remove)", prev);
    if (url === null) return;
    if (!url) return c().extendMarkRange("link").unsetLink().run();
    const external = /^https?:\/\//.test(url) && !url.includes("medialinkers.pk");
    c().extendMarkRange("link").setLink({ href: url, target: external ? "_blank" : null }).run();
  };

  return (
    <div className={cn("sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-white/95 p-1.5 backdrop-blur", full && "top-0")}>
      <Btn title="Undo" onClick={() => c().undo().run()} disabled={!editor.can().undo()}><Undo2 className="size-4" /></Btn>
      <Btn title="Redo" onClick={() => c().redo().run()} disabled={!editor.can().redo()}><Redo2 className="size-4" /></Btn>
      <Sep />
      <select
        aria-label="Text style"
        value={block}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") c().setParagraph().run();
          else c().toggleHeading({ level: Number(v[1]) as 1 | 2 | 3 | 4 }).run();
        }}
        className="h-8 rounded-lg border border-line bg-white px-2 text-sm"
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="h4">Heading 4</option>
      </select>
      <select
        aria-label="Font"
        value={editor.getAttributes("textStyle").fontFamily || ""}
        onChange={(e) => (e.target.value ? c().setFontFamily(e.target.value).run() : c().unsetFontFamily().run())}
        className="h-8 w-24 rounded-lg border border-line bg-white px-2 text-sm"
      >
        {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
      </select>
      <select
        aria-label="Font size"
        value={editor.getAttributes("textStyle").fontSize || ""}
        onChange={(e) => (e.target.value ? c().setFontSize(e.target.value).run() : c().unsetFontSize().run())}
        className="h-8 w-[72px] rounded-lg border border-line bg-white px-2 text-sm"
      >
        {SIZES.map((s) => <option key={s} value={s}>{s || "Size"}</option>)}
      </select>
      <Sep />
      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}><Bold className="size-4" /></Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}><Italic className="size-4" /></Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()}><UnderlineIcon className="size-4" /></Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()}><Strikethrough className="size-4" /></Btn>
      <Btn title="Inline code" active={editor.isActive("code")} onClick={() => c().toggleCode().run()}><Code className="size-4" /></Btn>
      <Btn title="Subscript" active={editor.isActive("subscript")} onClick={() => c().toggleSubscript().run()}><SubIcon className="size-4" /></Btn>
      <Btn title="Superscript" active={editor.isActive("superscript")} onClick={() => c().toggleSuperscript().run()}><SupIcon className="size-4" /></Btn>
      <div className="relative">
        <Btn title="Text color" onClick={() => setColorOpen(!color)}><Palette className="size-4" style={{ color: editor.getAttributes("textStyle").color }} /></Btn>
        {color && (
          <div className="absolute left-0 top-9 z-20 w-48 rounded-xl border border-line bg-white p-2 shadow-xl">
            <p className="mb-1 text-[11px] font-semibold text-ink/50">Text</p>
            <div className="grid grid-cols-9 gap-1">
              {COLORS.map((col) => <button type="button" key={col} onClick={() => { c().setColor(col).run(); setColorOpen(false); }} className="size-4 rounded-full border border-line" style={{ background: col }} aria-label={col} />)}
            </div>
            <p className="mb-1 mt-2 text-[11px] font-semibold text-ink/50">Background</p>
            <div className="grid grid-cols-9 gap-1">
              {COLORS.map((col) => <button type="button" key={col} onClick={() => { c().setBackgroundColor(col).run(); setColorOpen(false); }} className="size-4 rounded border border-line" style={{ background: col }} aria-label={`background ${col}`} />)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input type="color" onChange={(e) => c().setColor(e.target.value).run()} className="h-7 w-10" aria-label="Custom color" />
              <button type="button" onClick={() => { c().unsetColor().unsetBackgroundColor().run(); setColorOpen(false); }} className="text-xs font-semibold text-ink/60 hover:text-ink">Reset</button>
            </div>
          </div>
        )}
      </div>
      <Btn title="Highlight" active={editor.isActive("highlight")} onClick={() => c().toggleHighlight().run()}><Highlighter className="size-4" /></Btn>
      <Sep />
      <Btn title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => c().setTextAlign("left").run()}><AlignLeft className="size-4" /></Btn>
      <Btn title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => c().setTextAlign("center").run()}><AlignCenter className="size-4" /></Btn>
      <Btn title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => c().setTextAlign("right").run()}><AlignRight className="size-4" /></Btn>
      <Btn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => c().setTextAlign("justify").run()}><AlignJustify className="size-4" /></Btn>
      <Sep />
      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}><List className="size-4" /></Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}><ListOrdered className="size-4" /></Btn>
      <Btn title="Checklist" active={editor.isActive("taskList")} onClick={() => c().toggleTaskList().run()}><ListChecks className="size-4" /></Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}><Quote className="size-4" /></Btn>
      <Btn title="Code block" active={editor.isActive("codeBlock")} onClick={() => c().toggleCodeBlock().run()}><Code2 className="size-4" /></Btn>
      <Btn title="Divider" onClick={() => c().setHorizontalRule().run()}><Minus className="size-4" /></Btn>
      <Sep />
      <Btn title="Link" active={editor.isActive("link")} onClick={setLink}><Link2 className="size-4" /></Btn>
      <Btn title="Remove link" onClick={() => c().unsetLink().run()} disabled={!editor.isActive("link")}><Unlink className="size-4" /></Btn>
      <Btn title="Image" onClick={onImage}><ImageIcon className="size-4" /></Btn>
      <Btn
        title="YouTube video"
        onClick={() => {
          const url = window.prompt("YouTube URL");
          if (url) c().setYoutubeVideo({ src: url }).run();
        }}
      >
        <YoutubeIcon className="size-4" />
      </Btn>
      <Btn title="Insert table" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 className="size-4" /></Btn>
      {inTable && (
        <>
          <Btn title="Add column" onClick={() => c().addColumnAfter().run()}><Columns3 className="size-4" /></Btn>
          <Btn title="Add row" onClick={() => c().addRowAfter().run()}><Rows3 className="size-4" /></Btn>
          <Btn title="Merge / split cells" onClick={() => c().mergeOrSplit().run()}><Merge className="size-4" /></Btn>
          <Btn title="Delete column" onClick={() => c().deleteColumn().run()}><span className="text-[10px] font-bold">−C</span></Btn>
          <Btn title="Delete row" onClick={() => c().deleteRow().run()}><span className="text-[10px] font-bold">−R</span></Btn>
          <Btn title="Delete table" onClick={() => c().deleteTable().run()}><Trash2 className="size-4 text-red-600" /></Btn>
        </>
      )}
      <Sep />
      <Btn title="Clear formatting" onClick={() => c().unsetAllMarks().clearNodes().run()}><Eraser className="size-4" /></Btn>
      <Btn title="HTML source" active={source} onClick={() => setSource(!source)}><FileCode2 className="size-4" /></Btn>
      <Btn title={full ? "Exit fullscreen" : "Fullscreen"} onClick={() => setFull(!full)}>{full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</Btn>
    </div>
  );
}

export default function RichEditor({ value, onChange, placeholder = "Start writing…", minHeight = 260 }: { value: string; onChange: (html: string) => void; placeholder?: string; minHeight?: number }) {
  const [source, setSource] = useState(false);
  const [full, setFull] = useState(false);
  const [html, setHtml] = useState(value || "");
  const [picker, setPicker] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] }, link: { openOnClick: false, autolink: true, defaultProtocol: "https" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      BackgroundColor,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      Subscript,
      Superscript,
      Typography,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || "",
    editorProps: { attributes: { class: "rich prose prose-lg max-w-none px-4 py-3 sm:px-5" } },
    onUpdate: ({ editor }) => {
      const out = editor.isEmpty ? "" : editor.getHTML();
      setHtml(out);
      onChange(out);
    },
  });

  // Keep editor in sync if the value is replaced from outside (e.g. after loading)
  useEffect(() => {
    if (editor && value !== html && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      // Syncing with the external editor instance, so state is updated here on purpose
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHtml(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    document.body.style.overflow = full ? "hidden" : "";
  }, [full]);

  const words = editor?.storage.characterCount?.words?.() ?? 0;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-white focus-within:border-accent", full && "fixed inset-0 z-[90] flex flex-col rounded-none")}>
      {editor && <Toolbar editor={editor} source={source} setSource={(v) => { if (!v) editor.commands.setContent(html, { emitUpdate: true }); setSource(v); }} full={full} setFull={setFull} onImage={() => setPicker(true)} />}
      <div className={cn("overflow-y-auto", full ? "flex-1" : "max-h-[70vh]")} style={{ minHeight }}>
        {source ? (
          <textarea
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              onChange(e.target.value);
            }}
            spellCheck={false}
            className="size-full min-h-[inherit] w-full resize-none bg-ink p-4 font-mono text-[13px] leading-relaxed text-lime focus:outline-none"
            style={{ minHeight }}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
      <div className="flex items-center justify-between border-t border-line px-3 py-1.5 text-[11px] text-ink/45">
        <span>{words} words · ~{Math.max(1, Math.round(words / 220))} min read</span>
        <span>Tip: select text to format · paste from Google Docs keeps styling</span>
      </div>
      <MediaPicker
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={(m) => editor?.chain().focus().setImage({ src: m.url, alt: m.alt || "", title: m.title || undefined }).run()}
      />
    </div>
  );
}
