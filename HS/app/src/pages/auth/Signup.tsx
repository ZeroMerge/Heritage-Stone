import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuthStore } from "@/store";
import { cn } from "@/lib/utils";

export function Signup() {
  const navigate = useNavigate();
  useAuthStore(); // initialise store subscription
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await useAuthStore.getState().signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      navigate("/studio");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--hs-primary)] flex items-center justify-center mx-auto mb-4">
            <span className="text-white dark:text-[#0f0f0f] font-bold text-xl">HS</span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            HeritageStone Studio
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Create your account
          </p>
        </div>

        {/* Form */}
        <div className="bg-[var(--surface-default)] border border-[var(--border-subtle)] p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="John"
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                      "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                      "focus:outline-none focus:border-[var(--hs-accent)] focus:ring-1 focus:ring-[var(--hs-accent)]",
                      "transition-colors"
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Doe"
                  className={cn(
                    "w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                    "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                    "focus:outline-none focus:border-[var(--hs-accent)] focus:ring-1 focus:ring-[var(--hs-accent)]",
                    "transition-colors"
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@company.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                    "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                    "focus:outline-none focus:border-[var(--hs-accent)] focus:ring-1 focus:ring-[var(--hs-accent)]",
                    "transition-colors"
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                    "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                    "focus:outline-none focus:border-[var(--hs-accent)] focus:ring-1 focus:ring-[var(--hs-accent)]",
                    "transition-colors"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                className={cn(
                  "w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)]",
                  "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                  "focus:outline-none focus:border-[var(--hs-accent)] focus:ring-1 focus:ring-[var(--hs-accent)]",
                  "transition-colors"
                )}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-2.5 px-4 bg-[var(--hs-primary)] text-white dark:text-[#0f0f0f] font-medium",
                "hover:bg-[var(--text-primary)] transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--hs-accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
