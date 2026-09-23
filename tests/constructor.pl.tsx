import { test, expect, Page, Locator } from '@playwright/test';
import ingredientsMock from './hars/ingredients.json';
import orderMock from './hars/order.json';
import userMock from './hars/user.json';

const INGREDIENTS_HAR = './tests/hars/ingredients.har';
const USER_HAR = './tests/hars/user.har';
const ORDER_HAR = './tests/hars/order.har';

const ACCESS_TOKEN = 'Bearer test-access-token';
const REFRESH_TOKEN = 'test-refresh-token';

const { data: ingredients } = ingredientsMock;
const [bun, anotherBun] = ingredients.filter((item) => item.type === 'bun');
const [main] = ingredients.filter((item) => item.type === 'main');
const [sauce] = ingredients.filter((item) => item.type === 'sauce');

const mockIngredients = async (page: Page) => {
  await page.routeFromHAR(INGREDIENTS_HAR, {
    url: '**/api/ingredients',
    update: false
  });
};

const mockUser = async (page: Page) => {
  await page.routeFromHAR(USER_HAR, {
    url: '**/api/auth/user',
    update: false
  });
};

const mockOrder = async (page: Page) => {
  await page.routeFromHAR(ORDER_HAR, {
    url: '**/api/orders',
    update: false
  });
};

const getIngredientCard = (page: Page, name: string) =>
  page
    .getByTestId('ingredient-card')
    .filter({ has: page.getByText(name, { exact: true }) });

const addIngredient = async (page: Page, name: string) =>
  await getIngredientCard(page, name)
    .getByRole('button', { name: 'Добавить' })
    .click();

const openIngredientModal = async (page: Page, name: string) =>
  await getIngredientCard(page, name).getByRole('link').click();

