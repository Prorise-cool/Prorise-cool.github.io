// ======================= 横竖屏自适应背景媒体加载器 =======================
let lastOrientation = null; // 记录上一次的方向状态
let isMediaInitializing = false; // 防止重复初始化的状态锁
let currentParallaxHandlers = null; // 当前视差效果处理器

// ================= 视频懒加载器类 =================
class VideoLazyLoader {
  constructor() {
    this.isLoading = false;
    this.loadPromise = null;
  }

  async loadVideo(src, mediaContainer) {
    if (this.isLoading) return this.loadPromise;

    this.isLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = src;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.5s ease';
      video.className = 'home-media';

      video.addEventListener('loadeddata', () => {
        resolve(video);
      });

      video.onerror = () => {
        reject(new Error(`视频加载失败: ${src}`));
      };

      // 预加载但不显示
      mediaContainer.appendChild(video);
    });

    return this.loadPromise;
  }
}

const videoLazyLoader = new VideoLazyLoader();

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
    isMediaInitializing = false; // 解锁
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
  let imgSrc, videoSrc, posterSrc;
  if (currentIsPortrait) {
    imgSrc = mediaContainer.dataset.portraitImg;
    videoSrc = mediaContainer.dataset.portraitVideo;
    posterSrc = mediaContainer.dataset.portraitPoster;
  } else {
    imgSrc = mediaContainer.dataset.landscapeImg;
    videoSrc = mediaContainer.dataset.landscapeVideo;
    posterSrc = mediaContainer.dataset.landscapePoster;
  }

  // 优先使用图片作为占位符，如果没有图片则使用poster
  const placeholderSrc = imgSrc || posterSrc;

  if (!placeholderSrc && !videoSrc) {
    console.error('[背景加载器] 未找到有效媒体资源');
    isMediaInitializing = false;
    return;
  }

  console.log(`[背景加载器] 占位图片: ${placeholderSrc}, 视频: ${videoSrc}`);

  // 第一阶段：立即显示占位图片
  if (placeholderSrc) {
    showPlaceholderImage(mediaContainer, placeholderSrc, currentIsPortrait);
  }

  // 第二阶段：如果有视频，异步加载
  if (videoSrc) {
    loadVideoAsync(mediaContainer, videoSrc, currentIsPortrait);
  } else {
    isMediaInitializing = false; // 只有图片的情况下解锁
  }

  // ================= 初始化滚动渐变效果 =================
  initScrollFadeEffect();
}

// 显示占位图片（立即执行）
function showPlaceholderImage(mediaContainer, imageSrc, isPortrait) {
  // 创建自定义加载动画容器（使用高质量图片）
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'custom-loader';
  mediaContainer.appendChild(loaderContainer);

  const loaderElement = document.createElement('div');
  loaderElement.className = 'loader-animation';
  loaderElement.style.backgroundImage = `url(${imageSrc})`;
  loaderContainer.appendChild(loaderElement);

  // 创建图片元素
  const imgElement = document.createElement('img');
  imgElement.className = 'home-media';
  imgElement.style.cssText = 'width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.5s ease';
  imgElement.src = imageSrc;

  imgElement.addEventListener('load', () => {
    // 图片加载完成，显示图片，隐藏加载器
    imgElement.style.opacity = '1';
    loaderContainer.style.opacity = '0';

    setTimeout(() => {
      if (loaderContainer.parentNode) {
        loaderContainer.remove();
      }
    }, 500);

    // 立即为图片绑定视差效果
    addMediaEffects(imgElement, 'img', isPortrait);
    console.log('[背景加载器] 占位图片显示完成，视差效果已绑定');
  });

  imgElement.onerror = () => {
    console.error(`[背景加载器] 占位图片加载失败: ${imageSrc}`);
    loaderContainer.style.opacity = '0';
    setTimeout(() => loaderContainer.remove(), 500);
  };

  mediaContainer.appendChild(imgElement);
}

// 异步加载视频（后台执行）
async function loadVideoAsync(mediaContainer, videoSrc, isPortrait) {
  try {
    console.log('[背景加载器] 开始异步加载视频...');
    const videoElement = await videoLazyLoader.loadVideo(videoSrc, mediaContainer);

    // 视频加载完成，开始切换
    switchToVideo(mediaContainer, videoElement, isPortrait);
  } catch (error) {
    console.error('[背景加载器] 视频加载失败:', error);
    isMediaInitializing = false; // 视频加载失败时解锁
  }
}

