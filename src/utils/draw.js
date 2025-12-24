import { ENEMY_TYPES } from '../constants/gameConfig.js'

// Screen shake state
let shakeIntensity = 0
let shakeDecay = 0.9

// Particle sprite cache
const particleCache = new Map()
const bulletCache = new Map()
const orbCache = { canvas: null, ready: false }

function getParticleSprite(color, size) {
  const key = `${color}_${Math.round(size)}`
  if (particleCache.has(key)) {
    return particleCache.get(key)
  }

  const canvas = document.createElement('canvas')
  const s = Math.round(size) * 3
  canvas.width = s
  canvas.height = s
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.5, color + '88')
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(s/2, s/2, s/2, 0, Math.PI * 2)
  ctx.fill()

  particleCache.set(key, canvas)
  return canvas
}

function getBulletSprite(color) {
  if (bulletCache.has(color)) {
    return bulletCache.get(color)
  }

  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.3, color)
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(8, 8, 8, 0, Math.PI * 2)
  ctx.fill()

  bulletCache.set(color, canvas)
  return canvas
}

function getOrbSprite() {
  if (orbCache.ready) return orbCache.canvas

  const canvas = document.createElement('canvas')
  canvas.width = 24
  canvas.height = 24
  const ctx = canvas.getContext('2d')

  const gradient = ctx.createRadialGradient(12, 12, 0, 12, 12, 12)
  gradient.addColorStop(0, '#aaffaa')
  gradient.addColorStop(0.5, '#00ff66')
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(12, 12, 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(12, 12, 4, 0, Math.PI * 2)
  ctx.fill()

  orbCache.canvas = canvas
  orbCache.ready = true
  return canvas
}

export function addScreenShake(intensity) {
  shakeIntensity = Math.min(shakeIntensity + intensity, 15)
}

export function getScreenShake() {
  const shake = {
    x: (Math.random() - 0.5) * shakeIntensity * 2,
    y: (Math.random() - 0.5) * shakeIntensity * 2
  }
  shakeIntensity *= shakeDecay
  if (shakeIntensity < 0.1) shakeIntensity = 0
  return shake
}

export function drawBackground(ctx, width, height, snowflakes, time = 0) {
  // Dark gradient background with pulsing effect
  const pulse = Math.sin(time * 0.001) * 0.1 + 0.9
  const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height)
  bgGradient.addColorStop(0, `rgba(40, 10, 20, ${pulse})`)
  bgGradient.addColorStop(0.5, '#1a0a0a')
  bgGradient.addColorStop(1, '#050505')
  ctx.fillStyle = bgGradient
  ctx.fillRect(0, 0, width, height)

  // Animated blood moon with glow rings
  const moonX = width - 70
  const moonY = 90
  const moonPulse = Math.sin(time * 0.002) * 5

  // Outer glow rings
  for (let i = 3; i >= 0; i--) {
    ctx.fillStyle = `rgba(139, 0, 0, ${0.1 - i * 0.02})`
    ctx.beginPath()
    ctx.arc(moonX, moonY, 60 + i * 20 + moonPulse, 0, Math.PI * 2)
    ctx.fill()
  }

  // Moon body
  const moonGradient = ctx.createRadialGradient(moonX - 10, moonY - 10, 0, moonX, moonY, 45)
  moonGradient.addColorStop(0, '#ff4444')
  moonGradient.addColorStop(0.5, '#8b0000')
  moonGradient.addColorStop(1, '#4a0000')
  ctx.fillStyle = moonGradient
  ctx.beginPath()
  ctx.arc(moonX, moonY, 40 + moonPulse * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // Moon craters
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.arc(moonX - 15, moonY - 10, 8, 0, Math.PI * 2)
  ctx.arc(moonX + 10, moonY + 5, 12, 0, Math.PI * 2)
  ctx.arc(moonX - 5, moonY + 15, 6, 0, Math.PI * 2)
  ctx.fill()

  // Dark snowflakes with trails
  snowflakes.forEach(snow => {
    const gradient = ctx.createLinearGradient(snow.x, snow.y - 10, snow.x, snow.y)
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(1, `rgba(150, 150, 180, ${snow.opacity})`)
    ctx.strokeStyle = gradient
    ctx.lineWidth = snow.size * 0.5
    ctx.beginPath()
    ctx.moveTo(snow.x, snow.y - 10)
    ctx.lineTo(snow.x, snow.y)
    ctx.stroke()

    ctx.fillStyle = `rgba(150, 150, 180, ${snow.opacity})`
    ctx.beginPath()
    ctx.arc(snow.x, snow.y, snow.size, 0, Math.PI * 2)
    ctx.fill()
  })

  // Fog effect at bottom
  const fogGradient = ctx.createLinearGradient(0, height - 100, 0, height)
  fogGradient.addColorStop(0, 'transparent')
  fogGradient.addColorStop(1, 'rgba(20, 10, 15, 0.8)')
  ctx.fillStyle = fogGradient
  ctx.fillRect(0, height - 100, width, 100)

  // Dead trees with more detail
  ctx.fillStyle = '#0a0505'
  for (let i = 0; i < 6; i++) {
    const tx = i * 80 + 20
    const ty = height - 30
    const treeHeight = 60 + Math.sin(i * 2) * 20

    // Main trunk
    ctx.beginPath()
    ctx.moveTo(tx - 3, ty)
    ctx.lineTo(tx - 2, ty - treeHeight)
    ctx.lineTo(tx + 2, ty - treeHeight)
    ctx.lineTo(tx + 3, ty)
    ctx.fill()

    // Branches
    ctx.strokeStyle = '#0a0505'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(tx, ty - treeHeight * 0.7)
    ctx.lineTo(tx - 15, ty - treeHeight * 0.9)
    ctx.moveTo(tx, ty - treeHeight * 0.5)
    ctx.lineTo(tx + 12, ty - treeHeight * 0.7)
    ctx.moveTo(tx, ty - treeHeight * 0.3)
    ctx.lineTo(tx - 10, ty - treeHeight * 0.4)
    ctx.stroke()
  }
}

export function drawPlayer(ctx, player, isInvincible, dashCooldown = 0, time = 0) {
  const x = player.x
  const y = player.y

  ctx.save()

  // Invincibility flicker
  if (isInvincible && Math.floor(Date.now() / 80) % 2 === 0) {
    ctx.globalAlpha = 0.4
  }

  // Dark aura with animation
  const auraSize = 50 + Math.sin(time * 0.01) * 5
  const auraGradient = ctx.createRadialGradient(x, y, 0, x, y, auraSize)
  auraGradient.addColorStop(0, 'rgba(139, 0, 0, 0.5)')
  auraGradient.addColorStop(0.5, 'rgba(80, 0, 0, 0.3)')
  auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = auraGradient
  ctx.beginPath()
  ctx.arc(x, y, auraSize, 0, Math.PI * 2)
  ctx.fill()

  // Dash indicator ring
  if (dashCooldown < 1) {
    ctx.strokeStyle = `rgba(255, 100, 100, ${1 - dashCooldown})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 35, 0, Math.PI * 2 * (1 - dashCooldown))
    ctx.stroke()
  }

  // Aim indicator with arrow
  const aimLength = 60
  const aimX = x + Math.cos(player.aimAngle) * aimLength
  const aimY = y + Math.sin(player.aimAngle) * aimLength

  ctx.strokeStyle = 'rgba(255, 50, 50, 0.6)'
  ctx.lineWidth = 3
  ctx.setLineDash([8, 4])
  ctx.beginPath()
  ctx.moveTo(x + Math.cos(player.aimAngle) * 30, y + Math.sin(player.aimAngle) * 30)
  ctx.lineTo(aimX, aimY)
  ctx.stroke()
  ctx.setLineDash([])

  // Arrow head
  const arrowAngle = 0.5
  ctx.fillStyle = 'rgba(255, 50, 50, 0.8)'
  ctx.beginPath()
  ctx.moveTo(aimX, aimY)
  ctx.lineTo(
    aimX - Math.cos(player.aimAngle - arrowAngle) * 12,
    aimY - Math.sin(player.aimAngle - arrowAngle) * 12
  )
  ctx.lineTo(
    aimX - Math.cos(player.aimAngle + arrowAngle) * 12,
    aimY - Math.sin(player.aimAngle + arrowAngle) * 12
  )
  ctx.closePath()
  ctx.fill()

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.beginPath()
  ctx.ellipse(x, y + 30, 20, 8, 0, 0, Math.PI * 2)
  ctx.fill()

  // Floating animation
  const floatY = Math.sin(time * 0.005) * 3

  // Body (dark red coat with shading)
  const bodyGradient = ctx.createLinearGradient(x - 20, y, x + 20, y)
  bodyGradient.addColorStop(0, '#3a0000')
  bodyGradient.addColorStop(0.5, '#5a0000')
  bodyGradient.addColorStop(1, '#3a0000')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.ellipse(x, y + 10 + floatY, 22, 28, 0, 0, Math.PI * 2)
  ctx.fill()

  // Coat trim
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.ellipse(x, y + 10 + floatY, 22, 28, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Belt with buckle
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(x - 20, y + 5 + floatY, 40, 10)
  const buckleGradient = ctx.createLinearGradient(x - 6, y, x + 6, y)
  buckleGradient.addColorStop(0, '#ffcc00')
  buckleGradient.addColorStop(0.5, '#ffee88')
  buckleGradient.addColorStop(1, '#ffcc00')
  ctx.fillStyle = buckleGradient
  ctx.fillRect(x - 6, y + 3 + floatY, 12, 14)
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(x - 2, y + 7 + floatY, 4, 6)

  // Head with skin tone gradient
  const headGradient = ctx.createRadialGradient(x - 3, y - 23, 0, x, y - 20, 18)
  headGradient.addColorStop(0, '#e8c4a0')
  headGradient.addColorStop(1, '#c4a080')
  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.arc(x, y - 20 + floatY, 16, 0, Math.PI * 2)
  ctx.fill()

  // Evil eyes with glow
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 15
  ctx.fillStyle = '#ff0000'
  ctx.beginPath()
  ctx.arc(x - 5, y - 22 + floatY, 4, 0, Math.PI * 2)
  ctx.arc(x + 5, y - 22 + floatY, 4, 0, Math.PI * 2)
  ctx.fill()

  // Eye pupils
  ctx.shadowBlur = 0
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(x - 4, y - 22 + floatY, 2, 0, Math.PI * 2)
  ctx.arc(x + 6, y - 22 + floatY, 2, 0, Math.PI * 2)
  ctx.fill()

  // White beard (fluffy and full)
  const beardGradient = ctx.createRadialGradient(x, y - 5 + floatY, 0, x, y + 5 + floatY, 25)
  beardGradient.addColorStop(0, '#ffffff')
  beardGradient.addColorStop(0.7, '#dddddd')
  beardGradient.addColorStop(1, '#aaaaaa')
  ctx.fillStyle = beardGradient

  // Main beard shape
  ctx.beginPath()
  ctx.moveTo(x - 14, y - 18 + floatY)
  ctx.quadraticCurveTo(x - 18, y - 5 + floatY, x - 12, y + 8 + floatY)
  ctx.quadraticCurveTo(x, y + 18 + floatY, x + 12, y + 8 + floatY)
  ctx.quadraticCurveTo(x + 18, y - 5 + floatY, x + 14, y - 18 + floatY)
  ctx.fill()

  // Beard fluff details
  ctx.fillStyle = '#eeeeee'
  for (let i = 0; i < 5; i++) {
    const bx = x - 10 + i * 5
    const by = y + 5 + Math.sin(i + time * 0.01) * 2 + floatY
    ctx.beginPath()
    ctx.arc(bx, by, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Mustache
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(x - 8, y - 12 + floatY, 8, 4, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + 8, y - 12 + floatY, 8, 4, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Sinister smile (red glow through beard)
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 8
  ctx.strokeStyle = '#ff0000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y - 8 + floatY, 5, 0.2 * Math.PI, 0.8 * Math.PI)
  ctx.stroke()
  ctx.shadowBlur = 0

  // Dark hat with gradient
  const hatGradient = ctx.createLinearGradient(x - 20, y - 55, x + 20, y - 30)
  hatGradient.addColorStop(0, '#2a0000')
  hatGradient.addColorStop(1, '#4a0000')
  ctx.fillStyle = hatGradient
  ctx.beginPath()
  ctx.moveTo(x - 20, y - 30 + floatY)
  ctx.lineTo(x + 20, y - 30 + floatY)
  ctx.lineTo(x + 12, y - 58 + floatY)
  ctx.lineTo(x - 5, y - 48 + floatY)
  ctx.closePath()
  ctx.fill()

  // Hat trim with fur texture
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(x - 22, y - 34 + floatY, 44, 8)
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#333' : '#222'
    ctx.fillRect(x - 22 + i * 4.4, y - 34 + floatY, 4, 8)
  }

  // Skull ornament with glow
  ctx.shadowColor = '#ff6666'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#cccccc'
  ctx.beginPath()
  ctx.arc(x + 10, y - 52 + floatY, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Skull details
  ctx.fillStyle = '#1a0000'
  ctx.beginPath()
  ctx.arc(x + 8, y - 53 + floatY, 2, 0, Math.PI * 2)
  ctx.arc(x + 12, y - 53 + floatY, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + 8, y - 48 + floatY)
  ctx.lineTo(x + 9, y - 50 + floatY)
  ctx.lineTo(x + 10, y - 48 + floatY)
  ctx.lineTo(x + 11, y - 50 + floatY)
  ctx.lineTo(x + 12, y - 48 + floatY)
  ctx.stroke()

  ctx.restore()
}

export function drawBullet(ctx, bullet, time = 0) {
  const sprite = getBulletSprite(bullet.color)

  // Simple trail
  ctx.strokeStyle = bullet.color
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(bullet.x - bullet.vx * 2, bullet.y - bullet.vy * 2)
  ctx.lineTo(bullet.x, bullet.y)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.drawImage(sprite, bullet.x - 8, bullet.y - 8)
}

export function drawEnemyBullet(ctx, bullet) {
  const sprite = getBulletSprite('#00ff00')
  ctx.drawImage(sprite, bullet.x - 8, bullet.y - 8)
}

export function drawEnemy(ctx, enemy, time = 0) {
  const { x, y, type, angle, health, maxHealth } = enemy

  // Scale factor based on radius (base design is for radius ~22)
  const baseRadius = 22
  const scale = enemy.radius / baseRadius

  ctx.save()

  // Damage flash
  if (enemy.damageFlash > 0) {
    ctx.filter = `brightness(${1 + enemy.damageFlash})`
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.beginPath()
  ctx.ellipse(x, y + enemy.radius + 3, enemy.radius * 0.8, enemy.radius * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()

  // Apply scale for enemy drawing
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.translate(-x, -y)

  switch (type) {
    case 'snowman':
      drawSnowman(ctx, x, y, time)
      break
    case 'evilGift':
      drawEvilGift(ctx, x, y, time)
      break
    case 'demonReindeer':
      drawDemonReindeer(ctx, x, y, angle, time)
      break
    case 'iceWraith':
      drawIceWraith(ctx, x, y, time)
      break
    case 'darkElf':
      drawDarkElf(ctx, x, y, angle, time)
      break
    case 'krampus':
      drawKrampus(ctx, x, y, angle, time)
      break
  }

  // Reset transform for UI elements (health bar)
  ctx.restore()
  ctx.save()

  // Damage flash for health bar
  if (enemy.damageFlash > 0) {
    ctx.filter = `brightness(${1 + enemy.damageFlash * 0.5})`
  }

  // Health bar with style
  if (maxHealth > 1) {
    const barWidth = enemy.radius * 2.5
    const barHeight = 6
    const barY = y - enemy.radius - 15

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2)

    // Health
    const healthPercent = health / maxHealth
    const healthGradient = ctx.createLinearGradient(x - barWidth / 2, 0, x + barWidth / 2, 0)
    if (enemy.isBoss) {
      healthGradient.addColorStop(0, '#ff0000')
      healthGradient.addColorStop(0.5, '#ff6600')
      healthGradient.addColorStop(1, '#ff0000')
    } else {
      healthGradient.addColorStop(0, '#8b0000')
      healthGradient.addColorStop(1, '#ff4444')
    }
    ctx.fillStyle = healthGradient
    ctx.fillRect(x - barWidth / 2, barY, barWidth * healthPercent, barHeight)

    // Border
    ctx.strokeStyle = enemy.isBoss ? '#ffcc00' : '#666'
    ctx.lineWidth = 1
    ctx.strokeRect(x - barWidth / 2, barY, barWidth, barHeight)
  }

  // Boss indicator
  if (enemy.isBoss) {
    ctx.fillStyle = '#ffcc00'
    ctx.font = 'bold 12px Courier New'
    ctx.textAlign = 'center'
    ctx.fillText('BOSS', x, y - enemy.radius - 22)
  }

  ctx.restore()
}

function drawSnowman(ctx, x, y, time) {
  const wobble = Math.sin(time * 0.01) * 2

  // Body gradient
  const bodyGradient = ctx.createRadialGradient(x - 5, y + 10, 0, x, y + 15, 22)
  bodyGradient.addColorStop(0, '#4a4a4a')
  bodyGradient.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.arc(x, y + 15 + wobble, 20, 0, Math.PI * 2)
  ctx.fill()

  // Head
  const headGradient = ctx.createRadialGradient(x - 3, y - 12, 0, x, y - 10, 15)
  headGradient.addColorStop(0, '#3a3a3a')
  headGradient.addColorStop(1, '#1a1a1a')
  ctx.fillStyle = headGradient
  ctx.beginPath()
  ctx.arc(x, y - 10 + wobble, 14, 0, Math.PI * 2)
  ctx.fill()

  // Evil eyes with pulsing glow
  const eyePulse = Math.sin(time * 0.02) * 0.3 + 0.7
  ctx.fillStyle = `rgba(255, 0, 0, ${eyePulse})`
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(x - 5, y - 12 + wobble, 4, 0, Math.PI * 2)
  ctx.arc(x + 5, y - 12 + wobble, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Jagged mouth
  ctx.strokeStyle = '#ff0000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 8, y - 4 + wobble)
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(x - 8 + i * 4, y - 4 + (i % 2 === 0 ? 0 : -4) + wobble)
  }
  ctx.stroke()

  // Carrot nose (broken)
  ctx.fillStyle = '#8b4513'
  ctx.beginPath()
  ctx.moveTo(x, y - 8 + wobble)
  ctx.lineTo(x + 10, y - 6 + wobble)
  ctx.lineTo(x, y - 4 + wobble)
  ctx.closePath()
  ctx.fill()

  // Dead branches as arms
  ctx.strokeStyle = '#2a1a0a'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - 18, y + 5)
  ctx.lineTo(x - 35, y - 5)
  ctx.moveTo(x - 30, y - 2)
  ctx.lineTo(x - 38, y - 10)
  ctx.moveTo(x + 18, y + 5)
  ctx.lineTo(x + 35, y - 5)
  ctx.moveTo(x + 30, y - 2)
  ctx.lineTo(x + 38, y + 5)
  ctx.stroke()
}

function drawEvilGift(ctx, x, y, time) {
  const bounce = Math.abs(Math.sin(time * 0.015)) * 3

  // Box body with gradient
  const boxGradient = ctx.createLinearGradient(x - 18, y - 12, x + 18, y + 15)
  boxGradient.addColorStop(0, '#2a0a0a')
  boxGradient.addColorStop(0.5, '#1a0505')
  boxGradient.addColorStop(1, '#0a0000')
  ctx.fillStyle = boxGradient
  ctx.fillRect(x - 18, y - 12 - bounce, 36, 30)

  // Lid
  ctx.fillStyle = '#3a0a0a'
  ctx.fillRect(x - 20, y - 18 - bounce, 40, 10)

  // Ribbon vertical
  const ribbonGradient = ctx.createLinearGradient(x - 3, 0, x + 3, 0)
  ribbonGradient.addColorStop(0, '#4a0000')
  ribbonGradient.addColorStop(0.5, '#6a0000')
  ribbonGradient.addColorStop(1, '#4a0000')
  ctx.fillStyle = ribbonGradient
  ctx.fillRect(x - 3, y - 18 - bounce, 6, 48)

  // Ribbon horizontal
  ctx.fillRect(x - 18, y + 2 - bounce, 36, 6)

  // Bow
  ctx.fillStyle = '#6a0000'
  ctx.beginPath()
  ctx.ellipse(x - 8, y - 20 - bounce, 8, 5, -0.3, 0, Math.PI * 2)
  ctx.ellipse(x + 8, y - 20 - bounce, 8, 5, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Evil face
  ctx.fillStyle = '#ff0000'
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.arc(x - 7, y - 2 - bounce, 3, 0, Math.PI * 2)
  ctx.arc(x + 7, y - 2 - bounce, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Evil grin
  ctx.strokeStyle = '#ff0000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y + 10 - bounce, 8, 0.1 * Math.PI, 0.9 * Math.PI)
  ctx.stroke()

  // Teeth
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x - 6 + i * 4, y + 10 - bounce, 3, 4)
  }
}

function drawDemonReindeer(ctx, x, y, angle, time) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  const breathe = Math.sin(time * 0.008) * 2

  // Body
  const bodyGradient = ctx.createRadialGradient(-5, 0, 0, 0, 0, 25)
  bodyGradient.addColorStop(0, '#3a2020')
  bodyGradient.addColorStop(1, '#1a0a0a')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.ellipse(0, 0, 24 + breathe, 16, 0, 0, Math.PI * 2)
  ctx.fill()

  // Head
  ctx.beginPath()
  ctx.ellipse(22, -6, 14, 11, 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Demon horns with glow
  ctx.fillStyle = '#0a0000'
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 5
  ctx.beginPath()
  ctx.moveTo(18, -16)
  ctx.quadraticCurveTo(10, -40, 15, -38)
  ctx.quadraticCurveTo(20, -35, 22, -18)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(28, -16)
  ctx.quadraticCurveTo(35, -40, 32, -38)
  ctx.quadraticCurveTo(28, -35, 30, -18)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0

  // Glowing red nose
  ctx.fillStyle = '#ff0000'
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 20
  ctx.beginPath()
  ctx.arc(36, -6, 6, 0, Math.PI * 2)
  ctx.fill()

  // Evil eye
  ctx.beginPath()
  ctx.arc(26, -10, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Legs
  ctx.strokeStyle = '#2a1a1a'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-12, 12)
  ctx.lineTo(-14, 28)
  ctx.moveTo(8, 12)
  ctx.lineTo(10, 28)
  ctx.stroke()

  // Hooves
  ctx.fillStyle = '#1a0a0a'
  ctx.fillRect(-18, 26, 8, 5)
  ctx.fillRect(6, 26, 8, 5)

  ctx.restore()
}

function drawIceWraith(ctx, x, y, time) {
  const float = Math.sin(time * 0.006) * 5
  const pulse = Math.sin(time * 0.01) * 0.2 + 0.8

  // Ghostly body
  ctx.fillStyle = `rgba(100, 150, 200, ${0.4 * pulse})`
  ctx.shadowColor = '#4488ff'
  ctx.shadowBlur = 25
  ctx.beginPath()
  ctx.moveTo(x, y - 28 + float)
  ctx.bezierCurveTo(x + 22, y - 22 + float, x + 22, y + 12, x + 18, y + 28)
  ctx.bezierCurveTo(x + 12, y + 22, x + 6, y + 28, x, y + 22)
  ctx.bezierCurveTo(x - 6, y + 28, x - 12, y + 22, x - 18, y + 28)
  ctx.bezierCurveTo(x - 22, y + 12, x - 22, y - 22 + float, x, y - 28 + float)
  ctx.fill()

  // Inner glow
  ctx.fillStyle = `rgba(150, 200, 255, ${0.3 * pulse})`
  ctx.beginPath()
  ctx.ellipse(x, y - 5 + float, 12, 18, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Eyes
  ctx.fillStyle = '#00ffff'
  ctx.shadowColor = '#00ffff'
  ctx.shadowBlur = 15
  ctx.beginPath()
  ctx.arc(x - 7, y - 10 + float, 5, 0, Math.PI * 2)
  ctx.arc(x + 7, y - 10 + float, 5, 0, Math.PI * 2)
  ctx.fill()

  // Eye pupils
  ctx.fillStyle = '#000066'
  ctx.beginPath()
  ctx.arc(x - 6, y - 10 + float, 2, 0, Math.PI * 2)
  ctx.arc(x + 8, y - 10 + float, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Ice particles
  ctx.fillStyle = 'rgba(200, 230, 255, 0.8)'
  for (let i = 0; i < 5; i++) {
    const px = x + Math.sin(time * 0.01 + i * 1.2) * 25
    const py = y + Math.cos(time * 0.01 + i * 1.2) * 20
    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawDarkElf(ctx, x, y, angle, time) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle - Math.PI / 2)

  const sway = Math.sin(time * 0.01) * 0.1

  // Cloak
  ctx.fillStyle = '#0a0a1a'
  ctx.beginPath()
  ctx.moveTo(0, -25)
  ctx.quadraticCurveTo(-18, -10, -15, 25)
  ctx.lineTo(15, 25)
  ctx.quadraticCurveTo(18, -10, 0, -25)
  ctx.fill()

  // Body
  ctx.fillStyle = '#1a1a2a'
  ctx.beginPath()
  ctx.ellipse(0, 0, 14, 20, sway, 0, Math.PI * 2)
  ctx.fill()

  // Head
  ctx.fillStyle = '#4a4a5a'
  ctx.beginPath()
  ctx.arc(0, -24, 12, 0, Math.PI * 2)
  ctx.fill()

  // Pointed ears
  ctx.fillStyle = '#4a4a5a'
  ctx.beginPath()
  ctx.moveTo(-11, -28)
  ctx.lineTo(-22, -42)
  ctx.lineTo(-9, -32)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(11, -28)
  ctx.lineTo(22, -42)
  ctx.lineTo(9, -32)
  ctx.closePath()
  ctx.fill()

  // Evil eyes
  ctx.fillStyle = '#ff00ff'
  ctx.shadowColor = '#ff00ff'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.arc(-4, -26, 3, 0, Math.PI * 2)
  ctx.arc(4, -26, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Dark magic orb in hand
  ctx.fillStyle = 'rgba(128, 0, 128, 0.6)'
  ctx.shadowColor = '#ff00ff'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.arc(12, 5, 6 + Math.sin(time * 0.02) * 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.restore()
}

function drawKrampus(ctx, x, y, angle, time) {
  const breathe = Math.sin(time * 0.005) * 3
  const menace = Math.sin(time * 0.01) * 2

  // Massive body
  const bodyGradient = ctx.createRadialGradient(x, y, 0, x, y, 45)
  bodyGradient.addColorStop(0, '#3a1010')
  bodyGradient.addColorStop(1, '#1a0505')
  ctx.fillStyle = bodyGradient
  ctx.beginPath()
  ctx.ellipse(x, y + 10, 35 + breathe, 45, 0, 0, Math.PI * 2)
  ctx.fill()

  // Fur texture
  ctx.strokeStyle = '#2a0808'
  ctx.lineWidth = 2
  for (let i = 0; i < 12; i++) {
    const fx = x - 30 + i * 5
    ctx.beginPath()
    ctx.moveTo(fx, y - 20)
    ctx.lineTo(fx + Math.sin(i) * 3, y + 30)
    ctx.stroke()
  }

  // Head
  ctx.fillStyle = '#4a1515'
  ctx.beginPath()
  ctx.arc(x, y - 40, 24, 0, Math.PI * 2)
  ctx.fill()

  // Large horns with glow
  ctx.fillStyle = '#1a0000'
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 10
  ctx.beginPath()
  ctx.moveTo(x - 18, y - 55)
  ctx.quadraticCurveTo(x - 35, y - 95, x - 25, y - 90)
  ctx.quadraticCurveTo(x - 15, y - 85, x - 12, y - 55)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + 18, y - 55)
  ctx.quadraticCurveTo(x + 35, y - 95, x + 25, y - 90)
  ctx.quadraticCurveTo(x + 15, y - 85, x + 12, y - 55)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0

  // Burning eyes
  ctx.fillStyle = '#ff4400'
  ctx.shadowColor = '#ff4400'
  ctx.shadowBlur = 25
  ctx.beginPath()
  ctx.arc(x - 10, y - 45 + menace, 6, 0, Math.PI * 2)
  ctx.arc(x + 10, y - 45 + menace, 6, 0, Math.PI * 2)
  ctx.fill()

  // Eye flames
  ctx.fillStyle = '#ffcc00'
  ctx.beginPath()
  ctx.arc(x - 10, y - 45 + menace, 3, 0, Math.PI * 2)
  ctx.arc(x + 10, y - 45 + menace, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0

  // Fanged mouth
  ctx.fillStyle = '#0a0000'
  ctx.beginPath()
  ctx.arc(x, y - 28, 12, 0, Math.PI)
  ctx.fill()

  // Fangs
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(x - 8, y - 28)
  ctx.lineTo(x - 6, y - 18)
  ctx.lineTo(x - 4, y - 28)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + 4, y - 28)
  ctx.lineTo(x + 6, y - 18)
  ctx.lineTo(x + 8, y - 28)
  ctx.fill()

  // Claws
  ctx.strokeStyle = '#2a0a0a'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - 35, y)
  ctx.lineTo(x - 55, y + 25)
  ctx.moveTo(x + 35, y)
  ctx.lineTo(x + 55, y + 25)
  ctx.stroke()

  // Claw tips
  ctx.fillStyle = '#1a0a0a'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(x - 55 + i * 5, y + 25)
    ctx.lineTo(x - 53 + i * 5, y + 35)
    ctx.lineTo(x - 51 + i * 5, y + 25)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x + 45 + i * 5, y + 25)
    ctx.lineTo(x + 47 + i * 5, y + 35)
    ctx.lineTo(x + 49 + i * 5, y + 25)
    ctx.fill()
  }

  // Chains
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x - 20, y + 40)
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(x - 20 + i * 8, y + 45 + (i % 2) * 5)
  }
  ctx.stroke()
}

export function drawParticle(ctx, particle) {
  const sprite = getParticleSprite(particle.color, particle.size)
  ctx.globalAlpha = particle.life
  ctx.drawImage(sprite, particle.x - sprite.width/2, particle.y - sprite.height/2)
  ctx.globalAlpha = 1
}

export function drawExpOrb(ctx, orb, time = 0) {
  const sprite = getOrbSprite()
  const scale = 0.8 + Math.sin(time * 0.01 + orb.x) * 0.1
  ctx.drawImage(sprite, orb.x - 12 * scale, orb.y - 12 * scale, 24 * scale, 24 * scale)
}

export function drawItem(ctx, item, time = 0) {
  const float = Math.sin(time * 0.008 + item.x) * 3
  const pulse = Math.sin(time * 0.01) * 0.2 + 1

  ctx.save()
  ctx.translate(item.x, item.y + float)

  switch (item.type) {
    case 'health':
      // Heart
      ctx.fillStyle = '#ff4444'
      ctx.shadowColor = '#ff0000'
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.moveTo(0, 5)
      ctx.bezierCurveTo(-10, -5, -10, -12, 0, -8)
      ctx.bezierCurveTo(10, -12, 10, -5, 0, 5)
      ctx.fill()
      ctx.shadowBlur = 0
      break

    case 'power':
      // Star
      ctx.fillStyle = '#ffcc00'
      ctx.shadowColor = '#ffcc00'
      ctx.shadowBlur = 15
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const r = i % 2 === 0 ? 12 * pulse : 6
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
      }
      ctx.closePath()
      ctx.fill()
      ctx.shadowBlur = 0
      break

    case 'bomb':
      // Bomb
      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.arc(0, 2, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#666'
      ctx.fillRect(-3, -12, 6, 8)
      ctx.strokeStyle = '#ff6600'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -12)
      ctx.quadraticCurveTo(5, -18, 3, -22)
      ctx.stroke()
      ctx.fillStyle = '#ff4400'
      ctx.beginPath()
      ctx.arc(3, -22, 4, 0, Math.PI * 2)
      ctx.fill()
      break
  }

  ctx.restore()
}

export function drawCombo(ctx, combo, x, y, time) {
  if (combo < 2) return

  const scale = Math.min(1 + combo * 0.05, 2)
  const shake = combo > 10 ? Math.sin(time * 0.05) * 2 : 0

  ctx.save()
  ctx.translate(x + shake, y)
  ctx.scale(scale, scale)

  ctx.font = 'bold 16px Courier New'
  ctx.textAlign = 'center'

  // Glow effect
  ctx.shadowColor = combo > 20 ? '#ffcc00' : combo > 10 ? '#ff6600' : '#ff4444'
  ctx.shadowBlur = 20

  ctx.fillStyle = combo > 20 ? '#ffcc00' : combo > 10 ? '#ff6600' : '#ff4444'
  ctx.fillText(`${combo} COMBO!`, 0, 0)

  ctx.shadowBlur = 0
  ctx.restore()
}

export function drawWaveAnnouncement(ctx, wave, width, height, alpha) {
  ctx.save()
  ctx.globalAlpha = alpha

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(0, height / 2 - 50, width, 100)

  ctx.font = 'bold 36px Courier New'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ff4444'
  ctx.shadowColor = '#ff0000'
  ctx.shadowBlur = 20
  ctx.fillText(`WAVE ${wave}`, width / 2, height / 2 + 10)

  ctx.shadowBlur = 0
  ctx.restore()
}

export function drawDashEffect(ctx, x, y, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle + Math.PI)

  const gradient = ctx.createLinearGradient(0, 0, 60, 0)
  gradient.addColorStop(0, 'rgba(255, 100, 100, 0.6)')
  gradient.addColorStop(1, 'transparent')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(0, -15)
  ctx.lineTo(60, 0)
  ctx.lineTo(0, 15)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
