/* jshint esversion: 6 */

class ColorSpace {
	getWebSafeColor(color) {
		let rMod = color.r % 51,
			gMod = color.g % 51,
			bMod = color.b % 51;

		if((rMod === 0) && (gMod === 0) && (bMod === 0)) return color;

		var wsColor = {};

		wsColor.r=(rMod<=25?Math.floor(color.r/51)*51:Math.ceil(color.r/51)*51);
		wsColor.g=(gMod<=25?Math.floor(color.g/51)*51:Math.ceil(color.g/51)*51);
		wsColor.b=(bMod<=25?Math.floor(color.b/51)*51:Math.ceil(color.b/51)*51);

		return wsColor;
	}

	rgb2hsv() {
		let r, g, b, h, s, v, min, delta;
		if(arguments.length === 1) {
			r = arguments[0].r;
			g = arguments[0].g;
			b = arguments[0].b;
		} else {
			r = arguments[0];
			g = arguments[1];
			b = arguments[2];
		}

		v = (r > g) ? Math.max(r, b) : Math.max(g, b);
		min = (r > g) ? Math.min(g, b) : Math.min(r, b);
		delta = v - min;

		s = (v == 0.0) ? 0.0 : delta / v;

		if(s == 0.0) {
			h = 0.0;
		} else {
			if(r == v) {
				h = 60.0 * (g - b) / delta;
			} else if (g == v) {
				h = 120 + 60.0 * (b - r) / delta;
			} else {
				h = 240 + 60.0 * (r - g) / delta;
			}

			if(h < 0.0)   { h += 360.0; }
			if(h > 360.0) { h -= 360.0; }
		}

		h = Math.round (h);
		s = Math.round (s * 255.0);
		v = Math.round (v);

		/* avoid the ambiguity of returning different values for the same color */
		if (h == 360) {
			h = 0;
		}

		return {
			h: h,
			s: s,
			v: v
		};
	}

	hsv2rgb() {
		let hue,
			saturation,
			value;

		if(arguments.length === 1) {
			hue = arguments[0].h;
			saturation = arguments[0].s;
			value = arguments[0].v;
		} else {
			hue = arguments[0];
			saturation = arguments[1];
			value = arguments[2];
		}

		let h, s, v, h_temp,
			f, p, q, t,
			i;

		if(saturation === 0) {
			hue = value;
			saturation = value;
			value = value;
		} else {
			h = hue;
			s = saturation / 255.0;
			v = value / 255.0;

			h_temp = (h == 360) ? 0 : h / 60;
			i = Math.floor(h_temp);
			f = h_temp - i;
			/*
			p = v * (1.0 - s);
			q = v * (1.0 - (s * f));
			t = v * (1.0 - (s * (1.0 - f)));
			*/
			let vs = v * s;
			p = value - value * s;

			switch(i) {
				case 0:
					t = v - vs * (1-f);
					hue = Math.round (value);
					saturation = Math.round (t * 255.0);
					value = Math.round (p);
					break;
				case 1:
					q = v - vs * f;
					hue = Math.round (q * 255.0);
					saturation = Math.round (value);
					value = Math.round (p);
					break;
				case 2:
					t = v - vs * (1-f);
					hue = Math.round (p);
					saturation = Math.round (value);
					value = Math.round (t * 255.0);
					break;
				case 3:
					q = v - vs * f;
					hue = Math.round (p);
					saturation = Math.round (q * 255.0);
					value = Math.round (value);
					break;
				case 4:
					t = v - vs * (1-f);
					hue = Math.round (t * 255.0);
					saturation = Math.round (p);
					value = Math.round (value);
					break;
				case 5:
					q = v - vs * f;
					hue = Math.round (value);
					saturation = Math.round (p);
					value = Math.round (q * 255.0);
					break;
			}
		}
		return {
			r: hue,
			g: saturation,
			b: value
		};
	}

	hex(c) {
		c = parseInt(c).toString(16);
		return (c.length < 2) ? "0" + c : c;
	}

	RGB2HEX(rgb) {
		return (this.hex(rgb.r) + this.hex(rgb.g) + this.hex(rgb.b));
	}

	parseColor(colorText) {
		let sType = typeof(colorText);
		if(sType == "string") {
			if(/^\#?[0-9A-F]{6}$/i.test(colorText)) {
				return {
					r: function() {
						return ("0x" + colorText.substr(((colorText.length == 6) ? 0 : 1), 2));
					}(),
					g: function() {
						return ("0x" + colorText.substr(((colorText.length == 6) ? 2 : 3), 2));
					}(),
					b: function() {
						return ("0x" + colorText.substr(((colorText.length == 6) ? 4 : 5), 2));
					}(),
					a: 255
				};
			}
		} else if(sType == "object") {
			if (colorText.hasOwnProperty("r") && colorText.hasOwnProperty("g") && colorText.hasOwnProperty("b")) {
				return colorText;
			}
		}
		return null;
	}

	rgb2ymck(rgb) {
		let	r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255,
			c, m, y, k;

		k = Math.min(1 - r, 1 - g, 1 - b);
		if((1 - k) === 0) {
			c = 0;
			m = 0;
			y = 0;
		} else {
			c = (1 - r - k) / (1 - k);
			m = (1 - g - k) / (1 - k);
			y = (1 - b - k) / (1 - k);
		}
		c = Math.round(c * 100);
		m = Math.round(m * 100);
		y = Math.round(y * 100);
		k = Math.round(k * 100);

		return {
			y: y,
			m: m,
			c: c,
			k: k
		};
	}

	ymck2rgb(ymck) {
		let r, g, b,
			c = ymck.c / 100,
			m = ymck.m / 100,
			y = ymck.y / 100,
			k = ymck.k / 100;

		r = 1 - Math.min(1, c * (1 - k) + k);
		g = 1 - Math.min(1, m * (1 - k) + k);
		b = 1 - Math.min(1, y * (1 - k) + k);

		r = Math.round(r * 255);
		g = Math.round(g * 255);
		b = Math.round(b * 255);
		return {
			r: r,
			g: g,
			b: b
		};
	}
}

export default ColorSpace;
