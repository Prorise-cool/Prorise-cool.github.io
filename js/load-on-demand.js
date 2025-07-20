/**
 * 按需加载资源管理器
 * 用于优化网站性能，只在需要时加载特定资源
 */

class ResourceLoader {
    constructor() {
        this.loadedCSS = new Set();
        this.loadedJS = new Set();
    }

    /**
     * 动态加载CSS文件
     * @param {string} href - CSS文件路径
     * @param {string} id - 可选的link元素ID
     */
    loadCSS(href, id = null) {
        if (this.loadedCSS.has(href) || document.querySelector(`link[href="${href}"]`)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            if (id) link.id = id;

            link.onload = () => {
                this.loadedCSS.add(href);
                resolve();
            };
            link.onerror = reject;

            document.head.appendChild(link);
        });
    }

    /**
     * 动态加载JS文件
     * @param {string} src - JS文件路径
     * @param {string} id - 可选的script元素ID
     */
    loadJS(src, id = null) {
        if (this.loadedJS.has(src) || document.querySelector(`script[src="${src}"]`)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            if (id) script.id = id;

            script.onload = () => {
                this.loadedJS.add(src);
                resolve();
            };
            script.onerror = reject;

            document.body.appendChild(script);
        });
    }

    /**
 * 检测页面内容并按需加载相关资源
 */
    autoDetectAndLoad() {
        // 检测是否为首页（包括分页）
        const isHomePage = window.location.pathname === '/' ||
            window.location.pathname === '/index.html' ||
            /^\/page\/\d+\/?$/.test(window.location.pathname);

        if (isHomePage) {
            this.loadCSS('/css/index_media.css', 'index-media-style');
            this.loadJS('/js/index_media.js', 'index-media-script');
        }

        // 检测是否为文章页
        if (document.querySelector('#post') || document.querySelector('.post-content')) {
            // 文章页面专用样式和脚本
            this.loadCSS('/css/doc-sidebar.css', 'doc-sidebar-style');
            this.loadJS('/js/doc-sidebar.js', 'doc-sidebar-script');
            this.loadJS('/custom/js/markdown-download.js', 'markdown-download-script');

            // 原有的文章页资源
            this.loadCSS('/css/custom-comment.css', 'custom-comment-style');
            this.loadCSS('/custom/css/tip_style.css', 'tip-style');
            this.loadJS('/js/fixed_comment.js', 'fixed-comment-script');
            this.loadJS('/custom/js/tip_main.js', 'tip-main-script');
        }

        // 检测代码运行器需求（如果页面有相关按钮或配置）
        if (document.querySelector('#code-runner-btn') ||
            document.querySelector('[data-code-runner]') ||
            (typeof anzhiyu !== 'undefined' && anzhiyu.codeRunner)) {
            this.loadCSS('/css/code-runner.css', 'code-runner-style');
            this.loadJS('/js/code-runner.js', 'code-runner-script');
        }

        // 检测B站视频内容
        if (document.querySelector('iframe[src*="bilibili.com"]') ||
            document.querySelector('iframe[src*="player.bilibili.com"]')) {
            this.loadCSS('/css/bilibili.css', 'bilibili-style');
        }

        // 检测代码块
        if (document.querySelector('pre code') || document.querySelector('.highlight')) {
            this.loadCSS('/custom/css/sandbox_style.css', 'sandbox-style');
        }

        // 检测最新评论小组件（独立检测，主页也需要）
        if (document.querySelector('#latest-comments')) {
            this.loadJS('/js/comments.js', 'comments-script');
        }

        // 检测评论区
        if (document.querySelector('#twikoo') ||
            document.querySelector('#waline') ||
            document.querySelector('#valine')) {
            // 如果还没有加载 comments.js，则加载
            if (!document.getElementById('comments-script')) {
                this.loadJS('/js/comments.js', 'comments-script');
            }
        }

        // 检测即刻短文页面
        if (window.location.pathname.includes('/essay/') || document.querySelector('#essay_page')) {
            this.loadCSS('/css/essay-style.css', 'essay-style');
        }

        // 检测待办清单页面
        if (window.location.pathname.includes('/todolist/') || document.querySelector('#todolist-box')) {
            this.loadCSS('/custom/css/todolist.css', 'todolist-style');
        }

        // 检测实用网站导航页面
        if (window.location.pathname.includes('/awesome-links/') ||
            document.querySelector('#useful-links-search-container') ||
            document.querySelector('.useful-links-page')) {
            this.loadCSS('/css/useful-links-search.css', 'useful-links-search-style');
            this.loadJS('/js/useful-links-search.js', 'useful-links-search-script');
        }

        // 检测侧边栏相关功能
        if (document.querySelector('#sidebar')) {
            // 注释掉日历相关的加载，减少内存占用
            // this.loadCSS('/custom/css/schedule.css', 'schedule-style');
            this.loadCSS('/custom/css/background-box.css', 'background-style');
            this.loadJS('https://cdn.jsdelivr.net/npm/winbox@0.2.82/dist/winbox.bundle.min.js', 'winbox-lib')
                // 移除了 chineselunar.js 和 schedule.js 的加载
                .then(() => this.loadJS('/custom/js/background-box.js', 'background-script'))
                .catch(err => console.warn('侧边栏脚本加载失败:', err));
        }
    }
}

// 创建全局实例
window.resourceLoader = new ResourceLoader();

// 页面加载完成后自动检测
document.addEventListener('DOMContentLoaded', () => {
    window.resourceLoader.autoDetectAndLoad();
});

// 为PJAX提供支持
document.addEventListener('pjax:complete', () => {
    window.resourceLoader.autoDetectAndLoad();
}); 