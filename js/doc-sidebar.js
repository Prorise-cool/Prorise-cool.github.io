/**
 * 文档式左侧目录功能 - 基于用户原始代码的稳定版
 */

// 初始化函数，支持PJAX
function initDocSidebar() {
  const docSidebar = document.getElementById('doc-sidebar');
  const docTocButton = document.getElementById('doc-toc-button');

  // 确保页面上同时存在目录和切换按钮
  if (!docSidebar || !docTocButton) {
    // 如果缺少任何一个，就移除body上的标识类，以防样式错乱
    document.body.classList.remove('doc-sidebar-active');
    return;
  }

  // 添加doc-sidebar-active类，表示当前页面有文档目录
  document.body.classList.add('doc-sidebar-active');

  // --- 初始化所有功能，函数定义保持独立，逻辑清晰 ---
  initLayoutState();
  initCollapsibleToc();
  setupSmoothScrolling();
  setupScrollSpy();
  setupToggleButton();

  // --- 函数定义区 ---

  // 初始化布局状态 (来自您的原始代码)
  function initLayoutState() {
    const isHidden = localStorage.getItem('doc-sidebar-hidden') === 'true';
    document.body.classList.toggle('hide-doc-sidebar', isHidden);
  }

  // 初始化折叠功能 (基于您的原始逻辑进行优化)
  function initCollapsibleToc() {
    const tocItemsWithChildren = docSidebar.querySelectorAll('.toc-item:has(> ol.toc-child)');

    tocItemsWithChildren.forEach(item => {
      const link = item.querySelector(':scope > a.toc-link');
      const childList = item.querySelector(':scope > ol.toc-child');
      
      if (!link || !childList) return;

      // 1. 动态添加图标 (样式由CSS控制)
      if (!link.querySelector('.collapse-icon')) {
        const icon = document.createElement('span');
        icon.className = 'collapse-icon';
        icon.textContent = '▸'; // 使用更现代的箭头
        link.insertBefore(icon, link.firstChild);
      }
      
      // 2. 默认折叠，并从本地存储恢复状态
      const itemId = link.getAttribute('href');
      const isExpanded = localStorage.getItem(`toc-expanded-${itemId}`) === 'true';
      item.classList.toggle('expanded', isExpanded);
      childList.style.display = isExpanded ? 'block' : 'none';

      // 3. 将点击事件精确绑定到图标上
      const icon = link.querySelector('.collapse-icon');
      icon?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // 阻止链接跳转和事件冒泡
        
        // 切换状态
        const wasExpanded = item.classList.contains('expanded');
        item.classList.toggle('expanded');
        childList.style.display = wasExpanded ? 'none' : 'block';

        // 保存新状态
        localStorage.setItem(`toc-expanded-${itemId}`, !wasExpanded);
      });
    });
  }

  // 平滑滚动功能 (来自您的原始代码，逻辑不变)
  function setupSmoothScrolling() {
    docSidebar.querySelector('.doc-toc-content')?.addEventListener('click', e => {
      // 确保点击的不是折叠图标
      if (e.target.closest('.collapse-icon')) return;

      const target = e.target.closest('a.toc-link');
      if (!target) return;

      e.preventDefault();
      const targetId = target.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const id = decodeURIComponent(targetId.substring(1));
        const targetElement = document.getElementById(id);

        if (targetElement) {
          const headerHeight = 80;
          const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  // 滚动监听和高亮功能 (来自您的原始代码，逻辑不变)
  function setupScrollSpy() {
    const tocLinks = Array.from(docSidebar.querySelectorAll('.doc-toc-content a'));
    const headings = Array.from(document.querySelectorAll('#article-container h1, #article-container h2, #article-container h3, #article-container h4, #article-container h5, #article-container h6'));

    if (tocLinks.length === 0 || headings.length === 0) return;

    const findHeadPosition = () => {
      const scrollY = window.scrollY;
      let currentId = '';

      for (const heading of headings) {
        if (heading.offsetTop < scrollY + 120) { // 偏移量，提前高亮
          currentId = heading.id;
        } else {
          break;
        }
      }

      tocLinks.forEach(link => link.classList.remove('active'));

      if (currentId) {
        const activeLink = tocLinks.find(link => decodeURIComponent(link.getAttribute('href')?.substring(1) || '') === currentId);
        if (activeLink) {
          activeLink.classList.add('active');

          const tocContent = docSidebar.querySelector('.doc-toc-content');
          if (tocContent?.contains(activeLink)) {
            const activeLinkRect = activeLink.getBoundingClientRect();
            const tocContentRect = tocContent.getBoundingClientRect();
            if (activeLinkRect.bottom > tocContentRect.bottom - 20) {
              tocContent.scrollTop += activeLinkRect.bottom - tocContentRect.bottom + 20;
            } else if (activeLinkRect.top < tocContentRect.top + 20) {
              tocContent.scrollTop -= tocContentRect.top - activeLinkRect.top - 20;
            }
          }
        }
      }
    };

    const scrollListener = () => window.requestAnimationFrame(findHeadPosition);
    window.addEventListener('scroll', scrollListener, { passive: true });
    findHeadPosition();
  }

  // 切换按钮功能 (来自您的原始代码，保证100%工作)
  function setupToggleButton() {
    docTocButton.addEventListener('click', () => {
      const isHidden = document.body.classList.toggle('hide-doc-sidebar');
      localStorage.setItem('doc-sidebar-hidden', isHidden);
    });
  }
}

// 页面加载和 PJAX 支持 (来自您的原始代码)
document.addEventListener('DOMContentLoaded', initDocSidebar);
document.addEventListener('pjax:complete', () => {
  setTimeout(initDocSidebar, 100);
});