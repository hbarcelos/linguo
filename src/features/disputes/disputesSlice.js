import { createSlice } from '@reduxjs/toolkit';
import { current } from 'immer';
import { actionChannel, call, getContext, put } from 'redux-saga/effects';
import createLinguoApiContext from '~/features/linguo/createSagaApiContext';
import createAsyncAction, { matchAnyAsyncType } from '~/shared/createAsyncAction';
import createSagaWithRejectionOnCancelation from '~/shared/createSagaWithRejectionOnCancelation';
import createWatcherSaga, { TakeType } from '~/shared/createWatcherSaga';
import { watchAllWithBuffer } from '~/features/web3/runWithContext';
import { Dispute } from './entities';
import { registerTxSaga } from '../transactions/transactionsSlice';

export const initialState = {
  idToTaskId: {},
  byTaskId: {},
  taskIds: [],
};

export const fetchByTaskId = createAsyncAction('disputes/fetchByTaskId');
export const fundAppeal = createAsyncAction('disputes/fundAppeal');

const actions = {
  fetchByTaskId,
  fundAppeal,
};

const disputesSlice = createSlice({
  name: 'disputes',
  initialState,
  extraReducers: builder => {
    builder.addCase(fetchByTaskId.fulfilled, (state, action) => {
      const { taskId, data } = action.payload ?? {};

      if (taskId && data) {
        state.byTaskId[taskId] = state.byTaskId[taskId] ?? {};

        state.byTaskId[taskId].loadingState = 'succeeded';
        state.byTaskId[taskId].data = data;
        state.byTaskId[taskId].error = null;

        state.idToTaskId[data.id] = taskId;

        state.taskIds = [...new Set([...state.taskIds, taskId])];
      }
    });

    builder.addCase(fundAppeal.fulfilled, (state, action) => {
      const { taskId, deposit, party } = action.payload ?? {};
      const dispute = current(state).byTaskId[taskId]?.data;

      if (dispute) {
        state.byTaskId[taskId].data = Dispute.registerAppealFunding(dispute, { deposit, party });
        state.byTaskId[taskId].error = null;
      }
    });

    const createMatcher = matchAnyAsyncType(Object.values(actions));

    builder.addMatcher(createMatcher('pending'), (state, action) => {
      const { taskId } = action.payload ?? {};

      if (state.byTaskId[taskId]) {
        state.byTaskId[taskId].loadingState = 'loading';
        state.byTaskId[taskId].error = null;
      }
    });

    builder.addMatcher(createMatcher('fulfilled'), (state, action) => {
      const { taskId } = action.payload ?? {};

      if (state.byTaskId[taskId]) {
        state.byTaskId[taskId].loadingState = 'succeeded';
        state.byTaskId[taskId].error = null;
      }
    });

    builder.addMatcher(createMatcher('rejected'), (state, action) => {
      const { taskId, error } = action.payload ?? {};

      if (error && state.byTaskId[taskId]) {
        if (error.name !== 'CancellationError') {
          state.byTaskId[taskId].error = error;
          state.byTaskId[taskId].loadingState = 'failed';
        } else {
          state.byTaskId[taskId].loadingState = 'idle';
        }
      }
    });
  },
});

export default disputesSlice.reducer;

const selectLoadingState = taskId => state => state.disputes.byTaskId[taskId]?.loadingState ?? 'idle';
export const selectIsLoadingByTaskId = taskId => state => selectLoadingState(taskId)(state) === 'loading';

export const selectByTaskId = taskId => state => state.disputes.byTaskId[taskId]?.data ?? {};
export const selectErrorByTaskId = taskId => state => state.disputes.byTaskId[taskId]?.error ?? null;
export const selectTaskIdFromDisputeId = id => state => state.disputes.idToTaskId?.[id];

export function* fetchByTaskIdSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const taskId = action.payload?.taskId;
  const meta = action.meta;

  try {
    const data = yield call([linguoApi, 'getTaskDispute'], { ID: taskId });

    yield put(fetchByTaskId.fulfilled({ taskId, data }, { meta }));
  } catch (err) {
    console.warn('Failed to fetch task dispute:', err);
    yield put(fetchByTaskId.rejected({ taskId, error: err }, { meta }));
  }
}

export function* fundAppealSaga(action) {
  const linguoApi = yield getContext('linguoApi');

  const { taskId, party, deposit, account } = action.payload ?? {};
  const { tx: metaTx, ...meta } = action.meta;

  const { tx } = yield call([linguoApi, 'fundAppeal'], { ID: taskId, side: party }, { from: account, value: deposit });

  try {
    yield call(registerTxSaga, tx, {
      ...metaTx,
      *onFailure(resultAction) {
        const error = resultAction.payload?.error;
        yield put(fundAppeal.rejected({ taskId, party, deposit, account, error }, { meta }));

        yield put(fetchByTaskId({ taskId }, { meta }));
      },
    });

    yield put(fundAppeal.fulfilled({ taskId, party, deposit, account }, { meta }));
  } catch (err) {
    yield put(fundAppeal.rejected({ taskId, party, deposit, account, error: err }, { meta }));
  }
}

const createWatchFetchByTaskIdSaga = createWatcherSaga(
  { takeType: TakeType.latest },
  createSagaWithRejectionOnCancelation(fetchByTaskIdSaga, fetchByTaskId.rejected, {
    additionalPayload: action => ({ taskId: action.payload?.taskId }),
    additionalArgs: action => ({ meta: action.meta }),
  })
);

const createWatchFundAppealSaga = createWatcherSaga({ takeType: TakeType.leading }, fundAppealSaga);

export const sagas = {
  mainDisputesSaga: watchAllWithBuffer(
    [
      [createWatchFetchByTaskIdSaga, actionChannel(fetchByTaskId.type)],
      [createWatchFundAppealSaga, actionChannel(fundAppeal.type)],
    ],
    { createContext: createLinguoApiContext }
  ),
};
