# utils

This folder contains utility files that are commonly used across the project for input validation and managing contract addresses.

---

## File Overview

### 1. **FormatChecks.ts**

Provides functions for validating user input in forms or components:

- **onlyNumbers**  
  Checks that a string contains only digits (`0-9`).  
  If not, sets an error message via a callback and returns `false`.

- **onlyNumbersComma**  
  Checks that a string contains only digits, commas and spaces.  
  If not, sets an error message via a callback and returns `false`.

Both functions accept an object with the following properties:
- `param`: The string value to validate.
- `setError`: A callback to set the error message (React state).

**Example usage:**
```typescript
if(!onlyNumbers({param: data.value, setError})) return;
```

---

### 2. **ProvenAddresses.ts**

Exports constants for the deployed smart contract addresses used throughout the app:

- **TOKEN_ADDR**
- **MARKET_ADDR**

These addresses are **automatically imported** from `DeployingData.json` (generated after deployment).  
This ensures that your app always uses the actual addresses from the last successful deploy.

Both addresses are validated to ensure they are correct Ethereum addresses (start with `0x` and are 42 characters long). If the validation fails, an error is thrown at runtime to prevent accidental use of invalid addresses.

**Note:**  
If you redeploy contracts, make sure `DeployingData.json` is updated. The addresses will sync automatically throughout the project wherever these constants are imported.

---

## Summary

- **FormatChecks.ts**: Input validation utilities (for numbers and numbers+comma+space).
- **ProvenAddresses.ts**: Centralized, auto-updated contract addresses from deployment JSON.

Place all general-purpose utilities for validation, formatting, and configuration in this folder to keep your project code clean and DRY.