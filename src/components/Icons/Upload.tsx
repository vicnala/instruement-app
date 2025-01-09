// icon:upload-24 | Octicons https://primer.style/octicons/ | Github Primer
import * as React from "react";

interface IconUploadTwentyFourProps extends React.SVGProps<SVGSVGElement> {
  height?: string; // Optional height property
  width?: string;  // Optional width property
}

function IconUploadTwentyFour({ height = '24px', width = '24px', ...props }: IconUploadTwentyFourProps) {
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
        d="M4.75 22a.75.75 0 010-1.5h14.5a.75.75 0 010 1.5H4.75zm.22-13.53a.75.75 0 001.06 1.06L11 4.56v12.19a.75.75 0 001.5 0V4.56l4.97 4.97a.75.75 0 101.06-1.06l-6.25-6.25a.75.75 0 00-1.06 0L4.97 8.47z"
      />
    </svg>
  );
}

export default IconUploadTwentyFour;

