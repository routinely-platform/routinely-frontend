import { Routes, Route } from 'react-router-dom'
import { useInitAuth } from '@/hooks/useInitAuth'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import PublicOnlyRoute from '@/components/common/PublicOnlyRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import HomePage from '@/pages/HomePage'
import RoutinesPage from '@/pages/RoutinesPage'
import ChallengesPage from '@/pages/ChallengesPage'
import FeedPage from '@/pages/FeedPage'
import StatisticsPage from '@/pages/StatisticsPage'
import NotificationsPage from '@/pages/NotificationsPage'
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
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
