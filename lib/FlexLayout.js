(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["FlexLayout"] = factory();
	else
		root["FlexLayout"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 1 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, setImmediate, Buffer) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;((function(root,wrapper){if(true)!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return wrapper}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if(typeof module=="object"&&module.exports)module.exports=wrapper;else(root.nbind=root.nbind||{}).init=wrapper}))(this,(function(Module,cb){if(typeof Module=="function"){cb=Module;Module={}}Module.onRuntimeInitialized=(function(init,cb){return(function(){if(init)init.apply(this,arguments);try{Module.ccall("nbind_init")}catch(err){cb(err);return}cb(null,{bind:Module._nbind_value,reflect:Module.NBind.reflect,queryType:Module.NBind.queryType,toggleLightGC:Module.toggleLightGC,lib:Module})})})(Module.onRuntimeInitialized,cb);var Module;if(!Module)Module=(typeof Module!=="undefined"?Module:null)||{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;if(Module["ENVIRONMENT"]){if(Module["ENVIRONMENT"]==="WEB"){ENVIRONMENT_IS_WEB=true}else if(Module["ENVIRONMENT"]==="WORKER"){ENVIRONMENT_IS_WORKER=true}else if(Module["ENVIRONMENT"]==="NODE"){ENVIRONMENT_IS_NODE=true}else if(Module["ENVIRONMENT"]==="SHELL"){ENVIRONMENT_IS_SHELL=true}else{throw new Error("The provided Module['ENVIRONMENT'] value is not valid. It must be one of: WEB|WORKER|NODE|SHELL.")}}else{ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&"function"==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER}if(ENVIRONMENT_IS_NODE){if(!Module["print"])Module["print"]=console.log;if(!Module["printErr"])Module["printErr"]=console.warn;var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;ret=tryParseAsDataURI(filename);if(!ret){if(!nodeFS)nodeFS=__webpack_require__(8);if(!nodePath)nodePath=__webpack_require__(9);filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename)}return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(!Module["thisProgram"]){if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}else{Module["thisProgram"]="unknown-program"}}Module["arguments"]=process["argv"].slice(2);if(true){module["exports"]=Module}process["on"]("uncaughtException",(function(ex){if(!(ex instanceof ExitStatus)){throw ex}}));Module["inspect"]=(function(){return"[Emscripten Module object]"})}else if(ENVIRONMENT_IS_SHELL){if(!Module["print"])Module["print"]=print;if(typeof printErr!="undefined")Module["printErr"]=printErr;if(typeof read!="undefined"){Module["read"]=function shell_read(f){var data=tryParseAsDataURI(f);if(data){return intArrayToString(data)}return read(f)}}else{Module["read"]=function shell_read(){throw"no read() available"}}Module["readBinary"]=function readBinary(f){var data;data=tryParseAsDataURI(f);if(data){return data}if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=(function(status,toThrow){quit(status)})}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){Module["read"]=function shell_read(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText}catch(err){var data=tryParseAsDataURI(url);if(data){return intArrayToString(data)}throw err}};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}catch(err){var data=tryParseAsDataURI(url);if(data){return data}throw err}}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}var data=tryParseAsDataURI(url);if(data){onload(data.buffer);return}onerror()};xhr.onerror=onerror;xhr.send(null)};if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof console!=="undefined"){if(!Module["print"])Module["print"]=function shell_print(x){console.log(x)};if(!Module["printErr"])Module["printErr"]=function shell_printErr(x){console.warn(x)}}else{var TRY_USE_DUMP=false;if(!Module["print"])Module["print"]=TRY_USE_DUMP&&typeof dump!=="undefined"?(function(x){dump(x)}):(function(x){})}if(typeof Module["setWindowTitle"]==="undefined"){Module["setWindowTitle"]=(function(title){document.title=title})}}else{throw new Error("Unknown runtime environment. Where are we?")}if(!Module["print"]){Module["print"]=(function(){})}if(!Module["printErr"]){Module["printErr"]=Module["print"]}if(!Module["arguments"]){Module["arguments"]=[]}if(!Module["thisProgram"]){Module["thisProgram"]="./this.program"}if(!Module["quit"]){Module["quit"]=(function(status,toThrow){throw toThrow})}Module.print=Module["print"];Module.printErr=Module["printErr"];Module["preRun"]=[];Module["postRun"]=[];for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var Runtime={setTempRet0:(function(value){tempRet0=value;return value}),getTempRet0:(function(){return tempRet0}),stackSave:(function(){return STACKTOP}),stackRestore:(function(stackTop){STACKTOP=stackTop}),getNativeTypeSize:(function(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return Runtime.QUANTUM_SIZE}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0);return bits/8}else{return 0}}}}),getNativeFieldSize:(function(type){return Math.max(Runtime.getNativeTypeSize(type),Runtime.QUANTUM_SIZE)}),STACK_ALIGN:16,prepVararg:(function(ptr,type){if(type==="double"||type==="i64"){if(ptr&7){assert((ptr&7)===4);ptr+=4}}else{assert((ptr&3)===0)}return ptr}),getAlignSize:(function(type,size,vararg){if(!vararg&&(type=="i64"||type=="double"))return 8;if(!type)return Math.min(size,8);return Math.min(size||(type?Runtime.getNativeFieldSize(type):0),Runtime.QUANTUM_SIZE)}),dynCall:(function(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}),functionPointers:[],addFunction:(function(func){for(var i=0;i<Runtime.functionPointers.length;i++){if(!Runtime.functionPointers[i]){Runtime.functionPointers[i]=func;return 2*(1+i)}}throw"Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS."}),removeFunction:(function(index){Runtime.functionPointers[(index-2)/2]=null}),warnOnce:(function(text){if(!Runtime.warnOnce.shown)Runtime.warnOnce.shown={};if(!Runtime.warnOnce.shown[text]){Runtime.warnOnce.shown[text]=1;Module.printErr(text)}}),funcWrappers:{},getFuncWrapper:(function(func,sig){if(!func)return;assert(sig);if(!Runtime.funcWrappers[sig]){Runtime.funcWrappers[sig]={}}var sigCache=Runtime.funcWrappers[sig];if(!sigCache[func]){if(sig.length===1){sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func)}}else if(sig.length===2){sigCache[func]=function dynCall_wrapper(arg){return Runtime.dynCall(sig,func,[arg])}}else{sigCache[func]=function dynCall_wrapper(){return Runtime.dynCall(sig,func,Array.prototype.slice.call(arguments))}}}return sigCache[func]}),getCompilerSetting:(function(name){throw"You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work"}),stackAlloc:(function(size){var ret=STACKTOP;STACKTOP=STACKTOP+size|0;STACKTOP=STACKTOP+15&-16;return ret}),staticAlloc:(function(size){var ret=STATICTOP;STATICTOP=STATICTOP+size|0;STATICTOP=STATICTOP+15&-16;return ret}),dynamicAlloc:(function(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=(ret+size+15|0)&-16;HEAP32[DYNAMICTOP_PTR>>2]=end;if(end>=TOTAL_MEMORY){var success=enlargeMemory();if(!success){HEAP32[DYNAMICTOP_PTR>>2]=ret;return 0}}return ret}),alignMemory:(function(size,quantum){var ret=size=Math.ceil(size/(quantum?quantum:16))*(quantum?quantum:16);return ret}),makeBigInt:(function(low,high,unsigned){var ret=unsigned?+(low>>>0)+ +(high>>>0)*+4294967296:+(low>>>0)+ +(high|0)*+4294967296;return ret}),GLOBAL_BASE:8,QUANTUM_SIZE:4,__dummy__:0};Module["Runtime"]=Runtime;var ABORT=0;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}var JSfuncs={"stackSave":(function(){Runtime.stackSave()}),"stackRestore":(function(){Runtime.stackRestore()}),"arrayToC":(function(arr){var ret=Runtime.stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}),"stringToC":(function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=Runtime.stackAlloc(len);stringToUTF8(str,ret,len)}return ret})};var toC={"string":JSfuncs["stringToC"],"array":JSfuncs["arrayToC"]};function ccall(ident,returnType,argTypes,args,opts){var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=Runtime.stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);if(returnType==="string")ret=Pointer_stringify(ret);if(stack!==0){Runtime.stackRestore(stack)}return ret}function cwrap(ident,returnType,argTypes){argTypes=argTypes||[];var cfunc=getCFunc(ident);var numericArgs=argTypes.every((function(type){return type==="number"}));var numericRet=returnType!=="string";if(numericRet&&numericArgs){return cfunc}return(function(){return ccall(ident,returnType,argTypes,arguments)})}Module["ccall"]=ccall;Module["cwrap"]=cwrap;function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=+1?tempDouble>+0?(Math_min(+Math_floor(tempDouble/+4294967296),+4294967295)|0)>>>0:~~+Math_ceil((tempDouble- +(~~tempDouble>>>0))/+4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}var ALLOC_NORMAL=0;var ALLOC_STACK=1;var ALLOC_STATIC=2;var ALLOC_DYNAMIC=3;var ALLOC_NONE=4;Module["ALLOC_NORMAL"]=ALLOC_NORMAL;Module["ALLOC_STACK"]=ALLOC_STACK;Module["ALLOC_STATIC"]=ALLOC_STATIC;Module["ALLOC_DYNAMIC"]=ALLOC_DYNAMIC;Module["ALLOC_NONE"]=ALLOC_NONE;function allocate(slab,types,allocator,ptr){var zeroinit,size;if(typeof slab==="number"){zeroinit=true;size=slab}else{zeroinit=false;size=slab.length}var singleType=typeof types==="string"?types:null;var ret;if(allocator==ALLOC_NONE){ret=ptr}else{ret=[typeof _malloc==="function"?_malloc:Runtime.staticAlloc,Runtime.stackAlloc,Runtime.staticAlloc,Runtime.dynamicAlloc][allocator===undefined?ALLOC_STATIC:allocator](Math.max(size,singleType?1:types.length))}if(zeroinit){var stop;ptr=ret;assert((ret&3)==0);stop=ret+(size&~3);for(;ptr<stop;ptr+=4){HEAP32[ptr>>2]=0}stop=ret+size;while(ptr<stop){HEAP8[ptr++>>0]=0}return ret}if(singleType==="i8"){if(slab.subarray||slab.slice){HEAPU8.set(slab,ret)}else{HEAPU8.set(new Uint8Array(slab),ret)}return ret}var i=0,type,typeSize,previousType;while(i<size){var curr=slab[i];if(typeof curr==="function"){curr=Runtime.getFunctionIndex(curr)}type=singleType||types[i];if(type===0){i++;continue}if(type=="i64")type="i32";setValue(ret+i,curr,type);if(previousType!==type){typeSize=Runtime.getNativeTypeSize(type);previousType=type}i+=typeSize}return ret}Module["allocate"]=allocate;function getMemory(size){if(!staticSealed)return Runtime.staticAlloc(size);if(!runtimeInitialized)return Runtime.dynamicAlloc(size);return _malloc(size)}Module["getMemory"]=getMemory;function Pointer_stringify(ptr,length){if(length===0||!ptr)return"";var hasUtf=0;var t;var i=0;while(1){t=HEAPU8[ptr+i>>0];hasUtf|=t;if(t==0&&!length)break;i++;if(length&&i==length)break}if(!length)length=i;var ret="";if(hasUtf<128){var MAX_CHUNK=1024;var curr;while(length>0){curr=String.fromCharCode.apply(String,HEAPU8.subarray(ptr,ptr+Math.min(length,MAX_CHUNK)));ret=ret?ret+curr:curr;ptr+=MAX_CHUNK;length-=MAX_CHUNK}return ret}return Module["UTF8ToString"](ptr)}Module["Pointer_stringify"]=Pointer_stringify;function AsciiToString(ptr){var str="";while(1){var ch=HEAP8[ptr++>>0];if(!ch)return str;str+=String.fromCharCode(ch)}}Module["AsciiToString"]=AsciiToString;function stringToAscii(str,outPtr){return writeAsciiToMemory(str,outPtr,false)}Module["stringToAscii"]=stringToAscii;var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx){var endPtr=idx;while(u8Array[endPtr])++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var u0,u1,u2,u3,u4,u5;var str="";while(1){u0=u8Array[idx++];if(!u0)return str;if(!(u0&128)){str+=String.fromCharCode(u0);continue}u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u3=u8Array[idx++]&63;if((u0&248)==240){u0=(u0&7)<<18|u1<<12|u2<<6|u3}else{u4=u8Array[idx++]&63;if((u0&252)==248){u0=(u0&3)<<24|u1<<18|u2<<12|u3<<6|u4}else{u5=u8Array[idx++]&63;u0=(u0&1)<<30|u1<<24|u2<<18|u3<<12|u4<<6|u5}}}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}}Module["UTF8ArrayToString"]=UTF8ArrayToString;function UTF8ToString(ptr){return UTF8ArrayToString(HEAPU8,ptr)}Module["UTF8ToString"]=UTF8ToString;function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=2097151){if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else if(u<=67108863){if(outIdx+4>=endIdx)break;outU8Array[outIdx++]=248|u>>24;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+5>=endIdx)break;outU8Array[outIdx++]=252|u>>30;outU8Array[outIdx++]=128|u>>24&63;outU8Array[outIdx++]=128|u>>18&63;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}Module["stringToUTF8Array"]=stringToUTF8Array;function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}Module["stringToUTF8"]=stringToUTF8;function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127){++len}else if(u<=2047){len+=2}else if(u<=65535){len+=3}else if(u<=2097151){len+=4}else if(u<=67108863){len+=5}else{len+=6}}return len}Module["lengthBytesUTF8"]=lengthBytesUTF8;var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function demangle(func){return func}function demangleAll(text){var regex=/__Z[\w\d_]+/g;return text.replace(regex,(function(x){var y=demangle(x);return x===y?x:x+" ["+y+"]"}))}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function stackTrace(){var js=jsStackTrace();if(Module["extraStackTrace"])js+="\n"+Module["extraStackTrace"]();return demangleAll(js)}Module["stackTrace"]=stackTrace;var HEAP,buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var STATIC_BASE,STATICTOP,staticSealed;var STACK_BASE,STACKTOP,STACK_MAX;var DYNAMIC_BASE,DYNAMICTOP_PTR;STATIC_BASE=STATICTOP=STACK_BASE=STACKTOP=STACK_MAX=DYNAMIC_BASE=DYNAMICTOP_PTR=0;staticSealed=false;function abortOnCannotGrowMemory(){abort("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+TOTAL_MEMORY+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}function enlargeMemory(){abortOnCannotGrowMemory()}var TOTAL_STACK=Module["TOTAL_STACK"]||5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||134217728;if(TOTAL_MEMORY<TOTAL_STACK)Module.printErr("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{{buffer=new ArrayBuffer(TOTAL_MEMORY)}}updateGlobalBufferViews();function getTotalMemory(){return TOTAL_MEMORY}HEAP32[0]=1668509029;HEAP16[1]=25459;if(HEAPU8[2]!==115||HEAPU8[3]!==99)throw"Runtime error: expected the system to be little-endian!";Module["HEAP"]=HEAP;Module["buffer"]=buffer;Module["HEAP8"]=HEAP8;Module["HEAP16"]=HEAP16;Module["HEAP32"]=HEAP32;Module["HEAPU8"]=HEAPU8;Module["HEAPU16"]=HEAPU16;Module["HEAPU32"]=HEAPU32;Module["HEAPF32"]=HEAPF32;Module["HEAPF64"]=HEAPF64;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATEXIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){callRuntimeCallbacks(__ATEXIT__);runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}Module["addOnPreRun"]=addOnPreRun;function addOnInit(cb){__ATINIT__.unshift(cb)}Module["addOnInit"]=addOnInit;function addOnPreMain(cb){__ATMAIN__.unshift(cb)}Module["addOnPreMain"]=addOnPreMain;function addOnExit(cb){__ATEXIT__.unshift(cb)}Module["addOnExit"]=addOnExit;function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}Module["addOnPostRun"]=addOnPostRun;function writeStringToMemory(string,buffer,dontAddNull){Runtime.warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");var lastChar,end;if(dontAddNull){end=buffer+lengthBytesUTF8(string);lastChar=HEAP8[end]}stringToUTF8(string,buffer,Infinity);if(dontAddNull)HEAP8[end]=lastChar}Module["writeStringToMemory"]=writeStringToMemory;function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}Module["writeArrayToMemory"]=writeArrayToMemory;function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}Module["writeAsciiToMemory"]=writeAsciiToMemory;assert(Math["imul"]&&Math["fround"]&&Math["clz32"]&&Math["trunc"],"this is a legacy browser, build with LEGACY_VM_SUPPORT");var Math_abs=Math.abs;var Math_cos=Math.cos;var Math_sin=Math.sin;var Math_tan=Math.tan;var Math_acos=Math.acos;var Math_asin=Math.asin;var Math_atan=Math.atan;var Math_atan2=Math.atan2;var Math_exp=Math.exp;var Math_log=Math.log;var Math_sqrt=Math.sqrt;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_pow=Math.pow;var Math_imul=Math.imul;var Math_fround=Math.fround;var Math_round=Math.round;var Math_min=Math.min;var Math_clz32=Math.clz32;var Math_trunc=Math.trunc;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}Module["addRunDependency"]=addRunDependency;function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["removeRunDependency"]=removeRunDependency;Module["preloadedImages"]={};Module["preloadedAudios"]={};var memoryInitializer=null;var ASM_CONSTS=[(function($0,$1,$2,$3,$4,$5,$6){return _nbind.callbackSignatureList[$0].apply(this,arguments)})];function _emscripten_asm_const_diii(code,a0,a1,a2){return ASM_CONSTS[code](a0,a1,a2)}function _emscripten_asm_const_iiii(code,a0,a1,a2){return ASM_CONSTS[code](a0,a1,a2)}function _emscripten_asm_const_iiiii(code,a0,a1,a2,a3){return ASM_CONSTS[code](a0,a1,a2,a3)}function _emscripten_asm_const_iiiiii(code,a0,a1,a2,a3,a4){return ASM_CONSTS[code](a0,a1,a2,a3,a4)}function _emscripten_asm_const_iiiiiiii(code,a0,a1,a2,a3,a4,a5,a6){return ASM_CONSTS[code](a0,a1,a2,a3,a4,a5,a6)}STATIC_BASE=Runtime.GLOBAL_BASE;STATICTOP=STATIC_BASE+9744;__ATINIT__.push({func:(function(){__GLOBAL__sub_I_binding_cpp()})},{func:(function(){__GLOBAL__sub_I_common_cc()})},{func:(function(){__GLOBAL__sub_I_Binding_cc()})});memoryInitializer="data:application/octet-stream;base64,AAAAAAEAAAACAAAAAwAAAAIAAAADAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAEAAAACAAAAAADAfwMAAAAAAAAAAACAPwAAwH8DAAAAAADAfwMAAAAAAAAAAQAAAAAAAAABAAAAAADAfwAAAAAAAMB/AAAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAABAAAAAADAfwAAAAAAAMB/AAAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAABAAAAAADAfwAAAAAAAMB/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAMB/AADAfwAAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHrEAAB6xAAAAAAAAAAAAAAAAAAAAAACAAAA0CEAAAAAAAAAAAAAAQAAAAIAAAADAAAAAQAAAAQAAACoAQAAqAEAANEhAADRIQAA0iEAANEhAADRIQAAAgAAANMhAAAAAAAAAAAAAAEAAAAFAAAABgAAAAEAAAAHAAAA6AEAAOgBAADRIQAA6AEAANEhAADUIQAA0iEAANQhAADUIQAAAgAAANUhAADSIQAA0yEAANMhAADSIQAATAIAAAIAAADSIQAATAIAANIhAADWIQAA1iEAAAAAAAAAAAAAAQAAAAgAAAAJAAAAAQAAAAoAAAAwAgAAAAAAAAAAAAALAAAADAAAAAEAAAABAAAADQAAAA4AAAABAAAA0CEAANAhAADSIQAAuAIAAAkAAAABAAAA0CEAANAhAAAAAAAAAAAAAA8AAAAQAAAAAgAAAAIAAAARAAAAEgAAAAEAAADXIQAA0CEAANIhAAD8AgAACQAAAAEAAADRIQAA0CEAANIhAADRIQAA0SEAANIhAADRIQAA0SEAANEhAADSIQAAMAMAAAUAAADVIQAA0iEAADADAADUIQAAMAMAANQhAADSIQAA2CEAAAIAAADaIQAAaAMAAH0MAADdIQAA6iEAAOshAADsIQAA7SEAAO4hAADUIQAA7yEAAPAhAADxIQAA8iEAAPMhAADRIQAA1yEAAAAAAADSIQAAigwAANYhAACPDAAA9SEAAJQMAADcAwAAoAwAAOQDAACtDAAA9iEAAMAMAAD3IQAAyQwAAAAAAAADAAAA+CEAAAMAAADsAwAAAQAAAPghAAAAAAAAAAAAAAEAAAATAAAAFAAAAAEAAAAVAAAA0iEAAPkhAAAoBAAA1CEAADAEAAA4BAAAAgAAAEAEAAAHAAAA+SEAAAcAAAAoBAAAAQAAAOwhAADSIQAA+SEAADAEAADSIQAA+SEAACgEAADSIQAA+SEAAOohAADqIQAA9iEAAOohAAD5IQAA9iEAAOohAAD5IQAAMAQAAPYhAADqIQAA+SEAANQhAAD2IQAA6iEAAKwEAADUIQAAAgAAAPkhAADYDAAA0iEAANQhAADUIQAA1CEAANQhAAD2IQAA+SEAANwDAADSIQAA3AMAANwDAADcAwAA3AMAANwDAADSIQAAKAQAANwDAAAAAAAAAAAAAAEAAAAWAAAAFwAAAAEAAAAYAAAAHAUAAAIAAAD6IQAA+yEAANQhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALQhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJAYAAAUAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAACAAAABCIAAAAEAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAr/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlLjFmACUuMWYlJQBhdXRvAGNvbnRlbnQAdW5kZWZpbmVkAHdyYXAAbm93cmFwAHdyYXAtcmV2ZXJzZQB2ZXJ0aWNhbABob3Jpem9udGFsAHZlcnRpY2FsLXJldmVyc2UAaG9yaXpvbnRhbC1yZXZlcnNlAGVuZABzdGFydABjZW50ZXIAc3RyZXRjaABiYXNlbGluZQBzcGFjZS1hcm91bmQAc3BhY2UtYmV0d2VlbgAlcwB0cnVlAGZhbHNlACVkACAgAHdyYXA6IABkaXJlY3Rpb246IABhbGlnbi1pdGVtczogAGFsaWduLXNlbGY6IABhbGlnbi1jb250ZW50OiAAanVzdGlmeS1jb250ZW50OiAAZmxleC1iYXNpczogAGZsZXgtZ3JvdzogAGZsZXgtc2hyaW5rOiAAd2lkdGg6IABoZWlnaHQ6IABtaW4td2lkdGg6IABtaW4taGVpZ2h0OiAAbWF4LXdpZHRoOiAAbWF4LWhlaWdodDogAG1hcmdpbjogACwgAHBhZGRpbmc6IABib3JkZXI6IABmaXhlZDogAHNwYWNpbmc6IABsaW5lLXNwYWNpbmc6IABsaW5lczogAGl0ZW1zLXBlci1saW5lOiAAaGFzLW1lYXN1cmUtZnVuYzogAGhhcy1iYXNlbGluZS1mdW5jOiAAcmVzdWx0LXg6IAByZXN1bHQteTogAHJlc3VsdC13aWR0aDogAHJlc3VsdC1oZWlnaHQ6IAByZXN1bHQtbWFyZ2luOiAAcmVzdWx0LXBhZGRpbmc6IABTaXplAGdldFdpZHRoAGdldEhlaWdodABMZW5ndGgAZ2V0VmFsdWUAZ2V0VHlwZQBOb2RlAGdldFdyYXAAZ2V0RGlyZWN0aW9uAGdldEFsaWduSXRlbXMAZ2V0QWxpZ25TZWxmAGdldEFsaWduQ29udGVudABnZXRKdXN0aWZ5Q29udGVudABnZXRGbGV4QmFzaXMAZ2V0RmxleEdyb3cAZ2V0RmxleFNocmluawBnZXRNaW5XaWR0aABnZXRNaW5IZWlnaHQAZ2V0TWF4V2lkdGgAZ2V0TWF4SGVpZ2h0AGdldE1hcmdpbkxlZnQAZ2V0TWFyZ2luVG9wAGdldE1hcmdpbkJvdHRvbQBnZXRNYXJnaW5SaWdodABnZXRNYXJnaW5TdGFydABnZXRNYXJnaW5FbmQAZ2V0UGFkZGluZ0xlZnQAZ2V0UGFkZGluZ1RvcABnZXRQYWRkaW5nQm90dG9tAGdldFBhZGRpbmdSaWdodABnZXRQYWRkaW5nU3RhcnQAZ2V0UGFkZGluZ0VuZABnZXRCb3JkZXJMZWZ0AGdldEJvcmRlclRvcABnZXRCb3JkZXJCb3R0b20AZ2V0Qm9yZGVyUmlnaHQAZ2V0Qm9yZGVyU3RhcnQAZ2V0Qm9yZGVyRW5kAGdldENvbnRleHQAZ2V0Rml4ZWQAZ2V0U3BhY2luZwBnZXRMaW5lU3BhY2luZwBnZXRMaW5lcwBnZXRJdGVtc1BlckxpbmUAZ2V0UmVzdWx0V2lkdGgAZ2V0UmVzdWx0SGVpZ2h0AGdldFJlc3VsdExlZnQAZ2V0UmVzdWx0VG9wAGdldFJlc3VsdE1hcmdpbkxlZnQAZ2V0UmVzdWx0TWFyZ2luUmlnaHQAZ2V0UmVzdWx0TWFyZ2luVG9wAGdldFJlc3VsdE1hcmdpbkJvdHRvbQBnZXRSZXN1bHRQYWRkaW5nTGVmdABnZXRSZXN1bHRQYWRkaW5nUmlnaHQAZ2V0UmVzdWx0UGFkZGluZ1RvcABnZXRSZXN1bHRQYWRkaW5nQm90dG9tAHNldE1lYXN1cmUAc2V0QmFzZWxpbmUAbGF5b3V0AGxheW91dFdpdGhTY2FsZQBhZGQAaW5zZXJ0AHJlbW92ZQBjaGlsZEF0AGdldENoaWxkcmVuQ291bnQAcHJpbnQAewB9AGNoaWxkcmVuOiBbAF0ASW50NjQAAQEBAgIEBAQECAgECHZvaWQAYm9vbABzdGQ6OnN0cmluZwBjYkZ1bmN0aW9uICYAY29uc3QgY2JGdW5jdGlvbiAmAEV4dGVybmFsAEJ1ZmZlcgBOQmluZElEAFZhbHVlAE5CaW5kAGJpbmRfdmFsdWUAcmVmbGVjdABxdWVyeVR5cGUAbGFsbG9jAGxyZXNldAB7cmV0dXJuKF9uYmluZC5jYWxsYmFja1NpZ25hdHVyZUxpc3RbJDBdLmFwcGx5KHRoaXMsYXJndW1lbnRzKSk7fQBfbmJpbmRfbmV3ABEACgAREREAAAAABQAAAAAAAAkAAAAACwAAAAAAAAAAEQAPChEREQMKBwABEwkLCwAACQYLAAALAAYRAAAAERERAAAAAAAAAAAAAAAAAAAAAAsAAAAAAAAAABEACgoREREACgAAAgAJCwAAAAkACwAACwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAMAAAAAAwAAAAACQwAAAAAAAwAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAADQAAAAQNAAAAAAkOAAAAAAAOAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAA8AAAAADwAAAAAJEAAAAAAAEAAAEAAAEgAAABISEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASAAAAEhISAAAAAAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAAAAAAAAAACgAAAAAKAAAAAAkLAAAAAAALAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAADAAAAAAJDAAAAAAADAAADAAALSsgICAwWDB4AChudWxsKQAtMFgrMFggMFgtMHgrMHggMHgAaW5mAElORgBuYW4ATkFOADAxMjM0NTY3ODlBQkNERUYuAFQhIhkNAQIDEUscDBAECx0SHidobm9wcWIgBQYPExQVGggWBygkFxgJCg4bHyUjg4J9JiorPD0+P0NHSk1YWVpbXF1eX2BhY2RlZmdpamtscnN0eXp7fABJbGxlZ2FsIGJ5dGUgc2VxdWVuY2UARG9tYWluIGVycm9yAFJlc3VsdCBub3QgcmVwcmVzZW50YWJsZQBOb3QgYSB0dHkAUGVybWlzc2lvbiBkZW5pZWQAT3BlcmF0aW9uIG5vdCBwZXJtaXR0ZWQATm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeQBObyBzdWNoIHByb2Nlc3MARmlsZSBleGlzdHMAVmFsdWUgdG9vIGxhcmdlIGZvciBkYXRhIHR5cGUATm8gc3BhY2UgbGVmdCBvbiBkZXZpY2UAT3V0IG9mIG1lbW9yeQBSZXNvdXJjZSBidXN5AEludGVycnVwdGVkIHN5c3RlbSBjYWxsAFJlc291cmNlIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlAEludmFsaWQgc2VlawBDcm9zcy1kZXZpY2UgbGluawBSZWFkLW9ubHkgZmlsZSBzeXN0ZW0ARGlyZWN0b3J5IG5vdCBlbXB0eQBDb25uZWN0aW9uIHJlc2V0IGJ5IHBlZXIAT3BlcmF0aW9uIHRpbWVkIG91dABDb25uZWN0aW9uIHJlZnVzZWQASG9zdCBpcyBkb3duAEhvc3QgaXMgdW5yZWFjaGFibGUAQWRkcmVzcyBpbiB1c2UAQnJva2VuIHBpcGUASS9PIGVycm9yAE5vIHN1Y2ggZGV2aWNlIG9yIGFkZHJlc3MAQmxvY2sgZGV2aWNlIHJlcXVpcmVkAE5vIHN1Y2ggZGV2aWNlAE5vdCBhIGRpcmVjdG9yeQBJcyBhIGRpcmVjdG9yeQBUZXh0IGZpbGUgYnVzeQBFeGVjIGZvcm1hdCBlcnJvcgBJbnZhbGlkIGFyZ3VtZW50AEFyZ3VtZW50IGxpc3QgdG9vIGxvbmcAU3ltYm9saWMgbGluayBsb29wAEZpbGVuYW1lIHRvbyBsb25nAFRvbyBtYW55IG9wZW4gZmlsZXMgaW4gc3lzdGVtAE5vIGZpbGUgZGVzY3JpcHRvcnMgYXZhaWxhYmxlAEJhZCBmaWxlIGRlc2NyaXB0b3IATm8gY2hpbGQgcHJvY2VzcwBCYWQgYWRkcmVzcwBGaWxlIHRvbyBsYXJnZQBUb28gbWFueSBsaW5rcwBObyBsb2NrcyBhdmFpbGFibGUAUmVzb3VyY2UgZGVhZGxvY2sgd291bGQgb2NjdXIAU3RhdGUgbm90IHJlY292ZXJhYmxlAFByZXZpb3VzIG93bmVyIGRpZWQAT3BlcmF0aW9uIGNhbmNlbGVkAEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZABObyBtZXNzYWdlIG9mIGRlc2lyZWQgdHlwZQBJZGVudGlmaWVyIHJlbW92ZWQARGV2aWNlIG5vdCBhIHN0cmVhbQBObyBkYXRhIGF2YWlsYWJsZQBEZXZpY2UgdGltZW91dABPdXQgb2Ygc3RyZWFtcyByZXNvdXJjZXMATGluayBoYXMgYmVlbiBzZXZlcmVkAFByb3RvY29sIGVycm9yAEJhZCBtZXNzYWdlAEZpbGUgZGVzY3JpcHRvciBpbiBiYWQgc3RhdGUATm90IGEgc29ja2V0AERlc3RpbmF0aW9uIGFkZHJlc3MgcmVxdWlyZWQATWVzc2FnZSB0b28gbGFyZ2UAUHJvdG9jb2wgd3JvbmcgdHlwZSBmb3Igc29ja2V0AFByb3RvY29sIG5vdCBhdmFpbGFibGUAUHJvdG9jb2wgbm90IHN1cHBvcnRlZABTb2NrZXQgdHlwZSBub3Qgc3VwcG9ydGVkAE5vdCBzdXBwb3J0ZWQAUHJvdG9jb2wgZmFtaWx5IG5vdCBzdXBwb3J0ZWQAQWRkcmVzcyBmYW1pbHkgbm90IHN1cHBvcnRlZCBieSBwcm90b2NvbABBZGRyZXNzIG5vdCBhdmFpbGFibGUATmV0d29yayBpcyBkb3duAE5ldHdvcmsgdW5yZWFjaGFibGUAQ29ubmVjdGlvbiByZXNldCBieSBuZXR3b3JrAENvbm5lY3Rpb24gYWJvcnRlZABObyBidWZmZXIgc3BhY2UgYXZhaWxhYmxlAFNvY2tldCBpcyBjb25uZWN0ZWQAU29ja2V0IG5vdCBjb25uZWN0ZWQAQ2Fubm90IHNlbmQgYWZ0ZXIgc29ja2V0IHNodXRkb3duAE9wZXJhdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzAE9wZXJhdGlvbiBpbiBwcm9ncmVzcwBTdGFsZSBmaWxlIGhhbmRsZQBSZW1vdGUgSS9PIGVycm9yAFF1b3RhIGV4Y2VlZGVkAE5vIG1lZGl1bSBmb3VuZABXcm9uZyBtZWRpdW0gdHlwZQBObyBlcnJvciBpbmZvcm1hdGlvbg==";var tempDoublePtr=STATICTOP;STATICTOP+=16;function _emscripten_set_main_loop_timing(mode,value){Browser.mainLoop.timingMode=mode;Browser.mainLoop.timingValue=value;if(!Browser.mainLoop.func){return 1}if(mode==0){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setTimeout(){var timeUntilNextTick=Math.max(0,Browser.mainLoop.tickStartTime+value-_emscripten_get_now())|0;setTimeout(Browser.mainLoop.runner,timeUntilNextTick)};Browser.mainLoop.method="timeout"}else if(mode==1){Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_rAF(){Browser.requestAnimationFrame(Browser.mainLoop.runner)};Browser.mainLoop.method="rAF"}else if(mode==2){if(typeof setImmediate==="undefined"){var setImmediates=[];var emscriptenMainLoopMessageId="setimmediate";function Browser_setImmediate_messageHandler(event){if(event.data===emscriptenMainLoopMessageId||event.data.target===emscriptenMainLoopMessageId){event.stopPropagation();setImmediates.shift()()}}addEventListener("message",Browser_setImmediate_messageHandler,true);setImmediate=function Browser_emulated_setImmediate(func){setImmediates.push(func);if(ENVIRONMENT_IS_WORKER){if(Module["setImmediates"]===undefined)Module["setImmediates"]=[];Module["setImmediates"].push(func);postMessage({target:emscriptenMainLoopMessageId})}else postMessage(emscriptenMainLoopMessageId,"*")}}Browser.mainLoop.scheduler=function Browser_mainLoop_scheduler_setImmediate(){setImmediate(Browser.mainLoop.runner)};Browser.mainLoop.method="immediate"}return 0}function _emscripten_get_now(){abort()}function _emscripten_set_main_loop(func,fps,simulateInfiniteLoop,arg,noSetTiming){Module["noExitRuntime"]=true;assert(!Browser.mainLoop.func,"emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");Browser.mainLoop.func=func;Browser.mainLoop.arg=arg;var browserIterationFunc;if(typeof arg!=="undefined"){browserIterationFunc=(function(){Module["dynCall_vi"](func,arg)})}else{browserIterationFunc=(function(){Module["dynCall_v"](func)})}var thisMainLoopId=Browser.mainLoop.currentlyRunningMainloop;Browser.mainLoop.runner=function Browser_mainLoop_runner(){if(ABORT)return;if(Browser.mainLoop.queue.length>0){var start=Date.now();var blocker=Browser.mainLoop.queue.shift();blocker.func(blocker.arg);if(Browser.mainLoop.remainingBlockers){var remaining=Browser.mainLoop.remainingBlockers;var next=remaining%1==0?remaining-1:Math.floor(remaining);if(blocker.counted){Browser.mainLoop.remainingBlockers=next}else{next=next+.5;Browser.mainLoop.remainingBlockers=(8*remaining+next)/9}}console.log('main loop blocker "'+blocker.name+'" took '+(Date.now()-start)+" ms");Browser.mainLoop.updateStatus();if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;setTimeout(Browser.mainLoop.runner,0);return}if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;Browser.mainLoop.currentFrameNumber=Browser.mainLoop.currentFrameNumber+1|0;if(Browser.mainLoop.timingMode==1&&Browser.mainLoop.timingValue>1&&Browser.mainLoop.currentFrameNumber%Browser.mainLoop.timingValue!=0){Browser.mainLoop.scheduler();return}else if(Browser.mainLoop.timingMode==0){Browser.mainLoop.tickStartTime=_emscripten_get_now()}if(Browser.mainLoop.method==="timeout"&&Module.ctx){Module.printErr("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");Browser.mainLoop.method=""}Browser.mainLoop.runIter(browserIterationFunc);if(thisMainLoopId<Browser.mainLoop.currentlyRunningMainloop)return;if(typeof SDL==="object"&&SDL.audio&&SDL.audio.queueNewAudioData)SDL.audio.queueNewAudioData();Browser.mainLoop.scheduler()};if(!noSetTiming){if(fps&&fps>0)_emscripten_set_main_loop_timing(0,1e3/fps);else _emscripten_set_main_loop_timing(1,1);Browser.mainLoop.scheduler()}if(simulateInfiniteLoop){throw"SimulateInfiniteLoop"}}var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:(function(){Browser.mainLoop.scheduler=null;Browser.mainLoop.currentlyRunningMainloop++}),resume:(function(){Browser.mainLoop.currentlyRunningMainloop++;var timingMode=Browser.mainLoop.timingMode;var timingValue=Browser.mainLoop.timingValue;var func=Browser.mainLoop.func;Browser.mainLoop.func=null;_emscripten_set_main_loop(func,0,false,Browser.mainLoop.arg,true);_emscripten_set_main_loop_timing(timingMode,timingValue);Browser.mainLoop.scheduler()}),updateStatus:(function(){if(Module["setStatus"]){var message=Module["statusMessage"]||"Please wait...";var remaining=Browser.mainLoop.remainingBlockers;var expected=Browser.mainLoop.expectedBlockers;if(remaining){if(remaining<expected){Module["setStatus"](message+" ("+(expected-remaining)+"/"+expected+")")}else{Module["setStatus"](message)}}else{Module["setStatus"]("")}}}),runIter:(function(func){if(ABORT)return;if(Module["preMainLoop"]){var preRet=Module["preMainLoop"]();if(preRet===false){return}}try{func()}catch(e){if(e instanceof ExitStatus){return}else{if(e&&typeof e==="object"&&e.stack)Module.printErr("exception thrown: "+[e,e.stack]);throw e}}if(Module["postMainLoop"])Module["postMainLoop"]()})},isFullscreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:(function(){if(!Module["preloadPlugins"])Module["preloadPlugins"]=[];if(Browser.initted)return;Browser.initted=true;try{new Blob;Browser.hasBlobConstructor=true}catch(e){Browser.hasBlobConstructor=false;console.log("warning: no blob constructor, cannot create blobs with mimetypes")}Browser.BlobBuilder=typeof MozBlobBuilder!="undefined"?MozBlobBuilder:typeof WebKitBlobBuilder!="undefined"?WebKitBlobBuilder:!Browser.hasBlobConstructor?console.log("warning: no BlobBuilder"):null;Browser.URLObject=typeof window!="undefined"?window.URL?window.URL:window.webkitURL:undefined;if(!Module.noImageDecoding&&typeof Browser.URLObject==="undefined"){console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");Module.noImageDecoding=true}var imagePlugin={};imagePlugin["canHandle"]=function imagePlugin_canHandle(name){return!Module.noImageDecoding&&/\.(jpg|jpeg|png|bmp)$/i.test(name)};imagePlugin["handle"]=function imagePlugin_handle(byteArray,name,onload,onerror){var b=null;if(Browser.hasBlobConstructor){try{b=new Blob([byteArray],{type:Browser.getMimetype(name)});if(b.size!==byteArray.length){b=new Blob([(new Uint8Array(byteArray)).buffer],{type:Browser.getMimetype(name)})}}catch(e){Runtime.warnOnce("Blob constructor present but fails: "+e+"; falling back to blob builder")}}if(!b){var bb=new Browser.BlobBuilder;bb.append((new Uint8Array(byteArray)).buffer);b=bb.getBlob()}var url=Browser.URLObject.createObjectURL(b);var img=new Image;img.onload=function img_onload(){assert(img.complete,"Image "+name+" could not be decoded");var canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;var ctx=canvas.getContext("2d");ctx.drawImage(img,0,0);Module["preloadedImages"][name]=canvas;Browser.URLObject.revokeObjectURL(url);if(onload)onload(byteArray)};img.onerror=function img_onerror(event){console.log("Image "+url+" could not be decoded");if(onerror)onerror()};img.src=url};Module["preloadPlugins"].push(imagePlugin);var audioPlugin={};audioPlugin["canHandle"]=function audioPlugin_canHandle(name){return!Module.noAudioDecoding&&name.substr(-4)in{".ogg":1,".wav":1,".mp3":1}};audioPlugin["handle"]=function audioPlugin_handle(byteArray,name,onload,onerror){var done=false;function finish(audio){if(done)return;done=true;Module["preloadedAudios"][name]=audio;if(onload)onload(byteArray)}function fail(){if(done)return;done=true;Module["preloadedAudios"][name]=new Audio;if(onerror)onerror()}if(Browser.hasBlobConstructor){try{var b=new Blob([byteArray],{type:Browser.getMimetype(name)})}catch(e){return fail()}var url=Browser.URLObject.createObjectURL(b);var audio=new Audio;audio.addEventListener("canplaythrough",(function(){finish(audio)}),false);audio.onerror=function audio_onerror(event){if(done)return;console.log("warning: browser could not fully decode audio "+name+", trying slower base64 approach");function encode64(data){var BASE="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var PAD="=";var ret="";var leftchar=0;var leftbits=0;for(var i=0;i<data.length;i++){leftchar=leftchar<<8|data[i];leftbits+=8;while(leftbits>=6){var curr=leftchar>>leftbits-6&63;leftbits-=6;ret+=BASE[curr]}}if(leftbits==2){ret+=BASE[(leftchar&3)<<4];ret+=PAD+PAD}else if(leftbits==4){ret+=BASE[(leftchar&15)<<2];ret+=PAD}return ret}audio.src="data:audio/x-"+name.substr(-3)+";base64,"+encode64(byteArray);finish(audio)};audio.src=url;Browser.safeSetTimeout((function(){finish(audio)}),1e4)}else{return fail()}};Module["preloadPlugins"].push(audioPlugin);function pointerLockChange(){Browser.pointerLock=document["pointerLockElement"]===Module["canvas"]||document["mozPointerLockElement"]===Module["canvas"]||document["webkitPointerLockElement"]===Module["canvas"]||document["msPointerLockElement"]===Module["canvas"]}var canvas=Module["canvas"];if(canvas){canvas.requestPointerLock=canvas["requestPointerLock"]||canvas["mozRequestPointerLock"]||canvas["webkitRequestPointerLock"]||canvas["msRequestPointerLock"]||(function(){});canvas.exitPointerLock=document["exitPointerLock"]||document["mozExitPointerLock"]||document["webkitExitPointerLock"]||document["msExitPointerLock"]||(function(){});canvas.exitPointerLock=canvas.exitPointerLock.bind(document);document.addEventListener("pointerlockchange",pointerLockChange,false);document.addEventListener("mozpointerlockchange",pointerLockChange,false);document.addEventListener("webkitpointerlockchange",pointerLockChange,false);document.addEventListener("mspointerlockchange",pointerLockChange,false);if(Module["elementPointerLock"]){canvas.addEventListener("click",(function(ev){if(!Browser.pointerLock&&Module["canvas"].requestPointerLock){Module["canvas"].requestPointerLock();ev.preventDefault()}}),false)}}}),createContext:(function(canvas,useWebGL,setInModule,webGLContextAttributes){if(useWebGL&&Module.ctx&&canvas==Module.canvas)return Module.ctx;var ctx;var contextHandle;if(useWebGL){var contextAttributes={antialias:false,alpha:false};if(webGLContextAttributes){for(var attribute in webGLContextAttributes){contextAttributes[attribute]=webGLContextAttributes[attribute]}}contextHandle=GL.createContext(canvas,contextAttributes);if(contextHandle){ctx=GL.getContext(contextHandle).GLctx}}else{ctx=canvas.getContext("2d")}if(!ctx)return null;if(setInModule){if(!useWebGL)assert(typeof GLctx==="undefined","cannot set in module if GLctx is used, but we are a non-GL context that would replace it");Module.ctx=ctx;if(useWebGL)GL.makeContextCurrent(contextHandle);Module.useWebGL=useWebGL;Browser.moduleContextCreatedCallbacks.forEach((function(callback){callback()}));Browser.init()}return ctx}),destroyContext:(function(canvas,useWebGL,setInModule){}),fullscreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullscreen:(function(lockPointer,resizeCanvas,vrDevice){Browser.lockPointer=lockPointer;Browser.resizeCanvas=resizeCanvas;Browser.vrDevice=vrDevice;if(typeof Browser.lockPointer==="undefined")Browser.lockPointer=true;if(typeof Browser.resizeCanvas==="undefined")Browser.resizeCanvas=false;if(typeof Browser.vrDevice==="undefined")Browser.vrDevice=null;var canvas=Module["canvas"];function fullscreenChange(){Browser.isFullscreen=false;var canvasContainer=canvas.parentNode;if((document["fullscreenElement"]||document["mozFullScreenElement"]||document["msFullscreenElement"]||document["webkitFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvasContainer){canvas.exitFullscreen=document["exitFullscreen"]||document["cancelFullScreen"]||document["mozCancelFullScreen"]||document["msExitFullscreen"]||document["webkitCancelFullScreen"]||(function(){});canvas.exitFullscreen=canvas.exitFullscreen.bind(document);if(Browser.lockPointer)canvas.requestPointerLock();Browser.isFullscreen=true;if(Browser.resizeCanvas)Browser.setFullscreenCanvasSize()}else{canvasContainer.parentNode.insertBefore(canvas,canvasContainer);canvasContainer.parentNode.removeChild(canvasContainer);if(Browser.resizeCanvas)Browser.setWindowedCanvasSize()}if(Module["onFullScreen"])Module["onFullScreen"](Browser.isFullscreen);if(Module["onFullscreen"])Module["onFullscreen"](Browser.isFullscreen);Browser.updateCanvasDimensions(canvas)}if(!Browser.fullscreenHandlersInstalled){Browser.fullscreenHandlersInstalled=true;document.addEventListener("fullscreenchange",fullscreenChange,false);document.addEventListener("mozfullscreenchange",fullscreenChange,false);document.addEventListener("webkitfullscreenchange",fullscreenChange,false);document.addEventListener("MSFullscreenChange",fullscreenChange,false)}var canvasContainer=document.createElement("div");canvas.parentNode.insertBefore(canvasContainer,canvas);canvasContainer.appendChild(canvas);canvasContainer.requestFullscreen=canvasContainer["requestFullscreen"]||canvasContainer["mozRequestFullScreen"]||canvasContainer["msRequestFullscreen"]||(canvasContainer["webkitRequestFullscreen"]?(function(){canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"])}):null)||(canvasContainer["webkitRequestFullScreen"]?(function(){canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"])}):null);if(vrDevice){canvasContainer.requestFullscreen({vrDisplay:vrDevice})}else{canvasContainer.requestFullscreen()}}),requestFullScreen:(function(lockPointer,resizeCanvas,vrDevice){Module.printErr("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");Browser.requestFullScreen=(function(lockPointer,resizeCanvas,vrDevice){return Browser.requestFullscreen(lockPointer,resizeCanvas,vrDevice)});return Browser.requestFullscreen(lockPointer,resizeCanvas,vrDevice)}),nextRAF:0,fakeRequestAnimationFrame:(function(func){var now=Date.now();if(Browser.nextRAF===0){Browser.nextRAF=now+1e3/60}else{while(now+2>=Browser.nextRAF){Browser.nextRAF+=1e3/60}}var delay=Math.max(Browser.nextRAF-now,0);setTimeout(func,delay)}),requestAnimationFrame:function requestAnimationFrame(func){if(typeof window==="undefined"){Browser.fakeRequestAnimationFrame(func)}else{if(!window.requestAnimationFrame){window.requestAnimationFrame=window["requestAnimationFrame"]||window["mozRequestAnimationFrame"]||window["webkitRequestAnimationFrame"]||window["msRequestAnimationFrame"]||window["oRequestAnimationFrame"]||Browser.fakeRequestAnimationFrame}window.requestAnimationFrame(func)}},safeCallback:(function(func){return(function(){if(!ABORT)return func.apply(null,arguments)})}),allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=false}),resumeAsyncCallbacks:(function(){Browser.allowAsyncCallbacks=true;if(Browser.queuedAsyncCallbacks.length>0){var callbacks=Browser.queuedAsyncCallbacks;Browser.queuedAsyncCallbacks=[];callbacks.forEach((function(func){func()}))}}),safeRequestAnimationFrame:(function(func){return Browser.requestAnimationFrame((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}))}),safeSetTimeout:(function(func,timeout){Module["noExitRuntime"]=true;return setTimeout((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}else{Browser.queuedAsyncCallbacks.push(func)}}),timeout)}),safeSetInterval:(function(func,timeout){Module["noExitRuntime"]=true;return setInterval((function(){if(ABORT)return;if(Browser.allowAsyncCallbacks){func()}}),timeout)}),getMimetype:(function(name){return{"jpg":"image/jpeg","jpeg":"image/jpeg","png":"image/png","bmp":"image/bmp","ogg":"audio/ogg","wav":"audio/wav","mp3":"audio/mpeg"}[name.substr(name.lastIndexOf(".")+1)]}),getUserMedia:(function(func){if(!window.getUserMedia){window.getUserMedia=navigator["getUserMedia"]||navigator["mozGetUserMedia"]}window.getUserMedia(func)}),getMovementX:(function(event){return event["movementX"]||event["mozMovementX"]||event["webkitMovementX"]||0}),getMovementY:(function(event){return event["movementY"]||event["mozMovementY"]||event["webkitMovementY"]||0}),getMouseWheelDelta:(function(event){var delta=0;switch(event.type){case"DOMMouseScroll":delta=event.detail;break;case"mousewheel":delta=event.wheelDelta;break;case"wheel":delta=event["deltaY"];break;default:throw"unrecognized mouse wheel event: "+event.type}return delta}),mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:(function(event){if(Browser.pointerLock){if(event.type!="mousemove"&&"mozMovementX"in event){Browser.mouseMovementX=Browser.mouseMovementY=0}else{Browser.mouseMovementX=Browser.getMovementX(event);Browser.mouseMovementY=Browser.getMovementY(event)}if(typeof SDL!="undefined"){Browser.mouseX=SDL.mouseX+Browser.mouseMovementX;Browser.mouseY=SDL.mouseY+Browser.mouseMovementY}else{Browser.mouseX+=Browser.mouseMovementX;Browser.mouseY+=Browser.mouseMovementY}}else{var rect=Module["canvas"].getBoundingClientRect();var cw=Module["canvas"].width;var ch=Module["canvas"].height;var scrollX=typeof window.scrollX!=="undefined"?window.scrollX:window.pageXOffset;var scrollY=typeof window.scrollY!=="undefined"?window.scrollY:window.pageYOffset;if(event.type==="touchstart"||event.type==="touchend"||event.type==="touchmove"){var touch=event.touch;if(touch===undefined){return}var adjustedX=touch.pageX-(scrollX+rect.left);var adjustedY=touch.pageY-(scrollY+rect.top);adjustedX=adjustedX*(cw/rect.width);adjustedY=adjustedY*(ch/rect.height);var coords={x:adjustedX,y:adjustedY};if(event.type==="touchstart"){Browser.lastTouches[touch.identifier]=coords;Browser.touches[touch.identifier]=coords}else if(event.type==="touchend"||event.type==="touchmove"){var last=Browser.touches[touch.identifier];if(!last)last=coords;Browser.lastTouches[touch.identifier]=last;Browser.touches[touch.identifier]=coords}return}var x=event.pageX-(scrollX+rect.left);var y=event.pageY-(scrollY+rect.top);x=x*(cw/rect.width);y=y*(ch/rect.height);Browser.mouseMovementX=x-Browser.mouseX;Browser.mouseMovementY=y-Browser.mouseY;Browser.mouseX=x;Browser.mouseY=y}}),asyncLoad:(function(url,onload,onerror,noRunDep){var dep=!noRunDep?getUniqueRunDependency("al "+url):"";Module["readAsync"](url,(function(arrayBuffer){assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(dep)removeRunDependency(dep)}),(function(event){if(onerror){onerror()}else{throw'Loading data file "'+url+'" failed.'}}));if(dep)addRunDependency(dep)}),resizeListeners:[],updateResizeListeners:(function(){var canvas=Module["canvas"];Browser.resizeListeners.forEach((function(listener){listener(canvas.width,canvas.height)}))}),setCanvasSize:(function(width,height,noUpdates){var canvas=Module["canvas"];Browser.updateCanvasDimensions(canvas,width,height);if(!noUpdates)Browser.updateResizeListeners()}),windowedWidth:0,windowedHeight:0,setFullscreenCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags|8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags}Browser.updateResizeListeners()}),setWindowedCanvasSize:(function(){if(typeof SDL!="undefined"){var flags=HEAPU32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2];flags=flags&~8388608;HEAP32[SDL.screen+Runtime.QUANTUM_SIZE*0>>2]=flags}Browser.updateResizeListeners()}),updateCanvasDimensions:(function(canvas,wNative,hNative){if(wNative&&hNative){canvas.widthNative=wNative;canvas.heightNative=hNative}else{wNative=canvas.widthNative;hNative=canvas.heightNative}var w=wNative;var h=hNative;if(Module["forcedAspectRatio"]&&Module["forcedAspectRatio"]>0){if(w/h<Module["forcedAspectRatio"]){w=Math.round(h*Module["forcedAspectRatio"])}else{h=Math.round(w/Module["forcedAspectRatio"])}}if((document["fullscreenElement"]||document["mozFullScreenElement"]||document["msFullscreenElement"]||document["webkitFullscreenElement"]||document["webkitCurrentFullScreenElement"])===canvas.parentNode&&typeof screen!="undefined"){var factor=Math.min(screen.width/w,screen.height/h);w=Math.round(w*factor);h=Math.round(h*factor)}if(Browser.resizeCanvas){if(canvas.width!=w)canvas.width=w;if(canvas.height!=h)canvas.height=h;if(typeof canvas.style!="undefined"){canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}else{if(canvas.width!=wNative)canvas.width=wNative;if(canvas.height!=hNative)canvas.height=hNative;if(typeof canvas.style!="undefined"){if(w!=wNative||h!=hNative){canvas.style.setProperty("width",w+"px","important");canvas.style.setProperty("height",h+"px","important")}else{canvas.style.removeProperty("width");canvas.style.removeProperty("height")}}}}),wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:(function(){var handle=Browser.nextWgetRequestHandle;Browser.nextWgetRequestHandle++;return handle})};function _atexit(func,arg){__ATEXIT__.unshift({func:func,arg:arg})}function ___cxa_atexit(){return _atexit.apply(null,arguments)}var SYSCALLS={varargs:0,get:(function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret}),getStr:(function(){var ret=Pointer_stringify(SYSCALLS.get());return ret}),get64:(function(){var low=SYSCALLS.get(),high=SYSCALLS.get();if(low>=0)assert(high===0);else assert(high===-1);return low}),getZero:(function(){assert(SYSCALLS.get()===0)})};function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.get(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();var ret=0;if(!___syscall146.buffer){___syscall146.buffers=[null,[],[]];___syscall146.printChar=(function(stream,curr){var buffer=___syscall146.buffers[stream];assert(buffer);if(curr===0||curr===10){(stream===1?Module["print"]:Module["printErr"])(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}})}for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];for(var j=0;j<len;j++){___syscall146.printChar(stream,HEAPU8[ptr+j])}ret+=len}return ret}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall54(which,varargs){SYSCALLS.varargs=varargs;try{return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_STATIC);function __decorate(decorators,target,key,desc){var c=arguments.length,r=c<3?target:desc===null?desc=Object.getOwnPropertyDescriptor(target,key):desc,d;if(typeof Reflect==="object"&&typeof Reflect.decorate==="function")r=Reflect.decorate(decorators,target,key,desc);else for(var i=decorators.length-1;i>=0;i--)if(d=decorators[i])r=(c<3?d(r):c>3?d(target,key,r):d(target,key))||r;return c>3&&r&&Object.defineProperty(target,key,r),r}function _defineHidden(value){return(function(target,key){Object.defineProperty(target,key,{configurable:false,enumerable:false,value:value,writable:true})})}var _nbind={};function __nbind_finish(){for(var _i=0,_a=_nbind.BindClass.list;_i<_a.length;_i++){var bindClass=_a[_i];bindClass.finish()}}function __nbind_free_external(num){_nbind.externalList[num].dereference(num)}function __nbind_get_value_object(num,ptr){var obj=_nbind.popValue(num);if(!obj.fromJS){throw new Error("Object "+obj+" has no fromJS function")}obj.fromJS((function(){obj.__nbindValueConstructor.apply(this,Array.prototype.concat.apply([ptr],arguments))}))}function __nbind_reference_external(num){_nbind.externalList[num].reference()}function __nbind_register_callback_signature(typeListPtr,typeCount){var typeList=_nbind.readTypeIdList(typeListPtr,typeCount);var num=_nbind.callbackSignatureList.length;_nbind.callbackSignatureList[num]=_nbind.makeJSCaller(typeList);return num}function __extends(Class,Parent){for(var key in Parent)if(Parent.hasOwnProperty(key))Class[key]=Parent[key];function Base(){this.constructor=Class}Base.prototype=Parent.prototype;Class.prototype=new Base}function __nbind_register_class(idListPtr,policyListPtr,superListPtr,upcastListPtr,superCount,destructorPtr,namePtr){var name=_nbind.readAsciiString(namePtr);var policyTbl=_nbind.readPolicyList(policyListPtr);var idList=HEAPU32.subarray(idListPtr/4,idListPtr/4+2);var spec={flags:2048|(policyTbl["Value"]?2:0),id:idList[0],name:name};var bindClass=_nbind.makeType(_nbind.constructType,spec);bindClass.ptrType=_nbind.getComplexType(idList[1],_nbind.constructType,_nbind.getType,_nbind.queryType);bindClass.destroy=_nbind.makeMethodCaller(bindClass.ptrType,{boundID:spec.id,flags:0,name:"destroy",num:0,ptr:destructorPtr,title:bindClass.name+".free",typeList:["void","uint32_t","uint32_t"]});if(superCount){bindClass.superIdList=Array.prototype.slice.call(HEAPU32.subarray(superListPtr/4,superListPtr/4+superCount));bindClass.upcastList=Array.prototype.slice.call(HEAPU32.subarray(upcastListPtr/4,upcastListPtr/4+superCount))}Module[bindClass.name]=bindClass.makeBound(policyTbl);_nbind.BindClass.list.push(bindClass)}function _removeAccessorPrefix(name){var prefixMatcher=/^[Gg]et_?([A-Z]?([A-Z]?))/;return name.replace(prefixMatcher,(function(match,initial,second){return second?initial:initial.toLowerCase()}))}function __nbind_register_function(boundID,policyListPtr,typeListPtr,typeCount,ptr,direct,signatureType,namePtr,num,flags){var bindClass=_nbind.getType(boundID);var policyTbl=_nbind.readPolicyList(policyListPtr);var typeList=_nbind.readTypeIdList(typeListPtr,typeCount);var specList;if(signatureType==5){specList=[{direct:ptr,name:"__nbindConstructor",ptr:0,title:bindClass.name+" constructor",typeList:["uint32_t"].concat(typeList.slice(1))},{direct:direct,name:"__nbindValueConstructor",ptr:0,title:bindClass.name+" value constructor",typeList:["void","uint32_t"].concat(typeList.slice(1))}]}else{var name=_nbind.readAsciiString(namePtr);var title=(bindClass.name&&bindClass.name+".")+name;if(signatureType==3||signatureType==4){name=_removeAccessorPrefix(name)}specList=[{boundID:boundID,direct:direct,name:name,ptr:ptr,title:title,typeList:typeList}]}for(var _i=0,specList_1=specList;_i<specList_1.length;_i++){var spec=specList_1[_i];spec.signatureType=signatureType;spec.policyTbl=policyTbl;spec.num=num;spec.flags=flags;bindClass.addMethod(spec)}}function __nbind_register_pool(pageSize,usedPtr,rootPtr,pagePtr){_nbind.Pool.pageSize=pageSize;_nbind.Pool.usedPtr=usedPtr/4;_nbind.Pool.rootPtr=rootPtr;_nbind.Pool.pagePtr=pagePtr/4;HEAP32[usedPtr/4]=16909060;if(HEAP8[usedPtr]==1)_nbind.bigEndian=true;HEAP32[usedPtr/4]=0;_nbind.makeTypeKindTbl=(_a={},_a[1024]=_nbind.PrimitiveType,_a[64]=_nbind.Int64Type,_a[2048]=_nbind.BindClass,_a[3072]=_nbind.BindClassPtr,_a[4096]=_nbind.SharedClassPtr,_a[5120]=_nbind.ArrayType,_a[6144]=_nbind.ArrayType,_a[7168]=_nbind.CStringType,_a[9216]=_nbind.CallbackType,_a[10240]=_nbind.BindType,_a);_nbind.makeTypeNameTbl={"Buffer":_nbind.BufferType,"External":_nbind.ExternalType,"Int64":_nbind.Int64Type,"_nbind_new":_nbind.CreateValueType,"bool":_nbind.BooleanType,"cbFunction &":_nbind.CallbackType,"const cbFunction &":_nbind.CallbackType,"const std::string &":_nbind.StringType,"std::string":_nbind.StringType};Module["toggleLightGC"]=_nbind.toggleLightGC;_nbind.callUpcast=Module["dynCall_ii"];var globalScope=_nbind.makeType(_nbind.constructType,{flags:2048,id:0,name:""});globalScope.proto=Module;_nbind.BindClass.list.push(globalScope);var _a}function __nbind_register_primitive(id,size,flags){var spec={flags:1024|flags,id:id,ptrSize:size};_nbind.makeType(_nbind.constructType,spec)}function _typeModule(self){var structureList=[[0,1,"X"],[1,1,"const X"],[128,1,"X *"],[256,1,"X &"],[384,1,"X &&"],[512,1,"std::shared_ptr<X>"],[640,1,"std::unique_ptr<X>"],[5120,1,"std::vector<X>"],[6144,2,"std::array<X, Y>"],[9216,-1,"std::function<X (Y)>"]];function applyStructure(outerName,outerFlags,innerName,innerFlags,param,flip){if(outerFlags==1){var ref=innerFlags&896;if(ref==128||ref==256||ref==384)outerName="X const"}var name;if(flip){name=innerName.replace("X",outerName).replace("Y",param)}else{name=outerName.replace("X",innerName).replace("Y",param)}return name.replace(/([*&]) (?=[*&])/g,"$1")}function reportProblem(problem,id,kind,structureType,place){throw new Error(problem+" type "+kind.replace("X",id+"?")+(structureType?" with flag "+structureType:"")+" in "+place)}function getComplexType(id,constructType,getType,queryType,place,kind,prevStructure,depth){if(kind===void 0){kind="X"}if(depth===void 0){depth=1}var result=getType(id);if(result)return result;var query=queryType(id);var structureType=query.placeholderFlag;var structure=structureList[structureType];if(prevStructure&&structure){kind=applyStructure(prevStructure[2],prevStructure[0],kind,structure[0],"?",true)}var problem;if(structureType==0)problem="Unbound";if(structureType>=10)problem="Corrupt";if(depth>20)problem="Deeply nested";if(problem)reportProblem(problem,id,kind,structureType,place||"?");var subId=query.paramList[0];var subType=getComplexType(subId,constructType,getType,queryType,place,kind,structure,depth+1);var srcSpec;var spec={flags:structure[0],id:id,name:"",paramList:[subType]};var argList=[];var structureParam="?";switch(query.placeholderFlag){case 1:srcSpec=subType.spec;break;case 2:if((subType.flags&15360)==1024&&subType.spec.ptrSize==1){spec.flags=7168;break};case 3:case 6:case 5:srcSpec=subType.spec;if((subType.flags&15360)!=2048){}break;case 8:structureParam=""+query.paramList[1];spec.paramList.push(query.paramList[1]);break;case 9:for(var _i=0,_a=query.paramList[1];_i<_a.length;_i++){var paramId=_a[_i];var paramType=getComplexType(paramId,constructType,getType,queryType,place,kind,structure,depth+1);argList.push(paramType.name);spec.paramList.push(paramType)}structureParam=argList.join(", ");break;default:break}spec.name=applyStructure(structure[2],structure[0],subType.name,subType.flags,structureParam);if(srcSpec){for(var _b=0,_c=Object.keys(srcSpec);_b<_c.length;_b++){var key=_c[_b];spec[key]=spec[key]||srcSpec[key]}spec.flags|=srcSpec.flags}return makeType(constructType,spec)}function makeType(constructType,spec){var flags=spec.flags;var refKind=flags&896;var kind=flags&15360;if(!spec.name&&kind==1024){if(spec.ptrSize==1){spec.name=(flags&16?"":(flags&8?"un":"")+"signed ")+"char"}else{spec.name=(flags&8?"u":"")+(flags&32?"float":"int")+(spec.ptrSize*8+"_t")}}if(spec.ptrSize==8&&!(flags&32))kind=64;if(kind==2048){if(refKind==512||refKind==640){kind=4096}else if(refKind)kind=3072}return constructType(kind,spec)}var Type=(function(){function Type(spec){this.id=spec.id;this.name=spec.name;this.flags=spec.flags;this.spec=spec}Type.prototype.toString=(function(){return this.name});return Type})();var output={Type:Type,getComplexType:getComplexType,makeType:makeType,structureList:structureList};self.output=output;return self.output||output}function __nbind_register_type(id,namePtr){var name=_nbind.readAsciiString(namePtr);var spec={flags:10240,id:id,name:name};_nbind.makeType(_nbind.constructType,spec)}function _abort(){Module["abort"]()}function _llvm_stackrestore(p){var self=_llvm_stacksave;var ret=self.LLVM_SAVEDSTACKS[p];self.LLVM_SAVEDSTACKS.splice(p,1);Runtime.stackRestore(ret)}function _llvm_stacksave(){var self=_llvm_stacksave;if(!self.LLVM_SAVEDSTACKS){self.LLVM_SAVEDSTACKS=[]}self.LLVM_SAVEDSTACKS.push(Runtime.stackSave());return self.LLVM_SAVEDSTACKS.length-1}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest);return dest}function _nbind_value(name,proto){if(!_nbind.typeNameTbl[name])_nbind.throwError("Unknown value type "+name);Module["NBind"].bind_value(name,proto);_defineHidden(_nbind.typeNameTbl[name].proto.prototype.__nbindValueConstructor)(proto.prototype,"__nbindValueConstructor")}Module["_nbind_value"]=_nbind_value;function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}var ___dso_handle=STATICTOP;STATICTOP+=16;Module["requestFullScreen"]=function Module_requestFullScreen(lockPointer,resizeCanvas,vrDevice){Module.printErr("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");Module["requestFullScreen"]=Module["requestFullscreen"];Browser.requestFullScreen(lockPointer,resizeCanvas,vrDevice)};Module["requestFullscreen"]=function Module_requestFullscreen(lockPointer,resizeCanvas,vrDevice){Browser.requestFullscreen(lockPointer,resizeCanvas,vrDevice)};Module["requestAnimationFrame"]=function Module_requestAnimationFrame(func){Browser.requestAnimationFrame(func)};Module["setCanvasSize"]=function Module_setCanvasSize(width,height,noUpdates){Browser.setCanvasSize(width,height,noUpdates)};Module["pauseMainLoop"]=function Module_pauseMainLoop(){Browser.mainLoop.pause()};Module["resumeMainLoop"]=function Module_resumeMainLoop(){Browser.mainLoop.resume()};Module["getUserMedia"]=function Module_getUserMedia(){Browser.getUserMedia()};Module["createContext"]=function Module_createContext(canvas,useWebGL,setInModule,webGLContextAttributes){return Browser.createContext(canvas,useWebGL,setInModule,webGLContextAttributes)};if(ENVIRONMENT_IS_NODE){_emscripten_get_now=function _emscripten_get_now_actual(){var t=process["hrtime"]();return t[0]*1e3+t[1]/1e6}}else if(typeof dateNow!=="undefined"){_emscripten_get_now=dateNow}else if(typeof self==="object"&&self["performance"]&&typeof self["performance"]["now"]==="function"){_emscripten_get_now=(function(){return self["performance"]["now"]()})}else if(typeof performance==="object"&&typeof performance["now"]==="function"){_emscripten_get_now=(function(){return performance["now"]()})}else{_emscripten_get_now=Date.now}__ATEXIT__.push((function(){var fflush=Module["_fflush"];if(fflush)fflush(0);var printChar=___syscall146.printChar;if(!printChar)return;var buffers=___syscall146.buffers;if(buffers[1].length)printChar(1,10);if(buffers[2].length)printChar(2,10)}));((function(_nbind){var typeIdTbl={};_nbind.typeNameTbl={};var Pool=(function(){function Pool(){}Pool.lalloc=(function(size){size=size+7&~7;var used=HEAPU32[Pool.usedPtr];if(size>Pool.pageSize/2||size>Pool.pageSize-used){var NBind=_nbind.typeNameTbl["NBind"].proto;return NBind.lalloc(size)}else{HEAPU32[Pool.usedPtr]=used+size;return Pool.rootPtr+used}});Pool.lreset=(function(used,page){var topPage=HEAPU32[Pool.pagePtr];if(topPage){var NBind=_nbind.typeNameTbl["NBind"].proto;NBind.lreset(used,page)}else{HEAPU32[Pool.usedPtr]=used}});return Pool})();_nbind.Pool=Pool;function constructType(kind,spec){var construct=kind==10240?_nbind.makeTypeNameTbl[spec.name]||_nbind.BindType:_nbind.makeTypeKindTbl[kind];var bindType=new construct(spec);typeIdTbl[spec.id]=bindType;_nbind.typeNameTbl[spec.name]=bindType;return bindType}_nbind.constructType=constructType;function getType(id){return typeIdTbl[id]}_nbind.getType=getType;function queryType(id){var placeholderFlag=HEAPU8[id];var paramCount=_nbind.structureList[placeholderFlag][1];id/=4;if(paramCount<0){++id;paramCount=HEAPU32[id]+1}var paramList=Array.prototype.slice.call(HEAPU32.subarray(id+1,id+1+paramCount));if(placeholderFlag==9){paramList=[paramList[0],paramList.slice(1)]}return{paramList:paramList,placeholderFlag:placeholderFlag}}_nbind.queryType=queryType;function getTypes(idList,place){return idList.map((function(id){return typeof id=="number"?_nbind.getComplexType(id,constructType,getType,queryType,place):_nbind.typeNameTbl[id]}))}_nbind.getTypes=getTypes;function readTypeIdList(typeListPtr,typeCount){return Array.prototype.slice.call(HEAPU32,typeListPtr/4,typeListPtr/4+typeCount)}_nbind.readTypeIdList=readTypeIdList;function readAsciiString(ptr){var endPtr=ptr;while(HEAPU8[endPtr++]);return String.fromCharCode.apply("",HEAPU8.subarray(ptr,endPtr-1))}_nbind.readAsciiString=readAsciiString;function readPolicyList(policyListPtr){var policyTbl={};if(policyListPtr){while(1){var namePtr=HEAPU32[policyListPtr/4];if(!namePtr)break;policyTbl[readAsciiString(namePtr)]=true;policyListPtr+=4}}return policyTbl}_nbind.readPolicyList=readPolicyList;function getDynCall(typeList,name){var mangleMap={float32_t:"d",float64_t:"d",int64_t:"d",uint64_t:"d","void":"v"};var signature=typeList.map((function(type){return mangleMap[type.name]||"i"})).join("");var dynCall=Module["dynCall_"+signature];if(!dynCall){throw new Error("dynCall_"+signature+" not found for "+name+"("+typeList.map((function(type){return type.name})).join(", ")+")")}return dynCall}_nbind.getDynCall=getDynCall;function addMethod(obj,name,func,arity){var overload=obj[name];if(obj.hasOwnProperty(name)&&overload){if(overload.arity||overload.arity===0){overload=_nbind.makeOverloader(overload,overload.arity);obj[name]=overload}overload.addMethod(func,arity)}else{func.arity=arity;obj[name]=func}}_nbind.addMethod=addMethod;function throwError(message){throw new Error(message)}_nbind.throwError=throwError;_nbind.bigEndian=false;_a=_typeModule(_typeModule),_nbind.Type=_a.Type,_nbind.makeType=_a.makeType,_nbind.getComplexType=_a.getComplexType,_nbind.structureList=_a.structureList;var BindType=(function(_super){__extends(BindType,_super);function BindType(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.heap=HEAPU32;_this.ptrSize=4;return _this}BindType.prototype.needsWireRead=(function(policyTbl){return!!this.wireRead||!!this.makeWireRead});BindType.prototype.needsWireWrite=(function(policyTbl){return!!this.wireWrite||!!this.makeWireWrite});return BindType})(_nbind.Type);_nbind.BindType=BindType;var PrimitiveType=(function(_super){__extends(PrimitiveType,_super);function PrimitiveType(spec){var _this=_super.call(this,spec)||this;var heapTbl=spec.flags&32?{32:HEAPF32,64:HEAPF64}:spec.flags&8?{8:HEAPU8,16:HEAPU16,32:HEAPU32}:{8:HEAP8,16:HEAP16,32:HEAP32};_this.heap=heapTbl[spec.ptrSize*8];_this.ptrSize=spec.ptrSize;return _this}PrimitiveType.prototype.needsWireWrite=(function(policyTbl){return!!policyTbl&&!!policyTbl["Strict"]});PrimitiveType.prototype.makeWireWrite=(function(expr,policyTbl){return policyTbl&&policyTbl["Strict"]&&(function(arg){if(typeof arg=="number")return arg;throw new Error("Type mismatch")})});return PrimitiveType})(BindType);_nbind.PrimitiveType=PrimitiveType;function pushCString(str,policyTbl){if(str===null||str===undefined){if(policyTbl&&policyTbl["Nullable"]){return 0}else throw new Error("Type mismatch")}if(policyTbl&&policyTbl["Strict"]){if(typeof str!="string")throw new Error("Type mismatch")}else str=str.toString();var length=Module.lengthBytesUTF8(str)+1;var result=_nbind.Pool.lalloc(length);Module.stringToUTF8Array(str,HEAPU8,result,length);return result}_nbind.pushCString=pushCString;function popCString(ptr){if(ptr===0)return null;return Module.Pointer_stringify(ptr)}_nbind.popCString=popCString;var CStringType=(function(_super){__extends(CStringType,_super);function CStringType(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.wireRead=popCString;_this.wireWrite=pushCString;_this.readResources=[_nbind.resources.pool];_this.writeResources=[_nbind.resources.pool];return _this}CStringType.prototype.makeWireWrite=(function(expr,policyTbl){return(function(arg){return pushCString(arg,policyTbl)})});return CStringType})(BindType);_nbind.CStringType=CStringType;var BooleanType=(function(_super){__extends(BooleanType,_super);function BooleanType(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.wireRead=(function(arg){return!!arg});return _this}BooleanType.prototype.needsWireWrite=(function(policyTbl){return!!policyTbl&&!!policyTbl["Strict"]});BooleanType.prototype.makeWireRead=(function(expr){return"!!("+expr+")"});BooleanType.prototype.makeWireWrite=(function(expr,policyTbl){return policyTbl&&policyTbl["Strict"]&&(function(arg){if(typeof arg=="boolean")return arg;throw new Error("Type mismatch")})||expr});return BooleanType})(BindType);_nbind.BooleanType=BooleanType;var Wrapper=(function(){function Wrapper(){}Wrapper.prototype.persist=(function(){this.__nbindState|=1});return Wrapper})();_nbind.Wrapper=Wrapper;function makeBound(policyTbl,bindClass){var Bound=(function(_super){__extends(Bound,_super);function Bound(marker,flags,ptr,shared){var _this=_super.call(this)||this;if(!(_this instanceof Bound)){return new(Function.prototype.bind.apply(Bound,Array.prototype.concat.apply([null],arguments)))}var nbindFlags=flags;var nbindPtr=ptr;var nbindShared=shared;if(marker!==_nbind.ptrMarker){var wirePtr=_this.__nbindConstructor.apply(_this,arguments);nbindFlags=4096|512;nbindShared=HEAPU32[wirePtr/4];nbindPtr=HEAPU32[wirePtr/4+1]}var spec={configurable:true,enumerable:false,value:null,writable:false};var propTbl={"__nbindFlags":nbindFlags,"__nbindPtr":nbindPtr};if(nbindShared){propTbl["__nbindShared"]=nbindShared;_nbind.mark(_this)}for(var _i=0,_a=Object.keys(propTbl);_i<_a.length;_i++){var key=_a[_i];spec.value=propTbl[key];Object.defineProperty(_this,key,spec)}_defineHidden(0)(_this,"__nbindState");return _this}Bound.prototype.free=(function(){bindClass.destroy.call(this,this.__nbindShared,this.__nbindFlags);this.__nbindState|=2;disableMember(this,"__nbindShared");disableMember(this,"__nbindPtr")});return Bound})(Wrapper);__decorate([_defineHidden()],Bound.prototype,"__nbindConstructor",void 0);__decorate([_defineHidden()],Bound.prototype,"__nbindValueConstructor",void 0);__decorate([_defineHidden(policyTbl)],Bound.prototype,"__nbindPolicies",void 0);return Bound}_nbind.makeBound=makeBound;function disableMember(obj,name){function die(){throw new Error("Accessing deleted object")}Object.defineProperty(obj,name,{configurable:false,enumerable:false,get:die,set:die})}_nbind.ptrMarker={};var BindClass=(function(_super){__extends(BindClass,_super);function BindClass(spec){var _this=_super.call(this,spec)||this;_this.wireRead=(function(arg){return _nbind.popValue(arg,_this.ptrType)});_this.wireWrite=(function(arg){return pushPointer(arg,_this.ptrType,true)});_this.pendingSuperCount=0;_this.ready=false;_this.methodTbl={};if(spec.paramList){_this.classType=spec.paramList[0].classType;_this.proto=_this.classType.proto}else _this.classType=_this;return _this}BindClass.prototype.makeBound=(function(policyTbl){var Bound=_nbind.makeBound(policyTbl,this);this.proto=Bound;this.ptrType.proto=Bound;return Bound});BindClass.prototype.addMethod=(function(spec){var overloadList=this.methodTbl[spec.name]||[];overloadList.push(spec);this.methodTbl[spec.name]=overloadList});BindClass.prototype.registerMethods=(function(src,staticOnly){var setter;for(var _i=0,_a=Object.keys(src.methodTbl);_i<_a.length;_i++){var name=_a[_i];var overloadList=src.methodTbl[name];for(var _b=0,overloadList_1=overloadList;_b<overloadList_1.length;_b++){var spec=overloadList_1[_b];var target=void 0;var caller=void 0;target=this.proto.prototype;if(staticOnly&&spec.signatureType!=1)continue;switch(spec.signatureType){case 1:target=this.proto;case 5:caller=_nbind.makeCaller(spec);_nbind.addMethod(target,spec.name,caller,spec.typeList.length-1);break;case 4:setter=_nbind.makeMethodCaller(src.ptrType,spec);break;case 3:Object.defineProperty(target,spec.name,{configurable:true,enumerable:false,get:_nbind.makeMethodCaller(src.ptrType,spec),set:setter});break;case 2:caller=_nbind.makeMethodCaller(src.ptrType,spec);_nbind.addMethod(target,spec.name,caller,spec.typeList.length-1);break;default:break}}}});BindClass.prototype.registerSuperMethods=(function(src,firstSuper,visitTbl){if(visitTbl[src.name])return;visitTbl[src.name]=true;var superNum=0;var nextFirst;for(var _i=0,_a=src.superIdList||[];_i<_a.length;_i++){var superId=_a[_i];var superClass=_nbind.getType(superId);if(superNum++<firstSuper||firstSuper<0){nextFirst=-1}else{nextFirst=0}this.registerSuperMethods(superClass,nextFirst,visitTbl)}this.registerMethods(src,firstSuper<0)});BindClass.prototype.finish=(function(){if(this.ready)return this;this.ready=true;this.superList=(this.superIdList||[]).map((function(superId){return _nbind.getType(superId).finish()}));var Bound=this.proto;if(this.superList.length){var Proto=(function(){this.constructor=Bound});Proto.prototype=this.superList[0].proto.prototype;Bound.prototype=new Proto}if(Bound!=Module)Bound.prototype.__nbindType=this;this.registerSuperMethods(this,1,{});return this});BindClass.prototype.upcastStep=(function(dst,ptr){if(dst==this)return ptr;for(var i=0;i<this.superList.length;++i){var superPtr=this.superList[i].upcastStep(dst,_nbind.callUpcast(this.upcastList[i],ptr));if(superPtr)return superPtr}return 0});return BindClass})(_nbind.BindType);BindClass.list=[];_nbind.BindClass=BindClass;function popPointer(ptr,type){return ptr?new type.proto(_nbind.ptrMarker,type.flags,ptr):null}_nbind.popPointer=popPointer;function pushPointer(obj,type,tryValue){if(!(obj instanceof _nbind.Wrapper)){if(tryValue){return _nbind.pushValue(obj)}else throw new Error("Type mismatch")}var ptr=obj.__nbindPtr;var objType=obj.__nbindType.classType;var classType=type.classType;if(obj instanceof type.proto){while(objType!=classType){ptr=_nbind.callUpcast(objType.upcastList[0],ptr);objType=objType.superList[0]}}else{ptr=objType.upcastStep(classType,ptr);if(!ptr)throw new Error("Type mismatch")}return ptr}_nbind.pushPointer=pushPointer;function pushMutablePointer(obj,type){var ptr=pushPointer(obj,type);if(obj.__nbindFlags&1){throw new Error("Passing a const value as a non-const argument")}return ptr}var BindClassPtr=(function(_super){__extends(BindClassPtr,_super);function BindClassPtr(spec){var _this=_super.call(this,spec)||this;_this.classType=spec.paramList[0].classType;_this.proto=_this.classType.proto;var isConst=spec.flags&1;var isValue=(_this.flags&896)==256&&spec.flags&2;var push=isConst?pushPointer:pushMutablePointer;var pop=isValue?_nbind.popValue:popPointer;_this.makeWireWrite=(function(expr,policyTbl){return policyTbl["Nullable"]?(function(arg){return arg?push(arg,_this):0}):(function(arg){return push(arg,_this)})});_this.wireRead=(function(arg){return pop(arg,_this)});_this.wireWrite=(function(arg){return push(arg,_this)});return _this}return BindClassPtr})(_nbind.BindType);_nbind.BindClassPtr=BindClassPtr;function popShared(ptr,type){var shared=HEAPU32[ptr/4];var unsafe=HEAPU32[ptr/4+1];return unsafe?new type.proto(_nbind.ptrMarker,type.flags,unsafe,shared):null}_nbind.popShared=popShared;function pushShared(obj,type){if(!(obj instanceof type.proto))throw new Error("Type mismatch");return obj.__nbindShared}function pushMutableShared(obj,type){if(!(obj instanceof type.proto))throw new Error("Type mismatch");if(obj.__nbindFlags&1){throw new Error("Passing a const value as a non-const argument")}return obj.__nbindShared}var SharedClassPtr=(function(_super){__extends(SharedClassPtr,_super);function SharedClassPtr(spec){var _this=_super.call(this,spec)||this;_this.readResources=[_nbind.resources.pool];_this.classType=spec.paramList[0].classType;_this.proto=_this.classType.proto;var isConst=spec.flags&1;var push=isConst?pushShared:pushMutableShared;_this.wireRead=(function(arg){return popShared(arg,_this)});_this.wireWrite=(function(arg){return push(arg,_this)});return _this}return SharedClassPtr})(_nbind.BindType);_nbind.SharedClassPtr=SharedClassPtr;_nbind.externalList=[0];var firstFreeExternal=0;var External=(function(){function External(data){this.refCount=1;this.data=data}External.prototype.register=(function(){var num=firstFreeExternal;if(num){firstFreeExternal=_nbind.externalList[num]}else num=_nbind.externalList.length;_nbind.externalList[num]=this;return num});External.prototype.reference=(function(){++this.refCount});External.prototype.dereference=(function(num){if(--this.refCount==0){if(this.free)this.free();_nbind.externalList[num]=firstFreeExternal;firstFreeExternal=num}});return External})();_nbind.External=External;function popExternal(num){var obj=_nbind.externalList[num];obj.dereference(num);return obj.data}function pushExternal(obj){var external=new External(obj);external.reference();return external.register()}var ExternalType=(function(_super){__extends(ExternalType,_super);function ExternalType(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.wireRead=popExternal;_this.wireWrite=pushExternal;return _this}return ExternalType})(_nbind.BindType);_nbind.ExternalType=ExternalType;_nbind.callbackSignatureList=[];var CallbackType=(function(_super){__extends(CallbackType,_super);function CallbackType(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.wireWrite=(function(func){if(typeof func!="function")_nbind.throwError("Type mismatch");return(new _nbind.External(func)).register()});return _this}return CallbackType})(_nbind.BindType);_nbind.CallbackType=CallbackType;_nbind.valueList=[0];var firstFreeValue=0;function pushValue(value){var num=firstFreeValue;if(num){firstFreeValue=_nbind.valueList[num]}else num=_nbind.valueList.length;_nbind.valueList[num]=value;return num*2+1}_nbind.pushValue=pushValue;function popValue(num,type){if(!num)_nbind.throwError("Value type JavaScript class is missing or not registered");if(num&1){num>>=1;var obj=_nbind.valueList[num];_nbind.valueList[num]=firstFreeValue;firstFreeValue=num;return obj}else if(type){return _nbind.popShared(num,type)}else throw new Error("Invalid value slot "+num)}_nbind.popValue=popValue;var valueBase=0x10000000000000000;function push64(num){if(typeof num=="number")return num;return pushValue(num)*4096+valueBase}function pop64(num){if(num<valueBase)return num;return popValue((num-valueBase)/4096)}var CreateValueType=(function(_super){__extends(CreateValueType,_super);function CreateValueType(){return _super!==null&&_super.apply(this,arguments)||this}CreateValueType.prototype.makeWireWrite=(function(expr){return"(_nbind.pushValue(new "+expr+"))"});return CreateValueType})(_nbind.BindType);_nbind.CreateValueType=CreateValueType;var Int64Type=(function(_super){__extends(Int64Type,_super);function Int64Type(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.wireWrite=push64;_this.wireRead=pop64;return _this}return Int64Type})(_nbind.BindType);_nbind.Int64Type=Int64Type;function pushArray(arr,type){if(!arr)return 0;var length=arr.length;if((type.size||type.size===0)&&length<type.size){throw new Error("Type mismatch")}var ptrSize=type.memberType.ptrSize;var result=_nbind.Pool.lalloc(4+length*ptrSize);HEAPU32[result/4]=length;var heap=type.memberType.heap;var ptr=(result+4)/ptrSize;var wireWrite=type.memberType.wireWrite;var num=0;if(wireWrite){while(num<length){heap[ptr++]=wireWrite(arr[num++])}}else{while(num<length){heap[ptr++]=arr[num++]}}return result}_nbind.pushArray=pushArray;function popArray(ptr,type){if(ptr===0)return null;var length=HEAPU32[ptr/4];var arr=new Array(length);var heap=type.memberType.heap;ptr=(ptr+4)/type.memberType.ptrSize;var wireRead=type.memberType.wireRead;var num=0;if(wireRead){while(num<length){arr[num++]=wireRead(heap[ptr++])}}else{while(num<length){arr[num++]=heap[ptr++]}}return arr}_nbind.popArray=popArray;var ArrayType=(function(_super){__extends(ArrayType,_super);function ArrayType(spec){var _this=_super.call(this,spec)||this;_this.wireRead=(function(arg){return popArray(arg,_this)});_this.wireWrite=(function(arg){return pushArray(arg,_this)});_this.readResources=[_nbind.resources.pool];_this.writeResources=[_nbind.resources.pool];_this.memberType=spec.paramList[0];if(spec.paramList[1])_this.size=spec.paramList[1];return _this}return ArrayType})(_nbind.BindType);_nbind.ArrayType=ArrayType;function pushString(str,policyTbl){if(str===null||str===undefined){if(policyTbl&&policyTbl["Nullable"]){str=""}else throw new Error("Type mismatch")}if(policyTbl&&policyTbl["Strict"]){if(typeof str!="string")throw new Error("Type mismatch")}else str=str.toString();var length=Module.lengthBytesUTF8(str);var result=_nbind.Pool.lalloc(4+length+1);HEAPU32[result/4]=length;Module.stringToUTF8Array(str,HEAPU8,result+4,length+1);return result}_nbind.pushString=pushString;function popString(ptr){if(ptr===0)return null;var length=HEAPU32[ptr/4];return Module.Pointer_stringify(ptr+4,length)}_nbind.popString=popString;var StringType=(function(_super){__extends(StringType,_super);function StringType(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.wireRead=popString;_this.wireWrite=pushString;_this.readResources=[_nbind.resources.pool];_this.writeResources=[_nbind.resources.pool];return _this}StringType.prototype.makeWireWrite=(function(expr,policyTbl){return(function(arg){return pushString(arg,policyTbl)})});return StringType})(_nbind.BindType);_nbind.StringType=StringType;function makeArgList(argCount){return Array.apply(null,Array(argCount)).map((function(dummy,num){return"a"+(num+1)}))}function anyNeedsWireWrite(typeList,policyTbl){return typeList.reduce((function(result,type){return result||type.needsWireWrite(policyTbl)}),false)}function anyNeedsWireRead(typeList,policyTbl){return typeList.reduce((function(result,type){return result||!!type.needsWireRead(policyTbl)}),false)}function makeWireRead(convertParamList,policyTbl,type,expr){var paramNum=convertParamList.length;if(type.makeWireRead){return type.makeWireRead(expr,convertParamList,paramNum)}else if(type.wireRead){convertParamList[paramNum]=type.wireRead;return"(convertParamList["+paramNum+"]("+expr+"))"}else return expr}function makeWireWrite(convertParamList,policyTbl,type,expr){var wireWrite;var paramNum=convertParamList.length;if(type.makeWireWrite){wireWrite=type.makeWireWrite(expr,policyTbl,convertParamList,paramNum)}else wireWrite=type.wireWrite;if(wireWrite){if(typeof wireWrite=="string"){return wireWrite}else{convertParamList[paramNum]=wireWrite;return"(convertParamList["+paramNum+"]("+expr+"))"}}else return expr}function buildCallerFunction(dynCall,ptrType,ptr,num,policyTbl,needsWireWrite,prefix,returnType,argTypeList,mask,err){var argList=makeArgList(argTypeList.length);var convertParamList=[];var callExpression=makeWireRead(convertParamList,policyTbl,returnType,"dynCall("+[prefix].concat(argList.map((function(name,index){return makeWireWrite(convertParamList,policyTbl,argTypeList[index],name)}))).join(",")+")");var resourceSet=_nbind.listResources([returnType],argTypeList);var sourceCode="function("+argList.join(",")+"){"+(mask?"this.__nbindFlags&mask&&err();":"")+resourceSet.makeOpen()+"var r="+callExpression+";"+resourceSet.makeClose()+"return r;"+"}";return eval("("+sourceCode+")")}function buildJSCallerFunction(returnType,argTypeList){var argList=makeArgList(argTypeList.length);var convertParamList=[];var callExpression=makeWireWrite(convertParamList,null,returnType,"_nbind.externalList[num].data("+argList.map((function(name,index){return makeWireRead(convertParamList,null,argTypeList[index],name)})).join(",")+")");var resourceSet=_nbind.listResources(argTypeList,[returnType]);resourceSet.remove(_nbind.resources.pool);var sourceCode="function("+["dummy","num"].concat(argList).join(",")+"){"+resourceSet.makeOpen()+"var r="+callExpression+";"+resourceSet.makeClose()+"return r;"+"}";return eval("("+sourceCode+")")}_nbind.buildJSCallerFunction=buildJSCallerFunction;function makeJSCaller(idList){var argCount=idList.length-1;var typeList=_nbind.getTypes(idList,"callback");var returnType=typeList[0];var argTypeList=typeList.slice(1);var needsWireRead=anyNeedsWireRead(argTypeList,null);var needsWireWrite=returnType.needsWireWrite(null);if(!needsWireWrite&&!needsWireRead){switch(argCount){case 0:return(function(dummy,num){return _nbind.externalList[num].data()});case 1:return(function(dummy,num,a1){return _nbind.externalList[num].data(a1)});case 2:return(function(dummy,num,a1,a2){return _nbind.externalList[num].data(a1,a2)});case 3:return(function(dummy,num,a1,a2,a3){return _nbind.externalList[num].data(a1,a2,a3)});default:break}}return buildJSCallerFunction(returnType,argTypeList)}_nbind.makeJSCaller=makeJSCaller;function makeMethodCaller(ptrType,spec){var argCount=spec.typeList.length-1;var typeIdList=spec.typeList.slice(0);typeIdList.splice(1,0,"uint32_t",spec.boundID);var typeList=_nbind.getTypes(typeIdList,spec.title);var returnType=typeList[0];var argTypeList=typeList.slice(3);var needsWireRead=returnType.needsWireRead(spec.policyTbl);var needsWireWrite=anyNeedsWireWrite(argTypeList,spec.policyTbl);var ptr=spec.ptr;var num=spec.num;var dynCall=_nbind.getDynCall(typeList,spec.title);var mask=~spec.flags&1;function err(){throw new Error("Calling a non-const method on a const object")}if(!needsWireRead&&!needsWireWrite){switch(argCount){case 0:return(function(){return this.__nbindFlags&mask?err():dynCall(ptr,num,_nbind.pushPointer(this,ptrType))});case 1:return(function(a1){return this.__nbindFlags&mask?err():dynCall(ptr,num,_nbind.pushPointer(this,ptrType),a1)});case 2:return(function(a1,a2){return this.__nbindFlags&mask?err():dynCall(ptr,num,_nbind.pushPointer(this,ptrType),a1,a2)});case 3:return(function(a1,a2,a3){return this.__nbindFlags&mask?err():dynCall(ptr,num,_nbind.pushPointer(this,ptrType),a1,a2,a3)});default:break}}return buildCallerFunction(dynCall,ptrType,ptr,num,spec.policyTbl,needsWireWrite,"ptr,num,pushPointer(this,ptrType)",returnType,argTypeList,mask,err)}_nbind.makeMethodCaller=makeMethodCaller;function makeCaller(spec){var argCount=spec.typeList.length-1;var typeList=_nbind.getTypes(spec.typeList,spec.title);var returnType=typeList[0];var argTypeList=typeList.slice(1);var needsWireRead=returnType.needsWireRead(spec.policyTbl);var needsWireWrite=anyNeedsWireWrite(argTypeList,spec.policyTbl);var direct=spec.direct;var dynCall;var ptr=spec.ptr;if(spec.direct&&!needsWireRead&&!needsWireWrite){dynCall=_nbind.getDynCall(typeList,spec.title);switch(argCount){case 0:return(function(){return dynCall(direct)});case 1:return(function(a1){return dynCall(direct,a1)});case 2:return(function(a1,a2){return dynCall(direct,a1,a2)});case 3:return(function(a1,a2,a3){return dynCall(direct,a1,a2,a3)});default:break}ptr=0}var prefix;if(ptr){var typeIdList=spec.typeList.slice(0);typeIdList.splice(1,0,"uint32_t");typeList=_nbind.getTypes(typeIdList,spec.title);prefix="ptr,num"}else{ptr=direct;prefix="ptr"}dynCall=_nbind.getDynCall(typeList,spec.title);return buildCallerFunction(dynCall,null,ptr,spec.num,spec.policyTbl,needsWireWrite,prefix,returnType,argTypeList)}_nbind.makeCaller=makeCaller;function makeOverloader(func,arity){var callerList=[];function call(){return callerList[arguments.length].apply(this,arguments)}call.addMethod=(function(_func,_arity){callerList[_arity]=_func});call.addMethod(func,arity);return call}_nbind.makeOverloader=makeOverloader;var Resource=(function(){function Resource(open,close){var _this=this;this.makeOpen=(function(){return Object.keys(_this.openTbl).join("")});this.makeClose=(function(){return Object.keys(_this.closeTbl).join("")});this.openTbl={};this.closeTbl={};if(open)this.openTbl[open]=true;if(close)this.closeTbl[close]=true}Resource.prototype.add=(function(other){for(var _i=0,_a=Object.keys(other.openTbl);_i<_a.length;_i++){var key=_a[_i];this.openTbl[key]=true}for(var _b=0,_c=Object.keys(other.closeTbl);_b<_c.length;_b++){var key=_c[_b];this.closeTbl[key]=true}});Resource.prototype.remove=(function(other){for(var _i=0,_a=Object.keys(other.openTbl);_i<_a.length;_i++){var key=_a[_i];delete this.openTbl[key]}for(var _b=0,_c=Object.keys(other.closeTbl);_b<_c.length;_b++){var key=_c[_b];delete this.closeTbl[key]}});return Resource})();_nbind.Resource=Resource;function listResources(readList,writeList){var result=new Resource;for(var _i=0,readList_1=readList;_i<readList_1.length;_i++){var bindType=readList_1[_i];for(var _a=0,_b=bindType.readResources||[];_a<_b.length;_a++){var resource=_b[_a];result.add(resource)}}for(var _c=0,writeList_1=writeList;_c<writeList_1.length;_c++){var bindType=writeList_1[_c];for(var _d=0,_e=bindType.writeResources||[];_d<_e.length;_d++){var resource=_e[_d];result.add(resource)}}return result}_nbind.listResources=listResources;_nbind.resources={pool:new Resource("var used=HEAPU32[_nbind.Pool.usedPtr],page=HEAPU32[_nbind.Pool.pagePtr];","_nbind.Pool.lreset(used,page);")};var ExternalBuffer=(function(_super){__extends(ExternalBuffer,_super);function ExternalBuffer(buf,ptr){var _this=_super.call(this,buf)||this;_this.ptr=ptr;return _this}ExternalBuffer.prototype.free=(function(){_free(this.ptr)});return ExternalBuffer})(_nbind.External);function getBuffer(buf){if(buf instanceof ArrayBuffer){return new Uint8Array(buf)}else if(buf instanceof DataView){return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)}else return buf}function pushBuffer(buf,policyTbl){if(buf===null||buf===undefined){if(policyTbl&&policyTbl["Nullable"])buf=[]}if(typeof buf!="object")throw new Error("Type mismatch");var b=buf;var length=b.byteLength||b.length;if(!length&&length!==0&&b.byteLength!==0)throw new Error("Type mismatch");var result=_nbind.Pool.lalloc(8);var data=_malloc(length);var ptr=result/4;HEAPU32[ptr++]=length;HEAPU32[ptr++]=data;HEAPU32[ptr++]=(new ExternalBuffer(buf,data)).register();HEAPU8.set(getBuffer(buf),data);return result}var BufferType=(function(_super){__extends(BufferType,_super);function BufferType(){var _this=_super!==null&&_super.apply(this,arguments)||this;_this.wireWrite=pushBuffer;_this.readResources=[_nbind.resources.pool];_this.writeResources=[_nbind.resources.pool];return _this}BufferType.prototype.makeWireWrite=(function(expr,policyTbl){return(function(arg){return pushBuffer(arg,policyTbl)})});return BufferType})(_nbind.BindType);_nbind.BufferType=BufferType;function commitBuffer(num,data,length){var buf=_nbind.externalList[num].data;var NodeBuffer=Buffer;if(typeof Buffer!="function")NodeBuffer=(function(){});if(buf instanceof Array){}else{var src=HEAPU8.subarray(data,data+length);if(buf instanceof NodeBuffer){var srcBuf=void 0;if(typeof Buffer.from=="function"&&Buffer.from.length>=3){srcBuf=Buffer.from(src)}else srcBuf=new Buffer(src);srcBuf.copy(buf)}else getBuffer(buf).set(src)}}_nbind.commitBuffer=commitBuffer;var dirtyList=[];var gcTimer=0;function sweep(){for(var _i=0,dirtyList_1=dirtyList;_i<dirtyList_1.length;_i++){var obj=dirtyList_1[_i];if(!(obj.__nbindState&(1|2))){obj.free()}}dirtyList=[];gcTimer=0}_nbind.mark=(function(obj){});function toggleLightGC(enable){if(enable){_nbind.mark=(function(obj){dirtyList.push(obj);if(!gcTimer)gcTimer=setTimeout(sweep,0)})}else{_nbind.mark=(function(obj){})}}_nbind.toggleLightGC=toggleLightGC}))(_nbind);DYNAMICTOP_PTR=Runtime.staticAlloc(4);STACK_BASE=STACKTOP=Runtime.alignMemory(STATICTOP);STACK_MAX=STACK_BASE+TOTAL_STACK;DYNAMIC_BASE=Runtime.alignMemory(STACK_MAX);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;staticSealed=true;var ASSERTIONS=false;function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}Module["intArrayFromString"]=intArrayFromString;Module["intArrayToString"]=intArrayToString;var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var decodeBase64=typeof atob==="function"?atob:(function(input){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{enc1=keyStr.indexOf(input.charAt(i++));enc2=keyStr.indexOf(input.charAt(i++));enc3=keyStr.indexOf(input.charAt(i++));enc4=keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!==64){output=output+String.fromCharCode(chr2)}if(enc4!==64){output=output+String.fromCharCode(chr3)}}while(i<input.length);return output});function intArrayFromBase64(s){if(typeof ENVIRONMENT_IS_NODE==="boolean"&&ENVIRONMENT_IS_NODE){var buf;try{buf=Buffer.from(s,"base64")}catch(_){buf=new Buffer(s,"base64")}return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)}try{var decoded=decodeBase64(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i)}return bytes}catch(_){throw new Error("Converting base64 string to bytes failed.")}}function tryParseAsDataURI(filename){var dataURIPrefix="data:application/octet-stream;base64,";if(!(String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0)){return}return intArrayFromBase64(filename.slice(dataURIPrefix.length))}function invoke_dii(index,a1,a2){try{return Module["dynCall_dii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_fi(index,a1){try{return Module["dynCall_fi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_fii(index,a1,a2){try{return Module["dynCall_fii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_i(index){try{return Module["dynCall_i"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_id(index,a1){try{return Module["dynCall_id"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_idd(index,a1,a2){try{return Module["dynCall_idd"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_idi(index,a1,a2){try{return Module["dynCall_idi"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_ii(index,a1){try{return Module["dynCall_ii"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_iii(index,a1,a2){try{return Module["dynCall_iii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_iiii(index,a1,a2,a3){try{return Module["dynCall_iiii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_v(index){try{Module["dynCall_v"](index)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vi(index,a1){try{Module["dynCall_vi"](index,a1)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vid(index,a1,a2){try{Module["dynCall_vid"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vidd(index,a1,a2,a3){try{Module["dynCall_vidd"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vidi(index,a1,a2,a3){try{Module["dynCall_vidi"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vif(index,a1,a2){try{Module["dynCall_vif"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viff(index,a1,a2,a3){try{Module["dynCall_viff"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vifff(index,a1,a2,a3,a4){try{Module["dynCall_vifff"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_vii(index,a1,a2){try{Module["dynCall_vii"](index,a1,a2)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viid(index,a1,a2,a3){try{Module["dynCall_viid"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viidd(index,a1,a2,a3,a4){try{Module["dynCall_viidd"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viiddd(index,a1,a2,a3,a4,a5){try{Module["dynCall_viiddd"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viii(index,a1,a2,a3){try{Module["dynCall_viii"](index,a1,a2,a3)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viiii(index,a1,a2,a3,a4){try{Module["dynCall_viiii"](index,a1,a2,a3,a4)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viiiii(index,a1,a2,a3,a4,a5){try{Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6){try{Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6)}catch(e){if(typeof e!=="number"&&e!=="longjmp")throw e;Module["setThrew"](1,0)}}Module.asmGlobalArg={"Math":Math,"Int8Array":Int8Array,"Int16Array":Int16Array,"Int32Array":Int32Array,"Uint8Array":Uint8Array,"Uint16Array":Uint16Array,"Uint32Array":Uint32Array,"Float32Array":Float32Array,"Float64Array":Float64Array,"NaN":NaN,"Infinity":Infinity};Module.asmLibraryArg={"abort":abort,"assert":assert,"enlargeMemory":enlargeMemory,"getTotalMemory":getTotalMemory,"abortOnCannotGrowMemory":abortOnCannotGrowMemory,"invoke_dii":invoke_dii,"invoke_fi":invoke_fi,"invoke_fii":invoke_fii,"invoke_i":invoke_i,"invoke_id":invoke_id,"invoke_idd":invoke_idd,"invoke_idi":invoke_idi,"invoke_ii":invoke_ii,"invoke_iii":invoke_iii,"invoke_iiii":invoke_iiii,"invoke_v":invoke_v,"invoke_vi":invoke_vi,"invoke_vid":invoke_vid,"invoke_vidd":invoke_vidd,"invoke_vidi":invoke_vidi,"invoke_vif":invoke_vif,"invoke_viff":invoke_viff,"invoke_vifff":invoke_vifff,"invoke_vii":invoke_vii,"invoke_viid":invoke_viid,"invoke_viidd":invoke_viidd,"invoke_viiddd":invoke_viiddd,"invoke_viii":invoke_viii,"invoke_viiii":invoke_viiii,"invoke_viiiii":invoke_viiiii,"invoke_viiiiii":invoke_viiiiii,"___cxa_atexit":___cxa_atexit,"___setErrNo":___setErrNo,"___syscall140":___syscall140,"___syscall146":___syscall146,"___syscall54":___syscall54,"___syscall6":___syscall6,"__decorate":__decorate,"__extends":__extends,"__nbind_finish":__nbind_finish,"__nbind_free_external":__nbind_free_external,"__nbind_get_value_object":__nbind_get_value_object,"__nbind_reference_external":__nbind_reference_external,"__nbind_register_callback_signature":__nbind_register_callback_signature,"__nbind_register_class":__nbind_register_class,"__nbind_register_function":__nbind_register_function,"__nbind_register_pool":__nbind_register_pool,"__nbind_register_primitive":__nbind_register_primitive,"__nbind_register_type":__nbind_register_type,"_abort":_abort,"_atexit":_atexit,"_defineHidden":_defineHidden,"_emscripten_asm_const_diii":_emscripten_asm_const_diii,"_emscripten_asm_const_iiii":_emscripten_asm_const_iiii,"_emscripten_asm_const_iiiii":_emscripten_asm_const_iiiii,"_emscripten_asm_const_iiiiii":_emscripten_asm_const_iiiiii,"_emscripten_asm_const_iiiiiiii":_emscripten_asm_const_iiiiiiii,"_emscripten_get_now":_emscripten_get_now,"_emscripten_memcpy_big":_emscripten_memcpy_big,"_emscripten_set_main_loop":_emscripten_set_main_loop,"_emscripten_set_main_loop_timing":_emscripten_set_main_loop_timing,"_llvm_stackrestore":_llvm_stackrestore,"_llvm_stacksave":_llvm_stacksave,"_nbind_value":_nbind_value,"_removeAccessorPrefix":_removeAccessorPrefix,"_typeModule":_typeModule,"DYNAMICTOP_PTR":DYNAMICTOP_PTR,"tempDoublePtr":tempDoublePtr,"ABORT":ABORT,"STACKTOP":STACKTOP,"STACK_MAX":STACK_MAX,"cttz_i8":cttz_i8,"___dso_handle":___dso_handle};// EMSCRIPTEN_START_ASM
var asm=(/** @suppress {uselessCode} */ function(global,env,buffer) {
"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.DYNAMICTOP_PTR|0;var j=env.tempDoublePtr|0;var k=env.ABORT|0;var l=env.STACKTOP|0;var m=env.STACK_MAX|0;var n=env.cttz_i8|0;var o=env.___dso_handle|0;var p=0;var q=0;var r=0;var s=0;var t=global.NaN,u=global.Infinity;var v=0,w=0,x=0,y=0,z=0.0;var A=0;var B=global.Math.floor;var C=global.Math.abs;var D=global.Math.sqrt;var E=global.Math.pow;var F=global.Math.cos;var G=global.Math.sin;var H=global.Math.tan;var I=global.Math.acos;var J=global.Math.asin;var K=global.Math.atan;var L=global.Math.atan2;var M=global.Math.exp;var N=global.Math.log;var O=global.Math.ceil;var P=global.Math.imul;var Q=global.Math.min;var R=global.Math.max;var S=global.Math.clz32;var T=global.Math.fround;var U=env.abort;var V=env.assert;var W=env.enlargeMemory;var X=env.getTotalMemory;var Y=env.abortOnCannotGrowMemory;var Z=env.invoke_dii;var _=env.invoke_fi;var $=env.invoke_fii;var aa=env.invoke_i;var ba=env.invoke_id;var ca=env.invoke_idd;var da=env.invoke_idi;var ea=env.invoke_ii;var fa=env.invoke_iii;var ga=env.invoke_iiii;var ha=env.invoke_v;var ia=env.invoke_vi;var ja=env.invoke_vid;var ka=env.invoke_vidd;var la=env.invoke_vidi;var ma=env.invoke_vif;var na=env.invoke_viff;var oa=env.invoke_vifff;var pa=env.invoke_vii;var qa=env.invoke_viid;var ra=env.invoke_viidd;var sa=env.invoke_viiddd;var ta=env.invoke_viii;var ua=env.invoke_viiii;var va=env.invoke_viiiii;var wa=env.invoke_viiiiii;var xa=env.___cxa_atexit;var ya=env.___setErrNo;var za=env.___syscall140;var Aa=env.___syscall146;var Ba=env.___syscall54;var Ca=env.___syscall6;var Da=env.__decorate;var Ea=env.__extends;var Fa=env.__nbind_finish;var Ga=env.__nbind_free_external;var Ha=env.__nbind_get_value_object;var Ia=env.__nbind_reference_external;var Ja=env.__nbind_register_callback_signature;var Ka=env.__nbind_register_class;var La=env.__nbind_register_function;var Ma=env.__nbind_register_pool;var Na=env.__nbind_register_primitive;var Oa=env.__nbind_register_type;var Pa=env._abort;var Qa=env._atexit;var Ra=env._defineHidden;var Sa=env._emscripten_asm_const_diii;var Ta=env._emscripten_asm_const_iiii;var Ua=env._emscripten_asm_const_iiiii;var Va=env._emscripten_asm_const_iiiiii;var Wa=env._emscripten_asm_const_iiiiiiii;var Xa=env._emscripten_get_now;var Ya=env._emscripten_memcpy_big;var Za=env._emscripten_set_main_loop;var _a=env._emscripten_set_main_loop_timing;var $a=env._llvm_stackrestore;var ab=env._llvm_stacksave;var bb=env._nbind_value;var cb=env._removeAccessorPrefix;var db=env._typeModule;var eb=T(0);const fb=T(0);
// EMSCRIPTEN_START_FUNCS
function Gb(a){a=a|0;var b=0;b=l;l=l+a|0;l=l+15&-16;return b|0}function Hb(){return l|0}function Ib(a){a=a|0;l=a}function Jb(a,b){a=a|0;b=b|0;l=a;m=b}function Kb(a,b){a=a|0;b=b|0;if(!p){p=a;q=b}}function Lb(a){a=a|0;A=a}function Mb(){return A|0}function Nb(a){a=a|0;var b=0;b=Nz(12)|0;c[b>>2]=0;c[b+4>>2]=a;c[b+8>>2]=Nz(a<<2)|0;return b|0}function Ob(a){a=a|0;Oz(c[a+8>>2]|0);Oz(a);return}function Pb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=c[a>>2]|0;f=a+4|0;h=a+8|0;if((e|0)==(c[f>>2]|0)){c[f>>2]=e<<1;e=Pz(c[h>>2]|0,e<<3)|0;c[h>>2]=e;g=c[a>>2]|0}else{g=e;e=c[h>>2]|0}if(g>>>0>d>>>0){f=d;do{i=f;f=f+1|0;c[e+(f<<2)>>2]=c[e+(i<<2)>>2];e=c[h>>2]|0}while(f>>>0<g>>>0)}c[e+(d<<2)>>2]=b;c[a>>2]=g+1;return}function Qb(a,b){a=a|0;b=b|0;Pb(a,b,c[a>>2]|0);return}function Rb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=b+1|0;e=c[a>>2]|0;if(d>>>0<e>>>0){f=a+8|0;while(1){g=c[f>>2]|0;c[g+(b<<2)>>2]=c[g+(d<<2)>>2];b=d+1|0;if(b>>>0<e>>>0){g=d;d=b;b=g}else break}}c[a>>2]=e+-1;return}function Sb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;e=c[a>>2]|0;a:do if(e|0){f=c[a+8>>2]|0;d=0;while(1){if((c[f+(d<<2)>>2]|0)==(b|0))break;d=d+1|0;if(d>>>0>=e>>>0)break a}Rb(a,d)}while(0);return}function Tb(a){a=a|0;if(!a)a=0;else a=c[a>>2]|0;return a|0}function Ub(a){a=a|0;var b=0;b=Nz(12)|0;c[b>>2]=0;c[b+4>>2]=a;c[b+8>>2]=Nz(a<<4)|0;return b|0}function Vb(a){a=a|0;Oz(c[a+8>>2]|0);Oz(a);return}function Wb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;f=c[a>>2]|0;e=a+4|0;g=a+8|0;if((f|0)==(c[e>>2]|0)){c[e>>2]=f<<1;e=Pz(c[g>>2]|0,f<<5)|0;c[g>>2]=e;f=c[a>>2]|0}else e=c[g>>2]|0;if(f>>>0>d>>>0){f=d;do{h=e+(f<<4)|0;f=f+1|0;e=e+(f<<4)|0;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];c[e+8>>2]=c[h+8>>2];c[e+12>>2]=c[h+12>>2];e=c[g>>2]|0}while(f>>>0<(c[a>>2]|0)>>>0)}h=e+(d<<4)|0;c[h>>2]=c[b>>2];c[h+4>>2]=c[b+4>>2];c[h+8>>2]=c[b+8>>2];c[h+12>>2]=c[b+12>>2];c[a>>2]=(c[a>>2]|0)+1;return}function Xb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;e=c[a>>2]|0;c[f>>2]=c[b>>2];c[f+4>>2]=c[b+4>>2];c[f+8>>2]=c[b+8>>2];c[f+12>>2]=c[b+12>>2];Wb(a,f,e);l=d;return}function Yb(a){a=a|0;if(!a)a=0;else a=c[a>>2]|0;return a|0}function Zb(a){a=a|0;do{g[a+344>>2]=T(-1.0e3);g[a+348>>2]=T(-1.0e3);a=c[a+300>>2]|0}while((a|0)!=0);return}function _b(a){a=a|0;return c[a>>2]|0}function $b(a,b){a=a|0;b=b|0;if((c[a>>2]|0)!=(b|0)){c[a>>2]=b;Zb(a)}return}function ac(a){a=a|0;return c[a+4>>2]|0}function bc(a,b){a=a|0;b=b|0;var d=0;d=a+4|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function cc(a){a=a|0;return c[a+8>>2]|0}function dc(a,b){a=a|0;b=b|0;var d=0;d=a+8|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function ec(a){a=a|0;return c[a+12>>2]|0}function fc(a,b){a=a|0;b=b|0;var d=0;d=a+12|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function gc(a){a=a|0;return c[a+16>>2]|0}function hc(a,b){a=a|0;b=b|0;var d=0;d=a+16|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function ic(a){a=a|0;return c[a+20>>2]|0}function jc(a,b){a=a|0;b=b|0;var d=0;d=a+20|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function kc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+24|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function lc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+24|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+28>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function mc(a){a=a|0;return T(g[a+32>>2])}function nc(a,b){a=a|0;b=T(b);var c=0;c=a+32|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function oc(a){a=a|0;return T(g[a+36>>2])}function pc(a,b){a=a|0;b=T(b);var c=0;c=a+36|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function qc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+40|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function rc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+40|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+44>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function sc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+48|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function tc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+48|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+52>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function uc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+56|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function vc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+56|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+60>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function wc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+64|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function xc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+64|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+68>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function yc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+72|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function zc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+72|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+76>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Ac(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+80|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Bc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+80|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+84>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Cc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+88|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Dc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+88|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+92>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Ec(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+96|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Fc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+96|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+100>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Gc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+112|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Hc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+112|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+116>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Ic(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+104|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Jc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+104|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+108>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Kc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+120|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Lc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+120|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+124>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Mc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+128|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Nc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+128|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+132>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Oc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+136|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Pc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+136|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+140>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Qc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+144|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Rc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+144|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+148>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Sc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+160|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Tc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+160|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+164>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Uc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+152|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Vc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+152|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+156>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Wc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+168|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Xc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+168|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+172>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function Yc(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+176|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function Zc(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+176|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+180>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function _c(a){a=a|0;return T(g[a+184>>2])}function $c(a,b){a=a|0;b=T(b);var c=0;c=a+184|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function ad(a){a=a|0;return T(g[a+188>>2])}function bd(a,b){a=a|0;b=T(b);var c=0;c=a+188|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function cd(a){a=a|0;return T(g[a+196>>2])}function dd(a,b){a=a|0;b=T(b);var c=0;c=a+196|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function ed(a){a=a|0;return T(g[a+192>>2])}function fd(a,b){a=a|0;b=T(b);var c=0;c=a+192|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function gd(a){a=a|0;return T(g[a+200>>2])}function hd(a,b){a=a|0;b=T(b);var c=0;c=a+200|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function id(a){a=a|0;return T(g[a+204>>2])}function jd(a,b){a=a|0;b=T(b);var c=0;c=a+204|0;if(T(g[c>>2])!=b){g[c>>2]=b;Zb(a)}return}function kd(a){a=a|0;return c[a+284>>2]|0}function ld(a,b){a=a|0;b=b|0;var d=0;d=a+284|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function md(a,b){a=a|0;b=b|0;var d=0;d=a+288|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function nd(a,b){a=a|0;b=b|0;var d=0;d=a+292|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function od(b){b=b|0;return (a[b+208>>0]|0)!=0|0}function pd(b,c){b=b|0;c=c|0;var e=0;e=b+208|0;if((d[e>>0]|0|0)!=(c&1|0)){a[e>>0]=c&1;Zb(b)}return}function qd(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+212|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function rd(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+212|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+216>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function sd(a,b){a=a|0;b=b|0;var d=0,e=0;e=b+220|0;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function td(a,b){a=a|0;b=b|0;var d=0,e=fb,f=fb,h=0;h=a+220|0;e=T(g[h>>2]);d=((ue(e)|0)&2147483647)>>>0>2139095040;f=T(g[b>>2]);if(d)if(((ue(f)|0)&2147483647)>>>0>2139095040|e==f)d=4;else d=5;else if(e==f)d=4;else d=5;if((d|0)==4?(c[a+224>>2]|0)!=(c[b+4>>2]|0):0)d=5;if((d|0)==5){d=b;b=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=b;Zb(a)}return}function ud(a){a=a|0;return c[a+228>>2]|0}function vd(a,b){a=a|0;b=b|0;var d=0;d=a+228|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function wd(a){a=a|0;return c[a+232>>2]|0}function xd(a,b){a=a|0;b=b|0;var d=0;d=a+232|0;if((c[d>>2]|0)!=(b|0)){c[d>>2]=b;Zb(a)}return}function yd(a){a=a|0;return T(g[a+244>>2])}function zd(a){a=a|0;return T(g[a+248>>2])}function Ad(a){a=a|0;return T(g[a+236>>2])}function Bd(a){a=a|0;return T(g[a+240>>2])}function Cd(a){a=a|0;return T(g[a+252>>2])}function Dd(a){a=a|0;return T(g[a+260>>2])}function Ed(a){a=a|0;return T(g[a+256>>2])}function Fd(a){a=a|0;return T(g[a+264>>2])}function Gd(a){a=a|0;return T(g[a+268>>2])}function Hd(a){a=a|0;return T(g[a+276>>2])}function Id(a){a=a|0;return T(g[a+272>>2])}function Jd(a){a=a|0;return T(g[a+280>>2])}function Kd(b,d,e,f){b=b|0;d=d|0;e=T(e);f=f|0;var h=fb,i=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=fb;C=l;l=l+96|0;B=C+80|0;i=C+56|0;m=C+48|0;o=C+40|0;q=C+32|0;z=C+64|0;t=C+24|0;u=C+16|0;x=C+8|0;A=C;y=(f|2|0)==2;p=y&1;n=b+208|0;k=y^1;if(!((a[n>>0]|0)!=0|k)?(c[b+124>>2]|0)!=0:0){d=4;s=c[8+(f<<2)>>2]|0}else{s=c[8+(f<<2)>>2]|0;d=s}d=b+88+(d<<3)|0;r=c[d+4>>2]|0;v=i;c[v>>2]=c[d>>2];c[v+4>>2]=r;c[B>>2]=c[i>>2];c[B+4>>2]=c[i+4>>2];v=b+308|0;g[b+308+(s<<2)>>2]=T(Ld(B,e));if(!((a[n>>0]|0)!=0|k)?(c[b+132>>2]|0)!=0:0){d=5;r=c[24+(f<<2)>>2]|0}else{r=c[24+(f<<2)>>2]|0;d=r}i=b+88+(d<<3)|0;k=c[i+4>>2]|0;f=m;c[f>>2]=c[i>>2];c[f+4>>2]=k;c[B>>2]=c[m>>2];c[B+4>>2]=c[m+4>>2];g[b+308+(r<<2)>>2]=T(Ld(B,e));if(!(y|(a[n>>0]|0)!=0)?(c[b+124>>2]|0)!=0:0){d=4;f=c[8+(p<<2)>>2]|0}else{f=c[8+(p<<2)>>2]|0;d=f}i=b+88+(d<<3)|0;k=c[i+4>>2]|0;m=o;c[m>>2]=c[i>>2];c[m+4>>2]=k;c[B>>2]=c[o>>2];c[B+4>>2]=c[o+4>>2];g[b+308+(f<<2)>>2]=T(Ld(B,e));if(!(y|(a[n>>0]|0)!=0)?(c[b+132>>2]|0)!=0:0){d=5;k=c[24+(p<<2)>>2]|0}else{k=c[24+(p<<2)>>2]|0;d=k}n=b+88+(d<<3)|0;o=c[n+4>>2]|0;p=q;c[p>>2]=c[n>>2];c[p+4>>2]=o;c[B>>2]=c[q>>2];c[B+4>>2]=c[q+4>>2];g[b+308+(k<<2)>>2]=T(Ld(B,e));if(y){q=b+200|0;p=((ue(T(g[q>>2]))|0)&2147483647)>>>0>2139095040;d=z+(s<<2)|0;c[d>>2]=c[(p?b+184+(s<<2)|0:q)>>2];q=b+204|0;p=((ue(T(g[q>>2]))|0)&2147483647)>>>0>2139095040;c[z+(r<<2)>>2]=c[(p?b+184+(r<<2)|0:q)>>2];c[z+(f<<2)>>2]=c[b+184+(f<<2)>>2];q=c[b+184+(k<<2)>>2]|0;c[z+(k<<2)>>2]=q;h=(c[j>>2]=q,T(g[j>>2]));if(!(c[b+172>>2]|0))w=20;else i=4}else{d=z+(s<<2)|0;c[d>>2]=c[b+184+(s<<2)>>2];c[z+(r<<2)>>2]=c[b+184+(r<<2)>>2];w=b+200|0;q=((ue(T(g[w>>2]))|0)&2147483647)>>>0>2139095040;c[z+(f<<2)>>2]=c[(q?b+184+(f<<2)|0:w)>>2];w=b+204|0;q=((ue(T(g[w>>2]))|0)&2147483647)>>>0>2139095040;w=c[(q?b+184+(k<<2)|0:w)>>2]|0;c[z+(k<<2)>>2]=w;h=(c[j>>2]=w,T(g[j>>2]));w=20}if((w|0)==20)i=s;p=b+136+(i<<3)|0;q=c[p+4>>2]|0;w=t;c[w>>2]=c[p>>2];c[w+4>>2]=q;c[B>>2]=c[t>>2];c[B+4>>2]=c[t+4>>2];D=T(Ld(B,e));g[b+268+(s<<2)>>2]=T(Md(T(D+T(g[d>>2]))));if(y?(c[b+180>>2]|0)!=0:0)d=5;else d=r;s=b+136+(d<<3)|0;t=c[s+4>>2]|0;w=u;c[w>>2]=c[s>>2];c[w+4>>2]=t;c[B>>2]=c[u>>2];c[B+4>>2]=c[u+4>>2];D=T(Ld(B,e));g[b+268+(r<<2)>>2]=T(Md(T(D+T(g[z+(r<<2)>>2]))));if(!y?(c[b+172>>2]|0)!=0:0)d=4;else d=f;t=b+136+(d<<3)|0;u=c[t+4>>2]|0;w=x;c[w>>2]=c[t>>2];c[w+4>>2]=u;c[B>>2]=c[x>>2];c[B+4>>2]=c[x+4>>2];D=T(Ld(B,e));g[b+268+(f<<2)>>2]=T(Md(T(D+T(g[z+(f<<2)>>2]))));if(!y?(c[b+180>>2]|0)!=0:0)d=5;else d=k;x=b+136+(d<<3)|0;y=c[x+4>>2]|0;z=A;c[z>>2]=c[x>>2];c[z+4>>2]=y;c[B>>2]=c[A>>2];c[B+4>>2]=c[A+4>>2];g[b+268+(k<<2)>>2]=T(Md(T(T(Ld(B,e))+h)));c[b+252>>2]=c[v>>2];c[b+256>>2]=c[b+312>>2];c[b+260>>2]=c[b+316>>2];c[b+264>>2]=c[b+320>>2];l=C;return}function Ld(a,b){a=a|0;b=T(b);var d=fb,e=0,f=0,h=0,i=0,k=0,m=0,n=0;k=l;l=l+32|0;i=k+16|0;m=k+8|0;e=k;h=a;f=c[h>>2]|0;h=c[h+4>>2]|0;n=m;c[n>>2]=f;c[n+4>>2]=h;c[i>>2]=c[m>>2];c[i+4>>2]=c[m+4>>2];m=se(i)|0;d=(c[j>>2]=f,T(g[j>>2]));if(!m)if((c[a+4>>2]|0)==2?((ue(b)|0)&2147483647)>>>0<=2139095040:0)b=T(T(d/T(100.0))*b);else b=T(t);else{n=e;c[n>>2]=f;c[n+4>>2]=h;c[i>>2]=c[e>>2];c[i+4>>2]=c[e+4>>2];b=T(te(i))}l=k;return T(b)}function Md(a){a=T(a);var b=0;b=((ue(a)|0)&2147483647)>>>0>2139095040;return T(b?T(0.0):a)}function Nd(b,d,e){b=b|0;d=d|0;e=e|0;var f=fb,h=0,i=fb,j=fb,k=0,m=0,n=0,o=0,p=0,q=0,r=fb;o=l;l=l+16|0;k=o+8|0;m=o;n=b+324|0;j=T(g[n>>2]);do if(((ue(j)|0)&2147483647)>>>0>2139095040){h=c[b+292>>2]|0;if(h|0){f=T(g[b+244>>2]);q=b+268|0;f=T(f-T(Od(q,0)));p=b+248|0;j=T(g[p>>2]);j=T(j-T(Od(q,1)));q=c[b+284>>2]|0;g[m>>2]=f;g[m+4>>2]=j;c[k>>2]=c[m>>2];c[k+4>>2]=c[m+4>>2];j=T(ib[h&3](q,k));j=T(j+T(g[b+280>>2]));f=j;j=T(T(g[p>>2])-j);break}m=b+248|0;f=T(g[m>>2]);a:do if(!(Pd(b)|0))j=f;else{h=0;while(1){k=Qd(b,h)|0;h=h+1|0;if(!(a[k+208>>0]|0))break;if(h>>>0>=(Pd(b)|0)>>>0){j=f;break a}}Nd(k,0,0);f=T(g[k+324>>2]);j=T(g[k+240>>2]);q=((ue(j)|0)&2147483647)>>>0>2139095040;j=T(f+(q?T(0.0):j));f=T(g[m>>2])}while(0);f=T(f-j)}else f=T(T(g[b+248>>2])-j);while(0);g[n>>2]=j;i=T(g[b+312>>2]);r=T(g[b+320>>2]);q=((ue(r)|0)&2147483647)>>>0>2139095040;f=T(f+(q?T(0.0):r));if(d|0){q=((ue(i)|0)&2147483647)>>>0>2139095040;g[d>>2]=T(j+(q?T(0.0):i))}if(e|0)g[e>>2]=f;l=o;return}function Od(a,b){a=a|0;b=b|0;var d=fb,e=fb;e=T(g[a+(c[8+(b<<2)>>2]<<2)>>2]);d=T(g[a+(c[24+(b<<2)>>2]<<2)>>2]);b=((ue(e)|0)&2147483647)>>>0>2139095040;e=b?T(0.0):e;b=((ue(d)|0)&2147483647)>>>0>2139095040;return T(e+(b?T(0.0):d))}function Pd(a){a=a|0;return Tb(c[a+296>>2]|0)|0}function Qd(a,b){a=a|0;b=b|0;return c[(c[(c[a+296>>2]|0)+8>>2]|0)+(b<<2)>>2]|0}function Rd(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=fb,k=fb,m=0,n=fb,o=fb,p=fb,q=0,r=fb,s=0,t=0,v=fb,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;D=l;l=l+48|0;A=D+32|0;B=D+16|0;x=D+24|0;C=D;y=c[b+288>>2]|0;a:do if(!y){g[a>>2]=T(0.0);g[a+4>>2]=T(0.0)}else{z=b+340|0;e=c[z>>2]|0;f=Yb(e)|0;do if((f|0)>0){q=c[e+8>>2]|0;r=T(g[d>>2]);s=((ue(r)|0)&2147483647)>>>0>2139095040;t=d+4|0;v=s?T(u):r;b:while(1){e=f;f=f+-1|0;i=T(g[q+(f<<4)>>2]);k=T(g[q+(f<<4)+4>>2]);m=q+(f<<4)+8|0;h=c[m>>2]|0;m=c[m+4>>2]|0;n=(c[j>>2]=h,T(g[j>>2]));o=(c[j>>2]=m,T(g[j>>2]));if(s){if(r==i|((ue(i)|0)&2147483647)>>>0>2139095040)w=7}else if(r==i)w=7;do if((w|0)==7){w=0;p=T(g[t>>2]);if(((ue(p)|0)&2147483647)>>>0>2139095040)if(p==k|((ue(k)|0)&2147483647)>>>0>2139095040){w=18;break b}else break;else if(p==k){w=18;break b}else break}while(0);E=((ue(i)|0)&2147483647)>>>0>2139095040;if(v<=(E?T(u):i)?(p=T(g[t>>2]),E=((ue(p)|0)&2147483647)>>>0>2139095040,i=E?T(u):p,F=((ue(k)|0)&2147483647)>>>0>2139095040,F=v>=n?!(i<=(F?T(u):k)):1,!(F|!((E?T(u):p)>=o))):0){w=18;break}if((e|0)<=1){w=13;break}}if((w|0)==13){F=a;c[F>>2]=h;c[F+4>>2]=m;break}else if((w|0)==18){F=a;c[F>>2]=h;c[F+4>>2]=m;break a}}while(0);e=c[b+284>>2]|0;h=d;f=c[h>>2]|0;h=c[h+4>>2]|0;F=x;c[F>>2]=f;c[F+4>>2]=h;c[A>>2]=c[x>>2];c[A+4>>2]=c[x+4>>2];Cb[y&15](B,e,A);e=c[z>>2]|0;if(!e){e=Ub(2)|0;c[z>>2]=e}z=C;c[z>>2]=f;c[z+4>>2]=h;z=B;F=c[z+4>>2]|0;E=C+8|0;c[E>>2]=c[z>>2];c[E+4>>2]=F;c[A>>2]=c[C>>2];c[A+4>>2]=c[C+4>>2];c[A+8>>2]=c[C+8>>2];c[A+12>>2]=c[C+12>>2];Xb(e,A);C=B;E=c[C+4>>2]|0;F=a;c[F>>2]=c[C>>2];c[F+4>>2]=E}while(0);l=D;return}function Sd(a,b){a=a|0;b=b|0;var d=fb,e=fb,f=0,h=0;d=T(g[a+344>>2]);h=((ue(d)|0)&2147483647)>>>0>2139095040;e=T(g[b>>2]);if(h)if(((ue(e)|0)&2147483647)>>>0>2139095040|d==e)f=4;else b=0;else if(d==e)f=4;else b=0;do if((f|0)==4){e=T(g[a+348>>2]);h=((ue(e)|0)&2147483647)>>>0>2139095040;d=T(g[b+4>>2]);if(h){if(!(((ue(d)|0)&2147483647)>>>0>2139095040|e==d)){b=0;break}}else if(!(e==d)){b=0;break}d=T(g[a+40>>2]);h=((ue(d)|0)&2147483647)>>>0>2139095040;e=T(g[a+352>>2]);if(h){if(!(((ue(e)|0)&2147483647)>>>0>2139095040|d==e)){b=0;break}}else if(!(d==e)){b=0;break}if((c[a+44>>2]|0)==(c[a+356>>2]|0)){d=T(g[a+48>>2]);h=((ue(d)|0)&2147483647)>>>0>2139095040;e=T(g[a+360>>2]);if(h){if(!(((ue(e)|0)&2147483647)>>>0>2139095040|d==e)){b=0;break}}else if(!(d==e)){b=0;break}b=(c[a+52>>2]|0)==(c[a+364>>2]|0)}else b=0}while(0);return b|0}function Td(b,d,e,f,h){b=b|0;d=d|0;e=e|0;f=f|0;h=h|0;var i=0,k=fb,m=0,n=fb,o=0,p=0,q=0,r=0,s=0,v=0,w=fb,x=0,y=0,z=0,A=0,B=fb,C=fb,D=fb,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=fb,M=fb,N=fb,O=fb,P=0,Q=0,R=0,S=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=fb,sa=fb,ta=fb,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=fb;Da=l;l=l+288|0;Ba=Da+280|0;m=Da+224|0;o=Da+216|0;p=Da+208|0;q=Da+200|0;r=Da+192|0;s=Da+184|0;ga=Da+272|0;V=Da+264|0;ca=Da+24|0;F=Da+176|0;ba=Da+256|0;G=Da+168|0;H=Da+160|0;I=Da+152|0;J=Da+144|0;K=Da+136|0;P=Da+128|0;Q=Da+120|0;R=Da+112|0;S=Da+104|0;Aa=Da+248|0;U=Da+96|0;W=Da+88|0;X=Da+80|0;Y=Da+72|0;Z=Da+64|0;_=Da+56|0;ea=Da+48|0;fa=Da+40|0;ha=Da+32|0;ia=Da+232|0;na=Da+16|0;oa=Da+8|0;pa=Da;Ca=Da+240|0;la=b+324|0;g[la>>2]=T(t);k=T(g[e>>2]);if(k<T(0.0)){g[e>>2]=T(0.0);k=T(0.0)}i=e+4|0;n=T(g[i>>2]);if(n<T(0.0)){g[i>>2]=T(0.0);n=T(0.0)}E=b+40|0;A=c[E>>2]|0;E=c[E+4>>2]|0;z=m;c[z>>2]=A;c[z+4>>2]=E;c[Ba>>2]=c[m>>2];c[Ba+4>>2]=c[m+4>>2];w=T(Ld(Ba,k));z=b+48|0;y=c[z>>2]|0;z=c[z+4>>2]|0;za=o;c[za>>2]=y;c[za+4>>2]=z;c[Ba>>2]=c[o>>2];c[Ba+4>>2]=c[o+4>>2];B=T(Ld(Ba,n));if(h){if(((ue(w)|0)&2147483647)>>>0>2139095040){za=((ue(k)|0)&2147483647)>>>0>2139095040;w=za?w:k}if(((ue(B)|0)&2147483647)>>>0>2139095040){za=((ue(n)|0)&2147483647)>>>0>2139095040;B=za?B:n}}x=b+56|0;za=x;ya=c[za+4>>2]|0;v=p;c[v>>2]=c[za>>2];c[v+4>>2]=ya;c[Ba>>2]=c[p>>2];c[Ba+4>>2]=c[p+4>>2];C=T(Ld(Ba,k));v=b+72|0;ya=v;za=c[ya+4>>2]|0;p=q;c[p>>2]=c[ya>>2];c[p+4>>2]=za;c[Ba>>2]=c[q>>2];c[Ba+4>>2]=c[q+4>>2];C=T(Ud(w,C,T(Ld(Ba,k))));p=b+64|0;za=p;ya=c[za+4>>2]|0;h=r;c[h>>2]=c[za>>2];c[h+4>>2]=ya;c[Ba>>2]=c[r>>2];c[Ba+4>>2]=c[r+4>>2];ta=T(Ld(Ba,n));h=b+80|0;ya=h;za=c[ya+4>>2]|0;m=s;c[m>>2]=c[ya>>2];c[m+4>>2]=za;c[Ba>>2]=c[s>>2];c[Ba+4>>2]=c[s+4>>2];B=T(Ud(B,ta,T(Ld(Ba,n))));g[ga>>2]=C;g[ga+4>>2]=B;m=((ue(C)|0)&2147483647)>>>0>2139095040;if(m)D=T(t);else D=T(C-T(Od(b+268|0,0)));g[V>>2]=D;o=((ue(B)|0)&2147483647)>>>0>2139095040;if(o)w=T(t);else w=T(B-T(Od(b+268|0,1)));g[V+4>>2]=w;if(!m)g[b+244>>2]=C;if(!o)g[b+248>>2]=B;aa=(f|0)==1;if(aa)if(m){$=0;ma=23}else g[b+244>>2]=C;else{i=(f|0)!=2;if(i|o){$=i^1;ma=23}else g[b+248>>2]=B}if((ma|0)==23){da=b+308|0;L=T(Od(da,0));M=T(Od(da,1));da=b+268|0;N=T(Od(da,0));O=T(Od(da,1));if(m){za=((ue(k)|0)&2147483647)>>>0>2139095040;w=T(T(k-L)-N);w=za?T(t):w}else w=T(C-N);g[ca>>2]=w;if(o){za=((ue(n)|0)&2147483647)>>>0>2139095040;w=T(T(n-M)-O);w=za?T(t):w}else w=T(B-O);g[ca+4>>2]=w;ka=ca;ja=c[ka>>2]|0;ka=c[ka+4>>2]|0;za=F;c[za>>2]=ja;c[za+4>>2]=ka;c[Ba>>2]=c[F>>2];c[Ba+4>>2]=c[F+4>>2];do if(!(Sd(b,Ba)|0)){xa=(f|0)==4;if(xa){za=b+344|0;c[za>>2]=ja;c[za+4>>2]=ka}else{g[b+344>>2]=T(-1.0e3);g[b+348>>2]=T(-1.0e3)}i=b+352|0;c[i>>2]=A;c[i+4>>2]=E;i=b+360|0;c[i>>2]=y;c[i+4>>2]=z;i=Pd(b)|0;if(!i){if(!(m|o))break;d=G;c[d>>2]=ja;c[d+4>>2]=ka;c[Ba>>2]=c[G>>2];c[Ba+4>>2]=c[G+4>>2];Rd(ba,b,Ba);if(m){sa=T(g[ba>>2]);sa=T(sa+T(Od(da,0)));d=x;Ca=c[d+4>>2]|0;Aa=H;c[Aa>>2]=c[d>>2];c[Aa+4>>2]=Ca;c[Ba>>2]=c[H>>2];c[Ba+4>>2]=c[H+4>>2];ta=T(Ld(Ba,k));Aa=v;Ca=c[Aa+4>>2]|0;d=I;c[d>>2]=c[Aa>>2];c[d+4>>2]=Ca;c[Ba>>2]=c[I>>2];c[Ba+4>>2]=c[I+4>>2];g[b+244>>2]=T(Ud(sa,ta,T(Ld(Ba,k))))}if(o){sa=T(g[ba+4>>2]);sa=T(sa+T(Od(da,1)));d=p;Ca=c[d+4>>2]|0;Aa=J;c[Aa>>2]=c[d>>2];c[Aa+4>>2]=Ca;c[Ba>>2]=c[J>>2];c[Ba+4>>2]=c[J+4>>2];ta=T(Ld(Ba,n));Aa=h;Ca=c[Aa+4>>2]|0;d=K;c[d>>2]=c[Aa>>2];c[d+4>>2]=Ca;c[Ba>>2]=c[K>>2];c[Ba+4>>2]=c[K+4>>2];g[b+248>>2]=T(Ud(sa,ta,T(Ld(Ba,n))))}break}J=b+4|0;o=c[J>>2]|0;K=(o|1|0)==3;wa=(c[b>>2]|0)==2;qa=c[40+(o<<2)>>2]|0;y=o|2;ua=(y|0)==2;va=ua&1;za=Nz(i*368|0)|0;a:do if(!(Pd(b)|0)){E=0;ya=0}else{i=0;m=0;h=0;while(1){p=Qd(b,i)|0;Kd(p,0,D,o);if(!(a[p+208>>0]|0))o=m+1|0;else{ya=h+1|0;o=m;h=ya;m=(Pd(b)|0)-ya|0}c[za+(m<<2)>>2]=p;i=i+1|0;if(i>>>0>=(Pd(b)|0)>>>0){E=o;ya=h;break a}m=o;o=c[J>>2]|0}}while(0);I=b+56+(va<<3)|0;A=c[I+4>>2]|0;F=P;c[F>>2]=c[I>>2];c[F+4>>2]=A;ra=T(g[e+(va<<2)>>2]);c[Ba>>2]=c[P>>2];c[Ba+4>>2]=c[P+4>>2];sa=T(Ld(Ba,ra));F=b+72+(va<<3)|0;P=c[F+4>>2]|0;A=Q;c[A>>2]=c[F>>2];c[A+4>>2]=P;c[Ba>>2]=c[Q>>2];c[Ba+4>>2]=c[Q+4>>2];ra=T(Ld(Ba,ra));A=b+56+(qa<<3)|0;P=c[A+4>>2]|0;F=R;c[F>>2]=c[A>>2];c[F+4>>2]=P;w=T(g[e+(qa<<2)>>2]);c[Ba>>2]=c[R>>2];c[Ba+4>>2]=c[R+4>>2];C=T(Ld(Ba,w));R=b+72+(qa<<3)|0;F=c[R+4>>2]|0;P=S;c[P>>2]=c[R>>2];c[P+4>>2]=F;c[Ba>>2]=c[S>>2];c[Ba+4>>2]=c[S+4>>2];B=T(Ld(Ba,w));g[ba>>2]=L;g[ba+4>>2]=M;g[Aa>>2]=N;g[Aa+4>>2]=O;P=Nz(((E|0)>1?E:1)*12|0)|0;F=P+4|0;c[F>>2]=0;g[P>>2]=T(0.0);R=b+212|0;A=c[R+4>>2]|0;S=U;c[S>>2]=c[R>>2];c[S+4>>2]=A;L=T(g[V+(qa<<2)>>2]);c[Ba>>2]=c[U>>2];c[Ba+4>>2]=c[U+4>>2];O=T(Md(T(Ld(Ba,L))));S=b+220|0;U=c[S+4>>2]|0;A=W;c[A>>2]=c[S>>2];c[A+4>>2]=U;N=T(g[V+(va<<2)>>2]);c[Ba>>2]=c[W>>2];c[Ba+4>>2]=c[W+4>>2];ta=T(Md(T(Ld(Ba,N))));A=(E|0)==0;do if(!A){r=ua?1:2;s=b+232|0;v=b+228|0;x=ca+(qa<<2)|0;i=1;m=0;b:do{p=c[za+(m<<2)>>2]|0;h=p+328|0;o=c[h>>2]|0;h=c[h+4>>2]|0;W=X;c[W>>2]=o;c[W+4>>2]=h;c[Ba>>2]=c[X>>2];c[Ba+4>>2]=c[X+4>>2];k=T(Ld(Ba,L));if(((ue(k)|0)&2147483647)>>>0>2139095040){U=p+40+(qa<<3)|0;W=U;V=c[W>>2]|0;W=c[W+4>>2]|0;S=U;c[S>>2]=o;c[S+4>>2]=h;o=Y;c[o>>2]=ja;c[o+4>>2]=ka;c[Ba>>2]=c[Y>>2];c[Ba+4>>2]=c[Y+4>>2];Td(p,d,Ba,r,0);o=U;c[o>>2]=V;c[o+4>>2]=W;o=p+244+(qa<<2)|0;W=c[o>>2]|0;c[p+304>>2]=W;k=(c[j>>2]=W,T(g[j>>2]))}else{g[p+304>>2]=k;o=p+244+(qa<<2)|0}h=p+56+(qa<<3)|0;q=c[h+4>>2]|0;W=Z;c[W>>2]=c[h>>2];c[W+4>>2]=q;c[Ba>>2]=c[Z>>2];c[Ba+4>>2]=c[Z+4>>2];n=T(Ld(Ba,L));W=p+72+(qa<<3)|0;q=c[W+4>>2]|0;h=_;c[h>>2]=c[W>>2];c[h+4>>2]=q;c[Ba>>2]=c[_>>2];c[Ba+4>>2]=c[_+4>>2];n=T(Ud(k,n,T(Ld(Ba,L))));g[o>>2]=n;n=T(n+T(Od(p+308|0,qa)));p=i+-1|0;h=P+(p*12|0)|0;p=P+(p*12|0)+4|0;q=c[p>>2]|0;o=(q|0)!=0;c:do if(c[b>>2]|0){k=T(O+n);k=o?k:n;do if(((c[s>>2]|0)+-1|0)>>>0>=q>>>0){n=T(k+T(g[h>>2]));M=T(g[x>>2]);W=((ue(M)|0)&2147483647)>>>0>2139095040;if(+n>(W?u:+M+.001))break;c[p>>2]=q+1;g[h>>2]=n;break c}while(0);if(((c[v>>2]|0)+-1|0)>>>0<i>>>0){ma=61;break b}if(!q){c[p>>2]=1;g[h>>2]=k;break}else{M=T(k-O);c[P+(i*12|0)+4>>2]=1;g[P+(i*12|0)>>2]=M;i=i+1|0;break}}else{k=T(g[h>>2]);if(o){k=T(O+k);g[h>>2]=k}g[h>>2]=T(n+k);c[p>>2]=q+1}while(0);m=m+1|0}while(m>>>0<E>>>0);if((ma|0)==61){if((m|0)>=(E|0)){m=i;ma=48;break}do{_=c[za+(m<<2)>>2]|0;g[_+236>>2]=T(0.0);g[_+240>>2]=T(0.0);g[_+244>>2]=T(-1.0);g[_+248>>2]=T(-1.0);m=m+1|0}while((m|0)!=(E|0))}if(!i){H=0;n=T(0.0);m=1}else{m=0;ma=50}}else{m=1;ma=48}while(0);if((ma|0)==48){i=m;m=(m|0)==0;ma=50}if((ma|0)==50){k=T(0.0);o=0;do{M=T(g[P+(o*12|0)>>2]);k=M>k?M:k;o=o+1|0}while((o|0)!=(i|0));H=i;n=k}k=T(g[ga+(qa<<2)>>2]);if(((ue(k)|0)&2147483647)>>>0>2139095040){n=T(n+T(g[Aa+(qa<<2)>>2]));if(((ue(w)|0)&2147483647)>>>0>2139095040)k=T(t);else k=T(w-T(g[ba+(qa<<2)>>2]));k=T(Vd(n,k))}I=b+244|0;G=b+244+(qa<<2)|0;k=T(Ud(k,C,B));g[G>>2]=k;d:do if(aa&ua|$&(y|0)==3){Oz(P);Oz(za)}else{M=T(k-T(g[Aa+(qa<<2)>>2]));y=Nz(E)|0;z=Nz(E)|0;if(!m){D=T(g[ca+(qa<<2)>>2]);r=((ue(D)|0)&2147483647)>>>0>2139095040;D=r?T(u):D;r=0;v=0;do{o=c[P+(v*12|0)+4>>2]|0;s=r;r=o+r|0;x=s>>>0<r>>>0;do if(x){i=s;k=T(0.0);do{ca=c[za+(i<<2)>>2]|0;C=T(g[ca+244+(qa<<2)>>2]);k=T(k+T(C+T(Od(ca+308|0,qa))));i=i+1|0}while((i|0)!=(r|0));C=T(O*T((o+-1|0)>>>0));p=T(C+k)<D;k=T(M-C);if(x){i=o;n=k;h=s}else{i=o;n=k;break}do{o=c[za+(h<<2)>>2]|0;if(p)w=T(g[o+32>>2]);else{w=T(g[o+36>>2]);w=T(w*T(g[o+304>>2]))}do if(w==T(0.0)){w=T(g[o+244+(qa<<2)>>2]);ma=91}else{B=T(g[o+304>>2]);w=T(g[o+244+(qa<<2)>>2]);if(p){if(B>w){ma=91;break}}else if(B<w){ma=91;break}a[y+h>>0]=0;w=B}while(0);if((ma|0)==91){ma=0;a[y+h>>0]=1;i=i+-1|0}n=T(n-T(w+T(Od(o+308|0,qa))));h=h+1|0}while((h|0)!=(r|0))}else{C=T(O*T((o+-1|0)>>>0));k=T(M-C);i=o;n=k;p=T(C+T(0.0))<D}while(0);e:do if(i|0){C=T(FA(T(0.0),k));q=p^1;do{if(x){k=C;w=T(0.0);h=s;do{o=c[za+(h<<2)>>2]|0;if(!(a[y+h>>0]|0)){B=T(g[o+304>>2]);B=T(B+T(Od(o+308|0,qa)));w=T(w+T(g[(p?o+32|0:o+36|0)>>2]))}else{B=T(g[o+244+(qa<<2)>>2]);B=T(B+T(Od(o+308|0,qa)))}k=T(k-B);h=h+1|0}while((h|0)!=(r|0))}else{k=C;w=T(0.0)}B=T(n*w);ca=w<T(1.0)&B<k;B=ca?B:k;f:do if(!(B==T(0.0))){o=w>T(0.0);if(p&o){if(x)o=s;else break e;while(1){h=c[za+(o<<2)>>2]|0;if(!(a[y+o>>0]|0)){k=T(T(g[h+32>>2])/w);g[h+244+(qa<<2)>>2]=T(T(g[h+304>>2])+T(B*k))}o=o+1|0;if((o|0)==(r|0))break f}}if(!(o&q))break;if(x){k=T(0.0);h=s}else break e;do{o=c[za+(h<<2)>>2]|0;if(!(a[y+h>>0]|0)){w=T(g[o+36>>2]);k=T(k+T(w*T(g[o+304>>2])))}h=h+1|0}while((h|0)!=(r|0));if(x)o=s;else break e;do{h=c[za+(o<<2)>>2]|0;if(!(a[y+o>>0]|0)){Ea=T(g[h+36>>2]);w=T(g[h+304>>2]);g[h+244+(qa<<2)>>2]=T(w+T(B*T(T(Ea*w)/k)))}o=o+1|0}while((o|0)!=(r|0))}while(0);if(x){k=T(0.0);h=s}else break e;do{o=c[za+(h<<2)>>2]|0;if(!(a[y+h>>0]|0)){ca=o+244+(qa<<2)|0;B=T(g[ca>>2]);ba=o+56+(qa<<3)|0;aa=c[ba+4>>2]|0;$=ea;c[$>>2]=c[ba>>2];c[$+4>>2]=aa;c[Ba>>2]=c[ea>>2];c[Ba+4>>2]=c[ea+4>>2];Ea=T(Ld(Ba,L));$=o+72+(qa<<3)|0;aa=c[$+4>>2]|0;ba=fa;c[ba>>2]=c[$>>2];c[ba+4>>2]=aa;c[Ba>>2]=c[fa>>2];c[Ba+4>>2]=c[fa+4>>2];Ea=T(Ud(B,Ea,T(Ld(Ba,L))));a[z+h>>0]=Ea==B?0:Ea<B?1:-1;k=T(k+T(Ea-B));g[ca>>2]=Ea}h=h+1|0}while((h|0)!=(r|0));if(k==T(0.0))break e;do if(k>T(0.0)){if(x)h=s;else break;do{o=y+h|0;do if(!(a[o>>0]|0)){if((a[z+h>>0]|0)>=0)break;a[o>>0]=1;i=i+-1|0}while(0);h=h+1|0}while((h|0)!=(r|0))}else{if(x)h=s;else break;do{o=y+h|0;do if(!(a[o>>0]|0)){if((a[z+h>>0]|0)<=0)break;a[o>>0]=1;i=i+-1|0}while(0);h=h+1|0}while((h|0)!=(r|0))}while(0)}while((i|0)!=0)}while(0);v=v+1|0}while((v|0)!=(H|0))}Oz(y);Oz(z);if(!A){i=0;do{ba=c[za+(i<<2)>>2]|0;fa=ba+40+(qa<<3)|0;ea=fa;ca=c[ea>>2]|0;ea=c[ea+4>>2]|0;c[fa>>2]=c[ba+244+(qa<<2)>>2];c[ba+40+(qa<<3)+4>>2]=1;aa=ha;c[aa>>2]=ja;c[aa+4>>2]=ka;c[Ba>>2]=c[ha>>2];c[Ba+4>>2]=c[ha+4>>2];Td(ba,d,Ba,f,0);c[fa>>2]=ca;c[fa+4>>2]=ea;i=i+1|0}while((i|0)!=(E|0))}k=T(g[ga+(va<<2)>>2]);E=((ue(k)|0)&2147483647)>>>0>2139095040;if(E)D=T(t);else D=T(k-T(Od(da,va)));do if((c[b>>2]|0)!=0|E){if(m){L=T(0.0);m=1;break}w=T(0.0);h=0;p=0;do{i=h;h=(c[P+(p*12|0)+4>>2]|0)+h|0;if(i>>>0<h>>>0){C=T(0.0);B=T(0.0);n=T(0.0);do{o=c[za+(i<<2)>>2]|0;do if(ua){if((c[o+336>>2]|0)!=7){ma=152;break}if(Wd(o,va)|0){ma=152;break}Nd(o,Ba,ia);L=T(g[Ba>>2]);Ea=T(g[ia>>2]);B=L>B?L:B;n=Ea>n?Ea:n}else ma=152;while(0);if((ma|0)==152){ma=0;Ea=T(g[o+244+(va<<2)>>2]);Ea=T(Ea+T(Od(o+308|0,va)));C=Ea>C?Ea:C}i=i+1|0}while((i|0)!=(h|0))}else{C=T(0.0);B=T(0.0);n=T(0.0)}g[P+(p*12|0)+8>>2]=B;n=T(FA(T(0.0),T(FA(C,T(n+B)))));if(!(c[b>>2]|0))n=T(Ud(n,sa,ra));Ea=T(ta+w);w=T(((p|0)==0?w:Ea)+n);g[P+(p*12|0)>>2]=n;p=p+1|0}while((p|0)!=(H|0));L=w}else{g[P>>2]=D;h=c[F>>2]|0;if(!h)n=T(0.0);else{n=T(0.0);o=0;do{i=c[za+(o<<2)>>2]|0;do if(ua){if((c[i+336>>2]|0)!=7)break;if(Wd(i,va)|0)break;Nd(i,Ba,0);Ea=T(g[Ba>>2]);n=Ea>n?Ea:n}while(0);o=o+1|0}while(o>>>0<h>>>0)}g[P+8>>2]=n;L=D}while(0);n=T(g[P+8>>2]);if(n!=T(0.0))n=T(n+T(g[b+268+(c[8+(va<<2)>>2]<<2)>>2]));else n=T(t);g[la>>2]=n;g:do if(xa){do if(!E){if((c[b+16>>2]|0)!=1)break;la=((ue(D)|0)&2147483647)>>>0>2139095040;if(!(L<(la?T(u):D)))break;n=T(T(D-L)/T(H>>>0));if(m){k=T(Ud(k,sa,ra));i=b+244+(va<<2)|0;g[i>>2]=k;m=1;break g}else{i=0;do{ma=P+(i*12|0)|0;g[ma>>2]=T(n+T(g[ma>>2]));i=i+1|0}while((i|0)!=(H|0))}}while(0);if(m){m=1;ma=233;break}else{v=0;x=0}do{i=v;v=(c[P+(x*12|0)+4>>2]|0)+v|0;if(i>>>0<v>>>0){y=P+(x*12|0)|0;do{h=c[za+(i<<2)>>2]|0;p=h+40+(va<<3)|0;r=p;q=c[r>>2]|0;r=c[r+4>>2]|0;s=h+336|0;do if((c[s>>2]|0)==1){o=h+40+(va<<3)+4|0;if((c[o>>2]|0)!=3)break;if(Wd(h,va)|0)break;c[o>>2]=1;Ea=T(g[y>>2]);Ea=T(Ea-T(Od(h+308|0,va)));g[h+244+(va<<2)>>2]=Ea;g[p>>2]=Ea}while(0);ma=h+244+(va<<2)|0;Ea=T(g[ma>>2]);la=h+56+(va<<3)|0;ia=c[la+4>>2]|0;ha=na;c[ha>>2]=c[la>>2];c[ha+4>>2]=ia;c[Ba>>2]=c[na>>2];c[Ba+4>>2]=c[na+4>>2];n=T(Ld(Ba,N));ha=h+72+(va<<3)|0;ia=c[ha+4>>2]|0;la=oa;c[la>>2]=c[ha>>2];c[la+4>>2]=ia;c[Ba>>2]=c[oa>>2];c[Ba+4>>2]=c[oa+4>>2];n=T(Ud(Ea,n,T(Ld(Ba,N))));g[ma>>2]=n;if((c[s>>2]|0)==1){ma=h+40+(qa<<3)|0;la=ma;ia=c[la>>2]|0;la=c[la+4>>2]|0;g[p>>2]=n;c[h+40+(va<<3)+4>>2]=1;c[ma>>2]=c[h+244+(qa<<2)>>2];c[h+40+(qa<<3)+4>>2]=1;ha=pa;c[ha>>2]=ja;c[ha+4>>2]=ka;c[Ba>>2]=c[pa>>2];c[Ba+4>>2]=c[pa+4>>2];Td(h,d,Ba,4,0);c[ma>>2]=ia;c[ma+4>>2]=la}ma=p;c[ma>>2]=q;c[ma+4>>2]=r;i=i+1|0}while((i|0)!=(v|0))}x=x+1|0}while((x|0)!=(H|0));if(m){m=1;ma=233;break}z=b+20|0;A=8+(qa<<2)|0;x=0;y=0;do{q=c[P+(y*12|0)+4>>2]|0;v=x;x=q+x|0;s=v>>>0<x>>>0;if(s){n=T(0.0);i=v;do{pa=c[za+(i<<2)>>2]|0;Ea=T(g[pa+244+(qa<<2)>>2]);n=T(n+T(Ea+T(Od(pa+308|0,qa))));i=i+1|0}while((i|0)!=(x|0))}else n=T(0.0);B=T((q+-1|0)>>>0);w=T(M-T(n+T(O*B)));do if(w>T(0.0)){if(!s)break;p=c[J>>2]|0;h=c[8+(p<<2)>>2]|0;p=c[24+(p<<2)>>2]|0;i=0;o=v;do{pa=c[za+(o<<2)>>2]|0;oa=(((ue(T(g[pa+308+(h<<2)>>2]))|0)&2147483647)>>>0>2139095040&1)+i|0;i=oa+(((ue(T(g[pa+308+(p<<2)>>2]))|0)&2147483647)>>>0>2139095040&1)|0;o=o+1|0}while((o|0)!=(x|0));if(!i)break;n=T(w/T(i>>>0));if(!s){w=T(0.0);break}h=c[J>>2]|0;o=c[8+(h<<2)>>2]|0;h=c[24+(h<<2)>>2]|0;i=v;do{p=c[za+(i<<2)>>2]|0;if(((ue(T(g[p+308+(o<<2)>>2]))|0)&2147483647)>>>0>2139095040)g[p+252+(o<<2)>>2]=n;if(((ue(T(g[p+308+(h<<2)>>2]))|0)&2147483647)>>>0>2139095040)g[p+252+(h<<2)>>2]=n;i=i+1|0}while((i|0)!=(x|0));w=T(0.0)}else{if(!s)break;h=c[J>>2]|0;o=c[8+(h<<2)>>2]|0;h=c[24+(h<<2)>>2]|0;i=v;do{p=c[za+(i<<2)>>2]|0;if(((ue(T(g[p+308+(o<<2)>>2]))|0)&2147483647)>>>0>2139095040)g[p+252+(o<<2)>>2]=T(0.0);if(((ue(T(g[p+308+(h<<2)>>2]))|0)&2147483647)>>>0>2139095040)g[p+252+(h<<2)>>2]=T(0.0);i=i+1|0}while((i|0)!=(x|0))}while(0);i=c[J>>2]|0;r=c[8+(i<<2)>>2]|0;n=T(g[b+268+(r<<2)>>2]);switch(c[z>>2]|0){case 6:{Ea=T(w/T(q>>>0));B=Ea;n=T(n+T(Ea*T(.5)));break}case 3:{B=T(0.0);n=T(T(w*T(.5))+n);break}case 4:{B=T(0.0);n=T(w+n);break}case 5:{B=T(w/B);break}default:B=T(0.0)}h:do if(s){q=c[A>>2]|0;p=24+(i<<2)|0;i=v;while(1){h=c[za+(i<<2)>>2]|0;w=T(n+T(g[h+252+(r<<2)>>2]));o=h+244+(qa<<2)|0;if(K){n=T(T(g[G>>2])-w);n=T(n-T(g[o>>2]))}else n=w;g[h+236+(q<<2)>>2]=n;i=i+1|0;if((i|0)==(x|0))break h;n=T(g[o>>2]);n=T(w+T(O+T(B+T(n+T(g[h+252+(c[p>>2]<<2)>>2])))))}}while(0);y=y+1|0}while((y|0)!=(H|0));if(m){m=1;ma=233;break}z=8+(va<<2)|0;A=24+(va<<2)|0;s=0;v=0;while(1){i=s;s=(c[P+(v*12|0)+4>>2]|0)+s|0;i:do if(i>>>0<s>>>0){C=T(g[P+(v*12|0)>>2]);x=c[z>>2]|0;y=P+(v*12|0)+8|0;while(1){r=c[za+(i<<2)>>2]|0;o=r+244+(va<<2)|0;n=T(g[o>>2]);n=T(C-T(n+T(Od(r+308|0,va))));qa=n>T(0.0);h=((ue(T(g[r+308+(x<<2)>>2]))|0)&2147483647)>>>0>2139095040;do if(qa){p=c[A>>2]|0;q=((ue(T(g[r+308+(p<<2)>>2]))|0)&2147483647)>>>0>2139095040;if(!h){if(!q)break;g[r+252+(p<<2)>>2]=n;break}if(q){Ea=T(n*T(.5));g[r+252+(p<<2)>>2]=Ea;g[r+252+(x<<2)>>2]=Ea;break}else{g[r+252+(x<<2)>>2]=n;break}}else{if(!h)break;g[r+252+(x<<2)>>2]=T(0.0)}while(0);B=T(g[o>>2]);w=T(C-T(B+T(Od(r+252|0,va))));n=T(g[r+252+(x<<2)>>2]);j:do switch(c[r+336>>2]|0){case 7:{if(!ua)break j;if(Wd(r,va)|0)break j;n=T(T(g[y>>2])-T(g[r+324>>2]));break}case 3:{n=T(n+T(w*T(.5)));break}case 4:{n=T(n+w);break}default:{}}while(0);Ea=T(T(C-n)-B);g[r+236+(x<<2)>>2]=wa?Ea:n;i=i+1|0;if((i|0)==(s|0))break i}}while(0);v=v+1|0;if((v|0)==(H|0)){ma=233;break}}}else ma=233;while(0);do if((ma|0)==233){if(E)k=T(L+T(g[Aa+(va<<2)>>2]));k=T(Ud(k,sa,ra));i=b+244+(va<<2)|0;g[i>>2]=k;if(xa)break;Oz(P);Oz(za);break d}while(0);n=T(k-T(g[Aa+(va<<2)>>2]));q=c[8+(va<<2)>>2]|0;k=T(g[b+268+(q<<2)>>2]);n=T(n-L);switch(c[b+16>>2]|0){case 6:{Ea=T(n/T(H>>>0));w=Ea;k=T(k+T(Ea*T(.5)));break}case 5:{w=T(n/T((H+-1|0)>>>0));break}case 3:{w=T(0.0);k=T(k+T(n*T(.5)));break}case 4:{w=T(0.0);k=T(k+n);break}default:w=T(0.0)}if(!m){o=0;h=0;do{m=h;h=(c[P+(o*12|0)+4>>2]|0)+h|0;p=P+(o*12|0)|0;if(m>>>0<h>>>0)do{if(wa){n=T(g[i>>2]);n=T(T(n-T(g[p>>2]))-k)}else n=k;Aa=(c[za+(m<<2)>>2]|0)+236+(q<<2)|0;g[Aa>>2]=T(n+T(g[Aa>>2]));m=m+1|0}while((m|0)!=(h|0));k=T(k+T(ta+T(w+T(g[p>>2]))));o=o+1|0}while((o|0)!=(H|0))}if(ya|0){z=b+248|0;y=Ca+4|0;x=0;do{A=c[za+((Pd(b)|0)+~x<<2)>>2]|0;m=c[I>>2]|0;o=c[z>>2]|0;h=A+40|0;q=h;p=c[q>>2]|0;q=c[q+4>>2]|0;r=A+48|0;v=r;s=c[v>>2]|0;v=c[v+4>>2]|0;i=A+44|0;k=(c[j>>2]=m,T(g[j>>2]));do if((c[i>>2]|0)==3){if(Wd(A,0)|0)break;g[A+40>>2]=T(k-T(Od(A+308|0,0)));c[i>>2]=1}while(0);i=A+52|0;do if((c[i>>2]|0)==3){if(Wd(A,1)|0)break;Ea=T(g[z>>2]);g[A+48>>2]=T(Ea-T(Od(A+308|0,1)));c[i>>2]=1}while(0);c[Ca>>2]=m;c[y>>2]=o;c[Ba>>2]=c[Ca>>2];c[Ba+4>>2]=c[Ca+4>>2];Td(A,d,Ba,4,0);o=h;c[o>>2]=p;c[o+4>>2]=q;o=r;c[o>>2]=s;c[o+4>>2]=v;k=T(g[I>>2]);o=A+236|0;k=T(k-T(g[A+244>>2]));i=A+308|0;k=T(k-T(Od(i,0)));n=T(g[z>>2]);n=T(n-T(g[A+248>>2]));n=T(n-T(Od(i,1)));Aa=k>T(0.0);i=((ue(T(g[i>>2]))|0)&2147483647)>>>0>2139095040;do if(Aa){m=((ue(T(g[A+316>>2]))|0)&2147483647)>>>0>2139095040;if(!i){if(!m)break;g[A+260>>2]=k;break}if(m){Ea=T(k*T(.5));g[A+260>>2]=Ea;g[A+252>>2]=Ea;break}else{g[A+252>>2]=k;break}}else{if(i)g[A+252>>2]=T(0.0);if(((ue(T(g[A+316>>2]))|0)&2147483647)>>>0<=2139095040)break;g[A+260>>2]=T(0.0)}while(0);Aa=n>T(0.0);i=((ue(T(g[A+312>>2]))|0)&2147483647)>>>0>2139095040;do if(Aa){m=((ue(T(g[A+320>>2]))|0)&2147483647)>>>0>2139095040;if(!i){if(!m)break;g[A+264>>2]=n;break}if(m){Ea=T(n*T(.5));g[A+264>>2]=Ea;g[A+256>>2]=Ea;break}else{g[A+256>>2]=n;break}}else{if(i)g[A+256>>2]=T(0.0);if(((ue(T(g[A+320>>2]))|0)&2147483647)>>>0<=2139095040)break;g[A+264>>2]=T(0.0)}while(0);c[o>>2]=c[A+252>>2];c[A+240>>2]=c[A+256>>2];x=x+1|0}while((x|0)!=(ya|0))}if(Pd(b)|0){i=0;do{Ca=c[za+(i<<2)>>2]|0;ya=Ca+236|0;Ea=T(g[ya>>2]);Ba=Ca+244|0;Aa=Ca+240|0;Ca=Ca+248|0;ta=T(g[d>>2]);g[ya>>2]=T(T(+oB(+T(Ea*ta)))/ta);ta=T(g[Aa>>2]);Ea=T(g[d>>2]);g[Aa>>2]=T(T(+oB(+T(ta*Ea)))/Ea);Ea=T(g[Ba>>2]);ta=T(g[d>>2]);g[Ba>>2]=T(T(+oB(+T(Ea*ta)))/ta);ta=T(g[Ca>>2]);Ea=T(g[d>>2]);g[Ca>>2]=T(T(+oB(+T(ta*Ea)))/Ea);i=i+1|0}while(i>>>0<(Pd(b)|0)>>>0)}Oz(za);Oz(P)}while(0)}while(0)}l=Da;return}function Ud(a,b,c){a=T(a);b=T(b);c=T(c);if(((ue(a)|0)&2147483647)>>>0<=2139095040){if(((ue(c)|0)&2147483647)>>>0<=2139095040)a=T(HA(a,c));a=T(FA(a,b))}return T(a)}function Vd(a,b){a=T(a);b=T(b);if(((ue(a)|0)&2147483647)>>>0<=2139095040?((ue(b)|0)&2147483647)>>>0<=2139095040:0)a=T(HA(a,b));return T(a)}function Wd(a,b){a=a|0;b=b|0;if(((ue(T(g[a+308+(c[8+(b<<2)>>2]<<2)>>2]))|0)&2147483647)>>>0>2139095040)a=1;else a=((ue(T(g[a+308+(c[24+(b<<2)>>2]<<2)>>2]))|0)&2147483647)>>>0>2139095040;return a|0}function Xd(a){a=a|0;var b=0,d=0,e=0,f=0,h=0,i=0,j=0;a:do if(Pd(a)|0){e=a+8|0;f=a+4|0;d=0;while(1){h=Qd(a,d)|0;switch(c[h+28>>2]|0){case 3:{j=h+40+(c[40+(c[f>>2]<<2)>>2]<<3)|0;i=c[j+4>>2]|0;b=h+328|0;c[b>>2]=c[j>>2];c[b+4>>2]=i;break}case 4:{g[h+328>>2]=T(t);c[h+332>>2]=3;break}default:{b=h+24|0;i=c[b+4>>2]|0;j=h+328|0;c[j>>2]=c[b>>2];c[j+4>>2]=i}}b=c[h+12>>2]|0;if(!b)b=c[e>>2]|0;c[h+336>>2]=b;Xd(h);d=d+1|0;if(d>>>0>=(Pd(a)|0)>>>0)break a}}while(0);return}function Yd(a,b,d,e){a=a|0;b=T(b);d=T(d);e=T(e);var f=fb,h=0,i=0,j=0,k=0,m=0,n=0,o=0;o=l;l=l+32|0;k=o+16|0;m=o+8|0;n=o;g[m>>2]=e;Xd(a);Kd(a,0,b,1);j=a+308|0;f=T(g[j>>2]);if(((ue(f)|0)&2147483647)>>>0>2139095040)f=T(0.0);else f=T(T(+oB(+T(f*e)))/e);i=a+252|0;g[i>>2]=f;f=T(g[a+312>>2]);if(((ue(f)|0)&2147483647)>>>0>2139095040)f=T(0.0);else f=T(T(+oB(+T(f*e)))/e);h=a+256|0;g[h>>2]=f;f=T(g[a+316>>2]);if(((ue(f)|0)&2147483647)>>>0>2139095040)f=T(0.0);else f=T(T(+oB(+T(f*e)))/e);g[a+260>>2]=f;f=T(g[a+320>>2]);if(((ue(f)|0)&2147483647)>>>0>2139095040)f=T(0.0);else f=T(T(+oB(+T(f*e)))/e);g[a+264>>2]=f;if(((ue(b)|0)&2147483647)>>>0>2139095040)b=T(t);else b=T(b-T(Od(j,0)));if(((ue(d)|0)&2147483647)>>>0>2139095040)f=T(t);else f=T(d-T(Od(j,1)));g[n>>2]=b;g[n+4>>2]=f;c[k>>2]=c[n>>2];c[k+4>>2]=c[n+4>>2];Td(a,m,k,4,1);c[a+236>>2]=c[i>>2];c[a+240>>2]=c[h>>2];n=a+244|0;g[n>>2]=T(T(+oB(+T(T(g[n>>2])*e)))/e);n=a+248|0;g[n>>2]=T(T(+oB(+T(T(g[n>>2])*e)))/e);l=o;return}function Zd(){var a=0;a=Nz(368)|0;mB(a|0,56,368)|0;return a|0}function _d(a){a=a|0;var b=0;b=c[a+340>>2]|0;if(b|0)Vb(b);b=c[a+296>>2]|0;if(b|0)Ob(b);Oz(a);return}function $d(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=a+296|0;if(!(c[e>>2]|0))c[e>>2]=Nb(4)|0;Zb(a);Pb(c[e>>2]|0,b,d);return}function ae(a,b){a=a|0;b=b|0;var d=0;d=a+296|0;if(!(c[d>>2]|0))c[d>>2]=Nb(4)|0;Zb(a);Qb(c[d>>2]|0,b);return}function be(a,b){a=a|0;b=b|0;Sb(c[a+296>>2]|0,b);Zb(a);return}function ce(a){a=T(a);var b=0,c=0;b=l;l=l+16|0;c=b;h[c>>3]=+a;NA(1696,c)|0;l=b;return}function de(a){a=a|0;var b=0,d=0,e=0;e=l;l=l+48|0;d=e+8|0;b=e;switch(c[a+4>>2]|0){case 1:{h[b>>3]=+T(g[a>>2]);NA(1696,b)|0;break}case 2:{h[d>>3]=+T(g[a>>2]);NA(1701,d)|0;break}case 3:{NA(1708,e+16|0)|0;break}case 4:{NA(1713,e+24|0)|0;break}case 0:{NA(1721,e+32|0)|0;break}default:{}}l=e;return}function ee(a){a=a|0;var b=0;b=l;l=l+32|0;switch(a|0){case 1:{NA(1731,b)|0;break}case 0:{NA(1736,b+8|0)|0;break}case 2:{NA(1743,b+16|0)|0;break}default:{}}l=b;return}function fe(a){a=a|0;var b=0;b=l;l=l+32|0;switch(a|0){case 1:{NA(1756,b)|0;break}case 0:{NA(1765,b+8|0)|0;break}case 3:{NA(1776,b+16|0)|0;break}case 2:{NA(1793,b+24|0)|0;break}default:{}}l=b;return}function ge(a){a=a|0;var b=0;b=l;l=l+64|0;switch(a|0){case 4:{NA(1812,b)|0;break}case 2:{NA(1816,b+8|0)|0;break}case 3:{NA(1822,b+16|0)|0;break}case 0:{NA(1708,b+24|0)|0;break}case 1:{NA(1829,b+32|0)|0;break}case 7:{NA(1837,b+40|0)|0;break}case 6:{NA(1846,b+48|0)|0;break}case 5:{NA(1859,b+56|0)|0;break}default:{}}l=b;return}function he(a){a=a|0;var b=0,d=0;b=l;l=l+16|0;d=b;c[d>>2]=a?1876:1881;NA(1873,d)|0;l=b;return}function ie(a){a=a|0;var b=0,d=0;b=l;l=l+16|0;d=b;c[d>>2]=a;NA(1887,d)|0;l=b;return}function je(a){a=a|0;var b=0,c=0,d=0;d=l;l=l+16|0;c=d;if((a|0)>0){b=0;do{NA(1890,c)|0;b=b+1|0}while((b|0)!=(a|0))}l=d;return}function ke(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0;Ja=l;l=l+624|0;ka=Ja+608|0;Fa=Ja+600|0;Ea=Ja+592|0;Da=Ja+584|0;Ca=Ja+576|0;Ba=Ja+568|0;Aa=Ja+560|0;za=Ja+552|0;ya=Ja+544|0;Ga=Ja+536|0;va=Ja+528|0;wa=Ja+520|0;ua=Ja+512|0;sa=Ja+504|0;ta=Ja+496|0;ra=Ja+488|0;qa=Ja+480|0;na=Ja+472|0;oa=Ja+464|0;ma=Ja+456|0;ia=Ja+448|0;la=Ja+440|0;ha=Ja+432|0;ea=Ja+424|0;fa=Ja+416|0;da=Ja+408|0;ca=Ja+400|0;ba=Ja+392|0;aa=Ja+384|0;$=Ja+376|0;_=Ja+368|0;Z=Ja+360|0;Y=Ja+352|0;S=Ja+344|0;R=Ja+336|0;Q=Ja+328|0;P=Ja+320|0;I=Ja+312|0;O=Ja+304|0;H=Ja+296|0;D=Ja+272|0;F=Ja+256|0;C=Ja+248|0;y=Ja+224|0;A=Ja+216|0;x=Ja+200|0;u=Ja+184|0;v=Ja+160|0;t=Ja+152|0;q=Ja+128|0;s=Ja+112|0;p=Ja+104|0;m=Ja+88|0;o=Ja+72|0;n=Ja+56|0;j=Ja+40|0;k=Ja+24|0;i=Ja+16|0;h=Ja+8|0;f=Ja;r=Ja+288|0;w=Ja+280|0;z=Ja+264|0;B=Ja+240|0;E=Ja+232|0;G=Ja+208|0;N=Ja+192|0;J=Ja+176|0;K=Ja+168|0;L=Ja+144|0;M=Ja+136|0;U=Ja+120|0;V=Ja+96|0;W=Ja+80|0;X=Ja+64|0;ga=Ja+48|0;ja=Ja+32|0;Ha=(d|0)==0?-1:d;xa=(Ha&8|0)==0;je(e);PA(3173)|0;Ia=e+1|0;do if(Ha&1|0){if(!xa){if(bA(b,56,4)|0){je(Ia);NA(1893,f)|0;ee(c[b>>2]|0);OA(10)|0}d=b+4|0;if(!(bA(d,60,4)|0))f=8;else f=7}else{je(Ia);NA(1893,h)|0;ee(c[b>>2]|0);OA(10)|0;d=b+4|0;f=7}if((f|0)==7){je(Ia);NA(1900,i)|0;fe(c[d>>2]|0);OA(10)|0;if(xa){je(Ia);NA(1912,j)|0;ge(c[b+8>>2]|0);OA(10)|0;d=b+12|0;f=12}else f=8}if((f|0)==8){d=b+8|0;if(bA(d,64,4)|0){je(Ia);NA(1912,k)|0;ge(c[d>>2]|0);OA(10)|0}d=b+12|0;if(!(bA(d,68,4)|0))f=13;else f=12}if((f|0)==12){je(Ia);NA(1926,n)|0;ge(c[d>>2]|0);OA(10)|0;if(xa){je(Ia);NA(1939,m)|0;ge(c[b+16>>2]|0);OA(10)|0;d=b+20|0;f=17}else f=13}if((f|0)==13){d=b+16|0;if(bA(d,72,4)|0){je(Ia);NA(1939,o)|0;ge(c[d>>2]|0);OA(10)|0}d=b+20|0;if(!(bA(d,76,4)|0))f=18;else f=17}if((f|0)==17){je(Ia);NA(1955,p)|0;ge(c[d>>2]|0);OA(10)|0;if(xa){je(Ia);NA(1973,q)|0;s=b+24|0;f=c[s+4>>2]|0;d=r;c[d>>2]=c[s>>2];c[d+4>>2]=f;c[ka>>2]=c[r>>2];c[ka+4>>2]=c[r+4>>2];de(ka);OA(10)|0;d=b+32|0;f=22}else f=18}if((f|0)==18){d=b+24|0;if(bA(d,80,8)|0){je(Ia);NA(1973,s)|0;p=d;q=c[p+4>>2]|0;s=r;c[s>>2]=c[p>>2];c[s+4>>2]=q;c[ka>>2]=c[r>>2];c[ka+4>>2]=c[r+4>>2];de(ka);OA(10)|0}d=b+32|0;if(!(bA(d,88,4)|0))f=23;else f=22}if((f|0)==22){je(Ia);NA(1986,t)|0;ce(T(g[d>>2]));OA(10)|0;if(xa){je(Ia);NA(1998,u)|0;ce(T(g[b+36>>2]));OA(10)|0;d=b+40|0;f=27}else f=23}if((f|0)==23){d=b+36|0;if(bA(d,92,4)|0){je(Ia);NA(1998,v)|0;ce(T(g[d>>2]));OA(10)|0}d=b+40|0;if(!(bA(d,96,8)|0))f=28;else f=27}if((f|0)==27){je(Ia);NA(2012,x)|0;u=d;v=c[u+4>>2]|0;x=w;c[x>>2]=c[u>>2];c[x+4>>2]=v;c[ka>>2]=c[w>>2];c[ka+4>>2]=c[w+4>>2];de(ka);OA(10)|0;if(xa){je(Ia);NA(2020,y)|0;A=b+48|0;f=c[A+4>>2]|0;d=z;c[d>>2]=c[A>>2];c[d+4>>2]=f;c[ka>>2]=c[z>>2];c[ka+4>>2]=c[z+4>>2];de(ka);OA(10)|0;d=b+56|0;f=32}else f=28}if((f|0)==28){d=b+48|0;if(bA(d,104,8)|0){je(Ia);NA(2020,A)|0;x=d;y=c[x+4>>2]|0;A=z;c[A>>2]=c[x>>2];c[A+4>>2]=y;c[ka>>2]=c[z>>2];c[ka+4>>2]=c[z+4>>2];de(ka);OA(10)|0}d=b+56|0;if(!(bA(d,112,8)|0))f=33;else f=32}if((f|0)==32){je(Ia);NA(2029,C)|0;z=d;A=c[z+4>>2]|0;C=B;c[C>>2]=c[z>>2];c[C+4>>2]=A;c[ka>>2]=c[B>>2];c[ka+4>>2]=c[B+4>>2];de(ka);OA(10)|0;if(xa){je(Ia);NA(2041,D)|0;F=b+64|0;f=c[F+4>>2]|0;d=E;c[d>>2]=c[F>>2];c[d+4>>2]=f;c[ka>>2]=c[E>>2];c[ka+4>>2]=c[E+4>>2];de(ka);OA(10)|0;d=b+72|0;f=37}else f=33}if((f|0)==33){d=b+64|0;if(bA(d,120,8)|0){je(Ia);NA(2041,F)|0;C=d;D=c[C+4>>2]|0;F=E;c[F>>2]=c[C>>2];c[F+4>>2]=D;c[ka>>2]=c[E>>2];c[ka+4>>2]=c[E+4>>2];de(ka);OA(10)|0}d=b+72|0;if(!(bA(d,128,8)|0))f=38;else f=37}if((f|0)==37){je(Ia);NA(2054,H)|0;E=d;F=c[E+4>>2]|0;H=G;c[H>>2]=c[E>>2];c[H+4>>2]=F;c[ka>>2]=c[G>>2];c[ka+4>>2]=c[G+4>>2];de(ka);OA(10)|0;if(xa){je(Ia);NA(2066,I)|0;I=b+80|0;O=c[I+4>>2]|0;f=N;c[f>>2]=c[I>>2];c[f+4>>2]=O;c[ka>>2]=c[N>>2];c[ka+4>>2]=c[N+4>>2];de(ka);OA(10)|0;f=42}else f=38}if((f|0)==38){d=b+80|0;if(bA(d,136,8)|0){je(Ia);NA(2066,O)|0;H=d;I=c[H+4>>2]|0;O=N;c[O>>2]=c[H>>2];c[O+4>>2]=I;c[ka>>2]=c[N>>2];c[ka+4>>2]=c[N+4>>2];de(ka);OA(10)|0}if(!(bA(b+88|0,144,48)|0))f=44;else f=42}if((f|0)==42){je(Ia);NA(2079,P)|0;N=b+96|0;P=c[N+4>>2]|0;O=J;c[O>>2]=c[N>>2];c[O+4>>2]=P;c[ka>>2]=c[J>>2];c[ka+4>>2]=c[J+4>>2];de(ka);NA(2088,Q)|0;O=b+88|0;Q=c[O+4>>2]|0;P=K;c[P>>2]=c[O>>2];c[P+4>>2]=Q;c[ka>>2]=c[K>>2];c[ka+4>>2]=c[K+4>>2];de(ka);NA(2088,R)|0;P=b+112|0;R=c[P+4>>2]|0;Q=L;c[Q>>2]=c[P>>2];c[Q+4>>2]=R;c[ka>>2]=c[L>>2];c[ka+4>>2]=c[L+4>>2];de(ka);NA(2088,S)|0;Q=b+104|0;R=c[Q+4>>2]|0;S=M;c[S>>2]=c[Q>>2];c[S+4>>2]=R;c[ka>>2]=c[M>>2];c[ka+4>>2]=c[M+4>>2];de(ka);OA(10)|0;if(xa){d=b+136|0;f=45}else f=44}if((f|0)==44){d=b+136|0;if(!(bA(d,192,48)|0))f=46;else f=45}if((f|0)==45){je(Ia);NA(2091,Y)|0;R=b+144|0;S=c[R+4>>2]|0;Y=U;c[Y>>2]=c[R>>2];c[Y+4>>2]=S;c[ka>>2]=c[U>>2];c[ka+4>>2]=c[U+4>>2];de(ka);NA(2088,Z)|0;U=d;Z=c[U+4>>2]|0;Y=V;c[Y>>2]=c[U>>2];c[Y+4>>2]=Z;c[ka>>2]=c[V>>2];c[ka+4>>2]=c[V+4>>2];de(ka);NA(2088,_)|0;Y=b+160|0;_=c[Y+4>>2]|0;Z=W;c[Z>>2]=c[Y>>2];c[Z+4>>2]=_;c[ka>>2]=c[W>>2];c[ka+4>>2]=c[W+4>>2];de(ka);NA(2088,$)|0;Z=b+152|0;_=c[Z+4>>2]|0;$=X;c[$>>2]=c[Z>>2];c[$+4>>2]=_;c[ka>>2]=c[X>>2];c[ka+4>>2]=c[X+4>>2];de(ka);OA(10)|0;if(xa)f=47;else f=46}if((f|0)==46)if(!(bA(b+184|0,240,24)|0))f=48;else f=47;if((f|0)==47){je(Ia);NA(2101,aa)|0;ce(T(g[b+188>>2]));NA(2088,ba)|0;ce(T(g[b+184>>2]));NA(2088,ca)|0;ce(T(g[b+196>>2]));NA(2088,da)|0;ce(T(g[b+192>>2]));OA(10)|0;if(xa){je(Ia);NA(2110,ea)|0;he((a[b+208>>0]|0)!=0);OA(10)|0;d=b+212|0;f=52}else f=48}if((f|0)==48){d=b+208|0;if(a[d>>0]|0){je(Ia);NA(2110,fa)|0;he((a[d>>0]|0)!=0);OA(10)|0}d=b+212|0;if(!(bA(d,268,8)|0))f=53;else f=52}if((f|0)==52){je(Ia);NA(2118,ha)|0;ea=d;fa=c[ea+4>>2]|0;ha=ga;c[ha>>2]=c[ea>>2];c[ha+4>>2]=fa;c[ka>>2]=c[ga>>2];c[ka+4>>2]=c[ga+4>>2];de(ka);OA(10)|0;if(xa){je(Ia);NA(2128,ia)|0;la=b+220|0;f=c[la+4>>2]|0;d=ja;c[d>>2]=c[la>>2];c[d+4>>2]=f;c[ka>>2]=c[ja>>2];c[ka+4>>2]=c[ja+4>>2];de(ka);OA(10)|0;d=b+228|0;f=57}else f=53}if((f|0)==53){d=b+220|0;if(bA(d,276,8)|0){je(Ia);NA(2128,la)|0;ha=d;ia=c[ha+4>>2]|0;la=ja;c[la>>2]=c[ha>>2];c[la+4>>2]=ia;c[ka>>2]=c[ja>>2];c[ka+4>>2]=c[ja+4>>2];de(ka);OA(10)|0}d=b+228|0;if(!(bA(d,284,4)|0))f=58;else f=57}if((f|0)==57){je(Ia);NA(2143,ma)|0;ie(c[d>>2]|0);OA(10)|0;if(xa){je(Ia);NA(2151,na)|0;ie(c[b+232>>2]|0);OA(10)|0;pa=b+288|0;f=62}else f=58}if((f|0)==58){d=b+232|0;if(bA(d,288,4)|0){je(Ia);NA(2151,oa)|0;ie(c[d>>2]|0);OA(10)|0}d=b+288|0;if(!(bA(d,344,4)|0))f=63;else{pa=d;f=62}}if((f|0)==62?(je(Ia),NA(2168,qa)|0,he((c[pa>>2]|0)!=0),OA(10)|0,!xa):0)f=63;if((f|0)==63?(bA(b+292|0,348,4)|0)==0:0)break;je(Ia);NA(2187,ra)|0;he((c[b+292>>2]|0)!=0);OA(10)|0}while(0);do if(Ha&2|0){if(!xa){d=b+236|0;if(bA(d,292,4)|0){je(Ia);NA(2207,ta)|0;ce(T(g[d>>2]));OA(10)|0}d=b+240|0;if(!(bA(d,296,4)|0))f=72;else f=71}else{je(Ia);NA(2207,sa)|0;ce(T(g[b+236>>2]));OA(10)|0;d=b+240|0;f=71}if((f|0)==71){je(Ia);NA(2218,ua)|0;ce(T(g[d>>2]));OA(10)|0;if(xa){je(Ia);NA(2229,va)|0;ce(T(g[b+244>>2]));OA(10)|0;d=b+248|0;f=76}else f=72}if((f|0)==72){d=b+244|0;if(bA(d,300,4)|0){je(Ia);NA(2229,wa)|0;ce(T(g[d>>2]));OA(10)|0}d=b+248|0;if(!(bA(d,304,4)|0))f=77;else f=76}if((f|0)==76){je(Ia);NA(2244,Ga)|0;ce(T(g[d>>2]));OA(10)|0;if(xa)f=78;else f=77}if((f|0)==77)if(!(bA(b+252|0,308,16)|0))f=79;else f=78;if((f|0)==78?(je(Ia),NA(2260,ya)|0,ce(T(g[b+256>>2])),NA(2088,za)|0,ce(T(g[b+252>>2])),NA(2088,Aa)|0,ce(T(g[b+264>>2])),NA(2088,Ba)|0,ce(T(g[b+260>>2])),OA(10)|0,!xa):0)f=79;if((f|0)==79?(bA(b+268|0,324,16)|0)==0:0)break;je(Ia);NA(2276,Ca)|0;ce(T(g[b+272>>2]));NA(2088,Da)|0;ce(T(g[b+268>>2]));NA(2088,Ea)|0;ce(T(g[b+280>>2]));NA(2088,Fa)|0;ce(T(g[b+276>>2]));OA(10)|0}while(0);if(Ha&4|0?Pd(b)|0:0){je(Ia);PA(3177)|0;if(Pd(b)|0){f=e+2|0;d=0;do{ke(Qd(b,d)|0,Ha,f);d=d+1|0}while(d>>>0<(Pd(b)|0)>>>0)}je(Ia);PA(3189)|0}je(e);PA(3175)|0;l=Ja;return}function le(a,b){a=a|0;b=b|0;ke(a,b,0);return}function me(){ne(6296);return}function ne(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=l;l=l+48|0;d=b+40|0;e=b+32|0;i=b+24|0;h=b+16|0;g=b+8|0;f=b;ve(a,2293);we(a)|0;xe(a)|0;c[i>>2]=1;c[i+4>>2]=0;c[h>>2]=1;c[h+4>>2]=0;c[e>>2]=c[i>>2];c[e+4>>2]=c[i+4>>2];c[d>>2]=c[h>>2];c[d+4>>2]=c[h+4>>2];ye(a,2298,e,d)|0;c[g>>2]=2;c[g+4>>2]=0;c[f>>2]=2;c[f+4>>2]=0;c[e>>2]=c[g>>2];c[e+4>>2]=c[g+4>>2];c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];ye(a,2307,e,d)|0;l=b;return}function oe(){pe(6300);return}function pe(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;b=l;l=l+48|0;d=b+40|0;e=b+32|0;i=b+24|0;h=b+16|0;g=b+8|0;f=b;ug(a,2317);vg(a)|0;wg(a)|0;xg(a)|0;c[i>>2]=3;c[i+4>>2]=0;c[h>>2]=3;c[h+4>>2]=0;c[e>>2]=c[i>>2];c[e+4>>2]=c[i+4>>2];c[d>>2]=c[h>>2];c[d+4>>2]=c[h+4>>2];yg(a,2324,e,d)|0;c[g>>2]=4;c[g+4>>2]=0;c[f>>2]=3;c[f+4>>2]=0;c[e>>2]=c[g>>2];c[e+4>>2]=c[g+4>>2];c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];Bg(a,2333,e,d)|0;l=b;return}function qe(){re(6304);return}function re(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Qa=0,Ra=0,Sa=0,Ta=0,Ua=0,Va=0,Wa=0,Xa=0,Ya=0,Za=0;b=l;l=l+816|0;d=b+808|0;k=b+624|0;Za=b+800|0;Ya=b+792|0;Xa=b+784|0;Wa=b+776|0;Va=b+768|0;Ua=b+760|0;Ta=b+752|0;Sa=b+744|0;Ra=b+736|0;Qa=b+728|0;Pa=b+720|0;Oa=b+712|0;Na=b+704|0;Ma=b+696|0;La=b+688|0;Ka=b+680|0;Ja=b+672|0;Ia=b+664|0;Ha=b+656|0;Ga=b+648|0;Fa=b+640|0;Ea=b+632|0;Da=b+616|0;Ca=b+608|0;Ba=b+600|0;Aa=b+592|0;za=b+584|0;ya=b+576|0;xa=b+568|0;wa=b+560|0;va=b+552|0;ua=b+544|0;ta=b+536|0;sa=b+528|0;ra=b+520|0;qa=b+512|0;pa=b+504|0;oa=b+496|0;na=b+488|0;ma=b+480|0;la=b+472|0;ka=b+464|0;ja=b+456|0;ia=b+448|0;ha=b+440|0;ga=b+432|0;fa=b+424|0;ea=b+416|0;da=b+408|0;ca=b+400|0;ba=b+392|0;aa=b+384|0;$=b+376|0;_=b+368|0;Z=b+360|0;Y=b+352|0;X=b+344|0;W=b+336|0;V=b+328|0;U=b+320|0;T=b+312|0;S=b+304|0;R=b+296|0;Q=b+288|0;P=b+280|0;O=b+272|0;N=b+264|0;M=b+256|0;L=b+248|0;K=b+240|0;J=b+232|0;I=b+224|0;H=b+216|0;G=b+208|0;F=b+200|0;E=b+192|0;D=b+184|0;C=b+176|0;B=b+168|0;A=b+160|0;z=b+152|0;y=b+144|0;x=b+136|0;w=b+128|0;v=b+120|0;u=b+112|0;t=b+104|0;s=b+96|0;r=b+88|0;q=b+80|0;p=b+72|0;n=b+64|0;o=b+56|0;m=b+48|0;j=b+40|0;i=b+32|0;h=b+24|0;g=b+16|0;f=b+8|0;e=b;Wi(a,2341);c[Za>>2]=5;c[Za+4>>2]=0;c[Ya>>2]=4;c[Ya+4>>2]=0;c[k>>2]=c[Za>>2];c[k+4>>2]=c[Za+4>>2];c[d>>2]=c[Ya>>2];c[d+4>>2]=c[Ya+4>>2];Xi(a,2346,k,d)|0;c[Xa>>2]=6;c[Xa+4>>2]=0;c[Wa>>2]=5;c[Wa+4>>2]=0;c[k>>2]=c[Xa>>2];c[k+4>>2]=c[Xa+4>>2];c[d>>2]=c[Wa>>2];c[d+4>>2]=c[Wa+4>>2];Xi(a,2354,k,d)|0;c[Va>>2]=7;c[Va+4>>2]=0;c[Ua>>2]=6;c[Ua+4>>2]=0;c[k>>2]=c[Va>>2];c[k+4>>2]=c[Va+4>>2];c[d>>2]=c[Ua>>2];c[d+4>>2]=c[Ua+4>>2];Xi(a,2367,k,d)|0;c[Ta>>2]=8;c[Ta+4>>2]=0;c[Sa>>2]=7;c[Sa+4>>2]=0;c[k>>2]=c[Ta>>2];c[k+4>>2]=c[Ta+4>>2];c[d>>2]=c[Sa>>2];c[d+4>>2]=c[Sa+4>>2];Xi(a,2381,k,d)|0;c[Ra>>2]=9;c[Ra+4>>2]=0;c[Qa>>2]=8;c[Qa+4>>2]=0;c[k>>2]=c[Ra>>2];c[k+4>>2]=c[Ra+4>>2];c[d>>2]=c[Qa>>2];c[d+4>>2]=c[Qa+4>>2];Xi(a,2394,k,d)|0;c[Pa>>2]=10;c[Pa+4>>2]=0;c[Oa>>2]=9;c[Oa+4>>2]=0;c[k>>2]=c[Pa>>2];c[k+4>>2]=c[Pa+4>>2];c[d>>2]=c[Oa>>2];c[d+4>>2]=c[Oa+4>>2];Xi(a,2410,k,d)|0;c[Na>>2]=10;c[Na+4>>2]=0;c[Ma>>2]=11;c[Ma+4>>2]=0;c[k>>2]=c[Na>>2];c[k+4>>2]=c[Na+4>>2];c[d>>2]=c[Ma>>2];c[d+4>>2]=c[Ma+4>>2];ij(a,2428,k,d)|0;c[La>>2]=4;c[La+4>>2]=0;c[Ka>>2]=4;c[Ka+4>>2]=0;c[k>>2]=c[La>>2];c[k+4>>2]=c[La+4>>2];c[d>>2]=c[Ka>>2];c[d+4>>2]=c[Ka+4>>2];lj(a,2441,k,d)|0;c[Ja>>2]=5;c[Ja+4>>2]=0;c[Ia>>2]=5;c[Ia+4>>2]=0;c[k>>2]=c[Ja>>2];c[k+4>>2]=c[Ja+4>>2];c[d>>2]=c[Ia>>2];c[d+4>>2]=c[Ia+4>>2];lj(a,2453,k,d)|0;c[Ha>>2]=12;c[Ha+4>>2]=0;c[Ga>>2]=13;c[Ga+4>>2]=0;c[k>>2]=c[Ha>>2];c[k+4>>2]=c[Ha+4>>2];c[d>>2]=c[Ga>>2];c[d+4>>2]=c[Ga+4>>2];ij(a,2298,k,d)|0;c[Fa>>2]=14;c[Fa+4>>2]=0;c[Ea>>2]=15;c[Ea+4>>2]=0;c[k>>2]=c[Fa>>2];c[k+4>>2]=c[Fa+4>>2];c[d>>2]=c[Ea>>2];c[d+4>>2]=c[Ea+4>>2];ij(a,2307,k,d)|0;c[Da>>2]=16;c[Da+4>>2]=0;c[Ca>>2]=17;c[Ca+4>>2]=0;c[k>>2]=c[Da>>2];c[k+4>>2]=c[Da+4>>2];c[d>>2]=c[Ca>>2];c[d+4>>2]=c[Ca+4>>2];ij(a,2467,k,d)|0;c[Ba>>2]=18;c[Ba+4>>2]=0;c[Aa>>2]=19;c[Aa+4>>2]=0;c[k>>2]=c[Ba>>2];c[k+4>>2]=c[Ba+4>>2];c[d>>2]=c[Aa>>2];c[d+4>>2]=c[Aa+4>>2];ij(a,2479,k,d)|0;c[za>>2]=20;c[za+4>>2]=0;c[ya>>2]=21;c[ya+4>>2]=0;c[k>>2]=c[za>>2];c[k+4>>2]=c[za+4>>2];c[d>>2]=c[ya>>2];c[d+4>>2]=c[ya+4>>2];ij(a,2492,k,d)|0;c[xa>>2]=22;c[xa+4>>2]=0;c[wa>>2]=23;c[wa+4>>2]=0;c[k>>2]=c[xa>>2];c[k+4>>2]=c[xa+4>>2];c[d>>2]=c[wa>>2];c[d+4>>2]=c[wa+4>>2];ij(a,2504,k,d)|0;c[va>>2]=24;c[va+4>>2]=0;c[ua>>2]=25;c[ua+4>>2]=0;c[k>>2]=c[va>>2];c[k+4>>2]=c[va+4>>2];c[d>>2]=c[ua>>2];c[d+4>>2]=c[ua+4>>2];ij(a,2517,k,d)|0;c[ta>>2]=26;c[ta+4>>2]=0;c[sa>>2]=27;c[sa+4>>2]=0;c[k>>2]=c[ta>>2];c[k+4>>2]=c[ta+4>>2];c[d>>2]=c[sa>>2];c[d+4>>2]=c[sa+4>>2];ij(a,2531,k,d)|0;c[ra>>2]=28;c[ra+4>>2]=0;c[qa>>2]=29;c[qa+4>>2]=0;c[k>>2]=c[ra>>2];c[k+4>>2]=c[ra+4>>2];c[d>>2]=c[qa>>2];c[d+4>>2]=c[qa+4>>2];ij(a,2544,k,d)|0;c[pa>>2]=30;c[pa+4>>2]=0;c[oa>>2]=31;c[oa+4>>2]=0;c[k>>2]=c[pa>>2];c[k+4>>2]=c[pa+4>>2];c[d>>2]=c[oa>>2];c[d+4>>2]=c[oa+4>>2];ij(a,2560,k,d)|0;c[na>>2]=32;c[na+4>>2]=0;c[ma>>2]=33;c[ma+4>>2]=0;c[k>>2]=c[na>>2];c[k+4>>2]=c[na+4>>2];c[d>>2]=c[ma>>2];c[d+4>>2]=c[ma+4>>2];ij(a,2575,k,d)|0;c[la>>2]=34;c[la+4>>2]=0;c[ka>>2]=35;c[ka+4>>2]=0;c[k>>2]=c[la>>2];c[k+4>>2]=c[la+4>>2];c[d>>2]=c[ka>>2];c[d+4>>2]=c[ka+4>>2];ij(a,2590,k,d)|0;c[ja>>2]=36;c[ja+4>>2]=0;c[ia>>2]=37;c[ia+4>>2]=0;c[k>>2]=c[ja>>2];c[k+4>>2]=c[ja+4>>2];c[d>>2]=c[ia>>2];c[d+4>>2]=c[ia+4>>2];ij(a,2603,k,d)|0;c[ha>>2]=38;c[ha+4>>2]=0;c[ga>>2]=39;c[ga+4>>2]=0;c[k>>2]=c[ha>>2];c[k+4>>2]=c[ha+4>>2];c[d>>2]=c[ga>>2];c[d+4>>2]=c[ga+4>>2];ij(a,2618,k,d)|0;c[fa>>2]=40;c[fa+4>>2]=0;c[ea>>2]=41;c[ea+4>>2]=0;c[k>>2]=c[fa>>2];c[k+4>>2]=c[fa+4>>2];c[d>>2]=c[ea>>2];c[d+4>>2]=c[ea+4>>2];ij(a,2632,k,d)|0;c[da>>2]=42;c[da+4>>2]=0;c[ca>>2]=43;c[ca+4>>2]=0;c[k>>2]=c[da>>2];c[k+4>>2]=c[da+4>>2];c[d>>2]=c[ca>>2];c[d+4>>2]=c[ca+4>>2];ij(a,2649,k,d)|0;c[ba>>2]=44;c[ba+4>>2]=0;c[aa>>2]=45;c[aa+4>>2]=0;c[k>>2]=c[ba>>2];c[k+4>>2]=c[ba+4>>2];c[d>>2]=c[aa>>2];c[d+4>>2]=c[aa+4>>2];ij(a,2665,k,d)|0;c[$>>2]=46;c[$+4>>2]=0;c[_>>2]=47;c[_+4>>2]=0;c[k>>2]=c[$>>2];c[k+4>>2]=c[$+4>>2];c[d>>2]=c[_>>2];c[d+4>>2]=c[_+4>>2];ij(a,2681,k,d)|0;c[Z>>2]=6;c[Z+4>>2]=0;c[Y>>2]=6;c[Y+4>>2]=0;c[k>>2]=c[Z>>2];c[k+4>>2]=c[Z+4>>2];c[d>>2]=c[Y>>2];c[d+4>>2]=c[Y+4>>2];lj(a,2695,k,d)|0;c[X>>2]=7;c[X+4>>2]=0;c[W>>2]=7;c[W+4>>2]=0;c[k>>2]=c[X>>2];c[k+4>>2]=c[X+4>>2];c[d>>2]=c[W>>2];c[d+4>>2]=c[W+4>>2];lj(a,2709,k,d)|0;c[V>>2]=8;c[V+4>>2]=0;c[U>>2]=8;c[U+4>>2]=0;c[k>>2]=c[V>>2];c[k+4>>2]=c[V+4>>2];c[d>>2]=c[U>>2];c[d+4>>2]=c[U+4>>2];lj(a,2722,k,d)|0;c[T>>2]=9;c[T+4>>2]=0;c[S>>2]=9;c[S+4>>2]=0;c[k>>2]=c[T>>2];c[k+4>>2]=c[T+4>>2];c[d>>2]=c[S>>2];c[d+4>>2]=c[S+4>>2];lj(a,2738,k,d)|0;c[R>>2]=10;c[R+4>>2]=0;c[Q>>2]=10;c[Q+4>>2]=0;c[k>>2]=c[R>>2];c[k+4>>2]=c[R+4>>2];c[d>>2]=c[Q>>2];c[d+4>>2]=c[Q+4>>2];lj(a,2753,k,d)|0;c[P>>2]=11;c[P+4>>2]=0;c[O>>2]=11;c[O+4>>2]=0;c[k>>2]=c[P>>2];c[k+4>>2]=c[P+4>>2];c[d>>2]=c[O>>2];c[d+4>>2]=c[O+4>>2];lj(a,2768,k,d)|0;c[N>>2]=11;c[N+4>>2]=0;c[M>>2]=48;c[M+4>>2]=0;c[k>>2]=c[N>>2];c[k+4>>2]=c[N+4>>2];c[d>>2]=c[M>>2];c[d+4>>2]=c[M+4>>2];kk(a,2781,k,d)|0;c[L>>2]=12;c[L+4>>2]=0;c[K>>2]=49;c[K+4>>2]=0;c[k>>2]=c[L>>2];c[k+4>>2]=c[L+4>>2];c[d>>2]=c[K>>2];c[d+4>>2]=c[K+4>>2];nk(a,2792,k,d)|0;c[J>>2]=50;c[J+4>>2]=0;c[I>>2]=51;c[I+4>>2]=0;c[k>>2]=c[J>>2];c[k+4>>2]=c[J+4>>2];c[d>>2]=c[I>>2];c[d+4>>2]=c[I+4>>2];ij(a,2801,k,d)|0;c[H>>2]=52;c[H+4>>2]=0;c[G>>2]=53;c[G+4>>2]=0;c[k>>2]=c[H>>2];c[k+4>>2]=c[H+4>>2];c[d>>2]=c[G>>2];c[d+4>>2]=c[G+4>>2];ij(a,2812,k,d)|0;c[F>>2]=13;c[F+4>>2]=0;c[E>>2]=54;c[E+4>>2]=0;c[k>>2]=c[F>>2];c[k+4>>2]=c[F+4>>2];c[d>>2]=c[E>>2];c[d+4>>2]=c[E+4>>2];Xi(a,2827,k,d)|0;c[D>>2]=14;c[D+4>>2]=0;c[C>>2]=55;c[C+4>>2]=0;c[k>>2]=c[D>>2];c[k+4>>2]=c[D+4>>2];c[d>>2]=c[C>>2];c[d+4>>2]=c[C+4>>2];Xi(a,2836,k,d)|0;c[B>>2]=12;c[B+4>>2]=0;c[d>>2]=c[B>>2];c[d+4>>2]=c[B+4>>2];yk(a,2852,d)|0;c[A>>2]=13;c[A+4>>2]=0;c[d>>2]=c[A>>2];c[d+4>>2]=c[A+4>>2];yk(a,2867,d)|0;c[z>>2]=14;c[z+4>>2]=0;c[d>>2]=c[z>>2];c[d+4>>2]=c[z+4>>2];yk(a,2883,d)|0;c[y>>2]=15;c[y+4>>2]=0;c[d>>2]=c[y>>2];c[d+4>>2]=c[y+4>>2];yk(a,2897,d)|0;c[x>>2]=16;c[x+4>>2]=0;c[d>>2]=c[x>>2];c[d+4>>2]=c[x+4>>2];yk(a,2910,d)|0;c[w>>2]=17;c[w+4>>2]=0;c[d>>2]=c[w>>2];c[d+4>>2]=c[w+4>>2];yk(a,2930,d)|0;c[v>>2]=18;c[v+4>>2]=0;c[d>>2]=c[v>>2];c[d+4>>2]=c[v+4>>2];yk(a,2951,d)|0;c[u>>2]=19;c[u+4>>2]=0;c[d>>2]=c[u>>2];c[d+4>>2]=c[u+4>>2];yk(a,2970,d)|0;c[t>>2]=20;c[t+4>>2]=0;c[d>>2]=c[t>>2];c[d+4>>2]=c[t+4>>2];yk(a,2992,d)|0;c[s>>2]=21;c[s+4>>2]=0;c[d>>2]=c[s>>2];c[d+4>>2]=c[s+4>>2];yk(a,3013,d)|0;c[r>>2]=22;c[r+4>>2]=0;c[d>>2]=c[r>>2];c[d+4>>2]=c[r+4>>2];yk(a,3035,d)|0;c[q>>2]=23;c[q+4>>2]=0;c[d>>2]=c[q>>2];c[d+4>>2]=c[q+4>>2];yk(a,3055,d)|0;Lk(a)|0;c[p>>2]=56;c[p+4>>2]=0;c[d>>2]=c[p>>2];c[d+4>>2]=c[p+4>>2];Mk(a,3078,d)|0;c[n>>2]=57;c[n+4>>2]=0;c[d>>2]=c[n>>2];c[d+4>>2]=c[n+4>>2];Ok(a,3089,d)|0;Qk(k,a);n=c[k+4>>2]|0;c[o>>2]=1;c[o+4>>2]=0;c[d>>2]=c[o>>2];c[d+4>>2]=c[o+4>>2];Rk(n,3101,d)|0;Tk(k,a);k=c[k+4>>2]|0;c[m>>2]=1;c[m+4>>2]=0;c[d>>2]=c[m>>2];c[d+4>>2]=c[m+4>>2];Uk(k,3101,d,3108)|0;c[j>>2]=58;c[j+4>>2]=0;c[d>>2]=c[j>>2];c[d+4>>2]=c[j+4>>2];Wk(a,3124,d)|0;c[i>>2]=2;c[i+4>>2]=0;c[d>>2]=c[i>>2];c[d+4>>2]=c[i+4>>2];Yk(a,3128,d)|0;c[h>>2]=59;c[h+4>>2]=0;c[d>>2]=c[h>>2];c[d+4>>2]=c[h+4>>2];Wk(a,3135,d)|0;c[g>>2]=3;c[g+4>>2]=0;c[d>>2]=c[g>>2];c[d+4>>2]=c[g+4>>2];$k(a,3142,d)|0;c[f>>2]=15;c[f+4>>2]=0;c[d>>2]=c[f>>2];c[d+4>>2]=c[f+4>>2];bl(a,3150,d)|0;c[e>>2]=25;c[e+4>>2]=0;c[d>>2]=c[e>>2];c[d+4>>2]=c[e+4>>2];dl(a,3167,d)|0;l=b;return}function se(a){a=a|0;return (c[a+4>>2]|0)==1|0}function te(a){a=a|0;return T(g[a>>2])}function ue(a){a=T(a);return (g[j>>2]=a,c[j>>2]|0)|0}function ve(a,b){a=a|0;b=b|0;var d=0;d=De()|0;c[a>>2]=d;Ee(d,b);Vt(c[a>>2]|0);return}function we(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,Ve()|0);return a|0}function xe(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,sf()|0);return a|0}function ye(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];Hf(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];If(a,b,g);l=f;return a|0}function ze(a){a=a|0;return T(g[a>>2])}function Ae(a,b){a=a|0;b=T(b);g[a>>2]=b;return}function Be(a){a=a|0;return T(g[a+4>>2])}function Ce(a,b){a=a|0;b=T(b);g[a+4>>2]=b;return}function De(){var b=0;if(!(a[5848]|0)){Fe(6308);xa(26,6308,o|0)|0;b=5848;c[b>>2]=1;c[b+4>>2]=0}return 6308}function Ee(a,b){a=a|0;b=b|0;c[a>>2]=Me()|0;c[a+4>>2]=Ne()|0;c[a+12>>2]=b;c[a+8>>2]=Oe()|0;c[a+32>>2]=1;return}function Fe(a){a=a|0;He(a);return}function Ge(a){a=a|0;Ie(a+24|0);Je(a+16|0);return}function He(b){b=b|0;var d=0;c[b+16>>2]=0;c[b+20>>2]=0;d=b+24|0;c[d>>2]=0;c[b+28>>2]=d;c[b+36>>2]=0;a[b+40>>0]=0;a[b+41>>0]=0;return}function Ie(a){a=a|0;Ke(a);return}function Je(a){a=a|0;Le(a);return}function Ke(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if(b|0)do{d=b;b=c[b>>2]|0;aB(d)}while((b|0)!=0);c[a>>2]=0;return}function Le(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if(b|0)do{d=b;b=c[b>>2]|0;aB(d)}while((b|0)!=0);c[a>>2]=0;return}function Me(){return 8656}function Ne(){return 424}function Oe(){return Qe()|0}function Pe(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if((Se(d,896)|0)==512){if(c|0){Te(c);aB(c)}}else if(b|0)aB(b);return}function Qe(){var b=0;if(!(a[5856]|0)){c[1588]=Re()|0;c[1589]=0;b=5856;c[b>>2]=1;c[b+4>>2]=0}return 6352}function Re(){return 0}function Se(a,b){a=a|0;b=b|0;return b&a|0}function Te(a){a=a|0;a=c[a+4>>2]|0;if(a|0)YA(a);return}function Ue(a,b){a=a|0;b=b|0;We(a,0,b,0,0,0);return}function Ve(){var b=0;if(!(a[5864]|0)){_e(6360);xa(27,6360,o|0)|0;b=5864;c[b>>2]=1;c[b+4>>2]=0}if(!(af(6360)|0))_e(6360);return 6360}function We(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0;h=l;l=l+32|0;o=h+24|0;n=h+20|0;j=h+16|0;m=h+12|0;k=h+8|0;i=h+4|0;p=h;c[n>>2]=b;c[j>>2]=d;c[m>>2]=e;c[k>>2]=f;c[i>>2]=g;g=a+28|0;c[p>>2]=c[g>>2];c[o>>2]=c[p>>2];Xe(a+24|0,o,n,m,k,j,i)|0;c[g>>2]=c[c[g>>2]>>2];l=h;return}function Xe(a,b,d,e,f,g,h){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;a=Ye(b)|0;b=_A(24)|0;Ze(b+4|0,c[d>>2]|0,c[e>>2]|0,c[f>>2]|0,c[g>>2]|0,c[h>>2]|0);c[b>>2]=c[a>>2];c[a>>2]=b;return b|0}function Ye(a){a=a|0;return c[a>>2]|0}function Ze(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;c[a>>2]=b;c[a+4>>2]=d;c[a+8>>2]=e;c[a+12>>2]=f;c[a+16>>2]=g;return}function _e(a){a=a|0;bf(a);cf(a,28);return}function $e(a){a=a|0;rf(a+24|0);return}function af(a){a=a|0;return c[a>>2]|0}function bf(a){a=a|0;var b=0;b=ff()|0;hf(a,5,1,b,gf()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function cf(a,b){a=a|0;b=b|0;c[a+20>>2]=b;return}function df(a){a=a|0;pf(a);return}function ef(){return jf()|0}function ff(){return 6396}function gf(){return 460}function hf(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;c[a>>2]=b;c[a+4>>2]=d;c[a+8>>2]=e;c[a+12>>2]=f;c[a+16>>2]=g;return}function jf(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0;b=l;l=l+16|0;f=b+4|0;h=b;d=Bw(8)|0;a=d;e=_A(8)|0;kf(e);g=a+4|0;c[g>>2]=e;e=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];lf(e,g,f);c[d>>2]=e;l=b;return a|0}function kf(a){a=a|0;Cf(a,T(0.0),T(0.0));return}function lf(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;d=_A(16)|0;c[d+4>>2]=0;c[d+8>>2]=0;c[d>>2]=440;c[d+12>>2]=b;c[a+4>>2]=d;return}function mf(a){a=a|0;RA(a);aB(a);return}function nf(a){a=a|0;a=c[a+12>>2]|0;if(a|0)aB(a);return}function of(a){a=a|0;aB(a);return}function pf(a){a=a|0;qf(a);return}function qf(b){b=b|0;kf(b+4|0);a[b+12>>0]=1;return}function rf(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function sf(){var b=0;if(!(a[5872]|0)){tf(6400);xa(29,6400,o|0)|0;b=5872;c[b>>2]=1;c[b+4>>2]=0}if(!(af(6400)|0))tf(6400);return 6400}function tf(a){a=a|0;vf(a);cf(a,1);return}function uf(a){a=a|0;Gf(a+24|0);return}function vf(a){a=a|0;var b=0;b=ff()|0;hf(a,5,1,b,yf()|0,2);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function wf(a,b,c){a=a|0;b=+b;c=+c;Ef(a,b,c);return}function xf(a,b){a=+a;b=+b;return zf(a,b)|0}function yf(){return 464}function zf(a,b){a=+a;b=+b;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=fb;e=l;l=l+16|0;h=e+4|0;i=e+8|0;j=e;f=Bw(8)|0;d=f;g=_A(8)|0;Af(h,a);k=T(Bf(h,a));Af(i,b);Cf(g,k,T(Bf(i,b)));i=d+4|0;c[i>>2]=g;g=_A(8)|0;i=c[i>>2]|0;c[j>>2]=0;c[h>>2]=c[j>>2];lf(g,i,h);c[f>>2]=g;l=e;return d|0}function Af(a,b){a=a|0;b=+b;return}function Bf(a,b){a=a|0;b=+b;return T(Df(b))}function Cf(a,b,c){a=a|0;b=T(b);c=T(c);g[a>>2]=b;g[a+4>>2]=c;return}function Df(a){a=+a;return T(a)}function Ef(a,b,c){a=a|0;b=+b;c=+c;var d=0,e=0,f=0,h=0,i=0;d=l;l=l+16|0;f=d+4|0;i=d+9|0;e=d;h=d+8|0;Af(i,b);g[f>>2]=T(Bf(i,b));Af(h,c);g[e>>2]=T(Bf(h,c));Ff(a,f,e);l=d;return}function Ff(b,c,d){b=b|0;c=c|0;d=d|0;var e=fb;e=T(g[c>>2]);Cf(b+4|0,e,T(g[d>>2]));a[b+12>>0]=1;return}function Gf(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function Hf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Jf(a,d,f,0);l=e;return}function If(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];bg(a,d,f,0);l=e;return}function Jf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Lf()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Mf(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Nf(g,e)|0,e);l=f;return}function Kf(a){a=a|0;return a|0}function Lf(){var b=0,d=0;if(!(a[5880]|0)){Of(6436);xa(30,6436,o|0)|0;d=5880;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6436)|0)){b=6436;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Of(6436)}return 6436}function Mf(a){a=a|0;return 0}function Nf(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Lf()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Yf(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Xf(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Of(a){a=a|0;Qf(a);return}function Pf(a){a=a|0;Vf(a+24|0);return}function Qf(a){a=a|0;var b=0;b=ff()|0;hf(a,4,1,b,Sf()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Rf(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=Tf(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Uf(b,f,d);l=e;return}function Sf(){return 476}function Tf(a){a=a|0;return (c[(Lf()|0)+24>>2]|0)+(a*12|0)|0}function Uf(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,h=fb;g=l;l=l+16|0;f=g;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;Af(f,d);h=T(Bf(f,d));vb[e&15](a,h);l=g;return}function Vf(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Wf(a,b){a=a|0;b=b|0;return b|a|0}function Xf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=ag(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Zf(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Yf(g,e,d);c[j>>2]=(c[j>>2]|0)+12;_f(a,i);$f(i);l=k;return}}function Yf(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Zf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function _f(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function $f(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function ag(a){a=a|0;return 357913941}function bg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=cg()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=dg(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,eg(g,e)|0,e);l=f;return}function cg(){var b=0,d=0;if(!(a[5888]|0)){fg(6472);xa(31,6472,o|0)|0;d=5888;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6472)|0)){b=6472;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));fg(6472)}return 6472}function dg(a){a=a|0;return 0}function eg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=cg()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];pg(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{og(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function fg(a){a=a|0;hg(a);return}function gg(a){a=a|0;ng(a+24|0);return}function hg(a){a=a|0;var b=0;b=ff()|0;hf(a,3,1,b,jg()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function ig(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=kg(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];d=+lg(b,f);l=e;return +d}function jg(){return 484}function kg(a){a=a|0;return (c[(cg()|0)+24>>2]|0)+(a*12|0)|0}function lg(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;return +(+mg(T(hb[d&31](a))))}function mg(a){a=T(a);return +(+a)}function ng(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function og(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=tg(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;qg(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];pg(g,e,d);c[j>>2]=(c[j>>2]|0)+12;rg(a,i);sg(i);l=k;return}}function pg(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function qg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function rg(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function sg(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function tg(a){a=a|0;return 357913941}function ug(a,b){a=a|0;b=b|0;var d=0;d=Eg()|0;c[a>>2]=d;Fg(d,b);Vt(c[a>>2]|0);return}function vg(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,Mg()|0);return a|0}function wg(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,ah()|0);return a|0}function xg(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,mh()|0);return a|0}function yg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];Bh(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];Ch(a,b,g);l=f;return a|0}function zg(a){a=a|0;return T(g[a>>2])}function Ag(a,b){a=a|0;b=T(b);g[a>>2]=b;return}function Bg(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];ji(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];ki(a,b,g);l=f;return a|0}function Cg(a){a=a|0;return c[a+4>>2]|0}function Dg(a,b){a=a|0;b=b|0;c[a+4>>2]=b;return}function Eg(){var b=0;if(!(a[5896]|0)){Gg(6508);xa(26,6508,o|0)|0;b=5896;c[b>>2]=1;c[b+4>>2]=0}return 6508}function Fg(a,b){a=a|0;b=b|0;c[a>>2]=Hg()|0;c[a+4>>2]=Ig()|0;c[a+12>>2]=b;c[a+8>>2]=Jg()|0;c[a+32>>2]=2;return}function Gg(a){a=a|0;He(a);return}function Hg(){return 8659}function Ig(){return 488}function Jg(){return Qe()|0}function Kg(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if((Se(d,896)|0)==512){if(c|0){Lg(c);aB(c)}}else if(b|0)aB(b);return}function Lg(a){a=a|0;a=c[a+4>>2]|0;if(a|0)YA(a);return}function Mg(){var b=0;if(!(a[5904]|0)){Ng(6552);xa(32,6552,o|0)|0;b=5904;c[b>>2]=1;c[b+4>>2]=0}if(!(af(6552)|0))Ng(6552);return 6552}function Ng(a){a=a|0;Pg(a);cf(a,33);return}function Og(a){a=a|0;$g(a+24|0);return}function Pg(a){a=a|0;var b=0;b=ff()|0;hf(a,5,2,b,Sg()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Qg(a){a=a|0;Zg(a);return}function Rg(){return Tg()|0}function Sg(){return 524}function Tg(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0;b=l;l=l+16|0;f=b+4|0;h=b;d=Bw(8)|0;a=d;e=_A(8)|0;Ug(e);g=a+4|0;c[g>>2]=e;e=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];Vg(e,g,f);c[d>>2]=e;l=b;return a|0}function Ug(a){a=a|0;wh(a,T(0.0),1);return}function Vg(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;d=_A(16)|0;c[d+4>>2]=0;c[d+8>>2]=0;c[d>>2]=504;c[d+12>>2]=b;c[a+4>>2]=d;return}function Wg(a){a=a|0;RA(a);aB(a);return}function Xg(a){a=a|0;a=c[a+12>>2]|0;if(a|0)aB(a);return}function Yg(a){a=a|0;aB(a);return}function Zg(a){a=a|0;_g(a);return}function _g(b){b=b|0;Ug(b+4|0);a[b+12>>0]=1;return}function $g(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function ah(){var b=0;if(!(a[5912]|0)){bh(6588);xa(34,6588,o|0)|0;b=5912;c[b>>2]=1;c[b+4>>2]=0}if(!(af(6588)|0))bh(6588);return 6588}function bh(a){a=a|0;dh(a);cf(a,1);return}function ch(a){a=a|0;lh(a+24|0);return}function dh(a){a=a|0;var b=0;b=ff()|0;hf(a,5,1,b,gh()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function eh(a,b){a=a|0;b=+b;jh(a,b);return}function fh(a){a=+a;return hh(a)|0}function gh(){return 528}function hh(a){a=+a;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;d=l;l=l+16|0;g=d+4|0;i=d;e=Bw(8)|0;b=e;f=_A(8)|0;Af(g,a);ih(f,T(Bf(g,a)));h=b+4|0;c[h>>2]=f;f=_A(8)|0;h=c[h>>2]|0;c[i>>2]=0;c[g>>2]=c[i>>2];Vg(f,h,g);c[e>>2]=f;l=d;return b|0}function ih(a,b){a=a|0;b=T(b);wh(a,b,1);return}function jh(a,b){a=a|0;b=+b;var c=0,d=0,e=0;c=l;l=l+16|0;d=c;e=c+4|0;Af(e,b);g[d>>2]=T(Bf(e,b));kh(a,d);l=c;return}function kh(b,c){b=b|0;c=c|0;ih(b+4|0,T(g[c>>2]));a[b+12>>0]=1;return}function lh(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function mh(){var b=0;if(!(a[5920]|0)){nh(6624);xa(35,6624,o|0)|0;b=5920;c[b>>2]=1;c[b+4>>2]=0}if(!(af(6624)|0))nh(6624);return 6624}function nh(a){a=a|0;ph(a);cf(a,1);return}function oh(a){a=a|0;Ah(a+24|0);return}function ph(a){a=a|0;var b=0;b=ff()|0;hf(a,5,1,b,sh()|0,2);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function qh(a,b,c){a=a|0;b=+b;c=c|0;yh(a,b,c);return}function rh(a,b){a=+a;b=b|0;return th(a,b)|0}function sh(){return 536}function th(a,b){a=+a;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=fb;e=l;l=l+16|0;g=e+4|0;h=e+8|0;i=e;f=Bw(8)|0;d=f;j=_A(8)|0;Af(g,a);k=T(Bf(g,a));uh(h,b);wh(j,k,vh(h,b)|0);h=d+4|0;c[h>>2]=j;b=_A(8)|0;h=c[h>>2]|0;c[i>>2]=0;c[g>>2]=c[i>>2];Vg(b,h,g);c[f>>2]=b;l=e;return d|0}function uh(a,b){a=a|0;b=b|0;return}function vh(a,b){a=a|0;b=b|0;return xh(b)|0}function wh(a,b,d){a=a|0;b=T(b);d=d|0;g[a>>2]=b;c[a+4>>2]=d;return}function xh(a){a=a|0;return a|0}function yh(a,b,d){a=a|0;b=+b;d=d|0;var e=0,f=0,h=0,i=0,j=0;e=l;l=l+16|0;h=e+4|0;j=e+9|0;f=e;i=e+8|0;Af(j,b);g[h>>2]=T(Bf(j,b));uh(i,d);c[f>>2]=vh(i,d)|0;zh(a,h,f);l=e;return}function zh(b,d,e){b=b|0;d=d|0;e=e|0;var f=fb;f=T(g[d>>2]);wh(b+4|0,f,c[e>>2]|0);a[b+12>>0]=1;return}function Ah(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function Bh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Dh(a,d,f,0);l=e;return}function Ch(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Uh(a,d,f,0);l=e;return}function Dh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Eh()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Fh(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Gh(g,e)|0,e);l=f;return}function Eh(){var b=0,d=0;if(!(a[5928]|0)){Hh(6660);xa(36,6660,o|0)|0;d=5928;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6660)|0)){b=6660;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Hh(6660)}return 6660}function Fh(a){a=a|0;return 0}function Gh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Eh()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Ph(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Oh(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Hh(a){a=a|0;Jh(a);return}function Ih(a){a=a|0;Nh(a+24|0);return}function Jh(a){a=a|0;var b=0;b=ff()|0;hf(a,4,2,b,Sf()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Kh(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=Lh(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Mh(b,f,d);l=e;return}function Lh(a){a=a|0;return (c[(Eh()|0)+24>>2]|0)+(a*12|0)|0}function Mh(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,h=fb;g=l;l=l+16|0;f=g;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;Af(f,d);h=T(Bf(f,d));vb[e&15](a,h);l=g;return}function Nh(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Oh(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Th(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Qh(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Ph(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Rh(a,i);Sh(i);l=k;return}}function Ph(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Qh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Rh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Sh(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Th(a){a=a|0;return 357913941}function Uh(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Vh()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Wh(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Xh(g,e)|0,e);l=f;return}function Vh(){var b=0,d=0;if(!(a[5936]|0)){Yh(6696);xa(37,6696,o|0)|0;d=5936;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6696)|0)){b=6696;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Yh(6696)}return 6696}function Wh(a){a=a|0;return 0}function Xh(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Vh()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];ei(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{di(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Yh(a){a=a|0;_h(a);return}function Zh(a){a=a|0;ci(a+24|0);return}function _h(a){a=a|0;var b=0;b=ff()|0;hf(a,3,2,b,jg()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function $h(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=ai(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];d=+bi(b,f);l=e;return +d}function ai(a){a=a|0;return (c[(Vh()|0)+24>>2]|0)+(a*12|0)|0}function bi(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;return +(+mg(T(hb[d&31](a))))}function ci(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function di(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=ii(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;fi(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];ei(g,e,d);c[j>>2]=(c[j>>2]|0)+12;gi(a,i);hi(i);l=k;return}}function ei(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function fi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function gi(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function hi(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function ii(a){a=a|0;return 357913941}function ji(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];li(a,d,f,0);l=e;return}function ki(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Di(a,d,f,0);l=e;return}function li(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=mi()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=ni(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,oi(g,e)|0,e);l=f;return}function mi(){var b=0,d=0;if(!(a[5944]|0)){pi(6732);xa(38,6732,o|0)|0;d=5944;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6732)|0)){b=6732;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));pi(6732)}return 6732}function ni(a){a=a|0;return 0}function oi(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=mi()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];yi(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{xi(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function pi(a){a=a|0;ri(a);return}function qi(a){a=a|0;wi(a+24|0);return}function ri(a){a=a|0;var b=0;b=ff()|0;hf(a,4,4,b,ti()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function si(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=ui(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];vi(b,f,d);l=e;return}function ti(){return 548}function ui(a){a=a|0;return (c[(mi()|0)+24>>2]|0)+(a*12|0)|0}function vi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;g=l;l=l+16|0;f=g;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;uh(f,d);f=vh(f,d)|0;yb[e&63](a,f);l=g;return}function wi(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function xi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Ci(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;zi(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];yi(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Ai(a,i);Bi(i);l=k;return}}function yi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function zi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Ai(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Bi(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Ci(a){a=a|0;return 357913941}function Di(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Ei()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Fi(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Gi(g,e)|0,e);l=f;return}function Ei(){var b=0,d=0;if(!(a[5952]|0)){Hi(6768);xa(39,6768,o|0)|0;d=5952;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6768)|0)){b=6768;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Hi(6768)}return 6768}function Fi(a){a=a|0;return 0}function Gi(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Ei()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Ri(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Qi(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Hi(a){a=a|0;Ji(a);return}function Ii(a){a=a|0;Pi(a+24|0);return}function Ji(a){a=a|0;var b=0;b=ff()|0;hf(a,3,2,b,Li()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Ki(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=l;l=l+16|0;e=d+8|0;f=d;g=Mi(a)|0;a=c[g+4>>2]|0;c[f>>2]=c[g>>2];c[f+4>>2]=a;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];b=Ni(b,e)|0;l=d;return b|0}function Li(){return 556}function Mi(a){a=a|0;return (c[(Ei()|0)+24>>2]|0)+(a*12|0)|0}function Ni(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;return Oi(nb[d&31](a)|0)|0}function Oi(a){a=a|0;return a|0}function Pi(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Qi(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Vi(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Si(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Ri(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Ti(a,i);Ui(i);l=k;return}}function Ri(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Si(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Ti(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Ui(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Vi(a){a=a|0;return 357913941}function Wi(a,b){a=a|0;b=b|0;var d=0;d=fl()|0;c[a>>2]=d;gl(d,b);Vt(c[a>>2]|0);return}function Xi(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];rl(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];sl(a,b,g);l=f;return a|0}function Yi(a){a=a|0;return _b(c[a>>2]|0)|0}function Zi(a,b){a=a|0;b=b|0;$b(c[a>>2]|0,b);return}function _i(a){a=a|0;return ac(c[a>>2]|0)|0}function $i(a,b){a=a|0;b=b|0;bc(c[a>>2]|0,b);return}function aj(a){a=a|0;return cc(c[a>>2]|0)|0}function bj(a,b){a=a|0;b=b|0;dc(c[a>>2]|0,b);return}function cj(a){a=a|0;return ec(c[a>>2]|0)|0}function dj(a,b){a=a|0;b=b|0;fc(c[a>>2]|0,b);return}function ej(a){a=a|0;return gc(c[a>>2]|0)|0}function fj(a,b){a=a|0;b=b|0;hc(c[a>>2]|0,b);return}function gj(a){a=a|0;return ic(c[a>>2]|0)|0}function hj(a,b){a=a|0;b=b|0;jc(c[a>>2]|0,b);return}function ij(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];$l(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];am(a,b,g);l=f;return a|0}function jj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;kc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function kj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];lc(a,e);l=d;return}function lj(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];Pm(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];Qm(a,b,g);l=f;return a|0}function mj(a){a=a|0;return T(mc(c[a>>2]|0))}function nj(a,b){a=a|0;b=T(b);nc(c[a>>2]|0,b);return}function oj(a){a=a|0;return T(oc(c[a>>2]|0))}function pj(a,b){a=a|0;b=T(b);pc(c[a>>2]|0,b);return}function qj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;qc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function rj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];rc(a,e);l=d;return}function sj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;sc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function tj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];tc(a,e);l=d;return}function uj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;uc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function vj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];vc(a,e);l=d;return}function wj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;wc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function xj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];xc(a,e);l=d;return}function yj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;yc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function zj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];zc(a,e);l=d;return}function Aj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Ac(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Bj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Bc(a,e);l=d;return}function Cj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Cc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Dj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Dc(a,e);l=d;return}function Ej(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Ec(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Fj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Fc(a,e);l=d;return}function Gj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Gc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Hj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Hc(a,e);l=d;return}function Ij(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Ic(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Jj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Jc(a,e);l=d;return}function Kj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Kc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Lj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Lc(a,e);l=d;return}function Mj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Mc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Nj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Nc(a,e);l=d;return}function Oj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Oc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Pj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Pc(a,e);l=d;return}function Qj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Qc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Rj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Rc(a,e);l=d;return}function Sj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Sc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Tj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Tc(a,e);l=d;return}function Uj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Uc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Vj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Vc(a,e);l=d;return}function Wj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Wc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Xj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Xc(a,e);l=d;return}function Yj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;Yc(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function Zj(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Zc(a,e);l=d;return}function _j(a){a=a|0;return T(_c(c[a>>2]|0))}function $j(a,b){a=a|0;b=T(b);$c(c[a>>2]|0,b);return}function ak(a){a=a|0;return T(ad(c[a>>2]|0))}function bk(a,b){a=a|0;b=T(b);bd(c[a>>2]|0,b);return}function ck(a){a=a|0;return T(cd(c[a>>2]|0))}function dk(a,b){a=a|0;b=T(b);dd(c[a>>2]|0,b);return}function ek(a){a=a|0;return T(ed(c[a>>2]|0))}function fk(a,b){a=a|0;b=T(b);fd(c[a>>2]|0,b);return}function gk(a){a=a|0;return T(gd(c[a>>2]|0))}function hk(a,b){a=a|0;b=T(b);hd(c[a>>2]|0,b);return}function ik(a){a=a|0;return T(id(c[a>>2]|0))}function jk(a,b){a=a|0;b=T(b);jd(c[a>>2]|0,b);return}function kk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];yn(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];zn(a,b,g);l=f;return a|0}function lk(a){a=a|0;return kd(c[a>>2]|0)|0}function mk(a,b){a=a|0;b=b|0;ld(c[a>>2]|0,b);return}function nk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0;f=l;l=l+32|0;g=f+16|0;j=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;k=c[e+4>>2]|0;c[j>>2]=c[e>>2];c[j+4>>2]=k;c[g>>2]=c[j>>2];c[g+4>>2]=c[j+4>>2];no(a,b,g);c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];oo(a,b,g);l=f;return a|0}function ok(a){a=a|0;return od(c[a>>2]|0)|0}function pk(a,b){a=a|0;b=b|0;pd(c[a>>2]|0,b);return}function qk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;qd(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function rk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];rd(a,e);l=d;return}function sk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d;sd(f,c[b>>2]|0);e=c[f+4>>2]|0;b=a;c[b>>2]=c[f>>2];c[b+4>>2]=e;l=d;return}function tk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;d=l;l=l+16|0;e=d+8|0;f=d;a=c[a>>2]|0;h=b;g=c[h+4>>2]|0;b=f;c[b>>2]=c[h>>2];c[b+4>>2]=g;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];td(a,e);l=d;return}function uk(a){a=a|0;return ud(c[a>>2]|0)|0}function vk(a,b){a=a|0;b=b|0;vd(c[a>>2]|0,b);return}function wk(a){a=a|0;return wd(c[a>>2]|0)|0}function xk(a,b){a=a|0;b=b|0;xd(c[a>>2]|0,b);return}function yk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Qm(a,b,f);We(c[a>>2]|0,c[212]|0,0,0,0,0);l=e;return a|0}function zk(a){a=a|0;return T(yd(c[a>>2]|0))}function Ak(a){a=a|0;return T(zd(c[a>>2]|0))}function Bk(a){a=a|0;return T(Ad(c[a>>2]|0))}function Ck(a){a=a|0;return T(Bd(c[a>>2]|0))}function Dk(a){a=a|0;return T(Cd(c[a>>2]|0))}function Ek(a){a=a|0;return T(Dd(c[a>>2]|0))}function Fk(a){a=a|0;return T(Ed(c[a>>2]|0))}function Gk(a){a=a|0;return T(Fd(c[a>>2]|0))}function Hk(a){a=a|0;return T(Gd(c[a>>2]|0))}function Ik(a){a=a|0;return T(Hd(c[a>>2]|0))}function Jk(a){a=a|0;return T(Id(c[a>>2]|0))}function Kk(a){a=a|0;return T(Jd(c[a>>2]|0))}function Lk(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,bp()|0);return a|0}function Mk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];rp(a,b,f);l=e;return a|0}function Nk(a,b){a=a|0;b=b|0;rq(a+16|0,b)|0;md(c[a>>2]|0,c[b+16>>2]|0?5:0);return}function Ok(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];vq(a,b,f);l=e;return a|0}function Pk(a,b){a=a|0;b=b|0;mr(a+40|0,b)|0;nd(c[a>>2]|0,c[b+16>>2]|0?2:0);return}function Qk(a,b){a=a|0;b=b|0;qr(a,b);return}function Rk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;a=c[a>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];d=rr(a,b,f)|0;l=e;return d|0}function Sk(a,b,c){a=a|0;b=T(b);c=T(c);Vk(a,b,c,T(1.0));return}function Tk(a,b){a=a|0;b=b|0;Lr(a,b);return}function Uk(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=l;l=l+16|0;g=f+8|0;h=f;i=c[d+4>>2]|0;a=c[a>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=i;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];e=Mr(a,b,g,e)|0;l=f;return e|0}function Vk(a,b,d,e){a=a|0;b=T(b);d=T(d);e=T(e);Yd(c[a>>2]|0,b,d,e);return}function Wk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];fs(a,b,f);l=e;return a|0}function Xk(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=a+8|0;d=c[f>>2]|0;if((d|0)==(c[a+12>>2]|0))Bs(a+4|0,b);else{c[d>>2]=c[b>>2];e=c[b+4>>2]|0;c[d+4>>2]=e;if(e){XA(e);d=c[f>>2]|0}c[f>>2]=d+8}ae(c[a>>2]|0,c[c[b>>2]>>2]|0);return}function Yk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Gs(a,b,f);l=e;return a|0}function Zk(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+4|0;h=e;g=a+4|0;c[h>>2]=(c[g>>2]|0)+(d<<3);c[f>>2]=c[h>>2];Zs(g,f,b)|0;$d(c[a>>2]|0,c[c[b>>2]>>2]|0,d);l=e;return}function _k(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;n=l;l=l+16|0;j=n;h=c[a+4>>2]|0;m=a+8|0;d=c[m>>2]|0;i=h;a:do if((i|0)!=(d|0)){f=c[c[b>>2]>>2]|0;g=h;e=i;while(1){if((c[c[e>>2]>>2]|0)==(f|0))break;e=e+8|0;if((e|0)==(d|0))break a;else g=e}e=i+(g-h>>3<<3)|0;f=e+8|0;if((f|0)!=(d|0)){g=j+4|0;do{i=c[f>>2]|0;o=f+4|0;h=c[o>>2]|0;c[f>>2]=0;c[o>>2]=0;c[j>>2]=c[e>>2];c[e>>2]=i;i=e+4|0;c[g>>2]=c[i>>2];c[i>>2]=h;ml(j);f=f+8|0;e=e+8|0}while((f|0)!=(d|0));d=c[m>>2]|0;if((d|0)!=(e|0))k=8}else k=8;if((k|0)==8)do{o=d+-8|0;c[m>>2]=o;ml(o);d=c[m>>2]|0}while((d|0)!=(e|0));be(c[a>>2]|0,c[c[b>>2]>>2]|0)}while(0);l=n;return}function $k(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];bt(a,b,f);l=e;return a|0}function al(a,b,d){a=a|0;b=b|0;d=d|0;b=c[b+4>>2]|0;c[a>>2]=c[b+(d<<3)>>2];b=c[b+(d<<3)+4>>2]|0;c[a+4>>2]=b;if(b|0)XA(b);return}function bl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];sl(a,b,f);We(c[a>>2]|0,c[212]|0,0,0,0,0);l=e;return a|0}function cl(a){a=a|0;return (c[a+8>>2]|0)-(c[a+4>>2]|0)>>3|0}function dl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];vt(a,b,f);l=e;return a|0}function el(a){a=a|0;le(c[a>>2]|0,0);return}function fl(){var b=0;if(!(a[5960]|0)){hl(6804);xa(26,6804,o|0)|0;b=5960;c[b>>2]=1;c[b+4>>2]=0}return 6804}function gl(a,b){a=a|0;b=b|0;c[a>>2]=il()|0;c[a+4>>2]=jl()|0;c[a+12>>2]=b;c[a+8>>2]=kl()|0;c[a+32>>2]=3;return}function hl(a){a=a|0;He(a);return}function il(){return 8661}function jl(){return 560}function kl(){return Qe()|0}function ll(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if((Se(d,896)|0)==512){if(c|0){ml(c);aB(c)}}else if(b|0){nl(b);aB(b)}return}function ml(a){a=a|0;a=c[a+4>>2]|0;if(a|0)YA(a);return}function nl(a){a=a|0;_d(c[a>>2]|0);ol(a+40|0);pl(a+16|0);ql(a+4|0);return}function ol(a){a=a|0;var b=0;b=c[a+16>>2]|0;if((b|0)!=(a|0)){if(b|0)rb[c[(c[b>>2]|0)+20>>2]&127](b)}else rb[c[(c[b>>2]|0)+16>>2]&127](b);return}function pl(a){a=a|0;var b=0;b=c[a+16>>2]|0;if((b|0)!=(a|0)){if(b|0)rb[c[(c[b>>2]|0)+20>>2]&127](b)}else rb[c[(c[b>>2]|0)+16>>2]&127](b);return}function ql(a){a=a|0;var b=0,d=0,e=0,f=0;b=c[a>>2]|0;if(b|0){e=a+4|0;d=c[e>>2]|0;if((d|0)!=(b|0)){do{f=d+-8|0;c[e>>2]=f;ml(f);d=c[e>>2]|0}while((d|0)!=(b|0));b=c[a>>2]|0}aB(b)}return}function rl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];tl(a,d,f,0);l=e;return}function sl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Kl(a,d,f,0);l=e;return}function tl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=ul()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=vl(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,wl(g,e)|0,e);l=f;return}function ul(){var b=0,d=0;if(!(a[5968]|0)){xl(6848);xa(40,6848,o|0)|0;d=5968;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6848)|0)){b=6848;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));xl(6848)}return 6848}function vl(a){a=a|0;return 0}function wl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=ul()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Fl(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{El(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function xl(a){a=a|0;zl(a);return}function yl(a){a=a|0;Dl(a+24|0);return}function zl(a){a=a|0;var b=0;b=ff()|0;hf(a,4,6,b,ti()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Al(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=Bl(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Cl(b,f,d);l=e;return}function Bl(a){a=a|0;return (c[(ul()|0)+24>>2]|0)+(a*12|0)|0}function Cl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;g=l;l=l+16|0;f=g;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;uh(f,d);f=vh(f,d)|0;yb[e&63](a,f);l=g;return}function Dl(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function El(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Jl(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Gl(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Fl(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Hl(a,i);Il(i);l=k;return}}function Fl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Gl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Hl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Il(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Jl(a){a=a|0;return 357913941}function Kl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Ll()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Ml(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Nl(g,e)|0,e);l=f;return}function Ll(){var b=0,d=0;if(!(a[5976]|0)){Ol(6884);xa(41,6884,o|0)|0;d=5976;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6884)|0)){b=6884;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Ol(6884)}return 6884}function Ml(a){a=a|0;return 0}function Nl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Ll()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Wl(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Vl(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Ol(a){a=a|0;Ql(a);return}function Pl(a){a=a|0;Ul(a+24|0);return}function Ql(a){a=a|0;var b=0;b=ff()|0;hf(a,3,3,b,Li()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Rl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=l;l=l+16|0;e=d+8|0;f=d;g=Sl(a)|0;a=c[g+4>>2]|0;c[f>>2]=c[g>>2];c[f+4>>2]=a;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];b=Tl(b,e)|0;l=d;return b|0}function Sl(a){a=a|0;return (c[(Ll()|0)+24>>2]|0)+(a*12|0)|0}function Tl(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;return Oi(nb[d&31](a)|0)|0}function Ul(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Vl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=_l(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Xl(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Wl(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Yl(a,i);Zl(i);l=k;return}}function Wl(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Xl(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Yl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Zl(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function _l(a){a=a|0;return 357913941}function $l(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];bm(a,d,f,0);l=e;return}function am(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];wm(a,d,f,0);l=e;return}function bm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=cm()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=dm(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,em(g,e)|0,e);l=f;return}function cm(){var b=0,d=0;if(!(a[5984]|0)){fm(6920);xa(42,6920,o|0)|0;d=5984;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6920)|0)){b=6920;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));fm(6920)}return 6920}function dm(a){a=a|0;return 0}
function em(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=cm()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];rm(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{qm(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function fm(a){a=a|0;hm(a);return}function gm(a){a=a|0;pm(a+24|0);return}function hm(a){a=a|0;var b=0;b=ff()|0;hf(a,4,7,b,jm()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function im(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=km(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];lm(b,f,d);l=e;return}function jm(){return 568}function km(a){a=a|0;return (c[(cm()|0)+24>>2]|0)+(a*12|0)|0}function lm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;i=l;l=l+32|0;f=i+8|0;g=i;h=i+16|0;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;mm(h,d);nm(g,h,d);c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];yb[e&63](a,f);l=i;return}function mm(a,b){a=a|0;b=b|0;return}function nm(a,b,c){a=a|0;b=b|0;c=c|0;om(a,c);return}function om(a,b){a=a|0;b=b|0;var d=0,e=0;e=b;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function pm(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function qm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=vm(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;sm(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];rm(g,e,d);c[j>>2]=(c[j>>2]|0)+12;tm(a,i);um(i);l=k;return}}function rm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function sm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function tm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function um(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function vm(a){a=a|0;return 357913941}function wm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=xm()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=ym(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,zm(g,e)|0,e);l=f;return}function xm(){var b=0,d=0;if(!(a[5992]|0)){Am(6956);xa(43,6956,o|0)|0;d=5992;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6956)|0)){b=6956;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Am(6956)}return 6956}function ym(a){a=a|0;return 0}function zm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=xm()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Km(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Jm(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Am(a){a=a|0;Cm(a);return}function Bm(a){a=a|0;Im(a+24|0);return}function Cm(a){a=a|0;var b=0;b=ff()|0;hf(a,3,4,b,Em()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Dm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=l;l=l+16|0;e=d+8|0;f=d;g=Fm(a)|0;a=c[g+4>>2]|0;c[f>>2]=c[g>>2];c[f+4>>2]=a;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];b=Gm(b,e)|0;l=d;return b|0}function Em(){return 576}function Fm(a){a=a|0;return (c[(xm()|0)+24>>2]|0)+(a*12|0)|0}function Gm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=l;l=l+16|0;e=f;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;yb[d&63](e,a);e=Hm(e)|0;l=f;return e|0}function Hm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;d=l;l=l+16|0;f=d+4|0;h=d;e=Bw(8)|0;b=e;i=_A(8)|0;j=a;a=c[j+4>>2]|0;g=i;c[g>>2]=c[j>>2];c[g+4>>2]=a;g=b+4|0;c[g>>2]=i;a=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];Vg(a,g,f);c[e>>2]=a;l=d;return b|0}function Im(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Jm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Om(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Lm(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Km(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Mm(a,i);Nm(i);l=k;return}}function Km(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Lm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Mm(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Nm(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Om(a){a=a|0;return 357913941}function Pm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Rm(a,d,f,0);l=e;return}function Qm(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];gn(a,d,f,0);l=e;return}function Rm(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Sm()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Tm(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Um(g,e)|0,e);l=f;return}function Sm(){var b=0,d=0;if(!(a[6e3]|0)){Vm(6992);xa(44,6992,o|0)|0;d=6e3;c[d>>2]=1;c[d+4>>2]=0}if(!(af(6992)|0)){b=6992;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Vm(6992)}return 6992}function Tm(a){a=a|0;return 0}function Um(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Sm()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];bn(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{an(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Vm(a){a=a|0;Xm(a);return}function Wm(a){a=a|0;$m(a+24|0);return}function Xm(a){a=a|0;var b=0;b=ff()|0;hf(a,4,3,b,Sf()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Ym(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=Zm(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];_m(b,f,d);l=e;return}function Zm(a){a=a|0;return (c[(Sm()|0)+24>>2]|0)+(a*12|0)|0}function _m(a,b,d){a=a|0;b=b|0;d=+d;var e=0,f=0,g=0,h=fb;g=l;l=l+16|0;f=g;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;Af(f,d);h=T(Bf(f,d));vb[e&15](a,h);l=g;return}function $m(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function an(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=fn(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;cn(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];bn(g,e,d);c[j>>2]=(c[j>>2]|0)+12;dn(a,i);en(i);l=k;return}}function bn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function cn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function dn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function en(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function fn(a){a=a|0;return 357913941}function gn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=hn()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=jn(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,kn(g,e)|0,e);l=f;return}function hn(){var b=0,d=0;if(!(a[6008]|0)){ln(7028);xa(45,7028,o|0)|0;d=6008;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7028)|0)){b=7028;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));ln(7028)}return 7028}function jn(a){a=a|0;return 0}function kn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=hn()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];tn(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{sn(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function ln(a){a=a|0;nn(a);return}function mn(a){a=a|0;rn(a+24|0);return}function nn(a){a=a|0;var b=0;b=ff()|0;hf(a,3,3,b,jg()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function on(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=pn(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];d=+qn(b,f);l=e;return +d}function pn(a){a=a|0;return (c[(hn()|0)+24>>2]|0)+(a*12|0)|0}function qn(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;return +(+mg(T(hb[d&31](a))))}function rn(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function sn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=xn(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;un(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];tn(g,e,d);c[j>>2]=(c[j>>2]|0)+12;vn(a,i);wn(i);l=k;return}}function tn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function un(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function vn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function wn(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function xn(a){a=a|0;return 357913941}function yn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];An(a,d,f,0);l=e;return}function zn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Vn(a,d,f,0);l=e;return}function An(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Bn()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Cn(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Dn(g,e)|0,e);l=f;return}function Bn(){var b=0,d=0;if(!(a[6016]|0)){En(7064);xa(46,7064,o|0)|0;d=6016;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7064)|0)){b=7064;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));En(7064)}return 7064}function Cn(a){a=a|0;return 0}function Dn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Bn()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Qn(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Pn(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function En(a){a=a|0;Gn(a);return}function Fn(a){a=a|0;On(a+24|0);return}function Gn(a){a=a|0;var b=0;b=ff()|0;hf(a,4,8,b,In()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Hn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=Jn(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Kn(b,f,d);l=e;return}function In(){return 580}function Jn(a){a=a|0;return (c[(Bn()|0)+24>>2]|0)+(a*12|0)|0}function Kn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;g=l;l=l+16|0;f=g;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;Ln(f,d);f=Mn(f,d)|0;yb[e&63](a,f);l=g;return}function Ln(a,b){a=a|0;b=b|0;return}function Mn(a,b){a=a|0;b=b|0;return Nn(b)|0}function Nn(a){a=a|0;return a|0}function On(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Pn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Un(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Rn(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Qn(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Sn(a,i);Tn(i);l=k;return}}function Qn(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Rn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Sn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Tn(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Un(a){a=a|0;return 357913941}function Vn(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Wn()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Xn(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Yn(g,e)|0,e);l=f;return}function Wn(){var b=0,d=0;if(!(a[6024]|0)){Zn(7100);xa(47,7100,o|0)|0;d=6024;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7100)|0)){b=7100;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Zn(7100)}return 7100}function Xn(a){a=a|0;return 0}function Yn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Wn()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];io(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{ho(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Zn(a){a=a|0;$n(a);return}function _n(a){a=a|0;go(a+24|0);return}function $n(a){a=a|0;var b=0;b=ff()|0;hf(a,3,5,b,bo()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function ao(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=l;l=l+16|0;e=d+8|0;f=d;g=co(a)|0;a=c[g+4>>2]|0;c[f>>2]=c[g>>2];c[f+4>>2]=a;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];b=eo(b,e)|0;l=d;return b|0}function bo(){return 596}function co(a){a=a|0;return (c[(Wn()|0)+24>>2]|0)+(a*12|0)|0}function eo(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;return fo(nb[d&31](a)|0)|0}function fo(a){a=a|0;return a|0}function go(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function ho(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=mo(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;jo(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];io(g,e,d);c[j>>2]=(c[j>>2]|0)+12;ko(a,i);lo(i);l=k;return}}function io(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function jo(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function ko(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function lo(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function mo(a){a=a|0;return 357913941}function no(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];po(a,d,f,0);l=e;return}function oo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Ko(a,d,f,0);l=e;return}function po(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=qo()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=ro(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,so(g,e)|0,e);l=f;return}function qo(){var b=0,d=0;if(!(a[6032]|0)){to(7136);xa(48,7136,o|0)|0;d=6032;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7136)|0)){b=7136;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));to(7136)}return 7136}function ro(a){a=a|0;return 0}function so(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=qo()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Fo(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Eo(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function to(a){a=a|0;vo(a);return}function uo(a){a=a|0;Do(a+24|0);return}function vo(a){a=a|0;var b=0;b=ff()|0;hf(a,4,9,b,xo()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function wo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=yo(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];zo(b,f,d);l=e;return}function xo(){return 600}function yo(a){a=a|0;return (c[(qo()|0)+24>>2]|0)+(a*12|0)|0}function zo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;g=l;l=l+16|0;f=g;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;Ao(f,d);f=Bo(f,d)|0;yb[e&63](a,f);l=g;return}function Ao(a,b){a=a|0;b=b|0;return}function Bo(a,b){a=a|0;b=b|0;return Co(b)|0}function Co(a){a=a|0;return (a|0)!=0|0}function Do(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Eo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Jo(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Go(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Fo(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Ho(a,i);Io(i);l=k;return}}function Fo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Go(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Ho(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Io(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Jo(a){a=a|0;return 357913941}function Ko(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Lo()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Mo(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,No(g,e)|0,e);l=f;return}function Lo(){var b=0,d=0;if(!(a[6040]|0)){Oo(7172);xa(49,7172,o|0)|0;d=6040;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7172)|0)){b=7172;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Oo(7172)}return 7172}function Mo(a){a=a|0;return 0}function No(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Lo()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Yo(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Xo(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Oo(a){a=a|0;Qo(a);return}function Po(a){a=a|0;Wo(a+24|0);return}function Qo(a){a=a|0;var b=0;b=ff()|0;hf(a,3,6,b,So()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Ro(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=l;l=l+16|0;e=d+8|0;f=d;g=To(a)|0;a=c[g+4>>2]|0;c[f>>2]=c[g>>2];c[f+4>>2]=a;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];b=Uo(b,e)|0;l=d;return b|0}function So(){return 608}function To(a){a=a|0;return (c[(Lo()|0)+24>>2]|0)+(a*12|0)|0}function Uo(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;return Vo(nb[d&31](a)|0)|0}function Vo(a){a=a|0;return a&1|0}function Wo(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Xo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=ap(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Zo(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Yo(g,e,d);c[j>>2]=(c[j>>2]|0)+12;_o(a,i);$o(i);l=k;return}}function Yo(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Zo(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function _o(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function $o(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function ap(a){a=a|0;return 357913941}function bp(){var b=0;if(!(a[6048]|0)){cp(7208);xa(50,7208,o|0)|0;b=6048;c[b>>2]=1;c[b+4>>2]=0}if(!(af(7208)|0))cp(7208);return 7208}function cp(a){a=a|0;ep(a);cf(a,51);return}function dp(a){a=a|0;qp(a+24|0);return}function ep(a){a=a|0;var b=0;b=ff()|0;hf(a,5,3,b,hp()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function fp(a){a=a|0;op(a);return}function gp(){return ip()|0}function hp(){return 640}function ip(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0;b=l;l=l+16|0;f=b+4|0;h=b;d=Bw(8)|0;a=d;e=_A(64)|0;jp(e);g=a+4|0;c[g>>2]=e;e=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];kp(e,g,f);c[d>>2]=e;l=b;return a|0}function jp(a){a=a|0;var b=0;c[a+4>>2]=0;c[a+8>>2]=0;c[a+12>>2]=0;c[a+32>>2]=0;c[a+56>>2]=0;b=Zd()|0;c[a>>2]=b;ld(b,a);return}function kp(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;d=_A(16)|0;c[d+4>>2]=0;c[d+8>>2]=0;c[d>>2]=620;c[d+12>>2]=b;c[a+4>>2]=d;return}function lp(a){a=a|0;RA(a);aB(a);return}function mp(a){a=a|0;a=c[a+12>>2]|0;if(a|0){nl(a);aB(a)}return}function np(a){a=a|0;aB(a);return}function op(a){a=a|0;pp(a);return}function pp(b){b=b|0;jp(b+8|0);a[b+72>>0]=1;return}function qp(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function rp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];sp(a,d,f,0);l=e;return}function sp(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=tp()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=up(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,vp(g,e)|0,e);l=f;return}function tp(){var b=0,d=0;if(!(a[6056]|0)){wp(7244);xa(52,7244,o|0)|0;d=6056;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7244)|0)){b=7244;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));wp(7244)}return 7244}function up(a){a=a|0;return 0}function vp(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=tp()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];mq(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{lq(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function wp(a){a=a|0;yp(a);return}function xp(a){a=a|0;kq(a+24|0);return}function yp(a){a=a|0;var b=0;b=ff()|0;hf(a,2,10,b,Ap()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function zp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=Bp(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Cp(b,f,d);l=e;return}function Ap(){return 688}function Bp(a){a=a|0;return (c[(tp()|0)+24>>2]|0)+(a*12|0)|0}function Cp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;h=l;l=l+48|0;f=h;g=h+24|0;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;Dp(g,d);Ep(f,g,d);yb[e&63](a,f);pl(f);Fp(g);l=h;return}function Dp(a,b){a=a|0;b=b|0;var c=0,d=0;c=l;l=l+16|0;d=c;Gp(d,b);Hp(a,d);Ip(d);l=c;return}function Ep(a,b,c){a=a|0;b=b|0;c=c|0;iq(a,b);return}function Fp(a){a=a|0;pl(a);return}function Gp(a,b){a=a|0;b=b|0;Jp(a,b);return}function Hp(a,b){a=a|0;b=b|0;var d=0;a=a+16|0;c[a>>2]=0;d=_A(8)|0;c[d>>2]=652;Rp(d+4|0,b);c[a>>2]=d;return}function Ip(a){a=a|0;hq(a);return}function Jp(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function Kp(a){a=a|0;c[a>>2]=652;Tp(a+4|0);return}function Lp(a){a=a|0;Kp(a);aB(a);return}function Mp(a){a=a|0;var b=0;b=_A(8)|0;c[b>>2]=652;Up(b+4|0,a+4|0);return b|0}function Np(a,b){a=a|0;b=b|0;c[b>>2]=652;Up(b+4|0,a+4|0);return}function Op(a){a=a|0;Tp(a+4|0);return}function Pp(a){a=a|0;Tp(a+4|0);aB(a);return}function Qp(a,b,c){a=a|0;b=b|0;c=c|0;Wp(a,b+4|0,c);return}function Rp(a,b){a=a|0;b=b|0;Sp(a,b);return}function Sp(a,b){a=a|0;b=b|0;c[a>>2]=c[b>>2];c[b>>2]=0;return}function Tp(a){a=a|0;Ip(a);return}function Up(a,b){a=a|0;b=b|0;Vp(a,b);return}function Vp(a,b){a=a|0;b=b|0;b=c[b>>2]|0;c[a>>2]=b;Ia(b|0);return}function Wp(a,b,c){a=a|0;b=b|0;c=c|0;Xp(a,b,c);return}function Xp(a,b,c){a=a|0;b=b|0;c=c|0;Yp(a,b,c);return}function Yp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=l;l=l+32|0;g=e+16|0;f=e+8|0;h=e;rz(f);b=_p(b)|0;j=d;i=c[j+4>>2]|0;d=h;c[d>>2]=c[j>>2];c[d+4>>2]=i;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];Zp(a,b,g);tz(f);l=e;return}function Zp(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=l;l=l+16|0;f=e+8|0;h=e;g=bq(aq()|0)|0;j=d;i=c[j+4>>2]|0;d=h;c[d>>2]=c[j>>2];c[d+4>>2]=i;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];$p(a,Ta(0,g|0,b|0,cq(f)|0)|0);l=e;return}function _p(a){a=a|0;return c[a>>2]|0}function $p(a,b){a=a|0;b=b|0;var d=0,e=0;e=b;d=c[e+4>>2]|0;b=a;c[b>>2]=c[e>>2];c[b+4>>2]=d;return}function aq(){var b=0;if(!(a[6064]|0)){dq(7280);b=6064;c[b>>2]=1;c[b+4>>2]=0}return 7280}function bq(a){a=a|0;return c[a+8>>2]|0}function cq(a){a=a|0;return gq(a)|0}function dq(a){a=a|0;fq(a,eq()|0,1);return}function eq(){return 680}function fq(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;c[a+4>>2]=d;c[a+8>>2]=Ja(b|0,d+1|0)|0;return}function gq(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;d=l;l=l+16|0;f=d+4|0;h=d;e=Bw(8)|0;b=e;i=_A(8)|0;j=a;a=c[j+4>>2]|0;g=i;c[g>>2]=c[j>>2];c[g+4>>2]=a;g=b+4|0;c[g>>2]=i;a=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];lf(a,g,f);c[e>>2]=a;l=d;return b|0}function hq(a){a=a|0;a=c[a>>2]|0;if(a|0)Ga(a|0);return}function iq(a,b){a=a|0;b=b|0;var d=0,e=0;d=b+16|0;e=c[d>>2]|0;do if(e)if((e|0)==(b|0)){e=jq(a)|0;c[a+16>>2]=e;d=c[d>>2]|0;yb[c[(c[d>>2]|0)+12>>2]&63](d,e);break}else{c[a+16>>2]=nb[c[(c[e>>2]|0)+8>>2]&31](e)|0;break}else c[a+16>>2]=0;while(0);return}function jq(a){a=a|0;return a|0}function kq(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function lq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=qq(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;nq(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];mq(g,e,d);c[j>>2]=(c[j>>2]|0)+12;oq(a,i);pq(i);l=k;return}}function mq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function nq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function oq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function pq(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function qq(a){a=a|0;return 357913941}function rq(a,b){a=a|0;b=b|0;var c=0,d=0;c=l;l=l+32|0;d=c;iq(d,b);tq(d,a);pl(d);l=c;return a|0}function sq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,h=0,i=0,j=fb;e=l;l=l+32|0;h=e+16|0;f=e+8|0;i=e;j=T(g[d>>2]);Cf(i,j,T(g[d+4>>2]));c[h>>2]=c[i>>2];c[h+4>>2]=c[i+4>>2];uq(f,b+16|0,h);c[a>>2]=c[f>>2];c[a+4>>2]=c[f+4>>2];l=e;return}function tq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=l;l=l+16|0;d=i;do if((b|0)!=(a|0)){f=a+16|0;e=c[f>>2]|0;g=b+16|0;h=e;if((e|0)==(a|0))if((c[g>>2]|0)==(b|0)){h=jq(d)|0;d=c[f>>2]|0;yb[c[(c[d>>2]|0)+12>>2]&63](d,h);d=c[f>>2]|0;rb[c[(c[d>>2]|0)+16>>2]&127](d);c[f>>2]=0;d=c[g>>2]|0;j=c[(c[d>>2]|0)+12>>2]|0;a=jq(e)|0;yb[j&63](d,a);a=c[g>>2]|0;rb[c[(c[a>>2]|0)+16>>2]&127](a);c[g>>2]=0;c[f>>2]=jq(e)|0;a=c[(c[h>>2]|0)+12>>2]|0;f=jq(b)|0;yb[a&63](h,f);rb[c[(c[h>>2]|0)+16>>2]&127](h);c[g>>2]=jq(b)|0;break}else{h=c[(c[e>>2]|0)+12>>2]|0;j=jq(b)|0;yb[h&63](e,j);j=c[f>>2]|0;rb[c[(c[j>>2]|0)+16>>2]&127](j);c[f>>2]=c[g>>2];c[g>>2]=jq(b)|0;break}else{d=c[g>>2]|0;if((d|0)==(b|0)){h=c[(c[d>>2]|0)+12>>2]|0;j=jq(a)|0;yb[h&63](d,j);j=c[g>>2]|0;rb[c[(c[j>>2]|0)+16>>2]&127](j);c[g>>2]=c[f>>2];c[f>>2]=jq(a)|0;break}else{c[f>>2]=d;c[g>>2]=h;break}}}while(0);l=i;return}function uq(a,b,d){a=a|0;b=b|0;d=d|0;b=c[b+16>>2]|0;if(!b)Pa();else{Cb[c[(c[b>>2]|0)+24>>2]&15](a,b,d);return}}function vq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];wq(a,d,f,0);l=e;return}function wq(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=xq()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=yq(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,zq(g,e)|0,e);l=f;return}function xq(){var b=0,d=0;if(!(a[6072]|0)){Aq(7292);xa(53,7292,o|0)|0;d=6072;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7292)|0)){b=7292;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Aq(7292)}return 7292}function yq(a){a=a|0;return 0}function zq(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=xq()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];hr(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{gr(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Aq(a){a=a|0;Cq(a);return}function Bq(a){a=a|0;fr(a+24|0);return}function Cq(a){a=a|0;var b=0;b=ff()|0;hf(a,2,11,b,Eq()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Dq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=Fq(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Gq(b,f,d);l=e;return}function Eq(){return 756}function Fq(a){a=a|0;return (c[(xq()|0)+24>>2]|0)+(a*12|0)|0}function Gq(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;h=l;l=l+48|0;f=h;g=h+24|0;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;Hq(g,d);Iq(f,g,d);yb[e&63](a,f);ol(f);Jq(g);l=h;return}function Hq(a,b){a=a|0;b=b|0;var c=0,d=0;c=l;l=l+16|0;d=c;Kq(d,b);Lq(a,d);Mq(d);l=c;return}function Iq(a,b,c){a=a|0;b=b|0;c=c|0;dr(a,b);return}function Jq(a){a=a|0;ol(a);return}function Kq(a,b){a=a|0;b=b|0;Jp(a,b);return}function Lq(a,b){a=a|0;b=b|0;var d=0;a=a+16|0;c[a>>2]=0;d=_A(8)|0;c[d>>2]=720;Uq(d+4|0,b);c[a>>2]=d;return}function Mq(a){a=a|0;hq(a);return}function Nq(a){a=a|0;c[a>>2]=720;Vq(a+4|0);return}function Oq(a){a=a|0;Nq(a);aB(a);return}function Pq(a){a=a|0;var b=0;b=_A(8)|0;c[b>>2]=720;Wq(b+4|0,a+4|0);return b|0}function Qq(a,b){a=a|0;b=b|0;c[b>>2]=720;Wq(b+4|0,a+4|0);return}function Rq(a){a=a|0;Vq(a+4|0);return}function Sq(a){a=a|0;Vq(a+4|0);aB(a);return}function Tq(a,b){a=a|0;b=b|0;return T(Xq(a+4|0,b))}function Uq(a,b){a=a|0;b=b|0;Sp(a,b);return}function Vq(a){a=a|0;Mq(a);return}function Wq(a,b){a=a|0;b=b|0;Vp(a,b);return}function Xq(a,b){a=a|0;b=b|0;return T(Yq(a,b))}function Yq(a,b){a=a|0;b=b|0;return T(Zq(a,b))}function Zq(a,b){a=a|0;b=b|0;var d=fb,e=0,f=0,g=0,h=0,i=0,j=0;e=l;l=l+32|0;g=e+16|0;f=e+8|0;h=e;rz(f);a=_p(a)|0;j=b;i=c[j+4>>2]|0;b=h;c[b>>2]=c[j>>2];c[b+4>>2]=i;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];d=T(_q(a,g));tz(f);l=e;return T(d)}function _q(a,b){a=a|0;b=b|0;var d=fb,e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=b;h=c[i+4>>2]|0;b=g;c[b>>2]=c[i>>2];c[b+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];d=T(+$q(a,f));l=e;return T(d)}function $q(a,b){a=a|0;b=b|0;var d=0.0,e=0,f=0,g=0,h=0,i=0,j=0;e=l;l=l+16|0;f=e+8|0;h=e;g=bq(ar()|0)|0;j=b;i=c[j+4>>2]|0;b=h;c[b>>2]=c[j>>2];c[b+4>>2]=i;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];d=+Sa(0,g|0,a|0,cq(f)|0);l=e;return +d}function ar(){var b=0;if(!(a[6080]|0)){br(7328);b=6080;c[b>>2]=1;c[b+4>>2]=0}return 7328}function br(a){a=a|0;fq(a,cr()|0,1);return}function cr(){return 748}function dr(a,b){a=a|0;b=b|0;var d=0,e=0;d=b+16|0;e=c[d>>2]|0;do if(e)if((e|0)==(b|0)){e=er(a)|0;c[a+16>>2]=e;d=c[d>>2]|0;yb[c[(c[d>>2]|0)+12>>2]&63](d,e);break}else{c[a+16>>2]=nb[c[(c[e>>2]|0)+8>>2]&31](e)|0;break}else c[a+16>>2]=0;while(0);return}function er(a){a=a|0;return a|0}function fr(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function gr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=lr(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;ir(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];hr(g,e,d);c[j>>2]=(c[j>>2]|0)+12;jr(a,i);kr(i);l=k;return}}function hr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function ir(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function jr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function kr(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function lr(a){a=a|0;return 357913941}function mr(a,b){a=a|0;b=b|0;var c=0,d=0;c=l;l=l+32|0;d=c;dr(d,b);or(d,a);ol(d);l=c;return a|0}function nr(a,b){a=a|0;b=b|0;var d=fb,e=0,f=0,h=0;e=l;l=l+16|0;f=e+8|0;h=e;d=T(g[b>>2]);Cf(h,d,T(g[b+4>>2]));c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];d=T(pr(a+40|0,f));l=e;return T(d)}function or(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=l;l=l+16|0;d=i;do if((b|0)!=(a|0)){f=a+16|0;e=c[f>>2]|0;g=b+16|0;h=e;if((e|0)==(a|0))if((c[g>>2]|0)==(b|0)){h=er(d)|0;d=c[f>>2]|0;yb[c[(c[d>>2]|0)+12>>2]&63](d,h);d=c[f>>2]|0;rb[c[(c[d>>2]|0)+16>>2]&127](d);c[f>>2]=0;d=c[g>>2]|0;j=c[(c[d>>2]|0)+12>>2]|0;a=er(e)|0;yb[j&63](d,a);a=c[g>>2]|0;rb[c[(c[a>>2]|0)+16>>2]&127](a);c[g>>2]=0;c[f>>2]=er(e)|0;a=c[(c[h>>2]|0)+12>>2]|0;f=er(b)|0;yb[a&63](h,f);rb[c[(c[h>>2]|0)+16>>2]&127](h);c[g>>2]=er(b)|0;break}else{h=c[(c[e>>2]|0)+12>>2]|0;j=er(b)|0;yb[h&63](e,j);j=c[f>>2]|0;rb[c[(c[j>>2]|0)+16>>2]&127](j);c[f>>2]=c[g>>2];c[g>>2]=er(b)|0;break}else{d=c[g>>2]|0;if((d|0)==(b|0)){h=c[(c[d>>2]|0)+12>>2]|0;j=er(a)|0;yb[h&63](d,j);j=c[g>>2]|0;rb[c[(c[j>>2]|0)+16>>2]&127](j);c[g>>2]=c[f>>2];c[f>>2]=er(a)|0;break}else{c[f>>2]=d;c[g>>2]=h;break}}}while(0);l=i;return}function pr(a,b){a=a|0;b=b|0;a=c[a+16>>2]|0;if(!a)Pa();else return T(ib[c[(c[a>>2]|0)+24>>2]&3](a,b));return T(0.0)}function qr(a,b){a=a|0;b=b|0;c[a>>2]=b;c[a+4>>2]=a;return}function rr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=c[d+4>>2]|0;c[g>>2]=c[d>>2];c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];sr(a,b,f);l=e;return a|0}function sr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];tr(a,d,f,0);l=e;return}function tr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=ur()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=vr(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,wr(g,e)|0,e);l=f;return}function ur(){var b=0,d=0;if(!(a[6088]|0)){xr(7340);xa(54,7340,o|0)|0;d=6088;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7340)|0)){b=7340;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));xr(7340)}return 7340}function vr(a){a=a|0;return 0}function wr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=ur()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Gr(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Fr(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function xr(a){a=a|0;zr(a);return}function yr(a){a=a|0;Er(a+24|0);return}function zr(a){a=a|0;var b=0;b=ff()|0;hf(a,2,1,b,Br()|0,2);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Ar(a,b,d,e){a=a|0;b=b|0;d=+d;e=+e;var f=0,g=0,h=0,i=0;f=l;l=l+16|0;g=f+8|0;h=f;i=Cr(a)|0;a=c[i+4>>2]|0;c[h>>2]=c[i>>2];c[h+4>>2]=a;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];Dr(b,g,d,e);l=f;return}function Br(){return 780}function Cr(a){a=a|0;return (c[(ur()|0)+24>>2]|0)+(a*12|0)|0}function Dr(a,b,d,e){a=a|0;b=b|0;d=+d;e=+e;var f=0,g=0,h=0,i=0,j=fb,k=fb;i=l;l=l+16|0;g=i+1|0;h=i;f=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)f=c[(c[a>>2]|0)+f>>2]|0;Af(g,d);k=T(Bf(g,d));Af(h,e);j=T(Bf(h,e));wb[f&1](a,k,j);l=i;return}function Er(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Fr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Kr(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Hr(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Gr(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Ir(a,i);Jr(i);l=k;return}}function Gr(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Hr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Ir(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Jr(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Kr(a){a=a|0;return 357913941}function Lr(a,b){a=a|0;b=b|0;c[a>>2]=b;c[a+4>>2]=a;return}function Mr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=l;l=l+16|0;g=f+8|0;h=f;i=c[d+4>>2]|0;c[h>>2]=c[d>>2];c[h+4>>2]=i;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];Nr(a,b,g,e);l=f;return a|0}function Nr(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=l;l=l+16|0;g=f+8|0;h=f;i=c[d>>2]|0;d=c[d+4>>2]|0;e=Pr(b,e)|0;c[h>>2]=i;c[h+4>>2]=d;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];Or(a,e,g,0);l=f;return}function Or(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Qr()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Rr(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Sr(g,e)|0,e);l=f;return}function Pr(a,b){a=a|0;b=b|0;return b|0}function Qr(){var b=0,d=0;if(!(a[6096]|0)){Tr(7376);xa(55,7376,o|0)|0;d=6096;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7376)|0)){b=7376;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Tr(7376)}return 7376}function Rr(a){a=a|0;return 0}function Sr(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Qr()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];as(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{$r(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Tr(a){a=a|0;Vr(a);return}function Ur(a){a=a|0;_r(a+24|0);return}function Vr(a){a=a|0;var b=0;b=ff()|0;hf(a,2,1,b,Xr()|0,3);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Wr(a,b,d,e,f){a=a|0;b=b|0;d=+d;e=+e;f=+f;var g=0,h=0,i=0,j=0;g=l;l=l+16|0;h=g+8|0;i=g;j=Yr(a)|0;a=c[j+4>>2]|0;c[i>>2]=c[j>>2];c[i+4>>2]=a;c[h>>2]=c[i>>2];c[h+4>>2]=c[i+4>>2];Zr(b,h,d,e,f);l=g;return}function Xr(){return 792}function Yr(a){a=a|0;return (c[(Qr()|0)+24>>2]|0)+(a*12|0)|0}function Zr(a,b,d,e,f){a=a|0;b=b|0;d=+d;e=+e;f=+f;var g=0,h=0,i=0,j=0,k=0,m=fb,n=fb,o=fb;k=l;l=l+16|0;h=k+2|0;i=k+1|0;j=k;g=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)g=c[(c[a>>2]|0)+g>>2]|0;Af(h,d);o=T(Bf(h,d));Af(i,e);n=T(Bf(i,e));Af(j,f);m=T(Bf(j,f));xb[g&1](a,o,n,m);l=k;return}function _r(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function $r(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=es(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;bs(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];as(g,e,d);c[j>>2]=(c[j>>2]|0)+12;cs(a,i);ds(i);l=k;return}}function as(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function bs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function cs(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function ds(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function es(a){a=a|0;return 357913941}function fs(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];gs(a,d,f,0);l=e;return}function gs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=hs()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=is(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,js(g,e)|0,e);l=f;return}function hs(){var b=0,d=0;if(!(a[6104]|0)){ks(7412);xa(56,7412,o|0)|0;d=6104;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7412)|0)){b=7412;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));ks(7412)}return 7412}function is(a){a=a|0;return 0}function js(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=hs()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];ws(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{vs(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function ks(a){a=a|0;ms(a);return}function ls(a){a=a|0;us(a+24|0);return}function ms(a){a=a|0;var b=0;b=ff()|0;hf(a,2,12,b,os()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function ns(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=ps(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];qs(b,f,d);l=e;return}function os(){return 808}function ps(a){a=a|0;return (c[(hs()|0)+24>>2]|0)+(a*12|0)|0}function qs(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;h=l;l=l+16|0;f=h;g=h+8|0;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;rs(g,d);ss(f,g,d);yb[e&63](a,f);ml(f);l=h;return}function rs(a,b){a=a|0;b=b|0;return}function ss(a,b,c){a=a|0;b=b|0;c=c|0;ts(a,c);return}function ts(a,b){a=a|0;b=b|0;c[a>>2]=c[b>>2];b=c[b+4>>2]|0;c[a+4>>2]=b;if(b|0)XA(b);return}function us(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function vs(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=As(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;xs(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];ws(g,e,d);c[j>>2]=(c[j>>2]|0)+12;ys(a,i);zs(i);l=k;return}}function ws(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function xs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function ys(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function zs(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function As(a){a=a|0;return 357913941}function Bs(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;h=l;l=l+32|0;g=h;d=a+4|0;e=((c[d>>2]|0)-(c[a>>2]|0)>>3)+1|0;f=Fs(a)|0;if(f>>>0<e>>>0)QA(a);i=c[a>>2]|0;k=(c[a+8>>2]|0)-i|0;j=k>>2;Cs(g,k>>3>>>0<f>>>1>>>0?(j>>>0<e>>>0?e:j):f,(c[d>>2]|0)-i>>3,a+8|0);f=g+8|0;d=c[f>>2]|0;c[d>>2]=c[b>>2];e=c[b+4>>2]|0;c[d+4>>2]=e;if(e){XA(e);d=c[f>>2]|0}c[f>>2]=d+8;Ds(a,g);Es(g);l=h;return}function Cs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>536870911)Pa();else{f=_A(b<<3)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<3)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<3);return}function Ds(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=c[a>>2]|0;j=a+4|0;d=c[j>>2]|0;h=b+4|0;if((d|0)==(i|0)){f=h;g=a;e=c[h>>2]|0;d=i}else{e=c[h>>2]|0;do{g=d;d=d+-8|0;c[e+-8>>2]=c[d>>2];g=g+-4|0;c[e+-4>>2]=c[g>>2];c[d>>2]=0;c[g>>2]=0;e=(c[h>>2]|0)+-8|0;c[h>>2]=e}while((d|0)!=(i|0));f=h;g=a;d=c[a>>2]|0}c[g>>2]=e;c[f>>2]=d;i=b+8|0;h=c[j>>2]|0;c[j>>2]=c[i>>2];c[i>>2]=h;i=a+8|0;j=b+12|0;a=c[i>>2]|0;c[i>>2]=c[j>>2];c[j>>2]=a;c[b>>2]=c[f>>2];return}function Es(a){a=a|0;var b=0,d=0,e=0,f=0;d=c[a+4>>2]|0;e=a+8|0;b=c[e>>2]|0;if((b|0)!=(d|0))do{f=b+-8|0;c[e>>2]=f;ml(f);b=c[e>>2]|0}while((b|0)!=(d|0));b=c[a>>2]|0;if(b|0)aB(b);return}function Fs(a){a=a|0;return 536870911}function Gs(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];Hs(a,d,f,0);l=e;return}function Hs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=Is()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=Js(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,Ks(g,e)|0,e);l=f;return}function Is(){var b=0,d=0;if(!(a[6112]|0)){Ls(7448);xa(57,7448,o|0)|0;d=6112;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7448)|0)){b=7448;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Ls(7448)}return 7448}function Js(a){a=a|0;return 0}function Ks(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=Is()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Us(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{Ts(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function Ls(a){a=a|0;Ns(a);return}function Ms(a){a=a|0;Ss(a+24|0);return}function Ns(a){a=a|0;var b=0;b=ff()|0;hf(a,2,4,b,Ps()|0,2);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Os(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=l;l=l+16|0;g=f+8|0;h=f;i=Qs(a)|0;a=c[i+4>>2]|0;c[h>>2]=c[i>>2];c[h+4>>2]=a;c[g>>2]=c[h>>2];c[g+4>>2]=c[h+4>>2];Rs(b,g,d,e);l=f;return}function Ps(){return 824}function Qs(a){a=a|0;return (c[(Is()|0)+24>>2]|0)+(a*12|0)|0}function Rs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;j=l;l=l+16|0;g=j;h=j+9|0;i=j+8|0;f=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)f=c[(c[a>>2]|0)+f>>2]|0;rs(h,d);ss(g,h,d);uh(i,e);i=vh(i,e)|0;Cb[f&15](a,g,i);ml(g);l=j;return}function Ss(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function Ts(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Ys(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Vs(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Us(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Ws(a,i);Xs(i);l=k;return}}function Us(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Vs(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Ws(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Xs(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Ys(a){a=a|0;return 357913941}function Zs(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;s=l;l=l+64|0;q=s+56|0;k=s+48|0;m=s+28|0;n=s+24|0;o=s+20|0;r=s;j=c[a>>2]|0;f=j;i=(c[b>>2]|0)-f>>3;b=j+(i<<3)|0;g=a+4|0;e=c[g>>2]|0;h=a+8|0;do if(e>>>0<(c[h>>2]|0)>>>0){if((b|0)==(e|0)){c[b>>2]=c[d>>2];e=c[d+4>>2]|0;c[j+(i<<3)+4>>2]=e;if(!e)e=b;else{XA(e);e=c[g>>2]|0}c[g>>2]=e+8;break}_s(a,b,e,b+8|0);if(b>>>0>d>>>0)e=d;else e=(c[g>>2]|0)>>>0>d>>>0?d+8|0:d;f=c[e>>2]|0;c[q>>2]=f;g=q+4|0;e=c[e+4>>2]|0;c[g>>2]=e;if(e|0)XA(e);c[q>>2]=c[b>>2];c[b>>2]=f;r=j+(i<<3)+4|0;c[g>>2]=c[r>>2];c[r>>2]=e;ml(q)}else{e=(e-f>>3)+1|0;f=Fs(a)|0;if(f>>>0<e>>>0)QA(a);p=c[a>>2]|0;h=(c[h>>2]|0)-p|0;j=h>>2;Cs(r,h>>3>>>0<f>>>1>>>0?(j>>>0<e>>>0?e:j):f,b-p>>3,a+8|0);p=r+8|0;f=c[p>>2]|0;e=r+12|0;j=c[e>>2]|0;h=j;do if((f|0)==(j|0)){j=r+4|0;g=c[j>>2]|0;t=c[r>>2]|0;i=t;if(g>>>0<=t>>>0){t=h-i>>2;t=(t|0)==0?1:t;Cs(m,t,t>>>2,c[r+16>>2]|0);c[n>>2]=c[j>>2];c[o>>2]=c[p>>2];c[k>>2]=c[n>>2];c[q>>2]=c[o>>2];at(m,k,q);t=c[r>>2]|0;c[r>>2]=c[m>>2];c[m>>2]=t;t=m+4|0;q=c[j>>2]|0;c[j>>2]=c[t>>2];c[t>>2]=q;t=m+8|0;q=c[p>>2]|0;c[p>>2]=c[t>>2];c[t>>2]=q;t=m+12|0;q=c[e>>2]|0;c[e>>2]=c[t>>2];c[t>>2]=q;Es(m);e=c[p>>2]|0;break}i=((g-i>>3)+1|0)/-2|0;e=g+(i<<3)|0;if((g|0)!=(f|0)){h=q+4|0;do{t=c[g>>2]|0;n=g+4|0;o=c[n>>2]|0;c[g>>2]=0;c[n>>2]=0;c[q>>2]=c[e>>2];c[e>>2]=t;t=e+4|0;c[h>>2]=c[t>>2];c[t>>2]=o;ml(q);g=g+8|0;e=e+8|0}while((g|0)!=(f|0));f=c[j>>2]|0}c[p>>2]=e;c[j>>2]=f+(i<<3)}else e=f;while(0);c[e>>2]=c[d>>2];f=c[d+4>>2]|0;c[e+4>>2]=f;if(f){XA(f);e=c[p>>2]|0}c[p>>2]=e+8;b=$s(a,r,b)|0;Es(r)}while(0);l=s;return b|0}function _s(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+16|0;k=m;j=a+4|0;a=c[j>>2]|0;g=a-e>>3;e=b+(g<<3)|0;if(e>>>0<d>>>0){h=((d+(0-g<<3)+~b|0)>>>3)+1|0;f=e;i=a;while(1){c[i>>2]=c[f>>2];n=f+4|0;c[i+4>>2]=c[n>>2];c[f>>2]=0;c[n>>2]=0;f=f+8|0;if(f>>>0>=d>>>0)break;else i=i+8|0}c[j>>2]=a+(h<<3)}if(g|0){f=k+4|0;do{i=e;e=e+-8|0;n=a;a=a+-8|0;j=c[e>>2]|0;i=i+-4|0;d=c[i>>2]|0;c[e>>2]=0;c[i>>2]=0;c[k>>2]=c[a>>2];c[a>>2]=j;n=n+-4|0;c[f>>2]=c[n>>2];c[n>>2]=d;ml(k)}while((e|0)!=(b|0))}l=m;return}function $s(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;j=b+4|0;k=c[j>>2]|0;g=c[a>>2]|0;if((g|0)==(d|0))e=k;else{f=d;e=k;do{i=f;f=f+-8|0;c[e+-8>>2]=c[f>>2];i=i+-4|0;c[e+-4>>2]=c[i>>2];c[f>>2]=0;c[i>>2]=0;e=(c[j>>2]|0)+-8|0;c[j>>2]=e}while((f|0)!=(g|0))}h=a+4|0;g=c[h>>2]|0;i=b+8|0;if((g|0)==(d|0))f=j;else{e=d;f=c[i>>2]|0;do{c[f>>2]=c[e>>2];d=e+4|0;c[f+4>>2]=c[d>>2];c[e>>2]=0;c[d>>2]=0;e=e+8|0;f=(c[i>>2]|0)+8|0;c[i>>2]=f}while((e|0)!=(g|0));f=j;e=c[j>>2]|0}d=c[a>>2]|0;c[a>>2]=e;c[f>>2]=d;d=c[h>>2]|0;c[h>>2]=c[i>>2];c[i>>2]=d;d=a+8|0;a=b+12|0;j=c[d>>2]|0;c[d>>2]=c[a>>2];c[a>>2]=j;c[b>>2]=c[f>>2];return k|0}function at(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;i=c[b>>2]|0;h=c[d>>2]|0;if((i|0)!=(h|0)){f=a+8|0;e=c[f>>2]|0;d=((h+-8-i|0)>>>3)+1|0;g=e+(d<<3)|0;a=i;while(1){c[e>>2]=c[a>>2];j=a+4|0;c[e+4>>2]=c[j>>2];c[a>>2]=0;c[j>>2]=0;a=a+8|0;if((a|0)==(h|0))break;else e=e+8|0}c[f>>2]=g;c[b>>2]=i+(d<<3)}return}function bt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];ct(a,d,f,0);l=e;return}function ct(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=dt()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=et(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,ft(g,e)|0,e);l=f;return}function dt(){var b=0,d=0;if(!(a[6120]|0)){gt(7484);xa(58,7484,o|0)|0;d=6120;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7484)|0)){b=7484;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));gt(7484)}return 7484}function et(a){a=a|0;return 0}function ft(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=dt()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];qt(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{pt(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function gt(a){a=a|0;it(a);return}function ht(a){a=a|0;ot(a+24|0);return}function it(a){a=a|0;var b=0;b=ff()|0;hf(a,2,3,b,kt()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function jt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;f=e+8|0;g=e;h=lt(a)|0;a=c[h+4>>2]|0;c[g>>2]=c[h>>2];c[g+4>>2]=a;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];d=mt(b,f,d)|0;l=e;return d|0}function kt(){return 836}function lt(a){a=a|0;return (c[(dt()|0)+24>>2]|0)+(a*12|0)|0}function mt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;h=l;l=l+16|0;f=h;g=h+8|0;e=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)e=c[(c[a>>2]|0)+e>>2]|0;uh(g,d);g=vh(g,d)|0;Cb[e&15](f,a,g);g=nt(f)|0;ml(f);l=h;return g|0}function nt(a){a=a|0;var b=0,d=0,e=0,f=0;d=Bw(8)|0;b=d;f=c[a>>2]|0;c[b+4>>2]=f;e=_A(8)|0;c[e>>2]=f;f=a+4|0;c[e+4>>2]=c[f>>2];c[a>>2]=0;c[f>>2]=0;c[d>>2]=e;return b|0}function ot(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function pt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=ut(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;rt(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];qt(g,e,d);c[j>>2]=(c[j>>2]|0)+12;st(a,i);tt(i);l=k;return}}function qt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function rt(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function st(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function tt(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function ut(a){a=a|0;return 357913941}function vt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+16|0;f=e+8|0;g=e;i=c[d>>2]|0;h=c[d+4>>2]|0;d=Kf(b)|0;c[g>>2]=i;c[g+4>>2]=h;c[f>>2]=c[g>>2];c[f+4>>2]=c[g+4>>2];wt(a,d,f,0);l=e;return}function wt(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;f=l;l=l+32|0;g=f+16|0;m=f+8|0;i=f;k=c[d>>2]|0;j=c[d+4>>2]|0;h=c[a>>2]|0;a=xt()|0;c[m>>2]=k;c[m+4>>2]=j;c[g>>2]=c[m>>2];c[g+4>>2]=c[m+4>>2];d=yt(g)|0;c[i>>2]=k;c[i+4>>2]=j;c[g>>2]=c[i>>2];c[g+4>>2]=c[i+4>>2];We(h,b,a,d,zt(g,e)|0,e);l=f;return}function xt(){var b=0,d=0;if(!(a[6128]|0)){At(7520);xa(59,7520,o|0)|0;d=6128;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7520)|0)){b=7520;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));At(7520)}return 7520}function yt(a){a=a|0;return 0}function zt(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0;m=l;l=l+32|0;f=m+24|0;h=m+16|0;i=m;j=m+8|0;g=c[a>>2]|0;e=c[a+4>>2]|0;c[i>>2]=g;c[i+4>>2]=e;n=xt()|0;k=n+24|0;a=Wf(b,4)|0;c[j>>2]=a;b=n+28|0;d=c[b>>2]|0;if(d>>>0<(c[n+32>>2]|0)>>>0){c[h>>2]=g;c[h+4>>2]=e;c[f>>2]=c[h>>2];c[f+4>>2]=c[h+4>>2];Jt(d,f,a);a=(c[b>>2]|0)+12|0;c[b>>2]=a}else{It(k,i,j);a=c[b>>2]|0}l=m;return ((a-(c[k>>2]|0)|0)/12|0)+-1|0}function At(a){a=a|0;Ct(a);return}function Bt(a){a=a|0;Ht(a+24|0);return}function Ct(a){a=a|0;var b=0;b=ff()|0;hf(a,2,60,b,Et()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Dt(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=l;l=l+16|0;e=d+8|0;f=d;g=Ft(a)|0;a=c[g+4>>2]|0;c[f>>2]=c[g>>2];c[f+4>>2]=a;c[e>>2]=c[f>>2];c[e+4>>2]=c[f+4>>2];Gt(b,e);l=d;return}function Et(){return 844}function Ft(a){a=a|0;return (c[(xt()|0)+24>>2]|0)+(a*12|0)|0}function Gt(a,b){a=a|0;b=b|0;var d=0;d=c[b>>2]|0;b=c[b+4>>2]|0;a=a+(b>>1)|0;if(b&1)d=c[(c[a>>2]|0)+d>>2]|0;rb[d&127](a);return}function Ht(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~(((b+-12-e|0)>>>0)/12|0)*12|0);aB(d)}return}function It(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0;k=l;l=l+48|0;e=k+32|0;h=k+24|0;i=k;j=a+4|0;f=(((c[j>>2]|0)-(c[a>>2]|0)|0)/12|0)+1|0;g=Nt(a)|0;if(g>>>0<f>>>0)QA(a);else{m=c[a>>2]|0;o=((c[a+8>>2]|0)-m|0)/12|0;n=o<<1;Kt(i,o>>>0<g>>>1>>>0?(n>>>0<f>>>0?f:n):g,((c[j>>2]|0)-m|0)/12|0,a+8|0);j=i+8|0;g=c[j>>2]|0;f=c[b+4>>2]|0;d=c[d>>2]|0;c[h>>2]=c[b>>2];c[h+4>>2]=f;c[e>>2]=c[h>>2];c[e+4>>2]=c[h+4>>2];Jt(g,e,d);c[j>>2]=(c[j>>2]|0)+12;Lt(a,i);Mt(i);l=k;return}}function Jt(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[b+4>>2]|0;c[a>>2]=c[b>>2];c[a+4>>2]=e;c[a+8>>2]=d;return}function Kt(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>357913941)Pa();else{f=_A(b*12|0)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d*12|0)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b*12|0);return}function Lt(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(((f|0)/-12|0)*12|0)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Mt(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~(((e+-12-b|0)>>>0)/12|0)*12|0);a=c[a>>2]|0;if(a|0)aB(a);return}function Nt(a){a=a|0;return 357913941}function Ot(){me();oe();qe();return}function Pt(){Qt();return}function Qt(){Rt(7556);return}function Rt(a){a=a|0;St(a,3191);return}function St(a,b){a=a|0;b=b|0;var d=0;d=Tt()|0;c[a>>2]=d;Ut(d,b);Vt(c[a>>2]|0);return}function Tt(){var b=0;if(!(a[6136]|0)){du(7564);xa(26,7564,o|0)|0;b=6136;c[b>>2]=1;c[b+4>>2]=0}return 7564}function Ut(a,b){a=a|0;b=b|0;c[a>>2]=_t()|0;c[a+4>>2]=$t()|0;c[a+12>>2]=b;c[a+8>>2]=au()|0;c[a+32>>2]=5;return}function Vt(a){a=a|0;var b=0,d=0;b=l;l=l+16|0;d=b;Wt()|0;c[d>>2]=a;Xt(7560,d);l=b;return}function Wt(){if(!(a[8665]|0)){c[1890]=0;xa(60,7560,o|0)|0;a[8665]=1}return 7560}function Xt(a,b){a=a|0;b=b|0;var d=0;d=_A(8)|0;c[d+4>>2]=c[b>>2];c[d>>2]=c[a>>2];c[a>>2]=d;return}function Yt(a){a=a|0;Zt(a);return}function Zt(a){a=a|0;var b=0,d=0;b=c[a>>2]|0;if(b|0)do{d=b;b=c[b>>2]|0;aB(d)}while((b|0)!=0);c[a>>2]=0;return}function _t(){return 8666}function $t(){return 852}function au(){return Qe()|0}function bu(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if((Se(d,896)|0)==512){if(c|0){cu(c);aB(c)}}else if(b|0)aB(b);return}function cu(a){a=a|0;a=c[a+4>>2]|0;if(a|0)YA(a);return}function du(a){a=a|0;He(a);return}function eu(a,b){a=a|0;b=b|0;var d=0,e=0;Wt()|0;d=c[1890]|0;a:do if(d|0){while(1){e=c[d+4>>2]|0;if(e|0?(aA(fu(e)|0,a)|0)==0:0)break;d=c[d>>2]|0;if(!d)break a}gu(e,b)}while(0);return}function fu(a){a=a|0;return c[a+12>>2]|0}function gu(a,b){a=a|0;b=b|0;var d=0;a=a+36|0;d=c[a>>2]|0;if(d|0){hu(d);aB(d)}d=_A(4)|0;iu(d,b);c[a>>2]=d;return}function hu(a){a=a|0;hq(a);return}function iu(a,b){a=a|0;b=b|0;Vp(a,b);return}function ju(){if(!(a[8667]|0)){c[1902]=0;xa(61,7608,o|0)|0;a[8667]=1}return 7608}function ku(){var b=0;if(!(a[8668]|0)){lu();c[1903]=860;a[8668]=1;b=860}else b=c[1903]|0;return b|0}function lu(){if(!(a[8692]|0)){a[8669]=Wf(Wf(8,0)|0,0)|0;a[8670]=Wf(Wf(0,0)|0,0)|0;a[8671]=Wf(Wf(0,16)|0,0)|0;a[8672]=Wf(Wf(8,0)|0,0)|0;a[8673]=Wf(Wf(0,0)|0,0)|0;a[8674]=Wf(Wf(8,0)|0,0)|0;a[8675]=Wf(Wf(0,0)|0,0)|0;a[8676]=Wf(Wf(8,0)|0,0)|0;a[8677]=Wf(Wf(0,0)|0,0)|0;a[8678]=Wf(Wf(8,0)|0,0)|0;a[8679]=Wf(Wf(0,0)|0,0)|0;a[8680]=Wf(Wf(0,0)|0,32)|0;a[8681]=Wf(Wf(0,0)|0,32)|0;a[8692]=1}return}function mu(){return 928}function nu(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;u=l;l=l+32|0;q=u+20|0;r=u+8|0;s=u+4|0;t=u;b=c[b>>2]|0;if(b|0){p=q+4|0;j=q+8|0;k=r+4|0;m=r+8|0;n=r+8|0;o=q+8|0;do{h=b+4|0;i=ou(h)|0;if(i|0){f=pu(i)|0;c[q>>2]=0;c[p>>2]=0;c[j>>2]=0;e=(qu(i)|0)+1|0;ru(q,e);if(e|0)while(1){e=e+-1|0;lz(r,c[f>>2]|0);g=c[p>>2]|0;if(g>>>0<(c[o>>2]|0)>>>0){c[g>>2]=c[r>>2];c[p>>2]=(c[p>>2]|0)+4}else su(q,r);if(!e)break;else f=f+4|0}e=tu(i)|0;c[r>>2]=0;c[k>>2]=0;c[m>>2]=0;a:do if(c[e>>2]|0){f=0;g=0;while(1){if((f|0)==(g|0))uu(r,e);else{c[f>>2]=c[e>>2];c[k>>2]=(c[k>>2]|0)+4}e=e+4|0;if(!(c[e>>2]|0))break a;f=c[k>>2]|0;g=c[n>>2]|0}}while(0);c[s>>2]=vu(h)|0;c[t>>2]=af(i)|0;wu(d,a,s,t,q,r);xu(r);yu(q)}b=c[b>>2]|0}while((b|0)!=0)}l=u;return}function ou(a){a=a|0;return c[a+12>>2]|0}function pu(a){a=a|0;return c[a+12>>2]|0}function qu(a){a=a|0;return c[a+16>>2]|0}function ru(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=l;l=l+32|0;d=f;e=c[a>>2]|0;if((c[a+8>>2]|0)-e>>2>>>0<b>>>0){hv(d,b,(c[a+4>>2]|0)-e>>2,a+8|0);iv(a,d);jv(d)}l=f;return}function su(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;h=l;l=l+32|0;d=h;e=a+4|0;f=((c[e>>2]|0)-(c[a>>2]|0)>>2)+1|0;g=dv(a)|0;if(g>>>0<f>>>0)QA(a);else{i=c[a>>2]|0;k=(c[a+8>>2]|0)-i|0;j=k>>1;hv(d,k>>2>>>0<g>>>1>>>0?(j>>>0<f>>>0?f:j):g,(c[e>>2]|0)-i>>2,a+8|0);g=d+8|0;c[c[g>>2]>>2]=c[b>>2];c[g>>2]=(c[g>>2]|0)+4;iv(a,d);jv(d);l=h;return}}function tu(a){a=a|0;return c[a+8>>2]|0}function uu(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0;h=l;l=l+32|0;d=h;e=a+4|0;f=((c[e>>2]|0)-(c[a>>2]|0)>>2)+1|0;g=av(a)|0;if(g>>>0<f>>>0)QA(a);else{i=c[a>>2]|0;k=(c[a+8>>2]|0)-i|0;j=k>>1;ev(d,k>>2>>>0<g>>>1>>>0?(j>>>0<f>>>0?f:j):g,(c[e>>2]|0)-i>>2,a+8|0);g=d+8|0;c[c[g>>2]>>2]=c[b>>2];c[g>>2]=(c[g>>2]|0)+4;fv(a,d);gv(d);l=h;return}}function vu(a){a=a|0;return c[a>>2]|0}function wu(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;zu(a,b,c,d,e,f);return}function xu(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-4-e|0)>>>2)<<2);aB(d)}return}function yu(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-4-e|0)>>>2)<<2);aB(d)}return}function zu(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,m=0,n=0;h=l;l=l+48|0;m=h+40|0;i=h+32|0;n=h+24|0;j=h+12|0;k=h;rz(i);a=_p(a)|0;c[n>>2]=c[b>>2];d=c[d>>2]|0;e=c[e>>2]|0;Au(j,f);Bu(k,g);c[m>>2]=c[n>>2];Cu(a,m,d,e,j,k);xu(k);yu(j);tz(i);l=h;return}function Au(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;d=b+4|0;e=(c[d>>2]|0)-(c[b>>2]|0)>>2;if(e|0){bv(a,e);cv(a,c[b>>2]|0,c[d>>2]|0,e)}return}function Bu(a,b){a=a|0;b=b|0;var d=0,e=0;c[a>>2]=0;c[a+4>>2]=0;c[a+8>>2]=0;d=b+4|0;e=(c[d>>2]|0)-(c[b>>2]|0)>>2;if(e|0){_u(a,e);$u(a,c[b>>2]|0,c[d>>2]|0,e)}return}function Cu(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,m=0,n=0;h=l;l=l+32|0;m=h+28|0;n=h+24|0;i=h+12|0;j=h;k=bq(Du()|0)|0;c[n>>2]=c[b>>2];c[m>>2]=c[n>>2];b=Eu(m)|0;d=Fu(d)|0;e=Gu(e)|0;c[i>>2]=c[f>>2];m=f+4|0;c[i+4>>2]=c[m>>2];n=f+8|0;c[i+8>>2]=c[n>>2];c[n>>2]=0;c[m>>2]=0;c[f>>2]=0;f=Hu(i)|0;c[j>>2]=c[g>>2];m=g+4|0;c[j+4>>2]=c[m>>2];n=g+8|0;c[j+8>>2]=c[n>>2];c[n>>2]=0;c[m>>2]=0;c[g>>2]=0;Wa(0,k|0,a|0,b|0,d|0,e|0,f|0,Iu(j)|0)|0;xu(j);yu(i);l=h;return}function Du(){var b=0;if(!(a[6152]|0)){Yu(7660);b=6152;c[b>>2]=1;c[b+4>>2]=0}return 7660}function Eu(a){a=a|0;return Mu(a)|0}function Fu(a){a=a|0;return Ku(a)|0}function Gu(a){a=a|0;return Oi(a)|0}function Hu(a){a=a|0;return Lu(a)|0}function Iu(a){a=a|0;return Ju(a)|0}function Ju(a){a=a|0;var b=0,d=0,e=0;e=(c[a+4>>2]|0)-(c[a>>2]|0)|0;d=e>>2;e=Bw(e+4|0)|0;c[e>>2]=d;if(d|0){b=0;do{c[e+4+(b<<2)>>2]=Ku(c[(c[a>>2]|0)+(b<<2)>>2]|0)|0;b=b+1|0}while((b|0)!=(d|0))}return e|0}function Ku(a){a=a|0;return a|0}function Lu(a){a=a|0;var b=0,d=0,e=0;e=(c[a+4>>2]|0)-(c[a>>2]|0)|0;d=e>>2;e=Bw(e+4|0)|0;c[e>>2]=d;if(d|0){b=0;do{c[e+4+(b<<2)>>2]=Mu((c[a>>2]|0)+(b<<2)|0)|0;b=b+1|0}while((b|0)!=(d|0))}return e|0}function Mu(a){a=a|0;var b=0,c=0,d=0,e=0;e=l;l=l+32|0;b=e+12|0;c=e;d=Ou(Nu()|0)|0;if(!d)a=Su(a)|0;else{Pu(b,d);Qu(c,b);oz(a,c);a=Ru(b)|0}l=e;return a|0}function Nu(){var b=0;if(!(a[6144]|0)){Xu(7616);xa(26,7616,o|0)|0;b=6144;c[b>>2]=1;c[b+4>>2]=0}return 7616}function Ou(a){a=a|0;return c[a+36>>2]|0}function Pu(a,b){a=a|0;b=b|0;c[a>>2]=b;c[a+4>>2]=a;c[a+8>>2]=0;return}function Qu(a,b){a=a|0;b=b|0;c[a>>2]=c[b>>2];c[a+4>>2]=c[b+4>>2];c[a+8>>2]=0;return}function Ru(a){a=a|0;return c[(c[a+4>>2]|0)+8>>2]|0}function Su(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;d=l;l=l+16|0;f=d+4|0;h=d;e=Bw(8)|0;b=e;i=_A(4)|0;c[i>>2]=c[a>>2];g=b+4|0;c[g>>2]=i;a=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];Tu(a,g,f);c[e>>2]=a;l=d;return b|0}function Tu(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;d=_A(16)|0;c[d+4>>2]=0;c[d+8>>2]=0;c[d>>2]=1020;c[d+12>>2]=b;c[a+4>>2]=d;return}function Uu(a){a=a|0;RA(a);aB(a);return}function Vu(a){a=a|0;a=c[a+12>>2]|0;if(a|0)aB(a);return}function Wu(a){a=a|0;aB(a);return}function Xu(a){a=a|0;He(a);return}function Yu(a){a=a|0;fq(a,Zu()|0,5);return}function Zu(){return 1040}function _u(a,b){a=a|0;b=b|0;var d=0;if((av(a)|0)>>>0<b>>>0)QA(a);if(b>>>0>1073741823)Pa();else{d=_A(b<<2)|0;c[a+4>>2]=d;c[a>>2]=d;c[a+8>>2]=d+(b<<2);return}}function $u(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a+4|0;a=d-b|0;if((a|0)>0){mB(c[e>>2]|0,b|0,a|0)|0;c[e>>2]=(c[e>>2]|0)+(a>>>2<<2)}return}function av(a){a=a|0;return 1073741823}function bv(a,b){a=a|0;b=b|0;var d=0;if((dv(a)|0)>>>0<b>>>0)QA(a);if(b>>>0>1073741823)Pa();else{d=_A(b<<2)|0;c[a+4>>2]=d;c[a>>2]=d;c[a+8>>2]=d+(b<<2);return}}function cv(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;e=a+4|0;a=d-b|0;if((a|0)>0){mB(c[e>>2]|0,b|0,a|0)|0;c[e>>2]=(c[e>>2]|0)+(a>>>2<<2)}return}function dv(a){a=a|0;return 1073741823}function ev(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>1073741823)Pa();else{f=_A(b<<2)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<2)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<2);return}function fv(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(0-(f>>2)<<2)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function gv(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~((e+-4-b|0)>>>2)<<2);a=c[a>>2]|0;if(a|0)aB(a);return}function hv(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>1073741823)Pa();else{f=_A(b<<2)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<2)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<2);return}function iv(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(0-(f>>2)<<2)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function jv(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~((e+-4-b|0)>>>2)<<2);a=c[a>>2]|0;if(a|0)aB(a);return}function kv(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0;r=l;l=l+32|0;m=r+20|0;n=r+12|0;k=r+16|0;o=r+4|0;p=r;q=r+8|0;i=ku()|0;g=c[i>>2]|0;h=c[g>>2]|0;if(h|0){j=c[i+8>>2]|0;i=c[i+4>>2]|0;while(1){lz(m,h);lv(a,m,i,j);g=g+4|0;h=c[g>>2]|0;if(!h)break;else{j=j+1|0;i=i+1|0}}}g=mu()|0;h=c[g>>2]|0;if(h|0)do{lz(m,h);c[n>>2]=c[g+4>>2];mv(b,m,n);g=g+8|0;h=c[g>>2]|0}while((h|0)!=0);g=c[(Wt()|0)>>2]|0;if(g|0)do{b=c[g+4>>2]|0;lz(m,c[(nv(b)|0)>>2]|0);c[n>>2]=fu(b)|0;ov(d,m,n);g=c[g>>2]|0}while((g|0)!=0);lz(k,0);g=ju()|0;c[m>>2]=c[k>>2];nu(m,g,f);g=c[(Wt()|0)>>2]|0;if(g|0){a=m+4|0;b=m+8|0;d=m+8|0;do{j=c[g+4>>2]|0;lz(n,c[(nv(j)|0)>>2]|0);qv(o,pv(j)|0);h=c[o>>2]|0;if(h|0){c[m>>2]=0;c[a>>2]=0;c[b>>2]=0;do{lz(p,c[(nv(c[h+4>>2]|0)|0)>>2]|0);i=c[a>>2]|0;if(i>>>0<(c[d>>2]|0)>>>0){c[i>>2]=c[p>>2];c[a>>2]=(c[a>>2]|0)+4}else su(m,p);h=c[h>>2]|0}while((h|0)!=0);rv(e,n,m);yu(m)}c[q>>2]=c[n>>2];k=sv(j)|0;c[m>>2]=c[q>>2];nu(m,k,f);Je(o);g=c[g>>2]|0}while((g|0)!=0)}l=r;return}function lv(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Gv(a,b,c,d);return}function mv(a,b,c){a=a|0;b=b|0;c=c|0;Fv(a,b,c);return}function nv(a){a=a|0;return a|0}function ov(a,b,c){a=a|0;b=b|0;c=c|0;Av(a,b,c);return}function pv(a){a=a|0;return a+16|0}function qv(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;g=l;l=l+16|0;f=g+8|0;d=g;c[a>>2]=0;e=c[b>>2]|0;c[f>>2]=e;c[d>>2]=a;d=yv(d)|0;if(e|0){e=_A(12)|0;h=(zv(f)|0)+4|0;a=c[h+4>>2]|0;b=e+4|0;c[b>>2]=c[h>>2];c[b+4>>2]=a;b=c[c[f>>2]>>2]|0;c[f>>2]=b;if(!b)a=e;else{b=e;while(1){a=_A(12)|0;j=(zv(f)|0)+4|0;i=c[j+4>>2]|0;h=a+4|0;c[h>>2]=c[j>>2];c[h+4>>2]=i;c[b>>2]=a;h=c[c[f>>2]>>2]|0;c[f>>2]=h;if(!h)break;else b=a}}c[a>>2]=c[d>>2];c[d>>2]=e}l=g;return}function rv(a,b,c){a=a|0;b=b|0;c=c|0;tv(a,b,c);return}function sv(a){a=a|0;return a+24|0}function tv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+32|0;h=e+24|0;f=e+16|0;i=e+12|0;g=e;rz(f);a=_p(a)|0;c[i>>2]=c[b>>2];Au(g,d);c[h>>2]=c[i>>2];uv(a,h,g);yu(g);tz(f);l=e;return}function uv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;e=l;l=l+32|0;h=e+16|0;i=e+12|0;f=e;g=bq(vv()|0)|0;c[i>>2]=c[b>>2];c[h>>2]=c[i>>2];b=Eu(h)|0;c[f>>2]=c[d>>2];h=d+4|0;c[f+4>>2]=c[h>>2];i=d+8|0;c[f+8>>2]=c[i>>2];c[i>>2]=0;c[h>>2]=0;c[d>>2]=0;Ua(0,g|0,a|0,b|0,Hu(f)|0)|0;yu(f);l=e;return}function vv(){var b=0;if(!(a[6160]|0)){wv(7672);b=6160;c[b>>2]=1;c[b+4>>2]=0}return 7672}function wv(a){a=a|0;fq(a,xv()|0,2);return}function xv(){return 1096}function yv(a){a=a|0;return c[a>>2]|0}function zv(a){a=a|0;return c[a>>2]|0}function Av(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+32|0;g=e+16|0;f=e+8|0;h=e;rz(f);a=_p(a)|0;c[h>>2]=c[b>>2];d=c[d>>2]|0;c[g>>2]=c[h>>2];Bv(a,g,d);tz(f);l=e;return}function Bv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+16|0;g=e+4|0;h=e;f=bq(Cv()|0)|0;c[h>>2]=c[b>>2];c[g>>2]=c[h>>2];b=Eu(g)|0;Ua(0,f|0,a|0,b|0,Fu(d)|0)|0;l=e;return}function Cv(){var b=0;if(!(a[6168]|0)){Dv(7684);b=6168;c[b>>2]=1;c[b+4>>2]=0}return 7684}function Dv(a){a=a|0;fq(a,Ev()|0,2);return}function Ev(){return 1108}function Fv(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0;e=l;l=l+32|0;g=e+16|0;f=e+8|0;h=e;rz(f);a=_p(a)|0;c[h>>2]=c[b>>2];d=c[d>>2]|0;c[g>>2]=c[h>>2];Bv(a,g,d);tz(f);l=e;return}function Gv(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;g=l;l=l+32|0;i=g+16|0;h=g+8|0;j=g;rz(h);b=_p(b)|0;c[j>>2]=c[d>>2];e=a[e>>0]|0;f=a[f>>0]|0;c[i>>2]=c[j>>2];Hv(b,i,e,f);tz(h);l=g;return}function Hv(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=l;l=l+16|0;h=f+4|0;i=f;g=bq(Iv()|0)|0;c[i>>2]=c[b>>2];c[h>>2]=c[i>>2];b=Eu(h)|0;d=Jv(d)|0;Va(0,g|0,a|0,b|0,d|0,Jv(e)|0)|0;l=f;return}function Iv(){var b=0;if(!(a[6176]|0)){Lv(7696);b=6176;c[b>>2]=1;c[b+4>>2]=0}return 7696}function Jv(a){a=a|0;return Kv(a)|0}function Kv(a){a=a|0;return a&255|0}function Lv(a){a=a|0;fq(a,Mv()|0,3);return}function Mv(){return 1120}function Nv(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0;p=l;l=l+32|0;j=p+8|0;k=p+4|0;m=p+20|0;n=p;Jp(b,0);f=nz(d)|0;c[j>>2]=0;o=j+4|0;c[o>>2]=0;c[j+8>>2]=0;switch(f<<24>>24){case 0:{a[m>>0]=0;Ov(k,e,m);Pv(b,k)|0;hq(k);break}case 8:{o=mz(d)|0;a[m>>0]=8;lz(n,c[o+4>>2]|0);Qv(k,e,m,n,o+8|0);Pv(b,k)|0;hq(k);break}case 9:{h=mz(d)|0;d=c[h+4>>2]|0;if(d|0){i=j+8|0;g=h+12|0;while(1){d=d+-1|0;lz(k,c[g>>2]|0);f=c[o>>2]|0;if(f>>>0<(c[i>>2]|0)>>>0){c[f>>2]=c[k>>2];c[o>>2]=(c[o>>2]|0)+4}else su(j,k);if(!d)break;else g=g+4|0}}a[m>>0]=9;lz(n,c[h+8>>2]|0);Rv(k,e,m,n,j);Pv(b,k)|0;hq(k);break}default:{o=mz(d)|0;a[m>>0]=f;lz(n,c[o+4>>2]|0);Sv(k,e,m,n);Pv(b,k)|0;hq(k)}}yu(j);l=p;return}function Ov(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;e=l;l=l+16|0;f=e;rz(f);c=_p(c)|0;ew(b,c,a[d>>0]|0);tz(f);l=e;return}function Pv(a,b){a=a|0;b=b|0;var d=0;d=c[a>>2]|0;if(d|0)Ga(d|0);c[a>>2]=c[b>>2];c[b>>2]=0;return a|0}function Qv(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;h=l;l=l+32|0;j=h+16|0;i=h+8|0;k=h;rz(i);d=_p(d)|0;e=a[e>>0]|0;c[k>>2]=c[f>>2];g=c[g>>2]|0;c[j>>2]=c[k>>2];aw(b,d,e,j,g);tz(i);l=h;return}function Rv(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,m=0;h=l;l=l+32|0;k=h+24|0;i=h+16|0;m=h+12|0;j=h;rz(i);d=_p(d)|0;e=a[e>>0]|0;c[m>>2]=c[f>>2];Au(j,g);c[k>>2]=c[m>>2];Yv(b,d,e,k,j);yu(j);tz(i);l=h;return}function Sv(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;g=l;l=l+32|0;i=g+16|0;h=g+8|0;j=g;rz(h);d=_p(d)|0;e=a[e>>0]|0;c[j>>2]=c[f>>2];c[i>>2]=c[j>>2];Tv(b,d,e,i);tz(h);l=g;return}function Tv(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=l;l=l+16|0;g=f+4|0;i=f;h=bq(Uv()|0)|0;d=Jv(d)|0;c[i>>2]=c[e>>2];c[g>>2]=c[i>>2];Vv(a,Ua(0,h|0,b|0,d|0,Eu(g)|0)|0);l=f;return}function Uv(){var b=0;if(!(a[6184]|0)){Wv(7708);b=6184;c[b>>2]=1;c[b+4>>2]=0}return 7708}function Vv(a,b){a=a|0;b=b|0;Jp(a,b);return}function Wv(a){a=a|0;fq(a,Xv()|0,2);return}function Xv(){return 1136}function Yv(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;g=l;l=l+32|0;j=g+16|0;k=g+12|0;h=g;i=bq(Zv()|0)|0;d=Jv(d)|0;c[k>>2]=c[e>>2];c[j>>2]=c[k>>2];e=Eu(j)|0;c[h>>2]=c[f>>2];j=f+4|0;c[h+4>>2]=c[j>>2];k=f+8|0;c[h+8>>2]=c[k>>2];c[k>>2]=0;c[j>>2]=0;c[f>>2]=0;Vv(a,Va(0,i|0,b|0,d|0,e|0,Hu(h)|0)|0);yu(h);l=g;return}function Zv(){var b=0;if(!(a[6192]|0)){_v(7720);b=6192;c[b>>2]=1;c[b+4>>2]=0}return 7720}function _v(a){a=a|0;fq(a,$v()|0,3);return}function $v(){return 1148}function aw(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0;g=l;l=l+16|0;i=g+4|0;j=g;h=bq(bw()|0)|0;d=Jv(d)|0;c[j>>2]=c[e>>2];c[i>>2]=c[j>>2];e=Eu(i)|0;Vv(a,Va(0,h|0,b|0,d|0,e|0,Gu(f)|0)|0);l=g;return}function bw(){var b=0;if(!(a[6200]|0)){cw(7732);b=6200;c[b>>2]=1;c[b+4>>2]=0}return 7732}function cw(a){a=a|0;fq(a,dw()|0,3);return}function dw(){return 1164}function ew(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;d=bq(fw()|0)|0;Vv(a,Ta(0,d|0,b|0,Jv(c)|0)|0);return}function fw(){var b=0;if(!(a[6208]|0)){gw(7744);b=6208;c[b>>2]=1;c[b+4>>2]=0}return 7744}function gw(a){a=a|0;fq(a,hw()|0,1);return}function hw(){return 1180}function iw(){jw();kw();lw();return}function jw(){c[1940]=$A(65536)|0;return}function kw(){Kw(7816);return}function lw(){mw(7768);return}function mw(a){a=a|0;nw(a,3280);ow(a)|0;return}function nw(a,b){a=a|0;b=b|0;var d=0;d=Nu()|0;c[a>>2]=d;Cw(d,b);Vt(c[a>>2]|0);return}function ow(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,pw()|0);return a|0}function pw(){var b=0;if(!(a[6216]|0)){qw(7772);xa(62,7772,o|0)|0;b=6216;c[b>>2]=1;c[b+4>>2]=0}if(!(af(7772)|0))qw(7772);return 7772}function qw(a){a=a|0;tw(a);cf(a,61);return}function rw(a){a=a|0;sw(a+24|0);return}function sw(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function tw(a){a=a|0;var b=0;b=ff()|0;hf(a,5,16,b,yw()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function uw(a,b){a=a|0;b=b|0;vw(a,b);return}function vw(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=l;l=l+16|0;e=d;f=d+4|0;uh(f,b);c[e>>2]=vh(f,b)|0;ww(a,e);l=d;return}function ww(b,d){b=b|0;d=d|0;xw(b+4|0,c[d>>2]|0);a[b+8>>0]=1;return}function xw(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function yw(){return 1188}function zw(a){a=a|0;return Aw(a)|0}function Aw(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0;d=l;l=l+16|0;f=d+4|0;h=d;e=Bw(8)|0;b=e;i=_A(4)|0;uh(f,a);xw(i,vh(f,a)|0);g=b+4|0;c[g>>2]=i;a=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];Tu(a,g,f);c[e>>2]=a;l=d;return b|0}function Bw(a){a=a|0;var b=0,d=0;a=a+7&-8;if(a>>>0<=32768?(b=c[1939]|0,a>>>0<=(65536-b|0)>>>0):0){d=(c[1940]|0)+b|0;c[1939]=b+a;a=d}else{a=$A(a+8|0)|0;c[a>>2]=c[1941];c[1941]=a;a=a+8|0}return a|0}function Cw(a,b){a=a|0;b=b|0;c[a>>2]=Dw()|0;c[a+4>>2]=Ew()|0;c[a+12>>2]=b;c[a+8>>2]=Fw()|0;c[a+32>>2]=6;return}function Dw(){return 8697}function Ew(){return 1196}function Fw(){return Iw()|0}function Gw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if((Se(d,896)|0)==512){if(c|0){Hw(c);aB(c)}}else if(b|0)aB(b);return}function Hw(a){a=a|0;a=c[a+4>>2]|0;if(a|0)YA(a);return}function Iw(){var b=0;if(!(a[6224]|0)){c[1952]=Jw()|0;c[1953]=0;b=6224;c[b>>2]=1;c[b+4>>2]=0}return 7808}function Jw(){return c[301]|0}function Kw(a){a=a|0;Lw(a,3294);Mw(a)|0;Nw(a,3300,62)|0;Ow(a,3311,1)|0;Pw(a,3319,13)|0;Qw(a,3329,17)|0;Sw(a,3336,63)|0;return}function Lw(a,b){a=a|0;b=b|0;var d=0;d=dz()|0;c[a>>2]=d;ez(d,b);Vt(c[a>>2]|0);return}function Mw(a){a=a|0;var b=0;b=c[a>>2]|0;Ue(b,Qy()|0);return a|0}function Nw(a,b,c){a=a|0;b=b|0;c=c|0;vy(a,Kf(b)|0,c,0);return a|0}function Ow(a,b,c){a=a|0;b=b|0;c=c|0;dy(a,Kf(b)|0,c,0);return a|0}function Pw(a,b,c){a=a|0;b=b|0;c=c|0;Bx(a,Kf(b)|0,c,0);return a|0}function Qw(a,b,c){a=a|0;b=b|0;c=c|0;jx(a,Kf(b)|0,c,0);return a|0}function Rw(a,b){a=a|0;b=b|0;var d=0,e=0;a:while(1){d=c[1941]|0;while(1){if((d|0)==(b|0))break a;e=c[d>>2]|0;c[1941]=e;if(!d)d=e;else break}aB(d)}c[1939]=a;return}function Sw(a,b,c){a=a|0;b=b|0;c=c|0;Tw(a,Kf(b)|0,c,0);return a|0}function Tw(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=c[a>>2]|0;f=Uw()|0;a=Vw(d)|0;We(g,b,f,a,Ww(d,e)|0,e);return}function Uw(){var b=0,d=0;if(!(a[6232]|0)){bx(7820);xa(63,7820,o|0)|0;d=6232;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7820)|0)){b=7820;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));bx(7820)}return 7820}function Vw(a){a=a|0;return a|0}function Ww(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=l;l=l+16|0;f=i;g=i+4|0;c[f>>2]=a;j=Uw()|0;h=j+24|0;b=Wf(b,4)|0;c[g>>2]=b;d=j+28|0;e=c[d>>2]|0;if(e>>>0<(c[j+32>>2]|0)>>>0){Xw(e,a,b);b=(c[d>>2]|0)+8|0;c[d>>2]=b}else{Yw(h,f,g);b=c[d>>2]|0}l=i;return (b-(c[h>>2]|0)>>3)+-1|0}function Xw(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;c[a+4>>2]=d;return}function Yw(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0;i=l;l=l+32|0;f=i;g=a+4|0;h=((c[g>>2]|0)-(c[a>>2]|0)>>3)+1|0;e=Zw(a)|0;if(e>>>0<h>>>0)QA(a);else{j=c[a>>2]|0;m=(c[a+8>>2]|0)-j|0;k=m>>2;_w(f,m>>3>>>0<e>>>1>>>0?(k>>>0<h>>>0?h:k):e,(c[g>>2]|0)-j>>3,a+8|0);h=f+8|0;Xw(c[h>>2]|0,c[b>>2]|0,c[d>>2]|0);c[h>>2]=(c[h>>2]|0)+8;$w(a,f);ax(f);l=i;return}}function Zw(a){a=a|0;return 536870911}function _w(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>536870911)Pa();else{f=_A(b<<3)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<3)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<3);return}function $w(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(0-(f>>3)<<3)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function ax(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~((e+-8-b|0)>>>3)<<3);a=c[a>>2]|0;if(a|0)aB(a);return}function bx(a){a=a|0;ex(a);return}function cx(a){a=a|0;dx(a+24|0);return}function dx(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function ex(a){a=a|0;var b=0;b=ff()|0;hf(a,1,14,b,fx()|0,2);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function fx(){return 1208}function gx(a,b,d){a=a|0;b=b|0;d=d|0;ix(c[(hx(a)|0)>>2]|0,b,d);return}function hx(a){a=a|0;return (c[(Uw()|0)+24>>2]|0)+(a<<3)|0}function ix(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d+1|0;e=d;uh(f,b);b=vh(f,b)|0;uh(e,c);c=vh(e,c)|0;yb[a&63](b,c);l=d;return}function jx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=c[a>>2]|0;f=kx()|0;a=lx(d)|0;We(g,b,f,a,mx(d,e)|0,e);return}function kx(){var b=0,d=0;if(!(a[6240]|0)){tx(7856);xa(64,7856,o|0)|0;d=6240;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7856)|0)){b=7856;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));tx(7856)}return 7856}function lx(a){a=a|0;return a|0}function mx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=l;l=l+16|0;f=i;g=i+4|0;c[f>>2]=a;j=kx()|0;h=j+24|0;b=Wf(b,4)|0;c[g>>2]=b;d=j+28|0;e=c[d>>2]|0;if(e>>>0<(c[j+32>>2]|0)>>>0){nx(e,a,b);b=(c[d>>2]|0)+8|0;c[d>>2]=b}else{ox(h,f,g);b=c[d>>2]|0}l=i;return (b-(c[h>>2]|0)>>3)+-1|0}function nx(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;c[a+4>>2]=d;return}function ox(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0;i=l;l=l+32|0;f=i;g=a+4|0;h=((c[g>>2]|0)-(c[a>>2]|0)>>3)+1|0;e=px(a)|0;if(e>>>0<h>>>0)QA(a);else{j=c[a>>2]|0;m=(c[a+8>>2]|0)-j|0;k=m>>2;qx(f,m>>3>>>0<e>>>1>>>0?(k>>>0<h>>>0?h:k):e,(c[g>>2]|0)-j>>3,a+8|0);h=f+8|0;nx(c[h>>2]|0,c[b>>2]|0,c[d>>2]|0);c[h>>2]=(c[h>>2]|0)+8;rx(a,f);sx(f);l=i;return}}function px(a){a=a|0;return 536870911}function qx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>536870911)Pa();else{f=_A(b<<3)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<3)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<3);return}function rx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(0-(f>>3)<<3)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function sx(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~((e+-8-b|0)>>>3)<<3);a=c[a>>2]|0;if(a|0)aB(a);return}function tx(a){a=a|0;wx(a);return}function ux(a){a=a|0;vx(a+24|0);return}function vx(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function wx(a){a=a|0;var b=0;b=ff()|0;hf(a,1,7,b,xx()|0,1);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function xx(){return 1220}function yx(a,b){a=a|0;b=b|0;return Ax(c[(zx(a)|0)>>2]|0,b)|0}function zx(a){a=a|0;return (c[(kx()|0)+24>>2]|0)+(a<<3)|0}function Ax(a,b){a=a|0;b=b|0;var c=0,d=0;c=l;l=l+16|0;d=c;uh(d,b);b=vh(d,b)|0;b=Oi(nb[a&31](b)|0)|0;l=c;return b|0}function Bx(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=c[a>>2]|0;f=Cx()|0;a=Dx(d)|0;We(g,b,f,a,Ex(d,e)|0,e);return}function Cx(){var b=0,d=0;if(!(a[6248]|0)){Lx(7892);xa(65,7892,o|0)|0;d=6248;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7892)|0)){b=7892;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Lx(7892)}return 7892}function Dx(a){a=a|0;return a|0}function Ex(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=l;l=l+16|0;f=i;g=i+4|0;c[f>>2]=a;j=Cx()|0;h=j+24|0;b=Wf(b,4)|0;c[g>>2]=b;d=j+28|0;e=c[d>>2]|0;if(e>>>0<(c[j+32>>2]|0)>>>0){Fx(e,a,b);b=(c[d>>2]|0)+8|0;c[d>>2]=b}else{Gx(h,f,g);b=c[d>>2]|0}l=i;return (b-(c[h>>2]|0)>>3)+-1|0}function Fx(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;c[a+4>>2]=d;return}function Gx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0;i=l;l=l+32|0;f=i;g=a+4|0;h=((c[g>>2]|0)-(c[a>>2]|0)>>3)+1|0;e=Hx(a)|0;if(e>>>0<h>>>0)QA(a);else{j=c[a>>2]|0;m=(c[a+8>>2]|0)-j|0;k=m>>2;Ix(f,m>>3>>>0<e>>>1>>>0?(k>>>0<h>>>0?h:k):e,(c[g>>2]|0)-j>>3,a+8|0);h=f+8|0;Fx(c[h>>2]|0,c[b>>2]|0,c[d>>2]|0);c[h>>2]=(c[h>>2]|0)+8;Jx(a,f);Kx(f);l=i;return}}function Hx(a){a=a|0;return 536870911}function Ix(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>536870911)Pa();else{f=_A(b<<3)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<3)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<3);return}function Jx(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(0-(f>>3)<<3)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Kx(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~((e+-8-b|0)>>>3)<<3);a=c[a>>2]|0;if(a|0)aB(a);return}function Lx(a){a=a|0;Ox(a);return}function Mx(a){a=a|0;Nx(a+24|0);return}function Nx(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function Ox(a){a=a|0;var b=0;b=ff()|0;hf(a,1,4,b,Px()|0,2);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Px(){return 1228}function Qx(a,b,d){a=a|0;b=b|0;d=d|0;return Sx(c[(Rx(a)|0)>>2]|0,b,d)|0}function Rx(a){a=a|0;return (c[(Cx()|0)+24>>2]|0)+(a<<3)|0}function Sx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;e=l;l=l+32|0;h=e+12|0;g=e+8|0;i=e;j=e+16|0;f=e+4|0;Tx(j,b);Ux(i,j,b);Vx(f,d);d=Wx(f,d)|0;c[h>>2]=c[i>>2];Cb[a&15](g,h,d);d=Xx(g)|0;hq(g);Yx(f);l=e;return d|0}function Tx(a,b){a=a|0;b=b|0;return}function Ux(a,b,c){a=a|0;b=b|0;c=c|0;_x(a,c);return}function Vx(a,b){a=a|0;b=b|0;Zx(a,b);return}function Wx(a,b){a=a|0;b=b|0;return a|0}function Xx(a){a=a|0;return _p(a)|0}function Yx(a){a=a|0;hu(a);return}function Zx(a,b){a=a|0;b=b|0;Jp(a,b);return}function _x(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;f=l;l=l+16|0;d=f;e=b;if(!(e&1))c[a>>2]=c[b>>2];else{$x(d,0);Ha(e|0,d|0)|0;ay(a,d);by(d)}l=f;return}function $x(b,d){b=b|0;d=d|0;cy(b,d);c[b+4>>2]=0;a[b+8>>0]=0;return}function ay(a,b){a=a|0;b=b|0;c[a>>2]=c[b+4>>2];return}function by(b){b=b|0;a[b+8>>0]=0;return}function cy(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function dy(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=c[a>>2]|0;f=ey()|0;a=fy(d)|0;We(g,b,f,a,gy(d,e)|0,e);return}function ey(){var b=0,d=0;if(!(a[6256]|0)){ny(7928);xa(66,7928,o|0)|0;d=6256;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7928)|0)){b=7928;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));ny(7928)}return 7928}function fy(a){a=a|0;return a|0}function gy(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=l;l=l+16|0;f=i;g=i+4|0;c[f>>2]=a;j=ey()|0;h=j+24|0;b=Wf(b,4)|0;c[g>>2]=b;d=j+28|0;e=c[d>>2]|0;if(e>>>0<(c[j+32>>2]|0)>>>0){hy(e,a,b);b=(c[d>>2]|0)+8|0;c[d>>2]=b}else{iy(h,f,g);b=c[d>>2]|0}l=i;return (b-(c[h>>2]|0)>>3)+-1|0}function hy(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;c[a+4>>2]=d;return}function iy(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0;i=l;l=l+32|0;f=i;g=a+4|0;h=((c[g>>2]|0)-(c[a>>2]|0)>>3)+1|0;e=jy(a)|0;if(e>>>0<h>>>0)QA(a);else{j=c[a>>2]|0;m=(c[a+8>>2]|0)-j|0;k=m>>2;ky(f,m>>3>>>0<e>>>1>>>0?(k>>>0<h>>>0?h:k):e,(c[g>>2]|0)-j>>3,a+8|0);h=f+8|0;hy(c[h>>2]|0,c[b>>2]|0,c[d>>2]|0);c[h>>2]=(c[h>>2]|0)+8;ly(a,f);my(f);l=i;return}}function jy(a){a=a|0;return 536870911}function ky(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>536870911)Pa();else{f=_A(b<<3)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<3)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<3);return}function ly(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(0-(f>>3)<<3)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function my(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~((e+-8-b|0)>>>3)<<3);a=c[a>>2]|0;if(a|0)aB(a);return}function ny(a){a=a|0;qy(a);return}function oy(a){a=a|0;py(a+24|0);return}function py(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function qy(a){a=a|0;var b=0;b=ff()|0;hf(a,1,1,b,ry()|0,5);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function ry(){return 1240}function sy(a,b,d,e,f,g){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;uy(c[(ty(a)|0)>>2]|0,b,d,e,f,g);return}function ty(a){a=a|0;return (c[(ey()|0)+24>>2]|0)+(a<<3)|0}function uy(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,m=0;g=l;l=l+32|0;h=g+16|0;i=g+12|0;j=g+8|0;k=g+4|0;m=g;Vx(h,b);b=Wx(h,b)|0;Vx(i,c);c=Wx(i,c)|0;Vx(j,d);d=Wx(j,d)|0;Vx(k,e);e=Wx(k,e)|0;Vx(m,f);f=Wx(m,f)|0;Eb[a&1](b,c,d,e,f);Yx(m);Yx(k);Yx(j);Yx(i);Yx(h);l=g;return}function vy(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=c[a>>2]|0;f=wy()|0;a=xy(d)|0;We(g,b,f,a,yy(d,e)|0,e);return}function wy(){var b=0,d=0;if(!(a[6264]|0)){Fy(7964);xa(67,7964,o|0)|0;d=6264;c[d>>2]=1;c[d+4>>2]=0}if(!(af(7964)|0)){b=7964;d=b+36|0;do{c[b>>2]=0;b=b+4|0}while((b|0)<(d|0));Fy(7964)}return 7964}function xy(a){a=a|0;return a|0}function yy(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;i=l;l=l+16|0;f=i;g=i+4|0;c[f>>2]=a;j=wy()|0;h=j+24|0;b=Wf(b,4)|0;c[g>>2]=b;d=j+28|0;e=c[d>>2]|0;if(e>>>0<(c[j+32>>2]|0)>>>0){zy(e,a,b);b=(c[d>>2]|0)+8|0;c[d>>2]=b}else{Ay(h,f,g);b=c[d>>2]|0}l=i;return (b-(c[h>>2]|0)>>3)+-1|0}function zy(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;c[a+4>>2]=d;return}function Ay(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0;i=l;l=l+32|0;f=i;g=a+4|0;h=((c[g>>2]|0)-(c[a>>2]|0)>>3)+1|0;e=By(a)|0;if(e>>>0<h>>>0)QA(a);else{j=c[a>>2]|0;m=(c[a+8>>2]|0)-j|0;k=m>>2;Cy(f,m>>3>>>0<e>>>1>>>0?(k>>>0<h>>>0?h:k):e,(c[g>>2]|0)-j>>3,a+8|0);h=f+8|0;zy(c[h>>2]|0,c[b>>2]|0,c[d>>2]|0);c[h>>2]=(c[h>>2]|0)+8;Dy(a,f);Ey(f);l=i;return}}function By(a){a=a|0;return 536870911}function Cy(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0;c[a+12>>2]=0;c[a+16>>2]=e;do if(b)if(b>>>0>536870911)Pa();else{f=_A(b<<3)|0;break}else f=0;while(0);c[a>>2]=f;e=f+(d<<3)|0;c[a+8>>2]=e;c[a+4>>2]=e;c[a+12>>2]=f+(b<<3);return}function Dy(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0;e=c[a>>2]|0;h=a+4|0;g=b+4|0;f=(c[h>>2]|0)-e|0;d=(c[g>>2]|0)+(0-(f>>3)<<3)|0;c[g>>2]=d;if((f|0)>0){mB(d|0,e|0,f|0)|0;e=g;d=c[g>>2]|0}else e=g;g=c[a>>2]|0;c[a>>2]=d;c[e>>2]=g;g=b+8|0;f=c[h>>2]|0;c[h>>2]=c[g>>2];c[g>>2]=f;g=a+8|0;h=b+12|0;a=c[g>>2]|0;c[g>>2]=c[h>>2];c[h>>2]=a;c[b>>2]=c[e>>2];return}function Ey(a){a=a|0;var b=0,d=0,e=0;b=c[a+4>>2]|0;d=a+8|0;e=c[d>>2]|0;if((e|0)!=(b|0))c[d>>2]=e+(~((e+-8-b|0)>>>3)<<3);a=c[a>>2]|0;if(a|0)aB(a);return}function Fy(a){a=a|0;Iy(a);return}function Gy(a){a=a|0;Hy(a+24|0);return}function Hy(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function Iy(a){a=a|0;var b=0;b=ff()|0;hf(a,1,15,b,Jy()|0,2);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Jy(){return 1264}function Ky(a,b,d){a=a|0;b=b|0;d=d|0;My(c[(Ly(a)|0)>>2]|0,b,d);return}function Ly(a){a=a|0;return (c[(wy()|0)+24>>2]|0)+(a<<3)|0}function My(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0,f=0;d=l;l=l+16|0;f=d+4|0;e=d;Ny(f,b);b=Oy(f,b)|0;Vx(e,c);c=Wx(e,c)|0;yb[a&63](b,c);Yx(e);l=d;return}function Ny(a,b){a=a|0;b=b|0;return}function Oy(a,b){a=a|0;b=b|0;return Py(b)|0}function Py(a){a=a|0;return a|0}function Qy(){var b=0;if(!(a[6272]|0)){Ry(8e3);xa(68,8e3,o|0)|0;b=6272;c[b>>2]=1;c[b+4>>2]=0}if(!(af(8e3)|0))Ry(8e3);return 8e3}function Ry(a){a=a|0;Uy(a);cf(a,69);return}function Sy(a){a=a|0;Ty(a+24|0);return}function Ty(a){a=a|0;var b=0,d=0,e=0;d=c[a>>2]|0;e=d;if(d|0){a=a+4|0;b=c[a>>2]|0;if((b|0)!=(d|0))c[a>>2]=b+(~((b+-8-e|0)>>>3)<<3);aB(d)}return}function Uy(a){a=a|0;var b=0;b=ff()|0;hf(a,5,4,b,Yy()|0,0);c[a+24>>2]=0;c[a+28>>2]=0;c[a+32>>2]=0;return}function Vy(a){a=a|0;Wy(a);return}function Wy(a){a=a|0;Xy(a);return}function Xy(b){b=b|0;a[b+8>>0]=1;return}function Yy(){return 1304}function Zy(){return _y()|0}function _y(){var a=0,b=0,d=0,e=0,f=0,g=0,h=0;b=l;l=l+16|0;f=b+4|0;h=b;d=Bw(8)|0;a=d;g=a+4|0;c[g>>2]=_A(1)|0;e=_A(8)|0;g=c[g>>2]|0;c[h>>2]=0;c[f>>2]=c[h>>2];$y(e,g,f);c[d>>2]=e;l=b;return a|0}function $y(a,b,d){a=a|0;b=b|0;d=d|0;c[a>>2]=b;d=_A(16)|0;c[d+4>>2]=0;c[d+8>>2]=0;c[d>>2]=1284;c[d+12>>2]=b;c[a+4>>2]=d;return}function az(a){a=a|0;RA(a);aB(a);return}function bz(a){a=a|0;a=c[a+12>>2]|0;if(a|0)aB(a);return}function cz(a){a=a|0;aB(a);return}function dz(){var b=0;if(!(a[6280]|0)){kz(8036);xa(26,8036,o|0)|0;b=6280;c[b>>2]=1;c[b+4>>2]=0}return 8036}function ez(a,b){a=a|0;b=b|0;c[a>>2]=fz()|0;c[a+4>>2]=gz()|0;c[a+12>>2]=b;c[a+8>>2]=hz()|0;c[a+32>>2]=7;return}function fz(){return 8698}function gz(){return 1308}function hz(){return Qe()|0}function iz(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;if((Se(d,896)|0)==512){if(c|0){jz(c);aB(c)}}else if(b|0)aB(b);return}function jz(a){a=a|0;a=c[a+4>>2]|0;if(a|0)YA(a);return}function kz(a){a=a|0;He(a);return}function lz(a,b){a=a|0;b=b|0;c[a>>2]=b;return}function mz(a){a=a|0;return c[a>>2]|0}function nz(b){b=b|0;return a[c[b>>2]>>0]|0}function oz(a,b){a=a|0;b=b|0;var d=0,e=0;d=l;l=l+16|0;e=d;c[e>>2]=c[a>>2];pz(b,e)|0;l=d;return}function pz(a,b){a=a|0;b=b|0;var d=0;d=qz(c[a>>2]|0,b)|0;b=a+4|0;c[(c[b>>2]|0)+8>>2]=d;return c[(c[b>>2]|0)+8>>2]|0}function qz(a,b){a=a|0;b=b|0;var d=0,e=0;d=l;l=l+16|0;e=d;rz(e);a=_p(a)|0;b=sz(a,c[b>>2]|0)|0;tz(e);l=d;return b|0}function rz(a){a=a|0;c[a>>2]=c[1939];c[a+4>>2]=c[1941];return}function sz(a,b){a=a|0;b=b|0;var c=0;c=bq(uz()|0)|0;return Ta(0,c|0,a|0,Gu(b)|0)|0}function tz(a){a=a|0;Rw(c[a>>2]|0,c[a+4>>2]|0);return}function uz(){var b=0;if(!(a[6288]|0)){vz(8080);b=6288;c[b>>2]=1;c[b+4>>2]=0}return 8080}function vz(a){a=a|0;fq(a,wz()|0,1);return}function wz(){return 1316}function xz(){yz();return}function yz(){var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;s=l;l=l+16|0;o=s+4|0;p=s;Ma(65536,7756,c[1940]|0,7764);f=ku()|0;e=c[f>>2]|0;b=c[e>>2]|0;if(b|0){g=c[f+8>>2]|0;f=c[f+4>>2]|0;while(1){Na(b|0,d[f>>0]|0|0,a[g>>0]|0);e=e+4|0;b=c[e>>2]|0;if(!b)break;else{g=g+1|0;f=f+1|0}}}b=mu()|0;e=c[b>>2]|0;if(e|0)do{Oa(e|0,c[b+4>>2]|0);b=b+8|0;e=c[b>>2]|0}while((e|0)!=0);Oa(zz()|0,3409);n=Wt()|0;b=c[n>>2]|0;a:do if(b|0){do{Az(c[b+4>>2]|0);b=c[b>>2]|0}while((b|0)!=0);b=c[n>>2]|0;if(b|0){m=n;do{while(1){h=b;b=c[b>>2]|0;h=c[h+4>>2]|0;if(!(Bz(h)|0))break;c[p>>2]=m;c[o>>2]=c[p>>2];Cz(n,o)|0;if(!b)break a}Dz(h);m=c[m>>2]|0;e=Ez(h)|0;i=ab()|0;j=l;l=l+((1*(e<<2)|0)+15&-16)|0;k=l;l=l+((1*(e<<2)|0)+15&-16)|0;e=c[(pv(h)|0)>>2]|0;if(e|0){f=j;g=k;while(1){c[f>>2]=c[(nv(c[e+4>>2]|0)|0)>>2];c[g>>2]=c[e+8>>2];e=c[e>>2]|0;if(!e)break;else{f=f+4|0;g=g+4|0}}}t=nv(h)|0;e=Fz(h)|0;f=Ez(h)|0;g=Gz(h)|0;Ka(t|0,e|0,j|0,k|0,f|0,g|0,fu(h)|0);$a(i|0)}while((b|0)!=0)}}while(0);b=c[(ju()|0)>>2]|0;if(b|0)do{t=b+4|0;n=ou(t)|0;h=tu(n)|0;i=pu(n)|0;j=(qu(n)|0)+1|0;k=Hz(n)|0;m=Iz(t)|0;n=af(n)|0;o=vu(t)|0;p=Jz(t)|0;La(0,h|0,i|0,j|0,k|0,m|0,n|0,o|0,p|0,Kz(t)|0);b=c[b>>2]|0}while((b|0)!=0);b=c[(Wt()|0)>>2]|0;b:do if(b|0){c:while(1){e=c[b+4>>2]|0;if(e|0?(q=c[(nv(e)|0)>>2]|0,r=c[(sv(e)|0)>>2]|0,r|0):0){f=r;do{e=f+4|0;g=ou(e)|0;d:do if(g|0)switch(af(g)|0){case 0:break c;case 4:case 3:case 2:{k=tu(g)|0;m=pu(g)|0;n=(qu(g)|0)+1|0;o=Hz(g)|0;p=af(g)|0;t=vu(e)|0;La(q|0,k|0,m|0,n|0,o|0,0,p|0,t|0,Jz(e)|0,Kz(e)|0);break d}case 1:{j=tu(g)|0;k=pu(g)|0;m=(qu(g)|0)+1|0;n=Hz(g)|0;o=Iz(e)|0;p=af(g)|0;t=vu(e)|0;La(q|0,j|0,k|0,m|0,n|0,o|0,p|0,t|0,Jz(e)|0,Kz(e)|0);break d}case 5:{n=tu(g)|0;o=pu(g)|0;p=(qu(g)|0)+1|0;t=Hz(g)|0;La(q|0,n|0,o|0,p|0,t|0,Lz(g)|0,af(g)|0,0,0,0);break d}default:break d}while(0);f=c[f>>2]|0}while((f|0)!=0)}b=c[b>>2]|0;if(!b)break b}Pa()}while(0);Fa();l=s;return}function zz(){return 8699}function Az(b){b=b|0;a[b+40>>0]=0;return}function Bz(b){b=b|0;return (a[b+40>>0]|0)!=0|0}function Cz(a,b){a=a|0;b=b|0;b=Mz(b)|0;a=c[b>>2]|0;c[b>>2]=c[a>>2];aB(a);return c[b>>2]|0}function Dz(b){b=b|0;a[b+40>>0]=1;return}function Ez(a){a=a|0;return c[a+20>>2]|0}function Fz(a){a=a|0;return c[a+8>>2]|0}function Gz(a){a=a|0;return c[a+32>>2]|0}function Hz(a){a=a|0;return c[a+4>>2]|0}function Iz(a){a=a|0;return c[a+4>>2]|0}function Jz(a){a=a|0;return c[a+8>>2]|0}function Kz(a){a=a|0;return c[a+16>>2]|0}function Lz(a){a=a|0;return c[a+20>>2]|0}function Mz(a){a=a|0;return c[a>>2]|0}
function Nz(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;x=l;l=l+16|0;o=x;do if(a>>>0<245){k=a>>>0<11?16:a+11&-8;a=k>>>3;n=c[2023]|0;d=n>>>a;if(d&3|0){b=(d&1^1)+a|0;a=8132+(b<<1<<2)|0;d=a+8|0;e=c[d>>2]|0;f=e+8|0;g=c[f>>2]|0;if((a|0)==(g|0))c[2023]=n&~(1<<b);else{c[g+12>>2]=a;c[d>>2]=g}w=b<<3;c[e+4>>2]=w|3;w=e+w+4|0;c[w>>2]=c[w>>2]|1;w=f;l=x;return w|0}m=c[2025]|0;if(k>>>0>m>>>0){if(d|0){b=2<<a;b=d<<a&(b|0-b);b=(b&0-b)+-1|0;h=b>>>12&16;b=b>>>h;d=b>>>5&8;b=b>>>d;f=b>>>2&4;b=b>>>f;a=b>>>1&2;b=b>>>a;e=b>>>1&1;e=(d|h|f|a|e)+(b>>>e)|0;b=8132+(e<<1<<2)|0;a=b+8|0;f=c[a>>2]|0;h=f+8|0;d=c[h>>2]|0;if((b|0)==(d|0)){a=n&~(1<<e);c[2023]=a}else{c[d+12>>2]=b;c[a>>2]=d;a=n}g=(e<<3)-k|0;c[f+4>>2]=k|3;e=f+k|0;c[e+4>>2]=g|1;c[e+g>>2]=g;if(m|0){f=c[2028]|0;b=m>>>3;d=8132+(b<<1<<2)|0;b=1<<b;if(!(a&b)){c[2023]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=f;c[b+12>>2]=f;c[f+8>>2]=b;c[f+12>>2]=d}c[2025]=g;c[2028]=e;w=h;l=x;return w|0}i=c[2024]|0;if(i){d=(i&0-i)+-1|0;h=d>>>12&16;d=d>>>h;g=d>>>5&8;d=d>>>g;j=d>>>2&4;d=d>>>j;e=d>>>1&2;d=d>>>e;a=d>>>1&1;a=c[8396+((g|h|j|e|a)+(d>>>a)<<2)>>2]|0;d=(c[a+4>>2]&-8)-k|0;e=c[a+16+(((c[a+16>>2]|0)==0&1)<<2)>>2]|0;if(!e){j=a;g=d}else{do{h=(c[e+4>>2]&-8)-k|0;j=h>>>0<d>>>0;d=j?h:d;a=j?e:a;e=c[e+16+(((c[e+16>>2]|0)==0&1)<<2)>>2]|0}while((e|0)!=0);j=a;g=d}h=j+k|0;if(j>>>0<h>>>0){f=c[j+24>>2]|0;b=c[j+12>>2]|0;do if((b|0)==(j|0)){a=j+20|0;b=c[a>>2]|0;if(!b){a=j+16|0;b=c[a>>2]|0;if(!b){d=0;break}}while(1){d=b+20|0;e=c[d>>2]|0;if(e|0){b=e;a=d;continue}d=b+16|0;e=c[d>>2]|0;if(!e)break;else{b=e;a=d}}c[a>>2]=0;d=b}else{d=c[j+8>>2]|0;c[d+12>>2]=b;c[b+8>>2]=d;d=b}while(0);do if(f|0){b=c[j+28>>2]|0;a=8396+(b<<2)|0;if((j|0)==(c[a>>2]|0)){c[a>>2]=d;if(!d){c[2024]=i&~(1<<b);break}}else{c[f+16+(((c[f+16>>2]|0)!=(j|0)&1)<<2)>>2]=d;if(!d)break}c[d+24>>2]=f;b=c[j+16>>2]|0;if(b|0){c[d+16>>2]=b;c[b+24>>2]=d}b=c[j+20>>2]|0;if(b|0){c[d+20>>2]=b;c[b+24>>2]=d}}while(0);if(g>>>0<16){w=g+k|0;c[j+4>>2]=w|3;w=j+w+4|0;c[w>>2]=c[w>>2]|1}else{c[j+4>>2]=k|3;c[h+4>>2]=g|1;c[h+g>>2]=g;if(m|0){e=c[2028]|0;b=m>>>3;d=8132+(b<<1<<2)|0;b=1<<b;if(!(n&b)){c[2023]=n|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=e;c[b+12>>2]=e;c[e+8>>2]=b;c[e+12>>2]=d}c[2025]=g;c[2028]=h}w=j+8|0;l=x;return w|0}else n=k}else n=k}else n=k}else if(a>>>0<=4294967231){a=a+11|0;k=a&-8;j=c[2024]|0;if(j){e=0-k|0;a=a>>>8;if(a)if(k>>>0>16777215)i=31;else{n=(a+1048320|0)>>>16&8;v=a<<n;m=(v+520192|0)>>>16&4;v=v<<m;i=(v+245760|0)>>>16&2;i=14-(m|n|i)+(v<<i>>>15)|0;i=k>>>(i+7|0)&1|i<<1}else i=0;d=c[8396+(i<<2)>>2]|0;a:do if(!d){d=0;a=0;v=57}else{a=0;h=k<<((i|0)==31?0:25-(i>>>1)|0);g=0;while(1){f=(c[d+4>>2]&-8)-k|0;if(f>>>0<e>>>0)if(!f){a=d;e=0;f=d;v=61;break a}else{a=d;e=f}f=c[d+20>>2]|0;d=c[d+16+(h>>>31<<2)>>2]|0;g=(f|0)==0|(f|0)==(d|0)?g:f;f=(d|0)==0;if(f){d=g;v=57;break}else h=h<<((f^1)&1)}}while(0);if((v|0)==57){if((d|0)==0&(a|0)==0){a=2<<i;a=j&(a|0-a);if(!a){n=k;break}n=(a&0-a)+-1|0;h=n>>>12&16;n=n>>>h;g=n>>>5&8;n=n>>>g;i=n>>>2&4;n=n>>>i;m=n>>>1&2;n=n>>>m;d=n>>>1&1;a=0;d=c[8396+((g|h|i|m|d)+(n>>>d)<<2)>>2]|0}if(!d){i=a;h=e}else{f=d;v=61}}if((v|0)==61)while(1){v=0;d=(c[f+4>>2]&-8)-k|0;n=d>>>0<e>>>0;d=n?d:e;a=n?f:a;f=c[f+16+(((c[f+16>>2]|0)==0&1)<<2)>>2]|0;if(!f){i=a;h=d;break}else{e=d;v=61}}if((i|0)!=0?h>>>0<((c[2025]|0)-k|0)>>>0:0){g=i+k|0;if(i>>>0>=g>>>0){w=0;l=x;return w|0}f=c[i+24>>2]|0;b=c[i+12>>2]|0;do if((b|0)==(i|0)){a=i+20|0;b=c[a>>2]|0;if(!b){a=i+16|0;b=c[a>>2]|0;if(!b){b=0;break}}while(1){d=b+20|0;e=c[d>>2]|0;if(e|0){b=e;a=d;continue}d=b+16|0;e=c[d>>2]|0;if(!e)break;else{b=e;a=d}}c[a>>2]=0}else{w=c[i+8>>2]|0;c[w+12>>2]=b;c[b+8>>2]=w}while(0);do if(f){a=c[i+28>>2]|0;d=8396+(a<<2)|0;if((i|0)==(c[d>>2]|0)){c[d>>2]=b;if(!b){e=j&~(1<<a);c[2024]=e;break}}else{c[f+16+(((c[f+16>>2]|0)!=(i|0)&1)<<2)>>2]=b;if(!b){e=j;break}}c[b+24>>2]=f;a=c[i+16>>2]|0;if(a|0){c[b+16>>2]=a;c[a+24>>2]=b}a=c[i+20>>2]|0;if(a){c[b+20>>2]=a;c[a+24>>2]=b;e=j}else e=j}else e=j;while(0);do if(h>>>0>=16){c[i+4>>2]=k|3;c[g+4>>2]=h|1;c[g+h>>2]=h;b=h>>>3;if(h>>>0<256){d=8132+(b<<1<<2)|0;a=c[2023]|0;b=1<<b;if(!(a&b)){c[2023]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=g;c[b+12>>2]=g;c[g+8>>2]=b;c[g+12>>2]=d;break}b=h>>>8;if(b)if(h>>>0>16777215)b=31;else{v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;b=(w+245760|0)>>>16&2;b=14-(u|v|b)+(w<<b>>>15)|0;b=h>>>(b+7|0)&1|b<<1}else b=0;d=8396+(b<<2)|0;c[g+28>>2]=b;a=g+16|0;c[a+4>>2]=0;c[a>>2]=0;a=1<<b;if(!(e&a)){c[2024]=e|a;c[d>>2]=g;c[g+24>>2]=d;c[g+12>>2]=g;c[g+8>>2]=g;break}a=h<<((b|0)==31?0:25-(b>>>1)|0);d=c[d>>2]|0;while(1){if((c[d+4>>2]&-8|0)==(h|0)){v=97;break}e=d+16+(a>>>31<<2)|0;b=c[e>>2]|0;if(!b){v=96;break}else{a=a<<1;d=b}}if((v|0)==96){c[e>>2]=g;c[g+24>>2]=d;c[g+12>>2]=g;c[g+8>>2]=g;break}else if((v|0)==97){v=d+8|0;w=c[v>>2]|0;c[w+12>>2]=g;c[v>>2]=g;c[g+8>>2]=w;c[g+12>>2]=d;c[g+24>>2]=0;break}}else{w=h+k|0;c[i+4>>2]=w|3;w=i+w+4|0;c[w>>2]=c[w>>2]|1}while(0);w=i+8|0;l=x;return w|0}else n=k}else n=k}else n=-1;while(0);d=c[2025]|0;if(d>>>0>=n>>>0){b=d-n|0;a=c[2028]|0;if(b>>>0>15){w=a+n|0;c[2028]=w;c[2025]=b;c[w+4>>2]=b|1;c[w+b>>2]=b;c[a+4>>2]=n|3}else{c[2025]=0;c[2028]=0;c[a+4>>2]=d|3;w=a+d+4|0;c[w>>2]=c[w>>2]|1}w=a+8|0;l=x;return w|0}h=c[2026]|0;if(h>>>0>n>>>0){u=h-n|0;c[2026]=u;w=c[2029]|0;v=w+n|0;c[2029]=v;c[v+4>>2]=u|1;c[w+4>>2]=n|3;w=w+8|0;l=x;return w|0}if(!(c[2141]|0)){c[2143]=4096;c[2142]=4096;c[2144]=-1;c[2145]=-1;c[2146]=0;c[2134]=0;a=o&-16^1431655768;c[o>>2]=a;c[2141]=a;a=4096}else a=c[2143]|0;i=n+48|0;j=n+47|0;g=a+j|0;f=0-a|0;k=g&f;if(k>>>0<=n>>>0){w=0;l=x;return w|0}a=c[2133]|0;if(a|0?(m=c[2131]|0,o=m+k|0,o>>>0<=m>>>0|o>>>0>a>>>0):0){w=0;l=x;return w|0}b:do if(!(c[2134]&4)){d=c[2029]|0;c:do if(d){e=8540;while(1){a=c[e>>2]|0;if(a>>>0<=d>>>0?(r=e+4|0,(a+(c[r>>2]|0)|0)>>>0>d>>>0):0)break;a=c[e+8>>2]|0;if(!a){v=118;break c}else e=a}b=g-h&f;if(b>>>0<2147483647){a=pB(b|0)|0;if((a|0)==((c[e>>2]|0)+(c[r>>2]|0)|0)){if((a|0)!=(-1|0)){h=b;g=a;v=135;break b}}else{e=a;v=126}}else b=0}else v=118;while(0);do if((v|0)==118){d=pB(0)|0;if((d|0)!=(-1|0)?(b=d,p=c[2142]|0,q=p+-1|0,b=((q&b|0)==0?0:(q+b&0-p)-b|0)+k|0,p=c[2131]|0,q=b+p|0,b>>>0>n>>>0&b>>>0<2147483647):0){r=c[2133]|0;if(r|0?q>>>0<=p>>>0|q>>>0>r>>>0:0){b=0;break}a=pB(b|0)|0;if((a|0)==(d|0)){h=b;g=d;v=135;break b}else{e=a;v=126}}else b=0}while(0);do if((v|0)==126){d=0-b|0;if(!(i>>>0>b>>>0&(b>>>0<2147483647&(e|0)!=(-1|0))))if((e|0)==(-1|0)){b=0;break}else{h=b;g=e;v=135;break b}a=c[2143]|0;a=j-b+a&0-a;if(a>>>0>=2147483647){h=b;g=e;v=135;break b}if((pB(a|0)|0)==(-1|0)){pB(d|0)|0;b=0;break}else{h=a+b|0;g=e;v=135;break b}}while(0);c[2134]=c[2134]|4;v=133}else{b=0;v=133}while(0);if(((v|0)==133?k>>>0<2147483647:0)?(u=pB(k|0)|0,r=pB(0)|0,s=r-u|0,t=s>>>0>(n+40|0)>>>0,!((u|0)==(-1|0)|t^1|u>>>0<r>>>0&((u|0)!=(-1|0)&(r|0)!=(-1|0))^1)):0){h=t?s:b;g=u;v=135}if((v|0)==135){b=(c[2131]|0)+h|0;c[2131]=b;if(b>>>0>(c[2132]|0)>>>0)c[2132]=b;j=c[2029]|0;do if(j){b=8540;while(1){a=c[b>>2]|0;d=b+4|0;e=c[d>>2]|0;if((g|0)==(a+e|0)){v=145;break}f=c[b+8>>2]|0;if(!f)break;else b=f}if(((v|0)==145?(c[b+12>>2]&8|0)==0:0)?j>>>0<g>>>0&j>>>0>=a>>>0:0){c[d>>2]=e+h;w=j+8|0;w=(w&7|0)==0?0:0-w&7;v=j+w|0;w=(c[2026]|0)+(h-w)|0;c[2029]=v;c[2026]=w;c[v+4>>2]=w|1;c[v+w+4>>2]=40;c[2030]=c[2145];break}if(g>>>0<(c[2027]|0)>>>0)c[2027]=g;d=g+h|0;b=8540;while(1){if((c[b>>2]|0)==(d|0)){v=153;break}a=c[b+8>>2]|0;if(!a)break;else b=a}if((v|0)==153?(c[b+12>>2]&8|0)==0:0){c[b>>2]=g;m=b+4|0;c[m>>2]=(c[m>>2]|0)+h;m=g+8|0;m=g+((m&7|0)==0?0:0-m&7)|0;b=d+8|0;b=d+((b&7|0)==0?0:0-b&7)|0;k=m+n|0;i=b-m-n|0;c[m+4>>2]=n|3;do if((b|0)!=(j|0)){if((b|0)==(c[2028]|0)){w=(c[2025]|0)+i|0;c[2025]=w;c[2028]=k;c[k+4>>2]=w|1;c[k+w>>2]=w;break}a=c[b+4>>2]|0;if((a&3|0)==1){h=a&-8;e=a>>>3;d:do if(a>>>0<256){a=c[b+8>>2]|0;d=c[b+12>>2]|0;if((d|0)==(a|0)){c[2023]=c[2023]&~(1<<e);break}else{c[a+12>>2]=d;c[d+8>>2]=a;break}}else{g=c[b+24>>2]|0;a=c[b+12>>2]|0;do if((a|0)==(b|0)){e=b+16|0;d=e+4|0;a=c[d>>2]|0;if(!a){a=c[e>>2]|0;if(!a){a=0;break}else d=e}while(1){e=a+20|0;f=c[e>>2]|0;if(f|0){a=f;d=e;continue}e=a+16|0;f=c[e>>2]|0;if(!f)break;else{a=f;d=e}}c[d>>2]=0}else{w=c[b+8>>2]|0;c[w+12>>2]=a;c[a+8>>2]=w}while(0);if(!g)break;d=c[b+28>>2]|0;e=8396+(d<<2)|0;do if((b|0)!=(c[e>>2]|0)){c[g+16+(((c[g+16>>2]|0)!=(b|0)&1)<<2)>>2]=a;if(!a)break d}else{c[e>>2]=a;if(a|0)break;c[2024]=c[2024]&~(1<<d);break d}while(0);c[a+24>>2]=g;d=b+16|0;e=c[d>>2]|0;if(e|0){c[a+16>>2]=e;c[e+24>>2]=a}d=c[d+4>>2]|0;if(!d)break;c[a+20>>2]=d;c[d+24>>2]=a}while(0);b=b+h|0;f=h+i|0}else f=i;b=b+4|0;c[b>>2]=c[b>>2]&-2;c[k+4>>2]=f|1;c[k+f>>2]=f;b=f>>>3;if(f>>>0<256){d=8132+(b<<1<<2)|0;a=c[2023]|0;b=1<<b;if(!(a&b)){c[2023]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=k;c[b+12>>2]=k;c[k+8>>2]=b;c[k+12>>2]=d;break}b=f>>>8;do if(!b)b=0;else{if(f>>>0>16777215){b=31;break}v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;b=(w+245760|0)>>>16&2;b=14-(u|v|b)+(w<<b>>>15)|0;b=f>>>(b+7|0)&1|b<<1}while(0);e=8396+(b<<2)|0;c[k+28>>2]=b;a=k+16|0;c[a+4>>2]=0;c[a>>2]=0;a=c[2024]|0;d=1<<b;if(!(a&d)){c[2024]=a|d;c[e>>2]=k;c[k+24>>2]=e;c[k+12>>2]=k;c[k+8>>2]=k;break}a=f<<((b|0)==31?0:25-(b>>>1)|0);d=c[e>>2]|0;while(1){if((c[d+4>>2]&-8|0)==(f|0)){v=194;break}e=d+16+(a>>>31<<2)|0;b=c[e>>2]|0;if(!b){v=193;break}else{a=a<<1;d=b}}if((v|0)==193){c[e>>2]=k;c[k+24>>2]=d;c[k+12>>2]=k;c[k+8>>2]=k;break}else if((v|0)==194){v=d+8|0;w=c[v>>2]|0;c[w+12>>2]=k;c[v>>2]=k;c[k+8>>2]=w;c[k+12>>2]=d;c[k+24>>2]=0;break}}else{w=(c[2026]|0)+i|0;c[2026]=w;c[2029]=k;c[k+4>>2]=w|1}while(0);w=m+8|0;l=x;return w|0}b=8540;while(1){a=c[b>>2]|0;if(a>>>0<=j>>>0?(w=a+(c[b+4>>2]|0)|0,w>>>0>j>>>0):0)break;b=c[b+8>>2]|0}f=w+-47|0;a=f+8|0;a=f+((a&7|0)==0?0:0-a&7)|0;f=j+16|0;a=a>>>0<f>>>0?j:a;b=a+8|0;d=g+8|0;d=(d&7|0)==0?0:0-d&7;v=g+d|0;d=h+-40-d|0;c[2029]=v;c[2026]=d;c[v+4>>2]=d|1;c[v+d+4>>2]=40;c[2030]=c[2145];d=a+4|0;c[d>>2]=27;c[b>>2]=c[2135];c[b+4>>2]=c[2136];c[b+8>>2]=c[2137];c[b+12>>2]=c[2138];c[2135]=g;c[2136]=h;c[2138]=0;c[2137]=b;b=a+24|0;do{v=b;b=b+4|0;c[b>>2]=7}while((v+8|0)>>>0<w>>>0);if((a|0)!=(j|0)){g=a-j|0;c[d>>2]=c[d>>2]&-2;c[j+4>>2]=g|1;c[a>>2]=g;b=g>>>3;if(g>>>0<256){d=8132+(b<<1<<2)|0;a=c[2023]|0;b=1<<b;if(!(a&b)){c[2023]=a|b;b=d;a=d+8|0}else{a=d+8|0;b=c[a>>2]|0}c[a>>2]=j;c[b+12>>2]=j;c[j+8>>2]=b;c[j+12>>2]=d;break}b=g>>>8;if(b)if(g>>>0>16777215)d=31;else{v=(b+1048320|0)>>>16&8;w=b<<v;u=(w+520192|0)>>>16&4;w=w<<u;d=(w+245760|0)>>>16&2;d=14-(u|v|d)+(w<<d>>>15)|0;d=g>>>(d+7|0)&1|d<<1}else d=0;e=8396+(d<<2)|0;c[j+28>>2]=d;c[j+20>>2]=0;c[f>>2]=0;b=c[2024]|0;a=1<<d;if(!(b&a)){c[2024]=b|a;c[e>>2]=j;c[j+24>>2]=e;c[j+12>>2]=j;c[j+8>>2]=j;break}a=g<<((d|0)==31?0:25-(d>>>1)|0);d=c[e>>2]|0;while(1){if((c[d+4>>2]&-8|0)==(g|0)){v=216;break}e=d+16+(a>>>31<<2)|0;b=c[e>>2]|0;if(!b){v=215;break}else{a=a<<1;d=b}}if((v|0)==215){c[e>>2]=j;c[j+24>>2]=d;c[j+12>>2]=j;c[j+8>>2]=j;break}else if((v|0)==216){v=d+8|0;w=c[v>>2]|0;c[w+12>>2]=j;c[v>>2]=j;c[j+8>>2]=w;c[j+12>>2]=d;c[j+24>>2]=0;break}}}else{w=c[2027]|0;if((w|0)==0|g>>>0<w>>>0)c[2027]=g;c[2135]=g;c[2136]=h;c[2138]=0;c[2032]=c[2141];c[2031]=-1;b=0;do{w=8132+(b<<1<<2)|0;c[w+12>>2]=w;c[w+8>>2]=w;b=b+1|0}while((b|0)!=32);w=g+8|0;w=(w&7|0)==0?0:0-w&7;v=g+w|0;w=h+-40-w|0;c[2029]=v;c[2026]=w;c[v+4>>2]=w|1;c[v+w+4>>2]=40;c[2030]=c[2145]}while(0);b=c[2026]|0;if(b>>>0>n>>>0){u=b-n|0;c[2026]=u;w=c[2029]|0;v=w+n|0;c[2029]=v;c[v+4>>2]=u|1;c[w+4>>2]=n|3;w=w+8|0;l=x;return w|0}}c[(Xz()|0)>>2]=12;w=0;l=x;return w|0}function Oz(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0;if(!a)return;d=a+-8|0;f=c[2027]|0;a=c[a+-4>>2]|0;b=a&-8;j=d+b|0;do if(!(a&1)){e=c[d>>2]|0;if(!(a&3))return;h=d+(0-e)|0;g=e+b|0;if(h>>>0<f>>>0)return;if((h|0)==(c[2028]|0)){a=j+4|0;b=c[a>>2]|0;if((b&3|0)!=3){i=h;b=g;break}c[2025]=g;c[a>>2]=b&-2;c[h+4>>2]=g|1;c[h+g>>2]=g;return}d=e>>>3;if(e>>>0<256){a=c[h+8>>2]|0;b=c[h+12>>2]|0;if((b|0)==(a|0)){c[2023]=c[2023]&~(1<<d);i=h;b=g;break}else{c[a+12>>2]=b;c[b+8>>2]=a;i=h;b=g;break}}f=c[h+24>>2]|0;a=c[h+12>>2]|0;do if((a|0)==(h|0)){d=h+16|0;b=d+4|0;a=c[b>>2]|0;if(!a){a=c[d>>2]|0;if(!a){a=0;break}else b=d}while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}c[b>>2]=0}else{i=c[h+8>>2]|0;c[i+12>>2]=a;c[a+8>>2]=i}while(0);if(f){b=c[h+28>>2]|0;d=8396+(b<<2)|0;if((h|0)==(c[d>>2]|0)){c[d>>2]=a;if(!a){c[2024]=c[2024]&~(1<<b);i=h;b=g;break}}else{c[f+16+(((c[f+16>>2]|0)!=(h|0)&1)<<2)>>2]=a;if(!a){i=h;b=g;break}}c[a+24>>2]=f;b=h+16|0;d=c[b>>2]|0;if(d|0){c[a+16>>2]=d;c[d+24>>2]=a}b=c[b+4>>2]|0;if(b){c[a+20>>2]=b;c[b+24>>2]=a;i=h;b=g}else{i=h;b=g}}else{i=h;b=g}}else{i=d;h=d}while(0);if(h>>>0>=j>>>0)return;a=j+4|0;e=c[a>>2]|0;if(!(e&1))return;if(!(e&2)){a=c[2028]|0;if((j|0)==(c[2029]|0)){j=(c[2026]|0)+b|0;c[2026]=j;c[2029]=i;c[i+4>>2]=j|1;if((i|0)!=(a|0))return;c[2028]=0;c[2025]=0;return}if((j|0)==(a|0)){j=(c[2025]|0)+b|0;c[2025]=j;c[2028]=h;c[i+4>>2]=j|1;c[h+j>>2]=j;return}f=(e&-8)+b|0;d=e>>>3;do if(e>>>0<256){b=c[j+8>>2]|0;a=c[j+12>>2]|0;if((a|0)==(b|0)){c[2023]=c[2023]&~(1<<d);break}else{c[b+12>>2]=a;c[a+8>>2]=b;break}}else{g=c[j+24>>2]|0;a=c[j+12>>2]|0;do if((a|0)==(j|0)){d=j+16|0;b=d+4|0;a=c[b>>2]|0;if(!a){a=c[d>>2]|0;if(!a){d=0;break}else b=d}while(1){d=a+20|0;e=c[d>>2]|0;if(e|0){a=e;b=d;continue}d=a+16|0;e=c[d>>2]|0;if(!e)break;else{a=e;b=d}}c[b>>2]=0;d=a}else{d=c[j+8>>2]|0;c[d+12>>2]=a;c[a+8>>2]=d;d=a}while(0);if(g|0){a=c[j+28>>2]|0;b=8396+(a<<2)|0;if((j|0)==(c[b>>2]|0)){c[b>>2]=d;if(!d){c[2024]=c[2024]&~(1<<a);break}}else{c[g+16+(((c[g+16>>2]|0)!=(j|0)&1)<<2)>>2]=d;if(!d)break}c[d+24>>2]=g;a=j+16|0;b=c[a>>2]|0;if(b|0){c[d+16>>2]=b;c[b+24>>2]=d}a=c[a+4>>2]|0;if(a|0){c[d+20>>2]=a;c[a+24>>2]=d}}}while(0);c[i+4>>2]=f|1;c[h+f>>2]=f;if((i|0)==(c[2028]|0)){c[2025]=f;return}}else{c[a>>2]=e&-2;c[i+4>>2]=b|1;c[h+b>>2]=b;f=b}a=f>>>3;if(f>>>0<256){d=8132+(a<<1<<2)|0;b=c[2023]|0;a=1<<a;if(!(b&a)){c[2023]=b|a;a=d;b=d+8|0}else{b=d+8|0;a=c[b>>2]|0}c[b>>2]=i;c[a+12>>2]=i;c[i+8>>2]=a;c[i+12>>2]=d;return}a=f>>>8;if(a)if(f>>>0>16777215)a=31;else{h=(a+1048320|0)>>>16&8;j=a<<h;g=(j+520192|0)>>>16&4;j=j<<g;a=(j+245760|0)>>>16&2;a=14-(g|h|a)+(j<<a>>>15)|0;a=f>>>(a+7|0)&1|a<<1}else a=0;e=8396+(a<<2)|0;c[i+28>>2]=a;c[i+20>>2]=0;c[i+16>>2]=0;b=c[2024]|0;d=1<<a;do if(b&d){b=f<<((a|0)==31?0:25-(a>>>1)|0);d=c[e>>2]|0;while(1){if((c[d+4>>2]&-8|0)==(f|0)){a=73;break}e=d+16+(b>>>31<<2)|0;a=c[e>>2]|0;if(!a){a=72;break}else{b=b<<1;d=a}}if((a|0)==72){c[e>>2]=i;c[i+24>>2]=d;c[i+12>>2]=i;c[i+8>>2]=i;break}else if((a|0)==73){h=d+8|0;j=c[h>>2]|0;c[j+12>>2]=i;c[h>>2]=i;c[i+8>>2]=j;c[i+12>>2]=d;c[i+24>>2]=0;break}}else{c[2024]=b|d;c[e>>2]=i;c[i+24>>2]=e;c[i+12>>2]=i;c[i+8>>2]=i}while(0);j=(c[2031]|0)+-1|0;c[2031]=j;if(!j)a=8548;else return;while(1){a=c[a>>2]|0;if(!a)break;else a=a+8|0}c[2031]=-1;return}function Pz(a,b){a=a|0;b=b|0;var d=0,e=0;if(!a){b=Nz(b)|0;return b|0}if(b>>>0>4294967231){c[(Xz()|0)>>2]=12;b=0;return b|0}d=Qz(a+-8|0,b>>>0<11?16:b+11&-8)|0;if(d|0){b=d+8|0;return b|0}d=Nz(b)|0;if(!d){b=0;return b|0}e=c[a+-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;mB(d|0,a|0,(e>>>0<b>>>0?e:b)|0)|0;Oz(a);b=d;return b|0}function Qz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;m=a+4|0;l=c[m>>2]|0;d=l&-8;i=a+d|0;if(!(l&3)){if(b>>>0<256){a=0;return a|0}if(d>>>0>=(b+4|0)>>>0?(d-b|0)>>>0<=c[2143]<<1>>>0:0)return a|0;a=0;return a|0}if(d>>>0>=b>>>0){d=d-b|0;if(d>>>0<=15)return a|0;k=a+b|0;c[m>>2]=l&1|b|2;c[k+4>>2]=d|3;m=k+d+4|0;c[m>>2]=c[m>>2]|1;Rz(k,d);return a|0}if((i|0)==(c[2029]|0)){k=(c[2026]|0)+d|0;d=k-b|0;e=a+b|0;if(k>>>0<=b>>>0){a=0;return a|0}c[m>>2]=l&1|b|2;c[e+4>>2]=d|1;c[2029]=e;c[2026]=d;return a|0}if((i|0)==(c[2028]|0)){f=(c[2025]|0)+d|0;if(f>>>0<b>>>0){a=0;return a|0}d=f-b|0;e=l&1;if(d>>>0>15){l=a+b|0;k=l+d|0;c[m>>2]=e|b|2;c[l+4>>2]=d|1;c[k>>2]=d;e=k+4|0;c[e>>2]=c[e>>2]&-2;e=l}else{c[m>>2]=e|f|2;e=a+f+4|0;c[e>>2]=c[e>>2]|1;e=0;d=0}c[2025]=d;c[2028]=e;return a|0}e=c[i+4>>2]|0;if(e&2|0){a=0;return a|0}j=(e&-8)+d|0;if(j>>>0<b>>>0){a=0;return a|0}k=j-b|0;f=e>>>3;do if(e>>>0<256){e=c[i+8>>2]|0;d=c[i+12>>2]|0;if((d|0)==(e|0)){c[2023]=c[2023]&~(1<<f);break}else{c[e+12>>2]=d;c[d+8>>2]=e;break}}else{h=c[i+24>>2]|0;d=c[i+12>>2]|0;do if((d|0)==(i|0)){f=i+16|0;e=f+4|0;d=c[e>>2]|0;if(!d){d=c[f>>2]|0;if(!d){f=0;break}else g=f}else g=e;while(1){f=d+20|0;e=c[f>>2]|0;if(e|0){d=e;g=f;continue}e=d+16|0;f=c[e>>2]|0;if(!f)break;else{d=f;g=e}}c[g>>2]=0;f=d}else{f=c[i+8>>2]|0;c[f+12>>2]=d;c[d+8>>2]=f;f=d}while(0);if(h|0){d=c[i+28>>2]|0;e=8396+(d<<2)|0;if((i|0)==(c[e>>2]|0)){c[e>>2]=f;if(!f){c[2024]=c[2024]&~(1<<d);break}}else{c[h+16+(((c[h+16>>2]|0)!=(i|0)&1)<<2)>>2]=f;if(!f)break}c[f+24>>2]=h;d=i+16|0;e=c[d>>2]|0;if(e|0){c[f+16>>2]=e;c[e+24>>2]=f}d=c[d+4>>2]|0;if(d|0){c[f+20>>2]=d;c[d+24>>2]=f}}}while(0);d=l&1;if(k>>>0<16){c[m>>2]=j|d|2;m=a+j+4|0;c[m>>2]=c[m>>2]|1;return a|0}else{l=a+b|0;c[m>>2]=d|b|2;c[l+4>>2]=k|3;m=l+k+4|0;c[m>>2]=c[m>>2]|1;Rz(l,k);return a|0}return 0}function Rz(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0;j=a+b|0;d=c[a+4>>2]|0;do if(!(d&1)){e=c[a>>2]|0;if(!(d&3))return;g=a+(0-e)|0;h=e+b|0;if((g|0)==(c[2028]|0)){a=j+4|0;d=c[a>>2]|0;if((d&3|0)!=3){i=g;d=h;break}c[2025]=h;c[a>>2]=d&-2;c[g+4>>2]=h|1;c[g+h>>2]=h;return}b=e>>>3;if(e>>>0<256){a=c[g+8>>2]|0;d=c[g+12>>2]|0;if((d|0)==(a|0)){c[2023]=c[2023]&~(1<<b);i=g;d=h;break}else{c[a+12>>2]=d;c[d+8>>2]=a;i=g;d=h;break}}f=c[g+24>>2]|0;a=c[g+12>>2]|0;do if((a|0)==(g|0)){b=g+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){a=0;break}else d=b}while(1){b=a+20|0;e=c[b>>2]|0;if(e|0){a=e;d=b;continue}b=a+16|0;e=c[b>>2]|0;if(!e)break;else{a=e;d=b}}c[d>>2]=0}else{i=c[g+8>>2]|0;c[i+12>>2]=a;c[a+8>>2]=i}while(0);if(f){d=c[g+28>>2]|0;b=8396+(d<<2)|0;if((g|0)==(c[b>>2]|0)){c[b>>2]=a;if(!a){c[2024]=c[2024]&~(1<<d);i=g;d=h;break}}else{c[f+16+(((c[f+16>>2]|0)!=(g|0)&1)<<2)>>2]=a;if(!a){i=g;d=h;break}}c[a+24>>2]=f;d=g+16|0;b=c[d>>2]|0;if(b|0){c[a+16>>2]=b;c[b+24>>2]=a}d=c[d+4>>2]|0;if(d){c[a+20>>2]=d;c[d+24>>2]=a;i=g;d=h}else{i=g;d=h}}else{i=g;d=h}}else{i=a;d=b}while(0);a=j+4|0;e=c[a>>2]|0;if(!(e&2)){a=c[2028]|0;if((j|0)==(c[2029]|0)){j=(c[2026]|0)+d|0;c[2026]=j;c[2029]=i;c[i+4>>2]=j|1;if((i|0)!=(a|0))return;c[2028]=0;c[2025]=0;return}if((j|0)==(a|0)){j=(c[2025]|0)+d|0;c[2025]=j;c[2028]=i;c[i+4>>2]=j|1;c[i+j>>2]=j;return}g=(e&-8)+d|0;b=e>>>3;do if(e>>>0<256){d=c[j+8>>2]|0;a=c[j+12>>2]|0;if((a|0)==(d|0)){c[2023]=c[2023]&~(1<<b);break}else{c[d+12>>2]=a;c[a+8>>2]=d;break}}else{f=c[j+24>>2]|0;a=c[j+12>>2]|0;do if((a|0)==(j|0)){b=j+16|0;d=b+4|0;a=c[d>>2]|0;if(!a){a=c[b>>2]|0;if(!a){b=0;break}else d=b}while(1){b=a+20|0;e=c[b>>2]|0;if(e|0){a=e;d=b;continue}b=a+16|0;e=c[b>>2]|0;if(!e)break;else{a=e;d=b}}c[d>>2]=0;b=a}else{b=c[j+8>>2]|0;c[b+12>>2]=a;c[a+8>>2]=b;b=a}while(0);if(f|0){a=c[j+28>>2]|0;d=8396+(a<<2)|0;if((j|0)==(c[d>>2]|0)){c[d>>2]=b;if(!b){c[2024]=c[2024]&~(1<<a);break}}else{c[f+16+(((c[f+16>>2]|0)!=(j|0)&1)<<2)>>2]=b;if(!b)break}c[b+24>>2]=f;a=j+16|0;d=c[a>>2]|0;if(d|0){c[b+16>>2]=d;c[d+24>>2]=b}a=c[a+4>>2]|0;if(a|0){c[b+20>>2]=a;c[a+24>>2]=b}}}while(0);c[i+4>>2]=g|1;c[i+g>>2]=g;if((i|0)==(c[2028]|0)){c[2025]=g;return}else d=g}else{c[a>>2]=e&-2;c[i+4>>2]=d|1;c[i+d>>2]=d}a=d>>>3;if(d>>>0<256){b=8132+(a<<1<<2)|0;d=c[2023]|0;a=1<<a;if(!(d&a)){c[2023]=d|a;a=b;d=b+8|0}else{d=b+8|0;a=c[d>>2]|0}c[d>>2]=i;c[a+12>>2]=i;c[i+8>>2]=a;c[i+12>>2]=b;return}a=d>>>8;if(a)if(d>>>0>16777215)a=31;else{h=(a+1048320|0)>>>16&8;j=a<<h;g=(j+520192|0)>>>16&4;j=j<<g;a=(j+245760|0)>>>16&2;a=14-(g|h|a)+(j<<a>>>15)|0;a=d>>>(a+7|0)&1|a<<1}else a=0;f=8396+(a<<2)|0;c[i+28>>2]=a;c[i+20>>2]=0;c[i+16>>2]=0;b=c[2024]|0;e=1<<a;if(!(b&e)){c[2024]=b|e;c[f>>2]=i;c[i+24>>2]=f;c[i+12>>2]=i;c[i+8>>2]=i;return}b=d<<((a|0)==31?0:25-(a>>>1)|0);e=c[f>>2]|0;while(1){if((c[e+4>>2]&-8|0)==(d|0)){a=69;break}f=e+16+(b>>>31<<2)|0;a=c[f>>2]|0;if(!a){a=68;break}else{b=b<<1;e=a}}if((a|0)==68){c[f>>2]=i;c[i+24>>2]=e;c[i+12>>2]=i;c[i+8>>2]=i;return}else if((a|0)==69){h=e+8|0;j=c[h>>2]|0;c[j+12>>2]=i;c[h>>2]=i;c[i+8>>2]=j;c[i+12>>2]=e;c[i+24>>2]=0;return}}function Sz(){return 8588}function Tz(a){a=a|0;var b=0,d=0;b=l;l=l+16|0;d=b;c[d>>2]=_z(c[a+60>>2]|0)|0;a=Wz(Ca(6,d|0)|0)|0;l=b;return a|0}function Uz(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0;n=l;l=l+48|0;k=n+16|0;g=n;f=n+32|0;i=a+28|0;e=c[i>>2]|0;c[f>>2]=e;j=a+20|0;e=(c[j>>2]|0)-e|0;c[f+4>>2]=e;c[f+8>>2]=b;c[f+12>>2]=d;e=e+d|0;h=a+60|0;c[g>>2]=c[h>>2];c[g+4>>2]=f;c[g+8>>2]=2;g=Wz(Aa(146,g|0)|0)|0;a:do if((e|0)!=(g|0)){b=2;while(1){if((g|0)<0)break;e=e-g|0;p=c[f+4>>2]|0;o=g>>>0>p>>>0;f=o?f+8|0:f;b=(o<<31>>31)+b|0;p=g-(o?p:0)|0;c[f>>2]=(c[f>>2]|0)+p;o=f+4|0;c[o>>2]=(c[o>>2]|0)-p;c[k>>2]=c[h>>2];c[k+4>>2]=f;c[k+8>>2]=b;g=Wz(Aa(146,k|0)|0)|0;if((e|0)==(g|0)){m=3;break a}}c[a+16>>2]=0;c[i>>2]=0;c[j>>2]=0;c[a>>2]=c[a>>2]|32;if((b|0)==2)d=0;else d=d-(c[f+4>>2]|0)|0}else m=3;while(0);if((m|0)==3){p=c[a+44>>2]|0;c[a+16>>2]=p+(c[a+48>>2]|0);c[i>>2]=p;c[j>>2]=p}l=n;return d|0}function Vz(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0;f=l;l=l+32|0;g=f;e=f+20|0;c[g>>2]=c[a+60>>2];c[g+4>>2]=0;c[g+8>>2]=b;c[g+12>>2]=e;c[g+16>>2]=d;if((Wz(za(140,g|0)|0)|0)<0){c[e>>2]=-1;a=-1}else a=c[e>>2]|0;l=f;return a|0}function Wz(a){a=a|0;if(a>>>0>4294963200){c[(Xz()|0)>>2]=0-a;a=-1}return a|0}function Xz(){return (Yz()|0)+64|0}function Yz(){return Zz()|0}function Zz(){return 1324}function _z(a){a=a|0;return a|0}function $z(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;g=l;l=l+32|0;f=g;c[b+36>>2]=5;if((c[b>>2]&64|0)==0?(c[f>>2]=c[b+60>>2],c[f+4>>2]=21523,c[f+8>>2]=g+16,Ba(54,f|0)|0):0)a[b+75>>0]=-1;f=Uz(b,d,e)|0;l=g;return f|0}function aA(b,c){b=b|0;c=c|0;var d=0,e=0;d=a[b>>0]|0;e=a[c>>0]|0;if(d<<24>>24==0?1:d<<24>>24!=e<<24>>24)b=e;else{do{b=b+1|0;c=c+1|0;d=a[b>>0]|0;e=a[c>>0]|0}while(!(d<<24>>24==0?1:d<<24>>24!=e<<24>>24));b=e}return (d&255)-(b&255)|0}function bA(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;a:do if(!d)b=0;else{while(1){e=a[b>>0]|0;f=a[c>>0]|0;if(e<<24>>24!=f<<24>>24)break;d=d+-1|0;if(!d){b=0;break a}else{b=b+1|0;c=c+1|0}}b=(e&255)-(f&255)|0}while(0);return b|0}function cA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;s=l;l=l+224|0;n=s+120|0;o=s+80|0;q=s;r=s+136|0;f=o;g=f+40|0;do{c[f>>2]=0;f=f+4|0}while((f|0)<(g|0));c[n>>2]=c[e>>2];if((dA(0,d,n,q,o)|0)<0)e=-1;else{if((c[b+76>>2]|0)>-1)p=eA(b)|0;else p=0;e=c[b>>2]|0;m=e&32;if((a[b+74>>0]|0)<1)c[b>>2]=e&-33;f=b+48|0;if(!(c[f>>2]|0)){g=b+44|0;h=c[g>>2]|0;c[g>>2]=r;i=b+28|0;c[i>>2]=r;j=b+20|0;c[j>>2]=r;c[f>>2]=80;k=b+16|0;c[k>>2]=r+80;e=dA(b,d,n,q,o)|0;if(h){pb[c[b+36>>2]&7](b,0,0)|0;e=(c[j>>2]|0)==0?-1:e;c[g>>2]=h;c[f>>2]=0;c[k>>2]=0;c[i>>2]=0;c[j>>2]=0}}else e=dA(b,d,n,q,o)|0;f=c[b>>2]|0;c[b>>2]=f|m;if(p|0)fA(b);e=(f&32|0)==0?e:-1}l=s;return e|0}function dA(d,e,f,g,i){d=d|0;e=e|0;f=f|0;g=g|0;i=i|0;var j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;H=l;l=l+64|0;D=H+16|0;E=H;B=H+24|0;F=H+8|0;G=H+20|0;c[D>>2]=e;x=(d|0)!=0;y=B+40|0;z=y;B=B+39|0;C=F+4|0;k=0;j=0;p=0;a:while(1){do if((j|0)>-1)if((k|0)>(2147483647-j|0)){c[(Xz()|0)>>2]=75;j=-1;break}else{j=k+j|0;break}while(0);k=a[e>>0]|0;if(!(k<<24>>24)){w=87;break}else m=e;b:while(1){switch(k<<24>>24){case 37:{k=m;w=9;break b}case 0:{k=m;break b}default:{}}v=m+1|0;c[D>>2]=v;k=a[v>>0]|0;m=v}c:do if((w|0)==9)while(1){w=0;if((a[m+1>>0]|0)!=37)break c;k=k+1|0;m=m+2|0;c[D>>2]=m;if((a[m>>0]|0)==37)w=9;else break}while(0);k=k-e|0;if(x)gA(d,e,k);if(k|0){e=m;continue}n=m+1|0;k=(a[n>>0]|0)+-48|0;if(k>>>0<10){v=(a[m+2>>0]|0)==36;u=v?k:-1;p=v?1:p;n=v?m+3|0:n}else u=-1;c[D>>2]=n;k=a[n>>0]|0;m=(k<<24>>24)+-32|0;d:do if(m>>>0<32){o=0;q=k;while(1){k=1<<m;if(!(k&75913)){k=q;break d}o=k|o;n=n+1|0;c[D>>2]=n;k=a[n>>0]|0;m=(k<<24>>24)+-32|0;if(m>>>0>=32)break;else q=k}}else o=0;while(0);if(k<<24>>24==42){m=n+1|0;k=(a[m>>0]|0)+-48|0;if(k>>>0<10?(a[n+2>>0]|0)==36:0){c[i+(k<<2)>>2]=10;k=c[g+((a[m>>0]|0)+-48<<3)>>2]|0;p=1;n=n+3|0}else{if(p|0){j=-1;break}if(x){p=(c[f>>2]|0)+(4-1)&~(4-1);k=c[p>>2]|0;c[f>>2]=p+4;p=0;n=m}else{k=0;p=0;n=m}}c[D>>2]=n;v=(k|0)<0;k=v?0-k|0:k;o=v?o|8192:o}else{k=hA(D)|0;if((k|0)<0){j=-1;break}n=c[D>>2]|0}do if((a[n>>0]|0)==46){if((a[n+1>>0]|0)!=42){c[D>>2]=n+1;m=hA(D)|0;n=c[D>>2]|0;break}q=n+2|0;m=(a[q>>0]|0)+-48|0;if(m>>>0<10?(a[n+3>>0]|0)==36:0){c[i+(m<<2)>>2]=10;m=c[g+((a[q>>0]|0)+-48<<3)>>2]|0;n=n+4|0;c[D>>2]=n;break}if(p|0){j=-1;break a}if(x){v=(c[f>>2]|0)+(4-1)&~(4-1);m=c[v>>2]|0;c[f>>2]=v+4}else m=0;c[D>>2]=q;n=q}else m=-1;while(0);t=0;while(1){if(((a[n>>0]|0)+-65|0)>>>0>57){j=-1;break a}v=n+1|0;c[D>>2]=v;q=a[(a[n>>0]|0)+-65+(3420+(t*58|0))>>0]|0;r=q&255;if((r+-1|0)>>>0<8){t=r;n=v}else break}if(!(q<<24>>24)){j=-1;break}s=(u|0)>-1;do if(q<<24>>24==19)if(s){j=-1;break a}else w=49;else{if(s){c[i+(u<<2)>>2]=r;s=g+(u<<3)|0;u=c[s+4>>2]|0;w=E;c[w>>2]=c[s>>2];c[w+4>>2]=u;w=49;break}if(!x){j=0;break a}iA(E,r,f)}while(0);if((w|0)==49?(w=0,!x):0){k=0;e=v;continue}n=a[n>>0]|0;n=(t|0)!=0&(n&15|0)==3?n&-33:n;s=o&-65537;u=(o&8192|0)==0?o:s;e:do switch(n|0){case 110:switch((t&255)<<24>>24){case 0:{c[c[E>>2]>>2]=j;k=0;e=v;continue a}case 1:{c[c[E>>2]>>2]=j;k=0;e=v;continue a}case 2:{k=c[E>>2]|0;c[k>>2]=j;c[k+4>>2]=((j|0)<0)<<31>>31;k=0;e=v;continue a}case 3:{b[c[E>>2]>>1]=j;k=0;e=v;continue a}case 4:{a[c[E>>2]>>0]=j;k=0;e=v;continue a}case 6:{c[c[E>>2]>>2]=j;k=0;e=v;continue a}case 7:{k=c[E>>2]|0;c[k>>2]=j;c[k+4>>2]=((j|0)<0)<<31>>31;k=0;e=v;continue a}default:{k=0;e=v;continue a}}case 112:{n=120;m=m>>>0>8?m:8;e=u|8;w=61;break}case 88:case 120:{e=u;w=61;break}case 111:{n=E;e=c[n>>2]|0;n=c[n+4>>2]|0;r=kA(e,n,y)|0;s=z-r|0;o=0;q=3884;m=(u&8|0)==0|(m|0)>(s|0)?m:s+1|0;s=u;w=67;break}case 105:case 100:{n=E;e=c[n>>2]|0;n=c[n+4>>2]|0;if((n|0)<0){e=eB(0,0,e|0,n|0)|0;n=A;o=E;c[o>>2]=e;c[o+4>>2]=n;o=1;q=3884;w=66;break e}else{o=(u&2049|0)!=0&1;q=(u&2048|0)==0?((u&1|0)==0?3884:3886):3885;w=66;break e}}case 117:{n=E;o=0;q=3884;e=c[n>>2]|0;n=c[n+4>>2]|0;w=66;break}case 99:{a[B>>0]=c[E>>2];e=B;o=0;q=3884;r=y;n=1;m=s;break}case 109:{n=mA(c[(Xz()|0)>>2]|0)|0;w=71;break}case 115:{n=c[E>>2]|0;n=n|0?n:3894;w=71;break}case 67:{c[F>>2]=c[E>>2];c[C>>2]=0;c[E>>2]=F;r=-1;n=F;w=75;break}case 83:{e=c[E>>2]|0;if(!m){oA(d,32,k,0,u);e=0;w=84}else{r=m;n=e;w=75}break}case 65:case 71:case 70:case 69:case 97:case 103:case 102:case 101:{k=qA(d,+h[E>>3],k,m,u,n)|0;e=v;continue a}default:{o=0;q=3884;r=y;n=m;m=u}}while(0);f:do if((w|0)==61){u=E;t=c[u>>2]|0;u=c[u+4>>2]|0;r=jA(t,u,y,n&32)|0;q=(e&8|0)==0|(t|0)==0&(u|0)==0;o=q?0:2;q=q?3884:3884+(n>>4)|0;s=e;e=t;n=u;w=67}else if((w|0)==66){r=lA(e,n,y)|0;s=u;w=67}else if((w|0)==71){w=0;u=nA(n,0,m)|0;t=(u|0)==0;e=n;o=0;q=3884;r=t?n+m|0:u;n=t?m:u-n|0;m=s}else if((w|0)==75){w=0;q=n;e=0;m=0;while(1){o=c[q>>2]|0;if(!o)break;m=pA(G,o)|0;if((m|0)<0|m>>>0>(r-e|0)>>>0)break;e=m+e|0;if(r>>>0>e>>>0)q=q+4|0;else break}if((m|0)<0){j=-1;break a}oA(d,32,k,e,u);if(!e){e=0;w=84}else{o=0;while(1){m=c[n>>2]|0;if(!m){w=84;break f}m=pA(G,m)|0;o=m+o|0;if((o|0)>(e|0)){w=84;break f}gA(d,G,m);if(o>>>0>=e>>>0){w=84;break}else n=n+4|0}}}while(0);if((w|0)==67){w=0;n=(e|0)!=0|(n|0)!=0;u=(m|0)!=0|n;n=((n^1)&1)+(z-r)|0;e=u?r:y;r=y;n=u?((m|0)>(n|0)?m:n):m;m=(m|0)>-1?s&-65537:s}else if((w|0)==84){w=0;oA(d,32,k,e,u^8192);k=(k|0)>(e|0)?k:e;e=v;continue}t=r-e|0;s=(n|0)<(t|0)?t:n;u=s+o|0;k=(k|0)<(u|0)?u:k;oA(d,32,k,u,m);gA(d,q,o);oA(d,48,k,u,m^65536);oA(d,48,s,t,0);gA(d,e,t);oA(d,32,k,u,m^8192);e=v}g:do if((w|0)==87)if(!d)if(!p)j=0;else{j=1;while(1){e=c[i+(j<<2)>>2]|0;if(!e)break;iA(g+(j<<3)|0,e,f);j=j+1|0;if((j|0)>=10){j=1;break g}}while(1){if(c[i+(j<<2)>>2]|0){j=-1;break g}j=j+1|0;if((j|0)>=10){j=1;break}}}while(0);l=H;return j|0}function eA(a){a=a|0;return 0}function fA(a){a=a|0;return}function gA(a,b,d){a=a|0;b=b|0;d=d|0;if(!(c[a>>2]&32))CA(b,d,a)|0;return}function hA(b){b=b|0;var d=0,e=0,f=0;e=c[b>>2]|0;f=(a[e>>0]|0)+-48|0;if(f>>>0<10){d=0;do{d=f+(d*10|0)|0;e=e+1|0;c[b>>2]=e;f=(a[e>>0]|0)+-48|0}while(f>>>0<10)}else d=0;return d|0}function iA(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0.0;a:do if(b>>>0<=20)do switch(b|0){case 9:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;c[a>>2]=b;break a}case 10:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=((b|0)<0)<<31>>31;break a}case 11:{e=(c[d>>2]|0)+(4-1)&~(4-1);b=c[e>>2]|0;c[d>>2]=e+4;e=a;c[e>>2]=b;c[e+4>>2]=0;break a}case 12:{e=(c[d>>2]|0)+(8-1)&~(8-1);b=e;f=c[b>>2]|0;b=c[b+4>>2]|0;c[d>>2]=e+8;e=a;c[e>>2]=f;c[e+4>>2]=b;break a}case 13:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&65535)<<16>>16;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 14:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&65535;c[f+4>>2]=0;break a}case 15:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;e=(e&255)<<24>>24;f=a;c[f>>2]=e;c[f+4>>2]=((e|0)<0)<<31>>31;break a}case 16:{f=(c[d>>2]|0)+(4-1)&~(4-1);e=c[f>>2]|0;c[d>>2]=f+4;f=a;c[f>>2]=e&255;c[f+4>>2]=0;break a}case 17:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}case 18:{f=(c[d>>2]|0)+(8-1)&~(8-1);g=+h[f>>3];c[d>>2]=f+8;h[a>>3]=g;break a}default:break a}while(0);while(0);return}function jA(b,c,e,f){b=b|0;c=c|0;e=e|0;f=f|0;if(!((b|0)==0&(c|0)==0))do{e=e+-1|0;a[e>>0]=d[3936+(b&15)>>0]|0|f;b=jB(b|0,c|0,4)|0;c=A}while(!((b|0)==0&(c|0)==0));return e|0}function kA(b,c,d){b=b|0;c=c|0;d=d|0;if(!((b|0)==0&(c|0)==0))do{d=d+-1|0;a[d>>0]=b&7|48;b=jB(b|0,c|0,3)|0;c=A}while(!((b|0)==0&(c|0)==0));return d|0}function lA(b,c,d){b=b|0;c=c|0;d=d|0;var e=0;if(c>>>0>0|(c|0)==0&b>>>0>4294967295){while(1){e=iB(b|0,c|0,10,0)|0;d=d+-1|0;a[d>>0]=e&255|48;e=b;b=hB(b|0,c|0,10,0)|0;if(!(c>>>0>9|(c|0)==9&e>>>0>4294967295))break;else c=A}c=b}else c=b;if(c)while(1){d=d+-1|0;a[d>>0]=(c>>>0)%10|0|48;if(c>>>0<10)break;else c=(c>>>0)/10|0}return d|0}function mA(a){a=a|0;return xA(a,c[(wA()|0)+188>>2]|0)|0}function nA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=d&255;f=(e|0)!=0;a:do if(f&(b&3|0)!=0){g=d&255;while(1){if((a[b>>0]|0)==g<<24>>24){i=6;break a}b=b+1|0;e=e+-1|0;f=(e|0)!=0;if(!(f&(b&3|0)!=0)){i=5;break}}}else i=5;while(0);if((i|0)==5)if(f)i=6;else e=0;b:do if((i|0)==6){g=d&255;if((a[b>>0]|0)!=g<<24>>24){f=P(h,16843009)|0;c:do if(e>>>0>3)while(1){h=c[b>>2]^f;if((h&-2139062144^-2139062144)&h+-16843009|0)break;b=b+4|0;e=e+-4|0;if(e>>>0<=3){i=11;break c}}else i=11;while(0);if((i|0)==11)if(!e){e=0;break}while(1){if((a[b>>0]|0)==g<<24>>24)break b;b=b+1|0;e=e+-1|0;if(!e){e=0;break}}}}while(0);return (e|0?b:0)|0}function oA(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;g=l;l=l+256|0;f=g;if((c|0)>(d|0)&(e&73728|0)==0){e=c-d|0;nB(f|0,b|0,(e>>>0<256?e:256)|0)|0;if(e>>>0>255){b=c-d|0;do{gA(a,f,256);e=e+-256|0}while(e>>>0>255);e=b&255}gA(a,f,e)}l=g;return}function pA(a,b){a=a|0;b=b|0;if(!a)a=0;else a=uA(a,b,0)|0;return a|0}function qA(b,e,f,g,h,i){b=b|0;e=+e;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,m=0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;H=l;l=l+560|0;m=H+8|0;u=H;G=H+524|0;F=G;n=H+512|0;c[u>>2]=0;E=n+12|0;rA(e)|0;if((A|0)<0){e=-e;C=1;B=3901}else{C=(h&2049|0)!=0&1;B=(h&2048|0)==0?((h&1|0)==0?3902:3907):3904}rA(e)|0;D=A&2146435072;do if(D>>>0<2146435072|(D|0)==2146435072&0<0){r=+sA(e,u)*2.0;j=r!=0.0;if(j)c[u>>2]=(c[u>>2]|0)+-1;w=i|32;if((w|0)==97){s=i&32;q=(s|0)==0?B:B+9|0;p=C|2;j=12-g|0;do if(!(g>>>0>11|(j|0)==0)){e=8.0;do{j=j+-1|0;e=e*16.0}while((j|0)!=0);if((a[q>>0]|0)==45){e=-(e+(-r-e));break}else{e=r+e-e;break}}else e=r;while(0);k=c[u>>2]|0;j=(k|0)<0?0-k|0:k;j=lA(j,((j|0)<0)<<31>>31,E)|0;if((j|0)==(E|0)){j=n+11|0;a[j>>0]=48}a[j+-1>>0]=(k>>31&2)+43;o=j+-2|0;a[o>>0]=i+15;n=(g|0)<1;m=(h&8|0)==0;j=G;do{D=~~e;k=j+1|0;a[j>>0]=d[3936+D>>0]|s;e=(e-+(D|0))*16.0;if((k-F|0)==1?!(m&(n&e==0.0)):0){a[k>>0]=46;j=j+2|0}else j=k}while(e!=0.0);D=j-F|0;F=E-o|0;E=(g|0)!=0&(D+-2|0)<(g|0)?g+2|0:D;j=F+p+E|0;oA(b,32,f,j,h);gA(b,q,p);oA(b,48,f,j,h^65536);gA(b,G,D);oA(b,48,E-D|0,0,0);gA(b,o,F);oA(b,32,f,j,h^8192);break}k=(g|0)<0?6:g;if(j){j=(c[u>>2]|0)+-28|0;c[u>>2]=j;e=r*268435456.0}else{e=r;j=c[u>>2]|0}D=(j|0)<0?m:m+288|0;m=D;do{y=~~e>>>0;c[m>>2]=y;m=m+4|0;e=(e-+(y>>>0))*1.0e9}while(e!=0.0);if((j|0)>0){n=D;p=m;while(1){o=(j|0)<29?j:29;j=p+-4|0;if(j>>>0>=n>>>0){m=0;do{x=kB(c[j>>2]|0,0,o|0)|0;x=dB(x|0,A|0,m|0,0)|0;y=A;v=iB(x|0,y|0,1e9,0)|0;c[j>>2]=v;m=hB(x|0,y|0,1e9,0)|0;j=j+-4|0}while(j>>>0>=n>>>0);if(m){n=n+-4|0;c[n>>2]=m}}m=p;while(1){if(m>>>0<=n>>>0)break;j=m+-4|0;if(!(c[j>>2]|0))m=j;else break}j=(c[u>>2]|0)-o|0;c[u>>2]=j;if((j|0)>0)p=m;else break}}else n=D;if((j|0)<0){g=((k+25|0)/9|0)+1|0;t=(w|0)==102;do{s=0-j|0;s=(s|0)<9?s:9;if(n>>>0<m>>>0){o=(1<<s)+-1|0;p=1e9>>>s;q=0;j=n;do{y=c[j>>2]|0;c[j>>2]=(y>>>s)+q;q=P(y&o,p)|0;j=j+4|0}while(j>>>0<m>>>0);j=(c[n>>2]|0)==0?n+4|0:n;if(!q){n=j;j=m}else{c[m>>2]=q;n=j;j=m+4|0}}else{n=(c[n>>2]|0)==0?n+4|0:n;j=m}m=t?D:n;m=(j-m>>2|0)>(g|0)?m+(g<<2)|0:j;j=(c[u>>2]|0)+s|0;c[u>>2]=j}while((j|0)<0);j=n;g=m}else{j=n;g=m}y=D;if(j>>>0<g>>>0){m=(y-j>>2)*9|0;o=c[j>>2]|0;if(o>>>0>=10){n=10;do{n=n*10|0;m=m+1|0}while(o>>>0>=n>>>0)}}else m=0;t=(w|0)==103;v=(k|0)!=0;n=k-((w|0)!=102?m:0)+((v&t)<<31>>31)|0;if((n|0)<(((g-y>>2)*9|0)+-9|0)){n=n+9216|0;s=D+4+(((n|0)/9|0)+-1024<<2)|0;n=((n|0)%9|0)+1|0;if((n|0)<9){o=10;do{o=o*10|0;n=n+1|0}while((n|0)!=9)}else o=10;p=c[s>>2]|0;q=(p>>>0)%(o>>>0)|0;n=(s+4|0)==(g|0);if(!(n&(q|0)==0)){r=(((p>>>0)/(o>>>0)|0)&1|0)==0?9007199254740992.0:9007199254740994.0;x=(o|0)/2|0;e=q>>>0<x>>>0?.5:n&(q|0)==(x|0)?1.0:1.5;if(C){x=(a[B>>0]|0)==45;e=x?-e:e;r=x?-r:r}n=p-q|0;c[s>>2]=n;if(r+e!=r){x=n+o|0;c[s>>2]=x;if(x>>>0>999999999){m=s;while(1){n=m+-4|0;c[m>>2]=0;if(n>>>0<j>>>0){j=j+-4|0;c[j>>2]=0}x=(c[n>>2]|0)+1|0;c[n>>2]=x;if(x>>>0>999999999)m=n;else break}}else n=s;m=(y-j>>2)*9|0;p=c[j>>2]|0;if(p>>>0>=10){o=10;do{o=o*10|0;m=m+1|0}while(p>>>0>=o>>>0)}}else n=s}else n=s;n=n+4|0;n=g>>>0>n>>>0?n:g;x=j}else{n=g;x=j}w=n;while(1){if(w>>>0<=x>>>0){u=0;break}j=w+-4|0;if(!(c[j>>2]|0))w=j;else{u=1;break}}g=0-m|0;do if(t){j=((v^1)&1)+k|0;if((j|0)>(m|0)&(m|0)>-5){o=i+-1|0;k=j+-1-m|0}else{o=i+-2|0;k=j+-1|0}j=h&8;if(!j){if(u?(z=c[w+-4>>2]|0,(z|0)!=0):0)if(!((z>>>0)%10|0)){n=0;j=10;do{j=j*10|0;n=n+1|0}while(!((z>>>0)%(j>>>0)|0|0))}else n=0;else n=9;j=((w-y>>2)*9|0)+-9|0;if((o|32|0)==102){s=j-n|0;s=(s|0)>0?s:0;k=(k|0)<(s|0)?k:s;s=0;break}else{s=j+m-n|0;s=(s|0)>0?s:0;k=(k|0)<(s|0)?k:s;s=0;break}}else s=j}else{o=i;s=h&8}while(0);t=k|s;p=(t|0)!=0&1;q=(o|32|0)==102;if(q){v=0;j=(m|0)>0?m:0}else{j=(m|0)<0?g:m;j=lA(j,((j|0)<0)<<31>>31,E)|0;n=E;if((n-j|0)<2)do{j=j+-1|0;a[j>>0]=48}while((n-j|0)<2);a[j+-1>>0]=(m>>31&2)+43;j=j+-2|0;a[j>>0]=o;v=j;j=n-j|0}j=C+1+k+p+j|0;oA(b,32,f,j,h);gA(b,B,C);oA(b,48,f,j,h^65536);if(q){o=x>>>0>D>>>0?D:x;s=G+9|0;p=s;q=G+8|0;n=o;do{m=lA(c[n>>2]|0,0,s)|0;if((n|0)==(o|0)){if((m|0)==(s|0)){a[q>>0]=48;m=q}}else if(m>>>0>G>>>0){nB(G|0,48,m-F|0)|0;do m=m+-1|0;while(m>>>0>G>>>0)}gA(b,m,p-m|0);n=n+4|0}while(n>>>0<=D>>>0);if(t|0)gA(b,3952,1);if(n>>>0<w>>>0&(k|0)>0)while(1){m=lA(c[n>>2]|0,0,s)|0;if(m>>>0>G>>>0){nB(G|0,48,m-F|0)|0;do m=m+-1|0;while(m>>>0>G>>>0)}gA(b,m,(k|0)<9?k:9);n=n+4|0;m=k+-9|0;if(!(n>>>0<w>>>0&(k|0)>9)){k=m;break}else k=m}oA(b,48,k+9|0,9,0)}else{t=u?w:x+4|0;if((k|0)>-1){u=G+9|0;s=(s|0)==0;g=u;p=0-F|0;q=G+8|0;o=x;do{m=lA(c[o>>2]|0,0,u)|0;if((m|0)==(u|0)){a[q>>0]=48;m=q}do if((o|0)==(x|0)){n=m+1|0;gA(b,m,1);if(s&(k|0)<1){m=n;break}gA(b,3952,1);m=n}else{if(m>>>0<=G>>>0)break;nB(G|0,48,m+p|0)|0;do m=m+-1|0;while(m>>>0>G>>>0)}while(0);F=g-m|0;gA(b,m,(k|0)>(F|0)?F:k);k=k-F|0;o=o+4|0}while(o>>>0<t>>>0&(k|0)>-1)}oA(b,48,k+18|0,18,0);gA(b,v,E-v|0)}oA(b,32,f,j,h^8192)}else{G=(i&32|0)!=0;j=C+3|0;oA(b,32,f,j,h&-65537);gA(b,B,C);gA(b,e!=e|0.0!=0.0?(G?3928:3932):G?3920:3924,3);oA(b,32,f,j,h^8192)}while(0);l=H;return ((j|0)<(f|0)?f:j)|0}function rA(a){a=+a;var b=0;h[j>>3]=a;b=c[j>>2]|0;A=c[j+4>>2]|0;return b|0}function sA(a,b){a=+a;b=b|0;return +(+tA(a,b))}function tA(a,b){a=+a;b=b|0;var d=0,e=0,f=0;h[j>>3]=a;d=c[j>>2]|0;e=c[j+4>>2]|0;f=jB(d|0,e|0,52)|0;switch(f&2047){case 0:{if(a!=0.0){a=+tA(a*18446744073709551616.0,b);d=(c[b>>2]|0)+-64|0}else d=0;c[b>>2]=d;break}case 2047:break;default:{c[b>>2]=(f&2047)+-1022;c[j>>2]=d;c[j+4>>2]=e&-2146435073|1071644672;a=+h[j>>3]}}return +a}function uA(b,d,e){b=b|0;d=d|0;e=e|0;do if(b){if(d>>>0<128){a[b>>0]=d;b=1;break}if(!(c[c[(vA()|0)+188>>2]>>2]|0))if((d&-128|0)==57216){a[b>>0]=d;b=1;break}else{c[(Xz()|0)>>2]=84;b=-1;break}if(d>>>0<2048){a[b>>0]=d>>>6|192;a[b+1>>0]=d&63|128;b=2;break}if(d>>>0<55296|(d&-8192|0)==57344){a[b>>0]=d>>>12|224;a[b+1>>0]=d>>>6&63|128;a[b+2>>0]=d&63|128;b=3;break}if((d+-65536|0)>>>0<1048576){a[b>>0]=d>>>18|240;a[b+1>>0]=d>>>12&63|128;a[b+2>>0]=d>>>6&63|128;a[b+3>>0]=d&63|128;b=4;break}else{c[(Xz()|0)>>2]=84;b=-1;break}}else b=1;while(0);return b|0}function vA(){return Zz()|0}function wA(){return Zz()|0}function xA(b,e){b=b|0;e=e|0;var f=0,g=0;g=0;while(1){if((d[3954+g>>0]|0)==(b|0)){b=2;break}f=g+1|0;if((f|0)==87){f=4042;g=87;b=5;break}else g=f}if((b|0)==2)if(!g)f=4042;else{f=4042;b=5}if((b|0)==5)while(1){do{b=f;f=f+1|0}while((a[b>>0]|0)!=0);g=g+-1|0;if(!g)break;else b=5}return yA(f,c[e+20>>2]|0)|0}function yA(a,b){a=a|0;b=b|0;return zA(a,b)|0}function zA(a,b){a=a|0;b=b|0;if(!b)b=0;else b=AA(c[b>>2]|0,c[b+4>>2]|0,a)|0;return (b|0?b:a)|0}function AA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;o=(c[b>>2]|0)+1794895138|0;h=BA(c[b+8>>2]|0,o)|0;f=BA(c[b+12>>2]|0,o)|0;g=BA(c[b+16>>2]|0,o)|0;a:do if((h>>>0<d>>>2>>>0?(n=d-(h<<2)|0,f>>>0<n>>>0&g>>>0<n>>>0):0)?((g|f)&3|0)==0:0){n=f>>>2;m=g>>>2;l=0;while(1){j=h>>>1;k=l+j|0;i=k<<1;g=i+n|0;f=BA(c[b+(g<<2)>>2]|0,o)|0;g=BA(c[b+(g+1<<2)>>2]|0,o)|0;if(!(g>>>0<d>>>0&f>>>0<(d-g|0)>>>0)){f=0;break a}if(a[b+(g+f)>>0]|0){f=0;break a}f=aA(e,b+g|0)|0;if(!f)break;f=(f|0)<0;if((h|0)==1){f=0;break a}else{l=f?l:k;h=f?j:h-j|0}}f=i+m|0;g=BA(c[b+(f<<2)>>2]|0,o)|0;f=BA(c[b+(f+1<<2)>>2]|0,o)|0;if(f>>>0<d>>>0&g>>>0<(d-f|0)>>>0)f=(a[b+(f+g)>>0]|0)==0?b+f|0:0;else f=0}else f=0;while(0);return f|0}function BA(a,b){a=a|0;b=b|0;var c=0;c=lB(a|0)|0;return ((b|0)==0?a:c)|0}function CA(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;f=e+16|0;g=c[f>>2]|0;if(!g)if(!(DA(e)|0)){g=c[f>>2]|0;h=5}else f=0;else h=5;a:do if((h|0)==5){j=e+20|0;i=c[j>>2]|0;f=i;if((g-i|0)>>>0<d>>>0){f=pb[c[e+36>>2]&7](e,b,d)|0;break}b:do if((a[e+75>>0]|0)>-1){i=d;while(1){if(!i){h=0;g=b;break b}g=i+-1|0;if((a[b+g>>0]|0)==10)break;else i=g}f=pb[c[e+36>>2]&7](e,b,i)|0;if(f>>>0<i>>>0)break a;h=i;g=b+i|0;d=d-i|0;f=c[j>>2]|0}else{h=0;g=b}while(0);mB(f|0,g|0,d|0)|0;c[j>>2]=(c[j>>2]|0)+d;f=h+d|0}while(0);return f|0}function DA(b){b=b|0;var d=0,e=0;d=b+74|0;e=a[d>>0]|0;a[d>>0]=e+255|e;d=c[b>>2]|0;if(!(d&8)){c[b+8>>2]=0;c[b+4>>2]=0;e=c[b+44>>2]|0;c[b+28>>2]=e;c[b+20>>2]=e;c[b+16>>2]=e+(c[b+48>>2]|0);b=0}else{c[b>>2]=d|32;b=-1}return b|0}function EA(b){b=b|0;var d=0,e=0,f=0;f=b;a:do if(!(f&3))e=4;else{d=f;while(1){if(!(a[b>>0]|0)){b=d;break a}b=b+1|0;d=b;if(!(d&3)){e=4;break}}}while(0);if((e|0)==4){while(1){d=c[b>>2]|0;if(!((d&-2139062144^-2139062144)&d+-16843009))b=b+4|0;else break}if((d&255)<<24>>24)do b=b+1|0;while((a[b>>0]|0)!=0)}return b-f|0}function FA(a,b){a=T(a);b=T(b);var c=0,d=0;c=GA(a)|0;do if((c&2147483647)>>>0<=2139095040){d=GA(b)|0;if((d&2147483647)>>>0<=2139095040)if((d^c|0)<0){a=(c|0)<0?b:a;break}else{a=a<b?b:a;break}}else a=b;while(0);return T(a)}function GA(a){a=T(a);return (g[j>>2]=a,c[j>>2]|0)|0}function HA(a,b){a=T(a);b=T(b);var c=0,d=0;c=IA(a)|0;do if((c&2147483647)>>>0<=2139095040){d=IA(b)|0;if((d&2147483647)>>>0<=2139095040)if((d^c|0)<0){a=(c|0)<0?a:b;break}else{a=a<b?a:b;break}}else a=b;while(0);return T(a)}function IA(a){a=T(a);return (g[j>>2]=a,c[j>>2]|0)|0}function JA(a,b){a=a|0;b=b|0;var c=0;c=EA(a)|0;return ((KA(a,1,c,b)|0)!=(c|0))<<31>>31|0}function KA(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;f=P(d,b)|0;d=(b|0)==0?0:d;if((c[e+76>>2]|0)>-1){g=(eA(e)|0)==0;a=CA(a,f,e)|0;if(!g)fA(e)}else a=CA(a,f,e)|0;if((a|0)!=(f|0))d=(a>>>0)/(b>>>0)|0;return d|0}function LA(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,m=0;m=l;l=l+16|0;j=m;k=e&255;a[j>>0]=k;g=b+16|0;h=c[g>>2]|0;if(!h)if(!(DA(b)|0)){h=c[g>>2]|0;i=4}else f=-1;else i=4;do if((i|0)==4){i=b+20|0;g=c[i>>2]|0;if(g>>>0<h>>>0?(f=e&255,(f|0)!=(a[b+75>>0]|0)):0){c[i>>2]=g+1;a[g>>0]=k;break}if((pb[c[b+36>>2]&7](b,j,1)|0)==1)f=d[j>>0]|0;else f=-1}while(0);l=m;return f|0}function MA(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0;j=b&255;e=b&255;if((c[d+76>>2]|0)>=0?(eA(d)|0)!=0:0){if((e|0)!=(a[d+75>>0]|0)?(h=d+20|0,i=c[h>>2]|0,i>>>0<(c[d+16>>2]|0)>>>0):0){c[h>>2]=i+1;a[i>>0]=j}else e=LA(d,b)|0;fA(d)}else k=3;do if((k|0)==3){if((e|0)!=(a[d+75>>0]|0)?(f=d+20|0,g=c[f>>2]|0,g>>>0<(c[d+16>>2]|0)>>>0):0){c[f>>2]=g+1;a[g>>0]=j;break}e=LA(d,b)|0}while(0);return e|0}function NA(a,b){a=a|0;b=b|0;var d=0,e=0;d=l;l=l+16|0;e=d;c[e>>2]=b;b=cA(c[392]|0,a,e)|0;l=d;return b|0}function OA(a){a=a|0;return MA(a,c[392]|0)|0}function PA(b){b=b|0;var d=0,e=0,f=0,g=0;f=c[392]|0;if((c[f+76>>2]|0)>-1)g=eA(f)|0;else g=0;do if((JA(b,f)|0)<0)b=1;else{if((a[f+75>>0]|0)!=10?(d=f+20|0,e=c[d>>2]|0,e>>>0<(c[f+16>>2]|0)>>>0):0){c[d>>2]=e+1;a[e>>0]=10;b=0;break}b=(LA(f,10)|0)<0}while(0);if(g|0)fA(f);return b<<31>>31|0}function QA(a){a=a|0;Pa()}function RA(a){a=a|0;return}function SA(a,b){a=a|0;b=b|0;return 0}function TA(a){a=a|0;UA(a+4|0);return}function UA(a){a=a|0;c[a>>2]=(c[a>>2]|0)+1;return}function VA(a){a=a|0;if((WA(a+4|0)|0)==-1){rb[c[(c[a>>2]|0)+8>>2]&127](a);a=1}else a=0;return a|0}function WA(a){a=a|0;var b=0;b=c[a>>2]|0;c[a>>2]=b+-1;return b+-1|0}function XA(a){a=a|0;TA(a);return}function YA(a){a=a|0;if(VA(a)|0)ZA(a);return}function ZA(a){a=a|0;var b=0;b=a+8|0;if(!((c[b>>2]|0)!=0?(WA(b)|0)!=-1:0))rb[c[(c[a>>2]|0)+16>>2]&127](a);return}function _A(a){a=a|0;var b=0;b=(a|0)==0?1:a;while(1){a=Nz(b)|0;if(a|0)break;a=bB()|0;if(!a){a=0;break}qb[a&0]()}return a|0}function $A(a){a=a|0;return _A(a)|0}function aB(a){a=a|0;Oz(a);return}function bB(){var a=0;a=c[2163]|0;c[2163]=a+0;return a|0}function cB(){}function dB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return (A=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function eB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;d=b-d-(c>>>0>a>>>0|0)>>>0;return (A=d,a-c>>>0|0)|0}function fB(b){b=b|0;var c=0;c=a[n+(b&255)>>0]|0;if((c|0)<8)return c|0;c=a[n+(b>>8&255)>>0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>16&255)>>0]|0;if((c|0)<8)return c+16|0;return (a[n+(b>>>24)>>0]|0)+24|0}function gB(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;l=a;j=b;k=j;h=d;n=e;i=n;if(!k){g=(f|0)!=0;if(!i){if(g){c[f>>2]=(l>>>0)%(h>>>0);c[f+4>>2]=0}n=0;f=(l>>>0)/(h>>>0)>>>0;return (A=n,f)|0}else{if(!g){n=0;f=0;return (A=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;n=0;f=0;return (A=n,f)|0}}g=(i|0)==0;do if(h){if(!g){g=(S(i|0)|0)-(S(k|0)|0)|0;if(g>>>0<=31){m=g+1|0;i=31-g|0;b=g-31>>31;h=m;a=l>>>(m>>>0)&b|k<<i;b=k>>>(m>>>0)&b;g=0;i=l<<i;break}if(!f){n=0;f=0;return (A=n,f)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;n=0;f=0;return (A=n,f)|0}g=h-1|0;if(g&h|0){i=(S(h|0)|0)+33-(S(k|0)|0)|0;p=64-i|0;m=32-i|0;j=m>>31;o=i-32|0;b=o>>31;h=i;a=m-1>>31&k>>>(o>>>0)|(k<<m|l>>>(i>>>0))&b;b=b&k>>>(i>>>0);g=l<<p&j;i=(k<<p|l>>>(o>>>0))&j|l<<m&i-33>>31;break}if(f|0){c[f>>2]=g&l;c[f+4>>2]=0}if((h|0)==1){o=j|b&0;p=a|0|0;return (A=o,p)|0}else{p=fB(h|0)|0;o=k>>>(p>>>0)|0;p=k<<32-p|l>>>(p>>>0)|0;return (A=o,p)|0}}else{if(g){if(f|0){c[f>>2]=(k>>>0)%(h>>>0);c[f+4>>2]=0}o=0;p=(k>>>0)/(h>>>0)>>>0;return (A=o,p)|0}if(!l){if(f|0){c[f>>2]=0;c[f+4>>2]=(k>>>0)%(i>>>0)}o=0;p=(k>>>0)/(i>>>0)>>>0;return (A=o,p)|0}g=i-1|0;if(!(g&i)){if(f|0){c[f>>2]=a|0;c[f+4>>2]=g&k|b&0}o=0;p=k>>>((fB(i|0)|0)>>>0);return (A=o,p)|0}g=(S(i|0)|0)-(S(k|0)|0)|0;if(g>>>0<=30){b=g+1|0;i=31-g|0;h=b;a=k<<i|l>>>(b>>>0);b=k>>>(b>>>0);g=0;i=l<<i;break}if(!f){o=0;p=0;return (A=o,p)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;o=0;p=0;return (A=o,p)|0}while(0);if(!h){k=i;j=0;i=0}else{m=d|0|0;l=n|e&0;k=dB(m|0,l|0,-1,-1)|0;d=A;j=i;i=0;do{e=j;j=g>>>31|j<<1;g=i|g<<1;e=a<<1|e>>>31|0;n=a>>>31|b<<1|0;eB(k|0,d|0,e|0,n|0)|0;p=A;o=p>>31|((p|0)<0?-1:0)<<1;i=o&1;a=eB(e|0,n|0,o&m|0,(((p|0)<0?-1:0)>>31|((p|0)<0?-1:0)<<1)&l|0)|0;b=A;h=h-1|0}while((h|0)!=0);k=j;j=0}h=0;if(f|0){c[f>>2]=a;c[f+4>>2]=b}o=(g|0)>>>31|(k|h)<<1|(h<<1|g>>>31)&0|j;p=(g<<1|0>>>31)&-2|i;return (A=o,p)|0}function hB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return gB(a,b,c,d,0)|0}function iB(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=l;l=l+16|0;f=g|0;gB(a,b,d,e,f)|0;l=g;return (A=c[f+4>>2]|0,c[f>>2]|0)|0}function jB(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){A=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}A=0;return b>>>c-32|0}function kB(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){A=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}A=a<<c-32;return 0}function lB(a){a=a|0;return (a&255)<<24|(a>>8&255)<<16|(a>>16&255)<<8|a>>>24|0}function mB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;if((e|0)>=8192)return Ya(b|0,d|0,e|0)|0;h=b|0;g=b+e|0;if((b&3)==(d&3)){while(b&3){if(!e)return h|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}e=g&-4|0;f=e-64|0;while((b|0)<=(f|0)){c[b>>2]=c[d>>2];c[b+4>>2]=c[d+4>>2];c[b+8>>2]=c[d+8>>2];c[b+12>>2]=c[d+12>>2];c[b+16>>2]=c[d+16>>2];c[b+20>>2]=c[d+20>>2];c[b+24>>2]=c[d+24>>2];c[b+28>>2]=c[d+28>>2];c[b+32>>2]=c[d+32>>2];c[b+36>>2]=c[d+36>>2];c[b+40>>2]=c[d+40>>2];c[b+44>>2]=c[d+44>>2];c[b+48>>2]=c[d+48>>2];c[b+52>>2]=c[d+52>>2];c[b+56>>2]=c[d+56>>2];c[b+60>>2]=c[d+60>>2];b=b+64|0;d=d+64|0}while((b|0)<(e|0)){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0}}else{e=g-4|0;while((b|0)<(e|0)){a[b>>0]=a[d>>0]|0;a[b+1>>0]=a[d+1>>0]|0;a[b+2>>0]=a[d+2>>0]|0;a[b+3>>0]=a[d+3>>0]|0;b=b+4|0;d=d+4|0}}while((b|0)<(g|0)){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0}return h|0}function nB(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;h=b+e|0;d=d&255;if((e|0)>=67){while(b&3){a[b>>0]=d;b=b+1|0}f=h&-4|0;g=f-64|0;i=d|d<<8|d<<16|d<<24;while((b|0)<=(g|0)){c[b>>2]=i;c[b+4>>2]=i;c[b+8>>2]=i;c[b+12>>2]=i;c[b+16>>2]=i;c[b+20>>2]=i;c[b+24>>2]=i;c[b+28>>2]=i;c[b+32>>2]=i;c[b+36>>2]=i;c[b+40>>2]=i;c[b+44>>2]=i;c[b+48>>2]=i;c[b+52>>2]=i;c[b+56>>2]=i;c[b+60>>2]=i;b=b+64|0}while((b|0)<(f|0)){c[b>>2]=i;b=b+4|0}}while((b|0)<(h|0)){a[b>>0]=d;b=b+1|0}return h-e|0}function oB(a){a=+a;return a>=0.0?+B(a+.5):+O(a-.5)}function pB(a){a=a|0;var b=0,d=0;d=a+15&-16|0;b=c[i>>2]|0;a=b+d|0;if((d|0)>0&(a|0)<(b|0)|(a|0)<0){Y()|0;ya(12);return -1}c[i>>2]=a;if((a|0)>(X()|0)?(W()|0)==0:0){c[i>>2]=b;ya(12);return -1}return b|0}function qB(a,b,c){a=a|0;b=b|0;c=c|0;return +gb[a&3](b|0,c|0)}function rB(a,b){a=a|0;b=b|0;return T(hb[a&31](b|0))}function sB(a,b,c){a=a|0;b=b|0;c=c|0;return T(ib[a&3](b|0,c|0))}function tB(a){a=a|0;return jb[a&7]()|0}function uB(a,b){a=a|0;b=+b;return kb[a&1](+b)|0}function vB(a,b,c){a=a|0;b=+b;c=+c;return lb[a&1](+b,+c)|0}function wB(a,b,c){a=a|0;b=+b;c=c|0;return mb[a&1](+b,c|0)|0}function xB(a,b){a=a|0;b=b|0;return nb[a&31](b|0)|0}function yB(a,b,c){a=a|0;b=b|0;c=c|0;return ob[a&7](b|0,c|0)|0}function zB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return pb[a&7](b|0,c|0,d|0)|0}function AB(a){a=a|0;qb[a&0]()}function BB(a,b){a=a|0;b=b|0;rb[a&127](b|0)}function CB(a,b,c){a=a|0;b=b|0;c=+c;sb[a&1](b|0,+c)}function DB(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;tb[a&1](b|0,+c,+d)}function EB(a,b,c,d){a=a|0;b=b|0;c=+c;d=d|0;ub[a&1](b|0,+c,d|0)}function FB(a,b,c){a=a|0;b=b|0;c=T(c);vb[a&15](b|0,T(c))}function GB(a,b,c,d){a=a|0;b=b|0;c=T(c);d=T(d);wb[a&1](b|0,T(c),T(d))}function HB(a,b,c,d,e){a=a|0;b=b|0;c=T(c);d=T(d);e=T(e);xb[a&1](b|0,T(c),T(d),T(e))}function IB(a,b,c){a=a|0;b=b|0;c=c|0;yb[a&63](b|0,c|0)}function JB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=+d;zb[a&3](b|0,c|0,+d)}function KB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=+d;e=+e;Ab[a&1](b|0,c|0,+d,+e)}function LB(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=+d;e=+e;f=+f;Bb[a&1](b|0,c|0,+d,+e,+f)}function MB(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Cb[a&15](b|0,c|0,d|0)}function NB(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Db[a&7](b|0,c|0,d|0,e|0)}function OB(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;Eb[a&1](b|0,c|0,d|0,e|0,f|0)}function PB(a,b,c,d,e,f,g){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;Fb[a&1](b|0,c|0,d|0,e|0,f|0,g|0)}function QB(a,b){a=a|0;b=b|0;U(0);return 0.0}function RB(a){a=a|0;U(1);return fb}function SB(a,b){a=a|0;b=b|0;U(2);return fb}function TB(){U(3);return 0}function UB(a){a=+a;U(4);return 0}function VB(a,b){a=+a;b=+b;U(5);return 0}function WB(a,b){a=+a;b=b|0;U(6);return 0}function XB(a){a=a|0;U(7);return 0}function YB(a,b){a=a|0;b=b|0;U(8);return 0}function ZB(a,b,c){a=a|0;b=b|0;c=c|0;U(9);return 0}function _B(){U(10)}function $B(a){a=a|0;U(11)}function aC(a,b){a=a|0;b=+b;U(12)}function bC(a,b,c){a=a|0;b=+b;c=+c;U(13)}function cC(a,b,c){a=a|0;b=+b;c=c|0;U(14)}function dC(a,b){a=a|0;b=T(b);U(15)}function eC(a,b,c){a=a|0;b=T(b);c=T(c);U(16)}function fC(a,b,c,d){a=a|0;b=T(b);c=T(c);d=T(d);U(17)}function gC(a,b){a=a|0;b=b|0;U(18)}function hC(a,b,c){a=a|0;b=b|0;c=+c;U(19)}function iC(a,b,c,d){a=a|0;b=b|0;c=+c;d=+d;U(20)}function jC(a,b,c,d,e){a=a|0;b=b|0;c=+c;d=+d;e=+e;U(21)}function kC(a,b,c){a=a|0;b=b|0;c=c|0;U(22)}function lC(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;U(23)}function mC(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;U(24)}function nC(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;U(25)}

// EMSCRIPTEN_END_FUNCS
var gb=[QB,ig,$h,on];var hb=[RB,ze,Be,zg,mj,oj,_j,ak,ck,ek,gk,ik,zk,Ak,Bk,Ck,Dk,Ek,Fk,Gk,Hk,Ik,Jk,Kk,RB,RB,RB,RB,RB,RB,RB,RB];var ib=[SB,Tq,nr,SB];var jb=[TB,ef,Rg,gp,Zy,TB,TB,TB];var kb=[UB,fh];var lb=[VB,xf];var mb=[WB,rh];var nb=[XB,Mp,Pq,Tz,Cg,Yi,_i,aj,cj,ej,gj,lk,ok,uk,wk,cl,zw,Bw,XB,XB,XB,XB,XB,XB,XB,XB,XB,XB,XB,XB,XB,XB];var ob=[YB,SA,Ki,Rl,Dm,ao,Ro,yx];var pb=[ZB,$z,Vz,jt,Qx,Uz,ZB,ZB];var qb=[_B];var rb=[$B,RA,mf,nf,of,Wg,Xg,Yg,lp,mp,np,Kp,Lp,Op,Pp,Nq,Oq,Rq,Sq,Uu,Vu,Wu,az,bz,cz,el,Ge,$e,df,uf,Pf,gg,Og,Qg,ch,oh,Ih,Zh,qi,Ii,yl,Pl,gm,Bm,Wm,mn,Fn,_n,uo,Po,dp,fp,xp,Bq,yr,Ur,ls,Ms,ht,Bt,Yt,Ie,rw,cx,ux,Mx,oy,Gy,Sy,Vy,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B,$B];var sb=[aC,eh];var tb=[bC,wf];var ub=[cC,qh];var vb=[dC,Ae,Ce,Ag,nj,pj,$j,bk,dk,fk,hk,jk,dC,dC,dC,dC];var wb=[eC,Sk];var xb=[fC,Vk];var yb=[gC,Np,Qq,Dg,Zi,$i,bj,dj,fj,hj,jj,kj,qj,rj,sj,tj,uj,vj,wj,xj,yj,zj,Aj,Bj,Cj,Dj,Ej,Fj,Gj,Hj,Ij,Jj,Kj,Lj,Mj,Nj,Oj,Pj,Qj,Rj,Sj,Tj,Uj,Vj,Wj,Xj,Yj,Zj,mk,pk,qk,rk,sk,tk,vk,xk,Nk,Pk,Xk,_k,Dt,uw,eu,Rw];var zb=[hC,Rf,Kh,Ym];var Ab=[iC,Ar];var Bb=[jC,Wr];var Cb=[kC,Qp,Zk,al,si,sq,Al,im,Hn,wo,zp,Dq,ns,Nv,gx,Ky];var Db=[lC,Pe,Kg,ll,Os,bu,Gw,iz];var Eb=[mC,kv];var Fb=[nC,sy];return{__GLOBAL__sub_I_Binding_cc:iw,__GLOBAL__sub_I_binding_cpp:Ot,__GLOBAL__sub_I_common_cc:Pt,___udivdi3:hB,___uremdi3:iB,_bitshift64Lshr:jB,_bitshift64Shl:kB,_emscripten_get_global_libc:Sz,_free:Oz,_i64Add:dB,_i64Subtract:eB,_llvm_bswap_i32:lB,_malloc:Nz,_memcpy:mB,_memset:nB,_nbind_init:xz,_roundf:oB,_sbrk:pB,dynCall_dii:qB,dynCall_fi:rB,dynCall_fii:sB,dynCall_i:tB,dynCall_id:uB,dynCall_idd:vB,dynCall_idi:wB,dynCall_ii:xB,dynCall_iii:yB,dynCall_iiii:zB,dynCall_v:AB,dynCall_vi:BB,dynCall_vid:CB,dynCall_vidd:DB,dynCall_vidi:EB,dynCall_vif:FB,dynCall_viff:GB,dynCall_vifff:HB,dynCall_vii:IB,dynCall_viid:JB,dynCall_viidd:KB,dynCall_viiddd:LB,dynCall_viii:MB,dynCall_viiii:NB,dynCall_viiiii:OB,dynCall_viiiiii:PB,establishStackSpace:Jb,getTempRet0:Mb,runPostSets:cB,setTempRet0:Lb,setThrew:Kb,stackAlloc:Gb,stackRestore:Ib,stackSave:Hb}})


// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg,Module.asmLibraryArg,buffer);var __GLOBAL__sub_I_Binding_cc=Module["__GLOBAL__sub_I_Binding_cc"]=asm["__GLOBAL__sub_I_Binding_cc"];var __GLOBAL__sub_I_binding_cpp=Module["__GLOBAL__sub_I_binding_cpp"]=asm["__GLOBAL__sub_I_binding_cpp"];var __GLOBAL__sub_I_common_cc=Module["__GLOBAL__sub_I_common_cc"]=asm["__GLOBAL__sub_I_common_cc"];var ___udivdi3=Module["___udivdi3"]=asm["___udivdi3"];var ___uremdi3=Module["___uremdi3"]=asm["___uremdi3"];var _bitshift64Lshr=Module["_bitshift64Lshr"]=asm["_bitshift64Lshr"];var _bitshift64Shl=Module["_bitshift64Shl"]=asm["_bitshift64Shl"];var _emscripten_get_global_libc=Module["_emscripten_get_global_libc"]=asm["_emscripten_get_global_libc"];var _free=Module["_free"]=asm["_free"];var _i64Add=Module["_i64Add"]=asm["_i64Add"];var _i64Subtract=Module["_i64Subtract"]=asm["_i64Subtract"];var _llvm_bswap_i32=Module["_llvm_bswap_i32"]=asm["_llvm_bswap_i32"];var _malloc=Module["_malloc"]=asm["_malloc"];var _memcpy=Module["_memcpy"]=asm["_memcpy"];var _memset=Module["_memset"]=asm["_memset"];var _nbind_init=Module["_nbind_init"]=asm["_nbind_init"];var _roundf=Module["_roundf"]=asm["_roundf"];var _sbrk=Module["_sbrk"]=asm["_sbrk"];var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];var getTempRet0=Module["getTempRet0"]=asm["getTempRet0"];var runPostSets=Module["runPostSets"]=asm["runPostSets"];var setTempRet0=Module["setTempRet0"]=asm["setTempRet0"];var setThrew=Module["setThrew"]=asm["setThrew"];var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];var stackRestore=Module["stackRestore"]=asm["stackRestore"];var stackSave=Module["stackSave"]=asm["stackSave"];var dynCall_dii=Module["dynCall_dii"]=asm["dynCall_dii"];var dynCall_fi=Module["dynCall_fi"]=asm["dynCall_fi"];var dynCall_fii=Module["dynCall_fii"]=asm["dynCall_fii"];var dynCall_i=Module["dynCall_i"]=asm["dynCall_i"];var dynCall_id=Module["dynCall_id"]=asm["dynCall_id"];var dynCall_idd=Module["dynCall_idd"]=asm["dynCall_idd"];var dynCall_idi=Module["dynCall_idi"]=asm["dynCall_idi"];var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];var dynCall_vid=Module["dynCall_vid"]=asm["dynCall_vid"];var dynCall_vidd=Module["dynCall_vidd"]=asm["dynCall_vidd"];var dynCall_vidi=Module["dynCall_vidi"]=asm["dynCall_vidi"];var dynCall_vif=Module["dynCall_vif"]=asm["dynCall_vif"];var dynCall_viff=Module["dynCall_viff"]=asm["dynCall_viff"];var dynCall_vifff=Module["dynCall_vifff"]=asm["dynCall_vifff"];var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];var dynCall_viid=Module["dynCall_viid"]=asm["dynCall_viid"];var dynCall_viidd=Module["dynCall_viidd"]=asm["dynCall_viidd"];var dynCall_viiddd=Module["dynCall_viiddd"]=asm["dynCall_viiddd"];var dynCall_viii=Module["dynCall_viii"]=asm["dynCall_viii"];var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];var dynCall_viiiii=Module["dynCall_viiiii"]=asm["dynCall_viiiii"];var dynCall_viiiiii=Module["dynCall_viiiiii"]=asm["dynCall_viiiiii"];Runtime.stackAlloc=Module["stackAlloc"];Runtime.stackSave=Module["stackSave"];Runtime.stackRestore=Module["stackRestore"];Runtime.establishStackSpace=Module["establishStackSpace"];Runtime.setTempRet0=Module["setTempRet0"];Runtime.getTempRet0=Module["getTempRet0"];Module["asm"]=asm;if(memoryInitializer){if(typeof Module["locateFile"]==="function"){memoryInitializer=Module["locateFile"](memoryInitializer)}else if(Module["memoryInitializerPrefixURL"]){memoryInitializer=Module["memoryInitializerPrefixURL"]+memoryInitializer}if(ENVIRONMENT_IS_NODE||ENVIRONMENT_IS_SHELL){var data=Module["readBinary"](memoryInitializer);HEAPU8.set(data,Runtime.GLOBAL_BASE)}else{addRunDependency("memory initializer");var applyMemoryInitializer=(function(data){if(data.byteLength)data=new Uint8Array(data);HEAPU8.set(data,Runtime.GLOBAL_BASE);if(Module["memoryInitializerRequest"])delete Module["memoryInitializerRequest"].response;removeRunDependency("memory initializer")});function doBrowserLoad(){Module["readAsync"](memoryInitializer,applyMemoryInitializer,(function(){throw"could not load memory initializer "+memoryInitializer}))}var memoryInitializerBytes=tryParseAsDataURI(memoryInitializer);if(memoryInitializerBytes){applyMemoryInitializer(memoryInitializerBytes.buffer)}else if(Module["memoryInitializerRequest"]){function useRequest(){var request=Module["memoryInitializerRequest"];var response=request.response;if(request.status!==200&&request.status!==0){var data=tryParseAsDataURI(Module["memoryInitializerRequestURL"]);if(data){response=data.buffer}else{console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: "+request.status+", retrying "+memoryInitializer);doBrowserLoad();return}}applyMemoryInitializer(response)}if(Module["memoryInitializerRequest"].response){setTimeout(useRequest,0)}else{Module["memoryInitializerRequest"].addEventListener("load",useRequest)}}else{doBrowserLoad()}}}function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var initialStackTop;var preloadStartTime=null;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};function run(args){args=args||Module["arguments"];if(preloadStartTime===null)preloadStartTime=Date.now();if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout((function(){setTimeout((function(){Module["setStatus"]("")}),1);doRun()}),1)}else{doRun()}}Module["run"]=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;STACKTOP=initialStackTop;exitRuntime();if(Module["onExit"])Module["onExit"](status)}if(ENVIRONMENT_IS_NODE){process["exit"](status)}Module["quit"](status,new ExitStatus(status))}Module["exit"]=exit;var abortDecorators=[];function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){Module.print(what);Module.printErr(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;var extra="\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.";var output="abort("+what+") at "+stackTrace()+extra;if(abortDecorators){abortDecorators.forEach((function(decorator){output=decorator(output,what)}))}throw output}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}run()}))





/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0), __webpack_require__(11).setImmediate, __webpack_require__(5).Buffer))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var nbind = __webpack_require__(2);

var ran = false;
var ret = null;

nbind({}, function (err, result) {

    if (ran)
        return;

    ran = true;

    if (err)
        throw err;

    ret = result;

});

if (!ran)
    throw new Error('Failed to load the yoga module - it needed to be loaded synchronously, but didn\'t');

var FlexDirection = {
    Horizontal: 0,
    Vertical: 1,
    HorizontalReverse: 2,
    VerticalReverse: 3,
};

var FlexWrapMode = {
    NoWrap: 0,
    Wrap: 1,
    WrapReverse: 2,
};

var FlexAlign = {
    Inherit: 0,
    Stretch: 1,
    Start: 2,
    Center: 3,
    End: 4,
    SpaceBetween: 5,
    SpaceAround: 6,
    Baseline: 7,
};

var FlexLengthType = {
    LengthTypeUndefined: 0,
    LengthTypePoint: 1,
    LengthTypePercent: 2,
    LengthTypeAuto: 3,
    LengthTypeContent: 4,
};

module.exports = Object.assign(ret.lib, {
    Undefined: NaN,
}, FlexDirection, FlexWrapMode, FlexAlign, FlexLengthType);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(4)
var ieee754 = __webpack_require__(6)
var isArray = __webpack_require__(7)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 8 */
/***/ (function(module, exports) {



/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(0)))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(10);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ })
/******/ ]);
});