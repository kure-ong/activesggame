export function playSound(scene: Phaser.Scene, key: string, config: Phaser.Types.Sound.SoundConfig = {}) {
  const sound = scene.sound.get(key) || scene.sound.add(key);
  sound.play(config);
}

// usage:
// playSound(this, 'clickSound'); 
// can pass options
// playSound(this, 'successSound', { volume: 0.5 });