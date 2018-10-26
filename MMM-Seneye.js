/* global Module, document,XMLHttpRequest, Log */

/* Magic Mirror
 * Module: MMM-Seneye
 *
 * By Simon Hill
 * MIT Licensed.
 *
 * https://api.seneye.com/v1/devices/3442?IncludeState=1&user=***&pwd=***
 */

"use strict";

Module.register("MMM-Seneye", {
	result: {},
	defaults: {
		title: "Seneye",
		apiRoot: "https://api.seneye.com/v1/devices/",
		deviceID: "",
		email: "",
		password: "",
		temperatureSuffix: "C",
		logo: "blue",
		color: "#00aeef",
		readings: {
			temperature: true,
			ph: true,
			nh3: true,
			nh4: true,
			o2: false,
			lux: false,
			par: false,
			kelvin: false,
		},
		updateInterval: 300000,
		retryDelay: 5000
	},

	getStyles: function () {
		return [
			'modules/MMM-Seneye/css/MMM-Seneye.css',
			'font-awesome.css'
		]
	},

	start: function () {
		var self = this;
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function () {
			self.updateDom();
		}, this.config.updateInterval);
	},

	scheduleUpdate: function (delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad;
		var self = this;
		setTimeout(function () {
			self.getData();
		}, nextLoad);
	},

	getDom: function () {
		this.getData();

		var wrapper = document.createElement("div");
		wrapper.className = "mmm-seneye";

		var header = document.createElement("header");
		header.className = "module-header";

		if (this.config.logo == 'blue') {
			header.innerHTML = "<img src='modules/MMM-Seneye/img/Seneye-Logo-Blue.png' />";
		} else if (this.config.logo == 'white') {
			header.innerHTML = "<img src='modules/MMM-Seneye/img/Seneye-Logo-White.png' />";
		} else if (this.config.logo == 'grey') {
			header.innerHTML = "<img src='modules/MMM-Seneye/img/Seneye-Logo-Grey.png' />";
		} else {
			header.innerHTML = this.config.logo;
		}

		wrapper.appendChild(header);

		var table = document.createElement("table");
		table.className = "small";

		if (this.dataRequest) {
			var readings = this.config.readings,
				experiments = this.dataRequest.exps;

			var expDiff = this.dataRequest.status.slide_expires - Math.floor(Date.now() / 1000);

			if (expDiff < 0) {
				this.addRow(table, "Slide Expires", "<span class='red'>Expired</span>", "", "");
				wrapper.classList.add("warning");
			} else {
				var plural = '';

				if (expDiff > 1) {
					plural = 's';
				}

				this.addRow(table, "Slide Expires", Math.floor(expDiff / 60 / 60 / 24), " day" + plural, "");
				wrapper.classList.remove("warning");
			}

			if (readings.temperature) this.addRow(table, "Temperature", experiments.temperature.curr, "&deg;" + this.config.temperatureSuffix, experiments.temperature.trend, experiments.temperature.status);

			if (readings.ph) this.addRow(table, "pH", experiments.ph.curr, "", experiments.ph.trend, experiments.ph.status);

			if (readings.nh3) this.addRow(table, "NH<sub>3</sub>", experiments.nh3.curr, "", experiments.nh3.trend, experiments.nh3.status);

			if (readings.nh4) this.addRow(table, "NH<sub>4</sub><sup>+</sup>", experiments.nh4.curr, "", experiments.nh4.trend, experiments.nh4.status);

			if (readings.o2) this.addRow(table, "O<sub>2</sub>", experiments.o2.curr, "", experiments.o2.trend, experiments.o2.status);

			if (readings.lux) this.addRow(table, "LUX", experiments.lux.curr, "", "", "");

			if (readings.par) this.addRow(table, "PAR", experiments.par.curr, "", "", "");

			if (readings.kelvin) this.addRow(table, "Kelvin", experiments.kelvin.curr, "", "", "");

			var timestamp = this.dataRequest.status.last_experiment,
				date = new Date(timestamp * 1000);

			var row = document.createElement("tr");
			var td = document.createElement("td");
			td.setAttribute("colspan", "2");
			td.setAttribute("align", "right");
			td.className = "footer light";
			td.innerHTML = "Last reading: " + date.getHours() + ":" +
				date.getMinutes() + " " + date.getDate() + "/" +
				(date.getMonth() + 1) + "/" + date.getFullYear() +
				"<br /><span style='letter-spacing:0px'>" + this.dataRequest.status.slide_serial + "</span>";
			row.appendChild(td);
			table.appendChild(row);
		}

		wrapper.appendChild(table);

		return wrapper;
	},

	addRow: function (table, label, value, suffix, trend, status) {
		var row = document.createElement("tr");
		row.className = "normal";

		var labeltd = document.createElement("td");
		labeltd.className = "bright";

		var valuetd = document.createElement("td");
		valuetd.className = "grey";

		var icon;
		switch (trend) {
			case "0":
				icon = "<i class='fa fa-fw fa-pause-circle fa-rotate-90' style='color:" + this.config.color + "'></i>";
				break;
			case "1":
				icon = "<i class='fa fa-fw fa-arrow-circle-up' style='color:" + this.config.color + "'></i>";
				break;
			case "-1":
				icon = "<i class='fa fa-fw fa-arrow-circle-down' style='color:" + this.config.color + "'></i>";
				break;
			default:
				icon = "<i class='fa fa-fw fa-square'></i>";
				break;
		}

		var alert_prefix = "",
			alert_suffix = "";

		if (status === "-1") {
			alert_prefix = "<span class='red'>",
			alert_suffix = "</span>";
		}

		labeltd.innerHTML = label;
		valuetd.innerHTML = alert_prefix + value + suffix + alert_suffix + icon;

		row.appendChild(labeltd);
		row.appendChild(valuetd);
		table.appendChild(row);
	},

	getData: function () {
		var self = this;

		var urlApi = this.config.apiRoot + this.config.deviceID + "?IncludeState=1&user=" + this.config.email + "&pwd=" + this.config.password;
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},

	processData: function (data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) {
			self.updateDom(self.config.animationSpeed);
		}
		this.loaded = true;
	},
});
