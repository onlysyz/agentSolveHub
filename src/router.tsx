import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout';
import {
  HomePage,
  SearchPage,
  ProblemDetailPage,
  SubmitProblemPage,
  SubmitSolutionPage,
  CategoriesPage,
  LoginPage,
  ProfilePage,
  AdminPage,
} from './pages';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="problems/:id" element={<ProblemDetailPage />} />
            <Route path="submit-problem" element={<SubmitProblemPage />} />
            <Route path="submit-solution/:problemId" element={<SubmitSolutionPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:platform" element={<CategoriesPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:tab" element={<ProfilePage />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/:section"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
