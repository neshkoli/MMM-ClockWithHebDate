Module.register("MMM-ClockWithHebDate", {
	// Local helper function for formatting time
	formatTime: function(config, time) {
		let date = moment(time);

		if (config.timezone) {
			date = date.tz(config.timezone);
		}

		if (config.timeFormat !== 24) {
			if (config.showPeriod) {
				if (config.showPeriodUpper) {
					return date.format("h:mm A");
				} else {
					return date.format("h:mm a");
				}
			} else {
				return date.format("h:mm");
			}
		}

		return date.format("HH:mm");
	},

	// Module config defaults.
	defaults: {
		timeFormat: 24,
		timezone: null,

		displaySeconds: false,
		showPeriod: false,
		showPeriodUpper: false,
		clockBold: false,
		showDate: true,
		showTime: true,
		dateFormat: "dddd, LL",
		sendNotifications: false,

		// Hebrew date options
		showHebrewDate: true,
		hebrewDateFormat: "full" // options: "full", "short", "dayOnly"
	},
	// Define required scripts.
	getScripts () {
		return ["moment.js", "moment-timezone.js"];
	},
	// Define styles.
	getStyles () {
		return ["MMM-ClockWithHebDate.css"];
	},
	// Define start sequence.
	start () {
		Log.info(`Starting module: ${this.name}`);

		// Schedule update interval.
		this.second = moment().second();
		this.minute = moment().minute();

		// Calculate how many ms should pass until next update depending on if seconds is displayed or not
		const delayCalculator = (reducedSeconds) => {
			const EXTRA_DELAY = 50; // Deliberate imperceptible delay to prevent off-by-one timekeeping errors

			if (this.config.displaySeconds) {
				return 1000 - moment().milliseconds() + EXTRA_DELAY;
			} else {
				return (60 - reducedSeconds) * 1000 - moment().milliseconds() + EXTRA_DELAY;
			}
		};

		// A recursive timeout function instead of interval to avoid drifting
		const notificationTimer = () => {
			this.updateDom();

			if (this.config.sendNotifications) {
				// If seconds is displayed CLOCK_SECOND-notification should be sent (but not when CLOCK_MINUTE-notification is sent)
				if (this.config.displaySeconds) {
					this.second = moment().second();
					if (this.second !== 0) {
						this.sendNotification("CLOCK_SECOND", this.second);
						setTimeout(notificationTimer, delayCalculator(0));
						return;
					}
				}

				// If minute changed or seconds isn't displayed send CLOCK_MINUTE-notification
				this.minute = moment().minute();
				this.sendNotification("CLOCK_MINUTE", this.minute);
			}

			setTimeout(notificationTimer, delayCalculator(0));
		};

		// Set the initial timeout with the amount of seconds elapsed as
		// reducedSeconds, so it will trigger when the minute changes
		setTimeout(notificationTimer, delayCalculator(this.second));

		// Set locale.
		if (typeof config !== "undefined" && config.language) {
			moment.locale(config.language);
		}

		// Use global timeFormat if not specifically configured
		if (this.config.timeFormat === 24 && typeof config !== "undefined" && config.timeFormat) {
			this.config.timeFormat = config.timeFormat;
		}
	},
	// Override dom generator.
	getDom () {
		const wrapper = document.createElement("div");

		/************************************
		 * Create wrappers for digital clock
		 */
		const digitalWrapper = document.createElement("div");
		digitalWrapper.className = "digital";

		/************************************
		 * Create wrappers for DIGITAL clock
		 */
		const dateTimeContainer = document.createElement("div");
		const dateContainer = document.createElement("div");
		const dateWrapper = document.createElement("div");
		const hebrewDateWrapper = document.createElement("div");
		const timeWrapper = document.createElement("div");
		const hoursWrapper = document.createElement("span");
		const minutesWrapper = document.createElement("span");
		const secondsWrapper = document.createElement("sup");
		const periodWrapper = document.createElement("span");

		// Style Wrappers
		dateTimeContainer.className = "date-time-container";
		dateContainer.className = "date-container";
		dateWrapper.className = "date normal medium";
		hebrewDateWrapper.className = "hebrew-date normal medium";
		timeWrapper.className = "time bright large light";
		hoursWrapper.className = "clock-hour-digital";
		minutesWrapper.className = "clock-minute-digital";
		secondsWrapper.className = "clock-second-digital dimmed";

		// Set content of wrappers.
		const now = moment();
		if (this.config.timezone) {
			now.tz(this.config.timezone);
		}

		// Create date and time content
		if (this.config.showDate) {
			// Regular date content
			dateWrapper.innerHTML = now.format(this.config.dateFormat);
			
			// Hebrew date content
			if (this.config.showHebrewDate) {
				let hebrewDate = "";
				
				if (this.hebrewDateInfo) {
					// Use cached Hebrew date info from node helper
					hebrewDate = this.hebrewDateInfo.hebrewDate;
				} else {
					// Fallback or initial request
					hebrewDate = "Loading...";
					// Request Hebrew date from node helper
					this.sendSocketNotification("GET_HEBREW_DATE", {
						date: now.toDate(),
						format: this.config.hebrewDateFormat
					});
				}
				
				hebrewDateWrapper.innerHTML = hebrewDate;
				
				// Add both Hebrew and regular date to date container
				dateContainer.appendChild(hebrewDateWrapper);
				dateContainer.appendChild(dateWrapper);
			} else {
				// Only regular date
				dateContainer.appendChild(dateWrapper);
			}
		}

		if (this.config.showTime) {
			let hourSymbol = "HH";
			if (this.config.timeFormat !== 24) {
				hourSymbol = "h";
			}

			hoursWrapper.innerHTML = now.format(hourSymbol);
			minutesWrapper.innerHTML = now.format("mm");

			timeWrapper.appendChild(hoursWrapper);
			if (this.config.clockBold) {
				minutesWrapper.classList.add("bold");
			} else {
				timeWrapper.innerHTML += ":";
			}
			timeWrapper.appendChild(minutesWrapper);
			secondsWrapper.innerHTML = now.format("ss");
			if (this.config.showPeriodUpper) {
				periodWrapper.innerHTML = now.format("A");
			} else {
				periodWrapper.innerHTML = now.format("a");
			}
			if (this.config.displaySeconds) {
				timeWrapper.appendChild(secondsWrapper);
			}
			if (this.config.showPeriod && this.config.timeFormat !== 24) {
				timeWrapper.appendChild(periodWrapper);
			}
		}

		// Add date and time to horizontal container if both are shown
		if (this.config.showDate && this.config.showTime) {
			dateTimeContainer.appendChild(dateContainer);
			dateTimeContainer.appendChild(timeWrapper);
			digitalWrapper.appendChild(dateTimeContainer);
		} else if (this.config.showDate) {
			digitalWrapper.appendChild(dateContainer);
		} else if (this.config.showTime) {
			digitalWrapper.appendChild(timeWrapper);
		}

		// Return the wrapper to the dom.
		wrapper.appendChild(digitalWrapper);
		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "HEBREW_DATE_RESULT") {
			this.hebrewDateInfo = payload;
			this.updateDom();
		}
	}
});
