interface IOSShareProps extends React.SVGProps<SVGSVGElement> {
  height?: string;
  width?: string;
}

const IOSShare = ({ height = '1em', width = '1em', ...props }: IOSShareProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 416 541"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
      {...props}
    >
      <g transform="matrix(16,0,0,16,-192,-99.682)">
        <path d="M24,10.03L19.7,14.33L18.3,12.93L25,6.23L31.7,12.93L30.3,14.33L26,10.03L26,28L24,28L24,10.03ZM35,40L15,40C13.3,40 12,38.7 12,37L12,19.444C12,17.744 13.3,16.444 15,16.444L22,16.444L22,18.444L15,18.444C14.4,18.444 14,18.844 14,19.444L14,37C14,37.6 14.4,38 15,38L35,38C35.6,38 36,37.6 36,37L36,19.444C36,18.844 35.6,18.444 35,18.444L28,18.444L28,16.444L35,16.444C36.7,16.444 38,17.744 38,19.444L38,37C38,38.7 36.7,40 35,40Z" />
      </g>
    </svg>
  );
};

export default IOSShare;

