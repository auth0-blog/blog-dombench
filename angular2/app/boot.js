(function(app) {
  document.addEventListener('DOMContentLoaded', function() {
    ng.core.enableProdMode();
    ng.platform.browser.bootstrap(app.AppComponent);
  });
})(window.app || (window.app = {}));
