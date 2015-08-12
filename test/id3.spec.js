var assert = require("assert");
var csv = require('csv');
var fs = require('fs');
var createDecisionTree = require('../index');
var util = require('util');
var _ = require('underscore');

function getTestData(fileDir, done) {
  csv.parse(fs.readFileSync(fileDir), function (err, res) {
    var attributes = res[0];
    var samples = [];
    res.forEach(function (row, i) {
      if (i === 0) return; // Skip first row
      i--; // Make sure index of new array starts with 0
      samples[i] = {};
      attributes.forEach (function (attr, j) {
        samples[i][attr] = row[j];
      });
    });
    done(samples);
  });
}

describe('index', function() {
  describe('createDecisionTree()', function () {
    it('should work', function (done) {
      getTestData('testdata.csv', function (samples) {
        var tree = createDecisionTree(samples, ['Outlook', 'Temperature', 'Humidity', 'Wind'], 'Play ball');
        assert.ok(tree);
        done();
      });
    });
  });
  describe('predict()', function () {
    it('should work', function (done) {
      getTestData('testdata.csv', function (samples) {
        var tree = createDecisionTree(samples, ['Outlook', 'Temperature', 'Humidity', 'Wind'], 'Play ball');

        var prediction = tree.predict({
          Outlook: 'Sunny',
          Humidity: 'High'
        });
        assert.equal(prediction.targetAttribute, 'Play ball');
        assert.equal(prediction.value, 'No');

        var prediction = tree.predict({
          Outlook: 'Sunny',
          Humidity: 'Normal'
        });
        assert.equal(prediction.targetAttribute, 'Play ball');
        assert.equal(prediction.value, 'Yes');

        var prediction = tree.predict({
          Outlook: 'Overcast',
          Humidity: 'Normal'
        });
        assert.equal(prediction.targetAttribute, 'Play ball');
        assert.equal(prediction.value, 'Yes');

        var prediction = tree.predict({
          Outlook: 'Overcast',
          Humidity: 'High'
        });
        assert.equal(prediction.targetAttribute, 'Play ball');
        assert.equal(prediction.value, 'Yes');

        var prediction = tree.predict({
          Outlook: 'Rain',
          Wind: 'Strong',
        });
        assert.equal(prediction.targetAttribute, 'Play ball');
        assert.equal(prediction.value, 'No');

        var prediction = tree.predict({
          Outlook: 'Rain',
          Wind: 'Weak'
        });
        assert.equal(prediction.targetAttribute, 'Play ball');
        assert.equal(prediction.value, 'Yes');

        done();
      });
    });
  });
});
