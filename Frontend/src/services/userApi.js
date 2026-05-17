import { api } from "./api";

export const signinUser = (data) => {
  return api.post("/users/signin", data);
};