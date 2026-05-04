import { X, FileDown, FileText } from "lucide-react";

const VIEW_BASE = "http://localhost:8083/api/thesis-reports/files";

function canPreview(filename?: string, mimeType?: string) {
  const mt = mimeType?.toLowerCase() ?? "";
  const fn = filename?.toLowerCase() ?? "";
  return (
    mt.includes("pdf") || mt.includes("image/") ||
    fn.endsWith(".pdf") || fn.endsWith(".png") ||
    fn.endsWith(".jpg") || fn.endsWith(".jpeg") || fn.endsWith(".gif")
  );
}

export interface PreviewFile {
  id: string;
  originalFilename: string;
  mimeType?: string;
}

interface Props {
  files: PreviewFile[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export default function FilePreviewModal({ files, activeId, onClose, onSelect }: Props) {
  const active = files.find(f => f.id === activeId) ?? files[0];
  if (!active) return null;

  const previewable = canPreview(active.originalFilename, active.mimeType);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,10,10,0.55)" }}
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-md border border-border-strong flex flex-col overflow-hidden"
        style={{ width: "min(900px, 95vw)", height: "min(85vh, 900px)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-muted shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-ink-700 shrink-0" strokeWidth={1.6} />
            <span className="text-sm font-semibold text-ink-900 tracking-tight truncate">{active.originalFilename}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <a
              href={`${VIEW_BASE}/${active.id}/download`}
              className="flex items-center gap-1.5 text-xs text-ink-700 border border-border-strong rounded-md px-2.5 h-8 hover:border-ink-900 hover:text-ink-900 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" strokeWidth={1.6} /> Татаж авах
            </a>
            <button onClick={onClose} className="p-1.5 text-ink-400 hover:text-ink-900 hover:bg-accent-softer rounded-md transition-colors">
              <X className="w-4 h-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>

        {files.length > 1 && (
          <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto shrink-0 bg-surface">
            {files.map(f => (
              <button
                key={f.id}
                onClick={() => onSelect(f.id)}
                className={`flex items-center gap-1.5 text-xs px-2.5 h-7 rounded-md whitespace-nowrap transition-colors border ${
                  f.id === activeId
                    ? "bg-ink-900 text-white border-ink-900"
                    : "bg-surface text-ink-600 border-border-strong hover:border-ink-900 hover:text-ink-900"
                }`}
              >
                <FileText className="w-3 h-3" strokeWidth={1.6} />
                {f.originalFilename.length > 28 ? f.originalFilename.slice(0, 25) + "…" : f.originalFilename}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 bg-surface-sunken overflow-hidden">
          {previewable ? (
            <iframe
              key={active.id}
              src={`${VIEW_BASE}/${active.id}/view`}
              className="w-full h-full border-0"
              title={active.originalFilename}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-ink-500">
              <FileText className="w-12 h-12 text-ink-300" strokeWidth={1.3} />
              <p className="text-sm font-medium text-ink-900 tracking-tight">Файлыг шууд харах боломжгүй</p>
              <p className="text-xs text-ink-500">Word болон бусад файлыг татаж авч үзнэ үү.</p>
              <a
                href={`${VIEW_BASE}/${active.id}/download`}
                className="flex items-center gap-2 bg-accent text-white text-sm px-4 h-9 rounded-md hover:bg-accent-hover transition-colors font-medium tracking-tight"
              >
                <FileDown className="w-4 h-4" strokeWidth={1.6} /> Татаж авах
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
