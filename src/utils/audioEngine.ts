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
  private bgmNodes: AudioNode[] = []
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

  stopBGM() {
    this.bgmTimers.forEach(t => clearInterval(t))
    this.bgmTimers = []
    this.bgmNodes.forEach(n => {
      try { (n as any).stop?.() } catch { /* noop */ }
      try { (n as any).disconnect?.() } catch { /* noop */ }
    })
    this.bgmNodes = []
  }

  /**
   * 交叉淡入新 BGM：把当前 BGM 音量渐降 + 新 BGM 渐入（重叠 1 秒）
   * 避免场景切换时音乐突然中断
   */
  async crossfadeBGM(newUrls: string[], fadeSec = 1.0) {
    const ctx = this.ensureCtx()
    if (!ctx || !this.bgmGain) return
    // 1. 找当前 BGM 的 gain node（最后一个 AudioNode 是 gain）
    const currentGains = this.bgmNodes.filter(n => n.constructor.name === 'GainNode') as GainNode[]
    // 2. 准备新 BGM（异步）
    let newSource: AudioBufferSourceNode | null = null
    let newGain: GainNode | null = null
    for (const url of newUrls) {
      try {
        const resp = await fetch(url)
        if (!resp.ok) continue
        const ab = await resp.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(ab)
        newSource = ctx.createBufferSource()
        newSource.buffer = audioBuffer
        newSource.loop = true
        newGain = ctx.createGain()
        newGain.gain.value = 0  // 起始 0
        newSource.connect(newGain)
        newGain.connect(this.bgmGain)
        newSource.start(0)
        break
      } catch { /* try next */ }
    }
    if (!newSource || !newGain) {
      console.warn('[audioEngine] crossfade: no new BGM loaded')
      return
    }
    // 3. 交叉淡化
    const now = ctx.currentTime
    for (const g of currentGains) {
      try { g.gain.linearRampToValueAtTime(0, now + fadeSec) } catch { /* noop */ }
    }
    newGain.gain.linearRampToValueAtTime(0.5, now + fadeSec)
    // 4. 1 秒后清理旧的
    setTimeout(() => {
      // 停旧 BGM（但保留新 BGM 在 bgmNodes）
      this.bgmTimers.forEach(t => clearInterval(t))
      this.bgmTimers = []
      const oldNodes = this.bgmNodes
      this.bgmNodes = [newSource!, newGain!]
      oldNodes.forEach(n => {
        try { (n as any).stop?.() } catch { /* noop */ }
        try { (n as any).disconnect?.() } catch { /* noop */ }
      })
    }, fadeSec * 1000 + 50)
    console.log('[audioEngine] crossfade BGM, new urls:', newUrls.length)
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


  // ============ 场景 BGM（远程 URL 播放）============
  /**
   * 播放远程 MP3 背景音乐（fetch + decodeAudioData + loop）
   * urls: 候选 URL 列表（按顺序尝试，失败切下一首；都失败则静默）
   */
  async playRemoteBGM(urls: string[]): Promise<void> {
    this.stopBGM()
    if (!this.ctx) { await this.start() }
    const ctx = this.ensureCtx()
    if (!ctx || !this.bgmGain) { console.warn('[audioEngine] remote BGM skipped: no ctx'); return }
    if (urls.length === 0) return
    console.log('[audioEngine] playRemoteBGM: trying', urls.length, 'urls')

    for (const url of urls) {
      try {
        const resp = await fetch(url)
        if (!resp.ok) { console.warn('[audioEngine] fetch fail', url, resp.status); continue }
        const arrayBuffer = await resp.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.loop = true
        const gain = ctx.createGain()
        gain.gain.value = 0.5
        source.connect(gain)
        gain.connect(this.bgmGain)
        source.start(0)
        this.bgmNodes.push(source as any, gain)
        console.log('[audioEngine] BGM playing:', url)
        return
      } catch (e) {
        console.warn('[audioEngine] BGM load error:', url, e)
      }
    }
    console.warn('[audioEngine] all BGM URLs failed')
  }

  // 保留旧 API（兼容现有调用，调用时传空数组 → 静默）
  playSceneBGM(_mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' = 'tense', _style: 'chinese' | 'european' = 'chinese') {
    this.stopBGM()
  }

}

export const audioEngine = new AudioEngine()

// 兼容旧 API（用空数组 → 静默）
export function pickBGMForScenario(_era: string, _year: number): { mood: 'tense' | 'epic' | 'mysterious' | 'triumphant'; style: 'chinese' | 'european' } {
  return { mood: 'mysterious', style: 'chinese' }
}
export function pickBGMForScene(_title: string, _era?: string): 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' {
  return 'tense'
}