test.describe('Перехват запроса api/ingredients', () => {
  test('В ответе на запрос приходят моковые данные', async ({ page }) => {
    await mockIngredients(page);
    const responsePromise = page.waitForResponse('**/api/ingredients');
    await page.goto('/');
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(ingredientsMock);
  });
});

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredients(page);
    await page.goto('/');
  });

  test('Загрузка ингредиентов из HAR-файла', async ({ page }) => {
    await expect(page.getByTestId('loading')).not.toBeVisible();

    const ingredientsList = page.getByTestId('ingredients-list');
    await expect(ingredientsList).toBeVisible();
    await expect(ingredientsList.getByTestId('ingredient-card')).toHaveCount(
      ingredients.length
    );

    await expect(ingredientsList.getByText(bun.name)).toBeVisible();
    await expect(ingredientsList.getByText(main.name)).toBeVisible();
    await expect(ingredientsList.getByText(sauce.name)).toBeVisible();
  });

  test.describe('Добавление ингредиентов в конструктор', () => {
    test('Добавление булки', async ({ page }) => {
      const burgerConstructor = page.getByTestId('burger-constructor');
      const bunCard = getIngredientCard(page, bun.name);

      await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(
        2
      );
      await expect(bunCard.getByTestId('ingredient-counter')).toHaveCount(0);

      await addIngredient(page, bun.name);

      await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(
        0
      );
      await expect(page.getByTestId('constructor-bun-top')).toContainText(
        `${bun.name} (верх)`
      );
      await expect(page.getByTestId('constructor-bun-bottom')).toContainText(
        `${bun.name} (низ)`
      );
      await expect(bunCard.getByTestId('ingredient-counter')).toHaveText('2');
    });

    test('Замена булки', async ({ page }) => {
      await addIngredient(page, bun.name);
      await addIngredient(page, anotherBun.name);

      await expect(page.getByTestId('constructor-bun-top')).toContainText(
        `${anotherBun.name} (верх)`
      );
      await expect(page.getByTestId('constructor-bun-bottom')).toContainText(
        `${anotherBun.name} (низ)`
      );
      await expect(page.getByTestId('constructor-bun-top')).not.toContainText(
        bun.name
      );

      await expect(
        getIngredientCard(page, bun.name).getByTestId('ingredient-counter')
      ).toHaveCount(0);
      await expect(
        getIngredientCard(page, anotherBun.name).getByTestId(
          'ingredient-counter'
        )
      ).toHaveText('2');
    });

    test('Добавление начинки и соуса', async ({ page }) => {
      const constructorIngredients = page.getByTestId(
        'constructor-ingredients'
      );
      const constructorItems = constructorIngredients.getByTestId(
        'constructor-ingredient'
      );

      await expect(
        constructorIngredients.getByText('Выберите начинку')
      ).toBeVisible();
      await expect(constructorItems).toHaveCount(0);

      await addIngredient(page, main.name);

      await expect(
        constructorIngredients.getByText('Выберите начинку')
      ).toHaveCount(0);
      await expect(constructorItems).toHaveCount(1);
      await expect(constructorItems.nth(0)).toContainText(main.name);

      await addIngredient(page, sauce.name);

      await expect(constructorItems).toHaveCount(2);
      await expect(constructorItems.nth(0)).toContainText(main.name);
      await expect(constructorItems.nth(1)).toContainText(sauce.name);

      await addIngredient(page, main.name);

      await expect(constructorItems).toHaveCount(3);
      await expect(constructorItems.nth(2)).toContainText(main.name);
      await expect(
        getIngredientCard(page, main.name).getByTestId('ingredient-counter')
      ).toHaveText('2');
      await expect(
        getIngredientCard(page, sauce.name).getByTestId('ingredient-counter')
      ).toHaveText('1');
    });

    test('Сборка бургера и итоговая цена', async ({ page }) => {
      await expect(page.getByTestId('constructor-price')).toHaveText('0');

      await addIngredient(page, bun.name);
      await addIngredient(page, sauce.name);
      await addIngredient(page, main.name);
      await addIngredient(page, main.name);

      await expect(page.getByTestId('constructor-price')).toHaveText(
        String(bun.price * 2 + main.price * 2 + sauce.price)
      );
    });
  });

  test.describe('Модальное окно ингредиента', () => {
    const getNutritionValue = (modal: Locator, label: string) =>
      modal.getByRole('listitem').filter({ hasText: label });

    test('Открытие модального окна ингредиента', async ({ page }) => {
      await expect(page.getByTestId('modal')).toHaveCount(0);
      await openIngredientModal(page, main.name);

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();
      await expect(
        modal.getByRole('heading', { name: 'Детали ингредиента' })
      ).toBeVisible();
      await expect(
        modal.getByRole('heading', { name: main.name })
      ).toBeVisible();

      await expect(getNutritionValue(modal, 'Калории, ккал')).toContainText(
        String(main.calories)
      );
      await expect(getNutritionValue(modal, 'Белки, г')).toContainText(
        String(main.proteins)
      );
      await expect(getNutritionValue(modal, 'Жиры, г')).toContainText(
        String(main.fat)
      );
      await expect(getNutritionValue(modal, 'Углеводы, г')).toContainText(
        String(main.carbohydrates)
      );

      await expect(page).toHaveURL(`/ingredients/${main._id}`);
    });

    test('Закрытие модального окна по крестику', async ({ page }) => {
      await openIngredientModal(page, sauce.name);

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();

      await modal.getByRole('button').click();

      await expect(modal).toHaveCount(0);
      await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
      await expect(page).toHaveURL('/');
    });

    test('Закрытие модального окна по клику на оверлей', async ({ page }) => {
      await openIngredientModal(page, bun.name);

      const modal = page.getByTestId('modal');
      await expect(modal).toBeVisible();

      await page
        .getByTestId('modal-overlay')
        .click({ position: { x: 5, y: 5 } });

      await expect(modal).toHaveCount(0);
      await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
      await expect(page).toHaveURL('/');
    });
  });
});

test.describe('Создание заказа', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: ACCESS_TOKEN,
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.addInitScript((token) => {
      localStorage.setItem('refreshToken', token);
    }, REFRESH_TOKEN);

    await mockIngredients(page);
    await mockUser(page);
    await mockOrder(page);

    await page.goto('/');
  });

  test('Пользователь авторизован по моковым данным', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: userMock.user.name })
    ).toBeVisible();
  });

  test('Оформление заказа', async ({ page }) => {
    await addIngredient(page, anotherBun.name);
    await addIngredient(page, main.name);
    await addIngredient(page, sauce.name);

    const orderRequestPromise = page.waitForRequest(
      (request) =>
        request.url().includes('/api/orders') && request.method() === 'POST'
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const orderRequest = await orderRequestPromise;
    expect(orderRequest.headers().authorization).toBe(ACCESS_TOKEN);
    expect(orderRequest.postDataJSON()).toEqual({
      ingredients: [anotherBun._id, main._id, sauce._id, anotherBun._id]
    });

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: String(orderMock.order.number) })
    ).toBeVisible();
    await expect(modal).toContainText('идентификатор заказа');

    const burgerConstructor = page.getByTestId('burger-constructor');
    await expect(burgerConstructor.getByText('Выберите булки')).toHaveCount(2);
    await expect(burgerConstructor.getByText('Выберите начинку')).toBeVisible();
    await expect(page.getByTestId('constructor-ingredient')).toHaveCount(0);
    await expect(page.getByTestId('constructor-price')).toHaveText('0');

    await modal.getByRole('button').click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('modal-overlay')).toHaveCount(0);
  });
});
