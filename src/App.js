import React from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route
} from "react-router-dom"

import SignIn from "./Pages/SignIn"
import ForgotPassword from "./Pages/ForgotPassword"
import LockScreen from "./Pages/LockScreen"
import ResetPassword from "./Pages/ResetPassword"
import PhoneCode from "./Pages/PhoneCode"
import Layout from "./App/Layout"
import { AuthProvider } from './providers/AuthProvider.js'
import PrivateRoute from './routes/PrivateRoute'

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/lock-screen" element={<LockScreen />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/phone-code" element={<PhoneCode />} />
                    <Route path="/" element={<PrivateRoute>
                        <Layout />
                    </PrivateRoute>} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App
