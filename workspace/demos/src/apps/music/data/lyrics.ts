// 가사. 곡마다 시드로 짠 짧은 가사입니다. 문장은 모두 이 앱을 위해 새로 쓴 것이고, 실제 노래의 가사는 하나도 없습니다.
// 곡의 제목이 후렴의 첫 줄과 마지막 줄이 되고, 줄마다 시간이 붙어서 재생 위치에 따라 지금 줄이 바뀝니다.

import { random, shuffle, pick } from "../../../kit";
import type { Track } from "./catalog";

export type Line = { t: number; text: string };
export type Lyrics = { lines: Line[]; breaks: ReadonlySet<number> };

const THEMES = ["night", "rain", "love", "home", "road", "dawn"] as const;
type Theme = (typeof THEMES)[number];

const KO: Record<Theme, readonly string[]> = {
  night: [
    "불 꺼진 창문들 사이로 걸어가", "편의점 불빛이 오늘은 따뜻해", "택시는 느리게 강을 건너고", "이어폰 속에서 밤이 깊어 가",
    "아무도 없는 횡단보도에 서서", "신호가 바뀌어도 나는 가만히 있어", "멀리서 들리는 마지막 지하철 소리", "네온사인이 젖은 길 위에 번져",
    "주머니 속 손이 조금씩 식어 가", "가로등 하나가 나를 따라와", "도시는 잠든 척 숨을 쉬고 있어", "오늘 밤은 어디까지 걸어도 좋아",
    "빈 벤치에 앉아 하늘을 올려 봐", "별 대신 간판이 반짝이는 밤", "창가에 기대 불빛을 세어 본다", "밤이 끝나기 전에 한 번만 더",
  ],
  rain: [
    "창문을 두드리는 빗소리가 좋아", "우산 하나에 어깨가 반쯤 젖어", "구름이 낮게 내려앉은 오후", "처마 끝에서 떨어지는 시간",
    "비 냄새가 골목을 가득 채우면", "물웅덩이에 하늘이 담겨 있어", "젖은 신발도 오늘은 괜찮아", "장마가 끝나면 말해 줄게",
    "바람이 방향을 바꾸는 소리", "먹구름 뒤에도 해는 있다고", "빗방울이 유리에 그린 지도", "천천히 개어 가는 저녁 하늘",
    "한 줄기 햇살이 커튼을 넘어", "무지개는 아주 잠깐이라서", "우리는 같은 비를 맞고 있었지", "비가 그치면 다시 걸어가자",
  ],
  love: [
    "네 이름을 부르면 온도가 올라가", "말하지 못한 말이 주머니에 남아", "손끝이 닿았던 자리를 기억해", "괜찮은 척 웃는 게 제일 어려워",
    "우리 사이엔 작은 틈이 생겼지", "너의 안부가 문득 궁금한 밤", "사진 속의 우리는 아직 웃고 있어", "같은 노래를 다른 마음으로 들어",
    "놓지 못한 건 네 손이 아니라 시간", "돌아서는 뒷모습이 오래 남아", "다정한 말투가 아직도 귓가에", "너와 걷던 길은 이제 혼자 걸어",
    "서로의 속도를 맞추던 날들", "마지막 인사는 짧게 하기로 했어", "그래도 고마웠다고 말하고 싶어", "이 마음은 천천히 접어 둘게",
  ],
  home: [
    "아침 햇살이 부엌을 가로질러", "따뜻한 국물에 하루가 풀려", "빨래가 마르는 냄새가 좋아", "평상에 누워 구름을 세어 봐",
    "오래된 라디오가 흥얼거리는 소리", "대문 앞에 놓인 작은 화분", "고양이가 햇볕을 쫓아다녀", "창가에 기대 졸던 일요일 오후",
    "서랍 속에 접어 둔 여름", "느린 걸음으로 집에 가는 길", "저녁 밥 짓는 냄새가 번져", "불을 켜면 방 안이 나를 맞아",
    "낡은 의자도 내 자리가 되고", "이불 속에서 듣는 하루의 끝", "이 정도면 충분히 행복해", "내일도 같은 아침이면 좋겠어",
  ],
  road: [
    "첫차를 타고 바다로 가자", "창밖의 풍경이 필름처럼 지나가", "기차는 아무 말 없이 달리고", "배낭 하나에 담은 작은 용기",
    "길이 끝나는 곳에 바람이 있어", "낯선 역에서 내려 본 적 있니", "지도에 없는 길로 접어들어", "해가 지는 쪽으로 계속 걸어",
    "터널을 지나면 새로운 색이야", "라디오 주파수가 흔들리는 국도", "바퀴 소리가 박자가 되는 밤", "우리는 어디든 갈 수 있었지",
    "차창 너머로 손을 흔들어 줘", "돌아오는 길이 더 가벼웠어", "멀리 갈수록 가까워지는 것들", "종점에서 다시 시작해 보자",
  ],
  dawn: [
    "동이 트기 전이 가장 고요해", "어제보다 조금만 더 밝아질게", "창문을 열면 새로운 공기가 와", "작은 용기가 하루를 움직여",
    "넘어져도 다시 신발 끈을 묶어", "느려도 괜찮아 멈추지만 않으면", "햇살이 어깨 위에 앉았어", "오늘은 나에게 다정해지기로 해",
    "아직 오지 않은 날이 기다려져", "한 걸음씩 아침이 가까워져", "눈을 뜨면 모든 게 새로워", "빛은 늘 틈으로 들어오니까",
    "두 손에 담아 둔 작은 희망", "우리의 노래는 이제 시작이야", "바람이 등을 가볍게 밀어 줘", "다시 한 번 크게 숨을 쉬어 봐",
  ],
};

