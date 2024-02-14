exports.beforeGET = function () {
    const pricesByCustomerGroupHelper = require('~/cartridge/scripts/helpers/pricesByCustomerGroupHelper')
    pricesByCustomerGroupHelper.setSitePriceBook(customer)
};