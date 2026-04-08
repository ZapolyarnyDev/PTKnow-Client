import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';

// import ProtectedRoute from './ProtectedRoute';
import AuthPage from '../Pages/AuthPage';
import CoursesPage from '../Pages/CoursesPage';
import CreateCoursePage from '../Pages/CreateCoursePage';
import CreateLessonPage from '../Pages/CreateLessonPage';
import { ProfilePage } from '../Pages/ProfilePage';
import RegisterPage from '../Pages/RegisterPage';
import GuestRoute from './GuestRoute';
import CourseDetailsPage from '../Pages/CourseDetailsPage';
import ProfileEditPage from '../Pages/ProfileEditPage';
import ProtectedRoute from './ProtectedRoute';
import AdminUsersPage from '../Pages/AdminUsersPage';
import AdminPanelPage from '../Pages/AdminPanelPage';
import UnderConstructionPage from '../Pages/UnderConstructionPage';
import CourseRegisterPage from '../Pages/CourseRegisterPage';
import MyCoursesPage from '../Pages/MyCoursesPage';
import ProfileSearchPage from '../Pages/ProfileSearchPage';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<CoursesPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route
          path="/auth"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        <Route
          path="/profile"
          element={
            // <ProtectedRoute>
            <ProfilePage />
            // </ProtectedRoute>
          }
        />

        <Route path="/profile/:handle" element={<ProfilePage />} />
        <Route path="/profiles" element={<ProfileSearchPage />} />

        <Route path="/profile/edit" element={<ProfileEditPage />} />

        <Route
          path="/create-course"
          element={
            // <ProtectedRoute requiredRole={["Teacher", "admin"]}>
            <CreateCoursePage />
            // {/* </ProtectedRoute> */}
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId/lessons/new"
          element={
            // <ProtectedRoute requiredRole={["Teacher", "admin"]}>
            <CreateLessonPage />
            // {/* </ProtectedRoute> */}
          }
        />

        <Route
          path="/courses/:courseId/lessons/:lessonId/edit"
          element={<CreateLessonPage />}
        />

        <Route path="/my-courses" element={<MyCoursesPage />} />

        <Route path="/course/:courseId/register" element={<CourseRegisterPage />} />

        <Route path="/course/:courseId" element={<CourseDetailsPage />} />

        <Route path="*" element={<UnderConstructionPage />} />
      </Routes>
    </Router>
  );
};
export default AppRouter;
