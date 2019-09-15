/*
Author: Anshu Krishna
Contact: anshu.krishna5@gmail.com
Date: 15-Sep-2019
*/
class JSCSS {
	constructor(...selectors) {
		Object.defineProperties(this, {
			__styles: {
				enumerable: false,
				writable: false,
				value: {}
			},
			__childs: {
				enumerable: false,
				writable: false,
				value: {}
			},
			__styleElement: {
				enumerable: false,
				writable: false,
				value: document.createElement('style')
			},
			__spacer: {
				enumerable: false,
				writable: true,
				value: true
			}
		});
		Object.defineProperties(this, {
			spaceFromParentSelector: {
				enumerable: true,
				set: (value) => {
					this.__spacer = !!value;
				},
				get: () => this.__spacer
			},
			selectors: {
				enumerable: false,
				writable: false,
				value: new JSCSS.__StringSet
			},
			styleElement: {
				enumerable: true,
				get: _ => {
					let oldStyle = this.__styleElement.innerHTML;
					let newStyle = String(this);
					if(oldStyle !== newStyle) {
						this.__styleElement.innerHTML = this;
					}
					return this.__styleElement;
				}
			},
			style: {
				enumerable: true,
				writable: false,
				value: new Proxy(this.__styles, {
					get: Reflect.get,
					set: (s, prop, value) => {
						if(Array.isArray(value)) {
							s[prop] = value;
						} else if(typeof value === 'object') {
							console.error('Invalid style value');
						} else {
							s[prop] = value;
						}
					}
				})
			},
			child: {
				enumerable: true,
				writable: false,
				value: new Proxy(this.__childs, {
					get: Reflect.get,
					set: (s, prop, value) => {
						if(value instanceof JSCSS) {
							s[prop] = value;
						} else {
							console.error('Invalid child value. It must be an instance of JSCSS');
						}
					}
				})
			},
			__stylesToString: {
				enumerable: false,
				get: () => {
					const ret = [];
					for(let k in this.__styles) {
						if(Array.isArray(this.__styles[k])) {
							for(let v of this.__styles[k]) {
								ret.push(JSCSS.__styleFormat(k, v));
							}
						} else {
							ret.push(JSCSS.__styleFormat(k, this.__styles[k]));
						}
					}
					return ret.join('\n');
				}
			},
			__selectorsToString: {
				enumerable: false,
				writable: false,
				value: (parent = null) => {
					if(parent === null) {
						return Array.from(this.selectors).join(',\n');
					}
					if(!Array.isArray(parent)) {
						parent = [parent];
					}
					let selectors = Array.from(this.selectors);
					let mixed = [];
					for(let p of parent) {
						for(let s of selectors) {
							mixed.push(this.__spacer ? `${p} ${s}` : `${p}${s}`);
						}
					}
					return mixed.join(',\n');
				}
			},
			__stringify: {
				enumerable: false,
				writable: false,
				value: (parent = null) => {
					let ret = [];
					let selectors = Array.from(this.selectors);
					if(selectors.length !== 0) {
						let styleString = this.__stylesToString;
						if(styleString.length !== 0) {
							ret.push(`${this.__selectorsToString(parent)} {\n${this.__stylesToString}\n}`);
						}
					}
					let mixed = [];
					if(parent === null) {
						mixed = selectors;
					} else {
						for(let p of parent) {
							for(let s of selectors) {
								mixed.push(`${p} ${s}`);
							}
						}
					}
					for(let c in this.__childs) {
						ret.push(`${this.__childs[c].__stringify(mixed)}`);
					}
					return ret.join('\n\n');
				}
			}
		});
		for(let s of selectors) {
			this.selectors.add(s);
		}
	}
	toString() {
		return this.__stringify();
	}
	reRender() {
		this.styleElement.innerHTML = this;
		return this;
	}
	addStyles(...objects) {
		for(let obj of objects) {
			if(typeof obj !== 'object') {
				console.error('addStyles expects an object as parameter');
				return;
			}
			for(let k of Object.keys(obj)) {
				Reflect.set(this.style, k, obj[k]);
			}
		}
		return this;
	}
	deleteStyles() {
		let keys = Object.keys(this.__styles);
		for(let k of keys) {
			delete this.__styles[k];
		}
	}
	copyStylesFrom(jscssobj) {
		if(!(jscssobj instanceof JSCSS)) {
			console.error(' expects parater to be an instance of JSCSS');
			return;
		}
		this.deleteStyles();
		this.addStyles(jscssobj.__styles);
	}
	mergeStylesFrom(jscssobj) {
		if(!(jscssobj instanceof JSCSS)) {
			console.error(' expects parater to be an instance of JSCSS');
			return;
		}
		this.addStyles(jscssobj.__styles);
	}
	unlinkFromDOM() {
		let parent = this.__styleElement.parentNode;
		if(parent !== null) {
			parent.removeChild(this.__styleElement);
		}
	}
}
Object.defineProperties(JSCSS, {
	__trimmedString: {
		enumerable: false,
		writable: false,
		value: (value) => String(value).trim()
	},
	__styleFormat: {
		enumerable: false,
		writable: false,
		value: (key, value) => `\t${key}: ${JSCSS.__trimmedString(value)};`
	},
	__StringSet: {
		enumerable: false,
		writable: false,
		value: class extends Set {
			add(value) {
				super.add(JSCSS.__trimmedString(value));
			}
			delete(value) {
				super.delete(JSCSS.__trimmedString(value));
			}
			has(value) {
				super.has(JSCSS.__trimmedString(value));
			}
		}
	}
});