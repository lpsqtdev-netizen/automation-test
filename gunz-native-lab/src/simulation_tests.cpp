#include "simulation.hpp"
#include "combat.hpp"
#include <cassert>
#include <cmath>
#include <iostream>
using namespace gunz::sim;
static bool Near(float a,float b,float eps=1e-4f){return std::abs(a-b)<eps;}
int main(){
 PlayerMotion p{}; MotionTuning t{}; Aabb2 wall{5.0f,-2.0f,6.0f,2.0f};
 MoveAndCollide(p,{1,0},0.1f,t,&wall,1); assert(p.velocity.x>0 && p.position.x>0);
 float before=p.velocity.x; MoveAndCollide(p,{0,0},0.1f,t,&wall,1); assert(p.velocity.x<before);
 p=PlayerMotion{}; assert(TryDash(p,{1,0},t)); assert(p.dashing&&p.dashCooldown>0&&p.velocity.x>t.runSpeed); assert(!TryDash(p,{1,0},t));
 p=PlayerMotion{}; p.position={4.0f,-1.5f}; p.velocity={10.0f,10.0f}; MoveAndCollide(p,{1,1},0.2f,t,&wall,1);
 assert(p.position.x<=wall.minX); assert(p.position.z>-1.5f);
 assert(IsBlocked({22.0f,0.0f},.36f,nullptr,0)); assert(!IsBlocked({0.0f,0.0f},.36f,nullptr,0));
 assert(Near(Approach(0,2,.5f),.5f)); assert(Near(TowardZero(-.25f,.1f),-.15f));
 gunz::combat::HealthArmor health{80.0f,15.0f};
 assert(Near(health.ApplyDamage(10.0f),0.0f)); assert(Near(health.hp,80.0f)&&Near(health.ap,5.0f));
 assert(Near(health.ApplyDamage(20.0f),15.0f)); assert(Near(health.hp,65.0f)&&Near(health.ap,0.0f));
 assert(Near(health.ApplyDamage(1000.0f),65.0f)); assert(health.IsDead()&&Near(health.hp,0.0f));
 health.Refill(); assert(Near(health.hp,100.0f)&&Near(health.ap,100.0f));
 health.ApplyDamage(40.0f,true); assert(Near(health.hp,100.0f)&&Near(health.ap,100.0f));
 std::cout<<"simulation/combat tests passed\n"; return 0;
}