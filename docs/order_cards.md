# Card Specification: Delivery Order, Invited Me, and Historical Orders

This specification details the visual layout, fields, and values of the trading cards shown in the user interface screenshots.

---

## 1. Delivery Order Card

*   **Tab Selection**: "delivery order" tab is active (underlined in blue).
*   **Header / Status**: Displays `??? ??? ???` (likely localized status placeholder).
*   **Fields & Values**:
    *   `time period`: `--`
    *   `rate of return`: `--%`
    *   `order quantity`: `12.87` (numeric value populated)
    *   `opening price`: `--`
    *   `settlement price`: `--`
    *   `order time`: `--`

---

## 2. Invited Me Card

*   **Tab Selection**: "Invited me" tab is active (underlined in blue).
*   **Action Row / Sub-Navigation**:
    *   `Initiate follow` button (outlined pill button).
    *   `Copying history` button (outlined pill button).
*   **Interaction Input**:
    *   Text input field with placeholder: `Please enter the order code`
    *   Inline action button: `recognize` (filled blue block button).
*   **Card Fields & Values**:
    *   `Title`: `Fidelity Capital Investment Group 07/11/2026-Fixed signals-01`
    *   `Trading pair`: `-`
    *   `Purchase duration`: `-`
    *   `Release time`: `7/11/2026, 3:03:01 PM`
    *   `Order amount`: `12.87`
    *   `Action`: (Row present but empty/no content value displayed)

---

## 3. Historical Orders Card (List View)

*   **Tab Selection**: "historical orders" tab is active (underlined in blue).
*   **Date Filter**:
    *   Interactive date-range selector input box containing: `2026/07/08 - 2026/07/11`
    *   Right chevron indicator (`>`) on the right side.
*   **Cards List Elements**:

    ### Item 1
    *   **Header**: `CALL BTCUSDT 60s`
        *   `CALL`: Colored green.
        *   `BTCUSDT`: Bold dark text.
        *   `60s`: Muted gray text.
    *   **Fields & Values**:
        *   `time period`: `10:34 ~ 10:35`
        *   `profit and loss`: `6.12` (colored green)
        *   `rate of return`: `47.76%` (colored green)
        *   `order quantity`: `12.81`
        *   `the number of transactions`: `12.81`
        *   `opening price`: `64058.11`
        *   `settlement price`: `64069.79`
        *   `order time`: `2026-07-11 10:34:05`

    ### Item 2
    *   **Header**: `CALL BTCUSDT 60s`
        *   `CALL`: Colored green.
        *   `BTCUSDT`: Bold dark text.
        *   `60s`: Muted gray text.
    *   **Fields & Values**:
        *   `time period`: `20:36 ~ 20:37`
        *   `profit and loss`: `6.06` (colored green)
        *   `rate of return`: `47.55%` (colored green)
        *   `order quantity`: `12.75`
        *   `the number of transactions`: `12.75`
        *   `opening price`: `64461.67`
        *   `settlement price`: `64477.37`
        *   `order time`: `2026-07-10 20:36:05`

    ### Item 3 (Partially Scroll-visible)
    *   **Header**: `PUT BTCUSDT 60s`
        *   `PUT`: Colored red.
        *   `BTCUSDT`: Bold dark text.
        *   `60s`: Muted gray text.
    *   **Fields & Values**:
        *   `time period`: `18:35 ~ 18:36`
        *   `profit and loss`: `6.86` (colored green)
        *   `rate of return`: `54.14%` (colored green)
        *   `order quantity`: `12.68`
        *   `the number of transactions`: `12.68`
        *   `opening price`: `64427.05`
