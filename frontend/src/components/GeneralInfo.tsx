type TGeneralInfoProps = {
  totalDraws?: number;
  yearsElapsed?: number;
  totalCost?: number;
};

export default function GeneralInfo({
  totalDraws = 0,
  yearsElapsed = 0,
  totalCost = 0,
}: TGeneralInfoProps) {
  return (
    <div className="rounded-[10px] bg-primary text-white text-[14px] font-bold p-4 space-y-1 lg:text-[16px] lg:px-6">
      <p>
        Number of tickets: <span className="font-extrabold">{totalDraws}</span>
      </p>
      <p>Years spent: {yearsElapsed}</p>
      <p>
        Cost of tickets:{" "}
        {Intl.NumberFormat("hu-HU", {
          style: "currency",
          currency: "HUF",
        }).format(totalCost)}
      </p>
    </div>
  );
}
