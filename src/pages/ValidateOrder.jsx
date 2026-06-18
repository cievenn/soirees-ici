import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { THEME } from '../theme';
import {
  validateOrderToken,
  approveOrder,
  rejectOrder,
  cancelApproval,
  confirmPickup,
  confirmReturn,
  markOverdue,
  getAuditLog,
} from '../services/api';
import {
  Shield, ShieldCheck, ShieldX, Package, Truck, RotateCcw,
  Clock, AlertTriangle, CheckCircle, XCircle, Loader2,
  User, Mail, Phone, MapPin, Calendar, FileText, History,
  ChevronDown, ArrowLeft, Ban
} from 'lucide-react';

// ─── Configuration des statuts ──────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: 'En attente',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    icon: Clock,
  },
  AWAITING_PAYMENT: {
    label: 'Paiement attendu',
    color: 'from-blue-400 to-indigo-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30',
    textColor: 'text-blue-300',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approuvée',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: ShieldCheck,
  },
  REJECTED: {
    label: 'Rejetée',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: ShieldX,
  },
  ACTIVE: {
    label: 'En cours',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: Truck,
  },
  RETURNED: {
    label: 'Retourné',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: CheckCircle,
  },
  OVERDUE: {
    label: 'En retard',
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: AlertTriangle,
  },
};

// ─── Timeline des statuts ───────────────────────────────────────────
const TIMELINE_STEPS = ['PENDING', 'AWAITING_PAYMENT', 'APPROVED', 'ACTIVE', 'RETURNED'];

