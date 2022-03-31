import React, { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../providers/AuthProvider"

export default function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext)

  return user ? children : <Navigate to='/sign-in' />
}