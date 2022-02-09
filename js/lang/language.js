class Language
{
    constructor()
    {
        this._localStorage = window.localStorage;
        this._languageFallback = 'en_us';
        this._language = this._getStorageItem('Lang') || this._languageFallback;

        this._language = 'de_de';
        this._languagePack = window.languagePack[this._language];
    }

    _getStorageItem(item)
    {
        return this._localStorage.getItem(String(item));
    }

    __(text, context = false)
    {
        if (context)
            return this._languagePack[context][text] ? this._languagePack[context][text] : '';
        else
            return this._languagePack[text] ? this._languagePack[text] : text;
    }
}

