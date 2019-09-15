# JSCSS

#### I recomend using SASS/SCSS for creating insteadof this library. But, if for some reason you wish to create CSS in JavaScript this library might help.

### `class JSCSS` has 5 properties:
- `style` : A `Proxy` for adding/removing styles in a block.
	
	Example
	```javascript
	let mydiv = new JSCSS('#mydiv');

	// Add styles
	mydiv.style.color = 'blue';
	mydiv.style.padding = '0.8em 1.2em';
	mydiv.style['box-shadow'] = '0 0 3px black';

	// Multi-valued properties can be assigned using arrays
	mydiv.style.background = [
		'#844af0',
		'-webkit-gradient(linear,  left top, left bottom,  from(#844af0),to(#6d2de3))',
		'linear-gradient(to bottom,  #844af0 0%,#6d2de3 100%)'
	];

	// Remove style
	delete mydiv.style.background;
	```

- `selectors` :  A string `Set` for adding and removing selectors in a block. See [Set MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) for more details on sets.

	Example
	```javascript
	let highlight = new JSCSS;
	
	// Add selectors
	highlight.selectors.add('div.bold');
	highlight.selectors.add('span.bold');

	// Remove selector
	highlight.selectors.delete('div.bold');

	// All the other Set functions are supported (like: has, entries etc.)
	```

- `child` : A `Proxy` for adding/removing sub-blocks. Sub-blocks act in a manner similar to that in SCSS.
	```scss
	/*SCSS*/
	#mydiv {
		color: blue;
		button {
			color: black;
		}
	}
	```
	When compiled to CSS becomes
	```css
	/*CSS*/
	#mydiv {
		color: blue;
	}
	#mydiv button {
		color: black;
	}
	```
	`child` is used to achieve the same result in JSCSS.

	Example
	```javascript
	let mydiv = new JSCSS('#mydiv');
	mydiv.style.color = 'blue';
	mydiv.child.btn = new JSCSS('button');
	mydiv.child.btn.style.color = 'black';

	//A more easily readable way to do this will be
	let mydiv = new JSCSS('#mydiv');
	mydiv.style.color = 'blue';
	mydiv.child.btn = new JSCSS('button').addStyles({
		color: 'black'
	});

	// Or
	let mydiv = new JSCSS('#mydiv');
	mydiv.style.color = 'blue';

	{
		let btn = new JSCSS('button');
		btn.style.color = 'black';
		
		mydiv.child.btn = btn;
	}

	/*
	When rendered this code will produce:
	#mydiv {
		color: blue;
	}
	#mydiv button {
		color: black;
	}
	*/
	```

- `styleElement` : A read-only reference to a `<style>` element containg the rendered CSS.

	Example
	```javascript
	let mydiv = new JSCSS('#mydiv').addStyles({
		color: 'white',
		background: '#212121'
	});

	document.head.appedChild(mydiv.styleElement);
	```

- `spaceFromParentSelector` : A boolean value. Default value is `true`. This determines if a space will be added between this block's selector and its parent block's selectors.

	Example
	```javascript
	let buttons = new JSCSS('button', 'input[type="button"]').addStyles({
		color: 'white',
		background: '#212121'
	});

	buttons.child.hover = new JSCSS(':hover').addStyles({
		background: 'blue'
	});

	buttons.child.active = new JSCSS(':active').addStyles({
		background: 'darkblue'
	});

	/*
	The above code will render: 

	button,
	input[type="button"] {
		color: white;
		background: #212121;
	}
	button :hover,
	input[type="button"] :hover {
		color: blue;
	}
	button :active,
	input[type="button"] :active {
		color: darkblue;
	}

	Which is not what we intened.
	*/

	// So we must disable the space between the child block selector (:hover, :active) and the parent selector (button, input[type="button"])

	buttons.child.hover.spaceFromParentSelector = false;
	buttons.child.active.spaceFromParentSelector = false;

	/*
	Now the rendered code will be what we intended:

	button,
	input[type="button"] {
		color: white;
		background: #212121;
	}
	button:hover,
	input[type="button"]:hover {
		color: blue;
	}
	button:active,
	input[type="button"]:active {
		color: darkblue;
	}
	*/
	```

### `class JSCSS` has 7 functions:
- `toString()` : Get the CSS string.

	Example
	```javascript
	let mydiv = new JSCSS('#mydiv').addStyles({
		color: 'blue'
	});
	
	console.log(mydiv.toString());
	/* Logs:
	#mydiv {
		color: blue;
	}
	*/
	```

- `addStyles(object [, ... object])` : Add multiple styles.

	Example
	```javascript
	let mydiv = new JSCSS('#mydiv').addStyles({
		color: 'white',
		background: '#212121'
	}, { border: 'none' }, { 'font-size': '1.2em'});
	```

- `reRender()` : Update the CSS in the block's `<style>` element node.

- `deleteStyles()` : Removes all the styles from block.

- `copyStylesFrom(jscssObj)` : Remove all current block styles and then copy styles from the passed block.

- `mergeStylesFrom(jscssObj)` : Merge styles from passed block into current block.

- `unlinkFromDOM()` : If block's `<style>` element has been added in the document then it is removed from the document.