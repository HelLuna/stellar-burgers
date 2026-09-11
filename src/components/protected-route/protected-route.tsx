import { FC } from 'react';
import { TProtectedRouteProps } from './type';

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  children
}: TProtectedRouteProps) => children;
