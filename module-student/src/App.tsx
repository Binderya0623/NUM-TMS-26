/**
 * App.tsx — Student Микрофронтэнд
 *
 * HashRouter: /student.xhtml#/, /student.xhtml#/thesis, гэх мэт
 */
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import StudentLayout from './app/layouts/StudentLayout';
import StudentDashboard from './app/pages/student/StudentDashboard';
import StudentProfile from './app/pages/student/StudentProfile';
import StudentThesis from './app/pages/student/StudentThesis';
import StudentMessages from './app/pages/student/StudentMessages';
import StudentFeedback from './app/pages/student/StudentFeedback';
import StudentEvaluationDeadlines from './app/pages/student/StudentEvaluationDeadlines';
import StudentFinalGrade from './app/pages/student/StudentFinalGrade';
import type { StoredUser } from './lib/authGuard';

interface AppProps { user: StoredUser; }

export default function App({ user }: AppProps) {
  return (
    <HashRouter>
      <Routes>
        <Route path="/student" element={<StudentLayout user={user} />}>
          <Route index element={<StudentDashboard />} />
          <Route path="profile"    element={<StudentProfile />} />
          <Route path="thesis"     element={<StudentThesis />} />
          <Route path="messages"   element={<StudentMessages />} />
          <Route path="feedback"   element={<StudentFeedback />} />
          <Route path="evaluation" element={<StudentEvaluationDeadlines />} />
          <Route path="deadlines"  element={<StudentEvaluationDeadlines />} />
          <Route path="grade"      element={<StudentFinalGrade />} />
        </Route>
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </HashRouter>
  );
}
