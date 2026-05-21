import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const sourceDir =
  process.env.PERSONAL_SITE_POSTS_DIR || path.resolve(repoRoot, '..', 'personal-site', 'src', 'posts');
const targetDir = path.join(repoRoot, 'src', 'content', 'posts');

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Source posts directory not found: ${sourceDir}`);
}

fs.mkdirSync(targetDir, { recursive: true });

// The authoring repo still labels this stream as "Daily Word"; this app publishes it
// as The Morning Portion.
const morningPortionFiles = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith('.mdx'))
  .filter((file) => {
    const raw = fs.readFileSync(path.join(sourceDir, file), 'utf8');
    return /^category:\s*['"]?Daily Word['"]?\s*$/m.test(raw);
  });

const existingFiles = fs.readdirSync(targetDir).filter((file) => file.endsWith('.mdx'));
for (const file of existingFiles) {
  if (!morningPortionFiles.includes(file)) {
    fs.rmSync(path.join(targetDir, file));
  }
}

for (const file of morningPortionFiles) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}

console.log(`Synced ${morningPortionFiles.length} Morning Portion posts from ${sourceDir}`);
