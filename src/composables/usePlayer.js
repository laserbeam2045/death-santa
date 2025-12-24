import { reactive, computed } from 'vue'
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_CONFIG, LEVEL_CONFIG } from '../constants/gameConfig.js'

export function usePlayer() {
  const player = reactive({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    targetX: GAME_WIDTH / 2,
    targetY: GAME_HEIGHT / 2,
    aimAngle: -Math.PI / 2,
    health: PLAYER_CONFIG.baseHealth,
    maxHealth: PLAYER_CONFIG.baseHealth,
    level: 1,
    exp: 0,
    expToNext: LEVEL_CONFIG.baseExp,
    isInvincible: false,
    invincibleUntil: 0
  })

  const stats = computed(() => ({
    damage: 1 + (player.level - 1) * LEVEL_CONFIG.damagePerLevel,
    speed: PLAYER_CONFIG.baseSpeed + (player.level - 1) * LEVEL_CONFIG.speedPerLevel
  }))

  function reset() {
    player.x = GAME_WIDTH / 2
    player.y = GAME_HEIGHT / 2
    player.targetX = GAME_WIDTH / 2
    player.targetY = GAME_HEIGHT / 2
    player.aimAngle = -Math.PI / 2
    player.health = PLAYER_CONFIG.baseHealth
    player.maxHealth = PLAYER_CONFIG.baseHealth
    player.level = 1
    player.exp = 0
    player.expToNext = LEVEL_CONFIG.baseExp
    player.isInvincible = false
    player.invincibleUntil = 0
  }

  function setTarget(x, y) {
    player.targetX = x
    player.targetY = y
  }

  function setAimAngle(angle) {
    player.aimAngle = angle
  }

  function update(deltaTime) {
    // Move towards target
    const dx = player.targetX - player.x
    const dy = player.targetY - player.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > 5) {
      const speed = stats.value.speed
      player.x += (dx / dist) * speed
      player.y += (dy / dist) * speed
    }

    // Clamp position
    player.x = Math.max(PLAYER_CONFIG.radius, Math.min(GAME_WIDTH - PLAYER_CONFIG.radius, player.x))
    player.y = Math.max(PLAYER_CONFIG.radius, Math.min(GAME_HEIGHT - PLAYER_CONFIG.radius, player.y))

    // Update invincibility
    if (player.isInvincible && Date.now() > player.invincibleUntil) {
      player.isInvincible = false
    }
  }

  function takeDamage(amount) {
    if (player.isInvincible) return false

    player.health -= amount
    player.isInvincible = true
    player.invincibleUntil = Date.now() + PLAYER_CONFIG.invincibleTime

    return player.health <= 0
  }

  function heal(amount) {
    player.health = Math.min(player.maxHealth, player.health + amount)
  }

  function addExp(amount) {
    player.exp += amount
    const leveledUp = []

    while (player.exp >= player.expToNext) {
      player.exp -= player.expToNext
      player.level++
      player.maxHealth += LEVEL_CONFIG.healthPerLevel
      player.health = player.maxHealth
      player.expToNext = Math.floor(LEVEL_CONFIG.baseExp * Math.pow(LEVEL_CONFIG.expMultiplier, player.level - 1))
      leveledUp.push(player.level)
    }

    return leveledUp
  }

  return {
    player,
    stats,
    reset,
    setTarget,
    setAimAngle,
    update,
    takeDamage,
    heal,
    addExp
  }
}
