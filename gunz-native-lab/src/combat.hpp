#pragma once
#include <algorithm>
namespace gunz::combat {
struct HealthArmor {
 float hp{100.0f}; float ap{100.0f};
 // Returns the amount of damage that actually reduced HP.
 float ApplyDamage(float damage,bool invulnerable=false) {
  if(invulnerable||damage<=0.0f)return 0.0f;
  const float absorbed=std::min(ap,damage); ap-=absorbed;
  const float hpDamage=damage-absorbed;
  const float actualHpDamage=std::min(hp,hpDamage);
  hp=std::max(0.0f,hp-hpDamage);
  return actualHpDamage;
 }
 bool IsDead() const{return hp<=0.0f;}
 void Refill(){hp=100.0f;ap=100.0f;}
};
}