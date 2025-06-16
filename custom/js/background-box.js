// 数据持久化函数
function saveData(name, data) {
    localStorage.setItem(name, JSON.stringify({ 'time': Date.now(), 'data': data }))
}
function loadData(name, time) {
    let d = JSON.parse(localStorage.getItem(name));
    if (d) {
        let t = Date.now() - d.time
        if (t < (time * 60 * 1000) && t > -1) return d.data;
    }
    return 0;
}

// 页面加载时自动读取并应用背景
try {
    let data = loadData('blogbg', 1440)
    if (data) changeBg(data, 1)
    else localStorage.removeItem('blogbg');
} catch (error) { localStorage.removeItem('blogbg'); }

// 切换背景函数
function changeBg(s, flag) {
    let bg = document.getElementById('web_bg')
    if (s.charAt(0) == '#') {
        bg.style.backgroundColor = s
        bg.style.backgroundImage = 'none'
    } else {
        bg.style.backgroundImage = s
    }
    if (!flag) { saveData('blogbg', s) }
}

var winbox = ''
// 创建弹窗
function createWinbox() {
    let div = document.createElement('div')
    document.body.appendChild(div)
    winbox = WinBox({
        id: 'changeBgBox',
        index: 999,
        title: "切换背景",
        x: "center",
        y: "center",
        minwidth: '300px',
        height: "60%",
        background: 'var(--anzhiyu-main)', // 使用主题主色调
        onmaximize: () => { div.innerHTML = `<style>body::-webkit-scrollbar {display: none;}div#changeBgBox {width: 100% !important;}</style>` },
        onrestore: () => { div.innerHTML = '' }
    });
    winResize();
    window.addEventListener('resize', winResize)

    // 【重要】在这里定义你的背景图片和颜色库
    winbox.body.innerHTML = `
    <div id="article-container" style="padding:10px;">
    
    <p><button onclick="localStorage.removeItem('blogbg');location.reload();" style="background:#ff7242;display:block;width:100%;padding: 15px 0;border-radius:6px;color:white;"><i class="fas fa-arrows-rotate"></i> 恢复默认背景</button></p>
    
    <h2 id="图片（手机）">图片（手机）</h2>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://img.vm.laomishuo.com/image/2021/12/2021122715170589.jpeg)" class="pimgbox" onclick="changeBg('url(https://img.vm.laomishuo.com/image/2021/12/2021122715170589.jpeg)')"></a>
    </div>
    
    <h2 id="图片（电脑）">图片（电脑）</h2>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://cn.bing.com/th?id=OHR.GBRTurtle_ZH-CN6069093254_1920x1080.jpg)" class="imgbox" onclick="changeBg('url(https://cn.bing.com/th?id=OHR.GBRTurtle_ZH-CN6069093254_1920x1080.jpg)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5badc9c03.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5badc9c03.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5ba422dc2.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5ba422dc2.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c0c20cf4.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c0c20cf4.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c12c172a.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c12c172a.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c1828ab2.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c1828ab2.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c205288d.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c205288d.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c282ebac.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c282ebac.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c286636f.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c286636f.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c2f88638.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c2f88638.png)')"></a>
      <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://bu.dusays.com/2025/06/15/684e5c3063f58.png)" class="imgbox" onclick="changeBg('url(https://bu.dusays.com/2025/06/15/684e5c3063f58.png)')"></a>
    </div>
    
    <h2 id="渐变色">渐变色</h2>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: linear-gradient(to right, #eecda3, #ef629f)" onclick="changeBg('linear-gradient(to right, #eecda3, #ef629f)')"></a>
    </div>
    
    <h2 id="纯色">纯色</h2>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #7D9D9C" onclick="changeBg('#7D9D9C')"></a> 
    </div>
    
    <h3 id="红色系">红色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #EF9A9A" onclick="changeBg('#EF9A9A')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #EF5350" onclick="changeBg('#EF5350')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #E53935" onclick="changeBg('#E53935')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #C62828" onclick="changeBg('#C62828')"></a>
    </div>
    
    <h3 id="粉色系">粉色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #F48FB1" onclick="changeBg('#F48FB1')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #EC407A" onclick="changeBg('#EC407A')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #D81B60" onclick="changeBg('#D81B60')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #AD1457" onclick="changeBg('#AD1457')"></a>
    </div>
    
    <h3 id="紫色系">紫色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #CE93D8" onclick="changeBg('#CE93D8')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #AB47BC" onclick="changeBg('#AB47BC')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #8E24AA" onclick="changeBg('#8E24AA')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #6A1B9A" onclick="changeBg('#6A1B9A')"></a>
    </div>
    
    <h3 id="蓝色系">蓝色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #90CAF9" onclick="changeBg('#90CAF9')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #42A5F5" onclick="changeBg('#42A5F5')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #1E88E5" onclick="changeBg('#1E88E5')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #1565C0" onclick="changeBg('#1565C0')"></a>
    </div>
    
    <h3 id="青色系">青色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #80DEEA" onclick="changeBg('#80DEEA')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #26C6DA" onclick="changeBg('#26C6DA')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #00ACC1" onclick="changeBg('#00ACC1')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #00838F" onclick="changeBg('#00838F')"></a>
    </div>
    
    <h3 id="绿色系">绿色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #A5D6A7" onclick="changeBg('#A5D6A7')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #66BB6A" onclick="changeBg('#66BB6A')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #43A047" onclick="changeBg('#43A047')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #2E7D32" onclick="changeBg('#2E7D32')"></a>
    </div>
    
    <h3 id="橙色系">橙色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #FFCC80" onclick="changeBg('#FFCC80')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #FFA726" onclick="changeBg('#FFA726')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #FB8C00" onclick="changeBg('#FB8C00')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #EF6C00" onclick="changeBg('#EF6C00')"></a>
    </div>
    
    <h3 id="灰色系">灰色系</h3>
    <div class="bgbox">
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #EEEEEE" onclick="changeBg('#EEEEEE')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #BDBDBD" onclick="changeBg('#BDBDBD')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #757575" onclick="changeBg('#757575')"></a>
      <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #424242" onclick="changeBg('#424242')"></a>
    </div>
`;
}

// 适应窗口大小
function winResize() {
    let box = document.querySelector('#changeBgBox')
    if (!box || box.classList.contains('min') || box.classList.contains('max')) return
    var offsetWid = document.documentElement.clientWidth;
    if (offsetWid <= 768) {
        winbox.resize(offsetWid * 0.95 + "px", "90%").move("center", "center");
    } else {
        winbox.resize(offsetWid * 0.6 + "px", "70%").move("center", "center");
    }
}

// 切换弹窗显示/隐藏
function toggleWinbox() {
    if (document.querySelector('#changeBgBox')) winbox.toggleClass('hide');
    else createWinbox();
}