function StatusTimeline({ currentStatus }) {
  const isRejected = currentStatus === 'REJECTED';
  const isOverdue = currentStatus === 'OVERDUE';

  const getStepIndex = () => {
    if (isRejected) return 0;
    if (isOverdue) return 3; // Between ACTIVE and RETURNED
    return TIMELINE_STEPS.indexOf(currentStatus);
  };

  const currentIdx = getStepIndex();

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {TIMELINE_STEPS.map((step, idx) => {
          const config = STATUS_CONFIG[step];
          const Icon = config.icon;
          const isActive = idx <= currentIdx && !isRejected;
          const isCurrent = step === currentStatus || (isOverdue && step === 'ACTIVE');

          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                  idx <= currentIdx && !isRejected ? 'bg-gradient-to-r ' + config.color : 'bg-white/10'
                }`} />
              )}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCurrent
                    ? `bg-gradient-to-br ${config.color} shadow-lg shadow-current/20 ring-2 ring-white/20`
                    : isActive
                      ? `bg-gradient-to-br ${config.color} opacity-60`
                      : 'bg-white/5 border border-white/10'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/30'}`} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isCurrent ? config.textColor : isActive ? 'text-white/60' : 'text-white/20'
                }`}>
                  {config.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Rejected / Overdue overlay */}
      {isRejected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-1.5">
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Commande rejetée</span>
          </div>
        </div>
      )}
      {isOverdue && (
        <div className="mt-3 flex justify-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Retard constaté — Stock bloqué</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page principale ────────────────────────────────────────────────
export default function ValidateOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('id');
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Vérification initiale
  useEffect(() => {
    if (!orderId || !token) {
      navigate('/', { replace: true });
      return;
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        const data = await validateOrderToken(orderId, token);
        setOrderData(data);
      } catch (err) {
        setError(err.message || 'Accès refusé');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, token, navigate]);

  // Rafraîchir après action
  const refreshOrder = async () => {
    try {
      const data = await validateOrderToken(orderId, token);
      setOrderData(data);
    } catch (err) {
      console.error('Erreur rafraîchissement:', err);
    }
  };

  // Exécuter une action
  const executeAction = async (actionFn, actionName) => {
    setActionLoading(actionName);
    setActionMessage(null);
    setConfirmAction(null);

    try {
      const result = await actionFn(orderId, token);
      setActionMessage({ type: 'success', text: result.message });
      await refreshOrder();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Erreur lors de l\'action' });
    } finally {
      setActionLoading(null);
    }
  };

  // Charger l'audit log
  const loadAudit = async () => {
    if (auditLog.length > 0) {
      setShowAudit(!showAudit);
      return;
    }
    setAuditLoading(true);
    try {
      const data = await getAuditLog(orderId, token);
      setAuditLog(data.audit || []);
      setShowAudit(true);
    } catch (err) {
      console.error('Erreur audit:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // ─── Écran de chargement ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff007f] animate-spin"></div>
            <Shield className="absolute inset-0 m-auto w-8 h-8 text-white/50" />
          </div>
          <p className="text-white/60 text-sm font-medium">Vérification du lien sécurisé...</p>
        </div>
      </div>
    );
  }

  // ─── Écran d'erreur ───────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-display text-white mb-3">Accès Refusé</h1>
          <p className="text-white/50 mb-8">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const { order, items, canModify } = orderData;
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  // Formatage des dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('fr-BE', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // ─── Rendu principal ──────────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <Shield className="w-4 h-4 text-[#ff007f]" />
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Administration sécurisée</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-white mb-2">
            COMMANDE <span className={THEME.gradientText}>#{order.id}</span>
          </h1>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
            <span className={`font-bold text-sm uppercase tracking-wider ${statusConfig.textColor}`}>{statusConfig.label}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <StatusTimeline currentStatus={order.status} />
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {actionMessage.type === 'success'
              ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            }
            <p className={`text-sm font-medium ${
              actionMessage.type === 'success' ? 'text-emerald-300' : 'text-red-300'
            }`}>{actionMessage.text}</p>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column — Info Client (2/5) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Client Info */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-display text-lg mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-[#ff007f]" />
                Client
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Nom</div>
                    <div className="text-white font-semibold">{order.client_name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Email</div>
                    <a href={`mailto:${order.client_email}`} className="text-[#ff007f] font-medium hover:underline text-sm">{order.client_email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Téléphone</div>
                    <a href={`tel:${order.client_phone}`} className="text-[#ff007f] font-medium hover:underline text-sm">{order.client_phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/30 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Lieu</div>
                    <div className="text-white/80 text-sm">{order.event_location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-display text-lg mb-5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ff7f00]" />
                Dates
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-black/20 rounded-xl px-4 py-3">
                  <span className="text-white/40 text-xs uppercase tracking-wider font-semibold">Début</span>
                  <span className="text-[#ff007f] font-bold text-sm">{order.start_date}</span>
                </div>
                <div className="flex justify-between items-center bg-black/20 rounded-xl px-4 py-3">
                  <span className="text-white/40 text-xs uppercase tracking-wider font-semibold">Fin</span>
                  <span className="text-[#ff7f00] font-bold text-sm">{order.end_date}</span>
                </div>
                {order.pickup_date && (
                  <div className="flex justify-between items-center bg-black/20 rounded-xl px-4 py-3">
                    <span className="text-white/40 text-xs uppercase tracking-wider font-semibold">Retrait</span>
                    <span className="text-blue-400 font-bold text-sm">{formatDate(order.pickup_date)}</span>
                  </div>
                )}
                {order.return_date && (
                  <div className="flex justify-between items-center bg-black/20 rounded-xl px-4 py-3">
                    <span className="text-white/40 text-xs uppercase tracking-wider font-semibold">Retour</span>
                    <span className="text-emerald-400 font-bold text-sm">{formatDate(order.return_date)}</span>
                  </div>
                )}
              </div>

              {/* Fenêtre de modification */}
              {canModify && order.modification_deadline && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    Modification possible jusqu'au {formatDate(order.modification_deadline)}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-display text-lg mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white/40" />
                  Remarques
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column — Articles + Actions (3/5) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Articles */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-display text-lg mb-5 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#ff007f]" />
                Matériel demandé
              </h3>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-black/20 rounded-xl p-3">
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.equipment_name} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-6 h-6 text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{item.equipment_name}</div>
                      <div className="text-white/40 text-xs mt-1">{item.unit_price || '—'}</div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className="bg-[#ff007f] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {item.quantity}
                      </div>
                      {item.stock_available !== undefined && (
                        <span className={`text-[10px] mt-1 font-semibold ${
                          item.stock_available >= item.quantity ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {item.stock_available} dispo.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-display text-lg mb-5">Actions</h3>

              {/* Confirmation dialog */}
              {confirmAction && (
                <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-fade-in">
                  <p className="text-amber-200 text-sm font-medium mb-4">{confirmAction.message}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => executeAction(confirmAction.fn, confirmAction.name)}
                      disabled={actionLoading}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all ${confirmAction.buttonClass} disabled:opacity-50`}
                    >
                      {actionLoading === confirmAction.name ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : 'Confirmer'}
                    </button>
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 font-bold text-sm hover:bg-white/10 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* PENDING → Approuver / Rejeter */}
                {order.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => setConfirmAction({
                        fn: approveOrder,
                        name: 'approve',
                        message: '✅ Voulez-vous approuver cette commande ? Un lien de paiement Stripe de 24h sera envoyé au client et le stock sera temporairement réservé.',
                        buttonClass: 'bg-emerald-500 hover:bg-emerald-600',
                      })}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Approuver (Envoyer lien de paiement)
                    </button>
                    <button
                      onClick={() => setConfirmAction({
                        fn: rejectOrder,
                        name: 'reject',
                        message: '❌ Voulez-vous rejeter cette commande ? Cette action est irréversible.',
                        buttonClass: 'bg-red-500 hover:bg-red-600',
                      })}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      <Ban className="w-5 h-5" />
                      Rejeter la commande
                    </button>
                  </>
                )}

                {/* AWAITING_PAYMENT → En attente du paiement */}
                {order.status === 'AWAITING_PAYMENT' && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-300 text-sm font-medium flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      En attente du paiement du client. La réservation expire le {order.payment_deadline ? formatDate(order.payment_deadline) : 'dans 24h'}.
                    </p>
                  </div>
                )}

                {/* APPROVED → Annuler (24h) / Confirmer retrait */}
                {order.status === 'APPROVED' && (
                  <>
                    <button
                      onClick={() => setConfirmAction({
                        fn: confirmPickup,
                        name: 'pickup',
                        message: '📦 Confirmez-vous que le client a retiré le matériel ? Le statut passera en "En cours".',
                        buttonClass: 'bg-blue-500 hover:bg-blue-600',
                      })}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <Truck className="w-5 h-5" />
                      Confirmer le retrait
                    </button>
                    {canModify && (
                      <button
                        onClick={() => setConfirmAction({
                          fn: cancelApproval,
                          name: 'cancel',
                          message: '⚠️ Annuler l\'approbation ? Le stock sera libéré et la commande repassera en attente.',
                          buttonClass: 'bg-amber-500 hover:bg-amber-600',
                        })}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-amber-500/30 text-amber-400 font-bold rounded-xl hover:bg-amber-500/10 transition-all disabled:opacity-50"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Annuler l'approbation (fenêtre 24h)
                      </button>
                    )}
                  </>
                )}

                {/* ACTIVE → Confirmer retour / Marquer en retard */}
                {order.status === 'ACTIVE' && (
                  <>
                    <button
                      onClick={() => setConfirmAction({
                        fn: confirmReturn,
                        name: 'return',
                        message: '✅ Confirmez-vous le retour du matériel ? Le stock sera réintégré et un email de remerciement sera envoyé au client.',
                        buttonClass: 'bg-emerald-500 hover:bg-emerald-600',
                      })}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Confirmer le retour
                    </button>
                    <button
                      onClick={() => setConfirmAction({
                        fn: markOverdue,
                        name: 'overdue',
                        message: '⚠️ Marquer cette commande en retard ? Le stock restera bloqué jusqu\'au retour réel.',
                        buttonClass: 'bg-red-500 hover:bg-red-600',
                      })}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      Retard constaté
                    </button>
                  </>
                )}

                {/* OVERDUE → Confirmer retour */}
                {order.status === 'OVERDUE' && (
                  <button
                    onClick={() => setConfirmAction({
                      fn: confirmReturn,
                      name: 'return',
                      message: '✅ Confirmez-vous le retour du matériel en retard ? Le stock sera réintégré.',
                      buttonClass: 'bg-emerald-500 hover:bg-emerald-600',
                    })}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmer le retour (retard)
                  </button>
                )}

                {/* RETURNED / REJECTED — Read-only */}
                {(order.status === 'RETURNED' || order.status === 'REJECTED') && (
                  <div className="text-center py-6">
                    <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-full ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
                      <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                      <span className={`font-bold text-sm ${statusConfig.textColor}`}>
                        {order.status === 'RETURNED' ? 'Commande terminée — Matériel retourné' : 'Commande rejetée'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={loadAudit}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-white/40" />
                  <span className="text-white/70 font-bold text-sm">Journal d'audit</span>
                </div>
                {auditLoading ? (
                  <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                ) : (
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showAudit ? 'rotate-180' : ''}`} />
                )}
              </button>

              {showAudit && auditLog.length > 0 && (
                <div className="border-t border-white/5 px-6 py-4 space-y-3 animate-fade-in">
                  {auditLog.map((entry, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-[#ff007f] mt-2 shrink-0" />
                      <div>
                        <div className="text-white/70 text-xs font-bold">{entry.action.replace(/_/g, ' ')}</div>
                        <div className="text-white/40 text-xs">{entry.details}</div>
                        <div className="text-white/20 text-[10px] mt-1">{formatDate(entry.performed_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 mb-8">
          <p className="text-white/20 text-xs">
            🔐 Page d'administration sécurisée — Soirées Ici © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
