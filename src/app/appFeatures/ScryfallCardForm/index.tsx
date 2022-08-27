import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { useSelector, useDispatch } from 'react-redux';
import { FormLabel } from 'app/components/FormLabel';
import { Input } from './components/Input';
import { RepoItem } from './RepoItem';
import { card } from 'types/Repo';
import { TextButton } from './components/TextButton';
import {
  selectScryfallCard,
  selectScryfallCardMap,
  selectScryfallLoading,
  selectScryfallSuggestions,
  selectUsername,
  selectRepos,
  selectLoading,
  selectError,
} from './slice/selectors';
import { LoadingIndicator } from 'app/components/LoadingIndicator';
import { RepoErrorType } from './slice/types';
import { useScryfallCardFormSlice } from './slice';

import * as Scry from 'scryfall-sdk';
import Autosuggest from 'react-autosuggest';

export function ScryfallCardForm() {
  const { actions } = useScryfallCardFormSlice();

  // [ ] TODO <-- Start section of selectors to remove after adding sagas
  const username = useSelector(selectUsername);
  const repos = useSelector(selectRepos);
  const isLoading = useSelector(selectLoading);
  const error = useSelector(selectError);
  // --/> End section of selectors to remove after adding sagas

  const scryfallCard = useSelector(selectScryfallCard);
  let varScryfallCard = scryfallCard;
  let cardMaps = useSelector(selectScryfallCardMap);
  const scryfallCardMaps = useSelector(selectScryfallCardMap);
  const scryfallIsLoading = useSelector(selectScryfallLoading);
  const scryfallSuggestions = useSelector(selectScryfallSuggestions);
  let cardSuggestions = [] as Array<string>;

  const [rulingModalDisplay, setRulingModalDisplay] = useState(true);
  const [scryRulings = [] as Scry.Ruling[], setScryRulings] = useState<
    Array<Scry.Ruling>
  >([]);
  const [stringRulings = [] as Array<string>, setStringRulings] = useState<
    Array<string>
  >([]);

  const dispatch = useDispatch();

  const getSuggestionValue = suggestion => suggestion;

  // [ ] TODO Needs to be updated with styled component so we can have a nicer UI and theming.
  const renderSuggestion = suggestion => <div>{suggestion}</div>;

  const autoSuggestOnChange = async (_event, { newValue, method }) => {
    if (!scryfallIsLoading) {
      dispatch(actions.changeScryfallCard(newValue));
    } else {
      console.log('changeScryfallCard: Still Loading...');
    }
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    const searchValue = value
      .replace(new RegExp(/(\w*:\w*)\w/), '')
      .trim()
      .toLowerCase();
    if (!scryfallIsLoading) {
      dispatch(actions.changeScryfallCard(value));
      cardSuggestions = await Scry.Cards.autoCompleteName(searchValue);
      dispatch(actions.changeScryfallSuggestions(cardSuggestions));
      varScryfallCard = value;
    } else {
      console.log('changeScryfallCard: Still Loading...');
    }
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = async () => {};

  const onSuggestionSelected = async (
    _event,
    { suggestion, suggestionValue, suggestionIndex, method },
  ) => {
    varScryfallCard = '!"' + suggestionValue + '"';
    sendScryfallCard(suggestionValue);
  };

  const autoSuggestOnSubmit = event => {
    if (event.keyCode === 13) {
      sendScryfallCard(varScryfallCard);
    }
  };

  // Autosuggest will pass through all these props to the input.
  const inputProps = {
    placeholder: 'Type a card search',
    value: varScryfallCard,
    autoFocus: true,
    pattern: '[sS]*S[sS]*',
    minlength: '1',
    onChange: autoSuggestOnChange,
    onKeyDown: autoSuggestOnSubmit,
  };

  const onChangeScryfallCard = async (
    evt: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!scryfallIsLoading) {
      // dispatch(actions.scryfallLoading(true));
      dispatch(actions.changeScryfallCard(evt.currentTarget.value));
      cardSuggestions = await Scry.Cards.autoCompleteName(
        evt.currentTarget.value,
      );
      console.log(cardSuggestions);
      dispatch(actions.changeScryfallSuggestions(cardSuggestions));
    } else {
      console.log('changeScryfallCard: Still Loading...');
    }
  };

  const sendScryfallCard = (scryfallSearchValue: string) => {
    console.log('sending value:' + scryfallSearchValue);
    if (!scryfallIsLoading) {
      dispatch(actions.scryfallLoading(true));
      console.log('sending value:' + scryfallSearchValue);
      dispatch(actions.changeScryfallCard(scryfallSearchValue));

      const tempCardMap = [] as unknown as card[];

      const cardSearchResults = Scry.Cards.search(scryfallSearchValue)
        .on('data', card => {
          const tempCardFaces = card.card_faces;

          const tempcardimage_uris = tempCardFaces.map(obj => {
            if (obj.image_uris) {
              return obj.image_uris.png;
            } else {
              return '';
            }
          });

          let newActualData;
          const cardRules = fetch(card.rulings_uri)
            .then(response => response.json())
            .then(actualData => (newActualData = actualData));

          const currentCard: card = {
            name: card.name,
            img: card.image_uris?.png ?? '',
            card_faces: tempcardimage_uris,
            rulings_uri: card.rulings_uri,
          } as card;
          cardRules.then(newActualData =>
            newActualData.data.map(obj =>
              stringRulings.push(card.name + ' Rulings: ' + obj.comment),
            ),
          );
          tempCardMap.push(currentCard);
        })
        .on('end', () => {
          cardMaps = tempCardMap;
          dispatch(actions.scryfallLoading(false));
          dispatch(actions.scryfallCardMapLoaded(cardMaps));
        });
    } else {
      console.log('changeScryfallCard: Still Loading...');
    }

    if (!scryfallIsLoading) {
      dispatch(actions.changeScryfallCard(''));
      cardSuggestions = [];
      console.log(cardSuggestions);
      dispatch(actions.changeScryfallSuggestions(cardSuggestions));
    } else {
      console.log('changeScryfallCard: Still Loading...');
    }
  };

  const setRandomCard = () => {
    const randomCard = Scry.Cards.random();
    randomCard.then(randomCardData => {
      let varScryfallCard = '!"' + randomCardData.name + '"';
      sendScryfallCard(varScryfallCard);
    });
  };

  const getSingleCardRules = async cardName => {
    const card = await Scry.Cards.byName(cardName);
    let rulings = [] as Scry.Ruling[];
    rulings = await card.getRulings();
    setScryRulings(rulings);
    console.log(rulings);
    console.log('stringRulings:');
    return rulings;
  };

  const setRulingModal = (value: boolean) => setRulingModalDisplay(value);

  const getCardRules = async () => {
    const card = await Scry.Cards.byName(cardMaps[0].name);
    let rulings = [] as Scry.Ruling[];
    rulings = await card.getRulings();
    setStringRulings([]);
    setScryRulings(rulings);
    console.log(rulings);
    rulings.map((ruling, index) => {
      console.log('Rule' + index + ':' + ruling.published_at);
      console.log('Rule' + index + ':' + ruling.comment);
      stringRulings.push(
        'Rule' +
          index +
          ':' +
          'Date' +
          ruling.published_at +
          ': ' +
          ruling.comment,
      );
      return scryRulings;
    });
    console.log('stringRulings:' + stringRulings);
    return scryRulings;
  };

  const useEffectOnMount = (effect: React.EffectCallback) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, []);
  };

  useEffectOnMount(() => {
    // Use a similar dispatch event on load once sagas is added so you can have an
    // initial autosuggest ready but not rendered.
    // if (username && username.trim().length > 0) {
    //   dispatch(actions.loadRepos());
    // }
    setRandomCard();
  });

  const onClick: React.MouseEventHandler<HTMLElement> = e => {
    if (e.currentTarget.style.transform !== 'rotate(' + 90 + 'deg)') {
      e.currentTarget.style.transform = 'rotate(' + 90 + 'deg)';
    } else {
      e.currentTarget.style.transform = 'rotate(' + 0 + 'deg)';
    }
    const inputElements = document.getElementsByTagName('input');
    const inputElement = inputElements[0];
    inputElement.focus();
    inputElement.select();
  };

  // [ ] TODO Attach this to theme system when finished being setup
  const autoSuggestTheme = {
    suggestionHighlighted: {
      color: 'red',
      background: 'rgba(40, 49, 165, .69)',
    },
    bar: {
      color: 'blue',
    },
  };

  return (
    <Wrapper>
      <AutosuggestWrapper>
        <Autosuggest
          suggestions={scryfallSuggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          onSuggestionSelected={onSuggestionSelected}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          theme={autoSuggestTheme}
        />
      </AutosuggestWrapper>
      <AsideSearchButtonsContainer>
        <AsideButton onClick={setRandomCard}>Random Card</AsideButton>
        <AsideButton
          onClick={function () {
            getCardRules();
            setRulingModal(true);
          }}
        >
          Get Rules
        </AsideButton>
        <AsideButton onClick={setRandomCard}>Random Card</AsideButton>
        <ResultsData>Count: {scryfallCardMaps.length}</ResultsData>
      </AsideSearchButtonsContainer>
      {scryfallCardMaps?.length > 0 ? (
        <ModalDataList
          displaymodal={rulingModalDisplay}
          onClick={function () {
            setRulingModal(false);
          }}
        >
          <ResultsDataContainer>
            <ResultsData>Count: {scryRulings.length}</ResultsData>
            <ResultsData>Search: {varScryfallCard}</ResultsData>
            <ResultsData>
              Rulings:
              {scryRulings.map((ruling, index) => (
                <RuleElement
                  style={{ color: 'white' }}
                  key={index + ruling.published_at}
                >
                  Rule#{index + 1}: {ruling.published_at}:: {ruling.comment}
                </RuleElement>
              ))}
            </ResultsData>
          </ResultsDataContainer>
        </ModalDataList>
      ) : error ? (
        <ErrorText>{repoErrorText(error)}</ErrorText>
      ) : null}
      {scryfallCardMaps?.length > 0 ? (
        <List>
          {scryfallCardMaps.map(card => (
            <CardElement style={{ color: 'white' }} key={card.name}>
              <CardImageRoot>
                {card.card_faces?.length === 1 ? (
                  <CardImageContainer>
                    {card.card_faces.map((obj, index) => (
                      <CardImages key={index}>
                        {' '}
                        <CardImage
                          onClick={onClick}
                          src={obj}
                          alt={card.name}
                        />{' '}
                      </CardImages>
                    )) ?? null}
                  </CardImageContainer>
                ) : card.card_faces?.length === 2 ? (
                  <CardImageContainer>
                    {card.card_faces.map((obj, index) => (
                      <CardImages key={index}>
                        {' '}
                        <CardImage
                          onClick={onClick}
                          src={obj}
                          alt={card.name}
                        />{' '}
                      </CardImages>
                    )) ?? null}
                  </CardImageContainer>
                ) : card.card_faces?.length > 2 ? (
                  <CardImageContainer>
                    {card.card_faces.map((obj, index) => (
                      <CardImages key={index}>
                        {' '}
                        <CardImage
                          onClick={onClick}
                          src={obj}
                          alt={card.name}
                        />{' '}
                      </CardImages>
                    )) ?? null}
                  </CardImageContainer>
                ) : error ? (
                  <ErrorText>{repoErrorText(error)}</ErrorText>
                ) : null}
              </CardImageRoot>
              <CardLowerDetails>
                Name: {card.name}
                <br></br>
                Data: {card.rulings_uri ?? null}
              </CardLowerDetails>
            </CardElement>
          ))}
        </List>
      ) : error ? (
        <ErrorText>{repoErrorText(error)}</ErrorText>
      ) : null}
    </Wrapper>
  );
}

