// Renders the Technical Reports archive from data/reports.js (loaded
// before this file as a plain <script> tag, so the archive works when
// the site is opened straight from disk, not just from a web server).
//
// To add a new report: append one object to data/reports.js
//   { "id": "2026014", "year": 2026, "month": "July", "reportNo": "2026014",
//     "authors": "Last, F. and Deb, K", "title": "Report title",
//     "pdf": "papers/2026014.pdf", "sizeText": "1.2MB" }
// and drop the PDF file into the papers/ folder. No build step needed.

(function () {
  var listEl = document.getElementById("reports-list");
  var searchEl = document.getElementById("report-search");
  var yearSelectEl = document.getElementById("report-year-select");
  var countEl = document.getElementById("report-count");
  if (!listEl) return;

  var allReports = window.REPORTS_DATA || [];

  if (!allReports.length) {
    listEl.innerHTML =
      '<div class="empty-state">The report archive could not be loaded. Make sure data/reports.js is present.</div>';
  } else {
    buildYearFilter(allReports);
    render(allReports);
  }

  function buildYearFilter(data) {
    var years = Array.from(new Set(data.map(function (e) { return e.year; }))).sort(function (a, b) {
      return b - a;
    });
    years.forEach(function (y) {
      var opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      yearSelectEl.appendChild(opt);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function highlightDeb(authors) {
    var escaped = escapeHtml(authors);
    return escaped.replace(/Deb,\s*K\.?/gi, function (match) {
      return "<strong>" + match + "</strong>";
    });
  }

  function render(data) {
    var query = (searchEl.value || "").trim().toLowerCase();
    var yearFilter = yearSelectEl.value;

    var filtered = data.filter(function (e) {
      if (yearFilter && String(e.year) !== yearFilter) return false;
      if (!query) return true;
      var hay = (e.title + " " + e.authors + " " + (e.reportNo || "")).toLowerCase();
      return hay.indexOf(query) !== -1;
    });

    countEl.textContent = filtered.length + " of " + data.length + " reports";

    if (!filtered.length) {
      listEl.innerHTML = '<div class="empty-state"><i class="fa-solid fa-magnifying-glass"></i><p>No reports match your search.</p></div>';
      return;
    }

    var maxYear = Math.max.apply(null, data.map(function (e) { return e.year; }));

    var groups = {};
    filtered.forEach(function (e) {
      groups[e.year] = groups[e.year] || [];
      groups[e.year].push(e);
    });

    var years = Object.keys(groups).sort(function (a, b) { return b - a; });

    listEl.innerHTML = years
      .map(function (year) {
        var items = groups[year];
        var cards = items
          .map(function (e) {
            var isNew = e.year === maxYear;
            var pdfHtml = e.pdf
              ? '<a class="pdf-link" href="' + escapeHtml(e.pdf) + '" target="_blank" rel="noopener">' +
                '<i class="fa-solid fa-file-pdf"></i> PDF' +
                (e.sizeText ? " (" + escapeHtml(e.sizeText) + ")" : "") +
                "</a>"
              : '<span class="no-pdf">PDF not yet available</span>';

            return (
              '<article class="report-card reveal in-view">' +
              '<div class="body">' +
              '<p class="title">' + escapeHtml(e.title) + "</p>" +
              '<p class="authors">' + highlightDeb(e.authors) + "</p>" +
              '<div class="meta">' +
              '<span class="report-id">Report No. ' + escapeHtml(e.reportNo || e.id) + "</span>" +
              (e.month ? '<span class="report-id">' + escapeHtml(e.month) + " " + e.year + "</span>" : "") +
              (isNew ? '<span class="badge-new">New</span>' : "") +
              "</div>" +
              "</div>" +
              pdfHtml +
              "</article>"
            );
          })
          .join("");

        return (
          '<div class="report-year-group">' +
          '<h3 class="report-year-heading">' + year + '<span class="count">' + items.length + " report" + (items.length === 1 ? "" : "s") + "</span></h3>" +
          cards +
          "</div>"
        );
      })
      .join("");
  }

  searchEl.addEventListener("input", function () {
    render(allReports);
  });
  yearSelectEl.addEventListener("change", function () {
    render(allReports);
    if (yearSelectEl.value) {
      var group = listEl.querySelector(".report-year-group");
      if (group) group.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
