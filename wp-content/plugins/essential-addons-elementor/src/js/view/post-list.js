var postListHandler = function ($scope, $) {
    // category
    eael.getToken();
    let $post_cat_wrap = $('.post-categories', $scope),
        $scroll_on_pagination = parseInt( $post_cat_wrap.data('scroll-on-pagination') ),
        $scroll_on_pagination_offset = parseInt( $post_cat_wrap.data('scroll-offset') );
    
    $post_cat_wrap.on('click', 'a', function (e) {
        e.preventDefault();
        let $this = $(this);
        // tab class
        $('.post-categories a', $scope).removeClass('active');
        $this.addClass('active');
        // collect props
        const $class = $post_cat_wrap.data('class'),
            $widget_id = $post_cat_wrap.data("widget"),
            $page_id = $post_cat_wrap.data("page-id"),
            $args = $post_cat_wrap.data('args'),
            $settings = $post_cat_wrap.data('settings'),
            $page = 1,
            $template_info = $post_cat_wrap.data('template'),
            $taxonomy = {
                taxonomy: $('.post-categories a.active', $scope).data('taxonomy'),
                field: 'term_id',
                terms: $('.post-categories a.active', $scope).data('id')
            };

        // ajax
        $.ajax({
            url: localize.ajaxurl,
            type: 'POST',
            data: {
                action: 'load_more',
                class: $class,
                args: $args,
                taxonomy: $taxonomy,
                settings: $settings,
                template_info: $template_info,
                page: $page,
                page_id: $page_id,
                widget_id: $widget_id,
                nonce: localize.nonce
            },
            success: function (response) {
                var $content = $(response);

                if ($content.hasClass('no-posts-found') || $content.length == 0) {
                    $('.eael-post-appender', $scope).empty().append($content);

                    // update nav
                    $('.btn-prev-post', $scope).prop('disabled', true);
                    $('.btn-next-post', $scope).prop('disabled', true);
                } else {
                    $('.eael-post-appender', $scope)
                        .empty()
                        .append($content);

                    // update page
                    $('.post-list-pagination', $scope).data('page', 1);

                    // update nav
                    $('.btn-prev-post', $scope).prop('disabled', true);
                    $('.btn-next-post', $scope).prop('disabled', false);
                }
            },
            error: function (response) {
                console.error(response);
            }
        });
    });

    // Shared AJAX function for pagination requests
    function makePostListAjaxRequest(options) {
        const {
            $wrapper,
            $target_page,
            $widget_id,
            $page_id,
            $class,
            $args,
            $settings,
            $template_info,
            $taxonomy,
            paginationType = 'navigation', // 'navigation' or 'page-numbers'
            $clickedElement = null
        } = options;

        $.ajax({
            url: localize.ajaxurl,
            type: 'post',
            data: {
                action: 'load_more',
                class: $class,
                args: $args,
                taxonomy: $taxonomy,
                settings: $settings,
                page: $target_page,
                template_info: $template_info,
                page_id: $page_id,
                widget_id: $widget_id,
                nonce: localize.nonce
            },
            success: function (response) {
                var $content = $(response);
                if ($content.hasClass('no-posts-found') || $content.length == 0) {
                    // do nothing
                } else {
                    $('.eael-post-appender', $scope)
                        .empty()
                        .append($content);

                    // Handle pagination-specific updates
                    if (paginationType === 'navigation') {
                        // Navigation pagination updates
                        if ($target_page == 1 && $clickedElement && $clickedElement.hasClass("btn-prev-post")) {
                            $clickedElement.prop('disabled', true);
                        } else {
                            $('.post-list-pagination button', $scope).prop('disabled', false);
                        }
                        $wrapper.data('page', $target_page);
                    } else if (paginationType === 'page-numbers') {
                        // Page number pagination updates
                        // Update current page
                        $wrapper.find('.current').removeClass('current');
                        $wrapper.find(`[data-page="${$target_page}"]`).addClass('current');
                        $wrapper.data('page', $target_page);
                        // Update pagination visibility
                        let $is_collapsed = $wrapper.data('pagination-mode') === 'collapsed';
                        $is_collapsed && collapsePagination();
                    }
                }

                // Handle post-update cleanup for page numbers
                if (paginationType === 'page-numbers') {
                    $wrapper.find('span.page-numbers').removeClass('loading');
                }

                // Handle scroll behavior (common for both types)
                if ( $scroll_on_pagination && $('.eael-post-appender', $scope).length > 0) {
                    let $post_list_container = $('.eael-post-list-container', $scope);

                    if ( ! isElementInViewport( $post_list_container ) ) {
                        $('html, body').animate({
                            scrollTop: $post_list_container.offset().top - $scroll_on_pagination_offset
                        }, 500);
                    }
                }
            },
            error: function (response) {
                // Handle error cleanup for page numbers
                if (paginationType === 'page-numbers') {
                    $wrapper.find('span.page-numbers').removeClass('loading');
                }
            }
        });
    }

    // Page number pagination
    let $page_pagination_wrap = $('.eael-post-list-pagination', $scope);
    if( 'pagination' === $page_pagination_wrap.data('pagination-type') ){
        $('.eael-page-numbers .page-numbers:not(.dots)', $scope).on('click', function (e) {
            var $this = $(this),
                $widget_id = $page_pagination_wrap.data("widget"),
                $page_id = $page_pagination_wrap.data("page-id"),
                $class = $page_pagination_wrap.data('class'),
                $args = $page_pagination_wrap.data('args'),
                $settings = $page_pagination_wrap.data('settings'),
                $template_info = $page_pagination_wrap.data('template'),
                $current_page = parseInt($page_pagination_wrap.data('page')) || 1,
                $max_pages = parseInt($page_pagination_wrap.data('max-pages')) || 1,
                $target_page = $this.data('page'),
                $taxonomy = {
                    taxonomy: $('.post-categories a.active', $scope).data('taxonomy'),
                    field: 'term_id',
                    terms: $('.post-categories a.active', $scope).data('id')
                };

            // Handle page data - only numeric pages now
            if ($target_page) {
                $target_page = parseInt($target_page);
            } else {
                // Fallback: try to extract page number from text content
                var pageText = $this.text().trim();
                if (/^\d+$/.test(pageText)) {
                    $target_page = parseInt(pageText);
                } else {
                    console.error('Could not determine target page from:', pageText, 'data-page:', $this.data('page'));
                    return;
                }
            }

            // Validate target page
            if (isNaN($target_page) || $target_page < 1 || $target_page > $max_pages) {
                console.error('Invalid target page:', $target_page);
                return;
            }

            // Don't proceed if we're already on this page
            if ($target_page === $current_page) {
                return;
            }

            if (($taxonomy.taxonomy === '') || ($taxonomy.taxonomy === 'all') || ($taxonomy.taxonomy === 'undefined')) {
                $taxonomy.taxonomy = 'all';
            }

            // Disable all pagination links during request
            $('.eael-page-numbers .page-numbers', $scope).addClass('loading');

            // Use shared AJAX function
            makePostListAjaxRequest({
                $wrapper: $page_pagination_wrap,
                $target_page: $target_page,
                $widget_id: $widget_id,
                $page_id: $page_id,
                $class: $class,
                $args: $args,
                $settings: $settings,
                $template_info: $template_info,
                $taxonomy: $taxonomy,
                paginationType: 'page-numbers',
                $clickedElement: $this
            });
        });
    } else {
          // Navigation pagination (prev/next buttons)
        let $pagination_wrap = $('.post-list-pagination', $scope);
        $pagination_wrap.on('click', 'button', function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            var $this = $(this),
                $widget_id = $pagination_wrap.data("widget"),
                $page_id = $pagination_wrap.data("page-id"),
                $class = $pagination_wrap.data('class'),
                $args = $pagination_wrap.data('args'),
                $settings = $pagination_wrap.data('settings'),
                $page = $this.hasClass('btn-prev-post')
                    ? parseInt($pagination_wrap.data('page')) - 1
                    : parseInt($pagination_wrap.data('page')) + 1,
                $template_info = $pagination_wrap.data('template'),
                $taxonomy = {
                    taxonomy: $('.post-categories a.active', $scope).data('taxonomy'),
                    field: 'term_id',
                    terms: $('.post-categories a.active', $scope).data('id')
                };

            if (($taxonomy.taxonomy === '') || ($taxonomy.taxonomy === 'all') || ($taxonomy.taxonomy === 'undefined')) {
                $taxonomy.taxonomy = 'all';
            }

            if ($page == 1 && $this.hasClass("btn-prev-post")) {
                $this.prop('disabled', true);
            }
            $this.prop('disabled', true);

            if ($page <= 0) {
                return;
            }

            // Use shared AJAX function
            makePostListAjaxRequest({
                $wrapper: $pagination_wrap,
                $target_page: $page,
                $widget_id: $widget_id,
                $page_id: $page_id,
                $class: $class,
                $args: $args,
                $settings: $settings,
                $template_info: $template_info,
                $taxonomy: $taxonomy,
                paginationType: 'navigation',
                $clickedElement: $this
            });
        });
    }

    function isElementInViewport (el) {
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }

        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
        );
    }

    function collapsePagination() {
        const $wrapper = $('.eael-post-list-pagination', $scope);
        const items = $(".eael-page-numbers .page-numbers:not(.dots)", $wrapper);
        const total = items.length;
        const current = Number($wrapper.find(".page-numbers .current").data("page"));
        const max = 10;

        // Reset everything
        items.show();
        $wrapper.find(".page-numbers .dots").remove();

        // If total <= max, nothing to collapse
        if (total <= max) return;

        // Always show first + last
        const first = 1;
        const last = total;

        // Available slots for numeric pages after first/last + dots
        const innerSlots = max - 4; // first, last, two dots

        let start = current - Math.floor(innerSlots / 2);
        let end   = current + Math.floor(innerSlots / 2);

        if (start < 2) {
            start = 2;
            end = start + innerSlots - 1;
        }
        if (end > last - 1) {
            end = last - 1;
            start = end - innerSlots + 1;
            if (start < 2) start = 2;
        }

        // Hide outside range
        items.each(function(){
            const page = Number($(this).data("page"));
            if (page === first || page === last) return;

            if (page < start || page > end) {
                $(this).hide();
            }
        });

        // Insert left dots if needed
        if (start > 2) {
            $(`<span class="page-numbers dots dots-1">...</span>`)
                .insertAfter($(`.page-numbers [data-page="${first}"]`, $wrapper));
        }

        // Insert right dots if needed
        if (end < last - 1) {
            $(`<span class="page-numbers dots dots-2">...</span>`)
                .insertBefore($(`.page-numbers [data-page="${last}"]`, $wrapper));
        }
    }

    // Responsive layout handler for dynamic breakpoint support
    function handleResponsiveLayout() {
        const $postCategories = $('.post-categories', $scope);
        if (!$postCategories.length) return;

        const breakpointData = $postCategories.data('breakpoints');
        const layoutSettings = $postCategories.data('layout-settings');

        if (!breakpointData || !layoutSettings) {
            return;
        }

        const currentWidth = window.innerWidth;
        let activeLayout = layoutSettings.desktop || 'horizontal'; // default to desktop layout

        // Separate min-width and max-width breakpoints for proper handling
        const minWidthBreakpoints = [];
        const maxWidthBreakpoints = [];

        Object.keys(breakpointData).forEach(key => {
            const breakpoint = breakpointData[key];
            if (breakpoint.direction === 'min') {
                minWidthBreakpoints.push({key, ...breakpoint});
            } else {
                maxWidthBreakpoints.push({key, ...breakpoint});
            }
        });

        // Sort min-width breakpoints in descending order (largest first)
        minWidthBreakpoints.sort((a, b) => b.value - a.value);

        // Sort max-width breakpoints in ascending order (smallest first)
        maxWidthBreakpoints.sort((a, b) => a.value - b.value);

        // Check min-width breakpoints first (desktop, widescreen)
        for (const breakpoint of minWidthBreakpoints) {
            if (currentWidth >= breakpoint.value && layoutSettings[breakpoint.key]) {
                activeLayout = layoutSettings[breakpoint.key];
                break;
            }
        }

        // Check max-width breakpoints (tablet, mobile) - these override min-width if they match
        for (const breakpoint of maxWidthBreakpoints) {
            if (currentWidth <= breakpoint.value && layoutSettings[breakpoint.key]) {
                activeLayout = layoutSettings[breakpoint.key];
                break;
            }
        }

        // Remove all layout classes and add the active one
        $postCategories.removeClass('eael-categories-layout-horizontal eael-categories-layout-vertical');
        $postCategories.addClass('eael-categories-layout-' + activeLayout);
    }

    // Initialize responsive layout on load
    handleResponsiveLayout();

    // Handle window resize for real-time responsiveness
    $(window).on('resize.eael-post-list-' + $scope.data('id'), function() {
        handleResponsiveLayout();
    });

    // Cleanup on scope destroy
    $scope.on('remove', function() {
        $(window).off('resize.eael-post-list-' + $scope.data('id'));
    });
};

jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/eael-post-list.default', postListHandler);
});
