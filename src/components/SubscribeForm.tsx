'use client';

import { useId, useState } from 'react';

const FALLBACK_ERROR = 'Something went wrong. Try again.';

interface SubscribeFormProps {
  cta?: string;
  loadingLabel?: string;
}

export default function SubscribeForm({
  cta = 'Subscribe',
  loadingLabel = 'Subscribing',
}: SubscribeFormProps = {}) {
  const emailId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>(FALLBACK_ERROR);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        return;
      }

      const data = (await response.json().catch(() => null)) as { error?: unknown } | null;
      const serverMessage =
        data && typeof data.error === 'string' && data.error.trim() ? data.error : FALLBACK_ERROR;
      setErrorMessage(serverMessage);
      setStatus('error');
    } catch {
      setErrorMessage(FALLBACK_ERROR);
      setStatus('error');
    }
  }

  return (
    <form className="subscribe-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={emailId}>
        Email address
      </label>
      <input
        id={emailId}
        name="email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? loadingLabel : cta}
      </button>
      <p className="form-note">Unsubscribe anytime.</p>
      <div className="form-status" aria-live="polite">
        {status === 'success' && <p className="success">Check your inbox for confirmation.</p>}
        {status === 'error' && <p className="error">{errorMessage}</p>}
      </div>
    </form>
  );
}
