/**
 * 文档式左侧目录功能
 * Document-style left sidebar TOC functionality
 * 基于 source/design/script.js 的实现逻辑
 */

// 初始化函数，支持PJAX
function initDocSidebar() {
  const docSidebar = document.getElementById('doc-sidebar');
  const docTocButton = document.getElementById('doc-toc-button');

  if (!docSidebar || !docTocButton) return;

  // 添加doc-sidebar-active类，表示当前页面有文档目录
  document.body.classList.add('doc-sidebar-active');

  // 初始化文档目录功能
  initDocToc();

  function initDocToc() {
    // 初始化布局状态
    initLayoutState();

    // 清理重复编号
    cleanTocNumbers();

    // 初始化折叠功能
    initCollapsibleToc();

    // 设置平滑滚动
    setupSmoothScrolling();

    // 设置滚动监听（高亮当前章节）
    setupScrollSpy();

    // 设置切换按钮功能
    setupToggleButton();
  }

  // 初始化布局状态
  function initLayoutState() {
    // 从本地存储恢复状态，默认为展开（整个TOC显示）
    const savedState = localStorage.getItem('doc-sidebar-hidden');
    if (savedState === 'true') {
      document.body.classList.add('hide-doc-sidebar');
    } else {
      // 默认展开状态
      document.body.classList.remove('hide-doc-sidebar');
    }
  }

  // 清理TOC中的重复编号 - 简化版本
  function cleanTocNumbers() {
    // 由于已设置 list_number: false，理论上不应该有自动编号
    // 这个函数保留作为备用，只在确实有问题时才处理
    const tocContent = docSidebar.querySelector('.doc-toc-content');
    if (!tocContent) return;

    // 如果确实发现有自动编号，可以在这里添加处理逻辑
    // 目前先留空，观察是否还有编号问题
    console.log('TOC structure:', tocContent.innerHTML.substring(0, 200) + '...');
  }

  // 初始化折叠功能 - 基于实际的Hexo TOC HTML结构
  function initCollapsibleToc() {
    const tocContent = docSidebar.querySelector('.doc-toc-content');
    if (!tocContent) return;

    // 基于实际HTML结构：<li class="toc-item toc-level-X"> 包含 <ol class="toc-child">
    // 找到所有有子级的TOC项目
    const tocItems = tocContent.querySelectorAll('.toc-item');

    tocItems.forEach(item => {
      const link = item.querySelector('a.toc-link');
      const childList = item.querySelector('ol.toc-child');

      // 如果有子级，添加折叠功能
      if (link && childList) {
        // 添加折叠图标
        addCollapseIcon(link);

        // 默认折叠状态
        item.classList.remove('expanded');
        childList.style.display = 'none';

        // 添加点击事件
        link.addEventListener('click', (e) => {
          const icon = link.querySelector('.collapse-icon');
          if (icon && (e.target === icon || icon.contains(e.target))) {
            e.preventDefault();
            toggleCollapse(item, childList);
          }
        });

        // 恢复保存的状态
        const itemId = link.getAttribute('href');
        const savedExpanded = localStorage.getItem(`toc-expanded-${itemId}`);
        if (savedExpanded === 'true') {
          item.classList.add('expanded');
          childList.style.display = 'block';
        }
      }
    });
  }

  // 添加折叠图标
  function addCollapseIcon(link) {
    if (!link.querySelector('.collapse-icon')) {
      const icon = document.createElement('span');
      icon.className = 'collapse-icon';
      icon.textContent = '▶';
      icon.style.cssText = `
        margin-right: 0.5rem;
        font-size: 0.75rem;
        color: var(--anzhiyu-secondtext);
        transition: transform 0.2s ease;
        cursor: pointer;
        user-select: none;
      `;
      link.insertBefore(icon, link.firstChild);
    }
  }

  // 切换折叠状态
  function toggleCollapse(item, childList) {
    const isExpanded = item.classList.contains('expanded');
    const icon = item.querySelector('.collapse-icon');

    if (isExpanded) {
      // 折叠
      item.classList.remove('expanded');
      childList.style.display = 'none';
      if (icon) icon.style.transform = 'rotate(0deg)';
    } else {
      // 展开
      item.classList.add('expanded');
      childList.style.display = 'block';
      if (icon) icon.style.transform = 'rotate(90deg)';
    }

    // 保存状态
    const link = item.querySelector('a.toc-link');
    const itemId = link.getAttribute('href');
    localStorage.setItem(`toc-expanded-${itemId}`, !isExpanded);
  }

  // 平滑滚动功能
  function setupSmoothScrolling() {
    const tocContent = docSidebar.querySelector('.doc-toc-content');
    if (!tocContent) return;

    // 使用与现有TOC相同的点击处理逻辑
    const tocItemClickFn = e => {
      const target = e.target.closest('a');
      if (!target) return;

      e.preventDefault();
      const targetId = target.getAttribute('href');

      if (targetId && targetId.startsWith('#')) {
        const id = targetId.substring(1);
        // 尝试多种方式查找目标元素
        let targetElement = document.getElementById(id) ||
          document.getElementById(decodeURI(id)) ||
          document.getElementById(decodeURIComponent(id));

        if (!targetElement) {
          console.warn(`Target element not found for id: ${id}`);
          return;
        }

        // 使用AnZhiYu主题的滚动方法，与现有TOC保持一致
        if (typeof anzhiyu !== 'undefined' && anzhiyu.scrollToDest && anzhiyu.getEleTop) {
          anzhiyu.scrollToDest(anzhiyu.getEleTop(targetElement) - 60, 300);
        } else {
          // 备用滚动方案
          const headerHeight = 80;
          const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });
        }
      }
    };

    tocContent.addEventListener('click', tocItemClickFn);
  }

  // 滚动监听和高亮功能 - 参考现有TOC实现
  function setupScrollSpy() {
    const tocLinks = docSidebar.querySelectorAll('.doc-toc-content a');
    const headings = document.querySelectorAll('#article-container h1, #article-container h2, #article-container h3, #article-container h4, #article-container h5, #article-container h6');

    if (tocLinks.length === 0 || headings.length === 0) return;

    let detectItem = '';

    // 查找标题位置的函数，参考现有TOC逻辑
    const findHeadPosition = (top) => {
      if (headings.length === 0) return;

      let currentId = '';
      let currentIndex = 0;

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        if (!heading.id) continue;

        const headingTop = heading.getBoundingClientRect().top + window.scrollY;
        if (top > headingTop - 70) {
          currentId = heading.id;
          currentIndex = i;
        }
      }

      if (detectItem === currentIndex) return;
      detectItem = currentIndex;

      // 移除所有active状态
      tocLinks.forEach(link => link.classList.remove('active'));

      if (currentId === '') return;

      // 添加当前active状态 - 修复中文和特殊字符问题
      const currentActiveLink = Array.from(tocLinks).find(link => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return false;

        const linkId = href.substring(1);
        // 尝试多种匹配方式
        return linkId === currentId ||
          decodeURIComponent(linkId) === currentId ||
          linkId === encodeURIComponent(currentId) ||
          decodeURIComponent(linkId) === decodeURIComponent(currentId);
      });
      if (currentActiveLink) {
        currentActiveLink.classList.add('active');

        // 自动滚动TOC到当前项
        setTimeout(() => {
          const tocContent = docSidebar.querySelector('.doc-toc-content');
          if (tocContent) {
            const activePosition = currentActiveLink.getBoundingClientRect().top;
            const sidebarScrollTop = tocContent.scrollTop;
            if (activePosition > document.documentElement.clientHeight - 100) {
              tocContent.scrollTop = sidebarScrollTop + 150;
            }
            if (activePosition < 100) {
              tocContent.scrollTop = sidebarScrollTop - 150;
            }
          }
        }, 0);
      }
    };

    // 使用节流的滚动监听，参考现有TOC实现
    const tocScrollFn = (typeof anzhiyu !== 'undefined' && anzhiyu.throttle)
      ? anzhiyu.throttle(() => {
        const currentTop = window.scrollY || document.documentElement.scrollTop;
        findHeadPosition(currentTop);
      }, 100)
      : (() => {
        let ticking = false;
        return () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              const currentTop = window.scrollY || document.documentElement.scrollTop;
              findHeadPosition(currentTop);
              ticking = false;
            });
            ticking = true;
          }
        };
      })();

    window.addEventListener('scroll', tocScrollFn, { passive: true });

    // 初始化
    const currentTop = window.scrollY || document.documentElement.scrollTop;
    findHeadPosition(currentTop);
  }

  // 切换按钮功能
  function setupToggleButton() {
    docTocButton.addEventListener('click', () => {
      document.body.classList.toggle('hide-doc-sidebar');

      // 保存状态到本地存储
      const isHidden = document.body.classList.contains('hide-doc-sidebar');
      localStorage.setItem('doc-sidebar-hidden', isHidden);
    });
  }
}

// 页面加载完成时初始化
document.addEventListener('DOMContentLoaded', initDocSidebar);

// 为 PJAX 提供支持
document.addEventListener('pjax:complete', () => {
  // 延迟执行以确保 DOM 完全加载
  setTimeout(initDocSidebar, 100);
});
