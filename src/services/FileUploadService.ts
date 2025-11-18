import { wp, api } from "../app/http-common";


const upload = (
  file: File,
  instrumentId: string | undefined,
  api_key: string,
  isCover: boolean,
  onUploadProgress: any): Promise<any> => 
{
  let formData = new FormData();

  if (!instrumentId) new Promise<void>(reject => reject());

  formData.append("instrument_id", instrumentId || '');
  formData.append("description", '');
  if (isCover) {
    formData.append("cover_image", "true");
  }
  formData.append("file", file);

  return wp.post(`/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-API-Key': api_key
    },
    onUploadProgress,
  });
};

const getFile = (id: number): Promise<any> => {
  return api.get(`/file/${id}`);
};

const getFileFromInstrumentApi = (id: number, api_key: string): Promise<any> => {
  return wp.get(`/file/${id}`, {
    headers: {
      'X-API-Key': api_key
    }
  });
};

const deleteFile = (id: number, api_key: string): Promise<any> => {
  return wp.delete(`/file/${id}`, {
    headers: {
      'X-API-Key': api_key
    }
  });
};

const FileUploadService = { upload, deleteFile, getFile, getFileFromInstrumentApi };

export default FileUploadService;
