(function () {
  var config = window.DOORSTEP_CONFIG || {};
  var stripe = config.stripe || {};

  var PRICING = {
    1: {
      plan6: {
        total: 450,
        compare: "$450 vs $500 single issue. Save $50 every issue, $300 over six months.",
        perSpot: null
      },
      single: { total: 500, meta: "Paid in full." }
    },
    2: {
      plan6: {
        total: 800,
        compare: "$800 vs $900. Save $100 every issue, $600 over six months.",
        perSpot: "$400/spot"
      },
      single: { total: 900, meta: "$450/spot, save $100. Paid in full." }
    }
  };

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function setText(selector, value) {
    if (value == null) return;
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  setText("[data-config='issueName']", config.issueName);
  setText("[data-config='spaceDeadline']", config.spaceDeadline);

  var phone = (config.phone || "").trim();
  var phoneDisplay = (config.phoneDisplay || phone).trim();
  var email = (config.email || "").trim();
  var phoneDigits = phone.replace(/[^\d+]/g, "");

  document.querySelectorAll("[data-config='phone']").forEach(function (el) {
    if (!phone) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    if (el.tagName === "A") {
      el.href = "tel:" + phoneDigits;
      if (!el.dataset.keepLabel) el.textContent = phoneDisplay;
    } else {
      el.textContent = phoneDisplay;
    }
  });

  document.querySelectorAll("[data-config='email']").forEach(function (el) {
    if (!email) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    if (el.tagName === "A") {
      el.href = "mailto:" + email;
      if (!el.dataset.keepLabel) el.textContent = email;
    } else {
      el.textContent = email;
    }
  });

  function smsHref(spots, planKind) {
    var spotWord = spots === 1 ? "1 spot" : spots + " spots";
    var msg =
      "Hi, I'd like to reserve " +
      spotWord +
      " on the " +
      planKind +
      " for the Schaumburg Spotlight.";
    return "sms:" + phoneDigits + "?&body=" + encodeURIComponent(msg);
  }

  function setDisabledReserve(el) {
    el.classList.add("is-unavailable");
    el.setAttribute("aria-disabled", "true");
    el.removeAttribute("href");
    el.setAttribute("role", "button");
    el.tabIndex = -1;
    el.textContent = "Text us to reserve";
    el.title = "Add a phone number in config.js to enable";
  }

  function setActiveLink(el, href, label) {
    el.classList.remove("is-unavailable");
    el.removeAttribute("aria-disabled");
    el.removeAttribute("role");
    el.removeAttribute("title");
    el.tabIndex = 0;
    el.href = href;
    el.rel = "noopener noreferrer";
    el.textContent = label;
  }

  function bindPayButton(el, key, payLabel, spots, planKind) {
    var url = (stripe[key] || "").trim();

    if (url) {
      setActiveLink(el, url, payLabel);
      return;
    }

    if (phoneDigits) {
      setActiveLink(el, smsHref(spots, planKind), "Text us to reserve");
      return;
    }

    setDisabledReserve(el);
  }

  function updatePricing(spots) {
    var row = PRICING[spots];
    if (!row) return;

    var plan6Btn = document.querySelector("[data-pay='plan6']");
    var singleBtn = document.querySelector("[data-pay='single']");
    var plan6Price = document.querySelector("[data-price='plan6']");
    var plan6Compare = document.querySelector("[data-compare='plan6']");
    var plan6PerSpot = document.querySelector("[data-perspot='plan6']");
    var singlePrice = document.querySelector("[data-price='single']");
    var singleMeta = document.querySelector("[data-meta='single']");
    var spotLabels = document.querySelectorAll("[data-spots-label]");

    spotLabels.forEach(function (el) {
      el.textContent =
        spots === 1 ? "1 spot" : "2 spots, double size ad";
    });

    if (plan6Price) {
      plan6Price.innerHTML =
        money(row.plan6.total) +
        '<span class="price-unit">/issue</span>';
    }
    if (plan6Compare) {
      plan6Compare.textContent = row.plan6.compare;
    }
    if (plan6PerSpot) {
      if (row.plan6.perSpot) {
        plan6PerSpot.hidden = false;
        plan6PerSpot.textContent = row.plan6.perSpot;
      } else {
        plan6PerSpot.hidden = true;
        plan6PerSpot.textContent = "";
      }
    }
    if (singlePrice) {
      singlePrice.textContent = money(row.single.total);
    }
    if (singleMeta) {
      singleMeta.textContent = row.single.meta;
    }

    if (plan6Btn) {
      bindPayButton(
        plan6Btn,
        "plan6_" + spots,
        spots === 1
          ? "Lock 1 spot for 6 months"
          : "Lock 2 spots for 6 months",
        spots,
        "six month plan"
      );
    }
    if (singleBtn) {
      bindPayButton(
        singleBtn,
        "single_" + spots,
        spots === 1 ? "Pay for 1 spot" : "Pay for 2 spots",
        spots,
        "single issue"
      );
    }

    document.querySelectorAll(".spot-picker [data-spots]").forEach(function (btn) {
      var active = Number(btn.getAttribute("data-spots")) === spots;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-checked", active ? "true" : "false");
    });
  }

  var picker = document.querySelector(".spot-picker");
  if (picker) {
    picker.querySelectorAll("[data-spots]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        updatePricing(Number(btn.getAttribute("data-spots")));
      });
    });
    updatePricing(1);
  }

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;

    btn.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    });
  });

  /* Sticky pay: only after hero CTA scrolls past; hide when pricing is in view */
  var stickyPay = document.querySelector(".sticky-pay");
  var heroJump = document.querySelector(".jump");
  var plansSection = document.querySelector("#plans");
  if (
    stickyPay &&
    heroJump &&
    plansSection &&
    "IntersectionObserver" in window
  ) {
    var jumpScrolledPast = false;
    var plansInView = false;

    function syncStickyPay() {
      var show = jumpScrolledPast && !plansInView;
      stickyPay.classList.toggle("is-visible", show);
      stickyPay.setAttribute("aria-hidden", show ? "false" : "true");
    }

    var jumpIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          /* Past = not intersecting and above the viewport (already scrolled through) */
          jumpScrolledPast =
            !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
        });
        syncStickyPay();
      },
      { threshold: 0, rootMargin: "0px" }
    );

    var plansIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          plansInView = entry.isIntersecting;
        });
        syncStickyPay();
      },
      { threshold: 0.12, rootMargin: "0px" }
    );

    jumpIo.observe(heroJump);
    plansIo.observe(plansSection);
    syncStickyPay();
  }

  /* Sample card lightbox */
  var lightbox = document.getElementById("card-lightbox");
  var lightboxImg = lightbox && lightbox.querySelector(".lightbox__img");
  var lightboxTriggers = document.querySelectorAll("[data-lightbox]");
  var lightboxLastFocus = null;

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
    }
    if (lightboxLastFocus && typeof lightboxLastFocus.focus === "function") {
      lightboxLastFocus.focus();
    }
  }

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxLastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Sample card";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = lightbox.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus();
  }

  lightboxTriggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = btn.getAttribute("data-lightbox");
      var img = btn.querySelector("img");
      openLightbox(src, img ? img.getAttribute("alt") : "");
    });
  });

  if (lightbox) {
    lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !reveals.length) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach(function (el) {
    io.observe(el);
  });
})();
