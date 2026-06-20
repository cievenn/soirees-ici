import React, { useState, useEffect } from 'react';
import { THEME } from '../theme';
import { ShoppingCart, Plus, Minus, X, CheckCircle, Loader2, AlertCircle, Building2, User } from 'lucide-react';
import Button from '../components/ui/Button';
import DynamicCalendar from '../components/ui/DynamicCalendar';
import { getEquipment, createOrder, checkCalendarAvailability } from '../services/api';

export default function Location() {
  const [selection, setSelection] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    clientType: 'PARTICULIER',
    companyName: '',
    vatNumber: '',
    eventType: 'mariage',
    eventTypeOther: '',
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    location: '',
    notes: ''
  });
  
  const [calendarData, setCalendarData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Date minimum = aujourd'hui (empêche la sélection de dates passées)
  const today = new Date().toISOString().split('T')[0];

  // Charger l'équipement depuis l'API (recharge quand les dates changent)
  useEffect(() => {
    async function loadEquipment() {
      try {
        setEquipmentLoading(true);
        const startDate = formData.startDate || null;
        const endDate = formData.endDate || null;
        const data = await getEquipment(startDate, endDate);
        setEquipment(data.equipment || []);
      } catch (err) {
        console.error('Erreur chargement équipement:', err);
        // Fallback local
        const { DATA } = await import('../data');
        setEquipment(DATA.equipments.map((e, i) => ({
          id: i + 1,
          name: e.name,
          price: e.price,
          caution: e.caution,
          image: e.image,
          stock_total: 99,
          stock_reserved: 0,
          stock_available: 99,
        })));
      } finally {
        setEquipmentLoading(false);
      }
    }
    loadEquipment();
  }, [formData.startDate, formData.endDate]);

  // Vérifier la disponibilité du calendrier quand le panier ou la modale s'ouvre
  useEffect(() => {
    async function loadAvailability() {
      if (!isModalOpen || Object.keys(selection).length === 0) return;
      
      const items = Object.entries(selection).map(([name, qty]) => {
        const equip = equipment.find(e => e.name === name);
        return { equipment_id: equip ? equip.id : 0, quantity: qty };
      }).filter(i => i.equipment_id !== 0);
      
      try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const data1 = await checkCalendarAvailability(items, currentYear, currentMonth);
        
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear += 1;
        }
        const data2 = await checkCalendarAvailability(items, nextYear, nextMonth);
        
        const combinedCalendarData = [...(data1.calendarData || []), ...(data2.calendarData || [])];
        setCalendarData(combinedCalendarData);
        
        // Si les dates déjà sélectionnées sont devenues invalides avec l'ajout au panier, on les reset
        if (formData.startDate) {
          const isInvalid = combinedCalendarData.some(ud => {
            if (ud.status !== 'UNAVAILABLE') return false;
            if (!formData.endDate) return ud.date === formData.startDate;
            return ud.date >= formData.startDate && ud.date <= formData.endDate;
          });
          if (isInvalid) {
            setFormData(prev => ({ ...prev, startDate: '', endDate: '' }));
            setSubmitError("Vos dates précédentes ne sont plus disponibles suite à l'ajout de nouveaux articles.");
          }
        }
      } catch (err) {
        console.error("Erreur disponibilité calendrier", err);
      }
    }
    loadAvailability();
  }, [selection, isModalOpen, equipment]);

  const totalItems = Object.values(selection).reduce((a, b) => a + b, 0);

  const updateQuantity = (itemName, delta) => {
    const item = equipment.find(e => e.name === itemName);
    setSelection(prev => {
      const current = prev[itemName] || 0;
      const max = item ? item.stock_available : 999;
      const next = Math.max(0, Math.min(max, current + delta));
      const newSelection = { ...prev };
      if (next === 0) {
        delete newSelection[itemName];
      } else {
        newSelection[itemName] = next;
      }
      return newSelection;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (start, end) => {
    setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      setSubmitError("Veuillez sélectionner vos dates de location dans le calendrier.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const items = Object.entries(selection).map(([name, qty]) => {
        const equip = equipment.find(e => e.name === name);
        return { equipment_id: equip.id, quantity: qty };
      });

      await createOrder({
        client_type: formData.clientType,
        company_name: formData.companyName,
        vat_number: formData.vatNumber,
        event_type: formData.eventType === 'autre' ? formData.eventTypeOther : formData.eventType,
        event_type_other: formData.eventTypeOther,
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        event_location: formData.location,
        start_date: formData.startDate,
        end_date: formData.endDate,
        notes: formData.notes,
        items,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        setIsModalOpen(false);
        setSelection({});
        setFormData({
          clientType: 'PARTICULIER', companyName: '', vatNumber: '', eventType: 'mariage', eventTypeOther: '',
          name: '', email: '', phone: '', startDate: '', endDate: '', location: '', notes: ''
        });
        setSubmitSuccess(false);
      }, 3000);

    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  return (
    <div className="pt-32 pb-32 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen relative">
      {/* Header Section */}
      <div className="text-center mb-16 md:mb-24 relative z-10">
        <span className="font-semibold uppercase tracking-[0.2em] text-[#ff007f] text-xs md:text-sm mb-4 md:mb-6 inline-block py-1.5 md:py-2 px-4 md:px-6 rounded-full border border-[#ff007f]/20 bg-[#ff007f]/5 shadow-[0_0_15px_rgba(255,0,127,0.1)]">
          Faites votre sélection
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display text-white mb-6 md:mb-8 leading-[0.9] tracking-tighter">
          LOCATION <br /> <span className={THEME.gradientText}>MATÉRIEL</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light px-4 leading-relaxed">
          Ajoutez le matériel dont vous avez besoin à votre sélection et demandez un devis gratuit en quelques clics.
        </p>
      </div>

      {equipmentLoading && (
        <div className="flex justify-center py-20">
          <div className="flex items-center gap-3 text-white/50">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-medium">Chargement du catalogue...</span>
          </div>
        </div>
      )}

      {!equipmentLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
          {equipment.map((item, index) => {
            const qty = selection[item.name] || 0;
            const isSelected = qty > 0;
            const isOutOfStock = item.stock_available <= 0;

            return (
              <div 
                key={item.id || index}
                className={`group backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-500 flex flex-col relative
                  ${isSelected ? 'bg-white/5 border-[#ff007f]/50 shadow-[0_0_30px_rgba(255,0,127,0.15)]' : 'bg-[#050505]/80 border-white/5 hover:border-white/20'}
                  ${isOutOfStock ? 'opacity-60' : ''}
                `}
              >
                {isSelected && (
                  <div className="absolute top-4 left-4 z-30">
                    <div className="bg-[#ff007f] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {qty}
                    </div>
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute top-4 left-4 z-30">
                    <div className="bg-red-500/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                      Indisponible
                    </div>
                  </div>
                )}
                <div className="aspect-[4/3] bg-white/5 relative overflow-hidden flex items-center justify-center p-6">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-50 z-10"></div>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className={`w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-700 relative z-0 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                      <span className={`font-bold ${THEME.gradientText}`}>
                        {item.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between relative z-20">
                  <div className="mb-6">
                    <h3 className="text-xl md:text-2xl font-display text-white mb-3 group-hover:text-[#ff007f] transition-colors">
                      {item.name}
                    </h3>
                    {item.caution && (
                      <p className="text-gray-400 text-sm font-light leading-relaxed">
                        <span className="text-gray-500">Caution :</span> {item.caution}
                      </p>
                    )}
                    {!isOutOfStock && item.stock_available < 999 && (
                      <div className="mt-2 flex flex-col gap-1">
                        <p className={`text-xs font-semibold ${item.stock_available <= 3 ? 'text-amber-400' : 'text-emerald-400/60'}`}>
                          {item.stock_available <= 3 
                            ? `⚡ Plus que ${item.stock_available} disponible${item.stock_available > 1 ? 's' : ''}`
                            : `${item.stock_available} disponibles`
                          }
                        </p>
                        {item.stock_available_today !== undefined && item.stock_available_today < item.stock_total && (
                          <p className="text-[10px] text-gray-400/60 italic font-medium bg-white/5 w-max px-2 py-0.5 rounded-full">
                            Stock actuel pour aujourd'hui : {item.stock_available_today}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`flex items-center justify-between border border-white/10 rounded-full p-1 bg-white/5 mt-auto ${isOutOfStock ? 'pointer-events-none opacity-40' : ''}`}>
                    <button 
                      onClick={() => updateQuantity(item.name, -1)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors disabled:opacity-30"
                      disabled={qty === 0 || isOutOfStock}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-white text-lg w-8 text-center">{qty}</span>
                    <button 
                      onClick={() => updateQuantity(item.name, 1)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-[#ff007f] transition-colors disabled:opacity-30"
                      disabled={isOutOfStock || qty >= item.stock_available}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-40 p-4 md:p-8 pointer-events-none">
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 p-4 md:p-5 rounded-full shadow-[0_0_50px_rgba(255,0,127,0.3)] flex items-center justify-between pointer-events-auto transform transition-all duration-500 animate-slide-up">
            <div className="flex items-center gap-4 pl-2">
              <div className="bg-[#ff007f] w-12 h-12 rounded-full flex items-center justify-center relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#ff007f]">
                  {totalItems}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-bold">{totalItems} article{totalItems > 1 ? 's' : ''} sélectionné{totalItems > 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400">Prêt à demander un devis ?</p>
              </div>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="!bg-white !text-black hover:!bg-[#ff007f] hover:!text-white !rounded-full px-6 md:px-8 py-3 transition-colors">
              Voir ma sélection
            </Button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-[#111] border border-white/10 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl relative z-10 shadow-2xl flex flex-col lg:flex-row">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left side: Summary */}
            <div className="w-full lg:w-1/3 bg-white/5 p-8 border-r border-white/5 flex flex-col max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-display text-white mb-6">Votre Sélection</h3>
              <div className="flex flex-col gap-4">
                {Object.entries(selection).map(([name, qty], index) => {
                  const itemInfo = equipment.find(e => e.name === name);
                  return (
                    <div key={index} className="flex flex-col bg-black/30 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <img src={itemInfo?.image} alt={name} className="w-16 h-16 object-contain bg-white/5 rounded-xl p-1" />
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{name}</p>
                          
                          <div className="flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10 mt-3 w-max">
                            <button 
                              type="button" 
                              onClick={() => updateQuantity(name, -1)} 
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-white text-sm font-bold w-5 text-center">{qty}</span>
                            <button 
                              type="button" 
                              onClick={() => updateQuantity(name, 1)} 
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:bg-[#ff007f] transition-colors"
                              disabled={qty >= (itemInfo?.stock_available || 999)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          {formData.startDate && formData.endDate && itemInfo && itemInfo.stock_available < itemInfo.stock_total && (
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-amber-400/90 text-[11px] font-medium">
                                Stock réduit sur vos dates : {itemInfo.stock_available} restants
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Form & Calendar */}
            <div className="w-full lg:w-2/3 p-8 flex flex-col gap-8 max-h-[90vh] overflow-y-auto">
              
              <div>
                <h3 className="text-2xl font-display text-white mb-2">Dates de location</h3>
                <p className="text-gray-400 text-sm mb-6">Sélectionnez vos dates. Les jours grisés sont indisponibles pour le matériel de votre panier.</p>
                <DynamicCalendar 
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  onChange={handleDateChange}
                  calendarData={calendarData}
                />
              </div>

              <div>
                <h3 className="text-2xl font-display text-white mb-2">Vos informations</h3>
                
                {submitError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
                  
                  {/* Type de Client */}
                  <div className="flex p-1 bg-black/50 border border-white/10 rounded-xl w-max">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, clientType: 'PARTICULIER' }))}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        formData.clientType === 'PARTICULIER' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4" /> Particulier
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, clientType: 'ENTREPRISE' }))}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        formData.clientType === 'ENTREPRISE' ? 'bg-[#ff007f] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4" /> Entreprise
                    </button>
                  </div>

                  {formData.clientType === 'ENTREPRISE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-white/5 border border-[#ff007f]/30 rounded-2xl mb-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Nom de l'entreprise *</label>
                        <input required type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors" placeholder="Acme Corp" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Numéro de TVA (optionnel)</label>
                        <input type="text" name="vatNumber" value={formData.vatNumber} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors" placeholder="BE0123456789" />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        {formData.clientType === 'ENTREPRISE' ? 'Nom et Prénom du contact *' : 'Nom complet *'}
                      </label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors" placeholder="Jean Dupont" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Téléphone *</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors" placeholder="+32 4XX XX XX XX" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors" placeholder="jean@example.com" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Lieu de l'événement *</label>
                      <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors" placeholder="Code postal, Ville" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Type d'événement *</label>
                      <select required name="eventType" value={formData.eventType} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors appearance-none">
                        <option value="mariage">Mariage</option>
                        <option value="événement professionnel">Événement professionnel</option>
                        <option value="anniversaire">Anniversaire</option>
                        <option value="soirée privée">Soirée privée</option>
                        <option value="festival/concert">Festival/Concert</option>
                        <option value="autre">Autre (préciser)</option>
                      </select>
                    </div>
                  </div>

                  {formData.eventType === 'autre' && (
                    <div className="flex flex-col gap-1.5 animate-slide-up">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Précisez l'événement *</label>
                      <input required type="text" name="eventTypeOther" value={formData.eventTypeOther} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors" placeholder="Ex: Tournage de film" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Remarques (optionnel)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff007f] transition-colors resize-none h-24" placeholder="Précisions sur la livraison, questions..."></textarea>
                  </div>

                  <div className="bg-[#ff007f]/10 border border-[#ff007f]/20 rounded-xl p-4 mt-2">
                    <p className="text-[#ff007f] text-sm leading-relaxed">
                      <strong>Note importante :</strong> Si votre demande est acceptée, vous recevrez un lien de paiement par e-mail. 
                      Vous aurez alors <strong>24h pour payer</strong> et bloquer définitivement le matériel.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || submitSuccess}
                    className={`w-full !py-4 mt-4 !rounded-xl text-white flex items-center justify-center gap-2 transition-all duration-300 ${
                      submitSuccess 
                        ? '!bg-green-500 hover:!bg-green-600' 
                        : '!bg-[#ff007f] hover:!bg-[#ff7f00]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Demande envoyée avec succès !
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Envoyer la demande
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Slide-up Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
