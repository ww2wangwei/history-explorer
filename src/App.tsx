import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import AdminApp from '@/components/Admin/AdminApp'

function App() {
  const [isAdmin, setIsAdmin] = useState(() =>
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  )

  useEffect(() => {
    const onPop = () => setIsAdmin(window.location.pathname.startsWith('/admin'))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return isAdmin ? <AdminApp /> : <Layout />
}

export default App
