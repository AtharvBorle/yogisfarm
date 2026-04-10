$(function () {
    'use strict';
    $('body').on('click', '.referesh-captcha', function (e) {
        if ($.isFunction(window.regenerate_captcha)) {
            regenerate_captcha();
        }
    });
    $(window).on("load", function () {
        $("#modalOnLoadSec").delay(450).fadeOut("slow");
        $("body").delay(450).css({
            overflow: "visible"
        });
        if ($("#homePageDefaultModal").length) {
            $("#homePageDefaultModal").modal("show");
        }
    });
    $('body').on('click', '.btn-add-to-cart', function (e) {
        var id = $(this).data('id');
        var data = [];
        data.push({ name: 'action', value: 'add_to_cart', id: id }, { name: 'id', value: id });
        $.ajax({
            type: "POST",
            url: api_url,
            data: data,
            cache: false,
            async: true,
            beforeSend: function () {
                $('.home-add-cart-' + id).html('<i class="fi-rs-spinner-alt"></i>');
                $('.home-add-cart-' + id).attr("disabled", "disabled");
            },
            success: function (data) {
                if ($(".btn-cart-count").length) {
                    $(".btn-cart-count").each(function () {
                        $(this).html(data.cart_count);
                    });
                }
                if ($(".cart-main").length) {
                    $(".cart-main").html(data.cart_main);
                }
                if ($(".cart-mini").length) {
                    $(".cart-mini").html(data.cart_mini);
                }
                showToast('cart', 'Item has been added to cart list', 'success', {
                    autohide: true,
                    delay: 3000
                });
            },
            complete: function (jqXHR, textStatus) {
                $('.home-add-cart-' + id).prop('disabled', false).html('<i class="fi-rs-shopping-cart mr-5"></i>Add');
            }
        });
    });
    $('body').on('click', '.btn-remove-from-cart', function (e) {
        var id = $(this).data('id');
        var data = [];
        data.push({ name: 'action', value: 'remove_from_cart', id: id }, { name: 'id', value: id });
        $.ajax({
            type: "POST",
            url: api_url,
            data: data,
            success: function (data) {
                showToast('cart', 'Item has been remove from cart list', 'danger', {
                    autohide: true,
                    delay: 1500
                });
                if ($(".btn-cart-count").length) {
                    $(".btn-cart-count").each(function () {
                        $(this).html(data.cart_count);
                    });
                }
                if ($(".cart-main").length) {
                    $(".cart-main").html(data.cart_main);
                }
                if ($(".cart-mini").length) {
                    $(".cart-mini").html(data.cart_mini);
                }
                location.reload();

            }
        });
    });
    $('body').on('click', '.btn-add-to-compare', function (e) {
        var id = $(this).data('id');
        var data = [];
        data.push({ name: 'action', value: 'add_to_compare', id: id }, { name: 'id', value: id });
        $.ajax({
            type: "POST",
            url: api_url,
            data: data,
            success: function (data) {
                if ($(".btn-compare-count").length) {
                    $(".btn-compare-count").each(function () {
                        $(this).html(data.compare_count);
                    });
                }
                showToast('compare', 'Item has been added to compare list', 'success', {
                    autohide: true,
                    delay: 3000
                });
            }
        });
    });
    $('body').on('click', '.btn-add-to-wishlist', function (e) {
        if (user_id != '') {
            var id = $(this).data('id');
            var data = [];
            data.push({ name: 'action', value: 'add_to_wishlist', id: id }, { name: 'id', value: id })
            $.ajax({
                type: "POST",
                url: api_url,
                data: data,
                success: function (data) {
                    if ($(".btn-wishlist-count").length) {
                        $(".btn-wishlist-count").each(function () {
                            $(this).html(data.wishlist_count);
                        });
                    }
                    if ($(".wishlist-" + id).length) {
                        $(".wishlist-" + id).each(function () {
                            $(this).removeClass('btn-add-to-wishlist').addClass('btn-remove-from-wishlist').html('<i class="fi-rs-heart"></i>');
                        });
                    }
                    showToast('wishlist', 'Item has been added to wishlist...!', 'success', {
                        autohide: true,
                        delay: 3000
                    });
                }
            });
        } else {
            showToast('warning', 'Please Login First..!', 'warning', {
                autohide: true,
                delay: 3000
            });
        }
    });
    $('body').on('click', '.btn-remove-from-wishlist', function (e) {
        var id = $(this).data('id');
        var data = [];
        data.push({ name: 'action', value: 'remove_from_wishlist', id: id }, { name: 'id', value: id });
        $.ajax({
            type: "POST",
            url: api_url,
            data: data,
            success: function (data) {

                showToast('wishlist', 'Item has been removed from wishlist...!', 'danger', {
                    autohide: true,
                    delay: 1500
                });
                if ($(".btn-wishlist-count").length) {
                    $(".btn-wishlist-count").each(function () {
                        $(this).html(data.wishlist_count);
                    });
                }
                if ($(".wishlist-" + id).length) {
                    $(".wishlist-" + id).each(function () {
                        $(this).removeClass('btn-remove-from-wishlist').addClass('btn-add-to-wishlist').html('<i class="fi-rs-heart"></i>');
                    });
                }
                location.reload();
            }
        });
    });
    $('body').on('click', '.btn-quick-view', function (e) {
        var id = $(this).data('id');
        var data = [];
        data.push({ name: 'action', value: 'quick_view', id: id }, { name: 'id', value: id });
        $.ajax({
            type: "POST",
            url: api_url,
            data: data,
            success: function (data) {
                if ($("#quickViewModal").length) {
                    $("#quickViewModal .modal-body").html(data);
                    $('#quickViewModal').modal('show');
                }
            }
        });
    });
    $('#quickViewModal').on('shown.bs.modal', function () {
        if ($('.product-image-slider').hasClass('slick-initialized')) {
            $('.product-image-slider').slick('destroy');
        }
        initProductDetails();
    });
    // $('body').on('click', '.referesh-captcha', function (e) {
    //     if ($.isFunction(window.regenerate_captcha)) {
    //         regenerate_captcha();
    //     }
    // });

    $('body').on('click', '.qty-down', function (e) {
        var thisd = $(this);
        var id = thisd.parent().find(".qty-val").data('id');
        var qty = thisd.parent().find(".qty-val").html();
        qty = parseInt(qty); qty--;
        if (qty >= 1) {
            var data = [];
            data.push({ name: 'action', value: 'update_cart', id: id }, { name: 'id', value: id }, { name: 'quantity', value: qty });
            $.ajax({
                type: "POST",
                url: api_url,
                data: data,
                success: function (data) {
                    thisd.parent().find(".qty-val").html(data.qty);
                    if ($("#pst" + id).length) { $("#pst" + id).html(data.amt); }
                    if ($("#cart-subtotal").length) { $("#cart-subtotal").html(data.total); }

                    if ($(".btn-cart-count").length) {
                        $(".btn-cart-count").each(function () {
                            $(this).html(data.cart_count);
                        });
                    }
                    if ($(".cart-main").length) {
                        $(".cart-main").html(data.cart_main);
                    }
                    if ($(".cart-mini").length) {
                        $(".cart-mini").html(data.cart_mini);
                    }
                }
            });
        }
    });

    $('body').on('click', '.qty-up', function (e) {
        var thisd = $(this);
        var id = thisd.parent().find(".qty-val").data('id');
        var qty = thisd.parent().find(".qty-val").html();
        qty = parseInt(qty); qty++;
        if (qty <= 100) {
            var data = [];
            data.push({ name: 'action', value: 'update_cart', id: id }, { name: 'id', value: id }, { name: 'quantity', value: qty });
            $.ajax({
                type: "POST",
                url: api_url,
                data: data,
                success: function (data) {
                    thisd.parent().find(".qty-val").html(data.qty);
                    if ($("#pst" + id).length) { $("#pst" + id).html(data.amt); }
                    if ($("#cart-subtotal").length) { $("#cart-subtotal").html(data.total); }

                    if ($(".btn-cart-count").length) {
                        $(".btn-cart-count").each(function () {
                            $(this).html(data.cart_count);
                        });
                    }
                    if ($(".cart-main").length) {
                        $(".cart-main").html(data.cart_main);
                    }
                    if ($(".cart-mini").length) {
                        $(".cart-mini").html(data.cart_mini);
                    }
                }
            });
        }
    });

    $('body').on('click', '.add-to-cart', function (e) {
        var qty = $(".qty-val").html();
        qty = parseInt(qty);
        if (qty >= 1) {
            var data = [];
            data.push({ name: 'action', value: 'add_to_cart', id: id }, { name: 'id', value: id }, { name: 'quantity', value: qty });
            $.ajax({
                type: "POST",
                url: api_url,
                data: data,
                success: function (data) {

                    if ($(".btn-cart-count").length) {
                        $(".btn-cart-count").each(function () {
                            $(this).html(data.cart_count);
                        });
                    }
                    if ($(".cart-main").length) {
                        $(".cart-main").html(data.cart_main);
                    }
                    if ($(".cart-mini").length) {
                        $(".cart-mini").html(data.cart_mini);
                    }
                    showToast('cart', 'Item has been added to cart list', 'success', {
                        autohide: true,
                        delay: 3000
                    });
                }
            });
        }
    });

    SetImageInput();
    function SetImageInput() {
        var fileCounter = 0;
        $(".app-image-input:not(.added-apim)").each(function () {
            try {
                fileCounter++;
                var mainObj = $(this);
                mainObj.addClass("added-apim");
                var on_change = mainObj.data("change");
                if (on_change) {
                    on_change = eval(on_change);
                }
                var has_delete = mainObj.data("delete");
                var imgObj = null
                var imgObjstr = mainObj.data("img-id");
                if (imgObjstr) {
                    imgObj = $(imgObjstr);
                } else {
                    imgObj = mainObj;
                }
                var inputname = mainObj.data("name");
                if (!inputname || inputname == "") {
                    inputname = "file_" + fileCounter;
                }
                var inputObj = $('<input type="file" name="' + inputname + '" style="display:none;" accept="image/*">');
                var delete_btn = null;
                if (has_delete) {
                    delete_btn = $('<button style="display:none;position: absolute;right: 16px;top: 6px;font-size: 9px;" class="btn btn-danger btn-xs"><fa class="fa-trash"></fa></button>');
                    delete_btn.click(function (e) {
                        e.preventDefault();
                        inputObj.val("");
                        var noimg = mainObj.data("date-noimage");
                        if (!noimg) {
                            noimg = uploads_url + "default.png";
                        }
                        mainObj.attr("src", noimg);
                        $(this).hide();
                        try {
                            if (typeof on_change == "function") {
                                on_change("");
                            }
                        } catch (e) { }
                    });
                    if (mainObj.data("show-delete")) {
                        delete_btn.show();
                    }
                    mainObj.after(delete_btn);
                }
                mainObj.on("click", function () {
                    inputObj.trigger('click');
                });
                inputObj.on("change", function (e) {
                    var fr = new FileReader();
                    /*when image is loaded, set the src of the image where you want to display it*/
                    fr.onload = function (e) {
                        imgObj.attr("src", this.result);
                        mainObj.after(inputObj);
                        try {
                            if (delete_btn) {
                                delete_btn.show();
                            }
                        } catch (e) { }
                        try {
                            gcl(on_change);
                            if (typeof on_change == "function") {
                                on_change(this.result);
                            }
                        } catch (e) { }
                    };
                    fr.readAsDataURL(this.files[0]);
                });
            } catch (e) {
                gcl(e.message);
            }
        });
    }


});
function on_beforesend(form) {
    //form.find(">.card").addClass("state-loading");
    form.addClass("state-loading");
}
function on_complete(form) {
    //form.find(">.card").removeClass("state-loading");
    form.removeClass("state-loading");
}
function show_notification(type, msg, title, icon = "times-circle-o", IsSticky = true) {
    /*if(type=='success'){
        icon="check-circle-o";
    }
    var options = {
        title: title,
        style: type,
        theme: 'right-bottom.css',
        timeout: 5000,
        message: msg,
        icon: icon,
        multiline: true
    };
    if (!IsSticky) {
        options.timeout = null;
    }
    var n = new notify(options);
    n.show();*/
}
function set_csrf_param(param) {
    /*var postValue = getCookie(csrf_ajax_cookie_name);
    if (postValue && postValue != "") {
        if (typeof param == "string") {
            if (param != "") {
                param += "&";
            }
            param += csrf_ajax_input_name + "=" + postValue;
        } else if (typeof param == "object") {
            try {
                if (typeof param.append === 'function') {
                    param.append(csrf_ajax_input_name, postValue);
                } else {
                  if(param.length==0){
                         param[csrf_ajax_input_name]=postValue;
                  }else{                    
                         param[csrf_ajax_input_name]=postValue;
                  }
                }
            } catch (e) {}

        }
    }*/
    return param;
}

