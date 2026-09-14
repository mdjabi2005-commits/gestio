import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const SIM02: React.FC = () => {
  const { navigate, resetTo, goBack, canGoBack, history } = useNavigation();

  const isLinkedToObjective = history.includes('OBJ-05');

  const returnToOrigin = () => {
    if (isLinkedToObjective) {
      resetTo('OBJ-05');
    } else {
      goBack();
    }
  };

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
          <span>SIMULATION · ARBITRAGE</span>
        </div>
        <span>COMPOSITION</span>
      </div>

      <div className="text-xs uppercase text-[#737373] font-semibold tracking-wider mb-2">
        ARBITRAGE DE POCKETS
      </div>

      <h1 className="font-serif text-[22px] font-bold text-[#111111] leading-snug mb-5">
        Sur quelles dépenses devrais-je arbitrer ?
      </h1>

      <div className="font-serif text-[52px] font-bold text-black leading-none mb-1 tabular-nums">
        − 150,00 € <span className="text-xl font-normal text-[#5e5e5e]">/ mois</span>
      </div>

      <p className="text-sm text-[#5e5e5e] mb-6 leading-relaxed">
        Effort d'arbitrage mensuel nécessaire pour passer à 350,00 € d'épargne
      </p>

      <div className="flex justify-between text-xs text-[#737373] uppercase tracking-wider font-semibold border-b border-[#e5e5e5] pb-2 mb-2">
        <span>POCKETS IDENTIFIÉES COMME ARBITRABLES</span>
        <span>PROPOSITION</span>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div
          onClick={() => navigate('SIM-03')}
          className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5] cursor-pointer hover:bg-black/5 transition-colors px-1 -mx-1"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#111111]">Sorties & loisirs</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-[#eeeeee] text-[#555555] rounded">
                PLAISIR
              </span>
            </div>
            <span className="text-xs text-[#737373] mt-0.5">Budget actuel : 180,00 € / mois</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-[#111111] tabular-nums block">− 100,00 €</span>
            <span className="text-[11px] text-[#737373]">Reste 80,00 €</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#111111]">Abonnements numériques</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-[#eeeeee] text-[#555555] rounded">
                PLAISIR
              </span>
            </div>
            <span className="text-xs text-[#737373] mt-0.5">Budget actuel : 35,00 € / mois</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-[#111111] tabular-nums block">− 20,00 €</span>
            <span className="text-[11px] text-[#737373]">Reste 15,00 €</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#111111]">Achats spontanés divers</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-[#eeeeee] text-[#555555] rounded">
                PLAISIR
              </span>
            </div>
            <span className="text-xs text-[#737373] mt-0.5">Budget actuel : 120,00 € / mois</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-[#111111] tabular-nums block">− 30,00 €</span>
            <span className="text-[11px] text-[#737373]">Reste 90,00 €</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5] bg-[#f9f9f9] px-2 -mx-2">
          <div className="flex flex-col">
            <span className="font-medium text-[#737373]">Dépenses vitales (loyer, alimentation...)</span>
            <span className="text-xs text-[#737373] mt-0.5">Aucun arbitrage requis</span>
          </div>
          <span className="text-xs uppercase font-semibold text-[#737373]">SANCTUARISÉ</span>
        </div>
      </div>

      <div className="p-3 bg-[#f3f3f4] border border-[#e5e5e5] rounded text-xs text-[#5e5e5e] mb-8 leading-relaxed">
        Les dépenses qualifiées "Vital" ne sont pas impactées par cette simulation.
      </div>

      <div className="pt-2 flex flex-col">
        <button
          type="button"
          onClick={() => navigate('SIM-03')}
          className="w-full flex justify-between items-center py-3.5 border-t border-b border-[#e5e5e5] text-[#111111] font-semibold text-[15px] hover:opacity-75 transition-opacity text-left cursor-pointer"
        >
          <span>Voir le détail d’une pocket arbitable</span>
          <span className="text-lg">›</span>
        </button>

        {isLinkedToObjective && (
          <button
            type="button"
            onClick={returnToOrigin}
            className="w-full flex justify-between items-center py-3.5 border-b border-[#e5e5e5] text-[#111111] font-semibold text-[15px] hover:opacity-75 transition-opacity text-left cursor-pointer"
          >
            <span>Valider cet arbitrage pour l’objectif</span>
            <span className="text-lg">›</span>
          </button>
        )}

        <button
          type="button"
          onClick={goBack}
          className="w-full flex justify-between items-center py-3 text-[#5e5e5e] hover:text-[#111111] font-medium text-[15px] transition-colors text-left cursor-pointer"
        >
          <span>{isLinkedToObjective ? 'Annuler' : 'Retour'}</span>
          <span className="text-lg">‹</span>
        </button>
      </div>
    </section>
  );
};
