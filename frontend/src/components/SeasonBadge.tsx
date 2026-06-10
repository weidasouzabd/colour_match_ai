const seasonColors: Record<string, string> = {
  'Primavera Clara': '#ffe0a8',
  'Primavera Quente': '#ffbf69',
  'Verão Suave': '#d7c5f6',
  'Verão Claro': '#c6defc',
  'Outono Quente': '#d68c45',
  'Outono Suave': '#b08968',
  'Inverno Profundo': '#364fc7',
  'Inverno Frio': '#577590',
};

export function SeasonBadge({ season }: { season?: string | null }) {
  const safeSeason = season || 'Sem análise';
  const bg = seasonColors[safeSeason] ?? '#d1d5db';
  return (
    <span className="season-badge" style={{ backgroundColor: bg }}>
      {safeSeason}
    </span>
  );
}
