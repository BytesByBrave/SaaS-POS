import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Provider } from 'rxdb-hooks'
import { PosPage } from './pages/PosPage'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'
import { MainLayout } from './components/layout/MainLayout'
import { getDatabase } from './db/database'
import type { Database } from './db/database'
import { SyncService } from './services/SyncService'

import { PrivateRoute, RoleRoute } from './components/auth/ProtectedRoute'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <PosPage />,
          },
          {
            element: <RoleRoute roles={['admin', 'manager']} />,
            children: [
              {
                path: '/dashboard',
                element: <DashboardPage />,
              },
              {
                path: '/settings',
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])

function App() {
  const [db, setDb] = useState<Database | null>(null)

  useEffect(() => {
    let syncService: SyncService | null = null;

    const initDB = async () => {
      const database = await getDatabase()
      setDb(database)
      syncService = new SyncService(database)
    }
    initDB()

    return () => {
      syncService?.cleanup()
    }
  }, [])

  if (!db) {
    return <div className="flex h-screen items-center justify-center">Loading POS System...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider db={db}>
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  )
}

export default App
