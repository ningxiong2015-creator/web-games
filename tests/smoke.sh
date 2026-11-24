#!/bin/sh
# 冒烟测试：在无头 Chrome（或 Chromium）中加载游戏并模拟基本操作，检查没有脚本报错。
# 用法：./tests/smoke.sh
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
HARNESS="$ROOT/.smoke-test.html"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$HARNESS" "$PROFILE"' EXIT

if [ ! -x "$CHROME" ]; then
  echo "找不到 Chrome：$CHROME（可用 CHROME=/path/to/chrome 指定）" >&2
  exit 2
fi

# 在 game.js 之前注入错误捕获，之后注入测试步骤
python3 - "$ROOT/index.html" "$HARNESS" <<'PY'
import sys
src, dst = sys.argv[1], sys.argv[2]
html = open(src, encoding='utf-8').read()
pre = """<script>
window.__errors=[];
addEventListener('error',e=>__errors.push(String(e.message)));
addEventListener('unhandledrejection',e=>__errors.push('promise: '+e.reason));
window.confirm=()=>true;
// 可控的 document.hidden，用来模拟切到其他标签页
window.__hidden=false;Object.defineProperty(document,'hidden',{get:()=>window.__hidden});
// 无头模式的虚拟时间下 rAF 不推进，改用定时器驱动画面
window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),16);
</script>"""
post = r"""<script>
(async()=>{
  const $=s=>document.querySelector(s), log=[], sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const until=async(fn,ms=20000)=>{const end=Date.now()+ms;while(Date.now()<end){if(fn())return true;await sleep(50)}return false};
  const check=(name,ok)=>{log.push((ok?"PASS ":"FAIL ")+name);document.body.dataset.smoke=JSON.stringify({log,errors:__errors,partial:true})};
  try{
    check('初始鱼币为 500 + 每日奖励', Number($('#coins').textContent)===550);
    check('图鉴已渲染', $('#codex').children.length>10);
    // 钓一条鱼
    $('#cast').click();
    check('等待咬钩', await until(()=>$('#cast').textContent.includes('收竿')));
    $('#cast').click();
    document.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}));
    check('钓上来', await until(()=>Number($('#count').textContent)===1));
    document.dispatchEvent(new KeyboardEvent('keyup',{code:'Space',key:' '}));
    check('图鉴收录 1 种', $('#codexCount').textContent.startsWith('1/'));
    // 暂停
    $('#pauseBtn').click();
    check('暂停遮罩显示', !$('#pauseOverlay').hidden);
    $('#pauseOverlay').click();
    check('继续', $('#pauseOverlay').hidden);
    // 钓点：鱼币不够解锁深海
    await until(()=>$('#cast').textContent.includes('抛'));
    $('#spotList [data-spot="river"]').click();
    check('解锁并前往河口', $('#spotList .current')?.dataset.spot==='river');
    // 鱼市 + 方向键
    $('#marketButton').click();
    await sleep(200);
    check('进入鱼市后显示方向键', getComputedStyle($('#dpad')).display==='grid');
    const up=$('#dpad [data-dir="w"]');
    up.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1}));
    await sleep(300);
    up.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1}));
    $('#dpad [data-act="e"]').click();
    $('#marketButton').click();
    await sleep(200);
    check('回到海湾后隐藏方向键', getComputedStyle($('#dpad')).display==='none');
    // 离开网页：默认自动暂停
    const hide=v=>{window.__hidden=v;document.dispatchEvent(new Event('visibilitychange'))};
    hide(true);
    check('离开网页时默认自动暂停', !$('#pauseOverlay').hidden);
    hide(false);
    $('#pauseOverlay').click();
    // 关闭自动暂停后，后台继续运行
    $('#autoPause').checked=false;
    $('#autoPause').dispatchEvent(new Event('change'));
    hide(true);
    check('关闭开关后离开网页不暂停', $('#pauseOverlay').hidden);
    $('#cast').click();
    check('后台仍在计时（鱼会咬钩）', await until(()=>$('#cast').textContent.includes('收竿')||$('#cast').textContent.includes('再试')));
    hide(false);
    check('自动暂停设置已保存', localStorage.getItem('bay-fishing-autopause')==='0');
    // 新功能界面
    check('每日委托生成 3 个', $('#questList').querySelectorAll('.questrow').length===3);
    check('统计卡片已渲染', $('#stats').children.length>=10);
    check('鱼王挑战已渲染', $('#bossText').textContent.includes('鱼王'));
    check('料理菜单已渲染', $('#recipes').querySelectorAll('[data-cook]').length===4);
    // 存档
    await sleep(5500);
    const save=JSON.parse(localStorage.getItem('bay-fishing-day-save-v1')||'{}');
    check('自动存档包含图鉴和钓点', save.spot==='river' && Object.keys(save.codex||{}).length===1);
    check('自动存档包含尺寸纪录和委托', Object.keys(save.records||{}).length===1 && save.dailyQuests?.list?.length===3);
  }catch(e){__errors.push('test: '+e.message)}
  check('没有脚本错误', __errors.length===0);
  document.body.dataset.smoke=JSON.stringify({log,errors:__errors});
})();
</script>"""
html = html.replace('<script src="game.js"></script>', pre + '<script src="game.js"></script>' + post)
open(dst, 'w', encoding='utf-8').write(html)
PY

OUT="$("$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$PROFILE" \
  --allow-file-access-from-files --virtual-time-budget=60000 \
  --dump-dom "file://$HARNESS" 2>/dev/null)"

python3 - "$OUT" <<'PY'
import sys, re, json, html
m = re.search(r'data-smoke="([^"]*)"', sys.argv[1])
if not m:
    print('FAIL 测试没有跑完（页面可能报错或超时）')
    sys.exit(1)
r = json.loads(html.unescape(m.group(1)))
for line in r['log']:
    print(line)
for e in r['errors']:
    print('  错误：' + e)
failed = [l for l in r['log'] if l.startswith('FAIL')]
print(f"\n{len(r['log'])-len(failed)}/{len(r['log'])} 通过")
sys.exit(1 if failed else 0)
PY
