import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { SidebarProvider } from './SidebarContext'

export const AppLayout = () => (
  <SidebarProvider>
    <div className="flex h-svh overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1600px] w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
)