$('.digit-control').each(function () {
    $(this).attr('maxlength', 1);
    $(this).on('keyup', function (e) {
        var next = '#' + $(this).data('next');
        var prev = '#' + $(this).data('previous');
        if (e.keyCode === 8 || e.keyCode === 37) {
            if (prev.length) {
                $(prev).select();
            }
        } else {
            if (next.length) {
                $(next).select();
            }
        }
    });
});

function initProductDetails() {
    $('.product-image-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        fade: false,
        asNavFor: '.slider-nav-thumbnails',
    });
    $('.slider-nav-thumbnails').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: '.product-image-slider',
        dots: false,
        focusOnSelect: true,
        prevArrow: '<button type="button" class="slick-prev"><i class="fi-rs-arrow-small-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next"><i class="fi-rs-arrow-small-right"></i></button>'
    });

    // Remove active class from all thumbnail slides
    $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');

    // Set active class to first thumbnail slides
    $('.slider-nav-thumbnails .slick-slide').eq(0).addClass('slick-active');

    // On before slide change match active thumbnail to current slide
    $('.product-image-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        var mySlideNumber = nextSlide;
        $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');
        $('.slider-nav-thumbnails .slick-slide').eq(mySlideNumber).addClass('slick-active');
    });

    $('.product-image-slider').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        var img = $(slick.$slides[nextSlide]).find("img");
        $('.zoomWindowContainer,.zoomContainer').remove();
        if ($(window).width() > 768) {
            $(img).elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 750
            });
        }
    });
    //Elevate Zoom
    if ($(".product-image-slider").length) {
        if ($(window).width() > 768) {
            $('.product-image-slider .slick-active img').elevateZoom({
                zoomType: "inner",
                cursor: "crosshair",
                zoomWindowFadeIn: 500,
                zoomWindowFadeOut: 750
            });
        }
    }
    //Filter color/Size
    $('.list-filter').each(function () {
        $(this).find('a').on('click', function (event) {
            event.preventDefault();
            $(this).parent().siblings().removeClass('active');
            $(this).parent().toggleClass('active');
            $(this).parents('.attr-detail').find('.current-size').text($(this).text());
            $(this).parents('.attr-detail').find('.current-color').text($(this).attr('data-color'));
        });
    });
    //Qty Up-Down
    $('.detail-qty').each(function () {
        var qtyval = parseInt($(this).find(".qty-val").val(), 10);

        $('.qty-up').on('click', function (event) {
            event.preventDefault();
            qtyval = qtyval + 1;
            $(this).prev().val(qtyval);
        });

        $(".qty-down").on("click", function (event) {
            event.preventDefault();
            qtyval = qtyval - 1;
            if (qtyval > 1) {
                $(this).next().val(qtyval);
            } else {
                qtyval = 1;
                $(this).next().val(qtyval);
            }
        });
    });

    $('.dropdown-menu .cart_list').on('click', function (event) {
        event.stopPropagation();
    });
};

