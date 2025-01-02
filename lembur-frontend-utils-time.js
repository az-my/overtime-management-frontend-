document.addEventListener("DOMContentLoaded", () => {
    const startTimeField = document.getElementById("startTime");
    const endTimeField = document.getElementById("endTime");
    const overtimeDateField = document.getElementById("overtimeDate");
    const dayStatusField = document.getElementById("dayStatus");

    const apiUrl = "https://dayoffapi.vercel.app/api?year=2024";

    let publicHolidays = [];
    const fetchPublicHolidays = async () => {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            publicHolidays = data.map((holiday) => holiday.tanggal);
        } catch (error) {
            console.error("Failed to fetch public holidays:", error);
        }
    };

    const isWeekend = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const isPublicHoliday = (dateString) => {
        return publicHolidays.includes(dateString);
    };

    const generateTimeOptions = (start, end) => {
        const options = [];
        for (let minutes = start; minutes <= end; minutes += 30) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            options.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
        }
        return options;
    };

    const populateStartTime = (dayStatus) => {
        startTimeField.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Please Select";
        startTimeField.appendChild(defaultOption);

        const minStartTime = dayStatus === "HK" ? 17 * 60 : 0;
        const maxStartTime = 24 * 60;

        const startOptions = generateTimeOptions(minStartTime, maxStartTime);
        startOptions.forEach((time) => {
            const option = document.createElement("option");
            option.value = time;
            option.textContent = time;
            startTimeField.appendChild(option);
        });
    };

    const populateEndTime = (startTime, dayStatus) => {
        endTimeField.innerHTML = "";
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Please Select";
        endTimeField.appendChild(defaultOption);

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMinute;

        const maxRange = dayStatus === "HK" ? 4 * 60 : 12 * 60;
        const maxEndTime = Math.min(startMinutes + maxRange, 24 * 60);

        const endOptions = generateTimeOptions(startMinutes + 30, maxEndTime);
        endOptions.forEach((time) => {
            const option = document.createElement("option");
            option.value = time;
            option.textContent = time;
            endTimeField.appendChild(option);
        });
    };

    if (overtimeDateField && dayStatusField) {
        overtimeDateField.addEventListener("change", async (event) => {
            const selectedDate = event.target.value;

            if (selectedDate) {
                if (publicHolidays.length === 0) {
                    await fetchPublicHolidays();
                }

                const status = isWeekend(selectedDate) || isPublicHoliday(selectedDate) ? "HL" : "HK";
                dayStatusField.value = status;

                populateStartTime(status);
                endTimeField.innerHTML = "";
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Please Select";
                endTimeField.appendChild(defaultOption);
            } else {
                dayStatusField.value = "";
                startTimeField.innerHTML = "";
                endTimeField.innerHTML = "";
                const defaultStartOption = document.createElement("option");
                defaultStartOption.value = "";
                defaultStartOption.textContent = "Please Select";
                startTimeField.appendChild(defaultStartOption);
                const defaultEndOption = document.createElement("option");
                defaultEndOption.value = "";
                defaultEndOption.textContent = "Please Select";
                endTimeField.appendChild(defaultEndOption);
            }
        });
    }

    if (startTimeField && endTimeField) {
        startTimeField.addEventListener("change", (event) => {
            const selectedStartTime = event.target.value;
            const dayStatus = dayStatusField.value;

            if (selectedStartTime && dayStatus) {
                populateEndTime(selectedStartTime, dayStatus);
            }
        });
    }

    fetchPublicHolidays();
});
