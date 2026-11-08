// What the printer offers: the macros Klipper reports (printer.objects.list: gcode_macro …), the commands the console
// completes, the services and devices the power menu lists, and the notices the bell shows.

import type { CommandDef, MacroDef } from "./model";

export const MACROS: readonly MacroDef[] = [
  { name: "BEFORE_LOAD_FILAMENT", description: "필라멘트를 넣기 전에 노즐을 데우고 압출기를 풀어 줍니다.", params: [{ name: "TEMP", label: "노즐 온도", value: "200" }] },
  { name: "COOLING", description: "히터를 모두 끄고 팬을 돌려 식힙니다.", params: [] },
  { name: "END_PRINT", description: "출력을 마무리합니다. 노즐을 올리고 히터를 끕니다.", params: [] },
  { name: "LOAD_FILAMENT", description: "필라멘트를 노즐까지 밀어 넣습니다.", params: [{ name: "LENGTH", label: "길이 (mm)", value: "80" }, { name: "TEMP", label: "노즐 온도", value: "210" }] },
  { name: "M600", description: "필라멘트를 교체합니다. 출력을 멈추고 노즐을 한쪽으로 뺍니다.", params: [] },
  { name: "PREHEAT_PLA", description: "PLA 온도로 노즐과 베드를 데웁니다.", params: [{ name: "EXTRUDER", label: "노즐 온도", value: "210" }, { name: "BED", label: "베드 온도", value: "60" }] },
  { name: "PREHEAT_TPU", description: "TPU 온도로 노즐과 베드를 데웁니다.", params: [{ name: "EXTRUDER", label: "노즐 온도", value: "230" }, { name: "BED", label: "베드 온도", value: "50" }] },
  { name: "SET_PAUSE_AT_LAYER", description: "지정한 층에서 출력을 멈추도록 예약합니다.", params: [{ name: "LAYER", label: "층", value: "500" }] },
  { name: "SET_PAUSE_NEXT_LAYER", description: "다음 층을 시작할 때 출력을 멈추도록 예약합니다.", params: [{ name: "MACRO", label: "실행할 매크로", value: "PAUSE" }] },
  { name: "UNLOAD_FILAMENT", description: "필라멘트를 빼냅니다.", params: [{ name: "TEMP", label: "노즐 온도", value: "200" }, { name: "LENGTH", label: "길이 (mm)", value: "100" }] },
  { name: "PAUSE", description: "출력을 멈추고 노즐을 한쪽으로 뺍니다.", params: [] },
  { name: "RESUME", description: "멈춘 출력을 이어서 합니다.", params: [] },
  { name: "CANCEL_PRINT", description: "출력을 취소하고 히터를 끕니다.", params: [] },
  { name: "SET_PRINT_STATS_INFO", description: "슬라이서가 층 수를 알려 줄 때 쓰는 내부 매크로입니다.", params: [] },
];

// What the dashboard hides until the user turns them on in the settings.
export const HIDDEN_MACROS: readonly string[] = ["PAUSE", "RESUME", "CANCEL_PRINT", "SET_PRINT_STATS_INFO"];

