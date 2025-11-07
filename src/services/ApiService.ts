// someService.ts
import api from "./AxiosInterncepter";

export const getBooks = async () => {
  const response = await api.get(`/books`);
  return response.data;
};

export const createUser = async (payload: any) => {
  const response = await api.post("/users", payload);
  return response.data;
};
