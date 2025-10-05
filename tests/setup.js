import { beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let templateHTML, templateCSS;

// Load template files once before all tests
beforeAll(() => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  templateHTML = readFileSync(
    join(__dirname, '../docs/editable-table/template.html'),
    'utf8'
  );
  templateCSS = readFileSync(
    join(__dirname, '../docs/editable-table/styles.css'),
    'utf8'
  );
});

beforeEach(() => {
  // Use vi.stubGlobal for proper test isolation
  vi.stubGlobal('fetch', vi.fn((url) => {
    if (url.includes('template.html')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(templateHTML)
      });
    }
    if (url.includes('styles.css')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(templateCSS)
      });
    }
    return Promise.reject(new Error(`Unmocked fetch: ${url}`));
  }));

  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
  vi.unstubAllGlobals(); // Vitest's cleanup for stubGlobal
});

// Add custom matchers or global test utilities here if needed
