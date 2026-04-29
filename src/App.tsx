import { Routes, Route } from 'react-router-dom'
import { useInitAuth } from '@/hooks/useInitAuth'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import PublicOnlyRoute from '@/components/common/PublicOnlyRoute'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  useInitAuth()

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
