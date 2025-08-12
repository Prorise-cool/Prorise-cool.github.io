var posts=["posts/59129.html","posts/34023.html","posts/35531.html","posts/35020.html","posts/30592.html","posts/51707.html","posts/19658.html","posts/27803.html","posts/10822.html","posts/38528.html","posts/45404.html","posts/60138.html","posts/27703.html","posts/40087.html","posts/25511.html","posts/32684.html","posts/37507.html","posts/4512.html","posts/26490.html","posts/17683.html","posts/8272.html","posts/8823.html","posts/30992.html","posts/30404.html","posts/7673.html","posts/38041.html","posts/11780.html","posts/51587.html","posts/8024.html","posts/23264.html","posts/13237.html","posts/59297.html","posts/56262.html","posts/10477.html","posts/30401.html","posts/56426.html","posts/49291.html","posts/63007.html","posts/10992.html","posts/26102.html","posts/51074.html","posts/11486.html","posts/10882.html","posts/34091.html","posts/43263.html","posts/20246.html","posts/57565.html","posts/65188.html","posts/24286.html","posts/50205.html","posts/50416.html","posts/41598.html","posts/8068.html","posts/45178.html","posts/61533.html","posts/7656.html","posts/41365.html","posts/22096.html","posts/17934.html","posts/64413.html","posts/5555.html","posts/30787.html","posts/58950.html","posts/9132.html","posts/33216.html","posts/53790.html","posts/43551.html","posts/43542.html","posts/43565.html","posts/43523.html","posts/64203.html","posts/14501.html","posts/64051.html","posts/19824.html","posts/62133.html","posts/6760.html","posts/42235.html","posts/35626.html","posts/30645.html","posts/43091.html","posts/55902.html","posts/27024.html","posts/34823.html","posts/33663.html","posts/38131.html","posts/44770.html","posts/13212.html","posts/9962.html","posts/62937.html","posts/52396.html","posts/29798.html","posts/15831.html","posts/56572.html","posts/37372.html","posts/45310.html","posts/50189.html","posts/56691.html","posts/51603.html","posts/8019.html","posts/2501.html","posts/17730.html","posts/39655.html","posts/11472.html","posts/3041.html","posts/56142.html","posts/50765.html"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };var friend_link_list=[{"name":"Hexo","link":"https://hexo.io/zh-tw/","avatar":"https://d33wubrfki0l68.cloudfront.net/6657ba50e702d84afb32fe846bed54fba1a77add/827ae/logo.svg","descr":"快速、简单且强大的网站框架"},{"name":"anzhiyu主题","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","siteshot":"https://npm.elemecdn.com/anzhiyu-theme-static@1.1.6/img/blog.anheyu.com.jpg"},{"name":"安知鱼","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","siteshot":"https://npm.elemecdn.com/anzhiyu-theme-static@1.1.6/img/blog.anheyu.com.jpg","color":"vip","tag":"技术"},{"name":"张洪Heo","link":"https://blog.zhheo.com/","avatar":"https://img.zhheo.com/i/67d8fa75943e4.webp","descr":"分享设计与科技生活","siteshot":"https://img.zhheo.com/i/67d8fb3c51399.webp","color":"vip","tag":"技术"},{"name":"安知鱼","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","recommend":false},{"name":"星港◎Star☆","link":"https://blog.starsharbor.com","avatar":"https://bu.dusays.com/2025/04/11/67f92f6fcfb26.webp","descr":"以博客记录生活与热爱！","recommend":false},{"name":"张洪Heo","link":"https://blog.zhheo.com/","avatar":"https://img.zhheo.com/i/67d8fa75943e4.webp","descr":"分享设计与科技生活","siteshot":"https://img.zhheo.com/i/67d8fb3c51399.webp","recommend":true}];
    var refreshNum = 1;
    function friendChainRandomTransmission() {
      const randomIndex = Math.floor(Math.random() * friend_link_list.length);
      const { name, link } = friend_link_list.splice(randomIndex, 1)[0];
      Snackbar.show({
        text:
          "点击前往按钮进入随机一个友链，不保证跳转网站的安全性和可用性。本次随机到的是本站友链：「" + name + "」",
        duration: 8000,
        pos: "top-center",
        actionText: "前往",
        onActionClick: function (element) {
          element.style.opacity = 0;
          window.open(link, "_blank");
        },
      });
    }
    function addFriendLinksInFooter() {
      var footerRandomFriendsBtn = document.getElementById("footer-random-friends-btn");
      if(!footerRandomFriendsBtn) return;
      footerRandomFriendsBtn.style.opacity = "0.2";
      footerRandomFriendsBtn.style.transitionDuration = "0.3s";
      footerRandomFriendsBtn.style.transform = "rotate(" + 360 * refreshNum++ + "deg)";
      const finalLinkList = [];
  
      let count = 0;

      while (friend_link_list.length && count < 3) {
        const randomIndex = Math.floor(Math.random() * friend_link_list.length);
        const { name, link, avatar } = friend_link_list.splice(randomIndex, 1)[0];
  
        finalLinkList.push({
          name,
          link,
          avatar,
        });
        count++;
      }
  
      let html = finalLinkList
        .map(({ name, link }) => {
          const returnInfo = "<a class='footer-item' href='" + link + "' target='_blank' rel='noopener nofollow'>" + name + "</a>"
          return returnInfo;
        })
        .join("");
  
      html += "<a class='footer-item' href='/link/'>更多</a>";

      document.getElementById("friend-links-in-footer").innerHTML = html;

      setTimeout(()=>{
        footerRandomFriendsBtn.style.opacity = "1";
      }, 300)
    };