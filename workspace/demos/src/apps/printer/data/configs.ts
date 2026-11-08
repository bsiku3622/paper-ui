// Text of the config files. The sample data lists only names, sizes and dates, so these are written for the mock:
// an Ender-3 V3 SE with a BLTouch. No addresses, keys or serials.

const PRINTER_CFG = `# Ender-3 V3 SE: Klipper 설정 (모의 데이터)
# 값을 바꾼 뒤에는 Klipper를 다시 시작해야 적용됩니다.

[include mainsail.cfg]

[mcu]
serial: /dev/ttyUSB0
baud: 115200
restart_method: command

[printer]
kinematics: cartesian
max_velocity: 250
max_accel: 2000
minimum_cruise_ratio: 0.5
square_corner_velocity: 5
max_z_velocity: 20
max_z_accel: 100

[stepper_x]
step_pin: PC2
dir_pin: PB9
enable_pin: !PC3
microsteps: 16
rotation_distance: 40
endstop_pin: !PA5
position_min: -6
position_endstop: -6
position_max: 230
homing_speed: 50

[stepper_y]
step_pin: PB8
dir_pin: PB7
enable_pin: !PC3
microsteps: 16
rotation_distance: 40
endstop_pin: !PA6
position_min: -14
position_endstop: -14
position_max: 230
homing_speed: 50

[stepper_z]
step_pin: PB6
dir_pin: !PB5
enable_pin: !PC3
microsteps: 16
rotation_distance: 8
endstop_pin: probe:z_virtual_endstop
position_min: -3
position_max: 250
homing_speed: 8
second_homing_speed: 2

[extruder]
step_pin: PB4
dir_pin: PB3
enable_pin: !PC3
microsteps: 16
rotation_distance: 7.53
nozzle_diameter: 0.400
filament_diameter: 1.750
heater_pin: PA1
sensor_type: EPCOS 100K B57560G104F
sensor_pin: PC5
control: pid
pid_Kp: 22.865
pid_Ki: 1.292
pid_Kd: 101.178
min_temp: 0
max_temp: 270
max_extrude_only_distance: 100
pressure_advance: 0.0
pressure_advance_smooth_time: 0.04

[heater_bed]
heater_pin: PA7
sensor_type: EPCOS 100K B57560G104F
sensor_pin: PC4
control: pid
pid_Kp: 54.027
pid_Ki: 0.770
pid_Kd: 948.182
min_temp: 0
max_temp: 100

[heater_fan hotend_fan]
pin: PC0
heater: extruder
heater_temp: 50.0

[fan]
pin: PA0

[tmc2208 stepper_x]
uart_pin: PB12
run_current: 0.8

[tmc2208 stepper_y]
uart_pin: PB13
run_current: 0.8

[tmc2208 stepper_z]
uart_pin: PB14
run_current: 0.8

[bltouch]
sensor_pin: ^PC14
control_pin: PC13
x_offset: -33.0
y_offset: -2.0
z_offset: 0.0
speed: 10
samples: 2
sample_retract_dist: 3.0

[safe_z_home]
home_xy_position: 148, 117
speed: 80
z_hop: 10
z_hop_speed: 5

[bed_mesh]
speed: 150
horizontal_move_z: 5
mesh_min: 30, 30
mesh_max: 207, 215.5
probe_count: 8, 8
algorithm: bicubic

[screws_tilt_adjust]
screw1: 64, 31
screw1_name: front left
screw2: 224, 31
screw2_name: front right
screw3: 224, 201
screw3_name: rear right
screw4: 64, 201
screw4_name: rear left
horizontal_move_z: 10
speed: 150
screw_thread: CW-M4

[output_pin beeper]
pin: PB0

[idle_timeout]
timeout: 600

[virtual_sdcard]
path: ~/printer_data/gcodes
on_error_gcode: CANCEL_PRINT

[pause_resume]

[display_status]

[gcode_macro PREHEAT_PLA]
description: PLA 온도로 데웁니다
gcode:
    {% set extruder = params.EXTRUDER|default(210)|float %}
    {% set bed = params.BED|default(60)|float %}
    M140 S{bed}
    M104 S{extruder}

[gcode_macro PREHEAT_TPU]
description: TPU 온도로 데웁니다
gcode:
    {% set extruder = params.EXTRUDER|default(230)|float %}
    {% set bed = params.BED|default(50)|float %}
    M140 S{bed}
    M104 S{extruder}

[gcode_macro COOLING]
description: 히터를 끄고 팬을 돌립니다
gcode:
    TURN_OFF_HEATERS
    M106 S255

[gcode_macro END_PRINT]
description: 출력을 마무리합니다
gcode:
    TURN_OFF_HEATERS
    G91
    G1 Z10 F600
    G90
    G1 X10 Y220 F6000
    M84

#*# <---------------------- SAVE_CONFIG ---------------------->
#*# DO NOT EDIT THIS BLOCK OR BELOW. The contents are auto-generated.
#*#
#*# [bltouch]
#*# z_offset = 1.725
#*#
#*# [bed_mesh default]
#*# version = 1
#*# points =
#*# 	  0.387500, 0.397500, 0.402500, 0.360000, 0.402500, 0.427500, 0.450000, 0.447500
#*# 	  0.255000, 0.295000, 0.292500, 0.257500, 0.325000, 0.340000, 0.302500, 0.330000
#*# 	  0.145000, 0.142500, 0.162500, 0.140000, 0.182500, 0.197500, 0.195000, 0.205000
#*# 	  0.040000, 0.042500, 0.060000, 0.035000, 0.085000, 0.092500, 0.075000, 0.095000
#*# 	  -0.087500, -0.065000, -0.042500, -0.085000, -0.042500, -0.025000, -0.032500, -0.005000
#*# 	  -0.165000, -0.125000, -0.127500, -0.172500, -0.112500, -0.127500, -0.137500, -0.112500
#*# 	  -0.250000, -0.217500, -0.220000, -0.237500, -0.212500, -0.207500, -0.207500, -0.157500
#*# 	  -0.300000, -0.272500, -0.252500, -0.307500, -0.245000, -0.220000, -0.245000, -0.195000
#*# x_count = 8
#*# y_count = 8
#*# mesh_x_pps = 2
#*# mesh_y_pps = 2
#*# algo = bicubic
#*# tension = 0.2
#*# min_x = 30.0
#*# max_x = 206.96
#*# min_y = 30.0
#*# max_y = 215.5
`;

