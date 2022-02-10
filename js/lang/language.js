class Language
{
    constructor()
    {
        this._localStorage = window.localStorage;
        this._languageFallback = 'en_us';
        this._language = this._getStorageItem('Lang') || this._languageFallback;

        this._language = 'de_de';
        this._languagePack = LanguagePack;
    }

    _getStorageItem(item)
    {
        return this._localStorage.getItem(String(item));
    }

    __(text)
    {
        const target = this._maybeGet(text);
        return target && target.length > 0 ? target : text;
    }
    
    _x(text, context)
    {
        let target = this._languagePack[context];
        if (typeof target === typeof undefined)
            return text;
        target = target[text];
        if (typeof target === typeof undefined)
            return text;
        const value = target[this._language];

        return value && value.length > 0 ? value : (target[this._languageFallback] && target[this._languageFallback].length > 0 ? target[this._languageFallback] : text);
    }

    /**
     * Get a sring based on parameter
     *
     * The target should be a function taking the specified number of parameters (-1) as arguments
     * If the first parameter is an integer, the target may also be an array
     * The last parameter is used as the default value
     */
    _p(text, ...params)
    {
        let value = text;
        let target = this._maybeGet(text);
        if (typeof target === typeof '')
            target = this._maybeGet(text, this._languageFallback);
        if (typeof target === typeof '') {
            if (params.length >= 1)
                target = params.slice(-1);
            else return text;
        }

        if (typeof target == 'function') {
            value = target(...params.slice(0, params.length - 1));
        }
        else if (Array.isArray(target)) {
            if (Number.isInteger(params[0])) {
                value = target[params[0]]
            }
        }

        return value;
    }

    _maybeGet(text, language = this._language)
    {
        let target = this._languagePack['global'][text];
        if (typeof target === typeof undefined) {
            return text;
        }
        target = target[language];
        return target;
    }
}

