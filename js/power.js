class Power {
	constructor() {
		this._localStorage = window.localStorage;
		this._powerList = document.querySelector('#power-list.sidebar-settings-item-list');
		this._powerObject = [];
		this._init();
	}

	_disableWindowPropagation() {
		window.addEventListener('keydown',  this._stopPropagation, true);
		window.addEventListener('keyup',    this._stopPropagation, true);
		window.addEventListener('keypress', this._stopPropagation, true);
	}

	_enableWindowPropagation() {
		window.removeEventListener('keydown',  this._stopPropagation, true);
		window.removeEventListener('keyup',    this._stopPropagation, true);
		window.removeEventListener('keypress', this._stopPropagation, true);
	}

	_createPowerObject() {
		this._powerObject = [
			{
				'name': l10n.__('Shutdown'),
				'icon': 'shutdown',
				'enabled': lightdm.can_shutdown,
				'powerCommand': lightdm.shutdown,
				'message': l10n.__('Shutting down...')
			},
			{
				'name': l10n.__('Reboot'),
				'icon': 'restart',
				'enabled': lightdm.can_restart,
				'powerCommand': lightdm.restart,
				'message': l10n.__('Rebooting...')
			},
			{
				'name': l10n.__('Hibernate'),
				'icon': 'hibernate',
				'enabled': lightdm.can_hibernate,
				'powerCommand': lightdm.hibernate,
				'message': l10n.__('Hibernating...')
			},
			{
				'name': l10n.__('Suspend'),
				'icon': 'suspend',
				'enabled': lightdm.can_suspend,
				'powerCommand': lightdm.suspend,
				'message': l10n.__('Suspending...')
			}
		];
	}

	_executePowerCallback(callback) {
		setTimeout(
			() => {
				this._enableWindowPropagation();
				callback();
			},
			1500
		);
	}

	_powerItemOnClickEvent(item, powerObj) {
		item.addEventListener(
			'click',
			() => {
				this._disableWindowPropagation();
                sidebar.hideSidebar();
                this._inputPassword = document.querySelector('#input-password');
				goodbye.showGoodbye(powerObj.icon, powerObj.message);
				this._executePowerCallback(powerObj.powerCommand);
			}
		);
	}

	_createPowerList() {
		for (let i = 0; i < this._powerObject.length; i++) {
			// If disabled, don't create a button for it
			const powerCommandEnabled = this._powerObject[parseInt(i, 10)].enabled;
			if (!powerCommandEnabled) return;
			const powerName = this._powerObject[parseInt(i, 10)].name;
			const powerCommand =  this._powerObject[parseInt(i, 10)].powerCommand;
			const powerIcon = this._powerObject[parseInt(i, 10)].icon;
			const powerMessage = this._powerObject[parseInt(i, 10)].message;
			let powerItemButton = document.createElement('button');
			powerItemButton.className = 'button-sidebar-list-item';
			powerItemButton.id = `button-sessions-item-${powerName.toLowerCase()}`;
			powerItemButton.insertAdjacentHTML(
				'beforeend',
				`
				<div class='button-sidebar-item-image-parent' id='button-powers-item-image-parent'>
					<img class='button-sidebar-item-image' id='button-powers-item-image' draggable='false' src='assets/power/${powerIcon}.svg' 
					onerror='this.src="assets/power/shutdown.svg"'></img>
				</div>
				<div class='button-sidebar-item-name' id='button-sessions-item-name'>${powerName}</div>
				`
			);
			let listItem = document.createElement('li');
			// Create on click event
			this._powerItemOnClickEvent(powerItemButton, this._powerObject[parseInt(i, 10)]);
			listItem.appendChild(powerItemButton);
			this._powerList.appendChild(listItem);
		}
	}

	_init() {
		if (!lightdm) {
			lightdm.onload = function() {
				this._usersObject = lightdm.users;
				this._createPowerObject();
			};
		} else {
			this._usersObject = lightdm.users;
			this._createPowerObject();
		}
		this._createPowerList();
	}
}
