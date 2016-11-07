+function(window, document, $) {
  /* 检测是否可以使用css动画 https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Detecting_CSS_animation_support */
  var canUseAnimate = function () {
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
  }();

  /* 参考 Modernizr 兼容各个浏览器的animationend事件名称*/
  var animationEndEventName = !canUseAnimate ? null : function prefixAnimationEndEvent() {
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
  }();

  var play = function (stage, selector) {
    stage.find(selector).each(function() {
      var $this = $(this);

      canUseAnimate && $this.addClass($this.data("animation"));
      $this.show();
    });
  };

  var gotoStage2 = function(needAnimation) {
    $stage2.show();
    if (canUseAnimate) {
      $getIt.removeClass($getIt.data("animation1"));
    }
    if (needAnimation) {
      play($stage2, ".js-has-animation");
    } else {
      $stage2.find(".js-has-animation").show();
    }
    $stage1.animate({marginTop: -1000}, 1000);
  };

  var requestCoupon = function() {
    if ($getIt.data("processing") === true) {
      return;
    }
    $getIt.data("processing", true); // 标记，避免多次提交

    $.ajax({
      url: "data/test.json",
      type: "GET",
      dataType: "json"
    }).done(function(json) {
      $getIt.data("processing", false);
      if (json.status === 1) {
        setCoupon(json);
        $("#js_couponContent").show();
        $("#js_couponError").hide();
        gotoStage2(true);
      } else if (json.status === 2) {
        $("#js_couponContent").hide();
        $("#js_couponError").show();
        gotoStage2(false);
      } else {
        MY.alert({msg : json.msg});
      }
    }).fail(function() {
      $getIt.data("processing", false);
      MY.alert({msg : "Please try again!"});
    });
    gotoStage2();
  };

  var setCoupon = function(coupon) {
    var page = coupon.type === 1 ? "m-users-a-coupon.htm" : "m-users-a-points_record.htm";
    $("#js_couponDesc").text(coupon.desc || "");
    $("#js_couponValue").text(coupon.value || "");
    $("#js_couponTips").html(coupon.tips || "");
    $("#js_goshopping").prop("href", "#");
  }

  var $stage1 = $("#js_stage1"),
    $stage2 = $("#js_stage2"),
    $getIt = $("#js_getIt");
  /*$htmlAndBody = $("html, body")*/

  (new Image()).src = "images/stage1/bigeggopen.png"; // 图片预加载

  play($stage1, ".js-has-animation");

  if (animationEndEventName) {
//            $("#js_lastEgg").one(animationEndEventName, function() {
//                $htmlAndBody.animate({scrollTop: ($(document).height() - 400) + "px"}, 400);
//            });

    $getIt.one(animationEndEventName, function() {
      $getIt.removeClass($getIt.data("animation")).addClass($getIt.data("animation1"));
      play($stage1, ".js-leaf");
    });
  }


  $getIt.on("click", function() {
    $getIt.addClass("open");
    requestCoupon();
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
}(window, document, jQuery);
