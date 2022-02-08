class LanguagePack
{
    constructor()
    {
        this._packages = {};
    }

    register(languageId, values) {
        if (typeof languageId !== typeof '' || typeof values !== typeof {})
            return;
        this._packages[languageId] = values;
    }
}

export const languagePack = new LanguagePack();
