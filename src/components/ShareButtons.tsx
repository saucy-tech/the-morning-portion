'use client';

import { useCallback, useMemo, useState } from 'react';

type ShareButtonsProps = {
  title: string;
  url: string;
  excerpt?: string;
};

const COPY_RESET_MS = 2000;

export default function ShareButtons({ title, url, excerpt }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = excerpt ?? title;

  const shareUrls = useMemo(() => {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    const emailBody = encodeURIComponent([title, excerpt, url].filter(Boolean).join('\n\n'));

    return {
      x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${emailBody}`,
    };
  }, [excerpt, title, url]);

  const copyLink = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      await copyLink();
      return;
    }

    try {
      await navigator.share({ title, text: shareText, url });
    } catch {
      await copyLink();
    }
  }, [copyLink, shareText, title, url]);

  return (
    <section className="share-card" aria-label="Share this reflection">
      <p className="eyebrow">Share</p>
      <h2 className="tdw-display">Share</h2>
      <div className="share-actions">
        <div className="share-actions-mobile">
          <button className="button primary" type="button" onClick={handleNativeShare}>
            Share
          </button>
        </div>
        <div className="share-actions-desktop">
          <a
            className="share-icon-button"
            href={shareUrls.x}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on X"
          >
            <img className="share-icon" src="/icons/x.svg" alt="" aria-hidden="true" />
          </a>
          <a
            className="share-icon-button"
            href={shareUrls.facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Share on Facebook"
          >
            <img className="share-icon" src="/icons/facebook.svg" alt="" aria-hidden="true" />
          </a>
          <a
            className="share-icon-button"
            href={shareUrls.email}
            aria-label="Share via email"
          >
            <svg
              className="share-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
              <path d="M22 8l-10 7L2 8" />
            </svg>
          </a>
          <button
            className="share-icon-button"
            type="button"
            onClick={copyLink}
            aria-label="Copy link"
          >
            <svg
              className="share-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8.25 7.5V6A2.25 2.25 0 0 1 10.5 3.75h5.25A2.25 2.25 0 0 1 18 6v5.25A2.25 2.25 0 0 1 15.75 13.5h-1.5" />
              <path d="M6 8.25h6A2.25 2.25 0 0 1 14.25 10.5v7.5A2.25 2.25 0 0 1 12 20.25H6A2.25 2.25 0 0 1 3.75 18v-7.5A2.25 2.25 0 0 1 6 8.25z" />
            </svg>
          </button>
        </div>
      </div>
      <p className="share-feedback" aria-live="polite">
        {copied ? 'Copied!' : ''}
      </p>
    </section>
  );
}
