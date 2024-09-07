const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { toJSON, paginate } = require('./plugins');

const trendAppliedSchema = new Schema({
  link: String,
  rating: Number,
  bought: Number,
  isTrending: Boolean,
  title: String,
  imgsrc: String,
}, {
  timestamps: true
});
trendAppliedSchema.plugin(toJSON);
trendAppliedSchema.plugin(paginate);
const TrendApplied = mongoose.model('TrendApplied', trendAppliedSchema);
module.exports = TrendApplied;
