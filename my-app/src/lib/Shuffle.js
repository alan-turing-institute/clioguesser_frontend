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

// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
// }


// function pick_year({ min_year, max_year }) {
//   let years = [];
//   for (let i = min_year; i <= max_year; i += 10) {
//     years.push(i);
//   }
//   shuffleArray(years);
//   export const shuffledYears = years;
//   // return Math.floor(Math.random() * (max_year - min_year + 1)) + min_year;
// }