export const repoErrorText = (error: RepoErrorType) => {
  switch (error) {
    case RepoErrorType.USER_NOT_FOUND:
      return 'There is no such user 😞';
    case RepoErrorType.USERNAME_EMPTY:
      return 'Type any Github username';
    case RepoErrorType.USER_HAS_NO_REPO:
      return 'User has no repository 🥺';
    case RepoErrorType.GITHUB_RATE_LIMIT:
      return 'Looks like github api`s rate limit(60 request/h) has exceeded 🤔';
    default:
      return 'An error has occurred!';
  }
};

const ModalDataList = styled.div.attrs(
  (props: { displaymodal: boolean }) => props,
)`
  scroll-snap-type: y mandatory;
  scroll-snap-points-y: repeat(100vh);
  scroll-padding-top: 50px;
  display: ${selfProps => (selfProps.displaymodal === true ? 'block' : 'none')};
  flex-direction: column;
  overflow-y: scroll;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 72px;
  justify-content: flex-start;
  align-items: center;
  z-index: 1000;
`;

const AutosuggestWrapper = styled.div`
  color: white;
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  position: fixed;
  left: 0px;
  top: 0px;
  z-index: 990;
  padding: 20px;
  font-size: 28px;

  input:invalid {
    color: red;
  }
`;

