import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { formatAmount, pockets } from './UC01';
import { ScreenTopBar } from './ScreenTopBar';

export const UC03: React.FC = () => {
  const { selectedPocket, openPocket } = useNavigation();
  const current = pockets.find((pocket) => pocket.name === selectedPocket) ?? pockets[0];
  const [envelopes, setEnvelopes] = useState<Record<string, number>>(
    Object.fromEntries(pockets.map((pocket) => [pocket.name, pocket.envelopeCents])),
  );

  const familyPockets = pockets.filter((pocket) => pocket.kind === current.kind);
  const familyTotal = familyPockets.reduce((total, pocket) => total + pocket.envelopeCents, 0);
  const familyAssigned = familyPockets.reduce(
    (total, pocket) => total + (envelopes[pocket.name] ?? pocket.envelopeCents),
    0,
  );
  const unallocatedCents = Math.max(0, familyTotal - familyAssigned);
  const envelopeCents = envelopes[current.name] ?? current.envelopeCents;
  const spentCents = current.envelopeCents - current.remainingCents;
  const remainingCents = envelopeCents - spentCents;
  const usedPercent = envelopeCents > 0 ? Math.min(100, Math.round((spentCents / envelopeCents) * 100)) : 100;

  const updateEnvelope = (name: string, nextCents: number) => {
    setEnvelopes((previous) => {
      const otherAssigned = familyPockets
        .filter((pocket) => pocket.name !== name)
        .reduce((total, pocket) => total + (previous[pocket.name] ?? pocket.envelopeCents), 0);
      const maximum = Math.max(0, familyTotal - otherAssigned);
      return { ...previous, [name]: Math.min(Math.max(0, nextCents), maximum) };
    });
  };

  return (
    <section className="flex flex-col w-full text-[#111111]">
      <ScreenTopBar />

      <div className="text-xs uppercase text-[#737373] font-semibold tracking-wider mb-2">
        DÉTAIL D’UNE POCKET
      </div>

      <h1 className="font-serif text-[22px] font-bold text-[#111111] leading-snug mb-5">
        Transactions et enveloppe de ma pocket
      </h1>

      <label htmlFor="pocket-filter" className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-2">
        FILTRER PAR POCKET
      </label>
      <select
        id="pocket-filter"
        value={current.name}
        onChange={(event) => openPocket(event.target.value)}
        className="w-full border border-[#d9d9d9] bg-white px-3 py-3 text-[15px] text-[#111111] mb-7"
      >
        {pockets.map((pocket) => (
          <option key={pocket.name} value={pocket.name}>
            {pocket.name} · {pocket.kind}
          </option>
        ))}
      </select>

      <div className="border-t border-[#e5e5e5] pt-4 mb-7">
        <div className="flex justify-between items-start gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[18px]">{current.name}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wide px-1.5 py-0.5 bg-[#eeeeee] text-[#555555] rounded">
                {current.kind}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-1">
              {current.account ? `Compte associé : ${current.account}` : 'Aucun compte associé'}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#555555] whitespace-nowrap">
            {remainingCents >= 0 ? 'DANS LA LIMITE' : 'LIMITE DÉPASSÉE'}
          </span>
        </div>

        <div className="flex justify-between items-baseline text-sm mb-2">
          <span>Reste après les mouvements</span>
          <span className="font-semibold tabular-nums">
            {formatAmount(Math.abs(remainingCents))} {remainingCents >= 0 ? 'restants' : 'au-dessus'}
          </span>
        </div>
        <div className="h-1.5 bg-[#eeeeee]" aria-hidden="true">
          <div className="h-full bg-[#111111]" style={{ width: `${usedPercent}%` }} />
        </div>
        <p className="text-xs text-[#737373] mt-2">
          {current.kind === 'PLAISIR' ? 'Plaisir' : 'Vital'} : {formatAmount(envelopeCents)} · {Math.round((envelopeCents / familyTotal) * 100)} % attribués à cette pocket
        </p>
      </div>

      <div className="border-t border-[#e5e5e5] pt-4 mb-7">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-xs text-[#737373] uppercase tracking-wider font-semibold">
            TRANSACTIONS DE LA POCKET
          </span>
          <span className="text-xs text-[#737373]">récentes et à venir</span>
        </div>

        <div className="space-y-1 text-sm">
          {current.recent && (
            <div className="flex justify-between items-baseline gap-3 py-3 border-b border-[#e5e5e5]">
              <div>
                <div className="font-medium">{current.recent.label}</div>
                <div className="text-xs text-[#737373] mt-0.5">Récent · {current.recent.date}</div>
              </div>
              <span className="font-semibold tabular-nums whitespace-nowrap">{current.recent.amount}</span>
            </div>
          )}
          {current.upcoming && (
            <div className="flex justify-between items-baseline gap-3 py-3 border-b border-[#e5e5e5]">
              <div>
                <div className="font-medium">{current.upcoming.label}</div>
                <div className="text-xs text-[#737373] mt-0.5">À venir · {current.upcoming.date}</div>
              </div>
              <span className="font-semibold tabular-nums whitespace-nowrap">{current.upcoming.amount}</span>
            </div>
          )}
          {!current.recent && !current.upcoming && (
            <p className="text-sm text-[#737373] py-3">Aucune transaction récente ou à venir.</p>
          )}
        </div>
      </div>

      <div className="border-t border-[#e5e5e5] pt-4 mb-7">
        <div className="text-xs text-[#737373] uppercase tracking-wider font-semibold mb-1">
          RÉPARTIR LES POCKETS {current.kind === 'PLAISIR' ? 'PLAISIR' : 'VITALES'}
        </div>
        <p className="text-sm text-[#5e5e5e] leading-relaxed mb-5">
          Ajuste les trois pockets de cette famille. Le montant non attribué reste disponible à répartir.
        </p>

        <div className="space-y-5">
          {familyPockets.map((pocket) => {
            const amount = envelopes[pocket.name] ?? pocket.envelopeCents;
            const otherAssigned = familyAssigned - amount;
            const maximum = Math.max(0, familyTotal - otherAssigned);
            const percentage = familyTotal > 0 ? Math.round((amount / familyTotal) * 100) : 0;

            return (
              <div key={pocket.name}>
                <div className="flex justify-between items-baseline gap-3 mb-1">
                  <label htmlFor={`envelope-${pocket.name}`} className="text-sm font-semibold">
                    {pocket.name}
                  </label>
                  <span className="text-sm tabular-nums whitespace-nowrap">
                    {formatAmount(amount)} · {percentage} %
                  </span>
                </div>
                <input
                  id={`envelope-${pocket.name}`}
                  type="range"
                  min="0"
                  max={maximum}
                  step="500"
                  value={amount}
                  onChange={(event) => updateEnvelope(pocket.name, Number(event.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-baseline border-t border-[#e5e5e5] mt-6 pt-3 text-sm">
          <span className="font-semibold">Reste à répartir</span>
          <span className="font-semibold tabular-nums">{formatAmount(unallocatedCents)}</span>
        </div>
        <p className="text-xs text-[#737373] mt-3 leading-relaxed">
          La somme de cette famille reste limitée à {formatAmount(familyTotal)}. Une pocket ne peut pas prendre la part déjà attribuée aux autres.
        </p>
      </div>
    </section>
  );
};
