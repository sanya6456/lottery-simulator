import Card from "./components/card/Card";
import Header from "./components/header/Header";
import Heading from "./components/common/Heading";
import LotterySimulation from "./components/LotterySimulation";

function App() {
  return (
    <>
      <Header />
      <main className="px-4 flex flex-col items-center">
        <Card>
          <Heading as="h2" className="text-[32px] pb-4 lg:text-[40px]">
            Result
          </Heading>
          <LotterySimulation />
        </Card>
      </main>
    </>
  );
}

export default App;
