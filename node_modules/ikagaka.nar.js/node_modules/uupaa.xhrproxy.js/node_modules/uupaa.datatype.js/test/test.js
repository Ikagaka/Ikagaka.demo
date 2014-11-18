var ModuleTestDataType = (function(global) {

var _runOnNode = "process" in global;
var _runOnWorker = "WorkerLocation" in global;
var _runOnBrowser = "document" in global;

var test = new Test("DataType", {
        disable:    false,
        browser:    true,
        worker:     true,
        node:       true,
        button:     true,
        both:       true, // test the primary module and secondary module
    }).add([
        // DataType.Array
        testDataType_Array_toString,
        testDataType_Array_fromString,
        testDataType_Array_clampValue,
        testDataType_Array_toHexString,

        // DataType.Uint8Array
        testDataType_Uint8Array_clone,
        testDataType_Uint8Array_concat,
        testDataType_Uint8Array_expand,
        testDataType_Uint8Array_toArray,
        testDataType_Uint8Array_toString,
        testDataType_Uint8Array_fromString,

        // DataType.Object
        testDataType_Object_cloneLiteral,
        testDataType_Object_cloneObject,
        testDataType_Object_cloneSparseArray,
        testDataType_Object_cloneError,
        testDataType_Object_cloneTypedArray,
    ]);

if (typeof document !== "undefined") { // for Browser
    test.add([
        testDataType_Object_cloneNode,
        testDataType_Object_cloneNamedNodeMap,
        testDataType_Object_cloneCSSStyleDeclaration,
    ]);
}

return test.run().clone();

// ------------------------------------------------
function testDataType_Array_toString(test, pass, miss) {

    var source = [0x20, 0x21, 0x22, 0x23];
    var result = DataType["Array"].toString(source);

    if (result === "\u0020\u0021\u0022\u0023") {
        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Array_fromString(test, pass, miss) {

    var source = String.fromCharCode.apply(null, [0x306f, 0x3089, 0x3078]);
    var byteArray = DataType["Array"].fromString(source);

    if (byteArray[0] === 0x6f &&
        byteArray[1] === 0x89 &&
        byteArray[2] === 0x78) {

        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Array_clampValue(test, pass, miss) {

    var source = [0x12, 0x123, 0x1234, 0x12345];
    var byteArray = DataType["Array"].clampValue(source);
    var result = [0x12,  0xff,   0xff,    0xff];

    if (result.join(",") === byteArray.join(",")) {
        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Array_toHexString(test, pass, miss) {

    var source1 = [0x306f, 0x3089, 0x103078];
    var source2 = [0x00, 0x41, 0x53, 0x43, 0x49, 0x49, 0xff];
    var result1 = DataType["Array"].toHexStringArray(source1);
    var result2 = DataType["Array"].toHexStringArray(source2, true);

    if (result1.join("") === "6f8978" &&
        result2.join("") === "%00ASCII%ff") {
        test.done(pass());
        return;
    }
    test.done(miss());
}

// --- TypedArray ---
function testDataType_Uint8Array_clone(test, pass, miss) {

    var source = [0,1,2,3,4,5,6,7,8,9];
    var uint8Array = new Uint8Array(source);
    var clonedArray1 = DataType["Uint8Array"]["clone"](uint8Array); // cloned = [0,..9]
    var clonedArray2 = DataType["Uint8Array"]["clone"](uint8Array, 2); // cloned = [2,..9]
    var clonedArray3 = DataType["Uint8Array"]["clone"](uint8Array, 2, 6); // cloned = [2,3,4,5]

    var result1 = DataType["Uint8Array"]["toArray"](clonedArray1);
    var result2 = DataType["Uint8Array"]["toArray"](clonedArray2);
    var result3 = DataType["Uint8Array"]["toArray"](clonedArray3);

    if (source.join()             === result1.join() && // [0,...9]
        source.slice(2).join()    === result2.join() && // [2,...9]
        source.slice(2, 6).join() === result3.join()) { // [2,3,4,5]

        // clonedArray has not reference.
        uint8Array[0] = 0xff;

        if (uint8Array[0] === 0xff && clonedArray1[0] === 0) {
            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testDataType_Uint8Array_concat(test, pass, miss) {

    var value1 = [0,1,2];
    var value2 = [3,4,5];
    var value3 = [6,7,8];
    var resultUint8Array = DataType["Uint8Array"]["concat"](value1, value2, value3); // [0,1,2,3,4,5,6,7,8]
    var result = DataType["Uint8Array"]["toArray"](resultUint8Array);

    if (result.join() === [0,1,2,3,4,5,6,7,8].join()) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testDataType_Uint8Array_expand(test, pass, miss) {

    var source = new Uint8Array([1,2,3,4,5]);

    var result1 = DataType.Uint8Array.expand(source);    // x2
    var result2 = DataType.Uint8Array.expand(source, 2); // x2

    if (result1.length === result2.length &&
        source.length * 2 === result1.length) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testDataType_Uint8Array_toArray(test, pass, miss) {

    var source = [0,1,2,3,4,5,6,7,8,9];
    var result = DataType.Uint8Array.toArray(new Uint8Array(source));

    if (source.join() === result.join()) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testDataType_Uint8Array_toString(test, pass, miss) {

    var source = new Uint8Array([0x20, 0x21, 0x22, 0x23]);
    var result = DataType.Uint8Array.toString(source);

    if (result === "\u0020\u0021\u0022\u0023") {
        test.done(pass());
        return;
    }
    test.done(miss());
}


function testDataType_Uint8Array_fromString(test, pass, miss) {

    var source = "#$%&";
    var uint8array = DataType["Uint8Array"]["fromString"](source);
    var result     = DataType["Uint8Array"]["toString"](uint8array);

    if (source === result) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}



function testDataType_Object_cloneLiteral(test, pass, miss) {

    if (DataType["Object"].clone(1)        === 1       &&
        DataType["Object"].clone(null)     === null    &&
        DataType["Object"].clone("a")      === "a"     &&
        DataType["Object"].clone(false)    === false) {

        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Object_cloneObject(test, pass, miss) {
    var object = {
            key: "value",
            child: {
                key: "value"
            }
        };
    var date = new Date();
    var fn = function() { return true; };
    var array = [1, 2, 3];
    var error = new Error("hello");

    if (DataType["Object"].clone(object).child.key === "value" &&
        DataType["Object"].clone(date).getTime() === date.getTime() &&
        DataType["Object"].clone(fn)() === true &&
        DataType["Object"].clone(array).join(",") === "1,2,3" &&
        DataType["Object"].clone(error).message === "hello") {

        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Object_cloneSparseArray(test, pass, miss) {
    var sparseArray = [0, 1, 2, 3];

    delete sparseArray[1]; // [0, undefined, 2, 3];

    sparseArray.length = 100;

    var clonedArray = DataType["Object"].clone(sparseArray);

    if (sparseArray[0] === clonedArray[0] &&
        sparseArray[1] === clonedArray[1] &&
        sparseArray[2] === clonedArray[2] &&
        sparseArray[3] === clonedArray[3]) {

        test.done(pass());
        return;
    }
    test.done(miss());
}


function testDataType_Object_cloneError(test, pass, miss) {
    var result = {
            1: DataType["Object"].clone(new Error("1")),
            2: DataType["Object"].clone(new TypeError("2")),
        };

    if (result[1].message === "1" &&
        result[2].message === "2") {

        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Object_cloneTypedArray(test, pass, miss) {
    var source1 = DataType.Object.clone( new Uint8Array([1,2,3]) );
    var source2 = DataType.Object.clone( new Float32Array([1.1,2.2,3.3]) );

    if ( Array.prototype.slice.call(source1).join() === [1,2,3].join() &&
         source2[0].toFixed(1) === "1.1" &&
         source2[1].toFixed(1) === "2.2" &&
         source2[2].toFixed(1) === "3.3") {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testDataType_Object_cloneNode(test, pass, miss) {
    var node1 = document.createElement("div");
    var node2 = document.createElement("div");
    var textNode = document.createTextNode("hello");

    node1.appendChild(node2);
    node2.appendChild(textNode);

    var clonedNodeTree = DataType["Object"].clone(node1);
    var treeImage = clonedNodeTree.outerHTML;

    if (clonedNodeTree.nodeName === "DIV" &&
        clonedNodeTree.children[0].nodeName === "DIV" &&
        treeImage === "<div><div>hello</div></div>") {

        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Object_cloneNamedNodeMap(test, pass, miss) {
    var node = document.createElement("div");

    node.setAttribute("id", "id123");
    node.setAttribute("class", "class123");

    var attr = DataType["Object"].clone( node.attributes );

    if (node.getAttribute("id") === attr["id"] &&
        node.getAttribute("class") === attr["class"]) {

        test.done(pass());
        return;
    }
    test.done(miss());
}

function testDataType_Object_cloneCSSStyleDeclaration(test, pass, miss) {
    var result = true;
    var style = window.getComputedStyle(document.body);
    var clonedStyle = DataType["Object"].clone(style);

    for (var i = 0, iz = style.length; i < iz; ++i) {
        var key = style.item(i);
        var value = style[key];
        if (value && typeof value === "string") { // value only (skip methods)
            if (key in clonedStyle) {
                if (clonedStyle[key] === value) {
                    continue;
                }

            }
        }
        result = false;
        break;
    }
    if (result) {
        test.done(pass());
        return;
    }
    test.done(miss());
}


})((this || 0).self || global);

