# node-machinelearning-id3

Example implementation of the ID3 decision tree machine learning algorithm in JavaScript.

Usage:
```
var id3 = require('node-machinelearning-id3');

var samples = [...];
var consideredAttributes = ['A', 'B', 'C'];
var targetAttribute = 'X';

var decisionTree = id3.createDecisionTree(samples, consideredAttributes, targetAttribute);


var testSample = { ... };
var prediction = decisionTree.predict(testSample);
```

