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
import { Instrument, InstrumentFile, InstrumentImage } from "@/lib/definitions";
import { useRouter } from "@/i18n/routing";
import Loading from "../Loading";
import ProgressBar from "../ui/ProgressBar";
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

// Add this type definition at the top of the file
type ProgressStep = 1 | 2 | 3 | 4;

export default function DraftForm(
  { locale, instrumentId }: Readonly<{ locale: string, instrumentId?: string }>
) {
  const t = useTranslations();
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

  // Add useEffect to handle step transitions
  useEffect(() => {
    if (!instrument) {
      setCurrentStep(1);
      setCompleted(false);
    } else if (instrument) {
      const hasMediaUploads = !!(instrument.cover_image || instrument.images.length > 0 || instrument.files.length > 0);
      const hasDescription = !!instrument.description;
      
      if (hasMediaUploads && hasDescription) {
        setCurrentStep(4);
        setCompleted(true);
      } else if (hasMediaUploads) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    }
  }, [instrument]);

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
    setCoverFile(() => undefined);
    setCover(() => undefined);
    setCoverDescription(() => '');
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
    setIsLoadingMetadata(true);

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
    setIsLoadingMetadata(false);
    setReloadUser(true);
    setInstrument(undefined);
  }

  // Upload images
  const uploadImages = async (e: any) => {
    e.preventDefault()
    setIsLoadingMetadata(true);

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
    setIsLoadingMetadata(false);
    setReloadUser(true);
    setImages([]);
    setImageFiles([]);
    setImageDescriptions([]);
    setInstrument(undefined);
  }

  // Upload documents
  const uploadDocuments = async (e: any) => {
    e.preventDefault()
    setIsLoadingMetadata(true);

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
    setIsLoadingMetadata(false);
    setReloadUser(true);
    setDocumentFiles([]);
    setDocumentsDescriptions([]);
    setInstrument(undefined);
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
          <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-it-50 rounded-[15px] border border-it-200">
            {/* Header */}
            <div className="w-full mx-auto">
                {
                instrument ?
                  <>
                    <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('components.DraftForm.title.edit')} #{instrument.id} </h2>
                    <p className="text-sm sm:text-base text-gray-600">{t('components.DraftForm.title.edit_sub_heading')}</p>
                  </>
                : <>
                    <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('components.DraftForm.title.new')}</h2>
                    <p className="text-sm sm:text-base text-gray-600">{t('components.DraftForm.title.new_sub_heading')}</p>
                  </>
                }
            </div>

            <ProgressBar 
              currentStep={currentStep}
              onStepChange={handleStepChange}
              completed={completed}
              onCompletedChange={setCompleted}
            />

          </div>
        </Section>

        <form className="">
            <Section id="basic-info">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 px-3 sm:px-6 py-4 sm:py-8 || bg-gray-25 rounded-lg">
                <div>
                  <label htmlFor="type" className="block text-md font-semibold text-gray-1000 pb-1">
                    {t('instrument.type')}
                  </label>
                  <div className="relative mb-2 font-medium">
                    <div
                      onClick={() => instrument?.type ? null : setOpen(!open)}
                      className={`bg-white p-2 flex border border-gray-200 items-center justify-between rounded-md ${!type && "text-gray-700"}`}
                    >
                      {type ? type : t('instrument.type_placeholder')}
                    </div>
                    <ul className={`absolute z-10 top-0 w-full bg-white rounded-md border border-gray-300 overflow-y-auto ${open ? "max-h-60" : "max-h-0 invisible"} `}>
                      <div className="flex items-center px-2 sticky top-0 bg-white">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                          placeholder={t('instrument.type_placeholder')}
                          className="placeholder:text-gray-700 p-2 outline-none"
                          disabled={instrument?.type ? true : false}
                        />
                      </div>
                      {instrumentTypes?.length && instrumentTypes.map((ins: any) => (
                        <li
                          key={ins?.label}
                          className={`p-2 text-sm hover:bg-sky-600 hover:text-white
                            ${ins?.value?.toLowerCase() === type?.toLowerCase() && "bg-sky-600 text-white"}
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
                  </div>
                </div>

                <div className="col-span-2">
                  <label htmlFor="name" className="block text-md font-semibold text-gray-1000 pb-1">
                    {t('instrument.name')}
                  </label>
                  <input
                    name="name"
                    className="block w-full px-4 py-2 text-it-950 border rounded-md focus:border-it-400 focus:ring-it-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    onChange={(e) => { setName(e.target.value) }}
                    value={name}
                    disabled={instrument?.title ? true : false}
                  />
                </div>
              </div>
              
              {type && name && !instrumentId && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                    disabled={isLoadingMetadata}
                    onClick={(e) => createInstrument(e)}
                  >
                    {isLoadingMetadata && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {t('drafts.save')}
                  </button>
                </div>
              )}
            </Section>
          {
            instrument &&
            <>
              <Section id="cover">
                <div className="mb-6">
                  <label htmlFor="cover" className="block text-md font-semibold text-gray-1000 pb-1">
                    {t('instrument.images')} {process.env.NEXT_PUBLIC_MIME_TYPE_ACCEPT}
                  </label>
                  <>
                    <div className="p-6 flex flex-col items-center gap-2 bg-gray-100 text-gray-100' rounded-lg">
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
                      {!cover && instrument.cover_image && instrument.cover_image.file_url && 
                          <div
                            key={instrument.cover_image.id}
                            className="max-w-sm bg-it-50 border border-gray-200 rounded-lg overflow-hidden shadow dark:bg-gray-800 dark:border-gray-700 mt-4 text-center"
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
                      {!!cover && 
                        <div
                          key={'cover'}
                          className="max-w-sm bg-it-50 border border-gray-200 rounded-lg overflow-hidden shadow dark:bg-gray-800 dark:border-gray-700 mt-4 text-center"
                        >
                          <div className="relative overflow-hidden text-ellipsis">
                            <img className="" src={cover as any} alt="" />
                            <button
                              type="button"
                              className="absolute top-2 right-2 mt-2 mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full"
                              onClick={() => handleCoverDelete()}
                            >
                              <IconTrashTwentyFour />
                            </button>
                          </div>
                          <textarea
                            className="w-full p-2 border-none focus:outline-none"
                            placeholder={t('instrument.images_description_placeholder')}
                            value={coverDescription}
                            onChange={(e) => handleCoverDescriptionChange(e.target.value)}
                          />
                        </div>
                      }
                      {
                        (!instrument.cover_image && !cover) && 
                        <button
                          type="button"
                          className="bg-transparent text-center mt-2 hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-lg flex items-center justify-center"
                          onClick={handleCoverClick}
                        >
                          <IconUploadTwentyFour className="w-4 h-4 mr-2" />
                          {t('instrument.image_helper')}
                        </button>
                      }
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                  </>
                </div>
                {type && name && cover && !instrument.cover_image &&
                  <div className="mt-6 text-center">
                    {
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                        disabled={isLoadingMetadata}
                        onClick={(e) => uploadCover(e)}
                      >
                        {
                          isLoadingMetadata &&
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        }
                        {t('register.create_cover')}
                      </button>
                    }
                  </div>
                }
              </Section>
              <Section id="images">
                <div className="mb-6">
                  <label htmlFor="images" className="block text-md font-semibold text-gray-1000 pb-1">
                    {t('instrument.images')} {process.env.NEXT_PUBLIC_MIME_TYPE_ACCEPT}
                  </label>
                  <>
                    <div className="p-6 flex flex-col items-center gap-2 bg-gray-100 text-gray-100' rounded-lg">
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
                      {instrument.images.length > 0 && instrument.images[0] &&
                        instrument.images.map((img: InstrumentImage, index: number) => (
                          <div
                            key={img.id}
                            className="max-w-sm bg-it-50 border border-gray-200 rounded-lg overflow-hidden shadow dark:bg-gray-800 dark:border-gray-700 mt-4 text-center"
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
                      {images.length > 0 && images.map((img: any, index: number) => (
                        <div
                          key={index.toString()}
                          className="max-w-sm bg-it-50 border border-gray-200 rounded-lg overflow-hidden shadow dark:bg-gray-800 dark:border-gray-700 mt-4 text-center"
                        >
                          <div className="relative overflow-hidden text-ellipsis">
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
                            className="w-full p-2 border-none focus:outline-none"
                            placeholder={t('instrument.images_description_placeholder')}
                            value={imageDescriptions[index]}
                            onChange={(e) => handleImageDescriptionChange(index, e.target.value)}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-transparent text-center mt-2 hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-lg flex items-center justify-center"
                        onClick={handleImagesClick}
                      >
                        <IconUploadTwentyFour className="w-4 h-4 mr-2" />
                        {t('instrument.select_detail_image')}
                      </button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                  </>
                </div>
                {type && name && images.length > 0 &&
                  <div className="mt-6 text-center">
                    {
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                        disabled={isLoadingMetadata}
                        onClick={(e) => uploadImages(e)}
                      >
                        {
                          isLoadingMetadata &&
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        }
                        {t('register.upload_images')}
                      </button>
                    }
                  </div>
                }
              </Section>
              <Section id="files">
                <div className="mb-6">
                  <label htmlFor="files" className="block text-md font-semibold text-gray-1000 pb-1">
                    {t('instrument.files')} {process.env.NEXT_PUBLIC_FILE_TYPE_ACCEPT}
                  </label>
                  <>
                    <div className="p-6 flex flex-col items-center gap-2 bg-gray-100 text-gray-100' rounded-lg">
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
                      {instrument && instrument.files.length > 0 &&
                        instrument.files.map((file: InstrumentFile, index: number) => (
                          <div
                            key={`F${index.toString()}`}
                            className="max-w-sm bg-it-50 border border-gray-200 rounded-lg overflow-hidden shadow dark:bg-gray-800 dark:border-gray-700 mt-4 text-center"
                          >
                            <div className="relative overflow-hidden text-ellipsis">
                              <div className="">
                                <div className="p-8 pl-20 pr-20 bg-white">
                                  {file.title}
                                </div>
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
                      {!!documentFiles.length && documentFiles.map((file: any, index: number) => (
                        <div
                          key={`D${index.toString()}`}
                          className="max-w-sm bg-it-50 border border-gray-200 rounded-lg overflow-hidden shadow dark:bg-gray-800 dark:border-gray-700 mt-4 text-center"
                        >
                          <div className="relative overflow-hidden text-ellipsis">
                            <div className="p-4">  
                              {file.name}
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
                            className="w-full p-2 border-none focus:outline-none"
                            placeholder={t('instrument.files_description_placeholder')}
                            value={documentDescriptions[index]}
                            onChange={(e) => handleDocumentDescriptionChange(index, e.target.value)}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-transparent text-center mt-2 hover:bg-it-500 text-gray-1000 hover:text-white border border-gray-300 hover:border-it-500 py-2 px-4 rounded-md text-lg flex items-center justify-center"
                        onClick={handleDocumentClick}
                      >
                        <IconUploadTwentyFour className="w-4 h-4 mr-2" />
                        {t('instrument.select_detail_files')}
                      </button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                  </>
                </div>
                {type && name && documentFiles.length > 0 &&
                  <div className="mt-6 text-center">
                    {
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                        disabled={isLoadingMetadata}
                        onClick={(e) => uploadDocuments(e)}
                      >
                        {
                          isLoadingMetadata &&
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        }
                        {t('register.upload_documents')}
                      </button>
                    }
                  </div>
                }
              </Section>
            </>
          }

          { instrument && 
            (instrument.images?.length > 0) &&
            (instrument.files?.length > 0) && 
            (instrument.cover_image) &&
              <Section id="description">
                <div className="mb-6">
                  <label
                    htmlFor="description"
                    className="block text-md font-semibold text-gray-1000  pb-1"
                  >
                    {t('instrument.description')}
                  </label>
                  <div className="p-0 border border-gray-200 bg-white rounded-md">
                    <Editor markdown={description} updateDescription={handleDescriptionChange} />
                  </div>
                </div>
                {
                  instrument.description !== description && 
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                      disabled={isLoadingMetadata}                      
                      onClick={(e) => updateDescription(e)}
                    >
                      {isLoadingMetadata && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                      {t('drafts.save')}
                    </button>
                  </div>
                }
                {
                  (instrument.cover_image || cover) &&
                  (instrument.description === description) && description &&
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                      disabled={isLoadingMetadata}
                      onClick={() => router.push(`/preview/${instrument.id}`)}
                    >
                      {
                        isLoadingMetadata &&
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      {t('components.DraftForm.preview')}
                    </button>
                  </div>
                }
              </Section>
          }
        </form>

        <Section id="delete">
          {
            instrument &&
            <div className="mt-6 text-center">
              <button
                type="button"
                className="items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                disabled={isLoadingMetadata}
                onClick={() => handleInstrumentDelete()}
              >
                {isLoadingMetadata && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {t('components.DraftForm.delete')}
              </button>
            </div>
          }
        </Section>

      </Page> :
      <NotConnected locale={locale} />
  );
}
