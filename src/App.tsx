import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'

import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Reports from './pages/dashboard/Reports'
import Appointments from './pages/dashboard/Appointments'
import Payments from './pages/dashboard/Payments'
import Transactions from './pages/dashboard/Transactions'
import Employees from './pages/dashboard/Employees'
import CustomerPortal from './pages/customer/CustomerPortal'
import CustomerBooking from './pages/customer/CustomerBooking'
import CustomerHistory from './pages/customer/CustomerHistory'
import CustomerCars from './pages/customer/CustomerCars'
import CustomerProfile from './pages/customer/CustomerProfile'

import ServiceManagement from './pages/dashboard/ServiceManagement'
import PromotionManagement from './pages/dashboard/PromotionManagement'
import TierManagement from './pages/dashboard/TierManagement'
import { Toaster } from 'sonner'
import ProtectedRoute from './components/auth/ProtectedRoute'

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '')
      const timer = setTimeout(() => {
        const elem = document.getElementById(targetId)
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster richColors position="top-right" duration={2000} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Portal & Features */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerPortal />
          </ProtectedRoute>
        } />
        <Route path="/customer/booking" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerBooking />
          </ProtectedRoute>
        } />
        <Route path="/customer/history" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerHistory />
          </ProtectedRoute>
        } />
        <Route path="/customer/cars" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerCars />
          </ProtectedRoute>
        } />
        <Route path="/customer/profile" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerProfile />
          </ProtectedRoute>
        } />

        {/* Admin/Manager/Staff Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="tiers" element={<TierManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="employees" element={<Employees />} />
        </Route>

        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  )
}
