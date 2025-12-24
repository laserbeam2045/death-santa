<template>
  <div class="hud">
    <div class="hud-left">
      <div class="score">SCORE: {{ score.toLocaleString() }}</div>
      <div class="level">LV.{{ level }}</div>
      <div class="wave">WAVE {{ wave }}</div>
    </div>
    <div class="hud-center">
      <div class="exp-bar">
        <div class="exp-fill" :style="{ width: expPercent + '%' }"></div>
        <span class="exp-text">EXP {{ exp }} / {{ expToNext }}</span>
      </div>
      <div class="power-indicator" v-if="powerUp">POWER UP!</div>
    </div>
    <div class="hud-right">
      <div class="health">
        <span v-for="i in maxHealth" :key="i" class="heart" :class="{ empty: i > health }">
          {{ i <= health ? '♦' : '◇' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  expToNext: { type: Number, default: 100 },
  health: { type: Number, default: 5 },
  maxHealth: { type: Number, default: 5 },
  wave: { type: Number, default: 1 },
  powerUp: { type: Boolean, default: false }
})

const expPercent = computed(() => (props.exp / props.expToNext) * 100)
</script>

<style scoped>
.hud {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #8b0000;
  font-size: 12px;
  text-shadow: 0 0 8px #ff0000;
  z-index: 10;
  pointer-events: none;
}

.hud-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.score {
  font-size: 14px;
  font-weight: bold;
  color: #ff4444;
}

.level {
  color: #ffcc00;
  text-shadow: 0 0 8px #ffcc00;
  font-weight: bold;
}

.wave {
  color: #aaaaff;
  text-shadow: 0 0 8px #6666ff;
  font-size: 11px;
}

.hud-center {
  flex: 1;
  max-width: 140px;
  margin: 0 8px;
}

.exp-bar {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #4a4a4a;
  border-radius: 3px;
  height: 14px;
  position: relative;
  overflow: hidden;
}

.exp-fill {
  background: linear-gradient(to right, #004400, #00aa00);
  height: 100%;
  transition: width 0.2s ease;
  box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
}

.exp-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 9px;
  color: #ffffff;
  text-shadow: 1px 1px 2px #000;
  white-space: nowrap;
}

.power-indicator {
  text-align: center;
  margin-top: 4px;
  color: #ffcc00;
  font-size: 10px;
  font-weight: bold;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.6; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1.05); }
}

.hud-right {
  text-align: right;
}

.health {
  display: flex;
  gap: 1px;
  flex-wrap: wrap;
  justify-content: flex-end;
  max-width: 100px;
}

.heart {
  color: #ff0000;
  text-shadow: 0 0 6px #ff0000;
  font-size: 14px;
}

.heart.empty {
  color: #333;
  text-shadow: none;
}
</style>
