(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _import = require('./model/import');

var _import2 = _interopRequireDefault(_import);

var _import3 = require('./view/import');

var _import4 = _interopRequireDefault(_import3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var importModel = new _import2.default();
var importView = new _import4.default({ model: importModel });

importView.render();

},{"./model/import":3,"./view/import":10}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Config = Backbone.Model.extend({
    defaults: {
        'selectedShop': 'amazon',
        'newShopName': null,
        'selectedAction': 'new-product',
        'mergeProductId': null,
        'replaceProductId': null,
        'status': 'draft'
    }
});

exports.default = Config;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Import = Backbone.Model.extend({
    defaults: {
        'action': 'aff_product_admin_amazon_import'
    },

    /**
     * Initialize the import.
     *
     * @since 0.9
     */
    initialize: function initialize() {
        this.search = new _search2.default();
        this.config = new _config2.default();

        this.search.on('aff:amazon-import:import-results-item', this.import, this);
    },


    /**
     * Import the product.
     *
     * @since 0.9
     * @param product
     * @public
     */
    import: function _import(product) {
        var _this = this;

        var data = {
            'product': {
                'name': product.attributes.name,
                'type': product.attributes.type,
                'shops': product.attributes.shops,
                'custom_values': product.attributes.custom_values
            },
            'config': this.config.attributes,
            'form': this.search.form.attributes
        };

        jQuery.ajax({
            type: 'POST',
            url: this._buildUrl(),
            data: data
        }).done(function (result) {
            var shopTemplate = ((result || {}).data || {}).shop_template || null;

            if (shopTemplate) {
                _this.config.trigger('aff:amazon-import:config:add-shop', shopTemplate);
            }

            product.showSuccessMessage();
        }).fail(function (result) {
            var errorMessage = ((((result || {}).responseJSON || {}).data || {})[0] || {}).message || null;

            product.showErrorMessage(errorMessage);
        });
    },


    /**
     * Build the import url based on the given parameters.
     *
     * @since 0.9
     * @returns {string}
     * @private
     */
    _buildUrl: function _buildUrl() {
        return affAdminAmazonImportUrls.ajax + ('?action=' + this.get('action'));
    }
});

exports.default = Import;

},{"./config":2,"./search":8}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var SearchForm = Backbone.Model.extend({
    defaults: {
        'term': '',
        'type': 'keywords',
        'category': 'All',
        'withVariants': 'no',
        'loading': false,
        'error': false,
        'errorMessage': null,
        'providerConfigured': false
    },

    /**
     * Submit the form the form and trigger the loading animation.
     *
     * @since 0.9
     * @public
     */
    submit: function submit() {
        this.set({
            'loading': true,
            'error': false,
            'errorMessage': null
        });

        this.trigger('aff:amazon-import:search:search-form:submit', this);
    },


    /**
     * Finish the submit and stop the loading animation.
     *
     * @since 0.9
     * @public
     */
    done: function done() {
        this.set('loading', false);

        this.trigger('aff:amazon-import:search:search-form:done', this);
    },


    /**
     * Show a submit error and stop the loading animation.
     *
     * @since 0.9
     * @param {string|null} message
     * @public
     */
    error: function error() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.set({
            'loading': false,
            'error': true,
            'errorMessage': message
        });

        this.trigger('aff:amazon-import:search:search-form:error', this);
    }
});

exports.default = SearchForm;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var SearchLoadMore = Backbone.Model.extend({
    defaults: {
        'enabled': true,
        'loading': false,
        'noResults': false,
        'error': false,
        'errorMessage': null
    },

    /**
     * Activate the loading spinner animation.
     *
     * @since 0.9
     * @public
     */
    load: function load() {
        this.set('loading', true);
        this.trigger('aff:amazon-import:search:load-more:load', this);
    },


    /**
     * Show the load more button and deactivate the spinner animation.
     *
     * @since 0.9
     * @param {boolean} enabled
     * @public
     */
    done: function done() {
        var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this.set({
            'loading': false,
            'enabled': enabled
        });

        this.trigger('aff:amazon-import:search:load-more:done', this);
    },


    /**
     * Show the no results message and deactivate the spinner animation.
     *
     * @since 0.9
     * @public
     */
    noResults: function noResults() {
        this.set({
            'loading': false,
            'noResults': true
        });

        this.trigger('aff:amazon-import:search:load-more:no-results', this);
    },


    /**
     * Show a load more error and deactivate the spinner animation.
     *
     * @since 0.9
     * @param {string|null} message
     * @public
     */
    error: function error() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.set({
            'enabled': true,
            'loading': false,
            'error': true,
            'errorMessage': message
        });

        this.trigger('aff:amazon-import:search:load-more:error', this);
    }
});

exports.default = SearchLoadMore;

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var SearchResultsItem = Backbone.Model.extend({
    defaults: {
        'loading': false,
        'success': false,
        'successMessage': null,
        'error': false,
        'errorMessage': null
    },

    /**
     * Import the search result item.
     *
     * @since 0.9
     * @public
     */
    import: function _import() {
        this.set('loading', true);

        this.trigger('aff:amazon-import:search:results:item:import', this);
    },


    /**
     * Successfully finish the import with an optional message.
     *
     * @since 0.9
     * @param {string|null} message
     * @public
     */
    showSuccessMessage: function showSuccessMessage() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.set({
            'loading': false,
            'success': true,
            'successMessage': message
        });

        this.trigger('aff:amazon-import:search:results:item:success', this);
    },


    /**
     * Display an error for import with an optional message.
     *
     * @since 0.9
     * @param {string|null} message
     * @public
     */
    showErrorMessage: function showErrorMessage() {
        var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        this.set({
            'loading': false,
            'error': true,
            'errorMessage': message
        });

        this.trigger('aff:amazon-import:search:results:item:error', this);
    }
});

exports.default = SearchResultsItem;

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _searchResultsItem = require('./search-results-item');