const MOONRAKER_CONF = `# Moonraker 설정 (모의 데이터)

[server]
host: 0.0.0.0
port: 7125
klippy_uds_address: ~/printer_data/comms/klippy.sock

[file_manager]
enable_object_processing: True

[authorization]
cors_domains:
    *.local
    *://my.mainsail.xyz
    *://app.fluidd.xyz

[octoprint_compat]

[history]

[announcements]
subscriptions:
    mainsail

[update_manager]
enable_auto_refresh: True

[update_manager mainsail]
type: web
channel: stable
repo: mainsail-crew/mainsail
path: ~/mainsail

[update_manager mainsail-config]
type: git_repo
primary_branch: master
path: ~/mainsail-config
origin: https://github.com/mainsail-crew/mainsail-config.git
managed_services: klipper moonraker

[update_manager crowsnest]
type: git_repo
path: ~/crowsnest
origin: https://github.com/mainsail-crew/crowsnest.git
managed_services: crowsnest
install_script: tools/pkglist.sh
`;

const CROWSNEST_CONF = `# Crowsnest: 웹캠 서비스 설정 (모의 데이터)

[crowsnest]
log_path: ~/printer_data/logs/crowsnest.log
log_level: verbose
delete_log: false
no_proxy: false

[cam 1]
mode: ustreamer
enable_rtsp: false
rtsp_port: 8554
port: 8080
device: /dev/video0
resolution: 640x480
max_fps: 15
`;

