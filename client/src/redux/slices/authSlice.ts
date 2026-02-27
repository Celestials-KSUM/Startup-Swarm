import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApiService } from '../../services/authApiService';

interface AuthState {
    user: any | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    registrationEmail: string | null;
}

const initialState: AuthState = {
    user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    loading: false,
    error: null,
    registrationEmail: typeof window !== 'undefined' ? localStorage.getItem('registrationEmail') : null,
};

export const registerUser = createAsyncThunk(
    'auth/register',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await authApiService.register(data);
            return { response, email: data.email };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await authApiService.login(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (data: { email: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await authApiService.verifyOtp(data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.registrationEmail = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('registrationEmail');
        },
        clearError: (state) => {
            state.error = null;
        },
        setRegistrationEmail: (state, action: PayloadAction<string>) => {
            state.registrationEmail = action.payload;
            localStorage.setItem('registrationEmail', action.payload);
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.registrationEmail = action.payload.email;
                localStorage.setItem('registrationEmail', action.payload.email);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                state.registrationEmail = null;
                localStorage.removeItem('registrationEmail');
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearError, setRegistrationEmail, setToken } = authSlice.actions;
export default authSlice.reducer;
