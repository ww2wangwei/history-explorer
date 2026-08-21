import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import AdminApp from '@/components/Admin/AdminApp'
import Splash, { shouldShowSplash, markSplashSeen } from '@/components/Splash'
import { ErrorBoundary } from '@/components/ErrorBoundary'

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

  if (isAdmin) return <ErrorBoundary><AdminApp /></ErrorBoundary>

  if (showSplash) {
    return (
      <ErrorBoundary>
        <Splash
          onDone={() => {
            markSplashSeen()
            setShowSplash(false)
          }}
        />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  )
}

export default App