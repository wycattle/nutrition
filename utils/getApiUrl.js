// utils/getApiUrl.js
export function getApiUrl() {


// this will allow me to log in locally (fromlocalHost and from 198) 
// and from the Vercel (production) URL
// it determines the base API URL to use for fetch requests based on the environment:

if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL_PRODUCTION || '';
  }
  if (typeof window !== 'undefined' && window.location.hostname.startsWith('192.168')) {
    return process.env.NEXT_PUBLIC_API_URL_LAN || '';
  }
  return process.env.NEXT_PUBLIC_API_URL_LOCAL || '';
}
