// ======================= 横竖屏自适应背景媒体加载器 =======================
let lastOrientation = null; // 记录上一次的方向状态
let isMediaInitializing = false; // 防止重复初始化的状态锁

// ================= 新增滚动渐变效果函数 =================
function initScrollFadeEffect() {
  const mediaContainer = document.getElementById('home-media-container');
  if (!mediaContainer) return;

  const mediaElement = mediaContainer.querySelector('.home-media');
  if (!mediaElement) return;

  // 节流函数优化性能
  function throttle(func, limit) {
    let lastFunc, lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }
  }

  // 处理滚动时的透明度变化
  function handleScrollFade() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // 计算透明度：从1（完全不透明）到0（完全透明）
    // 当滚动到一屏高度时，透明度变为0
    let opacity = 1 - (scrollY / windowHeight);
    opacity = Math.max(0, Math.min(1, opacity)); // 限制在0-1范围

    mediaElement.style.opacity = opacity;
  }

  // 节流处理滚动事件（每50ms检查一次）
  const throttledScrollHandler = throttle(handleScrollFade, 50);

  // 添加滚动监听
  window.addEventListener('scroll', throttledScrollHandler);

  // 初始化时执行一次
  handleScrollFade();

  // 存储当前滚动处理器以便后续移除
  return throttledScrollHandler;
}


// ================= 滚动渐变效果函数结束 =================

// ================= 新增底部遮罩层控制函数 =================
function initScrollMaskEffect() {
  const mediaContainer = document.getElementById('home-media-container');
  if (!mediaContainer) return;

  // 节流函数优化性能
  function throttle(func, limit) {
    let lastFunc, lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    }
  }

  // 处理滚动时的遮罩变化
  function handleScrollMask() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    // 计算遮罩高度（0-100%）
    let maskHeight = (scrollY / windowHeight) * 100;
    maskHeight = Math.min(100, Math.max(0, maskHeight));

    // 动态设置遮罩层高度
    mediaContainer.style.setProperty('--mask-height', `${maskHeight}%`);
  }

  // 节流处理滚动事件（每50ms检查一次）
  const throttledScrollHandler = throttle(handleScrollMask, 50);

  // 添加滚动监听
  window.addEventListener('scroll', throttledScrollHandler);

  // 初始化时执行一次
  handleScrollMask();

  // 返回处理器以便后续移除
  return throttledScrollHandler;
}


