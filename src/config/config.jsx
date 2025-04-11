export const MAPS_CONFIG = {
     apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
     
     // Optional: Add default location if needed
     defaultLocation: "Convention+Center+New+Delhi"
   };
   
   if (!MAPS_CONFIG.apiKey) {
     console.error("Google Maps API key is missing!");
     //  throw an error in development
     if (process.env.NODE_ENV === 'development') {
       throw new Error("Google Maps API key is required");
     }
   }