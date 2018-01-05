// import { Buffer } from "nbind/dist/shim";

export class NBindBase { free?(): void }

export class Length extends NBindBase {
	/** Length(); */
	constructor();

	/** Length(float32_t); */
	constructor(p0: number);

	/** Length(float32_t, uint32_t); */
	constructor(p0: number, p1: number);

	/** float32_t value; */
	value: number;

	/** uint32_t type; */
	type: number;
}

export class Node extends NBindBase {
	/** Node(); */
	constructor();

	/** void setMeasure(std::function<Size (Size)>); */
	setMeasure(p0: (p0: Size) => Size): void;

	/** void setBaseline(std::function<float32_t (Size)>); */
	setBaseline(p0: (p0: Size) => number): void;

	/** void layout(float32_t, float32_t); */
	layout(p0: number, p1: number): void;

	/** void layoutWithScale(float32_t, float32_t, float32_t); */
	layoutWithScale(p0: number, p1: number, p2: number): void;

	/** void add(std::shared_ptr<Node>); */
	add(p0: Node): void;

	/** void insert(std::shared_ptr<Node>, uint64_t); */
	insert(p0: Node, p1: number): void;

	/** void remove(std::shared_ptr<Node>); */
	remove(p0: Node): void;

	/** std::shared_ptr<Node> childAt(uint64_t); */
	childAt(p0: number): Node | null;

	/** void print(); */
	print(): void;

	/** uint32_t wrap; */
	wrap: number;

	/** uint32_t direction; */
	direction: number;

	/** uint32_t alignItems; */
	alignItems: number;

	/** uint32_t alignSelf; */
	alignSelf: number;

	/** uint32_t alignContent; */
	alignContent: number;

	/** uint32_t justifyContent; */
	justifyContent: number;

	/** Length flexBasis; */
	flexBasis: Length;

	/** float32_t flexGrow; */
	flexGrow: number;

	/** float32_t flexShrink; */
	flexShrink: number;

	/** Length width; */
	width: Length;

	/** Length height; */
	height: Length;

	/** Length minWidth; */
	minWidth: Length;

	/** Length minHeight; */
	minHeight: Length;

	/** Length maxWidth; */
	maxWidth: Length;

	/** Length maxHeight; */
	maxHeight: Length;

	/** Length marginLeft; */
	marginLeft: Length;

	/** Length marginTop; */
	marginTop: Length;

	/** Length marginBottom; */
	marginBottom: Length;

	/** Length marginRight; */
	marginRight: Length;

	/** Length marginStart; */
	marginStart: Length;

	/** Length marginEnd; */
	marginEnd: Length;

	/** Length paddingLeft; */
	paddingLeft: Length;

	/** Length paddingTop; */
	paddingTop: Length;

	/** Length paddingBottom; */
	paddingBottom: Length;

	/** Length paddingRight; */
	paddingRight: Length;

	/** Length paddingStart; */
	paddingStart: Length;

	/** Length paddingEnd; */
	paddingEnd: Length;

	/** float32_t borderLeft; */
	borderLeft: number;

	/** float32_t borderTop; */
	borderTop: number;

	/** float32_t borderBottom; */
	borderBottom: number;

	/** float32_t borderRight; */
	borderRight: number;

	/** float32_t borderStart; */
	borderStart: number;

	/** float32_t borderEnd; */
	borderEnd: number;

	/** void * context; */
	context: any;

	/** bool fixed; */
	fixed: boolean;

	/** Length spacing; */
	spacing: Length;

	/** Length lineSpacing; */
	lineSpacing: Length;

	/** uint32_t lines; */
	lines: number;

	/** uint32_t itemsPerLine; */
	itemsPerLine: number;

	/** float32_t resultWidth; -- Read-only */
	resultWidth: number;

	/** float32_t resultHeight; -- Read-only */
	resultHeight: number;

	/** float32_t resultLeft; -- Read-only */
	resultLeft: number;

	/** float32_t resultTop; -- Read-only */
	resultTop: number;

	/** float32_t resultMarginLeft; -- Read-only */
	resultMarginLeft: number;

	/** float32_t resultMarginRight; -- Read-only */
	resultMarginRight: number;

	/** float32_t resultMarginTop; -- Read-only */
	resultMarginTop: number;

	/** float32_t resultMarginBottom; -- Read-only */
	resultMarginBottom: number;

	/** float32_t resultPaddingLeft; -- Read-only */
	resultPaddingLeft: number;

	/** float32_t resultPaddingRight; -- Read-only */
	resultPaddingRight: number;

	/** float32_t resultPaddingTop; -- Read-only */
	resultPaddingTop: number;

	/** float32_t resultPaddingBottom; -- Read-only */
	resultPaddingBottom: number;

	/** uint64_t childrenCount; -- Read-only */
	childrenCount: number;
}

export class Size extends NBindBase {
	/** Size(); */
	constructor();

	/** Size(float32_t, float32_t); */
	constructor(p0: number, p1: number);

	/** float32_t width; */
	width: number;

	/** float32_t height; */
	height: number;
}

// FlexDirection
declare const Horizontal: number;
declare const Vertical: number;
declare const HorizontalReverse: number;
declare const VerticalReverse: number;

// FlexWrapMode
declare const NoWrap: number;
declare const Wrap: number;
declare const WrapReverse: number;

// FlexAlign
declare const Inherit: number;
declare const Stretch: number;
declare const Start: number;
declare const Center: number;
declare const End: number;
declare const SpaceBetween: number;
declare const SpaceAround: number;
declare const Baseline: number;

// FlexLengthType
declare const LengthTypeUndefined: number;
declare const LengthTypePoint: number;
declare const LengthTypePercent: number;
declare const LengthTypeAuto: number;
declare const LengthTypeContent: number;

declare const Undefined: number;
