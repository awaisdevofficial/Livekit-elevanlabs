import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="page-container min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
