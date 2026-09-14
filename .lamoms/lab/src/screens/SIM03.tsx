import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const SIM03: React.FC = () => {
  const { navigate, goBack, canGoBack } = useNavigation();

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
          <span>SIMULATION · DÉTAIL</span>
        </div>
        <span>SORTIES & LOISIRS</span>
      </div>

      <div className="text-xs uppercase text-[#737373] font-semibold tracking-wider mb-2">
        DÉTAIL D'UN ARBITRAGE
      </div>

      <h1 className="font-serif text-[22px] font-bold text-[#111111] leading-snug mb-5">
        Que représente concrètement cet arbitrage ?
      </h1>

      <div className="font-serif text-[52px] font-bold text-black leading-none mb-1 tabular-nums">
        80,00 € <span className="text-xl font-normal text-[#5e5e5e]">/ mois</span>
      </div>

      <p className="text-sm text-[#5e5e5e] mb-6 leading-relaxed">
        Budget résiduel pour "Sorties & loisirs" après réduction de 100,00 €
      </p>

      {/* Before / After bar */}
      <div className="flex flex-col mb-8 p-4 bg-[#f3f3f4] rounded-lg">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#737373]">Consommation actuelle</span>
          <span className="font-semibold text-black tabular-nums">180,00 € / mois</span>
        </div>
        <div className="h-2 w-full bg-[#e2e2e2] rounded-full overflow-hidden mb-3">
          <div className="h-full bg-black/30 w-full" />
        </div>

        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#737373]">Nouveau seuil après arbitrage</span>
          <span className="font-semibold text-black tabular-nums">80,00 € / mois</span>
        </div>
        <div className="h-2 w-full bg-[#e2e2e2] rounded-full overflow-hidden">
          <div className="h-full bg-black w-[44%]" />
        </div>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Rythme actuel moyen</span>
            <span className="text-xs text-[#737373] mt-0.5">Constaté sur 12 mois</span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">~ 4 sorties / mois</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Rythme projeté cible</span>
            <span className="text-xs text-[#737373] mt-0.5">Avec panier moyen de 40 €</span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">~ 2 sorties / mois</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Gain réalloué à l'objectif</span>
            <span className="text-xs text-[#737373] mt-0.5">Reporté sur l'épargne mensuelle</span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">+ 100,00 € / mois</span>
        </div>
      </div>

      <div className="p-3 bg-[#f3f3f4] border border-[#e5e5e5] rounded text-xs text-[#5e5e5e] mb-8 leading-relaxed">
        Cet arbitrage est purement indicatif et ne modifie aucun plafond bancaire réel.
      </div>

      <div className="pt-2 flex flex-col">
        <button
          type="button"
          onClick={goBack}
          className="w-full flex justify-between items-center py-3.5 border-t border-b border-[#e5e5e5] text-[#111111] font-semibold text-[15px] hover:opacity-75 transition-opacity text-left cursor-pointer"
        >
          <span>Revenir à l’arbitrage global</span>
          <span className="text-lg">›</span>
        </button>
        <button
          type="button"
          onClick={goBack}
          className="w-full flex justify-between items-center py-3 text-[#5e5e5e] hover:text-[#111111] font-medium text-[15px] transition-colors text-left cursor-pointer"
        >
          <span>Retour</span>
          <span className="text-lg">‹</span>
        </button>
      </div>
    </section>
  );
};