var _searchResultsItem2 = _interopRequireDefault(_searchResultsItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchResults = Backbone.Collection.extend({
    model: _searchResultsItem2.default,

    /**
     * Initialize the search results.
     *
     * @since 0.9
     * @public
     */
    initialize: function initialize() {
        this.on('sync', this.initImportListeners, this);
    },


    /**
     * Parse the Wordpress json Ajax response.
     *
     * @since 0.9
     * @param {Array} response
     * @returns {Array}
     * @public
     */
    parse: function parse(response) {
        return response && response.success ? response.data : [];
    },

    /**
     * Import the given item.
     *
     * @since 0.9
     * @param {Object} model
     * @public
     */
    importItem: function importItem(model) {
        this.trigger('aff:amazon-import:search:results:import-item', model);
    },


    /**
     * Init the import listeners for all results items.
     *
     * @since 0.9
     * @public
     */
    initImportListeners: function initImportListeners() {
        this.forEach(this._initImportListener, this);
    },


    /**
     * Init the import listeners for the result item.
     *
     * @since 0.9
     * @private
     */
    _initImportListener: function _initImportListener(model) {
        model.on('aff:amazon-import:search:results:item:import', this.importItem, this);
    }
});

exports.default = SearchResults;

},{"./search-results-item":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _searchForm = require('./search-form');

var _searchForm2 = _interopRequireDefault(_searchForm);

var _searchLoadMore = require('./search-load-more');

var _searchLoadMore2 = _interopRequireDefault(_searchLoadMore);

var _searchResults = require('./search-results');

var _searchResults2 = _interopRequireDefault(_searchResults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Search = Backbone.Model.extend({
    defaults: {
        'started': false,
        'action': 'aff_product_admin_amazon_search',
        'page': 1
    },

    /**
     * Initialize the search with the given options.
     *
     * @since 0.9
     * @param {array} options
     */
    initialize: function initialize(options) {
        this.form = new _searchForm2.default();
        this.results = new _searchResults2.default();
        this.loadMore = new _searchLoadMore2.default();
        this.page = options && options.page ? options.page : 1;

        this.results.on('aff:amazon-import:search:results:import-item', this.import, this);
        this.form.on('aff:amazon-import:search:search-form:submit', this.start, this);
        this.loadMore.on('aff:amazon-import:search:load-more:load', this.load, this);
    },


    /**
     * Start the search with the first page.
     *
     * @since 0.9
     * @public
     */
    start: function start() {
        var _this = this;

        if (this.form.get('term') === null) {
            return;
        }

        this.set('page', 1);
        this.results.url = this._buildUrl();

        this.results.fetch().done(function (results) {
            _this.loadMore.set('enabled', _this._isLoadMoreEnabled(results));
            _this.form.done();
        }).fail(function (result) {
            var errorMessage = ((((result || {}).responseJSON || {}).data || {})[0] || {}).message || null;

            _this.form.error(errorMessage);
            _this.loadMore.set('enabled', false);
        }).always(function () {
            _this.set('started', true);
        });
    },


    /**
     * Load more search results by increasing the page.
     *
     * @since 0.9
     * @public
     */
    load: function load() {
        var _this2 = this;

        this.set('page', this.get('page') + 1);
        this.results.url = this._buildUrl();

        this.results.fetch({ 'remove': false }).done(function (results) {
            _this2.loadMore.done(_this2._isLoadMoreEnabled(results));
        }).fail(function () {
            var errorMessage = ((((result || {}).responseJSON || {}).data || {})[0] || {}).message || null;

            _this2.loadMore.error(errorMessage);
        });
    },


    /**
     * Import the given search results item.
     *
     * @since 0.9
     * @param {Object} model
     * @public
     */
    import: function _import(model) {
        this.trigger('aff:amazon-import:import-results-item', model);
    },


    /**
     * Build the search API url based on the given parameters.
     *
     * @since 0.9
     * @returns {string}
     * @private
     */
    _buildUrl: function _buildUrl() {
        return affAdminAmazonImportUrls.ajax + ('?action=' + this.get('action')) + ('&term=' + this.form.get('term')) + ('&type=' + this.form.get('type')) + ('&category=' + this.form.get('category')) + ('&with-variants=' + this.form.get('withVariants')) + ('&page=' + this.get('page'));
    },


    /**
     * Check if the load more button is enabled (visible).
     *
     * @since 0.9
     * @param {Array|null} results
     * @returns {bool}
     * @private
     */
    _isLoadMoreEnabled: function _isLoadMoreEnabled(results) {
        return results && results.data && results.data.length > 0 && this.get('page') < 5 && this.form.get('type') === 'keywords';
    }
});

exports.default = Search;

},{"./search-form":4,"./search-load-more":5,"./search-results":7}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Config = Backbone.View.extend({
    el: '#aff-amazon-import-config',

    events: {
        'change input[name="shop"]': 'changeShop',
        'change input[name="new-shop-name"]': 'changeShop',
        'change input[name="action"]': 'changeAction',
        'change input[name="merge-product-id"]': 'changeAction',
        'change input[name="replace-product-id"]': 'changeAction',
        'change input[name="status"]': 'changeStatus'
    },

    /**
     * Initialize the config.
     *
     * @since 0.9
     * @public
     */
    initialize: function initialize() {
        var template = jQuery('#aff-amazon-import-config-template');
        this.template = _.template(template.html());

        this.model.set('selectedShop', jQuery(template.html()).find('input[name="shop"]').first().val());

        this.model.on('aff:amazon-import:config:add-shop', this.addShop, this);
    },


    /**
     * Render the config.
     *
     * @since 0.9
     * @returns {Config}
     * @public
     */
    render: function render() {
        var html = this.template(this.model.attributes);
        this.$el.html(html);

        this.$el.find('.aff-amazon-import-config-group-option-merge-product-id, .aff-amazon-import-config-group-option-replace-product-id').selectize({
            maxItems: 1,
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            create: false,
            load: function load(query, callback) {
                if (!query.length) return callback();
                jQuery.ajax({
                    url: affAdminAmazonImportUrls.apiRoot + 'wp/v2/aff-products/?status=publish,draft&search=' + query,
                    type: 'GET',
                    data: {
                        'post_parent': 0
                    },
                    beforeSend: function beforeSend(xhr) {
                        xhr.setRequestHeader('X-WP-Nonce', affAdminAmazonImportUrls.nonce);
                    },
                    error: function error() {
                        callback();
                    },
                    success: function success(results) {
                        results = results.map(function (result) {
                            return {
                                'id': result.id,
                                'name': result.title.rendered
                            };
                        });

                        callback(results);
                    }
                });
            }
        });

        return this;
    },


    /**
     * Add a new shop
     *
     * @since 0.9
     * @param {Object} shop
     * @public
     */
    addShop: function addShop(shop) {
        this.$el.find('input[value="new-shop"]').parent().before('\n            <label class="aff-import-config-group-label" for="' + shop.slug + '">\n                <input id="' + shop.slug + '" class="aff-import-config-group-option" name="shop" type="radio" value="' + shop.slug + '">\n                ' + shop.name + '         \n            </label>\n        ');

        this.$el.find('input[name="shop"][value="' + shop.slug + '"]').prop("checked", true);
        this.model.set({
            'newShopName': null,
            'selectedShop': shop.slug
        });
    },


    /**
     * Load the new shop configuration into the model on change.
     *
     * @since 0.9
     * @public
     */
    changeShop: function changeShop() {
        var selectedShop = this.$el.find('input[name="shop"]:checked'),
            newShopName = this.$el.find('input[name="new-shop-name"]');

        selectedShop.val() === 'new-shop' ? newShopName.removeAttr('disabled') : newShopName.attr('disabled', 'disabled');

        this.model.set({
            'selectedShop': selectedShop.val(),
            'newShopName': newShopName.val()
        });
    },


    /**
     * Load the new action configuration into the model on change.
     *
     * @since 0.9
     * @public
     */
    changeAction: function changeAction() {
        var selectedAction = this.$el.find('input[name="action"]:checked'),
            mergeProductId = this.$el.find('input[name="merge-product-id"]'),
            replaceProductId = this.$el.find('input[name="replace-product-id"]'),
            mergeSelectize = mergeProductId.selectize()[0].selectize,
            replaceSelectize = replaceProductId.selectize()[0].selectize;

        selectedAction.val() === 'merge-product' ? mergeSelectize.enable() : mergeSelectize.disable();
        selectedAction.val() === 'replace-product' ? replaceSelectize.enable() : replaceSelectize.disable();

        this.model.set({
            'selectedAction': selectedAction.val(),
            'mergeProductId': mergeProductId.val(),
            'replaceProductId': replaceProductId.val()
        });
    },


    /**
     * Load the new status configuration into the model on change.
     *
     * @since 0.9
     * @public
     */
    changeStatus: function changeStatus() {
        var selectedStatus = this.$el.find('input[name="status"]:checked');

        this.model.set({
            'status': selectedStatus.val()
        });
    }
});

exports.default = Config;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Import = Backbone.View.extend({
    el: '#aff-amazon-import',

    /**
     * Initialize the import.
     *
     * @since 0.9
     * @public
     */
    initialize: function initialize() {
        this.search = new _search2.default({
            model: this.model.search
        });

        this.config = new _config2.default({
            model: this.model.config
        });
    },


    /**
     * Render the import.
     *
     * @since 0.9
     * @public
     */
    render: function render() {
        this.search.render();
        this.config.render();

        return this;
    }
});

exports.default = Import;

},{"./config":9,"./search":15}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var SearchForm = Backbone.View.extend({
    el: '#aff-amazon-import-search-form',

    events: {
        'change': 'change',
        'submit': 'submit'
    },

    /**
     * Initialize the search form.
     *
     * @since 0.9
     * @public
     */
    initialize: function initialize() {
        var templateHtml = jQuery('#aff-amazon-import-search-form-template').html(),
            providerConfigured = this.$el.data('provider-configured');

        this.template = _.template(templateHtml);

        this.model.set('providerConfigured', providerConfigured === true || providerConfigured === 'true');
        this.model.on('change', this.render, this);
    },


    /**
     * Render the search form.
     *
     * @since 0.9
     * @returns {SearchForm}
     * @public
     */
    render: function render() {
        this.$el.html(this.template(this.model.attributes));

        var type = this.$el.find('select[name="type"]'),
            category = this.$el.find('select[name="category"]'),
            withVariants = this.$el.find('select[name="with-variants"]');

        type.val(this.model.get('type'));
        category.val(this.model.get('category'));
        withVariants.val(this.model.get('withVariants'));

        return this;
    },


    /**
     * Submit the search form.
     *
     * @since 0.9
     * @param e
     * @public
     */
    submit: function submit(e) {
        e.preventDefault();

        this.change();
        this.model.submit();
    },


    /**
     * Load the new search parameters into the model on form change.
     *
     * @since 0.9
     * @public
     */
    change: function change() {
        var term = this.$el.find('input[name="term"]'),
            type = this.$el.find('select[name="type"]'),
            category = this.$el.find('select[name="category"]'),
            withVariants = this.$el.find('select[name="with-variants"]');

        this.model.set({
            'term': term.val(),
            'type': type.val(),
            'category': category.length !== 0 ? category.val() : this.model.get('category'),
            'withVariants': withVariants.val()
        });
    }
});

exports.default = SearchForm;

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var SearchLoadMore = Backbone.View.extend({
    el: '#aff-amazon-import-search-load-more',

    events: {
        'click .aff-import-search-load-more-button': 'load'
    },

    /**
     * Initialize the search load more.
     *
     * @since 0.9
     * @public
     */
    initialize: function initialize() {
        var templateHtml = jQuery('#aff-amazon-import-search-load-more-template').html();

        this.template = _.template(templateHtml);
        this.model.on('change', this.render, this);
    },


    /**
     * Render the search load more.
     *
     * @since 0.9
     * @return {SearchLoadMore}
     * @public
     */
    render: function render() {
        this.$el.html(this.template(this.model.attributes));

        return this;
    },


    /**
     * Enable the loading animation.
     *
     * @since 0.9
     * @public
     */
    load: function load() {
        this.model.load();
    }
});

