import { configureStore } from '@reduxjs/toolkit';
import authSlices from './AuthSlices';

const storeabc = configureStore({
  reducer: {
    auth: authSlices,
  },
});


 export type RootState = ReturnType<typeof storeabc.getState>;
 
export type AppDispatch = typeof storeabc.dispatch;

export default storeabc;