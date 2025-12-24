export const GAME_WIDTH = 400
export const GAME_HEIGHT = 700

export const PLAYER_CONFIG = {
  radius: 20,
  baseSpeed: 4,
  baseHealth: 5,
  invincibleTime: 1500,
  dashSpeed: 20,
  dashDuration: 150,
  dashCooldown: 1000
}

// Bullet patterns: normal, wave, spiral, homing, burst
export const WEAPON_TYPES = {
  candyCane: {
    id: 'candyCane',
    name: '呪われたキャンディケイン',
    description: '基本武器。前方に発射',
    damage: 1,
    fireRate: 200,
    bulletSpeed: 12,
    bulletCount: 1,
    spread: 0,
    pattern: 'normal',
    color: '#ff4444',
    unlockLevel: 1
  },
  waveShot: {
    id: 'waveShot',
    name: '波動キャンディ',
    description: '波状に揺れながら飛ぶ',
    damage: 1.2,
    fireRate: 180,
    bulletSpeed: 10,
    bulletCount: 1,
    spread: 0,
    pattern: 'wave',
    waveAmp: 30,
    waveFreq: 0.15,
    color: '#ff66aa',
    unlockLevel: 2
  },
  tripleShot: {
    id: 'tripleShot',
    name: '三連キャンディ',
    description: '3方向に同時発射',
    damage: 1,
    fireRate: 280,
    bulletSpeed: 11,
    bulletCount: 3,
    spread: 0.4,
    pattern: 'normal',
    color: '#ff6666',
    unlockLevel: 3
  },
  spiralShot: {
    id: 'spiralShot',
    name: '螺旋キャンディ',
    description: '螺旋状に広がる弾',
    damage: 0.8,
    fireRate: 100,
    bulletSpeed: 8,
    bulletCount: 2,
    spread: 0,
    pattern: 'spiral',
    spiralSpeed: 0.2,
    color: '#aa66ff',
    unlockLevel: 4
  },
  holyFire: {
    id: 'holyFire',
    name: '聖なる炎',
    description: '敵を追尾する貫通弾',
    damage: 2,
    fireRate: 350,
    bulletSpeed: 9,
    bulletCount: 1,
    spread: 0,
    pattern: 'homing',
    homingStrength: 0.03,
    piercing: true,
    color: '#00ffff',
    unlockLevel: 5
  },
  burstCane: {
    id: 'burstCane',
    name: 'バーストキャンディ',
    description: '3連バースト射撃',
    damage: 1,
    fireRate: 400,
    bulletSpeed: 14,
    bulletCount: 1,
    spread: 0.1,
    pattern: 'burst',
    burstCount: 3,
    burstDelay: 50,
    color: '#ffaa00',
    unlockLevel: 6
  },
  spiritBell: {
    id: 'spiritBell',
    name: '死霊のベル',
    description: '全方位に波動弾',
    damage: 1,
    fireRate: 600,
    bulletSpeed: 7,
    bulletCount: 8,
    spread: Math.PI * 2,
    pattern: 'wave',
    waveAmp: 15,
    waveFreq: 0.1,
    color: '#ffcc00',
    unlockLevel: 7
  },
  dualSpiral: {
    id: 'dualSpiral',
    name: '双螺旋キャンディ',
    description: '2方向に螺旋弾',
    damage: 1.2,
    fireRate: 150,
    bulletSpeed: 10,
    bulletCount: 2,
    spread: Math.PI,
    pattern: 'spiral',
    spiralSpeed: 0.15,
    color: '#ff88ff',
    unlockLevel: 8
  },
  snowStorm: {
    id: 'snowStorm',
    name: '暗黒吹雪',
    description: '全方位に追尾弾の嵐',
    damage: 0.8,
    fireRate: 800,
    bulletSpeed: 6,
    bulletCount: 12,
    spread: Math.PI * 2,
    pattern: 'homing',
    homingStrength: 0.02,
    color: '#aaaaff',
    unlockLevel: 10
  }
}

// Smaller enemies, more of them, less HP/EXP
export const ENEMY_TYPES = {
  snowman: {
    id: 'snowman',
    name: '堕落した雪だるま',
    health: 1,
    speed: 1.5,
    damage: 1,
    score: 50,
    exp: 5,
    radius: 12,
    spawnWeight: 15,
    canShoot: false
  },
  evilGift: {
    id: 'evilGift',
    name: '呪われたプレゼント',
    health: 1,
    speed: 1.3,
    damage: 1,
    score: 60,
    exp: 6,
    radius: 10,
    spawnWeight: 12,
    canShoot: false
  },
  demonReindeer: {
    id: 'demonReindeer',
    name: '悪魔のトナカイ',
    health: 2,
    speed: 2.5,
    damage: 1,
    score: 80,
    exp: 8,
    radius: 14,
    spawnWeight: 8,
    canShoot: false
  },
  iceWraith: {
    id: 'iceWraith',
    name: '氷の亡霊',
    health: 1,
    speed: 1.8,
    damage: 1,
    score: 70,
    exp: 7,
    radius: 11,
    spawnWeight: 6,
    minLevel: 3,
    canShoot: true,
    shootRate: 3000,
    bulletSpeed: 3.5
  },
  darkElf: {
    id: 'darkElf',
    name: '闇のエルフ',
    health: 2,
    speed: 2.0,
    damage: 1,
    score: 100,
    exp: 10,
    radius: 13,
    spawnWeight: 5,
    minLevel: 5,
    canShoot: true,
    shootRate: 2500,
    bulletSpeed: 4
  },
  krampus: {
    id: 'krampus',
    name: 'クランプス',
    health: 50,
    speed: 1.0,
    damage: 2,
    score: 500,
    exp: 100,
    radius: 30,
    spawnWeight: 0,
    minLevel: 1,
    isBoss: true,
    canShoot: true,
    shootRate: 1800,
    bulletSpeed: 3.5,
    bulletCount: 8
  }
}

export const ITEM_TYPES = {
  health: {
    id: 'health',
    name: '魂の結晶',
    dropRate: 0.08,
    effect: 'heal',
    value: 1
  },
  power: {
    id: 'power',
    name: '力の星',
    dropRate: 0.05,
    effect: 'power',
    duration: 8000,
    value: 2
  },
  bomb: {
    id: 'bomb',
    name: '聖なる爆弾',
    dropRate: 0.03,
    effect: 'bomb',
    value: 50
  }
}

export const WAVE_CONFIG = {
  baseEnemies: 10,
  enemiesPerWave: 5,
  spawnInterval: 200,
  timeBetweenWaves: 2500,
  bossWaveInterval: 5
}

export const LEVEL_CONFIG = {
  baseExp: 150,
  expMultiplier: 1.4,
  healthPerLevel: 1,
  damagePerLevel: 0.08,
  speedPerLevel: 0.015
}

export const COMBO_CONFIG = {
  timeout: 1500,
  bonusMultiplier: 0.1
}
