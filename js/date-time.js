class DateTime {
	constructor() {
		this._localStorage = window.localStorage;
		this._sidebarClock = document.querySelector('#user-profile-clock');
		this._sidebarDate = document.querySelector('#user-profile-date');
		this._greeterMessage = document.querySelector('#greeter-message');
		this._greeterClock = document.querySelector('#greeter-clock');
		this._greeterDate = document.querySelector('#greeter-date');
		this._setTime = this._setTime.bind(this);
		this._twentyFourMode = true;
		this._clockUpdater = null;
		this._monthsArr = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		this._daysArr = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		];

		this._init();
	}

	_getDayOrdinal(day) {
        const twoDigitDay = this._prependZero(day);
        // TN: ordinal names for day numbers 1-31 (e.g. 1st 2nd 3rd 4th ...)
        return l10n._p('%o', day, twoDigitDay,
            (day, twoDigitDay) => day + ({"1":"st", "2":"nd", "3":"rd"}[twoDigitDay[1]] || "th"));
	}

	// prepend zero if k has less than 2 decimal digits
	_prependZero(k) {
		// Append 0 before time elements if less hour's than 10
		if (k < 10) {
			return '0' + k;
		} else {
			return k;
		}
	}

    _getDaytimeGreeting(hour)
    {
		if (hour >= 6 && hour < 12) {
			return 'Good Morning';
		} else if (hour >= 12 && hour < 18) {
			return 'Good Afternoon';
		}
		return 'Good Evening';
    }

	_setTime() {
		const date = new Date();
		let hour = date.getHours();
		let min = date.getMinutes();
		let midDay = null;
		let greeterSuffix = null;
		min = this._prependZero(min);

        const daytimeGreeting = l10n._p('Good day', hour, this._getDaytimeGreeting);

		// 24-hour mode
		if (this._twentyFourMode === true) {
			hour = this._prependZero(hour);
			this._sidebarClock.innerText = `${hour}:${min}`;
			this._greeterClock.innerText = `${hour}:${min}`;
		} else {
			// 12-hour mode
			midDay = (hour >= 12) ? 'PM' : 'AM';
			hour = (hour === 0) ? 12 : ((hour > 12) ? this._prependZero(hour - 12) : this._prependZero(hour));
			this._sidebarClock.innerText = `${hour}:${min} ${midDay}`;
			this._greeterClock.innerText = `${hour}:${min} ${midDay}`;
		}
		// this._sidebarDate.innerText = `${this._daysArr[date.getDay()]}, ${this._monthsArr[date.getMonth()]} ` +
		//	`${this._prependZero(date.getDate())}, ${date.getFullYear()}`;

        // TN: The display format for the current date
        this._sidebarDate.innerText = this._sprintfDate(l10n._x('%D, %M %o, %y', 'Sidebar'), date);
        // TN: The display format for the current date
        this._greeterDate.innerText = this._sprintfDate(l10n._x('%o of %M, %y', 'Lock Screen'), date);
		// this._greeterDate.innerText = `${this._getDayOrdinal(date.getDate())} of ` +
		//	`${this._monthsArr[date.getMonth()]}, ${this._daysArr[date.getDay()]}`;
		this._greeterMessage.innerText = daytimeGreeting;
	}

	_startClock() {
		this._setTime();
		this._clockUpdater = setInterval(this._setTime, 1000);
	}

	_updateClockMode() {
		clearInterval(this._clockUpdater);
		this._twentyFourMode = !this._twentyFourMode;
		this._localStorage.setItem('twentyFourMode', JSON.stringify(this._twentyFourMode));
		this._startClock();
	}

	_clockClickEvent() {
		this._greeterClock.addEventListener(
			'click',
			() => {
				console.log('toggle 24-hour clock mode');
				this._updateClockMode();
			}
		);
		this._sidebarClock.addEventListener(
			'click',
			() => {
				console.log('toggle 24-hour clock mode');
				this._updateClockMode();
			}
		);
	}

    _sprintfDate(format, date)
    {
        return format
                .replace('%D', l10n._p('%D', date.getDay(), this._daysArr) )
                .replace('%M', l10n._p('%M', date.getMonth(), this._monthsArr))
                .replace('%o', this._getDayOrdinal(date.getDate()))
                .replace('%d', this._prependZero(date.getDate()) )
                .replace('%m', this._prependZero(date.getMonth()) )
                .replace('%y', date.getFullYear());
    }

	_init() {
		this._twentyFourMode = JSON.parse(this._localStorage.getItem('twentyFourMode')) || false;
		this._startClock();
		this._clockClickEvent();
	}
}
