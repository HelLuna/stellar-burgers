import { TConstructorIngredient, TIngredient } from '@utils-types';
import {
  addIngredient,
  burgerReducer,
  moveIngredientDown,
  moveIngredientUp,
  removeIngredient,
  TBurgerState
} from '../burger-slice';
import { createOrder } from '../order-slice';

const initialState: TBurgerState = {
  bun: null,
  ingredients: []
};

const mockBun: TIngredient = {
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
};

const mockMain: TIngredient = {
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
};

const mockSauce: TIngredient = {
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
};

const constructorBun: TConstructorIngredient = { ...mockBun, id: 'bun-id' };
const constructorMain: TConstructorIngredient = { ...mockMain, id: 'main-id' };
const secondConstructorMain: TConstructorIngredient = {
  ...mockMain,
  id: 'main-2-id'
};
const constructorSauce: TConstructorIngredient = {
  ...mockSauce,
  id: 'sauce-id'
};

const filledState: TBurgerState = {
  bun: constructorBun,
  ingredients: [constructorMain, constructorSauce, secondConstructorMain]
};

const REQUEST_ID = 'test-request-id';
const orderResponse = {
  success: true,
  name: 'Spicy био-марсианский краторный бургер',
  order: {
    _id: '66d1f0a0c3f7b9001cfa0999',
    status: 'done',
    name: 'Spicy био-марсианский краторный бургер',
    owner: {
      name: 'Тест Тест',
      email: 'test@example.ru',
      createdAt: '2026-09-17T10:00:00.000Z',
      updatedAt: '2026-09-17T10:00:00.000Z'
    },
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z',
    number: 110491,
    price: 3448
  }
};

describe('[burger-slice] проверка работы редьюсера', () => {
  test('Возвращает начальное состояние при неизвестном экшене', () => {
    const state = burgerReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  describe('addIngredient', () => {
    test('Добавляет булку в поле bun', () => {
      const state = burgerReducer(initialState, addIngredient(mockBun));

      expect(state.bun).toEqual({ ...mockBun, id: expect.any(String) });
      expect(state.ingredients).toEqual([]);
    });

    test('Заменяет прошлую булку', () => {
      const state = burgerReducer(filledState, addIngredient(mockBun));

      expect(state.bun).toEqual({ ...mockBun, id: expect.any(String) });
      expect(state.bun?.id).not.toBe(constructorBun.id);
      expect(state.ingredients).toEqual(filledState.ingredients);
    });

    test('Добавляет начинку в конец списка ингредиентов', () => {
      const firstState = burgerReducer(initialState, addIngredient(mockMain));
      const secondState = burgerReducer(firstState, addIngredient(mockSauce));

      expect(firstState.ingredients).toEqual([
        { ...mockMain, id: expect.any(String) }
      ]);
      expect(firstState.bun).toBeNull();

      expect(secondState.ingredients).toEqual([
        ...firstState.ingredients,
        { ...mockSauce, id: expect.any(String) }
      ]);
      expect(secondState.bun).toBeNull();
    });

    test('Каждому добавленному ингредиенту присваивается уникальный id', () => {
      const firstState = burgerReducer(initialState, addIngredient(mockMain));
      const secondState = burgerReducer(firstState, addIngredient(mockMain));

      const [firstMain, secondMain] = secondState.ingredients;

      expect(secondState.ingredients).toHaveLength(2);
      expect(firstMain.id).not.toBe(secondMain.id);
    });
  });

  describe('removeIngredient', () => {
    test('Удаляет ингредиент по id', () => {
      const state = burgerReducer(
        filledState,
        removeIngredient(constructorMain.id)
      );

      expect(state).toEqual({
        ...filledState,
        ingredients: [constructorSauce, secondConstructorMain]
      });
    });

    test('Не меняет состояние, если ингредиента с указанным id нет', () => {
      const state = burgerReducer(filledState, removeIngredient('unknown-id'));

      expect(state).toEqual(filledState);
    });
  });

  describe('moveIngredientUp', () => {
    test('Перемещает ингредиент на позицию выше', () => {
      const state = burgerReducer(filledState, moveIngredientUp(1));

      expect(state.ingredients).toEqual([
        constructorSauce,
        constructorMain,
        secondConstructorMain
      ]);
    });

    test('Список не изменяется, если ингредиент уже первый', () => {
      const state = burgerReducer(filledState, moveIngredientUp(0));

      expect(state).toEqual(filledState);
    });
  });

  describe('moveIngredientDown', () => {
    test('Перемещает ингредиент на позицию ниже', () => {
      const state = burgerReducer(filledState, moveIngredientDown(1));

      expect(state.ingredients).toEqual([
        constructorMain,
        secondConstructorMain,
        constructorSauce
      ]);
    });

    test('Список не изменяется, если ингредиент уже последний', () => {
      const state = burgerReducer(filledState, moveIngredientDown(2));

      expect(state).toEqual(filledState);
    });
  });

  test('createOrder.fulfilled очищает конструктор', () => {
    const state = burgerReducer(
      filledState,
      createOrder.fulfilled(orderResponse, REQUEST_ID, [
        constructorBun._id,
        constructorMain._id,
        constructorSauce._id,
        constructorBun._id
      ])
    );

    expect(state).toEqual(initialState);
  });
});
