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

        <Route
          path="/create-course"
          element={
            // <ProtectedRoute requiredRole={["Teacher", "admin"]}>
            <CreateCoursePage />
            // {/* </ProtectedRoute> */}
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

        <Route path="/course/:courseId" element={<CourseDetailsPage />} />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};
export default AppRouter;
