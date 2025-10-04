import { api } from "../app/http-common";

const createInstrument = (
    minter: any,
    selected: any,
    name: string,
): Promise<any> => {
    return api.post(`/instrument`, {
        user_id: minter.user_id,
        type: selected.category,
        name
    }, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
};

const updateInstrument = (
    instrumentId: string,
    type: string,
    name: string,
    description: string,
): Promise<any> => {
    return api.post(`/instrument/${instrumentId}`, {
        type,
        name,
        description
    }, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
};

const getInstrument = (
    instrumentId: string,
    locale: string,
): Promise<any> => {
    return api.get(`/instrument/${instrumentId}?locale=${locale}`);
};

const deleteInstrument = (
    instrumentId: number,
): Promise<any> => {
    return api.delete(`/instrument/${instrumentId}`);
};

const updateFileDescription = (
    fileId: number,
    description: string
): Promise<any> => {
    return api.post(`/file/${fileId}`, {
        description
    }, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
};

const DraftService = {
    getInstrument,
    createInstrument,
    updateInstrument,
    deleteInstrument,
    updateFileDescription
};

export default DraftService;
