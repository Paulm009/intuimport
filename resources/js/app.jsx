import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import BlockedScreen from './components/BlockedScreen';
import Layout from './components/Layout';
import { Spinner } from './components/ui';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CalculatorProvider } from './context/CalculatorContext';
import { ToastProvider } from './context/ToastContext';
import { accessStatus } from './lib/format';
import Account from './pages/Account';
import Community from './pages/Community';
import Contacts from './pages/Contacts';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Imports from './pages/Imports';
import Library from './pages/Library';
import Login from './pages/Login';
import Office from './pages/Office';
import Products from './pages/Products';
import Recordings from './pages/Recordings';
import Register from './pages/Register';
import Services from './pages/Services';
import Suggestions from './pages/Suggestions';
import Suppliers from './pages/Suppliers';
import Tools from './pages/Tools';
import AdminCourses from './pages/admin/AdminCourses';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLibrary from './pages/admin/AdminLibrary';
import AdminMeetings from './pages/admin/AdminMeetings';
import AdminPosts from './pages/admin/AdminPosts';
import AdminRecordings from './pages/admin/AdminRecordings';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminTariffs from './pages/admin/AdminTariffs';
import AdminUsers from './pages/admin/AdminUsers';

function Protected({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8]">
                <Spinner label="Cargando portal..." />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (!user.is_admin && accessStatus(user) !== 'active') {
        return <BlockedScreen />;
    }

    return children;
}

function AdminOnly({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8]">
                <Spinner label="Cargando panel..." />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (!user.is_admin) return <Navigate to="/dashboard" replace />;

    return children;
}

function PublicOnly({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-navy">
                <Spinner label="Cargando..." />
            </div>
        );
    }

    if (user) return <Navigate to={user.is_admin ? '/admin' : '/dashboard'} replace />;

    return children;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

            <Route
                element={
                    <Protected>
                        <Layout />
                    </Protected>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/cursos" element={<Courses />} />
                <Route path="/grabaciones" element={<Recordings />} />
                <Route path="/herramientas" element={<Tools />} />
                <Route path="/biblioteca" element={<Library />} />
                <Route path="/importes" element={<Imports />} />
                <Route path="/proveedores" element={<Suppliers />} />
                <Route path="/productos" element={<Products />} />
                <Route path="/sugerencias" element={<Suggestions />} />
                <Route path="/contactos" element={<Contacts />} />
                <Route path="/comunidad" element={<Community />} />
                <Route path="/servicios" element={<Services />} />
                <Route path="/oficina" element={<Office />} />
                <Route path="/cuenta" element={<Account />} />
            </Route>

            <Route
                element={
                    <AdminOnly>
                        <AdminLayout />
                    </AdminOnly>
                }
            >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/usuarios" element={<AdminUsers />} />
                <Route path="/admin/cursos" element={<AdminCourses />} />
                <Route path="/admin/grabaciones" element={<AdminRecordings />} />
                <Route path="/admin/aranceles" element={<AdminTariffs />} />
                <Route path="/admin/biblioteca" element={<AdminLibrary />} />
                <Route path="/admin/sugerencias" element={<AdminSuggestions />} />
                <Route path="/admin/reuniones" element={<AdminMeetings />} />
                <Route path="/admin/comunidad" element={<AdminPosts />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

createRoot(document.getElementById('app')).render(
    <StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <CalculatorProvider>
                        <App />
                    </CalculatorProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </StrictMode>,
);
