import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export type Pocket = {
  name: string;
  kind: 'VITAL' | 'PLAISIR';
  envelopeCents: number;
  remainingCents: number;
  account?: string;
  recent?: { label: string; date: string; amount: string };
  upcoming?: { label: string; date: string; amount: string };
};

const amountFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatAmount = (cents: number) => `${amountFormatter.format(cents / 100)} €`;

export const pockets: Pocket[] = [
  {
    name: 'Voiture',
    kind: 'VITAL',
    envelopeCents: 20_000,
    remainingCents: 16_500,
    account: 'Banque Alpha',
    recent: { label: 'Essence', date: 'hier', amount: '−35,00 €' },
    upcoming: { label: 'Parking', date: 'vendredi', amount: '−20,00 €' },
  },
  {
    name: 'Courses',
    kind: 'VITAL',
    envelopeCents: 45_000,
    remainingCents: 41_600,
    account: 'Banque Alpha',
    recent: { label: 'Supermarché', date: 'hier', amount: '−18,40 €' },
    upcoming: { label: 'Courses prévues', date: 'samedi', amount: '−20,00 €' },
  },
  {
    name: 'Bouffe dehors',
    kind: 'PLAISIR',
    envelopeCents: 12_000,
    remainingCents: 10_000,
    upcoming: { label: 'Déjeuner', date: 'jeudi', amount: '−15,00 €' },
  },
  {
    name: 'Transport',
    kind: 'VITAL',
    envelopeCents: 20_000,
    remainingCents: 17_000,
    account: 'Banque Bêta',
    recent: { label: 'Abonnement métro', date: '2 sept.', amount: '−28,00 €' },
    upcoming: { label: 'Recharge', date: '18 sept.', amount: '−20,00 €' },
  },
  {
    name: 'Abonnements',
    kind: 'PLAISIR',
    envelopeCents: 8_000,
    remainingCents: 8_000,
    upcoming: { label: 'Musique', date: '20 sept.', amount: '−10,00 €' },
  },
  {
    name: 'Sorties / Social',
    kind: 'PLAISIR',
    envelopeCents: 15_000,
    remainingCents: 13_600,
    account: 'Banque Bêta',
    recent: { label: 'Cinéma', date: '31 août', amount: '−14,00 €' },
  },
];

export const vitalEnvelopeCents = pockets
  .filter((pocket) => pocket.kind === 'VITAL')
  .reduce((total, pocket) => total + pocket.envelopeCents, 0);
export const pleasureEnvelopeCents = pockets
  .filter((pocket) => pocket.kind === 'PLAISIR')
  .reduce((total, pocket) => total + pocket.envelopeCents, 0);
export const lifeEnvelopeCents = pockets.reduce((total, pocket) => total + pocket.envelopeCents, 0);
export const upperThresholdCents = 200_000;
export const savingsCapacityCents = upperThresholdCents - lifeEnvelopeCents;

export const UC01: React.FC = () => {
  const { navigate, openPocket } = useNavigation();

  return (
    <section className="flex flex-col w-full text-[#111111]">
      <h1 className="font-serif text-[22px] font-semibold text-[#111111] leading-snug mb-5">
        Qu’est-ce qui vient de bouger, et que reste-t-il de libre ?
      </h1>

      <div className="mb-7">
        <div className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-1">
          DISPONIBLE MAINTENANT
        </div>
        <div className="font-serif text-[52px] font-bold text-black leading-none tabular-nums">
          500,00 €
        </div>
      </div>

      <div className="border-t border-[#e5e5e5] pt-4 mb-7">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-xs text-[#737373] uppercase tracking-wider font-semibold">
            MES POCKETS
          </span>
          <span className="text-xs text-[#737373]">Limites du mois</span>
        </div>

        <div className="space-y-2">
          {pockets.map((pocket) => (
            <button
              key={pocket.name}
              type="button"
              onClick={() => openPocket(pocket.name)}
              className="w-full text-left py-3 border-b border-[#eeeeee] hover:bg-[#fafafa] transition-colors cursor-pointer"
              aria-label={`Ouvrir la pocket ${pocket.name}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#111111]">{pocket.name}</span>
                    <span className="text-[10px] uppercase font-semibold tracking-wide px-1.5 py-0.5 bg-[#eeeeee] text-[#555555] rounded">
                      {pocket.kind}
                    </span>
                  </div>
                  <div className="text-xs text-[#737373] mt-1">
                    {formatAmount(pocket.remainingCents)} restants sur {formatAmount(pocket.envelopeCents)}
                    {pocket.account ? ` · ${pocket.account}` : ''}
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#555555] whitespace-nowrap">
                  DANS LA LIMITE
                </span>
              </div>

              {(pocket.recent || pocket.upcoming) && (
                <div className="mt-2 ml-2 pl-3 border-l border-[#d9d9d9] space-y-1.5 text-xs">
                  {pocket.recent && (
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="text-[#737373] truncate">
                        Récent · {pocket.recent.label} · {pocket.recent.date}
                      </span>
                      <span className="font-semibold tabular-nums whitespace-nowrap">
                        {pocket.recent.amount}
                      </span>
                    </div>
                  )}
                  {pocket.upcoming && (
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="text-[#737373] truncate">
                        À venir · {pocket.upcoming.label} · {pocket.upcoming.date}
                      </span>
                      <span className="font-semibold tabular-nums whitespace-nowrap">
                        {pocket.upcoming.amount}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('UC-02')}
        aria-label="Comprendre ma capacité d’épargne"
        className="w-full text-left border-t border-[#e5e5e5] pt-4 mb-7 hover:bg-[#fafafa] transition-colors cursor-pointer"
      >
        <span className="flex justify-between items-baseline mb-3">
          <span className="text-xs text-[#737373] uppercase tracking-wider font-semibold">
            REPÈRES DU MOIS
          </span>
          <span className="text-lg text-[#555555]">›</span>
        </span>
        <span className="grid grid-cols-3 gap-2 text-sm">
          <span>
            <span className="block text-xs text-[#737373]">Vitales</span>
            <span className="block font-semibold tabular-nums">{formatAmount(vitalEnvelopeCents)}</span>
          </span>
          <span>
            <span className="block text-xs text-[#737373]">Plaisir</span>
            <span className="block font-semibold tabular-nums">{formatAmount(pleasureEnvelopeCents)}</span>
          </span>
          <span>
            <span className="block text-xs text-[#737373]">Capacité d’épargne</span>
            <span className="block font-semibold tabular-nums">{formatAmount(savingsCapacityCents)}</span>
          </span>
        </span>
        <span className="block text-xs text-[#737373] mt-3 leading-relaxed">
          Les enveloppes restent sous le seuil haut de {formatAmount(upperThresholdCents)} de revenus récurrents.
        </span>
      </button>
    </section>
  );
};
