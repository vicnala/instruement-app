import { api, wp } from "../app/http-common";

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
    instrumentId: number,
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

const deleteInstrument = (
    instrumentId: number,
): Promise<any> => {
    return api.delete(`/instrument/${instrumentId}`);
};

const DraftService = { createInstrument, deleteInstrument };

export default DraftService;
