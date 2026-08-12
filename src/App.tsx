import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminLayout from './components/layout/AdminLayout'
import StaffLayout from './components/layout/StaffLayout'
import Dashboard from './pages/admin/Dashboard'
import Reports from './pages/admin/Reports'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminPayments from './pages/admin/Payments'
import AdminTransactions from './pages/admin/Transactions'
import Employees from './pages/admin/Employees'

import StaffAppointments from './pages/staff/StaffAppointments'
import StaffPayments from './pages/staff/Payments'
import StaffTransactions from './pages/staff/Transactions'
import Requests from './pages/staff/Requests'

import CustomerPortal from './pages/customer/CustomerPortal'
import CustomerBooking from './pages/customer/CustomerBooking'
import CustomerHistory from './pages/customer/CustomerHistory'
import CustomerCars from './pages/customer/CustomerCars'
import CustomerProfile from './pages/customer/CustomerProfile'

import ServiceManagement from './pages/admin/ServiceManagement'
import PromotionManagement from './pages/admin/PromotionManagement'
import RewardManagement from './pages/admin/RewardManagement'
import TierManagement from './pages/admin/TierManagement'
import TimeSlotManagement from './pages/admin/TimeSlotManagement'
import { Toaster } from 'sonner'
import ProtectedRoute from './components/auth/ProtectedRoute'

const AdminIndex = () => <Dashboard />
const StaffIndex = () => <Navigate to="/staff/appointments" replace />

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

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminIndex />} />
          <Route path="services" element={<ServiceManagement />} />
          <Route path="timeslots" element={<TimeSlotManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
          <Route path="rewards" element={<RewardManagement />} />
          <Route path="tiers" element={<TierManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="employees" element={<Employees />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StaffIndex />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="payments" element={<StaffPayments />} />
          <Route path="transactions" element={<StaffTransactions />} />
          <Route path="requests" element={<Requests />} />
        </Route>

        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  )
}
