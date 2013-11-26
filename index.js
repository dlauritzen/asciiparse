
var _ = require('underscore');
var fs = require('fs');

var defaultOptions = {
	rowSeparator: '-', // filler that separates rows or header/body
	colSeparator: '|', // separator between header/body columns
	junction: '+', // where row and column separators meet. Never happens on rows with content
	multiline: true, // Body rows must be separated using rowSeparator/junction
	header: true, // treat first row as headers. If true, an array of objects is returned, keyed by header. If false, a two-dimensional array.
	emptyCells: true, // If true, empty cells are retained. If true, header is also recommended to be true.
	multilineSeparator: '\n', // Separator to place between lines of a multiline cell. All existing whitespace is trimmed before the separator is added.
}

var specialChars = ['+', '?', '*', '.', '[', ']', '(', ')', '-', '|'];
function escapeRegexChar(c) {
	if (_.contains(specialChars, c)) {
		return '\\' + c;
	}
	else {
		return c;
	}
}

function splitRows(input, options) {
	var junction = escapeRegexChar(options.junction);
	var rowsep = escapeRegexChar(options.rowSeparator);

	// Split by row separator
	var row_exp = new RegExp("[" + junction + rowsep + "]+\n");
	var rows = input.split(row_exp);

	if (!options.multiline) {
		var tmp = [];
		// Row separator isn't used in the table body. Split by lines
		_.each(rows, function(row) {
			tmp.push.apply(tmp, row.split('\n'));
		});
		rows = tmp;
	}
	// Remove empty "rows". This doesn't trim whitespace.
	return _.compact(rows);
}

function splitColumns(row, options) {
	if (options.multiline) {
		var subrows = row.split('\n');
		var rowcells = _.map(subrows, function(row) {
			return row.split(options.colSeparator);
		});
		// every array in rowcells should have the same length, so combine vertically
		var results = new Array(rowcells[0].length);
		for (var i = 0; i < rowcells.length; i++) {
			for (var j = 0; j < rowcells[i].length; j++) {
				var value = rowcells[i][j].trim() + options.multilineSeparator;

				if (i == 0) results[j] = value;
				else results[j] += value;
			}
		}
		row = results.join(options.colSeparator);
	}

	var cols = row.split(options.colSeparator);
	cols = _.map(cols, function(col) {
		return col.trim();
	});
	if (options.emptyCells) {
		// My split causes empty strings at each end.
		return cols.slice(1, cols.length - 1);
	}
	else {
		return _.compact(cols);
	}
}

exports.parseString = function(input, options, done) {
	if (_.isUndefined(done) && _.isFunction(options)) {
		done = options;
		options = {};
	}
	var opts = _.extend({}, defaultOptions, options);
	var cells = [];
	if (input.charAt(input.length - 1) != '\n') {
		input += '\n'; // This makes the split work better
	}
	_.each(splitRows(input, opts), function(row) {
		cells.push(splitColumns(row, opts));
	});

	if (opts.header) {
		var headerRow = cells[0];
		var rows = [];
		_.each(_.rest(cells), function(row, n) {
			if (row.length != headerRow.length) {
				// Skip row
				console.log('Row %d lengths do not match. Header has %d columns, but the row has %d.', n, headerRow.length, row.length);
				return;
			}

			var rowObj = {};
			for (var i = 0; i < row.length; i++) {
				rowObj[headerRow[i]] = row[i];
			}
			rowObj = _.omit(rowObj, ''); // remove empty column, if any. This is likely if emptyCells = true
			rows.push(rowObj);
		});
		done(null, rows);
	}
	else {
		done(null, cells);
	}
}

exports.parseBuffer = function(data, options, done) {
	exports.parseString(data.toString('utf8'), options, done);
}

exports.parseFile = function(filename, options, done) {
	if (_.isUndefined(done) && _.isFunction(options)) {
		done = options;
		options = {};
	}

	fs.readFile(filename, function(err, data) {
		if (err) return done(err);
		exports.parseBuffer(data, options, done);
	});
}
