interface IOSAddHomescreenProps extends React.SVGProps<SVGSVGElement> {
  height?: string;
  width?: string;
}

const IOSAddHomescreen = ({ height = '1em', width = '1em', ...props }: IOSAddHomescreenProps) => {
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
      <g transform="matrix(16,0,0,14.2582,-192,-88.9001)">
        <rect x="24" y="13.647" width="2" height="14.353" fillRule="nonzero" />
      </g>
      <g transform="matrix(9.79717e-16,-16,14.2582,8.73066e-16,-88.9031,608.003)">
        <rect x="24" y="13.647" width="2" height="14.353" fillRule="nonzero" />
      </g>
      <g transform="matrix(16,0,0,16,-192,-223.994)">
        <path d="M15,14L35,14C36.7,14 38,15.3 38,17L38,37C38,38.7 36.7,40 35,40L15,40C13.3,40 12,38.7 12,37L12,17C12,15.3 13.3,14 15,14ZM35,16L15,16C14.4,16 14,16.4 14,17L14,37C14,37.6 14.4,38 15,38L35,38C35.6,38 36,37.6 36,37L36,17C36,16.4 35.6,16 35,16Z" />
      </g>
    </svg>
  );
};

export default IOSAddHomescreen;

