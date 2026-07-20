/**
 * AdminApp — 后台管理入口
 * 独立的 /admin 路由，简单的侧边栏 + 内容区
 */
import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import GeoAdmin from './GeoAdmin'
import PeopleAdmin from './PeopleAdmin'
import CulturesAdmin from './CulturesAdmin'
import WarsAdmin from './WarsAdmin'
import GraphAdmin from './GraphAdmin'
import AdminOverview from './AdminOverview'

export type AdminTab = 'overview' | 'geo' | 'people' | 'cultures' | 'wars' | 'graph'

function getTabFromHash(): AdminTab {
  const h = window.location.hash.replace('#', '')
  if (['overview', 'geo', 'people', 'cultures', 'wars', 'graph'].includes(h)) return h as AdminTab
  return 'overview'
}

export default function AdminApp() {
  const [tab, setTab] = useState<AdminTab>(getTabFromHash)

  useEffect(() => {
    window.location.hash = tab
  }, [tab])

  useEffect(() => {
    const onHash = () => setTab(getTabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <AdminLayout tab={tab} onTabChange={setTab}>
      {tab === 'overview' && <AdminOverview onTabChange={setTab} />}
      {tab === 'geo' && <GeoAdmin />}
      {tab === 'people' && <PeopleAdmin />}
      {tab === 'cultures' && <CulturesAdmin />}
      {tab === 'wars' && <WarsAdmin />}
      {tab === 'graph' && <GraphAdmin />}
    </AdminLayout>
  )
}
