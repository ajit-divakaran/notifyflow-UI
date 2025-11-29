import type { ReactNode } from "react"

const ProtectedRoute = ({ children }: { children: ReactNode }) => {


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