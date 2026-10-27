# Build the portfolio

This is a two-page, static GitHub Pages portfolio for Hanzla Sajid. It has two equal career modes:

- `/`: SDET / QA Engineer (`index.html`)
- `/product/`: Product Manager (`product/index.html`)

Public navigation must use directory URLs. Do not link to `.html` paths.

Do not collapse Product Management into the QA story. Hanzla has held Product Manager titles twice alongside his quality-engineering career. Do not invent employer names, dates, metrics, or responsibilities for those two roles unless Hanzla supplies them.

## Stack

- Plain HTML, one CSS file, and one small JavaScript file.
- No framework, database, account system, analytics, or backend.
- GitHub Pages deployment through `.github/workflows/pages.yml`.
- Formspree handles form submissions through `https://formspree.io/f/xdeegvkn`; keep the email and LinkedIn fallbacks visible.

## Content and positioning

Primary positioning: “SDET and quality engineer who connects test engineering, product decisions and user experience.”

The portfolio covers gaming, VR/AR, cloud software, web and mobile products, marketplaces, blockchain/Web3, health tech, fintech, and med-tech.

Use only facts in the HTML or `content.json`. Product and employer names already present were taken from Hanzla’s LinkedIn profile. The ISO/IEC 27701:2025 Lead Auditor issuer is Mastercard Foundation.

## Design

- Neo-brutalist: flat colors, square corners, 3–4 px black borders, and hard offset shadows without blur.
- Space Grotesk for reading text and Space Mono for labels.
- Desktop navigation is fixed on the left at 360px. Mobile navigation becomes a drawer.
- The mode switch must remain easy to find on every page.
- Keyboard focus uses a 3px black outline with a 3px offset.
- Reduced-motion mode removes transforms and smooth scrolling.

## Behavior

- Drawer closes from the close button, overlay, and Escape, and restores focus to the opener.
- Contact modal closes from the close button, overlay, and Escape, traps focus, and restores focus to its opener.
- Back-to-top appears after 400px.
- The form has idle, sending, sent, and failed states. Failed submissions retain field values and show the direct email fallback.

## Done when

- Both pages work without JavaScript for navigation and content.
- The mode switch moves between SDET/QA and Product Management.
- The form does not pretend to succeed while the endpoint is a placeholder.
- Layout is checked at desktop and mobile widths.
- No border radius, soft shadow, or gradient is present.
