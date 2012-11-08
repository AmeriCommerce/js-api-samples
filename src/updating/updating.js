(function(window, $, AC) {

  var $cart = $("#cart"),
      cartRowTemplate = $("#cart-row-tmpl").html(),
      $cartBody = $cart.find("tbody"),
      $subtotalRow = $cart.find("#subtotal"),
      $subtotalAmount = $subtotalRow.find(".total"),
      batch;


  function drawCart(cart) {
    var i, len, item,
        $row, $rowEach, $rowTotal,
        $itemName, $itemNumber, $qtyField;

    $subtotalRow.prevAll("tr").remove();

    for(i = 0, len = cart.items.length; i < len; i++) {
      item = cart.items[i];

      $row = $(cartRowTemplate);
      $itemName = $row.find(".item-name");
      $itemNumber = $row.find(".item-number");
      $qtyField = $row.find(".item-qty");
      $rowEach = $row.find(".each");
      $rowTotal = $row.find(".total");

      $itemName.html(item.itemName);
      $itemNumber.html(item.itemNumber);
      $qtyField.val(item.quantity);
      $rowEach.html(item.price.toFixed(2));
      $rowTotal.html((item.price * item.quantity).toFixed(2));
      $row.data("cart-row-id", item.cartRowId);

      $row.prependTo($cartBody);
    }

    $subtotalAmount.html(cart.subtotal.toFixed(2));

    bindEvents();
  }

  function bindEvents() {
    var $removeLinks = $(".remove-item"),
        $qtyFields = $(".item-qty"),
        $clearCart = $("#clear-cart");

    $removeLinks.unbind(".removeItem").bind("click.removeItem", function(e) {
      var $link = $(this),
          cartRowId = $link.parents("tr").data("cart-row-id");

      e.preventDefault();

      AC.cart.remove(cartRowId, function(response) {
        var cart = response.cart || response.data; // See the readme for an explanation on why this is necessary.
        drawCart(cart);
      });
    });

    $qtyFields.unbind(".updateTotals").bind("change.updateTotals", function(e) {
      var $qtyField = $(this),
          cartRowId = $qtyField.parents("tr").data("cart-row-id");

      AC.cart.update({
        cartRowId: cartRowId,
        quantity: parseInt($qtyField.val())
      }, function(response) {
        var cart = response.cart || response.data;
        drawCart(cart);
      });
    });

    $clearCart.unbind(".clearCart").bind("click.clearCart", function(e) {
      e.preventDefault();

      AC.cart.clear(function(response) {
        var cart = response.cart || response.data;
        drawCart(cart);
      });
    });
  }


  AC.init({
    storeDomain: "chief.americommerce.com"
  });

  batch = new AC.Batch();

  // Set up a batch to prepopulate this cart, for the sake of our example.
  // Items in the batch will run at the same time, so do not use this for things that
  // need to run sequentially.
  batch.add(function() {
    var task = this; // IMPORTANT: we have to flag this task as done below.

    AC.cart.add({
      itemId: 25,
      quantity: 3
    }, function() {
      task.done(true); // After the item has been added, signal that this task is done.
    });
  });

  batch.add(function() {
    var task = this; // IMPORTANT: we have to flag this task as done below.

    AC.cart.add({
      itemId: 24,
      quantity: 1
    }, function() {
      task.done(true); // After the item has been added, signal that this task is done.
    });
  });

  batch.add(function() {
    var task = this; // IMPORTANT: we have to flag this task as done below.

    AC.cart.add({
      itemId: 21,
      quantity: 4
    }, function() {
      task.done(true); // After the item has been added, signal that this task is done.
    });
  });

  // Attach a callback to the "complete" event for the batch.
  // This will run after all jobs in the batch have been completed.
  batch.subscribe("complete", function() {
    AC.cart.get(function(response) {
      var cart = response.cart || response.data;
      drawCart(cart);
    });
  });

  // Clear the existing cart, then run the batch after the clear finishes
  AC.cart.clear(function() {
    batch.run();
  });

}(window, jQuery, AC));