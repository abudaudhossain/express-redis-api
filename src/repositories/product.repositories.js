const productRepository ={
 async findAll(){
    console.info("[PRODUCT DB] call product db..")
    return [
      { id: 1, name: "Keyboard", price: 1500 },
      { id: 2, name: "Mouse", price: 800 },
    ];
 }
}

module.exports = productRepository