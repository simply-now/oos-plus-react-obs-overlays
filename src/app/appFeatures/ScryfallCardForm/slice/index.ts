import { PayloadAction } from '@reduxjs/toolkit';
import { card, Repo } from 'types/Repo';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'utils/redux-injectors';
import { scryfallCardFormSaga } from './saga';
import { ScryfallCardFormState, RepoErrorType } from './types';

export const initialState: ScryfallCardFormState = {
  scryfallCard: '',
  scryfallCardMap: [],
  scryfallLoading: false,
  scryfallSuggestions: [],
  loading: false,
  error: null,
  username: 'react-boilerplate',
  repositories: [],
};

const slice = createSlice({
  name: 'scryfallCardForm',
  initialState,
  reducers: {
    scryfallLoading(state, action: PayloadAction<boolean>) {
      state.scryfallLoading = action.payload;
      state.scryfallCardMap = [];
    },
    changeScryfallCard(state, action: PayloadAction<string>) {
      state.scryfallCard = action.payload;
    },
    changeScryfallSuggestions(state, action: PayloadAction<Array<string>>) {
      state.scryfallSuggestions = action.payload;
    },
    scryfallCardMapLoaded(state, action: PayloadAction<card[]>) {
      const card = action.payload;
      state.scryfallCardMap = card;
      state.scryfallLoading = false;
    },
    changeUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
    loadRepos(state) {
      state.loading = true;
      state.error = null;
      state.repositories = [];
    },
    reposLoaded(state, action: PayloadAction<Repo[]>) {
      const repos = action.payload;
      state.repositories = repos;
      state.loading = false;
    },
    repoError(state, action: PayloadAction<RepoErrorType>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { actions: scryfallCardFormActions, reducer } = slice;

export const useScryfallCardFormSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  useInjectSaga({ key: slice.name, saga: scryfallCardFormSaga });
  return { actions: slice.actions };
};
