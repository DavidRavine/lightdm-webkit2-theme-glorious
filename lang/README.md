# Translating this theme

This theme uses a custom format (loosely inspired by gettext) to translate its strings. Here's how to use it:

## Adding a new language
To add a new language, do the following:
 - Create a new file `<YOUR-LANGUAGE-CODE>.jspo` where `<YOUR-LANGUAGE-CODE>` is something like `en_us` or `de_de` etc.
 - Copy the contents of `language-pack.jspot`
 - **Important:** At the top of the file, add your language code with a dot after "LanguagePack" e.g. `LanguagePack.de_de = {`
 - Translate according to the following section

 ## Translating
 `jspo` is basically a subset of `javascript`, meaning the syntax is the same, but some restrictions apply.

There are two types of translations: direct, and parameterized.

### Basic
Direct translations are straightforward: simply set the translation of the key as the value.
```javascript
    "Example String": "Beispielzeichekette",
```
Single line comments may provide additional information (Translators' Notes)
```javascript
    // TN: The display format for the current date
    "%D, %M %o, %y": "",
```
*Note: Only `//` comments are supported*

Curly braces denote contexts:
```javascript
    "Sidebar": {
        // Translates "Example String" in the context of "Sidebar"
        "Example String": "Beispielzeichenkette",
    },
```
### Parameterized
If a key is associated with a dummy-function in the `jspot`-file, you are looking at a parameterized translation.
These may take one of 3 types of values:

- A string (ignore the parameter)
```javascript
    // TN: Day names (starting on Sunday)
   "%D": "Every day is the same to me"
```
- An array of strings (if the first parameter is a number)
```javascript
    // TN: Day names (starting on Sunday)
   "%D": ["Sonntag", "Montag", "Dienstag"]
```
- An arrow-function, taking the arguments given by the `jspot`-file
```javascript
    // TN: Day names (starting on Sunday)
   "%D": (arg1) => {
       if (arg1 % 2 === 0) {
           return "Even Day";
       }
       else {
           return "Odd Day";
       }
   },
```
Since the Key (here `%D`) is not literally in the theme, the translator's notes should give some indication what is being translated.

Take a look at existing `.jspo` files for examples

## Adding new strings to existing languages
As of yet, you'll have to manually compare your language's `.jspo` with the `.jspot`-file and add any missing keys.

## Compiling the translations
To actually see the translations in the theme, run this in the same directory where the translations are:
```shell
$ python3 jspo.py
```
This compiles all the jspo-files into a single javascript-file included by the theme.

**If there are errors during this process, check that the syntax follows the above rules. If it does, it's probably a mistake in jspo.py. Try to fix it, or Pull Request with a comment telling me to fix it.**
