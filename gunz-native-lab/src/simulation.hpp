#pragma once
#include <algorithm>
#include <cmath>
#include <cstddef>
namespace gunz::sim {
struct Vec2 { float x{}; float z{}; };
struct PlayerMotion { Vec2 position{}; Vec2 velocity{}; bool grounded{true}; bool dashing{false}; float dashCooldown{}; float dashTime{}; };
struct MotionTuning { float runSpeed{8.0f}; float acceleration{30.0f}; float friction{24.0f}; float dashImpulse{16.0f}; float dashDuration{0.18f}; float dashCooldown{0.65f}; float dashDrag{5.0f}; };
struct Aabb2 { float minX{},minZ{},maxX{},maxZ{}; };
inline float Length(Vec2 v){return std::sqrt(v.x*v.x+v.z*v.z);}
inline Vec2 Normalize(Vec2 v){const float len=Length(v);return len>1e-5f?Vec2{v.x/len,v.z/len}:Vec2{};}
inline float Approach(float current,float target,float maxDelta){return current+std::clamp(target-current,-maxDelta,maxDelta);}
inline float TowardZero(float value,float delta){return std::abs(value)<=delta?0.0f:value-std::copysign(delta,value);}
inline bool IntersectsCircleAabb(Vec2 p,float radius,const Aabb2& b){const float nx=std::clamp(p.x,b.minX,b.maxX),nz=std::clamp(p.z,b.minZ,b.maxZ);const float dx=p.x-nx,dz=p.z-nz;return dx*dx+dz*dz<radius*radius;}
inline bool IsBlocked(Vec2 p,float radius,const Aabb2* obstacles,std::size_t count,float arenaMin=-22.0f,float arenaMax=22.0f){
 if(p.x<arenaMin+radius||p.x>arenaMax-radius||p.z<arenaMin+radius||p.z>arenaMax-radius)return true;
 for(std::size_t i=0;i<count;++i){if(IntersectsCircleAabb(p,radius,obstacles[i]))return true;} return false;
}
inline void MoveAndCollide(PlayerMotion& p,Vec2 input,float dt,const MotionTuning& t,const Aabb2* obstacles,std::size_t count,float radius=.36f){
 input=Normalize(input); p.dashCooldown=std::max(0.0f,p.dashCooldown-dt); p.dashTime=std::max(0.0f,p.dashTime-dt); p.dashing=p.dashTime>0;
 if(!p.dashing){const Vec2 desired{input.x*t.runSpeed,input.z*t.runSpeed};const float response=Length(input)>1e-5f?t.acceleration:t.friction;p.velocity.x=Approach(p.velocity.x,desired.x,response*dt);p.velocity.z=Approach(p.velocity.z,desired.z,response*dt);}
 else {p.velocity.x=TowardZero(p.velocity.x,t.dashDrag*dt);p.velocity.z=TowardZero(p.velocity.z,t.dashDrag*dt);}
 const Vec2 x{p.position.x+p.velocity.x*dt,p.position.z};if(!IsBlocked(x,radius,obstacles,count))p.position.x=x.x;else p.velocity.x=0;
 const Vec2 z{p.position.x,p.position.z+p.velocity.z*dt};if(!IsBlocked(z,radius,obstacles,count))p.position.z=z.z;else p.velocity.z=0;
}
inline bool TryDash(PlayerMotion& p,Vec2 direction,const MotionTuning& t){
 if(p.dashCooldown>0)return false;direction=Normalize(direction);if(Length(direction)<1e-5f)return false;
 p.velocity.x+=direction.x*t.dashImpulse;p.velocity.z+=direction.z*t.dashImpulse;p.dashTime=t.dashDuration;p.dashCooldown=t.dashCooldown;p.dashing=true;return true;
}
}