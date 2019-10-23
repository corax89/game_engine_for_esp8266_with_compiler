var audio;

var play_tone = {
	"freq": 0,
	"time": 0
}
var rtttl = {
	"address": 0,
	"position": 0,
	"startposition": 0,
	"loop": 0,
	"play": 0,
	"default_dur": 0,
	"default_oct": 0,
	"bpm": 0,
	"wholenote": 0,
	"str": '',
	"globalSound": 1
}

var notes = [
	0, 262, 277, 294, 311, 330, 349, 370, 392, 415, 440, 466, 494, 523, 554, 587, 622, 659, 698, 740, 784, 831, 880,
	932, 988, 1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976, 2093, 2217, 2349, 2489, 2637,
	2794, 2960, 3136, 3322, 3520, 3729, 3951
];

function initAudio() {
	if (!audio)
		audio = new(window.AudioContext || window.webkitAudioContext)();
}

function isdigit(str) {
	return /^\d+$/.test(str);
}

function isNumber(value) {
	return typeof value === 'number' && isFinite(value);
}

function tone(freq, delay) {
	if (rtttl.globalSound) {
		var attack = 10,
		gain = audio.createGain(),
		osc = audio.createOscillator();
		gain.connect(audio.destination);
		//gain.gain.setValueAtTime(0, audio.currentTime);
		//gain.gain.linearRampToValueAtTime(1, audio.currentTime + attack / 1000);
		//gain.gain.linearRampToValueAtTime(0, audio.currentTime + delay / 1000);
		gain.gain.value = 0.1;
		osc.frequency.value = freq;
		osc.type = "square";
		osc.connect(gain);
		osc.start(0);
		setTimeout(function () {
			osc.stop(0);
			osc.disconnect(gain);
			gain.disconnect(audio.destination);
		}, delay);
	}
}

function addTone(f, t) {
	play_tone.freq = f;
	play_tone.time = t;
}

function loadRtttl() {
	var n,
	c,
	i;
	rtttl.default_dur = 4;
	rtttl.default_oct = 6;
	rtttl.bpm = 63;
	rtttl.startposition = 0;
	i = 0;
	c = cpu.readMem(rtttl.address + i);
	rtttl.str = '';
	while (c != 0) {
		rtttl.str += String.fromCharCode(c);
		c = cpu.readMem(rtttl.address + i);
		i++;
	}
	rtttl.str += String.fromCharCode(0);
	while (c != ':' && rtttl.startposition < rtttl.str.length) {
		// ignore name
		c = rtttl.str[rtttl.startposition];
		rtttl.startposition++;
	}
	c = rtttl.str[rtttl.startposition]; // skip ':'
	// get default duration
	if (c == 'd') {
		rtttl.startposition += 2; // skip "d="
		n = '';
		while (isdigit(rtttl.str[rtttl.startposition])) {
			n += rtttl.str[rtttl.startposition];
			rtttl.startposition++;
		}
		if (parseInt(n) > 0)
			rtttl.default_dur = parseInt(n)
				rtttl.startposition++; // skip comma
	}
	// get default octave
	c = rtttl.str[rtttl.startposition];
	if (c == 'o') {
		rtttl.startposition += 2; // skip "o="
		c = rtttl.str[rtttl.startposition];
		if (parseInt(c) >= 3 && parseInt(c) <= 7)
			rtttl.default_oct = parseInt(c);
		rtttl.startposition += 2;
	}
	// get BPM
	c = rtttl.str[rtttl.startposition];
	if (c == 'b') {
		rtttl.startposition += 2; // skip "b="
		n = '';
		while (isdigit(rtttl.str[rtttl.startposition])) {
			n += rtttl.str[rtttl.startposition];
			rtttl.startposition++;
		}
		if (parseInt(n) > 0)
			rtttl.bpm = parseInt(n);
	}
	// BPM usually expresses the number of quarter notes per minute
	rtttl.wholenote = (60 * 1000 / rtttl.bpm) * 4; // this is the time for whole note (in milliseconds)
	rtttl.startposition++;
	rtttl.position = 0;
	return 1;
}

function testEndRtttl() {
	if (rtttl.startposition + rtttl.position >= rtttl.str.length) {
		if (!rtttl.loop)
			rtttl.play = 0;
		rtttl.position = 0;
	}
}

function playRtttl() {
	var n,
	duration,
	note,
	scale,
	c;
	//play single tone
	if (play_tone.time) {
		tone(play_tone.freq, play_tone.time);
		n = play_tone.time;
		play_tone.time = 0;
		return n;
	}
	//player
	if (rtttl.play == 0)
		return 100;
	//first, get note duration, if available
	n = 0;
	testEndRtttl();
	c = rtttl.str[rtttl.startposition + rtttl.position];
	n = '';
	while (isdigit(rtttl.str[rtttl.startposition + rtttl.position])) {
		n += rtttl.str[rtttl.startposition + rtttl.position];
		rtttl.position++;
	}
	if (isNumber(parseInt(n)) && parseInt(n) != 0)
		duration = rtttl.wholenote / n;
	else
		duration = rtttl.wholenote / rtttl.default_dur; // we will need to check if we are a dotted note after
	//now get the note
	c = rtttl.str[rtttl.startposition + rtttl.position];
	note = 0;
	switch (c) {
	case 'c':
	case 'C':
		note = 1;
		break;
	case 'd':
	case 'D':
		note = 3;
		break;
	case 'e':
	case 'E':
		note = 5;
		break;
	case 'f':
	case 'F':
		note = 6;
		break;
	case 'g':
	case 'G':
		note = 8;
		break;
	case 'a':
	case 'A':
		note = 10;
		break;
	case 'b':
	case 'B':
		note = 12;
		break;
	case 'p':
	case 'P':
	default:
		note = 0;
	}
	if (rtttl.position < rtttl.str.length)
		rtttl.position++;
	else
		return 100;
	c = rtttl.str[rtttl.startposition + rtttl.position];
	// now, get optional '#' sharp
	if (c == '#') {
		note++;
		if (rtttl.position < rtttl.str.length)
			rtttl.position++;
		else
			return 100;
		c = rtttl.str[rtttl.startposition + rtttl.position];
	}
	// now, get optional '.' dotted note
	if (c == '.') {
		duration += duration / 2;
		if (rtttl.position < rtttl.str.length)
			rtttl.position++;
		else
			return 100;
		c = rtttl.str[rtttl.startposition + rtttl.position];
	}
	// now, get scale
	if (isdigit(c)) {
		scale = c - '0';
		if (rtttl.position < rtttl.str.length)
			rtttl.position++;
		else
			return 100;
		c = rtttl.str[rtttl.startposition + rtttl.position];
	} else {
		scale = rtttl.default_oct;
	}
	if (c == ',')
		rtttl.position++; // skip comma for next note (or we may be at the end)
	// now play the note
	if (note) {
		tone(notes[(scale - 4) * 12 + note], duration);
	} else {
		//console.log("Pausing: " + duration);
	}
	return duration;
}
