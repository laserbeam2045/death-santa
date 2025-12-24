<template>
  <div class="game-over-screen">
    <h1>GAME OVER</h1>
    <p class="subtitle">闇に飲まれた...</p>

    <div class="stats">
      <div class="stat-row">
        <span class="label">SCORE</span>
        <span class="value">{{ score.toLocaleString() }}</span>
      </div>
      <div class="stat-row">
        <span class="label">WAVE</span>
        <span class="value">{{ wave }}</span>
      </div>
      <div class="stat-row">
        <span class="label">LEVEL</span>
        <span class="value">{{ level }}</span>
      </div>
      <div class="stat-row">
        <span class="label">KILLS</span>
        <span class="value">{{ kills }}</span>
      </div>
      <div class="stat-row highlight">
        <span class="label">MAX COMBO</span>
        <span class="value combo">{{ maxCombo }}</span>
      </div>
    </div>

    <button class="btn" @click="$emit('restart')">RETRY</button>
  </div>
</template>

<script setup>
defineProps({
  score: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  kills: { type: Number, default: 0 },
  wave: { type: Number, default: 1 },
  maxCombo: { type: Number, default: 0 }
})

defineEmits(['restart'])
</script>

<style scoped>
.game-over-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(5, 0, 0, 0.95);
  z-index: 100;
}

h1 {
  color: #8b0000;
  font-size: 2.5em;
  text-shadow: 0 0 20px #ff0000, 0 0 40px #8b0000;
  margin-bottom: 10px;
  animation: flicker 2s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.subtitle {
  color: #666;
  font-size: 1em;
  margin-bottom: 25px;
}

.stats {
  background: linear-gradient(to bottom, rgba(30, 5, 5, 0.9), rgba(15, 0, 0, 0.9));
  border: 2px solid #4a0000;
  border-radius: 8px;
  padding: 20px 35px;
  margin-bottom: 25px;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.3);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 50px;
  margin: 8px 0;
  padding: 4px 0;
  border-bottom: 1px solid rgba(100, 0, 0, 0.3);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row.highlight {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #4a0000;
  border-bottom: none;
}

.label {
  color: #888;
  font-size: 0.9em;
}

.value {
  color: #ff4444;
  text-shadow: 0 0 8px #ff0000;
  font-weight: bold;
  font-size: 1.1em;
}

.value.combo {
  color: #ffcc00;
  text-shadow: 0 0 10px #ffcc00;
}

.btn {
  background: linear-gradient(to bottom, #4a0000, #2a0000);
  border: 2px solid #8b0000;
  color: #ff4444;
  padding: 14px 55px;
  font-size: 1.2em;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  text-shadow: 0 0 10px #ff0000;
  box-shadow: 0 0 25px rgba(139, 0, 0, 0.5);
  transition: all 0.3s;
  border-radius: 4px;
}

.btn:hover,
.btn:active {
  background: linear-gradient(to bottom, #6a0000, #3a0000);
  box-shadow: 0 0 35px rgba(255, 0, 0, 0.7);
  transform: scale(1.05);
}
</style>
