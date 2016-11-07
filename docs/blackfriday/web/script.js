(function(window, $) {
  /* 检测是否可以使用css动画 https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Detecting_CSS_animation_support */
  function isSupportAnimate() {
    var animation = false,
      animationstring = 'animation',
      keyframeprefix = '',
      domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
      pfx  = '',
      elm = document.createElement('div');

    if( elm.style.animationName !== undefined ) { animation = true; }

    if( animation === false ) {
      for( var i = 0; i < domPrefixes.length; i++ ) {
        if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
          pfx = domPrefixes[ i ];
          animationstring = pfx + 'Animation';
          keyframeprefix = '-' + pfx.toLowerCase() + '-';
          animation = true;
          break;
        }
      }
    }

    return animation;
  }

  /* 参考 Modernizr 兼容各个浏览器的animationend事件名称*/
  function prefixAnimationEndEvent(){
    var el = document.createElement('fakeelement'),
      eventNames = {
        "WebkitAnimation" : "webkitAnimationEnd",
        "MozAnimation"    : "animationend",
        "OAnimation"      : "oAnimationEnd",
        "msAnimation"     : "animationend", // 网上好多都是msAnimationEnd，坑我，https://msdn.microsoft.com/en-US/library/dn632679%28v=vs.85%29.aspx
        "animation"       : "animationend"
      };

    for(var key in eventNames) {
      if(el.style[key] !== undefined){
        return eventNames[key];
      }
    }

    return null;
  }

  var canUseAnimate = isSupportAnimate(), // 是否可以使用动画标志
    animationEndEventName = canUseAnimate && prefixAnimationEndEvent(), // 动画时间名称，兼容各种浏览器
    $stageOne = $("#js_stageOne"), // 第一幕
    $stageTwo = $("#js_stageTwo"), // 第二幕
    $openItText = $("#js_openItText"), // "open it now"文字元素
    $openIt = $("#js_openIt"), // 点击打开第二幕的区域
    $htmlAndBody = $("html, body");

  function setCoupon(coupon) {
    $("#js_couponDesc").text(coupon.desc || "");
    $("#js_couponValue").text(coupon.value || "");
    $("#js_couponTips").text(coupon.tips || "");
  }

  // 请求coupon
  function requestCoupon() {
    var startTime = $.now();
    if ($openIt.data("processing") === true) {
      return;
    }
    $openIt.data("processing", true); // 标记，避免多次提交

    $.ajax({
      url: 'data/gift.json',
      type: "GET",
      dataType: "json"
    }).done(function(json) {
      var useTime;
      $openIt.data("processing", false);
      if (json.status == 1) {
        setCoupon(json);
        $("#js_coupon").show();
        $("#js_couponError").hide();
        useTime = $.now() - startTime;
        // 为了让帽子动画持续至少1s
        setTimeout(function() {
          gotoStage2(true);
        }, canUseAnimate ? Math.max(0, 1000 - useTime) : 0);
      } else if (json.status == 2) {
        $("#js_coupon").hide();
        $("#js_couponError").show();
        gotoStage2(false);
      } else {
        MY.alert({msg : json.msg});
      }
    }).fail(function() {
      $openIt.data("processing", false);
      MY.alert({msg : "Please try again!"});
    });
  }

  // 回到第一幕
  function gotoStage1() {
    if (canUseAnimate) {
      $openItText.addClass($openItText.data("animation2"));
    }
    $stageOne.animate({marginTop: 0}, 1000);
  }

  // 去到第二幕
  function gotoStage2(needAnimation) {
    $stageTwo.show(); // 页面刚进来的时候第二幕是隐藏的
    $htmlAndBody.animate({scrollTop: 0}, 1000); // 滚动到顶部，把用户焦点放在coupon框
    if (canUseAnimate) {
      $openIt.removeClass($openIt.data("animation2"));
      if (needAnimation) {
        play($stageTwo);
      } else {
        $stageTwo.find(".has-animation").show();
      }
    }
    $stageOne.animate({marginTop: -1000}, 1000);
  }

  // 播放动画
  function play(stage) {
    stage.find(".has-animation").each(function() {
      var $this = $(this);
      $this.addClass($this.data("animation")).show();
    });
  }

    // 点击去到第二幕
    $openIt.on("click", function() {
      requestCoupon();

      if(canUseAnimate) {
        $openItText.removeClass($openItText.data("animation2"));
        $openIt.removeClass($openIt.data("animation"))
          .addClass($openIt.data("animation2"));
      }
    });

  // 点击回到第一幕
  $("#js_closeCouponBox").on("click", function() {
    gotoStage1();
  });

  // 开始播放第一幕的动画
  if (canUseAnimate) {
    if (animationEndEventName) {
      $openItText.one(animationEndEventName, function() {
        $openItText.removeClass($openItText.data("animation"))
          .addClass($openItText.data("animation2"));
      });
      $("#js_text").one(animationEndEventName, function() {
        $htmlAndBody.animate({scrollTop: "1000px"}, 1000);
      });
    }
    play($stageOne);
  } else {
    $.each([$stageOne, $stageTwo], function(i, v) {
      v.find(".has-animation").show();
    });
  }



  /**
   * 模拟alert框
   * @param  {[type]} options.msg         文本 默认没有
   * @param  {[type]} options.title       标题 默认没有
   * @param  {[type]} options.shade       遮罩层 默认有
   * @param  {[type]} options.typeTag     弹出框信息类型0-15,-1不显示
   * @param  {[type]} options.callBack    确认按钮回调函数
   * @param  {[type]} options.callBackArg 确认按钮回调函数回调函数的参数
   * @return {[type]} null        [description]
   */
  var MY = {};
  MY.alert = function(options) {
    var defaultOpts = {
      shade: options.shade ? options.shade : [0.8, '#000', true],
      area: ['auto', 'auto'],
      title: options.title ? options.title : 'Message',
      border: [1, 1, '#ddd', true],
      dialog: {
        msg: options.msg ? options.msg : "",
        btns: 1,
        type: options.typeTag ? options.typeTag : 0,
        btn: ['Ok'],
        yes: function (index) {
          options.callBack ? options.callBack(options.callBackArg ? options.callBackArg : "") : "";
          layer.close(index);
        }
      }
    }
    return $.layer(defaultOpts);
  }
})(window, jQuery);
