#include "raylib.h"
#include "raymath.h"
#include "simulation.hpp"
#include <algorithm>
#include <array>
#include <cmath>
#include <string>
#include <vector>

// Independent native prototype. No proprietary GunZ assets or source are bundled.
namespace {
using gunz::sim::Aabb2;
using gunz::sim::MotionTuning;
using gunz::sim::PlayerMotion;
using gunz::sim::Vec2;

struct Settings {
    float runSpeed=8.0f, acceleration=30.0f, friction=24.0f;
    float jumpImpulse=8.8f, gravity=24.0f, dashImpulse=16.0f;
    float gunDamage=20.0f, fireCooldown=0.18f, swordDamage=38.0f, swordRange=2.4f;
    float botSpeed=2.5f;
    bool godMode=false, pauseAI=false, hitboxes=false, debug=true;
};
struct Player {
    PlayerMotion motion{{0.0f,5.0f},{0.0f,0.0f},true,false,0.0f,0.0f};
    float y=0.0f, vy=0.0f, yaw=0.0f, hp=100.0f, ap=100.0f;
};
struct Bot { Vector3 pos{}; float hp=100.0f, attackTimer=0.0f; bool alive=true; };
struct Shot { Vector3 pos{}, vel{}; float life=1.25f; };

Settings cfg;
Player player;
std::vector<Bot> bots;
std::vector<Shot> shots;
int kills=0;
float shotTimer=0.0f, meleeTimer=0.0f;
std::string eventText="Ready";
constexpr float kPlayerRadius=0.36f;
const std::array<Aabb2,6> kObstacles{{
    {-12,-8,-8,-4}, {8,-13,12,-9}, {-15,8,-11,14},
    {10,8,15,11}, {-3,1,-1,7}, {4,-1,6,5}
}};
MotionTuning MotionConfig() {
    return {cfg.runSpeed,cfg.acceleration,cfg.friction,cfg.dashImpulse,0.18f,0.65f,5.0f};
}
Vector3 Forward() { return {std::sinf(player.yaw),0.0f,std::cosf(player.yaw)}; }
Vector3 Right() { return {std::cosf(player.yaw),0.0f,-std::sinf(player.yaw)}; }
void Log(const char* text) { eventText=text; }
void ResetPlayer() {
    player=Player{};
    shots.clear();
    shotTimer=meleeTimer=0.0f;
    Log("Player reset");
}
void ResetBots() {
    bots.clear();
    for(int i=0;i<6;i++) {
        const float a=static_cast<float>(i)/6.0f*2.0f*PI;
        bots.push_back({{std::cosf(a)*13.0f,0.0f,std::sinf(a)*13.0f},100.0f,0.0f,true});
    }
    kills=0;
    Log("Bots respawned");
}
void DamagePlayer(float amount) {
    if(cfg.godMode || amount<=0.0f) return;
    const float absorbed=std::min(player.ap,amount);
    player.ap-=absorbed;
    player.hp=std::max(0.0f,player.hp-(amount-absorbed));
}
void DamageBot(Bot& bot,float amount) {
    if(!bot.alive || amount<=0.0f) return;
    bot.hp=std::max(0.0f,bot.hp-amount);
    if(bot.hp<=0.0f) { bot.alive=false; ++kills; Log("Bot eliminated"); }
}
void Fire() {
    if(shotTimer>0.0f) return;
    shotTimer=cfg.fireCooldown;
    const Vector3 start=Vector3Add({player.motion.position.x,player.y+1.15f,player.motion.position.z},Vector3Scale(Forward(),0.8f));
    shots.push_back({start,Vector3Scale(Forward(),34.0f),1.2f});
    Log("Shot fired");
}
void Melee() {
    if(meleeTimer>0.0f) return;
    meleeTimer=0.42f;
    const Vector3 origin={player.motion.position.x,player.y,player.motion.position.z};
    int hits=0;
    for(auto& bot:bots) {
        if(!bot.alive) continue;
        const Vector3 d=Vector3Subtract(bot.pos,origin);
        const float len=Vector3Length(d);
        if(len>0.001f && len<=cfg.swordRange &&
           Vector3DotProduct(Vector3Scale(d,1.0f/len),Forward())>0.15f) {
            DamageBot(bot,cfg.swordDamage); ++hits;
        }
    }
    Log(hits ? "Sword hit" : "Sword swing");
}
void DrawArena() {
    DrawPlane({0,-0.12f,0},{60,60},Color{24,34,45,255});
    for(int i=-30;i<=30;i+=2) {
        DrawLine3D({static_cast<float>(i),0,-30},{static_cast<float>(i),0,30},Color{42,59,72,255});
        DrawLine3D({-30,0,static_cast<float>(i)},{30,0,static_cast<float>(i)},Color{42,59,72,255});
    }
    const std::array<BoundingBox,10> boxes{{
        {{-24,0,-24},{24,3,-23}},{{-24,0,23},{24,3,24}},{{-24,0,-23},{-23,3,23}},{{23,0,-23},{24,3,23}},
        {{-12,0,-8},{-8,3,-4}},{{8,0,-13},{12,4,-9}},{{-15,0,8},{-11,2,14}},
        {{10,0,8},{15,3,11}},{{-3,0,1},{-1,2,7}},{{4,0,-1},{6,2,5}}
    }};
    for(const auto& b:boxes) {
        const Vector3 size=Vector3Subtract(b.max,b.min);
        const Vector3 center=Vector3Scale(Vector3Add(b.min,b.max),0.5f);
        DrawCubeV(center,size,Color{54,75,89,255});
        DrawCubeWiresV(center,size,Color{87,122,139,255});
    }
}
void UpdateGame(float dt) {
    shotTimer=std::max(0.0f,shotTimer-dt);
    meleeTimer=std::max(0.0f,meleeTimer-dt);
    if(IsKeyPressed(KEY_F1)) { cfg.debug=!cfg.debug; if(cfg.debug) EnableCursor(); else DisableCursor(); }
    if(IsKeyPressed(KEY_F2)) cfg.hitboxes=!cfg.hitboxes;
    if(IsKeyPressed(KEY_G)) cfg.godMode=!cfg.godMode;
    if(IsKeyPressed(KEY_P)) cfg.pauseAI=!cfg.pauseAI;
    if(IsKeyPressed(KEY_B)) ResetBots();
    if(IsKeyPressed(KEY_H)) { player.hp=100.0f; player.ap=100.0f; Log("Player healed"); }
    if(IsKeyPressed(KEY_R)) { ResetPlayer(); ResetBots(); }
    if(IsKeyPressed(KEY_E)) Melee();
    if(IsMouseButtonDown(MOUSE_BUTTON_RIGHT) && (!cfg.debug || GetMouseX()<GetScreenWidth()-340))
        player.yaw += GetMouseDelta().x*0.003f;
    if(IsMouseButtonDown(MOUSE_BUTTON_LEFT) && (!cfg.debug || GetMouseX()<GetScreenWidth()-340)) Fire();

    Vec2 input{};
    const Vector3 f=Forward(), r=Right();
    if(IsKeyDown(KEY_W)) { input.x+=f.x; input.z+=f.z; }
    if(IsKeyDown(KEY_S)) { input.x-=f.x; input.z-=f.z; }
    if(IsKeyDown(KEY_D)) { input.x+=r.x; input.z+=r.z; }
    if(IsKeyDown(KEY_A)) { input.x-=r.x; input.z-=r.z; }
    if(IsKeyPressed(KEY_LEFT_SHIFT)) {
        Vec2 direction=input;
        if(gunz::sim::Length(direction)<0.001f) direction={f.x,f.z};
        if(gunz::sim::TryDash(player.motion,direction,MotionConfig())) Log("Dash");
    }
    gunz::sim::MoveAndCollide(player.motion,input,dt,MotionConfig(),kObstacles.data(),kObstacles.size(),kPlayerRadius);
    if(IsKeyPressed(KEY_SPACE) && player.y<=0.0f) player.vy=cfg.jumpImpulse;
    player.vy-=cfg.gravity*dt;
    player.y+=player.vy*dt;
    if(player.y<=0.0f) { player.y=0.0f; player.vy=0.0f; player.motion.grounded=true; }
    else player.motion.grounded=false;

    for(auto& shot:shots) {
        shot.pos=Vector3Add(shot.pos,Vector3Scale(shot.vel,dt));
        shot.life-=dt;
        for(auto& bot:bots) if(bot.alive && Vector3Distance(shot.pos,Vector3Add(bot.pos,{0,1.0f,0}))<0.75f) {
            DamageBot(bot,cfg.gunDamage); shot.life=0.0f; break;
        }
    }
    shots.erase(std::remove_if(shots.begin(),shots.end(),[](const Shot& s){return s.life<=0.0f;}),shots.end());
    if(!cfg.pauseAI) for(auto& bot:bots) {
        if(!bot.alive) continue;
        Vector3 delta=Vector3Subtract({player.motion.position.x,player.y,player.motion.position.z},bot.pos);
        const float distance=Vector3Length(delta);
        if(distance>2.0f) {
            delta.y=0.0f;
            const float planar=Vector3Length(delta);
            if(planar>0.001f) bot.pos=Vector3Add(bot.pos,Vector3Scale(Vector3Normalize(delta),cfg.botSpeed*dt));
        } else {
            bot.attackTimer-=dt;
            if(bot.attackTimer<=0.0f) { bot.attackTimer=1.0f; DamagePlayer(10.0f); }
        }
    }
    if(player.hp<=0.0f) { ResetPlayer(); Log("Player respawned"); }
}
void DrawPanel() {
    if(!cfg.debug) return;
    const int x=GetScreenWidth()-334;
    DrawRectangle(x,14,320,GetScreenHeight()-28,Color{7,13,20,235});
    DrawRectangleLines(x,14,320,GetScreenHeight()-28,Color{52,86,104,255});
    DrawText("GUNZ NATIVE LAB / DEBUG",x+14,27,15,Color{85,230,222,255});
    DrawText("WASD move  SPACE jump  SHIFT dash",x+14,53,11,LIGHTGRAY);
    DrawText("RMB look  LMB fire  E sword",x+14,70,11,LIGHTGRAY);
    DrawText(TextFormat("Move %.1f  Accel %.1f",cfg.runSpeed,cfg.acceleration),x+14,96,13,WHITE);
    DrawText(TextFormat("Friction %.1f  Dash %.1f",cfg.friction,cfg.dashImpulse),x+14,116,13,WHITE);
    DrawText(TextFormat("Bots alive %d   Kills %d",static_cast<int>(std::count_if(bots.begin(),bots.end(),[](const Bot& b){return b.alive;})),kills),x+14,142,13,WHITE);
    DrawText(TextFormat("HP %.0f  AP %.0f",player.hp,player.ap),x+14,164,14,WHITE);
    DrawText(cfg.godMode?"GOD MODE: ON":"GOD MODE: OFF",x+14,188,12,Color{255,191,112,255});
    DrawText(cfg.pauseAI?"BOT AI: PAUSED":"BOT AI: ACTIVE",x+14,208,12,Color{150,200,220,255});
    DrawText("F1 panel  F2 hitboxes  G god  P pause",x+14,238,11,LIGHTGRAY);
    DrawText("B bots  H heal  R reset",x+14,255,11,LIGHTGRAY);
    DrawText("Event:",x+14,288,11,Color{130,158,177,255});
    DrawText(eventText.c_str(),x+14,305,12,Color{255,191,112,255});
}
}

