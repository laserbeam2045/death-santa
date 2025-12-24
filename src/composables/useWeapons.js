import { ref, reactive, computed } from 'vue'
import { WEAPON_TYPES } from '../constants/gameConfig.js'

// Max weapon level
const MAX_LEVEL = 50

// Weapon level bonuses per level (small increments for 50 levels)
const LEVEL_BONUSES = {
  damage: 0.04,
  fireRate: 0.012,
  bulletSpeed: 0.015,
}

export function useWeapons() {
  const currentWeaponId = ref('candyCane')
  const bullets = reactive([])
  const lastShotTime = ref(0)
  const burstQueue = reactive([])

  // Weapon levels
  const weaponLevels = reactive({
    candyCane: 1,
    waveShot: 1,
    tripleShot: 1,
    spiralShot: 1,
    holyFire: 1,
    burstCane: 1,
    spiritBell: 1,
    dualSpiral: 1,
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
      fireRate: Math.max(30, baseWeapon.fireRate * fireRateMultiplier),
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

  function createBullet(x, y, angle, weapon, damageMultiplier) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      angle,
      baseAngle: angle,
      vx: Math.cos(angle) * weapon.bulletSpeed,
      vy: Math.sin(angle) * weapon.bulletSpeed,
      speed: weapon.bulletSpeed,
      damage: weapon.damage * damageMultiplier,
      color: weapon.color,
      piercing: weapon.piercing || false,
      pattern: weapon.pattern || 'normal',
      waveAmp: weapon.waveAmp || 0,
      waveFreq: weapon.waveFreq || 0,
      spiralSpeed: weapon.spiralSpeed || 0,
      homingStrength: weapon.homingStrength || 0,
      time: 0,
      hitEnemies: []
    }
  }

  function shoot(x, y, angle, damageMultiplier = 1) {
    const now = Date.now()
    const weapon = currentWeapon.value

    if (now - lastShotTime.value < weapon.fireRate) {
      return false
    }

    lastShotTime.value = now

    // Handle burst pattern
    if (weapon.pattern === 'burst') {
      const burstCount = weapon.burstCount || 3
      const burstDelay = weapon.burstDelay || 50
      for (let b = 0; b < burstCount; b++) {
        burstQueue.push({
          time: now + b * burstDelay,
          x, y, angle, weapon, damageMultiplier
        })
      }
      return true
    }

    // Normal shooting
    fireWeapon(x, y, angle, weapon, damageMultiplier)
    return true
  }

  function fireWeapon(x, y, angle, weapon, damageMultiplier) {
    const count = weapon.bulletCount

    for (let i = 0; i < count; i++) {
      let bulletAngle = angle

      if (count > 1) {
        if (weapon.spread === Math.PI * 2) {
          bulletAngle = angle + (Math.PI * 2 * i) / count
        } else {
          const spreadOffset = weapon.spread * ((i / (count - 1)) - 0.5)
          bulletAngle = angle + spreadOffset
        }
      }

      // Spiral pattern offset
      if (weapon.pattern === 'spiral') {
        bulletAngle += (i % 2 === 0 ? 1 : -1) * 0.3
      }

      bullets.push(createBullet(x, y, bulletAngle, weapon, damageMultiplier))
    }
  }

  function updateBullets(gameWidth, gameHeight, enemies = []) {
    const now = Date.now()
    const margin = 50

    // Process burst queue
    for (let i = burstQueue.length - 1; i >= 0; i--) {
      const burst = burstQueue[i]
      if (now >= burst.time) {
        fireWeapon(burst.x, burst.y, burst.angle, burst.weapon, burst.damageMultiplier)
        burstQueue.splice(i, 1)
      }
    }

    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      bullet.time++

      switch (bullet.pattern) {
        case 'wave':
          // Wave motion perpendicular to direction
          const waveOffset = Math.sin(bullet.time * bullet.waveFreq) * bullet.waveAmp
          const perpX = -Math.sin(bullet.baseAngle)
          const perpY = Math.cos(bullet.baseAngle)
          bullet.x += bullet.vx + perpX * Math.cos(bullet.time * bullet.waveFreq) * bullet.waveFreq * bullet.waveAmp
          bullet.y += bullet.vy + perpY * Math.cos(bullet.time * bullet.waveFreq) * bullet.waveFreq * bullet.waveAmp
          break

        case 'spiral':
          // Spiral outward - rotate while moving in base direction
          bullet.angle += bullet.spiralSpeed
          // Move in base direction + spiral offset
          const spiralRadius = bullet.time * 0.3
          const spiralX = Math.cos(bullet.angle) * spiralRadius * 0.5
          const spiralY = Math.sin(bullet.angle) * spiralRadius * 0.5
          bullet.x += Math.cos(bullet.baseAngle) * bullet.speed * 0.7 + spiralX * 0.1
          bullet.y += Math.sin(bullet.baseAngle) * bullet.speed * 0.7 + spiralY * 0.1
          break

        case 'homing':
          // Find nearest enemy
          if (enemies.length > 0 && bullet.time > 10) {
            let nearest = null
            let nearestDist = Infinity
            for (const enemy of enemies) {
              const dx = enemy.x - bullet.x
              const dy = enemy.y - bullet.y
              const dist = dx * dx + dy * dy
              if (dist < nearestDist) {
                nearestDist = dist
                nearest = enemy
              }
            }
            if (nearest && nearestDist < 40000) {
              const targetAngle = Math.atan2(nearest.y - bullet.y, nearest.x - bullet.x)
              let angleDiff = targetAngle - bullet.angle
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
              bullet.angle += angleDiff * bullet.homingStrength
              bullet.vx = Math.cos(bullet.angle) * bullet.speed
              bullet.vy = Math.sin(bullet.angle) * bullet.speed
            }
          }
          bullet.x += bullet.vx
          bullet.y += bullet.vy
          break

        default:
          bullet.x += bullet.vx
          bullet.y += bullet.vy
      }

      // Remove if out of bounds or too old
      if (
        bullet.x < -margin ||
        bullet.x > gameWidth + margin ||
        bullet.y < -margin ||
        bullet.y > gameHeight + margin ||
        bullet.time > 300
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
    burstQueue.splice(0, burstQueue.length)
  }

  function reset() {
    currentWeaponId.value = 'candyCane'
    clearBullets()
    lastShotTime.value = 0
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
