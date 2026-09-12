import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

export type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  orderByNumber: TOrder | null;
  isOrderLoading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  orderByNumber: null,
  isOrderLoading: false,
  error: null
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  orderBurgerApi
);

export const fetchOrderByNumber = createAsyncThunk(
  'order/getOrderByNumber',
  getOrderByNumberApi
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderModalData: (state) => {
      state.orderModalData = null;
      state.orderRequest = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = {
          ...action.payload.order,
          ingredients: action.meta.arg
        };
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message ?? 'Не удалось оформить заказ';
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isOrderLoading = true;
        state.error = null;
        state.orderByNumber = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.orderByNumber = action.payload.orders[0] ?? null;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isOrderLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить заказ';
      });
  }
});

export const orderReducer = orderSlice.reducer;
export const { clearOrderModalData } = orderSlice.actions;
