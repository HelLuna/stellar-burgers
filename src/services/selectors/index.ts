import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectIngredients = (state: RootState) => state.ingredients.items;
export const selectIngredientsIsLoading = (state: RootState) =>
  state.ingredients.isLoading;
export const selectIngredientsError = (state: RootState) =>
  state.ingredients.error;

export const selectBuns = createSelector([selectIngredients], (items) =>
  items.filter((item) => item.type === 'bun')
);
export const selectMains = createSelector([selectIngredients], (items) =>
  items.filter((item) => item.type === 'main')
);
export const selectSauces = createSelector([selectIngredients], (items) =>
  items.filter((item) => item.type === 'sauce')
);

export const selectConstructorItems = (state: RootState) => state.burger;

export const selectFeed = (state: RootState) => state.feed;
export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedIsLoading = (state: RootState) => state.feed.isLoading;

export const selectOrderRequest = (state: RootState) =>
  state.order.orderRequest;
export const selectOrderModalData = (state: RootState) =>
  state.order.orderModalData;
export const selectOrderByNumber = (state: RootState) =>
  state.order.orderByNumber;

export const selectUserOrders = (state: RootState) => state.userOrders.orders;
export const selectUserOrdersIsLoading = (state: RootState) =>
  state.userOrders.isLoading;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthChecked = (state: RootState) =>
  state.user.isAuthChecked;
export const selectUserError = (state: RootState) => state.user.error;
