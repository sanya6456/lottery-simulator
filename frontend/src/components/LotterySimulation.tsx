import { useState } from "react";
import type { DrawResult } from "../lib/socket/useSessionSocket";
import Spacing from "./common/Spacing";
import GeneralInfo from "./GeneralInfo";
import LotterySimulationForm from "./LotterySimulationForm";
import WinStatistics from "./WinStatistics";

export default function LotterySimulation() {
  const [latestDraw, setLatestDraw] = useState<DrawResult | null>(null);

  return (
    <>
      <GeneralInfo {...latestDraw?.stats} />
      <Spacing size="lg" />
      <WinStatistics {...latestDraw?.stats?.wins} />
      <Spacing size="lg" />
      <LotterySimulationForm
        latestDraw={latestDraw}
        setLatestDraw={setLatestDraw}
      />
    </>
  );
}
