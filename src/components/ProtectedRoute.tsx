import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!user) {
    // If not logged in, kick them to Login page
    return <Navigate to="/login" replace />
  }

  return children
  
}

export default ProtectedRoute



// import { ReactNode } from 'react';  

// type ParentComponentProps = {
//   // Your other props here...
//   children: ReactNode; // <--- ADD THIS LINE
// };

// export const ParentComponent = ({ children }: ParentComponentProps) => {
//   return (
//     <div className="parent-wrapper">
//       {/* This is where the ChildComponent will appear */}
//       {children} 
//     </div>
//   );
// };