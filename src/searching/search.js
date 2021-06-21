/* ==========================================================================
   Simple async search example
   AC Client API
   ========================================================================== */
(function(window, $, AC) {

  var $cartCount = $("#cart-count"),      
      $clearCart = $("#clear-cart"),
      $searchTerm = $(".search-term"),
      $search = $(".search"),
      $searchResults = $(".container");
	  
   function updateCartCount(cart) {
    if(cart.totalItemCount == 1) {
      $cartCount.html("1 item");
    } else {
      $cartCount.html(cart.totalItemCount + " items");
    }
  }
  
  function updateSearchResults(products) {
	
	$searchResults.empty();
	
	$(products).each(function(i, product) {
		var $itemDiv = $("<div class='item'></div>");
		var $itemName = $("<h4 class='item-name'></h4>");
		var $itemNumber = $("<p class='item-number'></p>");
		var $productStatus = $("<p class='product-status'></p>");
		var $price = $("<p class='price'></p>");
		var $addToCart = $("<a href='#' class='add-to-cart'>Add To Cart</a>");
		
		$itemName.append(product.itemName);
		$itemNumber.append(product.itemNumber);
		$productStatus.append(product.productStatus);
		$price.append(product.price);		
		$itemDiv.append($itemName).append($itemNumber).append($price).append($addToCart);
		$searchResults.append($itemDiv);		
	});
		
	//rebind add to cart links
	var $addToCart = $(".add-to-cart");
	
	 $addToCart.click(function(e) {
		addToCart(e, this);
	});
  }
  
  function addToCart(e, link) {
    var $item = $(link).parent(),
        itemName = $item.find(".item-name").html(),
        itemNumber = $item.find(".item-number").val(),
	productStatus = $item.find(".product-status").val(),
        price = $item.find(".price").html(),        
        item;

    price = (typeof price === 'undefined') ? 0 : parseFloat(price.replace("$", ""));
    e.preventDefault();

    item = {
      itemName: itemName,
      itemNumber: itemNumber,
      productStatus: productStatus,
      price: price,
      quantity: 1
    };

    AC.cart.add(item, function(response) {
      var cart = response.cart || response.data; // See the readme for an explanation on why this is necessary.
      updateCartCount(cart);
    });
  }

  // This initialization call tells us what store we're targeting. Most important on multistore setups,
  // but required for all.
  AC.init({
    storeDomain: "edtest.americommerce.com"
  });
  
  AC.cart.get(function(response) {
    var cart = response.cart || response.data; // See the readme for an explanation on why this is necessary.
    updateCartCount(cart);
  });
 
  $search.click(function(e) {
    var productData = {
	AllCatalog: true,
	Page: 1,
	PageSize: 10,
	StoreId:1,
	Term:$searchTerm.val(),
	SubscriptionProductsOnly:false,
	AllowVariants:true,
	ShowHidden:false,
	//CustomerTypeId: 1,
	//KeepInfoOnlyParentProducts:false
    };
	
	AC.product.search(productData, function(response) {
		var data = response.data;
		updateSearchResults(data);
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
