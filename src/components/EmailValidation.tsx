import { useEffect, useState } from "react";

const EmailValidation = ({email,setEmailError}) => {
  // const [currentEmail,setCurrentEmail] = useState("")
  const [error,setError] = useState(false)
  const emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
    useEffect(()=>{
      // setCurrentEmail(email)
      function checkEmailisValid(email:string){
      //   if(email === ""){
      //   setEmailError(true);
      //   return;
        
      // }

      if(!(emailRegex.test(email)) && email.length){
        setError(true)
        setEmailError(true);
        return;
      }
   
     
        setError(false)
        setEmailError(false)
      
      }
      setTimeout(()=>{checkEmailisValid(email)},1500)
      
    },[email])
  return (
    <div>
      {error && <p className="text-red-500">Invalid Email address</p>}
    </div>
  )
}

export default EmailValidation