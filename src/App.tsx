import { Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="designs" element={<ComingSoonPage />} />
        <Route path="folders" element={<ComingSoonPage />} />
        <Route path="studio/*" element={<ComingSoonPage />} />
        <Route path="saved" element={<ComingSoonPage />} />
        <Route path="purchases" element={<ComingSoonPage />} />
        <Route path="login" element={<ComingSoonPage />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>
    </Routes>
  )
}
