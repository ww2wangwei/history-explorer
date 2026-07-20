/**
 * audioEngine — 程序化音效引擎 (v2 - 健壮版)
 *
 * 用 Web Audio API 实时合成所有音效，零外部资源依赖。
 *
 * 修复：
 * - start() 每次都尝试 resume ctx（处理 autoplay policy）
 * - 所有 BGM 用单次 envelope（避免包络/振荡器冲突）
 * - 低频+高频组合，让人耳能听到（不只 55Hz 极低频）
 * - 加 console 日志方便调试
 */

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private bgmNodes: Array<{ stop: () => void; disconnect: () => void }> = []
  private bgmTimers: number[] = []
  private muted = false
  private volume = 0.5  // 默认更高音量

  /** 解锁音频上下文（首次用户交互后调用） */
  async start() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext
        if (!AC) {
          console.warn('[audioEngine] Web Audio API 不可用')
          return
        }
        this.ctx = new AC()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = this.volume
        this.masterGain.connect(this.ctx.destination)

        this.bgmGain = this.ctx.createGain()
        this.bgmGain.gain.value = 0.6
        this.bgmGain.connect(this.masterGain)

        this.sfxGain = this.ctx.createGain()
        this.sfxGain.gain.value = 0.7
        this.sfxGain.connect(this.masterGain)
        console.log('[audioEngine] AudioContext created, state:', this.ctx.state)
      } catch (e) {
        console.error('[audioEngine] init failed:', e)
        return
      }
    }
    // 每次都尝试 resume（处理 autoplay + tab 切换）
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
        console.log('[audioEngine] ctx resumed')
      } catch (e) {
        console.warn('[audioEngine] resume failed:', e)
      }
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

  /** 内部：确保 ctx 可用 */
  private ensureCtx(): AudioContext | null {
    if (!this.ctx || !this.bgmGain || !this.sfxGain) return null
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  // ============ 穿越音效（一次性 1.4s）============
  playTimeTravel() {
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    if (!ctx || !this.sfxGain) return
    const now = ctx.currentTime
    const duration = 1.4

    // 频率扫描（sine wave，200→1500Hz 容易听到的范围）
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.7)
    osc.frequency.exponentialRampToValueAtTime(100, now + duration)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.7, now + 0.1)
    gain.gain.linearRampToValueAtTime(0.5, now + 1.0)
    gain.gain.linearRampToValueAtTime(0, now + duration)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(now)
    osc.stop(now + duration)

    // 噪声层
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0, now)
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.2)
    noiseGain.gain.linearRampToValueAtTime(0, now + duration)
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
    console.log('[audioEngine] playTimeTravel')
  }

  // ============ 场景 BGM（持续循环）============
  playSceneBGM(mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' = 'tense') {
    this.stopBGM()
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    if (!ctx || !this.bgmGain) { console.warn('[audioEngine] BGM skipped: no ctx'); return }
    console.log('[audioEngine] playSceneBGM:', mood, 'ctx state:', ctx.state)

    // 用两个 octave 高一点的频率（人耳更敏感）
    const baseFreq = mood === 'mysterious' ? 110 : mood === 'epic' ? 130 : mood === 'triumphant' ? 146 : mood === 'calm' ? 100 : 120

    // 1. 持续 drone（低频底鼓）
    const droneOsc = ctx.createOscillator()
    droneOsc.type = 'sine'
    droneOsc.frequency.value = baseFreq
    const droneGain = ctx.createGain()
    droneGain.gain.value = mood === 'epic' || mood === 'triumphant' ? 0.18 : 0.14
    droneOsc.connect(droneGain)
    droneGain.connect(this.bgmGain)
    droneOsc.start()
    this.bgmNodes.push(droneOsc, droneGain)

    // 2. 高频 pad（用五度音让和声更丰富）
    const padOsc = ctx.createOscillator()
    padOsc.type = 'triangle'
    padOsc.frequency.value = baseFreq * 1.5  // 五度
    const padGain = ctx.createGain()
    padGain.gain.value = 0.06
    // 缓慢 LFO 调制音量（呼吸感）
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.2
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.value = 0.04
    lfo.connect(lfoDepth)
    lfoDepth.connect(padGain.gain)
    padOsc.connect(padGain)
    padGain.connect(this.bgmGain)
    padOsc.start()
    lfo.start()
    this.bgmNodes.push(padOsc, padGain, lfo, lfoDepth)

    // 3. 节奏脉冲（仅 epic/tense/triumphant）
    if (mood === 'epic' || mood === 'tense' || mood === 'triumphant') {
      const beatInterval = mood === 'triumphant' ? 0.5 : 0.8
      const beatPitch = mood === 'triumphant' ? 220 : 160
      const beatVol = mood === 'tense' ? 0.25 : 0.18
      const timer = window.setInterval(() => {
        const c = this.ensureCtx()
        if (!c || !this.bgmGain) return
        const beatOsc = c.createOscillator()
        beatOsc.type = 'sine'
        beatOsc.frequency.value = beatPitch
        const beatGain = c.createGain()
        const t = c.currentTime
        beatGain.gain.setValueAtTime(0, t)
        beatGain.gain.linearRampToValueAtTime(beatVol, t + 0.02)
        beatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        beatOsc.connect(beatGain)
        beatGain.connect(this.bgmGain)
        beatOsc.start(t)
        beatOsc.stop(t + 0.4)
      }, beatInterval * 1000)
      this.bgmTimers.push(timer)
    }
  }

  stopBGM() {
    this.bgmTimers.forEach(t => clearInterval(t))
    this.bgmTimers = []
    this.bgmNodes.forEach(n => {
      try { n.stop() } catch { /* noop */ }
      try { n.disconnect() } catch { /* noop */ }
    })
    this.bgmNodes = []
  }

  // ============ UI 音效（短促）============
  playClick() {
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    if (!ctx || !this.sfxGain) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(now)
    osc.stop(now + 0.12)
  }

  playPageTurn() {
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    if (!ctx || !this.sfxGain) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(now)
    osc.stop(now + 0.32)
  }

  playEnding(isWin: boolean) {
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    if (!ctx || !this.sfxGain) return
    const now = ctx.currentTime
    const sfxGain = this.sfxGain
    if (isWin) {
      // 上升大三和弦
      const notes = [261.6, 329.6, 392.0, 523.3]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        const gain = ctx.createGain()
        const t = now + i * 0.15
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
        osc.connect(gain)
        gain.connect(sfxGain)
        osc.start(t)
        osc.stop(t + 0.6)
      })
    } else {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.exponentialRampToValueAtTime(80, now + 1.2)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3)
      osc.connect(gain)
      gain.connect(sfxGain)
      osc.start(now)
      osc.stop(now + 1.3)
    }
  }
}

export const audioEngine = new AudioEngine()

export function pickBGMForScenario(era: string, year: number): 'tense' | 'epic' | 'mysterious' | 'triumphant' {
  if (['唐', '宋', '元', '明', '清', '三国', '汉', '秦'].includes(era)) return 'epic'
  if (year > 1500 && year < 1900) return 'triumphant'
  return 'mysterious'
}

export function pickBGMForScene(sceneTitle: string): 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' {
  if (/登基|加冕|大胜|胜利|凯旋|传奇/.test(sceneTitle)) return 'triumphant'
  if (/犹豫|失败|死|流放|事败|火烧/.test(sceneTitle)) return 'tense'
  if (/密议|深夜|等待|黎明/.test(sceneTitle)) return 'mysterious'
  if (/对峙|逼宫|玄武门|赤壁|决战/.test(sceneTitle)) return 'epic'
  return 'tense'
}
