Rotel RS232 Websocket Remote
============================

If you have a modern Rotel Hifi amplifier with a serial RS232 input, chances are you can use this project to control it from your phone or any device with a modern web browser. 

I wrote this to use a Raspberry Pi (running Volumio) together with a USB-to-RS232 adapter to control my Rotel RA-12 amplifier.

*Instructions*

Connect the Rotel amplifier with a serial cable to a computer. Check what serial port device it creates (for example "/dev/ttyUSB0").

On the computer, download and start the serial-port-json-server service: https://github.com/johnlauer/serial-port-json-server
This software you can download pre-compiled for a multitude of computer architectures.
It exposes the serial port as a websocket, accessible for example from Javascript in a HTML page.

The web page and its javascript resources are best served from a http server so you can access it from your home network.
I put them in a /var/www/rotel directory on my Raspberry Pi running Volumio, taking advantage of Volumio's web server.
And then access it from  http://my-address-here/rotel/index.html

Adjust the rotelConfig.js file in this project and update the setting "websocketUrl" to refer to the address of the serial-port-json-server service. 
You also want to adjust the setting "serialPortDevice" if it differs from the default '/dev/ttyUSB0'.

Load rotelConfig.html in your web browser. The javascript loaded by this page will connect to the serial-port-json-server and through it communicate with the Rotel amplifier. Now you can control power, volume, source, balance and tone controls. 
The communication is bi-directional, so if you change the volume using the volume knob on the amplifier or the regular remote, the web interface will reflect that.

*Tips*

By adjusting the config properties in rotelConfig.js, you can name your music sources ("TV", "Chromecast" etc). Label properties set to null will be disabled.

* Problems *

The project is tested with Rotel RA-12. Not all Rotel equipment implements the same protocol. See http://www.rotel.com/manual-resources/rs232-protocols for protocol specifications for different models. 

The Rotel protocol sometimes mixes responses in the wrong order. This you can see in the display emulator, which shows command responses rather than the display contents if you make several frequent changes. 

For Rotel RA-12, the protocol does not include a command to query the state of the mute function. So when refreshing the page, it does not always correctly display mute status. Rotel RA-1570 includes such a command. Hopefully it will be included in future firmware revisions for RA-12 as well.

On slower computers, such as the Raspberry Pi first versions, communication sometimes slows down. Suspected cause is gc pauses. 
You can try to tweak the gc options of serial-port-json-server (see its documentation). Newer versions of Raspberry Pi supposedly does not suffer from this, according to serial-port-json-server documentation.





