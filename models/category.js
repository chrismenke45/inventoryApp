var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: {type: String, required: true, minLength: 1, maxLength: 30},
    description: {type: String, required: true},
  }
);

// Virtual for author's URL
CategorySchema
.virtual('url')
.get(function () {
  return '/inventory/category/' + this._id;
});

//Export model
module.exports = mongoose.model('Category', CategorySchema);