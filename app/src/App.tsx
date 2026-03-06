import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthLayout from '@/components/layout/AuthLayout';

// Pages
import Landing from '@/pages/Landing';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Agents from '@/pages/Agents';
import NewAgent from '@/pages/NewAgent';
import EditAgent from '@/pages/EditAgent';
import Calls from '@/pages/Calls';
import KnowledgeBase from '@/pages/KnowledgeBase';
import Webhooks from '@/pages/Webhooks';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/sign-in" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/sign-up" element={<PublicRoute><SignUp /></PublicRoute>} />
      </Route>
      
      {/* Dashboard routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/agents" element={<PrivateRoute><Agents /></PrivateRoute>} />
        <Route path="/agents/new" element={<PrivateRoute><NewAgent /></PrivateRoute>} />
        <Route path="/agents/:id" element={<PrivateRoute><EditAgent /></PrivateRoute>} />
        <Route path="/calls" element={<PrivateRoute><Calls /></PrivateRoute>} />
        <Route path="/knowledge-base" element={<PrivateRoute><KnowledgeBase /></PrivateRoute>} />
        <Route path="/webhooks" element={<PrivateRoute><Webhooks /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