initProductDetailsSlider();
function initProductDetailsSlider() {
    if ($('.product-image-slider-details').length) {
        $('.product-image-slider-details').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: false,
            asNavFor: '.slider-nav-thumbnails',
        });
        $('.slider-nav-thumbnails').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            asNavFor: '.product-image-slider-details',
            dots: false,
            focusOnSelect: true,
            prevArrow: '<button type="button" class="slick-prev"><i class="fi-rs-arrow-small-left"></i></button>',
            nextArrow: '<button type="button" class="slick-next"><i class="fi-rs-arrow-small-right"></i></button>'
        });

        // Remove active class from all thumbnail slides
        $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');

        // Set active class to first thumbnail slides
        $('.slider-nav-thumbnails .slick-slide').eq(0).addClass('slick-active');

        // On before slide change match active thumbnail to current slide
        $('.product-image-slider-details').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var mySlideNumber = nextSlide;
            $('.slider-nav-thumbnails .slick-slide').removeClass('slick-active');
            $('.slider-nav-thumbnails .slick-slide').eq(mySlideNumber).addClass('slick-active');
        });

        $('.product-image-slider-details').on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            var img = $(slick.$slides[nextSlide]).find("img");
            $('.zoomWindowContainer,.zoomContainer').remove();
            if ($(window).width() > 768) {
                $(img).elevateZoom({
                    zoomType: "inner",
                    cursor: "crosshair",
                    zoomWindowFadeIn: 500,
                    zoomWindowFadeOut: 750
                });
            }
        });
        //Elevate Zoom
        if ($(".product-image-slider-details").length) {
            if ($(window).width() > 768) {
                $('.product-image-slider-details .slick-active img').elevateZoom({
                    zoomType: "inner",
                    cursor: "crosshair",
                    zoomWindowFadeIn: 500,
                    zoomWindowFadeOut: 750
                });
            }
        }
        //Filter color/Size
        $('.list-filter').each(function () {
            $(this).find('a').on('click', function (event) {
                event.preventDefault();
                $(this).parent().siblings().removeClass('active');
                $(this).parent().toggleClass('active');
                $(this).parents('.attr-detail').find('.current-size').text($(this).text());
                $(this).parents('.attr-detail').find('.current-color').text($(this).attr('data-color'));
            });
        });
        //Qty Up-Down
        $('.detail-qty').each(function () {
            var qtyval = parseInt($(this).find(".qty-val").val(), 10);

            $('.qty-up').on('click', function (event) {
                event.preventDefault();
                qtyval = qtyval + 1;
                $(this).prev().val(qtyval);
            });

            $(".qty-down").on("click", function (event) {
                event.preventDefault();
                qtyval = qtyval - 1;
                if (qtyval > 1) {
                    $(this).next().val(qtyval);
                } else {
                    qtyval = 1;
                    $(this).next().val(qtyval);
                }
            });
        });

        $('.dropdown-menu .cart_list').on('click', function (event) {
            event.stopPropagation();
        });
    }
};
// $window = $(window);
// $slick_slider = $('.slick-slider');
// settings = {
//   slidesToShow: 4,
//   slidesToScroll: 4,
//   responsive: [
//     {
//       breakpoint: 2000,
//       settings: {
//         infinite: true,
//       },
//     },
//     {
//       breakpoint: 1080,
//       settings: {
//         slidesToShow: 3,
//         slidesToScroll: 3,
//         infinite: true,
//       },
//     },
//     {
//       breakpoint: 800,
//       settings: {
//         slidesToShow: 2,
//         slidesToScroll: 2,
//         infinite: true,
//       },
//     },
//     {
//         breakpoint: 520,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1,
//           infinite: true,
//         },
//       },
//       {
//         breakpoint: 320,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1,
//           infinite: true,
//         },
//       },
//   ],
// };
// $slick_slider.slick(settings);

// $window.on('resize', function() {
//   if ($window.width() < 320) {
//     if ($slick_slider.hasClass('slick-initialized'))
//       $slick_slider.slick('unslick');
//     return
//   }
//   if ( ! $slick_slider.hasClass('slick-initialized'))
//     return $slick_slider.slick(settings);
// });  