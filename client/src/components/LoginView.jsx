import React, { useState } from 'react';
import { HardHat, ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Sparkles, User, Phone, Award } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function LoginView({ onLogin, onRegisterMaster, error, systemInfo, users = [] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initial Master Setup Form State
  const [masterName, setMasterName] = useState('');
  const [masterEmail, setMasterEmail] = useState('');
  const [masterPass, setMasterPass] = useState('');
  const [masterCrea, setMasterCrea] = useState('');
  const [masterPhone, setMasterPhone] = useState('');

  const isClean = Boolean(systemInfo?.isClean);
  const hasUsers = users && users.length > 0;

  const handleQuickLogin = (demoEmail, demoPass) => {
    sounds.playTap();
    onLogin(demoEmail, demoPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    sounds.playTap();
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterSubmit = async (e) => {
    e.preventDefault();
    if (!masterName || !masterEmail || !masterPass) return;
    setLoading(true);
    sounds.playTap();
    try {
      if (onRegisterMaster) {
        await onRegisterMaster({
          name: masterName,
          email: masterEmail,
          password: masterPass,
          crea: masterCrea || 'CREA-BA Registrado',
          phone: masterPhone
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-black flex flex-col justify-start sm:justify-center">
      
      {/* 
        CLEAN LOGO HEADER SECTION: Solid Black, Clean, High Sunlight Contrast
      */}
      <div className="bg-black text-white py-8 px-4 border-b-2 border-black flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="CBSM Construtora BSM" 
            className="h-10 sm:h-12 w-auto object-contain mb-3"
          />
          <h1 className="text-sm sm:text-base font-black uppercase tracking-widest text-neutral-300">
            Requerimentos de Canteiro
          </h1>
          {isClean && (
            <span className="mt-2 inline-block px-2.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] font-black uppercase tracking-widest text-white">
              Versão Limpa • Sem Mocks
            </span>
          )}
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-4 py-6">
        
        {error && (
          <div className="mb-4 p-3.5 bg-white border-2 border-black rounded-2xl flex items-center gap-3 text-black text-xs font-bold shadow-sm">
            <AlertCircle className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* 
          CASE 1: CLEAN MODE & NO USERS -> FIRST-TIME SETUP WIZARD (CREATE MASTER ENGINEER) 
        */}
        {isClean && !hasUsers ? (
          <div className="bg-white border-2 border-black rounded-3xl p-5 sm:p-6 shadow-[0_4px_0px_#000000]">
            <div className="flex items-center gap-3 border-b-2 border-black pb-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase text-black">
                  Configuração Inicial
                </h2>
                <p className="text-[11px] text-neutral-700 font-bold">
                  Cadastrar Conta do Engenheiro Mestre
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-700 font-bold mb-4">
              O banco de dados está limpo. Crie a primeira conta de <strong>Engenheiro Coordenador</strong> para gerir obras, catálogo e equipe.
            </p>

            <form onSubmit={handleMasterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Nome do Engenheiro Responsável
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={masterName}
                    onChange={(e) => setMasterName(e.target.value)}
                    placeholder="Ex: Roberto Almeida"
                    required
                    className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-9 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <User className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={masterEmail}
                    onChange={(e) => setMasterEmail(e.target.value)}
                    placeholder="engenheiro@cbsm.com.br"
                    required
                    className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-9 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <Mail className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={masterPass}
                    onChange={(e) => setMasterPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-9 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <Lock className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Registro CREA
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={masterCrea}
                      onChange={(e) => setMasterCrea(e.target.value)}
                      placeholder="CREA-BA 12345/D"
                      className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-8 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <Award className="w-3.5 h-3.5 text-black absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Telefone / Celular
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={masterPhone}
                      onChange={(e) => setMasterPhone(e.target.value)}
                      placeholder="(71) 99999-9999"
                      className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-8 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <Phone className="w-3.5 h-3.5 text-black absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-black text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-[0_3px_0px_#000000]"
              >
                {loading ? "Criando Conta..." : "Criar Conta Mestre e Acessar"}
              </button>
            </form>
          </div>
        ) : isClean && hasUsers ? (
          /* 
            CASE 2: CLEAN MODE & USERS EXIST -> CLEAN STANDARD LOGIN (NO DEMO CARDS) 
          */
          <div className="bg-white border-2 border-black rounded-3xl p-5 sm:p-6 shadow-[0_4px_0px_#000000]">
            <div className="border-b-2 border-black pb-3 mb-4">
              <h2 className="text-sm font-black uppercase text-black">
                Identificação do Usuário
              </h2>
              <p className="text-[11px] text-neutral-700 font-bold">
                Acesso com e-mail corporativo e senha
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.nome@cbsm.com.br"
                    required
                    className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-9 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <Mail className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-9 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <Lock className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-[0_2px_0px_#000000]"
              >
                {loading ? "Entrando..." : "Acessar Sistema"}
              </button>
            </form>
          </div>
        ) : (
          /* 
            CASE 3: DEMO MODE (PORT 4000) -> 1-TOUCH DEMO ACCESS CARDS 
          */
          <div className="bg-white border-2 border-black rounded-3xl p-4 sm:p-6 shadow-[0_4px_0px_#000000]">
            
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-black" /> Acesso Rápido de Demonstração:
              </span>
              <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded">
                1 TOQUE
              </span>
            </div>

            <div className="space-y-3">
              
              {/* Card 1: Chefe de Obra Raimundo */}
              <button
                type="button"
                onClick={() => handleQuickLogin('raimundo@cbsm.com.br', '123')}
                className="w-full bg-white hover:bg-neutral-100 border-2 border-black p-3.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                    <HardHat className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="text-sm font-black text-black leading-tight truncate">
                      Mestre Raimundo Nonato
                    </div>
                    <div className="text-xs text-neutral-800 font-extrabold truncate">
                      Chefe de Obra • Orla Amaralina
                    </div>
                    <div className="text-[11px] text-neutral-600 font-bold truncate">
                      Abrir pedidos de materiais e máquinas
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-black stroke-[3] shrink-0" />
              </button>

              {/* Card 2: Engenheiro Mestre */}
              <button
                type="button"
                onClick={() => handleQuickLogin('engenheiro@cbsm.com.br', '123')}
                className="w-full bg-black text-white hover:bg-neutral-900 border-2 border-black p-3.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center shrink-0 border border-white">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="text-sm font-black text-white leading-tight truncate">
                      Eng. Roberto Almeida
                    </div>
                    <div className="text-xs text-neutral-300 font-extrabold truncate">
                      Engenheiro Fiscal • Login Mestre
                    </div>
                    <div className="text-[11px] text-neutral-400 font-bold truncate">
                      Analisar, aprovar pedidos e gerir banco
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white stroke-[3] shrink-0" />
              </button>

              {/* Card 3: Chefe de Obra Valdir */}
              <button
                type="button"
                onClick={() => handleQuickLogin('valdir@cbsm.com.br', '123')}
                className="w-full bg-white hover:bg-neutral-100 border-2 border-black p-3 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-neutral-200 text-black flex items-center justify-center shrink-0 border border-black">
                    <HardHat className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1 pr-1">
                    <div className="text-xs font-black text-black leading-tight truncate">
                      Mestre Valdir Santos
                    </div>
                    <div className="text-[11px] text-neutral-800 font-bold truncate">
                      Chefe • Canal do Trobogy
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-black stroke-[3] shrink-0" />
              </button>

            </div>

            {/* Manual Form Toggle */}
            <div className="mt-4 pt-3 border-t-2 border-black/15 text-center">
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="text-xs font-black text-black hover:underline uppercase"
              >
                {showForm ? "Ocultar login por e-mail" : "Entrar com outro e-mail"}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mt-3 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.nome@cbsm.com.br"
                      required
                      className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-9 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <Mail className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-black mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white border-2 border-black rounded-xl py-2.5 px-3 pl-9 text-black font-bold text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <Lock className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-[0_2px_0px_#000000]"
                >
                  {loading ? "Entrando..." : "Acessar Sistema"}
                </button>
              </form>
            )}

          </div>
        )}

        <p className="mt-4 text-center text-[11px] text-neutral-600 font-bold uppercase tracking-wide">
          CBSM Construtora • Salvador - Bahia
        </p>

      </div>
    </div>
  );
}
