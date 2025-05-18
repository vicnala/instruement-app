"use client";

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl";
import { useStateContext } from "@/app/context";
import NotConnected from "@/components/NotConnected";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { FileText, Trash, ChevronDown } from 'lucide-react';

import { Instrument, InstrumentFile, InstrumentImage } from "@/lib/definitions";
import { useRouter } from "@/i18n/routing";
import Loading from "../Loading";
import ProgressBar from "../UI/ProgressBar"
import ButtonSpinner from "../UI/ButtonSpinner"
import FormSaveButton from "../UI/FormSaveButton"
import Divider from "../UI/Divider"
import MediaManager from "@/components/MediaManager";
import DraftService from "@/services/DraftService";
import InstrumentService from "@/services/InstrumentService";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

// Add this type definition at the top of the file
type ProgressStep = 1 | 2 | 3 | 4;

export default function DraftForm(
  { locale, instrumentId }: Readonly<{ locale: string, instrumentId?: string }>
) {
  const t = useTranslations('components.DraftForm');
  const router = useRouter();
  const { minter, setReloadUser } = useStateContext()

  const [open, setOpen] = useState(false)
  const [type, setType] = useState<string>("")
  const [instrumentTypes, setInstrumentTypes] = useState<any[]>([])
  const [instrument, setInstrument] = useState<Instrument>()
  const [inputValue, setInputValue] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const [hasCover, setHasCover] = useState(false)
  const [hasImages, setHasImages] = useState(false)
  const [hasFiles, setHasFiles] = useState(false)

  const [coverDescription, setCoverDescription] = useState<string>('')
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([])
  const [documentDescriptions, setDocumentsDescriptions] = useState<string[]>([])

  const [error, setError] = useState<string | null>(null)

  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Add new state for tracking progress
  const [currentStep, setCurrentStep] = useState<ProgressStep>(1);
  const [completed, setCompleted] = useState(false);
  const [canPreview, setCanPreview] = useState<Boolean>(false);

  useEffect(() => {
    // handle preview button    
    setCanPreview(
      instrument &&
      hasCover && hasImages &&
      (instrument?.description === description) ? true : false
    );
    // handle step transitions
    if (!instrument) {
      setCurrentStep(1);
      setCompleted(false);
    } else if (instrument) {
      const hasDescription = instrument ? instrument.description && instrument.description.trim().length > 0 : false;
      if (hasCover && hasImages && hasFiles && hasDescription) {
        setCurrentStep(4);
        setCompleted(true);
      } else if (hasCover && hasImages && hasFiles) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    }
  }, [instrument, hasCover, hasImages, hasFiles, description]);
  
  // Fetch instrument details and associated files/images when instrumentId changes
  useEffect(() => {
    const getInstrument = async () => {
      if (!minter || typeof minter === 'boolean' || !instrumentId) return;
      setIsLoading(true);
      const data = await InstrumentService.getInstrument(instrumentId, locale, minter.api_key);
      if (data) {
        setName(data.title);
        setDescription(data.description);
        setInstrument(data);
        // console.log("data", data);
        // console.log("instrument", instrument);
      }
      setIsLoading(false);
    }

    if (instrumentId && !instrument) {
      getInstrument();
    }
  }, [instrumentId, instrument, minter, locale]);

  // Update instrument types based on minter skills and instrument type
  useEffect(() => {
    if (minter && typeof minter !== 'boolean' && minter.skills && minter.instrument_types) {
      const minterSkillsConstruction = minter.skills
        .filter((s: any) => s.slug.includes('construction'))
        .map((s: any) => s.slug.split('-construction')[0]) || [];

      const minterInstrumentTypes = minter.instrument_types
        .map((ins: any) => ({ value: ins.name, label: ins.name, category: ins.slug }))
        .filter((ins: any) => minterSkillsConstruction.includes(ins.category));

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

  // Create new instrument
  const createOrUpdateInstrument = async (e: any) => {
    e.preventDefault()
    if (type && name && (!instrumentId || instrument)) {
      if (!instrumentId) {
        // setIsLoading(true);
        const selected: any = instrumentTypes.find((i: any) => i.label === type);
        if (!selected) {
          // setIsLoading(false)
          return;
        }
        try {
          const { data } = await DraftService.createInstrument(minter, selected, name);
          if (data.code === 'success') {
            if (data.data) {
              setReloadUser(true);
              router.replace(`/drafts/${data.data.id}`);
            }
          } else {
            alert(`Error createInstrument: ${data.data.message}`);
            setReloadUser(true);
            router.replace(`/`);
          }
        } catch (error: any) {
          alert(`Error createInstrument: ${error.response.data.data.message}`);
          setReloadUser(true);
          router.replace(`/`);
        }
      } else if (instrument) {
        try {
          const { data } = await DraftService.updateInstrument(instrumentId, instrument.type, name, description);
          if (data.code === 'success') {
            if (data.data && data.data.length === 1) {
              if (instrument.title !== data.data[0].title) {
                setInstrument({...instrument, title: data.data[0].title});
              } else if (instrument.type !== data.data[0].type) {
                setInstrument({...instrument, type: data.data[0].type});
              } else if (instrument.description !== data.data[0].description) {
                setInstrument({...instrument, description: data.data[0].description});
              }
            }
          } else {
            alert(`Error updateInstrument: ${data.message}`);
            setReloadUser(true);
            router.replace(`/`);
          }
        } catch (error: any) {
          alert(`Error updateInstrument: ${error.response.data.message}`);
          setReloadUser(true);
          router.replace(`/`);
        }
      }
    }
    // setIsLoading(false);
  }

  // Handle instrument delete
  const handleInstrumentDelete = async () => {
    setIsLoadingMetadata(true);
    try {
      if (instrument) {
        await DraftService.deleteInstrument(instrument.id);
      }
    } catch (error) {
      console.log("POST /api/instrument DELETE error", error)
    }
    setReloadUser(true);
    router.push(`/`)
  };

  const handleCoverChange = (media: (InstrumentImage | InstrumentFile)[]) => {
    setHasCover(media.length > 0);
    if (media.length === 1) {
      if (instrument) {
        if (!instrument.cover_image) {
          setInstrument({...instrument, cover_image: media[0] as InstrumentImage});
        } else if (instrument.cover_image && instrument.cover_image.id !== media[0].id) {
          setInstrument({...instrument, cover_image: media[0] as InstrumentImage});
        }
      }
    }
  };

  const handleImagesChange = (media: (InstrumentImage | InstrumentFile)[]) => {
    setHasImages(media.length >= parseInt(process.env.NEXT_PUBLIC_MIN_IMAGES || '2'));
    if (media.length > 0) {
      if (instrument) {
        if (instrument.images.length === 0) {
          setInstrument({...instrument, images: media as InstrumentImage[]});
        } else if (instrument.images.length !== media.length) {
          setInstrument({...instrument, images: media as InstrumentImage[]});
        }
      }
    }
  };

  const handleFilesChange = (media: (InstrumentImage | InstrumentFile)[]) => {
    setHasFiles(media.length >= 0);
    if (media.length > 0) {
      if (instrument) {
        if (instrument.files.length === 0) {
          setInstrument({...instrument, files: media as InstrumentFile[]});
        } else if (instrument.files.length !== media.length) {
          setInstrument({...instrument, files: media as InstrumentFile[]});
        }
      }
    }
  };

  return (
    minter ?
      <Page>
      { isLoading ? <Loading /> : <>
        <Section id="progress-bar">
          <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-it-50 rounded-[15px] border border-it-200 overflow-hidden">
            <div className="w-full mx-auto mb-4 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {
                    instrument ?
                      <>
                        {hasCover && hasImages && hasFiles && description ? (
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
              completed={completed}
              onCompletedChange={setCompleted}
            />
          </div>
          <div>
            {
              instrument && (currentStep === 4) &&
              <div className="text-right mt-6">
                <FormSaveButton
                  disabled={!canPreview}
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
                  <label htmlFor="type" className="block text-base font-semibold text-gray-1000 pb-1">
                    {t('basic_info.type.label')}
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => instrument?.type ? null : setOpen(!open)}
                      className={`bg-white text-base p-2 flex border border-gray-200 items-center justify-between rounded-md ${!type && "text-gray-700"} ${!instrument?.type && "cursor-pointer"}`}
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
                          className={`p-2 text-base hover:bg-it-50 hover:text-it-950 cursor-pointer
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
                  <label htmlFor="name" className="block text-base font-semibold text-gray-1000 pb-1">
                    {t('basic_info.name.label')}
                  </label>
                  <input
                    name="name"
                    className={`text-base block w-full px-2 py-2 text-it-950 border rounded-md focus:border-it-400 focus:ring-it-300 focus:outline-none focus:ring focus:ring-opacity-40 dark:bg-white dark:bg-opacity-90`}
                    onChange={(e) => { setName(e.target.value) }}
                    value={name}
                    disabled={false}
                  />
                  <p className="text-sm text-gray-600 pt-2">
                    {t('basic_info.name.description')}
                  </p>
                </div>
              </div>
              {(!instrumentId || (instrument?.title ? instrument?.title !== name : true)) &&
                <div className="mt-4 text-right">
                  <FormSaveButton
                    disabled={isLoadingMetadata || !type || !name}
                    onClick={(e) => createOrUpdateInstrument(e)}
                    isLoading={isLoadingMetadata}
                  >
                    {instrument?.title ? t('basic_info.button_save') : t('basic_info.button_save_and_continue')}
                  </FormSaveButton>
                </div>
              }
            </div>
          </Section>
          {
            instrumentId && instrument &&
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
                        <MediaManager
                          instrument={instrument}
                          multiple={false}
                          api_key={minter.api_key}
                          isCover={true}
                          accept={'image'}
                          onMediaChange={handleCoverChange}
                        />
                        {error && <p className="text-red-500">{error}</p>}
                      </>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 min-h-[300px]">
                    <div className="md:hidden">
                      <Divider spacing="md" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-1000 pb-1" >
                      {t('media.images.title')}
                    </h2>
                    <p className="text-sm text-gray-600 max-w-lg">
                      {t('media.images.description')}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6 mt-4">
                      <MediaManager
                        instrument={instrument}
                        multiple={true}
                        api_key={minter.api_key}
                        isCover={false}
                        accept={'image'}
                        onMediaChange={handleImagesChange}
                      />
                    </div>

                    <Divider spacing="md" />

                    <h2 className="text-xl font-semibold text-gray-1000 pb-1">
                      {t('media.files.title')}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {t('media.files.description')}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6 mt-4">
                      <MediaManager
                        instrument={instrument}
                        multiple={true}
                        api_key={minter.api_key}
                        isCover={false}
                        accept={'file'}
                        onMediaChange={handleFilesChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          }

          {instrument &&
            hasCover && hasImages && hasFiles &&
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
                      !hasCover || 
                      !hasImages || 
                      !hasFiles || 
                      !description || 
                      description === instrument.description
                    }
                    onClick={(e) => createOrUpdateInstrument(e)}
                    isLoading={isLoadingMetadata}
                  >
                    {t('details.button_save')}
                  </FormSaveButton>
                </div>
              </div>
              {/* If description is saved and there are media uploads, show preview button */}
              {
                instrument && (currentStep === 4) &&
                <div className="mt-6 text-right">
                  <FormSaveButton
                    disabled={!canPreview}
                    onClick={() => router.push(`/preview/${instrument.id}`)}
                    isLoading={isLoadingMetadata}
                    theme="green"
                  >
                    {t('preview')}
                  </FormSaveButton>
                </div>
              }
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
        </>
      }
      </Page> :
      <NotConnected locale={locale} />
  );
}
