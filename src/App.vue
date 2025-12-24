<template>
  <div class="game-container">
    <GameCanvas
      :player="player"
      :bullets="bullets"
      :enemyBullets="enemyBullets"
      :enemies="enemies"
      :particles="particles"
      :expOrbs="expOrbs"
      :items="items"
      :snowflakes="snowflakes"
      :gameRunning="gameRunning"
      :paused="showWeaponSelect"
      :dashReady="dashReady"
      :dashCooldown="dashCooldownPercent"
      :combo="combo"
      :wave="wave"
      :waveAnnouncement="waveAnnouncement"
      :isDashing="isDashing"
      :dashAngle="dashAngle"
      :gameTime="gameTime"
      @move="handleMove"
      @shoot="handleShoot"
      @stopMove="handleStopMove"
      @stopShoot="handleStopShoot"
      @dash="handleDash"
    />

    <GameHUD
      v-if="gameRunning && !showWeaponSelect"
      :score="score"
      :level="player.level"
      :exp="player.exp"
      :expToNext="player.expToNext"
      :health="player.health"
      :maxHealth="player.maxHealth"
      :wave="wave"
      :powerUp="powerUpTime > 0"
    />

    <div v-if="gameRunning && !showWeaponSelect" class="weapon-indicator">
      {{ currentWeapon.name }}
    </div>

    <StartScreen v-if="gameState === 'start'" @start="startGame" />

    <GameOverScreen
      v-if="gameState === 'gameover'"
      :score="score"
      :level="player.level"
      :kills="kills"
      :wave="wave"
      :maxCombo="maxCombo"
      @restart="startGame"
    />

    <WeaponSelect
      :show="showWeaponSelect"
      :playerLevel="player.level"
      :currentWeaponId="currentWeaponId"
      :unlockedWeapons="getUnlockedWeapons(player.level)"
      @select="selectWeapon"
      @upgrade="handleUpgradeWeapon"
      @continue="continueGame"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_CONFIG, ENEMY_TYPES,
  ITEM_TYPES, WAVE_CONFIG, COMBO_CONFIG
} from './constants/gameConfig.js'
import { usePlayer } from './composables/usePlayer.js'
import { useWeapons } from './composables/useWeapons.js'
import { useEnemies } from './composables/useEnemies.js'
import { addScreenShake } from './utils/draw.js'

import GameCanvas from './components/GameCanvas.vue'
import GameHUD from './components/GameHUD.vue'
import StartScreen from './components/StartScreen.vue'
import GameOverScreen from './components/GameOverScreen.vue'
import WeaponSelect from './components/WeaponSelect.vue'

// Game state
const gameState = ref('start')
const gameRunning = computed(() => gameState.value === 'playing')
const showWeaponSelect = ref(false)
const score = ref(0)
const kills = ref(0)
const gameTime = ref(0)

// Wave system
const wave = ref(1)
const waveEnemiesRemaining = ref(0)
const waveAnnouncement = ref(0)
const betweenWaves = ref(false)

// Combo system
const combo = ref(0)
const maxCombo = ref(0)
const lastKillTime = ref(0)

// Dash system
const isDashing = ref(false)
const dashAngle = ref(0)
const dashEndTime = ref(0)
const dashCooldownEnd = ref(0)
const dashReady = computed(() => Date.now() >= dashCooldownEnd.value)
const dashCooldownPercent = computed(() => {
  const now = Date.now()
  if (now >= dashCooldownEnd.value) return 0
  const total = PLAYER_CONFIG.dashCooldown
  const remaining = dashCooldownEnd.value - now
  return remaining / total
})

// Power up
const powerUpTime = ref(0)
const powerMultiplier = ref(1)

// Input state
const moveInput = reactive({ x: 0, y: 0, active: false })
const shootInput = reactive({ angle: 0, active: false })

// Composables
const {
  player,
  stats: playerStats,
  reset: resetPlayer,
  takeDamage,
  heal,
  addExp
} = usePlayer()

const {
  currentWeaponId,
  currentWeapon,
  bullets,
  selectWeapon: setWeapon,
  shoot,
  updateBullets,
  removeBullet,
  getUnlockedWeapons,
  upgradeWeapon,
  reset: resetWeapons
} = useWeapons()

const {
  enemies,
  spawn: spawnEnemy,
  update: updateEnemies,
  damageEnemy,
  reset: resetEnemies
} = useEnemies()

// Enemy bullets
const enemyBullets = reactive([])

// Particles, effects, items
const particles = reactive([])
const expOrbs = reactive([])
const items = reactive([])
const snowflakes = reactive([])

// Game loop
let gameLoopId = null
let lastTime = 0

