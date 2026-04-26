"use client";

import React from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col relative w-full">
      <main className="w-full relative flex-1 flex items-center justify-center overflow-hidden">
        
        {/* Full Background Layout - Same as S02 */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: "url('/images/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Centered Register Card */}
        <div className="relative z-10 w-full px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[480px]">
            
            <div className="mb-6 md:mb-8 flex flex-col items-center">
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                Sign up
              </h1>
              <div className="w-[32px] h-[3px] bg-[var(--color-primary)] rounded-full" />
            </div>

            <form className="space-y-6 md:space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  placeholder="Relawan Name"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="email@gmail.com"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" fullWidth className="mt-6">
                  Create Account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
                Already have an account?{" "}
                <a href="/login" className="text-[var(--color-primary)] font-medium hover:underline">
                  Sign in
                </a>
              </p>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
