module.exports = function () {

  this.Before(function (callback) {
    this.client
      .setViewportSize({
        width: 1280,
        height: 1024
      })
      .call(callback);
  });

  this.Given(/^I visit "([^"]*)"$/, function (url, callback) {
    this.client
      .url(url)
      .call(callback);
  });

  this.Given(/^I click "([^"]*)"$/, function (elementText, callback) {
    this.client
      .click('//*[contains(text(), "' + elementText + '")]')
      .call(callback);
  });

  this.When(/^I submit my details with the email "([^"]*)"$/, function (email, callback) {
    this.email = email;
    this.client
      .setValue('form#dealerRequest input#firstName', 'sendto')
      .setValue('form#dealerRequest input#lastName', 'all')
      .setValue('form#dealerRequest input#email', email)
      .setValue('form#dealerRequest input#phone', '5555555555')
      .setValue('form#dealerRequest input#address1', '113 7th Avenue')
      .setValue('form#dealerRequest input#zip', '94118')
      .click('form#dealerRequest button#submitButton')
      .call(callback);
  });

  this.Then(/^I see the confirmation message$/, function (callback) {
    var message = "Thank you for providing this information. Your local dealer will be contacting you shortly.";
    this.client
      .waitForExist('//*[contains(text(), "' + message + '")]', function (err, res) {
        if (err || !res) {
          callback.fail('Did not see confirmation message');
        } else {
          callback();
        }
      });
  });

  this.Then(/^I should receive an email confirming my submission$/, function (callback) {

    var ddp = this.ddp;

    var stepTimeout = setTimeout(function () {
      ddp.close();
      callback.fail('Timeout waiting for email');
    }, 30000);

    ddp.connect(function (error) {

      if (error) {
        clearTimeout(stepTimeout);
        callback.fail('Error with DDP connection' + error);
      }

      // TODO replace polling with an authenticated subscription
      var poll = setInterval(function () {

        ddp.call('getInboundEmails', [], function (e, emails) {
          if (emails[0] && emails[0].subject === 'Audi Lead Mgmt Test Data') {
            ddp.call('removeInboundEmails');
            clearTimeout(stepTimeout);
            clearInterval(poll);
            // TODO more inspections on the email here
            ddp.close();
            callback();
          }
        });

      }, 1000);

    });

  });
};

