import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { BlogProvider, useBlog } from './context/BlogContext';
import { Layout } from './components/Layout';
import { Home, BlogList, BlogPost, About, Contact, PrivacyPolicy } from './pages/Public';
import { Login, AdminDashboard, PostEditor, SettingsPage } from './pages/Admin';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './components/UI';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary Component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-800 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-stone-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-3">Something went wrong</h1>
            <p className="text-stone-500 mb-6">
              We encountered an unexpected error. This might be due to a network connection issue or a missing resource.
            </p>
            {this.state.error && (
               <div className="bg-stone-100 p-3 rounded text-xs font-mono text-left mb-6 overflow-auto max-h-32 text-red-800">
                 {this.state.error.toString()}
               </div>
            )}
            <Button onClick={this.handleReload} className="w-full">
              <RefreshCw size={18} /> Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <ErrorBoundary>
      <BlogProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </BlogProvider>
    </ErrorBoundary>
  );
};

export default App;