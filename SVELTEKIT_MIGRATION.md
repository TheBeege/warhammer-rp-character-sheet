# SvelteKit Migration Plan

## Overview

Migrate existing project from vanilla Web Components to SvelteKit in place.

**Status:** ✅ Tests written and passing (8/8) - ready to migrate with confidence

## Pre-Migration State

### What Works ✅
- LocalStorage auto-save/load for form inputs (validated by 8 passing tests)
- Basic HTML forms across multiple pages
- Navigation between pages
- Dark theme styling

### What's Broken ❌
- EditableTable component (only delete/some inputs work)

### Test Coverage
```bash
npm test
# ✓ tests/storage.test.js (8 tests) - must continue passing after migration
```

## Migration Strategy

### Phase 1: SvelteKit Setup (~30 min)

#### 1.1 Install SvelteKit Dependencies

```bash
npm install -D @sveltejs/kit @sveltejs/adapter-vercel @sveltejs/vite-plugin-svelte svelte vite
```

#### 1.2 Create SvelteKit Config Files

`svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    files: {
      assets: 'static',
      routes: 'src/routes',
      lib: 'src/lib'
    }
  }
};
```

`vite.config.js`:
```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js']
  }
});
```

#### 1.3 Update package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "check": "svelte-kit sync && svelte-check"
  }
}
```

#### 1.4 Create Directory Structure

```bash
mkdir -p src/routes src/lib/components src/lib/stores static
mv docs/main.css src/app.css
# Keep docs/ for now (we'll migrate content piece by piece)
```

Final structure:
```
.
├── src/
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── attributes/
│   │   │   └── +page.svelte
│   │   └── notes/
│   │       └── +page.svelte
│   ├── lib/
│   │   ├── components/
│   │   │   └── EditableTable.svelte
│   │   └── stores/
│   │       └── character.js
│   └── app.css
├── static/
│   └── (static assets)
├── tests/
│   └── storage.test.js
├── docs/  (legacy - will archive after migration)
├── svelte.config.js
├── vite.config.js
└── package.json
```

### Phase 2: LocalStorage Migration (~1.5 hours)

#### 2.1 Create Persisted Store Utility

`src/lib/stores/character.js`:
```javascript
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export function persistedStore(key, defaultValue = '') {
  const initialValue = browser
    ? localStorage.getItem(key) ?? defaultValue
    : defaultValue;

  const store = writable(initialValue);

  if (browser) {
    store.subscribe(value => {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    });
  }

  return store;
}

// Character stores (matching existing localStorage keys from docs/storage.js)
export const characterName = persistedStore('character_name');
export const characterSpecies = persistedStore('character_species');
export const characterGender = persistedStore('character_gender');
export const characterAge = persistedStore('character_age');
// ... (add all fields from docs/index.html)

// Calculated total (derived, not persisted)
export const experienceCurrent = persistedStore('experience_current');
export const experienceSpent = persistedStore('experience_spent');
export const experienceTotal = derived(
  [experienceCurrent, experienceSpent],
  ([$current, $spent]) => (parseInt($current) || 0) + (parseInt($spent) || 0)
);
```

#### 2.2 Adapt Tests for Svelte Stores

Update `tests/storage.test.js`:
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { persistedStore } from '../src/lib/stores/character.js';

describe('Svelte Persisted Stores', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves to localStorage when store updates', () => {
    const testStore = persistedStore('test_field');
    testStore.set('New Value');
    expect(localStorage.getItem('test_field')).toBe('New Value');
  });

  it('loads from localStorage on initialization', () => {
    localStorage.setItem('test_field', 'Saved Value');
    const testStore = persistedStore('test_field');
    expect(get(testStore)).toBe('Saved Value');
  });

  // ... adapt other tests similarly
});
```

**Validate:** `npm test` must pass

### Phase 3: Layout & Navigation (~30 min)

`src/routes/+layout.svelte`:
```svelte
<script>
  import { page } from '$app/stores';
  import '../app.css';

  const navItems = [
    { href: '/', label: 'Profile' },
    { href: '/attributes', label: 'Attributes/Health' },
    { href: '/notes', label: 'Campaign Notes' }
  ];
</script>

<header>
  <h1>[WiP] Warhammer Fantasy RP Character Sheet</h1>
  <nav>
    <ul>
      {#each navItems as item}
        <a href={item.href}>
          <li class:selected-nav={$page.url.pathname === item.href}>
            {item.label}
          </li>
        </a>
      {/each}
    </ul>
  </nav>
  <hr>
</header>

<main>
  <slot />
</main>
```

