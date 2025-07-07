/**
 * 代码运行器功能
 * Code Runner functionality for AnZhiYu theme
 * 基于doc-sidebar的实现模式
 */

// 初始化函数，支持PJAX
function initCodeRunner() {
  const codeRunnerPanel = document.getElementById('code-runner-panel');
  const codeRunnerButton = document.getElementById('code-runner-btn');

  if (!codeRunnerPanel || !codeRunnerButton) {
    console.log('Code Runner: Panel or button not found');
    return;
  }

  console.log('Code Runner: Initializing...');

  // 初始化代码运行器功能
  initCodeRunnerPanel();

  function initCodeRunnerPanel() {
    // 设置初始状态
    setupInitialState();

    // 设置按钮功能
    setupToggleButton();

    // 设置面板内部交互
    setupPanelInteractions();

    // 恢复用户选择
    restoreUserSelection();
  }

  // 设置初始状态
  function setupInitialState() {
    // 确保面板初始状态为隐藏
    codeRunnerPanel.classList.remove('active');
    document.body.classList.remove('code-runner-open');

    // 设置iframe和加载指示器初始状态
    const iframeContainer = codeRunnerPanel.querySelector('.iframe-container');
    const loadingIndicator = codeRunnerPanel.querySelector('.loading-indicator');
    const welcomeMessage = codeRunnerPanel.querySelector('.welcome-message');
    const iframe = codeRunnerPanel.querySelector('#code-runner-iframe');

    if (iframeContainer) iframeContainer.classList.remove('active');
    if (loadingIndicator) loadingIndicator.classList.remove('active');
    if (welcomeMessage) welcomeMessage.style.display = 'flex';
    if (iframe) iframe.src = '';
  }

  // 设置切换按钮功能
  function setupToggleButton() {
    codeRunnerButton.addEventListener('click', () => {
      const isOpen = codeRunnerPanel.classList.contains('active');

      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    });
  }

  // 打开面板
  function openPanel() {
    codeRunnerPanel.classList.add('active');
    document.body.classList.add('code-runner-open');
    codeRunnerButton.classList.add('active');

    console.log('Code Runner: Panel opened');

    // 延迟自动加载第一个实例（如果配置允许）
    const config = window.GLOBAL_CONFIG?.code_runner || {};
    if (config.auto_load_first !== false) {
      // 延迟加载，避免PJAX切换时立即加载导致失败
      setTimeout(() => {
        autoLoadFirstInstance();
      }, 1000); // 延迟1秒
    }
  }

  // 关闭面板
  function closePanel() {
    codeRunnerPanel.classList.remove('active');
    document.body.classList.remove('code-runner-open');
    codeRunnerButton.classList.remove('active');

    console.log('Code Runner: Panel closed');
  }

  // 设置面板内部交互
  function setupPanelInteractions() {
    // 关闭按钮
    const closeBtn = codeRunnerPanel.querySelector('.panel-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closePanel);
    }

    // 分类展开/收缩事件
    const categoryHeaders = codeRunnerPanel.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const category = header.closest('.nav-category');
        toggleCategory(category);
      });
    });

    // 实例选择事件
    const instanceLinks = codeRunnerPanel.querySelectorAll('.instance-link');
    instanceLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        selectInstance(link);
      });
    });

    // ESC键关闭
    const config = window.GLOBAL_CONFIG?.code_runner || {};
    if (config.close_on_escape !== false) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && codeRunnerPanel.classList.contains('active')) {
          closePanel();
        }
      });
    }

    // 点击面板外部关闭
    document.addEventListener('click', (e) => {
      if (codeRunnerPanel.classList.contains('active') &&
        !codeRunnerPanel.contains(e.target) &&
        !codeRunnerButton.contains(e.target)) {
        closePanel();
      }
    });
  }

  // 切换分类展开/收缩
  function toggleCategory(category) {
    if (!category) return;

    const isExpanded = category.classList.contains('expanded');

    // 收缩所有其他分类
    const allCategories = codeRunnerPanel.querySelectorAll('.nav-category');
    allCategories.forEach(cat => {
      if (cat !== category) {
        cat.classList.remove('expanded');
      }
    });

    // 切换当前分类
    category.classList.toggle('expanded');

    console.log('Code Runner: Category toggled', category.dataset.category);
  }

  // 选择实例
  function selectInstance(link) {
    const url = link.dataset.url;
    const name = link.dataset.name;

    if (!url) {
      console.warn('Code Runner: No URL found for instance', name);
      return;
    }

    // 更新选中状态
    const allLinks = codeRunnerPanel.querySelectorAll('.instance-link');
    allLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // 加载iframe
    loadIframe(url);

    console.log('Code Runner: Instance selected', name, url);
  }

  // 加载iframe
  function loadIframe(url, retryCount = 0) {
    const iframe = codeRunnerPanel.querySelector('#code-runner-iframe');
    const loadingIndicator = codeRunnerPanel.querySelector('.loading-indicator');
    const welcomeMessage = codeRunnerPanel.querySelector('.welcome-message');
    const iframeContainer = codeRunnerPanel.querySelector('.iframe-container');

    if (!iframe) {
      console.error('Code Runner: iframe not found');
      return;
    }

    // 显示加载指示器
    if (welcomeMessage) welcomeMessage.style.display = 'none';
    if (iframeContainer) iframeContainer.classList.remove('active');
    if (loadingIndicator) loadingIndicator.classList.add('active');

    // 清除之前的事件监听器
    iframe.onload = null;
    iframe.onerror = null;

    // 设置加载超时
    const loadingTimeout = setTimeout(() => {
      onIframeError();
    }, 20000); // 增加到20秒超时

    // iframe加载完成处理
    const onIframeLoad = () => {
      clearTimeout(loadingTimeout);
      if (loadingIndicator) loadingIndicator.classList.remove('active');
      if (iframeContainer) iframeContainer.classList.add('active');
      console.log('Code Runner: iframe loaded successfully');
    };

    // iframe加载错误处理
    const onIframeError = () => {
      clearTimeout(loadingTimeout);

      // 如果重试次数少于2次，则重试
      if (retryCount < 2) {
        console.warn(`Code Runner: iframe load failed, retrying... (${retryCount + 1}/2)`);
        setTimeout(() => {
          loadIframe(url, retryCount + 1);
        }, 2000); // 延迟2秒重试
        return;
      }

      // 重试失败，显示错误信息
      if (loadingIndicator) loadingIndicator.classList.remove('active');
      if (welcomeMessage) {
        welcomeMessage.style.display = 'flex';
        const welcomeText = welcomeMessage.querySelector('.welcome-text');
        if (welcomeText) {
          welcomeText.innerHTML = `
            <h3>加载失败</h3>
            <p>无法加载编程环境，请检查网络连接或尝试其他选项</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: var(--anzhiyu-main); color: white; border: none; border-radius: 4px; cursor: pointer;">刷新页面重试</button>
          `;
        }
      }
      console.error('Code Runner: iframe failed to load after retries', url);
    };

    // 绑定事件
    iframe.onload = onIframeLoad;
    iframe.onerror = onIframeError;

    // 延迟设置iframe源，避免过快加载
    setTimeout(() => {
      iframe.src = url;
    }, 500);
  }

  // 自动加载第一个实例
  function autoLoadFirstInstance() {
    const firstCategory = codeRunnerPanel.querySelector('.nav-category');
    const firstInstance = firstCategory?.querySelector('.instance-link');

    if (firstCategory && firstInstance) {
      // 展开第一个分类
      firstCategory.classList.add('expanded');

      // 选择第一个实例
      setTimeout(() => {
        firstInstance.click();
      }, 300); // 等待展开动画完成
    }
  }

  // 恢复用户选择
  function restoreUserSelection() {
    const config = window.GLOBAL_CONFIG?.code_runner || {};
    if (config.remember_selection === false) return;

    try {
      const saved = localStorage.getItem('code-runner-selection');
      if (!saved) return;

      const selection = JSON.parse(saved);
      if (!selection.category || !selection.instance) return;

      // 查找并恢复分类
      const category = codeRunnerPanel.querySelector(`[data-category="${selection.category}"]`);
      if (category) {
        category.classList.add('expanded');

        // 查找并恢复实例
        const instance = category.querySelector(`[data-name="${selection.instance}"]`);
        if (instance) {
          instance.classList.add('active');
        }
      }
    } catch (error) {
      console.warn('Code Runner: Failed to restore selection', error);
    }
  }
}

// 防止重复初始化的标志
let codeRunnerInitialized = false;

// 页面加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
  if (!codeRunnerInitialized) {
    initCodeRunner();
    codeRunnerInitialized = true;
  }
});

// 为 PJAX 提供支持
document.addEventListener('pjax:complete', () => {
  // 重置初始化标志，因为DOM可能已经改变
  codeRunnerInitialized = false;

  // 延迟执行以确保 DOM 完全加载
  setTimeout(() => {
    if (!codeRunnerInitialized) {
      initCodeRunner();
      codeRunnerInitialized = true;
    }
  }, 500); // 增加延迟时间
});