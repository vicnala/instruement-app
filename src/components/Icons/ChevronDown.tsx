// icon:chevron-down-24 | Octicons https://primer.style/octicons/ | Github Primer
import * as React from "react";

interface IconChevronDownTwentyFourProps extends React.SVGProps<SVGSVGElement> {
  height?: string; // Optional height property
  width?: string;  // Optional width property
}

function IconChevronDownTwentyFour({ height = '1em', width = '1em', ...props }: IconChevronDownTwentyFourProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={height}
      width={width}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.72a.75.75 0 000 1.06l6.25 6.25a.75.75 0 001.06 0l6.25-6.25a.75.75 0 00-1.06-1.06L12 14.44 6.28 8.72a.75.75 0 00-1.06 0z"
      />
    </svg>
  );
}

export default IconChevronDownTwentyFour;
