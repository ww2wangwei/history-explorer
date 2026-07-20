/**
 * audioEngine — 程序化音效引擎
 *
 * 用 Web Audio API 实时合成所有音效，零外部资源依赖。
 * - 穿越音效：频率扫描 + 噪声
 * - 场景 BGM：低频嗡鸣 + 氛围合成
 * - UI 音：轻微正弦波
 *
 * 用法：
 *   audioEngine.start()         // 首次用户交互后调用解锁音频上下文
 *   audioEngine.playTimeTravel() // 触发穿越音效
 *   audioEngine.playSceneBGM(mood) // 切换场景背景音
 *   audioEngine.stopBGM()
 *   audioEngine.playClick()
 *   audioEngine.setMuted(bool)
 *   audioEngine.setVolume(0..1)
 */

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private bgmNodes: AudioNode[] = []
  private bgmInterval: number | null = null
  private muted = false
  private volume = 0.4

  /** 首次用户交互后调用（浏览器 autoplay 政策） */
  start() {
    if (this.ctx) return
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.volume
      this.masterGain.connect(this.ctx.destination)

      this.bgmGain = this.ctx.createGain()
      this.bgmGain.gain.value = 0.3
      this.bgmGain.connect(this.masterGain)

      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.value = 0.5
      this.sfxGain.connect(this.masterGain)
    } catch (e) {
      console.warn('Web Audio API not available:', e)
    }
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.masterGain) this.masterGain.gain.value = m ? 0 : this.volume
  }
  isMuted() { return this.muted }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.masterGain && !this.muted) this.masterGain.gain.value = this.volume
  }
  getVolume() { return this.volume }

  private ensure() {
    if (!this.ctx) this.start()
    if (!this.ctx) return false
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return true
  }

  // ============ 穿越音效（一次性）============
  /** 时空穿越：高频扫描 + 噪声 + 失真感 */
  playTimeTravel() {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const duration = 1.4

    // 1. 频率扫描：从 100Hz 升到 1200Hz 再降
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(100, now)
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.7)
    osc.frequency.exponentialRampToValueAtTime(80, now + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.6, now + 0.1)
    gain.gain.linearRampToValueAtTime(0.6, now + 0.9)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(now)
    osc.stop(now + duration)

    // 2. 噪声层（白噪声 → 时空感）
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0, now)
    noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.2)
    noiseGain.gain.linearRampToValueAtTime(0, now + duration)
    // 滤波让噪声更"风声"
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2000, now)
    filter.frequency.exponentialRampToValueAtTime(500, now + duration)
    filter.Q.value = 1
    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.sfxGain)
    noise.start(now)
    noise.stop(now + duration)
  }

  // ============ 场景 BGM（循环）============
  /**
   * 启动场景背景音乐
   * mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant'
   */
  playSceneBGM(mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' = 'tense') {
    this.stopBGM()
    if (!this.ensure() || !this.ctx || !this.bgmGain) return
    const ctx = this.ctx

    // 1. 低频底鼓（缓慢脉冲）
    const droneOsc = ctx.createOscillator()
    const droneFreq = mood === 'mysterious' ? 55 : mood === 'epic' ? 65 : mood === 'triumphant' ? 73 : mood === 'calm' ? 50 : 60
    droneOsc.type = 'sine'
    droneOsc.frequency.value = droneFreq
    const droneGain = ctx.createGain()
    droneGain.gain.value = mood === 'epic' ? 0.15 : mood === 'triumphant' ? 0.13 : 0.10
    droneOsc.connect(droneGain)
    droneGain.connect(this.bgmGain)
    droneOsc.start()
    this.bgmNodes.push(droneOsc, droneGain)

    // 2. 高频氛围（缓慢 LFO 调制）
    const padOsc = ctx.createOscillator()
    padOsc.type = mood === 'mysterious' ? 'triangle' : 'sine'
    padOsc.frequency.value = droneFreq * 2
    const padGain = ctx.createGain()
    padGain.gain.value = 0
    // 缓慢呼吸（lfo）
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.15  // 极慢
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.04
    lfo.connect(lfoGain)
    lfoGain.connect(padGain.gain)
    padOsc.connect(padGain)
    padGain.connect(this.bgmGain)
    padOsc.start()
    lfo.start()
    this.bgmNodes.push(padOsc, padGain, lfo, lfoGain)

    // 3. 节奏脉冲（如果 epic/triumphant）
    if (mood === 'epic' || mood === 'tense' || mood === 'triumphant') {
      const beatInterval = mood === 'triumphant' ? 0.5 : 0.8
      this.bgmInterval = window.setInterval(() => {
        if (!this.ctx || !this.bgmGain) return
        const beatOsc = this.ctx.createOscillator()
        beatOsc.type = 'sine'
        beatOsc.frequency.value = mood === 'triumphant' ? 100 : 80
        const beatGain = this.ctx.createGain()
        const t = this.ctx.currentTime
        beatGain.gain.setValueAtTime(0, t)
        beatGain.gain.linearRampToValueAtTime(mood === 'tense' ? 0.18 : 0.12, t + 0.02)
        beatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
        beatOsc.connect(beatGain)
        beatGain.connect(this.bgmGain)
        beatOsc.start(t)
        beatOsc.stop(t + 0.3)
      }, beatInterval * 1000)
    }
  }

  stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval)
      this.bgmInterval = null
    }
    this.bgmNodes.forEach(n => {
      try {
        if ('stop' in n && typeof (n as any).stop === 'function') (n as any).stop()
      } catch { /* noop */ }
      try {
        if ('disconnect' in n && typeof (n as any).disconnect === 'function') (n as any).disconnect()
      } catch { /* noop */ }
    })
    this.bgmNodes = []
  }

  // ============ UI 音效（短促）============
  /** 轻微点击音（选项） */
  playClick() {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(now)
    osc.stop(now + 0.12)
  }

  /** 翻页/章节切换音（更深） */
  playPageTurn() {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return
    const ctx = this.ctx
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(now)
    osc.stop(now + 0.32)
  }

  /** 结局音（辉煌或失败） */
  playEnding(isWin: boolean) {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return
    const ctx = this.ctx
    const now = ctx.currentTime

    if (isWin) {
      // 上升大三和弦
      const notes = [261.6, 329.6, 392.0, 523.3]  // C E G C
      const sfxGain = this.sfxGain
      if (!sfxGain) return
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        const gain = ctx.createGain()
        const t = now + i * 0.15
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.15, t + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
        osc.connect(gain)
        gain.connect(sfxGain)
        osc.start(t)
        osc.stop(t + 0.6)
      })
    } else {
      // 下降音 + 失谐
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(60, now + 1.2)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3)
      osc.connect(gain)
      gain.connect(this.sfxGain)
      osc.start(now)
      osc.stop(now + 1.3)
    }
  }
}

export const audioEngine = new AudioEngine()

/** 根据剧本/场景推断 BGM mood */
export function pickBGMForScenario(era: string, year: number): 'tense' | 'epic' | 'mysterious' | 'triumphant' {
  // 中国古代 + 战争 → epic
  if (['唐', '宋', '元', '明', '清', '三国', '汉', '秦'].includes(era)) return 'epic'
  // 加冕/登基 → triumphant
  if (year > 1500 && year < 1900) return 'triumphant'
  return 'mysterious'
}

export function pickBGMForScene(sceneTitle: string): 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' {
  const t = sceneTitle.toLowerCase()
  if (/登基|加冕|大胜|胜利|凯旋|传奇/.test(sceneTitle)) return 'triumphant'
  if (/犹豫|失败|死|流放|事败|火烧/.test(sceneTitle)) return 'tense'
  if (/密议|深夜|等待|黎明/.test(sceneTitle)) return 'mysterious'
  if (/对峙|逼宫|玄武门|赤壁|决战/.test(sceneTitle)) return 'epic'
  return 'tense'
}
