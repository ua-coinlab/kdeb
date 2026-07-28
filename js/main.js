// Shared behavior across all pages: mobile nav, scroll reveal, animated stat counters.

document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  var here = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[data-page]").forEach(function (a) {
    if (a.getAttribute("data-page") === here) {
      a.classList.add("active");
    }
  });

  // Scroll-position based reveal: simpler and more predictable across
  // browsers than IntersectionObserver, and runs an immediate check on
  // load so above-the-fold content never sits invisible waiting on a
  // scroll event.
  var revealTargets = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));

  function isInViewport(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.92 && rect.bottom > 0;
  }

  function checkReveal() {
    revealTargets = revealTargets.filter(function (el) {
      if (isInViewport(el)) {
        el.classList.add("in-view");
        return false;
      }
      return true;
    });
    counters = counters.filter(function (el) {
      if (isInViewport(el)) {
        animateCounter(el);
        return false;
      }
      return true;
    });
    if (!revealTargets.length && !counters.length) {
      window.removeEventListener("scroll", checkReveal);
      window.removeEventListener("resize", checkReveal);
    }
  }

  checkReveal();
  window.addEventListener("scroll", checkReveal, { passive: true });
  window.addEventListener("resize", checkReveal);

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = performance.now();

    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value.toLocaleString("en-US") + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  }

  var yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
