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
    large: number,
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
    sizes: InstrumentImageSizes,
};

export type Instrument = {
    id: number;
    title: string,
    type: string,
    description: string,
    user_id: string,
    created_at: string,
    updated_at: string,
    images: InstrumentImage[]
};
