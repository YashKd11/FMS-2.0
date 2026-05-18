import { api } from "./api";

export const signinUser = (data) => {
  return api.post("/api/users/signin", data);
};