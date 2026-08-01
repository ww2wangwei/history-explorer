/**
 * audioEngine — 程序化音效引擎 (v3 - 全 UI 覆盖版)
 *
 * 用 Web Audio API 实时合成所有音效，零外部资源依赖。
 *
 * 设计原则：
 * - 全部用 OscillatorNode / BiquadFilterNode / BufferSource + envelope
 * - 默认音量低（不会盖过 BGM / TTS），调用方可按场景切换
 * - 所有方法在 ctx 未初始化时自动 start()，并处理 autoplay policy
 *
 * 事件清单（按 UI 触发点分组）：
 *   - 通用：playClick / playHover / playPageTurn / playSelect / playReveal
 *   - 答题：playCorrect / playWrong / playQuizComplete / playStar
 *   - 笔记：playNoteSave / playNoteDelete
 *   - 模态/Toast：playModalOpen / playModalClose / playToast(variant)
 *   - 剧本：playTimeTravel / playEnding / speakScene (TTS,独立处理)
 *   - BGM：playRemoteBGM / crossfadeBGM / playSceneBGM
 */

/** 仅开发环境输出的诊断日志（生产静默） */
const dlog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log(...args)
}

class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private bgmNodes: AudioNode[] = []
  private bgmTimers: number[] = []
  private muted = false
  private volume = 0.5  // 默认更高音量
  /** 全局静音 SFX（不影响 BGM） */
  private sfxMuted = false

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
        dlog('[audioEngine] AudioContext created, state:', this.ctx.state)
      } catch (e) {
        console.error('[audioEngine] init failed:', e)
        return
      }
    }
    // 每次都尝试 resume（处理 autoplay + tab 切换）
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
        dlog('[audioEngine] ctx resumed')
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

  /** 仅静音 SFX（保留 BGM）— 给 TTS 朗读等场景用 */
  setSfxMuted(m: boolean) { this.sfxMuted = m }
  isSfxMuted() { return this.sfxMuted }

  /** 内部：确保 ctx 可用 */
  private ensureCtx(): AudioContext | null {
    const ctx = this.ctx
    const bgm = this.bgmGain
    const sfx = this.sfxGain
    if (!ctx || !bgm || !sfx) return null
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  /**
   * SFX 快速触发：未初始化则懒初始化，sfxMuted 时直接吞掉
   * 返回 ctx + 已 narrow 的 sfxGain（避免类字段重复窄化）
   */
  private playIfEnabled(): { ctx: AudioContext; sfx: GainNode } | null {
    if (this.sfxMuted) return null
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    const sfx = this.sfxGain
    if (!ctx || !sfx) return null
    return { ctx, sfx }
  }

  // ============ 穿越音效（一次性 1.4s）============
  playTimeTravel() {
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    const sfxGain = this.sfxGain
    if (!ctx || !sfxGain) return
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
    gain.connect(sfxGain)
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
    noiseGain.connect(sfxGain)
    noise.start(now)
    noise.stop(now + duration)
    dlog('[audioEngine] playTimeTravel')
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
   * mood: 远程 URL 全失败时用于程序化兜底
   */
  async crossfadeBGM(newUrls: string[], fadeSec = 1.0, mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' = 'mysterious') {
    const ctx = this.ensureCtx()
    if (!ctx || !this.bgmGain) return
    // 1. 找当前 BGM 的 gain node
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
        newGain.gain.value = 0
        newSource.connect(newGain)
        newGain.connect(this.bgmGain)
        newSource.start(0)
        break
      } catch { /* try next */ }
    }
    // 兜底：远程 URL 全失败 → 程序化氛围音
    if (!newSource || !newGain) {
      dlog('[audioEngine] crossfade: no remote BGM, using procedural', mood)
      // 把旧的淡出，再启动程序化 BGM
      const now0 = ctx.currentTime
      for (const g of currentGains) {
        try { g.gain.linearRampToValueAtTime(0, now0 + fadeSec) } catch { /* noop */ }
      }
      setTimeout(() => {
        this.playProceduralBGM(mood)
      }, fadeSec * 1000 + 50)
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
      this.bgmTimers.forEach(t => clearInterval(t))
      this.bgmTimers = []
      const oldNodes = this.bgmNodes
      this.bgmNodes = [newSource!, newGain!]
      oldNodes.forEach(n => {
        try { (n as any).stop?.() } catch { /* noop */ }
        try { (n as any).disconnect?.() } catch { /* noop */ }
      })
    }, fadeSec * 1000 + 50)
    dlog('[audioEngine] crossfade BGM, new urls:', newUrls.length)
  }

  // ============ UI 音效（短促）============
  /** 通用按钮点击：高频短促 tick */
  playClick() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.12)
  }

  /** 极轻 hover：40ms 衰减的低能量 tick，不抢戏 */
  playHover() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.06)
  }

  /** 地图节点 / 选项选中：双音短促上行 */
  playSelect() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    ;[600, 900].forEach((freq, i) => {
      const t = now + i * 0.04
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
      osc.connect(gain)
      gain.connect(sfxGain)
      osc.start(t)
      osc.stop(t + 0.16)
    })
  }

  /** 翻页 / 切换场景：低频下降 */
  playPageTurn() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.32)
  }

  /** 揭示答案 / 翻面：上行琶音（C5-E5-G5） */
  playReveal() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const t = now + i * 0.06
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      osc.connect(gain)
      gain.connect(sfxGain)
      osc.start(t)
      osc.stop(t + 0.2)
    })
  }

  /** 答对：明亮上行三连音 + 短混响尾 */
  playCorrect() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const notes = [659.25, 783.99, 1046.5] // E5 G5 C6
    notes.forEach((freq, i) => {
      const t = now + i * 0.07
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.connect(gain)
      gain.connect(sfxGain)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  }

  /** 答错：低频下行 + 不和谐 dissonance */
  playWrong() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    // 下行根音
    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(220, now)
    osc1.frequency.exponentialRampToValueAtTime(110, now + 0.35)
    const g1 = ctx.createGain()
    g1.gain.setValueAtTime(0.0001, now)
    g1.gain.exponentialRampToValueAtTime(0.18, now + 0.02)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
    osc1.connect(g1); g1.connect(sfxGain)
    osc1.start(now); osc1.stop(now + 0.4)
    // 不和谐三全音
    const osc2 = ctx.createOscillator()
    osc2.type = 'square'
    osc2.frequency.setValueAtTime(233, now + 0.05)  // 离 root 一个三全音
    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0.0001, now + 0.05)
    g2.gain.exponentialRampToValueAtTime(0.1, now + 0.06)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc2.connect(g2); g2.connect(sfxGain)
    osc2.start(now + 0.05); osc2.stop(now + 0.32)
  }

  /** Quiz / Flashcard 整套完成：胜利号角 */
  playQuizComplete() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    // 大三和弦琶音 + 高八度尾巴
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    notes.forEach((freq, i) => {
      const t = now + i * 0.11
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
      osc.connect(gain)
      gain.connect(sfxGain)
      osc.start(t)
      osc.stop(t + 0.6)
    })
  }

  /** 评分小星星：单音明亮短促 */
  playStar() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1568, now) // G6
    osc.frequency.exponentialRampToValueAtTime(2093, now + 0.1)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.25)
  }

  /** 笔记自动保存：短促 snap（钢笔点击） */
  playNoteSave() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    // 高频"咔哒"
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(1800, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.05)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.1)
  }

  /** 笔记删除：纸揉搓声（带通噪声） */
  playNoteDelete() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const duration = 0.35
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      // 衰减随机噪声
      const env = 1 - i / bufferSize
      data[i] = (Math.random() * 2 - 1) * env * 0.6
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 0.7
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(sfxGain)
    noise.start(now)
    noise.stop(now + duration)
  }

  /** Modal 打开：滑入感（低频渐升） */
  playModalOpen() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.25)
  }

  /** Modal 关闭：滑出感（高频渐降） */
  playModalClose() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.25)
  }

  /** Toast 提示音：根据 variant 选用合适音效 */
  playToast(variant: 'success' | 'error' | 'warn' | 'info' = 'info') {
    if (variant === 'success') this.playCorrect()
    else if (variant === 'error') this.playWrong()
    else if (variant === 'warn') {
      // 警告：双音（先升后降）
      const r = this.playIfEnabled()
      if (!r) return
      const { ctx, sfx: sfxGain } = r
      const now = ctx.currentTime
      ;[880, 660].forEach((freq, i) => {
        const t = now + i * 0.09
        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = freq
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
        osc.connect(gain)
        gain.connect(sfxGain)
        osc.start(t)
        osc.stop(t + 0.2)
      })
    } else {
      this.playSelect()
    }
  }

  /** AI 收到回复：轻柔"叮" */
  playAiReply() {
    const r = this.playIfEnabled()
    if (!r) return
    const { ctx, sfx: sfxGain } = r
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1318, now)
    osc.frequency.exponentialRampToValueAtTime(1568, now + 0.12)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain)
    gain.connect(sfxGain)
    osc.start(now)
    osc.stop(now + 0.32)
  }

  playEnding(isWin: boolean) {
    if (!this.ctx) { this.start() }
    const ctx = this.ensureCtx()
    const sfxGain = this.sfxGain
    if (!ctx || !sfxGain) return
    const now = ctx.currentTime
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


  // ============ 场景 BGM（远程 URL 播放，失败程序化兜底）============
  /**
   * 播放远程 MP3 背景音乐（fetch + decodeAudioData + loop）
   * urls: 候选 URL 列表（按顺序尝试，失败切下一首；都失败则静默）
   * mood: 远程全失败时用于程序化兜底
   */
  async playRemoteBGM(urls: string[], mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' = 'mysterious'): Promise<void> {
    this.stopBGM()
    if (!this.ctx) { await this.start() }
    const ctx = this.ensureCtx()
    if (!ctx || !this.bgmGain) { console.warn('[audioEngine] remote BGM skipped: no ctx'); return }
    if (urls.length === 0) {
      this.playProceduralBGM(mood)
      return
    }
    dlog('[audioEngine] playRemoteBGM: trying', urls.length, 'urls')

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
        dlog('[audioEngine] BGM playing:', url)
        return
      } catch (e) {
        console.warn('[audioEngine] BGM load error:', url, e)
      }
    }
    console.warn('[audioEngine] all BGM URLs failed, falling back to procedural')
    this.playProceduralBGM(mood)
  }

  /**
   * 程序化兜底 BGM：用 oscillator + LFO 合成不同 mood 的氛围音
   * - tense: 低频脉冲 + 高频颤音
   * - calm: 五度叠加 drone
   * - epic: 大三和弦琶音循环
   * - mysterious: 小二度 + 八度 + 低通
   * - triumphant: 大调分解和弦上行
   */
  playProceduralBGM(mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' = 'mysterious') {
    const ctx = this.ensureCtx()
    if (!ctx || !this.bgmGain) return
    this.stopBGM()

    const presets = {
      tense: { root: 110, intervals: [1, 1.5, 2.0], filter: 800, lfoHz: 6 },
      calm: { root: 196, intervals: [1, 1.5, 2.0, 3.0], filter: 1200, lfoHz: 0.3 },
      epic: { root: 130.81, intervals: [1, 1.25, 1.5, 2.0], filter: 1800, lfoHz: 0.5 },
      mysterious: { root: 98, intervals: [1, 1.059, 1.5, 2.0], filter: 700, lfoHz: 0.2 },
      triumphant: { root: 196, intervals: [1, 1.25, 1.5, 1.875], filter: 2200, lfoHz: 0.4 },
    } as const
    const p = presets[mood] ?? presets.mysterious

    // 共享的低通 + 主增益
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = p.filter
    filter.Q.value = 0.6
    const master = ctx.createGain()
    master.gain.value = 0.18
    filter.connect(master)
    master.connect(this.bgmGain)
    this.bgmNodes.push(filter, master)

    // 每个 interval 一个 oscillator + LFO 调音量
    p.intervals.forEach((mult, idx) => {
      const osc = ctx.createOscillator()
      osc.type = idx === 0 ? 'sine' : 'triangle'
      osc.frequency.value = p.root * mult
      const gain = ctx.createGain()
      gain.gain.value = 0.0
      // LFO（缓慢振幅调制）
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = p.lfoHz * (1 + idx * 0.2)
      lfoGain.gain.value = 0.05 + idx * 0.01
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)
      // 不同 layer 不同基础音量
      const base = 0.06 + idx * 0.015
      gain.gain.setValueAtTime(base, ctx.currentTime)
      osc.connect(gain)
      gain.connect(filter)
      osc.start()
      lfo.start()
      this.bgmNodes.push(osc, gain, lfo, lfoGain)
    })

    dlog('[audioEngine] procedural BGM:', mood)
  }

  // 保留旧 API（兼容现有调用，调用时传空数组 → 静默）
  playSceneBGM(_mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' = 'tense', _style: 'chinese' | 'european' = 'chinese') {
    this.stopBGM()
  }

}

