/**
 * Runbox 可运行代码块功能
 * 支持代码执行和结果显示
 * 基于AnZhiYu主题的深度集成
 */

(function () {
    'use strict';

    // 配置常量
    const CONFIG = {
        RUNBOX_SELECTOR: '.runbox-container',
        RESULT_SELECTOR: '.runbox-result',
        CODE_BLOCK_SELECTOR: 'figure.highlight',
        BUTTON_CLASS: 'runbox-run-btn',
        SHOW_CLASS: 'show'
    };

    /**
     * 按钮状态管理器
     * 负责管理运行按钮的状态和图标
     */
    class ButtonStateManager {
        /**
         * 设置按钮状态
         * @param {HTMLElement} button - 按钮元素
         * @param {string} state - 状态 ('idle', 'loading', 'success', 'error')
         * @param {string} text - 按钮文本 (可选)
         */
        static setState(button, state, text) {
            if (!button) {
                return;
            }

            // 清除所有状态类，但保留功能类
            button.classList.remove('loading', 'success', 'error', 'idle');
            button.classList.add(state);

            // 更新图标：仅替换 anzhiyu-icon-* 与 anzhiyu-spin，不移除 runbox-run-btn/anzhiyufont
            const iconElement = button;
            if (iconElement) {
                const classes = Array.from(iconElement.classList);
                classes
                    .filter(c => c.startsWith('anzhiyu-icon-') || c === 'anzhiyu-spin')
                    .forEach(c => iconElement.classList.remove(c));

                // 确保保留基础类
                iconElement.classList.add('anzhiyufont');
                if (!iconElement.classList.contains('runbox-run-btn')) {
                    iconElement.classList.add('runbox-run-btn');
                }

                // 添加对应图标类
                const iconClasses = this.getIconClass(state).split(' ').filter(Boolean);
                iconClasses.forEach(c => iconElement.classList.add(c));
            }

            if (text && button.title !== undefined) {
                button.title = text;
            }
        }

        /**
         * 获取状态对应的图标类名
         * @param {string} state - 状态名称
         * @returns {string} 图标类名
         */
        static getIconClass(state) {
            const iconMap = {
                idle: 'anzhiyu-icon-play',
                loading: 'anzhiyu-icon-spinner anzhiyu-spin',
                success: 'anzhiyu-icon-check',
                error: 'anzhiyu-icon-exclamation'
            };
            return iconMap[state] || iconMap.idle;
        }

        /**
         * 重置按钮到初始状态
         * @param {HTMLElement} button - 按钮元素
         * @param {number} delay - 延迟时间（毫秒）
         */
        static resetAfterDelay(button, delay = 2000) {
            setTimeout(() => {
                this.setState(button, 'idle', '运行代码');
            }, delay);
        }
    }

    /**
     * Runbox管理器类
     * 专注于代码执行逻辑
     */
    class RunboxManager {
        constructor() {
            this.runboxInstances = new Map(); // 存储runbox实例数据
            this.init();
        }

        /**
         * 初始化 - 绑定页面加载事件
         */
        init() {
            // 页面加载完成后初始化
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initRunboxes());
            } else {
                this.initRunboxes();
            }

            // PJAX页面跳转兼容（AnZhiYu主题支持）
            if (typeof anzhiyu !== 'undefined' && anzhiyu.addEventListenerPjax) {
                anzhiyu.addEventListenerPjax(document, 'pjax:complete', () => this.initRunboxes());
            } else if (typeof pjax !== 'undefined') {
                document.addEventListener('pjax:complete', () => this.initRunboxes());
            }

            // 页面卸载时清理资源
            window.addEventListener('beforeunload', () => this.cleanup());
        }

        /**
         * 扫描并初始化所有runbox
         */
        initRunboxes() {
            try {
                // 清理旧实例
                this.cleanup();

                const runboxContainers = document.querySelectorAll(CONFIG.RUNBOX_SELECTOR);

                runboxContainers.forEach(container => {
                    // 如果容器已有ID，则跳过
                    if (container.dataset.runboxId) {
                        return;
                    }

                    const instanceId = this.generateInstanceId();
                    container.dataset.runboxId = instanceId;

                    // 查找关联的代码块
                    const codeBlock = this.findAssociatedCodeBlock(container);
                    if (!codeBlock) {
                        return;
                    }

                    // 获取runbox配置
                    const config = this.extractRunboxConfig(container);

                    // 存储实例数据
                    this.runboxInstances.set(instanceId, {
                        container,
                        codeBlock,
                        config,
                        isExecuting: false,
                        lastExecuteTime: null
                    });
                });

                // 通知main.js重新检查runbox关联
                const triggerRecheck = () => {
                    if (typeof window.recheckRunboxAssociations === 'function') {
                        window.recheckRunboxAssociations();
                    } else {
                        setTimeout(triggerRecheck, 100);
                    }
                };

                // 延迟调用以确保main.js已加载
                setTimeout(triggerRecheck, 200);
            } catch (error) {
                // 静默处理错误
            }
        }

        /**
         * 生成唯一实例ID
         * @private
         */
        generateInstanceId() {
            return 'runbox-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }

        /**
         * 执行指定runbox的代码
         * @param {string} instanceId - runbox实例ID
         * @param {HTMLElement} button - 触发按钮 (可选)
         * @returns {Promise<ExecutionResult>}
         */
        async execute(instanceId, button = null) {
            const instance = this.runboxInstances.get(instanceId);
            if (!instance) {
                throw new Error(`Runbox instance ${instanceId} not found`);
            }

            if (instance.isExecuting) {
                return { success: false, error: 'Already executing' };
            }

            try {
                instance.isExecuting = true;
                instance.lastExecuteTime = Date.now();

                const container = instance.container;
                if (!container) throw new Error('找不到结果容器');
                const resultPanel = container.querySelector('.runbox-result');
                if (!resultPanel) throw new Error('结果面板缺失');

                const isOpen = resultPanel.classList.contains('show');

                if (isOpen) {
                    this._collapsePanel(resultPanel);
                    if (button) ButtonStateManager.setState(button, 'idle', '运行');
                    return { success: true, output: '(已折叠)' };
                }

                if (button) {
                    ButtonStateManager.setState(button, 'loading', '执行中...');
                    setTimeout(() => {
                        if (button.classList.contains('loading')) {
                            ButtonStateManager.setState(button, 'idle', '运行');
                        }
                    }, 3000);
                }

                const preset = this.getPresetOutput(instanceId);
                if (!preset.success) {
                    this._expandPanel(resultPanel);
                    if (button) {
                        ButtonStateManager.setState(button, 'error', '无结果');
                        ButtonStateManager.resetAfterDelay(button, 2000);
                    }
                    return preset;
                }

                this.ensureCloseButton(resultPanel, button);
                this._expandPanel(resultPanel);

                if (button) {
                    ButtonStateManager.setState(button, 'success', '执行完成');
                    ButtonStateManager.resetAfterDelay(button, 2000);
                }

                return preset;
            } catch (error) {
                if (button) {
                    ButtonStateManager.setState(button, 'error', '执行失败');
                    ButtonStateManager.resetAfterDelay(button, 3000);
                }
                return { success: false, error: error.message };
            } finally {
                instance.isExecuting = false;
            }
        }

        /**
         * 查找与runbox容器关联的代码块
         * @private
         */
        findAssociatedCodeBlock(runboxContainer) {
            // 向前查找最近的代码块
            let element = runboxContainer.previousElementSibling;
            while (element) {
                if (element.matches(CONFIG.CODE_BLOCK_SELECTOR)) {
                    return element;
                }
                element = element.previousElementSibling;
            }
            return null;
        }

        /**
         * 提取runbox配置信息
         * @private
         */
        extractRunboxConfig(container) {
            return {
                label: container.dataset.runboxLabel || '运行',
                output: container.dataset.runboxOutput || 'console',
                collapsed: container.dataset.runboxCollapsed !== 'false',
                src: container.dataset.runboxSrc || '',
                language: container.dataset.runboxLanguage || 'unknown'
            };
        }

        /**
         * 检查元素是否关联runbox
         * @param {HTMLElement} codeBlock - 代码块元素
         * @returns {string|null} runbox实例ID或null
         */
        checkAssociation(codeBlock) {
            if (!codeBlock) return null;

            // 查找紧邻的下一个runbox容器
            let sibling = codeBlock.nextElementSibling;
            while (sibling) {
                if (sibling.classList.contains('runbox-container')) {
                    return sibling.dataset.runboxId || null;
                }
                // 只检查直接相邻的兄弟元素，避免误判
                if (sibling.tagName !== 'BR' && !sibling.classList.contains('whitespace')) {
                    break;
                }
                sibling = sibling.nextElementSibling;
            }
            return null;
        }

        /**
         * 获取runbox配置
         * @param {string} instanceId - runbox实例ID
         * @returns {Object} 配置对象
         */
        getConfig(instanceId) {
            const instance = this.runboxInstances.get(instanceId);
            return instance ? instance.config : null;
        }

        /**
         * 从runbox容器读取预置结果
         */
        getPresetOutput(instanceId) {
            const instance = this.runboxInstances.get(instanceId);
            if (!instance || !instance.container) {
                return { success: false, error: '找不到对应的结果容器' };
            }

            const container = instance.container;
            const type = (instance.config.output || 'console').toLowerCase();
            try {
                if (type === 'console') {
                    const codeEl = container.querySelector('.runbox-result-content pre code');
                    const text = codeEl ? (codeEl.textContent || codeEl.innerText || '').trim() : '';
                    if (!text) return { success: false, error: '结果内容为空' };
                    return { success: true, output: text };
                } else if (type === 'image') {
                    const src = container.dataset.runboxSrc || instance.config.src || '';
                    if (!src) return { success: false, error: '未提供图片地址' };
                    return { success: true, output: `图片：${src}` };
                }
                // 兜底为文本
                const textEl = container.querySelector('.runbox-result-content');
                const text = textEl ? (textEl.textContent || '').trim() : '';
                if (!text) return { success: false, error: '结果内容为空' };
                return { success: true, output: text };
            } catch (e) {
                return { success: false, error: `读取结果失败：${e.message}` };
            }
        }

        /**
         * 为结果面板添加关闭按钮（若不存在）
         */
        ensureCloseButton(resultPanel, button) {
            if (resultPanel.querySelector('.runbox-result-close')) return;
            const closeBtn = document.createElement('button');
            closeBtn.className = 'runbox-result-close anzhiyufont anzhiyu-icon-xmark';
            closeBtn.type = 'button';
            closeBtn.title = '关闭';
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this._collapsePanel(resultPanel);
                if (button) ButtonStateManager.setState(button, 'idle', '运行');
            });
            resultPanel.appendChild(closeBtn);
        }

        /**
         * 使用 max-height 动画展开面板
         */
        _expandPanel(panel) {
            panel.classList.add('show');
            panel.setAttribute('aria-hidden', 'false');
            panel.style.display = '';
            panel.style.maxHeight = '0px';
            // 强制回流
            // eslint-disable-next-line no-unused-expressions
            panel.offsetHeight;
            panel.style.maxHeight = panel.scrollHeight + 'px';
            const onEnd = (e) => {
                if (e.propertyName === 'max-height') {
                    panel.style.maxHeight = 'none';
                    panel.removeEventListener('transitionend', onEnd);
                }
            };
            panel.addEventListener('transitionend', onEnd);
        }

        /**
         * 使用 max-height 动画折叠面板
         */
        _collapsePanel(panel) {
            panel.style.maxHeight = panel.scrollHeight + 'px';
            // 强制回流
            // eslint-disable-next-line no-unused-expressions
            panel.offsetHeight;
            panel.style.maxHeight = '0px';
            const onEnd = (e) => {
                if (e.propertyName === 'max-height') {
                    panel.classList.remove('show');
                    panel.style.maxHeight = '';
                    panel.style.display = 'none';
                    panel.setAttribute('aria-hidden', 'true');
                    panel.removeEventListener('transitionend', onEnd);
                }
            };
            panel.addEventListener('transitionend', onEnd);
        }

        /**
         * 清理runbox资源
         * @param {string} instanceId - runbox实例ID (可选，如果不提供则清理所有)
         */
        cleanup(instanceId = null) {
            if (instanceId) {
                // 清理指定实例
                if (this.runboxInstances.has(instanceId)) {
                    this.runboxInstances.delete(instanceId);
                }
            } else {
                // 清理所有实例
                this.runboxInstances.clear();

                // 清理DOM元素的runbox ID属性
                const runboxContainers = document.querySelectorAll('.runbox-container[data-runbox-id]');
                runboxContainers.forEach(container => {
                    delete container.dataset.runboxId;
                });
            }
        }
    }

    // 创建全局管理器实例
    let globalRunboxManager = null;

    // 初始化全局实例
    if (typeof window !== 'undefined') {
        globalRunboxManager = new RunboxManager();

        // 创建全局通信接口
        window.runboxAPI = {
            /**
             * 执行runbox代码
             * @param {string} instanceId - runbox实例ID
             * @param {HTMLElement} button - 触发按钮
             * @returns {Promise<void>}
             */
            async execute(instanceId, button) {
                try {
                    if (!globalRunboxManager) {
                        throw new Error('RunboxManager not initialized');
                    }

                    await globalRunboxManager.execute(instanceId, button);
                } catch (error) {
                    // 优雅降级 - 显示错误提示
                    if (button) {
                        ButtonStateManager.setState(button, 'error', '执行失败');
                        ButtonStateManager.resetAfterDelay(button, 3000);
                    }
                    throw error;
                }
            },

            /**
             * 检查元素是否关联runbox
             * @param {HTMLElement} codeBlock - 代码块元素
             * @returns {string|null} runbox实例ID或null
             */
            checkAssociation(codeBlock) {
                try {
                    if (!globalRunboxManager) {
                        return null;
                    }

                    return globalRunboxManager.checkAssociation(codeBlock);
                } catch (error) {
                    return null;
                }
            },

            /**
             * 获取runbox配置
             * @param {string} instanceId - runbox实例ID
             * @returns {Object} 配置对象
             */
            getConfig(instanceId) {
                try {
                    if (!globalRunboxManager) {
                        return null;
                    }

                    return globalRunboxManager.getConfig(instanceId);
                } catch (error) {
                    return null;
                }
            },

            /**
             * 检查API是否可用
             * @returns {boolean}
             */
            isReady() {
                return globalRunboxManager !== null;
            }
        };

        // 保留旧接口以确保向下兼容
        window.runboxManager = globalRunboxManager;
    }

})(); 