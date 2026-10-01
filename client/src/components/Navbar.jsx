import React, { useState } from 'react';
import { 
  HardHat, 
  ShieldCheck, 
  LogOut, 
  RotateCcw, 
  MapPin, 
  ChevronDown, 
  Volume2, 
  VolumeX,
  Menu,
  X
} from 'lucide-react';
import { sounds } from '../utils/sound';

export default function Navbar({ 
  currentUser, 
  currentObra, 
  obras, 
  onSelectObra, 
  onSwitchUser, 
  onLogout, 
  onResetDb,
  soundEnabled,
  onToggleSound,
  systemInfo
}) {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const isEngineer = currentUser?.role === 'ENGENHEIRO';
  const isClean = Boolean(systemInfo?.isClean);

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow-md">
      {/* 
        TOP BAR: Completely Black (#000000), Clean & Uncluttered Logo Presentation
      */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Clean Logo Section - No noisy boxes or borders */}
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src="/logo.png" 
              alt="CBSM Construtora BSM" 
              className="h-7 sm:h-9 w-auto object-contain shrink-0"
            />
            <div className="hidden sm:block border-l border-neutral-700 pl-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300 block leading-tight">
                Sistema de Requerimento
              </span>
            </div>
          </div>

          {/* Right Action Area - Clean and Minimal */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Quick Profile Badge / Switcher */}
            <button
              type="button"
              onClick={() => setShowSwitchMenu(!showSwitchMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-xs font-black transition-all active:scale-95"
              title="Clique para alternar perfil de teste"
            >
              {isEngineer ? (
                <ShieldCheck className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
              ) : (
                <HardHat className="w-4 h-4 text-white shrink-0 stroke-[2.5]" />
              )}
              <span className="max-w-[110px] truncate text-white">
                {currentUser?.name?.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 stroke-[3]" />
            </button>

            {/* Menu Drawer Toggle on Mobile */}
            <button
              type="button"
              onClick={() => setShowMobileDrawer(!showMobileDrawer)}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 active:scale-95 transition-all"
              aria-label="Menu de opções"
            >
              {showMobileDrawer ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </button>

          </div>

        </div>
      </div>

      {/* Canteiro Selector Sub-Bar: Clean Black Band below header */}
      <div className="bg-neutral-950 border-t border-neutral-850 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0 stroke-[2.5]" />
            {isEngineer ? (
              <div className="relative flex-1 max-w-sm">
                <select
                  value={currentObra?.id || ''}
                  onChange={(e) => {
                    const found = obras.find(o => o.id === e.target.value);
                    if (found) {
                      onSelectObra(found);
                      sounds.playTap();
                    }
                  }}
                  className="w-full bg-black text-white border border-neutral-700 text-xs font-black rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-white appearance-none truncate cursor-pointer"
                >
                  <option value="">Todas as Obras (Visão Geral)</option>
                  {obras.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[3]" />
              </div>
            ) : (
              <span className="font-bold text-neutral-200 truncate">
                Canteiro: <strong className="text-white">{currentObra?.name}</strong>
              </span>
            )}
          </div>

          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 shrink-0">
            {isEngineer ? 'Engenharia' : 'Canteiro'}
          </span>

        </div>
      </div>

      {/* Switch User / Profile Dropdown */}
      {showSwitchMenu && (
        <div 
          className="absolute right-4 top-14 w-72 bg-white text-black border-2 border-black rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
          onClick={() => setShowSwitchMenu(false)}
        >
          {isClean ? (
            <div>
              <div className="px-2.5 py-1.5 text-[11px] font-black uppercase text-black border-b-2 border-black tracking-wider">
                Perfil de Acesso
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl mt-2 border border-neutral-300">
                <div className="text-xs font-black text-black">{currentUser?.name}</div>
                <div className="text-[11px] font-bold text-neutral-600 truncate">{currentUser?.email}</div>
                <div className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black text-white inline-block mt-1.5">
                  {isEngineer ? 'Engenheiro Mestre' : 'Chefe de Obra'}
                </div>
                {currentUser?.crea && (
                  <div className="text-[11px] text-neutral-700 font-bold mt-1">
                    CREA: {currentUser.crea}
                  </div>
                )}
              </div>
              <div className="border-t-2 border-black mt-3 pt-2 flex items-center justify-end px-1">
                <button
                  onClick={onLogout}
                  className="text-xs font-black text-black hover:underline flex items-center gap-1.5 py-1"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[2.5]" /> Encerrar Sessão
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="px-2.5 py-1.5 text-[11px] font-black uppercase text-black border-b-2 border-black tracking-wider">
                Alternar Perfil de Demonstração
              </div>

              <button
                onClick={() => onSwitchUser('usr-eng-1')}
                className={`w-full text-left p-2.5 rounded-xl mt-1.5 flex items-start gap-2.5 transition-colors border-2 ${
                  currentUser?.id === 'usr-eng-1' 
                    ? 'bg-black text-white border-black' 
                    : 'border-transparent hover:bg-neutral-100 text-black'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 stroke-[2.5]" />
                <div>
                  <div className="text-xs font-black">Eng. Roberto Almeida</div>
                  <div className={`text-[11px] font-bold ${currentUser?.id === 'usr-eng-1' ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Engenheiro Mestre (Aprova/Recusa)
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSwitchUser('usr-chefe-1')}
                className={`w-full text-left p-2.5 rounded-xl mt-1 flex items-start gap-2.5 transition-colors border-2 ${
                  currentUser?.id === 'usr-chefe-1' 
                    ? 'bg-black text-white border-black' 
                    : 'border-transparent hover:bg-neutral-100 text-black'
                }`}
              >
                <HardHat className="w-5 h-5 mt-0.5 shrink-0 stroke-[2.5]" />
                <div>
                  <div className="text-xs font-black">Mestre Raimundo Nonato</div>
                  <div className={`text-[11px] font-bold ${currentUser?.id === 'usr-chefe-1' ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Chefe • Orla Amaralina
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSwitchUser('usr-chefe-2')}
                className={`w-full text-left p-2.5 rounded-xl mt-1 flex items-start gap-2.5 transition-colors border-2 ${
                  currentUser?.id === 'usr-chefe-2' 
                    ? 'bg-black text-white border-black' 
                    : 'border-transparent hover:bg-neutral-100 text-black'
                }`}
              >
                <HardHat className="w-5 h-5 mt-0.5 shrink-0 stroke-[2.5]" />
                <div>
                  <div className="text-xs font-black">Mestre Valdir Santos</div>
                  <div className={`text-[11px] font-bold ${currentUser?.id === 'usr-chefe-2' ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    Chefe • Canal do Trobogy
                  </div>
                </div>
              </button>

              <div className="border-t-2 border-black mt-2 pt-2 flex items-center justify-between px-2">
                <button
                  onClick={onResetDb}
                  className="text-xs font-black text-black hover:underline flex items-center gap-1 py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" /> Resetar Dados
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs font-black text-black hover:underline flex items-center gap-1 py-1"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[2.5]" /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer (Settings, Sound, Logout) */}
      {showMobileDrawer && (
        <div className="bg-neutral-900 border-t border-neutral-800 p-4 space-y-3 animate-in slide-in-from-top-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-300">Feedback Sonoro do Celular:</span>
            <button
              type="button"
              onClick={onToggleSound}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-bold flex items-center gap-1.5"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
              <span>{soundEnabled ? 'Ativado' : 'Silencioso'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            {!isClean && (
              <button
                onClick={onResetDb}
                className="text-neutral-300 font-bold hover:text-white flex items-center gap-1.5 py-1"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Banco de Dados
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-red-400 font-bold hover:text-red-300 flex items-center gap-1.5 py-1 ml-auto"
            >
              <LogOut className="w-4 h-4" /> Sair da Conta
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
