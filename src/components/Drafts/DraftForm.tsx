"use client";

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl";
import Page from "@/components/Page";
import Section from "@/components/Section";
import { Trash, ChevronDown, Lock, ArrowRight } from 'lucide-react';

import { Instrument, InstrumentFile, InstrumentImage } from "@/lib/definitions";
import { useRouter } from "@/i18n/routing";
import ProgressBar from "../UI/ProgressBar"
import ButtonSpinner from "../UI/ButtonSpinner"
import FormSaveButton from "../UI/FormSaveButton"
import Divider from "../UI/Divider"
import { TransitionLink } from "../UI/TransitionLink"
import MediaManager from "@/components/MediaManager";
import DraftService from "@/services/DraftService";
import InstrumentService from "@/services/InstrumentService";
import { getUser } from "@/services/UsersService";
import Skeleton from "../Skeleton";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

// Add this type definition at the top of the file
type ProgressStep = 1 | 2 | 3 | 4;

const MIN_DESCRIPTION_LENGTH = 140;

export default function DraftForm(
  { locale, instrumentId, context }: Readonly<{ locale: string, instrumentId?: string, context: any }>
) {
  const t = useTranslations('components.DraftForm');
  const router = useRouter();

  const [minter, setMinter] = useState<any>(null);
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

  // const [coverDescription, setCoverDescription] = useState<string>('')
  // const [imageDescriptions, setImageDescriptions] = useState<string[]>([])
  // const [documentDescriptions, setDocumentsDescriptions] = useState<string[]>([])

  const [error, setError] = useState<string | null>(null)

  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Add new state for tracking progress
  const [currentStep, setCurrentStep] = useState<ProgressStep>(1);
  const [completed, setCompleted] = useState(false);
  const [canPreview, setCanPreview] = useState<Boolean>(false);

  useEffect(() => {
    const getMinter = async () => {
      const result = await getUser(context.sub);
      if (result.code === 'success') {
        setMinter(result.data);
      }
    }
    getMinter();
  }, [context.sub]);

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
  }, [minter, instrument, instrumentId, locale]);

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
              router.replace(`/drafts/${data.data.id}`);
            }
          } else {
            alert(`Error createInstrument: ${data.data.message}`);
          }
        } catch (error: any) {
          alert(`Error createInstrument: ${error.response.data.data.message}`);
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
          }
        } catch (error: any) {
          alert(`Error updateInstrument: ${error.response.data.message}`);
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
        router.push(`/`)
      }
    } catch (error) {
      console.log("POST /api/instrument DELETE error", error)
    }
    setIsLoadingMetadata(false);
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

  // Reusable preview button component
  const previewButton = instrument && (currentStep === 4) ? (
    <div className="text-right mt-6 mr-6">
      <TransitionLink
        href={`/preview/${instrument.id}`}
        locale={locale}
        className="
          inline-flex items-center px-4 py-2 tracking-wide transition-colors duration-200 transform 
          focus:outline-none
          font-bold 
          bg-transparent hover:bg-scope-500 active:bg-scope-200
          border-[0.1rem] border-scope-400 hover:border-scope-500 focus:border-scope-700 active:border-scope-200
          text-scope-500 hover:text-scope-1000 focus:text-scope-700 active:text-scope-500
          active:scale-[0.98]
          rounded-button
        "
        theme="it"
        aria-label={t('preview')}
        disabled={!canPreview || isLoadingMetadata}
      >
        {t('preview')}
        {canPreview && !isLoadingMetadata && <ArrowRight className="w-4 h-4 ml-2" />}
      </TransitionLink>
    </div>
  ) : null;

  return (
      <Page context={context}>
        {
          minter && <>
        <Section id="progress-bar"  data-theme="us">
          <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-scope-25 border border-scope-50 rounded-section overflow-hidden">
            <div className="w-full mx-auto mb-4 sm:mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-it-1000 dark:text-us-100">
                  {
                    instrument ?
                      <>
                        {hasCover && hasImages && hasFiles && description ? (
                          <>
                            <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('title.ready_to_register')}</h2>
                            <p className="text-sm sm:text-base text-us-600 dark:text-us-400">{t('title.ready_to_register_sub')}</p>
                          </>
                        ) : (
                          <>
                            <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('title.edit')} #{instrument.id} </h2>
                            <p className="text-sm sm:text-base text-us-600 dark:text-us-400">{t('title.edit_sub_heading')}</p>
                          </>
                        )}
                      </>
                      : <>
                        <h2 className='text-xl sm:text-2xl font-semibold mb-1'>{t('title.new')}</h2>
                        <p className="text-sm sm:text-base text-us-600 dark:text-us-400">{t('title.new_sub_heading')}</p>
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
            {previewButton}
          </div>
        </Section>

        <form className="">
          <Section id="basic-info" className="pb-1" data-theme="it">
            <div className="px-3 sm:px-6 pt-5 pb-6 sm:py-8 || bg-scope-50 border border-scope-100 rounded-section overflow-hidden">
              <h2 className="text-xl font-semibold text-scope-1000 pb-3">
                {t('basic_info.title')}
              </h2>
              <h3 data-theme="me" className="text-lg text-scope-600 pb-6">
                    {minter && typeof minter !== 'boolean' && (
                      <span className="flex items-center">
                        <Lock className="w-4 h-4 mr-2 -mt-0.5" />
                        {t('basic_info.made_by')} {minter.business_name}
                      </span>
                    )}
              </h3>
              
              {instrumentId && !instrument && isLoading ? (
                // Loading skeleton when instrumentId exists but data hasn't loaded yet
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 sm:gap-6">
                  <div>
                    <Skeleton height="20px" width="120px" />
                    <div className="mt-2">
                      <Skeleton height="40px" />
                    </div>
                    <div className="mt-2">
                      <Skeleton height="16px" width="200px" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Skeleton height="20px" width="100px" />
                    <div className="mt-2">
                      <Skeleton height="40px" />
                    </div>
                    <div className="mt-2">
                      <Skeleton height="16px" width="250px" />
                    </div>
                  </div>
                </div>
              ) : (
                // Form fields when not loading or when instrument is loaded
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 sm:gap-6">
                    <div>
                      <label htmlFor="instrument_type" className="block text-base font-semibold text-scope-1000 pb-1">
                        {t('basic_info.type.label')}
                      </label>
                      <div className="relative" data-theme="it">
                        <div
                          onClick={() => instrument?.type ? null : setOpen(!open)}
                          className={`bg-scope-25 text-base p-2 flex border-[0.1rem] border-scope-200 items-center justify-between rounded-button 
                            ${!type && "text-us-700 dark:text-us-300"} 
                            ${!instrument?.type && "cursor-pointer"}
                            ${instrument?.type ? "opacity-50 cursor-not-allowed bg-scope-50" : ""}`}
                        >
                          {type ? type : t('basic_info.type.placeholder')}
                          <ChevronDown className="h-5 w-5 text-scope-400" />
                        </div>
                        <ul className={`absolute z-10 top-0 w-full bg-scope-25 rounded-md border-[0.1rem] border-scope-300 overflow-y-auto ${open ? "max-h-60 shadow-sm" : "max-h-0 invisible"} `}>
                          <div className="flex items-center px-2 sticky top-0 bg-scope-25">
                            <input
                              id="instrument_type"
                              name="instrument_type"
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                              placeholder={t('basic_info.type.input_placeholder')}
                              className="placeholder:text-scope-300 py-2 outline-none text-scope-500 bg-scope-25"
                              disabled={instrument?.type ? true : false}
                            />
                          </div>
                          {instrumentTypes?.length && instrumentTypes.map((ins: any) => (
                            <li
                              key={ins?.label}
                              className={`p-2 text-base hover:bg-scope-50 hover:text-scope-950 cursor-pointer
                                  ${ins?.value?.toLowerCase() === type?.toLowerCase() && "bg-scope-300 text-scope-950 hover:bg-scope-400"}
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
                        <p className="text-sm text-us-600 dark:text-us-400 pt-2">
                          {type ? t('basic_info.type.type_set_description') : t('basic_info.type.description')}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2" data-theme="it">
                      <label htmlFor="instrument_name" className="block text-base font-semibold text-scope-1000 pb-1">
                        {t('basic_info.name.label')}
                      </label>
                      <input
                        id="instrument_name"
                        name="instrument_name"
                        className={`text-base block w-full px-2 py-2 text-scope-950 bg-scope-25 border-[0.1rem] border-scope-200 rounded-button focus:border-scope-400 focus:outline-none`}
                        onChange={(e) => { setName(e.target.value) }}
                        value={name}
                        disabled={false}
                      />
                      <p className="text-sm text-us-600 dark:text-us-400 pt-2">
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
                </>
              )}
            </div>
          </Section>
          {
            instrumentId && instrument &&
            <Section id="media" className="pb-1" data-theme="it">
              <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-scope-50 border border-scope-100 rounded-section">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                  <div className="col-span-1 min-h-[300px]">
                    <h2 className="text-xl font-semibold text-scope-1000 pb-1">
                      {t('media.cover.title')}
                    </h2>
                    <p className="text-sm text-us-600 dark:text-us-400">
                      {t('media.cover.description')}
                    </p>
                    <div className="mt-4" data-theme="it">
                        <MediaManager
                          instrument={instrument}
                          multiple={false}
                          api_key={minter.api_key}
                          isCover={true}
                          accept={'image'}
                          onMediaChange={handleCoverChange}
                        />
                        {error && <p className="text-red-500">{error}</p>}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 min-h-[300px]">
                    <div className="md:hidden">
                      <Divider spacing="md" />
                    </div>
                    <h2 className="text-xl font-semibold text-scope-1000 pb-1" >
                      {t('media.images.title')}
                    </h2>
                    <p className="text-sm text-us-600 dark:text-us-400 max-w-lg">
                      {t('media.images.description')}
                    </p>
                    <div className="mt-4" data-theme="it">
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

                    <h2 className="text-xl font-semibold text-scope-1000 pb-1">
                      {t('media.files.title')}
                    </h2>
                    <p className="text-sm text-us-600 dark:text-us-400">
                      {t('media.files.description')}
                    </p>
                    <div className="mt-4" data-theme="it">
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
            <Section id="description" data-theme="it">
              <div className="px-3 sm:px-6 py-4 sm:py-8 || bg-scope-50 border border-scope-100 rounded-section">
                <div className="mb-6" data-theme="it">
                  <h2 className="text-xl font-semibold text-scope-1000 pb-1">
                    {t('description.title')}
                  </h2>
                  <p className="text-sm text-us-600 dark:text-us-400">
                    {t('description.description')}
                  </p>
                  <div className="p-0 mt-4 border-[0.1rem] border-scope-200 bg-white rounded-md">
                    <Editor 
                      markdown={description} 
                      updateDescription={handleDescriptionChange}
                      contentEditableClassName="markdown-editor"
                    />
                  </div>
                  <div className="mt-2 text-xs text-us-600 dark:text-us-400 flex justify-end">
                    <span className={`${description.length < MIN_DESCRIPTION_LENGTH ? 'text-red-500' : 'text-green-600'}`}>
                      {description.length} {description.length < MIN_DESCRIPTION_LENGTH ? t('description.characters_min') : t('description.characters')}
                    </span>
                  </div>
                </div>
                <div className="mt-6 text-right">
                  {hasCover && 
                   hasImages && 
                   hasFiles && 
                   description && 
                   description.length >= MIN_DESCRIPTION_LENGTH && 
                   description !== instrument.description && (
                    <FormSaveButton
                      disabled={isLoadingMetadata}
                      onClick={(e) => createOrUpdateInstrument(e)}
                      isLoading={isLoadingMetadata}
                      theme="it"
                    >
                      {t('description.button_save')}
                    </FormSaveButton>
                  )}
                </div>
              </div>
            </Section>
          }
        </form>

        <Section>
          {/* If description is saved and there are media uploads, show preview button */}
          {previewButton}
        </Section>

        <Section id="delete">
          {instrument &&
            <div className="my-6 ml-6 text-left">
              <button
                type="button"
                className="inline-flex items-center py-2 px-4 rounded-full text-xs border-[0.1rem] border-red-400 dark:border-red-800 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-500 hover:text-white font-semibold tracking-wide transition-colors duration-200 transform text-red-500 focus:outline-none focus:bg-red-700"
                disabled={isLoadingMetadata}
                onClick={() => handleInstrumentDelete()}
                aria-label={t('delete')}
                title={t('delete')}
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
      </Page>
  );
}
