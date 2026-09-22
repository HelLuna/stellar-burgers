import { TIngredient } from '@utils-types';
import {
  fetchIngredients,
  ingredientsReducer,
  TIngredientsState
} from '../ingredients-slice';

const initialState: TIngredientsState = {
  items: [],
  isLoading: false,
  error: null
};

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0942',
    name: 'Соус Spicy-X',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 30,
    price: 90,
    image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png'
  }
];

const REQUEST_ID = 'test-request-id';

describe('[ingredients-slice] проверка работы редьюсера', () => {
  test('Возвращает начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('fetchIngredients.pending включает загрузку и сбрасывает ошибку', () => {
    const state = ingredientsReducer(
      { ...initialState, error: 'Прошлая ошибка' },
      fetchIngredients.pending(REQUEST_ID)
    );

    expect(state).toEqual({ ...initialState, isLoading: true, error: null });
  });

  test('fetchIngredients.fulfilled выключает загрузку и записывает ингредиенты', () => {
    const state = ingredientsReducer(
      { ...initialState, isLoading: true },
      fetchIngredients.fulfilled(mockIngredients, REQUEST_ID)
    );

    expect(state).toEqual({ ...initialState, items: mockIngredients });
  });

  test('fetchIngredients.rejected выключает загрузку и записывает ошибку', () => {
    const state = ingredientsReducer(
      { ...initialState, isLoading: true },
      fetchIngredients.rejected(new Error('Нет ответа от сервера'), REQUEST_ID)
    );

    expect(state).toEqual({ ...initialState, error: 'Нет ответа от сервера' });
  });

  test('fetchIngredients.rejected подставляет сообщение об ошибке по умолчанию', () => {
    const state = ingredientsReducer(
      { ...initialState, isLoading: true },
      { type: fetchIngredients.rejected.type, error: {} }
    );

    expect(state).toEqual({
      ...initialState,
      error: 'Не удалось загрузить ингредиенты'
    });
  });
});
