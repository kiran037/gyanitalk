export function DashaTab({ data }: any) {
  const { aiPrediction } = data;
  
  if (!aiPrediction || !aiPrediction.length) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <div className="mb-4 text-6xl">⏳</div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Dasha Analysis Coming Soon
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {aiPrediction.map((prediction: any, idx: number) => (
        <div key={idx} className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {prediction.specifications.start_month} {new Date(prediction.specifications.start_date).getFullYear()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dasha: {prediction.specifications.dasha}
            </p>
          </div>
          <div className="space-y-3">
            {Object.entries(prediction.predictions).map(([key, value]: [string, any]) => (
              <div key={key} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                <h4 className="mb-2 font-semibold capitalize text-gray-900 dark:text-white">
                  {key.replace('_', ' ')}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {value.bot_response?.substring(0, 200)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}