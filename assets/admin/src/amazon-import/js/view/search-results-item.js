let SearchResultsItem = Backbone.View.extend({
    tagName: 'div',

    className: '',

    events: {
        'click .aff-amazon-import-search-results-item-variants-show-all': 'showAll'
    },

    /**
     * Initialize the search results item.
     *
     * @since 0.9
     * @public
     */
    initialize() {
        let templateHtml = jQuery('#aff-amazon-import-search-results-item-template').html();

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
    render() {
        this.setElement(this.template(this.model.attributes));

        return this;
    },

    /**
     * Show all hidden variants.
     *
     * @since 0.9
     * @param e
     * @public
     */
    showAll(e) {
        e.preventDefault();

        this.$el.find('.aff-amazon-import-search-results-item-variants-show-all').hide();
        this.$el.find('.aff-amazon-import-search-results-item-variants-item').show();
    },
});

export default SearchResultsItem;