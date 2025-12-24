<template>
  <div class="canvas-container">
    <canvas
      ref="canvasRef"
      :class="{ paused: paused }"
      @touchstart.prevent="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @contextmenu.prevent
    ></canvas>

    <!-- Virtual Joysticks -->
    <div class="joystick-zone left" v-if="gameRunning && !paused">
      <div class="joystick-label">MOVE</div>
      <div
        class="joystick-base"
        :style="{ opacity: leftStick.active ? 1 : 0.4 }"
      >
        <div
          class="joystick-stick"
          :style="{
            transform: `translate(${leftStick.dx}px, ${leftStick.dy}px)`
          }"
        ></div>
      </div>
    </div>

    <div class="joystick-zone right" v-if="gameRunning && !paused">
      <div class="joystick-label">SHOOT</div>
      <div
        class="joystick-base"
        :style="{ opacity: rightStick.active ? 1 : 0.4 }"
      >
        <div
          class="joystick-stick"
          :class="{ shooting: rightStick.active }"
          :style="{
            transform: `translate(${rightStick.dx}px, ${rightStick.dy}px)`
          }"
        ></div>
      </div>
    </div>

    <!-- Dash button -->
    <button
      v-if="gameRunning && !paused"
      class="dash-button"
      :class="{ ready: dashReady, cooling: !dashReady }"
      @touchstart.prevent="$emit('dash')"
      @mousedown.prevent="$emit('dash')"
    >
      DASH
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/gameConfig.js'
import {
  drawBackground, drawPlayer, drawBullet, drawEnemyBullet,
  drawEnemy, drawParticle, drawExpOrb, drawItem,
  drawCombo, drawWaveAnnouncement, drawDashEffect, getScreenShake
} from '../utils/draw.js'

const props = defineProps({
  player: { type: Object, required: true },
  bullets: { type: Array, required: true },
  enemyBullets: { type: Array, required: true },
  enemies: { type: Array, required: true },
  particles: { type: Array, required: true },
  expOrbs: { type: Array, required: true },
  items: { type: Array, required: true },
  snowflakes: { type: Array, required: true },
  gameRunning: { type: Boolean, default: false },
  paused: { type: Boolean, default: false },
  dashReady: { type: Boolean, default: true },
  dashCooldown: { type: Number, default: 0 },
  combo: { type: Number, default: 0 },
  wave: { type: Number, default: 1 },
  waveAnnouncement: { type: Number, default: 0 },
  isDashing: { type: Boolean, default: false },
  dashAngle: { type: Number, default: 0 },
  gameTime: { type: Number, default: 0 }
})

const emit = defineEmits(['move', 'shoot', 'stopMove', 'stopShoot', 'dash'])

const canvasRef = ref(null)
let ctx = null
let animationId = null

const JOYSTICK_RADIUS = 50

const leftStick = reactive({
  active: false,
  touchId: null,
  centerX: 0,
  centerY: 0,
  dx: 0,
  dy: 0
})

const rightStick = reactive({
  active: false,
  touchId: null,
  centerX: 0,
  centerY: 0,
  dx: 0,
  dy: 0
})

function getCanvasRect() {
  return canvasRef.value.getBoundingClientRect()
}

function isLeftSide(clientX) {
  const rect = getCanvasRect()
  return clientX < rect.left + rect.width / 2
}

function updateStick(stick, clientX, clientY) {
  const dx = clientX - stick.centerX
  const dy = clientY - stick.centerY
  const dist = Math.sqrt(dx * dx + dy * dy)
  const maxDist = JOYSTICK_RADIUS

  if (dist > maxDist) {
    stick.dx = (dx / dist) * maxDist
    stick.dy = (dy / dist) * maxDist
  } else {
    stick.dx = dx
    stick.dy = dy
  }

  return {
    x: stick.dx / maxDist,
    y: stick.dy / maxDist,
    angle: Math.atan2(dy, dx)
  }
}

function handleTouchStart(e) {
  if (!props.gameRunning || props.paused) return

  for (const touch of e.changedTouches) {
    const isLeft = isLeftSide(touch.clientX)

    if (isLeft && !leftStick.active) {
      leftStick.active = true
      leftStick.touchId = touch.identifier
      leftStick.centerX = touch.clientX
      leftStick.centerY = touch.clientY
      leftStick.dx = 0
      leftStick.dy = 0
    } else if (!isLeft && !rightStick.active) {
      rightStick.active = true
      rightStick.touchId = touch.identifier
      rightStick.centerX = touch.clientX
      rightStick.centerY = touch.clientY
      rightStick.dx = 0
      rightStick.dy = 0
    }
  }
}

function handleTouchMove(e) {
  if (!props.gameRunning || props.paused) return

  for (const touch of e.changedTouches) {
    if (touch.identifier === leftStick.touchId) {
      const input = updateStick(leftStick, touch.clientX, touch.clientY)
      emit('move', input.x, input.y)
    } else if (touch.identifier === rightStick.touchId) {
      const input = updateStick(rightStick, touch.clientX, touch.clientY)
      const magnitude = Math.sqrt(input.x * input.x + input.y * input.y)
      emit('shoot', input.angle, magnitude > 0.3)
    }
  }
}

function handleTouchEnd(e) {
  for (const touch of e.changedTouches) {
    if (touch.identifier === leftStick.touchId) {
      leftStick.active = false
      leftStick.touchId = null
      leftStick.dx = 0
      leftStick.dy = 0
      emit('stopMove')
    } else if (touch.identifier === rightStick.touchId) {
      rightStick.active = false
      rightStick.touchId = null
      rightStick.dx = 0
      rightStick.dy = 0
      emit('stopShoot')
    }
  }
}

