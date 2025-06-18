/**
 * 实用网站导航搜索功能
 * Author: Prorise
 */

const UsefulLinksSearch = {
    data: [],
    currentCategory: 'all',

    init() {
        this.loadData();
        this.bindEvents();
        this.updateResultsCount();
    },

    loadData() {
        // 从页面中提取网站数据
        const linkItems = document.querySelectorAll('.flink-list-item');
        this.data = [];

        console.log('找到的链接项目数量:', linkItems.length);

        linkItems.forEach((item, index) => {
            const nameEl = item.querySelector('.cf-friends-name');
            const descEl = item.querySelector('.flink-item-desc');
            const linkEl = item.querySelector('.cf-friends-link');

            // <<< 修改点在这里：现在直接查找最近的具有 data-category 属性的父元素
            let categoryElement = item.closest('[data-category]'); // 查找最近的具有 data-category 属性的祖先
            let category = categoryElement ? categoryElement.dataset.category : '';

            console.log(`项目 ${index}:`, {
                name: nameEl ? nameEl.textContent.trim() : '未找到',
                description: descEl ? descEl.textContent.trim() : '未找到',
                link: linkEl ? linkEl.href : '未找到',
                category: category // 确认这里获取到正确分类
            });

            if (nameEl && linkEl) {
                this.data.push({
                    index: index,
                    name: nameEl.textContent.trim(),
                    description: descEl ? descEl.textContent.trim() : '',
                    link: linkEl.href,
                    category: category,
                    element: item,
                    categoryElement: categoryElement // 可以保留，但不一定需要
                });
            }
        });

        console.log(`加载了 ${this.data.length} 个网站数据`, this.data);
    },

    bindEvents() {
        const searchInput = document.getElementById('useful-links-search');
        const categoryFilters = document.querySelectorAll('.category-filter');

        if (searchInput) {
            // 搜索输入框事件
            searchInput.addEventListener('input', this.debounce((e) => {
                this.performSearch(e.target.value);
            }, 300));

            // 回车键搜索
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                }
            });
        }

        // 分类筛选事件
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
                this.updateActiveFilter(e.target);

                // 如果不是"全部"，则滚动到对应分类
                if (category !== 'all') {
                    this.scrollToCategory(category);
                }
            });
        });
    },

    performSearch(keyword) {
        keyword = keyword.toLowerCase().trim();

        if (keyword === '') {
            this.showAllItems();
            this.updateResultsCount();
            return;
        }

        let visibleCount = 0;
        const categoryVisibility = {}; // 记录每个分类下是否有可见项目

        this.data.forEach(item => {
            const matchName = item.name.toLowerCase().includes(keyword);
            const matchDesc = item.description.toLowerCase().includes(keyword);
            const isVisible = matchName || matchDesc;

            // 根据当前分类过滤
            const categoryMatch = this.currentCategory === 'all' || item.category === this.currentCategory;
            const shouldShow = isVisible && categoryMatch;

            if (shouldShow) {
                visibleCount++;
                // 高亮显示匹配的关键词
                this.highlightKeyword(item, keyword);
                item.element.classList.remove('hidden');

                // 记录该分类下有可见项目
                categoryVisibility[item.category] = true;
            } else {
                item.element.classList.add('hidden');
            }
        });

        // 显示/隐藏分类标题
        this.toggleCategoryTitles(categoryVisibility);
        this.updateResultsCount(visibleCount, keyword);
    },

    filterByCategory(category) {
        this.currentCategory = category;
        const searchInput = document.getElementById('useful-links-search');
        const keyword = searchInput ? searchInput.value : '';

        if (keyword) {
            this.performSearch(keyword);
        } else {
            this.showCategoryItems(category);
        }
    },

    showCategoryItems(category) {
        let visibleCount = 0;
        const categoryVisibility = {};

        this.data.forEach(item => {
            const shouldShow = category === 'all' || item.category === category;

            if (shouldShow) {
                visibleCount++;
                item.element.classList.remove('hidden');
                this.removeHighlight(item); // 切换分类时移除高亮
                categoryVisibility[item.category] = true;
            } else {
                item.element.classList.add('hidden');
            }
        });

        this.toggleCategoryTitles(categoryVisibility);
        this.updateResultsCount(visibleCount);
    },

    showAllItems() {
        this.data.forEach(item => {
            item.element.classList.remove('hidden');
            this.removeHighlight(item);
        });

        // 显示所有分类标题
        document.querySelectorAll('.flink h2').forEach(title => {
            title.style.display = '';
        });
    },

    highlightKeyword(item, keyword) {
        const nameEl = item.element.querySelector('.cf-friends-name');
        const descEl = item.element.querySelector('.flink-item-desc');

        if (nameEl) {
            nameEl.innerHTML = this.highlightText(item.name, keyword);
        }
        if (descEl) {
            descEl.innerHTML = this.highlightText(item.description, keyword);
        }
    },

    removeHighlight(item) {
        const nameEl = item.element.querySelector('.cf-friends-name');
        const descEl = item.element.querySelector('.flink-item-desc');

        if (nameEl) {
            nameEl.textContent = item.name;
        }
        if (descEl) {
            descEl.textContent = item.description;
        }
    },

    highlightText(text, keyword) {
        if (!text || !keyword) return text;

        const regex = new RegExp(`(${keyword})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    },

    toggleCategoryTitles(categoryVisibility) {
        document.querySelectorAll('.flink h2').forEach(title => {
            const category = title.dataset.category;
            // 当不是“全部”分类时，只显示当前选中的分类标题
            if (this.currentCategory !== 'all') {
                title.style.display = (category === this.currentCategory && categoryVisibility[category]) ? '' : 'none';
            } else {
                // 当是“全部”分类时，根据是否有可见项目来显示/隐藏标题
                title.style.display = categoryVisibility[category] ? '' : 'none';
            }
        });
    },

    updateActiveFilter(activeFilter) {
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.classList.remove('active');
        });
        activeFilter.classList.add('active');
    },

    scrollToCategory(categoryName) {
        const targetTitle = document.querySelector(`h2[data-category="${categoryName}"]`);
        if (targetTitle && typeof anzhiyu !== 'undefined' && anzhiyu.scrollToDest) {
            // 使用主题自带的平滑滚动函数
            const targetTop = anzhiyu.getEleTop(targetTitle) - 120; // 预留搜索框高度
            anzhiyu.scrollToDest(targetTop, 500);
        } else if (targetTitle) {
            // 备用滚动方案
            targetTitle.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        }
    },

    updateResultsCount(count = null, keyword = '') {
        const statsEl = document.getElementById('search-results-count');
        if (!statsEl) return;

        if (count === null) {
            // 如果 count 为 null，则重新计算当前可见项目的数量
            count = this.data.filter(item => !item.element.classList.contains('hidden')).length;
        }

        let categoryDisplayName = this.currentCategory;
        if (this.currentCategory === 'all') {
            categoryDisplayName = '所有'; // 或者保持 'all'，取决于你希望显示什么
        } else {
            // 尝试从分类筛选按钮中获取更友好的分类名称
            const categoryFilterElement = document.querySelector(`.category-filter[data-category="${this.currentCategory}"]`);
            if (categoryFilterElement) {
                categoryDisplayName = categoryFilterElement.textContent.trim();
            }
        }


        if (keyword) {
            statsEl.textContent = `找到 ${count} 个包含 "${keyword}" 的网站`;
        } else if (this.currentCategory !== 'all') {
            statsEl.textContent = `${categoryDisplayName} 分类下共 ${count} 个网站`;
        } else {
            statsEl.textContent = `共 ${count} 个实用网站`;
        }
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// 智能初始化函数 - 支持动态加载
function initUsefulLinksSearch() {
    if (document.getElementById('useful-links-search-container')) {
        UsefulLinksSearch.init();
    }
}

// 检查页面加载状态，支持动态加载的JS文件
if (document.readyState === 'loading') {
    // 如果页面还在加载中，等待 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initUsefulLinksSearch);
} else {
    // 如果页面已经加载完成（动态加载的情况），立即初始化
    initUsefulLinksSearch();
}

// 支持 PJAX 刷新
if (typeof anzhiyu !== 'undefined') {
    anzhiyu.addGlobalFn('pjax', () => {
        if (document.getElementById('useful-links-search-container')) {
            setTimeout(() => {
                UsefulLinksSearch.init();
            }, 100);
        }
    });
}