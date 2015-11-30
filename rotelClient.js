var RotelClient = function() {
	var self = this;

	this.volume = null;
	this.power = null;
	this.mute = null;
	this.inputSource = null;
	this.tone = null;
	this.bass = null;
	this.treble = null;
	this.balance = null;
	this.play_status = null;
	this.freq = null;
	this.display1 = null;
	this.display2 = null;
	
	this.stateChanged = function() {
		console.log(	"volume: " + this.volume + 
				", power: " + this.power + 
				", mute: " + this.mute + 
				", inputSource: " + this.inputSource + 
				", tone: " + this.tone + 
				", bass: " + this.bass + 
				", treble: " + this.treble + 
				", balance: " + this.balance +
				", freq: " + this.freq + 
				", play_status: " + this.play_status +
				", display1: '" + this.display1 + "'" +  
				", display2: '" + this.display2  + "'" )

		this.detachEventHandlers();		
		$("#power-flipswitch").val(this.power).flipswitch('refresh');
		$("#mute-flipswitch").val(this.mute).flipswitch('refresh');
		$("#tone-flipswitch").val(this.tone).flipswitch('refresh');
		$("#volume-slider").val(this.volume).slider('refresh');
		$("#source").val(this.inputSource).selectmenu('refresh');

		if ("off" == $("#tone-flipswitch").val()) {
			$("#bass-slider").slider("disable");
			$("#treble-slider").slider("disable");
		} else {
			$("#bass-slider").slider("enable");
			$("#treble-slider").slider("enable");
		}		
		$("#bass-slider").val(Number(this.bass)).slider('refresh');
		$("#treble-slider").val(Number(this.treble)).slider('refresh');
		if (this.balance != null) {
			$("#balance-slider").val(Number(this.balance.replace('L', '-').replace('R', ''))).slider('refresh');
		}
		$("#lcd-display").text(this.display1 + "\n" + this.display2);
		this.attachEventHandlers();
	}


	this.initializeRotelState = function() {
		self.webSocket.send(self.getCurrentPowerEvent());
		self.webSocket.send(self.getCurrentSourceEvent());
		self.webSocket.send(self.getToneEvent());
		self.webSocket.send(self.getVolumeEvent());
		self.webSocket.send(self.getBassEvent());
		self.webSocket.send(self.getTrebleEvent());
		self.webSocket.send(self.getBalanceEvent());
		self.webSocket.send(self.getDisplayEvent());
	}

	this.detachEventHandlers = function() {
	    	$("#source").unbind("change");
	    	$("#mute-flipswitch").unbind("change");
	    	$("#power-flipswitch").unbind("change");
	    	$("#tone-flipswitch").unbind("change");
	    	$("#volume-slider").unbind("change");
	    	$("#bass-slider").unbind("change");
	    	$("#treble-slider").unbind("change");
	    	$("#balance-slider").unbind("change");
	}

	this.attachEventHandlers = function() {
	    	$("#source").on("change", function() {
			var a = self.createActionEvent($("#source").val());
			self.webSocket.send(a);
		} );

	    	$("#mute-flipswitch").on("change", function() {
			var a = self.muteSetEvent($("#mute-flipswitch").val());
			self.webSocket.send(a);
		} );

	    	$("#power-flipswitch").on("change", function() {
			var c = $("#power-flipswitch").val();
			if (c == "standby") {
				c = "off";
			}
			var a = self.powerSetEvent(c);
			self.webSocket.send(a);
		} );

	    	$("#tone-flipswitch").on("change", function() {
			var a = self.toneSetEvent($("#tone-flipswitch").val());
			self.webSocket.send(a);
		} );

	    	$("#volume-slider").on("change", function() {
			var a = self.volumeSetEvent($("#volume-slider").val());
			self.webSocket.send(a);
		} );

	    	$("#bass-slider").on("change", function() {
			var v = $("#bass-slider").val();
			var a = null;
			if (v < 0) {
				a = self.bassSetEvent('-' + ('0' + Math.abs(v)).slice(-2));
			} else if (v == 0) {
				a = self.bassSetEvent('000');
			} else if (v > 0) {
				a = self.bassSetEvent('+' + ('0' + Math.abs(v)).slice(-2));
			}
			self.webSocket.send(a);
		} );

	    	$("#treble-slider").on("change", function() {
			var v = $("#treble-slider").val();
			var a = null;
			if (v < 0) {
				a = self.trebleSetEvent('-' + ('0' + Math.abs(v)).slice(-2));
			} else if (v == 0) {
				a = self.trebleSetEvent('000');
			} else if (v > 0) {
				a = self.trebleSetEvent('+' + ('0' + Math.abs(v)).slice(-2));
			}
			self.webSocket.send(a);
		} );

	    	$("#balance-slider").on("change", function() {
			var v = $("#balance-slider").val();
			var a = null;
			if (v < 0) {
				a = self.balanceSetEvent('L' + ('0' + Math.abs(v)).slice(-2));
			} else if (v == 0) {
				a = self.balanceSetEvent('000');
			} else if (v > 0) {
				a = self.balanceSetEvent('R' + ('0' + Math.abs(v)).slice(-2));
			}
			self.webSocket.send(a);
		} );

	}

	this.webSocket = new ReconnectingWebSocket('ws://localhost:8989/ws');
	this.webSocket.timeoutInterval = 1000;
	this.webSocket.maxReconnectInterval = 8000;
	this.webSocket.onopen = function() {
		self.webSocket.send('open /dev/ttyUSB0 115200');
		self.initializeRotelState();
	};

	this.webSocket.onerror = function(error) {
		console.log("error: " + error);	
	};

	this.webSocket.onmessage = function(e) {
		parseEvent(e);
	};

	this.sourceCdEvent =  function() { return this.createActionEvent('cd'); }
	this.sourceUsbEvent =  function() { return this.createActionEvent('usb'); }
	this.sourceCoax1Event =  function() { return this.createActionEvent('coax1'); }
	this.sourceCoax2Event =  function() { return this.createActionEvent('coax2'); }
	this.sourceOpt1Event =  function() { return this.createActionEvent('opt1'); }
	this.sourceOpt2Event =  function() { return this.createActionEvent('opt2'); }
	this.sourceAux1Event =  function() { return this.createActionEvent('aux1'); }
	this.sourceAux2Event =  function() { return this.createActionEvent('aux2'); }
	this.sourceTunerEvent =  function() { return this.createActionEvent('tuner'); }
	this.sourcePhonoEvent =  function() { return this.createActionEvent('phono'); }

	this.toggleMuteEvent = function() { return this.createActionEvent('mute'); }
	this.muteOnEvent = function() { return this.createActionEvent('mute_on'); }
	this.muteOffEvent = function() { return this.createActionEvent('mute_off'); }
	this.muteSetEvent = function(v) { return this.createActionEvent('mute_' + v); }
	this.toneOnEvent = function() { return this.createActionEvent('tone_on'); }
	this.toneOffEvent = function() { return this.createActionEvent('tone_off'); }
	this.toneSetEvent = function(v) { return this.createActionEvent('tone_' + v); }
	this.togglePowerEvent = function() { return this.createActionEvent('power_toggle'); }
	this.powerOnEvent = function() { return this.createActionEvent('power_on'); }
	this.powerOffEvent = function() { return this.createActionEvent('power_off'); }
	this.powerSetEvent = function(v) { return this.createActionEvent('power_' + v); }
	this.volumeSetEvent = function(v) { return this.createActionEvent('volume_' + v); }

	this.bassSetEvent = function(v) { return this.createActionEvent('bass_' + v); }
	this.bassUpEvent = function() { return this.createActionEvent('bass_up'); }
	this.bassDownEvent = function() { return this.createActionEvent('bass_down'); }

	this.trebleSetEvent = function(v) { return this.createActionEvent('treble_' + v); }
	this.trebleUpEvent = function() { return this.createActionEvent('treble_up'); }
	this.trebleDownEvent = function() { return this.createActionEvent('treble_down'); }

	this.balanceSetEvent = function(v) { return this.createActionEvent('balance_' + v); }
	this.balanceLeftEvent = function() { return this.createActionEvent('balance_left'); }
	this.balanceRightEvent = function() { return this.createActionEvent('balance_right'); }

	this.volumeDownEvent = function() { return this.createActionEvent('volume_down'); }
	this.getCurrentPowerEvent = function() { return this.createActionEvent('get_current_power'); }
	this.getCurrentSourceEvent = function() { return this.createActionEvent('get_current_source'); }
	this.getToneEvent = function() { return this.createActionEvent('get_tone'); }
	this.getBassEvent = function() { return this.createActionEvent('get_bass'); }
	this.getTrebleEvent = function() { return this.createActionEvent('get_treble'); }
	this.getBalanceEvent = function() { return this.createActionEvent('get_balance'); }
	this.getCurrentFreqEvent = function() { return this.createActionEvent('get_current_freq'); }
	this.getVolumeEvent = function() { return this.createActionEvent('get_volume'); }
	this.getDisplayEvent = function() { return this.createActionEvent('get_display'); }

	this.createActionEvent = function(action) {
		return 'sendjson {"P":"/dev/ttyUSB0","Data":[{"D":"'+action+'!"}]}';
	};

	var incompleteEvent = null;
	var remainingDisplayCharCount = null;

	var parseEvent = function(evt) {
		console.log("server: " + evt.data);
		if (typeof evt.data == "string") {
			var data = null;
			try {
				data = JSON.parse(evt.data);
			} catch (err) {
				console.log("Could not parse as JSON:" + JSON.stringify(evt));
			}
			console.log("data:" + data);
			if (data && data.D) {
				//most commands end with !
				var responses = data.D.split("!");
				if (responses) {
					for (var i = 0; i < responses.length; i++)  {
						console.log("responses[" + i + "]: "  + responses[i]);

						if (self.remainingDisplayCharCount) {
							console.log("remainingDisplayCharCount: " + self.remainingDisplayCharCount);
							self.display2 = responses[i].substring(0, self.remainingDisplayCharCount);
							self.remainingDisplayCharCount = null;
							self.stateChanged(self.remainingDisplayCharCount);
							//in case there is new information on remainder of line
							response = responses[i].substring(self.remainingDisplayCharCount)
							if (response == null || response.length < 1) {
								continue;
							}
						} else {
							console.log("not remainingDisplayCharCount");
							response = responses[i];
						}

						console.log("response: " + response);
						typeAndValue = response.split("=");
						console.log("typeAndValue: " + typeAndValue);
						if (typeAndValue) {
							var type = typeAndValue[0];
							var value = typeAndValue[1];
							console.log("type: '" + type+"', value: '"+value+"'");
	
							// since Rotel's response might be split in several events
							// by serial port JSON
							// we must work around it below
/*
								if (incompleteEvent) { 

									type = incompleteEvent + type;
									console.log("incompleteEvent = "+incompleteEvent+" . type = " + type);
									incompleteEvent = null;
								}
								if (value == null) {
									incompleteEvent = type;
								}*/
							if (value) {
								incompleteEvent = null;
								switch (type) {
									case "display": 
										var displayCharCount = Number(value.substring(0,3));
										console.log("displayCharCount: "+displayCharCount+"valueX:  " + value + "'");

										self.display1 = value.substring(4);
										self.remainingDisplayCharCount = 
											displayCharCount - self.display1.length;
										self.remainingDisplayCharCount = 
											(self.remainingDisplayCharCount > 0) ? 
												self.remainingDisplayCharCount : null;
										break;
									case "volume":
										self.volume = value;
										break;
									case "power":
										self.power = value;
										break;
									case "mute":
										self.mute = value;
										break;
									case "source":
										self.inputSource = value;
										break;
									case "tone":
										self.tone = value;
										break;
									case "bass":
										self.bass = value;
										break;
									case "treble":
										self.treble = value;
										break;
									case "balance":
										self.balance = value;
										break;
									case "freq":
										self.freq = value;
										break;
									case "play_status":
										self.play_status = value;
										break;
								}
								if (self.remainingDisplayCharCount == null) {
									self.stateChanged();
								}
							}
						}
					}
				}
			}
		}
	}

	var discard = function() {
		webSocket.close();
	}
};

