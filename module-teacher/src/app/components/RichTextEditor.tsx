import { useEffect } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import DOMPurify from "dompurify";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  List as UlIcon,
  ListOrdered as OlIcon,
} from "lucide-react";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  /** Toolbar placement. Defaults to "top" (Teams-style anchored bar). */
  toolbar?: "top" | "bottom";
  /** Optional aria-label for the editable region. */
  ariaLabel?: string;
}

const isEmptyHtml = (html: string) =>
  !html || html === "<p></p>" || html.replace(/<[^>]*>/g, "").trim() === "";

/** Sanitize incoming HTML so external strings can't inject scripts. */
const sanitize = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 120,
  disabled,
  toolbar = "top",
  ariaLabel,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "rte-content focus:outline-none px-3 py-2 text-sm font-normal text-ink-800 leading-relaxed",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(isEmptyHtml(html) ? "" : html);
    },
  });

  // Keep editor content in sync when the parent resets the value externally
  // (e.g. clearing a form after submit).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current && !(isEmptyHtml(current) && isEmptyHtml(next))) {
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);

  // Reflect disabled state changes.
  useEffect(() => {
    if (!editor) return;
    if (editor.isEditable === !disabled) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  const bar = <Toolbar editor={editor} />;

  return (
    <div
      className={`rte-shell border border-border rounded-md bg-surface focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-colors ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {toolbar === "top" && bar}
      <div style={{ minHeight }} className="rte-scroll">
        <EditorContent editor={editor} />
      </div>
      {toolbar === "bottom" && bar}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const Btn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex items-center justify-center w-7 h-7 rounded-sm transition-colors ${
        active
          ? "bg-accent-softer text-accent"
          : "text-ink-700 hover:bg-surface-muted hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-surface-muted/60">
      <Btn
        title="Тод (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <BoldIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </Btn>
      <Btn
        title="Налуу (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <ItalicIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </Btn>
      <Btn
        title="Доогуур зураас (Ctrl+U)"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </Btn>
      <Btn
        title="Зураастай"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <StrikeIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </Btn>
      <span className="w-px h-4 bg-border-strong mx-1" />
      <Btn
        title="Цэгтэй жагсаалт"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <UlIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </Btn>
      <Btn
        title="Дугаартай жагсаалт"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <OlIcon className="w-3.5 h-3.5" strokeWidth={2} />
      </Btn>
    </div>
  );
}

/** Read-only HTML viewer that sanitizes before rendering. */
export function RichText({
  html,
  className,
  fallback,
}: {
  html?: string | null;
  className?: string;
  fallback?: React.ReactNode;
}) {
  if (!html || isEmptyHtml(html)) return <>{fallback ?? null}</>;
  // Treat plain strings (no HTML tags) as text — show them safely without
  // interpreting accidental angle brackets.
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(html);
  if (!looksLikeHtml) {
    return <p className={className}>{html}</p>;
  }
  return (
    <div
      className={`rte-content ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: sanitize(html) }}
    />
  );
}
