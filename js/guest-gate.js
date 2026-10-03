/* Guest gate removed. whoami and login are unchanged. This file does not block writes. */
(function (g) {
  "use strict";
  function noop() { return false; }
  g.ZaziseGuest = {
    isGuest: function () { return false; },
    openGate: noop,
    closeGate: function () {},
    gateGuestMenu: function () {},
    showWelcome: function () {},
    startGuestTour: function () {},
    paintGuestProfile: function () {},
    toggleLike: function () { return false; },
    getLiked: function () { return false; },
    loginUrl: "login.html"
  };
  g.ZaziseGate = { show: function () {} };
})(window);
