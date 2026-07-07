import {
  Directive,
  Input,
  input,
  numberAttribute,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵattribute,
  ɵɵdefineDirective
} from "./chunk-G6S5EMIQ.js";
import {
  InjectionToken,
  computed,
  inject
} from "./chunk-HGQZ4Q3T.js";
import "./chunk-HWYXSU2G.js";
import "./chunk-JRFR6BLO.js";
import "./chunk-MARUHEWW.js";
import "./chunk-H2SRQSE4.js";

// node_modules/@spartan-ng/brain/fesm2022/spartan-ng-brain-progress.mjs
var BrnProgressToken = new InjectionToken("BrnProgressComponent");
function provideBrnProgress(progress) {
  return {
    provide: BrnProgressToken,
    useExisting: progress
  };
}
function injectBrnProgress() {
  return inject(BrnProgressToken);
}
var BrnProgress = class _BrnProgress {
  /**
   * The current progress value.
   */
  value = input(void 0, ...ngDevMode ? [{
    debugName: "value",
    transform: (value) => value === void 0 || value === null ? void 0 : Number(value)
  }] : [{
    transform: (value) => value === void 0 || value === null ? void 0 : Number(value)
  }]);
  /**
   * The maximum progress value.
   */
  max = input(100, ...ngDevMode ? [{
    debugName: "max",
    transform: numberAttribute
  }] : [{
    transform: numberAttribute
  }]);
  /**
   * A function that returns the label for the current progress value.
   */
  getValueLabel = input((value, max) => `${Math.round(value / max * 100)}%`, ...ngDevMode ? [{
    debugName: "getValueLabel"
  }] : []);
  _label = computed(() => {
    const value = this.value();
    return value === null || value === void 0 ? void 0 : this.getValueLabel()(value, this.max());
  }, ...ngDevMode ? [{
    debugName: "_label"
  }] : []);
  state = computed(() => {
    const value = this.value();
    const max = this.max();
    return value === null || value === void 0 ? "indeterminate" : value === max ? "complete" : "loading";
  }, ...ngDevMode ? [{
    debugName: "state"
  }] : []);
  ngOnChanges(changes) {
    if ("value" in changes || "max" in changes) {
      this.validate();
    }
  }
  validate() {
    const value = this.value();
    const max = this.max();
    if (value === null || value === void 0) {
      return;
    }
    if (value > max || value < 0) {
      throw Error("Value must be 0 or greater and less or equal to max");
    }
    if (max < 0) {
      throw Error("max must be greater than 0");
    }
  }
  /** @nocollapse */
  static ɵfac = function BrnProgress_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnProgress)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnProgress,
    selectors: [["brn-progress"]],
    hostAttrs: ["role", "progressbar"],
    hostVars: 7,
    hostBindings: function BrnProgress_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("aria-valuemax", ctx.max())("aria-valuemin", 0)("aria-valuenow", ctx.value())("aria-valuetext", ctx._label())("data-state", ctx.state())("data-value", ctx.value())("data-max", ctx.max());
      }
    },
    inputs: {
      value: [1, "value"],
      max: [1, "max"],
      getValueLabel: [1, "getValueLabel"]
    },
    exportAs: ["brnProgress"],
    features: [ɵɵProvidersFeature([provideBrnProgress(_BrnProgress)]), ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnProgress, [{
    type: Directive,
    args: [{
      selector: "brn-progress",
      exportAs: "brnProgress",
      providers: [provideBrnProgress(BrnProgress)],
      host: {
        role: "progressbar",
        "[attr.aria-valuemax]": "max()",
        "[attr.aria-valuemin]": "0",
        "[attr.aria-valuenow]": "value()",
        "[attr.aria-valuetext]": "_label()",
        "[attr.data-state]": "state()",
        "[attr.data-value]": "value()",
        "[attr.data-max]": "max()"
      }
    }]
  }], null, {
    value: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "value",
        required: false
      }]
    }],
    max: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "max",
        required: false
      }]
    }],
    getValueLabel: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "getValueLabel",
        required: false
      }]
    }]
  });
})();
var BrnProgressIndicator = class _BrnProgressIndicator {
  _progress = injectBrnProgress();
  /** @nocollapse */
  static ɵfac = function BrnProgressIndicator_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrnProgressIndicator)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _BrnProgressIndicator,
    selectors: [["brn-progress-indicator"]],
    hostVars: 3,
    hostBindings: function BrnProgressIndicator_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("data-state", ctx._progress.state())("data-value", ctx._progress.value())("data-max", ctx._progress.max());
      }
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrnProgressIndicator, [{
    type: Directive,
    args: [{
      selector: "brn-progress-indicator",
      host: {
        "[attr.data-state]": "_progress.state()",
        "[attr.data-value]": "_progress.value()",
        "[attr.data-max]": "_progress.max()"
      }
    }]
  }], null, null);
})();
var BrnProgressImports = [BrnProgress, BrnProgressIndicator];
export {
  BrnProgress,
  BrnProgressImports,
  BrnProgressIndicator,
  injectBrnProgress
};
//# sourceMappingURL=@spartan-ng_brain_progress.js.map