const EN: Record<Theme, readonly string[]> = {
  night: [
    "Streetlights hum a quiet tune", "I'm walking home the long way round", "The city sleeps with one eye open", "Neon puddles at my feet",
    "Last train's gone, but I don't mind", "Static on the radio tonight", "Every window holds a story", "I count the lights across the bridge",
    "The night is soft, the night is wide", "Nobody's out but me and the moon", "Stray cats keep the alley's secrets", "A bus glides by with no one on it",
    "I memorize the way the sky goes dark", "Rooftops glow where the signals blink",
  ],
  rain: [
    "Rain on the roof like a drum roll", "Grey skies folded in my coat", "Puddles keep the sky for us", "The weather's changing, so am I",
    "Umbrella shared by half a street", "Thunder rolls, then lets it go", "I hear the gutter singing low", "Clouds are only slow goodbyes",
    "Let the storm pass through the room", "After the rain, the world smells new", "The window fogs with every sigh", "Drip by drip the afternoon unwinds",
    "A paper boat down the gutter's stream", "Wet leaves stick to the bicycle wheel",
  ],
  love: [
    "Whisper my name into the quiet", "We were only ever borrowed hours", "Your sweater still smells like October", "I kept the note you left behind",
    "Keep your hand open, keep it near", "Half a smile is all I need", "We danced in socks across the floor", "The silence between us learned to talk",
    "I'd walk the whole way back to you", "Tell me it was worth the wait", "I fold your name into my pocket", "Two cups on the counter, one still warm",
    "Even the quiet sounds like you", "We left the porch light on for no one",
  ],
  home: [
    "Kettle's on, the morning's slow", "Sunlight spills across the table", "Porch light on, the door unlocked", "Fold the laundry, fold the day",
    "Dust floats gold in the afternoon", "The kitchen hums a lullaby", "Old records spinning in the hall", "Bare feet on the wooden stairs",
    "Hang my coat where it belongs", "Every room remembers us", "Toast pops up like a little sun", "The cat has claimed the warmest chair",
    "Windows fogged with soup and laughter", "Slippers by the door, side by side",
  ],
  road: [
    "Windows down, the highway sings", "Maps are only suggestions", "We chase the sunset out of town", "Gas station coffee, borrowed songs",
    "Mile by mile, the weight comes off", "Tell the road I'm coming home", "Dust and daylight on the dash", "Every exit is an open door",
    "The radio finds us in the dark", "We're lost, but we're lost together", "Cassette tapes and cracked sunglasses", "A thousand miles of nothing much",
    "Counting mile markers like prayers", "The horizon keeps its distance kindly",
  ],
  dawn: [
    "Morning breaks in shades of gold", "A little light is all it takes", "I'll meet you where the sky begins", "New day, same old stubborn heart",
    "Breathe in, breathe out, start the day", "The sun climbs slow, but it climbs", "Open the window, let it in", "We were always brighter than we knew",
    "Hope is a small and stubborn bird", "The dawn is patient, so am I", "The kettle sings the sun awake", "Footsteps print the dew-wet grass",
    "Yesterday folds itself away", "We start again, as the light does",
  ],
};

const cache = new Map<string, Lyrics | null>();

// 곡의 가사. 가사가 없는 곡(연주곡)은 null입니다.
export const lyricsOf = (track: Track): Lyrics | null => {
  if (track.instrumental) return null;
  const hit = cache.get(track.id);
  if (hit !== undefined) return hit;

  const r = random(`lyrics:${track.id}`);
  const theme = pick(r, THEMES);
  const pool = shuffle(r, track.lang === "ko" ? KO[theme] : EN[theme]);
  const take = (count: number) => pool.splice(0, count);
  const hook = track.title;
  const [c1, c2] = take(2) as [string, string];
  const chorus = [hook, c1, c2, hook];
  const sections: string[][] = [take(4), chorus, take(4), chorus, take(3), chorus, [c2, hook]];

  const lines: string[] = [];
  const breaks = new Set<number>();
  sections.forEach((section, index) => {
    if (index > 0) breaks.add(lines.length);
    lines.push(...section);
  });

  // 앞부분은 연주, 끝은 여운. 그 사이에 줄을 고르게 놓되 단락 사이는 숨을 한 줄 더 줍니다.
  const intro = 9 + r() * 8;
  const outro = 9 + r() * 5;
  const span = Math.max(30, track.duration - intro - outro);
  const weights = lines.map((_, index) => (breaks.has(index) ? 1.8 : 1));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let before = 0;
  const timed = lines.map((text, index) => {
    before += weights[index]!;
    return { t: Math.round((intro + ((before - weights[index]!) / total) * span) * 10) / 10, text };
  });

  const lyrics: Lyrics = { lines: timed, breaks };
  cache.set(track.id, lyrics);
  return lyrics;
};

// 지금 줄: 재생 위치를 지난 마지막 줄. 첫 줄 전에는 -1입니다.
export const lineAt = (lyrics: Lyrics, position: number) => {
  let found = -1;
  for (let i = 0; i < lyrics.lines.length; i++) {
    if (lyrics.lines[i]!.t <= position) found = i;
    else break;
  }
  return found;
};
