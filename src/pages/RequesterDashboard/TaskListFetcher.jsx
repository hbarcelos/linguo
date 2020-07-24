import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useShallowEqualSelector } from '~/adapters/react-redux';
import { useRefreshEffectOnce } from '~/adapters/react-router-dom';
import TaskList from '~/features/tasks/TaskList';
import { fetchTasks, selectTasks } from '~/features/requester/requesterSlice';
import DismissableAlert from '~/features/ui/DismissableAlert';
import { selectAccount } from '~/features/web3/web3Slice';
import filters, { getFilter, useFilterName } from './filters';
import { getComparator } from './sorting';

export default function TaskListFetcher() {
  const dispatch = useDispatch();
  const account = useSelector(selectAccount);

  const doFetchTasks = React.useCallback(() => {
    dispatch(fetchTasks({ account }));
  }, [dispatch, account]);

  React.useEffect(() => {
    doFetchTasks();
  }, [doFetchTasks]);

  useRefreshEffectOnce(doFetchTasks);

  const [filterName] = useFilterName();

  const data = useShallowEqualSelector(selectTasks(account));
  const displayableData = React.useMemo(() => sort(filter(data, getFilter(filterName)), getComparator(filterName)), [
    data,
    filterName,
  ]);

  const showFootnote = [filters.open].includes(filterName) && displayableData.length > 0;
  const showFilterDescription = displayableData.length > 0;

  return (
    <>
      {showFilterDescription && filterDescriptionMap[filterName]}
      <TaskList data={displayableData} showFootnote={showFootnote} />
    </>
  );
}

const sort = (data, comparator) => [...data].sort(comparator);
const filter = (data, predicate) => data.filter(predicate);

const StyledDismissableAlert = styled(DismissableAlert)`
  margin-bottom: 1rem;

  p + p {
    margin-top: 0;
  }
`;

const filterDescriptionMap = {
  [filters.open]: (
    <StyledDismissableAlert
      id="requester.filters.open"
      message="These are the tasks created by you which were not picked by any translators yet."
    />
  ),
  [filters.inProgress]: (
    <StyledDismissableAlert
      id="requester.filters.inProgress"
      message="Translators are currently working on these tasks."
    />
  ),
  [filters.inReview]: (
    <StyledDismissableAlert
      id="requester.filters.inReview"
      message="The translated texts have been delivered by the translators."
      description={
        <>
          <p>
            They will be under review for some time to allow other translators to evaluate the quality of the work done.
          </p>
          <p>
            If there are issues with the translation, anyone (including yourself) can raise a challenge against any of
            the translations bellow.
          </p>
        </>
      }
    />
  ),
  [filters.inDispute]: (
    <StyledDismissableAlert
      id="requester.filters.inDispute"
      message="The translations bellow are being evaluated by specialized jurors on Kleros."
    />
  ),
  [filters.finished]: (
    <StyledDismissableAlert
      id="requester.filters.finished"
      message="The translations bellow were delivered and their translators received their payments."
    />
  ),
  [filters.incomplete]: (
    <StyledDismissableAlert
      id="requester.filters.incomplete"
      message="Incomplete task are those which were not assigned to any translator or whose translator did not submit the translated text within the specified deadline."
    />
  ),
};