// 切换到视频（保持视差效果连续性）
function switchToVideo(mediaContainer, videoElement, isPortrait) {
  const currentImage = mediaContainer.querySelector('img.home-media');

  if (currentImage) {
    // 保存当前transform状态
    const currentTransform = currentImage.style.transform;

    // 移除图片的视差效果
    removeParallaxEffects();

    // 显示视频
    videoElement.style.opacity = '1';
    if (currentTransform) {
      videoElement.style.transform = currentTransform;
    }

    // 为视频绑定视差效果
    addMediaEffects(videoElement, 'video', isPortrait);

    // 淡出图片
    currentImage.style.opacity = '0';
    setTimeout(() => {
      if (currentImage.parentNode) {
        currentImage.remove();
      }
    }, 500);

    console.log('[背景加载器] 视频切换完成，视差效果已转移');
  }

  // 播放视频
  const playPromise = videoElement.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn('[背景加载器] 视频自动播放被阻止:', error);
      videoElement.muted = true;
      videoElement.play();
    });
  }

  isMediaInitializing = false; // 完成后解锁
}

// 移除当前视差效果
function removeParallaxEffects() {
  if (currentParallaxHandlers) {
    const mediaContainer = document.getElementById('page-header');

    // 移除所有事件监听器
    if (currentParallaxHandlers.mousemove) {
      mediaContainer.removeEventListener('mousemove', currentParallaxHandlers.mousemove);
    }
    if (currentParallaxHandlers.mouseleave) {
      mediaContainer.removeEventListener('mouseleave', currentParallaxHandlers.mouseleave);
    }
    if (currentParallaxHandlers.touchmove) {
      mediaContainer.removeEventListener('touchmove', currentParallaxHandlers.touchmove);
    }
    if (currentParallaxHandlers.touchend) {
      mediaContainer.removeEventListener('touchend', currentParallaxHandlers.touchend);
    }
    if (currentParallaxHandlers.deviceorientation) {
      window.removeEventListener('deviceorientation', currentParallaxHandlers.deviceorientation);
    }

    currentParallaxHandlers = null;
    console.log('[视差效果] 已移除当前视差效果');
  }
}

