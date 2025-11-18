import { Instrument, InstrumentImage, InstrumentFile } from "@/lib/definitions";
import FileUploadService from "./FileUploadService";

export default class InstrumentService {
  static async getInstrument(
    id: string,
    locale: string,
    api_key?: string,
    isDraft?: boolean
  ): Promise<Instrument | null> {
    try {
      const result = await fetch(`/api/instrument/${id}?locale=${locale}`, {
        method: "GET",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      const { data } = await result.json();

      if (data.code !== 'success') {
        console.log(`GET /api/instrument/${id} ERROR`, data.message);
        return null;
      }

      const imageIds = data.data.images;
      const fileIds = data.data.files;
      const coverId = data.data.cover_image;

      // Fetch images
      if (!isDraft && imageIds && imageIds.length > 0) {
        const sorted = imageIds
          .filter((id: number) => id !== coverId)
          .sort((ida: number, idb: number) => ida > idb ? 1 : -1);
        
        const _images: InstrumentImage[] = await Promise.all(
          sorted.map(async (imgId: number) => {
            try {
              if (!api_key) {
                throw new Error('API key is required to fetch images');
              }
              const result = await FileUploadService.getFile(imgId);
              const { data: resultData } = result;
              const { code, message, data: resultDataData } = resultData;              
              if (code !== 'success') {
                console.log(`GET image ${imgId} ERROR`, message);
                return {
                  id: imgId,
                  file_url: resultDataData.placeholder_image,
                  description: 'Image not found'
                };
              }
              return resultDataData;
            } catch (error) {
              console.log(`GET image ${imgId} ERROR`, error);
              return {
                id: imgId,
                file_url: data.data.placeholder_image,
                description: 'Image not found'
              };
            }
          })
        ) || [];

        data.data.images = _images;
      }

      // Fetch files
      if (!isDraft && fileIds && fileIds.length > 0) {
        const sorted = fileIds.sort((ida: number, idb: number) => ida > idb ? 1 : -1);
        const files: InstrumentFile[] = await Promise.all(
          sorted.map(async (fileId: number) => {
            try {
              if (!api_key) {
                throw new Error('API key is required to fetch files');
              }
              const result = await FileUploadService.getFile(fileId);
              if (result.data.code !== 'success') {
                console.log(`GET file ${fileId} ERROR`, result.data.message);
                return {
                  id: fileId,
                  file_url: "/images/icons/android-chrome-512x512.png",
                  description: 'File not found'
                };
              }
              return result.data.data;
            } catch (error) {
              console.log(`GET file ${fileId} ERROR`, error);
              return {
                id: fileId,
                file_url: "/images/icons/android-chrome-512x512.png",
                description: 'File not found'
              };
            }
          })
        ) || [];

        data.data.files = files;
      }

      // Always fetch cover image
      if (coverId) {
        try {
          if (!api_key) {
            throw new Error('API key is required to fetch cover image');
          }
          const result = await FileUploadService.getFile(coverId);
          if (result.data.code !== 'success') {
            console.log(`GET cover file ${coverId} ERROR`, result.data.message);
          } else {
            data.data.cover_image = result.data.data;
          }
        } catch (error) {
          console.log(`GET cover file ${coverId} ERROR`, error);
        }
      }

      return data.data;
    } catch (error: any) {
      console.log(`GET /api/instrument/${id} ERROR`, error.message);
      return null;
    }
  }
} 