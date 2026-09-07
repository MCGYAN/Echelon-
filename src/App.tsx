import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "./lib/store";
import { MarketingLayout } from "./components/MarketingLayout";
import { AdminLayout, LearnLayout } from "./components/AppShells";
import { HomePage } from "./pages/HomePage";
import { CourseDetailPage, CoursesPage } from "./pages/CoursesPages";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import { BookPage } from "./pages/BookPage";
import {
  LearnCoursePage,
  LearnHomePage,
  LearnMaterialsPage,
  LearnSessionsPage,
  MaterialPage,
  QuizPage,
} from "./pages/LearnPages";
import {
  AdminContent,
  AdminCourses,
  AdminDashboard,
  AdminSessions,
  AdminStudents,
} from "./pages/AdminPages";

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route index element={<HomePage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:courseId" element={<CourseDetailPage />} />
            <Route path="book" element={<BookPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
          </Route>

          <Route path="learn" element={<LearnLayout />}>
            <Route index element={<LearnHomePage />} />
            <Route path="sessions" element={<LearnSessionsPage />} />
            <Route path="courses/:courseId" element={<LearnCoursePage />} />
            <Route path="materials" element={<LearnMaterialsPage />} />
            <Route path="materials/:materialId" element={<MaterialPage />} />
            <Route path="quizzes/:quizId" element={<QuizPage />} />
          </Route>

          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="sessions" element={<AdminSessions />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="courses" element={<AdminCourses />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
