type TWinStatisticsProps = {
  twoWinsCount?: number;
  threeWinsCount?: number;
  fourWinsCount?: number;
  fiveWinsCount?: number;
};

export default function WinStatistics({
  twoWinsCount = 0,
  threeWinsCount = 0,
  fourWinsCount = 0,
  fiveWinsCount = 0,
}: TWinStatisticsProps) {
  const WINS_DATA = [
    { label: "2 matches", count: twoWinsCount },
    { label: "3 matches", count: threeWinsCount },
    { label: "4 matches", count: fourWinsCount },
    { label: "5 matches", count: fiveWinsCount },
  ];

  return (
    <div className="overflow-hidden drop-shadow-md rounded-[10px] w-full max-w-127 bg-white grid grid-cols-2 lg:grid-cols-4">
      {WINS_DATA.map(({ label, count }) => (
        <div
          key={label}
          className="flex flex-col items-center justify-center min-h-18 border border-secondary"
        >
          <p className="text-xs font-bold">{label}</p>
          <p className="font-extrabold">{count}</p>
        </div>
      ))}
    </div>
  );
}
