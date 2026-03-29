type TWinStatisticsProps = {
  two?: number;
  three?: number;
  four?: number;
  five?: number;
};

export default function WinStatistics({
  two = 0,
  three = 0,
  four = 0,
  five = 0,
}: TWinStatisticsProps) {
  const WINS_DATA = [
    { label: "2 matches", count: two },
    { label: "3 matches", count: three },
    { label: "4 matches", count: four },
    { label: "5 matches", count: five },
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