function initSnowflakes() {
  snowflakes.splice(0, snowflakes.length)
  for (let i = 0; i < 60; i++) {
    snowflakes.push({
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1
    })
  }
}

function createParticles(x, y, color, count, size = 4) {
  // Limit total particles for performance
  const maxParticles = 100
  const actualCount = Math.min(count, maxParticles - particles.length)
  if (actualCount <= 0) return

  for (let i = 0; i < actualCount; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1,
      color,
      size: Math.round(Math.random() * size + 2)
    })
  }
}

function spawnExpOrb(x, y, amount) {
  // Limit orbs for performance
  if (expOrbs.length > 50) return

  const count = Math.min(Math.ceil(amount / 10), 3)
  for (let i = 0; i < count; i++) {
    expOrbs.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      amount: Math.ceil(amount / count),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4
    })
  }
}

function spawnItem(x, y) {
  const types = Object.values(ITEM_TYPES)
  for (const type of types) {
    if (Math.random() < type.dropRate) {
      items.push({
        x,
        y,
        type: type.id,
        ...type
      })
      return
    }
  }
}

function spawnEnemyBullet(enemy, targetX, targetY) {
  const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x)
  const type = ENEMY_TYPES[enemy.type]
  const count = type.bulletCount || 1

  for (let i = 0; i < count; i++) {
    let bulletAngle = angle
    if (count > 1) {
      bulletAngle = (Math.PI * 2 * i) / count
    }

    enemyBullets.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(bulletAngle) * type.bulletSpeed,
      vy: Math.sin(bulletAngle) * type.bulletSpeed,
      damage: 1,
      radius: 6
    })
  }
}

function startWave() {
  wave.value++
  waveAnnouncement.value = 1
  betweenWaves.value = false

  const enemyCount = WAVE_CONFIG.baseEnemies + (wave.value - 1) * WAVE_CONFIG.enemiesPerWave
  waveEnemiesRemaining.value = enemyCount

  // Spawn boss every 5 waves
  if (wave.value % WAVE_CONFIG.bossWaveInterval === 0) {
    setTimeout(() => {
      const bossType = ENEMY_TYPES.krampus
      const side = Math.floor(Math.random() * 4)
      let x, y
      switch (side) {
        case 0: x = GAME_WIDTH / 2; y = -50; break
        case 1: x = GAME_WIDTH + 50; y = GAME_HEIGHT / 2; break
        case 2: x = GAME_WIDTH / 2; y = GAME_HEIGHT + 50; break
        case 3: x = -50; y = GAME_HEIGHT / 2; break
      }
      enemies.push({
        id: 'boss_' + wave.value,
        type: 'krampus',
        x, y,
        health: bossType.health + wave.value * 5,
        maxHealth: bossType.health + wave.value * 5,
        speed: bossType.speed,
        damage: bossType.damage,
        score: bossType.score,
        exp: bossType.exp,
        radius: bossType.radius,
        isBoss: true,
        canShoot: true,
        lastShot: 0,
        damageFlash: 0,
        angle: 0
      })
      addScreenShake(10)
    }, 2000)
  }

  setTimeout(() => {
    waveAnnouncement.value = 0
  }, 2000)
}

function updateCombo() {
  const now = Date.now()
  if (now - lastKillTime.value > COMBO_CONFIG.timeout) {
    combo.value = 0
  }
}

function addKill() {
  combo.value++
  maxCombo.value = Math.max(maxCombo.value, combo.value)
  lastKillTime.value = Date.now()
  kills.value++
}

function useBomb() {
  // Kill all enemies on screen
  for (const enemy of enemies) {
    score.value += enemy.score
    createParticles(enemy.x, enemy.y, '#ff6600', 20, 6)
    spawnExpOrb(enemy.x, enemy.y, enemy.exp)
  }
  enemies.splice(0, enemies.length)
  enemyBullets.splice(0, enemyBullets.length)
  addScreenShake(15)
  createParticles(GAME_WIDTH / 2, GAME_HEIGHT / 2, '#ffcc00', 50, 8)
}