export const audioEngine = new AudioEngine()

// 兼容旧 API（用空数组 → 静默）
export function pickBGMForScenario(era: string, year: number): { mood: 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant'; style: 'chinese' | 'european' } {
  // 中国朝代
  if (['唐', '宋', '元', '明', '清', '汉', '秦', '隋'].includes(era)) {
    // 战争密集期 → tense
    if (['三国', '秦', '元', '隋'].includes(era)) return { mood: 'tense', style: 'chinese' }
    // 盛世 → triumphant
    if (['唐', '汉', '清'].includes(era)) return { mood: 'triumphant', style: 'chinese' }
    // 文化繁荣 → calm
    return { mood: 'calm', style: 'chinese' }
  }
  // 欧洲 / 世界
  if (['法国', '英国', '德国', '罗马'].includes(era)) return { mood: 'epic', style: 'european' }
  if (['蒙古'].includes(era)) return { mood: 'epic', style: 'european' }
  if (['阿拉伯', '波斯', '奥斯曼', '拜占庭'].includes(era)) return { mood: 'mysterious', style: 'european' }
  return { mood: 'mysterious', style: 'chinese' }
}
export function pickBGMForScene(title: string, era?: string): 'tense' | 'calm' | 'epic' | 'mysterious' | 'triumphant' {
  const t = title.toLowerCase()
  // 关键词命中
  if (/(决战|大战|攻|围|破|败|陷|冲锋|激战|围城|沦陷|篡位|政变)/.test(title)) return 'tense'
  if (/(登基|大典|盛世|凯旋|统一|胜利|称帝|建国)/.test(title)) return 'triumphant'
  if (/(夜|梦|密|谋|诡|谜|暗|幽灵|阴影)/.test(title)) return 'mysterious'
  if (/(诗|宴|游|春|秋|月|花|山水|田园|静|寺|书)/.test(title)) return 'calm'
  // 按 era 兜底
  if (era && ['罗马', '法国', '英国', '蒙古'].includes(era)) return 'epic'
  return 'mysterious'
}
