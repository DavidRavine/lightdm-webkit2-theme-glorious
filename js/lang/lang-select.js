// JSPOT:NOPARSE
class LangSelect extends HTMLElement
{
    constructor()
    {
        super();
        this._selectedLanguage = l10n.getCurrentLanguage();
        this._selectEl = null;
        this._defaultSelected = null;
        this._switchLanguage = this._switchLanguage.bind(this);
        this._toggleMenu = this._toggleMenu.bind(this);
        this._onChange = this._onChange.bind(this);
    }

    connectedCallback()
    {
        // Using a fieldset because select element seems to make web-greeter crash
        this._selectEl = document.createElement('fieldset');
        if (this.dataset.id) {
            this._selectEl.setAttribute('id', this.dataset.id);
        }

        l10n.onLanguageChanged(this._onChange)

        for (let lang of l10n.getAvailableLanguages()) {
            const optLabel = document.createElement('label');
            const optEl = document.createElement('input');
            optEl.setAttribute('type', 'radio');
            optEl.setAttribute('name', 'language');
            optEl.setAttribute('value', lang);
            if (lang === this._selectedLanguage) {
                optLabel.classList.add('selected');
                optEl.setAttribute('checked', 'checked');
            }
            if (!this._defaultSelected) {
                this._defaultSelected = optEl;
            }
            optLabel.appendChild(optEl);
            optLabel.appendChild(document.createTextNode(lang));
            this._selectEl.appendChild(optLabel);
        }
        this._selectEl.addEventListener('change', this._switchLanguage);
        this._selectEl.addEventListener('click', this._toggleMenu);
        this.append(this._selectEl);
    }

    _onChange(newLanguage)
    {
        if(newLanguage !== this._selectedLanguage) {
            this._selectedLanguage = this._defaultSelected.value;
            this._selectEl.querySelector('.selected').classList.remove('selected');
            this._defaultSelected.parentElement.classList.add('selected');
        }

    }

    _switchLanguage(changeEvent)
    {
        this._selectedLanguage = changeEvent.target.value;
        l10n.updateLanguage(this._selectedLanguage);
        this._selectEl.querySelector('.selected').classList.remove('selected');
        changeEvent.target.parentElement.classList.add('selected');
        this._toggleMenu();
    }

    _toggleMenu()
    {
        this._selectEl.classList.toggle('open');
    }

}
