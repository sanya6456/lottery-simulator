import type { SVGProps } from "react";

type TIconProps = SVGProps<SVGSVGElement>;

export default function PlusIcon(props: TIconProps) {
  return (
    <svg
      width="28"
      height="29"
      viewBox="0 0 28 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_1_2035)">
        <path
          d="M27.9283 12.8135H16.1097V0.0852661L11.8888 4.49772V12.8135H0.0701904V17.0562H11.8888V28.9358H16.1097V17.0562H27.9283V12.8135Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_1_2035">
          <rect width="28" height="29" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