function gameLoop(currentTime) {
  if (!gameRunning.value) return

  const deltaTime = currentTime - lastTime
  lastTime = currentTime
  gameTime.value = currentTime

  if (showWeaponSelect.value) {
    gameLoopId = requestAnimationFrame(gameLoop)
    return
  }

  // Update combo
  updateCombo()

  // Update power up
  if (powerUpTime.value > 0) {
    powerUpTime.value -= deltaTime
    if (powerUpTime.value <= 0) {
      powerMultiplier.value = 1
    }
  }

  // Update dash
  const now = Date.now()
  if (isDashing.value) {
    if (now < dashEndTime.value) {
      player.x += Math.cos(dashAngle.value) * PLAYER_CONFIG.dashSpeed
      player.y += Math.sin(dashAngle.value) * PLAYER_CONFIG.dashSpeed
      player.x = Math.max(PLAYER_CONFIG.radius, Math.min(GAME_WIDTH - PLAYER_CONFIG.radius, player.x))
      player.y = Math.max(PLAYER_CONFIG.radius, Math.min(GAME_HEIGHT - PLAYER_CONFIG.radius, player.y))
    } else {
      isDashing.value = false
    }
  } else if (moveInput.active) {
    const speed = playerStats.value.speed
    player.x += moveInput.x * speed
    player.y += moveInput.y * speed
    player.x = Math.max(PLAYER_CONFIG.radius, Math.min(GAME_WIDTH - PLAYER_CONFIG.radius, player.x))
    player.y = Math.max(PLAYER_CONFIG.radius, Math.min(GAME_HEIGHT - PLAYER_CONFIG.radius, player.y))
  }

  // Update invincibility
  if (player.isInvincible && now > player.invincibleUntil) {
    player.isInvincible = false
  }

  // Shoot
  if (shootInput.active && !isDashing.value) {
    player.aimAngle = shootInput.angle
    const damage = playerStats.value.damage * powerMultiplier.value
    shoot(player.x, player.y, shootInput.angle, damage)
  }

  // Update bullets
  updateBullets(GAME_WIDTH, GAME_HEIGHT)

  // Update enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i]
    bullet.x += bullet.vx
    bullet.y += bullet.vy

    if (bullet.x < -20 || bullet.x > GAME_WIDTH + 20 ||
        bullet.y < -20 || bullet.y > GAME_HEIGHT + 20) {
      enemyBullets.splice(i, 1)
      continue
    }

    // Check collision with player
    if (!player.isInvincible && !isDashing.value) {
      const dx = bullet.x - player.x
      const dy = bullet.y - player.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < PLAYER_CONFIG.radius + bullet.radius - 5) {
        const isDead = takeDamage(bullet.damage)
        createParticles(player.x, player.y, '#ff0000', 15)
        addScreenShake(5)
        enemyBullets.splice(i, 1)

        if (isDead) {
          gameOver()
          return
        }
      }
    }
  }

  // Wave system - spawn enemies
  if (!betweenWaves.value && waveEnemiesRemaining.value > 0) {
    const spawned = spawnEnemy(player.level, 1 + wave.value * 0.15)
    if (spawned) {
      spawned.damageFlash = 0
      spawned.lastShot = 0
      waveEnemiesRemaining.value--
    }
  }

  // Check if wave complete
  if (waveEnemiesRemaining.value <= 0 && enemies.length === 0 && !betweenWaves.value) {
    betweenWaves.value = true
    setTimeout(startWave, WAVE_CONFIG.timeBetweenWaves)
  }

  // Update enemies
  updateEnemies(player.x, player.y)

  // Enemy shooting
  for (const enemy of enemies) {
    const type = ENEMY_TYPES[enemy.type]
    if (type.canShoot && now - enemy.lastShot > type.shootRate) {
      spawnEnemyBullet(enemy, player.x, player.y)
      enemy.lastShot = now
    }
    // Update damage flash
    if (enemy.damageFlash > 0) {
      enemy.damageFlash -= 0.1
    }
  }

  // Bullet-enemy collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    for (const enemy of enemies) {
      const dx = bullet.x - enemy.x
      const dy = bullet.y - enemy.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < enemy.radius + 8) {
        if (bullet.piercing && bullet.hitEnemies.includes(enemy.id)) {
          continue
        }

        const result = damageEnemy(enemy.id, bullet.damage)
        createParticles(bullet.x, bullet.y, bullet.color, 5)

        if (result) {
          enemy.damageFlash = 1

          if (result.killed) {
            const comboBonus = 1 + combo.value * COMBO_CONFIG.bonusMultiplier
            score.value += Math.floor(result.score * comboBonus)
            addKill()
            createParticles(result.x, result.y, '#ff0000', 20, 5)
            spawnExpOrb(result.x, result.y, result.exp)
            spawnItem(result.x, result.y)

            if (result.isBoss) {
              createParticles(result.x, result.y, '#ffcc00', 40, 8)
              addScreenShake(12)
            } else {
              addScreenShake(3)
            }
          }
        }

        if (bullet.piercing) {
          bullet.hitEnemies.push(enemy.id)
        } else {
          removeBullet(i)
          break
        }
      }
    }
  }

  // Enemy-player collisions
  if (!isDashing.value) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i]
      const dx = enemy.x - player.x
      const dy = enemy.y - player.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < enemy.radius + PLAYER_CONFIG.radius - 12) {
        const isDead = takeDamage(enemy.damage)
        createParticles(player.x, player.y, '#ff0000', 25)
        addScreenShake(8)
        enemies.splice(i, 1)

        if (isDead) {
          gameOver()
          return
        }
      }
    }
  }

  // Collect exp orbs
  for (let i = expOrbs.length - 1; i >= 0; i--) {
    const orb = expOrbs[i]
    const dx = orb.x - player.x
    const dy = orb.y - player.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 100) {
      orb.x -= dx * 0.12
      orb.y -= dy * 0.12
    }

    if (dist < 25) {
      const levelsGained = addExp(orb.amount)
      expOrbs.splice(i, 1)
      createParticles(player.x, player.y, '#00ff66', 5, 3)

      if (levelsGained.length > 0) {
        showWeaponSelect.value = true
        createParticles(player.x, player.y, '#ffcc00', 30, 5)
        addScreenShake(5)
      }
    } else {
      orb.x += orb.vx
      orb.y += orb.vy
      orb.vx *= 0.96
      orb.vy *= 0.96
    }
  }

  // Collect items
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i]
    const dx = item.x - player.x
    const dy = item.y - player.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 30) {
      switch (item.effect) {
        case 'heal':
          heal(item.value)
          createParticles(player.x, player.y, '#ff4444', 10, 4)
          break
        case 'power':
          powerUpTime.value = item.duration
          powerMultiplier.value = item.value
          createParticles(player.x, player.y, '#ffcc00', 15, 4)
          break
        case 'bomb':
          useBomb()
          break
      }
      items.splice(i, 1)
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vx *= 0.94
    p.vy *= 0.94
    p.life -= 0.025
    if (p.life <= 0) {
      particles.splice(i, 1)
    }
  }

  // Update snowflakes
  snowflakes.forEach(snow => {
    snow.y += snow.speed
    snow.x += Math.sin(snow.y * 0.02 + snow.x * 0.01) * 0.5
    if (snow.y > GAME_HEIGHT + 10) {
      snow.y = -10
      snow.x = Math.random() * GAME_WIDTH
    }
  })

  gameLoopId = requestAnimationFrame(gameLoop)
}