function addMediaEffects(mediaElement, mediaType, isPortrait) {
  // 先移除之前的视差效果
  removeParallaxEffects();

  if (mediaType === 'video') {
    // 获取当前方向（使用传入的参数，更准确）
    const currentIsPortrait = isPortrait !== undefined ? isPortrait : (window.innerHeight > window.innerWidth);

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
      const orientationHandler = (event) => {
        if (!isGyroActive) return;

        // 获取陀螺仪数据（beta: 前后倾斜, gamma: 左右倾斜）
        const beta = event.beta || 0;  // 前后倾斜（-180到180）
        const gamma = event.gamma || 0; // 左右倾斜（-90到90）

        // 将角度转换为百分比偏移（归一化处理）
        const moveX = (gamma / 90) * parallaxIntensity * 100; // -100% 到 100%
        const moveY = (beta / 180) * parallaxIntensity * 100;

        // 修正baseScaleValue变量名
        const baseScaleValue = currentIsPortrait ? 1.05 : 1;

        // 应用视差效果
        mediaElement.style.transform = `
              translate(${moveX}%, ${moveY}%)
              scale(${baseScaleValue + scaleIntensity})
            `;
      };

      window.addEventListener('deviceorientation', orientationHandler);

      // 存储处理器引用
      if (!currentParallaxHandlers) currentParallaxHandlers = {};
      currentParallaxHandlers.deviceorientation = orientationHandler;
    }

    // ================= 鼠标视差效果 =================
    function initMouseParallax() {
      const mousemoveHandler = (e) => {
        const rect = mediaContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const moveX = (x - 0.5) * parallaxIntensity * 100;
        const moveY = (y - 0.5) * parallaxIntensity * 100;

        // 修正baseScaleValue变量名
        const baseScaleValue = currentIsPortrait ? 1.05 : 1;

        mediaElement.style.transform = `
              translate(${moveX}%, ${moveY}%)
              scale(${baseScaleValue + scaleIntensity})
            `;
      };

      const mouseleaveHandler = () => {
        // 修正baseScaleValue变量名
        const baseScaleValue = currentIsPortrait ? 1.05 : 1;
        mediaElement.style.transform = `scale(${baseScaleValue})`;
      };

      mediaContainer.addEventListener('mousemove', mousemoveHandler);
      mediaContainer.addEventListener('mouseleave', mouseleaveHandler);

      // 存储处理器引用
      if (!currentParallaxHandlers) currentParallaxHandlers = {};
      currentParallaxHandlers.mousemove = mousemoveHandler;
      currentParallaxHandlers.mouseleave = mouseleaveHandler;
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
  }

  // 为图片也添加视差效果支持
  if (mediaType === 'img') {
    const mediaContainer = document.getElementById('page-header');
    if (!mediaContainer) return;

    mediaContainer.style.overflow = 'hidden';
    mediaElement.style.transformOrigin = 'center center';

    // 图片的基础缩放
    const baseScale = currentIsPortrait ? 1.05 : 1.1;
    mediaElement.style.transform = `scale(${baseScale})`;
    mediaElement.style.transition = 'transform 0.5s ease-out';

    // 视差效果参数
    const parallaxIntensity = 0.05;
    const scaleIntensity = 0.05;

    // 检测移动设备
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // 移动设备不为图片添加复杂视差，保持性能
      console.log('[视差效果] 移动设备图片模式，使用基础缩放');
    } else {
      // PC设备为图片添加鼠标视差
      const mousemoveHandler = (e) => {
        const rect = mediaContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const moveX = (x - 0.5) * parallaxIntensity * 100;
        const moveY = (y - 0.5) * parallaxIntensity * 100;

        mediaElement.style.transform = `
          translate(${moveX}%, ${moveY}%)
          scale(${baseScale + scaleIntensity})
        `;
      };

      const mouseleaveHandler = () => {
        mediaElement.style.transform = `scale(${baseScale})`;
      };

      mediaContainer.addEventListener('mousemove', mousemoveHandler);
      mediaContainer.addEventListener('mouseleave', mouseleaveHandler);

      // 存储处理器引用
      if (!currentParallaxHandlers) currentParallaxHandlers = {};
      currentParallaxHandlers.mousemove = mousemoveHandler;
      currentParallaxHandlers.mouseleave = mouseleaveHandler;
    }

    // ================= 触摸事件回退方案 =================
    function initTouchParallax() {
      const touchmoveHandler = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = mediaContainer.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;

        const moveX = (x - 0.5) * parallaxIntensity * 50; // 移动强度减半
        const moveY = (y - 0.5) * parallaxIntensity * 50;

        mediaElement.style.transform = `
              translate(${moveX}%, ${moveY}%)
              scale(${baseScaleValue + scaleIntensity * 0.5}) // 缩放强度减半
            `;
      };

      const touchendHandler = () => {
        // 修正baseScaleValue变量名
        const baseScaleValue = currentIsPortrait ? 1.05 : 1;
        mediaElement.style.transform = `scale(${baseScaleValue})`;
      };

      mediaContainer.addEventListener('touchmove', touchmoveHandler);
      mediaContainer.addEventListener('touchend', touchendHandler);

      // 存储处理器引用
      if (!currentParallaxHandlers) currentParallaxHandlers = {};
      currentParallaxHandlers.touchmove = touchmoveHandler;
      currentParallaxHandlers.touchend = touchendHandler;
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

// 3. 媒体状态自检（事件驱动，移除定时器）
function setupMediaStatusCheck() {
  // 使用MutationObserver监听DOM变化，替代定时器
  const container = document.getElementById('home-media-container');
  if (!container) return;

  const observer = new MutationObserver((mutations) => {
    // 只在首页执行检查
    if (location.pathname !== '/') return;

    let mediaRemoved = false;
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node.classList && node.classList.contains('home-media')) {
          mediaRemoved = true;
        }
      });
    });

    if (mediaRemoved) {
      console.log('[修复] 检测到媒体元素被移除，重新初始化');
      setTimeout(() => {
        const hasMedia = container.querySelector('.home-media');
        if (!hasMedia) {
          lastOrientation = null;
          initResponsiveBackground();
        }
      }, 100);
    }
  });

  observer.observe(container, {
    childList: true,
    subtree: true
  });

  return observer;
}

// 启动媒体状态监听
setupMediaStatusCheck();

