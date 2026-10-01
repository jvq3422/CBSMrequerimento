import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

export default function AudioNoteInput({ value, onChange, placeholder = "Falar ou digitar observação para o Engenheiro..." }) {
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const quickChips = [
    "Falta de material no canteiro",
    "Concretagem agendada",
    "Equipamento quebrou na obra",
    "Avanço de frente de serviço",
    "Urgente p/ amanhã cedo"
  ];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSpeechSupport(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'pt-BR';

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const currentText = value ? `${value}. ${transcript}` : transcript;
        onChange(currentText);
        sounds.playTap();
      };

      recog.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [value, onChange]);

  const toggleListening = () => {
    sounds.playTap();
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addChip = (text) => {
    sounds.playTap();
    if (value && value.includes(text)) return;
    const updated = value ? `${value}. ${text}` : text;
    onChange(updated);
  };

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border-[2.5px] border-black rounded-2xl p-3.5 pr-14 text-black placeholder:text-neutral-500 text-sm font-semibold leading-relaxed focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none shadow-sm"
        />

        {/* Voice Dictation Button - High Contrast Black / Inverted */}
        {hasSpeechSupport && (
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Gravando áudio... toque para parar" : "Toque para falar por voz"}
            className={`absolute right-2.5 top-2.5 w-11 h-11 rounded-xl flex items-center justify-center transition-all border-2 border-black ${
              isListening
                ? 'bg-black text-white animate-pulse shadow-lg ring-2 ring-black'
                : 'bg-neutral-100 text-black hover:bg-black hover:text-white active:scale-95'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5 stroke-[2.5]" /> : <Mic className="w-5 h-5 stroke-[2.5]" />}
          </button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 border-2 border-black rounded-xl text-xs font-bold text-black animate-in fade-in">
          <span className="w-3 h-3 rounded-full bg-black animate-ping" />
          <span>Ouvindo... Fale a observação para o canteiro.</span>
        </div>
      )}

      {/* Quick Chips for Field Workers (Stark Black and White) */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="text-xs text-black font-black uppercase py-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-black" /> Toque Rápido:
        </span>
        {quickChips.map((chip, idx) => {
          const isSelected = value && value.includes(chip);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => addChip(chip)}
              className={`text-xs px-3 py-2 rounded-xl border-2 font-bold transition-all flex items-center gap-1 active:scale-95 ${
                isSelected
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black hover:bg-neutral-100'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              {chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
