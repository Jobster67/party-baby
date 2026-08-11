// Party Baby — scenario content
// Each scenario: { id, category, options: [{ label, tier, feeds? }] }
// tier is one of "best" | "great" | "good" | "ok" | "bad" | "worse" | "worst"
// — see TIER_MINUTES in game.js for how each tier translates into
// sleep/party minutes. `feeds: true` marks an option as actually offering a
// bottle — it counts toward the night's feeding count regardless of tier,
// since offering a bottle is a feeding whether or not it was the right call.
//
// "best" (3 hours sleep) is reserved exclusively for offering a bottle during
// an actual hunger scenario — recognizing hunger and feeding correctly is the
// single most valuable thing you can do overnight. Every other scenario's
// ideal answer tops out at "great" (2 hours), including a bottle offered when
// hunger ISN'T the real cue (that's scored as an ok/bad/worse/worst distractor
// instead, per scenario).
//
// Text may use {{he}} {{He}} {{him}} {{Him}} {{his}} {{His}} tokens, substituted
// at render time based on the chosen pronoun.

const HUNGER_SCENARIOS = [
  {
    id: "hunger-1",
    category: "hunger",
    emoji: "😖",
    text: "{{He}} is smacking {{his}} lips and rooting around, turning {{his}} head toward anything that brushes {{his}} cheek.",
    options: [
      { label: "Offer a bottle", tier: "best", feeds: true },
      { label: "Offer the pacifier to hold {{him}} over for a bit", tier: "good" },
      { label: "Check and change the diaper just in case", tier: "ok" },
      { label: "Put {{him}} down in the crib and leave the room", tier: "worst" },
    ],
  },
  {
    id: "hunger-2",
    category: "hunger",
    emoji: "😩",
    text: "It's been a few hours since the last feed. {{He}} wakes up fussing and won't settle no matter how you rock {{him}}.",
    options: [
      { label: "Offer a bottle", tier: "best", feeds: true },
      { label: "Try skin-to-skin snuggling for a few minutes", tier: "good" },
      { label: "Turn on white noise and wait it out", tier: "ok" },
      { label: "Bounce {{him}} energetically to tire {{him}} out", tier: "worse" },
    ],
  },
  {
    id: "hunger-3",
    category: "hunger",
    emoji: "😤",
    text: "{{He}} gnaws on {{his}} own fist like it's the last snack on Earth.",
    options: [
      { label: "Offer a bottle", tier: "best", feeds: true },
      { label: "Offer the pacifier for now", tier: "good" },
      { label: "Sing a quiet lullaby", tier: "ok" },
      { label: "Ignore it and hope {{he}} drifts off", tier: "worst" },
    ],
  },
  {
    id: "hunger-4",
    category: "hunger",
    emoji: "😢",
    text: "{{His}} tiny fists, scrunched face, and a cry that only gets louder the longer you wait.",
    options: [
      { label: "Offer a bottle", tier: "best", feeds: true },
      { label: "Hold {{him}} upright and rock gently", tier: "good" },
      { label: "Check and change the diaper", tier: "ok" },
      { label: "Turn on a bright toy to distract {{him}}", tier: "bad" },
    ],
  },
];

