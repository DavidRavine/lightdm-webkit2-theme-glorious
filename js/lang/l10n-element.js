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
            this.setAttribute(attributeName);
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
        else {
            this.innerHTML = this._translateText(this.innerHTML);
        }
    }

    _translateText(text)
    {
        if (typeof language !== typeof undefined) {
            return language.__(text);
        }
        return text;
    }
}

