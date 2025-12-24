<template>
  <div class="start-screen">
    <div class="title-container">
      <h1>DARK CHRISTMAS</h1>
      <p class="subtitle">― Santa's Revenge ―</p>
    </div>

    <p class="story">闇に堕ちた聖夜、復讐のサンタが目覚める</p>

    <button class="btn" @click="$emit('start')">START</button>

    <div class="instructions">
      <p class="section-title">【操作方法】</p>
      <div class="control-grid">
        <div class="control-item">
          <span class="control-key">左側ドラッグ</span>
          <span class="control-desc">移動</span>
        </div>
        <div class="control-item">
          <span class="control-key">右側ドラッグ</span>
          <span class="control-desc">射撃方向</span>
        </div>
        <div class="control-item">
          <span class="control-key">DASHボタン</span>
          <span class="control-desc">緊急回避</span>
        </div>
      </div>
      <p class="tips">敵を倒してレベルアップ！新武器を解禁しよう</p>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start'])
</script>

<style scoped>
.start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, rgba(30, 5, 5, 0.98), rgba(5, 0, 0, 0.98));
  z-index: 100;
}

.title-container {
  text-align: center;
  margin-bottom: 10px;
}

h1 {
  color: #8b0000;
  font-size: 2em;
  text-shadow: 0 0 20px #ff0000, 0 0 40px #8b0000, 0 0 60px #4a0000;
  margin-bottom: 5px;
  letter-spacing: 3px;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 0 20px #ff0000, 0 0 40px #8b0000; }
  to { text-shadow: 0 0 30px #ff0000, 0 0 60px #8b0000, 0 0 80px #4a0000; }
}

.subtitle {
  color: #666;
  font-size: 1em;
  letter-spacing: 5px;
}

.story {
  color: #555;
  font-size: 0.85em;
  margin-bottom: 35px;
  text-align: center;
  padding: 0 20px;
  font-style: italic;
}

.btn {
  background: linear-gradient(to bottom, #4a0000, #2a0000);
  border: 2px solid #8b0000;
  color: #ff4444;
  padding: 16px 60px;
  font-size: 1.4em;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  text-shadow: 0 0 10px #ff0000;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.6);
  transition: all 0.3s;
  border-radius: 4px;
  letter-spacing: 3px;
}

.btn:hover,
.btn:active {
  background: linear-gradient(to bottom, #6a0000, #3a0000);
  box-shadow: 0 0 40px rgba(255, 0, 0, 0.8);
  transform: scale(1.05);
}

.instructions {
  margin-top: 35px;
  padding: 15px 25px;
  background: rgba(20, 5, 5, 0.8);
  border: 1px solid #3a0000;
  border-radius: 8px;
}

.section-title {
  color: #8b0000;
  font-size: 0.9em;
  margin-bottom: 12px;
  text-align: center;
  letter-spacing: 2px;
}

.control-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-size: 0.85em;
}

.control-key {
  color: #aa6666;
}

.control-desc {
  color: #666;
}

.tips {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #3a0000;
  color: #555;
  font-size: 0.75em;
  text-align: center;
}
</style>
