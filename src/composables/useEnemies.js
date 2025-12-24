import { reactive, ref } from 'vue'
import { GAME_WIDTH, GAME_HEIGHT, ENEMY_TYPES } from '../constants/gameConfig.js'

export function useEnemies() {
  const enemies = reactive([])
  const lastSpawnTime = ref(0)

  function getSpawnPosition() {
    // Spawn from any edge of the screen
    const side = Math.floor(Math.random() * 4)
    const margin = 50
    let x, y

    switch (side) {
      case 0: // Top
        x = Math.random() * GAME_WIDTH
        y = -margin
        break
      case 1: // Right
        x = GAME_WIDTH + margin
        y = Math.random() * GAME_HEIGHT
        break
      case 2: // Bottom
        x = Math.random() * GAME_WIDTH
        y = GAME_HEIGHT + margin
        break
      case 3: // Left
        x = -margin
        y = Math.random() * GAME_HEIGHT
        break
    }

    return { x, y }
  }

  function getAvailableEnemyTypes(playerLevel) {
    return Object.values(ENEMY_TYPES).filter(
      e => !e.minLevel || e.minLevel <= playerLevel
    )
  }

  function selectEnemyType(playerLevel) {
    const available = getAvailableEnemyTypes(playerLevel)
    const totalWeight = available.reduce((sum, e) => sum + e.spawnWeight, 0)
    let random = Math.random() * totalWeight

    for (const enemyType of available) {
      random -= enemyType.spawnWeight
      if (random <= 0) {
        return enemyType
      }
    }

    return available[0]
  }

  function spawn(playerLevel, difficultyMultiplier = 1) {
    const now = Date.now()
    // Start slow, get faster over time: 800ms at start, down to 100ms
    const baseRate = Math.max(100, 800 - playerLevel * 30)
    const spawnRate = baseRate / difficultyMultiplier

    if (now - lastSpawnTime.value < spawnRate) {
      return null
    }

    // Limit max enemies on screen (increases with level)
    const maxEnemies = Math.min(50, 10 + playerLevel * 3)
    if (enemies.length >= maxEnemies) {
      return null
    }

    lastSpawnTime.value = now

    // Spawn count increases with difficulty
    const spawnCount = Math.min(3, 1 + Math.floor(playerLevel / 5))
    let lastEnemy = null

    for (let i = 0; i < spawnCount; i++) {
      const enemyType = selectEnemyType(playerLevel)
      const { x, y } = getSpawnPosition()

      const enemy = {
        id: Math.random().toString(36).substr(2, 9),
        type: enemyType.id,
        x,
        y,
        health: enemyType.health + Math.floor(playerLevel / 5),
        maxHealth: enemyType.health + Math.floor(playerLevel / 5),
        speed: enemyType.speed * (1 + playerLevel * 0.01),
        damage: enemyType.damage,
        score: enemyType.score,
        exp: enemyType.exp,
        radius: enemyType.radius,
        isBoss: enemyType.isBoss || false,
        angle: 0
      }

      enemies.push(enemy)
      lastEnemy = enemy
    }

    return lastEnemy
  }

  function update(playerX, playerY) {
    for (const enemy of enemies) {
      const dx = playerX - enemy.x
      const dy = playerY - enemy.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 0) {
        enemy.x += (dx / dist) * enemy.speed
        enemy.y += (dy / dist) * enemy.speed
        enemy.angle = Math.atan2(dy, dx)
      }
    }
  }

  function damageEnemy(enemyId, damage) {
    const index = enemies.findIndex(e => e.id === enemyId)
    if (index === -1) return null

    const enemy = enemies[index]
    enemy.health -= damage

    if (enemy.health <= 0) {
      enemies.splice(index, 1)
      return {
        killed: true,
        score: enemy.score,
        exp: enemy.exp,
        x: enemy.x,
        y: enemy.y,
        isBoss: enemy.isBoss
      }
    }

    return { killed: false }
  }

  function removeEnemy(index) {
    enemies.splice(index, 1)
  }

  function clearEnemies() {
    enemies.splice(0, enemies.length)
  }

  function reset() {
    clearEnemies()
    lastSpawnTime.value = 0
  }

  return {
    enemies,
    spawn,
    update,
    damageEnemy,
    removeEnemy,
    clearEnemies,
    reset
  }
}
