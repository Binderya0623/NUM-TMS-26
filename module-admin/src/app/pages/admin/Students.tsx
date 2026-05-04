import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { userService, type UserRecord } from "../../../services/userService";
import { isUuid } from "../../../lib/utils";

const departments = ["Бүх тэнхим"];

export default function Students() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("Бүх тэнхим");
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [departmentMap, setDepartmentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getStudents().catch(() => ({ data: [] as UserRecord[] })),
      userService.getDepartments().catch(() => ({ data: [] as any[] })),
    ]).then(([sr, dr]) => {
      setStudents(sr.data);
      const map: Record<string, string> = {};
      (dr.data || []).forEach((d: any) => { if (d.id) map[d.id] = d.departmentName || d.id; });
      setDepartmentMap(map);
    }).finally(() => setLoading(false));
  }, []);

  const deptLabel = (id?: string) => {
    if (!id) return "";
    return departmentMap[id] || (isUuid(id) ? "" : id);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId || "").toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "Бүх тэнхим" || s.departmentId === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-500">Нийт оюутнууд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-500">Шүүлтэнд тохирсон</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-ink-500">Тэнхимүүд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(students.map(s => s.departmentId).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400 h-4 w-4" />
              <Input
                placeholder="Оюутан, и-мэйл эсвэл нэвтрэх нэрээр хайх..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2 border border-border-strong rounded-md text-sm text-ink-900 bg-surface focus:outline-none focus:border-ink-900"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Шүүлэх
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Гаргах
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Оюутны бүртгэл ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-ink-400 py-6 text-center text-sm">Ачааллаж байна...</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Оюутан</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Нэвтрэх нэр</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Тэнхим</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Хөтөлбөр</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Оюутны ID</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider font-medium text-ink-500">Үйл</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border hover:bg-surface-muted">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-surface border border-border-strong text-ink-900 text-[11px] font-medium">
                            {(student.displayName || student.username || "?").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-ink-900 tracking-tight">{student.displayName || student.username}</p>
                          <p className="text-xs text-ink-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm">{student.username}</td>
                    <td className="py-4 text-sm">{deptLabel(student.departmentId) || "—"}</td>
                    <td className="py-4 text-sm">{student.programId && !isUuid(student.programId) ? student.programId : "—"}</td>
                    <td className="py-4 text-sm">{student.studentId && !isUuid(student.studentId) ? student.studentId : "—"}</td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
