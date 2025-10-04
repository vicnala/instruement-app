import Resizer from "react-image-file-resizer";

const FileResizeService = (file: File) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        parseInt(process.env.NEXT_PUBLIC_MAX_WIDTH || '5000'),
        parseInt(process.env.NEXT_PUBLIC_MAX_HEIGHT || '5000'),
        process.env.NEXT_PUBLIC_COMPRESS_FORMAT || "JPEG",
        parseInt(process.env.NEXT_PUBLIC_QUALITY || '85'),
        0,
        (uri) => resolve(uri),
        "file"
      );
});

export default FileResizeService;