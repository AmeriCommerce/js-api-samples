(function(window, $, AC) {

  var $cartTable = $("#cart"),
      cartRowTemplate = $("#cart-row-tmpl").html();

  window.cart = (function() {

    var Cart = function($el) {

      this.$el = $el;
      this.$body = $el.find("tbody");
      
      this.$subtotalRow = $el.find("#subtotal");
      this.$taxRow = $el.find("#tax");
      this.$grandtotalRow = $el.find("#grandtotal");

      AC.init({
        storeDomain: "chief.americommerce.com"
      });
      AC.cart.clear();
    };

    Cart.prototype = {

    };

    return new Cart($cartTable);
  }());

}(window, jQuery, AC));