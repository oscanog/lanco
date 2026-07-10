# Platform Wallet Address Prefixes & Format Reference

> **Created:** 2026-07-10  
> **Purpose:** Standardize dummy platform deposit addresses per crypto/network combination with correct real-world address formatting.

---

## Address Format Rules by Network

| Network | Blockchain | Address Prefix | Address Length | Example |
|---------|-----------|---------------|---------------|---------|
| **TRC20** | TRON | Starts with `T` | 34 characters (Base58) | `TJYs7cEqTqhHvSgrmejDKFGMPCa2rSg8wZ` |
| **ERC20** | Ethereum | Starts with `0x` | 42 characters (Hex) | `0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db` |
| **ETH** (native) | Ethereum | Starts with `0x` | 42 characters (Hex) | `0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB` |

---

## Per-Crypto Platform Addresses

These are the **dummy platform deposit addresses** used throughout the application for display purposes (QR codes, recharge details, admin deposit logs).

### USDT (Tether)
| Network | Platform Address |
|---------|-----------------|
| TRC20 | `TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7` |
| ERC20 | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |

> **Note:** The ERC20 address above is actually the real USDT contract address on Ethereum mainnet — commonly recognized. For a platform deposit wallet, a unique address would be generated, but we use this as a recognizable dummy.

### ETH (Ethereum)
| Network | Platform Address |
|---------|-----------------|
| ETH (native) | `0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB` |
| ERC20 | `0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB` |

> **Note:** ETH on its native chain and ERC20 use the same Ethereum address format (`0x`-prefixed, 40 hex chars).

### USDC (USD Coin)
| Network | Platform Address |
|---------|-----------------|
| TRC20 | `TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8` |
| ERC20 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |

> **Note:** The ERC20 address above is the real USDC contract address on Ethereum mainnet — used as a recognizable dummy.

---

## Validation Rules (For Future Implementation)

When validating user-submitted withdrawal addresses:

| Network | Regex Pattern | Description |
|---------|--------------|-------------|
| TRC20 | `^T[1-9A-HJ-NP-Za-km-z]{33}$` | TRON Base58 address, always starts with `T`, 34 chars total |
| ERC20 / ETH | `^0x[0-9a-fA-F]{40}$` | Ethereum hex address, always starts with `0x`, 42 chars total |

---

## Key Takeaways for Developers

1. **TRC20 addresses NEVER start with `0x`** — they always start with `T` and use Base58 encoding.
2. **ERC20 and ETH native addresses are identical format** — both `0x`-prefixed hex strings.
3. **Each crypto must have its own unique platform address** — do NOT use the same address for USDT, ETH, and USDC.
4. **Network selection changes the address** — switching from TRC20 to ERC20 must swap the displayed address.
5. **USDT exists on both TRON and Ethereum** — the address format depends on the NETWORK, not the token.
