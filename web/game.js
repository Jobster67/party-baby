const TOTAL_NIGHT_MINUTES = 720; // 8:00 PM -> 8:00 AM
const ANSWER_DELAY_MS = 1600;

// How each answer tier plays out: minutes pass on the clock either as real
// sleep, or as "party" time where the baby is wide awake and gains nothing.
const TIER_MINUTES = { best: 180, great: 120, good: 45, ok: 15, bad: 15, worse: 30, worst: 60 };
const TIER_IS_SLEEP = { best: true, great: true, good: true, ok: true, bad: false, worse: false, worst: false };
const TIER_EMOJI = { best: "😴", great: "😴", good: "😌", ok: "😪", bad: "🥳", worse: "🥳", worst: "🥳" };
const TIER_RANK = { best: 6, great: 5, good: 4, ok: 3, bad: 2, worse: 1, worst: 0 };

const PRONOUNS = {
  boy: { he: "he", He: "He", him: "him", Him: "Him", his: "his", His: "His" },
  girl: { he: "she", He: "She", him: "her", Him: "Her", his: "her", His: "Her" },
};

let currentPronouns = null;
let state = null;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyPronouns(text) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => currentPronouns[key] ?? "");
}

function buildSchedule() {
  // Spread the 4 guaranteed hunger scenarios one per quarter of the night,
  // and the safe-sleep lesson at one random point — both delivered as soon
  // as the clock reaches their "due" minute, however many turns that takes.
  const quarterMinutes = TOTAL_NIGHT_MINUTES / 4;
  const hungerItems = shuffle(HUNGER_SCENARIOS).map((scenario, i) => {
    const start = i * quarterMinutes;
    return { scenario, dueAt: start + Math.random() * quarterMinutes };
  });
  const safeSleepScenario = shuffle(SAFE_SLEEP_SCENARIOS)[0];
  const safeSleepItem = {
    scenario: safeSleepScenario,
    dueAt: 60 + Math.random() * (TOTAL_NIGHT_MINUTES - 120),
  };
  return [...hungerItems, safeSleepItem].sort((a, b) => a.dueAt - b.dueAt);
}

function newGame() {
  state = {
    elapsedMinutes: 0,
    sleepMinutes: 0,
    totalTurns: 0,
    topChoiceTurns: 0,
    feedsEarned: 0,
    specialQueue: buildSchedule(),
    otherQueue: shuffle(OTHER_SCENARIOS),
    currentScenario: null,
    currentOptions: [],
    locked: false,
  };
}

function isNightOver() {
  return state.elapsedMinutes >= TOTAL_NIGHT_MINUTES && state.specialQueue.length === 0;
}

function pickNextScenario() {
  if (state.specialQueue.length > 0 && state.elapsedMinutes >= state.specialQueue[0].dueAt) {
    return state.specialQueue.shift().scenario;
  }
  if (state.otherQueue.length === 0) {
    state.otherQueue = shuffle(OTHER_SCENARIOS);
  }
  return state.otherQueue.shift();
}

function formatClock(minutes) {
  const start = new Date(2000, 0, 1, 20, 0, 0); // 8:00 PM anchor
  start.setMinutes(start.getMinutes() + minutes);
  let hours = start.getHours();
  const mins = start.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mm = mins.toString().padStart(2, "0");
  return `${hours}:${mm} ${ampm}`;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function updateFeeds() {
  document.querySelectorAll(".feed-icon").forEach((el) => {
    const i = Number(el.dataset.i);
    el.classList.toggle("filled", i < state.feedsEarned);
  });
}

function updateMeter() {
  const pct = Math.min(100, (state.sleepMinutes / TOTAL_NIGHT_MINUTES) * 100);
  document.getElementById("sleep-meter").style.width = `${pct}%`;
}

function renderTurn() {
  state.locked = false;
  const scenario = pickNextScenario();
  state.currentScenario = scenario;

  document.getElementById("clock").textContent = formatClock(state.elapsedMinutes);
  document.getElementById("feedback").textContent = "";
  document.getElementById("feedback").className = "feedback";

  const emojiEl = document.getElementById("scenario-emoji");
  emojiEl.textContent = scenario.emoji;
  emojiEl.className = "scenario-emoji";

  document.getElementById("scenario-text").textContent = applyPronouns(scenario.text);

  state.currentOptions = shuffle(
    scenario.options.map((opt) => ({ tier: opt.tier, feeds: !!opt.feeds, label: applyPronouns(opt.label) }))
  );

  const optionsEl = document.getElementById("options");
  optionsEl.innerHTML = "";
  state.currentOptions.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", () => handleAnswer(opt, btn, scenario));
    optionsEl.appendChild(btn);
  });
}

