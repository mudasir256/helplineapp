import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { adoptionApi } from './api/adoptionApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [adoptionApi.reducerPath]: adoptionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      adoptionApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

