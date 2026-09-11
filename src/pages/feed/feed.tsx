import { selectFeedOrders } from '@selectors';
import { fetchFeeds } from '@slices';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'src/services/store';

export const Feed: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectFeedOrders);

  useEffect(() => {
    dispatch(fetchFeeds());
  }, [dispatch]);

  if (!orders.length) {
    return <Preloader />;
  }

  <FeedUI
    orders={orders}
    handleGetFeeds={() => {
      dispatch(fetchFeeds());
    }}
  />;
};
