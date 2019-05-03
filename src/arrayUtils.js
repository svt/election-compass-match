export function zip(as, bs) {
  const result = [];

  // Hot path for matching, "for" performs better than map
  for (let i = 0; i < as.length; i++) {
    result.push([as[i], bs[i]]);
  }

  return result;
}

export function shuffle(xs) {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }

  return xs;
}
