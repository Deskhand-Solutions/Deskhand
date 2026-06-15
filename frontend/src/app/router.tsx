import { createBrowserRouter } from 'react-router-dom'
import { GuestRoute } from '../features/auth/GuestRoute'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import { PublicAuthRoute } from '../features/auth/PublicAuthRoute'
import { AppLayout } from '../layouts/AppLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { LandingLayout } from '../layouts/LandingLayout'
import { AdministrationPage } from '../pages/AdministrationPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ModuleRoutePage } from '../modules'
import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { ModulesPage } from '../pages/ModulesPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { SettingsPage } from '../pages/SettingsPage'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <LandingLayout />,
        children: [{ path: '/', element: <LandingPage /> }],
      },
      {
        element: <PublicAuthRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', element: <LoginPage /> },
              { path: 'register', element: <RegisterPage /> },
              { path: 'forgot-password', element: <ForgotPasswordPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'modules', element: <ModulesPage /> },
          { path: 'modules/:slug', element: <ModuleRoutePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'administration', element: <AdministrationPage /> },
        ],
      },
    ],
  },
])
