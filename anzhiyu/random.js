var posts=["posts/17730.html","posts/56572.html","posts/8019.html","posts/55902.html","posts/43091.html","posts/27024.html","posts/2501.html","posts/56691.html","posts/37372.html","posts/50189.html","posts/29798.html","posts/62937.html","posts/34823.html","posts/52396.html","posts/38131.html","posts/45310.html","posts/33663.html","posts/9962.html","posts/13212.html","posts/51603.html","posts/15831.html","posts/30401.html","posts/30645.html","posts/35626.html","posts/42235.html","posts/43523.html","posts/30403.html","posts/6760.html","posts/62133.html","posts/64051.html","posts/19824.html","posts/14501.html","posts/44770.html","posts/24286.html","posts/65188.html","posts/57565.html","posts/20246.html","posts/10882.html","posts/34091.html","posts/11486.html","posts/26102.html","posts/43263.html","posts/51074.html","posts/10992.html","posts/63007.html","posts/22096.html","posts/56426.html","posts/7656.html","posts/49291.html","posts/45178.html","posts/8068.html","posts/61533.html","posts/41598.html","posts/41365.html","posts/50416.html","posts/50205.html","posts/53790.html","posts/33216.html","posts/9132.html","posts/30787.html","posts/17934.html","posts/5555.html","posts/59358.html","posts/5770.html","posts/22322.html","posts/52289.html","posts/60609.html","posts/64413.html","posts/58950.html","posts/18714.html","posts/47912.html","posts/29776.html","posts/51850.html","posts/64777.html","posts/9442.html"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };var friend_link_list=[{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=1","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=2","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=3"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=4","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=5","color":"vip","tag":"技术"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=6","descr":"待添加描述","recommend":true},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=7","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=8","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=9","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=10"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=11","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=12","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=13","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=14"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=15","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=16","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=17"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=18","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=19"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=20","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=21","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=22","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=23","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=24"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=25","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=26","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=27"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=28","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=29","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=30","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=31"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=32","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=33","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=34"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=35","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=36","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=37"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=38","descr":"待添加描述"},{"name":"待添加","link":"https://example.com","avatar":"https://picsum.photos/200/200?random=39","descr":"待添加描述","siteshot":"https://picsum.photos/800/600?random=40"}];
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