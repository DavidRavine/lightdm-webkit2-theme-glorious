// JSPOT:NOPARSE
class L10nElement extends HTMLElement
{
    constructor()
    {
        super();
        this._originalText = '';
        this._updateText = this._updateText.bind(this);
    }

    get attr()
    {
        return this.hasAttribute('attr') ? this.getAttribute('attr') : false;
    }
    set attr(attributeName)
    {
        if (typeof attributeName === typeof '' && attributeName.length > 0) {
            this.setAttribute('attr', attributeName);
        }
    }
    get context()
    {
        return this.hasAttribute('context') ? this.getAttribute('context') : false;
    }
    set context(contextName) {
        if (typeof contextName == typeof '' && contextName.length > 0) {
            this.setAttribute('context', contextName);
        }
    }

    connectedCallback()
    {
        if (typeof l10n !== typeof undefined) {
            l10n.onLanguageChanged(this._updateText);
        }

        this._updateText();
    }

    _updateText()
    {
        if (this.attr !== false) {
            for(let el of this.children) {
                if ( el.hasAttribute(this.attr) ) {
                    if (this._originalText === '') {
                        this._originalText = el.getAttribute(this.attr);
                    }
                    el.setAttribute( this.attr, this._translateText(this._originalText) );
                }
            }
        }
        else if (this.context) {
            if (this._originalText === '') {
                this._originalText = this.innerHTML;
            }
            this.innerHTML = this._translateTextInContext(this._originalText, this.context)
        }
        else {
            if (this._originalText === '') {
                this._originalText = this.innerHTML;
            }
            this.innerHTML = this._translateText(this._originalText);
        }
    }

    _translateText(text)
    {
        if (typeof l10n !== typeof undefined) {
            return l10n.__(text);
        }
        return text;
    }
    _translateTextInContext(text, context) {
        if (typeof l10n !== typeof undefined) {
            return l10n._x(text, context);
        }
        return text;
    }
}

