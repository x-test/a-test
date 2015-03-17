module.exports = ->

  @Given "I go to the financial calculator", (callback) ->
    @client
    .url("http://www.audiusa.com/myaudi/finance")
    .call(callback)

  @When "I select A4 Sedan as a model", (callback) ->
    @client
    .waitForExist('select#modelYear')
    .execute("$('select#modelYear').selectBox('value', 'A4 Sedan')")
    .call(callback)

  @When "I enter 5000 as the trade in value", (callback) ->
    @client
    .waitForExist('#tradeInValue')
    .setValue('#tradeInValue', '5000')
    .call(callback)

  @When "I select 36 months in the lease term", (callback) ->
    @client
    .waitForExist('select#leaseTerm')
    .execute("$('select#leaseTerm').selectBox('value', '36')")
    .call(callback)

  @When "I select 12,000 miles in the annual mileage", (callback) ->
    @client
    .waitForExist('select#annualMileage')
    .execute("$('select#annualMileage').selectBox('value', '12000')")
    .call(callback)

  @Then "I get the correct lease summary", (callback) ->
    @client
    .waitFor('#lease-payment-value')
    .getText('#lease-payment-value')
    .should.become('$310.72')
    .call(callback)