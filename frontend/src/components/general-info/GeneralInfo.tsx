type TGeneralInfoProps = {
  numberOfTickets?: number;
  yearsSpent?: number;
  costOfTickets?: number;
};

export default function GeneralInfo({
  numberOfTickets = 0,
  yearsSpent = 0,
  costOfTickets = 0,
}: TGeneralInfoProps) {
  return (
    <div className="rounded-[10px] bg-primary text-white text-[14px] font-bold p-4 space-y-1 lg:text-[16px] lg:px-6">
      <p>
        Number of tickets:{" "}
        <span className="font-extrabold">{numberOfTickets}</span>
      </p>
      <p>Years spent: {yearsSpent}</p>
      <p>
        Cost of tickets:{" "}
        {Intl.NumberFormat("hu-HU", {
          style: "currency",
          currency: "HUF",
        }).format(costOfTickets)}
      </p>
    </div>
  );
}
