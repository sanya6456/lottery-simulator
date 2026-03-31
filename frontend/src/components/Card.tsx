import type { PropsWithChildren } from "react";

export default function Card({ children }: PropsWithChildren) {
  return (
    <div className="shadow-[2px_2px_10px_0px_#0000001a] w-full max-w-198 bg-white rounded-xs lg:rounded-3xl">
      <div className="p-4 lg:py-12 lg:px-19.5">{children}</div>
    </div>
  );
}
