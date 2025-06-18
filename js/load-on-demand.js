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
        // 检测是否为首页
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            // 修复：index_media.css 现在由头部优先加载，只需加载JS
            this.loadJS('/js/index_media.js', 'index-media-script');
        }

        // 检测是否为文章页
        if (document.querySelector('#post') || document.querySelector('.post-content')) {
            this.loadCSS('/css/custom-comment.css', 'custom-comment-style');
            this.loadCSS('/custom/css/tip_style.css', 'tip-style');
            this.loadJS('/js/fixed_comment.js', 'fixed-comment-script');
            this.loadJS('/custom/js/tip_main.js', 'tip-main-script');
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

        // 检测评论区
        if (document.querySelector('#twikoo') ||
            document.querySelector('#waline') ||
            document.querySelector('#valine')) {
            this.loadJS('/js/comments.js', 'comments-script');
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
            this.loadCSS('/custom/css/schedule.css', 'schedule-style');
            this.loadCSS('/custom/css/background-box.css', 'background-style');
            this.loadJS('https://cdn.jsdelivr.net/npm/winbox@0.2.82/dist/winbox.bundle.min.js', 'winbox-lib')
                .then(() => this.loadJS('/custom/js/chineselunar.js', 'chineselunar-script'))
                .then(() => this.loadJS('/custom/js/schedule.js', 'schedule-script'))
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