// someService.ts
import api from "./AxiosInterncepter";

export const getBooks = async () => {
  const response = await api.get(`/books`);
  return response.data;
};

export const getBookDetail = async (bookId: number) => {
  const response = await api.get(`/books/${bookId}/detail`);
  return response.data;
}

export const getChapters = async (bookId: number) => {
  const response = await api.get(`/books/${bookId}/chapters`);
  return response.data;
};

export const getVerses = async (chapterId: number) => {
  const response = await api.get(`/chapters/${chapterId}/verses`);
  return response.data;
};

export const getAudioChapter = async (chapterId: number) => {
  const response = await api.get(`/audio/chapter?chapterId=${chapterId}`);
  return response.data;
};

export type versionType = 'Database' | 'Application';

export const getLatestVersion = async (type: versionType) => {
  const response = await api.get(`/versions/latest?type=${type}`);
  return response.data;
};

export const createUser = async (deviceId: any, deviceName: any, deviceType: any) => {
  const body: any = {
    "deviceId": deviceId,
    "deviceName": deviceName,
    "deviceType": deviceType,
  };
  const response = await api.post("/users/new", body);
  return response.data;
};