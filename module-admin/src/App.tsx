/**
 * App.tsx — Admin Микрофронтэнд
 *
 * HashRouter ашигласан тул JSF-ийн URL-тэй мөргөлдөхгүй.
 * JSF URL хэвээрээ байна: /admin.xhtml
 * React routes: /admin.xhtml#/, /admin.xhtml#/teachers, гэх мэт
 */
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import AdminLayout from './app/layouts/AdminLayout';
import AdminDashboard from './app/pages/admin/AdminDashboard';
import Teachers from './app/pages/admin/Teachers';
import ExternalExperts from './app/pages/admin/ExternalExperts';
import Students from './app/pages/admin/Students';
import AdminThesis from './app/pages/admin/Thesis';
import Statistics from './app/pages/admin/Statistics';
import AdminCommittees from './app/pages/admin/AdminCommittees';
import AdminEvaluationProcess from './app/pages/admin/AdminEvaluationProcess';
import AdminReports from './app/pages/admin/AdminReports';
import AdminGrades from './app/pages/admin/AdminGrades';
import AdminTopicManagement from './app/pages/admin/AdminTopicManagement';
import ComingSoon from './app/pages/ComingSoon';
import type { StoredUser } from './lib/authGuard';

interface AppProps {
  user: StoredUser;
}

export default function App({ user }: AppProps) {
  return (
    <HashRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout user={user} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="teachers"          element={<Teachers />} />
          <Route path="external-experts" element={<ExternalExperts />} />
          <Route path="students"          element={<Students />} />
          <Route path="thesis"            element={<AdminThesis />} />
          <Route path="topics"            element={<AdminTopicManagement />} />
          <Route path="statistics"        element={<Statistics />} />
          <Route path="committees"        element={<AdminCommittees />} />
          <Route path="assignment"        element={<ComingSoon />} />
          <Route path="evaluation-process" element={<AdminEvaluationProcess />} />
          <Route path="evaluation-methods" element={<AdminEvaluationProcess />} />
          <Route path="reports"           element={<AdminReports />} />
          <Route path="grades"            element={<AdminGrades />} />
          <Route path="deadlines"         element={<ComingSoon />} />
          <Route path="closure"           element={<AdminCommittees />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </HashRouter>
  );
}
