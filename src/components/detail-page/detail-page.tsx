import { FC } from 'react';
import clsx from 'clsx';
import styles from './detail-page.module.css';
import { TDetailPageProps } from './type';

export const DetailPage: FC<TDetailPageProps> = ({
  title,
  titleClass = 'text_type_main-large',
  children
}) => (
  <div className={styles.wrap}>
    <p className={clsx('text', titleClass, styles.header)}>{title}</p>
    {children}
  </div>
);
