import { test, expect, Page } from '@playwright/test';
import ingredientsMock from './hars/ingredients.json';

const INGREDIENTS_HAR = './tests/hars/ingredients.har';
const { data: ingredients } = ingredientsMock;
const [bun, anotherBun] = ingredients.filter((item) => item.type === 'bun');
const [main] = ingredients.filter((item) => item.type === 'main');
const [sauce] = ingredients.filter((item) => item.type === 'sauce');

const getIngredientCard = (page: Page, name: string) =>
  page
    .getByTestId('ingredient-card')
    .filter({ has: page.getByText(name, { exact: true }) });

const addIngredient = async (page: Page, name: string) =>
  await getIngredientCard(page, name)
    .getByRole('button', { name: 'Добавить' })
    .click();

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(INGREDIENTS_HAR, {
      url: '**/api/ingredients',
      update: false
    });

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

  test('В ответе на запрос api/ingredients приходят моковые данные', async ({
    page
  }) => {
    const responsePromise = page.waitForResponse('**/api/ingredients');
    await page.goto('/');
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(ingredientsMock);
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

      await expect(page.getByTestId('constructor-bun-top')).toContainText(
        bun.name
      );
      await expect(page.getByTestId('constructor-ingredient')).toHaveCount(3);
      await expect(page.getByTestId('constructor-bun-bottom')).toContainText(
        bun.name
      );
      await expect(page.getByTestId('constructor-price')).toHaveText(
        String(bun.price * 2 + main.price * 2 + sauce.price)
      );
    });
  });
});
