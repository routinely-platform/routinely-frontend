import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-4 text-text-primary">홈</div>} />
      <Route path="/login" element={<div className="p-4 text-text-primary">로그인</div>} />
    </Routes>
  )
}
