# GunZ Native Lab (C++)

Independent native C++20 gameplay sandbox. It is **not yet an exact GunZ clone**, does not redistribute proprietary assets, and does not claim original-physics parity. It includes a greybox arena, third-person camera, movement/jump/dash, simple shooting and sword combat, bots, HP/AP, and developer controls.

## Build the app (Windows / Visual Studio / CMake)
Requires Git, CMake 3.20+, Visual Studio 2022 with Desktop development with C++. The first configuration downloads raylib 5.5.

```powershell
cmake -S . -B build
cmake --build build --config Release
.\build\Release\gunz_native_lab.exe
```

## Test the simulation without raylib
The pure movement/collision logic is in `src/simulation.hpp`. It can be compiled independently:

```powershell
cl /std:c++20 /EHsc /W4 /Isrc src\simulation_tests.cpp /Fe:simulation_tests.exe
.\simulation_tests.exe
```

Or with GCC/Clang:

```bash
g++ -std=c++20 -Wall -Wextra -Wpedantic -Isrc src/simulation_tests.cpp -o simulation_tests
./simulation_tests
```

The unit tests passed in the current environment. The complete raylib game build is not verified because GitHub DNS resolution failed while CMake attempted to fetch raylib.

## Controls
WASD move · Space jump · Left Shift dash · Right mouse camera · Left mouse fire · E sword · F1 dev panel · F2 hitboxes · G god mode · P pause AI · B respawn bots · H heal · R reset.

## Research and limitations
See `RESEARCH_NOTES.md` for source comparison and roadmap. Reference paths consulted include `Gunz/ZCharacter.*`, `Gunz/ZCamera.cpp`, `Gunz/ZCombatInterface.cpp`, `Gunz/ZApplication.cpp` and `CSCommon/Source/MMatchRuleDeathMatch.cpp` in `open-gunz/ref-gunz1.5`. The `LostMyCode/three-gunz` project is a separate Three.js/WebAssembly-oriented experiment, not the native C++ reference.

Ghidra/REA and original executable analysis have **not** been run. The prototype remains a simplified independent implementation.