int main() {
    SetConfigFlags(FLAG_MSAA_4X_HINT|FLAG_VSYNC_HINT);
    InitWindow(1440,900,"GunZ Native Lab — C++ local sandbox");
    SetTargetFPS(144);
    EnableCursor();
    ResetBots();
    Camera3D camera{};
    camera.up={0,1,0}; camera.fovy=65; camera.projection=CAMERA_PERSPECTIVE;
    camera.position={0,player.y+4.6f,player.motion.position.z+7.0f};
    camera.target={player.motion.position.x,player.y+2.6f,player.motion.position.z};
    while(!WindowShouldClose()) {
        const float dt=std::min(GetFrameTime(),0.04f);
        UpdateGame(dt);
        const Vector3 playerPos={player.motion.position.x,player.y,player.motion.position.z};
        const Vector3 target=Vector3Add(playerPos,{0,2.6f,0});
        const Vector3 cameraOffset={-std::sinf(player.yaw)*7.0f,4.6f,std::cosf(player.yaw)*7.0f};
        camera.position=Vector3Lerp(camera.position,Vector3Add(playerPos,cameraOffset),std::clamp(dt*8.0f,0.0f,1.0f));
        camera.target=Vector3Lerp(camera.target,target,std::clamp(dt*10.0f,0.0f,1.0f));

        BeginDrawing();
        ClearBackground(Color{10,17,25,255});
        BeginMode3D(camera);
        DrawArena();
        DrawCapsule({playerPos.x,playerPos.y+0.35f,playerPos.z},{playerPos.x,playerPos.y+1.45f,playerPos.z},0.36f,6,8,Color{55,214,205,255});
        DrawSphere({playerPos.x,playerPos.y+1.68f,playerPos.z},0.22f,Color{179,255,248,255});
        DrawLine3D({playerPos.x,playerPos.y+1.2f,playerPos.z},Vector3Add({playerPos.x,playerPos.y+1.2f,playerPos.z},Vector3Scale(Forward(),1.25f)),Color{180,255,248,255});
        if(cfg.hitboxes) DrawSphereWires({playerPos.x,playerPos.y+0.9f,playerPos.z},0.48f,8,8,YELLOW);
        for(const auto& bot:bots) if(bot.alive) {
            DrawCapsule({bot.pos.x,bot.pos.y+0.3f,bot.pos.z},{bot.pos.x,bot.pos.y+1.4f,bot.pos.z},0.34f,6,8,Color{210,95,84,255});
            DrawSphere({bot.pos.x,bot.pos.y+1.6f,bot.pos.z},0.2f,Color{255,205,174,255});
            if(cfg.hitboxes) DrawSphereWires({bot.pos.x,bot.pos.y+0.9f,bot.pos.z},0.48f,8,8,YELLOW);
        }
        for(const auto& shot:shots) DrawSphere(shot.pos,0.09f,Color{104,255,240,255});
        EndMode3D();
        DrawRectangle(14,14,235,144,Color{7,13,20,220});
        DrawText("NATIVE LOCAL MATCH",26,25,13,Color{85,230,222,255});
        DrawText(TextFormat("HP %03.0f",player.hp),26,49,18,WHITE);
        DrawRectangle(26,73,180,6,Color{38,52,65,255});
        DrawRectangle(26,73,180*player.hp/100.0f,6,Color{85,230,222,255});
        DrawText(TextFormat("AP %03.0f",player.ap),26,87,14,Color{255,191,112,255});
        DrawText(TextFormat("FPS %d",GetFPS()),26,108,11,Color{143,167,184,255});
        DrawText(player.motion.dashing?"STATE DASH":(player.y>0.0f?"STATE AIR":(gunz::sim::Length(player.motion.velocity)>0.4f?"STATE RUN":"STATE IDLE")),26,130,11,Color{143,220,214,255});
        DrawText("GUNZ NATIVE LAB",GetScreenWidth()/2-80,18,14,Color{85,230,222,255});
        DrawPanel();
        EndDrawing();
    }
    CloseWindow();
    return 0;
}