function initResponsiveBackground() {
  // 检查是否正在初始化
  if (isMediaInitializing) {
    return; // 如果正在初始化，则直接退出，防止冲突
  }
  isMediaInitializing = true; // 加锁

  const mediaContainer = document.getElementById('home-media-container');
  if (!mediaContainer) {
    isMediaInitializing = false; // 解锁
    return;
  }

  // 检测当前屏幕方向
  const currentIsPortrait = window.innerHeight > window.innerWidth;
  const currentOrientation = currentIsPortrait ? 'portrait' : 'landscape';

  // 如果方向未改变，则直接返回
  if (lastOrientation === currentOrientation) {
    return;
  }

  // 更新方向记录
  lastOrientation = currentOrientation;

  // 清除现有媒体元素和加载动画
  const existingMedia = mediaContainer.querySelector('.home-media');
  const existingLoader = mediaContainer.querySelector('.custom-loader');
  if (existingMedia) existingMedia.remove();
  if (existingLoader) existingLoader.remove();

  // 根据方向选择资源
  let mediaSrc, posterSrc, mediaType;
  if (currentIsPortrait) {
    mediaSrc = mediaContainer.dataset.portraitVideo || mediaContainer.dataset.portraitImg;
    posterSrc = mediaContainer.dataset.portraitPoster;
    mediaType = mediaContainer.dataset.portraitVideo ? 'video' : 'img';
  } else {
    mediaSrc = mediaContainer.dataset.landscapeVideo || mediaContainer.dataset.landscapeImg;
    posterSrc = mediaContainer.dataset.landscapePoster;
    mediaType = mediaContainer.dataset.landscapeVideo ? 'video' : 'img';
  }

  if (!mediaSrc) {
    console.error('[背景加载器] 未找到有效媒体资源');
    return;
  }

  console.log(`[背景加载器] 使用资源: ${mediaSrc} (类型: ${mediaType})`);

  // 创建媒体元素
  const mediaElement = document.createElement(mediaType);
  mediaElement.className = 'home-media';
  mediaElement.style.cssText = 'width:100%;height:100%;object-fit:cover';

  // ================= 设置初始透明度 =================
  mediaElement.style.opacity = '1';
  mediaElement.style.transition = 'opacity 0.5s ease';
  // ================================================

  // 在媒体容器添加媒体元素后调用效果函数
  mediaContainer.appendChild(mediaElement);
  addMediaEffects(mediaElement, mediaType); // 添加新功能

  console.log('[背景加载器] 媒体元素已创建');

  // 创建自定义加载动画容器
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'custom-loader';
  mediaContainer.prepend(loaderContainer);

  // 创建加载动画元素
  const loaderElement = document.createElement('div');
  loaderElement.className = 'loader-animation';

  // 设置加载动画样式（使用GIF）
  loaderElement.style.backgroundImage = `url(${posterSrc})`;
  loaderContainer.appendChild(loaderElement);

  // 视频特殊处理
  if (mediaType === 'video') {
    mediaElement.autoplay = true;
    mediaElement.muted = true;
    mediaElement.loop = true;
    mediaElement.playsInline = true;

    // 增强循环播放机制 - 备用处理
    mediaElement.addEventListener('ended', () => {
      console.log('[背景加载器] 视频播放结束，重新开始播放');
      mediaElement.currentTime = 0;
      mediaElement.play().catch(e => console.warn('重新播放失败:', e));
    });
    mediaElement.setAttribute('playsinline', '');
    mediaElement.setAttribute('webkit-playsinline', '');

    // 多源支持
    const source = document.createElement('source');
    source.src = mediaSrc;
    source.type = 'video/mp4';
    mediaElement.appendChild(source);

    // 处理自动播放限制
    const playPromise = mediaElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('[背景加载器] 自动播放被阻止:', error);
        mediaElement.muted = true;
        mediaElement.play();
      });
    }

    // 视频加载完成后移除加载动画
    mediaElement.addEventListener('loadeddata', () => {
      loaderContainer.style.opacity = '0';
      setTimeout(() => {
        if (loaderContainer.parentNode) {
          loaderContainer.parentNode.removeChild(loaderContainer);
        }
      }, 500); // 淡出动画持续时间
      isMediaInitializing = false; // 解锁
    });
  } else {
    mediaElement.src = mediaSrc;
    mediaElement.loading = 'eager';

    // 图片加载完成后移除加载动画
    mediaElement.addEventListener('load', () => {
      loaderContainer.style.opacity = '0';
      setTimeout(() => {
        if (loaderContainer.parentNode) {
          loaderContainer.parentNode.removeChild(loaderContainer);
        }
      }, 500);
      isMediaInitializing = false; // 解锁
    });
  }

  // 错误处理
  mediaElement.onerror = function () {
    console.error(`[背景加载器] 资源加载失败: ${mediaSrc}`);
    this.style.display = 'none';
    isMediaInitializing = false; // 解锁

    // 尝试回退到备用类型
    console.warn('[背景加载器] 尝试回退到备用媒体');
    const fallbackType = mediaType === 'video' ? 'img' : 'video';
    const fallbackSrc = currentIsPortrait ?
      (mediaContainer.dataset.portraitImg || mediaContainer.dataset.portraitVideo) :
      (mediaContainer.dataset.landscapeImg || mediaContainer.dataset.landscapeVideo);

    if (fallbackSrc && fallbackSrc !== mediaSrc) {
      console.log(`[背景加载器] 使用备用资源: ${fallbackSrc}`);
      mediaElement.src = fallbackSrc;
      mediaElement.style.display = 'block';
    }
  };

  mediaContainer.appendChild(mediaElement);
  console.log('[背景加载器] 媒体元素已创建');

  // ================= 初始化滚动渐变效果 =================
  initScrollFadeEffect();
}

