(function(window, $) {
  var canUseAnimate = isSupportAnimate(),
    $stageOne = $("#js_stage1"),
    $stageTwo = $("#js_stage2"),
    $openIt = $("#js_getIt"),
    snow;

  $openIt.on("click", function() {
    var $arrow = $openIt.children(".arrow");

    $arrow.removeClass($arrow.data("animation"));
    $openIt.removeClass($openIt.data("animation"))
      .addClass($openIt.data("animation1"));

    requestCoupon();
  });
  requestCoupon();

  canUseAnimate && play($stageOne);

  // -------------------- 雪花 {
  // if(!/MSIE 6|MSIE 7|MSIE 8/.test(navigator.userAgent)){
  //   snow = new snowFall({maxFlake :100,fallSpeed :1,flakeSize: 6});
  //   snow.start();
  //
  //   if(/MSIE 9|MSIE 10/.test(navigator.userAgent)){
  //     $(document).click(function(event){
  //       if(event.target.id == 'snowfall'){
  //         $('#snowfall').fadeOut(function(){
  //           snow.stop();
  //         })
  //       }
  //     })
  //   }
  // }

  // -------------------- 雪花 }


  // 函数声明
  function play($stage) {
    $stage.find(".has-animation").each(function() {
      var $this = $(this);
      $this.addClass($this.data("animation")).show();
    });
  }

  function requestCoupon() {
    if ($openIt.data("processing") === true) {
      return;
    }
    $openIt.data("processing", true); // 标记，避免多次提交

    $.ajax({
      //url: "{/literal}{$imgcache_url}{literal}images/pageimg/special/christmas2015/data/gift.json",
      url: "/fun/index.php?act=christmas",
      type: "POST",
      dataType: "json"
    }).done(function(json) {
      $openIt.data("processing", false);
      $openIt.removeClass($openIt.data("animation1"));
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
        GLOBAL.PopObj.alert({msg : json.msg});
      }
    }).fail(function() {
      $openIt.data("processing", false);
      $openIt.removeClass($openIt.data("animation1"));
      GLOBAL.PopObj.alert({msg : "Please try again!"});
    });
  }

  function setCoupon(coupon) {
    $("#js_couponDesc").text(coupon.desc || "");
    $("#js_couponValue").text(coupon.value || "");
    $("#js_couponTips").text(coupon.tips || "");
    $("#js_goshopping").prop("href", "#");
  }

  function gotoStage2(needAnimation) {
    // snow && snow.stop(); // 第二幕不需要雪花
    $stageTwo.show();
    if (canUseAnimate) {
      !needAnimation && $("#js_couponContent").parent().removeClass("has-animation");
      play($stageTwo);
    }
    $stageOne.animate({marginTop: -1000}, 1000);
  }

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
})(window, jQuery);
