import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FileText, ArrowUpFromLine, Trash, LoaderCircle } from 'lucide-react';
import UploadService from "../services/FileUploadService";
import FileResizeService from "@/services/FileResizeService";
import { InstrumentImage, InstrumentFile, Instrument } from "@/lib/definitions";
import DraftService from "@/services/DraftService";

interface ProgressInfo {
  fileName: string;
  percentage: number;
}

type Accept = 'image' | 'file';

type FilesUploadProps = {
  multiple: boolean;
  instrument: Instrument,
  api_key: string,
  isCover: boolean,
  accept: Accept,
  onMediaChange?: (media: (InstrumentImage | InstrumentFile)[]) => void
}

export default function MediaManager({
  multiple,
  instrument,
  api_key,
  isCover,
  accept,
  onMediaChange
}: Readonly<FilesUploadProps>) {
  const t = useTranslations('components.MediaManager');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<(InstrumentImage | InstrumentFile)[]>([]);
  const [imagePreviews, setImagePreviews] = useState<Array<string>>([]);
  const [progressInfos, setProgressInfos] = useState<Array<ProgressInfo>>([]);
  const [message, setMessage] = useState<Array<string>>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [originalDescriptions, setOriginalDescriptions] = useState<string[]>([]);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [updatingFileId, setUpdatingFileId] = useState<string | null>(null);
  const [visibleDescriptions, setVisibleDescriptions] = useState<boolean[]>([]);
  const progressInfosRef = useRef<any>(null);
  const [resizing, setResizing] = useState<Boolean>(false);
  const ref = useRef<HTMLInputElement>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const uploadedFilesRef = useRef(uploadedFiles);
  uploadedFilesRef.current = uploadedFiles;
  const lastInstrumentIdRef = useRef<number | null>(null);

  // Initialize with existing media (only when instrument ID changes)
  useEffect(() => {
    if (instrument && instrument.id !== lastInstrumentIdRef.current) {
      lastInstrumentIdRef.current = instrument.id;
      
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
      setOriginalDescriptions(existingDescriptions);
      setVisibleDescriptions(existingDescriptions.map(desc => desc.trim().length > 0));
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

  const handleDelete = (fileId: number, type: string) => {
    setDeletingFileId(fileId.toString());

    UploadService.deleteFile(fileId, api_key)
      .then(() => {
        // Get current index from ref (always up-to-date)
        const currentFiles = uploadedFilesRef.current;
        const fileIndex = currentFiles.findIndex(f => f.id === fileId);
        
        if (fileIndex === -1) return;
        
        // All state updates at the same level (not nested) for proper React rendering
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        
        if (type === 'image') {
          setImagePreviews(prev => prev.filter((_, i) => i !== fileIndex));
        }
        setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
        setProgressInfos(prev => prev.filter((_, i) => i !== fileIndex));
        setMessage(prev => prev.filter((_, i) => i !== fileIndex));
        setDescriptions(prev => prev.filter((_, i) => i !== fileIndex));
        setOriginalDescriptions(prev => prev.filter((_, i) => i !== fileIndex));
        setVisibleDescriptions(prev => prev.filter((_, i) => i !== fileIndex));
      })
      .catch((err: any) => {
        alert(`Error deleting file ${fileId}`);
      })
      .finally(() => {
        setDeletingFileId(null);
      });
  }

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);

    // Adjust textarea height
    const textarea = textareaRefs.current[index];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Adjust textarea heights when visibility changes
  useEffect(() => {
    visibleDescriptions.forEach((isVisible, index) => {
      if (isVisible) {
        const textarea = textareaRefs.current[index];
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      }
    });
  }, [visibleDescriptions]);

  const handleUpdateDescription = async (index: number) => {
    const file = uploadedFiles[index];
    const newDescription = descriptions[index];
    
    if (file.id && newDescription !== originalDescriptions[index]) {
      setUpdatingFileId(file.id.toString());
      try {
        const response = await DraftService.updateFileDescription(file.id, newDescription);
        const { data: dataResponse } = response;
        const { data } = dataResponse;
        if (data.code === 'success') {
          const updatedFiles = [...uploadedFiles];
          if (updatedFiles[index]) {
            updatedFiles[index] = {
              ...updatedFiles[index],
              description: newDescription
            };
            setUploadedFiles(updatedFiles);
            
            // Update original descriptions
            const newOriginalDescriptions = [...originalDescriptions];
            newOriginalDescriptions[index] = newDescription;
            setOriginalDescriptions(newOriginalDescriptions);
          }
        }
      } catch (error) {
        console.log('updateFileDescription error', error);
      } finally {
        setUpdatingFileId(null);
      }
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
        setDescriptions(prev => [...prev, ...Array(files.length).fill('')]);
      }
    } else if (accept === 'file') {
      if (files) {
        setSelectedFiles(Array.from(files));
        setDescriptions(prev => [...prev, ...Array(files.length).fill('')]);
      }
    }

    setProgressInfos([]);
    setMessage([]);
  };

  // Use ref to access current descriptions without adding to dependencies
  const descriptionsRef = useRef(descriptions);
  descriptionsRef.current = descriptions;

  useEffect(()=> {
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
  
        // Add description to the uploaded file (use ref to get current value)
        const uploadedFile = {
          ...data.data,
          description: descriptionsRef.current[idx] || ''
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
  }, [selectedFiles, api_key, instrument.id, isCover]);

  const handleToggleDescription = (index: number) => {
    const newVisibleDescriptions = [...visibleDescriptions];
    newVisibleDescriptions[index] = !newVisibleDescriptions[index];
    setVisibleDescriptions(newVisibleDescriptions);
    
    // Focus the textarea after it becomes visible
    if (newVisibleDescriptions[index]) {
      setTimeout(() => {
        textareaRefs.current[index]?.focus();
      }, 0);
    }
  };

  return (
    <>
      <input
        type="file"
        className="hidden"
        multiple={multiple}
        onChange={selectFiles}
        ref={ref}
        accept={accept === 'image' ? process.env.NEXT_PUBLIC_MIME_TYPE_ACCEPT : accept === 'file' ? process.env.NEXT_PUBLIC_FILE_TYPE_ACCEPT : ".jeg"}
      />

      { resizing && 
        <div className="flex items-center pb-4">
          <LoaderCircle className="w-4 h-4 animate-spin mr-1" />
          <p className="text-xs text-scope-700">{t('processing')}</p>
        </div>
      }

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(10rem,100%),1fr))] gap-3 mb-6">
        {
          uploadedFiles.length > 0 &&
            uploadedFiles.map((file, index) => (
              <div
                key={file.id || `file-${index}`}
                className="bg-scope-50 border border-scope-200 rounded-button overflow-hidden"
              >
                <div className="relative">
                  {accept === 'image' && file.base_url ? (
                    <Image
                      className="w-full h-auto"
                      src={`${file.base_url}${(file as InstrumentImage).sizes.large?.file || (file as InstrumentImage).sizes.original.file}`}
                      alt={"image-" + index}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <div key={`document-${file.id || `document-${index}`}`} className="aspect-square text-scope-950 bg-scope-50 border border-scope-100 flex items-center justify-center p-2">
                      <FileText className="w-4 h-4 mr-2" />hallo
                      <span>{file.title || `document-${index}`}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-2 hover:bg-red-600 text-white font-bold p-1 rounded-full aspect-square bg-black bg-opacity-30"
                    onClick={() => handleDelete(file.id, accept)}
                    disabled={deletingFileId === file.id.toString()}
                    title={t('images.delete_image')}
                    aria-label={t('images.delete_image')}
                  >
                    {deletingFileId === file.id.toString() ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {
                  !isCover &&
                  <div className="grid grid-rows">
                    {!visibleDescriptions[index] ? (
                      <div className="p-2">
                        <button
                          type="button"
                          className="border-[0.1rem] border-scope-400 py-1 px-2 text-xs font-bold text-scope-500 hover:text-scope-900 hover:bg-scope-500 hover:border-scope-500"
                          onClick={() => handleToggleDescription(index)}
                        >
                          {t('images.add_description')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <textarea
                          ref={el => {
                            textareaRefs.current[index] = el;
                          }}
                          className="text-us-400 focus:text-us-900 w-full p-2 border-none focus:outline-none min-h-[30px] bg-transparent focus:bg-white text-sm resize-none overflow-hidden"
                          placeholder={accept === 'image' ? t('images.text_area_placeholder') : t('files.text_area_placeholder')}
                          value={descriptions[index]}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          rows={1}
                        />
                        {descriptions[index] !== originalDescriptions[index] && (
                          <div className="p-2">
                            <button
                              type="button"
                              className="border-[0.1rem] border-scope-400 py-1 px-2 text-xs font-bold text-scope-500 hover:text-scope-900 hover:bg-scope-500 hover:border-scope-500"
                              onClick={() => handleUpdateDescription(index)}
                              disabled={updatingFileId === file.id.toString()}
                            >
                              {updatingFileId === file.id.toString() ? (
                                <LoaderCircle className="w-4 h-4 animate-spin text-it-500" />
                              ) : (
                                t('images.save_description')
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                }
              </div>
            ))
        }    
        {
          selectedFiles.length > 0 &&
            selectedFiles.map((file, index) => (
              <div
                key={`image-${index}`}
                className="bg-scope-50 border border-scope-200 rounded-button shadow overflow-hidden"
              >
                <div className="relative">
                  {
                    accept === 'image' && imagePreviews[index] ?                  
                    <>
                      <Image
                        className="w-full h-auto opacity-75"
                        src={imagePreviews[index]}
                        alt={"image-" + index}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ objectFit: 'contain' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <LoaderCircle className="w-8 h-8 animate-spin text-white" />
                      </div>
                    </>
                  : 
                    <div key={`document-${index}`} className="aspect-square text-scope-950 bg-scope-100 flex items-center justify-center p-2">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{file.name || `document-${index}`}</span>
                    </div>
                  }
                </div>
                <div>
                {
                  progressInfos &&
                  progressInfos.length > 0 &&
                    <div className="space-y-2">
                      <div className="h-[3px] bg-it-200 w-full">
                        <div 
                          className="h-[3px] bg-it-600 transition-all duration-300"
                          style={{ width: `${progressInfos[index].percentage}%` }}>
                        </div>
                      </div>
                      {message[index] === 'error' && <p className="text-xs text-red-600">{t("progress.upload_failed")}</p>}
                      {/* {message[index] === 'success' && <p className="text-xs text-green-600">{t("progress.upload_success")}</p>} */}
                    </div>
                }
                </div>
              </div>
            ))
        }
      </div>
      {
        ((isCover && uploadedFiles.length === 0) || !isCover) &&
        <div className="flex justify-center px-3">
          <button
            type="button"
            className="
              text-scope-500 bg-transparent border-[0.1rem] border-scope-300 text-center py-2 px-4 text-base flex items-center justify-center w-full
              hover:bg-scope-500 hover:text-scope-1000 hover:border-scope-500"
            onClick={handleClick}
          >
            <ArrowUpFromLine className="w-4 h-4 mr-2" />
            {
              isCover ?
              <>{t('cover.button_upload')}</> :
              accept === 'image' ?
              <>{t('images.button_upload')}</> :
              accept === 'file' ? <>{t('files.button_upload')}</> :
              <></>
            }
          </button>
        </div>
      }
    </>
  );
};
