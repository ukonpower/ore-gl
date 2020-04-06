var DracoDecoderModule = function ( DracoDecoderModule ) {

	DracoDecoderModule = DracoDecoderModule || {};

	var Module = typeof DracoDecoderModule !== "undefined" ? DracoDecoderModule : {}; var isRuntimeInitialized = false; var isModuleParsed = false; Module[ "onRuntimeInitialized" ] = ( function () {

		isRuntimeInitialized = true; if ( isModuleParsed ) {

			if ( typeof Module[ "onModuleLoaded" ] === "function" ) {

				Module[ "onModuleLoaded" ]( Module );

			}

		}

	} ); Module[ "onModuleParsed" ] = ( function () {

		isModuleParsed = true; if ( isRuntimeInitialized ) {

			if ( typeof Module[ "onModuleLoaded" ] === "function" ) {

				Module[ "onModuleLoaded" ]( Module );

			}

		}

	} ); function isVersionSupported( versionString ) {

		if ( typeof versionString !== "string" ) return false; const version = versionString.split( "." ); if ( version.length < 2 || version.length > 3 ) return false; if ( version[ 0 ] == 1 && version[ 1 ] >= 0 && version[ 1 ] <= 3 ) return true; if ( version[ 0 ] != 0 || version[ 1 ] > 10 ) return false; return true;

	}Module[ "isVersionSupported" ] = isVersionSupported; var moduleOverrides = {}; var key; for ( key in Module ) {

		if ( Module.hasOwnProperty( key ) ) {

			moduleOverrides[ key ] = Module[ key ];

		}

	}Module[ "arguments" ] = []; Module[ "thisProgram" ] = "./this.program"; Module[ "quit" ] = ( function ( status, toThrow ) {

		throw toThrow;

	} ); Module[ "preRun" ] = []; Module[ "postRun" ] = []; var ENVIRONMENT_IS_WEB = false; var ENVIRONMENT_IS_WORKER = false; var ENVIRONMENT_IS_NODE = false; var ENVIRONMENT_IS_SHELL = false; if ( Module[ "ENVIRONMENT" ] ) {

		if ( Module[ "ENVIRONMENT" ] === "WEB" ) {

			ENVIRONMENT_IS_WEB = true;

		} else if ( Module[ "ENVIRONMENT" ] === "WORKER" ) {

			ENVIRONMENT_IS_WORKER = true;

		} else if ( Module[ "ENVIRONMENT" ] === "NODE" ) {

			ENVIRONMENT_IS_NODE = true;

		} else if ( Module[ "ENVIRONMENT" ] === "SHELL" ) {

			ENVIRONMENT_IS_SHELL = true;

		} else {

			throw new Error( "Module['ENVIRONMENT'] value is not valid. must be one of: WEB|WORKER|NODE|SHELL." );

		}

	} else {

		ENVIRONMENT_IS_WEB = typeof window === "object"; ENVIRONMENT_IS_WORKER = typeof importScripts === "function"; ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && ! ENVIRONMENT_IS_WEB && ! ENVIRONMENT_IS_WORKER; ENVIRONMENT_IS_SHELL = ! ENVIRONMENT_IS_WEB && ! ENVIRONMENT_IS_NODE && ! ENVIRONMENT_IS_WORKER;

	} if ( ENVIRONMENT_IS_NODE ) {

		var nodeFS; var nodePath; Module[ "read" ] = function shell_read( filename, binary ) {

			var ret; ret = tryParseAsDataURI( filename ); if ( ! ret ) {

				if ( ! nodeFS )nodeFS = require( "fs" ); if ( ! nodePath )nodePath = require( "path" ); filename = nodePath[ "normalize" ]( filename ); ret = nodeFS[ "readFileSync" ]( filename );

			} return binary ? ret : ret.toString();

		}; Module[ "readBinary" ] = function readBinary( filename ) {

			var ret = Module[ "read" ]( filename, true ); if ( ! ret.buffer ) {

				ret = new Uint8Array( ret );

			}assert( ret.buffer ); return ret;

		}; if ( process[ "argv" ].length > 1 ) {

			Module[ "thisProgram" ] = process[ "argv" ][ 1 ].replace( /\\/g, "/" );

		}Module[ "arguments" ] = process[ "argv" ].slice( 2 ); process[ "on" ]( "uncaughtException", ( function ( ex ) {

			if ( ! ( ex instanceof ExitStatus ) ) {

				throw ex;

			}

		} ) ); process[ "on" ]( "unhandledRejection", ( function ( reason, p ) {

			process[ "exit" ]( 1 );

		} ) ); Module[ "inspect" ] = ( function () {

			return "[Emscripten Module object]";

		} );

	} else if ( ENVIRONMENT_IS_SHELL ) {

		if ( typeof read != "undefined" ) {

			Module[ "read" ] = function shell_read( f ) {

				var data = tryParseAsDataURI( f ); if ( data ) {

					return intArrayToString( data );

				} return read( f );

			};

		}Module[ "readBinary" ] = function readBinary( f ) {

			var data; data = tryParseAsDataURI( f ); if ( data ) {

				return data;

			} if ( typeof readbuffer === "function" ) {

				return new Uint8Array( readbuffer( f ) );

			}data = read( f, "binary" ); assert( typeof data === "object" ); return data;

		}; if ( typeof scriptArgs != "undefined" ) {

			Module[ "arguments" ] = scriptArgs;

		} else if ( typeof arguments != "undefined" ) {

			Module[ "arguments" ] = arguments;

		} if ( typeof quit === "function" ) {

			Module[ "quit" ] = ( function ( status, toThrow ) {

				quit( status );

			} );

		}

	} else if ( ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER ) {

		Module[ "read" ] = function shell_read( url ) {

			try {

				var xhr = new XMLHttpRequest(); xhr.open( "GET", url, false ); xhr.send( null ); return xhr.responseText;

			} catch ( err ) {

				var data = tryParseAsDataURI( url ); if ( data ) {

					return intArrayToString( data );

				} throw err;

			}

		}; if ( ENVIRONMENT_IS_WORKER ) {

			Module[ "readBinary" ] = function readBinary( url ) {

				try {

					var xhr = new XMLHttpRequest(); xhr.open( "GET", url, false ); xhr.responseType = "arraybuffer"; xhr.send( null ); return new Uint8Array( xhr.response );

				} catch ( err ) {

					var data = tryParseAsDataURI( url ); if ( data ) {

						return data;

					} throw err;

				}

			};

		}Module[ "readAsync" ] = function readAsync( url, onload, onerror ) {

			var xhr = new XMLHttpRequest(); xhr.open( "GET", url, true ); xhr.responseType = "arraybuffer"; xhr.onload = function xhr_onload() {

				if ( xhr.status == 200 || xhr.status == 0 && xhr.response ) {

					onload( xhr.response ); return;

				} var data = tryParseAsDataURI( url ); if ( data ) {

					onload( data.buffer ); return;

				}onerror();

			}; xhr.onerror = onerror; xhr.send( null );

		}; Module[ "setWindowTitle" ] = ( function ( title ) {

			document.title = title;

		} );

	}Module[ "print" ] = typeof console !== "undefined" ? console.log.bind( console ) : typeof print !== "undefined" ? print : null; Module[ "printErr" ] = typeof printErr !== "undefined" ? printErr : typeof console !== "undefined" && console.warn.bind( console ) || Module[ "print" ]; Module.print = Module[ "print" ]; Module.printErr = Module[ "printErr" ]; for ( key in moduleOverrides ) {

		if ( moduleOverrides.hasOwnProperty( key ) ) {

			Module[ key ] = moduleOverrides[ key ];

		}

	}moduleOverrides = undefined; var STACK_ALIGN = 16; function staticAlloc( size ) {

		assert( ! staticSealed ); var ret = STATICTOP; STATICTOP = STATICTOP + size + 15 & - 16; return ret;

	} function dynamicAlloc( size ) {

		assert( DYNAMICTOP_PTR ); var ret = HEAP32[ DYNAMICTOP_PTR >> 2 ]; var end = ret + size + 15 & - 16; HEAP32[ DYNAMICTOP_PTR >> 2 ] = end; if ( end >= TOTAL_MEMORY ) {

			var success = enlargeMemory(); if ( ! success ) {

				HEAP32[ DYNAMICTOP_PTR >> 2 ] = ret; return 0;

			}

		} return ret;

	} function alignMemory( size, factor ) {

		if ( ! factor )factor = STACK_ALIGN; var ret = size = Math.ceil( size / factor ) * factor; return ret;

	} function getNativeTypeSize( type ) {

		switch ( type ) {

			case "i1":case "i8":return 1; case "i16":return 2; case "i32":return 4; case "i64":return 8; case "float":return 4; case "double":return 8; default: {

				if ( type[ type.length - 1 ] === "*" ) {

					return 4;

				} else if ( type[ 0 ] === "i" ) {

					var bits = parseInt( type.substr( 1 ) ); assert( bits % 8 === 0 ); return bits / 8;

				} else {

					return 0;

				}

			}

		}

	} function warnOnce( text ) {

		if ( ! warnOnce.shown )warnOnce.shown = {}; if ( ! warnOnce.shown[ text ] ) {

			warnOnce.shown[ text ] = 1; Module.printErr( text );

		}

	} var jsCallStartIndex = 1; var functionPointers = new Array( 0 ); var funcWrappers = {}; function dynCall( sig, ptr, args ) {

		if ( args && args.length ) {

			return Module[ "dynCall_" + sig ].apply( null, [ ptr ].concat( args ) );

		} else {

			return Module[ "dynCall_" + sig ].call( null, ptr );

		}

	} var GLOBAL_BASE = 8; var ABORT = 0; var EXITSTATUS = 0; function assert( condition, text ) {

		if ( ! condition ) {

			abort( "Assertion failed: " + text );

		}

	} function getCFunc( ident ) {

		var func = Module[ "_" + ident ]; assert( func, "Cannot call unknown function " + ident + ", make sure it is exported" ); return func;

	} var JSfuncs = { "stackSave": ( function () {

		stackSave();

	} ), "stackRestore": ( function () {

		stackRestore();

	} ), "arrayToC": ( function ( arr ) {

		var ret = stackAlloc( arr.length ); writeArrayToMemory( arr, ret ); return ret;

	} ), "stringToC": ( function ( str ) {

		var ret = 0; if ( str !== null && str !== undefined && str !== 0 ) {

			var len = ( str.length << 2 ) + 1; ret = stackAlloc( len ); stringToUTF8( str, ret, len );

		} return ret;

	} ) }; var toC = { "string": JSfuncs[ "stringToC" ], "array": JSfuncs[ "arrayToC" ] }; function ccall( ident, returnType, argTypes, args, opts ) {

		var func = getCFunc( ident ); var cArgs = []; var stack = 0; if ( args ) {

			for ( var i = 0; i < args.length; i ++ ) {

				var converter = toC[ argTypes[ i ] ]; if ( converter ) {

					if ( stack === 0 )stack = stackSave(); cArgs[ i ] = converter( args[ i ] );

				} else {

					cArgs[ i ] = args[ i ];

				}

			}

		} var ret = func.apply( null, cArgs ); if ( returnType === "string" )ret = Pointer_stringify( ret ); if ( returnType === "boolean" )ret = Boolean( ret ); if ( stack !== 0 ) {

			stackRestore( stack );

		} return ret;

	} function setValue( ptr, value, type, noSafe ) {

		type = type || "i8"; if ( type.charAt( type.length - 1 ) === "*" )type = "i32"; switch ( type ) {

			case "i1":HEAP8[ ptr >> 0 ] = value; break; case "i8":HEAP8[ ptr >> 0 ] = value; break; case "i16":HEAP16[ ptr >> 1 ] = value; break; case "i32":HEAP32[ ptr >> 2 ] = value; break; case "i64":tempI64 = [ value >>> 0, ( tempDouble = value, + Math_abs( tempDouble ) >= + 1 ? tempDouble > + 0 ? ( Math_min( + Math_floor( tempDouble / + 4294967296 ), + 4294967295 ) | 0 ) >>> 0 : ~ ~ + Math_ceil( ( tempDouble - + ( ~ ~ tempDouble >>> 0 ) ) / + 4294967296 ) >>> 0 : 0 ) ], HEAP32[ ptr >> 2 ] = tempI64[ 0 ], HEAP32[ ptr + 4 >> 2 ] = tempI64[ 1 ]; break; case "float":HEAPF32[ ptr >> 2 ] = value; break; case "double":HEAPF64[ ptr >> 3 ] = value; break; default:abort( "invalid type for setValue: " + type );

		}

	} var ALLOC_STATIC = 2; var ALLOC_NONE = 4; function allocate( slab, types, allocator, ptr ) {

		var zeroinit, size; if ( typeof slab === "number" ) {

			zeroinit = true; size = slab;

		} else {

			zeroinit = false; size = slab.length;

		} var singleType = typeof types === "string" ? types : null; var ret; if ( allocator == ALLOC_NONE ) {

			ret = ptr;

		} else {

			ret = [ typeof _malloc === "function" ? _malloc : staticAlloc, stackAlloc, staticAlloc, dynamicAlloc ][ allocator === undefined ? ALLOC_STATIC : allocator ]( Math.max( size, singleType ? 1 : types.length ) );

		} if ( zeroinit ) {

			var stop; ptr = ret; assert( ( ret & 3 ) == 0 ); stop = ret + ( size & ~ 3 ); for ( ;ptr < stop; ptr += 4 ) {

				HEAP32[ ptr >> 2 ] = 0;

			}stop = ret + size; while ( ptr < stop ) {

				HEAP8[ ptr ++ >> 0 ] = 0;

			} return ret;

		} if ( singleType === "i8" ) {

			if ( slab.subarray || slab.slice ) {

				HEAPU8.set( slab, ret );

			} else {

				HEAPU8.set( new Uint8Array( slab ), ret );

			} return ret;

		} var i = 0, type, typeSize, previousType; while ( i < size ) {

			var curr = slab[ i ]; type = singleType || types[ i ]; if ( type === 0 ) {

				i ++; continue;

			} if ( type == "i64" )type = "i32"; setValue( ret + i, curr, type ); if ( previousType !== type ) {

				typeSize = getNativeTypeSize( type ); previousType = type;

			}i += typeSize;

		} return ret;

	} function Pointer_stringify( ptr, length ) {

		if ( length === 0 || ! ptr ) return ""; var hasUtf = 0; var t; var i = 0; while ( 1 ) {

			t = HEAPU8[ ptr + i >> 0 ]; hasUtf |= t; if ( t == 0 && ! length ) break; i ++; if ( length && i == length ) break;

		} if ( ! length )length = i; var ret = ""; if ( hasUtf < 128 ) {

			var MAX_CHUNK = 1024; var curr; while ( length > 0 ) {

				curr = String.fromCharCode.apply( String, HEAPU8.subarray( ptr, ptr + Math.min( length, MAX_CHUNK ) ) ); ret = ret ? ret + curr : curr; ptr += MAX_CHUNK; length -= MAX_CHUNK;

			} return ret;

		} return UTF8ToString( ptr );

	} var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder( "utf8" ) : undefined; function UTF8ArrayToString( u8Array, idx ) {

		var endPtr = idx; while ( u8Array[ endPtr ] )++ endPtr; if ( endPtr - idx > 16 && u8Array.subarray && UTF8Decoder ) {

			return UTF8Decoder.decode( u8Array.subarray( idx, endPtr ) );

		} else {

			var u0, u1, u2, u3, u4, u5; var str = ""; while ( 1 ) {

				u0 = u8Array[ idx ++ ]; if ( ! u0 ) return str; if ( ! ( u0 & 128 ) ) {

					str += String.fromCharCode( u0 ); continue;

				}u1 = u8Array[ idx ++ ] & 63; if ( ( u0 & 224 ) == 192 ) {

					str += String.fromCharCode( ( u0 & 31 ) << 6 | u1 ); continue;

				}u2 = u8Array[ idx ++ ] & 63; if ( ( u0 & 240 ) == 224 ) {

					u0 = ( u0 & 15 ) << 12 | u1 << 6 | u2;

				} else {

					u3 = u8Array[ idx ++ ] & 63; if ( ( u0 & 248 ) == 240 ) {

						u0 = ( u0 & 7 ) << 18 | u1 << 12 | u2 << 6 | u3;

					} else {

						u4 = u8Array[ idx ++ ] & 63; if ( ( u0 & 252 ) == 248 ) {

							u0 = ( u0 & 3 ) << 24 | u1 << 18 | u2 << 12 | u3 << 6 | u4;

						} else {

							u5 = u8Array[ idx ++ ] & 63; u0 = ( u0 & 1 ) << 30 | u1 << 24 | u2 << 18 | u3 << 12 | u4 << 6 | u5;

						}

					}

				} if ( u0 < 65536 ) {

					str += String.fromCharCode( u0 );

				} else {

					var ch = u0 - 65536; str += String.fromCharCode( 55296 | ch >> 10, 56320 | ch & 1023 );

				}

			}

		}

	} function UTF8ToString( ptr ) {

		return UTF8ArrayToString( HEAPU8, ptr );

	} function stringToUTF8Array( str, outU8Array, outIdx, maxBytesToWrite ) {

		if ( ! ( maxBytesToWrite > 0 ) ) return 0; var startIdx = outIdx; var endIdx = outIdx + maxBytesToWrite - 1; for ( var i = 0; i < str.length; ++ i ) {

			var u = str.charCodeAt( i ); if ( u >= 55296 && u <= 57343 )u = 65536 + ( ( u & 1023 ) << 10 ) | str.charCodeAt( ++ i ) & 1023; if ( u <= 127 ) {

				if ( outIdx >= endIdx ) break; outU8Array[ outIdx ++ ] = u;

			} else if ( u <= 2047 ) {

				if ( outIdx + 1 >= endIdx ) break; outU8Array[ outIdx ++ ] = 192 | u >> 6; outU8Array[ outIdx ++ ] = 128 | u & 63;

			} else if ( u <= 65535 ) {

				if ( outIdx + 2 >= endIdx ) break; outU8Array[ outIdx ++ ] = 224 | u >> 12; outU8Array[ outIdx ++ ] = 128 | u >> 6 & 63; outU8Array[ outIdx ++ ] = 128 | u & 63;

			} else if ( u <= 2097151 ) {

				if ( outIdx + 3 >= endIdx ) break; outU8Array[ outIdx ++ ] = 240 | u >> 18; outU8Array[ outIdx ++ ] = 128 | u >> 12 & 63; outU8Array[ outIdx ++ ] = 128 | u >> 6 & 63; outU8Array[ outIdx ++ ] = 128 | u & 63;

			} else if ( u <= 67108863 ) {

				if ( outIdx + 4 >= endIdx ) break; outU8Array[ outIdx ++ ] = 248 | u >> 24; outU8Array[ outIdx ++ ] = 128 | u >> 18 & 63; outU8Array[ outIdx ++ ] = 128 | u >> 12 & 63; outU8Array[ outIdx ++ ] = 128 | u >> 6 & 63; outU8Array[ outIdx ++ ] = 128 | u & 63;

			} else {

				if ( outIdx + 5 >= endIdx ) break; outU8Array[ outIdx ++ ] = 252 | u >> 30; outU8Array[ outIdx ++ ] = 128 | u >> 24 & 63; outU8Array[ outIdx ++ ] = 128 | u >> 18 & 63; outU8Array[ outIdx ++ ] = 128 | u >> 12 & 63; outU8Array[ outIdx ++ ] = 128 | u >> 6 & 63; outU8Array[ outIdx ++ ] = 128 | u & 63;

			}

		}outU8Array[ outIdx ] = 0; return outIdx - startIdx;

	} function stringToUTF8( str, outPtr, maxBytesToWrite ) {

		return stringToUTF8Array( str, HEAPU8, outPtr, maxBytesToWrite );

	} function lengthBytesUTF8( str ) {

		var len = 0; for ( var i = 0; i < str.length; ++ i ) {

			var u = str.charCodeAt( i ); if ( u >= 55296 && u <= 57343 )u = 65536 + ( ( u & 1023 ) << 10 ) | str.charCodeAt( ++ i ) & 1023; if ( u <= 127 ) {

				++ len;

			} else if ( u <= 2047 ) {

				len += 2;

			} else if ( u <= 65535 ) {

				len += 3;

			} else if ( u <= 2097151 ) {

				len += 4;

			} else if ( u <= 67108863 ) {

				len += 5;

			} else {

				len += 6;

			}

		} return len;

	} var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder( "utf-16le" ) : undefined; function demangle( func ) {

		return func;

	} function demangleAll( text ) {

		var regex = /__Z[\w\d_]+/g; return text.replace( regex, ( function ( x ) {

			var y = demangle( x ); return x === y ? x : x + " [" + y + "]";

		} ) );

	} function jsStackTrace() {

		var err = new Error(); if ( ! err.stack ) {

			try {

				throw new Error( 0 );

			} catch ( e ) {

				err = e;

			} if ( ! err.stack ) {

				return "(no stack trace available)";

			}

		} return err.stack.toString();

	} var WASM_PAGE_SIZE = 65536; var ASMJS_PAGE_SIZE = 16777216; var MIN_TOTAL_MEMORY = 16777216; function alignUp( x, multiple ) {

		if ( x % multiple > 0 ) {

			x += multiple - x % multiple;

		} return x;

	} var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64; function updateGlobalBuffer( buf ) {

		Module[ "buffer" ] = buffer = buf;

	} function updateGlobalBufferViews() {

		Module[ "HEAP8" ] = HEAP8 = new Int8Array( buffer ); Module[ "HEAP16" ] = HEAP16 = new Int16Array( buffer ); Module[ "HEAP32" ] = HEAP32 = new Int32Array( buffer ); Module[ "HEAPU8" ] = HEAPU8 = new Uint8Array( buffer ); Module[ "HEAPU16" ] = HEAPU16 = new Uint16Array( buffer ); Module[ "HEAPU32" ] = HEAPU32 = new Uint32Array( buffer ); Module[ "HEAPF32" ] = HEAPF32 = new Float32Array( buffer ); Module[ "HEAPF64" ] = HEAPF64 = new Float64Array( buffer );

	} var STATIC_BASE, STATICTOP, staticSealed; var STACK_BASE, STACKTOP, STACK_MAX; var DYNAMIC_BASE, DYNAMICTOP_PTR; STATIC_BASE = STATICTOP = STACK_BASE = STACKTOP = STACK_MAX = DYNAMIC_BASE = DYNAMICTOP_PTR = 0; staticSealed = false; function abortOnCannotGrowMemory() {

		abort( "Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or (4) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 " );

	} if ( ! Module[ "reallocBuffer" ] )Module[ "reallocBuffer" ] = ( function ( size ) {

		var ret; try {

			if ( ArrayBuffer.transfer ) {

				ret = ArrayBuffer.transfer( buffer, size );

			} else {

				var oldHEAP8 = HEAP8; ret = new ArrayBuffer( size ); var temp = new Int8Array( ret ); temp.set( oldHEAP8 );

			}

		} catch ( e ) {

			return false;

		} var success = _emscripten_replace_memory( ret ); if ( ! success ) return false; return ret;

	} ); function enlargeMemory() {

		var PAGE_MULTIPLE = Module[ "usingWasm" ] ? WASM_PAGE_SIZE : ASMJS_PAGE_SIZE; var LIMIT = 2147483648 - PAGE_MULTIPLE; if ( HEAP32[ DYNAMICTOP_PTR >> 2 ] > LIMIT ) {

			return false;

		} var OLD_TOTAL_MEMORY = TOTAL_MEMORY; TOTAL_MEMORY = Math.max( TOTAL_MEMORY, MIN_TOTAL_MEMORY ); while ( TOTAL_MEMORY < HEAP32[ DYNAMICTOP_PTR >> 2 ] ) {

			if ( TOTAL_MEMORY <= 536870912 ) {

				TOTAL_MEMORY = alignUp( 2 * TOTAL_MEMORY, PAGE_MULTIPLE );

			} else {

				TOTAL_MEMORY = Math.min( alignUp( ( 3 * TOTAL_MEMORY + 2147483648 ) / 4, PAGE_MULTIPLE ), LIMIT );

			}

		} var replacement = Module[ "reallocBuffer" ]( TOTAL_MEMORY ); if ( ! replacement || replacement.byteLength != TOTAL_MEMORY ) {

			TOTAL_MEMORY = OLD_TOTAL_MEMORY; return false;

		}updateGlobalBuffer( replacement ); updateGlobalBufferViews(); return true;

	} var byteLength; try {

		byteLength = Function.prototype.call.bind( Object.getOwnPropertyDescriptor( ArrayBuffer.prototype, "byteLength" ).get ); byteLength( new ArrayBuffer( 4 ) );

	} catch ( e ) {

		byteLength = ( function ( buffer ) {

			return buffer.byteLength;

		} );

	} var TOTAL_STACK = Module[ "TOTAL_STACK" ] || 5242880; var TOTAL_MEMORY = Module[ "TOTAL_MEMORY" ] || 16777216; if ( TOTAL_MEMORY < TOTAL_STACK )Module.printErr( "TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")" ); if ( Module[ "buffer" ] ) {

		buffer = Module[ "buffer" ];

	} else {

		{

			buffer = new ArrayBuffer( TOTAL_MEMORY );

		}Module[ "buffer" ] = buffer;

	}updateGlobalBufferViews(); function getTotalMemory() {

		return TOTAL_MEMORY;

	}HEAP32[ 0 ] = 1668509029; HEAP16[ 1 ] = 25459; if ( HEAPU8[ 2 ] !== 115 || HEAPU8[ 3 ] !== 99 ) throw "Runtime error: expected the system to be little-endian!"; function callRuntimeCallbacks( callbacks ) {

		while ( callbacks.length > 0 ) {

			var callback = callbacks.shift(); if ( typeof callback == "function" ) {

				callback(); continue;

			} var func = callback.func; if ( typeof func === "number" ) {

				if ( callback.arg === undefined ) {

					Module[ "dynCall_v" ]( func );

				} else {

					Module[ "dynCall_vi" ]( func, callback.arg );

				}

			} else {

				func( callback.arg === undefined ? null : callback.arg );

			}

		}

	} var __ATPRERUN__ = []; var __ATINIT__ = []; var __ATMAIN__ = []; var __ATEXIT__ = []; var __ATPOSTRUN__ = []; var runtimeInitialized = false; var runtimeExited = false; function preRun() {

		if ( Module[ "preRun" ] ) {

			if ( typeof Module[ "preRun" ] == "function" )Module[ "preRun" ] = [ Module[ "preRun" ] ]; while ( Module[ "preRun" ].length ) {

				addOnPreRun( Module[ "preRun" ].shift() );

			}

		}callRuntimeCallbacks( __ATPRERUN__ );

	} function ensureInitRuntime() {

		if ( runtimeInitialized ) return; runtimeInitialized = true; callRuntimeCallbacks( __ATINIT__ );

	} function preMain() {

		callRuntimeCallbacks( __ATMAIN__ );

	} function exitRuntime() {

		callRuntimeCallbacks( __ATEXIT__ ); runtimeExited = true;

	} function postRun() {

		if ( Module[ "postRun" ] ) {

			if ( typeof Module[ "postRun" ] == "function" )Module[ "postRun" ] = [ Module[ "postRun" ] ]; while ( Module[ "postRun" ].length ) {

				addOnPostRun( Module[ "postRun" ].shift() );

			}

		}callRuntimeCallbacks( __ATPOSTRUN__ );

	} function addOnPreRun( cb ) {

		__ATPRERUN__.unshift( cb );

	} function addOnPreMain( cb ) {

		__ATMAIN__.unshift( cb );

	} function addOnPostRun( cb ) {

		__ATPOSTRUN__.unshift( cb );

	} function writeArrayToMemory( array, buffer ) {

		HEAP8.set( array, buffer );

	} function writeAsciiToMemory( str, buffer, dontAddNull ) {

		for ( var i = 0; i < str.length; ++ i ) {

			HEAP8[ buffer ++ >> 0 ] = str.charCodeAt( i );

		} if ( ! dontAddNull )HEAP8[ buffer >> 0 ] = 0;

	} var Math_abs = Math.abs; var Math_cos = Math.cos; var Math_sin = Math.sin; var Math_tan = Math.tan; var Math_acos = Math.acos; var Math_asin = Math.asin; var Math_atan = Math.atan; var Math_atan2 = Math.atan2; var Math_exp = Math.exp; var Math_log = Math.log; var Math_sqrt = Math.sqrt; var Math_ceil = Math.ceil; var Math_floor = Math.floor; var Math_pow = Math.pow; var Math_imul = Math.imul; var Math_fround = Math.fround; var Math_round = Math.round; var Math_min = Math.min; var Math_max = Math.max; var Math_clz32 = Math.clz32; var Math_trunc = Math.trunc; var runDependencies = 0; var runDependencyWatcher = null; var dependenciesFulfilled = null; function addRunDependency( id ) {

		runDependencies ++; if ( Module[ "monitorRunDependencies" ] ) {

			Module[ "monitorRunDependencies" ]( runDependencies );

		}

	} function removeRunDependency( id ) {

		runDependencies --; if ( Module[ "monitorRunDependencies" ] ) {

			Module[ "monitorRunDependencies" ]( runDependencies );

		} if ( runDependencies == 0 ) {

			if ( runDependencyWatcher !== null ) {

				clearInterval( runDependencyWatcher ); runDependencyWatcher = null;

			} if ( dependenciesFulfilled ) {

				var callback = dependenciesFulfilled; dependenciesFulfilled = null; callback();

			}

		}

	}Module[ "preloadedImages" ] = {}; Module[ "preloadedAudios" ] = {}; var memoryInitializer = null; var dataURIPrefix = "data:application/octet-stream;base64,"; function isDataURI( filename ) {

		return String.prototype.startsWith ? filename.startsWith( dataURIPrefix ) : filename.indexOf( dataURIPrefix ) === 0;

	}STATIC_BASE = GLOBAL_BASE; STATICTOP = STATIC_BASE + 13472; __ATINIT__.push(); memoryInitializer = "data:application/octet-stream;base64,PA4AAIQOAAAYAAAAAAAAABQOAACrDgAAPA4AAMgOAAAYAAAAAAAAADwOAADxDgAAQAAAAAAAAAAUDgAADQ8AABQOAAAyDwAAPA4AAFcPAAAwAAAAAAAAADwOAAB4GQAASAAAAAAAAAA8DgAAhw8AAIAAAAAAAAAAPA4AAOAPAACQAAAAAAAAADwOAAA0EAAAoAAAAAAAAAA8DgAAaBAAALAAAAAAAAAAFA4AAJMQAAA8DgAAtxAAAMgAAAAAAAAAFA4AAFURAAA8DgAA8xEAAOAAAAAAAAAAPA4AAIsSAACAAAAAAAAAADwOAAAUEwAA4AAAAAAAAAA8DgAArhMAAOAAAAAAAAAAPA4AAFQUAADgAAAAAAAAADwOAADqFAAAMAEAAAAAAAAUDgAAlRUAADwOAABAFgAASAEAAAAAAAA8DgAA5RYAAIAAAAAAAAAAPA4AAHsXAABIAQAAAAAAADwOAAAiGAAASAEAAAAAAAA8DgAA1RgAAEgBAAAAAAAAPA4AAC8gAABgAAAAAAAAADwOAACkGQAAqAEAAAAAAAA8DgAAFRoAAJAAAAAAAAAAPA4AAIEaAADIAQAAAAAAABQOAAA3GwAAPA4AAO0bAADgAQAAAAAAADwOAACdHAAAqAEAAAAAAAA8DgAAPh0AAAACAAAAAAAAFA4AAAEeAAA8DgAAxB4AABgCAAAAAAAAPA4AAIEfAACoAQAAAAAAADwOAABaIAAAYAAAAAAAAAA8DgAA8SAAAOgCAAAAAAAAPA4AAAchAAA4AgAAAAAAADwOAAD1IwAAsAIAAAAAAAAUDgAAKCEAADwOAABwIQAAgAIAAAAAAAAUDgAAOiIAABQOAABUIgAAPA4AAI8iAACAAgAAAAAAADwOAAA4IwAAgAIAAAAAAAAUDgAAQSQAADwOAABvJAAAsAIAAAAAAAA8DgAA3CQAADgCAAAAAAAAPA4AAMIkAACAAgAAAAAAABQOAAD8JAAAPA4AAC8mAAAAAwAAAAAAABQOAACBJgAAFA4AAKQwAAA8DgAABDEAACADAAAAAAAAPA4AALEwAAAwAwAAAAAAABQOAADSMAAAPA4AAN8wAAAQAwAAAAAAADwOAADmMQAACAMAAAAAAAA8DgAA9jEAAEgDAAAAAAAAPA4AACsyAAAgAwAAAAAAADwOAAAHMgAAaAMAAAAAAAAAAADAAAAAwAAAAMAAAADAAAAAAAgAAAABAAAAAgAAAAEAAAABAAAAAQAAAAAAAAAgAAAAAwAAAAQAAAACAAAAAgAAAAIAAAAAAAAAMAAAAAUAAAAGAAAAAQAAAAMAAAAEAAAABQAAAAMAAAAEAAAABgAAAAEAAAAHAAAABQAAAAAAAABIAAAABwAAAAgAAAACAAAACAAAAAMAAAAEAAAACQAAAAoAAAAFAAAA/////wAAAABQAAAACQAAAAoAAAABAAAACwAAAAwAAAAFAAAAAwAAAAQAAAANAAAADgAAAA8AAAAGAAAAAQAAAAAAAABgAAAACwAAAAwAAAAGAAAACAAAAAMAAAAEAAAAEAAAAAoAAAAHAAAACAAAAAEAAAAHAAAAEQAAAAAAAACAAAAADQAAAA4AAAABAAAACAAAAAEAAAAJAAAAEgAAABMAAAAKAAAACwAAABQAAAABAAAAAAAAAHAAAAANAAAADwAAAAwAAAAIAAAADQAAAAkAAAASAAAAEwAAAAoAAAALAAAAFAAAAAEAAAAAAAAAEAEAAA0AAAAQAAAADgAAAAgAAAAPAAAACQAAABIAAAATAAAACgAAAAsAAAAUAAAAAgAAAAAAAAAAAQAAEQAAABIAAAAQAAAACAAAABEAAAAJAAAAEgAAABMAAAAKAAAACwAAABUAAAADAAAAAAAAAPAAAAATAAAAFAAAABIAAAAIAAAAEwAAABQAAAAWAAAAFwAAAAoAAAALAAAAGAAAAAQAAAAAAAAA0AAAABUAAAAWAAAAFQAAAAgAAAAWAAAAFwAAABkAAAAaAAAACgAAAAsAAAAbAAAABQAAAAAAAAC4AAAAFwAAABgAAAAcAAAAGAAAAAIAAAAAAAAAeAEAAA0AAAAZAAAAGQAAAAgAAAAaAAAACQAAABIAAAATAAAACgAAAAsAAAAUAAAABgAAAAAAAABoAQAAGgAAABsAAAAbAAAACAAAABwAAAAJAAAAEgAAABMAAAAKAAAACwAAAB0AAAAHAAAAAAAAAFgBAAAcAAAAHQAAAB0AAAAIAAAAHgAAAB8AAAAeAAAAHwAAAAoAAAALAAAAIAAAAAgAAAAAAAAAOAEAAB4AAAAfAAAAIAAAAAgAAAAhAAAAIgAAACEAAAAiAAAACgAAAAsAAAAjAAAACQAAAAAAAAAgAQAAIAAAACEAAAAkAAAAIwAAAAMAAAAAAAAAiAEAAAsAAAAiAAAACQAAAAgAAAADAAAACgAAABAAAAAKAAAABwAAAAsAAAACAAAAJAAAACUAAAAAAAAAmAEAACMAAAAkAAAAJQAAACYAAAAnAAAAKAAAACYAAAAnAAAAKQAAACoAAAAoAAAACgAAAAAAAAAIAgAAJQAAACYAAAArAAAAJgAAACwAAAAtAAAAKQAAACoAAAApAAAAKgAAACsAAAALAAAAAAAAAPABAAAnAAAAKAAAACwAAAAuAAAABAAAAAAAAADQAQAAKQAAACoAAAAvAAAAJgAAADAAAAAxAAAALQAAAC4AAAApAAAAKgAAAC8AAAAMAAAAAAAAALgBAAArAAAALAAAADAAAAAyAAAABQAAAAAAAAAoAgAALQAAAC4AAAAMAAAACAAAAAMAAAANAAAAEAAAAAoAAAAHAAAADgAAAAEAAAAHAAAAMQAAADMAAAAyAAAAAAAAADgCAAAvAAAAMAAAADQAAAA1AAAAAQAAADYAAAA3AAAAOAAAADkAAAA6AAAAMwAAADQAAAABAAAAAAAAAEgCAAAxAAAAMgAAADQAAAA7AAAANQAAADYAAAA3AAAAOAAAADwAAAA9AAAANgAAADcAAAA+AAAAAAAAAFgCAAAzAAAANAAAADgAAAA5AAAAOgAAADsAAAA/AAAAQAAAAEEAAABCAAAA/////wAAAABwAgAANQAAADYAAAA8AAAAQwAAAAAAAABoAgAANwAAADgAAAA5AAAA/////wAAAACQAgAAOgAAADsAAAA9AAAARAAAAAAAAACIAgAAPAAAAD0AAAA+AAAAAAAAAKACAAA/AAAAQAAAAD4AAABFAAAAAAAAALgCAABBAAAAQgAAAD8AAABAAAAAQQAAAEIAAABGAAAARwAAAEgAAABJAAAAAAAAAAEAAAADAAAABQAAAAcAAAAAAAAAyAIAAC8AAABDAAAANAAAADUAAABDAAAANgAAADcAAAA4AAAAOQAAADoAAAAzAAAANAAAAEoAAAAAAAAA2AIAAEQAAABFAAAARAAAAEsAAAAAAAAA6AIAAC8AAABGAAAATAAAADUAAAABAAAATQAAADcAAAA4AAAAOQAAAP//////////AAAAAPACAABHAAAASAAAAAYAAAADAAAA/////wAAAAAAAwAASQAAAEoAAAAHAAAABAAAAJwKAAAFAAAAAAAAAAAAAABOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAEAAAAJg0AAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAD//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABsNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAMAAAAFAAAABwAAAAsAAAANAAAAEQAAABMAAAAXAAAAHQAAAB8AAAAlAAAAKQAAACsAAAAvAAAANQAAADsAAAA9AAAAQwAAAEcAAABJAAAATwAAAFMAAABZAAAAYQAAAGUAAABnAAAAawAAAG0AAABxAAAAfwAAAIMAAACJAAAAiwAAAJUAAACXAAAAnQAAAKMAAACnAAAArQAAALMAAAC1AAAAvwAAAMEAAADFAAAAxwAAANMAAAABAAAACwAAAA0AAAARAAAAEwAAABcAAAAdAAAAHwAAACUAAAApAAAAKwAAAC8AAAA1AAAAOwAAAD0AAABDAAAARwAAAEkAAABPAAAAUwAAAFkAAABhAAAAZQAAAGcAAABrAAAAbQAAAHEAAAB5AAAAfwAAAIMAAACJAAAAiwAAAI8AAACVAAAAlwAAAJ0AAACjAAAApwAAAKkAAACtAAAAswAAALUAAAC7AAAAvwAAAMEAAADFAAAAxwAAANEAAAACAAAAAAAAABADAABLAAAATAAAAE0AAABOAAAAEgAAAAEAAAABAAAAAwAAAAAAAAA4AwAASwAAAE8AAABNAAAATgAAABIAAAACAAAAAgAAAAQAAAAAAAAASAMAAFAAAABRAAAATwAAAAAAAABYAwAAUAAAAFIAAABPAAAATjVkcmFjbzI4QXR0cmlidXRlT2N0YWhlZHJvblRyYW5zZm9ybUUATjVkcmFjbzE4QXR0cmlidXRlVHJhbnNmb3JtRQBONWRyYWNvMzBBdHRyaWJ1dGVRdWFudGl6YXRpb25UcmFuc2Zvcm1FAE41ZHJhY28xN0F0dHJpYnV0ZXNEZWNvZGVyRQBONWRyYWNvMjZBdHRyaWJ1dGVzRGVjb2RlckludGVyZmFjZUUATjVkcmFjbzI2U2VxdWVudGlhbEF0dHJpYnV0ZURlY29kZXJFAE41ZHJhY28zN1NlcXVlbnRpYWxBdHRyaWJ1dGVEZWNvZGVyc0NvbnRyb2xsZXJFAE41ZHJhY28yOFByZWRpY3Rpb25TY2hlbWVEZWx0YURlY29kZXJJaU5TXzM3UHJlZGljdGlvblNjaGVtZVdyYXBEZWNvZGluZ1RyYW5zZm9ybUlpaUVFRUUATjVkcmFjbzIzUHJlZGljdGlvblNjaGVtZURlY29kZXJJaU5TXzM3UHJlZGljdGlvblNjaGVtZVdyYXBEZWNvZGluZ1RyYW5zZm9ybUlpaUVFRUUATjVkcmFjbzM3UHJlZGljdGlvblNjaGVtZVR5cGVkRGVjb2RlckludGVyZmFjZUlpaUVFAE41ZHJhY28zMlByZWRpY3Rpb25TY2hlbWVEZWNvZGVySW50ZXJmYWNlRQBONWRyYWNvMjVQcmVkaWN0aW9uU2NoZW1lSW50ZXJmYWNlRQBONWRyYWNvNDhNZXNoUHJlZGljdGlvblNjaGVtZUdlb21ldHJpY05vcm1hbFByZWRpY3RvckFyZWFJaU5TXzM3UHJlZGljdGlvblNjaGVtZVdyYXBEZWNvZGluZ1RyYW5zZm9ybUlpaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMTFDb3JuZXJUYWJsZUVFRUVFAE41ZHJhY280OE1lc2hQcmVkaWN0aW9uU2NoZW1lR2VvbWV0cmljTm9ybWFsUHJlZGljdG9yQmFzZUlpTlNfMzdQcmVkaWN0aW9uU2NoZW1lV3JhcERlY29kaW5nVHJhbnNmb3JtSWlpRUVOU18yNE1lc2hQcmVkaWN0aW9uU2NoZW1lRGF0YUlOU18xMUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzQyTWVzaFByZWRpY3Rpb25TY2hlbWVHZW9tZXRyaWNOb3JtYWxEZWNvZGVySWlOU18zN1ByZWRpY3Rpb25TY2hlbWVXcmFwRGVjb2RpbmdUcmFuc2Zvcm1JaWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzExQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvMjdNZXNoUHJlZGljdGlvblNjaGVtZURlY29kZXJJaU5TXzM3UHJlZGljdGlvblNjaGVtZVdyYXBEZWNvZGluZ1RyYW5zZm9ybUlpaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMTFDb3JuZXJUYWJsZUVFRUVFAE41ZHJhY280NE1lc2hQcmVkaWN0aW9uU2NoZW1lVGV4Q29vcmRzUG9ydGFibGVEZWNvZGVySWlOU18zN1ByZWRpY3Rpb25TY2hlbWVXcmFwRGVjb2RpbmdUcmFuc2Zvcm1JaWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzExQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvNTZNZXNoUHJlZGljdGlvblNjaGVtZUNvbnN0cmFpbmVkTXVsdGlQYXJhbGxlbG9ncmFtRGVjb2RlcklpTlNfMzdQcmVkaWN0aW9uU2NoZW1lV3JhcERlY29kaW5nVHJhbnNmb3JtSWlpRUVOU18yNE1lc2hQcmVkaWN0aW9uU2NoZW1lRGF0YUlOU18xMUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzQwTWVzaFByZWRpY3Rpb25TY2hlbWVQYXJhbGxlbG9ncmFtRGVjb2RlcklpTlNfMzdQcmVkaWN0aW9uU2NoZW1lV3JhcERlY29kaW5nVHJhbnNmb3JtSWlpRUVOU18yNE1lc2hQcmVkaWN0aW9uU2NoZW1lRGF0YUlOU18xMUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzQ4TWVzaFByZWRpY3Rpb25TY2hlbWVHZW9tZXRyaWNOb3JtYWxQcmVkaWN0b3JBcmVhSWlOU18zN1ByZWRpY3Rpb25TY2hlbWVXcmFwRGVjb2RpbmdUcmFuc2Zvcm1JaWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzI0TWVzaEF0dHJpYnV0ZUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzQ4TWVzaFByZWRpY3Rpb25TY2hlbWVHZW9tZXRyaWNOb3JtYWxQcmVkaWN0b3JCYXNlSWlOU18zN1ByZWRpY3Rpb25TY2hlbWVXcmFwRGVjb2RpbmdUcmFuc2Zvcm1JaWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzI0TWVzaEF0dHJpYnV0ZUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzQyTWVzaFByZWRpY3Rpb25TY2hlbWVHZW9tZXRyaWNOb3JtYWxEZWNvZGVySWlOU18zN1ByZWRpY3Rpb25TY2hlbWVXcmFwRGVjb2RpbmdUcmFuc2Zvcm1JaWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzI0TWVzaEF0dHJpYnV0ZUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzI3TWVzaFByZWRpY3Rpb25TY2hlbWVEZWNvZGVySWlOU18zN1ByZWRpY3Rpb25TY2hlbWVXcmFwRGVjb2RpbmdUcmFuc2Zvcm1JaWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzI0TWVzaEF0dHJpYnV0ZUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzQ0TWVzaFByZWRpY3Rpb25TY2hlbWVUZXhDb29yZHNQb3J0YWJsZURlY29kZXJJaU5TXzM3UHJlZGljdGlvblNjaGVtZVdyYXBEZWNvZGluZ1RyYW5zZm9ybUlpaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMjRNZXNoQXR0cmlidXRlQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvNTZNZXNoUHJlZGljdGlvblNjaGVtZUNvbnN0cmFpbmVkTXVsdGlQYXJhbGxlbG9ncmFtRGVjb2RlcklpTlNfMzdQcmVkaWN0aW9uU2NoZW1lV3JhcERlY29kaW5nVHJhbnNmb3JtSWlpRUVOU18yNE1lc2hQcmVkaWN0aW9uU2NoZW1lRGF0YUlOU18yNE1lc2hBdHRyaWJ1dGVDb3JuZXJUYWJsZUVFRUVFAE41ZHJhY280ME1lc2hQcmVkaWN0aW9uU2NoZW1lUGFyYWxsZWxvZ3JhbURlY29kZXJJaU5TXzM3UHJlZGljdGlvblNjaGVtZVdyYXBEZWNvZGluZ1RyYW5zZm9ybUlpaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMjRNZXNoQXR0cmlidXRlQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvMzNTZXF1ZW50aWFsSW50ZWdlckF0dHJpYnV0ZURlY29kZXJFAE41ZHJhY28yOFByZWRpY3Rpb25TY2hlbWVEZWx0YURlY29kZXJJaU5TXzYyUHJlZGljdGlvblNjaGVtZU5vcm1hbE9jdGFoZWRyb25DYW5vbmljYWxpemVkRGVjb2RpbmdUcmFuc2Zvcm1JaUVFRUUATjVkcmFjbzIzUHJlZGljdGlvblNjaGVtZURlY29kZXJJaU5TXzYyUHJlZGljdGlvblNjaGVtZU5vcm1hbE9jdGFoZWRyb25DYW5vbmljYWxpemVkRGVjb2RpbmdUcmFuc2Zvcm1JaUVFRUUATjVkcmFjbzQ4TWVzaFByZWRpY3Rpb25TY2hlbWVHZW9tZXRyaWNOb3JtYWxQcmVkaWN0b3JBcmVhSWlOU182MlByZWRpY3Rpb25TY2hlbWVOb3JtYWxPY3RhaGVkcm9uQ2Fub25pY2FsaXplZERlY29kaW5nVHJhbnNmb3JtSWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzExQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvNDhNZXNoUHJlZGljdGlvblNjaGVtZUdlb21ldHJpY05vcm1hbFByZWRpY3RvckJhc2VJaU5TXzYyUHJlZGljdGlvblNjaGVtZU5vcm1hbE9jdGFoZWRyb25DYW5vbmljYWxpemVkRGVjb2RpbmdUcmFuc2Zvcm1JaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMTFDb3JuZXJUYWJsZUVFRUVFAE41ZHJhY280Mk1lc2hQcmVkaWN0aW9uU2NoZW1lR2VvbWV0cmljTm9ybWFsRGVjb2RlcklpTlNfNjJQcmVkaWN0aW9uU2NoZW1lTm9ybWFsT2N0YWhlZHJvbkNhbm9uaWNhbGl6ZWREZWNvZGluZ1RyYW5zZm9ybUlpRUVOU18yNE1lc2hQcmVkaWN0aW9uU2NoZW1lRGF0YUlOU18xMUNvcm5lclRhYmxlRUVFRUUATjVkcmFjbzI3TWVzaFByZWRpY3Rpb25TY2hlbWVEZWNvZGVySWlOU182MlByZWRpY3Rpb25TY2hlbWVOb3JtYWxPY3RhaGVkcm9uQ2Fub25pY2FsaXplZERlY29kaW5nVHJhbnNmb3JtSWlFRU5TXzI0TWVzaFByZWRpY3Rpb25TY2hlbWVEYXRhSU5TXzExQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvNDhNZXNoUHJlZGljdGlvblNjaGVtZUdlb21ldHJpY05vcm1hbFByZWRpY3RvckFyZWFJaU5TXzYyUHJlZGljdGlvblNjaGVtZU5vcm1hbE9jdGFoZWRyb25DYW5vbmljYWxpemVkRGVjb2RpbmdUcmFuc2Zvcm1JaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMjRNZXNoQXR0cmlidXRlQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvNDhNZXNoUHJlZGljdGlvblNjaGVtZUdlb21ldHJpY05vcm1hbFByZWRpY3RvckJhc2VJaU5TXzYyUHJlZGljdGlvblNjaGVtZU5vcm1hbE9jdGFoZWRyb25DYW5vbmljYWxpemVkRGVjb2RpbmdUcmFuc2Zvcm1JaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMjRNZXNoQXR0cmlidXRlQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvNDJNZXNoUHJlZGljdGlvblNjaGVtZUdlb21ldHJpY05vcm1hbERlY29kZXJJaU5TXzYyUHJlZGljdGlvblNjaGVtZU5vcm1hbE9jdGFoZWRyb25DYW5vbmljYWxpemVkRGVjb2RpbmdUcmFuc2Zvcm1JaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMjRNZXNoQXR0cmlidXRlQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvMjdNZXNoUHJlZGljdGlvblNjaGVtZURlY29kZXJJaU5TXzYyUHJlZGljdGlvblNjaGVtZU5vcm1hbE9jdGFoZWRyb25DYW5vbmljYWxpemVkRGVjb2RpbmdUcmFuc2Zvcm1JaUVFTlNfMjRNZXNoUHJlZGljdGlvblNjaGVtZURhdGFJTlNfMjRNZXNoQXR0cmlidXRlQ29ybmVyVGFibGVFRUVFRQBONWRyYWNvMzJTZXF1ZW50aWFsTm9ybWFsQXR0cmlidXRlRGVjb2RlckUATjVkcmFjbzM4U2VxdWVudGlhbFF1YW50aXphdGlvbkF0dHJpYnV0ZURlY29kZXJFAFVuc3VwcG9ydGVkIGVuY29kaW5nIG1ldGhvZC4AVW5zdXBwb3J0ZWQgZ2VvbWV0cnkgdHlwZS4ASW5wdXQgaXMgbm90IGEgbWVzaC4Ac2tpcF9hdHRyaWJ1dGVfdHJhbnNmb3JtAE41ZHJhY28xMU1lc2hEZWNvZGVyRQBONWRyYWNvMjJNZXNoRWRnZUJyZWFrZXJEZWNvZGVyRQBONWRyYWNvMjlDb3JuZXJUYWJsZVRyYXZlcnNhbFByb2Nlc3NvcklOU18yNE1lc2hBdHRyaWJ1dGVDb3JuZXJUYWJsZUVFRQBONWRyYWNvMjJNZXNoVHJhdmVyc2FsU2VxdWVuY2VySU5TXzIwRWRnZUJyZWFrZXJUcmF2ZXJzZXJJTlNfMjlDb3JuZXJUYWJsZVRyYXZlcnNhbFByb2Nlc3NvcklOU18yNE1lc2hBdHRyaWJ1dGVDb3JuZXJUYWJsZUVFRU5TXzM2TWVzaEF0dHJpYnV0ZUluZGljZXNFbmNvZGluZ09ic2VydmVySVMzX0VFTlNfMTlFZGdlQnJlYWtlck9ic2VydmVyRUVFRUUATjVkcmFjbzE1UG9pbnRzU2VxdWVuY2VyRQBONWRyYWNvMjlDb3JuZXJUYWJsZVRyYXZlcnNhbFByb2Nlc3NvcklOU18xMUNvcm5lclRhYmxlRUVFAE41ZHJhY28yMk1lc2hUcmF2ZXJzYWxTZXF1ZW5jZXJJTlNfMjVQcmVkaWN0aW9uRGVncmVlVHJhdmVyc2VySU5TXzI5Q29ybmVyVGFibGVUcmF2ZXJzYWxQcm9jZXNzb3JJTlNfMTFDb3JuZXJUYWJsZUVFRU5TXzM2TWVzaEF0dHJpYnV0ZUluZGljZXNFbmNvZGluZ09ic2VydmVySVMzX0VFRUVFRQBONWRyYWNvMjJNZXNoVHJhdmVyc2FsU2VxdWVuY2VySU5TXzIwRWRnZUJyZWFrZXJUcmF2ZXJzZXJJTlNfMjlDb3JuZXJUYWJsZVRyYXZlcnNhbFByb2Nlc3NvcklOU18xMUNvcm5lclRhYmxlRUVFTlNfMzZNZXNoQXR0cmlidXRlSW5kaWNlc0VuY29kaW5nT2JzZXJ2ZXJJUzNfRUVOU18xOUVkZ2VCcmVha2VyT2JzZXJ2ZXJFRUVFRQBONWRyYWNvMjZNZXNoRWRnZUJyZWFrZXJEZWNvZGVySW1wbElOU18zMU1lc2hFZGdlQnJlYWtlclRyYXZlcnNhbERlY29kZXJFRUUATjVkcmFjbzM1TWVzaEVkZ2VCcmVha2VyRGVjb2RlckltcGxJbnRlcmZhY2VFAE41ZHJhY28yNk1lc2hFZGdlQnJlYWtlckRlY29kZXJJbXBsSU5TXzM4TWVzaEVkZ2VCcmVha2VyVHJhdmVyc2FsVmFsZW5jZURlY29kZXJFRUUATjVkcmFjbzE1TGluZWFyU2VxdWVuY2VyRQBONWRyYWNvMjFNZXNoU2VxdWVudGlhbERlY29kZXJFAE41ZHJhY28xN1BvaW50Q2xvdWREZWNvZGVyRQBGYWlsZWQgdG8gcGFyc2UgRHJhY28gaGVhZGVyLgBEUkFDTwBOb3QgYSBEcmFjbyBmaWxlLgBGYWlsZWQgdG8gZGVjb2RlIG1ldGFkYXRhLgBVc2luZyBpbmNvbXBhdGlibGUgZGVjb2RlciBmb3IgdGhlIGlucHV0IGdlb21ldHJ5LgBVbmtub3duIG1ham9yIHZlcnNpb24uAFVua25vd24gbWlub3IgdmVyc2lvbi4ARmFpbGVkIHRvIGluaXRpYWxpemUgdGhlIGRlY29kZXIuAEZhaWxlZCB0byBkZWNvZGUgZ2VvbWV0cnkgZGF0YS4ARmFpbGVkIHRvIGRlY29kZSBwb2ludCBhdHRyaWJ1dGVzLgBONWRyYWNvNE1lc2hFAGFsbG9jYXRvcjxUPjo6YWxsb2NhdGUoc2l6ZV90IG4pICduJyBleGNlZWRzIG1heGltdW0gc3VwcG9ydGVkIHNpemUATjVkcmFjbzEwUG9pbnRDbG91ZEUAEQAKABEREQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAARAA8KERERAwoHAAETCQsLAAAJBgsAAAsABhEAAAAREREAAAAAAAAAAAAAAAAAAAAACwAAAAAAAAAAEQAKChEREQAKAAACAAkLAAAACQALAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAADAAAAAAJDAAAAAAADAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAANAAAABA0AAAAACQ4AAAAAAA4AAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAADwAAAAAPAAAAAAkQAAAAAAAQAAAQAAASAAAAEhISAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAAAASEhIAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAAAAAAAAAAAAKAAAAAAoAAAAACQsAAAAAAAsAAAsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAADAAAAAAMAAAAAAkMAAAAAAAMAAAMAAAtKyAgIDBYMHgAKG51bGwpAC0wWCswWCAwWC0weCsweCAweABpbmYASU5GAG5hbgBOQU4AMDEyMzQ1Njc4OUFCQ0RFRi4AVCEiGQ0BAgMRSxwMEAQLHRIeJ2hub3BxYiAFBg8TFBUaCBYHKCQXGAkKDhsfJSODgn0mKis8PT4/Q0dKTVhZWltcXV5fYGFjZGVmZ2lqa2xyc3R5ent8AElsbGVnYWwgYnl0ZSBzZXF1ZW5jZQBEb21haW4gZXJyb3IAUmVzdWx0IG5vdCByZXByZXNlbnRhYmxlAE5vdCBhIHR0eQBQZXJtaXNzaW9uIGRlbmllZABPcGVyYXRpb24gbm90IHBlcm1pdHRlZABObyBzdWNoIGZpbGUgb3IgZGlyZWN0b3J5AE5vIHN1Y2ggcHJvY2VzcwBGaWxlIGV4aXN0cwBWYWx1ZSB0b28gbGFyZ2UgZm9yIGRhdGEgdHlwZQBObyBzcGFjZSBsZWZ0IG9uIGRldmljZQBPdXQgb2YgbWVtb3J5AFJlc291cmNlIGJ1c3kASW50ZXJydXB0ZWQgc3lzdGVtIGNhbGwAUmVzb3VyY2UgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUASW52YWxpZCBzZWVrAENyb3NzLWRldmljZSBsaW5rAFJlYWQtb25seSBmaWxlIHN5c3RlbQBEaXJlY3Rvcnkgbm90IGVtcHR5AENvbm5lY3Rpb24gcmVzZXQgYnkgcGVlcgBPcGVyYXRpb24gdGltZWQgb3V0AENvbm5lY3Rpb24gcmVmdXNlZABIb3N0IGlzIGRvd24ASG9zdCBpcyB1bnJlYWNoYWJsZQBBZGRyZXNzIGluIHVzZQBCcm9rZW4gcGlwZQBJL08gZXJyb3IATm8gc3VjaCBkZXZpY2Ugb3IgYWRkcmVzcwBCbG9jayBkZXZpY2UgcmVxdWlyZWQATm8gc3VjaCBkZXZpY2UATm90IGEgZGlyZWN0b3J5AElzIGEgZGlyZWN0b3J5AFRleHQgZmlsZSBidXN5AEV4ZWMgZm9ybWF0IGVycm9yAEludmFsaWQgYXJndW1lbnQAQXJndW1lbnQgbGlzdCB0b28gbG9uZwBTeW1ib2xpYyBsaW5rIGxvb3AARmlsZW5hbWUgdG9vIGxvbmcAVG9vIG1hbnkgb3BlbiBmaWxlcyBpbiBzeXN0ZW0ATm8gZmlsZSBkZXNjcmlwdG9ycyBhdmFpbGFibGUAQmFkIGZpbGUgZGVzY3JpcHRvcgBObyBjaGlsZCBwcm9jZXNzAEJhZCBhZGRyZXNzAEZpbGUgdG9vIGxhcmdlAFRvbyBtYW55IGxpbmtzAE5vIGxvY2tzIGF2YWlsYWJsZQBSZXNvdXJjZSBkZWFkbG9jayB3b3VsZCBvY2N1cgBTdGF0ZSBub3QgcmVjb3ZlcmFibGUAUHJldmlvdXMgb3duZXIgZGllZABPcGVyYXRpb24gY2FuY2VsZWQARnVuY3Rpb24gbm90IGltcGxlbWVudGVkAE5vIG1lc3NhZ2Ugb2YgZGVzaXJlZCB0eXBlAElkZW50aWZpZXIgcmVtb3ZlZABEZXZpY2Ugbm90IGEgc3RyZWFtAE5vIGRhdGEgYXZhaWxhYmxlAERldmljZSB0aW1lb3V0AE91dCBvZiBzdHJlYW1zIHJlc291cmNlcwBMaW5rIGhhcyBiZWVuIHNldmVyZWQAUHJvdG9jb2wgZXJyb3IAQmFkIG1lc3NhZ2UARmlsZSBkZXNjcmlwdG9yIGluIGJhZCBzdGF0ZQBOb3QgYSBzb2NrZXQARGVzdGluYXRpb24gYWRkcmVzcyByZXF1aXJlZABNZXNzYWdlIHRvbyBsYXJnZQBQcm90b2NvbCB3cm9uZyB0eXBlIGZvciBzb2NrZXQAUHJvdG9jb2wgbm90IGF2YWlsYWJsZQBQcm90b2NvbCBub3Qgc3VwcG9ydGVkAFNvY2tldCB0eXBlIG5vdCBzdXBwb3J0ZWQATm90IHN1cHBvcnRlZABQcm90b2NvbCBmYW1pbHkgbm90IHN1cHBvcnRlZABBZGRyZXNzIGZhbWlseSBub3Qgc3VwcG9ydGVkIGJ5IHByb3RvY29sAEFkZHJlc3Mgbm90IGF2YWlsYWJsZQBOZXR3b3JrIGlzIGRvd24ATmV0d29yayB1bnJlYWNoYWJsZQBDb25uZWN0aW9uIHJlc2V0IGJ5IG5ldHdvcmsAQ29ubmVjdGlvbiBhYm9ydGVkAE5vIGJ1ZmZlciBzcGFjZSBhdmFpbGFibGUAU29ja2V0IGlzIGNvbm5lY3RlZABTb2NrZXQgbm90IGNvbm5lY3RlZABDYW5ub3Qgc2VuZCBhZnRlciBzb2NrZXQgc2h1dGRvd24AT3BlcmF0aW9uIGFscmVhZHkgaW4gcHJvZ3Jlc3MAT3BlcmF0aW9uIGluIHByb2dyZXNzAFN0YWxlIGZpbGUgaGFuZGxlAFJlbW90ZSBJL08gZXJyb3IAUXVvdGEgZXhjZWVkZWQATm8gbWVkaXVtIGZvdW5kAFdyb25nIG1lZGl1bSB0eXBlAE5vIGVycm9yIGluZm9ybWF0aW9uAAAlZAB0ZXJtaW5hdGluZyB3aXRoICVzIGV4Y2VwdGlvbiBvZiB0eXBlICVzOiAlcwB0ZXJtaW5hdGluZyB3aXRoICVzIGV4Y2VwdGlvbiBvZiB0eXBlICVzAHRlcm1pbmF0aW5nIHdpdGggJXMgZm9yZWlnbiBleGNlcHRpb24AdGVybWluYXRpbmcAdW5jYXVnaHQAU3Q5ZXhjZXB0aW9uAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAFN0OXR5cGVfaW5mbwBOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTE3X19jbGFzc190eXBlX2luZm9FAHB0aHJlYWRfb25jZSBmYWlsdXJlIGluIF9fY3hhX2dldF9nbG9iYWxzX2Zhc3QoKQBjYW5ub3QgY3JlYXRlIHB0aHJlYWQga2V5IGZvciBfX2N4YV9nZXRfZ2xvYmFscygpAGNhbm5vdCB6ZXJvIG91dCB0aHJlYWQgdmFsdWUgZm9yIF9fY3hhX2dldF9nbG9iYWxzKCkAdGVybWluYXRlX2hhbmRsZXIgdW5leHBlY3RlZGx5IHJldHVybmVkAFN0MTFsb2dpY19lcnJvcgBTdDEybGVuZ3RoX2Vycm9yAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FAE4xMF9fY3h4YWJpdjExN19fcGJhc2VfdHlwZV9pbmZvRQ=="; var tempDoublePtr = STATICTOP; STATICTOP += 16; function ___cxa_allocate_exception( size ) {

		return _malloc( size );

	} function __ZSt18uncaught_exceptionv() {

		return !! __ZSt18uncaught_exceptionv.uncaught_exception;

	} var EXCEPTIONS = { last: 0, caught: [], infos: {}, deAdjust: ( function ( adjusted ) {

		if ( ! adjusted || EXCEPTIONS.infos[ adjusted ] ) return adjusted; for ( var ptr in EXCEPTIONS.infos ) {

			var info = EXCEPTIONS.infos[ ptr ]; if ( info.adjusted === adjusted ) {

				return ptr;

			}

		} return adjusted;

	} ), addRef: ( function ( ptr ) {

		if ( ! ptr ) return; var info = EXCEPTIONS.infos[ ptr ]; info.refcount ++;

	} ), decRef: ( function ( ptr ) {

		if ( ! ptr ) return; var info = EXCEPTIONS.infos[ ptr ]; assert( info.refcount > 0 ); info.refcount --; if ( info.refcount === 0 && ! info.rethrown ) {

			if ( info.destructor ) {

				Module[ "dynCall_vi" ]( info.destructor, ptr );

			} delete EXCEPTIONS.infos[ ptr ]; ___cxa_free_exception( ptr );

		}

	} ), clearRef: ( function ( ptr ) {

		if ( ! ptr ) return; var info = EXCEPTIONS.infos[ ptr ]; info.refcount = 0;

	} ) }; function ___cxa_begin_catch( ptr ) {

		var info = EXCEPTIONS.infos[ ptr ]; if ( info && ! info.caught ) {

			info.caught = true; __ZSt18uncaught_exceptionv.uncaught_exception --;

		} if ( info )info.rethrown = false; EXCEPTIONS.caught.push( ptr ); EXCEPTIONS.addRef( EXCEPTIONS.deAdjust( ptr ) ); return ptr;

	} function ___cxa_pure_virtual() {

		ABORT = true; throw "Pure virtual function called!";

	} function ___resumeException( ptr ) {

		if ( ! EXCEPTIONS.last ) {

			EXCEPTIONS.last = ptr;

		} throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";

	} function ___cxa_find_matching_catch() {

		var thrown = EXCEPTIONS.last; if ( ! thrown ) {

			return ( setTempRet0( 0 ), 0 ) | 0;

		} var info = EXCEPTIONS.infos[ thrown ]; var throwntype = info.type; if ( ! throwntype ) {

			return ( setTempRet0( 0 ), thrown ) | 0;

		} var typeArray = Array.prototype.slice.call( arguments ); var pointer = Module[ "___cxa_is_pointer_type" ]( throwntype ); if ( ! ___cxa_find_matching_catch.buffer )___cxa_find_matching_catch.buffer = _malloc( 4 ); HEAP32[ ___cxa_find_matching_catch.buffer >> 2 ] = thrown; thrown = ___cxa_find_matching_catch.buffer; for ( var i = 0; i < typeArray.length; i ++ ) {

			if ( typeArray[ i ] && Module[ "___cxa_can_catch" ]( typeArray[ i ], throwntype, thrown ) ) {

				thrown = HEAP32[ thrown >> 2 ]; info.adjusted = thrown; return ( setTempRet0( typeArray[ i ] ), thrown ) | 0;

			}

		}thrown = HEAP32[ thrown >> 2 ]; return ( setTempRet0( throwntype ), thrown ) | 0;

	} function ___cxa_throw( ptr, type, destructor ) {

		EXCEPTIONS.infos[ ptr ] = { ptr: ptr, adjusted: ptr, type: type, destructor: destructor, refcount: 0, caught: false, rethrown: false }; EXCEPTIONS.last = ptr; if ( ! ( "uncaught_exception" in __ZSt18uncaught_exceptionv ) ) {

			__ZSt18uncaught_exceptionv.uncaught_exception = 1;

		} else {

			__ZSt18uncaught_exceptionv.uncaught_exception ++;

		} throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";

	} var cttz_i8 = allocate( [ 8, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 7, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 6, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 5, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0, 4, 0, 1, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 1, 0 ], "i8", ALLOC_STATIC ); function ___gxx_personality_v0() {} var SYSCALLS = { varargs: 0, get: ( function ( varargs ) {

		SYSCALLS.varargs += 4; var ret = HEAP32[ SYSCALLS.varargs - 4 >> 2 ]; return ret;

	} ), getStr: ( function () {

		var ret = Pointer_stringify( SYSCALLS.get() ); return ret;

	} ), get64: ( function () {

		var low = SYSCALLS.get(), high = SYSCALLS.get(); if ( low >= 0 )assert( high === 0 ); else assert( high === - 1 ); return low;

	} ), getZero: ( function () {

		assert( SYSCALLS.get() === 0 );

	} ) }; function ___syscall140( which, varargs ) {

		SYSCALLS.varargs = varargs; try {

			var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get(); var offset = offset_low; FS.llseek( stream, offset, whence ); HEAP32[ result >> 2 ] = stream.position; if ( stream.getdents && offset === 0 && whence === 0 )stream.getdents = null; return 0;

		} catch ( e ) {

			if ( typeof FS === "undefined" || ! ( e instanceof FS.ErrnoError ) )abort( e ); return - e.errno;

		}

	} function flush_NO_FILESYSTEM() {

		var fflush = Module[ "_fflush" ]; if ( fflush )fflush( 0 ); var printChar = ___syscall146.printChar; if ( ! printChar ) return; var buffers = ___syscall146.buffers; if ( buffers[ 1 ].length )printChar( 1, 10 ); if ( buffers[ 2 ].length )printChar( 2, 10 );

	} function ___syscall146( which, varargs ) {

		SYSCALLS.varargs = varargs; try {

			var stream = SYSCALLS.get(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get(); var ret = 0; if ( ! ___syscall146.buffers ) {

				___syscall146.buffers = [ null, [], []]; ___syscall146.printChar = ( function ( stream, curr ) {

					var buffer = ___syscall146.buffers[ stream ]; assert( buffer ); if ( curr === 0 || curr === 10 ) {

						( stream === 1 ? Module[ "print" ] : Module[ "printErr" ] )( UTF8ArrayToString( buffer, 0 ) ); buffer.length = 0;

					} else {

						buffer.push( curr );

					}

				} );

			} for ( var i = 0; i < iovcnt; i ++ ) {

				var ptr = HEAP32[ iov + i * 8 >> 2 ]; var len = HEAP32[ iov + ( i * 8 + 4 ) >> 2 ]; for ( var j = 0; j < len; j ++ ) {

					___syscall146.printChar( stream, HEAPU8[ ptr + j ] );

				}ret += len;

			} return ret;

		} catch ( e ) {

			if ( typeof FS === "undefined" || ! ( e instanceof FS.ErrnoError ) )abort( e ); return - e.errno;

		}

	} function ___syscall6( which, varargs ) {

		SYSCALLS.varargs = varargs; try {

			var stream = SYSCALLS.getStreamFromFD(); FS.close( stream ); return 0;

		} catch ( e ) {

			if ( typeof FS === "undefined" || ! ( e instanceof FS.ErrnoError ) )abort( e ); return - e.errno;

		}

	} function _abort() {

		Module[ "abort" ]();

	} function _llvm_trap() {

		abort( "trap!" );

	} function _emscripten_memcpy_big( dest, src, num ) {

		HEAPU8.set( HEAPU8.subarray( src, src + num ), dest ); return dest;

	} var PTHREAD_SPECIFIC = {}; function _pthread_getspecific( key ) {

		return PTHREAD_SPECIFIC[ key ] || 0;

	} var PTHREAD_SPECIFIC_NEXT_KEY = 1; var ERRNO_CODES = { EPERM: 1, ENOENT: 2, ESRCH: 3, EINTR: 4, EIO: 5, ENXIO: 6, E2BIG: 7, ENOEXEC: 8, EBADF: 9, ECHILD: 10, EAGAIN: 11, EWOULDBLOCK: 11, ENOMEM: 12, EACCES: 13, EFAULT: 14, ENOTBLK: 15, EBUSY: 16, EEXIST: 17, EXDEV: 18, ENODEV: 19, ENOTDIR: 20, EISDIR: 21, EINVAL: 22, ENFILE: 23, EMFILE: 24, ENOTTY: 25, ETXTBSY: 26, EFBIG: 27, ENOSPC: 28, ESPIPE: 29, EROFS: 30, EMLINK: 31, EPIPE: 32, EDOM: 33, ERANGE: 34, ENOMSG: 42, EIDRM: 43, ECHRNG: 44, EL2NSYNC: 45, EL3HLT: 46, EL3RST: 47, ELNRNG: 48, EUNATCH: 49, ENOCSI: 50, EL2HLT: 51, EDEADLK: 35, ENOLCK: 37, EBADE: 52, EBADR: 53, EXFULL: 54, ENOANO: 55, EBADRQC: 56, EBADSLT: 57, EDEADLOCK: 35, EBFONT: 59, ENOSTR: 60, ENODATA: 61, ETIME: 62, ENOSR: 63, ENONET: 64, ENOPKG: 65, EREMOTE: 66, ENOLINK: 67, EADV: 68, ESRMNT: 69, ECOMM: 70, EPROTO: 71, EMULTIHOP: 72, EDOTDOT: 73, EBADMSG: 74, ENOTUNIQ: 76, EBADFD: 77, EREMCHG: 78, ELIBACC: 79, ELIBBAD: 80, ELIBSCN: 81, ELIBMAX: 82, ELIBEXEC: 83, ENOSYS: 38, ENOTEMPTY: 39, ENAMETOOLONG: 36, ELOOP: 40, EOPNOTSUPP: 95, EPFNOSUPPORT: 96, ECONNRESET: 104, ENOBUFS: 105, EAFNOSUPPORT: 97, EPROTOTYPE: 91, ENOTSOCK: 88, ENOPROTOOPT: 92, ESHUTDOWN: 108, ECONNREFUSED: 111, EADDRINUSE: 98, ECONNABORTED: 103, ENETUNREACH: 101, ENETDOWN: 100, ETIMEDOUT: 110, EHOSTDOWN: 112, EHOSTUNREACH: 113, EINPROGRESS: 115, EALREADY: 114, EDESTADDRREQ: 89, EMSGSIZE: 90, EPROTONOSUPPORT: 93, ESOCKTNOSUPPORT: 94, EADDRNOTAVAIL: 99, ENETRESET: 102, EISCONN: 106, ENOTCONN: 107, ETOOMANYREFS: 109, EUSERS: 87, EDQUOT: 122, ESTALE: 116, ENOTSUP: 95, ENOMEDIUM: 123, EILSEQ: 84, EOVERFLOW: 75, ECANCELED: 125, ENOTRECOVERABLE: 131, EOWNERDEAD: 130, ESTRPIPE: 86 }; function _pthread_key_create( key, destructor ) {

		if ( key == 0 ) {

			return ERRNO_CODES.EINVAL;

		}HEAP32[ key >> 2 ] = PTHREAD_SPECIFIC_NEXT_KEY; PTHREAD_SPECIFIC[ PTHREAD_SPECIFIC_NEXT_KEY ] = 0; PTHREAD_SPECIFIC_NEXT_KEY ++; return 0;

	} function _pthread_once( ptr, func ) {

		if ( ! _pthread_once.seen )_pthread_once.seen = {}; if ( ptr in _pthread_once.seen ) return; Module[ "dynCall_v" ]( func ); _pthread_once.seen[ ptr ] = 1;

	} function _pthread_setspecific( key, value ) {

		if ( ! ( key in PTHREAD_SPECIFIC ) ) {

			return ERRNO_CODES.EINVAL;

		}PTHREAD_SPECIFIC[ key ] = value; return 0;

	} function ___setErrNo( value ) {

		if ( Module[ "___errno_location" ] )HEAP32[ Module[ "___errno_location" ]() >> 2 ] = value; return value;

	}DYNAMICTOP_PTR = staticAlloc( 4 ); STACK_BASE = STACKTOP = alignMemory( STATICTOP ); STACK_MAX = STACK_BASE + TOTAL_STACK; DYNAMIC_BASE = alignMemory( STACK_MAX ); HEAP32[ DYNAMICTOP_PTR >> 2 ] = DYNAMIC_BASE; staticSealed = true; var ASSERTIONS = false; function intArrayFromString( stringy, dontAddNull, length ) {

		var len = length > 0 ? length : lengthBytesUTF8( stringy ) + 1; var u8array = new Array( len ); var numBytesWritten = stringToUTF8Array( stringy, u8array, 0, u8array.length ); if ( dontAddNull )u8array.length = numBytesWritten; return u8array;

	} function intArrayToString( array ) {

		var ret = []; for ( var i = 0; i < array.length; i ++ ) {

			var chr = array[ i ]; if ( chr > 255 ) {

				if ( ASSERTIONS ) {

					assert( false, "Character code " + chr + " (" + String.fromCharCode( chr ) + ")  at offset " + i + " not in 0x00-0xFF." );

				}chr &= 255;

			}ret.push( String.fromCharCode( chr ) );

		} return ret.join( "" );

	} var decodeBase64 = typeof atob === "function" ? atob : ( function ( input ) {

		var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; var output = ""; var chr1, chr2, chr3; var enc1, enc2, enc3, enc4; var i = 0; input = input.replace( /[^A-Za-z0-9\+\/\=]/g, "" ); do {

			enc1 = keyStr.indexOf( input.charAt( i ++ ) ); enc2 = keyStr.indexOf( input.charAt( i ++ ) ); enc3 = keyStr.indexOf( input.charAt( i ++ ) ); enc4 = keyStr.indexOf( input.charAt( i ++ ) ); chr1 = enc1 << 2 | enc2 >> 4; chr2 = ( enc2 & 15 ) << 4 | enc3 >> 2; chr3 = ( enc3 & 3 ) << 6 | enc4; output = output + String.fromCharCode( chr1 ); if ( enc3 !== 64 ) {

				output = output + String.fromCharCode( chr2 );

			} if ( enc4 !== 64 ) {

				output = output + String.fromCharCode( chr3 );

			}

		} while ( i < input.length );return output;

	} ); function intArrayFromBase64( s ) {

		if ( typeof ENVIRONMENT_IS_NODE === "boolean" && ENVIRONMENT_IS_NODE ) {

			var buf; try {

				buf = Buffer.from( s, "base64" );

			} catch ( _ ) {

				buf = new Buffer( s, "base64" );

			} return new Uint8Array( buf.buffer, buf.byteOffset, buf.byteLength );

		} try {

			var decoded = decodeBase64( s ); var bytes = new Uint8Array( decoded.length ); for ( var i = 0; i < decoded.length; ++ i ) {

				bytes[ i ] = decoded.charCodeAt( i );

			} return bytes;

		} catch ( _ ) {

			throw new Error( "Converting base64 string to bytes failed." );

		}

	} function tryParseAsDataURI( filename ) {

		if ( ! isDataURI( filename ) ) {

			return;

		} return intArrayFromBase64( filename.slice( dataURIPrefix.length ) );

	} function invoke_ii( index, a1 ) {

		try {

			return Module[ "dynCall_ii" ]( index, a1 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_iii( index, a1, a2 ) {

		try {

			return Module[ "dynCall_iii" ]( index, a1, a2 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_iiii( index, a1, a2, a3 ) {

		try {

			return Module[ "dynCall_iiii" ]( index, a1, a2, a3 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_iiiiiii( index, a1, a2, a3, a4, a5, a6 ) {

		try {

			return Module[ "dynCall_iiiiiii" ]( index, a1, a2, a3, a4, a5, a6 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_v( index ) {

		try {

			Module[ "dynCall_v" ]( index );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_vi( index, a1 ) {

		try {

			Module[ "dynCall_vi" ]( index, a1 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_vii( index, a1, a2 ) {

		try {

			Module[ "dynCall_vii" ]( index, a1, a2 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_viii( index, a1, a2, a3 ) {

		try {

			Module[ "dynCall_viii" ]( index, a1, a2, a3 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_viiii( index, a1, a2, a3, a4 ) {

		try {

			Module[ "dynCall_viiii" ]( index, a1, a2, a3, a4 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_viiiii( index, a1, a2, a3, a4, a5 ) {

		try {

			Module[ "dynCall_viiiii" ]( index, a1, a2, a3, a4, a5 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	} function invoke_viiiiii( index, a1, a2, a3, a4, a5, a6 ) {

		try {

			Module[ "dynCall_viiiiii" ]( index, a1, a2, a3, a4, a5, a6 );

		} catch ( e ) {

			if ( typeof e !== "number" && e !== "longjmp" ) throw e; Module[ "setThrew" ]( 1, 0 );

		}

	}Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity, "byteLength": byteLength }; Module.asmLibraryArg = { "abort": abort, "assert": assert, "enlargeMemory": enlargeMemory, "getTotalMemory": getTotalMemory, "abortOnCannotGrowMemory": abortOnCannotGrowMemory, "invoke_ii": invoke_ii, "invoke_iii": invoke_iii, "invoke_iiii": invoke_iiii, "invoke_iiiiiii": invoke_iiiiiii, "invoke_v": invoke_v, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_viii": invoke_viii, "invoke_viiii": invoke_viiii, "invoke_viiiii": invoke_viiiii, "invoke_viiiiii": invoke_viiiiii, "__ZSt18uncaught_exceptionv": __ZSt18uncaught_exceptionv, "___cxa_allocate_exception": ___cxa_allocate_exception, "___cxa_begin_catch": ___cxa_begin_catch, "___cxa_find_matching_catch": ___cxa_find_matching_catch, "___cxa_pure_virtual": ___cxa_pure_virtual, "___cxa_throw": ___cxa_throw, "___gxx_personality_v0": ___gxx_personality_v0, "___resumeException": ___resumeException, "___setErrNo": ___setErrNo, "___syscall140": ___syscall140, "___syscall146": ___syscall146, "___syscall6": ___syscall6, "_abort": _abort, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_llvm_trap": _llvm_trap, "_pthread_getspecific": _pthread_getspecific, "_pthread_key_create": _pthread_key_create, "_pthread_once": _pthread_once, "_pthread_setspecific": _pthread_setspecific, "flush_NO_FILESYSTEM": flush_NO_FILESYSTEM, "DYNAMICTOP_PTR": DYNAMICTOP_PTR, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "cttz_i8": cttz_i8 };// EMSCRIPTEN_START_ASM
	var asm = ( /** @suppress {uselessCode} */ function ( global, env, buffer ) {

		"almost asm"; var a = global.Int8Array; var b = new a( buffer ); var c = global.Int16Array; var d = new c( buffer ); var e = global.Int32Array; var f = new e( buffer ); var g = global.Uint8Array; var h = new g( buffer ); var i = global.Uint16Array; var j = new i( buffer ); var k = global.Uint32Array; var l = new k( buffer ); var m = global.Float32Array; var n = new m( buffer ); var o = global.Float64Array; var p = new o( buffer ); var q = global.byteLength; var r = env.DYNAMICTOP_PTR | 0; var s = env.tempDoublePtr | 0; var t = env.ABORT | 0; var u = env.STACKTOP | 0; var v = env.STACK_MAX | 0; var w = env.cttz_i8 | 0; var x = 0; var y = 0; var z = 0; var A = 0; var B = global.NaN, C = global.Infinity; var D = 0, E = 0, F = 0, G = 0, H = 0.0; var I = 0; var J = global.Math.floor; var K = global.Math.abs; var L = global.Math.sqrt; var M = global.Math.pow; var N = global.Math.cos; var O = global.Math.sin; var P = global.Math.tan; var Q = global.Math.acos; var R = global.Math.asin; var S = global.Math.atan; var T = global.Math.atan2; var U = global.Math.exp; var V = global.Math.log; var W = global.Math.ceil; var X = global.Math.imul; var Y = global.Math.min; var Z = global.Math.max; var _ = global.Math.clz32; var $ = global.Math.fround; var aa = env.abort; var ba = env.assert; var ca = env.enlargeMemory; var da = env.getTotalMemory; var ea = env.abortOnCannotGrowMemory; var fa = env.invoke_ii; var ga = env.invoke_iii; var ha = env.invoke_iiii; var ia = env.invoke_iiiiiii; var ja = env.invoke_v; var ka = env.invoke_vi; var la = env.invoke_vii; var ma = env.invoke_viii; var na = env.invoke_viiii; var oa = env.invoke_viiiii; var pa = env.invoke_viiiiii; var qa = env.__ZSt18uncaught_exceptionv; var ra = env.___cxa_allocate_exception; var sa = env.___cxa_begin_catch; var ta = env.___cxa_find_matching_catch; var ua = env.___cxa_pure_virtual; var va = env.___cxa_throw; var wa = env.___gxx_personality_v0; var xa = env.___resumeException; var ya = env.___setErrNo; var za = env.___syscall140; var Aa = env.___syscall146; var Ba = env.___syscall6; var Ca = env._abort; var Da = env._emscripten_memcpy_big; var Ea = env._llvm_trap; var Fa = env._pthread_getspecific; var Ga = env._pthread_key_create; var Ha = env._pthread_once; var Ia = env._pthread_setspecific; var Ja = env.flush_NO_FILESYSTEM; var Ka = $( 0 ); const La = $( 0 ); function Ma( newBuffer ) {

			if ( q( newBuffer ) & 16777215 || q( newBuffer ) <= 16777215 || q( newBuffer ) > 2147483648 ) return false; b = new a( newBuffer ); d = new c( newBuffer ); f = new e( newBuffer ); h = new g( newBuffer ); j = new i( newBuffer ); l = new k( newBuffer ); n = new m( newBuffer ); p = new o( newBuffer ); buffer = newBuffer; return true;

		}
		// EMSCRIPTEN_START_FUNCS
		function Ib( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0; if ( ( b | 0 ) < 0 ) return; c = a + 12 | 0; d = f[ c >> 2 ] | 0; e = f[ a + 8 >> 2 ] | 0; g = e; h = d; if ( d - e >> 2 >>> 0 <= b >>> 0 ) return; e = g + ( b << 2 ) | 0; d = f[ ( f[ e >> 2 ] | 0 ) + 56 >> 2 ] | 0; i = f[ ( f[ g + ( b << 2 ) >> 2 ] | 0 ) + 60 >> 2 ] | 0; g = e + 4 | 0; if ( ( g | 0 ) != ( h | 0 ) ) {

				j = g; g = e; do {

					k = f[ j >> 2 ] | 0; f[ j >> 2 ] = 0; l = f[ g >> 2 ] | 0; f[ g >> 2 ] = k; if ( l | 0 ) {

						k = l + 88 | 0; m = f[ k >> 2 ] | 0; f[ k >> 2 ] = 0; if ( m | 0 ) {

							k = f[ m + 8 >> 2 ] | 0; if ( k | 0 ) {

								n = m + 12 | 0; if ( ( f[ n >> 2 ] | 0 ) != ( k | 0 ) )f[ n >> 2 ] = k; dn( k );

							}dn( m );

						}m = f[ l + 68 >> 2 ] | 0; if ( m | 0 ) {

							k = l + 72 | 0; n = f[ k >> 2 ] | 0; if ( ( n | 0 ) != ( m | 0 ) )f[ k >> 2 ] = n + ( ~ ( ( n + - 4 - m | 0 ) >>> 2 ) << 2 ); dn( m );

						}m = l + 64 | 0; n = f[ m >> 2 ] | 0; f[ m >> 2 ] = 0; if ( n | 0 ) {

							m = f[ n >> 2 ] | 0; if ( m | 0 ) {

								k = n + 4 | 0; if ( ( f[ k >> 2 ] | 0 ) != ( m | 0 ) )f[ k >> 2 ] = m; dn( m );

							}dn( n );

						}dn( l );

					}j = j + 4 | 0; g = g + 4 | 0;

				} while ( ( j | 0 ) != ( h | 0 ) );j = f[ c >> 2 ] | 0; if ( ( j | 0 ) != ( g | 0 ) ) {

					o = g; p = j; q = 24;

				}

			} else {

				o = e; p = h; q = 24;

			} if ( ( q | 0 ) == 24 ) {

				q = p; do {

					p = q + - 4 | 0; f[ c >> 2 ] = p; h = f[ p >> 2 ] | 0; f[ p >> 2 ] = 0; if ( h | 0 ) {

						p = h + 88 | 0; e = f[ p >> 2 ] | 0; f[ p >> 2 ] = 0; if ( e | 0 ) {

							p = f[ e + 8 >> 2 ] | 0; if ( p | 0 ) {

								j = e + 12 | 0; if ( ( f[ j >> 2 ] | 0 ) != ( p | 0 ) )f[ j >> 2 ] = p; dn( p );

							}dn( e );

						}e = f[ h + 68 >> 2 ] | 0; if ( e | 0 ) {

							p = h + 72 | 0; j = f[ p >> 2 ] | 0; if ( ( j | 0 ) != ( e | 0 ) )f[ p >> 2 ] = j + ( ~ ( ( j + - 4 - e | 0 ) >>> 2 ) << 2 ); dn( e );

						}e = h + 64 | 0; j = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( j | 0 ) {

							e = f[ j >> 2 ] | 0; if ( e | 0 ) {

								p = j + 4 | 0; if ( ( f[ p >> 2 ] | 0 ) != ( e | 0 ) )f[ p >> 2 ] = e; dn( e );

							}dn( j );

						}dn( h );

					}q = f[ c >> 2 ] | 0;

				} while ( ( q | 0 ) != ( o | 0 ) );

			}o = f[ a + 4 >> 2 ] | 0; a:do if ( o | 0 ) {

				q = o + 44 | 0; c = f[ q >> 2 ] | 0; h = f[ o + 40 >> 2 ] | 0; while ( 1 ) {

					if ( ( h | 0 ) == ( c | 0 ) ) break a; r = h + 4 | 0; if ( ( f[ ( f[ h >> 2 ] | 0 ) + 40 >> 2 ] | 0 ) == ( i | 0 ) ) break; else h = r;

				} if ( ( r | 0 ) != ( c | 0 ) ) {

					j = r; e = h; do {

						p = f[ j >> 2 ] | 0; f[ j >> 2 ] = 0; g = f[ e >> 2 ] | 0; f[ e >> 2 ] = p; if ( g | 0 ) {

							Cf( g ); dn( g );

						}j = j + 4 | 0; e = e + 4 | 0;

					} while ( ( j | 0 ) != ( c | 0 ) );j = f[ q >> 2 ] | 0; if ( ( j | 0 ) == ( e | 0 ) ) break; else {

						s = e; t = j;

					}

				} else {

					s = h; t = c;

				}j = t; do {

					g = j + - 4 | 0; f[ q >> 2 ] = g; p = f[ g >> 2 ] | 0; f[ g >> 2 ] = 0; if ( p | 0 ) {

						Cf( p ); dn( p );

					}j = f[ q >> 2 ] | 0;

				} while ( ( j | 0 ) != ( s | 0 ) );

			} while ( 0 );b:do if ( ( d | 0 ) < 5 ) {

				s = f[ a + 20 + ( d * 12 | 0 ) >> 2 ] | 0; t = a + 20 + ( d * 12 | 0 ) + 4 | 0; r = f[ t >> 2 ] | 0; i = r; c:do if ( ( s | 0 ) == ( r | 0 ) )u = s; else {

					o = s; while ( 1 ) {

						if ( ( f[ o >> 2 ] | 0 ) == ( b | 0 ) ) {

							u = o; break c;

						}o = o + 4 | 0; if ( ( o | 0 ) == ( r | 0 ) ) break b;

					}

				} while ( 0 );if ( ( u | 0 ) != ( r | 0 ) ) {

					s = u + 4 | 0; o = i - s | 0; j = o >> 2; if ( ! j )v = r; else {

						qi( u | 0, s | 0, o | 0 ) | 0; v = f[ t >> 2 ] | 0;

					}o = u + ( j << 2 ) | 0; if ( ( v | 0 ) != ( o | 0 ) )f[ t >> 2 ] = v + ( ~ ( ( v + - 4 - o | 0 ) >>> 2 ) << 2 );

				}

			} while ( 0 );v = f[ a + 24 >> 2 ] | 0; u = f[ a + 20 >> 2 ] | 0; d = u; if ( ( v | 0 ) != ( u | 0 ) ) {

				o = v - u >> 2; u = 0; do {

					v = d + ( u << 2 ) | 0; j = f[ v >> 2 ] | 0; if ( ( j | 0 ) > ( b | 0 ) )f[ v >> 2 ] = j + - 1; u = u + 1 | 0;

				} while ( u >>> 0 < o >>> 0 );

			}o = f[ a + 36 >> 2 ] | 0; u = f[ a + 32 >> 2 ] | 0; d = u; if ( ( o | 0 ) != ( u | 0 ) ) {

				j = o - u >> 2; u = 0; do {

					o = d + ( u << 2 ) | 0; v = f[ o >> 2 ] | 0; if ( ( v | 0 ) > ( b | 0 ) )f[ o >> 2 ] = v + - 1; u = u + 1 | 0;

				} while ( u >>> 0 < j >>> 0 );

			}j = f[ a + 48 >> 2 ] | 0; u = f[ a + 44 >> 2 ] | 0; d = u; if ( ( j | 0 ) != ( u | 0 ) ) {

				v = j - u >> 2; u = 0; do {

					j = d + ( u << 2 ) | 0; o = f[ j >> 2 ] | 0; if ( ( o | 0 ) > ( b | 0 ) )f[ j >> 2 ] = o + - 1; u = u + 1 | 0;

				} while ( u >>> 0 < v >>> 0 );

			}v = f[ a + 60 >> 2 ] | 0; u = f[ a + 56 >> 2 ] | 0; d = u; if ( ( v | 0 ) != ( u | 0 ) ) {

				o = v - u >> 2; u = 0; do {

					v = d + ( u << 2 ) | 0; j = f[ v >> 2 ] | 0; if ( ( j | 0 ) > ( b | 0 ) )f[ v >> 2 ] = j + - 1; u = u + 1 | 0;

				} while ( u >>> 0 < o >>> 0 );

			}o = f[ a + 72 >> 2 ] | 0; u = f[ a + 68 >> 2 ] | 0; a = u; if ( ( o | 0 ) == ( u | 0 ) ) return; d = o - u >> 2; u = 0; do {

				o = a + ( u << 2 ) | 0; j = f[ o >> 2 ] | 0; if ( ( j | 0 ) > ( b | 0 ) )f[ o >> 2 ] = j + - 1; u = u + 1 | 0;

			} while ( u >>> 0 < d >>> 0 );return;

		} function Jb( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0; e = u; u = u + 32 | 0; d = e + 28 | 0; h = e + 16 | 0; i = e + 8 | 0; j = e; k = a + 60 | 0; f[ a + 68 >> 2 ] = g; g = a + 56 | 0; l = f[ g >> 2 ] | 0; m = ( f[ l + 4 >> 2 ] | 0 ) - ( f[ l >> 2 ] | 0 ) | 0; n = m >> 2; f[ h >> 2 ] = 0; f[ h + 4 >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; if ( ( m | 0 ) <= 0 ) {

				u = e; return 1;

			}m = h + 4 | 0; o = h + 8 | 0; p = a + 104 | 0; q = a + 108 | 0; r = i + 4 | 0; s = a + 100 | 0; t = a + 8 | 0; v = a + 16 | 0; w = a + 32 | 0; x = a + 12 | 0; y = a + 20 | 0; a = f[ l >> 2 ] | 0; if ( ( f[ l + 4 >> 2 ] | 0 ) == ( a | 0 ) ) {

				z = l; um( z );

			} else {

				A = 0; B = a;

			} while ( 1 ) {

				f[ j >> 2 ] = f[ B + ( A << 2 ) >> 2 ]; f[ d >> 2 ] = f[ j >> 2 ]; yb( k, d, h ); a = f[ h >> 2 ] | 0; l = ( a | 0 ) > - 1 ? a : 0 - a | 0; C = f[ m >> 2 ] | 0; D = ( C | 0 ) > - 1 ? C : 0 - C | 0; E = Rj( D | 0, ( ( D | 0 ) < 0 ) << 31 >> 31 | 0, l | 0, ( ( l | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; l = f[ o >> 2 ] | 0; D = ( l | 0 ) > - 1; F = D ? l : 0 - l | 0; l = Rj( E | 0, I | 0, F | 0, ( ( F | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; F = I; if ( ( l | 0 ) == 0 & ( F | 0 ) == 0 ) {

					G = f[ p >> 2 ] | 0; H = h;

				} else {

					E = f[ p >> 2 ] | 0; J = ( ( E | 0 ) < 0 ) << 31 >> 31; K = gj( E | 0, J | 0, a | 0, ( ( a | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; a = Ug( K | 0, I | 0, l | 0, F | 0 ) | 0; f[ h >> 2 ] = a; K = gj( E | 0, J | 0, C | 0, ( ( C | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; C = Ug( K | 0, I | 0, l | 0, F | 0 ) | 0; f[ m >> 2 ] = C; F = E - ( ( a | 0 ) > - 1 ? a : 0 - a | 0 ) - ( ( C | 0 ) > - 1 ? C : 0 - C | 0 ) | 0; G = D ? F : 0 - F | 0; H = o;

				}f[ H >> 2 ] = G; F = Wg( q ) | 0; D = f[ h >> 2 ] | 0; if ( F ) {

					F = 0 - D | 0; C = 0 - ( f[ m >> 2 ] | 0 ) | 0; a = 0 - ( f[ o >> 2 ] | 0 ) | 0; f[ h >> 2 ] = F; f[ m >> 2 ] = C; f[ o >> 2 ] = a; L = F; M = C;

				} else {

					L = D; M = f[ m >> 2 ] | 0;

				} do if ( ( L | 0 ) <= - 1 ) {

					if ( ( M | 0 ) < 0 ) {

						D = f[ o >> 2 ] | 0; N = ( D | 0 ) > - 1 ? D : 0 - D | 0; O = D;

					} else {

						D = f[ o >> 2 ] | 0; N = ( f[ s >> 2 ] | 0 ) - ( ( D | 0 ) > - 1 ? D : 0 - D | 0 ) | 0; O = D;

					} if ( ( O | 0 ) < 0 ) {

						P = ( M | 0 ) > - 1 ? M : 0 - M | 0; Q = N; break;

					} else {

						P = ( f[ s >> 2 ] | 0 ) - ( ( M | 0 ) > - 1 ? M : 0 - M | 0 ) | 0; Q = N; break;

					}

				} else {

					D = f[ p >> 2 ] | 0; P = ( f[ o >> 2 ] | 0 ) + D | 0; Q = D + M | 0;

				} while ( 0 );D = ( Q | 0 ) == 0; C = ( P | 0 ) == 0; F = f[ s >> 2 ] | 0; do if ( P | Q ) {

					a = ( F | 0 ) == ( P | 0 ); if ( ! ( D & a ) ) {

						E = ( F | 0 ) == ( Q | 0 ); if ( ! ( C & E ) ) {

							if ( D ? ( l = f[ p >> 2 ] | 0, ( l | 0 ) < ( P | 0 ) ) : 0 ) {

								R = 0; S = ( l << 1 ) - P | 0; break;

							} if ( E ? ( E = f[ p >> 2 ] | 0, ( E | 0 ) > ( P | 0 ) ) : 0 ) {

								R = Q; S = ( E << 1 ) - P | 0; break;

							} if ( a ? ( a = f[ p >> 2 ] | 0, ( a | 0 ) > ( Q | 0 ) ) : 0 ) {

								R = ( a << 1 ) - Q | 0; S = P; break;

							} if ( C ) {

								a = f[ p >> 2 ] | 0; R = ( a | 0 ) < ( Q | 0 ) ? ( a << 1 ) - Q | 0 : Q; S = 0;

							} else {

								R = Q; S = P;

							}

						} else {

							R = Q; S = Q;

						}

					} else {

						R = P; S = P;

					}

				} else {

					R = F; S = F;

				} while ( 0 );f[ i >> 2 ] = R; f[ r >> 2 ] = S; F = A << 1; C = b + ( F << 2 ) | 0; D = c + ( F << 2 ) | 0; if ( ( f[ t >> 2 ] | 0 ) > 0 ) {

					F = 0; a = R; while ( 1 ) {

						E = f[ v >> 2 ] | 0; if ( ( a | 0 ) > ( E | 0 ) ) {

							l = f[ w >> 2 ] | 0; f[ l + ( F << 2 ) >> 2 ] = E; T = l;

						} else {

							l = f[ x >> 2 ] | 0; E = f[ w >> 2 ] | 0; f[ E + ( F << 2 ) >> 2 ] = ( a | 0 ) < ( l | 0 ) ? l : a; T = E;

						}E = F + 1 | 0; U = f[ t >> 2 ] | 0; if ( ( E | 0 ) >= ( U | 0 ) ) break; F = E; a = f[ i + ( E << 2 ) >> 2 ] | 0;

					} if ( ( U | 0 ) > 0 ) {

						a = 0; do {

							F = ( f[ C + ( a << 2 ) >> 2 ] | 0 ) + ( f[ T + ( a << 2 ) >> 2 ] | 0 ) | 0; E = D + ( a << 2 ) | 0; f[ E >> 2 ] = F; if ( ( F | 0 ) <= ( f[ v >> 2 ] | 0 ) ) {

								if ( ( F | 0 ) < ( f[ x >> 2 ] | 0 ) ) {

									V = ( f[ y >> 2 ] | 0 ) + F | 0; W = 44;

								}

							} else {

								V = F - ( f[ y >> 2 ] | 0 ) | 0; W = 44;

							} if ( ( W | 0 ) == 44 ) {

								W = 0; f[ E >> 2 ] = V;

							}a = a + 1 | 0;

						} while ( ( a | 0 ) < ( f[ t >> 2 ] | 0 ) );

					}

				}A = A + 1 | 0; if ( ( A | 0 ) >= ( n | 0 ) ) {

					W = 3; break;

				}a = f[ g >> 2 ] | 0; B = f[ a >> 2 ] | 0; if ( ( f[ a + 4 >> 2 ] | 0 ) - B >> 2 >>> 0 <= A >>> 0 ) {

					z = a; W = 4; break;

				}

			} if ( ( W | 0 ) == 3 ) {

				u = e; return 1;

			} else if ( ( W | 0 ) == 4 )um( z ); return 0;

		} function Kb( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0; e = u; u = u + 32 | 0; d = e + 28 | 0; h = e + 16 | 0; i = e + 8 | 0; j = e; k = a + 60 | 0; f[ a + 68 >> 2 ] = g; g = a + 56 | 0; l = f[ g >> 2 ] | 0; m = ( f[ l + 4 >> 2 ] | 0 ) - ( f[ l >> 2 ] | 0 ) | 0; n = m >> 2; f[ h >> 2 ] = 0; f[ h + 4 >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; if ( ( m | 0 ) <= 0 ) {

				u = e; return 1;

			}m = h + 4 | 0; o = h + 8 | 0; p = a + 104 | 0; q = a + 108 | 0; r = i + 4 | 0; s = a + 100 | 0; t = a + 8 | 0; v = a + 16 | 0; w = a + 32 | 0; x = a + 12 | 0; y = a + 20 | 0; a = f[ l >> 2 ] | 0; if ( ( f[ l + 4 >> 2 ] | 0 ) == ( a | 0 ) ) {

				z = l; um( z );

			} else {

				A = 0; B = a;

			} while ( 1 ) {

				f[ j >> 2 ] = f[ B + ( A << 2 ) >> 2 ]; f[ d >> 2 ] = f[ j >> 2 ]; vb( k, d, h ); a = f[ h >> 2 ] | 0; l = ( a | 0 ) > - 1 ? a : 0 - a | 0; C = f[ m >> 2 ] | 0; D = ( C | 0 ) > - 1 ? C : 0 - C | 0; E = Rj( D | 0, ( ( D | 0 ) < 0 ) << 31 >> 31 | 0, l | 0, ( ( l | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; l = f[ o >> 2 ] | 0; D = ( l | 0 ) > - 1; F = D ? l : 0 - l | 0; l = Rj( E | 0, I | 0, F | 0, ( ( F | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; F = I; if ( ( l | 0 ) == 0 & ( F | 0 ) == 0 ) {

					G = f[ p >> 2 ] | 0; H = h;

				} else {

					E = f[ p >> 2 ] | 0; J = ( ( E | 0 ) < 0 ) << 31 >> 31; K = gj( E | 0, J | 0, a | 0, ( ( a | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; a = Ug( K | 0, I | 0, l | 0, F | 0 ) | 0; f[ h >> 2 ] = a; K = gj( E | 0, J | 0, C | 0, ( ( C | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; C = Ug( K | 0, I | 0, l | 0, F | 0 ) | 0; f[ m >> 2 ] = C; F = E - ( ( a | 0 ) > - 1 ? a : 0 - a | 0 ) - ( ( C | 0 ) > - 1 ? C : 0 - C | 0 ) | 0; G = D ? F : 0 - F | 0; H = o;

				}f[ H >> 2 ] = G; F = Wg( q ) | 0; D = f[ h >> 2 ] | 0; if ( F ) {

					F = 0 - D | 0; C = 0 - ( f[ m >> 2 ] | 0 ) | 0; a = 0 - ( f[ o >> 2 ] | 0 ) | 0; f[ h >> 2 ] = F; f[ m >> 2 ] = C; f[ o >> 2 ] = a; L = F; M = C;

				} else {

					L = D; M = f[ m >> 2 ] | 0;

				} do if ( ( L | 0 ) <= - 1 ) {

					if ( ( M | 0 ) < 0 ) {

						D = f[ o >> 2 ] | 0; N = ( D | 0 ) > - 1 ? D : 0 - D | 0; O = D;

					} else {

						D = f[ o >> 2 ] | 0; N = ( f[ s >> 2 ] | 0 ) - ( ( D | 0 ) > - 1 ? D : 0 - D | 0 ) | 0; O = D;

					} if ( ( O | 0 ) < 0 ) {

						P = ( M | 0 ) > - 1 ? M : 0 - M | 0; Q = N; break;

					} else {

						P = ( f[ s >> 2 ] | 0 ) - ( ( M | 0 ) > - 1 ? M : 0 - M | 0 ) | 0; Q = N; break;

					}

				} else {

					D = f[ p >> 2 ] | 0; P = ( f[ o >> 2 ] | 0 ) + D | 0; Q = D + M | 0;

				} while ( 0 );D = ( Q | 0 ) == 0; C = ( P | 0 ) == 0; F = f[ s >> 2 ] | 0; do if ( P | Q ) {

					a = ( F | 0 ) == ( P | 0 ); if ( ! ( D & a ) ) {

						E = ( F | 0 ) == ( Q | 0 ); if ( ! ( C & E ) ) {

							if ( D ? ( l = f[ p >> 2 ] | 0, ( l | 0 ) < ( P | 0 ) ) : 0 ) {

								R = 0; S = ( l << 1 ) - P | 0; break;

							} if ( E ? ( E = f[ p >> 2 ] | 0, ( E | 0 ) > ( P | 0 ) ) : 0 ) {

								R = Q; S = ( E << 1 ) - P | 0; break;

							} if ( a ? ( a = f[ p >> 2 ] | 0, ( a | 0 ) > ( Q | 0 ) ) : 0 ) {

								R = ( a << 1 ) - Q | 0; S = P; break;

							} if ( C ) {

								a = f[ p >> 2 ] | 0; R = ( a | 0 ) < ( Q | 0 ) ? ( a << 1 ) - Q | 0 : Q; S = 0;

							} else {

								R = Q; S = P;

							}

						} else {

							R = Q; S = Q;

						}

					} else {

						R = P; S = P;

					}

				} else {

					R = F; S = F;

				} while ( 0 );f[ i >> 2 ] = R; f[ r >> 2 ] = S; F = A << 1; C = b + ( F << 2 ) | 0; D = c + ( F << 2 ) | 0; if ( ( f[ t >> 2 ] | 0 ) > 0 ) {

					F = 0; a = R; while ( 1 ) {

						E = f[ v >> 2 ] | 0; if ( ( a | 0 ) > ( E | 0 ) ) {

							l = f[ w >> 2 ] | 0; f[ l + ( F << 2 ) >> 2 ] = E; T = l;

						} else {

							l = f[ x >> 2 ] | 0; E = f[ w >> 2 ] | 0; f[ E + ( F << 2 ) >> 2 ] = ( a | 0 ) < ( l | 0 ) ? l : a; T = E;

						}E = F + 1 | 0; U = f[ t >> 2 ] | 0; if ( ( E | 0 ) >= ( U | 0 ) ) break; F = E; a = f[ i + ( E << 2 ) >> 2 ] | 0;

					} if ( ( U | 0 ) > 0 ) {

						a = 0; do {

							F = ( f[ C + ( a << 2 ) >> 2 ] | 0 ) + ( f[ T + ( a << 2 ) >> 2 ] | 0 ) | 0; E = D + ( a << 2 ) | 0; f[ E >> 2 ] = F; if ( ( F | 0 ) <= ( f[ v >> 2 ] | 0 ) ) {

								if ( ( F | 0 ) < ( f[ x >> 2 ] | 0 ) ) {

									V = ( f[ y >> 2 ] | 0 ) + F | 0; W = 44;

								}

							} else {

								V = F - ( f[ y >> 2 ] | 0 ) | 0; W = 44;

							} if ( ( W | 0 ) == 44 ) {

								W = 0; f[ E >> 2 ] = V;

							}a = a + 1 | 0;

						} while ( ( a | 0 ) < ( f[ t >> 2 ] | 0 ) );

					}

				}A = A + 1 | 0; if ( ( A | 0 ) >= ( n | 0 ) ) {

					W = 3; break;

				}a = f[ g >> 2 ] | 0; B = f[ a >> 2 ] | 0; if ( ( f[ a + 4 >> 2 ] | 0 ) - B >> 2 >>> 0 <= A >>> 0 ) {

					z = a; W = 4; break;

				}

			} if ( ( W | 0 ) == 3 ) {

				u = e; return 1;

			} else if ( ( W | 0 ) == 4 )um( z ); return 0;

		} function Lb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0; e = u; u = u + 16 | 0; g = e + 8 | 0; h = e + 4 | 0; i = e; j = a + 64 | 0; k = f[ j >> 2 ] | 0; if ( ( f[ k + 28 >> 2 ] | 0 ) == ( f[ k + 24 >> 2 ] | 0 ) ) {

				u = e; return;

			}l = c + 96 | 0; c = a + 52 | 0; m = d + 84 | 0; n = d + 68 | 0; d = a + 56 | 0; o = a + 60 | 0; p = a + 12 | 0; q = a + 28 | 0; r = a + 40 | 0; s = a + 44 | 0; t = a + 48 | 0; v = 0; w = 0; x = k; while ( 1 ) {

				k = f[ ( f[ x + 24 >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; if ( ( k | 0 ) == - 1 ) {

					y = v; z = x;

				} else {

					A = v + 1 | 0; B = f[ ( f[ l >> 2 ] | 0 ) + ( ( ( k | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( k | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; if ( ! ( b[ m >> 0 ] | 0 ) )C = f[ ( f[ n >> 2 ] | 0 ) + ( B << 2 ) >> 2 ] | 0; else C = B; f[ g >> 2 ] = C; B = f[ d >> 2 ] | 0; if ( B >>> 0 < ( f[ o >> 2 ] | 0 ) >>> 0 ) {

						f[ B >> 2 ] = C; f[ d >> 2 ] = B + 4;

					} else xf( c, g ); f[ g >> 2 ] = k; f[ h >> 2 ] = 0; a:do if ( ! ( f[ ( f[ p >> 2 ] | 0 ) + ( w >>> 5 << 2 ) >> 2 ] & 1 << ( w & 31 ) ) )D = k; else {

						B = k + 1 | 0; E = ( ( B >>> 0 ) % 3 | 0 | 0 ) == 0 ? k + - 2 | 0 : B; if ( ( ( E | 0 ) != - 1 ? ( f[ ( f[ a >> 2 ] | 0 ) + ( E >>> 5 << 2 ) >> 2 ] & 1 << ( E & 31 ) | 0 ) == 0 : 0 ) ? ( B = f[ ( f[ ( f[ j >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( E << 2 ) >> 2 ] | 0, E = B + 1 | 0, ( B | 0 ) != - 1 ) : 0 ) {

							F = ( ( E >>> 0 ) % 3 | 0 | 0 ) == 0 ? B + - 2 | 0 : E; f[ h >> 2 ] = F; if ( ( F | 0 ) == - 1 ) {

								D = k; break;

							} else G = F; while ( 1 ) {

								f[ g >> 2 ] = G; F = G + 1 | 0; E = ( ( F >>> 0 ) % 3 | 0 | 0 ) == 0 ? G + - 2 | 0 : F; if ( ( E | 0 ) == - 1 ) break; if ( f[ ( f[ a >> 2 ] | 0 ) + ( E >>> 5 << 2 ) >> 2 ] & 1 << ( E & 31 ) | 0 ) break; F = f[ ( f[ ( f[ j >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( E << 2 ) >> 2 ] | 0; E = F + 1 | 0; if ( ( F | 0 ) == - 1 ) break; B = ( ( E >>> 0 ) % 3 | 0 | 0 ) == 0 ? F + - 2 | 0 : E; f[ h >> 2 ] = B; if ( ( B | 0 ) == - 1 ) {

									D = G; break a;

								} else G = B;

							}f[ h >> 2 ] = - 1; D = G; break;

						}f[ h >> 2 ] = - 1; D = k;

					} while ( 0 );f[ ( f[ q >> 2 ] | 0 ) + ( D << 2 ) >> 2 ] = v; k = f[ s >> 2 ] | 0; if ( ( k | 0 ) == ( f[ t >> 2 ] | 0 ) )xf( r, g ); else {

						f[ k >> 2 ] = f[ g >> 2 ]; f[ s >> 2 ] = k + 4;

					}k = f[ j >> 2 ] | 0; B = f[ g >> 2 ] | 0; b:do if ( ( ( B | 0 ) != - 1 ? ( E = ( ( ( B >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + B | 0, ( E | 0 ) != - 1 ) : 0 ) ? ( F = f[ ( f[ k + 12 >> 2 ] | 0 ) + ( E << 2 ) >> 2 ] | 0, ( F | 0 ) != - 1 ) : 0 ) {

						E = F + ( ( ( F >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; f[ h >> 2 ] = E; if ( ( E | 0 ) != - 1 & ( E | 0 ) != ( B | 0 ) ) {

							F = A; H = v; I = E; while ( 1 ) {

								E = I + 1 | 0; J = ( ( E >>> 0 ) % 3 | 0 | 0 ) == 0 ? I + - 2 | 0 : E; do if ( f[ ( f[ a >> 2 ] | 0 ) + ( J >>> 5 << 2 ) >> 2 ] & 1 << ( J & 31 ) ) {

									E = F + 1 | 0; K = f[ ( f[ l >> 2 ] | 0 ) + ( ( ( I | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( I | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; if ( ! ( b[ m >> 0 ] | 0 ) )L = f[ ( f[ n >> 2 ] | 0 ) + ( K << 2 ) >> 2 ] | 0; else L = K; f[ i >> 2 ] = L; K = f[ d >> 2 ] | 0; if ( K >>> 0 < ( f[ o >> 2 ] | 0 ) >>> 0 ) {

										f[ K >> 2 ] = L; f[ d >> 2 ] = K + 4;

									} else xf( c, i ); K = f[ s >> 2 ] | 0; if ( ( K | 0 ) == ( f[ t >> 2 ] | 0 ) ) {

										xf( r, h ); M = E; N = F; break;

									} else {

										f[ K >> 2 ] = f[ h >> 2 ]; f[ s >> 2 ] = K + 4; M = E; N = F; break;

									}

								} else {

									M = F; N = H;

								} while ( 0 );f[ ( f[ q >> 2 ] | 0 ) + ( f[ h >> 2 ] << 2 ) >> 2 ] = N; O = f[ j >> 2 ] | 0; J = f[ h >> 2 ] | 0; if ( ( J | 0 ) == - 1 ) break; E = ( ( ( J >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + J | 0; if ( ( E | 0 ) == - 1 ) break; J = f[ ( f[ O + 12 >> 2 ] | 0 ) + ( E << 2 ) >> 2 ] | 0; if ( ( J | 0 ) == - 1 ) break; I = J + ( ( ( J >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; f[ h >> 2 ] = I; if ( ! ( ( I | 0 ) != - 1 ? ( I | 0 ) != ( f[ g >> 2 ] | 0 ) : 0 ) ) {

									P = M; Q = O; break b;

								} else {

									F = M; H = N;

								}

							}f[ h >> 2 ] = - 1; P = M; Q = O;

						} else {

							P = A; Q = k;

						}

					} else R = 28; while ( 0 );if ( ( R | 0 ) == 28 ) {

						R = 0; f[ h >> 2 ] = - 1; P = A; Q = k;

					}y = P; z = Q;

				}w = w + 1 | 0; if ( w >>> 0 >= ( f[ z + 28 >> 2 ] | 0 ) - ( f[ z + 24 >> 2 ] | 0 ) >> 2 >>> 0 ) break; else {

					v = y; x = z;

				}

			}u = e; return;

		} function Mb( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0; e = u; u = u + 48 | 0; d = e + 32 | 0; h = e + 24 | 0; i = e + 16 | 0; j = e; k = e + 12 | 0; l = a + 8 | 0; m = f[ l >> 2 ] | 0; if ( ( m + - 2 | 0 ) >>> 0 <= 28 ) {

				f[ a + 72 >> 2 ] = m; n = 1 << m; f[ a + 76 >> 2 ] = n + - 1; m = n + - 2 | 0; f[ a + 80 >> 2 ] = m; f[ a + 84 >> 2 ] = ( m | 0 ) / 2 | 0;

			}m = a + 40 | 0; f[ a + 48 >> 2 ] = g; g = a + 36 | 0; n = f[ g >> 2 ] | 0; o = ( f[ n + 4 >> 2 ] | 0 ) - ( f[ n >> 2 ] | 0 ) | 0; p = o >> 2; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; if ( ( o | 0 ) <= 0 ) {

				u = e; return 1;

			}o = j + 4 | 0; q = j + 8 | 0; r = a + 84 | 0; s = a + 88 | 0; t = a + 80 | 0; a = h + 4 | 0; v = i + 4 | 0; w = d + 4 | 0; x = f[ n >> 2 ] | 0; if ( ( f[ n + 4 >> 2 ] | 0 ) == ( x | 0 ) ) {

				y = n; um( y );

			} else {

				z = 0; A = x;

			} while ( 1 ) {

				f[ k >> 2 ] = f[ A + ( z << 2 ) >> 2 ]; f[ d >> 2 ] = f[ k >> 2 ]; yb( m, d, j ); x = f[ j >> 2 ] | 0; n = ( x | 0 ) > - 1 ? x : 0 - x | 0; B = f[ o >> 2 ] | 0; C = ( B | 0 ) > - 1 ? B : 0 - B | 0; D = Rj( C | 0, ( ( C | 0 ) < 0 ) << 31 >> 31 | 0, n | 0, ( ( n | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; n = f[ q >> 2 ] | 0; C = ( n | 0 ) > - 1; E = C ? n : 0 - n | 0; n = Rj( D | 0, I | 0, E | 0, ( ( E | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; E = I; if ( ( n | 0 ) == 0 & ( E | 0 ) == 0 ) {

					F = f[ r >> 2 ] | 0; G = j;

				} else {

					D = f[ r >> 2 ] | 0; H = ( ( D | 0 ) < 0 ) << 31 >> 31; J = gj( D | 0, H | 0, x | 0, ( ( x | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; x = Ug( J | 0, I | 0, n | 0, E | 0 ) | 0; f[ j >> 2 ] = x; J = gj( D | 0, H | 0, B | 0, ( ( B | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; B = Ug( J | 0, I | 0, n | 0, E | 0 ) | 0; f[ o >> 2 ] = B; E = D - ( ( x | 0 ) > - 1 ? x : 0 - x | 0 ) - ( ( B | 0 ) > - 1 ? B : 0 - B | 0 ) | 0; F = C ? E : 0 - E | 0; G = q;

				}f[ G >> 2 ] = F; E = Wg( s ) | 0; C = f[ j >> 2 ] | 0; if ( E ) {

					E = 0 - C | 0; B = 0 - ( f[ o >> 2 ] | 0 ) | 0; x = 0 - ( f[ q >> 2 ] | 0 ) | 0; f[ j >> 2 ] = E; f[ o >> 2 ] = B; f[ q >> 2 ] = x; K = E; L = B;

				} else {

					K = C; L = f[ o >> 2 ] | 0;

				} do if ( ( K | 0 ) <= - 1 ) {

					if ( ( L | 0 ) < 0 ) {

						C = f[ q >> 2 ] | 0; M = ( C | 0 ) > - 1 ? C : 0 - C | 0; N = C;

					} else {

						C = f[ q >> 2 ] | 0; M = ( f[ t >> 2 ] | 0 ) - ( ( C | 0 ) > - 1 ? C : 0 - C | 0 ) | 0; N = C;

					} if ( ( N | 0 ) < 0 ) {

						O = ( L | 0 ) > - 1 ? L : 0 - L | 0; P = M; break;

					} else {

						O = ( f[ t >> 2 ] | 0 ) - ( ( L | 0 ) > - 1 ? L : 0 - L | 0 ) | 0; P = M; break;

					}

				} else {

					C = f[ r >> 2 ] | 0; O = ( f[ q >> 2 ] | 0 ) + C | 0; P = C + L | 0;

				} while ( 0 );C = ( P | 0 ) == 0; B = ( O | 0 ) == 0; E = f[ t >> 2 ] | 0; do if ( O | P ) {

					x = ( E | 0 ) == ( O | 0 ); if ( ! ( C & x ) ) {

						D = ( E | 0 ) == ( P | 0 ); if ( ! ( B & D ) ) {

							if ( C ? ( n = f[ r >> 2 ] | 0, ( n | 0 ) < ( O | 0 ) ) : 0 ) {

								Q = 0; R = ( n << 1 ) - O | 0; break;

							} if ( D ? ( D = f[ r >> 2 ] | 0, ( D | 0 ) > ( O | 0 ) ) : 0 ) {

								Q = P; R = ( D << 1 ) - O | 0; break;

							} if ( x ? ( x = f[ r >> 2 ] | 0, ( x | 0 ) > ( P | 0 ) ) : 0 ) {

								Q = ( x << 1 ) - P | 0; R = O; break;

							} if ( B ) {

								x = f[ r >> 2 ] | 0; Q = ( x | 0 ) < ( P | 0 ) ? ( x << 1 ) - P | 0 : P; R = 0;

							} else {

								Q = P; R = O;

							}

						} else {

							Q = P; R = P;

						}

					} else {

						Q = O; R = O;

					}

				} else {

					Q = E; R = E;

				} while ( 0 );E = z << 1; B = b + ( E << 2 ) | 0; C = c + ( E << 2 ) | 0; E = f[ B >> 2 ] | 0; x = f[ B + 4 >> 2 ] | 0; f[ h >> 2 ] = Q; f[ a >> 2 ] = R; f[ i >> 2 ] = E; f[ v >> 2 ] = x; ec( d, l, h, i ); f[ C >> 2 ] = f[ d >> 2 ]; f[ C + 4 >> 2 ] = f[ w >> 2 ]; z = z + 1 | 0; if ( ( z | 0 ) >= ( p | 0 ) ) {

					S = 5; break;

				}C = f[ g >> 2 ] | 0; A = f[ C >> 2 ] | 0; if ( ( f[ C + 4 >> 2 ] | 0 ) - A >> 2 >>> 0 <= z >>> 0 ) {

					y = C; S = 6; break;

				}

			} if ( ( S | 0 ) == 5 ) {

				u = e; return 1;

			} else if ( ( S | 0 ) == 6 )um( y ); return 0;

		} function Nb( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0; e = u; u = u + 48 | 0; d = e + 32 | 0; h = e + 24 | 0; i = e + 16 | 0; j = e; k = e + 12 | 0; l = a + 8 | 0; m = f[ l >> 2 ] | 0; if ( ( m + - 2 | 0 ) >>> 0 <= 28 ) {

				f[ a + 72 >> 2 ] = m; n = 1 << m; f[ a + 76 >> 2 ] = n + - 1; m = n + - 2 | 0; f[ a + 80 >> 2 ] = m; f[ a + 84 >> 2 ] = ( m | 0 ) / 2 | 0;

			}m = a + 40 | 0; f[ a + 48 >> 2 ] = g; g = a + 36 | 0; n = f[ g >> 2 ] | 0; o = ( f[ n + 4 >> 2 ] | 0 ) - ( f[ n >> 2 ] | 0 ) | 0; p = o >> 2; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; if ( ( o | 0 ) <= 0 ) {

				u = e; return 1;

			}o = j + 4 | 0; q = j + 8 | 0; r = a + 84 | 0; s = a + 88 | 0; t = a + 80 | 0; a = h + 4 | 0; v = i + 4 | 0; w = d + 4 | 0; x = f[ n >> 2 ] | 0; if ( ( f[ n + 4 >> 2 ] | 0 ) == ( x | 0 ) ) {

				y = n; um( y );

			} else {

				z = 0; A = x;

			} while ( 1 ) {

				f[ k >> 2 ] = f[ A + ( z << 2 ) >> 2 ]; f[ d >> 2 ] = f[ k >> 2 ]; vb( m, d, j ); x = f[ j >> 2 ] | 0; n = ( x | 0 ) > - 1 ? x : 0 - x | 0; B = f[ o >> 2 ] | 0; C = ( B | 0 ) > - 1 ? B : 0 - B | 0; D = Rj( C | 0, ( ( C | 0 ) < 0 ) << 31 >> 31 | 0, n | 0, ( ( n | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; n = f[ q >> 2 ] | 0; C = ( n | 0 ) > - 1; E = C ? n : 0 - n | 0; n = Rj( D | 0, I | 0, E | 0, ( ( E | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; E = I; if ( ( n | 0 ) == 0 & ( E | 0 ) == 0 ) {

					F = f[ r >> 2 ] | 0; G = j;

				} else {

					D = f[ r >> 2 ] | 0; H = ( ( D | 0 ) < 0 ) << 31 >> 31; J = gj( D | 0, H | 0, x | 0, ( ( x | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; x = Ug( J | 0, I | 0, n | 0, E | 0 ) | 0; f[ j >> 2 ] = x; J = gj( D | 0, H | 0, B | 0, ( ( B | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; B = Ug( J | 0, I | 0, n | 0, E | 0 ) | 0; f[ o >> 2 ] = B; E = D - ( ( x | 0 ) > - 1 ? x : 0 - x | 0 ) - ( ( B | 0 ) > - 1 ? B : 0 - B | 0 ) | 0; F = C ? E : 0 - E | 0; G = q;

				}f[ G >> 2 ] = F; E = Wg( s ) | 0; C = f[ j >> 2 ] | 0; if ( E ) {

					E = 0 - C | 0; B = 0 - ( f[ o >> 2 ] | 0 ) | 0; x = 0 - ( f[ q >> 2 ] | 0 ) | 0; f[ j >> 2 ] = E; f[ o >> 2 ] = B; f[ q >> 2 ] = x; K = E; L = B;

				} else {

					K = C; L = f[ o >> 2 ] | 0;

				} do if ( ( K | 0 ) <= - 1 ) {

					if ( ( L | 0 ) < 0 ) {

						C = f[ q >> 2 ] | 0; M = ( C | 0 ) > - 1 ? C : 0 - C | 0; N = C;

					} else {

						C = f[ q >> 2 ] | 0; M = ( f[ t >> 2 ] | 0 ) - ( ( C | 0 ) > - 1 ? C : 0 - C | 0 ) | 0; N = C;

					} if ( ( N | 0 ) < 0 ) {

						O = ( L | 0 ) > - 1 ? L : 0 - L | 0; P = M; break;

					} else {

						O = ( f[ t >> 2 ] | 0 ) - ( ( L | 0 ) > - 1 ? L : 0 - L | 0 ) | 0; P = M; break;

					}

				} else {

					C = f[ r >> 2 ] | 0; O = ( f[ q >> 2 ] | 0 ) + C | 0; P = C + L | 0;

				} while ( 0 );C = ( P | 0 ) == 0; B = ( O | 0 ) == 0; E = f[ t >> 2 ] | 0; do if ( O | P ) {

					x = ( E | 0 ) == ( O | 0 ); if ( ! ( C & x ) ) {

						D = ( E | 0 ) == ( P | 0 ); if ( ! ( B & D ) ) {

							if ( C ? ( n = f[ r >> 2 ] | 0, ( n | 0 ) < ( O | 0 ) ) : 0 ) {

								Q = 0; R = ( n << 1 ) - O | 0; break;

							} if ( D ? ( D = f[ r >> 2 ] | 0, ( D | 0 ) > ( O | 0 ) ) : 0 ) {

								Q = P; R = ( D << 1 ) - O | 0; break;

							} if ( x ? ( x = f[ r >> 2 ] | 0, ( x | 0 ) > ( P | 0 ) ) : 0 ) {

								Q = ( x << 1 ) - P | 0; R = O; break;

							} if ( B ) {

								x = f[ r >> 2 ] | 0; Q = ( x | 0 ) < ( P | 0 ) ? ( x << 1 ) - P | 0 : P; R = 0;

							} else {

								Q = P; R = O;

							}

						} else {

							Q = P; R = P;

						}

					} else {

						Q = O; R = O;

					}

				} else {

					Q = E; R = E;

				} while ( 0 );E = z << 1; B = b + ( E << 2 ) | 0; C = c + ( E << 2 ) | 0; E = f[ B >> 2 ] | 0; x = f[ B + 4 >> 2 ] | 0; f[ h >> 2 ] = Q; f[ a >> 2 ] = R; f[ i >> 2 ] = E; f[ v >> 2 ] = x; ec( d, l, h, i ); f[ C >> 2 ] = f[ d >> 2 ]; f[ C + 4 >> 2 ] = f[ w >> 2 ]; z = z + 1 | 0; if ( ( z | 0 ) >= ( p | 0 ) ) {

					S = 5; break;

				}C = f[ g >> 2 ] | 0; A = f[ C >> 2 ] | 0; if ( ( f[ C + 4 >> 2 ] | 0 ) - A >> 2 >>> 0 <= z >>> 0 ) {

					y = C; S = 6; break;

				}

			} if ( ( S | 0 ) == 5 ) {

				u = e; return 1;

			} else if ( ( S | 0 ) == 6 )um( y ); return 0;

		} function Ob( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0; d = u; u = u + 16 | 0; e = d + 12 | 0; g = d; h = d + 8 | 0; i = d + 4 | 0; j = a + 8 + ( b * 12 | 0 ) | 0; k = f[ j >> 2 ] | 0; l = a + 8 + ( b * 12 | 0 ) + 4 | 0; m = f[ l >> 2 ] | 0; if ( ( m | 0 ) != ( k | 0 ) )f[ l >> 2 ] = m + ( ~ ( ( m + - 4 - k | 0 ) >>> 2 ) << 2 ); k = f[ c >> 2 ] | 0; m = a + 4 | 0; f[ g >> 2 ] = ( k | 0 ) == - 1 ? - 1 : ( k >>> 0 ) / 3 | 0; n = a + 56 | 0; o = a + 8 + ( b * 12 | 0 ) + 8 | 0; p = 0; q = f[ g >> 2 ] | 0; r = k; while ( 1 ) {

				s = ( f[ n >> 2 ] | 0 ) + ( q >>> 5 << 2 ) | 0; t = 1 << ( q & 31 ); v = f[ s >> 2 ] | 0; if ( t & v | 0 ) break; f[ s >> 2 ] = v | t; t = f[ l >> 2 ] | 0; if ( ( t | 0 ) == ( f[ o >> 2 ] | 0 ) )xf( j, g ); else {

					f[ t >> 2 ] = f[ g >> 2 ]; f[ l >> 2 ] = t + 4;

				}t = p + 1 | 0; if ( ( p | 0 ) > 0 ) {

					v = ( r | 0 ) == - 1; do if ( ! ( t & 1 ) ) if ( ! v ) if ( ! ( ( r >>> 0 ) % 3 | 0 ) ) {

						w = r + 2 | 0; break;

					} else {

						w = r + - 1 | 0; break;

					} else w = - 1; else {

						s = r + 1 | 0; if ( v )w = - 1; else w = ( ( s >>> 0 ) % 3 | 0 | 0 ) == 0 ? r + - 2 | 0 : s;

					} while ( 0 );f[ c >> 2 ] = w; x = w;

				} else x = r; f[ i >> 2 ] = x; f[ e >> 2 ] = f[ i >> 2 ]; v = Od( a, e ) | 0; f[ c >> 2 ] = v; if ( ( v | 0 ) == - 1 ) break; s = ( v >>> 0 ) / 3 | 0; f[ g >> 2 ] = s; p = t; q = s; r = v;

			}r = ( k | 0 ) == - 1; do if ( ! r ) if ( ! ( ( k >>> 0 ) % 3 | 0 ) ) {

				y = k + 2 | 0; break;

			} else {

				y = k + - 1 | 0; break;

			} else y = - 1; while ( 0 );f[ h >> 2 ] = y; f[ e >> 2 ] = f[ h >> 2 ]; do if ( ( Od( a, e ) | 0 ) == - 1 )z = k; else {

				h = k + 1 | 0; if ( ! r ) {

					y = ( ( h >>> 0 ) % 3 | 0 | 0 ) == 0 ? k + - 2 | 0 : h; f[ c >> 2 ] = y; h = f[ m >> 2 ] | 0; q = y + 1 | 0; if ( ( ( y | 0 ) != - 1 ? ( p = ( ( q >>> 0 ) % 3 | 0 | 0 ) == 0 ? y + - 2 | 0 : q, ( p | 0 ) != - 1 ) : 0 ) ? ( q = f[ ( f[ h + 12 >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] | 0, p = q + 1 | 0, ( q | 0 ) != - 1 ) : 0 ) {

						h = ( ( p >>> 0 ) % 3 | 0 | 0 ) == 0 ? q + - 2 | 0 : p; f[ c >> 2 ] = h; if ( ( h | 0 ) == - 1 ) {

							z = k; break;

						} else {

							A = h; B = 0; C = k;

						} while ( 1 ) {

							h = ( A >>> 0 ) / 3 | 0; f[ g >> 2 ] = h; p = ( f[ n >> 2 ] | 0 ) + ( h >>> 5 << 2 ) | 0; q = 1 << ( h & 31 ); h = f[ p >> 2 ] | 0; if ( q & h | 0 ) {

								D = B; E = C; break;

							}f[ p >> 2 ] = h | q; q = f[ l >> 2 ] | 0; if ( ( q | 0 ) == ( f[ o >> 2 ] | 0 ) )xf( j, g ); else {

								f[ q >> 2 ] = f[ g >> 2 ]; f[ l >> 2 ] = q + 4;

							}q = B + 1 | 0; if ( ( B | 0 ) > 0 ) {

								h = ( A | 0 ) == - 1; do if ( ! ( q & 1 ) ) if ( ! h ) if ( ! ( ( A >>> 0 ) % 3 | 0 ) ) {

									F = A + 2 | 0; G = A; break;

								} else {

									F = A + - 1 | 0; G = A; break;

								} else {

									F = - 1; G = A;

								} else {

									p = A + 1 | 0; if ( h ) {

										F = - 1; G = C;

									} else {

										F = ( ( p >>> 0 ) % 3 | 0 | 0 ) == 0 ? A + - 2 | 0 : p; G = C;

									}

								} while ( 0 );f[ c >> 2 ] = F; H = G; I = F;

							} else {

								H = C; I = A;

							}f[ i >> 2 ] = I; f[ e >> 2 ] = f[ i >> 2 ]; A = Od( a, e ) | 0; f[ c >> 2 ] = A; if ( ( A | 0 ) == - 1 ) {

								D = q; E = H; break;

							} else {

								B = q; C = H;

							}

						} if ( ! ( D & 1 ) ) {

							z = E; break;

						}t = f[ l >> 2 ] | 0; h = f[ t + - 4 >> 2 ] | 0; p = ( f[ n >> 2 ] | 0 ) + ( h >>> 5 << 2 ) | 0; f[ p >> 2 ] = f[ p >> 2 ] & ~ ( 1 << ( h & 31 ) ); f[ l >> 2 ] = t + - 4; z = E; break;

					} else J = k;

				} else {

					f[ c >> 2 ] = - 1; J = - 1;

				}f[ c >> 2 ] = - 1; z = J;

			} while ( 0 );f[ a + 44 + ( b << 2 ) >> 2 ] = z; z = f[ l >> 2 ] | 0; l = f[ j >> 2 ] | 0; j = l; if ( ( z | 0 ) == ( l | 0 ) ) {

				u = d; return;

			}b = f[ n >> 2 ] | 0; n = z - l >> 2; l = 0; do {

				z = f[ j + ( l << 2 ) >> 2 ] | 0; a = b + ( z >>> 5 << 2 ) | 0; f[ a >> 2 ] = f[ a >> 2 ] & ~ ( 1 << ( z & 31 ) ); l = l + 1 | 0;

			} while ( l >>> 0 < n >>> 0 );u = d; return;

		} function Pb( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0; c = u; u = u + 16 | 0; b = c + 8 | 0; d = c + 4 | 0; e = c; g = a + 64 | 0; h = f[ g >> 2 ] | 0; if ( ( f[ h + 28 >> 2 ] | 0 ) == ( f[ h + 24 >> 2 ] | 0 ) ) {

				u = c; return;

			}i = a + 52 | 0; j = a + 56 | 0; k = a + 60 | 0; l = a + 12 | 0; m = a + 28 | 0; n = a + 40 | 0; o = a + 44 | 0; p = a + 48 | 0; q = 0; r = 0; s = h; while ( 1 ) {

				h = f[ ( f[ s + 24 >> 2 ] | 0 ) + ( r << 2 ) >> 2 ] | 0; if ( ( h | 0 ) == - 1 ) {

					t = q; v = s;

				} else {

					w = q + 1 | 0; f[ b >> 2 ] = q; x = f[ j >> 2 ] | 0; if ( ( x | 0 ) == ( f[ k >> 2 ] | 0 ) )xf( i, b ); else {

						f[ x >> 2 ] = q; f[ j >> 2 ] = x + 4;

					}f[ d >> 2 ] = h; f[ e >> 2 ] = 0; a:do if ( ! ( f[ ( f[ l >> 2 ] | 0 ) + ( r >>> 5 << 2 ) >> 2 ] & 1 << ( r & 31 ) ) )y = h; else {

						x = h + 1 | 0; z = ( ( x >>> 0 ) % 3 | 0 | 0 ) == 0 ? h + - 2 | 0 : x; if ( ( ( z | 0 ) != - 1 ? ( f[ ( f[ a >> 2 ] | 0 ) + ( z >>> 5 << 2 ) >> 2 ] & 1 << ( z & 31 ) | 0 ) == 0 : 0 ) ? ( x = f[ ( f[ ( f[ g >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0, z = x + 1 | 0, ( x | 0 ) != - 1 ) : 0 ) {

							A = ( ( z >>> 0 ) % 3 | 0 | 0 ) == 0 ? x + - 2 | 0 : z; f[ e >> 2 ] = A; if ( ( A | 0 ) == - 1 ) {

								y = h; break;

							} else B = A; while ( 1 ) {

								f[ d >> 2 ] = B; A = B + 1 | 0; z = ( ( A >>> 0 ) % 3 | 0 | 0 ) == 0 ? B + - 2 | 0 : A; if ( ( z | 0 ) == - 1 ) break; if ( f[ ( f[ a >> 2 ] | 0 ) + ( z >>> 5 << 2 ) >> 2 ] & 1 << ( z & 31 ) | 0 ) break; A = f[ ( f[ ( f[ g >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0; z = A + 1 | 0; if ( ( A | 0 ) == - 1 ) break; x = ( ( z >>> 0 ) % 3 | 0 | 0 ) == 0 ? A + - 2 | 0 : z; f[ e >> 2 ] = x; if ( ( x | 0 ) == - 1 ) {

									y = B; break a;

								} else B = x;

							}f[ e >> 2 ] = - 1; y = B; break;

						}f[ e >> 2 ] = - 1; y = h;

					} while ( 0 );f[ ( f[ m >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] = f[ b >> 2 ]; h = f[ o >> 2 ] | 0; if ( ( h | 0 ) == ( f[ p >> 2 ] | 0 ) )xf( n, d ); else {

						f[ h >> 2 ] = f[ d >> 2 ]; f[ o >> 2 ] = h + 4;

					}h = f[ g >> 2 ] | 0; x = f[ d >> 2 ] | 0; b:do if ( ( ( x | 0 ) != - 1 ? ( z = ( ( ( x >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + x | 0, ( z | 0 ) != - 1 ) : 0 ) ? ( A = f[ ( f[ h + 12 >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0, ( A | 0 ) != - 1 ) : 0 ) {

						z = A + ( ( ( A >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; f[ e >> 2 ] = z; if ( ( z | 0 ) != - 1 & ( z | 0 ) != ( x | 0 ) ) {

							A = w; C = z; while ( 1 ) {

								z = C + 1 | 0; D = ( ( z >>> 0 ) % 3 | 0 | 0 ) == 0 ? C + - 2 | 0 : z; do if ( f[ ( f[ a >> 2 ] | 0 ) + ( D >>> 5 << 2 ) >> 2 ] & 1 << ( D & 31 ) ) {

									z = A + 1 | 0; f[ b >> 2 ] = A; E = f[ j >> 2 ] | 0; if ( ( E | 0 ) == ( f[ k >> 2 ] | 0 ) )xf( i, b ); else {

										f[ E >> 2 ] = A; f[ j >> 2 ] = E + 4;

									}E = f[ o >> 2 ] | 0; if ( ( E | 0 ) == ( f[ p >> 2 ] | 0 ) ) {

										xf( n, e ); F = z; break;

									} else {

										f[ E >> 2 ] = f[ e >> 2 ]; f[ o >> 2 ] = E + 4; F = z; break;

									}

								} else F = A; while ( 0 );f[ ( f[ m >> 2 ] | 0 ) + ( f[ e >> 2 ] << 2 ) >> 2 ] = f[ b >> 2 ]; G = f[ g >> 2 ] | 0; D = f[ e >> 2 ] | 0; if ( ( D | 0 ) == - 1 ) break; z = ( ( ( D >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + D | 0; if ( ( z | 0 ) == - 1 ) break; D = f[ ( f[ G + 12 >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0; if ( ( D | 0 ) == - 1 ) break; C = D + ( ( ( D >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; f[ e >> 2 ] = C; if ( ! ( ( C | 0 ) != - 1 ? ( C | 0 ) != ( f[ d >> 2 ] | 0 ) : 0 ) ) {

									H = F; I = G; break b;

								} else A = F;

							}f[ e >> 2 ] = - 1; H = F; I = G;

						} else {

							H = w; I = h;

						}

					} else J = 26; while ( 0 );if ( ( J | 0 ) == 26 ) {

						J = 0; f[ e >> 2 ] = - 1; H = w; I = h;

					}t = H; v = I;

				}r = r + 1 | 0; if ( r >>> 0 >= ( f[ v + 28 >> 2 ] | 0 ) - ( f[ v + 24 >> 2 ] | 0 ) >> 2 >>> 0 ) break; else {

					q = t; s = v;

				}

			}u = c; return;

		} function Qb( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0; d = u; u = u + 80 | 0; e = d + 76 | 0; g = d; h = d + 72 | 0; i = d + 64 | 0; j = d + 68 | 0; if ( ! ( dg( e, c ) | 0 ) ) {

				k = 0; u = d; return k | 0;

			}l = f[ e >> 2 ] | 0; if ( ! l ) {

				k = 0; u = d; return k | 0;

			}m = a + 4 | 0; n = a + 8 | 0; o = f[ n >> 2 ] | 0; p = f[ m >> 2 ] | 0; q = o - p >> 2; r = p; p = o; if ( l >>> 0 > q >>> 0 ) {

				ff( m, l - q | 0 ); if ( ! ( f[ e >> 2 ] | 0 ) ) {

					k = 1; u = d; return k | 0;

				}

			} else if ( l >>> 0 < q >>> 0 ? ( q = r + ( l << 2 ) | 0, ( q | 0 ) != ( p | 0 ) ) : 0 )f[ n >> 2 ] = p + ( ~ ( ( p + - 4 - q | 0 ) >>> 2 ) << 2 ); q = f[ a + 32 >> 2 ] | 0; p = c + 8 | 0; n = c + 16 | 0; l = g + 60 | 0; r = q + 8 | 0; o = a + 16 | 0; s = a + 20 | 0; a = 0; while ( 1 ) {

				t = p; v = f[ t >> 2 ] | 0; w = f[ t + 4 >> 2 ] | 0; t = n; x = f[ t >> 2 ] | 0; y = f[ t + 4 >> 2 ] | 0; if ( ! ( ( w | 0 ) > ( y | 0 ) | ( w | 0 ) == ( y | 0 ) & v >>> 0 > x >>> 0 ) ) {

					k = 0; z = 40; break;

				}t = f[ c >> 2 ] | 0; A = b[ t + x >> 0 ] | 0; B = Rj( x | 0, y | 0, 1, 0 ) | 0; C = I; D = n; f[ D >> 2 ] = B; f[ D + 4 >> 2 ] = C; if ( ! ( ( w | 0 ) > ( C | 0 ) | ( w | 0 ) == ( C | 0 ) & v >>> 0 > B >>> 0 ) ) {

					k = 0; z = 40; break;

				}C = b[ t + B >> 0 ] | 0; B = Rj( x | 0, y | 0, 2, 0 ) | 0; D = I; E = n; f[ E >> 2 ] = B; f[ E + 4 >> 2 ] = D; if ( ! ( ( w | 0 ) > ( D | 0 ) | ( w | 0 ) == ( D | 0 ) & v >>> 0 > B >>> 0 ) ) {

					k = 0; z = 40; break;

				}D = b[ t + B >> 0 ] | 0; B = Rj( x | 0, y | 0, 3, 0 ) | 0; E = I; F = n; f[ F >> 2 ] = B; f[ F + 4 >> 2 ] = E; if ( ! ( ( w | 0 ) > ( E | 0 ) | ( w | 0 ) == ( E | 0 ) & v >>> 0 > B >>> 0 ) ) {

					k = 0; z = 40; break;

				}v = b[ t + B >> 0 ] | 0; B = Rj( x | 0, y | 0, 4, 0 ) | 0; y = n; f[ y >> 2 ] = B; f[ y + 4 >> 2 ] = I; y = C & 255; if ( ( C + - 1 & 255 ) > 10 ) {

					k = 0; z = 40; break;

				}Qh( g ); C = X( ai( y ) | 0, D & 255 ) | 0; jg( g, A & 255, 0, D, y, v << 24 >> 24 != 0, C, ( ( C | 0 ) < 0 ) << 31 >> 31, 0, 0 ); dg( h, c ) | 0; f[ l >> 2 ] = f[ h >> 2 ]; C = bj( 96 ) | 0; Eh( C, g ); f[ i >> 2 ] = C; C = oe( q, i ) | 0; v = f[ i >> 2 ] | 0; f[ i >> 2 ] = 0; if ( v | 0 ) {

					y = v + 88 | 0; D = f[ y >> 2 ] | 0; f[ y >> 2 ] = 0; if ( D | 0 ) {

						y = f[ D + 8 >> 2 ] | 0; if ( y | 0 ) {

							A = D + 12 | 0; if ( ( f[ A >> 2 ] | 0 ) != ( y | 0 ) )f[ A >> 2 ] = y; dn( y );

						}dn( D );

					}D = f[ v + 68 >> 2 ] | 0; if ( D | 0 ) {

						y = v + 72 | 0; A = f[ y >> 2 ] | 0; if ( ( A | 0 ) != ( D | 0 ) )f[ y >> 2 ] = A + ( ~ ( ( A + - 4 - D | 0 ) >>> 2 ) << 2 ); dn( D );

					}D = v + 64 | 0; A = f[ D >> 2 ] | 0; f[ D >> 2 ] = 0; if ( A | 0 ) {

						D = f[ A >> 2 ] | 0; if ( D | 0 ) {

							y = A + 4 | 0; if ( ( f[ y >> 2 ] | 0 ) != ( D | 0 ) )f[ y >> 2 ] = D; dn( D );

						}dn( A );

					}dn( v );

				}f[ ( f[ ( f[ r >> 2 ] | 0 ) + ( C << 2 ) >> 2 ] | 0 ) + 60 >> 2 ] = f[ h >> 2 ]; f[ ( f[ m >> 2 ] | 0 ) + ( a << 2 ) >> 2 ] = C; v = f[ s >> 2 ] | 0; A = f[ o >> 2 ] | 0; D = v - A >> 2; y = A; if ( ( C | 0 ) < ( D | 0 ) )G = y; else {

					A = C + 1 | 0; f[ j >> 2 ] = - 1; B = v; if ( A >>> 0 <= D >>> 0 ) if ( A >>> 0 < D >>> 0 ? ( v = y + ( A << 2 ) | 0, ( v | 0 ) != ( B | 0 ) ) : 0 ) {

						f[ s >> 2 ] = B + ( ~ ( ( B + - 4 - v | 0 ) >>> 2 ) << 2 ); H = y;

					} else H = y; else {

						Ae( o, A - D | 0, j ); H = f[ o >> 2 ] | 0;

					}G = H;

				}f[ G + ( C << 2 ) >> 2 ] = a; a = a + 1 | 0; if ( a >>> 0 >= ( f[ e >> 2 ] | 0 ) >>> 0 ) {

					k = 1; z = 40; break;

				}

			} if ( ( z | 0 ) == 40 ) {

				u = d; return k | 0;

			} return 0;

		} function Rb( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0; d = a + 4 | 0; if ( ! c ) {

				e = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( e | 0 )dn( e ); f[ d >> 2 ] = 0; return;

			} if ( c >>> 0 > 1073741823 ) {

				e = ra( 8 ) | 0; Yk( e, 9789 ); f[ e >> 2 ] = 3704; va( e | 0, 856, 80 );

			}e = bj( c << 2 ) | 0; g = f[ a >> 2 ] | 0; f[ a >> 2 ] = e; if ( g | 0 )dn( g ); f[ d >> 2 ] = c; d = 0; do {

				f[ ( f[ a >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] = 0; d = d + 1 | 0;

			} while ( ( d | 0 ) != ( c | 0 ) );d = a + 8 | 0; g = f[ d >> 2 ] | 0; if ( ! g ) return; e = f[ g + 4 >> 2 ] | 0; h = c + - 1 | 0; i = ( h & c | 0 ) == 0; if ( ! i ) if ( e >>> 0 < c >>> 0 )j = e; else j = ( e >>> 0 ) % ( c >>> 0 ) | 0; else j = e & h; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = d; d = f[ g >> 2 ] | 0; if ( ! d ) return; else {

				k = j; l = g; m = d; n = g;

			}a:while ( 1 ) {

				g = l; d = m; j = n; b:while ( 1 ) {

					o = d; while ( 1 ) {

						e = f[ o + 4 >> 2 ] | 0; if ( ! i ) if ( e >>> 0 < c >>> 0 )p = e; else p = ( e >>> 0 ) % ( c >>> 0 ) | 0; else p = e & h; if ( ( p | 0 ) == ( k | 0 ) ) break; q = ( f[ a >> 2 ] | 0 ) + ( p << 2 ) | 0; if ( ! ( f[ q >> 2 ] | 0 ) ) break b; e = f[ o >> 2 ] | 0; c:do if ( ! e )r = o; else {

							s = o + 8 | 0; t = b[ s + 11 >> 0 ] | 0; u = t << 24 >> 24 < 0; v = t & 255; t = u ? f[ o + 12 >> 2 ] | 0 : v; w = ( t | 0 ) == 0; if ( u ) {

								u = o; x = e; while ( 1 ) {

									y = x + 8 | 0; z = b[ y + 11 >> 0 ] | 0; A = z << 24 >> 24 < 0; if ( ( t | 0 ) != ( ( A ? f[ x + 12 >> 2 ] | 0 : z & 255 ) | 0 ) ) {

										r = u; break c;

									} if ( ! w ? jh( f[ s >> 2 ] | 0, A ? f[ y >> 2 ] | 0 : y, t ) | 0 : 0 ) {

										r = u; break c;

									}y = f[ x >> 2 ] | 0; if ( ! y ) {

										r = x; break c;

									} else {

										A = x; x = y; u = A;

									}

								}

							} if ( w ) {

								u = o; x = e; while ( 1 ) {

									A = b[ x + 8 + 11 >> 0 ] | 0; if ( ( A << 24 >> 24 < 0 ? f[ x + 12 >> 2 ] | 0 : A & 255 ) | 0 ) {

										r = u; break c;

									}A = f[ x >> 2 ] | 0; if ( ! A ) {

										r = x; break c;

									} else {

										y = x; x = A; u = y;

									}

								}

							}u = o; x = e; while ( 1 ) {

								w = x + 8 | 0; y = b[ w + 11 >> 0 ] | 0; A = y << 24 >> 24 < 0; if ( ( t | 0 ) != ( ( A ? f[ x + 12 >> 2 ] | 0 : y & 255 ) | 0 ) ) {

									r = u; break c;

								}y = A ? f[ w >> 2 ] | 0 : w; if ( ( b[ y >> 0 ] | 0 ) == ( f[ s >> 2 ] & 255 ) << 24 >> 24 ) {

									B = s; C = v; D = y;

								} else {

									r = u; break c;

								} while ( 1 ) {

									C = C + - 1 | 0; B = B + 1 | 0; if ( ! C ) break; D = D + 1 | 0; if ( ( b[ B >> 0 ] | 0 ) != ( b[ D >> 0 ] | 0 ) ) {

										r = u; break c;

									}

								}y = f[ x >> 2 ] | 0; if ( ! y ) {

									r = x; break;

								} else {

									w = x; x = y; u = w;

								}

							}

						} while ( 0 );f[ j >> 2 ] = f[ r >> 2 ]; f[ r >> 2 ] = f[ f[ ( f[ a >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] >> 2 ]; f[ f[ ( f[ a >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] >> 2 ] = o; e = f[ g >> 2 ] | 0; if ( ! e ) {

							E = 43; break a;

						} else o = e;

					}d = f[ o >> 2 ] | 0; if ( ! d ) {

						E = 43; break a;

					} else {

						g = o; j = o;

					}

				}f[ q >> 2 ] = j; m = f[ o >> 2 ] | 0; if ( ! m ) {

					E = 43; break;

				} else {

					k = p; l = o; n = o;

				}

			} if ( ( E | 0 ) == 43 ) return;

		} function Sb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0; e = Na[ f[ ( f[ a >> 2 ] | 0 ) + 44 >> 2 ] & 127 ]( a ) | 0; if ( ( e | 0 ) < 1 ) {

				g = 0; return g | 0;

			}h = ( f[ c + 4 >> 2 ] | 0 ) - ( f[ c >> 2 ] | 0 ) >> 2; i = X( h, e ) | 0; _d( a, h, e ); h = a + 16 | 0; j = f[ h >> 2 ] | 0; k = ( f[ f[ j >> 2 ] >> 2 ] | 0 ) + ( f[ j + 48 >> 2 ] | 0 ) | 0; j = d + 8 | 0; l = j; m = f[ l >> 2 ] | 0; n = f[ l + 4 >> 2 ] | 0; l = d + 16 | 0; o = l; p = f[ o >> 2 ] | 0; q = f[ o + 4 >> 2 ] | 0; if ( ! ( ( n | 0 ) > ( q | 0 ) | ( n | 0 ) == ( q | 0 ) & m >>> 0 > p >>> 0 ) ) {

				g = 0; return g | 0;

			}o = f[ d >> 2 ] | 0; r = b[ o + p >> 0 ] | 0; s = Rj( p | 0, q | 0, 1, 0 ) | 0; t = I; u = l; f[ u >> 2 ] = s; f[ u + 4 >> 2 ] = t; a:do if ( ! ( r << 24 >> 24 ) ) {

				if ( ! ( ( n | 0 ) > ( t | 0 ) | ( n | 0 ) == ( t | 0 ) & m >>> 0 > s >>> 0 ) ) {

					g = 0; return g | 0;

				}u = b[ o + s >> 0 ] | 0; v = Rj( p | 0, q | 0, 2, 0 ) | 0; w = l; f[ w >> 2 ] = v; f[ w + 4 >> 2 ] = I; w = u & 255; v = ( ai( 5 ) | 0 ) == ( w | 0 ); x = f[ ( f[ h >> 2 ] | 0 ) + 64 >> 2 ] | 0; y = ( f[ x + 4 >> 2 ] | 0 ) - ( f[ x >> 2 ] | 0 ) | 0; if ( v ) {

					v = i << 2; if ( y >>> 0 < v >>> 0 ) {

						g = 0; return g | 0;

					}x = j; z = f[ x >> 2 ] | 0; A = f[ x + 4 >> 2 ] | 0; x = l; B = f[ x >> 2 ] | 0; C = Rj( B | 0, f[ x + 4 >> 2 ] | 0, v | 0, 0 ) | 0; x = I; if ( ( A | 0 ) < ( x | 0 ) | ( A | 0 ) == ( x | 0 ) & z >>> 0 < C >>> 0 ) {

						g = 0; return g | 0;

					} else {

						ge( k | 0, ( f[ d >> 2 ] | 0 ) + B | 0, v | 0 ) | 0; B = l; C = Rj( f[ B >> 2 ] | 0, f[ B + 4 >> 2 ] | 0, v | 0, 0 ) | 0; v = l; f[ v >> 2 ] = C; f[ v + 4 >> 2 ] = I; D = 18; break;

					}

				}v = X( i, w ) | 0; if ( y >>> 0 < v >>> 0 ) {

					g = 0; return g | 0;

				}y = j; C = f[ y >> 2 ] | 0; B = f[ y + 4 >> 2 ] | 0; y = l; z = f[ y >> 2 ] | 0; x = f[ y + 4 >> 2 ] | 0; y = Tj( C | 0, B | 0, z | 0, x | 0 ) | 0; A = I; if ( ( A | 0 ) < 0 | ( A | 0 ) == 0 & y >>> 0 < v >>> 0 ) {

					g = 0; return g | 0;

				} if ( ! i )D = 19; else {

					v = u & 255; u = 0; y = z; z = x; x = B; B = C; while ( 1 ) {

						C = Rj( y | 0, z | 0, v | 0, 0 ) | 0; A = I; if ( ( x | 0 ) < ( A | 0 ) | ( x | 0 ) == ( A | 0 ) & B >>> 0 < C >>> 0 ) {

							E = y; F = z;

						} else {

							ge( k + ( u << 2 ) | 0, ( f[ d >> 2 ] | 0 ) + y | 0, w | 0 ) | 0; C = l; A = Rj( f[ C >> 2 ] | 0, f[ C + 4 >> 2 ] | 0, v | 0, 0 ) | 0; C = I; G = l; f[ G >> 2 ] = A; f[ G + 4 >> 2 ] = C; E = A; F = C;

						}C = u + 1 | 0; if ( ( C | 0 ) == ( i | 0 ) ) {

							D = 18; break a;

						}A = j; u = C; y = E; z = F; x = f[ A + 4 >> 2 ] | 0; B = f[ A >> 2 ] | 0;

					}

				}

			} else if ( Qf( i, e, d, k ) | 0 )D = 18; else {

				g = 0; return g | 0;

			} while ( 0 );do if ( ( D | 0 ) == 18 ) if ( ! i )D = 19; else {

				F = a + 20 | 0; E = f[ F >> 2 ] | 0; if ( E | 0 ? Na[ f[ ( f[ E >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( E ) | 0 : 0 ) {

					H = F; J = 1; break;

				}ui( k, i, k ); H = F; J = 1;

			} while ( 0 );if ( ( D | 0 ) == 19 ) {

				H = a + 20 | 0; J = 0;

			}a = f[ H >> 2 ] | 0; if ( a | 0 ) {

				if ( ! ( Oa[ f[ ( f[ a >> 2 ] | 0 ) + 40 >> 2 ] & 127 ]( a, d ) | 0 ) ) {

					g = 0; return g | 0;

				} if ( J ? ( J = f[ H >> 2 ] | 0, ! ( Qa[ f[ ( f[ J >> 2 ] | 0 ) + 44 >> 2 ] & 15 ]( J, k, k, i, e, f[ c >> 2 ] | 0 ) | 0 ) ) : 0 ) {

					g = 0; return g | 0;

				}

			}g = 1; return g | 0;

		} function Tb( a, c, e, g, h ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; h = h | 0; var i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; i = u; u = u + 32 | 0; j = i + 12 | 0; k = i; f[ c + 40 >> 2 ] = e; e = c + 32 | 0; f[ e >> 2 ] = g; f[ c + 4 >> 2 ] = h; Hb( a, g, j ); if ( f[ a >> 2 ] | 0 ) {

				u = i; return;

			}g = a + 4 | 0; h = g + 11 | 0; if ( ( b[ h >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); l = b[ j + 7 >> 0 ] | 0; if ( ( Na[ f[ ( f[ c >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( c ) | 0 ) != ( l & 255 | 0 ) ) {

				m = bj( 64 ) | 0; f[ k >> 2 ] = m; f[ k + 8 >> 2 ] = - 2147483584; f[ k + 4 >> 2 ] = 50; n = m; o = 9577; p = n + 50 | 0; do {

					b[ n >> 0 ] = b[ o >> 0 ] | 0; n = n + 1 | 0; o = o + 1 | 0;

				} while ( ( n | 0 ) < ( p | 0 ) );b[ m + 50 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( g, k ); if ( ( b[ k + 11 >> 0 ] | 0 ) < 0 )dn( f[ k >> 2 ] | 0 ); u = i; return;

			}m = b[ j + 5 >> 0 ] | 0; b[ c + 36 >> 0 ] = m; q = b[ j + 6 >> 0 ] | 0; b[ c + 37 >> 0 ] = q; if ( ( m + - 1 & 255 ) > 1 ) {

				r = bj( 32 ) | 0; f[ k >> 2 ] = r; f[ k + 8 >> 2 ] = - 2147483616; f[ k + 4 >> 2 ] = 22; n = r; o = 9628; p = n + 22 | 0; do {

					b[ n >> 0 ] = b[ o >> 0 ] | 0; n = n + 1 | 0; o = o + 1 | 0;

				} while ( ( n | 0 ) < ( p | 0 ) );b[ r + 22 >> 0 ] = 0; f[ a >> 2 ] = - 5; Rf( g, k ); if ( ( b[ k + 11 >> 0 ] | 0 ) < 0 )dn( f[ k >> 2 ] | 0 ); u = i; return;

			}r = q & 255; if ( m << 24 >> 24 == 2 & ( l << 24 >> 24 == 0 ? 3 : 2 ) >>> 0 < r >>> 0 ) {

				l = bj( 32 ) | 0; f[ k >> 2 ] = l; f[ k + 8 >> 2 ] = - 2147483616; f[ k + 4 >> 2 ] = 22; n = l; o = 9651; p = n + 22 | 0; do {

					b[ n >> 0 ] = b[ o >> 0 ] | 0; n = n + 1 | 0; o = o + 1 | 0;

				} while ( ( n | 0 ) < ( p | 0 ) );b[ l + 22 >> 0 ] = 0; f[ a >> 2 ] = - 5; Rf( g, k ); if ( ( b[ k + 11 >> 0 ] | 0 ) < 0 )dn( f[ k >> 2 ] | 0 ); u = i; return;

			}l = ( ( m & 255 ) << 8 | r ) & 65535; d[ ( f[ e >> 2 ] | 0 ) + 38 >> 1 ] = l; if ( ( l & 65535 ) > 258 ? ( d[ j + 10 >> 1 ] | 0 ) < 0 : 0 ) {

				Yc( a, c ); if ( f[ a >> 2 ] | 0 ) {

					u = i; return;

				} if ( ( b[ h >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 );

			} if ( ! ( Na[ f[ ( f[ c >> 2 ] | 0 ) + 12 >> 2 ] & 127 ]( c ) | 0 ) ) {

				h = bj( 48 ) | 0; f[ k >> 2 ] = h; f[ k + 8 >> 2 ] = - 2147483600; f[ k + 4 >> 2 ] = 33; n = h; o = 9674; p = n + 33 | 0; do {

					b[ n >> 0 ] = b[ o >> 0 ] | 0; n = n + 1 | 0; o = o + 1 | 0;

				} while ( ( n | 0 ) < ( p | 0 ) );b[ h + 33 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( g, k ); if ( ( b[ k + 11 >> 0 ] | 0 ) < 0 )dn( f[ k >> 2 ] | 0 ); u = i; return;

			} if ( ! ( Na[ f[ ( f[ c >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( c ) | 0 ) ) {

				h = bj( 32 ) | 0; f[ k >> 2 ] = h; f[ k + 8 >> 2 ] = - 2147483616; f[ k + 4 >> 2 ] = 31; n = h; o = 9708; p = n + 31 | 0; do {

					b[ n >> 0 ] = b[ o >> 0 ] | 0; n = n + 1 | 0; o = o + 1 | 0;

				} while ( ( n | 0 ) < ( p | 0 ) );b[ h + 31 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( g, k ); if ( ( b[ k + 11 >> 0 ] | 0 ) < 0 )dn( f[ k >> 2 ] | 0 ); u = i; return;

			} if ( Na[ f[ ( f[ c >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( c ) | 0 ) {

				f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; u = i; return;

			}c = bj( 48 ) | 0; f[ k >> 2 ] = c; f[ k + 8 >> 2 ] = - 2147483600; f[ k + 4 >> 2 ] = 34; n = c; o = 9740; p = n + 34 | 0; do {

				b[ n >> 0 ] = b[ o >> 0 ] | 0; n = n + 1 | 0; o = o + 1 | 0;

			} while ( ( n | 0 ) < ( p | 0 ) );b[ c + 34 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( g, k ); if ( ( b[ k + 11 >> 0 ] | 0 ) < 0 )dn( f[ k >> 2 ] | 0 ); u = i; return;

		} function Ub( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0; c = u; u = u + 48 | 0; d = c + 32 | 0; e = c + 28 | 0; g = c + 16 | 0; h = c; i = a + 16 | 0; j = f[ i >> 2 ] | 0; if ( j | 0 ) {

				k = f[ b >> 2 ] | 0; l = i; m = j; a:while ( 1 ) {

					j = m; while ( 1 ) {

						if ( ( f[ j + 16 >> 2 ] | 0 ) >= ( k | 0 ) ) break; n = f[ j + 4 >> 2 ] | 0; if ( ! n ) {

							o = l; break a;

						} else j = n;

					}m = f[ j >> 2 ] | 0; if ( ! m ) {

						o = j; break;

					} else l = j;

				} if ( ( o | 0 ) != ( i | 0 ) ? ( k | 0 ) >= ( f[ o + 16 >> 2 ] | 0 ) : 0 ) {

					p = o; q = p + 20 | 0; u = c; return q | 0;

				}

			}Gl( g ); f[ h >> 2 ] = f[ b >> 2 ]; b = h + 4 | 0; f[ h + 8 >> 2 ] = 0; o = h + 12 | 0; f[ o >> 2 ] = 0; k = h + 8 | 0; f[ b >> 2 ] = k; l = f[ g >> 2 ] | 0; m = g + 4 | 0; if ( ( l | 0 ) != ( m | 0 ) ) {

				n = k; r = l; while ( 1 ) {

					l = r + 16 | 0; f[ e >> 2 ] = n; f[ d >> 2 ] = f[ e >> 2 ]; ke( b, d, l, l ) | 0; l = f[ r + 4 >> 2 ] | 0; if ( ! l ) {

						s = r + 8 | 0; t = f[ s >> 2 ] | 0; if ( ( f[ t >> 2 ] | 0 ) == ( r | 0 ) )v = t; else {

							t = s; do {

								s = f[ t >> 2 ] | 0; t = s + 8 | 0; w = f[ t >> 2 ] | 0;

							} while ( ( f[ w >> 2 ] | 0 ) != ( s | 0 ) );v = w;

						}

					} else {

						t = l; while ( 1 ) {

							j = f[ t >> 2 ] | 0; if ( ! j ) break; else t = j;

						}v = t;

					} if ( ( v | 0 ) == ( m | 0 ) ) break; else r = v;

				}

			}v = a + 12 | 0; r = f[ i >> 2 ] | 0; do if ( r ) {

				d = f[ h >> 2 ] | 0; e = a + 16 | 0; n = r; while ( 1 ) {

					l = f[ n + 16 >> 2 ] | 0; if ( ( d | 0 ) < ( l | 0 ) ) {

						j = f[ n >> 2 ] | 0; if ( ! j ) {

							x = 23; break;

						} else {

							y = n; z = j;

						}

					} else {

						if ( ( l | 0 ) >= ( d | 0 ) ) {

							x = 27; break;

						}A = n + 4 | 0; l = f[ A >> 2 ] | 0; if ( ! l ) {

							x = 26; break;

						} else {

							y = A; z = l;

						}

					}e = y; n = z;

				} if ( ( x | 0 ) == 23 ) {

					B = n; C = n; break;

				} else if ( ( x | 0 ) == 26 ) {

					B = n; C = A; break;

				} else if ( ( x | 0 ) == 27 ) {

					B = n; C = e; break;

				}

			} else {

				B = i; C = i;

			} while ( 0 );i = f[ C >> 2 ] | 0; if ( ! i ) {

				x = bj( 32 ) | 0; f[ x + 16 >> 2 ] = f[ h >> 2 ]; A = x + 20 | 0; f[ A >> 2 ] = f[ b >> 2 ]; z = x + 24 | 0; y = f[ h + 8 >> 2 ] | 0; f[ z >> 2 ] = y; r = f[ o >> 2 ] | 0; f[ x + 28 >> 2 ] = r; if ( ! r )f[ A >> 2 ] = z; else {

					f[ y + 8 >> 2 ] = z; f[ b >> 2 ] = k; f[ k >> 2 ] = 0; f[ o >> 2 ] = 0;

				}f[ x >> 2 ] = 0; f[ x + 4 >> 2 ] = 0; f[ x + 8 >> 2 ] = B; f[ C >> 2 ] = x; B = f[ f[ v >> 2 ] >> 2 ] | 0; if ( ! B )D = x; else {

					f[ v >> 2 ] = B; D = f[ C >> 2 ] | 0;

				}Lc( f[ a + 16 >> 2 ] | 0, D ); D = a + 20 | 0; f[ D >> 2 ] = ( f[ D >> 2 ] | 0 ) + 1; E = x;

			} else E = i; eg( h + 4 | 0, f[ k >> 2 ] | 0 ); eg( g, f[ m >> 2 ] | 0 ); p = E; q = p + 20 | 0; u = c; return q | 0;

		} function Vb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; e = u; u = u + 64 | 0; g = e; i = e + 8 | 0; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Qc( i, c ) | 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ? ( f[ i + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					l = 0; break;

				} if ( Ff( g, c ) | 0 ? ( k = g, m = f[ k >> 2 ] | 0, n = f[ k + 4 >> 2 ] | 0, k = c + 8 | 0, o = c + 16 | 0, p = o, q = f[ p >> 2 ] | 0, r = f[ p + 4 >> 2 ] | 0, p = Tj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, q | 0, r | 0 ) | 0, k = I, ! ( n >>> 0 > k >>> 0 | ( n | 0 ) == ( k | 0 ) & m >>> 0 > p >>> 0 ) ) : 0 ) {

					p = ( f[ c >> 2 ] | 0 ) + q | 0; k = Rj( q | 0, r | 0, m | 0, n | 0 ) | 0; n = o; f[ n >> 2 ] = k; f[ n + 4 >> 2 ] = I; b:do if ( ( m | 0 ) >= 1 ) {

						f[ i + 40 >> 2 ] = p; n = m + - 1 | 0; k = p + n | 0; switch ( ( h[ k >> 0 ] | 0 ) >>> 6 & 3 ) {

							case 0: {

								f[ i + 44 >> 2 ] = n; s = n; t = b[ k >> 0 ] & 63; break;

							} case 1: {

								if ( ( m | 0 ) < 2 ) break b; k = m + - 2 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 2 | 0; s = k; t = ( h[ n + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ n >> 0 ] | 0 ); break;

							} case 2: {

								if ( ( m | 0 ) < 3 ) break b; n = m + - 3 | 0; f[ i + 44 >> 2 ] = n; k = p + m + - 3 | 0; s = n; t = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

							} case 3: {

								k = m + - 4 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 4 | 0; s = k; t = ( h[ n + 2 >> 0 ] | 0 ) << 16 | ( h[ n + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ n + 1 >> 0 ] | 0 ) << 8 | ( h[ n >> 0 ] | 0 ); break;

							} default: {}

						}n = i + 48 | 0; k = t + 4194304 | 0; f[ n >> 2 ] = k; o = k >>> 0 > 1073741823; if ( o | j ) {

							l = o ^ 1; break a;

						}o = i + 44 | 0; r = i + 16 | 0; q = i + 28 | 0; v = 0; w = s; x = k; while ( 1 ) {

							c:do if ( x >>> 0 < 4194304 ) {

								k = w; y = x; while ( 1 ) {

									if ( ( k | 0 ) <= 0 ) {

										z = k; A = y; break c;

									}B = k + - 1 | 0; f[ o >> 2 ] = B; C = y << 8 | ( h[ p + B >> 0 ] | 0 ); f[ n >> 2 ] = C; if ( C >>> 0 < 4194304 ) {

										k = B; y = C;

									} else {

										z = B; A = C; break;

									}

								}

							} else {

								z = w; A = x;

							} while ( 0 );y = A & 1048575; k = f[ ( f[ r >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0; C = f[ q >> 2 ] | 0; x = ( X( f[ C + ( k << 3 ) >> 2 ] | 0, A >>> 20 ) | 0 ) + y - ( f[ C + ( k << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ n >> 2 ] = x; f[ d + ( v << 2 ) >> 2 ] = k; v = v + 1 | 0; if ( ( v | 0 ) == ( a | 0 ) ) {

								l = 1; break a;

							} else w = z;

						}

					} while ( 0 );l = 0; break;

				}l = 0;

			} else l = 0; while ( 0 );z = f[ i + 28 >> 2 ] | 0; if ( z | 0 ) {

				a = i + 32 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( z | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 8 - z | 0 ) >>> 3 ) << 3 ); dn( z );

			}z = f[ i + 16 >> 2 ] | 0; if ( z | 0 ) {

				d = i + 20 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( z | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z );

			}z = f[ i >> 2 ] | 0; if ( ! z ) {

				u = e; return l | 0;

			}a = i + 4 | 0; i = f[ a >> 2 ] | 0; if ( ( i | 0 ) != ( z | 0 ) )f[ a >> 2 ] = i + ( ~ ( ( i + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z ); u = e; return l | 0;

		} function Wb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; e = u; u = u + 64 | 0; g = e; i = e + 8 | 0; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Rc( i, c ) | 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ? ( f[ i + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					l = 0; break;

				} if ( Ff( g, c ) | 0 ? ( k = g, m = f[ k >> 2 ] | 0, n = f[ k + 4 >> 2 ] | 0, k = c + 8 | 0, o = c + 16 | 0, p = o, q = f[ p >> 2 ] | 0, r = f[ p + 4 >> 2 ] | 0, p = Tj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, q | 0, r | 0 ) | 0, k = I, ! ( n >>> 0 > k >>> 0 | ( n | 0 ) == ( k | 0 ) & m >>> 0 > p >>> 0 ) ) : 0 ) {

					p = ( f[ c >> 2 ] | 0 ) + q | 0; k = Rj( q | 0, r | 0, m | 0, n | 0 ) | 0; n = o; f[ n >> 2 ] = k; f[ n + 4 >> 2 ] = I; b:do if ( ( m | 0 ) >= 1 ) {

						f[ i + 40 >> 2 ] = p; n = m + - 1 | 0; k = p + n | 0; switch ( ( h[ k >> 0 ] | 0 ) >>> 6 & 3 ) {

							case 0: {

								f[ i + 44 >> 2 ] = n; s = n; t = b[ k >> 0 ] & 63; break;

							} case 1: {

								if ( ( m | 0 ) < 2 ) break b; k = m + - 2 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 2 | 0; s = k; t = ( h[ n + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ n >> 0 ] | 0 ); break;

							} case 2: {

								if ( ( m | 0 ) < 3 ) break b; n = m + - 3 | 0; f[ i + 44 >> 2 ] = n; k = p + m + - 3 | 0; s = n; t = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

							} case 3: {

								k = m + - 4 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 4 | 0; s = k; t = ( h[ n + 2 >> 0 ] | 0 ) << 16 | ( h[ n + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ n + 1 >> 0 ] | 0 ) << 8 | ( h[ n >> 0 ] | 0 ); break;

							} default: {}

						}n = i + 48 | 0; k = t + 2097152 | 0; f[ n >> 2 ] = k; o = k >>> 0 > 536870911; if ( o | j ) {

							l = o ^ 1; break a;

						}o = i + 44 | 0; r = i + 16 | 0; q = i + 28 | 0; v = 0; w = s; x = k; while ( 1 ) {

							c:do if ( x >>> 0 < 2097152 ) {

								k = w; y = x; while ( 1 ) {

									if ( ( k | 0 ) <= 0 ) {

										z = k; A = y; break c;

									}B = k + - 1 | 0; f[ o >> 2 ] = B; C = y << 8 | ( h[ p + B >> 0 ] | 0 ); f[ n >> 2 ] = C; if ( C >>> 0 < 2097152 ) {

										k = B; y = C;

									} else {

										z = B; A = C; break;

									}

								}

							} else {

								z = w; A = x;

							} while ( 0 );y = A & 524287; k = f[ ( f[ r >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0; C = f[ q >> 2 ] | 0; x = ( X( f[ C + ( k << 3 ) >> 2 ] | 0, A >>> 19 ) | 0 ) + y - ( f[ C + ( k << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ n >> 2 ] = x; f[ d + ( v << 2 ) >> 2 ] = k; v = v + 1 | 0; if ( ( v | 0 ) == ( a | 0 ) ) {

								l = 1; break a;

							} else w = z;

						}

					} while ( 0 );l = 0; break;

				}l = 0;

			} else l = 0; while ( 0 );z = f[ i + 28 >> 2 ] | 0; if ( z | 0 ) {

				a = i + 32 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( z | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 8 - z | 0 ) >>> 3 ) << 3 ); dn( z );

			}z = f[ i + 16 >> 2 ] | 0; if ( z | 0 ) {

				d = i + 20 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( z | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z );

			}z = f[ i >> 2 ] | 0; if ( ! z ) {

				u = e; return l | 0;

			}a = i + 4 | 0; i = f[ a >> 2 ] | 0; if ( ( i | 0 ) != ( z | 0 ) )f[ a >> 2 ] = i + ( ~ ( ( i + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z ); u = e; return l | 0;

		} function Xb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; e = u; u = u + 64 | 0; g = e; i = e + 8 | 0; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Sc( i, c ) | 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ? ( f[ i + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					l = 0; break;

				} if ( Ff( g, c ) | 0 ? ( k = g, m = f[ k >> 2 ] | 0, n = f[ k + 4 >> 2 ] | 0, k = c + 8 | 0, o = c + 16 | 0, p = o, q = f[ p >> 2 ] | 0, r = f[ p + 4 >> 2 ] | 0, p = Tj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, q | 0, r | 0 ) | 0, k = I, ! ( n >>> 0 > k >>> 0 | ( n | 0 ) == ( k | 0 ) & m >>> 0 > p >>> 0 ) ) : 0 ) {

					p = ( f[ c >> 2 ] | 0 ) + q | 0; k = Rj( q | 0, r | 0, m | 0, n | 0 ) | 0; n = o; f[ n >> 2 ] = k; f[ n + 4 >> 2 ] = I; b:do if ( ( m | 0 ) >= 1 ) {

						f[ i + 40 >> 2 ] = p; n = m + - 1 | 0; k = p + n | 0; switch ( ( h[ k >> 0 ] | 0 ) >>> 6 & 3 ) {

							case 0: {

								f[ i + 44 >> 2 ] = n; s = n; t = b[ k >> 0 ] & 63; break;

							} case 1: {

								if ( ( m | 0 ) < 2 ) break b; k = m + - 2 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 2 | 0; s = k; t = ( h[ n + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ n >> 0 ] | 0 ); break;

							} case 2: {

								if ( ( m | 0 ) < 3 ) break b; n = m + - 3 | 0; f[ i + 44 >> 2 ] = n; k = p + m + - 3 | 0; s = n; t = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

							} case 3: {

								k = m + - 4 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 4 | 0; s = k; t = ( h[ n + 2 >> 0 ] | 0 ) << 16 | ( h[ n + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ n + 1 >> 0 ] | 0 ) << 8 | ( h[ n >> 0 ] | 0 ); break;

							} default: {}

						}n = i + 48 | 0; k = t + 1048576 | 0; f[ n >> 2 ] = k; o = k >>> 0 > 268435455; if ( o | j ) {

							l = o ^ 1; break a;

						}o = i + 44 | 0; r = i + 16 | 0; q = i + 28 | 0; v = 0; w = s; x = k; while ( 1 ) {

							c:do if ( x >>> 0 < 1048576 ) {

								k = w; y = x; while ( 1 ) {

									if ( ( k | 0 ) <= 0 ) {

										z = k; A = y; break c;

									}B = k + - 1 | 0; f[ o >> 2 ] = B; C = y << 8 | ( h[ p + B >> 0 ] | 0 ); f[ n >> 2 ] = C; if ( C >>> 0 < 1048576 ) {

										k = B; y = C;

									} else {

										z = B; A = C; break;

									}

								}

							} else {

								z = w; A = x;

							} while ( 0 );y = A & 262143; k = f[ ( f[ r >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0; C = f[ q >> 2 ] | 0; x = ( X( f[ C + ( k << 3 ) >> 2 ] | 0, A >>> 18 ) | 0 ) + y - ( f[ C + ( k << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ n >> 2 ] = x; f[ d + ( v << 2 ) >> 2 ] = k; v = v + 1 | 0; if ( ( v | 0 ) == ( a | 0 ) ) {

								l = 1; break a;

							} else w = z;

						}

					} while ( 0 );l = 0; break;

				}l = 0;

			} else l = 0; while ( 0 );z = f[ i + 28 >> 2 ] | 0; if ( z | 0 ) {

				a = i + 32 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( z | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 8 - z | 0 ) >>> 3 ) << 3 ); dn( z );

			}z = f[ i + 16 >> 2 ] | 0; if ( z | 0 ) {

				d = i + 20 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( z | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z );

			}z = f[ i >> 2 ] | 0; if ( ! z ) {

				u = e; return l | 0;

			}a = i + 4 | 0; i = f[ a >> 2 ] | 0; if ( ( i | 0 ) != ( z | 0 ) )f[ a >> 2 ] = i + ( ~ ( ( i + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z ); u = e; return l | 0;

		} function Yb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; e = u; u = u + 64 | 0; g = e; i = e + 8 | 0; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Tc( i, c ) | 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ? ( f[ i + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					l = 0; break;

				} if ( Ff( g, c ) | 0 ? ( k = g, m = f[ k >> 2 ] | 0, n = f[ k + 4 >> 2 ] | 0, k = c + 8 | 0, o = c + 16 | 0, p = o, q = f[ p >> 2 ] | 0, r = f[ p + 4 >> 2 ] | 0, p = Tj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, q | 0, r | 0 ) | 0, k = I, ! ( n >>> 0 > k >>> 0 | ( n | 0 ) == ( k | 0 ) & m >>> 0 > p >>> 0 ) ) : 0 ) {

					p = ( f[ c >> 2 ] | 0 ) + q | 0; k = Rj( q | 0, r | 0, m | 0, n | 0 ) | 0; n = o; f[ n >> 2 ] = k; f[ n + 4 >> 2 ] = I; b:do if ( ( m | 0 ) >= 1 ) {

						f[ i + 40 >> 2 ] = p; n = m + - 1 | 0; k = p + n | 0; switch ( ( h[ k >> 0 ] | 0 ) >>> 6 & 3 ) {

							case 0: {

								f[ i + 44 >> 2 ] = n; s = n; t = b[ k >> 0 ] & 63; break;

							} case 1: {

								if ( ( m | 0 ) < 2 ) break b; k = m + - 2 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 2 | 0; s = k; t = ( h[ n + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ n >> 0 ] | 0 ); break;

							} case 2: {

								if ( ( m | 0 ) < 3 ) break b; n = m + - 3 | 0; f[ i + 44 >> 2 ] = n; k = p + m + - 3 | 0; s = n; t = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

							} case 3: {

								k = m + - 4 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 4 | 0; s = k; t = ( h[ n + 2 >> 0 ] | 0 ) << 16 | ( h[ n + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ n + 1 >> 0 ] | 0 ) << 8 | ( h[ n >> 0 ] | 0 ); break;

							} default: {}

						}n = i + 48 | 0; k = t + 262144 | 0; f[ n >> 2 ] = k; o = k >>> 0 > 67108863; if ( o | j ) {

							l = o ^ 1; break a;

						}o = i + 44 | 0; r = i + 16 | 0; q = i + 28 | 0; v = 0; w = s; x = k; while ( 1 ) {

							c:do if ( x >>> 0 < 262144 ) {

								k = w; y = x; while ( 1 ) {

									if ( ( k | 0 ) <= 0 ) {

										z = k; A = y; break c;

									}B = k + - 1 | 0; f[ o >> 2 ] = B; C = y << 8 | ( h[ p + B >> 0 ] | 0 ); f[ n >> 2 ] = C; if ( C >>> 0 < 262144 ) {

										k = B; y = C;

									} else {

										z = B; A = C; break;

									}

								}

							} else {

								z = w; A = x;

							} while ( 0 );y = A & 65535; k = f[ ( f[ r >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0; C = f[ q >> 2 ] | 0; x = ( X( f[ C + ( k << 3 ) >> 2 ] | 0, A >>> 16 ) | 0 ) + y - ( f[ C + ( k << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ n >> 2 ] = x; f[ d + ( v << 2 ) >> 2 ] = k; v = v + 1 | 0; if ( ( v | 0 ) == ( a | 0 ) ) {

								l = 1; break a;

							} else w = z;

						}

					} while ( 0 );l = 0; break;

				}l = 0;

			} else l = 0; while ( 0 );z = f[ i + 28 >> 2 ] | 0; if ( z | 0 ) {

				a = i + 32 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( z | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 8 - z | 0 ) >>> 3 ) << 3 ); dn( z );

			}z = f[ i + 16 >> 2 ] | 0; if ( z | 0 ) {

				d = i + 20 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( z | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z );

			}z = f[ i >> 2 ] | 0; if ( ! z ) {

				u = e; return l | 0;

			}a = i + 4 | 0; i = f[ a >> 2 ] | 0; if ( ( i | 0 ) != ( z | 0 ) )f[ a >> 2 ] = i + ( ~ ( ( i + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z ); u = e; return l | 0;

		} function Zb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; e = u; u = u + 64 | 0; g = e; i = e + 8 | 0; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Uc( i, c ) | 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ? ( f[ i + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					l = 0; break;

				} if ( Ff( g, c ) | 0 ? ( k = g, m = f[ k >> 2 ] | 0, n = f[ k + 4 >> 2 ] | 0, k = c + 8 | 0, o = c + 16 | 0, p = o, q = f[ p >> 2 ] | 0, r = f[ p + 4 >> 2 ] | 0, p = Tj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, q | 0, r | 0 ) | 0, k = I, ! ( n >>> 0 > k >>> 0 | ( n | 0 ) == ( k | 0 ) & m >>> 0 > p >>> 0 ) ) : 0 ) {

					p = ( f[ c >> 2 ] | 0 ) + q | 0; k = Rj( q | 0, r | 0, m | 0, n | 0 ) | 0; n = o; f[ n >> 2 ] = k; f[ n + 4 >> 2 ] = I; b:do if ( ( m | 0 ) >= 1 ) {

						f[ i + 40 >> 2 ] = p; n = m + - 1 | 0; k = p + n | 0; switch ( ( h[ k >> 0 ] | 0 ) >>> 6 & 3 ) {

							case 0: {

								f[ i + 44 >> 2 ] = n; s = n; t = b[ k >> 0 ] & 63; break;

							} case 1: {

								if ( ( m | 0 ) < 2 ) break b; k = m + - 2 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 2 | 0; s = k; t = ( h[ n + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ n >> 0 ] | 0 ); break;

							} case 2: {

								if ( ( m | 0 ) < 3 ) break b; n = m + - 3 | 0; f[ i + 44 >> 2 ] = n; k = p + m + - 3 | 0; s = n; t = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

							} case 3: {

								k = m + - 4 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 4 | 0; s = k; t = ( h[ n + 2 >> 0 ] | 0 ) << 16 | ( h[ n + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ n + 1 >> 0 ] | 0 ) << 8 | ( h[ n >> 0 ] | 0 ); break;

							} default: {}

						}n = i + 48 | 0; k = t + 131072 | 0; f[ n >> 2 ] = k; o = k >>> 0 > 33554431; if ( o | j ) {

							l = o ^ 1; break a;

						}o = i + 44 | 0; r = i + 16 | 0; q = i + 28 | 0; v = 0; w = s; x = k; while ( 1 ) {

							c:do if ( x >>> 0 < 131072 ) {

								k = w; y = x; while ( 1 ) {

									if ( ( k | 0 ) <= 0 ) {

										z = k; A = y; break c;

									}B = k + - 1 | 0; f[ o >> 2 ] = B; C = y << 8 | ( h[ p + B >> 0 ] | 0 ); f[ n >> 2 ] = C; if ( C >>> 0 < 131072 ) {

										k = B; y = C;

									} else {

										z = B; A = C; break;

									}

								}

							} else {

								z = w; A = x;

							} while ( 0 );y = A & 32767; k = f[ ( f[ r >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0; C = f[ q >> 2 ] | 0; x = ( X( f[ C + ( k << 3 ) >> 2 ] | 0, A >>> 15 ) | 0 ) + y - ( f[ C + ( k << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ n >> 2 ] = x; f[ d + ( v << 2 ) >> 2 ] = k; v = v + 1 | 0; if ( ( v | 0 ) == ( a | 0 ) ) {

								l = 1; break a;

							} else w = z;

						}

					} while ( 0 );l = 0; break;

				}l = 0;

			} else l = 0; while ( 0 );z = f[ i + 28 >> 2 ] | 0; if ( z | 0 ) {

				a = i + 32 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( z | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 8 - z | 0 ) >>> 3 ) << 3 ); dn( z );

			}z = f[ i + 16 >> 2 ] | 0; if ( z | 0 ) {

				d = i + 20 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( z | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z );

			}z = f[ i >> 2 ] | 0; if ( ! z ) {

				u = e; return l | 0;

			}a = i + 4 | 0; i = f[ a >> 2 ] | 0; if ( ( i | 0 ) != ( z | 0 ) )f[ a >> 2 ] = i + ( ~ ( ( i + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z ); u = e; return l | 0;

		} function _b( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; c = u; u = u + 32 | 0; d = c + 16 | 0; e = c; dg( d, b ) | 0; g = f[ d >> 2 ] | 0; if ( g | 0 ? ( i = a + 60 | 0, Gc( i, g, 0 ), Cm( e ), td( e, b ) | 0, f[ d >> 2 ] | 0 ) : 0 ) {

				g = 0; do {

					j = Wg( e ) | 0; k = ( f[ i >> 2 ] | 0 ) + ( g >>> 5 << 2 ) | 0; l = 1 << ( g & 31 ); if ( j )m = f[ k >> 2 ] | l; else m = f[ k >> 2 ] & ~ l; f[ k >> 2 ] = m; g = g + 1 | 0;

				} while ( g >>> 0 < ( f[ d >> 2 ] | 0 ) >>> 0 );

			}dg( d, b ) | 0; g = f[ d >> 2 ] | 0; if ( g | 0 ? ( m = a + 72 | 0, Gc( m, g, 0 ), Cm( e ), td( e, b ) | 0, f[ d >> 2 ] | 0 ) : 0 ) {

				g = 0; do {

					i = Wg( e ) | 0; k = ( f[ m >> 2 ] | 0 ) + ( g >>> 5 << 2 ) | 0; l = 1 << ( g & 31 ); if ( i )n = f[ k >> 2 ] | l; else n = f[ k >> 2 ] & ~ l; f[ k >> 2 ] = n; g = g + 1 | 0;

				} while ( g >>> 0 < ( f[ d >> 2 ] | 0 ) >>> 0 );

			}dg( d, b ) | 0; g = f[ d >> 2 ] | 0; if ( g | 0 ? ( n = a + 84 | 0, Gc( n, g, 0 ), Cm( e ), td( e, b ) | 0, f[ d >> 2 ] | 0 ) : 0 ) {

				g = 0; do {

					m = Wg( e ) | 0; k = ( f[ n >> 2 ] | 0 ) + ( g >>> 5 << 2 ) | 0; l = 1 << ( g & 31 ); if ( m )o = f[ k >> 2 ] | l; else o = f[ k >> 2 ] & ~ l; f[ k >> 2 ] = o; g = g + 1 | 0;

				} while ( g >>> 0 < ( f[ d >> 2 ] | 0 ) >>> 0 );

			}dg( d, b ) | 0; g = f[ d >> 2 ] | 0; if ( g | 0 ? ( o = a + 96 | 0, Gc( o, g, 0 ), Cm( e ), td( e, b ) | 0, f[ d >> 2 ] | 0 ) : 0 ) {

				g = 0; do {

					n = Wg( e ) | 0; k = ( f[ o >> 2 ] | 0 ) + ( g >>> 5 << 2 ) | 0; l = 1 << ( g & 31 ); if ( n )p = f[ k >> 2 ] | l; else p = f[ k >> 2 ] & ~ l; f[ k >> 2 ] = p; g = g + 1 | 0;

				} while ( g >>> 0 < ( f[ d >> 2 ] | 0 ) >>> 0 );

			}d = b + 8 | 0; g = f[ d >> 2 ] | 0; p = f[ d + 4 >> 2 ] | 0; d = b + 16 | 0; o = d; e = f[ o >> 2 ] | 0; k = f[ o + 4 >> 2 ] | 0; o = Rj( e | 0, k | 0, 4, 0 ) | 0; l = I; if ( ( p | 0 ) < ( l | 0 ) | ( p | 0 ) == ( l | 0 ) & g >>> 0 < o >>> 0 ) {

				q = 0; u = c; return q | 0;

			}n = f[ b >> 2 ] | 0; b = n + e | 0; m = h[ b >> 0 ] | h[ b + 1 >> 0 ] << 8 | h[ b + 2 >> 0 ] << 16 | h[ b + 3 >> 0 ] << 24; b = d; f[ b >> 2 ] = o; f[ b + 4 >> 2 ] = l; l = Rj( e | 0, k | 0, 8, 0 ) | 0; k = I; if ( ( p | 0 ) < ( k | 0 ) | ( p | 0 ) == ( k | 0 ) & g >>> 0 < l >>> 0 ) {

				q = 0; u = c; return q | 0;

			}g = n + o | 0; o = h[ g >> 0 ] | h[ g + 1 >> 0 ] << 8 | h[ g + 2 >> 0 ] << 16 | h[ g + 3 >> 0 ] << 24; g = d; f[ g >> 2 ] = l; f[ g + 4 >> 2 ] = k; if ( ( m | 0 ) > ( o | 0 ) ) {

				q = 0; u = c; return q | 0;

			}f[ a + 12 >> 2 ] = m; f[ a + 16 >> 2 ] = o; k = Tj( o | 0, ( ( o | 0 ) < 0 ) << 31 >> 31 | 0, m | 0, ( ( m | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; m = I; if ( ! ( m >>> 0 < 0 | ( m | 0 ) == 0 & k >>> 0 < 2147483647 ) ) {

				q = 0; u = c; return q | 0;

			}m = k + 1 | 0; f[ a + 20 >> 2 ] = m; k = ( m | 0 ) / 2 | 0; o = a + 24 | 0; f[ o >> 2 ] = k; f[ a + 28 >> 2 ] = 0 - k; if ( m & 1 | 0 ) {

				q = 1; u = c; return q | 0;

			}f[ o >> 2 ] = k + - 1; q = 1; u = c; return q | 0;

		} function $b( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0; d = b[ c + 11 >> 0 ] | 0; e = d << 24 >> 24 < 0; g = e ? f[ c >> 2 ] | 0 : c; i = e ? f[ c + 4 >> 2 ] | 0 : d & 255; if ( i >>> 0 > 3 ) {

				d = g; c = i; e = i; while ( 1 ) {

					j = X( h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24, 1540483477 ) | 0; c = ( X( j >>> 24 ^ j, 1540483477 ) | 0 ) ^ ( X( c, 1540483477 ) | 0 ); e = e + - 4 | 0; if ( e >>> 0 <= 3 ) break; else d = d + 4 | 0;

				}d = i + - 4 | 0; e = d & - 4; k = d - e | 0; l = g + ( e + 4 ) | 0; m = c;

			} else {

				k = i; l = g; m = i;

			} switch ( k | 0 ) {

				case 3: {

					n = h[ l + 2 >> 0 ] << 16 ^ m; o = 6; break;

				} case 2: {

					n = m; o = 6; break;

				} case 1: {

					p = m; o = 7; break;

				} default:q = m;

			} if ( ( o | 0 ) == 6 ) {

				p = h[ l + 1 >> 0 ] << 8 ^ n; o = 7;

			} if ( ( o | 0 ) == 7 )q = X( p ^ h[ l >> 0 ], 1540483477 ) | 0; l = X( q >>> 13 ^ q, 1540483477 ) | 0; q = l >>> 15 ^ l; l = f[ a + 4 >> 2 ] | 0; if ( ! l ) {

				r = 0; return r | 0;

			}p = l + - 1 | 0; n = ( p & l | 0 ) == 0; if ( ! n ) if ( q >>> 0 < l >>> 0 )s = q; else s = ( q >>> 0 ) % ( l >>> 0 ) | 0; else s = q & p; m = f[ ( f[ a >> 2 ] | 0 ) + ( s << 2 ) >> 2 ] | 0; if ( ! m ) {

				r = 0; return r | 0;

			}a = f[ m >> 2 ] | 0; if ( ! a ) {

				r = 0; return r | 0;

			}m = ( i | 0 ) == 0; if ( n ) {

				n = a; a:while ( 1 ) {

					k = f[ n + 4 >> 2 ] | 0; c = ( q | 0 ) == ( k | 0 ); if ( ! ( c | ( k & p | 0 ) == ( s | 0 ) ) ) {

						r = 0; o = 40; break;

					} do if ( c ? ( k = n + 8 | 0, e = b[ k + 11 >> 0 ] | 0, d = e << 24 >> 24 < 0, j = e & 255, ( ( d ? f[ n + 12 >> 2 ] | 0 : j ) | 0 ) == ( i | 0 ) ) : 0 ) {

						e = f[ k >> 2 ] | 0; t = d ? e : k; if ( d ) {

							if ( m ) {

								r = n; o = 40; break a;

							} if ( ! ( jh( t, g, i ) | 0 ) ) {

								r = n; o = 40; break a;

							} else break;

						} if ( m ) {

							r = n; o = 40; break a;

						} if ( ( b[ g >> 0 ] | 0 ) == ( e & 255 ) << 24 >> 24 ) {

							e = k; k = j; j = g; do {

								k = k + - 1 | 0; e = e + 1 | 0; if ( ! k ) {

									r = n; o = 40; break a;

								}j = j + 1 | 0;

							} while ( ( b[ e >> 0 ] | 0 ) == ( b[ j >> 0 ] | 0 ) );

						}

					} while ( 0 );n = f[ n >> 2 ] | 0; if ( ! n ) {

						r = 0; o = 40; break;

					}

				} if ( ( o | 0 ) == 40 ) return r | 0;

			} else u = a; b:while ( 1 ) {

				a = f[ u + 4 >> 2 ] | 0; do if ( ( q | 0 ) == ( a | 0 ) ) {

					n = u + 8 | 0; p = b[ n + 11 >> 0 ] | 0; c = p << 24 >> 24 < 0; j = p & 255; if ( ( ( c ? f[ u + 12 >> 2 ] | 0 : j ) | 0 ) == ( i | 0 ) ) {

						p = f[ n >> 2 ] | 0; e = c ? p : n; if ( c ) {

							if ( m ) {

								r = u; o = 40; break b;

							} if ( ! ( jh( e, g, i ) | 0 ) ) {

								r = u; o = 40; break b;

							} else break;

						} if ( m ) {

							r = u; o = 40; break b;

						} if ( ( b[ g >> 0 ] | 0 ) == ( p & 255 ) << 24 >> 24 ) {

							p = n; n = j; j = g; do {

								n = n + - 1 | 0; p = p + 1 | 0; if ( ! n ) {

									r = u; o = 40; break b;

								}j = j + 1 | 0;

							} while ( ( b[ p >> 0 ] | 0 ) == ( b[ j >> 0 ] | 0 ) );

						}

					}

				} else {

					if ( a >>> 0 < l >>> 0 )v = a; else v = ( a >>> 0 ) % ( l >>> 0 ) | 0; if ( ( v | 0 ) != ( s | 0 ) ) {

						r = 0; o = 40; break b;

					}

				} while ( 0 );u = f[ u >> 2 ] | 0; if ( ! u ) {

					r = 0; o = 40; break;

				}

			} if ( ( o | 0 ) == 40 ) return r | 0; return 0;

		} function ac( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; e = u; u = u + 64 | 0; g = e; i = e + 8 | 0; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Vc( i, c ) | 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ? ( f[ i + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					l = 0; break;

				} if ( Ff( g, c ) | 0 ? ( k = g, m = f[ k >> 2 ] | 0, n = f[ k + 4 >> 2 ] | 0, k = c + 8 | 0, o = c + 16 | 0, p = o, q = f[ p >> 2 ] | 0, r = f[ p + 4 >> 2 ] | 0, p = Tj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, q | 0, r | 0 ) | 0, k = I, ! ( n >>> 0 > k >>> 0 | ( n | 0 ) == ( k | 0 ) & m >>> 0 > p >>> 0 ) ) : 0 ) {

					p = ( f[ c >> 2 ] | 0 ) + q | 0; k = Rj( q | 0, r | 0, m | 0, n | 0 ) | 0; n = o; f[ n >> 2 ] = k; f[ n + 4 >> 2 ] = I; b:do if ( ( m | 0 ) >= 1 ) {

						f[ i + 40 >> 2 ] = p; n = m + - 1 | 0; k = p + n | 0; switch ( ( h[ k >> 0 ] | 0 ) >>> 6 & 3 ) {

							case 0: {

								f[ i + 44 >> 2 ] = n; s = n; t = b[ k >> 0 ] & 63; break;

							} case 1: {

								if ( ( m | 0 ) < 2 ) break b; k = m + - 2 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 2 | 0; s = k; t = ( h[ n + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ n >> 0 ] | 0 ); break;

							} case 2: {

								if ( ( m | 0 ) < 3 ) break b; n = m + - 3 | 0; f[ i + 44 >> 2 ] = n; k = p + m + - 3 | 0; s = n; t = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

							} case 3: {

								k = m + - 4 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 4 | 0; s = k; t = ( h[ n + 2 >> 0 ] | 0 ) << 16 | ( h[ n + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ n + 1 >> 0 ] | 0 ) << 8 | ( h[ n >> 0 ] | 0 ); break;

							} default: {}

						}n = i + 48 | 0; k = t + 32768 | 0; f[ n >> 2 ] = k; o = k >>> 0 > 8388607; if ( o | j ) {

							l = o ^ 1; break a;

						}o = i + 44 | 0; r = i + 16 | 0; q = i + 28 | 0; v = 0; w = s; x = k; while ( 1 ) {

							c:do if ( x >>> 0 < 32768 ) {

								k = w; y = x; while ( 1 ) {

									if ( ( k | 0 ) <= 0 ) {

										z = k; A = y; break c;

									}B = k + - 1 | 0; f[ o >> 2 ] = B; C = y << 8 | ( h[ p + B >> 0 ] | 0 ); f[ n >> 2 ] = C; if ( C >>> 0 < 32768 ) {

										k = B; y = C;

									} else {

										z = B; A = C; break;

									}

								}

							} else {

								z = w; A = x;

							} while ( 0 );y = A & 8191; k = f[ ( f[ r >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0; C = f[ q >> 2 ] | 0; x = ( X( f[ C + ( k << 3 ) >> 2 ] | 0, A >>> 13 ) | 0 ) + y - ( f[ C + ( k << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ n >> 2 ] = x; f[ d + ( v << 2 ) >> 2 ] = k; v = v + 1 | 0; if ( ( v | 0 ) == ( a | 0 ) ) {

								l = 1; break a;

							} else w = z;

						}

					} while ( 0 );l = 0; break;

				}l = 0;

			} else l = 0; while ( 0 );z = f[ i + 28 >> 2 ] | 0; if ( z | 0 ) {

				a = i + 32 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( z | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 8 - z | 0 ) >>> 3 ) << 3 ); dn( z );

			}z = f[ i + 16 >> 2 ] | 0; if ( z | 0 ) {

				d = i + 20 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( z | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z );

			}z = f[ i >> 2 ] | 0; if ( ! z ) {

				u = e; return l | 0;

			}a = i + 4 | 0; i = f[ a >> 2 ] | 0; if ( ( i | 0 ) != ( z | 0 ) )f[ a >> 2 ] = i + ( ~ ( ( i + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z ); u = e; return l | 0;

		} function bc( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; e = u; u = u + 64 | 0; g = e; i = e + 8 | 0; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Wc( i, c ) | 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ? ( f[ i + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					l = 0; break;

				} if ( Ff( g, c ) | 0 ? ( k = g, m = f[ k >> 2 ] | 0, n = f[ k + 4 >> 2 ] | 0, k = c + 8 | 0, o = c + 16 | 0, p = o, q = f[ p >> 2 ] | 0, r = f[ p + 4 >> 2 ] | 0, p = Tj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, q | 0, r | 0 ) | 0, k = I, ! ( n >>> 0 > k >>> 0 | ( n | 0 ) == ( k | 0 ) & m >>> 0 > p >>> 0 ) ) : 0 ) {

					p = ( f[ c >> 2 ] | 0 ) + q | 0; k = Rj( q | 0, r | 0, m | 0, n | 0 ) | 0; n = o; f[ n >> 2 ] = k; f[ n + 4 >> 2 ] = I; b:do if ( ( m | 0 ) >= 1 ) {

						f[ i + 40 >> 2 ] = p; n = m + - 1 | 0; k = p + n | 0; switch ( ( h[ k >> 0 ] | 0 ) >>> 6 & 3 ) {

							case 0: {

								f[ i + 44 >> 2 ] = n; s = n; t = b[ k >> 0 ] & 63; break;

							} case 1: {

								if ( ( m | 0 ) < 2 ) break b; k = m + - 2 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 2 | 0; s = k; t = ( h[ n + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ n >> 0 ] | 0 ); break;

							} case 2: {

								if ( ( m | 0 ) < 3 ) break b; n = m + - 3 | 0; f[ i + 44 >> 2 ] = n; k = p + m + - 3 | 0; s = n; t = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

							} case 3: {

								k = m + - 4 | 0; f[ i + 44 >> 2 ] = k; n = p + m + - 4 | 0; s = k; t = ( h[ n + 2 >> 0 ] | 0 ) << 16 | ( h[ n + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ n + 1 >> 0 ] | 0 ) << 8 | ( h[ n >> 0 ] | 0 ); break;

							} default: {}

						}n = i + 48 | 0; k = t + 16384 | 0; f[ n >> 2 ] = k; o = k >>> 0 > 4194303; if ( o | j ) {

							l = o ^ 1; break a;

						}o = i + 44 | 0; r = i + 16 | 0; q = i + 28 | 0; v = 0; w = s; x = k; while ( 1 ) {

							c:do if ( x >>> 0 < 16384 ) {

								k = w; y = x; while ( 1 ) {

									if ( ( k | 0 ) <= 0 ) {

										z = k; A = y; break c;

									}B = k + - 1 | 0; f[ o >> 2 ] = B; C = y << 8 | ( h[ p + B >> 0 ] | 0 ); f[ n >> 2 ] = C; if ( C >>> 0 < 16384 ) {

										k = B; y = C;

									} else {

										z = B; A = C; break;

									}

								}

							} else {

								z = w; A = x;

							} while ( 0 );y = A & 4095; k = f[ ( f[ r >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0; C = f[ q >> 2 ] | 0; x = ( X( f[ C + ( k << 3 ) >> 2 ] | 0, A >>> 12 ) | 0 ) + y - ( f[ C + ( k << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ n >> 2 ] = x; f[ d + ( v << 2 ) >> 2 ] = k; v = v + 1 | 0; if ( ( v | 0 ) == ( a | 0 ) ) {

								l = 1; break a;

							} else w = z;

						}

					} while ( 0 );l = 0; break;

				}l = 0;

			} else l = 0; while ( 0 );z = f[ i + 28 >> 2 ] | 0; if ( z | 0 ) {

				a = i + 32 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( z | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 8 - z | 0 ) >>> 3 ) << 3 ); dn( z );

			}z = f[ i + 16 >> 2 ] | 0; if ( z | 0 ) {

				d = i + 20 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( z | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z );

			}z = f[ i >> 2 ] | 0; if ( ! z ) {

				u = e; return l | 0;

			}a = i + 4 | 0; i = f[ a >> 2 ] | 0; if ( ( i | 0 ) != ( z | 0 ) )f[ a >> 2 ] = i + ( ~ ( ( i + - 4 - z | 0 ) >>> 2 ) << 2 ); dn( z ); u = e; return l | 0;

		} function cc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0; d = b[ c + 11 >> 0 ] | 0; e = d << 24 >> 24 < 0; g = e ? f[ c >> 2 ] | 0 : c; i = e ? f[ c + 4 >> 2 ] | 0 : d & 255; if ( i >>> 0 > 3 ) {

				d = g; c = i; e = i; while ( 1 ) {

					j = X( h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24, 1540483477 ) | 0; c = ( X( j >>> 24 ^ j, 1540483477 ) | 0 ) ^ ( X( c, 1540483477 ) | 0 ); e = e + - 4 | 0; if ( e >>> 0 <= 3 ) break; else d = d + 4 | 0;

				}d = i + - 4 | 0; e = d & - 4; k = d - e | 0; l = g + ( e + 4 ) | 0; m = c;

			} else {

				k = i; l = g; m = i;

			} switch ( k | 0 ) {

				case 3: {

					n = h[ l + 2 >> 0 ] << 16 ^ m; o = 6; break;

				} case 2: {

					n = m; o = 6; break;

				} case 1: {

					p = m; o = 7; break;

				} default:q = m;

			} if ( ( o | 0 ) == 6 ) {

				p = h[ l + 1 >> 0 ] << 8 ^ n; o = 7;

			} if ( ( o | 0 ) == 7 )q = X( p ^ h[ l >> 0 ], 1540483477 ) | 0; l = X( q >>> 13 ^ q, 1540483477 ) | 0; q = l >>> 15 ^ l; l = f[ a + 4 >> 2 ] | 0; if ( ! l ) {

				r = 0; return r | 0;

			}p = l + - 1 | 0; n = ( p & l | 0 ) == 0; if ( ! n ) if ( q >>> 0 < l >>> 0 )s = q; else s = ( q >>> 0 ) % ( l >>> 0 ) | 0; else s = q & p; m = f[ ( f[ a >> 2 ] | 0 ) + ( s << 2 ) >> 2 ] | 0; if ( ! m ) {

				r = 0; return r | 0;

			}a = f[ m >> 2 ] | 0; if ( ! a ) {

				r = 0; return r | 0;

			}m = ( i | 0 ) == 0; if ( n ) {

				n = a; a:while ( 1 ) {

					k = f[ n + 4 >> 2 ] | 0; c = ( k | 0 ) == ( q | 0 ); if ( ! ( c | ( k & p | 0 ) == ( s | 0 ) ) ) {

						r = 0; o = 40; break;

					} do if ( c ? ( k = n + 8 | 0, e = b[ k + 11 >> 0 ] | 0, d = e << 24 >> 24 < 0, j = e & 255, ( ( d ? f[ n + 12 >> 2 ] | 0 : j ) | 0 ) == ( i | 0 ) ) : 0 ) {

						e = f[ k >> 2 ] | 0; t = d ? e : k; if ( d ) {

							if ( m ) {

								r = n; o = 40; break a;

							} if ( ! ( jh( t, g, i ) | 0 ) ) {

								r = n; o = 40; break a;

							} else break;

						} if ( m ) {

							r = n; o = 40; break a;

						} if ( ( b[ g >> 0 ] | 0 ) == ( e & 255 ) << 24 >> 24 ) {

							e = k; k = j; j = g; do {

								k = k + - 1 | 0; e = e + 1 | 0; if ( ! k ) {

									r = n; o = 40; break a;

								}j = j + 1 | 0;

							} while ( ( b[ e >> 0 ] | 0 ) == ( b[ j >> 0 ] | 0 ) );

						}

					} while ( 0 );n = f[ n >> 2 ] | 0; if ( ! n ) {

						r = 0; o = 40; break;

					}

				} if ( ( o | 0 ) == 40 ) return r | 0;

			} else u = a; b:while ( 1 ) {

				a = f[ u + 4 >> 2 ] | 0; do if ( ( a | 0 ) == ( q | 0 ) ) {

					n = u + 8 | 0; p = b[ n + 11 >> 0 ] | 0; c = p << 24 >> 24 < 0; j = p & 255; if ( ( ( c ? f[ u + 12 >> 2 ] | 0 : j ) | 0 ) == ( i | 0 ) ) {

						p = f[ n >> 2 ] | 0; e = c ? p : n; if ( c ) {

							if ( m ) {

								r = u; o = 40; break b;

							} if ( ! ( jh( e, g, i ) | 0 ) ) {

								r = u; o = 40; break b;

							} else break;

						} if ( m ) {

							r = u; o = 40; break b;

						} if ( ( b[ g >> 0 ] | 0 ) == ( p & 255 ) << 24 >> 24 ) {

							p = n; n = j; j = g; do {

								n = n + - 1 | 0; p = p + 1 | 0; if ( ! n ) {

									r = u; o = 40; break b;

								}j = j + 1 | 0;

							} while ( ( b[ p >> 0 ] | 0 ) == ( b[ j >> 0 ] | 0 ) );

						}

					}

				} else {

					if ( a >>> 0 < l >>> 0 )v = a; else v = ( a >>> 0 ) % ( l >>> 0 ) | 0; if ( ( v | 0 ) != ( s | 0 ) ) {

						r = 0; o = 40; break b;

					}

				} while ( 0 );u = f[ u >> 2 ] | 0; if ( ! u ) {

					r = 0; o = 40; break;

				}

			} if ( ( o | 0 ) == 40 ) return r | 0; return 0;

		} function dc( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0; h = a + 4 | 0; i = f[ c >> 2 ] | 0; c = i; do if ( ( i | 0 ) != ( h | 0 ) ) {

				j = i + 16 | 0; k = b[ j + 11 >> 0 ] | 0; l = k << 24 >> 24 < 0; m = l ? f[ i + 20 >> 2 ] | 0 : k & 255; k = b[ g + 11 >> 0 ] | 0; n = k << 24 >> 24 < 0; o = n ? f[ g + 4 >> 2 ] | 0 : k & 255; k = m >>> 0 < o >>> 0; p = k ? m : o; if ( ( p | 0 ) != 0 ? ( q = jh( n ? f[ g >> 2 ] | 0 : g, l ? f[ j >> 2 ] | 0 : j, p ) | 0, ( q | 0 ) != 0 ) : 0 ) {

					if ( ( q | 0 ) < 0 ) break;

				} else r = 4; if ( ( r | 0 ) == 4 ? o >>> 0 < m >>> 0 : 0 ) break; q = o >>> 0 < m >>> 0 ? o : m; if ( ( q | 0 ) != 0 ? ( m = jh( l ? f[ j >> 2 ] | 0 : j, n ? f[ g >> 2 ] | 0 : g, q ) | 0, ( m | 0 ) != 0 ) : 0 ) {

					if ( ( m | 0 ) >= 0 )r = 37;

				} else r = 21; if ( ( r | 0 ) == 21 ? ! k : 0 )r = 37; if ( ( r | 0 ) == 37 ) {

					f[ d >> 2 ] = c; f[ e >> 2 ] = c; s = e; return s | 0;

				}k = f[ i + 4 >> 2 ] | 0; m = ( k | 0 ) == 0; if ( m ) {

					q = i + 8 | 0; j = f[ q >> 2 ] | 0; if ( ( f[ j >> 2 ] | 0 ) == ( i | 0 ) )t = j; else {

						j = q; do {

							q = f[ j >> 2 ] | 0; j = q + 8 | 0; l = f[ j >> 2 ] | 0;

						} while ( ( f[ l >> 2 ] | 0 ) != ( q | 0 ) );t = l;

					}

				} else {

					j = k; while ( 1 ) {

						l = f[ j >> 2 ] | 0; if ( ! l ) break; else j = l;

					}t = j;

				} do if ( ( t | 0 ) != ( h | 0 ) ) {

					k = t + 16 | 0; l = b[ k + 11 >> 0 ] | 0; q = l << 24 >> 24 < 0; p = q ? f[ t + 20 >> 2 ] | 0 : l & 255; l = p >>> 0 < o >>> 0 ? p : o; if ( ( l | 0 ) != 0 ? ( u = jh( n ? f[ g >> 2 ] | 0 : g, q ? f[ k >> 2 ] | 0 : k, l ) | 0, ( u | 0 ) != 0 ) : 0 ) {

						if ( ( u | 0 ) < 0 ) break;

					} else r = 31; if ( ( r | 0 ) == 31 ? o >>> 0 < p >>> 0 : 0 ) break; s = Gd( a, d, g ) | 0; return s | 0;

				} while ( 0 );if ( m ) {

					f[ d >> 2 ] = c; s = i + 4 | 0; return s | 0;

				} else {

					f[ d >> 2 ] = t; s = t; return s | 0;

				}

			} while ( 0 );t = f[ i >> 2 ] | 0; do if ( ( f[ a >> 2 ] | 0 ) == ( i | 0 ) )v = c; else {

				if ( ! t ) {

					h = i; while ( 1 ) {

						e = f[ h + 8 >> 2 ] | 0; if ( ( f[ e >> 2 ] | 0 ) == ( h | 0 ) )h = e; else {

							w = e; break;

						}

					}

				} else {

					h = t; while ( 1 ) {

						m = f[ h + 4 >> 2 ] | 0; if ( ! m ) {

							w = h; break;

						} else h = m;

					}

				}h = w; m = w + 16 | 0; e = b[ g + 11 >> 0 ] | 0; o = e << 24 >> 24 < 0; n = o ? f[ g + 4 >> 2 ] | 0 : e & 255; e = b[ m + 11 >> 0 ] | 0; j = e << 24 >> 24 < 0; p = j ? f[ w + 20 >> 2 ] | 0 : e & 255; e = n >>> 0 < p >>> 0 ? n : p; if ( ( e | 0 ) != 0 ? ( u = jh( j ? f[ m >> 2 ] | 0 : m, o ? f[ g >> 2 ] | 0 : g, e ) | 0, ( u | 0 ) != 0 ) : 0 ) {

					if ( ( u | 0 ) < 0 ) {

						v = h; break;

					}

				} else r = 13; if ( ( r | 0 ) == 13 ? p >>> 0 < n >>> 0 : 0 ) {

					v = h; break;

				}s = Gd( a, d, g ) | 0; return s | 0;

			} while ( 0 );if ( ! t ) {

				f[ d >> 2 ] = i; s = i; return s | 0;

			} else {

				f[ d >> 2 ] = v; s = v + 4 | 0; return s | 0;

			} return 0;

		} function ec( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0; e = b + 12 | 0; g = f[ e >> 2 ] | 0; h = ( f[ c >> 2 ] | 0 ) - g | 0; i = c + 4 | 0; j = ( f[ i >> 2 ] | 0 ) - g | 0; k = c; f[ k >> 2 ] = h; f[ k + 4 >> 2 ] = j; k = ( h | 0 ) > - 1; l = ( j | 0 ) > - 1; m = f[ e >> 2 ] | 0; n = ( ( l ? j : 0 - j | 0 ) + ( k ? h : 0 - h | 0 ) | 0 ) <= ( m | 0 ); if ( n ) {

				o = h; p = j;

			} else {

				if ( k ) if ( ! l ) if ( ( h | 0 ) < 1 ) {

					q = - 1; r = - 1;

				} else s = 6; else {

					q = 1; r = 1;

				} else if ( ( j | 0 ) < 1 ) {

					q = - 1; r = - 1;

				} else s = 6; if ( ( s | 0 ) == 6 ) {

					q = ( h | 0 ) > 0 ? 1 : - 1; r = ( j | 0 ) > 0 ? 1 : - 1;

				}l = X( m, q ) | 0; k = X( m, r ) | 0; m = ( h << 1 ) - l | 0; f[ c >> 2 ] = m; h = ( j << 1 ) - k | 0; f[ i >> 2 ] = h; if ( ( X( q, r ) | 0 ) > - 1 ) {

					r = 0 - h | 0; f[ c >> 2 ] = r; t = 0 - m | 0; u = r;

				} else {

					f[ c >> 2 ] = h; t = m; u = h;

				}h = ( u + l | 0 ) / 2 | 0; f[ c >> 2 ] = h; l = ( t + k | 0 ) / 2 | 0; f[ i >> 2 ] = l; o = h; p = l;

			} if ( ! o )v = ( p | 0 ) == 0; else v = ( o | 0 ) < 0 & ( p | 0 ) < 1; if ( ! o )w = ( p | 0 ) == 0 ? 0 : ( p | 0 ) > 0 ? 3 : 1; else w = ( o | 0 ) > 0 ? ( p >> 31 ) + 2 | 0 : ( p | 0 ) < 1 ? 0 : 3; if ( v ) {

				x = 1; y = o; z = p;

			} else {

				switch ( w | 0 ) {

					case 1: {

						A = p; B = 0 - o | 0; break;

					} case 2: {

						A = 0 - o | 0; B = 0 - p | 0; break;

					} case 3: {

						A = 0 - p | 0; B = o; break;

					} default: {

						A = o; B = p;

					}

				}p = c; f[ p >> 2 ] = A; f[ p + 4 >> 2 ] = B; x = 0; y = A; z = B;

			}B = ( f[ d >> 2 ] | 0 ) + y | 0; f[ a >> 2 ] = B; y = ( f[ d + 4 >> 2 ] | 0 ) + z | 0; z = a + 4 | 0; f[ z >> 2 ] = y; d = f[ e >> 2 ] | 0; if ( ( d | 0 ) >= ( B | 0 ) ) if ( ( B | 0 ) < ( 0 - d | 0 ) )C = ( f[ b + 4 >> 2 ] | 0 ) + B | 0; else C = B; else C = B - ( f[ b + 4 >> 2 ] | 0 ) | 0; f[ a >> 2 ] = C; if ( ( d | 0 ) >= ( y | 0 ) ) if ( ( y | 0 ) < ( 0 - d | 0 ) )D = ( f[ b + 4 >> 2 ] | 0 ) + y | 0; else D = y; else D = y - ( f[ b + 4 >> 2 ] | 0 ) | 0; f[ z >> 2 ] = D; if ( x ) {

				E = C; F = D;

			} else {

				switch ( ( 4 - w | 0 ) % 4 | 0 | 0 ) {

					case 1: {

						G = D; H = 0 - C | 0; break;

					} case 2: {

						G = 0 - C | 0; H = 0 - D | 0; break;

					} case 3: {

						G = 0 - D | 0; H = C; break;

					} default: {

						G = C; H = D;

					}

				}D = a; f[ D >> 2 ] = G; f[ D + 4 >> 2 ] = H; E = G; F = H;

			} if ( n ) {

				I = E; J = F; K = I + g | 0; L = J + g | 0; M = a; N = M; f[ N >> 2 ] = K; O = M + 4 | 0; P = O; f[ P >> 2 ] = L; return;

			} if ( ( E | 0 ) > - 1 ) if ( ( F | 0 ) <= - 1 ) if ( ( E | 0 ) < 1 ) {

				Q = - 1; R = - 1;

			} else s = 42; else {

				Q = 1; R = 1;

			} else if ( ( F | 0 ) < 1 ) {

				Q = - 1; R = - 1;

			} else s = 42; if ( ( s | 0 ) == 42 ) {

				Q = ( E | 0 ) > 0 ? 1 : - 1; R = ( F | 0 ) > 0 ? 1 : - 1;

			}s = X( d, Q ) | 0; n = X( d, R ) | 0; d = ( E << 1 ) - s | 0; f[ a >> 2 ] = d; E = ( F << 1 ) - n | 0; f[ z >> 2 ] = E; if ( ( X( Q, R ) | 0 ) > - 1 ) {

				R = 0 - E | 0; f[ a >> 2 ] = R; S = 0 - d | 0; T = R;

			} else {

				f[ a >> 2 ] = E; S = d; T = E;

			}E = ( T + s | 0 ) / 2 | 0; f[ a >> 2 ] = E; s = ( S + n | 0 ) / 2 | 0; f[ z >> 2 ] = s; I = E; J = s; K = I + g | 0; L = J + g | 0; M = a; N = M; f[ N >> 2 ] = K; O = M + 4 | 0; P = O; f[ P >> 2 ] = L; return;

		} function fc( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0; g = u; u = u + 64 | 0; i = g; j = i; k = j + 40 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );a:do if ( Wc( i, d ) | 0 ? Bd( i, d ) | 0 : 0 ) {

				j = ( a | 0 ) == 0; if ( ! j ) {

					if ( ! ( f[ i + 12 >> 2 ] | 0 ) ) {

						l = 0; break;

					}ah( d, 0, 0 ) | 0; if ( ! j ) {

						j = i + 48 | 0; k = i + 44 | 0; m = i + 40 | 0; n = i + 16 | 0; o = i + 28 | 0; p = ( c | 0 ) > 0; q = d + 36 | 0; r = d + 32 | 0; s = d + 24 | 0; t = d + 28 | 0; v = 0; w = 0; x = f[ j >> 2 ] | 0; while ( 1 ) {

							b:do if ( x >>> 0 < 16384 ) {

								y = f[ k >> 2 ] | 0; z = x; while ( 1 ) {

									if ( ( y | 0 ) <= 0 ) {

										A = z; break b;

									}B = f[ m >> 2 ] | 0; y = y + - 1 | 0; f[ k >> 2 ] = y; C = z << 8 | h[ B + y >> 0 ]; f[ j >> 2 ] = C; if ( C >>> 0 >= 16384 ) {

										A = C; break;

									} else z = C;

								}

							} else A = x; while ( 0 );z = A & 4095; y = f[ ( f[ n >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0; C = f[ o >> 2 ] | 0; x = ( X( f[ C + ( y << 3 ) >> 2 ] | 0, A >>> 12 ) | 0 ) + z - ( f[ C + ( y << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ j >> 2 ] = x; c:do if ( p ) {

								if ( ( y | 0 ) > 0 ) {

									D = 0; E = w;

								} else {

									C = ( b[ q >> 0 ] | 0 ) == 0; z = 0; B = w; while ( 1 ) {

										if ( C ) {

											l = 0; break a;

										}F = B + 1 | 0; f[ e + ( B << 2 ) >> 2 ] = 0; z = z + 1 | 0; if ( ( z | 0 ) >= ( c | 0 ) ) {

											G = F; break c;

										} else B = F;

									}

								} while ( 1 ) {

									if ( ! ( b[ q >> 0 ] | 0 ) ) {

										l = 0; break a;

									}B = f[ s >> 2 ] | 0; z = f[ t >> 2 ] | 0; C = 0; F = 0; H = f[ r >> 2 ] | 0; while ( 1 ) {

										I = B + ( H >>> 3 ) | 0; if ( I >>> 0 < z >>> 0 ) {

											J = ( h[ I >> 0 ] | 0 ) >>> ( H & 7 ) & 1; I = H + 1 | 0; f[ r >> 2 ] = I; K = J; L = I;

										} else {

											K = 0; L = H;

										}C = K << F | C; F = F + 1 | 0; if ( ( F | 0 ) == ( y | 0 ) ) break; else H = L;

									}H = E + 1 | 0; f[ e + ( E << 2 ) >> 2 ] = C; D = D + 1 | 0; if ( ( D | 0 ) >= ( c | 0 ) ) {

										G = H; break;

									} else E = H;

								}

							} else G = w; while ( 0 );v = v + c | 0; if ( v >>> 0 >= a >>> 0 ) break; else w = G;

						}

					}

				} else ah( d, 0, 0 ) | 0; bi( d ); l = 1;

			} else l = 0; while ( 0 );d = f[ i + 28 >> 2 ] | 0; if ( d | 0 ) {

				G = i + 32 | 0; a = f[ G >> 2 ] | 0; if ( ( a | 0 ) != ( d | 0 ) )f[ G >> 2 ] = a + ( ~ ( ( a + - 8 - d | 0 ) >>> 3 ) << 3 ); dn( d );

			}d = f[ i + 16 >> 2 ] | 0; if ( d | 0 ) {

				a = i + 20 | 0; G = f[ a >> 2 ] | 0; if ( ( G | 0 ) != ( d | 0 ) )f[ a >> 2 ] = G + ( ~ ( ( G + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

			}d = f[ i >> 2 ] | 0; if ( ! d ) {

				u = g; return l | 0;

			}G = i + 4 | 0; i = f[ G >> 2 ] | 0; if ( ( i | 0 ) != ( d | 0 ) )f[ G >> 2 ] = i + ( ~ ( ( i + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d ); u = g; return l | 0;

		} function gc( a, b, c, d, e ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0; g = a; h = b; i = h; j = c; k = d; l = k; if ( ! i ) {

				m = ( e | 0 ) != 0; if ( ! l ) {

					if ( m ) {

						f[ e >> 2 ] = ( g >>> 0 ) % ( j >>> 0 ); f[ e + 4 >> 2 ] = 0;

					}n = 0; o = ( g >>> 0 ) / ( j >>> 0 ) >>> 0; return ( I = n, o ) | 0;

				} else {

					if ( ! m ) {

						n = 0; o = 0; return ( I = n, o ) | 0;

					}f[ e >> 2 ] = a | 0; f[ e + 4 >> 2 ] = b & 0; n = 0; o = 0; return ( I = n, o ) | 0;

				}

			}m = ( l | 0 ) == 0; do if ( j ) {

				if ( ! m ) {

					p = ( _( l | 0 ) | 0 ) - ( _( i | 0 ) | 0 ) | 0; if ( p >>> 0 <= 31 ) {

						q = p + 1 | 0; r = 31 - p | 0; s = p - 31 >> 31; t = q; u = g >>> ( q >>> 0 ) & s | i << r; v = i >>> ( q >>> 0 ) & s; w = 0; x = g << r; break;

					} if ( ! e ) {

						n = 0; o = 0; return ( I = n, o ) | 0;

					}f[ e >> 2 ] = a | 0; f[ e + 4 >> 2 ] = h | b & 0; n = 0; o = 0; return ( I = n, o ) | 0;

				}r = j - 1 | 0; if ( r & j | 0 ) {

					s = ( _( j | 0 ) | 0 ) + 33 - ( _( i | 0 ) | 0 ) | 0; q = 64 - s | 0; p = 32 - s | 0; y = p >> 31; z = s - 32 | 0; A = z >> 31; t = s; u = p - 1 >> 31 & i >>> ( z >>> 0 ) | ( i << p | g >>> ( s >>> 0 ) ) & A; v = A & i >>> ( s >>> 0 ); w = g << q & y; x = ( i << q | g >>> ( z >>> 0 ) ) & y | g << p & s - 33 >> 31; break;

				} if ( e | 0 ) {

					f[ e >> 2 ] = r & g; f[ e + 4 >> 2 ] = 0;

				} if ( ( j | 0 ) == 1 ) {

					n = h | b & 0; o = a | 0 | 0; return ( I = n, o ) | 0;

				} else {

					r = wi( j | 0 ) | 0; n = i >>> ( r >>> 0 ) | 0; o = i << 32 - r | g >>> ( r >>> 0 ) | 0; return ( I = n, o ) | 0;

				}

			} else {

				if ( m ) {

					if ( e | 0 ) {

						f[ e >> 2 ] = ( i >>> 0 ) % ( j >>> 0 ); f[ e + 4 >> 2 ] = 0;

					}n = 0; o = ( i >>> 0 ) / ( j >>> 0 ) >>> 0; return ( I = n, o ) | 0;

				} if ( ! g ) {

					if ( e | 0 ) {

						f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = ( i >>> 0 ) % ( l >>> 0 );

					}n = 0; o = ( i >>> 0 ) / ( l >>> 0 ) >>> 0; return ( I = n, o ) | 0;

				}r = l - 1 | 0; if ( ! ( r & l ) ) {

					if ( e | 0 ) {

						f[ e >> 2 ] = a | 0; f[ e + 4 >> 2 ] = r & i | b & 0;

					}n = 0; o = i >>> ( ( wi( l | 0 ) | 0 ) >>> 0 ); return ( I = n, o ) | 0;

				}r = ( _( l | 0 ) | 0 ) - ( _( i | 0 ) | 0 ) | 0; if ( r >>> 0 <= 30 ) {

					s = r + 1 | 0; p = 31 - r | 0; t = s; u = i << p | g >>> ( s >>> 0 ); v = i >>> ( s >>> 0 ); w = 0; x = g << p; break;

				} if ( ! e ) {

					n = 0; o = 0; return ( I = n, o ) | 0;

				}f[ e >> 2 ] = a | 0; f[ e + 4 >> 2 ] = h | b & 0; n = 0; o = 0; return ( I = n, o ) | 0;

			} while ( 0 );if ( ! t ) {

				B = x; C = w; D = v; E = u; F = 0; G = 0;

			} else {

				b = c | 0 | 0; c = k | d & 0; d = Rj( b | 0, c | 0, - 1, - 1 ) | 0; k = I; h = x; x = w; w = v; v = u; u = t; t = 0; do {

					a = h; h = x >>> 31 | h << 1; x = t | x << 1; g = v << 1 | a >>> 31 | 0; a = v >>> 31 | w << 1 | 0; Tj( d | 0, k | 0, g | 0, a | 0 ) | 0; i = I; l = i >> 31 | ( ( i | 0 ) < 0 ? - 1 : 0 ) << 1; t = l & 1; v = Tj( g | 0, a | 0, l & b | 0, ( ( ( i | 0 ) < 0 ? - 1 : 0 ) >> 31 | ( ( i | 0 ) < 0 ? - 1 : 0 ) << 1 ) & c | 0 ) | 0; w = I; u = u - 1 | 0;

				} while ( ( u | 0 ) != 0 );B = h; C = x; D = w; E = v; F = 0; G = t;

			}t = C; C = 0; if ( e | 0 ) {

				f[ e >> 2 ] = E; f[ e + 4 >> 2 ] = D;

			}n = ( t | 0 ) >>> 31 | ( B | C ) << 1 | ( C << 1 | t >>> 31 ) & 0 | F; o = ( t << 1 | 0 >>> 31 ) & - 2 | G; return ( I = n, o ) | 0;

		} function hc( a, b, c, d, e, g, h ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; h = h | 0; var i = 0; switch ( c | 0 ) {

				case 1: {

					c = bj( 60 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; h = c + 8 | 0; f[ h >> 2 ] = f[ e >> 2 ]; f[ h + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ h + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ h + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); h = c + 44 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1572; i = c; f[ a >> 2 ] = i; return;

				} case 4: {

					c = bj( 112 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; h = c + 8 | 0; f[ h >> 2 ] = f[ e >> 2 ]; f[ h + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ h + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ h + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); h = c + 44 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1628; h = c + 60 | 0; b = h + 52 | 0; do {

						f[ h >> 2 ] = 0; h = h + 4 | 0;

					} while ( ( h | 0 ) < ( b | 0 ) );i = c; f[ a >> 2 ] = i; return;

				} case 5: {

					c = bj( 104 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; h = c + 8 | 0; f[ h >> 2 ] = f[ e >> 2 ]; f[ h + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ h + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ h + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); h = c + 44 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1684; f[ c + 60 >> 2 ] = 0; f[ c + 64 >> 2 ] = 0; f[ c + 76 >> 2 ] = 0; f[ c + 80 >> 2 ] = 0; f[ c + 84 >> 2 ] = 0; h = c + 88 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; i = c; f[ a >> 2 ] = i; return;

				} case 6: {

					c = bj( 124 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; d = c + 8 | 0; f[ d >> 2 ] = f[ e >> 2 ]; f[ d + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ d + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ d + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ d + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ d + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); e = c + 44 | 0; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ e + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ e + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1740; f[ c + 64 >> 2 ] = 0; f[ c + 68 >> 2 ] = 0; e = c + 72 | 0; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ e + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ e + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c + 60 >> 2 ] = 1796; f[ c + 88 >> 2 ] = 1; g = c + 92 | 0; f[ g >> 2 ] = - 1; f[ g + 4 >> 2 ] = - 1; f[ g + 8 >> 2 ] = - 1; f[ g + 12 >> 2 ] = - 1; Cm( c + 108 | 0 ); i = c; f[ a >> 2 ] = i; return;

				} default: {

					i = 0; f[ a >> 2 ] = i; return;

				}

			}

		} function ic( a, b, c, d, e, g, h ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; h = h | 0; var i = 0; switch ( c | 0 ) {

				case 1: {

					c = bj( 60 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; h = c + 8 | 0; f[ h >> 2 ] = f[ e >> 2 ]; f[ h + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ h + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ h + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); h = c + 44 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1320; i = c; f[ a >> 2 ] = i; return;

				} case 4: {

					c = bj( 112 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; h = c + 8 | 0; f[ h >> 2 ] = f[ e >> 2 ]; f[ h + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ h + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ h + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); h = c + 44 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1376; h = c + 60 | 0; b = h + 52 | 0; do {

						f[ h >> 2 ] = 0; h = h + 4 | 0;

					} while ( ( h | 0 ) < ( b | 0 ) );i = c; f[ a >> 2 ] = i; return;

				} case 5: {

					c = bj( 104 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; h = c + 8 | 0; f[ h >> 2 ] = f[ e >> 2 ]; f[ h + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ h + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ h + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); h = c + 44 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1432; f[ c + 60 >> 2 ] = 0; f[ c + 64 >> 2 ] = 0; f[ c + 76 >> 2 ] = 0; f[ c + 80 >> 2 ] = 0; f[ c + 84 >> 2 ] = 0; h = c + 88 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ h + 12 >> 2 ] = f[ g + 12 >> 2 ]; i = c; f[ a >> 2 ] = i; return;

				} case 6: {

					c = bj( 124 ) | 0; f[ c >> 2 ] = 1208; f[ c + 4 >> 2 ] = d; d = c + 8 | 0; f[ d >> 2 ] = f[ e >> 2 ]; f[ d + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ d + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ d + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ d + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ d + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( c + 32 | 0, e + 24 | 0 ); e = c + 44 | 0; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ e + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ e + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c >> 2 ] = 1488; f[ c + 64 >> 2 ] = 0; f[ c + 68 >> 2 ] = 0; e = c + 72 | 0; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ e + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ e + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ c + 60 >> 2 ] = 1544; f[ c + 88 >> 2 ] = 1; g = c + 92 | 0; f[ g >> 2 ] = - 1; f[ g + 4 >> 2 ] = - 1; f[ g + 8 >> 2 ] = - 1; f[ g + 12 >> 2 ] = - 1; Cm( c + 108 | 0 ); i = c; f[ a >> 2 ] = i; return;

				} default: {

					i = 0; f[ a >> 2 ] = i; return;

				}

			}

		} function jc( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0; c = a + 4 | 0; if ( ! b ) {

				d = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( d | 0 )dn( d ); f[ c >> 2 ] = 0; return;

			} if ( b >>> 0 > 1073741823 ) {

				d = ra( 8 ) | 0; Yk( d, 9789 ); f[ d >> 2 ] = 3704; va( d | 0, 856, 80 );

			}d = bj( b << 2 ) | 0; e = f[ a >> 2 ] | 0; f[ a >> 2 ] = d; if ( e | 0 )dn( e ); f[ c >> 2 ] = b; c = 0; do {

				f[ ( f[ a >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] = 0; c = c + 1 | 0;

			} while ( ( c | 0 ) != ( b | 0 ) );c = a + 8 | 0; e = f[ c >> 2 ] | 0; if ( ! e ) return; d = f[ e + 4 >> 2 ] | 0; g = b + - 1 | 0; h = ( g & b | 0 ) == 0; if ( ! h ) if ( d >>> 0 < b >>> 0 )i = d; else i = ( d >>> 0 ) % ( b >>> 0 ) | 0; else i = d & g; f[ ( f[ a >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] = c; c = f[ e >> 2 ] | 0; if ( ! c ) return; else {

				j = i; k = e; l = c; m = e;

			}a:while ( 1 ) {

				b:do if ( h ) {

					e = k; c = l; i = m; while ( 1 ) {

						d = c; while ( 1 ) {

							n = f[ d + 4 >> 2 ] & g; if ( ( n | 0 ) == ( j | 0 ) ) break; o = ( f[ a >> 2 ] | 0 ) + ( n << 2 ) | 0; if ( ! ( f[ o >> 2 ] | 0 ) ) {

								p = d; q = i; r = n; s = o; break b;

							}o = d + 8 | 0; t = d; while ( 1 ) {

								u = f[ t >> 2 ] | 0; if ( ! u ) break; if ( ( f[ o >> 2 ] | 0 ) == ( f[ u + 8 >> 2 ] | 0 ) )t = u; else break;

							}f[ i >> 2 ] = u; f[ t >> 2 ] = f[ f[ ( f[ a >> 2 ] | 0 ) + ( n << 2 ) >> 2 ] >> 2 ]; f[ f[ ( f[ a >> 2 ] | 0 ) + ( n << 2 ) >> 2 ] >> 2 ] = d; o = f[ e >> 2 ] | 0; if ( ! o ) {

								v = 37; break a;

							} else d = o;

						}c = f[ d >> 2 ] | 0; if ( ! c ) {

							v = 37; break a;

						} else {

							e = d; i = d;

						}

					}

				} else {

					i = k; e = l; c = m; while ( 1 ) {

						o = e; while ( 1 ) {

							w = f[ o + 4 >> 2 ] | 0; if ( w >>> 0 < b >>> 0 )x = w; else x = ( w >>> 0 ) % ( b >>> 0 ) | 0; if ( ( x | 0 ) == ( j | 0 ) ) break; w = ( f[ a >> 2 ] | 0 ) + ( x << 2 ) | 0; if ( ! ( f[ w >> 2 ] | 0 ) ) {

								p = o; q = c; r = x; s = w; break b;

							}w = o + 8 | 0; y = o; while ( 1 ) {

								z = f[ y >> 2 ] | 0; if ( ! z ) break; if ( ( f[ w >> 2 ] | 0 ) == ( f[ z + 8 >> 2 ] | 0 ) )y = z; else break;

							}f[ c >> 2 ] = z; f[ y >> 2 ] = f[ f[ ( f[ a >> 2 ] | 0 ) + ( x << 2 ) >> 2 ] >> 2 ]; f[ f[ ( f[ a >> 2 ] | 0 ) + ( x << 2 ) >> 2 ] >> 2 ] = o; w = f[ i >> 2 ] | 0; if ( ! w ) {

								v = 37; break a;

							} else o = w;

						}e = f[ o >> 2 ] | 0; if ( ! e ) {

							v = 37; break a;

						} else {

							i = o; c = o;

						}

					}

				} while ( 0 );f[ s >> 2 ] = q; l = f[ p >> 2 ] | 0; if ( ! l ) {

					v = 37; break;

				} else {

					j = r; k = p; m = p;

				}

			} if ( ( v | 0 ) == 37 ) return;

		} function kc( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0; c = u; u = u + 16 | 0; d = c; td( a + 80 | 0, a ) | 0; if ( ! ( qf( a ) | 0 ) ) {

				e = 0; u = c; return e | 0;

			}g = b; h = a; i = g + 40 | 0; do {

				f[ g >> 2 ] = f[ h >> 2 ]; g = g + 4 | 0; h = h + 4 | 0;

			} while ( ( g | 0 ) < ( i | 0 ) );h = a + 176 | 0; f[ h >> 2 ] = 2; g = a + 180 | 0; f[ g >> 2 ] = 7; i = f[ a + 152 >> 2 ] | 0; if ( ( i | 0 ) < 0 ) {

				e = 0; u = c; return e | 0;

			}j = a + 156 | 0; f[ d >> 2 ] = 0; k = a + 160 | 0; l = f[ k >> 2 ] | 0; m = f[ j >> 2 ] | 0; n = l - m >> 2; o = m; m = l; if ( i >>> 0 <= n >>> 0 ) if ( i >>> 0 < n >>> 0 ? ( l = o + ( i << 2 ) | 0, ( l | 0 ) != ( m | 0 ) ) : 0 ) {

				f[ k >> 2 ] = m + ( ~ ( ( m + - 4 - l | 0 ) >>> 2 ) << 2 ); p = 2; q = 7;

			} else {

				p = 2; q = 7;

			} else {

				Ae( j, i - n | 0, d ); p = f[ h >> 2 ] | 0; q = f[ g >> 2 ] | 0;

			}g = q - p + 1 | 0; p = a + 184 | 0; q = a + 188 | 0; h = f[ q >> 2 ] | 0; n = f[ p >> 2 ] | 0; i = ( h - n | 0 ) / 12 | 0; j = n; n = h; if ( g >>> 0 <= i >>> 0 ) if ( g >>> 0 < i >>> 0 ? ( l = j + ( g * 12 | 0 ) | 0, ( l | 0 ) != ( n | 0 ) ) : 0 ) {

				j = n; while ( 1 ) {

					n = j + - 12 | 0; f[ q >> 2 ] = n; m = f[ n >> 2 ] | 0; if ( ! m )r = n; else {

						n = j + - 8 | 0; k = f[ n >> 2 ] | 0; if ( ( k | 0 ) != ( m | 0 ) )f[ n >> 2 ] = k + ( ~ ( ( k + - 4 - m | 0 ) >>> 2 ) << 2 ); dn( m ); r = f[ q >> 2 ] | 0;

					} if ( ( r | 0 ) == ( l | 0 ) ) break; else j = r;

				}s = r;

			} else s = h; else {

				ld( p, g - i | 0 ); s = f[ q >> 2 ] | 0;

			}i = a + 196 | 0; g = f[ p >> 2 ] | 0; h = ( s - g | 0 ) / 12 | 0; r = a + 200 | 0; a = f[ r >> 2 ] | 0; j = f[ i >> 2 ] | 0; l = a - j >> 2; m = j; j = a; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( a = m + ( h << 2 ) | 0, ( a | 0 ) != ( j | 0 ) ) : 0 ) {

				f[ r >> 2 ] = j + ( ~ ( ( j + - 4 - a | 0 ) >>> 2 ) << 2 ); t = s; v = g;

			} else {

				t = s; v = g;

			} else {

				ff( i, h - l | 0 ); t = f[ q >> 2 ] | 0; v = f[ p >> 2 ] | 0;

			} if ( ( t | 0 ) == ( v | 0 ) ) {

				e = 1; u = c; return e | 0;

			}v = 0; do {

				dg( d, b ) | 0; t = f[ d >> 2 ] | 0; if ( t | 0 ) {

					l = f[ p >> 2 ] | 0; h = l + ( v * 12 | 0 ) | 0; g = l + ( v * 12 | 0 ) + 4 | 0; s = f[ g >> 2 ] | 0; a = f[ h >> 2 ] | 0; j = s - a >> 2; r = a; a = s; if ( t >>> 0 <= j >>> 0 ) if ( t >>> 0 < j >>> 0 ? ( s = r + ( t << 2 ) | 0, ( s | 0 ) != ( a | 0 ) ) : 0 ) {

						f[ g >> 2 ] = a + ( ~ ( ( a + - 4 - s | 0 ) >>> 2 ) << 2 ); w = l; x = t;

					} else {

						w = l; x = t;

					} else {

						ff( h, t - j | 0 ); w = f[ p >> 2 ] | 0; x = f[ d >> 2 ] | 0;

					}Qf( x, 1, b, f[ w + ( v * 12 | 0 ) >> 2 ] | 0 ) | 0; f[ ( f[ i >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] = f[ d >> 2 ];

				}v = v + 1 | 0;

			} while ( v >>> 0 < ( ( ( f[ q >> 2 ] | 0 ) - ( f[ p >> 2 ] | 0 ) | 0 ) / 12 | 0 ) >>> 0 );e = 1; u = c; return e | 0;

		} function lc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0; d = u; u = u + 32 | 0; e = d + 24 | 0; g = d + 20 | 0; h = d + 8 | 0; i = d + 4 | 0; j = d; f[ e >> 2 ] = 0; dg( e, f[ a >> 2 ] | 0 ) | 0; a:do if ( f[ e >> 2 ] | 0 ) {

				k = 0; while ( 1 ) {

					k = k + 1 | 0; if ( ! ( rc( a, c ) | 0 ) ) {

						l = 0; break;

					} if ( k >>> 0 >= ( f[ e >> 2 ] | 0 ) >>> 0 ) break a;

				}u = d; return l | 0;

			} while ( 0 );f[ g >> 2 ] = 0; dg( g, f[ a >> 2 ] | 0 ) | 0; b:do if ( ! ( f[ g >> 2 ] | 0 ) )m = 1; else {

				e = h + 11 | 0; k = 0; while ( 1 ) {

					f[ h >> 2 ] = 0; f[ h + 4 >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; o = f[ a >> 2 ] | 0; p = o + 8 | 0; q = f[ p + 4 >> 2 ] | 0; r = o + 16 | 0; s = r; t = f[ s >> 2 ] | 0; v = f[ s + 4 >> 2 ] | 0; do if ( ( q | 0 ) > ( v | 0 ) | ( ( q | 0 ) == ( v | 0 ) ? ( f[ p >> 2 ] | 0 ) >>> 0 > t >>> 0 : 0 ) ) {

						s = b[ ( f[ o >> 2 ] | 0 ) + t >> 0 ] | 0; w = Rj( t | 0, v | 0, 1, 0 ) | 0; x = r; f[ x >> 2 ] = w; f[ x + 4 >> 2 ] = I; x = s & 255; hg( h, x, 0 ); if ( s << 24 >> 24 ) {

							w = f[ a >> 2 ] | 0; y = Jh( h, 0 ) | 0; z = w + 8 | 0; A = f[ z >> 2 ] | 0; B = f[ z + 4 >> 2 ] | 0; z = w + 16 | 0; C = z; D = f[ C >> 2 ] | 0; E = s & 255; s = Rj( D | 0, f[ C + 4 >> 2 ] | 0, E | 0, 0 ) | 0; C = I; if ( ( B | 0 ) < ( C | 0 ) | ( B | 0 ) == ( C | 0 ) & A >>> 0 < s >>> 0 ) {

								F = 1; break;

							}ge( y | 0, ( f[ w >> 2 ] | 0 ) + D | 0, x | 0 ) | 0; x = z; D = Rj( f[ x >> 2 ] | 0, f[ x + 4 >> 2 ] | 0, E | 0, 0 ) | 0; E = z; f[ E >> 2 ] = D; f[ E + 4 >> 2 ] = I;

						}E = bj( 40 ) | 0; f[ E >> 2 ] = 0; f[ E + 4 >> 2 ] = 0; f[ E + 8 >> 2 ] = 0; f[ E + 12 >> 2 ] = 0; n[ E + 16 >> 2 ] = $( 1.0 ); D = E + 20 | 0; f[ D >> 2 ] = 0; f[ D + 4 >> 2 ] = 0; f[ D + 8 >> 2 ] = 0; f[ D + 12 >> 2 ] = 0; n[ E + 36 >> 2 ] = $( 1.0 ); f[ i >> 2 ] = E; if ( lc( a, E ) | 0 ) {

							E = f[ i >> 2 ] | 0; f[ i >> 2 ] = 0; f[ j >> 2 ] = E; Pd( c, h, j ) | 0; rf( j ); G = 0;

						} else G = 1; rf( i ); F = G;

					} else F = 1; while ( 0 );if ( ( b[ e >> 0 ] | 0 ) < 0 )dn( f[ h >> 2 ] | 0 ); k = k + 1 | 0; if ( F | 0 ) {

						m = 0; break b;

					} if ( k >>> 0 >= ( f[ g >> 2 ] | 0 ) >>> 0 ) {

						m = 1; break;

					}

				}

			} while ( 0 );l = m; u = d; return l | 0;

		} function mc( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; e = u; u = u + 176 | 0; g = e + 136 | 0; h = e + 64 | 0; i = e; j = e + 32 | 0; k = f[ ( f[ c + 4 >> 2 ] | 0 ) + 44 >> 2 ] | 0; l = bj( 88 ) | 0; f[ l + 4 >> 2 ] = 0; f[ l >> 2 ] = 2440; m = l + 12 | 0; f[ m >> 2 ] = 2420; n = l + 64 | 0; f[ n >> 2 ] = 0; f[ l + 68 >> 2 ] = 0; f[ l + 72 >> 2 ] = 0; o = l + 16 | 0; p = o + 44 | 0; do {

				f[ o >> 2 ] = 0; o = o + 4 | 0;

			} while ( ( o | 0 ) < ( p | 0 ) );f[ l + 76 >> 2 ] = k; f[ l + 80 >> 2 ] = d; f[ l + 84 >> 2 ] = 0; q = l; r = h + 4 | 0; f[ r >> 2 ] = 2420; s = h + 56 | 0; f[ s >> 2 ] = 0; t = h + 60 | 0; f[ t >> 2 ] = 0; f[ h + 64 >> 2 ] = 0; o = h + 8 | 0; p = o + 44 | 0; do {

				f[ o >> 2 ] = 0; o = o + 4 | 0;

			} while ( ( o | 0 ) < ( p | 0 ) );o = f[ c + 8 >> 2 ] | 0; f[ i >> 2 ] = 2420; c = i + 4 | 0; p = c + 4 | 0; f[ p >> 2 ] = 0; f[ p + 4 >> 2 ] = 0; f[ p + 8 >> 2 ] = 0; f[ p + 12 >> 2 ] = 0; f[ p + 16 >> 2 ] = 0; f[ p + 20 >> 2 ] = 0; p = o; f[ c >> 2 ] = p; c = ( ( f[ p + 4 >> 2 ] | 0 ) - ( f[ o >> 2 ] | 0 ) >> 2 >>> 0 ) / 3 | 0; b[ g >> 0 ] = 0; le( i + 8 | 0, c, g ); Sa[ f[ ( f[ i >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( i ); jd( j, i ); jd( g, j ); f[ h >> 2 ] = f[ g + 4 >> 2 ]; c = h + 4 | 0; wd( c, g ) | 0; f[ g >> 2 ] = 2420; p = f[ g + 20 >> 2 ] | 0; if ( p | 0 )dn( p ); p = f[ g + 8 >> 2 ] | 0; if ( p | 0 )dn( p ); f[ h + 36 >> 2 ] = o; f[ h + 40 >> 2 ] = d; f[ h + 44 >> 2 ] = k; f[ h + 48 >> 2 ] = l; f[ j >> 2 ] = 2420; k = f[ j + 20 >> 2 ] | 0; if ( k | 0 )dn( k ); k = f[ j + 8 >> 2 ] | 0; if ( k | 0 )dn( k ); f[ l + 8 >> 2 ] = f[ h >> 2 ]; wd( m, c ) | 0; c = l + 44 | 0; l = h + 36 | 0; f[ c >> 2 ] = f[ l >> 2 ]; f[ c + 4 >> 2 ] = f[ l + 4 >> 2 ]; f[ c + 8 >> 2 ] = f[ l + 8 >> 2 ]; f[ c + 12 >> 2 ] = f[ l + 12 >> 2 ]; b[ c + 16 >> 0 ] = b[ l + 16 >> 0 ] | 0; zd( n, f[ s >> 2 ] | 0, f[ t >> 2 ] | 0 ); f[ a >> 2 ] = q; f[ i >> 2 ] = 2420; q = f[ i + 20 >> 2 ] | 0; if ( q | 0 )dn( q ); q = f[ i + 8 >> 2 ] | 0; if ( q | 0 )dn( q ); q = f[ s >> 2 ] | 0; if ( q | 0 ) {

				s = f[ t >> 2 ] | 0; if ( ( s | 0 ) != ( q | 0 ) )f[ t >> 2 ] = s + ( ~ ( ( s + - 4 - q | 0 ) >>> 2 ) << 2 ); dn( q );

			}f[ r >> 2 ] = 2420; r = f[ h + 24 >> 2 ] | 0; if ( r | 0 )dn( r ); r = f[ h + 12 >> 2 ] | 0; if ( ! r ) {

				u = e; return;

			}dn( r ); u = e; return;

		} function nc( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0; g = a + 8 | 0; f[ g >> 2 ] = e; h = a + 32 | 0; i = a + 36 | 0; j = f[ i >> 2 ] | 0; k = f[ h >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( l >>> 0 >= e >>> 0 ) if ( l >>> 0 > e >>> 0 ? ( j = m + ( e << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = e;

			} else n = e; else {

				ff( h, e - l | 0 ); n = f[ g >> 2 ] | 0;

			}l = e >>> 0 > 1073741823 ? - 1 : e << 2; h = an( l ) | 0; Vf( h | 0, 0, l | 0 ) | 0; if ( ( n | 0 ) > 0 ) {

				l = a + 16 | 0; j = a + 32 | 0; k = a + 12 | 0; i = 0; do {

					m = f[ h + ( i << 2 ) >> 2 ] | 0; o = f[ l >> 2 ] | 0; if ( ( m | 0 ) > ( o | 0 ) ) {

						p = f[ j >> 2 ] | 0; f[ p + ( i << 2 ) >> 2 ] = o; q = p;

					} else {

						p = f[ k >> 2 ] | 0; o = f[ j >> 2 ] | 0; f[ o + ( i << 2 ) >> 2 ] = ( m | 0 ) < ( p | 0 ) ? p : m; q = o;

					}i = i + 1 | 0; r = f[ g >> 2 ] | 0;

				} while ( ( i | 0 ) < ( r | 0 ) );if ( ( r | 0 ) > 0 ) {

					i = a + 20 | 0; j = 0; do {

						o = ( f[ b + ( j << 2 ) >> 2 ] | 0 ) + ( f[ q + ( j << 2 ) >> 2 ] | 0 ) | 0; m = c + ( j << 2 ) | 0; f[ m >> 2 ] = o; if ( ( o | 0 ) <= ( f[ l >> 2 ] | 0 ) ) {

							if ( ( o | 0 ) < ( f[ k >> 2 ] | 0 ) ) {

								s = ( f[ i >> 2 ] | 0 ) + o | 0; t = 18;

							}

						} else {

							s = o - ( f[ i >> 2 ] | 0 ) | 0; t = 18;

						} if ( ( t | 0 ) == 18 ) {

							t = 0; f[ m >> 2 ] = s;

						}j = j + 1 | 0; m = f[ g >> 2 ] | 0;

					} while ( ( j | 0 ) < ( m | 0 ) );u = m;

				} else u = r;

			} else u = n; if ( ( e | 0 ) >= ( d | 0 ) ) {

				bn( h ); return 1;

			}n = 0 - e | 0; r = a + 16 | 0; j = a + 32 | 0; s = a + 12 | 0; i = a + 20 | 0; a = e; k = u; while ( 1 ) {

				u = c + ( a << 2 ) | 0; l = u + ( n << 2 ) | 0; q = b + ( a << 2 ) | 0; if ( ( k | 0 ) > 0 ) {

					m = 0; do {

						o = f[ l + ( m << 2 ) >> 2 ] | 0; p = f[ r >> 2 ] | 0; if ( ( o | 0 ) > ( p | 0 ) ) {

							v = f[ j >> 2 ] | 0; f[ v + ( m << 2 ) >> 2 ] = p; w = v;

						} else {

							v = f[ s >> 2 ] | 0; p = f[ j >> 2 ] | 0; f[ p + ( m << 2 ) >> 2 ] = ( o | 0 ) < ( v | 0 ) ? v : o; w = p;

						}m = m + 1 | 0; x = f[ g >> 2 ] | 0;

					} while ( ( m | 0 ) < ( x | 0 ) );if ( ( x | 0 ) > 0 ) {

						m = 0; do {

							l = ( f[ q + ( m << 2 ) >> 2 ] | 0 ) + ( f[ w + ( m << 2 ) >> 2 ] | 0 ) | 0; p = u + ( m << 2 ) | 0; f[ p >> 2 ] = l; if ( ( l | 0 ) <= ( f[ r >> 2 ] | 0 ) ) {

								if ( ( l | 0 ) < ( f[ s >> 2 ] | 0 ) ) {

									y = ( f[ i >> 2 ] | 0 ) + l | 0; t = 33;

								}

							} else {

								y = l - ( f[ i >> 2 ] | 0 ) | 0; t = 33;

							} if ( ( t | 0 ) == 33 ) {

								t = 0; f[ p >> 2 ] = y;

							}m = m + 1 | 0; p = f[ g >> 2 ] | 0;

						} while ( ( m | 0 ) < ( p | 0 ) );z = p;

					} else z = x;

				} else z = k; a = a + e | 0; if ( ( a | 0 ) >= ( d | 0 ) ) break; else k = z;

			}bn( h ); return 1;

		} function oc( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0; d = u; u = u + 16 | 0; e = d; g = a + 68 | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + 1; g = ( f[ a + 8 + ( b * 12 | 0 ) + 4 >> 2 ] | 0 ) - ( f[ a + 8 + ( b * 12 | 0 ) >> 2 ] | 0 ) | 0; h = g >> 2; if ( ( g | 0 ) <= 0 ) {

				u = d; return;

			}g = a + 4 | 0; i = a + 56 | 0; j = a + 72 | 0; k = f[ c >> 2 ] | 0; c = k + 4 | 0; l = k + 8 | 0; m = a + 76 | 0; n = 0; o = f[ a + 44 + ( b << 2 ) >> 2 ] | 0; while ( 1 ) {

				b = ( o | 0 ) == - 1; p = b ? - 1 : ( o >>> 0 ) / 3 | 0; q = ( f[ i >> 2 ] | 0 ) + ( p >>> 5 << 2 ) | 0; f[ q >> 2 ] = f[ q >> 2 ] | 1 << ( p & 31 ); f[ j >> 2 ] = ( f[ j >> 2 ] | 0 ) + 1; do if ( n ) {

					if ( b )r = - 1; else r = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( o | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( o | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; f[ m >> 2 ] = r; f[ e >> 2 ] = r; p = f[ c >> 2 ] | 0; if ( p >>> 0 < ( f[ l >> 2 ] | 0 ) >>> 0 ) {

						f[ p >> 2 ] = r; f[ c >> 2 ] = p + 4;

					} else xf( k, e ); if ( ! ( n & 1 ) ) {

						p = o + 1 | 0; if ( b ) {

							s = - 1; break;

						}t = ( ( p >>> 0 ) % 3 | 0 | 0 ) == 0 ? o + - 2 | 0 : p; v = 35; break;

					} if ( ! b ) if ( ! ( ( o >>> 0 ) % 3 | 0 ) ) {

						t = o + 2 | 0; v = 35; break;

					} else {

						t = o + - 1 | 0; v = 35; break;

					} else s = - 1;

				} else {

					if ( b )w = - 1; else w = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( o | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( o | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; f[ e >> 2 ] = w; p = f[ c >> 2 ] | 0; if ( p >>> 0 < ( f[ l >> 2 ] | 0 ) >>> 0 ) {

						f[ p >> 2 ] = w; f[ c >> 2 ] = p + 4;

					} else xf( k, e ); p = o + 1 | 0; if ( ! b ? ( q = ( ( p >>> 0 ) % 3 | 0 | 0 ) == 0 ? o + - 2 | 0 : p, ( q | 0 ) != - 1 ) : 0 )x = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( q | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( q | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; else x = - 1; f[ e >> 2 ] = x; q = f[ c >> 2 ] | 0; if ( q >>> 0 < ( f[ l >> 2 ] | 0 ) >>> 0 ) {

						f[ q >> 2 ] = x; f[ c >> 2 ] = q + 4;

					} else xf( k, e ); if ( ! b ? ( q = ( ( ( o >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + o | 0, ( q | 0 ) != - 1 ) : 0 )y = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( q | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( q | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; else y = - 1; f[ m >> 2 ] = y; f[ e >> 2 ] = y; q = f[ c >> 2 ] | 0; if ( q >>> 0 < ( f[ l >> 2 ] | 0 ) >>> 0 ) {

						f[ q >> 2 ] = y; f[ c >> 2 ] = q + 4;

					} else xf( k, e ); t = o; v = 35;

				} while ( 0 );if ( ( v | 0 ) == 35 ) {

					v = 0; if ( ( t | 0 ) == - 1 )s = - 1; else s = f[ ( f[ ( f[ g >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( t << 2 ) >> 2 ] | 0;

				}n = n + 1 | 0; if ( ( n | 0 ) >= ( h | 0 ) ) break; else o = s;

			}u = d; return;

		} function pc( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0; d = u; u = u + 16 | 0; e = d + 8 | 0; g = d; h = d + 4 | 0; if ( ! ( Uf( a, b ) | 0 ) ) {

				i = 0; u = d; return i | 0;

			}j = b + 96 | 0; k = b + 100 | 0; b = f[ k >> 2 ] | 0; l = f[ j >> 2 ] | 0; if ( ( b | 0 ) == ( l | 0 ) ) {

				i = 1; u = d; return i | 0;

			}m = a + 56 | 0; n = a + 8 | 0; o = a + 12 | 0; p = a + 20 | 0; q = a + 24 | 0; r = a + 32 | 0; s = a + 36 | 0; t = a + 68 | 0; v = a + 76 | 0; w = f[ c >> 2 ] | 0; c = w + 4 | 0; x = w + 8 | 0; y = a + 72 | 0; z = w; A = 0; B = l; l = b; while ( 1 ) {

				if ( ! ( f[ ( f[ m >> 2 ] | 0 ) + ( A >>> 5 << 2 ) >> 2 ] & 1 << ( A & 31 ) ) ) {

					b = A * 3 | 0; f[ g >> 2 ] = b; f[ e >> 2 ] = f[ g >> 2 ]; Ob( a, 0, e ); C = ( f[ o >> 2 ] | 0 ) - ( f[ n >> 2 ] | 0 ) >> 2; f[ g >> 2 ] = b + 1; f[ e >> 2 ] = f[ g >> 2 ]; Ob( a, 1, e ); D = ( f[ q >> 2 ] | 0 ) - ( f[ p >> 2 ] | 0 ) >> 2; E = D >>> 0 > C >>> 0; f[ g >> 2 ] = b + 2; f[ e >> 2 ] = f[ g >> 2 ]; Ob( a, 2, e ); b = ( f[ s >> 2 ] | 0 ) - ( f[ r >> 2 ] | 0 ) >> 2 >>> 0 > ( E ? D : C ) >>> 0 ? 2 : E ? 1 : ( ( C | 0 ) == 0 ) << 31 >> 31; if ( ( f[ t >> 2 ] | 0 ) > 0 ) {

						C = f[ v >> 2 ] | 0; f[ e >> 2 ] = C; E = f[ c >> 2 ] | 0; if ( E >>> 0 < ( f[ x >> 2 ] | 0 ) >>> 0 ) {

							f[ E >> 2 ] = C; f[ c >> 2 ] = E + 4;

						} else xf( w, e ); E = f[ a + 44 + ( b << 2 ) >> 2 ] | 0; if ( ( E | 0 ) == - 1 )F = - 1; else F = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( E | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( E | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; f[ e >> 2 ] = F; E = f[ c >> 2 ] | 0; if ( E >>> 0 < ( f[ x >> 2 ] | 0 ) >>> 0 ) {

							f[ E >> 2 ] = F; f[ c >> 2 ] = E + 4;

						} else xf( w, e ); E = ( f[ y >> 2 ] | 0 ) + 2 | 0; f[ y >> 2 ] = E; if ( E & 1 | 0 ) {

							f[ e >> 2 ] = F; E = f[ c >> 2 ] | 0; if ( E >>> 0 < ( f[ x >> 2 ] | 0 ) >>> 0 ) {

								f[ E >> 2 ] = F; f[ c >> 2 ] = E + 4;

							} else xf( w, e ); f[ y >> 2 ] = ( f[ y >> 2 ] | 0 ) + 1;

						}

					}f[ h >> 2 ] = z; f[ e >> 2 ] = f[ h >> 2 ]; oc( a, b, e ); G = f[ j >> 2 ] | 0; H = f[ k >> 2 ] | 0;

				} else {

					G = B; H = l;

				}A = A + 1 | 0; if ( A >>> 0 >= ( ( H - G | 0 ) / 12 | 0 ) >>> 0 ) {

					i = 1; break;

				} else {

					B = G; l = H;

				}

			}u = d; return i | 0;

		} function qc( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; c = a + 148 | 0; d = f[ b >> 2 ] | 0; b = ( d | 0 ) == - 1; e = d + 1 | 0; do if ( ! b ) {

				g = ( ( e >>> 0 ) % 3 | 0 | 0 ) == 0 ? d + - 2 | 0 : e; if ( ! ( ( d >>> 0 ) % 3 | 0 ) ) {

					h = d + 2 | 0; i = g; break;

				} else {

					h = d + - 1 | 0; i = g; break;

				}

			} else {

				h = - 1; i = - 1;

			} while ( 0 );switch ( f[ a + 168 >> 2 ] | 0 ) {

				case 1:case 0: {

					if ( ( i | 0 ) == - 1 )j = - 1; else j = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0; e = f[ a + 156 >> 2 ] | 0; g = e + ( j << 2 ) | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + 1; if ( ( h | 0 ) == - 1 ) {

						k = 1; l = - 1; m = e; n = 28;

					} else {

						k = 1; l = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0; m = e; n = 28;

					} break;

				} case 5: {

					if ( b )o = - 1; else o = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] | 0; e = f[ a + 156 >> 2 ] | 0; g = e + ( o << 2 ) | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + 1; if ( ( i | 0 ) == - 1 )p = - 1; else p = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0; g = e + ( p << 2 ) | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + 1; if ( ( h | 0 ) == - 1 ) {

						k = 2; l = - 1; m = e; n = 28;

					} else {

						k = 2; l = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0; m = e; n = 28;

					} break;

				} case 3: {

					if ( b )q = - 1; else q = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] | 0; e = f[ a + 156 >> 2 ] | 0; g = e + ( q << 2 ) | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + 1; if ( ( i | 0 ) == - 1 )r = - 1; else r = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0; g = e + ( r << 2 ) | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + 2; if ( ( h | 0 ) == - 1 ) {

						k = 1; l = - 1; m = e; n = 28;

					} else {

						k = 1; l = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0; m = e; n = 28;

					} break;

				} case 7: {

					if ( b )s = - 1; else s = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] | 0; d = f[ a + 156 >> 2 ] | 0; b = d + ( s << 2 ) | 0; f[ b >> 2 ] = ( f[ b >> 2 ] | 0 ) + 2; if ( ( i | 0 ) == - 1 )t = - 1; else t = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0; b = d + ( t << 2 ) | 0; f[ b >> 2 ] = ( f[ b >> 2 ] | 0 ) + 2; if ( ( h | 0 ) == - 1 ) {

						k = 2; l = - 1; m = d; n = 28;

					} else {

						k = 2; l = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0; m = d; n = 28;

					} break;

				} default: {}

			} if ( ( n | 0 ) == 28 ) {

				n = m + ( l << 2 ) | 0; f[ n >> 2 ] = ( f[ n >> 2 ] | 0 ) + k;

			} if ( ( i | 0 ) == - 1 )u = - 1; else u = f[ ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0; i = f[ ( f[ a + 156 >> 2 ] | 0 ) + ( u << 2 ) >> 2 ] | 0; u = f[ a + 176 >> 2 ] | 0; if ( ( i | 0 ) < ( u | 0 ) ) {

				v = u; w = v - u | 0; x = a + 172 | 0; f[ x >> 2 ] = w; return;

			}c = f[ a + 180 >> 2 ] | 0; v = ( i | 0 ) > ( c | 0 ) ? c : i; w = v - u | 0; x = a + 172 | 0; f[ x >> 2 ] = w; return;

		} function rc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0; d = u; u = u + 32 | 0; e = d + 16 | 0; g = d + 12 | 0; h = d; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; i = f[ a >> 2 ] | 0; j = i + 8 | 0; k = f[ j + 4 >> 2 ] | 0; l = i + 16 | 0; m = l; n = f[ m >> 2 ] | 0; o = f[ m + 4 >> 2 ] | 0; do if ( ( k | 0 ) > ( o | 0 ) | ( ( k | 0 ) == ( o | 0 ) ? ( f[ j >> 2 ] | 0 ) >>> 0 > n >>> 0 : 0 ) ) {

				m = b[ ( f[ i >> 2 ] | 0 ) + n >> 0 ] | 0; p = Rj( n | 0, o | 0, 1, 0 ) | 0; q = l; f[ q >> 2 ] = p; f[ q + 4 >> 2 ] = I; q = m & 255; hg( e, q, 0 ); if ( m << 24 >> 24 ) {

					p = f[ a >> 2 ] | 0; r = Jh( e, 0 ) | 0; s = p + 8 | 0; t = f[ s >> 2 ] | 0; v = f[ s + 4 >> 2 ] | 0; s = p + 16 | 0; w = s; x = f[ w >> 2 ] | 0; y = m & 255; m = Rj( x | 0, f[ w + 4 >> 2 ] | 0, y | 0, 0 ) | 0; w = I; if ( ( v | 0 ) < ( w | 0 ) | ( v | 0 ) == ( w | 0 ) & t >>> 0 < m >>> 0 ) {

						z = 0; break;

					}ge( r | 0, ( f[ p >> 2 ] | 0 ) + x | 0, q | 0 ) | 0; q = s; x = Rj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, y | 0, 0 ) | 0; y = s; f[ y >> 2 ] = x; f[ y + 4 >> 2 ] = I;

				}f[ g >> 2 ] = 0; y = ( dg( g, f[ a >> 2 ] | 0 ) | 0 ) ^ 1; x = f[ g >> 2 ] | 0; if ( ( x | 0 ) == 0 | y )A = 0; else {

					f[ h >> 2 ] = 0; y = h + 4 | 0; f[ y >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; if ( ( x | 0 ) < 0 )um( h ); s = bj( x ) | 0; f[ y >> 2 ] = s; f[ h >> 2 ] = s; f[ h + 8 >> 2 ] = s + x; q = x; x = s; do {

						b[ x >> 0 ] = 0; x = ( f[ y >> 2 ] | 0 ) + 1 | 0; f[ y >> 2 ] = x; q = q + - 1 | 0;

					} while ( ( q | 0 ) != 0 );q = f[ g >> 2 ] | 0; x = f[ a >> 2 ] | 0; s = x + 8 | 0; p = f[ s >> 2 ] | 0; r = f[ s + 4 >> 2 ] | 0; s = x + 16 | 0; m = s; t = f[ m >> 2 ] | 0; w = Rj( t | 0, f[ m + 4 >> 2 ] | 0, q | 0, 0 ) | 0; m = I; if ( ( r | 0 ) < ( m | 0 ) | ( r | 0 ) == ( m | 0 ) & p >>> 0 < w >>> 0 )B = 0; else {

						ge( f[ h >> 2 ] | 0, ( f[ x >> 2 ] | 0 ) + t | 0, q | 0 ) | 0; t = s; x = Rj( f[ t >> 2 ] | 0, f[ t + 4 >> 2 ] | 0, q | 0, 0 ) | 0; q = s; f[ q >> 2 ] = x; f[ q + 4 >> 2 ] = I; Fi( c, e, h ); B = 1;

					}q = f[ h >> 2 ] | 0; if ( q | 0 ) {

						if ( ( f[ y >> 2 ] | 0 ) != ( q | 0 ) )f[ y >> 2 ] = q; dn( q );

					}A = B;

				}z = A;

			} else z = 0; while ( 0 );if ( ( b[ e + 11 >> 0 ] | 0 ) >= 0 ) {

				u = d; return z | 0;

			}dn( f[ e >> 2 ] | 0 ); u = d; return z | 0;

		} function sc( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0, q = 0, r = 0, s = La, t = La, u = La, v = 0, w = 0, x = 0, y = 0, z = 0; c = f[ b >> 2 ] | 0; b = a + 4 | 0; d = f[ b >> 2 ] | 0; e = ( d | 0 ) == 0; a:do if ( ! e ) {

				g = d + - 1 | 0; h = ( g & d | 0 ) == 0; if ( ! h ) if ( c >>> 0 < d >>> 0 )i = c; else i = ( c >>> 0 ) % ( d >>> 0 ) | 0; else i = g & c; j = f[ ( f[ a >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0; if ( ! j )k = i; else {

					if ( h ) {

						h = j; while ( 1 ) {

							l = f[ h >> 2 ] | 0; if ( ! l ) {

								k = i; break a;

							}m = f[ l + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) == ( c | 0 ) | ( m & g | 0 ) == ( i | 0 ) ) ) {

								k = i; break a;

							} if ( ( f[ l + 8 >> 2 ] | 0 ) == ( c | 0 ) ) {

								o = l; break;

							} else h = l;

						}p = o + 12 | 0; return p | 0;

					} else q = j; while ( 1 ) {

						h = f[ q >> 2 ] | 0; if ( ! h ) {

							k = i; break a;

						}g = f[ h + 4 >> 2 ] | 0; if ( ( g | 0 ) != ( c | 0 ) ) {

							if ( g >>> 0 < d >>> 0 )r = g; else r = ( g >>> 0 ) % ( d >>> 0 ) | 0; if ( ( r | 0 ) != ( i | 0 ) ) {

								k = i; break a;

							}

						} if ( ( f[ h + 8 >> 2 ] | 0 ) == ( c | 0 ) ) {

							o = h; break;

						} else q = h;

					}p = o + 12 | 0; return p | 0;

				}

			} else k = 0; while ( 0 );q = bj( 16 ) | 0; f[ q + 8 >> 2 ] = c; f[ q + 12 >> 2 ] = 0; f[ q + 4 >> 2 ] = c; f[ q >> 2 ] = 0; i = a + 12 | 0; s = $( ( ( f[ i >> 2 ] | 0 ) + 1 | 0 ) >>> 0 ); t = $( d >>> 0 ); u = $( n[ a + 16 >> 2 ] ); do if ( e | $( u * t ) < s ) {

				r = d << 1 | ( d >>> 0 < 3 | ( d + - 1 & d | 0 ) != 0 ) & 1; j = ~ ~ $( W( $( s / u ) ) ) >>> 0; Te( a, r >>> 0 < j >>> 0 ? j : r ); r = f[ b >> 2 ] | 0; j = r + - 1 | 0; if ( ! ( j & r ) ) {

					v = r; w = j & c; break;

				} if ( c >>> 0 < r >>> 0 ) {

					v = r; w = c;

				} else {

					v = r; w = ( c >>> 0 ) % ( r >>> 0 ) | 0;

				}

			} else {

				v = d; w = k;

			} while ( 0 );k = ( f[ a >> 2 ] | 0 ) + ( w << 2 ) | 0; w = f[ k >> 2 ] | 0; if ( ! w ) {

				d = a + 8 | 0; f[ q >> 2 ] = f[ d >> 2 ]; f[ d >> 2 ] = q; f[ k >> 2 ] = d; d = f[ q >> 2 ] | 0; if ( d | 0 ) {

					k = f[ d + 4 >> 2 ] | 0; d = v + - 1 | 0; if ( d & v ) if ( k >>> 0 < v >>> 0 )x = k; else x = ( k >>> 0 ) % ( v >>> 0 ) | 0; else x = k & d; y = ( f[ a >> 2 ] | 0 ) + ( x << 2 ) | 0; z = 30;

				}

			} else {

				f[ q >> 2 ] = f[ w >> 2 ]; y = w; z = 30;

			} if ( ( z | 0 ) == 30 )f[ y >> 2 ] = q; f[ i >> 2 ] = ( f[ i >> 2 ] | 0 ) + 1; o = q; p = o + 12 | 0; return p | 0;

		} function tc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0; f[ a >> 2 ] = f[ c >> 2 ]; d = c + 4 | 0; f[ a + 4 >> 2 ] = f[ d >> 2 ]; e = c + 8 | 0; f[ a + 8 >> 2 ] = f[ e >> 2 ]; g = c + 12 | 0; f[ a + 12 >> 2 ] = f[ g >> 2 ]; f[ d >> 2 ] = 0; f[ e >> 2 ] = 0; f[ g >> 2 ] = 0; g = c + 16 | 0; f[ a + 16 >> 2 ] = f[ g >> 2 ]; e = c + 20 | 0; f[ a + 20 >> 2 ] = f[ e >> 2 ]; d = c + 24 | 0; f[ a + 24 >> 2 ] = f[ d >> 2 ]; f[ g >> 2 ] = 0; f[ e >> 2 ] = 0; f[ d >> 2 ] = 0; b[ a + 28 >> 0 ] = b[ c + 28 >> 0 ] | 0; d = a + 32 | 0; e = c + 32 | 0; f[ d >> 2 ] = 0; g = a + 36 | 0; f[ g >> 2 ] = 0; f[ a + 40 >> 2 ] = 0; f[ d >> 2 ] = f[ e >> 2 ]; d = c + 36 | 0; f[ g >> 2 ] = f[ d >> 2 ]; g = c + 40 | 0; f[ a + 40 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ d >> 2 ] = 0; f[ e >> 2 ] = 0; e = a + 44 | 0; d = c + 44 | 0; f[ e >> 2 ] = 0; g = a + 48 | 0; f[ g >> 2 ] = 0; f[ a + 52 >> 2 ] = 0; f[ e >> 2 ] = f[ d >> 2 ]; e = c + 48 | 0; f[ g >> 2 ] = f[ e >> 2 ]; g = c + 52 | 0; f[ a + 52 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ e >> 2 ] = 0; f[ d >> 2 ] = 0; d = a + 56 | 0; e = c + 56 | 0; f[ d >> 2 ] = 0; g = a + 60 | 0; f[ g >> 2 ] = 0; f[ a + 64 >> 2 ] = 0; f[ d >> 2 ] = f[ e >> 2 ]; d = c + 60 | 0; f[ g >> 2 ] = f[ d >> 2 ]; g = c + 64 | 0; f[ a + 64 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ d >> 2 ] = 0; f[ e >> 2 ] = 0; f[ a + 68 >> 2 ] = f[ c + 68 >> 2 ]; f[ a + 72 >> 2 ] = f[ c + 72 >> 2 ]; e = a + 76 | 0; d = c + 76 | 0; f[ e >> 2 ] = 0; g = a + 80 | 0; f[ g >> 2 ] = 0; f[ a + 84 >> 2 ] = 0; f[ e >> 2 ] = f[ d >> 2 ]; e = c + 80 | 0; f[ g >> 2 ] = f[ e >> 2 ]; g = c + 84 | 0; f[ a + 84 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ e >> 2 ] = 0; f[ d >> 2 ] = 0; d = a + 88 | 0; e = c + 88 | 0; f[ d >> 2 ] = 0; g = a + 92 | 0; f[ g >> 2 ] = 0; f[ a + 96 >> 2 ] = 0; f[ d >> 2 ] = f[ e >> 2 ]; d = c + 92 | 0; f[ g >> 2 ] = f[ d >> 2 ]; g = c + 96 | 0; f[ a + 96 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ d >> 2 ] = 0; f[ e >> 2 ] = 0; b[ a + 100 >> 0 ] = b[ c + 100 >> 0 ] | 0; e = a + 104 | 0; d = c + 104 | 0; f[ e >> 2 ] = 0; g = a + 108 | 0; f[ g >> 2 ] = 0; f[ a + 112 >> 2 ] = 0; f[ e >> 2 ] = f[ d >> 2 ]; e = c + 108 | 0; f[ g >> 2 ] = f[ e >> 2 ]; g = c + 112 | 0; f[ a + 112 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ e >> 2 ] = 0; f[ d >> 2 ] = 0; d = a + 116 | 0; e = c + 116 | 0; f[ d >> 2 ] = 0; g = a + 120 | 0; f[ g >> 2 ] = 0; f[ a + 124 >> 2 ] = 0; f[ d >> 2 ] = f[ e >> 2 ]; d = c + 120 | 0; f[ g >> 2 ] = f[ d >> 2 ]; g = c + 124 | 0; f[ a + 124 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ d >> 2 ] = 0; f[ e >> 2 ] = 0; f[ a + 128 >> 2 ] = f[ c + 128 >> 2 ]; e = a + 132 | 0; d = c + 132 | 0; f[ e >> 2 ] = 0; g = a + 136 | 0; f[ g >> 2 ] = 0; f[ a + 140 >> 2 ] = 0; f[ e >> 2 ] = f[ d >> 2 ]; e = c + 136 | 0; f[ g >> 2 ] = f[ e >> 2 ]; g = c + 140 | 0; f[ a + 140 >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = 0; f[ e >> 2 ] = 0; f[ d >> 2 ] = 0; return;

		} function uc( a, c, e, g, h ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; h = h | 0; var i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0; i = u; u = u + 32 | 0; j = i + 16 | 0; k = i + 12 | 0; l = i; m = c + 24 | 0; n = b[ m >> 0 ] | 0; o = n << 24 >> 24; p = f[ a + 80 >> 2 ] | 0; a = X( p, o ) | 0; q = f[ c + 28 >> 2 ] | 0; if ( ( q | 0 ) == ( e | 0 ) | ( q | 0 ) == ( g | 0 ) ? b[ c + 84 >> 0 ] | 0 : 0 ) {

				g = ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( f[ c + 48 >> 2 ] | 0 ) | 0; qd( h, g, g + ( a << 1 ) | 0 ); r = 1; u = i; return r | 0;

			}f[ l >> 2 ] = 0; g = l + 4 | 0; f[ g >> 2 ] = 0; f[ l + 8 >> 2 ] = 0; do if ( n << 24 >> 24 ) if ( n << 24 >> 24 < 0 )um( l ); else {

				q = o << 1; e = bj( q ) | 0; f[ l >> 2 ] = e; s = e + ( o << 1 ) | 0; f[ l + 8 >> 2 ] = s; Vf( e | 0, 0, q | 0 ) | 0; f[ g >> 2 ] = s; break;

			} while ( 0 );qd( h, 0, 0 + ( a << 1 ) | 0 ); a:do if ( ! p )t = 1; else {

				a = c + 84 | 0; s = c + 68 | 0; if ( n << 24 >> 24 > 0 ) {

					v = 0; w = 0;

				} else {

					q = 0; while ( 1 ) {

						if ( ! ( b[ a >> 0 ] | 0 ) )x = f[ ( f[ s >> 2 ] | 0 ) + ( q << 2 ) >> 2 ] | 0; else x = q; e = f[ l >> 2 ] | 0; f[ k >> 2 ] = x; y = b[ m >> 0 ] | 0; f[ j >> 2 ] = f[ k >> 2 ]; if ( ! ( mb( c, j, y, e ) | 0 ) ) {

							t = 0; break a;

						}q = q + 1 | 0; if ( q >>> 0 >= p >>> 0 ) {

							t = 1; break a;

						}

					}

				} while ( 1 ) {

					if ( ! ( b[ a >> 0 ] | 0 ) )z = f[ ( f[ s >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else z = w; q = f[ l >> 2 ] | 0; f[ k >> 2 ] = z; e = b[ m >> 0 ] | 0; f[ j >> 2 ] = f[ k >> 2 ]; if ( ! ( mb( c, j, e, q ) | 0 ) ) {

						t = 0; break a;

					}q = f[ l >> 2 ] | 0; e = f[ h >> 2 ] | 0; y = 0; A = v; while ( 1 ) {

						d[ e + ( A << 1 ) >> 1 ] = d[ q + ( y << 1 ) >> 1 ] | 0; y = y + 1 | 0; if ( ( y | 0 ) == ( o | 0 ) ) break; else A = A + 1 | 0;

					}w = w + 1 | 0; if ( w >>> 0 >= p >>> 0 ) {

						t = 1; break;

					} else v = v + o | 0;

				}

			} while ( 0 );o = f[ l >> 2 ] | 0; if ( o | 0 ) {

				l = f[ g >> 2 ] | 0; if ( ( l | 0 ) != ( o | 0 ) )f[ g >> 2 ] = l + ( ~ ( ( l + - 2 - o | 0 ) >>> 1 ) << 1 ); dn( o );

			}r = t; u = i; return r | 0;

		} function vc( a, c, e, g, h ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; h = h | 0; var i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0; i = u; u = u + 32 | 0; j = i + 16 | 0; k = i + 12 | 0; l = i; m = c + 24 | 0; n = b[ m >> 0 ] | 0; o = n << 24 >> 24; p = f[ a + 80 >> 2 ] | 0; a = X( p, o ) | 0; q = f[ c + 28 >> 2 ] | 0; if ( ( q | 0 ) == ( e | 0 ) | ( q | 0 ) == ( g | 0 ) ? b[ c + 84 >> 0 ] | 0 : 0 ) {

				g = ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( f[ c + 48 >> 2 ] | 0 ) | 0; qd( h, g, g + ( a << 1 ) | 0 ); r = 1; u = i; return r | 0;

			}f[ l >> 2 ] = 0; g = l + 4 | 0; f[ g >> 2 ] = 0; f[ l + 8 >> 2 ] = 0; do if ( n << 24 >> 24 ) if ( n << 24 >> 24 < 0 )um( l ); else {

				q = o << 1; e = bj( q ) | 0; f[ l >> 2 ] = e; s = e + ( o << 1 ) | 0; f[ l + 8 >> 2 ] = s; Vf( e | 0, 0, q | 0 ) | 0; f[ g >> 2 ] = s; break;

			} while ( 0 );qd( h, 0, 0 + ( a << 1 ) | 0 ); a:do if ( ! p )t = 1; else {

				a = c + 84 | 0; s = c + 68 | 0; if ( n << 24 >> 24 > 0 ) {

					v = 0; w = 0;

				} else {

					q = 0; while ( 1 ) {

						if ( ! ( b[ a >> 0 ] | 0 ) )x = f[ ( f[ s >> 2 ] | 0 ) + ( q << 2 ) >> 2 ] | 0; else x = q; e = f[ l >> 2 ] | 0; f[ k >> 2 ] = x; y = b[ m >> 0 ] | 0; f[ j >> 2 ] = f[ k >> 2 ]; if ( ! ( nb( c, j, y, e ) | 0 ) ) {

							t = 0; break a;

						}q = q + 1 | 0; if ( q >>> 0 >= p >>> 0 ) {

							t = 1; break a;

						}

					}

				} while ( 1 ) {

					if ( ! ( b[ a >> 0 ] | 0 ) )z = f[ ( f[ s >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else z = w; q = f[ l >> 2 ] | 0; f[ k >> 2 ] = z; e = b[ m >> 0 ] | 0; f[ j >> 2 ] = f[ k >> 2 ]; if ( ! ( nb( c, j, e, q ) | 0 ) ) {

						t = 0; break a;

					}q = f[ l >> 2 ] | 0; e = f[ h >> 2 ] | 0; y = 0; A = v; while ( 1 ) {

						d[ e + ( A << 1 ) >> 1 ] = d[ q + ( y << 1 ) >> 1 ] | 0; y = y + 1 | 0; if ( ( y | 0 ) == ( o | 0 ) ) break; else A = A + 1 | 0;

					}w = w + 1 | 0; if ( w >>> 0 >= p >>> 0 ) {

						t = 1; break;

					} else v = v + o | 0;

				}

			} while ( 0 );o = f[ l >> 2 ] | 0; if ( o | 0 ) {

				l = f[ g >> 2 ] | 0; if ( ( l | 0 ) != ( o | 0 ) )f[ g >> 2 ] = l + ( ~ ( ( l + - 2 - o | 0 ) >>> 1 ) << 1 ); dn( o );

			}r = t; u = i; return r | 0;

		} function wc( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0; h = u; u = u + 32 | 0; i = h + 16 | 0; j = h + 12 | 0; k = h; l = c + 24 | 0; m = b[ l >> 0 ] | 0; n = m << 24 >> 24; o = f[ a + 80 >> 2 ] | 0; a = X( o, n ) | 0; p = f[ c + 28 >> 2 ] | 0; if ( ( p | 0 ) == ( d | 0 ) | ( p | 0 ) == ( e | 0 ) ? b[ c + 84 >> 0 ] | 0 : 0 ) {

				e = ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( f[ c + 48 >> 2 ] | 0 ) | 0; rd( g, e, e + ( a << 2 ) | 0 ); q = 1; u = h; return q | 0;

			}f[ k >> 2 ] = 0; e = k + 4 | 0; f[ e >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; do if ( m << 24 >> 24 ) if ( m << 24 >> 24 < 0 )um( k ); else {

				p = n << 2; d = bj( p ) | 0; f[ k >> 2 ] = d; r = d + ( n << 2 ) | 0; f[ k + 8 >> 2 ] = r; Vf( d | 0, 0, p | 0 ) | 0; f[ e >> 2 ] = r; break;

			} while ( 0 );rd( g, 0, 0 + ( a << 2 ) | 0 ); a:do if ( ! o )s = 1; else {

				a = c + 84 | 0; r = c + 68 | 0; if ( m << 24 >> 24 > 0 ) {

					t = 0; v = 0;

				} else {

					p = 0; while ( 1 ) {

						if ( ! ( b[ a >> 0 ] | 0 ) )w = f[ ( f[ r >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] | 0; else w = p; d = f[ k >> 2 ] | 0; f[ j >> 2 ] = w; x = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( ! ( ob( c, i, x, d ) | 0 ) ) {

							s = 0; break a;

						}p = p + 1 | 0; if ( p >>> 0 >= o >>> 0 ) {

							s = 1; break a;

						}

					}

				} while ( 1 ) {

					if ( ! ( b[ a >> 0 ] | 0 ) )y = f[ ( f[ r >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0; else y = v; p = f[ k >> 2 ] | 0; f[ j >> 2 ] = y; d = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( ! ( ob( c, i, d, p ) | 0 ) ) {

						s = 0; break a;

					}p = f[ k >> 2 ] | 0; d = f[ g >> 2 ] | 0; x = 0; z = t; while ( 1 ) {

						f[ d + ( z << 2 ) >> 2 ] = f[ p + ( x << 2 ) >> 2 ]; x = x + 1 | 0; if ( ( x | 0 ) == ( n | 0 ) ) break; else z = z + 1 | 0;

					}v = v + 1 | 0; if ( v >>> 0 >= o >>> 0 ) {

						s = 1; break;

					} else t = t + n | 0;

				}

			} while ( 0 );n = f[ k >> 2 ] | 0; if ( n | 0 ) {

				k = f[ e >> 2 ] | 0; if ( ( k | 0 ) != ( n | 0 ) )f[ e >> 2 ] = k + ( ~ ( ( k + - 4 - n | 0 ) >>> 2 ) << 2 ); dn( n );

			}q = s; u = h; return q | 0;

		} function xc( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0; h = u; u = u + 32 | 0; i = h + 16 | 0; j = h + 12 | 0; k = h; l = c + 24 | 0; m = b[ l >> 0 ] | 0; n = m << 24 >> 24; o = f[ a + 80 >> 2 ] | 0; a = X( o, n ) | 0; p = f[ c + 28 >> 2 ] | 0; if ( ( p | 0 ) == ( d | 0 ) | ( p | 0 ) == ( e | 0 ) ? b[ c + 84 >> 0 ] | 0 : 0 ) {

				e = ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( f[ c + 48 >> 2 ] | 0 ) | 0; rd( g, e, e + ( a << 2 ) | 0 ); q = 1; u = h; return q | 0;

			}f[ k >> 2 ] = 0; e = k + 4 | 0; f[ e >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; do if ( m << 24 >> 24 ) if ( m << 24 >> 24 < 0 )um( k ); else {

				p = n << 2; d = bj( p ) | 0; f[ k >> 2 ] = d; r = d + ( n << 2 ) | 0; f[ k + 8 >> 2 ] = r; Vf( d | 0, 0, p | 0 ) | 0; f[ e >> 2 ] = r; break;

			} while ( 0 );rd( g, 0, 0 + ( a << 2 ) | 0 ); a:do if ( ! o )s = 1; else {

				a = c + 84 | 0; r = c + 68 | 0; if ( m << 24 >> 24 > 0 ) {

					t = 0; v = 0;

				} else {

					p = 0; while ( 1 ) {

						if ( ! ( b[ a >> 0 ] | 0 ) )w = f[ ( f[ r >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] | 0; else w = p; d = f[ k >> 2 ] | 0; f[ j >> 2 ] = w; x = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( ! ( pb( c, i, x, d ) | 0 ) ) {

							s = 0; break a;

						}p = p + 1 | 0; if ( p >>> 0 >= o >>> 0 ) {

							s = 1; break a;

						}

					}

				} while ( 1 ) {

					if ( ! ( b[ a >> 0 ] | 0 ) )y = f[ ( f[ r >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0; else y = v; p = f[ k >> 2 ] | 0; f[ j >> 2 ] = y; d = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( ! ( pb( c, i, d, p ) | 0 ) ) {

						s = 0; break a;

					}p = f[ k >> 2 ] | 0; d = f[ g >> 2 ] | 0; x = 0; z = t; while ( 1 ) {

						f[ d + ( z << 2 ) >> 2 ] = f[ p + ( x << 2 ) >> 2 ]; x = x + 1 | 0; if ( ( x | 0 ) == ( n | 0 ) ) break; else z = z + 1 | 0;

					}v = v + 1 | 0; if ( v >>> 0 >= o >>> 0 ) {

						s = 1; break;

					} else t = t + n | 0;

				}

			} while ( 0 );n = f[ k >> 2 ] | 0; if ( n | 0 ) {

				k = f[ e >> 2 ] | 0; if ( ( k | 0 ) != ( n | 0 ) )f[ e >> 2 ] = k + ( ~ ( ( k + - 4 - n | 0 ) >>> 2 ) << 2 ); dn( n );

			}q = s; u = h; return q | 0;

		} function yc( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; e = c + 8 | 0; g = f[ e + 4 >> 2 ] | 0; h = c + 16 | 0; i = h; j = f[ i >> 2 ] | 0; k = f[ i + 4 >> 2 ] | 0; if ( ! ( ( g | 0 ) > ( k | 0 ) | ( ( g | 0 ) == ( k | 0 ) ? ( f[ e >> 2 ] | 0 ) >>> 0 > j >>> 0 : 0 ) ) ) {

				l = 0; return l | 0;

			}e = b[ ( f[ c >> 2 ] | 0 ) + j >> 0 ] | 0; g = Rj( j | 0, k | 0, 1, 0 ) | 0; k = h; f[ k >> 2 ] = g; f[ k + 4 >> 2 ] = I; do switch ( e << 24 >> 24 ) {

				case 1: {

					l = bc( a, c, d ) | 0; return l | 0;

				} case 2: {

					l = bc( a, c, d ) | 0; return l | 0;

				} case 3: {

					l = bc( a, c, d ) | 0; return l | 0;

				} case 4: {

					l = bc( a, c, d ) | 0; return l | 0;

				} case 5: {

					l = cd( a, c, d ) | 0; return l | 0;

				} case 6: {

					l = bc( a, c, d ) | 0; return l | 0;

				} case 7: {

					l = bc( a, c, d ) | 0; return l | 0;

				} case 8: {

					l = bc( a, c, d ) | 0; return l | 0;

				} case 9: {

					l = ac( a, c, d ) | 0; return l | 0;

				} case 10: {

					l = Zb( a, c, d ) | 0; return l | 0;

				} case 11: {

					l = Yb( a, c, d ) | 0; return l | 0;

				} case 12: {

					l = Xb( a, c, d ) | 0; return l | 0;

				} case 13: {

					l = Wb( a, c, d ) | 0; return l | 0;

				} case 14: {

					l = Vb( a, c, d ) | 0; return l | 0;

				} case 15: {

					l = Vb( a, c, d ) | 0; return l | 0;

				} case 16: {

					l = Vb( a, c, d ) | 0; return l | 0;

				} case 17: {

					l = Vb( a, c, d ) | 0; return l | 0;

				} case 18: {

					l = Vb( a, c, d ) | 0; return l | 0;

				} default: {

					l = 0; return l | 0;

				}

			} while ( 0 );return 0;

		} function zc( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0; h = u; u = u + 32 | 0; i = h + 16 | 0; j = h + 12 | 0; k = h; l = c + 24 | 0; m = b[ l >> 0 ] | 0; n = m << 24 >> 24; o = f[ a + 80 >> 2 ] | 0; a = X( o, n ) | 0; p = f[ c + 28 >> 2 ] | 0; if ( ( p | 0 ) == ( d | 0 ) | ( p | 0 ) == ( e | 0 ) ? b[ c + 84 >> 0 ] | 0 : 0 ) {

				e = ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( f[ c + 48 >> 2 ] | 0 ) | 0; Jd( g, e, e + a | 0 ); q = 1; u = h; return q | 0;

			}f[ k >> 2 ] = 0; e = k + 4 | 0; f[ e >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; if ( m << 24 >> 24 ) {

				if ( m << 24 >> 24 < 0 )um( k ); p = bj( n ) | 0; f[ e >> 2 ] = p; f[ k >> 2 ] = p; f[ k + 8 >> 2 ] = p + n; d = n; r = p; do {

					b[ r >> 0 ] = 0; r = ( f[ e >> 2 ] | 0 ) + 1 | 0; f[ e >> 2 ] = r; d = d + - 1 | 0;

				} while ( ( d | 0 ) != 0 );

			}Jd( g, 0, 0 + a | 0 ); a:do if ( ! o )s = 1; else {

				a = c + 84 | 0; d = c + 68 | 0; if ( m << 24 >> 24 > 0 ) {

					t = 0; v = 0;

				} else {

					r = 0; while ( 1 ) {

						if ( ! ( b[ a >> 0 ] | 0 ) )w = f[ ( f[ d >> 2 ] | 0 ) + ( r << 2 ) >> 2 ] | 0; else w = r; p = f[ k >> 2 ] | 0; f[ j >> 2 ] = w; x = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( ! ( qb( c, i, x, p ) | 0 ) ) {

							s = 0; break a;

						}r = r + 1 | 0; if ( r >>> 0 >= o >>> 0 ) {

							s = 1; break a;

						}

					}

				} while ( 1 ) {

					if ( ! ( b[ a >> 0 ] | 0 ) )y = f[ ( f[ d >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0; else y = v; r = f[ k >> 2 ] | 0; f[ j >> 2 ] = y; p = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( qb( c, i, p, r ) | 0 ) {

						z = 0; A = t;

					} else {

						s = 0; break a;

					} while ( 1 ) {

						b[ ( f[ g >> 2 ] | 0 ) + A >> 0 ] = b[ ( f[ k >> 2 ] | 0 ) + z >> 0 ] | 0; z = z + 1 | 0; if ( ( z | 0 ) == ( n | 0 ) ) break; else A = A + 1 | 0;

					}v = v + 1 | 0; if ( v >>> 0 >= o >>> 0 ) {

						s = 1; break;

					} else t = t + n | 0;

				}

			} while ( 0 );n = f[ k >> 2 ] | 0; if ( n | 0 ) {

				if ( ( f[ e >> 2 ] | 0 ) != ( n | 0 ) )f[ e >> 2 ] = n; dn( n );

			}q = s; u = h; return q | 0;

		} function Ac( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0; h = u; u = u + 32 | 0; i = h + 16 | 0; j = h + 12 | 0; k = h; l = c + 24 | 0; m = b[ l >> 0 ] | 0; n = m << 24 >> 24; o = f[ a + 80 >> 2 ] | 0; a = X( o, n ) | 0; p = f[ c + 28 >> 2 ] | 0; if ( ( p | 0 ) == ( d | 0 ) | ( p | 0 ) == ( e | 0 ) ? b[ c + 84 >> 0 ] | 0 : 0 ) {

				e = ( f[ f[ c >> 2 ] >> 2 ] | 0 ) + ( f[ c + 48 >> 2 ] | 0 ) | 0; Jd( g, e, e + a | 0 ); q = 1; u = h; return q | 0;

			}f[ k >> 2 ] = 0; e = k + 4 | 0; f[ e >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; if ( m << 24 >> 24 ) {

				if ( m << 24 >> 24 < 0 )um( k ); p = bj( n ) | 0; f[ e >> 2 ] = p; f[ k >> 2 ] = p; f[ k + 8 >> 2 ] = p + n; d = n; r = p; do {

					b[ r >> 0 ] = 0; r = ( f[ e >> 2 ] | 0 ) + 1 | 0; f[ e >> 2 ] = r; d = d + - 1 | 0;

				} while ( ( d | 0 ) != 0 );

			}Jd( g, 0, 0 + a | 0 ); a:do if ( ! o )s = 1; else {

				a = c + 84 | 0; d = c + 68 | 0; if ( m << 24 >> 24 > 0 ) {

					t = 0; v = 0;

				} else {

					r = 0; while ( 1 ) {

						if ( ! ( b[ a >> 0 ] | 0 ) )w = f[ ( f[ d >> 2 ] | 0 ) + ( r << 2 ) >> 2 ] | 0; else w = r; p = f[ k >> 2 ] | 0; f[ j >> 2 ] = w; x = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( ! ( rb( c, i, x, p ) | 0 ) ) {

							s = 0; break a;

						}r = r + 1 | 0; if ( r >>> 0 >= o >>> 0 ) {

							s = 1; break a;

						}

					}

				} while ( 1 ) {

					if ( ! ( b[ a >> 0 ] | 0 ) )y = f[ ( f[ d >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0; else y = v; r = f[ k >> 2 ] | 0; f[ j >> 2 ] = y; p = b[ l >> 0 ] | 0; f[ i >> 2 ] = f[ j >> 2 ]; if ( rb( c, i, p, r ) | 0 ) {

						z = 0; A = t;

					} else {

						s = 0; break a;

					} while ( 1 ) {

						b[ ( f[ g >> 2 ] | 0 ) + A >> 0 ] = b[ ( f[ k >> 2 ] | 0 ) + z >> 0 ] | 0; z = z + 1 | 0; if ( ( z | 0 ) == ( n | 0 ) ) break; else A = A + 1 | 0;

					}v = v + 1 | 0; if ( v >>> 0 >= o >>> 0 ) {

						s = 1; break;

					} else t = t + n | 0;

				}

			} while ( 0 );n = f[ k >> 2 ] | 0; if ( n | 0 ) {

				if ( ( f[ e >> 2 ] | 0 ) != ( n | 0 ) )f[ e >> 2 ] = n; dn( n );

			}q = s; u = h; return q | 0;

		} function Bc( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0; d = u; u = u + 16 | 0; h = d + 4 | 0; i = d; j = a + 60 | 0; f[ a + 64 >> 2 ] = g; g = a + 8 | 0; f[ g >> 2 ] = e; k = a + 32 | 0; l = a + 36 | 0; m = f[ l >> 2 ] | 0; n = f[ k >> 2 ] | 0; o = m - n >> 2; p = n; n = m; if ( o >>> 0 >= e >>> 0 ) {

				if ( o >>> 0 > e >>> 0 ? ( m = p + ( e << 2 ) | 0, ( m | 0 ) != ( n | 0 ) ) : 0 )f[ l >> 2 ] = n + ( ~ ( ( n + - 4 - m | 0 ) >>> 2 ) << 2 );

			} else ff( k, e - o | 0 ); o = a + 56 | 0; k = f[ o >> 2 ] | 0; m = f[ k + 4 >> 2 ] | 0; n = f[ k >> 2 ] | 0; l = m - n | 0; p = l >> 2; if ( ( l | 0 ) <= 0 ) {

				u = d; return 1;

			}l = a + 16 | 0; q = a + 32 | 0; r = a + 12 | 0; s = a + 20 | 0; if ( ( m | 0 ) == ( n | 0 ) ) {

				t = k; um( t );

			} else {

				v = 0; w = n;

			} while ( 1 ) {

				f[ i >> 2 ] = f[ w + ( v << 2 ) >> 2 ]; f[ h >> 2 ] = f[ i >> 2 ]; ub( j, h, c, v ); n = X( v, e ) | 0; k = b + ( n << 2 ) | 0; m = c + ( n << 2 ) | 0; if ( ( f[ g >> 2 ] | 0 ) > 0 ) {

					n = 0; do {

						x = f[ a + 68 + ( n << 2 ) >> 2 ] | 0; y = f[ l >> 2 ] | 0; if ( ( x | 0 ) > ( y | 0 ) ) {

							z = f[ q >> 2 ] | 0; f[ z + ( n << 2 ) >> 2 ] = y; A = z;

						} else {

							z = f[ r >> 2 ] | 0; y = f[ q >> 2 ] | 0; f[ y + ( n << 2 ) >> 2 ] = ( x | 0 ) < ( z | 0 ) ? z : x; A = y;

						}n = n + 1 | 0; B = f[ g >> 2 ] | 0;

					} while ( ( n | 0 ) < ( B | 0 ) );if ( ( B | 0 ) > 0 ) {

						n = 0; do {

							y = ( f[ k + ( n << 2 ) >> 2 ] | 0 ) + ( f[ A + ( n << 2 ) >> 2 ] | 0 ) | 0; x = m + ( n << 2 ) | 0; f[ x >> 2 ] = y; if ( ( y | 0 ) <= ( f[ l >> 2 ] | 0 ) ) {

								if ( ( y | 0 ) < ( f[ r >> 2 ] | 0 ) ) {

									C = ( f[ s >> 2 ] | 0 ) + y | 0; D = 20;

								}

							} else {

								C = y - ( f[ s >> 2 ] | 0 ) | 0; D = 20;

							} if ( ( D | 0 ) == 20 ) {

								D = 0; f[ x >> 2 ] = C;

							}n = n + 1 | 0;

						} while ( ( n | 0 ) < ( f[ g >> 2 ] | 0 ) );

					}

				}v = v + 1 | 0; if ( ( v | 0 ) >= ( p | 0 ) ) {

					D = 8; break;

				}n = f[ o >> 2 ] | 0; w = f[ n >> 2 ] | 0; if ( ( f[ n + 4 >> 2 ] | 0 ) - w >> 2 >>> 0 <= v >>> 0 ) {

					t = n; D = 9; break;

				}

			} if ( ( D | 0 ) == 8 ) {

				u = d; return 1;

			} else if ( ( D | 0 ) == 9 )um( t ); return 0;

		} function Cc( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0; e = f[ b >> 2 ] | 0; g = f[ b + 4 >> 2 ] | 0; h = ( ( f[ c >> 2 ] | 0 ) - e << 3 ) + ( f[ c + 4 >> 2 ] | 0 ) - g | 0; c = e; if ( ( h | 0 ) <= 0 ) {

				i = d + 4 | 0; j = f[ d >> 2 ] | 0; f[ a >> 2 ] = j; k = a + 4 | 0; l = f[ i >> 2 ] | 0; f[ k >> 2 ] = l; return;

			} if ( ! g ) {

				e = d + 4 | 0; m = h; n = e; o = f[ e >> 2 ] | 0; p = c;

			} else {

				e = 32 - g | 0; q = ( h | 0 ) < ( e | 0 ) ? h : e; r = - 1 >>> ( e - q | 0 ) & - 1 << g & f[ c >> 2 ]; e = d + 4 | 0; s = f[ e >> 2 ] | 0; t = 32 - s | 0; u = t >>> 0 < q >>> 0 ? t : q; v = f[ d >> 2 ] | 0; w = f[ v >> 2 ] & ~ ( - 1 >>> ( t - u | 0 ) & - 1 << s ); f[ v >> 2 ] = w; s = f[ e >> 2 ] | 0; f[ v >> 2 ] = ( s >>> 0 > g >>> 0 ? r << s - g : r >>> ( g - s | 0 ) ) | w; w = ( f[ e >> 2 ] | 0 ) + u | 0; s = v + ( w >>> 5 << 2 ) | 0; f[ d >> 2 ] = s; v = w & 31; f[ e >> 2 ] = v; w = q - u | 0; if ( ( w | 0 ) > 0 ) {

					f[ s >> 2 ] = f[ s >> 2 ] & ~ ( - 1 >>> ( 32 - w | 0 ) ) | r >>> ( g + u | 0 ); f[ e >> 2 ] = w; x = w;

				} else x = v; v = c + 4 | 0; f[ b >> 2 ] = v; m = h - q | 0; n = e; o = x; p = v;

			}v = 32 - o | 0; x = - 1 << o; if ( ( m | 0 ) > 31 ) {

				o = ~ x; e = f[ d >> 2 ] | 0; q = ~ m; h = m + ( ( q | 0 ) > - 64 ? q : - 64 ) + 32 | 0; q = ( h >>> 5 ) + 1 | 0; c = m + - 32 - ( h & - 32 ) | 0; h = m; w = p; u = f[ e >> 2 ] | 0; g = e; while ( 1 ) {

					r = f[ w >> 2 ] | 0; s = u & o; f[ g >> 2 ] = s; f[ g >> 2 ] = s | r << f[ n >> 2 ]; g = g + 4 | 0; u = f[ g >> 2 ] & x | r >>> v; f[ g >> 2 ] = u; if ( ( h | 0 ) <= 63 ) break; else {

						h = h + - 32 | 0; w = w + 4 | 0;

					}

				}w = p + ( q << 2 ) | 0; f[ b >> 2 ] = w; f[ d >> 2 ] = e + ( q << 2 ); y = c; z = w;

			} else {

				y = m; z = p;

			} if ( ( y | 0 ) <= 0 ) {

				i = n; j = f[ d >> 2 ] | 0; f[ a >> 2 ] = j; k = a + 4 | 0; l = f[ i >> 2 ] | 0; f[ k >> 2 ] = l; return;

			}p = f[ z >> 2 ] & - 1 >>> ( 32 - y | 0 ); z = ( v | 0 ) < ( y | 0 ) ? v : y; m = f[ d >> 2 ] | 0; w = f[ m >> 2 ] & ~ ( - 1 << f[ n >> 2 ] & - 1 >>> ( v - z | 0 ) ); f[ m >> 2 ] = w; f[ m >> 2 ] = w | p << f[ n >> 2 ]; w = ( f[ n >> 2 ] | 0 ) + z | 0; v = m + ( w >>> 5 << 2 ) | 0; f[ d >> 2 ] = v; f[ n >> 2 ] = w & 31; w = y - z | 0; if ( ( w | 0 ) <= 0 ) {

				i = n; j = f[ d >> 2 ] | 0; f[ a >> 2 ] = j; k = a + 4 | 0; l = f[ i >> 2 ] | 0; f[ k >> 2 ] = l; return;

			}f[ v >> 2 ] = f[ v >> 2 ] & ~ ( - 1 >>> ( 32 - w | 0 ) ) | p >>> z; f[ n >> 2 ] = w; i = n; j = f[ d >> 2 ] | 0; f[ a >> 2 ] = j; k = a + 4 | 0; l = f[ i >> 2 ] | 0; f[ k >> 2 ] = l; return;

		} function Dc( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0; d = u; u = u + 16 | 0; h = d + 4 | 0; i = d; j = a + 60 | 0; f[ a + 64 >> 2 ] = g; g = a + 8 | 0; f[ g >> 2 ] = e; k = a + 32 | 0; l = a + 36 | 0; m = f[ l >> 2 ] | 0; n = f[ k >> 2 ] | 0; o = m - n >> 2; p = n; n = m; if ( o >>> 0 >= e >>> 0 ) {

				if ( o >>> 0 > e >>> 0 ? ( m = p + ( e << 2 ) | 0, ( m | 0 ) != ( n | 0 ) ) : 0 )f[ l >> 2 ] = n + ( ~ ( ( n + - 4 - m | 0 ) >>> 2 ) << 2 );

			} else ff( k, e - o | 0 ); o = a + 56 | 0; k = f[ o >> 2 ] | 0; m = f[ k + 4 >> 2 ] | 0; n = f[ k >> 2 ] | 0; l = m - n | 0; p = l >> 2; if ( ( l | 0 ) <= 0 ) {

				u = d; return 1;

			}l = a + 16 | 0; q = a + 32 | 0; r = a + 12 | 0; s = a + 20 | 0; if ( ( m | 0 ) == ( n | 0 ) ) {

				t = k; um( t );

			} else {

				v = 0; w = n;

			} while ( 1 ) {

				f[ i >> 2 ] = f[ w + ( v << 2 ) >> 2 ]; f[ h >> 2 ] = f[ i >> 2 ]; sb( j, h, c, v ); n = X( v, e ) | 0; k = b + ( n << 2 ) | 0; m = c + ( n << 2 ) | 0; if ( ( f[ g >> 2 ] | 0 ) > 0 ) {

					n = 0; do {

						x = f[ a + 68 + ( n << 2 ) >> 2 ] | 0; y = f[ l >> 2 ] | 0; if ( ( x | 0 ) > ( y | 0 ) ) {

							z = f[ q >> 2 ] | 0; f[ z + ( n << 2 ) >> 2 ] = y; A = z;

						} else {

							z = f[ r >> 2 ] | 0; y = f[ q >> 2 ] | 0; f[ y + ( n << 2 ) >> 2 ] = ( x | 0 ) < ( z | 0 ) ? z : x; A = y;

						}n = n + 1 | 0; B = f[ g >> 2 ] | 0;

					} while ( ( n | 0 ) < ( B | 0 ) );if ( ( B | 0 ) > 0 ) {

						n = 0; do {

							y = ( f[ k + ( n << 2 ) >> 2 ] | 0 ) + ( f[ A + ( n << 2 ) >> 2 ] | 0 ) | 0; x = m + ( n << 2 ) | 0; f[ x >> 2 ] = y; if ( ( y | 0 ) <= ( f[ l >> 2 ] | 0 ) ) {

								if ( ( y | 0 ) < ( f[ r >> 2 ] | 0 ) ) {

									C = ( f[ s >> 2 ] | 0 ) + y | 0; D = 20;

								}

							} else {

								C = y - ( f[ s >> 2 ] | 0 ) | 0; D = 20;

							} if ( ( D | 0 ) == 20 ) {

								D = 0; f[ x >> 2 ] = C;

							}n = n + 1 | 0;

						} while ( ( n | 0 ) < ( f[ g >> 2 ] | 0 ) );

					}

				}v = v + 1 | 0; if ( ( v | 0 ) >= ( p | 0 ) ) {

					D = 8; break;

				}n = f[ o >> 2 ] | 0; w = f[ n >> 2 ] | 0; if ( ( f[ n + 4 >> 2 ] | 0 ) - w >> 2 >>> 0 <= v >>> 0 ) {

					t = n; D = 9; break;

				}

			} if ( ( D | 0 ) == 8 ) {

				u = d; return 1;

			} else if ( ( D | 0 ) == 9 )um( t ); return 0;

		} function Ec( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0; e = f[ b >> 2 ] | 0; g = b + 4 | 0; h = f[ g >> 2 ] | 0; i = ( ( f[ c >> 2 ] | 0 ) - e << 3 ) + ( f[ c + 4 >> 2 ] | 0 ) - h | 0; c = e; if ( ( i | 0 ) <= 0 ) {

				j = d + 4 | 0; k = f[ d >> 2 ] | 0; f[ a >> 2 ] = k; l = a + 4 | 0; m = f[ j >> 2 ] | 0; f[ l >> 2 ] = m; return;

			} if ( ! h ) {

				e = d + 4 | 0; n = i; o = e; p = c; q = f[ e >> 2 ] | 0;

			} else {

				e = 32 - h | 0; r = ( i | 0 ) < ( e | 0 ) ? i : e; s = - 1 >>> ( e - r | 0 ) & - 1 << h & f[ c >> 2 ]; c = d + 4 | 0; h = f[ c >> 2 ] | 0; e = 32 - h | 0; t = e >>> 0 < r >>> 0 ? e : r; u = f[ d >> 2 ] | 0; v = f[ u >> 2 ] & ~ ( - 1 >>> ( e - t | 0 ) & - 1 << h ); f[ u >> 2 ] = v; h = f[ c >> 2 ] | 0; e = f[ g >> 2 ] | 0; f[ u >> 2 ] = ( h >>> 0 > e >>> 0 ? s << h - e : s >>> ( e - h | 0 ) ) | v; v = ( f[ c >> 2 ] | 0 ) + t | 0; h = u + ( v >>> 5 << 2 ) | 0; f[ d >> 2 ] = h; u = v & 31; f[ c >> 2 ] = u; v = r - t | 0; if ( ( v | 0 ) > 0 ) {

					e = f[ h >> 2 ] & ~ ( - 1 >>> ( 32 - v | 0 ) ); f[ h >> 2 ] = e; f[ h >> 2 ] = e | s >>> ( ( f[ g >> 2 ] | 0 ) + t | 0 ); f[ c >> 2 ] = v; w = v;

				} else w = u; u = ( f[ b >> 2 ] | 0 ) + 4 | 0; f[ b >> 2 ] = u; n = i - r | 0; o = c; p = u; q = w;

			}w = 32 - q | 0; u = - 1 << q; if ( ( n | 0 ) > 31 ) {

				q = ~ u; c = ~ n; r = n + ( ( c | 0 ) > - 64 ? c : - 64 ) + 32 & - 32; c = n; i = p; while ( 1 ) {

					v = f[ i >> 2 ] | 0; t = f[ d >> 2 ] | 0; g = f[ t >> 2 ] & q; f[ t >> 2 ] = g; f[ t >> 2 ] = g | v << f[ o >> 2 ]; g = t + 4 | 0; f[ d >> 2 ] = g; f[ g >> 2 ] = f[ g >> 2 ] & u | v >>> w; i = ( f[ b >> 2 ] | 0 ) + 4 | 0; f[ b >> 2 ] = i; if ( ( c | 0 ) <= 63 ) break; else c = c + - 32 | 0;

				}x = n + - 32 - r | 0; y = i;

			} else {

				x = n; y = p;

			} if ( ( x | 0 ) <= 0 ) {

				j = o; k = f[ d >> 2 ] | 0; f[ a >> 2 ] = k; l = a + 4 | 0; m = f[ j >> 2 ] | 0; f[ l >> 2 ] = m; return;

			}p = f[ y >> 2 ] & - 1 >>> ( 32 - x | 0 ); y = ( w | 0 ) < ( x | 0 ) ? w : x; n = f[ d >> 2 ] | 0; i = f[ n >> 2 ] & ~ ( - 1 << f[ o >> 2 ] & - 1 >>> ( w - y | 0 ) ); f[ n >> 2 ] = i; f[ n >> 2 ] = i | p << f[ o >> 2 ]; i = ( f[ o >> 2 ] | 0 ) + y | 0; w = n + ( i >>> 5 << 2 ) | 0; f[ d >> 2 ] = w; f[ o >> 2 ] = i & 31; i = x - y | 0; if ( ( i | 0 ) <= 0 ) {

				j = o; k = f[ d >> 2 ] | 0; f[ a >> 2 ] = k; l = a + 4 | 0; m = f[ j >> 2 ] | 0; f[ l >> 2 ] = m; return;

			}f[ w >> 2 ] = f[ w >> 2 ] & ~ ( - 1 >>> ( 32 - i | 0 ) ) | p >>> y; f[ o >> 2 ] = i; j = o; k = f[ d >> 2 ] | 0; f[ a >> 2 ] = k; l = a + 4 | 0; m = f[ j >> 2 ] | 0; f[ l >> 2 ] = m; return;

		} function Fc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0; d = u; u = u + 32 | 0; e = d + 16 | 0; g = d + 4 | 0; i = d; if ( ! ( dg( e, c ) | 0 ) ) {

				j = - 1; u = d; return j | 0;

			}k = f[ e >> 2 ] | 0; if ( k | 0 ) {

				l = f[ a + 8 >> 2 ] | 0; if ( k >>> 0 > ( ( ( f[ l + 4 >> 2 ] | 0 ) - ( f[ l >> 2 ] | 0 ) >> 2 >>> 0 ) / 3 | 0 ) >>> 0 ) {

					j = - 1; u = d; return j | 0;

				}l = g + 4 | 0; k = a + 40 | 0; m = a + 44 | 0; n = a + 36 | 0; o = 0; p = 0; do {

					dg( i, c ) | 0; f[ l >> 2 ] = ( f[ i >> 2 ] | 0 ) + p; dg( i, c ) | 0; q = f[ i >> 2 ] | 0; p = f[ l >> 2 ] | 0; if ( p >>> 0 < q >>> 0 ) {

						r = 22; break;

					}f[ g >> 2 ] = p - q; q = f[ k >> 2 ] | 0; if ( ( q | 0 ) == ( f[ m >> 2 ] | 0 ) )cf( n, g ); else {

						f[ q >> 2 ] = f[ g >> 2 ]; f[ q + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ q + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ k >> 2 ] = ( f[ k >> 2 ] | 0 ) + 12;

					}o = o + 1 | 0;

				} while ( o >>> 0 < ( f[ e >> 2 ] | 0 ) >>> 0 );if ( ( r | 0 ) == 22 ) {

					j = - 1; u = d; return j | 0;

				}ah( c, 0, 0 ) | 0; r = f[ e >> 2 ] | 0; if ( r | 0 ) {

					e = a + 4 | 0; o = c + 36 | 0; k = c + 32 | 0; g = c + 24 | 0; n = c + 28 | 0; m = a + 36 | 0; a = 0; p = 0; while ( 1 ) {

						l = f[ e >> 2 ] | 0; i = ( b[ o >> 0 ] | 0 ) == 0; if ( ( ( h[ l + 36 >> 0 ] << 8 | h[ l + 37 >> 0 ] ) & 65535 ) < 514 ) if ( ! i ) {

							l = f[ k >> 2 ] | 0; q = f[ g >> 2 ] | 0; s = f[ n >> 2 ] | 0; t = q + ( l >>> 3 ) | 0; if ( t >>> 0 < s >>> 0 ) {

								v = ( h[ t >> 0 ] | 0 ) >>> ( l & 7 ) & 1; t = l + 1 | 0; f[ k >> 2 ] = t; w = v; x = t;

							} else {

								w = 0; x = l;

							} if ( ( q + ( x >>> 3 ) | 0 ) >>> 0 < s >>> 0 ) {

								f[ k >> 2 ] = x + 1; y = w;

							} else y = w;

						} else y = p; else if ( ! i ) {

							i = f[ k >> 2 ] | 0; s = ( f[ g >> 2 ] | 0 ) + ( i >>> 3 ) | 0; if ( s >>> 0 < ( f[ n >> 2 ] | 0 ) >>> 0 ) {

								q = ( h[ s >> 0 ] | 0 ) >>> ( i & 7 ) & 1; f[ k >> 2 ] = i + 1; y = q;

							} else y = 0;

						} else y = p; q = ( f[ m >> 2 ] | 0 ) + ( a * 12 | 0 ) + 8 | 0; b[ q >> 0 ] = b[ q >> 0 ] & - 2 | y & 1; a = a + 1 | 0; if ( a >>> 0 >= r >>> 0 ) break; else p = y;

					}

				}bi( c );

			}j = f[ c + 16 >> 2 ] | 0; u = d; return j | 0;

		} function Gc( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0; d = u; u = u + 32 | 0; e = d + 8 | 0; g = d; h = a + 4 | 0; i = f[ h >> 2 ] | 0; if ( i >>> 0 >= b >>> 0 ) {

				f[ h >> 2 ] = b; u = d; return;

			}j = a + 8 | 0; k = f[ j >> 2 ] | 0; l = k << 5; m = b - i | 0; if ( l >>> 0 < m >>> 0 | i >>> 0 > ( l - m | 0 ) >>> 0 ) {

				f[ e >> 2 ] = 0; n = e + 4 | 0; f[ n >> 2 ] = 0; o = e + 8 | 0; f[ o >> 2 ] = 0; if ( ( b | 0 ) < 0 )um( a ); p = k << 6; k = b + 31 & - 32; af( e, l >>> 0 < 1073741823 ? ( p >>> 0 < k >>> 0 ? k : p ) : 2147483647 ); p = f[ h >> 2 ] | 0; f[ n >> 2 ] = p + m; k = f[ a >> 2 ] | 0; l = k; q = f[ e >> 2 ] | 0; r = ( l + ( p >>> 5 << 2 ) - k << 3 ) + ( p & 31 ) | 0; if ( ( r | 0 ) > 0 ) {

					p = r >>> 5; qi( q | 0, k | 0, p << 2 | 0 ) | 0; k = r & 31; r = q + ( p << 2 ) | 0; s = r; if ( ! k ) {

						t = 0; v = s;

					} else {

						w = - 1 >>> ( 32 - k | 0 ); f[ r >> 2 ] = f[ r >> 2 ] & ~ w | f[ l + ( p << 2 ) >> 2 ] & w; t = k; v = s;

					}

				} else {

					t = 0; v = q;

				}f[ g >> 2 ] = v; f[ g + 4 >> 2 ] = t; t = g; g = f[ t >> 2 ] | 0; v = f[ t + 4 >> 2 ] | 0; t = f[ a >> 2 ] | 0; f[ a >> 2 ] = f[ e >> 2 ]; f[ e >> 2 ] = t; e = f[ h >> 2 ] | 0; f[ h >> 2 ] = f[ n >> 2 ]; f[ n >> 2 ] = e; e = f[ j >> 2 ] | 0; f[ j >> 2 ] = f[ o >> 2 ]; f[ o >> 2 ] = e; if ( t | 0 )dn( t ); x = g; y = v;

			} else {

				v = ( f[ a >> 2 ] | 0 ) + ( i >>> 5 << 2 ) | 0; f[ h >> 2 ] = b; x = v; y = i & 31;

			} if ( ! m ) {

				u = d; return;

			}i = ( y | 0 ) == 0; v = x; if ( c ) {

				if ( i ) {

					z = m; A = x; B = v;

				} else {

					c = 32 - y | 0; b = c >>> 0 > m >>> 0 ? m : c; f[ v >> 2 ] = f[ v >> 2 ] | - 1 >>> ( c - b | 0 ) & - 1 << y; c = v + 4 | 0; z = m - b | 0; A = c; B = c;

				}c = z >>> 5; Vf( A | 0, - 1, c << 2 | 0 ) | 0; A = z & 31; z = B + ( c << 2 ) | 0; if ( ! A ) {

					u = d; return;

				}f[ z >> 2 ] = f[ z >> 2 ] | - 1 >>> ( 32 - A | 0 ); u = d; return;

			} else {

				if ( i ) {

					C = m; D = x; E = v;

				} else {

					x = 32 - y | 0; i = x >>> 0 > m >>> 0 ? m : x; f[ v >> 2 ] = f[ v >> 2 ] & ~ ( - 1 >>> ( x - i | 0 ) & - 1 << y ); y = v + 4 | 0; C = m - i | 0; D = y; E = y;

				}y = C >>> 5; Vf( D | 0, 0, y << 2 | 0 ) | 0; D = C & 31; C = E + ( y << 2 ) | 0; if ( ! D ) {

					u = d; return;

				}f[ C >> 2 ] = f[ C >> 2 ] & ~ ( - 1 >>> ( 32 - D | 0 ) ); u = d; return;

			}

		} function Hc( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0; c = a + 32 | 0; d = f[ c >> 2 ] | 0; e = d + 8 | 0; g = f[ e + 4 >> 2 ] | 0; h = d + 16 | 0; i = h; j = f[ i >> 2 ] | 0; k = f[ i + 4 >> 2 ] | 0; if ( ! ( ( g | 0 ) > ( k | 0 ) | ( ( g | 0 ) == ( k | 0 ) ? ( f[ e >> 2 ] | 0 ) >>> 0 > j >>> 0 : 0 ) ) ) {

				l = 0; return l | 0;

			}e = b[ ( f[ d >> 2 ] | 0 ) + j >> 0 ] | 0; d = Rj( j | 0, k | 0, 1, 0 ) | 0; k = h; f[ k >> 2 ] = d; f[ k + 4 >> 2 ] = I; k = e & 255; d = e << 24 >> 24 == 0; a:do if ( ! d ) {

				e = 0; while ( 1 ) {

					if ( ! ( Oa[ f[ ( f[ a >> 2 ] | 0 ) + 16 >> 2 ] & 127 ]( a, e ) | 0 ) ) {

						l = 0; break;

					}e = e + 1 | 0; if ( ( e | 0 ) >= ( k | 0 ) ) break a;

				} return l | 0;

			} while ( 0 );e = a + 8 | 0; h = f[ e >> 2 ] | 0; j = f[ a + 12 >> 2 ] | 0; b:do if ( ( h | 0 ) != ( j | 0 ) ) {

				g = a + 4 | 0; i = h; while ( 1 ) {

					m = f[ i >> 2 ] | 0; i = i + 4 | 0; if ( ! ( Pa[ f[ ( f[ m >> 2 ] | 0 ) + 8 >> 2 ] & 31 ]( m, a, f[ g >> 2 ] | 0 ) | 0 ) ) {

						l = 0; break;

					} if ( ( i | 0 ) == ( j | 0 ) ) break b;

				} return l | 0;

			} while ( 0 );if ( ! d ) {

				j = 0; do {

					h = f[ ( f[ e >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] | 0; j = j + 1 | 0; if ( ! ( Oa[ f[ ( f[ h >> 2 ] | 0 ) + 12 >> 2 ] & 127 ]( h, f[ c >> 2 ] | 0 ) | 0 ) ) {

						l = 0; n = 26; break;

					}

				} while ( ( j | 0 ) < ( k | 0 ) );if ( ( n | 0 ) == 26 ) return l | 0; if ( ! d ) {

					d = a + 20 | 0; n = a + 24 | 0; j = 0; do {

						c = f[ ( f[ e >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] | 0; h = Na[ f[ ( f[ c >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( c ) | 0; if ( ( h | 0 ) > 0 ) {

							c = 0; do {

								i = f[ ( f[ e >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] | 0; g = Oa[ f[ ( f[ i >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( i, c ) | 0; i = f[ n >> 2 ] | 0; m = f[ d >> 2 ] | 0; o = i - m >> 2; p = m; do if ( g >>> 0 >= o >>> 0 ) {

									m = g + 1 | 0; q = i; if ( m >>> 0 > o >>> 0 ) {

										ff( d, m - o | 0 ); r = f[ d >> 2 ] | 0; break;

									} if ( m >>> 0 < o >>> 0 ? ( s = p + ( m << 2 ) | 0, ( s | 0 ) != ( q | 0 ) ) : 0 ) {

										f[ n >> 2 ] = q + ( ~ ( ( q + - 4 - s | 0 ) >>> 2 ) << 2 ); r = p;

									} else r = p;

								} else r = p; while ( 0 );f[ r + ( g << 2 ) >> 2 ] = j; c = c + 1 | 0;

							} while ( ( c | 0 ) != ( h | 0 ) );

						}j = j + 1 | 0;

					} while ( ( j | 0 ) != ( k | 0 ) );

				}

			} if ( ! ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 28 >> 2 ] & 127 ]( a ) | 0 ) ) {

				l = 0; return l | 0;

			}l = Na[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( a ) | 0; return l | 0;

		} function Ic( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0; c = u; u = u + 16 | 0; d = c; e = Na[ f[ ( f[ a >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( a ) | 0; if ( ( e | 0 ) <= 0 ) {

				g = 1; u = c; return g | 0;

			}h = a + 36 | 0; i = a + 48 | 0; j = d + 8 | 0; k = d + 4 | 0; l = d + 11 | 0; m = 0; while ( 1 ) {

				n = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 28 >> 2 ] & 127 ]( a ) | 0 ) + 40 | 0; if ( f[ n >> 2 ] | 0 ) {

					n = f[ ( f[ ( f[ h >> 2 ] | 0 ) + ( m << 2 ) >> 2 ] | 0 ) + 8 >> 2 ] | 0; o = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 28 >> 2 ] & 127 ]( a ) | 0 ) + 40 | 0; p = f[ o >> 2 ] | 0; o = f[ n + 56 >> 2 ] | 0; n = bj( 32 ) | 0; f[ d >> 2 ] = n; f[ j >> 2 ] = - 2147483616; f[ k >> 2 ] = 24; q = n; r = 8408; s = q + 24 | 0; do {

						b[ q >> 0 ] = b[ r >> 0 ] | 0; q = q + 1 | 0; r = r + 1 | 0;

					} while ( ( q | 0 ) < ( s | 0 ) );b[ n + 24 >> 0 ] = 0; r = p + 16 | 0; q = f[ r >> 2 ] | 0; if ( q ) {

						s = r; t = q; a:while ( 1 ) {

							q = t; while ( 1 ) {

								if ( ( f[ q + 16 >> 2 ] | 0 ) >= ( o | 0 ) ) break; v = f[ q + 4 >> 2 ] | 0; if ( ! v ) {

									w = s; break a;

								} else q = v;

							}t = f[ q >> 2 ] | 0; if ( ! t ) {

								w = q; break;

							} else s = q;

						} if ( ( ( w | 0 ) != ( r | 0 ) ? ( o | 0 ) >= ( f[ w + 16 >> 2 ] | 0 ) : 0 ) ? ( s = w + 20 | 0, ( Ge( s, d ) | 0 ) != 0 ) : 0 )x = tg( s, d, 0 ) | 0; else y = 13;

					} else y = 13; if ( ( y | 0 ) == 13 ) {

						y = 0; x = tg( p, d, 0 ) | 0;

					} if ( ( b[ l >> 0 ] | 0 ) < 0 )dn( f[ d >> 2 ] | 0 ); if ( x ) {

						s = f[ ( f[ h >> 2 ] | 0 ) + ( m << 2 ) >> 2 ] | 0; t = f[ s + 8 >> 2 ] | 0; ad( t, Je( s ) | 0 );

					} else y = 18;

				} else y = 18; if ( ( y | 0 ) == 18 ? ( y = 0, s = f[ ( f[ h >> 2 ] | 0 ) + ( m << 2 ) >> 2 ] | 0, ! ( Oa[ f[ ( f[ s >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( s, i ) | 0 ) ) : 0 ) {

					g = 0; y = 20; break;

				}m = m + 1 | 0; if ( ( m | 0 ) >= ( e | 0 ) ) {

					g = 1; y = 20; break;

				}

			} if ( ( y | 0 ) == 20 ) {

				u = c; return g | 0;

			} return 0;

		} function Jc( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0; f[ a >> 2 ] = 2296; b = a + 360 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 ) {

				b = c + - 4 | 0; d = f[ b >> 2 ] | 0; if ( d | 0 ) {

					e = c + ( d << 4 ) | 0; do e = e + - 16 | 0; while ( ( e | 0 ) != ( c | 0 ) );

				}bn( b );

			}gf( a + 212 | 0 ); b = f[ a + 196 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 200 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) != ( b | 0 ) )f[ c >> 2 ] = e + ( ~ ( ( e + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 184 >> 2 ] | 0; if ( b | 0 ) {

				e = a + 188 | 0; c = f[ e >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ e >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 172 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 176 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) != ( b | 0 ) )f[ c >> 2 ] = e + ( ~ ( ( e + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 160 >> 2 ] | 0; if ( b | 0 ) {

				e = a + 164 | 0; c = f[ e >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ e >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 144 >> 2 ] | 0; if ( b | 0 ) {

				c = b; do {

					b = c; c = f[ c >> 2 ] | 0; dn( b );

				} while ( ( c | 0 ) != 0 );

			}c = a + 136 | 0; b = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( b | 0 )dn( b ); b = f[ a + 120 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 108 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 96 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 72 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 76 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) != ( b | 0 ) )f[ c >> 2 ] = e + ( ~ ( ( e + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 60 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 48 >> 2 ] | 0; if ( b | 0 ) {

				e = a + 52 | 0; c = f[ e >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ e >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 36 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 40 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) != ( b | 0 ) )f[ c >> 2 ] = e + ( ~ ( ( ( e + - 12 - b | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ); dn( b );

			}b = f[ a + 24 >> 2 ] | 0; if ( b | 0 ) {

				e = a + 28 | 0; c = f[ e >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ e >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 12 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 16 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) != ( b | 0 ) )f[ c >> 2 ] = e + ( ~ ( ( e + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = a + 8 | 0; a = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( ! a ) return; mf( a ); dn( a ); return;

		} function Kc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; d = u; u = u + 32 | 0; e = d; g = a + 8 | 0; h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; if ( ( ( h - j | 0 ) / 144 | 0 ) >>> 0 >= c >>> 0 ) {

				k = c; l = j; do {

					f[ l >> 2 ] = - 1; _g( l + 4 | 0 ); b[ l + 100 >> 0 ] = 1; m = l + 104 | 0; n = m + 40 | 0; do {

						f[ m >> 2 ] = 0; m = m + 4 | 0;

					} while ( ( m | 0 ) < ( n | 0 ) );l = ( f[ i >> 2 ] | 0 ) + 144 | 0; f[ i >> 2 ] = l; k = k + - 1 | 0;

				} while ( ( k | 0 ) != 0 );u = d; return;

			}k = f[ a >> 2 ] | 0; l = ( j - k | 0 ) / 144 | 0; j = l + c | 0; if ( j >>> 0 > 29826161 )um( a ); o = ( h - k | 0 ) / 144 | 0; k = o << 1; h = o >>> 0 < 14913080 ? ( k >>> 0 < j >>> 0 ? j : k ) : 29826161; f[ e + 12 >> 2 ] = 0; f[ e + 16 >> 2 ] = a + 8; do if ( h ) if ( h >>> 0 > 29826161 ) {

				k = ra( 8 ) | 0; Yk( k, 9789 ); f[ k >> 2 ] = 3704; va( k | 0, 856, 80 );

			} else {

				p = bj( h * 144 | 0 ) | 0; break;

			} else p = 0; while ( 0 );f[ e >> 2 ] = p; k = p + ( l * 144 | 0 ) | 0; l = e + 8 | 0; f[ l >> 2 ] = k; j = e + 4 | 0; f[ j >> 2 ] = k; o = e + 12 | 0; f[ o >> 2 ] = p + ( h * 144 | 0 ); h = c; c = k; do {

				f[ c >> 2 ] = - 1; _g( c + 4 | 0 ); b[ c + 100 >> 0 ] = 1; m = c + 104 | 0; n = m + 40 | 0; do {

					f[ m >> 2 ] = 0; m = m + 4 | 0;

				} while ( ( m | 0 ) < ( n | 0 ) );c = ( f[ l >> 2 ] | 0 ) + 144 | 0; f[ l >> 2 ] = c; h = h + - 1 | 0;

			} while ( ( h | 0 ) != 0 );h = c; c = f[ a >> 2 ] | 0; m = f[ i >> 2 ] | 0; if ( ( m | 0 ) == ( c | 0 ) ) {

				q = j; r = f[ j >> 2 ] | 0; s = c; t = m;

			} else {

				n = m; m = f[ j >> 2 ] | 0; do {

					m = m + - 144 | 0; n = n + - 144 | 0; tc( m, n );

				} while ( ( n | 0 ) != ( c | 0 ) );f[ j >> 2 ] = m; q = j; r = m; s = f[ a >> 2 ] | 0; t = f[ i >> 2 ] | 0;

			}f[ a >> 2 ] = r; f[ q >> 2 ] = s; f[ i >> 2 ] = h; f[ l >> 2 ] = t; t = f[ g >> 2 ] | 0; f[ g >> 2 ] = f[ o >> 2 ]; f[ o >> 2 ] = t; f[ e >> 2 ] = s; lf( e ); u = d; return;

		} function Lc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; d = ( c | 0 ) == ( a | 0 ); b[ c + 12 >> 0 ] = d & 1; if ( d ) return; else e = c; while ( 1 ) {

				g = e + 8 | 0; h = f[ g >> 2 ] | 0; c = h + 12 | 0; if ( b[ c >> 0 ] | 0 ) {

					i = 23; break;

				}j = h + 8 | 0; k = f[ j >> 2 ] | 0; d = f[ k >> 2 ] | 0; if ( ( d | 0 ) == ( h | 0 ) ) {

					l = f[ k + 4 >> 2 ] | 0; if ( ! l ) {

						i = 7; break;

					}m = l + 12 | 0; if ( ! ( b[ m >> 0 ] | 0 ) )n = m; else {

						i = 7; break;

					}

				} else {

					if ( ! d ) {

						i = 16; break;

					}m = d + 12 | 0; if ( ! ( b[ m >> 0 ] | 0 ) )n = m; else {

						i = 16; break;

					}

				}b[ c >> 0 ] = 1; c = ( k | 0 ) == ( a | 0 ); b[ k + 12 >> 0 ] = c & 1; b[ n >> 0 ] = 1; if ( c ) {

					i = 23; break;

				} else e = k;

			} if ( ( i | 0 ) == 7 ) {

				if ( ( f[ h >> 2 ] | 0 ) == ( e | 0 ) ) {

					o = h; p = k;

				} else {

					n = h + 4 | 0; a = f[ n >> 2 ] | 0; c = f[ a >> 2 ] | 0; f[ n >> 2 ] = c; if ( ! c )q = k; else {

						f[ c + 8 >> 2 ] = h; q = f[ j >> 2 ] | 0;

					}f[ a + 8 >> 2 ] = q; q = f[ j >> 2 ] | 0; f[ ( ( f[ q >> 2 ] | 0 ) == ( h | 0 ) ? q : q + 4 | 0 ) >> 2 ] = a; f[ a >> 2 ] = h; f[ j >> 2 ] = a; o = a; p = f[ a + 8 >> 2 ] | 0;

				}b[ o + 12 >> 0 ] = 1; b[ p + 12 >> 0 ] = 0; o = f[ p >> 2 ] | 0; a = o + 4 | 0; q = f[ a >> 2 ] | 0; f[ p >> 2 ] = q; if ( q | 0 )f[ q + 8 >> 2 ] = p; q = p + 8 | 0; f[ o + 8 >> 2 ] = f[ q >> 2 ]; c = f[ q >> 2 ] | 0; f[ ( ( f[ c >> 2 ] | 0 ) == ( p | 0 ) ? c : c + 4 | 0 ) >> 2 ] = o; f[ a >> 2 ] = p; f[ q >> 2 ] = o; return;

			} else if ( ( i | 0 ) == 16 ) {

				if ( ( f[ h >> 2 ] | 0 ) == ( e | 0 ) ) {

					o = e + 4 | 0; q = f[ o >> 2 ] | 0; f[ h >> 2 ] = q; if ( ! q )r = k; else {

						f[ q + 8 >> 2 ] = h; r = f[ j >> 2 ] | 0;

					}f[ g >> 2 ] = r; r = f[ j >> 2 ] | 0; f[ ( ( f[ r >> 2 ] | 0 ) == ( h | 0 ) ? r : r + 4 | 0 ) >> 2 ] = e; f[ o >> 2 ] = h; f[ j >> 2 ] = e; s = e; t = f[ e + 8 >> 2 ] | 0;

				} else {

					s = h; t = k;

				}b[ s + 12 >> 0 ] = 1; b[ t + 12 >> 0 ] = 0; s = t + 4 | 0; k = f[ s >> 2 ] | 0; h = f[ k >> 2 ] | 0; f[ s >> 2 ] = h; if ( h | 0 )f[ h + 8 >> 2 ] = t; h = t + 8 | 0; f[ k + 8 >> 2 ] = f[ h >> 2 ]; s = f[ h >> 2 ] | 0; f[ ( ( f[ s >> 2 ] | 0 ) == ( t | 0 ) ? s : s + 4 | 0 ) >> 2 ] = k; f[ k >> 2 ] = t; f[ h >> 2 ] = k; return;

			} else if ( ( i | 0 ) == 23 ) return;

		} function Mc( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0; e = u; u = u + 16 | 0; g = e; h = f[ a + 40 >> 2 ] | 0; i = f[ a + 44 >> 2 ] | 0; if ( ( h | 0 ) == ( i | 0 ) ) {

				j = 0; k = 2; l = ( k | 0 ) == 2; m = l ? 0 : j; u = e; return m | 0;

			}a = g + 11 | 0; n = g + 4 | 0; o = d + 11 | 0; p = d + 4 | 0; q = 0; r = h; a:while ( 1 ) {

				f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = Sf( f[ r >> 2 ] | 0, c, g ) | 0; s = b[ a >> 0 ] | 0; b:do if ( h ) {

					t = s << 24 >> 24 < 0; v = s & 255; w = t ? f[ n >> 2 ] | 0 : v; x = b[ o >> 0 ] | 0; y = x << 24 >> 24 < 0; if ( ( w | 0 ) == ( ( y ? f[ p >> 2 ] | 0 : x & 255 ) | 0 ) ) {

						x = f[ g >> 2 ] | 0; z = t ? x : g; A = y ? f[ d >> 2 ] | 0 : d; y = ( w | 0 ) == 0; c:do if ( t ) {

							if ( ! y ? jh( z, A, w ) | 0 : 0 ) {

								B = 0; C = q; D = 14; break b;

							}

						} else if ( ! y ) {

							if ( ( b[ A >> 0 ] | 0 ) == ( x & 255 ) << 24 >> 24 ) {

								E = g; F = v; G = A;

							} else {

								H = 0; I = q; D = 13; break b;

							} while ( 1 ) {

								F = F + - 1 | 0; E = E + 1 | 0; if ( ! F ) break c; G = G + 1 | 0; if ( ( b[ E >> 0 ] | 0 ) != ( b[ G >> 0 ] | 0 ) ) {

									H = 0; I = q; D = 13; break b;

								}

							}

						} while ( 0 );H = 1; I = f[ r >> 2 ] | 0; D = 13;

					} else {

						H = 0; I = q; D = 13;

					}

				} else {

					H = 3; I = q; D = 13;

				} while ( 0 );if ( ( D | 0 ) == 13 ) {

					D = 0; if ( s << 24 >> 24 < 0 ) {

						B = H; C = I; D = 14;

					} else {

						J = H; K = I;

					}

				} if ( ( D | 0 ) == 14 ) {

					D = 0; dn( f[ g >> 2 ] | 0 ); J = B; K = C;

				} switch ( J & 3 ) {

					case 3:case 0:break; default: {

						j = K; k = J; D = 17; break a;

					}

				}r = r + 4 | 0; if ( ( r | 0 ) == ( i | 0 ) ) {

					j = K; k = 2; D = 17; break;

				} else q = K;

			} if ( ( D | 0 ) == 17 ) {

				l = ( k | 0 ) == 2; m = l ? 0 : j; u = e; return m | 0;

			} return 0;

		} function Nc( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; c = u; u = u + 16 | 0; d = c; e = b + 8 | 0; g = e; i = f[ g >> 2 ] | 0; j = f[ g + 4 >> 2 ] | 0; g = b + 16 | 0; k = g; l = f[ k >> 2 ] | 0; m = Rj( l | 0, f[ k + 4 >> 2 ] | 0, 4, 0 ) | 0; k = I; if ( ( j | 0 ) < ( k | 0 ) | ( j | 0 ) == ( k | 0 ) & i >>> 0 < m >>> 0 ) {

				n = 0; u = c; return n | 0;

			}i = ( f[ b >> 2 ] | 0 ) + l | 0; l = h[ i >> 0 ] | h[ i + 1 >> 0 ] << 8 | h[ i + 2 >> 0 ] << 16 | h[ i + 3 >> 0 ] << 24; i = g; f[ i >> 2 ] = m; f[ i + 4 >> 2 ] = k; if ( ( l | 0 ) < 0 ) {

				n = 0; u = c; return n | 0;

			}Gc( a + 76 | 0, l, 0 ); Cm( d ); if ( td( d, b ) | 0 ) {

				if ( ( l | 0 ) > 0 ) {

					k = a + 76 | 0; i = 1; m = 0; do {

						i = i ^ ( ( Wg( d ) | 0 ) ^ 1 ); j = ( f[ k >> 2 ] | 0 ) + ( m >>> 5 << 2 ) | 0; o = 1 << ( m & 31 ); if ( i )p = f[ j >> 2 ] | o; else p = f[ j >> 2 ] & ~ o; f[ j >> 2 ] = p; m = m + 1 | 0;

					} while ( ( m | 0 ) < ( l | 0 ) );

				}l = e; e = f[ l >> 2 ] | 0; m = f[ l + 4 >> 2 ] | 0; l = g; p = f[ l >> 2 ] | 0; i = f[ l + 4 >> 2 ] | 0; l = Rj( p | 0, i | 0, 4, 0 ) | 0; k = I; if ( ( ( ! ( ( m | 0 ) < ( k | 0 ) | ( m | 0 ) == ( k | 0 ) & e >>> 0 < l >>> 0 ) ? ( d = f[ b >> 2 ] | 0, b = d + p | 0, j = h[ b >> 0 ] | h[ b + 1 >> 0 ] << 8 | h[ b + 2 >> 0 ] << 16 | h[ b + 3 >> 0 ] << 24, b = g, f[ b >> 2 ] = l, f[ b + 4 >> 2 ] = k, k = Rj( p | 0, i | 0, 8, 0 ) | 0, i = I, ! ( ( m | 0 ) < ( i | 0 ) | ( m | 0 ) == ( i | 0 ) & e >>> 0 < k >>> 0 ) ) : 0 ) ? ( e = d + l | 0, l = h[ e >> 0 ] | h[ e + 1 >> 0 ] << 8 | h[ e + 2 >> 0 ] << 16 | h[ e + 3 >> 0 ] << 24, e = g, f[ e >> 2 ] = k, f[ e + 4 >> 2 ] = i, ( j | 0 ) <= ( l | 0 ) ) : 0 ) ? ( f[ a + 12 >> 2 ] = j, f[ a + 16 >> 2 ] = l, i = Tj( l | 0, ( ( l | 0 ) < 0 ) << 31 >> 31 | 0, j | 0, ( ( j | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0, j = I, j >>> 0 < 0 | ( j | 0 ) == 0 & i >>> 0 < 2147483647 ) : 0 ) {

					j = i + 1 | 0; f[ a + 20 >> 2 ] = j; i = ( j | 0 ) / 2 | 0; l = a + 24 | 0; f[ l >> 2 ] = i; f[ a + 28 >> 2 ] = 0 - i; if ( ! ( j & 1 ) ) {

						f[ l >> 2 ] = i + - 1; q = 1;

					} else q = 1;

				} else q = 0;

			} else q = 0; n = q; u = c; return n | 0;

		} function Oc( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; g = f[ ( f[ ( f[ b + 4 >> 2 ] | 0 ) + 8 >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] | 0; if ( ! ( ( c + - 1 | 0 ) >>> 0 < 6 & ( Na[ f[ ( f[ b >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( b ) | 0 ) == 1 ) ) {

				h = 0; f[ a >> 2 ] = h; return;

			}i = Na[ f[ ( f[ b >> 2 ] | 0 ) + 36 >> 2 ] & 127 ]( b ) | 0; j = Oa[ f[ ( f[ b >> 2 ] | 0 ) + 44 >> 2 ] & 127 ]( b, d ) | 0; if ( ( i | 0 ) == 0 | ( j | 0 ) == 0 ) {

				h = 0; f[ a >> 2 ] = h; return;

			}k = Oa[ f[ ( f[ b >> 2 ] | 0 ) + 40 >> 2 ] & 127 ]( b, d ) | 0; d = f[ b + 44 >> 2 ] | 0; b = j + 12 | 0; l = ( c | 0 ) == 6; if ( ! k ) {

				if ( l ) {

					c = bj( 104 ) | 0; f[ c + 4 >> 2 ] = g; m = c + 8 | 0; f[ m >> 2 ] = f[ e >> 2 ]; f[ m + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ m + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ m + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ c + 24 >> 2 ] = d; f[ c + 28 >> 2 ] = i; f[ c + 32 >> 2 ] = b; f[ c + 36 >> 2 ] = j; f[ c >> 2 ] = 2024; f[ c + 44 >> 2 ] = 0; f[ c + 48 >> 2 ] = 0; f[ c + 52 >> 2 ] = d; f[ c + 56 >> 2 ] = i; f[ c + 60 >> 2 ] = b; f[ c + 64 >> 2 ] = j; f[ c + 40 >> 2 ] = 2080; f[ c + 68 >> 2 ] = 1; i = c + 72 | 0; f[ i >> 2 ] = - 1; f[ i + 4 >> 2 ] = - 1; f[ i + 8 >> 2 ] = - 1; f[ i + 12 >> 2 ] = - 1; Cm( c + 88 | 0 ); h = c; f[ a >> 2 ] = h; return;

				}

			} else if ( l ) {

				l = bj( 104 ) | 0; f[ l + 4 >> 2 ] = g; g = l + 8 | 0; f[ g >> 2 ] = f[ e >> 2 ]; f[ g + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ g + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ g + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ l + 24 >> 2 ] = d; f[ l + 28 >> 2 ] = k; f[ l + 32 >> 2 ] = b; f[ l + 36 >> 2 ] = j; f[ l >> 2 ] = 1940; f[ l + 44 >> 2 ] = 0; f[ l + 48 >> 2 ] = 0; f[ l + 52 >> 2 ] = d; f[ l + 56 >> 2 ] = k; f[ l + 60 >> 2 ] = b; f[ l + 64 >> 2 ] = j; f[ l + 40 >> 2 ] = 1996; f[ l + 68 >> 2 ] = 1; j = l + 72 | 0; f[ j >> 2 ] = - 1; f[ j + 4 >> 2 ] = - 1; f[ j + 8 >> 2 ] = - 1; f[ j + 12 >> 2 ] = - 1; Cm( l + 88 | 0 ); h = l; f[ a >> 2 ] = h; return;

			}f[ a >> 2 ] = 0; f[ a >> 2 ] = 0; h = 0; f[ a >> 2 ] = h; return;

		} function Pc( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2464; Le( a + 224 | 0 ); gf( a + 212 | 0 ); b = f[ a + 196 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 200 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 184 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 188 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 172 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 176 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 160 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 164 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 144 >> 2 ] | 0; if ( b | 0 ) {

				c = b; do {

					b = c; c = f[ c >> 2 ] | 0; dn( b );

				} while ( ( c | 0 ) != 0 );

			}c = a + 136 | 0; b = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( b | 0 )dn( b ); b = f[ a + 120 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 108 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 96 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 72 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 76 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 60 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 48 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 52 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 36 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 40 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( ( d + - 12 - b | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ); dn( b );

			}b = f[ a + 24 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 28 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 12 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 16 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = a + 8 | 0; a = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( ! a ) return; mf( a ); dn( a ); return;

		} function Qc( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; if ( ! ( d[ c + 38 >> 1 ] | 0 ) ) {

				e = 0; return e | 0;

			}g = a + 12 | 0; if ( ! ( dg( g, c ) | 0 ) ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( j = m + ( h << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = h;

			} else n = h; else {

				ff( a, h - l | 0 ); n = f[ g >> 2 ] | 0;

			} if ( ! n ) {

				e = 1; return e | 0;

			}l = c + 8 | 0; h = c + 16 | 0; j = 0; k = n; a:while ( 1 ) {

				n = l; i = f[ n >> 2 ] | 0; m = f[ n + 4 >> 2 ] | 0; n = h; o = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( p | 0 ) | ( m | 0 ) == ( p | 0 ) & i >>> 0 > o >>> 0 ) ) {

					e = 0; q = 19; break;

				}n = f[ c >> 2 ] | 0; r = b[ n + o >> 0 ] | 0; s = Rj( o | 0, p | 0, 1, 0 ) | 0; p = I; o = h; f[ o >> 2 ] = s; f[ o + 4 >> 2 ] = p; o = r & 255; t = o & 3; u = o >>> 2; switch ( r & 3 ) {

					case 3: {

						r = u + j | 0; if ( r >>> 0 >= k >>> 0 ) {

							e = 0; q = 19; break a;

						}Vf( ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0, 0, ( o & 252 ) + 4 | 0 ) | 0; v = r; break;

					} case 0: {

						w = u; q = 16; break;

					} default: {

						r = u; u = 0; o = p; p = s; while ( 1 ) {

							if ( ! ( ( m | 0 ) > ( o | 0 ) | ( m | 0 ) == ( o | 0 ) & i >>> 0 > p >>> 0 ) ) {

								e = 0; q = 19; break a;

							}s = b[ n + p >> 0 ] | 0; p = Rj( p | 0, o | 0, 1, 0 ) | 0; o = I; x = h; f[ x >> 2 ] = p; f[ x + 4 >> 2 ] = o; x = ( s & 255 ) << ( u << 3 | 6 ) | r; u = u + 1 | 0; if ( ( u | 0 ) >= ( t | 0 ) ) {

								w = x; q = 16; break;

							} else r = x;

						}

					}

				} if ( ( q | 0 ) == 16 ) {

					q = 0; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = w; v = j;

				}j = v + 1 | 0; k = f[ g >> 2 ] | 0; if ( j >>> 0 >= k >>> 0 ) {

					q = 18; break;

				}

			} if ( ( q | 0 ) == 18 ) {

				e = pe( a + 16 | 0, f[ a >> 2 ] | 0, k ) | 0; return e | 0;

			} else if ( ( q | 0 ) == 19 ) return e | 0; return 0;

		} function Rc( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; if ( ! ( d[ c + 38 >> 1 ] | 0 ) ) {

				e = 0; return e | 0;

			}g = a + 12 | 0; if ( ! ( dg( g, c ) | 0 ) ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( j = m + ( h << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = h;

			} else n = h; else {

				ff( a, h - l | 0 ); n = f[ g >> 2 ] | 0;

			} if ( ! n ) {

				e = 1; return e | 0;

			}l = c + 8 | 0; h = c + 16 | 0; j = 0; k = n; a:while ( 1 ) {

				n = l; i = f[ n >> 2 ] | 0; m = f[ n + 4 >> 2 ] | 0; n = h; o = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( p | 0 ) | ( m | 0 ) == ( p | 0 ) & i >>> 0 > o >>> 0 ) ) {

					e = 0; q = 19; break;

				}n = f[ c >> 2 ] | 0; r = b[ n + o >> 0 ] | 0; s = Rj( o | 0, p | 0, 1, 0 ) | 0; p = I; o = h; f[ o >> 2 ] = s; f[ o + 4 >> 2 ] = p; o = r & 255; t = o & 3; u = o >>> 2; switch ( r & 3 ) {

					case 3: {

						r = u + j | 0; if ( r >>> 0 >= k >>> 0 ) {

							e = 0; q = 19; break a;

						}Vf( ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0, 0, ( o & 252 ) + 4 | 0 ) | 0; v = r; break;

					} case 0: {

						w = u; q = 16; break;

					} default: {

						r = u; u = 0; o = p; p = s; while ( 1 ) {

							if ( ! ( ( m | 0 ) > ( o | 0 ) | ( m | 0 ) == ( o | 0 ) & i >>> 0 > p >>> 0 ) ) {

								e = 0; q = 19; break a;

							}s = b[ n + p >> 0 ] | 0; p = Rj( p | 0, o | 0, 1, 0 ) | 0; o = I; x = h; f[ x >> 2 ] = p; f[ x + 4 >> 2 ] = o; x = ( s & 255 ) << ( u << 3 | 6 ) | r; u = u + 1 | 0; if ( ( u | 0 ) >= ( t | 0 ) ) {

								w = x; q = 16; break;

							} else r = x;

						}

					}

				} if ( ( q | 0 ) == 16 ) {

					q = 0; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = w; v = j;

				}j = v + 1 | 0; k = f[ g >> 2 ] | 0; if ( j >>> 0 >= k >>> 0 ) {

					q = 18; break;

				}

			} if ( ( q | 0 ) == 18 ) {

				e = re( a + 16 | 0, f[ a >> 2 ] | 0, k ) | 0; return e | 0;

			} else if ( ( q | 0 ) == 19 ) return e | 0; return 0;

		} function Sc( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; if ( ! ( d[ c + 38 >> 1 ] | 0 ) ) {

				e = 0; return e | 0;

			}g = a + 12 | 0; if ( ! ( dg( g, c ) | 0 ) ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( j = m + ( h << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = h;

			} else n = h; else {

				ff( a, h - l | 0 ); n = f[ g >> 2 ] | 0;

			} if ( ! n ) {

				e = 1; return e | 0;

			}l = c + 8 | 0; h = c + 16 | 0; j = 0; k = n; a:while ( 1 ) {

				n = l; i = f[ n >> 2 ] | 0; m = f[ n + 4 >> 2 ] | 0; n = h; o = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( p | 0 ) | ( m | 0 ) == ( p | 0 ) & i >>> 0 > o >>> 0 ) ) {

					e = 0; q = 19; break;

				}n = f[ c >> 2 ] | 0; r = b[ n + o >> 0 ] | 0; s = Rj( o | 0, p | 0, 1, 0 ) | 0; p = I; o = h; f[ o >> 2 ] = s; f[ o + 4 >> 2 ] = p; o = r & 255; t = o & 3; u = o >>> 2; switch ( r & 3 ) {

					case 3: {

						r = u + j | 0; if ( r >>> 0 >= k >>> 0 ) {

							e = 0; q = 19; break a;

						}Vf( ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0, 0, ( o & 252 ) + 4 | 0 ) | 0; v = r; break;

					} case 0: {

						w = u; q = 16; break;

					} default: {

						r = u; u = 0; o = p; p = s; while ( 1 ) {

							if ( ! ( ( m | 0 ) > ( o | 0 ) | ( m | 0 ) == ( o | 0 ) & i >>> 0 > p >>> 0 ) ) {

								e = 0; q = 19; break a;

							}s = b[ n + p >> 0 ] | 0; p = Rj( p | 0, o | 0, 1, 0 ) | 0; o = I; x = h; f[ x >> 2 ] = p; f[ x + 4 >> 2 ] = o; x = ( s & 255 ) << ( u << 3 | 6 ) | r; u = u + 1 | 0; if ( ( u | 0 ) >= ( t | 0 ) ) {

								w = x; q = 16; break;

							} else r = x;

						}

					}

				} if ( ( q | 0 ) == 16 ) {

					q = 0; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = w; v = j;

				}j = v + 1 | 0; k = f[ g >> 2 ] | 0; if ( j >>> 0 >= k >>> 0 ) {

					q = 18; break;

				}

			} if ( ( q | 0 ) == 18 ) {

				e = se( a + 16 | 0, f[ a >> 2 ] | 0, k ) | 0; return e | 0;

			} else if ( ( q | 0 ) == 19 ) return e | 0; return 0;

		} function Tc( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; if ( ! ( d[ c + 38 >> 1 ] | 0 ) ) {

				e = 0; return e | 0;

			}g = a + 12 | 0; if ( ! ( dg( g, c ) | 0 ) ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( j = m + ( h << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = h;

			} else n = h; else {

				ff( a, h - l | 0 ); n = f[ g >> 2 ] | 0;

			} if ( ! n ) {

				e = 1; return e | 0;

			}l = c + 8 | 0; h = c + 16 | 0; j = 0; k = n; a:while ( 1 ) {

				n = l; i = f[ n >> 2 ] | 0; m = f[ n + 4 >> 2 ] | 0; n = h; o = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( p | 0 ) | ( m | 0 ) == ( p | 0 ) & i >>> 0 > o >>> 0 ) ) {

					e = 0; q = 19; break;

				}n = f[ c >> 2 ] | 0; r = b[ n + o >> 0 ] | 0; s = Rj( o | 0, p | 0, 1, 0 ) | 0; p = I; o = h; f[ o >> 2 ] = s; f[ o + 4 >> 2 ] = p; o = r & 255; t = o & 3; u = o >>> 2; switch ( r & 3 ) {

					case 3: {

						r = u + j | 0; if ( r >>> 0 >= k >>> 0 ) {

							e = 0; q = 19; break a;

						}Vf( ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0, 0, ( o & 252 ) + 4 | 0 ) | 0; v = r; break;

					} case 0: {

						w = u; q = 16; break;

					} default: {

						r = u; u = 0; o = p; p = s; while ( 1 ) {

							if ( ! ( ( m | 0 ) > ( o | 0 ) | ( m | 0 ) == ( o | 0 ) & i >>> 0 > p >>> 0 ) ) {

								e = 0; q = 19; break a;

							}s = b[ n + p >> 0 ] | 0; p = Rj( p | 0, o | 0, 1, 0 ) | 0; o = I; x = h; f[ x >> 2 ] = p; f[ x + 4 >> 2 ] = o; x = ( s & 255 ) << ( u << 3 | 6 ) | r; u = u + 1 | 0; if ( ( u | 0 ) >= ( t | 0 ) ) {

								w = x; q = 16; break;

							} else r = x;

						}

					}

				} if ( ( q | 0 ) == 16 ) {

					q = 0; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = w; v = j;

				}j = v + 1 | 0; k = f[ g >> 2 ] | 0; if ( j >>> 0 >= k >>> 0 ) {

					q = 18; break;

				}

			} if ( ( q | 0 ) == 18 ) {

				e = ue( a + 16 | 0, f[ a >> 2 ] | 0, k ) | 0; return e | 0;

			} else if ( ( q | 0 ) == 19 ) return e | 0; return 0;

		} function Uc( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; if ( ! ( d[ c + 38 >> 1 ] | 0 ) ) {

				e = 0; return e | 0;

			}g = a + 12 | 0; if ( ! ( dg( g, c ) | 0 ) ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( j = m + ( h << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = h;

			} else n = h; else {

				ff( a, h - l | 0 ); n = f[ g >> 2 ] | 0;

			} if ( ! n ) {

				e = 1; return e | 0;

			}l = c + 8 | 0; h = c + 16 | 0; j = 0; k = n; a:while ( 1 ) {

				n = l; i = f[ n >> 2 ] | 0; m = f[ n + 4 >> 2 ] | 0; n = h; o = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( p | 0 ) | ( m | 0 ) == ( p | 0 ) & i >>> 0 > o >>> 0 ) ) {

					e = 0; q = 19; break;

				}n = f[ c >> 2 ] | 0; r = b[ n + o >> 0 ] | 0; s = Rj( o | 0, p | 0, 1, 0 ) | 0; p = I; o = h; f[ o >> 2 ] = s; f[ o + 4 >> 2 ] = p; o = r & 255; t = o & 3; u = o >>> 2; switch ( r & 3 ) {

					case 3: {

						r = u + j | 0; if ( r >>> 0 >= k >>> 0 ) {

							e = 0; q = 19; break a;

						}Vf( ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0, 0, ( o & 252 ) + 4 | 0 ) | 0; v = r; break;

					} case 0: {

						w = u; q = 16; break;

					} default: {

						r = u; u = 0; o = p; p = s; while ( 1 ) {

							if ( ! ( ( m | 0 ) > ( o | 0 ) | ( m | 0 ) == ( o | 0 ) & i >>> 0 > p >>> 0 ) ) {

								e = 0; q = 19; break a;

							}s = b[ n + p >> 0 ] | 0; p = Rj( p | 0, o | 0, 1, 0 ) | 0; o = I; x = h; f[ x >> 2 ] = p; f[ x + 4 >> 2 ] = o; x = ( s & 255 ) << ( u << 3 | 6 ) | r; u = u + 1 | 0; if ( ( u | 0 ) >= ( t | 0 ) ) {

								w = x; q = 16; break;

							} else r = x;

						}

					}

				} if ( ( q | 0 ) == 16 ) {

					q = 0; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = w; v = j;

				}j = v + 1 | 0; k = f[ g >> 2 ] | 0; if ( j >>> 0 >= k >>> 0 ) {

					q = 18; break;

				}

			} if ( ( q | 0 ) == 18 ) {

				e = ve( a + 16 | 0, f[ a >> 2 ] | 0, k ) | 0; return e | 0;

			} else if ( ( q | 0 ) == 19 ) return e | 0; return 0;

		} function Vc( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; if ( ! ( d[ c + 38 >> 1 ] | 0 ) ) {

				e = 0; return e | 0;

			}g = a + 12 | 0; if ( ! ( dg( g, c ) | 0 ) ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( j = m + ( h << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = h;

			} else n = h; else {

				ff( a, h - l | 0 ); n = f[ g >> 2 ] | 0;

			} if ( ! n ) {

				e = 1; return e | 0;

			}l = c + 8 | 0; h = c + 16 | 0; j = 0; k = n; a:while ( 1 ) {

				n = l; i = f[ n >> 2 ] | 0; m = f[ n + 4 >> 2 ] | 0; n = h; o = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( p | 0 ) | ( m | 0 ) == ( p | 0 ) & i >>> 0 > o >>> 0 ) ) {

					e = 0; q = 19; break;

				}n = f[ c >> 2 ] | 0; r = b[ n + o >> 0 ] | 0; s = Rj( o | 0, p | 0, 1, 0 ) | 0; p = I; o = h; f[ o >> 2 ] = s; f[ o + 4 >> 2 ] = p; o = r & 255; t = o & 3; u = o >>> 2; switch ( r & 3 ) {

					case 3: {

						r = u + j | 0; if ( r >>> 0 >= k >>> 0 ) {

							e = 0; q = 19; break a;

						}Vf( ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0, 0, ( o & 252 ) + 4 | 0 ) | 0; v = r; break;

					} case 0: {

						w = u; q = 16; break;

					} default: {

						r = u; u = 0; o = p; p = s; while ( 1 ) {

							if ( ! ( ( m | 0 ) > ( o | 0 ) | ( m | 0 ) == ( o | 0 ) & i >>> 0 > p >>> 0 ) ) {

								e = 0; q = 19; break a;

							}s = b[ n + p >> 0 ] | 0; p = Rj( p | 0, o | 0, 1, 0 ) | 0; o = I; x = h; f[ x >> 2 ] = p; f[ x + 4 >> 2 ] = o; x = ( s & 255 ) << ( u << 3 | 6 ) | r; u = u + 1 | 0; if ( ( u | 0 ) >= ( t | 0 ) ) {

								w = x; q = 16; break;

							} else r = x;

						}

					}

				} if ( ( q | 0 ) == 16 ) {

					q = 0; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = w; v = j;

				}j = v + 1 | 0; k = f[ g >> 2 ] | 0; if ( j >>> 0 >= k >>> 0 ) {

					q = 18; break;

				}

			} if ( ( q | 0 ) == 18 ) {

				e = we( a + 16 | 0, f[ a >> 2 ] | 0, k ) | 0; return e | 0;

			} else if ( ( q | 0 ) == 19 ) return e | 0; return 0;

		} function Wc( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0; if ( ! ( d[ c + 38 >> 1 ] | 0 ) ) {

				e = 0; return e | 0;

			}g = a + 12 | 0; if ( ! ( dg( g, c ) | 0 ) ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( h >>> 0 <= l >>> 0 ) if ( h >>> 0 < l >>> 0 ? ( j = m + ( h << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 ); n = h;

			} else n = h; else {

				ff( a, h - l | 0 ); n = f[ g >> 2 ] | 0;

			} if ( ! n ) {

				e = 1; return e | 0;

			}l = c + 8 | 0; h = c + 16 | 0; j = 0; k = n; a:while ( 1 ) {

				n = l; i = f[ n >> 2 ] | 0; m = f[ n + 4 >> 2 ] | 0; n = h; o = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( p | 0 ) | ( m | 0 ) == ( p | 0 ) & i >>> 0 > o >>> 0 ) ) {

					e = 0; q = 19; break;

				}n = f[ c >> 2 ] | 0; r = b[ n + o >> 0 ] | 0; s = Rj( o | 0, p | 0, 1, 0 ) | 0; p = I; o = h; f[ o >> 2 ] = s; f[ o + 4 >> 2 ] = p; o = r & 255; t = o & 3; u = o >>> 2; switch ( r & 3 ) {

					case 3: {

						r = u + j | 0; if ( r >>> 0 >= k >>> 0 ) {

							e = 0; q = 19; break a;

						}Vf( ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0, 0, ( o & 252 ) + 4 | 0 ) | 0; v = r; break;

					} case 0: {

						w = u; q = 16; break;

					} default: {

						r = u; u = 0; o = p; p = s; while ( 1 ) {

							if ( ! ( ( m | 0 ) > ( o | 0 ) | ( m | 0 ) == ( o | 0 ) & i >>> 0 > p >>> 0 ) ) {

								e = 0; q = 19; break a;

							}s = b[ n + p >> 0 ] | 0; p = Rj( p | 0, o | 0, 1, 0 ) | 0; o = I; x = h; f[ x >> 2 ] = p; f[ x + 4 >> 2 ] = o; x = ( s & 255 ) << ( u << 3 | 6 ) | r; u = u + 1 | 0; if ( ( u | 0 ) >= ( t | 0 ) ) {

								w = x; q = 16; break;

							} else r = x;

						}

					}

				} if ( ( q | 0 ) == 16 ) {

					q = 0; f[ ( f[ a >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = w; v = j;

				}j = v + 1 | 0; k = f[ g >> 2 ] | 0; if ( j >>> 0 >= k >>> 0 ) {

					q = 18; break;

				}

			} if ( ( q | 0 ) == 18 ) {

				e = xe( a + 16 | 0, f[ a >> 2 ] | 0, k ) | 0; return e | 0;

			} else if ( ( q | 0 ) == 19 ) return e | 0; return 0;

		} function Xc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; d = u; u = u + 16 | 0; e = d; if ( ! ( Qb( a, c ) | 0 ) ) {

				g = 0; u = d; return g | 0;

			}h = Na[ f[ ( f[ a >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( a ) | 0; i = a + 36 | 0; j = a + 40 | 0; k = f[ j >> 2 ] | 0; l = f[ i >> 2 ] | 0; m = k - l >> 2; n = l; l = k; if ( h >>> 0 <= m >>> 0 ) {

				if ( h >>> 0 < m >>> 0 ? ( k = n + ( h << 2 ) | 0, ( k | 0 ) != ( l | 0 ) ) : 0 ) {

					n = l; do {

						l = n + - 4 | 0; f[ j >> 2 ] = l; o = f[ l >> 2 ] | 0; f[ l >> 2 ] = 0; if ( o | 0 )Sa[ f[ ( f[ o >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( o ); n = f[ j >> 2 ] | 0;

					} while ( ( n | 0 ) != ( k | 0 ) );

				}

			} else Kd( i, h - m | 0 ); m = c + 8 | 0; if ( ( h | 0 ) <= 0 ) {

				g = 1; u = d; return g | 0;

			}k = c + 16 | 0; n = 0; while ( 1 ) {

				j = m; o = f[ j + 4 >> 2 ] | 0; l = k; p = f[ l >> 2 ] | 0; q = f[ l + 4 >> 2 ] | 0; if ( ! ( ( o | 0 ) > ( q | 0 ) | ( ( o | 0 ) == ( q | 0 ) ? ( f[ j >> 2 ] | 0 ) >>> 0 > p >>> 0 : 0 ) ) ) {

					g = 0; r = 19; break;

				}j = b[ ( f[ c >> 2 ] | 0 ) + p >> 0 ] | 0; o = Rj( p | 0, q | 0, 1, 0 ) | 0; q = k; f[ q >> 2 ] = o; f[ q + 4 >> 2 ] = I; Ua[ f[ ( f[ a >> 2 ] | 0 ) + 48 >> 2 ] & 7 ]( e, a, j ); j = ( f[ i >> 2 ] | 0 ) + ( n << 2 ) | 0; q = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; o = f[ j >> 2 ] | 0; f[ j >> 2 ] = q; if ( o | 0 )Sa[ f[ ( f[ o >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( o ); o = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( o | 0 )Sa[ f[ ( f[ o >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( o ); o = f[ ( f[ i >> 2 ] | 0 ) + ( n << 2 ) >> 2 ] | 0; if ( ! o ) {

					g = 0; r = 19; break;

				}q = f[ ( f[ o >> 2 ] | 0 ) + 8 >> 2 ] | 0; j = Na[ f[ ( f[ a >> 2 ] | 0 ) + 28 >> 2 ] & 127 ]( a ) | 0; p = Oa[ f[ ( f[ a >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( a, n ) | 0; n = n + 1 | 0; if ( ! ( Pa[ q & 31 ]( o, j, p ) | 0 ) ) {

					g = 0; r = 19; break;

				} if ( ( n | 0 ) >= ( h | 0 ) ) {

					g = 1; r = 19; break;

				}

			} if ( ( r | 0 ) == 19 ) {

				u = d; return g | 0;

			} return 0;

		} function Yc( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0; d = u; u = u + 16 | 0; e = d + 12 | 0; g = d; h = bj( 52 ) | 0; f[ h >> 2 ] = 0; f[ h + 4 >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; f[ h + 12 >> 2 ] = 0; n[ h + 16 >> 2 ] = $( 1.0 ); i = h + 20 | 0; f[ i >> 2 ] = 0; f[ i + 4 >> 2 ] = 0; f[ i + 8 >> 2 ] = 0; f[ i + 12 >> 2 ] = 0; n[ h + 36 >> 2 ] = $( 1.0 ); f[ h + 40 >> 2 ] = 0; f[ h + 44 >> 2 ] = 0; f[ h + 48 >> 2 ] = 0; Em( e ); if ( ee( e, f[ c + 32 >> 2 ] | 0, h ) | 0 ) {

				e = ( f[ c + 4 >> 2 ] | 0 ) + 4 | 0; c = f[ e >> 2 ] | 0; f[ e >> 2 ] = h; if ( c | 0 ) {

					e = c + 40 | 0; i = f[ e >> 2 ] | 0; if ( i | 0 ) {

						j = c + 44 | 0; k = f[ j >> 2 ] | 0; if ( ( k | 0 ) == ( i | 0 ) )l = i; else {

							m = k; do {

								k = m + - 4 | 0; f[ j >> 2 ] = k; o = f[ k >> 2 ] | 0; f[ k >> 2 ] = 0; if ( o | 0 ) {

									Cf( o ); dn( o );

								}m = f[ j >> 2 ] | 0;

							} while ( ( m | 0 ) != ( i | 0 ) );l = f[ e >> 2 ] | 0;

						}dn( l );

					}Cf( c ); dn( c );

				}f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; u = d; return;

			} else {

				f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; c = bj( 32 ) | 0; f[ g >> 2 ] = c; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 26; l = c; e = 9550; i = l + 26 | 0; do {

					b[ l >> 0 ] = b[ e >> 0 ] | 0; l = l + 1 | 0; e = e + 1 | 0;

				} while ( ( l | 0 ) < ( i | 0 ) );b[ c + 26 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); g = h + 40 | 0; a = f[ g >> 2 ] | 0; if ( a | 0 ) {

					c = h + 44 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) == ( a | 0 ) )p = a; else {

						l = e; do {

							e = l + - 4 | 0; f[ c >> 2 ] = e; i = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( i | 0 ) {

								Cf( i ); dn( i );

							}l = f[ c >> 2 ] | 0;

						} while ( ( l | 0 ) != ( a | 0 ) );p = f[ g >> 2 ] | 0;

					}dn( p );

				}Cf( h ); dn( h ); u = d; return;

			}

		} function Zc( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0.0; a:do if ( b >>> 0 <= 20 ) do switch ( b | 0 ) {

				case 9: {

					d = ( f[ c >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); e = f[ d >> 2 ] | 0; f[ c >> 2 ] = d + 4; f[ a >> 2 ] = e; break a; break;

				} case 10: {

					e = ( f[ c >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); d = f[ e >> 2 ] | 0; f[ c >> 2 ] = e + 4; e = a; f[ e >> 2 ] = d; f[ e + 4 >> 2 ] = ( ( d | 0 ) < 0 ) << 31 >> 31; break a; break;

				} case 11: {

					d = ( f[ c >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); e = f[ d >> 2 ] | 0; f[ c >> 2 ] = d + 4; d = a; f[ d >> 2 ] = e; f[ d + 4 >> 2 ] = 0; break a; break;

				} case 12: {

					d = ( f[ c >> 2 ] | 0 ) + ( 8 - 1 ) & ~ ( 8 - 1 ); e = d; g = f[ e >> 2 ] | 0; h = f[ e + 4 >> 2 ] | 0; f[ c >> 2 ] = d + 8; d = a; f[ d >> 2 ] = g; f[ d + 4 >> 2 ] = h; break a; break;

				} case 13: {

					h = ( f[ c >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); d = f[ h >> 2 ] | 0; f[ c >> 2 ] = h + 4; h = ( d & 65535 ) << 16 >> 16; d = a; f[ d >> 2 ] = h; f[ d + 4 >> 2 ] = ( ( h | 0 ) < 0 ) << 31 >> 31; break a; break;

				} case 14: {

					h = ( f[ c >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); d = f[ h >> 2 ] | 0; f[ c >> 2 ] = h + 4; h = a; f[ h >> 2 ] = d & 65535; f[ h + 4 >> 2 ] = 0; break a; break;

				} case 15: {

					h = ( f[ c >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); d = f[ h >> 2 ] | 0; f[ c >> 2 ] = h + 4; h = ( d & 255 ) << 24 >> 24; d = a; f[ d >> 2 ] = h; f[ d + 4 >> 2 ] = ( ( h | 0 ) < 0 ) << 31 >> 31; break a; break;

				} case 16: {

					h = ( f[ c >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); d = f[ h >> 2 ] | 0; f[ c >> 2 ] = h + 4; h = a; f[ h >> 2 ] = d & 255; f[ h + 4 >> 2 ] = 0; break a; break;

				} case 17: {

					h = ( f[ c >> 2 ] | 0 ) + ( 8 - 1 ) & ~ ( 8 - 1 ); i = + p[ h >> 3 ]; f[ c >> 2 ] = h + 8; p[ a >> 3 ] = i; break a; break;

				} case 18: {

					h = ( f[ c >> 2 ] | 0 ) + ( 8 - 1 ) & ~ ( 8 - 1 ); i = + p[ h >> 3 ]; f[ c >> 2 ] = h + 8; p[ a >> 3 ] = i; break a; break;

				} default:break a;

			} while ( 0 );while ( 0 );return;

		} function _c( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; e = u; u = u + 144 | 0; g = e + 136 | 0; h = e + 32 | 0; i = e; j = f[ ( f[ c + 4 >> 2 ] | 0 ) + 44 >> 2 ] | 0; k = bj( 124 ) | 0; f[ k + 4 >> 2 ] = 0; f[ k >> 2 ] = 2396; f[ k + 12 >> 2 ] = 2420; f[ k + 100 >> 2 ] = 0; f[ k + 104 >> 2 ] = 0; f[ k + 108 >> 2 ] = 0; l = k + 16 | 0; m = l + 80 | 0; do {

				f[ l >> 2 ] = 0; l = l + 4 | 0;

			} while ( ( l | 0 ) < ( m | 0 ) );f[ k + 112 >> 2 ] = j; f[ k + 116 >> 2 ] = d; f[ k + 120 >> 2 ] = 0; n = k; f[ h + 4 >> 2 ] = 2420; f[ h + 92 >> 2 ] = 0; f[ h + 96 >> 2 ] = 0; f[ h + 100 >> 2 ] = 0; l = h + 8 | 0; m = l + 80 | 0; do {

				f[ l >> 2 ] = 0; l = l + 4 | 0;

			} while ( ( l | 0 ) < ( m | 0 ) );l = f[ c + 8 >> 2 ] | 0; f[ i >> 2 ] = 2420; c = i + 4 | 0; m = c + 4 | 0; f[ m >> 2 ] = 0; f[ m + 4 >> 2 ] = 0; f[ m + 8 >> 2 ] = 0; f[ m + 12 >> 2 ] = 0; f[ m + 16 >> 2 ] = 0; f[ m + 20 >> 2 ] = 0; m = l; f[ c >> 2 ] = m; o = ( ( f[ m + 4 >> 2 ] | 0 ) - ( f[ l >> 2 ] | 0 ) >> 2 >>> 0 ) / 3 | 0; b[ g >> 0 ] = 0; le( i + 8 | 0, o, g ); Sa[ f[ ( f[ i >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( i ); f[ h >> 2 ] = f[ c >> 2 ]; wd( h + 4 | 0, i ) | 0; f[ h + 36 >> 2 ] = l; f[ h + 40 >> 2 ] = d; f[ h + 44 >> 2 ] = j; f[ h + 48 >> 2 ] = k; Wd( k, h ); f[ a >> 2 ] = n; f[ i >> 2 ] = 2420; n = f[ i + 20 >> 2 ] | 0; if ( n | 0 )dn( n ); n = f[ i + 8 >> 2 ] | 0; if ( ! n ) {

				wf( h ); u = e; return;

			}dn( n ); wf( h ); u = e; return;

		} function $c( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; d = u; u = u + 32 | 0; e = d + 12 | 0; g = d; h = xh( c, 0 ) | 0; if ( ! h ) {

				f[ a >> 2 ] = 0; u = d; return;

			}i = f[ c + 100 >> 2 ] | 0; j = f[ c + 96 >> 2 ] | 0; c = i - j | 0; k = ( c | 0 ) / 12 | 0; f[ e >> 2 ] = 0; l = e + 4 | 0; f[ l >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; m = j; do if ( c ) if ( k >>> 0 > 357913941 )um( e ); else {

				n = bj( c ) | 0; f[ e >> 2 ] = n; f[ e + 8 >> 2 ] = n + ( k * 12 | 0 ); Vf( n | 0, 0, c | 0 ) | 0; f[ l >> 2 ] = n + c; o = n; break;

			} else o = 0; while ( 0 );f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; a:do if ( ( i | 0 ) != ( j | 0 ) ) {

				c = g + 4 | 0; n = g + 8 | 0; if ( b[ h + 84 >> 0 ] | 0 ) {

					p = 0; while ( 1 ) {

						q = m + ( p * 12 | 0 ) | 0; f[ g >> 2 ] = f[ q >> 2 ]; f[ g + 4 >> 2 ] = f[ q + 4 >> 2 ]; f[ g + 8 >> 2 ] = f[ q + 8 >> 2 ]; f[ o + ( p * 12 | 0 ) >> 2 ] = f[ g >> 2 ]; f[ o + ( p * 12 | 0 ) + 4 >> 2 ] = f[ c >> 2 ]; f[ o + ( p * 12 | 0 ) + 8 >> 2 ] = f[ n >> 2 ]; p = p + 1 | 0; if ( p >>> 0 >= k >>> 0 ) break a;

					}

				}p = f[ h + 68 >> 2 ] | 0; q = 0; do {

					r = f[ p + ( f[ m + ( q * 12 | 0 ) >> 2 ] << 2 ) >> 2 ] | 0; f[ g >> 2 ] = r; s = f[ p + ( f[ m + ( q * 12 | 0 ) + 4 >> 2 ] << 2 ) >> 2 ] | 0; f[ c >> 2 ] = s; t = f[ p + ( f[ m + ( q * 12 | 0 ) + 8 >> 2 ] << 2 ) >> 2 ] | 0; f[ n >> 2 ] = t; f[ o + ( q * 12 | 0 ) >> 2 ] = r; f[ o + ( q * 12 | 0 ) + 4 >> 2 ] = s; f[ o + ( q * 12 | 0 ) + 8 >> 2 ] = t; q = q + 1 | 0;

				} while ( q >>> 0 < k >>> 0 );

			} while ( 0 );kg( a, e ); a = f[ e >> 2 ] | 0; if ( a | 0 ) {

				e = f[ l >> 2 ] | 0; if ( ( e | 0 ) != ( a | 0 ) )f[ l >> 2 ] = e + ( ~ ( ( ( e + - 12 - a | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ); dn( a );

			}u = d; return;

		} function ad( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; if ( ! ( f[ a + 64 >> 2 ] | 0 ) ) {

				d = bj( 32 ) | 0; oj( d ); e = a + 64 | 0; g = f[ e >> 2 ] | 0; f[ e >> 2 ] = d; if ( ! g )h = d; else {

					d = f[ g >> 2 ] | 0; if ( d | 0 ) {

						i = g + 4 | 0; if ( ( f[ i >> 2 ] | 0 ) != ( d | 0 ) )f[ i >> 2 ] = d; dn( d );

					}dn( g ); h = f[ e >> 2 ] | 0;

				}Vg( a, h, 0, 0, 0, 0 ); j = a;

			} else j = a; if ( ! ( Nf( j, c ) | 0 ) ) return; b[ a + 84 >> 0 ] = b[ c + 84 >> 0 ] | 0; f[ a + 80 >> 2 ] = f[ c + 80 >> 2 ]; if ( ( a | 0 ) != ( c | 0 ) )zd( a + 68 | 0, f[ c + 68 >> 2 ] | 0, f[ c + 72 >> 2 ] | 0 ); j = f[ c + 88 >> 2 ] | 0; if ( ! j ) {

				c = a + 88 | 0; h = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( ! h ) return; c = f[ h + 8 >> 2 ] | 0; if ( c | 0 ) {

					e = h + 12 | 0; if ( ( f[ e >> 2 ] | 0 ) != ( c | 0 ) )f[ e >> 2 ] = c; dn( c );

				}dn( h ); return;

			}h = bj( 40 ) | 0; f[ h >> 2 ] = f[ j >> 2 ]; c = h + 8 | 0; e = j + 8 | 0; f[ c >> 2 ] = 0; g = h + 12 | 0; f[ g >> 2 ] = 0; d = h + 16 | 0; f[ d >> 2 ] = 0; i = j + 12 | 0; k = ( f[ i >> 2 ] | 0 ) - ( f[ e >> 2 ] | 0 ) | 0; if ( k | 0 ) {

				if ( ( k | 0 ) < 0 )um( c ); l = bj( k ) | 0; f[ g >> 2 ] = l; f[ c >> 2 ] = l; f[ d >> 2 ] = l + k; k = f[ e >> 2 ] | 0; e = ( f[ i >> 2 ] | 0 ) - k | 0; if ( ( e | 0 ) > 0 ) {

					ge( l | 0, k | 0, e | 0 ) | 0; f[ g >> 2 ] = l + e;

				}

			}e = h + 24 | 0; l = j + 24 | 0; f[ e >> 2 ] = f[ l >> 2 ]; f[ e + 4 >> 2 ] = f[ l + 4 >> 2 ]; f[ e + 8 >> 2 ] = f[ l + 8 >> 2 ]; f[ e + 12 >> 2 ] = f[ l + 12 >> 2 ]; l = a + 88 | 0; a = f[ l >> 2 ] | 0; f[ l >> 2 ] = h; if ( ! a ) return; h = f[ a + 8 >> 2 ] | 0; if ( h | 0 ) {

				l = a + 12 | 0; if ( ( f[ l >> 2 ] | 0 ) != ( h | 0 ) )f[ l >> 2 ] = h; dn( h );

			}dn( a ); return;

		} function bd( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0; e = u; u = u + 32 | 0; g = e + 20 | 0; h = e + 16 | 0; i = e; j = c + 24 | 0; k = b[ j >> 0 ] | 0; l = k << 24 >> 24; m = f[ a + 80 >> 2 ] | 0; a = X( m, l ) | 0; f[ i >> 2 ] = f[ 226 ]; f[ i + 4 >> 2 ] = f[ 227 ]; f[ i + 8 >> 2 ] = f[ 228 ]; f[ i + 12 >> 2 ] = f[ 229 ]; n = d + 4 | 0; o = f[ n >> 2 ] | 0; p = f[ d >> 2 ] | 0; q = o - p >> 2; r = p; p = o; if ( a >>> 0 <= q >>> 0 ) {

				if ( a >>> 0 < q >>> 0 ? ( o = r + ( a << 2 ) | 0, ( o | 0 ) != ( p | 0 ) ) : 0 )f[ n >> 2 ] = p + ( ~ ( ( p + - 4 - o | 0 ) >>> 2 ) << 2 );

			} else ff( d, a - q | 0 ); if ( ! m ) {

				s = 1; u = e; return s | 0;

			}q = c + 84 | 0; a = c + 68 | 0; if ( k << 24 >> 24 <= 0 ) {

				k = 0; while ( 1 ) {

					if ( ! ( b[ q >> 0 ] | 0 ) )t = f[ ( f[ a >> 2 ] | 0 ) + ( k << 2 ) >> 2 ] | 0; else t = k; f[ h >> 2 ] = t; o = b[ j >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; if ( ! ( bb( c, g, o, i ) | 0 ) ) {

						s = 0; v = 18; break;

					}k = k + 1 | 0; if ( k >>> 0 >= m >>> 0 ) {

						s = 1; v = 18; break;

					}

				} if ( ( v | 0 ) == 18 ) {

					u = e; return s | 0;

				}

			} else {

				w = 0; x = 0;

			} while ( 1 ) {

				if ( ! ( b[ q >> 0 ] | 0 ) )y = f[ ( f[ a >> 2 ] | 0 ) + ( x << 2 ) >> 2 ] | 0; else y = x; f[ h >> 2 ] = y; k = b[ j >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; if ( ! ( bb( c, g, k, i ) | 0 ) ) {

					s = 0; v = 18; break;

				}k = f[ d >> 2 ] | 0; t = 0; o = w; while ( 1 ) {

					f[ k + ( o << 2 ) >> 2 ] = f[ i + ( t << 2 ) >> 2 ]; t = t + 1 | 0; if ( ( t | 0 ) == ( l | 0 ) ) break; else o = o + 1 | 0;

				}x = x + 1 | 0; if ( x >>> 0 >= m >>> 0 ) {

					s = 1; v = 18; break;

				} else w = w + l | 0;

			} if ( ( v | 0 ) == 18 ) {

				u = e; return s | 0;

			} return 0;

		} function cd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; d = u; u = u + 64 | 0; e = d; g = e; i = g + 40 | 0; do {

				f[ g >> 2 ] = 0; g = g + 4 | 0;

			} while ( ( g | 0 ) < ( i | 0 ) );do if ( Wc( e, b ) | 0 ) {

				g = ( a | 0 ) == 0; if ( ! g ? ( f[ e + 12 >> 2 ] | 0 ) == 0 : 0 ) {

					j = 0; break;

				}i = Bd( e, b ) | 0; if ( g | i ^ 1 )j = i; else {

					i = e + 48 | 0; g = e + 44 | 0; k = e + 40 | 0; l = e + 16 | 0; m = e + 28 | 0; n = 0; o = f[ i >> 2 ] | 0; while ( 1 ) {

						a:do if ( o >>> 0 < 16384 ) {

							p = f[ g >> 2 ] | 0; q = o; while ( 1 ) {

								if ( ( p | 0 ) <= 0 ) {

									r = q; break a;

								}s = f[ k >> 2 ] | 0; p = p + - 1 | 0; f[ g >> 2 ] = p; t = q << 8 | ( h[ s + p >> 0 ] | 0 ); f[ i >> 2 ] = t; if ( t >>> 0 >= 16384 ) {

									r = t; break;

								} else q = t;

							}

						} else r = o; while ( 0 );q = r & 4095; p = f[ ( f[ l >> 2 ] | 0 ) + ( q << 2 ) >> 2 ] | 0; t = f[ m >> 2 ] | 0; o = ( X( f[ t + ( p << 3 ) >> 2 ] | 0, r >>> 12 ) | 0 ) + q - ( f[ t + ( p << 3 ) + 4 >> 2 ] | 0 ) | 0; f[ i >> 2 ] = o; f[ c + ( n << 2 ) >> 2 ] = p; n = n + 1 | 0; if ( ( n | 0 ) == ( a | 0 ) ) {

							j = 1; break;

						}

					}

				}

			} else j = 0; while ( 0 );a = f[ e + 28 >> 2 ] | 0; if ( a | 0 ) {

				c = e + 32 | 0; r = f[ c >> 2 ] | 0; if ( ( r | 0 ) != ( a | 0 ) )f[ c >> 2 ] = r + ( ~ ( ( r + - 8 - a | 0 ) >>> 3 ) << 3 ); dn( a );

			}a = f[ e + 16 >> 2 ] | 0; if ( a | 0 ) {

				r = e + 20 | 0; c = f[ r >> 2 ] | 0; if ( ( c | 0 ) != ( a | 0 ) )f[ r >> 2 ] = c + ( ~ ( ( c + - 4 - a | 0 ) >>> 2 ) << 2 ); dn( a );

			}a = f[ e >> 2 ] | 0; if ( ! a ) {

				u = d; return j | 0;

			}c = e + 4 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) != ( a | 0 ) )f[ c >> 2 ] = e + ( ~ ( ( e + - 4 - a | 0 ) >>> 2 ) << 2 ); dn( a ); u = d; return j | 0;

		} function dd( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; d = f[ c >> 2 ] | 0; c = f[ d >> 2 ] | 0; e = f[ a + 4 >> 2 ] | 0; g = f[ d + 4 >> 2 ] | 0; h = e + - 1 | 0; i = ( h & e | 0 ) == 0; if ( ! i ) if ( g >>> 0 < e >>> 0 )j = g; else j = ( g >>> 0 ) % ( e >>> 0 ) | 0; else j = h & g; g = ( f[ a >> 2 ] | 0 ) + ( j << 2 ) | 0; k = f[ g >> 2 ] | 0; while ( 1 ) {

				l = f[ k >> 2 ] | 0; if ( ( l | 0 ) == ( d | 0 ) ) break; else k = l;

			} if ( ( k | 0 ) != ( a + 8 | 0 ) ) {

				l = f[ k + 4 >> 2 ] | 0; if ( ! i ) if ( l >>> 0 < e >>> 0 )m = l; else m = ( l >>> 0 ) % ( e >>> 0 ) | 0; else m = l & h; if ( ( m | 0 ) == ( j | 0 ) ) {

					n = c; o = 21;

				} else o = 13;

			} else o = 13; do if ( ( o | 0 ) == 13 ) {

				if ( c | 0 ) {

					m = f[ c + 4 >> 2 ] | 0; if ( ! i ) if ( m >>> 0 < e >>> 0 )p = m; else p = ( m >>> 0 ) % ( e >>> 0 ) | 0; else p = m & h; if ( ( p | 0 ) == ( j | 0 ) ) {

						q = c; r = c; o = 22; break;

					}

				}f[ g >> 2 ] = 0; n = f[ d >> 2 ] | 0; o = 21;

			} while ( 0 );if ( ( o | 0 ) == 21 ) {

				g = n; if ( ! n )s = g; else {

					q = n; r = g; o = 22;

				}

			} if ( ( o | 0 ) == 22 ) {

				o = f[ q + 4 >> 2 ] | 0; if ( ! i ) if ( o >>> 0 < e >>> 0 )t = o; else t = ( o >>> 0 ) % ( e >>> 0 ) | 0; else t = o & h; if ( ( t | 0 ) == ( j | 0 ) )s = r; else {

					f[ ( f[ a >> 2 ] | 0 ) + ( t << 2 ) >> 2 ] = k; s = f[ d >> 2 ] | 0;

				}

			}f[ k >> 2 ] = s; f[ d >> 2 ] = 0; s = a + 12 | 0; f[ s >> 2 ] = ( f[ s >> 2 ] | 0 ) + - 1; if ( ! d ) return c | 0; s = d + 8 | 0; a = f[ d + 20 >> 2 ] | 0; if ( a | 0 ) {

				k = d + 24 | 0; if ( ( f[ k >> 2 ] | 0 ) != ( a | 0 ) )f[ k >> 2 ] = a; dn( a );

			} if ( ( b[ s + 11 >> 0 ] | 0 ) < 0 )dn( f[ s >> 2 ] | 0 ); dn( d ); return c | 0;

		} function ed( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; c = u; u = u + 32 | 0; d = c + 12 | 0; e = c; g = b * 3 | 0; f[ d >> 2 ] = 0; h = d + 4 | 0; f[ h >> 2 ] = 0; f[ d + 8 >> 2 ] = 0; do if ( g ) if ( g >>> 0 > 1073741823 )um( d ); else {

				i = b * 12 | 0; j = bj( i ) | 0; f[ d >> 2 ] = j; k = j + ( g << 2 ) | 0; f[ d + 8 >> 2 ] = k; Vf( j | 0, 0, i | 0 ) | 0; f[ h >> 2 ] = k; l = j; break;

			} else l = 0; while ( 0 );if ( Qf( g, 1, f[ a + 32 >> 2 ] | 0, l ) | 0 ) if ( ! b )m = 1; else {

				l = a + 44 | 0; a = e + 4 | 0; g = e + 8 | 0; j = 0; k = 0; i = 0; while ( 1 ) {

					f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; n = f[ d >> 2 ] | 0; o = f[ n + ( k << 2 ) >> 2 ] | 0; p = o >>> 1; q = ( ( o & 1 | 0 ) == 0 ? p : 0 - p | 0 ) + i | 0; f[ e >> 2 ] = q; p = f[ n + ( k + 1 << 2 ) >> 2 ] | 0; o = p >>> 1; r = ( ( p & 1 | 0 ) == 0 ? o : 0 - o | 0 ) + q | 0; f[ a >> 2 ] = r; q = f[ n + ( k + 2 << 2 ) >> 2 ] | 0; n = q >>> 1; i = ( ( q & 1 | 0 ) == 0 ? n : 0 - n | 0 ) + r | 0; f[ g >> 2 ] = i; r = f[ l >> 2 ] | 0; n = r + 100 | 0; q = f[ n >> 2 ] | 0; if ( ( q | 0 ) == ( f[ r + 104 >> 2 ] | 0 ) )cf( r + 96 | 0, e ); else {

						f[ q >> 2 ] = f[ e >> 2 ]; f[ q + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ q + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ n >> 2 ] = ( f[ n >> 2 ] | 0 ) + 12;

					}j = j + 1 | 0; if ( j >>> 0 >= b >>> 0 ) {

						m = 1; break;

					} else k = k + 3 | 0;

				}

			} else m = 0; k = f[ d >> 2 ] | 0; if ( ! k ) {

				u = c; return m | 0;

			}d = f[ h >> 2 ] | 0; if ( ( d | 0 ) != ( k | 0 ) )f[ h >> 2 ] = d + ( ~ ( ( d + - 4 - k | 0 ) >>> 2 ) << 2 ); dn( k ); u = c; return m | 0;

		} function fd( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0; d = f[ a + 8 >> 2 ] | 0; e = a + 76 | 0; g = f[ e >> 2 ] | 0; h = f[ g + 80 >> 2 ] | 0; b[ c + 84 >> 0 ] = 0; i = c + 68 | 0; j = c + 72 | 0; k = f[ j >> 2 ] | 0; l = f[ i >> 2 ] | 0; m = k - l >> 2; n = l; l = k; if ( h >>> 0 <= m >>> 0 ) if ( h >>> 0 < m >>> 0 ? ( k = n + ( h << 2 ) | 0, ( k | 0 ) != ( l | 0 ) ) : 0 ) {

				f[ j >> 2 ] = l + ( ~ ( ( l + - 4 - k | 0 ) >>> 2 ) << 2 ); o = g; p = h;

			} else {

				o = g; p = h;

			} else {

				Ae( i, h - m | 0, 2384 ); m = f[ e >> 2 ] | 0; o = m; p = f[ m + 80 >> 2 ] | 0;

			}m = ( f[ o + 100 >> 2 ] | 0 ) - ( f[ o + 96 >> 2 ] | 0 ) | 0; e = ( m | 0 ) / 12 | 0; if ( ! m ) {

				q = 1; return q | 0;

			}m = a + 80 | 0; a = c + 68 | 0; c = f[ o + 96 >> 2 ] | 0; o = 0; while ( 1 ) {

				h = o * 3 | 0; if ( ( h | 0 ) == - 1 )r = - 1; else r = f[ ( f[ d >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0; i = f[ ( f[ m >> 2 ] | 0 ) + 12 >> 2 ] | 0; g = f[ i + ( r << 2 ) >> 2 ] | 0; if ( g >>> 0 >= p >>> 0 ) {

					q = 0; s = 12; break;

				}k = f[ a >> 2 ] | 0; f[ k + ( f[ c + ( o * 12 | 0 ) >> 2 ] << 2 ) >> 2 ] = g; g = h + 1 | 0; if ( ( g | 0 ) == - 1 )t = - 1; else t = f[ ( f[ d >> 2 ] | 0 ) + ( g << 2 ) >> 2 ] | 0; g = f[ i + ( t << 2 ) >> 2 ] | 0; if ( g >>> 0 >= p >>> 0 ) {

					q = 0; s = 12; break;

				}f[ k + ( f[ c + ( o * 12 | 0 ) + 4 >> 2 ] << 2 ) >> 2 ] = g; g = h + 2 | 0; if ( ( g | 0 ) == - 1 )u = - 1; else u = f[ ( f[ d >> 2 ] | 0 ) + ( g << 2 ) >> 2 ] | 0; g = f[ i + ( u << 2 ) >> 2 ] | 0; if ( g >>> 0 >= p >>> 0 ) {

					q = 0; s = 12; break;

				}f[ k + ( f[ c + ( o * 12 | 0 ) + 8 >> 2 ] << 2 ) >> 2 ] = g; o = o + 1 | 0; if ( o >>> 0 >= e >>> 0 ) {

					q = 1; s = 12; break;

				}

			} if ( ( s | 0 ) == 12 ) return q | 0; return 0;

		} function gd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0; c = u; u = u + 32 | 0; d = c; e = a + 8 | 0; g = f[ e >> 2 ] | 0; h = a + 4 | 0; i = f[ h >> 2 ] | 0; j = i; if ( g - i >> 2 >>> 0 >= b >>> 0 ) {

				Vf( i | 0, 0, b << 2 | 0 ) | 0; f[ h >> 2 ] = i + ( b << 2 ); u = c; return;

			}k = f[ a >> 2 ] | 0; l = i - k >> 2; m = l + b | 0; n = k; if ( m >>> 0 > 1073741823 )um( a ); o = g - k | 0; p = o >> 1; q = o >> 2 >>> 0 < 536870911 ? ( p >>> 0 < m >>> 0 ? m : p ) : 1073741823; f[ d + 12 >> 2 ] = 0; f[ d + 16 >> 2 ] = a + 8; do if ( q ) if ( q >>> 0 > 1073741823 ) {

				p = ra( 8 ) | 0; Yk( p, 9789 ); f[ p >> 2 ] = 3704; va( p | 0, 856, 80 );

			} else {

				r = bj( q << 2 ) | 0; break;

			} else r = 0; while ( 0 );f[ d >> 2 ] = r; p = r + ( l << 2 ) | 0; l = d + 8 | 0; m = d + 4 | 0; f[ m >> 2 ] = p; o = r + ( q << 2 ) | 0; q = d + 12 | 0; f[ q >> 2 ] = o; r = p + ( b << 2 ) | 0; Vf( p | 0, 0, b << 2 | 0 ) | 0; f[ l >> 2 ] = r; if ( ( j | 0 ) == ( n | 0 ) ) {

				s = p; t = q; v = l; w = k; x = r; y = i; z = o; A = g;

			} else {

				g = j; j = p; do {

					g = g + - 4 | 0; p = f[ g >> 2 ] | 0; f[ g >> 2 ] = 0; f[ j + - 4 >> 2 ] = p; j = ( f[ m >> 2 ] | 0 ) + - 4 | 0; f[ m >> 2 ] = j;

				} while ( ( g | 0 ) != ( n | 0 ) );s = j; t = q; v = l; w = f[ a >> 2 ] | 0; x = f[ l >> 2 ] | 0; y = f[ h >> 2 ] | 0; z = f[ q >> 2 ] | 0; A = f[ e >> 2 ] | 0;

			}f[ a >> 2 ] = s; f[ m >> 2 ] = w; f[ h >> 2 ] = x; f[ v >> 2 ] = y; f[ e >> 2 ] = z; f[ t >> 2 ] = A; f[ d >> 2 ] = w; Se( d ); u = c; return;

		} function hd( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0; d = f[ a + 8 >> 2 ] | 0; e = a + 112 | 0; g = f[ e >> 2 ] | 0; h = f[ g + 80 >> 2 ] | 0; b[ c + 84 >> 0 ] = 0; i = c + 68 | 0; j = c + 72 | 0; k = f[ j >> 2 ] | 0; l = f[ i >> 2 ] | 0; m = k - l >> 2; n = l; l = k; if ( h >>> 0 <= m >>> 0 ) if ( h >>> 0 < m >>> 0 ? ( k = n + ( h << 2 ) | 0, ( k | 0 ) != ( l | 0 ) ) : 0 ) {

				f[ j >> 2 ] = l + ( ~ ( ( l + - 4 - k | 0 ) >>> 2 ) << 2 ); o = g; p = h;

			} else {

				o = g; p = h;

			} else {

				Ae( i, h - m | 0, 2384 ); m = f[ e >> 2 ] | 0; o = m; p = f[ m + 80 >> 2 ] | 0;

			}m = ( f[ o + 100 >> 2 ] | 0 ) - ( f[ o + 96 >> 2 ] | 0 ) | 0; e = ( m | 0 ) / 12 | 0; if ( ! m ) {

				q = 1; return q | 0;

			}m = a + 116 | 0; a = c + 68 | 0; c = f[ o + 96 >> 2 ] | 0; o = 0; while ( 1 ) {

				h = o * 3 | 0; if ( ( h | 0 ) == - 1 )r = - 1; else r = f[ ( f[ d >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0; i = f[ ( f[ m >> 2 ] | 0 ) + 12 >> 2 ] | 0; g = f[ i + ( r << 2 ) >> 2 ] | 0; if ( g >>> 0 >= p >>> 0 ) {

					q = 0; s = 12; break;

				}k = f[ a >> 2 ] | 0; f[ k + ( f[ c + ( o * 12 | 0 ) >> 2 ] << 2 ) >> 2 ] = g; g = h + 1 | 0; if ( ( g | 0 ) == - 1 )t = - 1; else t = f[ ( f[ d >> 2 ] | 0 ) + ( g << 2 ) >> 2 ] | 0; g = f[ i + ( t << 2 ) >> 2 ] | 0; if ( g >>> 0 >= p >>> 0 ) {

					q = 0; s = 12; break;

				}f[ k + ( f[ c + ( o * 12 | 0 ) + 4 >> 2 ] << 2 ) >> 2 ] = g; g = h + 2 | 0; if ( ( g | 0 ) == - 1 )u = - 1; else u = f[ ( f[ d >> 2 ] | 0 ) + ( g << 2 ) >> 2 ] | 0; g = f[ i + ( u << 2 ) >> 2 ] | 0; if ( g >>> 0 >= p >>> 0 ) {

					q = 0; s = 12; break;

				}f[ k + ( f[ c + ( o * 12 | 0 ) + 8 >> 2 ] << 2 ) >> 2 ] = g; o = o + 1 | 0; if ( o >>> 0 >= e >>> 0 ) {

					q = 1; s = 12; break;

				}

			} if ( ( s | 0 ) == 12 ) return q | 0; return 0;

		} function id( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; c = u; u = u + 32 | 0; d = c + 24 | 0; e = c + 16 | 0; g = c + 8 | 0; h = c; f[ a >> 2 ] = 2372; f[ a + 4 >> 2 ] = f[ b + 4 >> 2 ]; i = a + 8 | 0; j = b + 8 | 0; f[ i >> 2 ] = 0; k = a + 12 | 0; f[ k >> 2 ] = 0; l = a + 16 | 0; f[ l >> 2 ] = 0; m = b + 12 | 0; n = f[ m >> 2 ] | 0; do if ( n | 0 ) if ( ( n | 0 ) < 0 )um( i ); else {

				o = ( ( n + - 1 | 0 ) >>> 5 ) + 1 | 0; p = bj( o << 2 ) | 0; f[ i >> 2 ] = p; f[ k >> 2 ] = 0; f[ l >> 2 ] = o; o = f[ j >> 2 ] | 0; f[ g >> 2 ] = o; f[ g + 4 >> 2 ] = 0; p = f[ m >> 2 ] | 0; f[ h >> 2 ] = o + ( p >>> 5 << 2 ); f[ h + 4 >> 2 ] = p & 31; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ d >> 2 ] = f[ h >> 2 ]; f[ d + 4 >> 2 ] = f[ h + 4 >> 2 ]; od( i, e, d ); break;

			} while ( 0 );i = a + 20 | 0; f[ i >> 2 ] = 0; m = a + 24 | 0; f[ m >> 2 ] = 0; j = a + 28 | 0; f[ j >> 2 ] = 0; a = b + 24 | 0; l = f[ a >> 2 ] | 0; if ( ! l ) {

				u = c; return;

			} if ( ( l | 0 ) < 0 )um( i ); k = ( ( l + - 1 | 0 ) >>> 5 ) + 1 | 0; l = bj( k << 2 ) | 0; f[ i >> 2 ] = l; f[ m >> 2 ] = 0; f[ j >> 2 ] = k; k = f[ b + 20 >> 2 ] | 0; f[ g >> 2 ] = k; f[ g + 4 >> 2 ] = 0; b = f[ a >> 2 ] | 0; f[ h >> 2 ] = k + ( b >>> 5 << 2 ); f[ h + 4 >> 2 ] = b & 31; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ d >> 2 ] = f[ h >> 2 ]; f[ d + 4 >> 2 ] = f[ h + 4 >> 2 ]; od( i, e, d ); u = c; return;

		} function jd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; c = u; u = u + 32 | 0; d = c + 24 | 0; e = c + 16 | 0; g = c + 8 | 0; h = c; f[ a >> 2 ] = 2420; f[ a + 4 >> 2 ] = f[ b + 4 >> 2 ]; i = a + 8 | 0; j = b + 8 | 0; f[ i >> 2 ] = 0; k = a + 12 | 0; f[ k >> 2 ] = 0; l = a + 16 | 0; f[ l >> 2 ] = 0; m = b + 12 | 0; n = f[ m >> 2 ] | 0; do if ( n | 0 ) if ( ( n | 0 ) < 0 )um( i ); else {

				o = ( ( n + - 1 | 0 ) >>> 5 ) + 1 | 0; p = bj( o << 2 ) | 0; f[ i >> 2 ] = p; f[ k >> 2 ] = 0; f[ l >> 2 ] = o; o = f[ j >> 2 ] | 0; f[ g >> 2 ] = o; f[ g + 4 >> 2 ] = 0; p = f[ m >> 2 ] | 0; f[ h >> 2 ] = o + ( p >>> 5 << 2 ); f[ h + 4 >> 2 ] = p & 31; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ d >> 2 ] = f[ h >> 2 ]; f[ d + 4 >> 2 ] = f[ h + 4 >> 2 ]; od( i, e, d ); break;

			} while ( 0 );i = a + 20 | 0; f[ i >> 2 ] = 0; m = a + 24 | 0; f[ m >> 2 ] = 0; j = a + 28 | 0; f[ j >> 2 ] = 0; a = b + 24 | 0; l = f[ a >> 2 ] | 0; if ( ! l ) {

				u = c; return;

			} if ( ( l | 0 ) < 0 )um( i ); k = ( ( l + - 1 | 0 ) >>> 5 ) + 1 | 0; l = bj( k << 2 ) | 0; f[ i >> 2 ] = l; f[ m >> 2 ] = 0; f[ j >> 2 ] = k; k = f[ b + 20 >> 2 ] | 0; f[ g >> 2 ] = k; f[ g + 4 >> 2 ] = 0; b = f[ a >> 2 ] | 0; f[ h >> 2 ] = k + ( b >>> 5 << 2 ); f[ h + 4 >> 2 ] = b & 31; f[ e >> 2 ] = f[ g >> 2 ]; f[ e + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ d >> 2 ] = f[ h >> 2 ]; f[ d + 4 >> 2 ] = f[ h + 4 >> 2 ]; od( i, e, d ); u = c; return;

		} function kd( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; c = b[ ( f[ a + 8 >> 2 ] | 0 ) + 24 >> 0 ] | 0; d = an( c >>> 0 > 1073741823 ? - 1 : c << 2 ) | 0; e = a + 28 | 0; g = f[ e >> 2 ] | 0; f[ e >> 2 ] = d; if ( g | 0 )bn( g ); g = a + 4 | 0; d = f[ ( f[ g >> 2 ] | 0 ) + 32 >> 2 ] | 0; i = c << 2; c = d + 8 | 0; j = f[ c >> 2 ] | 0; k = f[ c + 4 >> 2 ] | 0; c = d + 16 | 0; l = c; m = f[ l >> 2 ] | 0; n = Rj( m | 0, f[ l + 4 >> 2 ] | 0, i | 0, 0 ) | 0; l = I; if ( ( k | 0 ) < ( l | 0 ) | ( k | 0 ) == ( l | 0 ) & j >>> 0 < n >>> 0 ) {

				o = 0; return o | 0;

			}ge( f[ e >> 2 ] | 0, ( f[ d >> 2 ] | 0 ) + m | 0, i | 0 ) | 0; m = c; d = Rj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, i | 0, 0 ) | 0; i = c; f[ i >> 2 ] = d; f[ i + 4 >> 2 ] = I; i = ( f[ g >> 2 ] | 0 ) + 32 | 0; g = f[ i >> 2 ] | 0; d = g + 8 | 0; c = f[ d >> 2 ] | 0; m = f[ d + 4 >> 2 ] | 0; d = g + 16 | 0; e = d; n = f[ e >> 2 ] | 0; j = Rj( n | 0, f[ e + 4 >> 2 ] | 0, 4, 0 ) | 0; e = I; if ( ( m | 0 ) < ( e | 0 ) | ( m | 0 ) == ( e | 0 ) & c >>> 0 < j >>> 0 ) {

				o = 0; return o | 0;

			}j = a + 32 | 0; c = ( f[ g >> 2 ] | 0 ) + n | 0; n = h[ c >> 0 ] | h[ c + 1 >> 0 ] << 8 | h[ c + 2 >> 0 ] << 16 | h[ c + 3 >> 0 ] << 24; b[ j >> 0 ] = n; b[ j + 1 >> 0 ] = n >> 8; b[ j + 2 >> 0 ] = n >> 16; b[ j + 3 >> 0 ] = n >> 24; n = d; j = Rj( f[ n >> 2 ] | 0, f[ n + 4 >> 2 ] | 0, 4, 0 ) | 0; n = d; f[ n >> 2 ] = j; f[ n + 4 >> 2 ] = I; n = f[ i >> 2 ] | 0; i = n + 8 | 0; j = f[ i + 4 >> 2 ] | 0; d = n + 16 | 0; c = d; g = f[ c >> 2 ] | 0; e = f[ c + 4 >> 2 ] | 0; if ( ! ( ( j | 0 ) > ( e | 0 ) | ( ( j | 0 ) == ( e | 0 ) ? ( f[ i >> 2 ] | 0 ) >>> 0 > g >>> 0 : 0 ) ) ) {

				o = 0; return o | 0;

			}i = b[ ( f[ n >> 2 ] | 0 ) + g >> 0 ] | 0; n = Rj( g | 0, e | 0, 1, 0 ) | 0; e = d; f[ e >> 2 ] = n; f[ e + 4 >> 2 ] = I; if ( ( i & 255 ) > 31 ) {

				o = 0; return o | 0;

			}f[ a + 24 >> 2 ] = i & 255; o = 1; return o | 0;

		} function ld( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; e = a + 4 | 0; g = f[ e >> 2 ] | 0; h = g; if ( ( ( d - g | 0 ) / 12 | 0 ) >>> 0 >= b >>> 0 ) {

				Vf( g | 0, 0, b * 12 | 0 ) | 0; f[ e >> 2 ] = h + ( b * 12 | 0 ); return;

			}i = f[ a >> 2 ] | 0; j = ( g - i | 0 ) / 12 | 0; g = j + b | 0; k = i; if ( g >>> 0 > 357913941 )um( a ); l = ( d - i | 0 ) / 12 | 0; d = l << 1; m = l >>> 0 < 178956970 ? ( d >>> 0 < g >>> 0 ? g : d ) : 357913941; do if ( m ) if ( m >>> 0 > 357913941 ) {

				d = ra( 8 ) | 0; Yk( d, 9789 ); f[ d >> 2 ] = 3704; va( d | 0, 856, 80 );

			} else {

				n = bj( m * 12 | 0 ) | 0; break;

			} else n = 0; while ( 0 );d = n + ( j * 12 | 0 ) | 0; j = d; g = n + ( m * 12 | 0 ) | 0; Vf( d | 0, 0, b * 12 | 0 ) | 0; m = d + ( b * 12 | 0 ) | 0; if ( ( h | 0 ) == ( k | 0 ) ) {

				o = j; p = i; q = h;

			} else {

				i = h; h = j; j = d; do {

					d = j + - 12 | 0; b = i; i = i + - 12 | 0; f[ d >> 2 ] = 0; n = j + - 8 | 0; f[ n >> 2 ] = 0; f[ j + - 4 >> 2 ] = 0; f[ d >> 2 ] = f[ i >> 2 ]; d = b + - 8 | 0; f[ n >> 2 ] = f[ d >> 2 ]; n = b + - 4 | 0; f[ j + - 4 >> 2 ] = f[ n >> 2 ]; f[ n >> 2 ] = 0; f[ d >> 2 ] = 0; f[ i >> 2 ] = 0; j = h + - 12 | 0; h = j;

				} while ( ( i | 0 ) != ( k | 0 ) );o = h; p = f[ a >> 2 ] | 0; q = f[ e >> 2 ] | 0;

			}f[ a >> 2 ] = o; f[ e >> 2 ] = m; f[ c >> 2 ] = g; g = p; if ( ( q | 0 ) != ( g | 0 ) ) {

				c = q; do {

					q = c; c = c + - 12 | 0; m = f[ c >> 2 ] | 0; if ( m | 0 ) {

						e = q + - 8 | 0; q = f[ e >> 2 ] | 0; if ( ( q | 0 ) != ( m | 0 ) )f[ e >> 2 ] = q + ( ~ ( ( q + - 4 - m | 0 ) >>> 2 ) << 2 ); dn( m );

					}

				} while ( ( c | 0 ) != ( g | 0 ) );

			} if ( ! p ) return; dn( p ); return;

		} function md( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; g = u; u = u + 80 | 0; h = g; i = g + 60 | 0; j = g + 40 | 0; k = h; l = d; m = k + 40 | 0; do {

				f[ k >> 2 ] = f[ l >> 2 ]; k = k + 4 | 0; l = l + 4 | 0;

			} while ( ( k | 0 ) < ( m | 0 ) );Hb( a, h, i ); if ( f[ a >> 2 ] | 0 ) {

				u = g; return;

			}h = a + 4 | 0; n = h + 11 | 0; if ( ( b[ n >> 0 ] | 0 ) < 0 )dn( f[ h >> 2 ] | 0 ); if ( ( b[ i + 7 >> 0 ] | 0 ) != 1 ) {

				f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; o = bj( 32 ) | 0; f[ j >> 2 ] = o; f[ j + 8 >> 2 ] = - 2147483616; f[ j + 4 >> 2 ] = 20; k = o; l = 8387; m = k + 20 | 0; do {

					b[ k >> 0 ] = b[ l >> 0 ] | 0; k = k + 1 | 0; l = l + 1 | 0;

				} while ( ( k | 0 ) < ( m | 0 ) );b[ o + 20 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( h, j ); if ( ( b[ j + 11 >> 0 ] | 0 ) < 0 )dn( f[ j >> 2 ] | 0 ); u = g; return;

			}Me( j, b[ i + 8 >> 0 ] | 0 ); i = f[ j >> 2 ] | 0; if ( ! i ) {

				o = j + 16 | 0; l = f[ o >> 2 ] | 0; f[ o >> 2 ] = 0; mi( a, l, c, d, e ); if ( ! ( f[ a >> 2 ] | 0 ) ) {

					if ( ( b[ n >> 0 ] | 0 ) < 0 )dn( f[ h >> 2 ] | 0 ); f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0;

				} if ( l | 0 )Sa[ f[ ( f[ l >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( l );

			} else {

				f[ a >> 2 ] = i; Rf( h, j + 4 | 0 );

			}h = j + 16 | 0; i = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( i | 0 )Sa[ f[ ( f[ i >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( i ); i = j + 4 | 0; if ( ( b[ i + 11 >> 0 ] | 0 ) < 0 )dn( f[ i >> 2 ] | 0 ); u = g; return;

		} function nd( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; b = u; u = u + 16 | 0; c = b + 4 | 0; d = b; e = a + 8 | 0; g = f[ e >> 2 ] | 0; Eg( f[ a + 4 >> 2 ] | 0, ( f[ g + 28 >> 2 ] | 0 ) - ( f[ g + 24 >> 2 ] | 0 ) >> 2 ); g = a + 100 | 0; h = f[ e >> 2 ] | 0; i = ( f[ h + 28 >> 2 ] | 0 ) - ( f[ h + 24 >> 2 ] | 0 ) >> 2; f[ c >> 2 ] = 0; h = a + 104 | 0; j = f[ h >> 2 ] | 0; k = f[ g >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( i >>> 0 <= l >>> 0 ) {

				if ( i >>> 0 < l >>> 0 ? ( j = m + ( i << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 )f[ h >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 );

			} else Ae( g, i - l | 0, c ); l = a + 120 | 0; a = f[ l >> 2 ] | 0; if ( ! a ) {

				i = f[ e >> 2 ] | 0; g = ( f[ i + 4 >> 2 ] | 0 ) - ( f[ i >> 2 ] | 0 ) >> 2; i = ( g >>> 0 ) / 3 | 0; if ( g >>> 0 <= 2 ) {

					u = b; return 1;

				}g = 0; do {

					f[ d >> 2 ] = g * 3; f[ c >> 2 ] = f[ d >> 2 ]; lb( e, c ); g = g + 1 | 0;

				} while ( ( g | 0 ) < ( i | 0 ) );u = b; return 1;

			} else {

				i = f[ a >> 2 ] | 0; if ( ( f[ a + 4 >> 2 ] | 0 ) == ( i | 0 ) ) {

					u = b; return 1;

				}a = 0; g = i; do {

					f[ d >> 2 ] = f[ g + ( a << 2 ) >> 2 ]; f[ c >> 2 ] = f[ d >> 2 ]; lb( e, c ); a = a + 1 | 0; i = f[ l >> 2 ] | 0; g = f[ i >> 2 ] | 0;

				} while ( a >>> 0 < ( f[ i + 4 >> 2 ] | 0 ) - g >> 2 >>> 0 );u = b; return 1;

			} return 0;

		} function od( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0; d = u; u = u + 48 | 0; e = d + 40 | 0; g = d + 32 | 0; h = d + 8 | 0; i = d; j = d + 24 | 0; k = d + 16 | 0; l = a + 4 | 0; m = f[ l >> 2 ] | 0; n = b; b = f[ n >> 2 ] | 0; o = f[ n + 4 >> 2 ] | 0; n = c; c = f[ n >> 2 ] | 0; p = f[ n + 4 >> 2 ] | 0; n = c - b << 3; f[ l >> 2 ] = m - o + p + n; l = ( f[ a >> 2 ] | 0 ) + ( m >>> 5 << 2 ) | 0; a = m & 31; m = l; if ( ( a | 0 ) != ( o | 0 ) ) {

				q = h; f[ q >> 2 ] = b; f[ q + 4 >> 2 ] = o; q = i; f[ q >> 2 ] = c; f[ q + 4 >> 2 ] = p; f[ j >> 2 ] = m; f[ j + 4 >> 2 ] = a; f[ g >> 2 ] = f[ h >> 2 ]; f[ g + 4 >> 2 ] = f[ h + 4 >> 2 ]; f[ e >> 2 ] = f[ i >> 2 ]; f[ e + 4 >> 2 ] = f[ i + 4 >> 2 ]; Cc( k, g, e, j ); u = d; return;

			}j = p - o + n | 0; n = b; if ( ( j | 0 ) > 0 ) {

				if ( ! o ) {

					r = j; s = 0; t = l; v = b; w = n;

				} else {

					b = 32 - o | 0; p = ( j | 0 ) < ( b | 0 ) ? j : b; e = - 1 >>> ( b - p | 0 ) & - 1 << o; f[ l >> 2 ] = f[ l >> 2 ] & ~ e | f[ n >> 2 ] & e; e = p + o | 0; b = n + 4 | 0; r = j - p | 0; s = e & 31; t = l + ( e >>> 5 << 2 ) | 0; v = b; w = b;

				}b = ( r | 0 ) / 32 | 0; qi( t | 0, v | 0, b << 2 | 0 ) | 0; v = r - ( b << 5 ) | 0; r = t + ( b << 2 ) | 0; t = r; if ( ( v | 0 ) > 0 ) {

					e = - 1 >>> ( 32 - v | 0 ); f[ r >> 2 ] = f[ r >> 2 ] & ~ e | f[ w + ( b << 2 ) >> 2 ] & e; x = v; y = t;

				} else {

					x = s; y = t;

				}

			} else {

				x = o; y = m;

			}f[ k >> 2 ] = y; f[ k + 4 >> 2 ] = x; u = d; return;

		} function pd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; d = b; e = c - d >> 2; g = a + 8 | 0; h = f[ g >> 2 ] | 0; i = f[ a >> 2 ] | 0; j = i; if ( e >>> 0 <= h - i >> 2 >>> 0 ) {

				k = a + 4 | 0; l = ( f[ k >> 2 ] | 0 ) - i >> 2; m = e >>> 0 > l >>> 0; n = b + ( l << 2 ) | 0; l = m ? n : c; o = l; p = o - d | 0; q = p >> 2; if ( q | 0 )qi( i | 0, b | 0, p | 0 ) | 0; p = j + ( q << 2 ) | 0; if ( ! m ) {

					m = f[ k >> 2 ] | 0; if ( ( m | 0 ) == ( p | 0 ) ) return; f[ k >> 2 ] = m + ( ~ ( ( m + - 4 - p | 0 ) >>> 2 ) << 2 ); return;

				} if ( ( l | 0 ) == ( c | 0 ) ) return; l = f[ k >> 2 ] | 0; p = ( ( c + - 4 - o | 0 ) >>> 2 ) + 1 | 0; o = n; n = l; while ( 1 ) {

					f[ n >> 2 ] = f[ o >> 2 ]; o = o + 4 | 0; if ( ( o | 0 ) == ( c | 0 ) ) break; else n = n + 4 | 0;

				}f[ k >> 2 ] = l + ( p << 2 ); return;

			}p = i; if ( ! i )r = h; else {

				h = a + 4 | 0; l = f[ h >> 2 ] | 0; if ( ( l | 0 ) != ( j | 0 ) )f[ h >> 2 ] = l + ( ~ ( ( l + - 4 - i | 0 ) >>> 2 ) << 2 ); dn( p ); f[ g >> 2 ] = 0; f[ h >> 2 ] = 0; f[ a >> 2 ] = 0; r = 0;

			} if ( e >>> 0 > 1073741823 )um( a ); h = r >> 1; p = r >> 2 >>> 0 < 536870911 ? ( h >>> 0 < e >>> 0 ? e : h ) : 1073741823; if ( p >>> 0 > 1073741823 )um( a ); h = bj( p << 2 ) | 0; e = a + 4 | 0; f[ e >> 2 ] = h; f[ a >> 2 ] = h; f[ g >> 2 ] = h + ( p << 2 ); if ( ( b | 0 ) == ( c | 0 ) ) return; p = ( ( c + - 4 - d | 0 ) >>> 2 ) + 1 | 0; d = b; b = h; while ( 1 ) {

				f[ b >> 2 ] = f[ d >> 2 ]; d = d + 4 | 0; if ( ( d | 0 ) == ( c | 0 ) ) break; else b = b + 4 | 0;

			}f[ e >> 2 ] = h + ( p << 2 ); return;

		} function qd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; e = b; g = c - e | 0; h = g >> 1; i = a + 8 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = k; if ( h >>> 0 <= j - k >> 1 >>> 0 ) {

				m = a + 4 | 0; n = ( f[ m >> 2 ] | 0 ) - k >> 1; o = h >>> 0 > n >>> 0; p = b + ( n << 1 ) | 0; n = o ? p : c; q = n; r = q - e | 0; s = r >> 1; if ( s | 0 )qi( k | 0, b | 0, r | 0 ) | 0; r = l + ( s << 1 ) | 0; if ( ! o ) {

					o = f[ m >> 2 ] | 0; if ( ( o | 0 ) == ( r | 0 ) ) return; f[ m >> 2 ] = o + ( ~ ( ( o + - 2 - r | 0 ) >>> 1 ) << 1 ); return;

				} if ( ( n | 0 ) == ( c | 0 ) ) return; n = f[ m >> 2 ] | 0; r = c + - 2 - q | 0; q = p; p = n; while ( 1 ) {

					d[ p >> 1 ] = d[ q >> 1 ] | 0; q = q + 2 | 0; if ( ( q | 0 ) == ( c | 0 ) ) break; else p = p + 2 | 0;

				}f[ m >> 2 ] = n + ( ( r >>> 1 ) + 1 << 1 ); return;

			}r = k; if ( ! k )t = j; else {

				j = a + 4 | 0; n = f[ j >> 2 ] | 0; if ( ( n | 0 ) != ( l | 0 ) )f[ j >> 2 ] = n + ( ~ ( ( n + - 2 - k | 0 ) >>> 1 ) << 1 ); dn( r ); f[ i >> 2 ] = 0; f[ j >> 2 ] = 0; f[ a >> 2 ] = 0; t = 0;

			} if ( ( g | 0 ) < 0 )um( a ); g = t >> 1 >>> 0 < 1073741823 ? ( t >>> 0 < h >>> 0 ? h : t ) : 2147483647; if ( ( g | 0 ) < 0 )um( a ); t = bj( g << 1 ) | 0; h = a + 4 | 0; f[ h >> 2 ] = t; f[ a >> 2 ] = t; f[ i >> 2 ] = t + ( g << 1 ); if ( ( b | 0 ) == ( c | 0 ) ) return; g = c + - 2 - e | 0; e = b; b = t; while ( 1 ) {

				d[ b >> 1 ] = d[ e >> 1 ] | 0; e = e + 2 | 0; if ( ( e | 0 ) == ( c | 0 ) ) break; else b = b + 2 | 0;

			}f[ h >> 2 ] = t + ( ( g >>> 1 ) + 1 << 1 ); return;

		} function rd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; d = b; e = c - d >> 2; g = a + 8 | 0; h = f[ g >> 2 ] | 0; i = f[ a >> 2 ] | 0; j = i; if ( e >>> 0 <= h - i >> 2 >>> 0 ) {

				k = a + 4 | 0; l = ( f[ k >> 2 ] | 0 ) - i >> 2; m = e >>> 0 > l >>> 0; n = b + ( l << 2 ) | 0; l = m ? n : c; o = l; p = o - d | 0; q = p >> 2; if ( q | 0 )qi( i | 0, b | 0, p | 0 ) | 0; p = j + ( q << 2 ) | 0; if ( ! m ) {

					m = f[ k >> 2 ] | 0; if ( ( m | 0 ) == ( p | 0 ) ) return; f[ k >> 2 ] = m + ( ~ ( ( m + - 4 - p | 0 ) >>> 2 ) << 2 ); return;

				} if ( ( l | 0 ) == ( c | 0 ) ) return; l = f[ k >> 2 ] | 0; p = c + - 4 - o | 0; o = n; n = l; while ( 1 ) {

					f[ n >> 2 ] = f[ o >> 2 ]; o = o + 4 | 0; if ( ( o | 0 ) == ( c | 0 ) ) break; else n = n + 4 | 0;

				}f[ k >> 2 ] = l + ( ( p >>> 2 ) + 1 << 2 ); return;

			}p = i; if ( ! i )r = h; else {

				h = a + 4 | 0; l = f[ h >> 2 ] | 0; if ( ( l | 0 ) != ( j | 0 ) )f[ h >> 2 ] = l + ( ~ ( ( l + - 4 - i | 0 ) >>> 2 ) << 2 ); dn( p ); f[ g >> 2 ] = 0; f[ h >> 2 ] = 0; f[ a >> 2 ] = 0; r = 0;

			} if ( e >>> 0 > 1073741823 )um( a ); h = r >> 1; p = r >> 2 >>> 0 < 536870911 ? ( h >>> 0 < e >>> 0 ? e : h ) : 1073741823; if ( p >>> 0 > 1073741823 )um( a ); h = bj( p << 2 ) | 0; e = a + 4 | 0; f[ e >> 2 ] = h; f[ a >> 2 ] = h; f[ g >> 2 ] = h + ( p << 2 ); if ( ( b | 0 ) == ( c | 0 ) ) return; p = c + - 4 - d | 0; d = b; b = h; while ( 1 ) {

				f[ b >> 2 ] = f[ d >> 2 ]; d = d + 4 | 0; if ( ( d | 0 ) == ( c | 0 ) ) break; else b = b + 4 | 0;

			}f[ e >> 2 ] = h + ( ( p >>> 2 ) + 1 << 2 ); return;

		} function sd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; d = a + 8 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = g; do if ( e - g >> 2 >>> 0 >= b >>> 0 ) {

				i = a + 4 | 0; j = f[ i >> 2 ] | 0; k = j - g >> 2; l = k >>> 0 < b >>> 0; m = l ? k : b; n = j; if ( m | 0 ) {

					j = m; m = h; while ( 1 ) {

						f[ m >> 2 ] = f[ c >> 2 ]; j = j + - 1 | 0; if ( ! j ) break; else m = m + 4 | 0;

					}

				} if ( ! l ) {

					m = h + ( b << 2 ) | 0; if ( ( m | 0 ) == ( n | 0 ) ) return; else {

						o = i; p = n + ( ~ ( ( n + - 4 - m | 0 ) >>> 2 ) << 2 ) | 0; break;

					}

				} else {

					m = b - k | 0; j = m; q = n; while ( 1 ) {

						f[ q >> 2 ] = f[ c >> 2 ]; j = j + - 1 | 0; if ( ! j ) break; else q = q + 4 | 0;

					}o = i; p = n + ( m << 2 ) | 0; break;

				}

			} else {

				q = g; if ( ! g )r = e; else {

					j = a + 4 | 0; k = f[ j >> 2 ] | 0; if ( ( k | 0 ) != ( h | 0 ) )f[ j >> 2 ] = k + ( ~ ( ( k + - 4 - g | 0 ) >>> 2 ) << 2 ); dn( q ); f[ d >> 2 ] = 0; f[ j >> 2 ] = 0; f[ a >> 2 ] = 0; r = 0;

				} if ( b >>> 0 > 1073741823 )um( a ); j = r >> 1; q = r >> 2 >>> 0 < 536870911 ? ( j >>> 0 < b >>> 0 ? b : j ) : 1073741823; if ( q >>> 0 > 1073741823 )um( a ); j = bj( q << 2 ) | 0; k = a + 4 | 0; f[ k >> 2 ] = j; f[ a >> 2 ] = j; f[ d >> 2 ] = j + ( q << 2 ); q = b; l = j; while ( 1 ) {

					f[ l >> 2 ] = f[ c >> 2 ]; q = q + - 1 | 0; if ( ! q ) break; else l = l + 4 | 0;

				}o = k; p = j + ( b << 2 ) | 0;

			} while ( 0 );f[ o >> 2 ] = p; return;

		} function td( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; d = u; u = u + 16 | 0; e = d; g = c + 8 | 0; i = g; j = f[ i + 4 >> 2 ] | 0; k = c + 16 | 0; l = k; m = f[ l >> 2 ] | 0; n = f[ l + 4 >> 2 ] | 0; if ( ! ( ( j | 0 ) > ( n | 0 ) | ( ( j | 0 ) == ( n | 0 ) ? ( f[ i >> 2 ] | 0 ) >>> 0 > m >>> 0 : 0 ) ) ) {

				o = 0; u = d; return o | 0;

			}b[ a + 12 >> 0 ] = b[ ( f[ c >> 2 ] | 0 ) + m >> 0 ] | 0; m = k; i = Rj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, 1, 0 ) | 0; m = k; f[ m >> 2 ] = i; f[ m + 4 >> 2 ] = I; a:do if ( ( dg( e, c ) | 0 ? ( m = f[ e >> 2 ] | 0, i = g, n = k, j = f[ n >> 2 ] | 0, l = f[ n + 4 >> 2 ] | 0, n = Tj( f[ i >> 2 ] | 0, f[ i + 4 >> 2 ] | 0, j | 0, l | 0 ) | 0, i = I, ! ( ( i | 0 ) < 0 | ( i | 0 ) == 0 & n >>> 0 < m >>> 0 ) ) : 0 ) ? ( n = ( f[ c >> 2 ] | 0 ) + j | 0, ( m | 0 ) >= 1 ) : 0 ) {

				f[ a >> 2 ] = n; i = m + - 1 | 0; p = n + i | 0; switch ( ( h[ p >> 0 ] | 0 ) >>> 6 & 3 ) {

					case 0: {

						f[ a + 4 >> 2 ] = i; q = b[ p >> 0 ] & 63; break;

					} case 1: {

						if ( ( m | 0 ) < 2 ) {

							r = 0; break a;

						}f[ a + 4 >> 2 ] = m + - 2; p = n + m + - 2 | 0; q = ( h[ p + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ p >> 0 ] | 0 ); break;

					} case 2: {

						if ( ( m | 0 ) < 3 ) {

							r = 0; break a;

						}f[ a + 4 >> 2 ] = m + - 3; p = n + m + - 3 | 0; q = ( h[ p + 1 >> 0 ] | 0 ) << 8 | ( h[ p >> 0 ] | 0 ) | ( h[ p + 2 >> 0 ] | 0 ) << 16 & 4128768; break;

					} default: {

						r = 0; break a;

					}

				}p = q + 4096 | 0; f[ a + 8 >> 2 ] = p; if ( p >>> 0 < 1048576 ) {

					p = Rj( j | 0, l | 0, m | 0, 0 ) | 0; m = k; f[ m >> 2 ] = p; f[ m + 4 >> 2 ] = I; r = 1;

				} else r = 0;

			} else r = 0; while ( 0 );o = r; u = d; return o | 0;

		} function ud( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; h = u; u = u + 32 | 0; i = h + 16 | 0; j = h; k = f[ ( f[ ( f[ b + 4 >> 2 ] | 0 ) + 8 >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] | 0; do if ( ( c + - 1 | 0 ) >>> 0 < 6 & ( Na[ f[ ( f[ b >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( b ) | 0 ) == 1 ) {

				l = Na[ f[ ( f[ b >> 2 ] | 0 ) + 36 >> 2 ] & 127 ]( b ) | 0; m = Oa[ f[ ( f[ b >> 2 ] | 0 ) + 44 >> 2 ] & 127 ]( b, d ) | 0; if ( ( l | 0 ) == 0 | ( m | 0 ) == 0 ) {

					f[ a >> 2 ] = 0; u = h; return;

				}n = Oa[ f[ ( f[ b >> 2 ] | 0 ) + 40 >> 2 ] & 127 ]( b, d ) | 0; if ( ! n ) {

					f[ j >> 2 ] = f[ b + 44 >> 2 ]; f[ j + 4 >> 2 ] = l; f[ j + 12 >> 2 ] = m; f[ j + 8 >> 2 ] = m + 12; ic( a, i, c, k, e, j, g ); if ( ! ( f[ a >> 2 ] | 0 ) ) {

						f[ a >> 2 ] = 0; break;

					}u = h; return;

				} else {

					f[ j >> 2 ] = f[ b + 44 >> 2 ]; f[ j + 4 >> 2 ] = n; f[ j + 12 >> 2 ] = m; f[ j + 8 >> 2 ] = m + 12; hc( a, i, c, k, e, j, g ); if ( ! ( f[ a >> 2 ] | 0 ) ) {

						f[ a >> 2 ] = 0; break;

					}u = h; return;

				}

			} while ( 0 );f[ a >> 2 ] = 0; u = h; return;

		} function vd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0; c = u; u = u + 16 | 0; d = c; e = a + 76 | 0; g = f[ e >> 2 ] | 0; h = a + 80 | 0; i = f[ h >> 2 ] | 0; if ( ( i | 0 ) != ( g | 0 ) )f[ h >> 2 ] = i + ( ~ ( ( i + - 4 - g | 0 ) >>> 2 ) << 2 ); f[ e >> 2 ] = 0; f[ h >> 2 ] = 0; f[ a + 84 >> 2 ] = 0; if ( g | 0 )dn( g ); g = a + 64 | 0; h = f[ g >> 2 ] | 0; e = a + 68 | 0; if ( ( f[ e >> 2 ] | 0 ) != ( h | 0 ) )f[ e >> 2 ] = h; f[ g >> 2 ] = 0; f[ e >> 2 ] = 0; f[ a + 72 >> 2 ] = 0; if ( h | 0 )dn( h ); h = b + 4 | 0; e = f[ h >> 2 ] | 0; g = f[ b >> 2 ] | 0; i = ( ( e - g | 0 ) / 12 | 0 ) * 3 | 0; j = a + 4 | 0; k = f[ j >> 2 ] | 0; l = f[ a >> 2 ] | 0; m = k - l >> 2; n = l; l = k; k = g; if ( i >>> 0 <= m >>> 0 ) if ( i >>> 0 < m >>> 0 ? ( o = n + ( i << 2 ) | 0, ( o | 0 ) != ( l | 0 ) ) : 0 ) {

				f[ j >> 2 ] = l + ( ~ ( ( l + - 4 - o | 0 ) >>> 2 ) << 2 ); p = e; q = g; r = k;

			} else {

				p = e; q = g; r = k;

			} else {

				ff( a, i - m | 0 ); m = f[ b >> 2 ] | 0; p = f[ h >> 2 ] | 0; q = m; r = m;

			} if ( ( p | 0 ) != ( q | 0 ) ) {

				q = f[ a >> 2 ] | 0; m = ( p - r | 0 ) / 12 | 0; p = 0; do {

					h = p * 3 | 0; f[ q + ( h << 2 ) >> 2 ] = f[ r + ( p * 12 | 0 ) >> 2 ]; f[ q + ( h + 1 << 2 ) >> 2 ] = f[ r + ( p * 12 | 0 ) + 4 >> 2 ]; f[ q + ( h + 2 << 2 ) >> 2 ] = f[ r + ( p * 12 | 0 ) + 8 >> 2 ]; p = p + 1 | 0;

				} while ( p >>> 0 < m >>> 0 );

			}f[ d >> 2 ] = - 1; if ( ! ( zb( a, d ) | 0 ) ) {

				s = 0; u = c; return s | 0;

			}ab( a, f[ d >> 2 ] | 0 ) | 0; s = 1; u = c; return s | 0;

		} function wd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; f[ a + 4 >> 2 ] = f[ b + 4 >> 2 ]; c = a + 8 | 0; d = b + 8 | 0; if ( ( a | 0 ) == ( b | 0 ) ) return a | 0; e = b + 12 | 0; g = f[ e >> 2 ] | 0; if ( ! g )h = 0; else {

				i = a + 16 | 0; do if ( g >>> 0 > f[ i >> 2 ] << 5 >>> 0 ) {

					j = f[ c >> 2 ] | 0; if ( ! j )k = g; else {

						dn( j ); f[ c >> 2 ] = 0; f[ i >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; k = f[ e >> 2 ] | 0;

					} if ( ( k | 0 ) < 0 )um( c ); else {

						j = ( ( k + - 1 | 0 ) >>> 5 ) + 1 | 0; l = bj( j << 2 ) | 0; f[ c >> 2 ] = l; f[ a + 12 >> 2 ] = 0; f[ i >> 2 ] = j; m = f[ e >> 2 ] | 0; n = l; break;

					}

				} else {

					m = g; n = f[ c >> 2 ] | 0;

				} while ( 0 );qi( n | 0, f[ d >> 2 ] | 0, ( ( m + - 1 | 0 ) >>> 5 << 2 ) + 4 | 0 ) | 0; h = f[ e >> 2 ] | 0;

			}f[ a + 12 >> 2 ] = h; h = a + 20 | 0; e = b + 20 | 0; m = b + 24 | 0; b = f[ m >> 2 ] | 0; if ( ! b )o = 0; else {

				d = a + 28 | 0; do if ( b >>> 0 > f[ d >> 2 ] << 5 >>> 0 ) {

					n = f[ h >> 2 ] | 0; if ( ! n )p = b; else {

						dn( n ); f[ h >> 2 ] = 0; f[ d >> 2 ] = 0; f[ a + 24 >> 2 ] = 0; p = f[ m >> 2 ] | 0;

					} if ( ( p | 0 ) < 0 )um( h ); else {

						n = ( ( p + - 1 | 0 ) >>> 5 ) + 1 | 0; c = bj( n << 2 ) | 0; f[ h >> 2 ] = c; f[ a + 24 >> 2 ] = 0; f[ d >> 2 ] = n; q = f[ m >> 2 ] | 0; r = c; break;

					}

				} else {

					q = b; r = f[ h >> 2 ] | 0;

				} while ( 0 );qi( r | 0, f[ e >> 2 ] | 0, ( ( q + - 1 | 0 ) >>> 5 << 2 ) + 4 | 0 ) | 0; o = f[ m >> 2 ] | 0;

			}f[ a + 24 >> 2 ] = o; return a | 0;

		} function xd( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; f[ c >> 2 ] = 1; d = a + 4 | 0; e = c + 8 | 0; g = c + 12 | 0; c = f[ e >> 2 ] | 0; i = ( f[ g >> 2 ] | 0 ) - c | 0; if ( i >>> 0 < 4294967292 ) {

				Xg( e, i + 4 | 0, 0 ); j = f[ e >> 2 ] | 0;

			} else j = c; c = j + i | 0; i = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24; b[ c >> 0 ] = i; b[ c + 1 >> 0 ] = i >> 8; b[ c + 2 >> 0 ] = i >> 16; b[ c + 3 >> 0 ] = i >> 24; i = a + 8 | 0; c = a + 12 | 0; d = f[ i >> 2 ] | 0; if ( ( f[ c >> 2 ] | 0 ) != ( d | 0 ) ) {

				j = 0; k = d; do {

					d = k + ( j << 2 ) | 0; l = f[ e >> 2 ] | 0; m = ( f[ g >> 2 ] | 0 ) - l | 0; if ( m >>> 0 < 4294967292 ) {

						Xg( e, m + 4 | 0, 0 ); n = f[ e >> 2 ] | 0;

					} else n = l; l = n + m | 0; m = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24; b[ l >> 0 ] = m; b[ l + 1 >> 0 ] = m >> 8; b[ l + 2 >> 0 ] = m >> 16; b[ l + 3 >> 0 ] = m >> 24; j = j + 1 | 0; k = f[ i >> 2 ] | 0;

				} while ( j >>> 0 < ( f[ c >> 2 ] | 0 ) - k >> 2 >>> 0 );

			}k = a + 20 | 0; a = f[ e >> 2 ] | 0; c = ( f[ g >> 2 ] | 0 ) - a | 0; if ( c >>> 0 < 4294967292 ) {

				Xg( e, c + 4 | 0, 0 ); o = f[ e >> 2 ] | 0; p = o + c | 0; q = h[ k >> 0 ] | h[ k + 1 >> 0 ] << 8 | h[ k + 2 >> 0 ] << 16 | h[ k + 3 >> 0 ] << 24; b[ p >> 0 ] = q; b[ p + 1 >> 0 ] = q >> 8; b[ p + 2 >> 0 ] = q >> 16; b[ p + 3 >> 0 ] = q >> 24; return;

			} else {

				o = a; p = o + c | 0; q = h[ k >> 0 ] | h[ k + 1 >> 0 ] << 8 | h[ k + 2 >> 0 ] << 16 | h[ k + 3 >> 0 ] << 24; b[ p >> 0 ] = q; b[ p + 1 >> 0 ] = q >> 8; b[ p + 2 >> 0 ] = q >> 16; b[ p + 3 >> 0 ] = q >> 24; return;

			}

		} function yd( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = La, v = La, w = 0, x = 0, y = 0, z = La, A = La, B = La; d = u; u = u + 16 | 0; e = d; g = f[ a + 24 >> 2 ] | 0; h = a + 8 | 0; i = b[ ( f[ h >> 2 ] | 0 ) + 24 >> 0 ] | 0; j = i << 24 >> 24; k = j << 2; l = an( j >>> 0 > 1073741823 ? - 1 : j << 2 ) | 0; yl( e ); if ( ! ( Xi( e, $( n[ a + 32 >> 2 ] ), ( 1 << g ) + - 1 | 0 ) | 0 ) ) {

				m = 0; bn( l ); u = d; return m | 0;

			}g = f[ a + 16 >> 2 ] | 0; o = ( f[ f[ g >> 2 ] >> 2 ] | 0 ) + ( f[ g + 48 >> 2 ] | 0 ) | 0; if ( ! c ) {

				m = 1; bn( l ); u = d; return m | 0;

			}g = e + 4 | 0; p = a + 28 | 0; if ( i << 24 >> 24 > 0 ) {

				q = 0; r = 0; s = 0;

			} else {

				i = 0; a = 0; while ( 1 ) {

					ge( ( f[ f[ ( f[ h >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + a | 0, l | 0, k | 0 ) | 0; i = i + 1 | 0; if ( ( i | 0 ) == ( c | 0 ) ) {

						m = 1; break;

					} else a = a + k | 0;

				}bn( l ); u = d; return m | 0;

			} while ( 1 ) {

				a = f[ p >> 2 ] | 0; t = $( n[ g >> 2 ] ); v = $( n[ e >> 2 ] ); i = 0; w = r; while ( 1 ) {

					x = f[ o + ( w << 2 ) >> 2 ] | 0; y = ( x | 0 ) < 0; z = $( t * $( ( y ? 0 - x | 0 : x ) | 0 ) ); A = $( - z ); B = $( v * ( y ? A : z ) ); z = $( $( n[ a + ( i << 2 ) >> 2 ] ) + B ); n[ l + ( i << 2 ) >> 2 ] = z; i = i + 1 | 0; if ( ( i | 0 ) == ( j | 0 ) ) break; else w = w + 1 | 0;

				}ge( ( f[ f[ ( f[ h >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + s | 0, l | 0, k | 0 ) | 0; q = q + 1 | 0; if ( ( q | 0 ) == ( c | 0 ) ) {

					m = 1; break;

				} else {

					r = r + j | 0; s = s + k | 0;

				}

			}bn( l ); u = d; return m | 0;

		} function zd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; d = c; e = b; g = d - e | 0; h = g >> 2; i = a + 8 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = k; if ( h >>> 0 > j - k >> 2 >>> 0 ) {

				m = k; if ( ! k )n = j; else {

					j = a + 4 | 0; o = f[ j >> 2 ] | 0; if ( ( o | 0 ) != ( l | 0 ) )f[ j >> 2 ] = o + ( ~ ( ( o + - 4 - k | 0 ) >>> 2 ) << 2 ); dn( m ); f[ i >> 2 ] = 0; f[ j >> 2 ] = 0; f[ a >> 2 ] = 0; n = 0;

				} if ( h >>> 0 > 1073741823 )um( a ); j = n >> 1; m = n >> 2 >>> 0 < 536870911 ? ( j >>> 0 < h >>> 0 ? h : j ) : 1073741823; if ( m >>> 0 > 1073741823 )um( a ); j = bj( m << 2 ) | 0; n = a + 4 | 0; f[ n >> 2 ] = j; f[ a >> 2 ] = j; f[ i >> 2 ] = j + ( m << 2 ); if ( ( g | 0 ) <= 0 ) return; ge( j | 0, b | 0, g | 0 ) | 0; f[ n >> 2 ] = j + ( g >>> 2 << 2 ); return;

			}g = a + 4 | 0; a = f[ g >> 2 ] | 0; j = a - k >> 2; k = h >>> 0 > j >>> 0; h = k ? b + ( j << 2 ) | 0 : c; c = a; j = a; if ( ( h | 0 ) == ( b | 0 ) )p = l; else {

				a = h + - 4 - e | 0; e = b; b = l; while ( 1 ) {

					f[ b >> 2 ] = f[ e >> 2 ]; e = e + 4 | 0; if ( ( e | 0 ) == ( h | 0 ) ) break; else b = b + 4 | 0;

				}p = l + ( ( a >>> 2 ) + 1 << 2 ) | 0;

			} if ( k ) {

				k = d - h | 0; if ( ( k | 0 ) <= 0 ) return; ge( j | 0, h | 0, k | 0 ) | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + ( k >>> 2 << 2 ); return;

			} else {

				if ( ( p | 0 ) == ( c | 0 ) ) return; f[ g >> 2 ] = c + ( ~ ( ( c + - 4 - p | 0 ) >>> 2 ) << 2 ); return;

			}

		} function Ad( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; d = f[ a + 8 >> 2 ] | 0; e = a + 76 | 0; g = f[ e >> 2 ] | 0; h = f[ g + 80 >> 2 ] | 0; b[ c + 84 >> 0 ] = 0; i = c + 68 | 0; j = c + 72 | 0; k = f[ j >> 2 ] | 0; l = f[ i >> 2 ] | 0; m = k - l >> 2; n = l; l = k; if ( h >>> 0 <= m >>> 0 ) if ( h >>> 0 < m >>> 0 ? ( k = n + ( h << 2 ) | 0, ( k | 0 ) != ( l | 0 ) ) : 0 ) {

				f[ j >> 2 ] = l + ( ~ ( ( l + - 4 - k | 0 ) >>> 2 ) << 2 ); o = g; p = h;

			} else {

				o = g; p = h;

			} else {

				Ae( i, h - m | 0, 2384 ); m = f[ e >> 2 ] | 0; o = m; p = f[ m + 80 >> 2 ] | 0;

			}m = ( f[ o + 100 >> 2 ] | 0 ) - ( f[ o + 96 >> 2 ] | 0 ) | 0; e = ( m | 0 ) / 12 | 0; if ( ! m ) {

				q = 1; return q | 0;

			}m = c + 68 | 0; c = f[ o + 96 >> 2 ] | 0; o = f[ d + 28 >> 2 ] | 0; d = f[ ( f[ a + 80 >> 2 ] | 0 ) + 12 >> 2 ] | 0; a = 0; while ( 1 ) {

				h = a * 3 | 0; i = f[ d + ( f[ o + ( h << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; if ( i >>> 0 >= p >>> 0 ) {

					q = 0; r = 10; break;

				}g = f[ m >> 2 ] | 0; f[ g + ( f[ c + ( a * 12 | 0 ) >> 2 ] << 2 ) >> 2 ] = i; i = f[ d + ( f[ o + ( h + 1 << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; if ( i >>> 0 >= p >>> 0 ) {

					q = 0; r = 10; break;

				}f[ g + ( f[ c + ( a * 12 | 0 ) + 4 >> 2 ] << 2 ) >> 2 ] = i; i = f[ d + ( f[ o + ( h + 2 << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; if ( i >>> 0 >= p >>> 0 ) {

					q = 0; r = 10; break;

				}f[ g + ( f[ c + ( a * 12 | 0 ) + 8 >> 2 ] << 2 ) >> 2 ] = i; a = a + 1 | 0; if ( a >>> 0 >= e >>> 0 ) {

					q = 1; r = 10; break;

				}

			} if ( ( r | 0 ) == 10 ) return q | 0; return 0;

		} function Bd( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; d = u; u = u + 16 | 0; e = d; if ( ! ( Ff( e, c ) | 0 ) ) {

				g = 0; u = d; return g | 0;

			}i = e; e = f[ i >> 2 ] | 0; j = f[ i + 4 >> 2 ] | 0; i = c + 8 | 0; k = c + 16 | 0; l = k; m = f[ l >> 2 ] | 0; n = f[ l + 4 >> 2 ] | 0; l = Tj( f[ i >> 2 ] | 0, f[ i + 4 >> 2 ] | 0, m | 0, n | 0 ) | 0; i = I; if ( j >>> 0 > i >>> 0 | ( j | 0 ) == ( i | 0 ) & e >>> 0 > l >>> 0 ) {

				g = 0; u = d; return g | 0;

			}l = ( f[ c >> 2 ] | 0 ) + m | 0; c = Rj( m | 0, n | 0, e | 0, j | 0 ) | 0; j = k; f[ j >> 2 ] = c; f[ j + 4 >> 2 ] = I; if ( ( e | 0 ) < 1 ) {

				g = 0; u = d; return g | 0;

			}f[ a + 40 >> 2 ] = l; j = e + - 1 | 0; c = l + j | 0; a:do switch ( ( h[ c >> 0 ] | 0 ) >>> 6 & 3 ) {

				case 0: {

					f[ a + 44 >> 2 ] = j; o = b[ c >> 0 ] & 63; break;

				} case 1: {

					if ( ( e | 0 ) < 2 ) {

						g = 0; u = d; return g | 0;

					} else {

						f[ a + 44 >> 2 ] = e + - 2; k = l + e + - 2 | 0; o = ( h[ k + 1 >> 0 ] | 0 ) << 8 & 16128 | ( h[ k >> 0 ] | 0 ); break a;

					} break;

				} case 2: {

					if ( ( e | 0 ) < 3 ) {

						g = 0; u = d; return g | 0;

					} else {

						f[ a + 44 >> 2 ] = e + - 3; k = l + e + - 3 | 0; o = ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ) | ( h[ k + 2 >> 0 ] | 0 ) << 16 & 4128768; break a;

					} break;

				} case 3: {

					f[ a + 44 >> 2 ] = e + - 4; k = l + e + - 4 | 0; o = ( h[ k + 2 >> 0 ] | 0 ) << 16 | ( h[ k + 3 >> 0 ] | 0 ) << 24 & 1056964608 | ( h[ k + 1 >> 0 ] | 0 ) << 8 | ( h[ k >> 0 ] | 0 ); break;

				} default: {}

			} while ( 0 );e = o + 16384 | 0; f[ a + 48 >> 2 ] = e; g = e >>> 0 < 4194304; u = d; return g | 0;

		} function Cd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; c = u; u = u + 112 | 0; d = c + 96 | 0; e = c + 16 | 0; g = c + 4 | 0; h = c; i = e + 76 | 0; j = e; k = j + 76 | 0; do {

				f[ j >> 2 ] = 0; j = j + 4 | 0;

			} while ( ( j | 0 ) < ( k | 0 ) );f[ i >> 2 ] = - 1; f[ g >> 2 ] = 0; i = g + 4 | 0; f[ i >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; f[ h >> 2 ] = g; f[ d >> 2 ] = f[ h >> 2 ]; if ( pc( e, a, d ) | 0 ) {

				d = f[ g >> 2 ] | 0; rd( b, d, d + ( ( f[ i >> 2 ] | 0 ) - d >> 2 << 2 ) | 0 ); l = f[ e + 68 >> 2 ] | 0;

			} else l = 0; d = f[ g >> 2 ] | 0; if ( d | 0 ) {

				g = f[ i >> 2 ] | 0; if ( ( g | 0 ) != ( d | 0 ) )f[ i >> 2 ] = g + ( ~ ( ( g + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

			}d = f[ e + 56 >> 2 ] | 0; if ( d | 0 )dn( d ); d = f[ e + 32 >> 2 ] | 0; if ( d | 0 ) {

				g = e + 36 | 0; i = f[ g >> 2 ] | 0; if ( ( i | 0 ) != ( d | 0 ) )f[ g >> 2 ] = i + ( ~ ( ( i + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

			}d = f[ e + 20 >> 2 ] | 0; if ( d | 0 ) {

				i = e + 24 | 0; g = f[ i >> 2 ] | 0; if ( ( g | 0 ) != ( d | 0 ) )f[ i >> 2 ] = g + ( ~ ( ( g + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

			}d = f[ e + 8 >> 2 ] | 0; if ( d | 0 ) {

				g = e + 12 | 0; i = f[ g >> 2 ] | 0; if ( ( i | 0 ) != ( d | 0 ) )f[ g >> 2 ] = i + ( ~ ( ( i + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

			}d = e + 4 | 0; e = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( ! e ) {

				u = c; return l | 0;

			}mf( e ); dn( e ); u = c; return l | 0;

		} function Dd( a, b, c, d ) {

			a = a | 0; b = $( b ); c = $( c ); d = d | 0; var e = La, f = La, g = La, h = La, i = La, j = La, k = 0.0, l = La, m = La, o = 0.0, p = 0.0, q = 0.0, r = 0.0, s = 0.0, t = La, u = La, v = 0, w = 0; e = $( b + c ); f = $( b - c ); if ( ! ( f <= $( .5 ) ) | ( ! ( f >= $( - .5 ) ) | ( ! ( e >= $( .5 ) ) | ! ( e <= $( 1.5 ) ) ) ) ) {

				do if ( ! ( e <= $( .5 ) ) ) {

					if ( e >= $( 1.5 ) ) {

						g = $( $( 1.5 ) - c ); h = $( $( 1.5 ) - b ); break;

					} if ( ! ( f <= $( - .5 ) ) ) {

						g = $( c + $( .5 ) ); h = $( b + $( - .5 ) ); break;

					} else {

						g = $( c + $( - .5 ) ); h = $( b + $( .5 ) ); break;

					}

				} else {

					g = $( $( .5 ) - c ); h = $( $( .5 ) - b );

				} while ( 0 );i = $( h + g ); j = $( g - h ); k = - 1.0; l = g; m = h;

			} else {

				i = e; j = f; k = 1.0; l = b; m = c;

			}c = $( + l * 2.0 + - 1.0 ); l = $( + m * 2.0 + - 1.0 ); o = + i * 2.0; p = o + - 1.0; q = 3.0 - o; o = + j * 2.0; r = o + 1.0; s = 1.0 - o; o = s < r ? s : r; r = q < p ? q : p; j = $( k * ( o < r ? o : r ) ); i = $( $( l * l ) + $( $( c * c ) + $( j * j ) ) ); if ( + i < 1.0e-06 ) {

				n[ d >> 2 ] = $( 0.0 ); t = $( 0.0 ); u = $( 0.0 ); v = d + 4 | 0; n[ v >> 2 ] = u; w = d + 8 | 0; n[ w >> 2 ] = t; return;

			} else {

				m = $( $( 1.0 ) / $( L( $( i ) ) ) ); i = $( m * j ); n[ d >> 2 ] = i; t = $( m * l ); u = $( m * c ); v = d + 4 | 0; n[ v >> 2 ] = u; w = d + 8 | 0; n[ w >> 2 ] = t; return;

			}

		} function Ed( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0; e = c & 255; g = ( d | 0 ) != 0; a:do if ( g & ( a & 3 | 0 ) != 0 ) {

				h = c & 255; i = a; j = d; while ( 1 ) {

					if ( ( b[ i >> 0 ] | 0 ) == h << 24 >> 24 ) {

						k = i; l = j; m = 6; break a;

					}n = i + 1 | 0; o = j + - 1 | 0; p = ( o | 0 ) != 0; if ( p & ( n & 3 | 0 ) != 0 ) {

						i = n; j = o;

					} else {

						q = n; r = o; s = p; m = 5; break;

					}

				}

			} else {

				q = a; r = d; s = g; m = 5;

			} while ( 0 );if ( ( m | 0 ) == 5 ) if ( s ) {

				k = q; l = r; m = 6;

			} else {

				t = q; u = 0;

			}b:do if ( ( m | 0 ) == 6 ) {

				q = c & 255; if ( ( b[ k >> 0 ] | 0 ) == q << 24 >> 24 ) {

					t = k; u = l;

				} else {

					r = X( e, 16843009 ) | 0; c:do if ( l >>> 0 > 3 ) {

						s = k; g = l; while ( 1 ) {

							d = f[ s >> 2 ] ^ r; if ( ( d & - 2139062144 ^ - 2139062144 ) & d + - 16843009 | 0 ) break; d = s + 4 | 0; a = g + - 4 | 0; if ( a >>> 0 > 3 ) {

								s = d; g = a;

							} else {

								v = d; w = a; m = 11; break c;

							}

						}x = s; y = g;

					} else {

						v = k; w = l; m = 11;

					} while ( 0 );if ( ( m | 0 ) == 11 ) if ( ! w ) {

						t = v; u = 0; break;

					} else {

						x = v; y = w;

					} while ( 1 ) {

						if ( ( b[ x >> 0 ] | 0 ) == q << 24 >> 24 ) {

							t = x; u = y; break b;

						}r = x + 1 | 0; y = y + - 1 | 0; if ( ! y ) {

							t = r; u = 0; break;

						} else x = r;

					}

				}

			} while ( 0 );return ( u | 0 ? t : 0 ) | 0;

		} function Fd( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0; e = u; u = u + 16 | 0; g = e; h = d + 8 | 0; i = f[ h >> 2 ] | 0; j = f[ h + 4 >> 2 ] | 0; h = d + 16 | 0; k = h; l = f[ k >> 2 ] | 0; m = f[ k + 4 >> 2 ] | 0; if ( ( j | 0 ) > ( m | 0 ) | ( j | 0 ) == ( m | 0 ) & i >>> 0 > l >>> 0 ) {

				k = b[ ( f[ d >> 2 ] | 0 ) + l >> 0 ] | 0; n = Rj( l | 0, m | 0, 1, 0 ) | 0; o = I; p = h; f[ p >> 2 ] = n; f[ p + 4 >> 2 ] = o; if ( k << 24 >> 24 != - 2 ) {

					q = k; r = o; s = n; t = 3;

				}

			} else {

				q = 0; r = m; s = l; t = 3;

			} if ( ( t | 0 ) == 3 ) {

				if ( ( j | 0 ) > ( r | 0 ) | ( j | 0 ) == ( r | 0 ) & i >>> 0 > s >>> 0 ) {

					i = b[ ( f[ d >> 2 ] | 0 ) + s >> 0 ] | 0; j = Rj( s | 0, r | 0, 1, 0 ) | 0; r = h; f[ r >> 2 ] = j; f[ r + 4 >> 2 ] = I; v = i;

				} else v = 0; Va[ f[ ( f[ a >> 2 ] | 0 ) + 40 >> 2 ] & 7 ]( g, a, q << 24 >> 24, v << 24 >> 24 ); v = a + 20 | 0; q = f[ g >> 2 ] | 0; f[ g >> 2 ] = 0; i = f[ v >> 2 ] | 0; f[ v >> 2 ] = q; if ( i ) {

					Sa[ f[ ( f[ i >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( i ); i = f[ g >> 2 ] | 0; f[ g >> 2 ] = 0; if ( i | 0 )Sa[ f[ ( f[ i >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( i );

				} else f[ g >> 2 ] = 0;

			}g = f[ a + 20 >> 2 ] | 0; if ( g | 0 ? ! ( Oa[ f[ ( f[ a >> 2 ] | 0 ) + 28 >> 2 ] & 127 ]( a, g ) | 0 ) : 0 ) {

				w = 0; u = e; return w | 0;

			}w = Pa[ f[ ( f[ a >> 2 ] | 0 ) + 36 >> 2 ] & 31 ]( a, c, d ) | 0; u = e; return w | 0;

		} function Gd( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; e = a + 4 | 0; g = f[ e >> 2 ] | 0; if ( ! g ) {

				f[ c >> 2 ] = e; h = e; return h | 0;

			}e = b[ d + 11 >> 0 ] | 0; i = e << 24 >> 24 < 0; j = i ? f[ d + 4 >> 2 ] | 0 : e & 255; e = i ? f[ d >> 2 ] | 0 : d; d = a + 4 | 0; a = g; while ( 1 ) {

				g = a + 16 | 0; i = b[ g + 11 >> 0 ] | 0; k = i << 24 >> 24 < 0; l = k ? f[ a + 20 >> 2 ] | 0 : i & 255; i = l >>> 0 < j >>> 0; m = i ? l : j; if ( ( m | 0 ) != 0 ? ( n = jh( e, k ? f[ g >> 2 ] | 0 : g, m ) | 0, ( n | 0 ) != 0 ) : 0 ) if ( ( n | 0 ) < 0 )o = 8; else o = 10; else if ( j >>> 0 < l >>> 0 )o = 8; else o = 10; if ( ( o | 0 ) == 8 ) {

					o = 0; n = f[ a >> 2 ] | 0; if ( ! n ) {

						o = 9; break;

					} else {

						p = a; q = n;

					}

				} else if ( ( o | 0 ) == 10 ) {

					o = 0; n = j >>> 0 < l >>> 0 ? j : l; if ( ( n | 0 ) != 0 ? ( l = jh( k ? f[ g >> 2 ] | 0 : g, e, n ) | 0, ( l | 0 ) != 0 ) : 0 ) {

						if ( ( l | 0 ) >= 0 ) {

							o = 16; break;

						}

					} else o = 12; if ( ( o | 0 ) == 12 ? ( o = 0, ! i ) : 0 ) {

						o = 16; break;

					}r = a + 4 | 0; i = f[ r >> 2 ] | 0; if ( ! i ) {

						o = 15; break;

					} else {

						p = r; q = i;

					}

				}d = p; a = q;

			} if ( ( o | 0 ) == 9 ) {

				f[ c >> 2 ] = a; h = a; return h | 0;

			} else if ( ( o | 0 ) == 15 ) {

				f[ c >> 2 ] = a; h = r; return h | 0;

			} else if ( ( o | 0 ) == 16 ) {

				f[ c >> 2 ] = a; h = d; return h | 0;

			} return 0;

		} function Hd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0; d = u; u = u + 32 | 0; e = d + 24 | 0; g = d + 16 | 0; h = d + 8 | 0; i = d; j = a + 4 | 0; k = f[ j >> 2 ] | 0; l = f[ b >> 2 ] | 0; m = f[ b + 4 >> 2 ] | 0; b = f[ c >> 2 ] | 0; n = f[ c + 4 >> 2 ] | 0; c = b - l << 3; f[ j >> 2 ] = k - m + n + c; j = ( f[ a >> 2 ] | 0 ) + ( k >>> 5 << 2 ) | 0; a = k & 31; k = j; if ( ( m | 0 ) != ( a | 0 ) ) {

				f[ e >> 2 ] = l; f[ e + 4 >> 2 ] = m; f[ g >> 2 ] = b; f[ g + 4 >> 2 ] = n; f[ h >> 2 ] = k; f[ h + 4 >> 2 ] = a; Ec( i, e, g, h ); u = d; return;

			}h = n - m + c | 0; c = l; if ( ( h | 0 ) > 0 ) {

				if ( ! m ) {

					o = h; p = j; q = 0; r = l; s = c;

				} else {

					l = 32 - m | 0; n = ( h | 0 ) < ( l | 0 ) ? h : l; g = - 1 >>> ( l - n | 0 ) & - 1 << m; f[ j >> 2 ] = f[ j >> 2 ] & ~ g | f[ c >> 2 ] & g; g = n + m | 0; l = c + 4 | 0; o = h - n | 0; p = j + ( g >>> 5 << 2 ) | 0; q = g & 31; r = l; s = l;

				}l = ( o | 0 ) / 32 | 0; qi( p | 0, r | 0, l << 2 | 0 ) | 0; r = o - ( l << 5 ) | 0; o = p + ( l << 2 ) | 0; p = o; if ( ( r | 0 ) > 0 ) {

					g = - 1 >>> ( 32 - r | 0 ); f[ o >> 2 ] = f[ o >> 2 ] & ~ g | f[ s + ( l << 2 ) >> 2 ] & g; t = r; v = p;

				} else {

					t = q; v = p;

				}

			} else {

				t = m; v = k;

			}f[ i >> 2 ] = v; f[ i + 4 >> 2 ] = t; u = d; return;

		} function Id( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; e = u; u = u + 32 | 0; g = e + 12 | 0; h = e; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; i = gg( c ) | 0; if ( i >>> 0 > 4294967279 )um( g ); if ( i >>> 0 < 11 ) {

				b[ g + 11 >> 0 ] = i; if ( ! i )j = g; else {

					k = g; l = 6;

				}

			} else {

				m = i + 16 & - 16; n = bj( m ) | 0; f[ g >> 2 ] = n; f[ g + 8 >> 2 ] = m | - 2147483648; f[ g + 4 >> 2 ] = i; k = n; l = 6;

			} if ( ( l | 0 ) == 6 ) {

				ge( k | 0, c | 0, i | 0 ) | 0; j = k;

			}b[ j + i >> 0 ] = 0; f[ h >> 2 ] = 0; f[ h + 4 >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; i = gg( d ) | 0; if ( i >>> 0 > 4294967279 )um( h ); if ( i >>> 0 < 11 ) {

				b[ h + 11 >> 0 ] = i; if ( ! i )o = h; else {

					p = h; l = 12;

				}

			} else {

				j = i + 16 & - 16; k = bj( j ) | 0; f[ h >> 2 ] = k; f[ h + 8 >> 2 ] = j | - 2147483648; f[ h + 4 >> 2 ] = i; p = k; l = 12;

			} if ( ( l | 0 ) == 12 ) {

				ge( p | 0, d | 0, i | 0 ) | 0; o = p;

			}b[ o + i >> 0 ] = 0; i = f[ a + 4 >> 2 ] | 0; if ( ( i | 0 ) != 0 ? ( o = Mc( i, g, h ) | 0, ( o | 0 ) != 0 ) : 0 )q = ih( a, f[ o + 40 >> 2 ] | 0 ) | 0; else q = - 1; if ( ( b[ h + 11 >> 0 ] | 0 ) < 0 )dn( f[ h >> 2 ] | 0 ); if ( ( b[ g + 11 >> 0 ] | 0 ) >= 0 ) {

				u = e; return q | 0;

			}dn( f[ g >> 2 ] | 0 ); u = e; return q | 0;

		} function Jd( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; e = c; g = d - e | 0; h = a + 8 | 0; i = f[ h >> 2 ] | 0; j = f[ a >> 2 ] | 0; k = j; if ( g >>> 0 > ( i - j | 0 ) >>> 0 ) {

				if ( ! j )l = i; else {

					i = a + 4 | 0; if ( ( f[ i >> 2 ] | 0 ) != ( k | 0 ) )f[ i >> 2 ] = k; dn( k ); f[ h >> 2 ] = 0; f[ i >> 2 ] = 0; f[ a >> 2 ] = 0; l = 0;

				} if ( ( g | 0 ) < 0 )um( a ); i = l << 1; m = l >>> 0 < 1073741823 ? ( i >>> 0 < g >>> 0 ? g : i ) : 2147483647; if ( ( m | 0 ) < 0 )um( a ); i = bj( m ) | 0; l = a + 4 | 0; f[ l >> 2 ] = i; f[ a >> 2 ] = i; f[ h >> 2 ] = i + m; if ( ( c | 0 ) == ( d | 0 ) ) return; else {

					n = c; o = i;

				} do {

					b[ o >> 0 ] = b[ n >> 0 ] | 0; n = n + 1 | 0; o = ( f[ l >> 2 ] | 0 ) + 1 | 0; f[ l >> 2 ] = o;

				} while ( ( n | 0 ) != ( d | 0 ) );return;

			} else {

				n = a + 4 | 0; a = ( f[ n >> 2 ] | 0 ) - j | 0; j = g >>> 0 > a >>> 0; g = c + a | 0; a = j ? g : d; o = a - e | 0; if ( o | 0 )qi( k | 0, c | 0, o | 0 ) | 0; c = k + o | 0; if ( ! j ) {

					if ( ( f[ n >> 2 ] | 0 ) == ( c | 0 ) ) return; f[ n >> 2 ] = c; return;

				} if ( ( a | 0 ) == ( d | 0 ) ) return; a = g; g = f[ n >> 2 ] | 0; do {

					b[ g >> 0 ] = b[ a >> 0 ] | 0; a = a + 1 | 0; g = ( f[ n >> 2 ] | 0 ) + 1 | 0; f[ n >> 2 ] = g;

				} while ( ( a | 0 ) != ( d | 0 ) );return;

			}

		} function Kd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; e = a + 4 | 0; g = f[ e >> 2 ] | 0; h = g; if ( d - g >> 2 >>> 0 >= b >>> 0 ) {

				Vf( g | 0, 0, b << 2 | 0 ) | 0; f[ e >> 2 ] = g + ( b << 2 ); return;

			}i = f[ a >> 2 ] | 0; j = g - i >> 2; g = j + b | 0; k = i; if ( g >>> 0 > 1073741823 )um( a ); l = d - i | 0; d = l >> 1; m = l >> 2 >>> 0 < 536870911 ? ( d >>> 0 < g >>> 0 ? g : d ) : 1073741823; do if ( m ) if ( m >>> 0 > 1073741823 ) {

				d = ra( 8 ) | 0; Yk( d, 9789 ); f[ d >> 2 ] = 3704; va( d | 0, 856, 80 );

			} else {

				n = bj( m << 2 ) | 0; break;

			} else n = 0; while ( 0 );d = n + ( j << 2 ) | 0; Vf( d | 0, 0, b << 2 | 0 ) | 0; b = d; j = n + ( m << 2 ) | 0; m = n + ( g << 2 ) | 0; if ( ( h | 0 ) == ( k | 0 ) ) {

				o = b; p = i; q = h;

			} else {

				i = h; h = b; b = d; do {

					i = i + - 4 | 0; d = f[ i >> 2 ] | 0; f[ i >> 2 ] = 0; f[ b + - 4 >> 2 ] = d; b = h + - 4 | 0; h = b;

				} while ( ( i | 0 ) != ( k | 0 ) );o = h; p = f[ a >> 2 ] | 0; q = f[ e >> 2 ] | 0;

			}f[ a >> 2 ] = o; f[ e >> 2 ] = m; f[ c >> 2 ] = j; j = p; if ( ( q | 0 ) != ( j | 0 ) ) {

				c = q; do {

					c = c + - 4 | 0; q = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( q | 0 )Sa[ f[ ( f[ q >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( q );

				} while ( ( c | 0 ) != ( j | 0 ) );

			} if ( ! p ) return; dn( p ); return;

		} function Ld( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; d = a + 4 | 0; e = f[ a >> 2 ] | 0; g = ( ( f[ d >> 2 ] | 0 ) - e | 0 ) / 12 | 0; h = g + 1 | 0; if ( h >>> 0 > 357913941 )um( a ); i = a + 8 | 0; j = ( ( f[ i >> 2 ] | 0 ) - e | 0 ) / 12 | 0; e = j << 1; k = j >>> 0 < 178956970 ? ( e >>> 0 < h >>> 0 ? h : e ) : 357913941; do if ( k ) if ( k >>> 0 > 357913941 ) {

				e = ra( 8 ) | 0; Yk( e, 9789 ); f[ e >> 2 ] = 3704; va( e | 0, 856, 80 );

			} else {

				l = bj( k * 12 | 0 ) | 0; break;

			} else l = 0; while ( 0 );e = l + ( g * 12 | 0 ) | 0; g = e; h = l + ( k * 12 | 0 ) | 0; Rf( e, c ); c = e + 12 | 0; k = f[ a >> 2 ] | 0; l = f[ d >> 2 ] | 0; if ( ( l | 0 ) == ( k | 0 ) ) {

				m = g; n = k; o = k;

			} else {

				j = l; l = g; g = e; do {

					e = g + - 12 | 0; j = j + - 12 | 0; f[ e >> 2 ] = f[ j >> 2 ]; f[ e + 4 >> 2 ] = f[ j + 4 >> 2 ]; f[ e + 8 >> 2 ] = f[ j + 8 >> 2 ]; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; g = l + - 12 | 0; l = g;

				} while ( ( j | 0 ) != ( k | 0 ) );m = l; n = f[ a >> 2 ] | 0; o = f[ d >> 2 ] | 0;

			}f[ a >> 2 ] = m; f[ d >> 2 ] = c; f[ i >> 2 ] = h; h = n; if ( ( o | 0 ) != ( h | 0 ) ) {

				i = o; do {

					i = i + - 12 | 0; if ( ( b[ i + 11 >> 0 ] | 0 ) < 0 )dn( f[ i >> 2 ] | 0 );

				} while ( ( i | 0 ) != ( h | 0 ) );

			} if ( ! n ) return; dn( n ); return;

		} function Md( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; d = c; e = b; g = d - e | 0; h = g >> 2; i = a + 8 | 0; j = f[ i >> 2 ] | 0; k = f[ a >> 2 ] | 0; l = k; if ( h >>> 0 <= j - k >> 2 >>> 0 ) {

				m = a + 4 | 0; n = ( f[ m >> 2 ] | 0 ) - k >> 2; o = h >>> 0 > n >>> 0; p = o ? b + ( n << 2 ) | 0 : c; c = p; n = c - e | 0; e = n >> 2; if ( e | 0 )qi( k | 0, b | 0, n | 0 ) | 0; n = l + ( e << 2 ) | 0; if ( o ) {

					o = d - c | 0; if ( ( o | 0 ) <= 0 ) return; ge( f[ m >> 2 ] | 0, p | 0, o | 0 ) | 0; f[ m >> 2 ] = ( f[ m >> 2 ] | 0 ) + ( o >>> 2 << 2 ); return;

				} else {

					o = f[ m >> 2 ] | 0; if ( ( o | 0 ) == ( n | 0 ) ) return; f[ m >> 2 ] = o + ( ~ ( ( o + - 4 - n | 0 ) >>> 2 ) << 2 ); return;

				}

			}n = k; if ( ! k )q = j; else {

				j = a + 4 | 0; o = f[ j >> 2 ] | 0; if ( ( o | 0 ) != ( l | 0 ) )f[ j >> 2 ] = o + ( ~ ( ( o + - 4 - k | 0 ) >>> 2 ) << 2 ); dn( n ); f[ i >> 2 ] = 0; f[ j >> 2 ] = 0; f[ a >> 2 ] = 0; q = 0;

			} if ( h >>> 0 > 1073741823 )um( a ); j = q >> 1; n = q >> 2 >>> 0 < 536870911 ? ( j >>> 0 < h >>> 0 ? h : j ) : 1073741823; if ( n >>> 0 > 1073741823 )um( a ); j = bj( n << 2 ) | 0; h = a + 4 | 0; f[ h >> 2 ] = j; f[ a >> 2 ] = j; f[ i >> 2 ] = j + ( n << 2 ); if ( ( g | 0 ) <= 0 ) return; ge( j | 0, b | 0, g | 0 ) | 0; f[ h >> 2 ] = j + ( g >>> 2 << 2 ); return;

		} function Nd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; c = u; u = u + 16 | 0; d = c; e = bj( 64 ) | 0; g = bj( 12 ) | 0; h = f[ ( f[ a + 4 >> 2 ] | 0 ) + 80 >> 2 ] | 0; f[ g + 4 >> 2 ] = 0; f[ g >> 2 ] = 2592; f[ g + 8 >> 2 ] = h; f[ d >> 2 ] = g; Ah( e, d ); g = e; if ( ( b | 0 ) >= 0 ) {

				h = a + 8 | 0; i = a + 12 | 0; a = f[ i >> 2 ] | 0; j = f[ h >> 2 ] | 0; k = a - j >> 2; do if ( ( k | 0 ) <= ( b | 0 ) ) {

					l = b + 1 | 0; m = a; if ( l >>> 0 > k >>> 0 ) {

						Kd( h, l - k | 0 ); break;

					} if ( l >>> 0 < k >>> 0 ? ( n = j + ( l << 2 ) | 0, ( n | 0 ) != ( m | 0 ) ) : 0 ) {

						l = m; do {

							m = l + - 4 | 0; f[ i >> 2 ] = m; o = f[ m >> 2 ] | 0; f[ m >> 2 ] = 0; if ( o | 0 )Sa[ f[ ( f[ o >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( o ); l = f[ i >> 2 ] | 0;

						} while ( ( l | 0 ) != ( n | 0 ) );

					}

				} while ( 0 );i = ( f[ h >> 2 ] | 0 ) + ( b << 2 ) | 0; b = f[ i >> 2 ] | 0; f[ i >> 2 ] = g; if ( ! b )p = 1; else {

					Sa[ f[ ( f[ b >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( b ); p = 1;

				}

			} else {

				Sa[ f[ ( f[ e >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( e ); p = 0;

			}e = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( ! e ) {

				u = c; return p | 0;

			}Sa[ f[ ( f[ e >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( e ); u = c; return p | 0;

		} function Od( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; c = f[ b >> 2 ] | 0; do if ( ( c | 0 ) != - 1 ) {

				b = f[ ( f[ ( f[ a + 4 >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] | 0; d = c + 1 | 0; e = ( ( d >>> 0 ) % 3 | 0 | 0 ) == 0 ? c + - 2 | 0 : d; if ( ( e | 0 ) == - 1 )g = - 1; else g = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( e | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( e | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; if ( ( b | 0 ) != - 1 ) {

					e = ( ( ( b >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + b | 0; if ( ( e | 0 ) == - 1 ) {

						h = - 1; i = b; j = 0;

					} else {

						h = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( e | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( e | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; i = b; j = 0;

					}

				} else {

					h = - 1; i = - 1; j = 1;

				} if ( ( g | 0 ) != ( h | 0 ) ) {

					k = - 1; return k | 0;

				}b = ( ( ( c >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + c | 0; if ( ( b | 0 ) == - 1 ) if ( j ) {

					l = - 1; m = - 1; n = i; break;

				} else o = - 1; else {

					e = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( b | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( b | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; if ( j ) {

						l = - 1; m = e; n = i; break;

					} else o = e;

				}e = i + 1 | 0; b = ( ( e >>> 0 ) % 3 | 0 | 0 ) == 0 ? i + - 2 | 0 : e; if ( ( b | 0 ) == - 1 ) {

					l = - 1; m = o; n = i;

				} else {

					l = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( b | 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( b | 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; m = o; n = i;

				}

			} else {

				l = - 1; m = - 1; n = - 1;

			} while ( 0 );k = ( m | 0 ) != ( l | 0 ) ? - 1 : n; return k | 0;

		} function Pd( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0; e = a + 20 | 0; if ( cc( e, c ) | 0 ) {

				g = 0; return g | 0;

			}a = Db( e, c ) | 0; c = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; d = f[ a >> 2 ] | 0; f[ a >> 2 ] = c; if ( ! d ) {

				g = 1; return g | 0;

			}c = f[ d + 28 >> 2 ] | 0; if ( c | 0 ) {

				a = c; do {

					c = a; a = f[ a >> 2 ] | 0; Ye( c + 8 | 0 ); dn( c );

				} while ( ( a | 0 ) != 0 );

			}a = d + 20 | 0; c = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( c | 0 )dn( c ); c = f[ d + 8 >> 2 ] | 0; if ( c | 0 ) {

				a = c; do {

					c = a; a = f[ a >> 2 ] | 0; e = c + 8 | 0; h = f[ c + 20 >> 2 ] | 0; if ( h | 0 ) {

						i = c + 24 | 0; if ( ( f[ i >> 2 ] | 0 ) != ( h | 0 ) )f[ i >> 2 ] = h; dn( h );

					} if ( ( b[ e + 11 >> 0 ] | 0 ) < 0 )dn( f[ e >> 2 ] | 0 ); dn( c );

				} while ( ( a | 0 ) != 0 );

			}a = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( a | 0 )dn( a ); dn( d ); g = 1; return g | 0;

		} function Qd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; d = u; u = u + 16 | 0; e = d; f[ e >> 2 ] = b; g = a + 8 | 0; if ( ( ( f[ a + 12 >> 2 ] | 0 ) - ( f[ g >> 2 ] | 0 ) >> 2 | 0 ) <= ( b | 0 ) )ze( g, b + 1 | 0 ); h = f[ ( f[ c >> 2 ] | 0 ) + 56 >> 2 ] | 0; do if ( ( h | 0 ) < 5 ) {

				i = a + 20 + ( h * 12 | 0 ) + 4 | 0; j = f[ i >> 2 ] | 0; if ( ( j | 0 ) == ( f[ a + 20 + ( h * 12 | 0 ) + 8 >> 2 ] | 0 ) ) {

					xf( a + 20 + ( h * 12 | 0 ) | 0, e ); break;

				} else {

					f[ j >> 2 ] = b; f[ i >> 2 ] = j + 4; break;

				}

			} while ( 0 );b = f[ c >> 2 ] | 0; h = f[ e >> 2 ] | 0; f[ b + 60 >> 2 ] = h; e = ( f[ g >> 2 ] | 0 ) + ( h << 2 ) | 0; f[ c >> 2 ] = 0; c = f[ e >> 2 ] | 0; f[ e >> 2 ] = b; if ( ! c ) {

				u = d; return;

			}b = c + 88 | 0; e = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( e | 0 ) {

				b = f[ e + 8 >> 2 ] | 0; if ( b | 0 ) {

					h = e + 12 | 0; if ( ( f[ h >> 2 ] | 0 ) != ( b | 0 ) )f[ h >> 2 ] = b; dn( b );

				}dn( e );

			}e = f[ c + 68 >> 2 ] | 0; if ( e | 0 ) {

				b = c + 72 | 0; h = f[ b >> 2 ] | 0; if ( ( h | 0 ) != ( e | 0 ) )f[ b >> 2 ] = h + ( ~ ( ( h + - 4 - e | 0 ) >>> 2 ) << 2 ); dn( e );

			}e = c + 64 | 0; h = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( h | 0 ) {

				e = f[ h >> 2 ] | 0; if ( e | 0 ) {

					b = h + 4 | 0; if ( ( f[ b >> 2 ] | 0 ) != ( e | 0 ) )f[ b >> 2 ] = e; dn( e );

				}dn( h );

			}dn( c ); u = d; return;

		} function Rd( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; b = u; u = u + 16 | 0; c = b + 4 | 0; d = b; e = a + 8 | 0; g = f[ e >> 2 ] | 0; Eg( f[ a + 4 >> 2 ] | 0, ( f[ g + 56 >> 2 ] | 0 ) - ( f[ g + 52 >> 2 ] | 0 ) >> 2 ); g = a + 84 | 0; a = f[ g >> 2 ] | 0; if ( ! a ) {

				h = f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] | 0; i = ( f[ h + 4 >> 2 ] | 0 ) - ( f[ h >> 2 ] | 0 ) >> 2; h = ( i >>> 0 ) / 3 | 0; if ( i >>> 0 <= 2 ) {

					u = b; return 1;

				}i = 0; do {

					f[ d >> 2 ] = i * 3; f[ c >> 2 ] = f[ d >> 2 ]; tb( e, c ); i = i + 1 | 0;

				} while ( ( i | 0 ) < ( h | 0 ) );u = b; return 1;

			} else {

				h = f[ a >> 2 ] | 0; if ( ( f[ a + 4 >> 2 ] | 0 ) == ( h | 0 ) ) {

					u = b; return 1;

				}a = 0; i = h; do {

					f[ d >> 2 ] = f[ i + ( a << 2 ) >> 2 ]; f[ c >> 2 ] = f[ d >> 2 ]; tb( e, c ); a = a + 1 | 0; h = f[ g >> 2 ] | 0; i = f[ h >> 2 ] | 0;

				} while ( a >>> 0 < ( f[ h + 4 >> 2 ] | 0 ) - i >> 2 >>> 0 );u = b; return 1;

			} return 0;

		} function Sd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0; d = u; u = u + 48 | 0; e = d + 16 | 0; g = d; h = d + 32 | 0; i = a + 28 | 0; j = f[ i >> 2 ] | 0; f[ h >> 2 ] = j; k = a + 20 | 0; l = ( f[ k >> 2 ] | 0 ) - j | 0; f[ h + 4 >> 2 ] = l; f[ h + 8 >> 2 ] = b; f[ h + 12 >> 2 ] = c; b = l + c | 0; l = a + 60 | 0; f[ g >> 2 ] = f[ l >> 2 ]; f[ g + 4 >> 2 ] = h; f[ g + 8 >> 2 ] = 2; j = ik( Aa( 146, g | 0 ) | 0 ) | 0; a:do if ( ( b | 0 ) != ( j | 0 ) ) {

				g = 2; m = b; n = h; o = j; while ( 1 ) {

					if ( ( o | 0 ) < 0 ) break; m = m - o | 0; p = f[ n + 4 >> 2 ] | 0; q = o >>> 0 > p >>> 0; r = q ? n + 8 | 0 : n; s = g + ( q << 31 >> 31 ) | 0; t = o - ( q ? p : 0 ) | 0; f[ r >> 2 ] = ( f[ r >> 2 ] | 0 ) + t; p = r + 4 | 0; f[ p >> 2 ] = ( f[ p >> 2 ] | 0 ) - t; f[ e >> 2 ] = f[ l >> 2 ]; f[ e + 4 >> 2 ] = r; f[ e + 8 >> 2 ] = s; o = ik( Aa( 146, e | 0 ) | 0 ) | 0; if ( ( m | 0 ) == ( o | 0 ) ) {

						v = 3; break a;

					} else {

						g = s; n = r;

					}

				}f[ a + 16 >> 2 ] = 0; f[ i >> 2 ] = 0; f[ k >> 2 ] = 0; f[ a >> 2 ] = f[ a >> 2 ] | 32; if ( ( g | 0 ) == 2 )w = 0; else w = c - ( f[ n + 4 >> 2 ] | 0 ) | 0;

			} else v = 3; while ( 0 );if ( ( v | 0 ) == 3 ) {

				v = f[ a + 44 >> 2 ] | 0; f[ a + 16 >> 2 ] = v + ( f[ a + 48 >> 2 ] | 0 ); a = v; f[ i >> 2 ] = a; f[ k >> 2 ] = a; w = c;

			}u = d; return w | 0;

		} function Td( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; f[ a >> 2 ] = 2696; b = f[ a + 68 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 72 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 56 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 60 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 44 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 48 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 32 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 36 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 20 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 24 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}Qe( a + 8 | 0 ); b = a + 4 | 0; a = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( ! a ) return; b = a + 40 | 0; d = f[ b >> 2 ] | 0; if ( d | 0 ) {

				c = a + 44 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) == ( d | 0 ) )g = d; else {

					h = e; do {

						e = h + - 4 | 0; f[ c >> 2 ] = e; i = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( i | 0 ) {

							Cf( i ); dn( i );

						}h = f[ c >> 2 ] | 0;

					} while ( ( h | 0 ) != ( d | 0 ) );g = f[ b >> 2 ] | 0;

				}dn( g );

			}Cf( a ); dn( a ); return;

		} function Ud( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; c = a + 12 | 0; d = f[ a >> 2 ] | 0; e = a + 8 | 0; g = f[ e >> 2 ] | 0; h = ( g | 0 ) == - 1; if ( ! ( b[ c >> 0 ] | 0 ) ) {

				do if ( ( ( ! h ? ( i = ( ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + g | 0, ( i | 0 ) != - 1 ) : 0 ) ? ( f[ ( f[ d >> 2 ] | 0 ) + ( i >>> 5 << 2 ) >> 2 ] & 1 << ( i & 31 ) | 0 ) == 0 : 0 ) ? ( j = f[ ( f[ ( f[ d + 64 >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0, ( j | 0 ) != - 1 ) : 0 ) if ( ! ( ( j >>> 0 ) % 3 | 0 ) ) {

					k = j + 2 | 0; break;

				} else {

					k = j + - 1 | 0; break;

				} else k = - 1; while ( 0 );f[ e >> 2 ] = k; return;

			}k = g + 1 | 0; if ( ( ( ! h ? ( h = ( ( k >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : k, ( h | 0 ) != - 1 ) : 0 ) ? ( f[ ( f[ d >> 2 ] | 0 ) + ( h >>> 5 << 2 ) >> 2 ] & 1 << ( h & 31 ) | 0 ) == 0 : 0 ) ? ( k = f[ ( f[ ( f[ d + 64 >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0, h = k + 1 | 0, ( k | 0 ) != - 1 ) : 0 ) {

				g = ( ( h >>> 0 ) % 3 | 0 | 0 ) == 0 ? k + - 2 | 0 : h; f[ e >> 2 ] = g; if ( ( g | 0 ) != - 1 ) {

					if ( ( g | 0 ) != ( f[ a + 4 >> 2 ] | 0 ) ) return; f[ e >> 2 ] = - 1; return;

				}

			} else f[ e >> 2 ] = - 1; g = f[ a + 4 >> 2 ] | 0; do if ( ( ( ( g | 0 ) != - 1 ? ( a = ( ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + g | 0, ( a | 0 ) != - 1 ) : 0 ) ? ( f[ ( f[ d >> 2 ] | 0 ) + ( a >>> 5 << 2 ) >> 2 ] & 1 << ( a & 31 ) | 0 ) == 0 : 0 ) ? ( h = f[ ( f[ ( f[ d + 64 >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( a << 2 ) >> 2 ] | 0, ( h | 0 ) != - 1 ) : 0 ) if ( ! ( ( h >>> 0 ) % 3 | 0 ) ) {

				l = h + 2 | 0; break;

			} else {

				l = h + - 1 | 0; break;

			} else l = - 1; while ( 0 );f[ e >> 2 ] = l; b[ c >> 0 ] = 0; return;

		} function Vd( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; d = a + 4 | 0; a = f[ d >> 2 ] | 0; do if ( a | 0 ) {

				e = b[ c + 11 >> 0 ] | 0; g = e << 24 >> 24 < 0; h = g ? f[ c + 4 >> 2 ] | 0 : e & 255; e = g ? f[ c >> 2 ] | 0 : c; g = d; i = a; a:while ( 1 ) {

					j = i; while ( 1 ) {

						k = j + 16 | 0; l = b[ k + 11 >> 0 ] | 0; m = l << 24 >> 24 < 0; n = m ? f[ j + 20 >> 2 ] | 0 : l & 255; l = h >>> 0 < n >>> 0 ? h : n; if ( ( l | 0 ) != 0 ? ( o = jh( m ? f[ k >> 2 ] | 0 : k, e, l ) | 0, ( o | 0 ) != 0 ) : 0 ) {

							if ( ( o | 0 ) >= 0 ) break;

						} else p = 6; if ( ( p | 0 ) == 6 ? ( p = 0, n >>> 0 >= h >>> 0 ) : 0 ) break; n = f[ j + 4 >> 2 ] | 0; if ( ! n ) {

							q = g; break a;

						} else j = n;

					}i = f[ j >> 2 ] | 0; if ( ! i ) {

						q = j; break;

					} else g = j;

				} if ( ( q | 0 ) != ( d | 0 ) ) {

					g = q + 16 | 0; i = b[ g + 11 >> 0 ] | 0; n = i << 24 >> 24 < 0; o = n ? f[ q + 20 >> 2 ] | 0 : i & 255; i = o >>> 0 < h >>> 0 ? o : h; if ( i | 0 ? ( l = jh( e, n ? f[ g >> 2 ] | 0 : g, i ) | 0, l | 0 ) : 0 ) {

						if ( ( l | 0 ) < 0 ) break; else r = q; return r | 0;

					} if ( h >>> 0 >= o >>> 0 ) {

						r = q; return r | 0;

					}

				}

			} while ( 0 );r = d; return r | 0;

		} function Wd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0; c = a + 8 | 0; f[ c >> 2 ] = f[ b >> 2 ]; wd( a + 12 | 0, b + 4 | 0 ) | 0; d = a + 44 | 0; e = b + 36 | 0; f[ d >> 2 ] = f[ e >> 2 ]; f[ d + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ d + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ d + 12 >> 2 ] = f[ e + 12 >> 2 ]; if ( ( c | 0 ) == ( b | 0 ) ) {

				f[ a + 96 >> 2 ] = f[ b + 88 >> 2 ]; return;

			} else {

				zd( a + 60 | 0, f[ b + 52 >> 2 ] | 0, f[ b + 56 >> 2 ] | 0 ); zd( a + 72 | 0, f[ b + 64 >> 2 ] | 0, f[ b + 68 >> 2 ] | 0 ); zd( a + 84 | 0, f[ b + 76 >> 2 ] | 0, f[ b + 80 >> 2 ] | 0 ); f[ a + 96 >> 2 ] = f[ b + 88 >> 2 ]; Md( a + 100 | 0, f[ b + 92 >> 2 ] | 0, f[ b + 96 >> 2 ] | 0 ); return;

			}

		} function Xd( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; e = u; u = u + 32 | 0; g = e + 8 | 0; i = e; if ( ( d | 0 ) != 3 ) {

				f[ a >> 2 ] = 0; u = e; return;

			}d = f[ b + 12 >> 2 ] | 0; j = f[ b + 4 >> 2 ] | 0; f[ g >> 2 ] = - 1; f[ g + 4 >> 2 ] = - 1; f[ g + 8 >> 2 ] = - 1; f[ g + 12 >> 2 ] = - 1; a:do if ( ( c | 0 ) == - 2 ) {

				k = 0; l = 8;

			} else {

				b = f[ ( f[ ( f[ j + 4 >> 2 ] | 0 ) + 8 >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] | 0; do if ( ( Na[ f[ ( f[ j >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( j ) | 0 ) == 1 ) {

					Oc( i, j, c, d, g, ( ( h[ j + 36 >> 0 ] | 0 ) << 8 | ( h[ j + 37 >> 0 ] | 0 ) ) & 65535 ); m = f[ i >> 2 ] | 0; if ( ! m ) {

						f[ i >> 2 ] = 0; break;

					} else {

						n = i; o = m; break a;

					}

				} while ( 0 );m = bj( 24 ) | 0; f[ m + 4 >> 2 ] = b; p = m + 8 | 0; f[ p >> 2 ] = f[ g >> 2 ]; f[ p + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ p + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ p + 12 >> 2 ] = f[ g + 12 >> 2 ]; f[ m >> 2 ] = 1884; k = m; l = 8;

			} while ( 0 );if ( ( l | 0 ) == 8 ) {

				f[ i >> 2 ] = k; n = i; o = k;

			}f[ a >> 2 ] = o; f[ n >> 2 ] = 0; u = e; return;

		} function Yd( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 8 | 0; e = f[ d >> 2 ] | 0; g = a + 4 | 0; h = f[ g >> 2 ] | 0; if ( ( ( e - h | 0 ) / 12 | 0 ) >>> 0 >= b >>> 0 ) {

				i = b; j = h; do {

					f[ j >> 2 ] = f[ c >> 2 ]; f[ j + 4 >> 2 ] = f[ c + 4 >> 2 ]; f[ j + 8 >> 2 ] = f[ c + 8 >> 2 ]; j = ( f[ g >> 2 ] | 0 ) + 12 | 0; f[ g >> 2 ] = j; i = i + - 1 | 0;

				} while ( ( i | 0 ) != 0 );return;

			}i = f[ a >> 2 ] | 0; j = ( h - i | 0 ) / 12 | 0; h = j + b | 0; if ( h >>> 0 > 357913941 )um( a ); k = ( e - i | 0 ) / 12 | 0; i = k << 1; e = k >>> 0 < 178956970 ? ( i >>> 0 < h >>> 0 ? h : i ) : 357913941; do if ( e ) if ( e >>> 0 > 357913941 ) {

				i = ra( 8 ) | 0; Yk( i, 9789 ); f[ i >> 2 ] = 3704; va( i | 0, 856, 80 );

			} else {

				l = bj( e * 12 | 0 ) | 0; break;

			} else l = 0; while ( 0 );i = l + ( j * 12 | 0 ) | 0; j = l + ( e * 12 | 0 ) | 0; e = b; b = i; l = i; do {

				f[ b >> 2 ] = f[ c >> 2 ]; f[ b + 4 >> 2 ] = f[ c + 4 >> 2 ]; f[ b + 8 >> 2 ] = f[ c + 8 >> 2 ]; b = l + 12 | 0; l = b; e = e + - 1 | 0;

			} while ( ( e | 0 ) != 0 );e = f[ a >> 2 ] | 0; b = ( f[ g >> 2 ] | 0 ) - e | 0; c = i + ( ( ( b | 0 ) / - 12 | 0 ) * 12 | 0 ) | 0; if ( ( b | 0 ) > 0 )ge( c | 0, e | 0, b | 0 ) | 0; f[ a >> 2 ] = c; f[ g >> 2 ] = l; f[ d >> 2 ] = j; if ( ! e ) return; dn( e ); return;

		} function Zd( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; c = a + 4 | 0; d = f[ a >> 2 ] | 0; e = ( f[ c >> 2 ] | 0 ) - d >> 2; g = e + 1 | 0; if ( g >>> 0 > 1073741823 )um( a ); h = a + 8 | 0; i = ( f[ h >> 2 ] | 0 ) - d | 0; d = i >> 1; j = i >> 2 >>> 0 < 536870911 ? ( d >>> 0 < g >>> 0 ? g : d ) : 1073741823; do if ( j ) if ( j >>> 0 > 1073741823 ) {

				d = ra( 8 ) | 0; Yk( d, 9789 ); f[ d >> 2 ] = 3704; va( d | 0, 856, 80 );

			} else {

				k = bj( j << 2 ) | 0; break;

			} else k = 0; while ( 0 );d = k + ( e << 2 ) | 0; e = d; g = k + ( j << 2 ) | 0; j = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; f[ d >> 2 ] = j; j = d + 4 | 0; b = f[ a >> 2 ] | 0; k = f[ c >> 2 ] | 0; if ( ( k | 0 ) == ( b | 0 ) ) {

				l = e; m = b; n = b;

			} else {

				i = k; k = e; e = d; do {

					i = i + - 4 | 0; d = f[ i >> 2 ] | 0; f[ i >> 2 ] = 0; f[ e + - 4 >> 2 ] = d; e = k + - 4 | 0; k = e;

				} while ( ( i | 0 ) != ( b | 0 ) );l = k; m = f[ a >> 2 ] | 0; n = f[ c >> 2 ] | 0;

			}f[ a >> 2 ] = l; f[ c >> 2 ] = j; f[ h >> 2 ] = g; g = m; if ( ( n | 0 ) != ( g | 0 ) ) {

				h = n; do {

					h = h + - 4 | 0; n = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( n | 0 ) {

						Cf( n ); dn( n );

					}

				} while ( ( h | 0 ) != ( g | 0 ) );

			} if ( ! m ) return; dn( m ); return;

		} function _d( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0; e = u; u = u + 80 | 0; g = e; h = e + 64 | 0; Qh( g ); i = f[ ( f[ a + 8 >> 2 ] | 0 ) + 56 >> 2 ] | 0; j = X( ai( 5 ) | 0, d ) | 0; jg( g, i, 0, d & 255, 5, 0, j, ( ( j | 0 ) < 0 ) << 31 >> 31, 0, 0 ); j = bj( 96 ) | 0; Eh( j, g ); b[ j + 84 >> 0 ] = 1; g = f[ j + 68 >> 2 ] | 0; d = j + 72 | 0; i = f[ d >> 2 ] | 0; if ( ( i | 0 ) != ( g | 0 ) )f[ d >> 2 ] = i + ( ~ ( ( i + - 4 - g | 0 ) >>> 2 ) << 2 ); $f( j, c ) | 0; f[ h >> 2 ] = j; If( a, h ); a = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( ! a ) {

				u = e; return;

			}h = a + 88 | 0; j = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( j | 0 ) {

				h = f[ j + 8 >> 2 ] | 0; if ( h | 0 ) {

					c = j + 12 | 0; if ( ( f[ c >> 2 ] | 0 ) != ( h | 0 ) )f[ c >> 2 ] = h; dn( h );

				}dn( j );

			}j = f[ a + 68 >> 2 ] | 0; if ( j | 0 ) {

				h = a + 72 | 0; c = f[ h >> 2 ] | 0; if ( ( c | 0 ) != ( j | 0 ) )f[ h >> 2 ] = c + ( ~ ( ( c + - 4 - j | 0 ) >>> 2 ) << 2 ); dn( j );

			}j = a + 64 | 0; c = f[ j >> 2 ] | 0; f[ j >> 2 ] = 0; if ( c | 0 ) {

				j = f[ c >> 2 ] | 0; if ( j | 0 ) {

					h = c + 4 | 0; if ( ( f[ h >> 2 ] | 0 ) != ( j | 0 ) )f[ h >> 2 ] = j; dn( j );

				}dn( c );

			}dn( a ); u = e; return;

		} function $d( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; d = f[ c >> 2 ] | 0; c = f[ a >> 2 ] | 0; e = c + ( d >>> 5 << 2 ) | 0; f[ e >> 2 ] = f[ e >> 2 ] | 1 << ( d & 31 ); e = f[ a + 64 >> 2 ] | 0; g = ( d | 0 ) == - 1; h = d + 1 | 0; if ( ! g ? ( i = ( ( h >>> 0 ) % 3 | 0 | 0 ) == 0 ? d + - 2 | 0 : h, ( i | 0 ) != - 1 ) : 0 )j = f[ ( f[ e >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0; else j = - 1; i = a + 12 | 0; h = ( f[ i >> 2 ] | 0 ) + ( j >>> 5 << 2 ) | 0; f[ h >> 2 ] = f[ h >> 2 ] | 1 << ( j & 31 ); if ( g ) {

				j = ( f[ i >> 2 ] | 0 ) + 536870908 | 0; f[ j >> 2 ] = f[ j >> 2 ] | - 2147483648; return;

			}j = ( ( ( d >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + d | 0; if ( ( j | 0 ) == - 1 )k = - 1; else k = f[ ( f[ e >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] | 0; j = ( f[ i >> 2 ] | 0 ) + ( k >>> 5 << 2 ) | 0; f[ j >> 2 ] = f[ j >> 2 ] | 1 << ( k & 31 ); if ( g ) return; g = f[ ( f[ e + 12 >> 2 ] | 0 ) + ( d << 2 ) >> 2 ] | 0; if ( ( g | 0 ) == - 1 ) return; b[ a + 24 >> 0 ] = 0; a = c + ( g >>> 5 << 2 ) | 0; f[ a >> 2 ] = f[ a >> 2 ] | 1 << ( g & 31 ); a = g + 1 | 0; c = ( ( a >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : a; if ( ( c | 0 ) == - 1 )l = - 1; else l = f[ ( f[ e >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] | 0; c = ( f[ i >> 2 ] | 0 ) + ( l >>> 5 << 2 ) | 0; f[ c >> 2 ] = f[ c >> 2 ] | 1 << ( l & 31 ); l = ( ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + g | 0; if ( ( l | 0 ) == - 1 )m = - 1; else m = f[ ( f[ e >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] | 0; l = ( f[ i >> 2 ] | 0 ) + ( m >>> 5 << 2 ) | 0; f[ l >> 2 ] = f[ l >> 2 ] | 1 << ( m & 31 ); return;

		} function ae( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; b = u; u = u + 16 | 0; c = b + 4 | 0; d = b; e = a + 8 | 0; g = f[ e >> 2 ] | 0; Eg( f[ a + 4 >> 2 ] | 0, ( f[ g + 28 >> 2 ] | 0 ) - ( f[ g + 24 >> 2 ] | 0 ) >> 2 ); g = a + 84 | 0; a = f[ g >> 2 ] | 0; if ( ! a ) {

				h = f[ e >> 2 ] | 0; i = ( f[ h + 4 >> 2 ] | 0 ) - ( f[ h >> 2 ] | 0 ) >> 2; h = ( i >>> 0 ) / 3 | 0; if ( i >>> 0 <= 2 ) {

					u = b; return 1;

				}i = 0; do {

					f[ d >> 2 ] = i * 3; f[ c >> 2 ] = f[ d >> 2 ]; wb( e, c ); i = i + 1 | 0;

				} while ( ( i | 0 ) < ( h | 0 ) );u = b; return 1;

			} else {

				h = f[ a >> 2 ] | 0; if ( ( f[ a + 4 >> 2 ] | 0 ) == ( h | 0 ) ) {

					u = b; return 1;

				}a = 0; i = h; do {

					f[ d >> 2 ] = f[ i + ( a << 2 ) >> 2 ]; f[ c >> 2 ] = f[ d >> 2 ]; wb( e, c ); a = a + 1 | 0; h = f[ g >> 2 ] | 0; i = f[ h >> 2 ] | 0;

				} while ( a >>> 0 < ( f[ h + 4 >> 2 ] | 0 ) - i >> 2 >>> 0 );u = b; return 1;

			} return 0;

		} function be( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0; g = u; u = u + 32 | 0; h = g + 16 | 0; i = g + 8 | 0; j = g; k = e >>> 0 > 1073741823 ? - 1 : e << 2; l = an( k ) | 0; Vf( l | 0, 0, k | 0 ) | 0; k = a + 8 | 0; a = f[ l + 4 >> 2 ] | 0; m = f[ b >> 2 ] | 0; n = f[ b + 4 >> 2 ] | 0; f[ i >> 2 ] = f[ l >> 2 ]; f[ i + 4 >> 2 ] = a; f[ j >> 2 ] = m; f[ j + 4 >> 2 ] = n; ec( h, k, i, j ); f[ c >> 2 ] = f[ h >> 2 ]; f[ c + 4 >> 2 ] = f[ h + 4 >> 2 ]; if ( ( e | 0 ) >= ( d | 0 ) ) {

				bn( l ); u = g; return 1;

			}n = 0 - e | 0; m = i + 4 | 0; a = j + 4 | 0; o = h + 4 | 0; p = e; do {

				q = c + ( p << 2 ) | 0; r = q + ( n << 2 ) | 0; s = b + ( p << 2 ) | 0; t = f[ r + 4 >> 2 ] | 0; v = f[ s >> 2 ] | 0; w = f[ s + 4 >> 2 ] | 0; f[ i >> 2 ] = f[ r >> 2 ]; f[ m >> 2 ] = t; f[ j >> 2 ] = v; f[ a >> 2 ] = w; ec( h, k, i, j ); f[ q >> 2 ] = f[ h >> 2 ]; f[ q + 4 >> 2 ] = f[ o >> 2 ]; p = p + e | 0;

			} while ( ( p | 0 ) < ( d | 0 ) );bn( l ); u = g; return 1;

		} function ce( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0; d = u; u = u + 16 | 0; e = d; g = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; f[ e >> 2 ] = g; Qd( a, b, e ); g = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( g | 0 ) {

				e = g + 88 | 0; c = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( c | 0 ) {

					e = f[ c + 8 >> 2 ] | 0; if ( e | 0 ) {

						h = c + 12 | 0; if ( ( f[ h >> 2 ] | 0 ) != ( e | 0 ) )f[ h >> 2 ] = e; dn( e );

					}dn( c );

				}c = f[ g + 68 >> 2 ] | 0; if ( c | 0 ) {

					e = g + 72 | 0; h = f[ e >> 2 ] | 0; if ( ( h | 0 ) != ( c | 0 ) )f[ e >> 2 ] = h + ( ~ ( ( h + - 4 - c | 0 ) >>> 2 ) << 2 ); dn( c );

				}c = g + 64 | 0; h = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( h | 0 ) {

					c = f[ h >> 2 ] | 0; if ( c | 0 ) {

						e = h + 4 | 0; if ( ( f[ e >> 2 ] | 0 ) != ( c | 0 ) )f[ e >> 2 ] = c; dn( c );

					}dn( h );

				}dn( g );

			}g = a + 84 | 0; h = a + 88 | 0; a = f[ h >> 2 ] | 0; c = f[ g >> 2 ] | 0; e = a - c >> 2; if ( ( e | 0 ) > ( b | 0 ) ) {

				u = d; return;

			}i = b + 1 | 0; b = a; if ( i >>> 0 > e >>> 0 ) {

				Ee( g, i - e | 0 ); u = d; return;

			} if ( i >>> 0 >= e >>> 0 ) {

				u = d; return;

			}e = c + ( i << 2 ) | 0; if ( ( e | 0 ) == ( b | 0 ) ) {

				u = d; return;

			}f[ h >> 2 ] = b + ( ~ ( ( b + - 4 - e | 0 ) >>> 2 ) << 2 ); u = d; return;

		} function de( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; c = b + 8 | 0; d = f[ c >> 2 ] | 0; e = f[ c + 4 >> 2 ] | 0; c = b + 16 | 0; g = c; i = f[ g >> 2 ] | 0; j = f[ g + 4 >> 2 ] | 0; g = Rj( i | 0, j | 0, 4, 0 ) | 0; k = I; if ( ( e | 0 ) < ( k | 0 ) | ( e | 0 ) == ( k | 0 ) & d >>> 0 < g >>> 0 ) {

				l = 0; return l | 0;

			}m = f[ b >> 2 ] | 0; n = m + i | 0; o = h[ n >> 0 ] | h[ n + 1 >> 0 ] << 8 | h[ n + 2 >> 0 ] << 16 | h[ n + 3 >> 0 ] << 24; n = c; f[ n >> 2 ] = g; f[ n + 4 >> 2 ] = k; k = Rj( i | 0, j | 0, 8, 0 ) | 0; j = I; if ( ( e | 0 ) < ( j | 0 ) | ( e | 0 ) == ( j | 0 ) & d >>> 0 < k >>> 0 ) {

				l = 0; return l | 0;

			}d = m + g | 0; g = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24; d = c; f[ d >> 2 ] = k; f[ d + 4 >> 2 ] = j; if ( ( o | 0 ) > ( g | 0 ) ) {

				l = 0; return l | 0;

			}f[ a + 12 >> 2 ] = o; f[ a + 16 >> 2 ] = g; j = Tj( g | 0, ( ( g | 0 ) < 0 ) << 31 >> 31 | 0, o | 0, ( ( o | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; o = I; if ( ! ( o >>> 0 < 0 | ( o | 0 ) == 0 & j >>> 0 < 2147483647 ) ) {

				l = 0; return l | 0;

			}o = j + 1 | 0; f[ a + 20 >> 2 ] = o; j = ( o | 0 ) / 2 | 0; g = a + 24 | 0; f[ g >> 2 ] = j; f[ a + 28 >> 2 ] = 0 - j; if ( ! ( o & 1 ) )f[ g >> 2 ] = j + - 1; l = td( a + 108 | 0, b ) | 0; return l | 0;

		} function ee( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; d = u; u = u + 16 | 0; e = d + 8 | 0; g = d + 4 | 0; h = d; if ( ! c ) {

				i = 0; u = d; return i | 0;

			}f[ a >> 2 ] = b; f[ e >> 2 ] = 0; dg( e, b ) | 0; a:do if ( ! ( f[ e >> 2 ] | 0 ) )j = 8; else {

				b = 0; while ( 1 ) {

					dg( g, f[ a >> 2 ] | 0 ) | 0; k = bj( 44 ) | 0; f[ k >> 2 ] = 0; f[ k + 4 >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; f[ k + 12 >> 2 ] = 0; n[ k + 16 >> 2 ] = $( 1.0 ); l = k + 20 | 0; f[ l >> 2 ] = 0; f[ l + 4 >> 2 ] = 0; f[ l + 8 >> 2 ] = 0; f[ l + 12 >> 2 ] = 0; n[ k + 36 >> 2 ] = $( 1.0 ); f[ k + 40 >> 2 ] = f[ g >> 2 ]; if ( ! ( lc( a, k ) | 0 ) ) break; f[ h >> 2 ] = k; Hg( c, h ) | 0; l = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( l | 0 ) {

						Cf( l ); dn( l );

					}b = b + 1 | 0; if ( b >>> 0 >= ( f[ e >> 2 ] | 0 ) >>> 0 ) {

						j = 8; break a;

					}

				}Cf( k ); dn( k ); m = 0;

			} while ( 0 );if ( ( j | 0 ) == 8 )m = lc( a, c ) | 0; i = m; u = d; return i | 0;

		} function fe( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0; if ( c >>> 0 > 4294967279 )um( a ); d = a + 11 | 0; e = b[ d >> 0 ] | 0; g = e << 24 >> 24 < 0; if ( g ) {

				h = f[ a + 4 >> 2 ] | 0; i = ( f[ a + 8 >> 2 ] & 2147483647 ) + - 1 | 0;

			} else {

				h = e & 255; i = 10;

			}j = h >>> 0 > c >>> 0 ? h : c; c = j >>> 0 < 11; k = c ? 10 : ( j + 16 & - 16 ) + - 1 | 0; do if ( ( k | 0 ) != ( i | 0 ) ) {

				do if ( c ) {

					j = f[ a >> 2 ] | 0; if ( g ) {

						l = 0; m = j; n = a; o = 13;

					} else {

						Ok( a, j, ( e & 255 ) + 1 | 0 ) | 0; dn( j ); o = 16;

					}

				} else {

					j = k + 1 | 0; p = bj( j ) | 0; if ( g ) {

						l = 1; m = f[ a >> 2 ] | 0; n = p; o = 13; break;

					} else {

						Ok( p, a, ( e & 255 ) + 1 | 0 ) | 0; q = p; r = j; s = a + 4 | 0; o = 15; break;

					}

				} while ( 0 );if ( ( o | 0 ) == 13 ) {

					j = a + 4 | 0; Ok( n, m, ( f[ j >> 2 ] | 0 ) + 1 | 0 ) | 0; dn( m ); if ( l ) {

						q = n; r = k + 1 | 0; s = j; o = 15;

					} else o = 16;

				} if ( ( o | 0 ) == 15 ) {

					f[ a + 8 >> 2 ] = r | - 2147483648; f[ s >> 2 ] = h; f[ a >> 2 ] = q; break;

				} else if ( ( o | 0 ) == 16 ) {

					b[ d >> 0 ] = h; break;

				}

			} while ( 0 );return;

		} function ge( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0; if ( ( d | 0 ) >= 8192 ) return Da( a | 0, c | 0, d | 0 ) | 0; e = a | 0; g = a + d | 0; if ( ( a & 3 ) == ( c & 3 ) ) {

				while ( a & 3 ) {

					if ( ! d ) return e | 0; b[ a >> 0 ] = b[ c >> 0 ] | 0; a = a + 1 | 0; c = c + 1 | 0; d = d - 1 | 0;

				}h = g & - 4 | 0; d = h - 64 | 0; while ( ( a | 0 ) <= ( d | 0 ) ) {

					f[ a >> 2 ] = f[ c >> 2 ]; f[ a + 4 >> 2 ] = f[ c + 4 >> 2 ]; f[ a + 8 >> 2 ] = f[ c + 8 >> 2 ]; f[ a + 12 >> 2 ] = f[ c + 12 >> 2 ]; f[ a + 16 >> 2 ] = f[ c + 16 >> 2 ]; f[ a + 20 >> 2 ] = f[ c + 20 >> 2 ]; f[ a + 24 >> 2 ] = f[ c + 24 >> 2 ]; f[ a + 28 >> 2 ] = f[ c + 28 >> 2 ]; f[ a + 32 >> 2 ] = f[ c + 32 >> 2 ]; f[ a + 36 >> 2 ] = f[ c + 36 >> 2 ]; f[ a + 40 >> 2 ] = f[ c + 40 >> 2 ]; f[ a + 44 >> 2 ] = f[ c + 44 >> 2 ]; f[ a + 48 >> 2 ] = f[ c + 48 >> 2 ]; f[ a + 52 >> 2 ] = f[ c + 52 >> 2 ]; f[ a + 56 >> 2 ] = f[ c + 56 >> 2 ]; f[ a + 60 >> 2 ] = f[ c + 60 >> 2 ]; a = a + 64 | 0; c = c + 64 | 0;

				} while ( ( a | 0 ) < ( h | 0 ) ) {

					f[ a >> 2 ] = f[ c >> 2 ]; a = a + 4 | 0; c = c + 4 | 0;

				}

			} else {

				h = g - 4 | 0; while ( ( a | 0 ) < ( h | 0 ) ) {

					b[ a >> 0 ] = b[ c >> 0 ] | 0; b[ a + 1 >> 0 ] = b[ c + 1 >> 0 ] | 0; b[ a + 2 >> 0 ] = b[ c + 2 >> 0 ] | 0; b[ a + 3 >> 0 ] = b[ c + 3 >> 0 ] | 0; a = a + 4 | 0; c = c + 4 | 0;

				}

			} while ( ( a | 0 ) < ( g | 0 ) ) {

				b[ a >> 0 ] = b[ c >> 0 ] | 0; a = a + 1 | 0; c = c + 1 | 0;

			} return e | 0;

		} function he( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0; d = f[ c + 88 >> 2 ] | 0; if ( ! d ) {

				e = 0; return e | 0;

			} if ( ( f[ d >> 2 ] | 0 ) != 1 ) {

				e = 0; return e | 0;

			}g = d + 8 | 0; d = f[ g >> 2 ] | 0; f[ a + 4 >> 2 ] = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24; i = a + 8 | 0; j = c + 24 | 0; c = b[ j >> 0 ] | 0; k = c << 24 >> 24; l = a + 12 | 0; m = f[ l >> 2 ] | 0; n = f[ i >> 2 ] | 0; o = m - n >> 2; p = n; n = m; if ( o >>> 0 >= k >>> 0 ) if ( o >>> 0 > k >>> 0 ? ( m = p + ( k << 2 ) | 0, ( m | 0 ) != ( n | 0 ) ) : 0 ) {

				f[ l >> 2 ] = n + ( ~ ( ( n + - 4 - m | 0 ) >>> 2 ) << 2 ); q = c; r = d;

			} else {

				q = c; r = d;

			} else {

				ff( i, k - o | 0 ); q = b[ j >> 0 ] | 0; r = f[ g >> 2 ] | 0;

			}g = r + 4 | 0; j = h[ g >> 0 ] | h[ g + 1 >> 0 ] << 8 | h[ g + 2 >> 0 ] << 16 | h[ g + 3 >> 0 ] << 24; if ( q << 24 >> 24 > 0 ) {

				g = f[ i >> 2 ] | 0; i = q << 24 >> 24; q = j; o = 4; k = 0; while ( 1 ) {

					f[ g + ( k << 2 ) >> 2 ] = q; o = o + 4 | 0; k = k + 1 | 0; d = r + o | 0; c = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24; if ( ( k | 0 ) >= ( i | 0 ) ) {

						s = c; break;

					} else q = c;

				}

			} else s = j; f[ a + 20 >> 2 ] = s; e = 1; return e | 0;

		} function ie( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; do if ( ! ( zl( a, f[ c + 8 >> 2 ] | 0, g ) | 0 ) ) {

				if ( ! ( zl( a, f[ c >> 2 ] | 0, g ) | 0 ) ) {

					h = f[ a + 8 >> 2 ] | 0; Wa[ f[ ( f[ h >> 2 ] | 0 ) + 24 >> 2 ] & 3 ]( h, c, d, e, g ); break;

				} if ( ( f[ c + 16 >> 2 ] | 0 ) != ( d | 0 ) ? ( h = c + 20 | 0, ( f[ h >> 2 ] | 0 ) != ( d | 0 ) ) : 0 ) {

					f[ c + 32 >> 2 ] = e; i = c + 44 | 0; if ( ( f[ i >> 2 ] | 0 ) == 4 ) break; j = c + 52 | 0; b[ j >> 0 ] = 0; k = c + 53 | 0; b[ k >> 0 ] = 0; l = f[ a + 8 >> 2 ] | 0; Xa[ f[ ( f[ l >> 2 ] | 0 ) + 20 >> 2 ] & 3 ]( l, c, d, d, 1, g ); if ( b[ k >> 0 ] | 0 ) if ( ! ( b[ j >> 0 ] | 0 ) ) {

						m = 3; n = 11;

					} else o = 3; else {

						m = 4; n = 11;

					} if ( ( n | 0 ) == 11 ) {

						f[ h >> 2 ] = d; h = c + 40 | 0; f[ h >> 2 ] = ( f[ h >> 2 ] | 0 ) + 1; if ( ( f[ c + 36 >> 2 ] | 0 ) == 1 ? ( f[ c + 24 >> 2 ] | 0 ) == 2 : 0 ) {

							b[ c + 54 >> 0 ] = 1; o = m;

						} else o = m;

					}f[ i >> 2 ] = o; break;

				} if ( ( e | 0 ) == 1 )f[ c + 32 >> 2 ] = 1;

			} else Ui( 0, c, d, e ); while ( 0 );return;

		} function je( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; c = f[ a + 32 >> 2 ] | 0; d = c + 8 | 0; e = f[ d + 4 >> 2 ] | 0; g = c + 16 | 0; h = g; i = f[ h >> 2 ] | 0; j = f[ h + 4 >> 2 ] | 0; if ( ! ( ( e | 0 ) > ( j | 0 ) | ( ( e | 0 ) == ( j | 0 ) ? ( f[ d >> 2 ] | 0 ) >>> 0 > i >>> 0 : 0 ) ) ) {

				k = 0; return k | 0;

			}d = b[ ( f[ c >> 2 ] | 0 ) + i >> 0 ] | 0; c = Rj( i | 0, j | 0, 1, 0 ) | 0; j = g; f[ j >> 2 ] = c; f[ j + 4 >> 2 ] = I; j = a + 48 | 0; c = f[ j >> 2 ] | 0; f[ j >> 2 ] = 0; if ( c | 0 )Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); switch ( d << 24 >> 24 ) {

				case 0: {

					d = bj( 376 ) | 0; Ag( d ); c = f[ j >> 2 ] | 0; f[ j >> 2 ] = d; if ( ! c )l = d; else {

						Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); m = 9;

					} break;

				} case 2: {

					c = bj( 432 ) | 0; yf( c ); d = f[ j >> 2 ] | 0; f[ j >> 2 ] = c; if ( ! d )l = c; else {

						Sa[ f[ ( f[ d >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( d ); m = 9;

					} break;

				} default:m = 9;

			} if ( ( m | 0 ) == 9 ) {

				m = f[ j >> 2 ] | 0; if ( ! m ) {

					k = 0; return k | 0;

				} else l = m;

			}k = Oa[ f[ ( f[ l >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( l, a ) | 0; return k | 0;

		} function ke( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; e = u; u = u + 16 | 0; g = e + 12 | 0; h = e + 8 | 0; i = e; f[ i >> 2 ] = f[ b >> 2 ]; f[ g >> 2 ] = f[ i >> 2 ]; i = dc( a, g, h, e + 4 | 0, c ) | 0; c = f[ i >> 2 ] | 0; if ( c | 0 ) {

				j = c; u = e; return j | 0;

			}c = bj( 40 ) | 0; Rf( c + 16 | 0, d ); Rf( c + 28 | 0, d + 12 | 0 ); d = f[ h >> 2 ] | 0; f[ c >> 2 ] = 0; f[ c + 4 >> 2 ] = 0; f[ c + 8 >> 2 ] = d; f[ i >> 2 ] = c; d = f[ f[ a >> 2 ] >> 2 ] | 0; if ( ! d )k = c; else {

				f[ a >> 2 ] = d; k = f[ i >> 2 ] | 0;

			}Lc( f[ a + 4 >> 2 ] | 0, k ); k = a + 8 | 0; f[ k >> 2 ] = ( f[ k >> 2 ] | 0 ) + 1; j = c; u = e; return j | 0;

		} function le( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; e = u; u = u + 16 | 0; g = e; h = a + 4 | 0; f[ h >> 2 ] = 0; if ( ! c ) {

				u = e; return;

			}i = a + 8 | 0; j = f[ i >> 2 ] | 0; k = j << 5; if ( k >>> 0 < c >>> 0 ) {

				f[ g >> 2 ] = 0; l = g + 4 | 0; f[ l >> 2 ] = 0; m = g + 8 | 0; f[ m >> 2 ] = 0; if ( ( c | 0 ) < 0 )um( a ); n = j << 6; j = c + 31 & - 32; af( g, k >>> 0 < 1073741823 ? ( n >>> 0 < j >>> 0 ? j : n ) : 2147483647 ); n = f[ a >> 2 ] | 0; f[ a >> 2 ] = f[ g >> 2 ]; f[ g >> 2 ] = n; g = f[ h >> 2 ] | 0; f[ h >> 2 ] = c; f[ l >> 2 ] = g; g = f[ i >> 2 ] | 0; f[ i >> 2 ] = f[ m >> 2 ]; f[ m >> 2 ] = g; if ( n | 0 )dn( n ); o = a;

			} else {

				f[ h >> 2 ] = c; o = a;

			}a = f[ o >> 2 ] | 0; o = a; h = a; a = c >>> 5; n = a << 2; if ( ! ( b[ d >> 0 ] | 0 ) ) {

				Vf( h | 0, 0, n | 0 ) | 0; d = c & 31; g = o + ( a << 2 ) | 0; if ( ! d ) {

					u = e; return;

				}f[ g >> 2 ] = f[ g >> 2 ] & ~ ( - 1 >>> ( 32 - d | 0 ) ); u = e; return;

			} else {

				Vf( h | 0, - 1, n | 0 ) | 0; n = c & 31; c = o + ( a << 2 ) | 0; if ( ! n ) {

					u = e; return;

				}f[ c >> 2 ] = f[ c >> 2 ] | - 1 >>> ( 32 - n | 0 ); u = e; return;

			}

		} function me( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; c = b + 8 | 0; d = f[ c >> 2 ] | 0; e = f[ c + 4 >> 2 ] | 0; c = b + 16 | 0; g = c; i = f[ g >> 2 ] | 0; j = f[ g + 4 >> 2 ] | 0; g = Rj( i | 0, j | 0, 4, 0 ) | 0; k = I; if ( ( e | 0 ) < ( k | 0 ) | ( e | 0 ) == ( k | 0 ) & d >>> 0 < g >>> 0 ) {

				l = 0; return l | 0;

			}m = f[ b >> 2 ] | 0; b = m + i | 0; n = h[ b >> 0 ] | h[ b + 1 >> 0 ] << 8 | h[ b + 2 >> 0 ] << 16 | h[ b + 3 >> 0 ] << 24; b = c; f[ b >> 2 ] = g; f[ b + 4 >> 2 ] = k; k = Rj( i | 0, j | 0, 8, 0 ) | 0; j = I; if ( ( e | 0 ) < ( j | 0 ) | ( e | 0 ) == ( j | 0 ) & d >>> 0 < k >>> 0 ) {

				l = 0; return l | 0;

			}d = m + g | 0; g = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24; d = c; f[ d >> 2 ] = k; f[ d + 4 >> 2 ] = j; if ( ( n | 0 ) > ( g | 0 ) ) {

				l = 0; return l | 0;

			}f[ a + 12 >> 2 ] = n; f[ a + 16 >> 2 ] = g; j = Tj( g | 0, ( ( g | 0 ) < 0 ) << 31 >> 31 | 0, n | 0, ( ( n | 0 ) < 0 ) << 31 >> 31 | 0 ) | 0; n = I; if ( ! ( n >>> 0 < 0 | ( n | 0 ) == 0 & j >>> 0 < 2147483647 ) ) {

				l = 0; return l | 0;

			}n = j + 1 | 0; f[ a + 20 >> 2 ] = n; j = ( n | 0 ) / 2 | 0; g = a + 24 | 0; f[ g >> 2 ] = j; f[ a + 28 >> 2 ] = 0 - j; if ( n & 1 | 0 ) {

				l = 1; return l | 0;

			}f[ g >> 2 ] = j + - 1; l = 1; return l | 0;

		} function ne( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; e = a + 12 | 0; a:do if ( ( f[ e >> 2 ] | 0 ) != ( c | 0 ) ) {

				g = f[ a >> 2 ] | 0; h = a + 4 | 0; i = f[ h >> 2 ] | 0; if ( ( i | 0 ) != ( g | 0 ) ) {

					j = i; while ( 1 ) {

						i = j + - 12 | 0; f[ h >> 2 ] = i; if ( ( b[ i + 11 >> 0 ] | 0 ) < 0 ) {

							dn( f[ i >> 2 ] | 0 ); k = f[ h >> 2 ] | 0;

						} else k = i; if ( ( k | 0 ) == ( g | 0 ) ) break; else j = k;

					}

				}f[ e >> 2 ] = c; j = f[ c + 8 >> 2 ] | 0; if ( j | 0 ) {

					i = a + 8 | 0; l = j; j = g; while ( 1 ) {

						m = l + 8 | 0; if ( ( j | 0 ) == ( f[ i >> 2 ] | 0 ) )Ld( a, m ); else {

							Rf( j, m ); f[ h >> 2 ] = ( f[ h >> 2 ] | 0 ) + 12;

						}m = f[ l >> 2 ] | 0; if ( ! m ) break a; l = m; j = f[ h >> 2 ] | 0;

					}

				}

			} while ( 0 );if ( ( d | 0 ) < 0 ) {

				n = 0; return n | 0;

			}c = f[ a >> 2 ] | 0; if ( ( ( ( f[ a + 4 >> 2 ] | 0 ) - c | 0 ) / 12 | 0 ) >>> 0 <= d >>> 0 ) {

				n = 0; return n | 0;

			}a = c + ( d * 12 | 0 ) | 0; if ( ( b[ a + 11 >> 0 ] | 0 ) < 0 ) {

				n = f[ a >> 2 ] | 0; return n | 0;

			} else {

				n = a; return n | 0;

			} return 0;

		} function oe( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; c = u; u = u + 16 | 0; d = c; e = f[ ( f[ a >> 2 ] | 0 ) + 8 >> 2 ] | 0; g = a + 8 | 0; h = a + 12 | 0; i = ( f[ h >> 2 ] | 0 ) - ( f[ g >> 2 ] | 0 ) >> 2; j = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; f[ d >> 2 ] = j; Ua[ e & 7 ]( a, i, d ); i = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( ! i ) {

				k = f[ h >> 2 ] | 0; l = f[ g >> 2 ] | 0; m = k - l | 0; n = m >> 2; o = n + - 1 | 0; u = c; return o | 0;

			}d = i + 88 | 0; a = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( a | 0 ) {

				d = f[ a + 8 >> 2 ] | 0; if ( d | 0 ) {

					e = a + 12 | 0; if ( ( f[ e >> 2 ] | 0 ) != ( d | 0 ) )f[ e >> 2 ] = d; dn( d );

				}dn( a );

			}a = f[ i + 68 >> 2 ] | 0; if ( a | 0 ) {

				d = i + 72 | 0; e = f[ d >> 2 ] | 0; if ( ( e | 0 ) != ( a | 0 ) )f[ d >> 2 ] = e + ( ~ ( ( e + - 4 - a | 0 ) >>> 2 ) << 2 ); dn( a );

			}a = i + 64 | 0; e = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( e | 0 ) {

				a = f[ e >> 2 ] | 0; if ( a | 0 ) {

					d = e + 4 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( a | 0 ) )f[ d >> 2 ] = a; dn( a );

				}dn( e );

			}dn( i ); k = f[ h >> 2 ] | 0; l = f[ g >> 2 ] | 0; m = k - l | 0; n = m >> 2; o = n + - 1 | 0; u = c; return o | 0;

		} function pe( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 4 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = e - g >> 2; i = g; g = e; if ( h >>> 0 >= 1048576 ) {

				if ( ( h | 0 ) != 1048576 ? ( e = i + 4194304 | 0, ( e | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 );

			} else ff( a, 1048576 - h | 0 ); h = a + 12 | 0; e = a + 16 | 0; g = f[ e >> 2 ] | 0; d = f[ h >> 2 ] | 0; i = g - d >> 3; j = d; d = g; if ( i >>> 0 >= c >>> 0 ) {

				if ( i >>> 0 > c >>> 0 ? ( g = j + ( c << 3 ) | 0, ( g | 0 ) != ( d | 0 ) ) : 0 )f[ e >> 2 ] = d + ( ~ ( ( d + - 8 - g | 0 ) >>> 3 ) << 3 ); if ( ! c ) {

					k = 0; return k | 0;

				}

			} else qe( h, c - i | 0 ); i = f[ h >> 2 ] | 0; h = 0; g = 0; do {

				d = b + ( h << 2 ) | 0; f[ i + ( h << 3 ) >> 2 ] = f[ d >> 2 ]; f[ i + ( h << 3 ) + 4 >> 2 ] = g; e = g; g = ( f[ d >> 2 ] | 0 ) + g | 0; if ( g >>> 0 > 1048576 ) {

					k = 0; l = 19; break;

				} if ( e >>> 0 < g >>> 0 ) {

					d = f[ a >> 2 ] | 0; j = e; do {

						f[ d + ( j << 2 ) >> 2 ] = h; j = j + 1 | 0;

					} while ( ( j | 0 ) != ( g | 0 ) );

				}h = h + 1 | 0;

			} while ( h >>> 0 < c >>> 0 );if ( ( l | 0 ) == 19 ) return k | 0; k = ( g | 0 ) == 1048576; return k | 0;

		} function qe( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; e = a + 4 | 0; g = f[ e >> 2 ] | 0; if ( d - g >> 3 >>> 0 >= b >>> 0 ) {

				h = b; i = g; do {

					j = i; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; i = ( f[ e >> 2 ] | 0 ) + 8 | 0; f[ e >> 2 ] = i; h = h + - 1 | 0;

				} while ( ( h | 0 ) != 0 );return;

			}h = f[ a >> 2 ] | 0; i = g - h >> 3; g = i + b | 0; if ( g >>> 0 > 536870911 )um( a ); j = d - h | 0; h = j >> 2; d = j >> 3 >>> 0 < 268435455 ? ( h >>> 0 < g >>> 0 ? g : h ) : 536870911; do if ( d ) if ( d >>> 0 > 536870911 ) {

				h = ra( 8 ) | 0; Yk( h, 9789 ); f[ h >> 2 ] = 3704; va( h | 0, 856, 80 );

			} else {

				k = bj( d << 3 ) | 0; break;

			} else k = 0; while ( 0 );h = k + ( i << 3 ) | 0; i = k + ( d << 3 ) | 0; d = b; b = h; k = h; do {

				g = b; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; b = k + 8 | 0; k = b; d = d + - 1 | 0;

			} while ( ( d | 0 ) != 0 );d = f[ a >> 2 ] | 0; b = ( f[ e >> 2 ] | 0 ) - d | 0; g = h + ( 0 - ( b >> 3 ) << 3 ) | 0; if ( ( b | 0 ) > 0 )ge( g | 0, d | 0, b | 0 ) | 0; f[ a >> 2 ] = g; f[ e >> 2 ] = k; f[ c >> 2 ] = i; if ( ! d ) return; dn( d ); return;

		} function re( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 4 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = e - g >> 2; i = g; g = e; if ( h >>> 0 >= 524288 ) {

				if ( ( h | 0 ) != 524288 ? ( e = i + 2097152 | 0, ( e | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 );

			} else ff( a, 524288 - h | 0 ); h = a + 12 | 0; e = a + 16 | 0; g = f[ e >> 2 ] | 0; d = f[ h >> 2 ] | 0; i = g - d >> 3; j = d; d = g; if ( i >>> 0 >= c >>> 0 ) {

				if ( i >>> 0 > c >>> 0 ? ( g = j + ( c << 3 ) | 0, ( g | 0 ) != ( d | 0 ) ) : 0 )f[ e >> 2 ] = d + ( ~ ( ( d + - 8 - g | 0 ) >>> 3 ) << 3 ); if ( ! c ) {

					k = 0; return k | 0;

				}

			} else qe( h, c - i | 0 ); i = f[ h >> 2 ] | 0; h = 0; g = 0; do {

				d = b + ( h << 2 ) | 0; f[ i + ( h << 3 ) >> 2 ] = f[ d >> 2 ]; f[ i + ( h << 3 ) + 4 >> 2 ] = g; e = g; g = ( f[ d >> 2 ] | 0 ) + g | 0; if ( g >>> 0 > 524288 ) {

					k = 0; l = 19; break;

				} if ( e >>> 0 < g >>> 0 ) {

					d = f[ a >> 2 ] | 0; j = e; do {

						f[ d + ( j << 2 ) >> 2 ] = h; j = j + 1 | 0;

					} while ( ( j | 0 ) != ( g | 0 ) );

				}h = h + 1 | 0;

			} while ( h >>> 0 < c >>> 0 );if ( ( l | 0 ) == 19 ) return k | 0; k = ( g | 0 ) == 524288; return k | 0;

		} function se( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 4 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = e - g >> 2; i = g; g = e; if ( h >>> 0 >= 262144 ) {

				if ( ( h | 0 ) != 262144 ? ( e = i + 1048576 | 0, ( e | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 );

			} else ff( a, 262144 - h | 0 ); h = a + 12 | 0; e = a + 16 | 0; g = f[ e >> 2 ] | 0; d = f[ h >> 2 ] | 0; i = g - d >> 3; j = d; d = g; if ( i >>> 0 >= c >>> 0 ) {

				if ( i >>> 0 > c >>> 0 ? ( g = j + ( c << 3 ) | 0, ( g | 0 ) != ( d | 0 ) ) : 0 )f[ e >> 2 ] = d + ( ~ ( ( d + - 8 - g | 0 ) >>> 3 ) << 3 ); if ( ! c ) {

					k = 0; return k | 0;

				}

			} else qe( h, c - i | 0 ); i = f[ h >> 2 ] | 0; h = 0; g = 0; do {

				d = b + ( h << 2 ) | 0; f[ i + ( h << 3 ) >> 2 ] = f[ d >> 2 ]; f[ i + ( h << 3 ) + 4 >> 2 ] = g; e = g; g = ( f[ d >> 2 ] | 0 ) + g | 0; if ( g >>> 0 > 262144 ) {

					k = 0; l = 19; break;

				} if ( e >>> 0 < g >>> 0 ) {

					d = f[ a >> 2 ] | 0; j = e; do {

						f[ d + ( j << 2 ) >> 2 ] = h; j = j + 1 | 0;

					} while ( ( j | 0 ) != ( g | 0 ) );

				}h = h + 1 | 0;

			} while ( h >>> 0 < c >>> 0 );if ( ( l | 0 ) == 19 ) return k | 0; k = ( g | 0 ) == 262144; return k | 0;

		} function te( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; d = u; u = u + 16 | 0; e = d; if ( ! c ) {

				g = 0; u = d; return g | 0;

			}h = a + 84 | 0; i = f[ h >> 2 ] | 0; j = a + 88 | 0; k = f[ j >> 2 ] | 0; if ( ( k | 0 ) != ( i | 0 ) )f[ j >> 2 ] = k + ( ~ ( ( k + - 4 - i | 0 ) >>> 2 ) << 2 ); f[ h >> 2 ] = 0; f[ j >> 2 ] = 0; f[ a + 92 >> 2 ] = 0; if ( i | 0 )dn( i ); i = a + 72 | 0; j = f[ i >> 2 ] | 0; h = a + 76 | 0; if ( ( f[ h >> 2 ] | 0 ) != ( j | 0 ) )f[ h >> 2 ] = j; f[ i >> 2 ] = 0; f[ h >> 2 ] = 0; f[ a + 80 >> 2 ] = 0; if ( j | 0 )dn( j ); j = c + 4 | 0; h = ( f[ j >> 2 ] | 0 ) - ( f[ c >> 2 ] | 0 ) >> 2; b[ e >> 0 ] = 0; le( a, h, e ); h = c + 24 | 0; i = c + 28 | 0; k = ( f[ i >> 2 ] | 0 ) - ( f[ h >> 2 ] | 0 ) >> 2; b[ e >> 0 ] = 0; le( a + 12 | 0, k, e ); sd( a + 28 | 0, ( f[ j >> 2 ] | 0 ) - ( f[ c >> 2 ] | 0 ) >> 2, 2684 ); Eg( a + 52 | 0, ( f[ i >> 2 ] | 0 ) - ( f[ h >> 2 ] | 0 ) >> 2 ); Eg( a + 40 | 0, ( f[ i >> 2 ] | 0 ) - ( f[ h >> 2 ] | 0 ) >> 2 ); f[ a + 64 >> 2 ] = c; b[ a + 24 >> 0 ] = 1; g = 1; u = d; return g | 0;

		} function ue( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 4 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = e - g >> 2; i = g; g = e; if ( h >>> 0 >= 65536 ) {

				if ( ( h | 0 ) != 65536 ? ( e = i + 262144 | 0, ( e | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 );

			} else ff( a, 65536 - h | 0 ); h = a + 12 | 0; e = a + 16 | 0; g = f[ e >> 2 ] | 0; d = f[ h >> 2 ] | 0; i = g - d >> 3; j = d; d = g; if ( i >>> 0 >= c >>> 0 ) {

				if ( i >>> 0 > c >>> 0 ? ( g = j + ( c << 3 ) | 0, ( g | 0 ) != ( d | 0 ) ) : 0 )f[ e >> 2 ] = d + ( ~ ( ( d + - 8 - g | 0 ) >>> 3 ) << 3 ); if ( ! c ) {

					k = 0; return k | 0;

				}

			} else qe( h, c - i | 0 ); i = f[ h >> 2 ] | 0; h = 0; g = 0; do {

				d = b + ( h << 2 ) | 0; f[ i + ( h << 3 ) >> 2 ] = f[ d >> 2 ]; f[ i + ( h << 3 ) + 4 >> 2 ] = g; e = g; g = ( f[ d >> 2 ] | 0 ) + g | 0; if ( g >>> 0 > 65536 ) {

					k = 0; l = 19; break;

				} if ( e >>> 0 < g >>> 0 ) {

					d = f[ a >> 2 ] | 0; j = e; do {

						f[ d + ( j << 2 ) >> 2 ] = h; j = j + 1 | 0;

					} while ( ( j | 0 ) != ( g | 0 ) );

				}h = h + 1 | 0;

			} while ( h >>> 0 < c >>> 0 );if ( ( l | 0 ) == 19 ) return k | 0; k = ( g | 0 ) == 65536; return k | 0;

		} function ve( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 4 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = e - g >> 2; i = g; g = e; if ( h >>> 0 >= 32768 ) {

				if ( ( h | 0 ) != 32768 ? ( e = i + 131072 | 0, ( e | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 );

			} else ff( a, 32768 - h | 0 ); h = a + 12 | 0; e = a + 16 | 0; g = f[ e >> 2 ] | 0; d = f[ h >> 2 ] | 0; i = g - d >> 3; j = d; d = g; if ( i >>> 0 >= c >>> 0 ) {

				if ( i >>> 0 > c >>> 0 ? ( g = j + ( c << 3 ) | 0, ( g | 0 ) != ( d | 0 ) ) : 0 )f[ e >> 2 ] = d + ( ~ ( ( d + - 8 - g | 0 ) >>> 3 ) << 3 ); if ( ! c ) {

					k = 0; return k | 0;

				}

			} else qe( h, c - i | 0 ); i = f[ h >> 2 ] | 0; h = 0; g = 0; do {

				d = b + ( h << 2 ) | 0; f[ i + ( h << 3 ) >> 2 ] = f[ d >> 2 ]; f[ i + ( h << 3 ) + 4 >> 2 ] = g; e = g; g = ( f[ d >> 2 ] | 0 ) + g | 0; if ( g >>> 0 > 32768 ) {

					k = 0; l = 19; break;

				} if ( e >>> 0 < g >>> 0 ) {

					d = f[ a >> 2 ] | 0; j = e; do {

						f[ d + ( j << 2 ) >> 2 ] = h; j = j + 1 | 0;

					} while ( ( j | 0 ) != ( g | 0 ) );

				}h = h + 1 | 0;

			} while ( h >>> 0 < c >>> 0 );if ( ( l | 0 ) == 19 ) return k | 0; k = ( g | 0 ) == 32768; return k | 0;

		} function we( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 4 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = e - g >> 2; i = g; g = e; if ( h >>> 0 >= 8192 ) {

				if ( ( h | 0 ) != 8192 ? ( e = i + 32768 | 0, ( e | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 );

			} else ff( a, 8192 - h | 0 ); h = a + 12 | 0; e = a + 16 | 0; g = f[ e >> 2 ] | 0; d = f[ h >> 2 ] | 0; i = g - d >> 3; j = d; d = g; if ( i >>> 0 >= c >>> 0 ) {

				if ( i >>> 0 > c >>> 0 ? ( g = j + ( c << 3 ) | 0, ( g | 0 ) != ( d | 0 ) ) : 0 )f[ e >> 2 ] = d + ( ~ ( ( d + - 8 - g | 0 ) >>> 3 ) << 3 ); if ( ! c ) {

					k = 0; return k | 0;

				}

			} else qe( h, c - i | 0 ); i = f[ h >> 2 ] | 0; h = 0; g = 0; do {

				d = b + ( h << 2 ) | 0; f[ i + ( h << 3 ) >> 2 ] = f[ d >> 2 ]; f[ i + ( h << 3 ) + 4 >> 2 ] = g; e = g; g = ( f[ d >> 2 ] | 0 ) + g | 0; if ( g >>> 0 > 8192 ) {

					k = 0; l = 19; break;

				} if ( e >>> 0 < g >>> 0 ) {

					d = f[ a >> 2 ] | 0; j = e; do {

						f[ d + ( j << 2 ) >> 2 ] = h; j = j + 1 | 0;

					} while ( ( j | 0 ) != ( g | 0 ) );

				}h = h + 1 | 0;

			} while ( h >>> 0 < c >>> 0 );if ( ( l | 0 ) == 19 ) return k | 0; k = ( g | 0 ) == 8192; return k | 0;

		} function xe( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 4 | 0; e = f[ d >> 2 ] | 0; g = f[ a >> 2 ] | 0; h = e - g >> 2; i = g; g = e; if ( h >>> 0 >= 4096 ) {

				if ( ( h | 0 ) != 4096 ? ( e = i + 16384 | 0, ( e | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 );

			} else ff( a, 4096 - h | 0 ); h = a + 12 | 0; e = a + 16 | 0; g = f[ e >> 2 ] | 0; d = f[ h >> 2 ] | 0; i = g - d >> 3; j = d; d = g; if ( i >>> 0 >= c >>> 0 ) {

				if ( i >>> 0 > c >>> 0 ? ( g = j + ( c << 3 ) | 0, ( g | 0 ) != ( d | 0 ) ) : 0 )f[ e >> 2 ] = d + ( ~ ( ( d + - 8 - g | 0 ) >>> 3 ) << 3 ); if ( ! c ) {

					k = 0; return k | 0;

				}

			} else qe( h, c - i | 0 ); i = f[ h >> 2 ] | 0; h = 0; g = 0; do {

				d = b + ( h << 2 ) | 0; f[ i + ( h << 3 ) >> 2 ] = f[ d >> 2 ]; f[ i + ( h << 3 ) + 4 >> 2 ] = g; e = g; g = ( f[ d >> 2 ] | 0 ) + g | 0; if ( g >>> 0 > 4096 ) {

					k = 0; l = 19; break;

				} if ( e >>> 0 < g >>> 0 ) {

					d = f[ a >> 2 ] | 0; j = e; do {

						f[ d + ( j << 2 ) >> 2 ] = h; j = j + 1 | 0;

					} while ( ( j | 0 ) != ( g | 0 ) );

				}h = h + 1 | 0;

			} while ( h >>> 0 < c >>> 0 );if ( ( l | 0 ) == 19 ) return k | 0; k = ( g | 0 ) == 4096; return k | 0;

		} function ye( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; e = u; u = u + 224 | 0; g = e + 120 | 0; h = e + 80 | 0; i = e; j = e + 136 | 0; k = h; l = k + 40 | 0; do {

				f[ k >> 2 ] = 0; k = k + 4 | 0;

			} while ( ( k | 0 ) < ( l | 0 ) );f[ g >> 2 ] = f[ d >> 2 ]; if ( ( gb( 0, c, g, i, h ) | 0 ) < 0 )m = - 1; else {

				if ( ( f[ a + 76 >> 2 ] | 0 ) > - 1 )n = jn( a ) | 0; else n = 0; d = f[ a >> 2 ] | 0; k = d & 32; if ( ( b[ a + 74 >> 0 ] | 0 ) < 1 )f[ a >> 2 ] = d & - 33; d = a + 48 | 0; if ( ! ( f[ d >> 2 ] | 0 ) ) {

					l = a + 44 | 0; o = f[ l >> 2 ] | 0; f[ l >> 2 ] = j; p = a + 28 | 0; f[ p >> 2 ] = j; q = a + 20 | 0; f[ q >> 2 ] = j; f[ d >> 2 ] = 80; r = a + 16 | 0; f[ r >> 2 ] = j + 80; j = gb( a, c, g, i, h ) | 0; if ( ! o )s = j; else {

						Pa[ f[ a + 36 >> 2 ] & 31 ]( a, 0, 0 ) | 0; t = ( f[ q >> 2 ] | 0 ) == 0 ? - 1 : j; f[ l >> 2 ] = o; f[ d >> 2 ] = 0; f[ r >> 2 ] = 0; f[ p >> 2 ] = 0; f[ q >> 2 ] = 0; s = t;

					}

				} else s = gb( a, c, g, i, h ) | 0; h = f[ a >> 2 ] | 0; f[ a >> 2 ] = h | k; if ( n | 0 )hn( a ); m = ( h & 32 | 0 ) == 0 ? s : - 1;

			}u = e; return m | 0;

		} function ze( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; c = a + 4 | 0; d = f[ c >> 2 ] | 0; e = f[ a >> 2 ] | 0; g = d - e >> 2; h = d; if ( g >>> 0 < b >>> 0 ) {

				gd( a, b - g | 0 ); return;

			} if ( g >>> 0 <= b >>> 0 ) return; g = e + ( b << 2 ) | 0; if ( ( g | 0 ) == ( h | 0 ) ) return; else i = h; do {

				h = i + - 4 | 0; f[ c >> 2 ] = h; b = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( b | 0 ) {

					h = b + 88 | 0; e = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( e | 0 ) {

						h = f[ e + 8 >> 2 ] | 0; if ( h | 0 ) {

							a = e + 12 | 0; if ( ( f[ a >> 2 ] | 0 ) != ( h | 0 ) )f[ a >> 2 ] = h; dn( h );

						}dn( e );

					}e = f[ b + 68 >> 2 ] | 0; if ( e | 0 ) {

						h = b + 72 | 0; a = f[ h >> 2 ] | 0; if ( ( a | 0 ) != ( e | 0 ) )f[ h >> 2 ] = a + ( ~ ( ( a + - 4 - e | 0 ) >>> 2 ) << 2 ); dn( e );

					}e = b + 64 | 0; a = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( a | 0 ) {

						e = f[ a >> 2 ] | 0; if ( e | 0 ) {

							h = a + 4 | 0; if ( ( f[ h >> 2 ] | 0 ) != ( e | 0 ) )f[ h >> 2 ] = e; dn( e );

						}dn( a );

					}dn( b );

				}i = f[ c >> 2 ] | 0;

			} while ( ( i | 0 ) != ( g | 0 ) );return;

		} function Ae( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; d = a + 8 | 0; e = f[ d >> 2 ] | 0; g = a + 4 | 0; h = f[ g >> 2 ] | 0; i = h; if ( e - h >> 2 >>> 0 >= b >>> 0 ) {

				j = b; k = i; while ( 1 ) {

					f[ k >> 2 ] = f[ c >> 2 ]; j = j + - 1 | 0; if ( ! j ) break; else k = k + 4 | 0;

				}f[ g >> 2 ] = i + ( b << 2 ); return;

			}i = f[ a >> 2 ] | 0; k = h - i | 0; h = k >> 2; j = h + b | 0; if ( j >>> 0 > 1073741823 )um( a ); l = e - i | 0; e = l >> 1; m = l >> 2 >>> 0 < 536870911 ? ( e >>> 0 < j >>> 0 ? j : e ) : 1073741823; do if ( m ) if ( m >>> 0 > 1073741823 ) {

				e = ra( 8 ) | 0; Yk( e, 9789 ); f[ e >> 2 ] = 3704; va( e | 0, 856, 80 );

			} else {

				e = bj( m << 2 ) | 0; n = e; o = e; break;

			} else {

				n = 0; o = 0;

			} while ( 0 );e = n + ( h << 2 ) | 0; h = n + ( m << 2 ) | 0; m = b; j = e; while ( 1 ) {

				f[ j >> 2 ] = f[ c >> 2 ]; m = m + - 1 | 0; if ( ! m ) break; else j = j + 4 | 0;

			} if ( ( k | 0 ) > 0 )ge( o | 0, i | 0, k | 0 ) | 0; f[ a >> 2 ] = n; f[ g >> 2 ] = e + ( b << 2 ); f[ d >> 2 ] = h; if ( ! i ) return; dn( i ); return;

		} function Be( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; c = a + 8 | 0; d = b + 8 | 0; e = f[ d >> 2 ] | 0; g = f[ d + 4 >> 2 ] | 0; d = b + 16 | 0; i = d; j = f[ i >> 2 ] | 0; k = f[ i + 4 >> 2 ] | 0; i = Rj( j | 0, k | 0, 4, 0 ) | 0; l = I; if ( ( g | 0 ) < ( l | 0 ) | ( g | 0 ) == ( l | 0 ) & e >>> 0 < i >>> 0 ) {

				m = 0; return m | 0;

			}n = ( f[ b >> 2 ] | 0 ) + j | 0; o = h[ n >> 0 ] | h[ n + 1 >> 0 ] << 8 | h[ n + 2 >> 0 ] << 16 | h[ n + 3 >> 0 ] << 24; n = d; f[ n >> 2 ] = i; f[ n + 4 >> 2 ] = l; l = Rj( j | 0, k | 0, 8, 0 ) | 0; k = I; if ( ( g | 0 ) < ( k | 0 ) | ( g | 0 ) == ( k | 0 ) & e >>> 0 < l >>> 0 ) {

				m = 0; return m | 0;

			}e = d; f[ e >> 2 ] = l; f[ e + 4 >> 2 ] = k; k = ( _( o | 0 ) | 0 ) ^ 31; if ( ( k + - 1 | 0 ) >>> 0 > 28 )p = f[ c >> 2 ] | 0; else {

				o = k + 1 | 0; f[ c >> 2 ] = o; c = 2 << k; f[ a + 12 >> 2 ] = c + - 1; k = c + - 2 | 0; f[ a + 16 >> 2 ] = k; f[ a + 20 >> 2 ] = ( k | 0 ) / 2 | 0; p = o;

			} if ( ( p + - 2 | 0 ) >>> 0 >= 29 ) {

				m = 0; return m | 0;

			}m = td( a + 88 | 0, b ) | 0; return m | 0;

		} function Ce( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0; e = ( f[ a >> 2 ] | 0 ) + 1794895138 | 0; g = Al( f[ a + 8 >> 2 ] | 0, e ) | 0; h = Al( f[ a + 12 >> 2 ] | 0, e ) | 0; i = Al( f[ a + 16 >> 2 ] | 0, e ) | 0; a:do if ( ( g >>> 0 < c >>> 2 >>> 0 ? ( j = c - ( g << 2 ) | 0, h >>> 0 < j >>> 0 & i >>> 0 < j >>> 0 ) : 0 ) ? ( ( i | h ) & 3 | 0 ) == 0 : 0 ) {

				j = h >>> 2; k = i >>> 2; l = 0; m = g; while ( 1 ) {

					n = m >>> 1; o = l + n | 0; p = o << 1; q = p + j | 0; r = Al( f[ a + ( q << 2 ) >> 2 ] | 0, e ) | 0; s = Al( f[ a + ( q + 1 << 2 ) >> 2 ] | 0, e ) | 0; if ( ! ( s >>> 0 < c >>> 0 & r >>> 0 < ( c - s | 0 ) >>> 0 ) ) {

						t = 0; break a;

					} if ( b[ a + ( s + r ) >> 0 ] | 0 ) {

						t = 0; break a;

					}r = th( d, a + s | 0 ) | 0; if ( ! r ) break; s = ( r | 0 ) < 0; if ( ( m | 0 ) == 1 ) {

						t = 0; break a;

					} else {

						l = s ? l : o; m = s ? n : m - n | 0;

					}

				}m = p + k | 0; l = Al( f[ a + ( m << 2 ) >> 2 ] | 0, e ) | 0; j = Al( f[ a + ( m + 1 << 2 ) >> 2 ] | 0, e ) | 0; if ( j >>> 0 < c >>> 0 & l >>> 0 < ( c - j | 0 ) >>> 0 )t = ( b[ a + ( j + l ) >> 0 ] | 0 ) == 0 ? a + j | 0 : 0; else t = 0;

			} else t = 0; while ( 0 );return t | 0;

		} function De( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; h = u; u = u + 64 | 0; i = h; j = f[ a >> 2 ] | 0; k = a + ( f[ j + - 8 >> 2 ] | 0 ) | 0; l = f[ j + - 4 >> 2 ] | 0; f[ i >> 2 ] = e; f[ i + 4 >> 2 ] = a; f[ i + 8 >> 2 ] = c; f[ i + 12 >> 2 ] = g; g = i + 16 | 0; c = i + 20 | 0; a = i + 24 | 0; j = i + 28 | 0; m = i + 32 | 0; n = i + 40 | 0; o = g; p = o + 36 | 0; do {

				f[ o >> 2 ] = 0; o = o + 4 | 0;

			} while ( ( o | 0 ) < ( p | 0 ) );d[ g + 36 >> 1 ] = 0; b[ g + 38 >> 0 ] = 0; a:do if ( zl( l, e, 0 ) | 0 ) {

				f[ i + 48 >> 2 ] = 1; Xa[ f[ ( f[ l >> 2 ] | 0 ) + 20 >> 2 ] & 3 ]( l, i, k, k, 1, 0 ); q = ( f[ a >> 2 ] | 0 ) == 1 ? k : 0;

			} else {

				Wa[ f[ ( f[ l >> 2 ] | 0 ) + 24 >> 2 ] & 3 ]( l, i, k, 1, 0 ); switch ( f[ i + 36 >> 2 ] | 0 ) {

					case 0: {

						q = ( f[ n >> 2 ] | 0 ) == 1 & ( f[ j >> 2 ] | 0 ) == 1 & ( f[ m >> 2 ] | 0 ) == 1 ? f[ c >> 2 ] | 0 : 0; break a; break;

					} case 1:break; default: {

						q = 0; break a;

					}

				} if ( ( f[ a >> 2 ] | 0 ) != 1 ? ! ( ( f[ n >> 2 ] | 0 ) == 0 & ( f[ j >> 2 ] | 0 ) == 1 & ( f[ m >> 2 ] | 0 ) == 1 ) : 0 ) {

					q = 0; break;

				}q = f[ g >> 2 ] | 0;

			} while ( 0 );u = h; return q | 0;

		} function Ee( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; e = a + 4 | 0; g = f[ e >> 2 ] | 0; h = g; if ( d - g >> 2 >>> 0 >= b >>> 0 ) {

				i = b; j = h; while ( 1 ) {

					f[ j >> 2 ] = 1; i = i + - 1 | 0; if ( ! i ) break; else j = j + 4 | 0;

				}f[ e >> 2 ] = h + ( b << 2 ); return;

			}h = f[ a >> 2 ] | 0; j = g - h | 0; g = j >> 2; i = g + b | 0; if ( i >>> 0 > 1073741823 )um( a ); k = d - h | 0; d = k >> 1; l = k >> 2 >>> 0 < 536870911 ? ( d >>> 0 < i >>> 0 ? i : d ) : 1073741823; do if ( l ) if ( l >>> 0 > 1073741823 ) {

				d = ra( 8 ) | 0; Yk( d, 9789 ); f[ d >> 2 ] = 3704; va( d | 0, 856, 80 );

			} else {

				d = bj( l << 2 ) | 0; m = d; n = d; break;

			} else {

				m = 0; n = 0;

			} while ( 0 );d = m + ( g << 2 ) | 0; g = m + ( l << 2 ) | 0; l = b; i = d; while ( 1 ) {

				f[ i >> 2 ] = 1; l = l + - 1 | 0; if ( ! l ) break; else i = i + 4 | 0;

			} if ( ( j | 0 ) > 0 )ge( n | 0, h | 0, j | 0 ) | 0; f[ a >> 2 ] = m; f[ e >> 2 ] = d + ( b << 2 ); f[ c >> 2 ] = g; if ( ! h ) return; dn( h ); return;

		} function Fe( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; c = a + 12 | 0; d = f[ a >> 2 ] | 0; e = a + 8 | 0; g = f[ e >> 2 ] | 0; h = ( g | 0 ) == - 1; if ( ! ( b[ c >> 0 ] | 0 ) ) {

				do if ( ( ! h ? ( i = ( ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + g | 0, ( i | 0 ) != - 1 ) : 0 ) ? ( j = f[ ( f[ d + 12 >> 2 ] | 0 ) + ( i << 2 ) >> 2 ] | 0, ( j | 0 ) != - 1 ) : 0 ) if ( ! ( ( j >>> 0 ) % 3 | 0 ) ) {

					k = j + 2 | 0; break;

				} else {

					k = j + - 1 | 0; break;

				} else k = - 1; while ( 0 );f[ e >> 2 ] = k; return;

			}k = g + 1 | 0; if ( ( ! h ? ( h = ( ( k >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : k, ( h | 0 ) != - 1 ) : 0 ) ? ( k = f[ ( f[ d + 12 >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0, h = k + 1 | 0, ( k | 0 ) != - 1 ) : 0 ) {

				g = ( ( h >>> 0 ) % 3 | 0 | 0 ) == 0 ? k + - 2 | 0 : h; f[ e >> 2 ] = g; if ( ( g | 0 ) != - 1 ) {

					if ( ( g | 0 ) != ( f[ a + 4 >> 2 ] | 0 ) ) return; f[ e >> 2 ] = - 1; return;

				}

			} else f[ e >> 2 ] = - 1; g = f[ a + 4 >> 2 ] | 0; do if ( ( ( g | 0 ) != - 1 ? ( a = ( ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + g | 0, ( a | 0 ) != - 1 ) : 0 ) ? ( h = f[ ( f[ d + 12 >> 2 ] | 0 ) + ( a << 2 ) >> 2 ] | 0, ( h | 0 ) != - 1 ) : 0 ) if ( ! ( ( h >>> 0 ) % 3 | 0 ) ) {

				l = h + 2 | 0; break;

			} else {

				l = h + - 1 | 0; break;

			} else l = - 1; while ( 0 );f[ e >> 2 ] = l; b[ c >> 0 ] = 0; return;

		} function Ge( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; d = f[ a + 4 >> 2 ] | 0; if ( ! d ) {

				e = 0; return e | 0;

			}a = b[ c + 11 >> 0 ] | 0; g = a << 24 >> 24 < 0; h = g ? f[ c + 4 >> 2 ] | 0 : a & 255; a = g ? f[ c >> 2 ] | 0 : c; c = d; while ( 1 ) {

				d = c + 16 | 0; g = b[ d + 11 >> 0 ] | 0; i = g << 24 >> 24 < 0; j = i ? f[ c + 20 >> 2 ] | 0 : g & 255; g = j >>> 0 < h >>> 0; k = g ? j : h; if ( ( k | 0 ) != 0 ? ( l = jh( a, i ? f[ d >> 2 ] | 0 : d, k ) | 0, ( l | 0 ) != 0 ) : 0 ) if ( ( l | 0 ) < 0 )m = 7; else m = 8; else if ( h >>> 0 < j >>> 0 )m = 7; else m = 8; if ( ( m | 0 ) == 7 ) {

					m = 0; n = c;

				} else if ( ( m | 0 ) == 8 ) {

					m = 0; l = h >>> 0 < j >>> 0 ? h : j; if ( ( l | 0 ) != 0 ? ( j = jh( i ? f[ d >> 2 ] | 0 : d, a, l ) | 0, ( j | 0 ) != 0 ) : 0 ) {

						if ( ( j | 0 ) >= 0 ) {

							e = 1; m = 14; break;

						}

					} else m = 10; if ( ( m | 0 ) == 10 ? ( m = 0, ! g ) : 0 ) {

						e = 1; m = 14; break;

					}n = c + 4 | 0;

				}c = f[ n >> 2 ] | 0; if ( ! c ) {

					e = 0; m = 14; break;

				}

			} if ( ( m | 0 ) == 14 ) return e | 0; return 0;

		} function He( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; d = u; u = u + 32 | 0; e = d + 12 | 0; g = d; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; h = gg( c ) | 0; if ( h >>> 0 > 4294967279 )um( e ); if ( h >>> 0 < 11 ) {

				b[ e + 11 >> 0 ] = h; if ( ! h )i = e; else {

					j = e; k = 6;

				}

			} else {

				l = h + 16 & - 16; m = bj( l ) | 0; f[ e >> 2 ] = m; f[ e + 8 >> 2 ] = l | - 2147483648; f[ e + 4 >> 2 ] = h; j = m; k = 6;

			} if ( ( k | 0 ) == 6 ) {

				ge( j | 0, c | 0, h | 0 ) | 0; i = j;

			}b[ i + h >> 0 ] = 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = g + 11 | 0; b[ h >> 0 ] = 4; f[ g >> 2 ] = 1701667182; b[ g + 4 >> 0 ] = 0; i = f[ a + 4 >> 2 ] | 0; if ( ( i | 0 ) != 0 ? ( j = Mc( i, g, e ) | 0, ( j | 0 ) != 0 ) : 0 )n = ih( a, f[ j + 40 >> 2 ] | 0 ) | 0; else n = - 1; if ( ( b[ h >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); if ( ( b[ e + 11 >> 0 ] | 0 ) >= 0 ) {

				u = d; return n | 0;

			}dn( f[ e >> 2 ] | 0 ); u = d; return n | 0;

		} function Ie( a, b, c, d, e ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, i = 0; if ( ( b | 0 ) == - 2 )g = 0; else {

				i = f[ ( f[ ( f[ d + 4 >> 2 ] | 0 ) + 8 >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] | 0; do if ( ( Na[ f[ ( f[ d >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( d ) | 0 ) == 1 ) {

					ud( a, d, b, c, e, ( ( h[ d + 36 >> 0 ] | 0 ) << 8 | ( h[ d + 37 >> 0 ] | 0 ) ) & 65535 ); if ( ! ( f[ a >> 2 ] | 0 ) ) {

						f[ a >> 2 ] = 0; break;

					} else return;

				} while ( 0 );d = bj( 44 ) | 0; f[ d >> 2 ] = 1208; f[ d + 4 >> 2 ] = i; i = d + 8 | 0; f[ i >> 2 ] = f[ e >> 2 ]; f[ i + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ i + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ i + 12 >> 2 ] = f[ e + 12 >> 2 ]; f[ i + 16 >> 2 ] = f[ e + 16 >> 2 ]; f[ i + 20 >> 2 ] = f[ e + 20 >> 2 ]; Bg( d + 32 | 0, e + 24 | 0 ); f[ d >> 2 ] = 1264; g = d;

			}f[ a >> 2 ] = g; return;

		} function Je( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; e = a + 16 | 0; if ( b[ d + 84 >> 0 ] | 0 ) {

				g = f[ e >> 2 ] | 0; return g | 0;

			}a = f[ e >> 2 ] | 0; if ( ! a ) {

				g = f[ e >> 2 ] | 0; return g | 0;

			}h = a + 84 | 0; if ( ! ( b[ h >> 0 ] | 0 ) ) {

				g = f[ e >> 2 ] | 0; return g | 0;

			}i = ( f[ d + 72 >> 2 ] | 0 ) - ( f[ d + 68 >> 2 ] | 0 ) >> 2; b[ h >> 0 ] = 0; h = a + 68 | 0; j = a + 72 | 0; a = f[ j >> 2 ] | 0; k = f[ h >> 2 ] | 0; l = a - k >> 2; m = k; k = a; if ( i >>> 0 <= l >>> 0 ) if ( i >>> 0 < l >>> 0 ? ( a = m + ( i << 2 ) | 0, ( a | 0 ) != ( k | 0 ) ) : 0 ) {

				f[ j >> 2 ] = k + ( ~ ( ( k + - 4 - a | 0 ) >>> 2 ) << 2 ); n = d;

			} else n = d; else {

				Ae( h, i - l | 0, 1076 ); n = f[ c >> 2 ] | 0;

			} if ( b[ n + 84 >> 0 ] | 0 ) {

				g = f[ e >> 2 ] | 0; return g | 0;

			}c = f[ n + 68 >> 2 ] | 0; l = c; i = ( f[ n + 72 >> 2 ] | 0 ) - c >> 2; if ( ! i ) {

				g = f[ e >> 2 ] | 0; return g | 0;

			}c = f[ ( f[ e >> 2 ] | 0 ) + 68 >> 2 ] | 0; n = 0; do {

				f[ c + ( n << 2 ) >> 2 ] = f[ l + ( n << 2 ) >> 2 ]; n = n + 1 | 0;

			} while ( n >>> 0 < i >>> 0 );g = f[ e >> 2 ] | 0; return g | 0;

		} function Ke( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = La; d = u; u = u + 32 | 0; e = d + 16 | 0; g = d; h = a + 8 | 0; i = b[ ( f[ h >> 2 ] | 0 ) + 24 >> 0 ] << 2; j = f[ a + 16 >> 2 ] | 0; k = ( f[ f[ j >> 2 ] >> 2 ] | 0 ) + ( f[ j + 48 >> 2 ] | 0 ) | 0; f[ g >> 2 ] = - 1; f[ g + 4 >> 2 ] = - 1; f[ g + 8 >> 2 ] = - 1; f[ g + 12 >> 2 ] = - 1; j = f[ a + 24 >> 2 ] | 0; if ( ( j + - 2 | 0 ) >>> 0 > 28 ) {

				l = 0; u = d; return l | 0;

			}f[ g >> 2 ] = j; a = 1 << j; f[ g + 4 >> 2 ] = a + - 1; j = a + - 2 | 0; a = g + 8 | 0; f[ a >> 2 ] = j; f[ g + 12 >> 2 ] = ( j | 0 ) / 2 | 0; if ( ! c ) {

				l = 1; u = d; return l | 0;

			}m = 0; n = 0; o = 0; p = j; while ( 1 ) {

				q = $( $( 1.0 ) / $( p | 0 ) ); Dd( g, $( q * $( f[ k + ( m << 2 ) >> 2 ] | 0 ) ), $( q * $( f[ k + ( ( m | 1 ) << 2 ) >> 2 ] | 0 ) ), e ); ge( ( f[ f[ ( f[ h >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + o | 0, e | 0, i | 0 ) | 0; j = n + 1 | 0; if ( ( j | 0 ) == ( c | 0 ) ) {

					l = 1; break;

				}m = m + 2 | 0; n = j; o = o + i | 0; p = f[ a >> 2 ] | 0;

			}u = d; return l | 0;

		} function Le( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; b = f[ a + 196 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 200 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = a + 184 | 0; d = f[ b >> 2 ] | 0; if ( d | 0 ) {

				c = a + 188 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) == ( d | 0 ) )g = d; else {

					h = e; while ( 1 ) {

						e = h + - 12 | 0; f[ c >> 2 ] = e; i = f[ e >> 2 ] | 0; if ( ! i )j = e; else {

							e = h + - 8 | 0; k = f[ e >> 2 ] | 0; if ( ( k | 0 ) != ( i | 0 ) )f[ e >> 2 ] = k + ( ~ ( ( k + - 4 - i | 0 ) >>> 2 ) << 2 ); dn( i ); j = f[ c >> 2 ] | 0;

						} if ( ( j | 0 ) == ( d | 0 ) ) break; else h = j;

					}g = f[ b >> 2 ] | 0;

				}dn( g );

			}g = f[ a + 156 >> 2 ] | 0; if ( g | 0 ) {

				b = a + 160 | 0; j = f[ b >> 2 ] | 0; if ( ( j | 0 ) != ( g | 0 ) )f[ b >> 2 ] = j + ( ~ ( ( j + - 4 - g | 0 ) >>> 2 ) << 2 ); dn( g );

			}g = a + 136 | 0; a = f[ g >> 2 ] | 0; f[ g >> 2 ] = 0; if ( ! a ) return; g = a + - 4 | 0; j = f[ g >> 2 ] | 0; if ( j | 0 ) {

				b = a + ( j << 4 ) | 0; do b = b + - 16 | 0; while ( ( b | 0 ) != ( a | 0 ) );

			}bn( g ); return;

		} function Me( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; d = u; u = u + 32 | 0; e = d + 16 | 0; g = d; switch ( c << 24 >> 24 ) {

				case 0: {

					c = bj( 48 ) | 0; Ql( c ); f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; f[ a + 16 >> 2 ] = c; u = d; return;

				} case 1: {

					c = bj( 52 ) | 0; Vk( c ); f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; f[ a + 16 >> 2 ] = c; u = d; return;

				} default: {

					c = bj( 32 ) | 0; f[ g >> 2 ] = c; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 28; h = c; i = 8331; j = h + 28 | 0; do {

						b[ h >> 0 ] = b[ i >> 0 ] | 0; h = h + 1 | 0; i = i + 1 | 0;

					} while ( ( h | 0 ) < ( j | 0 ) );b[ c + 28 >> 0 ] = 0; f[ e >> 2 ] = - 1; c = e + 4 | 0; Rf( c, g ); f[ a >> 2 ] = f[ e >> 2 ]; Rf( a + 4 | 0, c ); f[ a + 16 >> 2 ] = 0; if ( ( b[ c + 11 >> 0 ] | 0 ) < 0 )dn( f[ c >> 2 ] | 0 ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = d; return;

				}

			}

		} function Ne( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; c = a + 4 | 0; d = f[ c >> 2 ] | 0; e = f[ a >> 2 ] | 0; g = ( d - e | 0 ) / 144 | 0; h = d; if ( g >>> 0 < b >>> 0 ) {

				Kc( a, b - g | 0 ); return;

			} if ( g >>> 0 <= b >>> 0 ) return; g = e + ( b * 144 | 0 ) | 0; if ( ( g | 0 ) == ( h | 0 ) ) return; else i = h; do {

				f[ c >> 2 ] = i + - 144; h = f[ i + - 12 >> 2 ] | 0; if ( h | 0 ) {

					b = i + - 8 | 0; e = f[ b >> 2 ] | 0; if ( ( e | 0 ) != ( h | 0 ) )f[ b >> 2 ] = e + ( ~ ( ( e + - 4 - h | 0 ) >>> 2 ) << 2 ); dn( h );

				}h = f[ i + - 28 >> 2 ] | 0; if ( h | 0 ) {

					e = i + - 24 | 0; b = f[ e >> 2 ] | 0; if ( ( b | 0 ) != ( h | 0 ) )f[ e >> 2 ] = b + ( ~ ( ( b + - 4 - h | 0 ) >>> 2 ) << 2 ); dn( h );

				}h = f[ i + - 40 >> 2 ] | 0; if ( h | 0 ) {

					b = i + - 36 | 0; e = f[ b >> 2 ] | 0; if ( ( e | 0 ) != ( h | 0 ) )f[ b >> 2 ] = e + ( ~ ( ( e + - 4 - h | 0 ) >>> 2 ) << 2 ); dn( h );

				}tf( i + - 140 | 0 ); i = f[ c >> 2 ] | 0;

			} while ( ( i | 0 ) != ( g | 0 ) );return;

		} function Oe( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = La, e = 0, g = 0; if ( ( b | 0 ) != 1 ) if ( ! ( b + - 1 & b ) )c = b; else c = $a( b ) | 0; else c = 2; b = f[ a + 4 >> 2 ] | 0; if ( c >>> 0 > b >>> 0 ) {

				Rb( a, c ); return;

			} if ( c >>> 0 >= b >>> 0 ) return; d = $( ( f[ a + 12 >> 2 ] | 0 ) >>> 0 ); e = ~ ~ $( W( $( d / $( n[ a + 16 >> 2 ] ) ) ) ) >>> 0; if ( b >>> 0 > 2 & ( b + - 1 & b | 0 ) == 0 )g = 1 << 32 - ( _( e + - 1 | 0 ) | 0 ); else g = $a( e ) | 0; e = c >>> 0 < g >>> 0 ? g : c; if ( e >>> 0 >= b >>> 0 ) return; Rb( a, e ); return;

		} function Pe( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; f[ a >> 2 ] = 1088; b = a + 60 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 )Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); c = f[ a + 48 >> 2 ] | 0; if ( c | 0 ) {

				b = a + 52 | 0; d = f[ b >> 2 ] | 0; if ( ( d | 0 ) != ( c | 0 ) )f[ b >> 2 ] = d + ( ~ ( ( d + - 4 - c | 0 ) >>> 2 ) << 2 ); dn( c );

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( d | 0 ) {

				b = a + 40 | 0; e = f[ b >> 2 ] | 0; if ( ( e | 0 ) == ( d | 0 ) )g = d; else {

					h = e; do {

						e = h + - 4 | 0; f[ b >> 2 ] = e; i = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( i | 0 )Sa[ f[ ( f[ i >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( i ); h = f[ b >> 2 ] | 0;

					} while ( ( h | 0 ) != ( d | 0 ) );g = f[ c >> 2 ] | 0;

				}dn( g );

			}f[ a >> 2 ] = 984; g = f[ a + 16 >> 2 ] | 0; if ( g | 0 ) {

				c = a + 20 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( g | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - g | 0 ) >>> 2 ) << 2 ); dn( g );

			}g = f[ a + 4 >> 2 ] | 0; if ( ! g ) return; d = a + 8 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( g | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - g | 0 ) >>> 2 ) << 2 ); dn( g ); return;

		} function Qe( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; b = f[ a >> 2 ] | 0; if ( ! b ) return; c = a + 4 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) == ( b | 0 ) )e = b; else {

				g = d; do {

					d = g + - 4 | 0; f[ c >> 2 ] = d; h = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( h | 0 ) {

						d = h + 88 | 0; i = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( i | 0 ) {

							d = f[ i + 8 >> 2 ] | 0; if ( d | 0 ) {

								j = i + 12 | 0; if ( ( f[ j >> 2 ] | 0 ) != ( d | 0 ) )f[ j >> 2 ] = d; dn( d );

							}dn( i );

						}i = f[ h + 68 >> 2 ] | 0; if ( i | 0 ) {

							d = h + 72 | 0; j = f[ d >> 2 ] | 0; if ( ( j | 0 ) != ( i | 0 ) )f[ d >> 2 ] = j + ( ~ ( ( j + - 4 - i | 0 ) >>> 2 ) << 2 ); dn( i );

						}i = h + 64 | 0; j = f[ i >> 2 ] | 0; f[ i >> 2 ] = 0; if ( j | 0 ) {

							i = f[ j >> 2 ] | 0; if ( i | 0 ) {

								d = j + 4 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( i | 0 ) )f[ d >> 2 ] = i; dn( i );

							}dn( j );

						}dn( h );

					}g = f[ c >> 2 ] | 0;

				} while ( ( g | 0 ) != ( b | 0 ) );e = f[ a >> 2 ] | 0;

			}dn( e ); return;

		} function Re( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; c = a + 8 | 0; d = b + 8 | 0; e = f[ d >> 2 ] | 0; g = f[ d + 4 >> 2 ] | 0; d = b + 16 | 0; i = d; j = f[ i >> 2 ] | 0; k = f[ i + 4 >> 2 ] | 0; i = Rj( j | 0, k | 0, 4, 0 ) | 0; l = I; if ( ( g | 0 ) < ( l | 0 ) | ( g | 0 ) == ( l | 0 ) & e >>> 0 < i >>> 0 ) return 0; m = ( f[ b >> 2 ] | 0 ) + j | 0; b = h[ m >> 0 ] | h[ m + 1 >> 0 ] << 8 | h[ m + 2 >> 0 ] << 16 | h[ m + 3 >> 0 ] << 24; m = d; f[ m >> 2 ] = i; f[ m + 4 >> 2 ] = l; l = Rj( j | 0, k | 0, 8, 0 ) | 0; k = I; if ( ( g | 0 ) < ( k | 0 ) | ( g | 0 ) == ( k | 0 ) & e >>> 0 < l >>> 0 ) return 0; e = d; f[ e >> 2 ] = l; f[ e + 4 >> 2 ] = k; k = ( _( b | 0 ) | 0 ) ^ 31; if ( ( k + - 1 | 0 ) >>> 0 > 28 ) {

				n = f[ c >> 2 ] | 0; o = n + - 2 | 0; p = o >>> 0 < 29; return p | 0;

			} else {

				b = k + 1 | 0; f[ c >> 2 ] = b; c = 2 << k; f[ a + 12 >> 2 ] = c + - 1; k = c + - 2 | 0; f[ a + 16 >> 2 ] = k; f[ a + 20 >> 2 ] = ( k | 0 ) / 2 | 0; n = b; o = n + - 2 | 0; p = o >>> 0 < 29; return p | 0;

			} return 0;

		} function Se( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; b = f[ a + 4 >> 2 ] | 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) ) {

				e = d; do {

					d = e + - 4 | 0; f[ c >> 2 ] = d; g = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( g | 0 ) {

						d = g + 88 | 0; h = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( h | 0 ) {

							d = f[ h + 8 >> 2 ] | 0; if ( d | 0 ) {

								i = h + 12 | 0; if ( ( f[ i >> 2 ] | 0 ) != ( d | 0 ) )f[ i >> 2 ] = d; dn( d );

							}dn( h );

						}h = f[ g + 68 >> 2 ] | 0; if ( h | 0 ) {

							d = g + 72 | 0; i = f[ d >> 2 ] | 0; if ( ( i | 0 ) != ( h | 0 ) )f[ d >> 2 ] = i + ( ~ ( ( i + - 4 - h | 0 ) >>> 2 ) << 2 ); dn( h );

						}h = g + 64 | 0; i = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( i | 0 ) {

							h = f[ i >> 2 ] | 0; if ( h | 0 ) {

								d = i + 4 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( h | 0 ) )f[ d >> 2 ] = h; dn( h );

							}dn( i );

						}dn( g );

					}e = f[ c >> 2 ] | 0;

				} while ( ( e | 0 ) != ( b | 0 ) );

			}b = f[ a >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function Te( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = La, e = 0, g = 0; if ( ( b | 0 ) != 1 ) if ( ! ( b + - 1 & b ) )c = b; else c = $a( b ) | 0; else c = 2; b = f[ a + 4 >> 2 ] | 0; if ( c >>> 0 > b >>> 0 ) {

				jc( a, c ); return;

			} if ( c >>> 0 >= b >>> 0 ) return; d = $( ( f[ a + 12 >> 2 ] | 0 ) >>> 0 ); e = ~ ~ $( W( $( d / $( n[ a + 16 >> 2 ] ) ) ) ) >>> 0; if ( b >>> 0 > 2 & ( b + - 1 & b | 0 ) == 0 )g = 1 << 32 - ( _( e + - 1 | 0 ) | 0 ); else g = $a( e ) | 0; e = c >>> 0 < g >>> 0 ? g : c; if ( e >>> 0 >= b >>> 0 ) return; jc( a, e ); return;

		} function Ue( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; g = bj( 32 ) | 0; f[ a >> 2 ] = g; f[ a + 4 >> 2 ] = c + 8; c = a + 8 | 0; b[ c >> 0 ] = 0; h = g + 8 | 0; f[ h >> 2 ] = f[ e >> 2 ]; f[ h + 4 >> 2 ] = f[ e + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ e + 8 >> 2 ]; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; h = g + 20 | 0; i = e + 12 | 0; f[ h >> 2 ] = 0; f[ g + 24 >> 2 ] = 0; f[ g + 28 >> 2 ] = 0; g = e + 16 | 0; e = f[ g >> 2 ] | 0; j = f[ i >> 2 ] | 0; k = e - j | 0; if ( ! k ) {

				l = j; m = e; n = 0;

			} else {

				jf( h, k ); l = f[ i >> 2 ] | 0; m = f[ g >> 2 ] | 0; n = f[ h >> 2 ] | 0;

			}ge( n | 0, l | 0, m - l | 0 ) | 0; b[ c >> 0 ] = 1; c = f[ a >> 2 ] | 0; f[ c + 4 >> 2 ] = d; f[ c >> 2 ] = 0; return;

		} function Ve( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; c = a + 60 | 0; d = f[ c >> 2 ] | 0; if ( ! d ) {

				e = 0; return e | 0;

			}f[ d + 4 >> 2 ] = a + 48; if ( ! ( Na[ f[ ( f[ d >> 2 ] | 0 ) + 12 >> 2 ] & 127 ]( d ) | 0 ) ) {

				e = 0; return e | 0;

			}d = Na[ f[ ( f[ a >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( a ) | 0; a:do if ( ( d | 0 ) > 0 ) {

				g = 0; while ( 1 ) {

					h = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 28 >> 2 ] & 127 ]( a ) | 0 ) + 4 | 0; i = f[ h >> 2 ] | 0; h = Oa[ f[ ( f[ a >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( a, g ) | 0; j = f[ c >> 2 ] | 0; g = g + 1 | 0; if ( ! ( Oa[ f[ ( f[ j >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( j, f[ ( f[ i + 8 >> 2 ] | 0 ) + ( h << 2 ) >> 2 ] | 0 ) | 0 ) ) {

						e = 0; break;

					} if ( ( g | 0 ) >= ( d | 0 ) ) break a;

				} return e | 0;

			} while ( 0 );if ( ! ( Oa[ f[ ( f[ a >> 2 ] | 0 ) + 36 >> 2 ] & 127 ]( a, b ) | 0 ) ) {

				e = 0; return e | 0;

			} if ( ! ( Oa[ f[ ( f[ a >> 2 ] | 0 ) + 40 >> 2 ] & 127 ]( a, b ) | 0 ) ) {

				e = 0; return e | 0;

			}e = Na[ f[ ( f[ a >> 2 ] | 0 ) + 44 >> 2 ] & 127 ]( a ) | 0; return e | 0;

		} function We( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; a = u; u = u + 32 | 0; e = a + 12 | 0; g = a; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = gg( d ) | 0; if ( h >>> 0 > 4294967279 )um( g ); if ( h >>> 0 < 11 ) {

				b[ g + 11 >> 0 ] = h; if ( ! h )i = g; else {

					j = g; k = 6;

				}

			} else {

				l = h + 16 & - 16; m = bj( l ) | 0; f[ g >> 2 ] = m; f[ g + 8 >> 2 ] = l | - 2147483648; f[ g + 4 >> 2 ] = h; j = m; k = 6;

			} if ( ( k | 0 ) == 6 ) {

				ge( j | 0, d | 0, h | 0 ) | 0; i = j;

			}b[ i + h >> 0 ] = 0; Sf( c, g, e ) | 0; c = e + 11 | 0; h = b[ c >> 0 ] | 0; i = h << 24 >> 24 < 0 ? f[ e >> 2 ] | 0 : e; if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 ) {

				dn( f[ g >> 2 ] | 0 ); n = b[ c >> 0 ] | 0;

			} else n = h; if ( n << 24 >> 24 >= 0 ) {

				u = a; return i | 0;

			}dn( f[ e >> 2 ] | 0 ); u = a; return i | 0;

		} function Xe( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; e = d + 16 | 0; g = f[ e >> 2 ] | 0; if ( ! g ) if ( ! ( Gh( d ) | 0 ) ) {

				h = f[ e >> 2 ] | 0; i = 5;

			} else j = 0; else {

				h = g; i = 5;

			}a:do if ( ( i | 0 ) == 5 ) {

				g = d + 20 | 0; e = f[ g >> 2 ] | 0; k = e; if ( ( h - e | 0 ) >>> 0 < c >>> 0 ) {

					j = Pa[ f[ d + 36 >> 2 ] & 31 ]( d, a, c ) | 0; break;

				}b:do if ( ( b[ d + 75 >> 0 ] | 0 ) > - 1 ) {

					e = c; while ( 1 ) {

						if ( ! e ) {

							l = 0; m = a; n = c; o = k; break b;

						}p = e + - 1 | 0; if ( ( b[ a + p >> 0 ] | 0 ) == 10 ) break; else e = p;

					}p = Pa[ f[ d + 36 >> 2 ] & 31 ]( d, a, e ) | 0; if ( p >>> 0 < e >>> 0 ) {

						j = p; break a;

					}l = e; m = a + e | 0; n = c - e | 0; o = f[ g >> 2 ] | 0;

				} else {

					l = 0; m = a; n = c; o = k;

				} while ( 0 );ge( o | 0, m | 0, n | 0 ) | 0; f[ g >> 2 ] = ( f[ g >> 2 ] | 0 ) + n; j = l + n | 0;

			} while ( 0 );return j | 0;

		} function Ye( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; c = a + 12 | 0; d = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( d | 0 ) {

				c = f[ d + 28 >> 2 ] | 0; if ( c | 0 ) {

					e = c; do {

						c = e; e = f[ e >> 2 ] | 0; Ye( c + 8 | 0 ); dn( c );

					} while ( ( e | 0 ) != 0 );

				}e = d + 20 | 0; c = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( c | 0 )dn( c ); c = f[ d + 8 >> 2 ] | 0; if ( c | 0 ) {

					e = c; do {

						c = e; e = f[ e >> 2 ] | 0; g = c + 8 | 0; h = f[ c + 20 >> 2 ] | 0; if ( h | 0 ) {

							i = c + 24 | 0; if ( ( f[ i >> 2 ] | 0 ) != ( h | 0 ) )f[ i >> 2 ] = h; dn( h );

						} if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); dn( c );

					} while ( ( e | 0 ) != 0 );

				}e = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( e | 0 )dn( e ); dn( d );

			} if ( ( b[ a + 11 >> 0 ] | 0 ) >= 0 ) return; dn( f[ a >> 2 ] | 0 ); return;

		} function Ze( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0; d = ( f[ b + 4 >> 2 ] | 0 ) - ( f[ b >> 2 ] | 0 ) | 0; b = d >> 2; e = a + 8 | 0; a = f[ ( f[ e >> 2 ] | 0 ) + 40 >> 2 ] | 0; g = an( ( a | 0 ) > - 1 ? a : - 1 ) | 0; h = c + 8 | 0; if ( ( d | 0 ) <= 0 ) {

				i = 1; bn( g ); return i | 0;

			}d = c + 16 | 0; j = 0; k = 0; while ( 1 ) {

				l = h; m = f[ l >> 2 ] | 0; n = f[ l + 4 >> 2 ] | 0; l = d; o = f[ l >> 2 ] | 0; p = Rj( o | 0, f[ l + 4 >> 2 ] | 0, a | 0, 0 ) | 0; l = I; if ( ( n | 0 ) < ( l | 0 ) | ( n | 0 ) == ( l | 0 ) & m >>> 0 < p >>> 0 ) {

					i = 0; q = 5; break;

				}ge( g | 0, ( f[ c >> 2 ] | 0 ) + o | 0, a | 0 ) | 0; o = d; f[ o >> 2 ] = p; f[ o + 4 >> 2 ] = l; ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + j | 0, g | 0, a | 0 ) | 0; k = k + 1 | 0; if ( ( k | 0 ) >= ( b | 0 ) ) {

					i = 1; q = 5; break;

				} else j = j + a | 0;

			} if ( ( q | 0 ) == 5 ) {

				bn( g ); return i | 0;

			} return 0;

		} function _e( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; d = a + 212 | 0; e = a + 216 | 0; g = f[ d >> 2 ] | 0; if ( ( f[ e >> 2 ] | 0 ) == ( g | 0 ) ) {

				h = 0; return h | 0;

			}i = a + 4 | 0; a = 0; j = g; a:while ( 1 ) {

				g = f[ j + ( a * 144 | 0 ) >> 2 ] | 0; if ( ( ( g | 0 ) >= 0 ? ( k = f[ i >> 2 ] | 0, l = f[ k + 8 >> 2 ] | 0, ( g | 0 ) < ( ( f[ k + 12 >> 2 ] | 0 ) - l >> 2 | 0 ) ) : 0 ) ? ( k = f[ l + ( g << 2 ) >> 2 ] | 0, ( Na[ f[ ( f[ k >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( k ) | 0 ) > 0 ) : 0 ) {

					g = 0; do {

						if ( ( Oa[ f[ ( f[ k >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( k, g ) | 0 ) == ( c | 0 ) ) break a; g = g + 1 | 0;

					} while ( ( g | 0 ) < ( Na[ f[ ( f[ k >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( k ) | 0 ) );

				}k = a + 1 | 0; j = f[ d >> 2 ] | 0; if ( k >>> 0 >= ( ( ( f[ e >> 2 ] | 0 ) - j | 0 ) / 144 | 0 ) >>> 0 ) {

					h = 0; m = 11; break;

				} else a = k;

			} if ( ( m | 0 ) == 11 ) return h | 0; m = f[ d >> 2 ] | 0; h = ( b[ m + ( a * 144 | 0 ) + 100 >> 0 ] | 0 ) == 0 ? 0 : m + ( a * 144 | 0 ) + 4 | 0; return h | 0;

		} function $e( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; c = a + 212 | 0; d = a + 216 | 0; e = f[ c >> 2 ] | 0; a:do if ( ( f[ d >> 2 ] | 0 ) != ( e | 0 ) ) {

				g = a + 4 | 0; h = 0; i = e; b:while ( 1 ) {

					j = f[ i + ( h * 144 | 0 ) >> 2 ] | 0; if ( ( ( j | 0 ) >= 0 ? ( k = f[ g >> 2 ] | 0, l = f[ k + 8 >> 2 ] | 0, ( j | 0 ) < ( ( f[ k + 12 >> 2 ] | 0 ) - l >> 2 | 0 ) ) : 0 ) ? ( k = f[ l + ( j << 2 ) >> 2 ] | 0, ( Na[ f[ ( f[ k >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( k ) | 0 ) > 0 ) : 0 ) {

						j = 0; do {

							if ( ( Oa[ f[ ( f[ k >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( k, j ) | 0 ) == ( b | 0 ) ) break b; j = j + 1 | 0;

						} while ( ( j | 0 ) < ( Na[ f[ ( f[ k >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( k ) | 0 ) );

					}k = h + 1 | 0; i = f[ c >> 2 ] | 0; if ( k >>> 0 >= ( ( ( f[ d >> 2 ] | 0 ) - i | 0 ) / 144 | 0 ) >>> 0 ) break a; else h = k;

				}m = ( f[ c >> 2 ] | 0 ) + ( h * 144 | 0 ) + 104 | 0; return m | 0;

			} while ( 0 );m = a + 184 | 0; return m | 0;

		} function af( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; c = u; u = u + 32 | 0; d = c + 16 | 0; e = c + 8 | 0; g = c; h = a + 8 | 0; if ( f[ h >> 2 ] << 5 >>> 0 >= b >>> 0 ) {

				u = c; return;

			}f[ d >> 2 ] = 0; i = d + 4 | 0; f[ i >> 2 ] = 0; j = d + 8 | 0; f[ j >> 2 ] = 0; if ( ( b | 0 ) < 0 )um( d ); k = ( ( b + - 1 | 0 ) >>> 5 ) + 1 | 0; b = bj( k << 2 ) | 0; f[ d >> 2 ] = b; f[ i >> 2 ] = 0; f[ j >> 2 ] = k; k = f[ a >> 2 ] | 0; f[ e >> 2 ] = k; f[ e + 4 >> 2 ] = 0; b = a + 4 | 0; l = f[ b >> 2 ] | 0; f[ g >> 2 ] = k + ( l >>> 5 << 2 ); f[ g + 4 >> 2 ] = l & 31; Hd( d, e, g ); g = f[ a >> 2 ] | 0; f[ a >> 2 ] = f[ d >> 2 ]; f[ d >> 2 ] = g; d = f[ b >> 2 ] | 0; f[ b >> 2 ] = f[ i >> 2 ]; f[ i >> 2 ] = d; d = f[ h >> 2 ] | 0; f[ h >> 2 ] = f[ j >> 2 ]; f[ j >> 2 ] = d; if ( g | 0 )dn( g ); u = c; return;

		} function bf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0; c = u; u = u + 16 | 0; e = c; do if ( ( ( h[ ( f[ a + 4 >> 2 ] | 0 ) + 36 >> 0 ] | 0 ) << 8 & 65535 ) > 511 ) {

				g = d + 8 | 0; i = f[ g + 4 >> 2 ] | 0; j = d + 16 | 0; k = j; l = f[ k >> 2 ] | 0; m = f[ k + 4 >> 2 ] | 0; if ( ( i | 0 ) > ( m | 0 ) | ( ( i | 0 ) == ( m | 0 ) ? ( f[ g >> 2 ] | 0 ) >>> 0 > l >>> 0 : 0 ) ) {

					g = b[ ( f[ d >> 2 ] | 0 ) + l >> 0 ] | 0; i = Rj( l | 0, m | 0, 1, 0 ) | 0; m = j; f[ m >> 2 ] = i; f[ m + 4 >> 2 ] = I; m = g & 255; f[ a + 24 >> 2 ] = m; n = m; break;

				} else {

					o = 0; u = c; return o | 0;

				}

			} else n = f[ a + 24 >> 2 ] | 0; while ( 0 );f[ e >> 2 ] = 928; f[ e + 4 >> 2 ] = - 1; El( e, n ); o = gh( e, f[ a + 16 >> 2 ] | 0 ) | 0; u = c; return o | 0;

		} function cf( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; c = a + 4 | 0; d = f[ a >> 2 ] | 0; e = ( f[ c >> 2 ] | 0 ) - d | 0; g = ( e | 0 ) / 12 | 0; h = g + 1 | 0; if ( h >>> 0 > 357913941 )um( a ); i = a + 8 | 0; j = ( ( f[ i >> 2 ] | 0 ) - d | 0 ) / 12 | 0; k = j << 1; l = j >>> 0 < 178956970 ? ( k >>> 0 < h >>> 0 ? h : k ) : 357913941; do if ( l ) if ( l >>> 0 > 357913941 ) {

				k = ra( 8 ) | 0; Yk( k, 9789 ); f[ k >> 2 ] = 3704; va( k | 0, 856, 80 );

			} else {

				m = bj( l * 12 | 0 ) | 0; break;

			} else m = 0; while ( 0 );k = m + ( g * 12 | 0 ) | 0; f[ k >> 2 ] = f[ b >> 2 ]; f[ k + 4 >> 2 ] = f[ b + 4 >> 2 ]; f[ k + 8 >> 2 ] = f[ b + 8 >> 2 ]; b = k + ( ( ( e | 0 ) / - 12 | 0 ) * 12 | 0 ) | 0; if ( ( e | 0 ) > 0 )ge( b | 0, d | 0, e | 0 ) | 0; f[ a >> 2 ] = b; f[ c >> 2 ] = k + 12; f[ i >> 2 ] = m + ( l * 12 | 0 ); if ( ! d ) return; dn( d ); return;

		}
		function Ya( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0; b = u; u = u + 16 | 0; c = b; do if ( a >>> 0 < 245 ) {

				d = a >>> 0 < 11 ? 16 : a + 11 & - 8; e = d >>> 3; g = f[ 3220 ] | 0; h = g >>> e; if ( h & 3 | 0 ) {

					i = ( h & 1 ^ 1 ) + e | 0; j = 12920 + ( i << 1 << 2 ) | 0; k = j + 8 | 0; l = f[ k >> 2 ] | 0; m = l + 8 | 0; n = f[ m >> 2 ] | 0; if ( ( n | 0 ) == ( j | 0 ) )f[ 3220 ] = g & ~ ( 1 << i ); else {

						f[ n + 12 >> 2 ] = j; f[ k >> 2 ] = n;

					}n = i << 3; f[ l + 4 >> 2 ] = n | 3; i = l + n + 4 | 0; f[ i >> 2 ] = f[ i >> 2 ] | 1; o = m; u = b; return o | 0;

				}m = f[ 3222 ] | 0; if ( d >>> 0 > m >>> 0 ) {

					if ( h | 0 ) {

						i = 2 << e; n = h << e & ( i | 0 - i ); i = ( n & 0 - n ) + - 1 | 0; n = i >>> 12 & 16; e = i >>> n; i = e >>> 5 & 8; h = e >>> i; e = h >>> 2 & 4; l = h >>> e; h = l >>> 1 & 2; k = l >>> h; l = k >>> 1 & 1; j = ( i | n | e | h | l ) + ( k >>> l ) | 0; l = 12920 + ( j << 1 << 2 ) | 0; k = l + 8 | 0; h = f[ k >> 2 ] | 0; e = h + 8 | 0; n = f[ e >> 2 ] | 0; if ( ( n | 0 ) == ( l | 0 ) ) {

							i = g & ~ ( 1 << j ); f[ 3220 ] = i; p = i;

						} else {

							f[ n + 12 >> 2 ] = l; f[ k >> 2 ] = n; p = g;

						}n = j << 3; j = n - d | 0; f[ h + 4 >> 2 ] = d | 3; k = h + d | 0; f[ k + 4 >> 2 ] = j | 1; f[ h + n >> 2 ] = j; if ( m | 0 ) {

							n = f[ 3225 ] | 0; h = m >>> 3; l = 12920 + ( h << 1 << 2 ) | 0; i = 1 << h; if ( ! ( p & i ) ) {

								f[ 3220 ] = p | i; q = l; r = l + 8 | 0;

							} else {

								i = l + 8 | 0; q = f[ i >> 2 ] | 0; r = i;

							}f[ r >> 2 ] = n; f[ q + 12 >> 2 ] = n; f[ n + 8 >> 2 ] = q; f[ n + 12 >> 2 ] = l;

						}f[ 3222 ] = j; f[ 3225 ] = k; o = e; u = b; return o | 0;

					}e = f[ 3221 ] | 0; if ( e ) {

						k = ( e & 0 - e ) + - 1 | 0; j = k >>> 12 & 16; l = k >>> j; k = l >>> 5 & 8; n = l >>> k; l = n >>> 2 & 4; i = n >>> l; n = i >>> 1 & 2; h = i >>> n; i = h >>> 1 & 1; s = f[ 13184 + ( ( k | j | l | n | i ) + ( h >>> i ) << 2 ) >> 2 ] | 0; i = ( f[ s + 4 >> 2 ] & - 8 ) - d | 0; h = f[ s + 16 + ( ( ( f[ s + 16 >> 2 ] | 0 ) == 0 & 1 ) << 2 ) >> 2 ] | 0; if ( ! h ) {

							t = s; v = i;

						} else {

							n = s; s = i; i = h; while ( 1 ) {

								h = ( f[ i + 4 >> 2 ] & - 8 ) - d | 0; l = h >>> 0 < s >>> 0; j = l ? h : s; h = l ? i : n; i = f[ i + 16 + ( ( ( f[ i + 16 >> 2 ] | 0 ) == 0 & 1 ) << 2 ) >> 2 ] | 0; if ( ! i ) {

									t = h; v = j; break;

								} else {

									n = h; s = j;

								}

							}

						}s = t + d | 0; if ( s >>> 0 > t >>> 0 ) {

							n = f[ t + 24 >> 2 ] | 0; i = f[ t + 12 >> 2 ] | 0; do if ( ( i | 0 ) == ( t | 0 ) ) {

								j = t + 20 | 0; h = f[ j >> 2 ] | 0; if ( ! h ) {

									l = t + 16 | 0; k = f[ l >> 2 ] | 0; if ( ! k ) {

										w = 0; break;

									} else {

										x = k; y = l;

									}

								} else {

									x = h; y = j;

								} while ( 1 ) {

									j = x + 20 | 0; h = f[ j >> 2 ] | 0; if ( h | 0 ) {

										x = h; y = j; continue;

									}j = x + 16 | 0; h = f[ j >> 2 ] | 0; if ( ! h ) break; else {

										x = h; y = j;

									}

								}f[ y >> 2 ] = 0; w = x;

							} else {

								j = f[ t + 8 >> 2 ] | 0; f[ j + 12 >> 2 ] = i; f[ i + 8 >> 2 ] = j; w = i;

							} while ( 0 );do if ( n | 0 ) {

								i = f[ t + 28 >> 2 ] | 0; j = 13184 + ( i << 2 ) | 0; if ( ( t | 0 ) == ( f[ j >> 2 ] | 0 ) ) {

									f[ j >> 2 ] = w; if ( ! w ) {

										f[ 3221 ] = e & ~ ( 1 << i ); break;

									}

								} else {

									f[ n + 16 + ( ( ( f[ n + 16 >> 2 ] | 0 ) != ( t | 0 ) & 1 ) << 2 ) >> 2 ] = w; if ( ! w ) break;

								}f[ w + 24 >> 2 ] = n; i = f[ t + 16 >> 2 ] | 0; if ( i | 0 ) {

									f[ w + 16 >> 2 ] = i; f[ i + 24 >> 2 ] = w;

								}i = f[ t + 20 >> 2 ] | 0; if ( i | 0 ) {

									f[ w + 20 >> 2 ] = i; f[ i + 24 >> 2 ] = w;

								}

							} while ( 0 );if ( v >>> 0 < 16 ) {

								n = v + d | 0; f[ t + 4 >> 2 ] = n | 3; e = t + n + 4 | 0; f[ e >> 2 ] = f[ e >> 2 ] | 1;

							} else {

								f[ t + 4 >> 2 ] = d | 3; f[ s + 4 >> 2 ] = v | 1; f[ s + v >> 2 ] = v; if ( m | 0 ) {

									e = f[ 3225 ] | 0; n = m >>> 3; i = 12920 + ( n << 1 << 2 ) | 0; j = 1 << n; if ( ! ( g & j ) ) {

										f[ 3220 ] = g | j; z = i; A = i + 8 | 0;

									} else {

										j = i + 8 | 0; z = f[ j >> 2 ] | 0; A = j;

									}f[ A >> 2 ] = e; f[ z + 12 >> 2 ] = e; f[ e + 8 >> 2 ] = z; f[ e + 12 >> 2 ] = i;

								}f[ 3222 ] = v; f[ 3225 ] = s;

							}o = t + 8 | 0; u = b; return o | 0;

						} else B = d;

					} else B = d;

				} else B = d;

			} else if ( a >>> 0 <= 4294967231 ) {

				i = a + 11 | 0; e = i & - 8; j = f[ 3221 ] | 0; if ( j ) {

					n = 0 - e | 0; h = i >>> 8; if ( h ) if ( e >>> 0 > 16777215 )C = 31; else {

						i = ( h + 1048320 | 0 ) >>> 16 & 8; l = h << i; h = ( l + 520192 | 0 ) >>> 16 & 4; k = l << h; l = ( k + 245760 | 0 ) >>> 16 & 2; D = 14 - ( h | i | l ) + ( k << l >>> 15 ) | 0; C = e >>> ( D + 7 | 0 ) & 1 | D << 1;

					} else C = 0; D = f[ 13184 + ( C << 2 ) >> 2 ] | 0; a:do if ( ! D ) {

						E = 0; F = 0; G = n; H = 57;

					} else {

						l = 0; k = n; i = D; h = e << ( ( C | 0 ) == 31 ? 0 : 25 - ( C >>> 1 ) | 0 ); I = 0; while ( 1 ) {

							J = ( f[ i + 4 >> 2 ] & - 8 ) - e | 0; if ( J >>> 0 < k >>> 0 ) if ( ! J ) {

								K = 0; L = i; M = i; H = 61; break a;

							} else {

								N = i; O = J;

							} else {

								N = l; O = k;

							}J = f[ i + 20 >> 2 ] | 0; i = f[ i + 16 + ( h >>> 31 << 2 ) >> 2 ] | 0; P = ( J | 0 ) == 0 | ( J | 0 ) == ( i | 0 ) ? I : J; J = ( i | 0 ) == 0; if ( J ) {

								E = P; F = N; G = O; H = 57; break;

							} else {

								l = N; k = O; h = h << ( ( J ^ 1 ) & 1 ); I = P;

							}

						}

					} while ( 0 );if ( ( H | 0 ) == 57 ) {

						if ( ( E | 0 ) == 0 & ( F | 0 ) == 0 ) {

							D = 2 << C; n = j & ( D | 0 - D ); if ( ! n ) {

								B = e; break;

							}D = ( n & 0 - n ) + - 1 | 0; n = D >>> 12 & 16; d = D >>> n; D = d >>> 5 & 8; s = d >>> D; d = s >>> 2 & 4; g = s >>> d; s = g >>> 1 & 2; m = g >>> s; g = m >>> 1 & 1; Q = 0; R = f[ 13184 + ( ( D | n | d | s | g ) + ( m >>> g ) << 2 ) >> 2 ] | 0;

						} else {

							Q = F; R = E;

						} if ( ! R ) {

							S = Q; T = G;

						} else {

							K = G; L = R; M = Q; H = 61;

						}

					} if ( ( H | 0 ) == 61 ) while ( 1 ) {

						H = 0; g = ( f[ L + 4 >> 2 ] & - 8 ) - e | 0; m = g >>> 0 < K >>> 0; s = m ? g : K; g = m ? L : M; L = f[ L + 16 + ( ( ( f[ L + 16 >> 2 ] | 0 ) == 0 & 1 ) << 2 ) >> 2 ] | 0; if ( ! L ) {

							S = g; T = s; break;

						} else {

							K = s; M = g; H = 61;

						}

					} if ( ( S | 0 ) != 0 ? T >>> 0 < ( ( f[ 3222 ] | 0 ) - e | 0 ) >>> 0 : 0 ) {

						g = S + e | 0; if ( g >>> 0 <= S >>> 0 ) {

							o = 0; u = b; return o | 0;

						}s = f[ S + 24 >> 2 ] | 0; m = f[ S + 12 >> 2 ] | 0; do if ( ( m | 0 ) == ( S | 0 ) ) {

							d = S + 20 | 0; n = f[ d >> 2 ] | 0; if ( ! n ) {

								D = S + 16 | 0; I = f[ D >> 2 ] | 0; if ( ! I ) {

									U = 0; break;

								} else {

									V = I; W = D;

								}

							} else {

								V = n; W = d;

							} while ( 1 ) {

								d = V + 20 | 0; n = f[ d >> 2 ] | 0; if ( n | 0 ) {

									V = n; W = d; continue;

								}d = V + 16 | 0; n = f[ d >> 2 ] | 0; if ( ! n ) break; else {

									V = n; W = d;

								}

							}f[ W >> 2 ] = 0; U = V;

						} else {

							d = f[ S + 8 >> 2 ] | 0; f[ d + 12 >> 2 ] = m; f[ m + 8 >> 2 ] = d; U = m;

						} while ( 0 );do if ( s ) {

							m = f[ S + 28 >> 2 ] | 0; d = 13184 + ( m << 2 ) | 0; if ( ( S | 0 ) == ( f[ d >> 2 ] | 0 ) ) {

								f[ d >> 2 ] = U; if ( ! U ) {

									d = j & ~ ( 1 << m ); f[ 3221 ] = d; X = d; break;

								}

							} else {

								f[ s + 16 + ( ( ( f[ s + 16 >> 2 ] | 0 ) != ( S | 0 ) & 1 ) << 2 ) >> 2 ] = U; if ( ! U ) {

									X = j; break;

								}

							}f[ U + 24 >> 2 ] = s; d = f[ S + 16 >> 2 ] | 0; if ( d | 0 ) {

								f[ U + 16 >> 2 ] = d; f[ d + 24 >> 2 ] = U;

							}d = f[ S + 20 >> 2 ] | 0; if ( d ) {

								f[ U + 20 >> 2 ] = d; f[ d + 24 >> 2 ] = U; X = j;

							} else X = j;

						} else X = j; while ( 0 );do if ( T >>> 0 >= 16 ) {

							f[ S + 4 >> 2 ] = e | 3; f[ g + 4 >> 2 ] = T | 1; f[ g + T >> 2 ] = T; j = T >>> 3; if ( T >>> 0 < 256 ) {

								s = 12920 + ( j << 1 << 2 ) | 0; d = f[ 3220 ] | 0; m = 1 << j; if ( ! ( d & m ) ) {

									f[ 3220 ] = d | m; Y = s; Z = s + 8 | 0;

								} else {

									m = s + 8 | 0; Y = f[ m >> 2 ] | 0; Z = m;

								}f[ Z >> 2 ] = g; f[ Y + 12 >> 2 ] = g; f[ g + 8 >> 2 ] = Y; f[ g + 12 >> 2 ] = s; break;

							}s = T >>> 8; if ( s ) if ( T >>> 0 > 16777215 )_ = 31; else {

								m = ( s + 1048320 | 0 ) >>> 16 & 8; d = s << m; s = ( d + 520192 | 0 ) >>> 16 & 4; j = d << s; d = ( j + 245760 | 0 ) >>> 16 & 2; n = 14 - ( s | m | d ) + ( j << d >>> 15 ) | 0; _ = T >>> ( n + 7 | 0 ) & 1 | n << 1;

							} else _ = 0; n = 13184 + ( _ << 2 ) | 0; f[ g + 28 >> 2 ] = _; d = g + 16 | 0; f[ d + 4 >> 2 ] = 0; f[ d >> 2 ] = 0; d = 1 << _; if ( ! ( X & d ) ) {

								f[ 3221 ] = X | d; f[ n >> 2 ] = g; f[ g + 24 >> 2 ] = n; f[ g + 12 >> 2 ] = g; f[ g + 8 >> 2 ] = g; break;

							}d = T << ( ( _ | 0 ) == 31 ? 0 : 25 - ( _ >>> 1 ) | 0 ); j = f[ n >> 2 ] | 0; while ( 1 ) {

								if ( ( f[ j + 4 >> 2 ] & - 8 | 0 ) == ( T | 0 ) ) {

									H = 97; break;

								}$ = j + 16 + ( d >>> 31 << 2 ) | 0; n = f[ $ >> 2 ] | 0; if ( ! n ) {

									H = 96; break;

								} else {

									d = d << 1; j = n;

								}

							} if ( ( H | 0 ) == 96 ) {

								f[ $ >> 2 ] = g; f[ g + 24 >> 2 ] = j; f[ g + 12 >> 2 ] = g; f[ g + 8 >> 2 ] = g; break;

							} else if ( ( H | 0 ) == 97 ) {

								d = j + 8 | 0; n = f[ d >> 2 ] | 0; f[ n + 12 >> 2 ] = g; f[ d >> 2 ] = g; f[ g + 8 >> 2 ] = n; f[ g + 12 >> 2 ] = j; f[ g + 24 >> 2 ] = 0; break;

							}

						} else {

							n = T + e | 0; f[ S + 4 >> 2 ] = n | 3; d = S + n + 4 | 0; f[ d >> 2 ] = f[ d >> 2 ] | 1;

						} while ( 0 );o = S + 8 | 0; u = b; return o | 0;

					} else B = e;

				} else B = e;

			} else B = - 1; while ( 0 );S = f[ 3222 ] | 0; if ( S >>> 0 >= B >>> 0 ) {

				T = S - B | 0; $ = f[ 3225 ] | 0; if ( T >>> 0 > 15 ) {

					_ = $ + B | 0; f[ 3225 ] = _; f[ 3222 ] = T; f[ _ + 4 >> 2 ] = T | 1; f[ $ + S >> 2 ] = T; f[ $ + 4 >> 2 ] = B | 3;

				} else {

					f[ 3222 ] = 0; f[ 3225 ] = 0; f[ $ + 4 >> 2 ] = S | 3; T = $ + S + 4 | 0; f[ T >> 2 ] = f[ T >> 2 ] | 1;

				}o = $ + 8 | 0; u = b; return o | 0;

			}$ = f[ 3223 ] | 0; if ( $ >>> 0 > B >>> 0 ) {

				T = $ - B | 0; f[ 3223 ] = T; S = f[ 3226 ] | 0; _ = S + B | 0; f[ 3226 ] = _; f[ _ + 4 >> 2 ] = T | 1; f[ S + 4 >> 2 ] = B | 3; o = S + 8 | 0; u = b; return o | 0;

			} if ( ! ( f[ 3338 ] | 0 ) ) {

				f[ 3340 ] = 4096; f[ 3339 ] = 4096; f[ 3341 ] = - 1; f[ 3342 ] = - 1; f[ 3343 ] = 0; f[ 3331 ] = 0; f[ 3338 ] = c & - 16 ^ 1431655768; aa = 4096;

			} else aa = f[ 3340 ] | 0; c = B + 48 | 0; S = B + 47 | 0; T = aa + S | 0; _ = 0 - aa | 0; aa = T & _; if ( aa >>> 0 <= B >>> 0 ) {

				o = 0; u = b; return o | 0;

			}X = f[ 3330 ] | 0; if ( X | 0 ? ( Y = f[ 3328 ] | 0, Z = Y + aa | 0, Z >>> 0 <= Y >>> 0 | Z >>> 0 > X >>> 0 ) : 0 ) {

				o = 0; u = b; return o | 0;

			}b:do if ( ! ( f[ 3331 ] & 4 ) ) {

				X = f[ 3226 ] | 0; c:do if ( X ) {

					Z = 13328; while ( 1 ) {

						Y = f[ Z >> 2 ] | 0; if ( Y >>> 0 <= X >>> 0 ? ( ba = Z + 4 | 0, ( Y + ( f[ ba >> 2 ] | 0 ) | 0 ) >>> 0 > X >>> 0 ) : 0 ) break; Y = f[ Z + 8 >> 2 ] | 0; if ( ! Y ) {

							H = 118; break c;

						} else Z = Y;

					}j = T - $ & _; if ( j >>> 0 < 2147483647 ) {

						Y = Vh( j | 0 ) | 0; if ( ( Y | 0 ) == ( ( f[ Z >> 2 ] | 0 ) + ( f[ ba >> 2 ] | 0 ) | 0 ) ) if ( ( Y | 0 ) == ( - 1 | 0 ) )ca = j; else {

							da = j; ea = Y; H = 135; break b;

						} else {

							fa = Y; ga = j; H = 126;

						}

					} else ca = 0;

				} else H = 118; while ( 0 );do if ( ( H | 0 ) == 118 ) {

					X = Vh( 0 ) | 0; if ( ( X | 0 ) != ( - 1 | 0 ) ? ( e = X, j = f[ 3339 ] | 0, Y = j + - 1 | 0, U = ( ( Y & e | 0 ) == 0 ? 0 : ( Y + e & 0 - j ) - e | 0 ) + aa | 0, e = f[ 3328 ] | 0, j = U + e | 0, U >>> 0 > B >>> 0 & U >>> 0 < 2147483647 ) : 0 ) {

						Y = f[ 3330 ] | 0; if ( Y | 0 ? j >>> 0 <= e >>> 0 | j >>> 0 > Y >>> 0 : 0 ) {

							ca = 0; break;

						}Y = Vh( U | 0 ) | 0; if ( ( Y | 0 ) == ( X | 0 ) ) {

							da = U; ea = X; H = 135; break b;

						} else {

							fa = Y; ga = U; H = 126;

						}

					} else ca = 0;

				} while ( 0 );do if ( ( H | 0 ) == 126 ) {

					U = 0 - ga | 0; if ( ! ( c >>> 0 > ga >>> 0 & ( ga >>> 0 < 2147483647 & ( fa | 0 ) != ( - 1 | 0 ) ) ) ) if ( ( fa | 0 ) == ( - 1 | 0 ) ) {

						ca = 0; break;

					} else {

						da = ga; ea = fa; H = 135; break b;

					}Y = f[ 3340 ] | 0; X = S - ga + Y & 0 - Y; if ( X >>> 0 >= 2147483647 ) {

						da = ga; ea = fa; H = 135; break b;

					} if ( ( Vh( X | 0 ) | 0 ) == ( - 1 | 0 ) ) {

						Vh( U | 0 ) | 0; ca = 0; break;

					} else {

						da = X + ga | 0; ea = fa; H = 135; break b;

					}

				} while ( 0 );f[ 3331 ] = f[ 3331 ] | 4; ha = ca; H = 133;

			} else {

				ha = 0; H = 133;

			} while ( 0 );if ( ( ( H | 0 ) == 133 ? aa >>> 0 < 2147483647 : 0 ) ? ( ca = Vh( aa | 0 ) | 0, aa = Vh( 0 ) | 0, fa = aa - ca | 0, ga = fa >>> 0 > ( B + 40 | 0 ) >>> 0, ! ( ( ca | 0 ) == ( - 1 | 0 ) | ga ^ 1 | ca >>> 0 < aa >>> 0 & ( ( ca | 0 ) != ( - 1 | 0 ) & ( aa | 0 ) != ( - 1 | 0 ) ) ^ 1 ) ) : 0 ) {

				da = ga ? fa : ha; ea = ca; H = 135;

			} if ( ( H | 0 ) == 135 ) {

				ca = ( f[ 3328 ] | 0 ) + da | 0; f[ 3328 ] = ca; if ( ca >>> 0 > ( f[ 3329 ] | 0 ) >>> 0 )f[ 3329 ] = ca; ca = f[ 3226 ] | 0; do if ( ca ) {

					ha = 13328; while ( 1 ) {

						ia = f[ ha >> 2 ] | 0; ja = ha + 4 | 0; ka = f[ ja >> 2 ] | 0; if ( ( ea | 0 ) == ( ia + ka | 0 ) ) {

							H = 143; break;

						}fa = f[ ha + 8 >> 2 ] | 0; if ( ! fa ) break; else ha = fa;

					} if ( ( ( H | 0 ) == 143 ? ( f[ ha + 12 >> 2 ] & 8 | 0 ) == 0 : 0 ) ? ea >>> 0 > ca >>> 0 & ia >>> 0 <= ca >>> 0 : 0 ) {

						f[ ja >> 2 ] = ka + da; fa = ( f[ 3223 ] | 0 ) + da | 0; ga = ca + 8 | 0; aa = ( ga & 7 | 0 ) == 0 ? 0 : 0 - ga & 7; ga = ca + aa | 0; S = fa - aa | 0; f[ 3226 ] = ga; f[ 3223 ] = S; f[ ga + 4 >> 2 ] = S | 1; f[ ca + fa + 4 >> 2 ] = 40; f[ 3227 ] = f[ 3342 ]; break;

					} if ( ea >>> 0 < ( f[ 3224 ] | 0 ) >>> 0 )f[ 3224 ] = ea; fa = ea + da | 0; S = 13328; while ( 1 ) {

						if ( ( f[ S >> 2 ] | 0 ) == ( fa | 0 ) ) {

							H = 151; break;

						}ga = f[ S + 8 >> 2 ] | 0; if ( ! ga ) {

							la = 13328; break;

						} else S = ga;

					} if ( ( H | 0 ) == 151 ) if ( ! ( f[ S + 12 >> 2 ] & 8 ) ) {

						f[ S >> 2 ] = ea; ha = S + 4 | 0; f[ ha >> 2 ] = ( f[ ha >> 2 ] | 0 ) + da; ha = ea + 8 | 0; ga = ea + ( ( ha & 7 | 0 ) == 0 ? 0 : 0 - ha & 7 ) | 0; ha = fa + 8 | 0; aa = fa + ( ( ha & 7 | 0 ) == 0 ? 0 : 0 - ha & 7 ) | 0; ha = ga + B | 0; c = aa - ga - B | 0; f[ ga + 4 >> 2 ] = B | 3; do if ( ( ca | 0 ) != ( aa | 0 ) ) {

							if ( ( f[ 3225 ] | 0 ) == ( aa | 0 ) ) {

								ba = ( f[ 3222 ] | 0 ) + c | 0; f[ 3222 ] = ba; f[ 3225 ] = ha; f[ ha + 4 >> 2 ] = ba | 1; f[ ha + ba >> 2 ] = ba; break;

							}ba = f[ aa + 4 >> 2 ] | 0; if ( ( ba & 3 | 0 ) == 1 ) {

								_ = ba & - 8; $ = ba >>> 3; d:do if ( ba >>> 0 < 256 ) {

									T = f[ aa + 8 >> 2 ] | 0; X = f[ aa + 12 >> 2 ] | 0; if ( ( X | 0 ) == ( T | 0 ) ) {

										f[ 3220 ] = f[ 3220 ] & ~ ( 1 << $ ); break;

									} else {

										f[ T + 12 >> 2 ] = X; f[ X + 8 >> 2 ] = T; break;

									}

								} else {

									T = f[ aa + 24 >> 2 ] | 0; X = f[ aa + 12 >> 2 ] | 0; do if ( ( X | 0 ) == ( aa | 0 ) ) {

										U = aa + 16 | 0; Y = U + 4 | 0; j = f[ Y >> 2 ] | 0; if ( ! j ) {

											e = f[ U >> 2 ] | 0; if ( ! e ) {

												ma = 0; break;

											} else {

												na = e; oa = U;

											}

										} else {

											na = j; oa = Y;

										} while ( 1 ) {

											Y = na + 20 | 0; j = f[ Y >> 2 ] | 0; if ( j | 0 ) {

												na = j; oa = Y; continue;

											}Y = na + 16 | 0; j = f[ Y >> 2 ] | 0; if ( ! j ) break; else {

												na = j; oa = Y;

											}

										}f[ oa >> 2 ] = 0; ma = na;

									} else {

										Y = f[ aa + 8 >> 2 ] | 0; f[ Y + 12 >> 2 ] = X; f[ X + 8 >> 2 ] = Y; ma = X;

									} while ( 0 );if ( ! T ) break; X = f[ aa + 28 >> 2 ] | 0; Y = 13184 + ( X << 2 ) | 0; do if ( ( f[ Y >> 2 ] | 0 ) != ( aa | 0 ) ) {

										f[ T + 16 + ( ( ( f[ T + 16 >> 2 ] | 0 ) != ( aa | 0 ) & 1 ) << 2 ) >> 2 ] = ma; if ( ! ma ) break d;

									} else {

										f[ Y >> 2 ] = ma; if ( ma | 0 ) break; f[ 3221 ] = f[ 3221 ] & ~ ( 1 << X ); break d;

									} while ( 0 );f[ ma + 24 >> 2 ] = T; X = aa + 16 | 0; Y = f[ X >> 2 ] | 0; if ( Y | 0 ) {

										f[ ma + 16 >> 2 ] = Y; f[ Y + 24 >> 2 ] = ma;

									}Y = f[ X + 4 >> 2 ] | 0; if ( ! Y ) break; f[ ma + 20 >> 2 ] = Y; f[ Y + 24 >> 2 ] = ma;

								} while ( 0 );pa = aa + _ | 0; qa = _ + c | 0;

							} else {

								pa = aa; qa = c;

							}$ = pa + 4 | 0; f[ $ >> 2 ] = f[ $ >> 2 ] & - 2; f[ ha + 4 >> 2 ] = qa | 1; f[ ha + qa >> 2 ] = qa; $ = qa >>> 3; if ( qa >>> 0 < 256 ) {

								ba = 12920 + ( $ << 1 << 2 ) | 0; Z = f[ 3220 ] | 0; Y = 1 << $; if ( ! ( Z & Y ) ) {

									f[ 3220 ] = Z | Y; ra = ba; sa = ba + 8 | 0;

								} else {

									Y = ba + 8 | 0; ra = f[ Y >> 2 ] | 0; sa = Y;

								}f[ sa >> 2 ] = ha; f[ ra + 12 >> 2 ] = ha; f[ ha + 8 >> 2 ] = ra; f[ ha + 12 >> 2 ] = ba; break;

							}ba = qa >>> 8; do if ( ! ba )ta = 0; else {

								if ( qa >>> 0 > 16777215 ) {

									ta = 31; break;

								}Y = ( ba + 1048320 | 0 ) >>> 16 & 8; Z = ba << Y; $ = ( Z + 520192 | 0 ) >>> 16 & 4; X = Z << $; Z = ( X + 245760 | 0 ) >>> 16 & 2; j = 14 - ( $ | Y | Z ) + ( X << Z >>> 15 ) | 0; ta = qa >>> ( j + 7 | 0 ) & 1 | j << 1;

							} while ( 0 );ba = 13184 + ( ta << 2 ) | 0; f[ ha + 28 >> 2 ] = ta; _ = ha + 16 | 0; f[ _ + 4 >> 2 ] = 0; f[ _ >> 2 ] = 0; _ = f[ 3221 ] | 0; j = 1 << ta; if ( ! ( _ & j ) ) {

								f[ 3221 ] = _ | j; f[ ba >> 2 ] = ha; f[ ha + 24 >> 2 ] = ba; f[ ha + 12 >> 2 ] = ha; f[ ha + 8 >> 2 ] = ha; break;

							}j = qa << ( ( ta | 0 ) == 31 ? 0 : 25 - ( ta >>> 1 ) | 0 ); _ = f[ ba >> 2 ] | 0; while ( 1 ) {

								if ( ( f[ _ + 4 >> 2 ] & - 8 | 0 ) == ( qa | 0 ) ) {

									H = 192; break;

								}ua = _ + 16 + ( j >>> 31 << 2 ) | 0; ba = f[ ua >> 2 ] | 0; if ( ! ba ) {

									H = 191; break;

								} else {

									j = j << 1; _ = ba;

								}

							} if ( ( H | 0 ) == 191 ) {

								f[ ua >> 2 ] = ha; f[ ha + 24 >> 2 ] = _; f[ ha + 12 >> 2 ] = ha; f[ ha + 8 >> 2 ] = ha; break;

							} else if ( ( H | 0 ) == 192 ) {

								j = _ + 8 | 0; ba = f[ j >> 2 ] | 0; f[ ba + 12 >> 2 ] = ha; f[ j >> 2 ] = ha; f[ ha + 8 >> 2 ] = ba; f[ ha + 12 >> 2 ] = _; f[ ha + 24 >> 2 ] = 0; break;

							}

						} else {

							ba = ( f[ 3223 ] | 0 ) + c | 0; f[ 3223 ] = ba; f[ 3226 ] = ha; f[ ha + 4 >> 2 ] = ba | 1;

						} while ( 0 );o = ga + 8 | 0; u = b; return o | 0;

					} else la = 13328; while ( 1 ) {

						ha = f[ la >> 2 ] | 0; if ( ha >>> 0 <= ca >>> 0 ? ( va = ha + ( f[ la + 4 >> 2 ] | 0 ) | 0, va >>> 0 > ca >>> 0 ) : 0 ) break; la = f[ la + 8 >> 2 ] | 0;

					}ga = va + - 47 | 0; ha = ga + 8 | 0; c = ga + ( ( ha & 7 | 0 ) == 0 ? 0 : 0 - ha & 7 ) | 0; ha = ca + 16 | 0; ga = c >>> 0 < ha >>> 0 ? ca : c; c = ga + 8 | 0; aa = da + - 40 | 0; fa = ea + 8 | 0; S = ( fa & 7 | 0 ) == 0 ? 0 : 0 - fa & 7; fa = ea + S | 0; ba = aa - S | 0; f[ 3226 ] = fa; f[ 3223 ] = ba; f[ fa + 4 >> 2 ] = ba | 1; f[ ea + aa + 4 >> 2 ] = 40; f[ 3227 ] = f[ 3342 ]; aa = ga + 4 | 0; f[ aa >> 2 ] = 27; f[ c >> 2 ] = f[ 3332 ]; f[ c + 4 >> 2 ] = f[ 3333 ]; f[ c + 8 >> 2 ] = f[ 3334 ]; f[ c + 12 >> 2 ] = f[ 3335 ]; f[ 3332 ] = ea; f[ 3333 ] = da; f[ 3335 ] = 0; f[ 3334 ] = c; c = ga + 24 | 0; do {

						ba = c; c = c + 4 | 0; f[ c >> 2 ] = 7;

					} while ( ( ba + 8 | 0 ) >>> 0 < va >>> 0 );if ( ( ga | 0 ) != ( ca | 0 ) ) {

						c = ga - ca | 0; f[ aa >> 2 ] = f[ aa >> 2 ] & - 2; f[ ca + 4 >> 2 ] = c | 1; f[ ga >> 2 ] = c; ba = c >>> 3; if ( c >>> 0 < 256 ) {

							fa = 12920 + ( ba << 1 << 2 ) | 0; S = f[ 3220 ] | 0; j = 1 << ba; if ( ! ( S & j ) ) {

								f[ 3220 ] = S | j; wa = fa; xa = fa + 8 | 0;

							} else {

								j = fa + 8 | 0; wa = f[ j >> 2 ] | 0; xa = j;

							}f[ xa >> 2 ] = ca; f[ wa + 12 >> 2 ] = ca; f[ ca + 8 >> 2 ] = wa; f[ ca + 12 >> 2 ] = fa; break;

						}fa = c >>> 8; if ( fa ) if ( c >>> 0 > 16777215 )ya = 31; else {

							j = ( fa + 1048320 | 0 ) >>> 16 & 8; S = fa << j; fa = ( S + 520192 | 0 ) >>> 16 & 4; ba = S << fa; S = ( ba + 245760 | 0 ) >>> 16 & 2; Z = 14 - ( fa | j | S ) + ( ba << S >>> 15 ) | 0; ya = c >>> ( Z + 7 | 0 ) & 1 | Z << 1;

						} else ya = 0; Z = 13184 + ( ya << 2 ) | 0; f[ ca + 28 >> 2 ] = ya; f[ ca + 20 >> 2 ] = 0; f[ ha >> 2 ] = 0; S = f[ 3221 ] | 0; ba = 1 << ya; if ( ! ( S & ba ) ) {

							f[ 3221 ] = S | ba; f[ Z >> 2 ] = ca; f[ ca + 24 >> 2 ] = Z; f[ ca + 12 >> 2 ] = ca; f[ ca + 8 >> 2 ] = ca; break;

						}ba = c << ( ( ya | 0 ) == 31 ? 0 : 25 - ( ya >>> 1 ) | 0 ); S = f[ Z >> 2 ] | 0; while ( 1 ) {

							if ( ( f[ S + 4 >> 2 ] & - 8 | 0 ) == ( c | 0 ) ) {

								H = 213; break;

							}za = S + 16 + ( ba >>> 31 << 2 ) | 0; Z = f[ za >> 2 ] | 0; if ( ! Z ) {

								H = 212; break;

							} else {

								ba = ba << 1; S = Z;

							}

						} if ( ( H | 0 ) == 212 ) {

							f[ za >> 2 ] = ca; f[ ca + 24 >> 2 ] = S; f[ ca + 12 >> 2 ] = ca; f[ ca + 8 >> 2 ] = ca; break;

						} else if ( ( H | 0 ) == 213 ) {

							ba = S + 8 | 0; c = f[ ba >> 2 ] | 0; f[ c + 12 >> 2 ] = ca; f[ ba >> 2 ] = ca; f[ ca + 8 >> 2 ] = c; f[ ca + 12 >> 2 ] = S; f[ ca + 24 >> 2 ] = 0; break;

						}

					}

				} else {

					c = f[ 3224 ] | 0; if ( ( c | 0 ) == 0 | ea >>> 0 < c >>> 0 )f[ 3224 ] = ea; f[ 3332 ] = ea; f[ 3333 ] = da; f[ 3335 ] = 0; f[ 3229 ] = f[ 3338 ]; f[ 3228 ] = - 1; f[ 3233 ] = 12920; f[ 3232 ] = 12920; f[ 3235 ] = 12928; f[ 3234 ] = 12928; f[ 3237 ] = 12936; f[ 3236 ] = 12936; f[ 3239 ] = 12944; f[ 3238 ] = 12944; f[ 3241 ] = 12952; f[ 3240 ] = 12952; f[ 3243 ] = 12960; f[ 3242 ] = 12960; f[ 3245 ] = 12968; f[ 3244 ] = 12968; f[ 3247 ] = 12976; f[ 3246 ] = 12976; f[ 3249 ] = 12984; f[ 3248 ] = 12984; f[ 3251 ] = 12992; f[ 3250 ] = 12992; f[ 3253 ] = 13e3; f[ 3252 ] = 13e3; f[ 3255 ] = 13008; f[ 3254 ] = 13008; f[ 3257 ] = 13016; f[ 3256 ] = 13016; f[ 3259 ] = 13024; f[ 3258 ] = 13024; f[ 3261 ] = 13032; f[ 3260 ] = 13032; f[ 3263 ] = 13040; f[ 3262 ] = 13040; f[ 3265 ] = 13048; f[ 3264 ] = 13048; f[ 3267 ] = 13056; f[ 3266 ] = 13056; f[ 3269 ] = 13064; f[ 3268 ] = 13064; f[ 3271 ] = 13072; f[ 3270 ] = 13072; f[ 3273 ] = 13080; f[ 3272 ] = 13080; f[ 3275 ] = 13088; f[ 3274 ] = 13088; f[ 3277 ] = 13096; f[ 3276 ] = 13096; f[ 3279 ] = 13104; f[ 3278 ] = 13104; f[ 3281 ] = 13112; f[ 3280 ] = 13112; f[ 3283 ] = 13120; f[ 3282 ] = 13120; f[ 3285 ] = 13128; f[ 3284 ] = 13128; f[ 3287 ] = 13136; f[ 3286 ] = 13136; f[ 3289 ] = 13144; f[ 3288 ] = 13144; f[ 3291 ] = 13152; f[ 3290 ] = 13152; f[ 3293 ] = 13160; f[ 3292 ] = 13160; f[ 3295 ] = 13168; f[ 3294 ] = 13168; c = da + - 40 | 0; ba = ea + 8 | 0; ha = ( ba & 7 | 0 ) == 0 ? 0 : 0 - ba & 7; ba = ea + ha | 0; ga = c - ha | 0; f[ 3226 ] = ba; f[ 3223 ] = ga; f[ ba + 4 >> 2 ] = ga | 1; f[ ea + c + 4 >> 2 ] = 40; f[ 3227 ] = f[ 3342 ];

				} while ( 0 );ea = f[ 3223 ] | 0; if ( ea >>> 0 > B >>> 0 ) {

					da = ea - B | 0; f[ 3223 ] = da; ea = f[ 3226 ] | 0; ca = ea + B | 0; f[ 3226 ] = ca; f[ ca + 4 >> 2 ] = da | 1; f[ ea + 4 >> 2 ] = B | 3; o = ea + 8 | 0; u = b; return o | 0;

				}

			}ea = ln() | 0; f[ ea >> 2 ] = 12; o = 0; u = b; return o | 0;

		} function Za( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0, Aa = 0, Ba = 0, Ca = 0, Da = 0, Ea = 0, Fa = 0, Ga = 0, Ha = 0, Ia = 0, Ja = 0, Ka = 0, La = 0, Ma = 0, Na = 0, Oa = 0, Pa = 0, Qa = 0, Ra = 0, Sa = 0, Ta = 0, Ua = 0, Va = 0, Wa = 0; d = u; u = u + 80 | 0; e = d + 56 | 0; g = d + 40 | 0; h = d + 16 | 0; i = d + 4 | 0; j = d + 36 | 0; k = d; f[ g >> 2 ] = 0; l = g + 4 | 0; f[ l >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; f[ h >> 2 ] = 0; f[ h + 4 >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; f[ h + 12 >> 2 ] = 0; n[ h + 16 >> 2 ] = $( 1.0 ); f[ i >> 2 ] = 0; m = i + 4 | 0; f[ m >> 2 ] = 0; f[ i + 8 >> 2 ] = 0; o = ( f[ a + 212 >> 2 ] | 0 ) == ( f[ a + 216 >> 2 ] | 0 ); p = a + 120 | 0; q = f[ a + 124 >> 2 ] | 0; a:do if ( ( c | 0 ) > 0 ) {

				r = a + 224 | 0; s = a + 396 | 0; t = a + 392 | 0; v = a + 8 | 0; w = g + 8 | 0; x = a + 36 | 0; y = a + 40 | 0; z = c + - 1 | 0; A = a + 420 | 0; B = a + 408 | 0; C = h + 4 | 0; D = a + 380 | 0; E = i + 8 | 0; F = 0; while ( 1 ) {

					G = F + 1 | 0; H = f[ s >> 2 ] | 0; b:do if ( ( H | 0 ) == - 1 ) {

						f[ t >> 2 ] = 7; I = 89;

					} else {

						J = ( f[ A >> 2 ] | 0 ) + ( H << 2 ) | 0; K = f[ J >> 2 ] | 0; L = K + - 1 | 0; f[ J >> 2 ] = L; if ( ( K | 0 ) < 1 ) {

							M = - 1; I = 174; break a;

						}K = f[ ( f[ ( f[ B >> 2 ] | 0 ) + ( ( f[ s >> 2 ] | 0 ) * 12 | 0 ) >> 2 ] | 0 ) + ( L << 2 ) >> 2 ] | 0; L = f[ 2504 + ( K << 2 ) >> 2 ] | 0; f[ t >> 2 ] = L; if ( ! K ) {

							J = f[ l >> 2 ] | 0; if ( ( f[ g >> 2 ] | 0 ) == ( J | 0 ) ) {

								M = - 1; I = 174; break a;

							}N = J + - 4 | 0; O = f[ N >> 2 ] | 0; P = f[ v >> 2 ] | 0; Q = ( O | 0 ) == - 1; R = O + 1 | 0; if ( ! Q ? ( S = ( ( R >>> 0 ) % 3 | 0 | 0 ) == 0 ? O + - 2 | 0 : R, ( S | 0 ) != - 1 ) : 0 )T = f[ ( f[ P >> 2 ] | 0 ) + ( S << 2 ) >> 2 ] | 0; else T = - 1; S = f[ P + 24 >> 2 ] | 0; R = f[ S + ( T << 2 ) >> 2 ] | 0; U = R + 1 | 0; V = S; if ( ( R | 0 ) == - 1 )W = - 1; else W = ( ( U >>> 0 ) % 3 | 0 | 0 ) == 0 ? R + - 2 | 0 : U; U = F * 3 | 0; R = U + 1 | 0; X = f[ P + 12 >> 2 ] | 0; f[ X + ( O << 2 ) >> 2 ] = R; f[ X + ( R << 2 ) >> 2 ] = O; Y = U + 2 | 0; f[ X + ( W << 2 ) >> 2 ] = Y; f[ X + ( Y << 2 ) >> 2 ] = W; X = f[ P >> 2 ] | 0; f[ X + ( U << 2 ) >> 2 ] = T; Z = W + 1 | 0; if ( ( W | 0 ) != - 1 ? ( _ = ( ( Z >>> 0 ) % 3 | 0 | 0 ) == 0 ? W + - 2 | 0 : Z, ( _ | 0 ) != - 1 ) : 0 )aa = f[ X + ( _ << 2 ) >> 2 ] | 0; else aa = - 1; f[ X + ( R << 2 ) >> 2 ] = aa; if ( ! Q ? ( Q = ( ( ( O >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + O | 0, ( Q | 0 ) != - 1 ) : 0 ) {

								O = f[ X + ( Q << 2 ) >> 2 ] | 0; f[ X + ( Y << 2 ) >> 2 ] = O; if ( ( O | 0 ) != - 1 )f[ S + ( O << 2 ) >> 2 ] = Y;

							} else f[ X + ( Y << 2 ) >> 2 ] = - 1; if ( ( ( f[ P + 28 >> 2 ] | 0 ) - V >> 2 | 0 ) > ( q | 0 ) ) {

								M = - 1; I = 174; break a;

							}V = ( f[ p >> 2 ] | 0 ) + ( T >>> 5 << 2 ) | 0; f[ V >> 2 ] = f[ V >> 2 ] & ~ ( 1 << ( T & 31 ) ); f[ N >> 2 ] = U; ba = J;

						} else {

							J = ( K | 0 ) == 3; switch ( L | 0 ) {

								case 7: {

									I = 89; break b; break;

								} case 3:case 5: {

									L = f[ l >> 2 ] | 0; if ( ( f[ g >> 2 ] | 0 ) == ( L | 0 ) ) {

										M = - 1; I = 174; break a;

									}K = f[ L + - 4 >> 2 ] | 0; L = F * 3 | 0; U = J ? L : L + 2 | 0; N = L + ( J & 1 ) | 0; V = ( J ? 2 : 1 ) + L | 0; J = f[ v >> 2 ] | 0; P = f[ J + 12 >> 2 ] | 0; f[ P + ( V << 2 ) >> 2 ] = K; f[ P + ( K << 2 ) >> 2 ] = V; P = J + 24 | 0; Y = J + 28 | 0; X = f[ Y >> 2 ] | 0; if ( ( X | 0 ) == ( f[ J + 32 >> 2 ] | 0 ) ) {

										xf( P, 2336 ); ca = f[ Y >> 2 ] | 0;

									} else {

										f[ X >> 2 ] = - 1; J = X + 4 | 0; f[ Y >> 2 ] = J; ca = J;

									}J = ca - ( f[ P >> 2 ] | 0 ) >> 2; P = J + - 1 | 0; Y = f[ v >> 2 ] | 0; X = f[ Y >> 2 ] | 0; f[ X + ( V << 2 ) >> 2 ] = P; if ( J | 0 )f[ ( f[ Y + 24 >> 2 ] | 0 ) + ( P << 2 ) >> 2 ] = V; if ( ( K | 0 ) != - 1 ) {

										V = ( ( ( K >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + K | 0; if ( ( V | 0 ) != - 1 ) {

											P = f[ X + ( V << 2 ) >> 2 ] | 0; f[ X + ( U << 2 ) >> 2 ] = P; if ( ( P | 0 ) != - 1 )f[ ( f[ Y + 24 >> 2 ] | 0 ) + ( P << 2 ) >> 2 ] = U;

										} else f[ X + ( U << 2 ) >> 2 ] = - 1; P = K + 1 | 0; Y = ( ( P >>> 0 ) % 3 | 0 | 0 ) == 0 ? K + - 2 | 0 : P; if ( ( Y | 0 ) == - 1 )da = - 1; else da = f[ X + ( Y << 2 ) >> 2 ] | 0;

									} else {

										f[ X + ( U << 2 ) >> 2 ] = - 1; da = - 1;

									}f[ X + ( N << 2 ) >> 2 ] = da; N = f[ l >> 2 ] | 0; f[ N + - 4 >> 2 ] = L; f[ j >> 2 ] = f[ N + - 4 >> 2 ]; f[ e >> 2 ] = f[ j >> 2 ]; qc( r, e ); I = 108; break b; break;

								} case 1:break; default: {

									M = - 1; I = 174; break a;

								}

							}N = f[ g >> 2 ] | 0; L = f[ l >> 2 ] | 0; if ( ( N | 0 ) == ( L | 0 ) ) {

								M = - 1; I = 174; break a;

							}X = L + - 4 | 0; U = f[ X >> 2 ] | 0; f[ l >> 2 ] = X; Y = f[ C >> 2 ] | 0; c:do if ( Y ) {

								P = Y + - 1 | 0; K = ( P & Y | 0 ) == 0; if ( ! K ) if ( F >>> 0 < Y >>> 0 )ea = F; else ea = ( F >>> 0 ) % ( Y >>> 0 ) | 0; else ea = P & F; V = f[ ( f[ h >> 2 ] | 0 ) + ( ea << 2 ) >> 2 ] | 0; if ( ( V | 0 ) != 0 ? ( J = f[ V >> 2 ] | 0, ( J | 0 ) != 0 ) : 0 ) {

									d:do if ( K ) {

										V = J; while ( 1 ) {

											O = f[ V + 4 >> 2 ] | 0; S = ( O | 0 ) == ( F | 0 ); if ( ! ( S | ( O & P | 0 ) == ( ea | 0 ) ) ) {

												fa = N; ga = X; break c;

											} if ( S ? ( f[ V + 8 >> 2 ] | 0 ) == ( F | 0 ) : 0 ) {

												ha = V; break d;

											}V = f[ V >> 2 ] | 0; if ( ! V ) {

												fa = N; ga = X; break c;

											}

										}

									} else {

										V = J; while ( 1 ) {

											S = f[ V + 4 >> 2 ] | 0; if ( ( S | 0 ) == ( F | 0 ) ) {

												if ( ( f[ V + 8 >> 2 ] | 0 ) == ( F | 0 ) ) {

													ha = V; break d;

												}

											} else {

												if ( S >>> 0 < Y >>> 0 )ia = S; else ia = ( S >>> 0 ) % ( Y >>> 0 ) | 0; if ( ( ia | 0 ) != ( ea | 0 ) ) {

													fa = N; ga = X; break c;

												}

											}V = f[ V >> 2 ] | 0; if ( ! V ) {

												fa = N; ga = X; break c;

											}

										}

									} while ( 0 );J = ha + 12 | 0; if ( ( X | 0 ) == ( f[ w >> 2 ] | 0 ) ) {

										xf( g, J ); fa = f[ g >> 2 ] | 0; ga = f[ l >> 2 ] | 0; break;

									} else {

										f[ X >> 2 ] = f[ J >> 2 ]; f[ l >> 2 ] = L; fa = N; ga = L; break;

									}

								} else {

									fa = N; ga = X;

								}

							} else {

								fa = N; ga = X;

							} while ( 0 );if ( ( fa | 0 ) == ( ga | 0 ) ) {

								M = - 1; I = 174; break a;

							}X = f[ ga + - 4 >> 2 ] | 0; N = F * 3 | 0; L = N + 2 | 0; Y = f[ v >> 2 ] | 0; J = f[ Y + 12 >> 2 ] | 0; f[ J + ( X << 2 ) >> 2 ] = L; f[ J + ( L << 2 ) >> 2 ] = X; P = N + 1 | 0; f[ J + ( U << 2 ) >> 2 ] = P; f[ J + ( P << 2 ) >> 2 ] = U; if ( ( X | 0 ) != - 1 ) {

								K = ( ( ( X >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + X | 0; if ( ( K | 0 ) == - 1 )ja = - 1; else ja = f[ ( f[ Y >> 2 ] | 0 ) + ( K << 2 ) >> 2 ] | 0; K = f[ Y >> 2 ] | 0; f[ K + ( N << 2 ) >> 2 ] = ja; V = X + 1 | 0; S = ( ( V >>> 0 ) % 3 | 0 | 0 ) == 0 ? X + - 2 | 0 : V; if ( ( S | 0 ) == - 1 ) {

									ka = - 1; la = ja; ma = K; na = Y;

								} else {

									ka = f[ K + ( S << 2 ) >> 2 ] | 0; la = ja; ma = K; na = Y;

								}

							} else {

								K = f[ Y >> 2 ] | 0; f[ K + ( N << 2 ) >> 2 ] = - 1; ka = - 1; la = - 1; ma = K; na = Y;

							}f[ ma + ( P << 2 ) >> 2 ] = ka; if ( ( U | 0 ) != - 1 ) {

								P = ( ( ( U >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + U | 0; if ( ( P | 0 ) != - 1 ) {

									K = f[ ma + ( P << 2 ) >> 2 ] | 0; f[ ma + ( L << 2 ) >> 2 ] = K; if ( ( K | 0 ) != - 1 )f[ ( f[ Y + 24 >> 2 ] | 0 ) + ( K << 2 ) >> 2 ] = L;

								} else f[ ma + ( L << 2 ) >> 2 ] = - 1; K = U + 1 | 0; P = ( ( K >>> 0 ) % 3 | 0 | 0 ) == 0 ? U + - 2 | 0 : K; if ( ( P | 0 ) == - 1 ) {

									oa = - 1; pa = - 1;

								} else {

									oa = f[ ma + ( P << 2 ) >> 2 ] | 0; pa = P;

								}

							} else {

								f[ ma + ( L << 2 ) >> 2 ] = - 1; oa = - 1; pa = - 1;

							}f[ e >> 2 ] = oa; L = f[ D >> 2 ] | 0; P = L + ( la << 2 ) | 0; f[ P >> 2 ] = ( f[ P >> 2 ] | 0 ) + ( f[ L + ( oa << 2 ) >> 2 ] | 0 ); L = f[ Y + 24 >> 2 ] | 0; if ( ( la | 0 ) != - 1 )f[ L + ( la << 2 ) >> 2 ] = f[ L + ( f[ e >> 2 ] << 2 ) >> 2 ]; e:do if ( ( pa | 0 ) != - 1 ) {

								Y = f[ na >> 2 ] | 0; P = pa; do {

									f[ Y + ( P << 2 ) >> 2 ] = la; K = P + 1 | 0; S = ( ( K >>> 0 ) % 3 | 0 | 0 ) == 0 ? P + - 2 | 0 : K; if ( ( S | 0 ) == - 1 ) break e; K = f[ J + ( S << 2 ) >> 2 ] | 0; S = K + 1 | 0; if ( ( K | 0 ) == - 1 ) break e; P = ( ( S >>> 0 ) % 3 | 0 | 0 ) == 0 ? K + - 2 | 0 : S;

								} while ( ( P | 0 ) != - 1 );

							} while ( 0 );f[ L + ( f[ e >> 2 ] << 2 ) >> 2 ] = - 1; do if ( o ) {

								J = f[ m >> 2 ] | 0; if ( ( J | 0 ) == ( f[ E >> 2 ] | 0 ) ) {

									xf( i, e ); qa = f[ l >> 2 ] | 0; break;

								} else {

									f[ J >> 2 ] = f[ e >> 2 ]; f[ m >> 2 ] = J + 4; qa = ga; break;

								}

							} else qa = ga; while ( 0 );f[ qa + - 4 >> 2 ] = N; ba = qa;

						}f[ j >> 2 ] = f[ ba + - 4 >> 2 ]; f[ e >> 2 ] = f[ j >> 2 ]; qc( r, e );

					} while ( 0 );if ( ( I | 0 ) == 89 ) {

						I = 0; f[ e >> 2 ] = F * 3; H = f[ v >> 2 ] | 0; L = H + 24 | 0; J = H + 28 | 0; U = f[ J >> 2 ] | 0; if ( ( U | 0 ) == ( f[ H + 32 >> 2 ] | 0 ) ) {

							xf( L, 2336 ); ra = f[ J >> 2 ] | 0;

						} else {

							f[ U >> 2 ] = - 1; H = U + 4 | 0; f[ J >> 2 ] = H; ra = H;

						}H = ra - ( f[ L >> 2 ] | 0 ) >> 2; L = H + - 1 | 0; J = f[ v >> 2 ] | 0; U = f[ e >> 2 ] | 0; P = f[ J >> 2 ] | 0; f[ P + ( U << 2 ) >> 2 ] = L; Y = J + 24 | 0; S = J + 28 | 0; K = f[ S >> 2 ] | 0; if ( ( K | 0 ) == ( f[ J + 32 >> 2 ] | 0 ) ) {

							xf( Y, 2336 ); sa = f[ S >> 2 ] | 0; ta = f[ J >> 2 ] | 0;

						} else {

							f[ K >> 2 ] = - 1; J = K + 4 | 0; f[ S >> 2 ] = J; sa = J; ta = P;

						}f[ ta + ( U + 1 << 2 ) >> 2 ] = ( sa - ( f[ Y >> 2 ] | 0 ) >> 2 ) + - 1; Y = f[ v >> 2 ] | 0; U = ( f[ e >> 2 ] | 0 ) + 2 | 0; P = Y + 24 | 0; J = Y + 28 | 0; S = f[ J >> 2 ] | 0; if ( ( S | 0 ) == ( f[ Y + 32 >> 2 ] | 0 ) ) {

							xf( P, 2336 ); ua = f[ J >> 2 ] | 0;

						} else {

							f[ S >> 2 ] = - 1; K = S + 4 | 0; f[ J >> 2 ] = K; ua = K;

						}f[ ( f[ Y >> 2 ] | 0 ) + ( U << 2 ) >> 2 ] = ( ua - ( f[ P >> 2 ] | 0 ) >> 2 ) + - 1; P = f[ e >> 2 ] | 0; U = f[ ( f[ v >> 2 ] | 0 ) + 24 >> 2 ] | 0; if ( H ) {

							f[ U + ( L << 2 ) >> 2 ] = P; if ( ( H | 0 ) != - 1 ) {

								f[ U + ( H << 2 ) >> 2 ] = ( f[ e >> 2 ] | 0 ) + 1; L = H + 1 | 0; if ( ( L | 0 ) != - 1 ) {

									va = L; I = 102;

								}

							} else {

								va = 0; I = 102;

							}

						} else {

							f[ U + ( H << 2 ) >> 2 ] = P + 1; va = 1; I = 102;

						} if ( ( I | 0 ) == 102 ) {

							I = 0; f[ U + ( va << 2 ) >> 2 ] = ( f[ e >> 2 ] | 0 ) + 2;

						}U = f[ l >> 2 ] | 0; if ( ( U | 0 ) == ( f[ w >> 2 ] | 0 ) ) {

							xf( g, e ); wa = f[ l >> 2 ] | 0;

						} else {

							f[ U >> 2 ] = f[ e >> 2 ]; P = U + 4 | 0; f[ l >> 2 ] = P; wa = P;

						}f[ j >> 2 ] = f[ wa + - 4 >> 2 ]; f[ e >> 2 ] = f[ j >> 2 ]; qc( r, e ); I = 108;

					}f:do if ( ( I | 0 ) == 108 ? ( I = 0, P = c - F + - 1 | 0, U = f[ y >> 2 ] | 0, ( U | 0 ) != ( f[ x >> 2 ] | 0 ) ) : 0 ) {

						H = U; do {

							U = H; L = f[ U + - 8 >> 2 ] | 0; if ( L >>> 0 > P >>> 0 ) {

								M = - 1; I = 174; break a;

							} if ( ( L | 0 ) != ( P | 0 ) ) break f; L = b[ U + - 4 >> 0 ] | 0; Y = f[ U + - 12 >> 2 ] | 0; f[ y >> 2 ] = U + - 12; if ( ( Y | 0 ) < 0 ) {

								M = - 1; I = 174; break a;

							}U = f[ ( f[ l >> 2 ] | 0 ) + - 4 >> 2 ] | 0; K = ( U | 0 ) == - 1; do if ( ! ( L & 1 ) ) if ( ! K ) if ( ! ( ( U >>> 0 ) % 3 | 0 ) ) {

								xa = U + 2 | 0; break;

							} else {

								xa = U + - 1 | 0; break;

							} else xa = - 1; else {

								J = U + 1 | 0; if ( K )xa = - 1; else xa = ( ( J >>> 0 ) % 3 | 0 | 0 ) == 0 ? U + - 2 | 0 : J;

							} while ( 0 );f[ e >> 2 ] = z - Y; U = sc( h, e ) | 0; f[ U >> 2 ] = xa; H = f[ y >> 2 ] | 0;

						} while ( ( H | 0 ) != ( f[ x >> 2 ] | 0 ) );

					} while ( 0 );if ( ( G | 0 ) < ( c | 0 ) )F = G; else {

						ya = G; za = v; I = 121; break;

					}

				}

			} else {

				ya = 0; za = a + 8 | 0; I = 121;

			} while ( 0 );g:do if ( ( I | 0 ) == 121 ) {

				c = f[ za >> 2 ] | 0; if ( ( ( f[ c + 28 >> 2 ] | 0 ) - ( f[ c + 24 >> 2 ] | 0 ) >> 2 | 0 ) <= ( q | 0 ) ) {

					xa = f[ l >> 2 ] | 0; do if ( ( xa | 0 ) != ( f[ g >> 2 ] | 0 ) ) {

						j = a + 304 | 0; wa = a + 60 | 0; va = a + 64 | 0; ua = a + 68 | 0; sa = a + 76 | 0; ta = a + 80 | 0; ra = a + 72 | 0; ba = ya; qa = xa; h:while ( 1 ) {

							ga = qa; f[ e >> 2 ] = f[ ga + - 4 >> 2 ]; f[ l >> 2 ] = ga + - 4; do if ( ! ( Wg( j ) | 0 ) ) {

								ga = f[ va >> 2 ] | 0; o = f[ ua >> 2 ] | 0; if ( ( ga | 0 ) == ( o << 5 | 0 ) ) {

									if ( ( ga + 1 | 0 ) < 0 ) {

										I = 149; break h;

									}la = o << 6; o = ga + 32 & - 32; af( wa, ga >>> 0 < 1073741823 ? ( la >>> 0 < o >>> 0 ? o : la ) : 2147483647 ); Aa = f[ va >> 2 ] | 0;

								} else Aa = ga; f[ va >> 2 ] = Aa + 1; ga = ( f[ wa >> 2 ] | 0 ) + ( Aa >>> 5 << 2 ) | 0; f[ ga >> 2 ] = f[ ga >> 2 ] & ~ ( 1 << ( Aa & 31 ) ); ga = f[ sa >> 2 ] | 0; if ( ( ga | 0 ) == ( f[ ta >> 2 ] | 0 ) ) {

									xf( ra, e ); Ba = ba; break;

								} else {

									f[ ga >> 2 ] = f[ e >> 2 ]; f[ sa >> 2 ] = ga + 4; Ba = ba; break;

								}

							} else {

								ga = f[ za >> 2 ] | 0; la = f[ ga >> 2 ] | 0; o = la; if ( ( ba | 0 ) >= ( ( ( f[ ga + 4 >> 2 ] | 0 ) - la >> 2 >>> 0 ) / 3 | 0 | 0 ) ) {

									I = 155; break h;

								}la = f[ e >> 2 ] | 0; pa = la + 1 | 0; if ( ( la | 0 ) != - 1 ? ( na = ( ( pa >>> 0 ) % 3 | 0 | 0 ) == 0 ? la + - 2 | 0 : pa, ( na | 0 ) != - 1 ) : 0 )Ca = f[ o + ( na << 2 ) >> 2 ] | 0; else Ca = - 1; na = f[ ga + 24 >> 2 ] | 0; pa = f[ na + ( Ca << 2 ) >> 2 ] | 0; oa = pa + 1 | 0; if ( ( pa | 0 ) != - 1 ? ( ma = ( ( oa >>> 0 ) % 3 | 0 | 0 ) == 0 ? pa + - 2 | 0 : oa, oa = ma + 1 | 0, ( ma | 0 ) != - 1 ) : 0 ) {

									pa = ( ( oa >>> 0 ) % 3 | 0 | 0 ) == 0 ? ma + - 2 | 0 : oa; if ( ( pa | 0 ) == - 1 ) {

										Da = - 1; Ea = ma;

									} else {

										Da = f[ o + ( pa << 2 ) >> 2 ] | 0; Ea = ma;

									}

								} else {

									Da = - 1; Ea = - 1;

								}ma = f[ na + ( Da << 2 ) >> 2 ] | 0; na = ma + 1 | 0; if ( ( ma | 0 ) != - 1 ? ( pa = ( ( na >>> 0 ) % 3 | 0 | 0 ) == 0 ? ma + - 2 | 0 : na, na = pa + 1 | 0, ( pa | 0 ) != - 1 ) : 0 ) {

									ma = ( ( na >>> 0 ) % 3 | 0 | 0 ) == 0 ? pa + - 2 | 0 : na; if ( ( ma | 0 ) == - 1 ) {

										Fa = - 1; Ga = pa;

									} else {

										Fa = f[ o + ( ma << 2 ) >> 2 ] | 0; Ga = pa;

									}

								} else {

									Fa = - 1; Ga = - 1;

								}pa = ba * 3 | 0; f[ k >> 2 ] = pa; ma = f[ ga + 12 >> 2 ] | 0; f[ ma + ( pa << 2 ) >> 2 ] = la; f[ ma + ( la << 2 ) >> 2 ] = pa; pa = ( f[ k >> 2 ] | 0 ) + 1 | 0; f[ ma + ( pa << 2 ) >> 2 ] = Ea; f[ ma + ( Ea << 2 ) >> 2 ] = pa; pa = ( f[ k >> 2 ] | 0 ) + 2 | 0; f[ ma + ( pa << 2 ) >> 2 ] = Ga; f[ ma + ( Ga << 2 ) >> 2 ] = pa; pa = f[ k >> 2 ] | 0; ma = o + ( pa << 2 ) | 0; f[ ma >> 2 ] = Da; f[ o + ( pa + 1 << 2 ) >> 2 ] = Fa; f[ o + ( pa + 2 << 2 ) >> 2 ] = Ca; if ( ( pa | 0 ) == - 1 )Ha = - 1; else Ha = f[ ma >> 2 ] | 0; ma = f[ p >> 2 ] | 0; pa = ma + ( Ha >>> 5 << 2 ) | 0; f[ pa >> 2 ] = f[ pa >> 2 ] & ~ ( 1 << ( Ha & 31 ) ); pa = ( f[ k >> 2 ] | 0 ) + 1 | 0; if ( ( pa | 0 ) == - 1 )Ia = - 1; else Ia = f[ o + ( pa << 2 ) >> 2 ] | 0; pa = ma + ( Ia >>> 5 << 2 ) | 0; f[ pa >> 2 ] = f[ pa >> 2 ] & ~ ( 1 << ( Ia & 31 ) ); pa = ( f[ k >> 2 ] | 0 ) + 2 | 0; if ( ( pa | 0 ) == - 1 )Ja = - 1; else Ja = f[ o + ( pa << 2 ) >> 2 ] | 0; pa = ma + ( Ja >>> 5 << 2 ) | 0; f[ pa >> 2 ] = f[ pa >> 2 ] & ~ ( 1 << ( Ja & 31 ) ); pa = ba + 1 | 0; ma = f[ va >> 2 ] | 0; o = f[ ua >> 2 ] | 0; if ( ( ma | 0 ) == ( o << 5 | 0 ) ) {

									if ( ( ma + 1 | 0 ) < 0 ) {

										I = 139; break h;

									}la = o << 6; o = ma + 32 & - 32; af( wa, ma >>> 0 < 1073741823 ? ( la >>> 0 < o >>> 0 ? o : la ) : 2147483647 ); Ka = f[ va >> 2 ] | 0;

								} else Ka = ma; f[ va >> 2 ] = Ka + 1; ma = ( f[ wa >> 2 ] | 0 ) + ( Ka >>> 5 << 2 ) | 0; f[ ma >> 2 ] = f[ ma >> 2 ] | 1 << ( Ka & 31 ); ma = f[ sa >> 2 ] | 0; if ( ( ma | 0 ) == ( f[ ta >> 2 ] | 0 ) )xf( ra, k ); else {

									f[ ma >> 2 ] = f[ k >> 2 ]; f[ sa >> 2 ] = ma + 4;

								}Ba = pa;

							} while ( 0 );qa = f[ l >> 2 ] | 0; if ( ( qa | 0 ) == ( f[ g >> 2 ] | 0 ) ) {

								I = 156; break;

							} else ba = Ba;

						} if ( ( I | 0 ) == 139 )um( wa ); else if ( ( I | 0 ) == 149 )um( wa ); else if ( ( I | 0 ) == 155 ) {

							M = - 1; I = 174; break g;

						} else if ( ( I | 0 ) == 156 ) {

							La = Ba; Ma = f[ za >> 2 ] | 0; break;

						}

					} else {

						La = ya; Ma = c;

					} while ( 0 );if ( ( La | 0 ) == ( ( ( f[ Ma + 4 >> 2 ] | 0 ) - ( f[ Ma >> 2 ] | 0 ) >> 2 >>> 0 ) / 3 | 0 | 0 ) ) {

						c = ( f[ Ma + 28 >> 2 ] | 0 ) - ( f[ Ma + 24 >> 2 ] | 0 ) >> 2; xa = f[ i >> 2 ] | 0; ba = f[ m >> 2 ] | 0; if ( ( xa | 0 ) == ( ba | 0 ) ) {

							Na = c; Oa = xa;

						} else {

							qa = e + 4 | 0; sa = e + 8 | 0; ra = e + 12 | 0; ta = c; c = xa; xa = Ma; while ( 1 ) {

								va = f[ c >> 2 ] | 0; ua = ta + - 1 | 0; j = f[ xa + 24 >> 2 ] | 0; if ( ( f[ j + ( ua << 2 ) >> 2 ] | 0 ) == - 1 ) {

									G = ta; while ( 1 ) {

										pa = G + - 1 | 0; ma = G + - 2 | 0; if ( ( f[ j + ( ma << 2 ) >> 2 ] | 0 ) == - 1 )G = pa; else {

											Pa = pa; Qa = ma; break;

										}

									}

								} else {

									Pa = ta; Qa = ua;

								} if ( Qa >>> 0 < va >>> 0 ) {

									Ra = Pa; Sa = xa;

								} else {

									f[ e >> 2 ] = xa; G = f[ j + ( Qa << 2 ) >> 2 ] | 0; f[ qa >> 2 ] = G; f[ sa >> 2 ] = G; b[ ra >> 0 ] = 1; if ( ( G | 0 ) == - 1 ) {

										Ta = j; Ua = xa;

									} else {

										wa = xa; ma = G; do {

											f[ ( f[ wa >> 2 ] | 0 ) + ( ma << 2 ) >> 2 ] = va; Fe( e ); ma = f[ sa >> 2 ] | 0; wa = f[ za >> 2 ] | 0;

										} while ( ( ma | 0 ) != - 1 );Ta = f[ wa + 24 >> 2 ] | 0; Ua = wa;

									} if ( ( va | 0 ) == - 1 )Va = Ta + ( Qa << 2 ) | 0; else {

										ma = Ta + ( Qa << 2 ) | 0; f[ Ta + ( va << 2 ) >> 2 ] = f[ ma >> 2 ]; Va = ma;

									}f[ Va >> 2 ] = - 1; ma = f[ p >> 2 ] | 0; j = ma + ( Qa >>> 5 << 2 ) | 0; ua = 1 << ( Qa & 31 ); G = ma + ( va >>> 5 << 2 ) | 0; ma = 1 << ( va & 31 ); if ( ! ( f[ j >> 2 ] & ua ) )Wa = f[ G >> 2 ] & ~ ma; else Wa = f[ G >> 2 ] | ma; f[ G >> 2 ] = Wa; f[ j >> 2 ] = f[ j >> 2 ] & ~ ua; Ra = Pa + - 1 | 0; Sa = Ua;

								}c = c + 4 | 0; if ( ( c | 0 ) == ( ba | 0 ) ) {

									M = Ra; I = 174; break;

								} else {

									ta = Ra; xa = Sa;

								}

							}

						}

					} else {

						M = - 1; I = 174;

					}

				} else {

					M = - 1; I = 174;

				}

			} while ( 0 );if ( ( I | 0 ) == 174 ) {

				Na = M; Oa = f[ i >> 2 ] | 0;

			} if ( Oa | 0 ) {

				i = f[ m >> 2 ] | 0; if ( ( i | 0 ) != ( Oa | 0 ) )f[ m >> 2 ] = i + ( ~ ( ( i + - 4 - Oa | 0 ) >>> 2 ) << 2 ); dn( Oa );

			}Oa = f[ h + 8 >> 2 ] | 0; if ( Oa | 0 ) {

				i = Oa; do {

					Oa = i; i = f[ i >> 2 ] | 0; dn( Oa );

				} while ( ( i | 0 ) != 0 );

			}i = f[ h >> 2 ] | 0; f[ h >> 2 ] = 0; if ( i | 0 )dn( i ); i = f[ g >> 2 ] | 0; if ( ! i ) {

				u = d; return Na | 0;

			}g = f[ l >> 2 ] | 0; if ( ( g | 0 ) != ( i | 0 ) )f[ l >> 2 ] = g + ( ~ ( ( g + - 4 - i | 0 ) >>> 2 ) << 2 ); dn( i ); u = d; return Na | 0;

		} function _a( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0, Aa = 0, Ba = 0, Ca = 0, Da = 0, Ea = 0, Fa = 0, Ga = 0, Ha = 0, Ia = 0, Ja = 0, Ka = 0, La = 0, Ma = 0, Na = 0, Oa = 0, Pa = 0, Qa = 0, Ra = 0, Sa = 0, Ta = 0; d = u; u = u + 80 | 0; e = d + 56 | 0; g = d + 36 | 0; i = d + 24 | 0; j = d + 8 | 0; k = d; f[ e >> 2 ] = 0; l = e + 4 | 0; f[ l >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; f[ g + 12 >> 2 ] = 0; n[ g + 16 >> 2 ] = $( 1.0 ); f[ i >> 2 ] = 0; m = i + 4 | 0; f[ m >> 2 ] = 0; f[ i + 8 >> 2 ] = 0; o = ( f[ a + 212 >> 2 ] | 0 ) == ( f[ a + 216 >> 2 ] | 0 ); p = a + 120 | 0; q = f[ a + 124 >> 2 ] | 0; a:do if ( ( c | 0 ) > 0 ) {

				r = a + 300 | 0; s = g + 4 | 0; t = a + 8 | 0; v = i + 8 | 0; w = e + 8 | 0; x = a + 296 | 0; y = a + 288 | 0; z = a + 292 | 0; A = a + 36 | 0; B = a + 40 | 0; C = c + - 1 | 0; D = 0; b:while ( 1 ) {

					E = D + 1 | 0; c:do if ( ! ( b[ r >> 0 ] | 0 ) )F = 42; else {

						G = f[ x >> 2 ] | 0; H = f[ y >> 2 ] | 0; I = f[ z >> 2 ] | 0; J = H + ( G >>> 3 ) | 0; if ( J >>> 0 < I >>> 0 ? ( K = h[ J >> 0 ] | 0, J = G + 1 | 0, f[ x >> 2 ] = J, 1 << ( G & 7 ) & K | 0 ) : 0 ) {

							K = H + ( J >>> 3 ) | 0; if ( K >>> 0 < I >>> 0 ) {

								L = ( h[ K >> 0 ] | 0 ) >>> ( J & 7 ) & 1; K = G + 2 | 0; f[ x >> 2 ] = K; M = L; N = K;

							} else {

								M = 0; N = J;

							}J = H + ( N >>> 3 ) | 0; if ( J >>> 0 < I >>> 0 ) {

								I = ( h[ J >> 0 ] | 0 ) >>> ( N & 7 ); f[ x >> 2 ] = N + 1; O = I << 1 & 2;

							} else O = 0; I = ( O | M ) << 1 | 1; J = ( I | 0 ) == 5; switch ( I & 7 ) {

								case 1: {

									F = 42; break c; break;

								} case 3:case 5: {

									I = f[ l >> 2 ] | 0; if ( ( f[ e >> 2 ] | 0 ) == ( I | 0 ) ) {

										P = - 1; F = 177; break a;

									}H = f[ I + - 4 >> 2 ] | 0; I = D * 3 | 0; K = J ? I : I + 2 | 0; L = I + ( J & 1 ) | 0; G = ( J ? 2 : 1 ) + I | 0; J = f[ t >> 2 ] | 0; Q = f[ J + 12 >> 2 ] | 0; f[ Q + ( G << 2 ) >> 2 ] = H; f[ Q + ( H << 2 ) >> 2 ] = G; Q = J + 24 | 0; R = J + 28 | 0; S = f[ R >> 2 ] | 0; if ( ( S | 0 ) == ( f[ J + 32 >> 2 ] | 0 ) ) {

										xf( Q, 2336 ); T = f[ R >> 2 ] | 0;

									} else {

										f[ S >> 2 ] = - 1; J = S + 4 | 0; f[ R >> 2 ] = J; T = J;

									}J = T - ( f[ Q >> 2 ] | 0 ) >> 2; Q = J + - 1 | 0; R = f[ t >> 2 ] | 0; S = f[ R >> 2 ] | 0; f[ S + ( G << 2 ) >> 2 ] = Q; if ( J | 0 )f[ ( f[ R + 24 >> 2 ] | 0 ) + ( Q << 2 ) >> 2 ] = G; if ( ( H | 0 ) != - 1 ) {

										G = ( ( ( H >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + H | 0; if ( ( G | 0 ) != - 1 ) {

											Q = f[ S + ( G << 2 ) >> 2 ] | 0; f[ S + ( K << 2 ) >> 2 ] = Q; if ( ( Q | 0 ) != - 1 )f[ ( f[ R + 24 >> 2 ] | 0 ) + ( Q << 2 ) >> 2 ] = K;

										} else f[ S + ( K << 2 ) >> 2 ] = - 1; Q = H + 1 | 0; R = ( ( Q >>> 0 ) % 3 | 0 | 0 ) == 0 ? H + - 2 | 0 : Q; if ( ( R | 0 ) == - 1 )U = - 1; else U = f[ S + ( R << 2 ) >> 2 ] | 0;

									} else {

										f[ S + ( K << 2 ) >> 2 ] = - 1; U = - 1;

									}f[ S + ( L << 2 ) >> 2 ] = U; f[ ( f[ l >> 2 ] | 0 ) + - 4 >> 2 ] = I; break;

								} case 7: {

									f[ j >> 2 ] = D * 3; I = f[ t >> 2 ] | 0; L = I + 24 | 0; S = I + 28 | 0; K = f[ S >> 2 ] | 0; if ( ( K | 0 ) == ( f[ I + 32 >> 2 ] | 0 ) ) {

										xf( L, 2336 ); V = f[ S >> 2 ] | 0;

									} else {

										f[ K >> 2 ] = - 1; I = K + 4 | 0; f[ S >> 2 ] = I; V = I;

									}I = V - ( f[ L >> 2 ] | 0 ) >> 2; L = I + - 1 | 0; S = f[ t >> 2 ] | 0; K = f[ j >> 2 ] | 0; R = f[ S >> 2 ] | 0; f[ R + ( K << 2 ) >> 2 ] = L; Q = S + 24 | 0; H = S + 28 | 0; G = f[ H >> 2 ] | 0; if ( ( G | 0 ) == ( f[ S + 32 >> 2 ] | 0 ) ) {

										xf( Q, 2336 ); W = f[ H >> 2 ] | 0; X = f[ S >> 2 ] | 0;

									} else {

										f[ G >> 2 ] = - 1; S = G + 4 | 0; f[ H >> 2 ] = S; W = S; X = R;

									}f[ X + ( K + 1 << 2 ) >> 2 ] = ( W - ( f[ Q >> 2 ] | 0 ) >> 2 ) + - 1; Q = f[ t >> 2 ] | 0; K = ( f[ j >> 2 ] | 0 ) + 2 | 0; R = Q + 24 | 0; S = Q + 28 | 0; H = f[ S >> 2 ] | 0; if ( ( H | 0 ) == ( f[ Q + 32 >> 2 ] | 0 ) ) {

										xf( R, 2336 ); Y = f[ S >> 2 ] | 0;

									} else {

										f[ H >> 2 ] = - 1; G = H + 4 | 0; f[ S >> 2 ] = G; Y = G;

									}f[ ( f[ Q >> 2 ] | 0 ) + ( K << 2 ) >> 2 ] = ( Y - ( f[ R >> 2 ] | 0 ) >> 2 ) + - 1; R = f[ j >> 2 ] | 0; K = f[ ( f[ t >> 2 ] | 0 ) + 24 >> 2 ] | 0; if ( I ) {

										f[ K + ( L << 2 ) >> 2 ] = R; if ( ( I | 0 ) != - 1 ) {

											f[ K + ( I << 2 ) >> 2 ] = ( f[ j >> 2 ] | 0 ) + 1; L = I + 1 | 0; if ( ( L | 0 ) != - 1 ) {

												Z = L; F = 103;

											}

										} else {

											Z = 0; F = 103;

										}

									} else {

										f[ K + ( I << 2 ) >> 2 ] = R + 1; Z = 1; F = 103;

									} if ( ( F | 0 ) == 103 ) {

										F = 0; f[ K + ( Z << 2 ) >> 2 ] = ( f[ j >> 2 ] | 0 ) + 2;

									}K = f[ l >> 2 ] | 0; if ( ( K | 0 ) == ( f[ w >> 2 ] | 0 ) )xf( e, j ); else {

										f[ K >> 2 ] = f[ j >> 2 ]; f[ l >> 2 ] = K + 4;

									} break;

								} default:break b;

							}K = c - D + - 1 | 0; R = f[ B >> 2 ] | 0; if ( ( R | 0 ) == ( f[ A >> 2 ] | 0 ) ) break; else _ = R; while ( 1 ) {

								R = _; I = f[ R + - 8 >> 2 ] | 0; if ( I >>> 0 > K >>> 0 ) {

									P = - 1; F = 177; break a;

								} if ( ( I | 0 ) != ( K | 0 ) ) break c; I = b[ R + - 4 >> 0 ] | 0; L = f[ R + - 12 >> 2 ] | 0; f[ B >> 2 ] = R + - 12; if ( ( L | 0 ) < 0 ) {

									P = - 1; F = 177; break a;

								}R = f[ ( f[ l >> 2 ] | 0 ) + - 4 >> 2 ] | 0; Q = ( R | 0 ) == - 1; do if ( ! ( I & 1 ) ) if ( ! Q ) if ( ! ( ( R >>> 0 ) % 3 | 0 ) ) {

									aa = R + 2 | 0; break;

								} else {

									aa = R + - 1 | 0; break;

								} else aa = - 1; else {

									G = R + 1 | 0; if ( Q )aa = - 1; else aa = ( ( G >>> 0 ) % 3 | 0 | 0 ) == 0 ? R + - 2 | 0 : G;

								} while ( 0 );f[ j >> 2 ] = C - L; R = sc( g, j ) | 0; f[ R >> 2 ] = aa; _ = f[ B >> 2 ] | 0; if ( ( _ | 0 ) == ( f[ A >> 2 ] | 0 ) ) break c;

							}

						}K = f[ l >> 2 ] | 0; if ( ( f[ e >> 2 ] | 0 ) == ( K | 0 ) ) {

							P = - 1; F = 177; break a;

						}R = K + - 4 | 0; K = f[ R >> 2 ] | 0; Q = f[ t >> 2 ] | 0; I = ( K | 0 ) == - 1; G = K + 1 | 0; if ( ! I ? ( S = ( ( G >>> 0 ) % 3 | 0 | 0 ) == 0 ? K + - 2 | 0 : G, ( S | 0 ) != - 1 ) : 0 )ba = f[ ( f[ Q >> 2 ] | 0 ) + ( S << 2 ) >> 2 ] | 0; else ba = - 1; S = f[ Q + 24 >> 2 ] | 0; G = f[ S + ( ba << 2 ) >> 2 ] | 0; H = G + 1 | 0; J = S; if ( ( G | 0 ) == - 1 )ca = - 1; else ca = ( ( H >>> 0 ) % 3 | 0 | 0 ) == 0 ? G + - 2 | 0 : H; H = D * 3 | 0; G = H + 1 | 0; da = f[ Q + 12 >> 2 ] | 0; f[ da + ( K << 2 ) >> 2 ] = G; f[ da + ( G << 2 ) >> 2 ] = K; ea = H + 2 | 0; f[ da + ( ca << 2 ) >> 2 ] = ea; f[ da + ( ea << 2 ) >> 2 ] = ca; da = f[ Q >> 2 ] | 0; f[ da + ( H << 2 ) >> 2 ] = ba; fa = ca + 1 | 0; if ( ( ca | 0 ) != - 1 ? ( ga = ( ( fa >>> 0 ) % 3 | 0 | 0 ) == 0 ? ca + - 2 | 0 : fa, ( ga | 0 ) != - 1 ) : 0 )ha = f[ da + ( ga << 2 ) >> 2 ] | 0; else ha = - 1; f[ da + ( G << 2 ) >> 2 ] = ha; if ( ! I ? ( I = ( ( ( K >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + K | 0, ( I | 0 ) != - 1 ) : 0 ) {

							K = f[ da + ( I << 2 ) >> 2 ] | 0; f[ da + ( ea << 2 ) >> 2 ] = K; if ( ( K | 0 ) != - 1 )f[ S + ( K << 2 ) >> 2 ] = ea;

						} else f[ da + ( ea << 2 ) >> 2 ] = - 1; if ( ( ( f[ Q + 28 >> 2 ] | 0 ) - J >> 2 | 0 ) > ( q | 0 ) ) {

							P = - 1; F = 177; break a;

						}J = ( f[ p >> 2 ] | 0 ) + ( ba >>> 5 << 2 ) | 0; f[ J >> 2 ] = f[ J >> 2 ] & ~ ( 1 << ( ba & 31 ) ); f[ R >> 2 ] = H;

					} while ( 0 );if ( ( F | 0 ) == 42 ) {

						F = 0; H = f[ e >> 2 ] | 0; R = f[ l >> 2 ] | 0; if ( ( H | 0 ) == ( R | 0 ) ) {

							P = - 1; F = 177; break a;

						}J = R + - 4 | 0; Q = f[ J >> 2 ] | 0; f[ l >> 2 ] = J; ea = f[ s >> 2 ] | 0; d:do if ( ea ) {

							da = ea + - 1 | 0; K = ( da & ea | 0 ) == 0; if ( ! K ) if ( D >>> 0 < ea >>> 0 )ia = D; else ia = ( D >>> 0 ) % ( ea >>> 0 ) | 0; else ia = da & D; S = f[ ( f[ g >> 2 ] | 0 ) + ( ia << 2 ) >> 2 ] | 0; if ( ( S | 0 ) != 0 ? ( I = f[ S >> 2 ] | 0, ( I | 0 ) != 0 ) : 0 ) {

								e:do if ( K ) {

									S = I; while ( 1 ) {

										G = f[ S + 4 >> 2 ] | 0; ga = ( G | 0 ) == ( D | 0 ); if ( ! ( ga | ( G & da | 0 ) == ( ia | 0 ) ) ) {

											ja = H; ka = J; break d;

										} if ( ga ? ( f[ S + 8 >> 2 ] | 0 ) == ( D | 0 ) : 0 ) {

											la = S; break e;

										}S = f[ S >> 2 ] | 0; if ( ! S ) {

											ja = H; ka = J; break d;

										}

									}

								} else {

									S = I; while ( 1 ) {

										L = f[ S + 4 >> 2 ] | 0; if ( ( L | 0 ) == ( D | 0 ) ) {

											if ( ( f[ S + 8 >> 2 ] | 0 ) == ( D | 0 ) ) {

												la = S; break e;

											}

										} else {

											if ( L >>> 0 < ea >>> 0 )ma = L; else ma = ( L >>> 0 ) % ( ea >>> 0 ) | 0; if ( ( ma | 0 ) != ( ia | 0 ) ) {

												ja = H; ka = J; break d;

											}

										}S = f[ S >> 2 ] | 0; if ( ! S ) {

											ja = H; ka = J; break d;

										}

									}

								} while ( 0 );I = la + 12 | 0; if ( ( J | 0 ) == ( f[ w >> 2 ] | 0 ) ) {

									xf( e, I ); ja = f[ e >> 2 ] | 0; ka = f[ l >> 2 ] | 0; break;

								} else {

									f[ J >> 2 ] = f[ I >> 2 ]; f[ l >> 2 ] = R; ja = H; ka = R; break;

								}

							} else {

								ja = H; ka = J;

							}

						} else {

							ja = H; ka = J;

						} while ( 0 );if ( ( ja | 0 ) == ( ka | 0 ) ) {

							P = - 1; F = 177; break a;

						}J = f[ ka + - 4 >> 2 ] | 0; H = D * 3 | 0; R = H + 2 | 0; ea = f[ t >> 2 ] | 0; I = f[ ea + 12 >> 2 ] | 0; f[ I + ( J << 2 ) >> 2 ] = R; f[ I + ( R << 2 ) >> 2 ] = J; da = H + 1 | 0; f[ I + ( Q << 2 ) >> 2 ] = da; f[ I + ( da << 2 ) >> 2 ] = Q; if ( ( J | 0 ) != - 1 ) {

							K = ( ( ( J >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + J | 0; if ( ( K | 0 ) == - 1 )na = - 1; else na = f[ ( f[ ea >> 2 ] | 0 ) + ( K << 2 ) >> 2 ] | 0; K = f[ ea >> 2 ] | 0; f[ K + ( H << 2 ) >> 2 ] = na; S = J + 1 | 0; L = ( ( S >>> 0 ) % 3 | 0 | 0 ) == 0 ? J + - 2 | 0 : S; if ( ( L | 0 ) == - 1 ) {

								oa = - 1; pa = na; qa = K; ra = ea;

							} else {

								oa = f[ K + ( L << 2 ) >> 2 ] | 0; pa = na; qa = K; ra = ea;

							}

						} else {

							K = f[ ea >> 2 ] | 0; f[ K + ( H << 2 ) >> 2 ] = - 1; oa = - 1; pa = - 1; qa = K; ra = ea;

						}f[ qa + ( da << 2 ) >> 2 ] = oa; if ( ( Q | 0 ) != - 1 ) {

							da = ( ( ( Q >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + Q | 0; if ( ( da | 0 ) != - 1 ) {

								K = f[ qa + ( da << 2 ) >> 2 ] | 0; f[ qa + ( R << 2 ) >> 2 ] = K; if ( ( K | 0 ) != - 1 )f[ ( f[ ea + 24 >> 2 ] | 0 ) + ( K << 2 ) >> 2 ] = R;

							} else f[ qa + ( R << 2 ) >> 2 ] = - 1; K = Q + 1 | 0; da = ( ( K >>> 0 ) % 3 | 0 | 0 ) == 0 ? Q + - 2 | 0 : K; if ( ( da | 0 ) == - 1 ) {

								sa = - 1; ta = - 1;

							} else {

								sa = f[ qa + ( da << 2 ) >> 2 ] | 0; ta = da;

							}

						} else {

							f[ qa + ( R << 2 ) >> 2 ] = - 1; sa = - 1; ta = - 1;

						}f[ j >> 2 ] = sa; R = f[ ea + 24 >> 2 ] | 0; if ( ( pa | 0 ) != - 1 )f[ R + ( pa << 2 ) >> 2 ] = f[ R + ( sa << 2 ) >> 2 ]; f:do if ( ( ta | 0 ) != - 1 ) {

							ea = f[ ra >> 2 ] | 0; da = ta; do {

								f[ ea + ( da << 2 ) >> 2 ] = pa; K = da + 1 | 0; L = ( ( K >>> 0 ) % 3 | 0 | 0 ) == 0 ? da + - 2 | 0 : K; if ( ( L | 0 ) == - 1 ) break f; K = f[ I + ( L << 2 ) >> 2 ] | 0; L = K + 1 | 0; if ( ( K | 0 ) == - 1 ) break f; da = ( ( L >>> 0 ) % 3 | 0 | 0 ) == 0 ? K + - 2 | 0 : L;

							} while ( ( da | 0 ) != - 1 );

						} while ( 0 );f[ R + ( f[ j >> 2 ] << 2 ) >> 2 ] = - 1; do if ( o ) {

							I = f[ m >> 2 ] | 0; if ( ( I | 0 ) == ( f[ v >> 2 ] | 0 ) ) {

								xf( i, j ); ua = f[ l >> 2 ] | 0; break;

							} else {

								f[ I >> 2 ] = f[ j >> 2 ]; f[ m >> 2 ] = I + 4; ua = ka; break;

							}

						} else ua = ka; while ( 0 );f[ ua + - 4 >> 2 ] = H;

					} if ( ( E | 0 ) < ( c | 0 ) )D = E; else {

						va = E; wa = t; F = 123; break a;

					}

				}

			} else {

				va = 0; wa = a + 8 | 0; F = 123;

			} while ( 0 );g:do if ( ( F | 0 ) == 123 ) {

				c = f[ wa >> 2 ] | 0; if ( ( ( f[ c + 28 >> 2 ] | 0 ) - ( f[ c + 24 >> 2 ] | 0 ) >> 2 | 0 ) <= ( q | 0 ) ) {

					ua = f[ l >> 2 ] | 0; do if ( ( ua | 0 ) != ( f[ e >> 2 ] | 0 ) ) {

						ka = a + 304 | 0; o = a + 60 | 0; pa = a + 64 | 0; ta = a + 68 | 0; ra = a + 76 | 0; sa = a + 80 | 0; qa = a + 72 | 0; oa = va; na = ua; h:while ( 1 ) {

							ja = na; f[ j >> 2 ] = f[ ja + - 4 >> 2 ]; f[ l >> 2 ] = ja + - 4; do if ( ! ( Wg( ka ) | 0 ) ) {

								ja = f[ pa >> 2 ] | 0; la = f[ ta >> 2 ] | 0; if ( ( ja | 0 ) == ( la << 5 | 0 ) ) {

									if ( ( ja + 1 | 0 ) < 0 ) {

										F = 151; break h;

									}ia = la << 6; la = ja + 32 & - 32; af( o, ja >>> 0 < 1073741823 ? ( ia >>> 0 < la >>> 0 ? la : ia ) : 2147483647 ); xa = f[ pa >> 2 ] | 0;

								} else xa = ja; f[ pa >> 2 ] = xa + 1; ja = ( f[ o >> 2 ] | 0 ) + ( xa >>> 5 << 2 ) | 0; f[ ja >> 2 ] = f[ ja >> 2 ] & ~ ( 1 << ( xa & 31 ) ); ja = f[ ra >> 2 ] | 0; if ( ( ja | 0 ) == ( f[ sa >> 2 ] | 0 ) ) {

									xf( qa, j ); ya = oa; break;

								} else {

									f[ ja >> 2 ] = f[ j >> 2 ]; f[ ra >> 2 ] = ja + 4; ya = oa; break;

								}

							} else {

								ja = f[ wa >> 2 ] | 0; ia = f[ ja >> 2 ] | 0; la = ia; if ( ( oa | 0 ) >= ( ( ( f[ ja + 4 >> 2 ] | 0 ) - ia >> 2 >>> 0 ) / 3 | 0 | 0 ) ) {

									F = 157; break h;

								}ia = f[ j >> 2 ] | 0; ma = ia + 1 | 0; if ( ( ia | 0 ) != - 1 ? ( ba = ( ( ma >>> 0 ) % 3 | 0 | 0 ) == 0 ? ia + - 2 | 0 : ma, ( ba | 0 ) != - 1 ) : 0 )za = f[ la + ( ba << 2 ) >> 2 ] | 0; else za = - 1; ba = f[ ja + 24 >> 2 ] | 0; ma = f[ ba + ( za << 2 ) >> 2 ] | 0; ha = ma + 1 | 0; if ( ( ma | 0 ) != - 1 ? ( ca = ( ( ha >>> 0 ) % 3 | 0 | 0 ) == 0 ? ma + - 2 | 0 : ha, ha = ca + 1 | 0, ( ca | 0 ) != - 1 ) : 0 ) {

									ma = ( ( ha >>> 0 ) % 3 | 0 | 0 ) == 0 ? ca + - 2 | 0 : ha; if ( ( ma | 0 ) == - 1 ) {

										Aa = - 1; Ba = ca;

									} else {

										Aa = f[ la + ( ma << 2 ) >> 2 ] | 0; Ba = ca;

									}

								} else {

									Aa = - 1; Ba = - 1;

								}ca = f[ ba + ( Aa << 2 ) >> 2 ] | 0; ba = ca + 1 | 0; if ( ( ca | 0 ) != - 1 ? ( ma = ( ( ba >>> 0 ) % 3 | 0 | 0 ) == 0 ? ca + - 2 | 0 : ba, ba = ma + 1 | 0, ( ma | 0 ) != - 1 ) : 0 ) {

									ca = ( ( ba >>> 0 ) % 3 | 0 | 0 ) == 0 ? ma + - 2 | 0 : ba; if ( ( ca | 0 ) == - 1 ) {

										Ca = - 1; Da = ma;

									} else {

										Ca = f[ la + ( ca << 2 ) >> 2 ] | 0; Da = ma;

									}

								} else {

									Ca = - 1; Da = - 1;

								}ma = oa * 3 | 0; f[ k >> 2 ] = ma; ca = f[ ja + 12 >> 2 ] | 0; f[ ca + ( ma << 2 ) >> 2 ] = ia; f[ ca + ( ia << 2 ) >> 2 ] = ma; ma = ( f[ k >> 2 ] | 0 ) + 1 | 0; f[ ca + ( ma << 2 ) >> 2 ] = Ba; f[ ca + ( Ba << 2 ) >> 2 ] = ma; ma = ( f[ k >> 2 ] | 0 ) + 2 | 0; f[ ca + ( ma << 2 ) >> 2 ] = Da; f[ ca + ( Da << 2 ) >> 2 ] = ma; ma = f[ k >> 2 ] | 0; ca = la + ( ma << 2 ) | 0; f[ ca >> 2 ] = Aa; f[ la + ( ma + 1 << 2 ) >> 2 ] = Ca; f[ la + ( ma + 2 << 2 ) >> 2 ] = za; if ( ( ma | 0 ) == - 1 )Ea = - 1; else Ea = f[ ca >> 2 ] | 0; ca = f[ p >> 2 ] | 0; ma = ca + ( Ea >>> 5 << 2 ) | 0; f[ ma >> 2 ] = f[ ma >> 2 ] & ~ ( 1 << ( Ea & 31 ) ); ma = ( f[ k >> 2 ] | 0 ) + 1 | 0; if ( ( ma | 0 ) == - 1 )Fa = - 1; else Fa = f[ la + ( ma << 2 ) >> 2 ] | 0; ma = ca + ( Fa >>> 5 << 2 ) | 0; f[ ma >> 2 ] = f[ ma >> 2 ] & ~ ( 1 << ( Fa & 31 ) ); ma = ( f[ k >> 2 ] | 0 ) + 2 | 0; if ( ( ma | 0 ) == - 1 )Ga = - 1; else Ga = f[ la + ( ma << 2 ) >> 2 ] | 0; ma = ca + ( Ga >>> 5 << 2 ) | 0; f[ ma >> 2 ] = f[ ma >> 2 ] & ~ ( 1 << ( Ga & 31 ) ); ma = oa + 1 | 0; ca = f[ pa >> 2 ] | 0; la = f[ ta >> 2 ] | 0; if ( ( ca | 0 ) == ( la << 5 | 0 ) ) {

									if ( ( ca + 1 | 0 ) < 0 ) {

										F = 141; break h;

									}ia = la << 6; la = ca + 32 & - 32; af( o, ca >>> 0 < 1073741823 ? ( ia >>> 0 < la >>> 0 ? la : ia ) : 2147483647 ); Ha = f[ pa >> 2 ] | 0;

								} else Ha = ca; f[ pa >> 2 ] = Ha + 1; ca = ( f[ o >> 2 ] | 0 ) + ( Ha >>> 5 << 2 ) | 0; f[ ca >> 2 ] = f[ ca >> 2 ] | 1 << ( Ha & 31 ); ca = f[ ra >> 2 ] | 0; if ( ( ca | 0 ) == ( f[ sa >> 2 ] | 0 ) )xf( qa, k ); else {

									f[ ca >> 2 ] = f[ k >> 2 ]; f[ ra >> 2 ] = ca + 4;

								}ya = ma;

							} while ( 0 );na = f[ l >> 2 ] | 0; if ( ( na | 0 ) == ( f[ e >> 2 ] | 0 ) ) {

								F = 158; break;

							} else oa = ya;

						} if ( ( F | 0 ) == 141 )um( o ); else if ( ( F | 0 ) == 151 )um( o ); else if ( ( F | 0 ) == 157 ) {

							P = - 1; F = 177; break g;

						} else if ( ( F | 0 ) == 158 ) {

							Ia = ya; Ja = f[ wa >> 2 ] | 0; break;

						}

					} else {

						Ia = va; Ja = c;

					} while ( 0 );if ( ( Ia | 0 ) == ( ( ( f[ Ja + 4 >> 2 ] | 0 ) - ( f[ Ja >> 2 ] | 0 ) >> 2 >>> 0 ) / 3 | 0 | 0 ) ) {

						c = ( f[ Ja + 28 >> 2 ] | 0 ) - ( f[ Ja + 24 >> 2 ] | 0 ) >> 2; ua = f[ i >> 2 ] | 0; oa = f[ m >> 2 ] | 0; if ( ( ua | 0 ) == ( oa | 0 ) ) {

							Ka = c; La = ua;

						} else {

							na = j + 4 | 0; ra = j + 8 | 0; qa = j + 12 | 0; sa = c; c = ua; ua = Ja; while ( 1 ) {

								pa = f[ c >> 2 ] | 0; ta = sa + - 1 | 0; ka = f[ ua + 24 >> 2 ] | 0; if ( ( f[ ka + ( ta << 2 ) >> 2 ] | 0 ) == - 1 ) {

									E = sa; while ( 1 ) {

										H = E + - 1 | 0; ma = E + - 2 | 0; if ( ( f[ ka + ( ma << 2 ) >> 2 ] | 0 ) == - 1 )E = H; else {

											Ma = H; Na = ma; break;

										}

									}

								} else {

									Ma = sa; Na = ta;

								} if ( Na >>> 0 < pa >>> 0 ) {

									Oa = Ma; Pa = ua;

								} else {

									f[ j >> 2 ] = ua; E = f[ ka + ( Na << 2 ) >> 2 ] | 0; f[ na >> 2 ] = E; f[ ra >> 2 ] = E; b[ qa >> 0 ] = 1; if ( ( E | 0 ) == - 1 ) {

										Qa = ka; Ra = ua;

									} else {

										o = ua; ma = E; do {

											f[ ( f[ o >> 2 ] | 0 ) + ( ma << 2 ) >> 2 ] = pa; Fe( j ); ma = f[ ra >> 2 ] | 0; o = f[ wa >> 2 ] | 0;

										} while ( ( ma | 0 ) != - 1 );Qa = f[ o + 24 >> 2 ] | 0; Ra = o;

									} if ( ( pa | 0 ) == - 1 )Sa = Qa + ( Na << 2 ) | 0; else {

										ma = Qa + ( Na << 2 ) | 0; f[ Qa + ( pa << 2 ) >> 2 ] = f[ ma >> 2 ]; Sa = ma;

									}f[ Sa >> 2 ] = - 1; ma = f[ p >> 2 ] | 0; ka = ma + ( Na >>> 5 << 2 ) | 0; ta = 1 << ( Na & 31 ); E = ma + ( pa >>> 5 << 2 ) | 0; ma = 1 << ( pa & 31 ); if ( ! ( f[ ka >> 2 ] & ta ) )Ta = f[ E >> 2 ] & ~ ma; else Ta = f[ E >> 2 ] | ma; f[ E >> 2 ] = Ta; f[ ka >> 2 ] = f[ ka >> 2 ] & ~ ta; Oa = Ma + - 1 | 0; Pa = Ra;

								}c = c + 4 | 0; if ( ( c | 0 ) == ( oa | 0 ) ) {

									P = Oa; F = 177; break;

								} else {

									sa = Oa; ua = Pa;

								}

							}

						}

					} else {

						P = - 1; F = 177;

					}

				} else {

					P = - 1; F = 177;

				}

			} while ( 0 );if ( ( F | 0 ) == 177 ) {

				Ka = P; La = f[ i >> 2 ] | 0;

			} if ( La | 0 ) {

				i = f[ m >> 2 ] | 0; if ( ( i | 0 ) != ( La | 0 ) )f[ m >> 2 ] = i + ( ~ ( ( i + - 4 - La | 0 ) >>> 2 ) << 2 ); dn( La );

			}La = f[ g + 8 >> 2 ] | 0; if ( La | 0 ) {

				i = La; do {

					La = i; i = f[ i >> 2 ] | 0; dn( La );

				} while ( ( i | 0 ) != 0 );

			}i = f[ g >> 2 ] | 0; f[ g >> 2 ] = 0; if ( i | 0 )dn( i ); i = f[ e >> 2 ] | 0; if ( ! i ) {

				u = d; return Ka | 0;

			}e = f[ l >> 2 ] | 0; if ( ( e | 0 ) != ( i | 0 ) )f[ l >> 2 ] = e + ( ~ ( ( e + - 4 - i | 0 ) >>> 2 ) << 2 ); dn( i ); u = d; return Ka | 0;

		} function $a( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0; b = u; u = u + 16 | 0; c = b; d = b + 8 | 0; e = b + 4 | 0; f[ d >> 2 ] = a; do if ( a >>> 0 >= 212 ) {

				g = ( a >>> 0 ) / 210 | 0; h = g * 210 | 0; f[ e >> 2 ] = a - h; i = 0; j = g; g = ( Oh( 3400, 3592, e, c ) | 0 ) - 3400 >> 2; k = h; a:while ( 1 ) {

					l = ( f[ 3400 + ( g << 2 ) >> 2 ] | 0 ) + k | 0; h = 5; while ( 1 ) {

						if ( h >>> 0 >= 47 ) {

							m = 211; n = i; o = 8; break;

						}p = f[ 3208 + ( h << 2 ) >> 2 ] | 0; q = ( l >>> 0 ) / ( p >>> 0 ) | 0; if ( q >>> 0 < p >>> 0 ) {

							o = 106; break a;

						} if ( ( l | 0 ) == ( X( q, p ) | 0 ) ) {

							r = i; break;

						} else h = h + 1 | 0;

					}b:do if ( ( o | 0 ) == 8 ) {

						c:while ( 1 ) {

							o = 0; h = ( l >>> 0 ) / ( m >>> 0 ) | 0; do if ( h >>> 0 >= m >>> 0 ) if ( ( l | 0 ) != ( X( h, m ) | 0 ) ) {

								p = m + 10 | 0; q = ( l >>> 0 ) / ( p >>> 0 ) | 0; if ( q >>> 0 >= p >>> 0 ) if ( ( l | 0 ) != ( X( q, p ) | 0 ) ) {

									q = m + 12 | 0; s = ( l >>> 0 ) / ( q >>> 0 ) | 0; if ( s >>> 0 >= q >>> 0 ) if ( ( l | 0 ) != ( X( s, q ) | 0 ) ) {

										s = m + 16 | 0; t = ( l >>> 0 ) / ( s >>> 0 ) | 0; if ( t >>> 0 >= s >>> 0 ) if ( ( l | 0 ) != ( X( t, s ) | 0 ) ) {

											t = m + 18 | 0; v = ( l >>> 0 ) / ( t >>> 0 ) | 0; if ( v >>> 0 >= t >>> 0 ) if ( ( l | 0 ) != ( X( v, t ) | 0 ) ) {

												v = m + 22 | 0; w = ( l >>> 0 ) / ( v >>> 0 ) | 0; if ( w >>> 0 >= v >>> 0 ) if ( ( l | 0 ) != ( X( w, v ) | 0 ) ) {

													w = m + 28 | 0; x = ( l >>> 0 ) / ( w >>> 0 ) | 0; if ( x >>> 0 >= w >>> 0 ) if ( ( l | 0 ) == ( X( x, w ) | 0 ) ) {

														y = w; z = 9; A = n;

													} else {

														x = m + 30 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 36 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 40 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 42 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 46 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 52 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 58 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 60 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 66 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 70 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 72 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 78 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 82 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 88 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 96 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 100 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 102 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 106 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 108 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 112 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 120 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 126 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 130 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 136 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 138 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 142 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 148 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 150 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 156 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 162 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 166 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 168 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 172 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 178 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 180 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 186 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 190 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 192 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 196 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 198 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; if ( B >>> 0 < x >>> 0 ) {

															y = x; z = 1; A = l; break;

														} if ( ( l | 0 ) == ( X( B, x ) | 0 ) ) {

															y = x; z = 9; A = n; break;

														}x = m + 208 | 0; B = ( l >>> 0 ) / ( x >>> 0 ) | 0; C = B >>> 0 < x >>> 0; D = ( l | 0 ) == ( X( B, x ) | 0 ); y = C | D ? x : m + 210 | 0; z = C ? 1 : D ? 9 : 0; A = C ? l : n;

													} else {

														y = w; z = 1; A = l;

													}

												} else {

													y = v; z = 9; A = n;

												} else {

													y = v; z = 1; A = l;

												}

											} else {

												y = t; z = 9; A = n;

											} else {

												y = t; z = 1; A = l;

											}

										} else {

											y = s; z = 9; A = n;

										} else {

											y = s; z = 1; A = l;

										}

									} else {

										y = q; z = 9; A = n;

									} else {

										y = q; z = 1; A = l;

									}

								} else {

									y = p; z = 9; A = n;

								} else {

									y = p; z = 1; A = l;

								}

							} else {

								y = m; z = 9; A = n;

							} else {

								y = m; z = 1; A = l;

							} while ( 0 );switch ( z & 15 ) {

								case 9: {

									r = A; break b; break;

								} case 0: {

									m = y; n = A; o = 8; break;

								} default:break c;

							}

						} if ( ! z )r = A; else {

							o = 107; break a;

						}

					} while ( 0 );h = g + 1 | 0; p = ( h | 0 ) == 48; q = j + ( p & 1 ) | 0; i = r; j = q; g = p ? 0 : h; k = q * 210 | 0;

				} if ( ( o | 0 ) == 106 ) {

					f[ d >> 2 ] = l; E = l; break;

				} else if ( ( o | 0 ) == 107 ) {

					f[ d >> 2 ] = l; E = A; break;

				}

			} else {

				k = Oh( 3208, 3400, d, c ) | 0; E = f[ k >> 2 ] | 0;

			} while ( 0 );u = b; return E | 0;

		} function ab( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0, Aa = 0, Ba = 0, Ca = 0, Da = 0, Ea = 0, Fa = 0, Ga = 0, Ha = 0, Ia = 0, Ja = 0, Ka = 0, La = 0, Ma = 0, Na = 0, Oa = 0, Pa = 0, Qa = 0, Ra = 0, Sa = 0, Ta = 0, Ua = 0, Va = 0, Wa = 0, Xa = 0, Ya = 0, Za = 0, _a = 0, $a = 0, ab = 0, bb = 0, cb = 0, db = 0, eb = 0, fb = 0, gb = 0, hb = 0, ib = 0, jb = 0, kb = 0, lb = 0, mb = 0, nb = 0, ob = 0, pb = 0, qb = 0, rb = 0, sb = 0, tb = 0, ub = 0, vb = 0, wb = 0, xb = 0, yb = 0, zb = 0, Ab = 0, Bb = 0, Cb = 0, Db = 0, Eb = 0, Fb = 0, Gb = 0, Hb = 0, Ib = 0, Jb = 0, Kb = 0, Lb = 0, Mb = 0, Nb = 0, Ob = 0, Pb = 0, Qb = 0, Rb = 0, Sb = 0, Tb = 0, Ub = 0, Vb = 0, Wb = 0, Xb = 0, Yb = 0, Zb = 0, _b = 0; c = u; u = u + 32 | 0; d = c + 16 | 0; e = c + 4 | 0; g = c; f[ a + 36 >> 2 ] = b; h = a + 24 | 0; i = a + 28 | 0; j = f[ i >> 2 ] | 0; k = f[ h >> 2 ] | 0; l = j - k >> 2; m = k; k = j; if ( l >>> 0 >= b >>> 0 ) {

				if ( l >>> 0 > b >>> 0 ? ( j = m + ( b << 2 ) | 0, ( j | 0 ) != ( k | 0 ) ) : 0 )f[ i >> 2 ] = k + ( ~ ( ( k + - 4 - j | 0 ) >>> 2 ) << 2 );

			} else Ae( h, b - l | 0, 2652 ); f[ d >> 2 ] = 0; l = d + 4 | 0; f[ l >> 2 ] = 0; j = d + 8 | 0; f[ j >> 2 ] = 0; if ( b ) {

				if ( ( b | 0 ) < 0 )um( d ); k = ( ( b + - 1 | 0 ) >>> 5 ) + 1 | 0; m = bj( k << 2 ) | 0; f[ d >> 2 ] = m; f[ j >> 2 ] = k; f[ l >> 2 ] = b; k = b >>> 5; Vf( m | 0, 0, k << 2 | 0 ) | 0; n = b & 31; o = m + ( k << 2 ) | 0; k = m; if ( ! n ) {

					p = b; q = k; r = m;

				} else {

					f[ o >> 2 ] = f[ o >> 2 ] & ~ ( - 1 >>> ( 32 - n | 0 ) ); p = b; q = k; r = m;

				}

			} else {

				p = 0; q = 0; r = 0;

			}m = a + 4 | 0; k = f[ a >> 2 ] | 0; n = ( f[ m >> 2 ] | 0 ) - k | 0; o = n >> 2; f[ e >> 2 ] = 0; s = e + 4 | 0; f[ s >> 2 ] = 0; t = e + 8 | 0; f[ t >> 2 ] = 0; do if ( o ) {

				if ( ( n | 0 ) < 0 )um( e ); v = ( ( o + - 1 | 0 ) >>> 5 ) + 1 | 0; w = bj( v << 2 ) | 0; f[ e >> 2 ] = w; f[ t >> 2 ] = v; f[ s >> 2 ] = o; v = o >>> 5; Vf( w | 0, 0, v << 2 | 0 ) | 0; x = o & 31; y = w + ( v << 2 ) | 0; if ( x | 0 )f[ y >> 2 ] = f[ y >> 2 ] & ~ ( - 1 >>> ( 32 - x | 0 ) ); if ( o >>> 0 > 2 ) {

					x = a + 12 | 0; y = a + 32 | 0; v = a + 52 | 0; w = a + 56 | 0; z = a + 48 | 0; A = b; B = k; C = 0; D = q; E = r; a:while ( 1 ) {

						F = B; G = C * 3 | 0; if ( ( G | 0 ) != - 1 ) {

							H = f[ F + ( G << 2 ) >> 2 ] | 0; I = G + 1 | 0; J = ( ( I >>> 0 ) % 3 | 0 | 0 ) == 0 ? G + - 2 | 0 : I; if ( ( J | 0 ) == - 1 )K = - 1; else K = f[ F + ( J << 2 ) >> 2 ] | 0; J = ( ( ( G >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + G | 0; if ( ( J | 0 ) == - 1 )L = - 1; else L = f[ F + ( J << 2 ) >> 2 ] | 0; if ( ( H | 0 ) != ( K | 0 ) ? ! ( ( H | 0 ) == ( L | 0 ) | ( K | 0 ) == ( L | 0 ) ) : 0 ) {

								H = 0; J = A; F = E; I = D; while ( 1 ) {

									M = H + G | 0; if ( ! ( f[ ( f[ e >> 2 ] | 0 ) + ( M >>> 5 << 2 ) >> 2 ] & 1 << ( M & 31 ) ) ) {

										N = f[ ( f[ a >> 2 ] | 0 ) + ( M << 2 ) >> 2 ] | 0; f[ g >> 2 ] = N; if ( ! ( f[ F + ( N >>> 5 << 2 ) >> 2 ] & 1 << ( N & 31 ) ) ) {

											O = 0; P = J; Q = N;

										} else {

											N = f[ i >> 2 ] | 0; if ( ( N | 0 ) == ( f[ y >> 2 ] | 0 ) )xf( h, 2652 ); else {

												f[ N >> 2 ] = - 1; f[ i >> 2 ] = N + 4;

											}N = f[ v >> 2 ] | 0; if ( ( N | 0 ) == ( f[ w >> 2 ] | 0 ) )xf( z, g ); else {

												f[ N >> 2 ] = f[ g >> 2 ]; f[ v >> 2 ] = N + 4;

											}N = f[ l >> 2 ] | 0; R = f[ j >> 2 ] | 0; if ( ( N | 0 ) == ( R << 5 | 0 ) ) {

												if ( ( N + 1 | 0 ) < 0 ) {

													S = 50; break a;

												}T = R << 6; R = N + 32 & - 32; af( d, N >>> 0 < 1073741823 ? ( T >>> 0 < R >>> 0 ? R : T ) : 2147483647 ); U = f[ l >> 2 ] | 0;

											} else U = N; f[ l >> 2 ] = U + 1; N = ( f[ d >> 2 ] | 0 ) + ( U >>> 5 << 2 ) | 0; f[ N >> 2 ] = f[ N >> 2 ] & ~ ( 1 << ( U & 31 ) ); f[ g >> 2 ] = J; O = 1; P = J + 1 | 0; Q = J;

										}N = f[ d >> 2 ] | 0; T = N + ( Q >>> 5 << 2 ) | 0; f[ T >> 2 ] = f[ T >> 2 ] | 1 << ( Q & 31 ); T = N; b:do if ( O ) {

											R = M; while ( 1 ) {

												if ( ( R | 0 ) == - 1 ) {

													S = 64; break b;

												}V = ( f[ e >> 2 ] | 0 ) + ( R >>> 5 << 2 ) | 0; f[ V >> 2 ] = f[ V >> 2 ] | 1 << ( R & 31 ); V = f[ g >> 2 ] | 0; f[ ( f[ h >> 2 ] | 0 ) + ( V << 2 ) >> 2 ] = R; f[ ( f[ a >> 2 ] | 0 ) + ( R << 2 ) >> 2 ] = V; V = R + 1 | 0; W = ( ( V >>> 0 ) % 3 | 0 | 0 ) == 0 ? R + - 2 | 0 : V; do if ( ( W | 0 ) == - 1 )X = - 1; else {

													V = f[ ( f[ x >> 2 ] | 0 ) + ( W << 2 ) >> 2 ] | 0; Y = V + 1 | 0; if ( ( V | 0 ) == - 1 ) {

														X = - 1; break;

													}X = ( ( Y >>> 0 ) % 3 | 0 | 0 ) == 0 ? V + - 2 | 0 : Y;

												} while ( 0 );if ( ( X | 0 ) == ( M | 0 ) ) break; else R = X;

											}

										} else {

											R = M; while ( 1 ) {

												if ( ( R | 0 ) == - 1 ) {

													S = 64; break b;

												}W = ( f[ e >> 2 ] | 0 ) + ( R >>> 5 << 2 ) | 0; f[ W >> 2 ] = f[ W >> 2 ] | 1 << ( R & 31 ); f[ ( f[ h >> 2 ] | 0 ) + ( f[ g >> 2 ] << 2 ) >> 2 ] = R; W = R + 1 | 0; Y = ( ( W >>> 0 ) % 3 | 0 | 0 ) == 0 ? R + - 2 | 0 : W; do if ( ( Y | 0 ) == - 1 )Z = - 1; else {

													W = f[ ( f[ x >> 2 ] | 0 ) + ( Y << 2 ) >> 2 ] | 0; V = W + 1 | 0; if ( ( W | 0 ) == - 1 ) {

														Z = - 1; break;

													}Z = ( ( V >>> 0 ) % 3 | 0 | 0 ) == 0 ? W + - 2 | 0 : V;

												} while ( 0 );if ( ( Z | 0 ) == ( M | 0 ) ) break; else R = Z;

											}

										} while ( 0 );c:do if ( ( S | 0 ) == 64 ) {

											S = 0; if ( ( M | 0 ) == - 1 ) break; R = ( ( ( M >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + M | 0; if ( ( R | 0 ) == - 1 ) break; Y = f[ ( f[ x >> 2 ] | 0 ) + ( R << 2 ) >> 2 ] | 0; if ( ( Y | 0 ) == - 1 ) break; R = Y + ( ( ( Y >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; if ( ( R | 0 ) == - 1 ) break; if ( ! O ) {

												Y = R; while ( 1 ) {

													V = ( f[ e >> 2 ] | 0 ) + ( Y >>> 5 << 2 ) | 0; f[ V >> 2 ] = f[ V >> 2 ] | 1 << ( Y & 31 ); V = ( ( ( Y >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + Y | 0; if ( ( V | 0 ) == - 1 ) break c; W = f[ ( f[ x >> 2 ] | 0 ) + ( V << 2 ) >> 2 ] | 0; if ( ( W | 0 ) == - 1 ) break c; Y = W + ( ( ( W >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; if ( ( Y | 0 ) == - 1 ) break c;

												}

											}Y = f[ a >> 2 ] | 0; W = R; do {

												V = ( f[ e >> 2 ] | 0 ) + ( W >>> 5 << 2 ) | 0; f[ V >> 2 ] = f[ V >> 2 ] | 1 << ( W & 31 ); f[ Y + ( W << 2 ) >> 2 ] = f[ g >> 2 ]; V = ( ( ( W >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + W | 0; if ( ( V | 0 ) == - 1 ) break c; _ = f[ ( f[ x >> 2 ] | 0 ) + ( V << 2 ) >> 2 ] | 0; if ( ( _ | 0 ) == - 1 ) break c; W = _ + ( ( ( _ >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0;

											} while ( ( W | 0 ) != - 1 );

										} while ( 0 );$ = P; aa = T; ba = N;

									} else {

										$ = J; aa = I; ba = F;

									} if ( ( H | 0 ) < 2 ) {

										H = H + 1 | 0; J = $; F = ba; I = aa;

									} else {

										ca = $; da = aa; ea = ba; break;

									}

								}

							} else {

								ca = A; da = D; ea = E;

							}

						} else {

							ca = A; da = D; ea = E;

						}C = C + 1 | 0; B = f[ a >> 2 ] | 0; if ( C >>> 0 >= ( ( ( f[ m >> 2 ] | 0 ) - B >> 2 >>> 0 ) / 3 | 0 ) >>> 0 ) {

							S = 18; break;

						} else {

							A = ca; D = da; E = ea;

						}

					} if ( ( S | 0 ) == 18 ) {

						fa = da; ga = f[ l >> 2 ] | 0; break;

					} else if ( ( S | 0 ) == 50 )um( d );

				} else {

					fa = q; ga = p;

				}

			} else {

				fa = q; ga = p;

			} while ( 0 );p = a + 44 | 0; f[ p >> 2 ] = 0; a = fa; fa = ga >>> 5; q = a + ( fa << 2 ) | 0; S = ga & 31; ga = ( fa | 0 ) != 0; d:do if ( fa | S | 0 ) if ( ! S ) {

				l = a; da = 0; ea = ga; while ( 1 ) {

					e:do if ( ea ) {

						if ( ! ( f[ l >> 2 ] & 1 ) ) {

							ca = da + 1 | 0; f[ p >> 2 ] = ca; ha = ca;

						} else ha = da; if ( ! ( f[ l >> 2 ] & 2 ) ) {

							ca = ha + 1 | 0; f[ p >> 2 ] = ca; ia = ca;

						} else ia = ha; if ( ! ( f[ l >> 2 ] & 4 ) ) {

							ca = ia + 1 | 0; f[ p >> 2 ] = ca; ja = ca;

						} else ja = ia; if ( ! ( f[ l >> 2 ] & 8 ) ) {

							ca = ja + 1 | 0; f[ p >> 2 ] = ca; ka = ca;

						} else ka = ja; if ( ! ( f[ l >> 2 ] & 16 ) ) {

							ca = ka + 1 | 0; f[ p >> 2 ] = ca; la = ca;

						} else la = ka; if ( ! ( f[ l >> 2 ] & 32 ) ) {

							ca = la + 1 | 0; f[ p >> 2 ] = ca; ma = ca;

						} else ma = la; if ( ! ( f[ l >> 2 ] & 64 ) ) {

							ca = ma + 1 | 0; f[ p >> 2 ] = ca; na = ca;

						} else na = ma; if ( ! ( f[ l >> 2 ] & 128 ) ) {

							ca = na + 1 | 0; f[ p >> 2 ] = ca; oa = ca;

						} else oa = na; if ( ! ( f[ l >> 2 ] & 256 ) ) {

							ca = oa + 1 | 0; f[ p >> 2 ] = ca; pa = ca;

						} else pa = oa; if ( ! ( f[ l >> 2 ] & 512 ) ) {

							ca = pa + 1 | 0; f[ p >> 2 ] = ca; qa = ca;

						} else qa = pa; if ( ! ( f[ l >> 2 ] & 1024 ) ) {

							ca = qa + 1 | 0; f[ p >> 2 ] = ca; ra = ca;

						} else ra = qa; if ( ! ( f[ l >> 2 ] & 2048 ) ) {

							ca = ra + 1 | 0; f[ p >> 2 ] = ca; sa = ca;

						} else sa = ra; if ( ! ( f[ l >> 2 ] & 4096 ) ) {

							ca = sa + 1 | 0; f[ p >> 2 ] = ca; ta = ca;

						} else ta = sa; if ( ! ( f[ l >> 2 ] & 8192 ) ) {

							ca = ta + 1 | 0; f[ p >> 2 ] = ca; ua = ca;

						} else ua = ta; if ( ! ( f[ l >> 2 ] & 16384 ) ) {

							ca = ua + 1 | 0; f[ p >> 2 ] = ca; va = ca;

						} else va = ua; if ( ! ( f[ l >> 2 ] & 32768 ) ) {

							ca = va + 1 | 0; f[ p >> 2 ] = ca; wa = ca;

						} else wa = va; if ( ! ( f[ l >> 2 ] & 65536 ) ) {

							ca = wa + 1 | 0; f[ p >> 2 ] = ca; xa = ca;

						} else xa = wa; if ( ! ( f[ l >> 2 ] & 131072 ) ) {

							ca = xa + 1 | 0; f[ p >> 2 ] = ca; ya = ca;

						} else ya = xa; if ( ! ( f[ l >> 2 ] & 262144 ) ) {

							ca = ya + 1 | 0; f[ p >> 2 ] = ca; za = ca;

						} else za = ya; if ( ! ( f[ l >> 2 ] & 524288 ) ) {

							ca = za + 1 | 0; f[ p >> 2 ] = ca; Aa = ca;

						} else Aa = za; if ( ! ( f[ l >> 2 ] & 1048576 ) ) {

							ca = Aa + 1 | 0; f[ p >> 2 ] = ca; Ba = ca;

						} else Ba = Aa; if ( ! ( f[ l >> 2 ] & 2097152 ) ) {

							ca = Ba + 1 | 0; f[ p >> 2 ] = ca; Ca = ca;

						} else Ca = Ba; if ( ! ( f[ l >> 2 ] & 4194304 ) ) {

							ca = Ca + 1 | 0; f[ p >> 2 ] = ca; Da = ca;

						} else Da = Ca; if ( ! ( f[ l >> 2 ] & 8388608 ) ) {

							ca = Da + 1 | 0; f[ p >> 2 ] = ca; Ea = ca;

						} else Ea = Da; if ( ! ( f[ l >> 2 ] & 16777216 ) ) {

							ca = Ea + 1 | 0; f[ p >> 2 ] = ca; Fa = ca;

						} else Fa = Ea; if ( ! ( f[ l >> 2 ] & 33554432 ) ) {

							ca = Fa + 1 | 0; f[ p >> 2 ] = ca; Ga = ca;

						} else Ga = Fa; if ( ! ( f[ l >> 2 ] & 67108864 ) ) {

							ca = Ga + 1 | 0; f[ p >> 2 ] = ca; Ha = ca;

						} else Ha = Ga; if ( ! ( f[ l >> 2 ] & 134217728 ) ) {

							ca = Ha + 1 | 0; f[ p >> 2 ] = ca; Ia = ca;

						} else Ia = Ha; if ( ! ( f[ l >> 2 ] & 268435456 ) ) {

							ca = Ia + 1 | 0; f[ p >> 2 ] = ca; Ja = ca;

						} else Ja = Ia; if ( ! ( f[ l >> 2 ] & 536870912 ) ) {

							ca = Ja + 1 | 0; f[ p >> 2 ] = ca; Ka = ca;

						} else Ka = Ja; if ( ! ( f[ l >> 2 ] & 1073741824 ) ) {

							ca = Ka + 1 | 0; f[ p >> 2 ] = ca; La = ca;

						} else La = Ka; if ( ( f[ l >> 2 ] | 0 ) <= - 1 ) {

							Ma = La; break;

						}ca = La + 1 | 0; f[ p >> 2 ] = ca; Ma = ca;

					} else {

						ca = 0; m = da; while ( 1 ) {

							if ( ! ( f[ l >> 2 ] & 1 << ca ) ) {

								ba = m + 1 | 0; f[ p >> 2 ] = ba; Na = ba;

							} else Na = m; if ( ( ca | 0 ) == 31 ) {

								Ma = Na; break e;

							}ca = ca + 1 | 0; if ( ! ca ) break d; else m = Na;

						}

					} while ( 0 );l = l + 4 | 0; if ( ( q | 0 ) == ( l | 0 ) ) break; else {

						da = Ma; ea = 1;

					}

				}

			} else {

				if ( ga ) {

					ea = 0; da = a; l = 0; while ( 1 ) {

						if ( ! ( f[ da >> 2 ] & 1 ) ) {

							m = l + 1 | 0; f[ p >> 2 ] = m; Oa = m; Pa = m;

						} else {

							Oa = l; Pa = ea;

						} if ( ! ( f[ da >> 2 ] & 2 ) ) {

							m = Oa + 1 | 0; f[ p >> 2 ] = m; Qa = m; Ra = m;

						} else {

							Qa = Oa; Ra = Pa;

						} if ( ! ( f[ da >> 2 ] & 4 ) ) {

							m = Qa + 1 | 0; f[ p >> 2 ] = m; Sa = m; Ta = m;

						} else {

							Sa = Qa; Ta = Ra;

						} if ( ! ( f[ da >> 2 ] & 8 ) ) {

							m = Sa + 1 | 0; f[ p >> 2 ] = m; Ua = m; Va = m;

						} else {

							Ua = Sa; Va = Ta;

						} if ( ! ( f[ da >> 2 ] & 16 ) ) {

							m = Ua + 1 | 0; f[ p >> 2 ] = m; Wa = m; Xa = m;

						} else {

							Wa = Ua; Xa = Va;

						} if ( ! ( f[ da >> 2 ] & 32 ) ) {

							m = Wa + 1 | 0; f[ p >> 2 ] = m; Ya = m; Za = m;

						} else {

							Ya = Wa; Za = Xa;

						} if ( ! ( f[ da >> 2 ] & 64 ) ) {

							m = Ya + 1 | 0; f[ p >> 2 ] = m; _a = m; $a = m;

						} else {

							_a = Ya; $a = Za;

						} if ( ! ( f[ da >> 2 ] & 128 ) ) {

							m = _a + 1 | 0; f[ p >> 2 ] = m; ab = m; bb = m;

						} else {

							ab = _a; bb = $a;

						} if ( ! ( f[ da >> 2 ] & 256 ) ) {

							m = ab + 1 | 0; f[ p >> 2 ] = m; cb = m; db = m;

						} else {

							cb = ab; db = bb;

						} if ( ! ( f[ da >> 2 ] & 512 ) ) {

							m = cb + 1 | 0; f[ p >> 2 ] = m; eb = m; fb = m;

						} else {

							eb = cb; fb = db;

						} if ( ! ( f[ da >> 2 ] & 1024 ) ) {

							m = eb + 1 | 0; f[ p >> 2 ] = m; gb = m; hb = m;

						} else {

							gb = eb; hb = fb;

						} if ( ! ( f[ da >> 2 ] & 2048 ) ) {

							m = gb + 1 | 0; f[ p >> 2 ] = m; ib = m; jb = m;

						} else {

							ib = gb; jb = hb;

						} if ( ! ( f[ da >> 2 ] & 4096 ) ) {

							m = ib + 1 | 0; f[ p >> 2 ] = m; kb = m; lb = m;

						} else {

							kb = ib; lb = jb;

						} if ( ! ( f[ da >> 2 ] & 8192 ) ) {

							m = kb + 1 | 0; f[ p >> 2 ] = m; mb = m; nb = m;

						} else {

							mb = kb; nb = lb;

						} if ( ! ( f[ da >> 2 ] & 16384 ) ) {

							m = mb + 1 | 0; f[ p >> 2 ] = m; ob = m; pb = m;

						} else {

							ob = mb; pb = nb;

						} if ( ! ( f[ da >> 2 ] & 32768 ) ) {

							m = ob + 1 | 0; f[ p >> 2 ] = m; qb = m; rb = m;

						} else {

							qb = ob; rb = pb;

						} if ( ! ( f[ da >> 2 ] & 65536 ) ) {

							m = qb + 1 | 0; f[ p >> 2 ] = m; sb = m; tb = m;

						} else {

							sb = qb; tb = rb;

						} if ( ! ( f[ da >> 2 ] & 131072 ) ) {

							m = sb + 1 | 0; f[ p >> 2 ] = m; ub = m; vb = m;

						} else {

							ub = sb; vb = tb;

						} if ( ! ( f[ da >> 2 ] & 262144 ) ) {

							m = ub + 1 | 0; f[ p >> 2 ] = m; wb = m; xb = m;

						} else {

							wb = ub; xb = vb;

						} if ( ! ( f[ da >> 2 ] & 524288 ) ) {

							m = wb + 1 | 0; f[ p >> 2 ] = m; yb = m; zb = m;

						} else {

							yb = wb; zb = xb;

						} if ( ! ( f[ da >> 2 ] & 1048576 ) ) {

							m = yb + 1 | 0; f[ p >> 2 ] = m; Ab = m; Bb = m;

						} else {

							Ab = yb; Bb = zb;

						} if ( ! ( f[ da >> 2 ] & 2097152 ) ) {

							m = Ab + 1 | 0; f[ p >> 2 ] = m; Cb = m; Db = m;

						} else {

							Cb = Ab; Db = Bb;

						} if ( ! ( f[ da >> 2 ] & 4194304 ) ) {

							m = Cb + 1 | 0; f[ p >> 2 ] = m; Eb = m; Fb = m;

						} else {

							Eb = Cb; Fb = Db;

						} if ( ! ( f[ da >> 2 ] & 8388608 ) ) {

							m = Eb + 1 | 0; f[ p >> 2 ] = m; Gb = m; Hb = m;

						} else {

							Gb = Eb; Hb = Fb;

						} if ( ! ( f[ da >> 2 ] & 16777216 ) ) {

							m = Gb + 1 | 0; f[ p >> 2 ] = m; Ib = m; Jb = m;

						} else {

							Ib = Gb; Jb = Hb;

						} if ( ! ( f[ da >> 2 ] & 33554432 ) ) {

							m = Ib + 1 | 0; f[ p >> 2 ] = m; Kb = m; Lb = m;

						} else {

							Kb = Ib; Lb = Jb;

						} if ( ! ( f[ da >> 2 ] & 67108864 ) ) {

							m = Kb + 1 | 0; f[ p >> 2 ] = m; Mb = m; Nb = m;

						} else {

							Mb = Kb; Nb = Lb;

						} if ( ! ( f[ da >> 2 ] & 134217728 ) ) {

							m = Mb + 1 | 0; f[ p >> 2 ] = m; Ob = m; Pb = m;

						} else {

							Ob = Mb; Pb = Nb;

						} if ( ! ( f[ da >> 2 ] & 268435456 ) ) {

							m = Ob + 1 | 0; f[ p >> 2 ] = m; Qb = m; Rb = m;

						} else {

							Qb = Ob; Rb = Pb;

						} if ( ! ( f[ da >> 2 ] & 536870912 ) ) {

							m = Qb + 1 | 0; f[ p >> 2 ] = m; Sb = m; Tb = m;

						} else {

							Sb = Qb; Tb = Rb;

						} if ( ! ( f[ da >> 2 ] & 1073741824 ) ) {

							m = Sb + 1 | 0; f[ p >> 2 ] = m; Ub = m; Vb = m;

						} else {

							Ub = Sb; Vb = Tb;

						} if ( ( f[ da >> 2 ] | 0 ) > - 1 ) {

							m = Ub + 1 | 0; f[ p >> 2 ] = m; Wb = m; Xb = m;

						} else {

							Wb = Ub; Xb = Vb;

						}m = da + 4 | 0; if ( ( q | 0 ) == ( m | 0 ) ) {

							Yb = m; Zb = Xb; break;

						} else {

							ea = Xb; da = m; l = Wb;

						}

					}

				} else {

					Yb = a; Zb = 0;

				}l = 0; da = Zb; while ( 1 ) {

					if ( ! ( f[ Yb >> 2 ] & 1 << l ) ) {

						ea = da + 1 | 0; f[ p >> 2 ] = ea; _b = ea;

					} else _b = da; l = l + 1 | 0; if ( ( l | 0 ) == ( S | 0 ) ) break; else da = _b;

				}

			} while ( 0 );_b = f[ e >> 2 ] | 0; if ( _b | 0 )dn( _b ); _b = f[ d >> 2 ] | 0; if ( ! _b ) {

				u = c; return 1;

			}dn( _b ); u = c; return 1;

		} function bb( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var i = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = La, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0; if ( ! g ) {

				i = 0; return i | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					k = a + 24 | 0; l = b[ k >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; q = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; r = Rj( q | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = m + r | 0; if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

							r = o; m = 0; while ( 1 ) {

								s = $( b[ r >> 0 ] | 0 ); n[ g + ( m << 2 ) >> 2 ] = s; m = m + 1 | 0; q = b[ k >> 0 ] | 0; if ( ( m | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

									t = q; break;

								} else r = r + 1 | 0;

							}

						} else {

							r = o; m = 0; while ( 1 ) {

								s = $( $( b[ r >> 0 ] | 0 ) / $( 127.0 ) ); n[ g + ( m << 2 ) >> 2 ] = s; m = m + 1 | 0; q = b[ k >> 0 ] | 0; if ( ( m | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

									t = q; break;

								} else r = r + 1 | 0;

							}

						}

					} else t = l; r = t << 24 >> 24; if ( t << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( r << 2 ) | 0, 0, ( e << 24 >> 24 ) - r << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 2: {

					r = a + 24 | 0; m = b[ r >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; q = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; u = Rj( q | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = k + u | 0; if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

							u = o; k = 0; while ( 1 ) {

								s = $( h[ u >> 0 ] | 0 ); n[ g + ( k << 2 ) >> 2 ] = s; k = k + 1 | 0; q = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

									v = q; break;

								} else u = u + 1 | 0;

							}

						} else {

							u = o; k = 0; while ( 1 ) {

								s = $( $( h[ u >> 0 ] | 0 ) / $( 255.0 ) ); n[ g + ( k << 2 ) >> 2 ] = s; k = k + 1 | 0; l = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

									v = l; break;

								} else u = u + 1 | 0;

							}

						}

					} else v = m; u = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( u << 2 ) | 0, 0, ( e << 24 >> 24 ) - u << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 3: {

					u = a + 48 | 0; k = f[ u >> 2 ] | 0; r = f[ u + 4 >> 2 ] | 0; u = a + 40 | 0; o = ( Rj( gj( f[ u >> 2 ] | 0, f[ u + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0, I | 0, k | 0, r | 0 ) | 0 ) + ( f[ f[ a >> 2 ] >> 2 ] | 0 ) | 0; r = a + 24 | 0; k = b[ r >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

						u = o; l = 0; while ( 1 ) {

							s = $( d[ u >> 1 ] | 0 ); n[ g + ( l << 2 ) >> 2 ] = s; l = l + 1 | 0; q = b[ r >> 0 ] | 0; if ( ( l | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								w = q; break;

							} else u = u + 2 | 0;

						}

					} else {

						u = o; l = 0; while ( 1 ) {

							s = $( $( d[ u >> 1 ] | 0 ) / $( 32767.0 ) ); n[ g + ( l << 2 ) >> 2 ] = s; l = l + 1 | 0; m = b[ r >> 0 ] | 0; if ( ( l | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								w = m; break;

							} else u = u + 2 | 0;

						}

					} else w = k; u = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( u << 2 ) | 0, 0, ( e << 24 >> 24 ) - u << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 4: {

					u = a + 48 | 0; l = f[ u >> 2 ] | 0; r = f[ u + 4 >> 2 ] | 0; u = a + 40 | 0; o = ( Rj( gj( f[ u >> 2 ] | 0, f[ u + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0, I | 0, l | 0, r | 0 ) | 0 ) + ( f[ f[ a >> 2 ] >> 2 ] | 0 ) | 0; r = a + 24 | 0; l = b[ r >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

						u = o; m = 0; while ( 1 ) {

							s = $( j[ u >> 1 ] | 0 ); n[ g + ( m << 2 ) >> 2 ] = s; m = m + 1 | 0; q = b[ r >> 0 ] | 0; if ( ( m | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								x = q; break;

							} else u = u + 2 | 0;

						}

					} else {

						u = o; m = 0; while ( 1 ) {

							s = $( $( j[ u >> 1 ] | 0 ) / $( 65535.0 ) ); n[ g + ( m << 2 ) >> 2 ] = s; m = m + 1 | 0; k = b[ r >> 0 ] | 0; if ( ( m | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								x = k; break;

							} else u = u + 2 | 0;

						}

					} else x = l; u = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( u << 2 ) | 0, 0, ( e << 24 >> 24 ) - u << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 5: {

					u = a + 48 | 0; m = f[ u >> 2 ] | 0; r = f[ u + 4 >> 2 ] | 0; u = a + 40 | 0; o = ( Rj( gj( f[ u >> 2 ] | 0, f[ u + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0, I | 0, m | 0, r | 0 ) | 0 ) + ( f[ f[ a >> 2 ] >> 2 ] | 0 ) | 0; r = a + 24 | 0; m = b[ r >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

						u = o; k = 0; while ( 1 ) {

							s = $( f[ u >> 2 ] | 0 ); n[ g + ( k << 2 ) >> 2 ] = s; k = k + 1 | 0; q = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								y = q; break;

							} else u = u + 4 | 0;

						}

					} else {

						u = o; k = 0; while ( 1 ) {

							s = $( $( f[ u >> 2 ] | 0 ) * $( 4.65661287e-10 ) ); n[ g + ( k << 2 ) >> 2 ] = s; k = k + 1 | 0; l = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								y = l; break;

							} else u = u + 4 | 0;

						}

					} else y = m; u = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( u << 2 ) | 0, 0, ( e << 24 >> 24 ) - u << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 6: {

					u = a + 48 | 0; k = f[ u >> 2 ] | 0; r = f[ u + 4 >> 2 ] | 0; u = a + 40 | 0; o = ( Rj( gj( f[ u >> 2 ] | 0, f[ u + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0, I | 0, k | 0, r | 0 ) | 0 ) + ( f[ f[ a >> 2 ] >> 2 ] | 0 ) | 0; r = a + 24 | 0; k = b[ r >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

						u = o; l = 0; while ( 1 ) {

							s = $( ( f[ u >> 2 ] | 0 ) >>> 0 ); n[ g + ( l << 2 ) >> 2 ] = s; l = l + 1 | 0; q = b[ r >> 0 ] | 0; if ( ( l | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								z = q; break;

							} else u = u + 4 | 0;

						}

					} else {

						u = o; l = 0; while ( 1 ) {

							s = $( $( ( f[ u >> 2 ] | 0 ) >>> 0 ) * $( 2.32830644e-10 ) ); n[ g + ( l << 2 ) >> 2 ] = s; l = l + 1 | 0; m = b[ r >> 0 ] | 0; if ( ( l | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								z = m; break;

							} else u = u + 4 | 0;

						}

					} else z = k; u = z << 24 >> 24; if ( z << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( u << 2 ) | 0, 0, ( e << 24 >> 24 ) - u << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 7: {

					u = a + 48 | 0; l = f[ u >> 2 ] | 0; r = f[ u + 4 >> 2 ] | 0; u = a + 40 | 0; o = ( Rj( gj( f[ u >> 2 ] | 0, f[ u + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0, I | 0, l | 0, r | 0 ) | 0 ) + ( f[ f[ a >> 2 ] >> 2 ] | 0 ) | 0; r = a + 24 | 0; l = b[ r >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

						u = o; m = 0; while ( 1 ) {

							q = u; s = $( + ( ( f[ q >> 2 ] | 0 ) >>> 0 ) + 4294967296.0 * + ( f[ q + 4 >> 2 ] | 0 ) ); n[ g + ( m << 2 ) >> 2 ] = s; m = m + 1 | 0; q = b[ r >> 0 ] | 0; if ( ( m | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								A = q; break;

							} else u = u + 8 | 0;

						}

					} else {

						u = o; m = 0; while ( 1 ) {

							k = u; s = $( $( + ( ( f[ k >> 2 ] | 0 ) >>> 0 ) + 4294967296.0 * + ( f[ k + 4 >> 2 ] | 0 ) ) * $( 1.08420217e-19 ) ); n[ g + ( m << 2 ) >> 2 ] = s; m = m + 1 | 0; k = b[ r >> 0 ] | 0; if ( ( m | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								A = k; break;

							} else u = u + 8 | 0;

						}

					} else A = l; u = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( u << 2 ) | 0, 0, ( e << 24 >> 24 ) - u << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 8: {

					u = a + 48 | 0; m = f[ u >> 2 ] | 0; r = f[ u + 4 >> 2 ] | 0; u = a + 40 | 0; o = ( Rj( gj( f[ u >> 2 ] | 0, f[ u + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0, I | 0, m | 0, r | 0 ) | 0 ) + ( f[ f[ a >> 2 ] >> 2 ] | 0 ) | 0; r = a + 24 | 0; m = b[ r >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) if ( ! ( b[ a + 32 >> 0 ] | 0 ) ) {

						u = o; k = 0; while ( 1 ) {

							q = u; s = $( + ( ( f[ q >> 2 ] | 0 ) >>> 0 ) + 4294967296.0 * + ( ( f[ q + 4 >> 2 ] | 0 ) >>> 0 ) ); n[ g + ( k << 2 ) >> 2 ] = s; k = k + 1 | 0; q = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								B = q; break;

							} else u = u + 8 | 0;

						}

					} else {

						u = o; k = 0; while ( 1 ) {

							l = u; s = $( $( + ( ( f[ l >> 2 ] | 0 ) >>> 0 ) + 4294967296.0 * + ( ( f[ l + 4 >> 2 ] | 0 ) >>> 0 ) ) * $( 5.42101086e-20 ) ); n[ g + ( k << 2 ) >> 2 ] = s; k = k + 1 | 0; l = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								B = l; break;

							} else u = u + 8 | 0;

						}

					} else B = m; u = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( u << 2 ) | 0, 0, ( e << 24 >> 24 ) - u << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 9: {

					u = a + 24 | 0; k = b[ u >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						r = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; l = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; q = Rj( l | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = r + q | 0; q = 0; while ( 1 ) {

							f[ g + ( q << 2 ) >> 2 ] = f[ o >> 2 ]; q = q + 1 | 0; r = b[ u >> 0 ] | 0; if ( ( q | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								C = r; break;

							} else o = o + 4 | 0;

						}

					} else C = k; o = C << 24 >> 24; if ( C << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 2 ) | 0, 0, ( e << 24 >> 24 ) - o << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 10: {

					o = a + 24 | 0; q = b[ o >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						u = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; r = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; l = Rj( r | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = u + l | 0; l = 0; while ( 1 ) {

							s = $( + p[ m >> 3 ] ); n[ g + ( l << 2 ) >> 2 ] = s; l = l + 1 | 0; u = b[ o >> 0 ] | 0; if ( ( l | 0 ) >= ( ( u << 24 >> 24 > e << 24 >> 24 ? e : u ) << 24 >> 24 | 0 ) ) {

								D = u; break;

							} else m = m + 8 | 0;

						}

					} else D = q; m = D << 24 >> 24; if ( D << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 2 ) | 0, 0, ( e << 24 >> 24 ) - m << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 11: {

					m = a + 24 | 0; l = b[ m >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; u = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; r = Rj( u | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = o + r | 0; r = 0; while ( 1 ) {

							s = $( ( b[ k >> 0 ] | 0 ) != 0 & 1 ); n[ g + ( r << 2 ) >> 2 ] = s; r = r + 1 | 0; o = b[ m >> 0 ] | 0; if ( ( r | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								E = o; break;

							} else k = k + 1 | 0;

						}

					} else E = l; k = E << 24 >> 24; if ( E << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 2 ) | 0, 0, ( e << 24 >> 24 ) - k << 2 | 0 ) | 0; i = 1; return i | 0;

				} default: {

					i = 0; return i | 0;

				}

			} while ( 0 );return 0;

		} function cb( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0; g = u; u = u + 64 | 0; d = g + 16 | 0; h = g; i = a + 8 | 0; f[ i >> 2 ] = e; j = a + 32 | 0; k = a + 36 | 0; l = f[ k >> 2 ] | 0; m = f[ j >> 2 ] | 0; n = l - m >> 2; o = m; m = l; if ( n >>> 0 >= e >>> 0 ) {

				if ( n >>> 0 > e >>> 0 ? ( l = o + ( e << 2 ) | 0, ( l | 0 ) != ( m | 0 ) ) : 0 )f[ k >> 2 ] = m + ( ~ ( ( m + - 4 - l | 0 ) >>> 2 ) << 2 );

			} else ff( j, e - n | 0 ); n = d; j = n + 48 | 0; do {

				f[ n >> 2 ] = 0; n = n + 4 | 0;

			} while ( ( n | 0 ) < ( j | 0 ) );f[ h >> 2 ] = 0; if ( ! e ) {

				p = 0; q = 0;

			} else {

				Ae( d, e, h ); p = f[ d + 12 >> 2 ] | 0; q = f[ d + 16 >> 2 ] | 0;

			}f[ h >> 2 ] = 0; n = d + 16 | 0; j = q - p >> 2; l = p; p = q; if ( j >>> 0 >= e >>> 0 ) {

				if ( j >>> 0 > e >>> 0 ? ( q = l + ( e << 2 ) | 0, ( q | 0 ) != ( p | 0 ) ) : 0 )f[ n >> 2 ] = p + ( ~ ( ( p + - 4 - q | 0 ) >>> 2 ) << 2 );

			} else Ae( d + 12 | 0, e - j | 0, h ); j = d + 24 | 0; f[ h >> 2 ] = 0; q = d + 28 | 0; p = f[ q >> 2 ] | 0; n = f[ j >> 2 ] | 0; l = p - n >> 2; m = n; n = p; if ( l >>> 0 >= e >>> 0 ) {

				if ( l >>> 0 > e >>> 0 ? ( p = m + ( e << 2 ) | 0, ( p | 0 ) != ( n | 0 ) ) : 0 )f[ q >> 2 ] = n + ( ~ ( ( n + - 4 - p | 0 ) >>> 2 ) << 2 );

			} else Ae( j, e - l | 0, h ); l = d + 36 | 0; f[ h >> 2 ] = 0; j = d + 40 | 0; p = f[ j >> 2 ] | 0; n = f[ l >> 2 ] | 0; q = p - n >> 2; m = n; n = p; if ( q >>> 0 >= e >>> 0 ) {

				if ( q >>> 0 > e >>> 0 ? ( p = m + ( e << 2 ) | 0, ( p | 0 ) != ( n | 0 ) ) : 0 )f[ j >> 2 ] = n + ( ~ ( ( n + - 4 - p | 0 ) >>> 2 ) << 2 );

			} else Ae( l, e - q | 0, h ); q = f[ d >> 2 ] | 0; if ( ( f[ i >> 2 ] | 0 ) > 0 ) {

				l = a + 16 | 0; p = a + 32 | 0; n = a + 12 | 0; j = 0; do {

					m = f[ q + ( j << 2 ) >> 2 ] | 0; k = f[ l >> 2 ] | 0; if ( ( m | 0 ) > ( k | 0 ) ) {

						o = f[ p >> 2 ] | 0; f[ o + ( j << 2 ) >> 2 ] = k; r = o;

					} else {

						o = f[ n >> 2 ] | 0; k = f[ p >> 2 ] | 0; f[ k + ( j << 2 ) >> 2 ] = ( m | 0 ) < ( o | 0 ) ? o : m; r = k;

					}j = j + 1 | 0; s = f[ i >> 2 ] | 0;

				} while ( ( j | 0 ) < ( s | 0 ) );if ( ( s | 0 ) > 0 ) {

					s = a + 20 | 0; j = 0; do {

						p = ( f[ b + ( j << 2 ) >> 2 ] | 0 ) + ( f[ r + ( j << 2 ) >> 2 ] | 0 ) | 0; q = c + ( j << 2 ) | 0; f[ q >> 2 ] = p; if ( ( p | 0 ) <= ( f[ l >> 2 ] | 0 ) ) {

							if ( ( p | 0 ) < ( f[ n >> 2 ] | 0 ) ) {

								t = ( f[ s >> 2 ] | 0 ) + p | 0; v = 18;

							}

						} else {

							t = p - ( f[ s >> 2 ] | 0 ) | 0; v = 18;

						} if ( ( v | 0 ) == 18 ) {

							v = 0; f[ q >> 2 ] = t;

						}j = j + 1 | 0;

					} while ( ( j | 0 ) < ( f[ i >> 2 ] | 0 ) );

				}

			}j = f[ a + 48 >> 2 ] | 0; t = f[ a + 52 >> 2 ] | 0; s = bj( 16 ) | 0; f[ s >> 2 ] = 0; f[ s + 4 >> 2 ] = 0; f[ s + 8 >> 2 ] = 0; f[ s + 12 >> 2 ] = 0; f[ h >> 2 ] = 0; n = h + 4 | 0; f[ n >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; do if ( e ) if ( e >>> 0 > 1073741823 )um( h ); else {

				l = e << 2; r = bj( l ) | 0; f[ h >> 2 ] = r; q = r + ( e << 2 ) | 0; f[ h + 8 >> 2 ] = q; Vf( r | 0, 0, l | 0 ) | 0; f[ n >> 2 ] = q; w = r; x = r; break;

			} else {

				w = 0; x = 0;

			} while ( 0 );r = a + 56 | 0; q = f[ r >> 2 ] | 0; l = f[ q + 4 >> 2 ] | 0; p = f[ q >> 2 ] | 0; k = l - p | 0; m = k >> 2; do if ( ( k | 0 ) > 4 ) {

				o = j + 64 | 0; y = j + 28 | 0; z = ( e | 0 ) > 0; A = a + 16 | 0; B = a + 32 | 0; C = a + 12 | 0; D = a + 20 | 0; E = e << 2; F = ( e | 0 ) == 1; if ( l - p >> 2 >>> 0 > 1 ) {

					G = 1; H = p;

				} else {

					I = q; um( I );

				} while ( 1 ) {

					J = f[ H + ( G << 2 ) >> 2 ] | 0; K = ( ( ( J >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + J | 0; L = K >>> 5; M = 1 << ( K & 31 ); N = ( J | 0 ) == - 1 | ( K | 0 ) == - 1; O = 1; P = 0; Q = J; a:while ( 1 ) {

						R = O ^ 1; S = P; T = Q; while ( 1 ) {

							if ( ( T | 0 ) == - 1 ) {

								U = S; v = 64; break a;

							}V = f[ d + ( S * 12 | 0 ) >> 2 ] | 0; if ( ( ( f[ ( f[ j >> 2 ] | 0 ) + ( T >>> 5 << 2 ) >> 2 ] & 1 << ( T & 31 ) | 0 ) == 0 ? ( W = f[ ( f[ ( f[ o >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( T << 2 ) >> 2 ] | 0, ( W | 0 ) != - 1 ) : 0 ) ? ( Y = f[ y >> 2 ] | 0, Z = f[ t >> 2 ] | 0, _ = f[ Z + ( f[ Y + ( W << 2 ) >> 2 ] << 2 ) >> 2 ] | 0, $ = W + 1 | 0, aa = f[ Z + ( f[ Y + ( ( ( ( $ >>> 0 ) % 3 | 0 | 0 ) == 0 ? W + - 2 | 0 : $ ) << 2 ) >> 2 ] << 2 ) >> 2 ] | 0, $ = f[ Z + ( f[ Y + ( ( ( ( W >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + W << 2 ) >> 2 ] << 2 ) >> 2 ] | 0, ( _ | 0 ) < ( G | 0 ) & ( aa | 0 ) < ( G | 0 ) & ( $ | 0 ) < ( G | 0 ) ) : 0 ) {

								W = X( _, e ) | 0; _ = X( aa, e ) | 0; aa = X( $, e ) | 0; if ( z ) {

									$ = 0; do {

										f[ V + ( $ << 2 ) >> 2 ] = ( f[ c + ( $ + aa << 2 ) >> 2 ] | 0 ) + ( f[ c + ( $ + _ << 2 ) >> 2 ] | 0 ) - ( f[ c + ( $ + W << 2 ) >> 2 ] | 0 ); $ = $ + 1 | 0;

									} while ( ( $ | 0 ) != ( e | 0 ) );

								}$ = S + 1 | 0; if ( ( $ | 0 ) == 4 ) {

									ba = 4; v = 44; break a;

								} else ca = $;

							} else ca = S; do if ( O ) {

								$ = T + 1 | 0; W = ( ( $ >>> 0 ) % 3 | 0 | 0 ) == 0 ? T + - 2 | 0 : $; if ( ( ( W | 0 ) != - 1 ? ( f[ ( f[ j >> 2 ] | 0 ) + ( W >>> 5 << 2 ) >> 2 ] & 1 << ( W & 31 ) | 0 ) == 0 : 0 ) ? ( $ = f[ ( f[ ( f[ o >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( W << 2 ) >> 2 ] | 0, W = $ + 1 | 0, ( $ | 0 ) != - 1 ) : 0 )da = ( ( W >>> 0 ) % 3 | 0 | 0 ) == 0 ? $ + - 2 | 0 : W; else da = - 1;

							} else {

								W = ( ( ( T >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + T | 0; if ( ( ( W | 0 ) != - 1 ? ( f[ ( f[ j >> 2 ] | 0 ) + ( W >>> 5 << 2 ) >> 2 ] & 1 << ( W & 31 ) | 0 ) == 0 : 0 ) ? ( $ = f[ ( f[ ( f[ o >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( W << 2 ) >> 2 ] | 0, ( $ | 0 ) != - 1 ) : 0 ) if ( ! ( ( $ >>> 0 ) % 3 | 0 ) ) {

									da = $ + 2 | 0; break;

								} else {

									da = $ + - 1 | 0; break;

								} else da = - 1;

							} while ( 0 );if ( ( da | 0 ) == ( J | 0 ) ) {

								U = ca; v = 64; break a;

							} if ( ( da | 0 ) != - 1 | R ) {

								S = ca; T = da;

							} else break;

						} if ( N ) {

							O = 0; P = ca; Q = - 1; continue;

						} if ( f[ ( f[ j >> 2 ] | 0 ) + ( L << 2 ) >> 2 ] & M | 0 ) {

							O = 0; P = ca; Q = - 1; continue;

						}T = f[ ( f[ ( f[ o >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( K << 2 ) >> 2 ] | 0; if ( ( T | 0 ) == - 1 ) {

							O = 0; P = ca; Q = - 1; continue;

						} if ( ! ( ( T >>> 0 ) % 3 | 0 ) ) {

							O = 0; P = ca; Q = T + 2 | 0; continue;

						} else {

							O = 0; P = ca; Q = T + - 1 | 0; continue;

						}

					} if ( ( v | 0 ) == 64 ) {

						v = 0; if ( ( U | 0 ) > 0 ) {

							ba = U; v = 44;

						} else {

							ea = X( G, e ) | 0; v = 77;

						}

					} if ( ( v | 0 ) == 44 ) {

						v = 0; if ( z ) {

							Vf( f[ h >> 2 ] | 0, 0, E | 0 ) | 0; Q = ba + - 1 | 0; P = s + ( Q << 2 ) | 0; O = f[ a + 60 + ( Q * 12 | 0 ) >> 2 ] | 0; Q = f[ h >> 2 ] | 0; K = 0; M = 0; while ( 1 ) {

								L = f[ P >> 2 ] | 0; f[ P >> 2 ] = L + 1; if ( ! ( f[ O + ( L >>> 5 << 2 ) >> 2 ] & 1 << ( L & 31 ) ) ) {

									L = f[ d + ( K * 12 | 0 ) >> 2 ] | 0; N = 0; do {

										J = Q + ( N << 2 ) | 0; f[ J >> 2 ] = ( f[ J >> 2 ] | 0 ) + ( f[ L + ( N << 2 ) >> 2 ] | 0 ); N = N + 1 | 0;

									} while ( ( N | 0 ) != ( e | 0 ) );fa = M + 1 | 0;

								} else fa = M; K = K + 1 | 0; if ( ( K | 0 ) == ( ba | 0 ) ) {

									ga = fa; break;

								} else M = fa;

							}

						} else {

							M = ba + - 1 | 0; K = s + ( M << 2 ) | 0; Q = f[ a + 60 + ( M * 12 | 0 ) >> 2 ] | 0; M = 0; O = 0; P = f[ K >> 2 ] | 0; while ( 1 ) {

								N = P; P = P + 1 | 0; f[ K >> 2 ] = P; L = O + ( ( f[ Q + ( N >>> 5 << 2 ) >> 2 ] & 1 << ( N & 31 ) | 0 ) == 0 & 1 ) | 0; M = M + 1 | 0; if ( ( M | 0 ) == ( ba | 0 ) ) {

									ga = L; break;

								} else O = L;

							}

						}O = X( G, e ) | 0; if ( ga ) {

							M = f[ h >> 2 ] | 0; if ( z ? ( f[ M >> 2 ] = ( f[ M >> 2 ] | 0 ) / ( ga | 0 ) | 0, ! F ) : 0 ) {

								Q = 1; do {

									P = M + ( Q << 2 ) | 0; f[ P >> 2 ] = ( f[ P >> 2 ] | 0 ) / ( ga | 0 ) | 0; Q = Q + 1 | 0;

								} while ( ( Q | 0 ) != ( e | 0 ) );

							}Q = b + ( O << 2 ) | 0; P = c + ( O << 2 ) | 0; if ( ( f[ i >> 2 ] | 0 ) > 0 ) {

								K = 0; do {

									L = f[ M + ( K << 2 ) >> 2 ] | 0; N = f[ A >> 2 ] | 0; if ( ( L | 0 ) > ( N | 0 ) ) {

										J = f[ B >> 2 ] | 0; f[ J + ( K << 2 ) >> 2 ] = N; ha = J;

									} else {

										J = f[ C >> 2 ] | 0; N = f[ B >> 2 ] | 0; f[ N + ( K << 2 ) >> 2 ] = ( L | 0 ) < ( J | 0 ) ? J : L; ha = N;

									}K = K + 1 | 0; ia = f[ i >> 2 ] | 0;

								} while ( ( K | 0 ) < ( ia | 0 ) );if ( ( ia | 0 ) > 0 ) {

									K = 0; do {

										M = ( f[ Q + ( K << 2 ) >> 2 ] | 0 ) + ( f[ ha + ( K << 2 ) >> 2 ] | 0 ) | 0; N = P + ( K << 2 ) | 0; f[ N >> 2 ] = M; do if ( ( M | 0 ) > ( f[ A >> 2 ] | 0 ) ) {

											ja = M - ( f[ D >> 2 ] | 0 ) | 0; v = 99;

										} else {

											if ( ( M | 0 ) >= ( f[ C >> 2 ] | 0 ) ) break; ja = ( f[ D >> 2 ] | 0 ) + M | 0; v = 99;

										} while ( 0 );if ( ( v | 0 ) == 99 ) {

											v = 0; f[ N >> 2 ] = ja;

										}K = K + 1 | 0;

									} while ( ( K | 0 ) < ( f[ i >> 2 ] | 0 ) );

								}

							}

						} else {

							ea = O; v = 77;

						}

					} if ( ( v | 0 ) == 77 ? ( v = 0, K = c + ( ( X( G + - 1 | 0, e ) | 0 ) << 2 ) | 0, P = b + ( ea << 2 ) | 0, Q = c + ( ea << 2 ) | 0, ( f[ i >> 2 ] | 0 ) > 0 ) : 0 ) {

						M = 0; do {

							L = f[ K + ( M << 2 ) >> 2 ] | 0; J = f[ A >> 2 ] | 0; if ( ( L | 0 ) > ( J | 0 ) ) {

								T = f[ B >> 2 ] | 0; f[ T + ( M << 2 ) >> 2 ] = J; ka = T;

							} else {

								T = f[ C >> 2 ] | 0; J = f[ B >> 2 ] | 0; f[ J + ( M << 2 ) >> 2 ] = ( L | 0 ) < ( T | 0 ) ? T : L; ka = J;

							}M = M + 1 | 0; la = f[ i >> 2 ] | 0;

						} while ( ( M | 0 ) < ( la | 0 ) );if ( ( la | 0 ) > 0 ) {

							M = 0; do {

								K = ( f[ P + ( M << 2 ) >> 2 ] | 0 ) + ( f[ ka + ( M << 2 ) >> 2 ] | 0 ) | 0; O = Q + ( M << 2 ) | 0; f[ O >> 2 ] = K; if ( ( K | 0 ) <= ( f[ A >> 2 ] | 0 ) ) {

									if ( ( K | 0 ) < ( f[ C >> 2 ] | 0 ) ) {

										ma = ( f[ D >> 2 ] | 0 ) + K | 0; v = 87;

									}

								} else {

									ma = K - ( f[ D >> 2 ] | 0 ) | 0; v = 87;

								} if ( ( v | 0 ) == 87 ) {

									v = 0; f[ O >> 2 ] = ma;

								}M = M + 1 | 0;

							} while ( ( M | 0 ) < ( f[ i >> 2 ] | 0 ) );

						}

					}G = G + 1 | 0; if ( ( G | 0 ) >= ( m | 0 ) ) {

						v = 28; break;

					}M = f[ r >> 2 ] | 0; H = f[ M >> 2 ] | 0; if ( ( f[ M + 4 >> 2 ] | 0 ) - H >> 2 >>> 0 <= G >>> 0 ) {

						I = M; v = 34; break;

					}

				} if ( ( v | 0 ) == 28 ) {

					D = f[ h >> 2 ] | 0; na = D; oa = D; break;

				} else if ( ( v | 0 ) == 34 )um( I );

			} else {

				na = x; oa = w;

			} while ( 0 );if ( na | 0 ) {

				w = f[ n >> 2 ] | 0; if ( ( w | 0 ) != ( na | 0 ) )f[ n >> 2 ] = w + ( ~ ( ( w + - 4 - na | 0 ) >>> 2 ) << 2 ); dn( oa );

			}dn( s ); s = f[ d + 36 >> 2 ] | 0; if ( s | 0 ) {

				oa = d + 40 | 0; na = f[ oa >> 2 ] | 0; if ( ( na | 0 ) != ( s | 0 ) )f[ oa >> 2 ] = na + ( ~ ( ( na + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s );

			}s = f[ d + 24 >> 2 ] | 0; if ( s | 0 ) {

				na = d + 28 | 0; oa = f[ na >> 2 ] | 0; if ( ( oa | 0 ) != ( s | 0 ) )f[ na >> 2 ] = oa + ( ~ ( ( oa + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s );

			}s = f[ d + 12 >> 2 ] | 0; if ( s | 0 ) {

				oa = d + 16 | 0; na = f[ oa >> 2 ] | 0; if ( ( na | 0 ) != ( s | 0 ) )f[ oa >> 2 ] = na + ( ~ ( ( na + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s );

			}s = f[ d >> 2 ] | 0; if ( ! s ) {

				u = g; return 1;

			}na = d + 4 | 0; d = f[ na >> 2 ] | 0; if ( ( d | 0 ) != ( s | 0 ) )f[ na >> 2 ] = d + ( ~ ( ( d + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s ); u = g; return 1;

		} function db( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0; g = u; u = u + 64 | 0; d = g + 16 | 0; h = g; i = a + 8 | 0; f[ i >> 2 ] = e; j = a + 32 | 0; k = a + 36 | 0; l = f[ k >> 2 ] | 0; m = f[ j >> 2 ] | 0; n = l - m >> 2; o = m; m = l; if ( n >>> 0 >= e >>> 0 ) {

				if ( n >>> 0 > e >>> 0 ? ( l = o + ( e << 2 ) | 0, ( l | 0 ) != ( m | 0 ) ) : 0 )f[ k >> 2 ] = m + ( ~ ( ( m + - 4 - l | 0 ) >>> 2 ) << 2 );

			} else ff( j, e - n | 0 ); n = d; j = n + 48 | 0; do {

				f[ n >> 2 ] = 0; n = n + 4 | 0;

			} while ( ( n | 0 ) < ( j | 0 ) );f[ h >> 2 ] = 0; if ( ! e ) {

				p = 0; q = 0;

			} else {

				Ae( d, e, h ); p = f[ d + 12 >> 2 ] | 0; q = f[ d + 16 >> 2 ] | 0;

			}f[ h >> 2 ] = 0; n = d + 16 | 0; j = q - p >> 2; l = p; p = q; if ( j >>> 0 >= e >>> 0 ) {

				if ( j >>> 0 > e >>> 0 ? ( q = l + ( e << 2 ) | 0, ( q | 0 ) != ( p | 0 ) ) : 0 )f[ n >> 2 ] = p + ( ~ ( ( p + - 4 - q | 0 ) >>> 2 ) << 2 );

			} else Ae( d + 12 | 0, e - j | 0, h ); j = d + 24 | 0; f[ h >> 2 ] = 0; q = d + 28 | 0; p = f[ q >> 2 ] | 0; n = f[ j >> 2 ] | 0; l = p - n >> 2; m = n; n = p; if ( l >>> 0 >= e >>> 0 ) {

				if ( l >>> 0 > e >>> 0 ? ( p = m + ( e << 2 ) | 0, ( p | 0 ) != ( n | 0 ) ) : 0 )f[ q >> 2 ] = n + ( ~ ( ( n + - 4 - p | 0 ) >>> 2 ) << 2 );

			} else Ae( j, e - l | 0, h ); l = d + 36 | 0; f[ h >> 2 ] = 0; j = d + 40 | 0; p = f[ j >> 2 ] | 0; n = f[ l >> 2 ] | 0; q = p - n >> 2; m = n; n = p; if ( q >>> 0 >= e >>> 0 ) {

				if ( q >>> 0 > e >>> 0 ? ( p = m + ( e << 2 ) | 0, ( p | 0 ) != ( n | 0 ) ) : 0 )f[ j >> 2 ] = n + ( ~ ( ( n + - 4 - p | 0 ) >>> 2 ) << 2 );

			} else Ae( l, e - q | 0, h ); q = f[ d >> 2 ] | 0; if ( ( f[ i >> 2 ] | 0 ) > 0 ) {

				l = a + 16 | 0; p = a + 32 | 0; n = a + 12 | 0; j = 0; do {

					m = f[ q + ( j << 2 ) >> 2 ] | 0; k = f[ l >> 2 ] | 0; if ( ( m | 0 ) > ( k | 0 ) ) {

						o = f[ p >> 2 ] | 0; f[ o + ( j << 2 ) >> 2 ] = k; r = o;

					} else {

						o = f[ n >> 2 ] | 0; k = f[ p >> 2 ] | 0; f[ k + ( j << 2 ) >> 2 ] = ( m | 0 ) < ( o | 0 ) ? o : m; r = k;

					}j = j + 1 | 0; s = f[ i >> 2 ] | 0;

				} while ( ( j | 0 ) < ( s | 0 ) );if ( ( s | 0 ) > 0 ) {

					s = a + 20 | 0; j = 0; do {

						p = ( f[ b + ( j << 2 ) >> 2 ] | 0 ) + ( f[ r + ( j << 2 ) >> 2 ] | 0 ) | 0; q = c + ( j << 2 ) | 0; f[ q >> 2 ] = p; if ( ( p | 0 ) <= ( f[ l >> 2 ] | 0 ) ) {

							if ( ( p | 0 ) < ( f[ n >> 2 ] | 0 ) ) {

								t = ( f[ s >> 2 ] | 0 ) + p | 0; v = 18;

							}

						} else {

							t = p - ( f[ s >> 2 ] | 0 ) | 0; v = 18;

						} if ( ( v | 0 ) == 18 ) {

							v = 0; f[ q >> 2 ] = t;

						}j = j + 1 | 0;

					} while ( ( j | 0 ) < ( f[ i >> 2 ] | 0 ) );

				}

			}j = f[ a + 48 >> 2 ] | 0; t = f[ a + 52 >> 2 ] | 0; s = bj( 16 ) | 0; f[ s >> 2 ] = 0; f[ s + 4 >> 2 ] = 0; f[ s + 8 >> 2 ] = 0; f[ s + 12 >> 2 ] = 0; f[ h >> 2 ] = 0; n = h + 4 | 0; f[ n >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; do if ( e ) if ( e >>> 0 > 1073741823 )um( h ); else {

				l = e << 2; r = bj( l ) | 0; f[ h >> 2 ] = r; q = r + ( e << 2 ) | 0; f[ h + 8 >> 2 ] = q; Vf( r | 0, 0, l | 0 ) | 0; f[ n >> 2 ] = q; w = r; x = r; break;

			} else {

				w = 0; x = 0;

			} while ( 0 );r = a + 56 | 0; q = f[ r >> 2 ] | 0; l = f[ q + 4 >> 2 ] | 0; p = f[ q >> 2 ] | 0; k = l - p | 0; m = k >> 2; do if ( ( k | 0 ) > 4 ) {

				o = j + 12 | 0; y = ( e | 0 ) > 0; z = a + 16 | 0; A = a + 32 | 0; B = a + 12 | 0; C = a + 20 | 0; D = e << 2; E = ( e | 0 ) == 1; if ( l - p >> 2 >>> 0 > 1 ) {

					F = 1; G = p;

				} else {

					H = q; um( H );

				} while ( 1 ) {

					I = f[ G + ( F << 2 ) >> 2 ] | 0; J = ( ( ( I >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + I | 0; K = ( I | 0 ) == - 1 | ( J | 0 ) == - 1; L = 1; M = 0; N = I; a:while ( 1 ) {

						O = L ^ 1; P = M; Q = N; while ( 1 ) {

							if ( ( Q | 0 ) == - 1 ) {

								R = P; v = 64; break a;

							}S = f[ d + ( P * 12 | 0 ) >> 2 ] | 0; T = f[ o >> 2 ] | 0; U = f[ T + ( Q << 2 ) >> 2 ] | 0; if ( ( U | 0 ) != - 1 ) {

								V = f[ j >> 2 ] | 0; W = f[ t >> 2 ] | 0; Y = f[ W + ( f[ V + ( U << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; Z = U + 1 | 0; _ = ( ( Z >>> 0 ) % 3 | 0 | 0 ) == 0 ? U + - 2 | 0 : Z; if ( ( _ | 0 ) == - 1 )$ = - 1; else $ = f[ V + ( _ << 2 ) >> 2 ] | 0; _ = f[ W + ( $ << 2 ) >> 2 ] | 0; Z = ( ( ( U >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + U | 0; if ( ( Z | 0 ) == - 1 )aa = - 1; else aa = f[ V + ( Z << 2 ) >> 2 ] | 0; Z = f[ W + ( aa << 2 ) >> 2 ] | 0; if ( ( Y | 0 ) < ( F | 0 ) & ( _ | 0 ) < ( F | 0 ) & ( Z | 0 ) < ( F | 0 ) ) {

									W = X( Y, e ) | 0; Y = X( _, e ) | 0; _ = X( Z, e ) | 0; if ( y ) {

										Z = 0; do {

											f[ S + ( Z << 2 ) >> 2 ] = ( f[ c + ( Z + _ << 2 ) >> 2 ] | 0 ) + ( f[ c + ( Z + Y << 2 ) >> 2 ] | 0 ) - ( f[ c + ( Z + W << 2 ) >> 2 ] | 0 ); Z = Z + 1 | 0;

										} while ( ( Z | 0 ) != ( e | 0 ) );

									}Z = P + 1 | 0; if ( ( Z | 0 ) == 4 ) {

										ba = 4; v = 47; break a;

									} else ca = Z;

								} else ca = P;

							} else ca = P; do if ( L ) {

								Z = Q + 1 | 0; W = ( ( Z >>> 0 ) % 3 | 0 | 0 ) == 0 ? Q + - 2 | 0 : Z; if ( ( W | 0 ) != - 1 ? ( Z = f[ T + ( W << 2 ) >> 2 ] | 0, W = Z + 1 | 0, ( Z | 0 ) != - 1 ) : 0 )da = ( ( W >>> 0 ) % 3 | 0 | 0 ) == 0 ? Z + - 2 | 0 : W; else da = - 1;

							} else {

								W = ( ( ( Q >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + Q | 0; if ( ( W | 0 ) != - 1 ? ( Z = f[ T + ( W << 2 ) >> 2 ] | 0, ( Z | 0 ) != - 1 ) : 0 ) if ( ! ( ( Z >>> 0 ) % 3 | 0 ) ) {

									da = Z + 2 | 0; break;

								} else {

									da = Z + - 1 | 0; break;

								} else da = - 1;

							} while ( 0 );if ( ( da | 0 ) == ( I | 0 ) ) {

								R = ca; v = 64; break a;

							} if ( ( da | 0 ) != - 1 | O ) {

								P = ca; Q = da;

							} else break;

						} if ( K ) {

							L = 0; M = ca; N = - 1; continue;

						}Q = f[ T + ( J << 2 ) >> 2 ] | 0; if ( ( Q | 0 ) == - 1 ) {

							L = 0; M = ca; N = - 1; continue;

						} if ( ! ( ( Q >>> 0 ) % 3 | 0 ) ) {

							L = 0; M = ca; N = Q + 2 | 0; continue;

						} else {

							L = 0; M = ca; N = Q + - 1 | 0; continue;

						}

					} if ( ( v | 0 ) == 64 ) {

						v = 0; if ( ( R | 0 ) > 0 ) {

							ba = R; v = 47;

						} else {

							ea = X( F, e ) | 0; v = 77;

						}

					} if ( ( v | 0 ) == 47 ) {

						v = 0; if ( y ) {

							Vf( f[ h >> 2 ] | 0, 0, D | 0 ) | 0; N = ba + - 1 | 0; M = s + ( N << 2 ) | 0; L = f[ a + 60 + ( N * 12 | 0 ) >> 2 ] | 0; N = f[ h >> 2 ] | 0; J = 0; K = 0; while ( 1 ) {

								I = f[ M >> 2 ] | 0; f[ M >> 2 ] = I + 1; if ( ! ( f[ L + ( I >>> 5 << 2 ) >> 2 ] & 1 << ( I & 31 ) ) ) {

									I = f[ d + ( J * 12 | 0 ) >> 2 ] | 0; Q = 0; do {

										P = N + ( Q << 2 ) | 0; f[ P >> 2 ] = ( f[ P >> 2 ] | 0 ) + ( f[ I + ( Q << 2 ) >> 2 ] | 0 ); Q = Q + 1 | 0;

									} while ( ( Q | 0 ) != ( e | 0 ) );fa = K + 1 | 0;

								} else fa = K; J = J + 1 | 0; if ( ( J | 0 ) == ( ba | 0 ) ) {

									ga = fa; break;

								} else K = fa;

							}

						} else {

							K = ba + - 1 | 0; J = s + ( K << 2 ) | 0; N = f[ a + 60 + ( K * 12 | 0 ) >> 2 ] | 0; K = 0; L = 0; M = f[ J >> 2 ] | 0; while ( 1 ) {

								Q = M; M = M + 1 | 0; f[ J >> 2 ] = M; I = L + ( ( f[ N + ( Q >>> 5 << 2 ) >> 2 ] & 1 << ( Q & 31 ) | 0 ) == 0 & 1 ) | 0; K = K + 1 | 0; if ( ( K | 0 ) == ( ba | 0 ) ) {

									ga = I; break;

								} else L = I;

							}

						}L = X( F, e ) | 0; if ( ga ) {

							K = f[ h >> 2 ] | 0; if ( y ? ( f[ K >> 2 ] = ( f[ K >> 2 ] | 0 ) / ( ga | 0 ) | 0, ! E ) : 0 ) {

								N = 1; do {

									M = K + ( N << 2 ) | 0; f[ M >> 2 ] = ( f[ M >> 2 ] | 0 ) / ( ga | 0 ) | 0; N = N + 1 | 0;

								} while ( ( N | 0 ) != ( e | 0 ) );

							}N = b + ( L << 2 ) | 0; M = c + ( L << 2 ) | 0; if ( ( f[ i >> 2 ] | 0 ) > 0 ) {

								J = 0; do {

									I = f[ K + ( J << 2 ) >> 2 ] | 0; Q = f[ z >> 2 ] | 0; if ( ( I | 0 ) > ( Q | 0 ) ) {

										P = f[ A >> 2 ] | 0; f[ P + ( J << 2 ) >> 2 ] = Q; ha = P;

									} else {

										P = f[ B >> 2 ] | 0; Q = f[ A >> 2 ] | 0; f[ Q + ( J << 2 ) >> 2 ] = ( I | 0 ) < ( P | 0 ) ? P : I; ha = Q;

									}J = J + 1 | 0; ia = f[ i >> 2 ] | 0;

								} while ( ( J | 0 ) < ( ia | 0 ) );if ( ( ia | 0 ) > 0 ) {

									J = 0; do {

										K = ( f[ N + ( J << 2 ) >> 2 ] | 0 ) + ( f[ ha + ( J << 2 ) >> 2 ] | 0 ) | 0; Q = M + ( J << 2 ) | 0; f[ Q >> 2 ] = K; do if ( ( K | 0 ) > ( f[ z >> 2 ] | 0 ) ) {

											ja = K - ( f[ C >> 2 ] | 0 ) | 0; v = 99;

										} else {

											if ( ( K | 0 ) >= ( f[ B >> 2 ] | 0 ) ) break; ja = ( f[ C >> 2 ] | 0 ) + K | 0; v = 99;

										} while ( 0 );if ( ( v | 0 ) == 99 ) {

											v = 0; f[ Q >> 2 ] = ja;

										}J = J + 1 | 0;

									} while ( ( J | 0 ) < ( f[ i >> 2 ] | 0 ) );

								}

							}

						} else {

							ea = L; v = 77;

						}

					} if ( ( v | 0 ) == 77 ? ( v = 0, J = c + ( ( X( F + - 1 | 0, e ) | 0 ) << 2 ) | 0, M = b + ( ea << 2 ) | 0, N = c + ( ea << 2 ) | 0, ( f[ i >> 2 ] | 0 ) > 0 ) : 0 ) {

						K = 0; do {

							I = f[ J + ( K << 2 ) >> 2 ] | 0; P = f[ z >> 2 ] | 0; if ( ( I | 0 ) > ( P | 0 ) ) {

								O = f[ A >> 2 ] | 0; f[ O + ( K << 2 ) >> 2 ] = P; ka = O;

							} else {

								O = f[ B >> 2 ] | 0; P = f[ A >> 2 ] | 0; f[ P + ( K << 2 ) >> 2 ] = ( I | 0 ) < ( O | 0 ) ? O : I; ka = P;

							}K = K + 1 | 0; la = f[ i >> 2 ] | 0;

						} while ( ( K | 0 ) < ( la | 0 ) );if ( ( la | 0 ) > 0 ) {

							K = 0; do {

								J = ( f[ M + ( K << 2 ) >> 2 ] | 0 ) + ( f[ ka + ( K << 2 ) >> 2 ] | 0 ) | 0; L = N + ( K << 2 ) | 0; f[ L >> 2 ] = J; if ( ( J | 0 ) <= ( f[ z >> 2 ] | 0 ) ) {

									if ( ( J | 0 ) < ( f[ B >> 2 ] | 0 ) ) {

										ma = ( f[ C >> 2 ] | 0 ) + J | 0; v = 87;

									}

								} else {

									ma = J - ( f[ C >> 2 ] | 0 ) | 0; v = 87;

								} if ( ( v | 0 ) == 87 ) {

									v = 0; f[ L >> 2 ] = ma;

								}K = K + 1 | 0;

							} while ( ( K | 0 ) < ( f[ i >> 2 ] | 0 ) );

						}

					}F = F + 1 | 0; if ( ( F | 0 ) >= ( m | 0 ) ) {

						v = 28; break;

					}K = f[ r >> 2 ] | 0; G = f[ K >> 2 ] | 0; if ( ( f[ K + 4 >> 2 ] | 0 ) - G >> 2 >>> 0 <= F >>> 0 ) {

						H = K; v = 34; break;

					}

				} if ( ( v | 0 ) == 28 ) {

					C = f[ h >> 2 ] | 0; na = C; oa = C; break;

				} else if ( ( v | 0 ) == 34 )um( H );

			} else {

				na = x; oa = w;

			} while ( 0 );if ( na | 0 ) {

				w = f[ n >> 2 ] | 0; if ( ( w | 0 ) != ( na | 0 ) )f[ n >> 2 ] = w + ( ~ ( ( w + - 4 - na | 0 ) >>> 2 ) << 2 ); dn( oa );

			}dn( s ); s = f[ d + 36 >> 2 ] | 0; if ( s | 0 ) {

				oa = d + 40 | 0; na = f[ oa >> 2 ] | 0; if ( ( na | 0 ) != ( s | 0 ) )f[ oa >> 2 ] = na + ( ~ ( ( na + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s );

			}s = f[ d + 24 >> 2 ] | 0; if ( s | 0 ) {

				na = d + 28 | 0; oa = f[ na >> 2 ] | 0; if ( ( oa | 0 ) != ( s | 0 ) )f[ na >> 2 ] = oa + ( ~ ( ( oa + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s );

			}s = f[ d + 12 >> 2 ] | 0; if ( s | 0 ) {

				oa = d + 16 | 0; na = f[ oa >> 2 ] | 0; if ( ( na | 0 ) != ( s | 0 ) )f[ oa >> 2 ] = na + ( ~ ( ( na + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s );

			}s = f[ d >> 2 ] | 0; if ( ! s ) {

				u = g; return 1;

			}na = d + 4 | 0; d = f[ na >> 2 ] | 0; if ( ( d | 0 ) != ( s | 0 ) )f[ na >> 2 ] = d + ( ~ ( ( d + - 4 - s | 0 ) >>> 2 ) << 2 ); dn( s ); u = g; return 1;

		} function eb( a, c, d, e, g, i ) {

			a = a | 0; c = + c; d = d | 0; e = e | 0; g = g | 0; i = i | 0; var j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0.0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0.0, C = 0, D = 0.0, E = 0, F = 0, G = 0, H = 0.0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0.0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0.0, ga = 0.0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0, Aa = 0, Ba = 0, Ca = 0, Da = 0, Ea = 0, Fa = 0; j = u; u = u + 560 | 0; k = j + 8 | 0; l = j; m = j + 524 | 0; n = m; o = j + 512 | 0; f[ l >> 2 ] = 0; p = o + 12 | 0; zk( c ) | 0; if ( ( I | 0 ) < 0 ) {

				q = - c; r = 1; s = 10359;

			} else {

				q = c; r = ( g & 2049 | 0 ) != 0 & 1; s = ( g & 2048 | 0 ) == 0 ? ( ( g & 1 | 0 ) == 0 ? 10360 : 10365 ) : 10362;

			}zk( q ) | 0; do if ( 0 == 0 & ( I & 2146435072 | 0 ) == 2146435072 ) {

				t = ( i & 32 | 0 ) != 0; v = r + 3 | 0; ch( a, 32, d, v, g & - 65537 ); il( a, s, r ); il( a, q != q | 0.0 != 0.0 ? ( t ? 10386 : 10390 ) : t ? 10378 : 10382, 3 ); ch( a, 32, d, v, g ^ 8192 ); w = v;

			} else {

				c = + Jm( q, l ) * 2.0; v = c != 0.0; if ( v )f[ l >> 2 ] = ( f[ l >> 2 ] | 0 ) + - 1; t = i | 32; if ( ( t | 0 ) == 97 ) {

					x = i & 32; y = ( x | 0 ) == 0 ? s : s + 9 | 0; z = r | 2; A = 12 - e | 0; do if ( ! ( e >>> 0 > 11 | ( A | 0 ) == 0 ) ) {

						B = 8.0; C = A; do {

							C = C + - 1 | 0; B = B * 16.0;

						} while ( ( C | 0 ) != 0 );if ( ( b[ y >> 0 ] | 0 ) == 45 ) {

							D = - ( B + ( - c - B ) ); break;

						} else {

							D = c + B - B; break;

						}

					} else D = c; while ( 0 );A = f[ l >> 2 ] | 0; C = ( A | 0 ) < 0 ? 0 - A | 0 : A; E = pg( C, ( ( C | 0 ) < 0 ) << 31 >> 31, p ) | 0; if ( ( E | 0 ) == ( p | 0 ) ) {

						C = o + 11 | 0; b[ C >> 0 ] = 48; F = C;

					} else F = E; b[ F + - 1 >> 0 ] = ( A >> 31 & 2 ) + 43; A = F + - 2 | 0; b[ A >> 0 ] = i + 15; E = ( e | 0 ) < 1; C = ( g & 8 | 0 ) == 0; G = m; H = D; while ( 1 ) {

						J = ~ ~ H; K = G + 1 | 0; b[ G >> 0 ] = x | h[ 10394 + J >> 0 ]; H = ( H - + ( J | 0 ) ) * 16.0; if ( ( K - n | 0 ) == 1 ? ! ( C & ( E & H == 0.0 ) ) : 0 ) {

							b[ K >> 0 ] = 46; L = G + 2 | 0;

						} else L = K; if ( ! ( H != 0.0 ) ) break; else G = L;

					}G = L; if ( ( e | 0 ) != 0 ? ( - 2 - n + G | 0 ) < ( e | 0 ) : 0 ) {

						M = G - n | 0; N = e + 2 | 0;

					} else {

						E = G - n | 0; M = E; N = E;

					}E = p - A | 0; G = E + z + N | 0; ch( a, 32, d, G, g ); il( a, y, z ); ch( a, 48, d, G, g ^ 65536 ); il( a, m, M ); ch( a, 48, N - M | 0, 0, 0 ); il( a, A, E ); ch( a, 32, d, G, g ^ 8192 ); w = G; break;

				}G = ( e | 0 ) < 0 ? 6 : e; if ( v ) {

					E = ( f[ l >> 2 ] | 0 ) + - 28 | 0; f[ l >> 2 ] = E; O = c * 268435456.0; P = E;

				} else {

					O = c; P = f[ l >> 2 ] | 0;

				}E = ( P | 0 ) < 0 ? k : k + 288 | 0; C = E; H = O; do {

					x = ~ ~ H >>> 0; f[ C >> 2 ] = x; C = C + 4 | 0; H = ( H - + ( x >>> 0 ) ) * 1.0e9;

				} while ( H != 0.0 );if ( ( P | 0 ) > 0 ) {

					v = E; A = C; z = P; while ( 1 ) {

						y = ( z | 0 ) < 29 ? z : 29; x = A + - 4 | 0; if ( x >>> 0 >= v >>> 0 ) {

							K = x; x = 0; do {

								J = Oj( f[ K >> 2 ] | 0, 0, y | 0 ) | 0; Q = Rj( J | 0, I | 0, x | 0, 0 ) | 0; J = I; R = $i( Q | 0, J | 0, 1e9, 0 ) | 0; f[ K >> 2 ] = R; x = Fl( Q | 0, J | 0, 1e9, 0 ) | 0; K = K + - 4 | 0;

							} while ( K >>> 0 >= v >>> 0 );if ( x ) {

								K = v + - 4 | 0; f[ K >> 2 ] = x; S = K;

							} else S = v;

						} else S = v; K = A; while ( 1 ) {

							if ( K >>> 0 <= S >>> 0 ) break; J = K + - 4 | 0; if ( ! ( f[ J >> 2 ] | 0 ) )K = J; else break;

						}x = ( f[ l >> 2 ] | 0 ) - y | 0; f[ l >> 2 ] = x; if ( ( x | 0 ) > 0 ) {

							v = S; A = K; z = x;

						} else {

							T = S; U = K; V = x; break;

						}

					}

				} else {

					T = E; U = C; V = P;

				} if ( ( V | 0 ) < 0 ) {

					z = ( ( G + 25 | 0 ) / 9 | 0 ) + 1 | 0; A = ( t | 0 ) == 102; v = T; x = U; J = V; while ( 1 ) {

						Q = 0 - J | 0; R = ( Q | 0 ) < 9 ? Q : 9; if ( v >>> 0 < x >>> 0 ) {

							Q = ( 1 << R ) + - 1 | 0; W = 1e9 >>> R; Y = 0; Z = v; do {

								_ = f[ Z >> 2 ] | 0; f[ Z >> 2 ] = ( _ >>> R ) + Y; Y = X( _ & Q, W ) | 0; Z = Z + 4 | 0;

							} while ( Z >>> 0 < x >>> 0 );Z = ( f[ v >> 2 ] | 0 ) == 0 ? v + 4 | 0 : v; if ( ! Y ) {

								$ = Z; aa = x;

							} else {

								f[ x >> 2 ] = Y; $ = Z; aa = x + 4 | 0;

							}

						} else {

							$ = ( f[ v >> 2 ] | 0 ) == 0 ? v + 4 | 0 : v; aa = x;

						}Z = A ? E : $; W = ( aa - Z >> 2 | 0 ) > ( z | 0 ) ? Z + ( z << 2 ) | 0 : aa; J = ( f[ l >> 2 ] | 0 ) + R | 0; f[ l >> 2 ] = J; if ( ( J | 0 ) >= 0 ) {

							ba = $; ca = W; break;

						} else {

							v = $; x = W;

						}

					}

				} else {

					ba = T; ca = U;

				}x = E; if ( ba >>> 0 < ca >>> 0 ) {

					v = ( x - ba >> 2 ) * 9 | 0; J = f[ ba >> 2 ] | 0; if ( J >>> 0 < 10 )da = v; else {

						z = v; v = 10; while ( 1 ) {

							v = v * 10 | 0; A = z + 1 | 0; if ( J >>> 0 < v >>> 0 ) {

								da = A; break;

							} else z = A;

						}

					}

				} else da = 0; z = ( t | 0 ) == 103; v = ( G | 0 ) != 0; J = G - ( ( t | 0 ) != 102 ? da : 0 ) + ( ( v & z ) << 31 >> 31 ) | 0; if ( ( J | 0 ) < ( ( ( ca - x >> 2 ) * 9 | 0 ) + - 9 | 0 ) ) {

					A = J + 9216 | 0; J = E + 4 + ( ( ( A | 0 ) / 9 | 0 ) + - 1024 << 2 ) | 0; C = ( A | 0 ) % 9 | 0; if ( ( C | 0 ) < 8 ) {

						A = C; C = 10; while ( 1 ) {

							W = C * 10 | 0; if ( ( A | 0 ) < 7 ) {

								A = A + 1 | 0; C = W;

							} else {

								ea = W; break;

							}

						}

					} else ea = 10; C = f[ J >> 2 ] | 0; A = ( C >>> 0 ) % ( ea >>> 0 ) | 0; t = ( J + 4 | 0 ) == ( ca | 0 ); if ( ! ( t & ( A | 0 ) == 0 ) ) {

						B = ( ( ( C >>> 0 ) / ( ea >>> 0 ) | 0 ) & 1 | 0 ) == 0 ? 9007199254740992.0 : 9007199254740994.0; W = ( ea | 0 ) / 2 | 0; H = A >>> 0 < W >>> 0 ? .5 : t & ( A | 0 ) == ( W | 0 ) ? 1.0 : 1.5; if ( ! r ) {

							fa = H; ga = B;

						} else {

							W = ( b[ s >> 0 ] | 0 ) == 45; fa = W ? - H : H; ga = W ? - B : B;

						}W = C - A | 0; f[ J >> 2 ] = W; if ( ga + fa != ga ) {

							A = W + ea | 0; f[ J >> 2 ] = A; if ( A >>> 0 > 999999999 ) {

								A = ba; W = J; while ( 1 ) {

									C = W + - 4 | 0; f[ W >> 2 ] = 0; if ( C >>> 0 < A >>> 0 ) {

										t = A + - 4 | 0; f[ t >> 2 ] = 0; ha = t;

									} else ha = A; t = ( f[ C >> 2 ] | 0 ) + 1 | 0; f[ C >> 2 ] = t; if ( t >>> 0 > 999999999 ) {

										A = ha; W = C;

									} else {

										ia = ha; ja = C; break;

									}

								}

							} else {

								ia = ba; ja = J;

							}W = ( x - ia >> 2 ) * 9 | 0; A = f[ ia >> 2 ] | 0; if ( A >>> 0 < 10 ) {

								ka = ja; la = W; ma = ia;

							} else {

								C = W; W = 10; while ( 1 ) {

									W = W * 10 | 0; t = C + 1 | 0; if ( A >>> 0 < W >>> 0 ) {

										ka = ja; la = t; ma = ia; break;

									} else C = t;

								}

							}

						} else {

							ka = J; la = da; ma = ba;

						}

					} else {

						ka = J; la = da; ma = ba;

					}C = ka + 4 | 0; na = la; oa = ca >>> 0 > C >>> 0 ? C : ca; pa = ma;

				} else {

					na = da; oa = ca; pa = ba;

				}C = oa; while ( 1 ) {

					if ( C >>> 0 <= pa >>> 0 ) {

						qa = 0; break;

					}W = C + - 4 | 0; if ( ! ( f[ W >> 2 ] | 0 ) )C = W; else {

						qa = 1; break;

					}

				}J = 0 - na | 0; do if ( z ) {

					W = G + ( ( v ^ 1 ) & 1 ) | 0; if ( ( W | 0 ) > ( na | 0 ) & ( na | 0 ) > - 5 ) {

						ra = i + - 1 | 0; sa = W + - 1 - na | 0;

					} else {

						ra = i + - 2 | 0; sa = W + - 1 | 0;

					}W = g & 8; if ( ! W ) {

						if ( qa ? ( A = f[ C + - 4 >> 2 ] | 0, ( A | 0 ) != 0 ) : 0 ) if ( ! ( ( A >>> 0 ) % 10 | 0 ) ) {

							t = 0; Z = 10; while ( 1 ) {

								Z = Z * 10 | 0; Q = t + 1 | 0; if ( ( A >>> 0 ) % ( Z >>> 0 ) | 0 | 0 ) {

									ta = Q; break;

								} else t = Q;

							}

						} else ta = 0; else ta = 9; t = ( ( C - x >> 2 ) * 9 | 0 ) + - 9 | 0; if ( ( ra | 32 | 0 ) == 102 ) {

							Z = t - ta | 0; A = ( Z | 0 ) > 0 ? Z : 0; ua = ra; va = ( sa | 0 ) < ( A | 0 ) ? sa : A; wa = 0; break;

						} else {

							A = t + na - ta | 0; t = ( A | 0 ) > 0 ? A : 0; ua = ra; va = ( sa | 0 ) < ( t | 0 ) ? sa : t; wa = 0; break;

						}

					} else {

						ua = ra; va = sa; wa = W;

					}

				} else {

					ua = i; va = G; wa = g & 8;

				} while ( 0 );G = va | wa; x = ( G | 0 ) != 0 & 1; v = ( ua | 32 | 0 ) == 102; if ( v ) {

					xa = 0; ya = ( na | 0 ) > 0 ? na : 0;

				} else {

					z = ( na | 0 ) < 0 ? J : na; t = pg( z, ( ( z | 0 ) < 0 ) << 31 >> 31, p ) | 0; z = p; if ( ( z - t | 0 ) < 2 ) {

						A = t; while ( 1 ) {

							Z = A + - 1 | 0; b[ Z >> 0 ] = 48; if ( ( z - Z | 0 ) < 2 )A = Z; else {

								za = Z; break;

							}

						}

					} else za = t; b[ za + - 1 >> 0 ] = ( na >> 31 & 2 ) + 43; A = za + - 2 | 0; b[ A >> 0 ] = ua; xa = A; ya = z - A | 0;

				}A = r + 1 + va + x + ya | 0; ch( a, 32, d, A, g ); il( a, s, r ); ch( a, 48, d, A, g ^ 65536 ); if ( v ) {

					J = pa >>> 0 > E >>> 0 ? E : pa; Z = m + 9 | 0; R = Z; Y = m + 8 | 0; Q = J; do {

						K = pg( f[ Q >> 2 ] | 0, 0, Z ) | 0; if ( ( Q | 0 ) == ( J | 0 ) ) if ( ( K | 0 ) == ( Z | 0 ) ) {

							b[ Y >> 0 ] = 48; Aa = Y;

						} else Aa = K; else if ( K >>> 0 > m >>> 0 ) {

							Vf( m | 0, 48, K - n | 0 ) | 0; y = K; while ( 1 ) {

								_ = y + - 1 | 0; if ( _ >>> 0 > m >>> 0 )y = _; else {

									Aa = _; break;

								}

							}

						} else Aa = K; il( a, Aa, R - Aa | 0 ); Q = Q + 4 | 0;

					} while ( Q >>> 0 <= E >>> 0 );if ( G | 0 )il( a, 10410, 1 ); if ( Q >>> 0 < C >>> 0 & ( va | 0 ) > 0 ) {

						E = va; R = Q; while ( 1 ) {

							Y = pg( f[ R >> 2 ] | 0, 0, Z ) | 0; if ( Y >>> 0 > m >>> 0 ) {

								Vf( m | 0, 48, Y - n | 0 ) | 0; J = Y; while ( 1 ) {

									v = J + - 1 | 0; if ( v >>> 0 > m >>> 0 )J = v; else {

										Ba = v; break;

									}

								}

							} else Ba = Y; il( a, Ba, ( E | 0 ) < 9 ? E : 9 ); R = R + 4 | 0; J = E + - 9 | 0; if ( ! ( R >>> 0 < C >>> 0 & ( E | 0 ) > 9 ) ) {

								Ca = J; break;

							} else E = J;

						}

					} else Ca = va; ch( a, 48, Ca + 9 | 0, 9, 0 );

				} else {

					E = qa ? C : pa + 4 | 0; if ( ( va | 0 ) > - 1 ) {

						R = m + 9 | 0; Z = ( wa | 0 ) == 0; Q = R; G = 0 - n | 0; J = m + 8 | 0; K = va; v = pa; while ( 1 ) {

							x = pg( f[ v >> 2 ] | 0, 0, R ) | 0; if ( ( x | 0 ) == ( R | 0 ) ) {

								b[ J >> 0 ] = 48; Da = J;

							} else Da = x; do if ( ( v | 0 ) == ( pa | 0 ) ) {

								x = Da + 1 | 0; il( a, Da, 1 ); if ( Z & ( K | 0 ) < 1 ) {

									Ea = x; break;

								}il( a, 10410, 1 ); Ea = x;

							} else {

								if ( Da >>> 0 <= m >>> 0 ) {

									Ea = Da; break;

								}Vf( m | 0, 48, Da + G | 0 ) | 0; x = Da; while ( 1 ) {

									z = x + - 1 | 0; if ( z >>> 0 > m >>> 0 )x = z; else {

										Ea = z; break;

									}

								}

							} while ( 0 );Y = Q - Ea | 0; il( a, Ea, ( K | 0 ) > ( Y | 0 ) ? Y : K ); x = K - Y | 0; v = v + 4 | 0; if ( ! ( v >>> 0 < E >>> 0 & ( x | 0 ) > - 1 ) ) {

								Fa = x; break;

							} else K = x;

						}

					} else Fa = va; ch( a, 48, Fa + 18 | 0, 18, 0 ); il( a, xa, p - xa | 0 );

				}ch( a, 32, d, A, g ^ 8192 ); w = A;

			} while ( 0 );u = j; return ( ( w | 0 ) < ( d | 0 ) ? d : w ) | 0;

		} function fb( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0; c = u; u = u + 48 | 0; d = c + 36 | 0; e = c + 24 | 0; g = c + 12 | 0; h = c; i = a + 4 | 0; j = f[ ( f[ i >> 2 ] | 0 ) + 44 >> 2 ] | 0; k = a + 8 | 0; l = f[ k >> 2 ] | 0; m = ( ( f[ l + 4 >> 2 ] | 0 ) - ( f[ l >> 2 ] | 0 ) >> 2 >>> 0 ) / 3 | 0; l = j + 96 | 0; n = j + 100 | 0; f[ d >> 2 ] = 0; f[ d + 4 >> 2 ] = 0; f[ d + 8 >> 2 ] = 0; j = f[ n >> 2 ] | 0; o = f[ l >> 2 ] | 0; p = ( j - o | 0 ) / 12 | 0; q = o; o = j; if ( m >>> 0 <= p >>> 0 ) {

				if ( m >>> 0 < p >>> 0 ? ( j = q + ( m * 12 | 0 ) | 0, ( j | 0 ) != ( o | 0 ) ) : 0 )f[ n >> 2 ] = o + ( ~ ( ( ( o + - 12 - j | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 );

			} else Yd( l, m - p | 0, d ); p = a + 212 | 0; m = a + 216 | 0; if ( ( f[ p >> 2 ] | 0 ) == ( f[ m >> 2 ] | 0 ) ) {

				l = f[ i >> 2 ] | 0; j = f[ l + 44 >> 2 ] | 0; o = f[ j + 100 >> 2 ] | 0; n = f[ j + 96 >> 2 ] | 0; if ( ( o | 0 ) == ( n | 0 ) )r = l; else {

					q = e + 4 | 0; s = e + 8 | 0; t = 0; v = j; j = n; n = l; w = l; l = o; while ( 1 ) {

						f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; o = t * 3 | 0; if ( ( o | 0 ) != - 1 ) {

							x = f[ ( f[ f[ k >> 2 ] >> 2 ] | 0 ) + ( o << 2 ) >> 2 ] | 0; f[ e >> 2 ] = x; y = o + 1 | 0; if ( ( y | 0 ) == - 1 ) {

								f[ q >> 2 ] = - 1; z = 0; A = x; B = 95;

							} else {

								C = y; D = x; B = 94;

							}

						} else {

							f[ e >> 2 ] = - 1; C = 0; D = - 1; B = 94;

						} if ( ( B | 0 ) == 94 ) {

							B = 0; f[ q >> 2 ] = f[ ( f[ f[ k >> 2 ] >> 2 ] | 0 ) + ( C << 2 ) >> 2 ]; x = o + 2 | 0; if ( ( x | 0 ) == - 1 ) {

								E = - 1; F = D;

							} else {

								z = x; A = D; B = 95;

							}

						} if ( ( B | 0 ) == 95 ) {

							B = 0; E = f[ ( f[ f[ k >> 2 ] >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0; F = A;

						}f[ s >> 2 ] = E; x = v + 96 | 0; o = v + 100 | 0; y = ( l - j | 0 ) / 12 | 0; G = j; H = t; t = t + 1 | 0; if ( H >>> 0 < y >>> 0 ) {

							I = n; J = v; K = w; L = G; M = j; N = l;

						} else {

							O = l; f[ d >> 2 ] = 0; f[ d + 4 >> 2 ] = 0; f[ d + 8 >> 2 ] = 0; if ( t >>> 0 <= y >>> 0 ) if ( t >>> 0 < y >>> 0 ? ( P = G + ( t * 12 | 0 ) | 0, ( P | 0 ) != ( O | 0 ) ) : 0 ) {

								Q = O + ( ~ ( ( ( O + - 12 - P | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ) | 0; f[ o >> 2 ] = Q; R = G; S = w; T = v; U = Q; V = j;

							} else {

								R = G; S = w; T = v; U = l; V = j;

							} else {

								Yd( x, t - y | 0, d ); y = f[ i >> 2 ] | 0; G = f[ y + 44 >> 2 ] | 0; R = f[ x >> 2 ] | 0; S = y; T = G; U = f[ G + 100 >> 2 ] | 0; V = f[ G + 96 >> 2 ] | 0;

							}I = S; J = T; K = S; L = R; M = V; N = U;

						}f[ L + ( H * 12 | 0 ) >> 2 ] = F; f[ L + ( H * 12 | 0 ) + 4 >> 2 ] = f[ q >> 2 ]; f[ L + ( H * 12 | 0 ) + 8 >> 2 ] = f[ s >> 2 ]; if ( t >>> 0 >= ( ( N - M | 0 ) / 12 | 0 ) >>> 0 ) {

							r = I; break;

						} else {

							v = J; j = M; n = I; w = K; l = N;

						}

					}

				}f[ ( f[ r + 4 >> 2 ] | 0 ) + 80 >> 2 ] = b; u = c; return 1;

			}f[ e >> 2 ] = 0; b = e + 4 | 0; f[ b >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; r = f[ k >> 2 ] | 0; N = ( f[ r + 4 >> 2 ] | 0 ) - ( f[ r >> 2 ] | 0 ) | 0; l = N >> 2; f[ g >> 2 ] = 0; K = g + 4 | 0; f[ K >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; do if ( l | 0 ) if ( l >>> 0 > 1073741823 )um( g ); else {

				w = bj( N ) | 0; f[ g >> 2 ] = w; I = w + ( l << 2 ) | 0; f[ g + 8 >> 2 ] = I; Vf( w | 0, 0, N | 0 ) | 0; f[ K >> 2 ] = I; break;

			} while ( 0 );if ( ( ( f[ r + 28 >> 2 ] | 0 ) - ( f[ r + 24 >> 2 ] | 0 ) | 0 ) > 0 ) {

				N = a + 120 | 0; a = e + 8 | 0; l = 0; I = r; while ( 1 ) {

					r = f[ ( f[ I + 24 >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] | 0; a:do if ( ( r | 0 ) != - 1 ) {

						b:do if ( ( f[ ( f[ N >> 2 ] | 0 ) + ( l >>> 5 << 2 ) >> 2 ] & 1 << ( l & 31 ) | 0 ) == 0 ? ( w = f[ m >> 2 ] | 0, n = f[ p >> 2 ] | 0, M = n, ( w | 0 ) != ( n | 0 ) ) : 0 ) {

							j = ( ( ( r >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + r | 0; J = ( w - n | 0 ) / 144 | 0; if ( ( j | 0 ) == - 1 ) {

								n = ( r | 0 ) == - 1; w = 0; while ( 1 ) {

									v = f[ ( f[ f[ M + ( w * 144 | 0 ) + 68 >> 2 ] >> 2 ] | 0 ) + ( r << 2 ) >> 2 ] | 0; if ( 1 << ( v & 31 ) & f[ ( f[ M + ( w * 144 | 0 ) + 16 >> 2 ] | 0 ) + ( v >>> 5 << 2 ) >> 2 ] | 0 ) {

										v = f[ M + ( w * 144 | 0 ) + 32 >> 2 ] | 0; t = ( f[ v + - 4 >> 2 ] | 0 ) == ( f[ v + ( r << 2 ) >> 2 ] | 0 ); do if ( ! t ) {

											W = - 1; break b;

										} while ( ! n );

									}w = w + 1 | 0; if ( w >>> 0 >= J >>> 0 ) {

										W = r; break b;

									}

								}

							}w = I + 12 | 0; n = 0; while ( 1 ) {

								t = f[ ( f[ f[ M + ( n * 144 | 0 ) + 68 >> 2 ] >> 2 ] | 0 ) + ( r << 2 ) >> 2 ] | 0; if ( 1 << ( t & 31 ) & f[ ( f[ M + ( n * 144 | 0 ) + 16 >> 2 ] | 0 ) + ( t >>> 5 << 2 ) >> 2 ] | 0 ) {

									t = f[ M + ( n * 144 | 0 ) + 32 >> 2 ] | 0; v = f[ t + ( r << 2 ) >> 2 ] | 0; s = f[ w >> 2 ] | 0; L = f[ s + ( j << 2 ) >> 2 ] | 0; do if ( ( L | 0 ) != - 1 ) if ( ! ( ( L >>> 0 ) % 3 | 0 ) ) {

										X = L + 2 | 0; break;

									} else {

										X = L + - 1 | 0; break;

									} else X = - 1; while ( 0 );if ( ( X | 0 ) != ( r | 0 ) ) {

										L = X; while ( 1 ) {

											if ( ( f[ t + ( L << 2 ) >> 2 ] | 0 ) != ( v | 0 ) ) {

												W = L; break b;

											} do if ( ( L | 0 ) != - 1 ) {

												q = ( ( ( L >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + L | 0; if ( ( q | 0 ) == - 1 ) {

													Y = - 1; break;

												}F = f[ s + ( q << 2 ) >> 2 ] | 0; if ( ( F | 0 ) == - 1 ) {

													Y = - 1; break;

												} if ( ! ( ( F >>> 0 ) % 3 | 0 ) ) {

													Y = F + 2 | 0; break;

												} else {

													Y = F + - 1 | 0; break;

												}

											} else Y = - 1; while ( 0 );if ( ( Y | 0 ) == ( r | 0 ) ) break; else L = Y;

										}

									}

								}n = n + 1 | 0; if ( n >>> 0 >= J >>> 0 ) {

									W = r; break;

								}

							}

						} else W = r; while ( 0 );J = f[ b >> 2 ] | 0; f[ ( f[ g >> 2 ] | 0 ) + ( W << 2 ) >> 2 ] = J - ( f[ e >> 2 ] | 0 ) >> 2; f[ d >> 2 ] = W; n = J; if ( ( f[ a >> 2 ] | 0 ) >>> 0 > n >>> 0 ) {

							f[ n >> 2 ] = W; f[ b >> 2 ] = n + 4; Z = I;

						} else {

							xf( e, d ); Z = f[ k >> 2 ] | 0;

						} if ( ( ( ( W | 0 ) != - 1 ? ( n = ( ( ( W >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + W | 0, ( n | 0 ) != - 1 ) : 0 ) ? ( J = f[ ( f[ Z + 12 >> 2 ] | 0 ) + ( n << 2 ) >> 2 ] | 0, ( J | 0 ) != - 1 ) : 0 ) ? ( n = J + ( ( ( J >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0, ( n | 0 ) != - 1 & ( n | 0 ) != ( W | 0 ) ) : 0 ) {

							J = W; j = n; n = Z; while ( 1 ) {

								w = f[ m >> 2 ] | 0; M = f[ p >> 2 ] | 0; L = M; c:do if ( ( w | 0 ) == ( M | 0 ) )B = 70; else {

									s = ( w - M | 0 ) / 144 | 0; v = 0; while ( 1 ) {

										t = f[ L + ( v * 144 | 0 ) + 32 >> 2 ] | 0; v = v + 1 | 0; if ( ( f[ t + ( j << 2 ) >> 2 ] | 0 ) != ( f[ t + ( J << 2 ) >> 2 ] | 0 ) ) break; if ( v >>> 0 >= s >>> 0 ) {

											B = 70; break c;

										}

									}s = f[ b >> 2 ] | 0; f[ ( f[ g >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] = s - ( f[ e >> 2 ] | 0 ) >> 2; f[ d >> 2 ] = j; v = s; if ( ( f[ a >> 2 ] | 0 ) >>> 0 > v >>> 0 ) {

										f[ v >> 2 ] = j; f[ b >> 2 ] = v + 4; _ = n;

									} else {

										xf( e, d ); _ = f[ k >> 2 ] | 0;

									}$ = _;

								} while ( 0 );if ( ( B | 0 ) == 70 ) {

									B = 0; L = f[ g >> 2 ] | 0; f[ L + ( j << 2 ) >> 2 ] = f[ L + ( J << 2 ) >> 2 ]; $ = n;

								} if ( ( j | 0 ) == - 1 ) {

									aa = $; break a;

								}L = ( ( ( j >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + j | 0; if ( ( L | 0 ) == - 1 ) {

									aa = $; break a;

								}M = f[ ( f[ $ + 12 >> 2 ] | 0 ) + ( L << 2 ) >> 2 ] | 0; if ( ( M | 0 ) == - 1 ) {

									aa = $; break a;

								}L = M + ( ( ( M >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; if ( ( L | 0 ) != - 1 & ( L | 0 ) != ( W | 0 ) ) {

									M = j; j = L; n = $; J = M;

								} else {

									aa = $; break;

								}

							}

						} else aa = Z;

					} else aa = I; while ( 0 );l = l + 1 | 0; if ( ( l | 0 ) >= ( ( f[ aa + 28 >> 2 ] | 0 ) - ( f[ aa + 24 >> 2 ] | 0 ) >> 2 | 0 ) ) break; else I = aa;

				}

			}aa = f[ i >> 2 ] | 0; I = f[ aa + 44 >> 2 ] | 0; l = f[ I + 100 >> 2 ] | 0; Z = f[ I + 96 >> 2 ] | 0; if ( ( l | 0 ) == ( Z | 0 ) )ba = aa; else {

				$ = h + 4 | 0; W = h + 8 | 0; B = 0; _ = I; I = Z; Z = l; l = aa; k = aa; while ( 1 ) {

					f[ h >> 2 ] = 0; f[ h + 4 >> 2 ] = 0; f[ h + 8 >> 2 ] = 0; aa = ( f[ g >> 2 ] | 0 ) + ( B * 3 << 2 ) | 0; f[ h >> 2 ] = f[ aa >> 2 ]; f[ h + 4 >> 2 ] = f[ aa + 4 >> 2 ]; f[ h + 8 >> 2 ] = f[ aa + 8 >> 2 ]; aa = _ + 96 | 0; a = _ + 100 | 0; p = ( Z - I | 0 ) / 12 | 0; m = I; Y = B; B = B + 1 | 0; if ( Y >>> 0 < p >>> 0 ) {

						ca = m; da = I; ea = Z; fa = l; ga = _; ha = k;

					} else {

						X = Z; f[ d >> 2 ] = 0; f[ d + 4 >> 2 ] = 0; f[ d + 8 >> 2 ] = 0; if ( B >>> 0 <= p >>> 0 ) if ( B >>> 0 < p >>> 0 ? ( N = m + ( B * 12 | 0 ) | 0, ( N | 0 ) != ( X | 0 ) ) : 0 ) {

							r = X + ( ~ ( ( ( X + - 12 - N | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ) | 0; f[ a >> 2 ] = r; ia = m; ja = k; ka = _; la = r; ma = I;

						} else {

							ia = m; ja = k; ka = _; la = Z; ma = I;

						} else {

							Yd( aa, B - p | 0, d ); p = f[ i >> 2 ] | 0; m = f[ p + 44 >> 2 ] | 0; ia = f[ aa >> 2 ] | 0; ja = p; ka = m; la = f[ m + 100 >> 2 ] | 0; ma = f[ m + 96 >> 2 ] | 0;

						}ca = ia; da = ma; ea = la; fa = ja; ga = ka; ha = ja;

					}f[ ca + ( Y * 12 | 0 ) >> 2 ] = f[ h >> 2 ]; f[ ca + ( Y * 12 | 0 ) + 4 >> 2 ] = f[ $ >> 2 ]; f[ ca + ( Y * 12 | 0 ) + 8 >> 2 ] = f[ W >> 2 ]; if ( B >>> 0 >= ( ( ea - da | 0 ) / 12 | 0 ) >>> 0 ) {

						ba = fa; break;

					} else {

						_ = ga; I = da; Z = ea; l = fa; k = ha;

					}

				}

			}ha = f[ e >> 2 ] | 0; f[ ( f[ ba + 4 >> 2 ] | 0 ) + 80 >> 2 ] = ( f[ b >> 2 ] | 0 ) - ha >> 2; ba = f[ g >> 2 ] | 0; if ( ! ba )na = ha; else {

				ha = f[ K >> 2 ] | 0; if ( ( ha | 0 ) != ( ba | 0 ) )f[ K >> 2 ] = ha + ( ~ ( ( ha + - 4 - ba | 0 ) >>> 2 ) << 2 ); dn( ba ); na = f[ e >> 2 ] | 0;

			} if ( na | 0 ) {

				e = f[ b >> 2 ] | 0; if ( ( e | 0 ) != ( na | 0 ) )f[ b >> 2 ] = e + ( ~ ( ( e + - 4 - na | 0 ) >>> 2 ) << 2 ); dn( na );

			}u = c; return 1;

		} function gb( a, c, e, g, h ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; h = h | 0; var i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0, Aa = 0, Ba = 0, Ca = 0, Da = 0, Ea = 0, Fa = 0, Ga = 0, Ha = 0, Ia = 0; i = u; u = u + 64 | 0; j = i + 16 | 0; k = i; l = i + 24 | 0; m = i + 8 | 0; n = i + 20 | 0; f[ j >> 2 ] = c; c = ( a | 0 ) != 0; o = l + 40 | 0; q = o; r = l + 39 | 0; l = m + 4 | 0; s = 0; t = 0; v = 0; a:while ( 1 ) {

				do if ( ( t | 0 ) > - 1 ) if ( ( s | 0 ) > ( 2147483647 - t | 0 ) ) {

					w = ln() | 0; f[ w >> 2 ] = 75; x = - 1; break;

				} else {

					x = s + t | 0; break;

				} else x = t; while ( 0 );w = f[ j >> 2 ] | 0; y = b[ w >> 0 ] | 0; if ( ! ( y << 24 >> 24 ) ) {

					z = 88; break;

				} else {

					A = y; B = w;

				}b:while ( 1 ) {

					switch ( A << 24 >> 24 ) {

						case 37: {

							C = B; D = B; z = 9; break b; break;

						} case 0: {

							E = B; break b; break;

						} default: {}

					}y = B + 1 | 0; f[ j >> 2 ] = y; A = b[ y >> 0 ] | 0; B = y;

				}c:do if ( ( z | 0 ) == 9 ) while ( 1 ) {

					z = 0; if ( ( b[ D + 1 >> 0 ] | 0 ) != 37 ) {

						E = C; break c;

					}y = C + 1 | 0; D = D + 2 | 0; f[ j >> 2 ] = D; if ( ( b[ D >> 0 ] | 0 ) != 37 ) {

						E = y; break;

					} else {

						C = y; z = 9;

					}

				} while ( 0 );y = E - w | 0; if ( c )il( a, w, y ); if ( y | 0 ) {

					s = y; t = x; continue;

				}y = ( Om( b[ ( f[ j >> 2 ] | 0 ) + 1 >> 0 ] | 0 ) | 0 ) == 0; F = f[ j >> 2 ] | 0; if ( ! y ? ( b[ F + 2 >> 0 ] | 0 ) == 36 : 0 ) {

					G = ( b[ F + 1 >> 0 ] | 0 ) + - 48 | 0; H = 1; J = 3;

				} else {

					G = - 1; H = v; J = 1;

				}y = F + J | 0; f[ j >> 2 ] = y; F = b[ y >> 0 ] | 0; K = ( F << 24 >> 24 ) + - 32 | 0; if ( K >>> 0 > 31 | ( 1 << K & 75913 | 0 ) == 0 ) {

					L = 0; M = F; N = y;

				} else {

					K = 0; O = F; F = y; while ( 1 ) {

						y = 1 << ( O << 24 >> 24 ) + - 32 | K; P = F + 1 | 0; f[ j >> 2 ] = P; Q = b[ P >> 0 ] | 0; R = ( Q << 24 >> 24 ) + - 32 | 0; if ( R >>> 0 > 31 | ( 1 << R & 75913 | 0 ) == 0 ) {

							L = y; M = Q; N = P; break;

						} else {

							K = y; O = Q; F = P;

						}

					}

				} if ( M << 24 >> 24 == 42 ) {

					if ( ( Om( b[ N + 1 >> 0 ] | 0 ) | 0 ) != 0 ? ( F = f[ j >> 2 ] | 0, ( b[ F + 2 >> 0 ] | 0 ) == 36 ) : 0 ) {

						O = F + 1 | 0; f[ h + ( ( b[ O >> 0 ] | 0 ) + - 48 << 2 ) >> 2 ] = 10; S = f[ g + ( ( b[ O >> 0 ] | 0 ) + - 48 << 3 ) >> 2 ] | 0; T = 1; U = F + 3 | 0;

					} else {

						if ( H | 0 ) {

							V = - 1; break;

						} if ( c ) {

							F = ( f[ e >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); O = f[ F >> 2 ] | 0; f[ e >> 2 ] = F + 4; W = O;

						} else W = 0; S = W; T = 0; U = ( f[ j >> 2 ] | 0 ) + 1 | 0;

					}f[ j >> 2 ] = U; O = ( S | 0 ) < 0; X = O ? 0 - S | 0 : S; Y = O ? L | 8192 : L; Z = T; _ = U;

				} else {

					O = Sh( j ) | 0; if ( ( O | 0 ) < 0 ) {

						V = - 1; break;

					}X = O; Y = L; Z = H; _ = f[ j >> 2 ] | 0;

				} do if ( ( b[ _ >> 0 ] | 0 ) == 46 ) {

					if ( ( b[ _ + 1 >> 0 ] | 0 ) != 42 ) {

						f[ j >> 2 ] = _ + 1; O = Sh( j ) | 0; $ = O; aa = f[ j >> 2 ] | 0; break;

					} if ( Om( b[ _ + 2 >> 0 ] | 0 ) | 0 ? ( O = f[ j >> 2 ] | 0, ( b[ O + 3 >> 0 ] | 0 ) == 36 ) : 0 ) {

						F = O + 2 | 0; f[ h + ( ( b[ F >> 0 ] | 0 ) + - 48 << 2 ) >> 2 ] = 10; K = f[ g + ( ( b[ F >> 0 ] | 0 ) + - 48 << 3 ) >> 2 ] | 0; F = O + 4 | 0; f[ j >> 2 ] = F; $ = K; aa = F; break;

					} if ( Z | 0 ) {

						V = - 1; break a;

					} if ( c ) {

						F = ( f[ e >> 2 ] | 0 ) + ( 4 - 1 ) & ~ ( 4 - 1 ); K = f[ F >> 2 ] | 0; f[ e >> 2 ] = F + 4; ba = K;

					} else ba = 0; K = ( f[ j >> 2 ] | 0 ) + 2 | 0; f[ j >> 2 ] = K; $ = ba; aa = K;

				} else {

					$ = - 1; aa = _;

				} while ( 0 );K = 0; F = aa; while ( 1 ) {

					if ( ( ( b[ F >> 0 ] | 0 ) + - 65 | 0 ) >>> 0 > 57 ) {

						V = - 1; break a;

					}O = F; F = F + 1 | 0; f[ j >> 2 ] = F; ca = b[ ( b[ O >> 0 ] | 0 ) + - 65 + ( 9878 + ( K * 58 | 0 ) ) >> 0 ] | 0; da = ca & 255; if ( ( da + - 1 | 0 ) >>> 0 >= 8 ) break; else K = da;

				} if ( ! ( ca << 24 >> 24 ) ) {

					V = - 1; break;

				}O = ( G | 0 ) > - 1; do if ( ca << 24 >> 24 == 19 ) if ( O ) {

					V = - 1; break a;

				} else z = 50; else {

					if ( O ) {

						f[ h + ( G << 2 ) >> 2 ] = da; P = g + ( G << 3 ) | 0; Q = f[ P + 4 >> 2 ] | 0; y = k; f[ y >> 2 ] = f[ P >> 2 ]; f[ y + 4 >> 2 ] = Q; z = 50; break;

					} if ( ! c ) {

						V = 0; break a;

					}Zc( k, da, e ); ea = f[ j >> 2 ] | 0;

				} while ( 0 );if ( ( z | 0 ) == 50 ) {

					z = 0; if ( c )ea = F; else {

						s = 0; t = x; v = Z; continue;

					}

				}O = b[ ea + - 1 >> 0 ] | 0; Q = ( K | 0 ) != 0 & ( O & 15 | 0 ) == 3 ? O & - 33 : O; O = Y & - 65537; y = ( Y & 8192 | 0 ) == 0 ? Y : O; d:do switch ( Q | 0 ) {

					case 110: {

						switch ( ( K & 255 ) << 24 >> 24 ) {

							case 0: {

								f[ f[ k >> 2 ] >> 2 ] = x; s = 0; t = x; v = Z; continue a; break;

							} case 1: {

								f[ f[ k >> 2 ] >> 2 ] = x; s = 0; t = x; v = Z; continue a; break;

							} case 2: {

								P = f[ k >> 2 ] | 0; f[ P >> 2 ] = x; f[ P + 4 >> 2 ] = ( ( x | 0 ) < 0 ) << 31 >> 31; s = 0; t = x; v = Z; continue a; break;

							} case 3: {

								d[ f[ k >> 2 ] >> 1 ] = x; s = 0; t = x; v = Z; continue a; break;

							} case 4: {

								b[ f[ k >> 2 ] >> 0 ] = x; s = 0; t = x; v = Z; continue a; break;

							} case 6: {

								f[ f[ k >> 2 ] >> 2 ] = x; s = 0; t = x; v = Z; continue a; break;

							} case 7: {

								P = f[ k >> 2 ] | 0; f[ P >> 2 ] = x; f[ P + 4 >> 2 ] = ( ( x | 0 ) < 0 ) << 31 >> 31; s = 0; t = x; v = Z; continue a; break;

							} default: {

								s = 0; t = x; v = Z; continue a;

							}

						} break;

					} case 112: {

						fa = 120; ga = $ >>> 0 > 8 ? $ : 8; ha = y | 8; z = 62; break;

					} case 88:case 120: {

						fa = Q; ga = $; ha = y; z = 62; break;

					} case 111: {

						P = k; R = f[ P >> 2 ] | 0; ia = f[ P + 4 >> 2 ] | 0; P = Wh( R, ia, o ) | 0; ja = q - P | 0; ka = P; la = 0; ma = 10342; na = ( y & 8 | 0 ) == 0 | ( $ | 0 ) > ( ja | 0 ) ? $ : ja + 1 | 0; oa = y; pa = R; qa = ia; z = 68; break;

					} case 105:case 100: {

						ia = k; R = f[ ia >> 2 ] | 0; ja = f[ ia + 4 >> 2 ] | 0; if ( ( ja | 0 ) < 0 ) {

							ia = Tj( 0, 0, R | 0, ja | 0 ) | 0; P = I; ra = k; f[ ra >> 2 ] = ia; f[ ra + 4 >> 2 ] = P; sa = 1; ta = 10342; ua = ia; va = P; z = 67; break d;

						} else {

							sa = ( y & 2049 | 0 ) != 0 & 1; ta = ( y & 2048 | 0 ) == 0 ? ( ( y & 1 | 0 ) == 0 ? 10342 : 10344 ) : 10343; ua = R; va = ja; z = 67; break d;

						} break;

					} case 117: {

						ja = k; sa = 0; ta = 10342; ua = f[ ja >> 2 ] | 0; va = f[ ja + 4 >> 2 ] | 0; z = 67; break;

					} case 99: {

						b[ r >> 0 ] = f[ k >> 2 ]; wa = r; xa = 0; ya = 10342; za = o; Aa = 1; Ba = O; break;

					} case 109: {

						ja = ln() | 0; Ca = nl( f[ ja >> 2 ] | 0 ) | 0; z = 72; break;

					} case 115: {

						ja = f[ k >> 2 ] | 0; Ca = ja | 0 ? ja : 10352; z = 72; break;

					} case 67: {

						f[ m >> 2 ] = f[ k >> 2 ]; f[ l >> 2 ] = 0; f[ k >> 2 ] = m; Da = - 1; Ea = m; z = 76; break;

					} case 83: {

						ja = f[ k >> 2 ] | 0; if ( ! $ ) {

							ch( a, 32, X, 0, y ); Fa = 0; z = 85;

						} else {

							Da = $; Ea = ja; z = 76;

						} break;

					} case 65:case 71:case 70:case 69:case 97:case 103:case 102:case 101: {

						s = eb( a, + p[ k >> 3 ], X, $, y, Q ) | 0; t = x; v = Z; continue a; break;

					} default: {

						wa = w; xa = 0; ya = 10342; za = o; Aa = $; Ba = y;

					}

				} while ( 0 );e:do if ( ( z | 0 ) == 62 ) {

					z = 0; w = k; Q = f[ w >> 2 ] | 0; K = f[ w + 4 >> 2 ] | 0; w = Fh( Q, K, o, fa & 32 ) | 0; F = ( ha & 8 | 0 ) == 0 | ( Q | 0 ) == 0 & ( K | 0 ) == 0; ka = w; la = F ? 0 : 2; ma = F ? 10342 : 10342 + ( fa >> 4 ) | 0; na = ga; oa = ha; pa = Q; qa = K; z = 68;

				} else if ( ( z | 0 ) == 67 ) {

					z = 0; ka = pg( ua, va, o ) | 0; la = sa; ma = ta; na = $; oa = y; pa = ua; qa = va; z = 68;

				} else if ( ( z | 0 ) == 72 ) {

					z = 0; K = Ed( Ca, 0, $ ) | 0; Q = ( K | 0 ) == 0; wa = Ca; xa = 0; ya = 10342; za = Q ? Ca + $ | 0 : K; Aa = Q ? $ : K - Ca | 0; Ba = O;

				} else if ( ( z | 0 ) == 76 ) {

					z = 0; K = Ea; Q = 0; F = 0; while ( 1 ) {

						w = f[ K >> 2 ] | 0; if ( ! w ) {

							Ga = Q; Ha = F; break;

						}ja = _k( n, w ) | 0; if ( ( ja | 0 ) < 0 | ja >>> 0 > ( Da - Q | 0 ) >>> 0 ) {

							Ga = Q; Ha = ja; break;

						}w = ja + Q | 0; if ( Da >>> 0 > w >>> 0 ) {

							K = K + 4 | 0; Q = w; F = ja;

						} else {

							Ga = w; Ha = ja; break;

						}

					} if ( ( Ha | 0 ) < 0 ) {

						V = - 1; break a;

					}ch( a, 32, X, Ga, y ); if ( ! Ga ) {

						Fa = 0; z = 85;

					} else {

						F = Ea; Q = 0; while ( 1 ) {

							K = f[ F >> 2 ] | 0; if ( ! K ) {

								Fa = Ga; z = 85; break e;

							}ja = _k( n, K ) | 0; Q = ja + Q | 0; if ( ( Q | 0 ) > ( Ga | 0 ) ) {

								Fa = Ga; z = 85; break e;

							}il( a, n, ja ); if ( Q >>> 0 >= Ga >>> 0 ) {

								Fa = Ga; z = 85; break;

							} else F = F + 4 | 0;

						}

					}

				} while ( 0 );if ( ( z | 0 ) == 68 ) {

					z = 0; O = ( pa | 0 ) != 0 | ( qa | 0 ) != 0; F = ( na | 0 ) != 0 | O; Q = q - ka + ( ( O ^ 1 ) & 1 ) | 0; wa = F ? ka : o; xa = la; ya = ma; za = o; Aa = F ? ( ( na | 0 ) > ( Q | 0 ) ? na : Q ) : na; Ba = ( na | 0 ) > - 1 ? oa & - 65537 : oa;

				} else if ( ( z | 0 ) == 85 ) {

					z = 0; ch( a, 32, X, Fa, y ^ 8192 ); s = ( X | 0 ) > ( Fa | 0 ) ? X : Fa; t = x; v = Z; continue;

				}Q = za - wa | 0; F = ( Aa | 0 ) < ( Q | 0 ) ? Q : Aa; O = F + xa | 0; ja = ( X | 0 ) < ( O | 0 ) ? O : X; ch( a, 32, ja, O, Ba ); il( a, ya, xa ); ch( a, 48, ja, O, Ba ^ 65536 ); ch( a, 48, F, Q, 0 ); il( a, wa, Q ); ch( a, 32, ja, O, Ba ^ 8192 ); s = ja; t = x; v = Z;

			}f:do if ( ( z | 0 ) == 88 ) if ( ! a ) if ( v ) {

				Z = 1; while ( 1 ) {

					t = f[ h + ( Z << 2 ) >> 2 ] | 0; if ( ! t ) {

						Ia = Z; break;

					}Zc( g + ( Z << 3 ) | 0, t, e ); t = Z + 1 | 0; if ( ( Z | 0 ) < 9 )Z = t; else {

						Ia = t; break;

					}

				} if ( ( Ia | 0 ) < 10 ) {

					Z = Ia; while ( 1 ) {

						if ( f[ h + ( Z << 2 ) >> 2 ] | 0 ) {

							V = - 1; break f;

						} if ( ( Z | 0 ) < 9 )Z = Z + 1 | 0; else {

							V = 1; break;

						}

					}

				} else V = 1;

			} else V = 0; else V = x; while ( 0 );u = i; return V | 0;

		} function hb( a ) {

			a = a | 0; var c = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0; c = u; u = u + 80 | 0; e = c + 40 | 0; g = c + 68 | 0; h = c + 64 | 0; i = c + 60 | 0; j = c + 52 | 0; k = c; l = c + 56 | 0; m = c + 48 | 0; f[ a + 132 >> 2 ] = 0; n = a + 148 | 0; if ( f[ n >> 2 ] | 0 ) {

				o = a + 144 | 0; p = f[ o >> 2 ] | 0; if ( p | 0 ) {

					q = p; do {

						p = q; q = f[ q >> 2 ] | 0; dn( p );

					} while ( ( q | 0 ) != 0 );

				}f[ o >> 2 ] = 0; o = f[ a + 140 >> 2 ] | 0; if ( o | 0 ) {

					q = a + 136 | 0; p = 0; do {

						f[ ( f[ q >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] = 0; p = p + 1 | 0;

					} while ( ( p | 0 ) != ( o | 0 ) );

				}f[ n >> 2 ] = 0;

			}n = a + 4 | 0; if ( ! ( dg( g, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ) ) {

				r = 0; u = c; return r | 0;

			}o = a + 156 | 0; f[ o >> 2 ] = f[ g >> 2 ]; g = ( dg( h, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ) ^ 1; do if ( ! ( ( f[ h >> 2 ] | 0 ) >>> 0 > 1431655765 | g ) ) {

				p = f[ a + 24 >> 2 ] | 0; q = a + 28 | 0; s = f[ q >> 2 ] | 0; if ( ( s | 0 ) != ( p | 0 ) )f[ q >> 2 ] = s + ( ~ ( ( s + - 4 - p | 0 ) >>> 2 ) << 2 ); p = bj( 88 ) | 0; di( p ); s = a + 8 | 0; q = f[ s >> 2 ] | 0; f[ s >> 2 ] = p; if ( q | 0 ? ( mf( q ), dn( q ), ( f[ s >> 2 ] | 0 ) == 0 ) : 0 ) {

					t = 0; break;

				}q = a + 160 | 0; p = f[ q >> 2 ] | 0; v = a + 164 | 0; w = f[ v >> 2 ] | 0; if ( ( w | 0 ) != ( p | 0 ) )f[ v >> 2 ] = w + ( ~ ( ( w + - 4 - p | 0 ) >>> 2 ) << 2 ); Eg( q, f[ h >> 2 ] | 0 ); q = a + 172 | 0; p = f[ q >> 2 ] | 0; w = a + 176 | 0; v = f[ w >> 2 ] | 0; if ( ( v | 0 ) != ( p | 0 ) )f[ w >> 2 ] = v + ( ~ ( ( v + - 4 - p | 0 ) >>> 2 ) << 2 ); Eg( q, f[ h >> 2 ] | 0 ); q = f[ a + 36 >> 2 ] | 0; p = a + 40 | 0; v = f[ p >> 2 ] | 0; if ( ( v | 0 ) != ( q | 0 ) )f[ p >> 2 ] = v + ( ~ ( ( ( v + - 12 - q | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ); q = f[ a + 48 >> 2 ] | 0; v = a + 52 | 0; p = f[ v >> 2 ] | 0; if ( ( p | 0 ) != ( q | 0 ) )f[ v >> 2 ] = p + ( ~ ( ( p + - 4 - q | 0 ) >>> 2 ) << 2 ); f[ a + 64 >> 2 ] = 0; q = f[ a + 72 >> 2 ] | 0; p = a + 76 | 0; v = f[ p >> 2 ] | 0; if ( ( v | 0 ) != ( q | 0 ) )f[ p >> 2 ] = v + ( ~ ( ( v + - 4 - q | 0 ) >>> 2 ) << 2 ); f[ a + 84 >> 2 ] = - 1; f[ a + 92 >> 2 ] = - 1; f[ a + 88 >> 2 ] = - 1; q = f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0; v = q + 8 | 0; p = f[ v + 4 >> 2 ] | 0; w = q + 16 | 0; x = w; y = f[ x >> 2 ] | 0; z = f[ x + 4 >> 2 ] | 0; if ( ( p | 0 ) > ( z | 0 ) | ( ( p | 0 ) == ( z | 0 ) ? ( f[ v >> 2 ] | 0 ) >>> 0 > y >>> 0 : 0 ) ) {

					v = b[ ( f[ q >> 2 ] | 0 ) + y >> 0 ] | 0; q = Rj( y | 0, z | 0, 1, 0 ) | 0; z = w; f[ z >> 2 ] = q; f[ z + 4 >> 2 ] = I; z = a + 212 | 0; q = f[ z >> 2 ] | 0; w = a + 216 | 0; y = f[ w >> 2 ] | 0; if ( ( y | 0 ) != ( q | 0 ) ) {

						p = y; do {

							f[ w >> 2 ] = p + - 144; y = f[ p + - 12 >> 2 ] | 0; if ( y | 0 ) {

								x = p + - 8 | 0; A = f[ x >> 2 ] | 0; if ( ( A | 0 ) != ( y | 0 ) )f[ x >> 2 ] = A + ( ~ ( ( A + - 4 - y | 0 ) >>> 2 ) << 2 ); dn( y );

							}y = f[ p + - 28 >> 2 ] | 0; if ( y | 0 ) {

								A = p + - 24 | 0; x = f[ A >> 2 ] | 0; if ( ( x | 0 ) != ( y | 0 ) )f[ A >> 2 ] = x + ( ~ ( ( x + - 4 - y | 0 ) >>> 2 ) << 2 ); dn( y );

							}y = f[ p + - 40 >> 2 ] | 0; if ( y | 0 ) {

								x = p + - 36 | 0; A = f[ x >> 2 ] | 0; if ( ( A | 0 ) != ( y | 0 ) )f[ x >> 2 ] = A + ( ~ ( ( A + - 4 - y | 0 ) >>> 2 ) << 2 ); dn( y );

							}tf( p + - 140 | 0 ); p = f[ w >> 2 ] | 0;

						} while ( ( p | 0 ) != ( q | 0 ) );

					}q = v & 255; Ne( z, q ); if ( dg( i, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ? ( f[ h >> 2 ] | 0 ) >>> 0 >= ( f[ i >> 2 ] | 0 ) >>> 0 : 0 ) {

						if ( ( dg( j, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ? Gf( f[ s >> 2 ] | 0, f[ h >> 2 ] | 0, ( f[ j >> 2 ] | 0 ) + ( f[ o >> 2 ] | 0 ) | 0 ) | 0 : 0 ) ? ( p = ( f[ j >> 2 ] | 0 ) + ( f[ o >> 2 ] | 0 ) | 0, b[ e >> 0 ] = 1, le( a + 120 | 0, p, e ), ( Fc( a, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ) != - 1 ) : 0 ) {

							p = a + 224 | 0; f[ a + 368 >> 2 ] = a; y = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( a ) | 0 ) + 32 | 0; A = f[ y >> 2 ] | 0; y = ( f[ A >> 2 ] | 0 ) + ( f[ A + 16 >> 2 ] | 0 ) | 0; A = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( a ) | 0 ) + 32 | 0; x = f[ A >> 2 ] | 0; A = x + 8 | 0; B = x + 16 | 0; x = Tj( f[ A >> 2 ] | 0, f[ A + 4 >> 2 ] | 0, f[ B >> 2 ] | 0, f[ B + 4 >> 2 ] | 0 ) | 0; B = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( a ) | 0 ) + 32 | 0; Wi( p, y, x, d[ ( f[ B >> 2 ] | 0 ) + 38 >> 1 ] | 0 ); f[ a + 364 >> 2 ] = q; Bi( k ); q = a + 264 | 0; B = q; x = p; y = B + 40 | 0; do {

								f[ B >> 2 ] = f[ x >> 2 ]; B = B + 4 | 0; x = x + 4 | 0;

							} while ( ( B | 0 ) < ( y | 0 ) );a:do if ( ah( q, 1, e ) | 0 ) {

								B = p; x = q; y = B + 40 | 0; do {

									f[ B >> 2 ] = f[ x >> 2 ]; B = B + 4 | 0; x = x + 4 | 0;

								} while ( ( B | 0 ) < ( y | 0 ) );v = e; A = f[ v >> 2 ] | 0; C = f[ v + 4 >> 2 ] | 0; v = a + 232 | 0; D = a + 240 | 0; E = D; F = f[ E >> 2 ] | 0; G = f[ E + 4 >> 2 ] | 0; E = Tj( f[ v >> 2 ] | 0, f[ v + 4 >> 2 ] | 0, F | 0, G | 0 ) | 0; v = I; if ( C >>> 0 > v >>> 0 | ( C | 0 ) == ( v | 0 ) & A >>> 0 > E >>> 0 ) {

									H = 46; break;

								}E = Rj( F | 0, G | 0, A | 0, C | 0 ) | 0; C = D; f[ C >> 2 ] = E; f[ C + 4 >> 2 ] = I; td( a + 304 | 0, p ) | 0; if ( ! ( qf( p ) | 0 ) ) {

									J = 0; break;

								}B = k; x = p; y = B + 40 | 0; do {

									f[ B >> 2 ] = f[ x >> 2 ]; B = B + 4 | 0; x = x + 4 | 0;

								} while ( ( B | 0 ) < ( y | 0 ) );C = _a( a, f[ i >> 2 ] | 0 ) | 0; if ( ( C | 0 ) == - 1 ) {

									J = 0; break;

								}E = f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0; D = k + 16 | 0; A = f[ D >> 2 ] | 0; G = ( f[ k >> 2 ] | 0 ) + A | 0; F = k + 8 | 0; v = Tj( f[ F >> 2 ] | 0, f[ F + 4 >> 2 ] | 0, A | 0, f[ D + 4 >> 2 ] | 0 ) | 0; Wi( E, G, v, d[ E + 38 >> 1 ] | 0 ); do if ( ( f[ w >> 2 ] | 0 ) != ( f[ z >> 2 ] | 0 ) ) {

									E = f[ s >> 2 ] | 0; if ( ( f[ E + 4 >> 2 ] | 0 ) == ( f[ E >> 2 ] | 0 ) ) break; E = 0; do {

										f[ l >> 2 ] = E; f[ e >> 2 ] = f[ l >> 2 ]; E = E + 3 | 0; if ( ! ( Gb( a, e ) | 0 ) ) {

											J = 0; break a;

										}v = f[ s >> 2 ] | 0;

									} while ( E >>> 0 < ( f[ v + 4 >> 2 ] | 0 ) - ( f[ v >> 2 ] | 0 ) >> 2 >>> 0 );

								} while ( 0 );if ( b[ a + 300 >> 0 ] | 0 )bi( q ); E = f[ z >> 2 ] | 0; if ( ( f[ w >> 2 ] | 0 ) != ( E | 0 ) ) {

									v = 0; G = E; do {

										te( G + ( v * 144 | 0 ) + 4 | 0, f[ s >> 2 ] | 0 ) | 0; E = f[ z >> 2 ] | 0; D = f[ E + ( v * 144 | 0 ) + 132 >> 2 ] | 0; A = f[ E + ( v * 144 | 0 ) + 136 >> 2 ] | 0; if ( ( D | 0 ) == ( A | 0 ) )K = E; else {

											F = D; D = E; while ( 1 ) {

												f[ m >> 2 ] = f[ F >> 2 ]; f[ e >> 2 ] = f[ m >> 2 ]; $d( D + ( v * 144 | 0 ) + 4 | 0, e ); F = F + 4 | 0; E = f[ z >> 2 ] | 0; if ( ( F | 0 ) == ( A | 0 ) ) {

													K = E; break;

												} else D = E;

											}

										}Lh( K + ( v * 144 | 0 ) + 4 | 0, 0, 0 ); v = v + 1 | 0; G = f[ z >> 2 ] | 0;

									} while ( v >>> 0 < ( ( ( f[ w >> 2 ] | 0 ) - G | 0 ) / 144 | 0 ) >>> 0 );

								}G = f[ s >> 2 ] | 0; v = ( f[ G + 28 >> 2 ] | 0 ) - ( f[ G + 24 >> 2 ] | 0 ) >> 2; G = a + 196 | 0; D = a + 200 | 0; A = f[ D >> 2 ] | 0; F = f[ G >> 2 ] | 0; E = A - F >> 2; L = F; F = A; do if ( v >>> 0 > E >>> 0 )ff( G, v - E | 0 ); else {

									if ( v >>> 0 >= E >>> 0 ) break; A = L + ( v << 2 ) | 0; if ( ( A | 0 ) == ( F | 0 ) ) break; f[ D >> 2 ] = F + ( ~ ( ( F + - 4 - A | 0 ) >>> 2 ) << 2 );

								} while ( 0 );Eg( a + 184 | 0, v ); F = f[ z >> 2 ] | 0; if ( ( f[ w >> 2 ] | 0 ) != ( F | 0 ) ) {

									D = 0; L = F; do {

										F = L; E = ( f[ F + ( D * 144 | 0 ) + 60 >> 2 ] | 0 ) - ( f[ F + ( D * 144 | 0 ) + 56 >> 2 ] | 0 ) >> 2; G = f[ s >> 2 ] | 0; A = ( f[ G + 28 >> 2 ] | 0 ) - ( f[ G + 24 >> 2 ] | 0 ) >> 2; G = ( E | 0 ) < ( A | 0 ) ? A : E; E = F + ( D * 144 | 0 ) + 116 | 0; A = F + ( D * 144 | 0 ) + 120 | 0; M = f[ A >> 2 ] | 0; N = f[ E >> 2 ] | 0; O = M - N >> 2; P = N; N = M; do if ( G >>> 0 > O >>> 0 )ff( E, G - O | 0 ); else {

											if ( G >>> 0 >= O >>> 0 ) break; M = P + ( G << 2 ) | 0; if ( ( M | 0 ) == ( N | 0 ) ) break; f[ A >> 2 ] = N + ( ~ ( ( N + - 4 - M | 0 ) >>> 2 ) << 2 );

										} while ( 0 );Eg( F + ( D * 144 | 0 ) + 104 | 0, G ); D = D + 1 | 0; L = f[ z >> 2 ] | 0;

									} while ( D >>> 0 < ( ( ( f[ w >> 2 ] | 0 ) - L | 0 ) / 144 | 0 ) >>> 0 );

								}J = fb( a, C ) | 0;

							} else H = 46; while ( 0 );if ( ( H | 0 ) == 46 )J = 0; Q = J;

						} else Q = 0; R = Q;

					} else R = 0; t = R;

				} else t = 0;

			} else t = 0; while ( 0 );r = t; u = c; return r | 0;

		} function ib( a ) {

			a = a | 0; var c = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0; c = u; u = u + 80 | 0; e = c + 64 | 0; g = c + 60 | 0; h = c + 56 | 0; i = c + 52 | 0; j = c + 48 | 0; k = c; l = c + 44 | 0; m = c + 40 | 0; f[ a + 132 >> 2 ] = 0; n = a + 148 | 0; if ( f[ n >> 2 ] | 0 ) {

				o = a + 144 | 0; p = f[ o >> 2 ] | 0; if ( p | 0 ) {

					q = p; do {

						p = q; q = f[ q >> 2 ] | 0; dn( p );

					} while ( ( q | 0 ) != 0 );

				}f[ o >> 2 ] = 0; o = f[ a + 140 >> 2 ] | 0; if ( o | 0 ) {

					q = a + 136 | 0; p = 0; do {

						f[ ( f[ q >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] = 0; p = p + 1 | 0;

					} while ( ( p | 0 ) != ( o | 0 ) );

				}f[ n >> 2 ] = 0;

			}n = a + 4 | 0; if ( ! ( dg( g, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ) ) {

				r = 0; u = c; return r | 0;

			}o = a + 156 | 0; f[ o >> 2 ] = f[ g >> 2 ]; g = ( dg( h, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ) ^ 1; do if ( ! ( ( f[ h >> 2 ] | 0 ) >>> 0 > 1431655765 | g ) ) {

				p = f[ a + 24 >> 2 ] | 0; q = a + 28 | 0; s = f[ q >> 2 ] | 0; if ( ( s | 0 ) != ( p | 0 ) )f[ q >> 2 ] = s + ( ~ ( ( s + - 4 - p | 0 ) >>> 2 ) << 2 ); p = bj( 88 ) | 0; di( p ); s = a + 8 | 0; q = f[ s >> 2 ] | 0; f[ s >> 2 ] = p; if ( q | 0 ? ( mf( q ), dn( q ), ( f[ s >> 2 ] | 0 ) == 0 ) : 0 ) {

					t = 0; break;

				}q = a + 160 | 0; p = f[ q >> 2 ] | 0; v = a + 164 | 0; w = f[ v >> 2 ] | 0; if ( ( w | 0 ) != ( p | 0 ) )f[ v >> 2 ] = w + ( ~ ( ( w + - 4 - p | 0 ) >>> 2 ) << 2 ); Eg( q, f[ h >> 2 ] | 0 ); q = a + 172 | 0; p = f[ q >> 2 ] | 0; w = a + 176 | 0; v = f[ w >> 2 ] | 0; if ( ( v | 0 ) != ( p | 0 ) )f[ w >> 2 ] = v + ( ~ ( ( v + - 4 - p | 0 ) >>> 2 ) << 2 ); Eg( q, f[ h >> 2 ] | 0 ); q = f[ a + 36 >> 2 ] | 0; p = a + 40 | 0; v = f[ p >> 2 ] | 0; if ( ( v | 0 ) != ( q | 0 ) )f[ p >> 2 ] = v + ( ~ ( ( ( v + - 12 - q | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ); q = f[ a + 48 >> 2 ] | 0; v = a + 52 | 0; p = f[ v >> 2 ] | 0; if ( ( p | 0 ) != ( q | 0 ) )f[ v >> 2 ] = p + ( ~ ( ( p + - 4 - q | 0 ) >>> 2 ) << 2 ); f[ a + 64 >> 2 ] = 0; q = f[ a + 72 >> 2 ] | 0; p = a + 76 | 0; v = f[ p >> 2 ] | 0; if ( ( v | 0 ) != ( q | 0 ) )f[ p >> 2 ] = v + ( ~ ( ( v + - 4 - q | 0 ) >>> 2 ) << 2 ); f[ a + 84 >> 2 ] = - 1; f[ a + 92 >> 2 ] = - 1; f[ a + 88 >> 2 ] = - 1; q = f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0; v = q + 8 | 0; p = f[ v + 4 >> 2 ] | 0; w = q + 16 | 0; x = w; y = f[ x >> 2 ] | 0; z = f[ x + 4 >> 2 ] | 0; if ( ( p | 0 ) > ( z | 0 ) | ( ( p | 0 ) == ( z | 0 ) ? ( f[ v >> 2 ] | 0 ) >>> 0 > y >>> 0 : 0 ) ) {

					v = b[ ( f[ q >> 2 ] | 0 ) + y >> 0 ] | 0; q = Rj( y | 0, z | 0, 1, 0 ) | 0; z = w; f[ z >> 2 ] = q; f[ z + 4 >> 2 ] = I; z = a + 212 | 0; q = f[ z >> 2 ] | 0; w = a + 216 | 0; y = f[ w >> 2 ] | 0; if ( ( y | 0 ) != ( q | 0 ) ) {

						p = y; do {

							f[ w >> 2 ] = p + - 144; y = f[ p + - 12 >> 2 ] | 0; if ( y | 0 ) {

								x = p + - 8 | 0; A = f[ x >> 2 ] | 0; if ( ( A | 0 ) != ( y | 0 ) )f[ x >> 2 ] = A + ( ~ ( ( A + - 4 - y | 0 ) >>> 2 ) << 2 ); dn( y );

							}y = f[ p + - 28 >> 2 ] | 0; if ( y | 0 ) {

								A = p + - 24 | 0; x = f[ A >> 2 ] | 0; if ( ( x | 0 ) != ( y | 0 ) )f[ A >> 2 ] = x + ( ~ ( ( x + - 4 - y | 0 ) >>> 2 ) << 2 ); dn( y );

							}y = f[ p + - 40 >> 2 ] | 0; if ( y | 0 ) {

								x = p + - 36 | 0; A = f[ x >> 2 ] | 0; if ( ( A | 0 ) != ( y | 0 ) )f[ x >> 2 ] = A + ( ~ ( ( A + - 4 - y | 0 ) >>> 2 ) << 2 ); dn( y );

							}tf( p + - 140 | 0 ); p = f[ w >> 2 ] | 0;

						} while ( ( p | 0 ) != ( q | 0 ) );

					}q = v & 255; Ne( z, q ); if ( dg( i, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ? ( f[ h >> 2 ] | 0 ) >>> 0 >= ( f[ i >> 2 ] | 0 ) >>> 0 : 0 ) {

						if ( ( dg( j, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ? Gf( f[ s >> 2 ] | 0, f[ h >> 2 ] | 0, ( f[ j >> 2 ] | 0 ) + ( f[ o >> 2 ] | 0 ) | 0 ) | 0 : 0 ) ? ( p = ( f[ j >> 2 ] | 0 ) + ( f[ o >> 2 ] | 0 ) | 0, b[ e >> 0 ] = 1, le( a + 120 | 0, p, e ), ( Fc( a, f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0 ) | 0 ) != - 1 ) : 0 ) {

							p = a + 224 | 0; f[ a + 368 >> 2 ] = a; y = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( a ) | 0 ) + 32 | 0; A = f[ y >> 2 ] | 0; y = ( f[ A >> 2 ] | 0 ) + ( f[ A + 16 >> 2 ] | 0 ) | 0; A = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( a ) | 0 ) + 32 | 0; x = f[ A >> 2 ] | 0; A = x + 8 | 0; B = x + 16 | 0; x = Tj( f[ A >> 2 ] | 0, f[ A + 4 >> 2 ] | 0, f[ B >> 2 ] | 0, f[ B + 4 >> 2 ] | 0 ) | 0; B = ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( a ) | 0 ) + 32 | 0; Wi( p, y, x, d[ ( f[ B >> 2 ] | 0 ) + 38 >> 1 ] | 0 ); B = Na[ f[ ( f[ a >> 2 ] | 0 ) + 36 >> 2 ] & 127 ]( a ) | 0; f[ a + 372 >> 2 ] = B; f[ a + 376 >> 2 ] = ( f[ j >> 2 ] | 0 ) + ( f[ o >> 2 ] | 0 ); f[ a + 364 >> 2 ] = q; Bi( k ); a:do if ( kc( p, k ) | 0 ) {

								q = Za( a, f[ i >> 2 ] | 0 ) | 0; if ( ( q | 0 ) == - 1 ) {

									C = 0; break;

								}B = f[ ( f[ n >> 2 ] | 0 ) + 32 >> 2 ] | 0; x = k + 16 | 0; y = f[ x >> 2 ] | 0; A = ( f[ k >> 2 ] | 0 ) + y | 0; D = k + 8 | 0; E = Tj( f[ D >> 2 ] | 0, f[ D + 4 >> 2 ] | 0, y | 0, f[ x + 4 >> 2 ] | 0 ) | 0; Wi( B, A, E, d[ B + 38 >> 1 ] | 0 ); do if ( ( f[ w >> 2 ] | 0 ) != ( f[ z >> 2 ] | 0 ) ) {

									B = f[ s >> 2 ] | 0; if ( ( f[ B + 4 >> 2 ] | 0 ) == ( f[ B >> 2 ] | 0 ) ) break; B = 0; do {

										f[ l >> 2 ] = B; f[ e >> 2 ] = f[ l >> 2 ]; B = B + 3 | 0; if ( ! ( Gb( a, e ) | 0 ) ) {

											C = 0; break a;

										}E = f[ s >> 2 ] | 0;

									} while ( B >>> 0 < ( f[ E + 4 >> 2 ] | 0 ) - ( f[ E >> 2 ] | 0 ) >> 2 >>> 0 );

								} while ( 0 );if ( b[ a + 300 >> 0 ] | 0 )bi( a + 264 | 0 ); B = f[ z >> 2 ] | 0; if ( ( f[ w >> 2 ] | 0 ) != ( B | 0 ) ) {

									E = 0; A = B; do {

										te( A + ( E * 144 | 0 ) + 4 | 0, f[ s >> 2 ] | 0 ) | 0; B = f[ z >> 2 ] | 0; x = f[ B + ( E * 144 | 0 ) + 132 >> 2 ] | 0; y = f[ B + ( E * 144 | 0 ) + 136 >> 2 ] | 0; if ( ( x | 0 ) == ( y | 0 ) )F = B; else {

											D = x; x = B; while ( 1 ) {

												f[ m >> 2 ] = f[ D >> 2 ]; f[ e >> 2 ] = f[ m >> 2 ]; $d( x + ( E * 144 | 0 ) + 4 | 0, e ); D = D + 4 | 0; B = f[ z >> 2 ] | 0; if ( ( D | 0 ) == ( y | 0 ) ) {

													F = B; break;

												} else x = B;

											}

										}Lh( F + ( E * 144 | 0 ) + 4 | 0, 0, 0 ); E = E + 1 | 0; A = f[ z >> 2 ] | 0;

									} while ( E >>> 0 < ( ( ( f[ w >> 2 ] | 0 ) - A | 0 ) / 144 | 0 ) >>> 0 );

								}A = f[ s >> 2 ] | 0; E = ( f[ A + 28 >> 2 ] | 0 ) - ( f[ A + 24 >> 2 ] | 0 ) >> 2; A = a + 196 | 0; x = a + 200 | 0; y = f[ x >> 2 ] | 0; D = f[ A >> 2 ] | 0; B = y - D >> 2; G = D; D = y; do if ( E >>> 0 > B >>> 0 )ff( A, E - B | 0 ); else {

									if ( E >>> 0 >= B >>> 0 ) break; y = G + ( E << 2 ) | 0; if ( ( y | 0 ) == ( D | 0 ) ) break; f[ x >> 2 ] = D + ( ~ ( ( D + - 4 - y | 0 ) >>> 2 ) << 2 );

								} while ( 0 );Eg( a + 184 | 0, E ); D = f[ z >> 2 ] | 0; if ( ( f[ w >> 2 ] | 0 ) != ( D | 0 ) ) {

									x = 0; G = D; do {

										D = G; B = ( f[ D + ( x * 144 | 0 ) + 60 >> 2 ] | 0 ) - ( f[ D + ( x * 144 | 0 ) + 56 >> 2 ] | 0 ) >> 2; A = f[ s >> 2 ] | 0; y = ( f[ A + 28 >> 2 ] | 0 ) - ( f[ A + 24 >> 2 ] | 0 ) >> 2; A = ( B | 0 ) < ( y | 0 ) ? y : B; B = D + ( x * 144 | 0 ) + 116 | 0; y = D + ( x * 144 | 0 ) + 120 | 0; H = f[ y >> 2 ] | 0; J = f[ B >> 2 ] | 0; K = H - J >> 2; L = J; J = H; do if ( A >>> 0 > K >>> 0 )ff( B, A - K | 0 ); else {

											if ( A >>> 0 >= K >>> 0 ) break; H = L + ( A << 2 ) | 0; if ( ( H | 0 ) == ( J | 0 ) ) break; f[ y >> 2 ] = J + ( ~ ( ( J + - 4 - H | 0 ) >>> 2 ) << 2 );

										} while ( 0 );Eg( D + ( x * 144 | 0 ) + 104 | 0, A ); x = x + 1 | 0; G = f[ z >> 2 ] | 0;

									} while ( x >>> 0 < ( ( ( f[ w >> 2 ] | 0 ) - G | 0 ) / 144 | 0 ) >>> 0 );

								}C = fb( a, q ) | 0;

							} else C = 0; while ( 0 );M = C;

						} else M = 0; N = M;

					} else N = 0; t = N;

				} else t = 0;

			} else t = 0; while ( 0 );r = t; u = c; return r | 0;

		} function jb( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var i = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = La, D = 0, E = 0.0, F = 0, G = 0; if ( ! g ) {

				i = 0; return i | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					k = a + 24 | 0; l = b[ k >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; q = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; r = Rj( q | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = m + r | 0; r = 0; while ( 1 ) {

							m = b[ o >> 0 ] | 0; q = g + ( r << 3 ) | 0; f[ q >> 2 ] = m; f[ q + 4 >> 2 ] = ( ( m | 0 ) < 0 ) << 31 >> 31; r = r + 1 | 0; m = b[ k >> 0 ] | 0; if ( ( r | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								s = m; break;

							} else o = o + 1 | 0;

						}

					} else s = l; o = s << 24 >> 24; if ( s << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 3 ) | 0, 0, ( e << 24 >> 24 ) - o << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 2: {

					o = a + 24 | 0; r = b[ o >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; q = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; t = Rj( q | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = k + t | 0; t = 0; while ( 1 ) {

							k = g + ( t << 3 ) | 0; f[ k >> 2 ] = h[ m >> 0 ]; f[ k + 4 >> 2 ] = 0; t = t + 1 | 0; k = b[ o >> 0 ] | 0; if ( ( t | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								u = k; break;

							} else m = m + 1 | 0;

						}

					} else u = r; m = u << 24 >> 24; if ( u << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 3 ) | 0, 0, ( e << 24 >> 24 ) - m << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 3: {

					m = a + 24 | 0; t = b[ m >> 0 ] | 0; if ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; k = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; q = Rj( k | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = o + q | 0; q = 0; while ( 1 ) {

							o = d[ l >> 1 ] | 0; k = g + ( q << 3 ) | 0; f[ k >> 2 ] = o; f[ k + 4 >> 2 ] = ( ( o | 0 ) < 0 ) << 31 >> 31; q = q + 1 | 0; o = b[ m >> 0 ] | 0; if ( ( q | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								v = o; break;

							} else l = l + 2 | 0;

						}

					} else v = t; l = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 3 ) | 0, 0, ( e << 24 >> 24 ) - l << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 4: {

					l = a + 24 | 0; q = b[ l >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; r = a + 40 | 0; o = gj( f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; r = a + 48 | 0; k = Rj( o | 0, I | 0, f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0 ) | 0; r = m + k | 0; k = 0; while ( 1 ) {

							m = g + ( k << 3 ) | 0; f[ m >> 2 ] = j[ r >> 1 ]; f[ m + 4 >> 2 ] = 0; k = k + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( k | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								w = m; break;

							} else r = r + 2 | 0;

						}

					} else w = q; r = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( r << 3 ) | 0, 0, ( e << 24 >> 24 ) - r << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 5: {

					r = a + 24 | 0; k = b[ r >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; t = a + 40 | 0; m = gj( f[ t >> 2 ] | 0, f[ t + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; t = a + 48 | 0; o = Rj( m | 0, I | 0, f[ t >> 2 ] | 0, f[ t + 4 >> 2 ] | 0 ) | 0; t = l + o | 0; o = 0; while ( 1 ) {

							l = f[ t >> 2 ] | 0; m = g + ( o << 3 ) | 0; f[ m >> 2 ] = l; f[ m + 4 >> 2 ] = ( ( l | 0 ) < 0 ) << 31 >> 31; o = o + 1 | 0; l = b[ r >> 0 ] | 0; if ( ( o | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								x = l; break;

							} else t = t + 4 | 0;

						}

					} else x = k; t = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( t << 3 ) | 0, 0, ( e << 24 >> 24 ) - t << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 6: {

					t = a + 24 | 0; o = b[ t >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						r = f[ f[ a >> 2 ] >> 2 ] | 0; q = a + 40 | 0; l = gj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; q = a + 48 | 0; m = Rj( l | 0, I | 0, f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0 ) | 0; q = r + m | 0; m = 0; while ( 1 ) {

							r = g + ( m << 3 ) | 0; f[ r >> 2 ] = f[ q >> 2 ]; f[ r + 4 >> 2 ] = 0; m = m + 1 | 0; r = b[ t >> 0 ] | 0; if ( ( m | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								y = r; break;

							} else q = q + 4 | 0;

						}

					} else y = o; q = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( q << 3 ) | 0, 0, ( e << 24 >> 24 ) - q << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 7: {

					q = a + 24 | 0; m = b[ q >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						t = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; r = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; l = Rj( r | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = t + l | 0; l = 0; while ( 1 ) {

							t = k; r = f[ t + 4 >> 2 ] | 0; z = g + ( l << 3 ) | 0; f[ z >> 2 ] = f[ t >> 2 ]; f[ z + 4 >> 2 ] = r; l = l + 1 | 0; r = b[ q >> 0 ] | 0; if ( ( l | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								A = r; break;

							} else k = k + 8 | 0;

						}

					} else A = m; k = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 3 ) | 0, 0, ( e << 24 >> 24 ) - k << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 8: {

					k = a + 24 | 0; l = b[ k >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						q = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; r = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; z = Rj( r | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = q + z | 0; z = 0; while ( 1 ) {

							q = o; r = f[ q + 4 >> 2 ] | 0; t = g + ( z << 3 ) | 0; f[ t >> 2 ] = f[ q >> 2 ]; f[ t + 4 >> 2 ] = r; z = z + 1 | 0; r = b[ k >> 0 ] | 0; if ( ( z | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								B = r; break;

							} else o = o + 8 | 0;

						}

					} else B = l; o = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 3 ) | 0, 0, ( e << 24 >> 24 ) - o << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 9: {

					o = a + 24 | 0; z = b[ o >> 0 ] | 0; if ( ( z << 24 >> 24 > e << 24 >> 24 ? e : z ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; r = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; t = Rj( r | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = k + t | 0; t = 0; while ( 1 ) {

							C = $( n[ m >> 2 ] ); k = + K( + C ) >= 1.0 ? ( + C > 0.0 ? ~ ~ + Y( + J( + C / 4294967296.0 ), 4294967295.0 ) >>> 0 : ~ ~ + W( ( + C - + ( ~ ~ + C >>> 0 ) ) / 4294967296.0 ) >>> 0 ) : 0; r = g + ( t << 3 ) | 0; f[ r >> 2 ] = ~ ~ + C >>> 0; f[ r + 4 >> 2 ] = k; t = t + 1 | 0; k = b[ o >> 0 ] | 0; if ( ( t | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								D = k; break;

							} else m = m + 4 | 0;

						}

					} else D = z; m = D << 24 >> 24; if ( D << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 3 ) | 0, 0, ( e << 24 >> 24 ) - m << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 10: {

					m = a + 24 | 0; t = b[ m >> 0 ] | 0; if ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; k = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; r = Rj( k | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = o + r | 0; r = 0; while ( 1 ) {

							E = + p[ l >> 3 ]; o = + K( E ) >= 1.0 ? ( E > 0.0 ? ~ ~ + Y( + J( E / 4294967296.0 ), 4294967295.0 ) >>> 0 : ~ ~ + W( ( E - + ( ~ ~ E >>> 0 ) ) / 4294967296.0 ) >>> 0 ) : 0; k = g + ( r << 3 ) | 0; f[ k >> 2 ] = ~ ~ E >>> 0; f[ k + 4 >> 2 ] = o; r = r + 1 | 0; o = b[ m >> 0 ] | 0; if ( ( r | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								F = o; break;

							} else l = l + 8 | 0;

						}

					} else F = t; l = F << 24 >> 24; if ( F << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 3 ) | 0, 0, ( e << 24 >> 24 ) - l << 3 | 0 ) | 0; i = 1; return i | 0;

				} case 11: {

					l = a + 24 | 0; r = b[ l >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; z = a + 40 | 0; o = gj( f[ z >> 2 ] | 0, f[ z + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; z = a + 48 | 0; k = Rj( o | 0, I | 0, f[ z >> 2 ] | 0, f[ z + 4 >> 2 ] | 0 ) | 0; z = m + k | 0; k = 0; while ( 1 ) {

							m = g + ( k << 3 ) | 0; f[ m >> 2 ] = h[ z >> 0 ]; f[ m + 4 >> 2 ] = 0; k = k + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( k | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								G = m; break;

							} else z = z + 1 | 0;

						}

					} else G = r; z = G << 24 >> 24; if ( G << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( z << 3 ) | 0, 0, ( e << 24 >> 24 ) - z << 3 | 0 ) | 0; i = 1; return i | 0;

				} default: {

					i = 0; return i | 0;

				}

			} while ( 0 );return 0;

		} function kb( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0; c = u; u = u + 32 | 0; d = c + 20 | 0; e = c + 16 | 0; g = c + 4 | 0; i = c; j = a + 32 | 0; if ( ! ( dg( d, f[ j >> 2 ] | 0 ) | 0 ) ) {

				k = 0; u = c; return k | 0;

			} if ( ! ( dg( e, f[ j >> 2 ] | 0 ) | 0 ) ) {

				k = 0; u = c; return k | 0;

			}l = f[ d >> 2 ] | 0; if ( l >>> 0 > 1431655765 ) {

				k = 0; u = c; return k | 0;

			}m = f[ e >> 2 ] | 0; n = gj( l | 0, 0, 3, 0 ) | 0; o = I; if ( o >>> 0 < 0 | ( o | 0 ) == 0 & n >>> 0 < m >>> 0 ) {

				k = 0; u = c; return k | 0;

			}n = f[ j >> 2 ] | 0; o = n + 8 | 0; p = f[ o + 4 >> 2 ] | 0; q = n + 16 | 0; r = q; s = f[ r >> 2 ] | 0; t = f[ r + 4 >> 2 ] | 0; if ( ! ( ( p | 0 ) > ( t | 0 ) | ( ( p | 0 ) == ( t | 0 ) ? ( f[ o >> 2 ] | 0 ) >>> 0 > s >>> 0 : 0 ) ) ) {

				k = 0; u = c; return k | 0;

			}o = b[ ( f[ n >> 2 ] | 0 ) + s >> 0 ] | 0; p = Rj( s | 0, t | 0, 1, 0 ) | 0; r = I; v = q; f[ v >> 2 ] = p; f[ v + 4 >> 2 ] = r; a:do if ( ! ( o << 24 >> 24 ) ) {

				if ( ! ( ed( a, l ) | 0 ) ) {

					k = 0; u = c; return k | 0;

				}

			} else {

				if ( m >>> 0 < 256 ) {

					if ( ! l ) break; v = a + 44 | 0; q = g + 4 | 0; w = g + 8 | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; x = n + 8 | 0; y = f[ x >> 2 ] | 0; z = f[ x + 4 >> 2 ] | 0; b:do if ( ( z | 0 ) > ( r | 0 ) | ( z | 0 ) == ( r | 0 ) & y >>> 0 > p >>> 0 ) {

						x = 0; A = n; B = l; C = p; D = r; E = z; F = y; while ( 1 ) {

							G = A + 16 | 0; H = f[ A >> 2 ] | 0; J = b[ H + C >> 0 ] | 0; K = Rj( C | 0, D | 0, 1, 0 ) | 0; L = I; M = G; f[ M >> 2 ] = K; f[ M + 4 >> 2 ] = L; f[ g >> 2 ] = J & 255; if ( ! ( ( E | 0 ) > ( L | 0 ) | ( E | 0 ) == ( L | 0 ) & F >>> 0 > K >>> 0 ) ) break b; L = b[ H + K >> 0 ] | 0; K = Rj( C | 0, D | 0, 2, 0 ) | 0; J = I; M = G; f[ M >> 2 ] = K; f[ M + 4 >> 2 ] = J; f[ q >> 2 ] = L & 255; if ( ! ( ( E | 0 ) > ( J | 0 ) | ( E | 0 ) == ( J | 0 ) & F >>> 0 > K >>> 0 ) ) break b; J = b[ H + K >> 0 ] | 0; K = Rj( C | 0, D | 0, 3, 0 ) | 0; H = G; f[ H >> 2 ] = K; f[ H + 4 >> 2 ] = I; f[ w >> 2 ] = J & 255; J = f[ v >> 2 ] | 0; H = J + 100 | 0; K = f[ H >> 2 ] | 0; if ( ( K | 0 ) == ( f[ J + 104 >> 2 ] | 0 ) ) {

								cf( J + 96 | 0, g ); N = f[ d >> 2 ] | 0;

							} else {

								f[ K >> 2 ] = f[ g >> 2 ]; f[ K + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ K + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ H >> 2 ] = ( f[ H >> 2 ] | 0 ) + 12; N = B;

							}x = x + 1 | 0; if ( x >>> 0 >= N >>> 0 ) break a; A = f[ j >> 2 ] | 0; H = A + 16 | 0; C = f[ H >> 2 ] | 0; D = f[ H + 4 >> 2 ] | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; H = A + 8 | 0; F = f[ H >> 2 ] | 0; E = f[ H + 4 >> 2 ] | 0; if ( ! ( ( E | 0 ) > ( D | 0 ) | ( E | 0 ) == ( D | 0 ) & F >>> 0 > C >>> 0 ) ) break; else B = N;

						}

					} while ( 0 );k = 0; u = c; return k | 0;

				} if ( m >>> 0 < 65536 ) {

					if ( ! l ) break; v = a + 44 | 0; w = g + 4 | 0; q = g + 8 | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; y = n + 8 | 0; z = f[ y >> 2 ] | 0; B = f[ y + 4 >> 2 ] | 0; y = Rj( s | 0, t | 0, 3, 0 ) | 0; C = I; c:do if ( ! ( ( B | 0 ) < ( C | 0 ) | ( B | 0 ) == ( C | 0 ) & z >>> 0 < y >>> 0 ) ) {

						F = 0; D = n; E = p; A = y; x = C; H = r; K = B; J = z; G = l; while ( 1 ) {

							L = D + 16 | 0; M = f[ D >> 2 ] | 0; O = M + E | 0; P = h[ O >> 0 ] | h[ O + 1 >> 0 ] << 8; O = L; f[ O >> 2 ] = A; f[ O + 4 >> 2 ] = x; f[ g >> 2 ] = P & 65535; P = Rj( E | 0, H | 0, 4, 0 ) | 0; O = I; if ( ( K | 0 ) < ( O | 0 ) | ( K | 0 ) == ( O | 0 ) & J >>> 0 < P >>> 0 ) break c; Q = M + A | 0; R = h[ Q >> 0 ] | h[ Q + 1 >> 0 ] << 8; Q = L; f[ Q >> 2 ] = P; f[ Q + 4 >> 2 ] = O; f[ w >> 2 ] = R & 65535; R = Rj( E | 0, H | 0, 6, 0 ) | 0; O = I; if ( ( K | 0 ) < ( O | 0 ) | ( K | 0 ) == ( O | 0 ) & J >>> 0 < R >>> 0 ) break c; Q = M + P | 0; P = h[ Q >> 0 ] | h[ Q + 1 >> 0 ] << 8; Q = L; f[ Q >> 2 ] = R; f[ Q + 4 >> 2 ] = O; f[ q >> 2 ] = P & 65535; P = f[ v >> 2 ] | 0; O = P + 100 | 0; Q = f[ O >> 2 ] | 0; if ( ( Q | 0 ) == ( f[ P + 104 >> 2 ] | 0 ) ) {

								cf( P + 96 | 0, g ); S = f[ d >> 2 ] | 0;

							} else {

								f[ Q >> 2 ] = f[ g >> 2 ]; f[ Q + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ Q + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ O >> 2 ] = ( f[ O >> 2 ] | 0 ) + 12; S = G;

							}F = F + 1 | 0; if ( F >>> 0 >= S >>> 0 ) break a; D = f[ j >> 2 ] | 0; O = D + 16 | 0; E = f[ O >> 2 ] | 0; H = f[ O + 4 >> 2 ] | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; O = D + 8 | 0; J = f[ O >> 2 ] | 0; K = f[ O + 4 >> 2 ] | 0; A = Rj( E | 0, H | 0, 2, 0 ) | 0; x = I; if ( ( K | 0 ) < ( x | 0 ) | ( K | 0 ) == ( x | 0 ) & J >>> 0 < A >>> 0 ) break; else G = S;

						}

					} while ( 0 );k = 0; u = c; return k | 0;

				}v = a + 44 | 0; if ( ( f[ ( f[ v >> 2 ] | 0 ) + 80 >> 2 ] | 0 ) >>> 0 < 2097152 ? ( ( ( h[ a + 36 >> 0 ] | 0 ) << 8 | ( h[ a + 37 >> 0 ] | 0 ) ) & 65535 ) > 513 : 0 ) {

					if ( ! l ) break; q = g + 4 | 0; w = g + 8 | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; d:do if ( dg( i, n ) | 0 ) {

						z = 0; do {

							f[ g >> 2 ] = f[ i >> 2 ]; if ( ! ( dg( i, f[ j >> 2 ] | 0 ) | 0 ) ) break d; f[ q >> 2 ] = f[ i >> 2 ]; if ( ! ( dg( i, f[ j >> 2 ] | 0 ) | 0 ) ) break d; f[ w >> 2 ] = f[ i >> 2 ]; B = f[ v >> 2 ] | 0; C = B + 100 | 0; y = f[ C >> 2 ] | 0; if ( ( y | 0 ) == ( f[ B + 104 >> 2 ] | 0 ) )cf( B + 96 | 0, g ); else {

								f[ y >> 2 ] = f[ g >> 2 ]; f[ y + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ y + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ C >> 2 ] = ( f[ C >> 2 ] | 0 ) + 12;

							}z = z + 1 | 0; if ( z >>> 0 >= ( f[ d >> 2 ] | 0 ) >>> 0 ) break a; C = f[ j >> 2 ] | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0;

						} while ( dg( i, C ) | 0 );

					} while ( 0 );k = 0; u = c; return k | 0;

				} if ( l | 0 ) {

					w = g + 4 | 0; q = g + 8 | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; z = n + 8 | 0; C = f[ z >> 2 ] | 0; y = f[ z + 4 >> 2 ] | 0; z = Rj( s | 0, t | 0, 5, 0 ) | 0; B = I; e:do if ( ! ( ( y | 0 ) < ( B | 0 ) | ( y | 0 ) == ( B | 0 ) & C >>> 0 < z >>> 0 ) ) {

						G = 0; A = n; J = p; x = z; K = B; H = r; E = y; D = C; F = l; while ( 1 ) {

							O = A + 16 | 0; Q = f[ A >> 2 ] | 0; P = Q + J | 0; R = h[ P >> 0 ] | h[ P + 1 >> 0 ] << 8 | h[ P + 2 >> 0 ] << 16 | h[ P + 3 >> 0 ] << 24; P = O; f[ P >> 2 ] = x; f[ P + 4 >> 2 ] = K; f[ g >> 2 ] = R; R = Rj( J | 0, H | 0, 8, 0 ) | 0; P = I; if ( ( E | 0 ) < ( P | 0 ) | ( E | 0 ) == ( P | 0 ) & D >>> 0 < R >>> 0 ) break e; L = Q + x | 0; M = h[ L >> 0 ] | h[ L + 1 >> 0 ] << 8 | h[ L + 2 >> 0 ] << 16 | h[ L + 3 >> 0 ] << 24; L = O; f[ L >> 2 ] = R; f[ L + 4 >> 2 ] = P; f[ w >> 2 ] = M; M = Rj( J | 0, H | 0, 12, 0 ) | 0; P = I; if ( ( E | 0 ) < ( P | 0 ) | ( E | 0 ) == ( P | 0 ) & D >>> 0 < M >>> 0 ) break e; L = Q + R | 0; R = h[ L >> 0 ] | h[ L + 1 >> 0 ] << 8 | h[ L + 2 >> 0 ] << 16 | h[ L + 3 >> 0 ] << 24; L = O; f[ L >> 2 ] = M; f[ L + 4 >> 2 ] = P; f[ q >> 2 ] = R; R = f[ v >> 2 ] | 0; P = R + 100 | 0; L = f[ P >> 2 ] | 0; if ( ( L | 0 ) == ( f[ R + 104 >> 2 ] | 0 ) ) {

								cf( R + 96 | 0, g ); T = f[ d >> 2 ] | 0;

							} else {

								f[ L >> 2 ] = f[ g >> 2 ]; f[ L + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ L + 8 >> 2 ] = f[ g + 8 >> 2 ]; f[ P >> 2 ] = ( f[ P >> 2 ] | 0 ) + 12; T = F;

							}G = G + 1 | 0; if ( G >>> 0 >= T >>> 0 ) break a; A = f[ j >> 2 ] | 0; P = A + 16 | 0; J = f[ P >> 2 ] | 0; H = f[ P + 4 >> 2 ] | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; P = A + 8 | 0; D = f[ P >> 2 ] | 0; E = f[ P + 4 >> 2 ] | 0; x = Rj( J | 0, H | 0, 4, 0 ) | 0; K = I; if ( ( E | 0 ) < ( K | 0 ) | ( E | 0 ) == ( K | 0 ) & D >>> 0 < x >>> 0 ) break; else F = T;

						}

					} while ( 0 );k = 0; u = c; return k | 0;

				}

			} while ( 0 );f[ ( f[ a + 4 >> 2 ] | 0 ) + 80 >> 2 ] = f[ e >> 2 ]; k = 1; u = c; return k | 0;

		} function lb( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0; c = u; u = u + 16 | 0; d = c + 8 | 0; e = c; if ( ( f[ a + 96 >> 2 ] | 0 ) == ( f[ a + 92 >> 2 ] | 0 ) ) {

				u = c; return;

			}g = a + 56 | 0; h = f[ g >> 2 ] | 0; if ( ( h | 0 ) == ( f[ a + 60 >> 2 ] | 0 ) ) {

				xf( a + 52 | 0, b ); i = b;

			} else {

				f[ h >> 2 ] = f[ b >> 2 ]; f[ g >> 2 ] = h + 4; i = b;

			}b = a + 88 | 0; f[ b >> 2 ] = 0; h = f[ a >> 2 ] | 0; g = f[ i >> 2 ] | 0; j = g + 1 | 0; if ( ( g | 0 ) != - 1 ) {

				k = ( ( j >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : j; if ( ( k | 0 ) == - 1 )l = - 1; else l = f[ ( f[ h >> 2 ] | 0 ) + ( k << 2 ) >> 2 ] | 0; k = ( ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + g | 0; if ( ( k | 0 ) == - 1 ) {

					m = l; n = - 1;

				} else {

					m = l; n = f[ ( f[ h >> 2 ] | 0 ) + ( k << 2 ) >> 2 ] | 0;

				}

			} else {

				m = - 1; n = - 1;

			}k = a + 24 | 0; h = f[ k >> 2 ] | 0; l = h + ( m >>> 5 << 2 ) | 0; g = 1 << ( m & 31 ); j = f[ l >> 2 ] | 0; if ( ! ( j & g ) ) {

				f[ l >> 2 ] = j | g; g = f[ i >> 2 ] | 0; j = g + 1 | 0; if ( ( g | 0 ) == - 1 )o = - 1; else o = ( ( j >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : j; f[ e >> 2 ] = o; j = f[ ( f[ ( f[ a + 44 >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( o >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( o >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; o = f[ a + 48 >> 2 ] | 0; f[ d >> 2 ] = j; g = f[ o + 4 >> 2 ] | 0; o = g + 4 | 0; l = f[ o >> 2 ] | 0; if ( ( l | 0 ) == ( f[ g + 8 >> 2 ] | 0 ) )xf( g, d ); else {

					f[ l >> 2 ] = j; f[ o >> 2 ] = l + 4;

				}l = a + 40 | 0; o = f[ l >> 2 ] | 0; j = o + 4 | 0; g = f[ j >> 2 ] | 0; if ( ( g | 0 ) == ( f[ o + 8 >> 2 ] | 0 ) ) {

					xf( o, e ); p = f[ l >> 2 ] | 0;

				} else {

					f[ g >> 2 ] = f[ e >> 2 ]; f[ j >> 2 ] = g + 4; p = o;

				}o = p + 24 | 0; f[ ( f[ p + 12 >> 2 ] | 0 ) + ( m << 2 ) >> 2 ] = f[ o >> 2 ]; f[ o >> 2 ] = ( f[ o >> 2 ] | 0 ) + 1; q = f[ k >> 2 ] | 0;

			} else q = h; h = q + ( n >>> 5 << 2 ) | 0; q = 1 << ( n & 31 ); o = f[ h >> 2 ] | 0; if ( ! ( o & q ) ) {

				f[ h >> 2 ] = o | q; q = f[ i >> 2 ] | 0; do if ( ( q | 0 ) != - 1 ) if ( ! ( ( q >>> 0 ) % 3 | 0 ) ) {

					r = q + 2 | 0; break;

				} else {

					r = q + - 1 | 0; break;

				} else r = - 1; while ( 0 );f[ e >> 2 ] = r; q = f[ ( f[ ( f[ a + 44 >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( r >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( r >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; r = f[ a + 48 >> 2 ] | 0; f[ d >> 2 ] = q; o = f[ r + 4 >> 2 ] | 0; r = o + 4 | 0; h = f[ r >> 2 ] | 0; if ( ( h | 0 ) == ( f[ o + 8 >> 2 ] | 0 ) )xf( o, d ); else {

					f[ h >> 2 ] = q; f[ r >> 2 ] = h + 4;

				}h = a + 40 | 0; r = f[ h >> 2 ] | 0; q = r + 4 | 0; o = f[ q >> 2 ] | 0; if ( ( o | 0 ) == ( f[ r + 8 >> 2 ] | 0 ) ) {

					xf( r, e ); s = f[ h >> 2 ] | 0;

				} else {

					f[ o >> 2 ] = f[ e >> 2 ]; f[ q >> 2 ] = o + 4; s = r;

				}r = s + 24 | 0; f[ ( f[ s + 12 >> 2 ] | 0 ) + ( n << 2 ) >> 2 ] = f[ r >> 2 ]; f[ r >> 2 ] = ( f[ r >> 2 ] | 0 ) + 1;

			}r = f[ i >> 2 ] | 0; if ( ( r | 0 ) == - 1 )t = - 1; else t = f[ ( f[ f[ a >> 2 ] >> 2 ] | 0 ) + ( r << 2 ) >> 2 ] | 0; r = ( f[ k >> 2 ] | 0 ) + ( t >>> 5 << 2 ) | 0; n = 1 << ( t & 31 ); s = f[ r >> 2 ] | 0; if ( ! ( n & s ) ) {

				f[ r >> 2 ] = s | n; n = f[ i >> 2 ] | 0; f[ e >> 2 ] = n; s = f[ ( f[ ( f[ a + 44 >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( n >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( n >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; n = f[ a + 48 >> 2 ] | 0; f[ d >> 2 ] = s; r = f[ n + 4 >> 2 ] | 0; n = r + 4 | 0; o = f[ n >> 2 ] | 0; if ( ( o | 0 ) == ( f[ r + 8 >> 2 ] | 0 ) )xf( r, d ); else {

					f[ o >> 2 ] = s; f[ n >> 2 ] = o + 4;

				}o = a + 40 | 0; n = f[ o >> 2 ] | 0; s = n + 4 | 0; r = f[ s >> 2 ] | 0; if ( ( r | 0 ) == ( f[ n + 8 >> 2 ] | 0 ) ) {

					xf( n, e ); v = f[ o >> 2 ] | 0;

				} else {

					f[ r >> 2 ] = f[ e >> 2 ]; f[ s >> 2 ] = r + 4; v = n;

				}n = v + 24 | 0; f[ ( f[ v + 12 >> 2 ] | 0 ) + ( t << 2 ) >> 2 ] = f[ n >> 2 ]; f[ n >> 2 ] = ( f[ n >> 2 ] | 0 ) + 1;

			}n = f[ b >> 2 ] | 0; a:do if ( ( n | 0 ) < 3 ) {

				t = a + 12 | 0; v = a + 44 | 0; r = a + 48 | 0; s = a + 40 | 0; o = a + 92 | 0; q = n; while ( 1 ) {

					h = q; while ( 1 ) {

						w = a + 52 + ( h * 12 | 0 ) + 4 | 0; x = f[ w >> 2 ] | 0; if ( ( f[ a + 52 + ( h * 12 | 0 ) >> 2 ] | 0 ) != ( x | 0 ) ) break; if ( ( h | 0 ) < 2 )h = h + 1 | 0; else break a;

					}m = x + - 4 | 0; p = f[ m >> 2 ] | 0; f[ w >> 2 ] = m; f[ b >> 2 ] = h; f[ i >> 2 ] = p; if ( ( p | 0 ) == - 1 ) break; m = ( p >>> 0 ) / 3 | 0; g = f[ t >> 2 ] | 0; do if ( ! ( f[ g + ( m >>> 5 << 2 ) >> 2 ] & 1 << ( m & 31 ) ) ) {

						j = p; l = g; b:while ( 1 ) {

							y = ( j >>> 0 ) / 3 | 0; z = l + ( y >>> 5 << 2 ) | 0; f[ z >> 2 ] = 1 << ( y & 31 ) | f[ z >> 2 ]; z = f[ i >> 2 ] | 0; if ( ( z | 0 ) == - 1 )A = - 1; else A = f[ ( f[ f[ a >> 2 ] >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0; y = ( f[ k >> 2 ] | 0 ) + ( A >>> 5 << 2 ) | 0; B = 1 << ( A & 31 ); C = f[ y >> 2 ] | 0; if ( ! ( B & C ) ) {

								f[ y >> 2 ] = C | B; B = f[ i >> 2 ] | 0; f[ e >> 2 ] = B; C = f[ ( f[ ( f[ v >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( B >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( B >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; B = f[ r >> 2 ] | 0; f[ d >> 2 ] = C; y = f[ B + 4 >> 2 ] | 0; B = y + 4 | 0; D = f[ B >> 2 ] | 0; if ( ( D | 0 ) == ( f[ y + 8 >> 2 ] | 0 ) )xf( y, d ); else {

									f[ D >> 2 ] = C; f[ B >> 2 ] = D + 4;

								}D = f[ s >> 2 ] | 0; B = D + 4 | 0; C = f[ B >> 2 ] | 0; if ( ( C | 0 ) == ( f[ D + 8 >> 2 ] | 0 ) ) {

									xf( D, e ); E = f[ s >> 2 ] | 0;

								} else {

									f[ C >> 2 ] = f[ e >> 2 ]; f[ B >> 2 ] = C + 4; E = D;

								}D = E + 24 | 0; f[ ( f[ E + 12 >> 2 ] | 0 ) + ( A << 2 ) >> 2 ] = f[ D >> 2 ]; f[ D >> 2 ] = ( f[ D >> 2 ] | 0 ) + 1; F = f[ i >> 2 ] | 0;

							} else F = z; z = f[ a >> 2 ] | 0; if ( ( F | 0 ) == - 1 ) {

								G = 93; break;

							}D = F + 1 | 0; C = ( ( D >>> 0 ) % 3 | 0 | 0 ) == 0 ? F + - 2 | 0 : D; if ( ( C | 0 ) == - 1 )H = - 1; else H = f[ ( f[ z + 12 >> 2 ] | 0 ) + ( C << 2 ) >> 2 ] | 0; C = ( ( ( F >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + F | 0; if ( ( C | 0 ) == - 1 )I = - 1; else I = f[ ( f[ z + 12 >> 2 ] | 0 ) + ( C << 2 ) >> 2 ] | 0; C = ( H | 0 ) == - 1; D = C ? - 1 : ( H >>> 0 ) / 3 | 0; B = ( I | 0 ) == - 1; y = B ? - 1 : ( I >>> 0 ) / 3 | 0; if ( C )J = 1; else J = ( f[ ( f[ t >> 2 ] | 0 ) + ( D >>> 5 << 2 ) >> 2 ] & 1 << ( D & 31 ) | 0 ) != 0; do if ( B ) if ( J ) {

								G = 93; break b;

							} else G = 82; else {

								if ( f[ ( f[ t >> 2 ] | 0 ) + ( y >>> 5 << 2 ) >> 2 ] & 1 << ( y & 31 ) | 0 ) if ( J ) {

									G = 93; break b;

								} else {

									G = 82; break;

								}D = f[ ( f[ z >> 2 ] | 0 ) + ( I << 2 ) >> 2 ] | 0; if ( ! ( 1 << ( D & 31 ) & f[ ( f[ k >> 2 ] | 0 ) + ( D >>> 5 << 2 ) >> 2 ] ) ) {

									K = ( f[ o >> 2 ] | 0 ) + ( D << 2 ) | 0; D = f[ K >> 2 ] | 0; f[ K >> 2 ] = D + 1; L = ( D | 0 ) > 0 ? 1 : 2;

								} else L = 0; if ( J ? ( L | 0 ) <= ( f[ b >> 2 ] | 0 ) : 0 ) {

									M = I; break;

								}f[ d >> 2 ] = I; D = a + 52 + ( L * 12 | 0 ) + 4 | 0; K = f[ D >> 2 ] | 0; if ( ( K | 0 ) == ( f[ a + 52 + ( L * 12 | 0 ) + 8 >> 2 ] | 0 ) )xf( a + 52 + ( L * 12 | 0 ) | 0, d ); else {

									f[ K >> 2 ] = I; f[ D >> 2 ] = K + 4;

								} if ( ( f[ b >> 2 ] | 0 ) > ( L | 0 ) )f[ b >> 2 ] = L; if ( J ) {

									G = 93; break b;

								} else G = 82;

							} while ( 0 );if ( ( G | 0 ) == 82 ) {

								G = 0; if ( C )N = - 1; else N = f[ ( f[ f[ a >> 2 ] >> 2 ] | 0 ) + ( H << 2 ) >> 2 ] | 0; if ( ! ( 1 << ( N & 31 ) & f[ ( f[ k >> 2 ] | 0 ) + ( N >>> 5 << 2 ) >> 2 ] ) ) {

									z = ( f[ o >> 2 ] | 0 ) + ( N << 2 ) | 0; y = f[ z >> 2 ] | 0; f[ z >> 2 ] = y + 1; O = ( y | 0 ) > 0 ? 1 : 2;

								} else O = 0; if ( ( O | 0 ) > ( f[ b >> 2 ] | 0 ) ) break; else M = H;

							}f[ i >> 2 ] = M; j = M; l = f[ t >> 2 ] | 0;

						} if ( ( G | 0 ) == 93 ) {

							G = 0; P = f[ b >> 2 ] | 0; break;

						}f[ d >> 2 ] = H; l = a + 52 + ( O * 12 | 0 ) + 4 | 0; j = f[ l >> 2 ] | 0; if ( ( j | 0 ) == ( f[ a + 52 + ( O * 12 | 0 ) + 8 >> 2 ] | 0 ) )xf( a + 52 + ( O * 12 | 0 ) | 0, d ); else {

							f[ j >> 2 ] = H; f[ l >> 2 ] = j + 4;

						}j = f[ b >> 2 ] | 0; if ( ( j | 0 ) > ( O | 0 ) ) {

							f[ b >> 2 ] = O; Q = O;

						} else Q = j; P = Q;

					} else P = h; while ( 0 );if ( ( P | 0 ) < 3 )q = P; else break a;

				}u = c; return;

			} while ( 0 );f[ i >> 2 ] = - 1; u = c; return;

		} function mb( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; if ( ! g ) {

				i = 0; return i | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					j = a + 24 | 0; k = b[ j >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; o = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; q = Rj( o | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = l + q | 0; q = 0; while ( 1 ) {

							d[ g + ( q << 1 ) >> 1 ] = b[ m >> 0 ] | 0; q = q + 1 | 0; l = b[ j >> 0 ] | 0; if ( ( q | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								r = l; break;

							} else m = m + 1 | 0;

						}

					} else r = k; m = r << 24 >> 24; if ( r << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 1 ) | 0, 0, ( e << 24 >> 24 ) - m << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 2: {

					m = a + 24 | 0; q = b[ m >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						j = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; o = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; s = Rj( o | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = j + s | 0; s = 0; while ( 1 ) {

							d[ g + ( s << 1 ) >> 1 ] = h[ l >> 0 ] | 0; s = s + 1 | 0; j = b[ m >> 0 ] | 0; if ( ( s | 0 ) >= ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 | 0 ) ) {

								t = j; break;

							} else l = l + 1 | 0;

						}

					} else t = q; l = t << 24 >> 24; if ( t << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 1 ) | 0, 0, ( e << 24 >> 24 ) - l << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 3: {

					l = a + 24 | 0; s = b[ l >> 0 ] | 0; if ( ( s << 24 >> 24 > e << 24 >> 24 ? e : s ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; j = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; o = Rj( j | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = m + o | 0; o = 0; while ( 1 ) {

							d[ g + ( o << 1 ) >> 1 ] = d[ k >> 1 ] | 0; o = o + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( o | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								u = m; break;

							} else k = k + 2 | 0;

						}

					} else u = s; k = u << 24 >> 24; if ( u << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 1 ) | 0, 0, ( e << 24 >> 24 ) - k << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 4: {

					k = a + 24 | 0; o = b[ k >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; q = a + 40 | 0; m = gj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; q = a + 48 | 0; j = Rj( m | 0, I | 0, f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0 ) | 0; q = l + j | 0; j = 0; while ( 1 ) {

							d[ g + ( j << 1 ) >> 1 ] = d[ q >> 1 ] | 0; j = j + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( j | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								v = l; break;

							} else q = q + 2 | 0;

						}

					} else v = o; q = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( q << 1 ) | 0, 0, ( e << 24 >> 24 ) - q << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 5: {

					q = a + 24 | 0; j = b[ q >> 0 ] | 0; if ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; s = a + 40 | 0; l = gj( f[ s >> 2 ] | 0, f[ s + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; s = a + 48 | 0; m = Rj( l | 0, I | 0, f[ s >> 2 ] | 0, f[ s + 4 >> 2 ] | 0 ) | 0; s = k + m | 0; m = 0; while ( 1 ) {

							d[ g + ( m << 1 ) >> 1 ] = f[ s >> 2 ]; m = m + 1 | 0; k = b[ q >> 0 ] | 0; if ( ( m | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								w = k; break;

							} else s = s + 4 | 0;

						}

					} else w = j; s = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( s << 1 ) | 0, 0, ( e << 24 >> 24 ) - s << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 6: {

					s = a + 24 | 0; m = b[ s >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						q = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; k = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; l = Rj( k | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = q + l | 0; l = 0; while ( 1 ) {

							d[ g + ( l << 1 ) >> 1 ] = f[ o >> 2 ]; l = l + 1 | 0; q = b[ s >> 0 ] | 0; if ( ( l | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								x = q; break;

							} else o = o + 4 | 0;

						}

					} else x = m; o = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 1 ) | 0, 0, ( e << 24 >> 24 ) - o << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 7: {

					o = a + 24 | 0; l = b[ o >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						s = f[ f[ a >> 2 ] >> 2 ] | 0; j = a + 40 | 0; q = gj( f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; j = a + 48 | 0; k = Rj( q | 0, I | 0, f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0 ) | 0; j = s + k | 0; k = 0; while ( 1 ) {

							d[ g + ( k << 1 ) >> 1 ] = f[ j >> 2 ]; k = k + 1 | 0; s = b[ o >> 0 ] | 0; if ( ( k | 0 ) >= ( ( s << 24 >> 24 > e << 24 >> 24 ? e : s ) << 24 >> 24 | 0 ) ) {

								y = s; break;

							} else j = j + 8 | 0;

						}

					} else y = l; j = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( j << 1 ) | 0, 0, ( e << 24 >> 24 ) - j << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 8: {

					j = a + 24 | 0; k = b[ j >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; s = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; q = Rj( s | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = o + q | 0; q = 0; while ( 1 ) {

							d[ g + ( q << 1 ) >> 1 ] = f[ m >> 2 ]; q = q + 1 | 0; o = b[ j >> 0 ] | 0; if ( ( q | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								z = o; break;

							} else m = m + 8 | 0;

						}

					} else z = k; m = z << 24 >> 24; if ( z << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 1 ) | 0, 0, ( e << 24 >> 24 ) - m << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 9: {

					m = a + 24 | 0; q = b[ m >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						j = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; o = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; s = Rj( o | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = j + s | 0; s = 0; while ( 1 ) {

							j = ~ ~ $( n[ l >> 2 ] ) & 65535; d[ g + ( s << 1 ) >> 1 ] = j; s = s + 1 | 0; j = b[ m >> 0 ] | 0; if ( ( s | 0 ) >= ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 | 0 ) ) {

								A = j; break;

							} else l = l + 4 | 0;

						}

					} else A = q; l = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 1 ) | 0, 0, ( e << 24 >> 24 ) - l << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 10: {

					l = a + 24 | 0; s = b[ l >> 0 ] | 0; if ( ( s << 24 >> 24 > e << 24 >> 24 ? e : s ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; j = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; o = Rj( j | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = m + o | 0; o = 0; while ( 1 ) {

							d[ g + ( o << 1 ) >> 1 ] = ~ ~ + p[ k >> 3 ]; o = o + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( o | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								B = m; break;

							} else k = k + 8 | 0;

						}

					} else B = s; k = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 1 ) | 0, 0, ( e << 24 >> 24 ) - k << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 11: {

					k = a + 24 | 0; o = b[ k >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; q = a + 40 | 0; m = gj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; q = a + 48 | 0; j = Rj( m | 0, I | 0, f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0 ) | 0; q = l + j | 0; j = 0; while ( 1 ) {

							d[ g + ( j << 1 ) >> 1 ] = h[ q >> 0 ] | 0; j = j + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( j | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								C = l; break;

							} else q = q + 1 | 0;

						}

					} else C = o; q = C << 24 >> 24; if ( C << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( q << 1 ) | 0, 0, ( e << 24 >> 24 ) - q << 1 | 0 ) | 0; i = 1; return i | 0;

				} default: {

					i = 0; return i | 0;

				}

			} while ( 0 );return 0;

		} function nb( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0; if ( ! g ) {

				i = 0; return i | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					j = a + 24 | 0; k = b[ j >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; o = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; q = Rj( o | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = l + q | 0; q = 0; while ( 1 ) {

							d[ g + ( q << 1 ) >> 1 ] = b[ m >> 0 ] | 0; q = q + 1 | 0; l = b[ j >> 0 ] | 0; if ( ( q | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								r = l; break;

							} else m = m + 1 | 0;

						}

					} else r = k; m = r << 24 >> 24; if ( r << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 1 ) | 0, 0, ( e << 24 >> 24 ) - m << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 2: {

					m = a + 24 | 0; q = b[ m >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						j = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; o = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; s = Rj( o | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = j + s | 0; s = 0; while ( 1 ) {

							d[ g + ( s << 1 ) >> 1 ] = h[ l >> 0 ] | 0; s = s + 1 | 0; j = b[ m >> 0 ] | 0; if ( ( s | 0 ) >= ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 | 0 ) ) {

								t = j; break;

							} else l = l + 1 | 0;

						}

					} else t = q; l = t << 24 >> 24; if ( t << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 1 ) | 0, 0, ( e << 24 >> 24 ) - l << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 3: {

					l = a + 24 | 0; s = b[ l >> 0 ] | 0; if ( ( s << 24 >> 24 > e << 24 >> 24 ? e : s ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; j = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; o = Rj( j | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = m + o | 0; o = 0; while ( 1 ) {

							d[ g + ( o << 1 ) >> 1 ] = d[ k >> 1 ] | 0; o = o + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( o | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								u = m; break;

							} else k = k + 2 | 0;

						}

					} else u = s; k = u << 24 >> 24; if ( u << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 1 ) | 0, 0, ( e << 24 >> 24 ) - k << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 4: {

					k = a + 24 | 0; o = b[ k >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; q = a + 40 | 0; m = gj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; q = a + 48 | 0; j = Rj( m | 0, I | 0, f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0 ) | 0; q = l + j | 0; j = 0; while ( 1 ) {

							d[ g + ( j << 1 ) >> 1 ] = d[ q >> 1 ] | 0; j = j + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( j | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								v = l; break;

							} else q = q + 2 | 0;

						}

					} else v = o; q = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( q << 1 ) | 0, 0, ( e << 24 >> 24 ) - q << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 5: {

					q = a + 24 | 0; j = b[ q >> 0 ] | 0; if ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; s = a + 40 | 0; l = gj( f[ s >> 2 ] | 0, f[ s + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; s = a + 48 | 0; m = Rj( l | 0, I | 0, f[ s >> 2 ] | 0, f[ s + 4 >> 2 ] | 0 ) | 0; s = k + m | 0; m = 0; while ( 1 ) {

							d[ g + ( m << 1 ) >> 1 ] = f[ s >> 2 ]; m = m + 1 | 0; k = b[ q >> 0 ] | 0; if ( ( m | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								w = k; break;

							} else s = s + 4 | 0;

						}

					} else w = j; s = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( s << 1 ) | 0, 0, ( e << 24 >> 24 ) - s << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 6: {

					s = a + 24 | 0; m = b[ s >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						q = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; k = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; l = Rj( k | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = q + l | 0; l = 0; while ( 1 ) {

							d[ g + ( l << 1 ) >> 1 ] = f[ o >> 2 ]; l = l + 1 | 0; q = b[ s >> 0 ] | 0; if ( ( l | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								x = q; break;

							} else o = o + 4 | 0;

						}

					} else x = m; o = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 1 ) | 0, 0, ( e << 24 >> 24 ) - o << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 7: {

					o = a + 24 | 0; l = b[ o >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						s = f[ f[ a >> 2 ] >> 2 ] | 0; j = a + 40 | 0; q = gj( f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; j = a + 48 | 0; k = Rj( q | 0, I | 0, f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0 ) | 0; j = s + k | 0; k = 0; while ( 1 ) {

							d[ g + ( k << 1 ) >> 1 ] = f[ j >> 2 ]; k = k + 1 | 0; s = b[ o >> 0 ] | 0; if ( ( k | 0 ) >= ( ( s << 24 >> 24 > e << 24 >> 24 ? e : s ) << 24 >> 24 | 0 ) ) {

								y = s; break;

							} else j = j + 8 | 0;

						}

					} else y = l; j = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( j << 1 ) | 0, 0, ( e << 24 >> 24 ) - j << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 8: {

					j = a + 24 | 0; k = b[ j >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; s = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; q = Rj( s | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = o + q | 0; q = 0; while ( 1 ) {

							d[ g + ( q << 1 ) >> 1 ] = f[ m >> 2 ]; q = q + 1 | 0; o = b[ j >> 0 ] | 0; if ( ( q | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								z = o; break;

							} else m = m + 8 | 0;

						}

					} else z = k; m = z << 24 >> 24; if ( z << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 1 ) | 0, 0, ( e << 24 >> 24 ) - m << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 9: {

					m = a + 24 | 0; q = b[ m >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						j = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; o = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; s = Rj( o | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = j + s | 0; s = 0; while ( 1 ) {

							j = ~ ~ $( n[ l >> 2 ] ); d[ g + ( s << 1 ) >> 1 ] = j; s = s + 1 | 0; j = b[ m >> 0 ] | 0; if ( ( s | 0 ) >= ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 | 0 ) ) {

								A = j; break;

							} else l = l + 4 | 0;

						}

					} else A = q; l = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 1 ) | 0, 0, ( e << 24 >> 24 ) - l << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 10: {

					l = a + 24 | 0; s = b[ l >> 0 ] | 0; if ( ( s << 24 >> 24 > e << 24 >> 24 ? e : s ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; j = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; o = Rj( j | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = m + o | 0; o = 0; while ( 1 ) {

							d[ g + ( o << 1 ) >> 1 ] = ~ ~ + p[ k >> 3 ]; o = o + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( o | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								B = m; break;

							} else k = k + 8 | 0;

						}

					} else B = s; k = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 1 ) | 0, 0, ( e << 24 >> 24 ) - k << 1 | 0 ) | 0; i = 1; return i | 0;

				} case 11: {

					k = a + 24 | 0; o = b[ k >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; q = a + 40 | 0; m = gj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; q = a + 48 | 0; j = Rj( m | 0, I | 0, f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0 ) | 0; q = l + j | 0; j = 0; while ( 1 ) {

							d[ g + ( j << 1 ) >> 1 ] = h[ q >> 0 ] | 0; j = j + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( j | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								C = l; break;

							} else q = q + 1 | 0;

						}

					} else C = o; q = C << 24 >> 24; if ( C << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( q << 1 ) | 0, 0, ( e << 24 >> 24 ) - q << 1 | 0 ) | 0; i = 1; return i | 0;

				} default: {

					i = 0; return i | 0;

				}

			} while ( 0 );return 0;

		} function ob( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var i = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0; if ( ! g ) {

				i = 0; return i | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					k = a + 24 | 0; l = b[ k >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; q = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; r = Rj( q | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = m + r | 0; r = 0; while ( 1 ) {

							f[ g + ( r << 2 ) >> 2 ] = b[ o >> 0 ]; r = r + 1 | 0; m = b[ k >> 0 ] | 0; if ( ( r | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								s = m; break;

							} else o = o + 1 | 0;

						}

					} else s = l; o = s << 24 >> 24; if ( s << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 2 ) | 0, 0, ( e << 24 >> 24 ) - o << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 2: {

					o = a + 24 | 0; r = b[ o >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; q = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; t = Rj( q | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = k + t | 0; t = 0; while ( 1 ) {

							f[ g + ( t << 2 ) >> 2 ] = h[ m >> 0 ]; t = t + 1 | 0; k = b[ o >> 0 ] | 0; if ( ( t | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								u = k; break;

							} else m = m + 1 | 0;

						}

					} else u = r; m = u << 24 >> 24; if ( u << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 2 ) | 0, 0, ( e << 24 >> 24 ) - m << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 3: {

					m = a + 24 | 0; t = b[ m >> 0 ] | 0; if ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; k = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; q = Rj( k | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = o + q | 0; q = 0; while ( 1 ) {

							f[ g + ( q << 2 ) >> 2 ] = d[ l >> 1 ]; q = q + 1 | 0; o = b[ m >> 0 ] | 0; if ( ( q | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								v = o; break;

							} else l = l + 2 | 0;

						}

					} else v = t; l = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 2 ) | 0, 0, ( e << 24 >> 24 ) - l << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 4: {

					l = a + 24 | 0; q = b[ l >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; r = a + 40 | 0; o = gj( f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; r = a + 48 | 0; k = Rj( o | 0, I | 0, f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0 ) | 0; r = m + k | 0; k = 0; while ( 1 ) {

							f[ g + ( k << 2 ) >> 2 ] = j[ r >> 1 ]; k = k + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( k | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								w = m; break;

							} else r = r + 2 | 0;

						}

					} else w = q; r = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( r << 2 ) | 0, 0, ( e << 24 >> 24 ) - r << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 5: {

					r = a + 24 | 0; k = b[ r >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; t = a + 40 | 0; m = gj( f[ t >> 2 ] | 0, f[ t + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; t = a + 48 | 0; o = Rj( m | 0, I | 0, f[ t >> 2 ] | 0, f[ t + 4 >> 2 ] | 0 ) | 0; t = l + o | 0; o = 0; while ( 1 ) {

							f[ g + ( o << 2 ) >> 2 ] = f[ t >> 2 ]; o = o + 1 | 0; l = b[ r >> 0 ] | 0; if ( ( o | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								x = l; break;

							} else t = t + 4 | 0;

						}

					} else x = k; t = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( t << 2 ) | 0, 0, ( e << 24 >> 24 ) - t << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 6: {

					t = a + 24 | 0; o = b[ t >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						r = f[ f[ a >> 2 ] >> 2 ] | 0; q = a + 40 | 0; l = gj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; q = a + 48 | 0; m = Rj( l | 0, I | 0, f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0 ) | 0; q = r + m | 0; m = 0; while ( 1 ) {

							f[ g + ( m << 2 ) >> 2 ] = f[ q >> 2 ]; m = m + 1 | 0; r = b[ t >> 0 ] | 0; if ( ( m | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								y = r; break;

							} else q = q + 4 | 0;

						}

					} else y = o; q = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( q << 2 ) | 0, 0, ( e << 24 >> 24 ) - q << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 7: {

					q = a + 24 | 0; m = b[ q >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						t = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; r = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; l = Rj( r | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = t + l | 0; l = 0; while ( 1 ) {

							f[ g + ( l << 2 ) >> 2 ] = f[ k >> 2 ]; l = l + 1 | 0; t = b[ q >> 0 ] | 0; if ( ( l | 0 ) >= ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 | 0 ) ) {

								z = t; break;

							} else k = k + 8 | 0;

						}

					} else z = m; k = z << 24 >> 24; if ( z << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 2 ) | 0, 0, ( e << 24 >> 24 ) - k << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 8: {

					k = a + 24 | 0; l = b[ k >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						q = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; t = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; r = Rj( t | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = q + r | 0; r = 0; while ( 1 ) {

							f[ g + ( r << 2 ) >> 2 ] = f[ o >> 2 ]; r = r + 1 | 0; q = b[ k >> 0 ] | 0; if ( ( r | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								A = q; break;

							} else o = o + 8 | 0;

						}

					} else A = l; o = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 2 ) | 0, 0, ( e << 24 >> 24 ) - o << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 9: {

					o = a + 24 | 0; r = b[ o >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; q = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; t = Rj( q | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = k + t | 0; t = 0; while ( 1 ) {

							k = ~ ~ $( n[ m >> 2 ] ) >>> 0; f[ g + ( t << 2 ) >> 2 ] = k; t = t + 1 | 0; k = b[ o >> 0 ] | 0; if ( ( t | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								B = k; break;

							} else m = m + 4 | 0;

						}

					} else B = r; m = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 2 ) | 0, 0, ( e << 24 >> 24 ) - m << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 10: {

					m = a + 24 | 0; t = b[ m >> 0 ] | 0; if ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; k = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; q = Rj( k | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = o + q | 0; q = 0; while ( 1 ) {

							f[ g + ( q << 2 ) >> 2 ] = ~ ~ + p[ l >> 3 ] >>> 0; q = q + 1 | 0; o = b[ m >> 0 ] | 0; if ( ( q | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								C = o; break;

							} else l = l + 8 | 0;

						}

					} else C = t; l = C << 24 >> 24; if ( C << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 2 ) | 0, 0, ( e << 24 >> 24 ) - l << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 11: {

					l = a + 24 | 0; q = b[ l >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; r = a + 40 | 0; o = gj( f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; r = a + 48 | 0; k = Rj( o | 0, I | 0, f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0 ) | 0; r = m + k | 0; k = 0; while ( 1 ) {

							f[ g + ( k << 2 ) >> 2 ] = h[ r >> 0 ]; k = k + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( k | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								D = m; break;

							} else r = r + 1 | 0;

						}

					} else D = q; r = D << 24 >> 24; if ( D << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( r << 2 ) | 0, 0, ( e << 24 >> 24 ) - r << 2 | 0 ) | 0; i = 1; return i | 0;

				} default: {

					i = 0; return i | 0;

				}

			} while ( 0 );return 0;

		} function pb( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var i = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0; if ( ! g ) {

				i = 0; return i | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					k = a + 24 | 0; l = b[ k >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; q = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; r = Rj( q | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = m + r | 0; r = 0; while ( 1 ) {

							f[ g + ( r << 2 ) >> 2 ] = b[ o >> 0 ]; r = r + 1 | 0; m = b[ k >> 0 ] | 0; if ( ( r | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								s = m; break;

							} else o = o + 1 | 0;

						}

					} else s = l; o = s << 24 >> 24; if ( s << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 2 ) | 0, 0, ( e << 24 >> 24 ) - o << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 2: {

					o = a + 24 | 0; r = b[ o >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; q = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; t = Rj( q | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = k + t | 0; t = 0; while ( 1 ) {

							f[ g + ( t << 2 ) >> 2 ] = h[ m >> 0 ]; t = t + 1 | 0; k = b[ o >> 0 ] | 0; if ( ( t | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								u = k; break;

							} else m = m + 1 | 0;

						}

					} else u = r; m = u << 24 >> 24; if ( u << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 2 ) | 0, 0, ( e << 24 >> 24 ) - m << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 3: {

					m = a + 24 | 0; t = b[ m >> 0 ] | 0; if ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; k = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; q = Rj( k | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = o + q | 0; q = 0; while ( 1 ) {

							f[ g + ( q << 2 ) >> 2 ] = d[ l >> 1 ]; q = q + 1 | 0; o = b[ m >> 0 ] | 0; if ( ( q | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								v = o; break;

							} else l = l + 2 | 0;

						}

					} else v = t; l = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 2 ) | 0, 0, ( e << 24 >> 24 ) - l << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 4: {

					l = a + 24 | 0; q = b[ l >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; r = a + 40 | 0; o = gj( f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; r = a + 48 | 0; k = Rj( o | 0, I | 0, f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0 ) | 0; r = m + k | 0; k = 0; while ( 1 ) {

							f[ g + ( k << 2 ) >> 2 ] = j[ r >> 1 ]; k = k + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( k | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								w = m; break;

							} else r = r + 2 | 0;

						}

					} else w = q; r = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( r << 2 ) | 0, 0, ( e << 24 >> 24 ) - r << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 5: {

					r = a + 24 | 0; k = b[ r >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; t = a + 40 | 0; m = gj( f[ t >> 2 ] | 0, f[ t + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; t = a + 48 | 0; o = Rj( m | 0, I | 0, f[ t >> 2 ] | 0, f[ t + 4 >> 2 ] | 0 ) | 0; t = l + o | 0; o = 0; while ( 1 ) {

							f[ g + ( o << 2 ) >> 2 ] = f[ t >> 2 ]; o = o + 1 | 0; l = b[ r >> 0 ] | 0; if ( ( o | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								x = l; break;

							} else t = t + 4 | 0;

						}

					} else x = k; t = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( t << 2 ) | 0, 0, ( e << 24 >> 24 ) - t << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 6: {

					t = a + 24 | 0; o = b[ t >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						r = f[ f[ a >> 2 ] >> 2 ] | 0; q = a + 40 | 0; l = gj( f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; q = a + 48 | 0; m = Rj( l | 0, I | 0, f[ q >> 2 ] | 0, f[ q + 4 >> 2 ] | 0 ) | 0; q = r + m | 0; m = 0; while ( 1 ) {

							f[ g + ( m << 2 ) >> 2 ] = f[ q >> 2 ]; m = m + 1 | 0; r = b[ t >> 0 ] | 0; if ( ( m | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								y = r; break;

							} else q = q + 4 | 0;

						}

					} else y = o; q = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( q << 2 ) | 0, 0, ( e << 24 >> 24 ) - q << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 7: {

					q = a + 24 | 0; m = b[ q >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						t = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; r = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; l = Rj( r | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = t + l | 0; l = 0; while ( 1 ) {

							f[ g + ( l << 2 ) >> 2 ] = f[ k >> 2 ]; l = l + 1 | 0; t = b[ q >> 0 ] | 0; if ( ( l | 0 ) >= ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 | 0 ) ) {

								z = t; break;

							} else k = k + 8 | 0;

						}

					} else z = m; k = z << 24 >> 24; if ( z << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( k << 2 ) | 0, 0, ( e << 24 >> 24 ) - k << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 8: {

					k = a + 24 | 0; l = b[ k >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						q = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; t = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; r = Rj( t | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = q + r | 0; r = 0; while ( 1 ) {

							f[ g + ( r << 2 ) >> 2 ] = f[ o >> 2 ]; r = r + 1 | 0; q = b[ k >> 0 ] | 0; if ( ( r | 0 ) >= ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 | 0 ) ) {

								A = q; break;

							} else o = o + 8 | 0;

						}

					} else A = l; o = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( o << 2 ) | 0, 0, ( e << 24 >> 24 ) - o << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 9: {

					o = a + 24 | 0; r = b[ o >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; q = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; t = Rj( q | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = k + t | 0; t = 0; while ( 1 ) {

							k = ~ ~ $( n[ m >> 2 ] ); f[ g + ( t << 2 ) >> 2 ] = k; t = t + 1 | 0; k = b[ o >> 0 ] | 0; if ( ( t | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								B = k; break;

							} else m = m + 4 | 0;

						}

					} else B = r; m = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( m << 2 ) | 0, 0, ( e << 24 >> 24 ) - m << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 10: {

					m = a + 24 | 0; t = b[ m >> 0 ] | 0; if ( ( t << 24 >> 24 > e << 24 >> 24 ? e : t ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; k = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; q = Rj( k | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = o + q | 0; q = 0; while ( 1 ) {

							f[ g + ( q << 2 ) >> 2 ] = ~ ~ + p[ l >> 3 ]; q = q + 1 | 0; o = b[ m >> 0 ] | 0; if ( ( q | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								C = o; break;

							} else l = l + 8 | 0;

						}

					} else C = t; l = C << 24 >> 24; if ( C << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( l << 2 ) | 0, 0, ( e << 24 >> 24 ) - l << 2 | 0 ) | 0; i = 1; return i | 0;

				} case 11: {

					l = a + 24 | 0; q = b[ l >> 0 ] | 0; if ( ( q << 24 >> 24 > e << 24 >> 24 ? e : q ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; r = a + 40 | 0; o = gj( f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; r = a + 48 | 0; k = Rj( o | 0, I | 0, f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0 ) | 0; r = m + k | 0; k = 0; while ( 1 ) {

							f[ g + ( k << 2 ) >> 2 ] = h[ r >> 0 ]; k = k + 1 | 0; m = b[ l >> 0 ] | 0; if ( ( k | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								D = m; break;

							} else r = r + 1 | 0;

						}

					} else D = q; r = D << 24 >> 24; if ( D << 24 >> 24 >= e << 24 >> 24 ) {

						i = 1; return i | 0;

					}Vf( g + ( r << 2 ) | 0, 0, ( e << 24 >> 24 ) - r << 2 | 0 ) | 0; i = 1; return i | 0;

				} default: {

					i = 0; return i | 0;

				}

			} while ( 0 );return 0;

		} function qb( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0; if ( ! g ) {

				h = 0; return h | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					i = a + 24 | 0; j = b[ i >> 0 ] | 0; if ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; m = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; o = Rj( m | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = k + o | 0; o = 0; while ( 1 ) {

							b[ g + o >> 0 ] = b[ l >> 0 ] | 0; o = o + 1 | 0; k = b[ i >> 0 ] | 0; if ( ( o | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								q = k; break;

							} else l = l + 1 | 0;

						}

					} else q = j; l = q << 24 >> 24; if ( q << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + l | 0, 0, ( e << 24 >> 24 ) - l | 0 ) | 0; h = 1; return h | 0;

				} case 2: {

					l = a + 24 | 0; o = b[ l >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						i = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; m = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; r = Rj( m | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = i + r | 0; r = 0; while ( 1 ) {

							b[ g + r >> 0 ] = b[ k >> 0 ] | 0; r = r + 1 | 0; i = b[ l >> 0 ] | 0; if ( ( r | 0 ) >= ( ( i << 24 >> 24 > e << 24 >> 24 ? e : i ) << 24 >> 24 | 0 ) ) {

								s = i; break;

							} else k = k + 1 | 0;

						}

					} else s = o; k = s << 24 >> 24; if ( s << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + k | 0, 0, ( e << 24 >> 24 ) - k | 0 ) | 0; h = 1; return h | 0;

				} case 3: {

					k = a + 24 | 0; r = b[ k >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; j = a + 40 | 0; i = gj( f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; j = a + 48 | 0; m = Rj( i | 0, I | 0, f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0 ) | 0; j = l + m | 0; m = 0; while ( 1 ) {

							b[ g + m >> 0 ] = d[ j >> 1 ]; m = m + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( m | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								t = l; break;

							} else j = j + 2 | 0;

						}

					} else t = r; j = t << 24 >> 24; if ( t << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + j | 0, 0, ( e << 24 >> 24 ) - j | 0 ) | 0; h = 1; return h | 0;

				} case 4: {

					j = a + 24 | 0; m = b[ j >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; l = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; i = Rj( l | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = k + i | 0; i = 0; while ( 1 ) {

							b[ g + i >> 0 ] = d[ o >> 1 ]; i = i + 1 | 0; k = b[ j >> 0 ] | 0; if ( ( i | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								u = k; break;

							} else o = o + 2 | 0;

						}

					} else u = m; o = u << 24 >> 24; if ( u << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + o | 0, 0, ( e << 24 >> 24 ) - o | 0 ) | 0; h = 1; return h | 0;

				} case 5: {

					o = a + 24 | 0; i = b[ o >> 0 ] | 0; if ( ( i << 24 >> 24 > e << 24 >> 24 ? e : i ) << 24 >> 24 > 0 ) {

						j = f[ f[ a >> 2 ] >> 2 ] | 0; r = a + 40 | 0; k = gj( f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; r = a + 48 | 0; l = Rj( k | 0, I | 0, f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0 ) | 0; r = j + l | 0; l = 0; while ( 1 ) {

							b[ g + l >> 0 ] = f[ r >> 2 ]; l = l + 1 | 0; j = b[ o >> 0 ] | 0; if ( ( l | 0 ) >= ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 | 0 ) ) {

								v = j; break;

							} else r = r + 4 | 0;

						}

					} else v = i; r = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + r | 0, 0, ( e << 24 >> 24 ) - r | 0 ) | 0; h = 1; return h | 0;

				} case 6: {

					r = a + 24 | 0; l = b[ r >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; j = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; k = Rj( j | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = o + k | 0; k = 0; while ( 1 ) {

							b[ g + k >> 0 ] = f[ m >> 2 ]; k = k + 1 | 0; o = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								w = o; break;

							} else m = m + 4 | 0;

						}

					} else w = l; m = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + m | 0, 0, ( e << 24 >> 24 ) - m | 0 ) | 0; h = 1; return h | 0;

				} case 7: {

					m = a + 24 | 0; k = b[ m >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						r = f[ f[ a >> 2 ] >> 2 ] | 0; i = a + 40 | 0; o = gj( f[ i >> 2 ] | 0, f[ i + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; i = a + 48 | 0; j = Rj( o | 0, I | 0, f[ i >> 2 ] | 0, f[ i + 4 >> 2 ] | 0 ) | 0; i = r + j | 0; j = 0; while ( 1 ) {

							b[ g + j >> 0 ] = f[ i >> 2 ]; j = j + 1 | 0; r = b[ m >> 0 ] | 0; if ( ( j | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								x = r; break;

							} else i = i + 8 | 0;

						}

					} else x = k; i = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + i | 0, 0, ( e << 24 >> 24 ) - i | 0 ) | 0; h = 1; return h | 0;

				} case 8: {

					i = a + 24 | 0; j = b[ i >> 0 ] | 0; if ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; r = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; o = Rj( r | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = m + o | 0; o = 0; while ( 1 ) {

							b[ g + o >> 0 ] = f[ l >> 2 ]; o = o + 1 | 0; m = b[ i >> 0 ] | 0; if ( ( o | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								y = m; break;

							} else l = l + 8 | 0;

						}

					} else y = j; l = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + l | 0, 0, ( e << 24 >> 24 ) - l | 0 ) | 0; h = 1; return h | 0;

				} case 9: {

					l = a + 24 | 0; o = b[ l >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						i = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; m = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; r = Rj( m | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = i + r | 0; r = 0; while ( 1 ) {

							i = ~ ~ $( n[ k >> 2 ] ) & 255; b[ g + r >> 0 ] = i; r = r + 1 | 0; i = b[ l >> 0 ] | 0; if ( ( r | 0 ) >= ( ( i << 24 >> 24 > e << 24 >> 24 ? e : i ) << 24 >> 24 | 0 ) ) {

								z = i; break;

							} else k = k + 4 | 0;

						}

					} else z = o; k = z << 24 >> 24; if ( z << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + k | 0, 0, ( e << 24 >> 24 ) - k | 0 ) | 0; h = 1; return h | 0;

				} case 10: {

					k = a + 24 | 0; r = b[ k >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; j = a + 40 | 0; i = gj( f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; j = a + 48 | 0; m = Rj( i | 0, I | 0, f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0 ) | 0; j = l + m | 0; m = 0; while ( 1 ) {

							b[ g + m >> 0 ] = ~ ~ + p[ j >> 3 ]; m = m + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( m | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								A = l; break;

							} else j = j + 8 | 0;

						}

					} else A = r; j = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + j | 0, 0, ( e << 24 >> 24 ) - j | 0 ) | 0; h = 1; return h | 0;

				} case 11: {

					j = a + 24 | 0; m = b[ j >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; l = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; i = Rj( l | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = k + i | 0; i = 0; while ( 1 ) {

							b[ g + i >> 0 ] = b[ o >> 0 ] | 0; i = i + 1 | 0; k = b[ j >> 0 ] | 0; if ( ( i | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								B = k; break;

							} else o = o + 1 | 0;

						}

					} else B = m; o = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + o | 0, 0, ( e << 24 >> 24 ) - o | 0 ) | 0; h = 1; return h | 0;

				} default: {

					h = 0; return h | 0;

				}

			} while ( 0 );return 0;

		} function rb( a, c, e, g ) {

			a = a | 0; c = c | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0; if ( ! g ) {

				h = 0; return h | 0;

			} do switch ( f[ a + 28 >> 2 ] | 0 ) {

				case 1: {

					i = a + 24 | 0; j = b[ i >> 0 ] | 0; if ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; m = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; o = Rj( m | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = k + o | 0; o = 0; while ( 1 ) {

							b[ g + o >> 0 ] = b[ l >> 0 ] | 0; o = o + 1 | 0; k = b[ i >> 0 ] | 0; if ( ( o | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								q = k; break;

							} else l = l + 1 | 0;

						}

					} else q = j; l = q << 24 >> 24; if ( q << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + l | 0, 0, ( e << 24 >> 24 ) - l | 0 ) | 0; h = 1; return h | 0;

				} case 2: {

					l = a + 24 | 0; o = b[ l >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						i = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; m = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; r = Rj( m | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = i + r | 0; r = 0; while ( 1 ) {

							b[ g + r >> 0 ] = b[ k >> 0 ] | 0; r = r + 1 | 0; i = b[ l >> 0 ] | 0; if ( ( r | 0 ) >= ( ( i << 24 >> 24 > e << 24 >> 24 ? e : i ) << 24 >> 24 | 0 ) ) {

								s = i; break;

							} else k = k + 1 | 0;

						}

					} else s = o; k = s << 24 >> 24; if ( s << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + k | 0, 0, ( e << 24 >> 24 ) - k | 0 ) | 0; h = 1; return h | 0;

				} case 3: {

					k = a + 24 | 0; r = b[ k >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; j = a + 40 | 0; i = gj( f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; j = a + 48 | 0; m = Rj( i | 0, I | 0, f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0 ) | 0; j = l + m | 0; m = 0; while ( 1 ) {

							b[ g + m >> 0 ] = d[ j >> 1 ]; m = m + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( m | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								t = l; break;

							} else j = j + 2 | 0;

						}

					} else t = r; j = t << 24 >> 24; if ( t << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + j | 0, 0, ( e << 24 >> 24 ) - j | 0 ) | 0; h = 1; return h | 0;

				} case 4: {

					j = a + 24 | 0; m = b[ j >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; l = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; i = Rj( l | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = k + i | 0; i = 0; while ( 1 ) {

							b[ g + i >> 0 ] = d[ o >> 1 ]; i = i + 1 | 0; k = b[ j >> 0 ] | 0; if ( ( i | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								u = k; break;

							} else o = o + 2 | 0;

						}

					} else u = m; o = u << 24 >> 24; if ( u << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + o | 0, 0, ( e << 24 >> 24 ) - o | 0 ) | 0; h = 1; return h | 0;

				} case 5: {

					o = a + 24 | 0; i = b[ o >> 0 ] | 0; if ( ( i << 24 >> 24 > e << 24 >> 24 ? e : i ) << 24 >> 24 > 0 ) {

						j = f[ f[ a >> 2 ] >> 2 ] | 0; r = a + 40 | 0; k = gj( f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; r = a + 48 | 0; l = Rj( k | 0, I | 0, f[ r >> 2 ] | 0, f[ r + 4 >> 2 ] | 0 ) | 0; r = j + l | 0; l = 0; while ( 1 ) {

							b[ g + l >> 0 ] = f[ r >> 2 ]; l = l + 1 | 0; j = b[ o >> 0 ] | 0; if ( ( l | 0 ) >= ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 | 0 ) ) {

								v = j; break;

							} else r = r + 4 | 0;

						}

					} else v = i; r = v << 24 >> 24; if ( v << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + r | 0, 0, ( e << 24 >> 24 ) - r | 0 ) | 0; h = 1; return h | 0;

				} case 6: {

					r = a + 24 | 0; l = b[ r >> 0 ] | 0; if ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 > 0 ) {

						o = f[ f[ a >> 2 ] >> 2 ] | 0; m = a + 40 | 0; j = gj( f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; m = a + 48 | 0; k = Rj( j | 0, I | 0, f[ m >> 2 ] | 0, f[ m + 4 >> 2 ] | 0 ) | 0; m = o + k | 0; k = 0; while ( 1 ) {

							b[ g + k >> 0 ] = f[ m >> 2 ]; k = k + 1 | 0; o = b[ r >> 0 ] | 0; if ( ( k | 0 ) >= ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 | 0 ) ) {

								w = o; break;

							} else m = m + 4 | 0;

						}

					} else w = l; m = w << 24 >> 24; if ( w << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + m | 0, 0, ( e << 24 >> 24 ) - m | 0 ) | 0; h = 1; return h | 0;

				} case 7: {

					m = a + 24 | 0; k = b[ m >> 0 ] | 0; if ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 > 0 ) {

						r = f[ f[ a >> 2 ] >> 2 ] | 0; i = a + 40 | 0; o = gj( f[ i >> 2 ] | 0, f[ i + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; i = a + 48 | 0; j = Rj( o | 0, I | 0, f[ i >> 2 ] | 0, f[ i + 4 >> 2 ] | 0 ) | 0; i = r + j | 0; j = 0; while ( 1 ) {

							b[ g + j >> 0 ] = f[ i >> 2 ]; j = j + 1 | 0; r = b[ m >> 0 ] | 0; if ( ( j | 0 ) >= ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 | 0 ) ) {

								x = r; break;

							} else i = i + 8 | 0;

						}

					} else x = k; i = x << 24 >> 24; if ( x << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + i | 0, 0, ( e << 24 >> 24 ) - i | 0 ) | 0; h = 1; return h | 0;

				} case 8: {

					i = a + 24 | 0; j = b[ i >> 0 ] | 0; if ( ( j << 24 >> 24 > e << 24 >> 24 ? e : j ) << 24 >> 24 > 0 ) {

						m = f[ f[ a >> 2 ] >> 2 ] | 0; l = a + 40 | 0; r = gj( f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; l = a + 48 | 0; o = Rj( r | 0, I | 0, f[ l >> 2 ] | 0, f[ l + 4 >> 2 ] | 0 ) | 0; l = m + o | 0; o = 0; while ( 1 ) {

							b[ g + o >> 0 ] = f[ l >> 2 ]; o = o + 1 | 0; m = b[ i >> 0 ] | 0; if ( ( o | 0 ) >= ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 | 0 ) ) {

								y = m; break;

							} else l = l + 8 | 0;

						}

					} else y = j; l = y << 24 >> 24; if ( y << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + l | 0, 0, ( e << 24 >> 24 ) - l | 0 ) | 0; h = 1; return h | 0;

				} case 9: {

					l = a + 24 | 0; o = b[ l >> 0 ] | 0; if ( ( o << 24 >> 24 > e << 24 >> 24 ? e : o ) << 24 >> 24 > 0 ) {

						i = f[ f[ a >> 2 ] >> 2 ] | 0; k = a + 40 | 0; m = gj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; k = a + 48 | 0; r = Rj( m | 0, I | 0, f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0 ) | 0; k = i + r | 0; r = 0; while ( 1 ) {

							i = ~ ~ $( n[ k >> 2 ] ); b[ g + r >> 0 ] = i; r = r + 1 | 0; i = b[ l >> 0 ] | 0; if ( ( r | 0 ) >= ( ( i << 24 >> 24 > e << 24 >> 24 ? e : i ) << 24 >> 24 | 0 ) ) {

								z = i; break;

							} else k = k + 4 | 0;

						}

					} else z = o; k = z << 24 >> 24; if ( z << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + k | 0, 0, ( e << 24 >> 24 ) - k | 0 ) | 0; h = 1; return h | 0;

				} case 10: {

					k = a + 24 | 0; r = b[ k >> 0 ] | 0; if ( ( r << 24 >> 24 > e << 24 >> 24 ? e : r ) << 24 >> 24 > 0 ) {

						l = f[ f[ a >> 2 ] >> 2 ] | 0; j = a + 40 | 0; i = gj( f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; j = a + 48 | 0; m = Rj( i | 0, I | 0, f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0 ) | 0; j = l + m | 0; m = 0; while ( 1 ) {

							b[ g + m >> 0 ] = ~ ~ + p[ j >> 3 ]; m = m + 1 | 0; l = b[ k >> 0 ] | 0; if ( ( m | 0 ) >= ( ( l << 24 >> 24 > e << 24 >> 24 ? e : l ) << 24 >> 24 | 0 ) ) {

								A = l; break;

							} else j = j + 8 | 0;

						}

					} else A = r; j = A << 24 >> 24; if ( A << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + j | 0, 0, ( e << 24 >> 24 ) - j | 0 ) | 0; h = 1; return h | 0;

				} case 11: {

					j = a + 24 | 0; m = b[ j >> 0 ] | 0; if ( ( m << 24 >> 24 > e << 24 >> 24 ? e : m ) << 24 >> 24 > 0 ) {

						k = f[ f[ a >> 2 ] >> 2 ] | 0; o = a + 40 | 0; l = gj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, f[ c >> 2 ] | 0, 0 ) | 0; o = a + 48 | 0; i = Rj( l | 0, I | 0, f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0 ) | 0; o = k + i | 0; i = 0; while ( 1 ) {

							b[ g + i >> 0 ] = b[ o >> 0 ] | 0; i = i + 1 | 0; k = b[ j >> 0 ] | 0; if ( ( i | 0 ) >= ( ( k << 24 >> 24 > e << 24 >> 24 ? e : k ) << 24 >> 24 | 0 ) ) {

								B = k; break;

							} else o = o + 1 | 0;

						}

					} else B = m; o = B << 24 >> 24; if ( B << 24 >> 24 >= e << 24 >> 24 ) {

						h = 1; return h | 0;

					}Vf( g + o | 0, 0, ( e << 24 >> 24 ) - o | 0 ) | 0; h = 1; return h | 0;

				} default: {

					h = 0; return h | 0;

				}

			} while ( 0 );return 0;

		} function sb( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0; g = u; u = u + 80 | 0; h = g + 76 | 0; i = g + 72 | 0; j = g + 48 | 0; k = g + 24 | 0; l = g; m = a + 32 | 0; n = f[ c >> 2 ] | 0; c = n + 1 | 0; if ( ( n | 0 ) != - 1 ) {

				o = ( ( c >>> 0 ) % 3 | 0 | 0 ) == 0 ? n + - 2 | 0 : c; c = ( ( ( n >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + n | 0; if ( ( o | 0 ) == - 1 )p = - 1; else p = f[ ( f[ f[ m >> 2 ] >> 2 ] | 0 ) + ( o << 2 ) >> 2 ] | 0; if ( ( c | 0 ) == - 1 ) {

					q = p; r = - 1;

				} else {

					q = p; r = f[ ( f[ f[ m >> 2 ] >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] | 0;

				}

			} else {

				q = - 1; r = - 1;

			}c = f[ a + 36 >> 2 ] | 0; m = f[ c >> 2 ] | 0; p = ( f[ c + 4 >> 2 ] | 0 ) - m >> 2; if ( p >>> 0 <= q >>> 0 )um( c ); o = m; m = f[ o + ( q << 2 ) >> 2 ] | 0; if ( p >>> 0 <= r >>> 0 )um( c ); c = f[ o + ( r << 2 ) >> 2 ] | 0; r = ( m | 0 ) < ( e | 0 ); do if ( r & ( c | 0 ) < ( e | 0 ) ) {

				o = m << 1; p = f[ d + ( o << 2 ) >> 2 ] | 0; q = ( ( p | 0 ) < 0 ) << 31 >> 31; n = f[ d + ( ( o | 1 ) << 2 ) >> 2 ] | 0; o = ( ( n | 0 ) < 0 ) << 31 >> 31; s = c << 1; t = f[ d + ( s << 2 ) >> 2 ] | 0; v = f[ d + ( ( s | 1 ) << 2 ) >> 2 ] | 0; if ( ! ( ( t | 0 ) != ( p | 0 ) | ( v | 0 ) != ( n | 0 ) ) ) {

					f[ a + 8 >> 2 ] = p; f[ a + 12 >> 2 ] = n; u = g; return;

				}s = a + 4 | 0; w = f[ ( f[ s >> 2 ] | 0 ) + ( e << 2 ) >> 2 ] | 0; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; f[ j + 12 >> 2 ] = 0; f[ j + 16 >> 2 ] = 0; f[ j + 20 >> 2 ] = 0; x = f[ a >> 2 ] | 0; if ( ! ( b[ x + 84 >> 0 ] | 0 ) )y = f[ ( f[ x + 68 >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else y = w; f[ i >> 2 ] = y; w = b[ x + 24 >> 0 ] | 0; f[ h >> 2 ] = f[ i >> 2 ]; jb( x, h, w, j ) | 0; w = f[ ( f[ s >> 2 ] | 0 ) + ( m << 2 ) >> 2 ] | 0; f[ k >> 2 ] = 0; f[ k + 4 >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; f[ k + 12 >> 2 ] = 0; f[ k + 16 >> 2 ] = 0; f[ k + 20 >> 2 ] = 0; x = f[ a >> 2 ] | 0; if ( ! ( b[ x + 84 >> 0 ] | 0 ) )z = f[ ( f[ x + 68 >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else z = w; f[ i >> 2 ] = z; w = b[ x + 24 >> 0 ] | 0; f[ h >> 2 ] = f[ i >> 2 ]; jb( x, h, w, k ) | 0; w = f[ ( f[ s >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] | 0; f[ l >> 2 ] = 0; f[ l + 4 >> 2 ] = 0; f[ l + 8 >> 2 ] = 0; f[ l + 12 >> 2 ] = 0; f[ l + 16 >> 2 ] = 0; f[ l + 20 >> 2 ] = 0; s = f[ a >> 2 ] | 0; if ( ! ( b[ s + 84 >> 0 ] | 0 ) )A = f[ ( f[ s + 68 >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else A = w; f[ i >> 2 ] = A; w = b[ s + 24 >> 0 ] | 0; f[ h >> 2 ] = f[ i >> 2 ]; jb( s, h, w, l ) | 0; w = l; s = k; x = f[ s >> 2 ] | 0; B = f[ s + 4 >> 2 ] | 0; s = Tj( f[ w >> 2 ] | 0, f[ w + 4 >> 2 ] | 0, x | 0, B | 0 ) | 0; w = I; C = l + 8 | 0; D = k + 8 | 0; E = f[ D >> 2 ] | 0; F = f[ D + 4 >> 2 ] | 0; D = Tj( f[ C >> 2 ] | 0, f[ C + 4 >> 2 ] | 0, E | 0, F | 0 ) | 0; C = I; G = l + 16 | 0; H = k + 16 | 0; J = f[ H >> 2 ] | 0; K = f[ H + 4 >> 2 ] | 0; H = Tj( f[ G >> 2 ] | 0, f[ G + 4 >> 2 ] | 0, J | 0, K | 0 ) | 0; G = I; L = gj( s | 0, w | 0, s | 0, w | 0 ) | 0; M = I; N = gj( D | 0, C | 0, D | 0, C | 0 ) | 0; O = Rj( N | 0, I | 0, L | 0, M | 0 ) | 0; M = I; L = gj( H | 0, G | 0, H | 0, G | 0 ) | 0; N = Rj( O | 0, M | 0, L | 0, I | 0 ) | 0; L = I; if ( ( N | 0 ) == 0 & ( L | 0 ) == 0 ) break; M = j; O = Tj( f[ M >> 2 ] | 0, f[ M + 4 >> 2 ] | 0, x | 0, B | 0 ) | 0; B = I; x = j + 8 | 0; M = Tj( f[ x >> 2 ] | 0, f[ x + 4 >> 2 ] | 0, E | 0, F | 0 ) | 0; F = I; E = j + 16 | 0; x = Tj( f[ E >> 2 ] | 0, f[ E + 4 >> 2 ] | 0, J | 0, K | 0 ) | 0; K = I; J = gj( O | 0, B | 0, s | 0, w | 0 ) | 0; E = I; P = gj( M | 0, F | 0, D | 0, C | 0 ) | 0; Q = Rj( P | 0, I | 0, J | 0, E | 0 ) | 0; E = I; J = gj( x | 0, K | 0, H | 0, G | 0 ) | 0; P = Rj( Q | 0, E | 0, J | 0, I | 0 ) | 0; J = I; E = Tj( t | 0, ( ( t | 0 ) < 0 ) << 31 >> 31 | 0, p | 0, q | 0 ) | 0; t = I; Q = Tj( v | 0, ( ( v | 0 ) < 0 ) << 31 >> 31 | 0, n | 0, o | 0 ) | 0; v = I; R = gj( N | 0, L | 0, p | 0, q | 0 ) | 0; q = I; p = gj( N | 0, L | 0, n | 0, o | 0 ) | 0; o = I; n = gj( P | 0, J | 0, E | 0, t | 0 ) | 0; S = I; T = gj( P | 0, J | 0, Q | 0, v | 0 ) | 0; U = I; V = Rj( n | 0, S | 0, R | 0, q | 0 ) | 0; q = I; R = Rj( T | 0, U | 0, p | 0, o | 0 ) | 0; o = I; p = gj( P | 0, J | 0, s | 0, w | 0 ) | 0; w = I; s = gj( P | 0, J | 0, D | 0, C | 0 ) | 0; C = I; D = gj( P | 0, J | 0, H | 0, G | 0 ) | 0; G = I; H = Ug( p | 0, w | 0, N | 0, L | 0 ) | 0; w = I; p = Ug( s | 0, C | 0, N | 0, L | 0 ) | 0; C = I; s = Ug( D | 0, G | 0, N | 0, L | 0 ) | 0; G = I; D = Tj( O | 0, B | 0, H | 0, w | 0 ) | 0; w = I; H = Tj( M | 0, F | 0, p | 0, C | 0 ) | 0; C = I; p = Tj( x | 0, K | 0, s | 0, G | 0 ) | 0; G = I; s = gj( D | 0, w | 0, D | 0, w | 0 ) | 0; w = I; D = gj( H | 0, C | 0, H | 0, C | 0 ) | 0; C = Rj( D | 0, I | 0, s | 0, w | 0 ) | 0; w = I; s = gj( p | 0, G | 0, p | 0, G | 0 ) | 0; G = Rj( C | 0, w | 0, s | 0, I | 0 ) | 0; s = I; w = Tj( 0, 0, E | 0, t | 0 ) | 0; t = I; E = gj( G | 0, s | 0, N | 0, L | 0 ) | 0; s = I; switch ( E | 0 ) {

					case 0: {

						if ( ! s ) {

							W = 0; X = 0;

						} else {

							Y = 1; Z = 0; _ = E; $ = s; aa = 23;

						} break;

					} case 1: {

						if ( ! s ) {

							ba = 1; ca = 0; aa = 24;

						} else {

							Y = 1; Z = 0; _ = E; $ = s; aa = 23;

						} break;

					} default: {

						Y = 1; Z = 0; _ = E; $ = s; aa = 23;

					}

				} if ( ( aa | 0 ) == 23 ) while ( 1 ) {

					aa = 0; G = Oj( Y | 0, Z | 0, 1 ) | 0; C = I; p = _; _ = Uj( _ | 0, $ | 0, 2 ) | 0; if ( ! ( $ >>> 0 > 0 | ( $ | 0 ) == 0 & p >>> 0 > 7 ) ) {

						ba = G; ca = C; aa = 24; break;

					} else {

						Y = G; Z = C; $ = I; aa = 23;

					}

				} if ( ( aa | 0 ) == 24 ) while ( 1 ) {

					aa = 0; C = Fl( E | 0, s | 0, ba | 0, ca | 0 ) | 0; G = Rj( C | 0, I | 0, ba | 0, ca | 0 ) | 0; C = Uj( G | 0, I | 0, 1 ) | 0; G = I; p = gj( C | 0, G | 0, C | 0, G | 0 ) | 0; D = I; if ( D >>> 0 > s >>> 0 | ( D | 0 ) == ( s | 0 ) & p >>> 0 > E >>> 0 ) {

						ba = C; ca = G; aa = 24;

					} else {

						W = C; X = G; break;

					}

				}E = gj( W | 0, X | 0, Q | 0, v | 0 ) | 0; s = I; G = gj( W | 0, X | 0, w | 0, t | 0 ) | 0; C = I; p = a + 20 | 0; D = ( f[ p >> 2 ] | 0 ) + - 1 | 0; H = ( 1 << ( D & 31 ) & f[ ( f[ a + 16 >> 2 ] | 0 ) + ( D >>> 5 << 2 ) >> 2 ] | 0 ) != 0; f[ p >> 2 ] = D; D = Tj( 0, 0, E | 0, s | 0 ) | 0; p = Rj( V | 0, q | 0, ( H ? E : D ) | 0, ( H ? s : I ) | 0 ) | 0; s = I; D = Tj( 0, 0, G | 0, C | 0 ) | 0; E = Rj( R | 0, o | 0, ( H ? G : D ) | 0, ( H ? C : I ) | 0 ) | 0; C = I; H = Ug( p | 0, s | 0, N | 0, L | 0 ) | 0; s = Ug( E | 0, C | 0, N | 0, L | 0 ) | 0; f[ a + 8 >> 2 ] = H; f[ a + 12 >> 2 ] = s; u = g; return;

			} while ( 0 );do if ( r )da = m << 1; else {

				if ( ( e | 0 ) > 0 ) {

					da = ( e << 1 ) + - 2 | 0; break;

				}X = a + 8 | 0; f[ X >> 2 ] = 0; f[ X + 4 >> 2 ] = 0; u = g; return;

			} while ( 0 );f[ a + 8 >> 2 ] = f[ d + ( da << 2 ) >> 2 ]; f[ a + 12 >> 2 ] = f[ d + ( da + 1 << 2 ) >> 2 ]; u = g; return;

		} function tb( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0; c = u; u = u + 16 | 0; d = c + 8 | 0; e = c; g = f[ b >> 2 ] | 0; if ( ( g | 0 ) == - 1 ) {

				u = c; return;

			}h = ( g >>> 0 ) / 3 | 0; i = a + 12 | 0; if ( f[ ( f[ i >> 2 ] | 0 ) + ( h >>> 5 << 2 ) >> 2 ] & 1 << ( h & 31 ) | 0 ) {

				u = c; return;

			}h = a + 56 | 0; j = f[ h >> 2 ] | 0; k = a + 60 | 0; l = f[ k >> 2 ] | 0; if ( ( l | 0 ) == ( j | 0 ) )m = j; else {

				n = l + ( ~ ( ( l + - 4 - j | 0 ) >>> 2 ) << 2 ) | 0; f[ k >> 2 ] = n; m = n;

			}n = a + 64 | 0; if ( ( m | 0 ) == ( f[ n >> 2 ] | 0 ) )xf( h, b ); else {

				f[ m >> 2 ] = g; f[ k >> 2 ] = m + 4;

			}m = f[ a >> 2 ] | 0; g = f[ b >> 2 ] | 0; j = g + 1 | 0; do if ( ( g | 0 ) != - 1 ) {

				l = f[ m + 28 >> 2 ] | 0; o = f[ l + ( ( ( ( j >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : j ) << 2 ) >> 2 ] | 0; if ( ! ( ( g >>> 0 ) % 3 | 0 ) ) {

					p = o; q = g + 2 | 0; r = l; break;

				} else {

					p = o; q = g + - 1 | 0; r = l; break;

				}

			} else {

				l = f[ m + 28 >> 2 ] | 0; p = f[ l + - 4 >> 2 ] | 0; q = - 1; r = l;

			} while ( 0 );m = f[ r + ( q << 2 ) >> 2 ] | 0; q = a + 24 | 0; r = f[ q >> 2 ] | 0; g = r + ( p >>> 5 << 2 ) | 0; j = 1 << ( p & 31 ); l = f[ g >> 2 ] | 0; if ( ! ( l & j ) ) {

				f[ g >> 2 ] = l | j; j = f[ b >> 2 ] | 0; l = j + 1 | 0; if ( ( j | 0 ) == - 1 )s = - 1; else s = ( ( l >>> 0 ) % 3 | 0 | 0 ) == 0 ? j + - 2 | 0 : l; f[ e >> 2 ] = s; l = f[ ( f[ ( f[ a + 44 >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( s >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( s >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; s = f[ a + 48 >> 2 ] | 0; f[ d >> 2 ] = l; j = f[ s + 4 >> 2 ] | 0; s = j + 4 | 0; g = f[ s >> 2 ] | 0; if ( ( g | 0 ) == ( f[ j + 8 >> 2 ] | 0 ) )xf( j, d ); else {

					f[ g >> 2 ] = l; f[ s >> 2 ] = g + 4;

				}g = a + 40 | 0; s = f[ g >> 2 ] | 0; l = s + 4 | 0; j = f[ l >> 2 ] | 0; if ( ( j | 0 ) == ( f[ s + 8 >> 2 ] | 0 ) ) {

					xf( s, e ); t = f[ g >> 2 ] | 0;

				} else {

					f[ j >> 2 ] = f[ e >> 2 ]; f[ l >> 2 ] = j + 4; t = s;

				}s = t + 24 | 0; f[ ( f[ t + 12 >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] = f[ s >> 2 ]; f[ s >> 2 ] = ( f[ s >> 2 ] | 0 ) + 1; v = f[ q >> 2 ] | 0;

			} else v = r; r = v + ( m >>> 5 << 2 ) | 0; v = 1 << ( m & 31 ); s = f[ r >> 2 ] | 0; if ( ! ( s & v ) ) {

				f[ r >> 2 ] = s | v; v = f[ b >> 2 ] | 0; do if ( ( v | 0 ) != - 1 ) if ( ! ( ( v >>> 0 ) % 3 | 0 ) ) {

					w = v + 2 | 0; break;

				} else {

					w = v + - 1 | 0; break;

				} else w = - 1; while ( 0 );f[ e >> 2 ] = w; v = f[ ( f[ ( f[ a + 44 >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( w >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( w >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; w = f[ a + 48 >> 2 ] | 0; f[ d >> 2 ] = v; s = f[ w + 4 >> 2 ] | 0; w = s + 4 | 0; r = f[ w >> 2 ] | 0; if ( ( r | 0 ) == ( f[ s + 8 >> 2 ] | 0 ) )xf( s, d ); else {

					f[ r >> 2 ] = v; f[ w >> 2 ] = r + 4;

				}r = a + 40 | 0; w = f[ r >> 2 ] | 0; v = w + 4 | 0; s = f[ v >> 2 ] | 0; if ( ( s | 0 ) == ( f[ w + 8 >> 2 ] | 0 ) ) {

					xf( w, e ); x = f[ r >> 2 ] | 0;

				} else {

					f[ s >> 2 ] = f[ e >> 2 ]; f[ v >> 2 ] = s + 4; x = w;

				}w = x + 24 | 0; f[ ( f[ x + 12 >> 2 ] | 0 ) + ( m << 2 ) >> 2 ] = f[ w >> 2 ]; f[ w >> 2 ] = ( f[ w >> 2 ] | 0 ) + 1;

			}w = f[ h >> 2 ] | 0; m = f[ k >> 2 ] | 0; if ( ( w | 0 ) == ( m | 0 ) ) {

				u = c; return;

			}x = a + 44 | 0; s = a + 48 | 0; v = a + 40 | 0; r = m; m = w; while ( 1 ) {

				w = f[ r + - 4 >> 2 ] | 0; f[ b >> 2 ] = w; p = ( w >>> 0 ) / 3 | 0; if ( ( w | 0 ) != - 1 ? ( w = f[ i >> 2 ] | 0, ( f[ w + ( p >>> 5 << 2 ) >> 2 ] & 1 << ( p & 31 ) | 0 ) == 0 ) : 0 ) {

					t = p; p = w; w = f[ a >> 2 ] | 0; a:while ( 1 ) {

						j = p + ( t >>> 5 << 2 ) | 0; f[ j >> 2 ] = f[ j >> 2 ] | 1 << ( t & 31 ); j = f[ b >> 2 ] | 0; l = f[ ( f[ w + 28 >> 2 ] | 0 ) + ( j << 2 ) >> 2 ] | 0; g = ( f[ q >> 2 ] | 0 ) + ( l >>> 5 << 2 ) | 0; o = 1 << ( l & 31 ); y = f[ g >> 2 ] | 0; if ( ! ( o & y ) ) {

							z = f[ ( f[ w + 40 >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] | 0; if ( ( z | 0 ) == - 1 )A = 1; else {

								B = f[ ( f[ f[ w + 64 >> 2 ] >> 2 ] | 0 ) + ( z << 2 ) >> 2 ] | 0; A = ( 1 << ( B & 31 ) & f[ ( f[ w + 12 >> 2 ] | 0 ) + ( B >>> 5 << 2 ) >> 2 ] | 0 ) != 0;

							}f[ g >> 2 ] = y | o; o = f[ b >> 2 ] | 0; f[ e >> 2 ] = o; y = f[ ( f[ ( f[ x >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( o >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( o >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; o = f[ s >> 2 ] | 0; f[ d >> 2 ] = y; g = f[ o + 4 >> 2 ] | 0; o = g + 4 | 0; B = f[ o >> 2 ] | 0; if ( ( B | 0 ) == ( f[ g + 8 >> 2 ] | 0 ) )xf( g, d ); else {

								f[ B >> 2 ] = y; f[ o >> 2 ] = B + 4;

							}B = f[ v >> 2 ] | 0; o = B + 4 | 0; y = f[ o >> 2 ] | 0; if ( ( y | 0 ) == ( f[ B + 8 >> 2 ] | 0 ) ) {

								xf( B, e ); C = f[ v >> 2 ] | 0;

							} else {

								f[ y >> 2 ] = f[ e >> 2 ]; f[ o >> 2 ] = y + 4; C = B;

							}B = C + 24 | 0; f[ ( f[ C + 12 >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] = f[ B >> 2 ]; f[ B >> 2 ] = ( f[ B >> 2 ] | 0 ) + 1; B = f[ a >> 2 ] | 0; l = f[ b >> 2 ] | 0; if ( A ) {

								D = l; E = B; F = 57;

							} else {

								y = l + 1 | 0; do if ( ( l | 0 ) == - 1 )G = - 1; else {

									o = ( ( y >>> 0 ) % 3 | 0 | 0 ) == 0 ? l + - 2 | 0 : y; if ( ( o | 0 ) == - 1 ) {

										G = - 1; break;

									} if ( f[ ( f[ B >> 2 ] | 0 ) + ( o >>> 5 << 2 ) >> 2 ] & 1 << ( o & 31 ) | 0 ) {

										G = - 1; break;

									}G = f[ ( f[ ( f[ B + 64 >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( o << 2 ) >> 2 ] | 0;

								} while ( 0 );f[ b >> 2 ] = G; H = ( G >>> 0 ) / 3 | 0; I = B;

							}

						} else {

							D = j; E = w; F = 57;

						} if ( ( F | 0 ) == 57 ) {

							F = 0; y = D + 1 | 0; if ( ( D | 0 ) == - 1 ) {

								F = 58; break;

							}l = ( ( y >>> 0 ) % 3 | 0 | 0 ) == 0 ? D + - 2 | 0 : y; if ( ( l | 0 ) != - 1 ? ( f[ ( f[ E >> 2 ] | 0 ) + ( l >>> 5 << 2 ) >> 2 ] & 1 << ( l & 31 ) | 0 ) == 0 : 0 )J = f[ ( f[ ( f[ E + 64 >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] | 0; else J = - 1; f[ d >> 2 ] = J; l = ( ( ( D >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + D | 0; if ( ( l | 0 ) != - 1 ? ( f[ ( f[ E >> 2 ] | 0 ) + ( l >>> 5 << 2 ) >> 2 ] & 1 << ( l & 31 ) | 0 ) == 0 : 0 )K = f[ ( f[ ( f[ E + 64 >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] | 0; else K = - 1; l = ( J | 0 ) == - 1; y = ( J >>> 0 ) / 3 | 0; o = l ? - 1 : y; g = ( K | 0 ) == - 1; z = ( K >>> 0 ) / 3 | 0; L = g ? - 1 : z; do if ( ! l ) {

								M = f[ i >> 2 ] | 0; if ( f[ M + ( o >>> 5 << 2 ) >> 2 ] & 1 << ( o & 31 ) | 0 ) {

									F = 67; break;

								} if ( g ) {

									N = J; O = y; break;

								} if ( ! ( f[ M + ( L >>> 5 << 2 ) >> 2 ] & 1 << ( L & 31 ) ) ) {

									F = 72; break a;

								} else {

									N = J; O = y;

								}

							} else F = 67; while ( 0 );if ( ( F | 0 ) == 67 ) {

								F = 0; if ( g ) {

									F = 69; break;

								} if ( ! ( f[ ( f[ i >> 2 ] | 0 ) + ( L >>> 5 << 2 ) >> 2 ] & 1 << ( L & 31 ) ) ) {

									N = K; O = z;

								} else {

									F = 69; break;

								}

							}f[ b >> 2 ] = N; H = O; I = E;

						}t = H; p = f[ i >> 2 ] | 0; w = I;

					} do if ( ( F | 0 ) == 58 ) {

						F = 0; f[ d >> 2 ] = - 1; F = 69;

					} else if ( ( F | 0 ) == 72 ) {

						F = 0; w = f[ k >> 2 ] | 0; f[ w + - 4 >> 2 ] = K; if ( ( w | 0 ) == ( f[ n >> 2 ] | 0 ) ) {

							xf( h, d ); P = f[ k >> 2 ] | 0; break;

						} else {

							f[ w >> 2 ] = f[ d >> 2 ]; p = w + 4 | 0; f[ k >> 2 ] = p; P = p; break;

						}

					} while ( 0 );if ( ( F | 0 ) == 69 ) {

						F = 0; p = ( f[ k >> 2 ] | 0 ) + - 4 | 0; f[ k >> 2 ] = p; P = p;

					}Q = f[ h >> 2 ] | 0; R = P;

				} else {

					p = r + - 4 | 0; f[ k >> 2 ] = p; Q = m; R = p;

				} if ( ( Q | 0 ) == ( R | 0 ) ) break; else {

					r = R; m = Q;

				}

			}u = c; return;

		} function ub( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0; g = u; u = u + 80 | 0; h = g + 76 | 0; i = g + 72 | 0; j = g + 48 | 0; k = g + 24 | 0; l = g; m = a + 32 | 0; n = f[ c >> 2 ] | 0; c = n + 1 | 0; do if ( ( n | 0 ) != - 1 ) {

				o = ( ( c >>> 0 ) % 3 | 0 | 0 ) == 0 ? n + - 2 | 0 : c; if ( ! ( ( n >>> 0 ) % 3 | 0 ) ) {

					p = n + 2 | 0; q = o; break;

				} else {

					p = n + - 1 | 0; q = o; break;

				}

			} else {

				p = - 1; q = - 1;

			} while ( 0 );n = f[ ( f[ m >> 2 ] | 0 ) + 28 >> 2 ] | 0; m = f[ n + ( q << 2 ) >> 2 ] | 0; q = f[ n + ( p << 2 ) >> 2 ] | 0; p = f[ a + 36 >> 2 ] | 0; n = f[ p >> 2 ] | 0; c = ( f[ p + 4 >> 2 ] | 0 ) - n >> 2; if ( c >>> 0 <= m >>> 0 )um( p ); o = n; n = f[ o + ( m << 2 ) >> 2 ] | 0; if ( c >>> 0 <= q >>> 0 )um( p ); p = f[ o + ( q << 2 ) >> 2 ] | 0; q = ( n | 0 ) < ( e | 0 ); do if ( q & ( p | 0 ) < ( e | 0 ) ) {

				o = n << 1; c = f[ d + ( o << 2 ) >> 2 ] | 0; m = ( ( c | 0 ) < 0 ) << 31 >> 31; r = f[ d + ( ( o | 1 ) << 2 ) >> 2 ] | 0; o = ( ( r | 0 ) < 0 ) << 31 >> 31; s = p << 1; t = f[ d + ( s << 2 ) >> 2 ] | 0; v = f[ d + ( ( s | 1 ) << 2 ) >> 2 ] | 0; if ( ! ( ( t | 0 ) != ( c | 0 ) | ( v | 0 ) != ( r | 0 ) ) ) {

					f[ a + 8 >> 2 ] = c; f[ a + 12 >> 2 ] = r; u = g; return;

				}s = a + 4 | 0; w = f[ ( f[ s >> 2 ] | 0 ) + ( e << 2 ) >> 2 ] | 0; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; f[ j + 12 >> 2 ] = 0; f[ j + 16 >> 2 ] = 0; f[ j + 20 >> 2 ] = 0; x = f[ a >> 2 ] | 0; if ( ! ( b[ x + 84 >> 0 ] | 0 ) )y = f[ ( f[ x + 68 >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else y = w; f[ i >> 2 ] = y; w = b[ x + 24 >> 0 ] | 0; f[ h >> 2 ] = f[ i >> 2 ]; jb( x, h, w, j ) | 0; w = f[ ( f[ s >> 2 ] | 0 ) + ( n << 2 ) >> 2 ] | 0; f[ k >> 2 ] = 0; f[ k + 4 >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; f[ k + 12 >> 2 ] = 0; f[ k + 16 >> 2 ] = 0; f[ k + 20 >> 2 ] = 0; x = f[ a >> 2 ] | 0; if ( ! ( b[ x + 84 >> 0 ] | 0 ) )z = f[ ( f[ x + 68 >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else z = w; f[ i >> 2 ] = z; w = b[ x + 24 >> 0 ] | 0; f[ h >> 2 ] = f[ i >> 2 ]; jb( x, h, w, k ) | 0; w = f[ ( f[ s >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] | 0; f[ l >> 2 ] = 0; f[ l + 4 >> 2 ] = 0; f[ l + 8 >> 2 ] = 0; f[ l + 12 >> 2 ] = 0; f[ l + 16 >> 2 ] = 0; f[ l + 20 >> 2 ] = 0; s = f[ a >> 2 ] | 0; if ( ! ( b[ s + 84 >> 0 ] | 0 ) )A = f[ ( f[ s + 68 >> 2 ] | 0 ) + ( w << 2 ) >> 2 ] | 0; else A = w; f[ i >> 2 ] = A; w = b[ s + 24 >> 0 ] | 0; f[ h >> 2 ] = f[ i >> 2 ]; jb( s, h, w, l ) | 0; w = l; s = k; x = f[ s >> 2 ] | 0; B = f[ s + 4 >> 2 ] | 0; s = Tj( f[ w >> 2 ] | 0, f[ w + 4 >> 2 ] | 0, x | 0, B | 0 ) | 0; w = I; C = l + 8 | 0; D = k + 8 | 0; E = f[ D >> 2 ] | 0; F = f[ D + 4 >> 2 ] | 0; D = Tj( f[ C >> 2 ] | 0, f[ C + 4 >> 2 ] | 0, E | 0, F | 0 ) | 0; C = I; G = l + 16 | 0; H = k + 16 | 0; J = f[ H >> 2 ] | 0; K = f[ H + 4 >> 2 ] | 0; H = Tj( f[ G >> 2 ] | 0, f[ G + 4 >> 2 ] | 0, J | 0, K | 0 ) | 0; G = I; L = gj( s | 0, w | 0, s | 0, w | 0 ) | 0; M = I; N = gj( D | 0, C | 0, D | 0, C | 0 ) | 0; O = Rj( N | 0, I | 0, L | 0, M | 0 ) | 0; M = I; L = gj( H | 0, G | 0, H | 0, G | 0 ) | 0; N = Rj( O | 0, M | 0, L | 0, I | 0 ) | 0; L = I; if ( ( N | 0 ) == 0 & ( L | 0 ) == 0 ) break; M = j; O = Tj( f[ M >> 2 ] | 0, f[ M + 4 >> 2 ] | 0, x | 0, B | 0 ) | 0; B = I; x = j + 8 | 0; M = Tj( f[ x >> 2 ] | 0, f[ x + 4 >> 2 ] | 0, E | 0, F | 0 ) | 0; F = I; E = j + 16 | 0; x = Tj( f[ E >> 2 ] | 0, f[ E + 4 >> 2 ] | 0, J | 0, K | 0 ) | 0; K = I; J = gj( O | 0, B | 0, s | 0, w | 0 ) | 0; E = I; P = gj( M | 0, F | 0, D | 0, C | 0 ) | 0; Q = Rj( P | 0, I | 0, J | 0, E | 0 ) | 0; E = I; J = gj( x | 0, K | 0, H | 0, G | 0 ) | 0; P = Rj( Q | 0, E | 0, J | 0, I | 0 ) | 0; J = I; E = Tj( t | 0, ( ( t | 0 ) < 0 ) << 31 >> 31 | 0, c | 0, m | 0 ) | 0; t = I; Q = Tj( v | 0, ( ( v | 0 ) < 0 ) << 31 >> 31 | 0, r | 0, o | 0 ) | 0; v = I; R = gj( N | 0, L | 0, c | 0, m | 0 ) | 0; m = I; c = gj( N | 0, L | 0, r | 0, o | 0 ) | 0; o = I; r = gj( P | 0, J | 0, E | 0, t | 0 ) | 0; S = I; T = gj( P | 0, J | 0, Q | 0, v | 0 ) | 0; U = I; V = Rj( r | 0, S | 0, R | 0, m | 0 ) | 0; m = I; R = Rj( T | 0, U | 0, c | 0, o | 0 ) | 0; o = I; c = gj( P | 0, J | 0, s | 0, w | 0 ) | 0; w = I; s = gj( P | 0, J | 0, D | 0, C | 0 ) | 0; C = I; D = gj( P | 0, J | 0, H | 0, G | 0 ) | 0; G = I; H = Ug( c | 0, w | 0, N | 0, L | 0 ) | 0; w = I; c = Ug( s | 0, C | 0, N | 0, L | 0 ) | 0; C = I; s = Ug( D | 0, G | 0, N | 0, L | 0 ) | 0; G = I; D = Tj( O | 0, B | 0, H | 0, w | 0 ) | 0; w = I; H = Tj( M | 0, F | 0, c | 0, C | 0 ) | 0; C = I; c = Tj( x | 0, K | 0, s | 0, G | 0 ) | 0; G = I; s = gj( D | 0, w | 0, D | 0, w | 0 ) | 0; w = I; D = gj( H | 0, C | 0, H | 0, C | 0 ) | 0; C = Rj( D | 0, I | 0, s | 0, w | 0 ) | 0; w = I; s = gj( c | 0, G | 0, c | 0, G | 0 ) | 0; G = Rj( C | 0, w | 0, s | 0, I | 0 ) | 0; s = I; w = Tj( 0, 0, E | 0, t | 0 ) | 0; t = I; E = gj( G | 0, s | 0, N | 0, L | 0 ) | 0; s = I; switch ( E | 0 ) {

					case 0: {

						if ( ! s ) {

							W = 0; X = 0;

						} else {

							Y = 1; Z = 0; _ = E; $ = s; aa = 22;

						} break;

					} case 1: {

						if ( ! s ) {

							ba = 1; ca = 0; aa = 23;

						} else {

							Y = 1; Z = 0; _ = E; $ = s; aa = 22;

						} break;

					} default: {

						Y = 1; Z = 0; _ = E; $ = s; aa = 22;

					}

				} if ( ( aa | 0 ) == 22 ) while ( 1 ) {

					aa = 0; G = Oj( Y | 0, Z | 0, 1 ) | 0; C = I; c = _; _ = Uj( _ | 0, $ | 0, 2 ) | 0; if ( ! ( $ >>> 0 > 0 | ( $ | 0 ) == 0 & c >>> 0 > 7 ) ) {

						ba = G; ca = C; aa = 23; break;

					} else {

						Y = G; Z = C; $ = I; aa = 22;

					}

				} if ( ( aa | 0 ) == 23 ) while ( 1 ) {

					aa = 0; C = Fl( E | 0, s | 0, ba | 0, ca | 0 ) | 0; G = Rj( C | 0, I | 0, ba | 0, ca | 0 ) | 0; C = Uj( G | 0, I | 0, 1 ) | 0; G = I; c = gj( C | 0, G | 0, C | 0, G | 0 ) | 0; D = I; if ( D >>> 0 > s >>> 0 | ( D | 0 ) == ( s | 0 ) & c >>> 0 > E >>> 0 ) {

						ba = C; ca = G; aa = 23;

					} else {

						W = C; X = G; break;

					}

				}E = gj( W | 0, X | 0, Q | 0, v | 0 ) | 0; s = I; G = gj( W | 0, X | 0, w | 0, t | 0 ) | 0; C = I; c = a + 20 | 0; D = ( f[ c >> 2 ] | 0 ) + - 1 | 0; H = ( 1 << ( D & 31 ) & f[ ( f[ a + 16 >> 2 ] | 0 ) + ( D >>> 5 << 2 ) >> 2 ] | 0 ) != 0; f[ c >> 2 ] = D; D = Tj( 0, 0, E | 0, s | 0 ) | 0; c = Rj( V | 0, m | 0, ( H ? E : D ) | 0, ( H ? s : I ) | 0 ) | 0; s = I; D = Tj( 0, 0, G | 0, C | 0 ) | 0; E = Rj( R | 0, o | 0, ( H ? G : D ) | 0, ( H ? C : I ) | 0 ) | 0; C = I; H = Ug( c | 0, s | 0, N | 0, L | 0 ) | 0; s = Ug( E | 0, C | 0, N | 0, L | 0 ) | 0; f[ a + 8 >> 2 ] = H; f[ a + 12 >> 2 ] = s; u = g; return;

			} while ( 0 );do if ( q )da = n << 1; else {

				if ( ( e | 0 ) > 0 ) {

					da = ( e << 1 ) + - 2 | 0; break;

				}X = a + 8 | 0; f[ X >> 2 ] = 0; f[ X + 4 >> 2 ] = 0; u = g; return;

			} while ( 0 );f[ a + 8 >> 2 ] = f[ d + ( da << 2 ) >> 2 ]; f[ a + 12 >> 2 ] = f[ d + ( da + 1 << 2 ) >> 2 ]; u = g; return;

		} function vb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0, ua = 0, va = 0, wa = 0, xa = 0, ya = 0, za = 0; e = u; u = u + 96 | 0; g = e + 92 | 0; h = e + 88 | 0; i = e + 72 | 0; j = e + 48 | 0; k = e + 24 | 0; l = e; m = a + 16 | 0; n = f[ m >> 2 ] | 0; o = f[ c >> 2 ] | 0; f[ i >> 2 ] = n; f[ i + 4 >> 2 ] = o; c = i + 8 | 0; f[ c >> 2 ] = o; b[ i + 12 >> 0 ] = 1; p = ( o | 0 ) == - 1; if ( p )q = - 1; else q = f[ ( f[ n >> 2 ] | 0 ) + ( o << 2 ) >> 2 ] | 0; n = a + 20 | 0; r = f[ n >> 2 ] | 0; s = f[ r >> 2 ] | 0; if ( ( f[ r + 4 >> 2 ] | 0 ) - s >> 2 >>> 0 <= q >>> 0 )um( r ); r = a + 8 | 0; t = f[ ( f[ r >> 2 ] | 0 ) + ( f[ s + ( q << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; q = a + 4 | 0; s = f[ q >> 2 ] | 0; if ( ! ( b[ s + 84 >> 0 ] | 0 ) )v = f[ ( f[ s + 68 >> 2 ] | 0 ) + ( t << 2 ) >> 2 ] | 0; else v = t; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; f[ j + 12 >> 2 ] = 0; f[ j + 16 >> 2 ] = 0; f[ j + 20 >> 2 ] = 0; f[ h >> 2 ] = v; v = b[ s + 24 >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; jb( s, g, v, j ) | 0; v = a + 28 | 0; a = ( f[ v >> 2 ] | 0 ) == 0; a:do if ( ! p ) {

				s = k + 8 | 0; t = j + 8 | 0; w = k + 16 | 0; x = j + 16 | 0; y = l + 8 | 0; z = l + 16 | 0; A = o; B = o; C = 0; D = 0; E = 0; F = 0; G = 0; H = 0; J = a; K = o; while ( 1 ) {

					do if ( J ) {

						L = K + 1 | 0; if ( ( K | 0 ) == - 1 ) {

							M = A; N = - 1; O = - 1; P = - 1; break;

						}Q = ( ( L >>> 0 ) % 3 | 0 | 0 ) == 0 ? K + - 2 | 0 : L; if ( ( A | 0 ) != - 1 ) if ( ! ( ( A >>> 0 ) % 3 | 0 ) ) {

							R = A; S = A + 2 | 0; T = Q; U = A; V = 19; break;

						} else {

							R = A; S = A + - 1 | 0; T = Q; U = A; V = 19; break;

						} else {

							R = - 1; S = - 1; T = Q; U = - 1; V = 19;

						}

					} else {

						Q = B + 1 | 0; L = ( ( Q >>> 0 ) % 3 | 0 | 0 ) == 0 ? B + - 2 | 0 : Q; if ( ! ( ( B >>> 0 ) % 3 | 0 ) ) {

							R = A; S = B + 2 | 0; T = L; U = K; V = 19; break;

						} else {

							R = A; S = B + - 1 | 0; T = L; U = K; V = 19; break;

						}

					} while ( 0 );if ( ( V | 0 ) == 19 ) {

						V = 0; if ( ( T | 0 ) == - 1 ) {

							M = R; N = - 1; O = S; P = U;

						} else {

							M = R; N = f[ ( f[ f[ m >> 2 ] >> 2 ] | 0 ) + ( T << 2 ) >> 2 ] | 0; O = S; P = U;

						}

					}W = f[ n >> 2 ] | 0; L = f[ W >> 2 ] | 0; if ( ( f[ W + 4 >> 2 ] | 0 ) - L >> 2 >>> 0 <= N >>> 0 ) {

						V = 22; break;

					}Q = f[ ( f[ r >> 2 ] | 0 ) + ( f[ L + ( N << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; L = f[ q >> 2 ] | 0; if ( ! ( b[ L + 84 >> 0 ] | 0 ) )X = f[ ( f[ L + 68 >> 2 ] | 0 ) + ( Q << 2 ) >> 2 ] | 0; else X = Q; f[ k >> 2 ] = 0; f[ k + 4 >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; f[ k + 12 >> 2 ] = 0; f[ k + 16 >> 2 ] = 0; f[ k + 20 >> 2 ] = 0; f[ h >> 2 ] = X; Q = b[ L + 24 >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; jb( L, g, Q, k ) | 0; if ( ( O | 0 ) == - 1 )Y = - 1; else Y = f[ ( f[ f[ m >> 2 ] >> 2 ] | 0 ) + ( O << 2 ) >> 2 ] | 0; Z = f[ n >> 2 ] | 0; Q = f[ Z >> 2 ] | 0; if ( ( f[ Z + 4 >> 2 ] | 0 ) - Q >> 2 >>> 0 <= Y >>> 0 ) {

						V = 28; break;

					}L = f[ ( f[ r >> 2 ] | 0 ) + ( f[ Q + ( Y << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; Q = f[ q >> 2 ] | 0; if ( ! ( b[ Q + 84 >> 0 ] | 0 ) )_ = f[ ( f[ Q + 68 >> 2 ] | 0 ) + ( L << 2 ) >> 2 ] | 0; else _ = L; f[ l >> 2 ] = 0; f[ l + 4 >> 2 ] = 0; f[ l + 8 >> 2 ] = 0; f[ l + 12 >> 2 ] = 0; f[ l + 16 >> 2 ] = 0; f[ l + 20 >> 2 ] = 0; f[ h >> 2 ] = _; L = b[ Q + 24 >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; jb( Q, g, L, l ) | 0; L = k; Q = j; $ = f[ Q >> 2 ] | 0; aa = f[ Q + 4 >> 2 ] | 0; Q = Tj( f[ L >> 2 ] | 0, f[ L + 4 >> 2 ] | 0, $ | 0, aa | 0 ) | 0; L = I; ba = s; ca = t; da = f[ ca >> 2 ] | 0; ea = f[ ca + 4 >> 2 ] | 0; ca = Tj( f[ ba >> 2 ] | 0, f[ ba + 4 >> 2 ] | 0, da | 0, ea | 0 ) | 0; ba = I; fa = w; ga = x; ha = f[ ga >> 2 ] | 0; ia = f[ ga + 4 >> 2 ] | 0; ga = Tj( f[ fa >> 2 ] | 0, f[ fa + 4 >> 2 ] | 0, ha | 0, ia | 0 ) | 0; fa = I; ja = l; ka = Tj( f[ ja >> 2 ] | 0, f[ ja + 4 >> 2 ] | 0, $ | 0, aa | 0 ) | 0; aa = I; $ = y; ja = Tj( f[ $ >> 2 ] | 0, f[ $ + 4 >> 2 ] | 0, da | 0, ea | 0 ) | 0; ea = I; da = z; $ = Tj( f[ da >> 2 ] | 0, f[ da + 4 >> 2 ] | 0, ha | 0, ia | 0 ) | 0; ia = I; ha = gj( $ | 0, ia | 0, ca | 0, ba | 0 ) | 0; da = I; la = gj( ja | 0, ea | 0, ga | 0, fa | 0 ) | 0; ma = I; na = gj( ka | 0, aa | 0, ga | 0, fa | 0 ) | 0; fa = I; ga = gj( $ | 0, ia | 0, Q | 0, L | 0 ) | 0; ia = I; $ = gj( ja | 0, ea | 0, Q | 0, L | 0 ) | 0; L = I; Q = gj( ka | 0, aa | 0, ca | 0, ba | 0 ) | 0; ba = I; ca = Tj( C | 0, D | 0, la | 0, ma | 0 ) | 0; ma = Rj( ca | 0, I | 0, ha | 0, da | 0 ) | 0; da = I; ha = Rj( na | 0, fa | 0, E | 0, F | 0 ) | 0; fa = Tj( ha | 0, I | 0, ga | 0, ia | 0 ) | 0; ia = I; ga = Tj( G | 0, H | 0, Q | 0, ba | 0 ) | 0; ba = Rj( ga | 0, I | 0, $ | 0, L | 0 ) | 0; L = I; Fe( i ); B = f[ c >> 2 ] | 0; $ = ( f[ v >> 2 ] | 0 ) == 0; if ( ( B | 0 ) == - 1 ) {

						oa = $; pa = da; qa = ma; ra = ia; sa = fa; ta = L; ua = ba; break a;

					} else {

						A = M; C = ma; D = da; E = fa; F = ia; G = ba; H = L; J = $; K = P;

					}

				} if ( ( V | 0 ) == 22 )um( W ); else if ( ( V | 0 ) == 28 )um( Z );

			} else {

				oa = a; pa = 0; qa = 0; ra = 0; sa = 0; ta = 0; ua = 0;

			} while ( 0 );a = ( pa | 0 ) > - 1 | ( pa | 0 ) == - 1 & qa >>> 0 > 4294967295; Z = Tj( 0, 0, qa | 0, pa | 0 ) | 0; V = a ? pa : I; W = ( ra | 0 ) > - 1 | ( ra | 0 ) == - 1 & sa >>> 0 > 4294967295; P = Tj( 0, 0, sa | 0, ra | 0 ) | 0; M = W ? ra : I; v = ( ta | 0 ) > - 1 | ( ta | 0 ) == - 1 & ua >>> 0 > 4294967295; c = Tj( 0, 0, ua | 0, ta | 0 ) | 0; i = Rj( ( W ? sa : P ) | 0, M | 0, ( v ? ua : c ) | 0, ( v ? ta : I ) | 0 ) | 0; v = Rj( i | 0, I | 0, ( a ? qa : Z ) | 0, V | 0 ) | 0; V = I; if ( oa ) {

				if ( ( v | 0 ) <= 536870912 ) {

					va = qa; wa = sa; xa = ua; f[ d >> 2 ] = va; ya = d + 4 | 0; f[ ya >> 2 ] = wa; za = d + 8 | 0; f[ za >> 2 ] = xa; u = e; return;

				}oa = Uj( v | 0, V | 0, 29 ) | 0; Z = oa & 7; oa = Ug( qa | 0, pa | 0, Z | 0, 0 ) | 0; a = Ug( sa | 0, ra | 0, Z | 0, 0 ) | 0; i = Ug( ua | 0, ta | 0, Z | 0, 0 ) | 0; va = oa; wa = a; xa = i; f[ d >> 2 ] = va; ya = d + 4 | 0; f[ ya >> 2 ] = wa; za = d + 8 | 0; f[ za >> 2 ] = xa; u = e; return;

			} else {

				if ( ! ( ( V | 0 ) > 0 | ( V | 0 ) == 0 & v >>> 0 > 536870912 ) ) {

					va = qa; wa = sa; xa = ua; f[ d >> 2 ] = va; ya = d + 4 | 0; f[ ya >> 2 ] = wa; za = d + 8 | 0; f[ za >> 2 ] = xa; u = e; return;

				}i = Uj( v | 0, V | 0, 29 ) | 0; V = I; v = Ug( qa | 0, pa | 0, i | 0, V | 0 ) | 0; pa = Ug( sa | 0, ra | 0, i | 0, V | 0 ) | 0; ra = Ug( ua | 0, ta | 0, i | 0, V | 0 ) | 0; va = v; wa = pa; xa = ra; f[ d >> 2 ] = va; ya = d + 4 | 0; f[ ya >> 2 ] = wa; za = d + 8 | 0; f[ za >> 2 ] = xa; u = e; return;

			}

		} function wb( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0; c = u; u = u + 16 | 0; d = c + 8 | 0; e = c; g = f[ b >> 2 ] | 0; if ( ( g | 0 ) == - 1 ) {

				u = c; return;

			}h = ( g >>> 0 ) / 3 | 0; i = a + 12 | 0; if ( f[ ( f[ i >> 2 ] | 0 ) + ( h >>> 5 << 2 ) >> 2 ] & 1 << ( h & 31 ) | 0 ) {

				u = c; return;

			}h = a + 56 | 0; j = f[ h >> 2 ] | 0; k = a + 60 | 0; l = f[ k >> 2 ] | 0; if ( ( l | 0 ) == ( j | 0 ) )m = j; else {

				n = l + ( ~ ( ( l + - 4 - j | 0 ) >>> 2 ) << 2 ) | 0; f[ k >> 2 ] = n; m = n;

			}n = a + 64 | 0; if ( ( m | 0 ) == ( f[ n >> 2 ] | 0 ) )xf( h, b ); else {

				f[ m >> 2 ] = g; f[ k >> 2 ] = m + 4;

			}m = f[ a >> 2 ] | 0; g = f[ b >> 2 ] | 0; j = g + 1 | 0; if ( ( g | 0 ) != - 1 ) {

				l = ( ( j >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : j; if ( ( l | 0 ) == - 1 )o = - 1; else o = f[ ( f[ m >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] | 0; l = ( ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + g | 0; if ( ( l | 0 ) == - 1 ) {

					p = o; q = - 1;

				} else {

					p = o; q = f[ ( f[ m >> 2 ] | 0 ) + ( l << 2 ) >> 2 ] | 0;

				}

			} else {

				p = - 1; q = - 1;

			}l = a + 24 | 0; m = f[ l >> 2 ] | 0; o = m + ( p >>> 5 << 2 ) | 0; g = 1 << ( p & 31 ); j = f[ o >> 2 ] | 0; if ( ! ( j & g ) ) {

				f[ o >> 2 ] = j | g; g = f[ b >> 2 ] | 0; j = g + 1 | 0; if ( ( g | 0 ) == - 1 )r = - 1; else r = ( ( j >>> 0 ) % 3 | 0 | 0 ) == 0 ? g + - 2 | 0 : j; f[ e >> 2 ] = r; j = f[ ( f[ ( f[ a + 44 >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( r >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( r >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; r = f[ a + 48 >> 2 ] | 0; f[ d >> 2 ] = j; g = f[ r + 4 >> 2 ] | 0; r = g + 4 | 0; o = f[ r >> 2 ] | 0; if ( ( o | 0 ) == ( f[ g + 8 >> 2 ] | 0 ) )xf( g, d ); else {

					f[ o >> 2 ] = j; f[ r >> 2 ] = o + 4;

				}o = a + 40 | 0; r = f[ o >> 2 ] | 0; j = r + 4 | 0; g = f[ j >> 2 ] | 0; if ( ( g | 0 ) == ( f[ r + 8 >> 2 ] | 0 ) ) {

					xf( r, e ); s = f[ o >> 2 ] | 0;

				} else {

					f[ g >> 2 ] = f[ e >> 2 ]; f[ j >> 2 ] = g + 4; s = r;

				}r = s + 24 | 0; f[ ( f[ s + 12 >> 2 ] | 0 ) + ( p << 2 ) >> 2 ] = f[ r >> 2 ]; f[ r >> 2 ] = ( f[ r >> 2 ] | 0 ) + 1; t = f[ l >> 2 ] | 0;

			} else t = m; m = t + ( q >>> 5 << 2 ) | 0; t = 1 << ( q & 31 ); r = f[ m >> 2 ] | 0; if ( ! ( r & t ) ) {

				f[ m >> 2 ] = r | t; t = f[ b >> 2 ] | 0; do if ( ( t | 0 ) != - 1 ) if ( ! ( ( t >>> 0 ) % 3 | 0 ) ) {

					v = t + 2 | 0; break;

				} else {

					v = t + - 1 | 0; break;

				} else v = - 1; while ( 0 );f[ e >> 2 ] = v; t = f[ ( f[ ( f[ a + 44 >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( v >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( v >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; v = f[ a + 48 >> 2 ] | 0; f[ d >> 2 ] = t; r = f[ v + 4 >> 2 ] | 0; v = r + 4 | 0; m = f[ v >> 2 ] | 0; if ( ( m | 0 ) == ( f[ r + 8 >> 2 ] | 0 ) )xf( r, d ); else {

					f[ m >> 2 ] = t; f[ v >> 2 ] = m + 4;

				}m = a + 40 | 0; v = f[ m >> 2 ] | 0; t = v + 4 | 0; r = f[ t >> 2 ] | 0; if ( ( r | 0 ) == ( f[ v + 8 >> 2 ] | 0 ) ) {

					xf( v, e ); w = f[ m >> 2 ] | 0;

				} else {

					f[ r >> 2 ] = f[ e >> 2 ]; f[ t >> 2 ] = r + 4; w = v;

				}v = w + 24 | 0; f[ ( f[ w + 12 >> 2 ] | 0 ) + ( q << 2 ) >> 2 ] = f[ v >> 2 ]; f[ v >> 2 ] = ( f[ v >> 2 ] | 0 ) + 1;

			}v = f[ h >> 2 ] | 0; q = f[ k >> 2 ] | 0; if ( ( v | 0 ) == ( q | 0 ) ) {

				u = c; return;

			}w = a + 44 | 0; r = a + 48 | 0; t = a + 40 | 0; m = q; q = v; while ( 1 ) {

				v = f[ m + - 4 >> 2 ] | 0; f[ b >> 2 ] = v; p = ( v >>> 0 ) / 3 | 0; if ( ( v | 0 ) != - 1 ? ( v = f[ i >> 2 ] | 0, ( f[ v + ( p >>> 5 << 2 ) >> 2 ] & 1 << ( p & 31 ) | 0 ) == 0 ) : 0 ) {

					s = p; p = v; a:while ( 1 ) {

						v = p + ( s >>> 5 << 2 ) | 0; f[ v >> 2 ] = f[ v >> 2 ] | 1 << ( s & 31 ); v = f[ b >> 2 ] | 0; if ( ( v | 0 ) == - 1 )x = - 1; else x = f[ ( f[ f[ a >> 2 ] >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0; g = ( f[ l >> 2 ] | 0 ) + ( x >>> 5 << 2 ) | 0; j = 1 << ( x & 31 ); o = f[ g >> 2 ] | 0; do if ( ! ( j & o ) ) {

							y = f[ a >> 2 ] | 0; z = f[ ( f[ y + 24 >> 2 ] | 0 ) + ( x << 2 ) >> 2 ] | 0; A = z + 1 | 0; if ( ( ( z | 0 ) != - 1 ? ( B = ( ( A >>> 0 ) % 3 | 0 | 0 ) == 0 ? z + - 2 | 0 : A, ( B | 0 ) != - 1 ) : 0 ) ? ( A = f[ ( f[ y + 12 >> 2 ] | 0 ) + ( B << 2 ) >> 2 ] | 0, B = A + 1 | 0, ( A | 0 ) != - 1 ) : 0 )C = ( ( ( ( B >>> 0 ) % 3 | 0 | 0 ) == 0 ? A + - 2 | 0 : B ) | 0 ) == - 1; else C = 1; f[ g >> 2 ] = o | j; B = f[ b >> 2 ] | 0; f[ e >> 2 ] = B; A = f[ ( f[ ( f[ w >> 2 ] | 0 ) + 96 >> 2 ] | 0 ) + ( ( ( B >>> 0 ) / 3 | 0 ) * 12 | 0 ) + ( ( ( B >>> 0 ) % 3 | 0 ) << 2 ) >> 2 ] | 0; B = f[ r >> 2 ] | 0; f[ d >> 2 ] = A; y = f[ B + 4 >> 2 ] | 0; B = y + 4 | 0; z = f[ B >> 2 ] | 0; if ( ( z | 0 ) == ( f[ y + 8 >> 2 ] | 0 ) )xf( y, d ); else {

								f[ z >> 2 ] = A; f[ B >> 2 ] = z + 4;

							}z = f[ t >> 2 ] | 0; B = z + 4 | 0; A = f[ B >> 2 ] | 0; if ( ( A | 0 ) == ( f[ z + 8 >> 2 ] | 0 ) ) {

								xf( z, e ); D = f[ t >> 2 ] | 0;

							} else {

								f[ A >> 2 ] = f[ e >> 2 ]; f[ B >> 2 ] = A + 4; D = z;

							}z = D + 24 | 0; f[ ( f[ D + 12 >> 2 ] | 0 ) + ( x << 2 ) >> 2 ] = f[ z >> 2 ]; f[ z >> 2 ] = ( f[ z >> 2 ] | 0 ) + 1; if ( C ) {

								E = f[ b >> 2 ] | 0; F = 60; break;

							}z = f[ a >> 2 ] | 0; A = f[ b >> 2 ] | 0; do if ( ( A | 0 ) == - 1 )G = - 1; else {

								B = A + 1 | 0; y = ( ( B >>> 0 ) % 3 | 0 | 0 ) == 0 ? A + - 2 | 0 : B; if ( ( y | 0 ) == - 1 ) {

									G = - 1; break;

								}G = f[ ( f[ z + 12 >> 2 ] | 0 ) + ( y << 2 ) >> 2 ] | 0;

							} while ( 0 );f[ b >> 2 ] = G; H = ( G >>> 0 ) / 3 | 0;

						} else {

							E = v; F = 60;

						} while ( 0 );if ( ( F | 0 ) == 60 ) {

							F = 0; v = f[ a >> 2 ] | 0; if ( ( E | 0 ) == - 1 ) {

								F = 61; break;

							}j = E + 1 | 0; o = ( ( j >>> 0 ) % 3 | 0 | 0 ) == 0 ? E + - 2 | 0 : j; if ( ( o | 0 ) == - 1 )I = - 1; else I = f[ ( f[ v + 12 >> 2 ] | 0 ) + ( o << 2 ) >> 2 ] | 0; f[ d >> 2 ] = I; o = ( ( ( E >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + E | 0; if ( ( o | 0 ) == - 1 )J = - 1; else J = f[ ( f[ v + 12 >> 2 ] | 0 ) + ( o << 2 ) >> 2 ] | 0; o = ( I | 0 ) == - 1; v = ( I >>> 0 ) / 3 | 0; j = o ? - 1 : v; g = ( J | 0 ) == - 1; z = ( J >>> 0 ) / 3 | 0; A = g ? - 1 : z; do if ( ! o ) {

								y = f[ i >> 2 ] | 0; if ( f[ y + ( j >>> 5 << 2 ) >> 2 ] & 1 << ( j & 31 ) | 0 ) {

									F = 68; break;

								} if ( g ) {

									K = I; L = v; break;

								} if ( ! ( f[ y + ( A >>> 5 << 2 ) >> 2 ] & 1 << ( A & 31 ) ) ) {

									F = 73; break a;

								} else {

									K = I; L = v;

								}

							} else F = 68; while ( 0 );if ( ( F | 0 ) == 68 ) {

								F = 0; if ( g ) {

									F = 70; break;

								} if ( ! ( f[ ( f[ i >> 2 ] | 0 ) + ( A >>> 5 << 2 ) >> 2 ] & 1 << ( A & 31 ) ) ) {

									K = J; L = z;

								} else {

									F = 70; break;

								}

							}f[ b >> 2 ] = K; H = L;

						}s = H; p = f[ i >> 2 ] | 0;

					} do if ( ( F | 0 ) == 61 ) {

						F = 0; f[ d >> 2 ] = - 1; F = 70;

					} else if ( ( F | 0 ) == 73 ) {

						F = 0; p = f[ k >> 2 ] | 0; f[ p + - 4 >> 2 ] = J; if ( ( p | 0 ) == ( f[ n >> 2 ] | 0 ) ) {

							xf( h, d ); M = f[ k >> 2 ] | 0; break;

						} else {

							f[ p >> 2 ] = f[ d >> 2 ]; s = p + 4 | 0; f[ k >> 2 ] = s; M = s; break;

						}

					} while ( 0 );if ( ( F | 0 ) == 70 ) {

						F = 0; s = ( f[ k >> 2 ] | 0 ) + - 4 | 0; f[ k >> 2 ] = s; M = s;

					}N = f[ h >> 2 ] | 0; O = M;

				} else {

					s = m + - 4 | 0; f[ k >> 2 ] = s; N = q; O = s;

				} if ( ( N | 0 ) == ( O | 0 ) ) break; else {

					m = O; q = N;

				}

			}u = c; return;

		} function xb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = La, K = La, L = La, M = 0, N = 0, O = 0, P = 0; e = u; u = u + 64 | 0; g = e + 40 | 0; i = e + 16 | 0; j = e; k = cc( a, c ) | 0; if ( k | 0 ) {

				f[ i >> 2 ] = k; f[ g >> 2 ] = f[ i >> 2 ]; dd( a, g ) | 0;

			}f[ j >> 2 ] = 0; k = j + 4 | 0; f[ k >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; l = f[ d >> 2 ] | 0; m = ( f[ d + 4 >> 2 ] | 0 ) - l | 0; if ( ! m ) {

				o = 0; p = l;

			} else {

				jf( j, m ); o = f[ j >> 2 ] | 0; p = f[ d >> 2 ] | 0;

			}ge( o | 0, p | 0, m | 0 ) | 0; Rf( i, c ); c = i + 12 | 0; f[ c >> 2 ] = 0; m = i + 16 | 0; f[ m >> 2 ] = 0; f[ i + 20 >> 2 ] = 0; p = f[ k >> 2 ] | 0; o = f[ j >> 2 ] | 0; d = p - o | 0; if ( ! d ) {

				q = o; r = p; s = 0;

			} else {

				jf( c, d ); q = f[ j >> 2 ] | 0; r = f[ k >> 2 ] | 0; s = f[ c >> 2 ] | 0;

			}ge( s | 0, q | 0, r - q | 0 ) | 0; q = i + 11 | 0; r = b[ q >> 0 ] | 0; s = r << 24 >> 24 < 0; c = s ? f[ i >> 2 ] | 0 : i; d = s ? f[ i + 4 >> 2 ] | 0 : r & 255; if ( d >>> 0 > 3 ) {

				r = c; s = d; p = d; while ( 1 ) {

					o = X( h[ r >> 0 ] | h[ r + 1 >> 0 ] << 8 | h[ r + 2 >> 0 ] << 16 | h[ r + 3 >> 0 ] << 24, 1540483477 ) | 0; s = ( X( o >>> 24 ^ o, 1540483477 ) | 0 ) ^ ( X( s, 1540483477 ) | 0 ); p = p + - 4 | 0; if ( p >>> 0 <= 3 ) break; else r = r + 4 | 0;

				}r = d + - 4 | 0; p = r & - 4; t = r - p | 0; v = c + ( p + 4 ) | 0; w = s;

			} else {

				t = d; v = c; w = d;

			} switch ( t | 0 ) {

				case 3: {

					x = h[ v + 2 >> 0 ] << 16 ^ w; y = 12; break;

				} case 2: {

					x = w; y = 12; break;

				} case 1: {

					z = w; y = 13; break;

				} default:A = w;

			} if ( ( y | 0 ) == 12 ) {

				z = h[ v + 1 >> 0 ] << 8 ^ x; y = 13;

			} if ( ( y | 0 ) == 13 )A = X( z ^ h[ v >> 0 ], 1540483477 ) | 0; v = X( A >>> 13 ^ A, 1540483477 ) | 0; A = v >>> 15 ^ v; v = a + 4 | 0; z = f[ v >> 2 ] | 0; x = ( z | 0 ) == 0; a:do if ( ! x ) {

				w = z + - 1 | 0; t = ( w & z | 0 ) == 0; if ( ! t ) if ( A >>> 0 < z >>> 0 )B = A; else B = ( A >>> 0 ) % ( z >>> 0 ) | 0; else B = A & w; s = f[ ( f[ a >> 2 ] | 0 ) + ( B << 2 ) >> 2 ] | 0; if ( ( s | 0 ) != 0 ? ( p = f[ s >> 2 ] | 0, ( p | 0 ) != 0 ) : 0 ) {

					s = ( d | 0 ) == 0; if ( t ) {

						if ( s ) {

							t = p; while ( 1 ) {

								r = f[ t + 4 >> 2 ] | 0; if ( ! ( ( r | 0 ) == ( A | 0 ) | ( r & w | 0 ) == ( B | 0 ) ) ) {

									C = B; y = 54; break a;

								}r = b[ t + 8 + 11 >> 0 ] | 0; if ( ! ( ( r << 24 >> 24 < 0 ? f[ t + 12 >> 2 ] | 0 : r & 255 ) | 0 ) ) break a; t = f[ t >> 2 ] | 0; if ( ! t ) {

									C = B; y = 54; break a;

								}

							}

						} else D = p; while ( 1 ) {

							t = f[ D + 4 >> 2 ] | 0; if ( ! ( ( t | 0 ) == ( A | 0 ) | ( t & w | 0 ) == ( B | 0 ) ) ) {

								C = B; y = 54; break a;

							}t = D + 8 | 0; r = b[ t + 11 >> 0 ] | 0; o = r << 24 >> 24 < 0; l = r & 255; do if ( ( ( o ? f[ D + 12 >> 2 ] | 0 : l ) | 0 ) == ( d | 0 ) ) {

								r = f[ t >> 2 ] | 0; if ( o ) if ( ! ( jh( r, c, d ) | 0 ) ) break a; else break; if ( ( b[ c >> 0 ] | 0 ) == ( r & 255 ) << 24 >> 24 ) {

									r = t; E = l; F = c; do {

										E = E + - 1 | 0; r = r + 1 | 0; if ( ! E ) break a; F = F + 1 | 0;

									} while ( ( b[ r >> 0 ] | 0 ) == ( b[ F >> 0 ] | 0 ) );

								}

							} while ( 0 );D = f[ D >> 2 ] | 0; if ( ! D ) {

								C = B; y = 54; break a;

							}

						}

					} if ( s ) {

						w = p; while ( 1 ) {

							l = f[ w + 4 >> 2 ] | 0; if ( ( l | 0 ) != ( A | 0 ) ) {

								if ( l >>> 0 < z >>> 0 )G = l; else G = ( l >>> 0 ) % ( z >>> 0 ) | 0; if ( ( G | 0 ) != ( B | 0 ) ) {

									C = B; y = 54; break a;

								}

							}l = b[ w + 8 + 11 >> 0 ] | 0; if ( ! ( ( l << 24 >> 24 < 0 ? f[ w + 12 >> 2 ] | 0 : l & 255 ) | 0 ) ) break a; w = f[ w >> 2 ] | 0; if ( ! w ) {

								C = B; y = 54; break a;

							}

						}

					} else H = p; while ( 1 ) {

						w = f[ H + 4 >> 2 ] | 0; if ( ( w | 0 ) != ( A | 0 ) ) {

							if ( w >>> 0 < z >>> 0 )I = w; else I = ( w >>> 0 ) % ( z >>> 0 ) | 0; if ( ( I | 0 ) != ( B | 0 ) ) {

								C = B; y = 54; break a;

							}

						}w = H + 8 | 0; s = b[ w + 11 >> 0 ] | 0; l = s << 24 >> 24 < 0; t = s & 255; do if ( ( ( l ? f[ H + 12 >> 2 ] | 0 : t ) | 0 ) == ( d | 0 ) ) {

							s = f[ w >> 2 ] | 0; if ( l ) if ( ! ( jh( s, c, d ) | 0 ) ) break a; else break; if ( ( b[ c >> 0 ] | 0 ) == ( s & 255 ) << 24 >> 24 ) {

								s = w; o = t; F = c; do {

									o = o + - 1 | 0; s = s + 1 | 0; if ( ! o ) break a; F = F + 1 | 0;

								} while ( ( b[ s >> 0 ] | 0 ) == ( b[ F >> 0 ] | 0 ) );

							}

						} while ( 0 );H = f[ H >> 2 ] | 0; if ( ! H ) {

							C = B; y = 54; break;

						}

					}

				} else {

					C = B; y = 54;

				}

			} else {

				C = 0; y = 54;

			} while ( 0 );if ( ( y | 0 ) == 54 ) {

				Ue( g, a, A, i ); y = a + 12 | 0; J = $( ( ( f[ y >> 2 ] | 0 ) + 1 | 0 ) >>> 0 ); K = $( z >>> 0 ); L = $( n[ a + 16 >> 2 ] ); do if ( x | $( L * K ) < J ) {

					B = z << 1 | ( z >>> 0 < 3 | ( z + - 1 & z | 0 ) != 0 ) & 1; H = ~ ~ $( W( $( J / L ) ) ) >>> 0; Oe( a, B >>> 0 < H >>> 0 ? H : B ); B = f[ v >> 2 ] | 0; H = B + - 1 | 0; if ( ! ( H & B ) ) {

						M = B; N = H & A; break;

					} if ( A >>> 0 < B >>> 0 ) {

						M = B; N = A;

					} else {

						M = B; N = ( A >>> 0 ) % ( B >>> 0 ) | 0;

					}

				} else {

					M = z; N = C;

				} while ( 0 );C = f[ ( f[ a >> 2 ] | 0 ) + ( N << 2 ) >> 2 ] | 0; if ( ! C ) {

					z = a + 8 | 0; f[ f[ g >> 2 ] >> 2 ] = f[ z >> 2 ]; f[ z >> 2 ] = f[ g >> 2 ]; f[ ( f[ a >> 2 ] | 0 ) + ( N << 2 ) >> 2 ] = z; z = f[ g >> 2 ] | 0; N = f[ z >> 2 ] | 0; if ( ! N )O = g; else {

						A = f[ N + 4 >> 2 ] | 0; N = M + - 1 | 0; if ( N & M ) if ( A >>> 0 < M >>> 0 )P = A; else P = ( A >>> 0 ) % ( M >>> 0 ) | 0; else P = A & N; f[ ( f[ a >> 2 ] | 0 ) + ( P << 2 ) >> 2 ] = z; O = g;

					}

				} else {

					f[ f[ g >> 2 ] >> 2 ] = f[ C >> 2 ]; f[ C >> 2 ] = f[ g >> 2 ]; O = g;

				}f[ y >> 2 ] = ( f[ y >> 2 ] | 0 ) + 1; f[ O >> 2 ] = 0;

			}O = f[ i + 12 >> 2 ] | 0; if ( O | 0 ) {

				if ( ( f[ m >> 2 ] | 0 ) != ( O | 0 ) )f[ m >> 2 ] = O; dn( O );

			} if ( ( b[ q >> 0 ] | 0 ) < 0 )dn( f[ i >> 2 ] | 0 ); i = f[ j >> 2 ] | 0; if ( ! i ) {

				u = e; return;

			} if ( ( f[ k >> 2 ] | 0 ) != ( i | 0 ) )f[ k >> 2 ] = i; dn( i ); u = e; return;

		} function yb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0, da = 0, ea = 0, fa = 0, ga = 0, ha = 0, ia = 0, ja = 0, ka = 0, la = 0, ma = 0, na = 0, oa = 0, pa = 0, qa = 0, ra = 0, sa = 0, ta = 0; e = u; u = u + 96 | 0; g = e + 92 | 0; h = e + 88 | 0; i = e + 72 | 0; j = e + 48 | 0; k = e + 24 | 0; l = e; m = a + 16 | 0; n = f[ m >> 2 ] | 0; o = f[ c >> 2 ] | 0; f[ i >> 2 ] = n; f[ i + 4 >> 2 ] = o; c = i + 8 | 0; f[ c >> 2 ] = o; b[ i + 12 >> 0 ] = 1; p = f[ ( f[ n + 28 >> 2 ] | 0 ) + ( o << 2 ) >> 2 ] | 0; n = a + 20 | 0; q = f[ n >> 2 ] | 0; r = f[ q >> 2 ] | 0; if ( ( f[ q + 4 >> 2 ] | 0 ) - r >> 2 >>> 0 <= p >>> 0 )um( q ); q = a + 8 | 0; s = f[ ( f[ q >> 2 ] | 0 ) + ( f[ r + ( p << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; p = a + 4 | 0; r = f[ p >> 2 ] | 0; if ( ! ( b[ r + 84 >> 0 ] | 0 ) )t = f[ ( f[ r + 68 >> 2 ] | 0 ) + ( s << 2 ) >> 2 ] | 0; else t = s; f[ j >> 2 ] = 0; f[ j + 4 >> 2 ] = 0; f[ j + 8 >> 2 ] = 0; f[ j + 12 >> 2 ] = 0; f[ j + 16 >> 2 ] = 0; f[ j + 20 >> 2 ] = 0; f[ h >> 2 ] = t; t = b[ r + 24 >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; jb( r, g, t, j ) | 0; t = a + 28 | 0; a = ( f[ t >> 2 ] | 0 ) == 0; a:do if ( ( o | 0 ) != - 1 ) {

				r = k + 8 | 0; s = j + 8 | 0; v = k + 16 | 0; w = j + 16 | 0; x = l + 8 | 0; y = l + 16 | 0; z = o; A = o; B = 0; C = 0; D = 0; E = 0; F = 0; G = 0; H = a; J = o; while ( 1 ) {

					do if ( H ) {

						K = J + 1 | 0; if ( ( J | 0 ) != - 1 ) {

							L = ( ( K >>> 0 ) % 3 | 0 | 0 ) == 0 ? J + - 2 | 0 : K; if ( ( z | 0 ) != - 1 ) if ( ! ( ( z >>> 0 ) % 3 | 0 ) ) {

								M = z; N = z + 2 | 0; O = L; P = z; break;

							} else {

								M = z; N = z + - 1 | 0; O = L; P = z; break;

							} else {

								M = - 1; N = - 1; O = L; P = - 1;

							}

						} else {

							M = z; N = - 1; O = - 1; P = - 1;

						}

					} else {

						L = A + 1 | 0; K = ( ( L >>> 0 ) % 3 | 0 | 0 ) == 0 ? A + - 2 | 0 : L; if ( ! ( ( A >>> 0 ) % 3 | 0 ) ) {

							M = z; N = A + 2 | 0; O = K; P = J; break;

						} else {

							M = z; N = A + - 1 | 0; O = K; P = J; break;

						}

					} while ( 0 );K = f[ ( f[ ( f[ m >> 2 ] | 0 ) + 28 >> 2 ] | 0 ) + ( O << 2 ) >> 2 ] | 0; Q = f[ n >> 2 ] | 0; L = f[ Q >> 2 ] | 0; if ( ( f[ Q + 4 >> 2 ] | 0 ) - L >> 2 >>> 0 <= K >>> 0 ) {

						R = 17; break;

					}S = f[ ( f[ q >> 2 ] | 0 ) + ( f[ L + ( K << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; K = f[ p >> 2 ] | 0; if ( ! ( b[ K + 84 >> 0 ] | 0 ) )T = f[ ( f[ K + 68 >> 2 ] | 0 ) + ( S << 2 ) >> 2 ] | 0; else T = S; f[ k >> 2 ] = 0; f[ k + 4 >> 2 ] = 0; f[ k + 8 >> 2 ] = 0; f[ k + 12 >> 2 ] = 0; f[ k + 16 >> 2 ] = 0; f[ k + 20 >> 2 ] = 0; f[ h >> 2 ] = T; S = b[ K + 24 >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; jb( K, g, S, k ) | 0; S = f[ ( f[ ( f[ m >> 2 ] | 0 ) + 28 >> 2 ] | 0 ) + ( N << 2 ) >> 2 ] | 0; U = f[ n >> 2 ] | 0; K = f[ U >> 2 ] | 0; if ( ( f[ U + 4 >> 2 ] | 0 ) - K >> 2 >>> 0 <= S >>> 0 ) {

						R = 21; break;

					}L = f[ ( f[ q >> 2 ] | 0 ) + ( f[ K + ( S << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; S = f[ p >> 2 ] | 0; if ( ! ( b[ S + 84 >> 0 ] | 0 ) )V = f[ ( f[ S + 68 >> 2 ] | 0 ) + ( L << 2 ) >> 2 ] | 0; else V = L; f[ l >> 2 ] = 0; f[ l + 4 >> 2 ] = 0; f[ l + 8 >> 2 ] = 0; f[ l + 12 >> 2 ] = 0; f[ l + 16 >> 2 ] = 0; f[ l + 20 >> 2 ] = 0; f[ h >> 2 ] = V; L = b[ S + 24 >> 0 ] | 0; f[ g >> 2 ] = f[ h >> 2 ]; jb( S, g, L, l ) | 0; L = k; S = j; K = f[ S >> 2 ] | 0; W = f[ S + 4 >> 2 ] | 0; S = Tj( f[ L >> 2 ] | 0, f[ L + 4 >> 2 ] | 0, K | 0, W | 0 ) | 0; L = I; X = r; Y = s; Z = f[ Y >> 2 ] | 0; _ = f[ Y + 4 >> 2 ] | 0; Y = Tj( f[ X >> 2 ] | 0, f[ X + 4 >> 2 ] | 0, Z | 0, _ | 0 ) | 0; X = I; $ = v; aa = w; ba = f[ aa >> 2 ] | 0; ca = f[ aa + 4 >> 2 ] | 0; aa = Tj( f[ $ >> 2 ] | 0, f[ $ + 4 >> 2 ] | 0, ba | 0, ca | 0 ) | 0; $ = I; da = l; ea = Tj( f[ da >> 2 ] | 0, f[ da + 4 >> 2 ] | 0, K | 0, W | 0 ) | 0; W = I; K = x; da = Tj( f[ K >> 2 ] | 0, f[ K + 4 >> 2 ] | 0, Z | 0, _ | 0 ) | 0; _ = I; Z = y; K = Tj( f[ Z >> 2 ] | 0, f[ Z + 4 >> 2 ] | 0, ba | 0, ca | 0 ) | 0; ca = I; ba = gj( K | 0, ca | 0, Y | 0, X | 0 ) | 0; Z = I; fa = gj( da | 0, _ | 0, aa | 0, $ | 0 ) | 0; ga = I; ha = gj( ea | 0, W | 0, aa | 0, $ | 0 ) | 0; $ = I; aa = gj( K | 0, ca | 0, S | 0, L | 0 ) | 0; ca = I; K = gj( da | 0, _ | 0, S | 0, L | 0 ) | 0; L = I; S = gj( ea | 0, W | 0, Y | 0, X | 0 ) | 0; X = I; Y = Tj( B | 0, C | 0, fa | 0, ga | 0 ) | 0; ga = Rj( Y | 0, I | 0, ba | 0, Z | 0 ) | 0; Z = I; ba = Rj( ha | 0, $ | 0, D | 0, E | 0 ) | 0; $ = Tj( ba | 0, I | 0, aa | 0, ca | 0 ) | 0; ca = I; aa = Tj( F | 0, G | 0, S | 0, X | 0 ) | 0; X = Rj( aa | 0, I | 0, K | 0, L | 0 ) | 0; L = I; Ud( i ); A = f[ c >> 2 ] | 0; K = ( f[ t >> 2 ] | 0 ) == 0; if ( ( A | 0 ) == - 1 ) {

						ia = K; ja = Z; ka = ga; la = ca; ma = $; na = L; oa = X; break a;

					} else {

						z = M; B = ga; C = Z; D = $; E = ca; F = X; G = L; H = K; J = P;

					}

				} if ( ( R | 0 ) == 17 )um( Q ); else if ( ( R | 0 ) == 21 )um( U );

			} else {

				ia = a; ja = 0; ka = 0; la = 0; ma = 0; na = 0; oa = 0;

			} while ( 0 );a = ( ja | 0 ) > - 1 | ( ja | 0 ) == - 1 & ka >>> 0 > 4294967295; U = Tj( 0, 0, ka | 0, ja | 0 ) | 0; R = a ? ja : I; Q = ( la | 0 ) > - 1 | ( la | 0 ) == - 1 & ma >>> 0 > 4294967295; P = Tj( 0, 0, ma | 0, la | 0 ) | 0; M = Q ? la : I; t = ( na | 0 ) > - 1 | ( na | 0 ) == - 1 & oa >>> 0 > 4294967295; c = Tj( 0, 0, oa | 0, na | 0 ) | 0; i = Rj( ( Q ? ma : P ) | 0, M | 0, ( t ? oa : c ) | 0, ( t ? na : I ) | 0 ) | 0; t = Rj( i | 0, I | 0, ( a ? ka : U ) | 0, R | 0 ) | 0; R = I; if ( ia ) {

				if ( ( t | 0 ) <= 536870912 ) {

					pa = ka; qa = ma; ra = oa; f[ d >> 2 ] = pa; sa = d + 4 | 0; f[ sa >> 2 ] = qa; ta = d + 8 | 0; f[ ta >> 2 ] = ra; u = e; return;

				}ia = Uj( t | 0, R | 0, 29 ) | 0; U = ia & 7; ia = Ug( ka | 0, ja | 0, U | 0, 0 ) | 0; a = Ug( ma | 0, la | 0, U | 0, 0 ) | 0; i = Ug( oa | 0, na | 0, U | 0, 0 ) | 0; pa = ia; qa = a; ra = i; f[ d >> 2 ] = pa; sa = d + 4 | 0; f[ sa >> 2 ] = qa; ta = d + 8 | 0; f[ ta >> 2 ] = ra; u = e; return;

			} else {

				if ( ! ( ( R | 0 ) > 0 | ( R | 0 ) == 0 & t >>> 0 > 536870912 ) ) {

					pa = ka; qa = ma; ra = oa; f[ d >> 2 ] = pa; sa = d + 4 | 0; f[ sa >> 2 ] = qa; ta = d + 8 | 0; f[ ta >> 2 ] = ra; u = e; return;

				}i = Uj( t | 0, R | 0, 29 ) | 0; R = I; t = Ug( ka | 0, ja | 0, i | 0, R | 0 ) | 0; ja = Ug( ma | 0, la | 0, i | 0, R | 0 ) | 0; la = Ug( oa | 0, na | 0, i | 0, R | 0 ) | 0; pa = t; qa = ja; ra = la; f[ d >> 2 ] = pa; sa = d + 4 | 0; f[ sa >> 2 ] = qa; ta = d + 8 | 0; f[ ta >> 2 ] = ra; u = e; return;

			}

		} function zb( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0, U = 0, V = 0, W = 0, X = 0, Y = 0, Z = 0, _ = 0, $ = 0, aa = 0, ba = 0, ca = 0; c = u; u = u + 48 | 0; d = c + 24 | 0; e = c + 12 | 0; g = c; if ( ! b ) {

				h = 0; u = c; return h | 0;

			}i = a + 12 | 0; j = a + 4 | 0; k = f[ j >> 2 ] | 0; l = f[ a >> 2 ] | 0; m = k - l >> 2; n = a + 16 | 0; o = f[ n >> 2 ] | 0; p = f[ i >> 2 ] | 0; q = o - p >> 2; r = p; p = o; if ( m >>> 0 <= q >>> 0 ) if ( m >>> 0 < q >>> 0 ? ( o = r + ( m << 2 ) | 0, ( o | 0 ) != ( p | 0 ) ) : 0 ) {

				f[ n >> 2 ] = p + ( ~ ( ( p + - 4 - o | 0 ) >>> 2 ) << 2 ); s = l; t = k;

			} else {

				s = l; t = k;

			} else {

				Ae( i, m - q | 0, 2652 ); s = f[ a >> 2 ] | 0; t = f[ j >> 2 ] | 0;

			}f[ d >> 2 ] = 0; q = d + 4 | 0; f[ q >> 2 ] = 0; f[ d + 8 >> 2 ] = 0; Eg( d, t - s >> 2 ); s = f[ j >> 2 ] | 0; t = f[ a >> 2 ] | 0; if ( ( s | 0 ) == ( t | 0 ) ) {

				v = s; w = s;

			} else {

				m = f[ d >> 2 ] | 0; k = m; l = k; o = 0; p = s; s = k; k = t; t = m; while ( 1 ) {

					m = f[ k + ( o << 2 ) >> 2 ] | 0; n = f[ q >> 2 ] | 0; if ( m >>> 0 < n - t >> 2 >>> 0 ) {

						x = l; y = s; z = k; A = p;

					} else {

						r = m + 1 | 0; f[ e >> 2 ] = 0; B = n - t >> 2; C = t; D = n; if ( r >>> 0 <= B >>> 0 ) if ( r >>> 0 < B >>> 0 ? ( n = C + ( r << 2 ) | 0, ( n | 0 ) != ( D | 0 ) ) : 0 ) {

							f[ q >> 2 ] = D + ( ~ ( ( D + - 4 - n | 0 ) >>> 2 ) << 2 ); E = l; F = p; G = k;

						} else {

							E = l; F = p; G = k;

						} else {

							Ae( d, r - B | 0, e ); E = f[ d >> 2 ] | 0; F = f[ j >> 2 ] | 0; G = f[ a >> 2 ] | 0;

						}x = E; y = E; z = G; A = F;

					}B = y + ( m << 2 ) | 0; f[ B >> 2 ] = ( f[ B >> 2 ] | 0 ) + 1; o = o + 1 | 0; if ( o >>> 0 >= A - z >> 2 >>> 0 ) {

						v = z; w = A; break;

					} else {

						l = x; p = A; s = y; k = z; t = y;

					}

				}

			}y = w - v | 0; v = y >> 2; f[ e >> 2 ] = 0; w = e + 4 | 0; f[ w >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; if ( ! v ) {

				H = 0; I = 0;

			} else {

				if ( v >>> 0 > 536870911 )um( e ); t = bj( y << 1 ) | 0; f[ w >> 2 ] = t; f[ e >> 2 ] = t; y = t + ( v << 3 ) | 0; f[ e + 8 >> 2 ] = y; z = v; v = t; k = t; while ( 1 ) {

					s = v; f[ s >> 2 ] = - 1; f[ s + 4 >> 2 ] = - 1; s = k + 8 | 0; A = z + - 1 | 0; if ( ! A ) break; else {

						z = A; v = s; k = s;

					}

				}f[ w >> 2 ] = y; H = t; I = t;

			}t = f[ q >> 2 ] | 0; y = f[ d >> 2 ] | 0; k = t - y | 0; v = k >> 2; f[ g >> 2 ] = 0; z = g + 4 | 0; f[ z >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; s = y; do if ( v ) if ( v >>> 0 > 1073741823 )um( g ); else {

				A = bj( k ) | 0; f[ g >> 2 ] = A; p = A + ( v << 2 ) | 0; f[ g + 8 >> 2 ] = p; Vf( A | 0, 0, k | 0 ) | 0; f[ z >> 2 ] = p; J = A; K = p; L = A; break;

			} else {

				J = 0; K = 0; L = 0;

			} while ( 0 );if ( ( t | 0 ) != ( y | 0 ) ) {

				y = 0; t = 0; while ( 1 ) {

					f[ J + ( t << 2 ) >> 2 ] = y; k = t + 1 | 0; if ( k >>> 0 < v >>> 0 ) {

						y = ( f[ s + ( t << 2 ) >> 2 ] | 0 ) + y | 0; t = k;

					} else break;

				}

			}t = f[ j >> 2 ] | 0; j = f[ a >> 2 ] | 0; y = j; if ( ( t | 0 ) != ( j | 0 ) ) {

				k = a + 40 | 0; a = t - j >> 2; j = H; t = H; g = H; A = H; p = H; x = H; l = 0; o = J; while ( 1 ) {

					F = f[ y + ( l << 2 ) >> 2 ] | 0; G = l + 1 | 0; E = ( ( G >>> 0 ) % 3 | 0 | 0 ) == 0 ? l + - 2 | 0 : G; if ( ( E | 0 ) == - 1 )M = - 1; else M = f[ y + ( E << 2 ) >> 2 ] | 0; E = ( ( l >>> 0 ) % 3 | 0 | 0 ) == 0; G = ( E ? 2 : - 1 ) + l | 0; if ( ( G | 0 ) == - 1 )N = - 1; else N = f[ y + ( G << 2 ) >> 2 ] | 0; if ( E ? ( M | 0 ) == ( N | 0 ) | ( ( F | 0 ) == ( M | 0 ) | ( F | 0 ) == ( N | 0 ) ) : 0 ) {

						f[ k >> 2 ] = ( f[ k >> 2 ] | 0 ) + 1; O = j; P = t; Q = g; R = A; S = p; T = x; U = l + 2 | 0; V = o;

					} else W = 51; a:do if ( ( W | 0 ) == 51 ) {

						W = 0; E = f[ s + ( N << 2 ) >> 2 ] | 0; b:do if ( ( E | 0 ) > 0 ) {

							G = 0; B = f[ o + ( N << 2 ) >> 2 ] | 0; while ( 1 ) {

								m = f[ p + ( B << 3 ) >> 2 ] | 0; if ( ( m | 0 ) == - 1 ) {

									X = j; Y = t; Z = A; _ = p; break b;

								} if ( ( m | 0 ) == ( M | 0 ) ) {

									m = f[ p + ( B << 3 ) + 4 >> 2 ] | 0; if ( ( m | 0 ) == - 1 )$ = - 1; else $ = f[ y + ( m << 2 ) >> 2 ] | 0; if ( ( F | 0 ) != ( $ | 0 ) ) break;

								}m = G + 1 | 0; if ( ( m | 0 ) < ( E | 0 ) ) {

									G = m; B = B + 1 | 0;

								} else {

									X = j; Y = t; Z = A; _ = p; break b;

								}

							}m = f[ A + ( B << 3 ) + 4 >> 2 ] | 0; r = G; n = B; D = t; while ( 1 ) {

								r = r + 1 | 0; if ( ( r | 0 ) >= ( E | 0 ) ) break; C = n + 1 | 0; f[ D + ( n << 3 ) >> 2 ] = f[ D + ( C << 3 ) >> 2 ]; f[ D + ( n << 3 ) + 4 >> 2 ] = f[ D + ( C << 3 ) + 4 >> 2 ]; if ( ( f[ j + ( n << 3 ) >> 2 ] | 0 ) == - 1 ) break; else {

									n = C; D = j;

								}

							}f[ g + ( n << 3 ) >> 2 ] = - 1; if ( ( m | 0 ) == - 1 ) {

								X = g; Y = g; Z = g; _ = g;

							} else {

								D = f[ i >> 2 ] | 0; f[ D + ( l << 2 ) >> 2 ] = m; f[ D + ( m << 2 ) >> 2 ] = l; O = g; P = g; Q = g; R = g; S = g; T = x; U = l; V = o; break a;

							}

						} else {

							X = j; Y = t; Z = A; _ = p;

						} while ( 0 );E = f[ s + ( M << 2 ) >> 2 ] | 0; if ( ( E | 0 ) > 0 ) {

							D = 0; r = f[ J + ( M << 2 ) >> 2 ] | 0; while ( 1 ) {

								aa = x + ( r << 3 ) | 0; if ( ( f[ aa >> 2 ] | 0 ) == - 1 ) break; D = D + 1 | 0; if ( ( D | 0 ) >= ( E | 0 ) ) {

									O = x; P = x; Q = x; R = x; S = x; T = x; U = l; V = J; break a;

								} else r = r + 1 | 0;

							}f[ aa >> 2 ] = N; f[ H + ( r << 3 ) + 4 >> 2 ] = l; O = H; P = H; Q = H; R = H; S = H; T = H; U = l; V = J;

						} else {

							O = X; P = Y; Q = g; R = Z; S = _; T = x; U = l; V = o;

						}

					} while ( 0 );l = U + 1 | 0; if ( l >>> 0 >= a >>> 0 ) break; else {

						j = O; t = P; g = Q; A = R; p = S; x = T; o = V;

					}

				}

			}f[ b >> 2 ] = v; if ( ! J ) {

				ba = H; ca = I;

			} else {

				if ( ( K | 0 ) != ( J | 0 ) )f[ z >> 2 ] = K + ( ~ ( ( K + - 4 - J | 0 ) >>> 2 ) << 2 ); dn( L ); L = f[ e >> 2 ] | 0; ba = L; ca = L;

			} if ( ba | 0 ) {

				L = f[ w >> 2 ] | 0; if ( ( L | 0 ) != ( ba | 0 ) )f[ w >> 2 ] = L + ( ~ ( ( L + - 8 - ba | 0 ) >>> 3 ) << 3 ); dn( ca );

			}ca = f[ d >> 2 ] | 0; if ( ca | 0 ) {

				d = f[ q >> 2 ] | 0; if ( ( d | 0 ) != ( ca | 0 ) )f[ q >> 2 ] = d + ( ~ ( ( d + - 4 - ca | 0 ) >>> 2 ) << 2 ); dn( ca );

			}h = 1; u = c; return h | 0;

		} function Ab( a, c ) {

			a = a | 0; c = c | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0; e = a + 8 | 0; g = f[ e >> 2 ] | 0; switch ( f[ g + 28 >> 2 ] | 0 ) {

				case 2: {

					h = b[ g + 24 >> 0 ] | 0; i = h << 24 >> 24; j = an( ( i | 0 ) > - 1 ? i : - 1 ) | 0; k = f[ a + 16 >> 2 ] | 0; l = ( f[ f[ k >> 2 ] >> 2 ] | 0 ) + ( f[ k + 48 >> 2 ] | 0 ) | 0; a:do if ( c | 0 ) {

						if ( h << 24 >> 24 > 0 ) {

							m = 0; n = 0;

						} else {

							ge( f[ f[ g + 64 >> 2 ] >> 2 ] | 0, j | 0, i | 0 ) | 0; if ( ( c | 0 ) == 1 ) break; else {

								o = 0; p = 1;

							} while ( 1 ) {

								o = o + i | 0; ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + o | 0, j | 0, i | 0 ) | 0; p = p + 1 | 0; if ( ( p | 0 ) == ( c | 0 ) ) break a;

							}

						} while ( 1 ) {

							k = 0; q = n; while ( 1 ) {

								b[ j + k >> 0 ] = f[ l + ( q << 2 ) >> 2 ]; k = k + 1 | 0; if ( ( k | 0 ) == ( i | 0 ) ) break; else q = q + 1 | 0;

							}ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + n | 0, j | 0, i | 0 ) | 0; m = m + 1 | 0; if ( ( m | 0 ) == ( c | 0 ) ) break; else n = n + i | 0;

						}

					} while ( 0 );bn( j ); r = 1; return r | 0;

				} case 1: {

					j = b[ g + 24 >> 0 ] | 0; i = j << 24 >> 24; n = an( ( i | 0 ) > - 1 ? i : - 1 ) | 0; m = f[ a + 16 >> 2 ] | 0; l = ( f[ f[ m >> 2 ] >> 2 ] | 0 ) + ( f[ m + 48 >> 2 ] | 0 ) | 0; b:do if ( c | 0 ) {

						if ( j << 24 >> 24 > 0 ) {

							s = 0; t = 0;

						} else {

							ge( f[ f[ g + 64 >> 2 ] >> 2 ] | 0, n | 0, i | 0 ) | 0; if ( ( c | 0 ) == 1 ) break; else {

								u = 0; v = 1;

							} while ( 1 ) {

								u = u + i | 0; ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + u | 0, n | 0, i | 0 ) | 0; v = v + 1 | 0; if ( ( v | 0 ) == ( c | 0 ) ) break b;

							}

						} while ( 1 ) {

							m = 0; p = t; while ( 1 ) {

								b[ n + m >> 0 ] = f[ l + ( p << 2 ) >> 2 ]; m = m + 1 | 0; if ( ( m | 0 ) == ( i | 0 ) ) break; else p = p + 1 | 0;

							}ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + t | 0, n | 0, i | 0 ) | 0; s = s + 1 | 0; if ( ( s | 0 ) == ( c | 0 ) ) break; else t = t + i | 0;

						}

					} while ( 0 );bn( n ); r = 1; return r | 0;

				} case 4: {

					n = b[ g + 24 >> 0 ] | 0; i = n << 24 >> 24; t = i << 1; s = an( i >>> 0 > 2147483647 ? - 1 : i << 1 ) | 0; l = f[ a + 16 >> 2 ] | 0; v = ( f[ f[ l >> 2 ] >> 2 ] | 0 ) + ( f[ l + 48 >> 2 ] | 0 ) | 0; c:do if ( c | 0 ) {

						if ( n << 24 >> 24 > 0 ) {

							w = 0; x = 0; y = 0;

						} else {

							ge( f[ f[ g + 64 >> 2 ] >> 2 ] | 0, s | 0, t | 0 ) | 0; if ( ( c | 0 ) == 1 ) break; else {

								z = 0; A = 1;

							} while ( 1 ) {

								z = z + t | 0; ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + z | 0, s | 0, t | 0 ) | 0; A = A + 1 | 0; if ( ( A | 0 ) == ( c | 0 ) ) break c;

							}

						} while ( 1 ) {

							l = 0; u = y; while ( 1 ) {

								d[ s + ( l << 1 ) >> 1 ] = f[ v + ( u << 2 ) >> 2 ]; l = l + 1 | 0; if ( ( l | 0 ) == ( i | 0 ) ) break; else u = u + 1 | 0;

							}ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + x | 0, s | 0, t | 0 ) | 0; w = w + 1 | 0; if ( ( w | 0 ) == ( c | 0 ) ) break; else {

								x = x + t | 0; y = y + i | 0;

							}

						}

					} while ( 0 );bn( s ); r = 1; return r | 0;

				} case 3: {

					s = b[ g + 24 >> 0 ] | 0; i = s << 24 >> 24; y = i << 1; t = an( i >>> 0 > 2147483647 ? - 1 : i << 1 ) | 0; x = f[ a + 16 >> 2 ] | 0; w = ( f[ f[ x >> 2 ] >> 2 ] | 0 ) + ( f[ x + 48 >> 2 ] | 0 ) | 0; d:do if ( c | 0 ) {

						if ( s << 24 >> 24 > 0 ) {

							B = 0; C = 0; D = 0;

						} else {

							ge( f[ f[ g + 64 >> 2 ] >> 2 ] | 0, t | 0, y | 0 ) | 0; if ( ( c | 0 ) == 1 ) break; else {

								E = 0; F = 1;

							} while ( 1 ) {

								E = E + y | 0; ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + E | 0, t | 0, y | 0 ) | 0; F = F + 1 | 0; if ( ( F | 0 ) == ( c | 0 ) ) break d;

							}

						} while ( 1 ) {

							x = 0; v = D; while ( 1 ) {

								d[ t + ( x << 1 ) >> 1 ] = f[ w + ( v << 2 ) >> 2 ]; x = x + 1 | 0; if ( ( x | 0 ) == ( i | 0 ) ) break; else v = v + 1 | 0;

							}ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + C | 0, t | 0, y | 0 ) | 0; B = B + 1 | 0; if ( ( B | 0 ) == ( c | 0 ) ) break; else {

								C = C + y | 0; D = D + i | 0;

							}

						}

					} while ( 0 );bn( t ); r = 1; return r | 0;

				} case 6: {

					t = b[ g + 24 >> 0 ] | 0; i = t << 24 >> 24; D = i << 2; y = an( i >>> 0 > 1073741823 ? - 1 : i << 2 ) | 0; C = f[ a + 16 >> 2 ] | 0; B = ( f[ f[ C >> 2 ] >> 2 ] | 0 ) + ( f[ C + 48 >> 2 ] | 0 ) | 0; e:do if ( c | 0 ) {

						if ( t << 24 >> 24 > 0 ) {

							G = 0; H = 0; I = 0;

						} else {

							ge( f[ f[ g + 64 >> 2 ] >> 2 ] | 0, y | 0, D | 0 ) | 0; if ( ( c | 0 ) == 1 ) break; else {

								J = 0; K = 1;

							} while ( 1 ) {

								J = J + D | 0; ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + J | 0, y | 0, D | 0 ) | 0; K = K + 1 | 0; if ( ( K | 0 ) == ( c | 0 ) ) break e;

							}

						} while ( 1 ) {

							C = 0; w = I; while ( 1 ) {

								f[ y + ( C << 2 ) >> 2 ] = f[ B + ( w << 2 ) >> 2 ]; C = C + 1 | 0; if ( ( C | 0 ) == ( i | 0 ) ) break; else w = w + 1 | 0;

							}ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + H | 0, y | 0, D | 0 ) | 0; G = G + 1 | 0; if ( ( G | 0 ) == ( c | 0 ) ) break; else {

								H = H + D | 0; I = I + i | 0;

							}

						}

					} while ( 0 );bn( y ); r = 1; return r | 0;

				} case 5: {

					y = b[ g + 24 >> 0 ] | 0; i = y << 24 >> 24; I = i << 2; D = an( i >>> 0 > 1073741823 ? - 1 : i << 2 ) | 0; H = f[ a + 16 >> 2 ] | 0; a = ( f[ f[ H >> 2 ] >> 2 ] | 0 ) + ( f[ H + 48 >> 2 ] | 0 ) | 0; f:do if ( c | 0 ) {

						if ( y << 24 >> 24 > 0 ) {

							L = 0; M = 0; N = 0;

						} else {

							ge( f[ f[ g + 64 >> 2 ] >> 2 ] | 0, D | 0, I | 0 ) | 0; if ( ( c | 0 ) == 1 ) break; else {

								O = 0; P = 1;

							} while ( 1 ) {

								O = O + I | 0; ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + O | 0, D | 0, I | 0 ) | 0; P = P + 1 | 0; if ( ( P | 0 ) == ( c | 0 ) ) break f;

							}

						} while ( 1 ) {

							H = 0; G = N; while ( 1 ) {

								f[ D + ( H << 2 ) >> 2 ] = f[ a + ( G << 2 ) >> 2 ]; H = H + 1 | 0; if ( ( H | 0 ) == ( i | 0 ) ) break; else G = G + 1 | 0;

							}ge( ( f[ f[ ( f[ e >> 2 ] | 0 ) + 64 >> 2 ] >> 2 ] | 0 ) + M | 0, D | 0, I | 0 ) | 0; L = L + 1 | 0; if ( ( L | 0 ) == ( c | 0 ) ) break; else {

								M = M + I | 0; N = N + i | 0;

							}

						}

					} while ( 0 );bn( D ); r = 1; return r | 0;

				} default: {

					r = 0; return r | 0;

				}

			} return 0;

		} function Bb( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0; d = u; u = u + 176 | 0; e = d + 136 | 0; g = d + 32 | 0; i = d; j = d + 104 | 0; k = d + 100 | 0; l = a + 4 | 0; m = f[ l >> 2 ] | 0; n = f[ m + 32 >> 2 ] | 0; o = n + 8 | 0; p = f[ o >> 2 ] | 0; q = f[ o + 4 >> 2 ] | 0; o = n + 16 | 0; r = o; s = f[ r >> 2 ] | 0; t = f[ r + 4 >> 2 ] | 0; if ( ! ( ( q | 0 ) > ( t | 0 ) | ( q | 0 ) == ( t | 0 ) & p >>> 0 > s >>> 0 ) ) {

				v = 0; u = d; return v | 0;

			}r = f[ n >> 2 ] | 0; n = b[ r + s >> 0 ] | 0; w = Rj( s | 0, t | 0, 1, 0 ) | 0; x = I; y = o; f[ y >> 2 ] = w; f[ y + 4 >> 2 ] = x; if ( ! ( ( q | 0 ) > ( x | 0 ) | ( q | 0 ) == ( x | 0 ) & p >>> 0 > w >>> 0 ) ) {

				v = 0; u = d; return v | 0;

			}x = b[ r + w >> 0 ] | 0; w = Rj( s | 0, t | 0, 2, 0 ) | 0; y = I; z = o; f[ z >> 2 ] = w; f[ z + 4 >> 2 ] = y; do if ( n << 24 >> 24 > - 1 ) {

				z = n << 24 >> 24; A = f[ a + 212 >> 2 ] | 0; if ( ( ( ( f[ a + 216 >> 2 ] | 0 ) - A | 0 ) / 144 | 0 ) >>> 0 > z >>> 0 ) {

					f[ A + ( z * 144 | 0 ) >> 2 ] = c; break;

				} else {

					v = 0; u = d; return v | 0;

				}

			} while ( 0 );do if ( ( ( ( h[ m + 36 >> 0 ] | 0 ) << 8 | ( h[ m + 37 >> 0 ] | 0 ) ) & 65535 ) > 257 ) if ( ( q | 0 ) > ( y | 0 ) | ( q | 0 ) == ( y | 0 ) & p >>> 0 > w >>> 0 ) {

				z = b[ r + w >> 0 ] | 0; A = Rj( s | 0, t | 0, 3, 0 ) | 0; B = o; f[ B >> 2 ] = A; f[ B + 4 >> 2 ] = I; C = z & 255; break;

			} else {

				v = 0; u = d; return v | 0;

			} else C = 0; while ( 0 );o = f[ m + 44 >> 2 ] | 0; if ( ! ( x << 24 >> 24 ) ) {

				if ( n << 24 >> 24 < 0 )D = a + 184 | 0; else {

					x = n << 24 >> 24; m = f[ a + 212 >> 2 ] | 0; b[ m + ( x * 144 | 0 ) + 100 >> 0 ] = 0; D = m + ( x * 144 | 0 ) + 104 | 0;

				} switch ( ( C & 255 ) << 24 >> 24 ) {

					case 0: {

						mc( e, a, D ); E = f[ e >> 2 ] | 0; break;

					} case 1: {

						_c( e, a, D ); E = f[ e >> 2 ] | 0; break;

					} default: {

						v = 0; u = d; return v | 0;

					}

				} if ( ! E ) {

					v = 0; u = d; return v | 0;

				} else F = E;

			} else {

				if ( n << 24 >> 24 < 0 | ( C | 0 ) != 0 ) {

					v = 0; u = d; return v | 0;

				}C = bj( 88 ) | 0; E = n << 24 >> 24; n = f[ a + 212 >> 2 ] | 0; a = n + ( E * 144 | 0 ) + 104 | 0; f[ C + 4 >> 2 ] = 0; f[ C >> 2 ] = 2348; D = C + 12 | 0; f[ D >> 2 ] = 2372; x = C + 64 | 0; f[ x >> 2 ] = 0; f[ C + 68 >> 2 ] = 0; f[ C + 72 >> 2 ] = 0; m = C + 16 | 0; t = m + 44 | 0; do {

					f[ m >> 2 ] = 0; m = m + 4 | 0;

				} while ( ( m | 0 ) < ( t | 0 ) );f[ C + 76 >> 2 ] = o; f[ C + 80 >> 2 ] = a; f[ C + 84 >> 2 ] = 0; s = g + 4 | 0; f[ s >> 2 ] = 2372; w = g + 56 | 0; f[ w >> 2 ] = 0; r = g + 60 | 0; f[ r >> 2 ] = 0; f[ g + 64 >> 2 ] = 0; m = g + 8 | 0; t = m + 44 | 0; do {

					f[ m >> 2 ] = 0; m = m + 4 | 0;

				} while ( ( m | 0 ) < ( t | 0 ) );m = n + ( E * 144 | 0 ) + 4 | 0; f[ i >> 2 ] = 2372; t = i + 4 | 0; p = t + 4 | 0; f[ p >> 2 ] = 0; f[ p + 4 >> 2 ] = 0; f[ p + 8 >> 2 ] = 0; f[ p + 12 >> 2 ] = 0; f[ p + 16 >> 2 ] = 0; f[ p + 20 >> 2 ] = 0; f[ t >> 2 ] = m; t = f[ n + ( E * 144 | 0 ) + 68 >> 2 ] | 0; E = ( ( f[ t + 4 >> 2 ] | 0 ) - ( f[ t >> 2 ] | 0 ) >> 2 >>> 0 ) / 3 | 0; b[ e >> 0 ] = 0; le( i + 8 | 0, E, e ); Sa[ f[ ( f[ i >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( i ); id( j, i ); id( e, j ); f[ g >> 2 ] = f[ e + 4 >> 2 ]; E = g + 4 | 0; wd( E, e ) | 0; f[ e >> 2 ] = 2372; t = f[ e + 20 >> 2 ] | 0; if ( t | 0 )dn( t ); t = f[ e + 8 >> 2 ] | 0; if ( t | 0 )dn( t ); f[ g + 36 >> 2 ] = m; f[ g + 40 >> 2 ] = a; f[ g + 44 >> 2 ] = o; f[ g + 48 >> 2 ] = C; f[ j >> 2 ] = 2372; o = f[ j + 20 >> 2 ] | 0; if ( o | 0 )dn( o ); o = f[ j + 8 >> 2 ] | 0; if ( o | 0 )dn( o ); f[ C + 8 >> 2 ] = f[ g >> 2 ]; wd( D, E ) | 0; E = C + 44 | 0; D = g + 36 | 0; f[ E >> 2 ] = f[ D >> 2 ]; f[ E + 4 >> 2 ] = f[ D + 4 >> 2 ]; f[ E + 8 >> 2 ] = f[ D + 8 >> 2 ]; f[ E + 12 >> 2 ] = f[ D + 12 >> 2 ]; b[ E + 16 >> 0 ] = b[ D + 16 >> 0 ] | 0; zd( x, f[ w >> 2 ] | 0, f[ r >> 2 ] | 0 ); x = C; f[ i >> 2 ] = 2372; C = f[ i + 20 >> 2 ] | 0; if ( C | 0 )dn( C ); C = f[ i + 8 >> 2 ] | 0; if ( C | 0 )dn( C ); C = f[ w >> 2 ] | 0; if ( C | 0 ) {

					w = f[ r >> 2 ] | 0; if ( ( w | 0 ) != ( C | 0 ) )f[ r >> 2 ] = w + ( ~ ( ( w + - 4 - C | 0 ) >>> 2 ) << 2 ); dn( C );

				}f[ s >> 2 ] = 2372; s = f[ g + 24 >> 2 ] | 0; if ( s | 0 )dn( s ); s = f[ g + 12 >> 2 ] | 0; if ( s | 0 )dn( s ); F = x;

			}x = bj( 64 ) | 0; f[ k >> 2 ] = F; Ah( x, k ); F = x; s = f[ k >> 2 ] | 0; f[ k >> 2 ] = 0; if ( s | 0 )Sa[ f[ ( f[ s >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( s ); s = f[ l >> 2 ] | 0; if ( ( c | 0 ) < 0 ) {

				Sa[ f[ ( f[ x >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( x ); v = 0; u = d; return v | 0;

			}x = s + 8 | 0; l = s + 12 | 0; s = f[ l >> 2 ] | 0; k = f[ x >> 2 ] | 0; g = s - k >> 2; do if ( ( g | 0 ) <= ( c | 0 ) ) {

				C = c + 1 | 0; w = s; if ( C >>> 0 > g >>> 0 ) {

					Kd( x, C - g | 0 ); break;

				} if ( C >>> 0 < g >>> 0 ? ( r = k + ( C << 2 ) | 0, ( r | 0 ) != ( w | 0 ) ) : 0 ) {

					C = w; do {

						w = C + - 4 | 0; f[ l >> 2 ] = w; i = f[ w >> 2 ] | 0; f[ w >> 2 ] = 0; if ( i | 0 )Sa[ f[ ( f[ i >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( i ); C = f[ l >> 2 ] | 0;

					} while ( ( C | 0 ) != ( r | 0 ) );

				}

			} while ( 0 );l = ( f[ x >> 2 ] | 0 ) + ( c << 2 ) | 0; c = f[ l >> 2 ] | 0; f[ l >> 2 ] = F; if ( ! c ) {

				v = 1; u = d; return v | 0;

			}Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); v = 1; u = d; return v | 0;

		} function Cb( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0; if ( ! a ) return; b = a + - 8 | 0; c = f[ 3224 ] | 0; d = f[ a + - 4 >> 2 ] | 0; a = d & - 8; e = b + a | 0; do if ( ! ( d & 1 ) ) {

				g = f[ b >> 2 ] | 0; if ( ! ( d & 3 ) ) return; h = b + ( 0 - g ) | 0; i = g + a | 0; if ( h >>> 0 < c >>> 0 ) return; if ( ( f[ 3225 ] | 0 ) == ( h | 0 ) ) {

					j = e + 4 | 0; k = f[ j >> 2 ] | 0; if ( ( k & 3 | 0 ) != 3 ) {

						l = h; m = i; n = h; break;

					}f[ 3222 ] = i; f[ j >> 2 ] = k & - 2; f[ h + 4 >> 2 ] = i | 1; f[ h + i >> 2 ] = i; return;

				}k = g >>> 3; if ( g >>> 0 < 256 ) {

					g = f[ h + 8 >> 2 ] | 0; j = f[ h + 12 >> 2 ] | 0; if ( ( j | 0 ) == ( g | 0 ) ) {

						f[ 3220 ] = f[ 3220 ] & ~ ( 1 << k ); l = h; m = i; n = h; break;

					} else {

						f[ g + 12 >> 2 ] = j; f[ j + 8 >> 2 ] = g; l = h; m = i; n = h; break;

					}

				}g = f[ h + 24 >> 2 ] | 0; j = f[ h + 12 >> 2 ] | 0; do if ( ( j | 0 ) == ( h | 0 ) ) {

					k = h + 16 | 0; o = k + 4 | 0; p = f[ o >> 2 ] | 0; if ( ! p ) {

						q = f[ k >> 2 ] | 0; if ( ! q ) {

							r = 0; break;

						} else {

							s = q; t = k;

						}

					} else {

						s = p; t = o;

					} while ( 1 ) {

						o = s + 20 | 0; p = f[ o >> 2 ] | 0; if ( p | 0 ) {

							s = p; t = o; continue;

						}o = s + 16 | 0; p = f[ o >> 2 ] | 0; if ( ! p ) break; else {

							s = p; t = o;

						}

					}f[ t >> 2 ] = 0; r = s;

				} else {

					o = f[ h + 8 >> 2 ] | 0; f[ o + 12 >> 2 ] = j; f[ j + 8 >> 2 ] = o; r = j;

				} while ( 0 );if ( g ) {

					j = f[ h + 28 >> 2 ] | 0; o = 13184 + ( j << 2 ) | 0; if ( ( f[ o >> 2 ] | 0 ) == ( h | 0 ) ) {

						f[ o >> 2 ] = r; if ( ! r ) {

							f[ 3221 ] = f[ 3221 ] & ~ ( 1 << j ); l = h; m = i; n = h; break;

						}

					} else {

						f[ g + 16 + ( ( ( f[ g + 16 >> 2 ] | 0 ) != ( h | 0 ) & 1 ) << 2 ) >> 2 ] = r; if ( ! r ) {

							l = h; m = i; n = h; break;

						}

					}f[ r + 24 >> 2 ] = g; j = h + 16 | 0; o = f[ j >> 2 ] | 0; if ( o | 0 ) {

						f[ r + 16 >> 2 ] = o; f[ o + 24 >> 2 ] = r;

					}o = f[ j + 4 >> 2 ] | 0; if ( o ) {

						f[ r + 20 >> 2 ] = o; f[ o + 24 >> 2 ] = r; l = h; m = i; n = h;

					} else {

						l = h; m = i; n = h;

					}

				} else {

					l = h; m = i; n = h;

				}

			} else {

				l = b; m = a; n = b;

			} while ( 0 );if ( n >>> 0 >= e >>> 0 ) return; b = e + 4 | 0; a = f[ b >> 2 ] | 0; if ( ! ( a & 1 ) ) return; if ( ! ( a & 2 ) ) {

				if ( ( f[ 3226 ] | 0 ) == ( e | 0 ) ) {

					r = ( f[ 3223 ] | 0 ) + m | 0; f[ 3223 ] = r; f[ 3226 ] = l; f[ l + 4 >> 2 ] = r | 1; if ( ( l | 0 ) != ( f[ 3225 ] | 0 ) ) return; f[ 3225 ] = 0; f[ 3222 ] = 0; return;

				} if ( ( f[ 3225 ] | 0 ) == ( e | 0 ) ) {

					r = ( f[ 3222 ] | 0 ) + m | 0; f[ 3222 ] = r; f[ 3225 ] = n; f[ l + 4 >> 2 ] = r | 1; f[ n + r >> 2 ] = r; return;

				}r = ( a & - 8 ) + m | 0; s = a >>> 3; do if ( a >>> 0 < 256 ) {

					t = f[ e + 8 >> 2 ] | 0; c = f[ e + 12 >> 2 ] | 0; if ( ( c | 0 ) == ( t | 0 ) ) {

						f[ 3220 ] = f[ 3220 ] & ~ ( 1 << s ); break;

					} else {

						f[ t + 12 >> 2 ] = c; f[ c + 8 >> 2 ] = t; break;

					}

				} else {

					t = f[ e + 24 >> 2 ] | 0; c = f[ e + 12 >> 2 ] | 0; do if ( ( c | 0 ) == ( e | 0 ) ) {

						d = e + 16 | 0; o = d + 4 | 0; j = f[ o >> 2 ] | 0; if ( ! j ) {

							p = f[ d >> 2 ] | 0; if ( ! p ) {

								u = 0; break;

							} else {

								v = p; w = d;

							}

						} else {

							v = j; w = o;

						} while ( 1 ) {

							o = v + 20 | 0; j = f[ o >> 2 ] | 0; if ( j | 0 ) {

								v = j; w = o; continue;

							}o = v + 16 | 0; j = f[ o >> 2 ] | 0; if ( ! j ) break; else {

								v = j; w = o;

							}

						}f[ w >> 2 ] = 0; u = v;

					} else {

						o = f[ e + 8 >> 2 ] | 0; f[ o + 12 >> 2 ] = c; f[ c + 8 >> 2 ] = o; u = c;

					} while ( 0 );if ( t | 0 ) {

						c = f[ e + 28 >> 2 ] | 0; h = 13184 + ( c << 2 ) | 0; if ( ( f[ h >> 2 ] | 0 ) == ( e | 0 ) ) {

							f[ h >> 2 ] = u; if ( ! u ) {

								f[ 3221 ] = f[ 3221 ] & ~ ( 1 << c ); break;

							}

						} else {

							f[ t + 16 + ( ( ( f[ t + 16 >> 2 ] | 0 ) != ( e | 0 ) & 1 ) << 2 ) >> 2 ] = u; if ( ! u ) break;

						}f[ u + 24 >> 2 ] = t; c = e + 16 | 0; h = f[ c >> 2 ] | 0; if ( h | 0 ) {

							f[ u + 16 >> 2 ] = h; f[ h + 24 >> 2 ] = u;

						}h = f[ c + 4 >> 2 ] | 0; if ( h | 0 ) {

							f[ u + 20 >> 2 ] = h; f[ h + 24 >> 2 ] = u;

						}

					}

				} while ( 0 );f[ l + 4 >> 2 ] = r | 1; f[ n + r >> 2 ] = r; if ( ( l | 0 ) == ( f[ 3225 ] | 0 ) ) {

					f[ 3222 ] = r; return;

				} else x = r;

			} else {

				f[ b >> 2 ] = a & - 2; f[ l + 4 >> 2 ] = m | 1; f[ n + m >> 2 ] = m; x = m;

			}m = x >>> 3; if ( x >>> 0 < 256 ) {

				n = 12920 + ( m << 1 << 2 ) | 0; a = f[ 3220 ] | 0; b = 1 << m; if ( ! ( a & b ) ) {

					f[ 3220 ] = a | b; y = n; z = n + 8 | 0;

				} else {

					b = n + 8 | 0; y = f[ b >> 2 ] | 0; z = b;

				}f[ z >> 2 ] = l; f[ y + 12 >> 2 ] = l; f[ l + 8 >> 2 ] = y; f[ l + 12 >> 2 ] = n; return;

			}n = x >>> 8; if ( n ) if ( x >>> 0 > 16777215 )A = 31; else {

				y = ( n + 1048320 | 0 ) >>> 16 & 8; z = n << y; n = ( z + 520192 | 0 ) >>> 16 & 4; b = z << n; z = ( b + 245760 | 0 ) >>> 16 & 2; a = 14 - ( n | y | z ) + ( b << z >>> 15 ) | 0; A = x >>> ( a + 7 | 0 ) & 1 | a << 1;

			} else A = 0; a = 13184 + ( A << 2 ) | 0; f[ l + 28 >> 2 ] = A; f[ l + 20 >> 2 ] = 0; f[ l + 16 >> 2 ] = 0; z = f[ 3221 ] | 0; b = 1 << A; do if ( z & b ) {

				y = x << ( ( A | 0 ) == 31 ? 0 : 25 - ( A >>> 1 ) | 0 ); n = f[ a >> 2 ] | 0; while ( 1 ) {

					if ( ( f[ n + 4 >> 2 ] & - 8 | 0 ) == ( x | 0 ) ) {

						B = 73; break;

					}C = n + 16 + ( y >>> 31 << 2 ) | 0; m = f[ C >> 2 ] | 0; if ( ! m ) {

						B = 72; break;

					} else {

						y = y << 1; n = m;

					}

				} if ( ( B | 0 ) == 72 ) {

					f[ C >> 2 ] = l; f[ l + 24 >> 2 ] = n; f[ l + 12 >> 2 ] = l; f[ l + 8 >> 2 ] = l; break;

				} else if ( ( B | 0 ) == 73 ) {

					y = n + 8 | 0; t = f[ y >> 2 ] | 0; f[ t + 12 >> 2 ] = l; f[ y >> 2 ] = l; f[ l + 8 >> 2 ] = t; f[ l + 12 >> 2 ] = n; f[ l + 24 >> 2 ] = 0; break;

				}

			} else {

				f[ 3221 ] = z | b; f[ a >> 2 ] = l; f[ l + 24 >> 2 ] = a; f[ l + 12 >> 2 ] = l; f[ l + 8 >> 2 ] = l;

			} while ( 0 );l = ( f[ 3228 ] | 0 ) + - 1 | 0; f[ 3228 ] = l; if ( ! l )D = 13336; else return; while ( 1 ) {

				l = f[ D >> 2 ] | 0; if ( ! l ) break; else D = l + 8 | 0;

			}f[ 3228 ] = - 1; return;

		} function Db( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = La, F = La, G = La, H = 0, I = 0, J = 0, K = 0; d = b[ c + 11 >> 0 ] | 0; e = d << 24 >> 24 < 0; g = e ? f[ c >> 2 ] | 0 : c; i = e ? f[ c + 4 >> 2 ] | 0 : d & 255; if ( i >>> 0 > 3 ) {

				d = g; e = i; j = i; while ( 1 ) {

					k = X( h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24, 1540483477 ) | 0; e = ( X( k >>> 24 ^ k, 1540483477 ) | 0 ) ^ ( X( e, 1540483477 ) | 0 ); j = j + - 4 | 0; if ( j >>> 0 <= 3 ) break; else d = d + 4 | 0;

				}d = i + - 4 | 0; j = d & - 4; l = d - j | 0; m = g + ( j + 4 ) | 0; o = e;

			} else {

				l = i; m = g; o = i;

			} switch ( l | 0 ) {

				case 3: {

					p = h[ m + 2 >> 0 ] << 16 ^ o; q = 6; break;

				} case 2: {

					p = o; q = 6; break;

				} case 1: {

					r = o; q = 7; break;

				} default:s = o;

			} if ( ( q | 0 ) == 6 ) {

				r = h[ m + 1 >> 0 ] << 8 ^ p; q = 7;

			} if ( ( q | 0 ) == 7 )s = X( r ^ h[ m >> 0 ], 1540483477 ) | 0; m = X( s >>> 13 ^ s, 1540483477 ) | 0; s = m >>> 15 ^ m; m = a + 4 | 0; r = f[ m >> 2 ] | 0; p = ( r | 0 ) == 0; a:do if ( ! p ) {

				o = r + - 1 | 0; l = ( o & r | 0 ) == 0; if ( ! l ) if ( s >>> 0 < r >>> 0 )t = s; else t = ( s >>> 0 ) % ( r >>> 0 ) | 0; else t = s & o; e = f[ ( f[ a >> 2 ] | 0 ) + ( t << 2 ) >> 2 ] | 0; if ( ( e | 0 ) != 0 ? ( j = f[ e >> 2 ] | 0, ( j | 0 ) != 0 ) : 0 ) {

					e = ( i | 0 ) == 0; if ( l ) {

						if ( e ) {

							l = j; while ( 1 ) {

								d = f[ l + 4 >> 2 ] | 0; if ( ! ( ( d | 0 ) == ( s | 0 ) | ( d & o | 0 ) == ( t | 0 ) ) ) {

									u = t; break a;

								}d = b[ l + 8 + 11 >> 0 ] | 0; if ( ! ( ( d << 24 >> 24 < 0 ? f[ l + 12 >> 2 ] | 0 : d & 255 ) | 0 ) ) {

									v = l; break;

								}l = f[ l >> 2 ] | 0; if ( ! l ) {

									u = t; break a;

								}

							}w = v + 20 | 0; return w | 0;

						} else x = j; b:while ( 1 ) {

							l = f[ x + 4 >> 2 ] | 0; if ( ! ( ( l | 0 ) == ( s | 0 ) | ( l & o | 0 ) == ( t | 0 ) ) ) {

								u = t; break a;

							}l = x + 8 | 0; d = b[ l + 11 >> 0 ] | 0; k = d << 24 >> 24 < 0; y = d & 255; do if ( ( ( k ? f[ x + 12 >> 2 ] | 0 : y ) | 0 ) == ( i | 0 ) ) {

								d = f[ l >> 2 ] | 0; if ( k ) if ( ! ( jh( d, g, i ) | 0 ) ) {

									v = x; q = 63; break b;

								} else break; if ( ( b[ g >> 0 ] | 0 ) == ( d & 255 ) << 24 >> 24 ) {

									d = l; z = y; A = g; do {

										z = z + - 1 | 0; d = d + 1 | 0; if ( ! z ) {

											v = x; q = 63; break b;

										}A = A + 1 | 0;

									} while ( ( b[ d >> 0 ] | 0 ) == ( b[ A >> 0 ] | 0 ) );

								}

							} while ( 0 );x = f[ x >> 2 ] | 0; if ( ! x ) {

								u = t; break a;

							}

						} if ( ( q | 0 ) == 63 ) {

							w = v + 20 | 0; return w | 0;

						}

					} if ( e ) {

						o = j; while ( 1 ) {

							y = f[ o + 4 >> 2 ] | 0; if ( ( y | 0 ) != ( s | 0 ) ) {

								if ( y >>> 0 < r >>> 0 )B = y; else B = ( y >>> 0 ) % ( r >>> 0 ) | 0; if ( ( B | 0 ) != ( t | 0 ) ) {

									u = t; break a;

								}

							}y = b[ o + 8 + 11 >> 0 ] | 0; if ( ! ( ( y << 24 >> 24 < 0 ? f[ o + 12 >> 2 ] | 0 : y & 255 ) | 0 ) ) {

								v = o; break;

							}o = f[ o >> 2 ] | 0; if ( ! o ) {

								u = t; break a;

							}

						}w = v + 20 | 0; return w | 0;

					} else C = j; c:while ( 1 ) {

						o = f[ C + 4 >> 2 ] | 0; if ( ( o | 0 ) != ( s | 0 ) ) {

							if ( o >>> 0 < r >>> 0 )D = o; else D = ( o >>> 0 ) % ( r >>> 0 ) | 0; if ( ( D | 0 ) != ( t | 0 ) ) {

								u = t; break a;

							}

						}o = C + 8 | 0; e = b[ o + 11 >> 0 ] | 0; y = e << 24 >> 24 < 0; l = e & 255; do if ( ( ( y ? f[ C + 12 >> 2 ] | 0 : l ) | 0 ) == ( i | 0 ) ) {

							e = f[ o >> 2 ] | 0; if ( y ) if ( ! ( jh( e, g, i ) | 0 ) ) {

								v = C; q = 63; break c;

							} else break; if ( ( b[ g >> 0 ] | 0 ) == ( e & 255 ) << 24 >> 24 ) {

								e = o; k = l; A = g; do {

									k = k + - 1 | 0; e = e + 1 | 0; if ( ! k ) {

										v = C; q = 63; break c;

									}A = A + 1 | 0;

								} while ( ( b[ e >> 0 ] | 0 ) == ( b[ A >> 0 ] | 0 ) );

							}

						} while ( 0 );C = f[ C >> 2 ] | 0; if ( ! C ) {

							u = t; break a;

						}

					} if ( ( q | 0 ) == 63 ) {

						w = v + 20 | 0; return w | 0;

					}

				} else u = t;

			} else u = 0; while ( 0 );t = bj( 24 ) | 0; Rf( t + 8 | 0, c ); f[ t + 20 >> 2 ] = 0; f[ t + 4 >> 2 ] = s; f[ t >> 2 ] = 0; c = a + 12 | 0; E = $( ( ( f[ c >> 2 ] | 0 ) + 1 | 0 ) >>> 0 ); F = $( r >>> 0 ); G = $( n[ a + 16 >> 2 ] ); do if ( p | $( G * F ) < E ) {

				C = r << 1 | ( r >>> 0 < 3 | ( r + - 1 & r | 0 ) != 0 ) & 1; g = ~ ~ $( W( $( E / G ) ) ) >>> 0; Oe( a, C >>> 0 < g >>> 0 ? g : C ); C = f[ m >> 2 ] | 0; g = C + - 1 | 0; if ( ! ( g & C ) ) {

					H = C; I = g & s; break;

				} if ( s >>> 0 < C >>> 0 ) {

					H = C; I = s;

				} else {

					H = C; I = ( s >>> 0 ) % ( C >>> 0 ) | 0;

				}

			} else {

				H = r; I = u;

			} while ( 0 );u = ( f[ a >> 2 ] | 0 ) + ( I << 2 ) | 0; I = f[ u >> 2 ] | 0; if ( ! I ) {

				r = a + 8 | 0; f[ t >> 2 ] = f[ r >> 2 ]; f[ r >> 2 ] = t; f[ u >> 2 ] = r; r = f[ t >> 2 ] | 0; if ( r | 0 ) {

					u = f[ r + 4 >> 2 ] | 0; r = H + - 1 | 0; if ( r & H ) if ( u >>> 0 < H >>> 0 )J = u; else J = ( u >>> 0 ) % ( H >>> 0 ) | 0; else J = u & r; K = ( f[ a >> 2 ] | 0 ) + ( J << 2 ) | 0; q = 61;

				}

			} else {

				f[ t >> 2 ] = f[ I >> 2 ]; K = I; q = 61;

			} if ( ( q | 0 ) == 61 )f[ K >> 2 ] = t; f[ c >> 2 ] = ( f[ c >> 2 ] | 0 ) + 1; v = t; w = v + 20 | 0; return w | 0;

		} function Eb( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0; g = a + 8 | 0; f[ g >> 2 ] = e; d = a + 32 | 0; h = a + 36 | 0; i = f[ h >> 2 ] | 0; j = f[ d >> 2 ] | 0; k = i - j >> 2; l = j; j = i; if ( k >>> 0 >= e >>> 0 ) if ( k >>> 0 > e >>> 0 ? ( i = l + ( e << 2 ) | 0, ( i | 0 ) != ( j | 0 ) ) : 0 ) {

				f[ h >> 2 ] = j + ( ~ ( ( j + - 4 - i | 0 ) >>> 2 ) << 2 ); m = e;

			} else m = e; else {

				ff( d, e - k | 0 ); m = f[ g >> 2 ] | 0;

			}k = f[ a + 48 >> 2 ] | 0; d = f[ a + 52 >> 2 ] | 0; i = e >>> 0 > 1073741823 ? - 1 : e << 2; j = an( i ) | 0; Vf( j | 0, 0, i | 0 ) | 0; if ( ( m | 0 ) > 0 ) {

				i = a + 16 | 0; h = a + 32 | 0; l = a + 12 | 0; n = 0; do {

					o = f[ j + ( n << 2 ) >> 2 ] | 0; p = f[ i >> 2 ] | 0; if ( ( o | 0 ) > ( p | 0 ) ) {

						q = f[ h >> 2 ] | 0; f[ q + ( n << 2 ) >> 2 ] = p; r = q;

					} else {

						q = f[ l >> 2 ] | 0; p = f[ h >> 2 ] | 0; f[ p + ( n << 2 ) >> 2 ] = ( o | 0 ) < ( q | 0 ) ? q : o; r = p;

					}n = n + 1 | 0; s = f[ g >> 2 ] | 0;

				} while ( ( n | 0 ) < ( s | 0 ) );if ( ( s | 0 ) > 0 ) {

					n = a + 20 | 0; h = 0; do {

						p = ( f[ b + ( h << 2 ) >> 2 ] | 0 ) + ( f[ r + ( h << 2 ) >> 2 ] | 0 ) | 0; o = c + ( h << 2 ) | 0; f[ o >> 2 ] = p; if ( ( p | 0 ) <= ( f[ i >> 2 ] | 0 ) ) {

							if ( ( p | 0 ) < ( f[ l >> 2 ] | 0 ) ) {

								t = ( f[ n >> 2 ] | 0 ) + p | 0; u = 18;

							}

						} else {

							t = p - ( f[ n >> 2 ] | 0 ) | 0; u = 18;

						} if ( ( u | 0 ) == 18 ) {

							u = 0; f[ o >> 2 ] = t;

						}h = h + 1 | 0; o = f[ g >> 2 ] | 0;

					} while ( ( h | 0 ) < ( o | 0 ) );v = o;

				} else v = s;

			} else v = m; m = f[ a + 56 >> 2 ] | 0; s = f[ m >> 2 ] | 0; h = ( f[ m + 4 >> 2 ] | 0 ) - s | 0; t = h >> 2; if ( ( h | 0 ) <= 4 ) {

				bn( j ); return 1;

			}h = a + 16 | 0; n = a + 32 | 0; l = a + 12 | 0; i = a + 20 | 0; a = k + 12 | 0; r = ( e | 0 ) > 0; o = s; s = 1; p = v; while ( 1 ) {

				if ( t >>> 0 <= s >>> 0 ) {

					u = 24; break;

				}v = f[ o + ( s << 2 ) >> 2 ] | 0; q = X( s, e ) | 0; if ( ( v | 0 ) != - 1 ? ( w = f[ ( f[ a >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0, ( w | 0 ) != - 1 ) : 0 ) {

					v = f[ k >> 2 ] | 0; x = f[ d >> 2 ] | 0; y = f[ x + ( f[ v + ( w << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; z = w + 1 | 0; A = ( ( z >>> 0 ) % 3 | 0 | 0 ) == 0 ? w + - 2 | 0 : z; if ( ( A | 0 ) == - 1 )B = - 1; else B = f[ v + ( A << 2 ) >> 2 ] | 0; A = f[ x + ( B << 2 ) >> 2 ] | 0; z = ( ( ( w >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + w | 0; if ( ( z | 0 ) == - 1 )C = - 1; else C = f[ v + ( z << 2 ) >> 2 ] | 0; z = f[ x + ( C << 2 ) >> 2 ] | 0; if ( ( y | 0 ) < ( s | 0 ) & ( A | 0 ) < ( s | 0 ) & ( z | 0 ) < ( s | 0 ) ) {

						x = X( y, e ) | 0; y = X( A, e ) | 0; A = X( z, e ) | 0; if ( r ) {

							z = 0; do {

								f[ j + ( z << 2 ) >> 2 ] = ( f[ c + ( z + A << 2 ) >> 2 ] | 0 ) + ( f[ c + ( z + y << 2 ) >> 2 ] | 0 ) - ( f[ c + ( z + x << 2 ) >> 2 ] | 0 ); z = z + 1 | 0;

							} while ( ( z | 0 ) != ( e | 0 ) );

						}z = b + ( q << 2 ) | 0; x = c + ( q << 2 ) | 0; if ( ( p | 0 ) > 0 ) {

							y = 0; do {

								A = f[ j + ( y << 2 ) >> 2 ] | 0; v = f[ h >> 2 ] | 0; if ( ( A | 0 ) > ( v | 0 ) ) {

									w = f[ n >> 2 ] | 0; f[ w + ( y << 2 ) >> 2 ] = v; D = w;

								} else {

									w = f[ l >> 2 ] | 0; v = f[ n >> 2 ] | 0; f[ v + ( y << 2 ) >> 2 ] = ( A | 0 ) < ( w | 0 ) ? w : A; D = v;

								}y = y + 1 | 0; E = f[ g >> 2 ] | 0;

							} while ( ( y | 0 ) < ( E | 0 ) );if ( ( E | 0 ) > 0 ) {

								y = 0; do {

									v = ( f[ z + ( y << 2 ) >> 2 ] | 0 ) + ( f[ D + ( y << 2 ) >> 2 ] | 0 ) | 0; A = x + ( y << 2 ) | 0; f[ A >> 2 ] = v; if ( ( v | 0 ) <= ( f[ h >> 2 ] | 0 ) ) {

										if ( ( v | 0 ) < ( f[ l >> 2 ] | 0 ) ) {

											F = ( f[ i >> 2 ] | 0 ) + v | 0; u = 56;

										}

									} else {

										F = v - ( f[ i >> 2 ] | 0 ) | 0; u = 56;

									} if ( ( u | 0 ) == 56 ) {

										u = 0; f[ A >> 2 ] = F;

									}y = y + 1 | 0; A = f[ g >> 2 ] | 0;

								} while ( ( y | 0 ) < ( A | 0 ) );G = A;

							} else G = E;

						} else G = p;

					} else u = 34;

				} else u = 34; if ( ( u | 0 ) == 34 ) {

					u = 0; y = c + ( ( X( s + - 1 | 0, e ) | 0 ) << 2 ) | 0; x = b + ( q << 2 ) | 0; z = c + ( q << 2 ) | 0; if ( ( p | 0 ) > 0 ) {

						A = 0; do {

							v = f[ y + ( A << 2 ) >> 2 ] | 0; w = f[ h >> 2 ] | 0; if ( ( v | 0 ) > ( w | 0 ) ) {

								H = f[ n >> 2 ] | 0; f[ H + ( A << 2 ) >> 2 ] = w; I = H;

							} else {

								H = f[ l >> 2 ] | 0; w = f[ n >> 2 ] | 0; f[ w + ( A << 2 ) >> 2 ] = ( v | 0 ) < ( H | 0 ) ? H : v; I = w;

							}A = A + 1 | 0; J = f[ g >> 2 ] | 0;

						} while ( ( A | 0 ) < ( J | 0 ) );if ( ( J | 0 ) > 0 ) {

							A = 0; do {

								y = ( f[ x + ( A << 2 ) >> 2 ] | 0 ) + ( f[ I + ( A << 2 ) >> 2 ] | 0 ) | 0; q = z + ( A << 2 ) | 0; f[ q >> 2 ] = y; if ( ( y | 0 ) <= ( f[ h >> 2 ] | 0 ) ) {

									if ( ( y | 0 ) < ( f[ l >> 2 ] | 0 ) ) {

										K = ( f[ i >> 2 ] | 0 ) + y | 0; u = 44;

									}

								} else {

									K = y - ( f[ i >> 2 ] | 0 ) | 0; u = 44;

								} if ( ( u | 0 ) == 44 ) {

									u = 0; f[ q >> 2 ] = K;

								}A = A + 1 | 0; q = f[ g >> 2 ] | 0;

							} while ( ( A | 0 ) < ( q | 0 ) );G = q;

						} else G = J;

					} else G = p;

				}s = s + 1 | 0; if ( ( s | 0 ) >= ( t | 0 ) ) {

					u = 22; break;

				} else p = G;

			} if ( ( u | 0 ) == 22 ) {

				bn( j ); return 1;

			} else if ( ( u | 0 ) == 24 )um( m ); return 0;

		} function Fb( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, u = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0; g = a + 8 | 0; f[ g >> 2 ] = e; d = a + 32 | 0; h = a + 36 | 0; i = f[ h >> 2 ] | 0; j = f[ d >> 2 ] | 0; k = i - j >> 2; l = j; j = i; if ( k >>> 0 >= e >>> 0 ) if ( k >>> 0 > e >>> 0 ? ( i = l + ( e << 2 ) | 0, ( i | 0 ) != ( j | 0 ) ) : 0 ) {

				f[ h >> 2 ] = j + ( ~ ( ( j + - 4 - i | 0 ) >>> 2 ) << 2 ); m = e;

			} else m = e; else {

				ff( d, e - k | 0 ); m = f[ g >> 2 ] | 0;

			}k = f[ a + 48 >> 2 ] | 0; d = f[ a + 52 >> 2 ] | 0; i = e >>> 0 > 1073741823 ? - 1 : e << 2; j = an( i ) | 0; Vf( j | 0, 0, i | 0 ) | 0; if ( ( m | 0 ) > 0 ) {

				i = a + 16 | 0; h = a + 32 | 0; l = a + 12 | 0; n = 0; do {

					o = f[ j + ( n << 2 ) >> 2 ] | 0; p = f[ i >> 2 ] | 0; if ( ( o | 0 ) > ( p | 0 ) ) {

						q = f[ h >> 2 ] | 0; f[ q + ( n << 2 ) >> 2 ] = p; r = q;

					} else {

						q = f[ l >> 2 ] | 0; p = f[ h >> 2 ] | 0; f[ p + ( n << 2 ) >> 2 ] = ( o | 0 ) < ( q | 0 ) ? q : o; r = p;

					}n = n + 1 | 0; s = f[ g >> 2 ] | 0;

				} while ( ( n | 0 ) < ( s | 0 ) );if ( ( s | 0 ) > 0 ) {

					n = a + 20 | 0; h = 0; do {

						p = ( f[ b + ( h << 2 ) >> 2 ] | 0 ) + ( f[ r + ( h << 2 ) >> 2 ] | 0 ) | 0; o = c + ( h << 2 ) | 0; f[ o >> 2 ] = p; if ( ( p | 0 ) <= ( f[ i >> 2 ] | 0 ) ) {

							if ( ( p | 0 ) < ( f[ l >> 2 ] | 0 ) ) {

								t = ( f[ n >> 2 ] | 0 ) + p | 0; u = 18;

							}

						} else {

							t = p - ( f[ n >> 2 ] | 0 ) | 0; u = 18;

						} if ( ( u | 0 ) == 18 ) {

							u = 0; f[ o >> 2 ] = t;

						}h = h + 1 | 0; o = f[ g >> 2 ] | 0;

					} while ( ( h | 0 ) < ( o | 0 ) );v = o;

				} else v = s;

			} else v = m; m = f[ a + 56 >> 2 ] | 0; s = f[ m >> 2 ] | 0; h = ( f[ m + 4 >> 2 ] | 0 ) - s | 0; t = h >> 2; if ( ( h | 0 ) <= 4 ) {

				bn( j ); return 1;

			}h = a + 16 | 0; n = a + 32 | 0; l = a + 12 | 0; i = a + 20 | 0; a = k + 64 | 0; r = k + 28 | 0; o = ( e | 0 ) > 0; p = s; s = 1; q = v; while ( 1 ) {

				if ( t >>> 0 <= s >>> 0 ) {

					u = 24; break;

				}v = f[ p + ( s << 2 ) >> 2 ] | 0; w = X( s, e ) | 0; if ( ( ( ( v | 0 ) != - 1 ? ( f[ ( f[ k >> 2 ] | 0 ) + ( v >>> 5 << 2 ) >> 2 ] & 1 << ( v & 31 ) | 0 ) == 0 : 0 ) ? ( x = f[ ( f[ ( f[ a >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0, ( x | 0 ) != - 1 ) : 0 ) ? ( v = f[ r >> 2 ] | 0, y = f[ d >> 2 ] | 0, z = f[ y + ( f[ v + ( x << 2 ) >> 2 ] << 2 ) >> 2 ] | 0, A = x + 1 | 0, B = f[ y + ( f[ v + ( ( ( ( A >>> 0 ) % 3 | 0 | 0 ) == 0 ? x + - 2 | 0 : A ) << 2 ) >> 2 ] << 2 ) >> 2 ] | 0, A = f[ y + ( f[ v + ( ( ( ( x >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) + x << 2 ) >> 2 ] << 2 ) >> 2 ] | 0, ( z | 0 ) < ( s | 0 ) & ( B | 0 ) < ( s | 0 ) & ( A | 0 ) < ( s | 0 ) ) : 0 ) {

					x = X( z, e ) | 0; z = X( B, e ) | 0; B = X( A, e ) | 0; if ( o ) {

						A = 0; do {

							f[ j + ( A << 2 ) >> 2 ] = ( f[ c + ( A + B << 2 ) >> 2 ] | 0 ) + ( f[ c + ( A + z << 2 ) >> 2 ] | 0 ) - ( f[ c + ( A + x << 2 ) >> 2 ] | 0 ); A = A + 1 | 0;

						} while ( ( A | 0 ) != ( e | 0 ) );

					}A = b + ( w << 2 ) | 0; x = c + ( w << 2 ) | 0; if ( ( q | 0 ) > 0 ) {

						z = 0; do {

							B = f[ j + ( z << 2 ) >> 2 ] | 0; v = f[ h >> 2 ] | 0; if ( ( B | 0 ) > ( v | 0 ) ) {

								y = f[ n >> 2 ] | 0; f[ y + ( z << 2 ) >> 2 ] = v; C = y;

							} else {

								y = f[ l >> 2 ] | 0; v = f[ n >> 2 ] | 0; f[ v + ( z << 2 ) >> 2 ] = ( B | 0 ) < ( y | 0 ) ? y : B; C = v;

							}z = z + 1 | 0; D = f[ g >> 2 ] | 0;

						} while ( ( z | 0 ) < ( D | 0 ) );if ( ( D | 0 ) > 0 ) {

							z = 0; do {

								v = ( f[ A + ( z << 2 ) >> 2 ] | 0 ) + ( f[ C + ( z << 2 ) >> 2 ] | 0 ) | 0; B = x + ( z << 2 ) | 0; f[ B >> 2 ] = v; if ( ( v | 0 ) <= ( f[ h >> 2 ] | 0 ) ) {

									if ( ( v | 0 ) < ( f[ l >> 2 ] | 0 ) ) {

										E = ( f[ i >> 2 ] | 0 ) + v | 0; u = 53;

									}

								} else {

									E = v - ( f[ i >> 2 ] | 0 ) | 0; u = 53;

								} if ( ( u | 0 ) == 53 ) {

									u = 0; f[ B >> 2 ] = E;

								}z = z + 1 | 0; B = f[ g >> 2 ] | 0;

							} while ( ( z | 0 ) < ( B | 0 ) );F = B;

						} else F = D;

					} else F = q;

				} else {

					z = c + ( ( X( s + - 1 | 0, e ) | 0 ) << 2 ) | 0; x = b + ( w << 2 ) | 0; A = c + ( w << 2 ) | 0; if ( ( q | 0 ) > 0 ) {

						B = 0; do {

							v = f[ z + ( B << 2 ) >> 2 ] | 0; y = f[ h >> 2 ] | 0; if ( ( v | 0 ) > ( y | 0 ) ) {

								G = f[ n >> 2 ] | 0; f[ G + ( B << 2 ) >> 2 ] = y; H = G;

							} else {

								G = f[ l >> 2 ] | 0; y = f[ n >> 2 ] | 0; f[ y + ( B << 2 ) >> 2 ] = ( v | 0 ) < ( G | 0 ) ? G : v; H = y;

							}B = B + 1 | 0; I = f[ g >> 2 ] | 0;

						} while ( ( B | 0 ) < ( I | 0 ) );if ( ( I | 0 ) > 0 ) {

							B = 0; do {

								z = ( f[ x + ( B << 2 ) >> 2 ] | 0 ) + ( f[ H + ( B << 2 ) >> 2 ] | 0 ) | 0; w = A + ( B << 2 ) | 0; f[ w >> 2 ] = z; if ( ( z | 0 ) <= ( f[ h >> 2 ] | 0 ) ) {

									if ( ( z | 0 ) < ( f[ l >> 2 ] | 0 ) ) {

										J = ( f[ i >> 2 ] | 0 ) + z | 0; u = 41;

									}

								} else {

									J = z - ( f[ i >> 2 ] | 0 ) | 0; u = 41;

								} if ( ( u | 0 ) == 41 ) {

									u = 0; f[ w >> 2 ] = J;

								}B = B + 1 | 0; w = f[ g >> 2 ] | 0;

							} while ( ( B | 0 ) < ( w | 0 ) );F = w;

						} else F = I;

					} else F = q;

				}s = s + 1 | 0; if ( ( s | 0 ) >= ( t | 0 ) ) {

					u = 22; break;

				} else q = F;

			} if ( ( u | 0 ) == 22 ) {

				bn( j ); return 1;

			} else if ( ( u | 0 ) == 24 )um( m ); return 0;

		} function Gb( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0, s = 0, t = 0, v = 0, w = 0, x = 0, y = 0, z = 0, A = 0, B = 0, C = 0, D = 0, E = 0, F = 0, G = 0, H = 0, I = 0, J = 0, K = 0, L = 0, M = 0, N = 0, O = 0, P = 0, Q = 0, R = 0, S = 0, T = 0; c = u; u = u + 16 | 0; d = c; e = f[ b >> 2 ] | 0; b = a + 8 | 0; g = e + 1 | 0; if ( ( e | 0 ) != - 1 ) {

				h = ( ( g >>> 0 ) % 3 | 0 | 0 ) == 0 ? e + - 2 | 0 : g; g = e + ( ( ( e >>> 0 ) % 3 | 0 | 0 ) == 0 ? 2 : - 1 ) | 0; i = ( e >>> 0 ) / 3 | 0; j = a + 212 | 0; k = a + 216 | 0; l = a + 360 | 0; m = f[ ( f[ ( f[ b >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( e << 2 ) >> 2 ] | 0; if ( ( m | 0 ) != - 1 ) if ( ( ( m >>> 0 ) / 3 | 0 ) >>> 0 >= i >>> 0 ? ( f[ k >> 2 ] | 0 ) != ( f[ j >> 2 ] | 0 ) : 0 ) {

					m = 0; do {

						if ( Wg( ( f[ l >> 2 ] | 0 ) + ( m << 4 ) | 0 ) | 0 ) {

							n = f[ j >> 2 ] | 0; f[ d >> 2 ] = e; o = n + ( m * 144 | 0 ) + 136 | 0; p = f[ o >> 2 ] | 0; if ( p >>> 0 < ( f[ n + ( m * 144 | 0 ) + 140 >> 2 ] | 0 ) >>> 0 ) {

								f[ p >> 2 ] = e; f[ o >> 2 ] = p + 4;

							} else xf( n + ( m * 144 | 0 ) + 132 | 0, d );

						}m = m + 1 | 0;

					} while ( m >>> 0 < ( ( ( f[ k >> 2 ] | 0 ) - ( f[ j >> 2 ] | 0 ) | 0 ) / 144 | 0 ) >>> 0 );q = i; r = g; s = d; t = d; v = h; w = k; x = j; y = l; z = j;

				} else {

					q = i; r = g; s = d; t = d; v = h; w = k; x = j; y = l; z = j;

				} else {

					A = i; B = d; C = d; D = j; E = l; F = g; G = h; H = k; I = j; J = 4;

				}

			} else {

				j = a + 212 | 0; A = - 1; B = d; C = d; D = j; E = a + 360 | 0; F = - 1; G = - 1; H = a + 216 | 0; I = j; J = 4;

			} if ( ( J | 0 ) == 4 ) {

				j = f[ H >> 2 ] | 0; a = f[ I >> 2 ] | 0; if ( ( j | 0 ) == ( a | 0 ) ) {

					q = A; r = F; s = B; t = C; v = G; w = H; x = I; y = E; z = D;

				} else {

					k = 0; h = j; j = a; while ( 1 ) {

						a = j; f[ d >> 2 ] = e; g = a + ( k * 144 | 0 ) + 136 | 0; l = f[ g >> 2 ] | 0; if ( l >>> 0 < ( f[ a + ( k * 144 | 0 ) + 140 >> 2 ] | 0 ) >>> 0 ) {

							f[ l >> 2 ] = e; f[ g >> 2 ] = l + 4; K = j; L = h;

						} else {

							xf( a + ( k * 144 | 0 ) + 132 | 0, d ); K = f[ I >> 2 ] | 0; L = f[ H >> 2 ] | 0;

						}k = k + 1 | 0; if ( k >>> 0 >= ( ( L - K | 0 ) / 144 | 0 ) >>> 0 ) {

							q = A; r = F; s = B; t = C; v = G; w = H; x = I; y = E; z = D; break;

						} else {

							h = L; j = K;

						}

					}

				}

			} if ( ( v | 0 ) != - 1 ? ( K = f[ ( f[ ( f[ b >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( v << 2 ) >> 2 ] | 0, ( K | 0 ) != - 1 ) : 0 ) {

				if ( ( ( K >>> 0 ) / 3 | 0 ) >>> 0 >= q >>> 0 ? ( f[ w >> 2 ] | 0 ) != ( f[ x >> 2 ] | 0 ) : 0 ) {

					K = 0; do {

						if ( Wg( ( f[ y >> 2 ] | 0 ) + ( K << 4 ) | 0 ) | 0 ) {

							j = f[ z >> 2 ] | 0; f[ d >> 2 ] = v; L = j + ( K * 144 | 0 ) + 136 | 0; h = f[ L >> 2 ] | 0; if ( h >>> 0 < ( f[ j + ( K * 144 | 0 ) + 140 >> 2 ] | 0 ) >>> 0 ) {

								f[ h >> 2 ] = v; f[ L >> 2 ] = h + 4;

							} else xf( j + ( K * 144 | 0 ) + 132 | 0, d );

						}K = K + 1 | 0;

					} while ( K >>> 0 < ( ( ( f[ w >> 2 ] | 0 ) - ( f[ x >> 2 ] | 0 ) | 0 ) / 144 | 0 ) >>> 0 );

				}

			} else J = 27; if ( ( J | 0 ) == 27 ? ( J = f[ w >> 2 ] | 0, K = f[ x >> 2 ] | 0, ( J | 0 ) != ( K | 0 ) ) : 0 ) {

				j = 0; h = K; K = J; while ( 1 ) {

					J = h; f[ d >> 2 ] = v; L = J + ( j * 144 | 0 ) + 136 | 0; D = f[ L >> 2 ] | 0; if ( D >>> 0 < ( f[ J + ( j * 144 | 0 ) + 140 >> 2 ] | 0 ) >>> 0 ) {

						f[ D >> 2 ] = v; f[ L >> 2 ] = D + 4; M = h; N = K;

					} else {

						xf( J + ( j * 144 | 0 ) + 132 | 0, d ); M = f[ x >> 2 ] | 0; N = f[ w >> 2 ] | 0;

					}j = j + 1 | 0; if ( j >>> 0 >= ( ( N - M | 0 ) / 144 | 0 ) >>> 0 ) break; else {

						h = M; K = N;

					}

				}

			} if ( ( r | 0 ) != - 1 ? ( N = f[ ( f[ ( f[ b >> 2 ] | 0 ) + 12 >> 2 ] | 0 ) + ( r << 2 ) >> 2 ] | 0, ( N | 0 ) != - 1 ) : 0 ) {

				if ( ( ( N >>> 0 ) / 3 | 0 ) >>> 0 < q >>> 0 ) {

					u = c; return 1;

				} if ( ( f[ w >> 2 ] | 0 ) == ( f[ x >> 2 ] | 0 ) ) {

					u = c; return 1;

				} else O = 0; do {

					if ( Wg( ( f[ y >> 2 ] | 0 ) + ( O << 4 ) | 0 ) | 0 ) {

						q = f[ z >> 2 ] | 0; f[ d >> 2 ] = r; N = q + ( O * 144 | 0 ) + 136 | 0; b = f[ N >> 2 ] | 0; if ( b >>> 0 < ( f[ q + ( O * 144 | 0 ) + 140 >> 2 ] | 0 ) >>> 0 ) {

							f[ b >> 2 ] = r; f[ N >> 2 ] = b + 4;

						} else xf( q + ( O * 144 | 0 ) + 132 | 0, d );

					}O = O + 1 | 0;

				} while ( O >>> 0 < ( ( ( f[ w >> 2 ] | 0 ) - ( f[ x >> 2 ] | 0 ) | 0 ) / 144 | 0 ) >>> 0 );u = c; return 1;

			}O = f[ w >> 2 ] | 0; z = f[ x >> 2 ] | 0; if ( ( O | 0 ) == ( z | 0 ) ) {

				u = c; return 1;

			} else {

				P = 0; Q = z; R = O;

			} while ( 1 ) {

				O = Q; f[ d >> 2 ] = r; z = O + ( P * 144 | 0 ) + 136 | 0; y = f[ z >> 2 ] | 0; if ( y >>> 0 < ( f[ O + ( P * 144 | 0 ) + 140 >> 2 ] | 0 ) >>> 0 ) {

					f[ y >> 2 ] = r; f[ z >> 2 ] = y + 4; S = Q; T = R;

				} else {

					xf( O + ( P * 144 | 0 ) + 132 | 0, d ); S = f[ x >> 2 ] | 0; T = f[ w >> 2 ] | 0;

				}P = P + 1 | 0; if ( P >>> 0 >= ( ( T - S | 0 ) / 144 | 0 ) >>> 0 ) break; else {

					Q = S; R = T;

				}

			}u = c; return 1;

		} function Hb( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0, q = 0, r = 0; e = u; u = u + 16 | 0; g = e; i = c + 8 | 0; j = i; k = f[ j >> 2 ] | 0; l = f[ j + 4 >> 2 ] | 0; j = c + 16 | 0; m = j; n = f[ m >> 2 ] | 0; o = Rj( n | 0, f[ m + 4 >> 2 ] | 0, 5, 0 ) | 0; m = I; if ( ( l | 0 ) < ( m | 0 ) | ( l | 0 ) == ( m | 0 ) & k >>> 0 < o >>> 0 ) {

				o = bj( 32 ) | 0; f[ g >> 2 ] = o; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 29; p = o; q = 9496; r = p + 29 | 0; do {

					b[ p >> 0 ] = b[ q >> 0 ] | 0; p = p + 1 | 0; q = q + 1 | 0;

				} while ( ( p | 0 ) < ( r | 0 ) );b[ o + 29 >> 0 ] = 0; f[ a >> 2 ] = - 2; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = e; return;

			}o = ( f[ c >> 2 ] | 0 ) + n | 0; b[ d >> 0 ] = b[ o >> 0 ] | 0; b[ d + 1 >> 0 ] = b[ o + 1 >> 0 ] | 0; b[ d + 2 >> 0 ] = b[ o + 2 >> 0 ] | 0; b[ d + 3 >> 0 ] = b[ o + 3 >> 0 ] | 0; b[ d + 4 >> 0 ] = b[ o + 4 >> 0 ] | 0; o = j; n = Rj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, 5, 0 ) | 0; o = I; k = j; f[ k >> 2 ] = n; f[ k + 4 >> 2 ] = o; if ( jh( d, 9526, 5 ) | 0 ) {

				k = bj( 32 ) | 0; f[ g >> 2 ] = k; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 17; p = k; q = 9532; r = p + 17 | 0; do {

					b[ p >> 0 ] = b[ q >> 0 ] | 0; p = p + 1 | 0; q = q + 1 | 0;

				} while ( ( p | 0 ) < ( r | 0 ) );b[ k + 17 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = e; return;

			}k = i; m = f[ k + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( o | 0 ) | ( ( m | 0 ) == ( o | 0 ) ? ( f[ k >> 2 ] | 0 ) >>> 0 > n >>> 0 : 0 ) ) ) {

				k = bj( 32 ) | 0; f[ g >> 2 ] = k; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 29; p = k; q = 9496; r = p + 29 | 0; do {

					b[ p >> 0 ] = b[ q >> 0 ] | 0; p = p + 1 | 0; q = q + 1 | 0;

				} while ( ( p | 0 ) < ( r | 0 ) );b[ k + 29 >> 0 ] = 0; f[ a >> 2 ] = - 2; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = e; return;

			}b[ d + 5 >> 0 ] = b[ ( f[ c >> 2 ] | 0 ) + n >> 0 ] | 0; n = j; k = Rj( f[ n >> 2 ] | 0, f[ n + 4 >> 2 ] | 0, 1, 0 ) | 0; n = I; o = j; f[ o >> 2 ] = k; f[ o + 4 >> 2 ] = n; o = i; m = f[ o + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( n | 0 ) | ( ( m | 0 ) == ( n | 0 ) ? ( f[ o >> 2 ] | 0 ) >>> 0 > k >>> 0 : 0 ) ) ) {

				o = bj( 32 ) | 0; f[ g >> 2 ] = o; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 29; p = o; q = 9496; r = p + 29 | 0; do {

					b[ p >> 0 ] = b[ q >> 0 ] | 0; p = p + 1 | 0; q = q + 1 | 0;

				} while ( ( p | 0 ) < ( r | 0 ) );b[ o + 29 >> 0 ] = 0; f[ a >> 2 ] = - 2; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = e; return;

			}b[ d + 6 >> 0 ] = b[ ( f[ c >> 2 ] | 0 ) + k >> 0 ] | 0; k = j; o = Rj( f[ k >> 2 ] | 0, f[ k + 4 >> 2 ] | 0, 1, 0 ) | 0; k = I; n = j; f[ n >> 2 ] = o; f[ n + 4 >> 2 ] = k; n = i; m = f[ n + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( k | 0 ) | ( ( m | 0 ) == ( k | 0 ) ? ( f[ n >> 2 ] | 0 ) >>> 0 > o >>> 0 : 0 ) ) ) {

				n = bj( 32 ) | 0; f[ g >> 2 ] = n; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 29; p = n; q = 9496; r = p + 29 | 0; do {

					b[ p >> 0 ] = b[ q >> 0 ] | 0; p = p + 1 | 0; q = q + 1 | 0;

				} while ( ( p | 0 ) < ( r | 0 ) );b[ n + 29 >> 0 ] = 0; f[ a >> 2 ] = - 2; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = e; return;

			}b[ d + 7 >> 0 ] = b[ ( f[ c >> 2 ] | 0 ) + o >> 0 ] | 0; o = j; n = Rj( f[ o >> 2 ] | 0, f[ o + 4 >> 2 ] | 0, 1, 0 ) | 0; o = I; k = j; f[ k >> 2 ] = n; f[ k + 4 >> 2 ] = o; k = i; m = f[ k + 4 >> 2 ] | 0; if ( ! ( ( m | 0 ) > ( o | 0 ) | ( ( m | 0 ) == ( o | 0 ) ? ( f[ k >> 2 ] | 0 ) >>> 0 > n >>> 0 : 0 ) ) ) {

				k = bj( 32 ) | 0; f[ g >> 2 ] = k; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 29; p = k; q = 9496; r = p + 29 | 0; do {

					b[ p >> 0 ] = b[ q >> 0 ] | 0; p = p + 1 | 0; q = q + 1 | 0;

				} while ( ( p | 0 ) < ( r | 0 ) );b[ k + 29 >> 0 ] = 0; f[ a >> 2 ] = - 2; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = e; return;

			}b[ d + 8 >> 0 ] = b[ ( f[ c >> 2 ] | 0 ) + n >> 0 ] | 0; n = j; k = f[ n >> 2 ] | 0; o = f[ n + 4 >> 2 ] | 0; n = Rj( k | 0, o | 0, 1, 0 ) | 0; m = j; f[ m >> 2 ] = n; f[ m + 4 >> 2 ] = I; m = i; i = f[ m >> 2 ] | 0; l = f[ m + 4 >> 2 ] | 0; m = Rj( k | 0, o | 0, 3, 0 ) | 0; o = I; if ( ! ( ( l | 0 ) < ( o | 0 ) | ( l | 0 ) == ( o | 0 ) & i >>> 0 < m >>> 0 ) ) {

				m = d + 10 | 0; d = ( f[ c >> 2 ] | 0 ) + n | 0; n = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8; b[ m >> 0 ] = n; b[ m + 1 >> 0 ] = n >> 8; n = j; m = Rj( f[ n >> 2 ] | 0, f[ n + 4 >> 2 ] | 0, 2, 0 ) | 0; n = j; f[ n >> 2 ] = m; f[ n + 4 >> 2 ] = I; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; u = e; return;

			}n = bj( 32 ) | 0; f[ g >> 2 ] = n; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 29; p = n; q = 9496; r = p + 29 | 0; do {

				b[ p >> 0 ] = b[ q >> 0 ] | 0; p = p + 1 | 0; q = q + 1 | 0;

			} while ( ( p | 0 ) < ( r | 0 ) );b[ n + 29 >> 0 ] = 0; f[ a >> 2 ] = - 2; Rf( a + 4 | 0, g ); if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); u = e; return;

		}
		function df( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; c = u; u = u + 16 | 0; d = c; e = Gd( a, d, b ) | 0; g = f[ e >> 2 ] | 0; if ( g | 0 ) {

				h = g; i = h + 28 | 0; u = c; return i | 0;

			}g = bj( 40 ) | 0; Rf( g + 16 | 0, b ); b = g + 28 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; b = f[ d >> 2 ] | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = b; f[ e >> 2 ] = g; b = f[ f[ a >> 2 ] >> 2 ] | 0; if ( ! b )j = g; else {

				f[ a >> 2 ] = b; j = f[ e >> 2 ] | 0;

			}Lc( f[ a + 4 >> 2 ] | 0, j ); j = a + 8 | 0; f[ j >> 2 ] = ( f[ j >> 2 ] | 0 ) + 1; h = g; i = h + 28 | 0; u = c; return i | 0;

		} function ef( a, c, d, e, g, h, i, j ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; h = h | 0; i = i | 0; j = j | 0; var k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; k = u; u = u + 16 | 0; l = k; if ( ( - 18 - c | 0 ) >>> 0 < d >>> 0 )um( a ); if ( ( b[ a + 11 >> 0 ] | 0 ) < 0 )m = f[ a >> 2 ] | 0; else m = a; if ( c >>> 0 < 2147483623 ) {

				n = d + c | 0; d = c << 1; o = n >>> 0 < d >>> 0 ? d : n; p = o >>> 0 < 11 ? 11 : o + 16 & - 16;

			} else p = - 17; o = bj( p ) | 0; if ( g | 0 )Ok( o, m, g ) | 0; if ( i | 0 )Ok( o + g | 0, j, i ) | 0; j = e - h | 0; e = j - g | 0; if ( e | 0 )Ok( o + g + i | 0, m + g + h | 0, e ) | 0; if ( ( c | 0 ) != 10 )dn( m ); f[ a >> 2 ] = o; f[ a + 8 >> 2 ] = p | - 2147483648; p = j + i | 0; f[ a + 4 >> 2 ] = p; b[ l >> 0 ] = 0; Rl( o + p | 0, l ); u = k; return;

		} function ff( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; e = a + 4 | 0; g = f[ e >> 2 ] | 0; if ( d - g >> 2 >>> 0 >= b >>> 0 ) {

				Vf( g | 0, 0, b << 2 | 0 ) | 0; f[ e >> 2 ] = g + ( b << 2 ); return;

			}h = f[ a >> 2 ] | 0; i = g - h | 0; g = i >> 2; j = g + b | 0; if ( j >>> 0 > 1073741823 )um( a ); k = d - h | 0; d = k >> 1; l = k >> 2 >>> 0 < 536870911 ? ( d >>> 0 < j >>> 0 ? j : d ) : 1073741823; do if ( l ) if ( l >>> 0 > 1073741823 ) {

				d = ra( 8 ) | 0; Yk( d, 9789 ); f[ d >> 2 ] = 3704; va( d | 0, 856, 80 );

			} else {

				d = bj( l << 2 ) | 0; m = d; n = d; break;

			} else {

				m = 0; n = 0;

			} while ( 0 );d = m + ( g << 2 ) | 0; Vf( d | 0, 0, b << 2 | 0 ) | 0; if ( ( i | 0 ) > 0 )ge( n | 0, h | 0, i | 0 ) | 0; f[ a >> 2 ] = m; f[ e >> 2 ] = d + ( b << 2 ); f[ c >> 2 ] = m + ( l << 2 ); if ( ! h ) return; dn( h ); return;

		} function gf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; b = f[ a >> 2 ] | 0; if ( ! b ) return; c = a + 4 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) == ( b | 0 ) )e = b; else {

				g = d; do {

					f[ c >> 2 ] = g + - 144; d = f[ g + - 12 >> 2 ] | 0; if ( d | 0 ) {

						h = g + - 8 | 0; i = f[ h >> 2 ] | 0; if ( ( i | 0 ) != ( d | 0 ) )f[ h >> 2 ] = i + ( ~ ( ( i + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

					}d = f[ g + - 28 >> 2 ] | 0; if ( d | 0 ) {

						i = g + - 24 | 0; h = f[ i >> 2 ] | 0; if ( ( h | 0 ) != ( d | 0 ) )f[ i >> 2 ] = h + ( ~ ( ( h + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

					}d = f[ g + - 40 >> 2 ] | 0; if ( d | 0 ) {

						h = g + - 36 | 0; i = f[ h >> 2 ] | 0; if ( ( i | 0 ) != ( d | 0 ) )f[ h >> 2 ] = i + ( ~ ( ( i + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

					}tf( g + - 140 | 0 ); g = f[ c >> 2 ] | 0;

				} while ( ( g | 0 ) != ( b | 0 ) );e = f[ a >> 2 ] | 0;

			}dn( e ); return;

		} function hf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; a = u; u = u + 16 | 0; e = a; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; g = gg( d ) | 0; if ( g >>> 0 > 4294967279 )um( e ); if ( g >>> 0 < 11 ) {

				b[ e + 11 >> 0 ] = g; if ( ! g )h = e; else {

					i = e; j = 6;

				}

			} else {

				k = g + 16 & - 16; l = bj( k ) | 0; f[ e >> 2 ] = l; f[ e + 8 >> 2 ] = k | - 2147483648; f[ e + 4 >> 2 ] = g; i = l; j = 6;

			} if ( ( j | 0 ) == 6 ) {

				ge( i | 0, d | 0, g | 0 ) | 0; h = i;

			}b[ h + g >> 0 ] = 0; g = ( $b( c, e ) | 0 ) != 0; if ( ( b[ e + 11 >> 0 ] | 0 ) >= 0 ) {

				u = a; return g | 0;

			}dn( f[ e >> 2 ] | 0 ); u = a; return g | 0;

		} function jf( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = a + 8 | 0; e = f[ d >> 2 ] | 0; g = a + 4 | 0; h = f[ g >> 2 ] | 0; if ( ( e - h | 0 ) >>> 0 >= c >>> 0 ) {

				i = c; j = h; do {

					b[ j >> 0 ] = 0; j = ( f[ g >> 2 ] | 0 ) + 1 | 0; f[ g >> 2 ] = j; i = i + - 1 | 0;

				} while ( ( i | 0 ) != 0 );return;

			}i = f[ a >> 2 ] | 0; j = h - i | 0; h = j + c | 0; if ( ( h | 0 ) < 0 )um( a ); k = e - i | 0; i = k << 1; e = k >>> 0 < 1073741823 ? ( i >>> 0 < h >>> 0 ? h : i ) : 2147483647; if ( ! e )l = 0; else l = bj( e ) | 0; i = l + j | 0; j = l + e | 0; e = c; c = i; l = i; do {

				b[ l >> 0 ] = 0; l = c + 1 | 0; c = l; e = e + - 1 | 0;

			} while ( ( e | 0 ) != 0 );e = f[ a >> 2 ] | 0; l = ( f[ g >> 2 ] | 0 ) - e | 0; h = i + ( 0 - l ) | 0; if ( ( l | 0 ) > 0 )ge( h | 0, e | 0, l | 0 ) | 0; f[ a >> 2 ] = h; f[ g >> 2 ] = c; f[ d >> 2 ] = j; if ( ! e ) return; dn( e ); return;

		} function kf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, i = 0; d = u; u = u + 32 | 0; c = d; if ( ( h[ ( f[ a + 4 >> 2 ] | 0 ) + 36 >> 0 ] << 8 & 65535 ) > 511 ? ! ( Na[ f[ ( f[ a >> 2 ] | 0 ) + 52 >> 2 ] & 127 ]( a ) | 0 ) : 0 ) {

				e = 0; u = d; return e | 0;

			}f[ c >> 2 ] = 956; f[ c + 4 >> 2 ] = - 1; g = c + 8 | 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; f[ g + 12 >> 2 ] = 0; Mh( c, f[ a + 24 >> 2 ] | 0, f[ a + 28 >> 2 ] | 0, b[ ( f[ a + 8 >> 2 ] | 0 ) + 24 >> 0 ] | 0, $( n[ a + 32 >> 2 ] ) ); i = gh( c, f[ a + 16 >> 2 ] | 0 ) | 0; f[ c >> 2 ] = 956; a = f[ g >> 2 ] | 0; if ( a | 0 ) {

				g = c + 12 | 0; c = f[ g >> 2 ] | 0; if ( ( c | 0 ) != ( a | 0 ) )f[ g >> 2 ] = c + ( ~ ( ( c + - 4 - a | 0 ) >>> 2 ) << 2 ); dn( a );

			}e = i; u = d; return e | 0;

		} function lf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0; b = f[ a + 4 >> 2 ] | 0; c = a + 8 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) ) {

				e = d; do {

					f[ c >> 2 ] = e + - 144; d = f[ e + - 12 >> 2 ] | 0; if ( d | 0 ) {

						g = e + - 8 | 0; h = f[ g >> 2 ] | 0; if ( ( h | 0 ) != ( d | 0 ) )f[ g >> 2 ] = h + ( ~ ( ( h + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

					}d = f[ e + - 28 >> 2 ] | 0; if ( d | 0 ) {

						h = e + - 24 | 0; g = f[ h >> 2 ] | 0; if ( ( g | 0 ) != ( d | 0 ) )f[ h >> 2 ] = g + ( ~ ( ( g + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

					}d = f[ e + - 40 >> 2 ] | 0; if ( d | 0 ) {

						g = e + - 36 | 0; h = f[ g >> 2 ] | 0; if ( ( h | 0 ) != ( d | 0 ) )f[ g >> 2 ] = h + ( ~ ( ( h + - 4 - d | 0 ) >>> 2 ) << 2 ); dn( d );

					}tf( e + - 140 | 0 ); e = f[ c >> 2 ] | 0;

				} while ( ( e | 0 ) != ( b | 0 ) );

			}b = f[ a >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function mf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; b = f[ a + 76 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 80 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 64 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 68 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( b | 0 ) )f[ d >> 2 ] = b; dn( b );

			}b = f[ a + 48 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 52 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 24 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 28 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 12 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 16 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a >> 2 ] | 0; if ( ! b ) return; c = a + 4 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function nf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; a = u; u = u + 32 | 0; e = a + 12 | 0; g = a; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = gg( d ) | 0; if ( h >>> 0 > 4294967279 )um( g ); if ( h >>> 0 < 11 ) {

				b[ g + 11 >> 0 ] = h; if ( ! h )i = g; else {

					j = g; k = 6;

				}

			} else {

				l = h + 16 & - 16; m = bj( l ) | 0; f[ g >> 2 ] = m; f[ g + 8 >> 2 ] = l | - 2147483648; f[ g + 4 >> 2 ] = h; j = m; k = 6;

			} if ( ( k | 0 ) == 6 ) {

				ge( j | 0, d | 0, h | 0 ) | 0; i = j;

			}b[ i + h >> 0 ] = 0; h = Sf( c, g, e ) | 0; if ( ( b[ g + 11 >> 0 ] | 0 ) < 0 )dn( f[ g >> 2 ] | 0 ); if ( ( b[ e + 11 >> 0 ] | 0 ) >= 0 ) {

				u = a; return h | 0;

			}dn( f[ e >> 2 ] | 0 ); u = a; return h | 0;

		} function of( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; e = u; u = u + 16 | 0; g = e; h = c + 11 | 0; i = b[ h >> 0 ] | 0; if ( i << 24 >> 24 < 0 )j = f[ c + 4 >> 2 ] | 0; else j = i & 255; k = j; j = i; while ( 1 ) {

				if ( j << 24 >> 24 < 0 )l = f[ c >> 2 ] | 0; else l = c; f[ g >> 2 ] = d; m = tj( l, k + 1 | 0, 12304, g ) | 0; if ( ( m | 0 ) > - 1 ) if ( m >>> 0 > k >>> 0 )n = m; else break; else n = k << 1 | 1; hg( c, n, 0 ); k = n; j = b[ h >> 0 ] | 0;

			}hg( c, m, 0 ); f[ a >> 2 ] = f[ c >> 2 ]; f[ a + 4 >> 2 ] = f[ c + 4 >> 2 ]; f[ a + 8 >> 2 ] = f[ c + 8 >> 2 ]; a = 0; while ( 1 ) {

				if ( ( a | 0 ) == 3 ) break; f[ c + ( a << 2 ) >> 2 ] = 0; a = a + 1 | 0;

			}u = e; return;

		} function pf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; b = a + 8 | 0; c = f[ b >> 2 ] | 0; if ( ( c | 0 ) < 0 ) {

				d = 0; return d | 0;

			}e = a + 4 | 0; a = f[ e >> 2 ] | 0; g = a + 4 | 0; h = f[ g >> 2 ] | 0; i = f[ a >> 2 ] | 0; j = h - i >> 2; k = i; i = h; if ( c >>> 0 <= j >>> 0 ) if ( c >>> 0 < j >>> 0 ? ( h = k + ( c << 2 ) | 0, ( h | 0 ) != ( i | 0 ) ) : 0 ) {

				f[ g >> 2 ] = i + ( ~ ( ( i + - 4 - h | 0 ) >>> 2 ) << 2 ); l = c;

			} else l = c; else {

				ff( a, c - j | 0 ); l = f[ b >> 2 ] | 0;

			} if ( ( l | 0 ) <= 0 ) {

				d = 1; return d | 0;

			}b = f[ e >> 2 ] | 0; e = f[ b >> 2 ] | 0; j = ( f[ b + 4 >> 2 ] | 0 ) - e >> 2; c = e; e = 0; while ( 1 ) {

				if ( j >>> 0 <= e >>> 0 ) {

					m = 10; break;

				}f[ c + ( e << 2 ) >> 2 ] = e; e = e + 1 | 0; if ( ( e | 0 ) >= ( l | 0 ) ) {

					d = 1; m = 12; break;

				}

			} if ( ( m | 0 ) == 10 )um( b ); else if ( ( m | 0 ) == 12 ) return d | 0; return 0;

		} function qf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; b = a + 140 | 0; c = f[ b >> 2 ] | 0; if ( ( c | 0 ) <= 0 ) {

				d = 1; return d | 0;

			}e = c << 4; g = an( c >>> 0 > 268435455 | e >>> 0 > 4294967291 ? - 1 : e + 4 | 0 ) | 0; f[ g >> 2 ] = c; e = g + 4 | 0; g = e + ( c << 4 ) | 0; c = e; do {

				Cm( c ); c = c + 16 | 0;

			} while ( ( c | 0 ) != ( g | 0 ) );g = a + 136 | 0; c = f[ g >> 2 ] | 0; f[ g >> 2 ] = e; if ( c | 0 ) {

				e = c + - 4 | 0; h = f[ e >> 2 ] | 0; if ( h | 0 ) {

					i = c + ( h << 4 ) | 0; do i = i + - 16 | 0; while ( ( i | 0 ) != ( c | 0 ) );

				}bn( e );

			} if ( ( f[ b >> 2 ] | 0 ) <= 0 ) {

				d = 1; return d | 0;

			}e = 0; while ( 1 ) {

				if ( ! ( td( ( f[ g >> 2 ] | 0 ) + ( e << 4 ) | 0, a ) | 0 ) ) {

					d = 0; j = 13; break;

				}e = e + 1 | 0; if ( ( e | 0 ) >= ( f[ b >> 2 ] | 0 ) ) {

					d = 1; j = 13; break;

				}

			} if ( ( j | 0 ) == 13 ) return d | 0; return 0;

		} function rf( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; c = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( ! c ) return; a = f[ c + 28 >> 2 ] | 0; if ( a | 0 ) {

				d = a; do {

					a = d; d = f[ d >> 2 ] | 0; e = a + 8 | 0; rf( a + 20 | 0 ); if ( ( b[ e + 11 >> 0 ] | 0 ) < 0 )dn( f[ e >> 2 ] | 0 ); dn( a );

				} while ( ( d | 0 ) != 0 );

			}d = c + 20 | 0; a = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( a | 0 )dn( a ); a = f[ c + 8 >> 2 ] | 0; if ( a | 0 ) {

				d = a; do {

					a = d; d = f[ d >> 2 ] | 0; e = a + 8 | 0; g = f[ a + 20 >> 2 ] | 0; if ( g | 0 ) {

						h = a + 24 | 0; if ( ( f[ h >> 2 ] | 0 ) != ( g | 0 ) )f[ h >> 2 ] = g; dn( g );

					} if ( ( b[ e + 11 >> 0 ] | 0 ) < 0 )dn( f[ e >> 2 ] | 0 ); dn( a );

				} while ( ( d | 0 ) != 0 );

			}d = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( d | 0 )dn( d ); dn( c ); return;

		} function sf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0; e = $b( a, c ) | 0; if ( ! e ) {

				g = 0; return g | 0;

			}c = f[ e + 20 >> 2 ] | 0; if ( ( ( f[ e + 24 >> 2 ] | 0 ) - c | 0 ) != 8 ) {

				g = 0; return g | 0;

			}e = c; c = e; a = h[ c >> 0 ] | h[ c + 1 >> 0 ] << 8 | h[ c + 2 >> 0 ] << 16 | h[ c + 3 >> 0 ] << 24; c = e + 4 | 0; e = h[ c >> 0 ] | h[ c + 1 >> 0 ] << 8 | h[ c + 2 >> 0 ] << 16 | h[ c + 3 >> 0 ] << 24; c = d; d = c; b[ d >> 0 ] = a; b[ d + 1 >> 0 ] = a >> 8; b[ d + 2 >> 0 ] = a >> 16; b[ d + 3 >> 0 ] = a >> 24; a = c + 4 | 0; b[ a >> 0 ] = e; b[ a + 1 >> 0 ] = e >> 8; b[ a + 2 >> 0 ] = e >> 16; b[ a + 3 >> 0 ] = e >> 24; g = 1; return g | 0;

		} function tf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; b = f[ a + 84 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 88 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 72 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 76 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( b | 0 ) )f[ d >> 2 ] = b; dn( b );

			}b = f[ a + 52 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 56 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 40 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 44 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 28 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 32 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 12 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function uf() {

			var a = 0, b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; a = u; u = u + 48 | 0; b = a + 32 | 0; c = a + 24 | 0; d = a + 16 | 0; e = a; g = a + 36 | 0; a = ej() | 0; if ( a | 0 ? ( h = f[ a >> 2 ] | 0, h | 0 ) : 0 ) {

				a = h + 48 | 0; i = f[ a >> 2 ] | 0; j = f[ a + 4 >> 2 ] | 0; if ( ! ( ( i & - 256 | 0 ) == 1126902528 & ( j | 0 ) == 1129074247 ) ) {

					f[ c >> 2 ] = 12443; zj( 12393, c );

				} if ( ( i | 0 ) == 1126902529 & ( j | 0 ) == 1129074247 )k = f[ h + 44 >> 2 ] | 0; else k = h + 80 | 0; f[ g >> 2 ] = k; k = f[ h >> 2 ] | 0; h = f[ k + 4 >> 2 ] | 0; if ( Pa[ f[ ( f[ 194 ] | 0 ) + 16 >> 2 ] & 31 ]( 776, k, g ) | 0 ) {

					k = f[ g >> 2 ] | 0; g = Na[ f[ ( f[ k >> 2 ] | 0 ) + 8 >> 2 ] & 127 ]( k ) | 0; f[ e >> 2 ] = 12443; f[ e + 4 >> 2 ] = h; f[ e + 8 >> 2 ] = g; zj( 12307, e );

				} else {

					f[ d >> 2 ] = 12443; f[ d + 4 >> 2 ] = h; zj( 12352, d );

				}

			}zj( 12431, b );

		} function vf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0; do if ( a ) {

				if ( c >>> 0 < 128 ) {

					b[ a >> 0 ] = c; e = 1; break;

				}d = ( Zm() | 0 ) + 188 | 0; if ( ! ( f[ f[ d >> 2 ] >> 2 ] | 0 ) ) if ( ( c & - 128 | 0 ) == 57216 ) {

					b[ a >> 0 ] = c; e = 1; break;

				} else {

					d = ln() | 0; f[ d >> 2 ] = 84; e = - 1; break;

				} if ( c >>> 0 < 2048 ) {

					b[ a >> 0 ] = c >>> 6 | 192; b[ a + 1 >> 0 ] = c & 63 | 128; e = 2; break;

				} if ( c >>> 0 < 55296 | ( c & - 8192 | 0 ) == 57344 ) {

					b[ a >> 0 ] = c >>> 12 | 224; b[ a + 1 >> 0 ] = c >>> 6 & 63 | 128; b[ a + 2 >> 0 ] = c & 63 | 128; e = 3; break;

				} if ( ( c + - 65536 | 0 ) >>> 0 < 1048576 ) {

					b[ a >> 0 ] = c >>> 18 | 240; b[ a + 1 >> 0 ] = c >>> 12 & 63 | 128; b[ a + 2 >> 0 ] = c >>> 6 & 63 | 128; b[ a + 3 >> 0 ] = c & 63 | 128; e = 4; break;

				} else {

					d = ln() | 0; f[ d >> 2 ] = 84; e = - 1; break;

				}

			} else e = 1; while ( 0 );return e | 0;

		} function wf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; b = f[ a + 92 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 96 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 76 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 80 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 64 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 68 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 52 >> 2 ] | 0; if ( b | 0 ) {

				d = a + 56 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}f[ a + 4 >> 2 ] = 2420; b = f[ a + 24 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 12 >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function xf( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; c = a + 4 | 0; d = f[ a >> 2 ] | 0; e = ( f[ c >> 2 ] | 0 ) - d | 0; g = e >> 2; h = g + 1 | 0; if ( h >>> 0 > 1073741823 )um( a ); i = a + 8 | 0; j = ( f[ i >> 2 ] | 0 ) - d | 0; k = j >> 1; l = j >> 2 >>> 0 < 536870911 ? ( k >>> 0 < h >>> 0 ? h : k ) : 1073741823; do if ( l ) if ( l >>> 0 > 1073741823 ) {

				k = ra( 8 ) | 0; Yk( k, 9789 ); f[ k >> 2 ] = 3704; va( k | 0, 856, 80 );

			} else {

				k = bj( l << 2 ) | 0; m = k; n = k; break;

			} else {

				m = 0; n = 0;

			} while ( 0 );k = m + ( g << 2 ) | 0; f[ k >> 2 ] = f[ b >> 2 ]; if ( ( e | 0 ) > 0 )ge( n | 0, d | 0, e | 0 ) | 0; f[ a >> 2 ] = m; f[ c >> 2 ] = k + 4; f[ i >> 2 ] = m + ( l << 2 ); if ( ! d ) return; dn( d ); return;

		} function yf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2464; b = a + 84 | 0; c = a + 4 | 0; d = c + 80 | 0; do {

				f[ c >> 2 ] = 0; c = c + 4 | 0;

			} while ( ( c | 0 ) < ( d | 0 ) );f[ b >> 2 ] = - 1; f[ a + 88 >> 2 ] = - 1; f[ a + 92 >> 2 ] = - 1; b = a + 152 | 0; c = a + 96 | 0; d = c + 56 | 0; do {

				f[ c >> 2 ] = 0; c = c + 4 | 0;

			} while ( ( c | 0 ) < ( d | 0 ) );n[ b >> 2 ] = $( 1.0 ); b = a + 224 | 0; c = a + 156 | 0; d = c + 68 | 0; do {

				f[ c >> 2 ] = 0; c = c + 4 | 0;

			} while ( ( c | 0 ) < ( d | 0 ) );Gi( b ); b = a + 372 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; f[ b + 16 >> 2 ] = 0; f[ a + 392 >> 2 ] = - 1; f[ a + 396 >> 2 ] = - 1; f[ a + 400 >> 2 ] = 2; f[ a + 404 >> 2 ] = 7; b = a + 408 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; f[ b + 16 >> 2 ] = 0; f[ b + 20 >> 2 ] = 0; return;

		} function zf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0.0; a = u; u = u + 32 | 0; e = a; g = a + 8 | 0; p[ e >> 3 ] = 0.0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = gg( d ) | 0; if ( h >>> 0 > 4294967279 )um( g ); if ( h >>> 0 < 11 ) {

				b[ g + 11 >> 0 ] = h; if ( ! h )i = g; else {

					j = g; k = 6;

				}

			} else {

				l = h + 16 & - 16; m = bj( l ) | 0; f[ g >> 2 ] = m; f[ g + 8 >> 2 ] = l | - 2147483648; f[ g + 4 >> 2 ] = h; j = m; k = 6;

			} if ( ( k | 0 ) == 6 ) {

				ge( j | 0, d | 0, h | 0 ) | 0; i = j;

			}b[ i + h >> 0 ] = 0; sf( c, g, e ) | 0; n = + p[ e >> 3 ]; if ( ( b[ g + 11 >> 0 ] | 0 ) >= 0 ) {

				u = a; return + n;

			}dn( f[ g >> 2 ] | 0 ); u = a; return + n;

		} function Af( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0, o = 0, p = 0; g = u; u = u + 128 | 0; h = g + 124 | 0; i = g; j = i; k = 3084; l = j + 124 | 0; do {

				f[ j >> 2 ] = f[ k >> 2 ]; j = j + 4 | 0; k = k + 4 | 0;

			} while ( ( j | 0 ) < ( l | 0 ) );if ( ( c + - 1 | 0 ) >>> 0 > 2147483646 ) if ( ! c ) {

				m = h; n = 1; o = 4;

			} else {

				h = ln() | 0; f[ h >> 2 ] = 75; p = - 1;

			} else {

				m = a; n = c; o = 4;

			} if ( ( o | 0 ) == 4 ) {

				o = - 2 - m | 0; c = n >>> 0 > o >>> 0 ? o : n; f[ i + 48 >> 2 ] = c; n = i + 20 | 0; f[ n >> 2 ] = m; f[ i + 44 >> 2 ] = m; o = m + c | 0; m = i + 16 | 0; f[ m >> 2 ] = o; f[ i + 28 >> 2 ] = o; o = ye( i, d, e ) | 0; if ( ! c )p = o; else {

					c = f[ n >> 2 ] | 0; b[ c + ( ( ( c | 0 ) == ( f[ m >> 2 ] | 0 ) ) << 31 >> 31 ) >> 0 ] = 0; p = o;

				}

			}u = g; return p | 0;

		} function Bf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; a = u; u = u + 16 | 0; e = a + 12 | 0; g = a; f[ e >> 2 ] = 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = gg( d ) | 0; if ( h >>> 0 > 4294967279 )um( g ); if ( h >>> 0 < 11 ) {

				b[ g + 11 >> 0 ] = h; if ( ! h )i = g; else {

					j = g; k = 6;

				}

			} else {

				l = h + 16 & - 16; m = bj( l ) | 0; f[ g >> 2 ] = m; f[ g + 8 >> 2 ] = l | - 2147483648; f[ g + 4 >> 2 ] = h; j = m; k = 6;

			} if ( ( k | 0 ) == 6 ) {

				ge( j | 0, d | 0, h | 0 ) | 0; i = j;

			}b[ i + h >> 0 ] = 0; cg( c, g, e ) | 0; c = f[ e >> 2 ] | 0; if ( ( b[ g + 11 >> 0 ] | 0 ) >= 0 ) {

				u = a; return c | 0;

			}dn( f[ g >> 2 ] | 0 ); u = a; return c | 0;

		} function Cf( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; c = f[ a + 28 >> 2 ] | 0; if ( c | 0 ) {

				d = c; do {

					c = d; d = f[ d >> 2 ] | 0; e = c + 8 | 0; g = c + 20 | 0; h = f[ g >> 2 ] | 0; f[ g >> 2 ] = 0; if ( h | 0 ) {

						Cf( h ); dn( h );

					} if ( ( b[ e + 11 >> 0 ] | 0 ) < 0 )dn( f[ e >> 2 ] | 0 ); dn( c );

				} while ( ( d | 0 ) != 0 );

			}d = a + 20 | 0; c = f[ d >> 2 ] | 0; f[ d >> 2 ] = 0; if ( c | 0 )dn( c ); c = f[ a + 8 >> 2 ] | 0; if ( c | 0 ) {

				d = c; do {

					c = d; d = f[ d >> 2 ] | 0; e = c + 8 | 0; h = f[ c + 20 >> 2 ] | 0; if ( h | 0 ) {

						g = c + 24 | 0; if ( ( f[ g >> 2 ] | 0 ) != ( h | 0 ) )f[ g >> 2 ] = h; dn( h );

					} if ( ( b[ e + 11 >> 0 ] | 0 ) < 0 )dn( f[ e >> 2 ] | 0 ); dn( c );

				} while ( ( d | 0 ) != 0 );

			}d = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( ! d ) return; dn( d ); return;

		} function Df( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; a = u; u = u + 32 | 0; e = a; g = a + 8 | 0; p[ e >> 3 ] = 0.0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = gg( d ) | 0; if ( h >>> 0 > 4294967279 )um( g ); if ( h >>> 0 < 11 ) {

				b[ g + 11 >> 0 ] = h; if ( ! h )i = g; else {

					j = g; k = 6;

				}

			} else {

				l = h + 16 & - 16; m = bj( l ) | 0; f[ g >> 2 ] = m; f[ g + 8 >> 2 ] = l | - 2147483648; f[ g + 4 >> 2 ] = h; j = m; k = 6;

			} if ( ( k | 0 ) == 6 ) {

				ge( j | 0, d | 0, h | 0 ) | 0; i = j;

			}b[ i + h >> 0 ] = 0; h = sf( c, g, e ) | 0; if ( ( b[ g + 11 >> 0 ] | 0 ) >= 0 ) {

				u = a; return h | 0;

			}dn( f[ g >> 2 ] | 0 ); u = a; return h | 0;

		} function Ef( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; a = u; u = u + 16 | 0; e = a + 12 | 0; g = a; f[ e >> 2 ] = 0; f[ g >> 2 ] = 0; f[ g + 4 >> 2 ] = 0; f[ g + 8 >> 2 ] = 0; h = gg( d ) | 0; if ( h >>> 0 > 4294967279 )um( g ); if ( h >>> 0 < 11 ) {

				b[ g + 11 >> 0 ] = h; if ( ! h )i = g; else {

					j = g; k = 6;

				}

			} else {

				l = h + 16 & - 16; m = bj( l ) | 0; f[ g >> 2 ] = m; f[ g + 8 >> 2 ] = l | - 2147483648; f[ g + 4 >> 2 ] = h; j = m; k = 6;

			} if ( ( k | 0 ) == 6 ) {

				ge( j | 0, d | 0, h | 0 ) | 0; i = j;

			}b[ i + h >> 0 ] = 0; h = cg( c, g, e ) | 0; if ( ( b[ g + 11 >> 0 ] | 0 ) >= 0 ) {

				u = a; return h | 0;

			}dn( f[ g >> 2 ] | 0 ); u = a; return h | 0;

		} function Ff( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; d = c + 8 | 0; e = f[ d + 4 >> 2 ] | 0; g = c + 16 | 0; h = g; i = f[ h >> 2 ] | 0; j = f[ h + 4 >> 2 ] | 0; if ( ! ( ( e | 0 ) > ( j | 0 ) | ( ( e | 0 ) == ( j | 0 ) ? ( f[ d >> 2 ] | 0 ) >>> 0 > i >>> 0 : 0 ) ) ) {

				k = 0; return k | 0;

			}d = b[ ( f[ c >> 2 ] | 0 ) + i >> 0 ] | 0; e = Rj( i | 0, j | 0, 1, 0 ) | 0; j = g; f[ j >> 2 ] = e; f[ j + 4 >> 2 ] = I; do if ( d << 24 >> 24 < 0 ) if ( Ff( a, c ) | 0 ) {

				j = a; e = Oj( f[ j >> 2 ] | 0, f[ j + 4 >> 2 ] | 0, 7 ) | 0; j = I; g = a; f[ g >> 2 ] = e; f[ g + 4 >> 2 ] = j; l = e | d & 127; m = j; break;

			} else {

				k = 0; return k | 0;

			} else {

				l = d & 255; m = 0;

			} while ( 0 );d = a; f[ d >> 2 ] = l; f[ d + 4 >> 2 ] = m; k = 1; return k | 0;

		} function Gf( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0; if ( b >>> 0 > 1431655765 | ( c | b | 0 ) < 0 ) {

				d = 0; return d | 0;

			}e = b * 3 | 0; sd( a, e, 2656 ); sd( a + 12 | 0, e, 2652 ); Eg( a + 24 | 0, c ); c = a + 76 | 0; e = f[ c >> 2 ] | 0; b = a + 80 | 0; g = f[ b >> 2 ] | 0; if ( ( g | 0 ) != ( e | 0 ) )f[ b >> 2 ] = g + ( ~ ( ( g + - 4 - e | 0 ) >>> 2 ) << 2 ); f[ c >> 2 ] = 0; f[ b >> 2 ] = 0; f[ a + 84 >> 2 ] = 0; if ( e | 0 )dn( e ); e = a + 64 | 0; b = f[ e >> 2 ] | 0; c = a + 68 | 0; if ( ( f[ c >> 2 ] | 0 ) != ( b | 0 ) )f[ c >> 2 ] = b; f[ e >> 2 ] = 0; f[ c >> 2 ] = 0; f[ a + 72 >> 2 ] = 0; if ( ! b ) {

				d = 1; return d | 0;

			}dn( b ); d = 1; return d | 0;

		} function Hf( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0; e = u; u = u + 48 | 0; g = e + 4 | 0; h = e; if ( ( d | 0 ) != 1 ) {

				f[ a >> 2 ] = 0; u = e; return;

			}d = f[ b + 12 >> 2 ] | 0; i = f[ b + 4 >> 2 ] | 0; b = g; j = b + 36 | 0; do {

				f[ b >> 2 ] = 0; b = b + 4 | 0;

			} while ( ( b | 0 ) < ( j | 0 ) );Ie( h, c, d, i, g ); i = f[ g + 24 >> 2 ] | 0; if ( i | 0 ) {

				d = g + 28 | 0; g = f[ d >> 2 ] | 0; if ( ( g | 0 ) != ( i | 0 ) )f[ d >> 2 ] = g + ( ~ ( ( g + - 4 - i | 0 ) >>> 2 ) << 2 ); dn( i );

			}f[ a >> 2 ] = f[ h >> 2 ]; u = e; return;

		} function If( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0; c = a + 16 | 0; a = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; b = f[ c >> 2 ] | 0; f[ c >> 2 ] = a; if ( ! b ) return; a = b + 88 | 0; c = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( c | 0 ) {

				a = f[ c + 8 >> 2 ] | 0; if ( a | 0 ) {

					d = c + 12 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( a | 0 ) )f[ d >> 2 ] = a; dn( a );

				}dn( c );

			}c = f[ b + 68 >> 2 ] | 0; if ( c | 0 ) {

				a = b + 72 | 0; d = f[ a >> 2 ] | 0; if ( ( d | 0 ) != ( c | 0 ) )f[ a >> 2 ] = d + ( ~ ( ( d + - 4 - c | 0 ) >>> 2 ) << 2 ); dn( c );

			}c = b + 64 | 0; d = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( d | 0 ) {

				c = f[ d >> 2 ] | 0; if ( c | 0 ) {

					a = d + 4 | 0; if ( ( f[ a >> 2 ] | 0 ) != ( c | 0 ) )f[ a >> 2 ] = c; dn( c );

				}dn( d );

			}dn( b ); return;

		} function Jf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; e = u; u = u + 16 | 0; g = e; if ( c | 0 ) {

				h = a + 11 | 0; i = b[ h >> 0 ] | 0; if ( i << 24 >> 24 < 0 ) {

					j = f[ a + 4 >> 2 ] | 0; k = ( f[ a + 8 >> 2 ] & 2147483647 ) + - 1 | 0;

				} else {

					j = i & 255; k = 10;

				} if ( ( k - j | 0 ) >>> 0 < c >>> 0 ) {

					Zf( a, k, c - k + j | 0, j, j, 0, 0 ); l = b[ h >> 0 ] | 0;

				} else l = i; if ( l << 24 >> 24 < 0 )m = f[ a >> 2 ] | 0; else m = a; Mj( m + j | 0, c, d ) | 0; d = j + c | 0; if ( ( b[ h >> 0 ] | 0 ) < 0 )f[ a + 4 >> 2 ] = d; else b[ h >> 0 ] = d; b[ g >> 0 ] = 0; Rl( m + d | 0, g );

			}u = e; return a | 0;

		} function Kf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; e = u; u = u + 16 | 0; g = e; h = a + 11 | 0; i = b[ h >> 0 ] | 0; j = i << 24 >> 24 < 0; if ( j )k = ( f[ a + 8 >> 2 ] & 2147483647 ) + - 1 | 0; else k = 10; do if ( k >>> 0 >= d >>> 0 ) {

				if ( j )l = f[ a >> 2 ] | 0; else l = a; Mk( l, c, d ) | 0; b[ g >> 0 ] = 0; Rl( l + d | 0, g ); if ( ( b[ h >> 0 ] | 0 ) < 0 ) {

					f[ a + 4 >> 2 ] = d; break;

				} else {

					b[ h >> 0 ] = d; break;

				}

			} else {

				if ( j )m = f[ a + 4 >> 2 ] | 0; else m = i & 255; ef( a, k, d - k | 0, m, 0, m, d, c );

			} while ( 0 );u = e; return a | 0;

		} function Lf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; f[ a >> 2 ] = 2236; b = a + 48 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 )Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); f[ a >> 2 ] = 2616; c = f[ a + 20 >> 2 ] | 0; if ( c | 0 ) {

				b = a + 24 | 0; d = f[ b >> 2 ] | 0; if ( ( d | 0 ) != ( c | 0 ) )f[ b >> 2 ] = d + ( ~ ( ( d + - 4 - c | 0 ) >>> 2 ) << 2 ); dn( c );

			}c = a + 8 | 0; d = f[ c >> 2 ] | 0; if ( ! d ) {

				dn( a ); return;

			}b = a + 12 | 0; e = f[ b >> 2 ] | 0; if ( ( e | 0 ) == ( d | 0 ) )g = d; else {

				h = e; do {

					e = h + - 4 | 0; f[ b >> 2 ] = e; i = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( i | 0 )Sa[ f[ ( f[ i >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( i ); h = f[ b >> 2 ] | 0;

				} while ( ( h | 0 ) != ( d | 0 ) );g = f[ c >> 2 ] | 0;

			}dn( g ); dn( a ); return;

		} function Mf( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0; d = u; u = u + 80 | 0; e = d; g = d + 56 | 0; i = d + 40 | 0; j = e; k = c; c = j + 40 | 0; do {

				f[ j >> 2 ] = f[ k >> 2 ]; j = j + 4 | 0; k = k + 4 | 0;

			} while ( ( j | 0 ) < ( c | 0 ) );Hb( i, e, g ); e = f[ i >> 2 ] | 0; if ( ! e ) {

				k = i + 4 | 0; if ( ( b[ k + 11 >> 0 ] | 0 ) < 0 )dn( f[ k >> 2 ] | 0 ); k = h[ g + 7 >> 0 ] | 0; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; f[ a + 16 >> 2 ] = k; u = d; return;

			} else {

				f[ a >> 2 ] = e; e = i + 4 | 0; Rf( a + 4 | 0, e ); if ( ( b[ e + 11 >> 0 ] | 0 ) < 0 )dn( f[ e >> 2 ] | 0 ); u = d; return;

			}

		} function Nf( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0; d = f[ a >> 2 ] | 0; if ( ! d ) {

				e = 0; return e | 0;

			}g = f[ c >> 2 ] | 0; if ( ! g ) {

				e = 0; return e | 0;

			}h = f[ g >> 2 ] | 0; Xf( d, h, ( f[ g + 4 >> 2 ] | 0 ) - h | 0, 0 ) | 0; b[ a + 24 >> 0 ] = b[ c + 24 >> 0 ] | 0; f[ a + 28 >> 2 ] = f[ c + 28 >> 2 ]; b[ a + 32 >> 0 ] = b[ c + 32 >> 0 ] | 0; h = c + 40 | 0; g = f[ h + 4 >> 2 ] | 0; d = a + 40 | 0; f[ d >> 2 ] = f[ h >> 2 ]; f[ d + 4 >> 2 ] = g; g = c + 48 | 0; d = f[ g + 4 >> 2 ] | 0; h = a + 48 | 0; f[ h >> 2 ] = f[ g >> 2 ]; f[ h + 4 >> 2 ] = d; f[ a + 56 >> 2 ] = f[ c + 56 >> 2 ]; d = c + 8 | 0; c = a + 8 | 0; f[ c >> 2 ] = f[ d >> 2 ]; f[ c + 4 >> 2 ] = f[ d + 4 >> 2 ]; f[ c + 8 >> 2 ] = f[ d + 8 >> 2 ]; f[ c + 12 >> 2 ] = f[ d + 12 >> 2 ]; e = 1; return e | 0;

		} function Of( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; c = a + 4 | 0; if ( ( Na[ f[ ( f[ b >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( b ) | 0 ) <= 0 ) {

				d = 1; return d | 0;

			}a = 0; while ( 1 ) {

				e = f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] | 0; g = ki( e, Oa[ f[ ( f[ b >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( b, a ) | 0 ) | 0; if ( ( g | 0 ) == - 1 ) {

					d = 0; h = 6; break;

				}e = f[ ( f[ b >> 2 ] | 0 ) + 28 >> 2 ] | 0; i = sh( f[ c >> 2 ] | 0, g ) | 0; a = a + 1 | 0; if ( ! ( Oa[ e & 127 ]( b, i ) | 0 ) ) {

					d = 0; h = 6; break;

				} if ( ( a | 0 ) >= ( Na[ f[ ( f[ b >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( b ) | 0 ) ) {

					d = 1; h = 6; break;

				}

			} if ( ( h | 0 ) == 6 ) return d | 0; return 0;

		} function Pf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0; f[ a >> 2 ] = 2236; b = a + 48 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 )Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); f[ a >> 2 ] = 2616; c = f[ a + 20 >> 2 ] | 0; if ( c | 0 ) {

				b = a + 24 | 0; d = f[ b >> 2 ] | 0; if ( ( d | 0 ) != ( c | 0 ) )f[ b >> 2 ] = d + ( ~ ( ( d + - 4 - c | 0 ) >>> 2 ) << 2 ); dn( c );

			}c = a + 8 | 0; d = f[ c >> 2 ] | 0; if ( ! d ) return; b = a + 12 | 0; a = f[ b >> 2 ] | 0; if ( ( a | 0 ) == ( d | 0 ) )e = d; else {

				g = a; do {

					a = g + - 4 | 0; f[ b >> 2 ] = a; h = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( h | 0 )Sa[ f[ ( f[ h >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( h ); g = f[ b >> 2 ] | 0;

				} while ( ( g | 0 ) != ( d | 0 ) );e = f[ c >> 2 ] | 0;

			}dn( e ); return;

		} function Qf( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0; if ( ! a ) {

				g = 1; return g | 0;

			}h = d + 8 | 0; i = f[ h + 4 >> 2 ] | 0; j = d + 16 | 0; k = j; l = f[ k >> 2 ] | 0; m = f[ k + 4 >> 2 ] | 0; if ( ! ( ( i | 0 ) > ( m | 0 ) | ( ( i | 0 ) == ( m | 0 ) ? ( f[ h >> 2 ] | 0 ) >>> 0 > l >>> 0 : 0 ) ) ) {

				g = 0; return g | 0;

			}h = b[ ( f[ d >> 2 ] | 0 ) + l >> 0 ] | 0; i = Rj( l | 0, m | 0, 1, 0 ) | 0; m = j; f[ m >> 2 ] = i; f[ m + 4 >> 2 ] = I; switch ( h << 24 >> 24 ) {

				case 0: {

					g = fc( a, c, d, e ) | 0; return g | 0;

				} case 1: {

					g = yc( a, d, e ) | 0; return g | 0;

				} default: {

					g = 0; return g | 0;

				}

			} return 0;

		} function Rf( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; d = u; u = u + 16 | 0; e = d; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; if ( ( b[ c + 11 >> 0 ] | 0 ) < 0 ) {

				g = f[ c >> 2 ] | 0; h = f[ c + 4 >> 2 ] | 0; if ( h >>> 0 > 4294967279 )um( a ); if ( h >>> 0 < 11 ) {

					b[ a + 11 >> 0 ] = h; i = a;

				} else {

					j = h + 16 & - 16; k = bj( j ) | 0; f[ a >> 2 ] = k; f[ a + 8 >> 2 ] = j | - 2147483648; f[ a + 4 >> 2 ] = h; i = k;

				}Ok( i, g, h ) | 0; b[ e >> 0 ] = 0; Rl( i + h | 0, e );

			} else {

				f[ a >> 2 ] = f[ c >> 2 ]; f[ a + 4 >> 2 ] = f[ c + 4 >> 2 ]; f[ a + 8 >> 2 ] = f[ c + 8 >> 2 ];

			}u = d; return;

		} function Sf( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0; d = $b( a, b ) | 0; if ( ! d ) {

				e = 0; return e | 0;

			}b = d + 20 | 0; a = f[ b >> 2 ] | 0; g = d + 24 | 0; d = f[ g >> 2 ] | 0; if ( ( a | 0 ) == ( d | 0 ) ) {

				e = 0; return e | 0;

			}hg( c, d - a | 0, 0 ); a = Jh( c, 0 ) | 0; c = f[ b >> 2 ] | 0; ge( a | 0, c | 0, ( f[ g >> 2 ] | 0 ) - c | 0 ) | 0; e = 1; return e | 0;

		} function Tf( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0; b[ c + 53 >> 0 ] = 1; do if ( ( f[ c + 4 >> 2 ] | 0 ) == ( e | 0 ) ) {

				b[ c + 52 >> 0 ] = 1; a = c + 16 | 0; h = f[ a >> 2 ] | 0; if ( ! h ) {

					f[ a >> 2 ] = d; f[ c + 24 >> 2 ] = g; f[ c + 36 >> 2 ] = 1; if ( ! ( ( g | 0 ) == 1 ? ( f[ c + 48 >> 2 ] | 0 ) == 1 : 0 ) ) break; b[ c + 54 >> 0 ] = 1; break;

				} if ( ( h | 0 ) != ( d | 0 ) ) {

					h = c + 36 | 0; f[ h >> 2 ] = ( f[ h >> 2 ] | 0 ) + 1; b[ c + 54 >> 0 ] = 1; break;

				}h = c + 24 | 0; a = f[ h >> 2 ] | 0; if ( ( a | 0 ) == 2 ) {

					f[ h >> 2 ] = g; i = g;

				} else i = a; if ( ( i | 0 ) == 1 ? ( f[ c + 48 >> 2 ] | 0 ) == 1 : 0 )b[ c + 54 >> 0 ] = 1;

			} while ( 0 );return;

		} function Uf( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; d = u; u = u + 16 | 0; e = d; f[ a >> 2 ] = c; f[ a + 68 >> 2 ] = 0; f[ a + 72 >> 2 ] = 0; $c( e, c ); g = a + 4 | 0; h = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; i = f[ g >> 2 ] | 0; f[ g >> 2 ] = h; if ( ! i ) {

				f[ e >> 2 ] = 0; j = h;

			} else {

				mf( i ); dn( i ); i = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( i | 0 ) {

					mf( i ); dn( i );

				}j = f[ g >> 2 ] | 0;

			} if ( ! j ) {

				k = 0; u = d; return k | 0;

			}j = ( ( f[ c + 100 >> 2 ] | 0 ) - ( f[ c + 96 >> 2 ] | 0 ) | 0 ) / 12 | 0; b[ e >> 0 ] = 0; le( a + 56 | 0, j, e ); k = 1; u = d; return k | 0;

		} function Vf( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0; e = a + d | 0; c = c & 255; if ( ( d | 0 ) >= 67 ) {

				while ( a & 3 ) {

					b[ a >> 0 ] = c; a = a + 1 | 0;

				}g = e & - 4 | 0; h = g - 64 | 0; i = c | c << 8 | c << 16 | c << 24; while ( ( a | 0 ) <= ( h | 0 ) ) {

					f[ a >> 2 ] = i; f[ a + 4 >> 2 ] = i; f[ a + 8 >> 2 ] = i; f[ a + 12 >> 2 ] = i; f[ a + 16 >> 2 ] = i; f[ a + 20 >> 2 ] = i; f[ a + 24 >> 2 ] = i; f[ a + 28 >> 2 ] = i; f[ a + 32 >> 2 ] = i; f[ a + 36 >> 2 ] = i; f[ a + 40 >> 2 ] = i; f[ a + 44 >> 2 ] = i; f[ a + 48 >> 2 ] = i; f[ a + 52 >> 2 ] = i; f[ a + 56 >> 2 ] = i; f[ a + 60 >> 2 ] = i; a = a + 64 | 0;

				} while ( ( a | 0 ) < ( g | 0 ) ) {

					f[ a >> 2 ] = i; a = a + 4 | 0;

				}

			} while ( ( a | 0 ) < ( e | 0 ) ) {

				b[ a >> 0 ] = c; a = a + 1 | 0;

			} return e - d | 0;

		} function Wf( a, c, d, e, g ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0; do if ( ! ( zl( a, f[ c + 8 >> 2 ] | 0, g ) | 0 ) ) {

				if ( zl( a, f[ c >> 2 ] | 0, g ) | 0 ) {

					if ( ( f[ c + 16 >> 2 ] | 0 ) != ( d | 0 ) ? ( h = c + 20 | 0, ( f[ h >> 2 ] | 0 ) != ( d | 0 ) ) : 0 ) {

						f[ c + 32 >> 2 ] = e; f[ h >> 2 ] = d; h = c + 40 | 0; f[ h >> 2 ] = ( f[ h >> 2 ] | 0 ) + 1; if ( ( f[ c + 36 >> 2 ] | 0 ) == 1 ? ( f[ c + 24 >> 2 ] | 0 ) == 2 : 0 )b[ c + 54 >> 0 ] = 1; f[ c + 44 >> 2 ] = 4; break;

					} if ( ( e | 0 ) == 1 )f[ c + 32 >> 2 ] = 1;

				}

			} else Ui( 0, c, d, e ); while ( 0 );return;

		} function Xf( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0; if ( ( d | 0 ) < 0 ) {

				e = 0; return e | 0;

			} do if ( ! b ) {

				d = a + 4 | 0; g = f[ d >> 2 ] | 0; h = f[ a >> 2 ] | 0; i = g - h | 0; if ( i >>> 0 < c >>> 0 ) {

					jf( a, c - i | 0 ); break;

				} if ( i >>> 0 > c >>> 0 ? ( i = h + c | 0, ( i | 0 ) != ( g | 0 ) ) : 0 )f[ d >> 2 ] = i;

			} else Jd( a, b, b + c | 0 ); while ( 0 );c = a + 24 | 0; a = c; b = Rj( f[ a >> 2 ] | 0, f[ a + 4 >> 2 ] | 0, 1, 0 ) | 0; a = c; f[ a >> 2 ] = b; f[ a + 4 >> 2 ] = I; e = 1; return e | 0;

		} function Yf( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1040; b = a + 16 | 0; a = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( ! a ) return; b = a + 88 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 ) {

				b = f[ c + 8 >> 2 ] | 0; if ( b | 0 ) {

					d = c + 12 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( b | 0 ) )f[ d >> 2 ] = b; dn( b );

				}dn( c );

			}c = f[ a + 68 >> 2 ] | 0; if ( c | 0 ) {

				b = a + 72 | 0; d = f[ b >> 2 ] | 0; if ( ( d | 0 ) != ( c | 0 ) )f[ b >> 2 ] = d + ( ~ ( ( d + - 4 - c | 0 ) >>> 2 ) << 2 ); dn( c );

			}c = a + 64 | 0; d = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( d | 0 ) {

				c = f[ d >> 2 ] | 0; if ( c | 0 ) {

					b = d + 4 | 0; if ( ( f[ b >> 2 ] | 0 ) != ( c | 0 ) )f[ b >> 2 ] = c; dn( c );

				}dn( d );

			}dn( a ); return;

		} function Zf( a, c, d, e, g, h, i ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; h = h | 0; i = i | 0; var j = 0, k = 0, l = 0, m = 0; if ( ( - 17 - c | 0 ) >>> 0 < d >>> 0 )um( a ); if ( ( b[ a + 11 >> 0 ] | 0 ) < 0 )j = f[ a >> 2 ] | 0; else j = a; if ( c >>> 0 < 2147483623 ) {

				k = d + c | 0; d = c << 1; l = k >>> 0 < d >>> 0 ? d : k; m = l >>> 0 < 11 ? 11 : l + 16 & - 16;

			} else m = - 17; l = bj( m ) | 0; if ( g | 0 )Ok( l, j, g ) | 0; k = e - h - g | 0; if ( k | 0 )Ok( l + g + i | 0, j + g + h | 0, k ) | 0; if ( ( c | 0 ) != 10 )dn( j ); f[ a >> 2 ] = l; f[ a + 8 >> 2 ] = m | - 2147483648; return;

		} function _f( a, b ) {

			a = a | 0; b = b | 0; if ( ! b ) return; else {

				_f( a, f[ b >> 2 ] | 0 ); _f( a, f[ b + 4 >> 2 ] | 0 ); eg( b + 20 | 0, f[ b + 24 >> 2 ] | 0 ); dn( b ); return;

			}

		} function $f( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; d = a + 64 | 0; if ( ( f[ d >> 2 ] | 0 ) == 0 ? ( e = bj( 32 ) | 0, oj( e ), g = f[ d >> 2 ] | 0, f[ d >> 2 ] = e, g | 0 ) : 0 ) {

				e = f[ g >> 2 ] | 0; if ( e | 0 ) {

					h = g + 4 | 0; if ( ( f[ h >> 2 ] | 0 ) != ( e | 0 ) )f[ h >> 2 ] = e; dn( e );

				}dn( g );

			}g = ai( f[ a + 28 >> 2 ] | 0 ) | 0; e = X( g, b[ a + 24 >> 0 ] | 0 ) | 0; g = ( ( e | 0 ) < 0 ) << 31 >> 31; h = f[ d >> 2 ] | 0; i = gj( e | 0, g | 0, c | 0, 0 ) | 0; if ( ! ( Xf( h, 0, i, I ) | 0 ) ) {

				j = 0; return j | 0;

			}Vg( a, f[ d >> 2 ] | 0, e, g, 0, 0 ); f[ a + 80 >> 2 ] = c; j = 1; return j | 0;

		} function ag( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; e = u; u = u + 32 | 0; g = e + 20 | 0; h = e + 16 | 0; i = e; j = b[ a + 24 >> 0 ] | 0; f[ i >> 2 ] = f[ 226 ]; f[ i + 4 >> 2 ] = f[ 227 ]; f[ i + 8 >> 2 ] = f[ 228 ]; f[ i + 12 >> 2 ] = f[ 229 ]; f[ h >> 2 ] = c; f[ g >> 2 ] = f[ h >> 2 ]; if ( ! ( bb( a, g, j, i ) | 0 ) ) {

				k = 0; u = e; return k | 0;

			}pd( d, i, i + ( j << 24 >> 24 << 2 ) | 0 ); k = 1; u = e; return k | 0;

		} function bg( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; d = u; u = u + 64 | 0; e = d; if ( ! ( zl( a, b, 0 ) | 0 ) ) if ( ( b | 0 ) != 0 ? ( g = De( b, 800, 784, 0 ) | 0, ( g | 0 ) != 0 ) : 0 ) {

				b = e + 4 | 0; h = b + 52 | 0; do {

					f[ b >> 2 ] = 0; b = b + 4 | 0;

				} while ( ( b | 0 ) < ( h | 0 ) );f[ e >> 2 ] = g; f[ e + 8 >> 2 ] = a; f[ e + 12 >> 2 ] = - 1; f[ e + 48 >> 2 ] = 1; Va[ f[ ( f[ g >> 2 ] | 0 ) + 28 >> 2 ] & 7 ]( g, e, f[ c >> 2 ] | 0, 1 ); if ( ( f[ e + 24 >> 2 ] | 0 ) == 1 ) {

					f[ c >> 2 ] = f[ e + 16 >> 2 ]; i = 1;

				} else i = 0; j = i;

			} else j = 0; else j = 1; u = d; return j | 0;

		} function cg( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0; e = $b( a, c ) | 0; if ( ! e ) {

				g = 0; return g | 0;

			}c = f[ e + 20 >> 2 ] | 0; if ( ( ( f[ e + 24 >> 2 ] | 0 ) - c | 0 ) != 4 ) {

				g = 0; return g | 0;

			}e = c; c = h[ e >> 0 ] | h[ e + 1 >> 0 ] << 8 | h[ e + 2 >> 0 ] << 16 | h[ e + 3 >> 0 ] << 24; b[ d >> 0 ] = c; b[ d + 1 >> 0 ] = c >> 8; b[ d + 2 >> 0 ] = c >> 16; b[ d + 3 >> 0 ] = c >> 24; g = 1; return g | 0;

		} function dg( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; d = c + 8 | 0; e = f[ d + 4 >> 2 ] | 0; g = c + 16 | 0; h = g; i = f[ h >> 2 ] | 0; j = f[ h + 4 >> 2 ] | 0; if ( ! ( ( e | 0 ) > ( j | 0 ) | ( ( e | 0 ) == ( j | 0 ) ? ( f[ d >> 2 ] | 0 ) >>> 0 > i >>> 0 : 0 ) ) ) {

				k = 0; return k | 0;

			}d = b[ ( f[ c >> 2 ] | 0 ) + i >> 0 ] | 0; e = Rj( i | 0, j | 0, 1, 0 ) | 0; j = g; f[ j >> 2 ] = e; f[ j + 4 >> 2 ] = I; j = d & 255; do if ( j & 128 ) if ( dg( a, c ) | 0 ) {

				e = f[ a >> 2 ] << 7; f[ a >> 2 ] = e; l = e | d & 127; break;

			} else {

				k = 0; return k | 0;

			} else l = j; while ( 0 );f[ a >> 2 ] = l; k = 1; return k | 0;

		} function eg( a, c ) {

			a = a | 0; c = c | 0; var d = 0; if ( ! c ) return; eg( a, f[ c >> 2 ] | 0 ); eg( a, f[ c + 4 >> 2 ] | 0 ); a = c + 16 | 0; d = c + 28 | 0; if ( ( b[ d + 11 >> 0 ] | 0 ) < 0 )dn( f[ d >> 2 ] | 0 ); if ( ( b[ a + 11 >> 0 ] | 0 ) < 0 )dn( f[ a >> 2 ] | 0 ); dn( c ); return;

		} function fg( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; f[ a >> 2 ] = 2616; b = f[ a + 20 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 24 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = a + 8 | 0; d = f[ b >> 2 ] | 0; if ( ! d ) {

				dn( a ); return;

			}c = a + 12 | 0; e = f[ c >> 2 ] | 0; if ( ( e | 0 ) == ( d | 0 ) )g = d; else {

				h = e; do {

					e = h + - 4 | 0; f[ c >> 2 ] = e; i = f[ e >> 2 ] | 0; f[ e >> 2 ] = 0; if ( i | 0 )Sa[ f[ ( f[ i >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( i ); h = f[ c >> 2 ] | 0;

				} while ( ( h | 0 ) != ( d | 0 ) );g = f[ b >> 2 ] | 0;

			}dn( g ); dn( a ); return;

		} function gg( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0; c = a; a:do if ( ! ( c & 3 ) ) {

				d = a; e = 4;

			} else {

				g = a; h = c; while ( 1 ) {

					if ( ! ( b[ g >> 0 ] | 0 ) ) {

						i = h; break a;

					}j = g + 1 | 0; h = j; if ( ! ( h & 3 ) ) {

						d = j; e = 4; break;

					} else g = j;

				}

			} while ( 0 );if ( ( e | 0 ) == 4 ) {

				e = d; while ( 1 ) {

					k = f[ e >> 2 ] | 0; if ( ! ( ( k & - 2139062144 ^ - 2139062144 ) & k + - 16843009 ) )e = e + 4 | 0; else break;

				} if ( ! ( ( k & 255 ) << 24 >> 24 ) )l = e; else {

					k = e; while ( 1 ) {

						e = k + 1 | 0; if ( ! ( b[ e >> 0 ] | 0 ) ) {

							l = e; break;

						} else k = e;

					}

				}i = l;

			} return i - c | 0;

		} function hg( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; e = u; u = u + 16 | 0; g = e; h = a + 11 | 0; i = b[ h >> 0 ] | 0; j = i << 24 >> 24 < 0; if ( j )k = f[ a + 4 >> 2 ] | 0; else k = i & 255; do if ( k >>> 0 >= c >>> 0 ) if ( j ) {

				i = ( f[ a >> 2 ] | 0 ) + c | 0; b[ g >> 0 ] = 0; Rl( i, g ); f[ a + 4 >> 2 ] = c; break;

			} else {

				b[ g >> 0 ] = 0; Rl( a + c | 0, g ); b[ h >> 0 ] = c; break;

			} else Jf( a, c - k | 0, d ) | 0; while ( 0 );u = e; return;

		} function ig( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; if ( ! a ) return; b = a + 88 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 ) {

				b = f[ c + 8 >> 2 ] | 0; if ( b | 0 ) {

					d = c + 12 | 0; if ( ( f[ d >> 2 ] | 0 ) != ( b | 0 ) )f[ d >> 2 ] = b; dn( b );

				}dn( c );

			}c = f[ a + 68 >> 2 ] | 0; if ( c | 0 ) {

				b = a + 72 | 0; d = f[ b >> 2 ] | 0; if ( ( d | 0 ) != ( c | 0 ) )f[ b >> 2 ] = d + ( ~ ( ( d + - 4 - c | 0 ) >>> 2 ) << 2 ); dn( c );

			}c = a + 64 | 0; d = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( d | 0 ) {

				c = f[ d >> 2 ] | 0; if ( c | 0 ) {

					b = d + 4 | 0; if ( ( f[ b >> 2 ] | 0 ) != ( c | 0 ) )f[ b >> 2 ] = c; dn( c );

				}dn( d );

			}dn( a ); return;

		} function jg( a, c, d, e, g, h, i, j, k, l ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; h = h | 0; i = i | 0; j = j | 0; k = k | 0; l = l | 0; var m = 0, n = 0, o = 0; f[ a >> 2 ] = d; if ( d | 0 ) {

				m = d + 16 | 0; n = f[ m + 4 >> 2 ] | 0; o = a + 8 | 0; f[ o >> 2 ] = f[ m >> 2 ]; f[ o + 4 >> 2 ] = n; n = d + 24 | 0; d = f[ n + 4 >> 2 ] | 0; o = a + 16 | 0; f[ o >> 2 ] = f[ n >> 2 ]; f[ o + 4 >> 2 ] = d;

			}b[ a + 24 >> 0 ] = e; f[ a + 28 >> 2 ] = g; b[ a + 32 >> 0 ] = h & 1; h = a + 40 | 0; f[ h >> 2 ] = i; f[ h + 4 >> 2 ] = j; j = a + 48 | 0; f[ j >> 2 ] = k; f[ j + 4 >> 2 ] = l; f[ a + 56 >> 2 ] = c; return;

		} function kg( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0; c = bj( 88 ) | 0; d = c + 60 | 0; e = c; g = e + 60 | 0; do {

				f[ e >> 2 ] = 0; e = e + 4 | 0;

			} while ( ( e | 0 ) < ( g | 0 ) );f[ d >> 2 ] = c; d = c + 64 | 0; f[ d >> 2 ] = 0; f[ d + 4 >> 2 ] = 0; f[ d + 8 >> 2 ] = 0; f[ d + 12 >> 2 ] = 0; f[ d + 16 >> 2 ] = 0; f[ d + 20 >> 2 ] = 0; d = vd( c, b ) | 0; f[ a >> 2 ] = d ? c : 0; a = d ? 0 : c; if ( d ) return; mf( a ); dn( a ); return;

		} function lg( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; if ( ( f[ c + 76 >> 2 ] | 0 ) >= 0 ? ( jn( c ) | 0 ) != 0 : 0 ) {

				d = a & 255; e = a & 255; if ( ( e | 0 ) != ( b[ c + 75 >> 0 ] | 0 ) ? ( g = c + 20 | 0, h = f[ g >> 2 ] | 0, h >>> 0 < ( f[ c + 16 >> 2 ] | 0 ) >>> 0 ) : 0 ) {

					f[ g >> 2 ] = h + 1; b[ h >> 0 ] = d; i = e;

				} else i = mg( c, a ) | 0; hn( c ); j = i;

			} else k = 3; do if ( ( k | 0 ) == 3 ) {

				i = a & 255; e = a & 255; if ( ( e | 0 ) != ( b[ c + 75 >> 0 ] | 0 ) ? ( d = c + 20 | 0, h = f[ d >> 2 ] | 0, h >>> 0 < ( f[ c + 16 >> 2 ] | 0 ) >>> 0 ) : 0 ) {

					f[ d >> 2 ] = h + 1; b[ h >> 0 ] = i; j = e; break;

				}j = mg( c, a ) | 0;

			} while ( 0 );return j | 0;

		} function mg( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n = 0; d = u; u = u + 16 | 0; e = d; g = c & 255; b[ e >> 0 ] = g; i = a + 16 | 0; j = f[ i >> 2 ] | 0; if ( ! j ) if ( ! ( Gh( a ) | 0 ) ) {

				k = f[ i >> 2 ] | 0; l = 4;

			} else m = - 1; else {

				k = j; l = 4;

			} do if ( ( l | 0 ) == 4 ) {

				j = a + 20 | 0; i = f[ j >> 2 ] | 0; if ( i >>> 0 < k >>> 0 ? ( n = c & 255, ( n | 0 ) != ( b[ a + 75 >> 0 ] | 0 ) ) : 0 ) {

					f[ j >> 2 ] = i + 1; b[ i >> 0 ] = g; m = n; break;

				} if ( ( Pa[ f[ a + 36 >> 2 ] & 31 ]( a, e, 1 ) | 0 ) == 1 )m = h[ e >> 0 ] | 0; else m = - 1;

			} while ( 0 );u = d; return m | 0;

		} function ng( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0, i = 0, j = 0; d = u; u = u + 16 | 0; e = d; g = d + 4 | 0; f[ e >> 2 ] = c; c = bj( 32 ) | 0; f[ g >> 2 ] = c; f[ g + 8 >> 2 ] = - 2147483616; f[ g + 4 >> 2 ] = 24; h = c; i = 8408; j = h + 24 | 0; do {

				b[ h >> 0 ] = b[ i >> 0 ] | 0; h = h + 1 | 0; i = i + 1 | 0;

			} while ( ( h | 0 ) < ( j | 0 ) );b[ c + 24 >> 0 ] = 0; rg( Ub( a, e ) | 0, g, 1 ); if ( ( b[ g + 11 >> 0 ] | 0 ) >= 0 ) {

				u = d; return;

			}dn( f[ g >> 2 ] | 0 ); u = d; return;

		} function og( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0, h = 0; f[ a >> 2 ] = 2616; b = f[ a + 20 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 24 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = a + 8 | 0; d = f[ b >> 2 ] | 0; if ( ! d ) return; c = a + 12 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) == ( d | 0 ) )e = d; else {

				g = a; do {

					a = g + - 4 | 0; f[ c >> 2 ] = a; h = f[ a >> 2 ] | 0; f[ a >> 2 ] = 0; if ( h | 0 )Sa[ f[ ( f[ h >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( h ); g = f[ c >> 2 ] | 0;

				} while ( ( g | 0 ) != ( d | 0 ) );e = f[ b >> 2 ] | 0;

			}dn( e ); return;

		} function pg( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, f = 0, g = 0, h = 0, i = 0, j = 0; if ( c >>> 0 > 0 | ( c | 0 ) == 0 & a >>> 0 > 4294967295 ) {

				e = d; f = a; g = c; while ( 1 ) {

					c = $i( f | 0, g | 0, 10, 0 ) | 0; e = e + - 1 | 0; b[ e >> 0 ] = c & 255 | 48; c = f; f = Fl( f | 0, g | 0, 10, 0 ) | 0; if ( ! ( g >>> 0 > 9 | ( g | 0 ) == 9 & c >>> 0 > 4294967295 ) ) break; else g = I;

				}h = f; i = e;

			} else {

				h = a; i = d;

			} if ( ! h )j = i; else {

				d = h; h = i; while ( 1 ) {

					i = h + - 1 | 0; b[ i >> 0 ] = ( d >>> 0 ) % 10 | 0 | 48; if ( d >>> 0 < 10 ) {

						j = i; break;

					} else {

						d = ( d >>> 0 ) / 10 | 0; h = i;

					}

				}

			} return j | 0;

		} function qg( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0, j = 0; c = a; while ( 1 ) {

				d = c + 1 | 0; if ( ! ( wm( b[ c >> 0 ] | 0 ) | 0 ) ) break; else c = d;

			}a = b[ c >> 0 ] | 0; switch ( a << 24 >> 24 | 0 ) {

				case 45: {

					e = 1; f = 5; break;

				} case 43: {

					e = 0; f = 5; break;

				} default: {

					g = 0; h = c; i = a;

				}

			} if ( ( f | 0 ) == 5 ) {

				g = e; h = d; i = b[ d >> 0 ] | 0;

			} if ( ! ( Om( i << 24 >> 24 ) | 0 ) )j = 0; else {

				i = 0; d = h; while ( 1 ) {

					h = ( i * 10 | 0 ) + 48 - ( b[ d >> 0 ] | 0 ) | 0; d = d + 1 | 0; if ( ! ( Om( b[ d >> 0 ] | 0 ) | 0 ) ) {

						j = h; break;

					} else i = h;

				}

			} return ( g | 0 ? j : 0 - j | 0 ) | 0;

		} function rg( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0; e = u; u = u + 16 | 0; g = e; vh( g, d & 1 ); d = df( a, c ) | 0; c = d + 11 | 0; if ( ( b[ c >> 0 ] | 0 ) < 0 ) {

				b[ f[ d >> 2 ] >> 0 ] = 0; f[ d + 4 >> 2 ] = 0;

			} else {

				b[ d >> 0 ] = 0; b[ c >> 0 ] = 0;

			}fe( d, 0 ); f[ d >> 2 ] = f[ g >> 2 ]; f[ d + 4 >> 2 ] = f[ g + 4 >> 2 ]; f[ d + 8 >> 2 ] = f[ g + 8 >> 2 ]; u = e; return;

		} function sg( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1628; b = f[ a + 96 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 84 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 72 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 60 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function tg( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0, j = 0, k = 0; e = Vd( a, c ) | 0; if ( ( e | 0 ) == ( a + 4 | 0 ) ) {

				g = - 1; h = ( g | 0 ) == - 1; i = ( g | 0 ) != 0; j = h ? d : i; return j | 0;

			}a = e + 28 | 0; if ( ( b[ a + 11 >> 0 ] | 0 ) < 0 )k = f[ a >> 2 ] | 0; else k = a; g = qg( k ) | 0; h = ( g | 0 ) == - 1; i = ( g | 0 ) != 0; j = h ? d : i; return j | 0;

		} function ug( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1376; b = f[ a + 96 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 84 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 72 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 60 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function vg( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0, j = 0, k = 0; d = 0; while ( 1 ) {

				if ( ( h[ 10412 + d >> 0 ] | 0 ) == ( a | 0 ) ) {

					e = 2; break;

				}g = d + 1 | 0; if ( ( g | 0 ) == 87 ) {

					i = 10500; j = 87; e = 5; break;

				} else d = g;

			} if ( ( e | 0 ) == 2 ) if ( ! d )k = 10500; else {

				i = 10500; j = d; e = 5;

			} if ( ( e | 0 ) == 5 ) while ( 1 ) {

				e = 0; d = i; do {

					a = d; d = d + 1 | 0;

				} while ( ( b[ a >> 0 ] | 0 ) != 0 );j = j + - 1 | 0; if ( ! j ) {

					k = d; break;

				} else {

					i = d; e = 5;

				}

			} return Bm( k, f[ c + 20 >> 2 ] | 0 ) | 0;

		} function wg( a, b ) {

			a = + a; b = b | 0; var c = 0, d = 0, e = 0, g = 0.0, h = 0.0, i = 0, j = 0.0; p[ s >> 3 ] = a; c = f[ s >> 2 ] | 0; d = f[ s + 4 >> 2 ] | 0; e = Uj( c | 0, d | 0, 52 ) | 0; switch ( e & 2047 ) {

				case 0: {

					if ( a != 0.0 ) {

						g = + wg( a * 18446744073709551616.0, b ); h = g; i = ( f[ b >> 2 ] | 0 ) + - 64 | 0;

					} else {

						h = a; i = 0;

					}f[ b >> 2 ] = i; j = h; break;

				} case 2047: {

					j = a; break;

				} default: {

					f[ b >> 2 ] = ( e & 2047 ) + - 1022; f[ s >> 2 ] = c; f[ s + 4 >> 2 ] = d & - 2146435073 | 1071644672; j = + p[ s >> 3 ];

				}

			} return + j;

		} function xg( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0, i = 0; e = u; u = u + 16 | 0; d = e; c = bj( 32 ) | 0; f[ d >> 2 ] = c; f[ d + 8 >> 2 ] = - 2147483616; f[ d + 4 >> 2 ] = 26; g = c; h = 8360; i = g + 26 | 0; do {

				b[ g >> 0 ] = b[ h >> 0 ] | 0; g = g + 1 | 0; h = h + 1 | 0;

			} while ( ( g | 0 ) < ( i | 0 ) );b[ c + 26 >> 0 ] = 0; f[ a >> 2 ] = - 1; Rf( a + 4 | 0, d ); if ( ( b[ d + 11 >> 0 ] | 0 ) >= 0 ) {

				u = e; return;

			}dn( f[ d >> 2 ] | 0 ); u = e; return;

		} function yg( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1628; b = f[ a + 96 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 84 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 72 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 60 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) return; c = a + 36 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function zg( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1376; b = f[ a + 96 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 84 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 72 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 60 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) return; c = a + 36 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function Ag( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2296; b = a + 84 | 0; c = a + 4 | 0; d = c + 80 | 0; do {

				f[ c >> 2 ] = 0; c = c + 4 | 0;

			} while ( ( c | 0 ) < ( d | 0 ) );f[ b >> 2 ] = - 1; f[ a + 88 >> 2 ] = - 1; f[ a + 92 >> 2 ] = - 1; b = a + 152 | 0; c = a + 96 | 0; d = c + 56 | 0; do {

				f[ c >> 2 ] = 0; c = c + 4 | 0;

			} while ( ( c | 0 ) < ( d | 0 ) );n[ b >> 2 ] = $( 1.0 ); b = a + 224 | 0; c = a + 156 | 0; d = c + 68 | 0; do {

				f[ c >> 2 ] = 0; c = c + 4 | 0;

			} while ( ( c | 0 ) < ( d | 0 ) );Gi( b ); return;

		} function Bg( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; f[ a >> 2 ] = 0; c = a + 4 | 0; f[ c >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; d = b + 4 | 0; e = ( f[ d >> 2 ] | 0 ) - ( f[ b >> 2 ] | 0 ) | 0; g = e >> 2; if ( ! g ) return; if ( g >>> 0 > 1073741823 )um( a ); h = bj( e ) | 0; f[ c >> 2 ] = h; f[ a >> 2 ] = h; f[ a + 8 >> 2 ] = h + ( g << 2 ); g = f[ b >> 2 ] | 0; b = ( f[ d >> 2 ] | 0 ) - g | 0; if ( ( b | 0 ) <= 0 ) return; ge( h | 0, g | 0, b | 0 ) | 0; f[ c >> 2 ] = h + ( b >>> 2 << 2 ); return;

		} function Cg( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0; a = f[ b + 4 >> 2 ] | 0; if ( ! a ) {

				d = 0; return d | 0;

			}e = f[ ( f[ ( f[ b + 8 >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] | 0 ) + 60 >> 2 ] | 0; c = f[ a + 40 >> 2 ] | 0; b = f[ a + 44 >> 2 ] | 0; if ( ( c | 0 ) == ( b | 0 ) ) {

				d = 0; return d | 0;

			} else g = c; while ( 1 ) {

				c = f[ g >> 2 ] | 0; g = g + 4 | 0; if ( ( f[ c + 40 >> 2 ] | 0 ) == ( e | 0 ) ) {

					d = c; h = 5; break;

				} if ( ( g | 0 ) == ( b | 0 ) ) {

					d = 0; h = 5; break;

				}

			} if ( ( h | 0 ) == 5 ) return d | 0; return 0;

		} function Dg( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; c = Na[ f[ ( f[ a >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( a ) | 0; if ( ( c | 0 ) <= 0 ) {

				d = 1; return d | 0;

			}e = a + 36 | 0; g = a + 48 | 0; a = 0; while ( 1 ) {

				h = f[ ( f[ e >> 2 ] | 0 ) + ( a << 2 ) >> 2 ] | 0; a = a + 1 | 0; if ( ! ( Pa[ f[ ( f[ h >> 2 ] | 0 ) + 20 >> 2 ] & 31 ]( h, g, b ) | 0 ) ) {

					d = 0; i = 5; break;

				} if ( ( a | 0 ) >= ( c | 0 ) ) {

					d = 1; i = 5; break;

				}

			} if ( ( i | 0 ) == 5 ) return d | 0; return 0;

		} function Eg( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; c = a + 8 | 0; d = f[ a >> 2 ] | 0; if ( ( f[ c >> 2 ] | 0 ) - d >> 2 >>> 0 >= b >>> 0 ) return; e = a + 4 | 0; if ( b >>> 0 > 1073741823 ) {

				g = ra( 8 ) | 0; Yk( g, 9789 ); f[ g >> 2 ] = 3704; va( g | 0, 856, 80 );

			}g = ( f[ e >> 2 ] | 0 ) - d | 0; h = bj( b << 2 ) | 0; if ( ( g | 0 ) > 0 )ge( h | 0, d | 0, g | 0 ) | 0; f[ a >> 2 ] = h; f[ e >> 2 ] = h + ( g >> 2 << 2 ); f[ c >> 2 ] = h + ( b << 2 ); if ( ! d ) return; dn( d ); return;

		} function Fg( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0; switch ( c << 24 >> 24 ) {

				case 0: {

					c = bj( 20 ) | 0; dk( c ); d = c; break;

				} case 1: {

					c = bj( 24 ) | 0; Dk( c ); d = c; break;

				} case 2: {

					c = bj( 36 ) | 0; pj( c ); d = c; break;

				} case 3: {

					c = bj( 28 ) | 0; vk( c ); d = c; break;

				} default:d = 0;

			}f[ a >> 2 ] = d; return;

		} function Gg( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; c = Na[ f[ ( f[ a >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( a ) | 0; if ( ( c | 0 ) <= 0 ) {

				d = 1; return d | 0;

			}e = a + 36 | 0; g = a + 48 | 0; a = 0; while ( 1 ) {

				h = f[ ( f[ e >> 2 ] | 0 ) + ( a << 2 ) >> 2 ] | 0; a = a + 1 | 0; if ( ! ( Pa[ f[ ( f[ h >> 2 ] | 0 ) + 16 >> 2 ] & 31 ]( h, g, b ) | 0 ) ) {

					d = 0; i = 5; break;

				} if ( ( a | 0 ) >= ( c | 0 ) ) {

					d = 1; i = 5; break;

				}

			} if ( ( i | 0 ) == 5 ) return d | 0; return 0;

		} function Hg( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0; c = f[ b >> 2 ] | 0; if ( ! c ) {

				d = 0; return d | 0;

			}e = a + 44 | 0; g = f[ e >> 2 ] | 0; if ( g >>> 0 < ( f[ a + 48 >> 2 ] | 0 ) >>> 0 ) {

				f[ b >> 2 ] = 0; f[ g >> 2 ] = c; f[ e >> 2 ] = ( f[ e >> 2 ] | 0 ) + 4; d = 1; return d | 0;

			} else {

				Zd( a + 40 | 0, b ); d = 1; return d | 0;

			} return 0;

		} function Ig( a ) {

			a = a | 0; var b = 0; if ( ! ( f[ a + 44 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 48 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 24 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 28 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 32 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 36 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			}b = ( f[ a + 72 >> 2 ] | 0 ) != - 1; return b | 0;

		} function Jg( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2348; b = f[ a + 64 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 68 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}f[ a + 12 >> 2 ] = 2372; b = f[ a + 32 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 20 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}dn( b ); dn( a ); return;

		} function Kg( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, i = 0; f[ c >> 2 ] = 2; d = a + 4 | 0; a = c + 8 | 0; e = f[ a >> 2 ] | 0; g = ( f[ c + 12 >> 2 ] | 0 ) - e | 0; if ( g >>> 0 < 4294967292 ) {

				Xg( a, g + 4 | 0, 0 ); i = f[ a >> 2 ] | 0;

			} else i = e; e = i + g | 0; g = h[ d >> 0 ] | h[ d + 1 >> 0 ] << 8 | h[ d + 2 >> 0 ] << 16 | h[ d + 3 >> 0 ] << 24; b[ e >> 0 ] = g; b[ e + 1 >> 0 ] = g >> 8; b[ e + 2 >> 0 ] = g >> 16; b[ e + 3 >> 0 ] = g >> 24; return;

		} function Lg( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2440; b = f[ a + 64 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 68 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}f[ a + 12 >> 2 ] = 2420; b = f[ a + 32 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 20 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}dn( b ); dn( a ); return;

		} function Mg( a ) {

			a = a | 0; var b = 0; if ( ! ( f[ a + 64 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 68 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 44 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 48 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 52 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 56 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			}b = ( f[ a + 92 >> 2 ] | 0 ) != - 1; return b | 0;

		} function Ng( a ) {

			a = a | 0; var c = 0; if ( ! a ) return; c = a + 28 | 0; if ( ( b[ c + 11 >> 0 ] | 0 ) < 0 )dn( f[ c >> 2 ] | 0 ); _f( a + 12 | 0, f[ a + 16 >> 2 ] | 0 ); eg( a, f[ a + 4 >> 2 ] | 0 ); dn( a ); return;

		} function Og( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2348; b = f[ a + 64 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 68 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}f[ a + 12 >> 2 ] = 2372; b = f[ a + 32 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 20 >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function Pg( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0, i = 0; if ( ! a ) return; c = f[ a >> 2 ] | 0; if ( c | 0 ) {

				d = a + 4 | 0; e = f[ d >> 2 ] | 0; if ( ( e | 0 ) == ( c | 0 ) )g = c; else {

					h = e; while ( 1 ) {

						e = h + - 12 | 0; f[ d >> 2 ] = e; if ( ( b[ e + 11 >> 0 ] | 0 ) < 0 ) {

							dn( f[ e >> 2 ] | 0 ); i = f[ d >> 2 ] | 0;

						} else i = e; if ( ( i | 0 ) == ( c | 0 ) ) break; else h = i;

					}g = f[ a >> 2 ] | 0;

				}dn( g );

			}dn( a ); return;

		} function Qg( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; Ib( a, b ); if ( ( b | 0 ) <= - 1 ) return; c = a + 88 | 0; d = f[ c >> 2 ] | 0; e = f[ a + 84 >> 2 ] | 0; if ( ( d - e >> 2 | 0 ) <= ( b | 0 ) ) return; a = e + ( b << 2 ) | 0; b = a + 4 | 0; e = d - b | 0; g = e >> 2; if ( ! g )h = d; else {

				qi( a | 0, b | 0, e | 0 ) | 0; h = f[ c >> 2 ] | 0;

			}e = a + ( g << 2 ) | 0; if ( ( h | 0 ) == ( e | 0 ) ) return; f[ c >> 2 ] = h + ( ~ ( ( h + - 4 - e | 0 ) >>> 2 ) << 2 ); return;

		} function Rg( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2440; b = f[ a + 64 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 68 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}f[ a + 12 >> 2 ] = 2420; b = f[ a + 32 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 20 >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function Sg( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var g = 0, h = 0; a = c + 16 | 0; g = f[ a >> 2 ] | 0; do if ( g ) {

				if ( ( g | 0 ) != ( d | 0 ) ) {

					h = c + 36 | 0; f[ h >> 2 ] = ( f[ h >> 2 ] | 0 ) + 1; f[ c + 24 >> 2 ] = 2; b[ c + 54 >> 0 ] = 1; break;

				}h = c + 24 | 0; if ( ( f[ h >> 2 ] | 0 ) == 2 )f[ h >> 2 ] = e;

			} else {

				f[ a >> 2 ] = d; f[ c + 24 >> 2 ] = e; f[ c + 36 >> 2 ] = 1;

			} while ( 0 );return;

		} function Tg( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2668; b = f[ a + 96 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 100 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( ( d + - 12 - b | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ); dn( b );

			}b = f[ a + 84 >> 2 ] | 0; if ( ! b ) {

				Td( a ); dn( a ); return;

			}d = a + 88 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); Td( a ); dn( a ); return;

		} function Ug( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, f = 0, g = 0, h = 0, i = 0; e = b >> 31 | ( ( b | 0 ) < 0 ? - 1 : 0 ) << 1; f = ( ( b | 0 ) < 0 ? - 1 : 0 ) >> 31 | ( ( b | 0 ) < 0 ? - 1 : 0 ) << 1; g = d >> 31 | ( ( d | 0 ) < 0 ? - 1 : 0 ) << 1; h = ( ( d | 0 ) < 0 ? - 1 : 0 ) >> 31 | ( ( d | 0 ) < 0 ? - 1 : 0 ) << 1; i = Tj( e ^ a | 0, f ^ b | 0, e | 0, f | 0 ) | 0; b = I; a = g ^ e; e = h ^ f; return Tj( ( gc( i, b, Tj( g ^ c | 0, h ^ d | 0, g | 0, h | 0 ) | 0, I, 0 ) | 0 ) ^ a | 0, I ^ e | 0, a | 0, e | 0 ) | 0;

		} function Vg( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0, i = 0, j = 0; f[ a >> 2 ] = b; h = b + 16 | 0; i = f[ h + 4 >> 2 ] | 0; j = a + 8 | 0; f[ j >> 2 ] = f[ h >> 2 ]; f[ j + 4 >> 2 ] = i; i = b + 24 | 0; b = f[ i + 4 >> 2 ] | 0; j = a + 16 | 0; f[ j >> 2 ] = f[ i >> 2 ]; f[ j + 4 >> 2 ] = b; b = a + 40 | 0; f[ b >> 2 ] = c; f[ b + 4 >> 2 ] = d; d = a + 48 | 0; f[ d >> 2 ] = e; f[ d + 4 >> 2 ] = g; return;

		} function Wg( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, i = 0, j = 0, k = 0; c = b[ a + 12 >> 0 ] | 0; d = a + 8 | 0; e = f[ d >> 2 ] | 0; if ( e >>> 0 < 4096 ? ( g = a + 4 | 0, i = f[ g >> 2 ] | 0, ( i | 0 ) > 0 ) : 0 ) {

				j = f[ a >> 2 ] | 0; a = i + - 1 | 0; f[ g >> 2 ] = a; g = e << 8 | ( h[ j + a >> 0 ] | 0 ); f[ d >> 2 ] = g; k = g;

			} else k = e; e = k & 255; g = 0 - c & 255; c = X( k >>> 8, g ) | 0; a = e >>> 0 < g >>> 0; f[ d >> 2 ] = a ? c + e | 0 : k - g - c | 0; return a | 0;

		} function Xg( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0; c = a + 4 | 0; d = f[ c >> 2 ] | 0; e = f[ a >> 2 ] | 0; g = d - e | 0; h = e; e = d; if ( g >>> 0 >= b >>> 0 ) {

				if ( g >>> 0 > b >>> 0 ? ( d = h + b | 0, ( d | 0 ) != ( e | 0 ) ) : 0 )f[ c >> 2 ] = d;

			} else jf( a, b - g | 0 ); g = a + 24 | 0; a = g; b = Rj( f[ a >> 2 ] | 0, f[ a + 4 >> 2 ] | 0, 1, 0 ) | 0; a = g; f[ a >> 2 ] = b; f[ a + 4 >> 2 ] = I; return;

		} function Yg( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0; e = u; u = u + 16 | 0; g = e; xg( g, a, c, d ); d = a + 24 | 0; f[ d >> 2 ] = f[ g >> 2 ]; c = g + 4 | 0; hi( a + 28 | 0, c ) | 0; if ( ( b[ c + 11 >> 0 ] | 0 ) >= 0 ) {

				u = e; return d | 0;

			}dn( f[ c >> 2 ] | 0 ); u = e; return d | 0;

		} function Zg( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 2668; b = f[ a + 96 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 100 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( ( d + - 12 - b | 0 ) >>> 0 ) / 12 | 0 ) * 12 | 0 ); dn( b );

			}b = f[ a + 84 >> 2 ] | 0; if ( ! b ) {

				Td( a ); return;

			}d = a + 88 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) != ( b | 0 ) )f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); Td( a ); return;

		} function _g( a ) {

			a = a | 0; var c = 0, d = 0, e = 0; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; f[ a + 16 >> 2 ] = 0; f[ a + 20 >> 2 ] = 0; b[ a + 24 >> 0 ] = 1; c = a + 68 | 0; d = a + 28 | 0; e = d + 40 | 0; do {

				f[ d >> 2 ] = 0; d = d + 4 | 0;

			} while ( ( d | 0 ) < ( e | 0 ) );f[ c >> 2 ] = a; c = a + 72 | 0; f[ c >> 2 ] = 0; f[ c + 4 >> 2 ] = 0; f[ c + 8 >> 2 ] = 0; f[ c + 12 >> 2 ] = 0; f[ c + 16 >> 2 ] = 0; f[ c + 20 >> 2 ] = 0; return;

		} function $g( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0; e = u; u = u + 16 | 0; g = e; md( g, a, c, d ); d = a + 24 | 0; f[ d >> 2 ] = f[ g >> 2 ]; c = g + 4 | 0; hi( a + 28 | 0, c ) | 0; if ( ( b[ c + 11 >> 0 ] | 0 ) >= 0 ) {

				u = e; return d | 0;

			}dn( f[ c >> 2 ] | 0 ); u = e; return d | 0;

		} function ah( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, g = 0, h = 0, i = 0; if ( c ? ! ( Ff( d, a ) | 0 ) : 0 ) {

				e = 0; return e | 0;

			}b[ a + 36 >> 0 ] = 1; d = a + 16 | 0; c = f[ d >> 2 ] | 0; g = ( f[ a >> 2 ] | 0 ) + c | 0; h = a + 8 | 0; i = Tj( f[ h >> 2 ] | 0, f[ h + 4 >> 2 ] | 0, c | 0, f[ d + 4 >> 2 ] | 0 ) | 0; f[ a + 32 >> 2 ] = 0; f[ a + 24 >> 2 ] = g; f[ a + 28 >> 2 ] = g + i; e = 1; return e | 0;

		} function bh( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1684; b = f[ a + 76 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function ch( a, b, c, d, e ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; var f = 0, g = 0, h = 0; f = u; u = u + 256 | 0; g = f; if ( ( c | 0 ) > ( d | 0 ) & ( e & 73728 | 0 ) == 0 ) {

				e = c - d | 0; Vf( g | 0, b << 24 >> 24 | 0, ( e >>> 0 < 256 ? e : 256 ) | 0 ) | 0; if ( e >>> 0 > 255 ) {

					b = c - d | 0; d = e; do {

						il( a, g, 256 ); d = d + - 256 | 0;

					} while ( d >>> 0 > 255 );h = b & 255;

				} else h = e; il( a, g, h );

			}u = f; return;

		} function dh( a ) {

			a = a | 0; var b = 0, c = 0, d = 0, e = 0, g = 0; b = f[ a + 8 >> 2 ] | 0; c = f[ a + 12 >> 2 ] | 0; if ( ( b | 0 ) == ( c | 0 ) ) {

				d = 1; return d | 0;

			}e = a + 32 | 0; a = b; while ( 1 ) {

				b = f[ a >> 2 ] | 0; a = a + 4 | 0; if ( ! ( Oa[ f[ ( f[ b >> 2 ] | 0 ) + 16 >> 2 ] & 127 ]( b, f[ e >> 2 ] | 0 ) | 0 ) ) {

					d = 0; g = 5; break;

				} if ( ( a | 0 ) == ( c | 0 ) ) {

					d = 1; g = 5; break;

				}

			} if ( ( g | 0 ) == 5 ) return d | 0; return 0;

		} function eh( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1432; b = f[ a + 76 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function fh( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; var h = 0; if ( zl( a, f[ b + 8 >> 2 ] | 0, g ) | 0 )Tf( 0, b, c, d, e ); else {

				h = f[ a + 8 >> 2 ] | 0; Xa[ f[ ( f[ h >> 2 ] | 0 ) + 20 >> 2 ] & 3 ]( h, b, c, d, e, g );

			} return;

		} function gh( a, b ) {

			a = a | 0; b = b | 0; var c = 0; c = bj( 40 ) | 0; f[ c >> 2 ] = - 1; oj( c + 8 | 0 ); Ta[ f[ ( f[ a >> 2 ] | 0 ) + 16 >> 2 ] & 7 ]( a, c ); a = b + 88 | 0; b = f[ a >> 2 ] | 0; f[ a >> 2 ] = c; if ( ! b ) return 1; c = f[ b + 8 >> 2 ] | 0; if ( c | 0 ) {

				a = b + 12 | 0; if ( ( f[ a >> 2 ] | 0 ) != ( c | 0 ) )f[ a >> 2 ] = c; dn( c );

			}dn( b ); return 1;

		} function hh( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; c = f[ a + 12 >> 2 ] | 0; d = f[ a + 8 >> 2 ] | 0; a = d; if ( ( c | 0 ) == ( d | 0 ) ) {

				e = 0; return e | 0;

			}g = c - d >> 2; d = 0; while ( 1 ) {

				c = f[ a + ( d << 2 ) >> 2 ] | 0; if ( ( f[ c + 60 >> 2 ] | 0 ) == ( b | 0 ) ) {

					e = c; h = 5; break;

				}d = d + 1 | 0; if ( d >>> 0 >= g >>> 0 ) {

					e = 0; h = 5; break;

				}

			} if ( ( h | 0 ) == 5 ) return e | 0; return 0;

		} function ih( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; c = f[ a + 12 >> 2 ] | 0; d = f[ a + 8 >> 2 ] | 0; a = d; if ( ( c | 0 ) == ( d | 0 ) ) {

				e = - 1; return e | 0;

			}g = c - d >> 2; d = 0; while ( 1 ) {

				if ( ( f[ ( f[ a + ( d << 2 ) >> 2 ] | 0 ) + 60 >> 2 ] | 0 ) == ( b | 0 ) ) {

					e = d; h = 5; break;

				}d = d + 1 | 0; if ( d >>> 0 >= g >>> 0 ) {

					e = - 1; h = 5; break;

				}

			} if ( ( h | 0 ) == 5 ) return e | 0; return 0;

		} function jh( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, f = 0, g = 0, h = 0, i = 0, j = 0; a:do if ( ! d )e = 0; else {

				f = a; g = d; h = c; while ( 1 ) {

					i = b[ f >> 0 ] | 0; j = b[ h >> 0 ] | 0; if ( i << 24 >> 24 != j << 24 >> 24 ) break; g = g + - 1 | 0; if ( ! g ) {

						e = 0; break a;

					} else {

						f = f + 1 | 0; h = h + 1 | 0;

					}

				}e = ( i & 255 ) - ( j & 255 ) | 0;

			} while ( 0 );return e | 0;

		} function kh( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1684; b = f[ a + 76 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) return; c = a + 36 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function lh( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 2108; b = a + 28 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 )bn( c ); f[ a >> 2 ] = 1148; c = a + 20 | 0; b = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( ! b ) {

				Yf( a ); dn( a ); return;

			}Sa[ f[ ( f[ b >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( b ); Yf( a ); dn( a ); return;

		} function mh( a ) {

			a = a | 0; var c = 0, d = 0; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; c = 0; while ( 1 ) {

				if ( ( c | 0 ) == 3 ) break; f[ a + ( c << 2 ) >> 2 ] = 0; c = c + 1 | 0;

			} if ( ( b[ a + 11 >> 0 ] | 0 ) < 0 )d = ( f[ a + 8 >> 2 ] & 2147483647 ) + - 1 | 0; else d = 10; hg( a, d, 0 ); return;

		} function nh( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1432; b = f[ a + 76 >> 2 ] | 0; if ( b | 0 )dn( b ); f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) return; c = a + 36 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function oh( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 984; b = f[ a + 16 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 20 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}b = f[ a + 4 >> 2 ] | 0; if ( ! b ) return; d = a + 8 | 0; a = f[ d >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ d >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function ph( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1740; f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function qh( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 2108; b = a + 28 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 )bn( c ); f[ a >> 2 ] = 1148; c = a + 20 | 0; b = f[ c >> 2 ] | 0; f[ c >> 2 ] = 0; if ( ! b ) {

				Yf( a ); return;

			}Sa[ f[ ( f[ b >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( b ); Yf( a ); return;

		} function rh( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0; if ( zl( a, f[ b + 8 >> 2 ] | 0, 0 ) | 0 )Sg( 0, b, c, d ); else {

				e = f[ a + 8 >> 2 ] | 0; Va[ f[ ( f[ e >> 2 ] | 0 ) + 28 >> 2 ] & 7 ]( e, b, c, d );

			} return;

		} function sh( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0; if ( ( b | 0 ) < 0 ) {

				c = 0; return c | 0;

			}d = f[ a + 4 >> 2 ] | 0; if ( ( ( f[ d + 12 >> 2 ] | 0 ) - ( f[ d + 8 >> 2 ] | 0 ) >> 2 | 0 ) <= ( b | 0 ) ) {

				c = 0; return c | 0;

			}d = f[ ( f[ a + 8 >> 2 ] | 0 ) + ( f[ ( f[ a + 20 >> 2 ] | 0 ) + ( b << 2 ) >> 2 ] << 2 ) >> 2 ] | 0; c = Oa[ f[ ( f[ d >> 2 ] | 0 ) + 32 >> 2 ] & 127 ]( d, b ) | 0; return c | 0;

		} function th( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, f = 0, g = 0; d = b[ a >> 0 ] | 0; e = b[ c >> 0 ] | 0; if ( d << 24 >> 24 == 0 ? 1 : d << 24 >> 24 != e << 24 >> 24 ) {

				f = e; g = d;

			} else {

				d = c; c = a; do {

					c = c + 1 | 0; d = d + 1 | 0; a = b[ c >> 0 ] | 0; e = b[ d >> 0 ] | 0;

				} while ( ! ( a << 24 >> 24 == 0 ? 1 : a << 24 >> 24 != e << 24 >> 24 ) );f = e; g = a;

			} return ( g & 255 ) - ( f & 255 ) | 0;

		} function uh( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1488; f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function vh( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0; c = u; u = u + 16 | 0; d = c; mh( d ); of( a, d, b ); Ik( d ); u = c; return;

		} function wh( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0; d = u; u = u + 32 | 0; e = d; g = d + 20 | 0; f[ e >> 2 ] = f[ a + 60 >> 2 ]; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = b; f[ e + 12 >> 2 ] = g; f[ e + 16 >> 2 ] = c; if ( ( ik( za( 140, e | 0 ) | 0 ) | 0 ) < 0 ) {

				f[ g >> 2 ] = - 1; h = - 1;

			} else h = f[ g >> 2 ] | 0; u = d; return h | 0;

		} function xh( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0; if ( ( b | 0 ) == - 1 | ( b | 0 ) > 4 ) {

				c = 0; return c | 0;

			}d = f[ a + 20 + ( b * 12 | 0 ) >> 2 ] | 0; if ( ( ( f[ a + 20 + ( b * 12 | 0 ) + 4 >> 2 ] | 0 ) - d | 0 ) <= 0 ) {

				c = 0; return c | 0;

			}b = f[ d >> 2 ] | 0; if ( ( b | 0 ) == - 1 ) {

				c = 0; return c | 0;

			}c = f[ ( f[ a + 8 >> 2 ] | 0 ) + ( b << 2 ) >> 2 ] | 0; return c | 0;

		} function yh( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0; c = f[ a + 16 >> 2 ] | 0; if ( ( ( f[ a + 20 >> 2 ] | 0 ) - c >> 2 | 0 ) <= ( b | 0 ) ) {

				d = 0; return d | 0;

			}e = f[ c + ( b << 2 ) >> 2 ] | 0; if ( ( e | 0 ) < 0 ) {

				d = 0; return d | 0;

			}d = Je( f[ ( f[ a + 36 >> 2 ] | 0 ) + ( e << 2 ) >> 2 ] | 0 ) | 0; return d | 0;

		} function zh( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0; if ( ! ( $f( f[ a + 8 >> 2 ] | 0, ( f[ b + 4 >> 2 ] | 0 ) - ( f[ b >> 2 ] | 0 ) >> 2 ) | 0 ) ) {

				d = 0; return d | 0;

			}d = Pa[ f[ ( f[ a >> 2 ] | 0 ) + 32 >> 2 ] & 31 ]( a, b, c ) | 0; return d | 0;

		} function Ah( a, b ) {

			a = a | 0; b = b | 0; var c = 0; Ki( a ); f[ a >> 2 ] = 1088; c = a + 36 | 0; f[ c >> 2 ] = 0; f[ c + 4 >> 2 ] = 0; f[ c + 8 >> 2 ] = 0; f[ c + 12 >> 2 ] = 0; f[ c + 16 >> 2 ] = 0; f[ c + 20 >> 2 ] = 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; f[ a + 60 >> 2 ] = c; return;

		} function Bh( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1740; f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) return; c = a + 36 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function Ch( a ) {

			a = a | 0; if ( ! ( f[ a + 60 >> 2 ] | 0 ) ) return 0; if ( ! ( f[ a + 44 >> 2 ] | 0 ) ) return 0; if ( ! ( f[ a + 48 >> 2 ] | 0 ) ) return 0; if ( ! ( f[ a + 52 >> 2 ] | 0 ) ) return 0; else return ( f[ a + 56 >> 2 ] | 0 ) != 0 | 0; return 0;

		} function Dh( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1488; f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) return; c = a + 36 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function Eh( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0; d = a; e = c; c = d + 64 | 0; do {

				f[ d >> 2 ] = f[ e >> 2 ]; d = d + 4 | 0; e = e + 4 | 0;

			} while ( ( d | 0 ) < ( c | 0 ) );e = a + 64 | 0; f[ a + 88 >> 2 ] = 0; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; f[ e + 8 >> 2 ] = 0; f[ e + 12 >> 2 ] = 0; f[ e + 16 >> 2 ] = 0; b[ e + 20 >> 0 ] = 0; return;

		} function Fh( a, c, d, e ) {

			a = a | 0; c = c | 0; d = d | 0; e = e | 0; var f = 0, g = 0; if ( ( a | 0 ) == 0 & ( c | 0 ) == 0 )f = d; else {

				g = d; d = c; c = a; while ( 1 ) {

					a = g + - 1 | 0; b[ a >> 0 ] = h[ 10394 + ( c & 15 ) >> 0 ] | 0 | e; c = Uj( c | 0, d | 0, 4 ) | 0; d = I; if ( ( c | 0 ) == 0 & ( d | 0 ) == 0 ) {

						f = a; break;

					} else g = a;

				}

			} return f | 0;

		} function Gh( a ) {

			a = a | 0; var c = 0, d = 0, e = 0; c = a + 74 | 0; d = b[ c >> 0 ] | 0; b[ c >> 0 ] = d + 255 | d; d = f[ a >> 2 ] | 0; if ( ! ( d & 8 ) ) {

				f[ a + 8 >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; c = f[ a + 44 >> 2 ] | 0; f[ a + 28 >> 2 ] = c; f[ a + 20 >> 2 ] = c; f[ a + 16 >> 2 ] = c + ( f[ a + 48 >> 2 ] | 0 ); e = 0;

			} else {

				f[ a >> 2 ] = d | 32; e = - 1;

			} return e | 0;

		} function Hh( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0; c = f[ b + 88 >> 2 ] | 0; if ( ! c ) {

				d = 0; return d | 0;

			} if ( ( f[ c >> 2 ] | 0 ) != 2 ) {

				d = 0; return d | 0;

			}b = f[ c + 8 >> 2 ] | 0; f[ a + 4 >> 2 ] = h[ b >> 0 ] | h[ b + 1 >> 0 ] << 8 | h[ b + 2 >> 0 ] << 16 | h[ b + 3 >> 0 ] << 24; d = 1; return d | 0;

		} function Ih( a ) {

			a = a | 0; var b = 0; if ( ! ( f[ a + 44 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 48 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			} if ( ! ( f[ a + 52 >> 2 ] | 0 ) ) {

				b = 0; return b | 0;

			}b = ( f[ a + 56 >> 2 ] | 0 ) != 0; return b | 0;

		} function Jh( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0, g = 0, h = 0; d = b[ a + 11 >> 0 ] | 0; e = d << 24 >> 24 < 0; if ( e )g = f[ a + 4 >> 2 ] | 0; else g = d & 255; if ( g >>> 0 <= c >>> 0 )um( a ); if ( e )h = f[ a >> 2 ] | 0; else h = a; return h + c | 0;

		} function Kh( a, c ) {

			a = a | 0; c = c | 0; var d = 0; if ( f[ c + 56 >> 2 ] | 0 ) {

				d = 0; return d | 0;

			} if ( ( b[ c + 24 >> 0 ] | 0 ) != 3 ) {

				d = 0; return d | 0;

			}f[ a + 44 >> 2 ] = c; d = 1; return d | 0;

		} function Lh( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; if ( ( b | 0 ) != 0 & ( c | 0 ) != 0 ) {

				Lb( a, b, c ); return;

			} else {

				Pb( a, 0, 0 ); return;

			}

		} function Mh( a, b, c, d, e ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = $( e ); f[ a + 4 >> 2 ] = b; pd( a + 8 | 0, c, c + ( d << 2 ) | 0 ); n[ a + 20 >> 2 ] = e; return;

		} function Nh( a, b ) {

			a = a | 0; b = b | 0; var c = 0; if ( ! ( Oa[ f[ ( f[ a >> 2 ] | 0 ) + 36 >> 2 ] & 127 ]( a, b ) | 0 ) ) {

				c = 0; return c | 0;

			} if ( ! ( Oa[ f[ ( f[ a >> 2 ] | 0 ) + 40 >> 2 ] & 127 ]( a, b ) | 0 ) ) {

				c = 0; return c | 0;

			}c = Na[ f[ ( f[ a >> 2 ] | 0 ) + 44 >> 2 ] & 127 ]( a ) | 0; return c | 0;

		} function Oh( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0; d = f[ c >> 2 ] | 0; c = a; e = b - a >> 2; while ( 1 ) {

				if ( ! e ) break; a = ( e | 0 ) / 2 | 0; b = c + ( a << 2 ) | 0; g = ( f[ b >> 2 ] | 0 ) >>> 0 < d >>> 0; c = g ? b + 4 | 0 : c; e = g ? e + - 1 - a | 0 : a;

			} return c | 0;

		} function Ph( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0; if ( ! ( xj( a, c, d ) | 0 ) ) {

				e = 0; return e | 0;

			}d = f[ a + 8 >> 2 ] | 0; if ( ( b[ d + 24 >> 0 ] | 0 ) != 3 ) {

				e = 0; return e | 0;

			}e = ( f[ d + 28 >> 2 ] | 0 ) == 9; return e | 0;

		} function Qh( a ) {

			a = a | 0; var c = 0; f[ a >> 2 ] = 0; c = a + 8 | 0; f[ c >> 2 ] = 0; f[ c + 4 >> 2 ] = 0; f[ c + 8 >> 2 ] = 0; f[ c + 12 >> 2 ] = 0; b[ a + 24 >> 0 ] = 1; f[ a + 28 >> 2 ] = 9; c = a + 40 | 0; f[ c >> 2 ] = 0; f[ c + 4 >> 2 ] = 0; f[ c + 8 >> 2 ] = 0; f[ c + 12 >> 2 ] = 0; f[ a + 56 >> 2 ] = - 1; f[ a + 60 >> 2 ] = 0; return;

		} function Rh( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0; a = u; u = u + 32 | 0; d = a; Mf( d, c ); c = f[ d + 16 >> 2 ] | 0; e = d + 4 | 0; if ( ( b[ e + 11 >> 0 ] | 0 ) >= 0 ) {

				u = a; return c | 0;

			}dn( f[ e >> 2 ] | 0 ); u = a; return c | 0;

		} function Sh( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0, h = 0; if ( ! ( Om( b[ f[ a >> 2 ] >> 0 ] | 0 ) | 0 ) )c = 0; else {

				d = 0; while ( 1 ) {

					e = f[ a >> 2 ] | 0; g = ( d * 10 | 0 ) + - 48 + ( b[ e >> 0 ] | 0 ) | 0; h = e + 1 | 0; f[ a >> 2 ] = h; if ( ! ( Om( b[ h >> 0 ] | 0 ) | 0 ) ) {

						c = g; break;

					} else d = g;

				}

			} return c | 0;

		} function Th( a, c ) {

			a = a | 0; c = c | 0; var d = 0; if ( f[ c + 56 >> 2 ] | 0 ) {

				d = 0; return d | 0;

			} if ( ( b[ c + 24 >> 0 ] | 0 ) != 3 ) {

				d = 0; return d | 0;

			}f[ a + 64 >> 2 ] = c; d = 1; return d | 0;

		} function Uh( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0; if ( ! ( xj( a, b, c ) | 0 ) ) {

				d = 0; return d | 0;

			}d = ( f[ ( f[ ( f[ ( f[ b + 4 >> 2 ] | 0 ) + 8 >> 2 ] | 0 ) + ( c << 2 ) >> 2 ] | 0 ) + 28 >> 2 ] | 0 ) == 9; return d | 0;

		} function Vh( a ) {

			a = a | 0; var b = 0, c = 0; b = f[ r >> 2 ] | 0; c = b + a | 0; if ( ( a | 0 ) > 0 & ( c | 0 ) < ( b | 0 ) | ( c | 0 ) < 0 ) {

				ea() | 0; ya( 12 ); return - 1;

			}f[ r >> 2 ] = c; if ( ( c | 0 ) > ( da() | 0 ) ? ( ca() | 0 ) == 0 : 0 ) {

				f[ r >> 2 ] = b; ya( 12 ); return - 1;

			} return b | 0;

		} function Wh( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0, f = 0; if ( ( a | 0 ) == 0 & ( c | 0 ) == 0 )e = d; else {

				f = d; d = c; c = a; while ( 1 ) {

					a = f + - 1 | 0; b[ a >> 0 ] = c & 7 | 48; c = Uj( c | 0, d | 0, 3 ) | 0; d = I; if ( ( c | 0 ) == 0 & ( d | 0 ) == 0 ) {

						e = a; break;

					} else f = a;

				}

			} return e | 0;

		} function Xh( a, c ) {

			a = a | 0; c = c | 0; var d = 0; if ( ( ( c | 0 ) != 0 ? ( f[ c + 56 >> 2 ] | 0 ) == 0 : 0 ) ? ( b[ c + 24 >> 0 ] | 0 ) == 3 : 0 ) {

				f[ a + 60 >> 2 ] = c; d = 1;

			} else d = 0; return d | 0;

		} function Yh( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 36 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function Zh( a, b, c, d, e, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; g = g | 0; if ( zl( a, f[ b + 8 >> 2 ] | 0, g ) | 0 )Tf( 0, b, c, d, e ); return;

		} function _h( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0; c = u; u = u + 16 | 0; d = c; e = f[ a + 4 >> 2 ] | 0; g = ( f[ e + 56 >> 2 ] | 0 ) - ( f[ e + 52 >> 2 ] | 0 ) >> 2; b[ d >> 0 ] = 0; le( a + 20 | 0, g, d ); u = c; return;

		} function $h( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Sb( a, b, c ) | 0;

		} function ai( a ) {

			a = a | 0; var b = 0; switch ( a | 0 ) {

				case 11:case 2:case 1: {

					b = 1; break;

				} case 4:case 3: {

					b = 2; break;

				} case 6:case 5: {

					b = 4; break;

				} case 8:case 7: {

					b = 8; break;

				} case 9: {

					b = 4; break;

				} case 10: {

					b = 8; break;

				} default:b = - 1;

			} return b | 0;

		} function bi( a ) {

			a = a | 0; var c = 0, d = 0, e = 0; b[ a + 36 >> 0 ] = 0; c = Rj( f[ a + 32 >> 2 ] | 0, 0, 7, 0 ) | 0; d = Uj( c | 0, I | 0, 3 ) | 0; c = a + 16 | 0; a = c; e = Rj( d | 0, I | 0, f[ a >> 2 ] | 0, f[ a + 4 >> 2 ] | 0 ) | 0; a = c; f[ a >> 2 ] = e; f[ a + 4 >> 2 ] = I; return;

		} function ci( a ) {

			a = a | 0; var c = 0, d = 0, e = 0, g = 0; c = u; u = u + 16 | 0; d = c; e = f[ a + 4 >> 2 ] | 0; g = ( f[ e + 28 >> 2 ] | 0 ) - ( f[ e + 24 >> 2 ] | 0 ) >> 2; b[ d >> 0 ] = 0; le( a + 20 | 0, g, d ); u = c; return;

		} function di( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; b = a + 60 | 0; c = a; d = c + 60 | 0; do {

				f[ c >> 2 ] = 0; c = c + 4 | 0;

			} while ( ( c | 0 ) < ( d | 0 ) );f[ b >> 2 ] = a; b = a + 64 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; f[ b + 16 >> 2 ] = 0; f[ b + 20 >> 2 ] = 0; return;

		} function ei( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0; d = ( f[ a + 96 >> 2 ] | 0 ) + ( b * 12 | 0 ) | 0; rd( c, d, d + 12 | 0 ); return 1;

		} function fi() {

			var a = 0, b = 0; a = bj( 40 ) | 0; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; n[ a + 16 >> 2 ] = $( 1.0 ); b = a + 20 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; n[ a + 36 >> 2 ] = $( 1.0 ); return a | 0;

		} function gi( a ) {

			a = a | 0; f[ a >> 2 ] = 2396; wf( a + 8 | 0 ); dn( a ); return;

		} function hi( a, c ) {

			a = a | 0; c = c | 0; var d = 0, e = 0; if ( ( a | 0 ) != ( c | 0 ) ) {

				d = b[ c + 11 >> 0 ] | 0; e = d << 24 >> 24 < 0; Kf( a, e ? f[ c >> 2 ] | 0 : c, e ? f[ c + 4 >> 2 ] | 0 : d & 255 ) | 0;

			} return a | 0;

		} function ii( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0, f = 0; c = a & 65535; d = b & 65535; e = X( d, c ) | 0; f = a >>> 16; a = ( e >>> 16 ) + ( X( d, f ) | 0 ) | 0; d = b >>> 16; b = X( d, c ) | 0; return ( I = ( a >>> 16 ) + ( X( d, f ) | 0 ) + ( ( ( a & 65535 ) + b | 0 ) >>> 16 ) | 0, a + b << 16 | e & 65535 | 0 ) | 0;

		} function ji( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0, e = 0; c = gg( b ) | 0; d = bj( c + 13 | 0 ) | 0; f[ d >> 2 ] = c; f[ d + 4 >> 2 ] = c; f[ d + 8 >> 2 ] = 0; e = Zl( d ) | 0; ge( e | 0, b | 0, c + 1 | 0 ) | 0; f[ a >> 2 ] = e; return;

		} function ki( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0; if ( ( b | 0 ) == - 1 | ( b | 0 ) > 4 ) {

				c = - 1; return c | 0;

			}d = f[ a + 20 + ( b * 12 | 0 ) >> 2 ] | 0; if ( ( ( f[ a + 20 + ( b * 12 | 0 ) + 4 >> 2 ] | 0 ) - d | 0 ) <= 0 ) {

				c = - 1; return c | 0;

			}c = f[ d >> 2 ] | 0; return c | 0;

		} function li( a ) {

			a = a | 0; f[ a >> 2 ] = 2396; wf( a + 8 | 0 ); return;

		} function mi( a, b, c, d, e ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; f[ b + 44 >> 2 ] = e; Tb( a, b, c, d, e ); return;

		} function ni( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1208; b = f[ a + 32 >> 2 ] | 0; if ( ! b ) return; c = a + 36 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function oi( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; if ( zl( a, f[ b + 8 >> 2 ] | 0, 0 ) | 0 )Sg( 0, b, c, d ); return;

		} function pi( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 2616; b = a + 4 | 0; f[ a + 40 >> 2 ] = 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; f[ b + 16 >> 2 ] = 0; f[ b + 20 >> 2 ] = 0; f[ b + 24 >> 2 ] = 0; f[ b + 28 >> 2 ] = 0; d[ b + 32 >> 1 ] = 0; return;

		} function qi( a, c, d ) {

			a = a | 0; c = c | 0; d = d | 0; var e = 0; if ( ( c | 0 ) < ( a | 0 ) & ( a | 0 ) < ( c + d | 0 ) ) {

				e = a; c = c + d | 0; a = a + d | 0; while ( ( d | 0 ) > 0 ) {

					a = a - 1 | 0; c = c - 1 | 0; d = d - 1 | 0; b[ a >> 0 ] = b[ c >> 0 ] | 0;

				}a = e;

			} else ge( a, c, d ) | 0; return a | 0;

		} function ri( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; f[ a >> 2 ] = 956; b = f[ a + 8 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}c = a + 12 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); dn( a ); return;

		} function si( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0; d = u; u = u + 16 | 0; e = d; f[ e >> 2 ] = f[ c >> 2 ]; g = Pa[ f[ ( f[ a >> 2 ] | 0 ) + 16 >> 2 ] & 31 ]( a, b, e ) | 0; if ( g )f[ c >> 2 ] = f[ e >> 2 ]; u = d; return g & 1 | 0;

		} function ti( a, b ) {

			a = a | 0; b = b | 0; var c = 0; if ( b >>> 0 >= 2 ) {

				c = 0; return c | 0;

			}f[ a + 28 >> 2 ] = b; c = 1; return c | 0;

		} function ui( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0; if ( ( b | 0 ) > 0 )d = 0; else return; do {

				e = f[ a + ( d << 2 ) >> 2 ] | 0; f[ c + ( d << 2 ) >> 2 ] = e << 31 >> 31 ^ e >>> 1; d = d + 1 | 0;

			} while ( ( d | 0 ) != ( b | 0 ) );return;

		} function vi() {

			var a = 0, b = 0; a = ej() | 0; if ( ( a | 0 ? ( b = f[ a >> 2 ] | 0, b | 0 ) : 0 ) ? ( a = b + 48 | 0, ( f[ a >> 2 ] & - 256 | 0 ) == 1126902528 ? ( f[ a + 4 >> 2 ] | 0 ) == 1129074247 : 0 ) : 0 )Rk( f[ b + 12 >> 2 ] | 0 ); Rk( lm() | 0 );

		} function wi( a ) {

			a = a | 0; var c = 0; c = b[ w + ( a & 255 ) >> 0 ] | 0; if ( ( c | 0 ) < 8 ) return c | 0; c = b[ w + ( a >> 8 & 255 ) >> 0 ] | 0; if ( ( c | 0 ) < 8 ) return c + 8 | 0; c = b[ w + ( a >> 16 & 255 ) >> 0 ] | 0; if ( ( c | 0 ) < 8 ) return c + 16 | 0; return ( b[ w + ( a >>> 24 ) >> 0 ] | 0 ) + 24 | 0;

		} function xi( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; if ( ! a ) return; b = f[ a >> 2 ] | 0; if ( b | 0 ) {

				c = a + 4 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b );

			}dn( a ); return;

		} function yi( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; if ( ! a ) return; b = f[ a >> 2 ] | 0; if ( b | 0 ) {

				c = a + 4 | 0; d = f[ c >> 2 ] | 0; if ( ( d | 0 ) != ( b | 0 ) )f[ c >> 2 ] = d + ( ~ ( ( d + - 2 - b | 0 ) >>> 1 ) << 1 ); dn( b );

			}dn( a ); return;

		} function zi( a, c ) {

			a = a | 0; c = c | 0; var d = 0; b[ c + 84 >> 0 ] = 1; a = f[ c + 68 >> 2 ] | 0; d = c + 72 | 0; c = f[ d >> 2 ] | 0; if ( ( c | 0 ) == ( a | 0 ) ) return 1; f[ d >> 2 ] = c + ( ~ ( ( c + - 4 - a | 0 ) >>> 2 ) << 2 ); return 1;

		} function Ai( a ) {

			a = a | 0; var b = 0, c = 0; if ( Im( a ) | 0 ? ( b = dm( f[ a >> 2 ] | 0 ) | 0, a = b + 8 | 0, c = f[ a >> 2 ] | 0, f[ a >> 2 ] = c + - 1, ( c + - 1 | 0 ) < 0 ) : 0 )dn( b ); return;

		} function Bi( a ) {

			a = a | 0; var c = 0; f[ a >> 2 ] = 0; c = a + 8 | 0; d[ a + 38 >> 1 ] = 0; f[ c >> 2 ] = 0; f[ c + 4 >> 2 ] = 0; f[ c + 8 >> 2 ] = 0; f[ c + 12 >> 2 ] = 0; f[ c + 16 >> 2 ] = 0; f[ c + 20 >> 2 ] = 0; f[ c + 24 >> 2 ] = 0; b[ c + 28 >> 0 ] = 0; return;

		} function Ci( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1148; b = a + 20 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 )Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); Yf( a ); dn( a ); return;

		} function Di( a, b ) {

			a = a | 0; b = b | 0; return Oa[ f[ ( f[ a >> 2 ] | 0 ) + 48 >> 2 ] & 127 ]( a, ( f[ b + 4 >> 2 ] | 0 ) - ( f[ b >> 2 ] | 0 ) >> 2 ) | 0;

		} function Ei( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 956; b = f[ a + 8 >> 2 ] | 0; if ( ! b ) return; c = a + 12 | 0; a = f[ c >> 2 ] | 0; if ( ( a | 0 ) != ( b | 0 ) )f[ c >> 2 ] = a + ( ~ ( ( a + - 4 - b | 0 ) >>> 2 ) << 2 ); dn( b ); return;

		} function Fi( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; xb( a, b, c ); return;

		} function Gi( a ) {

			a = a | 0; Bi( a ); Bi( a + 40 | 0 ); Cm( a + 80 | 0 ); Bi( a + 96 | 0 ); f[ a + 136 >> 2 ] = 0; f[ a + 140 >> 2 ] = 0; f[ a + 144 >> 2 ] = 0; return;

		} function Hi( a ) {

			a = a | 0; var b = 0, c = 0; f[ a >> 2 ] = 1148; b = a + 20 | 0; c = f[ b >> 2 ] | 0; f[ b >> 2 ] = 0; if ( c | 0 )Sa[ f[ ( f[ c >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( c ); Yf( a ); return;

		} function Ii( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return wc( a, b, 5, 6, c ) | 0;

		} function Ji( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return uc( a, b, 3, 4, c ) | 0;

		} function Ki( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 984; b = a + 4 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; f[ b + 16 >> 2 ] = 0; f[ b + 20 >> 2 ] = 0; f[ b + 24 >> 2 ] = 0; f[ b + 28 >> 2 ] = 0; return;

		} function Li( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return zc( a, b, 1, 2, c ) | 0;

		} function Mi( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return vc( a, b, 3, 4, c ) | 0;

		} function Ni( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return xc( a, b, 5, 6, c ) | 0;

		} function Oi( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; var d = 0, e = 0, g = 0; d = a + 20 | 0; e = f[ d >> 2 ] | 0; g = ( f[ a + 16 >> 2 ] | 0 ) - e | 0; a = g >>> 0 > c >>> 0 ? c : g; ge( e | 0, b | 0, a | 0 ) | 0; f[ d >> 2 ] = ( f[ d >> 2 ] | 0 ) + a; return c | 0;

		} function Pi( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Ac( a, b, 1, 2, c ) | 0;

		} function Qi( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 2372; b = f[ a + 20 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 8 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}dn( b ); dn( a ); return;

		} function Ri() {

			var a = 0, b = 0; a = bj( 24 ) | 0; f[ a >> 2 ] = 956; f[ a + 4 >> 2 ] = - 1; b = a + 8 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; return a | 0;

		} function Si( a ) {

			a = a | 0; var c = 0; Qh( a ); c = a + 64 | 0; f[ a + 88 >> 2 ] = 0; f[ c >> 2 ] = 0; f[ c + 4 >> 2 ] = 0; f[ c + 8 >> 2 ] = 0; f[ c + 12 >> 2 ] = 0; f[ c + 16 >> 2 ] = 0; b[ c + 20 >> 0 ] = 0; return;

		} function Ti( a ) {

			a = a | 0; var b = 0, c = 0; if ( ! a ) return; b = f[ a + 8 >> 2 ] | 0; if ( b | 0 ) {

				c = a + 12 | 0; if ( ( f[ c >> 2 ] | 0 ) != ( b | 0 ) )f[ c >> 2 ] = b; dn( b );

			}dn( a ); return;

		} function Ui( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; if ( ( f[ b + 4 >> 2 ] | 0 ) == ( c | 0 ) ? ( c = b + 28 | 0, ( f[ c >> 2 ] | 0 ) != 1 ) : 0 )f[ c >> 2 ] = d; return;

		} function Vi( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 2420; b = f[ a + 20 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 8 >> 2 ] | 0; if ( ! b ) {

				dn( a ); return;

			}dn( b ); dn( a ); return;

		} function Wi( a, b, c, e ) {

			a = a | 0; b = b | 0; c = c | 0; e = e | 0; f[ a >> 2 ] = b; b = a + 8 | 0; f[ b >> 2 ] = c; f[ b + 4 >> 2 ] = 0; d[ a + 38 >> 1 ] = e; e = a + 16 | 0; f[ e >> 2 ] = 0; f[ e + 4 >> 2 ] = 0; return;

		} function Xi( a, b, c ) {

			a = a | 0; b = $( b ); c = c | 0; var d = 0, e = La; if ( ( c | 0 ) < 1 ) {

				d = 0; return d | 0;

			}e = $( $( 1.0 ) / $( c | 0 ) ); n[ a + 4 >> 2 ] = e; n[ a >> 2 ] = b; d = 1; return d | 0;

		} function Yi( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; f[ a + 4 >> 2 ] = b; f[ a + 8 >> 2 ] = f[ ( f[ ( f[ b + 4 >> 2 ] | 0 ) + 8 >> 2 ] | 0 ) + ( c << 2 ) >> 2 ]; f[ a + 12 >> 2 ] = c; return 1;

		} function Zi( a ) {

			a = a | 0; var b = 0, c = 0; if ( ! a ) return; b = f[ a >> 2 ] | 0; if ( b | 0 ) {

				c = a + 4 | 0; if ( ( f[ c >> 2 ] | 0 ) != ( b | 0 ) )f[ c >> 2 ] = b; dn( b );

			}dn( a ); return;

		} function _i( a ) {

			a = a | 0; var b = 0; Gl( a ); f[ a + 16 >> 2 ] = 0; f[ a + 20 >> 2 ] = 0; f[ a + 12 >> 2 ] = a + 16; b = a + 24 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; return;

		} function $i( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0; e = u; u = u + 16 | 0; g = e | 0; gc( a, b, c, d, g ) | 0; u = e; return ( I = f[ g + 4 >> 2 ] | 0, f[ g >> 2 ] | 0 ) | 0;

		} function aj( a ) {

			a = a | 0; var b = 0; Yj( a ); f[ a >> 2 ] = 2668; b = a + 84 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; f[ b + 16 >> 2 ] = 0; f[ b + 20 >> 2 ] = 0; return;

		} function bj( a ) {

			a = a | 0; var b = 0, c = 0; b = ( a | 0 ) == 0 ? 1 : a; while ( 1 ) {

				a = Ya( b ) | 0; if ( a | 0 ) {

					c = a; break;

				}a = fm() | 0; if ( ! a ) {

					c = 0; break;

				}Ra[ a & 3 ]();

			} return c | 0;

		} function cj( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 2372; b = f[ a + 20 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 8 >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function dj( a ) {

			a = a | 0; var b = 0, c = 0, d = 0; b = u; u = u + 16 | 0; c = b; d = fn( f[ a + 60 >> 2 ] | 0 ) | 0; f[ c >> 2 ] = d; d = ik( Ba( 6, c | 0 ) | 0 ) | 0; u = b; return d | 0;

		} function ej() {

			var a = 0, b = 0; a = u; u = u + 16 | 0; if ( ! ( Ha( 13444, 3 ) | 0 ) ) {

				b = Fa( f[ 3362 ] | 0 ) | 0; u = a; return b | 0;

			} else zj( 12582, a ); return 0;

		} function fj( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 2420; b = f[ a + 20 >> 2 ] | 0; if ( b | 0 )dn( b ); b = f[ a + 8 >> 2 ] | 0; if ( ! b ) return; dn( b ); return;

		} function gj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, f = 0; e = a; a = c; c = ii( e, a ) | 0; f = I; return ( I = ( X( b, a ) | 0 ) + ( X( d, e ) | 0 ) + f | f & 0, c | 0 | 0 ) | 0;

		} function hj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Ii( b, c, d ) | 0;

		} function ij( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Ji( b, c, d ) | 0;

		} function jj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return bd( b, c, d ) | 0;

		} function kj( a ) {

			a = a | 0; var b = 0; b = u; u = u + 16 | 0; Cb( a ); if ( ! ( Ia( f[ 3362 ] | 0, 0 ) | 0 ) ) {

				u = b; return;

			} else zj( 12681, b );

		} function lj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Li( b, c, d ) | 0;

		} function mj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Mi( b, c, d ) | 0;

		} function nj( a ) {

			a = a | 0; f[ a >> 2 ] = 1940; dn( a ); return;

		} function oj( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; b = a + 16 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; f[ b + 8 >> 2 ] = 0; f[ b + 12 >> 2 ] = 0; return;

		} function pj( a ) {

			a = a | 0; Dk( a ); f[ a >> 2 ] = 2108; f[ a + 24 >> 2 ] = - 1; f[ a + 28 >> 2 ] = 0; n[ a + 32 >> 2 ] = $( 0.0 ); return;

		} function qj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Pi( b, c, d ) | 0;

		} function rj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Ni( b, c, d ) | 0;

		} function sj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; f[ a >> 2 ] = b; b = a + 8 | 0; f[ b >> 2 ] = c; f[ b + 4 >> 2 ] = 0; b = a + 16 | 0; f[ b >> 2 ] = 0; f[ b + 4 >> 2 ] = 0; return;

		} function tj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0, g = 0; e = u; u = u + 16 | 0; g = e; f[ g >> 2 ] = d; d = Af( a, b, c, g ) | 0; u = e; return d | 0;

		} function uj( a ) {

			a = a | 0; f[ a >> 2 ] = 2024; dn( a ); return;

		} function vj( a ) {

			a = a | 0; f[ a >> 2 ] = 1940; return;

		} function wj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return 1;

		} function xj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Yi( a, b, c ) | 0;

		} function yj( a, b, c, d, e, f, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; f = f | 0; g = g | 0; return Qa[ a & 15 ]( b | 0, c | 0, d | 0, e | 0, f | 0, g | 0 ) | 0;

		} function zj( a, b ) {

			a = a | 0; b = b | 0; var c = 0, d = 0; c = u; u = u + 16 | 0; d = c; f[ d >> 2 ] = b; b = f[ 678 ] | 0; ye( b, a, d ) | 0; lg( 10, b ) | 0; Ca();

		} function Aj( a ) {

			a = a | 0; f[ a >> 2 ] = 2024; return;

		} function Bj( a, b ) {

			a = a | 0; b = b | 0; var c = 0; c = f[ a + 48 >> 2 ] | 0; return Oa[ f[ ( f[ c >> 2 ] | 0 ) + 16 >> 2 ] & 127 ]( c, b ) | 0;

		} function Cj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return ki( b, c ) | 0;

		} function Dj( a, b ) {

			a = a | 0; b = b | 0; var c = 0; c = f[ a + 48 >> 2 ] | 0; return Oa[ f[ ( f[ c >> 2 ] | 0 ) + 12 >> 2 ] & 127 ]( c, b ) | 0;

		} function Ej( a, b ) {

			a = a | 0; b = b | 0; var c = 0; c = f[ a + 48 >> 2 ] | 0; return Oa[ f[ ( f[ c >> 2 ] | 0 ) + 20 >> 2 ] & 127 ]( c, b ) | 0;

		} function Fj( a ) {

			a = a | 0; var c = 0, d = 0; c = a + 4 | 0; if ( ( b[ c + 11 >> 0 ] | 0 ) < 0 ) {

				d = f[ c >> 2 ] | 0; return d | 0;

			} else {

				d = c; return d | 0;

			} return 0;

		} function Gj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Id( b, c, d ) | 0;

		} function Hj() {

			var a = 0; a = u; u = u + 16 | 0; if ( ! ( Ga( 13448, 83 ) | 0 ) ) {

				u = a; return;

			} else zj( 12631, a );

		} function Ij( a ) {

			a = a | 0; Pc( a ); dn( a ); return;

		} function Jj( a, b, c, d, e, f, g ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; f = f | 0; g = g | 0; Xa[ a & 3 ]( b | 0, c | 0, d | 0, e | 0, f | 0, g | 0 );

		} function Kj( a ) {

			a = a | 0; if ( ! ( f[ a + 44 >> 2 ] | 0 ) ) return 0; else return Na[ f[ ( f[ a >> 2 ] | 0 ) + 48 >> 2 ] & 127 ]( a ) | 0; return 0;

		} function Lj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return ag( b, c, d ) | 0;

		} function Mj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; if ( b | 0 )Vf( a | 0, ( Dm( c ) | 0 ) & 255 | 0, b | 0 ) | 0; return a | 0;

		} function Nj( a ) {

			a = a | 0; return 4;

		} function Oj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; if ( ( c | 0 ) < 32 ) {

				I = b << c | ( a & ( 1 << c ) - 1 << 32 - c ) >>> 32 - c; return a << c;

			}I = a << c - 32; return 0;

		} function Pj( a ) {

			a = a | 0; var c = 0; if ( ! a ) return; c = a + 4 | 0; if ( ( b[ c + 11 >> 0 ] | 0 ) < 0 )dn( f[ c >> 2 ] | 0 ); dn( a ); return;

		} function Qj() {} function Rj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0; e = a + c >>> 0; return ( I = b + d + ( e >>> 0 < a >>> 0 | 0 ) >>> 0, e | 0 ) | 0;

		} function Sj( a, b ) {

			a = a | 0; b = b | 0; var c = 0; if ( ! b )c = 0; else c = Ce( f[ b >> 2 ] | 0, f[ b + 4 >> 2 ] | 0, a ) | 0; return ( c | 0 ? c : a ) | 0;

		} function Tj( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; var e = 0; e = b - d >>> 0; e = b - d - ( c >>> 0 > a >>> 0 | 0 ) >>> 0; return ( I = e, a - c >>> 0 | 0 ) | 0;

		} function Uj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; if ( ( c | 0 ) < 32 ) {

				I = b >>> c; return a >>> c | ( b & ( 1 << c ) - 1 ) << 32 - c;

			}I = 0; return b >>> c - 32 | 0;

		} function Vj( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Yg( a, b, c ) | 0;

		} function Wj( a ) {

			a = a | 0; Jc( a ); dn( a ); return;

		} function Xj( a ) {

			a = a | 0; return 5;

		} function Yj( a ) {

			a = a | 0; var b = 0; f[ a >> 2 ] = 2696; b = a + 4 | 0; a = b + 80 | 0; do {

				f[ b >> 2 ] = 0; b = b + 4 | 0;

			} while ( ( b | 0 ) < ( a | 0 ) );return;

		} function Zj( a ) {

			a = a | 0; return 6;

		} function _j( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return ei( b, c, d ) | 0;

		} function $j( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; f[ a + 28 >> 2 ] = b; f[ a + 32 >> 2 ] = c; return 1;

		} function ak( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Cj( a, b, c ) | 0;

		} function bk( a ) {

			a = a | 0; var b = 0; b = f[ a + 48 >> 2 ] | 0; return Na[ f[ ( f[ b >> 2 ] | 0 ) + 28 >> 2 ] & 127 ]( b ) | 0;

		} function ck( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Cd( b, c ) | 0;

		} function dk( a ) {

			a = a | 0; f[ a >> 2 ] = 1040; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = - 1; f[ a + 16 >> 2 ] = 0; return;

		} function ek( a ) {

			a = a | 0; var b = 0; b = f[ a + 48 >> 2 ] | 0; return Na[ f[ ( f[ b >> 2 ] | 0 ) + 24 >> 2 ] & 127 ]( b ) | 0;

		} function fk( a, b ) {

			a = a | 0; b = b | 0; ng( a, b ); return;

		} function gk( a ) {

			a = a | 0; var b = 0; b = f[ a + 48 >> 2 ] | 0; return Na[ f[ ( f[ b >> 2 ] | 0 ) + 36 >> 2 ] & 127 ]( b ) | 0;

		} function hk( a, b, c, d, e, f ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; f = f | 0; Wa[ a & 3 ]( b | 0, c | 0, d | 0, e | 0, f | 0 );

		} function ik( a ) {

			a = a | 0; var b = 0, c = 0; if ( a >>> 0 > 4294963200 ) {

				b = ln() | 0; f[ b >> 2 ] = 0 - a; c = - 1;

			} else c = a; return c | 0;

		} function jk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return $g( a, b, c ) | 0;

		} function kk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return nf( a, b, c ) | 0;

		} function lk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Df( a, b, c ) | 0;

		} function mk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return We( a, b, c ) | 0;

		} function nk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return + ( + zf( a, b, c ) );

		} function ok( a, b ) {

			a = a | 0; b = b | 0; return Oa[ f[ ( f[ a >> 2 ] | 0 ) + 12 >> 2 ] & 127 ]( a, b ) | 0;

		} function pk( a, b ) {

			a = a | 0; b = b | 0; return Oa[ f[ ( f[ a >> 2 ] | 0 ) + 56 >> 2 ] & 127 ]( a, b ) | 0;

		} function qk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Cg( a, b, c ) | 0;

		} function rk( a, b ) {

			a = a | 0; b = b | 0; f[ a + 4 >> 2 ] = b; return 1;

		} function sk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Kk( b, c ) | 0;

		} function tk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Ef( a, b, c ) | 0;

		} function uk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Bf( a, b, c ) | 0;

		} function vk( a ) {

			a = a | 0; Dk( a ); f[ a >> 2 ] = 1824; f[ a + 24 >> 2 ] = - 1; return;

		} function wk( a, b ) {

			a = a | 0; b = b | 0; f[ a + 8 >> 2 ] = b; f[ a + 12 >> 2 ] = - 1; return 1;

		} function xk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return ne( a, b, c ) | 0;

		} function yk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return He( b, c ) | 0;

		} function zk( a ) {

			a = + a; var b = 0; p[ s >> 3 ] = a; b = f[ s >> 2 ] | 0; I = f[ s + 4 >> 2 ] | 0; return b | 0;

		} function Ak() {

			var a = 0; a = bj( 40 ) | 0; f[ a >> 2 ] = - 1; oj( a + 8 | 0 ); return a | 0;

		} function Bk() {

			var a = 0; a = bj( 8 ) | 0; f[ a >> 2 ] = 928; f[ a + 4 >> 2 ] = - 1; return a | 0;

		} function Ck( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return hf( a, b, c ) | 0;

		} function Dk( a ) {

			a = a | 0; dk( a ); f[ a >> 2 ] = 1148; f[ a + 20 >> 2 ] = 0; return;

		} function Ek( a, b ) {

			a = a | 0; b = b | 0; fk( a, b ); return;

		} function Fk( a ) {

			a = a | 0; var b = 0; if ( ! a )b = 0; else b = ( De( a, 800, 888, 0 ) | 0 ) != 0 & 1; return b | 0;

		} function Gk( a, b ) {

			a = a | 0; b = b | 0; return $( n[ ( f[ a + 8 >> 2 ] | 0 ) + ( b << 2 ) >> 2 ] );

		} function Hk( a, b ) {

			a = a | 0; b = b | 0; return Rh( a, b ) | 0;

		} function Ik( a ) {

			a = a | 0; if ( ( b[ a + 11 >> 0 ] | 0 ) < 0 )dn( f[ a >> 2 ] | 0 ); return;

		} function Jk( a ) {

			a = a | 0; if ( ! a ) return; Sa[ f[ ( f[ a >> 2 ] | 0 ) + 4 >> 2 ] & 127 ]( a ); return;

		} function Kk( a, b ) {

			a = a | 0; b = b | 0; return hh( a, b ) | 0;

		} function Lk( a, b, c, d, e ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; Va[ a & 7 ]( b | 0, c | 0, d | 0, e | 0 );

		} function Mk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; if ( c | 0 )qi( a | 0, b | 0, c | 0 ) | 0; return a | 0;

		} function Nk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Zk( b, c ) | 0;

		} function Ok( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; if ( c | 0 )ge( a | 0, b | 0, c | 0 ) | 0; return a | 0;

		} function Pk( a, b ) {

			a = a | 0; b = b | 0; return - 1;

		} function Qk( a ) {

			a = a | 0; return 3;

		} function Rk( a ) {

			a = a | 0; var b = 0; b = u; u = u + 16 | 0; Ra[ a & 3 ](); zj( 12734, b );

		} function Sk( a, b ) {

			a = a | 0; b = b | 0; return Ml( a, b ) | 0;

		} function Tk( a ) {

			a = a | 0; Pe( a ); dn( a ); return;

		} function Uk( a ) {

			a = a | 0; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a + 12 >> 2 ] = 0; return;

		} function Vk( a ) {

			a = a | 0; dl( a ); f[ a >> 2 ] = 2236; f[ a + 48 >> 2 ] = 0; return;

		} function Wk( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return Pa[ a & 31 ]( b | 0, c | 0, d | 0 ) | 0;

		} function Xk( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; sj( a, b, c ); return;

		} function Yk( a, b ) {

			a = a | 0; b = b | 0; f[ a >> 2 ] = 3684; ji( a + 4 | 0, b ); return;

		} function Zk( a, b ) {

			a = a | 0; b = b | 0; return f[ ( f[ a + 8 >> 2 ] | 0 ) + ( b << 2 ) >> 2 ] | 0;

		} function _k( a, b ) {

			a = a | 0; b = b | 0; var c = 0; if ( ! a )c = 0; else c = vf( a, b, 0 ) | 0; return c | 0;

		} function $k( a, b ) {

			a = a | 0; b = b | 0; return f[ ( f[ a + 4 >> 2 ] | 0 ) + ( b << 2 ) >> 2 ] | 0;

		} function al() {

			var a = 0; a = bj( 64 ) | 0; Qh( a ); return a | 0;

		} function bl( a, b ) {

			a = a | 0; b = b | 0; return $( hl( a, b ) );

		} function cl( a ) {

			a = a | 0; return f[ a + 8 >> 2 ] | 0;

		} function dl( a ) {

			a = a | 0; pi( a ); f[ a >> 2 ] = 2176; f[ a + 44 >> 2 ] = 0; return;

		} function el( a ) {

			a = a | 0; if ( ! a ) return; Cf( a ); dn( a ); return;

		} function fl( a, b ) {

			a = a | 0; b = b | 0; return Ul( a, b ) | 0;

		} function gl( a ) {

			a = a | 0; return b[ ( f[ a + 8 >> 2 ] | 0 ) + 24 >> 0 ] | 0;

		} function hl( a, b ) {

			a = a | 0; b = b | 0; return $( n[ ( f[ a >> 2 ] | 0 ) + ( b << 2 ) >> 2 ] );

		} function il( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; if ( ! ( f[ a >> 2 ] & 32 ) )Xe( b, c, a ) | 0; return;

		} function jl( a ) {

			a = a | 0; return ( f[ a + 8 >> 2 ] | 0 ) - ( f[ a + 4 >> 2 ] | 0 ) >> 2 | 0;

		} function kl( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; Ua[ a & 7 ]( b | 0, c | 0, d | 0 );

		} function ll() {

			var a = 0; a = bj( 96 ) | 0; Si( a ); return a | 0;

		} function ml( a ) {

			a = a | 0; var b = 0; b = u; u = u + a | 0; u = u + 15 & - 16; return b | 0;

		} function nl( a ) {

			a = a | 0; var b = 0; b = ( Zm() | 0 ) + 188 | 0; return vg( a, f[ b >> 2 ] | 0 ) | 0;

		} function ol( a ) {

			a = a | 0; return ( ( f[ a + 100 >> 2 ] | 0 ) - ( f[ a + 96 >> 2 ] | 0 ) | 0 ) / 12 | 0 | 0;

		} function pl() {

			var a = 0; a = bj( 16 ) | 0; Uk( a ); return a | 0;

		} function ql() {

			var a = 0; a = bj( 40 ) | 0; Bi( a ); return a | 0;

		} function rl( a, b ) {

			a = a | 0; b = b | 0; return 1;

		} function sl( a, b ) {

			a = a | 0; b = b | 0; return Cl( a, b ) | 0;

		} function tl( a, b ) {

			a = a | 0; b = b | 0; return Dl( a, b ) | 0;

		} function ul( a, b, c, d, e, f ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; f = f | 0; aa( 3 ); return 0;

		} function vl( a, b ) {

			a = a | 0; b = b | 0; return Sl( a, b ) | 0;

		} function wl() {

			var a = 0; a = bj( 12 ) | 0; Kl( a ); return a | 0;

		} function xl( a ) {

			a = a | 0; Yf( a ); dn( a ); return;

		} function yl( a ) {

			a = a | 0; n[ a >> 2 ] = $( 1.0 ); n[ a + 4 >> 2 ] = $( 1.0 ); return;

		} function zl( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return ( a | 0 ) == ( b | 0 ) | 0;

		} function Al( a, b ) {

			a = a | 0; b = b | 0; var c = 0; c = Pl( a | 0 ) | 0; return ( ( b | 0 ) == 0 ? a : c ) | 0;

		} function Bl( a ) {

			a = a | 0; return ( f[ a + 12 >> 2 ] | 0 ) - ( f[ a + 8 >> 2 ] | 0 ) >> 2 | 0;

		} function Cl( a, b ) {

			a = a | 0; b = b | 0; return f[ ( f[ a >> 2 ] | 0 ) + ( b << 2 ) >> 2 ] | 0;

		} function Dl( a, b ) {

			a = a | 0; b = b | 0; return d[ ( f[ a >> 2 ] | 0 ) + ( b << 1 ) >> 1 ] | 0;

		} function El( a, b ) {

			a = a | 0; b = b | 0; f[ a + 4 >> 2 ] = b; return;

		} function Fl( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; return gc( a, b, c, d, 0 ) | 0;

		} function Gl( a ) {

			a = a | 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; f[ a >> 2 ] = a + 4; return;

		} function Hl() {

			var a = 0; a = bj( 84 ) | 0; Yj( a ); return a | 0;

		} function Il( a ) {

			a = a | 0; return ( f[ a + 4 >> 2 ] | 0 ) - ( f[ a >> 2 ] | 0 ) >> 2 | 0;

		} function Jl( a ) {

			a = a | 0; return ( f[ a + 4 >> 2 ] | 0 ) - ( f[ a >> 2 ] | 0 ) >> 1 | 0;

		} function Kl( a ) {

			a = a | 0; f[ a >> 2 ] = 0; f[ a + 4 >> 2 ] = 0; f[ a + 8 >> 2 ] = 0; return;

		} function Ll( a ) {

			a = a | 0; f[ a >> 2 ] = 3684; Ai( a + 4 | 0 ); return;

		} function Ml( a, b ) {

			a = a | 0; b = b | 0; return f[ b + 12 >> 2 ] | 0;

		} function Nl( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; return Oa[ a & 127 ]( b | 0, c | 0 ) | 0;

		} function Ol( a, b, c, d, e, f ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; f = f | 0; aa( 10 );

		} function Pl( a ) {

			a = a | 0; return ( a & 255 ) << 24 | ( a >> 8 & 255 ) << 16 | ( a >> 16 & 255 ) << 8 | a >>> 24 | 0;

		} function Ql( a ) {

			a = a | 0; dl( a ); f[ a >> 2 ] = 2532; return;

		} function Rl( a, c ) {

			a = a | 0; c = c | 0; b[ a >> 0 ] = b[ c >> 0 ] | 0; return;

		} function Sl( a, c ) {

			a = a | 0; c = c | 0; return b[ ( f[ a >> 2 ] | 0 ) + c >> 0 ] | 0;

		} function Tl( a ) {

			a = a | 0; return ( f[ a + 4 >> 2 ] | 0 ) - ( f[ a >> 2 ] | 0 ) | 0;

		} function Ul( a, b ) {

			a = a | 0; b = b | 0; return f[ b + 4 >> 2 ] | 0;

		} function Vl( a ) {

			a = a | 0; return $( n[ a + 20 >> 2 ] );

		} function Wl( a ) {

			a = a | 0; return f[ a + 4 >> 2 ] | 0;

		} function Xl( a ) {

			a = a | 0; if ( ! a ) return; dn( a ); return;

		} function Yl( a, b ) {

			a = a | 0; b = b | 0; if ( ! x ) {

				x = a; y = b;

			}

		} function Zl( a ) {

			a = a | 0; return a + 12 | 0;

		} function _l( a ) {

			a = a | 0; return f[ a + 88 >> 2 ] | 0;

		} function $l( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; Ta[ a & 7 ]( b | 0, c | 0 );

		} function am() {

			var a = 0; a = bj( 40 ) | 0; _i( a ); return a | 0;

		} function bm() {

			var a = 0; a = bj( 108 ) | 0; aj( a ); return a | 0;

		} function cm( a ) {

			a = a | 0; return ( b[ a + 32 >> 0 ] | 0 ) != 0 | 0;

		} function dm( a ) {

			a = a | 0; return a + - 12 | 0;

		} function em( a, b, c, d, e ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; e = e | 0; aa( 9 );

		} function fm() {

			var a = 0; a = f[ 3363 ] | 0; f[ 3363 ] = a + 0; return a | 0;

		} function gm( a ) {

			a = a | 0; return Gm( a + 4 | 0 ) | 0;

		} function hm( a ) {

			a = a | 0; return f[ a + 56 >> 2 ] | 0;

		} function im( a ) {

			a = a | 0; Td( a ); dn( a ); return;

		} function jm( a ) {

			a = a | 0; hn( a ); dn( a ); return;

		} function km( a ) {

			a = a | 0; return b[ a + 24 >> 0 ] | 0;

		} function lm() {

			var a = 0; a = f[ 898 ] | 0; f[ 898 ] = a + 0; return a | 0;

		} function mm( a, b ) {

			a = a | 0; b = b | 0; return 0;

		} function nm( a ) {

			a = a | 0; return f[ a + 40 >> 2 ] | 0;

		} function om( a ) {

			a = a | 0; return f[ a + 48 >> 2 ] | 0;

		} function pm( a, b ) {

			a = a | 0; b = b | 0; return Na[ a & 127 ]( b | 0 ) | 0;

		} function qm( a ) {

			a = a | 0; return f[ a + 60 >> 2 ] | 0;

		} function rm( a ) {

			a = a | 0; return f[ a + 28 >> 2 ] | 0;

		} function sm( a ) {

			a = a | 0; sa( a | 0 ) | 0; vi();

		} function tm( a ) {

			a = a | 0; Ll( a ); dn( a ); return;

		} function um( a ) {

			a = a | 0; Ca();

		} function vm( a, b ) {

			a = a | 0; b = b | 0; u = a; v = b;

		} function wm( a ) {

			a = a | 0; return ( ( a | 0 ) == 32 | ( a + - 9 | 0 ) >>> 0 < 5 ) & 1 | 0;

		} function xm( a ) {

			a = a | 0; return ( f[ a >> 2 ] | 0 ) == 0 | 0;

		} function ym( a ) {

			a = a | 0; return f[ a + 80 >> 2 ] | 0;

		} function zm( a, b, c, d ) {

			a = a | 0; b = b | 0; c = c | 0; d = d | 0; aa( 8 );

		} function Am( a, b ) {

			a = a | 0; b = b | 0; Sa[ a & 127 ]( b | 0 );

		} function Bm( a, b ) {

			a = a | 0; b = b | 0; return Sj( a, b ) | 0;

		} function Cm( a ) {

			a = a | 0; b[ a + 12 >> 0 ] = 0; return;

		} function Dm( a ) {

			a = a | 0; return a & 255 | 0;

		} function Em( a ) {

			a = a | 0; f[ a >> 2 ] = 0; return;

		} function Fm( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; aa( 2 ); return 0;

		} function Gm( a ) {

			a = a | 0; return f[ a >> 2 ] | 0;

		} function Hm( a ) {

			a = a | 0; return 2;

		} function Im( a ) {

			a = a | 0; return 1;

		} function Jm( a, b ) {

			a = + a; b = b | 0; return + ( + wg( a, b ) );

		} function Km() {

			return 3;

		} function Lm( a, b, c ) {

			a = a | 0; b = b | 0; c = c | 0; aa( 7 );

		} function Mm() {

			return - 4;

		} function Nm() {

			return 4;

		} function Om( a ) {

			a = a | 0; return ( a + - 48 | 0 ) >>> 0 < 10 | 0;

		} function Pm() {

			return - 3;

		} function Qm() {

			return 1;

		} function Rm() {

			return 2;

		} function Sm() {

			return - 5;

		} function Tm( a, b ) {

			a = a | 0; b = b | 0; aa( 1 ); return 0;

		} function Um( a ) {

			a = a | 0; Ea();

		} function Vm( a ) {

			a = a | 0; Ra[ a & 3 ]();

		} function Wm() {

			return - 2;

		} function Xm() {

			ua();

		} function Ym() {

			return - 1;

		} function Zm() {

			return on() | 0;

		} function _m( a, b ) {

			a = a | 0; b = b | 0; aa( 6 );

		} function $m() {

			return 0;

		} function an( a ) {

			a = a | 0; return bj( a ) | 0;

		} function bn( a ) {

			a = a | 0; dn( a ); return;

		} function cn( a ) {

			a = a | 0; u = a;

		} function dn( a ) {

			a = a | 0; Cb( a ); return;

		} function en( a ) {

			a = a | 0; I = a;

		} function fn( a ) {

			a = a | 0; return a | 0;

		} function gn( a ) {

			a = a | 0; aa( 0 ); return 0;

		} function hn( a ) {

			a = a | 0; return;

		} function jn( a ) {

			a = a | 0; return 0;

		} function kn() {

			return I | 0;

		} function ln() {

			return 13376;

		} function mn() {

			return u | 0;

		} function nn( a ) {

			a = a | 0; aa( 5 );

		} function on() {

			return 2840;

		} function pn() {

			aa( 4 );

		}

		// EMSCRIPTEN_END_FUNCS
		var Na = [ gn, Hm, Im, jl, rm, Im, Ic, gl, Wl, jn, jn, Im, jn, Im, Im, Ih, Nj, Ih, Xj, Ch, Im, Zj, Mg, Im, rm, Im, Ih, Nj, Ih, Xj, Ch, Im, Zj, Mg, Im, rm, Hm, jn, Wl, Im, jn, Im, Qk, Zj, Ig, Im, rm, Zj, Ig, Im, rm, kd, Im, Im, Kj, Hc, dh, Im, jn, je, bk, gk, ek, hb, Im, Wl, cl, Rd, nd, ae, ib, Im, Wl, cl, kb, pf, jn, Im, dj, gm, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn, gn ]; var Oa = [ Tm, Hh, he, Qb, Nh, $k, mm, rl, wk, rl, Of, Xc, Ve, yh, Gg, Dg, Di, Ab, Pk, mm, me, _b, mm, Xh, Nc, mm, Th, de, ti, _b, mm, Xh, Nc, mm, Th, de, ti, Ke, Pk, mm, Re, mm, Kh, Be, ti, mm, Kh, Be, ti, pk, yd, mm, mm, Ej, Dj, Bj, rk, _e, $e, Bb, Ad, hd, fd, rk, _e, $e, Bb, Nd, zi, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm, Tm ]; var Pa = [ Fm, $j, Yi, zh, wj, Ze, xj, Fd, Sb, Ph, bf, $h, Uh, kf, $h, Sd, wh, Oi, bg, Fm, Fm, Fm, Fm, Fm, Fm, Fm, Fm, Fm, Fm, Fm, Fm, Fm ]; var Qa = [ ul, nc, Eb, db, Dc, Kb, Fb, cb, Bc, Jb, be, Mb, Nb, ul, ul, ul ]; var Ra = [ pn, Xm, uf, Hj ]; var Sa = [ nn, hn, bn, Ei, ri, oh, Um, Yf, xl, Pe, Tk, Hi, Ci, ni, Um, Yh, Yh, zg, ug, nh, eh, Dh, uh, hn, bn, Yh, yg, sg, kh, bh, Bh, ph, hn, bn, Ci, hn, bn, vj, nj, hn, bn, Aj, uj, hn, bn, qh, lh, og, Um, Pf, Lf, Jc, Wj, Og, Jg, cj, Qi, _h, li, gi, fj, Vi, ci, Rg, Lg, Pc, Ij, fg, hn, bn, Um, Zg, Tg, Td, im, hn, jm, hn, hn, jm, Ll, tm, tm, kj, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn, nn ]; var Ta = [ _m, Kg, xd, Qg, Ib, _m, _m, _m ]; var Ua = [ Lm, Fg, vb, yb, yb, vb, ce, Qd ]; var Va = [ zm, Hf, Xd, oi, rh, zm, zm, zm ]; var Wa = [ em, Wf, ie, em ]; var Xa = [ Ol, Zh, fh, Ol ]; return { ___cxa_can_catch: si, ___cxa_is_pointer_type: Fk, ___divdi3: Ug, ___muldi3: gj, ___udivdi3: Fl, ___uremdi3: $i, _bitshift64Lshr: Uj, _bitshift64Shl: Oj, _emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0: Bk, _emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1: ok, _emscripten_bind_AttributeOctahedronTransform___destroy___0: Jk, _emscripten_bind_AttributeOctahedronTransform_quantization_bits_0: Wl, _emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0: Ri, _emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1: ok, _emscripten_bind_AttributeQuantizationTransform___destroy___0: Jk, _emscripten_bind_AttributeQuantizationTransform_min_value_1: Gk, _emscripten_bind_AttributeQuantizationTransform_quantization_bits_0: Wl, _emscripten_bind_AttributeQuantizationTransform_range_0: Vl, _emscripten_bind_AttributeTransformData_AttributeTransformData_0: Ak, _emscripten_bind_AttributeTransformData___destroy___0: Ti, _emscripten_bind_AttributeTransformData_transform_type_0: Gm, _emscripten_bind_DecoderBuffer_DecoderBuffer_0: ql, _emscripten_bind_DecoderBuffer_Init_2: Xk, _emscripten_bind_DecoderBuffer___destroy___0: Xl, _emscripten_bind_Decoder_DecodeBufferToMesh_2: jk, _emscripten_bind_Decoder_DecodeBufferToPointCloud_2: Vj, _emscripten_bind_Decoder_Decoder_0: am, _emscripten_bind_Decoder_GetAttributeByUniqueId_2: sk, _emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3: jj, _emscripten_bind_Decoder_GetAttributeFloat_3: Lj, _emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3: Gj, _emscripten_bind_Decoder_GetAttributeIdByName_2: yk, _emscripten_bind_Decoder_GetAttributeId_2: ak, _emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3: mj, _emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3: rj, _emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3: qj, _emscripten_bind_Decoder_GetAttributeIntForAllPoints_3: rj, _emscripten_bind_Decoder_GetAttributeMetadata_2: qk, _emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3: ij, _emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3: hj, _emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3: lj, _emscripten_bind_Decoder_GetAttribute_2: Nk, _emscripten_bind_Decoder_GetEncodedGeometryType_1: Hk, _emscripten_bind_Decoder_GetFaceFromMesh_3: _j, _emscripten_bind_Decoder_GetMetadata_1: fl, _emscripten_bind_Decoder_GetTriangleStripsFromMesh_2: ck, _emscripten_bind_Decoder_SkipAttributeTransform_1: Ek, _emscripten_bind_Decoder___destroy___0: Ng, _emscripten_bind_DracoFloat32Array_DracoFloat32Array_0: wl, _emscripten_bind_DracoFloat32Array_GetValue_1: bl, _emscripten_bind_DracoFloat32Array___destroy___0: xi, _emscripten_bind_DracoFloat32Array_size_0: Il, _emscripten_bind_DracoInt16Array_DracoInt16Array_0: wl, _emscripten_bind_DracoInt16Array_GetValue_1: tl, _emscripten_bind_DracoInt16Array___destroy___0: yi, _emscripten_bind_DracoInt16Array_size_0: Jl, _emscripten_bind_DracoInt32Array_DracoInt32Array_0: wl, _emscripten_bind_DracoInt32Array_GetValue_1: sl, _emscripten_bind_DracoInt32Array___destroy___0: xi, _emscripten_bind_DracoInt32Array_size_0: Il, _emscripten_bind_DracoInt8Array_DracoInt8Array_0: wl, _emscripten_bind_DracoInt8Array_GetValue_1: vl, _emscripten_bind_DracoInt8Array___destroy___0: Zi, _emscripten_bind_DracoInt8Array_size_0: Tl, _emscripten_bind_DracoUInt16Array_DracoUInt16Array_0: wl, _emscripten_bind_DracoUInt16Array_GetValue_1: tl, _emscripten_bind_DracoUInt16Array___destroy___0: yi, _emscripten_bind_DracoUInt16Array_size_0: Jl, _emscripten_bind_DracoUInt32Array_DracoUInt32Array_0: wl, _emscripten_bind_DracoUInt32Array_GetValue_1: sl, _emscripten_bind_DracoUInt32Array___destroy___0: xi, _emscripten_bind_DracoUInt32Array_size_0: Il, _emscripten_bind_DracoUInt8Array_DracoUInt8Array_0: wl, _emscripten_bind_DracoUInt8Array_GetValue_1: vl, _emscripten_bind_DracoUInt8Array___destroy___0: Zi, _emscripten_bind_DracoUInt8Array_size_0: Tl, _emscripten_bind_GeometryAttribute_GeometryAttribute_0: al, _emscripten_bind_GeometryAttribute___destroy___0: Xl, _emscripten_bind_Mesh_Mesh_0: bm, _emscripten_bind_Mesh___destroy___0: Jk, _emscripten_bind_Mesh_num_attributes_0: Bl, _emscripten_bind_Mesh_num_faces_0: ol, _emscripten_bind_Mesh_num_points_0: ym, _emscripten_bind_MetadataQuerier_GetDoubleEntry_2: nk, _emscripten_bind_MetadataQuerier_GetEntryName_2: xk, _emscripten_bind_MetadataQuerier_GetIntEntry_2: uk, _emscripten_bind_MetadataQuerier_GetStringEntry_2: mk, _emscripten_bind_MetadataQuerier_HasDoubleEntry_2: lk, _emscripten_bind_MetadataQuerier_HasEntry_2: Ck, _emscripten_bind_MetadataQuerier_HasIntEntry_2: tk, _emscripten_bind_MetadataQuerier_HasStringEntry_2: kk, _emscripten_bind_MetadataQuerier_MetadataQuerier_0: pl, _emscripten_bind_MetadataQuerier_NumEntries_1: Sk, _emscripten_bind_MetadataQuerier___destroy___0: Pg, _emscripten_bind_Metadata_Metadata_0: fi, _emscripten_bind_Metadata___destroy___0: el, _emscripten_bind_PointAttribute_GetAttributeTransformData_0: _l, _emscripten_bind_PointAttribute_PointAttribute_0: ll, _emscripten_bind_PointAttribute___destroy___0: ig, _emscripten_bind_PointAttribute_attribute_type_0: hm, _emscripten_bind_PointAttribute_byte_offset_0: om, _emscripten_bind_PointAttribute_byte_stride_0: nm, _emscripten_bind_PointAttribute_data_type_0: rm, _emscripten_bind_PointAttribute_normalized_0: cm, _emscripten_bind_PointAttribute_num_components_0: km, _emscripten_bind_PointAttribute_size_0: ym, _emscripten_bind_PointAttribute_unique_id_0: qm, _emscripten_bind_PointCloud_PointCloud_0: Hl, _emscripten_bind_PointCloud___destroy___0: Jk, _emscripten_bind_PointCloud_num_attributes_0: Bl, _emscripten_bind_PointCloud_num_points_0: ym, _emscripten_bind_Status___destroy___0: Pj, _emscripten_bind_Status_code_0: Gm, _emscripten_bind_Status_error_msg_0: Fj, _emscripten_bind_Status_ok_0: xm, _emscripten_bind_VoidPtr___destroy___0: Xl, _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM: Ym, _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM: $m, _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM: Rm, _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM: Qm, _emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE: Ym, _emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD: $m, _emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH: Qm, _emscripten_enum_draco_GeometryAttribute_Type_COLOR: Rm, _emscripten_enum_draco_GeometryAttribute_Type_GENERIC: Nm, _emscripten_enum_draco_GeometryAttribute_Type_INVALID: Ym, _emscripten_enum_draco_GeometryAttribute_Type_NORMAL: Qm, _emscripten_enum_draco_GeometryAttribute_Type_POSITION: $m, _emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD: Km, _emscripten_enum_draco_StatusCode_ERROR: Ym, _emscripten_enum_draco_StatusCode_INVALID_PARAMETER: Pm, _emscripten_enum_draco_StatusCode_IO_ERROR: Wm, _emscripten_enum_draco_StatusCode_OK: $m, _emscripten_enum_draco_StatusCode_UNKNOWN_VERSION: Sm, _emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION: Mm, _emscripten_replace_memory: Ma, _free: Cb, _i64Add: Rj, _i64Subtract: Tj, _llvm_bswap_i32: Pl, _malloc: Ya, _memcpy: ge, _memmove: qi, _memset: Vf, _sbrk: Vh, dynCall_ii: pm, dynCall_iii: Nl, dynCall_iiii: Wk, dynCall_iiiiiii: yj, dynCall_v: Vm, dynCall_vi: Am, dynCall_vii: $l, dynCall_viii: kl, dynCall_viiii: Lk, dynCall_viiiii: hk, dynCall_viiiiii: Jj, establishStackSpace: vm, getTempRet0: kn, runPostSets: Qj, setTempRet0: en, setThrew: Yl, stackAlloc: ml, stackRestore: cn, stackSave: mn };

	} )


	// EMSCRIPTEN_END_ASM
	( Module.asmGlobalArg, Module.asmLibraryArg, buffer ); var ___cxa_can_catch = Module[ "___cxa_can_catch" ] = asm[ "___cxa_can_catch" ]; var ___cxa_is_pointer_type = Module[ "___cxa_is_pointer_type" ] = asm[ "___cxa_is_pointer_type" ]; var ___divdi3 = Module[ "___divdi3" ] = asm[ "___divdi3" ]; var ___muldi3 = Module[ "___muldi3" ] = asm[ "___muldi3" ]; var ___udivdi3 = Module[ "___udivdi3" ] = asm[ "___udivdi3" ]; var ___uremdi3 = Module[ "___uremdi3" ] = asm[ "___uremdi3" ]; var _bitshift64Lshr = Module[ "_bitshift64Lshr" ] = asm[ "_bitshift64Lshr" ]; var _bitshift64Shl = Module[ "_bitshift64Shl" ] = asm[ "_bitshift64Shl" ]; var _emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0 = Module[ "_emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0" ] = asm[ "_emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0" ]; var _emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1 = Module[ "_emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1" ] = asm[ "_emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1" ]; var _emscripten_bind_AttributeOctahedronTransform___destroy___0 = Module[ "_emscripten_bind_AttributeOctahedronTransform___destroy___0" ] = asm[ "_emscripten_bind_AttributeOctahedronTransform___destroy___0" ]; var _emscripten_bind_AttributeOctahedronTransform_quantization_bits_0 = Module[ "_emscripten_bind_AttributeOctahedronTransform_quantization_bits_0" ] = asm[ "_emscripten_bind_AttributeOctahedronTransform_quantization_bits_0" ]; var _emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0 = Module[ "_emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0" ] = asm[ "_emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0" ]; var _emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1 = Module[ "_emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1" ] = asm[ "_emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1" ]; var _emscripten_bind_AttributeQuantizationTransform___destroy___0 = Module[ "_emscripten_bind_AttributeQuantizationTransform___destroy___0" ] = asm[ "_emscripten_bind_AttributeQuantizationTransform___destroy___0" ]; var _emscripten_bind_AttributeQuantizationTransform_min_value_1 = Module[ "_emscripten_bind_AttributeQuantizationTransform_min_value_1" ] = asm[ "_emscripten_bind_AttributeQuantizationTransform_min_value_1" ]; var _emscripten_bind_AttributeQuantizationTransform_quantization_bits_0 = Module[ "_emscripten_bind_AttributeQuantizationTransform_quantization_bits_0" ] = asm[ "_emscripten_bind_AttributeQuantizationTransform_quantization_bits_0" ]; var _emscripten_bind_AttributeQuantizationTransform_range_0 = Module[ "_emscripten_bind_AttributeQuantizationTransform_range_0" ] = asm[ "_emscripten_bind_AttributeQuantizationTransform_range_0" ]; var _emscripten_bind_AttributeTransformData_AttributeTransformData_0 = Module[ "_emscripten_bind_AttributeTransformData_AttributeTransformData_0" ] = asm[ "_emscripten_bind_AttributeTransformData_AttributeTransformData_0" ]; var _emscripten_bind_AttributeTransformData___destroy___0 = Module[ "_emscripten_bind_AttributeTransformData___destroy___0" ] = asm[ "_emscripten_bind_AttributeTransformData___destroy___0" ]; var _emscripten_bind_AttributeTransformData_transform_type_0 = Module[ "_emscripten_bind_AttributeTransformData_transform_type_0" ] = asm[ "_emscripten_bind_AttributeTransformData_transform_type_0" ]; var _emscripten_bind_DecoderBuffer_DecoderBuffer_0 = Module[ "_emscripten_bind_DecoderBuffer_DecoderBuffer_0" ] = asm[ "_emscripten_bind_DecoderBuffer_DecoderBuffer_0" ]; var _emscripten_bind_DecoderBuffer_Init_2 = Module[ "_emscripten_bind_DecoderBuffer_Init_2" ] = asm[ "_emscripten_bind_DecoderBuffer_Init_2" ]; var _emscripten_bind_DecoderBuffer___destroy___0 = Module[ "_emscripten_bind_DecoderBuffer___destroy___0" ] = asm[ "_emscripten_bind_DecoderBuffer___destroy___0" ]; var _emscripten_bind_Decoder_DecodeBufferToMesh_2 = Module[ "_emscripten_bind_Decoder_DecodeBufferToMesh_2" ] = asm[ "_emscripten_bind_Decoder_DecodeBufferToMesh_2" ]; var _emscripten_bind_Decoder_DecodeBufferToPointCloud_2 = Module[ "_emscripten_bind_Decoder_DecodeBufferToPointCloud_2" ] = asm[ "_emscripten_bind_Decoder_DecodeBufferToPointCloud_2" ]; var _emscripten_bind_Decoder_Decoder_0 = Module[ "_emscripten_bind_Decoder_Decoder_0" ] = asm[ "_emscripten_bind_Decoder_Decoder_0" ]; var _emscripten_bind_Decoder_GetAttributeByUniqueId_2 = Module[ "_emscripten_bind_Decoder_GetAttributeByUniqueId_2" ] = asm[ "_emscripten_bind_Decoder_GetAttributeByUniqueId_2" ]; var _emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttributeFloat_3 = Module[ "_emscripten_bind_Decoder_GetAttributeFloat_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeFloat_3" ]; var _emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3 = Module[ "_emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3" ]; var _emscripten_bind_Decoder_GetAttributeIdByName_2 = Module[ "_emscripten_bind_Decoder_GetAttributeIdByName_2" ] = asm[ "_emscripten_bind_Decoder_GetAttributeIdByName_2" ]; var _emscripten_bind_Decoder_GetAttributeId_2 = Module[ "_emscripten_bind_Decoder_GetAttributeId_2" ] = asm[ "_emscripten_bind_Decoder_GetAttributeId_2" ]; var _emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttributeIntForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeIntForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeIntForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttributeMetadata_2 = Module[ "_emscripten_bind_Decoder_GetAttributeMetadata_2" ] = asm[ "_emscripten_bind_Decoder_GetAttributeMetadata_2" ]; var _emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3 = Module[ "_emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3" ] = asm[ "_emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3" ]; var _emscripten_bind_Decoder_GetAttribute_2 = Module[ "_emscripten_bind_Decoder_GetAttribute_2" ] = asm[ "_emscripten_bind_Decoder_GetAttribute_2" ]; var _emscripten_bind_Decoder_GetEncodedGeometryType_1 = Module[ "_emscripten_bind_Decoder_GetEncodedGeometryType_1" ] = asm[ "_emscripten_bind_Decoder_GetEncodedGeometryType_1" ]; var _emscripten_bind_Decoder_GetFaceFromMesh_3 = Module[ "_emscripten_bind_Decoder_GetFaceFromMesh_3" ] = asm[ "_emscripten_bind_Decoder_GetFaceFromMesh_3" ]; var _emscripten_bind_Decoder_GetMetadata_1 = Module[ "_emscripten_bind_Decoder_GetMetadata_1" ] = asm[ "_emscripten_bind_Decoder_GetMetadata_1" ]; var _emscripten_bind_Decoder_GetTriangleStripsFromMesh_2 = Module[ "_emscripten_bind_Decoder_GetTriangleStripsFromMesh_2" ] = asm[ "_emscripten_bind_Decoder_GetTriangleStripsFromMesh_2" ]; var _emscripten_bind_Decoder_SkipAttributeTransform_1 = Module[ "_emscripten_bind_Decoder_SkipAttributeTransform_1" ] = asm[ "_emscripten_bind_Decoder_SkipAttributeTransform_1" ]; var _emscripten_bind_Decoder___destroy___0 = Module[ "_emscripten_bind_Decoder___destroy___0" ] = asm[ "_emscripten_bind_Decoder___destroy___0" ]; var _emscripten_bind_DracoFloat32Array_DracoFloat32Array_0 = Module[ "_emscripten_bind_DracoFloat32Array_DracoFloat32Array_0" ] = asm[ "_emscripten_bind_DracoFloat32Array_DracoFloat32Array_0" ]; var _emscripten_bind_DracoFloat32Array_GetValue_1 = Module[ "_emscripten_bind_DracoFloat32Array_GetValue_1" ] = asm[ "_emscripten_bind_DracoFloat32Array_GetValue_1" ]; var _emscripten_bind_DracoFloat32Array___destroy___0 = Module[ "_emscripten_bind_DracoFloat32Array___destroy___0" ] = asm[ "_emscripten_bind_DracoFloat32Array___destroy___0" ]; var _emscripten_bind_DracoFloat32Array_size_0 = Module[ "_emscripten_bind_DracoFloat32Array_size_0" ] = asm[ "_emscripten_bind_DracoFloat32Array_size_0" ]; var _emscripten_bind_DracoInt16Array_DracoInt16Array_0 = Module[ "_emscripten_bind_DracoInt16Array_DracoInt16Array_0" ] = asm[ "_emscripten_bind_DracoInt16Array_DracoInt16Array_0" ]; var _emscripten_bind_DracoInt16Array_GetValue_1 = Module[ "_emscripten_bind_DracoInt16Array_GetValue_1" ] = asm[ "_emscripten_bind_DracoInt16Array_GetValue_1" ]; var _emscripten_bind_DracoInt16Array___destroy___0 = Module[ "_emscripten_bind_DracoInt16Array___destroy___0" ] = asm[ "_emscripten_bind_DracoInt16Array___destroy___0" ]; var _emscripten_bind_DracoInt16Array_size_0 = Module[ "_emscripten_bind_DracoInt16Array_size_0" ] = asm[ "_emscripten_bind_DracoInt16Array_size_0" ]; var _emscripten_bind_DracoInt32Array_DracoInt32Array_0 = Module[ "_emscripten_bind_DracoInt32Array_DracoInt32Array_0" ] = asm[ "_emscripten_bind_DracoInt32Array_DracoInt32Array_0" ]; var _emscripten_bind_DracoInt32Array_GetValue_1 = Module[ "_emscripten_bind_DracoInt32Array_GetValue_1" ] = asm[ "_emscripten_bind_DracoInt32Array_GetValue_1" ]; var _emscripten_bind_DracoInt32Array___destroy___0 = Module[ "_emscripten_bind_DracoInt32Array___destroy___0" ] = asm[ "_emscripten_bind_DracoInt32Array___destroy___0" ]; var _emscripten_bind_DracoInt32Array_size_0 = Module[ "_emscripten_bind_DracoInt32Array_size_0" ] = asm[ "_emscripten_bind_DracoInt32Array_size_0" ]; var _emscripten_bind_DracoInt8Array_DracoInt8Array_0 = Module[ "_emscripten_bind_DracoInt8Array_DracoInt8Array_0" ] = asm[ "_emscripten_bind_DracoInt8Array_DracoInt8Array_0" ]; var _emscripten_bind_DracoInt8Array_GetValue_1 = Module[ "_emscripten_bind_DracoInt8Array_GetValue_1" ] = asm[ "_emscripten_bind_DracoInt8Array_GetValue_1" ]; var _emscripten_bind_DracoInt8Array___destroy___0 = Module[ "_emscripten_bind_DracoInt8Array___destroy___0" ] = asm[ "_emscripten_bind_DracoInt8Array___destroy___0" ]; var _emscripten_bind_DracoInt8Array_size_0 = Module[ "_emscripten_bind_DracoInt8Array_size_0" ] = asm[ "_emscripten_bind_DracoInt8Array_size_0" ]; var _emscripten_bind_DracoUInt16Array_DracoUInt16Array_0 = Module[ "_emscripten_bind_DracoUInt16Array_DracoUInt16Array_0" ] = asm[ "_emscripten_bind_DracoUInt16Array_DracoUInt16Array_0" ]; var _emscripten_bind_DracoUInt16Array_GetValue_1 = Module[ "_emscripten_bind_DracoUInt16Array_GetValue_1" ] = asm[ "_emscripten_bind_DracoUInt16Array_GetValue_1" ]; var _emscripten_bind_DracoUInt16Array___destroy___0 = Module[ "_emscripten_bind_DracoUInt16Array___destroy___0" ] = asm[ "_emscripten_bind_DracoUInt16Array___destroy___0" ]; var _emscripten_bind_DracoUInt16Array_size_0 = Module[ "_emscripten_bind_DracoUInt16Array_size_0" ] = asm[ "_emscripten_bind_DracoUInt16Array_size_0" ]; var _emscripten_bind_DracoUInt32Array_DracoUInt32Array_0 = Module[ "_emscripten_bind_DracoUInt32Array_DracoUInt32Array_0" ] = asm[ "_emscripten_bind_DracoUInt32Array_DracoUInt32Array_0" ]; var _emscripten_bind_DracoUInt32Array_GetValue_1 = Module[ "_emscripten_bind_DracoUInt32Array_GetValue_1" ] = asm[ "_emscripten_bind_DracoUInt32Array_GetValue_1" ]; var _emscripten_bind_DracoUInt32Array___destroy___0 = Module[ "_emscripten_bind_DracoUInt32Array___destroy___0" ] = asm[ "_emscripten_bind_DracoUInt32Array___destroy___0" ]; var _emscripten_bind_DracoUInt32Array_size_0 = Module[ "_emscripten_bind_DracoUInt32Array_size_0" ] = asm[ "_emscripten_bind_DracoUInt32Array_size_0" ]; var _emscripten_bind_DracoUInt8Array_DracoUInt8Array_0 = Module[ "_emscripten_bind_DracoUInt8Array_DracoUInt8Array_0" ] = asm[ "_emscripten_bind_DracoUInt8Array_DracoUInt8Array_0" ]; var _emscripten_bind_DracoUInt8Array_GetValue_1 = Module[ "_emscripten_bind_DracoUInt8Array_GetValue_1" ] = asm[ "_emscripten_bind_DracoUInt8Array_GetValue_1" ]; var _emscripten_bind_DracoUInt8Array___destroy___0 = Module[ "_emscripten_bind_DracoUInt8Array___destroy___0" ] = asm[ "_emscripten_bind_DracoUInt8Array___destroy___0" ]; var _emscripten_bind_DracoUInt8Array_size_0 = Module[ "_emscripten_bind_DracoUInt8Array_size_0" ] = asm[ "_emscripten_bind_DracoUInt8Array_size_0" ]; var _emscripten_bind_GeometryAttribute_GeometryAttribute_0 = Module[ "_emscripten_bind_GeometryAttribute_GeometryAttribute_0" ] = asm[ "_emscripten_bind_GeometryAttribute_GeometryAttribute_0" ]; var _emscripten_bind_GeometryAttribute___destroy___0 = Module[ "_emscripten_bind_GeometryAttribute___destroy___0" ] = asm[ "_emscripten_bind_GeometryAttribute___destroy___0" ]; var _emscripten_bind_Mesh_Mesh_0 = Module[ "_emscripten_bind_Mesh_Mesh_0" ] = asm[ "_emscripten_bind_Mesh_Mesh_0" ]; var _emscripten_bind_Mesh___destroy___0 = Module[ "_emscripten_bind_Mesh___destroy___0" ] = asm[ "_emscripten_bind_Mesh___destroy___0" ]; var _emscripten_bind_Mesh_num_attributes_0 = Module[ "_emscripten_bind_Mesh_num_attributes_0" ] = asm[ "_emscripten_bind_Mesh_num_attributes_0" ]; var _emscripten_bind_Mesh_num_faces_0 = Module[ "_emscripten_bind_Mesh_num_faces_0" ] = asm[ "_emscripten_bind_Mesh_num_faces_0" ]; var _emscripten_bind_Mesh_num_points_0 = Module[ "_emscripten_bind_Mesh_num_points_0" ] = asm[ "_emscripten_bind_Mesh_num_points_0" ]; var _emscripten_bind_MetadataQuerier_GetDoubleEntry_2 = Module[ "_emscripten_bind_MetadataQuerier_GetDoubleEntry_2" ] = asm[ "_emscripten_bind_MetadataQuerier_GetDoubleEntry_2" ]; var _emscripten_bind_MetadataQuerier_GetEntryName_2 = Module[ "_emscripten_bind_MetadataQuerier_GetEntryName_2" ] = asm[ "_emscripten_bind_MetadataQuerier_GetEntryName_2" ]; var _emscripten_bind_MetadataQuerier_GetIntEntry_2 = Module[ "_emscripten_bind_MetadataQuerier_GetIntEntry_2" ] = asm[ "_emscripten_bind_MetadataQuerier_GetIntEntry_2" ]; var _emscripten_bind_MetadataQuerier_GetStringEntry_2 = Module[ "_emscripten_bind_MetadataQuerier_GetStringEntry_2" ] = asm[ "_emscripten_bind_MetadataQuerier_GetStringEntry_2" ]; var _emscripten_bind_MetadataQuerier_HasDoubleEntry_2 = Module[ "_emscripten_bind_MetadataQuerier_HasDoubleEntry_2" ] = asm[ "_emscripten_bind_MetadataQuerier_HasDoubleEntry_2" ]; var _emscripten_bind_MetadataQuerier_HasEntry_2 = Module[ "_emscripten_bind_MetadataQuerier_HasEntry_2" ] = asm[ "_emscripten_bind_MetadataQuerier_HasEntry_2" ]; var _emscripten_bind_MetadataQuerier_HasIntEntry_2 = Module[ "_emscripten_bind_MetadataQuerier_HasIntEntry_2" ] = asm[ "_emscripten_bind_MetadataQuerier_HasIntEntry_2" ]; var _emscripten_bind_MetadataQuerier_HasStringEntry_2 = Module[ "_emscripten_bind_MetadataQuerier_HasStringEntry_2" ] = asm[ "_emscripten_bind_MetadataQuerier_HasStringEntry_2" ]; var _emscripten_bind_MetadataQuerier_MetadataQuerier_0 = Module[ "_emscripten_bind_MetadataQuerier_MetadataQuerier_0" ] = asm[ "_emscripten_bind_MetadataQuerier_MetadataQuerier_0" ]; var _emscripten_bind_MetadataQuerier_NumEntries_1 = Module[ "_emscripten_bind_MetadataQuerier_NumEntries_1" ] = asm[ "_emscripten_bind_MetadataQuerier_NumEntries_1" ]; var _emscripten_bind_MetadataQuerier___destroy___0 = Module[ "_emscripten_bind_MetadataQuerier___destroy___0" ] = asm[ "_emscripten_bind_MetadataQuerier___destroy___0" ]; var _emscripten_bind_Metadata_Metadata_0 = Module[ "_emscripten_bind_Metadata_Metadata_0" ] = asm[ "_emscripten_bind_Metadata_Metadata_0" ]; var _emscripten_bind_Metadata___destroy___0 = Module[ "_emscripten_bind_Metadata___destroy___0" ] = asm[ "_emscripten_bind_Metadata___destroy___0" ]; var _emscripten_bind_PointAttribute_GetAttributeTransformData_0 = Module[ "_emscripten_bind_PointAttribute_GetAttributeTransformData_0" ] = asm[ "_emscripten_bind_PointAttribute_GetAttributeTransformData_0" ]; var _emscripten_bind_PointAttribute_PointAttribute_0 = Module[ "_emscripten_bind_PointAttribute_PointAttribute_0" ] = asm[ "_emscripten_bind_PointAttribute_PointAttribute_0" ]; var _emscripten_bind_PointAttribute___destroy___0 = Module[ "_emscripten_bind_PointAttribute___destroy___0" ] = asm[ "_emscripten_bind_PointAttribute___destroy___0" ]; var _emscripten_bind_PointAttribute_attribute_type_0 = Module[ "_emscripten_bind_PointAttribute_attribute_type_0" ] = asm[ "_emscripten_bind_PointAttribute_attribute_type_0" ]; var _emscripten_bind_PointAttribute_byte_offset_0 = Module[ "_emscripten_bind_PointAttribute_byte_offset_0" ] = asm[ "_emscripten_bind_PointAttribute_byte_offset_0" ]; var _emscripten_bind_PointAttribute_byte_stride_0 = Module[ "_emscripten_bind_PointAttribute_byte_stride_0" ] = asm[ "_emscripten_bind_PointAttribute_byte_stride_0" ]; var _emscripten_bind_PointAttribute_data_type_0 = Module[ "_emscripten_bind_PointAttribute_data_type_0" ] = asm[ "_emscripten_bind_PointAttribute_data_type_0" ]; var _emscripten_bind_PointAttribute_normalized_0 = Module[ "_emscripten_bind_PointAttribute_normalized_0" ] = asm[ "_emscripten_bind_PointAttribute_normalized_0" ]; var _emscripten_bind_PointAttribute_num_components_0 = Module[ "_emscripten_bind_PointAttribute_num_components_0" ] = asm[ "_emscripten_bind_PointAttribute_num_components_0" ]; var _emscripten_bind_PointAttribute_size_0 = Module[ "_emscripten_bind_PointAttribute_size_0" ] = asm[ "_emscripten_bind_PointAttribute_size_0" ]; var _emscripten_bind_PointAttribute_unique_id_0 = Module[ "_emscripten_bind_PointAttribute_unique_id_0" ] = asm[ "_emscripten_bind_PointAttribute_unique_id_0" ]; var _emscripten_bind_PointCloud_PointCloud_0 = Module[ "_emscripten_bind_PointCloud_PointCloud_0" ] = asm[ "_emscripten_bind_PointCloud_PointCloud_0" ]; var _emscripten_bind_PointCloud___destroy___0 = Module[ "_emscripten_bind_PointCloud___destroy___0" ] = asm[ "_emscripten_bind_PointCloud___destroy___0" ]; var _emscripten_bind_PointCloud_num_attributes_0 = Module[ "_emscripten_bind_PointCloud_num_attributes_0" ] = asm[ "_emscripten_bind_PointCloud_num_attributes_0" ]; var _emscripten_bind_PointCloud_num_points_0 = Module[ "_emscripten_bind_PointCloud_num_points_0" ] = asm[ "_emscripten_bind_PointCloud_num_points_0" ]; var _emscripten_bind_Status___destroy___0 = Module[ "_emscripten_bind_Status___destroy___0" ] = asm[ "_emscripten_bind_Status___destroy___0" ]; var _emscripten_bind_Status_code_0 = Module[ "_emscripten_bind_Status_code_0" ] = asm[ "_emscripten_bind_Status_code_0" ]; var _emscripten_bind_Status_error_msg_0 = Module[ "_emscripten_bind_Status_error_msg_0" ] = asm[ "_emscripten_bind_Status_error_msg_0" ]; var _emscripten_bind_Status_ok_0 = Module[ "_emscripten_bind_Status_ok_0" ] = asm[ "_emscripten_bind_Status_ok_0" ]; var _emscripten_bind_VoidPtr___destroy___0 = Module[ "_emscripten_bind_VoidPtr___destroy___0" ] = asm[ "_emscripten_bind_VoidPtr___destroy___0" ]; var _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM = Module[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM" ] = asm[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM" ]; var _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM = Module[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM" ] = asm[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM" ]; var _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM = Module[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM" ] = asm[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM" ]; var _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM = Module[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM" ] = asm[ "_emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM" ]; var _emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE = Module[ "_emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE" ] = asm[ "_emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE" ]; var _emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD = Module[ "_emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD" ] = asm[ "_emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD" ]; var _emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH = Module[ "_emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH" ] = asm[ "_emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH" ]; var _emscripten_enum_draco_GeometryAttribute_Type_COLOR = Module[ "_emscripten_enum_draco_GeometryAttribute_Type_COLOR" ] = asm[ "_emscripten_enum_draco_GeometryAttribute_Type_COLOR" ]; var _emscripten_enum_draco_GeometryAttribute_Type_GENERIC = Module[ "_emscripten_enum_draco_GeometryAttribute_Type_GENERIC" ] = asm[ "_emscripten_enum_draco_GeometryAttribute_Type_GENERIC" ]; var _emscripten_enum_draco_GeometryAttribute_Type_INVALID = Module[ "_emscripten_enum_draco_GeometryAttribute_Type_INVALID" ] = asm[ "_emscripten_enum_draco_GeometryAttribute_Type_INVALID" ]; var _emscripten_enum_draco_GeometryAttribute_Type_NORMAL = Module[ "_emscripten_enum_draco_GeometryAttribute_Type_NORMAL" ] = asm[ "_emscripten_enum_draco_GeometryAttribute_Type_NORMAL" ]; var _emscripten_enum_draco_GeometryAttribute_Type_POSITION = Module[ "_emscripten_enum_draco_GeometryAttribute_Type_POSITION" ] = asm[ "_emscripten_enum_draco_GeometryAttribute_Type_POSITION" ]; var _emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD = Module[ "_emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD" ] = asm[ "_emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD" ]; var _emscripten_enum_draco_StatusCode_ERROR = Module[ "_emscripten_enum_draco_StatusCode_ERROR" ] = asm[ "_emscripten_enum_draco_StatusCode_ERROR" ]; var _emscripten_enum_draco_StatusCode_INVALID_PARAMETER = Module[ "_emscripten_enum_draco_StatusCode_INVALID_PARAMETER" ] = asm[ "_emscripten_enum_draco_StatusCode_INVALID_PARAMETER" ]; var _emscripten_enum_draco_StatusCode_IO_ERROR = Module[ "_emscripten_enum_draco_StatusCode_IO_ERROR" ] = asm[ "_emscripten_enum_draco_StatusCode_IO_ERROR" ]; var _emscripten_enum_draco_StatusCode_OK = Module[ "_emscripten_enum_draco_StatusCode_OK" ] = asm[ "_emscripten_enum_draco_StatusCode_OK" ]; var _emscripten_enum_draco_StatusCode_UNKNOWN_VERSION = Module[ "_emscripten_enum_draco_StatusCode_UNKNOWN_VERSION" ] = asm[ "_emscripten_enum_draco_StatusCode_UNKNOWN_VERSION" ]; var _emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION = Module[ "_emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION" ] = asm[ "_emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION" ]; var _emscripten_replace_memory = Module[ "_emscripten_replace_memory" ] = asm[ "_emscripten_replace_memory" ]; var _free = Module[ "_free" ] = asm[ "_free" ]; var _i64Add = Module[ "_i64Add" ] = asm[ "_i64Add" ]; var _i64Subtract = Module[ "_i64Subtract" ] = asm[ "_i64Subtract" ]; var _llvm_bswap_i32 = Module[ "_llvm_bswap_i32" ] = asm[ "_llvm_bswap_i32" ]; var _malloc = Module[ "_malloc" ] = asm[ "_malloc" ]; var _memcpy = Module[ "_memcpy" ] = asm[ "_memcpy" ]; var _memmove = Module[ "_memmove" ] = asm[ "_memmove" ]; var _memset = Module[ "_memset" ] = asm[ "_memset" ]; var _sbrk = Module[ "_sbrk" ] = asm[ "_sbrk" ]; var establishStackSpace = Module[ "establishStackSpace" ] = asm[ "establishStackSpace" ]; var getTempRet0 = Module[ "getTempRet0" ] = asm[ "getTempRet0" ]; var runPostSets = Module[ "runPostSets" ] = asm[ "runPostSets" ]; var setTempRet0 = Module[ "setTempRet0" ] = asm[ "setTempRet0" ]; var setThrew = Module[ "setThrew" ] = asm[ "setThrew" ]; var stackAlloc = Module[ "stackAlloc" ] = asm[ "stackAlloc" ]; var stackRestore = Module[ "stackRestore" ] = asm[ "stackRestore" ]; var stackSave = Module[ "stackSave" ] = asm[ "stackSave" ]; var dynCall_ii = Module[ "dynCall_ii" ] = asm[ "dynCall_ii" ]; var dynCall_iii = Module[ "dynCall_iii" ] = asm[ "dynCall_iii" ]; var dynCall_iiii = Module[ "dynCall_iiii" ] = asm[ "dynCall_iiii" ]; var dynCall_iiiiiii = Module[ "dynCall_iiiiiii" ] = asm[ "dynCall_iiiiiii" ]; var dynCall_v = Module[ "dynCall_v" ] = asm[ "dynCall_v" ]; var dynCall_vi = Module[ "dynCall_vi" ] = asm[ "dynCall_vi" ]; var dynCall_vii = Module[ "dynCall_vii" ] = asm[ "dynCall_vii" ]; var dynCall_viii = Module[ "dynCall_viii" ] = asm[ "dynCall_viii" ]; var dynCall_viiii = Module[ "dynCall_viiii" ] = asm[ "dynCall_viiii" ]; var dynCall_viiiii = Module[ "dynCall_viiiii" ] = asm[ "dynCall_viiiii" ]; var dynCall_viiiiii = Module[ "dynCall_viiiiii" ] = asm[ "dynCall_viiiiii" ]; Module[ "asm" ] = asm; if ( memoryInitializer ) {

		if ( ! isDataURI( memoryInitializer ) ) {

			if ( typeof Module[ "locateFile" ] === "function" ) {

				memoryInitializer = Module[ "locateFile" ]( memoryInitializer );

			} else if ( Module[ "memoryInitializerPrefixURL" ] ) {

				memoryInitializer = Module[ "memoryInitializerPrefixURL" ] + memoryInitializer;

			}

		} if ( ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL ) {

			var data = Module[ "readBinary" ]( memoryInitializer ); HEAPU8.set( data, GLOBAL_BASE );

		} else {

			addRunDependency( "memory initializer" ); var applyMemoryInitializer = ( function ( data ) {

				if ( data.byteLength )data = new Uint8Array( data ); HEAPU8.set( data, GLOBAL_BASE ); if ( Module[ "memoryInitializerRequest" ] ) delete Module[ "memoryInitializerRequest" ].response; removeRunDependency( "memory initializer" );

			} ); function doBrowserLoad() {

				Module[ "readAsync" ]( memoryInitializer, applyMemoryInitializer, ( function () {

					throw "could not load memory initializer " + memoryInitializer;

				} ) );

			} var memoryInitializerBytes = tryParseAsDataURI( memoryInitializer ); if ( memoryInitializerBytes ) {

				applyMemoryInitializer( memoryInitializerBytes.buffer );

			} else if ( Module[ "memoryInitializerRequest" ] ) {

				function useRequest() {

					var request = Module[ "memoryInitializerRequest" ]; var response = request.response; if ( request.status !== 200 && request.status !== 0 ) {

						var data = tryParseAsDataURI( Module[ "memoryInitializerRequestURL" ] ); if ( data ) {

							response = data.buffer;

						} else {

							console.warn( "a problem seems to have happened with Module.memoryInitializerRequest, status: " + request.status + ", retrying " + memoryInitializer ); doBrowserLoad(); return;

						}

					}applyMemoryInitializer( response );

				} if ( Module[ "memoryInitializerRequest" ].response ) {

					setTimeout( useRequest, 0 );

				} else {

					Module[ "memoryInitializerRequest" ].addEventListener( "load", useRequest );

				}

			} else {

				doBrowserLoad();

			}

		}

	}Module[ "then" ] = ( function ( func ) {

		if ( Module[ "calledRun" ] ) {

			func( Module );

		} else {

			var old = Module[ "onRuntimeInitialized" ]; Module[ "onRuntimeInitialized" ] = ( function () {

				if ( old )old(); func( Module );

			} );

		} return Module;

	} ); function ExitStatus( status ) {

		this.name = "ExitStatus"; this.message = "Program terminated with exit(" + status + ")"; this.status = status;

	}ExitStatus.prototype = new Error(); ExitStatus.prototype.constructor = ExitStatus; var initialStackTop; dependenciesFulfilled = function runCaller() {

		if ( ! Module[ "calledRun" ] )run(); if ( ! Module[ "calledRun" ] )dependenciesFulfilled = runCaller;

	}; function run( args ) {

		args = args || Module[ "arguments" ]; if ( runDependencies > 0 ) {

			return;

		}preRun(); if ( runDependencies > 0 ) return; if ( Module[ "calledRun" ] ) return; function doRun() {

			if ( Module[ "calledRun" ] ) return; Module[ "calledRun" ] = true; if ( ABORT ) return; ensureInitRuntime(); preMain(); if ( Module[ "onRuntimeInitialized" ] )Module[ "onRuntimeInitialized" ](); postRun();

		} if ( Module[ "setStatus" ] ) {

			Module[ "setStatus" ]( "Running..." ); setTimeout( ( function () {

				setTimeout( ( function () {

					Module[ "setStatus" ]( "" );

				} ), 1 ); doRun();

			} ), 1 );

		} else {

			doRun();

		}

	}Module[ "run" ] = run; function exit( status, implicit ) {

		if ( implicit && Module[ "noExitRuntime" ] && status === 0 ) {

			return;

		} if ( Module[ "noExitRuntime" ] ) {} else {

			ABORT = true; EXITSTATUS = status; STACKTOP = initialStackTop; exitRuntime(); if ( Module[ "onExit" ] )Module[ "onExit" ]( status );

		} if ( ENVIRONMENT_IS_NODE ) {

			process[ "exit" ]( status );

		}Module[ "quit" ]( status, new ExitStatus( status ) );

	}Module[ "exit" ] = exit; function abort( what ) {

		if ( Module[ "onAbort" ] ) {

			Module[ "onAbort" ]( what );

		} if ( what !== undefined ) {

			Module.print( what ); Module.printErr( what ); what = JSON.stringify( what );

		} else {

			what = "";

		}ABORT = true; EXITSTATUS = 1; throw "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";

	}Module[ "abort" ] = abort; if ( Module[ "preInit" ] ) {

		if ( typeof Module[ "preInit" ] == "function" )Module[ "preInit" ] = [ Module[ "preInit" ] ]; while ( Module[ "preInit" ].length > 0 ) {

			Module[ "preInit" ].pop()();

		}

	}Module[ "noExitRuntime" ] = true; run(); function WrapperObject() {}WrapperObject.prototype = Object.create( WrapperObject.prototype ); WrapperObject.prototype.constructor = WrapperObject; WrapperObject.prototype.__class__ = WrapperObject; WrapperObject.__cache__ = {}; Module[ "WrapperObject" ] = WrapperObject; function getCache( __class__ ) {

		return ( __class__ || WrapperObject ).__cache__;

	}Module[ "getCache" ] = getCache; function wrapPointer( ptr, __class__ ) {

		var cache = getCache( __class__ ); var ret = cache[ ptr ]; if ( ret ) return ret; ret = Object.create( ( __class__ || WrapperObject ).prototype ); ret.ptr = ptr; return cache[ ptr ] = ret;

	}Module[ "wrapPointer" ] = wrapPointer; function castObject( obj, __class__ ) {

		return wrapPointer( obj.ptr, __class__ );

	}Module[ "castObject" ] = castObject; Module[ "NULL" ] = wrapPointer( 0 ); function destroy( obj ) {

		if ( ! obj[ "__destroy__" ] ) throw "Error: Cannot destroy object. (Did you create it yourself?)"; obj[ "__destroy__" ](); delete getCache( obj.__class__ )[ obj.ptr ];

	}Module[ "destroy" ] = destroy; function compare( obj1, obj2 ) {

		return obj1.ptr === obj2.ptr;

	}Module[ "compare" ] = compare; function getPointer( obj ) {

		return obj.ptr;

	}Module[ "getPointer" ] = getPointer; function getClass( obj ) {

		return obj.__class__;

	}Module[ "getClass" ] = getClass; var ensureCache = { buffer: 0, size: 0, pos: 0, temps: [], needed: 0, prepare: ( function () {

		if ( ensureCache.needed ) {

			for ( var i = 0; i < ensureCache.temps.length; i ++ ) {

				Module[ "_free" ]( ensureCache.temps[ i ] );

			}ensureCache.temps.length = 0; Module[ "_free" ]( ensureCache.buffer ); ensureCache.buffer = 0; ensureCache.size += ensureCache.needed; ensureCache.needed = 0;

		} if ( ! ensureCache.buffer ) {

			ensureCache.size += 128; ensureCache.buffer = Module[ "_malloc" ]( ensureCache.size ); assert( ensureCache.buffer );

		}ensureCache.pos = 0;

	} ), alloc: ( function ( array, view ) {

		assert( ensureCache.buffer ); var bytes = view.BYTES_PER_ELEMENT; var len = array.length * bytes; len = len + 7 & - 8; var ret; if ( ensureCache.pos + len >= ensureCache.size ) {

			assert( len > 0 ); ensureCache.needed += len; ret = Module[ "_malloc" ]( len ); ensureCache.temps.push( ret );

		} else {

			ret = ensureCache.buffer + ensureCache.pos; ensureCache.pos += len;

		} return ret;

	} ), copy: ( function ( array, view, offset ) {

		var offsetShifted = offset; var bytes = view.BYTES_PER_ELEMENT; switch ( bytes ) {

			case 2:offsetShifted >>= 1; break; case 4:offsetShifted >>= 2; break; case 8:offsetShifted >>= 3; break;

		} for ( var i = 0; i < array.length; i ++ ) {

			view[ offsetShifted + i ] = array[ i ];

		}

	} ) }; function ensureString( value ) {

		if ( typeof value === "string" ) {

			var intArray = intArrayFromString( value ); var offset = ensureCache.alloc( intArray, HEAP8 ); ensureCache.copy( intArray, HEAP8, offset ); return offset;

		} return value;

	} function ensureInt8( value ) {

		if ( typeof value === "object" ) {

			var offset = ensureCache.alloc( value, HEAP8 ); ensureCache.copy( value, HEAP8, offset ); return offset;

		} return value;

	} function Status() {

		throw "cannot construct a Status, no constructor in IDL";

	}Status.prototype = Object.create( WrapperObject.prototype ); Status.prototype.constructor = Status; Status.prototype.__class__ = Status; Status.__cache__ = {}; Module[ "Status" ] = Status; Status.prototype[ "code" ] = Status.prototype.code = ( function () {

		var self = this.ptr; return _emscripten_bind_Status_code_0( self );

	} ); Status.prototype[ "ok" ] = Status.prototype.ok = ( function () {

		var self = this.ptr; return !! _emscripten_bind_Status_ok_0( self );

	} ); Status.prototype[ "error_msg" ] = Status.prototype.error_msg = ( function () {

		var self = this.ptr; return Pointer_stringify( _emscripten_bind_Status_error_msg_0( self ) );

	} ); Status.prototype[ "__destroy__" ] = Status.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_Status___destroy___0( self );

	} ); function DracoUInt16Array() {

		this.ptr = _emscripten_bind_DracoUInt16Array_DracoUInt16Array_0(); getCache( DracoUInt16Array )[ this.ptr ] = this;

	}DracoUInt16Array.prototype = Object.create( WrapperObject.prototype ); DracoUInt16Array.prototype.constructor = DracoUInt16Array; DracoUInt16Array.prototype.__class__ = DracoUInt16Array; DracoUInt16Array.__cache__ = {}; Module[ "DracoUInt16Array" ] = DracoUInt16Array; DracoUInt16Array.prototype[ "GetValue" ] = DracoUInt16Array.prototype.GetValue = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_DracoUInt16Array_GetValue_1( self, arg0 );

	} ); DracoUInt16Array.prototype[ "size" ] = DracoUInt16Array.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_DracoUInt16Array_size_0( self );

	} ); DracoUInt16Array.prototype[ "__destroy__" ] = DracoUInt16Array.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DracoUInt16Array___destroy___0( self );

	} ); function PointCloud() {

		this.ptr = _emscripten_bind_PointCloud_PointCloud_0(); getCache( PointCloud )[ this.ptr ] = this;

	}PointCloud.prototype = Object.create( WrapperObject.prototype ); PointCloud.prototype.constructor = PointCloud; PointCloud.prototype.__class__ = PointCloud; PointCloud.__cache__ = {}; Module[ "PointCloud" ] = PointCloud; PointCloud.prototype[ "num_attributes" ] = PointCloud.prototype.num_attributes = ( function () {

		var self = this.ptr; return _emscripten_bind_PointCloud_num_attributes_0( self );

	} ); PointCloud.prototype[ "num_points" ] = PointCloud.prototype.num_points = ( function () {

		var self = this.ptr; return _emscripten_bind_PointCloud_num_points_0( self );

	} ); PointCloud.prototype[ "__destroy__" ] = PointCloud.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_PointCloud___destroy___0( self );

	} ); function DracoUInt8Array() {

		this.ptr = _emscripten_bind_DracoUInt8Array_DracoUInt8Array_0(); getCache( DracoUInt8Array )[ this.ptr ] = this;

	}DracoUInt8Array.prototype = Object.create( WrapperObject.prototype ); DracoUInt8Array.prototype.constructor = DracoUInt8Array; DracoUInt8Array.prototype.__class__ = DracoUInt8Array; DracoUInt8Array.__cache__ = {}; Module[ "DracoUInt8Array" ] = DracoUInt8Array; DracoUInt8Array.prototype[ "GetValue" ] = DracoUInt8Array.prototype.GetValue = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_DracoUInt8Array_GetValue_1( self, arg0 );

	} ); DracoUInt8Array.prototype[ "size" ] = DracoUInt8Array.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_DracoUInt8Array_size_0( self );

	} ); DracoUInt8Array.prototype[ "__destroy__" ] = DracoUInt8Array.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DracoUInt8Array___destroy___0( self );

	} ); function DracoUInt32Array() {

		this.ptr = _emscripten_bind_DracoUInt32Array_DracoUInt32Array_0(); getCache( DracoUInt32Array )[ this.ptr ] = this;

	}DracoUInt32Array.prototype = Object.create( WrapperObject.prototype ); DracoUInt32Array.prototype.constructor = DracoUInt32Array; DracoUInt32Array.prototype.__class__ = DracoUInt32Array; DracoUInt32Array.__cache__ = {}; Module[ "DracoUInt32Array" ] = DracoUInt32Array; DracoUInt32Array.prototype[ "GetValue" ] = DracoUInt32Array.prototype.GetValue = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_DracoUInt32Array_GetValue_1( self, arg0 );

	} ); DracoUInt32Array.prototype[ "size" ] = DracoUInt32Array.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_DracoUInt32Array_size_0( self );

	} ); DracoUInt32Array.prototype[ "__destroy__" ] = DracoUInt32Array.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DracoUInt32Array___destroy___0( self );

	} ); function AttributeOctahedronTransform() {

		this.ptr = _emscripten_bind_AttributeOctahedronTransform_AttributeOctahedronTransform_0(); getCache( AttributeOctahedronTransform )[ this.ptr ] = this;

	}AttributeOctahedronTransform.prototype = Object.create( WrapperObject.prototype ); AttributeOctahedronTransform.prototype.constructor = AttributeOctahedronTransform; AttributeOctahedronTransform.prototype.__class__ = AttributeOctahedronTransform; AttributeOctahedronTransform.__cache__ = {}; Module[ "AttributeOctahedronTransform" ] = AttributeOctahedronTransform; AttributeOctahedronTransform.prototype[ "InitFromAttribute" ] = AttributeOctahedronTransform.prototype.InitFromAttribute = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return !! _emscripten_bind_AttributeOctahedronTransform_InitFromAttribute_1( self, arg0 );

	} ); AttributeOctahedronTransform.prototype[ "quantization_bits" ] = AttributeOctahedronTransform.prototype.quantization_bits = ( function () {

		var self = this.ptr; return _emscripten_bind_AttributeOctahedronTransform_quantization_bits_0( self );

	} ); AttributeOctahedronTransform.prototype[ "__destroy__" ] = AttributeOctahedronTransform.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_AttributeOctahedronTransform___destroy___0( self );

	} ); function PointAttribute() {

		this.ptr = _emscripten_bind_PointAttribute_PointAttribute_0(); getCache( PointAttribute )[ this.ptr ] = this;

	}PointAttribute.prototype = Object.create( WrapperObject.prototype ); PointAttribute.prototype.constructor = PointAttribute; PointAttribute.prototype.__class__ = PointAttribute; PointAttribute.__cache__ = {}; Module[ "PointAttribute" ] = PointAttribute; PointAttribute.prototype[ "size" ] = PointAttribute.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_PointAttribute_size_0( self );

	} ); PointAttribute.prototype[ "GetAttributeTransformData" ] = PointAttribute.prototype.GetAttributeTransformData = ( function () {

		var self = this.ptr; return wrapPointer( _emscripten_bind_PointAttribute_GetAttributeTransformData_0( self ), AttributeTransformData );

	} ); PointAttribute.prototype[ "attribute_type" ] = PointAttribute.prototype.attribute_type = ( function () {

		var self = this.ptr; return _emscripten_bind_PointAttribute_attribute_type_0( self );

	} ); PointAttribute.prototype[ "data_type" ] = PointAttribute.prototype.data_type = ( function () {

		var self = this.ptr; return _emscripten_bind_PointAttribute_data_type_0( self );

	} ); PointAttribute.prototype[ "num_components" ] = PointAttribute.prototype.num_components = ( function () {

		var self = this.ptr; return _emscripten_bind_PointAttribute_num_components_0( self );

	} ); PointAttribute.prototype[ "normalized" ] = PointAttribute.prototype.normalized = ( function () {

		var self = this.ptr; return !! _emscripten_bind_PointAttribute_normalized_0( self );

	} ); PointAttribute.prototype[ "byte_stride" ] = PointAttribute.prototype.byte_stride = ( function () {

		var self = this.ptr; return _emscripten_bind_PointAttribute_byte_stride_0( self );

	} ); PointAttribute.prototype[ "byte_offset" ] = PointAttribute.prototype.byte_offset = ( function () {

		var self = this.ptr; return _emscripten_bind_PointAttribute_byte_offset_0( self );

	} ); PointAttribute.prototype[ "unique_id" ] = PointAttribute.prototype.unique_id = ( function () {

		var self = this.ptr; return _emscripten_bind_PointAttribute_unique_id_0( self );

	} ); PointAttribute.prototype[ "__destroy__" ] = PointAttribute.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_PointAttribute___destroy___0( self );

	} ); function AttributeTransformData() {

		this.ptr = _emscripten_bind_AttributeTransformData_AttributeTransformData_0(); getCache( AttributeTransformData )[ this.ptr ] = this;

	}AttributeTransformData.prototype = Object.create( WrapperObject.prototype ); AttributeTransformData.prototype.constructor = AttributeTransformData; AttributeTransformData.prototype.__class__ = AttributeTransformData; AttributeTransformData.__cache__ = {}; Module[ "AttributeTransformData" ] = AttributeTransformData; AttributeTransformData.prototype[ "transform_type" ] = AttributeTransformData.prototype.transform_type = ( function () {

		var self = this.ptr; return _emscripten_bind_AttributeTransformData_transform_type_0( self );

	} ); AttributeTransformData.prototype[ "__destroy__" ] = AttributeTransformData.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_AttributeTransformData___destroy___0( self );

	} ); function AttributeQuantizationTransform() {

		this.ptr = _emscripten_bind_AttributeQuantizationTransform_AttributeQuantizationTransform_0(); getCache( AttributeQuantizationTransform )[ this.ptr ] = this;

	}AttributeQuantizationTransform.prototype = Object.create( WrapperObject.prototype ); AttributeQuantizationTransform.prototype.constructor = AttributeQuantizationTransform; AttributeQuantizationTransform.prototype.__class__ = AttributeQuantizationTransform; AttributeQuantizationTransform.__cache__ = {}; Module[ "AttributeQuantizationTransform" ] = AttributeQuantizationTransform; AttributeQuantizationTransform.prototype[ "InitFromAttribute" ] = AttributeQuantizationTransform.prototype.InitFromAttribute = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return !! _emscripten_bind_AttributeQuantizationTransform_InitFromAttribute_1( self, arg0 );

	} ); AttributeQuantizationTransform.prototype[ "quantization_bits" ] = AttributeQuantizationTransform.prototype.quantization_bits = ( function () {

		var self = this.ptr; return _emscripten_bind_AttributeQuantizationTransform_quantization_bits_0( self );

	} ); AttributeQuantizationTransform.prototype[ "min_value" ] = AttributeQuantizationTransform.prototype.min_value = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_AttributeQuantizationTransform_min_value_1( self, arg0 );

	} ); AttributeQuantizationTransform.prototype[ "range" ] = AttributeQuantizationTransform.prototype.range = ( function () {

		var self = this.ptr; return _emscripten_bind_AttributeQuantizationTransform_range_0( self );

	} ); AttributeQuantizationTransform.prototype[ "__destroy__" ] = AttributeQuantizationTransform.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_AttributeQuantizationTransform___destroy___0( self );

	} ); function DracoInt8Array() {

		this.ptr = _emscripten_bind_DracoInt8Array_DracoInt8Array_0(); getCache( DracoInt8Array )[ this.ptr ] = this;

	}DracoInt8Array.prototype = Object.create( WrapperObject.prototype ); DracoInt8Array.prototype.constructor = DracoInt8Array; DracoInt8Array.prototype.__class__ = DracoInt8Array; DracoInt8Array.__cache__ = {}; Module[ "DracoInt8Array" ] = DracoInt8Array; DracoInt8Array.prototype[ "GetValue" ] = DracoInt8Array.prototype.GetValue = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_DracoInt8Array_GetValue_1( self, arg0 );

	} ); DracoInt8Array.prototype[ "size" ] = DracoInt8Array.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_DracoInt8Array_size_0( self );

	} ); DracoInt8Array.prototype[ "__destroy__" ] = DracoInt8Array.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DracoInt8Array___destroy___0( self );

	} ); function MetadataQuerier() {

		this.ptr = _emscripten_bind_MetadataQuerier_MetadataQuerier_0(); getCache( MetadataQuerier )[ this.ptr ] = this;

	}MetadataQuerier.prototype = Object.create( WrapperObject.prototype ); MetadataQuerier.prototype.constructor = MetadataQuerier; MetadataQuerier.prototype.__class__ = MetadataQuerier; MetadataQuerier.__cache__ = {}; Module[ "MetadataQuerier" ] = MetadataQuerier; MetadataQuerier.prototype[ "HasEntry" ] = MetadataQuerier.prototype.HasEntry = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return !! _emscripten_bind_MetadataQuerier_HasEntry_2( self, arg0, arg1 );

	} ); MetadataQuerier.prototype[ "HasIntEntry" ] = MetadataQuerier.prototype.HasIntEntry = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return !! _emscripten_bind_MetadataQuerier_HasIntEntry_2( self, arg0, arg1 );

	} ); MetadataQuerier.prototype[ "GetIntEntry" ] = MetadataQuerier.prototype.GetIntEntry = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return _emscripten_bind_MetadataQuerier_GetIntEntry_2( self, arg0, arg1 );

	} ); MetadataQuerier.prototype[ "HasDoubleEntry" ] = MetadataQuerier.prototype.HasDoubleEntry = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return !! _emscripten_bind_MetadataQuerier_HasDoubleEntry_2( self, arg0, arg1 );

	} ); MetadataQuerier.prototype[ "GetDoubleEntry" ] = MetadataQuerier.prototype.GetDoubleEntry = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return _emscripten_bind_MetadataQuerier_GetDoubleEntry_2( self, arg0, arg1 );

	} ); MetadataQuerier.prototype[ "HasStringEntry" ] = MetadataQuerier.prototype.HasStringEntry = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return !! _emscripten_bind_MetadataQuerier_HasStringEntry_2( self, arg0, arg1 );

	} ); MetadataQuerier.prototype[ "GetStringEntry" ] = MetadataQuerier.prototype.GetStringEntry = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return Pointer_stringify( _emscripten_bind_MetadataQuerier_GetStringEntry_2( self, arg0, arg1 ) );

	} ); MetadataQuerier.prototype[ "NumEntries" ] = MetadataQuerier.prototype.NumEntries = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_MetadataQuerier_NumEntries_1( self, arg0 );

	} ); MetadataQuerier.prototype[ "GetEntryName" ] = MetadataQuerier.prototype.GetEntryName = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return Pointer_stringify( _emscripten_bind_MetadataQuerier_GetEntryName_2( self, arg0, arg1 ) );

	} ); MetadataQuerier.prototype[ "__destroy__" ] = MetadataQuerier.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_MetadataQuerier___destroy___0( self );

	} ); function DracoInt16Array() {

		this.ptr = _emscripten_bind_DracoInt16Array_DracoInt16Array_0(); getCache( DracoInt16Array )[ this.ptr ] = this;

	}DracoInt16Array.prototype = Object.create( WrapperObject.prototype ); DracoInt16Array.prototype.constructor = DracoInt16Array; DracoInt16Array.prototype.__class__ = DracoInt16Array; DracoInt16Array.__cache__ = {}; Module[ "DracoInt16Array" ] = DracoInt16Array; DracoInt16Array.prototype[ "GetValue" ] = DracoInt16Array.prototype.GetValue = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_DracoInt16Array_GetValue_1( self, arg0 );

	} ); DracoInt16Array.prototype[ "size" ] = DracoInt16Array.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_DracoInt16Array_size_0( self );

	} ); DracoInt16Array.prototype[ "__destroy__" ] = DracoInt16Array.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DracoInt16Array___destroy___0( self );

	} ); function DracoFloat32Array() {

		this.ptr = _emscripten_bind_DracoFloat32Array_DracoFloat32Array_0(); getCache( DracoFloat32Array )[ this.ptr ] = this;

	}DracoFloat32Array.prototype = Object.create( WrapperObject.prototype ); DracoFloat32Array.prototype.constructor = DracoFloat32Array; DracoFloat32Array.prototype.__class__ = DracoFloat32Array; DracoFloat32Array.__cache__ = {}; Module[ "DracoFloat32Array" ] = DracoFloat32Array; DracoFloat32Array.prototype[ "GetValue" ] = DracoFloat32Array.prototype.GetValue = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_DracoFloat32Array_GetValue_1( self, arg0 );

	} ); DracoFloat32Array.prototype[ "size" ] = DracoFloat32Array.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_DracoFloat32Array_size_0( self );

	} ); DracoFloat32Array.prototype[ "__destroy__" ] = DracoFloat32Array.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DracoFloat32Array___destroy___0( self );

	} ); function GeometryAttribute() {

		this.ptr = _emscripten_bind_GeometryAttribute_GeometryAttribute_0(); getCache( GeometryAttribute )[ this.ptr ] = this;

	}GeometryAttribute.prototype = Object.create( WrapperObject.prototype ); GeometryAttribute.prototype.constructor = GeometryAttribute; GeometryAttribute.prototype.__class__ = GeometryAttribute; GeometryAttribute.__cache__ = {}; Module[ "GeometryAttribute" ] = GeometryAttribute; GeometryAttribute.prototype[ "__destroy__" ] = GeometryAttribute.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_GeometryAttribute___destroy___0( self );

	} ); function DecoderBuffer() {

		this.ptr = _emscripten_bind_DecoderBuffer_DecoderBuffer_0(); getCache( DecoderBuffer )[ this.ptr ] = this;

	}DecoderBuffer.prototype = Object.create( WrapperObject.prototype ); DecoderBuffer.prototype.constructor = DecoderBuffer; DecoderBuffer.prototype.__class__ = DecoderBuffer; DecoderBuffer.__cache__ = {}; Module[ "DecoderBuffer" ] = DecoderBuffer; DecoderBuffer.prototype[ "Init" ] = DecoderBuffer.prototype.Init = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( typeof arg0 == "object" ) {

			arg0 = ensureInt8( arg0 );

		} if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; _emscripten_bind_DecoderBuffer_Init_2( self, arg0, arg1 );

	} ); DecoderBuffer.prototype[ "__destroy__" ] = DecoderBuffer.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DecoderBuffer___destroy___0( self );

	} ); function Decoder() {

		this.ptr = _emscripten_bind_Decoder_Decoder_0(); getCache( Decoder )[ this.ptr ] = this;

	}Decoder.prototype = Object.create( WrapperObject.prototype ); Decoder.prototype.constructor = Decoder; Decoder.prototype.__class__ = Decoder; Decoder.__cache__ = {}; Module[ "Decoder" ] = Decoder; Decoder.prototype[ "GetEncodedGeometryType" ] = Decoder.prototype.GetEncodedGeometryType = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_Decoder_GetEncodedGeometryType_1( self, arg0 );

	} ); Decoder.prototype[ "DecodeBufferToPointCloud" ] = Decoder.prototype.DecodeBufferToPointCloud = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return wrapPointer( _emscripten_bind_Decoder_DecodeBufferToPointCloud_2( self, arg0, arg1 ), Status );

	} ); Decoder.prototype[ "DecodeBufferToMesh" ] = Decoder.prototype.DecodeBufferToMesh = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return wrapPointer( _emscripten_bind_Decoder_DecodeBufferToMesh_2( self, arg0, arg1 ), Status );

	} ); Decoder.prototype[ "GetAttributeId" ] = Decoder.prototype.GetAttributeId = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return _emscripten_bind_Decoder_GetAttributeId_2( self, arg0, arg1 );

	} ); Decoder.prototype[ "GetAttributeIdByName" ] = Decoder.prototype.GetAttributeIdByName = ( function ( arg0, arg1 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); return _emscripten_bind_Decoder_GetAttributeIdByName_2( self, arg0, arg1 );

	} ); Decoder.prototype[ "GetAttributeIdByMetadataEntry" ] = Decoder.prototype.GetAttributeIdByMetadataEntry = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; ensureCache.prepare(); if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; else arg1 = ensureString( arg1 ); if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; else arg2 = ensureString( arg2 ); return _emscripten_bind_Decoder_GetAttributeIdByMetadataEntry_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttribute" ] = Decoder.prototype.GetAttribute = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return wrapPointer( _emscripten_bind_Decoder_GetAttribute_2( self, arg0, arg1 ), PointAttribute );

	} ); Decoder.prototype[ "GetAttributeByUniqueId" ] = Decoder.prototype.GetAttributeByUniqueId = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return wrapPointer( _emscripten_bind_Decoder_GetAttributeByUniqueId_2( self, arg0, arg1 ), PointAttribute );

	} ); Decoder.prototype[ "GetMetadata" ] = Decoder.prototype.GetMetadata = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return wrapPointer( _emscripten_bind_Decoder_GetMetadata_1( self, arg0 ), Metadata );

	} ); Decoder.prototype[ "GetAttributeMetadata" ] = Decoder.prototype.GetAttributeMetadata = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return wrapPointer( _emscripten_bind_Decoder_GetAttributeMetadata_2( self, arg0, arg1 ), Metadata );

	} ); Decoder.prototype[ "GetFaceFromMesh" ] = Decoder.prototype.GetFaceFromMesh = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetFaceFromMesh_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetTriangleStripsFromMesh" ] = Decoder.prototype.GetTriangleStripsFromMesh = ( function ( arg0, arg1 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; return _emscripten_bind_Decoder_GetTriangleStripsFromMesh_2( self, arg0, arg1 );

	} ); Decoder.prototype[ "GetAttributeFloat" ] = Decoder.prototype.GetAttributeFloat = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeFloat_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeFloatForAllPoints" ] = Decoder.prototype.GetAttributeFloatForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeFloatForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeIntForAllPoints" ] = Decoder.prototype.GetAttributeIntForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeIntForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeInt8ForAllPoints" ] = Decoder.prototype.GetAttributeInt8ForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeInt8ForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeUInt8ForAllPoints" ] = Decoder.prototype.GetAttributeUInt8ForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeUInt8ForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeInt16ForAllPoints" ] = Decoder.prototype.GetAttributeInt16ForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeInt16ForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeUInt16ForAllPoints" ] = Decoder.prototype.GetAttributeUInt16ForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeUInt16ForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeInt32ForAllPoints" ] = Decoder.prototype.GetAttributeInt32ForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeInt32ForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "GetAttributeUInt32ForAllPoints" ] = Decoder.prototype.GetAttributeUInt32ForAllPoints = ( function ( arg0, arg1, arg2 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; if ( arg1 && typeof arg1 === "object" )arg1 = arg1.ptr; if ( arg2 && typeof arg2 === "object" )arg2 = arg2.ptr; return !! _emscripten_bind_Decoder_GetAttributeUInt32ForAllPoints_3( self, arg0, arg1, arg2 );

	} ); Decoder.prototype[ "SkipAttributeTransform" ] = Decoder.prototype.SkipAttributeTransform = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; _emscripten_bind_Decoder_SkipAttributeTransform_1( self, arg0 );

	} ); Decoder.prototype[ "__destroy__" ] = Decoder.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_Decoder___destroy___0( self );

	} ); function Mesh() {

		this.ptr = _emscripten_bind_Mesh_Mesh_0(); getCache( Mesh )[ this.ptr ] = this;

	}Mesh.prototype = Object.create( WrapperObject.prototype ); Mesh.prototype.constructor = Mesh; Mesh.prototype.__class__ = Mesh; Mesh.__cache__ = {}; Module[ "Mesh" ] = Mesh; Mesh.prototype[ "num_faces" ] = Mesh.prototype.num_faces = ( function () {

		var self = this.ptr; return _emscripten_bind_Mesh_num_faces_0( self );

	} ); Mesh.prototype[ "num_attributes" ] = Mesh.prototype.num_attributes = ( function () {

		var self = this.ptr; return _emscripten_bind_Mesh_num_attributes_0( self );

	} ); Mesh.prototype[ "num_points" ] = Mesh.prototype.num_points = ( function () {

		var self = this.ptr; return _emscripten_bind_Mesh_num_points_0( self );

	} ); Mesh.prototype[ "__destroy__" ] = Mesh.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_Mesh___destroy___0( self );

	} ); function VoidPtr() {

		throw "cannot construct a VoidPtr, no constructor in IDL";

	}VoidPtr.prototype = Object.create( WrapperObject.prototype ); VoidPtr.prototype.constructor = VoidPtr; VoidPtr.prototype.__class__ = VoidPtr; VoidPtr.__cache__ = {}; Module[ "VoidPtr" ] = VoidPtr; VoidPtr.prototype[ "__destroy__" ] = VoidPtr.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_VoidPtr___destroy___0( self );

	} ); function DracoInt32Array() {

		this.ptr = _emscripten_bind_DracoInt32Array_DracoInt32Array_0(); getCache( DracoInt32Array )[ this.ptr ] = this;

	}DracoInt32Array.prototype = Object.create( WrapperObject.prototype ); DracoInt32Array.prototype.constructor = DracoInt32Array; DracoInt32Array.prototype.__class__ = DracoInt32Array; DracoInt32Array.__cache__ = {}; Module[ "DracoInt32Array" ] = DracoInt32Array; DracoInt32Array.prototype[ "GetValue" ] = DracoInt32Array.prototype.GetValue = ( function ( arg0 ) {

		var self = this.ptr; if ( arg0 && typeof arg0 === "object" )arg0 = arg0.ptr; return _emscripten_bind_DracoInt32Array_GetValue_1( self, arg0 );

	} ); DracoInt32Array.prototype[ "size" ] = DracoInt32Array.prototype.size = ( function () {

		var self = this.ptr; return _emscripten_bind_DracoInt32Array_size_0( self );

	} ); DracoInt32Array.prototype[ "__destroy__" ] = DracoInt32Array.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_DracoInt32Array___destroy___0( self );

	} ); function Metadata() {

		this.ptr = _emscripten_bind_Metadata_Metadata_0(); getCache( Metadata )[ this.ptr ] = this;

	}Metadata.prototype = Object.create( WrapperObject.prototype ); Metadata.prototype.constructor = Metadata; Metadata.prototype.__class__ = Metadata; Metadata.__cache__ = {}; Module[ "Metadata" ] = Metadata; Metadata.prototype[ "__destroy__" ] = Metadata.prototype.__destroy__ = ( function () {

		var self = this.ptr; _emscripten_bind_Metadata___destroy___0( self );

	} ); ( ( function () {

		function setupEnums() {

			Module[ "OK" ] = _emscripten_enum_draco_StatusCode_OK(); Module[ "ERROR" ] = _emscripten_enum_draco_StatusCode_ERROR(); Module[ "IO_ERROR" ] = _emscripten_enum_draco_StatusCode_IO_ERROR(); Module[ "INVALID_PARAMETER" ] = _emscripten_enum_draco_StatusCode_INVALID_PARAMETER(); Module[ "UNSUPPORTED_VERSION" ] = _emscripten_enum_draco_StatusCode_UNSUPPORTED_VERSION(); Module[ "UNKNOWN_VERSION" ] = _emscripten_enum_draco_StatusCode_UNKNOWN_VERSION(); Module[ "INVALID_GEOMETRY_TYPE" ] = _emscripten_enum_draco_EncodedGeometryType_INVALID_GEOMETRY_TYPE(); Module[ "POINT_CLOUD" ] = _emscripten_enum_draco_EncodedGeometryType_POINT_CLOUD(); Module[ "TRIANGULAR_MESH" ] = _emscripten_enum_draco_EncodedGeometryType_TRIANGULAR_MESH(); Module[ "ATTRIBUTE_INVALID_TRANSFORM" ] = _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_INVALID_TRANSFORM(); Module[ "ATTRIBUTE_NO_TRANSFORM" ] = _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_NO_TRANSFORM(); Module[ "ATTRIBUTE_QUANTIZATION_TRANSFORM" ] = _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_QUANTIZATION_TRANSFORM(); Module[ "ATTRIBUTE_OCTAHEDRON_TRANSFORM" ] = _emscripten_enum_draco_AttributeTransformType_ATTRIBUTE_OCTAHEDRON_TRANSFORM(); Module[ "INVALID" ] = _emscripten_enum_draco_GeometryAttribute_Type_INVALID(); Module[ "POSITION" ] = _emscripten_enum_draco_GeometryAttribute_Type_POSITION(); Module[ "NORMAL" ] = _emscripten_enum_draco_GeometryAttribute_Type_NORMAL(); Module[ "COLOR" ] = _emscripten_enum_draco_GeometryAttribute_Type_COLOR(); Module[ "TEX_COORD" ] = _emscripten_enum_draco_GeometryAttribute_Type_TEX_COORD(); Module[ "GENERIC" ] = _emscripten_enum_draco_GeometryAttribute_Type_GENERIC();

		} if ( Module[ "calledRun" ] )setupEnums(); else addOnPreMain( setupEnums );

	} ) )(); if ( typeof Module[ "onModuleParsed" ] === "function" ) {

		Module[ "onModuleParsed" ]();

	}






	return DracoDecoderModule;

};
if ( typeof exports === 'object' && typeof module === 'object' )
	module.exports = DracoDecoderModule;
else if ( typeof define === 'function' && define[ 'amd' ] )
	define( [], function () {

		return DracoDecoderModule;

	} );
else if ( typeof exports === 'object' )
	exports[ "DracoDecoderModule" ] = DracoDecoderModule;
