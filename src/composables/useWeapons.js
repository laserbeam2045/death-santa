import { ref, reactive, computed } from 'vue'
import { WEAPON_TYPES } from '../constants/gameConfig.js'

// Max weapon level
const MAX_LEVEL = 50

// Weapon level bonuses per level (small increments for 50 levels)
const LEVEL_BONUSES = {
  damage: 0.04,       // +4% per level (total +196% at max)
  fireRate: 0.012,    // -1.2% cooldown per level (total -58.8% at max)
  bulletSpeed: 0.015, // +1.5% per level (total +73.5% at max)
}

export function useWeapons() {
  const currentWeaponId = ref('candyCane')
  const bullets = reactive([])
  const lastShotTime = ref(0)

  // Weapon levels (1-20 for each weapon)
  const weaponLevels = reactive({
    candyCane: 1,
    tripleShot: 1,
    spiritBell: 1,
    holyFire: 1,
    dualCane: 1,
    snowStorm: 1
  })

  const currentWeapon = computed(() => {
    const base = WEAPON_TYPES[currentWeaponId.value]
    const level = weaponLevels[currentWeaponId.value] || 1
    return getWeaponWithLevel(base, level)
  })

  function getWeaponWithLevel(baseWeapon, level) {
    if (!baseWeapon) return null

    const damageMultiplier = 1 + (level - 1) * LEVEL_BONUSES.damage
    const fireRateMultiplier = 1 - (level - 1) * LEVEL_BONUSES.fireRate
    const speedMultiplier = 1 + (level - 1) * LEVEL_BONUSES.bulletSpeed

    // Extra bullets at level 10, 20, 30, 40, 50
    let extraBullets = 0
    if (level >= 10) extraBullets += 1
    if (level >= 20) extraBullets += 1
    if (level >= 30) extraBullets += 1
    if (level >= 40) extraBullets += 1
    if (level >= 50) extraBullets += 1

    return {
      ...baseWeapon,
      level,
      damage: baseWeapon.damage * damageMultiplier,
      fireRate: Math.max(50, baseWeapon.fireRate * fireRateMultiplier),
      bulletSpeed: baseWeapon.bulletSpeed * speedMultiplier,
      bulletCount: baseWeapon.bulletCount + extraBullets
    }
  }

  function getWeaponInfo(weaponId) {
    const base = WEAPON_TYPES[weaponId]
    const level = weaponLevels[weaponId] || 1
    return getWeaponWithLevel(base, level)
  }

  function getUnlockedWeapons(playerLevel) {
    return Object.values(WEAPON_TYPES)
      .filter(w => w.unlockLevel <= playerLevel)
      .map(w => ({
        ...getWeaponWithLevel(w, weaponLevels[w.id] || 1),
        maxLevel: MAX_LEVEL,
        canUpgrade: (weaponLevels[w.id] || 1) < MAX_LEVEL
      }))
  }

  function upgradeWeapon(weaponId) {
    if (weaponLevels[weaponId] < MAX_LEVEL) {
      weaponLevels[weaponId]++
      return true
    }
    return false
  }

  function getWeaponLevel(weaponId) {
    return weaponLevels[weaponId] || 1
  }

  function selectWeapon(weaponId) {
    if (WEAPON_TYPES[weaponId]) {
      currentWeaponId.value = weaponId
    }
  }

  function shoot(x, y, angle, damageMultiplier = 1) {
    const now = Date.now()
    const weapon = currentWeapon.value

    if (now - lastShotTime.value < weapon.fireRate) {
      return false
    }

    lastShotTime.value = now
    const count = weapon.bulletCount

    for (let i = 0; i < count; i++) {
      let bulletAngle = angle

      if (count > 1) {
        if (weapon.spread === Math.PI * 2) {
          // Full circle spread
          bulletAngle = (Math.PI * 2 * i) / count
        } else {
          // Cone spread
          const spreadOffset = weapon.spread * ((i / (count - 1)) - 0.5)
          bulletAngle = angle + spreadOffset
        }
      }

      bullets.push({
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        vx: Math.cos(bulletAngle) * weapon.bulletSpeed,
        vy: Math.sin(bulletAngle) * weapon.bulletSpeed,
        damage: weapon.damage * damageMultiplier,
        color: weapon.color,
        piercing: weapon.piercing || false,
        hitEnemies: []
      })
    }

    return true
  }

  function updateBullets(gameWidth, gameHeight) {
    const margin = 50
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      bullet.x += bullet.vx
      bullet.y += bullet.vy

      if (
        bullet.x < -margin ||
        bullet.x > gameWidth + margin ||
        bullet.y < -margin ||
        bullet.y > gameHeight + margin
      ) {
        bullets.splice(i, 1)
      }
    }
  }

  function removeBullet(index) {
    bullets.splice(index, 1)
  }

  function clearBullets() {
    bullets.splice(0, bullets.length)
  }

  function reset() {
    currentWeaponId.value = 'candyCane'
    clearBullets()
    lastShotTime.value = 0
    // Reset all weapon levels
    Object.keys(weaponLevels).forEach(key => {
      weaponLevels[key] = 1
    })
  }

  return {
    currentWeaponId,
    currentWeapon,
    bullets,
    weaponLevels,
    getWeaponInfo,
    getUnlockedWeapons,
    upgradeWeapon,
    getWeaponLevel,
    selectWeapon,
    shoot,
    updateBullets,
    removeBullet,
    clearBullets,
    reset
  }
}
