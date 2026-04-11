'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

      setStatus(response.ok ? 'success' : 'error');
      if (response.ok) {
        setEmail('');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className="subscribe-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="email">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing' : 'Subscribe'}
      </button>
      <p className="form-note">Unsubscribe anytime.</p>
      <div className="form-status" aria-live="polite">
        {status === 'success' && <p className="success">Check your inbox for confirmation.</p>}
        {status === 'error' && <p className="error">Something went wrong. Try again.</p>}
      </div>
    </form>
  );
}
