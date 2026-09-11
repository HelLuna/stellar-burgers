import { useSelector } from '../../services/store';

import styles from './constructor-page.module.css';

import { BurgerIngredients } from '../../components';
import { BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';
import { FC } from 'react';
import { selectIngredientsError, selectIngredientsIsLoading } from '@selectors';

export const ConstructorPage: FC = () => {
  const isLoading = useSelector(selectIngredientsIsLoading);
  const error = useSelector(selectIngredientsError);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={`text text_type_main-medium mt-10 ${styles.title}`}>
        {error}
      </p>
    );
  }

  return (
    <main className={styles.containerMain}>
      <h1
        className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
      >
        Соберите бургер
      </h1>
      <div className={`${styles.main} pl-5 pr-5`}>
        <BurgerIngredients />
        <BurgerConstructor />
      </div>
    </main>
  );
};
