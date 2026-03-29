import Card from "./components/card/Card";
import GeneralInfo from "./components/GeneralInfo";
import Header from "./components/header/Header";
import Heading from "./components/common/Heading";
import Spacing from "./components/common/Spacing";
import WinStatistics from "./components/WinStatistics";
import LotterySimulationForm from "./components/LotterySimulationForm";

function App() {
  return (
    <>
      <Header />
      <main className="px-4 flex flex-col items-center">
        <Card>
          <Heading as="h2" className="text-[32px] pb-4 lg:text-[40px]">
            Result
          </Heading>
          <GeneralInfo />
          <Spacing size="lg" />
          <WinStatistics />
          <Spacing size="lg" />
          <LotterySimulationForm />
        </Card>
      </main>
    </>
  );
}

export default App;
