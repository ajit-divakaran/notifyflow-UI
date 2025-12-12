import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";

import { supabase } from "../integrations/supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  session_token: string | null;
  signUpWithGoogle: () => Promise<{ error: Error }>;
  signIn: (email: string, password: string) => Promise<{ error: Error }>;
  signUp: (email: string, password: string) => Promise<{ error: Error }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error }>;
}

type UserLoggedInState = {
  user: string | null;
  hasLogged: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserLoggedIn, setUserLoggedIn] = useState<UserLoggedInState>({user:null,hasLogged:false})
  const navigate = useNavigate();
  // Track if this is the very first check on page load
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // 1. Check Session on Startup
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // If we found a session immediately, it means they were ALREADY logged in
      if (session) {
        console.log("User was already logged in (Persistent Session)");
      }
      isFirstLoad.current = false;
    };

    checkSession();

    // 2. Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event);

      if (event === "SIGNED_IN" && session) {
        const user = session.user;
       

        // Convert timestamps to milliseconds
        const createdAt = new Date(user.created_at).getTime();
        const now = new Date().getTime();

        // Check difference in seconds
        const inSeconds = (now - createdAt) / 1000;
        console.log("User Created",inSeconds,"User Id",user.id)
        const isNewUser =  inSeconds < 600; // Created within last 60s

        if(!isUserLoggedIn.hasLogged){

          if (isNewUser) {
            // Run your one-time welcome logic here
            toast.success("Welcome! You have successfully signed in");
             
          }else{
            toast.success("Welcome back");
          }
          setUserLoggedIn({user:user.id,hasLogged:true})
        }

        setSession(session);
        setUser(session?.user ?? null);

      } else if (event === "INITIAL_SESSION") {
        // They were already logged in from a previous visit

        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        toast.info("You have been signed out.");

      } else if (event === "PASSWORD_RECOVERY") {
        // Handle password reset flow
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  const signUpWithGoogle = async () => {
    const redirectURL = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectURL, // Redirects back to your home page
      },
    });

    if (error) {
      {
        console.error("Sign in error:", error.message);
        return { error };
      }
    }

    navigate("/dashboard");
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Sign in error:", error.message);
        return { error };
      }
      navigate("/dashboard");
      return { error: null };
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .single();

      if (existingUser) {
        return { error: { message: "User already exists" } };
      }

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        console.error("Sign up error:", error.message);
        return { error };
      }
      return { error: null };
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const resetPassword = async (email: string) => {
    try {

      console.log("origin location", window.location.origin);
      const redirectUrl = `${window.location.origin}/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        console.error("Reset password error:", error.message);
        return { error };
      }
      return { error: null };
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        console.error("Update password error:", error.message);
        return { error };
      }
      return { error: null };
    } catch (error: unknown) {
      console.error("Update password error:", error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    session_token: session?.access_token || null,
    signUpWithGoogle,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

