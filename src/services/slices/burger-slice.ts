import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorIngredient, TIngredient } from '@utils-types';
import { createOrder } from './order-slice';

export type TBurgerState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TBurgerState = {
  bun: null,
  ingredients: []
};

const burgerSlice = createSlice({
  name: 'burger',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: nanoid() }
      })
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (item) => item.id !== action.payload
      );
    },
    moveIngredientUp: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index <= 0) return;
      const [item] = state.ingredients.splice(index, 1);
      state.ingredients.splice(index - 1, 0, item);
    },
    moveIngredientDown: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      if (index >= state.ingredients.length - 1) return;
      const [item] = state.ingredients.splice(index, 1);
      state.ingredients.splice(index + 1, 0, item);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, () => initialState);
  }
});

export const burgerReducer = burgerSlice.reducer;
export const {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown
} = burgerSlice.actions;
