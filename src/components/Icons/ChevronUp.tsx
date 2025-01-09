// icon:chevron-down-24 | Octicons https://primer.style/octicons/ | Github Primer
import * as React from "react";

interface IconChevronUpTwentyFourProps extends React.SVGProps<SVGSVGElement> {
  height?: string; // Optional height property
  width?: string;  // Optional width property
}

function IconChevronUpTwentyFour({ height = '1em', width = '1em', ...props }: IconChevronUpTwentyFourProps) {
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
        d="M18.78 15.28a.75.75 0 000-1.06l-6.25-6.25a.75.75 0 00-1.06 0l-6.25 6.25a.75.75 0 101.06 1.06L12 9.56l5.72 5.72a.75.75 0 001.06 0z"
      />
    </svg>
  );
}

export default IconChevronUpTwentyFour;
