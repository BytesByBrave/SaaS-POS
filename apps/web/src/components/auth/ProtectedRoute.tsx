import { Navigate, Outlet } from 'react-router-dom';

export function PrivateRoute() {
    const token = localStorage.getItem('auth_token');
    return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleRoute({ roles }: { roles: string[] }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'staff';

    return roles.includes(role) ? <Outlet /> : <Navigate to="/" replace />;
}
