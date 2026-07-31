'use client';

import { ReactNode } from 'react';
import { MechanicIllustration } from '@/components/auth/login-mechanic-illustration';

interface LoginLayoutProps {
  children: ReactNode;
}

export function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="login-page relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="login-page-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="login-card animate-fade-in-scale relative w-full max-w-[440px]">
        <div className="login-card-inner overflow-hidden rounded-2xl p-8 sm:p-10">
          {/* Brand + mechanic */}
          <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
            <MechanicIllustration />
            <div className="mt-4 sm:mt-0">
              <h1 className="text-2xl font-bold tracking-tight shell-text sm:text-[1.65rem]">
                Al-Thara
              </h1>
              <p className="mt-1 text-sm shell-text-muted">
                Garage Management System
              </p>
            </div>
          </div>

          <div className="login-card-divider mb-8" aria-hidden />

          <div className="mb-7">
            <h2 className="text-lg font-semibold text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Sign in to manage vehicles, work orders, and your garage operations.
            </p>
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/55">
          &copy; {new Date().getFullYear()} Al-Thara &middot; Secure business access
        </p>
      </div>
    </div>
  );
}
