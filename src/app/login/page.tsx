import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { LoginBranding } from "@/components/auth/login-branding";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to PalmLearn",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh">
      <LoginBranding />
      <div className="flex flex-1 items-center justify-center bg-surface p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-[440px]">
          <div className="rounded-2xl border border-border/50 bg-surface/80 backdrop-blur-xl shadow-xl shadow-primary-500/5 p-6 sm:p-8 lg:p-10 animate-fade-in">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
