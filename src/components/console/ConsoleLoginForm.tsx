'use client';

import { useActionState } from 'react';

import { Field, inputClass } from '@/components/ui/Field';
import { consoleSignIn, type LoginState } from '@/app/console/login/actions';

const INITIAL: LoginState = { status: 'idle' };

export function ConsoleLoginForm() {
  const [state, formAction, pending] = useActionState(consoleSignIn, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Adresse de l’opérateur"
        htmlFor="email"
        required
        error={state.status === 'error' ? state.message : undefined}
      >
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          className={inputClass}
        />
      </Field>

      <Field label="Mot de passe" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-medium text-accent-ink transition active:scale-[0.99] hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>

      <p className="text-center text-xs leading-relaxed text-ink-400">
        Accès restreint à l’opérateur. Mot de passe géré depuis Supabase
        (Authentication → Users).
      </p>
    </form>
  );
}
