import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const OBJ04: React.FC = () => {
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
          <span>OBJECTIF · 4/5</span>
        </div>
        <span>CALCUL D'EFFORT</span>
      </div>

      <h1 className="font-serif text-[22px] font-bold text-[#111111] leading-snug mb-5">
        Qu’est-ce que cette échéance me demande chaque mois ?
      </h1>

      <div className="flex flex-col p-4 bg-[#f3f3f4] rounded-lg mb-6">
        <span className="text-xs uppercase text-[#737373] font-semibold tracking-wider mb-1">
          EFFORT MENSUEL REQUIS
        </span>
        <div className="font-serif text-[52px] font-bold text-black leading-none mb-1 tabular-nums">
          250,00 € <span className="text-xl font-normal text-[#5e5e5e]">/ mois</span>
        </div>
        <p className="text-sm text-[#5e5e5e] mb-4">
          Effort requis pour solder 9 000,00 € en 36 mois
        </p>

        {/* Mobilisation bar */}
        <div className="pt-2 border-t border-[#e5e5e5]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#737373] uppercase tracking-wider font-medium">
              Mobilisation du flux habituel
            </span>
            <span className="font-semibold text-black">125 %</span>
          </div>
          <div className="h-1.5 w-full bg-[#e2e2e2] rounded-full overflow-hidden flex">
            <div className="h-full bg-black w-4/5" />
            <div className="h-full bg-black/40 w-1/5" />
          </div>
          <div className="flex justify-between text-[11px] text-[#737373] mt-1 tabular-nums">
            <span>Capacité de base (200,00 €)</span>
            <span>Cible (250,00 €)</span>
          </div>
        </div>
      </div>

      <div className="text-xs uppercase text-[#737373] font-semibold tracking-wider mb-2">
        STRUCTURE ET PROJECTIONS
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Capital net restant</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              FAIT DU PROJET
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">9 000,00 €</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Capacité d'épargne actuelle</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              FAIT OBSERVÉ
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">200,00 € / mois</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Effort mensuel exigé</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              PROJECTION (36 MOIS)
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">250,00 € / mois</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Écart de rythme constaté</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              OBSERVATION COMPTABLE
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">+ 50,00 € / mois</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Part de capacité mobilisée</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              RAPPORT FACTUEL
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">125 %</span>
        </div>
      </div>

      <div className="p-3 bg-[#f3f3f4] border border-[#e5e5e5] rounded text-xs text-[#5e5e5e] mb-8 leading-relaxed">
        L'écart de 50,00 € par mois nécessite soit un allongement de la durée, soit un arbitrage sur d'autres dépenses.
      </div>

      <div className="pt-2 flex flex-col">
        <button
          type="button"
          onClick={() => navigate('OBJ-05')}
          className="w-full flex justify-between items-center py-3.5 border-t border-b border-[#e5e5e5] text-[#111111] font-semibold text-[15px] hover:opacity-75 transition-opacity text-left cursor-pointer"
        >
          <span>Conserver cet effort</span>
          <span className="text-lg">›</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('OBJ-03')}
          className="w-full flex justify-between items-center py-3.5 border-b border-[#e5e5e5] text-[#5e5e5e] hover:text-[#111111] font-medium text-[15px] transition-colors text-left cursor-pointer"
        >
          <span>Tester un allongement de l'échéance</span>
          <span className="text-lg">›</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('OBJ-02')}
          className="w-full flex justify-between items-center py-3 text-[#5e5e5e] hover:text-[#111111] font-medium text-[15px] transition-colors text-left cursor-pointer"
        >
          <span>Revoir la somme initiale</span>
          <span className="text-lg">›</span>
        </button>
      </div>
    </section>
  );
};
