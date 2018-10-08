/* global Module */

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
		//header.innerHTML = this.config.title;
		header.innerHTML = "<img src='modules/MMM-Seneye/img/Seneye-Logo-Blue.png' />";
		wrapper.appendChild(header);

		var table = document.createElement("table");
		table.className = "small";

		if (this.dataRequest) {
			this.addRow(table, "Slide Expires", Math.floor(this.dataRequest.status.slide_expires / 1000 / 60 / 60 / 24), " days", "");

			if (this.config.readings.temperature) this.addRow(table, "Temperature", this.dataRequest.exps.temperature.curr, "&deg;C", this.dataRequest.exps.temperature.trend);

			if (this.config.readings.ph) this.addRow(table, "pH", this.dataRequest.exps.ph.curr, "", this.dataRequest.exps.ph.trend);

			if (this.config.readings.nh3) this.addRow(table, "NH<sub>3</sub>", this.dataRequest.exps.nh3.curr, "", this.dataRequest.exps.nh3.trend);

			if (this.config.readings.nh4) this.addRow(table, "NH<sub>4</sub><sup>+</sup>", this.dataRequest.exps.nh4.curr, "", this.dataRequest.exps.nh4.trend);

			if (this.config.readings.o2) this.addRow(table, "O<sub>2</sub>", this.dataRequest.exps.o2.curr, "", this.dataRequest.exps.o2.trend);

			if (this.config.readings.lux) this.addRow(table, "LUX", this.dataRequest.exps.lux.curr, "", this.dataRequest.exps.lux.trend);

			if (this.config.readings.par) this.addRow(table, "PAR", this.dataRequest.exps.par.curr, "", this.dataRequest.exps.par.trend);

			if (this.config.readings.kelvin) this.addRow(table, "Kelvin", this.dataRequest.exps.kelvin.curr, "", this.dataRequest.exps.kelvin.trend);

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

	addRow: function (table, label, value, suffix, trend) {
		var row = document.createElement("tr");
		row.className = "normal";

		var labeltd = document.createElement("td");
		labeltd.className = "bright";

		var valuetd = document.createElement("td");
		valuetd.className = "grey";

		switch (trend) {
			case "0":
				var icon = "<i class='fa fa-fw fa-pause-circle fa-rotate-90'></i>";
				break;
			case "1":
				var icon = "<i class='fa fa-fw fa-arrow-circle-up'></i>";
				break;
			case "-1":
				var icon = "<i class='fa fa-fw fa-arrow-circle-down'></i>";
				break;
			default:
				var icon = "<i class='fa fa-fw fa-square'></i>";
				break;
		}

		labeltd.innerHTML = label;
		valuetd.innerHTML = value + suffix + icon;

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
