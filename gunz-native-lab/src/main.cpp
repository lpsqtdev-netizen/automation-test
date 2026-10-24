// Native raylib application prototype. Full source snapshot is attached as a zip in the conversation.
// This file is the native C++ entry point for the repository branch. It provides a dependency-free
// startup diagnostic until the complete raylib renderer in the downloadable archive is merged.
#include "simulation.hpp"
#include <iostream>
int main() {
    gunz::sim::PlayerMotion player{};
    gunz::sim::MotionTuning tuning{};
    const bool dashStarted = gunz::sim::TryDash(player, {1.0f, 0.0f}, tuning);
    std::cout << "GunZ Native Lab: C++20 simulation core ready; dash=" << (dashStarted ? "ready" : "unavailable") << '\n';
    return dashStarted ? 0 : 1;
}