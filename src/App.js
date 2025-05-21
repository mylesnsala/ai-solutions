import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './redux/reducers';
import { auth } from './database/firebase';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import LandingPage from './screens/LandingPage';
import SolutionsShowcase from './screens/SolutionsShowcase';
import Help from './components/Help';
import Chatbot from './components/Chatbot';
import { SessionProvider, useSession } from './contexts/SessionContext';

// Lazy load components
const LoginPage = lazy(() => import('./screens/LoginPage'));
const ContactUs = lazy(() => import('./screens/ContactUs'));
const SplashScreen = lazy(() => import('./screens/SplashScreen'));
const AdminDashboard = lazy(() => import('./screens/AdminDashboard'));

// Lazy load admin screens
const DashboardScreen = lazy(() => import('./screens/AdminScreens/DashboardScreen'));
const InquiriesScreen = lazy(() => import('./screens/AdminScreens/InquiriesScreen'));
const EventsScreen = lazy(() => import('./screens/AdminScreens/EventsScreen'));
const GalleryScreen = lazy(() => import('./screens/AdminScreens/GalleryScreen'));
const ArticlesScreen = lazy(() => import('./screens/AdminScreens/ArticlesScreen'));
const AnalyticsScreen = lazy(() => import('./screens/AdminScreens/AnalyticsScreen'));
const HelpScreen = lazy(() => import('./screens/AdminScreens/HelpScreen'));
const SettingsScreen = lazy(() => import('./screens/AdminScreens/SettingsScreen'));

// Create Redux store
const store = createStore(rootReducer);

// Function to check if user is authenticated
const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Private Route component to handle authentication
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSession();
  return isAuthenticated ? children : <Navigate to="/LoginPage" />;
};

// Admin Layout component to wrap all admin routes
const AdminLayout = () => {
  return <AdminDashboard />;
};

function App() {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    const bounceInterval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 300);
    }, 5000); // Bounce every 5 seconds

    return () => clearInterval(bounceInterval);
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <SessionProvider>
          <Suspense
            fallback={
              <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
                <div className="rounded-lg bg-gray-800/50 p-8 text-center backdrop-blur-sm">
                  <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
                  <h2 className="mb-2 text-xl font-semibold">Loading Application</h2>
                  <p className="text-gray-400">Please wait while we prepare your experience...</p>
                </div>
              </div>
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/LoginPage" element={<LoginPage />} />
              <Route path="/ContactUs" element={<ContactUs />} />
              <Route path="/LandingPage" element={<LandingPage />} />
              <Route path="/SolutionsShowcase" element={<SolutionsShowcase />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardScreen />} />
                <Route path="inquiries" element={<InquiriesScreen />} />
                <Route path="events" element={<EventsScreen />} />
                <Route path="gallery" element={<GalleryScreen />} />
                <Route path="articles" element={<ArticlesScreen />} />
                <Route path="analytics" element={<AnalyticsScreen />} />
                <Route path="help" element={<HelpScreen />} />
                <Route path="settings" element={<SettingsScreen />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            limit={3}
            className="toast-container"
            toastClassName="toast-message"
            bodyClassName="toast-body"
            progressClassName="toast-progress"
          />

          <Help isBouncing={isBouncing} />
          <Chatbot isBouncing={isBouncing} />
        </SessionProvider>
      </Router>
    </Provider>
  );
}

export default App;
