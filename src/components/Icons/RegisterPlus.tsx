interface RegisterPlusProps extends React.SVGProps<SVGSVGElement> {
  height?: string;
  width?: string;
}

const RegisterPlus = ({ height = '1em', width = '1em', ...props }: RegisterPlusProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8,12L16,12"/>
      <path d="M12,8L12,16"/>
      <g transform="matrix(0.0297697,0,0,0.0297697,-21.4025,-36.1046)">
        <path d="M1104.32,1285.35C1115.18,1278.19 1129.26,1278.19 1140.12,1285.35L1213.81,1333.89L1301.06,1337.89C1314.6,1338.51 1326.47,1347.13 1331.24,1359.82L1362.01,1441.56L1431.48,1497.07C1441.32,1504.93 1445.53,1517.9 1442.19,1530.04L1418.62,1615.78L1441.9,1700.46C1445.42,1713.25 1440.98,1726.9 1430.62,1735.18L1362.01,1790L1330.8,1872.93C1326.29,1884.89 1315.1,1893.03 1302.33,1893.61L1213.81,1897.67L1139.49,1946.63C1129.01,1953.53 1115.43,1953.53 1104.95,1946.63L1030.63,1897.67L941.848,1893.6C929.238,1893.02 918.183,1884.99 913.736,1873.17L882.428,1790L812.394,1734.04C802.899,1726.45 798.833,1713.94 802.055,1702.22L825.821,1615.78L801.775,1528.32C798.723,1517.22 802.574,1505.37 811.569,1498.18L882.428,1441.56L913.704,1358.47C918.171,1346.6 929.274,1338.54 941.939,1337.96L1030.63,1333.89L1104.32,1285.35Z" strokeWidth="67.18" strokeLinecap="butt" strokeMiterlimit="2"/>
      </g>
    </svg>
  );
};

export default RegisterPlus;

