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
    minLength: '1',
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

  const rotateElement: React.MouseEventHandler<HTMLElement> = e => {
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

  const flipCard = (elementId: string) => {
    const elementToFlip = document.getElementById(elementId);
    if (elementToFlip) {
      elementToFlip.classList.toggle('active');
    }
  };

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
            <CardElement
              className="card-element"
              style={{ color: 'white' }}
              key={card.name + 'name'}
            >
              <CardBtnlist className="btn-list">
                <CardBtn
                  onClick={function () {
                    getSingleCardRules(card.name);
                    setRulingModal(true);
                  }}
                  className="btn"
                >
                  <CardBtnTitle>Rules</CardBtnTitle>
                  <CardBtnSVG
                    fill="currentColor"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z" />
                    <path d="M0-.25h24v24H0z" fill="none" />
                  </CardBtnSVG>
                </CardBtn>
              </CardBtnlist>
              <CardImageRoot>
                {card.card_faces?.length === 1 ? (
                  <CardImageContainer onClick={rotateElement}>
                    {card.card_faces.map((obj, index) => (
                      <CardImage
                        key={card.name + 'cardImage'}
                        src={obj}
                        alt={card.name}
                      />
                    )) ?? null}
                  </CardImageContainer>
                ) : card.card_faces?.length === 2 ? (
                  <CardImageContainer
                    onClick={rotateElement}
                    className="cardContainer"
                  >
                    <CardImages
                      key={card.name + 'cardImagesBackFront'}
                      className="card"
                      id={'cardImagesBackFront' + card.name}
                    >
                      <CardImage
                        key={card.name + 'cardImage-front'}
                        src={card.card_faces[0]}
                        alt={card.name + '-front'}
                        className="card-side card-front"
                      />
                      <CardImage
                        key={card.name + 'cardImage-back'}
                        src={card.card_faces[1]}
                        alt={card.name + '-back'}
                        className="card-side card-back"
                      />
                    </CardImages>
                  </CardImageContainer>
                ) : card.card_faces?.length > 2 ? (
                  <CardImageContainer>
                    {card.card_faces.map((obj, index) => (
                      <CardImages key={card.name + 'cardImage:' + index}>
                        <CardImage src={obj} alt={card.name} />
                      </CardImages>
                    )) ?? null}
                  </CardImageContainer>
                ) : error ? (
                  <ErrorText>{repoErrorText(error)}</ErrorText>
                ) : null}
              </CardImageRoot>
              {card.card_faces?.length === 2 ? (
                <SingleBtn
                  onClick={function () {
                    flipCard('cardImagesBackFront' + card.name);
                  }}
                  className="single-btn"
                >
                  <CardBtn className="btn">
                    <CardBtnTitle>Flip</CardBtnTitle>
                    <CardBtnSVG
                      fill="currentColor"
                      height="24"
                      viewBox="0 0 512 512"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M449.9 39.96l-48.5 48.53C362.5 53.19 311.4 32 256 32C161.5 32 78.59 92.34 49.58 182.2c-5.438 16.81 3.797 34.88 20.61 40.28c16.97 5.5 34.86-3.812 40.3-20.59C130.9 138.5 189.4 96 256 96c37.96 0 73 14.18 100.2 37.8L311.1 178C295.1 194.8 306.8 223.4 330.4 224h146.9C487.7 223.7 496 215.3 496 204.9V59.04C496 34.99 466.9 22.95 449.9 39.96zM441.8 289.6c-16.94-5.438-34.88 3.812-40.3 20.59C381.1 373.5 322.6 416 256 416c-37.96 0-73-14.18-100.2-37.8L200 334C216.9 317.2 205.2 288.6 181.6 288H34.66C24.32 288.3 16 296.7 16 307.1v145.9c0 24.04 29.07 36.08 46.07 19.07l48.5-48.53C149.5 458.8 200.6 480 255.1 480c94.45 0 177.4-60.34 206.4-150.2C467.9 313 458.6 294.1 441.8 289.6z"></path>
                    </CardBtnSVG>
                  </CardBtn>
                </SingleBtn>
              ) : error ? (
                <ErrorText>{repoErrorText(error)}</ErrorText>
              ) : null}
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
  height: 80vh;
  width: 80vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardImageContainer = styled.div`
  height: 100%;
  width: auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardImages = styled.div`
  height: 100%;
`;

const CardImage = styled.img`
  height: 100%;
  width: 100%;
`;

const CardLowerDetails = styled.div`
  position: relative;
  bottom: -2vh;
`;

const RuleElement = styled.div``;

const CardBtnlist = styled.div``;

const SingleBtn = styled.div``;

const CardBtn = styled.div``;

const CardBtnTitle = styled.h4``;

const CardBtnSVG = styled.svg``;
