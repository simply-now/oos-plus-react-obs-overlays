import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'types';
import { initialState } from '.';

// First select the relevant part from the state
const selectDomain = (state: RootState) =>
  state.scryfallCardForm || initialState;

export const selectScryfallCard = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.scryfallCard,
);

export const selectScryfallCardMap = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.scryfallCardMap,
);

export const selectScryfallLoading = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.scryfallLoading,
);

export const selectScryfallSuggestions = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.scryfallSuggestions,
);

export const selectLoading = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.loading,
);

export const selectError = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.error,
);

// To be removed once we are feature complete with Sagas
export const selectUsername = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.username,
);

// To be removed once we are feature complete with Sagas
export const selectRepos = createSelector(
  [selectDomain],
  scryfallCardFormState => scryfallCardFormState.repositories,
);
