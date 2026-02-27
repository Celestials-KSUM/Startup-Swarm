import axiosInstance from '../lib/axios';

export const authApiService = {
    register: async (data: any) => {
        const response = await axiosInstance.post('/auth/register', data);
        return response.data;
    },

    login: async (data: any) => {
        const response = await axiosInstance.post('/auth/login', data);
        return response.data;
    },

    verifyOtp: async (data: { email: string; otp: string }) => {
        const response = await axiosInstance.post('/auth/verify-otp', data);
        return response.data;
    },

    getGoogleAuthUrl: () => {
        return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`;
    },
};
