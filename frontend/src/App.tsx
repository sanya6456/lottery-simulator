import Card from "./components/card/Card";
import GeneralInfo from "./components/general-info/GeneralInfo";
import Header from "./components/header/Header";
import Heading from "./components/heading/Heading";

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
        </Card>
      </main>
    </>
  );
}

export default App;
