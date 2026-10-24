# Source comparison and implementation roadmap — 2026-10-25

## Scope and confidence
Comparison of selected source files in `open-gunz/ref-gunz1.5` with the independent prototype. This is not binary reverse engineering: Ghidra/REA was not run, no original executable was analyzed, and behavioral equivalence has not been demonstrated.

Reference files:
- [ZCharacter.h](https://github.com/open-gunz/ref-gunz1.5/blob/main/Gunz/ZCharacter.h)
- [ZCharacter.cpp](https://github.com/open-gunz/ref-gunz1.5/blob/main/Gunz/ZCharacter.cpp)
- [ZCamera.cpp](https://github.com/open-gunz/ref-gunz1.5/blob/main/Gunz/ZCamera.cpp)
- [ZCombatInterface.cpp](https://github.com/open-gunz/ref-gunz1.5/blob/main/Gunz/ZCombatInterface.cpp)
- [MMatchRuleDeathMatch.cpp](https://github.com/open-gunz/ref-gunz1.5/blob/main/CSCommon/Source/MMatchRuleDeathMatch.cpp)
- [ZApplication.cpp](https://github.com/open-gunz/ref-gunz1.5/blob/main/Gunz/ZApplication.cpp)
- [LostMyCode/three-gunz](https://github.com/LostMyCode/three-gunz) (separate browser/Three.js-oriented experiment)

## Comparison
| System | Reference source | Prototype | Gap |
|---|---|---|---|
| Movement | ZCharacter.h defines RUN_SPEED, BACK_SPEED, ACCEL_SPEED, STOP_SPEED, STOP_FORMAX_SPEED, character radius and height. | Acceleration/friction, dash and axis-separated collision against greybox obstacles. | Directional speeds, wall-running/jumping, tumble, knockback, authoritative movement, and measured parity are missing. |
| Animation/state | ZCharacter.cpp lists idle variants, directional runs, jump up/down, tumbles, wall jumps, melee chain/recovery, guards, blast/damage and taunts, with cancel/loop/movement metadata. | Small locomotion enum and action telemetry; no skeletal model or animation playback. | Need data-driven transitions, separate upper/lower body state, event windows, cancellation rules, and animation assets with provenance. |
| Camera | ZCamera.cpp tracks target, direction, observer/history, target/current angles and distance, recoil, and smoothing constants. | Third-person following with interpolated position/target and yaw. | Pitch/orbit, collision avoidance, recoil and observer/free-look are missing. |
| Combat | ZCombatInterface.cpp integrates combat UI, action definitions, weapon/screen effects; character code includes melee and guard states. | Projectile fire, simple melee cone, cooldowns and bots. | Weapon inventory/ammo/reload, animation-timed hit registration, combos, guard/parry, hit reactions and HUD details missing. |
| HP/AP | Dedicated modules such as ZModule_HPAP.h are included by ZCharacter.h. | Local HP/AP; damage is applied AP-first. | Need explicit damage types, testable component and future replication semantics. |
| Match | MMatchRuleDeathMatch.cpp handles alive counts, teams, round finish, scoring and timeouts. | One local player, bots and kill count. | Teams, round lifecycle, match-end conditions and network authority missing. |
| App/runtime | ZApplication.cpp manages launch modes, locale, asset managers, audio, replay and initialization. | Small C++20 raylib app. | Needs modular input/simulation/camera/combat/assets/tests architecture and a license audit. |
| Rendering/assets | Source uses RealSpace2, visual meshes, animation managers, BSP/collision systems and effects. | Procedural greybox. | No original resource pipeline/assets integrated; verify license and provenance first. |

## Implemented this pass
- Extracted deterministic movement math into `src/simulation.hpp`, independent of raylib.
- Added axis-by-axis collision resolution and wall sliding against greybox AABBs.
- Added `src/simulation_tests.cpp` for acceleration, friction, dash cooldown, obstacle collision, bounds and scalar helpers.
- Integrated the pure movement component in the game loop.
- Added smoothed camera follow and action-state telemetry.
- Added shared HP/AP damage semantics in `src/combat.hpp` and integrated them into bot attacks. The component reports actual HP loss, clamps HP to zero, supports refill and invulnerability.

## Test evidence and limitations
- Passed: `g++ -std=c++20 -Wall -Wextra -Wpedantic -Isrc src/simulation_tests.cpp -o simulation_tests && ./simulation_tests` (output: `simulation/combat tests passed`).
- Passed: C++ syntax-only check of the raylib app and tests using temporary declaration-only raylib headers; this is not a linked or runtime test.
- Full app CMake configuration failed because the environment could not resolve `github.com` to fetch raylib 5.5. Therefore no linked game executable or runtime gameplay is verified.
- The connected repositories are `testcard` (Localia), `automation-test` (Vinted Companion), and `test-factures` (Pétale flower delivery). None is a dedicated GunZ repository. A draft PR was opened in `automation-test` with all project files isolated under `gunz-native-lab/`; its existing root files were left unchanged. This was a pragmatic scoped snapshot, not the ideal final repository structure.
- No Ghidra/REA run; no original binary analysis; no license/provenance audit.

## Roadmap
1. Get reproducible Windows/MSVC and Linux/Clang builds.
2. Extend pure tests to damage/armor, movement integration and match scoring.
3. Study source paths for action states, movement, camera and weapon registration.
4. Build data-driven locomotion and upper-body action state machines.
5. Add collision-aware camera, weapon definitions, ammo/reload and animation-timed hit windows.
6. Add local match rules before considering networking.
7. Audit code/assets provenance and licenses before redistribution.
