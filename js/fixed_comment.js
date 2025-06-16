// 移除FixedComment类，保持原生样式，确保不与最新评论跳转冲突
function RemoveFixedComment() {
    var activedItems = document.querySelectorAll('.fixedcomment');
    if (activedItems) {
      for (i = 0; i < activedItems.length; i++) {
        activedItems[i].classList.remove('fixedcomment');
      }
    }
  }
  // 给post-comment添加fixedcomment类
  function AddFixedComment(){
    var commentBoard = document.getElementById('post-comment');
    var quitBoard = document.getElementById('quit-board');
    commentBoard.classList.add('fixedcomment');
    quitBoard.classList.add('fixedcomment');
  }
  // 创建一个蒙版，作为退出键使用
  function CreateQuitBoard(){
    // 检查是否已存在蒙版，避免重复创建
    if (document.getElementById('quit-board')) return;
    var quitBoardHTML = `<div id="quit-board" onclick="RemoveFixedComment()"></div>`
    var commentBoard = document.getElementById('post-comment');
    // 确保评论区存在再操作
    if (commentBoard) {
      commentBoard.insertAdjacentHTML("beforebegin", quitBoardHTML);
    }
  }
  
  function FixedCommentBtn(){
    var commentBoard = document.getElementById('post-comment');
    if (commentBoard) {
        if (commentBoard.className.indexOf('fixedcomment') > -1){
          RemoveFixedComment();
        } else {
          CreateQuitBoard();
          AddFixedComment();
        }
    } else {
        // 如果当前页面没有评论区，则跳转到留言板页面
        if (window.pjax){
          pjax.loadUrl("/comments/#post-comment");
        } else {
          window.location.href = "/comments/#post-comment";
        }
    }
  }
  // 切换页面先初始化一遍，确保开始时是原生状态。所以要加pjax重载。
  RemoveFixedComment();