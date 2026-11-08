export type ArtistKind = "솔로" | "그룹" | "듀오";

export type ArtistSpec = {
  id: string;
  name: string;
  kind: ArtistKind;
  genre: string;
  origin: string;
  since: number;
  bio: string;
  alike: readonly string[];
};

export const ARTIST_SPECS: readonly ArtistSpec[] = [
  { id: "ar01", name: "새벽녘", kind: "그룹", genre: "indie-rock", origin: "서울", since: 2016, alike: ["ar07", "ar15", "ar19"], bio: "서울 마포의 합주실에서 시작한 4인조 밴드. 막차가 끊긴 뒤의 거리와 이른 아침의 공기를 기타 소리로 옮기는 데 집중합니다." },
  { id: "ar02", name: "오월의 정류장", kind: "그룹", genre: "folk", origin: "대전", since: 2018, alike: ["ar08", "ar14", "ar18"], bio: "대전의 작은 책방에서 처음 만난 다섯 사람의 포크 밴드. 어쿠스틱 기타와 아코디언, 손으로 쓴 가사가 특징입니다." },
  { id: "ar03", name: "서이안", kind: "솔로", genre: "rnb", origin: "서울", since: 2019, alike: ["ar20", "ar06", "ar05"], bio: "새벽에 쓴 노래만 모아 첫 앨범을 낸 싱어송라이터. 낮은 목소리와 느린 템포로 밤의 체온을 그립니다." },
  { id: "ar04", name: "하루살이 클럽", kind: "그룹", genre: "alternative", origin: "부산", since: 2015, alike: ["ar19", "ar01", "ar15"], bio: "부산의 직장인 밴드 출신. 월요일의 피로와 금요일의 해방감을 거친 기타로 노래합니다." },
  { id: "ar05", name: "달무리", kind: "듀오", genre: "dreampop", origin: "서울", since: 2020, alike: ["ar16", "ar09", "ar03"], bio: "신시사이저와 목소리만으로 구름 같은 소리를 쌓는 두 사람. 졸음이 오는 오후의 감각을 음악으로 만듭니다." },
  { id: "ar06", name: "윤해솔", kind: "솔로", genre: "ballad", origin: "광주", since: 2014, alike: ["ar13", "ar22", "ar03"], bio: "피아노 한 대와 담담한 목소리로 이별 이후의 시간을 노래하는 싱어송라이터입니다." },
  { id: "ar07", name: "푸른 소음", kind: "그룹", genre: "indie-rock", origin: "인천", since: 2013, alike: ["ar01", "ar16", "ar19"], bio: "가사 없이 소리의 질감만으로 이야기하는 포스트 록 밴드. 공장 지대의 풍경에서 영감을 얻습니다." },
  { id: "ar08", name: "이든과 소리", kind: "듀오", genre: "folk", origin: "제주", since: 2017, alike: ["ar02", "ar18", "ar14"], bio: "제주에서 기타 두 대로 노래하는 듀오. 캠핑장과 작은 공연장을 오가며 앨범을 만들었습니다." },
  { id: "ar09", name: "봄눈", kind: "솔로", genre: "electronic", origin: "서울", since: 2019, alike: ["ar16", "ar05", "ar25"], bio: "공부방의 낡은 카세트 소리를 샘플링해 만드는 로파이 프로듀서입니다." },
  { id: "ar10", name: "강다온", kind: "솔로", genre: "hiphop", origin: "인천", since: 2018, alike: ["ar23", "ar11", "ar04"], bio: "동네 골목과 옥상에서 쓴 랩으로 시작한 래퍼. 일상의 풍경을 담담하게 풀어냅니다." },
  { id: "ar11", name: "미로", kind: "그룹", genre: "citypop", origin: "서울", since: 2019, alike: ["ar12", "ar24", "ar17"], bio: "한강 야경과 심야 드라이브가 떠오르는 6인조 시티 팝 밴드입니다." },
  { id: "ar12", name: "노을공장", kind: "그룹", genre: "synthwave", origin: "울산", since: 2017, alike: ["ar24", "ar11", "ar09"], bio: "야간 공장의 불빛에서 영감을 얻은 신스웨이브 밴드. 아날로그 신시사이저가 중심입니다." },
  { id: "ar13", name: "파란우체통", kind: "솔로", genre: "ballad", origin: "전주", since: 2012, alike: ["ar06", "ar22", "ar02"], bio: "편지처럼 쓰는 노래로 오래 사랑받아 온 발라드 가수입니다." },
  { id: "ar14", name: "Marlowe Finch", kind: "솔로", genre: "folk", origin: "영국 콘월", since: 2016, alike: ["ar18", "ar02", "ar22"], bio: "영국 서부의 작은 과수원 마을에서 활동하는 포크 싱어송라이터. 날씨와 부엌, 계절에 관한 노래를 씁니다." },
  { id: "ar15", name: "The Glass Orchard", kind: "그룹", genre: "indie-rock", origin: "미국 시카고", since: 2014, alike: ["ar01", "ar19", "ar04"], bio: "옥상과 지하 연습실을 오가며 자란 4인조 인디 록 밴드. 쨍한 기타와 소란스러운 코러스가 특징입니다." },
  { id: "ar16", name: "Lumen Fields", kind: "솔로", genre: "ambient", origin: "아이슬란드 레이캬비크", since: 2018, alike: ["ar25", "ar09", "ar05"], bio: "구름과 기압을 소리로 옮기는 앰비언트 프로듀서. 잠들기 전에 듣는 음악으로 알려져 있습니다." },
  { id: "ar17", name: "Odessa Vale", kind: "솔로", genre: "pop", origin: "미국 로스앤젤레스", since: 2020, alike: ["ar22", "ar11", "ar24"], bio: "반짝이는 신시사이저와 노래방 같은 후렴으로 사랑받는 팝 아티스트입니다." },
  { id: "ar18", name: "Cedar & Tide", kind: "듀오", genre: "folk", origin: "캐나다 노바스코샤", since: 2015, alike: ["ar14", "ar08", "ar02"], bio: "바닷가 마을에서 자란 두 사람의 포크 듀오. 파도 소리를 직접 녹음해 앨범에 담습니다." },
  { id: "ar19", name: "Harbor Static", kind: "그룹", genre: "alternative", origin: "영국 리버풀", since: 2013, alike: ["ar04", "ar15", "ar01"], bio: "항구 도시의 소음과 거친 기타를 섞는 얼터너티브 록 밴드입니다." },
  { id: "ar20", name: "Juno Parker", kind: "솔로", genre: "soul", origin: "미국 멤피스", since: 2017, alike: ["ar03", "ar21", "ar22"], bio: "교회 합창단에서 시작한 소울 싱어. 따뜻하고 묵직한 목소리가 중심입니다." },
  { id: "ar21", name: "Velvet Meridian", kind: "그룹", genre: "jazz", origin: "미국 뉴올리언스", since: 2011, alike: ["ar20", "ar25", "ar23"], bio: "지하 재즈 클럽의 마지막 세트 같은 분위기를 내는 5인조 재즈 콤보입니다." },
  { id: "ar22", name: "Tobias Reyne", kind: "솔로", genre: "pop", origin: "호주 멜버른", since: 2016, alike: ["ar14", "ar17", "ar06"], bio: "어쿠스틱 기타와 솔직한 가사로 일상의 작은 용기를 노래하는 싱어송라이터입니다." },
  { id: "ar23", name: "Nightfall Cartel", kind: "그룹", genre: "hiphop", origin: "미국 뉴욕", since: 2014, alike: ["ar10", "ar21", "ar24"], bio: "도시의 밤 풍경을 영화처럼 그리는 힙합 크루입니다." },
  { id: "ar24", name: "Silver Cassette", kind: "듀오", genre: "synthwave", origin: "독일 베를린", since: 2016, alike: ["ar12", "ar11", "ar23"], bio: "80년대 카세트 감성과 레이저 같은 신시사이저로 밤 드라이브를 그리는 듀오입니다." },
  { id: "ar25", name: "Wren Alder", kind: "솔로", genre: "classical", origin: "스웨덴 예테보리", since: 2015, alike: ["ar16", "ar21", "ar09"], bio: "조용한 집에서 연주하는 것처럼 녹음하는 피아니스트. 일상의 소리를 연주에 섞습니다." },
];

