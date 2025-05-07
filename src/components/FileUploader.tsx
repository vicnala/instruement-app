import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import UploadService from "../services/FileUploadService";
import FileResizeService from "@/services/FileResizeService";

interface ProgressInfo {
  fileName: string;
  percentage: number;
}

interface FilesUploadProps {
  multiple: boolean;
}


const FilesUpload: React.FC<FilesUploadProps> = ({multiple}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<string>>([]);
  const [progressInfos, setProgressInfos] = useState<Array<ProgressInfo>>([]);
  const [message, setMessage] = useState<Array<string>>([]);
  const progressInfosRef = useRef<any>(null);
  const [resizing, setResizing] = useState<Boolean>(false);

  const selectFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let images: Array<string> = [];
    let files = event.target.files;
    let resizedFiles: File[] = [];

    if (files) {
      setResizing(true);
      for (let i = 0; i < files.length; i++) {
        try {
          // if (files[i].size > parseInt(process.env.NEXT_PUBLIC_MAX_SIZE || '10000000')) {
          //   alert(`${files[i].name} is too big. Please upload files under 10M.`);
          //   return;
          // }

          const resized = await FileResizeService(files[i]);
          resizedFiles.push(resized as File);
          images.push(URL.createObjectURL(resized as File));
        } catch (error: unknown) {
          if (error instanceof Error)
          console.log('Resize error:', error.message);
        }
      }
      setSelectedFiles(resizedFiles);
      setImagePreviews(images);
      setProgressInfos([]);
      setMessage([]);
    }
  };

  const upload = (idx: number, file: File) => {
    let _progressInfos = [...progressInfosRef.current];

    return UploadService.upload(file, (event: any) => {
      _progressInfos[idx].percentage = Math.round(
        (100 * event.loaded) / event.total
      );
      setProgressInfos(_progressInfos);
    })
    .then(() => {
      setMessage((prevMessage) => [
        ...prevMessage,
        'success'
      ]);
    })
    .catch((err: any) => {
      _progressInfos[idx].percentage = 0;
      setProgressInfos(_progressInfos);

      let msg = 'error';
      if (err.response && err.response.data && err.response.data.message) {
        msg += " " + err.response.data.message;
      }

      setMessage((prevMessage) => [
        ...prevMessage,
        msg
      ]);
    });
  };

  useEffect(()=> {
    if (selectedFiles && selectedFiles.length) {
      let _progressInfos = selectedFiles.map((file) => ({
        percentage: 0,
        fileName: file.name
      }));

      progressInfosRef.current = _progressInfos;
      const uploadPromises = selectedFiles.map((file, i) => upload(i, file));

      setResizing(false);

      Promise.all(uploadPromises)
        .then(() => setSelectedFiles([]));

      setMessage([]);
    }    
  }, [selectedFiles]);

  return (
    <div className="space-y-2">
      <input
        type="file"
        multiple={multiple}
        onChange={selectFiles}
        accept={process.env.NEXT_PUBLIC_MIME_TYPE_ACCEPT || ".jpeg"}
      />

      { resizing && <p className="text-xs text-gray-600">Processing images...</p> }

      <div className="grid grid-cols-2 gap-4 p-4">
        {imagePreviews &&
          imagePreviews.length > 0 &&
          imagePreviews.map((url: String, index: number) => (
            <div
              key={index}
              className=""
            >
              {imagePreviews[index] &&
                <div className="w-full h-64 relative">
                  <Image
                    className="rounded"
                    src={imagePreviews[index]}
                    alt={"image-" + index}
                    objectFit="scale-down"
                    fill
                  />
                </div>
              }
              {
                progressInfos &&
                progressInfos.length > 0 &&
                <div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div 
                        className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progressInfos[index].percentage}%` }}>
                      </div>    
                    </div>
                    <p className="text-sm text-gray-600">{`${progressInfos[index].percentage}`}% uploaded</p>
                    {message[index] === 'error' && <p className="text-xs text-red-600">Upload failed. Please try again.</p>}
                    {message[index] === 'success' && <p className="text-xs text-green-600">Uploaded successfully!</p>}
                  </div>
                </div>
              }
            </div>
        ))}
      </div>
    </div>
  );
};

export default FilesUpload;