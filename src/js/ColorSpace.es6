/* jshint esversion: 6 */

class ColorSpace {

	fixDefaultNumericValue(subject, def_value) {
		return (subject === undefined || subject === null || subject == "" || typeof subject !== "number") ? def_value : subject;
	}

	/**
	 * Convert colour to web safe mode
	 * @param object							color							The colour
	 * @return {[type]}	   [description]
	 */
	getWebSafeColor(color) {
		let rMod = color.r % 51,
			gMod = color.g % 51,
			bMod = color.b % 51,
			aMod = color.a;

		if((rMod === 0) && (gMod === 0) && (bMod === 0)) return color;

		return {
			r: (rMod <= 25 ? Math.floor(color.r / 51) * 51 : Math.ceil(color.r / 51) * 51),
			g: (gMod <= 25 ? Math.floor(color.g / 51) * 51 : Math.ceil(color.g / 51) * 51),
			b: (bMod <= 25 ? Math.floor(color.b / 51) * 51 : Math.ceil(color.b / 51) * 51),
			a: aMod
		};
	}

	/**
	 * Parse a text string colour
	 * @param  string 							color							The text colour
	 * @return object															An object with RGBA colour values
	 */
	parseColor(color) {
		let sType = typeof(color);
		if(sType == "string") {
			if(/^\#?[0-9A-F]{6}$/i.test(color)) {
				let c = color.substring(1).split("");
				if(c.length == 3) {
					c = [c[0], c[0], c[1], c[1], c[2], c[2]];
				}
				c = "0x" + c.join("");
				return {
					r: (c >> 16) & 255,
					g: (c >> 8) & 255,
					b: c &255,
					a: 100
				};
			}
		} else if(sType == "object") {
			if(color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b") && color.hasOwnProperty("a")) {
				return color;
			}
		}
	}

	/**
	 * Convert a decimal value to HEX
	 * @param integer							i								The decimal value
	 */
	DEC2HEX(i) {
		let result = "00";
		if(i >= 0 && i <= 15) {
			result = "0" + i.toString(16);
		} else if(i >= 16 && i <= 255) {
			result = i.toString(16);
		}
		return result;
	}

	/**
	 * Convert a css style rgba string to an RGBA object
	 * @param  string 							RGBAstring 						The css rgba style string
	 * @return object															The parsed RGBA object
	 */
	RGBAstring2RGBA(RGBAstring) {
		let regex = /\(([\d]+)\,[\s|]([\d]+)\,[\s|]([\d]+)\,[\s|]([\d\.]+)\)/,
			matched = regex.exec(RGBAstring);
		return {
			r: parseInt(matched[1]),
			g: parseInt(matched[2]),
			b: parseInt(matched[3]),
			a: matched[4] * 100
		};
	}

	/* -------------------------------------------------------------------------
									HSB
	------------------------------------------------------------------------- */

	/**
	 * Convert an RGBA colour to HSB (Hue Saturation Brightness)
	 * @param  object 							rgba							The rgba colour object
	 * @return object															The HSB object
	 */
	RGBA2HSB(rgba) {
		let r, g, b, a, h, s, br, min, delta;
		if(arguments.length === 1) {
			r = arguments[0].r;
			g = arguments[0].g;
			b = arguments[0].b;
			a = arguments[0].a;
		} else {
			r = arguments[0];
			g = arguments[1];
			b = arguments[2];
			a = arguments[3];
		}

		br = (r > g) ? Math.max(r, b) : Math.max(g, b);
		min = (r > g) ? Math.min(g, b) : Math.min(r, b);
		delta = br - min;

		s = (br == 0.0) ? 0.0 : delta / br;

		if(s == 0.0) {
			h = 0.0;
		} else {
			if(r == br) {
				h = 60.0 * (g - b) / delta;
			} else if(g == br) {
				h = 120 + 60.0 * (b - r) / delta;
			} else {
				h = 240 + 60.0 * (r - g) / delta;
			}

			if(h < 0.0)   { h += 360.0; }
			if(h > 360.0) { h -= 360.0; }
		}

		h = Math.round(h);
		s = Math.round(s * 255.0);
		br = Math.round(br);

		/* avoid the ambiguity of returning different values for the same color */
		if(h == 360) {
			h = 0;
		}

		return {
			h: h,
			s: s,
			b: br
		};
	}