function addMediaEffects(mediaElement, mediaType) {
  if (mediaType === 'video') {
    // 获取当前方向
    const currentIsPortrait = window.innerHeight > window.innerWidth;

    // 竖屏模式下固定放大105%
    const baseScale = currentIsPortrait ? 1.05 : 1.2;
    mediaElement.style.transform = `scale(${baseScale})`;

    // 检测是否为iOS设备
    function isIOS() {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // 如果是iOS设备，直接禁用所有视差效果
    if (isIOS()) {
      console.log('[视差效果] 在iOS设备上，禁用所有视差效果');
      return; // 直接返回，不初始化任何视差效果
    }
    // 1. 添加缩放动画效果
    mediaElement.style.transform = 'scale(1.2)'; // 初始放大110%
    mediaElement.style.transition = 'transform 0.5s ease-out';

    // 在视频加载完成后触发缩放动画
    mediaElement.addEventListener('loadeddata', () => {
      // 竖屏模式保持105%缩放，不需要动画
      if (currentIsPortrait) {
        mediaElement.style.transform = 'scale(1.05)';
      }
      // 横屏模式执行缩放动画到正常大小
      else {
        setTimeout(() => {
          mediaElement.style.transform = 'scale(1)';
        }, 100);
      }
    });

    // 2. 添加视差效果（鼠标/陀螺仪）
    const mediaContainer = document.getElementById('page-header');
    mediaContainer.style.overflow = 'hidden';
    mediaElement.style.transformOrigin = 'center center';

    // 视差效果参数
    const parallaxIntensity = 0.05;
    const scaleIntensity = 0.05;
    let isGyroActive = false;

    // ================= 新增陀螺仪支持 =================
    // 检测陀螺仪支持
    function initGyroParallax() {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ 需要权限
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              setupGyroListeners();
              isGyroActive = true;
            }
          })
          .catch(console.error);
      } else if ('DeviceOrientationEvent' in window) {
        // Android和其他支持设备
        setupGyroListeners();
        isGyroActive = true;
      }

      return isGyroActive;
    }

    // 设置陀螺仪监听
    function setupGyroListeners() {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // 处理陀螺仪数据
    function handleOrientation(event) {
      // 竖屏模式使用105%基础缩放
      const baseScaleValue = currentIsPortrait ? 1.05 : 1;
      if (!isGyroActive) return;

      // 获取陀螺仪数据（beta: 前后倾斜, gamma: 左右倾斜）
      const beta = event.beta || 0;  // 前后倾斜（-180到180）
      const gamma = event.gamma || 0; // 左右倾斜（-90到90）

      // 将角度转换为百分比偏移（归一化处理）
      const moveX = (gamma / 90) * parallaxIntensity * 100; // -100% 到 100%
      const moveY = (beta / 180) * parallaxIntensity * 100;

      // 应用视差效果
      mediaElement.style.transform = `
        translate(${moveX}%, ${moveY}%)
        scale(${baseScaleValue + scaleIntensity})
      `;
    }

    // ================= 鼠标视差效果 =================
    function initMouseParallax() {
      mediaContainer.addEventListener('mousemove', (e) => {
        const rect = mediaContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const moveX = (x - 0.5) * parallaxIntensity * 100;
        const moveY = (y - 0.5) * parallaxIntensity * 100;

        mediaElement.style.transform = `
          translate(${moveX}%, ${moveY}%)
          scale(${1 + scaleIntensity})
        `;
      });

      mediaContainer.addEventListener('mouseleave', () => {
        mediaElement.style.transform = 'scale(1)';
      });
    }

    // ================= 根据设备类型初始化 =================
    // 检测移动设备
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // 移动设备优先使用陀螺仪
      if (!initGyroParallax()) {
        // 不支持陀螺仪则回退到触摸事件
        initTouchParallax();
      }
    } else {
      // PC设备使用鼠标事件
      initMouseParallax();
    }

    // ================= 触摸事件回退方案 =================
    function initTouchParallax() {
      mediaContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = mediaContainer.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;

        const moveX = (x - 0.5) * parallaxIntensity * 50; // 移动强度减半
        const moveY = (y - 0.5) * parallaxIntensity * 50;

        mediaElement.style.transform = `
          translate(${moveX}%, ${moveY}%)
          scale(${1 + scaleIntensity * 0.5}) // 缩放强度减半
        `;
      });

      mediaContainer.addEventListener('touchend', () => {
        mediaElement.style.transform = 'scale(1)';
      });
    }

    // ================= 性能优化 =================
    // 页面不可见时暂停陀螺仪
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        isGyroActive = false;
      } else if (isMobile) {
        isGyroActive = initGyroParallax();
      }
    });
  }
}

