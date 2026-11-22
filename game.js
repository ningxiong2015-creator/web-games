(() => {
  const c = document.querySelector('#lake'),
    realCtx = c.getContext('2d'),
    $ = s => document.querySelector(s),
    button = $('#cast'),
    buttonNet = $('#netButton'),
    tankCanvas = $('#tank'),
    realTankCtx = $('#tank').getContext('2d');
  // 后台模拟时把画面画到 1×1 的小画布上，省掉真正的渲染开销
  const blankCtx = document.createElement('canvas').getContext('2d'),
    blankCtx2 = document.createElement('canvas').getContext('2d');
  blankCtx.canvas.width = blankCtx.canvas.height = blankCtx2.canvas.width = blankCtx2.canvas.height = 1;
  let ctx = realCtx,
    tankCtx = realTankCtx;
  let state = 'idle',
    bob = {
      x: 555,
      y: 278
    },
    t = 0,
    biteAt = 0,
    fish = null,
    progress = 0,
    hold = false,
    catchCount = 0,
    coins = 500,
    aquariumMode = false,
    aquariumPlayer = {
      x: 400,
      y: 440
    },
    aquariums = [],
    selectedAqId = 0,
    nextAqId = 1,
    autoFisher = false,
    autoSeller = false,
    autoClamWorker = false,
    autoFishAt = 0,
    autoSellAt = 0,
    autoClamAt = 0,
    nextPayrollAt = 0,
    payrollDue = false,
    derbyActive = false,
    derbyUntil = 0,
    derbyScore = 0,
    derbyCaught = 0,
    inventory = {},
    tankStock = {},
    rod = 0,
    bait = 0,
    netLevel = 0,
    questDone = false,
    questTarget = 3,
    weather = '晴朗',
    weatherAt = 0,
    last = performance.now(),
    particles = [],
    jump = null,
    biteSplashAt = -99,
    netState = 'idle',
    netStart = 0,
    netX = 620,
    netY = 315,
    netFish = [],
    netNext = 0,
    clams = 0,
    pearls = 0,
    shellStock = {},
    pearlStock = {},
    marketMode = false,
    marketPlayer = {
      x: 400,
      y: 438
    },
    marketKeys = {},
    marketStock = {},
    pearlMarketStock = {},
    customers = [],
    nextCustomer = 0,
    marketPeople = [],
    nextPerson = 0,
    shops = [{
      id: 'fish',
      name: '鲜鱼铺',
      x: 195,
      y: 210,
      cost: 40,
      color: '#e98761',
      owned: false
    }, {
      id: 'pearl',
      name: '珍珠铺',
      x: 400,
      y: 210,
      cost: 35,
      color: '#b27bc5',
      owned: false
    }, {
      id: 'seafood',
      name: '海鲜店',
      x: 605,
      y: 210,
      cost: 70,
      color: '#e3a746',
      owned: false
    }],
    treasureActive = false,
    treasureUntil = 0,
    treasureAt = 18 + Math.random() * 12,
    tideActive = false,
    tideUntil = 0,
    nextTide = 35 + Math.random() * 25,
    achievements = {},
    clamTypes = [{
      n: '蛤蜊',
      e: '🐚',
      rate: .4,
      drops: ['白珍珠', '粉珍珠']
    }, {
      n: '扇贝',
      e: '🦪',
      rate: .56,
      drops: ['白珍珠', '粉珍珠', '蓝珍珠']
    }, {
      n: '牡蛎',
      e: '🦪',
      rate: .72,
      drops: ['白珍珠', '黑珍珠', '金珍珠']
    }, {
      n: '鸟蛤',
      e: '🐚',
      rate: .32,
      drops: ['白珍珠', '粉珍珠']
    }, {
      n: '巨蚌',
      e: '🦪',
      rate: .9,
      drops: ['粉珍珠', '蓝珍珠', '黑珍珠', '金珍珠']
    }],
    pearlTypes = [{
      n: '白珍珠',
      e: '⚪',
      v: 25
    }, {
      n: '粉珍珠',
      e: '🩷',
      v: 45
    }, {
      n: '蓝珍珠',
      e: '🔵',
      v: 75
    }, {
      n: '黑珍珠',
      e: '⚫',
      v: 110
    }, {
      n: '金珍珠',
      e: '🟡',
      v: 180
    }],
    clamSpots = [{
      x: 200,
      y: 435,
      type: '蛤蜊',
      ready: true
    }, {
      x: 265,
      y: 457,
      type: '扇贝',
      ready: true
    }, {
      x: 405,
      y: 430,
      type: '牡蛎',
      ready: true
    }, {
      x: 474,
      y: 452,
      type: '鸟蛤',
      ready: true
    }, {
      x: 550,
      y: 425,
      type: '巨蚌',
      ready: true
    }];
  const rodNames = ['木制', '竹制', '碳纤维', '黄金', '星辰', '幻彩'],
    rodCosts = [0, 20, 60, 140, 280, 500];
  const species = [{
    n: '蓝鳃太阳鱼',
    e: '🐟',
    v: 3,
    c: '#6ab8c5',
    rarity: '常见'
  }, {
    n: '金鳟鱼',
    e: '🐠',
    v: 8,
    c: '#efb84e',
    rarity: '普通'
  }, {
    n: '胖鲤鱼',
    e: '🐡',
    v: 5,
    c: '#ed9372',
    rarity: '常见'
  }, {
    n: '银鲑',
    e: '🐟',
    v: 12,
    c: '#c6dbe1',
    rarity: '少见'
  }, {
    n: '小龙虾',
    e: '🦞',
    v: 7,
    c: '#e26853',
    rarity: '普通'
  }, {
    n: '月光锦鲤',
    e: '🐠',
    v: 25,
    c: '#bc8bdd',
    rarity: '稀有',
    night: true
  }, {
    n: '河豚',
    e: '🐡',
    v: 18,
    c: '#f3ad61',
    rarity: '少见'
  }, {
    n: '彩虹鳟',
    e: '🐟',
    v: 32,
    c: '#9a80d0',
    rarity: '稀有'
  }, {
    n: '黄金鲤鱼',
    e: '🐠',
    v: 45,
    c: '#f2c949',
    rarity: '传说'
  }, {
    n: '珍珠蚌',
    e: '🦪',
    v: 60,
    c: '#e3c8da',
    rarity: '传说'
  }, {
    n: '小鲨鱼',
    e: '🦈',
    v: 95,
    c: '#718b9a',
    rarity: '稀有'
  }, {
    n: '海豚',
    e: '🐬',
    v: 120,
    c: '#72c8d4',
    rarity: '稀有'
  }, {
    n: '蓝鲸',
    e: '🐋',
    v: 220,
    c: '#517cae',
    rarity: '传说'
  }, {
    n: '水母',
    e: '🪼',
    v: 70,
    c: '#c78de2',
    rarity: '少见'
  }, {
    n: '灯笼鱼',
    e: '🐟',
    v: 15,
    c: '#f6e27a',
    rarity: '少见',
    night: true
  }, {
    // 河口
    n: '河虾',
    e: '🦐',
    v: 4,
    c: '#f0a08a',
    rarity: '常见',
    spot: 'river'
  }, {
    n: '鲈鱼',
    e: '🐟',
    v: 9,
    c: '#9fb3a0',
    rarity: '普通',
    spot: 'river'
  }, {
    n: '青蟹',
    e: '🦀',
    v: 16,
    c: '#5f8f7a',
    rarity: '少见',
    spot: 'river'
  }, {
    n: '鳜鱼',
    e: '🐠',
    v: 36,
    c: '#c9a35a',
    rarity: '稀有',
    spot: 'river'
  }, {
    n: '白鳝',
    e: '🐍',
    v: 48,
    c: '#d8d8c8',
    rarity: '稀有',
    spot: 'river',
    night: true
  }, {
    n: '中华鲟',
    e: '🐟',
    v: 260,
    c: '#6c7f8e',
    rarity: '传说',
    spot: 'river'
  }, {
    // 深海
    n: '带鱼',
    e: '🐟',
    v: 10,
    c: '#d9e4ea',
    rarity: '常见',
    spot: 'deep'
  }, {
    n: '鱿鱼',
    e: '🦑',
    v: 14,
    c: '#e7a3a0',
    rarity: '普通',
    spot: 'deep'
  }, {
    n: '海星',
    e: '⭐',
    v: 20,
    c: '#f2b552',
    rarity: '少见',
    spot: 'deep'
  }, {
    n: '旗鱼',
    e: '🐟',
    v: 85,
    c: '#4f7fb5',
    rarity: '稀有',
    spot: 'deep'
  }, {
    n: '鮟鱇鱼',
    e: '🐡',
    v: 110,
    c: '#6b5d52',
    rarity: '稀有',
    spot: 'deep',
    night: true
  }, {
    n: '大王乌贼',
    e: '🦑',
    v: 300,
    c: '#b8576a',
    rarity: '传说',
    spot: 'deep'
  }, {
    n: '皇带鱼',
    e: '🐉',
    v: 380,
    c: '#c9c6e8',
    rarity: '传说',
    spot: 'deep'
  }];
  const spots = [{
    id: 'bay',
    name: '海湾',
    e: '🏖️',
    cost: 0,
    reward: 300,
    tint: null
  }, {
    id: 'river',
    name: '河口',
    e: '🌾',
    cost: 400,
    reward: 500,
    tint: 'rgba(120,150,70,.28)'
  }, {
    id: 'deep',
    name: '深海',
    e: '🌊',
    cost: 1500,
    reward: 800,
    tint: 'rgba(10,30,90,.38)'
  }];
  const lureNames = {
      shrimp: '虾饵',
      glow: '夜光饵'
    },
    decorLevels = [{
      name: '无装饰',
      cost: 0
    }, {
      name: '🌿 海草花园',
      cost: 800
    }, {
      name: '🪸 珊瑚礁',
      cost: 2500
    }, {
      name: '🚢 沉船宝藏',
      cost: 6000
    }];
  // 新增状态
  let paused = false,
    muted = false,
    codex = {},
    codexRewards = {},
    lure = '',
    lureStock = {
      shrimp: 0,
      glow: 0
    },
    combo = 0,
    bestCombo = 0,
    perfectHook = false,
    spot = 'bay',
    unlockedSpots = {
      bay: true
    },
    lastDaily = '',
    dailyStreak = 0,
    lastAqUI = -1,
    actx = null;
  try {
    muted = localStorage.getItem('bay-fishing-muted') === '1'
  } catch (e) {}
  const sceneEl = document.querySelector('.scene');

  function isNight() {
    return (t % 120) > 80
  }

  function spotOf(f) {
    return f.spot || 'bay'
  }

  // ---------- 音效（WebAudio 合成，无需音频文件） ----------
  function unlockAudio() {
    try {
      actx = actx || new(window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume()
    } catch (e) {}
  }

  // 音量档位：1 = 大声，0.5 = 小声，0 = 静音
  let volume = muted ? 0 : 1,
    master = null,
    noiseBuf = null,
    lastSfx = {},
    bgmOn = true,
    bgmGain = null,
    bgmFilter = null;
  const BGM_VOL = .16;
  try {
    bgmOn = localStorage.getItem('bay-fishing-bgm') !== '0'
  } catch (e) {}
  try {
    const v = localStorage.getItem('bay-fishing-volume');
    if (v !== null && [0, .5, 1].includes(Number(v))) volume = Number(v)
  } catch (e) {}

  function audioOut() {
    if (master) return master;
    // 压缩器让声音更响又不爆音
    const comp = actx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    comp.connect(actx.destination);
    master = actx.createGain();
    master.gain.value = volume;
    master.connect(comp);
    // 背景音乐单独一路，音量更低，并加低通让它更柔和
    bgmFilter = actx.createBiquadFilter();
    bgmFilter.type = 'lowpass';
    bgmFilter.frequency.value = 2600;
    bgmGain = actx.createGain();
    bgmGain.gain.value = bgmOn ? BGM_VOL : 0;
    bgmGain.connect(bgmFilter).connect(comp);
    noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return master
  }

  // 单个音：可滑音、可叠加泛音
  function tone(freq, at, dur, o = {}) {
    audioOut();
    const out = o.out || master,
      osc = actx.createOscillator(),
      g = actx.createGain(),
      peak = o.vol ?? .5;
    osc.type = o.type || 'triangle';
    osc.frequency.setValueAtTime(freq, at);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, at + dur);
    g.gain.setValueAtTime(.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + (o.attack || .008));
    g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + dur + .05)
  }

  // 噪声：水花、甩竿的风声
  function noise(at, dur, o = {}) {
    const out = audioOut(),
      src = actx.createBufferSource(),
      f = actx.createBiquadFilter(),
      g = actx.createGain();
    src.buffer = noiseBuf;
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 1200, at);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, at + dur);
    f.Q.value = o.q || 1;
    g.gain.setValueAtTime(.0001, at);
    g.gain.exponentialRampToValueAtTime(o.vol ?? .5, at + (o.attack || .01));
    g.gain.exponentialRampToValueAtTime(.0001, at + dur);
    src.connect(f).connect(g).connect(out);
    src.start(at, Math.random() * .5);
    src.stop(at + dur + .05)
  }

  // 音阶上的和弦琶音（主音 + 高八度亮音）
  function arp(freqs, at, step, o = {}) {
    freqs.forEach((fq, i) => {
      tone(fq, at + i * step, o.dur || .35, {
        type: o.type || 'triangle',
        vol: o.vol ?? .45
      });
      tone(fq * 2, at + i * step, (o.dur || .35) * .7, {
        type: 'sine',
        vol: (o.vol ?? .45) * .35
      })
    })
  }

  const SOUNDS = {
    // 甩竿：风声 + 落水“扑通”
    cast: at => {
      noise(at, .28, {
        freq: 800,
        to: 3000,
        vol: .25,
        q: .7
      });
      tone(420, at + .3, .22, {
        type: 'sine',
        to: 140,
        vol: .55
      });
      noise(at + .3, .25, {
        freq: 900,
        to: 300,
        vol: .35,
        filter: 'lowpass'
      })
    },
    // 咬钩：最重要的提醒，响亮的双铃 + 水花，并重复一次
    bite: at => {
      for (const d of [0, .32]) {
        tone(1175, at + d, .28, {
          type: 'square',
          vol: .22
        });
        tone(1568, at + d + .08, .3, {
          type: 'triangle',
          vol: .55
        })
      }
      noise(at, .3, {
        freq: 1500,
        to: 500,
        vol: .45
      })
    },
    // 收线时的棘轮声
    reel: at => {
      tone(1800 + Math.min(100, progress) * 12, at, .035, {
        type: 'square',
        vol: .12
      });
      noise(at, .03, {
        freq: 4000,
        vol: .15,
        q: 3
      })
    },
    catch: at => {
      noise(at, .45, {
        freq: 1200,
        to: 250,
        vol: .55,
        filter: 'lowpass'
      });
      arp([523, 659, 784, 1047], at + .05, .09, {
        dur: .4,
        vol: .5
      })
    },
    rare: at => {
      noise(at, .5, {
        freq: 1500,
        to: 300,
        vol: .55,
        filter: 'lowpass'
      });
      arp([523, 659, 784, 1047, 1319, 1568], at + .05, .08, {
        dur: .55,
        vol: .5
      });
      tone(2093, at + .55, .8, {
        type: 'sine',
        vol: .3
      })
    },
    perfect: at => {
      tone(880, at, .12, {
        type: 'square',
        vol: .2,
        to: 1760
      });
      arp([1319, 1760], at + .08, .07, {
        dur: .3,
        vol: .45
      })
    },
    escape: at => {
      tone(392, at, .25, {
        type: 'sawtooth',
        vol: .25,
        to: 300
      });
      tone(262, at + .22, .45, {
        type: 'sawtooth',
        vol: .25,
        to: 160
      });
      noise(at, .35, {
        freq: 700,
        to: 200,
        vol: .3,
        filter: 'lowpass'
      })
    },
    coin: at => {
      tone(1319, at, .09, {
        type: 'square',
        vol: .2
      });
      tone(1976, at + .07, .35, {
        type: 'square',
        vol: .2
      });
      tone(1976, at + .07, .35, {
        type: 'sine',
        vol: .35
      })
    },
    combo: at => {
      const base = 523 * Math.pow(2, Math.min(12, combo) / 12);
      arp([base, base * 1.26, base * 1.5], at, .06, {
        dur: .3,
        type: 'square',
        vol: .22
      })
    },
    splash: at => {
      noise(at, .6, {
        freq: 1600,
        to: 200,
        vol: .6,
        filter: 'lowpass'
      });
      noise(at + .1, .4, {
        freq: 3000,
        vol: .2,
        q: 2
      })
    },
    unlock: at => {
      arp([523, 659, 784, 1047], at, .11, {
        dur: .5,
        vol: .45
      });
      tone(1568, at + .5, .9, {
        type: 'sine',
        vol: .35
      })
    }
  };

  // ---------- 背景音乐：程序生成的五声音阶小曲，白天/夜晚/鱼市/水族馆各有风格 ----------
  const N = n => 440 * Math.pow(2, (n - 69) / 12),
    BGM_STYLES = {
      // chords：每两小节一个和弦（MIDI 根音 + 和弦音）；scale：旋律可用音
      day: {
        bpm: 92,
        chords: [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62]],
        scale: [72, 74, 76, 79, 81, 84],
        density: .55,
        lead: 'triangle',
        cutoff: 2800
      },
      night: {
        bpm: 66,
        chords: [[45, 57, 60, 64], [41, 57, 60, 65], [48, 55, 60, 64], [43, 55, 59, 62]],
        scale: [69, 72, 74, 76, 79],
        density: .3,
        lead: 'sine',
        cutoff: 1500
      },
      market: {
        bpm: 112,
        chords: [[43, 55, 59, 62], [48, 60, 64, 67], [45, 57, 60, 64], [50, 57, 62, 66]],
        scale: [74, 76, 79, 81, 83, 86],
        density: .7,
        lead: 'square',
        cutoff: 2200
      },
      aquarium: {
        bpm: 72,
        chords: [[41, 60, 65, 69], [48, 60, 64, 67], [45, 60, 64, 69], [43, 59, 62, 67]],
        scale: [77, 79, 81, 84, 86, 88],
        density: .38,
        lead: 'sine',
        cutoff: 3400
      }
    };
  let bgmStep = 0,
    bgmNext = 0,
    bgmSeed = 1;

  function bgmStyleName() {
    return aquariumMode ? 'aquarium' : marketMode ? 'market' : isNight() ? 'night' : 'day'
  }

  function rand() {
    bgmSeed = (bgmSeed * 16807) % 2147483647;
    return bgmSeed / 2147483647
  }

  function bgmTick() {
    if (!actx || actx.state !== 'running' || !bgmOn || paused || document.hidden) {
      if (actx) bgmNext = actx.currentTime + .1;
      return
    }
    audioOut();
    const st = BGM_STYLES[bgmStyleName()],
      eighth = 60 / st.bpm / 2;
    bgmFilter.frequency.setTargetAtTime(st.cutoff, actx.currentTime, .5);
    if (bgmNext < actx.currentTime) bgmNext = actx.currentTime + .05;
    while (bgmNext < actx.currentTime + .4) {
      const at = bgmNext,
        inBar = bgmStep % 8,
        bar = Math.floor(bgmStep / 8),
        chord = st.chords[Math.floor(bar / 2) % st.chords.length];
      // 每小节开头：长音铺底
      if (inBar === 0) {
        if (bar % 4 === 0) bgmSeed = 7 + Math.floor(bar / 4) % 4; // 每 4 小节旋律重复一次，听起来像曲子
        chord.slice(1).forEach(n => tone(N(n), at, eighth * 8.5, {
          type: 'sine',
          vol: .12,
          attack: .25,
          out: bgmGain
        }))
      }
      // 低音：1、5 拍
      if (inBar === 0 || inBar === 4) tone(N(chord[0]), at, eighth * 3.5, {
        type: 'triangle',
        vol: .35,
        attack: .02,
        out: bgmGain
      });
      // 分解和弦：轻轻的拨弦
      if (inBar % 2 === 1) tone(N(chord[1 + (inBar >> 1) % 3] + 12), at, eighth * 1.6, {
        type: 'sine',
        vol: .1,
        out: bgmGain
      });
      // 旋律
      if (rand() < st.density) {
        const note = st.scale[Math.floor(rand() * st.scale.length)];
        tone(N(note), at, eighth * (rand() < .3 ? 3 : 1.8), {
          type: st.lead,
          vol: st.lead === 'square' ? .07 : .18,
          attack: .015,
          out: bgmGain
        })
      }
      bgmStep++;
      bgmNext += eighth
    }
  }
  setInterval(bgmTick, 100);

  function setBgm(on) {
    bgmOn = on;
    try {
      localStorage.setItem('bay-fishing-bgm', on ? '1' : '0')
    } catch (e) {}
    if (bgmGain) bgmGain.gain.setTargetAtTime(on ? BGM_VOL : 0, actx.currentTime, .3);
    $('#bgmBtn').textContent = on ? '🎵 音乐' : '🎵 音乐关';
    $('#bgmBtn').setAttribute('aria-pressed', String(!on))
  }

  // throttle：同一种声音最短间隔（秒），避免顾客成群买东西时刷屏
  function sfx(kind, throttle = 0) {
    if (!volume || document.hidden || !actx || actx.state !== 'running' || !SOUNDS[kind]) return;
    const now = actx.currentTime;
    if (throttle && now - (lastSfx[kind] || -9) < throttle) return;
    lastSfx[kind] = now;
    try {
      SOUNDS[kind](now + .01)
    } catch (e) {}
  }
  document.addEventListener('pointerdown', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  function splash(x, y, power = 1) {
    for (let i = 0; i < Math.round(14 * power); i++) {
      const a = Math.random() * Math.PI * 2,
        v = (1.4 + Math.random() * 3.8) * power;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: -Math.abs(Math.sin(a)) * v - 1,
        life: .45 + Math.random() * .45,
        max: .9,
        r: 2 + Math.random() * 3
      })
    }
  }

  function rr(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill()
  }

  function ellipse(x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill()
  }

  function interactShop(shop) {
    if (!shop) return;
    if (!marketMode) {
      message('先进入鱼市，走到柜台旁再选店。');
      return
    }
    if (Math.hypot(marketPlayer.x - shop.x, marketPlayer.y - 260) > 115) {
      message('走近这家店铺，再按 E 购买或选择。');
      return
    }
    if (!shop.owned) {
      if (coins < shop.cost) {
        message(`${shop.name}售价 ${shop.cost} 鱼币，你还差 ${shop.cost-coins}。`);
        return
      }
      coins -= shop.cost;
      shop.owned = true;
      $('#coins').textContent = coins;
      if (shop.id === 'pearl' && autoClamWorker) {
        for (const [name, n] of Object.entries(pearlStock)) pearlMarketStock[name] = (pearlMarketStock[name] || 0) + n;
        pearlStock = {};
        updateClamUI()
      }
      $('#shopStatus').textContent = `已拥有：${shops.filter(x=>x.owned).map(x=>x.name).join('、')}。走到鲜鱼铺按 E 可上架鱼。`;
      message(`🎉 买下了${shop.name}！`);
      sfx('unlock')
    } else {
      message(`这是你的${shop.name}。${shop.id==='fish'?'在卖鱼摊把鱼上架，顾客就会来买。':'店铺已开张！'}`)
    }
    renderMarket()
  }

  function updateWorkers() {
    const employees = (autoFisher ? 2 : 0) + (autoSeller ? 1 : 0) + (autoClamWorker ? 1 : 0);
    if (employees && !nextPayrollAt) nextPayrollAt = t + 30 * 30;
    if (autoFisher && t >= autoFishAt) {
      autoFishAt = t + 4;
      for (let i = 0; i < 2; i++) awardFish(rollFish(), false);
      refreshCatchUI();
      message('两名自动捕鱼员工各钓到一条鱼，已放进库存。')
    }
    if (autoSeller && t >= autoSellAt) {
      autoSellAt = t + 3.2;
      const shop = shops.find(x => x.id === 'fish'),
        name = Object.keys(inventory).find(k => inventory[k] > 0),
        f = species.find(x => x.n === name);
      if (name && shop?.owned) {
        inventory[name]--;
        if (!inventory[name]) delete inventory[name];
        marketStock[name] = (marketStock[name] || 0) + 1;
        renderBucket();
        renderMarket();
        message(`自动售鱼员工把${f.n}摆上鲜鱼铺，等顾客来买。`)
      }
    }
    if (autoClamWorker && t >= autoClamAt) {
      autoClamAt = t + 12;
      const spot = clamSpots.find(q => q.ready);
      if (spot) {
        spot.ready = false;
        setTimeout(() => {
          spot.ready = true;
          updateClamUI()
        }, 12000);
        if (Math.random() < clamTypes.find(q => q.n === spot.type).rate) {
          const shell = clamTypes.find(q => q.n === spot.type),
            pearl = shell.drops[Math.floor(Math.random() * shell.drops.length)];
          if (shops.find(q => q.id === 'pearl').owned) {
            pearlMarketStock[pearl] = (pearlMarketStock[pearl] || 0) + 1;
            renderMarket();
            message(`赶海员工捡到${shell.n}并开出${pearl}，已送到珍珠铺！`)
          } else {
            pearlStock[pearl] = (pearlStock[pearl] || 0) + 1;
            updateClamUI();
            message(`赶海员工开出${pearl}，先收进仓库；买下珍珠铺后会自动上架。`)
          }
        } else message(`赶海员工捡到${spot.type}，可惜没有开出珍珠。`)
      }
    }
    if (employees && nextPayrollAt && t >= nextPayrollAt) {
      const salary = employees * 1800;
      if (coins >= salary) {
        coins -= salary;
        $('#coins').textContent = coins;
        payrollDue = false;
        nextPayrollAt = t + 30 * 30;
        message(`发放月薪：${employees} 名员工共 ${salary.toLocaleString()} 鱼币。`)
      } else {
        payrollDue = true;
        nextPayrollAt = t + 5;
        message(`工资还差 ${salary-coins} 鱼币，员工暂停工作；存够后会自动补发。`);
        autoFishAt = t + 5;
        autoSellAt = t + 5
      }
    }
    if (payrollDue && employees && coins >= employees * 1800) {
      const salary = employees * 1800;
      coins -= salary;
      $('#coins').textContent = coins;
      payrollDue = false;
      nextPayrollAt = t + 30 * 30;
      message(`补发月薪 ${salary.toLocaleString()} 鱼币，员工恢复工作。`)
    }
    if (t - lastAqUI >= .5 || t < lastAqUI) {
      lastAqUI = t;
      updateAquariumUI()
    }
  }

  function drawAquarium(dt) {
    const aq = selectedAquarium();
    if (!aq) {
      aquariumMode = false;
      return
    }
    const bg = ctx.createLinearGradient(0, 0, 0, 500);
    bg.addColorStop(0, '#174c68');
    bg.addColorStop(.62, '#247f91');
    bg.addColorStop(1, '#c7b58b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 800, 500);
    ctx.fillStyle = 'rgba(180,236,231,.12)';
    for (let i = 0; i < 8; i++) {
      const x = 36 + i * 105;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 42, 0);
      ctx.lineTo(x + 118, 320);
      ctx.lineTo(x + 65, 320);
      ctx.fill()
    }
    ctx.fillStyle = '#0e354c';
    ctx.fillRect(0, 0, 800, 64);
    ctx.fillStyle = '#e9f5e9';
    ctx.font = 'bold 25px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`🐠 水族馆 #${aq.id} · 第 ${aq.month} 月 ${aq.day}/30 天`, 400, 42);
    ctx.fillStyle = '#d6c69f';
    ctx.fillRect(0, 350, 800, 150);
    ctx.strokeStyle = '#b8a77f';
    ctx.lineWidth = 2;
    for (let x = -50; x < 900; x += 90) {
      ctx.beginPath();
      ctx.moveTo(400, 350);
      ctx.lineTo(x, 500);
      ctx.stroke()
    }
    for (let y = 390; y < 500; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke()
    }
    const tankCount = Math.min(8, aq.big + aq.small),
      names = Object.keys(aq.fish);
    if (tankCount === 0) {
      ctx.fillStyle = 'rgba(240,248,231,.85)';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('展览玻璃缸尚未配置', 400, 225)
    }
    for (let i = 0; i < tankCount; i++) {
      const big = i < aq.big && i < 4,
        w = big ? 164 : 118,
        h = big ? 175 : 130,
        x = 48 + (i % 4) * 190,
        y = 132 + Math.floor(i / 4) * 118;
      ctx.fillStyle = '#173d4c';
      ctx.fillRect(x - 7, y - 7, w + 14, h + 22);
      const water = ctx.createLinearGradient(0, y, 0, y + h);
      water.addColorStop(0, '#79d7d3');
      water.addColorStop(1, '#307f9b');
      ctx.fillStyle = water;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#d7f3e7';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#d9c191';
      ctx.fillRect(x, y + h - 17, w, 17);
      ctx.fillStyle = '#f3e9cf';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(big ? `大玻璃缸 ${i+1}` : `小玻璃缸 ${Math.max(1,i-aq.big+1)}`, x + w / 2, y + h + 14);
      for (let k = 0; k < 3; k++) {
        ctx.font = `${18+k*3}px sans-serif`;
        const name = names.length ? names[(i + k) % names.length] : null,
          fish = name ? species.find(f => f.n === name) : null;
        ctx.fillText(fish ? fish.e : ['🐟', '🐠', '🪼'][k], x + 25 + ((t * 15 + k * 47 + i * 13) % (w - 45)), y + 42 + k * 29 + Math.sin(t * 2 + k + i) * 5)
      }
    }
    const decor = aq.decor || 0;
    if (decor) {
      ctx.textAlign = 'center';
      const items = [['🌿', '🌱'], ['🪸', '🐚'], ['🚢', '💰']];
      for (let lv = 0; lv < decor; lv++)
        for (let i = 0; i < 5; i++) {
          ctx.font = `${lv === 2 && i === 2 ? 40 : 24}px sans-serif`;
          ctx.fillText(items[lv][i % 2], 40 + i * 180 + lv * 55, 116 + (lv === 2 ? 0 : Math.sin(t * 1.5 + i + lv) * 2))
        }
    }
    for (let i = 0; i < aq.staff; i++) {
      const x = 85 + i * 145;
      ctx.fillStyle = '#e6b86d';
      ctx.beginPath();
      ctx.arc(x, 324, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ['#456d82', '#9a6658', '#5e7956', '#775c88', '#9a754e'][i % 5];
      ctx.fillRect(x - 7, 333, 14, 25)
    }
    for (let i = 0; i < Math.min(aq.visitors, 12); i++) {
      const x = 28 + ((i * 83 + t * 12) % (744)),
        y = 375 + (i % 3) * 25;
      ctx.fillStyle = ['#d59771', '#855f76', '#657d91', '#829658'][i % 4];
      ctx.beginPath();
      ctx.arc(x, y - 15, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 6, y - 8, 12, 20)
    }
    aquariumPlayer.x = Math.max(25, Math.min(775, aquariumPlayer.x + ((marketKeys.d || marketKeys.arrowright ? 1 : 0) - (marketKeys.a || marketKeys.arrowleft ? 1 : 0)) * 145 * dt));
    aquariumPlayer.y = Math.max(350, Math.min(478, aquariumPlayer.y + ((marketKeys.s || marketKeys.arrowdown ? 1 : 0) - (marketKeys.w || marketKeys.arrowup ? 1 : 0)) * 145 * dt));
    ctx.fillStyle = '#31594d';
    ctx.beginPath();
    ctx.ellipse(aquariumPlayer.x, aquariumPlayer.y + 1, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#327c78';
    ctx.fillRect(aquariumPlayer.x - 10, aquariumPlayer.y - 30, 20, 29);
    ctx.fillStyle = '#f0b75d';
    ctx.beginPath();
    ctx.arc(aquariumPlayer.x, aquariumPlayer.y - 39, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('你', aquariumPlayer.x, aquariumPlayer.y + 15)
  }

  function tankCapacity(aq) {
    return aq.big * 10 + aq.small * 4
  }

  // 上架：从仓库拿出玻璃缸展出；下架：收进仓库（不退款，随时可再上架）
  function shelfTank(kind, up) {
    const aq = selectedAquarium();
    if (!aq) {
      message('先买并选择一座水族馆。');
      return
    }
    const shown = kind === 'big' ? 'big' : 'small',
      stored = kind === 'big' ? 'bigStored' : 'smallStored',
      label = kind === 'big' ? '大玻璃缸' : '小玻璃缸';
    aq[stored] = aq[stored] || 0;
    if (up) {
      if (!aq[stored]) {
        message(`仓库里没有${label}，先去买一个。`);
        return
      }
      aq[stored]--;
      aq[shown]++;
      message(`把一个${label}上架到水族馆 #${aq.id}，容量 ${tankCapacity(aq)} 条。`)
    } else {
      if (!aq[shown]) {
        message(`水族馆 #${aq.id} 没有展出中的${label}。`);
        return
      }
      aq[shown]--;
      aq[stored]++;
      // 容量变小时，放不下的鱼回到“我的鱼”
      let over = Object.values(aq.fish).reduce((a, b) => a + b, 0) - tankCapacity(aq),
        back = 0;
      for (const name of Object.keys(aq.fish)) {
        while (over > 0 && aq.fish[name] > 0) {
          aq.fish[name]--;
          inventory[name] = (inventory[name] || 0) + 1;
          over--;
          back++
        }
        if (!aq.fish[name]) delete aq.fish[name]
      }
      let text = `把一个${label}从水族馆 #${aq.id} 下架，收进仓库。`;
      if (back) text += `放不下的 ${back} 条鱼回到了“我的鱼”。`;
      if (aq.open && aq.big + aq.small === 0) {
        aq.open = false;
        aq.visitors = 0;
        text += '没有展缸了，水族馆暂停营业。'
      }
      message(text);
      renderBucket();
      renderMarket()
    }
    renderTank();
    updateAquariumUI()
  }

  function ticketPrice(aq) {
    return 50 + (aq.decor || 0) * 15
  }

  function selectedAquarium() {
    return aquariums.find(aq => aq.id === selectedAqId) || null
  }

  function updateAquariumUI() {
    const aq = selectedAquarium();
    $('#aqDays').textContent = aq && aq.open ? `第 ${aq.month} 月 · 第 ${aq.day}/30 天` : '未开业';
    $('#aquariumButton').style.display = aquariums.length ? 'block' : 'none';
    $('#aquariumButton').textContent = aquariumMode && aq ? `↩️ 离开水族馆 #${aq.id}` : aq ? `🏛️ 进入水族馆 #${aq.id}` : '🏛️ 进入水族馆';
    $('#aqVisitors').textContent = aq ? aq.visitors : 0;
    $('#aqStatus').textContent = aq ? (aq.open ? (aq.day <= 22 ? `水族馆 #${aq.id} 营业中：本月营业日 ${aq.day}/22。` : `水族馆 #${aq.id} 休息日 ${aq.day-22}/8，下月继续营业。`) : `正在管理水族馆 #${aq.id}，购买玻璃缸即可开业，员工可继续雇佣。`) : `你有 ${aquariums.length} 座水族馆。每座各自收门票和支付员工工资。`;
    $('#aqDetails').textContent = aq ? `当前 #${aq.id}：展出大缸 ${aq.big} · 小缸 ${aq.small}${(aq.bigStored||0)+(aq.smallStored||0)?`（仓库里大缸 ${aq.bigStored||0} · 小缸 ${aq.smallStored||0}）`:''} · 容量 ${tankCapacity(aq)} 条 · 员工 ${aq.staff}/5 · 展示鱼 ${Object.values(aq.fish).reduce((x,y)=>x+y,0)} 条 · ${decorLevels[aq.decor||0].name}` : '先买一座水族馆。';
    $('#aqTicket').textContent = aq ? ticketPrice(aq) : 50;
    {
      const lv = aq ? (aq.decor || 0) : 0,
        nx = decorLevels[lv + 1];
      $('#buyDecor').disabled = !aq || !nx || coins < nx.cost;
      $('#buyDecor').textContent = !aq ? '🪸 升级当前馆装饰' : nx ? `🪸 升级装饰：${nx.name} · ${nx.cost.toLocaleString()}` : '✨ 当前馆装饰已满级'
    }
    const listHtml = aquariums.length ? aquariums.map(a => `<button type="button" data-enter-aq="${a.id}" aria-label="进入水族馆 ${a.id}" style="grid-column:1/-1;width:100%;min-height:54px;text-align:left;padding:12px;border:3px solid ${a.id===selectedAqId?'#efa94e':'#317761'};border-radius:11px;background:${a.id===selectedAqId?'#efa94e':'#317761'};color:#fff;font-size:15px;font-weight:850;cursor:pointer;pointer-events:auto">🚪 点击进入水族馆 #${a.id}　·　${a.open?'营业中':'准备中'} · ${a.big+a.small} 个展缸 · ${decorLevels[a.decor||0].name}</button>`).join('') : '<div class="tiny">还没有水族馆。</div>';
    // 只有内容变化时才重建按钮，避免点击过程中按钮被替换
    if ($('#aquariumList').dataset.html !== listHtml) {
      $('#aquariumList').dataset.html = listHtml;
      $('#aquariumList').innerHTML = listHtml
    }
    const sceneSelect = $('#sceneAquariumSelect');
    sceneSelect.style.display = aquariums.length ? 'block' : 'none';
    const optKey = aquariums.map(a => a.id).join(',');
    if (sceneSelect.dataset.key !== optKey) {
      sceneSelect.dataset.key = optKey;
      sceneSelect.innerHTML = aquariums.map(a => `<option value="${a.id}">切换到水族馆 #${a.id}</option>`).join('')
    }
    sceneSelect.value = String(selectedAqId);
    sceneSelect.onchange = () => {
      const id = Number(sceneSelect.value);
      if (aquariumMode) {
        enterAquariumById(id)
      } else {
        selectedAqId = id;
        updateAquariumUI();
        message(`已选择水族馆 #${selectedAqId}，点击上方入口进入。`)
      }
    };
    $('#buyAquarium').disabled = coins < 10000;
    $('#buyLargeTank').disabled = !aq;
    $('#buySmallTank').disabled = !aq;
    $('#unshelfLarge').disabled = !aq || !aq.big;
    $('#unshelfSmall').disabled = !aq || !aq.small;
    $('#shelfLarge').disabled = !aq || !aq.bigStored;
    $('#shelfSmall').disabled = !aq || !aq.smallStored;
    $('#unshelfLarge').textContent = `⬇️ 下架大缸（展出 ${aq?aq.big:0}）`;
    $('#unshelfSmall').textContent = `⬇️ 下架小缸（展出 ${aq?aq.small:0}）`;
    $('#shelfLarge').textContent = `⬆️ 上架大缸（仓库 ${aq?aq.bigStored||0:0}）`;
    $('#shelfSmall').textContent = `⬆️ 上架小缸（仓库 ${aq?aq.smallStored||0:0}）`;
    $('#hireStaff').disabled = !aq || aq.staff >= 5;
    $('#runAquarium').disabled = !aq || aq.open || aq.big + aq.small === 0;
    $('#runAquarium').textContent = aq?.open ? '✅ 当前馆持续经营中' : aq && aq.big + aq.small ? '🚪 开始当前馆营业' : '🔒 先为当前馆购买玻璃缸';
    $('#aquariumShow').disabled = !aq || !aq.open || coins < 150;
    $('#aquariumShow').textContent = aq && aq.showUntil > t ? `🐠 喂鱼秀进行中 · ${Math.ceil(aq.showUntil-t)}秒` : '🎉 举办喂鱼秀 · 150 鱼币';
    $('#workerStatus').textContent = `自动捕鱼：${autoFisher?'2 人已雇佣':'空缺'} · 自动售鱼：${autoSeller?'已雇佣':'空缺'} · 自动赶海：${autoClamWorker?'已雇佣':'空缺'}${nextPayrollAt?` · 自动员工下次发薪约 ${Math.max(0,Math.ceil((nextPayrollAt-t)/30))} 天后`:''}${payrollDue?' · 工资待支付':''}`;
    $('#hireFisher').disabled = autoFisher;
    $('#hireSeller').disabled = autoSeller;
    $('#hireClamWorker').disabled = autoClamWorker
  }

  function updateAquarium() {
    let changed = false;
    for (const aq of aquariums) {
      if (!aq.open) continue;
      if (aq.day <= 22 && t >= aq.nextVisitor) {
        aq.visitors++;
        aq.totalVisitors++;
        coins += ticketPrice(aq) * (aq.showUntil > t ? 2 : 1);
        aq.nextVisitor = t + ((aq.showUntil > t ? .28 : .45) + Math.random() * (aq.showUntil > t ? .14 : .25)) * (1 - (aq.decor || 0) * .08);
        $('#coins').textContent = coins;
        if (aq.id === selectedAqId) $('#aqVisitors').textContent = aq.visitors
      }
      if (t - aq.dayStart >= 30) {
        aq.dayStart += 30;
        aq.day++;
        aq.visitors = 0;
        if (aq.day > 30) {
          aq.day = 1;
          aq.month++;
          const salary = aq.staff * 1800;
          coins -= salary;
          $('#coins').textContent = coins;
          message(`水族馆 #${aq.id} 进入第 ${aq.month} 个月，支付月薪 ${salary.toLocaleString()} 鱼币。`)
        } else if (aq.day === 23) message(`水族馆 #${aq.id} 本月营业 22 天结束，进入 8 天休息期。`);
        changed = true
      }
    }
    if (changed) updateAquariumUI()
  }

  function updateDerbyUI() {
    const left = Math.max(0, Math.ceil(derbyUntil - t));
    $('#derbyText').textContent = derbyActive ? `比赛进行中！还剩 ${left} 秒，已钓 ${derbyCaught} 条。` : `本轮得分 ${derbyScore} 分 · 可随时重新挑战。`;
    $('#derbyScore').textContent = `${derbyScore} 分`;
    $('#derbyMeter').style.width = (derbyActive ? Math.max(0, 100 - left / 45 * 100) : 0) + '%';
    $('#derbyButton').textContent = derbyActive ? '🏁 比赛进行中…' : '再来一场';
    $('#derbyButton').disabled = derbyActive
  }

  function updateDerby() {
    if (derbyActive && t >= derbyUntil) {
      derbyActive = false;
      const reward = derbyScore >= 100 ? 150 : derbyScore >= 50 ? 65 : derbyScore >= 20 ? 25 : 0;
      coins += reward;
      $('#coins').textContent = coins;
      updateDerbyUI();
      message(reward ? `🏁 比赛结束！${derbyCaught} 条鱼、${derbyScore} 分，赢得 ${reward} 鱼币！` : `比赛结束！再多钓几条鱼就能拿到奖励。`)
    }
  }

  function startDerby() {
    if (derbyActive) return;
    derbyScore = 0;
    derbyCaught = 0;
    derbyActive = true;
    derbyUntil = t + 45;
    updateDerbyUI();
    message('鱼王争霸赛开始！45 秒内尽量多钓鱼、撒网！')
  }

  function updateMarketCustomers(dt) {
    const targets = [];
    const fs = shops.find(x => x.id === 'fish' && x.owned),
      ps = shops.find(x => x.id === 'pearl' && x.owned);
    if (fs && Object.values(marketStock).some(n => n > 0)) targets.push(fs);
    if (ps && Object.values(pearlMarketStock).some(n => n > 0)) targets.push(ps);
    if (targets.length && customers.length < 81 && t > nextCustomer) {
      for (let i = 0; i < 20; i++) {
        const sh = targets[Math.floor(Math.random() * targets.length)],
          vip = Math.random() < .2;
        customers.push({
          x: Math.random() * 800,
          y: 276 + Math.random() * 26,
          wait: 1 + Math.random() * 2,
          color: vip ? '#d6a948' : ['#547f9b', '#a96666', '#6a8a5a'][Math.floor(Math.random() * 3)],
          vip,
          shopId: sh.id
        })
      }
      nextCustomer = t + 10 + Math.random() * 8;
      message('鱼市一口气来了 20 位买家！快来招呼他们！')
    }
    if (marketMode && t > nextPerson && marketPeople.length < 14) {
      marketPeople.push({
        x: 45 + Math.random() * 710,
        y: 315 + Math.random() * 145,
        dx: Math.random() < .5 ? -1 : 1,
        speed: 12 + Math.random() * 20,
        color: ['#547f9b', '#a96666', '#6a8a5a', '#bb8854', '#8065a1'][Math.floor(Math.random() * 5)],
        life: 18 + Math.random() * 24
      });
      nextPerson = t + 1 + Math.random() * 1.4
    }
    for (let i = marketPeople.length - 1; i >= 0; i--) {
      const p = marketPeople[i];
      p.x += p.dx * p.speed * dt;
      p.life -= dt;
      if (p.x < 25 || p.x > 775) p.dx *= -1;
      if (p.life <= 0) marketPeople.splice(i, 1)
    }
    for (let i = customers.length - 1; i >= 0; i--) {
      const q = customers[i],
        shop = shops.find(x => x.id === q.shopId),
        stock = q.shopId === 'pearl' ? pearlMarketStock : marketStock;
      if (!shop || !Object.values(stock).some(n => n > 0)) {
        customers.splice(i, 1);
        continue
      }
      const dx = shop.x - q.x;
      q.x += Math.sign(dx) * Math.min(Math.abs(dx), 35 * dt);
      if (Math.abs(dx) < 8) {
        q.wait -= dt;
        if (q.wait <= 0) {
          const key = Object.keys(stock).find(n => stock[n] > 0);
          if (key) {
            stock[key]--;
            if (!stock[key]) delete stock[key];
            const f = q.shopId === 'pearl' ? pearlTypes.find(z => z.n === key) : species.find(z => z.n === key),
              premium = q.vip ? (q.shopId === 'pearl' ? (key === '金珍珠' || key === '黑珍珠' ? 2.5 : 1.6) : (f.rarity === '传说' ? 3 : f.rarity === '稀有' ? 2.2 : 1.5)) : 1.25,
              paid = Math.round(f.v * premium);
            coins += paid;
            $('#coins').textContent = coins;
            renderMarket();
            updateClamUI();
            message(`${q.vip?'🌟珍品收藏家':'顾客'}在${shop.name}买走${f.n}，你赚到 ${paid} 鱼币！`);
            sfx('coin', .25)
          }
          customers.splice(i, 1)
        }
      }
    }
  }

  function drawMarket(dt) {
    const g = ctx.createLinearGradient(0, 0, 0, 500);
    g.addColorStop(0, '#e7d4ae');
    g.addColorStop(1, '#c69a68');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 800, 500);
    ctx.fillStyle = '#a7c8c0';
    ctx.fillRect(0, 0, 800, 92);
    ctx.fillStyle = '#74988d';
    ctx.fillRect(0, 86, 800, 13);
    ctx.fillStyle = '#d6c29b';
    ctx.fillRect(0, 260, 800, 240);
    ctx.strokeStyle = '#b5966d';
    ctx.lineWidth = 2;
    for (let x = -100; x < 900; x += 100) {
      ctx.beginPath();
      ctx.moveTo(400, 260);
      ctx.lineTo(x, 500);
      ctx.stroke()
    }
    for (let y = 310; y < 500; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke()
    }
    ctx.fillStyle = '#fff6df';
    ctx.font = 'bold 26px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('🐟 海湾鱼市 · WASD 移动 · E 选择店铺', 400, 46);
    for (const sh of shops) {
      ctx.fillStyle = '#8b5d43';
      ctx.fillRect(sh.x - 72, 126, 144, 124);
      ctx.fillStyle = sh.color;
      ctx.beginPath();
      ctx.moveTo(sh.x - 86, 130);
      ctx.lineTo(sh.x - 70, 91);
      ctx.lineTo(sh.x + 70, 91);
      ctx.lineTo(sh.x + 86, 130);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f6e8c7';
      ctx.fillRect(sh.x - 57, 155, 114, 95);
      ctx.fillStyle = '#6c513c';
      ctx.fillRect(sh.x - 48, 172, 96, 75);
      ctx.fillStyle = '#fff8e6';
      ctx.font = 'bold 15px system-ui';
      ctx.fillText(sh.owned ? '✅ ' + sh.name : sh.name, sh.x, 151);
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#fff';
      ctx.fillText(sh.owned ? '你的店铺' : `买下 · ${sh.cost} 鱼币`, sh.x, 233);
      if (sh.owned && (sh.id === 'fish' || sh.id === 'pearl')) {
        const stock = sh.id === 'fish' ? marketStock : pearlMarketStock,
          display = sh.id === 'fish' ? Object.entries(stock).flatMap(([name, n]) => {
            const f = species.find(q => q.n === name);
            return f ? Array(Math.min(n, 5)).fill(f) : []
          }) : Object.entries(stock).flatMap(([name, n]) => {
            const f = pearlTypes.find(q => q.n === name);
            return f ? Array(Math.min(n, 5)).fill(f) : []
          });
        ctx.fillStyle = '#f5d77a';
        ctx.fillText(`待售 ${Object.values(stock).reduce((a,b)=>a+b,0)} 件`, sh.x, 190);
        display.slice(0, 5).forEach((f, i) => {
          ctx.font = '19px sans-serif';
          ctx.fillText(f.e, sh.x - 38 + i * 19, 224)
        })
      }
    }
    for (const q of marketPeople) {
      ctx.fillStyle = 'rgba(30,50,50,.2)';
      ctx.beginPath();
      ctx.ellipse(q.x, q.y + 1, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y - 22, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(q.x - 6, q.y - 14, 12, 22);
      ctx.strokeStyle = q.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(q.x - 3, q.y + 8);
      ctx.lineTo(q.x - 5 + Math.sin(t * 7 + q.x) * 3, q.y + 17);
      ctx.moveTo(q.x + 3, q.y + 8);
      ctx.lineTo(q.x + 5 - Math.sin(t * 7 + q.x) * 3, q.y + 17);
      ctx.stroke()
    }
    for (const q of customers) {
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y - 24, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(q.x - 8, q.y - 14, 16, 28);
      ctx.fillStyle = '#fff5da';
      ctx.font = '17px sans-serif';
      ctx.fillText(q.vip ? '👑' : '🛍️', q.x + 14, q.y - 11);
      if (q.vip) {
        ctx.fillStyle = '#fff2b7';
        ctx.fillText('珍品收藏家', q.x, q.y - 43)
      }
    }
    for (const sh of shops) {
      const near = Math.hypot(marketPlayer.x - sh.x, marketPlayer.y - 260) < 95;
      if (near) {
        ctx.strokeStyle = '#fff4a9';
        ctx.lineWidth = 3;
        ctx.strokeRect(sh.x - 91, 84, 182, 174);
        ctx.fillStyle = '#193b4b';
        ctx.font = 'bold 13px system-ui';
        ctx.fillText('按 E 选择', sh.x, 273)
      }
    }
    const speed = 150;
    marketPlayer.x = Math.max(34, Math.min(766, marketPlayer.x + ((marketKeys.d || marketKeys.arrowright ? 1 : 0) - (marketKeys.a || marketKeys.arrowleft ? 1 : 0)) * speed * dt));
    marketPlayer.y = Math.max(285, Math.min(468, marketPlayer.y + ((marketKeys.s || marketKeys.arrowdown ? 1 : 0) - (marketKeys.w || marketKeys.arrowup ? 1 : 0)) * speed * dt));
    ctx.fillStyle = '#40594e';
    ctx.beginPath();
    ctx.ellipse(marketPlayer.x, marketPlayer.y + 1, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#327c78';
    ctx.fillRect(marketPlayer.x - 12, marketPlayer.y - 35, 24, 34);
    ctx.fillStyle = '#f0b75d';
    ctx.beginPath();
    ctx.arc(marketPlayer.x, marketPlayer.y - 44, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2e6ce';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('你', marketPlayer.x, marketPlayer.y + 18)
  }

  let hudKey = '';

  function updateHud() {
    const walking = marketMode || aquariumMode,
      night = isNight(),
      key = `${walking}|${night}|${combo}`;
    if (key === hudKey) return;
    hudKey = key;
    sceneEl.classList.toggle('walking', walking);
    if (!walking) {
      marketKeys.w = marketKeys.a = marketKeys.s = marketKeys.d = false;
      document.querySelectorAll('#dpad .on').forEach(b => b.classList.remove('on'))
    }
    $('#phase').textContent = night ? '🌙 夜晚' : '☀️ 白天';
    $('#comboPill').textContent = `🔥 连击 ${combo}`;
    renderLurePick()
  }

  // 一帧游戏逻辑 + 画面；fixedDt 用于后台模拟
  function frame(now, fixedDt) {
    if (paused) {
      last = now;
      return
    }
    const dt = fixedDt ?? Math.min(.05, (now - last) / 1000);
    last = now;
    t += dt;
    updateHud();
    ctx.clearRect(0, 0, 800, 500);
    updateWorkers();
    updateAquarium();
    updateDerby();
    drawTank();
    if (aquariumMode) {
      drawAquarium(dt);
      return
    }
    if (!tideActive && t >= nextTide) {
      tideActive = true;
      tideUntil = t + 13;
      message('🌊 鱼群狂潮来了！趁现在抛竿或撒网！')
    }
    if (tideActive && t >= tideUntil) {
      tideActive = false;
      nextTide = t + 35 + Math.random() * 30
    }
    updateMarketCustomers(dt);
    if (marketMode) {
      drawMarket(dt);
      return
    }
    // sky and distant hills
    let sky = ctx.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, '#a9d5d0');
    sky.addColorStop(1, '#e4e8c8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 800, 500);
    const night = isNight();
    ellipse(643, 77, 39, 39, night ? '#e8e7d1' : '#ffe8a1');
    ctx.fillStyle = '#91b99b';
    ctx.beginPath();
    ctx.moveTo(0, 235);
    for (let x = 0; x <= 800; x += 80) ctx.lineTo(x, 175 + Math.sin(x * .016) * 27);
    ctx.lineTo(800, 300);
    ctx.lineTo(0, 300);
    ctx.fill();
    ctx.fillStyle = '#719c7d';
    ctx.beginPath();
    ctx.moveTo(0, 262);
    for (let x = 0; x <= 800; x += 60) ctx.lineTo(x, 205 + Math.cos(x * .014) * 25);
    ctx.lineTo(800, 320);
    ctx.lineTo(0, 320);
    ctx.fill();
    // lake
    let water = ctx.createLinearGradient(0, 250, 0, 500);
    water.addColorStop(0, '#66b9bc');
    water.addColorStop(1, '#438f9e');
    ctx.fillStyle = water;
    ctx.fillRect(0, 250, 800, 250);
    for (let i = 0; i < 19; i++) {
      const x = ((i * 67 + t * (14 + i % 4) * ((i % 2) ? 1 : -1)) % 920 + 920) % 920 - 60,
        y = 278 + (i * 37) % 204;
      ctx.globalAlpha = .14 + ((i % 3) * .04);
      rr(x, y, 34 + (i % 4) * 12, 2, 2, '#e6f4d9')
    }
    ctx.globalAlpha = 1;
    {
      const sp = spots.find(x => x.id === spot);
      if (sp && sp.tint) {
        ctx.fillStyle = sp.tint;
        ctx.fillRect(0, 250, 800, 250)
      }
    }
    // far shore + near grassy bank
    ctx.fillStyle = '#a6bd7e';
    ctx.beginPath();
    ctx.moveTo(0, 253);
    ctx.quadraticCurveTo(310, 233, 800, 252);
    ctx.lineTo(800, 269);
    ctx.quadraticCurveTo(400, 252, 0, 275);
    ctx.fill();
    ctx.fillStyle = '#769c69';
    ctx.beginPath();
    ctx.moveTo(0, 363);
    ctx.quadraticCurveTo(230, 335, 410, 375);
    ctx.quadraticCurveTo(600, 416, 800, 356);
    ctx.lineTo(800, 500);
    ctx.lineTo(0, 500);
    ctx.fill();
    ctx.fillStyle = '#91ac73';
    ctx.beginPath();
    ctx.moveTo(0, 382);
    ctx.quadraticCurveTo(210, 347, 390, 392);
    ctx.quadraticCurveTo(600, 436, 800, 372);
    ctx.lineTo(800, 408);
    ctx.quadraticCurveTo(540, 468, 320, 417);
    ctx.quadraticCurveTo(160, 383, 0, 420);
    ctx.fill();
    // reeds and flowers
    for (let i = 0; i < 18; i++) {
      let x = (i * 53 + 11) % 800,
        y = 255 + (i * 17) % 23;
      ctx.strokeStyle = i % 2 ? '#537e55' : '#628b59';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + 15);
      ctx.quadraticCurveTo(x - 8, y - 3, x + (i % 2 ? 7 : -6), y - 16);
      ctx.stroke();
      ellipse(x + (i % 2 ? 7 : -6), y - 16, 3, 6, '#a37b47')
    }
    for (let i = 0; i < 10; i++) {
      const x = (i * 91 + 30) % 800,
        y = 392 + (i * 21) % 78;
      ellipse(x, y, 3, 3, i % 2 ? '#f8e69b' : '#fff3d4')
    }
    // drifting treasure crate event
    if (!treasureActive && t >= treasureAt) {
      treasureActive = true;
      treasureUntil = t + 13;
      $('#treasureBtn').style.display = 'block';
      message('湖面漂来一个宝箱！快点左上角把它捞起来！')
    }
    if (treasureActive) {
      const bx = 365 + Math.sin(t * 1.3) * 5,
        by = 305 + Math.sin(t * 2.4) * 3;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.sin(t * 1.5) * .04);
      rr(-15, -10, 30, 22, 4, '#9a6538');
      rr(-18, -12, 36, 7, 3, '#d49a4c');
      rr(-3, -12, 6, 25, 2, '#efce68');
      ctx.restore();
      if (t > treasureUntil) {
        treasureActive = false;
        treasureAt = t + 25 + Math.random() * 20;
        $('#treasureBtn').style.display = 'none';
        message('漂流宝箱被水流带走了。')
      }
    }
    // sandy shore and clams
    ctx.fillStyle = '#d8c392';
    ctx.beginPath();
    ctx.moveTo(0, 419);
    ctx.quadraticCurveTo(180, 389, 315, 421);
    ctx.quadraticCurveTo(425, 449, 570, 418);
    ctx.lineTo(560, 500);
    ctx.lineTo(0, 500);
    ctx.fill();
    ctx.strokeStyle = '#ad956c';
    ctx.lineWidth = 2;
    clamSpots.filter(q => q.ready).forEach(q => {
      const shell = clamTypes.find(a => a.n === q.type);
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shell.e, q.x, q.y + 3);
      ctx.font = '9px system-ui';
      ctx.fillStyle = '#544a3c';
      ctx.fillText(q.type, q.x, q.y + 15)
    });
    // tree and dock
    ctx.fillStyle = '#70533d';
    ctx.fillRect(104, 89, 24, 164);
    ellipse(116, 85, 64, 55, '#4f835f');
    ellipse(77, 106, 37, 36, '#65956b');
    ellipse(148, 112, 39, 37, '#5a8b62');
    ctx.fillStyle = '#c58b57';
    ctx.fillRect(448, 244, 205, 15);
    ctx.fillRect(465, 259, 14, 79);
    ctx.fillRect(628, 259, 14, 79);
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = '#9d6b46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(461 + i * 41, 246);
      ctx.lineTo(461 + i * 41, 258);
      ctx.stroke()
    }
    // Cast net: fish swim inside on their own, then one haul collects them all
    if (netState !== 'idle') {
      let nx = netX,
        ny = netY;
      if (netState === 'throwing') {
        const u = Math.min(1, (t - netStart) / .75);
        nx = 500 + (netX - 500) * u;
        ny = 360 + (netY - 360) * u - Math.sin(u * Math.PI) * 75
      }
      if (netState === 'hauling') {
        const u = Math.min(1, (t - netStart) / 1.25);
        nx = netX + (650 - netX) * u;
        ny = netY + (360 - netY) * u
      }
      ctx.save();
      if (netState === 'throwing') ctx.globalAlpha = Math.min(1, (t - netStart) / .25);
      ctx.fillStyle = 'rgba(34,91,107,.22)';
      ctx.beginPath();
      ctx.moveTo(nx - 38, ny - 13);
      ctx.quadraticCurveTo(nx, ny - 23, nx + 38, ny - 13);
      ctx.lineTo(nx + 22, ny + 47);
      ctx.quadraticCurveTo(nx, ny + 54, nx - 22, ny + 47);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(nx - 38, ny - 13);
      ctx.lineTo(nx + 38, ny - 13);
      ctx.lineTo(nx + 22, ny + 47);
      ctx.lineTo(nx - 22, ny + 47);
      ctx.closePath();
      ctx.clip();
      netFish.forEach((f, i) => {
        const u = Math.min(1, (t - (f.entered || t)) / .7),
          fx = (f.fromX || nx) + (nx + (Math.sin(t * 2 + i * 2) * 13) - (f.fromX || nx)) * u,
          fy = ny - 18 + u * (27 + i * 3) + Math.sin(t * 3 + i) * 3;
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(f.e, fx, fy)
      });
      ctx.restore();
      ctx.strokeStyle = 'rgba(235,245,215,.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(nx, ny - 13, 38, 11, 0, 0, Math.PI * 2);
      ctx.ellipse(nx, ny + 47, 22, 7, 0, 0, Math.PI * 2);
      for (let i = -3; i <= 3; i++) {
        ctx.moveTo(nx + i * 9, ny - 12);
        ctx.lineTo(nx + i * 5.5, ny + 47)
      }
      for (let y = 0; y < 4; y++) ctx.ellipse(nx, ny + y * 15, 38 - y * 4, 8 - y * .6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#cdb88a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(650, 355);
      ctx.quadraticCurveTo(661, 330, nx + 31, ny - 12);
      ctx.stroke();
      ctx.restore();
      if (netState === 'throwing' && t - netStart > .75) {
        netState = 'soaking';
        netStart = t;
        netNext = t + 1.1
      }
      splash(nx, ny, netState === 'throwing' ? .5 : .12);
      if (netState === 'soaking' && t >= netNext) {
        const incoming = rollFish();
        incoming.entered = t;
        incoming.fromX = netX + (Math.random() < .5 ? -65 : 65);
        netFish.push(incoming);
        splash(netX, netY + 1, .65);
        netNext = t + Math.max(.25, 1.1 - netLevel * .13 - (tideActive ? .22 : 0)) + Math.random() * .25;
        const capacity = 5 + netLevel * 3;
        buttonNet.textContent = `🕸️ 鱼群入网中 · ${netFish.length}/${capacity}`;
        if (netFish.length >= capacity) {
          netState = 'full';
          buttonNet.textContent = `🪝 一网收获 · ${netFish.length} 条`;
          buttonNet.disabled = false;
          message('鱼群进网了！点击「一网收获」把它们全收起来。')
        }
      }
      if (netState === 'hauling' && t - netStart > 1.25) {
        netFish.forEach(f => awardFish(f, false));
        const n = netFish.length;
        netFish = [];
        netState = 'idle';
        buttonNet.textContent = '🕸️ 抛出渔网';
        buttonNet.disabled = false;
        refreshCatchUI();
        splash(650, 355, 2);
        sfx(n ? 'catch' : 'escape');
        message(`收网成功！一网捕获 ${n} 条鱼！`)
      }
    }
    // fisherman
    ellipse(333, 385, 37, 9, '#486b56');
    ctx.fillStyle = '#f0b75d';
    ctx.beginPath();
    ctx.arc(329, 315, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#327c78';
    ctx.beginPath();
    ctx.moveTo(315, 334);
    ctx.lineTo(344, 334);
    ctx.lineTo(351, 371);
    ctx.lineTo(310, 371);
    ctx.fill();
    ctx.strokeStyle = '#35535a';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(320, 370);
    ctx.lineTo(316, 389);
    ctx.moveTo(342, 370);
    ctx.lineTo(348, 386);
    ctx.stroke();
    ctx.strokeStyle = '#d9c7a2';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(339, 339);
    ctx.lineTo(366, 326);
    ctx.lineTo(384, 307);
    ctx.stroke();
    ctx.strokeStyle = '#875e3b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(365, 326);
    ctx.lineTo(441, 282);
    ctx.stroke();
    // bobber and line
    if (state !== 'idle') {
      bob.x = 555 + Math.sin(t * 2) * 2;
      bob.y = 280 + Math.sin(t * 3) * 3 + (state === 'bite' ? Math.sin(t * 18) * 5 : 0);
      ctx.strokeStyle = '#f4ead2';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(441, 282);
      ctx.quadraticCurveTo(493, 249, bob.x, bob.y);
      ctx.stroke();
      ellipse(bob.x, bob.y + 11, 14, 4, '#eaf7e7');
      ctx.fillStyle = '#f8f1df';
      ctx.beginPath();
      ctx.arc(bob.x, bob.y, 7, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = state === 'bite' ? '#ed654d' : '#ed7658';
      ctx.fillRect(bob.x - 7, bob.y, 14, 7);
      ctx.fillStyle = '#f7eed2';
      ctx.fillRect(bob.x - 7, bob.y + 7, 14, 5);
      if (state === 'bite') {
        ellipse(bob.x, bob.y - 20, 17, 5, '#f4eed1');
        ellipse(bob.x, bob.y - 29, 10, 3, '#f4eed1')
      }
    }
    // occasional fish shadows
    for (let i = 0; i < 4; i++) {
      const x = ((i * 173 + t * (8 + i * 2)) % 900) - 50,
        y = 311 + i * 34 + Math.sin(t * 1.7 + i) * 8;
      ctx.globalAlpha = .13;
      ellipse(x, y, 16, 6, '#123d5c');
      ctx.beginPath();
      ctx.moveTo(x - 14, y);
      ctx.lineTo(x - 23, y - 7);
      ctx.lineTo(x - 23, y + 7);
      ctx.fillStyle = '#123d5c';
      ctx.fill();
      ctx.globalAlpha = 1
    }
    // several schools of small fish swimming beneath the surface
    const schoolColors = ['#f5c46a', '#ed9a79', '#c6e6ce', '#83d0d0', '#f0a1bd'];
    for (let school = 0; school < 4; school++) {
      const dir = school % 2 ? -1 : 1,
        travel = (t * (15 + school * 4) * dir + school * 247 + 1000) % 920,
        baseX = dir > 0 ? travel - 60 : 860 - travel,
        y0 = 286 + school * 23 + Math.sin(t * 1.4 + school) * 7;
      for (let j = 0; j < 7; j++) {
        const fx = baseX + dir * j * 17,
          fy = y0 + Math.sin(t * 3 + j * 1.7 + school) * 5;
        if (fx < 8 || fx > 792) continue;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(dir, 1);
        ctx.globalAlpha = .72;
        ctx.fillStyle = schoolColors[(school + j) % schoolColors.length];
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-11, -4);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#214b5b';
        ctx.beginPath();
        ctx.arc(4, -1, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore()
      }
    }
    // sea life swimming through the bay
    const swimmers = [{
      e: '🦈',
      x: (80 + t * 17) % 920 - 60,
      y: 326,
      size: 30
    }, {
      e: '🐬',
      x: (720 - t * 22 % 900 + 900) % 900 - 40,
      y: 370 + Math.sin(t * 2) * 7,
      size: 28
    }, {
      e: '🐋',
      x: (260 + t * 8) % 900 - 50,
      y: 348 + Math.sin(t) * 4,
      size: 42
    }, {
      e: '🪼',
      x: 178 + Math.sin(t * .7) * 28,
      y: 310 + Math.sin(t * 1.3) * 14,
      size: 27
    }];
    for (const a of swimmers) {
      ctx.save();
      ctx.globalAlpha = .78;
      ctx.font = `${a.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(a.e, a.x, a.y);
      ctx.restore()
    }
    // little lake sparkle
    for (let i = 0; i < 6; i++) {
      const x = (i * 147 + t * 7) % 800,
        y = 294 + (i * 31) % 163;
      ctx.globalAlpha = .48;
      ctx.fillStyle = '#fff4ce';
      ctx.fillRect(x, y, 8, 2)
    }
    ctx.globalAlpha = 1;
    if (jump) {
      const age = t - jump.start;
      if (age < 1.2) {
        const u = age / 1.2;
        const fy = 276 - Math.sin(u * Math.PI) * 102;
        ctx.save();
        ctx.translate(555, fy);
        ctx.rotate(Math.sin(u * Math.PI * 2) * .5);
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(jump.emoji, 0, 0);
        ctx.restore()
      } else jump = null
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const q = particles[i];
      q.x += q.vx;
      q.y += q.vy;
      q.vy += .12;
      q.life -= dt;
      if (q.life <= 0) {
        particles.splice(i, 1);
        continue
      }
      ctx.globalAlpha = Math.min(1, q.life / q.max);
      ellipse(q.x, q.y, q.r, q.r * 1.35, '#e9ffff')
    }
    ctx.globalAlpha = 1;
    if (tideActive) {
      rr(260, 132, 280, 36, 14, 'rgba(255,247,222,.9)');
      ctx.fillStyle = '#245c68';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🌊 鱼群狂潮 · 稀有鱼更活跃', 400, 156)
    }
    if (t - weatherAt > 60) {
      weatherAt = t;
      weather = ['晴朗', '多云', '小雨'][Math.floor(Math.random() * 3)];
      $('#weather').textContent = ({
        晴朗: '☀️ 晴朗',
        多云: '☁️ 多云',
        小雨: '🌧️ 小雨'
      })[weather]
    }
    if (night) {
      ctx.fillStyle = 'rgba(25,45,77,.22)';
      ctx.fillRect(0, 0, 800, 500)
    }
    if (weather === '小雨') {
      ctx.strokeStyle = 'rgba(235,249,244,.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 24; i++) {
        let x = (i * 47 + t * 60) % 800,
          y = (i * 67 + t * 90) % 500;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 6, y + 12);
        ctx.stroke()
      }
    }
    if (state === 'waiting' && t >= biteAt) {
      state = 'bite';
      biteAt = t;
      if (t - biteSplashAt > .7) {
        splash(bob.x, 285, 1.3);
        biteSplashAt = t
      }
      button.disabled = false;
      button.textContent = '🐟 鱼咬钩了！收竿';
      sfx('bite');
      message('咬钩了！快点「收竿」！')
    }
    if (state === 'reel') {
      if (hold) {
        progress = Math.min(100, progress + (31 + rod * 8) * dt);
        sfx('reel', .09)
      }
      else progress = Math.max(0, progress - 13 * dt);
      $('#meter').style.width = progress + '%';
      if (progress >= 100) {
        finishCatch()
      } else if (progress <= 0 && t - biteAt > 6) {
        escapeFish()
      }
    }
    if (state === 'bite' && t - biteAt > 4) escapeFish();
    {
      const sp = spots.find(x => x.id === spot);
      rr(662, 462, 126, 28, 12, 'rgba(255,249,233,.88)');
      ctx.fillStyle = '#244e4d';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`📍 ${sp.e} ${sp.name}`, 725, 481)
    }
  }

  function draw(now) {
    if (!document.hidden) frame(now);
    requestAnimationFrame(draw)
  }

  // ---------- 后台运行 ----------
  // 浏览器会在标签页隐藏时停掉 requestAnimationFrame、把定时器降到约每秒一次甚至每分钟一次，
  // 所以在后台用定时器按实际流逝时间补算游戏逻辑（只算逻辑，不真正渲染）。
  const BG_STEP = .1,
    BG_MAX_SECONDS = 600;
  let autoPause = true;
  try {
    autoPause = localStorage.getItem('bay-fishing-autopause') !== '0'
  } catch (e) {}

  function simulateTo(now) {
    if (paused) {
      last = now;
      return
    }
    let elapsed = (now - last) / 1000;
    if (!(elapsed > 0)) return;
    // 超过上限的时间直接跳过，避免切回来时卡住太久
    elapsed = Math.min(elapsed, BG_MAX_SECONDS);
    const steps = Math.ceil(elapsed / BG_STEP),
      dt = elapsed / steps;
    ctx = blankCtx;
    tankCtx = blankCtx2;
    try {
      for (let i = 0; i < steps && !paused; i++) frame(now, dt)
    } finally {
      ctx = realCtx;
      tankCtx = realTankCtx;
      last = now
    }
  }
  setInterval(() => {
    if (document.hidden && !autoPause) simulateTo(performance.now())
  }, 1000);

  function renderAutoPause() {
    $('#autoPause').checked = autoPause;
    $('#autoPauseHint').textContent = autoPause ? '切到其他标签页或最小化时，游戏自动暂停。' : '离开网页时游戏继续运行：员工照常工作和领工资，水族馆照常收门票。单次离开最多补算 10 分钟。'
  }
  $('#autoPause').onchange = () => {
    autoPause = $('#autoPause').checked;
    try {
      localStorage.setItem('bay-fishing-autopause', autoPause ? '1' : '0')
    } catch (e) {}
    renderAutoPause();
    message(autoPause ? '已开启：离开网页时自动暂停。' : '已关闭自动暂停：离开网页时游戏继续运行。')
  };
  renderAutoPause();

  function message(s) {
    $('#toast').textContent = s
  }

  function cast() {
    if (paused) return;
    if (state === 'idle') {
      state = 'waiting';
      button.textContent = '⏳ 等鱼上钩…';
      button.disabled = true;
      message('浮漂落水了，安静等一等…');
      sfx('cast');
      biteAt = t + (bait ? 1.5 : 2.8) + Math.random() * (bait ? 3 : 5.3);
      if (bait > 0) $('#gearInfo').textContent = `${rodNames[rod]}鱼竿 · 蚯蚓鱼饵 ${bait} 个（本竿生效）`;
      return
    }
    if (state === 'bite') {
      perfectHook = t - biteAt < .7;
      state = 'reel';
      progress = 34 + rod * 6 + (perfectHook ? 15 : 0);
      button.disabled = false;
      button.textContent = '🪝 收线（按住）';
      $('#progressText').textContent = perfectHook ? '✨ 完美收竿！按住收线' : '按住收线';
      if (perfectHook) sfx('perfect');
      message(perfectHook ? '✨ 完美收竿！稀有鱼概率提升，按住收线！' : '鱼咬钩了！按住按钮或空格收线，别让进度掉光！');
      return
    }
  }

  // opts.rod: 鱼竿钓鱼（饵料、完美收竿生效）；渔网和自动员工不吃这些加成
  function rollFish(opts = {}) {
    const night = isNight(),
      useLure = opts.rod && lure && lureStock[lure] > 0 ? lure : '',
      lureBonus = useLure === 'shrimp' ? .08 : useLure === 'glow' ? (night ? .2 : .03) : 0,
      rareChance = .04 + rod * .03 + (bait ? .13 : 0) + lureBonus + (opts.rod && opts.perfect ? .1 : 0) + (weather === '小雨' ? .06 : 0) + (tideActive ? .12 : 0),
      legendShare = useLure === 'glow' && night ? .3 : .16,
      roll = Math.random(),
      pool = species.filter(f => spotOf(f) === spot && (!f.night || night)),
      legendary = pool.filter(f => f.rarity === '传说'),
      rare = pool.filter(f => f.rarity === '稀有'),
      regular = pool.filter(f => ['常见', '普通', '少见'].includes(f.rarity)),
      pick = a => a[Math.floor(Math.random() * a.length)];
    // 夜晚稀有鱼更容易遇到
    const nightRare = night ? rare.filter(f => f.night) : [];
    if (roll < rareChance * legendShare && legendary.length) return pick(legendary);
    if (roll < rareChance && rare.length) return nightRare.length && Math.random() < .5 ? pick(nightRare) : pick(rare);
    // 虾饵：普通鱼里更偏向甲壳类
    if (useLure === 'shrimp') {
      const crust = regular.filter(f => ['🦐', '🦞', '🦀'].includes(f.e));
      if (crust.length && Math.random() < .4) return pick(crust)
    }
    return pick(regular.length ? regular : pool)
  }

  function awardFish(f, show = true) {
    inventory[f.n] = (inventory[f.n] || 0) + 1;
    catchCount++;
    const firstTime = !codex[f.n];
    codex[f.n] = (codex[f.n] || 0) + 1;
    if (firstTime) {
      renderCodex();
      checkCodexRewards();
      if (!show) message(`📖 图鉴新收录：${f.e} ${f.n}！`)
    }
    if (derbyActive) {
      derbyCaught++;
      derbyScore += f.rarity === '传说' ? 50 : f.rarity === '稀有' ? 25 : f.rarity === '少见' ? 12 : 6;
      updateDerbyUI()
    }
    if (show) {
      $('#guide').textContent = `漂亮！你钓到了${f.n}！到鱼市卖掉它就能赚鱼币。`;
      message(firstTime ? `📖 新图鉴！${f.e} 钓到了${f.n}！` : `${f.e} 钓到了${f.n}！去鱼市卖掉它吧。`)
    }
  }

  function refreshCatchUI() {
    const goals = [{
      n: 5,
      label: '初次丰收',
      reward: 15
    }, {
      n: 10,
      label: '湖上熟手',
      reward: 35
    }, {
      n: 20,
      label: '捕鱼大师',
      reward: 100
    }];
    for (const g of goals)
      if (catchCount >= g.n && !achievements[g.n]) {
        achievements[g.n] = true;
        coins += g.reward;
        message(`🏆 解锁成就「${g.label}」！奖励 ${g.reward} 鱼币。`);
        sfx('unlock')
      } const next = goals.find(g => !achievements[g.n]);
    $('#achievements').textContent = next ? `已钓 ${catchCount} 条 · 再钓 ${Math.max(0,next.n-catchCount)} 条解锁「${next.label}」，奖励 ${next.reward} 鱼币。` : '全部钓鱼成就已解锁！';
    $('#achievementMeter').style.width = (next ? Math.min(100, catchCount / next.n * 100) : 100) + '%';
    $('#count').textContent = catchCount;
    $('#count2').textContent = catchCount;
    $('#coins').textContent = coins;
    renderBucket();
    renderMarket();
    if (!questDone && catchCount >= questTarget) {
      questDone = true;
      coins += 20;
      $('#coins').textContent = coins;
      $('#quest').textContent = '委托完成！奖励 +20 鱼币';
      $('#questMeter').style.width = '100%'
    } else if (!questDone) $('#questMeter').style.width = Math.min(100, catchCount / questTarget * 100) + '%'
  }

  function finishCatch() {
    if (state !== 'reel') return;
    state = 'idle';
    button.disabled = false;
    button.textContent = '🎣 再抛一次';
    fish = rollFish({
      rod: true,
      perfect: perfectHook
    });
    if (bait > 0) bait--;
    if (lure && lureStock[lure] > 0) {
      lureStock[lure]--;
      if (!lureStock[lure]) {
        lure = '';
      }
      renderLurePick()
    }
    jump = {
      start: t,
      emoji: fish.e
    };
    splash(bob.x, 286, 2.1);
    $('#gearInfo').textContent = `${rodNames[rod]}鱼竿 · 蚯蚓鱼饵 ${bait} 个`;
    awardFish(fish);
    combo++;
    bestCombo = Math.max(bestCombo, combo);
    let bonusText = '';
    if (combo >= 3) {
      const bonus = Math.min(30, combo * 2);
      coins += bonus;
      bonusText = ` 🔥 ${combo} 连击 +${bonus} 鱼币`
    }
    $('#progressText').textContent = (perfectHook ? '✨ 完美！' : '钓上来了！') + (combo >= 2 ? ` 连击 ${combo}` : '');
    if (bonusText) message($('#toast').textContent + bonusText);
    perfectHook = false;
    sfx(fish.rarity === '传说' || fish.rarity === '稀有' ? 'rare' : 'catch');
    if (combo >= 3) setTimeout(() => sfx('combo'), 380);
    $('#meter').style.width = '100%';
    refreshCatchUI();
    setTimeout(() => {
      if (state === 'idle') {
        $('#progressText').textContent = '等待咬钩';
        $('#meter').style.width = '0%'
      }
    }, 1500)
  }

  function escapeFish() {
    state = 'idle';
    if (combo >= 3) message(`鱼儿逃走啦，${combo} 连击中断了！`);
    combo = 0;
    perfectHook = false;
    sfx('escape');
    button.disabled = false;
    button.textContent = '🎣 再试一次';
    progress = 0;
    $('#meter').style.width = '0%';
    $('#progressText').textContent = '鱼跑掉了';
    $('#guide').textContent = '哎呀，鱼挣脱了！再抛一次，这回盯紧浮漂。';
    if (!$('#toast').textContent.includes('连击中断')) message('鱼儿逃走啦，再试一次！')
  }

  function updateClamUI() {
    clams = Object.values(shellStock).reduce((a, b) => a + b, 0);
    pearls = Object.values(pearlStock).reduce((a, b) => a + b, 0);
    $('#clamCount').textContent = clams;
    $('#pearlCount').textContent = pearls;
    $('#openClam').disabled = clams < 1;
    $('#sellPearls').disabled = pearls < 1;
    $('#digClam').disabled = !clamSpots.some(q => q.ready);
    $('#clamStock').textContent = clamTypes.map(a => `${a.e} ${a.n} ×${shellStock[a.n]||0}`).join('　·　');
    $('#pearlStock').innerHTML = pearlTypes.filter(a => pearlStock[a.n]).map(a => `<div class="fishrow"><span>${a.e} ${a.n} ×${pearlStock[a.n]}</span><button data-sell-pearl="${a.n}">上架 · ${a.v}币</button></div>`).join('') || '<div class="empty">还没有珍珠</div>';
    document.querySelectorAll('[data-sell-pearl]').forEach(b => b.onclick = () => sellPearl(b.dataset.sellPearl))
  }

  function digClam() {
    const spot = clamSpots.find(q => q.ready);
    if (!spot) {
      message('沙滩上的蛤蜊都挖完了，过一会儿再来看看。');
      return
    }
    spot.ready = false;
    shellStock[spot.type] = (shellStock[spot.type] || 0) + 1;
    updateClamUI();
    splash(spot.x, spot.y, .55);
    message(`挖到一只${spot.type}！打开它找找珍珠吧。`);
    sfx('splash');
    setTimeout(() => {
      spot.ready = true;
      updateClamUI()
    }, 12000)
  }

  function openClam() {
    if (clams < 1) return;
    const type = clamTypes.find(a => (shellStock[a.n] || 0) > 0);
    if (!type) return;
    shellStock[type.n]--;
    if (Math.random() < type.rate) {
      const pearlName = type.drops[Math.floor(Math.random() * type.drops.length)];
      pearlStock[pearlName] = (pearlStock[pearlName] || 0) + 1;
      splash(350, 410, 1.1);
      message(`✨ ${type.n}里开出了${pearlName}！`);
      sfx('rare')
    } else message(`${type.n}打开了，里面没有珍珠，再挖一个试试。`);
    updateClamUI()
  }

  function sellPearl(name) {
    const shop = shops.find(a => a.id === 'pearl'),
      n = pearlStock[name] || 0;
    if (!n) return;
    if (!marketMode) {
      message('先去鱼市，到珍珠铺上架珍珠。');
      return
    }
    if (!shop.owned) {
      message('先走到珍珠铺旁按 E 买下店铺。');
      return
    }
    if (Math.hypot(marketPlayer.x - shop.x, marketPlayer.y - 260) > 115) {
      message('走到珍珠铺柜台旁，再把珍珠上架。');
      return
    }
    delete pearlStock[name];
    pearlMarketStock[name] = (pearlMarketStock[name] || 0) + n;
    updateClamUI();
    renderMarket();
    message(`把 ${n} 颗${name}摆上珍珠铺柜台，等顾客来买。`)
  }

  function sellPearls() {
    if (!pearls) return;
    if (!marketMode) {
      message('先去鱼市，到珍珠铺上架珍珠。');
      return
    }
    if (!shops.find(a => a.id === 'pearl').owned) {
      message('先走到珍珠铺旁按 E 买下店铺。');
      return
    }
    if (Math.hypot(marketPlayer.x - 400, marketPlayer.y - 260) > 115) {
      message('走到珍珠铺柜台旁，再把珍珠上架。');
      return
    }
    for (const p of pearlTypes) {
      const n = pearlStock[p.n] || 0;
      if (n) pearlMarketStock[p.n] = (pearlMarketStock[p.n] || 0) + n
    }
    pearlStock = {};
    updateClamUI();
    renderMarket();
    message('珍珠都摆上珍珠铺了，顾客会陆续来买！')
  }

  function renderTank() {
    const stock = selectedAquarium()?.fish || {},
      total = Object.values(stock).reduce((a, b) => a + b, 0);
    $('#tankCount').textContent = selectedAquarium() ? `当前水族馆展缸里有 ${total} 条鱼。` : '先购买水族馆再放入鱼。';
    $('#tankStock').innerHTML = Object.entries(stock).filter(([, n]) => n > 0).map(([name, n]) => {
      const f = species.find(x => x.n === name);
      return `<div class="fishrow"><span>${f.e} ${name} ×${n}</span><button data-take-tank="${name}">取回一条</button></div>`
    }).join('') || '<div class="empty">从“我的鱼”选择鱼放入当前水族馆。</div>';
    document.querySelectorAll('[data-take-tank]').forEach(b => b.onclick = () => takeFromTank(b.dataset.takeTank))
  }

  function putInTank(name) {
    const aq = selectedAquarium();
    if (!aq) {
      message('先买并选择一座水族馆。');
      return
    }
    if (!inventory[name]) return;
    const capacity = tankCapacity(aq),
      total = Object.values(aq.fish).reduce((a, b) => a + b, 0);
    if (!capacity) {
      message('先给当前水族馆购买玻璃缸。');
      return
    }
    if (total >= capacity) {
      message('当前水族馆展缸都满了，再添玻璃缸或取回一些鱼。');
      return
    }
    inventory[name]--;
    if (!inventory[name]) delete inventory[name];
    aq.fish[name] = (aq.fish[name] || 0) + 1;
    renderBucket();
    renderTank();
    renderMarket();
    updateAquariumUI();
    message(`把一条${name}放进水族馆 #${aq.id} 的玻璃展缸。`)
  }

  function takeFromTank(name) {
    const aq = selectedAquarium();
    if (!aq || !aq.fish[name]) return;
    aq.fish[name]--;
    if (!aq.fish[name]) delete aq.fish[name];
    inventory[name] = (inventory[name] || 0) + 1;
    renderTank();
    renderBucket();
    renderMarket();
    updateAquariumUI();
    message(`从水族馆 #${aq.id} 取回一条${name}。`)
  }

  function drawTank() {
    const tankStock = selectedAquarium()?.fish || {};
    const w = tankCanvas.width,
      h = tankCanvas.height,
      g = tankCtx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#8dd9d0');
    g.addColorStop(1, '#438ea5');
    tankCtx.fillStyle = g;
    tankCtx.fillRect(0, 0, w, h);
    tankCtx.fillStyle = 'rgba(231,249,224,.35)';
    for (let i = 0; i < 7; i++) {
      const x = (i * 53 + t * 18) % w,
        y = 17 + (i * 19) % 85;
      tankCtx.beginPath();
      tankCtx.arc(x, y, 2 + (i % 2), 0, Math.PI * 2);
      tankCtx.fill()
    }
    let idx = 0;
    for (const [name, n] of Object.entries(tankStock)) {
      const f = species.find(x => x.n === name);
      for (let i = 0; i < Math.min(n, 8); i++) {
        const x = 25 + ((idx * 47 + t * (18 + idx % 3 * 4)) % (w - 50)),
          y = 36 + (idx * 23) % 57 + Math.sin(t * 2 + idx) * 6;
        tankCtx.font = '22px sans-serif';
        tankCtx.textAlign = 'center';
        tankCtx.fillText(f.e, x, y);
        idx++
      }
    }
    if (!idx) {
      tankCtx.fillStyle = 'rgba(255,255,255,.8)';
      tankCtx.font = 'bold 14px system-ui';
      tankCtx.textAlign = 'center';
      tankCtx.fillText('鱼儿可以在这里自由游泳', w / 2, h / 2 + 5)
    }
  }

  function renderMarket() {
    $('#fishMarket').innerHTML = species.map(f => `<button data-buy-fish="${f.n}">${f.e} ${f.n}<br>🪙 ${Math.max(5,f.v*2)} 币</button>`).join('');
    $('#sellMarket').innerHTML = Object.entries(inventory).filter(([, num]) => num > 0).map(([n, num]) => {
      const f = species.find(x => x.n === n);
      return `<button data-sell-fish="${n}">${f.e} 上架 ${n} ×${num}<br>顾客约付 ${Math.round(f.v*1.25)*num} 币</button>`
    }).join('') || '<div class="empty">还没有鱼可上架。</div>';
    $('#businessShops').innerHTML = shops.map(x => `<button data-shop-tag="${x.id}">${x.owned?'✅':'🏪'} ${x.name} · ${x.owned?'已拥有':x.cost+' 币'}</button>`).join('');
    $('#shopStatus').textContent = shops.some(x => x.owned) ? `已拥有：${shops.filter(x=>x.owned).map(x=>x.name).join('、')}。鲜鱼铺待售 ${Object.values(marketStock).reduce((a,b)=>a+b,0)} 条。` : '还没有店铺。进鱼市走近店铺，按 E 买下。';
    {
      const d = !Object.values(inventory).some(n => n > 0);
      $('#sellAll').disabled = d;
      $('#sellAllMarket').disabled = d
    }
    document.querySelectorAll('[data-buy-fish]').forEach(b => b.onclick = () => {
      const f = species.find(x => x.n === b.dataset.buyFish),
        price = Math.max(5, f.v * 2);
      if (!marketMode || !shops.find(x => x.id === 'fish').owned || Math.hypot(marketPlayer.x - 195, marketPlayer.y - 260) > 115) {
        message('请到鱼市鲜鱼铺买下店铺，再到柜台购买鱼。');
        return
      }
      if (coins < price) {
        message(`鱼币不够，${f.n}需要 ${price} 币。`);
        return
      }
      coins -= price;
      inventory[f.n] = (inventory[f.n] || 0) + 1;
      $('#coins').textContent = coins;
      renderBucket();
      renderMarket();
      message(`从鱼市买下了${f.n}。`)
    });
    document.querySelectorAll('[data-sell-fish]').forEach(b => b.onclick = () => sellFish(b.dataset.sellFish, inventory[b.dataset.sellFish] || 1))
  }

  function renderBucket() {
    $('#bucket').innerHTML = Object.entries(inventory).filter(([, num]) => num > 0).map(([n, num]) => {
      const f = species.find(x => x.n === n);
      return `<div class="fishrow"><span>${f.e} ${n} ×${num}</span><button data-tank-fish="${n}">放进水族箱</button></div>`
    }).join('') || '<div class="empty">还没有鱼，先去钓鱼或到鱼市买几条吧。</div>';
    document.querySelectorAll('[data-tank-fish]').forEach(b => b.onclick = () => putInTank(b.dataset.tankFish))
  }

  function sellFish(name, amount) {
    const shop = shops.find(x => x.id === 'fish'),
      f = species.find(x => x.n === name),
      owned = inventory[name] || 0,
      n = Math.min(amount, owned);
    if (!f || !n) return;
    if (!marketMode) {
      message('先点「去鱼市」，到鲜鱼铺上架鱼。');
      return
    }
    if (!shop.owned) {
      message('先走到鲜鱼铺旁按 E 买下店铺，才能上架卖鱼。');
      return
    }
    if (Math.hypot(marketPlayer.x - shop.x, marketPlayer.y - 260) > 115) {
      message('走到鲜鱼铺柜台旁，再把鱼上架。');
      return
    }
    inventory[name] -= n;
    if (!inventory[name]) delete inventory[name];
    marketStock[name] = (marketStock[name] || 0) + n;
    renderBucket();
    renderMarket();
    message(`把 ${n} 条${f.n}摆上鲜鱼铺柜台，等顾客来买。`)
  }
  button.addEventListener('click', () => {
    if (state === 'idle') cast();
    else if (state === 'bite') cast()
  });
  button.addEventListener('pointerdown', e => {
    if (state === 'bite') cast();
    if (state === 'reel') {
      e.preventDefault();
      hold = true;
      button.setPointerCapture(e.pointerId)
    }
  });
  button.addEventListener('pointerup', () => hold = false);
  button.addEventListener('pointercancel', () => hold = false);
  button.addEventListener('lostpointercapture', () => hold = false);
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (state === 'bite') cast();
      if (state === 'reel') hold = true
    }
  });
  document.addEventListener('keyup', e => {
    if (e.code === 'Space') hold = false
  });
  $('#treasureBtn').onclick = () => {
    if (!treasureActive) return;
    treasureActive = false;
    $('#treasureBtn').style.display = 'none';
    const prize = Math.random();
    if (prize < .3) {
      const p = pearlTypes[Math.floor(Math.random() * pearlTypes.length)];
      pearlStock[p.n] = (pearlStock[p.n] || 0) + 1;
      updateClamUI();
      coins += 12;
      message(`宝箱里有 ${p.e}${p.n} 和 12 鱼币！`)
    } else {
      const amount = 20 + Math.floor(Math.random() * 31);
      coins += amount;
      message(`打开漂流宝箱，发现 ${amount} 鱼币！`)
    }
    $('#coins').textContent = coins;
    sfx('coin');
    treasureAt = t + 28 + Math.random() * 24
  };

  function enterAquariumById(id) {
    const nextId = Number(id);
    if (!aquariums.some(a => a.id === nextId)) {
      message('先购买一座水族馆。');
      return
    }
    selectedAqId = nextId;
    aquariumMode = true;
    marketMode = false;
    marketKeys = {};
    aquariumPlayer = {
      x: 400,
      y: 440
    };
    renderTank();
    updateAquariumUI();
    message(`欢迎来到水族馆 #${selectedAqId}！WASD 或右下角方向键可以在展厅里走动。`)
  }
  document.addEventListener('click', e => {
    const entry = e.target.closest('#aquariumList [data-enter-aq]');
    if (!entry) return;
    e.preventDefault();
    e.stopPropagation();
    enterAquariumById(entry.dataset.enterAq)
  }, true);

  function enterSelectedAquarium() {
    enterAquariumById(selectedAqId || aquariums[0]?.id)
  }

  function leaveAquarium() {
    aquariumMode = false;
    marketMode = false;
    marketKeys = {};
    message('已回到海湾。');
    updateAquariumUI()
  }
  $('#enterSelectedAquarium').onclick = enterSelectedAquarium;
  $('#exitAquarium').onclick = leaveAquarium;
  $('#aquariumButton').onclick = () => {
    if (aquariumMode) leaveAquarium();
    else enterSelectedAquarium()
  };
  $('#marketButton').onclick = () => {
    marketMode = !marketMode;
    marketKeys = {};
    if (marketMode) {
      aquariumMode = false;
      marketPlayer = {
        x: 400,
        y: 438
      };
      $('#marketButton').textContent = '↩ 回到海湾';
      message('欢迎来到鱼市！WASD 移动，走到店铺旁按 E（手机用右下角方向键和 E）购买或选择。')
    } else {
      $('#marketButton').textContent = '🏪 去鱼市';
      aquariumMode = false;
      message('回到了海湾。')
    }
  };

  function selectNearbyShop() {
    const sh = shops.map(a => ({
      a,
      d: Math.hypot(marketPlayer.x - a.x, marketPlayer.y - 260)
    })).sort((x, y) => x.d - y.d)[0];
    if (sh && sh.d < 105) interactShop(sh.a);
    else message('走近一家店铺再按 E。')
  }
  document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === 'escape' && aquariumMode) {
      e.preventDefault();
      leaveAquarium();
      return
    }
    if (!marketMode && !aquariumMode) return;
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      marketKeys[k] = true;
      e.preventDefault()
    }
    if (k === 'e') {
      e.preventDefault();
      if (marketMode) selectNearbyShop();
      else message('欢迎参观海湾水族馆！')
    }
  });
  document.addEventListener('keyup', e => {
    marketKeys[e.key.toLowerCase()] = false
  });
  // 触屏方向键：按住移动，松开停止
  document.querySelectorAll('#dpad [data-dir]').forEach(b => {
    const k = b.dataset.dir,
      on = e => {
        e.preventDefault();
        marketKeys[k] = true;
        b.classList.add('on');
        try {
          b.setPointerCapture(e.pointerId)
        } catch (err) {}
      },
      off = () => {
        marketKeys[k] = false;
        b.classList.remove('on')
      };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('lostpointercapture', off);
    b.addEventListener('contextmenu', e => e.preventDefault())
  });
  $('#dpad [data-act="e"]').addEventListener('click', () => {
    if (marketMode) selectNearbyShop();
    else if (aquariumMode) message('欢迎参观海湾水族馆！')
  });
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'p' && !e.target.closest('input,select,textarea')) {
      e.preventDefault();
      setPaused(!paused)
    }
  });
  c.addEventListener('click', e => {
    if (!marketMode) return;
    const r = c.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width * 800,
      y = (e.clientY - r.top) / r.height * 500,
      sh = shops.find(a => Math.abs(x - a.x) < 88 && y > 85 && y < 275);
    if (sh) interactShop(sh)
  });
  $('#businessShops').onclick = e => {
    const b = e.target.closest('[data-shop-tag]');
    if (b) interactShop(shops.find(x => x.id === b.dataset.shopTag))
  };
  $('#hireFisher').onclick = () => {
    if (autoFisher) {
      message('自动捕鱼员工已经在岗。');
      return
    }
    autoFisher = true;
    autoFishAt = t + 2;
    if (!nextPayrollAt) nextPayrollAt = t + 30 * 30;
    updateAquariumUI();
    message('雇好了两名自动捕鱼员工，他们马上开始钓鱼。')
  };
  $('#hireSeller').onclick = () => {
    if (autoSeller) {
      message('自动售鱼员工已经在岗。');
      return
    }
    autoSeller = true;
    autoSellAt = t + 2;
    if (!nextPayrollAt) nextPayrollAt = t + 30 * 30;
    updateAquariumUI();
    message('雇好了自动售鱼员工；需要先买下鲜鱼铺，他才能卖鱼。')
  };
  $('#hireClamWorker').onclick = () => {
    if (autoClamWorker) {
      message('自动赶海员工已经在岗。');
      return
    }
    autoClamWorker = true;
    autoClamAt = t + 2;
    if (!nextPayrollAt) nextPayrollAt = t + 30 * 30;
    updateAquariumUI();
    message('雇好了自动赶海员工，他会捡河蚌、开珍珠并送去珍珠铺。')
  };
  $('#buyAquarium').onclick = () => {
    if (coins < 10000) {
      message('购买一座水族馆需要 10,000 鱼币。');
      return
    }
    coins -= 10000;
    const aq = {
      id: nextAqId++,
      big: 0,
      small: 0,
      staff: 0,
      open: false,
      day: 0,
      month: 1,
      dayStart: t,
      visitors: 0,
      totalVisitors: 0,
      nextVisitor: t + .6,
      fish: {},
      showUntil: 0,
      decor: 0,
      bigStored: 0,
      smallStored: 0
    };
    aquariums.push(aq);
    selectedAqId = aq.id;
    $('#coins').textContent = coins;
    renderTank();
    updateAquariumUI();
    message(`买下了水族馆 #${aq.id}！每座馆可以独立配置展缸和员工。`)
  };
  $('#buyLargeTank').onclick = () => {
    const aq = selectedAquarium();
    if (!aq) {
      message('先买并选择一座水族馆。');
      return
    }
    if (coins < 5000) {
      message('大玻璃缸需要 5,000 鱼币。');
      return
    }
    coins -= 5000;
    aq.big++;
    $('#coins').textContent = coins;
    updateAquariumUI();
    message(`给水族馆 #${aq.id} 添了一个大玻璃缸。`)
  };
  $('#buySmallTank').onclick = () => {
    const aq = selectedAquarium();
    if (!aq) {
      message('先买并选择一座水族馆。');
      return
    }
    if (coins < 1000) {
      message('小玻璃缸需要 1,000 鱼币。');
      return
    }
    coins -= 1000;
    aq.small++;
    $('#coins').textContent = coins;
    updateAquariumUI();
    message(`给水族馆 #${aq.id} 添了一个小玻璃缸。`)
  };
  $('#hireStaff').onclick = () => {
    const aq = selectedAquarium();
    if (!aq) {
      message('先买并选择一座水族馆。');
      return
    }
    if (aq.staff >= 5) {
      message('这座水族馆已经雇满 5 名员工。');
      return
    }
    aq.staff = 5;
    updateAquariumUI();
    message(`给水族馆 #${aq.id} 雇满 5 名员工，月薪每人 1,800 鱼币。`)
  };
  $('#runAquarium').onclick = () => {
    const aq = selectedAquarium();
    if (!aq) {
      message('先买一座水族馆。');
      return
    }
    if (aq.big + aq.small === 0) {
      message(`水族馆 #${aq.id} 开业前需要至少一个玻璃展缸。`);
      return
    }
    aq.open = true;
    aq.day = 1;
    aq.month = 1;
    aq.visitors = 0;
    aq.nextVisitor = t + .4;
    aq.dayStart = t;
    updateAquariumUI();
    message(`水族馆 #${aq.id} 开业！员工 ${aq.staff}/5；可继续为这座馆雇员。每月营业 22 天，门票 ${ticketPrice(aq)} 鱼币。`)
  };
  $('#aquariumShow').onclick = () => {
    const aq = selectedAquarium();
    if (!aq || !aq.open) {
      message('先让当前水族馆开业。');
      return
    }
    if (coins < 150) {
      message('举办喂鱼秀需要 150 鱼币。');
      return
    }
    coins -= 150;
    $('#coins').textContent = coins;
    aq.showUntil = t + 10;
    updateAquariumUI();
    message(`水族馆 #${aq.id} 开始喂鱼秀！接下来 10 秒游客增加，每张门票收入 ${ticketPrice(aq)*2} 鱼币。`)
  };
  $('#derbyButton').onclick = startDerby;
  $('#digClam').onclick = digClam;
  $('#openClam').onclick = openClam;
  $('#sellPearls').onclick = sellPearls;
  $('#clamHint').onclick = () => message('蛤蜊、扇贝、牡蛎、鸟蛤和巨蚌的珍珠概率与种类各不相同。');
  $('#sellAll').onclick = $('#sellAllMarket').onclick = () => {
    if (!marketMode) {
      message('先点「去鱼市」，到鲜鱼铺上架鱼。');
      return
    }
    const fishShop = shops.find(x => x.id === 'fish');
    if (!fishShop.owned) {
      message('先走到鲜鱼铺旁按 E 买下店铺。');
      return
    }
    if (Math.hypot(marketPlayer.x - fishShop.x, marketPlayer.y - 260) > 115) {
      message('走到鲜鱼铺柜台旁，再把鱼上架。');
      return
    }
    const count = Object.values(inventory).reduce((a, b) => a + b, 0);
    if (!count) {
      message('你还没有鱼可以上架。');
      return
    }
    for (const [name, num] of Object.entries(inventory)) marketStock[name] = (marketStock[name] || 0) + num;
    inventory = {};
    renderBucket();
    renderMarket();
    message('鱼都摆上鲜鱼铺了，顾客会陆续来买！')
  };
  $('#netShop').onclick = () => {
    const costs = [60, 140, 300, 600],
      names = ['普通', '加固', '宽幅', '深海', '巨型'];
    if (netLevel >= costs.length) {
      message('已经拥有顶级深海渔网！');
      return
    }
    const cost = costs[netLevel];
    if (coins < cost) {
      message(`鱼币不够，还差 ${cost-coins}。`);
      return
    }
    coins -= cost;
    netLevel++;
    $('#coins').textContent = coins;
    $('#netInfo').textContent = `${names[netLevel]}渔网 · 最多捕 ${5+netLevel*3} 条`;
    if (netLevel >= costs.length) {
      $('#netShop').textContent = '✨ 已拥有顶级渔网';
      $('#netShop').disabled = true
    } else $('#netShop').textContent = `🪢 升级${names[netLevel+1]}渔网 · ${costs[netLevel]} 币`;
    message(`渔网升级为${names[netLevel]}渔网！网更大，鱼群也更快进网。`)
  };
  $('#rodShop').onclick = () => {
    if (rod >= rodNames.length - 1) {
      message('已经拥有顶级幻彩鱼竿！');
      return
    }
    const next = rod + 1,
      cost = rodCosts[next];
    if (coins < cost) {
      message(`鱼币不够，还差 ${cost-coins}。`);
      return
    }
    coins -= cost;
    rod = next;
    $('#coins').textContent = coins;
    $('#gearInfo').textContent = `${rodNames[rod]}鱼竿 · 蚯蚓鱼饵 ${bait} 个`;
    if (rod >= rodNames.length - 1) {
      $('#rodShop').textContent = '✨ 已拥有顶级幻彩鱼竿';
      $('#rodShop').disabled = true
    } else $('#rodShop').textContent = `🎣 ${rodNames[rod+1]}鱼竿 · ${rodCosts[rod+1]} 币`;
    message(`升级到${rodNames[rod]}鱼竿！收线更快，也更容易遇到稀有鱼。`)
  };
  $('#baitShop').onclick = () => {
    if (coins < 12) {
      message('鱼币不够，先去钓几条鱼吧。');
      return
    }
    coins -= 12;
    bait += 3;
    $('#coins').textContent = coins;
    $('#gearInfo').textContent = `${rodNames[rod]}鱼竿 · 蚯蚓鱼饵 ${bait} 个`;
    message('买到了 3 个蚯蚓鱼饵，下次抛竿有稀有鱼加成！')
  };
  function buyLure(kind, cost) {
    if (coins < cost) {
      message(`鱼币不够，${lureNames[kind]}需要 ${cost} 币。`);
      return
    }
    coins -= cost;
    lureStock[kind] += 3;
    lure = kind;
    $('#coins').textContent = coins;
    renderLurePick();
    message(kind === 'glow' ? '买到 3 个夜光饵，已装上！夜晚用它更容易钓到传说鱼。' : '买到 3 个虾饵，已装上！稀有鱼和虾蟹更容易上钩。')
  }
  $('#shrimpShop').onclick = () => buyLure('shrimp', 30);
  $('#glowShop').onclick = () => buyLure('glow', 60);

  function renderLurePick() {
    $('#shrimpCount').textContent = lureStock.shrimp;
    $('#glowCount').textContent = lureStock.glow;
    document.querySelectorAll('#lurePick [data-lure]').forEach(b => {
      const k = b.dataset.lure;
      b.classList.toggle('current', k === lure);
      b.disabled = !!k && !lureStock[k]
    })
  }
  $('#lurePick').onclick = e => {
    const b = e.target.closest('[data-lure]');
    if (!b || b.disabled) return;
    lure = b.dataset.lure;
    renderLurePick();
    message(lure ? `已装上${lureNames[lure]}。` : '不使用特殊饵料。')
  };

  // ---------- 钓点 ----------
  function renderSpots() {
    $('#spotList').innerHTML = spots.map(sp => {
      const total = species.filter(f => spotOf(f) === sp.id).length,
        got = species.filter(f => spotOf(f) === sp.id && codex[f.n]).length;
      return `<button type="button" data-spot="${sp.id}" class="${sp.id===spot?'current':''}">${sp.e} ${sp.name} · ${sp.id===spot?'当前钓点':unlockedSpots[sp.id]?'点击前往':'解锁 '+sp.cost+' 币'} <small>(${got}/${total})</small></button>`
    }).join('')
  }
  $('#spotList').onclick = e => {
    const b = e.target.closest('[data-spot]');
    if (!b) return;
    const sp = spots.find(x => x.id === b.dataset.spot);
    if (sp.id === spot) {
      message(`你已经在${sp.name}了。`);
      return
    }
    if (state !== 'idle' || netState !== 'idle') {
      message('先收竿、收网，再换钓点。');
      return
    }
    if (marketMode || aquariumMode) {
      message('先回到海边，再换钓点。');
      return
    }
    if (!unlockedSpots[sp.id]) {
      if (coins < sp.cost) {
        message(`解锁${sp.name}需要 ${sp.cost} 鱼币，还差 ${sp.cost-coins}。`);
        return
      }
      coins -= sp.cost;
      unlockedSpots[sp.id] = true;
      $('#coins').textContent = coins;
      sfx('unlock')
    }
    spot = sp.id;
    renderSpots();
    message(`来到${sp.e} ${sp.name}！这里有不一样的鱼。`)
  };

  // ---------- 图鉴 ----------
  function renderCodex() {
    const total = species.length,
      got = species.filter(f => codex[f.n]).length;
    $('#codexCount').textContent = `${got}/${total}`;
    $('#codex').innerHTML = spots.map(sp => `<h3>${sp.e} ${sp.name}${codexRewards[sp.id]?' · ✅ 已集齐':' · 集齐奖励 '+sp.reward+' 币'}</h3>` + species.filter(f => spotOf(f) === sp.id).map(f => codex[f.n] ? `<div title="${f.rarity}${f.night?' · 夜晚':''} · 钓到 ${codex[f.n]} 次"><b>${f.e}</b>${f.n}<br><small>×${codex[f.n]}</small></div>` : `<div class="unknown" title="${f.rarity}${f.night?' · 只在夜晚出现':''}"><b>${f.e}</b>？？？<br><small>${f.rarity}${f.night?'·🌙':''}</small></div>`).join('')).join('');
    renderSpots()
  }

  function checkCodexRewards() {
    for (const sp of spots) {
      if (codexRewards[sp.id]) continue;
      const list = species.filter(f => spotOf(f) === sp.id);
      if (list.every(f => codex[f.n])) {
        codexRewards[sp.id] = true;
        coins += sp.reward;
        $('#coins').textContent = coins;
        sfx('unlock');
        message(`📖 集齐${sp.name}全部 ${list.length} 种鱼！奖励 ${sp.reward} 鱼币！`);
        renderCodex()
      }
    }
  }

  // ---------- 水族馆装饰 ----------
  $('#unshelfLarge').onclick = () => shelfTank('big', false);
  $('#unshelfSmall').onclick = () => shelfTank('small', false);
  $('#shelfLarge').onclick = () => shelfTank('big', true);
  $('#shelfSmall').onclick = () => shelfTank('small', true);
  $('#buyDecor').onclick = () => {
    const aq = selectedAquarium();
    if (!aq) {
      message('先买并选择一座水族馆。');
      return
    }
    const nx = decorLevels[(aq.decor || 0) + 1];
    if (!nx) {
      message('这座馆的装饰已经是最高级。');
      return
    }
    if (coins < nx.cost) {
      message(`${nx.name}需要 ${nx.cost.toLocaleString()} 鱼币，还差 ${(nx.cost-coins).toLocaleString()}。`);
      return
    }
    coins -= nx.cost;
    aq.decor = (aq.decor || 0) + 1;
    $('#coins').textContent = coins;
    updateAquariumUI();
    message(`水族馆 #${aq.id} 换上了${nx.name}！门票涨到 ${ticketPrice(aq)} 鱼币，游客来得更快。`)
  };

  // ---------- 暂停 / 静音 ----------
  function setPaused(v) {
    paused = v;
    if (paused) hold = false;
    $('#pauseOverlay').hidden = !paused;
    $('#pauseBtn').textContent = paused ? '▶️ 继续' : '⏸ 暂停';
    $('#pauseBtn').setAttribute('aria-pressed', String(paused))
  }
  $('#pauseBtn').onclick = () => setPaused(!paused);
  $('#pauseOverlay').onclick = () => setPaused(false);

  function renderMute() {
    $('#muteBtn').textContent = volume === 1 ? '🔊 大声' : volume ? '🔉 小声' : '🔇 静音';
    $('#muteBtn').setAttribute('aria-label', `音效音量：${$('#muteBtn').textContent.slice(2)}，点击切换`);
    $('#muteBtn').setAttribute('aria-pressed', String(!volume))
  }
  $('#muteBtn').onclick = () => {
    volume = volume === 1 ? .5 : volume ? 0 : 1;
    try {
      localStorage.setItem('bay-fishing-volume', String(volume))
    } catch (e) {}
    unlockAudio();
    if (master) master.gain.setValueAtTime(volume, actx.currentTime);
    renderMute();
    sfx('coin')
  };
  renderMute();
  $('#bgmBtn').onclick = () => {
    unlockAudio();
    setBgm(!bgmOn)
  };
  setBgm(bgmOn);
  buttonNet.onclick = () => {
    if (netState === 'idle') {
      netState = 'throwing';
      netStart = t;
      netX = 535 + Math.random() * 145;
      netY = 294 + Math.random() * 42;
      netFish = [];
      buttonNet.disabled = true;
      buttonNet.textContent = '🕸️ 鱼网正在撒开…';
      splash(530, 340, 1.5);
      message('渔网撒进湖里了，等鱼群自己游进网中…');
      sfx('splash')
    } else if (netState === 'full') {
      netState = 'hauling';
      netStart = t;
      buttonNet.disabled = true;
      buttonNet.textContent = '🌊 正在收网…';
      message('收网中！网里的鱼一条也跑不掉。');
      sfx('splash')
    }
  };
  $('#restart').onclick = () => {
    if (!confirm('确定要重新开始吗？当前存档会被清除。')) return;
    resetting = true;
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch (e) {}
    location.reload()
  };
  // ---------- 存档 (localStorage) ----------
  const SAVE_KEY = 'bay-fishing-day-save-v1';

  function snapshot() {
    return {
      v: 1,
      t, catchCount, coins, aquariums, selectedAqId, nextAqId,
      autoFisher, autoSeller, autoClamWorker, autoFishAt, autoSellAt, autoClamAt,
      nextPayrollAt, payrollDue, inventory, tankStock, rod, bait, netLevel,
      questDone, questTarget, shellStock, pearlStock, marketStock, pearlMarketStock,
      achievements, treasureAt, nextTide,
      owned: shops.filter(x => x.owned).map(x => x.id),
      clamReady: clamSpots.map(q => q.ready),
      codex, codexRewards, lure, lureStock, bestCombo, spot, unlockedSpots, lastDaily, dailyStreak
    }
  }

  let resetting = false;

  function saveGame() {
    if (resetting) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot()))
    } catch (e) {}
  }

  function loadGame() {
    let d;
    try {
      d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')
    } catch (e) {
      return false
    }
    if (!d || d.v !== 1) return false;
    const obj = (x) => x && typeof x === 'object' ? x : {};
    const num = (x, def) => Number.isFinite(x) ? x : def;
    t = num(d.t, 0);
    catchCount = num(d.catchCount, 0);
    coins = num(d.coins, 500);
    aquariums = Array.isArray(d.aquariums) ? d.aquariums : [];
    selectedAqId = aquariums.some(a => a.id === d.selectedAqId) ? d.selectedAqId : (aquariums[0]?.id || 0);
    nextAqId = num(d.nextAqId, aquariums.reduce((m, a) => Math.max(m, a.id), 0) + 1);
    autoFisher = !!d.autoFisher;
    autoSeller = !!d.autoSeller;
    autoClamWorker = !!d.autoClamWorker;
    autoFishAt = num(d.autoFishAt, 0);
    autoSellAt = num(d.autoSellAt, 0);
    autoClamAt = num(d.autoClamAt, 0);
    nextPayrollAt = num(d.nextPayrollAt, 0);
    payrollDue = !!d.payrollDue;
    inventory = obj(d.inventory);
    tankStock = obj(d.tankStock);
    rod = Math.min(Math.max(0, num(d.rod, 0)), rodNames.length - 1);
    bait = num(d.bait, 0);
    netLevel = Math.min(Math.max(0, num(d.netLevel, 0)), 4);
    questDone = !!d.questDone;
    questTarget = num(d.questTarget, 3);
    shellStock = obj(d.shellStock);
    pearlStock = obj(d.pearlStock);
    marketStock = obj(d.marketStock);
    pearlMarketStock = obj(d.pearlMarketStock);
    achievements = obj(d.achievements);
    treasureAt = num(d.treasureAt, t + 20);
    nextTide = num(d.nextTide, t + 40);
    shops.forEach(x => x.owned = Array.isArray(d.owned) && d.owned.includes(x.id));
    if (Array.isArray(d.clamReady)) clamSpots.forEach((q, i) => q.ready = d.clamReady[i] !== false);
    aquariums.forEach(a => {
      a.decor = Math.min(3, Math.max(0, num(a.decor, 0)));
      a.big = Math.max(0, num(a.big, 0));
      a.small = Math.max(0, num(a.small, 0));
      a.bigStored = Math.max(0, num(a.bigStored, 0));
      a.smallStored = Math.max(0, num(a.smallStored, 0))
    });
    codex = obj(d.codex);
    codexRewards = obj(d.codexRewards);
    lureStock = {
      shrimp: num(obj(d.lureStock).shrimp, 0),
      glow: num(obj(d.lureStock).glow, 0)
    };
    lure = lureNames[d.lure] && lureStock[d.lure] > 0 ? d.lure : '';
    bestCombo = num(d.bestCombo, 0);
    unlockedSpots = Object.assign({
      bay: true
    }, obj(d.unlockedSpots));
    spot = spots.some(x => x.id === d.spot) && unlockedSpots[d.spot] ? d.spot : 'bay';
    lastDaily = typeof d.lastDaily === 'string' ? d.lastDaily : '';
    dailyStreak = num(d.dailyStreak, 0);

    // 同步界面文字
    const netNames = ['普通', '加固', '宽幅', '深海', '巨型'],
      netCosts = [60, 140, 300, 600];
    $('#gearInfo').textContent = `${rodNames[rod]}鱼竿 · 蚯蚓鱼饵 ${bait} 个`;
    if (rod >= rodNames.length - 1) {
      $('#rodShop').textContent = '✨ 已拥有顶级幻彩鱼竿';
      $('#rodShop').disabled = true
    } else $('#rodShop').textContent = `🎣 ${rodNames[rod+1]}鱼竿 · ${rodCosts[rod+1]} 币`;
    $('#netInfo').textContent = `${netNames[netLevel]}渔网 · 最多捕 ${5+netLevel*3} 条`;
    if (netLevel >= netCosts.length) {
      $('#netShop').textContent = '✨ 已拥有顶级渔网';
      $('#netShop').disabled = true
    } else $('#netShop').textContent = `🪢 升级${netNames[netLevel+1]}渔网 · ${netCosts[netLevel]} 币`;
    refreshCatchUI();
    if (questDone) {
      $('#quest').textContent = '委托完成！奖励 +20 鱼币';
      $('#questMeter').style.width = '100%'
    }
    $('#coins').textContent = coins;
    return true
  }

  // ---------- 存档导出 / 导入 ----------
  $('#exportSave').onclick = () => {
    saveGame();
    const blob = new Blob([JSON.stringify(snapshot(), null, 2)], {
        type: 'application/json'
      }),
      a = document.createElement('a'),
      d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = `bay-fishing-save-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    message('存档文件已导出。')
  };
  $('#importSave').onclick = () => $('#importFile').click();
  $('#importFile').onchange = async () => {
    const file = $('#importFile').files[0];
    $('#importFile').value = '';
    if (!file) return;
    let d;
    try {
      d = JSON.parse(await file.text())
    } catch (e) {
      message('导入失败：这不是有效的存档文件。');
      return
    }
    if (!d || d.v !== 1 || !Number.isFinite(d.coins)) {
      message('导入失败：存档格式不对。');
      return
    }
    if (!confirm(`导入这个存档（鱼币 ${d.coins}，渔获 ${d.catchCount||0} 条）？当前进度会被覆盖。`)) return;
    resetting = true;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(d))
    } catch (e) {
      resetting = false;
      message('导入失败：浏览器无法写入存档。');
      return
    }
    location.reload()
  };

  // ---------- 每日登录奖励 ----------
  function dateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }

  function checkDaily() {
    const now = new Date(),
      today = dateKey(now),
      y = new Date(now);
    y.setDate(now.getDate() - 1);
    if (lastDaily !== today) {
      dailyStreak = lastDaily === dateKey(y) ? dailyStreak + 1 : 1;
      lastDaily = today;
      const reward = 50 * Math.min(dailyStreak, 7);
      coins += reward;
      $('#coins').textContent = coins;
      message(`📅 每日登录奖励 +${reward} 鱼币（连续 ${dailyStreak} 天）`);
      sfx('coin');
      saveGame()
    }
    $('#dailyText').textContent = `已连续登录 ${dailyStreak} 天 · 今日奖励已领取。明天再来可得 ${50*Math.min(dailyStreak+1,7)} 鱼币（最多每天 350）。`
  }

  loadGame();
  renderCodex();
  renderLurePick();
  checkDaily();
  setInterval(saveGame, 5000);
  window.addEventListener('pagehide', saveGame);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      saveGame();
      if (autoPause) setPaused(true);
      else last = performance.now()
    } else {
      // 补上最后一次后台定时器之后的时间
      if (!autoPause) simulateTo(performance.now());
      checkDaily()
    }
  });

  renderMarket();
  renderTank();
  updateClamUI();
  updateAquariumUI();
  updateDerbyUI();
  $('#coins').textContent = coins;
  requestAnimationFrame(draw)
})();
