import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">Not Found</p>
      <h1>That reflection is not here.</h1>
      <p>The archive is the best place to pick the thread back up.</p>
      <Link className="button primary" href="/#archive">
        Browse archive
      </Link>
    </main>
  );
}
