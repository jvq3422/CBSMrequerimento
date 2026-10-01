import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  Tractor, 
  HardHat, 
  Users, 
  Hammer, 
  Wrench, 
  Layers, 
  Boxes, 
  Paintbrush, 
  Pipette, 
  Zap, 
  ShieldAlert, 
  Activity, 
  Disc, 
  Crosshair, 
  Droplet, 
  Columns,
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Clock, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Eye, 
  RotateCcw, 
  Check, 
  XCircle,
  Flame,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AudioNoteInput from './AudioNoteInput';
import { sounds } from '../utils/sound';

function renderCategoryIcon(iconName, className = "w-5 h-5 stroke-[2.5]") {
  const map = {
    Package: <Package className={className} />,
    Truck: <Truck className={className} />,
    Tractor: <Tractor className={className} />,
    HardHat: <HardHat className={className} />,
    Users: <Users className={className} />,
    Hammer: <Hammer className={className} />,
    Wrench: <Wrench className={className} />,
    Layers: <Layers className={className} />,
    Boxes: <Boxes className={className} />,
    Paintbrush: <Paintbrush className={className} />,
    Pipette: <Pipette className={className} />,
    Zap: <Zap className={className} />,
    ShieldAlert: <ShieldAlert className={className} />,
    Activity: <Activity className={className} />,
    Disc: <Disc className={className} />,
    Crosshair: <Crosshair className={className} />,
    Droplet: <Droplet className={className} />,
    Columns: <Columns className={className} />
  };
  return map[iconName] || <Package className={className} />;
}