const MAINSAIL_CFG = `# mainsail-config: 읽기 전용입니다. 이 파일은 업데이트 관리자가 관리합니다 (모의 데이터).

[virtual_sdcard]
path: ~/printer_data/gcodes
on_error_gcode: CANCEL_PRINT

[pause_resume]

[display_status]

[respond]

[gcode_macro CANCEL_PRINT]
description: 출력을 취소합니다
rename_existing: BASE_CANCEL_PRINT
gcode:
    {% if printer['gcode_macro _CLIENT_VARIABLE']|default({})['custom_park_dz'] is defined %}
    _TOOLHEAD_PARK_PAUSE_CANCEL
    {% endif %}
    TURN_OFF_HEATERS
    M106 S0
    BASE_CANCEL_PRINT

[gcode_macro PAUSE]
description: 출력을 멈춥니다
rename_existing: BASE_PAUSE
gcode:
    {% if printer.pause_resume.is_paused|int == 0 %}
    SET_GCODE_VARIABLE MACRO=RESUME VARIABLE=etemp VALUE={printer['extruder'].target}
    SAVE_GCODE_STATE NAME=PAUSE_state
    BASE_PAUSE
    _TOOLHEAD_PARK_PAUSE_CANCEL
    {% endif %}

[gcode_macro RESUME]
description: 멈춘 출력을 이어서 합니다
rename_existing: BASE_RESUME
gcode:
    {% if printer.pause_resume.is_paused|int == 1 %}
    RESTORE_GCODE_STATE NAME=PAUSE_state MOVE=1
    BASE_RESUME
    {% endif %}
`;

const SONAR_CONF = `# Sonar: Wi-Fi 연결 감시 (모의 데이터)

[sonar]
enable: true
ping_count: 4
ping_interval: 30
restart_threshold: 10
persistent_log: false
`;

const TIMELAPSE_CFG = `# moonraker-timelapse: 읽기 전용입니다 (모의 데이터)

[gcode_macro TIMELAPSE_TAKE_FRAME]
description: 타임랩스 프레임을 찍습니다
gcode:
    {% if printer['gcode_macro TIMELAPSE_TAKE_FRAME'].enable %}
    _TIMELAPSE_NEW_FRAME
    {% endif %}
variable_enable: False
`;

// A backup written by SAVE_CONFIG is the printer.cfg of that day.
const backup = (name: string) => `# ${name}: SAVE_CONFIG가 남긴 백업입니다 (모의 데이터)\n${PRINTER_CFG.replace(/^# Ender-3 V3 SE: Klipper 설정 \(모의 데이터\)\n/, "")}`;

export const configText = (path: string): string => {
  if (path === "printer.cfg") return PRINTER_CFG;
  if (path === "moonraker.conf" || path === ".moonraker.conf.bkp") return MOONRAKER_CONF;
  if (path === "crowsnest.conf") return CROWSNEST_CONF;
  if (path === "mainsail.cfg") return MAINSAIL_CFG;
  if (path === "sonar.conf") return SONAR_CONF;
  if (path === "timelapse.cfg") return TIMELAPSE_CFG;
  return backup(path);
};

export const logText = (service: "klippy" | "moonraker" | "crowsnest") =>
  [
    `===== ${service}.log (모의 데이터) =====`,
    "Start printer at Tue Nov  3 06:04:11 2026 (336650.3 25.1)",
    "Loaded MCU 'mcu' config: MCU_CLOCK=72000000 (stm32f103xe)",
    "Stats 336650.3: gcodein=0 mcu: mcu_awake=0.001 mcu_task_avg=0.000013",
    "Stats 336651.3: gcodein=0 mcu: mcu_awake=0.001 heater_bed: target=60 temp=60.0 pwm=0.140 extruder: target=210 temp=209.8 pwm=0.532",
  ].join("\n");
