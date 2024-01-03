import axios, { AxiosInstance } from 'axios'

declare global {
  var cachedAxios: AxiosInstance
}

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'

let axiosInstance: AxiosInstance

if (process.env.NODE_ENV === 'production') {
  axiosInstance = axios.create({
    baseURL: baseUrl
    //  Axios configuration
  })
} else {
  if (!global.cachedAxios) {
    global.cachedAxios = axios.create({
      baseURL: baseUrl
      // Axios configuration
    })
  }
  axiosInstance = global.cachedAxios
}

export const fetcher = axiosInstance
