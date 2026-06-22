import { assign } from "min-dash";

/**
 * A palette provider for BPMN 2.0 elements.
 */
export default function PaletteProvider(
    palette,
    create,
    elementFactory,
    spaceTool,
    lassoTool,
    handTool,
    globalConnect,
    translate,
) {
    this._palette = palette;
    this._create = create;
    this._elementFactory = elementFactory;
    this._spaceTool = spaceTool;
    this._lassoTool = lassoTool;
    this._handTool = handTool;
    this._globalConnect = globalConnect;
    this._translate = translate;

    palette.registerProvider(this);
}

PaletteProvider.$inject = [
    "palette",
    "create",
    "elementFactory",
    "spaceTool",
    "lassoTool",
    "handTool",
    "globalConnect",
    "translate",
];

PaletteProvider.prototype.getPaletteEntries = function () {
    const actions = {},
        create = this._create,
        elementFactory = this._elementFactory,
        spaceTool = this._spaceTool,
        lassoTool = this._lassoTool,
        handTool = this._handTool,
        globalConnect = this._globalConnect,
        translate = this._translate;

    function createAction(type, group, className, title, options) {
        function createListener(event) {
            const shape = elementFactory.createShape(
                assign({ type: type }, options),
            );

            if (options) {
                shape.businessObject.di.isExpanded = options.isExpanded;
            }

            create.start(event, shape);
        }

        const shortType = type.replace(/^bpmn:/, "");

        return {
            group: group,
            className: className,
            title: title || translate("Create {type}", { type: shortType }),
            action: {
                dragstart: createListener,
                click: createListener,
            },
        };
    }

    function createSubprocess(event) {
        const subProcess = elementFactory.createShape({
            type: "bpmn:SubProcess",
            x: 0,
            y: 0,
            isExpanded: true,
        });

        const startEvent = elementFactory.createShape({
            type: "bpmn:StartEvent",
            x: 40,
            y: 82,
            parent: subProcess,
        });

        create.start(event, [subProcess, startEvent], {
            hints: {
                autoSelect: [startEvent],
            },
        });
    }

    function createParticipant(event) {
        create.start(event, elementFactory.createParticipantShape());
    }

    assign(actions, {});

    return actions;
};
