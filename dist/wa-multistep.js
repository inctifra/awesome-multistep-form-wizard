//#region src/errors/ErrorStore.ts
var e = class {
	errors = /* @__PURE__ */ new Map();
	set(e, t) {
		if (t.length === 0) {
			this.errors.delete(e);
			return;
		}
		this.errors.set(e, t);
	}
	add(e) {
		let t = this.errors.get(e.field) ?? [];
		this.errors.set(e.field, [...t, e]);
	}
	get(e) {
		return [...this.errors.get(e) ?? []];
	}
	getFirst(e) {
		return this.errors.get(e)?.[0];
	}
	has(e) {
		return this.errors.has(e);
	}
	clear(e) {
		if (e) {
			this.errors.delete(e);
			return;
		}
		this.errors.clear();
	}
	all() {
		return Array.from(this.errors.values()).flat();
	}
	forFields(e) {
		let t = new Set(e);
		return this.all().filter((e) => t.has(e.field));
	}
}, t = class {
	show(e, t) {
		e.setAttribute("data-invalid", ""), e.setAttribute("aria-invalid", "true"), e.setAttribute("data-validation-message", t.message);
		let n = e;
		"helpText" in n && (n.helpText = t.message);
	}
	clear(e) {
		e.removeAttribute("data-invalid"), e.removeAttribute("aria-invalid"), e.removeAttribute("data-validation-message");
		let t = e;
		"helpText" in t && (t.helpText = "");
	}
}, n = class {
	form;
	constructor(e) {
		this.form = e;
	}
	findField(e) {
		return this.form.querySelectorAll(`[name="${this.escapeAttribute(e)}"]`).item(0) || null;
	}
	findStepFields(e) {
		return (e.fields ?? []).flatMap((e) => {
			let t = this.findField(e);
			return t ? [t] : [];
		});
	}
	findMissingFields(e) {
		return (e.fields ?? []).filter((e) => !this.findField(e));
	}
	escapeAttribute(e) {
		return e.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
	}
}, r = class {
	read(e) {
		let t = e;
		return this.isCheckbox(e) ? t.checked === !0 : "value" in t ? t.value ?? "" : e.getAttribute("value") ?? "";
	}
	readMany(e) {
		let t = {};
		for (let n of e) {
			let e = n.getAttribute("name");
			e && (t[e] = this.read(n));
		}
		return t;
	}
	readForm(e) {
		let t = Array.from(e.querySelectorAll("[name]"));
		return this.readMany(t);
	}
	isCheckbox(e) {
		return e.matches("wa-checkbox") || e.getAttribute("type") === "checkbox";
	}
}, i = class {
	controllers = /* @__PURE__ */ new Map();
	runIds = /* @__PURE__ */ new Map();
	begin(e) {
		this.controllers.get(e)?.abort();
		let t = new AbortController(), n = (this.runIds.get(e) ?? 0) + 1;
		return this.controllers.set(e, t), this.runIds.set(e, n), {
			signal: t.signal,
			runId: n
		};
	}
	isCurrent(e, t) {
		return this.runIds.get(e) === t;
	}
	cancel(e) {
		this.controllers.get(e)?.abort(), this.controllers.delete(e);
	}
	cancelAll() {
		for (let e of this.controllers.values()) e.abort();
		this.controllers.clear();
	}
}, a = class {
	form;
	fieldDiscovery;
	valueReader;
	errorStore;
	asyncManager;
	constructor(e, t, n, r, i) {
		this.form = e, this.fieldDiscovery = t, this.valueReader = n, this.errorStore = r, this.asyncManager = i;
	}
	async validateStep(e) {
		let t = this.fieldDiscovery.findStepFields(e), n = { ...this.valueReader.readForm(this.form) }, r = [], i = this.fieldDiscovery.findMissingFields(e);
		for (let e of i) r.push({
			field: e,
			message: `Field "${e}" was not found.`,
			source: "system"
		});
		if (i.length > 0) return this.finish(e, r, "invalid");
		for (let i of e.validators ?? []) {
			let a = await this.runValidator(e, i, t, n);
			(a.valid || a.status !== "aborted") && (a.valid || r.push(this.toError(i, a, e)));
		}
		for (let t of e.fields ?? []) {
			let e = r.filter((e) => e.field === t);
			this.errorStore.set(t, e);
		}
		return this.finish(e, r, r.length === 0 ? "valid" : "invalid");
	}
	async runValidator(e, t, n, r) {
		let i = [
			"step",
			e.id,
			t.name ?? "anonymous",
			...t.fields ?? []
		].join(":"), { signal: a, runId: o } = this.asyncManager.begin(i), s = t.fields?.flatMap((e) => {
			let t = this.fieldDiscovery.findField(e);
			return t ? [t] : [];
		}) ?? n, c = s[0];
		try {
			let n = await t.validate({
				value: c ? this.valueReader.read(c) : void 0,
				values: r,
				field: c,
				fields: s,
				form: this.form,
				step: e,
				signal: a
			});
			return this.asyncManager.isCurrent(i, o) ? n : {
				valid: !1,
				status: "aborted",
				message: ""
			};
		} catch (e) {
			return a.aborted ? {
				valid: !1,
				status: "aborted"
			} : {
				valid: !1,
				status: "error",
				source: "system",
				message: e instanceof Error ? e.message : "Validation failed."
			};
		}
	}
	toError(e, t, n) {
		return {
			field: e.fields?.[0] ?? n.fields?.[0] ?? "__step__",
			message: t.message,
			...t.code ? { code: t.code } : {},
			source: t.source ?? e.source ?? "custom"
		};
	}
	finish(e, t, n) {
		return {
			valid: t.length === 0,
			errors: t,
			status: n
		};
	}
}, o = class {
	listeners = /* @__PURE__ */ new Map();
	on(e, t) {
		let n = this.listeners.get(e) ?? /* @__PURE__ */ new Set();
		return n.add(t), this.listeners.set(e, n), () => {
			n.delete(t);
		};
	}
	emit(e, t) {
		let n = this.listeners.get(e);
		if (n) for (let e of n) e(t);
	}
	clear() {
		this.listeners.clear();
	}
}, s = class extends Error {
	constructor(e) {
		super(`WaMultiStepForm: ${e}`), this.name = "WaMultiStepFormError";
	}
};
//#endregion
//#region src/core/resolve-form.ts
function c(e) {
	if (e instanceof HTMLFormElement) return e;
	let t = document.querySelector(e);
	if (!(t instanceof HTMLFormElement)) throw new s(`No form was found for selector "${e}".`);
	return t;
}
//#endregion
//#region src/core/WizardState.ts
var l = class {
	state;
	constructor(e) {
		let t = e[0];
		if (!t) throw Error("At least one wizard step is required.");
		this.state = {
			currentStepIndex: 0,
			visited: /* @__PURE__ */ new Set([t]),
			valid: new Map(e.map((e) => [e, !1]))
		};
	}
	get currentStepIndex() {
		return this.state.currentStepIndex;
	}
	set currentStepIndex(e) {
		this.state.currentStepIndex = e;
	}
	markVisited(e) {
		this.state.visited.add(e);
	}
	isVisited(e) {
		return this.state.visited.has(e);
	}
	setValid(e, t) {
		this.state.valid.set(e, t);
	}
	isValid(e) {
		return this.state.valid.get(e) === !0;
	}
	snapshot() {
		return {
			currentStepIndex: this.state.currentStepIndex,
			visited: new Set(this.state.visited),
			valid: new Map(this.state.valid)
		};
	}
};
//#endregion
//#region src/core/css.ts
function u(e) {
	return typeof CSS < "u" && typeof CSS.escape == "function" ? CSS.escape(e) : e.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}
