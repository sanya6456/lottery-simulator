import type { PropsWithChildren } from "react";
import "./card.css";

export default function Card({ children }: PropsWithChildren) {
  return (
    <div className="cardDropShadow w-full max-w-198 bg-white rounded-xs lg:rounded-3xl">
      <div className="p-4 lg:py-12 lg:px-19.5">{children}</div>
    </div>
  );
}
