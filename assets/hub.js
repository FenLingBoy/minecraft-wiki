(function () {
  "use strict";

  var input = document.getElementById("hub-search-input");
  var results = document.getElementById("hub-search-results");
  var entries = Array.prototype.slice.call(document.querySelectorAll(".searchable"));

  if (!input || !results) {
    return;
  }

  function normalize(value) {
    return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  entries = entries.map(function (link) {
    return {
      link: link,
      href: link.getAttribute("href"),
      title: link.getAttribute("data-title") || link.textContent.trim(),
      group: link.getAttribute("data-group") || "Minecraft Wiki",
      text: normalize(link.getAttribute("data-search") || link.textContent)
    };
  });

  function hide() {
    results.hidden = true;
    results.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
  }

  function render(query) {
    var needle = normalize(query);
    if (!needle) {
      hide();
      return;
    }
    var matches = entries.filter(function (entry) {
      return entry.text.indexOf(needle) !== -1 ||
        normalize(entry.title).indexOf(needle) !== -1;
    }).slice(0, 7);
    results.innerHTML = "";
    if (!matches.length) {
      var empty = document.createElement("div");
      empty.className = "hub-search-empty";
      empty.textContent = "没有找到条目，试试“插件”“1.20”或“快速开始”。";
      results.appendChild(empty);
    } else {
      matches.forEach(function (entry) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "hub-search-result";
        button.setAttribute("data-href", entry.href);
        var title = document.createElement("strong");
        title.textContent = entry.title;
        var group = document.createElement("span");
        group.textContent = entry.group;
        button.appendChild(title);
        button.appendChild(group);
        results.appendChild(button);
      });
    }
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  input.addEventListener("input", function () {
    render(input.value);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      hide();
      input.blur();
    }
    if (event.key === "Enter") {
      var first = results.querySelector(".hub-search-result");
      if (first) {
        event.preventDefault();
        window.location.href = first.getAttribute("data-href");
      }
    }
  });

  results.addEventListener("click", function (event) {
    var button = event.target.closest(".hub-search-result");
    if (button) {
      window.location.href = button.getAttribute("data-href");
    }
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".hub-search")) {
      hide();
    }
  });

  document.addEventListener("keydown", function (event) {
    var tag = document.activeElement ? document.activeElement.tagName : "";
    var typing = tag === "INPUT" || tag === "TEXTAREA";
    if ((event.key === "/" && !typing) ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      input.focus();
      input.select();
    }
  });

  var year = document.getElementById("current-year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}());
