document.addEventListener('DOMContentLoaded', function () {
  var sections = document.querySelectorAll('.fade-in-section');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries, observerRef) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerRef.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  } else {
    sections.forEach(function (section) {
      section.classList.add('is-visible');
    });
  }
});
