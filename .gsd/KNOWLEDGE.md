# Knowledge

## Rules

- Keep the Lancotech brand premium, clean, professional, and education-first.
- Use aqua accents sparingly for emphasis.
- Avoid gambling, hype, and crypto-scam patterns.
- Preserve Convex guidance in `AGENTS.md` and `CLAUDE.md`.
- Caveman is active for agent replies, but product copy should remain polished
  and normal.

## Patterns

- Landing page sections should be unframed full-width bands with constrained
  inner content.
- Repeated items can use small-radius cards with subtle shadows.
- Dashboard visuals should be composed from app UI primitives so they remain
  inspectable and brand-specific.

## Copy Trade

- **Order Amount is NEVER a fixed admin input.** It is dynamically calculated
  per-user at redeem time: `orderAmount = tradeBalance × interestRate`.
- The admin only sets: direction, symbol, duration, and interest rate (%).
- `copyTradeCodes` table does NOT store `orderAmount`.
- `copyTradeFollows` table stores the per-user snapshot of the calculated
  `orderAmount` at the moment of redemption.
- `earnedInterest` is calculated as `totalAsset × interestRate` (total across
  all wallets: exchange + trade + perpetual).