function handleMove(x, y) {
  moveInput.x = x
  moveInput.y = y
  moveInput.active = true
}

function handleStopMove() {
  moveInput.active = false
  moveInput.x = 0
  moveInput.y = 0
}

function handleShoot(angle, active) {
  shootInput.angle = angle
  shootInput.active = active
}

function handleStopShoot() {
  shootInput.active = false
}

function handleDash() {
  if (!dashReady.value || isDashing.value) return

  isDashing.value = true
  dashAngle.value = moveInput.active
    ? Math.atan2(moveInput.y, moveInput.x)
    : player.aimAngle
  dashEndTime.value = Date.now() + PLAYER_CONFIG.dashDuration
  dashCooldownEnd.value = Date.now() + PLAYER_CONFIG.dashCooldown

  createParticles(player.x, player.y, '#ff6666', 10, 3)
}

function selectWeapon(weaponId) {
  setWeapon(weaponId)
}

function handleUpgradeWeapon(weaponId) {
  upgradeWeapon(weaponId)
  createParticles(player.x, player.y, '#00ff00', 20, 4)
}

function continueGame() {
  showWeaponSelect.value = false
}

function startGame() {
  resetPlayer()
  resetWeapons()
  resetEnemies()
  particles.splice(0, particles.length)
  expOrbs.splice(0, expOrbs.length)
  items.splice(0, items.length)
  enemyBullets.splice(0, enemyBullets.length)
  score.value = 0
  kills.value = 0
  wave.value = 0
  combo.value = 0
  maxCombo.value = 0
  waveEnemiesRemaining.value = 0
  betweenWaves.value = true
  powerUpTime.value = 0
  powerMultiplier.value = 1
  isDashing.value = false
  dashCooldownEnd.value = 0
  showWeaponSelect.value = false
  moveInput.active = false
  shootInput.active = false
  initSnowflakes()

  gameState.value = 'playing'
  lastTime = performance.now()
  gameLoopId = requestAnimationFrame(gameLoop)

  // Start first wave after a delay
  setTimeout(startWave, 1500)
}

function gameOver() {
  gameState.value = 'gameover'
  addScreenShake(15)
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
}

onMounted(() => {
  initSnowflakes()
})

onUnmounted(() => {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId)
  }
})
</script>

<style>
.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #050505;
}

.weapon-indicator {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  color: #aa4444;
  font-size: 11px;
  text-shadow: 0 0 10px #ff0000;
  background: rgba(0, 0, 0, 0.7);
  padding: 6px 16px;
  border: 1px solid #4a0000;
  border-radius: 4px;
  pointer-events: none;
  letter-spacing: 1px;
}
</style>