function tierFeedback(tier) {
  switch (tier) {
    case "best":
      return applyPronouns("{{He}} sleeps soundly for 3 hours straight. 💤💤💤");
    case "great":
      return applyPronouns("{{He}} sleeps for a solid 2 hours. 💤💤");
    case "good":
      return applyPronouns("{{He}} settles for 45 minutes. 💤");
    case "ok":
      return applyPronouns("{{He}} dozes for just 15 minutes before stirring again. 😪");
    case "bad":
      return applyPronouns("PARTY TIME! {{He}}'s up for 15 minutes. 🎉");
    case "worse":
      return applyPronouns("PARTY TIME! {{He}}'s wide awake for 30 minutes. 🎉");
    case "worst":
      return applyPronouns("PARTY TIME! {{He}}'s wide awake for a whole hour. 🎉");
    default:
      return "";
  }
}

function handleAnswer(opt, btnEl, scenario) {
  if (state.locked) return;
  state.locked = true;

  const optionButtons = Array.from(document.querySelectorAll(".option-btn"));
  optionButtons.forEach((b) => (b.disabled = true));

  const emojiEl = document.getElementById("scenario-emoji");
  const feedbackEl = document.getElementById("feedback");

  const minutes = TIER_MINUTES[opt.tier];
  state.elapsedMinutes += minutes;
  if (TIER_IS_SLEEP[opt.tier]) {
    state.sleepMinutes += minutes;
  }
  if (opt.feeds && state.feedsEarned < 4) {
    state.feedsEarned += 1;
    updateFeeds();
  }

  const isParty = !TIER_IS_SLEEP[opt.tier];
  const bestOpt = state.currentOptions.reduce((a, b) => (TIER_RANK[b.tier] > TIER_RANK[a.tier] ? b : a));
  const isTopChoice = bestOpt.label === opt.label;
  state.totalTurns += 1;
  if (isTopChoice) {
    state.topChoiceTurns += 1;
  }

  btnEl.classList.add(`tier-${opt.tier}`);
  if (!isTopChoice) {
    const bestBtn = optionButtons.find((b) => b.textContent === bestOpt.label);
    if (bestBtn) bestBtn.classList.add(`tier-${bestOpt.tier}`);
  }

  emojiEl.textContent = TIER_EMOJI[opt.tier];
  emojiEl.className = `scenario-emoji ${isParty ? "party" : "sleepy"}`;
  feedbackEl.textContent = tierFeedback(opt.tier);
  feedbackEl.classList.add(isParty ? "wrong" : "correct");

  updateMeter();

  setTimeout(() => {
    if (isNightOver()) {
      renderEnd();
    } else {
      renderTurn();
    }
  }, ANSWER_DELAY_MS);
}

function gradeForPct(pct) {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  if (pct >= 60) return "D-";
  return "F";
}

function renderEnd() {
  // Actual sleep obtained, out of the full night — this is the "grade".
  const sleepPct = Math.min(100, Math.round((state.sleepMinutes / TOTAL_NIGHT_MINUTES) * 100));
  // Fraction of individual DECISIONS (not minutes) where you picked the
  // single best option available. Scoring by turn count rather than minutes
  // means a handful of big wins (like nailing every feed) can't paper over
  // mistakes elsewhere — and a perfect 10 requires literally zero slip-ups.
  const accuracyPct = Math.round((state.topChoiceTurns / state.totalTurns) * 100);
  const feeds = state.feedsEarned;
  const starRating =
    state.topChoiceTurns === state.totalTurns ? 10 : Math.max(1, Math.min(9, Math.round(accuracyPct / 10)));
  const grade = gradeForPct(sleepPct);

  let tagline, emoji;
  if (starRating === 10) {
    emoji = "🌅";
    tagline = "A flawless night. Every single call was the right one.";
  } else if (starRating >= 8) {
    emoji = "☕";
    tagline = "Great shift — just a slip or two, mostly peaceful.";
  } else if (starRating >= 5) {
    emoji = "😵‍💫";
    tagline = "A working night. Plenty of partying, but you survived.";
  } else if (starRating >= 2) {
    emoji = "🎉";
    tagline = "Rough one. The baby partied hard.";
  } else {
    emoji = "💤";
    tagline = "The baby partied until dawn. Better luck tomorrow night.";
  }
  if (state.sleepMinutes === 0) {
    tagline = "Not a single wink. The baby partied straight through to 8 AM.";
  }

  document.getElementById("end-emoji").textContent = emoji;
  document.getElementById("end-grade").textContent = `Sleep Grade: ${grade}`;
  document.getElementById("end-stars").textContent = `⭐ ${starRating}/10`;
  document.getElementById("end-tagline").textContent = tagline;
  document.getElementById("end-feeds").textContent = `${feeds}/4`;
  document.getElementById("end-sleep").textContent = `${sleepPct}%`;

  showScreen("screen-end");
}

function startGame(pronounKey) {
  currentPronouns = PRONOUNS[pronounKey];
  newGame();
  updateFeeds();
  updateMeter();
  showScreen("screen-game");
  renderTurn();
}

document.getElementById("btn-boy").addEventListener("click", () => startGame("boy"));
document.getElementById("btn-girl").addEventListener("click", () => startGame("girl"));
document.getElementById("btn-again").addEventListener("click", () => startGame(currentPronouns === PRONOUNS.girl ? "girl" : "boy"));
