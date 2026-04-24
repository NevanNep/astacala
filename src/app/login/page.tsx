"use client";

import React from "react";
/*import { Navbar } from "../../components/Navbar";*/
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col relative w-full">
      {/*<Navbar variant="public" />*/}
      
      <main className="w-full relative flex-1 flex items-center justify-center overflow-hidden">
        
        {/* Full Background Layout */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=2000&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Centered Login Card */}
        <div className="relative z-10 w-full px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[480px]">
            
            <div className="mb-6 md:mb-8 flex flex-col items-center">
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                Sign in
              </h1>
              <div className="w-[32px] h-[3px] bg-[var(--color-primary)] rounded-full" />
            </div>

            <form className="space-y-6 md:space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <Input
                  label="Email / Username"
                  type="email"
                  placeholder="email@astacala.id"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-3 h-3 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)]" 
                  />
                  <span className="text-[var(--text-caption)] text-[var(--color-text-secondary)]">
                    Remember Me
                  </span>
                </label>
                <a href="#" className="text-[var(--text-caption)] font-medium text-[var(--color-primary)] hover:underline">
                  Forgot Password?
                </a>
              </div>

              <div className="pt-2">
                <Button variant="primary" fullWidth className="mt-6">
                  Login
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
                Don&apos;t have an account?{" "}
                <a href="#" className="text-[var(--color-primary)] font-medium hover:underline">
                  Sign up
                </a>
              </p>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
