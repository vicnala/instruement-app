import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FileText } from 'lucide-react';
import UploadService from "../services/FileUploadService";
import FileResizeService from "@/services/FileResizeService";
import IconUploadTwentyFour from "@/components/Icons/Upload";
import IconTrashTwentyFour from "./Icons/Trash";
import ButtonSpinner from "@/components/UI/ButtonSpinner";
import { InstrumentImage, InstrumentFile, Instrument } from "@/lib/definitions";

interface ProgressInfo {
  fileName: string;
  percentage: number;
}

type Accept = 'image' | 'file';

interface FilesUploadProps {
  multiple: boolean;
  instrument: Instrument,
  api_key: string,
  isCover: boolean,
  accept: Accept,
  onMediaChange?: (media: (InstrumentImage | InstrumentFile)[]) => void
}

const MediaManager: React.FC<FilesUploadProps> = ({
  multiple,
  instrument,
  api_key,
  isCover,
  accept,
  onMediaChange
}) => {
  const t = useTranslations('components.DraftForm');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<(InstrumentImage | InstrumentFile)[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<string>>([]);
  const [progressInfos, setProgressInfos] = useState<Array<ProgressInfo>>([]);
  const [message, setMessage] = useState<Array<string>>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const progressInfosRef = useRef<any>(null);
  const [resizing, setResizing] = useState<Boolean>(false);
  const ref = useRef<HTMLInputElement>(null);

  // Initialize with existing media
  useEffect(() => {
    if (instrument) {
      const existingMedia: (InstrumentImage | InstrumentFile)[] = [];
      const existingDescriptions: string[] = [];
      
      if (isCover && instrument.cover_image) {
        if (instrument.cover_image.id) {
          existingMedia.push(instrument.cover_image);
          existingDescriptions.push(instrument.cover_image.description || '');
        }
      } else if (accept === 'image' && instrument.images) {
        existingMedia.push(...instrument.images);
        existingDescriptions.push(...instrument.images.map(img => img.description || ''));
      } else if (accept === 'file' && instrument.files) {
        existingMedia.push(...instrument.files);
        existingDescriptions.push(...instrument.files.map(file => file.description || ''));
      }
      
      setUploadedFiles(existingMedia);
      setDescriptions(existingDescriptions);
    }
  }, [instrument, isCover, accept]);

  // Notify parent component of media changes
  useEffect(() => {
    if (onMediaChange) {
      onMediaChange(uploadedFiles);
    }
  }, [uploadedFiles, onMediaChange]);

  // Handle images click
  const handleClick = () => {
    ref.current?.click();
  }

  const handleDelete = (index: number, type: string) => {
    const file = uploadedFiles[index];
    setDeletingFileId(file.id.toString());

    UploadService.deleteFile(file.id, api_key)
      .then(() => {
        if (type === 'image') {
          setImagePreviews(imagePreviews.filter((_, i) => i !== index));
        }
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
        setProgressInfos(progressInfos.filter((_, i) => i !== index));
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
        setMessage(message.filter((_, i) => i !== index));
        setDescriptions(descriptions.filter((_, i) => i !== index));
      })
      .catch((err: any) => {
        alert(`Error deleting file ${file.id}`);
      })
      .finally(() => {
        setDeletingFileId(null);
      });
  }

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);

    // Update the description in the uploaded file
    const updatedFiles = [...uploadedFiles];
    if (updatedFiles[index]) {
      updatedFiles[index] = {
        ...updatedFiles[index],
        description: value
      };
      setUploadedFiles(updatedFiles);
    }
  };

  const selectFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let images: Array<string> = [];
    let files = event.target.files;
    let resizedFiles: File[] = [];

    if (accept === 'image') {
      if (files) {
        setResizing(true);
        for (let i = 0; i < files.length; i++) {
          try {
            if (files[i].type.includes('image')) {
              const resized = await FileResizeService(files[i]);             
              resizedFiles.push(resized as File);
              images.push(URL.createObjectURL(resized as File));
            }
          } catch (error: unknown) {
            if (error instanceof Error) {
              console.log('Resize error:', error.message);
            }
            alert('Error resizing image');
          }
        }
        setSelectedFiles(resizedFiles);
        setImagePreviews(images);
        setDescriptions([...descriptions, ...Array(files.length).fill('')]);
      }
    } else if (accept === 'file') {
      if (files) {
        setSelectedFiles(Array.from(files));
        setDescriptions([...descriptions, ...Array(files.length).fill('')]);
      }
    }

    setProgressInfos([]);
    setMessage([]);
  };

  const upload = (idx: number, file: File) => {
    let _progressInfos = [...progressInfosRef.current];

    return UploadService.upload(file, `${instrument.id}`, api_key, isCover, (event: any) => {
      _progressInfos[idx].percentage = Math.round(
        (100 * event.loaded) / event.total
      );
      setProgressInfos(_progressInfos);
    })
    .then(data => {
      setMessage((prevMessage) => [
        ...prevMessage,
        'success'
      ]);

      // Add description to the uploaded file
      const uploadedFile = {
        ...data.data,
        description: descriptions[idx] || ''
      };

      return uploadedFile;
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
        .then((data: any) => {          
          // Only keep successfully uploaded files
          const successfulUploads = data
            .filter((d: any) => d.code === 'success')
            .map((d: any) => d.data);

          setImagePreviews([]);
          setSelectedFiles([]);
          setUploadedFiles(prev => [...prev, ...successfulUploads]);
        });

      setMessage([]);
    }    
  }, [selectedFiles]);

  return (
    <div className="">
      <input
        type="file"
        className="hidden"
        multiple={multiple}
        onChange={selectFiles}
        ref={ref}
        accept={accept === 'image' ? process.env.NEXT_PUBLIC_MIME_TYPE_ACCEPT : accept === 'file' ? process.env.NEXT_PUBLIC_FILE_TYPE_ACCEPT : ".jeg"}
      />

      { resizing && <p className="text-xs text-gray-600">{t("media.processing")}...</p> }

      <div className="grid grid-cols-2 gap-4 p-4">
        {
          uploadedFiles.length > 0 &&
            uploadedFiles.map((file, index) => (
              <div
                key={file.id || `file-${index}`}
                className="max-w-sm bg-it-50 border border-it-200 rounded-lg shadow overflow-hidden"
              >
                <div className="w-full h-64 relative">
                  {accept === 'image' && file.file_url ? (
                    <Image
                      className="rounded"
                      src={file.file_url}
                      alt={"image-" + index}
                      objectFit="scale-down"
                      fill
                    />
                  ) : (
                    <div key={`document-${file.id || `document-${index}`}`} className="aspect-square bg-it-200 flex items-center justify-center p-2">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{file.title || `document-${index}`}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute top-2 right-2 mt-2 mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                    onClick={() => handleDelete(index, accept)}
                    disabled={deletingFileId === file.id.toString()}
                  >
                    {deletingFileId === file.id.toString() ? (
                      <ButtonSpinner />
                    ) : (
                      <IconTrashTwentyFour />
                    )}
                  </button>
                </div>
              </div>
            ))
        }    
        {
          selectedFiles.length > 0 &&
            selectedFiles.map((file, index) => (
              <div
                key={`image-${index}`}
                className="w-full h-64 relative"
              >
                {
                  accept === 'image' && imagePreviews[index] ?                  
                  <Image
                    className="rounded"
                    src={imagePreviews[index]}
                    alt={"image-" + index}
                    objectFit="scale-down"
                    fill
                  />
                : 
                  <div key={`document-${index}`} className="aspect-square bg-it-200 flex items-center justify-center p-2">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{file.name || `document-${index}`}</span>
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
                      <p className="text-sm text-gray-600">{`${progressInfos[index].percentage}`}% {t("media.uploaded")}</p>
                      {message[index] === 'error' && <p className="text-xs text-red-600">{t("media.upload_failed")}</p>}
                      {message[index] === 'success' && <p className="text-xs text-green-600">{t("media.uploaded_successfully")}</p>}
                    </div>
                    {/* {
                      progressInfos[index].percentage === 100 &&
                      <button
                        type="button"
                        className="bg-transparent text-center hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-sm md:text-lg flex items-center justify-center w-full"
                        onClick={() => handleDelete(index, 'image')}
                      >
                        <IconTrashTwentyFour className="w-4 h-4 mr-2" />
                      </button>
                    } */}
                  </div>
                }
              </div>
            ))
        }
      </div>
      {
        ((isCover && uploadedFiles.length === 0) || !isCover) &&
          <button
            type="button"
            className="bg-transparent text-center hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-sm md:text-lg flex items-center justify-center w-full"
            onClick={handleClick}
          >
            <IconUploadTwentyFour className="w-4 h-4 mr-2" />
            {
              isCover ?
                <>{t('media.cover.button_upload')}</> :
                accept === 'image' ?
                <>{t('media.images.button_upload')}</> :
                accept === 'file' ? <>{t('media.files.button_upload')}</> :
                <></>
            }
          </button>
      }
    </div>
  );
};

export default MediaManager;