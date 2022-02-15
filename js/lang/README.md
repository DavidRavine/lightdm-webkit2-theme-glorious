# Adding translatable Items
## In JS
The Language class is instantiated globally as the `l10n` variable and should be accessible to all other scripts instantiated later.

### Translators' Notes
Translator's notes are single line comments starting with `// TN:`

The string extractor will automatically associate a translation with the last Translator's note before the function call.

### Direct Translations with __(string)
The `__()` function takes one argument: the string to be translated. It is simultaneously the default return value.
```javascript
l10n.__("Example String");
```
### Contextual Translations with _x(string, context)
The `_x()` function takes two argument: the string to be translated and the context. This enables the same source string to be translated multiple different ways.

The first argument is also the default return value
```javascript
l10n._x("Example String", "Sidebar");
```

### Parameterized Translations with _p(id, ...params, default)
The `_p()` function takes at least three arguments:

The first one needs to be some unique identifier. Include a `%`-sign to indicate to translators, that it is not a direct translation.

The function then takes an arbitrary number of additional arguments, but *at least one*. These parameters will be exposed to the translators. If translators are expected to use the parameters, pass them using a descriptively named local variable.

If the first parameter is an integer, the translators may pass an array, in which case the parameter will act as the index to the array. If the index higher than the maximum index of the array, the last element will be returned. If the index is less than 0, the whole array will be returned.

Use Translators' notes to indicate what is being translated and what the expected value is (if it's relevant).
```javascript
const day = date.getDay();
const twoDigitDay = this._prependZero(day);

// TN: The current day with ordinal affix (e.g 1st, 2nd, 3rd etc.)
l10n._p("%o", day, twoDigitDay, this._getDefaultOrdinalDay);
```

The final argument is the default value. It may be a string, an array or a function.


## In HTML
Making strings in the html-template translatable is easy:
```html
<l-10n>Example String<l-10n>
```
... is equivalent to `l10n.__("Example String");`
```html
<l-10n context="Sidebar">Example String<l-10n>
```
... is equivalent to `l10n._x("Example String", "Sidebar");`

Notably however, you can translate a HTML attribute as follows:
```html
<l-10n attr="placeholder">
    <input type="text" placeholder="Example String" />
<l-10n>
```
This is still equivalent to `l10n.__("Example String);`, but the result will be written to the specified attibute (in this case `placeholder`).

## Updating the jspo Template
Run `$ python3 jspot.py` in the project root directory. this will extract all translatable strings from all html and js files in the project and create the `lang/language-pack.jspot` file.

If a file should be ignored by the extractor, add `// JSPOT:NOPARSE` at the top of it. The extractor will ignore everything in the file after that comment.

Make sure there are no errors during this process and check the file to see if your new strings and translator's notes have been included.