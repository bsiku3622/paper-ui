// 앨범 40장, 곡 400개. 제목은 모두 이 앱을 위해 지어낸 것입니다.
// tracks는 " | "로 나눈 곡 제목이고, instrumental은 가사가 없는 앨범입니다.

export type AlbumSpec = {
  id: string;
  title: string;
  artist: string;
  date: string;
  kind: "앨범" | "EP";
  instrumental?: true;
  tracks: string;
};

export const ALBUM_SPECS: readonly AlbumSpec[] = [
  { id: "al01", title: "첫차가 오기 전에", artist: "ar01", date: "2021-03-12", kind: "앨범", tracks: "막차를 놓친 사람들 | 정류장의 불빛 | 가로등 아래서 | 안개 낀 한강 | 편의점 앞 벤치 | 새벽 네 시의 통화 | 이어폰 한쪽 | 마지막 정거장 | 해가 뜨는 방향 | 첫차가 오기 전에" },
  { id: "al02", title: "여름의 잔향", artist: "ar01", date: "2024-07-19", kind: "앨범", tracks: "잔향 | 소나기 예보 | 열대야 | 선풍기 소리 | 수박 한 조각 | 빈 해변 | 파도가 멈춘 날 | 여름 끝자락 | 모래 위의 이름 | 8월 31일 | 비 갠 오후 | 가을로 가는 기차" },
  { id: "al03", title: "마당이 있는 집", artist: "ar02", date: "2020-05-08", kind: "앨범", tracks: "아침 마당 | 빨랫줄 위의 햇살 | 장독대 | 할머니의 라디오 | 감나무 | 평상에 누워 | 저녁밥 짓는 냄새 | 대문 앞 고양이 | 이사하던 날 | 마당이 있는 집" },
  { id: "al04", title: "오월 편지", artist: "ar02", date: "2023-05-05", kind: "EP", tracks: "오월 편지 | 라일락 | 우체통 앞에서 | 소풍 가는 길 | 도시락 | 초록의 끝" },
  { id: "al05", title: "새벽 두 시의 체온", artist: "ar03", date: "2022-11-25", kind: "앨범", tracks: "체온 | 불 끄고 | 둘만 아는 말 | 소파 위에서 | 늦은 답장 | 휴대폰 불빛 | 어깨 | 겨울 이불 | 알람을 끄고 | 한 뼘 거리 | 조용한 고백 | 새벽 두 시의 체온" },
  { id: "al06", title: "느린 불빛", artist: "ar03", date: "2026-10-09", kind: "EP", tracks: "느린 불빛 | 그림자 놀이 | 향수병 | 샤워기 아래 | 엘리베이터 | 마지막 잔" },
  { id: "al07", title: "월요일은 늘 비", artist: "ar04", date: "2019-03-22", kind: "앨범", tracks: "월요일은 늘 비 | 지하철 2호선 | 야근 | 커피 세 잔 | 사원증 | 퇴근 십 분 전 | 점심 메뉴 | 회의록 | 금요일 밤의 주문 | 일요일의 하루살이" },
  { id: "al08", title: "Overtime Hymns", artist: "ar04", date: "2023-10-13", kind: "앨범", tracks: "Overtime Hymns | Paper Cuts | Fluorescent | Lunch Break Riot | Clock Out | Elevator Small Talk | Staple Gun | Sticky Notes | Out of Office | Friday Static" },
  { id: "al09", title: "구름 위의 거실", artist: "ar05", date: "2021-04-16", kind: "앨범", tracks: "구름 위의 거실 | 솜사탕 | 낮잠 | 커튼 사이로 | 은하수 샤워 | 느린 헤엄 | 반짝이는 먼지 | 별자리 지도 | 눈을 감으면 | 달무리" },
  { id: "al10", title: "Halo Weather", artist: "ar05", date: "2026-09-18", kind: "앨범", tracks: "Halo Weather | Soft Static | Sleepwalking Radio | Pastel Hours | Slow Orbit | Pillow Fort | Glow Stick Rain | Lullaby for Lights | Half Asleep Sky | Cotton Satellite | Dim Lamps | Morning Moon" },
  { id: "al11", title: "이별 뒤의 계절", artist: "ar06", date: "2018-11-30", kind: "앨범", tracks: "이별 뒤의 계절 | 빈 의자 | 우산 하나 | 지워지지 않는 번호 | 사진첩 | 너 없는 골목 | 두 번째 겨울 | 안부 | 괜찮아진 척 | 돌아보지 않기로 해" },
  { id: "al12", title: "다정한 사람", artist: "ar06", date: "2026-01-16", kind: "앨범", tracks: "다정한 사람 | 손난로 | 기다리는 시간 | 따뜻한 국물 | 오래된 외투 | 네가 웃으면 | 천천히 걸어 | 창가 자리 | 우리의 속도 | 잘 자요 | 내일의 안부 | 곁에 있어 줄게" },
  { id: "al13", title: "소음의 지도", artist: "ar07", date: "2020-09-04", kind: "앨범", instrumental: true, tracks: "소음의 지도 | 주파수 | 폐공장 | 철교 위의 바람 | 번개 이후 | 잔향실 | 쇳소리 | 새벽 방송 종료 | 파란 불꽃 | 침묵 합주" },
  { id: "al14", title: "푸른 정전", artist: "ar07", date: "2026-10-30", kind: "EP", instrumental: true, tracks: "정전 | 촛불 합주 | 퓨즈 | 암전 | 다시 켜질 때 | 푸른 정전" },
  { id: "al15", title: "두 사람의 기타", artist: "ar08", date: "2019-06-14", kind: "앨범", tracks: "두 사람의 기타 | 하모니카 | 모닥불 | 캠핑카 | 별이 많은 밤 | 낡은 기타 케이스 | 노래방 대신 | 같은 코드 | 마지막 후렴 | 집으로 가는 길" },
  { id: "al16", title: "일요일의 현", artist: "ar08", date: "2023-04-21", kind: "앨범", tracks: "일요일의 현 | 늦잠 | 팬케이크 | 창문을 열고 | 빨래하는 날 | 라디오 체조 | 공원 벤치 | 자전거 바퀴 | 소풍 매트 | 아이스크림 녹기 전에 | 노을 산책 | 월요일이 오기 전에" },
  { id: "al17", title: "공부방 테이프", artist: "ar09", date: "2021-09-10", kind: "앨범", instrumental: true, tracks: "공부방 테이프 | 형광펜 | 노트 필기 | 도서관 창가 | 새벽 모의고사 | 책상 스탠드 | 졸음 | 오답 노트 | 시험 끝 | 방학 첫날" },
  { id: "al18", title: "눈 녹는 소리", artist: "ar09", date: "2025-12-05", kind: "EP", instrumental: true, tracks: "눈 녹는 소리 | 처마 끝 | 김 서린 창 | 장갑 한 짝 | 첫 발자국 | 봄이 오기 전에" },
  { id: "al19", title: "골목 대장", artist: "ar10", date: "2020-08-28", kind: "앨범", tracks: "골목 대장 | 동네 한 바퀴 | 떡볶이 외상 | 옥상 사이퍼 | 슬리퍼 | 오락실 | 비 오는 날 농구 | 포장마차 | 삼촌의 차 | 막내의 꿈 | 이사 가는 날 | 다시 골목" },
  { id: "al20", title: "원룸 라디오", artist: "ar10", date: "2024-10-11", kind: "앨범", tracks: "원룸 라디오 | 월세 | 반지하 | 택배 상자 | 보증금 | 이불 속 마이크 | 옆집 소음 | 배달 앱 | 창문 없는 방 | 열쇠" },
  { id: "al21", title: "네온 아래 우리", artist: "ar11", date: "2022-06-24", kind: "앨범", tracks: "네온 아래 우리 | 심야 드라이브 | 택시 뒷자리 | 한강 야경 | 롤러스케이트 | 오렌지 칵테일 | 비디오 가게 | 강변북로 | 새벽 편의점 | 불 꺼진 간판" },
  { id: "al22", title: "Plastic Summer", artist: "ar11", date: "2026-03-20", kind: "앨범", tracks: "Plastic Summer | Poolside Telephone | Cassette Sunset | Rooftop Radio | Soda Machine | Beach Towel Love | Neon Parking Lot | Late Bus Home | Tangerine Skies | Sunburn Letters" },
  { id: "al23", title: "붉은 신호", artist: "ar12", date: "2021-10-01", kind: "앨범", tracks: "붉은 신호 | 야간 비행 | 전광판 | 사이렌 | 고속도로 | 터널 끝 | 라디오 주파수 | 위성 | 가상 도시 | 심장 박동 | 플랫폼 9번 | 노을공장" },
  { id: "al24", title: "공장의 밤", artist: "ar12", date: "2026-10-23", kind: "EP", tracks: "공장의 밤 | 컨베이어 | 용광로 | 연기 | 야간 근무 | 불꽃놀이" },
  { id: "al25", title: "답장 없는 편지", artist: "ar13", date: "2017-12-08", kind: "앨범", tracks: "답장 없는 편지 | 우체국 가는 길 | 봉투 | 우표 | 오래된 주소 | 지난겨울 | 읽지 않은 메시지 | 편지지 한 장 | 마지막 우편함 | 안녕이라는 말" },
  { id: "al26", title: "소나기가 그친 뒤", artist: "ar13", date: "2022-08-12", kind: "앨범", tracks: "소나기가 그친 뒤 | 처마 밑에서 | 물웅덩이 | 무지개 | 젖은 어깨 | 흙냄새 | 우산 없이 | 빗소리 녹음 | 장마 | 맑음" },
  { id: "al27", title: "Letters from the Orchard", artist: "ar14", date: "2019-09-27", kind: "앨범", tracks: "Orchard Gate | Lantern Lane | The Long Way Round | Pocket Full of Weather | Hush, Little Kettle | Apple Season | Postcards in March | Where the Fences End | Barefoot in October | Letters from the Orchard" },
  { id: "al28", title: "Wildflower Almanac", artist: "ar14", date: "2023-06-09", kind: "앨범", tracks: "Almanac | Clover and Clay | Bees at the Window | Creekside | Tin Cup Morning | A Map of Moss | Dandelion Clock | Harvest Table | Porch Light Choir | Frost on the Fence | Ten Thousand Leaves | Wildflower Almanac" },
  { id: "al29", title: "Paper Lanterns", artist: "ar15", date: "2018-04-13", kind: "앨범", tracks: "Paper Lanterns | Half-Lit Hallway | Cardboard Crown | Bicycle Weather | Static in the Orchard | Rooftop Rehearsal | Marigold | Cold Coffee Heart | Tape Hiss | Slow Fuse" },
  { id: "al30", title: "Afterglow Parade", artist: "ar15", date: "2024-09-06", kind: "앨범", tracks: "Afterglow Parade | Concrete Garden | Telephone Wires | Sparklers | Dust Under the Piano | Yellow Umbrella | Fireflies in the Subway | Borrowed Sweater | Small Fires | Backseat Constellations | Last Dance in the Kitchen | Afterglow" },
  { id: "al31", title: "Weather Systems for Sleeping", artist: "ar16", date: "2022-02-18", kind: "앨범", instrumental: true, tracks: "Cirrus | Low Pressure | Fog Bank | Rain Shadow | Warm Front | Barometer | Overcast | Dew Point | Stratus Lullaby | Clear Skies at Four" },
  { id: "al32", title: "Glitter Postcards", artist: "ar17", date: "2026-08-28", kind: "앨범", tracks: "Glitter Postcards | Boombox Heart | Sugar Rush Hour | Karaoke at Two | Pink Skyline | Polaroid Summer | Dancing in Socks | Spin the Bottle Cap | Confetti Season | Rewind Me" },
  { id: "al33", title: "Driftwood Hymnal", artist: "ar18", date: "2021-08-20", kind: "앨범", tracks: "Driftwood | Salt on the Strings | Tidewater Waltz | Lighthouse Keeper's Radio | Sail Cloth | Harbor Bells | Low Tide Lullaby | Anchor Chain | Seagull Mornings | Home Port" },
  { id: "al34", title: "Rust and Radio", artist: "ar19", date: "2020-03-06", kind: "앨범", tracks: "Rust and Radio | Dockside | Crane Lights | Salt Wind Static | Night Shift Tide | Cargo | Broken Compass | Fog Horn | Harbor Lights Out | Dawn Patrol" },
  { id: "al35", title: "Honey in the Machine", artist: "ar20", date: "2023-02-17", kind: "앨범", tracks: "Honey in the Machine | Velvet Alarm | Sunday Skin | Barefoot Prayer | Midnight Marmalade | Cinnamon Static | Kitchen Sink Blues | Soft Spot | Gold Thread | Amen, Goodnight" },
  { id: "al36", title: "Late Set at the Cellar", artist: "ar21", date: "2022-10-21", kind: "앨범", instrumental: true, tracks: "Late Set | Brushwork | Muted Trumpet Rain | Upright | Smoke Rings | Quarter Note Waltz | After the Last Call | Bassline Alley | Cymbal Weather | Last Train Out of Midtown" },
  { id: "al37", title: "Pocket Sun", artist: "ar22", date: "2024-05-31", kind: "앨범", tracks: "Pocket Sun | Practice Brave | Window Seat | Slow Learner | Coin Toss | Borrowed Sky | The Good Kind of Tired | Postcard Heart | Mixtape for Mondays | Brave Enough for Breakfast" },
  { id: "al38", title: "Neon Ledger", artist: "ar23", date: "2023-09-15", kind: "앨범", tracks: "Neon Ledger | Pager | Concrete Sermon | Silk and Static | Lowlight | Subway Cipher | Midnight Math | Pawn Shop Gold | Velvet Rope | Stoop Philosophy | Smoke Signals | Dawn Tax" },
  { id: "al39", title: "Chrome Horizon", artist: "ar24", date: "2021-03-26", kind: "앨범", tracks: "Chrome Horizon | Night Drive Protocol | Magnetic Tape | Laser Rain | Arcade Ghosts | Rewind City | Sunset Grid | Turbo Heart | VHS Moon | Neon Dial Tone" },
  { id: "al40", title: "Études for a Quiet House", artist: "ar25", date: "2022-05-13", kind: "앨범", instrumental: true, tracks: "Étude in Morning Light | Kettle Waltz | Prelude for Rain | Dust Nocturne | Stairwell Canon | Clockwork Lullaby | Winter Window | Moth Waltz | Interlude: Silence | Étude for a Quiet House" },
];
