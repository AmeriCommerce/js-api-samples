/* ==========================================================================
   Simple async add to cart example
   AC Client API
   ========================================================================== */
(function(window, $, AC) {

  var $cartCount = $("#cart-count"),
      $addToCart = $(".add-to-cart"),
      $clearCart = $("#clear-cart");


  function updateCartCount(cart) {
    if(cart.totalItemCount == 1) {
      $cartCount.html("1 item");
    } else {
      $cartCount.html(cart.totalItemCount + " items");
    }
  }

  // This initialization call tells us what store we're targeting. Most important on multistore setups,
  // but required for all.
  AC.init({
    storeDomain: "chief.americommerce.com"
  });

  AC.cart.get(function(response) {
    var cart = response.cart || response.data; // See the readme for an explanation on why this is necessary.
    updateCartCount(cart);
  });


  $addToCart.click(function(e) {
    var $item = $(this).parent(),
        itemName = $item.find(".item-name").html(),
        itemNumber = $item.find(".item-number").val(),
        price = parseFloat($item.find(".price").html()),
        item;

    e.preventDefault();

    item = {
      itemName: itemName,
      itemNumber: itemNumber,
      price: price,
      quantity: 1
    };

    AC.cart.add(item, function(response) {
      var cart = response.cart || response.data; // See the readme for an explanation on why this is necessary.
      updateCartCount(cart);
    });
  });


  $clearCart.click(function(e) {
    e.preventDefault();

    AC.cart.clear(function(response) {
      var cart = response.cart || response.data; // See the readme for an explanation on why this is necessary.
      updateCartCount(cart);
    })
  });

}(window, jQuery, AC));