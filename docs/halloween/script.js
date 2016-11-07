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

  // 是否可以使用动画标志
  var canUseAnimate = isSupportAnimate();

  if (!canUseAnimate) {
    $(".js_hasAnimate").show();
  }


  if (canUseAnimate) {
    $("#js_step1").find(".js_hasAnimate").each(function() {
      var $this = $(this);
      $this.addClass($this.data("animate"));
    }).show();
  }

  // 屏幕高度不够的时候，底部南瓜出现之前，滚动到底部，把焦点集中在南瓜上
  var $win = $(window),
    winHeight = $win.height(),
    $htmlAndBody = $("html, body");

  if (winHeight < 979) {
    setTimeout(function() {
      $htmlAndBody.animate({scrollTop: (1000 - winHeight)+"px"});
    }, canUseAnimate ? 2000 : 0);
  } else {
    $htmlAndBody.css("overflow", "hidden");
  }

  $win.on("resize", function() {
    winHeight = $win.height();
    $htmlAndBody.css("overflow", winHeight >= 979 ? "hidden" : "auto");
  });


  function gotoStep1FromStep2() {
    var $step1 = $("#js_step1"),
      $step2 = $("#js_step2"),
      $parent =  $("#js_openit").parent();

    $parent.removeClass($parent.data("animate-two")).addClass($parent.data("animate"));
    $step1.show();
    $step2.find(".js_hasAnimate").each(function() {
      var $this = $(this);
      $this.removeClass($this.data("animate"));
    });
    $step2.animate({top: 979}, 1000, function() {
      $step2.hide();
    });
  }



  function gotoStep2(needAnimate) {
    var $step2 = $("#js_step2").show(),
      $target =  $("html"),
      $animateEls = $step2.find(".js_hasAnimate");

    $step2.css("top", "979px").animate({top: 0}, 1000, function() {
      $("#js_step1").hide();
    });


    if (needAnimate && canUseAnimate) {
      $animateEls.each(function() {
        var $this = $(this);
        $this.addClass($this.data("animate"));
      });
    }
    $animateEls.show();
  }

  function setGift(gift) {
    $("#js_giftDesc").html(gift.desc);
    $("#js_giftValue").text(gift.value);
    $("#js_otherTips").text(gift.tips);
  }

  function requestGift() {

    var startTime = $.now(),
      $parent = $("#js_openit").parent();

    $.ajax({
      url:"data/gift.json",
      type: "GET",
      dataType: "json"
    }).done(function(json) {
      var useTime;

      $parent.removeClass($parent.data("animateTwo")).data("processing", false);
      if (json.status == 1) {
        setGift(json);
        useTime = $.now() - startTime;
        // 为了让南瓜动画持续至少1s
        setTimeout(function() {
          gotoStep2(true);
        }, canUseAnimate ? Math.max(0, 1000 - useTime) : 0);
      } else if (json.status == 2) {
        $("#js_gift").hide();
        $("#js_giftError").show();
        gotoStep2(false);
      } else {
        MY.alert({msg : json.msg});
      }
    }).fail(function() {
      MY.alert({msg : "Please try again!"});
      $parent.removeClass($parent.data("animateTwo")).data("processing", false);
    });
  }

  // 点击南瓜
  $("#js_openit").on("click", function() {
      var $parent = $(this).parent();
      // 防止二次点击
      if (!$parent.data("processing")) {
        $parent.data("processing", true);
        if (canUseAnimate) {
          $parent.removeClass($parent.data("animate")).addClass($parent.data("animate-two"));
        }

        requestGift();
      }
  });

  $("#js_close").on("click", function() {
    gotoStep1FromStep2();
  });


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
