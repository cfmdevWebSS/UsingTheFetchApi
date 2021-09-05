// ********************************
// Global Variable for Product Page
// ********************************
var productController = (function () {
  // ******************************
  // Private Variables
  // ******************************
  let vm = {
    options: {
      apiUrl: "",
      urlEndpoint: "product",
      msgTimeout: 0,
    },
    lastStatus: {
      ok: false,
      status: 0,
      statusText: "",
      response: null,
    },
  };
  // ******************************
  // Private Functions
  // ******************************

  // ******************************
  // Public Functions
  // ******************************
  function processResponse(resp) {
    //Copy response to lastStatus properties
    vm.lastStatus.ok = resp.ok;
    vm.lastStatus.status = resp.status;
    vm.lastStatus.statusText = resp.statusText;
    vm.lastStatus.response = resp.response;

    if (vm.lastStatus.ok) {
      return resp.json();
    } else {
      return resp.text();
    }
  }

  function displayMessage(msg) {
    if (msg) {
      $("#message").text(msg);
      $("#message").removeClass("d-none");
    } else {
      $("#message").addClass("d-none");
    }
  }

  function displayError(msg) {
    if (msg) {
      $("#error").text(msg);
      $("#error").removeClass("d-none");
    } else {
      $("#error").addClass("d-none");
    }
  }

  function get() {
    fetch(vm.options.apiUrl + vm.options.urlEndpoint)
      .then((response) => processResponse(response))
      .then((data) => {
        vm.lastStatus.response = data;
        if (vm.lastStatus.ok) {
          displayMessage(JSON.stringify(data));
        } else {
          displayError(ajaxCommon.handleError(vm.lastStatus));
        }
      })
      .catch((error) => {
        displayError(ajaxCommon.handleAjaxError(error));
      });
  }

  return {
    setOptions: function (options) {
      if (options) {
        Object.assign(vm.options, options);
      }
    },

    get: get,
  };
})();
