const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { toJSON, paginate } = require('./plugins');
const { error } = require('winston');

const scrapJobSchema = new Schema({
  platform: String,
  searchedFor: String,
  status: String,
  error : String
}, {
  timestamps: true
});
scrapJobSchema.plugin(toJSON);
scrapJobSchema.plugin(paginate);
const ScrapJob = mongoose.model('ScrapJob', scrapJobSchema);
module.exports = ScrapJob;
