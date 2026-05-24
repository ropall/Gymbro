import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { SignUp } from './pages/SignUp'
import { AuthCallback } from './pages/AuthCallback'
import { ResetPassword } from './pages/ResetPassword'
import { Inicio } from './pages/Inicio'
import { Rutinas } from './pages/Rutinas'
import { Historial } from './pages/Historial'
import { Nutricion } from './pages/Nutricion'
import { Perfil } from './pages/Perfil'
import { Onboarding } from './pages/Onboarding'
import { OnboardingProfile } from './pages/OnboardingProfile'
import { ActiveWorkout } from './pages/ActiveWorkout'
import { SessionDetail } from './components/history/SessionDetail'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <AppLayout>
            <Inicio />
          </AppLayout>
        }
      />
      <Route
        path="/rutinas"
        element={
          <AppLayout>
            <Rutinas />
          </AppLayout>
        }
      />
      <Route
        path="/historial"
        element={
          <AppLayout>
            <Historial />
          </AppLayout>
        }
      />
      <Route
        path="/nutricion"
        element={
          <AppLayout>
            <Nutricion />
          </AppLayout>
        }
      />
      <Route
        path="/perfil"
        element={
          <AppLayout>
            <Perfil />
          </AppLayout>
        }
      />
      <Route
        path="/bienvenida"
        element={
          <ProtectedRoute>
            <OnboardingProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout/:blockId"
        element={
          <ProtectedRoute>
            <ActiveWorkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historial/:sessionId"
        element={
          <ProtectedRoute>
            <SessionDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
