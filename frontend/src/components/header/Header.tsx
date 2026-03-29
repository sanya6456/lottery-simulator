import PlusIcon from "../../icons/PlusIcon";
import Heading from "../common/Heading";
import "./header.css";

export default function Header() {
  return (
    <header className="header-gradient h-15 w-full flex items-center px-5 mb-6 lg:mb-12">
      <div className="flex items-center">
        <PlusIcon className="mr-5" aria-hidden="true" />
        <Heading className="text-white">Lottery simulator</Heading>
      </div>
    </header>
  );
}