// 在initMedia函数中调用新功能
function initMedia() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initResponsiveBackground();
      initScrollFadeEffect(); // 添加调用
    });
  } else {
    initResponsiveBackground();
    initScrollFadeEffect(); // 添加调用
  }
}


// ======================= 执行入口 =======================
initMedia();

// 防抖处理窗口变化
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // 计算当前方向状态
    const currentIsPortrait = window.innerHeight > window.innerWidth;
    const currentOrientation = currentIsPortrait ? 'portrait' : 'landscape';

    // 只有方向实际改变时才执行重载
    if (lastOrientation !== currentOrientation) {
      console.log('[背景加载器] 窗口大小变化，重新加载媒体');
      initResponsiveBackground();
    } else {
      console.log('[背景加载器] 窗口大小变化但方向未改变');
      // ================= 方向未变时重置透明度 =================
      initScrollFadeEffect();
    }
  }, 500);
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const video = document.querySelector('#home-media-container video');
    if (video && video.paused) {
      console.log('[背景加载器] 页面恢复可见，重新播放视频');
      video.play().catch(e => console.warn('视频恢复播放失败:', e));
    }
    // ================= 页面恢复可见时重置透明度 =================
    initScrollFadeEffect();
  }
});

// ========== 新增修复代码（直接加在现有代码后面） ========== //

// 1. 缓存恢复检测（核心修复）
window.addEventListener('pageshow', event => {
  if (event.persisted && location.pathname === '/') {
    console.log('[修复] 检测到缓存恢复主页，强制重置');
    lastOrientation = null;
    initResponsiveBackground();
    // ================= 缓存恢复时重置透明度 =================
    setTimeout(initScrollFadeEffect, 300);
  }
});

// 2. 路由变化监听（SPA兼容）
window.addEventListener('popstate', () => {
  if (location.pathname === '/') {
    console.log('[修复] 检测到返回主页');
    setTimeout(() => {
      // 检查媒体元素是否存在
      const container = document.getElementById('home-media-container');
      if (!container?.querySelector('.home-media')) {
        lastOrientation = null;
        initResponsiveBackground();
      }
      // ================= 返回主页时重置透明度 =================
      initScrollFadeEffect();
    }, 300); // 延迟确保DOM更新
  }
});

// 3. 媒体状态自检（兜底方案）
function checkMediaStatus() {
  if (location.pathname !== '/') return;

  const container = document.getElementById('home-media-container');
  if (!container) return;

  const hasMedia = container.querySelector('.home-media');
  if (!hasMedia) {
    console.log('[修复] 自检发现媒体丢失');
    lastOrientation = null;
    initResponsiveBackground();
  }
  // ================= 媒体自检时重置透明度 =================
  initScrollFadeEffect();
}

// 每0.5秒检查一次（轻量级检测）
setInterval(checkMediaStatus, 500);

