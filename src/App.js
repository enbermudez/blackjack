import { useEffect, useState } from 'react';
import classnames from 'classnames';
import axios from 'axios';
import helpers from './helpers';
import Card from './components/Card';

const http = axios.create({
  baseURL: 'https://deckofcardsapi.com/api/deck/',
  timeout: 1000,
});

const WIN_MESSAGES = [
  'Bien... Ganaste...',
  'Sí, sí... Ganaste. Ándate.',
  '¿Ganaste? Ganaste.',
  'Ganaste...',
];

const TIE_MESSAGES = [
  '¿Empate? Pues, sí.',
  'Taaaaablaaasssssss',
  'Empatamos, pero no somos iguales.',
  'Empatamos. Nice, I guess.',
];

const LOSE_MESSAGES = [
  'Te falta calle.',
  '¿Perder? Disculpa, no sé. ¿Es una canción de Trueno?',
  'Soy buenísimo.',
  '¿Perdiste? Perdiste.'
];

const App = () => {
  const [deckId, setDeckId] = useState('');
  const [playerCards, setPlayerCards] = useState([]);
  const [playerSum, setPlayerSum] = useState(0);
  const [dealerCards, setDealerCards] = useState([]);
  const [dealerSum, setDealerSum] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [passedTurn, setPassedTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [autoPlay, setAutoplay] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState('');

  // Functions

  const calculateCardValues = (cards) => {
    let cardsValues = cards.map((card) => {
      if (['JACK', 'QUEEN', 'KING'].includes(card.value)) return 10;
      if ('ACE' === card.value) return 11;
      return card.value * 1;
    });

    let cardsSum = cardsValues.reduce((acc, a) => acc + a, 0);

    if (cardsSum > 21 && cardsValues.includes(11)) {
      const aceIndex = cardsValues.findIndex((value) => value === 11);
      cardsValues[aceIndex] = 1;
      cardsSum = cardsValues.reduce((acc, a) => acc + a, 0);
    }

    return cardsSum;
  };

  const drawCards = async (count) => {
    try {
      const { data: { cards, deck_id: newDeckId } } = await http.get(`${deckId}/draw/?count=${count}`);
      setDeckId(newDeckId);
      return cards;
    } catch (err) {
      console.error(err);
    }
  };

  const hit = async () => {
    const newCard = await drawCards(1);
    const newPlayerCards = [...playerCards, newCard[0]];
    setPlayerCards(newPlayerCards);
  };

  const restartGame = () => {
    window.location.reload();
  };

  const startGame = async () => {
    setGameStarted(true);

    const cards = await drawCards(4);

    const newPlayerCards = [...playerCards, cards[0], cards[1]];

    const firstCard = { ...cards[1] };
    firstCard.hidden = true;
    const newDealerCards = [...dealerCards, firstCard, cards[2]];

    setDealerCards(newDealerCards);
    setPlayerCards(newPlayerCards);
  };

  const dealerAutoPlay = () => {
    setTimeout(async () => {
      const newCard = await drawCards(1);
      const newDealerCards = [...dealerCards, newCard[0]];
      setDealerCards(newDealerCards);
    }, 1000);
  };

  const stand = () => {
    setPassedTurn(true);

    const newDealerCards = dealerCards.map((card) => {
      if (card.hidden) card.hidden = false;
      return card;
    });

    setDealerCards(newDealerCards);
    setAutoplay(true);
  };

  const finishGame = () => {
    setGameOver(true);
    setMessage(helpers.random(LOSE_MESSAGES));
    return;
  };

  // Effect

  useEffect(() => {
    setScore(`Jugador ${playerSum} - ${dealerSum} Dealer`)
  }, [playerSum, dealerSum]);

  useEffect(() => {
    if (!playerCards.length) return;
    const newPlayerSum = calculateCardValues(playerCards);
    setPlayerSum(newPlayerSum);
    if (newPlayerSum === 21) stand();
    if (newPlayerSum > 21) finishGame();
  }, [playerCards]);

  useEffect(() => {
    if (!dealerCards.length) return;
    const revealedCards = dealerCards.filter((card) => !card.hidden);
    const cardsSum = calculateCardValues(revealedCards);
    setDealerSum(cardsSum);
  }, [dealerCards]);

  useEffect(() => {
    if (dealerSum === 0) return;

    if (dealerSum === playerSum && passedTurn) {
      setAutoplay(false);
      setGameOver(true);
      setMessage(helpers.random(TIE_MESSAGES));
      return;
    }

    if (dealerSum > playerSum && dealerSum <= 21 && passedTurn) {
      setAutoplay(false);
      setGameOver(true);
      setMessage(helpers.random(LOSE_MESSAGES));
      return;
    }

    if (dealerSum > 21 && passedTurn) {
      setAutoplay(false);
      setGameOver(true);
      setMessage(helpers.random(WIN_MESSAGES));
      return;
    }

    if (autoPlay) dealerAutoPlay();
  }, [dealerSum]);

  const getDeck = async () => {
    try {
      const { data: { deck_id: newDeckId } } = await http.get('new/shuffle/?deck_count=1');
      setDeckId(newDeckId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getDeck();
  }, []);

  return (
    <div id="app">
      <h1 className={classnames('message', { invisible: !gameOver })}>{message}</h1>
      <h2 className={classnames('message', { invisible: !gameStarted })}>{score}</h2>

      <div className="game-buttons">
        <button onClick={() => startGame()} className={classnames('game-button', { invisible: gameStarted })}>Iniciar juego</button>

        <button onClick={() => stand()} className={classnames('game-button', { invisible: passedTurn || gameOver || !gameStarted })}>Quedarse</button>

        <button onClick={() => hit()} className={classnames('game-button', { invisible: passedTurn || gameOver || !gameStarted })}>Robar</button>

        <button onClick={() => restartGame()} className={classnames('game-button', { invisible: !gameOver })}>Volver a jugar</button>
      </div>

      <div className="cards">
        {
          !!dealerCards.length && dealerCards.map((card) => {
            return (
              <Card key={card.code} data={card} />
            );
          })
        }
      </div>

      <div className="cards">
        {
          !!playerCards.length && playerCards.map((card) => {
            return (
              <Card key={card.code} data={card} />
            );
          })
        }
      </div>
    </div>
  );
};

export default App;
