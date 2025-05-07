import http from "../app/http-common";

const upload = (file: File, onUploadProgress: any): Promise<any> => {
  let formData = new FormData();

  formData.append('post_id', '1');
  formData.append('action', 'upload-attachment');
  formData.append("file", file);

  return http.post(`${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`
    },
    onUploadProgress,
  });
};

const getFiles = () : Promise<any> => {
  return http.get("/files");
};

const FileUploadService = {
  upload,
  getFiles,
};

export default FileUploadService;
