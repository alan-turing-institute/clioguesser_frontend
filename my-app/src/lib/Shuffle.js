function shuffle_array(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function shuffle_years_half(min_year, max_year, max_rounds) {
  // Group years by century
  const centuries = {};
  for (let i = min_year; i <= max_year; i += 1) {
    // Century calculation: e.g. 1901-2000 is 20th century, 0-99 is 1st century, -100 to -1 is 1st century BCE, etc.
    const century = i > 0
      ? Math.floor((i - 1) / 100) + 1
      : Math.floor((i + 1) / 100);
    if (!centuries[century]) centuries[century] = [];
    centuries[century].push(i);
  }

  // Shuffle the centuries
  const century_keys = Object.keys(centuries);
  shuffle_array(century_keys);

  let years = [];
  // Pick one random year from each shuffled century, up to max_rounds
  for (let i = 0; i < Math.min(max_rounds, century_keys.length); i++) {
    const c = century_keys[i];
    const years_in_century = centuries[c];
    shuffle_array(years_in_century);
    years.push(years_in_century[0]);
  }

  // If we need more years, fill randomly from remaining years (avoiding duplicates)
  if (years.length < max_rounds) {
    let all_years = [];
    for (const arr of Object.values(centuries)) {
      all_years = all_years.concat(arr);
    }
    // Remove already picked years
    all_years = all_years.filter(y => !years.includes(y));
    shuffle_array(all_years);
    years = years.concat(all_years.slice(0, max_rounds - years.length));
  }

  return years;
}

export function shuffle_years(
  min_year = -1000,
  max_year = 2024,
  max_rounds = 10,
  bias_number = 4, // Number of years to bias towards the current century
) {
  let bias_year = max_year - 100;
  let y1 = shuffle_years_half(min_year, bias_year, max_rounds - bias_number);

  let y2 = [];
  for (let i = 0; i < bias_number; i++) {
    let year;
    do {
      year = Math.floor(Math.random() * (max_year - bias_year + 1)) + bias_year;
    } while (y1.includes(year) || y2.includes(year)); // Avoid duplicates
    y2.push(year);
  }
  
  let years = y1.concat(y2);

  shuffle_array(years); // Final shuffle for randomness

  return years;
}