export type GenreSpec = { id: string; name: string; blurb: string };

export const GENRE_SPECS: readonly GenreSpec[] = [
  { id: "indie-rock", name: "인디 록", blurb: "합주실에서 막 나온 듯한 기타와 드럼." },
  { id: "folk", name: "포크", blurb: "기타 한 대와 손으로 쓴 가사." },
  { id: "rnb", name: "R&B", blurb: "느린 박자와 낮은 목소리의 밤." },
  { id: "hiphop", name: "힙합", blurb: "골목과 옥상, 도시의 이야기." },
  { id: "electronic", name: "일렉트로닉", blurb: "샘플과 신시사이저로 쌓은 소리." },
  { id: "pop", name: "팝", blurb: "한 번 들으면 따라 부르게 되는 후렴." },
  { id: "jazz", name: "재즈", blurb: "늦은 밤 클럽의 마지막 세트." },
  { id: "ballad", name: "발라드", blurb: "천천히 마음에 내려앉는 노래." },
  { id: "ambient", name: "앰비언트", blurb: "잠들기 전의 느린 풍경." },
  { id: "citypop", name: "시티 팝", blurb: "네온과 심야 드라이브." },
  { id: "classical", name: "클래식", blurb: "조용한 집에서 듣는 피아노." },
  { id: "alternative", name: "얼터너티브", blurb: "거친 기타와 솔직한 목소리." },
  { id: "soul", name: "소울", blurb: "따뜻하고 묵직한 목소리." },
  { id: "synthwave", name: "신스웨이브", blurb: "레이저 같은 신시사이저와 80년대의 밤." },
  { id: "dreampop", name: "드림 팝", blurb: "구름처럼 번지는 소리." },
];
