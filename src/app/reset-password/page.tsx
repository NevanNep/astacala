"use client";

import React, { useState } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Validation rules
  const reqLength = password.length >= 8;
  const reqUppercase = /[A-Z]/.test(password);
  const reqNumber = /[0-9]/.test(password);
  const reqSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const isMatch = password === confirmPassword;
  const showError = isSubmitted && !isMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // Check if all rules pass and passwords match
    if (reqLength && reqUppercase && reqNumber && reqSymbol && isMatch) {
      // Simulate success
      router.push("/reset-password/success");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full">
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

        {/* Centered Card */}
        <div className="relative z-10 w-full px-4 flex items-center justify-center py-8">
          <div className="bg-white rounded-[var(--radius-xl)] shadow-xl p-6 md:p-8 w-full max-w-[400px] md:max-w-[480px]">
            
            <div className="mb-6 md:mb-8 flex flex-col items-center text-center">
              <h1 className="text-[var(--text-heading)] font-semibold text-[var(--color-text-primary)] mb-2">
                Buat Password Baru
              </h1>
              
              <p className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] max-w-[280px]">
                Masukkan password baru untuk akun kamu
              </p>
            </div>

            <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-4">
                
                <Input
                  label="Password Baru"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* Password Requirements Checklist */}
                <div className="bg-[var(--color-bg-muted)] p-3 rounded-[var(--radius-md)] border-[0.5px] border-[var(--color-border)] mt-2">
                  <span className="text-[var(--text-nano)] text-[var(--color-text-tertiary)] block mb-2">
                    Syarat password:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-[5px] h-[5px] rounded-full ${reqLength ? "bg-[var(--color-success)]" : "bg-[#D9D9D9]"}`} />
                      <span className={`text-[var(--text-nano)] ${reqLength ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}>
                        Min. 8 karakter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-[5px] h-[5px] rounded-full ${reqUppercase ? "bg-[var(--color-success)]" : "bg-[#D9D9D9]"}`} />
                      <span className={`text-[var(--text-nano)] ${reqUppercase ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}>
                        Huruf besar
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-[5px] h-[5px] rounded-full ${reqNumber ? "bg-[var(--color-success)]" : "bg-[#D9D9D9]"}`} />
                      <span className={`text-[var(--text-nano)] ${reqNumber ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}>
                        Angka
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-[5px] h-[5px] rounded-full ${reqSymbol ? "bg-[var(--color-success)]" : "bg-[#D9D9D9]"}`} />
                      <span className={`text-[var(--text-nano)] ${reqSymbol ? "text-[var(--color-success)]" : "text-[var(--color-text-tertiary)]"}`}>
                        Simbol
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Input
                    label="Konfirmasi Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (isSubmitted) setIsSubmitted(false);
                    }}
                    error={showError ? "Password tidak cocok" : undefined}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button variant="primary" fullWidth className="mt-6">
                  Simpan Password Baru
                </Button>
              </div>
            </form>
            
          </div>
        </div>
      </main>
    </div>
  );
}
