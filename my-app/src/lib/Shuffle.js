
function shuffle_array(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function shuffle_years(min_year=1500, max_year=2000, step=10) {
  let years = [];

  for (let i = min_year; i <= max_year; i += step) {
    years.push(i);
  }

  shuffle_array(years);

  return years;
}
