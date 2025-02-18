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

        // TN: greeting appropriate for the current time of day
        const daytimeGreeting = l10n._p('Good day', hour, this._getDaytimeGreeting);

		// 24-hour mode
        let timeStr = `%h:${min}`;
        let timeFormat = "%t";
        if (!this._twentyFourMode) {
            // TN: display format for 12-hour mode where "%t" is the current time (e.g. "%t AM")
            timeFormat = l10n._p('%t %ampm', hour, (hour) => '%t ' + ((hour >= 12) ? 'PM' : 'AM'));
            hour = (hour > 0 && hour <= 12) ? hour : Math.abs(hour - 12);
        }
        timeStr = timeStr.replace("%h", this._prependZero(hour));
        timeFormat = timeFormat.replace("%t", timeStr);
        this._sidebarClock.innerText = timeFormat;
        this._greeterClock.innerText = timeFormat;

        // TN: The display format for the current date
        this._sidebarDate.innerText = this._sprintfDate(l10n._x('%D, %M %o, %y', 'Sidebar'), date);
        // TN: The display format for the current date
        this._greeterDate.innerText = this._sprintfDate(l10n._x('%o of %M, %y', 'Lock Screen'), date);

		this._greeterMessage.innerText = daytimeGreeting;
	}

	_startClock() {
		this._setTime();
		this._clockUpdater = setInterval(this._setTime, 1000);
	}

	_updateClockMode(twelveHourMode = false) {
		clearInterval(this._clockUpdater);
		this._twentyFourMode = !twelveHourMode;
		this._localStorage.setItem('twentyFourMode', JSON.stringify(this._twentyFourMode));
		this._startClock();
	}

    _sprintfDate(format, date)
    {
        return format
                // TN: Day names (starting on Sunday)
                .replace('%D', l10n._p('%D', date.getDay(), this._daysArr) )
                // TN: Months (starting in January)
                .replace('%M', l10n._p('%M', date.getMonth(), this._monthsArr))
                .replace('%o', this._getDayOrdinal(date.getDate()))
                .replace('%d', this._prependZero(date.getDate()) )
                .replace('%m', this._prependZero(date.getMonth()) )
                .replace('%y', date.getFullYear());
    }

	_init() {
		this._twentyFourMode = JSON.parse(this._localStorage.getItem('twentyFourMode')) || true;
		this._startClock();
	}
}
