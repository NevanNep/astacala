"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";

function MenuIcon() {
  return (
    <div className="flex items-center gap-2 text-[#1E1E1E]" aria-hidden="true">
      <span className="flex flex-col gap-[5px]">
        <span className="h-[3px] w-[3px] rounded-full bg-current" />
        <span className="h-[3px] w-[3px] rounded-full bg-current" />
        <span className="h-[3px] w-[3px] rounded-full bg-current" />
      </span>
      <span className="flex flex-col gap-[6px]">
        <span className="h-[3px] w-9 rounded-full bg-current" />
        <span className="h-[3px] w-9 rounded-full bg-current" />
        <span className="h-[3px] w-9 rounded-full bg-current" />
      </span>
    </div>
  );
}

export function AdminHamburgerMenu({ className }: { className?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className={`rounded-full p-3 transition-colors hover:bg-[#F2F2F2] ${className || ""}`}
        aria-label="Buka navigasi admin"
        aria-expanded={isSidebarOpen}
        aria-controls="admin-navigation-drawer"
      >
        <MenuIcon />
      </button>

      {/* 
        To allow fade-out animations we render it unconditionally and 
        rely on internal classes in AdminSidebar to handle display
      */}
      <AdminSidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
