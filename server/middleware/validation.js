import { z } from 'zod';

// ─── Schémas de validation ────────────────────────────────

/**
 * Schéma de validation pour la création d'une commande.
 * Valide tous les champs clients, dates, et items du panier.
 */
export const createOrderSchema = z.object({
  client_name: z
    .string({ required_error: 'Le nom est requis.' })
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères.'),

  client_email: z
    .string({ required_error: "L'email est requis." })
    .trim()
    .email("L'adresse email n'est pas valide."),

  client_phone: z
    .string({ required_error: 'Le numéro de téléphone est requis.' })
    .trim()
    .regex(
      /^\+?\d[\d\s\-().]{6,20}$/,
      'Le numéro de téléphone n\'est pas valide. Format attendu : +32 4XX XX XX XX'
    ),

  event_location: z
    .string({ required_error: "Le lieu de l'événement est requis." })
    .trim()
    .min(2, 'Le lieu doit contenir au moins 2 caractères.')
    .max(200, 'Le lieu ne peut pas dépasser 200 caractères.'),

  start_date: z
    .string({ required_error: 'La date de début est requise.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD attendu).')
    .refine((val) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(val + 'T00:00:00');
      return startDate >= today;
    }, 'La date de début ne peut pas être dans le passé.'),

  end_date: z
    .string({ required_error: 'La date de fin est requise.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD attendu).'),

  notes: z
    .string()
    .max(1000, 'Les remarques ne peuvent pas dépasser 1000 caractères.')
    .optional()
    .default(''),

  items: z
    .array(
      z.object({
        equipment_id: z
          .number({ required_error: "L'identifiant de l'équipement est requis." })
          .int("L'identifiant doit être un nombre entier.")
          .positive("L'identifiant doit être positif."),
        quantity: z
          .number({ required_error: 'La quantité est requise.' })
          .int('La quantité doit être un nombre entier.')
          .min(1, 'La quantité minimum est de 1.'),
      }),
      { required_error: 'Le panier ne peut pas être vide.' }
    )
    .min(1, 'Le panier doit contenir au moins un article.'),
}).refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end > start;
  },
  {
    message: 'La date de fin doit être postérieure à la date de début.',
    path: ['end_date'],
  }
);

// ─── Middleware générique ─────────────────────────────────

/**
 * Middleware Express de validation via Zod.
 * Parse le body de la requête avec le schéma fourni.
 * Renvoie une 400 avec les erreurs formatées en français.
 * 
 * @param {z.ZodSchema} schema - Le schéma Zod à utiliser
 * @returns {Function} Middleware Express
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return res.status(400).json({
        error: 'Données invalides. Veuillez vérifier les champs du formulaire.',
        validation_errors: errors,
      });
    }

    // Remplacer le body par les données validées et transformées (trim, defaults)
    req.body = result.data;
    next();
  };
}
