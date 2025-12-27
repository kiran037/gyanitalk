export function GemSuggestionTab({ data }: any) {
  const { planetDetails, ascendantReport } = data;
  
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          💎 Recommended Gemstone
        </h3>
        <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="mb-3 text-5xl">💎</div>
          <h4 className="mb-2 text-2xl font-bold text-purple-900 dark:text-purple-100">
            {ascendantReport?.lucky_gem || planetDetails.lucky_gem?.[0] || 'Ruby'}
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Wear on ring finger, preferably on a {ascendantReport?.day_for_fasting || 'Sunday'}
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Note:</strong> Consult an astrologer before wearing any gemstone. 
          The gemstone should be energized with proper mantras for maximum benefit.
        </p>
      </div>
    </div>
  );
}
