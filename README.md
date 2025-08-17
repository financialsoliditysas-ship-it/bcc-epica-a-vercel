# BCC – Épica A (Onboarding Web + WhatsApp) – Vercel

## Resumen
Webhook de WhatsApp en Vercel + estado conversacional con Upstash Redis + integración a WordPress (endpoint REST para registrar vendedores).

## Estructura
- api/webhooks/whatsapp.ts
- src/lib/state.ts
- src/lib/wa.ts
- src/lib/wp.ts

## Variables de entorno (Vercel → Project Settings → Environment Variables)
- VERIFY_TOKEN
- WA_TOKEN
- WA_PHONE_ID
- WP_BASE
- WP_USER
- WP_APP_PASSWORD
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

## WordPress
En tu plugin `bcc-marketplace` añadir:
- includes/roles.php
- includes/rest-seller.php
Y en `bcc-marketplace.php`:
```
require_once BCC_DIR . 'includes/roles.php';
require_once BCC_DIR . 'includes/rest-seller.php';
```

## Despliegue
1. Crea repo en GitHub y sube estos archivos.
2. Importa el repo en Vercel y configura las ENV.
3. En Meta Developers → Webhooks:
   - Callback URL: https://TU-APP.vercel.app/api/webhooks/whatsapp
   - Verify Token: el de tu ENV
   - Suscríbete a `messages`.
4. Envía "REGISTRAR" al número WABA y sigue el flujo.