const OTHER_SCENARIOS = [
  {
    id: "diaper-1",
    category: "diaper",
    emoji: "🤢",
    text: "A distinct smell drifts across the room. {{He}} squirms like something's bothering {{him}}.",
    options: [
      { label: "Check and change the diaper", tier: "great" },
      { label: "Offer the pacifier while you investigate", tier: "good" },
      { label: "Play soft music", tier: "ok" },
      { label: "Offer a bottle", tier: "worse", feeds: true },
    ],
  },
  {
    id: "diaper-2",
    category: "diaper",
    emoji: "😣",
    text: "{{He}} keeps arching {{his}} back and kicking {{his}} legs, clearly annoyed about something down south.",
    options: [
      { label: "Check and change the diaper", tier: "great" },
      { label: "Rock gently while you check", tier: "good" },
      { label: "Sing a lullaby", tier: "ok" },
      { label: "Offer a bottle", tier: "bad", feeds: true },
    ],
  },
  {
    id: "temp-1",
    category: "temperature",
    emoji: "🥵",
    text: "{{His}} cheeks are flushed and the back of {{his}} neck feels damp and sweaty. {{He}} keeps squirming in the warm sleep sack.",
    options: [
      { label: "Remove a layer or switch to a lighter sleep sack", tier: "great" },
      { label: "Turn on a fan nearby for gentle airflow", tier: "good" },
      { label: "Offer a bottle", tier: "ok", feeds: true },
      { label: "Add another warm layer", tier: "worst" },
    ],
  },
  {
    id: "temp-2",
    category: "temperature",
    emoji: "🥶",
    text: "{{His}} hands and feet feel cool and {{he}}'s curling up tight, shivering slightly in the crib.",
    options: [
      { label: "Turn up the room heat or use a warmer swaddle", tier: "great" },
      { label: "Add a warmer pair of socks and a hat", tier: "good" },
      { label: "Hold {{him}} close for warmth for a bit", tier: "ok" },
      { label: "Add a loose blanket to the crib", tier: "worst" },
    ],
  },
  {
    id: "pacifier-1",
    category: "pacifier",
    emoji: "😗",
    text: "{{He}} is making little sucking motions with {{his}} mouth even though {{he}} just ate an hour ago.",
    options: [
      { label: "Give the pacifier", tier: "great" },
      { label: "Offer gentle rocking instead", tier: "good" },
      { label: "Turn on white noise", tier: "ok" },
      { label: "Offer another full bottle", tier: "worst", feeds: true },
    ],
  },
  {
    id: "gas-1",
    category: "gas",
    emoji: "😖",
    text: "{{His}} tummy feels tight and {{he}}'s grunting and pulling {{his}} knees up.",
    options: [
      { label: "Burp {{him}} and do gentle bicycle legs", tier: "great" },
      { label: "Lay {{him}} tummy-down across your lap for a moment", tier: "good" },
      { label: "Offer the pacifier", tier: "ok" },
      { label: "Offer another bottle right away", tier: "worst", feeds: true },
    ],
  },
  {
    id: "gas-2",
    category: "gas",
    emoji: "😩",
    text: "Right after the last feed, {{he}} squirms and fusses instead of settling down.",
    options: [
      { label: "Burp {{him}} over your shoulder", tier: "great" },
      { label: "Hold {{him}} upright for a while", tier: "good" },
      { label: "Check the diaper", tier: "ok" },
      { label: "Rock briskly in the chair", tier: "worse" },
    ],
  },
  {
    id: "hiccups-1",
    category: "hiccups",
    emoji: "😯",
    text: "{{He}} has a case of the hiccups after the last feed and jumps a little with each one.",
    options: [
      { label: "Hold {{him}} upright gently and let the hiccups pass", tier: "great" },
      { label: "Offer the pacifier to help ease them", tier: "good" },
      { label: "Wait it out in the crib", tier: "ok" },
      { label: "Bounce {{him}} vigorously", tier: "bad" },
    ],
  },
  {
    id: "overstim-1",
    category: "overstimulation",
    emoji: "😵",
    text: "{{He}} is wide-eyed, turning {{his}} head away from you, and starting to whimper after all the excitement.",
    options: [
      { label: "Move to a quiet, dim room", tier: "great" },
      { label: "Swaddle and hold {{him}} close", tier: "good" },
      { label: "Offer the pacifier", tier: "ok" },
      { label: "Keep engaging {{him}} to settle down", tier: "worst" },
    ],
  },
  {
    id: "overstim-2",
    category: "overstimulation",
    emoji: "😖",
    text: "Too much noise and light in the room — {{he}} is rubbing {{his}} eyes and getting more agitated by the second.",
    options: [
      { label: "Turn off extra lights and lower the noise", tier: "great" },
      { label: "Move to a calmer room", tier: "good" },
      { label: "Offer a bottle", tier: "ok", feeds: true },
      { label: "Turn on a bright toy", tier: "worst" },
    ],
  },
  {
    id: "startle-1",
    category: "startle",
    emoji: "😨",
    text: "A door creaked somewhere in the house and {{he}} jolted awake, arms flailing — a normal newborn startle reflex.",
    options: [
      { label: "Swaddle {{him}} snugly and settle {{him}} back in the crib", tier: "great" },
      { label: "Hold {{him}} close for a minute to reassure {{him}}", tier: "good" },
      { label: "Turn on white noise", tier: "ok" },
      { label: "Turn on a bright light", tier: "worst" },
    ],
  },
  {
    id: "noise-1",
    category: "noise",
    emoji: "😟",
    text: "Every little creak of the house seems to be keeping {{him}} from settling into deep sleep.",
    options: [
      { label: "Turn on white noise", tier: "great" },
      { label: "Close the door most of the way", tier: "good" },
      { label: "Offer the pacifier", tier: "ok" },
      { label: "Turn off all sound completely", tier: "worse" },
    ],
  },
  {
    id: "hold-1",
    category: "comfort",
    emoji: "🥺",
    text: "{{He}} settled fine in the crib earlier, but now {{he}} whimpers the moment you set {{him}} down.",
    options: [
      { label: "Soothe {{him}} briefly, then lay {{him}} back down on {{his}} back, alone in the crib", tier: "great" },
      { label: "Try patting and shushing right in the crib", tier: "good" },
      { label: "Offer the pacifier", tier: "ok" },
      { label: "Bring {{him}} into bed with you to sleep", tier: "worst" },
    ],
  },
  {
    id: "fighting-sleep-1",
    category: "overtired",
    emoji: "😫",
    text: "{{He}} is rubbing {{his}} eyes and yawning but keeps fighting sleep, getting more overtired and cranky.",
    options: [
      { label: "Dim the lights and start a calm wind-down routine", tier: "great" },
      { label: "Swaddle and offer the pacifier", tier: "good" },
      { label: "Offer a bottle", tier: "ok", feeds: true },
      { label: "Play energetically to tire {{him}} out", tier: "worst" },
    ],
  },
  {
    id: "swaddle-1",
    category: "swaddle",
    emoji: "😣",
    text: "{{His}} arms keep jerking and waking {{him}} up every time {{he}} starts to drift off.",
    options: [
      { label: "Swaddle {{his}} arms snugly", tier: "great" },
      { label: "Hold {{his}} hands still for a moment while {{he}} settles", tier: "good" },
      { label: "Offer the pacifier", tier: "ok" },
      { label: "Turn on a bright toy", tier: "bad" },
    ],
  },
];

