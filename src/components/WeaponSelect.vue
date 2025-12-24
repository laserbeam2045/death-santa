<template>
  <div class="weapon-select" v-if="show">
    <h2>LEVEL UP!</h2>
    <p class="subtitle">武器を選択または強化</p>

    <div
      class="weapons-scroll"
      ref="scrollRef"
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
    >
      <div
        v-for="weapon in unlockedWeapons"
        :key="weapon.id"
        class="weapon-card"
        :class="{
          selected: weapon.id === currentWeaponId,
          maxed: !weapon.canUpgrade
        }"
      >
        <div class="weapon-header">
          <span class="weapon-name">{{ weapon.name }}</span>
          <span class="weapon-level">Lv.{{ weapon.level }}/{{ weapon.maxLevel }}</span>
        </div>

        <div class="weapon-desc">{{ weapon.description }}</div>

        <div class="weapon-stats">
          <div class="stat">
            <span class="stat-label">威力</span>
            <span class="stat-value">{{ weapon.damage.toFixed(1) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">連射</span>
            <span class="stat-value">{{ (1000 / weapon.fireRate).toFixed(1) }}/s</span>
          </div>
          <div class="stat">
            <span class="stat-label">弾数</span>
            <span class="stat-value">{{ weapon.bulletCount }}</span>
          </div>
        </div>

        <div class="weapon-actions">
          <button
            class="action-btn equip"
            :class="{ active: weapon.id === currentWeaponId }"
            @click.stop="selectWeapon(weapon.id)"
          >
            {{ weapon.id === currentWeaponId ? '装備中' : '装備' }}
          </button>
          <button
            v-if="weapon.canUpgrade"
            class="action-btn upgrade"
            @click.stop="upgradeWeapon(weapon.id)"
          >
            強化
          </button>
          <span v-else class="max-label">MAX</span>
        </div>

        <div class="level-bar">
          <div
            class="level-fill"
            :style="{ width: (weapon.level / weapon.maxLevel * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <button class="continue-btn" @click="$emit('continue')">戦闘に戻る</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  playerLevel: { type: Number, default: 1 },
  currentWeaponId: { type: String, default: 'candyCane' },
  unlockedWeapons: { type: Array, default: () => [] }
})

const emit = defineEmits(['continue', 'select', 'upgrade'])
const scrollRef = ref(null)

function selectWeapon(weaponId) {
  emit('select', weaponId)
}

function upgradeWeapon(weaponId) {
  emit('upgrade', weaponId)
}
</script>

<style scoped>
.weapon-select {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  padding: 10px;
  box-sizing: border-box;
}

h2 {
  color: #ffcc00;
  font-size: 1.6em;
  text-shadow: 0 0 20px #ffcc00;
  margin: 5px 0;
}

.subtitle {
  color: #888;
  font-size: 0.8em;
  margin-bottom: 8px;
}

.weapons-scroll {
  width: 100%;
  max-width: 340px;
  height: calc(100vh - 140px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y !important;
  overscroll-behavior: contain;
  padding: 5px;
  margin-bottom: 8px;
}

.weapon-card {
  background: linear-gradient(to bottom, rgba(40, 10, 10, 0.95), rgba(20, 5, 5, 0.95));
  border: 2px solid #4a0000;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
}

.weapon-card.selected {
  border-color: #ffcc00;
  box-shadow: 0 0 15px rgba(255, 204, 0, 0.3);
}

.weapon-card.maxed {
  border-color: #00aa00;
}

.weapon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.weapon-name {
  color: #ff6666;
  font-size: 0.95em;
  font-weight: bold;
}

.weapon-level {
  color: #ffcc00;
  font-size: 0.8em;
  font-weight: bold;
  text-shadow: 0 0 5px #ffcc00;
}

.weapon-desc {
  color: #888;
  font-size: 0.7em;
  margin-bottom: 6px;
}

.weapon-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  color: #666;
  font-size: 0.6em;
}

.stat-value {
  color: #ff8888;
  font-size: 0.8em;
  font-weight: bold;
}

.weapon-actions {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.action-btn {
  flex: 1;
  padding: 8px 10px;
  border: none;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.75em;
  font-weight: bold;
  cursor: pointer;
}

.action-btn.equip {
  background: linear-gradient(to bottom, #333, #222);
  color: #aaa;
  border: 1px solid #555;
}

.action-btn.equip.active {
  background: linear-gradient(to bottom, #4a4a00, #333300);
  color: #ffcc00;
  border-color: #ffcc00;
}

.action-btn.upgrade {
  background: linear-gradient(to bottom, #006600, #004400);
  color: #00ff00;
  border: 1px solid #00aa00;
}

.max-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ff00;
  font-size: 0.8em;
  font-weight: bold;
  text-shadow: 0 0 8px #00ff00;
}

.level-bar {
  height: 3px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 2px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(to right, #ffcc00, #ff8800);
  border-radius: 2px;
}

.continue-btn {
  background: linear-gradient(to bottom, #4a0000, #2a0000);
  border: 2px solid #8b0000;
  color: #ff4444;
  padding: 10px 35px;
  font-size: 1em;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  text-shadow: 0 0 10px #ff0000;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
  border-radius: 4px;
}
</style>