export default function ChefeView({ 
  currentUser, 
  currentObra, 
  catalog, 
  requisitions, 
  systemInfo,
  onCreateRequisition,
  onShowToast
}) {
  const isClean = Boolean(systemInfo?.isClean);
  const [activeTab, setActiveTab] = useState('MATERIAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedRequisitionDetail, setSelectedRequisitionDetail] = useState(null);

  // Form states for checkout
  const [selectedSector, setSelectedSector] = useState(currentObra?.sectors?.[0] || 'Frente Geral');
  const [priority, setPriority] = useState('NORMAL');
  const [neededByDate, setNeededByDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [generalNotes, setGeneralNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter catalog items
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      const matchCategory = item.category === activeTab;
      if (!matchCategory) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        (item.spec && item.spec.toLowerCase().includes(term)) ||
        (item.categoryLabel && item.categoryLabel.toLowerCase().includes(term))
      );
    });
  }, [catalog, activeTab, searchTerm]);

  // Cart statistics
  const cartList = useMemo(() => Object.values(selectedItems), [selectedItems]);
  const cartTypesCount = cartList.length;

  // Quantity controllers
  const handleSetQuantity = (item, qty) => {
    sounds.playTap();
    const newQty = Math.max(0, qty);
    setSelectedItems(prev => {
      const copy = { ...prev };
      if (newQty <= 0) {
        delete copy[item.id];
      } else {
        copy[item.id] = {
          item,
          quantity: newQty,
          notes: copy[item.id]?.notes || ''
        };
      }
      return copy;
    });
  };

  const handleIncrement = (item, step = 1) => {
    sounds.playAdd();
    const current = selectedItems[item.id]?.quantity || 0;
    handleSetQuantity(item, current + step);
  };

  const handleDecrement = (item, step = 1) => {
    sounds.playTap();
    const current = selectedItems[item.id]?.quantity || 0;
    handleSetQuantity(item, Math.max(0, current - step));
  };

  // Quick Kits Helper
  const applyQuickKit = (kitType) => {
    sounds.playSuccess();
    const newSelection = { ...selectedItems };

    if (kitType === 'CONCRETAGEM') {
      const cimento = catalog.find(i => i.code === 'MAT-CIM-01');
      const areia = catalog.find(i => i.code === 'MAT-ARE-02');
      const brita = catalog.find(i => i.code === 'MAT-BRI-03');
      const vibrador = catalog.find(i => i.code === 'FER-VIB-03');
      const pedreiros = catalog.find(i => i.code === 'MAO-PED-01');

      if (cimento) newSelection[cimento.id] = { item: cimento, quantity: 50, notes: 'Kit Concretagem' };
      if (areia) newSelection[areia.id] = { item: areia, quantity: 6, notes: 'Kit Concretagem' };
      if (brita) newSelection[brita.id] = { item: brita, quantity: 6, notes: 'Kit Concretagem' };
      if (vibrador) newSelection[vibrador.id] = { item: vibrador, quantity: 1, notes: 'Kit Concretagem' };
      if (pedreiros) newSelection[pedreiros.id] = { item: pedreiros, quantity: 2, notes: 'Kit Concretagem' };

      onShowToast({
        type: 'success',
        title: 'Kit Concretagem Carregado!',
        message: 'Cimento, areia, brita, vibrador e pedreiros inseridos.'
      });
    } else if (kitType === 'TERRAPLENAGEM') {
      const retro = catalog.find(i => i.code === 'MAQ-RET-01');
      const cacamba = catalog.find(i => i.code === 'MAQ-CAM-03');
      const serventes = catalog.find(i => i.code === 'MAO-SER-02');

      if (retro) newSelection[retro.id] = { item: retro, quantity: 1, notes: 'Kit Escavação' };
      if (cacamba) newSelection[cacamba.id] = { item: cacamba, quantity: 2, notes: 'Kit Escavação' };
      if (serventes) newSelection[serventes.id] = { item: serventes, quantity: 4, notes: 'Kit Escavação' };

      onShowToast({
        type: 'success',
        title: 'Kit Terraplenagem Carregado!',
        message: 'Retroescavadeira, 2 caçambas e 4 serventes inseridos.'
      });
    } else if (kitType === 'ALVENARIA') {
      const tijolo = catalog.find(i => i.code === 'MAT-TIJ-06');
      const cimento = catalog.find(i => i.code === 'MAT-CIM-01');
      const areia = catalog.find(i => i.code === 'MAT-ARE-02');
      const pedreiro = catalog.find(i => i.code === 'MAO-PED-01');

      if (tijolo) newSelection[tijolo.id] = { item: tijolo, quantity: 2, notes: 'Kit Alvenaria' };
      if (cimento) newSelection[cimento.id] = { item: cimento, quantity: 20, notes: 'Kit Alvenaria' };
      if (areia) newSelection[areia.id] = { item: areia, quantity: 3, notes: 'Kit Alvenaria' };
      if (pedreiro) newSelection[pedreiro.id] = { item: pedreiro, quantity: 2, notes: 'Kit Alvenaria' };

      onShowToast({
        type: 'success',
        title: 'Kit Alvenaria Carregado!',
        message: 'Blocos, cimento, areia e 2 pedreiros inseridos.'
      });
    }

    setSelectedItems(newSelection);
  };

  // Submit Requisition
  const handleSubmitRequisition = async (e) => {
    e.preventDefault();
    if (cartTypesCount === 0) return;

    setSubmitting(true);
    try {
      const itemsPayload = cartList.map(({ item, quantity, notes }) => ({
        itemId: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantityRequested: quantity,
        itemNotes: notes || ''
      }));

      const payload = {
        obraId: currentObra?.id || 'obra-amaralina',
        obraName: currentObra?.name || 'Canteiro Central CBSM',
        sector: selectedSector,
        requestedBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          phone: currentUser.phone || '(71) 98765-4321'
        },
        items: itemsPayload,
        neededByDate,
        priority,
        generalNotes
      };

      const result = await onCreateRequisition(payload);
      sounds.playSuccess();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 }
      });

      setSelectedItems({});
      setGeneralNotes('');
      setShowCheckoutModal(false);
      setActiveTab('PEDIDOS');

      onShowToast({
        type: 'success',
        title: 'Requerimento Enviado!',
        message: `Pedido ${result.code || result.id} encaminhado ao Engenheiro.`
      });
    } catch (err) {
      sounds.playReject();
      onShowToast({
        type: 'error',
        title: 'Falha ao Enviar',
        message: err.message || 'Verifique a conexão e tente novamente.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateRequisition = (req) => {
    sounds.playAdd();
    const newSelection = {};
    req.items.forEach(reqItem => {
      const catItem = catalog.find(ci => ci.id === reqItem.itemId || ci.name === reqItem.name);
      if (catItem) {
        newSelection[catItem.id] = {
          item: catItem,
          quantity: reqItem.quantityRequested,
          notes: reqItem.itemNotes || ''
        };
      }
    });
    setSelectedItems(newSelection);
    setActiveTab('MATERIAL');
    onShowToast({
      type: 'info',
      title: 'Itens Carregados!',
      message: `${Object.keys(newSelection).length} itens recuperados do pedido.`
    });
  };

  const myRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      if (currentObra?.id && r.obraId !== currentObra.id) return false;
      return true;
    });
  }, [requisitions, currentObra]);

  return (
    <div className="min-h-screen bg-neutral-100 text-black pb-36">
      
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3">
        
        {/* 
          CATEGORY TABS: SWIPEABLE PILL CAROUSEL (Never breaks button borders or text!) 
        */}
        <div className="overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 mb-3">
          <div className="flex items-center gap-2 min-w-max pb-1">
            
            <button
              type="button"
              onClick={() => { sounds.playTap(); setActiveTab('MATERIAL'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
                activeTab === 'MATERIAL'
                  ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Package className="w-4 h-4 stroke-[2.5]" />
              <span>Materiais</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playTap(); setActiveTab('MAQUINARIO'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
                activeTab === 'MAQUINARIO'
                  ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Tractor className="w-4 h-4 stroke-[2.5]" />
              <span>Maquinário</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playTap(); setActiveTab('HOMENS'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
                activeTab === 'HOMENS'
                  ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Users className="w-4 h-4 stroke-[2.5]" />
              <span>Homens (Mão de Obra)</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playTap(); setActiveTab('FERRAMENTAS'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all active:scale-95 ${
                activeTab === 'FERRAMENTAS'
                  ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Hammer className="w-4 h-4 stroke-[2.5]" />
              <span>Ferramentas</span>
            </button>

            <button
              type="button"
              onClick={() => { sounds.playTap(); setActiveTab('PEDIDOS'); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all active:scale-95 relative ${
                activeTab === 'PEDIDOS'
                  ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span>Meus Pedidos</span>
              {myRequisitions.some(r => r.status === 'PENDENTE') && (
                <span className="w-2.5 h-2.5 rounded-full bg-black border border-white animate-ping ml-1" />
              )}
            </button>

          </div>
        </div>

        {/* VIEW 1: CATALOG OF RESOURCES */}
        {activeTab !== 'PEDIDOS' && (
          <div className="space-y-3">
            
            {/* Quick Kit Shortcuts - Only in Demo Mode */}
            {!isClean && (
              <div className="bg-white border-2 border-black rounded-2xl p-2.5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-black" /> Combos Prontos de Canteiro:
                  </span>
                  <span className="text-[10px] text-neutral-600 font-bold">Toque único</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    type="button"
                    onClick={() => applyQuickKit('CONCRETAGEM')}
                    className="px-3.5 py-2 bg-neutral-100 hover:bg-black hover:text-white border-2 border-black rounded-xl text-xs font-black text-black active:scale-95 transition-all shrink-0 shadow-sm"
                  >
                    🏗️ Kit Concretagem
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickKit('ALVENARIA')}
                    className="px-3.5 py-2 bg-neutral-100 hover:bg-black hover:text-white border-2 border-black rounded-xl text-xs font-black text-black active:scale-95 transition-all shrink-0 shadow-sm"
                  >
                    🧱 Kit Alvenaria
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuickKit('TERRAPLENAGEM')}
                    className="px-3.5 py-2 bg-neutral-100 hover:bg-black hover:text-white border-2 border-black rounded-xl text-xs font-black text-black active:scale-95 transition-all shrink-0 shadow-sm"
                  >
                    🚜 Kit Terraplenagem
                  </button>
                </div>
              </div>
            )}

            {/* High-Contrast Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar item no catálogo..."
                className="w-full bg-white border-2 border-black rounded-2xl py-3 px-4 pl-10 pr-10 text-black placeholder:text-neutral-500 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black shadow-sm"
              />
              <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:bg-neutral-200 p-1 rounded-full"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Catalog Item Cards - Mobile-Proof Sizing */}
            <div className="space-y-3">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-black p-6 shadow-sm">
                  <Package className="w-12 h-12 text-black mx-auto mb-3 stroke-[2]" />
                  <h3 className="text-base font-black text-black uppercase">
                    {catalog.length === 0 ? "Catálogo Vazio" : "Nenhum item encontrado"}
                  </h3>
                  <p className="text-xs text-neutral-700 font-bold mt-1 max-w-sm mx-auto">
                    {catalog.length === 0 
                      ? "Nenhum recurso cadastrado nesta categoria. O Engenheiro Coordenador deve cadastrar os itens no Banco de Dados."
                      : "Tente buscar por outro termo ou selecione outra categoria."}
                  </p>
                </div>
              ) : (
                filteredCatalog.map(item => {
                  const currentQty = selectedItems[item.id]?.quantity || 0;
                  const isSelected = currentQty > 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-3xl border-2 transition-all bg-white ${
                        isSelected
                          ? 'border-black ring-2 ring-black shadow-[0_4px_0px_#000000]'
                          : 'border-black shadow-[0_2px_0px_#000000]'
                      }`}
                    >
                      {/* Item Top: Icon + Name */}
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black ${
                          isSelected ? 'bg-black text-white' : 'bg-neutral-100 text-black'
                        }`}>
                          {renderCategoryIcon(item.icon, "w-5 h-5 stroke-[2.5]")}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-black text-white bg-black px-1.5 py-0.5 rounded">
                              {item.code}
                            </span>
                            <span className="text-[10px] font-black uppercase text-neutral-700">
                              {item.categoryLabel}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-black text-black leading-snug mt-1 break-words">
                            {item.name}
                          </h3>

                          {item.spec && (
                            <p className="text-xs text-neutral-600 font-bold mt-0.5 line-clamp-2">
                              {item.spec}
                            </p>
                          )}

                          <div className="mt-1 flex items-center gap-3 text-xs font-bold text-neutral-700">
                            <span>Unid: <strong className="text-black font-black">{item.unit}</strong></span>
                            <span>Estoque: <strong className="text-black font-black">{item.stock}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Line 1: Quick Preset Chips Row (Separate row to prevent overflow) */}
                      <div className="mt-3 pt-2.5 border-t border-black/15">
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                          <span className="text-[10px] text-black font-black uppercase shrink-0 mr-1">
                            Atalhos:
                          </span>
                          {item.presets?.map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleSetQuantity(item, preset)}
                              className={`text-xs font-black px-2.5 py-1 rounded-lg border-2 border-black shrink-0 transition-all active:scale-95 ${
                                currentQty === preset
                                  ? 'bg-black text-white'
                                  : 'bg-white text-black hover:bg-neutral-100'
                              }`}
                            >
                              +{preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Line 2: Giant Stepper Controls (Takes full width, NEVER collides!) */}
                      <div className="mt-2 flex items-center gap-2">
                        
                        {/* Decrement Button */}
                        <button
                          type="button"
                          onClick={() => handleDecrement(item, item.minQty || 1)}
                          disabled={currentQty === 0}
                          className="w-14 h-12 rounded-2xl bg-white hover:bg-neutral-100 border-2 border-black text-black flex items-center justify-center active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all shadow-sm shrink-0"
                          aria-label="Diminuir"
                        >
                          <Minus className="w-6 h-6 stroke-[3]" />
                        </button>

                        {/* Display Quantity / Direct Manual Input */}
                        <input
                          type="number"
                          min="0"
                          value={currentQty === 0 ? '' : currentQty}
                          placeholder="0"
                          onChange={(e) => handleSetQuantity(item, parseInt(e.target.value) || 0)}
                          className="flex-1 h-12 bg-white border-2 border-black rounded-2xl text-center text-xl font-black text-black focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                        />

                        {/* Increment Button */}
                        <button
                          type="button"
                          onClick={() => handleIncrement(item, item.minQty || 1)}
                          className="w-14 h-12 rounded-2xl bg-black hover:bg-neutral-800 border-2 border-black text-white flex items-center justify-center font-black active:scale-90 transition-all shadow-sm shrink-0"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-6 h-6 stroke-[3]" />
                        </button>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* VIEW 2: MEUS REQUERIMENTOS */}
        {activeTab === 'PEDIDOS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm sm:text-base font-black text-black uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-5 h-5 text-black stroke-[2.5]" />
                Histórico de Pedidos
              </h2>
              <span className="text-xs font-black text-black bg-white border-2 border-black px-2 py-0.5 rounded-lg">
                {myRequisitions.length} pedidos
              </span>
            </div>

            {myRequisitions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-black p-6 shadow-sm">
                <Package className="w-12 h-12 text-black mx-auto mb-3 stroke-[2]" />
                <h3 className="text-base font-black text-black uppercase">
                  Nenhum pedido aberto
                </h3>
                <p className="text-xs text-neutral-700 font-bold mt-1 mb-4">
                  Selecione Materiais ou Máquinas para abrir o primeiro pedido.
                </p>
                <button
                  onClick={() => setActiveTab('MATERIAL')}
                  className="px-6 py-3 bg-black text-white font-black rounded-2xl text-xs uppercase tracking-wider active:scale-95"
                >
                  Abrir Pedido
                </button>
              </div>
            ) : (
              myRequisitions.map(req => {
                const isPending = req.status === 'PENDENTE';
                const isApproved = req.status === 'APROVADO';
                const isPartial = req.status === 'APROVADO_PARCIAL';

                return (
                  <div
                    key={req.id}
                    className="border-2 border-black rounded-3xl p-4 bg-white shadow-[0_3px_0px_#000000]"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b-2 border-black/15 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black font-mono text-black">
                            {req.id}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border-2 border-black ${
                            isPending ? 'bg-white text-black' :
                            isApproved ? 'bg-black text-white' :
                            isPartial ? 'bg-neutral-200 text-black' : 'bg-neutral-800 text-white'
                          }`}>
                            {req.status === 'PENDENTE' ? 'AGUARDANDO ENGENHEIRO' : req.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-800 mt-1 font-bold">
                          {req.sector} • {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <span className="text-[10px] font-black px-2 py-0.5 rounded border border-black bg-black text-white">
                        {req.priority}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="py-2.5 space-y-1">
                      {req.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-neutral-100 border border-black/20">
                          <span className="text-black font-bold truncate max-w-[190px] sm:max-w-md">
                            • {item.name}
                          </span>
                          <span className="font-mono font-black text-black shrink-0">
                            {item.quantityRequested} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-black/15 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRequisitionDetail(req)}
                        className="text-xs font-black text-black hover:underline flex items-center gap-1 py-1"
                      >
                        <Eye className="w-4 h-4 stroke-[2.5]" /> Ver Detalhes
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateRequisition(req)}
                        className="text-xs font-black px-3 py-1.5 bg-black text-white rounded-xl flex items-center gap-1 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" /> Repetir
                      </button>
                    </div>

                  </div>
                );
              })
            )}

          </div>
        )}

      </div>

      {/* FLOATING ACTION BOTTOM BAR */}
      {cartTypesCount > 0 && activeTab !== 'PEDIDOS' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white border-t-[3px] border-black shadow-[0_-4px_16px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-200">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-black text-white font-black flex items-center justify-center text-sm shrink-0 border border-black">
                {cartTypesCount}
              </span>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-black uppercase tracking-wide leading-tight truncate">
                  {cartTypesCount} {cartTypesCount === 1 ? 'item pedido' : 'itens pedidos'}
                </h4>
                <p className="text-[11px] text-neutral-600 font-bold truncate">
                  Pronto para envio
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { sounds.playTap(); setShowCheckoutModal(true); }}
              className="px-5 sm:px-8 py-3.5 bg-black hover:bg-neutral-800 text-white font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shrink-0 border border-black shadow-md"
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>

          </div>
        </div>
      )}

      {/* CHECKOUT MODAL: Clean, Mobile-Proof Layout (No text overflowing buttons) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white border-t-[3px] sm:border-2 border-black rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 text-black max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 block">
                  Canteiro CBSM
                </span>
                <h3 className="text-base sm:text-lg font-black text-black">
                  Finalizar Pedido de Obra
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-xl bg-neutral-100 hover:bg-black hover:text-white border-2 border-black text-black"
              >
                <XCircle className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequisition} className="space-y-4">
              
              {/* Sector Selection */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  1. Frente de Serviço:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentObra?.sectors?.map((sec, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { sounds.playTap(); setSelectedSector(sec); }}
                      className={`p-2.5 rounded-xl border-2 border-black text-xs font-black text-left transition-all active:scale-95 flex items-center justify-between ${
                        selectedSector === sec
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-neutral-100'
                      }`}
                    >
                      <span className="truncate">{sec}</span>
                      {selectedSector === sec && <Check className="w-4 h-4 text-white stroke-[3] shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Selector (Clean Vertical Cards to Guarantee NO Text Overflow!) */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  2. Nível de Urgência:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { sounds.playTap(); setPriority('NORMAL'); }}
                    className={`py-3 px-2 rounded-2xl border-2 border-black text-center transition-all active:scale-95 ${
                      priority === 'NORMAL'
                        ? 'bg-black text-white font-black'
                        : 'bg-white text-black font-bold hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-black">Normal</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { sounds.playTap(); setPriority('URGENTE'); }}
                    className={`py-3 px-2 rounded-2xl border-2 border-black text-center transition-all active:scale-95 ${
                      priority === 'URGENTE'
                        ? 'bg-black text-white font-black'
                        : 'bg-white text-black font-bold hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-black">Urgente</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { sounds.playTap(); setPriority('CRITICO'); }}
                    className={`py-3 px-2 rounded-2xl border-2 border-black text-center transition-all active:scale-95 ${
                      priority === 'CRITICO'
                        ? 'bg-black text-white font-black ring-2 ring-black'
                        : 'bg-white text-black font-bold hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-black flex items-center justify-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Crítico
                    </div>
                  </button>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  3. Data Limite de Entrega:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={neededByDate}
                    onChange={(e) => setNeededByDate(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-black rounded-xl p-3 pl-10 text-black font-black text-xs focus:outline-none"
                  />
                  <Calendar className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                </div>
              </div>

              {/* Items Summary */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  4. Itens Solicitados ({cartTypesCount}):
                </label>
                <div className="bg-neutral-50 border-2 border-black rounded-2xl p-2.5 max-h-40 overflow-y-auto divide-y divide-black/15">
                  {cartList.map(({ item, quantity }) => (
                    <div key={item.id} className="py-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-black truncate max-w-[180px]">{item.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-black bg-neutral-200 px-2 py-0.5 rounded border border-black text-[11px]">
                          {quantity} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetQuantity(item, 0)}
                          className="p-1 text-black hover:bg-black hover:text-white rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observation / Voice dictation */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5">
                  5. Observação (Falar ou Digitar):
                </label>
                <AudioNoteInput
                  value={generalNotes}
                  onChange={setGeneralNotes}
                  placeholder="Observação da obra..."
                />
              </div>

              {/* Big Clean Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || cartTypesCount === 0}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-black rounded-2xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 border-2 border-black shadow-[0_3px_0px_#000000]"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>{submitting ? 'Enviando...' : 'ENVIAR PEDIDO'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* REQUISITION DETAIL MODAL */}
      {selectedRequisitionDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white border-2 border-black rounded-3xl p-5 text-black shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b-2 border-black pb-2.5 mb-3">
              <div>
                <span className="text-xs font-mono font-black text-black">{selectedRequisitionDetail.id}</span>
                <h3 className="text-base font-black text-black leading-tight">{selectedRequisitionDetail.obraName}</h3>
                <p className="text-xs text-neutral-700 font-bold">{selectedRequisitionDetail.sector}</p>
              </div>
              <button
                onClick={() => setSelectedRequisitionDetail(null)}
                className="p-1 rounded-xl bg-neutral-100 hover:bg-black hover:text-white border-2 border-black text-black"
              >
                <XCircle className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-2.5 rounded-xl border border-black">
                <div>
                  <span className="text-neutral-600 font-bold block">Status:</span>
                  <strong className="text-xs font-black text-black">{selectedRequisitionDetail.status}</strong>
                </div>
                <div>
                  <span className="text-neutral-600 font-bold block">Urgência:</span>
                  <strong className="text-xs font-black text-black">{selectedRequisitionDetail.priority}</strong>
                </div>
              </div>

              <div>
                <span className="font-black uppercase text-black mb-1 block">Itens:</span>
                <div className="bg-neutral-50 border border-black rounded-xl p-2 divide-y divide-black/15">
                  {selectedRequisitionDetail.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <span className="font-bold text-black">{it.name}</span>
                      <span className="font-black text-black">{it.quantityRequested} {it.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequisitionDetail.generalNotes && (
                <div className="p-2.5 bg-neutral-100 border border-black rounded-xl">
                  <span className="font-black text-black block mb-0.5">Observação da Obra:</span>
                  <p className="text-neutral-900 font-bold">{selectedRequisitionDetail.generalNotes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2.5 border-t border-black/15 flex justify-end">
              <button
                onClick={() => setSelectedRequisitionDetail(null)}
                className="px-5 py-2 bg-black text-white font-black rounded-xl text-xs uppercase"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
