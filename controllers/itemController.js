var Item = require('../models/item');
var Category = require('../models/category')
var async = require('async')
const { body, validationResult } = require('express-validator');
const category = require('../models/category');
const item = require('../models/item');

// Display home-page
exports.index = function (req, res) {
    res.render('index', { title: 'Inventory Home' });
};

// Display list of all items.
exports.item_list = function (req, res, next) {

    Item.find({}, 'name category')
        .collation({ locale: "en" })
        .sort({ name: 1 })
        .populate('category')
        .exec(function (err, list_items) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('item_list', { title: 'Item List', item_list: list_items });
        });

};

// Display detail page for a specific item.
exports.item_detail = function (req, res) {
    Item.findById(req.params.id)
        .populate('category')
        .exec(function (err, item) {
            if (err) { return next(err); }
            res.render('item_detail', { title: 'Item Detail', item: item, category: item.category });
        });
};

// Display item create form on GET.
exports.item_create_get = function (req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
    /* async.parallel({
         catgeorys: function(callback) {
             Category.find(callback);
         },
         
        }, function(err, results) {
         if (err) { return next(err); }
         res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
     });*/
    Category.find({}, 'name description')
        .sort({ name: 1 })
        .exec(function (err, categorys) {
            if (err) { return next(err); }
            res.render('item_form', { title: 'Create Item', categorys: categorys });
        })
};

// Handle item create on POST.
exports.item_create_post = [

    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1, max: 30 }).escape().withMessage('Category must be specified with more the 1 character and less then 30 characters.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),
    body('category', 'Category must not be empty').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().notEmpty().isInt({ min: 0, max: 10000 }).escape(),
    body('number_in_stock', 'Number in stock must not be empty').trim().notEmpty().isInt({ min: 0 }).escape(),


    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an Item object with escaped and trimmed data.
        var item = new Item(
            {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                number_in_stock: req.body.number_in_stock,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            Category.find({}, 'name')
                .sort({ name: 1 })
                .exec(function (err, categorys) {
                    if (err) { return next(err); }
                    res.render('item_form', { title: 'Create Item', item: item, categorys: categorys, errors: errors.array() });
                })
            return;
        }
        else {
            // Data from form is valid.
            item.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new item record.
                res.redirect(item.url);
            });
        }
    }
];

// Display item delete form on GET.
exports.item_delete_get = function (req, res, next) {
    Item.findById(req.params.id)
        .exec(function (err, item) {
            if (err) { return next(err) }
            if (item == null) {
                res.redirect('/inventory/items');
            }

            res.render('item_delete', { title: 'Delete Item', item: item })
        })
};

// Handle item delete on POST.
exports.item_delete_post = function (req, res) {
    // category has no items. Delete object and redirect to the list of categorys.
    Item.findByIdAndRemove(req.body.itemid, function deleteitem(err) {
        if (err) { return next(err); }
        // Success - go to category list
        res.redirect('/inventory/items')
    })
};

// Display item update form on GET.
exports.item_update_get = function (req, res, next) {
    async.parallel({
        item: function (callback) {
            Item.findById(req.params.id).populate('category').exec(callback)
        },
        categorys: function (callback) {
            Category.find(callback)
        },
    }, function (err, results) {
        if (err) { return next(err) }
        if (results.item == null) {
            var err = new Error('Item not found');
            err.status = 404;
            console.log(results)
            return next(err);
        }
        res.render('item_form', { title: 'Update Item', item: results.item, categorys: results.categorys, })

    }
    )
};

// Handle item update on POST.
exports.item_update_post = [
    body('name').trim().isLength({ min: 1, max: 30 }).escape().withMessage('Category must be specified with more the 1 character and less then 30 characters.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),
    body('category', 'Category must not be empty').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty').trim().notEmpty().isInt({ min: 0, max: 10000 }).escape(),
    body('number_in_stock', 'Number in stock must not be empty').trim().notEmpty().isInt({ min: 0 }).escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        // Create an Item object with escaped and trimmed data.
        var item = new Item(
            {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                number_in_stock: req.body.number_in_stock,
                _id: req.params.id,
            });
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            Category.find({}, 'name')
                .exec(function (err, categorys) {
                    if (err) { return next(err); }
                    res.render('item_form', { title: 'Update Item', item: item, errors: errors.array() });
                })

            return;
        }
        else {
            // item from form is valid. Update the record.
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theitem) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(theitem.url);
            });
        }
    }
];
