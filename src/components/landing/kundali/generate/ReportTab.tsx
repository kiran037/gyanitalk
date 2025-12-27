export function ReportTab({ data }: any) {
  const { houseLords, personalCharacteristics } = data;
  
  return (
    <div className="space-y-6">
      {houseLords && houseLords.map((house: any, idx: number) => (
        <div key={idx} className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            House {house.current_house}: {house.current_zodiac}
          </h3>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {house.personalised_prediction}
          </p>
        </div>
      ))}
    </div>
  );
}