// JSPOT:NOPARSE
class Language
{
    constructor()
    {
        this._langKey = 'Lang';
        this._langChangedCallbacks = [];
        this._languagePack = LanguagePack;
        this._languageFallback = this._getSystemLanguage();
        this._language = this._getStoredLanguage() || this._languageFallback;

    }

    getLanguagePack()
    {
        return this._languagePack;
    }

    getCurrentLanguage()
    {
        return this._language;
    }

    getAvailableLanguages()
    {
        const ctx = Object.values(this._languagePack)[0];
        const packLangs = Object.keys(Object.values(ctx)[0]);
        return [this._languageFallback].concat(packLangs);
    }

    updateLanguage(newLanguage)
    {
        if (!newLanguage) {
            newLanguage = this._languageFallback;
        }
        this._language = newLanguage;
        this._storeLanguage();
        for(let cb of this._langChangedCallbacks) {
            cb(newLanguage);
        }
    }

    onLanguageChanged(callback)
    {
        if (typeof callback === 'function') {
            this._langChangedCallbacks.push(callback);
        }
    }

    _getSystemLanguage()
    {
        if (typeof lightdm !== typeof undefined) {
            if (lightdm.hasOwnProperty('language')) {
                let sysLang =  lightdm.language.code.toLowerCase().substring(0, 4);
                const available = this.getAvailableLanguages();
                if (!available.includes(sysLang)) {
                    for (let altLang of lightdm.languages) {
                        const altLangId = altLang.code.toLowerCase().substring(0,4)
                        if (available.includes(altLangId)) {
                            return altLangId;
                        }
                    }
                }
            }
        }
        return 'en_us';
    }
    _getStoredLanguage()
    {
        return window.localStorage.getItem(this._langKey);
    }
    _storeLanguage()
    {
        return window.localStorage.setItem(this._langKey, this._language);
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
     * If the first parameter is an integer, the target may also be an array -1 to get the full array
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
                target = params.slice(-1)[0];
            else return text;
        }

        if (typeof target == 'function') {
            value = target(...params.slice(0, params.length - 1));
        }
        else if (Array.isArray(target)) {
            if (Number.isInteger(params[0])) {
                if (params[0] < 0){
                    value = target;
                }
                else {
                    if (params[0] >= target.length) {
                        value = target[target.length - 1];
                    }
                    else {
                        value = target[params[0]];
                    }
                }
            }
        }
        else if (typeof target === typeof '') {
            value = target;
        }

        return value;
    }

    _maybeGet(text, language = this._language)
    {
        let target = this._languagePack['global'][text];
        if (typeof target === typeof undefined) {
            return text;
        }
        target = target[language] ? target[language] : '';
        return target;
    }
}

