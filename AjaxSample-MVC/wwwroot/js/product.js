// ********************************
// Global Variable for Product Page
// ********************************
var productController = (function () {
  // ******************************
  // Private Variables
  // ******************************
  let vm = {
    list: [],
    mode: "list",
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
    vm.lastStatus.url = resp.url;

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
    vm.mode = "list";
    fetch(vm.options.apiUrl + vm.options.urlEndpoint)
      .then((response) => processResponse(response))
      .then((data) => {
        vm.lastStatus.response = data;
        if (vm.lastStatus.ok) {
          vm.list = data;
          buildList(vm);
        } else {
          displayError(ajaxCommon.handleError(vm.lastStatus));
        }
      })
      .catch((error) => {
        displayError(ajaxCommon.handleAjaxError(error));
      });
  }

  function buildList(vm) {
    //Get HTML template from the <script> tag...this is just the html on the index page defined in the script tag...
    //the type is "text/hmtl" not "text/javascript" for example...
    let template = $("#dataTmpl").html();

    //Call Mustache passing in the template and
    //the object with the collection of data...
    let html = Mustache.render(template, vm);

    //Insert the rendered html into the DOM...
    $("#products tbody").html(html);

    //Display HTML table and hide <form> area...
    displayList();
  }

  function displayList() {
    $("#list").removeClass("d-none");
    $("#detail").addClass("d-none)");
  }

  function getEntity(id) {
    vm.mode = "edit";

    //Retrieve a single entity
    fetch(vm.options.apiUrl + vm.options.urlEndpoint + "/" + id)
      .then((response) => processResponse(response))
      .then((data) => {
        if (vm.lastStatus.ok) {
          //fill last status response
          //with data returned...
          vm.lastStatus.response = data;

          //Display entity
          setInput(data);
          //Unhide save/cancel buttons
          displayButtons();

          //Unhide detail area
          displayDetail();
        } else {
          displayError(ajaxCommon.handleError(vm.lastStatus));
        }
      })
      .catch((error) => displayError(ajaxCommon.handleAjaxError(error)));
  }

  function setInput(entity) {
    $("#productID").val(entity.productID);
    $("#name").val(entity.name);
    $("#productNumber").val(entity.productNumber);
    $("#color").val(entity.color);
    $("#standardCost").val(entity.standardCost);
    $("#listPrice").val(entity.listPrice);
    $("#sellStartDate").val(entity.sellStartDate);
  }

  function displayButtons() {
    $("#saveButton").removeClass("d-none");
    $("#cancelButton").removeClass("d-none");
  }

  function displayDetail() {
    $("#list").addClass("d-none");
    $("#detail").removeClass("d-none");
  }

  function cancel() {
    //Hide detail area
    $("#detail").addClass("d-none");
    //Clear any messages
    displayMessage("");
    //Display all data
    get();
  }

  function clearInput() {
    let entity = {
      productID: 0,
      name: "",
      productNumber: "",
      color: "",
      standardCost: 0,
      listPrice: 0,
      sellStartDate: new Date().toLocaleDateString(),
    };

    setInput(entity);
  }

  function add() {
    vm.mode = "add";
    //Display empty entity
    clearInput();
    //Display buttons
    displayButtons();
    //Unhide detail area
    displayDetail();
  }

  function save() {
    //Determine method to call
    //based on mode property
    if (vm.mode === "add") {
      insertEntity();
    } else if (vm.mode === "edit") {
      updateEntity();
    }
  }

  function hideButton() {
    $("#saveButton").addClass("d-none");
    $("#cancelButton").addClass("d-none");
  }

  function getFromInput() {
    return {
      productID: $("#productID").val(),
      name: $("#name").val(),
      productNumber: $("#productNumber").val(),
      color: $("#color").val(),
      standardCost: $("#standardCost").val(),
      listPrice: $("#listPrice").val(),
      sellStartDate: new Date($("#sellStartDate").val()),
    };
  }

  function insertEntity() {
    let entity = getFromInput();

    let options = {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entity), //convert json object or value to a JSON string...
    };

    fetch(vm.options.apiUrl + vm.options.urlEndpoint, options)
      .then((response) => processResponse(response))
      .then((data) => {
        if (vm.lastStatus.ok) {
          //Fill last status repsonse
          //With the data returned
          vm.lastStatus.response = data;

          //Hide buttons while
          //"success message" is displayed
          hideButtons();

          //Display success message
          displayMessage("Product inserted successfully");

          //Redisplay entity returned
          setInput(data);

          setTimeout(() => {
            //After a few seconds
            //redisplay all data
            get();

            //Clear message
            displayMessage("");
          }, vm.options.msgTimeout);
        } else {
          displayError(ajaxCommon.handleError(vm.lastStatus));
        }
      })
      .catch((error) => displayError(ajaxCommon.handleAjaxError(error)));
  }

  function updateEntity() {
    let entity = getFromInput();

    let options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entity),
    };

    fetch(
      vm.options.apiUrl + vm.options.urlEndpoint + "/" + entity.productID,
      options
    )
      .then((response) => processResponse(response))
      .then((data) => {
        if (vm.lastStatus.ok) {
          //Fill lastStatus.response
          //with the data returned
          vm.lastStatus.response = data;

          //Hide button while
          //"success message" is displayed
          hideButton();

          //Display a success message
          displayMessage("Product updated successfully");
          //Redisplay entity returned
          setInput(data);

          setTimeout(() => {
            //After a few seconds
            //redisplay all data
            get();
            //Clear message
            displayMessage("");
          }, vm.options.msgTimeout());
        } else {
          displayError(ajaxCommon.handleError(vm.lastStatus));
        }
      })
      .catch((error) => displayError(ajaxCommon.handleAjaxError(error)));
  }

  function deleteEntity(id) {
    if (confirm(`Delete Product ${id}?`)) {
      let options = {
        method: "DELETE",
      };

      fetch(vm.options.apiUrl + vm.options.urlEndpoint + "/" + id, options)
        .then((response) => processResponse(response))
        .then((data) => {
          if (vm.lastStatus.ok) {
            vm.lastStatus.response = data;
            displayMessage("Product deleted successfully");

            //redisplay data
            get();

            setTimeout(() => {
              //clear message
              displayMessage("");
            }, vm.options.msgTimeout);
          } else {
            displayError(ajaxCommon.handleError(vm.lastStatus));
          }
        })
        .catch((error) => displayError(ajaxCommon.handleAjaxError(error)));
    }
  }

  return {
    setOptions: function (options) {
      if (options) {
        Object.assign(vm.options, options);
      }
    },

    get: get,
    getEntity: getEntity,
    cancel: cancel,
    add: add,
    save: save,
    deleteEntity: deleteEntity,
  };
})();
