// Snapshot of the public exam timetables (subject, date, minutes, rooms). No registrations, no people.

export type ExamRow = { key: string; subject: string; english: string; date: string | null; start: number | null; end: number | null; ec: boolean; rooms: readonly (readonly [string, readonly string[]])[]; note: string | null };
export type ExamPeriodRow = { key: string; kind: string; title: string; start: string; end: string; visibleFrom: string; visibleUntil: string; exams: readonly ExamRow[] };
export const EXAM_PERIODS: readonly ExamPeriodRow[] = [
 {
  "key": "2026-2-midterm",
  "kind": "midterm",
  "title": "2026학년도 2학기 중간고사",
  "start": "2026-10-12",
  "end": "2026-10-16",
  "visibleFrom": "2026-10-05",
  "visibleUntil": "2026-10-16",
  "exams": [
   {
    "key": "exam-001",
    "subject": "기초전자기학",
    "english": "Introduction to Electrodynamics",
    "date": "2026-10-12",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-002",
    "subject": "미적분학2",
    "english": "Calculus2(KC&EC)",
    "date": "2026-10-12",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6202",
      [
       "3",
       "4",
       "5"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-003",
    "subject": "수학1",
    "english": "Mathematics1(Korean)",
    "date": "2026-10-12",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3405",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-004",
    "subject": "화학및실험Ⅱ",
    "english": "Chemistry & Exp.Ⅱ",
    "date": "2026-10-12",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "탐2106",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-005",
    "subject": "글로벌문화와영어",
    "english": "Intercultural Literacy",
    "date": "2026-10-12",
    "start": 820,
    "end": 910,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-006",
    "subject": "창의적문제해결기법",
    "english": "Creative Problem Solving",
    "date": "2026-10-12",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "창5702",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-007",
    "subject": "일반생물학2",
    "english": "General Biology2(EC)",
    "date": "2026-10-12",
    "start": 940,
    "end": 1050,
    "ec": true,
    "rooms": [
     [
      "창5408",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-008",
    "subject": "미적분학3",
    "english": "Calculus3(EC)",
    "date": "2026-10-12",
    "start": 1170,
    "end": 1410,
    "ec": true,
    "rooms": [
     [
      "형3402",
      [
       "1"
      ]
     ],
     [
      "형3403",
      [
       "2"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-009",
    "subject": "미분방정식",
    "english": "Differential Equations",
    "date": "2026-10-13",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3402",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-010",
    "subject": "미적분학1",
    "english": "Calculus1",
    "date": "2026-10-13",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3306",
      [
       "1"
      ]
     ],
     [
      "예6202",
      [
       "2",
       "3"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-011",
    "subject": "수학2",
    "english": "Mathematics2",
    "date": "2026-10-13",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2",
       "3"
      ]
     ],
     [
      "대강당",
      [
       "4",
       "5",
       "6",
       "7"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-012",
    "subject": "생물학의활용",
    "english": "Use of Life Science",
    "date": "2026-10-13",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-013",
    "subject": "중급물리학특강(물리학을위한수학적도구들)",
    "english": "Special Topics in Intermediate Physics(Mathematical Tools for Physics)",
    "date": "2026-10-13",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3404",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-014",
    "subject": "화학의활용",
    "english": "Use of Chemistry",
    "date": "2026-10-13",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-015",
    "subject": "고급알고리즘",
    "english": "Advanced Algorithms",
    "date": "2026-10-13",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "창5702",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-016",
    "subject": "물리학및실험2",
    "english": "Physics and Exp.2(Korean)",
    "date": "2026-10-13",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-017",
    "subject": "물리학및실험Ⅱ",
    "english": "Physics and Exp.Ⅱ",
    "date": "2026-10-13",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-018",
    "subject": "수학1",
    "english": "Mathematics2(Foreign)",
    "date": "2026-10-13",
    "start": 820,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-019",
    "subject": "우주생물학",
    "english": "Astrobiology",
    "date": "2026-10-13",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-020",
    "subject": "중급물리학특강(물리학을위한인공지능)",
    "english": "Special Topics in Intermediate Physic (Artificial Intelligence for Physics)",
    "date": "2026-10-13",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "창5510",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-021",
    "subject": "일반지구과학",
    "english": "General Earth Science",
    "date": "2026-10-13",
    "start": 940,
    "end": 1040,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-022",
    "subject": "수학적모델링",
    "english": "Mathematical Modeling",
    "date": "2026-10-13",
    "start": 1170,
    "end": 1410,
    "ec": false,
    "rooms": [
     [
      "형3402",
      [
       "1"
      ]
     ],
     [
      "형3403",
      [
       "2"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-023",
    "subject": "선형대수",
    "english": "Linear Algebra(KC&EC)",
    "date": "2026-10-14",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-024",
    "subject": "유전자의이해",
    "english": "DNA Science",
    "date": "2026-10-14",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "창5408",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-025",
    "subject": "정보과학2",
    "english": "Computer Science2(Foreign)",
    "date": "2026-10-14",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "창5701",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-026",
    "subject": "화학특강(계산화학과화학반응)",
    "english": "Special Topics in Chemistry (Computational Chemistry and Chemical Reactions)",
    "date": "2026-10-14",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-027",
    "subject": "일반물리학2",
    "english": "General Physics2(KC&EC)",
    "date": "2026-10-14",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-028",
    "subject": "전자회로의이해와응용",
    "english": "Understanding and Applications of Basic Electronics",
    "date": "2026-10-14",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-029",
    "subject": "확률및통계",
    "english": "Probability and Statistics(EC)",
    "date": "2026-10-14",
    "start": 820,
    "end": 930,
    "ec": true,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-030",
    "subject": "기초유기화학",
    "english": "Fundamentals of Organic Chemistry(EC)",
    "date": "2026-10-14",
    "start": 940,
    "end": 1050,
    "ec": true,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-031",
    "subject": "별과우주",
    "english": "Stars and Universe",
    "date": "2026-10-14",
    "start": 940,
    "end": 1050,
    "ec": false,
    "rooms": [
     [
      "창5510",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-032",
    "subject": "생물학및실험",
    "english": "Biology and Exp.(Korean)",
    "date": "2026-10-14",
    "start": 940,
    "end": 1050,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6202",
      [
       "3",
       "4"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-033",
    "subject": "생물학및실험Ⅱ",
    "english": "Biology and Exp.Ⅰ(Foreign)",
    "date": "2026-10-14",
    "start": 940,
    "end": 1050,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-034",
    "subject": "한국사의이해",
    "english": "Understanding of Korean History",
    "date": "2026-10-14",
    "start": 940,
    "end": 1050,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-035",
    "subject": "지구과학입문",
    "english": "Introduction to Earth Science",
    "date": "2026-10-14",
    "start": 1170,
    "end": 1260,
    "ec": false,
    "rooms": [
     [
      "탐2403",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-036",
    "subject": "기초학술영어",
    "english": "English for Academic Purposes",
    "date": "2026-10-15",
    "start": 520,
    "end": 620,
    "ec": false,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-037",
    "subject": "일반화학2",
    "english": "General Chemistry2(KC&EC)",
    "date": "2026-10-15",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-038",
    "subject": "탐구물리",
    "english": "Project Physics",
    "date": "2026-10-15",
    "start": 520,
    "end": 600,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-039",
    "subject": "기초해석학",
    "english": "Elementary Real Analysis",
    "date": "2026-10-15",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3404",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-040",
    "subject": "수학특강(위상수학)",
    "english": "Special Topics in Mathematics(Topology)",
    "date": "2026-10-15",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3405",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-041",
    "subject": "화학및실험",
    "english": "Chemistry and Exp.(Korean)",
    "date": "2026-10-15",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-042",
    "subject": "물리학기초Ⅱ",
    "english": "Basics of PhysicsⅡ",
    "date": "2026-10-15",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-043",
    "subject": "물리학및실험1",
    "english": "Physics and Exp.1",
    "date": "2026-10-15",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6202",
      [
       "3",
       "4"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-044",
    "subject": "정보과학3",
    "english": "Computer Science3",
    "date": "2026-10-15",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "창5702",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-045",
    "subject": "영어특강(Advanced Speaking & Writing)",
    "english": "Special Topics in English(Advanced Speaking & Writing)",
    "date": "2026-10-15",
    "start": 820,
    "end": 910,
    "ec": false,
    "rooms": [
     [
      "도서관 4층 세미나실",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-046",
    "subject": "일반물리학1",
    "english": "General Physics1(KC&EC)",
    "date": "2026-10-15",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-047",
    "subject": "일반화학1",
    "english": "General Chemistry1(KC&EC)",
    "date": "2026-10-15",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-048",
    "subject": "한국어2",
    "english": "Korean2(Foreign)",
    "date": "2026-10-15",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-049",
    "subject": "TOPIK한국어",
    "english": "TOPIK Korean",
    "date": "2026-10-15",
    "start": 940,
    "end": 1050,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-050",
    "subject": "문학",
    "english": "Literature",
    "date": "2026-10-15",
    "start": 940,
    "end": 1050,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-051",
    "subject": "물리학문제의해결과소통",
    "english": "Physics Problem Solving and Communication",
    "date": "2026-10-16",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "창5510",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-052",
    "subject": "소통과작문",
    "english": "Communication and Composition",
    "date": "2026-10-16",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2",
       "3"
      ]
     ],
     [
      "예6202",
      [
       "4",
       "5",
       "6"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-053",
    "subject": "수학특강(인공지능수학)",
    "english": "Special topics in mathematics (Mathematics for AI)",
    "date": "2026-10-16",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-054",
    "subject": "일반생물학1",
    "english": "General Biology1(EC)",
    "date": "2026-10-16",
    "start": 520,
    "end": 630,
    "ec": true,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-055",
    "subject": "일반천문학",
    "english": "General Astronomy",
    "date": "2026-10-16",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-056",
    "subject": "과학기술과사회",
    "english": "Science, Technology and Society",
    "date": "2026-10-16",
    "start": 700,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-057",
    "subject": "융합특강(물리학의역사와철학)",
    "english": "Special Topics in Convergence(History and Philosophy of Physics)",
    "date": "2026-10-16",
    "start": 700,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-058",
    "subject": "국어2",
    "english": "Korean2(Korean)",
    "date": "2026-10-16",
    "start": 820,
    "end": 900,
    "ec": false,
    "rooms": [
     [
      "대강당",
      [
       "4",
       "5",
       "6",
       "7",
       "8"
      ]
     ],
     [
      "예6201",
      [
       "1",
       "2",
       "3"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-059",
    "subject": "뉴스와미디어",
    "english": "News and Media",
    "date": "2026-10-16",
    "start": 820,
    "end": 870,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-060",
    "subject": "법과학",
    "english": "Forensic Science",
    "date": "2026-10-16",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-061",
    "subject": "융합특강(AI시대의인간기술)",
    "english": "",
    "date": null,
    "start": null,
    "end": null,
    "ec": false,
    "rooms": [],
    "note": "중간고사 별도 실시 — 시험 일시와 장소는 별도 안내를 확인하세요."
   }
  ]
 },
 {
  "key": "2026-2-final",
  "kind": "final",
  "title": "2026학년도 2학기 기말고사",
  "start": "2026-12-07",
  "end": "2026-12-11",
  "visibleFrom": "2026-11-30",
  "visibleUntil": "2026-12-11",
  "exams": [
   {
    "key": "exam-001",
    "subject": "미적분학1",
    "english": "Calculus1",
    "date": "2026-12-07",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3307",
      [
       "1"
      ]
     ],
     [
      "예6202",
      [
       "2",
       "3"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-002",
    "subject": "미분방정식",
    "english": "Differential Equations",
    "date": "2026-12-07",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3402",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-003",
    "subject": "화학과예술",
    "english": "Chemistry and Art",
    "date": "2026-12-07",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-004",
    "subject": "물리학기초Ⅱ",
    "english": "Basics of PhysicsⅡ",
    "date": "2026-12-07",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-005",
    "subject": "수학2",
    "english": "Mathematics2",
    "date": "2026-12-07",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2",
       "3"
      ]
     ],
     [
      "대강당",
      [
       "4",
       "5",
       "6",
       "7"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-006",
    "subject": "논리와글쓰기",
    "english": "Logical Writing",
    "date": "2026-12-07",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-007",
    "subject": "수학특강(인공지능수학)",
    "english": "Special topics in mathematics (Mathematics for AI)",
    "date": "2026-12-07",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-008",
    "subject": "기초전자기학",
    "english": "Introduction to Electrodynamics",
    "date": "2026-12-07",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3402",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-009",
    "subject": "정보과학2",
    "english": "Computer Science2(Foreign)",
    "date": "2026-12-07",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "창5701",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-010",
    "subject": "스페인언어와문화",
    "english": "Spanish Language & Culture",
    "date": "2026-12-07",
    "start": 820,
    "end": 870,
    "ec": false,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-011",
    "subject": "우주생물학",
    "english": "Astrobiology",
    "date": "2026-12-07",
    "start": 940,
    "end": 1050,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-012",
    "subject": "수학과예술",
    "english": "Arthematics",
    "date": "2026-12-07",
    "start": 940,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "DDC 2층",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-013",
    "subject": "영어Ⅱ",
    "english": "EnglishⅡ",
    "date": "2026-12-07",
    "start": 940,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2",
       "3",
       "4"
      ]
     ],
     [
      "예6202",
      [
       "5",
       "6",
       "7",
       "8"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-014",
    "subject": "일반생물학1",
    "english": "General Biology1(EC)",
    "date": "2026-12-07",
    "start": 1000,
    "end": 1110,
    "ec": true,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-015",
    "subject": "미적분학3",
    "english": "Calculus3(EC)",
    "date": "2026-12-07",
    "start": 1170,
    "end": 1410,
    "ec": true,
    "rooms": [
     [
      "형3402",
      [
       "1"
      ]
     ],
     [
      "형3403",
      [
       "2"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-016",
    "subject": "수학1",
    "english": "Mathematics1(Korean)",
    "date": "2026-12-08",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3405",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-017",
    "subject": "단어와문장",
    "english": "Words and Sentences",
    "date": "2026-12-08",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-018",
    "subject": "미적분학2",
    "english": "Calculus2(including EC)",
    "date": "2026-12-08",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6202",
      [
       "3",
       "4",
       "5"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-019",
    "subject": "TOPIK한국어",
    "english": "TOPIK Korean",
    "date": "2026-12-08",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-020",
    "subject": "철학",
    "english": "Philosophy",
    "date": "2026-12-08",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-021",
    "subject": "한국어2",
    "english": "Korean2",
    "date": "2026-12-08",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-022",
    "subject": "수학의활용",
    "english": "Application of Mathematics(Foreign)",
    "date": "2026-12-08",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3402",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-023",
    "subject": "소통과화법",
    "english": "Communication and Speech",
    "date": "2026-12-08",
    "start": 820,
    "end": 920,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-024",
    "subject": "일본언어와문화",
    "english": "Japanese Language & Culture",
    "date": "2026-12-08",
    "start": 940,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-025",
    "subject": "일반천문학",
    "english": "General Astronomy",
    "date": "2026-12-08",
    "start": 1000,
    "end": 1110,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-026",
    "subject": "일반지구과학",
    "english": "General Earth Science",
    "date": "2026-12-08",
    "start": 1000,
    "end": 1100,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-027",
    "subject": "수학적모델링",
    "english": "Mathematical Modeling",
    "date": "2026-12-08",
    "start": 1170,
    "end": 1410,
    "ec": false,
    "rooms": [
     [
      "형3402",
      [
       "1"
      ]
     ],
     [
      "형3403",
      [
       "2"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-028",
    "subject": "세계사의이해",
    "english": "Understanding of World History",
    "date": "2026-12-09",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-029",
    "subject": "물리학및실험1",
    "english": "Physics and Exp.1",
    "date": "2026-12-09",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6202",
      [
       "3",
       "4"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-030",
    "subject": "일반화학2",
    "english": "General Chemistry2(including EC)",
    "date": "2026-12-09",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-031",
    "subject": "물리학및실험2",
    "english": "Physics and Exp.2(Korean)",
    "date": "2026-12-09",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-032",
    "subject": "물리학및실험Ⅱ",
    "english": "Physics and Exp.Ⅱ",
    "date": "2026-12-09",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-033",
    "subject": "디지털경제",
    "english": "Digital Economy",
    "date": "2026-12-09",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-034",
    "subject": "프로그래밍과문제해결",
    "english": "Programming and Problem Solving(EC)",
    "date": "2026-12-09",
    "start": 820,
    "end": 1050,
    "ec": true,
    "rooms": [
     [
      "창5708",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-035",
    "subject": "수학특강(해석학)",
    "english": "Special Topics in Mathematics(Analysis)",
    "date": "2026-12-09",
    "start": 820,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "형3404",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-036",
    "subject": "화학및실험",
    "english": "Chemistry and Exp.(Korean)",
    "date": "2026-12-09",
    "start": 820,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-037",
    "subject": "별과우주",
    "english": "Stars and Universe",
    "date": "2026-12-09",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "창5510",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-038",
    "subject": "중급물리학특강(물리학을위한수학적도구들)",
    "english": "Special Topics in Intermediate Physics(Mathematical Tools for Physics)",
    "date": "2026-12-09",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3402",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-039",
    "subject": "화학및실험Ⅱ",
    "english": "Chemistry & Exp.Ⅱ",
    "date": "2026-12-09",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-040",
    "subject": "분광학입문",
    "english": "Spectroscopy",
    "date": "2026-12-09",
    "start": 1000,
    "end": 1110,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-041",
    "subject": "지구과학특강(관측천문학)",
    "english": "Special Topics in Earth Science (Observational Astronomy)",
    "date": "2026-12-09",
    "start": 1000,
    "end": 1110,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-042",
    "subject": "지구과학입문",
    "english": "Introduction to Earth Science",
    "date": "2026-12-09",
    "start": 1170,
    "end": 1260,
    "ec": false,
    "rooms": [
     [
      "탐2403",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-043",
    "subject": "수학1",
    "english": "Mathematics(Foreign)",
    "date": "2026-12-10",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-044",
    "subject": "유전자의이해",
    "english": "DNA Science",
    "date": "2026-12-10",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "창5408",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-045",
    "subject": "나노화학의입문",
    "english": "Introduction to Nanochemistry(EC)",
    "date": "2026-12-10",
    "start": 580,
    "end": 690,
    "ec": true,
    "rooms": [
     [
      "창5608",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-046",
    "subject": "철학의이해",
    "english": "Philosophy(Foreign Students)",
    "date": "2026-12-10",
    "start": 580,
    "end": 690,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-047",
    "subject": "선형대수",
    "english": "Linear Algebra(including EC)",
    "date": "2026-12-10",
    "start": 580,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-048",
    "subject": "기초해석학",
    "english": "Elementary Real Analysis",
    "date": "2026-12-10",
    "start": 820,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "형3404",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-049",
    "subject": "생물학및실험",
    "english": "Biology and Exp.(Korean)",
    "date": "2026-12-10",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6201",
      [
       "1",
       "2"
      ]
     ],
     [
      "예6202",
      [
       "3",
       "4"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-050",
    "subject": "생물학및실험Ⅱ",
    "english": "Biology and Exp.Ⅱ",
    "date": "2026-12-10",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6202",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-051",
    "subject": "일반화학1",
    "english": "General Chemistry1(including EC)",
    "date": "2026-12-10",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-052",
    "subject": "기초유기화학",
    "english": "Fundamentals of Organic Chemistry(EC)",
    "date": "2026-12-10",
    "start": 820,
    "end": 930,
    "ec": true,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-053",
    "subject": "그림,음악,영화로보는세계사",
    "english": "World History through Painting, Music, and Film",
    "date": "2026-12-10",
    "start": 820,
    "end": 870,
    "ec": false,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-054",
    "subject": "중국언어와문화",
    "english": "Chinese Language & Culture",
    "date": "2026-12-10",
    "start": 940,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "형3306",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-055",
    "subject": "법과학",
    "english": "Forensic Science",
    "date": "2026-12-10",
    "start": 1000,
    "end": 1110,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-056",
    "subject": "정치와경제",
    "english": "Politics and Economics",
    "date": "2026-12-11",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "대강당",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-057",
    "subject": "수학의활용",
    "english": "Application of Mathematics(Korean)",
    "date": "2026-12-11",
    "start": 520,
    "end": 630,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-058",
    "subject": "정보과학2",
    "english": "Computer Science2(Korean)",
    "date": "2026-12-11",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6202",
      [
       "1",
       "2",
       "3"
      ]
     ],
     [
      "대강당",
      [
       "4",
       "5",
       "6",
       "7",
       "8"
      ]
     ]
    ],
    "note": null
   },
   {
    "key": "exam-059",
    "subject": "일반물리학2",
    "english": "General Physics2(including EC)",
    "date": "2026-12-11",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-060",
    "subject": "확률및통계",
    "english": "Probability and Statistics(EC)",
    "date": "2026-12-11",
    "start": 640,
    "end": 750,
    "ec": true,
    "rooms": [
     [
      "형3307",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-061",
    "subject": "문학과사회",
    "english": "Literature and Society",
    "date": "2026-12-11",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3305",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-062",
    "subject": "한국사",
    "english": "Korean History",
    "date": "2026-12-11",
    "start": 640,
    "end": 750,
    "ec": false,
    "rooms": [
     [
      "형3402",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-063",
    "subject": "수학특강(위상수학)",
    "english": "Special Topics in Mathematics(Topology)",
    "date": "2026-12-11",
    "start": 820,
    "end": 990,
    "ec": false,
    "rooms": [
     [
      "형3405",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-064",
    "subject": "일반생물학2",
    "english": "General Biology2(EC)",
    "date": "2026-12-11",
    "start": 820,
    "end": 930,
    "ec": true,
    "rooms": [
     [
      "창5408",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-065",
    "subject": "일반물리학1",
    "english": "General Physics1(including EC)",
    "date": "2026-12-11",
    "start": 820,
    "end": 930,
    "ec": false,
    "rooms": [
     [
      "예6201",
      []
     ]
    ],
    "note": null
   },
   {
    "key": "exam-066",
    "subject": "이산구조",
    "english": "",
    "date": null,
    "start": null,
    "end": null,
    "ec": false,
    "rooms": [],
    "note": "기말고사 별도 실시 — 시험 일시와 장소는 별도 안내를 확인하세요."
   }
  ]
 }
];
