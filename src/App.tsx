
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import './App.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ProtectedRoute from './components/ProtectedRoute'
import UpdatePasswordPage from './pages/UpdatePasswordPage'
import Dashboard from './pages/Dashboard'

function App() {


  return (
    <>
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Protected Route: Update Password 
             This MUST be protected because the user needs to be logged in 
             (via the email link) to change their password.
          */}
          <Route 
            path="/update-password" 
            element={
              <ProtectedRoute>
                <UpdatePasswordPage />
              </ProtectedRoute>
            } 
          />

          {/* Main App Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