### Phase 4: Profile Page Migration (~1.5 hours)

`src/routes/+page.svelte` (migrate from `docs/index.html`):
```svelte
<script>
  import {
    characterName,
    characterSpecies,
    characterGender,
    characterAge,
    characterHeight,
    characterHair,
    characterEyes,
    characterBirthday,
    characterBirthplace
    // ... import all stores
  } from '$lib/stores/character';
</script>

<div class="section-column">
  <section>
    <h2>Character Overview</h2>
    <hr>
    <form>
      <fieldset>
        <legend>Basic Attributes</legend>
        <div class="field">
          <label for="name">Name</label>
          <input type="text" id="name" bind:value={$characterName} />
        </div>
        <div class="field">
          <label for="species">Species</label>
          <input type="text" id="species" bind:value={$characterSpecies} />
        </div>
        <div class="field">
          <label for="gender">Gender</label>
          <select id="gender" bind:value={$characterGender}>
            <option value="">Choose...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </fieldset>
      <!-- Copy remaining fieldsets from docs/index.html -->
    </form>
  </section>
</div>
```

### Phase 5: EditableTable Reimplementation (~1.5 hours)

`src/lib/components/EditableTable.svelte`:
```svelte
<script>
  import { writable } from 'svelte/store';
  import { browser } from '$app/environment';

  export let tableId;
  export let headers = [];
  export let legend = "Table";

  function loadRows() {
    if (!browser) return [{}];
    const stored = localStorage.getItem(`table-${tableId}-rows`);
    return stored ? JSON.parse(stored) : [{}];
  }

  let rows = writable(loadRows());

  $: if (browser && $rows) {
    localStorage.setItem(`table-${tableId}-rows`, JSON.stringify($rows));
  }

  function addRow() {
    $rows = [...$rows, {}];
  }

  function removeRow(index) {
    $rows = $rows.filter((_, i) => i !== index);
  }

  function updateCell(rowIndex, colIndex, event) {
    $rows[rowIndex][colIndex] = event.target.value;
    $rows = $rows;
  }
</script>

<form>
  <fieldset>
    <legend>{legend}</legend>
    <table class="editable-table">
      <thead>
        <tr>
          {#each headers as header}
            <th>{header}</th>
          {/each}
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {#each $rows as row, rowIndex}
          <tr>
            {#each headers as _, colIndex}
              <td>
                <input
                  type="text"
                  value={row[colIndex] || ''}
                  on:blur={(e) => updateCell(rowIndex, colIndex, e)}
                />
              </td>
            {/each}
            <td class="table-row-delete">
              <button type="button" on:click={() => removeRow(rowIndex)}>⊟</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <button type="button" class="table-add" on:click={addRow}>⊞</button>
  </fieldset>
</form>

<style>
  .editable-table th, .editable-table td {
    padding: 0.5rem;
    border-style: solid;
    border-width: 0.1rem;
    min-width: 10rem;
  }
</style>
```

`src/routes/notes/+page.svelte`:
```svelte
<script>
  import EditableTable from '$lib/components/EditableTable.svelte';
</script>

<EditableTable
  tableId="campaign-notes"
  headers={['Date', 'Location', 'Notes']}
  legend="Campaign Notes"
/>
```

### Phase 6: Testing & Deployment (~1 hour)

#### 6.1 Verify Tests
```bash
npm test  # All tests must pass
```

#### 6.2 Manual Testing
- [ ] Profile page: enter data, refresh → persists
- [ ] Navigate pages → highlighting works
- [ ] Table: add/remove rows → persists
- [ ] Mobile viewport → responsive

#### 6.3 Build & Preview
```bash
npm run build
npm run preview
```

#### 6.4 Deploy to Vercel
```bash
# Commit changes first
git add .
git commit -m "feat: Migrate to SvelteKit"
git push

# Deploy
npx vercel
# Or use Vercel GitHub integration (auto-deploy on push)
```

### Phase 7: Cleanup

After successful deployment:

```bash
# Archive old code
git mv docs docs-legacy
git commit -m "chore: Archive legacy vanilla code"

# Update README
# Update Linear issues
```

## Success Criteria

✅ All tests passing
✅ Data persists across page reloads
✅ Navigation works
✅ EditableTable fully functional
✅ Production build successful
✅ Deployed to Vercel

## Timeline: ~7 hours

## Key Benefits

- **262 lines → ~60 lines** for EditableTable
- No manual event listeners needed
- Component-scoped CSS (no Shadow DOM)
- Built-in HMR and routing
- Smaller bundle size

---

**Ready to start Phase 1!**
