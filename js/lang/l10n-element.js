class L10nElement extends HTMLElement
{
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        if (typeof language !== typeof undefined) {
            this.innerHTML = language.__(this.innerHTML);
        }
    }
}

