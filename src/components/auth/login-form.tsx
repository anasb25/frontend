'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, Lock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/lib/api';

export function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldErrorClass = error
    ? 'border-destructive/50 focus-within:border-destructive focus-within:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]'
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Username
          </Label>
          <div className={cn('login-field-wrap', fieldErrorClass)}>
            <span className="login-field-icon">
              <User className="h-4 w-4" />
            </span>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 border-0 bg-transparent pl-12 shadow-none focus:ring-0"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Password
          </Label>
          <div className={cn('login-field-wrap', fieldErrorClass)}>
            <span className="login-field-icon">
              <Lock className="h-4 w-4" />
            </span>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-0 bg-transparent pl-12 shadow-none focus:ring-0"
              autoComplete="current-password"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="group h-12 w-full rounded-xl text-sm font-semibold shadow-md"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in to dashboard
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}