// Guaranteed once-per-night — teaches the ABCs of safe sleep (Alone, on the
// Back, in a Crib). Deliberately no partial credit: every unsafe option is
// "worst" tier, since there's no such thing as a partially-safe sleep choice.
const SAFE_SLEEP_SCENARIOS = [
  {
    id: "safe-sleep-1",
    category: "safe-sleep",
    emoji: "🛏️",
    text: "It's time to lay {{him}} down for a good stretch of sleep.",
    options: [
      { label: "Lay {{him}} on {{his}} back, alone in the crib, with nothing else inside", tier: "great" },
      { label: "Lay {{him}} on {{his}} tummy instead", tier: "worst" },
      { label: "Tuck a soft blanket and stuffed animal in beside {{him}}", tier: "worst" },
      { label: "Bring {{him}} into bed with you", tier: "worst" },
    ],
  },
  {
    id: "safe-sleep-2",
    category: "safe-sleep",
    emoji: "👵",
    text: "A well-meaning relative suggests propping {{him}} on {{his}} side with a rolled towel so {{he}} sleeps more soundly.",
    options: [
      { label: "Politely decline — lay {{him}} flat on {{his}} back instead", tier: "great" },
      { label: "Try the side-lying position", tier: "worst" },
      { label: "Add a nursing pillow behind {{him}} too", tier: "worst" },
      { label: "Prop a rolled blanket on the other side as well", tier: "worst" },
    ],
  },
];