const AsideSearchButtonsContainer = styled.div`
  display: flex;
  position: fixed;
  top: 20px;
  z-index: 990;
`;

const AsideButton = styled.button`
  margin: 0px 20px;
`;

const Wrapper = styled.div`
  position: absolute;
  width: 100vw;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  ${TextButton} {
    margin: 16px 0;
    font-size: 0.875rem;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;

  ${Input} {
    width: ${100}%;
    margin-right: 0.5rem;
    font-size: 60px;
    height: auto;
  }
`;

const ErrorText = styled.span`
  color: ${p => p.theme.text};
`;

const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  position: fixed;
  top: 0px;
  z-index: 990;
  ${FormLabel} {
    margin-bottom: 0.25rem;
    margin-left: 0.125rem;
  }
`;

const ResultsDataContainer = styled.div`
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  top: 112px;
  z-index: 990;
  color: white;
  right: 0px;
  margin: 0px 20px;
`;

const ResultsData = styled.div`
  color: white;
`;

const SuggestionsList = styled.div`
  position: fixed;
  top: 130px;
  z-index: 99999;
  overflow-y: scroll;
  height: 90vh;
`;

const Suggestion = styled.div`
  padding: 5px;
  font-size: 1.5em;
`;

const List = styled.div`
  scroll-snap-type: y mandatory;
  scroll-snap-points-y: repeat(200vh);
  scroll-padding-top: 10px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 72px;
  justify-content: flex-start;
  align-items: center;
  padding-top: 10px;
`;

const CardElement = styled.div`
  scroll-snap-align: start;
  margin-bottom: 30vh;
  height: 80vh;
  width: 80vw;
`;

const CardImageRoot = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardImageContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardImages = styled.div`
  height: 100%
`;

const CardImage = styled.img`
  height: 100%;
  width: 100%;
`;

const CardLowerDetails = styled.div`
  position: relative;
  bottom: -4vh;
`;

const RuleElement = styled.div``;
