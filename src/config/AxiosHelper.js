import axios from "axios";
export const baseURL = "https://chat-deployment-latest-2.onrender.com";
export const httpClient = axios.create({
  baseURL: baseURL,
});