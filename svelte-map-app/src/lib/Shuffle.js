let years = [];

for (let i = 1500; i <= 2000; i += 10) {
  years.push(i);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffleArray(years);
export const shuffledYears = years;
