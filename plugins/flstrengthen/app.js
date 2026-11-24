(function () {
  "use strict";

  var pages = Array.prototype.slice.call(document.querySelectorAll(".wiki-page"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var searchInput = document.getElementById("search-input");
  var searchResults = document.getElementById("search-results");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("sidebar-scrim");
  var menuButton = document.getElementById("menu-button");
  var tocLinks = document.getElementById("toc-links");
  var copyButtons = Array.prototype.slice.call(document.querySelectorAll(".copy-button"));
  var tocObserver = null;
  var currentPageId = null;

  var pageIndex = pages.map(function (page) {
    return {
      id: page.id,
      title: page.getAttribute("data-title") || page.id,
      group: page.getAttribute("data-group") || "",
      page: page,
      text: normalize(page.textContent || "")
    };
  });
  var navOrder = navLinks.map(function (link) {
    return link.getAttribute("data-page");
  });
  pageIndex.sort(function (left, right) {
    return navOrder.indexOf(left.id) - navOrder.indexOf(right.id);
  });

  function normalize(value) {
    return value.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function findPage(id) {
    for (var i = 0; i < pages.length; i += 1) {
      if (pages[i].id === id) {
        return pages[i];
      }
    }
    return null;
  }

  function targetPage(hash) {
    var id = (hash || "").replace(/^#/, "");
    if (!id) {
      return { page: pages[0], anchor: null };
    }
    var direct = findPage(id);
    if (direct) {
      return { page: direct, anchor: null };
    }
    var element = document.getElementById(id);
    if (element) {
      var parent = element.closest(".wiki-page");
      if (parent) {
        return { page: parent, anchor: element };
      }
    }
    return { page: pages[0], anchor: null };
  }

  function navigate(hash, updateHistory) {
    var target = targetPage(hash);
    if (!target.page) {
      return;
    }
    pages.forEach(function (page) {
      page.hidden = page !== target.page;
    });
    navLinks.forEach(function (link) {
      var active = link.getAttribute("data-page") === target.page.id;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    currentPageId = target.page.id;
    document.title = target.page.getAttribute("data-title") + " | FlStrengthen";
    buildToc(target.page);
    closeMenu();
    hideSearch();
    if (updateHistory) {
      var next = "#" + target.page.id;
      if (window.location.hash !== next) {
        window.history.pushState(null, "", next);
      }
    }
    if (target.anchor) {
      window.setTimeout(function () {
        target.anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 20);
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function buildToc(page) {
    if (tocObserver) {
      tocObserver.disconnect();
    }
    tocLinks.innerHTML = "";
    var headings = Array.prototype.slice.call(page.querySelectorAll("h2[id]"));
    headings.forEach(function (heading) {
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      link.setAttribute("data-heading", heading.id);
      tocLinks.appendChild(link);
    });
    if (!("IntersectionObserver" in window)) {
      return;
    }
    tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        Array.prototype.forEach.call(tocLinks.children, function (link) {
          link.classList.toggle("is-active",
            link.getAttribute("data-heading") === entry.target.id);
        });
      });
    }, { rootMargin: "-90px 0px -68% 0px", threshold: 0 });
    headings.forEach(function (heading) {
      tocObserver.observe(heading);
    });
  }

  function openMenu() {
    sidebar.classList.add("is-open");
    scrim.classList.add("is-visible");
    document.body.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    sidebar.classList.remove("is-open");
    scrim.classList.remove("is-visible");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  }

  function hideSearch() {
    searchResults.hidden = true;
    searchResults.innerHTML = "";
    searchInput.setAttribute("aria-expanded", "false");
  }

  function showSearch(query) {
    var needle = normalize(query);
    if (!needle) {
      hideSearch();
      return;
    }
    var matches = pageIndex.filter(function (item) {
      return item.text.indexOf(needle) !== -1 ||
        normalize(item.title).indexOf(needle) !== -1;
    }).slice(0, 7);
    searchResults.innerHTML = "";
    if (matches.length === 0) {
      var empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "没有找到相关内容，试试“材料”“成功率”或“GUI”。";
      searchResults.appendChild(empty);
    } else {
      matches.forEach(function (item) {
        var original = item.page.textContent.replace(/\s+/g, " ").trim();
        var at = normalize(original).indexOf(needle);
        var start = Math.max(0, at - 34);
        var snippet = original.slice(start, start + 105);
        if (start > 0) {
          snippet = "..." + snippet;
        }
        var button = document.createElement("button");
        button.type = "button";
        button.className = "search-result";
        button.setAttribute("data-target", item.id);
        var title = document.createElement("strong");
        title.textContent = item.title + " · " + item.group;
        var preview = document.createElement("span");
        preview.textContent = snippet;
        button.appendChild(title);
        button.appendChild(preview);
        searchResults.appendChild(button);
      });
    }
    searchResults.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var copied = document.execCommand("copy");
    document.body.removeChild(area);
    return copied;
  }

  function copyCode(button) {
    var block = button.closest(".code-block");
    var code = block ? block.querySelector("code") : null;
    if (!code) {
      return;
    }
    var text = code.textContent;
    var finish = function (ok) {
      button.textContent = ok ? "已复制" : "复制失败";
      button.classList.toggle("is-copied", ok);
      window.setTimeout(function () {
        button.textContent = "复制";
        button.classList.remove("is-copied");
      }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        finish(true);
      }).catch(function () {
        finish(fallbackCopy(text));
      });
    } else {
      finish(fallbackCopy(text));
    }
  }

  function buildSlotMap() {
    var map = document.getElementById("slot-map");
    if (!map) {
      return;
    }
    var states = {};
    states[13] = ["equipment", "装备"];
    for (var material = 19; material <= 25; material += 1) {
      states[material] = ["material", "材料"];
    }
    states[29] = ["protection", "保护"];
    states[30] = ["protection", "保护"];
    states[32] = ["boost", "加成"];
    states[33] = ["boost", "加成"];
    states[40] = ["button", "执行"];
    states[4] = ["message", "信息"];
    var size = Number(map.getAttribute("data-size")) || 54;
    for (var slot = 0; slot < size; slot += 1) {
      var cell = document.createElement("div");
      var state = states[slot];
      cell.className = "slot" + (state ? " slot-" + state[0] : "");
      cell.textContent = String(slot);
      if (state) {
        var label = document.createElement("span");
        label.className = "slot-name";
        label.textContent = state[1];
        cell.appendChild(label);
        cell.setAttribute("title", "槽位 " + slot + "：" + state[1]);
      }
      map.appendChild(cell);
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      navigate(link.getAttribute("href"), true);
    });
  });

  menuButton.addEventListener("click", function () {
    if (sidebar.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  scrim.addEventListener("click", closeMenu);

  searchInput.addEventListener("input", function () {
    showSearch(searchInput.value);
  });

  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hideSearch();
      searchInput.blur();
    }
    if (event.key === "Enter") {
      var first = searchResults.querySelector(".search-result");
      if (first) {
        event.preventDefault();
        first.click();
      }
    }
  });

  searchResults.addEventListener("click", function (event) {
    var button = event.target.closest(".search-result");
    if (!button) {
      return;
    }
    searchInput.value = "";
    navigate("#" + button.getAttribute("data-target"), true);
  });

  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      copyCode(button);
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".search-wrap")) {
      hideSearch();
    }
  });

  document.addEventListener("keydown", function (event) {
    var tag = document.activeElement ? document.activeElement.tagName : "";
    var typing = tag === "INPUT" || tag === "TEXTAREA" ||
      (document.activeElement && document.activeElement.isContentEditable);
    if ((event.key === "/" && !typing) ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("hashchange", function () {
    navigate(window.location.hash, false);
  });

  window.addEventListener("popstate", function () {
    navigate(window.location.hash, false);
  });

  buildSlotMap();
  navigate(window.location.hash || "#quick-start", false);
  searchInput.setAttribute("aria-expanded", "false");
}());
