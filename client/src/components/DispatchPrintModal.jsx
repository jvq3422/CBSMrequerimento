import React from 'react';
import { Printer, X, CheckCircle2, Building2, MapPin, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

export default function DispatchPrintModal({ requisition, onClose }) {
  if (!requisition) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Action Header (Hidden in Print) */}
        <div className="no-print bg-[#1a1c20] px-5 py-4 border-b border-slate-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-slate-100">
              Guia de Despacho & Romaneio Oficial
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-10 bg-white" id="printable-area">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-40 sm:w-48 bg-slate-900 p-2.5 rounded-xl flex items-center justify-center">
                <img src="/logo.png" alt="CBSM Construtora" className="max-h-12 object-contain filter invert" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Construtora BSM
                </h1>
                <p className="text-xs text-slate-600 font-semibold">
                  CBSM Engenharia e Construção • CNPJ 07.218.441/0001-90
                </p>
                <p className="text-xs text-slate-500">
                  Salvador - Bahia • www.construtorabsm.com.br
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-100 border border-slate-300 rounded-xl px-4 py-2 text-right">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Protocolo do Requerimento
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                  {requisition.id}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500 font-medium">
                Emissão: {formatDateTime(new Date().toISOString())}
              </div>
            </div>
          </div>

          {/* Title Badge */}
          <div className="bg-amber-100 border-l-4 border-amber-600 p-3 rounded-r-xl mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">
                Documento de Autorização de Saída & Transporte de Canteiro
              </span>
              <span className="text-sm font-bold text-slate-900">
                Status: {requisition.status === 'APROVADO' ? 'APROVADO INTEGRAL' : requisition.status === 'APROVADO_PARCIAL' ? 'APROVAÇÃO PARCIAL AUTORIZADA' : requisition.status}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-600 uppercase">Prioridade:</span>
              <span className={`ml-2 text-xs font-black px-2 py-0.5 rounded-full ${
                requisition.priority === 'CRITICO' ? 'bg-red-600 text-white' :
                requisition.priority === 'URGENTE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-800'
              }`}>
                {requisition.priority}
              </span>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Dados do Canteiro de Destino
              </div>
              <div>
                <span className="font-bold text-slate-700">Obra:</span>{' '}
                <span className="font-black text-slate-900">{requisition.obraName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Frente / Setor:</span>{' '}
                <span className="font-semibold text-slate-900">{requisition.sector}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Solicitante:</span>{' '}
                <span className="font-medium text-slate-900">{requisition.requestedBy?.name} ({requisition.requestedBy?.phone})</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Data Limite Desejada:</span>{' '}
                <span className="font-medium text-slate-900">{formatDate(requisition.neededByDate)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Dados de Aprovação & Logística
              </div>
              <div>
                <span className="font-bold text-slate-700">Engenheiro Fiscal:</span>{' '}
                <span className="font-black text-slate-900">{requisition.review?.reviewedBy?.name || 'Engenharia CBSM'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Registro Profissional:</span>{' '}
                <span className="font-mono text-slate-900">{requisition.review?.reviewedBy?.crea || 'CREA-BA'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Almoxarifado Expedidor:</span>{' '}
                <span className="font-semibold text-slate-900">{requisition.review?.warehouseSource || 'Almoxarifado Central CBSM'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Data Programada:</span>{' '}
                <span className="font-medium text-slate-900">{formatDate(requisition.review?.dispatchDate || requisition.neededByDate)}</span>
              </div>
            </div>
          </div>

          {/* Observations if any */}
          {(requisition.generalNotes || requisition.review?.engineerNotes) && (
            <div className="mb-6 space-y-2 text-xs">
              {requisition.generalNotes && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <span className="font-bold text-amber-900">Observação do Canteiro:</span>{' '}
                  <span className="text-slate-800">{requisition.generalNotes}</span>
                </div>
              )}
              {requisition.review?.engineerNotes && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-900">Parecer do Engenheiro:</span>{' '}
                  <span className="text-slate-800">{requisition.review.engineerNotes}</span>
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-300">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Item / Código</th>
                  <th className="py-3 px-3">Categoria</th>
                  <th className="py-3 px-2 text-center">Unidade</th>
                  <th className="py-3 px-2 text-right">Qtd Pedida</th>
                  <th className="py-3 px-3 text-right bg-amber-600 text-white font-black">Qtd Autorizada</th>
                  <th className="py-3 px-3">Instruções / Local de Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requisition.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-500 font-normal">{item.code}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600">
                      {item.category === 'MATERIAL' ? 'Material' :
                       item.category === 'MAQUINARIO' ? 'Maquinário' :
                       item.category === 'HOMENS' ? 'Mão de Obra' : 'Ferramentas'}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-slate-700">
                      {item.unit}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-slate-500">
                      {item.quantityRequested}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-base text-slate-900 bg-amber-50">
                      {item.quantityApproved}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-xs">
                      {item.itemNotes || 'Conforme especificação padrão CBSM'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Physical Signatures Section */}
          <div className="pt-6 border-t-2 border-slate-900">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-6 text-center">
              Comprovações de Despacho, Transporte e Recebimento Físico
            </h4>
            
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="border-b-2 border-slate-800 h-14 mb-2"></div>
                <p className="font-bold text-slate-900">Expedição / Almoxarifado Central</p>
                <p className="text-[11px] text-slate-500">Conferido e liberado</p>
              </div>

              <div>
                <div className="border-b-2 border-slate-800 h-14 mb-2"></div>
                <p className="font-bold text-slate-900">Transportador / Motorista</p>
                <p className="text-[11px] text-slate-500">Nome: _________________ Placa: _____</p>
              </div>

              <div>
                <div className="border-b-2 border-slate-800 h-14 mb-2"></div>
                <p className="font-bold text-slate-900">Recebedor no Canteiro de Obras</p>
                <p className="text-[11px] text-slate-500">{requisition.requestedBy?.name}</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400">
              Este romaneio comprova a transferência e movimentação patrimonial e de insumos entre centros de custo da Construtora BSM.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
