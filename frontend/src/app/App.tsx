import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthContext'
import { ToastProvider } from '../shared/components/Toast'
import { ThemeProvider } from './providers/ThemeProvider'
import { QueryProvider } from './providers/QueryProvider'
import { router } from './router'

const App = () => (
  <QueryProvider>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </QueryProvider>
)

export default App
