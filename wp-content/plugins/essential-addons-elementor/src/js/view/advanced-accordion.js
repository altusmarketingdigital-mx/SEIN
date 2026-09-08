var advancedAccordion = function ($scope, $) {
   // Scope all queries
   const scopeEl = $scope[0];
   if (!scopeEl) return;

   // Set duration
   scopeEl.querySelectorAll("[data-duration]").forEach((el) => {
      const duration = el.getAttribute("data-duration");
      el.style.setProperty("--accordion-duration", duration + "s");
   });

   const featureButtons = scopeEl.querySelectorAll(
      ".eael-accordion_media-list"
   );
   const viewerImages = scopeEl.querySelectorAll(".eael-accordion_media-image");

   let currentFeature = 0;

   function updateFeature(index) {
      if (index === currentFeature) {
         return;
      }

      const oldButton = featureButtons[currentFeature];
      oldButton.classList.remove("active");

      const oldDescription = oldButton.querySelector(
         ".eael-accordion_media-description"
      );

      oldDescription.style.height = oldDescription.scrollHeight + "px";
      oldDescription.offsetHeight;
      oldDescription.style.height = "0";

      const newButton = featureButtons[index];
      newButton.classList.add("active");

      const newDescription = newButton.querySelector(
         ".eael-accordion_media-description"
      );

      newDescription.style.visibility = "hidden";
      newDescription.style.height = "auto";
      const fullHeight = newDescription.scrollHeight + "px";
      newDescription.style.height = "0";
      newDescription.style.visibility = "visible";

      requestAnimationFrame(() => {
         newDescription.style.height = fullHeight;
      });

      viewerImages.forEach((img) => img.classList.remove("active"));
      viewerImages[index].classList.add("active");

      currentFeature = index;
   }

   featureButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
         updateFeature(index);
      });
   });

   function openFirstItem() {
      const firstBtn = featureButtons[0];
      if (firstBtn && firstBtn.classList.contains("active")) {
         const desc = firstBtn.querySelector(
            ".eael-accordion_media-description"
         );

         desc.style.visibility = "hidden";
         desc.style.height = "auto";

         // Use double requestAnimationFrame for Firefox compatibility
         // This ensures the layout is fully calculated before reading scrollHeight
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               const fullHeight = desc.scrollHeight + "px";
               desc.style.height = "0";
               desc.style.visibility = "visible";

               requestAnimationFrame(() => {
                  desc.style.height = fullHeight;
               });
            });
         });
      }
   }

   //Elementor Editor
   if (window.location.href.includes("elementor")) {
      openFirstItem();
      // setTimeout(() => {
      //    openFirstItem();
      // }, 500);
   }

   // Use both DOMContentLoaded and load for better cross-browser compatibility
   if (document.readyState === "loading") {
      window.addEventListener("load", () => {
         openFirstItem();
      });
   } else {
      // DOM is already loaded, call immediately with a delay for Firefox
      setTimeout(() => {
         openFirstItem();
      }, 0);
   }
};

jQuery(window).on("elementor/frontend/init", function () {
   if (eael.elementStatusCheck("advancedAccordion")) {
      return false;
   }

   elementorFrontend.hooks.addAction(
      "frontend/element_ready/eael-adv-accordion.default",
      advancedAccordion
   );
});
