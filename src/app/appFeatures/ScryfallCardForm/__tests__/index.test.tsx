import * as React from 'react';
import { Store } from '@reduxjs/toolkit';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styles/theme/ThemeProvider';
import { HelmetProvider } from 'react-helmet-async';
import { ScryfallCardForm, repoErrorText } from '..';
import { configureAppStore } from 'store/configureStore';
import { scryfallCardFormActions as actions, initialState } from '../slice';
import { RepoErrorType } from '../slice/types';

function* mockScryfallCardFormSaga() {}

jest.mock('../slice/saga', () => ({
  scryfallCardFormSaga: mockScryfallCardFormSaga,
}));

const renderScryfallCardForm = (store: Store) =>
  render(
    <Provider store={store}>
      <ThemeProvider>
        <HelmetProvider>
          <ScryfallCardForm />
        </HelmetProvider>
      </ThemeProvider>
    </Provider>,
  );

describe('<ScryfallCardForm />', () => {
  let store: ReturnType<typeof configureAppStore>;
  let component: ReturnType<typeof renderScryfallCardForm>;

  beforeEach(() => {
    store = configureAppStore();
    component = renderScryfallCardForm(store);
    store.dispatch(actions.reposLoaded([]));
    expect(store.getState().scryfallCardForm).toEqual(initialState);
  });
  afterEach(() => {
    component.unmount();
  });

  it("should fetch repos on mount if username isn't empty", () => {
    component.unmount();
    component = renderScryfallCardForm(store);
    expect(initialState.username.length).toBeGreaterThan(0);
    expect(store.getState().scryfallCardForm.loading).toBe(true);
  });

  it("shouldn't fetch repos on mount if username is empty", () => {
    store.dispatch(actions.changeUsername(''));
    store.dispatch(actions.reposLoaded([]));
    component.unmount();
    component = renderScryfallCardForm(store);
    expect(store.getState().scryfallCardForm.loading).toBe(false);
  });

  it('should dispatch action on username change', () => {
    const input = component.container.querySelector('input');
    fireEvent.change(input!, { target: { value: 'test' } });
    expect(store.getState().scryfallCardForm.loading).toBe(true);
  });

  it('should change username field value on action', () => {
    const value = 'test';
    const form = renderScryfallCardForm(store);

    const input = form.container.querySelector('input');
    fireEvent.change(input!, { target: { value: value } });

    expect(form.container.querySelector('input')?.value).toBe(value);
  });

  it('should display loading indicator when state is loading', () => {
    store.dispatch(actions.loadRepos());
    expect(component.container.querySelector('circle')).toBeInTheDocument();
  });

  it('should display list when repos not empty', async () => {
    const repoName = 'testRepo';
    store.dispatch(
      actions.reposLoaded([{ id: 'test', name: repoName } as any]),
    );
    await waitFor(() =>
      expect(component.queryByText(repoName)).toBeInTheDocument(),
    );
  });

  it('should display error when repoError fired', async () => {
    let error = RepoErrorType.USER_NOT_FOUND;
    store.dispatch(actions.repoError(error));
    await waitFor(() =>
      expect(component.queryByText(repoErrorText(error))).toBeInTheDocument(),
    );

    error = RepoErrorType.USER_HAS_NO_REPO;
    store.dispatch(actions.repoError(error));
    await waitFor(() =>
      expect(component.queryByText(repoErrorText(error))).toBeInTheDocument(),
    );

    error = RepoErrorType.USERNAME_EMPTY;
    store.dispatch(actions.repoError(error));
    await waitFor(() =>
      expect(component.queryByText(repoErrorText(error))).toBeInTheDocument(),
    );

    error = RepoErrorType.RESPONSE_ERROR;
    store.dispatch(actions.repoError(error));
    await waitFor(() =>
      expect(component.queryByText(repoErrorText(error))).toBeInTheDocument(),
    );

    error = RepoErrorType.GITHUB_RATE_LIMIT;
    store.dispatch(actions.repoError(error));
    await waitFor(() =>
      expect(component.queryByText(repoErrorText(error))).toBeInTheDocument(),
    );
  });
});