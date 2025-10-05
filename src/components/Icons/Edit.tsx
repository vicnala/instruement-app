// icon:edit | Octicons https://primer.style/octicons/ | Github Primer

interface IconEditProps extends React.SVGProps<SVGSVGElement> {
  height?: string;
  width?: string;
}

function IconEdit({ height = '1em', width = '1em', ...props }: IconEditProps) {
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
        d="M17.263 2.177a1.75 1.75 0 012.474 0l2.586 2.586a1.75 1.75 0 010 2.474L19.53 10.03l-.012.013L8.69 20.378a1.75 1.75 0 01-.699.409l-5.523 1.68a.75.75 0 01-.935-.935l1.673-5.5a1.75 1.75 0 01.466-.756L14.476 4.963l2.787-2.786zm-2.275 4.371l-10.28 10.3a.25.25 0 00-.067.108l-1.264 4.154 4.177-1.271a.25.25 0 00.1-.059l10.273-10.291-2.94-2.94zm3.404-3.404l2.586 2.586a.25.25 0 010 .354l-1.036 1.036-2.94-2.94 1.036-1.036a.25.25 0 01.354 0z"
      />
    </svg>
  );
}

export default IconEdit; 