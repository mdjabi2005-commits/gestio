import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const OBJ05: React.FC = () => {
  const { navigate, resetTo, goBack, canGoBack } = useNavigation();

  return (
    <section className="flex flex-col w-full text-[#111111]">
      <div className="flex justify-between items-baseline mb-6 text-xs text-[#737373] uppercase tracking-wider font-semibold">
        <div className="flex items-center gap-1">
          {canGoBack && (
            <button
              type="button"
              onClick={goBack}
              className="hover:text-black transition-colors font-semibold flex items-center gap-0.5 cursor-pointer mr-2"
              aria-label="Retour"
            >
              <span>‹</span>
              <span>RETOUR</span>
            </button>
          )}
          <span>OBJECTIF · 5/5</span>
        </div>
        <span>HORIZON NATUREL</span>
      </div>

      <h1 className="font-serif text-[22px] font-bold text-[#111111] leading-snug mb-5">
        Avec ma situation actuelle, quand pourrais-je atteindre cet objectif ?
      </h1>

      <div className="font-serif text-[52px] font-bold text-black leading-none mb-1 tabular-nums">
        45 mois
      </div>

      <p className="text-sm text-[#5e5e5e] mb-6 leading-relaxed">
        Soit une atteinte estimée en juin 2029 sans modifier vos dépenses (capacité réelle de 200,00 € / mois)
      </p>

      {/* Timeline track */}
      <div className="flex flex-col mb-8">
        <div className="flex justify-between items-baseline text-xs text-[#737373] mb-1.5 tabular-nums">
          <span>Aujourd'hui</span>
          <span>Juin 2029 (45 m.)</span>
        </div>
        <div className="w-full h-1 bg-[#f0f0f0] overflow-hidden">
          <div className="h-full bg-black w-[15%]" />
        </div>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Reste net à financer</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              FAIT DU PROJET
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">9 000,00 €</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Capacité d'épargne soutenable</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              FAIT CONSTATÉ
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">200,00 € / mois</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Fonds d'urgence préservé</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              FAIT SANCTUARISÉ
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">2 500,00 €</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Cadence d'amortissement</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              PROJECTION ARITHMÉTIQUE
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">45 mensualités</span>
        </div>
      </div>

      <div className="p-3 bg-[#f3f3f4] border border-[#e5e5e5] rounded text-xs text-[#5e5e5e] mb-8 leading-relaxed">
        Capacité d'épargne fiable basée sur 12 mois d'historique (variabilité ± 45,00 €).
      </div>

      <div className="pt-2 flex flex-col">
        <button
          type="button"
          onClick={() => resetTo('UC-01')}
          className="w-full flex justify-between items-center py-3.5 border-t border-b border-[#e5e5e5] text-[#111111] font-semibold text-[15px] hover:opacity-75 transition-opacity text-left cursor-pointer"
        >
          <span>Valider l’objectif</span>
          <span className="text-lg">›</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('SIM-01')}
          className="w-full flex justify-between items-center py-3.5 border-b border-[#e5e5e5] text-[#111111] font-semibold text-[15px] hover:opacity-75 transition-opacity text-left cursor-pointer"
        >
          <span>Simuler cet objectif</span>
          <span className="text-lg">›</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('OBJ-03')}
          className="w-full flex justify-between items-center py-3 text-[#5e5e5e] hover:text-[#111111] font-medium text-[15px] transition-colors text-left cursor-pointer"
        >
          <span>Modifier l’échéance</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </section>
  );
};
