import type { Metadata } from 'next';

import {
  MORNING_PORTION_LIGHTNING_URL,
  STRIPE_PAYMENT_LINK_URL,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Support',
  description:
    'Support The Morning Portion and help keep weekday scripture reflections freely available.',
  alternates: {
    canonical: '/support',
  },
  openGraph: {
    title: 'Support The Morning Portion',
    description:
      'Support The Morning Portion and help keep weekday scripture reflections freely available.',
    url: '/support',
    type: 'website',
  },
};

type SupportAction = {
  href: string;
  label: string;
  variant: 'primary' | 'secondary';
};

function getSupportActions(): SupportAction[] {
  const actions: SupportAction[] = [];

  if (STRIPE_PAYMENT_LINK_URL) {
    actions.push({
      href: STRIPE_PAYMENT_LINK_URL,
      label: 'Support with card',
      variant: 'primary',
    });
  }

  if (MORNING_PORTION_LIGHTNING_URL) {
    actions.push({
      href: MORNING_PORTION_LIGHTNING_URL,
      label: 'Support with Lightning',
      variant: STRIPE_PAYMENT_LINK_URL ? 'secondary' : 'primary',
    });
  }

  return actions;
}

export default function SupportPage() {
  const actions = getSupportActions();

  return (
    <main className="support-page">
      <div className="support-content">
        <section className="support-intro" aria-labelledby="support-heading">
          <p className="eyebrow">Support</p>
          <h1 id="support-heading" className="tdw-display">
            Help keep The Morning Portion freely available.
          </h1>
          <p>
            These readings are free and will stay that way. One-time support helps with the time,
            tools, and publishing costs behind each weekday reflection.
          </p>
        </section>

        <section className="support-row" aria-labelledby="support-action-heading">
          <div className="support-row-copy">
            <p>One-time support</p>
            <h2 id="support-action-heading">Send a simple gift</h2>
          </div>

          {actions.length > 0 ? (
            <div className="support-actions">
              {actions.map((action) => (
                <a
                  key={action.href}
                  className={`button ${action.variant}`}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {action.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="support-pending">
              Support options are being set up. Thank you for wanting to help.
            </p>
          )}
        </section>

        <p className="support-note">
          No account required. Support is optional; subscribing and reading remain free.
        </p>
      </div>
    </main>
  );
}
