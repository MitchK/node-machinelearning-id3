var _ = require('underscore');

/**
 * Calculates the log to the base of 2
 */
function log2(val) {
  if (val <= 0) {
    return 0;
  }
  return Math.log(val)/Math.log(2);
}

/**
 * Calculates the entropy of an attribute
 */
function entropy(samples, attribute) {

  // Get distinct values of attribute out of the samples
  var distinctValues = extractDistinctValues(samples, attribute);

  // For each distinct values
  return _.map(distinctValues, function (value) {

      // Get the samples where the requested attribute
      // has the value of the current iteration
      var samplesOfValue = _.filter(samples, function (sample) {
        return sample[attribute] === value;
      });

      // Get the ratio of the samples where the requested attribute
      // has the value of the current iteration
      // and the total samples length
      var p = (samplesOfValue.length / samples.length);

      return - p * log2(p);
    })
    // Sum everything up
    .reduce(function (sum, elm) { return sum + elm });
}

function gain(samples, attribute, targetAttribute) {

  // Extract distinct values for attribute
  var distinctValues = extractDistinctValues(samples, attribute);

  // Calculate entropy of target attribute
  var entropyTargetAttribute = entropy(samples, targetAttribute);

  // Calculate information gain of the requested attribute
  // regarding the target attribute
  return entropyTargetAttribute - _.map(distinctValues, function (value) {

      // Get all samples where the requested attribute has the current value
      var samplesOfValue = _.filter(samples, function (sample) {
        return sample[attribute] === value
      });

      // Multipy the weight by the entropy of the target attribute out of
      // the samples where the requested attribute has the current value
      return (samplesOfValue.length/samples.length) * entropy(samplesOfValue, targetAttribute);
    })
    // Sum everything up
    .reduce(function (sum, elm) { return sum + elm });
}

function extractDistinctValues(samples, attribute) {
  return _.uniq(samples, function (sample) {
      return sample[attribute]
    }).map(function (sample) {
      return sample[attribute];
    });
}

function bestAttribute(samples, attributes, targetAttribute) {

  // Determines the information gain for every attribute
  var attributeGains = _.map(attributes, function (attribute) {
    return {
      attribute: attribute,
      gain: gain(samples, attribute, targetAttribute)
    };
  })
  // Return the attribute with the maximum information gain
  return _.max(attributeGains, function (attributeGain) {
    return attributeGain.gain;
  }).attribute;
}

function isPure(samples, targetAttribute) {
  return extractDistinctValues(samples, targetAttribute).length === 1;
}

function predict(node, sample) {

  // If the node contains info about the
  // target attribute
  if (node.targetAttribute) {
    // this node is a result and should be returned
    return node;
  }

  // Node is not a result
  // So, find the edge with the sample's attribute
  // value
  var edge = _.find(node.edges, function (edge) {
    return edge.value === sample[node.attribute];
  });

  // Check if the edge's child node
  // has information about a target attribute
  return predict(edge.node, sample);
}

function createDecisionTree(samples, attributes, targetAttribute) {

  // Parameter checks
  if (samples.length === 0) throw Error("Empty samples set provided");
  if (attributes.length === 0) throw Error("Empty attributes set provided");
  if (!targetAttribute) throw Error('No target attribute provided');

  var root = {};
  root.predict = function (sample) {
    return predict(root, sample);
  };

  // Recursion abort criterias
  if (attributes.length === 1) {
    root.attribute = attributes[0];
    return root;
  }

  if (isPure(samples, targetAttribute)) {
    return {
      targetAttribute: targetAttribute,
      value: samples[0][targetAttribute]
    };
  }

  // Find best attribute
  var best = bestAttribute(samples, attributes, targetAttribute);

  // Create root element out of best attribute
  root.attribute = best;

  // Create edges to child nodes
  root.edges = [];

  var distinctValues = extractDistinctValues(samples, root.attribute);
  _.each(distinctValues, function (value) {
    var edge = {};
    edge.value = value;

    // The new sample list is the list where the current attribute
    // has the given value
    var newSamples = _.filter(samples, function (sample) {
      return sample[root.attribute] === value;
    });

    // Reduce the number of attributes to consider
    var newAttributes = _.without(attributes, root.attribute);

    // Recursive call
    edge.node = createDecisionTree(newSamples, newAttributes, targetAttribute);

    root.edges.push(edge);
  });

  return root;
}

module.exports = createDecisionTree;
