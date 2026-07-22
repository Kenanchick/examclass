import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export const apiClient = axios.create({
  baseURL,
  timeout: 10_000,
});
