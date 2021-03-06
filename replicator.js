// Define an array named `properties` with objects representing
// the user-adjustable inputs to your application
var properties = [
  {type: 'range', id: 'Columns', value: 2, min: 1, max: 10, step: 1},
  {type: 'range', id: 'Rows', value: 2, min: 1, max: 10, step: 1},
  {type: 'range', id: 'Spacing (in)', value: 0.5, min: 0, max: 1, step: 0.001},
];

// flip a point vertically to the SVG coordinate system where +Y is down
var convertPointToSvgCoordinates = function(point, height) {
  return [point[0], height - point[1]];
};

var convertPointArraysToSvgCoordinates = function(pointArrays, height) {
  return pointArrays.map(function(pointArray) {
    return pointArray.map(function(point) {
      return convertPointToSvgCoordinates(point, height);
    });
  });
};

var offsetPoint = function(point, dx, dy) {
  return [point[0] + dx, point[1] + dy];
};

var offsetPointArrays = function(pointArrays, dx, dy) {
  return pointArrays.map(function(pointArray) {
    return pointArray.map(function(point) {
      return offsetPoint(point, dx, dy);
    });
  });
};

var pathSvgDataForPointArray = function(pointArray) {
  return 'M' + pointArray.map(function(point) { return point[0] + ',' + point[1]; }).join(' ');
};

var pathSvgForPointArrays = function(pointArrays) {
  return '<path d="' + pointArrays.map(pathSvgDataForPointArray).join(' ') + '" />';
};

// Define a function named `executor` that generates a valid SVG document string
// and passes it to the provided success callback, or invokes the failure
// callback if unable to do so
var executor = function(args, success, failure) {
  var params = args[0];
  var columnCount = params['Columns'];
  var rowCount = params['Rows'];
  var spacing = params['Spacing (in)'];
  var shapeProperties = args[1]; // NOTE: This requires checking "Requires selected shape" on the Edit App page
  var shapeWidth = shapeProperties.right - shapeProperties.left;
  var shapeHeight = shapeProperties.top - shapeProperties.bottom;
  var pointArrays = offsetPointArrays(shapeProperties.pointArrays, -shapeProperties.left, -shapeProperties.bottom);
  var resultPointArrays = [];
  for (var y = 0; y < rowCount; y++) {
    for (var x = 0; x < columnCount; x++) {
      resultPointArrays.push(offsetPointArrays(pointArrays, x * (shapeWidth + spacing), y * (shapeHeight + spacing)));
    }
  }
  var width = columnCount * shapeWidth + (columnCount - 1) * spacing;
  var height = rowCount * shapeHeight + (rowCount - 1) * spacing;
  var viewBox = [0, 0, width, height].join(' ');
  resultPointArrays = resultPointArrays.map(function(pointArrays) {
    return convertPointArraysToSvgCoordinates(pointArrays, height);
  });
  var svg = [
    '<?xml version="1.0" standalone="no"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="' + width + 'in" height="' + height + 'in" viewBox="' + viewBox + '">',
    resultPointArrays.map(pathSvgForPointArrays).join(''),
    '</svg>'
  ].join('');

  success(svg);
};
