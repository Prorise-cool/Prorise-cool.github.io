/**
 * Hexo AnZhiyu主题 - Markdown源文件下载功能
 * 
 * 功能说明：
 * - 为技术博客文章添加Markdown源文件下载功能
 * - 包含完整的Front-matter和文章内容
 * - 纯前端实现，安全可靠
 * 
 * 作者：Prorise
 * 版本：1.0.0
 * 兼容：AnZhiyu主题
 */

(function() {
  'use strict';

  /**
   * 将JSON格式的Front-matter数据，转换为YAML字符串
   * @param {object} data - 包含title, date等信息的对象
   * @returns {string} - 格式化后的YAML字符串
   */
  function formatFrontMatterToYAML(data) {
    let yamlString = '---\n';
    yamlString += `title: ${data.title}\n`;
    yamlString += `date: ${data.date}\n`;
    
    // 只有当更新时间与创建时间不同时才添加updated字段
    if (data.updated && data.updated !== data.date) {
      yamlString += `updated: ${data.updated}\n`;
    }
    
    // 添加分类信息
    if (data.categories && data.categories.length > 0) {
      yamlString += 'categories:\n';
      data.categories.forEach(cat => {
        yamlString += `  - ${cat}\n`;
      });
    }
    
    // 添加标签信息
    if (data.tags && data.tags.length > 0) {
      yamlString += 'tags:\n';
      data.tags.forEach(tag => {
        yamlString += `  - ${tag}\n`;
      });
    }
    
    yamlString += '---\n\n';
    return yamlString;
  }

  /**
   * 清理文件名中的特殊字符
   * @param {string} filename - 原始文件名
   * @returns {string} - 清理后的文件名
   */
  function sanitizeFilename(filename) {
    // 移除或替换Windows/Linux文件系统不支持的字符
    return filename.replace(/[<>:"/\\|?*]/g, '_')
                  .replace(/\s+/g, '_')  // 将空格替换为下划线
                  .replace(/_{2,}/g, '_') // 将多个连续下划线替换为单个
                  .replace(/^_|_$/g, ''); // 移除开头和结尾的下划线
  }

  /**
   * 创建并触发文件下载
   * @param {string} content - 文件内容
   * @param {string} filename - 文件名
   */
  function downloadFile(content, filename) {
    try {
      // 创建Blob对象
      const blob = new Blob([content], { 
        type: 'text/markdown;charset=utf-8' 
      });
      
      // 创建下载链接并触发
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 清理URL对象
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('文件下载失败:', error);
      return false;
    }
  }

  /**
   * 验证文章数据的完整性
   * @param {object} postData - 文章数据
   * @returns {object} - 验证结果 {valid: boolean, message: string}
   */
  function validatePostData(postData) {
    if (!postData) {
      return { valid: false, message: '文章数据不存在' };
    }
    
    if (!postData.title) {
      return { valid: false, message: '文章标题缺失' };
    }
    
    if (!postData.content) {
      return { valid: false, message: '文章内容缺失' };
    }
    
    if (!postData.date) {
      return { valid: false, message: '文章日期缺失' };
    }
    
    return { valid: true, message: '数据验证通过' };
  }

  /**
   * 处理下载按钮点击事件
   */
  function handleDownloadClick() {
    try {
      console.log('开始处理Markdown文件下载...');
      
      // 获取文章数据
      const postData = window.postData;
      console.log('文章数据:', postData);
      
      // 验证数据完整性
      const validation = validatePostData(postData);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // 重新构建Front-matter
      const frontMatter = formatFrontMatterToYAML(postData);
      console.log('生成的Front-matter:', frontMatter);
      
      // 拼接成完整的Markdown文件内容
      const fullContent = frontMatter + postData.content;
      
      // 生成安全的文件名
      const safeFilename = sanitizeFilename(postData.title) + '.md';
      console.log('生成的文件名:', safeFilename);
      
      // 执行下载
      const downloadSuccess = downloadFile(fullContent, safeFilename);
      
      if (downloadSuccess) {
        console.log('✅ Markdown文件下载成功:', safeFilename);
        
        // 可选：显示成功提示（如果需要的话）
        // 这里可以集成主题的通知系统
        if (window.anzhiyu && window.anzhiyu.snackbarShow) {
          window.anzhiyu.snackbarShow('📄 Markdown文件下载成功！');
        }
      } else {
        throw new Error('文件下载过程中发生错误');
      }
      
    } catch (error) {
      console.error('❌ 下载文章源文件失败:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        postData: window.postData
      });
      
      // 用户友好的错误提示
      alert(`下载失败: ${error.message}\n\n请检查浏览器控制台获取更多技术信息。`);
    }
  }

  /**
   * 初始化文章下载按钮的功能
   */
  function initArticleDownload() {
    console.log('🚀 初始化Markdown下载功能...');
    
    const downloadBtn = document.getElementById('download-md-btn');
    const hasPostData = window.postData;
    
    console.log('下载按钮元素:', downloadBtn);
    console.log('文章数据可用:', !!hasPostData);
    
    if (downloadBtn && hasPostData) {
      // 移除可能存在的旧事件监听器
      downloadBtn.removeEventListener('click', handleDownloadClick);
      
      // 添加新的事件监听器
      downloadBtn.addEventListener('click', handleDownloadClick);
      
      console.log('✅ Markdown下载功能初始化成功');
    } else {
      console.warn('⚠️ Markdown下载功能初始化失败:', {
        downloadBtn: !!downloadBtn,
        postData: !!hasPostData,
        currentPage: window.location.pathname
      });
    }
  }

  /**
   * 页面加载完成后初始化
   */
  function onPageReady() {
    // 延迟执行，确保页面元素完全加载
    setTimeout(initArticleDownload, 100);
  }

  // 绑定页面加载事件
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageReady);
  } else {
    onPageReady();
  }

  // 支持PJAX页面跳转
  document.addEventListener('pjax:success', onPageReady);

  // 暴露到全局作用域（用于调试）
  window.MarkdownDownload = {
    init: initArticleDownload,
    download: handleDownloadClick,
    version: '1.0.0'
  };

  console.log('📦 Markdown下载模块加载完成 v1.0.0');

})();
