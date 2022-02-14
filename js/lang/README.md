# Adding translatable Items
## In JS
The Language class is instantiated globally as the `l10n` variable and should be accessible to all other scripts instantiated later.

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