const COMMAND_LIST: CommandDef[] = [
  { name: "G0", description: "빠른 이동", kind: "gcode" },
  { name: "G1", description: "직선 이동 (X Y Z E F)", kind: "gcode" },
  { name: "G4", description: "잠시 멈춤 (P 밀리초)", kind: "gcode" },
  { name: "G28", description: "원점 복귀 (X Y Z)", kind: "gcode" },
  { name: "G29", description: "베드 메시 보정", kind: "gcode" },
  { name: "G90", description: "절대 좌표", kind: "gcode" },
  { name: "G91", description: "상대 좌표", kind: "gcode" },
  { name: "G92", description: "현재 위치를 지정한 값으로 설정", kind: "gcode" },
  { name: "M18", description: "모터 끄기", kind: "gcode" },
  { name: "M82", description: "압출기 절대 좌표", kind: "gcode" },
  { name: "M83", description: "압출기 상대 좌표", kind: "gcode" },
  { name: "M84", description: "모터 끄기", kind: "gcode" },
  { name: "M104", description: "노즐 목표 온도 (S)", kind: "gcode" },
  { name: "M105", description: "온도 읽기", kind: "gcode" },
  { name: "M106", description: "팬 속도 (S 0–255)", kind: "gcode" },
  { name: "M107", description: "팬 끄기", kind: "gcode" },
  { name: "M109", description: "노즐 온도에 닿을 때까지 기다림 (S)", kind: "gcode" },
  { name: "M112", description: "긴급 정지", kind: "gcode" },
  { name: "M114", description: "현재 위치 읽기", kind: "gcode" },
  { name: "M115", description: "펌웨어 정보", kind: "gcode" },
  { name: "M117", description: "화면에 메시지 표시", kind: "gcode" },
  { name: "M118", description: "콘솔에 메시지 보내기", kind: "gcode" },
  { name: "M140", description: "베드 목표 온도 (S)", kind: "gcode" },
  { name: "M190", description: "베드 온도에 닿을 때까지 기다림 (S)", kind: "gcode" },
  { name: "M220", description: "속도 배율 (S %)", kind: "gcode" },
  { name: "M221", description: "압출 배율 (S %)", kind: "gcode" },
  { name: "M24", description: "SD 카드 출력 시작·재개", kind: "gcode" },
  { name: "M25", description: "SD 카드 출력 일시 정지", kind: "gcode" },
  { name: "BED_MESH_CALIBRATE", description: "베드를 프로브로 측정해 메시를 만듭니다", kind: "klipper" },
  { name: "BED_MESH_CLEAR", description: "지금의 베드 메시를 지웁니다", kind: "klipper" },
  { name: "BED_MESH_PROFILE", description: "메시 프로필 저장·불러오기·삭제 (SAVE= LOAD= REMOVE=)", kind: "klipper" },
  { name: "CANCEL_PRINT", description: "출력을 취소합니다", kind: "macro" },
  { name: "FIRMWARE_RESTART", description: "MCU를 포함해 펌웨어를 다시 시작합니다", kind: "klipper" },
  { name: "HELP", description: "쓸 수 있는 확장 명령을 나열합니다", kind: "klipper" },
  { name: "PAUSE", description: "출력을 멈춥니다", kind: "macro" },
  { name: "PROBE_CALIBRATE", description: "프로브의 Z 오프셋을 측정합니다", kind: "klipper" },
  { name: "QUERY_ENDSTOPS", description: "엔드스톱 상태를 읽습니다", kind: "klipper" },
  { name: "RESTART", description: "Klipper 호스트 소프트웨어를 다시 시작합니다", kind: "klipper" },
  { name: "RESUME", description: "멈춘 출력을 이어서 합니다", kind: "macro" },
  { name: "SAVE_CONFIG", description: "보정 값을 printer.cfg에 저장하고 다시 시작합니다", kind: "klipper" },
  { name: "SCREWS_TILT_CALCULATE", description: "베드 나사를 얼마나 돌려야 하는지 계산합니다", kind: "klipper" },
  { name: "SDCARD_PRINT_FILE", description: "파일을 출력합니다 (FILENAME=)", kind: "klipper" },
  { name: "SET_GCODE_OFFSET", description: "Z 오프셋 (Z= Z_ADJUST= MOVE=)", kind: "klipper" },
  { name: "SET_HEATER_TEMPERATURE", description: "히터 목표 온도 (HEATER= TARGET=)", kind: "klipper" },
  { name: "SET_PIN", description: "출력 핀 값 (PIN= VALUE=)", kind: "klipper" },
  { name: "SET_PRESSURE_ADVANCE", description: "프레셔 어드밴스 (ADVANCE= SMOOTH_TIME=)", kind: "klipper" },
  { name: "SET_VELOCITY_LIMIT", description: "속도·가속도 한계 (VELOCITY= ACCEL= SQUARE_CORNER_VELOCITY=)", kind: "klipper" },
  { name: "STATUS", description: "Klipper 상태를 보여 줍니다", kind: "klipper" },
  { name: "TURN_OFF_HEATERS", description: "모든 히터를 끕니다", kind: "klipper" },
  ...["BEFORE_LOAD_FILAMENT", "COOLING", "END_PRINT", "LOAD_FILAMENT", "M600", "PREHEAT_PLA", "PREHEAT_TPU", "SET_PAUSE_AT_LAYER", "SET_PAUSE_NEXT_LAYER", "UNLOAD_FILAMENT"].map<CommandDef>((name) => ({
    name,
    description: MACROS.find((macro) => macro.name === name)?.description ?? "",
    kind: "macro",
  })),
];

export const COMMANDS: readonly CommandDef[] = COMMAND_LIST.sort((a, b) => a.name.localeCompare(b.name));

// The services and the host the top bar's power menu can restart.
export const SERVICES = [
  { id: "klipper", label: "Klipper" },
  { id: "moonraker", label: "Moonraker" },
  { id: "crowsnest", label: "Crowsnest (웹캠)" },
  { id: "sonar", label: "Sonar (Wi-Fi 감시)" },
] as const;

export type Notice = { id: string; tone: "info" | "warning" | "error"; title: string; body: string; at: number; to?: string };

export const NOTICES: readonly Notice[] = [
  { id: "update-mainsail", tone: "info", title: "Mainsail v2.19.0을 쓸 수 있습니다", body: "지금은 v2.17.0입니다. 장비 화면의 업데이트 관리자에서 올릴 수 있습니다.", at: Date.parse("2026-11-04T09:12:00+09:00"), to: "/printer/machine" },
  { id: "update-klipper", tone: "warning", title: "Klipper를 업데이트할 수 없습니다", body: "저장소가 기대한 브랜치에 있지 않아 Moonraker가 업데이트를 거부합니다. 216개 커밋 뒤처져 있습니다.", at: Date.parse("2026-11-04T09:12:00+09:00"), to: "/printer/machine" },
  { id: "update-system", tone: "info", title: "시스템 패키지 81개를 올릴 수 있습니다", body: "출력이 끝난 뒤에 업그레이드하세요. 업그레이드 중에는 Klipper가 멈출 수 있습니다.", at: Date.parse("2026-11-03T08:00:00+09:00"), to: "/printer/machine" },
  { id: "update-crowsnest", tone: "info", title: "Crowsnest v4.2.0-1이 나왔습니다", body: "웹캠 서비스의 새 버전입니다. v4.1.17-1을 쓰고 있습니다.", at: Date.parse("2026-11-02T08:00:00+09:00"), to: "/printer/machine" },
  { id: "config-backup", tone: "warning", title: "설정 백업이 22개 쌓였습니다", body: "SAVE_CONFIG가 남긴 printer-날짜.cfg 파일을 정리하면 공간을 아낄 수 있습니다.", at: Date.parse("2026-10-20T08:00:00+09:00"), to: "/printer/machine" },
];
