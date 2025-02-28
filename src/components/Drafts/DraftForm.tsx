"use client";

import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import NotConnected from "@/components/NotConnected";
import Page from "@/components/Page";
import Section from "@/components/Section";
import IconUploadTwentyFour from "@/components/Icons/Upload"
import IconTrashTwentyFour from "@/components/Icons/Trash"
import { FileText, Trash, ChevronDown } from 'lucide-react';

import { Instrument, InstrumentFile, InstrumentImage } from "@/lib/definitions";
import { useRouter } from "@/i18n/routing";
import Loading from "../Loading";
import ProgressBar from "../UI/ProgressBar"
import ButtonSpinner from "../UI/ButtonSpinner"
import FormSaveButton from "../UI/FormSaveButton"
import Divider from "../UI/Divider"

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

// Add this type definition at the top of the file
type ProgressStep = 1 | 2 | 3 | 4;

export default function DraftForm(
  { locale, instrumentId }: Readonly<{ locale: string, instrumentId?: string }>
) {
  const t = useTranslations('components.DraftForm');
  const router = useRouter();
  const { minter, setReloadUser, address: minterAddress } = useStateContext()

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<string>("")
  const [instrumentTypes, setInstrumentTypes] = useState([])
  const [instrument, setInstrument] = useState<Instrument>()
  const [inputValue, setInputValue] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const [cover, setCover] = useState<File>()
  const [coverFile, setCoverFile] = useState<File>()
  const [coverDescription, setCoverDescription] = useState<string>('')

  const [images, setImages] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([])

  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [documentDescriptions, setDocumentsDescriptions] = useState<string[]>([])

  const [error, setError] = useState<string | null>(null)
  const refCover = useRef<HTMLInputElement>(null)
  const refImage = useRef<HTMLInputElement>(null)
  const refDocument = useRef<HTMLInputElement>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  // Add new state for tracking progress
  const [currentStep, setCurrentStep] = useState<ProgressStep>(1);
  const [completed, setCompleted] = useState(false);

  // Regular declaration - placed after state declarations
  const minImages = 2;
  const hasMediaUploads = instrument ? !!(instrument.cover_image && instrument.images.length >= minImages) : false;
  const hasDescription = instrument ? instrument.description && instrument.description.trim().length > 0 : false;

  // Add useEffect to handle step transitions
  useEffect(() => {
    if (!instrument) {
      setCurrentStep(1);
      setCompleted(false);
    } else if (instrument) {
      if (hasMediaUploads && hasDescription) {
        setCurrentStep(4);
        setCompleted(true);
      } else if (hasMediaUploads) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    }
  }, [instrument, hasMediaUploads, hasDescription]);

  // Add handler for step changes
  const handleStepChange = (step: number) => {
    if (step === 1) {
      // Can't go back to step 1 if instrument exists
      if (!instrument) {
        setCurrentStep(1);
        setCompleted(false);
      }
    } else if (step === 2) {
      if (instrument) {
        setCurrentStep(2);
        setCompleted(false);
      }
    } else if (step === 3) {
      if (instrument && (instrument.cover_image || instrument.images.length > 0 || instrument.files.length > 0)) {
        setCurrentStep(3);
        setCompleted(false);
      }
    } else if (step === 4) {
      if (instrument && instrument.description) {
        setCurrentStep(4);
        setCompleted(true);
        router.push(`/preview/${instrument.id}`);
      }
    }
  };

  // Fetch instrument details and associated files/images when instrumentId changes
  useEffect(() => {
    const getInstrument = async () => {
      try {
        const result = await fetch(`/api/instrument/${instrumentId}?locale=${locale}`, {
          method: "GET",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        })
        const { data } = await result.json()
        // console.log("GET", `/api/instrument/${instrumentId}`, data.data);

        if (data.code !== 'success') {
          // console.log(`GET /api/instrument/${instrumentId} ERROR`, data.message);
          alert(`Error: ${data.message}`);
        } else {
          setName(data.data.title);
          setDescription(data.data.description);
          const imageIds = data.data.images;
          const fileIds = data.data.files;
          const coverId = data.data.cover_image;

          if (imageIds && imageIds.length > 0) {
            const sorted = imageIds
              .filter((id: number) => id !== coverId)
              .sort((ida: number, idb: number) => ida > idb ? 1 : -1);
            const _images: InstrumentImage[] = await Promise.all(
              sorted.map(async (imgId: number) => {
                const result = await fetch(`/api/file/${imgId}`, {
                  method: "GET",
                  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                })
                const { data: imageData } = await result.json()
                if (imageData.code !== 'success') {
                  console.log(`GET /api/file/${imgId} ERROR`, imageData.message);
                  return ({
                    id: imgId,
                    file_url: data.data.placeholder_image,
                    description: 'Image not found'
                  })
                } else {
                  return imageData.data;
                }
              })
            ) || [];

            data.data.images = _images;
          }

          if (fileIds && fileIds.length > 0) {
            const sorted = fileIds.sort((ida: number, idb: number) => ida > idb ? 1 : -1);
            const files: InstrumentFile[] = await Promise.all(
              sorted.map(async (fileId: number) => {
                const result = await fetch(`/api/file/${fileId}`, {
                  method: "GET",
                  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
                })
                const { data: fileData } = await result.json()
                if (fileData.code !== 'success') {
                  console.log(`GET /api/file/${fileId} ERROR`, fileData.message);
                  return ({
                    id: fileId,
                    file_url: "/images/icons/android-chrome-512x512.png",
                    description: 'File not found'
                  })
                } else {
                  return fileData.data;
                }
              })
            ) || [];

            data.data.files = files;
          }

          if (coverId) {
            const result = await fetch(`/api/file/${coverId}`, {
              method: "GET",
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            })
            const { data: imageData } = await result.json()
            if (imageData.code !== 'success') {
              console.log(`GET /api/file/${coverId} ERROR`, imageData.message);
            } else {
              data.data.cover_image = imageData.data;
            }
          }
          setInstrument(data.data);
        }
      } catch (error: any) {
        console.log(`POST /api/instrument/${instrumentId} ERROR`, error.message)
        alert(`Error: ${error.message}`);
      }
    }
    if (instrumentId && !instrument) {
      getInstrument();
    }
  }, [instrumentId, instrument]);

  // Update instrument types based on minter skills and instrument type
  useEffect(() => {
    if (minter) {
      const minterSkillsConstruction = minter && minter.skills
        .filter((s: any) => s.slug.includes('construction'))
        .map((s: any) => s.slug.split('-construction')[0]) || [];

      const minterInstrumentTypes = minter.instrument_types ?
        minter.instrument_types
          .map((ins: any) => ({ value: ins.name, label: ins.name, category: ins.slug }))
          .filter((ins: any) => minterSkillsConstruction.includes(ins.category)) :
        [];

      setInstrumentTypes(minterInstrumentTypes);

      if (instrument && instrument.type) {
        const instrumentType = minterInstrumentTypes.find((i: any) => i.category === instrument?.type);
        if (instrumentType) {
          setType(instrumentType.value);
        }
      }
    }
  }, [minter, instrument]);

  // Handle description change
  const handleDescriptionChange = (markdown: string) => {
    setDescription(markdown)
  }

  // Handle cover click
  const handleCoverClick = () => {
    refCover.current?.click();
  }

  // Handle images click
  const handleImagesClick = () => {
    refImage.current?.click();
  }

  // Handle documents click
  const handleDocumentClick = () => {
    refDocument.current?.click();
  }

  // Handle cover change
  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length === 1) {
      const _files = Array.from(files);
      setCoverFile(_files[0] as File);
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCover(reader.result as unknown as File);
        setCoverDescription(() => '');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const _files = Array.from(files);
      setImageFiles((prevFiles: any) => [...prevFiles, _files[0] as File]);
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages: any) => [...prevImages, reader.result as string]);
        setImageDescriptions((prevDescriptions: any) => [...prevDescriptions, '']);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle current file delete
  const handleCurrentFileDelete = async (id: number) => {
    setIsLoadingMetadata(true);
    try {
      await fetch(`/api/file/${id}`, { method: "DELETE" });
    } catch (error) {
      console.log("DELETE /api/file error", error)
    }
    setIsLoadingMetadata(false);
    setReloadUser(true);
    setInstrument(undefined);
  };

  // Handle cover delete
  const handleCoverDelete = async () => {
    setCoverFile(undefined);
    setCover(undefined);
    setCoverDescription('');
  };

  // Handle image delete
  const handleImageDelete = async (index: number) => {
    setImageFiles((prevFiles: any) => prevFiles.filter((_: any, i: any) => i !== index));
    setImages((prevImages: any) => prevImages.filter((_: any, i: any) => i !== index));
    setImageDescriptions((prevDescriptions: any) => prevDescriptions.filter((_: any, i: any) => i !== index));
  };

  // Handle document delete
  const handleDocumentDelete = async (index: number) => {
    setDocumentFiles((prevFiles: any) => prevFiles.filter((_: any, i: any) => i !== index));
    // setDocuments((prevImages: any) => prevImages.filter((_: any, i: any) => i !== index));
    setDocumentsDescriptions((prevDescriptions: any) => prevDescriptions.filter((_: any, i: any) => i !== index));
  };

  // Handle cover description change
  const handleCoverDescriptionChange = (value: string) => {
    setCoverDescription(value);
  };

  // Handle image description change
  const handleImageDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...imageDescriptions];
    newDescriptions[index] = value;
    setImageDescriptions(newDescriptions);
  };

  // Handle document change
  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const _files = Array.from(files);
      setDocumentFiles((prevFiles: File[]) => [...prevFiles, _files[0] as File]);
      setDocumentsDescriptions((prevDescriptions: any) => [...prevDescriptions, '']);
    }
  };

  // Handle document description change
  const handleDocumentDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...documentDescriptions];
    newDescriptions[index] = value;
    setDocumentsDescriptions(newDescriptions);
  };

  // Update instrument description
  const updateDescription = async (e: any) => {
    e.preventDefault()

    setIsLoadingMetadata(true)
    if (description) {
      try {
        const result = await fetch(`/api/instrument/${instrumentId}`, {
          method: "POST",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: description || "" })
        })
        const { data } = await result.json()

        // console.log("POST", `/api/instrument/${instrumentId}`, data);

        if (data.code !== 'success') {
          console.log(`POST /api/instrument/${instrumentId} ERROR`, data.message);
          alert(`Error: ${data.message}`);
        } else {
          setReloadUser(true);
          setInstrument(undefined);
        }
      } catch (error: any) {
        console.log(`POST /api/instrument/${instrumentId} ERROR`, error.message)
        alert(`Error: ${error.message}`);
      }
    }
    setIsLoadingMetadata(false)
  }

  // Create new instrument
  const createInstrument = async (e: any) => {
    e.preventDefault()
    setIsLoadingMetadata(true)
    if (type && name && !instrumentId) {
      const selected: any = instrumentTypes.find((i: any) => i.label === type);
      if (!selected) {
        setIsLoadingMetadata(false)
        return;
      }
      try {
        const result = await fetch(`/api/instrument`, {
          method: "POST",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: minter.user_id, type: selected.category, name })
        })
        const { data } = await result.json()

        if (data.code === 'success') {
          if (data.data) {
            setReloadUser(true);
            setInstrument(undefined);
            router.replace(`/drafts/${data.data.id}`);
          }
        } else {
          console.log("POST /api/instrument ERROR", data.message);
          alert(`Error: ${data.message}`);
        }
      } catch (error: any) {
        console.log("POST /api/instrument ERROR", error)
        alert(`Error: ${error.message}`);
      }
    }
    setIsLoadingMetadata(false)
  }

  // Upload cover
  const uploadCover = async (e: any) => {
    e.preventDefault()
    if (instrumentId && coverFile) {
      const formData = new FormData();
      formData.append("instrument_id", instrumentId);
      formData.append("description", coverDescription);
      formData.append("cover_image", "true");
      formData.append("file", coverFile);
      try {
        const result = await fetch(`/api/file`, {
          method: "POST",
          body: formData
        })
        const { data } = await result.json();
        if (data.code !== 'success') {
          console.log("POST /api/file ERROR", data.message);
          alert(`Error: ${data.message}`);
        }
      } catch (error: any) {
        console.log("POST /api/file POST error", error);
        alert(`Error: ${error.message}`);
      }
    }
    setCover(undefined);
    setCoverFile(undefined);
    setCoverDescription('');
  }

  // Upload images
  const uploadImages = async (e: any) => {
    e.preventDefault()
    if (instrumentId && imageFiles.length) {
      for (let index = 0; index < imageFiles.length; index++) {
        const formData = new FormData();
        formData.append("instrument_id", instrumentId);
        const file = imageFiles[index];
        formData.append("description", imageDescriptions[index]);
        formData.append("file", file);
        try {
          const result = await fetch(`/api/file`, {
            method: "POST",
            body: formData
          })
          const { data } = await result.json();
          if (data.code !== 'success') {
            console.log("POST /api/file ERROR", data.message);
            alert(`Error: ${data.message}`);
          }
        } catch (error: any) {
          console.log("POST /api/file POST error", error);
          alert(`Error: ${error.message}`);
        }
      }
    }
    setImages([]);
    setImageFiles([]);
    setImageDescriptions([]);
  }

  // Upload documents
  const uploadDocuments = async (e: any) => {
    e.preventDefault()
    if (instrumentId && documentFiles.length) {
      for (let index = 0; index < documentFiles.length; index++) {
        const formData = new FormData();
        formData.append("instrument_id", instrumentId);
        const file = documentFiles[index];
        formData.append("description", documentDescriptions[index]);
        formData.append("file", file);
        try {
          const result = await fetch(`/api/file`, {
            method: "POST",
            body: formData
          })
          const { data } = await result.json();
          if (data.code !== 'success') {
            console.log("POST /api/file ERROR", data.message);
            alert(`Error: ${data.message}`);
          }
        } catch (error: any) {
          console.log("POST /api/file POST error", error);
          alert(`Error: ${error.message}`);
        }
      }
    }
    setDocumentFiles([]);
    setDocumentsDescriptions([]);
  }

  // Handle instrument delete
  const handleInstrumentDelete = async () => {
    setIsLoadingMetadata(true);
    try {
      await fetch(`/api/instrument/${instrumentId}`, { method: "DELETE" });
    } catch (error) {
      console.log("POST /api/instrument DELETE error", error)
    }
    setIsLoadingMetadata(false);
    setReloadUser(true);
    // setInstrument(undefined);
    router.push(`/`)
  };

  // Render loading state if instrumentId exists but instrument is not loaded
  if (instrumentId && !instrument) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  // console.log(instrument);

  // // console.log("cover_image", instrument?.cover_image);
  // console.log("images", instrument?.images);
  // console.log("imageFiles", imageFiles);
  // console.log("files", instrument?.files);

  return (
    minter ?
      <Page>

        <Section id="progress-bar">
          <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-it-50 rounded-[15px] border border-it-200 overflow-hidden">
            <div className="w-full mx-auto mb-4 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {
                    instrument ?
                      <>
                        {hasMediaUploads && description ? (
                          <>
                            <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('title.ready_to_register')}</h2>
                            <p className="text-sm sm:text-base text-gray-600">{t('title.ready_to_register_sub')}</p>
                          </>
                        ) : (
                          <>
                            <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('title.edit')} #{instrument.id} </h2>
                            <p className="text-sm sm:text-base text-gray-600">{t('title.edit_sub_heading')}</p>
                          </>
                        )}
                      </>
                      : <>
                        <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('title.new')}</h2>
                        <p className="text-sm sm:text-base text-gray-600">{t('title.new_sub_heading')}</p>
                      </>
                  }
                </div>
              </div>
            </div>

            <ProgressBar
              currentStep={currentStep}
              onStepChange={handleStepChange}
              completed={completed}
              onCompletedChange={setCompleted}
            />

          </div>
          <div>
            {
              instrument &&
              hasMediaUploads &&
              (instrument.description === description) && description &&
              <div className="text-right mt-6">
                <FormSaveButton
                  disabled={isLoadingMetadata}
                  onClick={() => router.push(`/preview/${instrument.id}`)}
                  isLoading={isLoadingMetadata}
                  theme="green"
                >
                  {t('preview')}
                </FormSaveButton>
              </div>
            }
          </div>
        </Section>

        <form className="">
          <Section id="basic-info" className="pb-[3px]">
            <div className="px-3 sm:px-6 pt-5 pb-6 sm:py-8 || bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-1000 pb-8">
                {t('basic_info.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 sm:gap-6">
                <div>
                  <label htmlFor="type" className="block text-md font-semibold text-gray-1000 pb-1">
                    {t('basic_info.type.label')}
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => instrument?.type ? null : setOpen(!open)}
                      className={`bg-white text-md p-2 flex border border-gray-200 items-center justify-between rounded-md ${!type && "text-gray-700"} ${!instrument?.type && "cursor-pointer"}`}
                    >
                      {type ? type : t('basic_info.type.placeholder')}
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                    <ul className={`absolute z-10 top-0 w-full bg-white rounded-md border border-it-300 overflow-y-auto ${open ? "max-h-60 shadow-sm" : "max-h-0 invisible"} `}>
                      <div className="flex items-center px-2 sticky top-0 bg-white">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                          placeholder={t('basic_info.type.input_placeholder')}
                          className="placeholder:text-gray-300 py-2 outline-none"
                          disabled={instrument?.type ? true : false}
                        />
                      </div>
                      {instrumentTypes?.length && instrumentTypes.map((ins: any) => (
                        <li
                          key={ins?.label}
                          className={`p-2 text-md hover:bg-it-50 hover:text-it-950 cursor-pointer
                              ${ins?.value?.toLowerCase() === type?.toLowerCase() && "bg-it-300 text-it-950 hover:bg-it-400"}
                              ${ins?.value?.toLowerCase().startsWith(inputValue) ? "block" : "hidden"}`}
                          onClick={() => {
                            setOpen(false);
                            if (ins?.value?.toLowerCase() !== type.toLowerCase()) {
                              setType(ins?.value)
                            }
                          }}
                        >
                          {ins?.label}
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-600 pt-2">
                      {t('basic_info.type.description')} 
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <label htmlFor="name" className="block text-md font-semibold text-gray-1000 pb-1">
                    {t('basic_info.name.label')}
                  </label>
                  <input
                    name="name"
                    className={`text-md block w-full px-2 py-2 text-it-950 border rounded-md focus:border-it-400 focus:ring-it-300 focus:outline-none focus:ring focus:ring-opacity-40 dark:bg-white dark:bg-opacity-90 ${instrument?.title ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    onChange={(e) => { setName(e.target.value) }}
                    value={name}
                    disabled={instrument?.title ? true : false}
                  />
                  <p className="text-sm text-gray-600 pt-2">
                    {t('basic_info.name.description')}
                  </p>
                </div>
              </div>
              {!instrumentId && (
                <div className="mt-4 text-right">
                  <FormSaveButton
                    disabled={isLoadingMetadata || !type || !name}
                    onClick={(e) => createInstrument(e)}
                    isLoading={isLoadingMetadata}
                  >
                    {t('basic_info.button')}
                  </FormSaveButton>
                </div>
              )}
            </div>
          </Section>
          {instrument &&
            <>
              <Section id="media" className="pb-[3px]">
                <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                    <div className="col-span-1 min-h-[300px]">
                      <h2 className="text-xl font-semibold text-gray-1000 pb-1">
                        {t('media.cover.title')}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {t('media.cover.description')}
                      </p>
                      <div className="mt-4">
                        <>
                          <div className="flex flex-col">
                            <input
                              type="file"
                              accept={process.env.NEXT_PUBLIC_MIME_TYPE_ACCEPT || ""}
                              id="cover"
                              name="cover"
                              multiple={false}
                              ref={refCover}
                              className="hidden"
                              onChange={handleCoverChange}
                            />
                            {/* Show saved cover image with description */}
                            {!cover && instrument.cover_image && instrument.cover_image.file_url &&
                              <div
                                key={instrument.cover_image.id}
                                className="max-w-sm bg-it-50 border border-it-200 rounded-lg shadow overflow-hidden"
                              >
                                <div className="relative overflow-hidden text-ellipsis">
                                  <img className="" src={instrument.cover_image.file_url} alt={instrument.cover_image.description} />
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 mt-2 mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                                    onClick={() => handleCurrentFileDelete(instrument.cover_image.id)}
                                  >
                                    <IconTrashTwentyFour />
                                  </button>
                                </div>
                                <div className="w-full p-2 border-none focus:outline-none">
                                  {instrument.cover_image.description}
                                </div>
                              </div>
                            }
                            {/* Show selected cover image with description textarea. Not saved yet. */}
                            {!!cover &&
                              <div
                                key={'cover'}
                                className="max-w-sm bg-white border border-gray-200 rounded-lg overflow-hidden"
                              >
                                <div className="relative overflow-hidden text-ellipsis border-b border-gray-100">
                                  <img className="" src={cover as any} alt="" />
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                                    onClick={() => handleCoverDelete()}
                                  >
                                    <IconTrashTwentyFour />
                                  </button>
                                </div>
                                <textarea
                                  className="w-full p-2 border-none focus:outline-none min-h-[100px]"
                                  placeholder={t('media.cover.text_area_placeholder')}
                                  value={coverDescription}
                                  onChange={(e) => handleCoverDescriptionChange(e.target.value)}
                                />
                              </div>
                            }
                            {/* Show upload button if there is no cover image in instrument (not saved yet) */}
                            {(!instrument.cover_image && !cover) &&
                              <button
                                type="button"
                                className="bg-transparent text-center mt-2 hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-sm md:text-lg flex items-center justify-center"
                                onClick={handleCoverClick}
                              >
                                <IconUploadTwentyFour className="w-4 h-4 mr-2" />
                                {t('media.cover.button_upload')}
                              </button>
                            }
                          </div>
                          {error && <p className="text-red-500">{error}</p>}
                        </>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 min-h-[300px]">
                      <div className="md:hidden">
                        <Divider spacing="md" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-1000 pb-1" >
                        {t('media.images.title_with_min', { min: minImages })}
                      </h2>
                      <p className="text-sm text-gray-600 max-w-sm">
                        {t('media.images.description')}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6 mt-4">
                        <input
                          type="file"
                          accept={process.env.NEXT_PUBLIC_MIME_TYPE_ACCEPT || ""}
                          id="images"
                          name="images"
                          multiple={true}
                          ref={refImage}
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        {(instrument.images.length > 0 || images.length > 0) && (
                          <>
                            {/* Show saved images with description */}
                            {instrument.images.length > 0 && instrument.images[0] &&
                              instrument.images.map((img: InstrumentImage, index: number) => (
                                <div
                                  key={img.id}
                                  className="max-w-sm bg-it-50 border border-it-200 rounded-lg shadow overflow-hidden"
                                >
                                  <div className="relative overflow-hidden text-ellipsis">
                                    <img className="" src={img.file_url} alt={img.description} />
                                    <button
                                      type="button"
                                      className="absolute top-2 right-2 mt-2 mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                                      onClick={() => handleCurrentFileDelete(img.id)}
                                    >
                                      <IconTrashTwentyFour />
                                    </button>
                                  </div>
                                  <div className="w-full p-2 border-none focus:outline-none">
                                    {img.description}
                                  </div>
                                </div>
                              ))
                            }
                            {/* Show selected images with description textarea. Not saved yet. */}
                            {images.length > 0 && images.map((img: any, index: number) => (
                              <div
                                key={index.toString()}
                                className="max-w-sm bg-white border border-gray-200 rounded-lg overflow-hidden shadow dark:bg-gray-800 dark:border-gray-700 text-center"
                              >
                                <div className="relative overflow-hidden text-ellipsis border-b border-gray-100">
                                  <img className="" src={img} alt="" />
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 mt-2 mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                                    onClick={() => handleImageDelete(index)}
                                  >
                                    <IconTrashTwentyFour />
                                  </button>
                                </div>
                                <textarea
                                  className="w-full p-2 border-none focus:outline-none min-h-[100px]"
                                  placeholder={t('media.images.text_area_placeholder')}
                                  value={imageDescriptions[index]}
                                  onChange={(e) => handleImageDescriptionChange(index, e.target.value)}
                                />
                              </div>
                            ))}
                          </>
                        )}
                        <div className="">
                          {/* Upload button */}
                          <button
                            type="button"
                            className="bg-transparent text-center hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-sm md:text-lg flex items-center justify-center w-full"
                            onClick={handleImagesClick}
                          >
                            <IconUploadTwentyFour className="w-4 h-4 mr-2" />
                            {t('media.images.button_upload')}
                          </button>
                          {error && <p className="text-red-500">{error}</p>}
                        </div>
                      </div>

                      <Divider spacing="md" />

                      <h2 className="text-xl font-semibold text-gray-1000 pb-1">
                        {t('media.files.title')}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {t('media.files.description')}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6 mt-4">
                        <input
                          type="file"
                          accept={process.env.NEXT_PUBLIC_FILE_TYPE_ACCEPT || ""}
                          id="files"
                          name="files"
                          multiple={true}
                          ref={refDocument}
                          className="hidden"
                          onChange={handleDocumentChange}
                        />
                        {(instrument.files.length > 0 || documentFiles.length > 0) && (
                          <>
                            {/* Show saved files with description */}
                            {instrument && instrument.files.length > 0 &&
                              instrument.files.map((file: InstrumentFile, index: number) => (
                                <div
                                  key={`F${index.toString()}`}
                                  className="max-w-sm bg-it-50 border border-it-200 rounded-lg overflow-hidden shadow"
                                >
                                  <div className="relative overflow-hidden text-ellipsis">
                                    <div className="aspect-square bg-it-200 flex items-center justify-center p-2">
                                      <FileText className="w-4 h-4 mr-2" />
                                      <span>{file.title}</span>
                                    </div>
                                    <button
                                      type="button"
                                      className="absolute top-2 right-2 mt-2 mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                                      onClick={() => handleCurrentFileDelete(file.id)}
                                    >
                                      <IconTrashTwentyFour />
                                    </button>
                                  </div>
                                  <div className="w-full p-2 border-none focus:outline-none">
                                    {file.description}
                                  </div>
                                </div>
                              ))
                            }
                            {/* Show selected files with description textarea. Not saved yet. */}
                            {!!documentFiles.length && documentFiles.map((file: any, index: number) => (
                              <div
                                key={`D${index.toString()}`}
                                className="max-w-sm bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                              >
                                <div className="relative overflow-hidden text-ellipsis">
                                  <div className="aspect-square flex items-center justify-center p-2">
                                    <FileText className="w-4 h-4 mr-2" />
                                    <span className="text-center">{file.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    className="absolute top-2 right-2 mt-2 mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                                    onClick={() => handleDocumentDelete(index)}
                                  >
                                    <IconTrashTwentyFour />
                                  </button>
                                </div>
                                <textarea
                                  className="w-full p-2 border-none focus:outline-none min-h-[100px]"
                                  placeholder={t('media.files.text_area_placeholder')}
                                  value={documentDescriptions[index]}
                                  onChange={(e) => handleDocumentDescriptionChange(index, e.target.value)}
                                />
                              </div>
                            ))}
                          </>
                        )}
                        <div className="">
                          <button
                            type="button"
                            className="bg-transparent text-center hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-sm md:text-lg flex items-center justify-center"
                            onClick={handleDocumentClick}
                          >
                            <IconUploadTwentyFour className="w-4 h-4 mr-2" />
                            {t('media.files.button_upload')}
                          </button>
                          {error && <p className="text-red-500">{error}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-right">
                  {/* Upload/Save cover image. Check also name and type are set. */}
                  {
                    <FormSaveButton
                      disabled={
                        isLoadingMetadata || 
                        !type || 
                        !name || 
                        (!cover && !instrument?.cover_image) || 
                        (images.length + (instrument?.images?.length || 0) < minImages)
                      }
                      onClick={(e) => {
                        setIsLoadingMetadata(true);
                        if (cover) uploadCover(e);
                        if (images.length > 0) uploadImages(e);
                        if (documentFiles.length > 0) uploadDocuments(e);
                        setTimeout(() => {
                          setIsLoadingMetadata(false);
                          setReloadUser(true);
                          setInstrument(undefined);
                        }, 1000);
                      }}
                      isLoading={isLoadingMetadata}
                    >
                      {t('media.save')}
                    </FormSaveButton>
                  }
                </div>
                </div>
              </Section>
            </>
          }

          {instrument &&
            hasMediaUploads &&
            <Section id="description">
              <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-gray-50 rounded-b-lg">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-1000 pb-1">
                    {t('details.title')}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t('details.description')}
                  </p>
                  <div className="p-0 mt-4 border border-gray-200 bg-white rounded-md">
                    <Editor markdown={description} updateDescription={handleDescriptionChange} />
                  </div>
                </div>
                {/* If saved description is different from the description in the editor, show save button */}
                <div className="mt-6 text-right">
                  <FormSaveButton
                    disabled={
                      isLoadingMetadata || 
                      !hasMediaUploads || 
                      !description || 
                      description === instrument.description
                    }
                    onClick={(e) => updateDescription(e)}
                    isLoading={isLoadingMetadata}
                  >
                    {t('details.button_save')}
                  </FormSaveButton>
                </div>
              </div>
              {/* If description is saved and there are media uploads, show preview button */}
              <div className="mt-6 text-right">
                <FormSaveButton
                  disabled={
                    isLoadingMetadata || 
                    !hasMediaUploads || 
                    !description || 
                    description !== instrument.description || 
                    images.length > 0 || 
                    documentFiles.length > 0
                  }
                  onClick={() => router.push(`/preview/${instrument.id}`)}
                  isLoading={isLoadingMetadata}
                  theme="green"
                >
                  {t('preview')}
                </FormSaveButton>
              </div>

            </Section>
          }
        </form>

        <Section id="delete">
          {instrument &&
            <div className="mt-6 text-left">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform text-red-500 border border-red-500 bg-transparent rounded-md hover:bg-red-500 hover:text-white focus:outline-none focus:bg-red-700 disabled:opacity-25"
                disabled={isLoadingMetadata}
                onClick={() => handleInstrumentDelete()}
              >
                <Trash className="inline-block w-4 h-4 mr-2 -mt-0.5" />
                {isLoadingMetadata && <ButtonSpinner />}
                {t('delete')}
              </button>
            </div>
          }
        </Section>

      </Page> :
      <NotConnected locale={locale} />
  );
}
