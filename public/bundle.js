
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
	'use strict';

	function noop() {}

	function assign(tar, src) {
		for (const k in src) tar[k] = src[k];
		return tar;
	}

	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	function run_all(fns) {
		fns.forEach(run);
	}

	function is_function(thing) {
		return typeof thing === 'function';
	}

	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}

	function validate_store(store, name) {
		if (!store || typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}

	function subscribe(component, store, callback) {
		const unsub = store.subscribe(callback);

		component.$$.on_destroy.push(unsub.unsubscribe
			? () => unsub.unsubscribe()
			: unsub);
	}

	function create_slot(definition, ctx, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, fn) {
		return definition[1]
			? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
			: ctx.$$scope.ctx;
	}

	function get_slot_changes(definition, ctx, changed, fn) {
		return definition[1]
			? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
			: ctx.$$scope.changed || {};
	}

	function append(target, node) {
		target.appendChild(node);
	}

	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	function detach(node) {
		node.parentNode.removeChild(node);
	}

	function element(name) {
		return document.createElement(name);
	}

	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	function text(data) {
		return document.createTextNode(data);
	}

	function space() {
		return text(' ');
	}

	function empty() {
		return text('');
	}

	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else node.setAttribute(attribute, value);
	}

	function children(element) {
		return Array.from(element.childNodes);
	}

	function set_style(node, key, value) {
		node.style.setProperty(key, value);
	}

	let current_component;

	function set_current_component(component) {
		current_component = component;
	}

	const dirty_components = [];

	const resolved_promise = Promise.resolve();
	let update_scheduled = false;
	const binding_callbacks = [];
	const render_callbacks = [];
	const flush_callbacks = [];

	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	function flush() {
		const seen_callbacks = new Set();

		do {
			// first, call beforeUpdate functions
			// and update components
			while (dirty_components.length) {
				const component = dirty_components.shift();
				set_current_component(component);
				update(component.$$);
			}

			while (binding_callbacks.length) binding_callbacks.shift()();

			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			while (render_callbacks.length) {
				const callback = render_callbacks.pop();
				if (!seen_callbacks.has(callback)) {
					callback();

					// ...so guard against infinite loops
					seen_callbacks.add(callback);
				}
			}
		} while (dirty_components.length);

		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}

		update_scheduled = false;
	}

	function update($$) {
		if ($$.fragment) {
			$$.update($$.dirty);
			run_all($$.before_render);
			$$.fragment.p($$.dirty, $$.ctx);
			$$.dirty = null;

			$$.after_render.forEach(add_render_callback);
		}
	}

	let outros;

	function group_outros() {
		outros = {
			remaining: 0,
			callbacks: []
		};
	}

	function check_outros() {
		if (!outros.remaining) {
			run_all(outros.callbacks);
		}
	}

	function on_outro(callback) {
		outros.callbacks.push(callback);
	}

	function destroy_block(block, lookup) {
		block.d(1);
		lookup.delete(block.key);
	}

	function outro_and_destroy_block(block, lookup) {
		on_outro(() => {
			destroy_block(block, lookup);
		});

		block.o(1);
	}

	function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
		let o = old_blocks.length;
		let n = list.length;

		let i = o;
		const old_indexes = {};
		while (i--) old_indexes[old_blocks[i].key] = i;

		const new_blocks = [];
		const new_lookup = new Map();
		const deltas = new Map();

		i = n;
		while (i--) {
			const child_ctx = get_context(ctx, list, i);
			const key = get_key(child_ctx);
			let block = lookup.get(key);

			if (!block) {
				block = create_each_block(key, child_ctx);
				block.c();
			} else if (dynamic) {
				block.p(changed, child_ctx);
			}

			new_lookup.set(key, new_blocks[i] = block);

			if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
		}

		const will_move = new Set();
		const did_move = new Set();

		function insert(block) {
			if (block.i) block.i(1);
			block.m(node, next);
			lookup.set(block.key, block);
			next = block.first;
			n--;
		}

		while (o && n) {
			const new_block = new_blocks[n - 1];
			const old_block = old_blocks[o - 1];
			const new_key = new_block.key;
			const old_key = old_block.key;

			if (new_block === old_block) {
				// do nothing
				next = new_block.first;
				o--;
				n--;
			}

			else if (!new_lookup.has(old_key)) {
				// remove old block
				destroy(old_block, lookup);
				o--;
			}

			else if (!lookup.has(new_key) || will_move.has(new_key)) {
				insert(new_block);
			}

			else if (did_move.has(old_key)) {
				o--;

			} else if (deltas.get(new_key) > deltas.get(old_key)) {
				did_move.add(new_key);
				insert(new_block);

			} else {
				will_move.add(old_key);
				o--;
			}
		}

		while (o--) {
			const old_block = old_blocks[o];
			if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
		}

		while (n) insert(new_blocks[n - 1]);

		return new_blocks;
	}

	function mount_component(component, target, anchor) {
		const { fragment, on_mount, on_destroy, after_render } = component.$$;

		fragment.m(target, anchor);

		// onMount happens after the initial afterUpdate. Because
		// afterUpdate callbacks happen in reverse order (inner first)
		// we schedule onMount callbacks before afterUpdate callbacks
		add_render_callback(() => {
			const new_on_destroy = on_mount.map(run).filter(is_function);
			if (on_destroy) {
				on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});

		after_render.forEach(add_render_callback);
	}

	function destroy(component, detaching) {
		if (component.$$) {
			run_all(component.$$.on_destroy);
			component.$$.fragment.d(detaching);

			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			component.$$.on_destroy = component.$$.fragment = null;
			component.$$.ctx = {};
		}
	}

	function make_dirty(component, key) {
		if (!component.$$.dirty) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty = blank_object();
		}
		component.$$.dirty[key] = true;
	}

	function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
		const parent_component = current_component;
		set_current_component(component);

		const props = options.props || {};

		const $$ = component.$$ = {
			fragment: null,
			ctx: null,

			// state
			props: prop_names,
			update: noop,
			not_equal: not_equal$$1,
			bound: blank_object(),

			// lifecycle
			on_mount: [],
			on_destroy: [],
			before_render: [],
			after_render: [],
			context: new Map(parent_component ? parent_component.$$.context : []),

			// everything else
			callbacks: blank_object(),
			dirty: null
		};

		let ready = false;

		$$.ctx = instance
			? instance(component, props, (key, value) => {
				if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
					if ($$.bound[key]) $$.bound[key](value);
					if (ready) make_dirty(component, key);
				}
			})
			: props;

		$$.update();
		ready = true;
		run_all($$.before_render);
		$$.fragment = create_fragment($$.ctx);

		if (options.target) {
			if (options.hydrate) {
				$$.fragment.l(children(options.target));
			} else {
				$$.fragment.c();
			}

			if (options.intro && component.$$.fragment.i) component.$$.fragment.i();
			mount_component(component, options.target, options.anchor);
			flush();
		}

		set_current_component(parent_component);
	}

	class SvelteComponent {
		$destroy() {
			destroy(this, true);
			this.$destroy = noop;
		}

		$on(type, callback) {
			const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
			callbacks.push(callback);

			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		$set() {
			// overridden by instance, if it has props
		}
	}

	class SvelteComponentDev extends SvelteComponent {
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error(`'target' is a required option`);
			}

			super();
		}

		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn(`Component was already destroyed`); // eslint-disable-line no-console
			};
		}
	}

	/* src/components/IconButton.svelte generated by Svelte v3.4.1 */

	const file = "src/components/IconButton.svelte";

	function create_fragment(ctx) {
		var div, div_class_value, current, dispose;

		const default_slot_1 = ctx.$$slots.default;
		const default_slot = create_slot(default_slot_1, ctx, null);

		return {
			c: function create() {
				div = element("div");

				if (default_slot) default_slot.c();

				div.className = div_class_value = "" + (`iconButton ${ctx.active ? 'active' : ''}`) + " svelte-b1xow6";
				add_location(div, file, 21, 0, 330);

				dispose = [
					listen(div, "mousedown", ctx.start),
					listen(div, "touchstart", ctx.start),
					listen(div, "mouseup", ctx.release),
					listen(div, "touchend", ctx.release)
				];
			},

			l: function claim(nodes) {
				if (default_slot) default_slot.l(div_nodes);
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},

			p: function update(changed, ctx) {
				if (default_slot && default_slot.p && changed.$$scope) {
					default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
				}

				if ((!current || changed.active) && div_class_value !== (div_class_value = "" + (`iconButton ${ctx.active ? 'active' : ''}`) + " svelte-b1xow6")) {
					div.className = div_class_value;
				}
			},

			i: function intro(local) {
				if (current) return;
				if (default_slot && default_slot.i) default_slot.i(local);
				current = true;
			},

			o: function outro(local) {
				if (default_slot && default_slot.o) default_slot.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				if (detaching) {
					detach(div);
				}

				if (default_slot) default_slot.d(detaching);
				run_all(dispose);
			}
		};
	}

	function instance($$self, $$props, $$invalidate) {
		let { start, release, active } = $$props;

		let { $$slots = {}, $$scope } = $$props;

		$$self.$set = $$props => {
			if ('start' in $$props) $$invalidate('start', start = $$props.start);
			if ('release' in $$props) $$invalidate('release', release = $$props.release);
			if ('active' in $$props) $$invalidate('active', active = $$props.active);
			if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
		};

		return { start, release, active, $$slots, $$scope };
	}

	class IconButton extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, ["start", "release", "active"]);

			const { ctx } = this.$$;
			const props = options.props || {};
			if (ctx.start === undefined && !('start' in props)) {
				console.warn("<IconButton> was created without expected prop 'start'");
			}
			if (ctx.release === undefined && !('release' in props)) {
				console.warn("<IconButton> was created without expected prop 'release'");
			}
			if (ctx.active === undefined && !('active' in props)) {
				console.warn("<IconButton> was created without expected prop 'active'");
			}
		}

		get start() {
			throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set start(value) {
			throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get release() {
			throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set release(value) {
			throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get active() {
			throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set active(value) {
			throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/assets/LeftArrow.svelte generated by Svelte v3.4.1 */

	const file$1 = "src/assets/LeftArrow.svelte";

	function create_fragment$1(ctx) {
		var svg, path;

		return {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr(path, "d", "M222.979,5.424C219.364,1.807,215.08,0,210.132,0c-4.949,0-9.233,1.807-12.848,5.424L69.378,133.331\n    c-3.615,3.617-5.424,7.898-5.424,12.847c0,4.949,1.809,9.233,5.424,12.847l127.906,127.907c3.614,3.617,7.898,5.428,12.848,5.428\n    c4.948,0,9.232-1.811,12.847-5.428c3.617-3.614,5.427-7.898,5.427-12.847V18.271C228.405,13.322,226.596,9.042,222.979,5.424z");
				add_location(path, file$1, 6, 2, 154);
				attr(svg, "width", "40px");
				attr(svg, "height", "40px");
				attr(svg, "viewBox", "0 0 292.359 292.359");
				set_style(svg, "enable-background", "new 0 0 292.359 292.359");
				attr(svg, "transform", "translate(-5 0)");
				add_location(svg, file$1, 0, 0, 0);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, svg, anchor);
				append(svg, path);
			},

			p: noop,
			i: noop,
			o: noop,

			d: function destroy(detaching) {
				if (detaching) {
					detach(svg);
				}
			}
		};
	}

	class LeftArrow extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, null, create_fragment$1, safe_not_equal, []);
		}
	}

	/* src/assets/RightArrow.svelte generated by Svelte v3.4.1 */

	const file$2 = "src/assets/RightArrow.svelte";

	function create_fragment$2(ctx) {
		var svg, g, path;

		return {
			c: function create() {
				svg = svg_element("svg");
				g = svg_element("g");
				path = svg_element("path");
				attr(path, "d", "M222.979,5.424C219.364,1.807,215.08,0,210.132,0c-4.949,0-9.233,1.807-12.848,5.424L69.378,133.331\n      c-3.615,3.617-5.424,7.898-5.424,12.847c0,4.949,1.809,9.233,5.424,12.847l127.906,127.907c3.614,3.617,7.898,5.428,12.848,5.428\n      c4.948,0,9.232-1.811,12.847-5.428c3.617-3.614,5.427-7.898,5.427-12.847V18.271C228.405,13.322,226.596,9.042,222.979,5.424z");
				add_location(path, file$2, 7, 4, 173);
				add_location(g, file$2, 6, 2, 165);
				attr(svg, "width", "40px");
				attr(svg, "height", "40px");
				attr(svg, "viewBox", "0 0 292.359 292.359");
				set_style(svg, "enable-background", "new 0 0 292.359 292.359");
				attr(svg, "transform", "translate(5 0) rotate(180)");
				add_location(svg, file$2, 0, 0, 0);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, svg, anchor);
				append(svg, g);
				append(g, path);
			},

			p: noop,
			i: noop,
			o: noop,

			d: function destroy(detaching) {
				if (detaching) {
					detach(svg);
				}
			}
		};
	}

	class RightArrow extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, null, create_fragment$2, safe_not_equal, []);
		}
	}

	/* src/assets/Bullet.svelte generated by Svelte v3.4.1 */

	const file$3 = "src/assets/Bullet.svelte";

	function create_fragment$3(ctx) {
		var svg, path0, path1, path2, path3;

		return {
			c: function create() {
				svg = svg_element("svg");
				path0 = svg_element("path");
				path1 = svg_element("path");
				path2 = svg_element("path");
				path3 = svg_element("path");
				attr(path0, "d", "m341.652344 38.511719-37.839844 37.839843 46.960938 46.960938\n    37.839843-37.839844c8.503907-8.527344 15-18.839844\n    19.019531-30.191406l19.492188-55.28125-55.28125 19.492188c-11.351562\n    4.019531-21.664062 10.515624-30.191406 19.019531zm0 0");
				add_location(path0, file$3, 1, 2, 63);
				attr(path1, "d", "m258.65625 99.078125 69.390625 69.390625\n    14.425781-33.65625-50.160156-50.160156zm0 0");
				add_location(path1, file$3, 6, 2, 330);
				attr(path2, "d", "m.0429688 352.972656 28.2812502-28.285156 74.113281 74.113281-28.28125\n    28.28125zm0 0");
				add_location(path2, file$3, 9, 2, 438);
				attr(path3, "d", "m38.226562 314.789062 208.167969-208.171874 74.113281\n    74.113281-208.171874 208.171875zm0 0");
				add_location(path3, file$3, 12, 2, 546);
				attr(svg, "height", "40px");
				attr(svg, "viewBox", "0 0 427 427.08344");
				attr(svg, "width", "40px");
				add_location(svg, file$3, 0, 0, 0);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, svg, anchor);
				append(svg, path0);
				append(svg, path1);
				append(svg, path2);
				append(svg, path3);
			},

			p: noop,
			i: noop,
			o: noop,

			d: function destroy(detaching) {
				if (detaching) {
					detach(svg);
				}
			}
		};
	}

	class Bullet extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, null, create_fragment$3, safe_not_equal, []);
		}
	}

	function noop$1() {}

	function safe_not_equal$1(a, b) {
		return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
	}
	function writable(value, start = noop$1) {
	    let stop;
	    const subscribers = [];
	    function set(new_value) {
	        if (safe_not_equal$1(value, new_value)) {
	            value = new_value;
	            if (!stop) {
	                return; // not ready
	            }
	            subscribers.forEach((s) => s[1]());
	            subscribers.forEach((s) => s[0](value));
	        }
	    }
	    function update(fn) {
	        set(fn(value));
	    }
	    function subscribe$$1(run$$1, invalidate = noop$1) {
	        const subscriber = [run$$1, invalidate];
	        subscribers.push(subscriber);
	        if (subscribers.length === 1) {
	            stop = start(set) || noop$1;
	        }
	        run$$1(value);
	        return () => {
	            const index = subscribers.indexOf(subscriber);
	            if (index !== -1) {
	                subscribers.splice(index, 1);
	            }
	            if (subscribers.length === 0) {
	                stop();
	            }
	        };
	    }
	    return { set, update, subscribe: subscribe$$1 };
	}
	function get(store) {
	    let value;
	    store.subscribe((_) => value = _)();
	    return value;
	}

	const direction = writable(null);
	const angle = writable(0);
	const isFiring = writable(false);
	const lastFireAt = writable(0);
	const bulletList = writable([]);

	/* src/components/Controls.svelte generated by Svelte v3.4.1 */

	const file$4 = "src/components/Controls.svelte";

	// (37:6) <IconButton         start={setDirectionLeft}         release={resetDirection}         active={$direction === 'left'}>
	function create_default_slot_2(ctx) {
		var current;

		var leftarrow = new LeftArrow({ $$inline: true });

		return {
			c: function create() {
				leftarrow.$$.fragment.c();
			},

			m: function mount(target, anchor) {
				mount_component(leftarrow, target, anchor);
				current = true;
			},

			i: function intro(local) {
				if (current) return;
				leftarrow.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				leftarrow.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				leftarrow.$destroy(detaching);
			}
		};
	}

	// (43:6) <IconButton         start={setDirectionRight}         release={resetDirection}         active={$direction === 'right'}>
	function create_default_slot_1(ctx) {
		var current;

		var rightarrow = new RightArrow({ $$inline: true });

		return {
			c: function create() {
				rightarrow.$$.fragment.c();
			},

			m: function mount(target, anchor) {
				mount_component(rightarrow, target, anchor);
				current = true;
			},

			i: function intro(local) {
				if (current) return;
				rightarrow.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				rightarrow.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				rightarrow.$destroy(detaching);
			}
		};
	}

	// (50:4) <IconButton start={startFire} release={stopFire} active={$isFiring}>
	function create_default_slot(ctx) {
		var current;

		var bullet = new Bullet({ $$inline: true });

		return {
			c: function create() {
				bullet.$$.fragment.c();
			},

			m: function mount(target, anchor) {
				mount_component(bullet, target, anchor);
				current = true;
			},

			i: function intro(local) {
				if (current) return;
				bullet.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				bullet.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				bullet.$destroy(detaching);
			}
		};
	}

	function create_fragment$4(ctx) {
		var div2, div1, div0, t0, t1, current;

		var iconbutton0 = new IconButton({
			props: {
			start: ctx.setDirectionLeft,
			release: ctx.resetDirection,
			active: ctx.$direction === 'left',
			$$slots: { default: [create_default_slot_2] },
			$$scope: { ctx }
		},
			$$inline: true
		});

		var iconbutton1 = new IconButton({
			props: {
			start: ctx.setDirectionRight,
			release: ctx.resetDirection,
			active: ctx.$direction === 'right',
			$$slots: { default: [create_default_slot_1] },
			$$scope: { ctx }
		},
			$$inline: true
		});

		var iconbutton2 = new IconButton({
			props: {
			start: ctx.startFire,
			release: ctx.stopFire,
			active: ctx.$isFiring,
			$$slots: { default: [create_default_slot] },
			$$scope: { ctx }
		},
			$$inline: true
		});

		return {
			c: function create() {
				div2 = element("div");
				div1 = element("div");
				div0 = element("div");
				iconbutton0.$$.fragment.c();
				t0 = space();
				iconbutton1.$$.fragment.c();
				t1 = space();
				iconbutton2.$$.fragment.c();
				div0.className = "arrowGroup svelte-1d9v1w8";
				add_location(div0, file$4, 35, 4, 886);
				div1.className = "container svelte-1d9v1w8";
				add_location(div1, file$4, 34, 2, 858);
				div2.className = "controls svelte-1d9v1w8";
				add_location(div2, file$4, 33, 0, 833);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, div0);
				mount_component(iconbutton0, div0, null);
				append(div0, t0);
				mount_component(iconbutton1, div0, null);
				append(div1, t1);
				mount_component(iconbutton2, div1, null);
				current = true;
			},

			p: function update(changed, ctx) {
				var iconbutton0_changes = {};
				if (changed.setDirectionLeft) iconbutton0_changes.start = ctx.setDirectionLeft;
				if (changed.resetDirection) iconbutton0_changes.release = ctx.resetDirection;
				if (changed.$direction) iconbutton0_changes.active = ctx.$direction === 'left';
				if (changed.$$scope) iconbutton0_changes.$$scope = { changed, ctx };
				iconbutton0.$set(iconbutton0_changes);

				var iconbutton1_changes = {};
				if (changed.setDirectionRight) iconbutton1_changes.start = ctx.setDirectionRight;
				if (changed.resetDirection) iconbutton1_changes.release = ctx.resetDirection;
				if (changed.$direction) iconbutton1_changes.active = ctx.$direction === 'right';
				if (changed.$$scope) iconbutton1_changes.$$scope = { changed, ctx };
				iconbutton1.$set(iconbutton1_changes);

				var iconbutton2_changes = {};
				if (changed.startFire) iconbutton2_changes.start = ctx.startFire;
				if (changed.stopFire) iconbutton2_changes.release = ctx.stopFire;
				if (changed.$isFiring) iconbutton2_changes.active = ctx.$isFiring;
				if (changed.$$scope) iconbutton2_changes.$$scope = { changed, ctx };
				iconbutton2.$set(iconbutton2_changes);
			},

			i: function intro(local) {
				if (current) return;
				iconbutton0.$$.fragment.i(local);

				iconbutton1.$$.fragment.i(local);

				iconbutton2.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				iconbutton0.$$.fragment.o(local);
				iconbutton1.$$.fragment.o(local);
				iconbutton2.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				if (detaching) {
					detach(div2);
				}

				iconbutton0.$destroy();

				iconbutton1.$destroy();

				iconbutton2.$destroy();
			}
		};
	}

	function instance$1($$self, $$props, $$invalidate) {
		let $direction, $isFiring;

		validate_store(direction, 'direction');
		subscribe($$self, direction, $$value => { $direction = $$value; $$invalidate('$direction', $direction); });
		validate_store(isFiring, 'isFiring');
		subscribe($$self, isFiring, $$value => { $isFiring = $$value; $$invalidate('$isFiring', $isFiring); });

		

	  const resetDirection = () => direction.set(null);
	  const setDirectionLeft = () => direction.set("left");
	  const setDirectionRight = () => direction.set("right");
	  const startFire = () => isFiring.set(true);
	  const stopFire = () => isFiring.set(false);

		return {
			resetDirection,
			setDirectionLeft,
			setDirectionRight,
			startFire,
			stopFire,
			$direction,
			$isFiring
		};
	}

	class Controls extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$4, safe_not_equal, []);
		}
	}

	/* src/components/Cannon.svelte generated by Svelte v3.4.1 */

	const file$5 = "src/components/Cannon.svelte";

	function create_fragment$5(ctx) {
		var g, rect, g_transform_value;

		return {
			c: function create() {
				g = svg_element("g");
				rect = svg_element("rect");
				attr(rect, "width", "8 ");
				attr(rect, "height", "60");
				attr(rect, "fill", "#212121");
				add_location(rect, file$5, 11, 2, 206);
				attr(g, "class", "cannon svelte-r8lgo8");
				attr(g, "transform", g_transform_value = `translate(236, 700) rotate(${ctx.$angle})`);
				add_location(g, file$5, 10, 0, 133);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, rect);
			},

			p: function update(changed, ctx) {
				if ((changed.$angle) && g_transform_value !== (g_transform_value = `translate(236, 700) rotate(${ctx.$angle})`)) {
					attr(g, "transform", g_transform_value);
				}
			},

			i: noop,
			o: noop,

			d: function destroy(detaching) {
				if (detaching) {
					detach(g);
				}
			}
		};
	}

	function instance$2($$self, $$props, $$invalidate) {
		let $angle;

		validate_store(angle, 'angle');
		subscribe($$self, angle, $$value => { $angle = $$value; $$invalidate('$angle', $angle); });

		return { $angle };
	}

	class Cannon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$5, safe_not_equal, []);
		}
	}

	/* src/components/Bullet.svelte generated by Svelte v3.4.1 */

	const file$6 = "src/components/Bullet.svelte";

	function create_fragment$6(ctx) {
		var g, rect, g_transform_value;

		return {
			c: function create() {
				g = svg_element("g");
				rect = svg_element("rect");
				attr(rect, "width", "3");
				attr(rect, "height", "5");
				attr(rect, "fill", "#212121");
				add_location(rect, file$6, 7, 2, 144);
				attr(g, "class", "mashineGun");
				attr(g, "transform", g_transform_value = `translate(${ctx.bullet.x}, ${ctx.bullet.y}) rotate(${ctx.bullet.angle})`);
				add_location(g, file$6, 4, 0, 41);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, rect);
			},

			p: function update(changed, ctx) {
				if ((changed.bullet) && g_transform_value !== (g_transform_value = `translate(${ctx.bullet.x}, ${ctx.bullet.y}) rotate(${ctx.bullet.angle})`)) {
					attr(g, "transform", g_transform_value);
				}
			},

			i: noop,
			o: noop,

			d: function destroy(detaching) {
				if (detaching) {
					detach(g);
				}
			}
		};
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { bullet } = $$props;

		$$self.$set = $$props => {
			if ('bullet' in $$props) $$invalidate('bullet', bullet = $$props.bullet);
		};

		return { bullet };
	}

	class Bullet$1 extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$6, safe_not_equal, ["bullet"]);

			const { ctx } = this.$$;
			const props = options.props || {};
			if (ctx.bullet === undefined && !('bullet' in props)) {
				console.warn("<Bullet> was created without expected prop 'bullet'");
			}
		}

		get bullet() {
			throw new Error("<Bullet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set bullet(value) {
			throw new Error("<Bullet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src/components/Enemy.svelte generated by Svelte v3.4.1 */

	const file$7 = "src/components/Enemy.svelte";

	function create_fragment$7(ctx) {
		var g, rect, g_transform_value;

		return {
			c: function create() {
				g = svg_element("g");
				rect = svg_element("rect");
				attr(rect, "width", "30");
				attr(rect, "height", "30");
				attr(rect, "fill", "#212121");
				add_location(rect, file$7, 5, 2, 94);
				attr(g, "transform", g_transform_value = `translate(${ctx.enemy.x}, ${ctx.enemy.y})`);
				add_location(g, file$7, 4, 0, 40);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, g, anchor);
				append(g, rect);
			},

			p: function update(changed, ctx) {
				if ((changed.enemy) && g_transform_value !== (g_transform_value = `translate(${ctx.enemy.x}, ${ctx.enemy.y})`)) {
					attr(g, "transform", g_transform_value);
				}
			},

			i: noop,
			o: noop,

			d: function destroy(detaching) {
				if (detaching) {
					detach(g);
				}
			}
		};
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { enemy } = $$props;

		$$self.$set = $$props => {
			if ('enemy' in $$props) $$invalidate('enemy', enemy = $$props.enemy);
		};

		return { enemy };
	}

	class Enemy extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$7, safe_not_equal, ["enemy"]);

			const { ctx } = this.$$;
			const props = options.props || {};
			if (ctx.enemy === undefined && !('enemy' in props)) {
				console.warn("<Enemy> was created without expected prop 'enemy'");
			}
		}

		get enemy() {
			throw new Error("<Enemy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set enemy(value) {
			throw new Error("<Enemy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	// Массив врагов
	const enemyList = writable([]);
	// Временная метка добавления последнего врага
	const lastEnemyAddedAt = writable(0);

	/* src/components/GameField.svelte generated by Svelte v3.4.1 */

	const file$8 = "src/components/GameField.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.bullet = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = Object.create(ctx);
		child_ctx.enemy = list[i];
		return child_ctx;
	}

	// (22:4) {#each $enemyList as enemy (enemy.id)}
	function create_each_block_1(key_1, ctx) {
		var first, current;

		var enemy = new Enemy({
			props: { enemy: ctx.enemy },
			$$inline: true
		});

		return {
			key: key_1,

			first: null,

			c: function create() {
				first = empty();
				enemy.$$.fragment.c();
				this.first = first;
			},

			m: function mount(target, anchor) {
				insert(target, first, anchor);
				mount_component(enemy, target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var enemy_changes = {};
				if (changed.$enemyList) enemy_changes.enemy = ctx.enemy;
				enemy.$set(enemy_changes);
			},

			i: function intro(local) {
				if (current) return;
				enemy.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				enemy.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				if (detaching) {
					detach(first);
				}

				enemy.$destroy(detaching);
			}
		};
	}

	// (25:4) {#each $bulletList as bullet (bullet.id)}
	function create_each_block(key_1, ctx) {
		var first, current;

		var bullet = new Bullet$1({
			props: { bullet: ctx.bullet },
			$$inline: true
		});

		return {
			key: key_1,

			first: null,

			c: function create() {
				first = empty();
				bullet.$$.fragment.c();
				this.first = first;
			},

			m: function mount(target, anchor) {
				insert(target, first, anchor);
				mount_component(bullet, target, anchor);
				current = true;
			},

			p: function update(changed, ctx) {
				var bullet_changes = {};
				if (changed.$bulletList) bullet_changes.bullet = ctx.bullet;
				bullet.$set(bullet_changes);
			},

			i: function intro(local) {
				if (current) return;
				bullet.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				bullet.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				if (detaching) {
					detach(first);
				}

				bullet.$destroy(detaching);
			}
		};
	}

	function create_fragment$8(ctx) {
		var div, svg, each_blocks_1 = [], each0_lookup = new Map(), each0_anchor, each_blocks = [], each1_lookup = new Map(), each1_anchor, current;

		var each_value_1 = ctx.$enemyList;

		const get_key = ctx => ctx.enemy.id;

		for (var i = 0; i < each_value_1.length; i += 1) {
			let child_ctx = get_each_context_1(ctx, each_value_1, i);
			let key = get_key(child_ctx);
			each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
		}

		var each_value = ctx.$bulletList;

		const get_key_1 = ctx => ctx.bullet.id;

		for (var i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context(ctx, each_value, i);
			let key = get_key_1(child_ctx);
			each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
		}

		var cannon = new Cannon({ $$inline: true });

		return {
			c: function create() {
				div = element("div");
				svg = svg_element("svg");

				for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].c();

				each0_anchor = empty();

				for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();

				each1_anchor = empty();
				cannon.$$.fragment.c();
				attr(svg, "viewBox", "0 0 480 800");
				add_location(svg, file$8, 20, 2, 418);
				div.className = "container svelte-1a0dmdb";
				add_location(div, file$8, 19, 0, 392);
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				insert(target, div, anchor);
				append(div, svg);

				for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].m(svg, null);

				append(svg, each0_anchor);

				for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(svg, null);

				append(svg, each1_anchor);
				mount_component(cannon, svg, null);
				current = true;
			},

			p: function update(changed, ctx) {
				const each_value_1 = ctx.$enemyList;

				group_outros();
				each_blocks_1 = update_keyed_each(each_blocks_1, changed, get_key, 1, ctx, each_value_1, each0_lookup, svg, outro_and_destroy_block, create_each_block_1, each0_anchor, get_each_context_1);
				check_outros();

				const each_value = ctx.$bulletList;

				group_outros();
				each_blocks = update_keyed_each(each_blocks, changed, get_key_1, 1, ctx, each_value, each1_lookup, svg, outro_and_destroy_block, create_each_block, each1_anchor, get_each_context);
				check_outros();
			},

			i: function intro(local) {
				if (current) return;
				for (var i = 0; i < each_value_1.length; i += 1) each_blocks_1[i].i();

				for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

				cannon.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].o();

				for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].o();

				cannon.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				if (detaching) {
					detach(div);
				}

				for (i = 0; i < each_blocks_1.length; i += 1) each_blocks_1[i].d();

				for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();

				cannon.$destroy();
			}
		};
	}

	function instance$5($$self, $$props, $$invalidate) {
		let $enemyList, $bulletList;

		validate_store(enemyList, 'enemyList');
		subscribe($$self, enemyList, $$value => { $enemyList = $$value; $$invalidate('$enemyList', $enemyList); });
		validate_store(bulletList, 'bulletList');
		subscribe($$self, bulletList, $$value => { $bulletList = $$value; $$invalidate('$bulletList', $bulletList); });

		return { $enemyList, $bulletList };
	}

	class GameField extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$8, safe_not_equal, []);
		}
	}

	const isPlaying = writable(null);

	function rotateCannon() {
	  const currentAngle = get(angle);
	  switch (get(direction)) {
	    case 'left':
	      if (currentAngle > -45) angle.update(a => a - 0.4);
	      break;
	    case 'right':
	      if (currentAngle < 45) angle.update(a => a + 0.4);
	      break;
	    default:
	      break;
	  }
	}

	function shoot() {
	  if (get(isFiring) && Date.now() - get(lastFireAt) > 800) {
	    lastFireAt.set(Date.now());
	    bulletList.update(bullets => [
	      ...bullets,
	      { x: 238, y: 760, angle: get(angle), id: () => Math.random() + Date.now() },
	    ]);
	  }
	}

	function moveBullet() {
	  bulletList.update(bullets =>
	    bullets.map(bullet => ({
	      ...bullet,
	      y: bullet.y - 20,
	      x: (780 - bullet.y) * Math.tan((bullet.angle * Math.PI) / 180) + 238,
	    })),
	  );
	}

	function clearBullets() {
	  bulletList.update(bullets => bullets.filter(bullet => bullet.y > 0));
	}

	function removeBullet(id) {
	  bulletList.update(bullets => bullets.filter(bullet => bullet.id !== id));
	}

	function addEnemy() {
	  if (Date.now() - get(lastEnemyAddedAt) > 2500) {
	    lastEnemyAddedAt.set(Date.now());
	    enemyList.update(enemies => [
	      ...enemies,
	      {
	        x: Math.floor(Math.random() * 449) + 1,
	        y: 0,
	        id: () => Math.random() + Date.now(),
	      },
	    ]);
	  }
	}

	function moveEnemy() {
	  enemyList.update(enemyList =>
	    enemyList.map(enemy => ({
	      ...enemy,
	      y: enemy.y + 0.5,
	    })),
	  );
	}

	function removeEnemy(id) {
	  enemyList.update(enemies => enemies.filter(enemy => enemy.id !== id));
	}

	const enemyWidth = 30;
	const bulletWidth = 5;
	const enemyHeight = 30;
	const bulletHeight = 8;

	function checkCollision() {
	  get(bulletList).forEach(bullet => {
	    get(enemyList).forEach(enemy => {
	      if (
	        bullet.x < enemy.x + enemyWidth &&
	        bullet.x + bulletWidth > enemy.x &&
	        bullet.y < enemy.y + enemyHeight &&
	        bullet.y + bulletHeight > enemy.y
	      ) {
	        removeBullet(bullet.id);
	        removeEnemy(enemy.id);
	      }
	    });
	  });
	}

	function startLoop(steps) {
	  window.requestAnimationFrame(() => {
	    steps.forEach(step => {
	      if (typeof step === 'function') step();
	    });
	    if (get(isPlaying)) startLoop(steps);
	  });
	}

	const startGame = () => {
	  isPlaying.set(true);
	  startLoop([rotateCannon, shoot, moveBullet, clearBullets, addEnemy, moveEnemy, checkCollision]);
	};

	/* src/App.svelte generated by Svelte v3.4.1 */

	function create_fragment$9(ctx) {
		var t, current;

		var controls = new Controls({ $$inline: true });

		var gamefield = new GameField({ $$inline: true });

		return {
			c: function create() {
				controls.$$.fragment.c();
				t = space();
				gamefield.$$.fragment.c();
			},

			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},

			m: function mount(target, anchor) {
				mount_component(controls, target, anchor);
				insert(target, t, anchor);
				mount_component(gamefield, target, anchor);
				current = true;
			},

			p: noop,

			i: function intro(local) {
				if (current) return;
				controls.$$.fragment.i(local);

				gamefield.$$.fragment.i(local);

				current = true;
			},

			o: function outro(local) {
				controls.$$.fragment.o(local);
				gamefield.$$.fragment.o(local);
				current = false;
			},

			d: function destroy(detaching) {
				controls.$destroy(detaching);

				if (detaching) {
					detach(t);
				}

				gamefield.$destroy(detaching);
			}
		};
	}

	function instance$6($$self) {
		
	  startGame();

		return {};
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$9, safe_not_equal, []);
		}
	}

	const app = new App({
		target: document.body,
		props: {
			name: 'world'
		}
	});

	return app;

}());
//# sourceMappingURL=bundle.js.map
