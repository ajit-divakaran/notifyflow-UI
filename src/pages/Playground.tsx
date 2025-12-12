import EmailValidation from "@/components/EmailValidation";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/supabaseClient";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// --- Configuration: Templates & Parameters ---
const EMAIL_TEMPLATES = {
  welcome: {
    label: "Welcome User",
    params: ["username", "verify_link", "support_email"],
    html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #4F46E5; padding: 20px; color: white; text-align: center;">
      <h1>Welcome, {{username}}!</h1>
    </div>
    <div style="padding: 20px;">
      <p>Thanks for joining us. We are thrilled to have you on board.</p>
      <p>Please verify your email by clicking the button below:</p>
      <a href="{{verify_link}}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Verify Email</a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">If you have issues, contact {{support_email}}.</p>
    </div>
  </div>
</body>
</html>`,
  },
  order_update: {
    label: "Order Update",
    params: ["order_id", "customer_name", "item_name", "delivery_date"], // 4 parameters
    html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; border-top: 4px solid #10B981;">
    <h2>Order Update: #{{order_id}}</h2>
    <p>Hi {{customer_name}},</p>
    <p>Good news! Your item <strong>{{item_name}}</strong> is on the way.</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>Expected Delivery:</strong> {{delivery_date}}
    </div>
    <p>Thank you for shopping with us!</p>
  </div>
</body>
</html>`,
  },
  payment_success: {
    label: "Payment Confirmation",
    params: ["transaction_id", "amount", "date"], // 3 parameters
    html: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <h2 style="color: #059669;">Payment Successful</h2>
    <p style="font-size: 24px; font-weight: bold;">{{amount}}</p>
    <p style="color: #6b7280;">Transaction ID: {{transaction_id}}</p>
    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 14px;">Date: {{date}}</p>
  </div>
</body>
</html>`,
  },
};

const Playground = () => {
  // --- State ---
  const [brevoKey, setBrevoKey] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("welcome");
  const [subject, setSubject] = useState("")
  const [emailError, setEmailError] = useState({})

  // Stores the dynamic values for the parameters (e.g. { username: 'John' })
  const [paramValues, setParamValues] = useState({});

  // The HTML code being edited/displayed
  const [code, setCode] = useState("");
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [isCodeError, setIsCodeError] = useState({});
  const [emailPreviewCode, setEmailPreviewCode] = useState("")

  // Tabs: 'preview' or 'code'
  const [activeTab, setActiveTab] = useState("preview");
  const { user, session_token } = useAuth();

  const base_URL = import.meta.env.VITE_API_URL

  // --- Effects ---

  // When event changes, load the default template and reset params

    useEffect(() => {
    const template = EMAIL_TEMPLATES[selectedEvent];
    setCode(template.html);

    // Create an empty param object based on the required fields
    const initialParams = {};
    template.params.forEach((param) => {
      initialParams[param] = `[${param}]`; // Default placeholder text
    });
    setParamValues(initialParams);
    // setIsEditingCode(false);
  }, [selectedEvent]);

    useEffect(()=>{
  // Function to replace {{key}} with value in the HTML
  let preview = code;
  const getPreviewHtml = () => {
    
    console.log("Inside", paramValues);
    Object.keys(paramValues).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      preview = preview.replace(regex, paramValues[key]);
    });
    
  };
  getPreviewHtml()
  setEmailPreviewCode(preview)
  }
  ,[paramValues])

function getPreviewHTML(){
  return emailPreviewCode
}

  // useEffect(() => {
  //   const preview = code;
  //   const regex = /{{.*?}}/g;
  //   const template = EMAIL_TEMPLATES[selectedEvent];

  //   const matches = (preview.match(regex) || []).map((item) => {
  //     return item.slice(2, -2).trim();
  //   });
  //   console.log("Matches",matches)

  //   function changePreviewHtml(){
  //     console.log(paramValues)

  //     matches.forEach((param) => {
  //       if (!(param in paramValues)) {
  //         console.log(param, paramValues)
  //         setIsCodeError({
  //           error: `Parameter "{{${param}}}" is used in the code but not defined in parameters`,
  //         });
  //         return;
  //       }
        
  //     });
  //     // const new_params:Record<string,string> = {}
  //     // matches.forEach((param)=>{
  //     //   new_params[param] = `[${param}]`
  //     // }) 
  //     // console.log("New params",new_params)
  //     // template.params = matches
  //     // // template.html = code
  //     // setParamValues(new_params)
  //     setEmailPreviewCode(preview)
  //     setIsCodeError({});
  //   }

  //   changePreviewHtml()

  // }, [isEditingCode]);

  // --- Helpers ---


const handleEditingCode = () =>{

  
  setIsEditingCode(!isEditingCode)
  if(!isEditingCode){
    const preview = code;
    const regex = /{{.*?}}/g;
    const template = EMAIL_TEMPLATES[selectedEvent];

    const matches = (preview.match(regex) || []).map((item) => {
      return item.slice(2, -2).trim();
    });
    console.log("Matches",matches)

 
      console.log(paramValues)

      matches.forEach((param) => {
        if (!(param in paramValues)) {
          console.log(param, paramValues)
          setIsCodeError({
            error: `Parameter "{{${param}}}" is used in the code but not defined in parameters`,
          });
          return;
        }
        
      });
      const new_params:Record<string,string> = {}
      matches.forEach((param)=>{
        new_params[param] = `[${param}]`
      }) 
      console.log("New params",new_params)
      template.params = matches
      // template.html = code
      setParamValues(new_params)
      setEmailPreviewCode(preview)
      setIsCodeError({});
  }
  
}


  const handleParamChange = (key, value) => {
    setParamValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSendEmail = async () => {
    let result;
    try {
      result = await supabase
        .from("profiles")
        .select("credits_used")
        .eq("id", user?.id);
    } catch (err) {
      console.error("Error Fetching data", err);
      return;
    }

    const credits_used = result?.data.length? result?.data[0].credits_used : 0;

    console.log("Sending Email...");
    console.log("User Credits used", credits_used)
    console.log("API Key:", brevoKey);
    console.log("From", senderEmail);
    console.log("To:", recipientEmail);
    console.log("HTML Body:",emailPreviewCode);
    console.log("Selected event", selectedEvent)
    console.log("Subject",subject)
    const html_body = emailPreviewCode;

    if(!brevoKey || !senderEmail || !recipientEmail){
        toast.error("Please provide necessary inputs");
        return;
    }
    else if(!html_body){
        toast.error("Cannot have an empty HTML body");
        return;
    }else if(emailError){
       alert("Invalid Email") 
    }
    else{
      const payload = {
        event: selectedEvent,
        channels: ["EMAIL"],
        credits_used:credits_used,
        brevoApiKey: brevoKey,
        data:{
          fromEmail: senderEmail,
          toEmail: recipientEmail,
          subject: subject || selectedEvent,
          htmlContent: html_body
        }
      }

      console.log(payload)

       const config = {
      headers: {
        "Authorization": `Bearer ${session_token}`,
        "Content-Type": "application/json",
      },
    };

    const result = await axios.post(`${base_URL}/test-trigger`,payload,config)
    console.log("API response", result)
    if(result.status == 200){
      toast.success("Test Email Sent Successfully")
      
    }
    else{
      toast.error("Failed to send Test email",)
    }
    }

    ;
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      {/* SECTION 1: Config (Compact Height) */}
      <div className="bg-white p-4 border-b shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3  gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              From Email
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
            <EmailValidation email = {senderEmail} setEmailError = {setEmailError} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
              Recipient Email
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
            <EmailValidation email = {recipientEmail} setEmailError = {setEmailError} />
          </div>
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-sm font-semibold text-gray-600">
              Brevo API Key
            </label>
            <input
              type="password"
              placeholder="xkeysib-..."
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={brevoKey}
              onChange={(e) => setBrevoKey(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Split View (Responsive, Expands to fill space) */}
      <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* LEFT COLUMN: Controls & Parameters */}
          <div className="bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-100 border-b">
              <h3 className="font-bold text-gray-700">Configuration</h3>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Event Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">
                  Select Event Type
                </label>
                <select
                  className="border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                >
                  {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4"></div>

              {/* Dynamic Parameters */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Template Parameters
                </h4>
                 <div className="flex flex-col gap-2">
                     <label className="text-xs font-semibold text-gray-500">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={subject}
                        placeholder="Enter the subject"
                        onChange={(e) => {setSubject(e.target.value)}}
                      />
                 </div>
                {EMAIL_TEMPLATES[selectedEvent].params.map((param) => (
                  <div key={param} className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 capitalize">
                      {param.replace("_", " ")}
                    </label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={paramValues[param] || ""}
                      onChange={(e) => handleParamChange(param, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Code & Preview Tabs */}
          <div className="bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden h-full">
            {/* Tab Header */}
            <div className="flex border-b bg-gray-50">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "preview"
                    ? "bg-white text-blue-600 border-t-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === "code"
                    ? "bg-white text-blue-600 border-t-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Template Code
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 relative overflow-hidden bg-gray-100">
              {/* PREVIEW TAB */}
              {activeTab === "preview" && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <div className="w-full h-full bg-white shadow-md border rounded overflow-hidden">
                    {console.log(isCodeError)}
                    <iframe
                      title="email-preview"
                      srcDoc={
                        Object.keys(isCodeError).length
                          ? isCodeError.error
                          : 
                          getPreviewHTML()
                      }
                      className="w-full h-full border-0"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              )}

              {/* CODE TAB */}
              {activeTab === "code" && (
                <div className="flex flex-col h-full">
                  <div className="bg-gray-800 text-white p-2 flex justify-end">
                    <button
                      onClick={handleEditingCode}
                      className={`text-xs px-3 py-1 rounded border ${
                        isEditingCode
                          ? "bg-green-600 border-green-600 text-white"
                          : "border-gray-500 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {isEditingCode ? "Done Editing" : "Edit Code"}
                    </button>
                  </div>
                  <textarea
                    className={`flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none ${
                      isEditingCode
                        ? "bg-white text-gray-800"
                        : "bg-gray-900 text-green-400 cursor-not-allowed"
                    }`}
                    value={code}
                    readOnly={!isEditingCode}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Action Button (Compact) */}
      <div className="bg-white border-t p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button
            onClick={handleSendEmail}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition active:scale-95"
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default Playground;
