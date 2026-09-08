var DynamicFilterableGallery = function ($scope, $) {
   var $gallery = $(".eael-filter-gallery-container", $scope),
      $settings = $gallery.data("settings"),
      $layout_mode = $settings.layout_mode === "masonry" ? "masonry" : "fitRows";

   var $isotope_gallery = $gallery.isotope({
      itemSelector: ".dynamic-gallery-item",
      layoutMode: $layout_mode,
      percentPosition: true,
      stagger: 30,
      transitionDuration: $settings.duration + "ms",
   });

   let height = parseFloat($isotope_gallery.css('height'));
   setTimeout(function(){
         if (height < 5 ) {
         $isotope_gallery.css('height', 'auto');
      }
   }, 300);


   $isotope_gallery.imagesLoaded().progress(function () {
      $isotope_gallery.isotope("layout");
   });

   $(".dynamic-gallery-item", $gallery).resize(function () {
      $isotope_gallery.isotope("layout");
   });

   // Only add filter controls if has_filter is true
   if ($settings?.has_filter) {
      $scope.on("click", ".control", function (e) {
         e.preventDefault();

         var $this = $(this),
            filterValue = $this.data("filter");

         $this.siblings().removeClass("active");
         $this.addClass("active");

         if ($this.data("initial-load") === undefined && filterValue !== "*") {
            $this
               .closest(".eael-filter-gallery-wrapper")
               .find("button.eael-load-more-button")
               .trigger("click");
            $this.data("initial-load", "loaded");
         }

         $isotope_gallery.isotope({
            filter: filterValue,
         });

         if ($this.hasClass("no-more-posts")) {
            $this
               .closest(".eael-filter-gallery-wrapper")
               .find(".eael-load-more-button")
               .addClass("hide");
         } else {
            $this
               .closest(".eael-filter-gallery-wrapper")
               .find(".eael-load-more-button")
               .removeClass("hide");
         }
      });
   }

};

jQuery(window).on("elementor/frontend/init", function () {
   elementorFrontend.hooks.addAction(
      "frontend/element_ready/eael-dynamic-filterable-gallery.default",
      DynamicFilterableGallery
   );
});
