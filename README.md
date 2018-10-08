![GitHub](https://img.shields.io/github/license/Si-Hill/MMM-Seneye.svg?style=for-the-badge) ![GitHub package version](https://img.shields.io/github/package-json/v/Si-Hill/MMM-Seneye.svg?style=for-the-badge) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Si-Hill/MMM-Seneye.svg?style=for-the-badge) ![GitHub repo size in bytes](https://img.shields.io/github/repo-size/Si-Hill/MMM-Seneye.svg?style=for-the-badge)

# MMM-Seneye
An unofficial <a href="https://www.seneye.com/">Seneye</a> aquarium monitor module for the <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> project

## Preview
![](Screenshot1.png) ![](Screenshot2.png)

## Installation
Clone this respo into your `~/MagicMirror/modules` folder
````javascript
git clone https://github.com/Si-Hill/MMM-Seneye
````

## Using the module
Add `MMM-Seneye` module to the `modules` array in the `config/config.js` file:
````javascript
{
	"module": "MMM-Seneye",
	"position": "top_right",
	"config": {
		"deviceID": "12345",
		"email": "example@email.com",
		"password": "password",
		"readings": {
			"temperature": true,
			"ph": true,
			"nh3": true,
			"nh4": true,
			"o2": false,
			"lux": false,
			"par": false,
			"kelvin": false
		}
	}
}
````

## Configuration Options
MMM-Seneye uses the official <a href='https://api.seneye.com/'>Seneye API</a>

|Option|Description
|------|-----------
|`deviceID`| **Required**<br />You will need to find out your Seneye Device ID from the Seneye servers.<br /><br />The quickest way is to visit this url in any browser replacing the username and password with your own.  You will get a response that includes your Device ID `https://api.seneye.com/v1/devices?user=***&pwd=***`<br /><br />**Type:** `String`
|`email`   | **Required**<br />Your email address registered with Seneye.  The same one used to login to <a href='http://seneye.me/'>seneye.me</a><br /><br />**Type:** `String`
|`password`| **Required**<br />The password associated with the email address above.<br /><br />**Type:** `String`
|`readings`| **Required**<br />An array of readings options, at least one option is required:<br /><br />*Optional*<br />Temperature<br />**Type:** `Boolean`<br />Default *true*<br /><br />*Optional*<br />ph<br />**Type:** `Boolean`<br />Default *true*<br /><br />*Optional*<br />nh3<br />**Type:** `Boolean`<br />Default *true*<br /><br />*Optional*<br />nh4<br />**Type:** `Boolean`<br />Default *true*<br /><br />*Optional*<br />o2<br />**Type:** `Boolean`<br />Default *false*<br /><br />*Optional*<br />lux<br />**Type:** `Boolean`<br />Default *false*<br /><br />*Optional*<br />par<br />**Type:** `Boolean`<br />Default *false*<br /><br />*Optional*<br />kelvin<br />**Type:** `Boolean`<br />Default *false*

## To Do
* Add `node_helper.js`
* Add customisable temperature suffix
* Add some alert functionality
* Add logo/title customisation
* Add custom colour for icons