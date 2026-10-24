# GunZ Native Lab — native C++ prototype

This repository branch isolates the native prototype and pure C++ movement tests. The prototype is independent code and does not include original GunZ proprietary assets or copied source. A working raylib arena entry point is present in `src/main.cpp`; the source archive in the conversation contains the latest fuller development version.

- Native entry point: `src/main.cpp` (raylib 5.5; requires online CMake FetchContent on first configure).
- Pure simulation and collision: `src/simulation.hpp`.
- Unit tests: `src/simulation_tests.cpp`.
- Source comparison and roadmap: `RESEARCH_NOTES.md`.

The movement unit tests can be run without raylib:

```bash
g++ -std=c++20 -Wall -Wextra -Wpedantic -Isrc src/simulation_tests.cpp -o simulation_tests
./simulation_tests
```

Confirmed in this environment: tests pass with GCC. Full app build has not been verified because this environment cannot resolve github.com to download raylib. Ghidra was not run; no binary reverse-engineering claim is made.