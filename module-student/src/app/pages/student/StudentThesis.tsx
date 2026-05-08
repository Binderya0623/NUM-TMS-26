import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Upload, CheckCircle2, AlertCircle, FileUp, FileArchive,
  File, MonitorPlay,
} from "lucide-react";

import StudentTopicTab from "./tabs/StudentTopicTab";
import StudentWeeklyPlanTab from "./tabs/StudentWeeklyPlanTab";
import { thesisService, type ThesisReport, type ReportFile } from "../../../services/thesisService";
import { userService } from "../../../services/userService";
import { getStoredUser } from "../../../lib/authGuard";
import { isUuid } from "../../../lib/utils";
import FilePreviewModal from "../../components/FilePreviewModal";

export default function StudentThesis() {
  const user = getStoredUser();
  const studentId = user?.userId || user?.username || "";

  const [searchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState(searchParams.get("tab") || "topic");
  const [reports, setReports] = useState<ThesisReport[]>([]);
  const [thesisId, setThesisId] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<ReportFile[]>([]);
  const [previewActiveId, setPreviewActiveId] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [reportType, setReportType] = useState("PROGRESS_1");
  const [description, setDescription] = useState("");
  const [studentName, setStudentName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!studentId) return;
    userService.getById(studentId)
      .then(res => { if (res.data?.displayName) setStudentName(res.data.displayName); })
      .catch(() => {});
    thesisService.getMyThesis(studentId)
      .then(res => { if (res.data) setThesisId((res.data as any).id || null); })
      .catch(() => {});

    thesisService.getMyReports(studentId)
      .then(res => setReports(res.data))
      .catch(() => {});
  }, [studentId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const validateFile = (file: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Файлын формат буруу байна. PDF эсвэл DOCX файл оруулна уу.");
      setUploadStatus("error");
      return false;
    }
    setErrorMsg(""); setUploadStatus("idle"); return true;
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) setSelectedFile(file);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) setSelectedFile(file);
    }
  };
  const handleSubmitReport = () => {
    if (!selectedFile) return;
    setUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("studentId", studentId);
    if (thesisId) formData.append("thesisId", thesisId);
    formData.append("reportType", reportType);
    if (description) formData.append("description", description);
    thesisService.submitReport(formData)
      .then(res => {
        setReports(prev => [...prev, res.data]);
        setUploadStatus("success");
      })
      .catch(() => {
        setErrorMsg("Тайлан илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
        setUploadStatus("error");
      });
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <Card>
        <div className="h-0.5 w-full bg-accent" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Хийгдэж байна
                  </span>
                  <span className="text-xs text-ink-500">Оюутан: {studentName || (isUuid(studentId) ? "" : studentId)}</span>
                </div>
                <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">Дипломын ажил</h1>
                <p className="text-sm text-ink-500 mt-2 max-w-3xl leading-relaxed">
                  Та тайлангаа илгээж, багштайгаа харилцаж, явцаа хянах боломжтой.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <StatTile label="Илгээсэн тайлан" value={String(reports.length)} />
                <StatTile label="Сүүлийн тайлан" value={reports[reports.length - 1]?.reportType ?? "—"} />
                <StatTile label="Төлөв" value={reports[reports.length - 1]?.status ?? "—"} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="topic">Сэдэв</TabsTrigger>
          <TabsTrigger value="weekly-plan">Үечилсэн төлөвлөгөө</TabsTrigger>
          <TabsTrigger value="reports">Тайлан илгээх</TabsTrigger>
          <TabsTrigger value="presentation">Танилцуулга</TabsTrigger>
        </TabsList>

        <TabsContent value="topic" className="mt-6">
          <StudentTopicTab />
        </TabsContent>

        <TabsContent value="weekly-plan" className="mt-6">
          <StudentWeeklyPlanTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight flex items-center gap-2">
                <FileUp className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Шинэ тайлан илгээх
              </CardTitle>
              <CardDescription className="text-xs text-ink-500">
                Зөвхөн PDF эсвэл DOCX, дээд тал нь 25MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">Тайлангийн төрөл</label>
                  <select
                    className="w-full h-9 border border-border-strong rounded-md px-3 text-sm bg-surface focus:outline-none focus:border-ink-900"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="PROGRESS_1">Явц 1</option>
                    <option value="PROGRESS_2">Явц 2</option>
                    <option value="PRE_DEFENSE">Урьдчилсан хамгаалалт</option>
                    <option value="FINAL_DEFENSE">Эцсийн хамгаалалт</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-ink-500 mb-2">Тайлбар</label>
                  <input
                    type="text"
                    placeholder="Товч тайлбар"
                    className="w-full h-9 border border-border-strong rounded-md px-3 text-sm bg-surface focus:outline-none focus:border-ink-900"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {uploadStatus === "success" ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border-strong bg-surface-muted rounded-md">
                  <div className="w-10 h-10 rounded-full border border-ink-900 flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-5 h-5 text-ink-900" strokeWidth={1.6} />
                  </div>
                  <h3 className="text-base font-semibold text-ink-900 mb-1 tracking-tight">Амжилттай илгээлээ</h3>
                  <Button variant="outline" className="mt-4" onClick={() => { setUploadStatus("idle"); setSelectedFile(null); setDescription(""); }}>
                    Өөр файл илгээх
                  </Button>
                </div>
              ) : (
                <div
                  className={`relative border border-dashed rounded-md p-8 text-center transition-colors ${
                    dragActive ? "border-accent bg-accent-soft"
                    : uploadStatus === "error" ? "border-border-strong bg-surface-muted"
                    : "border-border-strong hover:border-ink-900"
                  }`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleChange} ref={fileInputRef} accept=".pdf,.docx" />
                  {!selectedFile ? (
                    <div className="flex flex-col items-center pointer-events-none">
                      <Upload className="w-8 h-8 text-ink-400 mb-3" strokeWidth={1.4} />
                      <p className="text-sm text-ink-700">Файлаа энд чирж тавих буюу дарж сонгох</p>
                      <p className="text-xs text-ink-400 mt-1">PDF, DOCX — дээд тал нь 25MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center pointer-events-none">
                      <File className="w-8 h-8 text-ink-700 mb-3" strokeWidth={1.6} />
                      <p className="text-sm font-medium text-ink-900 tracking-tight truncate max-w-xs">{selectedFile.name}</p>
                    </div>
                  )}
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="mt-3 flex items-center gap-2 text-ink-700 bg-surface-muted p-3 rounded-md border border-border text-sm">
                  <AlertCircle className="w-4 h-4 text-[var(--color-dot-negative)]" strokeWidth={1.6} />
                  <p>{errorMsg}</p>
                </div>
              )}

              {uploadStatus !== "success" && (
                <div className="mt-6 flex justify-end">
                  <Button disabled={!selectedFile || uploadStatus === "uploading"} onClick={handleSubmitReport}>
                    {uploadStatus === "uploading" ? "Илгээж байна..." : "Тайлан илгээх"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presentation" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-sm font-semibold text-ink-900 tracking-tight flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-ink-700" strokeWidth={1.6} />
                Танилцуулгын материалууд
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-3">
                  <FileArchive className="w-5 h-5 text-ink-400" strokeWidth={1.4} />
                </div>
                <p className="text-sm font-medium text-ink-700 tracking-tight">Материал оруулаагүй байна</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {previewActiveId && previewFiles.length > 0 && (
        <FilePreviewModal
          files={previewFiles}
          activeId={previewActiveId}
          onClose={() => { setPreviewFiles([]); setPreviewActiveId(null); }}
          onSelect={setPreviewActiveId}
        />
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-muted border border-border rounded-md p-3">
      <p className="text-[11px] uppercase tracking-wider font-medium text-ink-500">{label}</p>
      <p className="text-sm font-medium text-ink-900 tabular-nums tracking-tight mt-0.5 truncate">{value}</p>
    </div>
  );
}

