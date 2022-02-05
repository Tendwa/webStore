//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-wrap");
const productDOM = document.querySelector(".product-list");
const searchDOM = document.querySelector(".sugList");
const searchMainDOM = document.querySelector(".suggestion");
const ulList = document.getElementById('ulList');
//cart
let cart = [];

//buttons
let buttonsDOM = [];
//getting the product
class Products {
  async getProducts() {
    try {
      let result = await fetch("./js/products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((items) => {
        const { title, price } = items.fields;
        const { id } = items.sys;
        const image = items.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
//display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((products) => {
      result += `
            <!--first product-->
            <article class="product">
                <div class="product-wrap" id="productWrap">
                    <img src="${products.image}" class="product-img"/>
                    <button class="add-cart-btn" data-id=${products.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Add to cart
                    </button>
                </div>
                <h3>${products.title}</h3>
                <h4>ksh.${products.price}</h4>
            </article>
            <!--/first product-->
            `;
    });
    productDOM.innerHTML = result;
  }
  
  getCartButton() {
    const buttons = [...document.querySelectorAll(".add-cart-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "in Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "in cart";
        event.target.disabled = true;
        // get the product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];
        // save cart in local storage
        Storage.saveCart(cart);
        // set the cart values
        this.setCartValues(cart);
        // display the cart items
        this.addCartItem(cartItem);
        // show the cart
        //this.showChart();
      });
    });
  }
  // this method sets the cart values from the cart saved in the localStorage
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((items) => {
      tempTotal += items.price * items.amount;
      itemsTotal += items.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-layout");
    div.innerHTML = `
     <img src="${item.image}" alt="product"/>
                <div>
                    <h4>${item.title}</h4>
                    <h5>ksh${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>remove</span>
                </div>
                <div>
                    <i class="fas fa-chevron-up" data-id=${item.id}></i>
                    <p class="item-amount">${item.amount}</p>
                    <i class="fas fa-chevron-down" data-id=${item.id}></i> 
                </div>`;
    cartContent.appendChild(div);
  }
  showChart() {
    cartOverlay.classList.add("transparentbg");
    cartDOM.classList.add("showCart");
  }
  setApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.fillCart(cart);
    cartBtn.addEventListener("click", this.showChart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  fillCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentbg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    //clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //Remove cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeClass = event.target;
        let id = removeClass.dataset.id;
        this.removeItem(id);
        cartContent.removeChild(removeClass.parentElement.parentElement);

        //increases items in cart
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let incAmount = event.target;
        let id = incAmount.dataset.id;
        let incItem = cart.find((item) => item.id === id);
        incItem.amount = incItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        incAmount.nextElementSibling.innerText = incItem.amount;
      }
      //decreases items in cart
      else if (event.target.classList.contains("fa-chevron-down")) {
        let decAmount = event.target;
        let id = decAmount.dataset.id;
        let decItem = cart.find((item) => item.id === id);
        decItem.amount = decItem.amount - 1;
        if (decItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          decAmount.previousElementSibling.innerText = decItem.amount;
        } else {
          cartContent.removeChild(decAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getOneButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getOneButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}



//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}
// search feature .js
class Search {

  setList(products){
    this.clearList();
    for(const list of products){
      const liTag = document.createElement('li');
      const pWrap = document.getElementById('productWrap');
      liTag.classList.add('li-list');
      pWrap.classList.add('product-wrap2');
      const text = document.createTextNode(list.title);
      liTag.appendChild(text);
      ulList.appendChild(liTag);
    }
    if (products.length === 0 ){
      this.noResults();
    }
  }
  clearList(){
    while(ulList.firstChild){
      ulList.removeChild(ulList.firstChild);
    }
  }

  noResults(){
    const liTag = document.createElement('li');
    liTag.classList.add('li-list');
    const text = document.createTextNode('No results found');
    liTag.appendChild(text);
    ulList.appendChild(liTag);
  }

  getFilteredData(value, searchTerm){
    if (value === searchTerm){
      return 1;
    }else if(value.startsWith(searchTerm)){
      return 2;
    }else if(value.includes(searchTerm)){
      return 0;
    }else{
      return -1;
    }
  }

  searchFunction(products){
    const input = document.getElementById("searchInput");
    input.addEventListener("input", (event) => {
      const value = event.target.value;
      if (value && value.trim().length > 0 ){
        this.setList(products.filter(product =>{
        return product.title.includes(value);
        })
        // .sort((resultA, resultB)=>{
        //   return this.getFilteredData(resultB.name, value) - this.getFilteredData(resultA.name, value);
        // })
        );
      }
      else{
        this.clearList();
      }
      
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  const search = new Search();
  //setup APP
  ui.setApp();
  //get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
      search.searchFunction(products);
    })
    .then(() => {
      ui.getCartButton();
      ui.cartLogic();
    });
});
