var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
  {
    name: {type: String, required: true, minlength: 1, maxLength: 30},
    description: {type: String, required: true},
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    price: {type: Number, required: true},
    img:
    {
        data: Buffer,
        contentType: String
    },
    number_in_stock: {type: Number, required: true},
  }
);

// Virtual for author's URL
ItemSchema
.virtual('url')
.get(function () {
  return '/inventory/item/' + this._id;
}); 

//Export model
module.exports = mongoose.model('Item', ItemSchema);