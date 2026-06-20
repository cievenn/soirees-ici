# Migration vers Resend + Facture Stripe automatique

## Contexte

Deux changements demandés :
1. **Remplacer Nodemailer (SMTP/Brevo)** par **Resend** pour l'envoi d'emails — API plus simple, pas de config SMTP.
2. **Créer une facture Stripe standard** après paiement confirmé, puis l'envoyer automatiquement au client.

---

## User Review Required

> [!IMPORTANT]
> **Clé API Resend** — Tu devras fournir ta clé API Resend (`re_...`). Elle sera ajoutée dans `.env` sous `RESEND_API_KEY`. Tu devras aussi vérifier/configurer le domaine d'envoi dans le dashboard Resend (par défaut, Resend utilise `onboarding@resend.dev` si aucun domaine n'est vérifié).

> [!IMPORTANT]
> **Adresse d'expédition Resend** — L'adresse `EMAIL_FROM` actuelle est `noreply@soirees-ici.be`. Pour envoyer depuis cette adresse via Resend, le domaine `soirees-ici.be` doit être vérifié dans le dashboard Resend (ajout des DNS records). Pendant le dev, tu peux utiliser `onboarding@resend.dev` ou l'adresse par défaut de Resend.

> [!WARNING]
> **Suppression de Nodemailer** — Nodemailer et les variables SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) seront retirés. Le `.env.example` sera mis à jour. Assure-toi de ne plus en avoir besoin.

> [!IMPORTANT]
> **Facture Stripe — Customer obligatoire** — Pour créer une `Invoice` Stripe, il faut un `Customer` Stripe. Le plan crée automatiquement un `Customer` Stripe à partir de l'email du client dans le webhook, puis crée l'invoice avec les mêmes lignes que le Checkout. La facture est finalisée et marquée comme payée (car le paiement a déjà été reçu via Checkout), puis le PDF est envoyé automatiquement au client via Resend.

---

## Open Questions

> [!IMPORTANT]
> **Envoi de la facture PDF** — Deux options :
> - **Option A (recommandée)** : Stripe génère le PDF de l'invoice. On récupère l'URL `invoice.invoice_pdf` et on l'envoie au client via Resend avec un lien de téléchargement dans l'email de confirmation de paiement.
> - **Option B** : Laisser Stripe envoyer la facture directement via son propre système email (`invoice.send_invoice()`). Moins de contrôle sur le design de l'email.
>
> Le plan implémente l'**Option A** : on récupère le PDF et l'intègre dans notre email Resend de confirmation de paiement.

---

## Proposed Changes

### Composant 1 — Remplacement Nodemailer → Resend

#### [MODIFY] [emailService.js](file:///c:/Users/user/Documents/soirees-ici/server/services/emailService.js)

Refonte complète :
- Remplacer `nodemailer` par `resend` (SDK officiel)
- `initEmailService()` → Instancie le client `Resend` avec la clé API
- `sendEmail()` → Utilise `resend.emails.send()` au lieu de `transporter.sendMail()`
- Toutes les fonctions exportées (`sendClientConfirmation`, `sendAdminValidation`, etc.) restent **inchangées dans leur signature** — seul le transport change
- Nouvelle fonction `sendClientPaymentConfirmation(order, items, invoicePdfUrl)` — accepte maintenant l'URL de la facture PDF

#### [MODIFY] [.env](file:///c:/Users/user/Documents/soirees-ici/server/.env) + [.env.example](file:///c:/Users/user/Documents/soirees-ici/server/.env.example)

- Supprimer : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Ajouter : `RESEND_API_KEY=re_...`
- Conserver : `EMAIL_FROM`, `ADMIN_EMAILS`

#### [MODIFY] [index.js](file:///c:/Users/user/Documents/soirees-ici/server/index.js)

- `initEmailService()` n'a plus besoin de vérifier la connexion SMTP — simple log de confirmation

---

### Composant 2 — Facture Stripe automatique après paiement

#### [MODIFY] [stripeService.js](file:///c:/Users/user/Documents/soirees-ici/server/services/stripeService.js)

Nouvelles fonctions :
- **`findOrCreateStripeCustomer(email, name)`** — Cherche un `Customer` par email (`stripe.customers.list({email})`). S'il n'existe pas, le crée. Retourne l'objet Customer.
- **`createAndFinalizeInvoice(order, items, customerId, rentalDays)`** — Crée une `Invoice` Stripe avec :
  - Un `InvoiceItem` pour chaque item de la commande (prix × quantité × durée)
  - Un `InvoiceItem` pour la caution si > 0
  - Finalise l'invoice (`invoice.finalizeInvoice`)
  - Marque comme payée (`invoice.pay`) car le paiement a déjà été reçu
  - Retourne l'invoice avec l'URL du PDF (`invoice.invoice_pdf`)

#### [MODIFY] [stripe.js](file:///c:/Users/user/Documents/soirees-ici/server/routes/stripe.js) (webhook)

Dans le handler `checkout.session.completed` :
1. Récupérer la commande et les items
2. Appeler `findOrCreateStripeCustomer(order.client_email, order.client_name)`
3. Appeler `createAndFinalizeInvoice(order, items, customer.id, rentalDays)`
4. Stocker `stripe_invoice_id` dans la table `orders` (nouvelle colonne)
5. Appeler `sendClientPaymentConfirmation(order, items, invoicePdfUrl)` avec l'URL du PDF
6. Appeler `sendAdminPaymentAlert(order, items)` comme avant

#### [MODIFY] [schema.sql](file:///c:/Users/user/Documents/soirees-ici/server/db/schema.sql) + [database.js](file:///c:/Users/user/Documents/soirees-ici/server/db/database.js)

- Migration : `ALTER TABLE orders ADD COLUMN stripe_invoice_id TEXT`

---

### Composant 3 — Template de confirmation de paiement mis à jour

#### [MODIFY] [clientPaymentConfirmation.js](file:///c:/Users/user/Documents/soirees-ici/server/templates/clientPaymentConfirmation.js)

- Ajouter un paramètre `invoicePdfUrl` au template
- Ajouter un bouton CTA "📄 Télécharger votre facture" avec le lien vers le PDF Stripe
- Afficher le montant total payé (location + caution)

---

## Résumé des fichiers touchés

| Fichier | Action |
|---|---|
| `server/services/emailService.js` | Remplacement Nodemailer → Resend |
| `server/services/stripeService.js` | Nouvelles fonctions invoice |
| `server/routes/stripe.js` | Invoice dans le webhook |
| `server/templates/clientPaymentConfirmation.js` | Ajout bouton facture PDF |
| `server/db/schema.sql` | Colonne `stripe_invoice_id` |
| `server/db/database.js` | Migration `stripe_invoice_id` |
| `server/index.js` | Simplification init email |
| `server/.env` + `.env.example` | Nouvelles variables Resend |
| `server/package.json` | `resend` ajouté, `nodemailer` retiré |

---

## Verification Plan

### Automated Tests
- Aucun framework de test — vérification manuelle.

### Manual Verification
1. Redémarrer le serveur, vérifier que la migration `stripe_invoice_id` s'applique.
2. Vérifier que les emails sont envoyés via Resend (création de commande → email client + admin).
3. Simuler un paiement Stripe (mode test) → vérifier :
   - Facture Stripe créée et finalisée
   - Email de confirmation envoyé avec lien vers le PDF
   - `stripe_invoice_id` stocké en DB
