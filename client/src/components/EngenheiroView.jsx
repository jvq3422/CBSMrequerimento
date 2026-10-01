import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Printer, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Check, 
  Layers,
  Users,
  HardHat,
  UserPlus
} from 'lucide-react';
import DispatchPrintModal from './DispatchPrintModal';
import { sounds } from '../utils/sound';

export default function EngenheiroView({
  currentUser,
  currentObra,
  obras,
  catalog,
  requisitions,
  users = [],
  systemInfo,
  onReviewRequisition,
  onAddCatalogItem,
  onUpdateCatalogItem,
  onDeleteCatalogItem,
  onAddObra,
  onCreateUser,
  onDeleteUser,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('REQUERIMENTOS');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterObra, setFilterObra] = useState(currentObra?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Requisition for Analysis
  const [analyzingReq, setAnalyzingReq] = useState(null);
  // Requisition for Printing
  const [printingReq, setPrintingReq] = useState(null);

  // Analysis form state
  const [itemsReview, setItemsReview] = useState([]);
  const [engineerNotes, setEngineerNotes] = useState('');
  const [warehouseSource, setWarehouseSource] = useState('Almoxarifado Central Lauro de Freitas');
  const [dispatchDate, setDispatchDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [reviewing, setReviewing] = useState(false);

  // Catalog Management modal state
  const [showAddCatalogModal, setShowAddCatalogModal] = useState(false);
  const [newCatalogItem, setNewCatalogItem] = useState({
    category: 'MATERIAL',
    code: '',
    name: '',
    spec: '',
    unit: 'sacos',
    stock: 100,
    minQty: 1,
    description: ''
  });

  // Obra Management modal state
  const [showAddObraModal, setShowAddObraModal] = useState(false);
  const [newObra, setNewObra] = useState({
    name: '',
    code: '',
    location: 'Salvador - BA',
    type: 'Requalificação Urbana',
    sectors: 'Frente 1, Frente 2, Canteiro Geral'
  });

  // User Management modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CHEFE_OBRA',
    assignedObraId: '',
    phone: '',
    crea: ''
  });

  // Open Analysis Modal
  const openAnalysis = (req) => {
    sounds.playTap();
    setAnalyzingReq(req);
    setItemsReview(req.items.map(it => ({
      itemId: it.itemId,
      quantityApproved: it.quantityApproved ?? it.quantityRequested,
      status: it.status === 'PENDENTE' ? 'APROVADO' : it.status,
      itemNotes: it.itemNotes || ''
    })));
    setEngineerNotes(req.review?.engineerNotes || '');
    setWarehouseSource(req.review?.warehouseSource || 'Almoxarifado Central Lauro de Freitas');
    setDispatchDate(req.review?.dispatchDate ? req.review.dispatchDate.split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  // Handle Review Decision
  const handleDecision = async (decision) => {
    if (!analyzingReq) return;

    if (decision === 'REPROVADO' && !engineerNotes.trim()) {
      sounds.playReject();
      onShowToast({
        type: 'warning',
        title: 'Justificativa Obrigatória',
        message: 'Por favor, escreva o parecer técnico da recusa para o mestre de obra.'
      });
      return;
    }

    setReviewing(true);
    sounds.playTap();

    try {
      await onReviewRequisition(analyzingReq.id, {
        decision,
        engineer: {
          id: currentUser.id,
          name: currentUser.name,
          crea: currentUser.crea || 'CREA-BA 48219/D'
        },
        engineerNotes,
        itemsReview,
        warehouseSource,
        dispatchDate
      });

      if (decision === 'REPROVADO') {
        sounds.playReject();
      } else {
        sounds.playSuccess();
      }

      onShowToast({
        type: 'success',
        title: `Requerimento ${decision === 'APROVADO' ? 'Aprovado' : decision === 'APROVADO_PARCIAL' ? 'Aprovado c/ Ajustes' : 'Reprovado'}`,
        message: `Status atualizado para ${analyzingReq.obraName}.`
      });

      setAnalyzingReq(null);
    } catch (err) {
      sounds.playReject();
      onShowToast({
        type: 'error',
        title: 'Erro ao processar',
        message: err.message
      });
    } finally {
      setReviewing(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const pending = requisitions.filter(r => r.status === 'PENDENTE');
    const critical = pending.filter(r => r.priority === 'CRITICO').length;
    const approved = requisitions.filter(r => r.status === 'APROVADO' || r.status === 'APROVADO_PARCIAL');
    const rejected = requisitions.filter(r => r.status === 'REPROVADO');
    return {
      pendingCount: pending.length,
      criticalCount: critical,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      totalCount: requisitions.length
    };
  }, [requisitions]);

  // Filtered Requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(r => {
      if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
      if (filterPriority !== 'ALL' && r.priority !== filterPriority) return false;
      if (filterObra && r.obraId !== filterObra) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(term);
        const matchesObra = r.obraName.toLowerCase().includes(term);
        const matchesUser = r.requestedBy?.name?.toLowerCase().includes(term);
        const matchesItem = r.items.some(i => i.name.toLowerCase().includes(term));
        if (!matchesId && !matchesObra && !matchesUser && !matchesItem) return false;
      }
      return true;
    });
  }, [requisitions, filterStatus, filterPriority, filterObra, searchTerm]);

  // Handle Add Catalog Item
  const handleCreateCatalogItem = async (e) => {
    e.preventDefault();
    try {
      await onAddCatalogItem(newCatalogItem);
      sounds.playSuccess();
      setShowAddCatalogModal(false);
      setNewCatalogItem({
        category: 'MATERIAL',
        code: '',
        name: '',
        spec: '',
        unit: 'sacos',
        stock: 100,
        minQty: 1,
        description: ''
      });
      onShowToast({
        type: 'success',
        title: 'Item Cadastrado!',
        message: 'Novo recurso inserido no catálogo CBSM.'
      });
    } catch (err) {
      onShowToast({ type: 'error', title: 'Erro', message: err.message });
    }
  };

  // Handle Add Obra
  const handleCreateObra = async (e) => {
    e.preventDefault();
    try {
      const sectorsList = newObra.sectors.split(',').map(s => s.trim()).filter(Boolean);
      await onAddObra({
        ...newObra,
        sectors: sectorsList
      });
      sounds.playSuccess();
      setShowAddObraModal(false);
      onShowToast({
        type: 'success',
        title: 'Canteiro Cadastrado!',
        message: `Obra ${newObra.name} cadastrada com sucesso.`
      });
    } catch (err) {
      onShowToast({ type: 'error', title: 'Erro', message: err.message });
    }
  };

  // Handle Add User / Chefe de Obra
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (onCreateUser) {
        await onCreateUser(newUser);
        sounds.playSuccess();
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'CHEFE_OBRA',
          assignedObraId: '',
          phone: '',
          crea: ''
        });
        onShowToast({
          type: 'success',
          title: 'Usuário Cadastrado!',
          message: `${newUser.role === 'ENGENHEIRO' ? 'Engenheiro' : 'Chefe de Obra'} adicionado à equipe.`
        });
      }
    } catch (err) {
      sounds.playReject();
      onShowToast({ type: 'error', title: 'Erro', message: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black pb-24">
      
      {/* Top Engineer Master Ribbon */}
      <div className="bg-white border-b-2 border-black px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-black tracking-wide uppercase">
                  Engenheiro Coordenador
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.2 bg-black text-white rounded">
                  Mestre
                </span>
              </div>
              <p className="text-xs text-neutral-700 font-bold">
                {currentUser?.name} • {currentUser?.crea || 'CREA-BA 48219/D'}
              </p>
            </div>
          </div>

          {/* Swipeable Sub-Tabs on Mobile */}
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pt-2 sm:pt-0">
            <div className="flex items-center gap-1.5 min-w-max">
              <button
                onClick={() => { sounds.playTap(); setActiveTab('REQUERIMENTOS'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 border-2 border-black ${
                  activeTab === 'REQUERIMENTOS'
                    ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Requerimentos ({metrics.pendingCount})
              </button>
              <button
                onClick={() => { sounds.playTap(); setActiveTab('CATALOGO'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 border-2 border-black ${
                  activeTab === 'CATALOGO'
                    ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Banco de Dados ({catalog.length})
              </button>
              <button
                onClick={() => { sounds.playTap(); setActiveTab('OBRAS'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 border-2 border-black ${
                  activeTab === 'OBRAS'
                    ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Canteiros ({obras.length})
              </button>
              <button
                onClick={() => { sounds.playTap(); setActiveTab('EQUIPE'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 border-2 border-black ${
                  activeTab === 'EQUIPE'
                    ? 'bg-black text-white shadow-[0_2px_0px_#000000]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Equipe ({users.length})
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-4">
        
        {/* TAB 1: REQUERIMENTOS DASHBOARD & ANALYSIS */}
        {activeTab === 'REQUERIMENTOS' && (
          <div className="space-y-4">
            
            {/* KPI Cards (Mobile-friendly 2x2 grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              <div 
                onClick={() => setFilterStatus('PENDENTE')}
                className={`p-3.5 rounded-2xl border-2 border-black cursor-pointer bg-white transition-all ${
                  filterStatus === 'PENDENTE'
                    ? 'ring-2 ring-black shadow-[0_3px_0px_#000000]'
                    : 'hover:bg-neutral-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-neutral-700 mb-1">
                  <span className="text-[11px] font-black uppercase">Pendentes</span>
                  <Clock className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="text-2xl font-black text-black">
                  {metrics.pendingCount}
                </div>
                {metrics.criticalCount > 0 && (
                  <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.5 rounded mt-1 inline-block">
                    {metrics.criticalCount} CRÍTICO!
                  </span>
                )}
              </div>

              <div 
                onClick={() => setFilterStatus('APROVADO')}
                className={`p-3.5 rounded-2xl border-2 border-black cursor-pointer bg-white transition-all ${
                  filterStatus === 'APROVADO'
                    ? 'ring-2 ring-black shadow-[0_3px_0px_#000000]'
                    : 'hover:bg-neutral-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-neutral-700 mb-1">
                  <span className="text-[11px] font-black uppercase">Aprovados</span>
                  <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="text-2xl font-black text-black">
                  {metrics.approvedCount}
                </div>
              </div>

              <div 
                onClick={() => setFilterStatus('REPROVADO')}
                className={`p-3.5 rounded-2xl border-2 border-black cursor-pointer bg-white transition-all ${
                  filterStatus === 'REPROVADO'
                    ? 'ring-2 ring-black shadow-[0_3px_0px_#000000]'
                    : 'hover:bg-neutral-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-neutral-700 mb-1">
                  <span className="text-[11px] font-black uppercase">Reprovados</span>
                  <XCircle className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="text-2xl font-black text-black">
                  {metrics.rejectedCount}
                </div>
              </div>

              <div 
                onClick={() => setFilterStatus('ALL')}
                className={`p-3.5 rounded-2xl border-2 border-black cursor-pointer bg-white transition-all ${
                  filterStatus === 'ALL'
                    ? 'ring-2 ring-black shadow-[0_3px_0px_#000000]'
                    : 'hover:bg-neutral-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-neutral-700 mb-1">
                  <span className="text-[11px] font-black uppercase">Total</span>
                  <Layers className="w-4 h-4 text-black stroke-[2.5]" />
                </div>
                <div className="text-2xl font-black text-black">
                  {metrics.totalCount}
                </div>
              </div>

            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border-2 border-black flex flex-col sm:flex-row gap-2 shadow-sm">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por canteiro, código ou item..."
                  className="w-full bg-white border border-black rounded-xl py-2 px-3 pl-9 text-xs font-bold text-black focus:outline-none"
                />
                <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex-1 sm:flex-none bg-white border border-black rounded-xl px-2.5 py-2 text-xs font-black text-black focus:outline-none"
                >
                  <option value="ALL">Prioridade: Todas</option>
                  <option value="CRITICO">🔥 Crítico</option>
                  <option value="URGENTE">Urgente</option>
                  <option value="NORMAL">Normal</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none bg-white border border-black rounded-xl px-2.5 py-2 text-xs font-black text-black focus:outline-none"
                >
                  <option value="ALL">Status: Todos</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="APROVADO">Aprovados</option>
                  <option value="APROVADO_PARCIAL">Aprovados Parcial</option>
                  <option value="REPROVADO">Reprovados</option>
                </select>
              </div>
            </div>

            {/* Requisitions List */}
            <div className="space-y-3">
              {filteredRequisitions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-black p-6 shadow-sm">
                  <Clock className="w-10 h-10 text-black mx-auto mb-2 stroke-[2]" />
                  <h3 className="text-sm font-black text-black uppercase">
                    Nenhum pedido com estes filtros
                  </h3>
                </div>
              ) : (
                filteredRequisitions.map(req => {
                  const isPending = req.status === 'PENDENTE';
                  const isApproved = req.status === 'APROVADO';
                  const isPartial = req.status === 'APROVADO_PARCIAL';

                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-3xl border-2 border-black bg-white shadow-[0_3px_0px_#000000]"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs sm:text-sm font-black text-black">
                              {req.id}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded border border-black bg-black text-white">
                              {req.status}
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-neutral-200 text-black border border-black">
                              {req.priority}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-black text-black mt-1">
                            {req.obraName}
                          </h3>

                          <p className="text-xs text-neutral-800 font-bold">
                            Frente: <strong className="text-black font-black">{req.sector}</strong> • Solicitante: {req.requestedBy?.name}
                          </p>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="mt-2.5 pt-2 border-t border-black/15">
                        <div className="flex flex-wrap gap-1.5">
                          {req.items.map((it, idx) => (
                            <span key={idx} className="bg-neutral-100 border border-black/20 px-2 py-0.5 rounded-lg text-xs font-bold text-black">
                              {it.name}: <strong className="font-black">{it.quantityRequested} {it.unit}</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Notes if any */}
                      {(req.generalNotes || req.audioNote) && (
                        <div className="mt-2.5 p-2.5 bg-neutral-100 border border-black rounded-xl text-xs">
                          <span className="font-black text-black block mb-0.5">Observação da Obra:</span>
                          <p className="text-neutral-900 font-bold italic">
                            "{req.generalNotes || req.audioNote}"
                          </p>
                        </div>
                      )}

                      {/* Action Buttons Row - Mobile First */}
                      <div className="mt-3 pt-2.5 border-t border-black/15 flex items-center gap-2">
                        
                        {(isApproved || isPartial) && (
                          <button
                            type="button"
                            onClick={() => setPrintingReq(req)}
                            className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black font-black rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Printer className="w-4 h-4 stroke-[2.5]" />
                            <span>Imprimir Guia</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openAnalysis(req)}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 border-2 border-black ${
                            isPending
                              ? 'bg-black text-white hover:bg-neutral-800'
                              : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                          <span>{isPending ? 'Analisar' : 'Revisar'}</span>
                        </button>

                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 2: GESTÃO DO CATÁLOGO */}
        {activeTab === 'CATALOGO' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-black text-black uppercase">
                Catálogo de Recursos CBSM
              </h2>
              <button
                type="button"
                onClick={() => { sounds.playTap(); setShowAddCatalogModal(true); }}
                className="px-3.5 py-2 bg-black text-white font-black rounded-xl text-xs uppercase flex items-center gap-1.5 border-2 border-black"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo Recurso</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border-2 border-black overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 font-black">Item</th>
                      <th className="py-2.5 px-3 font-black">Categoria</th>
                      <th className="py-2.5 px-2 text-center font-black">Unid</th>
                      <th className="py-2.5 px-3 text-right font-black">Estoque</th>
                      <th className="py-2.5 px-3 text-right font-black">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-t border-black">
                    {catalog.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-neutral-600 font-bold">
                          Nenhum item cadastrado no catálogo CBSM. Clique em "+ Novo Recurso" acima para adicionar.
                        </td>
                      </tr>
                    ) : (
                      catalog.map(item => (
                        <tr key={item.id} className="font-bold">
                          <td className="py-2.5 px-3 font-black text-black">{item.name}</td>
                          <td className="py-2.5 px-3 text-neutral-700">{item.category}</td>
                          <td className="py-2.5 px-2 text-center">{item.unit}</td>
                          <td className="py-2.5 px-3 text-right font-black text-black">{item.stock}</td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                const newStock = prompt(`Novo estoque para ${item.name}:`, item.stock);
                                if (newStock !== null && !isNaN(Number(newStock))) {
                                  await onUpdateCatalogItem(item.id, { stock: Number(newStock) });
                                  onShowToast({ type: 'success', title: 'Estoque Atualizado', message: `${item.name}: ${newStock}` });
                                }
                              }}
                              className="p-1 bg-neutral-100 hover:bg-black hover:text-white border border-black rounded mr-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Remover "${item.name}"?`)) {
                                  await onDeleteCatalogItem(item.id);
                                  onShowToast({ type: 'info', title: 'Removido', message: item.name });
                                }
                              }}
                              className="p-1 bg-neutral-100 hover:bg-black hover:text-white border border-black rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GESTÃO DE OBRAS */}
        {activeTab === 'OBRAS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-black text-black uppercase">
                Canteiros de Obras CBSM
              </h2>
              <button
                type="button"
                onClick={() => { sounds.playTap(); setShowAddObraModal(true); }}
                className="px-3.5 py-2 bg-black text-white font-black rounded-xl text-xs uppercase flex items-center gap-1.5 border-2 border-black"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Nova Obra</span>
              </button>
            </div>

            {obras.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border-2 border-black p-6 shadow-sm">
                <MapPin className="w-12 h-12 text-black mx-auto mb-3 stroke-[2]" />
                <h3 className="text-base font-black text-black uppercase">
                  Nenhum Canteiro Cadastrado
                </h3>
                <p className="text-xs text-neutral-700 font-bold mt-1 max-w-sm mx-auto">
                  Clique no botão "+ Nova Obra" acima para cadastrar a primeira frente de trabalho.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {obras.map(obra => (
                  <div key={obra.id} className="bg-white border-2 border-black rounded-2xl p-4 shadow-sm space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-black text-white bg-black px-1.5 py-0.5 rounded">
                          {obra.code}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-black mt-1">
                          {obra.name}
                        </h3>
                        <p className="text-xs text-neutral-600 font-bold">{obra.location}</p>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-neutral-800 space-y-0.5">
                      <div>Tipo: <strong className="text-black font-black">{obra.type}</strong></div>
                      <div>Chefe: <strong className="text-black font-black">{obra.chiefInCharge}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GESTÃO DA EQUIPE E CHEFES DE OBRA */}
        {activeTab === 'EQUIPE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-black text-black uppercase">
                  Equipe e Usuários CBSM
                </h2>
                <p className="text-xs text-neutral-700 font-bold">
                  Cadastre novos chefes de obra ou engenheiros para o sistema
                </p>
              </div>
              <button
                type="button"
                onClick={() => { sounds.playTap(); setShowAddUserModal(true); }}
                className="px-3.5 py-2 bg-black text-white font-black rounded-xl text-xs uppercase flex items-center gap-1.5 border-2 border-black"
              >
                <UserPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo Usuário</span>
              </button>
            </div>

            {(!users || users.length === 0) ? (
              <div className="text-center py-12 bg-white rounded-3xl border-2 border-black p-6 shadow-sm">
                <Users className="w-12 h-12 text-black mx-auto mb-3 stroke-[2]" />
                <h3 className="text-base font-black text-black uppercase">
                  Nenhum Usuário Encontrado
                </h3>
                <p className="text-xs text-neutral-700 font-bold mt-1 max-w-sm mx-auto">
                  Clique em "+ Novo Usuário" para cadastrar um chefe de obra ou engenheiro.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map(u => {
                  const assignedObra = obras.find(o => o.id === u.assignedObraId);
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <div key={u.id} className="bg-white border-2 border-black rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                            {u.role === 'ENGENHEIRO' ? (
                              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <HardHat className="w-5 h-5 stroke-[2.5]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-black text-black truncate">
                              {u.name} {isCurrent && '(Você)'}
                            </h3>
                            <p className="text-[11px] text-neutral-600 font-bold truncate">{u.email}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                          u.role === 'ENGENHEIRO' ? 'bg-black text-white' : 'bg-neutral-200 text-black border border-black'
                        }`}>
                          {u.role === 'ENGENHEIRO' ? 'Engenharia' : 'Chefe de Obra'}
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-neutral-800 space-y-0.5 pt-2 border-t border-neutral-100">
                        {u.role === 'CHEFE_OBRA' && (
                          <div>Canteiro: <strong className="text-black">{assignedObra ? assignedObra.name : 'Todos / Livre'}</strong></div>
                        )}
                        {u.crea && <div>CREA: <strong className="text-black">{u.crea}</strong></div>}
                        {u.phone && <div>Tel: <strong className="text-black">{u.phone}</strong></div>}
                      </div>

                      {!isCurrent && onDeleteUser && (
                        <div className="pt-2 border-t border-neutral-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja remover o acesso de ${u.name}?`)) {
                                onDeleteUser(u.id);
                                onShowToast({ type: 'info', title: 'Usuário Removido', message: u.name });
                              }
                            }}
                            className="text-[11px] font-black text-red-600 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir Acesso
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ANALYSIS MODAL (Mobile-Safe Buttons) */}
      {analyzingReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-2xl bg-white border-2 border-black rounded-3xl shadow-2xl overflow-hidden text-black max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b-2 border-black flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-black text-black">{analyzingReq.id}</span>
                <h3 className="text-base font-black text-black mt-0.5">
                  Análise Técnica: {analyzingReq.obraName}
                </h3>
                <p className="text-xs text-neutral-700 font-bold">
                  {analyzingReq.sector} • Solicitante: {analyzingReq.requestedBy?.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAnalyzingReq(null)}
                className="p-1 rounded-xl bg-neutral-100 hover:bg-black hover:text-white border-2 border-black text-black"
              >
                <XCircle className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              
              {/* Field Observation */}
              {(analyzingReq.generalNotes || analyzingReq.audioNote) && (
                <div className="p-3 bg-neutral-100 border border-black rounded-xl">
                  <span className="font-black text-black block mb-0.5">Observação da Obra:</span>
                  <p className="text-neutral-900 font-bold italic">
                    "{analyzingReq.generalNotes || analyzingReq.audioNote}"
                  </p>
                </div>
              )}

              {/* Items Evaluation */}
              <div>
                <label className="font-black uppercase text-black block mb-1">
                  Itens Solicitados & Ajuste de Quantidades:
                </label>
                <div className="space-y-2">
                  {analyzingReq.items.map((item, idx) => {
                    const reviewItem = itemsReview.find(ir => ir.itemId === item.itemId) || {
                      quantityApproved: item.quantityRequested
                    };

                    return (
                      <div
                        key={idx}
                        className="p-2.5 bg-neutral-50 border border-black rounded-xl flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-black text-black block truncate">{item.name}</span>
                          <span className="text-[11px] text-neutral-700 font-bold">
                            Pedido: {item.quantityRequested} {item.unit}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-neutral-800">Aprovar:</span>
                          <input
                            type="number"
                            min="0"
                            value={reviewItem.quantityApproved}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              setItemsReview(prev => prev.map(ir => {
                                if (ir.itemId === item.itemId) {
                                  return {
                                    ...ir,
                                    quantityApproved: val,
                                    status: val === 0 ? 'REJEITADO' : val < item.quantityRequested ? 'AJUSTADO' : 'APROVADO'
                                  };
                                }
                                return ir;
                              }));
                            }}
                            className="w-16 h-9 bg-white border border-black rounded-lg text-center font-black text-black text-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-black uppercase text-black block mb-0.5">Almoxarifado:</label>
                  <select
                    value={warehouseSource}
                    onChange={(e) => setWarehouseSource(e.target.value)}
                    className="w-full bg-white border border-black rounded-lg p-2 text-xs font-bold text-black"
                  >
                    <option value="Almoxarifado Central Lauro de Freitas">Base Central - Lauro de Freitas</option>
                    <option value="Pátio Salvador - Tancredo Neves">Pátio Salvador - Tancredo Neves</option>
                    <option value="Fornecedor Direto (Usinada/Fábrica)">Entrega Direta Fornecedor</option>
                  </select>
                </div>

                <div>
                  <label className="font-black uppercase text-black block mb-0.5">Data de Envio:</label>
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full bg-white border border-black rounded-lg p-2 text-xs font-bold text-black"
                  />
                </div>
              </div>

              {/* Justification */}
              <div>
                <label className="font-black uppercase text-black block mb-0.5">Parecer do Engenheiro:</label>
                <textarea
                  rows={2}
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  placeholder="Instruções de envio ou motivo de ajuste/recusa..."
                  className="w-full bg-white border border-black rounded-xl p-2.5 text-xs font-bold text-black focus:outline-none"
                />
              </div>

            </div>

            {/* 3 Decision Paths (Stacked cleanly on mobile - NO text overflowing buttons!) */}
            <div className="p-3 bg-neutral-100 border-t-2 border-black flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleDecision('REPROVADO')}
                className="w-full py-2.5 bg-white hover:bg-neutral-200 border-2 border-black text-black font-black rounded-xl text-xs uppercase"
              >
                Desaprovar
              </button>

              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleDecision('APROVADO_PARCIAL')}
                className="w-full py-2.5 bg-neutral-200 hover:bg-neutral-300 border-2 border-black text-black font-black rounded-xl text-xs uppercase"
              >
                Aprovar c/ Ajustes
              </button>

              <button
                type="button"
                disabled={reviewing}
                onClick={() => handleDecision('APROVADO')}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-black rounded-xl text-xs uppercase border-2 border-black"
              >
                Aprovar Integral
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL ADICIONAR ITEM */}
      {showAddCatalogModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-3xl p-5 text-black">
            <h3 className="text-sm font-black uppercase text-black mb-3">Novo Recurso no Catálogo</h3>
            <form onSubmit={handleCreateCatalogItem} className="space-y-2.5 text-xs font-bold">
              <select
                value={newCatalogItem.category}
                onChange={(e) => setNewCatalogItem({ ...newCatalogItem, category: e.target.value })}
                className="w-full bg-white border border-black rounded-lg p-2 font-black"
              >
                <option value="MATERIAL">MATERIAL</option>
                <option value="MAQUINARIO">MAQUINÁRIO</option>
                <option value="HOMENS">HOMENS</option>
                <option value="FERRAMENTAS">FERRAMENTAS</option>
              </select>
              <input
                type="text"
                required
                placeholder="Nome do Item..."
                value={newCatalogItem.name}
                onChange={(e) => setNewCatalogItem({ ...newCatalogItem, name: e.target.value })}
                className="w-full bg-white border border-black rounded-lg p-2 font-bold"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Unidade (sacos, m³)..."
                  value={newCatalogItem.unit}
                  onChange={(e) => setNewCatalogItem({ ...newCatalogItem, unit: e.target.value })}
                  className="w-full bg-white border border-black rounded-lg p-2"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Estoque Inicial"
                  value={newCatalogItem.stock}
                  onChange={(e) => setNewCatalogItem({ ...newCatalogItem, stock: Number(e.target.value) })}
                  className="w-full bg-white border border-black rounded-lg p-2 font-black"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatalogModal(false)}
                  className="px-3 py-1.5 border border-black rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white font-black rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR OBRA */}
      {showAddObraModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-3xl p-5 text-black">
            <h3 className="text-sm font-black uppercase text-black mb-3">Novo Canteiro de Obras</h3>
            <form onSubmit={handleCreateObra} className="space-y-2.5 text-xs font-bold">
              <input
                type="text"
                required
                placeholder="Nome da Obra..."
                value={newObra.name}
                onChange={(e) => setNewObra({ ...newObra, name: e.target.value })}
                className="w-full bg-white border border-black rounded-lg p-2 font-black"
              />
              <input
                type="text"
                required
                placeholder="Código (ex: CBSM-06)..."
                value={newObra.code}
                onChange={(e) => setNewObra({ ...newObra, code: e.target.value })}
                className="w-full bg-white border border-black rounded-lg p-2 font-bold"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddObraModal(false)}
                  className="px-3 py-1.5 border border-black rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white font-black rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR USUÁRIO / CHEFE DE OBRA */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-3xl p-5 text-black">
            <h3 className="text-sm font-black uppercase text-black mb-3">Cadastrar Membro na Equipe</h3>
            <form onSubmit={handleCreateUserSubmit} className="space-y-2.5 text-xs font-bold">
              <div>
                <label className="block text-[11px] font-black uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mestre Carlos Souza..."
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-white border border-black rounded-lg p-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase mb-1">E-mail de Login</label>
                <input
                  type="email"
                  required
                  placeholder="carlos@cbsm.com.br"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-white border border-black rounded-lg p-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase mb-1">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full bg-white border border-black rounded-lg p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black uppercase mb-1">Função</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full bg-white border border-black rounded-lg p-2 font-black"
                  >
                    <option value="CHEFE_OBRA">Chefe de Obra</option>
                    <option value="ENGENHEIRO">Engenheiro Fiscal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase mb-1">Canteiro Designado</label>
                  <select
                    value={newUser.assignedObraId}
                    onChange={(e) => setNewUser({ ...newUser, assignedObraId: e.target.value })}
                    className="w-full bg-white border border-black rounded-lg p-2 font-bold"
                  >
                    <option value="">Livre / Todas</option>
                    {obras.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black uppercase mb-1">Telefone / Celular</label>
                  <input
                    type="tel"
                    placeholder="(71) 99999-9999"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full bg-white border border-black rounded-lg p-2 font-bold"
                  />
                </div>
                {newUser.role === 'ENGENHEIRO' && (
                  <div>
                    <label className="block text-[11px] font-black uppercase mb-1">Registro CREA</label>
                    <input
                      type="text"
                      placeholder="CREA-BA 00000/D"
                      value={newUser.crea}
                      onChange={(e) => setNewUser({ ...newUser, crea: e.target.value })}
                      className="w-full bg-white border border-black rounded-lg p-2 font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 border border-black rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white font-black rounded-lg shadow-sm"
                >
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT VOUCHER MODAL */}
      {printingReq && (
        <DispatchPrintModal
          requisition={printingReq}
          onClose={() => setPrintingReq(null)}
        />
      )}

    </div>
  );
}
