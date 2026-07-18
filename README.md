# Password Policy Analyzer

A browser-based tool that empirically tests two hypotheses about password policy design:

- **H1:** Minimum length contributes more to real-world password strength than character complexity requirements
- **H2:** Excessive restriction rules increase user rejection rate without proportional security gain

## How It Works

1. Generates N passwords under each of 5 policies (P1-P5)
2. Measures each password using zxcvbn (realistic strength) and Shannon entropy (mathematical randomness)
3. Records generation attempts as a proxy for user rejection rate
4. Automatically verifies H1 and H2 against the data
5. Displays results as charts and a structured report

## Policies Tested

| ID | Name | Min Length | Complexity Rules | Tests |
|----|------|-----------|-----------------|-------|
| P1 | Lenient | 6 | None | Baseline |
| P2 | Length-Only | 12 | None | H1 |
| P3 | Complex-Only | 6 | Uppercase + digit + symbol | H1 counterpoint |
| P4 | Standard | 8 | Uppercase + lowercase + digit | Reference |
| P5 | Paranoid | 12 | All types + no repeating chars | H2 |

## Tech Stack

- JavaScript (vanilla, no frameworks)
- zxcvbn v4.4.2 (Dropbox password strength estimator)
- HTML5 Canvas API (charts)
- No server, no database — runs entirely in the browser

## How to Run

1. Clone this repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge)
3. Set the number of passwords per policy (default: 100, recommended: 500)
4. Click **Run Full Analysis**
5. Results appear as tables, charts, and hypothesis verification

## Reproducing the Report Results

To reproduce the definitive results used in the written report:
- Set **Passwords per policy** to **500**
- Click **Run Full Analysis**
- The hypothesis verification section shows whether H1 and H2 are supported based on your run

## Project Structure
password-policy-analyzer/
├── index.html                  # Main UI and app logic
├── css/
│   └── style.css               # Layout and styling
├── js/
│   ├── policies.js             # Policy definitions (P1-P5) and CHARSETS
│   ├── generator.js            # Password generator, validator, rejection sampling
│   ├── realistic-passwords.js  # Human behaviour simulation
│   ├── analyzer.js             # Strength analysis and hypothesis verification engine
│   └── charts.js               # Canvas-based bar chart visualisations
└── lib/
└── zxcvbn.js               # Dropbox password strength library v4.4.2

## Final Results (500 passwords per policy)

| Policy | Avg zxcvbn Score | Avg Entropy | Avg Attempts | Score 4% |
|--------|-----------------|-------------|-------------|----------|
| P1 Lenient | 3.84 / 4 | 155.2 bits | 1.0 | 90% |
| P2 Length-Only | 4.00 / 4 | 178.0 bits | 1.0 | 100% |
| P3 Complex-Only | 3.92 / 4 | 245.0 bits | 1.1 | 95% |
| P4 Standard | 3.96 / 4 | 221.3 bits | 1.0 | 97% |
| P5 Paranoid | 4.00 / 4 | 244.4 bits | 1.6 | 100% |

## Key Findings

**H1 — Partially supported:** P2 (Length-Only) achieves a higher real-world zxcvbn score than P3 (Complex-Only) despite having no complexity requirements, supporting the hypothesis that length is the stronger policy lever for practical cracking resistance. P3 produces higher Shannon entropy, but this reflects character pool size rather than realistic attack resistance.

**H2 — Supported:** P5 (Paranoid) requires 56% more generation attempts than P4 (Standard) — representing significant usability friction — while delivering only 0.04 additional zxcvbn score points. Excessive complexity rules create disproportionate friction without proportional security gains.