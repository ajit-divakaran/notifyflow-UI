import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Copy,
  Dot,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { supabase } from "@/integrations/supabase/supabaseClient";
import type { Database } from "@/integrations/supabase/database.types";

// type ServerType = "Production" | "Test" | ""
// interface ApiKey {
//   id: string;
//   name: string;
//   key: string;
//   created: Date;
//   lastUsed: Date | null;
// }
type APIKey = Database["public"]["Tables"]["api_keys"]["Row"];

const ApiKeys = () => {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [serverType, setServerType] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { session_token, user } = useAuth();

  const base_URL = import.meta.env.VITE_API_URL

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  // const maskKey = (key: string) => {
  //   return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
  // };

  const deleteKey = async(id:string) => {
    console.log(id)
       const config = {
      headers: {
        "Authorization": `Bearer ${session_token}`,
        "Content-Type": "application/json",
      },
    };
    // setKeys(keys.filter((k) => k.id !== id));
    const res = await axios.delete(`${base_URL}/api-key/delete/${id}`,config)
    console.log(res)
    if(!(res.data.length)){
      toast.error("Failed to delete the api key")
    console.error(res.statusText)
    }
    toast.success("API key deleted");
  };

      const fetchAPIKey = async () => {
      const config = {
        headers: {
          " Authorization": `Bearer ${session_token}`,
          "Content-Type": "application/json",
        },
      };
      const getAPIKeyData = await axios.get(
        `${base_URL}/api-key/get-user-api-keys`,
        config
      );
      const apikeysData = getAPIKeyData.data.data.data;
      console.log("queryResult", apikeysData);
      try {
        if (apikeysData) {
          setKeys(apikeysData);
        }
      } catch (error) {
        console.error("Error fetching api keys",error);
      }
    };

  useEffect(() => {

    fetchAPIKey();
  }, []);
  const handleCreateAPIKey = async () => {
    console.log("Session token", session_token);
    console.log("User ID", user?.id);
    setIsLoading(true);

    const payload = {
      label: serverType,
    };
    console.log("Paylaod", payload);

    // Simulate Backend API Call (Replace this with your real fetch)

 

    const config = {
      headers: {
        " Authorization": `Bearer ${session_token}`,
        "Content-Type": "application/json",
      },
    };

    const result = await axios.post(
      `${base_URL}/api-key/create-api-key`,
      payload, // <-- This is the DATA (2nd argument)
      config // <-- This is the CONFIGURATION (3rd argument)
    );
    // setTimeout(() => {
    //   const mockKey = "sk_live_" + Math.random().toString(36).substr(2, 24)

    //   // Success!
    //   setIsLoading(false)
    //   setIsFormOpen(false) // Close Form Modal
    //   setGeneratedKey(mockKey) // Open Result Modal
    // }, 2000)
    if (result) {
      console.log("User", user?.id);
    }

    setIsLoading(false);
    setIsFormOpen(false); // Close Form Modal
    setGeneratedKey(result.data.rawKey);
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("Copied to clipboard");
    }
  };

  // 3. Close Workflow
  const handleAttemptClose = () => {
    // Instead of closing immediately, open the confirmation alert
    setIsConfirmOpen(true);
  };

  const handleFinalClose = () => {
    // User said "Yes", close everything
    setIsConfirmOpen(false);
    setGeneratedKey(null);

    // Reset form for next time

    setServerType("Production");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">
            Manage your API keys for authentication
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate API KEY</DialogTitle>
              <DialogDescription>
                Create an api key for your project
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Name</Label>
                <Select value={serverType} onValueChange={setServerType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select server type for API" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="grid gap-3">
                <Label htmlFor="username-1">Username</Label>
                <Input
                  id="username-1"
                  name="username"
                  defaultValue="@peduarte"
                />
              </div> */}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateAPIKey} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Generating..." : "Create API Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- MODAL 2: THE SUCCESS RESULT --- */}
      <Dialog
        open={!!generatedKey}
        onOpenChange={(open) => !open && handleAttemptClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Here is your API Key</DialogTitle>
            <DialogDescription>
              Please copy this key immediately. You will not be able to see it
              again once you close this window.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                value={generatedKey || ""}
                readOnly
                className="font-mono text-xs bg-slate-50"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={handleCopy}
            >
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleAttemptClose}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: THE CONFIRMATION ALERT --- */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Have you copied your API key? Once you close this window, you will
              <strong> never </strong> be able to view this key again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmOpen(false)}>
              No, go back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalClose}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, I have copied it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {console.log(keys)}
        {keys.map((apiKey) => (
          <div className="card w-full bg-gray-100 p-4 border-2 border-gray-200 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full mr-2 pr-[2rem] md:pr-[4rem]">
                <div className = "flex justify-between items-center ">
                  {apiKey.label?.at(0)?.toUpperCase() + apiKey.label?.slice(1)}
                  <Dot
                    size={16} // Adjust size as needed
                    fill="green" // Set the fill color to green
                    color="green" // Set the stroke color to green (to match the fill)
                    strokeWidth={10}
                    className="ml-2" // Optional: set strokeWidth to 0 to ensure it's a solid circle
                  />
                </div>
                <p>{apiKey?.display_key}</p>
              </div>
              <Trash2 onClick={()=>{deleteKey(apiKey.id)}} className="hover:text-red-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeys;
