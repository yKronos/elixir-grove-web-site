(function($){
    "use strict";

    $(".canvas_open").on("click", function() {
        $(".off_canvas_menu_wrapper, .off_canvas_overlay").addClass("active");
    });

    $(".canvas_close, .off_canvas_overlay").on("click", function() {
        $(".off_canvas_menu_wrapper, .off_canvas_overlay").removeClass("active");
    });

    var $offcanvasNav = $(".offcanvas_main_menu"),
    $offcanvasNavSubMenu = $offcanvasNav.find(".sub-menu");
    $offcanvasNavSubMenu.parent().prepend(
        '<span class="menu-expand"><i class="fa fa-angle-down"></span>'
    );

    $offcanvasNavSubMenu.slideUp();

    $offcanvasNav.on("click", "li a, li .menu-expand", function (e){
        var $this = $(this);
        if (
            $this.parent().attr("class").match(/\b(menu-item-category-has-children|has-children|has-sub-menu)\b/) && ($this.attr("href") === "#" || $this.hasClass("menu-expand"))
        ) {
            e.preventDefault();
            if($this.siblings("ul:visible").length) {
                $this.siblings("ul").slideUp("slow");
            } else {
                $this.closest("li").siblings("li").find("ul:visible").slideUp("slow");
                $this.siblings("ul").slideDown("slow");
            }
        }

        if (
            $this.is("a") ||
            $this.is("span") ||
            $this.attr("class").match(/\b(menu-expand)\b/)
        ) {
            $this.parent().toggleClass("menu-open");
        } else if (
            $this.is("li") &&
            $this.attr("class").match(/\b(menu-items-category-has-children)\b/)
        ) {
            $this.toggleClass("menu-open");
        }
    });

    $(".search_box > a").on("click", function (){
        $(this).toggleClass("active");
        $(".search_widget").slideToggle("medium");
    });

    $(".mini_cart_wrapper > a").on("click", function (){
        if($(window).width() < 991) {
            $(".mini_cart").slideToggle("medium");
        }
    });

    $(window).on("scroll", function(){
        var scroll = $(window).scrollTop();
        if(scroll < 100) {
            $(".sticky-header").removeClass("sticky");
        } else {
            $(".sticky-header").addClass("sticky");
        }
    });

    function dataBackgroundImage() {
        $("[data-bgimg]").each(function () {
            var bgImgUrl = $(this).data("bgimg");
            $(this).css({
                "background-image": "url(" + bgImgUrl + ")",
            });
        });
    }

    $(window).on("load", function () {
        dataBackgroundImage();
    });

    $(".slider_area").owlCarousel({
        animateOut: "fadeOut",
        autoplay: true,
        loop: true,
        nav: true,
        autoplayTimeout: 5000,
        items: 1,
        dots: false,
        navText: [
            '<i class="fa fa-arrow-left"></i>',
            '<i class="fa fa-arrow-right"></i>',
        ],
    });
})(jQuery);
