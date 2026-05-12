/**
 * App.tsx — Teacher Микрофронтэнд
 *
 * HashRouter: /teacher.xhtml#/, /teacher.xhtml#/students, гэх мэт
 */
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import TeacherLayout from './app/layouts/TeacherLayout';
import TeacherDashboard from './app/pages/teacher/TeacherDashboard';
import TeacherStudents from './app/pages/teacher/TeacherStudents';
import TeacherThesis from './app/pages/teacher/TeacherThesis';
import TeacherMessages from './app/pages/teacher/TeacherMessages';
import TeacherProgress from './app/pages/teacher/TeacherProgress';
import TeacherCommittee from './app/pages/teacher/TeacherCommittee';
import ExternalExpertGrading from './app/pages/teacher/ExternalExpertGrading';
import ComingSoon from './app/pages/ComingSoon';
import NotificationsPage from './app/pages/NotificationsPage';
import type { StoredUser } from './lib/authGuard';

interface AppProps { user: StoredUser; }

export default function App({ user }: AppProps) {
  return (
    <HashRouter>
      <Routes>
        <Route path="/teacher" element={<TeacherLayout user={user} />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="students"    element={<TeacherStudents />} />
          <Route path="thesis"      element={<TeacherThesis />} />
          <Route path="messages"    element={<TeacherMessages />} />
          <Route path="reports"     element={<TeacherThesis />} />
          <Route path="evaluations" element={<TeacherCommittee />} />
          <Route path="feedback"    element={<TeacherMessages />} />
          <Route path="progress"    element={<Navigate to="/teacher/students" replace />} />
          <Route path="committee"   element={<TeacherCommittee />} />
          <Route path="scores"      element={<TeacherProgress />} />
          <Route path="expert"        element={<ExternalExpertGrading />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings"      element={<ComingSoon />} />
        </Route>
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    </HashRouter>
  );
}