//#endregion
//#region src/navigation/TabGroupController.ts
var d = class {
	form;
	tabGroup;
	tabs = /* @__PURE__ */ new Map();
	constructor(e, t, n = "wa-tab-group") {
		this.form = e;
		let r = e.querySelector(n);
		if (!(r instanceof HTMLElement)) throw new s(`No ${n} was found inside the configured form.`);
		this.tabGroup = r;
		for (let e of t) this.tabs.set(e, this.resolveStepElements(e));
	}
	getStepElements(e) {
		let t = this.tabs.get(e);
		if (!t) throw new s(`Unknown step "${e}".`);
		return t;
	}
	setActive(e) {
		this.getStepElements(e);
		let t = this.tabGroup;
		t.active = e;
	}
	disable(e, t = !0) {
		let { tab: n } = this.getStepElements(e), r = n;
		r.disabled = t;
	}
	resolveStepElements(e) {
		let t = u(e), n = this.form.querySelector(`wa-tab[panel="${t}"]`);
		if (!(n instanceof HTMLElement)) throw new s(`No <wa-tab panel="${e}"> was found.`);
		let r = this.form.querySelector(`wa-tab-panel[name="${t}"]`);
		if (!(r instanceof HTMLElement)) throw new s(`No <wa-tab-panel name="${e}"> was found.`);
		return {
			tab: n,
			panel: r
		};
	}
}, f = class {
	form;
	config;
	state;
	tabs;
	errorStore;
	fieldDiscovery;
	valueReader;
	asyncManager;
	validationEngine;
	events = new o();
	constructor(t) {
		if (!t.steps?.length) throw new s("At least one step is required.");
		let o = t.steps.map((e) => e.id);
		this.assertUniqueStepIds(o), this.form = c(t.form), this.config = t, this.state = new l(o), this.tabs = new d(this.form, o, t.selectors?.tabGroup ?? "wa-tab-group"), this.errorStore = new e(), this.fieldDiscovery = new n(this.form), this.valueReader = new r(), this.asyncManager = new i(), this.validationEngine = new a(this.form, this.fieldDiscovery, this.valueReader, this.errorStore, this.asyncManager), this.initialize();
	}
	on(e, t) {
		return this.events.on(e, t);
	}
	getCurrentStep() {
		return this.config.steps[this.state.currentStepIndex].id;
	}
	getValues() {
		return this.valueReader.readForm(this.form);
	}
	getErrors() {
		return this.errorStore.all();
	}
	getState() {
		return this.state.snapshot();
	}
	async validate() {
		let e = this.currentStep();
		this.events.emit("validation:start", { step: e.id });
		let t = await this.validationEngine.validateStep(e);
		return this.renderErrors(e), this.state.setValid(e.id, t.valid), this.events.emit("validation:end", {
			step: e.id,
			summary: t
		}), t.valid ? this.events.emit("step:valid", {
			step: e.id,
			values: this.getValues()
		}) : this.events.emit("step:invalid", {
			step: e.id,
			errors: t.errors
		}), t;
	}
	async next() {
		if (!(await this.validate()).valid) return;
		let e = this.state.currentStepIndex + 1;
		if (e >= this.config.steps.length) {
			this.events.emit("complete", { values: this.getValues() });
			return;
		}
		let t = this.config.steps[e];
		t && this.goTo(t.id);
	}
	previous() {
		let e = this.state.currentStepIndex - 1;
		if (e < 0) return;
		let t = this.config.steps[e];
		t && this.goTo(t.id, { ignoreNavigationRules: !0 });
	}
	goTo(e, t = {}) {
		let n = this.config.steps.findIndex((t) => t.id === e);
		if (n === -1) throw new s(`Unknown step "${e}".`);
		if (!t.ignoreNavigationRules && !this.canNavigateTo(n)) return;
		let r = this.getCurrentStep();
		this.state.currentStepIndex = n, this.state.markVisited(e), this.tabs.setActive(e), this.enableOnly(e), this.events.emit("step:change", {
			from: r,
			to: e
		});
	}
	destroy() {
		this.asyncManager.cancelAll(), this.events.clear();
	}
	initialize() {
		let e = this.config.steps[0];
		if (!e) throw new s("At least one step is required.");
		this.tabs.setActive(e.id), this.enableOnly(e.id), this.bindButtons();
	}
	bindButtons() {
		let e = this.config.selectors?.next ?? ".wa-multistep-next", t = this.config.selectors?.previous ?? ".wa-multistep-previous";
		this.form.querySelectorAll(e).forEach((e) => {
			e.addEventListener("click", (e) => {
				e.preventDefault(), this.next();
			});
		}), this.form.querySelectorAll(t).forEach((e) => {
			e.addEventListener("click", (e) => {
				e.preventDefault(), this.previous();
			});
		});
	}
	enableOnly(e) {
		for (let t of this.config.steps) this.tabs.disable(t.id, t.id !== e);
	}
	canNavigateTo(e) {
		let t = this.state.currentStepIndex;
		if (e <= t) return !0;
		let n = {
			allowJumpToVisited: !1,
			allowJumpToFuture: !1,
			...this.config.navigation
		};
		return n.allowJumpToFuture ? !0 : !(e > t + 1 && !n.allowJumpToVisited);
	}
	currentStep() {
		let e = this.config.steps[this.state.currentStepIndex];
		if (!e) throw new s("The current wizard step does not exist.");
		return e;
	}
	renderErrors(e) {
		let n = this.config.errorRenderer ?? new t();
		for (let t of e.fields ?? []) {
			let r = this.fieldDiscovery.findField(t);
			if (!r) continue;
			let i = this.errorStore.getFirst(t);
			i ? (n.show(r, i), this.events.emit("field:invalid", {
				step: e.id,
				field: t,
				error: i
			})) : (n.clear(r), this.events.emit("field:valid", {
				step: e.id,
				field: t
			}));
		}
	}
	assertUniqueStepIds(e) {
		if (new Set(e).size !== e.length) throw new s("Step IDs must be unique.");
	}
};
//#endregion
//#region src/adapters/zod.ts
function p(e) {
	return ({ values: t }) => {
		let n = e.schema.safeParse(t);
		if (n.success) return { valid: !0 };
		let r = n.error.issues[0];
		return r ? {
			valid: !1,
			message: r.message,
			source: "schema",
			...r.code ? { code: r.code } : {}
		} : {
			valid: !1,
			message: "Form validation failed.",
			source: "schema"
		};
	};
}
//#endregion
//#region src/adapters/vest.ts
function m(e) {
	return async ({ values: t, signal: n }) => {
		let r = await e.suite.run(t, { signal: n });
		return (e.field ? r.hasErrors?.(e.field) === !0 : r.hasErrors?.() === !0 || (r.errorCount ?? 0) > 0) ? {
			valid: !1,
			message: (e.field ? r.getErrors?.(e.field)?.[0] : r.getErrors?.()?.[0]) ?? "Validation failed.",
			source: "vest"
		} : { valid: !0 };
	};
}
//#endregion
//#region src/validation/backendUrlValidator.ts
function h(e) {
	return async ({ value: t, values: n, signal: r }) => {
		let i = {
			value: t,
			values: n,
			signal: r
		}, a = typeof e.headers == "function" ? e.headers(i) : e.headers ?? { "Content-Type": "application/json" }, o = await fetch(e.url, {
			method: e.method ?? "POST",
			headers: a,
			body: JSON.stringify(e.body?.(i) ?? {
				value: t,
				values: n
			}),
			signal: r
		});
		if (!o.ok) throw Error(`Validation request failed with status ${o.status}.`);
		let s = await o.json();
		if (e.parseResponse) return e.parseResponse(s, o);
		let c = s;
		return c.valid ? {
			valid: !0,
			status: "valid"
		} : {
			valid: !1,
			message: c.message ?? "The value is invalid.",
			source: "backend"
		};
	};
}
//#endregion
export { f as WaMultiStepForm, s as WaMultiStepFormError, h as backendUrlValidator, m as vestValidator, p as zodValidator };
