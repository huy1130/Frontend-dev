import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'

import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Reports from './pages/dashboard/Reports'
import Appointments from './pages/dashboard/Appointments'
import Payments from './pages/dashboard/Payments'
import Transactions from './pages/dashboard/Transactions'
import Requests from './pages/dashboard/Requests'
import Employees from './pages/dashboard/Employees'
import CustomerPortal from './pages/customer/CustomerPortal'
import CustomerBooking from './pages/customer/CustomerBooking'
import CustomerHistory from './pages/customer/CustomerHistory'
import CustomerCars from './pages/customer/CustomerCars'
import CustomerProfile from './pages/customer/CustomerProfile'

import ServiceManagement from './pages/dashboard/ServiceManagement'
import PromotionManagement from './pages/dashboard/PromotionManagement'
import RewardManagement from './pages/dashboard/RewardManagement'
import TierManagement from './pages/dashboard/TierManagement'
import TimeSlotManagement from './pages/dashboard/TimeSlotManagement'
import { Toaster } from 'sonner'
import ProtectedRoute from './components/auth/ProtectedRoute'

const DashboardIndex = () => {
  const role = localStorage.getItem('userRole')?.toLowerCase()
  if (role === 'staff') {
    return <Navigate to="/dashboard/appointments" replace />
  }
  return <Dashboard />
}

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
          <Route index element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
              <DashboardIndex />
            </ProtectedRoute>
          } />
          <Route path="services" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ServiceManagement />
            </ProtectedRoute>
          } />
          <Route path="timeslots" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <TimeSlotManagement />
            </ProtectedRoute>
          } />
          <Route path="promotions" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <PromotionManagement />
            </ProtectedRoute>
          } />
          <Route path="rewards" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <RewardManagement />
            </ProtectedRoute>
          } />
          <Route path="tiers" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <TierManagement />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="appointments" element={<Appointments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="requests" element={<Requests />} />
          <Route path="employees" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Employees />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  )
}
