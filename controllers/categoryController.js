var Category = require('../models/category');
var Item = require('../models/item')
var async = require('async')
const { body, validationResult } = require('express-validator');

// Display list of all categorys.
exports.category_list = function (req, res, next) {

    Category.find()
        .collation({ locale: "en" })
        .sort([['name', 'ascending']])
        .exec(function (err, list_categorys) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('category_list', { title: 'Categories', category_list: list_categorys });
        });

};
// Display detail page for a specific category.
exports.category_detail = function (req, res) {
    async.parallel({
        category: function (callback) {
            Category.findById(req.params.id)
                .exec(callback)
        },
        category_items: function (callback) {
            Item.find({ 'category': req.params.id }, 'name description')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.category == null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items });
    });
};

// Display category create form on GET.
// Display category create form on GET.
exports.category_create_get = function (req, res, next) {
    res.render('category_form', { title: 'Create Category' });
};

// Handle category create on POST.
exports.category_create_post = [

    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1, max: 30 }).escape().withMessage('Category must be specified with more the 1 character and less then 30 characters.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('category_form', { title: 'Create Category', category: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an category object with escaped and trimmed data.
            var category = new Category(
                {
                    name: req.body.name,
                    description: req.body.description,
                });
            category.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new category record.
                res.redirect(category.url);
            });
        }
    }
];

// Display category delete form on GET.
exports.category_delete_get = function (req, res) {
    async.parallel({
        category: function (callback) {
            Category.findById(req.params.id).exec(callback)
        },
        category_items: function (callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err) }
        if (results.category == null) {
            res.redirect('/inventory/categorys');
        }

        res.render('category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items })
    })
};

// Handle category delete on POST.
exports.category_delete_post = function (req, res) {

    async.parallel({
        category: function (callback) {
            Category.findById(req.body.categoryid).exec(callback)
        },
        categorys_items: function (callback) {
            Item.find({ 'category': req.body.categoryid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.categorys_items.length > 0) {
            // category has items. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete category', category: results.category, category_items: results.categorys_items });
            return;
        }
        else {
            // category has no items. Delete object and redirect to the list of categorys.
            Category.findByIdAndRemove(req.body.categoryid, function deletecategory(err) {
                if (err) { return next(err); }
                // Success - go to category list
                res.redirect('/inventory/categorys')
            })
        }
    });
};

// Display category update form on GET.
exports.category_update_get = function (req, res, next) {
    Category.findById(req.params.id)
        .exec(function (err, category) {
            if (err) { return next(err) }
            if (category == null) { // No results.
                var err = new Error('Category not found');
                err.status = 404;
                return next(err);
            }
            res.render('category_form', { title: 'Update Category', category: category })
        })
};

// Handle category update on POST.
exports.category_update_post = [
    // Validate and sanitize fields.
    body('name').trim().isLength({ min: 1, max: 30 }).escape().withMessage('Category must be specified with more the 1 character and less then 30 characters.'),
    body('description').trim().isLength({ min: 1 }).escape().withMessage('Description must be specified.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an category object with escaped and trimmed data.
        var category = new Category(
            {
                name: req.body.name,
                description: req.body.description,
                _id: req.params.id,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('category_form', { title: 'Update Category', category: category, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.


            Category.findByIdAndUpdate(req.params.id, category, {}, function (err, thecategory) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thecategory.url);
            });
        };

    }
]

