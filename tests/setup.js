import { beforeEach, afterEach, vi } from 'vitest';

// Mock $app/environment to make browser = true in tests
vi.mock('$app/environment', () => ({
  browser: true
}));

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});
