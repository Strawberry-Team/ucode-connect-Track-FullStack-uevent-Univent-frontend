// Define the environment
export const isProduction = process.env.NODE_ENV === 'production';

export const BASE_USER_AVATAR_URL = isProduction
    ? '/uploads/user-avatars/' // For production, use relative path
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/user-avatars/`; // For development 

// Configure the API URLs based on the environment
export const BASE_COMPANY_LOGO_URL = isProduction
    ? '/uploads/company-logos/' // For production, use relative path
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/company-logos/`; // For development

export const BASE_EVENT_POSTER_URL = isProduction
    ? '/uploads/event-posters/' // For production, use relative path
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/event-posters/`; // For development
