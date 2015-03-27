module.exports = function () {

  this.Before(function (callback) {
    this.client
      .setViewportSize({
        width: 1280,
        height: 1024
      })
      .call(callback);
  });

  this.Given(/^a user visits the "([^"]*)" model landing page$/, function (model, callback) {
    this.client
      .url("http://www.audiusa.com/models/audi-" + model.toLocaleLowerCase().split(' ').join('-'), function(e, r) {
        if (e) {
          callback.fail('Page not found');
        } else {
          callback.fail('Page not found' + JSON.stringify(e)+ JSON.stringify(r));
        }
      });
  });

  this.Given(/^they requests a quote$/, function (callback) {
    this.client
      .click('//*[contains(text(), "' + "Request a Quote" + '")]')
      .call(callback);
  });

  this.When(/^they submit their details$/, function (callback) {
    this.client
      .setValue('form#dealerRequest input#firstName', 'sendto')
      .setValue('form#dealerRequest input#lastName', 'all')
      .setValue('form#dealerRequest input#email', 'audi@inbox.simian.io')
      .setValue('form#dealerRequest input#phone', '5555555555')
      .setValue('form#dealerRequest input#address1', '113 7th Avenue')
      .setValue('form#dealerRequest input#zip', '94118')
      .click('form#dealerRequest button#submitButton')
      .call(callback);
  });

  this.Then(/^They see a confirmation message$/, function (callback) {
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

  this.Then(/^I receive their details in my CRM system$/, function (callback) {

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

        ddp.call('getInboundEmails', ['audi'], function (e, emails) {

          if (e) {
            console.error('error', e);
            throw new Error(e);
          }

          if (!e && emails && emails[0] && emails[0].subject === 'Audi Lead Mgmt Test Data') {
            ddp.call('removeInboundEmails', ['audi']);
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