exports.default = SearchLoadMore;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var SearchResultsItem = Backbone.View.extend({
    tagName: 'div',

    className: '',

    events: {
        'click .aff-import-search-results-item-variants-show-all': 'showAll',
        'click .aff-import-search-results-item-actions-import': 'import'
    },

    /**
     * Initialize the search results item.
     *
     * @since 0.9
     * @public
     */
    initialize: function initialize() {
        var templateHtml = jQuery('#aff-amazon-import-search-results-item-template').html();

        this.template = _.template(templateHtml);
        this.model.on('change', this.render, this);
    },


    /**
     * Render the search results item.
     *
     * @since 0.9
     * @return {SearchResultsItem}
     * @public
     */
    render: function render() {
        this.$el.html(this.template(this.model.attributes));

        return this;
    },


    /**
     * Show all hidden variants.
     *
     * @since 0.9
     * @param e
     * @public
     */
    showAll: function showAll(e) {
        e.preventDefault();

        this.$el.find('.aff-import-search-results-item-variants-show-all').hide();
        this.$el.find('.aff-import-search-results-item-variants-item').show();
    },


    /**
     * Import the search result item.
     *
     * @since 0.9
     * @param e
     * @public
     */
    import: function _import(e) {
        e.preventDefault();

        this.model.import();
    }
});

exports.default = SearchResultsItem;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _searchResultsItem = require('./search-results-item');

var _searchResultsItem2 = _interopRequireDefault(_searchResultsItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchResults = Backbone.View.extend({
    el: '#aff-amazon-import-search-results',

    /**
     * Initialize the search results.
     *
     * @since 0.9
     * @param {array} options
     * @public
     */
    initialize: function initialize(options) {
        var _this = this;

        this.collection = options.collection;

        // Bind the collection events
        this.collection.bind('reset', function () {
            return _this.render();
        });
        this.collection.bind('add', function () {
            return _this.render();
        });
        this.collection.bind('remove', function () {
            return _this.render();
        });
        this.collection.bind('sync', function () {
            return _this.render();
        });
    },


    /**
     * Render the search results.
     *
     * @since 0.9
     * @public
     */
    render: function render() {
        this._addAll();
    },


    /**
     * Add all search results items to the view.
     *
     * @since 0.9
     * @private
     */
    _addAll: function _addAll() {
        this.$el.empty();
        this.collection.forEach(this._addOne, this);
    },


    /**
     * Add one search results item to the view.
     *
     * @since 0.9
     * @private
     */
    _addOne: function _addOne(product) {
        var view = new _searchResultsItem2.default({
            model: product
        });

        this.$el.append(view.render().el);
    }
});

exports.default = SearchResults;

},{"./search-results-item":13}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _searchForm = require('./search-form');

var _searchForm2 = _interopRequireDefault(_searchForm);

var _searchLoadMore = require('./search-load-more');

var _searchLoadMore2 = _interopRequireDefault(_searchLoadMore);

var _searchResults = require('./search-results');

