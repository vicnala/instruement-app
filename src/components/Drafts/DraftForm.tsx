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

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

export default function DraftForm(
  { locale, instrumentId, address }: Readonly<{ locale: string, instrumentId?: string, address?: string }>
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
          console.log(`GET /api/instrument/${instrumentId} ERROR`, data.message);
          alert(`Error: ${data.message}`);
        } else {
          setName(data.data.title);          
          setDescription(data.data.description);         
          const imageIds = data.data.images;
          const fileIds = data.data.files;
          const coverId = data.data.cover_image;

          if (imageIds && imageIds.length > 0) {
            const sorted = imageIds.sort((ida: number, idb: number) => ida > idb ? 1 : -1);
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

  const handleDescriptionChange = (markdown: string) => {
    setDescription(markdown)
  }

  const handleCoverClick = () => {
    refCover.current?.click();
  }

  const handleImagesClick = () => {
    refImage.current?.click();
  }

  const handleDocumentClick = () => {
    refDocument.current?.click();
  }

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

  const handleCurrentFileDelete = async (id: number) => {
    setIsLoadingMetadata(true);
    try {
      await fetch(`/api/file/${id}`, { method: "DELETE" });
    } catch (error) {
      console.log("POST /api/file DELETE error", error)
    }
    setReloadUser(true);
    setIsLoadingMetadata(false);
  };

  const handleCoverDelete = async () => {
    setCoverFile(() => undefined);
    setCover(() => undefined);
    setCoverDescription(() => '');
  };

  const handleImageDelete = async (index: number) => {
    setImageFiles((prevFiles: any) => prevFiles.filter((_: any, i: any) => i !== index));
    setImages((prevImages: any) => prevImages.filter((_: any, i: any) => i !== index));
    setImageDescriptions((prevDescriptions: any) => prevDescriptions.filter((_: any, i: any) => i !== index));
  };

  const handleDocumentDelete = async (index: number) => {
    setDocumentFiles((prevFiles: any) => prevFiles.filter((_: any, i: any) => i !== index));
    // setDocuments((prevImages: any) => prevImages.filter((_: any, i: any) => i !== index));
    setDocumentsDescriptions((prevDescriptions: any) => prevDescriptions.filter((_: any, i: any) => i !== index));
  };

  const handleCoverDescriptionChange = (value: string) => {
    setCoverDescription(value);
  };

  const handleImageDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...imageDescriptions];
    newDescriptions[index] = value;
    setImageDescriptions(newDescriptions);
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const _files = Array.from(files);
      setDocumentFiles((prevFiles: File[]) => [...prevFiles, _files[0] as File]);
      setDocumentsDescriptions((prevDescriptions: any) => [...prevDescriptions, '']);
    }
  };

  const handleDocumentDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...documentDescriptions];
    newDescriptions[index] = value;
    setDocumentsDescriptions(newDescriptions);
  };

  const updateInstrument = async (e: any) => {
    e.preventDefault()

    setIsLoadingMetadata(true)
    if (type && name && instrumentId) {
      const selected: any = instrumentTypes.find((i: any) => i.label === type);
      if (!selected || !instrument) return;
      try {
        const result = await fetch(`/api/instrument/${instrumentId}`, {
          method: "POST",
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // user_id: minter.user_id,
            type: selected ? selected.category : instrument?.type,
            name,
            description: description || ""
          })
        })
        const { data } = await result.json()
        // console.log("POST", `/api/instrument/${instrumentId}`, data);

        if (data.code !== 'success') {
          console.log(`POST /api/instrument/${instrumentId} ERROR`, data.message);
          alert(`Error: ${data.message}`);
        } else {
          setReloadUser(true);
        }
      } catch (error: any) {
        console.log(`POST /api/instrument/${instrumentId} ERROR`, error.message)
        alert(`Error: ${error.message}`);
      }
    }
    setIsLoadingMetadata(false)
  }

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
            router.replace(`/drafts/${data.data.id}?address=${address ? address : minterAddress}`);
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
  }

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
  }
  
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
  }
  
  if (instrumentId && !instrument) return (
    <Page>
      <div className="text-center">
        <Loading />
      </div>
    </Page>
  )

  return (
    minter ?
      <Page>
        <Section>
          {
            instrument ? 
              <h2 className='text-xl font-semibold text-center'>{t('drafts.edit')} #{instrument.id} </h2> 
            : <>
                <h2 className='text-xl font-semibold text-center'>{t('drafts.new')}</h2>
                <p className="text-center mb-2 text-grey-900">{t('register.sub_heading')}</p>
              </>
          }
        </Section>
        <form className="py-4 px-4 rounded-lg">
          <Section>
            <div className="mb-6">
              <label htmlFor="type" className="block text-md font-semibold text-gray-1000 pb-1">
                {t('instrument.type')}
              </label>
              <div className="relative mb-2 font-medium">
                <div
                  onClick={() => setOpen(!open)}
                  className={`bg-white p-2 flex border border-gray-200 items-center justify-between rounded-md ${!type && "text-gray-700"}`}
                >
                  {type ? type : t('instrument.type_placeholder')}
                </div>
                <ul className={`absolute top-0 w-full bg-white rounded-md border border-gray-300 overflow-y-auto ${open ? "max-h-60" : "max-h-0 invisible"} `}>
                  <div className="flex items-center px-2 sticky top-0 bg-white">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                      placeholder={t('instrument.type_placeholder')}
                      className="placeholder:text-gray-700 p-2 outline-none"
                    />
                  </div>
                  {instrumentTypes?.map((ins: any) => (
                    <li
                      key={ins?.label}
                      className={`p-2 text-sm hover:bg-sky-600 hover:text-white
                      ${ins?.value?.toLowerCase() === type?.toLowerCase() && "bg-sky-600 text-white"}
                      ${ins?.value?.toLowerCase().startsWith(inputValue) ? "block" : "hidden"}`}
                      onClick={() => {
                        if (ins?.value?.toLowerCase() !== type.toLowerCase()) {
                          setType(ins?.value)
                          setOpen(false)
                          setInputValue("")
                        }
                      }}
                    >
                      {ins?.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="name" className="block text-md font-semibold text-gray-1000 pb-1">
                {t('instrument.name')}
              </label>
              <input
                name="name"
                className="block w-full px-4 py-2 text-it-950 border rounded-md focus:border-it-400 focus:ring-it-300 focus:outline-none focus:ring focus:ring-opacity-40"
                onChange={(e) => { setName(e.target.value) }}
                value={name}
              />
            </div>
            {
              instrument && instrumentId && <div className="mb-6">
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
            }
            {
              type && name &&
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                  disabled={isLoadingMetadata}
                  onClick={(e) => instrumentId ? updateInstrument(e) : createInstrument(e)}
                >
                  {isLoadingMetadata && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {t('drafts.save')}
                </button>
              </div>
            }
          </Section>
          {
            instrument && type && name && instrument.description &&
            <>
              <Section>
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
                      {instrument && instrument.cover_image && instrument.cover_image.file_url &&
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
                          {
                            t('instrument.image')
                          }
                          <textarea
                            className="w-full p-2 border-none focus:outline-none"
                            placeholder={t('instrument.images_description_placeholder')}
                            value={coverDescription}
                            onChange={(e) => handleCoverDescriptionChange(e.target.value)}
                          />
                        </div>
                      }
                      {
                        instrument && (!instrument.cover_image || !cover) && 
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
                {type && name && cover &&
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
              <Section>
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
                      {instrument && instrument.images.length > 0 && instrument.images[0] &&
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
                      {!!images.length && images.map((img: any, index: number) => (
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
              <Section>
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
          {
            !images.length && instrument && instrument.type && instrument.title && instrument.description && instrument.images?.length > 0 &&
            <div className="mt-6 text-center">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform bg-it-500 rounded-md hover:bg-it-700 focus:outline-none focus:bg-it-700 disabled:opacity-25"
                disabled={isLoadingMetadata}
                onClick={() => router.push(`/pay/${instrument.id}${address && `?address=${address}`}`)}
              >
                {
                  isLoadingMetadata &&
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {t('register.register')}
              </button>
            </div>
          }
        </form>
      </Page> :
      <NotConnected locale={locale} />
  );
}
