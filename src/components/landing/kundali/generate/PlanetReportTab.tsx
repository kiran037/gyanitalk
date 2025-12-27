export function PlanetReportTab({ data }: any) {
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Select a planet to view detailed analysis
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {planets.map((planet) => (
          <button
            key={planet}
            className="rounded-xl border border-gray-200/60 bg-white/60 p-4 text-center transition-all hover:border-[#FF6B35]/40 dark:border-gray-700/60 dark:bg-white/5"
          >
            <div className="mb-2 text-3xl">{getPlanetEmoji(planet)}</div>
            <div className="font-semibold text-gray-900 dark:text-white">{planet}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getPlanetEmoji(name: string) {
  const map: Record<string, string> = {
    'Sun': '☀️', 'Moon': '🌙', 'Mars': '♂️', 'Mercury': '☿️',
    'Jupiter': '♃', 'Venus': '♀️', 'Saturn': '♄'
  };
  return map[name] || '⭐';
}