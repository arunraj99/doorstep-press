# Doorstep Press (The Schaumburg Spotlight)

Standalone static payment site. Not part of PrintAgent / AI Estimator.

## Local preview

```bash
cd /Users/arunraju/Desktop/doorstep-press
python3 -m http.server 5500
```

Open:

- http://localhost:5500/schaumburg/
- http://localhost:5500/schaumburg/thanks/

## Edit values

All editable values live in `config.js`:

- `phone`
- `email`
- `issueName`
- `spaceDeadline`
- Stripe Payment Links:
  - `stripe.plan6_1` / `plan6_2` / `plan6_3` / `plan6_4`
  - `stripe.single_1` / `single_2` / `single_3` / `single_4`

Empty Stripe URLs show as unavailable buttons. Empty phone/email hide those links.

## Hero image

Replace `assets/hero.jpg` with your photo. Until that file exists, the page shows a neutral placeholder slot.

## Stripe success URL

Point each Payment Link success URL to:

`https://doorsteppress.stellogics.ai/schaumburg/thanks/`
