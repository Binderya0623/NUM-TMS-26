import DOMPurify from "dompurify";

const isEmptyHtml = (html: string) =>
  !html || html === "<p></p>" || html.replace(/<[^>]*>/g, "").trim() === "";

const sanitize = (html: string) =>
  DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

/** Read-only renderer for fields written by the teacher's rich-text editor.
 *  Plain-text values render as a single <p>; HTML values are sanitized first. */
export function RichText({
  html,
  className,
  fallback,
  inline,
}: {
  html?: string | null;
  className?: string;
  fallback?: React.ReactNode;
  inline?: boolean;
}) {
  const value = html ?? "";
  if (isEmptyHtml(value)) return <>{fallback ?? null}</>;
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  const Wrapper = inline ? "span" : "div";
  if (!looksLikeHtml) {
    return inline ? <span className={className}>{value}</span> : <p className={className}>{value}</p>;
  }
  return (
    <Wrapper
      className={`rte-content ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: sanitize(value) }}
    />
  );
}
