const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { toJSON, paginate } = require('./plugins');

const productSchema = new Schema({
  title: String,
  link: String,
  price: String,
  imgSrc: String,
}, {
  timestamps: true
});
productSchema.plugin(toJSON);
productSchema.plugin(paginate);
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
