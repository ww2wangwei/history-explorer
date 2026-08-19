import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import AdminApp from '@/components/Admin/AdminApp'
import Splash, { shouldShowSplash, markSplashSeen } from '@/components/Splash'

function App() {
  const [isAdmin, setIsAdmin] = useState(() =>
    typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  )
  const [showSplash, setShowSplash] = useState(() => shouldShowSplash())

  useEffect(() => {
    const onPop = () => setIsAdmin(window.location.pathname.startsWith('/admin'))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  if (isAdmin) return <AdminApp />

  if (showSplash) {
    return (
      <Splash
        onDone={() => {
          markSplashSeen()
          setShowSplash(false)
        }}
      />
    )
  }

  return <Layout />
}

export default App