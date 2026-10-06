```yaml
Title: Unit Testing
Version: 1.0.0
Status: Active
Owner: Prashant (CTO)
Last Updated: 2026-07-20
```

# 🧩 Unit Testing

## 1. Tooling
- **Test Runner:** `Vitest` (for both Frontend and Backend, due to its speed and native ESM support).
- **Assertions:** `expect` from Vitest (compatible with Jest syntax).

## 2. Scope
Unit tests should ONLY be written for logic that has no side effects:
- Cart total calculation logic.
- Password hashing utility wrappers.
- Complex string formatters or date parsers (e.g., order timeline formatting).

## 3. Example Test
```javascript
import { calculateTotal } from './cartUtils';
import { expect, test } from 'vitest';

test('calculates correct total for multiple items', () => {
    const items = [{ price: 100, qty: 2 }, { price: 50, qty: 1 }];
    expect(calculateTotal(items)).toBe(250);
});
```
