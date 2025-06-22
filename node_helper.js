const NodeHelper = require("node_helper");
const { HDate } = require("@hebcal/core");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: MMM-ClockWithHebDate");
    },

    getHebrewDate: function(config) {
        try {
            const date = new Date(config.date);
            const hDate = new HDate(date);
            
            let hebrewDate = "";
            
            // Format Hebrew date based on configuration (using Hebrew text)
            switch (config.format) {
                case "short":
                    // For short format, get just day and month in Hebrew
                    const fullHebrew = hDate.renderGematriya();
                    // Extract day and month (remove year)
                    const parts = fullHebrew.split(' ');
                    if (parts.length >= 2) {
                        hebrewDate = `${parts[0]} ${parts[1]}`;
                    } else {
                        hebrewDate = fullHebrew;
                    }
                    break;
                case "dayOnly":
                    // Just the day number in Hebrew
                    const dayHebrew = hDate.renderGematriya().split(' ')[0];
                    const monthHebrew = hDate.renderGematriya().split(' ')[1];
                    hebrewDate = `${dayHebrew} ${monthHebrew}`;
                    break;
                case "full":
                default:
                    // Full Hebrew date with day, month, and year
                    hebrewDate = hDate.renderGematriya();
                    break;
            }
            
            const result = {
                hebrewDate: hebrewDate
            };
            
            return result;
        } catch (error) {
            console.error("Error in getHebrewDate:", error);
            return {
                hebrewDate: "Hebrew date unavailable"
            };
        }
    },

    socketNotificationReceived: function(notification, payload) {
        console.log("MMM-ClockWithHebDate received notification: " + notification);
        
        if (notification === "GET_HEBREW_DATE") {
            console.log("Processing GET_HEBREW_DATE request");
            const hebrewDateInfo = this.getHebrewDate(payload);
            this.sendSocketNotification("HEBREW_DATE_RESULT", hebrewDateInfo);
        }
    }
});