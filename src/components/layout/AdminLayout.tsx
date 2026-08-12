import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-dark-950 text-white font-['Montserrat',sans-serif] relative overflow-hidden">

      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl -ml-64 -mb-64 pointer-events-none" />

      {/* Sidebar Component */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Simple Header inside Dashboard */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-dark-900/60 backdrop-blur-md">
          <h1 className="text-lg font-extrabold text-white tracking-tight">Cổng Quản Trị Hệ Thống HYBRIDWASH</h1>


        </header>

        {/* Dynamic Nested Route Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