var _searchResults2 = _interopRequireDefault(_searchResults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Search = Backbone.View.extend({
    el: '#aff-amazon-import-search',

    /**
     * Initialize the search.
     *
     * @since 0.9
     * @public
     */
    initialize: function initialize() {
        this.form = new _searchForm2.default({
            model: this.model.form
        });

        this.results = new _searchResults2.default({
            collection: this.model.results
        });

        this.loadMore = new _searchLoadMore2.default({
            model: this.model.loadMore
        });

        this.model.on('change', this.render, this);
    },


    /**
     * Render the search.
     *
     * @since 0.9
     * @public
     */
    render: function render() {
        this.form.render();
        this.results.render();

        if (this.model.get('started')) {
            this.loadMore.render();
        }

        return this;
    }
});

exports.default = Search;

},{"./search-form":11,"./search-load-more":12,"./search-results":14}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvYW1hem9uLWltcG9ydC5qcyIsImFzc2V0cy9hZG1pbi9zcmMvYW1hem9uLWltcG9ydC9qcy9tb2RlbC9jb25maWcuanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvbW9kZWwvaW1wb3J0LmpzIiwiYXNzZXRzL2FkbWluL3NyYy9hbWF6b24taW1wb3J0L2pzL21vZGVsL3NlYXJjaC1mb3JtLmpzIiwiYXNzZXRzL2FkbWluL3NyYy9hbWF6b24taW1wb3J0L2pzL21vZGVsL3NlYXJjaC1sb2FkLW1vcmUuanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvbW9kZWwvc2VhcmNoLXJlc3VsdHMtaXRlbS5qcyIsImFzc2V0cy9hZG1pbi9zcmMvYW1hem9uLWltcG9ydC9qcy9tb2RlbC9zZWFyY2gtcmVzdWx0cy5qcyIsImFzc2V0cy9hZG1pbi9zcmMvYW1hem9uLWltcG9ydC9qcy9tb2RlbC9zZWFyY2guanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvdmlldy9jb25maWcuanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvdmlldy9pbXBvcnQuanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvdmlldy9zZWFyY2gtZm9ybS5qcyIsImFzc2V0cy9hZG1pbi9zcmMvYW1hem9uLWltcG9ydC9qcy92aWV3L3NlYXJjaC1sb2FkLW1vcmUuanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvdmlldy9zZWFyY2gtcmVzdWx0cy1pdGVtLmpzIiwiYXNzZXRzL2FkbWluL3NyYy9hbWF6b24taW1wb3J0L2pzL3ZpZXcvc2VhcmNoLXJlc3VsdHMuanMiLCJhc3NldHMvYWRtaW4vc3JjL2FtYXpvbi1pbXBvcnQvanMvdmlldy9z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TyxnQ0FBc0I7QUFDN0IsbUJBQU87QUFEc0IsU0FBdEIsQ0FBWDs7QUFJQSxhQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLEtBQUssTUFBTCxHQUFjLEVBQTlCO0FBQ0g7QUFyRG9DLENBQXJCLENBQXBCOztrQkF3RGUsYTs7Ozs7Ozs7O0FDMURmOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBSSxTQUFTLFNBQVMsSUFBVCxDQUFjLE1BQWQsQ0FBcUI7QUFDOUIsUUFBSSwyQkFEMEI7O0FBRzlCOzs7Ozs7QUFNQSxjQVQ4Qix3QkFTakI7QUFDVCxhQUFLLElBQUwsR0FBWSx5QkFBZTtBQUN2QixtQkFBTyxLQUFLLEtBQUwsQ0FBVztBQURLLFNBQWYsQ0FBWjs7QUFJQSxhQUFLLE9BQUwsR0FBZSw0QkFBa0I7QUFDN0Isd0JBQVksS0FBSyxLQUFMLENBQVc7QUFETSxTQUFsQixDQUFmOztBQUlBLGFBQUssUUFBTCxHQUFnQiw2QkFBbUI7QUFDL0IsbUJBQU8sS0FBSyxLQUFMLENBQVc7QUFEYSxTQUFuQixDQUFoQjs7QUFJQSxhQUFLLEtBQUwsQ0FBVyxFQUFYLENBQWMsUUFBZCxFQUF3QixLQUFLLE1BQTdCLEVBQXFDLElBQXJDO0FBQ0gsS0F2QjZCOzs7QUF5QjlCOzs7Ozs7QUFNQSxVQS9COEIsb0JBK0JyQjtBQUNMLGFBQUssSUFBTCxDQUFVLE1BQVY7QUFDQSxhQUFLLE9BQUwsQ0FBYSxNQUFiOztBQUVBLFlBQUcsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFlLFNBQWYsQ0FBSCxFQUE4QjtBQUMxQixpQkFBSyxRQUFMLENBQWMsTUFBZDtBQUNIOztBQUVELGVBQU8sSUFBUDtBQUNIO0FBeEM2QixDQUFyQixDQUFiOztrQkEyQ2UsTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgSW1wb3J0IGZyb20gJy4vbW9kZWwvaW1wb3J0JztcbmltcG9ydCBJbXBvcnRWaWV3IGZyb20gJy4vdmlldy9pbXBvcnQnO1xuXG5sZXQgaW1wb3J0TW9kZWwgPSBuZXcgSW1wb3J0KCk7XG5sZXQgaW1wb3J0VmlldyA9IG5ldyBJbXBvcnRWaWV3KHttb2RlbDogaW1wb3J0TW9kZWx9KTtcblxuaW1wb3J0Vmlldy5yZW5kZXIoKTtcbiIsImxldCBDb25maWcgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICdzZWxlY3RlZFNob3AnOiAnYW1hem9uJyxcbiAgICAgICAgJ25ld1Nob3BOYW1lJzogbnVsbCxcbiAgICAgICAgJ3NlbGVjdGVkQWN0aW9uJzogJ25ldy1wcm9kdWN0JyxcbiAgICAgICAgJ21lcmdlUHJvZHVjdElkJzogbnVsbCxcbiAgICAgICAgJ3JlcGxhY2VQcm9kdWN0SWQnOiBudWxsLFxuICAgICAgICAnc3RhdHVzJzogJ2RyYWZ0JyxcbiAgICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZztcbiIsImltcG9ydCBTZWFyY2ggZnJvbSAnLi9zZWFyY2gnO1xuaW1wb3J0IENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5cbmxldCBJbXBvcnQgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICdhY3Rpb24nOiAnYWZmX3Byb2R1Y3RfYWRtaW5fYW1hem9uX2ltcG9ydCcsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGltcG9ydC5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IG5ldyBTZWFyY2goKTtcbiAgICAgICAgdGhpcy5jb25maWcgPSBuZXcgQ29uZmlnKCk7XG5cbiAgICAgICAgdGhpcy5zZWFyY2gub24oJ2FmZjphbWF6b24taW1wb3J0OmltcG9ydC1yZXN1bHRzLWl0ZW0nLCB0aGlzLmltcG9ydCwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEltcG9ydCB0aGUgcHJvZHVjdC5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcGFyYW0gcHJvZHVjdFxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBpbXBvcnQocHJvZHVjdCkge1xuICAgICAgICBsZXQgZGF0YSA9IHtcbiAgICAgICAgICAgICdwcm9kdWN0Jzoge1xuICAgICAgICAgICAgICAgICduYW1lJyA6IHByb2R1Y3QuYXR0cmlidXRlcy5uYW1lLFxuICAgICAgICAgICAgICAgICd0eXBlJyA6IHByb2R1Y3QuYXR0cmlidXRlcy50eXBlLFxuICAgICAgICAgICAgICAgICdzaG9wcycgOiBwcm9kdWN0LmF0dHJpYnV0ZXMuc2hvcHMsXG4gICAgICAgICAgICAgICAgJ2N1c3RvbV92YWx1ZXMnIDogcHJvZHVjdC5hdHRyaWJ1dGVzLmN1c3RvbV92YWx1ZXMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2NvbmZpZyc6IHRoaXMuY29uZmlnLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAnZm9ybSc6IHRoaXMuc2VhcmNoLmZvcm0uYXR0cmlidXRlcyxcbiAgICAgICAgfTtcblxuICAgICAgICBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6IHRoaXMuX2J1aWxkVXJsKCksXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB9KS5kb25lKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGxldCBzaG9wVGVtcGxhdGUgPSAoKHJlc3VsdCB8fCB7fSkuZGF0YSB8fCB7fSkuc2hvcF90ZW1wbGF0ZSB8fCBudWxsO1xuXG4gICAgICAgICAgICBpZihzaG9wVGVtcGxhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZy50cmlnZ2VyKCdhZmY6YW1hem9uLWltcG9ydDpjb25maWc6YWRkLXNob3AnLCBzaG9wVGVtcGxhdGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwcm9kdWN0LnNob3dTdWNjZXNzTWVzc2FnZSgpO1xuICAgICAgICB9KS5mYWlsKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvck1lc3NhZ2UgPSAoKCgocmVzdWx0IHx8IHt9KS5yZXNwb25zZUpTT04gfHwge30pLmRhdGEgfHwge30pWzBdIHx8IHt9KS5tZXNzYWdlIHx8IG51bGw7XG5cbiAgICAgICAgICAgIHByb2R1Y3Quc2hvd0Vycm9yTWVzc2FnZShlcnJvck1lc3NhZ2UpO1xuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCdWlsZCB0aGUgaW1wb3J0IHVybCBiYXNlZCBvbiB0aGUgZ2l2ZW4gcGFyYW1ldGVycy5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2J1aWxkVXJsKCkge1xuICAgICAgICByZXR1cm4gYWZmQWRtaW5BbWF6b25JbXBvcnRVcmxzLmFqYXhcbiAgICAgICAgICAgICsgYD9hY3Rpb249JHt0aGlzLmdldCgnYWN0aW9uJyl9YFxuICAgICAgICA7XG4gICAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBJbXBvcnQ7XG4iLCJsZXQgU2VhcmNoRm9ybSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgJ3Rlcm0nOiAnJyxcbiAgICAgICAgJ3R5cGUnOiAna2V5d29yZHMnLFxuICAgICAgICAnY2F0ZWdvcnknOiAnQWxsJyxcbiAgICAgICAgJ3dpdGhWYXJpYW50cyc6ICdubycsXG4gICAgICAgICdsb2FkaW5nJzogZmFsc2UsXG4gICAgICAgICdlcnJvcic6IGZhbHNlLFxuICAgICAgICAnZXJyb3JNZXNzYWdlJzogbnVsbCxcbiAgICAgICAgJ3Byb3ZpZGVyQ29uZmlndXJlZCc6IGZhbHNlXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCB0aGUgZm9ybSB0aGUgZm9ybSBhbmQgdHJpZ2dlciB0aGUgbG9hZGluZyBhbmltYXRpb24uXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHN1Ym1pdCgpIHtcbiAgICAgICAgdGhpcy5zZXQoe1xuICAgICAgICAgICAgJ2xvYWRpbmcnOiB0cnVlLFxuICAgICAgICAgICAgJ2Vycm9yJzogZmFsc2UsXG4gICAgICAgICAgICAnZXJyb3JNZXNzYWdlJzogbnVsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKCdhZmY6YW1hem9uLWltcG9ydDpzZWFyY2g6c2VhcmNoLWZvcm06c3VibWl0JywgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmlzaCB0aGUgc3VibWl0IGFuZCBzdG9wIHRoZSBsb2FkaW5nIGFuaW1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgZG9uZSgpIHtcbiAgICAgICAgdGhpcy5zZXQoJ2xvYWRpbmcnLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKCdhZmY6YW1hem9uLWltcG9ydDpzZWFyY2g6c2VhcmNoLWZvcm06ZG9uZScsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IGEgc3VibWl0IGVycm9yIGFuZCBzdG9wIHRoZSBsb2FkaW5nIGFuaW1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBtZXNzYWdlXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGVycm9yKG1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgICAgICdsb2FkaW5nJzogZmFsc2UsXG4gICAgICAgICAgICAnZXJyb3InOiB0cnVlLFxuICAgICAgICAgICAgJ2Vycm9yTWVzc2FnZSc6IG1lc3NhZ2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlcignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOnNlYXJjaC1mb3JtOmVycm9yJywgdGhpcyk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaEZvcm07XG4iLCJsZXQgU2VhcmNoTG9hZE1vcmUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICdlbmFibGVkJzogdHJ1ZSxcbiAgICAgICAgJ2xvYWRpbmcnOiBmYWxzZSxcbiAgICAgICAgJ25vUmVzdWx0cyc6IGZhbHNlLFxuICAgICAgICAnZXJyb3InOiBmYWxzZSxcbiAgICAgICAgJ2Vycm9yTWVzc2FnZSc6IG51bGwsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFjdGl2YXRlIHRoZSBsb2FkaW5nIHNwaW5uZXIgYW5pbWF0aW9uLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBsb2FkKCkge1xuICAgICAgICB0aGlzLnNldCgnbG9hZGluZycsIHRydWUpO1xuICAgICAgICB0aGlzLnRyaWdnZXIoJ2FmZjphbWF6b24taW1wb3J0OnNlYXJjaDpsb2FkLW1vcmU6bG9hZCcsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRoZSBsb2FkIG1vcmUgYnV0dG9uIGFuZCBkZWFjdGl2YXRlIHRoZSBzcGlubmVyIGFuaW1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWRcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgZG9uZShlbmFibGVkID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnNldCh7XG4gICAgICAgICAgICAnbG9hZGluZyc6IGZhbHNlLFxuICAgICAgICAgICAgJ2VuYWJsZWQnOiBlbmFibGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRyaWdnZXIoJ2FmZjphbWF6b24taW1wb3J0OnNlYXJjaDpsb2FkLW1vcmU6ZG9uZScsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTaG93IHRoZSBubyByZXN1bHRzIG1lc3NhZ2UgYW5kIGRlYWN0aXZhdGUgdGhlIHNwaW5uZXIgYW5pbWF0aW9uLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBub1Jlc3VsdHMoKSB7XG4gICAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgICAgICdsb2FkaW5nJyA6IGZhbHNlLFxuICAgICAgICAgICAgJ25vUmVzdWx0cyc6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlcignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOmxvYWQtbW9yZTpuby1yZXN1bHRzJywgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYSBsb2FkIG1vcmUgZXJyb3IgYW5kIGRlYWN0aXZhdGUgdGhlIHNwaW5uZXIgYW5pbWF0aW9uLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IG1lc3NhZ2VcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgZXJyb3IobWVzc2FnZSA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5zZXQoe1xuICAgICAgICAgICAgJ2VuYWJsZWQnOiB0cnVlLFxuICAgICAgICAgICAgJ2xvYWRpbmcnOiBmYWxzZSxcbiAgICAgICAgICAgICdlcnJvcic6IHRydWUsXG4gICAgICAgICAgICAnZXJyb3JNZXNzYWdlJzogbWVzc2FnZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKCdhZmY6YW1hem9uLWltcG9ydDpzZWFyY2g6bG9hZC1tb3JlOmVycm9yJywgdGhpcyk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaExvYWRNb3JlO1xuIiwibGV0IFNlYXJjaFJlc3VsdHNJdGVtID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICBkZWZhdWx0czoge1xuICAgICAgICAnbG9hZGluZyc6IGZhbHNlLFxuICAgICAgICAnc3VjY2Vzcyc6IGZhbHNlLFxuICAgICAgICAnc3VjY2Vzc01lc3NhZ2UnOiBudWxsLFxuICAgICAgICAnZXJyb3InOiBmYWxzZSxcbiAgICAgICAgJ2Vycm9yTWVzc2FnZSc6IG51bGwsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEltcG9ydCB0aGUgc2VhcmNoIHJlc3VsdCBpdGVtLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBpbXBvcnQoKSB7XG4gICAgICAgIHRoaXMuc2V0KCdsb2FkaW5nJywgdHJ1ZSk7XG5cbiAgICAgICAgdGhpcy50cmlnZ2VyKCdhZmY6YW1hem9uLWltcG9ydDpzZWFyY2g6cmVzdWx0czppdGVtOmltcG9ydCcsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdWNjZXNzZnVsbHkgZmluaXNoIHRoZSBpbXBvcnQgd2l0aCBhbiBvcHRpb25hbCBtZXNzYWdlLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IG1lc3NhZ2VcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgc2hvd1N1Y2Nlc3NNZXNzYWdlKG1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgICAgICdsb2FkaW5nJzogZmFsc2UsXG4gICAgICAgICAgICAnc3VjY2Vzcyc6IHRydWUsXG4gICAgICAgICAgICAnc3VjY2Vzc01lc3NhZ2UnOiBtZXNzYWdlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlcignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOnJlc3VsdHM6aXRlbTpzdWNjZXNzJywgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERpc3BsYXkgYW4gZXJyb3IgZm9yIGltcG9ydCB3aXRoIGFuIG9wdGlvbmFsIG1lc3NhZ2UuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gbWVzc2FnZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzaG93RXJyb3JNZXNzYWdlKG1lc3NhZ2UgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgICAgICdsb2FkaW5nJzogZmFsc2UsXG4gICAgICAgICAgICAnZXJyb3InOiB0cnVlLFxuICAgICAgICAgICAgJ2Vycm9yTWVzc2FnZSc6IG1lc3NhZ2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudHJpZ2dlcignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOnJlc3VsdHM6aXRlbTplcnJvcicsIHRoaXMpO1xuICAgIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoUmVzdWx0c0l0ZW07XG4iLCJpbXBvcnQgU2VhcmNoUmVzdWx0SXRlbSBmcm9tICcuL3NlYXJjaC1yZXN1bHRzLWl0ZW0nO1xuXG5sZXQgU2VhcmNoUmVzdWx0cyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgICBtb2RlbDogU2VhcmNoUmVzdWx0SXRlbSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHNlYXJjaCByZXN1bHRzLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICB0aGlzLm9uKCdzeW5jJywgdGhpcy5pbml0SW1wb3J0TGlzdGVuZXJzLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGFyc2UgdGhlIFdvcmRwcmVzcyBqc29uIEFqYXggcmVzcG9uc2UuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHBhcmFtIHtBcnJheX0gcmVzcG9uc2VcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHBhcnNlOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UgJiYgcmVzcG9uc2Uuc3VjY2VzcyA/IHJlc3BvbnNlLmRhdGEgOiBbXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW1wb3J0IHRoZSBnaXZlbiBpdGVtLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtb2RlbFxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBpbXBvcnRJdGVtKG1vZGVsKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOnJlc3VsdHM6aW1wb3J0LWl0ZW0nLCBtb2RlbCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXQgdGhlIGltcG9ydCBsaXN0ZW5lcnMgZm9yIGFsbCByZXN1bHRzIGl0ZW1zLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBpbml0SW1wb3J0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLmZvckVhY2godGhpcy5faW5pdEltcG9ydExpc3RlbmVyLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5pdCB0aGUgaW1wb3J0IGxpc3RlbmVycyBmb3IgdGhlIHJlc3VsdCBpdGVtLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2luaXRJbXBvcnRMaXN0ZW5lcihtb2RlbCkge1xuICAgICAgICBtb2RlbC5vbignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOnJlc3VsdHM6aXRlbTppbXBvcnQnLCB0aGlzLmltcG9ydEl0ZW0sIHRoaXMpO1xuICAgIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hSZXN1bHRzO1xuIiwiaW1wb3J0IFNlYXJjaEZvcm0gZnJvbSAnLi9zZWFyY2gtZm9ybSc7XG5pbXBvcnQgU2VhcmNoTG9hZE1vcmUgZnJvbSAnLi9zZWFyY2gtbG9hZC1tb3JlJztcbmltcG9ydCBTZWFyY2hSZXN1bHRzIGZyb20gJy4vc2VhcmNoLXJlc3VsdHMnO1xuXG5sZXQgU2VhcmNoID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICBkZWZhdWx0czoge1xuICAgICAgICAnc3RhcnRlZCc6IGZhbHNlLFxuICAgICAgICAnYWN0aW9uJzogJ2FmZl9wcm9kdWN0X2FkbWluX2FtYXpvbl9zZWFyY2gnLFxuICAgICAgICAncGFnZScgOiAxLFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZWFyY2ggd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcGFyYW0ge2FycmF5fSBvcHRpb25zXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZShvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZm9ybSA9IG5ldyBTZWFyY2hGb3JtKCk7XG4gICAgICAgIHRoaXMucmVzdWx0cyA9IG5ldyBTZWFyY2hSZXN1bHRzKCk7XG4gICAgICAgIHRoaXMubG9hZE1vcmUgPSBuZXcgU2VhcmNoTG9hZE1vcmUoKTtcbiAgICAgICAgdGhpcy5wYWdlID0gb3B0aW9ucyAmJiBvcHRpb25zLnBhZ2UgPyBvcHRpb25zLnBhZ2UgOiAxO1xuXG4gICAgICAgIHRoaXMucmVzdWx0cy5vbignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOnJlc3VsdHM6aW1wb3J0LWl0ZW0nLCB0aGlzLmltcG9ydCwgdGhpcyk7XG4gICAgICAgIHRoaXMuZm9ybS5vbignYWZmOmFtYXpvbi1pbXBvcnQ6c2VhcmNoOnNlYXJjaC1mb3JtOnN1Ym1pdCcsIHRoaXMuc3RhcnQsIHRoaXMpO1xuICAgICAgICB0aGlzLmxvYWRNb3JlLm9uKCdhZmY6YW1hem9uLWltcG9ydDpzZWFyY2g6bG9hZC1tb3JlOmxvYWQnLCB0aGlzLmxvYWQsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydCB0aGUgc2VhcmNoIHdpdGggdGhlIGZpcnN0IHBhZ2UuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHN0YXJ0KCkge1xuICAgICAgICBpZih0aGlzLmZvcm0uZ2V0KCd0ZXJtJykgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0KCdwYWdlJywgMSk7XG4gICAgICAgIHRoaXMucmVzdWx0cy51cmwgPSB0aGlzLl9idWlsZFVybCgpO1xuXG4gICAgICAgIHRoaXMucmVzdWx0cy5mZXRjaCgpLmRvbmUoKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUuc2V0KCdlbmFibGVkJywgdGhpcy5faXNMb2FkTW9yZUVuYWJsZWQocmVzdWx0cykpO1xuICAgICAgICAgICAgdGhpcy5mb3JtLmRvbmUoKTtcbiAgICAgICAgfSkuZmFpbCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBsZXQgZXJyb3JNZXNzYWdlID0gKCgoKHJlc3VsdCB8fCB7fSkucmVzcG9uc2VKU09OIHx8IHt9KS5kYXRhIHx8IHt9KVswXSB8fCB7fSkubWVzc2FnZSB8fCBudWxsO1xuXG4gICAgICAgICAgICB0aGlzLmZvcm0uZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUuc2V0KCdlbmFibGVkJywgZmFsc2UpO1xuICAgICAgICB9KS5hbHdheXMoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXQoJ3N0YXJ0ZWQnLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgbW9yZSBzZWFyY2ggcmVzdWx0cyBieSBpbmNyZWFzaW5nIHRoZSBwYWdlLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBsb2FkKCkge1xuICAgICAgICB0aGlzLnNldCgncGFnZScsIHRoaXMuZ2V0KCdwYWdlJykgKyAxKTtcbiAgICAgICAgdGhpcy5yZXN1bHRzLnVybCA9IHRoaXMuX2J1aWxkVXJsKCk7XG5cbiAgICAgICAgdGhpcy5yZXN1bHRzLmZldGNoKHsncmVtb3ZlJzogZmFsc2V9KS5kb25lKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlLmRvbmUodGhpcy5faXNMb2FkTW9yZUVuYWJsZWQocmVzdWx0cykpO1xuICAgICAgICB9KS5mYWlsKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvck1lc3NhZ2UgPSAoKCgocmVzdWx0IHx8IHt9KS5yZXNwb25zZUpTT04gfHwge30pLmRhdGEgfHwge30pWzBdIHx8IHt9KS5tZXNzYWdlIHx8IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEltcG9ydCB0aGUgZ2l2ZW4gc2VhcmNoIHJlc3VsdHMgaXRlbS5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbW9kZWxcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgaW1wb3J0KG1vZGVsKSB7XG4gICAgICAgIHRoaXMudHJpZ2dlcignYWZmOmFtYXpvbi1pbXBvcnQ6aW1wb3J0LXJlc3VsdHMtaXRlbScsIG1vZGVsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQnVpbGQgdGhlIHNlYXJjaCBBUEkgdXJsIGJhc2VkIG9uIHRoZSBnaXZlbiBwYXJhbWV0ZXJzLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYnVpbGRVcmwoKSB7XG4gICAgICAgIHJldHVybiBhZmZBZG1pbkFtYXpvbkltcG9ydFVybHMuYWpheFxuICAgICAgICAgICAgKyBgP2FjdGlvbj0ke3RoaXMuZ2V0KCdhY3Rpb24nKX1gXG4gICAgICAgICAgICArIGAmdGVybT0ke3RoaXMuZm9ybS5nZXQoJ3Rlcm0nKX1gXG4gICAgICAgICAgICArIGAmdHlwZT0ke3RoaXMuZm9ybS5nZXQoJ3R5cGUnKX1gXG4gICAgICAgICAgICArIGAmY2F0ZWdvcnk9JHt0aGlzLmZvcm0uZ2V0KCdjYXRlZ29yeScpfWBcbiAgICAgICAgICAgICsgYCZ3aXRoLXZhcmlhbnRzPSR7dGhpcy5mb3JtLmdldCgnd2l0aFZhcmlhbnRzJyl9YFxuICAgICAgICAgICAgKyBgJnBhZ2U9JHt0aGlzLmdldCgncGFnZScpfWBcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgdGhlIGxvYWQgbW9yZSBidXR0b24gaXMgZW5hYmxlZCAodmlzaWJsZSkuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHBhcmFtIHtBcnJheXxudWxsfSByZXN1bHRzXG4gICAgICogQHJldHVybnMge2Jvb2x9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfaXNMb2FkTW9yZUVuYWJsZWQocmVzdWx0cykge1xuICAgICAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5kYXRhICYmIHJlc3VsdHMuZGF0YS5sZW5ndGggPiAwKVxuICAgICAgICAgICAgJiYgdGhpcy5nZXQoJ3BhZ2UnKSA8IDVcbiAgICAgICAgICAgICYmIHRoaXMuZm9ybS5nZXQoJ3R5cGUnKSA9PT0gJ2tleXdvcmRzJztcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2VhcmNoO1xuIiwibGV0IENvbmZpZyA9ICBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgZWw6ICcjYWZmLWFtYXpvbi1pbXBvcnQtY29uZmlnJyxcblxuICAgIGV2ZW50czoge1xuICAgICAgICAnY2hhbmdlIGlucHV0W25hbWU9XCJzaG9wXCJdJzogJ2NoYW5nZVNob3AnLFxuICAgICAgICAnY2hhbmdlIGlucHV0W25hbWU9XCJuZXctc2hvcC1uYW1lXCJdJzogJ2NoYW5nZVNob3AnLFxuICAgICAgICAnY2hhbmdlIGlucHV0W25hbWU9XCJhY3Rpb25cIl0nOiAnY2hhbmdlQWN0aW9uJyxcbiAgICAgICAgJ2NoYW5nZSBpbnB1dFtuYW1lPVwibWVyZ2UtcHJvZHVjdC1pZFwiXSc6ICdjaGFuZ2VBY3Rpb24nLFxuICAgICAgICAnY2hhbmdlIGlucHV0W25hbWU9XCJyZXBsYWNlLXByb2R1Y3QtaWRcIl0nOiAnY2hhbmdlQWN0aW9uJyxcbiAgICAgICAgJ2NoYW5nZSBpbnB1dFtuYW1lPVwic3RhdHVzXCJdJzogJ2NoYW5nZVN0YXR1cycsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGNvbmZpZy5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0galF1ZXJ5KCcjYWZmLWFtYXpvbi1pbXBvcnQtY29uZmlnLXRlbXBsYXRlJyk7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBfLnRlbXBsYXRlKHRlbXBsYXRlLmh0bWwoKSk7XG5cbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ3NlbGVjdGVkU2hvcCcsIGpRdWVyeSh0ZW1wbGF0ZS5odG1sKCkpLmZpbmQoJ2lucHV0W25hbWU9XCJzaG9wXCJdJykuZmlyc3QoKS52YWwoKSk7XG5cbiAgICAgICAgdGhpcy5tb2RlbC5vbignYWZmOmFtYXpvbi1pbXBvcnQ6Y29uZmlnOmFkZC1zaG9wJywgdGhpcy5hZGRTaG9wLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRoZSBjb25maWcuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHJldHVybnMge0NvbmZpZ31cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgaHRtbCA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC5hdHRyaWJ1dGVzKTtcbiAgICAgICAgdGhpcy4kZWwuaHRtbChodG1sKTtcblxuICAgICAgICB0aGlzLiRlbC5maW5kKCcuYWZmLWFtYXpvbi1pbXBvcnQtY29uZmlnLWdyb3VwLW9wdGlvbi1tZXJnZS1wcm9kdWN0LWlkLCAuYWZmLWFtYXpvbi1pbXBvcnQtY29uZmlnLWdyb3VwLW9wdGlvbi1yZXBsYWNlLXByb2R1Y3QtaWQnKS5zZWxlY3RpemUoe1xuICAgICAgICAgICAgbWF4SXRlbXM6IDEsXG4gICAgICAgICAgICB2YWx1ZUZpZWxkOiAnaWQnLFxuICAgICAgICAgICAgbGFiZWxGaWVsZDogJ25hbWUnLFxuICAgICAgICAgICAgc2VhcmNoRmllbGQ6ICduYW1lJyxcbiAgICAgICAgICAgIGNyZWF0ZTogZmFsc2UsXG4gICAgICAgICAgICBsb2FkKHF1ZXJ5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICghcXVlcnkubGVuZ3RoKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogYWZmQWRtaW5BbWF6b25JbXBvcnRVcmxzLmFwaVJvb3QgKyAnd3AvdjIvYWZmLXByb2R1Y3RzLz9zdGF0dXM9cHVibGlzaCxkcmFmdCZzZWFyY2g9JyArIHF1ZXJ5LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3Bvc3RfcGFyZW50JzogMCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYmVmb3JlU2VuZCh4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQLU5vbmNlJywgYWZmQWRtaW5BbWF6b25JbXBvcnRVcmxzLm5vbmNlKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MocmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMubWFwKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaWQnOiByZXN1bHQuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICduYW1lJzogcmVzdWx0LnRpdGxlLnJlbmRlcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBuZXcgc2hvcFxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzaG9wXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGFkZFNob3Aoc2hvcCkge1xuICAgICAgICB0aGlzLiRlbC5maW5kKCdpbnB1dFt2YWx1ZT1cIm5ldy1zaG9wXCJdJykucGFyZW50KCkuYmVmb3JlKGBcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cImFmZi1pbXBvcnQtY29uZmlnLWdyb3VwLWxhYmVsXCIgZm9yPVwiJHtzaG9wLnNsdWd9XCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiJHtzaG9wLnNsdWd9XCIgY2xhc3M9XCJhZmYtaW1wb3J0LWNvbmZpZy1ncm91cC1vcHRpb25cIiBuYW1lPVwic2hvcFwiIHR5cGU9XCJyYWRpb1wiIHZhbHVlPVwiJHtzaG9wLnNsdWd9XCI+XG4gICAgICAgICAgICAgICAgJHtzaG9wLm5hbWV9ICAgICAgICAgXG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICBgKTtcblxuICAgICAgICB0aGlzLiRlbC5maW5kKGBpbnB1dFtuYW1lPVwic2hvcFwiXVt2YWx1ZT1cIiR7c2hvcC5zbHVnfVwiXWApLnByb3AoXCJjaGVja2VkXCIsIHRydWUpO1xuICAgICAgICB0aGlzLm1vZGVsLnNldCh7XG4gICAgICAgICAgICAnbmV3U2hvcE5hbWUnOiBudWxsLFxuICAgICAgICAgICAgJ3NlbGVjdGVkU2hvcCc6IHNob3Auc2x1ZyxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIG5ldyBzaG9wIGNvbmZpZ3VyYXRpb24gaW50byB0aGUgbW9kZWwgb24gY2hhbmdlLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjaGFuZ2VTaG9wKCkge1xuICAgICAgICBsZXQgc2VsZWN0ZWRTaG9wID0gdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cInNob3BcIl06Y2hlY2tlZCcpLFxuICAgICAgICAgICAgbmV3U2hvcE5hbWUgPSB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwibmV3LXNob3AtbmFtZVwiXScpO1xuXG4gICAgICAgIHNlbGVjdGVkU2hvcC52YWwoKSA9PT0gJ25ldy1zaG9wJyA/IG5ld1Nob3BOYW1lLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJykgOiBuZXdTaG9wTmFtZS5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuXG4gICAgICAgIHRoaXMubW9kZWwuc2V0KHtcbiAgICAgICAgICAgICdzZWxlY3RlZFNob3AnOiBzZWxlY3RlZFNob3AudmFsKCksXG4gICAgICAgICAgICAnbmV3U2hvcE5hbWUnOiBuZXdTaG9wTmFtZS52YWwoKSxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIG5ldyBhY3Rpb24gY29uZmlndXJhdGlvbiBpbnRvIHRoZSBtb2RlbCBvbiBjaGFuZ2UuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGNoYW5nZUFjdGlvbigpIHtcbiAgICAgICAgbGV0IHNlbGVjdGVkQWN0aW9uID0gdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cImFjdGlvblwiXTpjaGVja2VkJyksXG4gICAgICAgICAgICBtZXJnZVByb2R1Y3RJZCA9IHRoaXMuJGVsLmZpbmQoJ2lucHV0W25hbWU9XCJtZXJnZS1wcm9kdWN0LWlkXCJdJyksXG4gICAgICAgICAgICByZXBsYWNlUHJvZHVjdElkID0gdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cInJlcGxhY2UtcHJvZHVjdC1pZFwiXScpLFxuICAgICAgICAgICAgbWVyZ2VTZWxlY3RpemUgPSBtZXJnZVByb2R1Y3RJZC5zZWxlY3RpemUoKVswXS5zZWxlY3RpemUsXG4gICAgICAgICAgICByZXBsYWNlU2VsZWN0aXplID0gcmVwbGFjZVByb2R1Y3RJZC5zZWxlY3RpemUoKVswXS5zZWxlY3RpemU7XG5cbiAgICAgICAgc2VsZWN0ZWRBY3Rpb24udmFsKCkgPT09ICdtZXJnZS1wcm9kdWN0JyA/IG1lcmdlU2VsZWN0aXplLmVuYWJsZSgpIDogbWVyZ2VTZWxlY3RpemUuZGlzYWJsZSgpO1xuICAgICAgICBzZWxlY3RlZEFjdGlvbi52YWwoKSA9PT0gJ3JlcGxhY2UtcHJvZHVjdCcgPyByZXBsYWNlU2VsZWN0aXplLmVuYWJsZSgpIDogcmVwbGFjZVNlbGVjdGl6ZS5kaXNhYmxlKCk7XG5cbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xuICAgICAgICAgICAgJ3NlbGVjdGVkQWN0aW9uJzogc2VsZWN0ZWRBY3Rpb24udmFsKCksXG4gICAgICAgICAgICAnbWVyZ2VQcm9kdWN0SWQnOiBtZXJnZVByb2R1Y3RJZC52YWwoKSxcbiAgICAgICAgICAgICdyZXBsYWNlUHJvZHVjdElkJzogcmVwbGFjZVByb2R1Y3RJZC52YWwoKVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgbmV3IHN0YXR1cyBjb25maWd1cmF0aW9uIGludG8gdGhlIG1vZGVsIG9uIGNoYW5nZS5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgY2hhbmdlU3RhdHVzKCkge1xuICAgICAgICBsZXQgc2VsZWN0ZWRTdGF0dXMgPSB0aGlzLiRlbC5maW5kKCdpbnB1dFtuYW1lPVwic3RhdHVzXCJdOmNoZWNrZWQnKTtcblxuICAgICAgICB0aGlzLm1vZGVsLnNldCh7XG4gICAgICAgICAgICAnc3RhdHVzJzogc2VsZWN0ZWRTdGF0dXMudmFsKCksXG4gICAgICAgIH0pO1xuICAgIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uZmlnO1xuIiwiaW1wb3J0IFNlYXJjaCBmcm9tICcuL3NlYXJjaCc7XG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnJztcblxubGV0IEltcG9ydCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICBlbDogJyNhZmYtYW1hem9uLWltcG9ydCcsXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBpbXBvcnQuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGluaXRpYWxpemUoKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gbmV3IFNlYXJjaCh7XG4gICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbC5zZWFyY2gsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY29uZmlnID0gbmV3IENvbmZpZyh7XG4gICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbC5jb25maWcsXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW5kZXIgdGhlIGltcG9ydC5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLnNlYXJjaC5yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5jb25maWcucmVuZGVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBJbXBvcnQ7XG4iLCJsZXQgU2VhcmNoRm9ybSA9ICBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgZWw6ICcjYWZmLWFtYXpvbi1pbXBvcnQtc2VhcmNoLWZvcm0nLFxuXG4gICAgZXZlbnRzOiB7XG4gICAgICAgICdjaGFuZ2UnOiAnY2hhbmdlJyxcbiAgICAgICAgJ3N1Ym1pdCc6ICdzdWJtaXQnLFxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZWFyY2ggZm9ybS5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlSHRtbCA9IGpRdWVyeSgnI2FmZi1hbWF6b24taW1wb3J0LXNlYXJjaC1mb3JtLXRlbXBsYXRlJykuaHRtbCgpLFxuICAgICAgICAgICAgcHJvdmlkZXJDb25maWd1cmVkID0gdGhpcy4kZWwuZGF0YSgncHJvdmlkZXItY29uZmlndXJlZCcpO1xuXG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBfLnRlbXBsYXRlKHRlbXBsYXRlSHRtbCk7XG5cbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoJ3Byb3ZpZGVyQ29uZmlndXJlZCcsIHByb3ZpZGVyQ29uZmlndXJlZCA9PT0gdHJ1ZSB8fCBwcm92aWRlckNvbmZpZ3VyZWQgPT09ICd0cnVlJyk7XG4gICAgICAgIHRoaXMubW9kZWwub24oJ2NoYW5nZScsIHRoaXMucmVuZGVyLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRoZSBzZWFyY2ggZm9ybS5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcmV0dXJucyB7U2VhcmNoRm9ybX1cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC5hdHRyaWJ1dGVzKSk7XG5cbiAgICAgICAgbGV0IHR5cGUgPSB0aGlzLiRlbC5maW5kKCdzZWxlY3RbbmFtZT1cInR5cGVcIl0nKSxcbiAgICAgICAgICAgIGNhdGVnb3J5ID0gdGhpcy4kZWwuZmluZCgnc2VsZWN0W25hbWU9XCJjYXRlZ29yeVwiXScpLFxuICAgICAgICAgICAgd2l0aFZhcmlhbnRzID0gdGhpcy4kZWwuZmluZCgnc2VsZWN0W25hbWU9XCJ3aXRoLXZhcmlhbnRzXCJdJyk7XG5cbiAgICAgICAgdHlwZS52YWwodGhpcy5tb2RlbC5nZXQoJ3R5cGUnKSk7XG4gICAgICAgIGNhdGVnb3J5LnZhbCh0aGlzLm1vZGVsLmdldCgnY2F0ZWdvcnknKSk7XG4gICAgICAgIHdpdGhWYXJpYW50cy52YWwodGhpcy5tb2RlbC5nZXQoJ3dpdGhWYXJpYW50cycpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3VibWl0IHRoZSBzZWFyY2ggZm9ybS5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzdWJtaXQoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5jaGFuZ2UoKTtcbiAgICAgICAgdGhpcy5tb2RlbC5zdWJtaXQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgbmV3IHNlYXJjaCBwYXJhbWV0ZXJzIGludG8gdGhlIG1vZGVsIG9uIGZvcm0gY2hhbmdlLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjaGFuZ2UoKSB7XG4gICAgICAgIGxldCB0ZXJtID0gdGhpcy4kZWwuZmluZCgnaW5wdXRbbmFtZT1cInRlcm1cIl0nKSxcbiAgICAgICAgICAgIHR5cGUgPSB0aGlzLiRlbC5maW5kKCdzZWxlY3RbbmFtZT1cInR5cGVcIl0nKSxcbiAgICAgICAgICAgIGNhdGVnb3J5ID0gdGhpcy4kZWwuZmluZCgnc2VsZWN0W25hbWU9XCJjYXRlZ29yeVwiXScpLFxuICAgICAgICAgICAgd2l0aFZhcmlhbnRzID0gdGhpcy4kZWwuZmluZCgnc2VsZWN0W25hbWU9XCJ3aXRoLXZhcmlhbnRzXCJdJyk7XG5cbiAgICAgICAgdGhpcy5tb2RlbC5zZXQoe1xuICAgICAgICAgICAgJ3Rlcm0nOiB0ZXJtLnZhbCgpLFxuICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLnZhbCgpLFxuICAgICAgICAgICAgJ2NhdGVnb3J5JzogY2F0ZWdvcnkubGVuZ3RoICE9PSAwID8gY2F0ZWdvcnkudmFsKCkgOiB0aGlzLm1vZGVsLmdldCgnY2F0ZWdvcnknKSxcbiAgICAgICAgICAgICd3aXRoVmFyaWFudHMnOiB3aXRoVmFyaWFudHMudmFsKClcbiAgICAgICAgfSk7XG4gICAgfSxcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTZWFyY2hGb3JtO1xuIiwibGV0IFNlYXJjaExvYWRNb3JlID0gIEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICBlbDogJyNhZmYtYW1hem9uLWltcG9ydC1zZWFyY2gtbG9hZC1tb3JlJyxcblxuICAgIGV2ZW50czoge1xuICAgICAgICAnY2xpY2sgLmFmZi1pbXBvcnQtc2VhcmNoLWxvYWQtbW9yZS1idXR0b24nOiAnbG9hZCcsXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHNlYXJjaCBsb2FkIG1vcmUuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZUh0bWwgPSBqUXVlcnkoJyNhZmYtYW1hem9uLWltcG9ydC1zZWFyY2gtbG9hZC1tb3JlLXRlbXBsYXRlJykuaHRtbCgpO1xuXG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSBfLnRlbXBsYXRlKHRlbXBsYXRlSHRtbCk7XG4gICAgICAgIHRoaXMubW9kZWwub24oJ2NoYW5nZScsIHRoaXMucmVuZGVyLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVuZGVyIHRoZSBzZWFyY2ggbG9hZCBtb3JlLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEByZXR1cm4ge1NlYXJjaExvYWRNb3JlfVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuJGVsLmh0bWwodGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsLmF0dHJpYnV0ZXMpKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIHRoZSBsb2FkaW5nIGFuaW1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgbG9hZCgpIHtcbiAgICAgICAgdGhpcy5tb2RlbC5sb2FkKCk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaExvYWRNb3JlO1xuIiwibGV0IFNlYXJjaFJlc3VsdHNJdGVtID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuXG4gICAgY2xhc3NOYW1lOiAnJyxcblxuICAgIGV2ZW50czoge1xuICAgICAgICAnY2xpY2sgLmFmZi1pbXBvcnQtc2VhcmNoLXJlc3VsdHMtaXRlbS12YXJpYW50cy1zaG93LWFsbCc6ICdzaG93QWxsJyxcbiAgICAgICAgJ2NsaWNrIC5hZmYtaW1wb3J0LXNlYXJjaC1yZXN1bHRzLWl0ZW0tYWN0aW9ucy1pbXBvcnQnOiAnaW1wb3J0J1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBzZWFyY2ggcmVzdWx0cyBpdGVtLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICBsZXQgdGVtcGxhdGVIdG1sID0galF1ZXJ5KCcjYWZmLWFtYXpvbi1pbXBvcnQtc2VhcmNoLXJlc3VsdHMtaXRlbS10ZW1wbGF0ZScpLmh0bWwoKTtcblxuICAgICAgICB0aGlzLnRlbXBsYXRlID0gXy50ZW1wbGF0ZSh0ZW1wbGF0ZUh0bWwpO1xuICAgICAgICB0aGlzLm1vZGVsLm9uKCdjaGFuZ2UnLCB0aGlzLnJlbmRlciwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aGUgc2VhcmNoIHJlc3VsdHMgaXRlbS5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcmV0dXJuIHtTZWFyY2hSZXN1bHRzSXRlbX1cbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLiRlbC5odG1sKHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC5hdHRyaWJ1dGVzKSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNob3cgYWxsIGhpZGRlbiB2YXJpYW50cy5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzaG93QWxsKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy5hZmYtaW1wb3J0LXNlYXJjaC1yZXN1bHRzLWl0ZW0tdmFyaWFudHMtc2hvdy1hbGwnKS5oaWRlKCk7XG4gICAgICAgIHRoaXMuJGVsLmZpbmQoJy5hZmYtaW1wb3J0LXNlYXJjaC1yZXN1bHRzLWl0ZW0tdmFyaWFudHMtaXRlbScpLnNob3coKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW1wb3J0IHRoZSBzZWFyY2ggcmVzdWx0IGl0ZW0uXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHBhcmFtIGVcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgaW1wb3J0KGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMubW9kZWwuaW1wb3J0KCk7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaFJlc3VsdHNJdGVtO1xuIiwiaW1wb3J0IFNlYXJjaFJlc3VsdHNJdGVtIGZyb20gJy4vc2VhcmNoLXJlc3VsdHMtaXRlbSc7XG5cbmxldCBTZWFyY2hSZXN1bHRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIGVsOiAnI2FmZi1hbWF6b24taW1wb3J0LXNlYXJjaC1yZXN1bHRzJyxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHNlYXJjaCByZXN1bHRzLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwYXJhbSB7YXJyYXl9IG9wdGlvbnNcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZShvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjtcblxuICAgICAgICAvLyBCaW5kIHRoZSBjb2xsZWN0aW9uIGV2ZW50c1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYmluZCgncmVzZXQnLCAoKSA9PiB0aGlzLnJlbmRlcigpKTtcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uLmJpbmQoJ2FkZCcsICgpID0+IHRoaXMucmVuZGVyKCkpO1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uYmluZCgncmVtb3ZlJywgKCkgPT4gdGhpcy5yZW5kZXIoKSk7XG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5iaW5kKCdzeW5jJywgKCkgPT4gdGhpcy5yZW5kZXIoKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aGUgc2VhcmNoIHJlc3VsdHMuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5fYWRkQWxsKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBhbGwgc2VhcmNoIHJlc3VsdHMgaXRlbXMgdG8gdGhlIHZpZXcuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkQWxsKCkge1xuICAgICAgICB0aGlzLiRlbC5lbXB0eSgpO1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb24uZm9yRWFjaCh0aGlzLl9hZGRPbmUsIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgb25lIHNlYXJjaCByZXN1bHRzIGl0ZW0gdG8gdGhlIHZpZXcuXG4gICAgICpcbiAgICAgKiBAc2luY2UgMC45XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYWRkT25lKHByb2R1Y3QpIHtcbiAgICAgICAgbGV0IHZpZXcgPSBuZXcgU2VhcmNoUmVzdWx0c0l0ZW0oe1xuICAgICAgICAgICAgbW9kZWw6IHByb2R1Y3QsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuJGVsLmFwcGVuZCh2aWV3LnJlbmRlcigpLmVsKTtcbiAgICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaFJlc3VsdHM7XG4iLCJpbXBvcnQgU2VhcmNoRm9ybSBmcm9tICcuL3NlYXJjaC1mb3JtJztcbmltcG9ydCBTZWFyY2hMb2FkTW9yZSBmcm9tICcuL3NlYXJjaC1sb2FkLW1vcmUnO1xuaW1wb3J0IFNlYXJjaFJlc3VsdHMgZnJvbSAnLi9zZWFyY2gtcmVzdWx0cyc7XG5cbmxldCBTZWFyY2ggPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgZWw6ICcjYWZmLWFtYXpvbi1pbXBvcnQtc2VhcmNoJyxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIHNlYXJjaC5cbiAgICAgKlxuICAgICAqIEBzaW5jZSAwLjlcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgdGhpcy5mb3JtID0gbmV3IFNlYXJjaEZvcm0oe1xuICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWwuZm9ybSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZXN1bHRzID0gbmV3IFNlYXJjaFJlc3VsdHMoe1xuICAgICAgICAgICAgY29sbGVjdGlvbjogdGhpcy5tb2RlbC5yZXN1bHRzLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvYWRNb3JlID0gbmV3IFNlYXJjaExvYWRNb3JlKHtcbiAgICAgICAgICAgIG1vZGVsOiB0aGlzLm1vZGVsLmxvYWRNb3JlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm1vZGVsLm9uKCdjaGFuZ2UnLCB0aGlzLnJlbmRlciwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aGUgc2VhcmNoLlxuICAgICAqXG4gICAgICogQHNpbmNlIDAuOVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuZm9ybS5yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5yZXN1bHRzLnJlbmRlcigpO1xuXG4gICAgICAgIGlmKHRoaXMubW9kZWwuZ2V0KCdzdGFydGVkJykpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUucmVuZGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNlYXJjaDtcbiJdfQ==
