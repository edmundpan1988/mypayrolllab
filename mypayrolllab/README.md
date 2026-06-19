# MY Payroll Lab

> Malaysia statutory payroll calculator — EPF, SOCSO, EIS, and PCB/MTD, built on LHDN's official formula.

**Live app:** [mypayrolllab.com](https://mypayrolllab.com) *(update once deployed)*

MY Payroll Lab is a free, browser-based calculator that helps Malaysian employees, HR practitioners, and SME owners verify statutory payroll deductions. It runs entirely client-side — no server, no data collection, no login — and works offline as an installable Progressive Web App (PWA).

---

## Features

### Statutory Calculations
- **EPF (KWSP)** — employee and employer contributions, including age 60+ rules and the RM5,000 employer-rate threshold
- **SOCSO** — full contribution table up to the RM6,000 wage ceiling (effective Oct 2024)
- **EIS** — full contribution table up to the RM6,000 wage ceiling
- **Skim Lindung 24 Jam** — new 24-hour non-work accident coverage, employee-only, effective June 2026 (auto-applies based on selected month/year)
- **PCB / MTD** — LHDN's official Schedule 1 formula, including:
  - Monthly accumulation method: `MTD = [((P−M)×R + B − (Z+X)) / (n+1)] − Zakat`
  - K1 / K2 / Kt EPF-relief formula for regular salary and bonus months
  - Two-step bonus calculation (MTD(A) + MTD Additional) matching LHDN's official slip

### Tax Categories
- Resident (progressive 0%–30%)
- Non-Resident (30% flat, no reliefs)
- Returning Expert Programme — REP (15% flat)
- Knowledge Worker — IRDA Iskandar (15% flat)
- C-Suite / Principal Hub (15% flat)

### Tax Reliefs
- Personal, spouse (auto-applied for "married, spouse not working"), OKU (RM6,000), disabled spouse, disabled child
- Children relief calculator — all 5 LHDN categories with 100%/50% claim-split toggle
- Lifestyle, medical, education, SSPN, life insurance/takaful, PRS
- Zakat/Fitrah and CP38 additional deductions
- Automatic RM400 / RM800 tax rebate (individual + spouse) when chargeable income ≤ RM35,000

### Voluntary EPF
- Employee and employer voluntary contributions, by percentage or fixed amount
- Correctly feeds into the RM4,000 annual PCB relief cap

### User Experience
- **PCB Explanation engine** — step-by-step breakdown of how each PCB figure was calculated, in plain English
- **Statutory Update Tracker** — at-a-glance reference for 2024–2026 rate changes (EPF, SOCSO, EIS, PCB, Lindung 24 Jam phases, submission deadlines)
- Dark mode support (follows system preference)
- Fully responsive — optimised for mobile

---

## Tech Stack

- **Pure HTML, CSS, JavaScript** — no frameworks, no build step, no dependencies
- **Progressive Web App (PWA)** — installable on Android and iOS via "Add to Home Screen"
- **Service Worker** — caches all assets for full offline functionality

---

## Project Structure

```
mypayrolllab/
├── index.html       # Main calculator app (single-file, self-contained)
├── manifest.json     # PWA configuration (name, icons, theme)
├── sw.js             # Service worker — offline caching
├── icon-192.png      # App icon (192×192)
├── icon-512.png      # App icon (512×512)
└── README.md         # This file
```

---

## Running Locally

No build step required.

```bash
git clone https://github.com/yourusername/mypayrolllab.git
cd mypayrolllab
# Open index.html directly in a browser, or serve locally:
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

> Note: the service worker only registers on HTTPS (or production domains) — it is automatically skipped on `localhost` and preview environments.

---

## Deploying

This project is a static site — deploy anywhere that serves static files:

- **Netlify** — drag and drop the folder onto [app.netlify.com](https://app.netlify.com), or connect this repo for git-based deploys
- **Vercel** — import the repo, framework preset: "Other"
- **GitHub Pages** — enable Pages on this repo, serve from `main` branch root
- **Cloudflare Pages** — connect repo, build command: none, output directory: `/`

After deploying, connect your custom domain (e.g. `mypayrolllab.com`) via your host's domain settings.

---

## Installing as a Mobile App

### Android (Chrome)
1. Open the live URL
2. Tap **⋮** menu → **Add to Home Screen** → **Install**

### iOS (Safari)
1. Open the live URL
2. Tap the **Share** button
3. Scroll down → **Add to Home Screen** → **Add**

The app then runs full-screen, works offline, and updates automatically when you redeploy.

---

## Reference Sources

Calculations are based on:

- LHDN PCB Schedule 1 (Income Tax Act 1967)
- EPF Act 1991
- SOCSO Act 1969 (including Lindung 24 Jam scheme)
- Employment Insurance System Act 2017

Official portals for verification:
- [LHDN e-PCB](https://ez.hasil.gov.my/CI/epcb)
- [EPF i-Akaun](https://i-akaun.kwsp.gov.my)
- [SOCSO ASSIST](https://assist.perkeso.gov.my)
- [PERKESO](https://www.perkeso.gov.my)
- [LHDN Official](https://www.hasil.gov.my)

---

## Disclaimer

This calculator provides estimates based on publicly available statutory rates and formulas for **reference purposes only**. It does not constitute professional tax, legal, or payroll advice. Actual payroll results may differ depending on company-specific configurations, employment history, and statutory updates not yet reflected in this tool. Users should verify all figures against official statutory portals or a qualified payroll professional. The developer accepts no liability for losses or discrepancies arising from reliance on this tool's output.

---

## Roadmap

- [ ] Payslip upload & validation mode
- [ ] Month-to-month payslip comparison
- [ ] AI-powered natural language PCB explanations
- [ ] Multi-employee batch calculator

---

## License

MIT License — free to use, modify, and distribute.

---

## Contact

Built and maintained by [Your Name]. For feedback or issues, open a GitHub issue or reach out via [mypayrolllab.com](https://mypayrolllab.com).
