export type InstrumentImageSize = {
    file: string,
    width: number,
    height: number,
    mimetype: string,
    filesize: number
};

export type InstrumentImageSizes = {
    original: InstrumentImageSize,
    small: InstrumentImageSize,
    medium: InstrumentImageSize,
    large: InstrumentImageSize,
    xl: number,
    xxl: number
};


export type InstrumentImage = {
    id: number,
    title: string,
    description: string,
    type: string,
    instrument_type: string,
    instrument_id: number,
    user_id: string,
    created_at: string,
    updated_at: string,
    file: string,
    file_url: string,
    base_url: string,
    sizes: InstrumentImageSizes
};

export type InstrumentFile = {
    id: number,
    title: string,
    description: string,
    type: string,
    instrument_type: string,
    instrument_id: number,
    user_id: number,
    created_at: string,
    updated_at: string,
    file: string,
    file_url: string,
    base_url: string,
    filesize: number
};

export type Instrument = {
    id: number;
    title: string,
    type: string,
    type_name: string,
    description: string,
    user_id: string,
    created_at: string,
    updated_at: string,
    cover_image: InstrumentImage,
    images: InstrumentImage[],
    files: InstrumentFile[],
    placeholder_image: string
};