function handleMouseDown(e) {
  if (!props.gameRunning || props.paused) return

  const isLeft = isLeftSide(e.clientX)

  if (isLeft) {
    leftStick.active = true
    leftStick.centerX = e.clientX
    leftStick.centerY = e.clientY
    leftStick.dx = 0
    leftStick.dy = 0
  } else {
    rightStick.active = true
    rightStick.centerX = e.clientX
    rightStick.centerY = e.clientY
    rightStick.dx = 0
    rightStick.dy = 0
  }
}

function handleMouseMove(e) {
  if (!props.gameRunning || props.paused) return

  if (leftStick.active && isLeftSide(leftStick.centerX)) {
    const input = updateStick(leftStick, e.clientX, e.clientY)
    emit('move', input.x, input.y)
  }

  if (rightStick.active && !isLeftSide(rightStick.centerX)) {
    const input = updateStick(rightStick, e.clientX, e.clientY)
    const magnitude = Math.sqrt(input.x * input.x + input.y * input.y)
    emit('shoot', input.angle, magnitude > 0.3)
  }
}

function handleMouseUp() {
  if (leftStick.active) {
    leftStick.active = false
    leftStick.dx = 0
    leftStick.dy = 0
    emit('stopMove')
  }

  if (rightStick.active) {
    rightStick.active = false
    rightStick.dx = 0
    rightStick.dy = 0
    emit('stopShoot')
  }
}

function render() {
  if (!ctx) return

  const time = props.gameTime

  // Get screen shake
  const shake = getScreenShake()

  ctx.save()
  ctx.translate(shake.x, shake.y)

  // Clear and draw background
  ctx.clearRect(-10, -10, GAME_WIDTH + 20, GAME_HEIGHT + 20)
  drawBackground(ctx, GAME_WIDTH, GAME_HEIGHT, props.snowflakes, time)

  // Draw items
  props.items.forEach(item => drawItem(ctx, item, time))

  // Draw exp orbs
  props.expOrbs.forEach(orb => drawExpOrb(ctx, orb, time))

  // Draw player bullets
  props.bullets.forEach(bullet => drawBullet(ctx, bullet, time))

  // Draw enemy bullets
  props.enemyBullets.forEach(bullet => drawEnemyBullet(ctx, bullet))

  // Draw enemies
  props.enemies.forEach(enemy => drawEnemy(ctx, enemy, time))

  // Draw particles
  props.particles.forEach(particle => drawParticle(ctx, particle))

  // Draw player
  if (props.gameRunning) {
    // Dash effect
    if (props.isDashing) {
      drawDashEffect(ctx, props.player.x, props.player.y, props.dashAngle)
    }
    drawPlayer(ctx, props.player, props.player.isInvincible, props.dashCooldown, time)
  }

  // Draw combo
  drawCombo(ctx, props.combo, GAME_WIDTH / 2, 100, time)

  // Draw wave announcement
  if (props.waveAnnouncement > 0) {
    drawWaveAnnouncement(ctx, props.wave, GAME_WIDTH, GAME_HEIGHT, props.waveAnnouncement)
  }

  ctx.restore()

  animationId = requestAnimationFrame(render)
}

function resizeCanvas() {
  if (!canvasRef.value) return
  const container = canvasRef.value.parentElement
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const scale = Math.min(containerWidth / GAME_WIDTH, containerHeight / GAME_HEIGHT)

  canvasRef.value.width = GAME_WIDTH
  canvasRef.value.height = GAME_HEIGHT
  canvasRef.value.style.width = (GAME_WIDTH * scale) + 'px'
  canvasRef.value.style.height = (GAME_HEIGHT * scale) + 'px'
}

onMounted(() => {
  ctx = canvasRef.value.getContext('2d')
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  render()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  background: #0a0a0a;
  max-width: 100%;
  max-height: 100%;
}

canvas.paused {
  pointer-events: none;
}

.joystick-zone {
  position: absolute;
  bottom: 30px;
  width: 120px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.joystick-zone.left {
  left: 15px;
}

.joystick-zone.right {
  right: 15px;
}

.joystick-label {
  color: rgba(139, 0, 0, 0.8);
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 5px;
  text-shadow: 0 0 8px #ff0000;
  letter-spacing: 2px;
}

.joystick-base {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(60, 10, 10, 0.6) 0%, rgba(30, 5, 5, 0.4) 100%);
  border: 3px solid rgba(139, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s, border-color 0.2s;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5);
}

.joystick-stick {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #aa2222, #4a0000);
  border: 2px solid #ff4444;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.1);
  transition: transform 0.05s ease-out;
}

.joystick-stick.shooting {
  background: radial-gradient(circle at 30% 30%, #ff4444, #aa0000);
  box-shadow: 0 0 25px rgba(255, 0, 0, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.2);
  border-color: #ffcc00;
}

.dash-button {
  position: absolute;
  bottom: 160px;
  right: 25px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4a0000, #1a0000);
  border: 3px solid #8b0000;
  color: #ff4444;
  font-size: 11px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
  transition: all 0.2s;
  text-shadow: 0 0 5px #ff0000;
}

.dash-button.ready {
  background: radial-gradient(circle at 30% 30%, #8b0000, #3a0000);
  border-color: #ff4444;
  box-shadow: 0 0 25px rgba(255, 0, 0, 0.6);
}

.dash-button.ready:active {
  transform: scale(0.9);
  box-shadow: 0 0 35px rgba(255, 0, 0, 0.8);
}

.dash-button.cooling {
  opacity: 0.5;
  border-color: #444;
  color: #666;
}
</style>
