const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

const random = array => array.sort(() => 0.5 - Math.random()).slice(0, 1)[0];

const helpers = { shuffle, random };

export default helpers;
