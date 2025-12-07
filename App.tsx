import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { BlogProvider, useBlog } from './context/BlogContext';
import { Layout } from './components/Layout';
import { Home, BlogList, BlogPost, About, Contact, PrivacyPolicy } from './pages/Public';
import { Login, AdminDashboard, PostEditor, SettingsPage } from './pages/Admin';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { user } = useBlog();
  return user.isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/blog" element={<Layout><BlogList /></Layout>} />
      <Route path="/post/:id" element={<Layout><BlogPost /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />

      {/* Admin Routes */}
      <Route element={<Layout><ProtectedRoute /></Layout>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/editor" element={<PostEditor />} />
        <Route path="/admin/editor/:id" element={<PostEditor />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BlogProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </BlogProvider>
  );
};

export default App;