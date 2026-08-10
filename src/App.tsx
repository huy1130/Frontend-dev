import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Customer Portal Route */}
        <Route path="/customer" element={<CustomerPortal />} />

        {/* Admin/Manager/Staff Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
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
