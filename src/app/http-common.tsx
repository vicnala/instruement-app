import axios from "axios";

export const wp =  axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_INSTRUEMENT_API_URL}`,
  headers: {
    "Content-type": "application/json"
  },
});


export const api = axios.create({
  baseURL: `/api`,
  headers: {
    "Content-type": "application/json"
  },
});
