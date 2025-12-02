import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // ⚠️ IMPORTANT: The user must land on the UPDATE page after clicking the email
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("Check your email for the password reset link.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {msg && <p>{msg}</p>}

      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}