	/**
	 * Convert an HSB (Hue Saturation Brightness) colour to RGBA
	 */
	HSB2RGBA(hue, saturation, value) {
		let alpha = 100;

		if(arguments.length === 1) {
			hue = arguments[0].h;
			saturation = arguments[0].s;
			value = arguments[0].b;
		} else {
			hue = arguments[0];
			saturation = arguments[1];
			value = arguments[2];
		}

		let h, s, b, h_temp,
			f, p, q, t,
			i;

		if(saturation === 0) {
			hue = value;
			saturation = value;
			value = value;
		} else {
			h = hue;
			s = saturation / 255.0;
			b = value / 255.0;

			h_temp = (h == 360) ? 0 : h / 60;
			i = Math.floor(h_temp);
			f = h_temp - i;
			/*
			p = b * (1.0 - s);
			q = b * (1.0 - (s * f));
			t = b * (1.0 - (s * (1.0 - f)));
			*/
			let bs = b * s;
			p = value - value * s;

			switch(i) {
				case 0:
					t = b - bs * (1 - f);
					hue = Math.round(value);
					saturation = Math.round(t * 255.0);
					value = Math.round(p);
					break;
				case 1:
					q = b - bs * f;
					hue = Math.round(q * 255.0);
					saturation = Math.round(value);
					value = Math.round(p);
					break;
				case 2:
					t = b - bs * (1-f);
					hue = Math.round(p);
					saturation = Math.round(value);
					value = Math.round(t * 255.0);
					break;
				case 3:
					q = b - bs * f;
					hue = Math.round(p);
					saturation = Math.round(q * 255.0);
					value = Math.round(value);
					break;
				case 4:
					t = b - bs * (1 - f);
					hue = Math.round(t * 255.0);
					saturation = Math.round(p);
					value = Math.round(value);
					break;
				case 5:
					q = b - bs * f;
					hue = Math.round(value);
					saturation = Math.round(p);
					value = Math.round(q * 255.0);
					break;
			}
		}
		return {
			r: hue,
			g: saturation,
			b: value,
			a: alpha
		};
	}

	/* -------------------------------------------------------------------------
									HEX
	------------------------------------------------------------------------- */

	/**
	 * Calculate the corresponding HEX colour from a colour string
	 * @param  mixed								color						The colour
	 * @return string															The HEX color
	 */
	HEX(color) {
		color = parseInt(color).toString(16);
		return (color.length < 2) ? ("0" + color) : color;
	}

	/**
 	 * Calculate the corresponding HEX colour from an RGBA object values
	 * @param  object 							rgba							The rgba colour object
	 * @return string															The corresponding HEX color
	 */
	RGBA2HEX(rgba) {
		return (this.HEX(rgba.r) + this.HEX(rgba.g) + this.HEX(rgba.b));
	}

	/**
	 * Calculate the corresponding RGBA colour from an HEX value
	 * @param  string 							hex								The hex colour string
	 * @return object															The corresponding RGBA color
	 */
	HEX2RGBA(hex) {
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16),
			a: $("#alpha").val() || 100
		} : null;
	}


	/* -------------------------------------------------------------------------
									CMYK
	------------------------------------------------------------------------- */

	/**
	 * Convert an RGBA colour to its CMYK equivalent
	 * @param  object 							rgba							The rgba colour object
	 * @return object							cmyk							The cmyk colour object
	 */
	RGBA2CMYK(rgba) {
		let	r = rgba.r / 255,
			g = rgba.g / 255,
			b = rgba.b / 255,
			a = rgba.a / 100,
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
			c: c,
			m: m,
			y: y,
			k: k
		};
	}

	/**
	 * Convert a CMYK colour to its RGBA equivalent
	 * @param  object							cmyk							The cmyk colour object
	 * @return object 							rgba							The rgba colour object
	 */
	CMYK2RGBA(cmyk) {
		let c = cmyk.c / 100,
			m = cmyk.m / 100,
			y = cmyk.y / 100,
			k = cmyk.k / 100,
			r = Math.round((1 - Math.min(1, c * (1 - k) + k)) * 255),
			g = Math.round((1 - Math.min(1, m * (1 - k) + k)) * 255),
			b = Math.round((1 - Math.min(1, y * (1 - k) + k)) * 255),
			a = $("#alpha").val() || 100;

		// r = Math.round(r * 255);
		// g = Math.round(g * 255);
		// b = Math.round(b * 255);
		return {
			r: r,
			g: g,
			b: b,
			a: a
		};
	}
}

export default ColorSpace;
