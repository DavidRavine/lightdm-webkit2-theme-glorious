class L10nElement extends HTMLElement
{
    constructor()
    {
        super();
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
        if (this.attr !== false) {
            for(let el of this.children) {
                if ( el.hasAttribute(this.attr) ) {
                    el.setAttribute( this.attr, this._translateText(el.getAttribute(this.attr)) );
                }
            }
        }
        else if (this.context) {
            this.innerHTML = this._translateTextInContext(this.innerHTML, this.context)
        }
        else {
            this.innerHTML = this._translateText(this.innerHTML);
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

