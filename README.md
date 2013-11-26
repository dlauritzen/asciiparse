# ASCII Parse

ASCII table parser written for Node.js.

## Install

Install using NPM

``` Shell
npm install asciiparse
```

## Use

asciiparse has three visible methods, based on how you store the data

``` javascript

var asciiparse = require('asciiparse');

// Read and parse a file
asciiparse.parseFile(filename, [options], callback);

// Parse buffers or strings
asciiparse.parseBuffer(buffer, [options], callback);
asciiparse.parseString(string, [options], callback);
```

## Options

The `options` field is optional and can be omitted in favor of the defaults. If options are provided, any missing values will default.

* rowSeparator        ('-'): Separator between rows
* colSeparator        ('|'): Separator between columns
* junction            ('+'): Where `rowSeparator` and `colSeparator` meet. Corners of cells and the table.
* multiline          (true): Whether body rows are separated by rowSeparator or newline
* header             (true): If false, a two-dimensional array is returned. If true, the first row is treated as column names and an array of objects keyed by column is returned
* emptyCells         (true): Whether to keep empty cells. If header is true, setting this to false may cause errors.
* multilineSeparator ('\n'): The character or string to insert between lines of a multiline cell when collapsed.
* preHeaderRows         (0): How many rows are _NOT_ header data. Values greater than 0 are edge cases I personally needed to deal with.

## Examples

### Single Line, No Header Row

```
+-----------+--------------+
| Athens    | Tue 11:14 PM |
| Las Vegas | Tue  1:14 PM |
| London    | Tue  9:14 PM |
+-----------+--------------+
```

and 

```
+-----------+--------------+
| Athens    | Tue 11:14 PM |
+-----------+--------------+
| Las Vegas | Tue  1:14 PM |
+-----------+--------------+
| London    | Tue  9:14 PM |
+-----------+--------------+
```

are equivalent in single line mode. When header mode is off, both evaluate to

``` javascript
[ ['Athens', 'Tue 11:14 PM'],
  ['Las Vegas', 'Tue 1:14 PM'],
  ['London', 'Tue 9:14 PM'] ]
```

### Single Line, Header Row

Modifying the example above to include a header row...

```
+-----------+--------------+
| City      | Time         |
+-----------+--------------+
| Athens    | Tue 11:14 PM |
| Las Vegas | Tue  1:14 PM |
| London    | Tue  9:14 PM |
+-----------+--------------+
```

evaluates to

``` javascript
[
	{ City: 'Athens', Time: 'Tue 11:14 PM' },
	{ City: 'Las Vegas', Time: 'Tue 1:14 PM' },
	{ City: 'London', Time: 'Tue 9:14 PM' },
]
```

### Multiple Line

In multiline mode, rows _MUST_ be separated by `junction` and `rowSeparator`. Otherwise all rows would be combined.


```
+--------+--------------+
| City   | Time         |
+--------+--------------+
| Athens | Tue 11:14 PM |
+--------+--------------+
| Las    | Tue  1:14 PM |
| Vegas  |              |
+--------+--------------+
| London | Tue  9:14 PM |
+--------+--------------+
```

### Custom separators

```
*====*============*====================*
; a  ; apple      ; Some longer string ;
; b  ; banana     ; hi                 ;
; c  ; carrot     ; meow               ;
; e  ; elephants  ;                    ;
*====*============*====================*
```

parses correctly, given the custom options:

``` javascript
{
	rowSeparator: '=',
	colSeparator: ';',
	junction: '*',
	
	multiline: false,
	header: false
}
```
