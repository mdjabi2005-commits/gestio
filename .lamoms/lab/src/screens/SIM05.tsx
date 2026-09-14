import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const SIM05: React.FC = () => {
  const { resetTo, goBack, canGoBack } = useNavigation();

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
        <span>IMPACT PROJETS</span>
      </div>

      <div className="text-xs uppercase text-[#737373] font-semibold tracking-wider mb-2">
        IMPACT SUR LES OBJECTIFS
      </div>

      <h1 className="font-serif text-[22px] font-bold text-[#111111] leading-snug mb-5">
        Mes projets tiennent-ils encore après ce choc ?
      </h1>

      <div className="font-serif text-[44px] font-bold text-black leading-tight mb-2 tabular-nums">
        Projets différés de 6 mois
      </div>

      <p className="text-sm text-[#5e5e5e] mb-6 leading-relaxed">
        Le temps de reconstituer la réserve d'urgence de 1 200,00 € sans annuler l'objectif
      </p>

      {/* Delay horizon visual */}
      <div className="flex flex-col mb-8 p-4 bg-[#f3f3f4] rounded-lg">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#737373]">Échéance initiale</span>
          <span className="font-semibold text-black">Octobre 2028 (36 mois)</span>
        </div>
        <div className="h-2 w-full bg-[#e2e2e2] rounded-full overflow-hidden mb-3">
          <div className="h-full bg-black w-[60%]" />
        </div>

        <div className="flex justify-between text-xs mb-2">
          <span className="text-[#737373]">Nouvelle échéance estimée</span>
          <span className="font-semibold text-black">Avril 2029 (42 mois)</span>
        </div>
        <div className="h-2 w-full bg-[#e2e2e2] rounded-full overflow-hidden">
          <div className="h-full bg-black/60 w-[70%]" />
        </div>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Avoirs déjà affectés au projet</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              FAIT INTÉGRAL
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">3 000,00 €</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Prélèvement sur le projet pour le choc</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              NON REQUIS
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">0,00 €</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Décalage mécanique d'épargne</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              RECONSTITUTION PRIORITAIRE
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">+ 6 mois</span>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-[#e5e5e5]">
          <div className="flex flex-col">
            <span className="font-medium text-[#111111]">Objectif maintenu</span>
            <span className="text-[10px] uppercase font-semibold text-[#737373] tracking-wider mt-0.5">
              CIBLE INTACTE
            </span>
          </div>
          <span className="font-semibold text-[#111111] tabular-nums">12 000,00 €</span>
        </div>
      </div>

      <div className="p-3 bg-[#f3f3f4] border border-[#e5e5e5] rounded text-xs text-[#5e5e5e] mb-8 leading-relaxed">
        Grâce à la sanctuarisation de la réserve, votre apport de 3 000,00 € n'a pas été entamé.
      </div>

      <div className="pt-2 flex flex-col">
        <button
          type="button"
          onClick={() => resetTo('UC-04')}
          className="w-full flex justify-between items-center py-3.5 border-t border-b border-[#e5e5e5] text-[#111111] font-semibold text-[15px] hover:opacity-75 transition-opacity text-left cursor-pointer"
        >
          <span>Revenir à la réserve</span>
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
