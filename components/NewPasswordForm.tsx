"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { VristoLogo } from "@/components/vristo-logo";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const init = async () => {
      const code = searchParams?.get("code") ?? null;
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setError("Invalid or expired reset link. Please request a new password reset.");
        else setIsValidToken(true);
        return;
      }

      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) setError("Invalid or expired reset link. Please request a new password reset.");
          else setIsValidToken(true);
          return;
        }
      }

      setError("Invalid or missing reset link. Please request a new password reset.");
    };

    init();
  }, [searchParams]);

  const validatePassword = (pw: string) => pw.length < 6 ? "Password must be at least 6 characters long" : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsSuccess(false);

    if (!password || !confirmPassword) return setError("Please fill in both fields");
    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (!isValidToken) return setError("Invalid or expired reset link. Please request a new password reset.");

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setError(error.message);
      else {
        setIsSuccess(true);
        setMessage("Password updated successfully! Redirecting to your account...");
        setTimeout(() => router.replace("/account"), 2000);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-6">
            <div className="rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <VristoLogo />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Set New Password</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your new password below. Make sure it's secure and easy to remember.
            </p>
          </div>

          {isSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <p className="text-green-800 dark:text-green-200 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {isValidToken && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </Label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={isLoading || isSuccess}>
                {isLoading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="text-center">
            <Link href="/auth" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              <ArrowLeft size={16} className="mr-1" /> Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 items-center justify-center p-8">
        <div className="relative w-full max-w-lg text-center space-y-4">
          <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center">
            <Lock size={48} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-green-900 dark:text-green-100">Secure Your Account</h3>
          <p className="text-green-800 dark:text-green-200">
            Choose a strong password to keep your account safe and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
